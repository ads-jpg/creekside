# Financing

Financing is the answer to the single biggest silent objection on a
$2,000–$3,000-per-tooth page. It appears in seven places, weighted so it
reassures without turning the page into a promotion.

## Where it appears, and why there

| Placement | What it says | Why |
| --- | --- | --- |
| **Hero**, one line under the CTAs | "0% APR plans available — check your options without affecting your credit score" | Cost anxiety starts at the fold, so the answer is offered at the fold |
| **Process section** | "monthly payment plans from 0% APR" | Replaces a vaguer "customized financing options" that was already there |
| **Mid-page form list** | "0% APR financing available — checking what you qualify for will not affect your credit score" | Removes the last hesitation at the point of the ask |
| **Pricing section** | Names all four partners, links to the detail | The price is stated here; the answer belongs here |
| **Pricing CTA band** | "monthly payment plans are available from 0% APR" | Reassurance at the button |
| **`#financing` section** | The full case | Directly after pricing |
| **FAQ** | Dedicated question, in the schema too | Where people look for it |
| **Closing block** | "Ask us about monthly payment plans" | Last reassurance before the final form |

The dedicated section sits **immediately after the pricing section**, not at the
bottom. A visitor who has just read "$2,000 to $3,000 per tooth" is exactly the
person who needs the next screen to be about affordability.

Nothing was removed to make room. The three existing financing mentions were
already on the page and were made specific rather than replaced.

## Before this goes live

**1. Replace the links with practice-specific application URLs.**

Five links currently point at each provider's public site:

```
#financing  →  "Check My Options" button
            →  Cherry / CareCredit / Alphaeon Credit / Proceed Finance cards
```

A generic provider link **does not attribute the application back to Vida
Dentistry**. Swap in the practice's own application URLs from each provider's
portal. This is the single most important thing to fix here.

**2. Point the QR code and the Cherry button at the same place.**

The supplied QR could not be decoded (the logo overlay in the centre defeats
automated readers), so its destination is unverified. It presumably encodes the
practice's Cherry application link. Confirm it, and make the "Check My Options"
button match — a QR and a button that lead to different places is confusing and
splits the attribution.

**3. Confirm the partner descriptors.**

Cherry and Proceed Finance carry specific terms you supplied. CareCredit and
Alphaeon Credit carry only category descriptions ("Healthcare financing",
"Aesthetic care financing") because no terms were provided for them. If you want
specifics there, send them and they can be added.

## Compliance

**The disclosure at the foot of the section is Cherry's required text** and is
reproduced verbatim from their talking-points material:

> Payment options through Cherry Technologies, Inc. are issued by the following
> lending partners: withcherry.com/lending-partners. Term length, loan amount,
> 0% APR, and other promotional rates subject to eligibility. See
> withcherry.com/terms for details.

**Do not remove it.** A general "subject to credit approval, terms vary by
provider and applicant" line follows it, covering the other three partners.

Every rate claim on the page is qualified:

- "0% APR" always appears with "for qualified applicants" or "subject to
  eligibility" nearby
- "Up to 24 months" and "up to 12 years" are stated as ceilings, not offers
- "No credit impact" is stated as what it is — a soft credit check

The wording follows Cherry's own approved phrasing, including their point that
theirs is a **true 0% APR rather than deferred interest**. That distinction is
worth keeping: it is a real difference, and it is stated about Cherry only,
without characterising the other providers.

Financing advertising is regulated under the Truth in Lending Act and
Regulation Z. If the practice's counsel wants different wording, the copy is
in one section plus the eight short cues listed above.

## Tracking

Six new events fire through the existing `vd_conversion_action` dataLayer push:

| `cta_id` | Fires on |
| --- | --- |
| `hero-financing` | Hero cue link |
| `investment-financing` | Partner link in the pricing copy |
| `closing-financing` | Closing block cue |
| `financing-check-options` | **The main financing CTA — worth a conversion action in Google Ads** |
| `financing-call` | Phone button inside the financing section |
| `financing-cherry` / `financing-carecredit` / `financing-alphaeon` / `financing-proceed` | Individual partner cards |

`financing-check-options` is the one to watch. Treat it as a secondary
conversion in Google Ads: someone checking their financing options is a strong
intent signal short of a booked consult, and it is a good audience to build
remarketing on.

## The QR code

It is **desktop-only**, hidden below 900px. A QR code is useless to someone
already holding the phone it would open on, and on a page where the majority of
Ads traffic is mobile it would be clutter for most visitors. On desktop it earns
its place: it lets someone at a laptop continue the application on their phone,
which is where Cherry's flow works best.

If you would rather not show it at all, delete the `<figure class="vd-fin-qr">`
block — nothing else depends on it. The QR is better suited to printed in-office
material, where it has no competition from a clickable button.
