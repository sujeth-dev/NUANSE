# NUANSE

The website for NUANSE, a Bangalore brand studio, plus the briefs and source
material it is built from.

Static site, no framework, no bundler, no build step. Open `site/index.html`
in a browser and it runs.

---

## Layout

```
site/                  the deployable site — Vercel's root directory
  index.html           home
  services.html        the five disciplines, one drawn artifact each
  process.html         the four stages
  team.html            the studio, and the brief builder
  work/index.html      the proofs, and every client named
  work/<slug>.html     project pages
  assets/
    css/core.css       the shared chassis: tokens, type, nav, cursor, the
                       opening frame, the next-page link, footer
    css/home.css       the home page's seven sections
    css/proofs.css     the pinned proof prints + case overlay (home and /work)
    css/services.css   css/process.css   css/team.css   css/work-index.css
    css/work.css       the project-page layer (accents, chapters, evidence)
    js/boot.js         capability flags, before first paint
    js/core.js         shared behaviour
    js/home.js         the home page's sections
    js/proofs.js       the pinned proof prints + case overlay (home and /work)
    js/services.js     js/process.js     js/team.js
    js/work/           one signature script per project page
    fonts/             self-hosted Gloock, Hanken Grotesk, IBM Plex Mono
    brand/             the NUANSE marks
    work/              per-project imagery
  vercel.json          CSP, caching, clean URLs
  robots.txt  sitemap.xml  site.webmanifest

brief/                 what to build and why — read 00 first
  PROMPT.md            the kickoff prompt
  00-overview.md       where things stand, open questions
  01-requirements.md   four things the rebuild must get right
  02-project-pages.md  the project pages
  03-build-plan.md     plan, setup, develop, test, deploy
  04-asset-inventory.md  what exists, what is missing
  05-conventions.md    motion, spacing, colour, accessibility rules

reference/             two earlier builds. Reference only — neither is edited
assets/                client imagery, web-sized. Source material, not shipped
tools/                 Python scripts that regenerate both asset sets
ASSET-INDEX.md         every delivered asset, mapped to its original path
```

The nav is four pages, not four anchors on one. Anything that appears on
more than one of them lives in `core.css` / `core.js` — including the opening
frame every page but the home page starts with, the edge-to-edge link onward,
the honesty marks (`.needs`, `.src-note`, `.qual-note`), the focus trap and
`loopPath`. A page's own stylesheet and script carry only what is bespoke to
it. The test is the brief's: if a second page imports it, it is not that
page's any more.

Two different things are called `assets`. `site/assets/` is what ships — the
stylesheets, scripts, fonts and marks. The top-level `assets/` is the client
imagery pool the project pages draw from, and most of it is never meant to
ship. Worth renaming one day; the briefs reference the current names
throughout, so it has not been done yet.

---

## Running it

```
# open it directly
start site/index.html

# or serve it, so the paths behave exactly as they will in production
npx serve site
```

## Deploying

Vercel, as a static site. No build command, no framework preset. **Set the
project's Root Directory to `site`** — `vercel.json` lives there.

```
npx vercel          # preview
npx vercel --prod   # production
```

---

## What is built

The home page and the shared chassis every other page will run on. Verified in
headless Chrome against the production CSP across desktop, reduced motion,
touch, a GSAP-less fallback and `file://`: no exceptions, no console errors, no
CSP violations, no broken images, and zero axe-core violations.

Four things the rebuild had to get right, all in:

1. **The real mark**, everywhere the logo appears — nav, loader, marquee,
   favicon, OG card, and the footer's 3D mark, built from eighteen stacked
   copies of the real asset drawn from two files. The letter `s` inside a word
   stays live text; the mark is always the asset.
2. **A cursor with a rest state** — a copper ring that always follows,
   swelling to a labelled disc over a target. Since 2026-10-17 it also has an
   idle state: with no pointer, scroll or key input for 2.4s it leaves the
   pointer, drifts to the centre of the window and breathes there until you
   move. The breath is a CSS keyframe, so the ring rests and breathes even on
   the no-GSAP path, where nothing is driving it.
3. **The S inversion reverts** when you stop hovering. Pure CSS and no state
   everywhere except the home page's headline, where it cannot be: the lens is
   an opaque clone of that layer following the pointer, so a `:hover` turn
   happens underneath it where nobody can see it. There the turn is `.is-turn`,
   set by `home.js` on the glyph and on its twin in the clone, and the loupe
   closes over the headline so the letter answers on the page. The per-visit
   counter survives either way, decoupled from the visual.
