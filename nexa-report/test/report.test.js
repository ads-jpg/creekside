const test = require('node:test');
const assert = require('node:assert');
const { buildReport, config, labelFor } = require('../src/meta');

const cfg = config({ CLIENT_PREFIX: 'DANBNEXA' });
const calls = (n) => [{ action_type: 'offsite_conversion.fb_pixel_custom.alpha', value: String(n) }];
const v = (n) => [{ action_type: 'video_view', value: String(n) }];

// Oct 13-15, 2026 totals as reported in Ads Manager.
const fixture = {
  campaigns: [
    { id: '1', name: 'DANBNEXA_DanBertsche-NEXA_LEADS_2026-10-13', effective_status: 'ACTIVE' },
    { id: '2', name: 'DANBNEXA_DanBertsche-NEXA_LEADS_2026-10-09', effective_status: 'PAUSED' },
    { id: '3', name: 'DANBNEXA_DanBertsche-NEXA_AWARE_2026-10-09', effective_status: 'ACTIVE' },
  ],
  campaignRows: [
    { campaign_id: '1', campaign_name: 'DANBNEXA_DanBertsche-NEXA_LEADS_2026-10-13', spend: '344.36', impressions: '2734', clicks: '103', conversions: calls(6), actions: [{ action_type: 'landing_page_view', value: '4' }] },
    { campaign_id: '2', campaign_name: 'DANBNEXA_DanBertsche-NEXA_LEADS_2026-10-09', spend: '80.78', impressions: '1291', clicks: '27' },
    { campaign_id: '3', campaign_name: 'DANBNEXA_DanBertsche-NEXA_AWARE_2026-10-09', spend: '25.41', impressions: '8161', clicks: '15',
      video_thruplay_watched_actions: v(2699), video_play_actions: v(7269), video_p25_watched_actions: v(6395),
      video_p50_watched_actions: v(4681), video_p75_watched_actions: v(3479), video_p95_watched_actions: v(2844), video_p100_watched_actions: v(2705) },
  ],
  dailyRows: [
    { campaign_id: '1', campaign_name: 'x', date_start: '2026-10-14', spend: '182.21', conversions: calls(5) },
    { campaign_id: '1', campaign_name: 'x', date_start: '2026-10-13', spend: '8.45' },
    { campaign_id: '3', campaign_name: 'x', date_start: '2026-10-15', spend: '7.51' },
  ],
  adRows: [
    { ad_id: 'a', ad_name: 'DANBNEXA_ReverseQuote-Instant_v1', campaign_id: '1', spend: '178.18', impressions: '1370', clicks: '38', conversions: calls(4) },
  ],
};

test('totals match Ads Manager', () => {
  const r = buildReport(fixture, cfg, 'maximum');
  assert.strictEqual(Math.round(r.totals.spend * 100) / 100, 450.55);
  assert.strictEqual(r.totals.calls, 6);
  assert.strictEqual(r.totals.thruplays, 2699);
  assert.strictEqual(r.totals.costPerCallActive.toFixed(2), '57.39');
  assert.strictEqual(r.totals.costPerCallLeads.toFixed(2), '70.86');
  assert.strictEqual(r.totals.costPerThruplay.toFixed(4), '0.0094');
  assert.strictEqual(r.from, '2026-10-13');
  assert.strictEqual(r.to, '2026-10-15');
});

test('campaign rows carry status, label and derived rates', () => {
  const r = buildReport(fixture, cfg, 'maximum');
  const lead = r.campaigns.find((c) => c.id === '1');
  assert.strictEqual(lead.label, 'Leads · Oct 13');
  assert.strictEqual(lead.status, 'Active');
  assert.strictEqual(lead.landingPageViews, 4);
  assert.strictEqual(r.campaigns.find((c) => c.id === '2').status, 'Paused');
  assert.strictEqual(r.campaigns.find((c) => c.id === '2').costPerCall, null);
  assert.strictEqual(r.ads[0].costPerCall.toFixed(2), '44.55');
  assert.strictEqual(r.video[5].count, 2705);
});

test('labels follow the naming convention', () => {
  assert.strictEqual(labelFor('DANBNEXA_DanBertsche-NEXA_AWARE_2026-10-09'), 'Awareness · Oct 9');
});
