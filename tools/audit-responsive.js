#!/usr/bin/env node
/**
 * Responsive and touch audit for the veneers page.
 *
 *   node tools/audit-responsive.js
 *
 * Checks each viewport for horizontal overflow, elements escaping the
 * viewport, undersized touch targets, text too small to read on a phone, and
 * inputs that would trigger iOS Safari's zoom-on-focus.
 *
 * Deliberate exclusions, so the output stays actionable:
 *   - the honeypot field, which lives at left:-9999px on purpose
 *   - links inline inside prose, which WCAG's target-size rule exempts
 *   - the skip link, which is 1x1 until focused (its focus state is checked
 *     separately below)
 */

'use strict';

const path = require('path');
let chromium;
try { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
catch (e) { ({ chromium } = require('playwright')); }

const PAGE = 'file://' + path.resolve(__dirname, '..', 'veneers/index.html');

const VIEWPORTS = [
  { label: 'iPhone SE',        w: 320,  h: 568,  mobile: true },
  { label: 'iPhone 12 mini',   w: 375,  h: 812,  mobile: true },
  { label: 'iPhone 14',        w: 390,  h: 844,  mobile: true },
  { label: 'iPhone 14 Pro Max',w: 430,  h: 932,  mobile: true },
  { label: 'phone landscape',  w: 844,  h: 390,  mobile: true },
  { label: 'iPad portrait',    w: 768,  h: 1024, mobile: false },
  { label: 'laptop',           w: 1024, h: 768,  mobile: false },
  { label: 'desktop',          w: 1440, h: 900,  mobile: false },
];

let failures = 0;
const ok  = (m) => console.log('  ok   ' + m);
const bad = (m) => { console.log('  FAIL ' + m); failures++; };

/* Fonts, GTM and reCAPTCHA are third-party and irrelevant to layout. Abort them
   so each viewport loads immediately instead of waiting on network timeouts. */
async function blockExternal(page) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    return /^https?:/.test(url) ? route.abort() : route.continue();
  });
}

