# nuanse-draft

Working draft of the NUANSE site — a Bangalore brand studio.

`index.html` is the whole thing: markup, styles and scripts in one file, no
build step. Open it in a browser and it runs.

## Running it

Double-click the file, or serve the folder if you want the fonts and CDN
scripts to load over `http` rather than `file:`:

```
npx serve .
```

## Deploying

Vercel, as a static site. No build command, no output directory, no framework
preset — point it at this repo and it serves `index.html` at `/`.

```
npx vercel          # preview
npx vercel --prod   # production
```

`vercel.json` sets the headers: a content security policy scoped to the three
hosts this page actually uses (jsdelivr for GSAP, googleapis and gstatic for
fonts), `nosniff`, a referrer policy, HSTS, and caching — the HTML revalidates
every request while images and fonts are immutable for a year.

`.vercelignore` keeps `base/` and this README out of the deployment; they stay
in the repo.

Two things to finish when you have them:

- **`og.png`** — a 1200×630 image in the repo root, then uncomment the two
  `og:image` / `twitter:image` lines in the `<head>`. Crawlers will not render
  an SVG, so there is no placeholder.
- **The domain** — `canonical`, `og:url`, `robots.txt` and `sitemap.xml` all
  point at `nuanse-draft.vercel.app`. Search and replace when the real domain
  is attached.

## What's in the file

| | Section | Notes |
|---|---|---|
| 0 | Loader | Cream cover lifts off a copper-foil ground, pre-press crop marks register the page. ~1.2s, once per session. |
| 1 | Hero | Copper foil ground (WebGL), plus a lens that reveals the type specs underneath. |
| 2 | Marquee | Five disciplines, skewing with scroll velocity. |
| 3 | Manifesto | A letter that rises out of an envelope and sharpens as you read it. Pinned. |
| 4 | Work | Three proof prints, redlined, pinned. Opens into a case overlay. |
| 5 | Redline | Before/after slider on the Zingara menu. The "before" fidgets; the "after" never moves. |
| 6 | Services | Five fanned cards that flip. |
| 7 | Process | Four docking panels on a copper rail. |
| 8 | Team | Scatter with parallax, plus a "who's on your brief" builder. |
| 9 | Audit | Eight-question brand audit. Copper annotation trail follows the pointer. |
| 10 | Footer | Revealed under the page. The 3D S is draggable and springs back. |

Hover any **S** in a heading to turn it. Type `nuanse` anywhere to turn them all.

## Dependencies

Loaded from CDN at runtime, nothing installed:

- GSAP 3.13 — core, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, CustomEase
- Lenis 1.3.4 — smooth scroll, desktop only
- Google Fonts — Gloock, Hanken Grotesk, IBM Plex Mono

If GSAP fails to load the page still renders; the script exits early and
removes the loading curtain.

## Conventions worth knowing before you edit

- **One moving thing per screen.** A `MOTION` registry tracks which pins are
  active; ambient motion (marquee, footer S, foil grounds) sleeps when its
  section is off-screen or while a pin owns the stage.
- **Three speeds.** Big moments ~1.1s, medium ~0.6s, hovers and reveals
  0.4–0.7s. One easing curve throughout: `cubic-bezier(.7,0,.2,1)`.
- **Quiet by default.** Most motion is on intent — hover, drag, click. Keep it
  that way.
- **Spacing comes from tokens.** `--s1`…`--s6`, `--gap-sm/md/lg`, `--sec-y`.
  `--gut` doubles as the container: it is the larger of the gutter and the
  margin needed to centre `--maxw` (1320px).
- **Reduced motion and no-JS both have real paths.** `prefers-reduced-motion`
  sets `.rm` on `<html>` and every animation branches on it. Check both before
  shipping a change.
- **Touch is not just small desktop.** Smooth scroll, the WebGL grounds, the
  lens and the annotation trail are all off on touch.

## Work section images

The proof prints are drawn in code. To use real photographs, drop files in an
`images/` folder and point a print at one:

```html
<div class="print" ... data-img="images/proof-01.jpg" data-img-alt="Zingara menu">
```

A print without `data-img` keeps the drawn art, and a broken path falls back to
it too.
