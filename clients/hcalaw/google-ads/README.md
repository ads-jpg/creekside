# hcalaw.net - Google Ads Build

Campaign assets for **Hewlett, Collins & Allard, L.L.P.**, a criminal defense firm in
Wilmington, NC. Practice areas: DWI/DUI, drug charges, traffic, felonies, sex crimes,
DMV hearings, federal defense. Founded 1982.

> **Source note:** hcalaw.net was unreachable from the build environment's egress
> allowlist. Facts here come from the firm's directory record (Martindale-Hubbell,
> FindLaw, Lawyers.com, Yelp, Justia). Items marked VERIFY need confirming against the
> live site before launch.

| File | What it is |
|---|---|
| `campaign-structure.md` | Campaign/ad group structure, settings, bidding, negatives, launch order |
| `callout-extensions.md` | 41 callout assets grouped by ad group |
| `structured-snippets.md` | 2 headers, 17 values |
| `rsa-ad-copy.md` | 3 policy-safe responsive search ads + flagged-phrase substitutions |
| `*.csv` | Flat lists for bulk loading |
| `*.html` | Published reference pages |
| `verify_callout_lengths.py` | Checks all callouts against the 25-char limit |
| `verify_snippet_values.py` | Checks snippet values: 25-char limit, 3-10 per header, callout collisions |
| `verify_rsa_copy.py` | Checks RSA headlines (30), descriptions (90), paths (15), field counts |

## Checks

```
python3 verify_callout_lengths.py   # reads callouts.csv
python3 verify_snippet_values.py    # exits non-zero on any violation
python3 verify_rsa_copy.py          # exits non-zero on any violation
```

## Google policy

Assets naming sensitive practice areas were removed after the account was flagged:
`Sex Crime Defense` and `Drug Trafficking Defense` (callouts), `Sex Crimes` (Types snippet).
Google's dangerous-products and sexual-content classifiers match on subject matter and do not
read the defense framing. The firm keeps these practice areas on its website; they come through
organic search and Local Services Ads rather than paid Search copy. See `rsa-ad-copy.md` for the
full substitution table and the disapproval playbook.

## Open questions for the client

1. **Monthly budget** - decides campaign count (see `campaign-structure.md`).
2. **After-hours intake** - is there an answering service? Drives the ad schedule decision.
3. **Free consultation** - offered, or case-dependent? Several callouts depend on it.
4. **Court coverage** - Pender and Brunswick counties, or New Hanover only?
5. **Landing pages** - is there a dedicated DWI page, or only the homepage and /dmv-hearings/?
