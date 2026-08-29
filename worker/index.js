/**
 * Cloudflare Worker for a Creekside landing page.
 *
 *   /api/lead   accepts the form post, screens obvious bots, forwards to the CRM webhook
 *   everything else  is served from the built Astro site in ./dist via the ASSETS binding
 *
 * Set the webhook before launch:
 *   wrangler secret put LEAD_WEBHOOK_URL
 *   wrangler secret put LEAD_WEBHOOK_AUTH     (optional, sent as the Authorization header)
 */

const MAX_FIELDS = 40;
const MAX_FIELD_LENGTH = 2000;
const MIN_FILL_SECONDS = 2;
const WEBHOOK_TIMEOUT_MS = 8000;

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/lead') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405, { allow: 'POST' });
      }
      return handleLead(request, env, ctx);
    }

    // Cloudflare serves matching static files before this Worker ever runs, so the
    // headers and caching for those live in public/_headers. This is the fallback for
    // anything the asset server did not match.
    return env.ASSETS.fetch(request);
  },
};

async function handleLead(request, env, ctx) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');

  let submitted;
  try {
    submitted = await readBody(request);
  } catch {
    return respond(wantsJson, false, 'We could not read that submission.', 400, env);
  }

  // Honeypot: a hidden field no human ever sees. Accept it so the bot stops retrying,
  // but do not pass it on to the CRM.
  if (String(submitted.company_website || '').trim() !== '') {
    console.log('lead rejected: honeypot');
    return respond(wantsJson, true, null, 200, env);
  }

  // Nobody fills in a real form in under two seconds.
  const renderedAt = Number(submitted.form_rendered_at);
  if (Number.isFinite(renderedAt) && renderedAt > 0) {
    const seconds = (Date.now() - renderedAt) / 1000;
    if (seconds < MIN_FILL_SECONDS) {
      console.log(`lead rejected: submitted in ${seconds.toFixed(1)}s`);
      return respond(wantsJson, true, null, 200, env);
    }
  }

  const fields = {};
  let count = 0;
  for (const [key, value] of Object.entries(submitted)) {
    if (key === 'company_website' || key === 'form_rendered_at') continue;
    if (++count > MAX_FIELDS) break;
    fields[key] = String(value ?? '').trim().slice(0, MAX_FIELD_LENGTH);
  }

  const reachable = fields.phone || fields.email;
  if (!fields.name || !reachable) {
    return respond(wantsJson, false, 'Please include your name and a phone number or email.', 422, env);
  }

  const lead = {
    client: env.CLIENT_SLUG || 'unknown',
    site: env.SITE_URL || new URL(request.url).origin,
    receivedAt: new Date().toISOString(),
    fields,
    context: {
      country: request.cf?.country ?? null,
      userAgent: request.headers.get('user-agent') ?? null,
      pagePath: fields.page_path || null,
      referrer: fields.referrer || null,
    },
  };

  const webhook = env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    // Nothing to forward to. Log it so the lead is at least recoverable, and flag the
    // response so the launch smoke test catches the misconfiguration.
    console.error('LEAD_WEBHOOK_URL is not set. Lead captured in logs only:', JSON.stringify(lead));
    return respond(wantsJson, true, null, 200, env, { 'x-lead-delivery': 'unconfigured' });
  }

  const delivered = await deliver(webhook, env.LEAD_WEBHOOK_AUTH, lead);

  if (!delivered) {
    // The visitor is told to call instead, and the full lead goes to the Worker log so
    // it can be recovered. Cloudflare keeps these under Workers > Logs.
    console.error('lead delivery failed, recovery copy:', JSON.stringify(lead));
    return respond(
      wantsJson,
      false,
      'We could not submit that just now. Please call us and we will take your details over the phone.',
      502,
      env,
      { 'x-lead-delivery': 'failed' }
    );
  }

  console.log(`lead delivered for ${lead.client}`);
  return respond(wantsJson, true, null, 200, env, { 'x-lead-delivery': 'ok' });
}

/** One retry, because a single blip in the CRM should not cost a lead. */
async function deliver(webhook, auth, lead) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(auth ? { authorization: auth } : {}),
        },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });
      if (response.ok) return true;
      console.error(`webhook attempt ${attempt} returned ${response.status}`);
    } catch (error) {
      console.error(`webhook attempt ${attempt} threw: ${error?.message ?? error}`);
    }
  }
  return false;
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad payload');
    return parsed;
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...headers },
  });
}

/**
 * JavaScript submissions get JSON. A form posted without JavaScript gets a redirect,
 * so the page still works if a script is blocked.
 */
function respond(wantsJson, ok, error, status, env, headers = {}) {
  if (wantsJson) return json(ok ? { ok: true } : { ok: false, error }, status, headers);

  const target = ok ? env.SUCCESS_PATH || '/thanks' : '/?form=error#lead-form';
  return new Response(null, {
    status: 303,
    headers: { location: target, ...SECURITY_HEADERS, ...headers },
  });
}
