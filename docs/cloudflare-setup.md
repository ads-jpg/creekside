# Cloudflare setup for ad-pages.com

One-time platform setup. You only do this once for the whole system, not per client.

## 1. The zone

Add `ad-pages.com` to the Creekside Cloudflare account and point the registrar at the
Cloudflare nameservers. Wait for the zone to go **Active** — nothing below works until it has.

No DNS records need creating by hand. Attaching a Worker custom domain creates the record
for that subdomain automatically.

## 2. The deploy token

**My Profile → API Tokens → Create Token → Create Custom Token.**

| Setting | Value |
|---|---|
| Permissions | Account → Workers Scripts → Edit |
| | Zone → Workers Routes → Edit |
| | Account → Account Settings → Read |
| Account resources | Include → the Creekside account |
| Zone resources | Include → Specific zone → `ad-pages.com` |

Name it `ad-pages deploy`. Store it in the team password manager, and add it to each client
repository as the `CLOUDFLARE_API_TOKEN` secret along with `CLOUDFLARE_ACCOUNT_ID`.

One token across all client repos is fine — they all deploy into the same account and zone.
Rotate it if someone with access leaves.

## 3. How a subdomain gets attached

Each client repo carries its own route in `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "acme-roofing.ad-pages.com", "custom_domain": true }]
```

`custom_domain: true` tells Cloudflare to create the DNS record and issue the certificate on
the first deploy. It takes a minute or two the first time. There is nothing to set up in the
dashboard ahead of it.

Two client repos must never claim the same subdomain — the second deploy will fail. The slug
is unique per client, which keeps that from happening.

## 4. Worth turning on

- **Bot Fight Mode** (Security → Bots). Free, and cuts most of the junk before it reaches
  the Worker. The form's own honeypot and timing check handle the rest.
- **A rate limiting rule** on `/api/lead`, something like 10 requests per minute per IP.
  The free tier allows one rule, and this is the one worth spending it on.
- **Email Routing**, if you want `hello@ad-pages.com` to forward somewhere.

## 5. Costs

Workers' free tier covers 100,000 requests a day across the whole account. A landing page
serves its HTML, one script and a couple of images per visit, and only `/api/lead` actually
invokes the Worker — static files are served straight from the edge and are not billed as
invocations. In practice a normal book of client pages sits inside the free tier. The paid
plan is $5/month if the account outgrows it.
