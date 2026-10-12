"""Responsive image pipeline for project pages.

    python tools/build-page-images.py zingara

For every source listed in PAGES it writes AVIF, WebP and JPEG at each width
the source can actually support, plus:

  - a content hash in every filename, so vercel.json's immutable year-long
    cache rule on image extensions is safe across regenerations
  - `_placeholders.css`, giving each figure its dominant colour as a class.
    A dominant-colour ground stops the page reflowing while an image loads,
    and it has to be a CLASS rather than a style attribute because the CSP
    drops 'unsafe-inline' from style-src
  - `_manifest.json`, recording real pixel dimensions
  - ready-to-paste <picture> markup on stdout, because the HTML is written by
    hand and there is no build step for it

Nothing here runs at request time. Run it once when the image set changes,
commit the output, paste the markup.
"""
import sys, os, io, json, hashlib
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets')
OUT = os.path.join(ROOT, 'site', 'assets', 'work')

WIDTHS = [480, 960, 1440, 1920]

# Per-slug cap. A square guideline board shown at 60vw inside a 1320px
# container is about 790 CSS pixels; at device-pixel-ratio 2 that is 1580, so
# an 1800-wide derivative is weight nobody can see — about 79 KB against 57 KB
# in AVIF, on every board on the page.
WIDTHS_BY_SLUG = {
    'zingara': [480, 960, 1440],
    'possah': [480, 960, 1440],
}

# A figure in a three-up grid renders at roughly 30vw, not 60vw. Left on the
# wide string it would fetch a 1440 where a 480 would do, three times over —
# the single easiest way to blow the page budget.
SIZES = {
    'ev': '(max-width:900px) 92vw, 60vw',
    'grid': '(max-width:900px) 92vw, 30vw',
    'half': '(max-width:900px) 92vw, 46vw',
}
# AVIF first, WebP second, JPEG last: the browser takes the first it can read.
FORMATS = [
    ('avif', 'AVIF', {'quality': 52}),
    ('webp', 'WEBP', {'quality': 78, 'method': 6}),
    ('jpg',  'JPEG', {'quality': 82, 'optimize': True, 'progressive': True}),
]

