# Rehearsal Dinner: Jimmy John's order collector

Live page: https://claude.ai/artifact/YG7qQpdb5cTnCVx8j8qQW9

Guests enter their name, pick one sandwich, customize it, add optional sides and a drink, review, and submit. The host (the artifact's owner) gets a live dashboard with totals, search, a sandwich filter, sorting, per-order status (Submitted / Reviewed / Ordered), Copy All Orders, CSV export, and a printable PDF.

This app does **not** place an order with Jimmy John's.

## Storage and access

The page uses the artifact's shared `db` store:

| Path | Who reads | Who writes |
|---|---|---|
| `orders/<viewer id>` | that viewer, and the owner | that viewer (Contributor access or higher), and the owner |
| `admin/status` | owner only | owner only |

Each account holds one document, and that document can hold several people's orders (for example, a couple ordering on one phone). If someone submits the same name twice from one account, the second order replaces the first.

**Limitation:** saving requires a claude.ai account with Contributor access to this artifact. People outside the owner's organization, and anyone without an account, get read-only access. For them the page shows a "Copy my order" button so they can text their order to the host, who can enter it with **Add an order**.

## Menu data

The menu is defined in the `MENU` / `ING` / `EXTRAS` constants in `index.html`. It was compiled in October 2026 from search-indexed text of jimmyjohns.com menu pages. This build environment could not open jimmyjohns.com directly, so **check it against the current menu before sharing**. Items to confirm:

- Sandwich numbers and ingredients (Originals #1–#6, J.J.B.L.T.®, Favorites #7–#17, J.J. Gargantuan®, Toasted, Wraps)
- Bread choices: French 8", Giant French 16", Sliced Wheat, Unwich®; toasting offered for Favorites and J.J.B.L.T.® on French bread
- Modifiers: No / Regular / Extra on included ingredients; the "Add" list
- Sides, desserts, and drinks
- Left out on purpose: limited-time items (BBQ Brisket sandwiches, PB&J Cookie) and Little Johns

## Tests

`test/e2e.mjs` runs the guest flow and host dashboard in Chromium against `test/mock-runtime.js`, a stand-in for the artifact runtime that enforces the same access rules.

```
node test/e2e.mjs [path/to/jspdf.umd.min.js] [screenshot-dir]
```
