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
  contact.html         the two routes: a brief that composes its own mail,
                       and the audit
  work/index.html      the proofs, and every client named
  work/<slug>.html     project pages
  assets/
    css/core.css       the shared chassis: tokens, type, nav, cursor, the
                       opening frame, the next-page link, footer
    css/home.css       the home page's seven sections
    css/proofs.css     the pinned proof prints + case overlay (home and /work)
    css/services.css   css/process.css   css/team.css   css/work-index.css
    css/contact.css    the contact page's two routes
    css/work.css       the project-page layer (accents, chapters, evidence)
    js/boot.js         capability flags, before first paint
    js/core.js         shared behaviour
    js/home.js         the home page's sections
    js/proofs.js       the pinned proof prints + case overlay (home and /work)
    js/audit.js        the eight-question audit (home and /contact)
    js/contact.js      the brief that composes its own mailto
    js/services.js     js/process.js     js/team.js
    js/work/           one signature script per project page
    fonts/             self-hosted Gloock, Hanken Grotesk, IBM Plex Mono
    brand/             the NUANSE marks
    work/              per-project imagery
  vercel.json          CSP, caching, clean URLs
  .vercelignore        build intermediates kept out of the deploy
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

   One place has no cursor at all: inside the home page's hero, where the lens
   is the cursor. `home.js` puts `.cur.off` on the ring and `home.css` sets
   `cursor:none` on the section, so the circle is the only pointer device
   there. The exception to the exception is the hero's own controls — the lens
   yields over a button and the native pointer comes back with it, because the
   lens is opaque and a hovered button under it shows its hover state where
   the circle is covering it. `.cur.off` and not `.cur.hide`: `core.js`'s
   pointermove handler clears `hide` unconditionally, so a ring hidden with it
   returns on the first movement.
