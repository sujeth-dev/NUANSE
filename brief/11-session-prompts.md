# Round 3 · the three kickoff prompts

One prompt per session. Open a fresh Claude Code session in the repo root and
paste everything between the rules.

**Wave 1 is two sessions, A and B, run together.** Wave 2 is a single
session, **CD**, that does the case pages and then the collections in one
pass — it starts only once A and B have both posted `done` on the board. This
machine does not run two Chromium harness matrices at once, which is also why
CD's own verification (below and in the plan §4) is one consolidated pass at
the end rather than per item.

Each prompt is deliberately self-contained about *where to read* and
deliberately thin about *what to build* — the items live in
`brief/10-revision-round-3.md` and should be read there, not duplicated here
where the two copies can drift.

---

## Session A · the chassis and the contact page · wave 1

---

You are one of two Claude Code sessions working this repo at the same time.
You are **session A**. The other is session B, on the home page. Neither of
you can see the other's screen.

Read these first, in order, before writing any code:

1. `brief/10-revision-round-3.md` — the plan. Your items are **A1-A7** in §1.
2. `brief/07-session-comms.md` — how the two sessions talk. The board is §2;
   this round's section is §2.3. Read the whole file; the rules in it are not
   optional and were written because they were learned.
3. `README.md` — the architecture, the harness, and the rules for sharing one
   working tree.
4. `brief/05-conventions.md` — motion, spacing, colour and accessibility.

Then read what you are about to change: `site/assets/css/core.css`,
`site/assets/js/core.js`, and the `<header>` and `<footer>` blocks of all nine
pages.

**You own** `core.css`, `core.js`, `boot.js`, every page's `<header>` and
`<footer>` block, and the new `contact.html`, `contact.css`, `contact.js`,
`audit.js`. The chassis is yours alone this round — if B asks for a line in
it, that is an `ask-A` on the board and you answer it.

**You do not open** `index.html`'s `<main>`, `home.css`, or `home.js` — except
for one carve-out: **A5**, moving the audit engine out of `home.js` §9 into
`audit.js`. Claim that on the board before you start it, touch nothing in
`home.js` beyond that block, and say so again in the commit message.

Order of work, and why: **A7 (the scale tokens) first**, because the CD
session in wave 2 builds against them, and post them on the board the moment
they exist. Then A1 and A2, which are the visible complaints. Then A3, which
touches nine files and wants a clean tree around it. Then A4 and A5 together,
since the contact page is what A3's CTA points at and it needs the audit. A6
last — reproduce the bug before you fix it, and if you cannot reproduce it,
say so on the board rather than changing code speculatively.

Three decisions in §3 of the plan are unanswered. **D1 is yours** — the
header's behaviour. Build the recommendation there, post on the board that you
did, and carry on; do not idle waiting for an answer.

Verify per §4 of the plan. **Claim the harness on the board before you run
it** — only one session runs Chromium at a time this round. When you are done,
follow `brief/07-session-comms.md` §5 exactly: verify, commit named paths,
write the `BUILD-LOG.md` entry, update `README.md` where the build has moved
past it, then post `done` on the board saying what landed, what is still open,
what you chose not to do and why, and what you verified it against.

Do not push without telling me first.

---

## Session B · the home page · wave 1

---

You are one of two Claude Code sessions working this repo at the same time.
You are **session B**. The other is session A, on the chassis and a new
contact page. Neither of you can see the other's screen.

Read these first, in order, before writing any code:

1. `brief/10-revision-round-3.md` — the plan. Your items are **B1-B6** in §1.
2. `brief/07-session-comms.md` — how the two sessions talk. The board is §2;
   this round's section is §2.3. Read the whole file.
3. `README.md` — the architecture, the harness, and the rules for sharing one
   working tree.
4. `brief/05-conventions.md` — motion, spacing, colour and accessibility.
5. `reference/REFERENCE-NOTES.md`, then `reference/nuanse-house.html` — **B4
   is a port out of that file.** Read its lens at lines 877-886 and its lens
   CSS at 73-90 before you write anything. Take the interaction only; its
   layout, palette and copy are superseded and are not to be copied.

Then read what you are about to change: `site/index.html`, `home.css`,
`home.js`.

**You own** `index.html`'s `<main>`, `home.css` and `home.js`. **You do not
open** `core.css`, `core.js`, `index.html`'s `<header>` or `<footer>`, or any
other page. If what you need is one line of the chassis, post `ask-A` on the
board and keep working on something else.

**One carve-out against you:** session A is moving the audit engine out of
`home.js` §9 (lines ~684-760, wiring at ~980) into a new `audit.js`. Leave
that block alone. None of B1-B6 need it.

Order of work, and why: **B3 and B4 first** — they are the hero, they are
self-contained, and B4 is the largest single piece of work in this lane. Then
B1 and B2 together, since both are the headline and B1 changes the metrics B2
animates. Then B5. Then B6, which is the largest content change and wants the
rest settled first.

Three decisions in §3 of the plan are unanswered. **D2 and D3 are yours** —
whether the lens keeps a button, and whether the before/after brand is real or
invented. Build the recommendation on each, post on the board that you did,
and carry on.

