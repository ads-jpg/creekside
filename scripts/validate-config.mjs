#!/usr/bin/env node
/**
 * Checks site.config.json before the page is allowed to build or deploy.
 *
 *   node scripts/validate-config.mjs            errors block, warnings are advisory
 *   node scripts/validate-config.mjs --strict   warnings block too (used by the deploy workflow)
 *
 * The messages here are written for account managers, not engineers. If you add a
 * rule, phrase it as "what to do", not "what the schema says".
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

let cfg;
try {
  cfg = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));
} catch (e) {
  console.error(`\n  site.config.json is not valid JSON.\n  ${e.message}\n\n  Most often this is a missing comma, or a trailing comma after the last item in a list.\n`);
  process.exit(1);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const E164 = /^\+[1-9][0-9]{7,14}$/;
const SLUG = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const asset = (p) => !p || !p.startsWith('/') || existsSync(join(root, 'public', p.slice(1)));

/* ---------- client ---------- */
const c = cfg.client ?? {};
if (!SLUG.test(c.slug ?? '')) err('client.slug must be lowercase letters, numbers and hyphens only (for example "acme-roofing").');
if (!c.name) err('client.name is required. It appears in the header, the footer and the page title.');
if (c.domain !== `${c.slug}.ad-pages.com`) err(`client.domain must be exactly "${c.slug}.ad-pages.com" so the Worker route matches. Found "${c.domain ?? ''}".`);
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.accountManager ?? '')) err('client.accountManager must be your Creekside email address. It is who the deploy notifications go to.');

/* ---------- brand ---------- */
const colors = cfg.brand?.colors ?? {};
for (const key of ['primary', 'primaryDark', 'accent', 'ink', 'muted', 'surface', 'subtle']) {
  if (!HEX.test(colors[key] ?? '')) err(`brand.colors.${key} must be a 6-digit hex colour like #0d5c63. Found "${colors[key] ?? ''}".`);
}
if (cfg.brand?.logo && !asset(cfg.brand.logo)) err(`brand.logo points at "${cfg.brand.logo}" but that file is not in the public folder. Upload it to public/images/ first.`);
if (!cfg.brand?.logo) warn('brand.logo is empty, so the client name will be shown as plain text. Add a logo if you have one.');

