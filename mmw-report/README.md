# Mark My Words Media weekly report

A live web page with the weekly Meta Ads report for Mark My Words Media. The three KPIs at the top are **cost per form fill**, **cost per lead** and **cost per appointment booked**, each compared with the week before. Below them are a funnel, results by day, and tables by ad set and by ad.

The data comes from one of two places:

- **Weekly AdKit data (the default).** With no Meta token set, the page reads the weeks saved in `data/weeks/`, one file per Monday–Sunday week. A scheduled Claude task pulls each finished week from AdKit every Monday, saves it there and pushes, and Railway redeploys automatically. The dropdown lists every saved week.
- **Live Meta API.** If `META_ACCESS_TOKEN` is set, the page calls the Meta Marketing API instead, with results cached for 15 minutes, and the dropdown goes back 12 weeks.

No dependencies. Needs Node 20 or later.

## Deploy on Railway

1. In Railway: **New Project → Deploy from GitHub repo** → `ads-jpg/creekside`.
2. In the service's **Settings → Source**, set **Root Directory** to `mmw-report`.
3. In **Variables**, add:
   - `META_ACCESS_TOKEN` (optional): only to read Meta live instead of the saved AdKit weeks. A Meta token with `ads_read` on the ad account. Use a System User token from Business Settings; a personal token expires in about 60 days.
   - `REPORT_PASSWORD` (recommended): the password for the page. Any username works.
   - `META_AD_ACCOUNT_ID` is already set to `act_1228742844209195` in the code, so you only need it to report on another account.
4. In **Settings → Networking**, click **Generate Domain** to get the public URL.

Railway sets `PORT` itself. `railway.json` sets the start command and a `/healthz` health check.

## Settings

| Variable | Default | What it does |
|---|---|---|
| `META_ACCESS_TOKEN` | (required) | Meta Marketing API token |
| `META_AD_ACCOUNT_ID` | `act_1228742844209195` | Ad account to report on |
| `REPORT_PASSWORD` | (none) | Password-protects every page except `/healthz` |
| `REPORT_TIMEZONE` | `America/New_York` | Time zone the weeks are counted in (match the ad account) |
| `CACHE_MINUTES` | `15` | How long Meta results are reused |
| `META_API_VERSION` | `v21.0` | Graph API version |
| `FORM_FILL_EVENT` | `offsite_conversion.fb_pixel_custom.form_start` | Meta event counted as a form fill |
| `LEAD_EVENT` | `offsite_conversion.fb_pixel_lead` | Meta event counted as a lead |
| `APPOINTMENT_EVENT_MATCH` | `schedule` | Text matched in an event's name to count appointments |

## Saved weeks from AdKit

Each file in `data/weeks/` is named after the week's Monday (`2026-10-26.json`) and holds that week's ads and days; `lib/snapshot.js` describes the fields. After saving a week, check it:

```bash
node scripts/check-week.js 2026-10-26
```

A week file can also hold the week's **report notes** (`notes`, described in `lib/snapshot.js`), shown at the bottom of the page in the same sections as the other Creekside reports: Performance Snapshot, What We Changed, What's Working / What's Not, Next Steps and Client Needs. Notes from earlier weeks appear under Archive.

It prints the week's totals (by ad and by day) and the three costs, to compare with AdKit, and stops with an error if the file is malformed or the two totals disagree.

## Checking the event mapping

`/api/events?start=2026-10-26` lists every event name Meta returned for that week, with counts and costs. If a KPI shows 0 when it shouldn't, find the right event name there and set the matching variable.

Meta sometimes reports a cost per Schedule without a count. When that happens, appointments are counted as spend ÷ cost per Schedule, per ad, rounded.

## Run locally

```bash
cp .env.example .env   # fill in META_ACCESS_TOKEN
node --env-file=.env server.js
```

```bash
npm test
```