# slug -> list of (output name, source path relative to assets/, alt text)
# with an optional fourth element naming the layout the figure sits in, which
# only decides its `sizes` string and the class on the emitted <figure>.
PAGES = {
    'zingara': [
        ('logo-system',
         'zingara/identity/in-a-graphic-design-presentation-style-this.jpg',
         'Zingara logo system: the wordmark, a stacked lockup with a spice '
         'ornament, and the mark reversed out of true red, shown beside the '
         'palette and type hierarchy.'),
        ('typography',
         'zingara/identity/this-is-a-typography-guide-showcasing-a-primary.jpg',
         'The Zingara type specimen. A display serif and a sans in three '
         'weights, a four-level hierarchy, and a wordmark letterspacing study '
         'comparing tight against wide tracking at +200 optical spacing.'),
        ('palette',
         'zingara/identity/this-image-showcases-a-brands-color-palette-and.jpg',
         'The Zingara colour system: true red, charcoal, cream and burnished '
         'gold with their tints and shades, a 60/20/10/10 usage ratio, and a '
         'grid of approved and rejected colour pairings.'),
        ('patterns',
         'zingara/identity/a-pattern-and-texture-library-displays-eight.jpg',
         'Eight-pattern texture library: Spice Geometry, Steam Abstraction, '
         'Rice Grain Field, Karnataka Line Weave, Handi Silhouette, Arabesque '
         'Spice, Saffron Scatter and Nineteen Cipher.'),
        ('ammas-breakfast',
         'client-logos/ammas-breakfast.jpg',
         "Amma's Breakfast by Zingara: the sub-brand logo, set in a warm "
         'script quite unlike the Zingara wordmark.'),

        # --- the identity, beyond the menu ---
        ('logo-rules',
         'zingara/identity/this-image-displays-various-iterations-and-usage.jpg',
         'The expanded Zingara logo system: primary wordmark, a secondary '
         'lockup carrying "Not Your Usual Biryani", and a Z monogram with a '
         'star-anise flourish; eight colour versions; clear space set to the '
         'height of the Z; minimum sizes of 50, 30 and 15 millimetres; and '
         'three do-nots — do not stretch, do not recolour, do not rotate.',
         'grid'),
        ('specimen',
         'zingara/identity/1-4.jpg',
         'The Zingara type specimen. Cormorant Garamond in light, regular, '
         'semibold and bold as the primary face; DM Sans in regular, medium '
         'and bold as the secondary; and a wordmark letterspacing study '
         'setting the chosen +200 optical tracking against tight and wide '
         'alternatives.',
         'grid'),
        ('icons',
         'zingara/identity/in-a-minimalist-graphic-design-style-a.jpg',
         'Twelve line icons in two colourways — mortar and pestle, steam, '
         'cardamom, handi, fire, star anise, nutmeg, cinnamon, the numeral '
         '19, a covered dish, cutlery, and a Zingara Mysore roundel — with '
         'rule dividers and corner ornaments.',
         'grid'),

        # --- it travels ---
        ('collateral',
         'zingara/identity/in-a-sophisticated-branding-style-this-scene.jpg',
         'Menu and print collateral: a hardback menu book open on a spread, '
         'business cards in charcoal and true red, letterhead with a '
         'wax-sealed envelope, a compliments voucher, a numbered table tent '
         'and a leather menu folder.'),
        ('packaging',
         'zingara/identity/in-a-dark-luxurious-packaging-design-style-a.jpg',
         'The packaging system: a charcoal presentation box with a gold seal, '
         'a patterned carrier bag, a delivery container with a red wax-seal '
         'label reading Mysore White Biryani, and spice jars — shown beside '
         'the four palette chips they are built from.'),
        ('signage',
         'zingara/identity/a-restaurant-exterior-at-night-is-presented.jpg',
         'Exterior and signage at night: an illuminated facade sign, frosted '
         'window etching, an A-frame sidewalk board reading "Not your usual '
         'biryani", and an awning over the street frontage.',
         'half'),
        ('interior',
         'zingara/identity/in-a-modern-restaurant-interior-the-dining-room.jpg',
         'The interior: a dining room under pendant lights, a branded feature '
         'wall reading Zingara, Mysore White Biryani, 19 Spice Blend, a table '
         'setting with a numbered marker and a menu card, and the counter and '
         'takeaway area.',
         'half'),
        ('delivery',
         'zingara/identity/in-a-realistic-cinematic-style-this-image.jpg',
         'Delivery and outdoor presence: a rider with an insulated Zingara '
         'bag, a bus-shelter advertisement, a food-festival pop-up stall, and '
         'a branded scooter wrap.'),

        # --- on a screen ---
        ('web-ui',
         'zingara/identity/in-a-dark-luxurious-ui-design-style-this.jpg',
         'Website and app interface: a desktop homepage with the wordmark '
         'over a biryani photograph, a mobile hero and order app, an online '
         'menu page laid out in three columns, and an order-confirmation '
         'screen reading "Your Zingara is on the way."'),
        ('social',
         'zingara/identity/in-a-photographic-style-this-media-presents-a.jpg',
         'Social identity: a nine-post Instagram grid alternating food '
         'photography with typographic panels reading "Not your usual '
         'biryani" and "19 spices. Built, not coated.", two Stories frames, '
         'and the Z brand avatar on true red.',
         'half'),
    ],
}


def dominant(im):
    """Average colour of a heavily downsampled copy — good enough for a
    ground the image lands on top of, and far cheaper than a histogram."""
    small = im.convert('RGB').resize((16, 16), Image.LANCZOS)
    raw = small.tobytes()
    n = len(raw) // 3
    r = sum(raw[0::3]) // n
    g = sum(raw[1::3]) // n
    b = sum(raw[2::3]) // n
    return '#%02X%02X%02X' % (r, g, b)


