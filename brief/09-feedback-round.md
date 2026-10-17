# Feedback round 2 — the client's notes, triaged

The client sent notes on three pages. This file is the triage: what each note
asks for, what it costs, who owns it, and — where a note cannot be built from
what is on file — exactly which fact is missing.

Same house rules as every other cycle. `05-conventions.md` and `README.md`
still govern. The two that bite hardest here:

- **No client fact that did not come from the client or the files.** A missing
  figure renders as a visible `[[NEEDS: …]]`. Never a plausible guess. Note
  **W2** is almost entirely this.
- **Nothing new on the home page or the chassis from Session B.** The split is
  in §4.

---

## 1 · Page 1 · Home — items H1–H4

Session A's, every one. Listed here so the round is in one place.

| # | The note | What it is in code |
|---|---|---|
| **H1** | When there is no input, the cursor returns to its origin and sits in a hovering state | `core.js`. `NU.cursorRest()` already exists; this is an idle timer plus a rest state, not a new cursor |
| **H2** | On hover the background gets *brighter with the blue element*, not plain | `home.css` / `home.js`. The client's words: "let that main ground get brighter with the blue element rather than plain" |
| **H3** | Stop featuring only Zingara and Rossali — show the other clients | `index.html`. Note: **"Rossali" is not a name anywhere in this repo.** Either it is The Possah misheard, or it is a client we have never been told about. Asked, §5 Q1 |
| **H4** | A continuously moving client-logo carousel | `index.html`, `home.css`, `home.js`. **The marks already exist** — `tools/build-client-marks.py` has emitted eleven of them to `site/assets/work/clients/` with `_manifest.json`. Reuse; do not re-download or redraw |

---

## 2 · Page 2 · Work — items W1–W6

All Session B. This is the loudest half of the round: six notes on one page.

### W1 · Reduce the negative space

The note: *"Improve the use of available space and make the layout feel more
engaging."*

Measured before cut, not guessed. The page is four stacked full-bleed
sections — `pg-open`, the pinned proofs, the roster, `pg-next` — and the
suspects are the opening frame's height, the pin's `end: '+=120%'`, and the
roster's `padding: clamp(34px,4vw,56px)` per row with `--s4` between bands.

Rule for this item: **nothing is tightened below the point where two
different things start reading as one thing.** Negative space is how the
roster reads as a roster instead of a list. The fix is to put something in the
space, not to delete the space.

### W2 · Every client gets context — and this is where the facts run out

The note asks each client for: the requirement or pain point, the approach,
the solution delivered, and the outcome where available.

**We have all four for exactly two clients.** Zingara and The Possah have
full cases. For the other ten, everything on file is in
`reference/reference-sites.md`: a name, a URL, a sector, and for two of them a
tagline the client publishes themselves. There is no pain point, no approach,
no outcome, and nothing that could be turned into one without inventing it.

So W2 ships as **structure now, facts when the client sends them**:

- the overlay renders the four-part frame for every client;
- a field the client has not supplied renders `[[NEEDS: …]]`, visibly, in
  copper, so it cannot reach production unnoticed;
- §5 Q2 is the fill-in-the-blanks block. Four lines per client, ten clients.

What is *not* done: writing a plausible pain point for Shail Interiors. The
page already carries the honest version of this in `qual-note` — *"the scope
is on file with the client and nothing about it is published here. Not a
smaller job — just nothing we can source a sentence to"* — and that sentence
was right.

### W3 · Expand the portfolio

The note: *"Additional clients and projects will be added."* That is a note
about the next six months, not about today, so the deliverable is a shape that
takes a new client without markup surgery.

Shape chosen: the roster **rows stay in HTML** — they are the crawlable
content of this page and they must render with GSAP blocked and from
`file://` — and each row carries `data-client="<slug>"`. The detail behind the
overlay lives in one record in `js/clients.js`.

Adding a client is therefore two edits in two known places, with a template
comment at the top of each. Rejected: generating the rows from JS, which would
have made it one edit and taken twelve clients out of the HTML a crawler
reads.

### W4 · Project filters

The note: *"filter projects by category or type of work."*

**Filter by sector, because sector is the only axis every row can source.**
Every row already carries `rs-sector` and it came from
`reference/reference-sites.md`. Type of work is published for two clients and
unknown for ten, so a "Websites / Identity / Content" axis would be ten rows
of wrong.

The mechanism is not new: `team.js` already filters a grid with chips and
Flip, and that pattern moves here.

A work-type axis is one record key away — `scope: [...]` in `clients.js` — and
turns on the day §5 Q2 comes back.

### W5 · Visual appeal and subtle interaction

The note: *"too bland and uninviting"*, and separately: *"refined hover
effects, transitions, and click animations."*

The roster already spends one accent on hover — a copper rule that grows under
the row — and that stays. What is added is the click: a row opening its
overlay with a clip-path from its own rectangle, which `proofs.js` already
does for the two anonymised proofs (`rectInset`). Same function, same feel,
one implementation.

Budget: copper stays at about 3% of the page. A roster that highlights twelve
rows in copper is not an accent, it is a palette.

### W6 · A modal for the clients that have no page

The note: *"except the case studies for 2, the others let them have a
dedicated popup screen rather than a page, which can be expandable."*

Exactly the split the page already draws: two full cases keep their pages
(`zingara.html`, `the-possah.html`) and route to them; the other ten open an
overlay. `.case-ov` exists and `proofs.js` already drives it for two
anonymised cases — the overlay generalises rather than being built again.

