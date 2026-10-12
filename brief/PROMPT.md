# Kickoff prompt

Open a fresh Claude Code session in the folder where you unzipped this kit, and
paste everything between the rules.

---

You are rebuilding the website for NUANSE, a Bangalore brand studio, and
extending it with custom project pages. Everything you need is in this folder.

**Two existing HTML builds are included as reference. You are not editing
either of them.** You are building a new site that takes the design from one,
the interaction corrections from the other, and improves on both with an
architecture neither has.

- `reference/index-current.html` - the most recent build, and the **design
  reference**. Palette, type scale, section sequence, motion feel. Its own
  documentation is in `reference/index-current-NOTES.md`.
- `reference/nuanse-house.html` - an earlier build, superseded in design, kept
  because three of its **interactions** are better. Do not take layout,
  palette or copy from it.

`reference/REFERENCE-NOTES.md` explains exactly what to take from each and what
to leave. Read it before you read either file.

Read these first, in order, before writing any code:

1. `reference/REFERENCE-NOTES.md` - how to use the two reference builds
2. `brief/00-overview.md` - where things stand, what done means, open questions
3. `brief/01-requirements.md` - four things the rebuild must get right, with
   line references into both reference files
4. `brief/02-project-pages.md` - the project pages
5. `brief/03-build-plan.md` - plan, setup, develop, test, deploy
6. `brief/04-asset-inventory.md` - what exists, what is missing
7. `brief/05-conventions.md` - motion, spacing, colour and accessibility rules

Then read both reference HTML files.

## Order of work

- **Phase 0.** Put the open questions at the end of `brief/00-overview.md` to
  me and wait for answers. They change what gets built; do not guess.
- **Phase 1.** The architecture and shared chassis - `brief/03-build-plan.md`.
  Rebuild the home page on it, with all four requirements met.
- **Phase 2.** One project page end to end, as the template.
- **Phase 3.** The remaining pages.
- **Phase 4.** Testing, then deploy.

## What "improve" means here

Rebuilding rather than patching is the point, so improvement is expected - in
these directions:

- **Architecture.** Shared stylesheet and script instead of one 136 KB file,
  so nav, cursor and footer exist once.
- **Correctness.** The four requirements in `brief/01-requirements.md`.
- **Performance.** External CSS and JS let the CSP drop `'unsafe-inline'`;
  self-hosting the three fonts drops two more hosts. Real responsive images.
- **Accessibility.** Hold the existing standard - reduced-motion and keyboard
  paths - on every new page, not as a final pass.

It does **not** mean a new palette, a new type system, a new section order or
a redesigned hero. The design direction is established and I am happy with it.
If you think something in it is wrong, say so and wait for my answer rather
than changing it on your own.

## Constraints - do not change these without asking

- **Static on Vercel.** No framework, no SSR, no client-side router, no
  bundler for the HTML. It must still run by opening a file in a browser.
- **The brand assets in `site/assets/brand/` are the real marks.** Do not
  redraw, recolour or approximate them. The colour tokens are sampled
  pixel-exact from the logo master and are already correct. Do not extract the
  marks embedded in `nuanse-house.html`; they are an older, smaller version.
- **Never invent a client fact.** No percentage, timeline, headcount or
  testimonial that did not come from me or from the files. Where a figure is
  missing, render the visible placeholder `[[NEEDS: ...]]` described in
  `brief/02-project-pages.md`. Ugly placeholders get filled; plausible ones
  ship by accident.
- **Three typefaces only** - Gloock, Hanken Grotesk, IBM Plex Mono. A client's
  typeface appears inside the work shown, never as a page's own voice.
- **The assets are a pool, not a checklist.** `assets/` shows what the work
  looks like and gives you material to reach for. Use only what a page needs -
  four well-chosen boards beat thirty-three, and choosing which four is the
  design work. Most of what is in there should not ship.

## Where things are

- `site/` - where the new site gets built. Already holds `vercel.json`,
  `robots.txt`, `sitemap.xml` and the brand assets in `assets/brand/`. No
  HTML yet; that is yours to write.
- `reference/` - the two existing builds, their notes, and nine live client
  URLs.
- `assets/` - client imagery, web-sized and de-duplicated. The 1.6 GB masters
  are **not** in this kit; `ASSET-INDEX.md` maps every file to its original
  path in `website-n-assets/Website/`.
- `tools/` - Python scripts that regenerate both asset sets from the masters.

Start by reading `reference/REFERENCE-NOTES.md` and the briefs. Then give me
the open questions with your recommendation on each, and your plan for Phase 1.

---
