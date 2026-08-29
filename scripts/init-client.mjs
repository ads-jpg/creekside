#!/usr/bin/env node
/**
 * Turns a fresh copy of the template into a real client page.
 *
 *   npm run new-client -- --slug acme-roofing --name "Acme Roofing" --am you@creeksidemarketingpros.com
 *
 * Optional:
 *   --phone "+15555550123"   sets the contact number at the same time
 *   --reset                  clears the demo copy so you start from a blank page
 *
 * It rewrites the client identity in site.config.json and the Worker name and route in
 * wrangler.jsonc. Everything else — headlines, colours, images — you edit by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
};
const has = (name) => args.includes(`--${name}`);

const slug = flag('slug');
const name = flag('name');
const am = flag('am');
const phone = flag('phone');

if (!slug || !name || !am) {
  console.error(`
  Set up a new client page.

    npm run new-client -- --slug acme-roofing --name "Acme Roofing" --am you@creeksidemarketingpros.com

  Required
    --slug   lowercase and hyphens. Becomes acme-roofing.ad-pages.com
    --name   the client's business name, as it should appear on the page
    --am     your Creekside email address

  Optional
    --phone  the client's phone number in +15555550123 form
    --reset  clear the demo copy and start from a blank page
`);
  process.exit(1);
}

if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
  console.error(`\n  "${slug}" is not a valid slug. Use lowercase letters, numbers and hyphens only.\n`);
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(am)) {
  console.error(`\n  "${am}" does not look like an email address.\n`);
  process.exit(1);
}
if (phone && !/^\+[1-9][0-9]{7,14}$/.test(phone)) {
  console.error(`\n  --phone must be in international format, like +15555550123. Got "${phone}".\n`);
  process.exit(1);
}

const domain = `${slug}.ad-pages.com`;

/* ---------------------------------------------------- site.config.json ---- */

const configPath = join(root, 'site.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

config.client = {
  ...config.client,
  slug,
  name,
  domain,
  accountManager: am,
  campaign: config.client.campaign === 'Search - Brand - Demo' ? '' : config.client.campaign,
};

if (phone) {
  config.contact.phone = phone;
  const digits = phone.replace(/^\+1/, '');
  config.contact.phoneDisplay =
    digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : phone;
  if (config.hero?.secondaryCta?.href?.startsWith('tel:')) {
    config.hero.secondaryCta.href = `tel:${phone}`;
    config.hero.secondaryCta.label = `Call ${config.contact.phoneDisplay}`;
  }
}

if (config.footer) config.footer.legalName = '';
config.seo.title = '';
config.seo.description = '';

if (has('reset')) {
  const blank = { ...config };
  blank.hero = { ...blank.hero, eyebrow: '', headline: '', subhead: '', bullets: [] };
  blank.trustBar = { ...blank.trustBar, headline: '', stats: [] };
  blank.benefits = { ...blank.benefits, headline: '', subhead: '', items: [] };
  blank.howItWorks = { ...blank.howItWorks, headline: '', steps: [] };
  blank.testimonials = { ...blank.testimonials, headline: '', items: [] };
  blank.offer = { ...blank.offer, badge: '', headline: '', body: '', finePrint: '' };
  blank.faq = { ...blank.faq, headline: '', items: [] };
  blank.finalCta = { ...blank.finalCta, headline: '', body: '' };
  Object.assign(config, blank);
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

/* -------------------------------------------------------- wrangler.jsonc -- */

const wranglerPath = join(root, 'wrangler.jsonc');
let wrangler = readFileSync(wranglerPath, 'utf8');

wrangler = wrangler
  .replace(/"name":\s*"[^"]*-ad-page"/, `"name": "${slug}-ad-page"`)
  .replace(/"CLIENT_SLUG":\s*"[^"]*"/, `"CLIENT_SLUG": "${slug}"`)
  .replace(/"SITE_URL":\s*"[^"]*"/, `"SITE_URL": "https://${domain}"`)
  .replace(
    /\s*\/\/ Commented out for the template itself; new-client fills it in\.\n\s*\/\/ "routes":[^\n]*\n/,
    `\n  "routes": [{ "pattern": "${domain}", "custom_domain": true }],\n`
  )
  .replace(/"routes":\s*\[\{\s*"pattern":\s*"[^"]*"/, `"routes": [{ "pattern": "${domain}"`);

writeFileSync(wranglerPath, wrangler);

/* ----------------------------------------------------------------- done --- */

console.log(`
  Set up ${name} at https://${domain}

  Worker name   ${slug}-ad-page
  Owner         ${am}

  Next, in order:
    1. Drop the client's logo, hero image and share image into public/images/
    2. Fill in site.config.json — brand colours, headline, offer, FAQ, form fields
       ${has('reset') ? 'The demo copy has been cleared, so start from the top.' : 'The demo copy is still there as a starting point. Replace all of it.'}
    3. Set seo.title and seo.description (they were cleared just now)
    4. Add the GA4 and Google Ads IDs under analytics
    5. npm run dev, then check the page on a phone-sized window
    6. npm run validate -- --strict   until it passes clean
    7. Open a pull request and tag the landing page lead for review

  Deployment happens automatically when that pull request is merged.
`);
