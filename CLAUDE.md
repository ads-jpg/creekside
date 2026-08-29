# Working in this repository

A Creekside client landing page. Astro builds it, Tailwind styles it, plain browser
JavaScript runs it, and a Cloudflare Worker serves it at `<slug>.ad-pages.com`.

## The rule that matters

**Page content lives in `site.config.json`, never in components.** If you are asked to change
a headline, a colour, a form field, a phone number or a tracking ID, edit that file. Reach
for a component only when the request needs behaviour or layout the config cannot express —
and then say so, because a change there affects every client page built from this template.

Section order in `src/pages/index.astro` is deliberately fixed. Sections are switched off
with `"enabled": false`. Do not reorder them to suit one client.

## Layout

| Path | What it is |
|---|---|
| `site.config.json` | Every word, colour and toggle on the page |
| `site.schema.json` | Its schema — update it whenever you add a config field |
| `src/components/sections/` | One component per section, all reading from the config |
| `src/layouts/Base.astro` | Head tags, brand CSS variables, analytics snippets |
| `public/scripts/main.js` | Validation, attribution, conversion tracking, sticky bar |
| `worker/index.js` | Serves the site, handles `POST /api/lead` |
| `scripts/validate-config.mjs` | The gate that stands between a page and production |

## Conventions

- Plain browser JavaScript in `public/scripts/`. No frameworks, no client-side bundling.
  Astro components render at build time; the page ships almost no JavaScript on purpose.
- Tailwind utilities in markup. Shared patterns live as component classes in
  `src/styles/global.css` — extend those rather than inventing parallel ones.
- Brand colours come through CSS variables set in `Base.astro`. Use `bg-brand`, `text-ink`
  and the rest; never hard-code a hex value in a component.
- Every image needs a real `alt`. Every tappable target is at least 44px. Both are checked
  in review, and some of it is checked by the validator.

## After any change

```bash
npm run validate    # must pass
npx astro build     # must succeed
```

If you touched `worker/index.js`, also run `npx wrangler deploy --dry-run` and, when the
change affects `/api/lead`, exercise it against `npx wrangler dev --local`.

Adding a config field means four edits, in this order: `site.schema.json`, the component
that reads it, `scripts/validate-config.mjs` if it can be got wrong, and the account manager
guide if an account manager will ever set it.

## Do not

- Write testimonials, reviews, statistics or credentials. Those come from the client, and
  inventing them is a legal problem, not a copy problem.
- Remove `leadForm.consentText` while the form collects a phone number.
- Commit `.dev.vars` or any live webhook URL.
- Push to `main`. Every change goes through a pull request the landing page lead reviews.
