"""Measure how much of The Possah's documented palette actually appears in a
corpus of images.

    python tools/sample-ratios.py possah/campaign
    python tools/sample-ratios.py possah/identity

The brief asks for a live 60/30/10 ratio meter driven off precomputed per-image
colour proportions. This is the tool that computes them — and, just as
importantly, the tool that says whether the resulting number is defensible
enough to publish. A measurement nobody can check is a decoration.

Output goes to site/assets/work/_ratios-<corpus>.json and records the
parameters it was produced with, because a data file that does not say how it
was made is not evidence.

WHAT IT DOES, AND WHY EACH GATE EXISTS
--------------------------------------
Each pixel is pushed into CIELAB and matched to the nearest palette anchor,
subject to three gates applied BEFORE the nearest-neighbour search:

  lightness window   |L* - L*anchor| <= dL
      Stops a pixel matching a colour it could never be mistaken for.

  chroma floor       a chromatic anchor (C* >= 6) only accepts pixels with
                     C* >= 3.6
      This is the gate that decides whether you have a measurement or an
      artefact. Deep Forest Green is L*22 — in Lab it is mostly just "dark".
      Without this gate every shadow, every strand of dark hair and every dim
      backdrop classifies as forest green. It is the most seductive wrong
      answer in the exercise, because the inflated figure lands near the 30%
      the brand document claims.

  hue window         |dh| <= dH, when pixel and anchor are both chromatic
      Keeps burnt orange out of skin tones.

Then nearest anchor by dE76; if the nearest is still further than TH, the pixel
is `other`.

dE76 rather than dE2000 on purpose: dE2000's corrections are tuned for small
differences (dE < 5). At a threshold of 26 they move bucket membership by well
under a point, for thirty times the code. Three explicit, arguable gates are
more auditable than one opaque formula — and the gates are exactly what a
reviewer needs to be able to disagree with.

All six buckets are kept. Which of them count as "accent", and whether to
renormalise over the tracked three, are editorial decisions that must stay
re-decidable without re-running this.
"""
import sys, os, json, datetime
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets')
OUT = os.path.join(ROOT, 'site', 'assets', 'work')

# The documented Possah palette, read off assets/possah/identity/
# a-color-palette-is-presented-with-primary-colors-atpcnid.jpg.
ANCHORS = [
    ('ivory',  '#F4ECDF'),
    ('green',  '#1F3A2D'),
    ('rose',   '#C99A99'),
    ('orange', '#B35A2B'),
    ('gold',   '#C8973A'),
]
BUCKETS = [n for n, _ in ANCHORS] + ['other']

# 128px: a 1200x1500 portrait gives ~12,000 samples, so sampling error on a 10%
# proportion is about 0.3pp. 256 buys 0.14pp, which is noise next to the +-5pp
# the gate parameters themselves move things. 64 would also be enough
# statistically, but LANCZOS at 64 manufactures edge colours — skin averaged
# with green — that belong to no anchor and inflate `other`.
SAMPLE = 128

TH = 26.0      # dE76 beyond which a pixel is `other`
DL = 28.0      # lightness window
DH = 30.0      # hue window, degrees
CMIN = 3.6     # chroma floor for matching a chromatic anchor
CHROMATIC = 6.0  # an anchor is "chromatic" above this C*

# The sweep is not diagnostics. It is the honesty instrument: if the published
# triple moves with the threshold, the number describes the threshold.
SWEEP_TH = [20.0, 26.0, 32.0, 40.0]
SWEEP_DL = [22.0, 28.0, 36.0]


def srgb_to_lab(rgb):
    """rgb: float array (...,3) in 0..255 -> CIELAB under D65."""
    c = rgb / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = lin @ m.T
    white = np.array([0.95047, 1.00000, 1.08883])
    t = xyz / white
    d = 6.0 / 29.0
    f = np.where(t > d ** 3, np.cbrt(t), t / (3 * d * d) + 4.0 / 29.0)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def hexlab(h):
    rgb = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)]], dtype=float)
    return srgb_to_lab(rgb)[0]


