# The two reference builds

Both HTML files in this folder are **reference**. Neither is the thing you are
editing. The site is being rebuilt, and these two are what you are rebuilding
from — one for its design, one for a handful of interactions it gets right.

Read both before writing anything. Then build fresh.

---

## `index-current.html` — the design reference

136 KB, single file, no build step. This is the most recent build and it
carries the design direction: the palette, the type scale, the section
sequence, the copper-foil grounds, the S device, the overall feel. When the
rebuild needs to know what something should look like, this is the answer.

`index-current-NOTES.md` is its own documentation — a section-by-section
table, the conventions it holds to, the dependency list. Worth reading in full;
it is short and it explains intent the markup does not.

Eleven sections, in order:

| | Section | What it does |
|---|---|---|
| 0 | Loader | Cream cover lifts off a copper-foil ground, pre-press crop marks register the page |
| 1 | Hero | Copper foil ground (WebGL), plus a lens revealing the type specs underneath |
| 2 | Marquee | Five disciplines, skewing with scroll velocity |
| 3 | Manifesto | A letter rising out of an envelope, sharpening as you read. Pinned |
| 4 | Work | Three proof prints, redlined, pinned. Opens into a case overlay |
| 5 | Redline | Before/after slider on the Zingara menu. The before fidgets; the after never moves |
| 6 | Services | Five fanned cards that flip |
| 7 | Process | Four docking panels on a copper rail |
| 8 | Team | Scatter with parallax, plus a "who's on your brief" builder |
| 9 | Audit | Eight-question brand audit, copper annotation trail following the pointer |
| 10 | Footer | Revealed under the page. The 3D S is draggable and springs back |

**What to carry forward:** the section sequence and what each section is for;
the palette and type scale; the motion vocabulary (three speeds, one curve);
the redline slider, which is the best single interaction across both files;
the case copy at lines 1864-1880, which is real and specific.

**What not to carry forward:** the single-file architecture, the typographic
stand-in S, and the four behaviours in `brief/01-requirements.md`.

---

## `nuanse-house.html` — the interaction reference

416 KB, an earlier and different build. The design is superseded — do not take
layout, palette or copy from it. Three interactions in it are better than the
current build's, and they are specified in `brief/01-requirements.md`:

| Behaviour | Where in this file |
|---|---|
| Cursor with a rest state — a ring that always follows, swelling to a labelled disc over targets | CSS lines 62-68, JS lines 859-863 |
| S inversion that reverts on un-hover, done in CSS with no state | lines 35, 150, 328, 340, 360 |
| Nav as a backed, blurred pill with a sliding indicator | CSS line 43, JS line 1120 |

Two smaller things in it worth considering, neither required:

- A sound toggle with Web Audio blips on hover (lines 1017-1021). Off by
  default. Ask before building this; it is a taste call, not a gap.
- `markS()` at line 795 — a TreeWalker that wraps every `s`/`S` in a text node
  with a span while keeping words unbroken. The current build does this too,
  but this implementation is the cleaner of the two and handles the
  no-break-wrapping case explicitly.

**Note on where the logo came from.** This file embeds the NUANSE marks as
base64 PNGs in an `IMG` registry at line 720 — about 310 KB, three quarters of
the file. Those were an earlier, lower-resolution version. The real masters are
now in `site/assets/brand/`, generated from the 6496x4606 original. Do not
extract the marks from this file; they are superseded.

---

## How to use both

The rebuild takes its **design from `index-current.html`** and its **interaction
corrections from `nuanse-house.html`**, on a clean multi-page architecture that
neither of them has.

Improving on both is expected — that is the point of rebuilding rather than
patching. What improvement means here:

- **Architecture.** Shared stylesheet and script instead of one 136 KB file,
  so the nav, cursor and footer exist once. See `brief/03-build-plan.md`.
- **Correctness.** The four requirements in `brief/01-requirements.md`.
- **Performance.** External CSS and JS let the CSP drop `'unsafe-inline'`;
  self-hosted fonts drop two more hosts. Responsive images with real `srcset`.
- **Accessibility.** Both builds have reduced-motion and keyboard paths. Hold
  that standard on every new page rather than treating it as a final pass.

What improvement does **not** mean: a new palette, a new type system, a new
section order, or a redesigned hero. The design direction is established. You
are rebuilding it properly and extending it to project pages, not replacing it.
If you think something in the design is wrong, say so and wait — do not change
it unilaterally.
