# BlushCam email campaigns

Five HTML emails for blushcamera.com. They're built with tables and inline styles at 600px wide, they stack on mobile, and the images load from BlushCam's Shopify CDN.

| # | File | Subject line | Preview text |
|---|------|--------------|--------------|
| 1 | `01-free-strap-launch.html` | Two cams. One free strap. | Buy any 2 Blush Digicams and your beaded camera strap is on us. |
| 2 | `02-free-strap-bestie-pair.html` | Matching cams for you + your bestie | Pick two Blush Digicams and get a free beaded strap. Gift one, keep one. |
| 3 | `03-free-strap-last-chance.html` | Last chance: your free strap | Ends tonight: buy 2 Blush Digicams, get a beaded strap free. |
| 4 | `04-black-friday-25-off-launch.html` | Black Friday: 25% off everything | Use code BC25 for 25% off every Blush Digicam, bundle and accessory. |
| 5 | `05-black-friday-25-off-last-call.html` | Last call: 25% off ends tonight | Code BC25 expires at midnight. 25% off every Blush Digicam. |

Screenshots of each email are in `previews/`.

## Before sending
- **Free strap terms:** check that "Buy any 2 cameras" matches how the offer is set up in Shopify (an automatic discount or a free-gift app). The emails call the strap a "$55 value" because that's its compare-at price.
- **Prices:** the Black Friday prices are the site's prices with BC25 applied, as of Nov 19, 2026: Digicam $127.50, Bestie Bundle $240, Creator Pack $160, Travel Kit $176.25, Case $35.25.
- **Reviews:** the three quotes are placeholders. Replace them with real Judge.me reviews.
- **Footer:** it uses Klaviyo tags (`{% unsubscribe_url %}`, `{% manage_preferences_url %}`, `{{ organization.* }}`). If you send from another platform, swap them for that platform's tags.
- **UTM tags:** every link has `utm_source=email&utm_medium=email&utm_campaign=<email>`.

## Editing
Change the copy or images in `build.py`, then run `python3 emails/blushcam/build.py` to rebuild all 5 emails.
