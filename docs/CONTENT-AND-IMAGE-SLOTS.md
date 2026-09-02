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
| `hero-vida.webp` | Hero, right column | **Installed** — portrait of Dr. Vida. See §1a on resolution |
| `ba-1-*.jpg` · `ba-2-*.jpg` (+ `-400w`) | Results gallery | **Installed** — two real cases. See §1b |
| `approach.svg` | "The Vida Difference" | **Still needed** — a close-up of the WORK, see §1c |
| `dr-vida-recognition.jpg` | "Recognized for Excellence" | **Installed** — from the About page |
| `candidacy.svg` | "Am I a candidate?" | Existing consultation or patient-facing photo |

### 1a. The hero portrait — `hero-vida.webp` (installed)

The portrait of Dr. Vida in black scrubs is **in place and rendering**. This is
the only slot currently filled with a real photo.

**One caveat: resolution.** The copy installed is **893 × 696**, which is what
was available. That gives:

| Breakpoint | Displayed | Pixel density |
| --- | --- | --- |
| Mobile | 334 × 284 | **2.45×** — sharp |
| Desktop | 456 × 569 | **1.22×** — acceptable at 1×, soft on Retina |

Mobile is genuinely fine. **Desktop will look slightly soft on a Retina screen**,
because the hero is the largest image on the page and 1.22× is below the ~2×
that keeps a photo crisp there.

**To fix, export the original from the live page at 1200 × 1500 or larger** and
overwrite `veneers/assets/img/hero-vida.webp`. Nothing else changes — same
filename, same markup. Update the `width`/`height` attributes on the `<img>` in
`index.html` to the new dimensions so the layout-shift protection stays accurate.

Export settings: WebP quality 80–85, under ~250 KB, **sRGB not Adobe RGB**
(Adobe RGB renders dull in browsers). This is the Largest Contentful Paint
element, so its weight feeds the Ads landing page experience score.

**How the crop works.** The source is 4:3 landscape and the desktop frame is 4:5
portrait, so `object-fit: cover` keeps the **full height** and the **centred 62%
of the width** — verified: she is fully retained, hair included, and the crop
just trims the hallway. Mobile uses a shorter `4 / 3.4` frame that keeps 92% of
the width.

Two tokens tune the crop without touching component CSS:

```css
--vd-hero-ratio: 4 / 5;      /* taller = more side crop; 4 / 4.4 keeps more width */
--vd-hero-focus: 50% 50%;    /* nudge horizontally if the subject sits off-centre */
```

The credential card floats over the photo's lower edge on desktop (12% overlap)
and sits **below** the photo on mobile, where the shorter frame meant it was
covering her hands.

### 1b. Before/after gallery (installed)

Two real patient cases, supplied by the practice as 2000 × 2000 before|after
composites and split here into halves.

| Files | Case |
| --- | --- |
| `ba-1-before.jpg` · `ba-1-after.jpg` | Man, dark curly hair |
| `ba-2-before.jpg` · `ba-2-after.jpg` | Woman, dark hair |

Each also has a `-400w.jpg` variant; `srcset` serves it to phones. Mobile pulls
179 KB instead of 403 KB for the gallery.

**No cropping was applied.** The halves were split at the composites' own white
gutter (detected at x≈993) and exported at their native 1:2 proportions. The
gallery cell ratio was set to `1 / 2` to match, so `object-fit: cover` has
nothing to trim and the layout cannot cut anyone's smile off. An earlier 4:3
cell would have cropped these portraits to a horizontal band across the eyes.

**A third case was supplied and deliberately not used.** In it — as in the
second, to a lesser degree — the hair, makeup and clothing differ noticeably
between the before and after shots. Prospects reading a page like this notice
when the "after" also has better styling and lighting, and it quietly
undermines the dental result. The first case is the strongest for exactly this
reason: same shirt, same lighting, essentially the same grooming, so the only
thing that changed is the teeth.

> **Captions need your confirmation.** They currently read "Handcrafted
> porcelain veneers by Dr. Vida" and "Ultra-natural veneers, designed to suit
> the face" — descriptions of what the photographs actually show. The earlier
> captions named specific protocols (minimal-prep, upper arch, Invisalign
> first) that **cannot be verified from the images**. On a medical advertising
> page a specific clinical claim about a real identifiable patient needs to be
> accurate, so confirm each case's actual treatment with the practice before
> restoring that wording.

**Consent.** These patients are identifiable and the images carry the
practice's Instagram watermark, so a social release presumably exists. Confirm
it extends to **paid advertising**, which is a separate use.

**Replacing or adding a case.** Supply a 2000 × 2000 composite and I can split
it the same way, or drop in pre-split halves as `ba-N-before.jpg` /
`ba-N-after.jpg` at ~620 px wide plus a 400 px variant. Duplicate a
`<figure class="vd-ba">` block to add a third pair.

### 1c. Two notes on the remaining photo slots

**`approach.svg` — "The Vida Difference".** This section's copy is entirely
about the craft: light reflection, enamel preservation, longevity. It wants a
photo of **the work**, not the practitioner — a close-up of finished veneers
showing translucency and texture, or Dr. Vida chairside mid-treatment. A
portrait does not carry that copy.

The 40 Under 40 photo was considered for this slot and **placed elsewhere
instead**. It communicates accolades, not craftsmanship, so beside copy about
how porcelain reflects light it competed with the message rather than
supporting it. It also introduces a cool white-and-lavender palette plus a busy
magazine cover into an otherwise warm cream-and-gold page. In the new
"Recognized for Excellence" section it does exactly the job it is good at.

**`dr-vida-recognition.jpg` — resolution.** Cropped from a screenshot of the
About page at 880 × 990, which renders at **1.64×** in the 536 px desktop slot.
Mobile is fine at 2.63×; desktop will look slightly soft on a Retina screen.
Export the original from the About page at **1100 × 1240 or larger** and
overwrite the file to fix it — same filename, no markup change.

**When swapping:**

1. Keep the existing `alt` text from the live page. The placeholders carry
   descriptive alt text as a stand-in — replace it with the real one so no
   accessibility or image-SEO value is lost.
2. Keep the `width`/`height` attributes accurate to the real file. They prevent
   layout shift; wrong values are worse than none. The hero is set to
   `893 × 696` — update it when you swap in a higher-resolution export.
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
| `$99 consultation, credited toward treatment` | From the practice's published content |
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
- **The $99 consultation fee.** It appears in the hero offer strip, the form
  section, the pricing section and the FAQ schema. Search for `99` and update
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
