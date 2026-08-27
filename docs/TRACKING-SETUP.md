# Conversion tracking setup

The page emits every conversion signal already. Nothing here is a fake or
simulated event — each one fires on a real user action, and the lead event fires
only after the form endpoint actually accepts the submission.

Your job is to wire these events to GA4 and Google Ads in GTM.

---

## 1. What the page pushes

All events share one name, `vd_conversion_action`, and are distinguished by the
`action` parameter. One trigger pattern covers everything.

| `action` | Fires when | Use it for |
| --- | --- | --- |
| `phone_call_click` | Any `tel:` link is tapped or clicked | **Primary conversion** |
| `lead_form_submit` | Form endpoint returns success | **Primary conversion** |
| `form_start` | First keystroke in a form | Micro-conversion / audience |
| `cta_click` | Any non-phone CTA (buttons, Google badge, Instagram) | Diagnostics |
| `form_error` | Validation failed or submit failed | Diagnostics — watch this |
| `scroll_depth` | 25 / 50 / 75 / 90 % reached | Engagement, drop-off analysis |

Additional parameters, depending on event: `cta_id`, `cta_text`, `destination`,
`form_location` (`mid-page` or `footer`), `service`, `gclid`, `depth`, `page`.

Verify in the browser console before wiring anything up:

```js
dataLayer.filter(e => e.event === 'vd_conversion_action')
```

---

## 2. Before you go live — three required values

In `veneers/index.html`, replace both instances of `GTM-XXXXXXX` with the real
container ID (the inline script in `<head>` and the `<noscript>` iframe).

In `veneers/assets/js/veneers.js`, set:

```js
formEndpoint:      'https://…',   // required — leads go nowhere without it
reviewsEndpoint:   'https://…',   // optional — see GOOGLE-REVIEWS-AND-INSTAGRAM.md
instagramEndpoint: 'https://…',   // optional — see GOOGLE-REVIEWS-AND-INSTAGRAM.md
```

`formEndpoint` is deliberately `null` out of the box. Until it is set, the form
validates and then shows an explicit configuration error with the phone number,
rather than silently swallowing a real patient enquiry and showing a thank-you.

---

## 3. GTM configuration

### Variables — Data Layer Variable, one each

`action`, `cta_id`, `cta_text`, `destination`, `form_location`, `service`,
`gclid`, `depth`

### Triggers — Custom Event, event name `vd_conversion_action`

| Trigger | Condition |
| --- | --- |
| Phone Click | `action` equals `phone_call_click` |
| Lead Form Submit | `action` equals `lead_form_submit` |
| Form Start | `action` equals `form_start` |
| CTA Click | `action` equals `cta_click` |
| Scroll Depth | `action` equals `scroll_depth` |

### GA4 tags

One GA4 Event tag per trigger. Recommended names and parameters:

| Tag | Event name | Parameters |
| --- | --- | --- |
| GA4 — Phone Click | `generate_lead` | `method: phone`, `cta_id`, `value: 0` |
| GA4 — Form Submit | `generate_lead` | `method: form`, `form_location`, `service` |
| GA4 — Form Start | `form_start` | `form_location` |
| GA4 — CTA Click | `select_content` | `cta_id`, `destination` |
| GA4 — Scroll | `scroll_depth` | `depth` |

Mark `generate_lead` as a **key event** in GA4 → Admin → Events.

### Google Ads conversion tags

Create two conversion actions in Google Ads (Goals → Conversions → New):

| Conversion action | Category | Count | Primary? |
| --- | --- | --- | --- |
| Veneers — Form Lead | Submit lead form | **One** | Primary |
| Veneers — Phone Click | Contact | **One** | Primary |

Then add a Google Ads Conversion Tracking tag in GTM for each, on the matching
trigger.

> **Count = One, not Every.** A veneers prospect will often tap the number twice
> or fill in both forms. "Every" inflates conversions and teaches Smart Bidding
> the wrong thing.

### Conversion values

For a service at $2,000–$3,000 per tooth, unvalued conversions leave Smart Bidding
guessing. Even rough values help enormously. Set a static value per conversion
action based on your own lead-to-case economics, or feed real values via offline
import (section 5) — which is strictly better.

---

## 4. Calls: click-tracking is not call-tracking

The `phone_call_click` event tells you someone **tapped** the number. It does not
tell you they connected, or for how long. For a practice where one veneers case is
worth five figures, close that gap:

