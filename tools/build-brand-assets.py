import sys, os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
NAVY   = (13, 26, 65)
COPPER = (181, 101, 40)
CREAM  = (252, 247, 241)

def save(im, name):
    p = os.path.join(OUT, name)
    im.save(p, optimize=True)
    print(f"{im.size[0]:>5}x{im.size[1]:<5} {os.path.getsize(p)/1024:>7.1f}KB  {name}")

def widths(im, base, ws):
    for w in ws:
        h = round(im.size[1] * w / im.size[0])
        save(im.resize((w, h), Image.LANCZOS), f"{base}-{w}.png")

# ---- wordmark: flat 2-colour RGBA, navy letters + copper S ----
wm = Image.open(os.path.join(SRC, "logo main - png.png")).convert("RGBA")
# tight crop to the ink
wm = wm.crop(wm.getchannel("A").getbbox())
widths(wm, "wordmark-navy", [1600, 800, 400])

# cream variant: recolour only the navy, keep the copper S
px = wm.load()
cm = wm.copy(); cpx = cm.load()
for y in range(cm.size[1]):
    for x in range(cm.size[0]):
        r, g, b, a = cpx[x, y]
        if a and abs(r-COPPER[0]) + abs(g-COPPER[1]) + abs(b-COPPER[2]) > 90:
            cpx[x, y] = CREAM + (a,)
widths(cm, "wordmark-cream", [1600, 800, 400])

# ---- monogram: the inverted S master, transparent PNG; its alpha is the mark ----
mg = Image.open(os.path.join(SRC, "nuanse logo only - inverted s - png.png")).convert("RGBA")
alpha = mg.getchannel("A")
box = alpha.getbbox()
alpha = alpha.crop(box)
for name, col in (("copper", COPPER), ("cream", CREAM), ("navy", NAVY)):
    flat = Image.new("RGBA", alpha.size, col + (0,))
    flat.putalpha(alpha)
    widths(flat, f"monogram-{name}", [1024, 512, 256, 128])

# ---- favicon: copper monogram on navy, squared with padding ----
a = alpha
side = round(max(a.size) * 1.45)
for px_size in (512, 180, 32):
    sq = Image.new("RGBA", (side, side), NAVY + (255,))
    mark = Image.new("RGBA", a.size, COPPER + (0,)); mark.putalpha(a)
    sq.paste(mark, ((side - a.size[0]) // 2, (side - a.size[1]) // 2), mark)
    save(sq.resize((px_size, px_size), Image.LANCZOS), f"favicon-{px_size}.png")

# ---- OG card: wordmark centred on navy, 1200x630 ----
og = Image.new("RGBA", (1200, 630), NAVY + (255,))
cw = 720
ch = round(cm.size[1] * cw / cm.size[0])
og.paste(cm.resize((cw, ch), Image.LANCZOS), ((1200 - cw)//2, (630 - ch)//2), cm.resize((cw, ch), Image.LANCZOS))
save(og.convert("RGB"), "og-default.png")
