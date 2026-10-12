# Build log

Newest first. One entry per commit, saying what changed and — where it
matters — what was measured rather than assumed.

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
