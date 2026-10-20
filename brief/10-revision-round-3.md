# Round 3 · the voice review of 2026-10-20

Nineteen items, from a spoken review of the live build. This file is the plan;
`brief/07-session-comms.md` §2.3 is the board; `brief/11-session-prompts.md`
holds the kickoff prompt for each session.

Rounds 1 and 2 are `06-revision-plan.md` and `09-feedback-round.md`. The rules
in `README.md` and `05-conventions.md` still hold without restatement: named
paths, never `git add -A`, additive `BUILD-LOG.md`, never invent a client
fact, three typefaces, no new palette.

---

## 1 · The items

Grouped by the session that owns them. The grouping is by **file ownership**,
not by subject — that is what lets two sessions run at once.

### Session A · the chassis and the contact page

- **A1 · The header, rebuilt.** Not a persistent header any more. The present
  one is invisible in the first viewport, which is the actual complaint. Make
  it present and readable on first paint, then build the state machine
  properly rather than patching the current one. See D1 below.
- **A2 · The scroll bar goes.** No visible bar; scrolling stays native and
  keeps its Lenis inertia.
- **A3 · The footer gains an upper band.** One CTA button and one line of
  message, above the existing `.ft-top`. On **every** page. Its job is to feed
  the contact page.
- **A4 · A contact page, new.** `site/contact.html`. A guided reach-out: the
  visitor picks what they need, and that choice composes a `mailto:` with
  subject and body already written. Second route on the same page: **the
  audit**, which ends in a sent mail too.
- **A5 · The audit engine moves out of `home.js`.** It is currently §9 of
  `home.js` (lines ~684-760, wiring at ~980), which means the audit only
  exists on the home page. A4 needs it on contact. Promote it to
  `site/assets/js/audit.js`, loaded by both. This is the one place A reaches
  into B's file; the board rule for crossing the line applies.
- **A6 · The render bug.** Work → Zingara → back leaves the page stuck
  showing the wallpaper layer. Something is not torn down or not repainted on
  return navigation. Reproduce it first, then fix the cause.
- **A7 · Dynamic scaling.** Scale-up and scale-down are unreliable across
  viewport sizes. Define one fluid scale in `core.css` as tokens, post it on
  the board as the contract, and test it at real widths.

### Session B · the home page

- **B1 · The headline, bigger.** "We design" grows and spans more horizontal
  length. The rotating word slot grows with it. "for businesses" — the line
  on the slant — grows and extends further toward the right edge.
- **B2 · The word changes by ASCII flip.** Replace the upward slide at
  `home.js:89-101`. The word should read as normal type, dissolve into
  monospace glyph noise, and resolve as the next word. Campaign → website
  happens through a character flip, not a vertical move.
- **B3 · The swirl, darker and brighter.** The moving copper-foil ground
  behind slide 1 is too light to read. Darker **and** higher contrast, so the
  motion is visible.
- **B4 · The lens, taken from the reference.** The magnification model in
  `reference/nuanse-house.html:877-886` replaces the present toggle. It is
  always live and pointer-driven: an inverted layer revealed through
  `clip-path: circle(r at x y)`, position and radius lerping toward the
  pointer, radius `clamp(96px, heroWidth × 0.17, 190px)` growing ×1.1 on
  pointer-down, drifting on its own after ~2.4s idle, and the page cursor
  hidden inside the hero because the lens *is* the cursor there. The S flips
  inside the lens only — `reference:77`, `.layer.x .s{transform:scaleX(-1)}`.
  See D2 on whether a button survives.
- **B5 · The envelope stays.** As the letter lifts out on scroll the envelope
  does not vanish; it holds while the whole letter is read. Scrolling on, it
  travels into the next section's blue field and disappears there.
- **B6 · The before/after becomes a brand, not a menu.** `.redline-sec`
  (`index.html:280-324`) keeps its wipe, handle and A/B/C annotations, and
  changes subject: **before** is a business with no brand design at all —
  default sans, mismatched weights, a stretched logo, inconsistent colour;
  **after** is the same business structured — one typeface, a real mark, a
  disciplined palette, grid, hierarchy. The headline changes with it. The
  Zingara menu set stays on the case page, where it is that client's story.
  See D3.

### Session C · the two case pages

