# Building a landing page

You do not need to write any code. Everything on the page comes from one file,
`site.config.json`, and this guide walks through it.

## Before you start

You need Node 22 installed (`node --version`), the client's logo and a hero photo, their
phone number, and their approved copy. Get the copy signed off before you build — rewriting
a page after review wastes everyone's afternoon.

## 1. Set the page up

```bash
git clone <your new client repo>
cd <the repo>
npm install
npm run new-client -- --slug acme-roofing --name "Acme Roofing" --am you@creeksidemarketingpros.com
```

The slug becomes the address: `acme-roofing.ad-pages.com`. Use the client's business name,
lowercase, with hyphens. It cannot be changed later without a new repo, so get it right.

Then start the preview and leave it running:

```bash
npm run dev
```

Open http://localhost:4321. It reloads every time you save.

## 2. Add the images

Put them in `public/images/`:

| File | What it is | Size |
|---|---|---|
| `logo.svg` | The client's logo. SVG if they have one, PNG otherwise. | About 300px wide |
| `hero.jpg` | The main photo. Real photos of real work beat stock every time. | 1200×900, under 300 KB |
| `og.png` | What shows when the page is shared in a message. | Exactly 1200×630 |

Compress anything over 300 KB at [squoosh.app](https://squoosh.app) before committing it.
A slow hero image costs you conversions on phones.

## 3. Fill in `site.config.json`

Open it in VS Code. Because the file points at `site.schema.json`, you get autocomplete on
every field and a red squiggle when something is wrong.

**`brand.colors`** — pull these from the client's brand guide. `primary` carries white
button text, so it has to be dark enough to read; the validator will tell you if it isn't.

**`seo.title` and `seo.description`** — what shows in Google and in shared links. The title
wants to be under 70 characters, the description around 150.

**`hero.headline`** — the most important line on the page. It should echo the promise in the
ad that brought the visitor here. If the ad says "Same-day repairs", the headline says
same-day repairs. A mismatch here is the single most common reason a page converts badly.

**`analytics`** — the GA4 ID (`G-…`), the Google Ads ID (`AW-…`) and the conversion label
from the conversion action. Without the label, form submissions are never reported as
conversions and the campaign optimises against nothing.

**`leadForm.fields`** — every field you add costs you leads. Five or fewer. Name, phone and
one qualifying question is usually the right shape. The `consentText` is required whenever
you collect a phone number.

**Sections you do not want:** set `"enabled": false`. Do not delete the block, and do not
try to reorder sections — a consistent running order across every Creekside page is the
whole point of the template.

## 4. Check it

```bash
npm run validate -- --strict
```

It writes plain English, not error codes. Fix whatever it lists and run it again. It will
not pass while the demo copy, the demo phone number or `example.com` are still in there.

Then look at the page in a narrow window, around 375px wide. Most of your traffic is on a
phone. Check the headline does not wrap into a mess, the form is easy to tap, and the sticky
bar at the bottom appears once you scroll.

## 5. Ship it

```bash
git checkout -b launch-acme-roofing
git add -A
git commit -m "Build the Acme Roofing landing page"
git push -u origin launch-acme-roofing
```

Open a pull request. The checklist in the description is the one to work through. A preview
link is posted as a comment within a couple of minutes — that is the page as it will look
live. Tag the landing page lead for review.

When they merge it, it deploys on its own. You do not need to do anything else.

## Changing a page that is already live

Same loop: branch, edit `site.config.json`, validate, pull request, review, merge. Never
push straight to `main` — that is what the review gate is there to prevent.

## When something looks wrong

**The preview will not start.** Delete `node_modules` and run `npm install` again.

**`validate` complains about a colour.** The client's brand colour is too light to carry
white text. Use a darker shade of it for `primary` and keep the light one for `accent`.

**The form says something went wrong.** The lead webhook is not set up yet. That is the
landing page lead's job at launch — flag it to them.

**A change is not showing.** Hard refresh (Cmd/Ctrl + Shift + R). If it still will not show,
check you saved `site.config.json`.
