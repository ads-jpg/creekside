# Google Ads Structured Snippets - Hewlett, Collins & Allard, L.L.P.

**Client:** hcalaw.net | **Location:** Wilmington, NC | **Practice:** Criminal defense
**Companion to:** `callout-extensions.md` (43 callout assets)

## Specs

- **25 characters** max per value
- **3-10 values** per header; below 3 the header will not serve
- **2 headers** recommended per campaign; only one shows in a given ad
- The header is chosen from Google's fixed list of 13 - it is not free text

## Step 1 - Pick the header

Only two of the thirteen English headers fit a law firm:

| Header | Verdict | Why |
|--------|---------|-----|
| `Types` | **PRIMARY** | Case types. Reads as the list of charges the firm defends. |
| `Service catalog` | **SECONDARY** | Services offered. Use as the account-level fallback. |
| `Neighborhoods` | Avoid | Honest values are towns and counties, not neighborhoods. The mismatch invites disapproval; use location assets and geo callouts instead. |

Ruled out as other verticals: Amenities, Brands, Courses, Degree programs, Destinations,
Featured hotels, Insurance coverage, Models, Shows, Styles.

## Step 2 - The values

### Types
_Primary — case types - 9 values_

| # | Value | Chars | Verify |
|---|-------|-------|--------|
| 1 | `DWI & DUI` | 9/25 |  |
| 2 | `Drug Charges` | 12/25 |  |
| 3 | `Felonies` | 8/25 |  |
| 4 | `Misdemeanors` | 12/25 |  |
| 5 | `Traffic Violations` | 18/25 |  |
| 6 | `Federal Charges` | 15/25 |  |
| 7 | `Assault Charges` | 15/25 |  |
| 8 | `Probation Violations` | 20/25 | YES |
| 9 | `Underage Drinking` | 17/25 | YES |

### Service catalog
_Secondary — services offered - 8 values_

| # | Value | Chars | Verify |
|---|-------|-------|--------|
| 1 | `Criminal Defense` | 16/25 |  |
| 2 | `DWI & DUI Defense` | 17/25 |  |
| 3 | `Drug Crime Defense` | 18/25 |  |
| 4 | `Traffic Ticket Defense` | 22/25 |  |
| 5 | `DMV Hearings` | 12/25 |  |
| 6 | `Misdemeanor Defense` | 19/25 |  |
| 7 | `Federal Criminal Defense` | 24/25 |  |
| 8 | `Jury Trial Representation` | 25/25 |  |

## Step 3 - Where to set them

| Level | What goes there | Why |
|-------|-----------------|-----|
| **Account** | `Service catalog`, all 8 values | Safety net so every campaign has a snippet, including ones built later. |
| **Campaign** | `Types`, all 10 values | The primary. True of the whole criminal-defense campaign. |
| **Ad group** | `Types`, the 3-5 matching the keywords | Relevance beats volume. In the DWI ad group lead with DWI & DUI, Underage Drinking, Misdemeanors. |

An ad-group list **overrides** the campaign list rather than adding to it, so never set fewer
than three values at ad-group level - a two-value override silently stops snippets serving there.

## Verify before launch

- **`Probation Violations`** - standard criminal-defense work, but not named in the firm's directory listings.
- **`Underage Drinking`** - plausible near a university town and pairs with the DWI ad group. Confirm.

## What breaks a snippet

- **`Free Consultation`** - a benefit, not a category member. Wrong-fit values disapprove the whole snippet. Keep it in the callouts.
- **`Sex Crimes`** - pulled from the Types list. Google's sexual-content policy flags the term
  regardless of defense framing, and a disapproval takes the whole header down. Keep it on the website.
- **`Call Us Today`** - snippets are not clickable and take no CTAs.
- **`Aggressive Defense`** - an adjective, not a list item.
- **`DWI Specialist`** - NC Rule 7.4 restricts specialist claims to NC State Bar certified lawyers.
- **Fewer than 3 values** - the header will not serve.

## Why this is the safest asset type for a law firm

NC Rule 7.4 expressly permits a lawyer to communicate the fields of law in which they practice;
it restricts only "specialist" and its equivalents. A `Types` snippet is nothing but a list of
practice fields, so there is nothing in it to substantiate. Keep values as plain category nouns.

## Deconfliction

Callouts and structured snippets can serve in the same ad, so values were checked against all 43
callouts. Two Service catalog values were changed to clear collisions: `Drug Charge Defense`
became `Drug Crime Defense`, and `License Restoration` was dropped for `Misdemeanor Defense`
(it near-matched the `License Restoration Help` callout). Re-run `verify_snippet_values.py` after any edit.

