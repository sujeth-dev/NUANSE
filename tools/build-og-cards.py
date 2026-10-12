"""Per-project 1200x630 social cards.

    python tools/build-og-cards.py

Each card is the project's own ground, a rule in its accent, the case title,
and the NUANSE cream wordmark so the card reads as ours rather than the
client's. Crawlers will not render SVG, so these are PNG.

The title is set in a system serif rather than Gloock: the shipped faces are
woff2, which Pillow cannot read, and a card rendered once at build time only
needs a face that exists on the machine that renders it. If the cards ever
need to be exactly Gloock, drop a Gloock .ttf beside this script.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, 'site', 'assets', 'brand')

W, H = 1200, 630
CREAM = '#FCF7F1'

SERIF = 'C:/Windows/Fonts/constan.ttf'          # Constantia — a workable stand-in
MONO = 'C:/Windows/Fonts/consola.ttf'

CARDS = [
    {'out': 'og-zingara.png', 'ground': '#1C1A18', 'accent': '#C8332A',
     'kicker': 'CASE 01 · RESTAURANT · BANGALORE',
     'title': 'The menu was\ncosting them.'},
    {'out': 'og-the-possah.png', 'ground': '#1F3A2D', 'accent': '#C99A99',
     'kicker': 'CASE 02 · HAUTE COUTURE',
     'title': 'She wants what\nshe wants.'},
]


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def build(card):
    im = Image.new('RGB', (W, H), card['ground'])
    d = ImageDraw.Draw(im)
    pad = 76

    # kicker
    f_k = font(MONO, 19)
    d.text((pad, pad), card['kicker'], font=f_k, fill=card['accent'])

    # the accent rule
    d.rectangle([pad, pad + 52, pad + 150, pad + 56], fill=card['accent'])

    # title
    f_t = font(SERIF, 86)
    y = pad + 110
    for line in card['title'].split('\n'):
        d.text((pad, y), line, font=f_t, fill=CREAM)
        y += 96

    # the NUANSE wordmark, bottom left, so the card is ours
    wm_path = os.path.join(BRAND, 'wordmark-cream-800.png')
    if os.path.exists(wm_path):
        wm = Image.open(wm_path).convert('RGBA')
        target_w = 230
        wm = wm.resize((target_w, round(wm.height * target_w / wm.width)), Image.LANCZOS)
        im.paste(wm, (pad, H - pad - wm.height), wm)

    # the mark, bottom right
    mk_path = os.path.join(BRAND, 'monogram-cream-256.png')
    if os.path.exists(mk_path):
        mk = Image.open(mk_path).convert('RGBA')
        target_h = 92
        mk = mk.resize((round(mk.width * target_h / mk.height), target_h), Image.LANCZOS)
        im.paste(mk, (W - pad - mk.width, H - pad - mk.height), mk)

    out = os.path.join(BRAND, card['out'])
    im.save(out, 'PNG', optimize=True)
    print(f'  {card["out"]:22} {os.path.getsize(out)//1024} KB')


if __name__ == '__main__':
    print('building og cards')
    for c in CARDS:
        build(c)
