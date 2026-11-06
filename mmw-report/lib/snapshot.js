'use strict';

// Weekly snapshots saved from AdKit (data/weeks/<monday>.json), used when the
// server has no Meta token. Each file holds one Monday–Sunday week:
//
// {
//   "week": { "start": "2026-10-26", "end": "2026-11-01" },
//   "source": "AdKit (Meta Ads)", "accountId": "act_…", "updatedAt": "<ISO time>",
//   "ads":   [{ "id", "name", "adset", "campaign", "spend", "impressions", "link_clicks",
//               "landing_page_views", "form_fills", "leads", "schedule_cost_per" }],
//   "daily": [{ "date", "spend", "form_fills", "leads", "schedule_cost_per" }]
// }
//
// schedule_cost_per is Meta's cost per Schedule (null when there were none):
// appointments = spend ÷ schedule_cost_per, rounded, as in the Meta path.

const fs = require('node:fs');
const path = require('node:path');

const DATE_RE = /^20\d{2}-[01]\d-[0-3]\d$/;

function listWeeks(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((f) => f.replace(/\.json$/, ''))
    .filter((s) => DATE_RE.test(s))
    .sort()
    .reverse();
}

function readWeek(dir, start) {
  const file = path.join(dir, `${start}.json`);
  if (!DATE_RE.test(start) || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Shape a saved row like a Meta Insights row, so buildReport reads both the same way.
function toMetaRow(r, extra = {}) {
  const v = (n) => String(n || 0);
  return {
    ...extra,
    spend: v(r.spend),
    impressions: v(r.impressions),
    actions: [
      { action_type: 'link_click', value: v(r.link_clicks) },
      { action_type: 'landing_page_view', value: v(r.landing_page_views) },
      { action_type: 'offsite_conversion.fb_pixel_lead', value: v(r.leads) },
    ],
    conversions: [{ action_type: 'offsite_conversion.fb_pixel_custom.form_start', value: v(r.form_fills) }],
    cost_per_conversion: r.schedule_cost_per ? [{ action_type: 'schedule_total', value: String(r.schedule_cost_per) }] : [],
  };
}

const adRowsOf = (snap) => (snap ? snap.ads : []).map((a) =>
  toMetaRow(a, { ad_id: a.id, ad_name: a.name, adset_name: a.adset, campaign_name: a.campaign }));
const dailyRowsOf = (snap) => (snap ? snap.daily : []).map((d) =>
  toMetaRow(d, { date_start: d.date, date_stop: d.date }));

module.exports = { listWeeks, readWeek, adRowsOf, dailyRowsOf };
