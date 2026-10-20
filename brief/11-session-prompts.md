# Round 3 · the four kickoff prompts

One prompt per session. Open a fresh Claude Code session in the repo root and
paste everything between the rules.

**Two sessions at a time, not four.** Wave 1 is A and B. Wave 2 is C and D,
and starts only once A and B have both posted `done` on the board. Four
Chromium harness matrices on this laptop at once is what makes it unusable.

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

Order of work, and why: **A7 (the scale tokens) first**, because sessions C
and D in wave 2 both build against them, and post them on the board the moment
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

## Session C · the two case pages · wave 2

---

You are one of two Claude Code sessions working this repo at the same time.
You are **session C**. The other is session D, on the work grid, services,
process and team. Wave 1 (sessions A and B) has already landed and posted
`done`; **pull before you start**.

Read these first, in order, before writing any code:

1. `brief/10-revision-round-3.md` — the plan. Your items are **C1 and C2** in
   §1, and they are the longest-written items in it because the review of
   these two pages was the most detailed. Read §2's traps carefully.
2. `brief/07-session-comms.md` — how the two sessions talk. The board is §2;
   this round's section is §2.3.
3. `brief/02-project-pages.md` — what these two pages are for.
4. `README.md` and `brief/05-conventions.md`.
5. **The board's wave-1 entries**, specifically session A's post of the scale
   tokens (A7). Your pages' root fault is inconsistent scale, and those tokens
   are the fix. Build against them rather than inventing a second scale.

Then read the two pages and their stylesheets.

**The trap, and it will cost you the work if you miss it:**
`site/work/zingara.html` and `site/work/the-possah.html` are **generated** by
`tools/expand-figures.py` from `_zingara.src.html` and `_the-possah.src.html`.
Edit the **sources** and re-expand. A hand-edit of a built page is erased by
the next rebuild.

**You own** both `.src.html` sources, the two built pages via re-expansion,
`work.css` and `css/work/*.css`. **You do not open** `work/index.html` — that
is D's — nor `core.*`, nor the home page.

Session A still has one thing to do on your pages: the footer CTA band in the
two case sources. It waits until you post `pushed`, so that your re-expansion
does not run over it. Post `pushed` promptly when your work lands, and say on
the board that the sources are free.

What is being asked of you is structure, not more content. In several places
the right answer is **less**: the review says so explicitly about Zingara's
system section. Do not add material to fill a layout. Where a section has no
structure, give it a frame and a left/right split rather than more words.
Nothing true may be lost in the cut — if a fact has nowhere to go, say so on
the board rather than deleting it.

Verify per §4 of the plan. **Claim the harness on the board before you run
it.** Then `brief/07-session-comms.md` §5, and `done` on the board.

Do not push without telling me first.

---

## Session D · the collections · wave 2

---

You are one of two Claude Code sessions working this repo at the same time.
You are **session D**. The other is session C, on the two case pages. Wave 1
(sessions A and B) has already landed and posted `done`; **pull before you
start**.

Read these first, in order, before writing any code:

1. `brief/10-revision-round-3.md` — the plan. Your items are **D-a to D-e**
   in §1.
2. `brief/07-session-comms.md` — how the two sessions talk. The board is §2;
   this round's section is §2.3.
3. `README.md` and `brief/05-conventions.md`.
4. `brief/08-portrait-system.md` — before you touch the team page's layout.
5. **The board's wave-1 entries**, specifically session A's post of the scale
   tokens (A7). D-a and D-d are both layout at scale; build against those
   tokens.

Then read `site/work/index.html`, `services.html`, `process.html`,
`team.html` and their stylesheets and scripts.

**You own** `work/index.html`, `work-index.css`, `proofs.css`, `proofs.js`,
`roster.js`, `clients.js`, and all of `services.*`, `process.*`, `team.*`.
**You do not open** the two case pages or their sources — those are C's — nor
`core.*`, nor the home page.

Order of work, and why: **D-d (the team's first state) first** — it is the
clearest fault and the most self-contained. Then D-a, the work grid. Then D-b
and D-c, the artifacts, which are additive and can be cut if time runs short.
D-e, the copy trim, last and in one pass across both pages, with every removed
string listed in the commit message.

Two warnings, both from round 1 and both correct then:

- `services.js` **states its own contract** in its own comments — one
  scroll-triggered play each, nothing loops, no put-back path. Read it before
  you add D-b's second beat. If the addition breaks a sentence of that
  contract, say so on the board and leave it. A session reported exactly that
  last round and was right to.
- D-e is a trim, not an edit. Removing a true fact about a client is not
  trimming. If a line looks redundant but carries a fact, leave it and say so.

Verify per §4 of the plan. **Claim the harness on the board before you run
it.** Then `brief/07-session-comms.md` §5, and `done` on the board.

Do not push without telling me first.

---

## After both waves — the clean pass

`brief/07-session-comms.md` §5 already describes it and it has not changed,
except that it now covers **ten** pages rather than eight: `contact.html` is
new this round. Whichever session is still live runs it, or A by default.

The seams worth checking this round, because they are where this split cuts:

- the footer CTA band on all ten pages, including the two re-expanded case
  pages, and its CTA reaching contact from each;
- the scale tokens doing the same thing on C's case pages as on D's grid;
- the audit working from both the home page and the contact page after A5
  moved it out of `home.js`;
- the new header over B's rebuilt hero, which is the one place where A's
  chrome and B's content meet.
