# Criminal Defense Keyword Plan - policy-safe

98 keywords across 3 campaigns and 16 ad groups, plus 96 negatives.
`{city}` is a placeholder - substitute the market before upload.

## Negatives are the policy control

Google reviews keywords, but keyword-level disapproval is rarely what bites a defense firm.
The real exposure is **match breadth**: a phrase-match keyword like `"criminal defense lawyer"`
will match *criminal defense lawyer for sex charges*, and the ad has now served against a
sensitive query nobody chose to bid on.

The negatives are not housekeeping. They keep a compliant keyword from delivering a
non-compliant impression. On a flagged account they go in **before** the keywords.

## Match types

- **Exact** for head terms, where intent is unambiguous
- **Phrase** for the long tail, fenced in by the negatives
- **No broad match** - it needs conversion data and smart bidding to steer
- 0 negative/keyword conflicts, verified by `keywords.py`

## Keywords

### DWI / DUI (35 keywords)

| Ad group | Keywords |
|----------|----------|
| **DWI Attorney** | `[dwi lawyer]` · `[dwi attorney]` · `[dwi lawyer near me]` · `[dwi attorney near me]` · `[dwi lawyer {city}]` · `[dwi attorney {city}]` · `"dwi defense lawyer"` · `"dwi defense attorney"` · `"dwi defense law firm"` · `"hire a dwi lawyer"` |
| **DUI Attorney** | `[dui lawyer]` · `[dui attorney]` · `[dui lawyer near me]` · `[dui attorney near me]` · `[dui lawyer {city}]` · `"dui defense attorney"` · `"dui defense lawyer"` · `"drunk driving lawyer"` · `"drunk driving attorney"` |
| **First Offense** | `"first offense dwi lawyer"` · `"first offense dui lawyer"` · `"first dwi attorney"` · `"first time dwi lawyer"` · `"first time dui attorney"` |
| **Repeat & Felony DWI** | `"second dwi lawyer"` · `"second offense dwi attorney"` · `"third dwi lawyer"` · `"felony dwi lawyer"` · `"felony dwi attorney"` · `"habitual dwi lawyer"` · `"repeat dwi attorney"` |
| **Underage DWI** | `"underage dwi lawyer"` · `"underage dui attorney"` · `"underage drinking driving lawyer"` · `"provisional license dwi lawyer"` |

### Criminal Defense (36 keywords)

| Ad group | Keywords |
|----------|----------|
| **Criminal Defense** | `[criminal defense attorney]` · `[criminal defense lawyer]` · `[criminal lawyer near me]` · `[criminal attorney near me]` · `[criminal defense attorney {city}]` · `[criminal lawyer {city}]` · `"criminal defense law firm"` · `"criminal defense representation"` · `"hire a criminal defense lawyer"` · `"defense attorney for criminal charges"` |
| **Drug Charges** | `"drug charge lawyer"` · `"drug charge attorney"` · `"drug possession lawyer"` · `"drug possession attorney"` · `"possession charge lawyer"` · `"drug charges defense attorney"` · `"drug crime lawyer"` |
| **Felony Defense** | `"felony lawyer"` · `"felony attorney"` · `"felony attorney near me"` · `"felony defense lawyer"` · `"felony charge attorney"` · `"felony defense attorney {city}"` |
| **Misdemeanor Defense** | `"misdemeanor lawyer"` · `"misdemeanor attorney"` · `"misdemeanor defense lawyer"` · `"misdemeanor charge attorney"` |
| **Assault Charges** | `"assault charge lawyer"` · `"assault charge attorney"` · `"assault defense lawyer"` · `"simple assault lawyer"` · `"assault attorney near me"` |
| **Federal Defense (phase 2)** | `"federal criminal defense attorney"` · `"federal criminal lawyer"` · `"federal defense attorney"` · `"federal charges lawyer"` |

### Traffic & License (27 keywords)

| Ad group | Keywords |
|----------|----------|
| **Traffic Tickets** | `[traffic ticket lawyer]` · `[traffic ticket attorney]` · `[traffic lawyer near me]` · `[traffic attorney {city}]` · `"traffic ticket lawyer {city}"` · `"fight a traffic ticket lawyer"` · `"traffic violation attorney"` |
| **Speeding Tickets** | `"speeding ticket lawyer"` · `"speeding ticket attorney"` · `"speeding ticket lawyer near me"` · `"speeding citation attorney"` |
| **DWLR & Suspended License** | `"driving while license revoked lawyer"` · `"dwlr attorney"` · `"dwlr lawyer"` · `"suspended license lawyer"` · `"revoked license attorney"` · `"driving on suspended license lawyer"` |
| **DMV Hearings** | `"dmv hearing lawyer"` · `"dmv hearing attorney"` · `"license restoration lawyer"` · `"license restoration attorney"` · `"get my license back lawyer"` · `"dmv hearing representation"` |
| **Reckless Driving** | `"reckless driving lawyer"` · `"reckless driving attorney"` · `"reckless driving ticket lawyer"` · `"careless driving attorney"` |

## Negative keywords

Build as shared lists applied to all campaigns. The first is policy protection; the rest is money.

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
| `marijuana` `cannabis` | High-volume possession term in most markets. | Names a controlled substance - fastest route to a dangerous-products disapproval. Revisit once the account is clean. |
| `trafficking` `distribution` | The highest-value drug cases a firm sees. | The classifier does not distinguish defending trafficking from facilitating it. These clients come by referral more than search. |
| `gun` `firearm` `weapon` | Weapons charges are common alongside felonies. | Trips the dangerous-products filter regardless of framing. The felony keywords still catch much of this intent. |

One deliberate carve-out: `sex offender` is blocked as a **phrase** rather than `offender` as a
word, so *habitual offender* searches - a real NC license-revocation status, and real business -
stay biddable.

## Running it

1. **Negatives first, keywords second.** Reversing this is how a flagged account gets flagged again.
2. **Search Terms report weekly** for the first month. Anything sensitive that slips through becomes a negative the same day.
3. **Add negatives at shared-list level**, not ad group level.
4. **Watch "Rarely served" vs "Low search volume"** - the first is Quality Score or policy, the second is market size.
5. **Re-run `python3 keywords.py` after every edit.** One broad negative can silently disable an ad group and nothing warns you.