4. **The nav is complete on the first slide and half once you scroll** — a
   backed, blurred pill with a sliding indicator, collapsing with hysteresis
   so it cannot flicker at the boundary.

### Notes worth keeping

**The CSP drops `'unsafe-inline'`.** Both directives. That required moving
every `style` attribute out of the markup and into classes, and moving the
capability-detection script into `assets/js/boot.js`. One narrow exception
remains: `'unsafe-hashes'` with a single sha256 that pins exactly
`position:static;transform:translate3d(0,0,1px)` — a `style` attribute GSAP's
Flip plugin sets once on a throwaway div to feature-detect a Safari
`offsetParent` bug. Blocked, that detection silently returns the wrong answer
in every browser. **If GSAP is upgraded, re-check that hash.**

**Fonts are self-hosted**, which drops `fonts.googleapis.com` and
`fonts.gstatic.com` from the CSP and kills the FOUT. Hanken Grotesk is a
single variable file serving 400–600, declared once rather than three times.

**`--copper-ink`** exists because the brand copper is 3.24:1 on stone and
4.06:1 on cream — both short of WCAG AA for text under 24px. It is used only
where copper carries small text. `--copper` itself is untouched and is still
the only copper on the mark, the rules, the fills and every large accent.

**No-JS and no-GSAP both render.** If GSAP fails to load, the script lifts the
curtain, wires the menu by hand and exits. The team portraits and proof images
are built above that guard, so they appear either way.

---

## More than one agent works in this repo

Two or more Claude sessions edit this working tree, sometimes at the same
time. There is no branch per agent and no lock, so the rules are social and
they are these.

**Before you start, read the top of `BUILD-LOG.md` and `git log --oneline -5`.**
Between them they say what the last session changed and, more usefully, what it
deliberately did not. A commit here is the handoff note; the message is written
to be read by whoever picks the file up next, not by a reviewer.

**A line number from an earlier survey may already be stale.** This tree
moves under you: a page can be rewritten between the read that produced your
task list and the edit that acts on it. Match on the text you mean to change,
assert it occurs exactly once, and write nothing at all if any target in the
batch fails to match — that is how a stale list announces itself instead of
silently cutting the wrong line. Re-read the file, then re-plan.

**Commit named paths, never `git add -A`.** The tree may hold another agent's
half-finished edits. Stage the files you actually touched and leave everything
else dirty. If `git status` shows a file you did not edit, that file is someone
else's work in progress — do not stage it, do not revert it, do not rebuild it.

**Do not undo another agent's work unseen.** If something committed earlier
looks wrong, say so in your own commit message and leave it, the way `6874637`
left the audit-trail mark vocabulary with its author. Reverting work you have
not read is the one thing that loses real effort here.

**`BUILD-LOG.md` is newest first.** New entries go directly under the header,
not appended to the end. Both agents append to this file, so an edit to it
should be purely additive — check `git diff --stat BUILD-LOG.md` shows
insertions only before you commit.

**Push when a milestone is verified**, so the other session can fetch rather
than guess. Pull before you start a long pass.

**Who owns what, currently.** `site/index.html`, `home.css`, `home.js` and the
home half of `core.js` are the copy pass. `site/work/`, `work.css`,
`css/work/*`, `js/work/*` and `tools/` are the project pages. When you need to
cross that line, say so in the commit message.

**The constraints do not move.** Static, no framework, no bundler, runs from
`file://`. Three typefaces. The brand marks in `site/assets/brand/` are not
redrawn or recoloured. No client fact that did not come from the user or the
files — a missing figure renders as a visible `[[NEEDS: ...]]`, never as a
plausible guess. If you think something in the design is wrong, say so and wait
for an answer rather than changing it alone.

---

## Verifying

The harness is not in the repo; it is rebuilt per session in the scratchpad.
What it checks, per page, over `/`, `/work/zingara` and `/work/the-possah`, in
four passes — desktop, `prefers-reduced-motion`, mobile 390x844 with touch, and
GSAP blocked:

