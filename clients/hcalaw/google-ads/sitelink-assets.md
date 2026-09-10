# Sitelink Assets - criminal defense build

18 sitelinks in 4 sets. **Limits:** text 25 chars, each description line 35 chars,
2 minimum to serve, 4+ recommended, 20 maximum per level.

## The rule that disapproves the most sitelinks

**Two sitelinks in the same set may not point to the same page.** Not the same page with a
different anchor, not the same page with a tracking parameter - a genuinely different
destination. When a firm doesn't have enough pages, the usual improvisation is to aim three or
four sitelinks at the homepage, and Google disapproves the whole set.

Only **3 of 18** URLs below point at a page verified to exist. The rest are proposed slugs -
confirm or build them before upload. hcalaw.net was blocked by this environment's network
policy, so the slugs are proposals, not observations.

## What you can launch today

| Sitelink | Destination | Status |
|---|---|---|
| **Our Attorneys** | `/james-l-allard-jr-buddy/` | confirmed |
| **DMV Hearings** | `/dmv-hearings/` | confirmed |
| **Free Case Review** | `/contact/` | assumed |
| **About the Firm** | `/about/` | assumed |

## The sitelinks

Set the first group at account level so every campaign inherits it, then attach each practice
group at campaign level. An ad shows between two and six, chosen per auction.

### Account level
_Inherited by every campaign - 6 sitelinks_

| Text | Chars | Description 1 | Description 2 | URL | Status |
|------|-------|---------------|---------------|-----|--------|
| **About the Firm** | 14/25 | Defending clients since 1982. | Local courts, local experience. | `/about/` | assumed |
| **Our Attorneys** | 13/25 | Meet the attorney who will | handle your case personally. | `/james-l-allard-jr-buddy/` | confirmed |
| **Practice Areas** | 14/25 | See the charges we defend in | state and federal court. | `/practice-areas/` | assumed |
| **Free Case Review** | 16/25 | Talk through your charge with | an attorney. No obligation. | `/contact/` | assumed |
| **Client Reviews** | 14/25 | Read what past clients say | about working with the firm. | `/reviews/` | assumed |
| **Office & Directions** | 19/25 | Downtown location near the | courthouse. Parking on site. | `/location/` | assumed |

### DWI / DUI
_Campaign level - 4 sitelinks_

| Text | Chars | Description 1 | Description 2 | URL | Status |
|------|-------|---------------|---------------|-----|--------|
| **DWI Defense** | 11/25 | Breath tests, blood tests, and | license consequences. | `/dwi-defense/` | assumed |
| **First-Offense DWI** | 17/25 | What to expect if this is | your first charge. | `/dwi-defense/first-offense/` | assumed |
| **DMV Hearings** | 12/25 | Your license case is separate | from the criminal charge. | `/dmv-hearings/` | confirmed |
| **License Restoration** | 19/25 | Steps to get your driving | privileges back. | `/license-restoration/` | assumed |

### Criminal Defense
_Campaign level - 4 sitelinks_

| Text | Chars | Description 1 | Description 2 | URL | Status |
|------|-------|---------------|---------------|-----|--------|
| **Criminal Defense** | 16/25 | Felony and misdemeanor | representation in local courts. | `/criminal-defense/` | assumed |
| **Felony Charges** | 14/25 | What a felony charge means | and what comes next. | `/felony-defense/` | assumed |
| **Drug Charges** | 12/25 | Possession and related | charges in state court. | `/drug-charges/` | assumed |
| **Federal Court Cases** | 19/25 | Admitted to practice in | federal district court. | `/federal-defense/` | assumed |

### Traffic & License
_Campaign level - 4 sitelinks_

| Text | Chars | Description 1 | Description 2 | URL | Status |
|------|-------|---------------|---------------|-----|--------|
| **Traffic Tickets** | 15/25 | A ticket can cost more than | the fine. Know your options. | `/traffic-tickets/` | assumed |
| **Reckless Driving** | 16/25 | A misdemeanor in NC, not a | simple traffic citation. | `/reckless-driving/` | assumed |
| **Speeding Citations** | 18/25 | Points, insurance, and your | driving record. | `/speeding-tickets/` | assumed |
| **DMV Hearings** | 12/25 | Revoked license? You can | request a hearing. | `/dmv-hearings/` | confirmed |

## Pages the site needs

Ranked by what each unlocks. A dedicated page per practice area also improves Quality Score on
the matching ad group, so this work pays twice - the sitelink is the smaller return.

| Page | Unlocks | Priority |
|---|---|---|
| `/dwi-defense/` | Two DWI sitelinks + a real landing page for the highest-value campaign | **First.** DWI is half the budget and currently has nowhere better than the homepage. |
| `/criminal-defense/` | General defense sitelink and landing page | Second. Anchors the broadest campaign. |
| `/traffic-tickets/` | Traffic sitelink and landing page | Third. Cheap clicks deserve a cheap page, but not the homepage. |
| `/contact/` `/about/` | Two account-level sitelinks | Almost certainly exist. Confirm the slugs. |
| `/reviews/` | The reviews sitelink | Optional. Only if there are reviews to show. |

## Getting them wrong

- **Several sitelinks to the homepage** - the most common disapproval. If the pages don't exist,
  run fewer sitelinks; two real ones beat six that get the set rejected.
- **A sitelink matching the ad's own final URL** - not disapproved, but wasted.
- **Off-domain destinations** - a directory profile, review site, or social page will be rejected.
- **One description line filled, the other blank** - descriptions render as a pair or not at all.
- **Calls to action as link text** - "Call Now" wastes the slot. Name the destination.
- **Pages that 404 or redirect** - rechecked periodically; a slug changed in a site update silently kills the sitelink.

Run `python3 sitelinks.py` to check field limits, per-set destination uniqueness, and flagged terms.
