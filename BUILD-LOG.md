# Build log

Newest first. One entry per commit, saying what changed and — where it
matters — what was measured rather than assumed.

---

## 2026-10-14 · The Possah, and four things it caught on the way through

The second case page. Same chassis, same shape as the rebuilt Zingara: a
campaign chapter, the signature, the system, naming, applications, the site
work, scope, next.

### The campaign chapter was missing, and the page promised it

The H1 is *"The budget didn't cover a studio."* and the problem section says the
campaign was built rather than booked. Nothing on the page showed a campaign
frame. Five do now — two on location, three on the seamless — on a new
`.gv.p45`, because `.gv.tall` is 2/3 and these frames are 4:5, and cropping a
seventh off the width of a photograph someone composed is not a layout
decision.

### Three claims written, then withdrawn

Each one I wrote myself and then could not support:

**"Graded until twenty-four pieces looked like one afternoon."** The three
catalogue backdrops measure `230,222,209`, `228,207,180` and `216,192,158`.
That is three grades, not one. The H2, the lede and the closing note all
carried the claim in some form; all three now carry only what is documented —
the models are generated, the garments are real, scope on file is an AI model
photoshoot across 24 SKUs.

**"The cast shadow falling to the right."** It falls left, as a patch of window
light. Alt text and caption corrected after looking at the source frame rather
than the thumbnail.

**"Page 03 of the Possah guidelines."** The tone-of-voice board's own foot reads
03, but the contents board — which is on this same page, two chapters up — puts
Tone of Voice at section 11, page 54. The page names the section instead of a
number it cannot reconcile.

The pattern is the same each time: the claim was plausible, and the file
disagreed. Plausible is the dangerous kind.

### The signature rested in the wrong place

The voice matrix rested at `1,1` — the corner of its own pad, where a 24px dot
with a −12px margin is bisected by the border and effectively invisible, and
25 percentage points away from the dashed ring marking the brand's position.
The guidelines plot Possah *inside* the Bold + Composed quadrant. A brand at
the corner of its own matrix is a caricature of itself, and the board does not
draw one there.

It rests at `.75,.75` now, under the ring, which is grown to 38px so the dot
sits inside it rather than covering it. `--drift` is measured from that point,
one-sided: softer or more playful than Possah is drift; bolder or more composed
is not. JS and CSS derive it with the same expression, so the state announced
to a screen reader cannot disagree with the state on screen.

### Two defects in the shared chassis, both found by looking

**`.pj-specs` and `.pj-swatches` drew their hairlines by bleeding a container
background through a 1px gap.** It works only when the item count fills the last
row. Eight specs in a six-wide `auto-fit` grid left four empty tracks painted as
a solid grey slab. The hairlines are on the cells now, so a grid that does not
fill its last row simply stops.

**`.pj-next .mono` had `opacity:.8`.** The next-project panel wears the *next*
project's accent, and Zingara's true red `#C8332A` is dark enough that cream at
.8 is 3.69:1 at 11px — a real AA failure. Full cream on that red is 4.97:1,
which is the entire budget; there is none to spend on de-emphasis. It was
invisible to the audit until `prefers-reduced-motion` removed the `::before`
overlay that was hiding it.

And one in Zingara's menu mockup: `#8A857C` at 11–13px on `#FFFDF6` is 3.6:1,
in three places. It is a mockup, but it is real text in the DOM, so the real
rule applies. `#746F66` is 4.9:1 and still reads as the quiet line.

### Point 4: "CSS file is not implemented"

Still not reproducible, so it is now asserted instead of argued.
`css-applied.js` checks three failure modes that look identical in a
screenshot — the `<link>` 404s or resolves wrong; it loads but the MIME type
makes the browser refuse it; it applies but a rule you believe is in it is not.
Per page it asserts every linked sheet produced rules, that a load-bearing rule
from each computes on a real element, and that the three `@font-face` families
`core.css` imports actually loaded.

All six stylesheets, all three pages, over HTTP **and** over `file://`: pass.

### Two boards the page was missing

The pattern system (three tessellations, each given its job on the page it is
drawn on) and sizing and minimum scale (60 / 35 / 20 mm in print, 24px digital,
symbol alone below the floor). The last two are also in `.pj-specs` now. Both
carry content nothing else on the page said.

