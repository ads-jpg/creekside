# Snackify: Abandoned Checkout email (2026 refresh)

This is a rebuild of the abandoned checkout flow email, based on the Snackify brand sheet. It has a dynamic cart block and a new hero image in the brand colors.

![Preview](preview.png)

## Files

| File | What it is |
| --- | --- |
| `abandoned-checkout.html` | Klaviyo code template. Image URLs are placeholder tokens (`__HERO_URL__` and similar) that `push_to_klaviyo.py` fills in. |
| `images/` | Hero (1200×720, shown at 600×360), logos in green and white, and a fallback product tile. |
| `preview.html`, `preview.png`, `preview-mobile.png` | Template rendered with a sample 3-item cart. |
| `push_to_klaviyo.py` | Uploads the images and creates the template through the Klaviyo API. It doesn't change the live flow. |
| `source/` | Hero image source (`hero.html`), the preview builder and the renderer. |

## Dynamic product block

The template uses Shopify's **Started Checkout** event data, so the flow must be triggered by that metric:

- Loops over `event.extra.line_items`, showing each item's image (`item.product.images.0.src`), title, variant (hidden when it's "Default Title"), quantity and line price.
- If an item has no image, it shows the Snackify fallback tile.
- The subtotal comes from `event|lookup:'$value'`.
- Every button, image and product row links to `event.extra.responsive_checkout_url`.
- The greeting uses `person.first_name`, with "there" as the fallback.

## Brand mapping

- **Colors:** lime `#AEDE1D` header (logo variation 1) and green `#008059` CTA, hero and footer (logo variation 2). Headlines are `#2A2A2A`, body text is `#4B5058` / `#58595B` and dividers are the green 20% tint `#CCE6DE`. The mint tint `#E4F6ED` is the reassurance-strip background, and the secondary and accent colors (`#4DD0BA`, `#FF8075`, `#F1AF40`, `#77D3A6`) are used for the illustration and bullet dots.
- **Fonts:** headings use Museo Slab and body/buttons use Proxima Nova, as the brand sheet specifies. Neither is a free web font, so the template falls back to Roboto Slab and Montserrat (Google Fonts) and then to Rockwell/Georgia and Helvetica/Arial. The hero image uses Roboto Slab and Montserrat.

## Publishing

```bash
KLAVIYO_API_KEY=pk_xxx python3 push_to_klaviyo.py   # add --dry-run to test without a key
```

The API key needs **Images: write** and **Templates: write**. After the template is created:

1. Send a preview in Klaviyo against a profile with a real Started Checkout event.
2. Open the Abandoned Checkout flow, edit the email, and select the new template.

## Rebuilding previews and the hero image

```bash
pip install jinja2 && npm i playwright
python3 source/build_preview.py && node source/render.js
```
