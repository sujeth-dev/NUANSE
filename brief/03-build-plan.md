# Build plan — plan, setup, develop, test, deploy

## Phase 0 — Decide (before any code)

Four questions in `brief/00-overview.md` must be answered: the nav's two
states, the final project list and naming permissions, the fate of the S
counter, and the domain. Each changes what gets built.

Two more decisions belong here:

**Architecture.** The site is one 136 KB HTML file. That works for one page and
fails for eight — the nav, cursor and footer would be copy-pasted eight times.
Recommendation below. Confirm it before Phase 2.

**Image pipeline.** The originals are 1.6 GB of 15-23 MB PNGs. Nothing like
that ships. `tools/curate-assets.py` already produced the web set in `assets/`;
the production pipeline needs to go further — see Phase 2.

---

## Phase 1 — The four corrections

On the existing single file, no restructuring. `brief/01-requirements.md` has
the detail.

1. Real mark in place of the typographic S — nav, footer 3D S, marquee
   separator, favicon, loader, curtain, OG. Leave the in-word `.s` spans alone.
2. Cursor rest state.
3. S inversion reverts on un-hover.
4. Nav expanded on hero, compact after.

Ship and review this before Phase 2. It is self-contained and it is what makes
the current page feel finished.

---

## Phase 2 — Setup and the shared chassis

### The split

Move from one file to shared static files. No bundler, no framework, no build
step for the HTML — this keeps the Vercel config, the README's promise and the
"open it in a browser and it runs" property.

```
site/
  index.html              home
  work/index.html         work index
  work/<slug>.html        project pages
  assets/css/core.css     tokens, type, nav, cursor, footer, motion
  assets/css/work.css     project-page shared layer
  assets/js/core.js       loader, nav, cursor, scroll, S behaviour, a11y
  assets/js/work/<slug>.js  one signature element each
  assets/brand/           NUANSE marks (in this kit)
  assets/work/<slug>/     per-project imagery
```

Each page: `core.css` + `work.css`, `core.js` + one signature script. Shared
behaviour is written once.

### The CSP win

`vercel.json` currently needs `script-src 'unsafe-inline'` and `style-src
'unsafe-inline'` because the reference build is all inline. With CSS and JS as
external files, **drop both** `'unsafe-inline'` values. That is a real security
improvement that falls out of the refactor for free — do not forget to take it.

Self-hosting the three Google Fonts (Gloock, Hanken Grotesk, IBM Plex Mono —
all SIL Open Font License, so self-hosting is permitted) lets you also drop
`fonts.googleapis.com` and `fonts.gstatic.com` from the CSP, removes two
third-party connections from the critical path, and kills the FOUT. Worth
doing in this phase.

### Image pipeline

For every project image, generate at build time and commit:

- AVIF and WebP, with JPEG fallback
- widths 480 / 960 / 1440 / 1920, served via `srcset` + `sizes`
- an inline LQIP or a dominant-colour background so nothing reflows
- explicit `width`/`height` on every `<img>` — CLS is the easiest Lighthouse
  point to lose and the easiest to keep
- `loading="lazy"` and `decoding="async"` on everything below the fold;
  `fetchpriority="high"` on the one opening image per page

`vercel.json` already sets `immutable` year-long caching for `/images/(.*)` and
for image extensions. Extend the first rule to `/assets/(.*)` and hash the
filenames, or the cache header will serve stale images after an update.

Budget: **no project page over 1.5 MB on first load**, opening image included.
The current curated set is 1600-1800px JPEG at q82; most pages will need two or
three of those, not thirty.

### Chassis acceptance

The chassis is done when one project page — Zingara — renders completely, and
the nav, cursor, footer, type and motion on it are byte-identical in source to
the home page's.

---

## Phase 3 — The project pages