- **C1 · Zingara, restructured.** The diagnosis, in the reviewer's order:
  - The opening scatters metadata — "Mysore White", "Branding 2025", "female
    packaging" — everywhere. **One** main heading. No subheading. Under it one
    subtle line of what the brand is. "Case 01 · Restaurant" as a quiet label
    is fine and already right.
  - **The problem** must become one slide, fully contained, with a real frame
    and a deliberate left/right split: text and facts left, images right.
    Today it is content with no layout.
  - **The system** is the same fault, worse: too much content, no structure.
    If it cannot be made genuinely constructive, do not force it — imagery
    (the mark, the two pieces, the colour) in a block on the right, a short
    text column on the left. Less is acceptable here and was asked for.
  - **The menu set** keeps its content; recompose it as one structured slide.
  - **It travels** — images at inconsistent sizes, text floating, no grid.
  - **On screen** is the best of them and still improvable.
  - **The real test** — the Amma's element is far too large; Zingara's is off.
  - Root cause across all of it: inconsistent scale. A7's tokens are the fix.
- **C2 · The Possah, restructured.** The empty grid cell reads as a hole. The
  System / Set / Starter sections are composed at random. **"Not losing the
  sale" is good — keep it.** Everything else needs the same four things:
  structure, layout, craft, and the identity actually coming through.

### Session D · the collections

- **D-a · The work grid.** The projects read well; the grid is default and
  plain. More room between projects, and a deliberate rhythm: Zingara and The
  Possah get more space and run **one per row**; the rest arranged
  intentionally around them so the page is interesting to scan.
- **D-b · The service artifacts get a second beat.** Strategy, identity,
  website, content and film each have one frame of motion and stop. Add a
  continuation: identity → colours shift and a new element enters; website →
  the page opens into another page; content and film → a cut, then further
  frames. The reviewer's verdict on this section was that it already came out
  well; this is polish, not a rebuild.
- **D-c · Process gains artifacts.** It is fine, and plain. Give it drawings
  of its own in the same register.
- **D-d · The team page's first state.** The filter is genuinely good. The
  fault is the initial view: every member should be visible together in one
  properly composed, edge-to-edge frame, about one and a half viewports, two
  at most, and precisely arranged.
- **D-e · The small unnecessary text.** The index page had a pass already.
  Do the same on **work** and **team**: the stray micro-labels and half-lines
  that carry no weight. Keep it minimal. Removing a true fact is not trimming.

---

## 2 · Who runs when

Three lanes now, **one session live at a time after wave 1**. C and D are
merged into a single session, **CD**, run back to back by one Claude Code
instance rather than two in parallel — this machine does not need a second
Chromium matrix up while the harness is already loaded for one.

| Wave | Session | Why |
|---|---|---|
| **1** | **A** (chassis + contact) and **B** (home) | Disjoint files, run together. A owns `core.*` and every page's `<header>`/`<footer>`; B owns `index.html`'s `<main>`, `home.css`, `home.js`. |
| **2** | **CD** (both case pages, then the collections) | Consumes A7's scale tokens and A3's footer band, so it starts after wave 1 lands them. Both halves are one session's work now, done in sequence: cases first, collections second. |

Wave 2 does not begin until A and B have both posted `done`. That is a
sequencing decision, not caution: CD's whole complaint on the cases is
inconsistent scale, and it cannot fix scale against tokens that do not exist
yet.

### Ownership, this round

| Session | Writes |
|---|---|
| **A** | `site/assets/css/core.css`, `site/assets/js/core.js`, `site/assets/js/boot.js`, the `<header>` and `<footer>` blocks of all nine pages, `site/contact.html`, `site/assets/css/contact.css`, `site/assets/js/contact.js`, `site/assets/js/audit.js` (new, moved out of `home.js`) |
| **B** | `site/index.html` `<main>` only, `site/assets/css/home.css`, `site/assets/js/home.js` — **except** §9, the audit modal, which A is moving out |
| **CD** | `site/work/_zingara.src.html`, `site/work/_the-possah.src.html`, the two built pages via re-expansion, `site/assets/css/work.css`, `site/assets/css/work/*.css`, then `site/work/index.html`, `work-index.css`, `proofs.css`, `proofs.js`, `roster.js`, `clients.js`, `services.*`, `process.*`, `team.*` |

Shared and additive only: `BUILD-LOG.md`, `README.md`, the board.

**The chassis rule stands.** `core.css` and `core.js` are A's alone, including
when the change you want is one line. Post `ask-A` and keep moving.

### Two traps specific to this round

1. **The case pages are generated.** `site/work/zingara.html` and
   `the-possah.html` are produced from `_*.src.html` by
   `tools/expand-figures.py`. Edit the source and re-expand, or a later
   rebuild erases the work. Session CD does both; A does not touch the built
   files, only the sources' `<header>`/`<footer>`, and does that **after** CD
   posts `pushed` on the case half so no re-expansion runs over it.
2. **The footer is duplicated in nine files**, not injected. A3 therefore
   touches every page. It is the single biggest collision surface this round,
   which is exactly why one session owns it alone.

---

## 3 · Decisions — open