### Also

The OG card pointed at `og-possah.png` while the built file is
`og-the-possah.png` — a broken share image on every link. Both cards now carry
their page's own H1, which also fixed Zingara's, still reading *"The menu was
costing them."* from before the rebuild. And the Possah card set the client's
tagline in Gloock with its capitalisation changed to suit the template; the
line is ours now.

### Measured

Zero axe violations on all three pages across desktop, reduced-motion and
mobile. Zero console errors, zero CSP violations, zero failed requests, on
every pass including GSAP blocked. Contrast audit against drawn pixels: clean.
**500 KB first load, 1102 KB fully scrolled**, against a 1500 KB budget, with
twenty-three boards on the page.

The voice matrix was driven three ways — at rest, by keyboard through the range
inputs, and by pointer drag — with GSAP loaded and with GSAP blocked. Identical
in both: the dot lands inside the pad, the quadrant and the cross-fade follow,
and the live region says the state in words.

### Still open

One axe finding remains, on the **home page** and pre-existing: `.ink` body copy
starts its entrance animation at `opacity:0.2`, which computes to 1.41:1 before
it reveals. It is a transient state of a 0.7s fade that fires as the element
enters the viewport, and with JS off there is no CSS rule setting it at all, so
the no-GSAP path is fully contrasted. Changing the reveal is a design decision,
so it is reported rather than changed.

---

## 2026-10-14 · Body copy fades up from 0, not from 0.2

The one axe finding the project-pages session reported on the home page
rather than touching, since the reveal is a design call. Taking it: `.ink`
body copy animated `opacity` from `0.2`, which is visible text at 1.41:1.
A visitor who stops scrolling mid-reveal, or whose tab is throttled, is
left looking at body copy they cannot read. Absent is honest, illegible is
not, and the reduced-motion branch in the same block already faded from 0 —
so this removes a difference rather than adding one. `core.js` is shared,
so it applies to all three pages.

Not taken: `.ft-in` enters at `opacity:0.3`, which looks like the same
problem and is not quite. It is scrubbed against scroll position rather
than played once, and at 0.3 the footer is still largely below the fold.
Left alone, and noted here so the next session does not have to re-derive
why.

---

## 2026-10-14 · The copy pass reaches the project pages

Handed over by the project-pages session, correctly: the home footer was
cut back to `© 2026 NUANSE` while `zingara.html` and `the-possah.html`
still carried "The S is reversed on purpose" and "Type “nuanse” anywhere".
The chassis is shared, so a decision taken on it has to land everywhere or
it is not a decision.

Six strings, applied to both built pages and to `_zingara.src.html` and
`_the-possah.src.html` so a re-run of `expand-figures.py` cannot resurrect
them: "Registering" from the curtain, the cursor's `Look closer` default,
the nav S-counter and its tooltip, "still there?", the `Drag the mark`
cursor label, and the two footer lines that explained the easter eggs.
Nothing on the case pages' own copy was touched — that is a separate list,
and it is still with the user.

---

## 2026-10-14 · The last of the home copy trims

The remainder of the approved list. Small, and all of it the same move:
say it once, at the length it deserves.

**The audit.** The lede opened with "Eight questions, two minutes" and the
mono line under the button says `8 questions · 2 minutes · free`. The
scannable one stays. The result screen listed every question the visitor did
not answer yes to — up to eight lines of what is wrong with their brand under
their own score. It now shows three. A wall of negatives reads as a verdict on
the founder rather than a list of fixable details, which is the opposite of
what the page is for. The two longest questions lost their clauses:
"from your name and logo" and "Swiggy, Zomato or marketplace listings look
like the same brand as" say nothing the shorter question does not.

**Team.** Four sentences to two. Zingara's cold call is the first paragraph of
`work/zingara.html`; the home page does not need to name the client to make
the point that the studio won its first job by noticing something.

**Services.** Three bullets went, each of which only repeated the front of its
own card: `Design` and `Build` under a card whose front reads "Built, not just
designed", and `Captions` under one that reads "The second line of a caption".
`Signage` stayed. The approved note said three bullets per card, and that is
*not* done — see below.

**Proof 01.** Six menu rows to four. It is a thumbnail at a quarter of its own
size behind a redline; the section counts on it (`12`, `09`) are the real
section lengths and still read true.

