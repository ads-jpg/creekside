'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { listWeeks, readWeek, adRowsOf, dailyRowsOf } = require('../lib/snapshot');
const { buildReport } = require('../lib/report');

const dir = path.join(__dirname, '..', 'data', 'weeks');

test('saved AdKit weeks give the same KPIs as Meta', () => {
  assert.ok(listWeeks(dir).includes('2026-10-26'));
  const r = buildReport({
    week: { start: '2026-10-26', end: '2026-11-01' }, prior: { start: '2026-10-19', end: '2026-10-25' },
    adRows: adRowsOf(readWeek(dir, '2026-10-26')), priorAdRows: adRowsOf(readWeek(dir, '2026-10-19')),
    dailyRows: dailyRowsOf(readWeek(dir, '2026-10-26')),
  });
  assert.deepStrictEqual([r.totals.costPerFormFill, r.totals.costPerLead, r.totals.costPerAppt], [10.5, 36.48, 231.04]);
  assert.deepStrictEqual([r.totals.landingPageViews, r.priorTotals.spend, r.priorTotals.formFills], [544, 961.78, 45]);
  assert.strictEqual(r.days.reduce((s, d) => s + d.appts, 0), 3);
});
