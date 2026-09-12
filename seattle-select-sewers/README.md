# Seattle Select Sewers — Paid Search Landing Page

A self-contained static landing page for Seattle Select Sewers, structured after
the Roto-Rooter local-market landing pages (sticky call header → hero + inline
lead form → trust bar → services → coupons → why-us → process → reviews →
service area → FAQ → closing CTA → footer).

```
index.html              the page
assets/css/styles.css   all styling (no framework, no build step)
assets/js/main.js       lead form handling, call tracking, FAQ accordion
assets/img/logo.svg     logo
```

Open `index.html` directly, or serve the folder: `npx http-server .`

## Before this goes live

Four things are stand-ins and need real values.

**1. Logo** — `assets/img/logo.svg` is a hand-built recreation, because
seattleselectsewers.com is blocked from the build environment. Drop in the real
logo file and update the three `<img src="assets/img/logo.svg">` references
(header, footer, favicon/OG meta).

**2. Lead form endpoint** — `assets/js/main.js` line 8, `FORM_ENDPOINT`. While
it's empty the form runs in demo mode: it validates, shows the success state,
and sends nothing. Point it at the CRM webhook or form service and it POSTs JSON
(`name, phone, email, zip, service, notes, page`). A honeypot field filters bots.

**3. Coupon values** — the three offers ($99 inspection, $75 off jetting, $500
off lining) and their 12/31/2026 expiration are placeholders chosen to match the
Roto-Rooter coupon pattern. Replace with the real promotions and terms.

**4. Review attributions** — the three testimonials are real customer quotes
pulled from public review listings, but they're credited to "Verified customer."
Swap in the actual names and platforms, or replace with reviews you have written
permission to display.

## Verify before launch

- Business address (Redmond, WA) and the secondary phone (425) 502-5011 come
  from third-party directory listings, not the company site.
- L&I license #SEATTSS874JJ, "since 2005," the 20-year lining warranty, and the
  40-year liner lifespan all appear in the page copy — confirm each is current.
- `<meta name="robots" content="noindex, follow">` is set, which is standard for
  a paid-traffic page that would otherwise compete with the main site. Remove it
  if this page is meant to rank organically.
- `<link rel="canonical">` points at `/seattle-sewer-repair/` — update to the
  real deployed URL.

## Conversion tracking

Every phone link carries `data-track="call"` with a `data-location` naming its
placement (header, hero, each offer, footer, sticky mobile bar). `main.js` fires
`phone_call_click` with that placement, and `generate_lead` on form submit, to
both `gtag()` and `dataLayer` if either is present. Add the GA4 / Google Ads tag
in `<head>` and the events flow with no further wiring.

## Notes

- No build step, no dependencies. Inter loads from Google Fonts with a system
  font fallback stack.
- `Plumber` and `FAQPage` JSON-LD are included.
- Responsive down to 390px with a sticky call/estimate bar on mobile; respects
  `prefers-reduced-motion`.