**Not done, and why.** Cutting the deliverable lists to three per card is left
with the user. The other 22 bullets are not duplication, they are the
capability list — the one place a buyer checks whether the studio does the
thing they came for. Dropping `Naming & name systems` or `Swiggy & Zomato
listings` to hit a count is a commercial decision, not a copy one, and it is
not ours to make quietly.

---

## 2026-10-14 · Zingara is told once

The second half of the approved copy pass. Zingara was being told four times
— proof print 01, the redline section, the case overlay and its own page —
with the same headline, the same three fixes and, in two of them, conflicting
numbers. It is now told once, on its page.

**The redline section keeps the argument and drops the retelling.** The
before/after mock stays, because that comparison is the point and makes it
without copy. The `A B C` fixes list and the results pair go: both are on
`work/zingara.html` in full, and the button under the lede has always gone
there. The three annotation labels stop reciting specifications —
`A · Gloock · kerning −0.02em` becomes `A · One typeface, kerned by hand`,
and the hex value and the `no Rs. no /-` note go the same way. A founder can
act on the second phrasing.

**This resolves a contradiction, not just a duplication.** The home page
stated `+22%` average order value and `−31%` cost per reservation as fact,
while the case page carried those same two figures as `[[NEEDS]]`
placeholders awaiting confirmation. One of the two pages had to be wrong.
Removing the home page's claim leaves the case page as the single answer, and
it says plainly that the figures are pending.

**Proof 01 is now a route, not a dialog.** It carries `data-href` instead of
`data-case`, and the print wiring sends a print with an href through
`NU.goPage` — the curtain page-change, now exported from the chassis rather
than private to `core.js`. The overlay keeps the two cases that have no page
yet, and each carries its own `no:` so the card still reads `Case 02` and
`Case 03` against the prints they belong to rather than renumbering to fill
the gap.

`countResults()` and its ScrollTrigger are gone with the figures they
animated, and `writeOn`/`unwrite` now guard `a.li`, since the list item each
annotation used to light no longer exists on this page.

---

## 2026-10-14 · The home page stops explaining itself

A copy pass, classified and approved line by line before anything was
touched: 35 strings cut from the home page, nothing rewritten yet. Three
kinds of text went.

**Labels that explain the interaction.** "Move slowly. Look closer.",
"Open a proof to read the case", "Hover a card to turn it", "Founder eyes on
everything. Pick a need and watch who joins.", "Read it slowly. It's short on
purpose.", and the two footer lines that gave away the easter eggs ("The S is
reversed on purpose", "Type “nuanse” anywhere"). A page that captions its own
gestures reads as unsure of them. "Look closer" alone appeared six times
across the cursor, the hero section, the toggle and the hint; the toggle keeps
it and the other five are gone.

**The numbered mono eyebrows.** `02 · Disciplines` through `09 · Audit`, plus
`03 · A letter` and `05 · Case · Zingara`. Where a section needs naming it gets
a real heading in the display face rather than an 11px mono tag above one, so
`.sec-head` now spans its single remaining child across the grid instead of
leaving the h2 in the narrow first column.

**Facts said twice.** `8 people · 5 disciplines` stood in the hero, the letter
sign-off and as the Team heading; it survives once, in Team. "Every job ends
with numbers" is still made by the letter, Process 04 and the whole audit
section. `Stage 01`–`04` duplicated both the ordered list and the readout
panel, and that panel restated the stage you were already reading, so it is
gone and the stage timings stand alone. Also cut: the duplicate `Before ·
After` tagline under the tags that already say it, the S-counter in the nav
and its three toasts, and "Registering" from the loader.

**Deliberately not done.** The audit trail's mark vocabulary stays as built
two days ago. The list approved for this pass called for cutting its spec
strings, but that pool has since been rebuilt into five documented categories
where `Menu`, `Signage`, `Swiggy` and `Zomato` are plainly client-legible;
undoing that unseen was the wrong call, so it is back with the author. The
lens annotations keep their type specs for the same reason — only `an-eb` went,
because its anchor, the hero eyebrow, no longer exists.

`bump()` and `toast()` are left intact in `core.js` though nothing now calls
them from the home page. They are shared chassis, and leaving them means the
counter is restored by putting its markup back.

---