(async () => {
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    await blockExternal(page);
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.querySelectorAll('.vd-reveal').forEach((e) => e.classList.add('is-in')));
    await page.waitForTimeout(350);

    const r = await page.evaluate((vw) => {
      const out = { overflow: 0, escaping: [], taps: [], tiny: [], zoom: [], broken: 0 };
      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

      const inHoneypot = (el) => !!el.closest('.vd-hp');
      const isInlineProse = (el) =>
        el.tagName === 'A' && !!el.closest('p, li, figcaption, .vd-faq__a') && !el.className.includes('vd-btn');

      document.querySelectorAll('.vd-page *').forEach((el) => {
        if (inHoneypot(el)) return;
        const b = el.getBoundingClientRect();
        if (b.width < 1 || b.height < 1) return;
        const cs = getComputedStyle(el);

        if (b.right > vw + 1.5 || b.left < -1.5) {
          const key = (el.className || '').toString().slice(0, 44) || el.tagName;
          if (!out.escaping.some((x) => x.sel === key)) out.escaping.push({ sel: key, l: Math.round(b.left), r: Math.round(b.right) });
        }

        if (el.matches('a[href],button,input,select,textarea,summary') &&
            el.offsetParent !== null && !isInlineProse(el) && !el.classList.contains('vd-visually-hidden')) {
          if (b.height < 40 || b.width < 40) {
            const key = ((el.className || '').toString() || el.tagName) + ' :: ' + (el.textContent || '').trim().slice(0, 24);
            if (!out.taps.some((x) => x.sel === key)) out.taps.push({ sel: key, size: Math.round(b.width) + 'x' + Math.round(b.height) });
          }
        }

        if (el.matches('input,textarea,select') && parseFloat(cs.fontSize) < 16) {
          out.zoom.push({ el: el.id || el.name, px: parseFloat(cs.fontSize) });
        }

        if (el.children.length === 0 && (el.textContent || '').trim().length > 3) {
          const fs = parseFloat(cs.fontSize);
          if (fs < 11) {
            const key = (el.textContent || '').trim().slice(0, 26);
            if (!out.tiny.some((x) => x.txt === key)) out.tiny.push({ txt: key, px: +fs.toFixed(1) });
          }
        }
      });

      out.broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length;
      return out;
    }, vp.w);

    const issues = [];
    if (r.overflow > 0)      issues.push(`horizontal overflow ${r.overflow}px`);
    if (r.escaping.length)   issues.push('escaping: ' + JSON.stringify(r.escaping.slice(0, 4)));
    if (r.taps.length)       issues.push('small tap targets: ' + JSON.stringify(r.taps.slice(0, 6)));
    if (r.tiny.length)       issues.push('text under 11px: ' + JSON.stringify(r.tiny.slice(0, 6)));
    if (r.zoom.length)       issues.push('iOS zoom-on-focus: ' + JSON.stringify(r.zoom));
    if (r.broken)            issues.push(`${r.broken} broken images`);

    const name = `${vp.label} (${vp.w}x${vp.h})`;
    issues.length === 0 ? ok(name) : issues.forEach((i) => bad(`${name}: ${i}`));
    await page.close();
  }

  /* Fast sweep across breakpoint edges and the extremes the named devices miss.
     The CSS breaks at 480/640/768/900/1024, and bugs hide either side of a
     boundary. Reuses one page and just resizes, so ~20 widths cost very little. */
  {
    const WIDTHS = [280, 320, 360, 479, 480, 481, 600, 639, 640, 641, 767, 768,
                    769, 899, 900, 901, 1023, 1024, 1025, 1280, 1600, 1920, 2560, 3440];
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await blockExternal(page);
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.querySelectorAll('.vd-reveal').forEach((e) => e.classList.add('is-in')));

    const flagged = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(60);
      const r = await page.evaluate((vw) => {
        let escaping = 0, worst = '';
        document.querySelectorAll('.vd-page *').forEach((e) => {
          if (e.closest('.vd-hp')) return;
          const b = e.getBoundingClientRect();
          if (b.width > 0 && b.height > 0 && (b.right > vw + 1.5 || b.left < -1.5)) {
            escaping++;
            if (!worst) worst = String(e.className || e.tagName).slice(0, 34);
          }
        });
        let clipped = 0;
        document.querySelectorAll('.vd-page p,.vd-page h1,.vd-page h2,.vd-page h3,.vd-page span,.vd-page li').forEach((e) => {
          if (e.children.length) return;
          if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1) clipped++;
        });
        const c = document.querySelector('.vd-container').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          escaping, worst, clipped,
          centered: Math.abs(c.left * 2 + c.width - vw) < 20,
        };
      }, w);
      if (r.overflow > 0 || r.escaping > 0 || r.clipped > 0 || !r.centered) {
        flagged.push(`${w}px: overflow ${r.overflow}, escaping ${r.escaping}${r.worst ? ' (' + r.worst + ')' : ''}, clipped ${r.clipped}, centered ${r.centered}`);
      }
    }
    await page.close();
    flagged.length === 0
      ? ok(`width sweep: ${WIDTHS.length} widths from 280 to 3440, no overflow, clipping or off-centre container`)
      : flagged.forEach((f) => bad('width sweep ' + f));
  }

  // Skip link must become visible and hittable once focused.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await blockExternal(page);
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  const skip = await page.evaluate(() => {
    const el = document.querySelector('a.vd-visually-hidden');
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { focused: document.activeElement === el, w: Math.round(b.width), h: Math.round(b.height) };
  });
  if (!skip)                      bad('no skip link found');
  else if (!skip.focused)         bad('first Tab does not reach the skip link');
  else if (skip.w < 60 || skip.h < 32) bad(`skip link still ${skip.w}x${skip.h} when focused — invisible to keyboard users`);
  else                            ok(`skip link becomes ${skip.w}x${skip.h} on focus`);
  await browser.close();

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nResponsive audit clean.');
  process.exit(failures ? 1 : 0);
})();
