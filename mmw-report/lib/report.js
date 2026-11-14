'use strict';

// Turns Meta Insights rows into the weekly report: totals, the three cost KPIs,
// the funnel, results by day, by ad set and by ad.

const DEFAULT_EVENTS = {
  formFill: 'offsite_conversion.fb_pixel_custom.form_start',
  lead: 'offsite_conversion.fb_pixel_lead',
  appointmentMatch: 'schedule',
};

const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const num = (x) => (x == null || x === '' ? 0 : Number(x));

// Find a count in Meta's `actions` / `conversions` lists.
function findValue(list, type) {
  if (!Array.isArray(list)) return null;
  const hit = list.find((a) => a.action_type === type);
  return hit ? num(hit.value) : null;
}

// Meta reports Schedule under several names (schedule_total, schedule_website,
// offsite_conversion.fb_pixel_schedule, or a per-pixel name). Prefer the total.
function findMatching(list, match) {
  if (!Array.isArray(list)) return null;
  const re = new RegExp(match, 'i');
  const hits = list.filter((a) => re.test(a.action_type));
  if (!hits.length) return null;
  const total = hits.find((a) => /_total$/.test(a.action_type));
  return num((total || hits[0]).value);
}

// Pull the KPI counts out of one Insights row.
function countsFor(row, events = DEFAULT_EVENTS) {
  const spend = num(row.spend);
  const actions = row.actions;
  const conversions = row.conversions;

  const formFills = findValue(conversions, events.formFill) ?? findValue(actions, events.formFill) ?? 0;
  const leads = findValue(actions, events.lead) ?? findValue(conversions, events.lead) ?? 0;

  // Appointments: use the count where Meta gives one. Meta sometimes reports only
  // a cost per Schedule; then the count is spend ÷ that cost, rounded.
  let appts = findMatching(conversions, events.appointmentMatch) ?? findMatching(actions, events.appointmentMatch);
  if (appts == null) {
    const cost = findMatching(row.cost_per_conversion, events.appointmentMatch)
      ?? findMatching(row.cost_per_action_type, events.appointmentMatch);
    appts = cost ? Math.round(spend / cost) : 0;
  }

  return {
    spend,
    impressions: num(row.impressions),
    linkClicks: findValue(actions, 'link_click') ?? 0,
    landingPageViews: findValue(actions, 'landing_page_view') ?? findValue(actions, 'omni_landing_page_view') ?? 0,
    formFills,
    leads,
    appts,
  };
}

function emptyTotals() {
  return { spend: 0, impressions: 0, linkClicks: 0, landingPageViews: 0, formFills: 0, leads: 0, appts: 0 };
}

function add(t, c) {
  for (const k of Object.keys(t)) t[k] += c[k] || 0;
  return t;
}

function withCosts(t) {
  const per = (n) => (n ? r2(t.spend / n) : null);
  return {
    ...t,
    spend: r2(t.spend),
    costPerFormFill: per(t.formFills),
    costPerLead: per(t.leads),
    costPerAppt: per(t.appts),
  };
}

function change(now, before) {
  return now != null && before ? r3((now - before) / before) : null;
}