/* Contrast check: the primary colour carries white button text, so it has to be dark enough. */
const luminance = (hex) => {
  const v = [1, 3, 5].map((i) => {
    const x = parseInt(hex.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
for (const key of ['primary', 'primaryDark']) {
  if (HEX.test(colors[key] ?? '')) {
    const ratio = 1.05 / (luminance(colors[key]) + 0.05);
    if (ratio < 4.5) err(`brand.colors.${key} (${colors[key]}) is too light for white button text — contrast is ${ratio.toFixed(1)}:1 and needs 4.5:1. Pick a darker shade of the client's brand colour.`);
  }
}

/* ---------- seo ---------- */
const seo = cfg.seo ?? {};
if (!seo.title) err('seo.title is required.');
else if (seo.title.length > 70) warn(`seo.title is ${seo.title.length} characters. Google truncates around 60-70, so trim it.`);
if (!seo.description) err('seo.description is required.');
else if (seo.description.length < 50 || seo.description.length > 165) warn(`seo.description is ${seo.description.length} characters. Aim for 120-160.`);
if (seo.ogImage && !asset(seo.ogImage)) err(`seo.ogImage points at "${seo.ogImage}" but that file is not in the public folder.`);
if (seo.noindex !== true) warn('seo.noindex is not true. Paid-traffic landing pages are normally kept out of Google so they do not compete with the client’s own site. Set it to false deliberately if this page should rank.');

/* ---------- contact ---------- */
const contact = cfg.contact ?? {};
if (!E164.test(contact.phone ?? '')) err(`contact.phone must be in international format with no spaces or dashes, like +15555550123. Found "${contact.phone ?? ''}".`);
if (!contact.phoneDisplay) err('contact.phoneDisplay is required. That is the human-readable number, like (555) 555-0123.');

/* ---------- sections ---------- */
const hero = cfg.hero ?? {};
if (hero.enabled !== false) {
  if (!hero.headline) err('hero.headline is required. It is the first thing a visitor reads and it should echo the ad they clicked.');
  else if (hero.headline.length > 90) warn(`hero.headline is ${hero.headline.length} characters and will wrap awkwardly on phones. Keep it under 90.`);
  if (!hero.primaryCta?.label || !hero.primaryCta?.href) err('hero.primaryCta needs both a label and an href.');
  if (hero.image && !hero.imageAlt) err('hero.imageAlt is required whenever hero.image is set — screen readers and Google both need it.');
  if (hero.image && !asset(hero.image)) err(`hero.image points at "${hero.image}" but that file is not in the public folder.`);
}

for (const [name, section] of Object.entries({ gallery: cfg.gallery, trustBar: cfg.trustBar })) {
  for (const item of section?.images ?? section?.logos ?? []) {
    if (!asset(item.src)) err(`${name} references "${item.src}" but that file is not in the public folder.`);
    if (!item.alt) err(`Every image in ${name} needs an alt description.`);
  }
}

if (cfg.testimonials?.enabled !== false) {
  for (const [i, t] of (cfg.testimonials?.items ?? []).entries()) {
    if (!t.quote?.trim()) err(`testimonials.items[${i}] has an empty quote.`);
    if (!t.name?.trim()) err(`testimonials.items[${i}] needs a name. Real reviews only — never write testimonials on a client's behalf.`);
  }
}

if (cfg.offer?.enabled !== false && cfg.offer?.headline && !cfg.offer?.finePrint) {
  warn('offer.finePrint is empty. If the promotion has any conditions (new customers only, expiry date), they belong there.');
}

/* ---------- lead form ---------- */
const form = cfg.leadForm ?? {};
if (form.enabled !== false) {
  const fields = form.fields ?? [];
  if (!form.headline) err('leadForm.headline is required.');
  if (fields.length < 2) err('leadForm.fields needs at least a name and a way to reach the person.');
  if (fields.length > 5) warn(`The form has ${fields.length} fields. Every extra field costs conversions — five or fewer is the house standard.`);

  const seen = new Set();
  for (const [i, f] of fields.entries()) {
    if (!f.name || !/^[a-z][a-zA-Z0-9_]*$/.test(f.name)) err(`leadForm.fields[${i}].name must be a simple lowercase key like "phone".`);
    if (seen.has(f.name)) err(`leadForm.fields has two fields named "${f.name}". Field names must be unique.`);
    seen.add(f.name);
    if (!f.label) err(`leadForm.fields[${i}] needs a label.`);
    if (f.type === 'select' && !(f.options?.length > 1)) err(`leadForm.fields[${i}] ("${f.name}") is a dropdown, so it needs at least two options.`);
  }
  if (fields.some((f) => f.type === 'tel') && !form.consentText?.trim()) {
    err('leadForm.consentText is required whenever the form collects a phone number. It is what makes follow-up calls and texts compliant.');
  }
  if (form.successRedirect && !form.successRedirect.startsWith('/')) err('leadForm.successRedirect must be a path on this site, like /thanks. Conversion tracking fires on that page.');
}

/* ---------- CTA targets ---------- */
const ctas = [
  ['header.ctaHref', cfg.header?.ctaHref],
  ['hero.primaryCta.href', hero.primaryCta?.href],
  ['hero.secondaryCta.href', hero.secondaryCta?.href],
  ['offer.cta.href', cfg.offer?.cta?.href],
  ['finalCta.primaryCta.href', cfg.finalCta?.primaryCta?.href],
  ['stickyCta.href', cfg.stickyCta?.href],
];
for (const [where, href] of ctas) {
  if (!href) continue;
  if (href === '#lead-form' && form.enabled === false) err(`${where} scrolls to the lead form, but leadForm.enabled is false. Either turn the form back on or point the button somewhere else.`);
  if (href.startsWith('tel:') && href.slice(4) !== contact.phone) warn(`${where} dials "${href.slice(4)}" which is not contact.phone. Usually these should match.`);
}

/* ---------- analytics ---------- */
const a = cfg.analytics ?? {};
if (a.ga4Id && !/^G-[A-Z0-9]+$/.test(a.ga4Id)) err(`analytics.ga4Id should look like G-XXXXXXXXXX. Found "${a.ga4Id}".`);
if (a.gtmId && !/^GTM-[A-Z0-9]+$/.test(a.gtmId)) err(`analytics.gtmId should look like GTM-XXXXXXX. Found "${a.gtmId}".`);
if (a.googleAdsId && !/^AW-[0-9]+$/.test(a.googleAdsId)) err(`analytics.googleAdsId should look like AW-123456789. Found "${a.googleAdsId}".`);
if (a.ga4Id && a.gtmId) warn('Both analytics.ga4Id and analytics.gtmId are set. Use one or the other, or GA4 will double-count.');
if (a.googleAdsId && !a.googleAdsConversionLabel) err('analytics.googleAdsConversionLabel is required alongside googleAdsId, otherwise form submissions will not be reported as conversions.');
if (!a.ga4Id && !a.gtmId) warn('No analytics configured. This page will not report any traffic.');
if (!a.googleAdsId) warn('No Google Ads conversion tracking configured. Ad spend on this page will not be optimised against leads.');

/* ---------- launch readiness (strict only) ---------- */
if (strict) {
  const raw = JSON.stringify(cfg);
  if (c.slug === 'demo-client') err('This is still the demo config. Run "npm run new-client" before deploying.');
  if (/REPLACE|TODO|Lorem ipsum|example\.com|unassigned@/i.test(raw)) err('The config still contains placeholder text (REPLACE, TODO, example.com or unassigned@). Search site.config.json and finish it.');
  if (/\b555-?555-?01\d\d\b/.test(raw) || contact.phone === '+15555550123') err('contact.phone is still the demo number.');
}

/* ---------- report ---------- */
const label = strict ? 'launch check' : 'config check';
if (warnings.length) {
  console.log(`\n  ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  warnings.forEach((w) => console.log(`   ! ${w}`));
}
if (errors.length) {
  console.log(`\n  ${errors.length} problem${errors.length === 1 ? '' : 's'} to fix in site.config.json:`);
  errors.forEach((e) => console.log(`   x ${e}`));
  console.log(`\n  ${label} failed.\n`);
  process.exit(1);
}
if (strict && warnings.length) {
  console.log(`\n  ${label} failed: warnings block a production deploy. Fix them, or ask the landing page lead to sign off.\n`);
  process.exit(1);
}
console.log(`\n  ${label} passed for ${c.name} (${c.domain}).\n`);
