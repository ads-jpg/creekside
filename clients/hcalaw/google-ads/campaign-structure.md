# Google Ads Campaign Structure - Hewlett, Collins & Allard, L.L.P.

**Client:** hcalaw.net | **Location:** Wilmington, NC | **Practice:** Criminal defense
**Companion to:** `callout-extensions.md`, `structured-snippets.md`

## The rule that decides everything

Split into a separate campaign only when you need separate **budget**, **geography**, or
**schedule**. Everything else - relevance, ad copy, landing pages, keyword themes - is an
ad group's job. Every campaign added divides the same money into a smaller pot that takes
longer to learn.

| Level | Controls |
|-------|----------|
| **Campaign** | Budget, bidding strategy, geo, ad schedule, networks, language |
| **Ad group** | Keyword theme, ad copy, landing page, snippet override |

Traffic tickets are the clearest case for a split: they convert at a few dollars a click
while DWI runs $20-45 in this market. In a shared budget the cheap clicks win the auction
and DWI starves. The difference in click economics - not the fact that they are different
practice areas - is what earns traffic its own campaign.

## How many campaigns the budget supports

A campaign needs roughly 15-30 conversions/month before automated bidding has anything to
learn from.

| Monthly budget | Campaigns | What runs | Reasoning |
|---|---|---|---|
| Under $1,500 | 1 | Drunk Driving only | 35-70 clicks total. Split two ways, neither optimizes. |
| **$1,500-$3,500** | **2** | **Drunk Driving, Felony Criminal Defense** | **The two verticals. Realistic start for a firm this size.** |
| $3,500-$7,000 | 3 | + General Criminal Defense | The optional third vertical, for intent the two specific ones miss. |
| $7,000+ | 4 | + Brand protection | Also unlock the Federal ad group. |

Wilmington is a small market, so CPCs sit below the $75-200 seen for DWI in large metros.
Confirm against Keyword Planner for the live geo before committing a budget.

## The structure (two verticals)

Restructured from three verticals to two on client feedback, matching how the main local
competitor splits their account. Traffic & License is **held, not deleted** - its keywords,
callouts and sitelinks stay in this repo and can be switched on later.

### Campaign 1 - Drunk Driving Defense (55% of budget)
Highest volume and the firm's deepest proof: 2,000+ DWI cases. Named "drunk driving" to match
how the competitor frames it and how a share of searchers actually type it.

| Ad group | Keyword themes |
|---|---|
| Drunk Driving Defense | "drunk driving lawyer", "drunk driving attorney" |
| DWI Attorney | `[dwi lawyer wilmington nc]`, `[dwi attorney wilmington]`, "dwi lawyer near me" |
| DUI Attorney | `[dui lawyer wilmington nc]`, "dui attorney near me" |
| First Offense | "first offense dwi lawyer", "first time dui attorney" |
| Repeat & Felony DWI | "second dwi lawyer", "felony dwi attorney", "habitual dwi nc" |
| DMV Hearings | "dmv hearing attorney nc", "license restoration lawyer" -> /dmv-hearings/ |

### Campaign 2 - Felony Criminal Defense (45% of budget)
Higher case value, lower volume. The competitor runs this as its own vertical, and the
"complex cases" framing is where 40+ years beats their 19.

| Ad group | Keyword themes |
|---|---|
| Felony Defense | "felony lawyer wilmington nc", "felony attorney near me", "felony defense lawyer" |
| Criminal Defense | `[criminal defense attorney wilmington nc]`, `[criminal lawyer wilmington nc]` |
| Drug Charges | "drug possession lawyer wilmington", "drug charge attorney" |
| Assault & Violent | "assault charge lawyer nc", "assault attorney wilmington" |
| _Federal Defense_ | _Phase 2 - real credential (E.D.N.C.) but thin volume_ |

### Optional third - General Criminal Defense
Only at $3,500+/mo. Catches misdemeanor and general "criminal lawyer" intent that the two
specific verticals miss. Run it last and watch that it does not simply cannibalize the other two.

### Held: Traffic & License
Not running under the two-vertical structure. Cheap clicks and low case value made it the
first thing to cut, and cutting it removes the risk of it eating budget from the two
campaigns that matter. Assets are retained in the repo.

## Settings that spend money on default