function buildReport({ week, prior, adRows, priorAdRows, dailyRows, events = DEFAULT_EVENTS }) {
  const ads = adRows
    .map((r) => ({ id: r.ad_id, name: r.ad_name, adset: r.adset_name, campaign: r.campaign_name, ...countsFor(r, events) }))
    .filter((a) => a.spend > 0)
    .sort((a, b) => b.spend - a.spend);

  const thisWeek = withCosts(ads.reduce((t, a) => add(t, a), emptyTotals()));
  const lastWeek = withCosts(priorAdRows.map((r) => countsFor(r, events)).reduce(add, emptyTotals()));

  const adsetMap = new Map();
  for (const a of ads) adsetMap.set(a.adset, add(adsetMap.get(a.adset) || emptyTotals(), a));
  const adsets = [...adsetMap.entries()]
    .map(([name, t]) => ({ name, ...withCosts(t) }))
    .sort((a, b) => b.spend - a.spend);

  const dayMap = new Map();
  for (const r of dailyRows) dayMap.set(r.date_start, add(dayMap.get(r.date_start) || emptyTotals(), countsFor(r, events)));
  const days = [];
  for (let d = new Date(week.start + 'T00:00:00Z'); d <= new Date(week.end + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const t = dayMap.get(key) || emptyTotals();
    days.push({ date: key, spend: r2(t.spend), formFills: t.formFills, leads: t.leads, appts: t.appts });
  }

  const topAdset = [...adsets].sort((a, b) => b.leads - a.leads || b.appts - a.appts)[0] || null;

  return {
    week,
    prior,
    totals: thisWeek,
    priorTotals: lastWeek,
    changes: {
      spend: change(thisWeek.spend, lastWeek.spend),
      costPerFormFill: change(thisWeek.costPerFormFill, lastWeek.costPerFormFill),
      costPerLead: change(thisWeek.costPerLead, lastWeek.costPerLead),
      costPerAppt: change(thisWeek.costPerAppt, lastWeek.costPerAppt),
    },
    funnel: [
      { step: 'Landing page views', count: thisWeek.landingPageViews, rate: null },
      { step: 'Form fills', count: thisWeek.formFills, rate: thisWeek.landingPageViews ? r3(thisWeek.formFills / thisWeek.landingPageViews) : null },
      { step: 'Leads', count: thisWeek.leads, rate: thisWeek.formFills ? r3(thisWeek.leads / thisWeek.formFills) : null },
      { step: 'Appointments', count: thisWeek.appts, rate: thisWeek.leads ? r3(thisWeek.appts / thisWeek.leads) : null },
    ],
    days,
    adsets,
    ads: ads.map((a) => withCosts(a)),
    topAdset: topAdset && { name: topAdset.name, leads: topAdset.leads, appts: topAdset.appts },
  };
}

// ---- 7-day and 30-day view ----

// Totals for the 7 and 30 days ending on `end`, each against the same number of
// days just before. `covered(date)` says whether data exists for a day; a period
// with uncovered days is marked incomplete rather than counted as zero.
function buildPeriods({ end, dailyRows, events = DEFAULT_EVENTS, covered = () => true }) {
  const dayMap = new Map();
  for (const r of dailyRows) dayMap.set(r.date_start, add(dayMap.get(r.date_start) || emptyTotals(), countsFor(r, events)));
  const sum = (from, to) => {
    const t = emptyTotals();
    let complete = true;
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (!covered(d)) complete = false;
      add(t, dayMap.get(d) || emptyTotals());
    }
    return { totals: withCosts(t), complete };
  };
  const keys = ['spend', 'formFills', 'costPerFormFill', 'leads', 'costPerLead', 'appts', 'costPerAppt'];
  return [7, 30].map((n) => {
    const start = addDays(end, -(n - 1));
    const priorEnd = addDays(start, -1);
    const priorStart = addDays(start, -n);
    const now = sum(start, end);
    const before = sum(priorStart, priorEnd);
    const changes = {};
    for (const k of keys) changes[k] = before.complete ? change(now.totals[k], before.totals[k]) : null;
    return {
      days: n, start, end, priorStart, priorEnd,
      totals: now.totals, priorTotals: before.totals,
      complete: now.complete, priorComplete: before.complete,
      changes,
    };
  });
}

// ---- dates ----

// Today's date (YYYY-MM-DD) in the ad account's time zone.
function todayIn(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function mondayOf(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return addDays(iso, -((d.getUTCDay() + 6) % 7));
}

// The last `count` full Monday–Sunday weeks, newest first.
function recentWeeks(timeZone, count = 12, now = new Date()) {
  const thisMonday = mondayOf(todayIn(timeZone, now));
  const out = [];
  for (let i = 1; i <= count; i++) {
    const start = addDays(thisMonday, -7 * i);
    out.push({ start, end: addDays(start, 6) });
  }
  return out;
}

function weekFrom(start) {
  const s = mondayOf(start);
  return { start: s, end: addDays(s, 6) };
}

module.exports = { buildReport, buildPeriods, countsFor, recentWeeks, weekFrom, addDays, mondayOf, todayIn, DEFAULT_EVENTS };
