# Creekside Ad Pages — Landing Page Template

The starting point for every client landing page we run on **ad-pages.com**. Each client
gets their own repository made from this template, and each one deploys to its own
subdomain: `acme-roofing.ad-pages.com`.

Astro builds the page, Tailwind styles it, and a small Cloudflare Worker serves it and
catches the leads. There is no CMS and no database — a page is a config file, some
images, and a deploy.

## Who does what

| | Account manager | Landing page lead |
|---|---|---|
| Creates the client repo from this template | | ✅ |
| Fills in `site.config.json` and adds images | ✅ | |
| Opens the pull request | ✅ | |
| Reviews and merges | | ✅ |
| Attaches the subdomain in Cloudflare | | ✅ |

Merging to `main` deploys. Nothing else does.

## Making a new client page

1. **Landing page lead:** click **Use this template** on this repo, name the new one
   `creekside-ad-pages-<client-slug>`, then set up the repo as described in
   [docs/deployment-runbook.md](docs/deployment-runbook.md).
2. **Account manager:** clone it and run:

   ```bash
   npm install
   npm run new-client -- --slug acme-roofing --name "Acme Roofing" --am you@creeksidemarketingpros.com
   npm run dev
   ```

3. Edit `site.config.json` until the page says what the client wants it to say. That one
   file holds every headline, colour, form field and tracking ID on the page.
4. `npm run validate -- --strict` until it passes clean.
5. Open a pull request. A preview link gets posted to it automatically.

Full walkthrough: **[docs/account-manager-guide.md](docs/account-manager-guide.md)**.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local preview at http://localhost:4321, reloads as you edit |
| `npm run validate` | Checks `site.config.json` and explains anything wrong |
| `npm run validate -- --strict` | The launch check — also blocks placeholders and missing tracking |
| `npm run build` | Validates, then builds into `dist/` |
| `npm run preview` | Builds and serves through the real Worker, so the form works |
| `npm run new-client` | Points a fresh copy of the template at a client |
| `npm run deploy` | Deploys by hand. Normally CI does this for you. |

## How it fits together

```
site.config.json ──► Astro components ──► dist/  ──► Cloudflare Worker ──► acme.ad-pages.com
                                                        │
POST /api/lead ─────────────────────────────────────────┘──► CRM webhook
```

- **`site.config.json`** — the only file an account manager needs to touch. `site.schema.json`
  sits beside it, so a decent editor autocompletes the fields and flags mistakes as you type.
- **`src/components/sections/`** — one component per section of the page. The running order is
  fixed on purpose; sections are switched on and off with `"enabled": false`, not rearranged.
- **`public/scripts/main.js`** — plain browser JavaScript. Form validation, ad-click
  attribution, conversion tracking, the sticky mobile bar.
- **`worker/index.js`** — serves the built site and handles `POST /api/lead`.

## What the page does out of the box

- Loads no webfonts and no frameworks; the CSS is inlined, so it is one request to first paint
- Captures `gclid`, `wbraid`, `gbraid`, `fbclid`, `msclkid` and all five UTM parameters, and
  passes them to the CRM with the lead, so conversions can be attributed to the click
- Reports conversions to Google Ads, GA4 and Meta when the form succeeds and when a phone
  link is tapped
- Screens bots with a honeypot field and a minimum fill time, before anything reaches the CRM
- Still submits the form if JavaScript is blocked
- Keeps itself out of Google by default (`seo.noindex`), so it never competes with the
  client's own site

## Where leads go

`POST /api/lead` forwards each lead as JSON to the `LEAD_WEBHOOK_URL` secret — Zapier, Make,
a CRM endpoint, whatever the client uses. Set it before launch:

```bash
wrangler secret put LEAD_WEBHOOK_URL
wrangler secret put LEAD_WEBHOOK_AUTH   # optional Authorization header
```

If delivery fails twice, the visitor is asked to call instead and the full lead is written to
the Worker log so it can be recovered. A page with no webhook configured answers with
`x-lead-delivery: unconfigured` — the launch smoke test in the runbook checks for exactly that.

## Docs

- [Account manager guide](docs/account-manager-guide.md) — building a page, field by field
- [Deployment runbook](docs/deployment-runbook.md) — repo setup, launch, rollback
- [Cloudflare setup](docs/cloudflare-setup.md) — one-time platform setup for ad-pages.com
