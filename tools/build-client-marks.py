"""Client marks for the work-index roster.

    python tools/build-client-marks.py

The roster used to be typographic only, on the grounds that the files in
`assets/client-logos/` were mixed-quality JPG and PNG. They are not: all seven
are 1400px on the long edge, clean, and each already sits on its own ground.
What they are not is square, and a 2:1 lockup dropped into a 44px chip is a
letterboxed smear. So each one is trimmed to its ink and re-squared on the
ground sampled from its own border — nothing about any client's colour is
invented, and nothing is redrawn.

Output mirrors tools/build-page-images.py, deliberately:

  - AVIF, WebP and JPEG at 96 and 192, with a content hash in every filename,
    so vercel.json's immutable year-long cache rule stays safe
  - `_grounds.css`, giving each chip its sampled ground as a CLASS, because
    the CSP drops 'unsafe-inline' from style-src
  - `_manifest.json`, recording the ground and the trim that was applied
  - nothing else. The roster markup used to be written here as
    _markup.html; tools/build-roster.py writes the real cards now,
    straight into the page, from tools/clients.json

The five clients with no file on hand — Assetly, Artizen, NAZR, Noir Velin,
Shail Interiors — are not here and get no generated mark. They carry a set
initial in Gloock on stone instead, which is visibly our setting rather than a
claimed logo. Nothing is downloaded from a client's site and nothing is drawn
from memory.

Nothing here runs at request time. Run it when the logo set changes, commit
the output, paste the markup.
"""
import sys, os, io, json, hashlib
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'client-logos')
OUT = os.path.join(ROOT, 'site', 'assets', 'work', 'clients')

# The roster used these at 44px, where 96 and 192 covered 1x and 2x with one
# to spare. Round 2 (brief/09-feedback-round.md, W1/W5) puts the same marks on
# a card tile at about 120px, so 320 was added for 2x there. Nothing larger:
# these are 1400px lockups trimmed to their ink, and past 320 the source runs
# out before the file does.
WIDTHS = [96, 192, 320]
FORMATS = [
    ('avif', 'AVIF', {'quality': 58}),
    ('webp', 'WEBP', {'quality': 82, 'method': 6}),
    ('jpg',  'JPEG', {'quality': 86, 'optimize': True, 'progressive': True}),
]

# How much ground to leave around the ink once it has been trimmed, as a
# fraction of the square. The marks arrive with wildly different amounts of
# their own padding; trimming and re-padding to one number is what makes the
# row of chips sit on one optical size.
PAD = 0.10

# A pixel counts as ink when it is this far from the ground, summed over RGB.
# 30 keeps JPEG ringing around a black ground out of the bounding box and
# still catches the thin gold rules on the Nuozone and Possah lockups.
INK = 30

# slug -> (file, client name, alt). The alt describes the mark, because that
# is what the chip shows; the client's name is already live text beside it.
CLIENTS = [
    ('zingara', 'zingara-monogram.jpg', 'Zingara',
     'The Zingara mark: a coral Z with a star-anise flourish over the '
     'wordmark, on black.'),
    ('the-possah', 'the-possah-lockup.jpg', 'The Possah',
     'The Possah signature lockup: a gold fluted diamond beside the wordmark '
     'and "haute couture", on forest green.'),
    ('velmont', 'velmont.jpg', 'Velmont Design Studio',
     'The Velmont wordmark, letterspaced in black with the M drawn in red.'),
    ('aware-acoustics', 'aware-acoustics.png', 'Aware Acoustics',
     'The Aware Acoustics mark: a gold and red ribbon beside the name in '
     'navy, on grey.'),
    ('nuozone-studio', 'nuozone-studio.png', 'Nuozone Studio',
     'The Nuozone Studio mark: a gold NZ monogram over the wordmark, on dark '
     'green.'),
    ('tulipss', 'tulipss.png', 'Tulipss',
     'The Tulipss mark: a tulip drawn in blush, lilac and coral over the '
     'wordmark in plum, on blush.'),
    ('ammas-breakfast', 'ammas-breakfast.jpg', "Amma's Breakfast",
     "The Amma's Breakfast mark: a warm brown script over BREAKFAST "
     'letterspaced, a coffee cup, and "by Zingara", on cream.'),
]


