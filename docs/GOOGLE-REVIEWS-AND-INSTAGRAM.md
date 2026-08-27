# Google Reviews & Instagram — what is actually possible

Both sections on the veneers page are **data-driven, not hard-coded**. Neither one
ships with invented reviews, ratings, counts, or images. If an endpoint is not
configured, each section degrades to something truthful (a real link out) rather
than fake content.

This document is the honest answer to "can we pull these dynamically?"

---

## 1. Google Reviews

### The short answer

**Yes — the star rating and review count can be pulled live and displayed accurately.
Individual review text can be pulled live too, but Google caps it at 5 reviews
through the public API.** Getting *all* ~100 reviews requires the Business Profile
API, which needs Google's approval.

### Option A — Places API (New) · recommended starting point

The practical default. No approval process, live data, ships today.

```
GET https://places.googleapis.com/v1/places/{PLACE_ID}
    ?fields=rating,userRatingCount,reviews
    &key={API_KEY}
```

| What you get | Detail |
| --- | --- |
| `rating` | Live average, e.g. `5` |
| `userRatingCount` | Live total review count |
| `reviews[]` | **Maximum 5.** Google does not paginate this. Each has text, author name, author photo, relative time, and a link to the review |

**Hard limits, stated plainly:**

- **5 reviews is a ceiling, not a default.** There is no parameter, no paging token,
  and no billing tier that raises it.
- You cannot choose *which* 5. Google returns what it considers most relevant.
- The API key **must not** be exposed in browser JavaScript. It has to be called
  server-side.
- Google's terms require the reviews be attributed to Google and linked back. The
  page does this in the section footnote and on every review card.
- Most Places data may not be cached beyond 30 days (the Place ID itself may be
  cached indefinitely). A 6–24 hour cache is the sweet spot: fresh enough, and it
  keeps API cost near zero.

**Setup:**

1. Google Cloud Console → enable **Places API (New)** → create an API key,
   restricted to your server's IP.
2. Find the Place ID for Vida Dentistry with Google's Place ID Finder.
3. Deploy a small cached proxy (Vercel/Netlify/Cloudflare function). It calls the
   Places API at most a few times a day and returns JSON to the browser.
4. Set `reviewsEndpoint` in `veneers/assets/js/veneers.js` to that URL.

The page expects exactly this shape, which is what the Places API already returns:

```json
{
  "rating": 5,
  "userRatingCount": 104,
  "reviews": [
    {
      "rating": 5,
      "text": { "text": "…" },
      "relativePublishTimeDescription": "2 weeks ago",
      "authorAttribution": { "displayName": "…", "photoUri": "…", "uri": "…" }
    }
  ]
}
```

### Option B — Google Business Profile API · all reviews, needs approval

Because Vida Dentistry **owns** the listing, the Business Profile API can return
**every** review, with pagination, plus the ability to reply to them.

- Endpoint lives on the legacy v4 surface:
  `GET https://mybusiness.googleapis.com/v4/accounts/{acct}/locations/{loc}/reviews`
- Requires OAuth as the profile owner **and** a submitted access request to Google
  for the Business Profile APIs. Approval typically takes days to weeks.
- Once approved this is strictly better than Option A: unlimited reviews, full
  control over which to feature, and no 5-review ceiling.

**Recommendation: apply for this now, ship Option A in the meantime.** The page
does not need to change when you switch — only the proxy behind `reviewsEndpoint`.

### Option C — third-party review widgets

Elfsight, Trustindex, EmbedSocial, Featurable, Reviews on My Website.

- **Upside:** no approval, no server code, some sync more than 5 reviews.
- **Downside:** most drop 100–400 KB of third-party JavaScript and an iframe onto
  the page. On a Google Ads landing page that is a direct hit to Largest
  Contentful Paint, which feeds Ads' landing page experience score and your CPC.
- If you go this route, **Featurable** (free, JSON API, no client-side bundle) is
  the lightest fit — you would point `reviewsEndpoint` at it and change nothing else.
- Avoid the heavy iframe widgets on this particular page.

### What the page deliberately does NOT do

- **No `aggregateRating` in the structured data.** Google's structured data policy
  disallows self-serving review markup — a business marking up reviews about
  itself on its own site. Adding it risks a manual action against the whole
  domain and it would not produce stars in search results anyway. The live rating
  is displayed visually instead, which is fully permitted.
- **No hard-coded "5.0 from 104 reviews".** Counts move. A stale number on a
  premium page reads as careless, and if it drifts from the real profile it is
  simply false. The badge renders whatever the API reports and, until the endpoint
  is live, reads "Rated on Google — read our reviews".

