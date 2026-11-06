'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createMetaClient, MetaError } = require('./lib/meta');
const { buildReport, recentWeeks, weekFrom, addDays } = require('./lib/report');
const snapshot = require('./lib/snapshot');

const DATA_DIR = path.join(__dirname, 'data', 'weeks');

const config = {
  port: Number(process.env.PORT) || 3000,
  token: process.env.META_ACCESS_TOKEN,
  accountId: process.env.META_AD_ACCOUNT_ID || 'act_1228742844209195',
  apiVersion: process.env.META_API_VERSION || 'v21.0',
  graphUrl: process.env.META_GRAPH_URL || 'https://graph.facebook.com',
  timeZone: process.env.REPORT_TIMEZONE || 'America/New_York',
  password: process.env.REPORT_PASSWORD || '',
  cacheMs: (Number(process.env.CACHE_MINUTES) || 15) * 60 * 1000,
  events: {
    formFill: process.env.FORM_FILL_EVENT || 'offsite_conversion.fb_pixel_custom.form_start',
    lead: process.env.LEAD_EVENT || 'offsite_conversion.fb_pixel_lead',
    appointmentMatch: process.env.APPOINTMENT_EVENT_MATCH || 'schedule',
  },
};

const meta = config.token
  ? createMetaClient({ token: config.token, accountId: config.accountId, version: config.apiVersion, baseUrl: config.graphUrl })
  : null;

const cache = new Map();

// Without a Meta token, the report reads weekly snapshots saved from AdKit.
function getSnapshotReport(start) {
  const week = weekFrom(start);
  const prior = { start: addDays(week.start, -7), end: addDays(week.start, -1) };
  const snap = snapshot.readWeek(DATA_DIR, week.start);
  if (!snap) return null;
  const priorSnap = snapshot.readWeek(DATA_DIR, prior.start);
  return {
    ...buildReport({
      week, prior,
      adRows: snapshot.adRowsOf(snap),
      priorAdRows: snapshot.adRowsOf(priorSnap),
      dailyRows: snapshot.dailyRowsOf(snap),
    }),
    priorMissing: !priorSnap,
    accountId: snap.accountId || config.accountId,
    timeZone: config.timeZone,
    source: snap.source || 'AdKit (Meta Ads)',
    fetchedAt: snap.updatedAt,
  };
}

async function getReport(start) {
  const week = weekFrom(start);
  const prior = { start: addDays(week.start, -7), end: addDays(week.start, -1) };
  const key = week.start;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < config.cacheMs) return hit.report;

  const [adRows, priorAdRows, dailyRows] = await Promise.all([
    meta.insights({ level: 'ad', since: week.start, until: week.end }),
    meta.insights({ level: 'ad', since: prior.start, until: prior.end }),
    meta.insights({ level: 'account', since: week.start, until: week.end, daily: true }),
  ]);
  const report = {
    ...buildReport({ week, prior, adRows, priorAdRows, dailyRows, events: config.events }),
    accountId: config.accountId,
    timeZone: config.timeZone,
    source: 'Meta Marketing API',
    fetchedAt: new Date().toISOString(),
  };
  cache.set(key, { at: Date.now(), report });
  return report;
}

// Raw action names Meta returns, to check which events map to which KPI.
async function getEventNames(start) {
  const week = weekFrom(start);
  const rows = await meta.insights({ level: 'account', since: week.start, until: week.end });
  const pick = (list) => (list || []).map((a) => ({ type: a.action_type, value: a.value }));
  return rows.map((r) => ({
    actions: pick(r.actions),
    conversions: pick(r.conversions),
    cost_per_action_type: pick(r.cost_per_action_type),
    cost_per_conversion: pick(r.cost_per_conversion),
  }));
}

function authorized(req) {
  if (!config.password) return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const pass = Buffer.from(header.slice(6), 'base64').toString().split(':').slice(1).join(':');
  const a = Buffer.from(pass), b = Buffer.from(config.password);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
const DATE_RE = /^20\d{2}-[01]\d-[0-3]\d$/;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/healthz') return send(res, 200, { ok: true });

  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Mark My Words Media report"' });
    return res.end('Password required');
  }

  try {
    if (url.pathname === '/' || url.pathname === '/index.html') return send(res, 200, indexHtml, 'text/html; charset=utf-8');

    if (url.pathname === '/api/weeks') {
      const weeks = meta
        ? recentWeeks(config.timeZone, 12)
        : snapshot.listWeeks(DATA_DIR).map((start) => weekFrom(start));
      return send(res, 200, { weeks });
    }

    if (url.pathname === '/api/report' && !meta) {
      const start = url.searchParams.get('start') || snapshot.listWeeks(DATA_DIR)[0];
      if (!start) return send(res, 503, { error: 'No weekly data has been saved yet.' });
      if (!DATE_RE.test(start)) return send(res, 400, { error: 'start must be a date like 2026-10-26' });
      const report = getSnapshotReport(start);
      return report ? send(res, 200, report) : send(res, 404, { error: 'No data saved for that week.' });
    }

    if (url.pathname === '/api/report' || url.pathname === '/api/events') {
      if (!meta) return send(res, 503, { error: 'META_ACCESS_TOKEN is not set on the server.' });
      const start = url.searchParams.get('start') || recentWeeks(config.timeZone, 1)[0].start;
      if (!DATE_RE.test(start)) return send(res, 400, { error: 'start must be a date like 2026-10-26' });
      if (url.searchParams.get('refresh') === '1') cache.delete(weekFrom(start).start);
      const body = url.pathname === '/api/report' ? await getReport(start) : await getEventNames(start);
      return send(res, 200, body);
    }

    send(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    send(res, err instanceof MetaError ? 502 : 500, { error: err.message });
  }
});

server.listen(config.port, () => console.log(`Report running on port ${config.port}`));
