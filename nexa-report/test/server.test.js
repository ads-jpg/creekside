const test = require('node:test');
const assert = require('node:assert');

test('serves page, health check and report JSON with a stubbed Meta API', async () => {
  process.env.META_ACCESS_TOKEN = 'test-token';
  process.env.REPORT_PASSWORD = 'pw';
  const realFetch = global.fetch;
  const seen = [];
  global.fetch = async (url) => {
    const u = new URL(url);
    if (u.hostname === 'graph.facebook.com') {
      seen.push(u.pathname + ' ' + (u.searchParams.get('level') || '') + ' ' + (u.searchParams.get('time_increment') || ''));
      const level = u.searchParams.get('level');
      const data = u.pathname.endsWith('/campaigns')
        ? [{ id: '1', name: 'DANBNEXA_X_LEADS_2026-10-13', effective_status: 'ACTIVE' }]
        : [{ campaign_id: '1', campaign_name: 'DANBNEXA_X_LEADS_2026-10-13', ad_id: level === 'ad' ? 'a' : undefined, ad_name: 'ad', date_start: '2026-10-14', spend: '10', impressions: '100', clicks: '5', conversions: [{ action_type: 'offsite_conversion.fb_pixel_custom.alpha', value: '2' }] }];
      return { ok: true, json: async () => ({ data }) };
    }
    return realFetch(url);
  };
  const { server } = require('../src/server');
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const auth = { Authorization: 'Basic ' + Buffer.from('dan:pw').toString('base64') };
  try {
    assert.strictEqual((await realFetch(base + '/healthz')).status, 200);
    assert.strictEqual((await realFetch(base + '/')).status, 401);
    const page = await realFetch(base + '/', { headers: auth });
    assert.match(await page.text(), /Nexa Mortgage ads report/);
    const res = await realFetch(base + '/api/report?range=last_7d', { headers: auth });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.range, 'last_7d');
    assert.strictEqual(body.totals.calls, 2);
    assert.strictEqual(body.totals.costPerCallActive, 5);
    assert.strictEqual(seen.length, 4);
  } finally {
    server.close();
    global.fetch = realFetch;
  }
});
