# Criminal Defense Keyword Plan - two verticals

84 active keywords across 13 ad groups in 3 campaigns, plus 14 held and 96 negatives.
Restructured to match the RSAs. `{city}` is a placeholder - substitute before upload.

Each ad group names the RSA that serves it. A keyword whose ad group runs the wrong RSA is a
Quality Score problem no bid adjustment fixes.

## Negatives are the policy control

Keyword-level disapproval is rarely what bites a defense firm. The exposure is **match
breadth**: a phrase-match keyword like `"criminal defense lawyer"` will match *criminal defense
lawyer for sex charges*, serving an ad against a query nobody chose to bid on. On a flagged
account the negatives go in **before** the keywords.

## Keywords

### Drunk Driving Defense (44 keywords)

_Served by: **RSA 2 - Drunk Driving Defense**_

| Ad group | Keywords |
|----------|----------|
| **Drunk Driving** | `[drunk driving lawyer]` · `[drunk driving attorney]` · `"drunk driving defense attorney"` · `"drunk driving defense lawyer"` · `"drunk driving lawyer near me"` · `"drunk driving charge attorney"` · `"arrested for drunk driving lawyer"` · `"drunk driving lawyer {city}"` |
| **DWI Attorney** | `[dwi lawyer]` · `[dwi attorney]` · `[dwi lawyer near me]` · `[dwi attorney near me]` · `[dwi lawyer {city}]` · `[dwi attorney {city}]` · `"dwi defense lawyer"` · `"dwi defense attorney"` · `"hire a dwi lawyer"` |
| **DUI Attorney** | `[dui lawyer]` · `[dui attorney]` · `[dui lawyer near me]` · `[dui attorney near me]` · `[dui lawyer {city}]` · `"dui defense attorney"` · `"dui defense lawyer"` |
| **First Offense** | `"first offense dwi lawyer"` · `"first offense dui lawyer"` · `"first dwi attorney"` · `"first time dwi lawyer"` · `"first time dui attorney"` |
| **Repeat & Felony DWI** | `"second dwi lawyer"` · `"second offense dwi attorney"` · `"third dwi lawyer"` · `"felony dwi lawyer"` · `"felony dwi attorney"` · `"habitual dwi lawyer"` · `"repeat dwi attorney"` |
| **DMV Hearings & License** | `"dmv hearing lawyer"` · `"dmv hearing attorney"` · `"license restoration lawyer"` · `"license restoration attorney"` · `"revoked license attorney"` · `"get my license back lawyer"` · `"driving while license revoked lawyer"` · `"dwlr attorney"` |

### Felony Criminal Defense (32 keywords)

_Served by: **RSA 1 - Felony Criminal Defense**_

| Ad group | Keywords |
|----------|----------|
| **Felony Defense** | `[felony lawyer]` · `[felony attorney]` · `[felony lawyer near me]` · `[felony attorney {city}]` · `"felony defense lawyer"` · `"felony defense attorney"` · `"felony charge attorney"` · `"felony criminal defense attorney"` · `"felony criminal lawyer"` · `"habitual felon lawyer"` |
| **Criminal Defense** | `[criminal defense attorney]` · `[criminal defense lawyer]` · `[criminal lawyer near me]` · `[criminal defense attorney {city}]` · `[criminal lawyer {city}]` · `"criminal defense law firm"` · `"hire a criminal defense lawyer"` |
| **Drug Charges** | `"drug charge lawyer"` · `"drug charge attorney"` · `"drug possession lawyer"` · `"drug possession attorney"` · `"possession charge lawyer"` · `"drug crime lawyer"` |
| **Assault & Violent** | `"assault charge lawyer"` · `"assault charge attorney"` · `"assault defense lawyer"` · `"assault attorney near me"` · `"violent crime attorney"` |
| **Federal Defense (phase 2)** | `"federal criminal defense attorney"` · `"federal criminal lawyer"` · `"federal defense attorney"` · `"federal charges lawyer"` |