| Setting | Default | Set to | Why |
|---|---|---|---|
| Location options | Presence **or interest** | **Presence** | Biggest leak. Otherwise someone in Ohio researching NC DWI law triggers the ad. |
| Search Partners | On | **Off** | Lower-intent inventory you can't segment. Test later as its own experiment. |
| Display expansion | On | **Off** | Pure leakage on a Search campaign. |
| Auto-apply recommendations | Several on | **All off** | Account-level. Left on, Google adds broad match and raises budgets unasked. |
| Match types | Broad suggested | **Phrase + exact** | Broad needs conversion data and smart bidding to steer it. |
| Networks | Search + Display | **Search only** | Add channels deliberately, not by leaving a checkbox alone. |

## Bidding, in order

| Phase | Strategy | Move on when |
|---|---|---|
| Weeks 1-6 | Maximize Clicks, max CPC cap ~$35-40 | The cap is the guardrail - without it this finds the most expensive clicks available. |
| Phase 2 | Maximize Conversions | ~15 conversions/month, tracking verified. |
| Phase 3 | Target CPA | ~30 conversions/month. Set target from achieved CPA, not a wish. |

Each campaign graduates on its own schedule. Traffic may never leave Maximize Clicks.

## Conversion tracking comes first

Criminal defense leads **call** - they do not fill out forms at 2am after an arrest. Track
only form fills and you will conclude the campaign failed while it was working.

1. **Calls from ads** - conversions from the call asset. Count only calls over 60 seconds.
2. **Calls from the website** - needs a Google forwarding number so click-then-call is attributed.
3. **Form submissions** - secondary, but a distinct action so you can compare lead quality.
4. **One primary action per campaign** - calls primary, forms secondary.
5. **Intake is the real conversion** - ask the firm to log which calls became consultations.

## Negative keywords, day one

Build as a shared list applied to all campaigns **before** launch.

**Won't convert:** free, pro bono, public defender, legal aid, cheap, court appointed,
how to, what is, definition, penalty, sentence, jobs, salary, internship

**Wrong practice area:** divorce, custody, child support, personal injury, car accident,
injury, bankruptcy, immigration, workers comp, estate, will, probate, disability

**Wrong intent:** bail bonds, bond, inmate, jail records, mugshot, arrest records,
court records, warrant search, reviews, complaints, disbarred

Read the Search Terms report weekly for the first month, monthly after.

## Geo and schedule

Target **New Hanover County** as the core, radius ~25-30 miles around downtown Wilmington.
Add **Pender** and **Brunswick** only if the firm actually appears in those courts.

**The scheduling problem worth raising with the client:** posted hours are Mon-Thu 9-5 and
Fri 9-3, but people are arrested Friday and Saturday nights and search the next morning.
Running ads only during office hours misses the highest-intent window in this vertical;
running around the clock into an unanswered phone pays for calls that ring out. The fix is
an answering service or after-hours intake - a business decision that will move
cost-per-case more than any setting here. Until it's resolved, run the full week with bids
reduced overnight and treat the gap as a known cost.

## Also worth running: Local Services Ads

Google's LSAs carry **Criminal Lawyer**, **DUI Lawyer** and **Traffic Lawyer** categories,
all three of which fit this firm. They appear above the paid Search block, charge per lead
rather than per click, and carry the Google Screened badge - which requires a background and
license check on the firm and its principals plus a Google Business Profile rating of 3.0+.
For a small firm competing on cost-per-click, this often returns better than Search. Separate
product, so it doesn't change the structure above. Start screening early; verification takes weeks.

## Don't run these

- **Performance Max** - needs conversion volume this account won't have for months, gives
  almost no visibility, and absorbs brand searches while claiming credit for them.
- **Display or Video** - no awareness funnel to build at this budget for an urgent, high-intent service.
- **A campaign per practice area** - seven campaigns means seven with too little data to optimize.
- **Broad match at launch** - without conversion data and smart bidding, it's a wider net over the same budget.
- **Bail bonds keywords** - Google restricts bail bond advertising outright; the firm doesn't offer it.

## Launch order

1. Conversion tracking, verified with a live test call. Do not launch on untested tracking.
2. Shared negative list applied to all campaigns.
3. Account settings swept (Presence, Search Partners off, Display off, auto-apply off).
4. Assets attached - callouts at account level, Service catalog snippet at account level,
   Types at campaign level, sitelinks and a call asset per campaign.
5. Launch DWI alone for two weeks. Read the Search Terms report before adding the second.
6. Add Felony Criminal Defense after two weeks. Add the optional third only if budget allows.