A_LAB = np.array([hexlab(h) for _, h in ANCHORS])
A_C = np.hypot(A_LAB[:, 1], A_LAB[:, 2])
A_H = np.degrees(np.arctan2(A_LAB[:, 2], A_LAB[:, 1])) % 360


def classify(lab, th=TH, dl=DL, dh=DH):
    """lab: (n,3) -> (n,) index into ANCHORS, or len(ANCHORS) for `other`."""
    n = len(lab)
    px_c = np.hypot(lab[:, 1], lab[:, 2])
    px_h = np.degrees(np.arctan2(lab[:, 2], lab[:, 1])) % 360

    # (n, anchors)
    d = np.linalg.norm(lab[:, None, :] - A_LAB[None, :, :], axis=2)

    ok = np.abs(lab[:, None, 0] - A_LAB[None, :, 0]) <= dl
    chromatic_anchor = (A_C >= CHROMATIC)[None, :]
    ok &= ~chromatic_anchor | (px_c[:, None] >= CMIN)
    both_chromatic = chromatic_anchor & (px_c[:, None] >= CMIN)
    dhue = np.abs((px_h[:, None] - A_H[None, :] + 180) % 360 - 180)
    ok &= ~both_chromatic | (dhue <= dh)

    d = np.where(ok, d, np.inf)
    idx = np.argmin(d, axis=1)
    best = d[np.arange(n), idx]
    return np.where(best < th, idx, len(ANCHORS))


def counts(lab, th=TH, dl=DL, dh=DH):
    idx = classify(lab, th, dl, dh)
    c = np.bincount(idx, minlength=len(BUCKETS)).astype(float)
    return c / c.sum()


def lab_of(path):
    im = Image.open(path)
    im = im.convert('RGB')
    im.thumbnail((SAMPLE, SAMPLE), Image.LANCZOS)
    return srgb_to_lab(np.asarray(im, dtype=float).reshape(-1, 3))


def triple(share):
    """The three tracked channels, renormalised, plus the coverage that makes
    the renormalisation honest or dishonest. Accent = orange + gold.

    A renormalised figure may only ever be published beside its coverage."""
    iv = share[BUCKETS.index('ivory')]
    gr = share[BUCKETS.index('green')]
    ac = share[BUCKETS.index('orange')] + share[BUCKETS.index('gold')]
    cov = iv + gr + ac
    if cov <= 0:
        return (0.0, 0.0, 0.0), 0.0
    return (iv / cov, gr / cov, ac / cov), cov


