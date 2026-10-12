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
# AVIF first, WebP second, JPEG last: the browser takes the first it can read.
FORMATS = [
    ('avif', 'AVIF', {'quality': 52}),
    ('webp', 'WEBP', {'quality': 78, 'method': 6}),
    ('jpg',  'JPEG', {'quality': 82, 'optimize': True, 'progressive': True}),
]

# slug -> list of (output name, source path relative to assets/, alt text)
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

    for name, rel, alt in items:
        path = os.path.join(SRC, rel)
        if not os.path.exists(path):
            print(f'  MISSING  {rel}', file=sys.stderr)
            continue
        im = Image.open(path)
        im = im.convert('RGB')
        sw, sh = im.size
        ground = dominant(im)
        widths = [w for w in WIDTHS if w <= sw] or [sw]
        if sw not in widths and sw < max(WIDTHS):
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
                          'src': rel, 'alt': alt}
        css.append(f'.ph-{name}{{background:{ground}}}')

        def srcset(ext):
            return ', '.join(f'../assets/work/{slug}/{f} {w}w' for w, f in sorted(made[ext]))
        fallback = sorted(made['jpg'])[-1][1]
        markup.append(
            f'<figure class="ev">\n'
            f'  <div class="ev-frame ph-{name}">\n'
            f'    <picture>\n'
            f'      <source type="image/avif" srcset="{srcset("avif")}" sizes="(max-width:900px) 92vw, 60vw">\n'
            f'      <source type="image/webp" srcset="{srcset("webp")}" sizes="(max-width:900px) 92vw, 60vw">\n'
            f'      <img src="../assets/work/{slug}/{fallback}" width="{widths[-1]}" height="{ratio_h}"\n'
            f'           loading="lazy" decoding="async" alt="{alt}">\n'
            f'    </picture>\n'
            f'  </div>\n'
            f'  <figcaption class="mono">CAPTION</figcaption>\n'
            f'</figure>'
        )
        print(f'  {name:18} {sw}x{sh}  {ground}  widths={widths}')

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
