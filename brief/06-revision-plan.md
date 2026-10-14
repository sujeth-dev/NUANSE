# Revision plan · the ten notes from 2026-10-15

Ten notes came in against the live build. This is what each one is, where it
lives in the tree, what it will take, and how it will be proved. Split into
two sessions that can run at the same time without stepping on each other.

Nothing in here is built yet. **The plan is the thing under review; code
starts after it is approved.** The four decisions that changed what gets built
were answered on 2026-10-15 and are recorded in §6 — read that section first
if you only read one.

Companion: `07-session-comms.md` — how the two sessions talk to each other and
to you, during the work and after it.

---

## 1 · Identification — what is actually wrong

Every item below was read in the tree, not assumed. Line references were true
at commit `6680020`; match on text, not on line number (`README.md`).

### 1.1 The hero headline is the old line (home)

`site/index.html:129` carries *"Most brands are one detail away from looking
expensive."* The wanted line is the live site's:

```
We design
identities · campaigns · websites · brands      ← one word at a time
for businesses
that refuse to
be ordinary.
```

Two things make this more than a copy swap. `core.js:961` `markPage()`
flattens every `.h-split` to plain text and rebuilds it as masked words, so
any structure put in the markup is destroyed at boot. And `home.js:645` takes
`.hero .base .hero-h .s` — the first S in the headline — as the glyph that
flies into the nav slot on scroll; if that S lands inside the rotating word it
flies away mid-rotation.

### 1.2 The hero S does not turn, and the turn must be per-letter

`core.css:118` deliberately excludes the hero from the whole-heading turn
(`.h-split:not(.hero-h)`), and `home.css:57` gives the hero a per-glyph rule
instead: `.hero .hero-h .s:hover`. On the page, nothing turns.

Two candidate causes, both consistent with the symptom:

- **The lens clone covers the glyph.** `.hero-layer.lens` is an opaque copy of
  the hero sitting on top (`home.css:41`), clipped to a circle that follows
  the pointer. The letter you point at is the clone's, and `.lens .s` is only
  turned when `home.js:93` puts `.is-turn` on it.
- **`wireHeroS()` bailed.** It returns early when the base and clone glyph
  counts disagree (`home.js:88`) — correct caution, silent result.

Either way the fix is the same shape, and it is the shape that also satisfies
"only the S I am pointing at": drive the turn from JS on both layers rather
than from `:hover` on one.

### 1.3 The before/after does not move with the scroll (home)

`index.html:216` marks the stage `rl-static`, and `home.js:436` reads that and
returns before wiring any control: the split sits at a fixed 52%
(`home.js:449`). The full drag control moved to the Zingara page on purpose.
What is wanted here is neither — the split should travel left to right as the
section scrolls, and travel back on the way up.

### 1.4 The nav circle is empty, on every page (chassis)

`core.css:263` ships the nav mark at `opacity:0` — "the mark lands here from
the hero". Only `home.js:303` ever raises it, inside the S flight. So:

- Home, above the fold: an empty dashed ring. Intended.
- Home, after the flight: correct.
- **Work, Services, Process, Team and both case pages: an empty dashed ring
  forever.** The mark is in the markup on all of them; nothing turns it on.
- Worse, compact: `core.css:313-316` hides the wordmark and the dashed ring,
  so a scrolled sub-page has a brand link with nothing inside it at all.

### 1.5 The mark on a page change is navy, not copper (chassis)

The curtain ground is navy (`core.css:162`). The mark has two copies stacked —
`.cm-navy` visible, `.cm-copper` at `opacity:0` (`core.css:170`). Only the
first-visit opener cross-fades them (`core.js:678`). Every later page change
runs the `SEEN` branch (`core.js:668`) or `goPage` (`core.js:620`), which
never touch the pair — so the mark you see between pages is the navy one, on
navy, which reads as a flat blue S and is not the logo as delivered.

### 1.6 The roster reads like a list, not like a studio's clients (work)