3. **The S inversion reverts** when you stop hovering. Pure CSS and no state
   everywhere, including the home page's headline — which it was not until
   2026-10-20, and the way it got there is worth keeping. The lens is an
   opaque clone of the headline layer following the pointer, so a `:hover`
   turn on the layer underneath happens where nobody can see it. That used to
   be solved twice over: `home.js` marked `.is-turn` on the hovered glyph AND
   on its twin in the clone, matched by index, and the loupe closed itself
   over the headline so the letter could answer on the page. Both of those
   are now gone. Every S in the lens layer is turned in CSS
   (`.lens .s{transform:scaleX(-1)}`, the interaction reference's own model),
   so the circle crossing a line **is** the turn, and it reverts as the circle
   passes. The lens no longer closes over the headline, because the headline is
   the one place it has something to say. The base layer keeps a hover turn for
   the keyboard and for a latched lens. The per-visit counter was always
   decoupled from the visual and still is.
4. **The nav is complete on the first slide and half once you scroll** — a
   backed, blurred pill with a sliding indicator, collapsing with hysteresis
   so it cannot flicker at the boundary. **Since 2026-10-20 it is also not
   persistent** (item A1, decision D1): present and expanded for the whole
   opening frame, hidden on scroll-down, revealed on scroll-up, and revealed
   by a focusin so the links stay reachable from the keyboard while it is
   away. Its opening theme is declared in each page's markup as
   `<header class="nav dark">` rather than set by JS — six of the eight pages
   open on a dark ground, and with GSAP blocked the JS that used to set it
   never runs at all, so for those pages the header was navy ink on near-black
   for the whole visit.

### Notes worth keeping

**One fluid scale, and nothing off it.** Since 2026-10-20 (item A7) every
fluid length comes from a rung in `core.css`'s scale, and every rung runs from
its floor at **390px** to its ceiling at **1440px**, linearly. So at any width
every step sits at the same fraction of its own travel — 0.00 at 390, 0.36 at
768, 0.85 at 1280, 1.00 from 1440 up — and a hierarchy composed on one screen
survives to the next. Before this, each value had its own `vw` coefficient and
so its own ceiling width, from `.menu a` at 646px to `.ft-word` at 1846px:
at 768 the menu link was fully grown while `--sec-y` had not started, and at
1440 `.h2` was pinned while `.pg-next b` still had a fifth to climb.

1440 is where the content box stops growing — `--gut` makes the measure a
fixed 1312px above it — so type keyed past that point grows against a box that
does not. `.ft-word` was the proof: it climbed to 360px at 1846px of viewport,
`nowrap`, in a 1320px container under `overflow:hidden`, and was clipped on
every wide screen with no metric saying so.

To add a step, do not write a bare `clamp()`. Set the two ends as unitless px
numbers and take `var(--fluid)`:

```css
.thing{--f-min:22; --f-max:38; font-size:var(--fluid)}
```

`--fluid` is declared on `*` and **it has to be.** A custom property's value
is substituted at computed-value time on the element where it is *declared*,
so on `:root` the `var(--f-min,16)` inside it resolves against `:root` — which
has no `--f-min` — and every descendant inherits a frozen
`clamp(16px,16px,16px)` instead of the recipe. It renders without complaining,
which is the one failure mode a scale token must not have. There is exactly
one declared exception to the ramp site-wide: `.ft-word` below 600px is keyed
to `22vw`, because `.ft-mid` stacks there and it is the one element meant to
touch both gutters. Anything else off the ramp is a bug.

**Verifying a scale token means putting it on an element.**
`getComputedStyle(root).getPropertyValue('--fs-h2')` returns the token stream
`clamp(46px, 24.46px + 5.524vw, 104px)`, not a length — `parseFloat` on it is
`NaN`. Set the token on a real property of a real element and read the
computed value back.

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

**Two things the harness has to be told, both learned the hard way on
2026-10-20. Neither is optional and both look like site defects when missed.**

*`page.waitForFunction()` cannot be used to wait for anything this site does.*
Its poll does not wake a sleeping renderer, and a headless Chromium with
nothing else touching it stops servicing `requestAnimationFrame` within a
frame or two of load. GSAP's ticker **is** rAF, and `core.js` drives Lenis off
that ticker, so the loader timeline freezes and `<html>` stays
`js loading lenis-stopped` indefinitely. Every page appears to hang past 20s.
`page.evaluate()` does wake it, so every wait must be a loop of evaluates,
which both polls the condition and keeps the clock running. Polled that way
the pages boot in about 1.2s. The way this was identified as a harness
artefact rather than a regression was to reproduce it against a pristine
`git archive HEAD` tree served on a second port — worth doing before believing
any hang.

*Playwright disables the back/forward cache, and some bugs only live there.*
It passes `--disable-back-forward-cache` in its own default args, which
silently beats any `--enable-features=BackForwardCache` you add, so Back is an
ordinary fresh load. `ignoreDefaultArgs: ['--disable-back-forward-cache']`
drops it. A6 — the curtain left covering a restored page — exists *only* on a
persisted restore, so a first pass over it found nothing at all. The tell that
the cache is live is that `page.goBack({waitUntil:'load'})` times out: a
bfcache restore fires no `load` event, only `pageshow` with
`event.persisted === true`.

A third, smaller one: the serving layer must emulate `cleanUrls`' `.html`
redirect, not just its extensionless resolution. Without it the harness takes
a different path through the site than a browser does — see the note about
`site/work/index.html`'s relative links under **Still open**.


---

## Still open

- ~~The two case pages' sources were stale, and re-expanding them would have
  destroyed work.~~ **Done, 2026-10-21 (session CD).** C1/C2 rebuilt the
  problem and system sections of both pages, and the restructure was written
  straight into `_zingara.src.html` and `_the-possah.src.html` — the cheapest
  honest path the 2026-10-20 note recommended, since those sections were
  being rebuilt anyway. Both pages now round-trip from source again; verify
  with `python tools/expand-figures.py zingara site/work/_zingara.src.html
  site/work/zingara.html` (and `possah` for the other, not `the-possah` —
  the manifest is at `site/assets/work/possah/_manifest.json` and the obvious
  guess is a `FileNotFoundError`).
- ~~`site/work/index.html` links to the case pages one directory too
  high.~~ **Done, 2026-10-21 (session CD).** Fixed in both places it
  occurred: the hand-written proof print (`href`/`data-href`) and
  `tools/build-roster.py`'s template, which now renders `work/` onto the
  stored href when writing a card into this page specifically — the stored
  value in `tools/clients.json` stays slug-relative (`zingara.html`) because
  the existence check still resolves it against `site/work/`. Traced, not
  reproduced live: `npx serve` does not emulate `cleanUrls`' no-trailing-
  slash behaviour, so this needs the real `vercel.json` serving layer (see
  **Verifying**) to exercise the actual bug.
- Three overflow reports that are **not** scale-related and were still present
  at all five widths on 2026-10-20, each in someone else's file:
  `div.stack` 448 against 430 on `/` and `/work` (`proofs.css`); three SVG
  `<text>` nodes in `services.html`; and `p.pv-say` on `the-possah` with a
  `clientWidth` of 1. Check whether any is a *transform* rather than a width
  before changing a size — a scaled box contributes to an ancestor's
  scrollable overflow without anything being visibly wrong, and the home
  hero's 7px overflow turned out to be exactly that.

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
- ~~`work/zingara.html` gives its Sector as "Mysore white biryani", where the
  eyebrow two lines above reads "Restaurant · Bangalore".~~ **Done, 2026-10-21
  (session CD).** Sector now reads "Restaurant", matching the eyebrow. The
  dish name is not lost — it is still in the eyebrow's scope line, the zm
  signature's own sub-line, the meta description and the scope list — so
  nothing true left the page, only the one field that was answering the
  wrong question.
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
- ~~The ten portraits on `/team` are drawn, because no team photography is on
  file.~~ **Done, 2026-10-22.** It is on file now: `assets/people/` holds ten
  matched studio frames, black and white on one grey ground, every one 4:5.
  `tools/build-team-photos.py` writes them to `site/assets/team/` as AVIF,
  WebP and JPEG at 240 and 480, content-hashed, and writes the srcsets to
  `site/assets/js/team-photos.js` for `team.js` to read - the same shape as
  the generated `clients.js`. The photograph is what each card shows at rest;
  the drawn portrait is still built and comes up over it on hover, so the
  drawings are not retired. A record with no `photo` slug keeps the drawing
  and nothing else changes.
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
