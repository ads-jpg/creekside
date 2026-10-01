// Order API for the Dressed & Fed page.
// Kept free of Netlify imports so it can be tested against a local Blobs server.
//
// Routes (all JSON):
//   GET    /api/orders                 everyone: list all orders (edit tokens never leave the server)
//   POST   /api/orders                 everyone: { order, token } create an order from this device
//   PUT    /api/orders/:id             { order, token } the device that placed it, or the host
//   DELETE /api/orders/:id             { token } the device that placed it, or the host
//   PATCH  /api/orders/:id/status      host: { status }
//   POST   /api/host                   { passcode } check the host passcode
// The host sends the passcode in the "x-host-passcode" header.
import crypto from 'node:crypto';

const STATUSES = ['Submitted', 'Reviewed', 'Ordered'];
const MAX_ORDERS = 500;

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const sha256 = s => crypto.createHash('sha256').update(String(s)).digest();
const sameSecret = (a, b) => crypto.timingSafeEqual(sha256(a), sha256(b));
const normName = s => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
const wait = ms => new Promise(r => setTimeout(r, ms));

const str = (v, max) => String(v == null ? '' : v).slice(0, max);
const strList = v => Array.isArray(v) ? v.slice(0, 40).map(x => str(x, 100)).filter(Boolean) : [];
const strMap = v => {
  const out = {};
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    Object.keys(v).slice(0, 40).forEach(k => { out[str(k, 30)] = str(v[k], 30); });
  }
  return out;
};

// Accept only the fields the page writes, trimmed to sane sizes.
function cleanOrder(o) {
  if (!o || typeof o !== 'object') return null;
  const name = str(o.name, 80).trim().replace(/\s+/g, ' ');
  const item = str(o.item, 80).trim();
  const itemId = str(o.itemId, 40).trim();
  if (name.length < 2 || !item || !itemId) return null;
  return {
    name, itemId, item,
    num: str(o.num, 4),
    bread: str(o.bread, 60),
    breadKey: str(o.breadKey, 20),
    toasted: !!o.toasted,
    mods: strMap(o.mods),
    adds: strList(o.adds).map(x => x.slice(0, 30)),
    extras: strMap(o.extras),
    notes: str(o.notes, 500).trim(),
    customizations: strList(o.customizations),
    extrasList: strList(o.extrasList)
  };
}
const publicView = ({ tokenHash, ...rest }) => rest;

export function createApi({ store, passcode }) {
  const isHost = req => {
    const want = passcode();
    const got = req.headers.get('x-host-passcode');
    return !!want && !!got && sameSecret(want, got);
  };
  const ownsOrder = (order, token) => !!token && !!order.tokenHash
    && crypto.timingSafeEqual(Buffer.from(order.tokenHash, 'hex'), sha256(token));

  async function allOrders() {
    const { blobs } = await store().list({ prefix: 'order/' });
    const rows = await Promise.all(blobs.map(b => store().get(b.key, { type: 'json' })));
    return rows.filter(Boolean);
  }
  async function readBody(req) {
    try { return await req.json(); } catch (e) { return {}; }
  }
  const sameNameOrder = (orders, name, exceptId) => orders.find(o => normName(o.name) === normName(name) && o.id !== exceptId);

  return async function handle(req) {
    const url = new URL(req.url);
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const method = req.method.toUpperCase();
    try {
      if (parts[0] === 'host' && parts.length === 1 && method === 'POST') {
        const body = await readBody(req);
        if (!passcode()) return json(503, { error: 'not_configured', message: 'The host passcode hasn’t been set up on the server yet.' });
        if (body.passcode && sameSecret(passcode(), body.passcode)) return json(200, { ok: true });
        await wait(700); // slow down guessing
        return json(401, { error: 'wrong_passcode', message: 'That passcode isn’t right.' });
      }

      if (parts[0] !== 'orders') return json(404, { error: 'not_found' });

      if (parts.length === 1 && method === 'GET') {
        const orders = await allOrders();
        return json(200, { orders: orders.map(publicView) });
      }

      if (parts.length === 1 && method === 'POST') {
        const body = await readBody(req);
        const order = cleanOrder(body.order);
        const host = isHost(req);
        if (!order) return json(400, { error: 'invalid', message: 'Please include a name and a sandwich.' });
        if (!host && (typeof body.token !== 'string' || body.token.length < 16)) return json(400, { error: 'invalid', message: 'Missing device token.' });
        const orders = await allOrders();
        if (orders.length >= MAX_ORDERS) return json(507, { error: 'full', message: 'The order list is full. Please tell the host.' });
        const dup = sameNameOrder(orders, order.name);
        if (dup) return json(409, { error: 'duplicate', id: dup.id, message: `${dup.name} already has an order.` });
        const now = new Date().toISOString();
        const saved = Object.assign({ id: 'o' + crypto.randomUUID().replace(/-/g, '').slice(0, 14) }, order, {
          submittedAt: now, updatedAt: now, rev: 1, status: 'Submitted', statusRev: 0,
          tokenHash: body.token ? sha256(body.token).toString('hex') : ''
        });
        await store().setJSON('order/' + saved.id, saved);
        return json(201, { order: publicView(saved) });
      }

      const id = parts[1];
      if (!id || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return json(404, { error: 'not_found' });
      const key = 'order/' + id;
      const existing = await store().get(key, { type: 'json' });
      if (!existing) return json(404, { error: 'not_found', message: 'That order no longer exists.' });

      if (parts.length === 2 && method === 'PUT') {
        const body = await readBody(req);
        const host = isHost(req);
        if (!host && !ownsOrder(existing, body.token)) return json(403, { error: 'forbidden', message: 'Only the phone that placed this order, or the host, can change it.' });
        const order = cleanOrder(body.order);
        if (!order) return json(400, { error: 'invalid', message: 'Please include a name and a sandwich.' });
        const dup = sameNameOrder(await allOrders(), order.name, id);
        if (dup) return json(409, { error: 'duplicate', id: dup.id, message: `${dup.name} already has an order.` });
        const rev = (existing.rev || 1) + 1;
        const saved = Object.assign({}, existing, order, {
          updatedAt: new Date().toISOString(), rev,
          // the host's own edits don't count as "changed after review"
          statusRev: host && existing.statusRev ? rev : existing.statusRev
        });
        await store().setJSON(key, saved);
        return json(200, { order: publicView(saved) });
      }

      if (parts.length === 2 && method === 'DELETE') {
        const body = await readBody(req);
        if (!isHost(req) && !ownsOrder(existing, body.token)) return json(403, { error: 'forbidden', message: 'Only the phone that placed this order, or the host, can cancel it.' });
        await store().delete(key);
        return json(200, { ok: true });
      }

      if (parts.length === 3 && parts[2] === 'status' && method === 'PATCH') {
        if (!isHost(req)) return json(403, { error: 'forbidden', message: 'Only the host can change statuses.' });
        const body = await readBody(req);
        if (!STATUSES.includes(body.status)) return json(400, { error: 'invalid', message: 'Unknown status.' });
        const saved = Object.assign({}, existing, { status: body.status, statusRev: existing.rev || 1 });
        await store().setJSON(key, saved);
        return json(200, { order: publicView(saved) });
      }

      return json(405, { error: 'method_not_allowed' });
    } catch (e) {
      console.error(e);
      return json(500, { error: 'server_error', message: 'Something went wrong saving orders. Please try again.' });
    }
  };
}
