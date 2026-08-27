# What changed, and why

Every element below earns its place against one of three jobs: **reduce friction**,
**build trust**, or **capture the lead**. Nothing was added for decoration.

---

## Above the fold

A visitor arriving from a "porcelain veneers near me" ad decides in a few seconds
whether this is the right kind of practice. The hero answers five questions
without a scroll:

| Question | Answered by |
| --- | --- |
| What is this? | H1 "Minimal-Prep Porcelain Veneers" |
| Is this a veneers specialist, or a general dentist? | Eyebrow "Porcelain & No-Prep Veneers", biomimetic positioning in the sub-headline, the doctor credential card on the image |
| Where are they? | "Mission Viejo, CA" pin, top utility bar |
| Why trust them? | Clickable Google rating badge, named doctor with credentials, enamel-preservation philosophy |
| What do I do next? | Two buttons: **Call to Schedule** and **Book a Veneers Consultation** |

The `$199 consultation, credited toward treatment` offer sits directly under the
buttons. On a $2,000–$3,000-per-tooth service, a credited fee is a
risk-reversal — it makes the next step feel small — so it belongs at the point of
decision, not buried on a pricing page.

Deliberately avoided: stock imagery, a generic "Welcome to our practice" greeting,
and a slider. Sliders bury everything after the first frame and hurt LCP.

---

## Where the CTAs are, and why there

Nine conversion points, each placed at a natural decision moment rather than
sprayed through the copy:

| # | Location | Rationale |
| --- | --- | --- |
| 1 | Sticky header (all scroll depths) | Always-available call + form, never intrusive |
| 2 | Hero | Primary capture for ready-now visitors |
| 3 | After before/after gallery | Peak desire — right after seeing results |
| 4 | After "The Vida Difference" | Belief has just been established |
| 5 | Mid-page form section | Full form at peak intent, after proof and process |
| 6 | After "Am I a candidate?" | Directly answers the doubt that just surfaced |
| 7 | After reviews | Social proof converts into action |
| 8 | After pricing | Price objection handled, financing mentioned |
| 9 | After FAQ + closing form | Last objections cleared |
| — | Sticky mobile bar | Persistent call + form on mobile |

Every one offers **both** a phone option and a form option. Some prospects will
never fill in a form; some will never call. Forcing either loses the other.

**Why it does not read as spammy:** CTAs sit *between* content sections, never
inside a paragraph. The language varies with context ("Find Out If You Qualify"
after candidacy, "Get a personalized veneers quote" after pricing) rather than
repeating "BOOK NOW" nine times. Styling is restrained — one gold primary button,
one outlined secondary.

---

## The sticky mobile bar

Appears only after the hero CTAs scroll out of view, and **hides itself whenever a
form is on screen** so it never covers the fields someone is filling in. That
second behaviour is the difference between a sticky bar that converts and one that
quietly costs you leads.

Desktop does not get one — the sticky header already carries both actions there.

---

## Forms

Three required fields: **name, phone, email.** Plus one optional "what would you
like to change about your smile?" textarea, which doubles as qualification for the
front desk without adding required friction.

Details that matter:

- `type="tel"` and `inputmode` bring up the right mobile keyboards
- 16px input font — anything smaller makes iOS Safari zoom on focus, which feels
  broken and costs completions
- `autocomplete` attributes so browsers can fill in one tap
- Errors appear on blur only *after* a field has already failed — the form never
  scolds someone mid-typing
- A honeypot field catches naive bots without subjecting real patients to a CAPTCHA
- On success the whole card is replaced with a confirmation **plus a call button** —
  someone who just submitted is the most motivated they will ever be
- **The success state and the conversion event only fire after the endpoint
  actually accepts the lead.** A failure shows the phone number instead of a
  false thank-you

Two instances of the same component (mid-page and closing) post to one endpoint and
report a distinct `form_location`, so you can see which position earns its keep.

---

## Trust and social proof

- **Google rating badge**, in the hero and again at the reviews section, clickable
  through to the Business Profile. Renders live API data, never a hard-coded number.
- **Trust bar** under the hero: rating, 15–20+ year longevity, enamel-first
  approach, preview-before-committing. Four claims, all from the practice's own
  material.
- **Reviews section** rendering real Google reviews. Cards are styled as editorial
  pull-quotes rather than a badge graphic, which is what makes it read premium
  instead of like a widget.
- **Instagram** — @veneergoddess is genuine ongoing proof of the doctor's work and
  worth far more here than a testimonial slider.
- **Named doctor with credentials** on the hero image, not an anonymous "our team".
- **Price transparency.** Unusual on cosmetic pages, and it works: it pre-qualifies
  Ads traffic, kills the biggest silent objection, and signals confidence. It also
  reduces wasted consultation slots on prospects who were never in the market at
  this level.

See `GOOGLE-REVIEWS-AND-INSTAGRAM.md` for exactly how far the live integrations go.

---

## Friction removed

The FAQ is positioned late deliberately — it exists to clear the last objections
of someone who is nearly ready, and it covers precisely what a high-intent veneers
prospect searches for next: cost, candidacy, longevity, timeline, whether they can
preview the result, and whether the consultation fee is wasted.

The closing section pairs the form with full NAP, hours and directions, so nobody
has to scroll back up or hunt for a phone number.

---

## SEO safeguards

- `<title>` unchanged; meta description preserved in intent
- One H1, no skipped heading levels
- All internal links preserved, plus contextual links to Invisalign and
  biomimetic restorative pages
- `Dentist` + `WebPage` + `BreadcrumbList` + `FAQPage` structured data added,
  with the FAQ schema matching the visible FAQ question for question (validated)
- **No `aggregateRating`** — self-serving review markup is a policy violation and
  would risk the whole domain. Reasoning in `GOOGLE-REVIEWS-AND-INSTAGRAM.md`
- Semantic landmarks, real `<address>`, skip link, labelled fields
- Content preserved rather than rewritten; structure and hierarchy changed around it

---

## Performance

No framework, no jQuery, no third-party widget runtime. One stylesheet, one
deferred script. The Instagram request is lazy. Reviews and Instagram render as
native DOM rather than iframes.

Remaining work is photography: export the real images as WebP/AVIF before launch.
On a page like this the images are essentially the entire payload.

---

## What was intentionally NOT done

- **No countdown timers, exit-intent popups, or "3 slots left" urgency.** They
  convert on cheap offers and repel patients considering a five-figure cosmetic
  case. They would also undercut the premium positioning the brief asks for.
- **No live-chat widget.** Adds weight and, unstaffed, actively loses leads.
- **No fabricated testimonials, ratings, review counts, or Instagram images.**
  Where an integration is not yet configured, the section degrades to a genuine
  link rather than inventing content.
- **No page rewrite.** The practice's own messaging — biomimetic philosophy,
  enamel preservation, the in-chair preview, ultra-natural results — is the
  foundation. Structure, hierarchy and conversion paths changed around it.
