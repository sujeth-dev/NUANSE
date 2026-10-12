# NUANSE

The website for NUANSE, a Bangalore brand studio, plus the briefs and source
material it is built from.

Static site, no framework, no bundler, no build step. Open `site/index.html`
in a browser and it runs.

---

## Layout

```
site/                  the deployable site — Vercel's root directory
  index.html           home
  work/                project pages (Phase 2+)
  assets/
    css/core.css       the shared chassis: tokens, type, nav, cursor, footer
    css/home.css       the home page's eleven sections
    js/boot.js         capability flags, before first paint
    js/core.js         shared behaviour
    js/home.js         the home page's sections
    js/work/           one signature script per project page
    fonts/             self-hosted Gloock, Hanken Grotesk, IBM Plex Mono
    brand/             the NUANSE marks
    work/              per-project imagery
  vercel.json          CSP, caching, clean URLs
  robots.txt  sitemap.xml  site.webmanifest

brief/                 what to build and why — read 00 first
  PROMPT.md            the kickoff prompt
  00-overview.md       where things stand, open questions
  01-requirements.md   four things the rebuild must get right
  02-project-pages.md  the project pages
  03-build-plan.md     plan, setup, develop, test, deploy
  04-asset-inventory.md  what exists, what is missing
  05-conventions.md    motion, spacing, colour, accessibility rules

reference/             two earlier builds. Reference only — neither is edited
assets/                client imagery, web-sized. Source material, not shipped
tools/                 Python scripts that regenerate both asset sets
ASSET-INDEX.md         every delivered asset, mapped to its original path
```

Two different things are called `assets`. `site/assets/` is what ships — the
stylesheets, scripts, fonts and marks. The top-level `assets/` is the client
imagery pool the project pages draw from, and most of it is never meant to
ship. Worth renaming one day; the briefs reference the current names
throughout, so it has not been done yet.

---

## Running it

```
# open it directly
start site/index.html

# or serve it, so the paths behave exactly as they will in production
npx serve site
```

## Deploying

Vercel, as a static site. No build command, no framework preset. **Set the
project's Root Directory to `site`** — `vercel.json` lives there.

```
npx vercel          # preview
npx vercel --prod   # production
```

---

## What is built

The home page and the shared chassis every other page will run on. Verified in
headless Chrome against the production CSP across desktop, reduced motion,
touch, a GSAP-less fallback and `file://`: no exceptions, no console errors, no
CSP violations, no broken images, and zero axe-core violations.

Four things the rebuild had to get right, all in:

1. **The real mark**, everywhere the logo appears — nav, loader, marquee,
   favicon, OG card, and the footer's 3D mark, built from eighteen stacked
   copies of the real asset drawn from two files. The letter `s` inside a word
   stays live text; the mark is always the asset.
2. **A cursor with a rest state** — a copper ring that always follows,
   swelling to a labelled disc over a target.
3. **The S inversion reverts** when you stop hovering. Pure CSS, no state. The
   per-visit counter survives, decoupled from the visual.
4. **The nav is complete on the first slide and half once you scroll** — a
   backed, blurred pill with a sliding indicator, collapsing with hysteresis
   so it cannot flicker at the boundary.

### Notes worth keeping

**The CSP drops `'unsafe-inline'`.** Both directives. That required moving
every `style` attribute out of the markup and into classes, and moving the
capability-detection script into `assets/js/boot.js`. One narrow exception
remains: `'unsafe-hashes'` with a single sha256 that pins exactly
`position:static;transform:translate3d(0,0,1px)` — a `style` attribute GSAP's
Flip plugin sets once on a throwaway div to feature-detect a Safari
`offsetParent` bug. Blocked, that detection silently returns the wrong answer
in every browser. **If GSAP is upgraded, re-check that hash.**

**Fonts are self-hosted**, which drops `fonts.googleapis.com` and
`fonts.gstatic.com` from the CSP and kills the FOUT. Hanken Grotesk is a
single variable file serving 400–600, declared once rather than three times.

**`--copper-ink`** exists because the brand copper is 3.24:1 on stone and
4.06:1 on cream — both short of WCAG AA for text under 24px. It is used only
where copper carries small text. `--copper` itself is untouched and is still
the only copper on the mark, the rules, the fills and every large accent.

**No-JS and no-GSAP both render.** If GSAP fails to load, the script lifts the
curtain, wires the menu by hand and exits. The team portraits and proof images
are built above that guard, so they appear either way.

---

## Still open

- Naming permission per client, and confirmation of the case figures carried
  over from the previous build (`+22%` AOV, `−31%` cost per reservation,
  `2.4×` ROAS, `+38%` product page conversion). Unconfirmed figures become
  visible `[[NEEDS: ...]]` placeholders rather than shipping as fact.
- The Zingara "before" in the redline slider is a reconstruction, not a
  photograph of the client's original menu. Fine as rhetoric on the home page;
  it needs labelling before it carries a project page.
- Project pages: Zingara, then the work index, then The Possah.