- **D1 · The header's behaviour.** Reveal on scroll-up and hide on scroll-down,
  or static in the hero only and gone thereafter? Recommendation: visible in
  the hero, hidden on scroll-down, revealed on scroll-up. It satisfies "no
  persistent header" and "visible in the first line" at once.
- **D2 · Does the lens keep a button?** Reference-faithful means hover only,
  with a line of copy as the affordance — the reference says *"Move your
  cursor. Look closer."* and has no button. The review also asked for "Look
  closer" to read **"Click here"**, which only makes sense if a button stays.
  Recommendation: keep a button labelled **Click here**, which arms the lens
  for touch and keyboard, and let hover drive it on a fine pointer. That way
  both notes are satisfied and the touch path does not regress.
- **D3 · Is the before/after brand real or invented?** A generic fictional
  business is safer and reads as a demonstration; a real before-state is more
  credible and needs assets we may not have. Recommendation: fictional and
  unnamed, built in HTML and CSS like the present mock, so no asset pipeline
  is involved and no client is shown badly.

Until each is answered, build the recommendation and say on the board that you
did. Do not idle on a decision.

---

## 4 · Verification

**For CD, verification is deliberately lighter than A and B's.** A and B's
items are new interaction mechanics (a lens, an ASCII flip, dynamic scaling)
that needed the full four-pass matrix to trust. CD's items are layout and
copy on pages whose mechanics A and B already proved. Running that same full
matrix a second time on the same chassis is the unnecessary testing this round
is explicitly trying to avoid.

**CD's harness is one pass, once, at the end — not per item.**

1. One `check.js` run (console/CSP/broken-image) over the touched pages,
   desktop only. No reduced-motion, touch or GSAP-blocked repeats unless an
   item specifically changes motion (D-b/D-c do; add those two to a
   reduced-motion check and stop there).
2. `shot.js` at one width (1440) and one mobile width (390) per touched page.
   Look at them. Do not run `a11y.js`, `contrast.js`, `css-applied.js` or
   `weight.js` as a matter of course — run them only against a specific
   suspicion (e.g. "does this new split-layout clear AA"), not as a blanket
   sweep.
3. **Give the user links, not just a verdict.** For every page you touch, the
   `done` post includes the local `file://` path or the harness's served
   `http://localhost` URL for that exact page, plus the path to the
   screenshots `shot.js` wrote, so the user can open them directly rather
   than take your word for the layout.

A and B keep the full four-pass matrix as written below — that work is
already done or in progress and is not being redone.

**Load rule, now simpler:** only one session runs Chromium at a time. With CD
alone in wave 2, this is automatic — just claim `harness` on the board before
you run anything, the same as before, so a stray wave-1 straggler does not
collide with you.

Per item, the specific thing to prove:

- **A1** — the header is readable in the first viewport on all nine pages, in
  both nav colours, at 390px and with GSAP blocked.
- **A2** — no visible bar on any page, and the page still scrolls natively
  with the keyboard, the wheel and a trackpad fling.
- **A3** — the band is on all nine pages and its CTA reaches contact from
  each one.
- **A4/A5** — the composed mail opens with subject and body filled, from both
  routes; the audit still works on the home page after the move; the modal
  still traps Tab and still closes on Esc.
- **A6** — the bug reproduced before the fix and gone after, on the exact
  path Work → Zingara → back.
- **A7** — the tokens hold at 390, 768, 1280, 1440 and 1920 with no element
  clipped or orphaned.
- **B1/B2** — the lines below the slot never move when the word changes;
  reduced motion shows one word and the `aria-label` still reads all four.
- **B3** — sampled pixels, not a glance: the swirl measurably darker and
  higher-contrast, and every text node over it still clears AA.
- **B4** — the lens follows with lag, drifts when idle, grows on press, hides
  the cursor inside the hero, flips only the S it covers, and has a working
  touch and keyboard path.
- **B5** — the envelope present for the whole letter, and gone into the blue
  by the time the next section is in view; reversible on scroll back.
- **B6** — the wipe still reverses, the annotations still write on and
  unwrite, and nothing in it names a real client.
- **C1/C2** — each named section is one contained slide with a deliberate
  layout; no element off its grid; nothing true lost in the cut; both pages
  re-expanded from source, not hand-edited.
- **D-a/D-d** — the grid at the five widths; the team's first state measured
  in viewports, not estimated.
- **D-b/D-c** — the second beat plays once per scroll trigger, does not loop,
  and has a reduced-motion branch. `services.js` states its own contract;
  read it before adding, and if the addition breaks a sentence of it, say so
  and leave it. That happened in round 1 and the finding was correct.
- **D-e** — a list of every string removed, in the commit message.
