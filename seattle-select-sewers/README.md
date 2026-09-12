# Seattle Select Sewers — Paid Search Landing Page

A self-contained static landing page for Seattle Select Sewers, structured after
the Roto-Rooter local-market landing pages (sticky call header → hero + inline
lead form → trust bar → services → why-us → process → reviews →
service area → FAQ → closing CTA → footer).

```
index.html              the page
assets/css/styles.css   all styling (no framework, no build step)
assets/js/main.js       lead form handling, call tracking, FAQ accordion
assets/img/logo.svg     logo
assets/fonts/*.woff2    self-hosted Inter + Oswald (latin subsets, OFL)
```

The hero follows the Roto-Rooter treatment: white background, star-rating row,
oversized condensed uppercase headline (Oswald, sized to break cleanly into
three lines from 360px up), four outline-icon benefit
lines, then a red call button beside a navy "Schedule Service Online" button.
The headline and schedule button use the company's own navy rather than
Roto-Rooter's indigo, so the hero matches the logo.

Open `index.html` directly, or serve the folder: `npx http-server .`

## Before this goes live

Four things are stand-ins and need real values.

**1. Logo** — `assets/img/logo.svg` is a hand-built recreation, because
seattleselectsewers.com is blocked from the build environment. Drop in the real
logo file and update the three `<img src="assets/img/logo.svg">` references
(header, footer, favicon/OG meta).

**2. Lead form endpoint** — `assets/js/main.js`, `FORM_ENDPOINT`. While it's
empty both forms run in demo mode: they validate, show the success state, and
send nothing. Point it at the CRM webhook or form service and each POSTs JSON
(`first_name, last_name, phone, email, zip, service, notes, source, page`). A
honeypot field filters bots. The hero and FAQ forms are identical; `source`
says which one converted (`hero` / `faq`), so you can see which earns its place.

Every field is required, including email and the description, and the service
dropdown opens on "Choose a service" so it has to be picked. That is a
deliberate trade: better-qualified leads, fewer of them. If volume drops more
than you want, the quickest lever is making email or the description optional
again — one entry each in the `required` array in `main.js`, plus the `required`
attribute and the `*` in the markup.

**3. Review attributions** — the three testimonials are real customer quotes
pulled from public review listings, but they're credited to "Verified customer."
Swap in the actual names and platforms, or replace with reviews you have written
permission to display.

**4. Hero star rating** — the hero shows "4.9/5 rating," carried over from the
reference design. Replace it with the real Google/Yelp average before launch,
and point the row's link at the actual review profile rather than `#reviews`.
Advertising a rating you can't substantiate is a Google Ads policy problem.

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

## Button colors

Three CTA styles, assigned by role so two buttons never sit side by side in the
same color: `.btn--call` (green) is the phone, `.btn--primary` (teal) is book
online, `.btn--navy` / `.btn--ghost` is the quieter partner. Changing one
button's class is fine; check its neighbor afterwards.

## Conversion tracking

Every phone link carries `data-track="call"` with a `data-location` naming its
placement (header, hero, footer, sticky mobile bar). `main.js` fires
`phone_call_click` with that placement, and `generate_lead` on form submit, to
both `gtag()` and `dataLayer` if either is present. Add the GA4 / Google Ads tag
in `<head>` and the events flow with no further wiring.

## Notes

- No build step, no dependencies. Inter and Oswald are self-hosted variable
  fonts (latin + latin-ext subsets, ~175KB total) with a system fallback stack,
  so there's no render-blocking third-party request.
- Only the hero `h1` uses the condensed Oswald face. If you want the section
  headings to match the reference too, add `h2` to the `h1 { font-family:
  var(--display) … }` rule in `styles.css`.
- `Plumber` and `FAQPage` JSON-LD are included.
- Responsive down to 390px with a sticky call/estimate bar on mobile; respects
  `prefers-reduced-motion`.