A note on B6 that matters: the before/after must not show a real client badly.
If you build it fictional, build it visibly fictional.

Verify per §4 of the plan. **Claim the harness on the board before you run
it** — only one session runs Chromium at a time this round. When you are done,
follow `brief/07-session-comms.md` §5 exactly, and post `done` on the board in
the shape that section gives.

Do not push without telling me first.

---

## Session CD · the case pages, then the collections · wave 2

---

You are the only session working this repo right now. Wave 1 (sessions A and
B) has already landed and posted `done`; **pull before you start**. You are
doing what was previously split across two sessions, C and D, now as one —
run the case pages to completion first, then the collections. There is no
second live session to coordinate with this wave, so the board is for
recording your own progress and reading wave 1's, not for a peer conversation.

Read these first, in order, before writing any code:

1. `brief/10-revision-round-3.md` — the plan, all of it. Your items are
   **C1, C2** (the case pages) and **D-a through D-e** (the collections) in
   §1. Read §2's traps and §4's verification carefully — verification for
   this session is deliberately **lighter** than wave 1's: one consolidated
   harness pass at the end, not a full four-pass matrix per item. Do not run
   more than §4 asks for.
2. `brief/07-session-comms.md` — the board, §2. This round's section is §2.3.
3. `brief/02-project-pages.md` — what the two case pages are for.
4. `README.md` and `brief/05-conventions.md`.
5. `brief/08-portrait-system.md` — before you touch the team page's layout.
6. **The board's wave-1 entries.** Specifically session A's post of the scale
   tokens (A7) and the footer band (A3). Every item in this wave builds
   against those — do not invent a second scale or a second footer.

**Part one — the case pages.**

The trap, and it will cost you the work if you miss it: `site/work/zingara.html`
and `site/work/the-possah.html` are **generated** by `tools/expand-figures.py`
from `_zingara.src.html` and `_the-possah.src.html`. Edit the **sources** and
re-expand. A hand-edit of a built page is erased by the next rebuild.

You own both `.src.html` sources, the two built pages via re-expansion,
`work.css` and `css/work/*.css` for this part.

What is being asked is structure, not more content. In several places the
right answer is **less**: the review says so explicitly about Zingara's
system section. Do not add material to fill a layout — where a section has no
structure, give it a frame and a left/right split rather than more words.
Nothing true may be lost in the cut; if a fact has nowhere to go, say so on
the board rather than deleting it.

Session A still has one thing to do on these pages: the footer CTA band in
the two case sources. It waits until you post `pushed` on this part, so your
re-expansion does not run over it. Post `pushed` promptly when this lands.

**Part two — the collections.** Once part one is pushed, move to
`site/work/index.html`, `work-index.css`, `proofs.css`, `proofs.js`,
`roster.js`, `clients.js`, `services.*`, `process.*`, `team.*`.

Order within this part, and why: **D-d (the team's first state) first** — the
clearest fault and the most self-contained. Then D-a, the work grid. Then D-b
and D-c, the artifacts, additive and droppable if time runs short. D-e, the
copy trim, last and in one pass, with every removed string listed in the
commit message.

Two warnings, both from round 1 and both correct then:

- `services.js` **states its own contract** in its own comments — one
  scroll-triggered play each, nothing loops, no put-back path. Read it before
  adding D-b's second beat. If the addition breaks a sentence of that
  contract, say so and leave it. A session reported exactly that last round
  and was right to.
- D-e is a trim, not an edit. Removing a true fact about a client is not
  trimming. If a line looks redundant but carries a fact, leave it and say so.

**Verification, once, at the end of both parts — not twice, and not the full
matrix.** Follow plan §4 exactly as written there: one `check.js` pass over
the touched pages at desktop width, `shot.js` at 1440 and 390 per touched
page, and `a11y.js`/`contrast.js`/`weight.js` only against a specific
suspicion, never as a blanket sweep. **Claim the harness on the board before
you run it.**

**Give the user links, not just a verdict.** Your `done` post and your report
to the user must include, for every page you touched: the local path or
served URL to open it, and the path to the screenshots you took. The user
is checking your layout work visually — make that one click away, not a
paragraph they have to take on faith.

Then `brief/07-session-comms.md` §5 for the commit and board shape. Do not
push without telling me first.

---

## After both waves — the clean pass

`brief/07-session-comms.md` §5 already describes it and it has not changed,
except that it now covers **ten** pages rather than eight: `contact.html` is
new this round. CD runs it at the end of its own wave, since it is the last
session live.

The seams worth checking this round, because they are where this split cuts:

- the footer CTA band on all ten pages, including the two re-expanded case
  pages, and its CTA reaching contact from each;
- the scale tokens doing the same thing on the case pages as on the work grid;
- the audit working from both the home page and the contact page after A5
  moved it out of `home.js`;
- the new header over B's rebuilt hero, which is the one place where A's
  chrome and B's content meet.

This clean pass is the one place CD runs the **full** four-pass matrix from
plan §4 — it is checking wave 1 and wave 2 together for the first time, which
the lighter per-item verification above does not cover.