## 2026-10-12 · Hero S per glyph, the bubble, and a brand vocabulary for the audit

Three of the five corrections raised against the Phase 2 review.

**The hero S turns one letter at a time.** It used to turn on two triggers at
once: hovering anywhere on the headline flipped every S in it, and the lens
layer mirrored every S inside its circle, so merely moving the pointer flipped
text. Both are gone. `core.css` now excludes `.hero-h` from the whole-heading
turn — every other heading keeps it, because that is the documented behaviour
from `nuanse-house` — and `home.css` adds a per-glyph `:hover`.

The lens made this harder than it looks. It is an opaque clone sitting over the
base layer, so an S inside the circle is being *looked at* in the clone while
the one that turns is the original hidden underneath. `wireHeroS()` in `home.js`
indexes both lists of glyphs and mirrors the hover across, after checking the
two lists are the same length rather than guessing at the alignment.

**The lens has a resting state.** `.lens-toggle` was a button shown only to
touch and reduced motion. It is now the bubble: always present, floating at the
right of the hero, receding while the lens is open and floating back when it
closes or the pointer goes still for 1.2s. Clicking it still latches the lens,
so it is one object with two states rather than an effect appearing from
nowhere.

The float and the recede are pure CSS, using the independent `translate` and
`scale` properties so they compose without fighting over one `transform`. It all
works with no GSAP. The bubble recedes to a quarter opacity rather than to
nothing, because it stays focusable throughout and a focusable control you
cannot see is a WCAG 2.4.7 failure.

One trap worth recording: the hero intro tween left an inline `opacity:1` on the
bubble, and an inline style outranks `.lens-toggle.away`, so the recede silently
never happened. The timeline now hands the property back to the stylesheet on
complete.

**"Find the detail" reveals brand detail.** The ten flat typesetting marks
became five categories — type, colour, application, design, listings — cycled
round-robin so consecutive marks differ in kind. Every mark is either true of
this page or documented in a client's kit. Two inks, not five: the system's own
rules in copper, the surfaces it has to survive in the quieter ink, and a colour
value carries its own swatch.

**Measured, not assumed.** Synthesised pointer input through the DevTools
Protocol: hovering glyph 1 flips glyph 1 and nothing else, in both the base
layer and the clone; the bubble reads `opacity 0.25` while the lens is open and
`1` at rest, parked 57px from the right edge with the bob animation running;
latching opens the lens from the bubble's own centre. Zero console errors, zero
CSP violations across desktop, reduced-motion and GSAP-blocked passes.

---

## 2026-10-12 · The Possah ratio meter, measured and abandoned

`tools/sample-ratios.py` is new. It classifies pixels against the five
documented Possah palette anchors in CIELAB and reports whether the resulting
proportion is defensible enough to publish — which is the part that mattered.

The brief asks for a live 60/30/10 meter over the campaign frames. It fails
three gates, and the numbers are in
`site/assets/work/_ratios-possah-{campaign,identity}.json` for anyone to check:

| Gate | Needs | Campaign | Identity boards |
|---|---|---|---|
| Coverage | ≥ 80% | 34.5% | 83.2% |
| Stability across a threshold sweep | ≤ ±5pp | ±30pp | ±8.5pp |
| Proximity to 60/30/10 | ≤ 12pp | 28.7pp | 26.4pp (86/11/3) |

60/30/10 is a *layout* rule; the board that states it illustrates it on a web
hero, an IG post and packaging — compositions the studio controls pixel by
pixel. The campaign frames are photographs of garments on a person in a room.
The rule also does not partition the palette: Dusty Rose is a documented primary
with no slot in it.

The chroma floor in the classifier is the load-bearing gate. Deep Forest Green
is L\*22 — in Lab it is mostly just "dark" — so without it every shadow and
strand of dark hair classifies as green, taking green from 3.2% to 34%. That is
the most seductive wrong answer in the exercise, because it looks encouragingly
like the stated 30%.

**What does survive:** across the 33 guideline boards, accent runs a median of
1.7% against the brand's own 10% ceiling, and stays under it on 31 of 33. The
two over are the colour-palette page (14.3%, where swatches are the subject) and
the moodboard (16.4%, photography rather than layout). A ceiling is a one-sided
test, which is why it holds where the three-way split does not. That ships as a
sourced note; the meter does not.

