# NUANSE brand assets

Generated from the masters in `assets/` (`logo main - png.png`, `nuanse logo only - inverted s - png.png`) by
`python tools/build-brand-assets.py assets site/assets/brand`. Re-run that script rather than editing these by
hand.

## Colours — sampled from the logo, exact

| | Hex | Token in `index.html` line 49 |
|---|---|---|
| Wordmark letters | `#0D1A41` | `--navy` |
| The reversed S | `#B56528` | `--copper` |
| Monogram ground | `#FCF7F1` | `--cream` |

The site's tokens already match the logo pixel for pixel. Do not adjust them.

## Files

### Wordmark — `NUANSE` with the reversed copper S

| File | Size | Use |
|---|---|---|
| `wordmark-navy-1600.png` | 1600x307 | Light grounds, hero scale |
| `wordmark-navy-800.png` | 800x154 | Light grounds, normal |
| `wordmark-navy-400.png` | 400x77 | Light grounds, small |
| `wordmark-cream-*.png` | same three | Dark grounds |

The cream variant recolours only the navy letters. The copper S is identical
in both, which is correct — it is the one constant in the mark.

### Monogram — the reversed S alone

`monogram-{copper,cream,navy}-{1024,512,256,128}.png`, 1024x1476 down to
128x185, transparent.

- **copper** on light grounds
- **cream** on dark grounds
- **navy** where copper would be too loud

Pick by slot: the 34px nav mark takes the 128, the footer 3D S at up to 220px
takes the 512.

### Icons and social

| File | Size | Use |
|---|---|---|
| `favicon-512.png` | 512x512 | PWA / manifest |
| `favicon-180.png` | 180x180 | `apple-touch-icon` |
| `favicon-32.png` | 32x32 | Browser tab |
| `og-default.png` | 1200x630 | Default social card |

Favicons are the copper monogram on navy with 1.45x padding. The OG card is
the cream wordmark centred on navy. Project pages should each get their own
1200x630 card.

## Notes

**No SVG.** The masters are raster. The wordmark source is 6496x4606 and flat
two-colour, so these PNGs are sharp at every size the site uses — but a traced
SVG would be ~4 KB instead of 25-160 KB and would stay crisp under the footer
S's perspective transform. Worth doing if the designer's vector original turns
up. See `brief/04-asset-inventory.md`.

**The monogram's transparency is derived.** The master was a JPEG with the
cream ground baked in. Alpha was computed from each pixel's distance from cream
toward copper, which preserves the anti-aliased edge instead of producing a
hard cutout. Verified against navy — no cream fringe. If you need to redo it,
use the script; keying this by hand in an image editor will leave a halo.
