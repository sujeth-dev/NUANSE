"""Expands [[FIG name | kind | eager]] tokens in a page source into the real
<picture> markup for that image.

    python tools/expand-figures.py zingara site/work/_zingara.src.html site/work/zingara.html

There is no build step for the HTML and there is not going to be one — the
pages ship exactly as committed. This is the same idea as build-page-images.py
printing ready-to-paste markup: it runs by hand, once, when the image set
changes, and the thing that ships is its plain static output. The reason it
exists at all is that a page carrying fifteen figures carries fifteen srcsets
of four content-hashed filenames each, and transcribing those by hand is how a
page ends up pointing at an image that no longer exists.

Tokens:
    [[FIG name]]                  the default evidence layout, lazy
    [[FIG name | grid]]           a grid cell
    [[FIG name | grid tall]]      a grid cell with a 2:3 frame
    [[FIG name | ev | eager]]     loaded eagerly, for an above-the-fold figure

Captions stay in the page source, where they belong, as a sibling
<figcaption>. This only writes the <picture>.
"""
import sys, os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'assets', 'work')

SIZES = {
    'ev': '(max-width:900px) 92vw, 60vw',
    'grid': '(max-width:900px) 92vw, 30vw',
    'half': '(max-width:900px) 92vw, 46vw',
}

TOKEN = re.compile(r'\[\[FIG ([a-z0-9-]+)(?:\s*\|\s*([a-z ]+?))?(?:\s*\|\s*(eager))?\s*\]\]')


def variants(slug, name):
    """Every derivative on disk for this image, by extension and width."""
    d = os.path.join(OUT, slug)
    got = {}
    for f in os.listdir(d):
        m = re.match(re.escape(name) + r'-(\d+)\.[0-9a-f]{8}\.(avif|webp|jpg)$', f)
        if m:
            got.setdefault(m.group(2), []).append((int(m.group(1)), f))
    for k in got:
        got[k].sort()
    return got


def main():
    slug, src, dest = sys.argv[1], sys.argv[2], sys.argv[3]
    manifest = json.load(open(os.path.join(OUT, slug, '_manifest.json'), encoding='utf-8'))
    html = open(os.path.join(ROOT, src), encoding='utf-8').read()
    used = []

    def sub(m):
        name = m.group(1)
        kind = (m.group(2) or 'ev').strip()
        eager = bool(m.group(3))
        if name not in manifest:
            sys.exit('unknown image: %s' % name)
        meta = manifest[name]
        got = variants(slug, name)
        if not got.get('jpg'):
            sys.exit('no derivatives on disk for %s' % name)
        used.append(name)
        base = kind.split()[0]
        sizes = SIZES.get(base, SIZES['ev'])
        w, h = meta['w'], meta['h']
        fallback = got['jpg'][-1][1]

        def srcset(ext):
            return ', '.join('../assets/work/%s/%s %dw' % (slug, f, wd)
                             for wd, f in got[ext])

        load = ('decoding="async" fetchpriority="high"' if eager
                else 'loading="lazy" decoding="async"')
        alt = meta['alt'].replace('&', '&amp;').replace('"', '&quot;')
        return (
            '<picture>\n'
            '            <source type="image/avif" srcset="%s" sizes="%s">\n'
            '            <source type="image/webp" srcset="%s" sizes="%s">\n'
            '            <img src="../assets/work/%s/%s" width="%d" height="%d"\n'
            '                 %s alt="%s">\n'
            '          </picture>'
            % (srcset('avif'), sizes, srcset('webp'), sizes,
               slug, fallback, w, h, load, alt)
        )

    out = TOKEN.sub(sub, html)
    left = TOKEN.search(out)
    if left:
        sys.exit('unexpanded token: %s' % left.group(0))
    with open(os.path.join(ROOT, dest), 'w', encoding='utf-8', newline='') as f:
        f.write(out)
    unused = [k for k in manifest if k not in used]
    print('%s -> %s' % (src, dest))
    print('  %d figures expanded' % len(used))
    if unused:
        print('  not used on this page: %s' % ', '.join(sorted(unused)))


if __name__ == '__main__':
    main()
