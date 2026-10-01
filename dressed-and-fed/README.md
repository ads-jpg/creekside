# Dressed & Fed

The getting-ready menu: everyone picks their Jimmy John's order for the wedding day from a link. Orders save automatically, everyone can see who has ordered, and the host gets a passcode-protected dashboard (totals, statuses, search, CSV, PDF, print).

This app does **not** place an order with Jimmy John's.

## How it's built

| Part | What it is |
|---|---|
| `public/index.html` | The page guests and the host use |
| `netlify/functions/api.mjs` | Netlify Function at `/api/*` |
| `lib/api-core.mjs` | Order rules (who can change what) |
| Netlify Blobs | Where orders are stored (built into Netlify, nothing to set up) |

- **Guests** can see every order. They can add orders, and edit or cancel only the orders placed from their own phone. Each phone keeps a private random key; the server stores only a hash of it.
- **One order per name.** If a name is already taken from another phone, the page says so instead of overwriting the order.
- **The host** unlocks the dashboard with the passcode set in `HOST_PASSCODE`, and can edit, remove, or change the status of any order.

## Put it online (Netlify, free)

1. Sign in at [netlify.com](https://www.netlify.com) (a free account is enough).
2. **Add new site → Import an existing project → GitHub**, and pick the `ads-jpg/creekside` repository.
3. On the settings screen:
   - **Branch to deploy:** the branch that has this folder (`claude/intelligent-dijkstra-fwwygi`, or `main` once it's merged).
   - **Base directory:** `dressed-and-fed`
   - Leave the build command empty. `netlify.toml` sets everything else.
4. Click **Deploy**.
5. **Site configuration → Environment variables → Add a variable**: key `HOST_PASSCODE`, value = a passcode only you know (use something longer than 4 digits). Then go to **Deploys → Trigger deploy → Deploy site** so the passcode takes effect.
6. **Site configuration → Change site name** → `dressed-and-fed` (or any name that's free). Your link becomes `https://dressed-and-fed.netlify.app`.

Share that link. To open your dashboard, go to `https://<your-site>.netlify.app/#host`, or tap **Host** at the bottom of the page, and enter your passcode.

## Before you share: check the menu

The menu (in `public/index.html`: `MENU`, `ING`, `EXTRAS`) was compiled from search-indexed text of jimmyjohns.com pages in October 2026, because the build environment couldn't open jimmyjohns.com directly. Check sandwich numbers, ingredients, breads, add-ons, sides and drinks against the current menu. Left out on purpose: limited-time items (BBQ Brisket sandwiches, PB&J Cookie) and Little Johns.

## Run and test locally

```
npm install
HOST_PASSCODE=test node test/server.mjs     # http://localhost:8888
node test/e2e.mjs [path/to/jspdf.umd.min.js] [screenshot-dir]
```

`test/server.mjs` serves the page and runs the same API code against Netlify Blobs' local server. `test/e2e.mjs` drives several "phones" and the host in Chromium.

## After the wedding

Delete the Netlify site (**Site configuration → Delete site**). That removes the page and every stored order.
