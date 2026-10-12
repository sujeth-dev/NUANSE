# Four corrections to the existing page

These are the fixes to `reference/index-current.html` before any new page is built. Line
numbers are as shipped in this kit; verify before editing, they will drift.

---

## 1. Use the real mark, not a typographic S

### The problem

Every mark on the page is the letter S set in Gloock and mirrored with
`transform: scaleX(-1)`. That is a stand-in, not the logo. The real mark is a
drawn reversed S with its own stroke modulation and terminals — it is thinner
at the joins and has flat, angled cuts at the ends that Gloock does not have.
Mirroring a serif S does not produce it.

### Good news: the palette is already exact

The master logo file is flat and two-colour. Sampled pixel values:

| Sampled from the logo | Hex | Already in `index.html` line 49 |
|---|---|---|
| Wordmark letters | `#0D1A41` | `--navy:#0D1A41` — exact match |
| The reversed S | `#B56528` | `--copper:#B56528` — exact match |
| Monogram ground | `#FCF7F1` | `--cream:#FCF7F1` — exact match |

Nothing in the colour system needs to change. The tokens were built from this
logo and they are correct.

### Where the stand-in is used today

| Where | `reference/index-current.html` | What it is now |
|---|---|---|
| Nav mark | `.nav-mark`, line 144 | `<span class="nav-mark">S</span>`, Gloock 30px, `scaleX(-1)` |
| Footer 3D S | `.s3d-l span`, line 530 | The draggable spring-back S |
| Marquee separator | `.mq-sep`, line 242 | Between disciplines |
| Favicon | line 12 | Inline SVG with a `<text>` element |
| Lens overlay | `.lens .s`, line 213 | Reveals type specs |
| Hero-to-nav flight | `.flyer` / `fly()`, lines 1605-1645 | The S that flies into the nav slot |

### What the rebuild should do

**Use the real asset** everywhere the S stands in for the *mark*: nav, footer
3D S, marquee separator, favicon, loader, curtain, OG image.

**Keep live text** for the `.s` spans inside headline copy. Those are the letter s occurring
inside real words — "Most brand**s** are one detail away" — and they must stay
live text for selection, search and screen readers. They keep the Gloock-
mirrored treatment. This distinction is the whole point of the device: the mark
is the mark, and the letter inside a word is a nod to it.

The two meet only in the hero-to-nav flight at lines 1605-1645, where a
headline `.s` physically becomes the nav mark. Cross-fade mid-flight: the flyer
starts as the live glyph and swaps to the asset partway through the 1.1s
travel, under cover of the scale change. Do not swap at the endpoint — the
silhouettes differ enough to pop.

### The assets, in `site/assets/brand/`

Generated from the masters in `website-n-assets/Website/Nuanse assets/`. All
PNG with transparency, all derived from a 6496x4606 two-colour original, so
they are clean-edged rather than resampled from something small.

| File | Size | Use |
|---|---|---|
| `wordmark-navy-1600/800/400.png` | 1600x307 and down | Wordmark on light grounds |
| `wordmark-cream-1600/800/400.png` | 1600x307 and down | Wordmark on dark grounds. Navy recoloured to cream; the copper S is untouched |
| `monogram-copper-1024/512/256/128.png` | 1024x1476 and down | The mark on light grounds |
| `monogram-cream-*.png` | same | The mark on dark grounds |
| `monogram-navy-*.png` | same | The mark where copper would be too loud |
| `favicon-512/180/32.png` | square | Copper mark on navy, 1.45x padding |
| `og-default.png` | 1200x630 | Cream wordmark centred on navy |

Pick by slot size: nav mark at 34px takes the 128, the footer 3D S at up to
220px takes the 512, hero uses of the wordmark take the 1600.

### One caveat, and it is smaller than it looks

**There is no SVG.** The masters are raster. That is worth fixing eventually —
a traced SVG would be about 4 KB against 25-160 KB, and would stay crisp under
the footer S's perspective transform at any zoom. But the source is 6496px
wide and flat two-colour, so the PNGs are sharp at every size this site uses.
This is a nice-to-have, not a blocker. See `brief/04-asset-inventory.md`.

The monogram master was a JPEG with the cream ground baked in. The alpha in
`monogram-*.png` was keyed out by measuring each pixel's distance from cream
toward copper, which gives true anti-aliased edges rather than a hard cutout.
Checked against navy: no cream fringe. If you regenerate these, use
`tools/build-brand-assets.py` rather than keying by hand.

---

## 2. The cursor needs a rest state

### The problem

`reference/index-current.html` lines 1406-1434. The cursor pill only exists when it is over
something: `pillCheck()` fades it to `opacity: 0, scale: .6` the moment the
pointer leaves a `[data-cursor]` element. Between targets there is nothing. The
custom cursor blinks in and out of existence.

### The behaviour to port

`reference/nuanse-house.html` lines 62-68 (CSS) and 859-863 (JS). There the
cursor is always present and has two states:

```css
.cur i     { width: 40px;  height: 40px;  margin: -20px 0 0 -20px;
             border: 1px solid var(--copper); }        /* rest */
.cur.big i { width: 100px; height: 100px; margin: -50px 0 0 -50px;
             background: var(--copper); }              /* over a target */
.cur b     { opacity: 0 }                              /* label hidden at rest */
.cur.big b { opacity: 1 }
```