*Expandable* is read two ways and both are built: the overlay opens compact
and expands to the full record; and the record itself grows as fields arrive,
with nothing to re-lay-out when they do.

---

## 3 · Page 3 · Services and Process — items S1–S3, P1

All Session B.

### S1 · Stop using the menu as the example on every page

The note: *"The menu is being used as a recurring visual or conceptual
element across the website."* It is, and it is measurable:

| Where | What it says |
|---|---|
| `index.html:183` | "the kerning on a menu, the frame a reel cuts on…" |
| `index.html:274` | "The menu was costing them." |
| `services.html:112` | "So the menu, the reel and the ad all sound like the same place." |
| `process.html:132` | "We audit before we touch anything: the menu, your listings…" |
| `process.html:150` | "Identity, menus, packaging, the site, the shoot." |
| proof 01, home **and** `/work` | a drawn restaurant menu |

Zingara's case page is **not** on that list and is not touched. The menu is
that client's actual story and 189 items is its actual number; a case page
repeating its own subject is not repetition.

The fix on B's pages is to vary the worked example, not to delete it: the
studio does five things and the menu is one of them, so services and process
can each carry a different one.

### S2 · Refine the service illustrations

Five drawn SVGs, one per discipline, already on the page. The note asks for
*polished, smooth, aesthetic, consistent with the design language.*

Judged by rendering, not by reading the source. The weakest on inspection is
`sa-performance` — an unlabelled line chart is the most generic drawing on the
site and it illustrates the discipline least. `sa-websites` is a grid of grey
blocks. `sa-strategy` and `sa-content` carry a real idea each and need craft,
not redesign.

Constraint: the drawings are **the finished artifact** and
`services.js` only hides parts and plays them back. Refining a drawing must
not need a new motion path, and must not need a reduced-motion branch — see
B5 from the last cycle, recorded in `BUILD-LOG.md`.

### S3 · The illustrations are consistent with each other

Implied by S2 and worth its own line: five drawings at `viewBox 0 0 400 300`
should share a line weight, a label position, an optical margin and a
treatment for the copper accent. Today they do not quite.

### P1 · The process becomes a loop

The note: *"Make the process page more dynamic… plan complete loop on
approval proceed."*

Read as structure rather than as more motion: today the four stages are a
**straight rail** that fills with scroll and stops at the bottom. The note
says the process is a **loop** — Run reports, and what it reports becomes the
next Diagnose — and that each step proceeds **on approval**.

So the page gains two things it does not have, both of them true of how the
work actually runs:

1. **the loop closes.** The rail returns from Run to Diagnose instead of
   ending, which is the one claim the current page gets wrong by omission.
2. **a gate between stages.** Each stage hands over something the client
   signs off before the next begins — and three of the four already name their
   output in the markup (`data-out`), so the gate is in the data already.

"More dynamic" is then a consequence of the structure rather than a motion
budget spent for its own sake. Same contract as everything else: one moving
thing per screen, a reduced-motion path that puts nothing back, and the page
reads with GSAP blocked.

---

## 4 · The split

| Session A | Session B |
|---|---|
| H1 H2 H3 H4 | W1 W2 W3 W4 W5 W6 · S1 S2 S3 · P1 |
| `site/index.html` | `site/work/*.html` |
| `css/home.css`, `js/home.js` | `css/work.css`, `css/work-index.css`, `css/proofs.css`, `js/proofs.js`, `js/clients.js` |
| `css/core.css`, `js/core.js` | `site/services.html`, `css/services.css`, `js/services.js` |
| | `site/process.html`, `css/process.css`, `js/process.js` |
| | `tools/` |

Shared, additive only: `BUILD-LOG.md`, `README.md`,
`brief/07-session-comms.md`.

**S1 crosses the line.** Two of the six menu references are on
`index.html`, which is A's. B does the four on its own pages and posts
`ask-A` for the two on the home page.

**The chassis rule holds.** `core.css` and `core.js` are A's. H1 is a core
change, so it is A's whether or not A takes the rest.

---

## 5 · What the client has to answer

Both of these block work that is otherwise ready to build. Neither is guessed
at in the meantime.

**Q1 — Who is Rossali?** The note says the home page features "Zingara and
Rossali". Rossali appears nowhere in this repository. Either it is The Possah,
or it is a client we have never been given. H3 cannot be done correctly
without knowing which.

**Q2 — Four lines per client, for the ten that have no case.** Velmont,
Assetly, Artizen Projects, NAZR, Noir Velin, Shail Interiors, Aware
Acoustics, Nuozone Studio, Tulipss, Amma's Breakfast. For each:

```
Client:
  What they came with (the problem, one line):
  What we did (the approach, one line):
  What they got (the deliverables, a list):
  What happened (a number, or "nothing published"):
```

"Nothing published" is a complete and acceptable answer, and renders as the
`qual-note` sentence rather than as a placeholder. What cannot be done is a
plausible sentence written here.

Until Q2 comes back, each unsupplied field renders `[[NEEDS: …]]`.

---

## 6 · Verification

Unchanged from `06-revision-plan.md` §5. Every page B touches, in all four
modes — desktop, `prefers-reduced-motion`, touch at 390×844, and GSAP blocked
(`--block-cdn`) — plus a `file://` load. Zero console errors, zero exceptions,
zero CSP violations, zero failed requests. axe clean. Every text node clears
AA against its own effective background, measured after the reveals settle
and not during.

Two measurements this round owes specifically:

- **W1** reports the page height before and after. "Less negative space" is a
  number, not an impression.
- **W4** asserts every chip's result set against `clients.js`, the way
  `chips.js` asserted the team lane against D4 last cycle.
