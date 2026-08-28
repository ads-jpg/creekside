/**
 * Lead intake with spam scoring — reference implementation.
 *
 * Deploy as a serverless function (Vercel, Netlify, Cloudflare Workers) and
 * point CONFIG.formEndpoint in veneers/assets/js/veneers.js at its URL.
 *
 * This file is the half of reCAPTCHA that actually does the work. The browser
 * only produces a token; anyone can POST arbitrary JSON straight at this
 * endpoint, so the token MUST be verified here or reCAPTCHA provides no
 * protection whatsoever.
 *
 * Environment variables:
 *   RECAPTCHA_SECRET  — reCAPTCHA v3 secret key (server-side; never ship to the browser)
 *   LEAD_WEBHOOK_URL  — where accepted leads are forwarded (CRM, Zapier, email service)
 *   ALLOWED_HOSTNAME  — e.g. "www.vidadentistry.com" (optional but recommended)
 */

'use strict';

/* --------------------------------------------------------------------------
   Scoring policy
   --------------------------------------------------------------------------
   A veneers case is worth five figures. Rejecting one real patient costs far
   more than letting several spam messages through to a human who deletes them
   in two seconds. So the policy is deliberately lenient:

     - REJECT only on strong, corroborated evidence of automation.
     - FLAG the uncertain middle band and still deliver it, marked for review.
     - ACCEPT everything else.

   Do not "tighten this up" without looking at real rejected-lead data first.
   -------------------------------------------------------------------------- */
const POLICY = {
  rejectBelow: 0.3,      // reCAPTCHA score under this is treated as suspect...
  flagBelow:   0.7,      // ...and between the two, delivered but flagged
  minFillMs:   3000,     // humans essentially never fill three fields faster
  tokenMaxAgeMs: 120000  // reCAPTCHA tokens expire after 2 minutes
};

/** Verify a reCAPTCHA v3 token with Google. Returns a structured result. */
async function verifyRecaptcha(token, remoteIp) {
  if (!token) return { ok: false, score: null, reason: 'no_token' };
  if (!process.env.RECAPTCHA_SECRET) return { ok: false, score: null, reason: 'not_configured' };

  const body = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  let data;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    data = await res.json();
  } catch (err) {
    // Google unreachable. Fail OPEN — never lose a patient to our own outage.
    return { ok: false, score: null, reason: 'verify_unreachable' };
  }

  if (!data.success) {
    return { ok: false, score: null, reason: 'rejected', errors: data['error-codes'] || [] };
  }

  // The action name binds the token to THIS form. Without this check, a token
  // farmed from any other page on the domain would be accepted here.
  if (data.action !== 'veneers_lead') {
    return { ok: false, score: data.score, reason: 'action_mismatch', action: data.action };
  }

  if (process.env.ALLOWED_HOSTNAME && data.hostname !== process.env.ALLOWED_HOSTNAME) {
    return { ok: false, score: data.score, reason: 'hostname_mismatch', hostname: data.hostname };
  }

  const age = Date.now() - new Date(data.challenge_ts).getTime();
  if (age > POLICY.tokenMaxAgeMs) {
    return { ok: false, score: data.score, reason: 'token_expired' };
  }

  return { ok: true, score: data.score, reason: 'verified' };
}

/** Combine every signal into one decision. */
function assess(lead, recaptcha) {
  const flags = [];

  // Honeypot: a hidden field no human ever sees. Filled = automation, no doubt.
  if (lead.company) return { decision: 'reject', flags: ['honeypot'] };

  switch (recaptcha.reason) {
    case 'verified':
      if (recaptcha.score < POLICY.rejectBelow) flags.push(`low_score:${recaptcha.score}`);
      else if (recaptcha.score < POLICY.flagBelow) flags.push(`medium_score:${recaptcha.score}`);
      break;
    case 'action_mismatch':
    case 'hostname_mismatch':
      // Strong evidence the token was minted somewhere else.
      return { decision: 'reject', flags: [recaptcha.reason] };
    case 'rejected':
    case 'token_expired':
      flags.push(recaptcha.reason);
      break;
    default:
      // no_token / not_configured / verify_unreachable — unscored, not spam.
      flags.push(`unscored:${recaptcha.reason}`);
  }

  if (typeof lead.fill_ms === 'number' && lead.fill_ms < POLICY.minFillMs) {
    flags.push(`fast_fill:${lead.fill_ms}ms`);
  }
  if (/https?:\/\/|\[url=|<a\s/i.test(lead.goals || '')) {
    flags.push('links_in_message');   // classic contact-form spam signature
  }

  // Reject only when a low reCAPTCHA score is CORROBORATED by another signal.
  // A low score on its own is often just an unusual-but-real visitor: a VPN,
  // a privacy browser, or someone who navigated straight in without history.
  const lowScore = flags.some(f => f.startsWith('low_score'));
  const corroborated = flags.some(f => f.startsWith('fast_fill') || f === 'links_in_message');
  if (lowScore && corroborated) return { decision: 'reject', flags };

  return { decision: flags.length ? 'flag' : 'accept', flags };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const lead = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!lead || !lead.name || !lead.phone || !lead.email) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const remoteIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const recaptcha = await verifyRecaptcha(lead.recaptcha_token, remoteIp);
  const { decision, flags } = assess(lead, recaptcha);

  // Log every decision. Without this you cannot tell whether the thresholds
  // are throwing away real patients — review it weekly for the first month.
  console.log(JSON.stringify({
    at: new Date().toISOString(),
    decision,
    flags,
    score: recaptcha.score,
    form_location: lead.form_location,
    gclid: (lead.attribution && lead.attribution.gclid) || null
  }));

  if (decision === 'reject') {
    // 403 makes the page show its "call us instead" message, so a
    // misclassified human still has a route through.
    res.status(403).json({ error: 'Submission could not be verified' });
    return;
  }

  if (process.env.LEAD_WEBHOOK_URL) {
    await fetch(process.env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        recaptcha_token: undefined,          // no need to store it downstream
        spam_review: decision === 'flag',
        spam_flags: flags,
        recaptcha_score: recaptcha.score
      })
    });
  }

  res.status(200).json({ ok: true });
};

// Exported for unit testing.
module.exports.assess = assess;
module.exports.POLICY = POLICY;
