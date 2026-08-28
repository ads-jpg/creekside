/**
 * Policy tests for the lead spam filter.
 *
 * Run with:  node server/verify-lead.test.js
 *
 * Re-run these after changing POLICY thresholds in verify-lead.js. The case
 * that matters most is "low score alone" — it must stay `flag`, never
 * `reject`. Real patients on VPNs, privacy browsers, or with no browsing
 * history routinely score low, and rejecting them costs far more than the
 * spam it prevents.
 */

'use strict';

const { assess } = require('./verify-lead.js');

const verified = (score) => ({ ok: true, score, reason: 'verified' });

const CASES = [
  ['clean human, high score',            { name: 'A', fill_ms: 25000 },                              verified(0.9),                                       'accept'],
  ['human, medium score',                { name: 'A', fill_ms: 20000 },                              verified(0.5),                                       'flag'],
  ['low score alone (VPN/privacy user)', { name: 'A', fill_ms: 30000 },                              verified(0.1),                                       'flag'],
  ['low score + fast fill',              { name: 'A', fill_ms: 800 },                                verified(0.1),                                       'reject'],
  ['low score + links in message',       { name: 'A', fill_ms: 40000, goals: 'http://spam.co' },     verified(0.1),                                       'reject'],
  ['honeypot filled',                    { name: 'A', company: 'Acme' },                             verified(0.9),                                       'reject'],
  ['token minted on another page',       { name: 'A', fill_ms: 20000 },                              { ok: false, score: 0.9, reason: 'action_mismatch' },  'reject'],
  ['token from another hostname',        { name: 'A', fill_ms: 20000 },                              { ok: false, score: 0.9, reason: 'hostname_mismatch' },'reject'],
  ['Google unreachable (our outage)',    { name: 'A', fill_ms: 20000 },                              { ok: false, score: null, reason: 'verify_unreachable' }, 'flag'],
  ['ad blocker stripped the token',      { name: 'A', fill_ms: 20000 },                              { ok: false, score: null, reason: 'no_token' },        'flag'],
  ['reCAPTCHA not configured yet',       { name: 'A', fill_ms: 20000 },                              { ok: false, score: null, reason: 'not_configured' },  'flag'],
  ['fast autofill but good score',       { name: 'A', fill_ms: 1200 },                               verified(0.9),                                       'flag'],
];

let failures = 0;

for (const [label, lead, recaptcha, expected] of CASES) {
  const result = assess(lead, recaptcha);
  const pass = result.decision === expected;
  if (!pass) failures++;
  console.log(
    `${pass ? 'ok  ' : 'FAIL'}  ${label.padEnd(34)} -> ${result.decision.padEnd(6)}` +
    `${pass ? '' : ` (expected ${expected}) `}[${result.flags.join(', ')}]`
  );
}

console.log(failures ? `\n${failures} failure(s)` : '\nAll policy cases behave as intended.');
process.exit(failures ? 1 : 0);
