#!/usr/bin/env python3
"""
Build a single self-contained HTML file from the veneers page.

    python3 tools/build-standalone.py [out.html]

Inlines the stylesheet, the script and every image as data URIs, so the result
opens anywhere with no server and no asset folder. Used for the shareable
preview and as the source for the PDF exports.

Two deliberate differences from the deployed page:
  - Google Tag Manager is stripped. A standalone file has no container, and
    the artifact/PDF sandboxes block googletagmanager.com anyway.
  - Reviews and Instagram render labelled layout placeholders instead of
    calling their endpoints, which do not exist offline. Nothing invented:
    the review cards say plainly that live reviews fill them.

Everything else — markup, styles, behaviour — is the real page.
"""

import base64, pathlib, re, sys

# Faces actually used by the page, matching the Google Fonts request in
# index.html. Passing --embed-fonts inlines these as data URIs instead of
# linking to Google, which is what makes the PDF export render in the real
# typefaces rather than Times/Helvetica fallbacks.
FONT_FACES = [
    ('Cormorant Garamond', 300, 'normal', 'cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2'),
    ('Cormorant Garamond', 400, 'normal', 'cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2'),
    ('Cormorant Garamond', 400, 'italic', 'cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2'),
    ('Cormorant Garamond', 500, 'normal', 'cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2'),
    ('Inter',              400, 'normal', 'inter/files/inter-latin-400-normal.woff2'),
    ('Inter',              600, 'normal', 'inter/files/inter-latin-600-normal.woff2'),
    ('Inter',              700, 'normal', 'inter/files/inter-latin-700-normal.woff2'),
]


def font_css(fonts_root):
    root = pathlib.Path(fonts_root)
    out = []
    for family, weight, style, rel in FONT_FACES:
        f = root / rel
        if not f.exists():
            raise SystemExit(f'missing font file: {f}')
        b64 = base64.b64encode(f.read_bytes()).decode()
        out.append(
            f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};"
            f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2');}}")
    return '\n'.join(out)

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / 'veneers'
MIME = {'.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.webp': 'image/webp'}

PREVIEW_REVIEWS = """    if (CONFIG.previewMode) {
      var g = $('[data-vd-reviews]');
      if (g) g.innerHTML = [1,2,3].map(function () {
        return '<article class="vd-review"><span class="vd-review__stars">' + starsMarkup(5) + '</span>' +
          '<blockquote class="vd-review__text" style="color:var(--vd-muted);font-style:italic">' +
          'A real patient review from your Google Business Profile appears here.</blockquote>' +
          '<div class="vd-review__meta"><span class="vd-review__avatar">G</span>' +
          '<span><span class="vd-review__name">Google reviewer</span>' +
          '<span class="vd-review__date">Pulled live via the Places API</span></span></div></article>';
      }).join('');
      var n = $('[data-vd-reviews-note]');
      if (n) n.innerHTML = 'Live reviews fill these cards once the endpoint is connected \\u2014 ' +
        '<a href="' + CONFIG.googleProfileUrl + '" target="_blank" rel="noopener">read them on Google</a>.';
      return;
    }
    if (!CONFIG.reviewsEndpoint) { reviewsFallback(); return; }"""

PREVIEW_IG = """    if (CONFIG.previewMode) {
      var ph = d.querySelector('.vd-ba__cell img'); var src = ph ? ph.getAttribute('src') : '';
      grid.innerHTML = new Array(7).join(',').split(',').map(function () {
        return '<a class="vd-ig-item" href="https://www.instagram.com/veneergoddess/" target="_blank" rel="noopener">' +
          '<img src="' + src + '" alt="Placeholder for a recent Instagram post by @veneergoddess" ' +
          'loading="lazy" width="400" height="400"></a>';
      }).join('');
      return;
    }
    if (!CONFIG.instagramEndpoint) { instagramFallback(); return; }"""


def build(full_document=False, fonts_root=None):
    html = (SRC / 'index.html').read_text()
    css  = (SRC / 'assets/css/veneers.css').read_text()
    js   = (SRC / 'assets/js/veneers.js').read_text()

    # srcset variants can't be inlined usefully; keep the full-size src only
    html = re.sub(r'\n\s*srcset="[^"]*"\n\s*sizes="[^"]*"', '', html)

    for f in sorted((SRC / 'assets/img').iterdir()):
        if '-400w' in f.name or f.suffix not in MIME:
            continue
        data = base64.b64encode(f.read_bytes()).decode()
        html = html.replace(f'assets/img/{f.name}', f'data:{MIME[f.suffix]};base64,{data}')

    leftover = [l for l in html.splitlines() if 'assets/img/' in l]
    assert len(leftover) == 1 and 'og:image' in leftover[0], leftover

    html = re.sub(r'<!-- Google Tag Manager.*?</script>\n', '', html, flags=re.S)
    html = re.sub(r'<noscript><iframe src="https://www\.googletagmanager\.com.*?</noscript>\n', '', html, flags=re.S)
    assert 'googletagmanager' not in html

    head = html.split('</head>')[0]
    body = html.split('<body class="vd-page">')[1].split('</body>')[0]
    fonts  = re.search(r'<link rel="preconnect".*?display=swap">', head, re.S).group(0)
    ldjson = re.search(r'<script type="application/ld\+json">.*?</script>', head, re.S).group(0)

    js = js.replace("d.body.classList.add('has-sticky-cta');",
                    "(d.querySelector('.vd-page')||d.body).classList.add('has-sticky-cta');")
    js = js.replace("var CONFIG = {", "var CONFIG = {\n    previewMode: true,")
    js = js.replace("    if (!CONFIG.reviewsEndpoint) { reviewsFallback(); return; }", PREVIEW_REVIEWS)
    js = js.replace("    if (!CONFIG.instagramEndpoint) { instagramFallback(); return; }", PREVIEW_IG)

    if fonts_root:
        head_fonts = f'<style>\n{font_css(fonts_root)}\n</style>'
    else:
        head_fonts = fonts

    inner = (f'<title>Vida Veneers Landing Page</title>\n{head_fonts}\n'
             f'<style>\n{css}\nbody {{ background:#FFFFFF; margin:0; }}\n</style>\n{ldjson}\n'
             f'<div class="vd-page">\n{body}\n</div>\n<script>\n{js}\n</script>\n')

    if not full_document:
        return inner   # artifact wrapper supplies doctype/head/body

    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>*,*::before,*::after{box-sizing:border-box}body{margin:0}</style>'
            + inner.split('<div class="vd-page">')[0]
            + '</head><body>\n<div class="vd-page">'
            + inner.split('<div class="vd-page">')[1] + '</body></html>')


if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'build/standalone.html'
    full = '--full' in sys.argv
    fonts = None
    for a in sys.argv:
        if a.startswith('--embed-fonts='):
            fonts = a.split('=', 1)[1]
    out.parent.mkdir(parents=True, exist_ok=True)
    content = build(full_document=full, fonts_root=fonts)
    out.write_text(content)
    print(f'{out}  {len(content)/1024:.0f} KB{"  (full document)" if full else "  (artifact fragment)"}')