### Google Business Profile link

The URL you supplied contains `authuser=1` and a session-bound `mat=` parameter,
so it will not work reliably for visitors. The page instead uses the official
Maps URL scheme, which resolves for everyone:

```
https://www.google.com/maps/search/?api=1&query=Vida%20Dentistry%2025270%20Marguerite%20Pkwy%20Mission%20Viejo%20CA
```

Once you have the Place ID, swap `googleProfileUrl` in the JS config for the
canonical form — and consider using the "write a review" variant on post-visit
follow-ups:

```
https://search.google.com/local/reviews?placeid={PLACE_ID}
https://search.google.com/local/writereview?placeid={PLACE_ID}
```

---

## 2. Instagram — @veneergoddess

### The critical fact

**The Instagram Basic Display API was shut down on 4 December 2024.** Most
"how to embed your Instagram feed" tutorials still online reference it and no
longer work. Anything built on it is dead.

### What works now

**Instagram API with Instagram Login** (part of the Instagram Graph API).

Requirements:

1. **@veneergoddess must be a Professional account** — Business or Creator. A
   personal account cannot use this API at all. (Converting is free and takes a
   minute in the Instagram app; it does not change how the account looks.)
2. A Meta app at developers.facebook.com with the Instagram product added.
3. OAuth authorization by the account holder, producing a long-lived access token.

Then:

```
GET https://graph.instagram.com/me/media
    ?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp
    &access_token={TOKEN}
```

This returns genuinely recent posts. That is real dynamic pulling — exactly what
you asked for.

### The catch nobody mentions until it breaks

**Long-lived Instagram tokens expire after 60 days.** They must be refreshed
before expiry:

```
GET https://graph.instagram.com/refresh_access_token
    ?grant_type=ig_refresh_token&access_token={TOKEN}
```

A token that lapses takes the feed down silently. Any self-hosted implementation
**needs a scheduled job** (daily cron) that refreshes the token and alerts on
failure. This is the single most common reason DIY Instagram feeds die a couple of
months after launch.

### Recommendation

**For reliability with minimal maintenance: use a hosted feed provider that owns
the token-refresh problem.** [Behold.so](https://behold.so) is the best fit here —
it authenticates once, refreshes tokens itself, and exposes a plain JSON feed with
no client-side JavaScript bundle. Point `instagramEndpoint` at the Behold feed URL
and the page works as built; images render as native lazy-loaded `<img>` tags.

**If you prefer to own it end to end:** Meta app + serverless function that caches
the feed for 1–6 hours + a daily cron for token refresh. Same endpoint contract,
no page changes. More control, more upkeep.

**What to avoid:** drop-in widget scripts (Elfsight, SnapWidget, LightWidget) that
inject an iframe and 200 KB+ of JavaScript. On an Ads landing page that is a real
conversion and Quality Score cost.

### How the page handles it

- The feed request is **lazy** — it fires only when the section nears the viewport
  via `IntersectionObserver`. Visitors who convert above the fold never pay for it.
- Images are native `<img loading="lazy" decoding="async">` in a CSS grid. No
  iframe, no third-party runtime, no layout shift.
- If the endpoint is missing or fails, the grid removes itself and the section
  keeps its heading and the genuine "Follow on Instagram" CTA. **No placeholder
  images are ever substituted for real posts.**
- Every tile links to the actual post permalink and is click-tracked.

Expected shape (what the Graph API returns natively):

```json
{ "data": [ { "id": "…", "caption": "…", "media_type": "IMAGE",
              "media_url": "…", "thumbnail_url": "…", "permalink": "…" } ] }
```

### One caveat on Instagram imagery

Instagram CDN URLs (`media_url`) are signed and rotate periodically. Cache the
*feed*, not the image URLs, and re-fetch on a schedule. If you cache image URLs
for days, they will start 403-ing. Hosted providers like Behold mirror the images
and side-step this entirely — another reason to prefer one.

---

## Summary

| Ask | Possible? | How |
| --- | --- | --- |
| Live Google star rating + review count | **Yes** | Places API (New), cached proxy |
| Live Google review text | **Yes, capped at 5** | Places API (New) |
| *All* ~100 Google reviews | **Yes, with approval** | Business Profile API v4 |
| Clickable Google badge → profile | **Yes, working now** | Built in, official Maps URL |
| Live recent Instagram posts | **Yes** | Graph API w/ Instagram Login, or Behold.so |
| Instagram without a Professional account | **No** | Account must be converted first |
| Instagram via Basic Display API | **No — shut down Dec 2024** | Use the above instead |
