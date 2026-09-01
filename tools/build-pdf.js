#!/usr/bin/env node
/**
 * Export the veneers page to PDF, desktop and mobile.
 *
 *   node tools/build-pdf.js
 *
 * Produces one continuous page per version rather than paginating, so no
 * section gets sliced across a page break — these are for design review, not
 * for printing.
 *
 * Fonts: pass a @fontsource directory to embed the real typefaces, which is
 * what keeps the PDF from falling back to Times/Helvetica in an offline or
 * firewalled environment:
 *
 *   npm i --prefix .fonts @fontsource/cormorant-garamond @fontsource/inter
 *   node tools/build-pdf.js --fonts=.fonts/node_modules/@fontsource
 *
 * Without it the build links Google Fonts, which is fine when online.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
catch (e) { ({ chromium } = require('playwright')); }

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');

/* PDF readers cap a page at 200 inches (19200px at 96dpi). A single continuous
   page is nicer to read, so use one while it fits, and split into the fewest
   equal pages that stay under the cap once it does not. The mobile export
   crossed this threshold as the page grew. */
const MAX_PAGE_PX = 17000;

const TARGETS = [
  { name: 'desktop', width: 1440, mobile: false },
  { name: 'mobile',  width: 390,  mobile: true  },
];

(async () => {
  const fontsArg = process.argv.find((a) => a.startsWith('--fonts='));
  fs.mkdirSync(BUILD, { recursive: true });

  const source = path.join(BUILD, 'pdf-source.html');
  execFileSync('python3', [
    path.join(__dirname, 'build-standalone.py'), source, '--full',
    ...(fontsArg ? ['--embed-fonts=' + fontsArg.split('=')[1]] : []),
  ], { stdio: 'inherit' });

  const browser = await chromium.launch();

  for (const t of TARGETS) {
    const page = await browser.newPage({
      viewport: { width: t.width, height: 900 },
      deviceScaleFactor: 1,
      isMobile: t.mobile,
    });
    await page.goto('file://' + source, { waitUntil: 'load' });

    // Screen media, not print: the PDF should show what visitors see, and the
    // page's @media print rules deliberately strip the header and CTAs.
    await page.emulateMedia({ media: 'screen' });

    await page.evaluate(() => {
      document.querySelectorAll('.vd-reveal').forEach((e) => e.classList.add('is-in'));
      document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; i.decoding = 'sync'; });
    });
    await page.evaluate(async () => {
      await Promise.all([...document.images].filter((i) => !i.complete)
        .map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
    });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(1200);

    // The sticky CTA is a fixed overlay. In a single continuous page it would
    // float over whatever it happens to land on, so drop it and reclaim the
    // padding the page reserves for it.
    await page.addStyleTag({
      content: '.vd-sticky-cta{display:none!important}.vd-page{padding-bottom:0!important}',
    });
    await page.waitForTimeout(200);

    const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));

    // Keep components whole wherever a page break lands.
    await page.addStyleTag({ content: `
      .vd-ba, .vd-review, .vd-step, .vd-form-card, .vd-faq__item, .vd-fin-fact,
      .vd-fin-partner, .vd-fin-act, .vd-trust, figure, .vd-hero__media
      { break-inside: avoid; page-break-inside: avoid; }
    ` });

    const pages = Math.ceil(height / MAX_PAGE_PX);
    const pageHeight = Math.ceil(height / pages);

    const out = path.join(BUILD, `vida-veneers-${t.name}.pdf`);
    await page.pdf({
      path: out,
      width: `${t.width}px`,
      height: `${pageHeight}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      ...(pages === 1 ? { pageRanges: '1' } : {}),
    });

    const mb = (fs.statSync(out).size / 1048576).toFixed(1);
    console.log(`  ${t.name.padEnd(8)} ${t.width}x${pageHeight}px  (${(pageHeight / 96).toFixed(0)} in)  ` +
                `${pages} page${pages > 1 ? 's' : ''}  ${mb} MB  ${path.relative(ROOT, out)}`);
    await page.close();
  }

  await browser.close();
})();
