# NUANSE - where the project stands

## The job

Rebuild the NUANSE site - a Bangalore brand studio - and extend it with custom
project pages.

**Two existing builds are included as reference. Neither is being edited.**
The new site takes its design from one, its interaction corrections from the
other, and improves on both with an architecture neither has.
`reference/REFERENCE-NOTES.md` sets out what to take from each.

- `reference/index-current.html` - the most recent build, 136 KB in one file,
  no build step. This is the **design reference**: palette, type scale,
  section sequence, motion feel. Eleven sections, documented section by
  section in `reference/index-current-NOTES.md`. The design direction here is
  established and is not being replaced.
- `reference/nuanse-house.html` - an earlier, different build. Superseded in
  design; kept because three of its interactions are better and are being
  carried forward.

## What this phase delivers

1. **Four corrections** to the existing page — the real logo in place of the
   typographic S, and three behaviours ported from `nuanse-house`.
   → `brief/01-requirements.md`

2. **Custom project pages** — a shared chassis so the set reads as one studio,
   with exactly one signature element per page, chosen for what that project
   actually was. → `brief/02-project-pages.md`

3. **A production setup** — the single file split into shared stylesheet and
   script plus thin per-page HTML, a tightened CSP, a real favicon and OG set,
   a test pass and a deploy. → `brief/03-build-plan.md`

## The thing to know before planning

Two clients have a complete identity system on file. The rest have a logo and
a live URL.

- **Zingara** — 21 identity boards, 16 food photographs, plus an Amma's
  Breakfast sub-brand.
- **The Possah** — 33 identity boards including a full guidelines document
  with documented hex values, colour ratios, a tagline system and a
  tone-of-voice matrix; plus 33 campaign frames.
- **Velmont, Assetly, Artizen, NAZR, Noir Velin, Shail Interiors, Aware
  Acoustics** — live site and, for some, a logo.
- **Nuozone Studio, Tulipss, Amma's Breakfast** — logo only.

So the recommendation is two full project pages plus a work index carrying the
rest, not seven thin pages. Reasoning in `brief/02-project-pages.md`.

## What "done" means

- Every page ships from one shared chassis. A change to the nav, cursor or
  type scale is made once. Nothing is copy-pasted between pages.
- No typographic stand-in anywhere a mark is meant to be.
- `prefers-reduced-motion`, keyboard and touch paths work on every new page,
  not only the home page.
- Lighthouse: performance ≥ 90 desktop, accessibility 100, no console errors,
  no CSP violations.
- Every client fact is sourced or visibly marked as a placeholder. Nothing
  invented.

---

## Four open questions — answer before Phase 1

These change what gets built. Do not guess.

1. **The nav's two states.** Requirement 4 asks for the menu complete on the
   first slide and half once you scroll. The kit reads that as: full nav on the
   hero, compact pill once scrolled past, expanding again on scroll back.
   Confirm, or describe the two states you mean.

2. **The project list and naming permission.** Confirm which projects get
   pages, and which clients have agreed to be named. The current page names
   Zingara but anonymises two others as "D2C fashion" and "A GCC, Bangalore",
   so permission looks uneven. Also: is Velmont — itself a design studio — a
   client or a peer?

3. **The S counter.** In the current build, hovering an S flips it
   permanently and a counter climbs; typing `nuanse` flips every S on the
   page. Requirement 3 makes the flip revert on un-hover. Does the counter survive — counting distinct S's
   found, while the visual reverts — or does the collectible go entirely?

4. **The domain.** `canonical`, `og:url`, `robots.txt` and `sitemap.xml` all
   point at `nuanse-draft.vercel.app`. The real domain is needed before OG
   images and the sitemap can be finished.

One more, lower stakes but worth raising early: **is there a vector original
of the logo?** The masters here are raster. It is not a blocker — the source is
6496px and flat two-colour — but if a designer has the AI or Figma file, an SVG
export is a free upgrade. See `brief/04-asset-inventory.md`.