| Check | What it proves |
|---|---|
| `serve.js` | Serves with the real `vercel.json` headers and `cleanUrls`, not `npx serve`. A CSP violation only appears under the real CSP. |
| `check.js` | Zero console errors, exceptions, CSP violations and failed requests. `--block-cdn` is the no-GSAP pass. |
| `a11y.js` | axe-core, injected via `Runtime.evaluate` so it is exempt from the page CSP. |
| `contrast.js` | Every text node against its own effective background, which catches what axe records as "incomplete". |
| `css-applied.js` | Every linked sheet produced rules, a load-bearing rule from each computes on a real element, and the `@font-face` families loaded. Over HTTP **and** `file://`. |
| `weight.js` | First load and fully-scrolled KB against the 1500 KB budget. |
| `shot.js` | Screenshots at given scroll offsets. **Read them.** Several defects so far were visible only in a rendered frame and in no metric. |

Sample the PNG pixels rather than trusting a glance at a screenshot — a frame
that looked cream under review measured `rgb(17,25,53)`.

---

## Still open

- Naming permission per client, and confirmation of the four case figures
  carried over from the previous build: `+22%` AOV and `−31%` cost per
  reservation on `work/zingara.html`, `2.4×` ROAS and `+38%` product page
  conversion in the overlay cases. The home page no longer states the two
  Zingara figures, so each is now claimed in exactly one place. All four are
  sourced "as published on NUANSE's current site", which is a record of what
  the studio has already said rather than confirmation from the client — so
  they are still open, and a visitor reading that line reads it as a citation.
  Worth either getting the client's confirmation or saying plainly that the
  figures are carried over from the previous site.
- `work/zingara.html` gives its Sector as "Mysore white biryani", where the
  eyebrow two lines above reads "Restaurant · Bangalore". One of the two is
  wrong; a dish is not a sector. Flagged twice now and left for the project
  pages session, because "Restaurant" and "Restaurant · biryani" are both
  plausible intents and it is not a guess worth making quietly.
- The Zingara "before" in the redline slider is a reconstruction, not a
  photograph of the client's original menu. Fine as rhetoric on the home page;
  it needs labelling before it carries a project page.
- The two anonymised proofs on the work index ("D2C fashion", "A GCC,
  Bangalore") cannot be mapped to a named client from anything in this repo.
  Proof 02 looks like it may be The Possah — 24 SKUs, one shoot, and the
  Possah scope lists an AI model photoshoot of 24 SKUs — but if it is, its
  three figures sit against that page's own note that the case sheet's results
  are unfilled stubs. Naming permission is not the blocker; knowing who they
  are is. Confirm, and either name them or drop the figures.
- ~~No client logos ship on the work index.~~ **Done, 2026-10-15.** The claim
  about the files was wrong: all seven in `assets/client-logos/` are 1400px on
  the long edge and clean. `tools/build-client-marks.py` trims each to its ink
  and re-squares it on the ground sampled from its own border; they ship as
  44px chips at 6.9 KB total over the wire. The five clients with no file on
  hand carry set initials instead, which is visibly our setting rather than a
  mark we do not have. **Since 2026-10-17 the same seven also ship on the home
  page**, at 80px on a moving strip carrying all twelve clients, from the same
  files and the same `_grounds.css`. The home page's initial plates sit on
  `--cream` and not `--stone`, because that section's own ground is stone.
- `/services`, `/process`, `/team` and `/work` share `assets/brand/og-default.png`.
  `tools/build-og-cards.py` can give each a card of its own.
- `assets/zingara/food/possah-insta-2-5.jpg` is a Possah frame filed under
  Zingara. Unused by either page; left where it is rather than moved.
- The Possah has two marks: an orange diamond on the guideline boards, and a
  green-ground signature lockup in `assets/client-logos/`. Both ship as
  delivered; neither is picked over the other.
- Home page proof 02 is "D2C fashion · 24 SKUs" and may be Possah, but
  `reference/index-current.html:1870` describes a one-day studio shoot on
  Shopify, which contradicts Possah's "no budget for a studio". Left
  anonymous, and none of its numbers borrowed.
- The three proof prints fail axe's `label-content-name-mismatch` (serious, ×3)
  on **both** `/work` and the home page: `.print[role=button][aria-label]`
  cards whose visible text — "Proof 01", "Zingara · Restaurant", the whole
  drawn menu — is not part of their accessible name. Present at `ff880c0`, so
  it predates the 2026-10-15 cycle. Left standing deliberately: the honest fix
  is structural (a real link inside the card, or a name built from content),
  and fixing one of the two copies of this markup and not the other would
  leave them disagreeing. A longer `aria-label` would satisfy the checker
  without satisfying the rule, which is worse than the defect.
