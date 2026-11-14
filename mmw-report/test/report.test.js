'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildReport, countsFor, recentWeeks, weekFrom } = require('../lib/report');
const { adRows, priorAdRows, dailyRows } = require('./fixtures');

const week = { start: '2026-10-26', end: '2026-11-01' };
const prior = { start: '2026-10-19', end: '2026-10-25' };
const r = buildReport({ week, prior, adRows, priorAdRows, dailyRows });

test('headline KPIs match last week in Meta', () => {
  assert.strictEqual(r.totals.spend, 693.13);
  assert.strictEqual(r.totals.formFills, 66);
  assert.strictEqual(r.totals.leads, 19);
  assert.strictEqual(r.totals.appts, 3);
  assert.strictEqual(r.totals.costPerFormFill, 10.5);
  assert.strictEqual(r.totals.costPerLead, 36.48);
  assert.strictEqual(r.totals.costPerAppt, 231.04);
});

test('prior week and changes', () => {
  assert.strictEqual(r.priorTotals.spend, 961.78);
  assert.strictEqual(r.priorTotals.costPerFormFill, 21.37);
  assert.strictEqual(r.priorTotals.costPerLead, null);
  assert.strictEqual(r.changes.costPerLead, null);
  assert.ok(r.changes.costPerFormFill < -0.5);
});

test('breakdowns', () => {
  const shop = r.adsets.find((a) => a.name.includes('Print Shop'));
  assert.deepStrictEqual([shop.leads, shop.appts, shop.costPerLead], [17, 3, 20.53]);
  assert.strictEqual(r.topAdset.name, 'Leads | Men Broad | Print Shop');
  assert.strictEqual(r.days.length, 7);
  assert.strictEqual(r.days.reduce((s, d) => s + d.appts, 0), 3);
});

test('a real Schedule count wins over the cost-based estimate', () => {
  const c = countsFor({ spend: '100', conversions: [{ action_type: 'schedule_total', value: '4' }], cost_per_conversion: [{ action_type: 'schedule_total', value: '50' }] });
  assert.strictEqual(c.appts, 4);
});

test('weeks run Monday to Sunday in the account time zone', () => {
  // Friday Nov 6, 2026, 03:00 UTC is still Thursday Nov 5 in New York.
  const w = recentWeeks('America/New_York', 2, new Date('2026-11-06T03:00:00Z'));
  assert.deepStrictEqual(w[0], { start: '2026-10-26', end: '2026-11-01' });
  assert.deepStrictEqual(w[1], { start: '2026-10-19', end: '2026-10-25' });
  assert.deepStrictEqual(weekFrom('2026-10-29'), { start: '2026-10-26', end: '2026-11-01' });
});

test('7-day and 30-day periods, with gaps marked instead of counted as zero', () => {
  const { buildPeriods } = require('../lib/report');
  const day = (date, spend, form_fills, leads, sched) => ({
    date_start: date, spend: String(spend),
    actions: [{ action_type: 'offsite_conversion.fb_pixel_lead', value: String(leads) }],
    conversions: [{ action_type: 'offsite_conversion.fb_pixel_custom.form_start', value: String(form_fills) }],
    cost_per_conversion: sched ? [{ action_type: 'schedule_total', value: String(sched) }] : [],
  });
  const rows = [day('2026-11-08', 100, 10, 2, 100), day('2026-11-01', 50, 5, 1, null), day('2026-10-01', 40, 4, 0, null)];
  const [w, m] = buildPeriods({ end: '2026-11-08', dailyRows: rows, covered: (d) => d >= '2026-09-20' });
  assert.deepStrictEqual([w.start, w.priorStart, w.priorEnd], ['2026-11-02', '2026-10-26', '2026-11-01']);
  assert.deepStrictEqual([w.totals.spend, w.totals.appts, w.totals.costPerAppt], [100, 1, 100]);
  assert.strictEqual(w.changes.spend, 1); // $100 vs $50
  assert.deepStrictEqual([m.start, m.totals.spend, m.complete], ['2026-10-10', 150, true]);
  assert.strictEqual(m.priorComplete, false); // the 30 days before start on Sep 10, before Sep 20
  assert.strictEqual(m.changes.spend, null);
});
