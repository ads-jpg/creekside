# Spam protection

Three layers, none of which add friction for a real patient.

| Layer | Catches | Cost to a real visitor |
| --- | --- | --- |
| **Honeypot** | Naive form-filling bots | None — hidden field |
| **Timing signal** | Scripted submissions | None — a signal, never enforced in the browser |
| **reCAPTCHA v3** | Sophisticated automation | None — invisible, no checkbox, no puzzle |

**reCAPTCHA v3, not v2.** v2 makes people tick a box and sometimes solve an
image puzzle. On a lead form for a five-figure service that is a measurable
conversion loss for a marginal gain in filtering. v3 runs silently and returns
a score from 0.0 (almost certainly a bot) to 1.0 (almost certainly human).

---

## The part that actually matters

**A reCAPTCHA token means nothing until it is verified server-side.** The
browser only produces a token. Anyone can POST arbitrary JSON straight at your
form endpoint and skip the page entirely. If your endpoint does not call
Google's `siteverify`, reCAPTCHA provides **zero** protection.

`server/verify-lead.js` is a complete working implementation of that half.

---

## Setup

### 1. Get keys

1. Go to <https://www.google.com/recaptcha/admin/create>
2. Choose **reCAPTCHA v3**
3. Add domains: `vidadentistry.com` and `www.vidadentistry.com`
   (add `localhost` too if you test locally)
4. You get a **site key** (public, goes in the page) and a **secret key**
   (server only — never put this in the browser)

### 2. Wire up the page

In `veneers/assets/js/veneers.js`:

```js
recaptchaSiteKey: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxx',
```

### 3. Deploy the endpoint

Deploy `server/verify-lead.js` as a serverless function and point
`CONFIG.formEndpoint` at its URL. Set these environment variables:

| Variable | Value |
| --- | --- |
| `RECAPTCHA_SECRET` | The secret key from step 1 |
| `LEAD_WEBHOOK_URL` | Where accepted leads go — CRM, Zapier, email service |
| `ALLOWED_HOSTNAME` | `www.vidadentistry.com` |

### 4. Verify it works

```bash
node server/verify-lead.test.js
```

Then submit a real test lead and check the function logs show
`"decision":"accept"` with a score.

---

## The scoring policy, and why it is lenient

A veneers case is worth five figures. **Rejecting one real patient costs more
than letting fifty spam messages through** to a human who deletes them in two
seconds. The policy reflects that:

| Outcome | When | What happens |
| --- | --- | --- |
| **accept** | No adverse signals | Forwarded normally |
| **flag** | Something is odd but unproven | **Still forwarded**, marked `spam_review: true` |
| **reject** | Honeypot, forged token, or a low score *corroborated* by another signal | 403 |

The rule worth understanding: **a low reCAPTCHA score alone never rejects a
lead.** It only flags. Rejection needs corroboration — a low score *plus* an
implausibly fast fill, or *plus* links in the message body.

This matters because real patients score low all the time: anyone on a VPN, a
privacy-focused browser, a corporate network, or who arrived without browsing
history. Those are not bots. Several are exactly the affluent, privacy-conscious
demographic that buys veneers.

Two things do reject immediately, because they are unambiguous: the honeypot
being filled, and a token whose `action` or `hostname` does not match — which
means it was minted somewhere other than this form.

### Failing open

Every reCAPTCHA failure path — Google unreachable, ad blocker stripped the
script, key not configured, token expired — results in an **unscored** lead
that is flagged and delivered, never rejected. Your own outage must not cost
you patients. The page mirrors this: if reCAPTCHA fails to load, the form still
submits.

### If a lead is rejected

The page shows "We could not verify this submission. Please call
(949) 209-8889 and we will get you scheduled right away." A misclassified
human always has a route through. Never leave a rejection as a dead end.

---

## Tuning

Thresholds live in one place at the top of `server/verify-lead.js`:

```js
const POLICY = {
  rejectBelow: 0.3,
  flagBelow:   0.7,
  minFillMs:   3000,
  tokenMaxAgeMs: 120000
};
```

**Review the logs weekly for the first month.** Every decision is logged with
its score and flags. What you are looking for:

- Real patients being rejected → loosen, or check whether one signal is
  misfiring
- Spam arriving as `accept` → raise `flagBelow` first, not `rejectBelow`

Do not tighten thresholds on instinct. Look at real rejected-lead data first —
the asymmetry between a lost case and a deleted spam message is enormous.

The reCAPTCHA admin console also shows score distribution for your site, which
tells you where your real traffic actually sits before you pick a threshold.

---

## Effect on the page

**Speed.** The reCAPTCHA library is ~130 KB. It is **not** loaded on page load —
it loads on first interaction with a form (`focusin`). Most visitors never touch
the form, so they never pay for it. This keeps Largest Contentful Paint clean,
which feeds Ads Quality Score.

**The badge.** reCAPTCHA v3 shows a floating badge fixed to the bottom-right,
where it collides with the sticky mobile CTA bar. It is hidden in
`veneers.css`, which Google explicitly permits **provided the attribution text
appears in the form flow** — it does, in the consent line under both submit
buttons:

> This site is protected by reCAPTCHA and the Google Privacy Policy and Terms
> of Service apply.

**Do not remove one without the other.** Hiding the badge without the text
violates Google's terms.

**Privacy.** reCAPTCHA sets cookies and sends data to Google. If you maintain a
privacy policy or a cookie banner, reCAPTCHA should be listed. For EEA traffic
this interacts with consent — see the Consent Mode notes in `TRACKING-SETUP.md`.

---

## What was deliberately not used

- **reCAPTCHA v2 checkbox** — friction on a high-value lead form.
- **Rate limiting by IP alone** — a shared office or clinic NAT would block
  legitimate patients. If you add rate limiting, key it on IP + form together
  and set the ceiling high.
- **Blocking disposable email domains** — high false-positive rate, and someone
  using a privacy alias is still a real prospect.
