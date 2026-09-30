// Renders the email assets with headless Chromium.
//   node render.js  -> hero images in ../images/ and preview screenshots next to the templates
// Needs the `playwright` package (npm i playwright).
const path = require('path');
const { chromium } = require('playwright');

const here = (...p) => path.join(__dirname, ...p);

(async () => {
  const browser = await chromium.launch();

  const shoot = async (file, out, viewport, opts = {}) => {
    const page = await browser.newPage({ viewport, deviceScaleFactor: opts.scale || 1 });
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, fullPage: !!opts.fullPage });
    await page.close();
  };

  const heroSize = { width: 1200, height: 720 };
  await shoot(here('hero.html'), here('..', 'images', 'hero.png'), heroSize);
  await shoot(here('hero-reminder.html'), here('..', 'images', 'hero-reminder.png'), heroSize);

  for (const name of ['preview', 'preview-reminder']) {
    const file = here('..', `${name}.html`);
    await shoot(file, here('..', `${name}.png`), { width: 760, height: 900 }, { fullPage: true });
    await shoot(file, here('..', `${name}-mobile.png`), { width: 390, height: 844 }, { fullPage: true, scale: 2 });
  }

  await browser.close();
})();
