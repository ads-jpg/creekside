"""Builds the 5 BlushCam email campaigns as standalone, email-safe HTML.

Run:  python3 emails/blushcam/build.py
Output: emails/blushcam/0X-*.html

Everything is table-based with inline styles (600px), so it pastes cleanly into
Klaviyo / Shopify Email / Mailchimp as a custom HTML template. Images are
hot-linked from blushcamera.com's Shopify CDN.
"""
from pathlib import Path

OUT = Path(__file__).parent
SITE = "https://blushcamera.com"
CDN = "https://blushcamera.com/cdn/shop/files"
CDN2 = "https://cdn.shopify.com/s/files/1/0924/2869/7919/files"

# Brand tokens (taken from blushcamera.com)
PINK = "#F7CAD6"      # announcement bar pink
BUBBLE = "#FFB5DA"    # bubble gum accent
INK = "#111111"       # buttons / header
OFF = "#FEFFF9"       # page off-white
CARD = "#F0F1EF"      # product card grey
GREY = "#6B6B6B"
HEAD = "'Anybody','Arial Black','Helvetica Neue',Arial,sans-serif"
BODY = "Arial,'Helvetica Neue',Helvetica,sans-serif"
HSTYLE = f"font-family:{HEAD};font-stretch:150%;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;"


def img(path, w=1200, h=None, cdn=CDN):
    q = f"?width={w}" + (f"&height={h}&crop=center" if h else "")
    return f"{cdn}/{path}{q}"


def url(path, campaign, content=""):
    sep = "&" if "?" in path else "?"
    u = f"{SITE}{path}{sep}utm_source=email&utm_medium=email&utm_campaign={campaign}"
    return u + (f"&utm_content={content}" if content else "")


# ---------- building blocks ----------