`work/index.html:206-271`. Twelve clients in three bands. `work-index.css:135`
states the position plainly: *"No client logos ship — the files on hand are
mixed-quality JPG and PNG."* That was true of the decision, less true of the
files: all seven in `assets/client-logos/` are 1400px on the long edge, clean,
each on its own ground (Zingara coral on black, Possah gold on forest green,
Tulipss plum on blush, Velmont black with a red M, Nuozone gold on dark green,
Aware navy on grey, Amma's brown on cream). Five of the twelve have no file:
Assetly, Artizen, NAZR, Noir Velin, Shail Interiors.

Spacing is tight for the weight of the type: rows are `clamp(22px,2.8vw,36px)`
against a `clamp(28px,3.6vw,52px)` name, and the three bands are separated by
nothing but a hairline.

### 1.7 Services is good; the question is whether there is room (services)

Five disciplines, five drawn artifacts, each with its own paused timeline run
by a ScrollTrigger (`services.js:33-158`). This is the most finished page in
the build. The honest answer may be "add nothing", and that is an acceptable
outcome of the session.

### 1.8 The problem section is a wall (case pages)

`work/zingara.html:119-129` is four paragraphs, `the-possah.html:120-128` is
three, both set at `clamp(19px,2vw,26px)` over a 38ch measure
(`work.css:41-45`). It is the second thing on the page and it asks for a full
minute before showing anything.

### 1.9 The team page is eight invented people (team)

`team.js:24-33` is eight unnamed roles with drawn portraits chosen from eight
hair shapes. `team.html:104` says *"Eight people. One standard."*, the meta
description says *"Eight people, five disciplines"*, and `pg-verdict` says
*"Founder eyes on every brief."*

The live site says otherwise, and the screenshot you attached is the source:
**ten people, named, with roles.**

| # | Name | Role as published | Reads as |
|---|---|---|---|
| 01 | Abhinav Marothia | Founder & Creative Director | shoulder-length waved hair, heavy square glasses, light moustache |
| 02 | Harshit R. | Full-Stack Development & 3D | long curls past the jaw, thin round metal glasses, clean-shaven |
| 03 | Sujeeth | UI/UX & Web Design | tight tall curls, thin moustache, soft chin stubble |
| 04 | Likhita R. Jain | Sustainable Materials & Arts | long waved hair, open smile |
| 05 | Manish S. | Performance Marketing | cropped hair, moustache into a light beard |
| 06 | Varun KS | Photography & Videography | high-volume curls, light moustache |
| 07 | Yusra | Client Acquisition | very long waves, blazer over a collar, earring |
| 08 | Manasi | Business Development | very long straight hair, open white collar, earring |
| 09 | Hari T. | Relationship Manager | short hair, full beard, broad smile, three-quarter turn |
| 10 | Manideep Chilukuri | Application Development | volume curls, full short beard, ivory shirt |

The right-hand column is what a drawn portrait has to carry to be recognisably
that person at 180px. It is a description of a photograph, not an invention.

"Eight" also leaks off the page: `process.html:177` ends on *"Eight people. One
standard."* as its next-page link, and `team.js:66` numbers every portrait
`NN/08`.

### 1.10 Roles do not map cleanly onto the six chips

The brief builder filters on `strategy identity websites content film
performance` (`team.html:116-124`). Four of the ten published roles — Client
Acquisition, Business Development, Relationship Manager, and Sustainable
Materials & Arts — are not any of those six. The mapping in §6 is settled and
is read off the published role wording rather than guessed, because guessing
who works on what is exactly the kind of invented fact this repo refuses.

---

## 2 · The split — two sessions, one tree

The line already exists in `README.md`: the home page and the chassis are one
pass, `site/work/` and the per-page layers are the other. The ten notes fall
cleanly either side of it.

### Session A · Home and chassis

Owns, and is the only session that writes: `site/index.html`,
`assets/css/home.css`, `assets/js/home.js`, `assets/css/core.css`,
`assets/js/core.js`.

| # | Item | Why here |
|---|---|---|
| A1 | Hero headline and the rotating word (1.1) | home markup, home motion, one `markPage` exception in core |
| A2 | The hero S turn, per glyph (1.2) | home only, touches the lens clone |
| A3 | Before/after travels with the scroll (1.3) | home only |
| A4 | The nav mark appears on every page (1.4) | core.css + core.js, chassis |
| A5 | The page-change mark is the copper one (1.5) | core.js loader and `goPage` |

A4 and A5 are chassis fixes that change every page in the build, including the
ones Session B is rewriting. They are small, so they go first and get pushed
first, and B pulls them before it verifies anything.

### Session B · Work, team, services, case pages

Owns, and is the only session that writes: `site/work/*.html`,
`assets/css/work.css`, `assets/css/work/*`, `assets/js/work/*`,
`assets/css/work-index.css`, `assets/js/work-index.js`, `site/team.html`,
`assets/css/team.css`, `assets/js/team.js`, `site/services.html`,
`assets/css/services.css`, `assets/js/services.js`, `site/process.html`,
`tools/`.

| # | Item | Why here |
|---|---|---|
| B1 | The roster gets brand sense (1.6) | work index, plus a new `tools/` pass for the marks |
| B2 | The problem section gets short (1.8) | both case pages |
| B3 | The team page becomes ten named people (1.9, 1.10) | team page, end to end |
| B4 | The "eight people" strings, including `process.html:177` | B owns it because B sets the new number |
| B5 | Services: find the room or say there is none (1.7) | services page, last, lowest priority |

### What crosses the line, and the rule for it

- **B never writes `core.css` or `core.js`.** If B needs a chassis change, it
  asks A on the board in `07-session-comms.md` and keeps working on something
  else meanwhile.
- **Both append to `BUILD-LOG.md` and `README.md`.** Additive only, newest
  first, `git diff --stat` showing insertions only — the existing rule.
- **`process.html` is B's for this cycle**, for one string.
- **Stage named paths. Never `git add -A`.** The other session's
  half-finished work is in the same tree.

Order matters in exactly one place: **A4 and A5 land before B verifies any page
chrome.** Everything else is genuinely parallel.

---

## 3 · Implementation — Session A

### A1 · The hero headline, and the word that changes

**Markup** (`index.html`): the rotating word sits on its own line, which is the
whole trick — a line of its own cannot reflow the lines around it, so no width
has to be measured or animated.

```html
<h1 class="hero-h" data-split="skip"
    aria-label="We design identities, campaigns, websites and brands for businesses that refuse to be ordinary.">
  <span class="hl">We design</span>
  <span class="hl rot-line" aria-hidden="true"><span class="rot"></span></span>
  <span class="hl">for businesses</span>
  <span class="hl">that refuse to</span>
  <span class="hl">be ordinary.</span>
</h1>
```

**Core** (`core.js` `markPage`): one guard — `if (h.dataset.split === 'skip')
return;` — so the hero keeps its structure and home.js splits it itself. Five
lines including the comment. This is the only core change A1 needs.

**Motion** (`home.js`): the rotator is built after the hero's own split, from
`['identities', 'campaigns', 'websites', 'brands']`. Each swap is the move the
hero already uses on its words — out to `yPercent:-115, rotation:-2`, in from
`yPercent:115, rotation:2`, 0.7s on the `nu` curve — with a 2.2s dwell
between. It runs on a `gsap.timeline({repeat:-1})` registered through
`NU.onIntro`, so the first word is already in place when the curtain lifts,
and it pauses through `NU.onIdleChange` when the hero leaves the screen or a
pin claims the stage: *one moving thing per screen* is the house rule, and
this is now the home page's one.

Reduced motion: no rotation. The slot holds `identities`, and the `aria-label`
carries all four — which it does for everyone anyway, so the headline reads
whole to a screen reader rather than as a word that keeps changing under it.

The lens clone gets the same word at the same time, driven from the same tick,
exactly as the S is (`home.js:93`). Two layers, one state.

The flying S is re-anchored to the S in *"design"* — line 1, static, present in
every frame of the rotation.

**Copy that follows it.** Per **D1**, the old line retires from this page
completely. The `<title>`, meta description, OG and Twitter description on
`index.html` are rewritten around the new headline — *"We design identities,
campaigns, websites, brands, for businesses that refuse to be ordinary."* —
and the OG image keeps the wordmark, which says nothing that has changed. The
manifesto below the hero is read once in the same pass: it was written to
follow the old line and must still land after the new one. If it does not, A
says so on the board rather than quietly rewriting the letter.

### A2 · One S, the one you are pointing at

Reproduce first, with the harness, before changing anything: load `/`, take
`document.elementFromPoint` over the centre of a hero `.s`, and read back what
is actually under the pointer and whether `wireHeroS` bound. That answers 1.2
in one run and says which of the two causes it is.

The fix holds for both: stop asking `:hover` to do it.

- `home.css`: replace `.hero .hero-h .s:hover` with `.hero .hero-h .s.is-turn`,
  same declarations. `.lens .s.is-turn` already exists and stays.
- `home.js` `wireHeroS()`: the existing delegated `pointerover`/`pointerout`
  pair already finds the glyph and its index. It toggles `.is-turn` on the
  clone today; from here it toggles it on **both** the base glyph and the
  clone. If the counts disagree it still bails for the clone — but the base
  glyph turns regardless, so the headline is never dead.
- Keyboard and touch are unchanged: the `nuanse` keyword still latches every S
  (`core.css:127`), and triple-tap on the mark still works on touch.

Per-glyph scoping is then structural, not a selector that has to win a
cascade.

### A3 · The before/after travels with the scroll

`home.js`, inside the `isStatic` branch — which stops being "no control" and
becomes "the scroll is the control":

```js
ScrollTrigger.create({
  trigger: '#redline',
  start: 'top 75%', end: 'bottom 60%',
  scrub: 0.45,                       /* the house scrub, as the manifesto uses */
  onUpdate: (self) => setPos(8 + self.progress * 84)
});
```

`setPos` already does everything: it clips the after layer, moves the rule,
and writes each annotation on as the split passes its `data-x` and unwrites it
coming back (`home.js:417-432`). So scrolling back up reverses the whole thing
for free, annotations included — which is the "comes back on scroll back" half
of the note.

The handle stays visible as a rule but keeps `cursor:default` and no pointer
wiring: it marks the split, it does not offer to be dragged. The drag control
stays on the Zingara page, where it is that page's signature.

Reduced motion: no scrub. `setPos(52)` as today, annotations written on at
`top 72%`, which is the existing path.

### A4 · The nav mark, on every page

The mark starts hidden because on the home page it arrives from the hero. That
is a home-page fact that leaked into the chassis.

- `core.css`: `.nav-mark{width:22px;opacity:1}` becomes the default, and the
  home page's starting state becomes a class on the document — `.home-hero
  .nav-mark{opacity:0}` — set by `home.js` and dropped when the S lands.
  Alternative, if that reads as too clever: keep the default at 0 and have
  `core.js` raise it unless the page has a `.flyer`, which is precisely
  "unless this page runs the S flight". The first is explicit; the second
  cannot be forgotten by a future page. A picks one and says which in the
  commit.
- `core.css:316`: `.nav.compact .nav-slot::after{opacity:0}` stays, because
  the mark is now inside the ring and the ring is no longer the only thing
  there.
- The no-GSAP path already does the right thing (`core.js:294`) and stays as
  the proof that full opacity is the correct default.

Checked on all six pages plus both case pages, at the top and scrolled, in
both nav colours (`.nav.dark` lifts the mark 22% brighter, `core.css:264`).

### A5 · The mark between pages is the copper one

Both branches that run after the first visit set the pair explicitly before
they show the curtain:

- `core.js` `loader()`, `RM || SEEN` branch: `gsap.set(cmNavy, {opacity: 0});
  gsap.set(cmCopper, {opacity: 1});` before the fade.
- `core.js` `goPage()` and the in-page `#anchor` timeline: the same two lines
  at the head of each timeline, since both show the curtain over a navy
  ground.

The first-visit opener is untouched: navy-to-copper under a cream cover that
lifts is the intended theatre, and it is correct — the ground is cream there.

Verified by sampling pixels at the centre of the mark during a page change,
not by looking at a screenshot. Expect the copper family, never the navy one.

---

## 4 · Implementation — Session B

### B1 · The roster, with the brands in it

Three changes, in the order of how much they are worth.

**Spacing and rhythm first.** Row padding to `clamp(34px,4vw,56px)`, band gaps
to a full `--s4`, and each band's eyebrow set as a label with its count beside
it (`Full cases · 02`, `Live work · 06`, `Marks on file · 04`). The page reads
as one list of twelve with two hairlines in it; it should read as three bands
of a studio's work.

**Then the marks.** `tools/build-client-marks.py`, in the shape of
`build-brand-assets.py`: trim each source to its ink, square it on its own
sampled ground, and emit AVIF/WebP/JPEG at 96px and 192px into
`site/assets/work/clients/` with the content-hash naming the pipeline already
uses. Seven files in, seven sets out. The ground is sampled from the file
itself, so nothing about any client's colour is invented.

In the row, the mark is a 44px chip at the left of the name column, on its own
sampled ground, at `opacity:.75` and reduced saturation at rest — it reads as
a seal, not as a logo wall — going to full colour and a 4% scale on hover,
under the copper rule that already grows there (`work-index.css:144`). Fifteen
lines of CSS and one `<picture>` per row.

**The five with no file** — Assetly, Artizen, NAZR, Noir Velin and Shail
Interiors — get the same 44px chip holding their initial set in Gloock on
stone: visibly *our* setting, not a claimed mark. Nothing is downloaded from a
client's site, nothing is redrawn from memory. See decision **D2**.

Weight: seven marks at 96/192px in three formats land in the region of 60-90
KB against a 1500 KB budget, lazy-loaded below the fold. Measured with
`weight.js`, not estimated, before it ships.

### B2 · The problem, in a quarter of the space

Same shape on both case pages, and the shape is one the rest of the page
already uses — a line that lands, then the evidence.

- **One sentence at display size** (keep `clamp(19px,2vw,26px)`), which is the
  bolded line each section already contains: *"The menu was costing them."* and
  *"The collection needed a campaign. The budget didn't cover a studio."*
- **Three mono facts beside it**, from the paragraphs being cut, as a `dl` in
  the `pj-meta` idiom the opening frame already uses: `189 items · 4 typefaces
  · 3 listings` for Zingara; `24 SKUs · 1 light · 0 studio days` for Possah.
  Every number already appears in the current copy or the case sheet.
- **The rest folds** behind a `<details class="pj-more">` labelled *"The whole
  of it →"* — open to anyone who wants it, closed by default, no JS, keyboard
  and screen-reader correct by construction.

Net: a reader meets one sentence and three facts instead of four paragraphs,
and nothing true is deleted from the page.

### B3 · The team page, as ten named people

The page is rebuilt, not patched.

**Data** (`team.js`): ten records carrying name, published role, the portrait
traits from §1.9, and the chips they answer to. The portraits stay drawn, not
photographed — the existing decision, and the right one until the photography
is on file — but the vocabulary grows to carry ten people. Hair gains
`waves-long`, `curls-long`, `curls-tall`, `curls-volume`, `crop-beard`,
`straight-long` and `wave-blazer`; a new feature layer carries
`glasses-square`, `glasses-round`, `moustache`, `beard-full`, `stubble`,
`smile-open` and an earring. Each portrait is then a named combination rather
than a hair shape, and each is recognisably its person at 180px: Abhinav's
square glasses, Harshit's round ones, Hari's beard and smile, Manideep's curls
and beard. The plate number becomes `NN/10`.

**The line the home page gives up.** Per **D1**, *"Most brands are one detail
away from looking expensive"* leaves the home page and lands here, as one
short paragraph in the studio's own voice — placed in the opening frame, under
`How it started.`, where the page is already talking about why the studio
exists. One paragraph, no heading of its own, no callout treatment. B writes
it; A does not, so the line is not being carried by two sessions at once.

**Copy.** `Eight people. One standard.` becomes `Ten people. One standard.`
throughout: `<title>`, meta description, OG and Twitter title and description,
the H1, the `pg-meta` row, and `process.html:177`. The `pg-verdict` — *"Founder
eyes on every brief"* — goes; it is a claim about attention that nothing on the
page shows. In its place, the thing the page can show: the founder's card is
first in the lane on every brief, because by the chip mapping it is.

**Layout.** Names and roles are the content now, so each caption carries the
name in Hanken 500 with the role in mono beneath, and the lane keeps the
existing Flip choreography unchanged. Ten portraits in a four-column scatter
leave two in the last row — the stagger offsets in `team.css:40-42` are
`4n+2/3/4` and need a tenth-aware pass so the last row does not read as a
remainder.

**A caution worth writing down.** These are real people, and the portraits are
our drawing of them. They stay plainly stylised and respectful; the likeness
is hair, glasses, beard and expression, nothing more. Names and roles are
published exactly as the studio already publishes them — see decision **D3**.

### B4 · The strings that say eight

`process.html:177`, `team.js:2`, `team.js:66`, `team.js:134`, `team.css:2`,
and every meta string on `team.html`. One pass, one commit, after B3 lands.

### B5 · Services, if there is room

The page gets looked at once, late, with one question: does anything on it
*stop*? Candidates, in the order they would be worth doing:

- the five artifacts replay when a discipline is re-entered from below, rather
  than playing once;
- the section's number rail ticks with the artifact in view;
- nothing.

"Nothing" is a real answer and B should be willing to give it. The page is
clean and the note says so.

---

## 5 · Verification

The harness is rebuilt in the scratchpad, per `README.md`. Playwright's
Chromium is already on this machine, so there is nothing to install.

Both sessions run, over the pages they touched, in the four passes — desktop,
reduced motion, touch at 390x844, and GSAP blocked:

| Pass | What it has to say |
|---|---|
| `check.js` | zero console errors, exceptions, CSP violations, failed requests |
| `a11y.js` | zero axe violations |
| `contrast.js` | every text node against its own effective background |
| `css-applied.js` | every sheet produced rules, over HTTP **and** `file://` |
| `weight.js` | first load and fully scrolled, against 1500 KB |
| `shot.js` | frames at given offsets — **and the pixels sampled, not glanced at** |

Per item, the specific thing each has to prove:

- **A1** — four words rotate, the lines below never move, the S in "design"
  flies, reduced motion shows one word and the `aria-label` reads all four.
- **A2** — pointing at one S turns that S and no other, inside the lens circle
  and outside it; leaving turns it back over 0.7s.
- **A3** — the split travels with the scroll and returns; annotations write on
  and unwrite; reduced motion holds at 52%.
- **A4** — the mark is visible in the nav on all eight pages, at the top and
  scrolled, in both nav colours, and with GSAP blocked.
- **A5** — the mark sampled mid-page-change is copper, never navy.
- **B1** — seven marks ship, five initials ship, weight measured, the roster
  reads as three bands.
- **B2** — both case pages, the `details` keyboard-reachable, nothing true
  lost.
- **B3** — ten portraits, ten names, chips filter correctly, Flip still lands,
  no page says eight.
- **B5** — whatever it did, or a sentence saying it did nothing and why.

---

## 6 · Decisions — answered 2026-10-15

All four are settled. Where an answer changed the work, the section above has
been updated to match and the change is named here.

**D1 · *"Most brands are one detail away from looking expensive."* retires from
the home page.** Not just as the H1: the `<title>`, meta description, OG and
Twitter cards are rewritten around *"We design identities, campaigns,
websites, brands — for businesses that refuse to be ordinary."* (A1). The
thought survives as **a short paragraph on the About/Team page** — one
paragraph, in the studio's own voice, not a banner (B3). It is the only place
it is said from here.

**D2 · The seven real marks ship, plus five set initials.** B1 as written.

**D3 · Drawn portraits, named, roles exactly as published.** B3 as written.
If the photography is ever put on file it beats any drawing and the page
should take it then.

**D4 · The chips come from the roles in the screenshot**, one chip per role,
read straight off the words rather than assigned by guess:

| Person | Role as published | Chips |
|---|---|---|
| Abhinav Marothia | Founder & Creative Director | all six |
| Harshit R. | Full-Stack Development & 3D | websites |
| Sujeeth | UI/UX & Web Design | websites, identity |
| Likhita R. Jain | Sustainable Materials & Arts | identity |
| Manish S. | Performance Marketing | performance |
| Varun KS | Photography & Videography | film, content |
| Yusra | Client Acquisition | strategy |
| Manasi | Business Development | strategy |
| Hari T. | Relationship Manager | strategy |
| Manideep Chilukuri | Application Development | websites |

One judgement is left in it and is worth naming rather than burying: Client
Acquisition, Business Development and Relationship Manager are client-side
roles, and *strategy* is the nearest of the six chips to all three. The
screenshot does not say that; the words do. If those three should sit under a
chip of their own, it is one line of data and ten minutes.

---

## 7 · Sequence

```
A4, A5  ──► pushed first; B pulls before verifying anything
A1, A2, A3           ──┐
B1, B2, B3, B4, B5   ──┴──► parallel, no shared files
```

Session A is about a day of work, Session B about two: B3 is most of a day on
its own, and B1 is half of one with the tooling pass.