---

## 2026-10-12 · Zingara is a brand case now, not a menu case

The page led with the menu, was built around the menu and showed five boards.
Sixteen of the twenty-one boards on file never appeared, and the whole identity
programme behind the menu — the mark, the palette, the icon set, the packaging,
the signage, the room, the livery, the site — was invisible. Rebuilt into named
chapters, fifteen boards, with the menu demoted from the page's thesis to the
proof inside a larger one.

| | |
|---|---|
| Opening frame | "It read like three restaurants" — documented; 3 → 1 was already on the page |
| The problem | Keeps "The menu was costing them" as its opening line, then widens: there was no system behind any of it |
| 01 · The system | What was *decided*. Palette as live swatches with the documented hexes, a spec table of the real numbers, three written brand lines as pull quotes, and four boards |
| 02 · The fix | The menu slider, unchanged. Still the one bespoke element |
| 03 · It travels | Print, packaging, the street, the room, the livery, the eight textures |
| 04 · On a screen | Site and order flow, social, a this/not-this table of the listings discipline, and a link out to the live site |
| 05 · It extends | The whole system on one page, Amma's Breakfast, the written hierarchy |
| The numbers | +22% average order value and −31% cost per reservation now filled — see below |
| Scope | Fifteen lines, from brand audit to guidelines |

**The two held figures are filled.** I had marked average order value and cost
per reservation `[[NEEDS: ...]]`. They were on file the whole time, in
`reference/index-current.html:1868` — the named Zingara case on NUANSE's own
current site. The rule is "no figure that did not come from me or from the
files"; these came from the files, so they ship, each carrying a provenance
line saying where it came from rather than being presented as fresh.

**Two boards disagree about the red.** The colour system board says
`#C8332A`; the packaging board quotes `#C0392B`. The page holds to the colour
system board and says so in a source note rather than silently picking one.

### Shared chassis, not Zingara-only

Seven patterns went into `work.css` rather than the page's own file, each
because The Possah needs it too: `.pj-chapter`, `.pj-system`, `.pj-swatches`,
`.pj-specs`, `.pj-quotes`, `.pj-grid`/`.gv`, `.pj-compare`, `.pj-live`,
`.pj-src`. Swatch colours arrive as classes setting `--sw`; the chip is hidden
from the accessibility tree and the hex beside it is real text, so the value is
the accessible name and nothing depends on seeing the colour.

### A layout defect the screenshots caught and the metrics did not

`.ev` put the board in the 1fr column and the caption in the 2.4fr column on
every odd row, because the frame comes first in the DOM and only the even rows
reordered it. A full guideline page was rendering about 220px wide. Both are
now placed explicitly, so the board always takes the wide column and only the
side alternates. The selector also moved from `nth-child` to `nth-of-type`, so
a `.pj-grid` sitting between two rows no longer flips the rhythm of everything
after it.

### Two new tools

`tools/expand-figures.py` expands `[[FIG name]]` tokens in a page source into
real `<picture>` markup read off the manifest. There is still no build step for
the HTML — this runs by hand when the image set changes and what ships is its
plain static output. It exists because fifteen figures means fifteen srcsets of
four content-hashed filenames each, and transcribing those by hand is how a
page ends up pointing at an image that no longer exists.

`tools/build-page-images.py` gained a per-slug width cap and per-figure `sizes`.
Capping at 1440 instead of 1800: a square board at 60vw inside a 1320 container
is about 790 CSS px, so at DPR 2 an 1800 derivative is weight nobody can see.

### Also

`core.js` now registers only the GSAP plugins a page actually loaded, instead
of naming all five and throwing on a page that ships fewer. SplitText turned
out to be referenced nowhere but that registration line, so it is gone from
every page; DrawSVG draws the home page's redline and nothing else, so project
pages no longer carry it.

### Measured

Zero axe violations. The 62 indeterminate contrast checks are all pre-existing
chassis elements — nav over a pseudo-element ground, split headings, the
interpolating signature, the footer — and none of the new patterns is among
them. Zero console errors and zero CSP violations across desktop,
reduced-motion, mobile and GSAP-blocked. **506 KB first load, 884 KB fully
scrolled**, against a 1500 KB budget, with fifteen boards on the page.