A 40px copper ring follows the pointer at all times. Over a `[data-cursor]`
element it swells to a 100px filled copper disc and the label fades in.
Leaving, it returns to the ring. `.4s var(--ease)` on the geometry, `.25s` on
the label opacity.

### Notes for the port

- Keep the current `gsap.quickTo` follow — it is smoother than the reference's.
  Only the state machine changes.
- Hide the rest ring over text inputs and the audit's fields, or it fights the
  I-beam.
- `@media (pointer: fine)` only, as now.
- Under `prefers-reduced-motion` the pill is already off. Keep it off — do not
  add a rest ring for reduced-motion users.
- Keep the `lastLabel` guard; it avoids a reflow on every pointermove.

---

## 3. The S inversion must revert when you stop hovering

### The problem

`reference/index-current.html` line 1375:

```js
function flip(s){ if(s.classList.contains('is-flipped')) return false;
                  s.classList.add('is-flipped'); bump(); return true; }
```

Driven by a `pointerover` listener at line 1383. The class is added and never
removed. Hover an S once and it stays inverted for the rest of the session, so
the page slowly fills with flipped letters.

### The behaviour to port

`reference/nuanse-house.html` does it in CSS alone — no JS, no state:

```css
.s            { display:inline-block;
                transition: transform .7s var(--ease), color .4s }
.row:hover .s { transform: scaleX(-1); color: var(--copper-lt) }   /* line 150 */
.cta h2:hover .s { ... }                                           /* line 328 */
.teaser:hover .s { ... }                                           /* line 360 */
```

Hover the container, every S in it turns; leave, they turn back over 0.7s. The
transition sits on `.s` itself, so both directions are eased.

### How to reconcile with the counter

The current build has a collectible on top of the flip: a `turned: NN` readout
and a `nuanse` keyword that flips every S at once. `nuanse-house` has that too
— a `.allturn` body class at line 340, plus a triple-tap on the nav mark at
line 1040.

**Open question 3 in the overview — confirm before building.** Recommended:

- **The visual flip becomes CSS hover, and reverts.** Add `.s` to a `:hover`
  rule on its containing block. Delete the `pointerover` call to `flip()`.
- **The counter survives, decoupled from the visual.** Keep a `Set` of S's
  hovered at least once; `turned` is its size. The letter reverts, the count
  does not. The readout then means "S's you have found", which is a better line
  than "S's currently inverted".
- **`nuanse` still latches.** The keyword adds a body-level `.allturn` that
  overrides hover with `!important`, as in the reference. That one should stick.

If the answer is "drop the collectible", delete `bump()`, `.turned-n`, the
tied `toast()` calls and the keyword buffer, and this correction is just the
CSS swap.

---

## 4. The menu: complete on the first slide, half once you scroll

### What the current build does

`reference/index-current.html` lines 133-157 and 650-665. The nav is a fixed full-width
header: brand mark, four links, a CTA. On scroll it gains `.scrolled`, which
only fades in a background gradient (line 135). It never changes shape.

### The reading this kit specs

**Confirm before building — open question 1 in the overview.**

- **Expanded, on the hero only.** The nav as it is now: mark, "Work / Services
  / Process / Team", "Free audit", full width, transparent over the hero.
- **Compact, everywhere else.** Collapses rightward into a pill — mark plus a
  menu affordance, or mark plus CTA. Backed, blurred, shadowed.
  `reference/nuanse-house.html` line 43 is the pill to match:
  `rgba(13,26,65,.92)`, `backdrop-filter: blur(10px)`, `border-radius: 100px`,
  `padding: 5px`, `box-shadow: 0 10px 30px -12px rgba(8,17,46,.5)`.
- **Scrolling back to the hero expands it again.** Symmetric, same duration.

### Notes for the build

- Drive it from a `ScrollTrigger` on the hero section, not a pixel threshold,
  so it stays correct if the hero's height changes. One already exists at line
  1727 toggling `.scrolled` at `start: 20` — replace it, do not stack a second.
- Animate with Flip (already loaded, line 1065). Links leaving and the pill
  closing around the mark is exactly what Flip is for; width and padding
  transitions alone will look cheap.
- One transition per direction at the medium speed — ~0.6s on
  `cubic-bezier(.7,0,.2,1)`, per `brief/05-conventions.md`.
- Hysteresis: expand and collapse at different scroll points, or a nav parked
  at the boundary flickers on every small scroll.
- The collapsed pill must still reach every destination. A menu button opening
  a full overlay is simplest; the current build's `#menu` (lines 1437-1446) is
  a good model - it already handles focus trapping and scroll locking.
- Keyboard: links must not become unreachable when collapsed. Either the
  overlay owns them, or focus landing inside the nav forces the expanded state.
- Under `prefers-reduced-motion`, set the states, do not tween them.
- The nav also flips light/dark per section (`setNav()`, line 1404, from
  `data-nav` on each section). Both nav states need both themes — check the
  compact pill on a light section; the reference pill is navy and assumes dark.

### On the project pages

Project pages have no hero slide in the home-page sense. Decide once: either
they open expanded over their own first frame and collapse the same way, or
they start compact. This kit assumes the former, for consistency.
