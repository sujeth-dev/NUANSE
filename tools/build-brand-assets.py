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

# ---- the footer wordmark, split: the letters without the S, and the S alone,
# so the S can move on its own. Every pixel goes to whichever side its colour
# is nearer, copper or cream; the two halves never share one. Prints where the
# S sits in the full mark, as fractions, for the CSS that puts it back.
def dist(c, ref): return abs(c[0]-ref[0]) + abs(c[1]-ref[1]) + abs(c[2]-ref[2])
letters = cm.copy(); lpx = letters.load()
s_only = Image.new("RGBA", cm.size, COPPER + (0,)); spx = s_only.load()
for y in range(cm.size[1]):
    for x in range(cm.size[0]):
        r, g, b, a = cpx[x, y]
        if a and dist((r, g, b), COPPER) < dist((r, g, b), CREAM):
            spx[x, y] = (r, g, b, a)
            lpx[x, y] = CREAM + (0,)
sb = s_only.getchannel("A").getbbox()
W, H = cm.size
print("S box: left %.4f top %.4f width %.4f height %.4f" % (sb[0]/W, sb[1]/H, (sb[2]-sb[0])/W, (sb[3]-sb[1])/H))
widths(letters, "wordmark-cream-nos", [1600])
s_crop = s_only.crop(sb)
widths(s_crop, "wordmark-s", [round(1600 * s_crop.size[0] / W)])

# The S's doodle: a copper-light line that follows the S's own contour a
# little way out, wobbling as a pen would, so it rings the letter without
# reaching the N or the E. The nearest letter is 32px away at this scale; the
# line's outer edge is at most 15px, which leaves room for the S to swell
# on hover. Those are 1600px-wide figures; F scales them to the master.
# Padded by RP on every side; CSS places it with the same figure.
import numpy as np
from scipy import ndimage as nd
F = W / 1600
RP = round(24 * F)
sa = np.array(s_crop.getchannel("A")) > 40
sa = np.pad(sa, RP)
dist_out = nd.distance_transform_edt(~sa)
hh, ww = sa.shape
yy, xx = np.mgrid[0:hh, 0:ww]
ang = np.arctan2(yy - hh / 2, xx - ww / 2)
inner = (9 + 2.5 * np.sin(3 * ang + 1)) * F
ring = (dist_out > inner) & (dist_out < inner + 3.2 * F)
ring_a = nd.gaussian_filter(ring.astype(float), 0.6 * F)
ring_im = Image.new("RGBA", (ww, hh), (213, 138, 78, 0))
ring_im.putalpha(Image.fromarray((np.clip(ring_a * 1.6, 0, 1) * 255).astype("uint8")))
print("S ring pad %.4f x, %.4f y of the S box" % (RP / s_crop.size[0], RP / s_crop.size[1]))
widths(ring_im, "wordmark-s-ring", [round(1600 * ww / W)])

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
