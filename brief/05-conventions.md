# Conventions

These are the rules the existing code already holds itself to. They are the
reason the page feels composed rather than busy. Everything new follows them.

Most of this is distilled from `reference/index-current-NOTES.md` and from reading
`reference/index-current.html`; where the two disagree, the code wins.

---

## Motion

**One moving thing per screen.** A `MOTION` registry tracks which pins are
active. Ambient motion — the marquee, the footer S, the WebGL foil grounds —
sleeps when its section is off-screen or while a pinned section owns the
stage. A new animation registers with `MOTION` or it will fight something.

**Three speeds, one curve.**

| | Duration | For |
|---|---|---|
| Big | ~1.1s | Section transitions, the hero-to-nav flight, pinned sequences |
| Medium | ~0.6s | Nav state change, card flips, panel docking |
| Small | 0.4-0.7s | Hovers, reveals, the cursor, the S turn |

Easing is `cubic-bezier(.7,0,.2,1)` throughout, exposed as `--ease`. A
different curve needs a reason that can be stated in a sentence.

**Quiet by default.** Most motion is on intent — hover, drag, click, scroll.
Nothing loops for attention. Keep it that way.

---

## Spacing and layout

Spacing comes from tokens, never from literals: `--s1`…`--s6`, `--gap-sm/md/lg`,
`--sec-y`. `--gut` doubles as the container — it is the larger of the gutter
and the margin needed to centre `--maxw` (1320px).

A hardcoded `margin: 42px` is a bug, even when it looks right.

---

## Colour

Tokens at `reference/index-current.html` line 49:

```
--cream:#FCF7F1  --navy:#0D1A41  --night:#08112E
--copper:#B56528  --copper-l:#D58A4E
--ox:#8A2B1D  --blush:#E8CFC4  --olive:#3F4A2E  --royal:#16245A
```

Navy, copper and cream are sampled pixel-exact from the logo master. Do not
adjust them.

**Copper is roughly 3% of any page.** It marks the one thing that matters on a
screen. A page with copper in four places has nothing accented.

On project pages the client's accent follows the same discipline — opening
frame, signature element, next-project link, nowhere else. See
`brief/02-project-pages.md`.

---

## Typography

Gloock (display), Hanken Grotesk (body), IBM Plex Mono (labels, metadata,
small caps). Three faces, no more — including on project pages. A client's
typeface appears inside the work shown, never as the page's own voice.

---

## Accessibility — not a final pass

**`prefers-reduced-motion` is a real path, not a disabled one.** It sets `.rm`
on `<html>` and every animation branches on it. The common failure: a
scroll-triggered reveal whose reduced-motion branch forgets to set the final
state, leaving content at `opacity: 0` forever. Check every reveal in both
modes before calling it done.

**No-JS renders.** If GSAP fails to load the script exits early and removes the
loading curtain, so the page still reads. Preserve this on new pages.

**Keyboard reaches everything.** Every interactive element focusable and
visibly focused. Overlays and modals trap focus and restore it on close. `Esc`
closes. The nav's links must stay reachable when the nav is collapsed.

**Touch is not small desktop.** Smooth scroll, the WebGL grounds, the lens and
the annotation trail are all off on touch. Nothing may depend on hover to be
usable, and the S turn — which is hover-driven after correction 3 — needs a
touch story or an accepted absence.

---

## JavaScript style

The existing file is ES5-flavoured: `var`, `function`, no modules, no build
step. It is consistent, and consistency is worth more here than modernity.

When the code splits into `assets/js/` (Phase 2), modern syntax is fine —
`const`, arrow functions, `type="module"` — but decide once and apply it to
every file rather than mixing idioms within a file.

Helpers already in use: `$()` and `$$()` for queries, `MOTION` for the pin
registry, `RM` and `TOUCH` as capability flags. Reuse them.

---

## Dependencies

CDN at runtime, nothing installed:

- GSAP 3.13 — core, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, CustomEase
- Lenis 1.3.4 — smooth scroll, desktop only
- Google Fonts — Gloock, Hanken Grotesk, IBM Plex Mono

Adding a dependency means adding a host to the CSP in `vercel.json`. Prefer
using what is already loaded — Flip and DrawSVG in particular are both loaded
and barely used.

---

## Performance

- No project page over 1.5 MB on first load.
- Every `<img>` has explicit `width` and `height`. CLS is the cheapest
  Lighthouse point to keep and the easiest to lose.
- Below-the-fold images are `loading="lazy" decoding="async"`; the one opening
  image per page gets `fetchpriority="high"`.
- Images ship as AVIF and WebP with a JPEG fallback, at 480/960/1440/1920.

---

## Content

**Never invent a figure.** Every number on the site traces to the client or to
NUANSE's records. Missing figures become visible `[[NEEDS: ...]]` placeholders,
never plausible-looking estimates.

**Prefer the copy that exists.** The case array at `reference/index-current.html` lines
1864-1880 and the client identity boards together hold more good, specific
copy than needs writing.
