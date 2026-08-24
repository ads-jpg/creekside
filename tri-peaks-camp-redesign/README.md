# Tri Peaks Pitch — CAMP OTT design match

`Tri_Peaks_Pitch_Test_CAMP_Design.pptx` is the Tri Peaks Pitch Test deck restyled to the
CAMP – OTT Slides design system. **Content is unchanged** (all 177 text runs verified
identical to the source); only colour, type and component styling were replaced. Neither
source deck was modified.

## Colour theme (taken verbatim from the CAMP deck)

| Role | Hex |
|---|---|
| Deep forest — dark panels, table headers, headings | `003726` |
| Lime — eyebrow pills, card borders, takeaway banners | `A7C142` |
| Bright green — stats, emphasis | `00823D` |
| Mid green — secondary panels on dark | `006A49` |
| Gray — slide titles and body copy | `666666` |
| Muted gray — captions, footers | `888888` |
| Mint tint — highlighted cards | `E5F7F2` |
| Light mint — text/rules on dark | `B2E5D5` |

Type follows CAMP: Arial throughout (Calibri removed), with Inter kept where the CAMP deck
also uses it.

## Component mapping applied

* Blue eyebrow text → lime rounded pill with white 7pt bold caps (CAMP signature).
* Slate/navy slide titles → `666666`; card headings → `003726`.
* `F8FAFC` cards → white with `A7C142` 0.75pt border.
* Blue-tinted cards → `E5F7F2` mint tint.
* Navy panels and table headers → `003726` with white text and lime labels.
* Blue callout bars and CTA blocks → `A7C142` banners with `003726` text.

## Rebuilding

```
python3 build.py     # reads ./trix (unpacked source), writes the styled .pptx
```

`restyle.py` holds the palette maps and the geometry-aware recolouring pass
(fills, outlines, table cells, on-dark and on-lime text contrast rules, pill builder).
