# Nexa Mortgage live ads report

A small Node server that pulls the `DANBNEXA_` campaigns from the Creekside Mortgages Meta ad account
and serves a live report page for Dan Bertsche at Nexa Mortgage. It has no npm dependencies.

- `GET /` is the report page (date range picker: since launch, last 7/14/30 days, this month, last month)
- `GET /api/report?range=maximum` is the same data as JSON
- `GET /healthz` is the health check

Results are cached for 15 minutes per date range, so opening the page doesn't call Meta every time.

## Deploy on Railway

1. In Railway, choose **New Project → Deploy from GitHub repo** and pick `ads-jpg/creekside`.
2. In the service's **Settings**, set **Root Directory** to `/nexa-report`.
3. In **Variables**, add:

   | Variable | Value |
   |---|---|
   | `META_ACCESS_TOKEN` | A Meta system user token with `ads_read` on the Creekside Mortgages ad account |
   | `META_AD_ACCOUNT_ID` | `act_1555987259664099` (this is the default) |
   | `CLIENT_PREFIX` | `DANBNEXA` (this is the default) |
   | `REPORT_PASSWORD` | Optional. If set, the page asks for this password (any username). |

4. In **Settings → Networking**, choose **Generate Domain** to get the public URL to send Dan.

Railway redeploys whenever the branch it watches gets a new commit.

## Meta token

Use a system user token so it doesn't expire: Business Settings → Users → System users → add one,
assign it the Creekside Mortgages ad account with "View performance", then generate a token with the
`ads_read` permission. A personal user token works too but expires after about 60 days.

## What counts as a call

Qualified calls are read from the `offsite_conversion.fb_pixel_custom.alpha` action, which is the
"Add 20s Calls" custom conversion the lead campaign optimizes for. To count a different event,
set `CALL_ACTION_TYPES` to a comma-separated list of Meta action types; the first one present is used.

## Reusing for another client

Everything client-specific comes from the variables above. Deploy another Railway service from the same
folder with a different `CLIENT_PREFIX` (and account ID if needed). The page headline and "Prepared for"
line live in `public/index.html`.

## Local run

```
cp .env.example .env   # fill in META_ACCESS_TOKEN
node --env-file=.env src/server.js
npm test
```