def page(title, preheader, body, bg=OFF):
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>{title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@150,800&display=swap" rel="stylesheet">
<style>
  body,table,td,a{{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}}
  table,td{{mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse}}
  img{{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block}}
  a{{text-decoration:none}}
  @media only screen and (max-width:620px){{
    .wrap{{width:100%!important}}
    .px{{padding-left:20px!important;padding-right:20px!important}}
    .col{{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}}
    .col-pad{{padding:0 0 16px 0!important}}
    .h1{{font-size:34px!important;line-height:38px!important}}
    .h2{{font-size:24px!important;line-height:28px!important}}
    .mega{{font-size:64px!important;line-height:64px!important}}
    .hide-m{{display:none!important}}
    .btn a{{display:block!important}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{bg};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:{bg};">{preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{bg}" style="background:{bg};">
<tr><td align="center" style="padding:0;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;">
{body}
</table>
</td></tr>
</table>
</body>
</html>
"""


def topbar(text, bg=PINK, color=INK):
    return f"""<tr><td align="center" bgcolor="{bg}" style="background:{bg};padding:9px 16px;font-family:{BODY};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{color};">{text}</td></tr>"""


def header(c):
    nav = " &nbsp;&nbsp;|&nbsp;&nbsp; ".join(
        f'<a href="{url(p, c, "nav")}" style="color:#ffffff;">{t}</a>'
        for t, p in [("Cameras", "/collections/cameras"), ("Cases", "/collections/cases"), ("Charms", "/collections/charms")]
    )
    return f"""<tr><td align="center" bgcolor="{INK}" style="background:{INK};padding:26px 20px 14px;">
  <a href="{url('/', c, 'logo')}"><img src="{img('logo_lockup_sm.png', 840)}" width="280" alt="BLUSH DIGICAM" style="width:280px;max-width:80%;height:auto;margin:0 auto;color:#ffffff;font-family:{HEAD};font-size:20px;"></a>
</td></tr>
<tr><td align="center" bgcolor="{INK}" style="background:{INK};padding:0 20px 18px;font-family:{BODY};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;">{nav}</td></tr>"""


def hero(src, alt, href, w=600):
    return f"""<tr><td style="padding:0;"><a href="{href}"><img src="{src}" width="{w}" alt="{alt}" style="width:100%;max-width:{w}px;height:auto;"></a></td></tr>"""


def text_block(eyebrow="", h1="", body="", align="center", bg="#ffffff", color=INK, pad="40px 48px 8px", h1size=40):
    parts = []
    if eyebrow:
        parts.append(f'<p style="margin:0 0 14px;font-family:{BODY};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{color};opacity:.75;">{eyebrow}</p>')
    if h1:
        parts.append(f'<h1 class="h1" style="margin:0 0 18px;{HSTYLE}font-size:{h1size}px;line-height:{int(h1size*1.08)}px;color:{color};">{h1}</h1>')
    if body:
        parts.append(f'<p style="margin:0;font-family:{BODY};font-size:16px;line-height:25px;color:{color};">{body}</p>')
    return f'<tr><td class="px" align="{align}" bgcolor="{bg}" style="background:{bg};padding:{pad};text-align:{align};">{"".join(parts)}</td></tr>'


def button(label, href, bg=INK, color="#ffffff", pad="24px 48px 40px", wrap_bg="#ffffff", border=None):
    b = border or bg
    return f"""<tr><td class="px btn" align="center" bgcolor="{wrap_bg}" style="background:{wrap_bg};padding:{pad};">
  <!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="{href}" style="height:58px;v-text-anchor:middle;width:320px;" stroked="true" strokecolor="{b}" fillcolor="{bg}"><center style="color:{color};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;letter-spacing:1px;">{label}</center></v:rect><![endif]-->
  <!--[if !mso]><!--><a href="{href}" style="display:inline-block;background:{bg};border:2px solid {b};color:{color};{HSTYLE}font-size:17px;line-height:20px;padding:18px 48px;min-width:200px;text-align:center;">{label}</a><!--<![endif]-->
</td></tr>"""


def spacer(h=24, bg="#ffffff"):
    return f'<tr><td bgcolor="{bg}" style="background:{bg};height:{h}px;line-height:{h}px;font-size:0;">&nbsp;</td></tr>'


def divider(bg="#ffffff", color="#E4E4E4"):
    return f'<tr><td class="px" bgcolor="{bg}" style="background:{bg};padding:0 48px;"><div style="border-top:1px solid {color};height:1px;line-height:1px;font-size:0;">&nbsp;</div></td></tr>'


def product_card(p, c, show_was=True, dark=False):
    fg = "#ffffff" if dark else INK
    card = "#1E1E1E" if dark else "#ffffff"
    bd = "#333333" if dark else "#E4E4E4"
    price = f'<span style="font-family:{BODY};font-size:18px;color:{fg};">{p["price"]}</span>'
    if show_was and p.get("was"):
        price += f' &nbsp;<span style="font-family:{BODY};font-size:15px;color:#9A9A9A;text-decoration:line-through;">{p["was"]}</span>'
    note = f'<p style="margin:6px 0 0;font-family:{BODY};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{p.get("note_color", fg)};">{p["note"]}</p>' if p.get("note") else ""
    href = url(p["href"], c, p["name"].lower().replace(" ", "-"))
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{card}" style="background:{card};border:1px solid {bd};">
  <tr><td style="padding:0;"><a href="{href}"><img src="{p['img']}" width="252" alt="{p['name']}" style="width:100%;height:auto;"></a></td></tr>
  <tr><td style="padding:16px 16px 20px;">
    <a href="{href}" style="{HSTYLE}font-size:15px;line-height:19px;color:{fg};">{p['name']}</a>
    <p style="margin:6px 0 0;">{price}</p>{note}
    <p style="margin:14px 0 0;"><a href="{href}" style="display:inline-block;background:{'#ffffff' if dark else INK};color:{INK if dark else '#ffffff'};font-family:{BODY};font-weight:bold;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:11px 18px;">Shop now</a></p>
  </td></tr>
</table>"""


def two_up(cards, bg="#ffffff", pad="8px 40px 8px"):
    rows = []
    for i in range(0, len(cards), 2):
        a, b = cards[i], cards[i + 1] if i + 1 < len(cards) else ""
        rows.append(f"""<tr><td class="px" bgcolor="{bg}" style="background:{bg};padding:{pad};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="col col-pad" width="50%" valign="top" style="width:50%;padding:0 8px 16px 0;">{a}</td>
<td class="col col-pad" width="50%" valign="top" style="width:50%;padding:0 0 16px 8px;">{b}</td>
</tr></table></td></tr>""")
    return "\n".join(rows)


def three_imgs(items, c, bg="#ffffff", pad="0 40px 32px", label_color=INK):
    """items: (img_src, label, href)"""
    cells = "".join(
        f"""<td width="33%" valign="top" align="center" style="width:33%;padding:0 5px;">
<a href="{url(h, c, l.lower().replace(' ', '-'))}"><img src="{s}" width="166" alt="{l}" style="width:100%;height:auto;"></a>
<p style="margin:10px 0 0;font-family:{BODY};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{label_color};">{l}</p></td>"""
        for s, l, h in items)
    return f'<tr><td class="px" bgcolor="{bg}" style="background:{bg};padding:{pad};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table></td></tr>'


def split(img_src, alt, href, eyebrow, h2, body, cta, img_left=True, bg=PINK, color=INK):
    image = f'<td class="col" width="50%" valign="middle" style="width:50%;padding:0;"><a href="{href}"><img src="{img_src}" width="300" alt="{alt}" style="width:100%;height:auto;"></a></td>'
    copy = f"""<td class="col" width="50%" valign="middle" style="width:50%;padding:28px 28px;">
<p style="margin:0 0 10px;font-family:{BODY};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{color};">{eyebrow}</p>
<h2 class="h2" style="margin:0 0 12px;{HSTYLE}font-size:24px;line-height:28px;color:{color};">{h2}</h2>
<p style="margin:0 0 18px;font-family:{BODY};font-size:15px;line-height:22px;color:{color};">{body}</p>
<a href="{href}" style="display:inline-block;background:{INK};color:#ffffff;font-family:{BODY};font-weight:bold;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:13px 22px;">{cta}</a></td>"""
    cells = image + copy if img_left else copy + image
    return f'<tr><td bgcolor="{bg}" style="background:{bg};padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table></td></tr>'


def features(bg="#ffffff", color=INK):
    feats = [("Sony&reg; CMOS sensor", "Sharp, high-quality photos"),
             ("Glam mirror", "Built-in vanity mirror + light"),
             ("Filterless Y2K", "That flash look, no filters"),
             ("4K video", "Up to 64MP photos / 4K video")]
    cells = "".join(f"""<td class="col" width="25%" valign="top" align="center" style="width:25%;padding:0 6px 16px;">
<p style="margin:0 0 6px;{HSTYLE}font-size:12px;line-height:16px;color:{color};">{t}</p>
<p style="margin:0;font-family:{BODY};font-size:13px;line-height:18px;color:{color};opacity:.8;">{d}</p></td>""" for t, d in feats)
    return f'<tr><td class="px" bgcolor="{bg}" style="background:{bg};padding:32px 34px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table></td></tr>'


def reviews(bg=OFF, color=INK, quote="Obsessed. The mirror is a game changer for selfies and the photos look exactly like 2004.", who="Verified buyer"):
    return f"""<tr><td class="px" align="center" bgcolor="{bg}" style="background:{bg};padding:40px 56px;">
<p style="margin:0 0 10px;font-family:{BODY};font-size:20px;letter-spacing:4px;color:{color};">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
<p style="margin:0 0 6px;{HSTYLE}font-size:14px;color:{color};">Over 6,000 reviews</p>
<p style="margin:14px 0 8px;font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:27px;color:{color};">&ldquo;{quote}&rdquo;</p>
<p style="margin:0;font-family:{BODY};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{color};opacity:.7;">{who}</p></td></tr>"""


def footer(c, dark=False):
    bg = INK if dark else "#ffffff"
    fg = "#ffffff" if dark else INK
    sub = "#A8A8A8" if dark else GREY
    trust = f"""<tr><td align="center" bgcolor="{PINK}" style="background:{PINK};padding:14px 16px;font-family:{BODY};font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:{INK};">
Free returns &nbsp;|&nbsp; 1 year warranty &nbsp;|&nbsp; Ships worldwide</td></tr>"""
    socials = " &nbsp;&nbsp;&middot;&nbsp;&nbsp; ".join(
        f'<a href="{h}" style="color:{fg};">{t}</a>' for t, h in [
            ("Instagram", "https://www.instagram.com/blushcamera/"),
            ("TikTok", "https://www.tiktok.com/@blushcamera"),
            ("YouTube", "https://www.youtube.com/@BlushCamera")])
    links = " &nbsp;|&nbsp; ".join(
        f'<a href="{url(p, c, "footer")}" style="color:{sub};text-decoration:underline;">{t}</a>' for t, p in [
            ("FAQ", "/pages/faq"), ("Track order", "/pages/track"), ("Contact", "/pages/contact-us")])
    return trust + f"""
<tr><td align="center" bgcolor="{bg}" style="background:{bg};padding:34px 30px 40px;">
  {f'<a href="{url("/", c, "footer-logo")}"><img src="{img("logo_lockup_sm.png", 600)}" width="200" alt="BLUSH DIGICAM" style="width:200px;height:auto;margin:0 auto 18px;"></a>' if dark else f'<p style="margin:0 0 18px;"><a href="{url("/", c, "footer-logo")}" style="{HSTYLE}font-size:20px;letter-spacing:2px;color:{INK};">Blush&trade; Digicam</a></p>'}
  <p style="margin:0 0 16px;font-family:{BODY};font-size:13px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:{fg};">{socials}</p>
  <p style="margin:0 0 16px;font-family:{BODY};font-size:12px;color:{sub};">{links}</p>
  <p style="margin:0;font-family:{BODY};font-size:11px;line-height:17px;color:{sub};">
    You're receiving this because you signed up for emails from BlushCam.<br>
    {{{{ organization.name }}}} &middot; {{{{ organization.full_address }}}}<br>
    <a href="{{% unsubscribe_url %}}" style="color:{sub};text-decoration:underline;">Unsubscribe</a> &nbsp;|&nbsp; <a href="{{% manage_preferences_url %}}" style="color:{sub};text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>"""


def code_box(code, label, sub, bg=INK, fg="#ffffff", border=PINK, wrap_bg="#ffffff", pad="8px 48px 8px"):
    return f"""<tr><td class="px" align="center" bgcolor="{wrap_bg}" style="background:{wrap_bg};padding:{pad};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:3px dashed {border};"><tr>
<td align="center" bgcolor="{bg}" style="background:{bg};padding:22px 16px;">
<p style="margin:0 0 6px;font-family:{BODY};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{fg};opacity:.8;">{label}</p>
<p class="h1" style="margin:0;{HSTYLE}font-size:46px;line-height:50px;letter-spacing:6px;color:{fg};">{code}</p>
<p style="margin:8px 0 0;font-family:{BODY};font-size:13px;color:{fg};opacity:.85;">{sub}</p>
</td></tr></table></td></tr>"""


# ---------- product data ----------
COLORS = [  # (file, name, variant id or None)
    ("2-Blush_Rose_Target_2400_20261117.jpg", "Rose"),
    ("7-Blush_Bubble_Gum_Target_2400_20261117.jpg", "Bubble Gum"),
    ("3-Blush_Cherry_Target_2400_20261117.jpg", "Cherry"),
    ("8-Blush_Butter_Target_2400_20261117.jpg", "Butter"),
    ("4-Blush_Racing_Green_Target_2400_20261117.jpg", "Racing Green"),
    ("5-Blush_Noir_Target_2400_20261117.jpg", "Noir"),
    ("6-Blush_Steel_Target_2400_20261117.jpg", "Steel"),
    ("1-Blush_Optic_Target_2400_20261117.jpg", "Optic"),
]
CAM = "/products/blushcam-digital-camera"
BUNDLE = "/products/creator-pack-copy"
STRAP = "/products/beaded-camera-strap"


def cam_tile(i):
    f, n = COLORS[i]
    return img(f, 600, 600)


# =====================================================================
# EMAIL 1 — Strap offer launch
# =====================================================================
def email1():
    c = "bogo-strap-1-launch"
    body = "".join([
        topbar("New offer: buy 2 cameras, get a free strap"),
        header(c),
        hero(img("hero_image_3.jpg", 1200, 800), "Two friends taking selfies with their Blush Digicams", url(BUNDLE, c, "hero")),
        text_block("Buy 2 cameras &middot; get a free strap",
                   "Two cams.<br>One free strap.",
                   "Grab a Blush Digicam for you and one for your bestie, and we'll throw in a beaded camera strap on us. "
                   "Hand-beaded and made to clip right onto your cam, so it's always on you."),
        button("Shop the offer", url(BUNDLE, c, "cta-1")),
        f'<tr><td style="padding:0;"><a href="{url(STRAP, c, "strap-trio")}"><img src="{img("Frame22_79f1b9a2-fe68-4ba9-926c-407466ddaa9b.webp", 1200, 560, CDN2)}" width="600" alt="Beaded camera straps in Blue, Pink and Black &amp; White Dot" style="width:100%;height:auto;"></a></td></tr>',
        text_block("", "", f'<span style="{HSTYLE}font-size:14px;">Your free strap ($55 value)</span><br>Choose Blue, Pink or Black &amp; White Dot.',
                   pad="20px 48px 36px", bg="#ffffff"),
        divider(),
        text_block("How it works", "", "", pad="36px 48px 0"),
        f"""<tr><td class="px" bgcolor="#ffffff" style="background:#ffffff;padding:18px 40px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
{''.join(f'''<td class="col" width="33%" valign="top" align="center" style="width:33%;padding:0 10px 18px;">
<p style="margin:0 auto 12px;width:46px;height:46px;line-height:46px;border-radius:50%;background:{PINK};{HSTYLE}font-size:18px;color:{INK};text-align:center;">{n}</p>
<p style="margin:0 0 6px;{HSTYLE}font-size:13px;color:{INK};">{t}</p>
<p style="margin:0;font-family:{BODY};font-size:14px;line-height:20px;color:{GREY};">{d}</p></td>''' for n, t, d in [
    ("1", "Pick 2 cams", "Any two Blush Digicams, or grab the 2-Pack Bestie Bundle."),
    ("2", "Choose a strap", "Blue, Pink or Black &amp; White Dot."),
    ("3", "Check out", "Your strap ships free with your cameras.")])}
</tr></table></td></tr>""",
        two_up([
            product_card({"name": "2-Pack Bestie Bundle", "price": "$320", "img": img("Budnle_Gray_Rose_product_preview.png", 600, 600, CDN2), "href": BUNDLE, "note": "+ Free strap", "note_color": "#C2185B"}, c),
            product_card({"name": "Blush Digicam", "price": "$170", "img": cam_tile(0), "href": CAM, "note": "Buy 2 &rarr; free strap", "note_color": "#C2185B"}, c),
        ]),
        features(bg="#ffffff"),
        reviews(),
        footer(c),
    ])
    return page("Two cams. One free strap.", "Buy any 2 Blush Digicams and your beaded camera strap is on us.", body)


# =====================================================================
# EMAIL 2 — Strap offer: the bestie / gifting angle
# =====================================================================
def email2():
    c = "bogo-strap-2-bestie"
    body = "".join([
        topbar("Buy 2 cameras &middot; get a free camera strap"),
        header(c),
        hero(img("Frame_2147224821.jpg", 1200), "Two friends looking at photos on a Cherry Blush Digicam", url(BUNDLE, c, "hero")),
        text_block("Gift one. Keep one.", "Matching cams<br>for you + your bestie",
                   "The best photo dumps come in pairs. Pick two colors (or go matchy-matchy) and we'll add a free beaded strap to your order. "
                   "It's the easiest holiday gift you'll check off this year."),
        button("Build your pair", url(BUNDLE, c, "cta-1")),
        f'<tr><td class="px" align="center" bgcolor="{OFF}" style="background:{OFF};padding:40px 48px 8px;"><h2 class="h2" style="margin:0 0 6px;{HSTYLE}font-size:26px;line-height:30px;color:{INK};">Pick your pair</h2><p style="margin:0 0 4px;font-family:{BODY};font-size:15px;color:{GREY};">8 colors. 64 combos. Zero bad photos.</p></td></tr>',
        f"""<tr><td class="px" bgcolor="{OFF}" style="background:{OFF};padding:18px 40px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
{''.join('<tr>' + ''.join(f'''<td width="25%" valign="top" align="center" style="width:25%;padding:0 4px 14px;"><a href="{url(CAM, c, 'swatch-' + n.lower().replace(' ', '-'))}"><img src="{img(f, 300, 300)}" width="122" alt="{n} Blush Digicam" style="width:100%;height:auto;background:#fff;"></a>
<p style="margin:8px 0 0;font-family:{BODY};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:{INK};">{n}</p></td>''' for f, n in COLORS[r:r + 4]) + '</tr>' for r in (0, 4))}
</table></td></tr>""",
        button("Shop all colors", url(CAM, c, "cta-colors"), bg=OFF, color=INK, border=INK, wrap_bg=OFF, pad="8px 48px 44px"),
        split(img("Rose_Strap.webp", 600, 600, CDN2), "Pink beaded camera strap", url(STRAP, c, "split-strap"),
              "On us with 2 cams", "The free beaded strap", "A $55 hand-beaded wrist strap in Blue, Pink or Black &amp; White Dot. Clips on in seconds.", "See the straps"),
        split(img("Frame_2147224711.jpg", 600, 600), "Woman holding a Blush Digicam up to her face", url(CAM, c, "split-cam"),
              "The Y2K digicam", "With a built-in vanity mirror", "Sony&reg; CMOS sensor, LED flash and a shatter-proof glam mirror for the perfect selfie.", "Shop Digicam",
              img_left=False, bg="#ffffff"),
        reviews(bg=OFF, quote="Bought one for me and one for my sister. We take them everywhere now.", who="Verified buyer"),
        footer(c),
    ])
    return page("Matching cams for you + your bestie", "Pick two Blush Digicams and get a free beaded strap. Gift one, keep one.", body)


# =====================================================================
# EMAIL 3 — Strap offer: last chance
# =====================================================================
def email3():
    c = "bogo-strap-3-last-chance"
    body = "".join([
        topbar("Last chance &middot; free strap offer ends tonight", bg=INK, color="#ffffff"),
        header(c),
        f"""<tr><td align="center" bgcolor="{PINK}" style="background:{PINK};padding:44px 30px 10px;">
<p style="margin:0 0 12px;font-family:{BODY};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{INK};">Final hours</p>
<h1 class="h1" style="margin:0;{HSTYLE}font-size:44px;line-height:48px;color:{INK};">Your free strap<br>is about to go</h1></td></tr>""",
        f'<tr><td align="center" bgcolor="{PINK}" style="background:{PINK};padding:24px 60px 10px;"><a href="{url(STRAP, c, "hero-straps")}"><img src="{img("Frame22_79f1b9a2-fe68-4ba9-926c-407466ddaa9b.webp", 1200, cdn=CDN2)}" width="480" alt="Three beaded camera straps" style="width:100%;max-width:480px;height:auto;margin:0 auto;"></a></td></tr>',
        text_block("", "", "Buy any 2 Blush Digicams and get a beaded camera strap free. When tonight's over, so is the offer.",
                   bg=PINK, pad="10px 56px 6px"),
        button("Claim my free strap", url(BUNDLE, c, "cta-1"), wrap_bg=PINK, pad="22px 48px 46px"),
        hero(img("hero_image_4.jpg", 1200, 800), "Two friends with flowers and Blush Digicams", url(CAM, c, "lifestyle")),
        text_block("Still deciding?", "Here's why 6,000+ reviewers love it", "", pad="40px 48px 0", h1size=26),
        features(),
        two_up([
            product_card({"name": "2-Pack Bestie Bundle", "price": "$320", "img": img("Budnle_Gray_Rose_product_preview.png", 600, 600, CDN2), "href": BUNDLE, "note": "+ Free strap ends tonight", "note_color": "#C2185B"}, c),
            product_card({"name": "Creator Pack", "price": "$213.34", "img": img("Silver_product_preview.png", 600, 600, CDN2), "href": "/products/creator-pack", "note": "Add 2 &rarr; free strap", "note_color": "#C2185B"}, c),
        ]),
        button("Shop before midnight", url(BUNDLE, c, "cta-2"), pad="16px 48px 44px"),
        footer(c),
    ])
    return page("Last chance: your free strap", "Ends tonight: buy 2 Blush Digicams, get a beaded strap free.", body)


# =====================================================================
# EMAIL 4 — Black Friday launch (25% off, BC25)
# =====================================================================
BF_PRODUCTS = [
    {"name": "Blush Digicam", "price": "$127.50", "was": "$170", "img": img("5-Blush_Noir_Target_2400_20261117.jpg", 600, 600), "href": CAM},
    {"name": "2-Pack Bestie Bundle", "price": "$240", "was": "$320", "img": img("Budnle_Gray_Rose_product_preview.png", 600, 600, CDN2), "href": BUNDLE},
    {"name": "Creator Pack", "price": "$160", "was": "$213.34", "img": img("Silver_product_preview.png", 600, 600, CDN2), "href": "/products/creator-pack"},
    {"name": "Travel Kit", "price": "$176.25", "was": "$235", "img": img("Pink_PDP_travel_pack_2.webp", 600, 600, CDN2), "href": "/products/travel-kit"},
]


def email4():
    c = "bfcm-1-launch"
    prods = [dict(p, note="With code BC25", note_color=BUBBLE) for p in BF_PRODUCTS]
    body = "".join([
        topbar("Black Friday is here &middot; 25% off sitewide with code BC25"),
        header(c),
        f"""<tr><td align="center" bgcolor="{INK}" style="background:{INK};padding:30px 24px 0;">
<p style="margin:0 0 6px;{HSTYLE}font-size:18px;letter-spacing:6px;color:{PINK};">Black Friday</p>
<p class="mega" style="margin:0;{HSTYLE}font-size:96px;line-height:96px;color:#ffffff;">25% off</p>
<p style="margin:12px 0 0;font-family:{BODY};font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">Everything. Every color.</p></td></tr>""",
        f'<tr><td bgcolor="{INK}" style="background:{INK};padding:28px 0 0;"><a href="{url(CAM, c, "hero")}"><img src="{img("hero_image_2.jpg", 1200, 800)}" width="600" alt="Hand holding a Noir Blush Digicam with the vanity mirror facing out" style="width:100%;height:auto;"></a></td></tr>',
        code_box("BC25", "Use code at checkout", "25% off your whole order", bg=INK, wrap_bg=INK, pad="32px 48px 8px"),
        button("Shop Black Friday", url("/collections/cameras", c, "cta-1"), bg=PINK, color=INK, wrap_bg=INK, pad="22px 48px 44px"),
        f'<tr><td class="px" align="center" bgcolor="{INK}" style="background:{INK};padding:8px 48px 18px;"><h2 class="h2" style="margin:0;{HSTYLE}font-size:26px;line-height:30px;color:#ffffff;">The best prices of the year</h2></td></tr>',
        two_up([product_card(p, c, dark=True) for p in prods], bg=INK),
        features(bg=INK, color="#ffffff"),
        split(img("banner_left_img.png", 600, 600), "Pink Blush Digicam in a silicone case with strawberry charm", url("/products/protective-silicone-case-with-bag-charm", c, "split-case"),
              "Add-on", "Case + Bag Charm", "Soft-touch silicone protection with a cherry charm. Now $35.25 with BC25.", "Shop the case"),
        footer(c, dark=True),
    ])
    return page("Black Friday: 25% off everything", "Use code BC25 for 25% off every Blush Digicam, bundle and accessory.", body, bg="#000000")


# =====================================================================
# EMAIL 5 — Black Friday last call
# =====================================================================
def email5():
    c = "bfcm-2-last-call"
    prods = [dict(p, note="With code BC25", note_color="#C2185B") for p in BF_PRODUCTS[:2]]
    body = "".join([
        topbar("Last call &middot; 25% off ends tonight", bg=INK, color="#ffffff"),
        header(c),
        f"""<tr><td align="center" bgcolor="{PINK}" style="background:{PINK};padding:44px 24px 36px;">
<p style="margin:0 0 10px;font-family:{BODY};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{INK};">Black Friday &middot; final hours</p>
<h1 class="h1" style="margin:0 0 14px;{HSTYLE}font-size:46px;line-height:50px;color:{INK};">Last call<br>for 25% off</h1>
<p style="margin:0;font-family:{BODY};font-size:16px;line-height:24px;color:{INK};">Code <b>BC25</b> expires at midnight. Don't be the one without a cam this holiday season.</p></td></tr>""",
        code_box("BC25", "Your code", "25% off everything &middot; ends tonight", bg="#ffffff", fg=INK, border=INK, wrap_bg=PINK, pad="0 48px 8px"),
        button("Use BC25 now", url("/collections/cameras", c, "cta-1"), wrap_bg=PINK, pad="22px 48px 44px"),
        text_block("Shot on Blush Digicam", "Made for holiday photo dumps", "", pad="40px 48px 18px", h1size=26),
        three_imgs([
            (img("PICA0444.jpg", 500, 700), "Holiday dinners", CAM),
            (img("PICA0419.jpg", 500, 700), "City nights", CAM),
            (img("PICA0453.jpg", 500, 700), "Mirror selfies", CAM),
        ], c),
        two_up([product_card(p, c) for p in prods]),
        split(img("2025_11_25-R5-Blush_Digicam-Campaign_Photoshoot-Studio-NYC-6442_1.jpg", 600, 600), "Woman taking a photo with a Cherry Blush Digicam", url(CAM, c, "split-gift"),
              "Gift guide", "The gift they'll actually use", "8 colors, a built-in vanity mirror and that Y2K flash. 25% off until midnight.", "Shop gifts", img_left=False),
        reviews(bg="#ffffff", quote="Best gift I've ever given. My friends keep asking where I got it.", who="Verified buyer"),
        f'<tr><td align="center" bgcolor="{INK}" style="background:{INK};padding:30px 24px;"><p style="margin:0 0 4px;{HSTYLE}font-size:22px;line-height:26px;color:#ffffff;">25% off ends at midnight</p><p style="margin:0 0 18px;font-family:{BODY};font-size:14px;color:#ffffff;">Code <b style="color:{PINK};">BC25</b> at checkout</p><a href="{url("/collections/cameras", c, "cta-final")}" style="display:inline-block;background:{PINK};color:{INK};{HSTYLE}font-size:15px;padding:16px 40px;">Shop now</a></td></tr>',
        footer(c),
    ])
    return page("Last call: 25% off ends tonight", "Code BC25 expires at midnight. 25% off every Blush Digicam.", body)


FILES = {
    "01-free-strap-launch.html": email1,
    "02-free-strap-bestie-pair.html": email2,
    "03-free-strap-last-chance.html": email3,
    "04-black-friday-25-off-launch.html": email4,
    "05-black-friday-25-off-last-call.html": email5,
}

if __name__ == "__main__":
    for name, fn in FILES.items():
        (OUT / name).write_text(fn())
        print("wrote", name)