def ground(im):
    """The ground is sampled from the border ring, not from the average: these
    are lockups centred on a flat field, so the edge IS the ground, where the
    average is the ground mixed with however much ink the mark happens to
    carry."""
    w, h = im.size
    px = im.load()
    edge = []
    step = max(1, w // 64)
    for x in range(0, w, step):
        edge.append(px[x, 0])
        edge.append(px[x, h - 1])
    step = max(1, h // 64)
    for y in range(0, h, step):
        edge.append(px[0, y])
        edge.append(px[w - 1, y])
    counts = {}
    for c in edge:
        counts[c] = counts.get(c, 0) + 1
    return max(counts.items(), key=lambda kv: kv[1])[0]


def ink_box(im, g):
    """Bounding box of everything that is not the ground."""
    w, h = im.size
    px = im.load()
    mask = Image.new('L', (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if abs(c[0] - g[0]) + abs(c[1] - g[1]) + abs(c[2] - g[2]) > INK:
                mp[x, y] = 255
    return mask.getbbox()


def square(im, g, box):
    """Trim to the ink, then centre it on a square of its own ground."""
    ink = im.crop(box)
    side = round(max(ink.size) / (1 - 2 * PAD))
    out = Image.new('RGB', (side, side), g)
    out.paste(ink, ((side - ink.size[0]) // 2, (side - ink.size[1]) // 2))
    return out


def build():
    os.makedirs(OUT, exist_ok=True)
    manifest, css, markup = {}, [], []
    total = 0

    for slug, fname, name, alt in CLIENTS:
        path = os.path.join(SRC, fname)
        if not os.path.exists(path):
            print('  MISSING  ' + fname, file=sys.stderr)
            continue
        im = Image.open(path).convert('RGB')
        g = ground(im)
        box = ink_box(im, g)
        sq = square(im, g, box)
        hexg = '#%02X%02X%02X' % g

        made = {}
        for w in WIDTHS:
            resized = sq.resize((w, w), Image.LANCZOS)
            for ext, fmt, kw in FORMATS:
                buf = io.BytesIO()
                resized.save(buf, fmt, **kw)
                blob = buf.getvalue()
                digest = hashlib.sha256(blob).hexdigest()[:8]
                out_name = '%s-%d.%s.%s' % (slug, w, digest, ext)
                with open(os.path.join(OUT, out_name), 'wb') as fh:
                    fh.write(blob)
                # drop any earlier hash of this same width and format
                for old in os.listdir(OUT):
                    if old.startswith('%s-%d.' % (slug, w)) \
                       and old.endswith('.' + ext) and old != out_name:
                        os.remove(os.path.join(OUT, old))
                made.setdefault(ext, []).append((w, out_name))
                total += len(blob)

        # `files` is the contract with tools/build-roster.py: these hashes
        # are content-derived, so no other tool can work a filename out on
        # its own, and a roster that guessed one would 404 in silence.
        manifest[slug] = {'name': name, 'src': fname, 'ground': hexg,
                          'source_size': list(im.size), 'ink_box': list(box),
                          'square': sq.size[0], 'alt': alt,
                          'files': {ext: [[w, f] for w, f in sorted(v)]
                                    for ext, v in made.items()}}
        css.append('.clm-%s{background:%s}' % (slug, hexg))

        def srcset(ext, made=made):
            return ', '.join('../assets/work/clients/%s %dw' % (f, w)
                             for w, f in sorted(made[ext]))
        fallback = sorted(made['jpg'])[0][1]
        markup.append(
            '<span class="rs-mark clm-%s" aria-hidden="true">\n' % slug +
            '  <picture>\n' +
            '    <source type="image/avif" srcset="%s" sizes="44px">\n' % srcset('avif') +
            '    <source type="image/webp" srcset="%s" sizes="44px">\n' % srcset('webp') +
            '    <img src="../assets/work/clients/%s" width="96" height="96"\n' % fallback +
            '         loading="lazy" decoding="async" alt="">\n' +
            '  </picture>\n' +
            '</span>')
        print('  %-18s %dx%d -> ink %s -> %dpx square on %s'
              % (slug, im.size[0], im.size[1], box, sq.size[0], hexg))

    # LF, not the platform default: the repo stores LF, and rewriting an
    # unchanged file with CRLF is a diff that says something happened when
    # nothing did.
    with open(os.path.join(OUT, '_manifest.json'), 'w', encoding='utf-8',
              newline='') as f:
        json.dump(manifest, f, indent=2)
    with open(os.path.join(OUT, '_grounds.css'), 'w', encoding='utf-8',
              newline='') as f:
        f.write('/* Sampled client grounds, generated by '
                'tools/build-client-marks.py. Classes, not style\n'
                "   attributes: the CSP drops 'unsafe-inline' from style-src. "
                'Each ground is read\n'
                "   off its own file's border, never chosen. */\n")
        f.write('\n'.join(css) + '\n')
    print('\n  %d marks, %.1f KB on disk (all formats, all %d widths)'
          % (len(manifest), total / 1024, len(WIDTHS)))
    print('  now run tools/build-roster.py, which reads the hashes '
          'out of _manifest.json')


if __name__ == '__main__':
    build()
