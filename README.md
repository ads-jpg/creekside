# Vida Dentistry — Veneers page conversion optimization

A conversion-focused rebuild of the **`/services/veneers`** page for Google Ads
traffic, built around the practice's existing content and messaging rather than
replacing it.

```
veneers/
  index.html                    the page
  assets/css/veneers.css        design system (all classes .vd- prefixed)
  assets/js/veneers.js          tracking, form, reviews + Instagram loaders
  assets/img/*.svg              labelled placeholders for the real photography
tools/
  audit-page.js                 pre-launch audit — run before every deploy
server/
  verify-lead.js                lead intake + reCAPTCHA verification + spam scoring
  verify-lead.test.js           policy tests — run before tuning thresholds
docs/
  CRO-CHANGES.md                what changed and why
  CONTENT-AND-IMAGE-SLOTS.md    what to swap in — read this first
  GOOGLE-REVIEWS-AND-INSTAGRAM.md   what these integrations can actually do
  TRACKING-SETUP.md             GTM / GA4 / Google Ads conversion tracking
  SPAM-PROTECTION.md            reCAPTCHA v3 setup and the scoring policy
```

Open `veneers/index.html` in a browser to view it. No build step, no dependencies.

---

## Read this before anything else

Two constraints shaped what could be delivered:

1. **This repository was empty** — only a `README.md`. The vidadentistry.com
   source code is not in it.
2. **The session's network policy blocked all outbound HTTP**, including
   `vidadentistry.com`. The live page could not be fetched, rendered, or
   screenshotted, and its platform could not be detected.

So the page could not be edited in place. What is here instead is a complete,
working implementation built from the practice's published content (recovered via
search) plus verified practice data, with the real photography left as labelled
slots.

**Everything factual on the page traces to Vida Dentistry's own published
material. No reviews, ratings, review counts, testimonials, or Instagram images
were invented** — the sections that would carry them are API-driven and degrade to
honest link-outs when not configured.

To finish it properly, either paste the live page's HTML into the repo, add the
site source, or allow the domain through — then I will do a fidelity pass that
restores the exact original copy, headings and image references.

---

## Deploying it

### Three values to set

1. `veneers/index.html` — replace both instances of `GTM-XXXXXXX` with the real
   container ID.
2. `veneers/assets/js/veneers.js` — set `formEndpoint`. **Leads go nowhere until
   this is set**, and the form will say so rather than showing a false thank-you.
3. Same file, optional — `recaptchaSiteKey`, `reviewsEndpoint`, `instagramEndpoint`.

Then swap the seven placeholder images. See `docs/CONTENT-AND-IMAGE-SLOTS.md`.

### Porting into the existing site

Everything is namespaced under `.vd-` and scoped beneath `.vd-page`, so it will not
collide with the theme's global CSS. The page is plain semantic HTML — there is no
framework to unpick.

- **Squarespace** — the practice's URL structure (`/services/…`, `/blogs`) and
  title pattern are consistent with Squarespace, though this could not be
  confirmed. If so: add a Code Block per section, put `veneers.css` in Code
  Injection (page header) and `veneers.js` in the page footer. Squarespace's
  Business plan or above is required for code injection. Keep Squarespace's own
  header/footer and delete this page's.
- **WordPress** — a page template, or ACF flexible-content blocks per section.
  Enqueue the CSS/JS with `wp_enqueue_scripts` conditioned on the page ID.
- **Webflow** — rebuild the sections natively, or use Embed elements. Keep the
  `data-vd-cta` attributes so tracking survives.
- **Next.js / React** — each `<section>` maps cleanly to a component. The only
  stateful logic is the form and the two fetch loaders.

In every case: **keep the `data-vd-cta` attributes and the `data-vd-form`
attributes.** All conversion tracking keys off them.

### Using it as a standalone Ads landing page

It works as-is on any static host. For Google Ads specifically, a dedicated
landing page has real advantages — no site nav pulling visitors away, faster
iteration, clean A/B testing. If you go that route, `noindex` it and keep
`/services/veneers` as the organic page so the two do not compete.

---

## What it does

**Conversion**
Sticky header with call + form CTAs · dual CTA above the fold · nine CTA
placements at decision points · sticky mobile call/consult bar · two instances of
a three-field lead form · click-to-call throughout, E.164 formatted · success
state that offers a phone call

**Trust**
Live Google rating badge linking to the Business Profile · trust bar · live Google
reviews · Instagram feed from @veneergoddess · named doctor with credentials ·
before/after gallery · transparent pricing

**Spam protection**
Honeypot, submission-timing signal, and reCAPTCHA v3 — all invisible to a real
patient. The library loads only on first form interaction, so it costs nothing
on page load. Verification and scoring happen server-side in `server/`, where
they actually count. The policy deliberately flags rather than rejects: a low
score alone never blocks a lead, because real patients on VPNs and privacy
browsers score low. See `docs/SPAM-PROTECTION.md`.

**Technical**
`Dentist` + `FAQPage` + `BreadcrumbList` + `WebPage` schema · FAQ schema validated
against the visible FAQ question-for-question · gclid/UTM capture for offline
conversion import · GA4/GTM dataLayer events on every conversion action ·
mobile-first · WCAG-minded (skip link, labelled fields, visible focus, reduced
motion, keyboard-navigable) · zero dependencies · no layout shift

**Honest by construction**
No hard-coded ratings, review counts, or testimonials. No `aggregateRating` in
schema — self-serving review markup is a Google policy violation. Every
integration degrades to a real link rather than fake content.

---

## Verification run

`node tools/audit-page.js` — run this before every deploy:

```
tag balance ................ 13/13 element types balanced
headings ................... one H1, no skipped levels
images ..................... 7/7 with alt, width and height
assets ..................... all local references resolve
tel: links ................. 14, all +19492098889
tracked CTAs ............... no conversion link untracked
FAQ schema parity .......... 7 schema questions ↔ 7 on page, all matching
aggregateRating ............ absent (correct)
fabricated social proof .... none found
reCAPTCHA attribution ...... present while the badge is hidden
text contrast .............. 50 desktop / 49 mobile elements, all above 3:1
```

**The contrast pass is not decorative.** A CSS specificity collision can render
a button's label invisible — white text on a white button — while the markup
reads perfectly correctly. It has happened twice here (`.vd-page a` beating
`.vd-btn--primary`, and `.vd-footer a` beating `.vd-btn--light`), and both were
invisible in code review. The audit catches it; a diff does not.

`node server/verify-lead.test.js` — spam policy:

```
12/12 policy cases behave as intended
key property ............... a low reCAPTCHA score alone never rejects a lead
fail-open .................. Google outage, ad blocker, missing key -> flagged, delivered
```

---

## Open questions

- What platform is the live site on?
- Is there an existing lead-form component that should be reused instead of this
  one? (`.vd-form-card` is the drop-in point.)
- Does the live page already carry schema markup that would now be duplicated?
- Is Irvine a real volume target? The practice is in Mission Viejo; a separate
  Irvine landing page would serve that ad group better than diluting this one.
  See `docs/CONTENT-AND-IMAGE-SLOTS.md` §3.