### General Criminal Defense (optional third) (8 keywords)

_Served by: **RSA 3 - General Criminal Defense**_

| Ad group | Keywords |
|----------|----------|
| **General Criminal** | `[criminal attorney near me]` · `"criminal law firm {city}"` · `"defense attorney for criminal charges"` · `"criminal defense representation"` |
| **Misdemeanor Defense** | `"misdemeanor lawyer"` · `"misdemeanor attorney"` · `"misdemeanor defense lawyer"` · `"misdemeanor charge attorney"` |

## Held - Traffic & License

Not running under the two-vertical structure. No RSA serves these. Retained so the
campaign can be switched back on without rebuilding the list.

| Ad group | Keywords |
|----------|----------|
| **Traffic Tickets** | `[traffic ticket lawyer]` · `[traffic ticket attorney]` · `[traffic lawyer near me]` · `[traffic attorney {city}]` · `"fight a traffic ticket lawyer"` · `"traffic violation attorney"` |
| **Speeding Tickets** | `"speeding ticket lawyer"` · `"speeding ticket attorney"` · `"speeding ticket lawyer near me"` · `"speeding citation attorney"` |
| **Reckless Driving** | `"reckless driving lawyer"` · `"reckless driving attorney"` · `"reckless driving ticket lawyer"` · `"careless driving attorney"` |

## Negative keywords

Shared lists applied to all campaigns. The first is policy protection; the rest is money.

**Policy - sensitive category** (35)

`sex` `sexual` `rape` `molest` `indecent` `solicitation` `prostitution` `child` `minor` `statutory` `registry` `sex offender` `gun` `guns` `firearm` `weapon` `weapons` `concealed carry` `cocaine` `meth` `methamphetamine` `heroin` `fentanyl` `opioid` `opiate` `marijuana` `cannabis` `narcotics` `trafficking` `distribution` `bail` `bond` `bonds` `bondsman` `bail bonds`

**Waste - won't pay** (10)

`free` `pro bono` `public defender` `legal aid` `cheap` `low cost` `court appointed` `payment plan` `no money` `cant afford`

**Waste - research intent** (15)

`how to` `what is` `what happens` `definition` `meaning` `penalty` `penalties` `sentence` `sentencing` `statute` `laws` `law school` `reddit` `forum` `wiki`

**Waste - wrong job** (8)

`jobs` `job` `salary` `career` `internship` `become a` `hiring` `resume`

**Waste - records & lookup** (11)

`inmate` `jail` `mugshot` `mugshots` `arrest records` `court records` `case lookup` `warrant search` `docket` `expunge my own` `who is in jail`

**Waste - other practice areas** (17)

`divorce` `custody` `child support` `family law` `personal injury` `car accident` `injury` `malpractice` `bankruptcy` `immigration` `workers comp` `estate` `will` `probate` `disability` `real estate` `landlord`

## Volume given up on purpose

| Blocked | What it costs | Why block it anyway |
|---|---|---|
| `marijuana` `cannabis` | High-volume possession term. | Names a controlled substance - fastest route to a dangerous-products disapproval. |
| `trafficking` `distribution` | The highest-value drug cases. | The classifier does not distinguish defending trafficking from facilitating it. |
| `gun` `firearm` `weapon` | Weapons charges ride along with felonies. | Trips dangerous products regardless of framing. Felony keywords catch much of this intent. |

`sex offender` is blocked as a **phrase** rather than `offender` as a word, so *habitual
offender* searches - a real NC license-revocation status - stay biddable.

## Running it

1. **Negatives first, keywords second.**
2. **Search Terms report weekly** for the first month.
3. **Add negatives at shared-list level**, not ad group level.
4. **Watch "Rarely served" vs "Low search volume"** - Quality Score/policy vs market size.
5. **Re-run `python3 keywords.py` after every edit** - it checks duplicates across active and
   held lists, and that no negative blocks a keyword you are paying for.

