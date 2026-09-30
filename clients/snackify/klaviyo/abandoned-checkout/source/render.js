// Renders the email assets with headless Chromium.
//   node render.js           -> ../images/hero.png and ../preview.png
// Needs the `playwright` package (npm i playwright).
const path = require('path');
const { chromium } = require('playwright');

const here = (...p) => path.join(__dirname, ...p);

(async () => {
  const browser = await chromium.launch();

  const hero = await browser.newPage({ viewport: { width: 1200, height: 720 } });
  await hero.goto('file://' + here('hero.html'));
  await hero.evaluate(() => document.fonts.ready);
  await hero.screenshot({ path: here('..', 'images', 'hero.png') });

  const preview = await browser.newPage({ viewport: { width: 760, height: 900 }, deviceScaleFactor: 1 });
  await preview.goto('file://' + here('..', 'preview.html'));
  await preview.evaluate(() => document.fonts.ready);
  await preview.screenshot({ path: here('..', 'preview.png'), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobile.goto('file://' + here('..', 'preview.html'));
  await mobile.evaluate(() => document.fonts.ready);
  await mobile.screenshot({ path: here('..', 'preview-mobile.png'), fullPage: true });

  await browser.close();
})();
