import sys, os, re, hashlib, json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC, OUT = sys.argv[1], sys.argv[2]

def slug(s):
    s = re.sub(r'\.[A-Za-z0-9]+$', '', s)
    s = re.sub(r'^\d{3}_', '', s)                 # strip 001_ prefixes
    s = re.sub(r'_[A-Za-z0-9_-]{8}$', '', s)      # strip trailing hash ids
    s = re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-').lower()
    return re.sub(r'-+', '-', s)[:58] or 'img'

# destination -> (source subpath, max edge, format)
GROUPS = [
    ("clients",            "Logos",                                      1400, "PNG"),
    ("zingara/identity",   "Brand identity/Zingara brand identity",      1800, "JPEG"),
    ("possah/identity",    "Brand identity/Possah Brand identity",       1800, "JPEG"),
    ("zingara/food",       "Pics/photoshoot",                            1600, "JPEG"),
    ("possah/campaign",    "Pics/campaigns and studio shoots",           1600, "JPEG"),
    ("social",             "Pics/social creatives",                      1600, "JPEG"),
]

seen, manifest, total = {}, [], 0
for dest, sub, maxedge, fmt in GROUPS:
    base = os.path.join(SRC, sub)
    if not os.path.isdir(base): print("MISSING", base); continue
    od = os.path.join(OUT, dest); os.makedirs(od, exist_ok=True)
    files = []
    for root, _, fs in os.walk(base):
        for f in sorted(fs):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                files.append(os.path.join(root, f))
    for p in sorted(files):
        h = hashlib.md5(open(p, 'rb').read()).hexdigest()
        if h in seen:
            continue
        seen[h] = p
        with Image.open(p) as im:
            orig = f"{im.size[0]}x{im.size[1]}"
            if im.mode == "CMYK": im = im.convert("RGB")
            im.thumbnail((maxedge, maxedge), Image.LANCZOS)
            name = slug(os.path.basename(p))
            if fmt == "PNG":
                im = im.convert("RGBA"); ext = "png"; kw = {"optimize": True}
            else:
                if im.mode != "RGB":
                    bg = Image.new("RGB", im.size, (255,255,255))
                    rgba = im.convert("RGBA"); bg.paste(rgba, mask=rgba.split()[-1]); im = bg
                ext = "jpg"; kw = {"quality": 82, "optimize": True, "progressive": True}
            o = os.path.join(od, f"{name}.{ext}")
            n = 2
            while os.path.exists(o):
                o = os.path.join(od, f"{name}-{n}.{ext}"); n += 1
            im.save(o, **kw)
            sz = os.path.getsize(o); total += sz
            manifest.append({"out": os.path.relpath(o, OUT).replace("\\","/"),
                             "src": os.path.relpath(p, SRC).replace("\\","/"),
                             "orig_px": orig, "out_px": f"{im.size[0]}x{im.size[1]}",
                             "out_kb": round(sz/1024)})
json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
print(f"{len(manifest)} files, {total/1024/1024:.1f} MB")
for dest, *_ in GROUPS:
    g = [m for m in manifest if m["out"].startswith(dest + "/")]
    print(f"  {dest:22} {len(g):>3} files  {sum(m['out_kb'] for m in g)/1024:>6.1f} MB")
