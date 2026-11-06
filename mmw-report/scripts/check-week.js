'use strict';
// Usage: node scripts/check-week.js 2026-10-26
// Checks a saved week file and prints its totals, to compare with AdKit's totals.
const path = require('node:path');
const { readWeek, adRowsOf, dailyRowsOf } = require('../lib/snapshot');
const { buildReport, weekFrom, addDays } = require('../lib/report');

const dir = path.join(__dirname, '..', 'data', 'weeks');
const start = process.argv[2];
const snap = readWeek(dir, start);
if (!snap) { console.error(`No file data/weeks/${start}.json`); process.exit(1); }

const problems = [];
const week = weekFrom(start);
if (week.start !== start) problems.push(`${start} is not a Monday`);
if (!snap.week || snap.week.start !== week.start || snap.week.end !== week.end) problems.push(`"week" should be ${JSON.stringify(week)}`);
for (const k of ['ads', 'daily']) if (!Array.isArray(snap[k])) problems.push(`"${k}" must be a list`);
const nums = ['spend', 'form_fills', 'leads'];
(snap.ads || []).forEach((a, i) => {
  for (const k of ['id', 'name', 'adset']) if (!a[k]) problems.push(`ads[${i}] is missing ${k}`);
  for (const k of [...nums, 'impressions', 'link_clicks', 'landing_page_views']) if (typeof a[k] !== 'number') problems.push(`ads[${i}].${k} must be a number`);
});
(snap.daily || []).forEach((d, i) => {
  if (!(d.date >= week.start && d.date <= week.end)) problems.push(`daily[${i}].date ${d.date} is outside the week`);
  for (const k of nums) if (typeof d[k] !== 'number') problems.push(`daily[${i}].${k} must be a number`);
});
if (snap.notes) {
  const keys = ['performanceSnapshot', 'whatWeChanged', 'workingNotWorking', 'nextSteps', 'clientNeeds'];
  if (!/^20\d{2}-[01]\d-[0-3]\d$/.test(snap.notes.date || '')) problems.push('notes.date must be a date like 2026-11-06');
  for (const k of keys) if (!Array.isArray(snap.notes[k]) || snap.notes[k].some((t) => typeof t !== 'string')) problems.push(`notes.${k} must be a list of paragraphs`);
  for (const k of Object.keys(snap.notes)) if (k !== 'date' && !keys.includes(k)) problems.push(`notes.${k} is not a notes section`);
}
if (problems.length) { console.error('Problems:\n- ' + problems.join('\n- ')); process.exit(1); }

const r = buildReport({ week, prior: { start: addDays(start, -7), end: addDays(start, -1) },
  adRows: adRowsOf(snap), priorAdRows: [], dailyRows: dailyRowsOf(snap) });
const day = r.days.reduce((t, d) => ({ spend: t.spend + d.spend, formFills: t.formFills + d.formFills, leads: t.leads + d.leads, appts: t.appts + d.appts }), { spend: 0, formFills: 0, leads: 0, appts: 0 });
const t = r.totals;
console.log(`Week ${week.start} to ${week.end}`);
console.log(`By ad:  spend $${t.spend}  form fills ${t.formFills}  leads ${t.leads}  appointments ${t.appts}`);
console.log(`By day: spend $${Math.round(day.spend * 100) / 100}  form fills ${day.formFills}  leads ${day.leads}  appointments ${day.appts}`);
console.log(`Cost per form fill $${t.costPerFormFill}  per lead $${t.costPerLead}  per appointment $${t.costPerAppt}`);
if (Math.abs(t.spend - day.spend) > 0.05 || t.formFills !== day.formFills || t.leads !== day.leads) {
  console.error('Warning: the by-ad and by-day totals differ. Check both against AdKit.');
  process.exit(2);
}