def build(slug):
    items = PAGES[slug]
    outdir = os.path.join(OUT, slug)
    os.makedirs(outdir, exist_ok=True)
    manifest, css, markup = {}, [], []
    total = 0

    wanted = WIDTHS_BY_SLUG.get(slug, WIDTHS)

    for item in items:
        name, rel, alt = item[0], item[1], item[2]
        kind = item[3] if len(item) > 3 else 'ev'
        path = os.path.join(SRC, rel)
        if not os.path.exists(path):
            print(f'  MISSING  {rel}', file=sys.stderr)
            continue
        im = Image.open(path)
        im = im.convert('RGB')
        sw, sh = im.size
        ground = dominant(im)
        widths = [w for w in wanted if w <= sw] or [sw]
        if sw not in widths and sw < max(wanted):
            widths.append(sw)
        widths = sorted(set(widths))

        made = {}
        for w in widths:
            h = round(sh * w / sw)
            resized = im.resize((w, h), Image.LANCZOS)
            for ext, fmt, kw in FORMATS:
                # Encode in memory so the hash can go into the filename on the
                # first write. Writing a temp file first and renaming it tripped
                # over the stale-file sweep below, which matched the temp too.
                buf = io.BytesIO()
                resized.save(buf, fmt, **kw)
                blob = buf.getvalue()
                digest = hashlib.sha256(blob).hexdigest()[:8]
                fname = f'{name}-{w}.{digest}.{ext}'
                with open(os.path.join(outdir, fname), 'wb') as fh:
                    fh.write(blob)
                # drop any earlier hash of this same width and format
                for old in os.listdir(outdir):
                    if old.startswith(f'{name}-{w}.') and old.endswith(f'.{ext}') \
                       and old != fname:
                        os.remove(os.path.join(outdir, old))
                made.setdefault(ext, []).append((w, fname))
                total += len(blob)

        ratio_h = round(sh * widths[-1] / sw)
        manifest[name] = {'w': widths[-1], 'h': ratio_h, 'ground': ground,
                          'src': rel, 'alt': alt, 'kind': kind}
        css.append(f'.ph-{name}{{background:{ground}}}')

        sizes = SIZES.get(kind, SIZES['ev'])
        fig = 'ev' if kind == 'ev' else 'gv'

        def srcset(ext):
            return ', '.join(f'../assets/work/{slug}/{f} {w}w' for w, f in sorted(made[ext]))
        fallback = sorted(made['jpg'])[-1][1]
        markup.append(
            f'<figure class="{fig}">\n'
            f'  <div class="ev-frame ph-{name}">\n'
            f'    <picture>\n'
            f'      <source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">\n'
            f'      <source type="image/webp" srcset="{srcset("webp")}" sizes="{sizes}">\n'
            f'      <img src="../assets/work/{slug}/{fallback}" width="{widths[-1]}" height="{ratio_h}"\n'
            f'           loading="lazy" decoding="async" alt="{alt}">\n'
            f'    </picture>\n'
            f'  </div>\n'
            f'  <figcaption class="mono">CAPTION</figcaption>\n'
            f'</figure>'
        )
        print(f'  {name:18} {sw}x{sh}  {ground}  widths={widths}  {kind}')

    with open(os.path.join(outdir, '_manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    with open(os.path.join(outdir, '_placeholders.css'), 'w', encoding='utf-8') as f:
        f.write('/* Dominant-colour grounds, generated by '
                'tools/build-page-images.py. Classes, not style attributes:\n'
                '   the CSP drops \'unsafe-inline\' from style-src. */\n')
        f.write('\n'.join(css) + '\n')
    with open(os.path.join(outdir, '_markup.html'), 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(markup) + '\n')

    print(f'\n  {len(manifest)} images, {total/1024/1024:.2f} MB on disk '
          f'(all formats, all widths)')
    print(f'  markup -> {os.path.join(outdir, "_markup.html")}')


if __name__ == '__main__':
    slug = sys.argv[1] if len(sys.argv) > 1 else 'zingara'
    if slug not in PAGES:
        sys.exit(f'unknown page: {slug}. known: {", ".join(PAGES)}')
    print(f'building {slug}')
    build(slug)