**Option A — Google Ads call reporting (free).**
Google Ads → Assets → Call. Enable a Google forwarding number, and turn on
"Calls from website" so the forwarding number is swapped into the page for ad
traffic. You can then count a conversion only when a call exceeds a duration you
choose (60 seconds is a sensible floor for a genuine veneers enquiry).

**Option B — a call-tracking platform** (CallRail, WhatConverts, CallTrackingMetrics).
Dynamic number insertion keeps keyword-level attribution, records calls, and lets
you mark which calls were real consultation requests. For a high-ticket cosmetic
practice this usually pays for itself quickly, and it is what lets you distinguish
"booked a veneers consult" from "asked about parking".

Either way, keep the `phone_call_click` event as your fast feedback signal and
treat verified calls as the source of truth.

---

## 5. Offline conversion import — the highest-value piece

The page already captures `gclid`, `wbraid`, `gbraid` and all UTM parameters on
landing, persists them for the session, and attaches them to every lead payload
under `attribution`.

**Make sure your form handler stores that `gclid` alongside the lead.**

That single field lets you later upload back to Google Ads:

- Consultation booked → value $X
- Consultation attended → value $Y
- Veneers case closed → **actual case value**

Smart Bidding then optimises toward clicks that produce *cases*, not clicks that
produce form fills. On a $2,000–$3,000-per-tooth service this is the difference
between a campaign that buys leads and one that buys revenue.

Google Ads → Goals → Conversions → Import → "Conversions from clicks", uploaded
via CSV, Google Sheets, or the API.

---

## 6. Enhanced conversions for leads

The form collects name, email and phone — everything enhanced conversions needs.

1. Google Ads → Conversions → Veneers — Form Lead → turn on enhanced conversions,
   accept the terms, choose Google Tag Manager.
2. In GTM, add user-provided data to the conversion tag, mapping email and phone
   from the form.
3. Data is hashed with SHA-256 in the browser before transmission; raw values
   never leave the visitor's device.

This recovers conversions lost to cookie restrictions and typically lifts measured
conversion volume by a meaningful margin on iOS traffic.

---

## 7. Consent Mode v2

If you advertise to anyone in the EEA/UK, Consent Mode v2 is mandatory for
personalised remarketing and accurate modelling. Even if you only target Orange
County it is good hygiene. Configure it in GTM before the tags fire, and set
`ads_data_redaction` appropriately.

---

## 8. Page speed — protecting Ads Quality Score

Landing page experience feeds Quality Score, which feeds CPC. What the page does:

- No JavaScript framework. One stylesheet, one deferred script, no runtime deps.
- Two font families, four weights, `preconnect` + `display=swap`.
- Every image below the fold is `loading="lazy" decoding="async"`; the hero is
  `fetchpriority="high"`.
- Every `<img>` carries explicit `width`/`height`, so Cumulative Layout Shift
  stays near zero.
- The Instagram feed request is deferred until the section approaches the viewport.
- Reviews and Instagram render as native DOM, not third-party iframes.

**Two things to do at deploy:**

1. **Self-host the two fonts** (or subset them) to drop the two extra DNS/TLS
   round-trips to `fonts.googleapis.com` and `fonts.gstatic.com`.
2. **Export the real photography as WebP or AVIF** at roughly 2× display size, and
   compress. Photography is the entire page weight on a page like this — the code
   is negligible by comparison.

Re-run PageSpeed Insights on mobile after the real images are in. That is the
number that matters; placeholder SVGs will flatter you.

---

## 9. Pre-launch checklist

- [ ] `GTM-XXXXXXX` replaced in both places in `index.html`
- [ ] `formEndpoint` set, and a real test lead received end-to-end
- [ ] Test lead's stored record contains the `gclid`
- [ ] GTM Preview shows all six event types firing correctly
- [ ] Google Ads shows both conversion actions as "Recording conversions"
- [ ] Both conversion actions set to **Count: One**
- [ ] Call reporting or a call-tracking platform live
- [ ] Enhanced conversions enabled and validating
- [ ] Real photography swapped in, exported as WebP/AVIF
- [ ] Mobile PageSpeed re-checked with real images
- [ ] Click-to-call verified on a physical iPhone and Android device
- [ ] Form tested with a screen reader / keyboard only
