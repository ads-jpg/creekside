# Content & image slots — what to swap in

> **Read this first.** The build environment for this session blocked all
> outbound HTTP to `vidadentistry.com` (and to every other non-allowlisted
> host) at the network proxy. The live page could not be fetched, rendered, or
> screenshotted. The repository is also empty — the site source is not in it.
>
> So the copy below was reconstructed from indexed content of the live pages via
> search, and the photography could not be retrieved at all. **Every factual
> claim on the page traces to the practice's own published content** — nothing
> about results, credentials, pricing, or reviews was invented. But the wording
> is a close reconstruction rather than a byte-exact copy, and the images are
> labelled placeholders.
>
> Give me the page HTML (or unblock the domain) and I will do a fidelity pass to
> restore the exact original strings and image references.

---

## 1. Images — seven slots

All seven are labelled SVG placeholders in `veneers/assets/img/`. Each renders a
caption naming what belongs there, so nothing looks broken while you swap them.

| File | Where | What belongs there |
| --- | --- | --- |
| `hero-vida.jpg` | Hero, right column | **The portrait of Dr. Vida** — see §1a below |
| `ba-1-before.svg` · `ba-1-after.svg` | Results gallery, pair 1 | Existing before/after pair |
| `ba-2-before.svg` · `ba-2-after.svg` | Results gallery, pair 2 | Existing before/after pair |
| `approach.svg` | "The Vida Difference" | Existing technique / close-up / studio photo |
| `candidacy.svg` | "Am I a candidate?" | Existing consultation or patient-facing photo |

### 1a. The hero portrait — `hero-vida.jpg`

The photo identified for this slot is the environmental portrait of Dr. Vida in
black scrubs, smiling, standing in the studio hallway. Roughly 4:3 landscape,
subject centred, bright high-key background.

**Just overwrite `veneers/assets/img/hero-vida.jpg`.** The filename and the
markup do not change, so no code edit is needed.

**Export settings:**

| | |
| --- | --- |
| Dimensions | **1200 × 1500** minimum (the frame renders ~456 px wide on desktop, so this is ~2.6× — sharp on Retina) |
| Format | WebP preferred, JPEG fine. Quality 80–85 |
| Target weight | Under ~250 KB. This is the Largest Contentful Paint element, so it directly moves the Ads landing page experience score |
| Colour | sRGB, not Adobe RGB — Adobe RGB shifts dull in browsers |

**How the crop works.** The frame is portrait (4:5) and the source is landscape
(4:3), so `object-fit: cover` keeps the **full height** and trims to the
**centred ~62% of the width**. Dr. Vida sits centred, so she is retained in full
and the crop removes the empty hallway on either side — which tightens the
composition rather than harming it.

**If the crop is not quite right**, two tokens in `veneers.css` tune it without
touching component CSS:

```css
--vd-hero-ratio: 4 / 5;      /* taller = more side crop; try 4 / 4.4 to keep more width */
--vd-hero-focus: 50% 50%;    /* nudge horizontally, e.g. 54% 50%, if she sits off-centre */
```

Mobile already overrides the ratio to `4 / 3.4`, a shorter frame that keeps the
headline and CTAs higher in the fold.

**Check after swapping** that her hair is not clipped at the right edge on
desktop — that is the one thing most likely to need a nudge.

**When swapping:**

1. Keep the existing `alt` text from the live page. The placeholders carry
   descriptive alt text as a stand-in — replace it with the real one so no
   accessibility or image-SEO value is lost.
2. Keep the `width`/`height` attributes accurate to the real file. They prevent
   layout shift; wrong values are worse than none. The hero is already set to
   `1200 × 1500` — update it if you export at a different size.
3. Keep `loading="lazy" decoding="async"` on everything except the hero, which
   is intentionally `fetchpriority="high"` and not lazy.
4. Export as WebP or AVIF. See `TRACKING-SETUP.md` §8.

The gallery holds two before/after pairs. Add or remove `<figure class="vd-ba">`
blocks to match how many the live page actually has — the grid reflows on its own.

**If more images exist on the live page than there are slots here**, they belong
in the results gallery. That section is the strongest desire driver on a veneers
page and the one place where more real photography reliably helps.

---

## 2. Copy — verification status

