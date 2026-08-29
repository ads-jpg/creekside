#!/usr/bin/env node
/**
 * Pre-launch audit for the veneers page.
 *
 *   node tools/audit-page.js
 *
 * Structural checks run with no dependencies. The contrast pass additionally
 * needs Playwright and is skipped with a notice if it is not installed.
 *
 * The contrast pass exists because a CSS specificity collision can make a
 * button's label invisible — white text on a white button — while the markup
 * still reads perfectly correctly. It has happened twice on this page:
 * `.vd-page a` beating `.vd-btn--primary`, and `.vd-footer a` beating
 * `.vd-btn--light`. Both were invisible in review and obvious on screen.
 * Run this before every deploy.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'veneers/index.html');

let failures = 0;
const ok  = (m) => console.log('  ok   ' + m);
const bad = (m) => { console.log('  FAIL ' + m); failures++; };
const head = (m) => console.log('\n' + m);

const raw = fs.readFileSync(PAGE, 'utf8');
const html = raw.replace(/<!--[\s\S]*?-->/g, '');   // comments are not markup

/* ---------------------------------------------------------------- structure */
head('Structure');
['section', 'form', 'article', 'details', 'summary', 'figure', 'footer',
 'header', 'main', 'body', 'html', 'ul', 'dl'].forEach((t) => {
  const open  = (html.match(new RegExp('<' + t + '[\\s>]', 'g')) || []).length;
  const close = (html.match(new RegExp('</' + t + '>', 'g')) || []).length;
  open === close ? ok(`${t}: ${open}`) : bad(`${t}: ${open} open vs ${close} close`);
});

const headings = [...html.matchAll(/<(h[1-5])\b[^>]*>([\s\S]*?)<\/\1>/g)]
  .map((m) => ({ level: +m[1][1], text: m[2].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim() }));
const h1s = headings.filter((h) => h.level === 1);
h1s.length === 1 ? ok(`one H1: "${h1s[0].text}"`) : bad(`${h1s.length} H1 elements`);
let prev = 1, skipped = 0;
headings.forEach((h) => { if (h.level > prev + 1) skipped++; prev = h.level; });
skipped === 0 ? ok('no skipped heading levels') : bad(`${skipped} skipped heading levels`);

/* ------------------------------------------------------------------- assets */
head('Assets');
const refs = new Set([...html.matchAll(/(?:src|href)="((?!https?:|tel:|mailto:|data:|#|\/)[^"]+)"/g)].map((m) => m[1]));
// srcset candidates too — a broken one there fails silently at the breakpoint
// that selects it, which is exactly the kind of bug nobody notices locally.
[...html.matchAll(/srcset="([^"]+)"/g)].forEach((m) => {
  m[1].split(',').forEach((c) => {
    const url = c.trim().split(/\s+/)[0];
    if (url && !/^(https?:|data:|\/)/.test(url)) refs.add(url);
  });
});
refs.forEach((r) => fs.existsSync(path.join(ROOT, 'veneers', r)) ? ok(r) : bad('missing ' + r));

const srcsetImgs = [...html.matchAll(/<img\b[^>]*srcset=[^>]*>/g)];
const noSizes = srcsetImgs.filter((m) => !/\bsizes=/.test(m[0]));
if (srcsetImgs.length) {
  noSizes.length === 0
    ? ok(`all ${srcsetImgs.length} responsive images declare sizes`)
    : bad(`${noSizes.length} images have srcset but no sizes — the browser will assume 100vw`);
}

const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const noAlt = imgs.filter((i) => !/\balt=/.test(i));
noAlt.length === 0 ? ok(`all ${imgs.length} images have alt`) : bad(`${noAlt.length} images missing alt`);
const noDim = imgs.filter((i) => !(/\bwidth=/.test(i) && /\bheight=/.test(i)));
noDim.length === 0 ? ok('all images have width+height (no layout shift)') : bad(`${noDim.length} images missing dimensions`);

/* ------------------------------------------------------------- conversion */
head('Conversion paths');
const tel = [...html.matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1]);
new Set(tel).size === 1
  ? ok(`${tel.length} tel: links, all ${tel[0]} (E.164)`)
  : bad('inconsistent phone numbers: ' + [...new Set(tel)].join(', '));
