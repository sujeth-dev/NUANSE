# A custom page per project

## The principle

Each project page must read as the same studio and still feel made for the
project it describes. The way to get both is to be strict about which parts are
shared and which are free.

**Shared — identical on every page, no exceptions.** Nav, cursor, footer, type
scale, spacing tokens, motion speeds and easing, the loader, scroll behaviour,
the reduced-motion and keyboard paths. These come from the shared stylesheet
and script. A change here is made once.

**Free — different on every page, deliberately.** The accent palette (taken
from the client's own identity), one signature element, the structure of the
proof section, the imagery, and the texture of the copy.

**The rule that keeps it honest: one signature element per page.** Not two.
Each page earns exactly one thing the others do not have, and it has to be the
thing that project was actually about. A page with three novelties is a
showreel; a page with one is an argument.

---

## What the assets actually support

**The assets are a pool, not a checklist.** The folders in `assets/` are there
to show what the work looks like and to give you material to reach for. Use
only what a page actually needs. A project page carrying four well-chosen
boards is stronger than one carrying thirty-three, and choosing which four is
part of the design work, not a step before it. Nothing in `assets/` has to
appear anywhere.

What the coverage below determines is how much a page *can* say, not how much
it must show.

This matters more than any design intent: two projects have a complete identity
system on file, and the rest have a logo and a live site. Build accordingly
rather than padding thin projects to match deep ones.

### Tier 1 — full case pages. Everything needed is in this kit.

**Zingara** (restaurant, Mysore white biryani) — 21 identity boards in
`assets/zingara/identity/`, 16 food photographs in `assets/zingara/food/`.
The system on file covers logo and Z monogram, Cormorant Garamond typography
with a full specimen, a colour palette, an eight-pattern texture library (Spice
Geometry, Steam Abstraction, Rice Grain Field, Karnataka Line Weave, Hand
Silhouette, Arabesque Spice, Saffron Scatter, Nineteen Cipher), a brand icon
set, menu and print collateral, packaging, merchandise, signage, delivery
livery, and website and app UI. Live site: zingararestaurant.co.in.

Brand lines already written, for use as pull quotes rather than new copy:
"Not Your Usual Biryani" · "19 spices. Built, not coated." · "No colour. Just
flavour." · "Light. Aromatic. Layered." · "The Art of Biryani" · "Smoke. Spice.
Silence. Where Mysore meets the modern table."

There is also a sub-brand on file: **Amma's Breakfast by Zingara**
(`assets/client-logos/`), in a warm script entirely unlike the Zingara mark.
A parent identity that can carry a sub-brand without being diluted is a real
argument, and it is the best thing in this project after the menu itself.

**The Possah** (haute couture) — 33 identity boards in
`assets/possah/identity/`, 33 campaign and studio frames in
`assets/possah/campaign/`. The kit is a full brand guidelines document with its
own contents page, 11 sections: brand story, logo system, colour palette,
typography, moodboard, content direction, social, packaging, web homepage,
stationery, tone of voice.

Documented values, lifted straight from the boards:

| | |
|---|---|
| Primary | Dusty Rose Pink `#C99A99` · Deep Forest Green `#1F3A2D` · Warm Ivory `#F4ECDF` |
| Accent | Burnt Orange `#B35A2B` · Misted Mustard Gold `#C8973A` |
| Colour ratio | 60% ivory / 30% forest green / 10% accent |
| Taglines | "she wants what she wants" (master) · "made to fit you." · "not for trends. for you." · "confidence, tailored." |
| Tone | Direct. Considered. Quietly assertive. |
| Collections | POSSAH [SEASON] [YEAR] · [THEME] — Spring 26 · Veil, Festive 26 · Ember, Resort 27 · Drift |
| Sub-lines | THE ATELIER (couture) · THE EDIT (ready-to-wear) · THE DRAPE (sarees) · THE VAULT (archive) |
| Minimum scale | 60mm print · 35mm packaging · 20mm business card · 24px digital |

Note the parallel worth drawing on the page: Possah's "accent is 10%, never
decorative" is the same discipline as NUANSE's own "copper is 3% of any page".

### Tier 2 — live site and logo only. One screen each, not a full case.

Velmont Design Studio, Assetly, Artizen, NAZR, Noir Velin, Shail Interiors,
Aware Acoustics. URLs in `reference/reference-sites.md`, logos in
`assets/client-logos/` where held.

### Tier 3 — logo only, no site, no case.

Nuozone Studio, Tulipss, Amma's Breakfast (Zingara sub-brand).

### The recommendation

Build **two full project pages** — Zingara and The Possah — and an **index of
work** that carries the rest at the depth their assets support. Seven thin
pages would weaken the two strong ones. When a Tier 2 client supplies material,
it is promoted to a full page using the same chassis.

**Open question 2 in the overview: confirm the final list, and which clients
have agreed to be named.** The current `index.html` names Zingara but
anonymises the other two cases as "D2C fashion" and "A GCC, Bangalore", which
suggests permission is not uniform.

---

## The shared chassis

Every project page runs this spine. Sections 3 and 4 are where the project
asserts itself; everything else is furniture.

1. **Opening frame** — client name, sector, year, one-line verdict. The
   client's accent enters here and nowhere earlier.
2. **The problem** — what was wrong, plainly. Two or three sentences. This is
   the section that has to resist becoming marketing copy.
3. **The signature element** — the one bespoke piece. See below.
4. **The work** — what was made, as evidence rather than a list.
5. **The numbers** — three results, figure and label. If a project has no
   defensible numbers, omit the section rather than pad it. An omitted section
   is more credible than a vague one.
6. **Scope** — deliverables as a plain list. This is where a prospect works out
   whether their own job looks like this one.
7. **Next project** — an edge-to-edge link in the next project's accent, so the
   set reads as a sequence rather than dead ends.

`reference/index-current.html` lines 1864-1880 already hold case copy for three projects —
brief, fixes, results, scope — including real figures. Lift from there; do not
rewrite.

### Typography on project pages

Set every page in the NUANSE faces: Gloock, Hanken Grotesk, IBM Plex Mono. Do
not load Cormorant Garamond for Zingara or the Possah faces for Possah. The
client's typography appears *inside* the work — in a specimen, a board, a
screenshot — not in the page's own voice. The page is NUANSE talking about the
client, not the client talking.

---

## The signature element, per project

### Zingara — the menu, re-set

`reference/index-current.html` lines 821-875 already has the mechanism: a before/after
slider where the "before" fidgets and the "after" never moves. It is the best
interaction on the site and it is currently buried as section 5 of the home
page.

Move it here and give it room. Extend from one spread to a scroll-through of
the real problem — 189 items, four typefaces, prices that wandered. Let the
visitor scrub a column of prices from wandering into one aligned column. The
fidget is the argument: the eye cannot settle on the before and settles
instantly on the after.

Keep a reduced, non-interactive before/after on the home page linking here,
or the home page loses its strongest moment.

Supporting evidence, in order: the typography specimen board, the pattern
library, then packaging and signage. Close on Amma's Breakfast as proof the
system extends.

### The Possah — the 60/30/10 proof

Possah's own guidelines fix the colour ratio at 60% ivory, 30% forest green,
10% accent, and state that the accent "should feel earned, never decorative".
That is a measurable rule, and it can be shown rather than asserted.

Signature: a live ratio meter. As the visitor scrolls the campaign imagery, a
thin bar tracks the actual ivory / green / accent proportion of what is on
screen, and it holds at 60/30/10. The discipline becomes visible instead of
claimed.

Build it with precomputed per-image ratios in a small JSON — sample the images
once at build time, do not run a canvas histogram on every scroll. The campaign
frames in `assets/possah/campaign/` are the source.

If that reads as too clever once built, the fallback is the tone-of-voice
matrix board — the we-write / we-don't-write pair is unusually sharp and makes
its own case. One or the other, not both.

### Tier 2 projects, on the work index

No signature elements. One frame each: logo, live-site screenshot, sector, a
one-line verdict, and an outbound link. Consistency is the point; these exist
to show range and to prove the studio ships.

---

## Content rules

**Never invent a number.** Not a percentage, not a timeline, not a headcount.
Every figure comes from the client or from NUANSE's own records. Where a figure
is needed and missing, render the placeholder `[[NEEDS: average order value,
Zingara, pre/post]]` in the page. It is ugly on purpose — ugly placeholders get
filled, plausible ones ship.

**Use the copy that already exists.** `reference/index-current.html` lines 1864-1880 has
real, specific lines: "+22% average order value", "189 items in four
typefaces", "0 uses of synergies". The identity boards carry the client
taglines verbatim. Between them there is more good copy than needs writing.

**Do not restate a client's guidelines as NUANSE's achievement.** The boards
document what was delivered; the page should show the work and let the system
speak. Quoting Possah's tone-of-voice matrix is fine. Claiming a revenue
outcome the boards do not evidence is not.

---

## Routing and files

Static, no client-side router. `cleanUrls: true` is already set in
`vercel.json`, so `work/zingara.html` serves at `/work/zingara`.

```
site/
  index.html
  work/
    index.html            the work index, carrying Tier 2 and 3
    zingara.html
    the-possah.html
  assets/
    css/core.css          shared chassis
    css/work.css          project-page shared layer
    js/core.js            shared behaviour
    js/work/zingara.js    one signature element
    js/work/possah.js
    brand/                NUANSE marks, already in this kit
    work/zingara/         that project's images
    work/possah/
```

If a signature script starts getting imported by a second page, it has stopped
being a signature — promote it to `work.css` / `core.js` or reconsider the page.

Give each page its own `title`, `description`, `canonical` and OG image, and
add all URLs to `sitemap.xml`.

---

## Build order

1. **The chassis, proved on Zingara.** Its signature already exists and only
   needs moving, so the chassis gets tested against a known quantity.
2. **The work index**, with Tier 2 and 3 at one frame each. Cheap, and it makes
   the site feel complete early.
3. **The Possah.** The ratio meter is the one genuinely new build.
4. **Promote Tier 2 pages** as clients supply material.
