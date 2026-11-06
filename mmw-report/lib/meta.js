'use strict';

// Minimal Meta Marketing API (Insights) client. No dependencies.

const FIELDS = [
  'ad_id', 'ad_name', 'adset_name', 'campaign_name',
  'spend', 'impressions', 'clicks',
  'actions', 'conversions', 'cost_per_action_type', 'cost_per_conversion',
].join(',');

class MetaError extends Error {}

function createMetaClient({ token, accountId, version = 'v21.0', baseUrl = 'https://graph.facebook.com', fetchImpl = fetch }) {
  if (!token) throw new MetaError('META_ACCESS_TOKEN is not set');
  const account = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

  async function getAll(url) {
    const rows = [];
    let next = url;
    for (let page = 0; next && page < 20; page++) {
      const res = await fetchImpl(next);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.error) {
        const msg = body.error ? body.error.message : `HTTP ${res.status}`;
        throw new MetaError(`Meta API error: ${msg}`);
      }
      rows.push(...(body.data || []));
      next = body.paging && body.paging.next;
    }
    return rows;
  }

  function insights({ level, since, until, daily = false }) {
    const params = new URLSearchParams({
      level,
      time_range: JSON.stringify({ since, until }),
      fields: level === 'ad' ? FIELDS : FIELDS.replace('ad_id,ad_name,adset_name,campaign_name,', ''),
      limit: '500',
      access_token: token,
    });
    // Insights only returns entities that delivered, so no spend filter is needed.
    if (daily) params.set('time_increment', '1');
    return getAll(`${baseUrl}/${version}/${account}/insights?${params}`);
  }

  return { insights };
}

module.exports = { createMetaClient, MetaError };
