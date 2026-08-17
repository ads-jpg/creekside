# CAMP Digital — Enterprise CTV deck (design refresh)

`camp-ctv-redesigned.pptx` is a design-only rebuild of the Enterprise TV Advertising
pitch deck. All copy, slide count, and slide order are unchanged from the source deck;
only layout, typography, colour, and hierarchy were reworked.

## Files

| File | Purpose |
|---|---|
| `camp-ctv-redesigned.pptx` | The deck |
| `build.js` | pptxgenjs generator — rebuild with `node build.js` |
| `icons.js` | Renders the line-icon set to `ico/` from react-icons |
| `assets/` | Photography and the flywheel figure, extracted from the source deck |

## Design system

- **Canvas** 13.333 × 7.5 in, 0.8 in page margins on every slide.
- **Palette** deep green `052C21` / `0A3A2C` (dark slides), CAMP green `006A49`,
  mint `7FDCBB` and `B2E5D5` (accents on dark), `EDF7F3` / `F3F7F5` surfaces,
  ink `0E1F1A`, body `56645F`.
- **Type** Arial throughout — 27 pt bold titles (33 pt cover), 13 pt bold card headings,
  10.5 pt body, 8 pt letterspaced footer.
- **Structure** dark cover and dark proof/CTA slides sandwich light content slides.
- **Motif** rounded cards with hairline borders; green statement band closes the
  argument slides; circular line-icon chips carry the process figures.
- **Footer** wordmark bottom-left, zero-padded page number bottom-right.

## Logo

The wordmark is set typographically in `wordmark()` in `build.js` (CAMP bold +
DIGITAL letterspaced) because campdigital.com was unreachable from the build
environment. To drop in the official logo, replace the `wordmark()` body with an
`addImage()` call — the call sites on the cover, slide 7, slide 12, and the shared
`footer()` already reserve the space.

## Rebuilding

```bash
npm install pptxgenjs sharp react react-dom react-icons
node icons.js      # writes ico/
node build.js      # writes camp-ctv-redesigned.pptx
```
