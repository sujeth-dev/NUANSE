# Asset inventory — what exists, what is missing

**Read this as a library, not a manifest.** It records what is available so
you know what you can reach for. Use only what a page needs; most of it will
not ship, and that is the intended outcome.

## Where the masters live

The source folder is `website-n-assets/Website/` in the original project
directory. **It is not in this zip** — 1.6 GB, 161 files, many of them 15-23 MB
PNGs. Keep it; it is the master set and the only copy.

What is in this kit is a de-duplicated, web-sized derivative set: 130 files,
about 27 MB. `ASSET-INDEX.md` maps every delivered file back to its original
path. Regenerate with `tools/curate-assets.py`.

Of the 152 images in the masters, **126 are unique** — the Zingara and Possah
folders each keep a flat copy of every board alongside the foldered copies, so
26 files are exact duplicates. The curation script hashes and drops them.

---

## Have — NUANSE's own brand

| File | Original | Notes |
|---|---|---|
| `logo main-Recovered.png` | 6496x4606 RGBA | **The master.** Flat two-colour wordmark, transparent. Use this one. |
| `logo main.jpg` | 6496x4606 RGB | Same artwork, ground baked in. Use only if you need a flat JPEG. |
| `nuanse logo only -.jpg` | 2000x2000 RGB | The reversed-S monogram, cream ground baked in. |

Sampled values — all three already match `index.html` line 49 exactly:
navy `#0D1A41`, copper `#B56528`, cream `#FCF7F1`. The colour system is
correct and needs no change.

**Derived and shipping in `site/assets/brand/`** — 22 files, see that folder's
`README.md`:

- `wordmark-navy-{1600,800,400}.png`, `wordmark-cream-{...}.png`
- `monogram-{copper,cream,navy}-{1024,512,256,128}.png`
- `favicon-{512,180,32}.png`
- `og-default.png` (1200x630)

The cream wordmark recolours only the navy letters and leaves the copper S
alone. The monogram's alpha was keyed from the JPEG by measuring each pixel's
distance from cream toward copper, giving true anti-aliased edges; checked
against navy for fringing. Regenerate with `tools/build-brand-assets.py`.

## Have — client identity systems

**Zingara** — 21 boards + 16 food photographs. Logo and Z monogram, Cormorant
Garamond specimen, colour palette, eight-pattern texture library, brand icons,
menu and print collateral, packaging, merchandise, signage, delivery livery,
website and app UI. Plus the **Amma's Breakfast by Zingara** sub-brand logo.

**The Possah** — 33 boards + 33 campaign frames. A complete guidelines document
with a contents page and 11 sections, including documented hex values, a
60/30/10 colour ratio rule, a tagline system, a tone-of-voice matrix with
we-write / we-don't-write lists, collection and sub-line naming conventions,
and logo minimum scales. The most complete thing in the set.

**Client logos** — 7, in `assets/client-logos/`. Note two filename traps in the
originals: `signature green bg - 2.jpg` is actually **The Possah's** lockup on
its green ground, and `amas breakfast logo.jpg` is **Amma's Breakfast**, a
Zingara sub-brand. Both are renamed in this kit.

**Social creatives** — 13 assorted post designs, `assets/social/`.

**Reference sites** — 9 live client URLs, `reference/reference-sites.md`.

---

## Missing — ordered by what blocks what

### Blocking launch

1. **The domain.** `canonical`, `og:url`, `robots.txt` and `sitemap.xml` all
   point at `nuanse-draft.vercel.app`. Nothing SEO-related can be finished
   without it, and the OG images bake in a URL.

2. **Naming permission, per client.** The current page names Zingara and
   anonymises two others, which suggests permission is not uniform. Needed
   before any client name or logo is published.

3. **Real case numbers.** `index.html` lines 1864-1880 carries figures — +22%
   average order value, 2.4x ROAS, +38% product page conversion. Confirm each
   is real and attributable before it ships. Anything unconfirmed becomes a
   `[[NEEDS: ...]]` placeholder.

### Blocking a page

4. **Zingara's "before".** The whole case rests on a menu that was 189 items in
   four typefaces. The kit has the *after* in abundance and **no photograph or
   scan of the original menu**. Without it the before/after slider has nothing
   to show on its left side. This is the single highest-value missing item.

5. **Live-site screenshots** for the work index — eight clients, consistent
   crop and device frame. Cheap to produce, nothing else blocked by it.

6. **Possah campaign image ratios.** The 60/30/10 meter needs per-image colour
   proportions precomputed to JSON. Derivable from the shipped frames; just
   not done yet.

### Quality, not blocking

7. **An SVG of the mark.** The masters are raster. A traced SVG would be ~4 KB
   against 25-160 KB and stay crisp under the footer S's perspective
   transform. The source is 6496px and flat two-colour, so the PNGs are sharp
   at every size this site uses — this is a nice-to-have. If the original
   vector exists in a designer's AI or Figma file, export it; otherwise trace
   the 6496px master with potrace (not installed here).

8. **Per-project OG images.** `og-default.png` ships; each project page wants
   its own 1200x630.

9. **`site.webmanifest`** plus the `apple-touch-icon` link. The PNGs exist.

10. **Self-hosted fonts.** Gloock, Hanken Grotesk and IBM Plex Mono are all SIL
    Open Font License, so self-hosting is permitted. Doing it removes two
    hosts from the CSP, drops two third-party connections from the critical
    path and kills the FOUT.

11. **Team photographs.** The team section scatters portraits; the kit has
    none. `assets/social/personal_*.jpg` may be usable — check with the people
    in them first.

12. **A contact endpoint.** The CSP sets `form-action 'none'` and the page uses
    `mailto:` only. If a real form is wanted, it needs an endpoint and a CSP
    change.

13. **Analytics.** Undecided. Whatever is chosen must be added to `connect-src`
    or it will be silently blocked. A cookieless option avoids a consent banner.

---

## A note on the identity boards

The Zingara and Possah boards are presentation renders — brand guideline pages
with mockups, not production artwork. They are excellent as *evidence of the
work* and should be shown as such: as pages of a document, in a frame, at an
angle, as something made. They are not source files. If a page needs the
Zingara wordmark as a standalone asset rather than as part of a board, it has
to come from the designer's working files, which are not in this set.
