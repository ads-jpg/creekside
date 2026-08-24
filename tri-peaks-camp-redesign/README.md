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

## Slide-specific work

**Slide 2 — cycle redrawn natively.** The three-stage cycle was a flat JPEG, so its labels
could not be selected, searched or recoloured, and it stayed gray-and-teal through the
restyle. The same circular composition is now real PowerPoint shapes: three nodes on a
triangle, each a white circle with a lime outline, a lime dotted ring, an outline icon
(diamond / hexagon / triangle), a forest heading and a gray caption — joined clockwise by
forest `arc` shapes with arrowheads and lime/green accent dots riding the arcs and rings.
The two text blocks sit to the right as a lime takeaway banner and a bordered card. Every
label is unchanged wording, including the six lifted out of the JPEG. `image1.jpg` and its
relationship are dropped, and the slide now points at `slideLayout12` (the clean layout the
rest of the deck uses; `slideLayout13` carried a stray rule along the bottom edge).
See `slide2.py` — geometry is driven by `R` / `RING` / `INNER` / `GAP`.

**Slide 6 — DEVICE SCOPE.** `Cross Device` replaced with `42+ inch TV Screens`. The card's
caption (`CTV-led, cross-screen`) is untouched. Slide 7's own `Cross Device` cell is untouched.

## Rebuilding

```
python3 build.py     # reads ./trix (unpacked source), writes the styled .pptx
```

`slide2.py` generates the rebuilt slide 2. `restyle.py` holds the palette maps and the geometry-aware recolouring pass
(fills, outlines, table cells, on-dark and on-lime text contrast rules, pill builder).