const untracked = [...html.matchAll(/<a\b[^>]*href="(?:tel:|#consult)[^"]*"[^>]*>/g)]
  .filter((m) => !m[0].includes('data-vd-cta'));
untracked.length === 0 ? ok('every call/form link is tracked') : bad(`${untracked.length} conversion links missing data-vd-cta`);
/\bnovalidate\b/.test(html) ? ok('forms use custom validation') : bad('forms missing novalidate');

/* -------------------------------------------------------------- compliance */
head('Compliance');
const ld = JSON.parse(raw.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const graph = ld['@graph'] || [ld];
ok('structured data parses: ' + graph.map((n) => n['@type']).join(', '));
const faq = (graph.find((n) => n['@type'] === 'FAQPage') || {}).mainEntity || [];
const visible = [...html.matchAll(/<summary class="vd-faq__q">([\s\S]*?)<\/summary>/g)]
  .map((m) => m[1].replace(/<[^>]+>/g, '').trim());
faq.length === visible.length && faq.every((q, i) => q.name === visible[i])
  ? ok(`FAQ schema matches all ${faq.length} visible questions`)
  : bad('FAQ schema does not match the visible FAQ');
// Test the parsed graph, not the raw file — the <head> carries a comment
// explaining why aggregateRating is omitted, which a text match would flag.
JSON.stringify(ld).includes('aggregateRating')
  ? bad('aggregateRating in schema — self-serving review markup is a policy violation')
  : ok('no self-serving aggregateRating in schema');

const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
[/\b\d{2,4}\s*(?:5[- ]star\s+)?(?:google\s+)?reviews\b/i, /\b\d\.\d\s*(?:out of 5|stars?)/i]
  .some((re) => re.test(body))
  ? bad('hard-coded rating or review count found in markup')
  : ok('no hard-coded rating, review count, or testimonial');

const css = fs.readFileSync(path.join(ROOT, 'veneers/assets/css/veneers.css'), 'utf8');
if (/\.grecaptcha-badge\s*\{[^}]*visibility:\s*hidden/.test(css)) {
  /This site is protected by reCAPTCHA/.test(raw)
    ? ok('reCAPTCHA badge hidden AND attribution text present (required together)')
    : bad('reCAPTCHA badge hidden WITHOUT attribution text — violates Google terms');
}

/* --------------------------------------------------------------- contrast */
(async () => {
  head('Text contrast (catches invisible buttons from CSS specificity collisions)');
  let chromium;
  try {
    ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright')));
  } catch (e) {
    try { ({ chromium } = require('playwright')); }
    catch (e2) { console.log('  skip  Playwright not installed — run `npm i -D playwright` to enable'); return finish(); }
  }

  const browser = await chromium.launch();
  const results = [];
  for (const [label, width] of [['desktop', 1280], ['mobile', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('file://' + PAGE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const rows = await page.evaluate(() => {
      const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const nums = (s) => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
      const opaque = (s) => { const n = (s.match(/[\d.]+/g) || []); return n.length > 3 ? parseFloat(n[3]) > 0.5 : true; };
      const surfaceOf = (el) => { let n = el; while (n && n !== document.documentElement) { const cs = getComputedStyle(n); if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && opaque(cs.backgroundColor)) return cs.backgroundColor; n = n.parentElement; } return 'rgb(255,255,255)'; };
      const out = [];
      document.querySelectorAll('.vd-btn, a, button').forEach((el) => {
        const text = (el.textContent || '').trim();
        const r = el.getBoundingClientRect();
        if (!text || r.width < 2 || r.height < 2) return;
        const cs = getComputedStyle(el);
        const bg = (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && opaque(cs.backgroundColor)) ? cs.backgroundColor : surfaceOf(el.parentElement || el);
        const l1 = lum(nums(cs.color)), l2 = lum(nums(bg));
        out.push({ text: text.slice(0, 40), cls: String(el.className).slice(0, 40),
                   ratio: +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)),
                   color: cs.color, bg });
      });
      return out;
    });
    await page.close();
    const failed = rows.filter((r) => r.ratio < 3);
    results.push([label, rows.length, failed]);
  }
  await browser.close();

  results.forEach(([label, count, failed]) => {
    if (failed.length === 0) { ok(`${label}: ${count} elements, all above 3:1`); return; }
    failed.forEach((f) => bad(`${label}: ${f.ratio}:1 "${f.text}" (${f.cls}) — ${f.color} on ${f.bg}`));
  });
  finish();
})();

function finish() {
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}