Order, and the reasoning, is in `brief/02-project-pages.md`: Zingara, then the
work index, then The Possah. Each page is: chassis, content, signature element,
then the accessibility and reduced-motion pass for that page specifically —
not deferred to Phase 4.

---

## Phase 4 — Test

### Automated

- **Lighthouse** on every page, mobile and desktop. Targets: performance ≥ 90
  desktop and ≥ 80 mobile, accessibility 100, best practices ≥ 95, SEO 100.
- **axe-core** or `pa11y` on every page. Zero violations, not "zero criticals".
- **HTML validation** — every page through the W3C validator.
- **Link check** — internal links, outbound client URLs (these go dead; Aware
  Acoustics is already "under construction"), `sitemap.xml` entries.
- **CSP** — load every page with the console open. Zero violations. Confirm
  `'unsafe-inline'` is actually gone and nothing silently broke.

### Manual, per page

- **Keyboard only.** Tab through end to end. Every interactive element
  reachable and visibly focused; the nav reachable when collapsed; the case
  overlay and audit modal trap focus and restore it on close; `Esc` closes.
- **Screen reader.** NVDA on Windows or VoiceOver on macOS. Headings in order,
  images captioned or explicitly decorative, the signature elements either
  described or hidden from the tree.
- **`prefers-reduced-motion: reduce`.** Every page. Nothing animates, nothing
  is pinned, no content is unreachable because its reveal never fired. This is
  the failure mode that ships most often — a scroll-triggered reveal whose
  reduced-motion path forgets to set the final state, leaving the content at
  `opacity: 0` forever.
- **Touch.** Real device, not a simulator. Smooth scroll, WebGL grounds, the
  lens and the annotation trail are all off on touch by design — confirm each
  page honours that and that nothing depends on hover to be usable.
- **Browsers.** Chrome, Safari, Firefox, Edge; iOS Safari and Chrome Android.
  Safari is where `backdrop-filter`, `clip-path` and WebGL context limits
  break first.
- **Slow network.** Throttle to Fast 3G. Confirm the loader behaves, images
  arrive progressively and nothing is blank for more than a moment.
- **No-JS.** Disable JavaScript. Per `reference/index-current-NOTES.md` the
  page must still render and the loading curtain must lift. The reference
  build does this by exiting the script early if GSAP fails. Preserve it -
  it is the single easiest thing to lose in a rebuild.

### Content check

Every number traced to a source. Every `[[NEEDS: ...]]` placeholder resolved or
consciously held. Every named client cleared to be named.

---

## Phase 5 — Deploy

1. **Domain first.** Search and replace `nuanse-draft.vercel.app` in
   `canonical`, `og:url`, `robots.txt` and `sitemap.xml`. Attach the domain in
   Vercel and confirm HTTPS and the apex/www redirect.
2. **`sitemap.xml`** — all pages, real `lastmod` dates.
3. **`robots.txt`** — confirm it points at the live sitemap.
4. **OG images** — `og-default.png` ships in this kit; each project page wants
   its own 1200x630. Uncomment the `og:image` and `twitter:image` lines in the
   `<head>` (they are commented out pending a real PNG). Validate with
   Facebook's Sharing Debugger and X's Card Validator.
5. **Favicons** — `favicon-32/180/512.png` ship in this kit. Add a
   `site.webmanifest` and the `apple-touch-icon` link.
6. **Preview deploy, then production.** `npx vercel` then `npx vercel --prod`.
   Re-run Lighthouse against the preview URL, not localhost — CDN compression
   and real latency change the numbers.
7. **Analytics.** Decide before launch, not after. Whatever is chosen must be
   added to `connect-src` in the CSP or it will be silently blocked. A
   cookieless option avoids a consent banner.
8. **Post-deploy smoke test.** Every route loads, no 404s, OG preview renders
   in a real Slack or WhatsApp message, console clean on production.

### Rollback

Vercel keeps every deployment. If production breaks, promote the previous
deployment from the dashboard rather than reverting commits under pressure.
