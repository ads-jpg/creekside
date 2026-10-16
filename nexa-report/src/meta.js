// Pulls a client's campaigns from the Meta Marketing API and shapes them for the report page.
// Campaigns are matched by the client code at the start of their name (e.g. "DANBNEXA_").

const GRAPH = 'https://graph.facebook.com';

const RANGES = {
  maximum: 'maximum',
  last_7d: 'last_7d',
  last_14d: 'last_14d',
  last_30d: 'last_30d',
  this_month: 'this_month',
  last_month: 'last_month',
};

const INSIGHT_FIELDS = [
  'campaign_id', 'campaign_name', 'adset_name', 'ad_id', 'ad_name',
  'spend', 'impressions', 'reach', 'clicks', 'ctr', 'cpm',
  'actions', 'conversions',
  'video_play_actions', 'video_thruplay_watched_actions',
  'video_p25_watched_actions', 'video_p50_watched_actions', 'video_p75_watched_actions',
  'video_p95_watched_actions', 'video_p100_watched_actions',
];

function config(env = process.env) {
  const accountId = env.META_AD_ACCOUNT_ID || 'act_1555987259664099';
  return {
    token: env.META_ACCESS_TOKEN,
    accountId: accountId.startsWith('act_') ? accountId : `act_${accountId}`,
    apiVersion: env.META_API_VERSION || 'v21.0',
    prefix: env.CLIENT_PREFIX || 'DANBNEXA',
    // Action types that count as a qualified call, checked in order; the first one present wins.
    callActions: (env.CALL_ACTION_TYPES || 'offsite_conversion.fb_pixel_custom.alpha,offsite_conversion.fb_pixel_custom.add_20_s_calls')
      .split(',').map((s) => s.trim()).filter(Boolean),
  };
}

async function graphGet(cfg, path, params) {
  const out = [];
  let url = new URL(`${GRAPH}/${cfg.apiVersion}/${path}`);
  Object.entries({ ...params, access_token: cfg.token, limit: 500 }).forEach(([k, v]) => {
    url.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  });
  while (url) {
    const res = await fetch(url);
    const body = await res.json();
    if (!res.ok || body.error) {
      const msg = body.error ? body.error.message : `HTTP ${res.status}`;
      throw new Error(`Meta API: ${msg}`);
    }
    out.push(...(body.data || []));
    url = body.paging && body.paging.next ? new URL(body.paging.next) : null;
  }
  return out;
}

const num = (v) => (v === undefined || v === null || v === '' ? 0 : Number(v));
const sumActions = (list) => (list || []).reduce((a, x) => a + num(x.value), 0);
const actionValue = (row, type) => {
  for (const field of ['conversions', 'actions']) {
    const hit = (row[field] || []).find((a) => a.action_type === type);
    if (hit) return num(hit.value);
  }
  return null;
};

function callsFor(row, cfg) {
  for (const type of cfg.callActions) {
    const v = actionValue(row, type);
    if (v !== null) return v;
  }
  return 0;
}

// "DANBNEXA_DanBertsche-NEXA_LEADS_2026-10-13" -> { objective: "LEADS", date: "2026-10-13" }
function parseName(name) {
  const parts = String(name).split('_');
  const date = parts.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p)) || null;
  const objective = parts.find((p) => /^[A-Z]{3,}$/.test(p) && p !== parts[0]) || null;
  return { objective, date };
}

const OBJECTIVE_LABELS = { LEADS: 'Leads', AWARE: 'Awareness', TRAFFIC: 'Traffic', CONV: 'Conversions' };