| Content | Status |
| --- | --- |
| Practice name, doctor name, credentials | Verified |
| Phone `(949) 209-8889` | Verified |
| Address `25270 Marguerite Pkwy Ste C, Mission Viejo, CA 92692` | Verified |
| Hours: Tue–Fri 9:00am–5:00pm, closed Mon/Sat/Sun | Verified |
| Pricing `$2,000–$3,000 per tooth` | From the practice's published content |
| `$199 consultation, credited toward treatment` | From the practice's published content |
| Longevity `15–20 years or longer` | From the practice's published content |
| Biomimetic / minimal-prep / no-prep positioning | From the practice's published content |
| In-chair removable mock-up preview | From the practice's published content |
| Invisalign-before-veneers approach | From the practice's published content |
| Instagram `@veneergoddess` | Supplied by you |
| **Google star rating and review count** | **Not hard-coded anywhere** — rendered live from the API, or omitted |
| **Individual patient reviews** | **Not hard-coded anywhere** — rendered live from the API, or omitted |

Everything in the second column reads verbatim or near-verbatim from Vida
Dentistry's own site. Confirm the exact phrasing against the live page during the
fidelity pass.

**Please double-check these two before launch:**

- **Pricing.** `$2,000–$3,000 per tooth` appears on the page and in the FAQ
  schema. If it has changed, update both — schema and visible text must agree.
- **The $199 consultation fee.** It appears in the hero offer strip, the form
  section, the pricing section and the FAQ schema. Search for `199` and update
  every instance together.

---

## 3. Geography — one thing worth flagging

Your brief lists **"veneers in Irvine"** as a target keyword, and the practice is
in **Mission Viejo** — about 20 minutes down the 5.

The page handles this honestly: it states Mission Viejo as the location
(visitors need to know where they are driving), while the closing section and the
schema `areaServed` name Irvine, Newport Beach, Laguna Niguel and Orange County as
the service area.

That is the defensible approach. Claiming an Irvine location would be false, would
conflict with the Google Business Profile, and Google cross-references the two.

**If Irvine is a serious volume target**, the right move is a separate
Irvine-specific landing page for that ad group — not diluting this one. Say the
word and I will build it from this same component set.

---

## 4. Headings — SEO preservation

The current outline is:

```
H1  Minimal-Prep Porcelain Veneers
H2  Smile transformations by Dr. Vida
H2  Veneers that reflect light like natural enamel
H2  What your smile transformation looks like
H2  Request your veneers consultation
H2  Am I a candidate?
H2  Reviewed by our patients on Google
H2  Transparent about cost, from the start
H2  Follow the smiles
H2  Veneers questions, answered
H2  Your new smile starts with one conversation
```

One H1, no skipped levels, keyword-relevant without stuffing.

**If the live page's H1 differs, use the live one.** It is the single heading most
likely to carry ranking weight, and there is no CRO gain worth risking it for. The
same applies to any H2 that matches a query the page already ranks for.

`<title>` and `<meta name="description">` were kept close to the existing page for
the same reason. The title is unchanged: `Vida Dentistry | Minimal-Prep Veneers`.

---

## 5. Internal links

These are preserved in the body copy and footer. Confirm the paths match the live
site's routing:

`/` · `/about` · `/vida` · `/blogs` · `/jocelynn-vida-sustaita/` ·
`/services/veneers` · `/services/biomimetic-restorative` · `/services/invisalign` ·
`/services/teeth-whitening-maintenance` · `/services/gum-lifting-surgery` ·
`/services/cosmetic-consultations-teledentistry`

The `/services` breadcrumb entry in the structured data assumes a services index
page exists. If it does not, remove that `ListItem` and renumber.

---

## 6. Things only you can confirm

- [ ] Exact live H1 and section headings
- [ ] Exact live body copy wording
- [ ] Real image files and their original alt text
- [ ] Current pricing and consultation fee
- [ ] Whether a services index page exists at `/services`
- [ ] Whether the site already has a lead-form component to reuse instead of the
      one here — if so, drop it into `.vd-form-card` and keep the surrounding
      layout and tracking hooks
- [ ] Whether existing schema markup on the live page would now be duplicated
- [ ] The practice's Place ID, for the canonical Google review links
