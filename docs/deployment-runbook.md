# Deployment runbook

For the landing page lead. Everything here assumes the one-time platform setup in
[cloudflare-setup.md](cloudflare-setup.md) is already done.

## Creating a client repo

1. On the template repo, **Use this template → Create a new repository**. Name it
   `creekside-ad-pages-<slug>`, private.
2. Edit `.github/CODEOWNERS` and replace `@REPLACE-WITH-LANDING-PAGE-LEAD` with your
   GitHub handle.
3. **Settings → Rules → New branch ruleset**, targeting `main`:
   - Require a pull request before merging, 1 approval
   - Require review from Code Owners
   - Require status checks: `Validate and build`
   - Block force pushes
4. **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — the ad-pages deploy token
   - `CLOUDFLARE_ACCOUNT_ID`
5. Hand the repo to the account manager and point them at
   [the account manager guide](account-manager-guide.md).

Until `npm run new-client` has been run, the deploy workflow deliberately does nothing —
it sees the `demo-client` slug and stops. That keeps an untouched copy of the template
from publishing itself.

## Reviewing a page

The Checks workflow posts a preview link on the pull request. Work through the reviewer
half of the pull request checklist. The three that actually catch problems:

- **Open the preview on a real phone.** Narrow desktop windows hide thumb-reach issues.
- **Submit the form.** Confirm the lead lands wherever it is supposed to land.
- **Check the offer.** If the page promises `$50 off`, somebody at the client has to honour it.

Merge when it is right. The deploy runs on merge and finishes by checking the live domain
returns 200; if the custom domain is not attached yet, that step fails loudly, which is what
you want.

## Launching

Before the first merge:

```bash
# from the client repo
npx wrangler secret put LEAD_WEBHOOK_URL      # where leads go
npx wrangler secret put LEAD_WEBHOOK_AUTH     # optional, sent as the Authorization header
```

Attach the subdomain. `npm run new-client` already wrote the route into `wrangler.jsonc`,
so the first deploy creates it. Confirm under **Workers & Pages → the worker → Settings →
Domains & Routes** that `<slug>.ad-pages.com` is listed as a custom domain.

Then run the smoke test:

```bash
slug=acme-roofing

# the page is up
curl -sI https://$slug.ad-pages.com | head -1

# leads are actually being delivered — this header must say "ok", never "unconfigured"
curl -s -D - -o /dev/null -X POST https://$slug.ad-pages.com/api/lead \
  -H 'content-type: application/json' -H 'accept: application/json' \
  -d '{"name":"Launch Test","phone":"5555550123","form_rendered_at":"1"}' \
  | grep -i x-lead-delivery
```

`x-lead-delivery: unconfigured` means the webhook secret is missing and every lead is going
into the logs instead of the CRM. Fix that before traffic is switched on.

Delete the test lead from the CRM afterwards.

## Rolling back

```bash
npx wrangler deployments list
npx wrangler rollback [deployment-id]
```

That reverts the live page immediately. Follow it with a revert commit on `main` so the
repository and production do not drift apart.

## Where leads go when something breaks

The Worker tries the webhook twice. If both fail, the visitor is told to call instead, and
the whole lead is written to the Worker log. Recover them under **Workers & Pages → the
worker → Logs**, filtering for `recovery copy`. Logs are short-lived, so chase a failing
webhook the same day.

For a client sending real volume, turn on Logpush to keep a durable copy.

## Routine upkeep

- **Dependencies:** bump Astro, Tailwind and Wrangler on the template every quarter, then
  let client repos pick it up when they next change.
- **Retiring a page:** `npx wrangler delete` removes the Worker and its route. Archive the
  repository rather than deleting it, so the campaign history survives.