function labelFor(name) {
  const { objective, date } = parseName(name);
  const obj = OBJECTIVE_LABELS[objective] || objective || name;
  if (!date) return obj;
  const d = new Date(`${date}T00:00:00Z`);
  return `${obj} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
}

function shapeRow(r, cfg) {
  return {
    spend: num(r.spend),
    impressions: num(r.impressions),
    reach: num(r.reach),
    clicks: num(r.clicks),
    calls: callsFor(r, cfg),
    landingPageViews: actionValue(r, 'landing_page_view') || 0,
    thruplays: sumActions(r.video_thruplay_watched_actions),
  };
}

function buildReport({ campaigns, campaignRows, dailyRows, adRows }, cfg, range) {
  const statusById = new Map(campaigns.map((c) => [c.id, c]));
  const labelById = new Map(campaigns.map((c) => [c.id, labelFor(c.name)]));

  const campaignOut = campaignRows.map((r) => {
    const meta = statusById.get(r.campaign_id) || {};
    const m = shapeRow(r, cfg);
    return {
      id: r.campaign_id,
      name: r.campaign_name,
      label: labelById.get(r.campaign_id) || labelFor(r.campaign_name),
      status: meta.effective_status === 'ACTIVE' ? 'Active' : meta.effective_status === 'PAUSED' || meta.effective_status === 'CAMPAIGN_PAUSED' ? 'Paused' : (meta.effective_status || 'Unknown'),
      objective: parseName(r.campaign_name).objective,
      ...m,
      ctr: m.impressions ? m.clicks / m.impressions : 0,
      cpm: m.impressions ? (m.spend / m.impressions) * 1000 : 0,
      costPerCall: m.calls ? m.spend / m.calls : null,
    };
  }).sort((a, b) => b.spend - a.spend);

  const daily = dailyRows.map((r) => ({
    day: r.date_start,
    campaign: labelById.get(r.campaign_id) || labelFor(r.campaign_name),
    ...shapeRow(r, cfg),
  }));

  const ads = adRows.map((r) => {
    const m = shapeRow(r, cfg);
    return {
      id: r.ad_id,
      ad: r.ad_name,
      adset: r.adset_name,
      campaign: labelById.get(r.campaign_id) || labelFor(r.campaign_name),
      ...m,
      ctr: m.impressions ? m.clicks / m.impressions : 0,
      costPerCall: m.calls ? m.spend / m.calls : null,
    };
  }).sort((a, b) => b.spend - a.spend);

  const video = [
    ['Started playing', 'video_play_actions'],
    ['Watched 25%', 'video_p25_watched_actions'],
    ['Watched 50%', 'video_p50_watched_actions'],
    ['Watched 75%', 'video_p75_watched_actions'],
    ['Watched 95%', 'video_p95_watched_actions'],
    ['Watched 100%', 'video_p100_watched_actions'],
  ].map(([stage, field]) => ({ stage, count: campaignRows.reduce((a, r) => a + sumActions(r[field]), 0) }));

  const sum = (k) => campaignOut.reduce((a, r) => a + r[k], 0);
  const leadCampaigns = campaignOut.filter((c) => c.objective === 'LEADS');
  const leadSpend = leadCampaigns.reduce((a, r) => a + r.spend, 0);
  const leadCalls = leadCampaigns.reduce((a, r) => a + r.calls, 0);
  const activeLead = leadCampaigns.filter((c) => c.status === 'Active');
  const activeSpend = activeLead.reduce((a, r) => a + r.spend, 0);
  const activeCalls = activeLead.reduce((a, r) => a + r.calls, 0);
  const videoSpend = campaignOut.filter((c) => c.thruplays > 0).reduce((a, r) => a + r.spend, 0);
  const thruplays = sum('thruplays');

  const days = dailyRows.map((r) => r.date_start).sort();
  return {
    client: cfg.prefix,
    range,
    from: days[0] || null,
    to: days[days.length - 1] || null,
    generatedAt: new Date().toISOString(),
    totals: {
      spend: sum('spend'),
      impressions: sum('impressions'),
      clicks: sum('clicks'),
      calls: sum('calls'),
      thruplays,
      costPerCallLeads: leadCalls ? leadSpend / leadCalls : null,
      costPerCallActive: activeCalls ? activeSpend / activeCalls : null,
      costPerThruplay: thruplays ? videoSpend / thruplays : null,
    },
    campaigns: campaignOut,
    daily,
    ads,
    video: video[0].count ? video : [],
  };
}

async function fetchReport(range = 'maximum', env = process.env) {
  const cfg = config(env);
  if (!cfg.token) throw new Error('META_ACCESS_TOKEN is not set');
  const preset = RANGES[range] || 'maximum';
  const filtering = [{ field: 'campaign.name', operator: 'CONTAIN', value: `${cfg.prefix}_` }];
  const base = { fields: INSIGHT_FIELDS.join(','), date_preset: preset, filtering };

  const [campaigns, campaignRows, dailyRows, adRows] = await Promise.all([
    graphGet(cfg, `${cfg.accountId}/campaigns`, {
      fields: 'id,name,effective_status,objective',
      filtering: [{ field: 'name', operator: 'CONTAIN', value: `${cfg.prefix}_` }],
    }),
    graphGet(cfg, `${cfg.accountId}/insights`, { ...base, level: 'campaign' }),
    graphGet(cfg, `${cfg.accountId}/insights`, { ...base, level: 'campaign', time_increment: 1 }),
    graphGet(cfg, `${cfg.accountId}/insights`, { ...base, level: 'ad' }),
  ]);
  return buildReport({ campaigns, campaignRows, dailyRows, adRows }, cfg, preset);
}

module.exports = { fetchReport, buildReport, config, labelFor, parseName, RANGES };