def main():
    corpus = sys.argv[1] if len(sys.argv) > 1 else 'possah/campaign'
    folder = os.path.join(SRC, *corpus.split('/'))
    files = sorted(f for f in os.listdir(folder)
                   if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    if not files:
        sys.exit('no images in ' + folder)

    labs = []
    frames = []
    for f in files:
        lab = lab_of(os.path.join(folder, f))
        labs.append(lab)
        share = counts(lab)
        (iv, gr, ac), cov = triple(share)
        frames.append({
            'file': f,
            'raw': {b: round(float(share[i]), 4) for i, b in enumerate(BUCKETS)},
            'ivory': round(float(iv), 4),
            'green': round(float(gr), 4),
            'accent': round(float(ac), 4),
            'coverage': round(float(cov), 4),
        })
        print('%-56s iv %4.1f  gr %4.1f  ac %4.1f   cov %4.1f' % (
            f[:56], iv * 100, gr * 100, ac * 100, cov * 100))

    allpx = np.concatenate(labs, axis=0)

    # Corpus aggregate is computed over the pooled pixels, not as a mean of
    # per-frame percentages: frames differ in size, and a mean of ratios is not
    # the ratio of the whole.
    agg_share = counts(allpx)
    (iv, gr, ac), cov = triple(agg_share)

    sweep = []
    for th in SWEEP_TH:
        for dl in SWEEP_DL:
            s = counts(allpx, th=th, dl=dl)
            (a, b, c), cv = triple(s)
            sweep.append({'th': th, 'dl': dl,
                          'ivory': round(float(a), 4), 'green': round(float(b), 4),
                          'accent': round(float(c), 4), 'coverage': round(float(cv), 4)})

    def span(k):
        v = [s[k] for s in sweep]
        return (max(v) - min(v)) * 100

    # The ceiling test. One-sided, which is why it survives where the
    # three-way split does not: it asks only whether accent stayed under 10%
    # of the pixels that carry palette colour at all.
    over = [f['file'] for f in frames if f['accent'] > 0.10]
    acc = [f['accent'] for f in frames]

    report = {
        'meta': {
            'corpus': corpus,
            'files': len(files),
            'sample': SAMPLE,
            'threshold': TH, 'dL': DL, 'dH': DH, 'Cmin': CMIN,
            'anchors': {n: h for n, h in ANCHORS},
            'accent': ['orange', 'gold'],
            'generated': datetime.date.today().isoformat(),
            'method': 'gated nearest-anchor dE76 in CIELAB; see tools/sample-ratios.py',
        },
        'aggregate': {
            'ivory': round(float(iv), 4), 'green': round(float(gr), 4),
            'accent': round(float(ac), 4), 'coverage': round(float(cov), 4),
            'raw': {b: round(float(agg_share[i]), 4) for i, b in enumerate(BUCKETS)},
        },
        'gates': {
            'coverage': {'value': round(float(cov) * 100, 1), 'threshold': 80.0,
                         'pass': bool(cov >= 0.80)},
            'stability_pp': {'ivory': round(span('ivory'), 1),
                             'green': round(span('green'), 1),
                             'accent': round(span('accent'), 1),
                             'threshold': 5.0,
                             'pass': bool(max(span('ivory'), span('green'),
                                              span('accent')) <= 5.0)},
            'proximity_pp': {'ivory': round((iv - 0.60) * 100, 1),
                             'green': round((gr - 0.30) * 100, 1),
                             'accent': round((ac - 0.10) * 100, 1),
                             'threshold': 12.0,
                             'pass': bool(max(abs(iv - 0.60), abs(gr - 0.30),
                                              abs(ac - 0.10)) * 100 <= 12.0)},
        },
        'ceiling': {
            'min': round(float(min(acc)) * 100, 1),
            'max': round(float(max(acc)) * 100, 1),
            'limit': 10.0,
            'over_limit': over,
        },
        'sweep': sweep,
        'frames': frames,
    }

    os.makedirs(OUT, exist_ok=True)
    dest = os.path.join(OUT, '_ratios-%s.json' % corpus.replace('/', '-'))
    with open(dest, 'w', encoding='utf-8') as fh:
        json.dump(report, fh, indent=1)

    g = report['gates']
    print('\n--- %s · %d files ---' % (corpus, len(files)))
    print('aggregate       %.0f / %.0f / %.0f   coverage %.0f%%'
          % (iv * 100, gr * 100, ac * 100, cov * 100))
    print('gate 1 coverage   %5.1f%%  (need >=80)      %s'
          % (g['coverage']['value'], 'PASS' if g['coverage']['pass'] else 'FAIL'))
    print('gate 2 stability  %5.1fpp (need <=5)       %s'
          % (max(g['stability_pp']['ivory'], g['stability_pp']['green'],
                 g['stability_pp']['accent']),
             'PASS' if g['stability_pp']['pass'] else 'FAIL'))
    print('gate 3 proximity  %5.1fpp (need <=12)      %s'
          % (max(abs(g['proximity_pp']['ivory']), abs(g['proximity_pp']['green']),
                 abs(g['proximity_pp']['accent'])),
             'PASS' if g['proximity_pp']['pass'] else 'FAIL'))
    print('accent ceiling    %.1f%% - %.1f%% against a stated 10%%; over: %s'
          % (report['ceiling']['min'], report['ceiling']['max'],
             ', '.join(over) or 'none'))
    print('->', dest)


if __name__ == '__main__':
    main()
