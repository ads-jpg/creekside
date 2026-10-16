// Live Meta Ads report for one client. No dependencies: Node 18+ built-ins only.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { fetchReport, RANGES } = require('./meta');

const PORT = Number(process.env.PORT) || 3000;
const CACHE_MINUTES = Number(process.env.CACHE_MINUTES) || 15;
const PASSWORD = process.env.REPORT_PASSWORD || '';
const PAGE = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'));
const D3 = fs.readFileSync(path.join(__dirname, '..', 'public', 'd3.min.js'));

const cache = new Map(); // range -> { at, data }
const inflight = new Map();

async function getReport(range) {
  const hit = cache.get(range);
  if (hit && Date.now() - hit.at < CACHE_MINUTES * 60 * 1000) return hit.data;
  if (inflight.has(range)) return inflight.get(range);
  const p = fetchReport(range)
    .then((data) => { cache.set(range, { at: Date.now(), data }); return data; })
    .finally(() => inflight.delete(range));
  inflight.set(range, p);
  return p;
}

function authorized(req) {
  if (!PASSWORD) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [, pass] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  return pass === PASSWORD;
}

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') return send(res, 200, 'text/plain', 'ok');
  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Report"' });
    return res.end('Password required');
  }
  if (url.pathname === '/') return send(res, 200, 'text/html; charset=utf-8', PAGE);
  if (url.pathname === '/d3.min.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'public, max-age=86400' });
    return res.end(D3);
  }
  if (url.pathname === '/api/report') {
    const range = RANGES[url.searchParams.get('range')] ? url.searchParams.get('range') : 'maximum';
    try {
      const data = await getReport(range);
      return send(res, 200, 'application/json', JSON.stringify(data));
    } catch (err) {
      console.error(err);
      return send(res, 502, 'application/json', JSON.stringify({ error: err.message }));
    }
  }
  send(res, 404, 'text/plain', 'Not found');
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Report listening on :${PORT}`));
}

module.exports = { server };
