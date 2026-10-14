# Build log

Newest first. One entry per commit, saying what changed and — where it
matters — what was measured rather than assumed.

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
