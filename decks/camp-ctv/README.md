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
- **Palette** built from the CAMP logo's two brand tones — forest green
  `0F8140` and lime `A9C63C` (`BRAND_GREEN` / `BRAND_LIME` at the top of
  `build.js`). Supporting values: deep green `06301A` and panel `0B4526` for dark
  slides, `EEF5E4` / `F4F7F2` surfaces, ink `0D1F14`, body `555F57`. Lime is the
  sharp accent only — key figures, emphasis runs, the CTA band, page numbers on
  dark. Green carries structure.
- **Type** Arial throughout — 27 pt bold titles (33 pt cover), 13 pt bold card headings,
  10.5 pt body, 8 pt letterspaced footer.
- **Structure** dark cover and dark proof/CTA slides sandwich light content slides.
- **Motif** rounded cards with hairline borders; green statement band closes the
  argument slides; circular line-icon chips carry the process figures.
- **Footer** wordmark bottom-left, zero-padded page number bottom-right.

## Logo

`wordmark()` in `build.js` sets the lockup typographically in the brand's two-tone
arrangement — CAMP with the A in lime, DIGITAL letterspaced in lime — because the
official artwork was not available as a file to the build environment
(campdigital.com is blocked by the egress policy).

To drop in the real logo, save it as `assets/logo-dark.png` and
`assets/logo-light.png` and replace the `wordmark()` body with:

```js
s.addImage({ path: `${P}/assets/logo-${dark ? "dark" : "light"}.png`,
             x, y: y - size / 90, h: size / 26, w: (size / 26) * ASPECT });
```

Every call site — the cover, slide 7, slide 12, and the shared `footer()` — already
reserves horizontal space, so no layout changes are needed.

## Rebuilding

```bash
npm install pptxgenjs sharp react react-dom react-icons
node icons.js      # writes ico/
node build.js      # writes camp-ctv-redesigned.pptx
```
