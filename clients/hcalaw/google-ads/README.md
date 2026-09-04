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
| `callout-extensions.md` | 43 callout assets grouped by ad group |
| `structured-snippets.md` | 2 headers, 18 values |
| `*.csv` | Flat lists for bulk loading |
| `*.html` | Published reference pages |
| `verify_callout_lengths.py` | Checks all callouts against the 25-char limit |
| `verify_snippet_values.py` | Checks snippet values: 25-char limit, 3-10 per header, callout collisions |

## Checks

```
python3 verify_callout_lengths.py
python3 verify_snippet_values.py   # exits non-zero on any violation
```

## Open questions for the client

1. **Monthly budget** - decides campaign count (see `campaign-structure.md`).
2. **After-hours intake** - is there an answering service? Drives the ad schedule decision.
3. **Free consultation** - offered, or case-dependent? Several callouts depend on it.
4. **Court coverage** - Pender and Brunswick counties, or New Hanover only?
5. **Landing pages** - is there a dedicated DWI page, or only the homepage and /dmv-hearings/?
