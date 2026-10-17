"""The client roster on /work, from one source of truth.

    python tools/build-roster.py

Reads `tools/clients.json` — the only place a client is described — and writes
three things:

  1. the filter chips into `site/work/index.html`, between the FILTER markers
  2. the client cards into the same file, between the ROSTER markers
  3. `site/assets/js/clients.js`, the record behind each card's overlay

Why generated at all, on a site with no build step: the roster has to agree
with itself in four places at once — the card, the chip count, the overlay and
the filter's data attribute. Hand-maintained, the first thing to drift is a
count, and a studio that cannot count its own clients is the exact impression
this page exists to avoid. The precedent is `tools/build-client-marks.py`: a
tool run by hand, its output committed, nothing running at request time.

ADDING A CLIENT is one record in `tools/clients.json` and one run of this.

THE HOUSE RULE IS ENFORCED HERE, not just documented. A null field renders as
a visible `[[NEEDS: ...]]` in the overlay, in copper, where nobody can ship it
by accident. `--strict` turns any remaining NEEDS into a non-zero exit, so a
release check can refuse a page that still has holes in it.

The marks are NOT rebuilt here. `tools/build-client-marks.py` owns them and
writes the content hashes into `_manifest.json`; this reads them from there,
because a hash is content-derived and a filename guessed anywhere else would
404 in silence.
"""
import sys, os, io, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'clients.json')
MANIFEST = os.path.join(ROOT, 'site', 'assets', 'work', 'clients', '_manifest.json')
PAGE = os.path.join(ROOT, 'site', 'work', 'index.html')
JSOUT = os.path.join(ROOT, 'site', 'assets', 'js', 'clients.js')

LF = chr(10)
CRLF = chr(13) + LF

# The tile is about 120px of mark on the card. 192 covers 1x with room and 320
# covers 2x; `sizes` tells the browser that before it picks, so nobody
# downloads the 320 to show it at 120.
TILE_SIZES = '120px'

BAND_LABEL = {
    'case': 'Full case',
    'live': 'Live work',
    'mark': 'Mark on file',
}


def esc(s):
    """Escape for text content. Quotes are left alone: the copy uses curly
    ones deliberately and the file is served as UTF-8."""
    return html.escape(s, quote=False) if s else ''


def attr(s):
    return html.escape(s or '', quote=True)


def host(url):
    """The domain, as the link's visible text. www. is noise on a card."""
    h = url.split('//', 1)[-1].split('/', 1)[0]
    return h[4:] if h.startswith('www.') else h


# --------------------------------------------------------------- the sources
def load():
    with io.open(SRC, encoding='utf-8') as f:
        data = json.load(f)
    with io.open(MANIFEST, encoding='utf-8') as f:
        marks = json.load(f)
    return data, marks


def validate(data, marks):
    """Every failure here is a mistake that would otherwise reach the page as
    a 404, a wrong count or an invented fact."""
    cats = data['_categories']
    seen = set()
    bad = []
    for c in data['clients']:
        slug = c['slug']
        if slug in seen:
            bad.append('duplicate slug: ' + slug)
        seen.add(slug)
        if c['cat'] is not None and c['cat'] not in cats:
            bad.append('%s: cat %r is not in _categories' % (slug, c['cat']))
        if c['band'] not in BAND_LABEL:
            bad.append('%s: band %r unknown' % (slug, c['band']))
        if c['mark']:
            if slug not in marks:
                bad.append('%s: mark=true but no entry in _manifest.json — '
                           'run tools/build-client-marks.py first' % slug)
            elif 'files' not in marks[slug]:
                bad.append('%s: _manifest.json has no `files` — rebuild the '
                           'marks with the current tool' % slug)
        elif not c['init']:
            bad.append('%s: mark=false needs `init` for the set initials' % slug)
        if c['href'] and not os.path.exists(
                os.path.join(ROOT, 'site', 'work', c['href'])):
            bad.append('%s: href %r does not exist' % (slug, c['href']))
    if bad:
        for b in bad:
            print('  INVALID  ' + b, file=sys.stderr)
        sys.exit(2)


# ----------------------------------------------------------------- the marks
def tile(c, marks):
    """The mark on its own sampled ground, or our initials on stone.

    Both are aria-hidden with an empty alt: the client's name is live text
    beside it in Gloock, and a chip that repeats the name is a screen reader
    saying everything twice."""
    if not c['mark']:
        return ('      <span class="cl-tile cl-init" aria-hidden="true">'
                '<span>%s</span></span>' % esc(c['init']))
    m = marks[c['slug']]
    f = m['files']

    def srcset(ext):
        return ', '.join('../assets/work/clients/%s %dw' % (name, w)
                         for w, name in f[ext])
    fallback = f['jpg'][0][1]
    return (
        '      <span class="cl-tile clm-%s" aria-hidden="true">\n'
        '        <picture>\n'
        '          <source type="image/avif" srcset="%s" sizes="%s">\n'
        '          <source type="image/webp" srcset="%s" sizes="%s">\n'
        '          <img src="../assets/work/clients/%s" width="320" height="320"\n'
        '               loading="lazy" decoding="async" alt="">\n'
        '        </picture>\n'
        '      </span>'
        % (c['slug'], srcset('avif'), TILE_SIZES, srcset('webp'), TILE_SIZES,
           fallback))


# ----------------------------------------------------------------- the cards
def card(c, marks):
    """One <li>.

    A full case is a single link to its page. Everything else is a button that
    opens the overlay, plus — where there is one — a separate outbound link to
    the client's live site.

    Two controls rather than one link doing both jobs, and it is not fussiness:
    with JavaScript dead the button does nothing and the link still works, and
    the accessible name of each is its own visible text. The last cycle paid
    for the alternative — three axe label-content-name-mismatch failures on
    cards whose aria-label did not contain what they said on screen."""
    cls = ['cl']
    if c['band'] == 'case':
        cls.append('cl-feat')
    if c['band'] == 'mark':
        cls.append('cl-thin')
    sector = c['sector'] or BAND_LABEL[c['band']]

    txt = ['      <span class="cl-txt">',
           '        <span class="cl-sector mono">%s</span>' % esc(sector),
           '        <span class="cl-name">%s</span>' % esc(c['name'])]
    if c['line']:
        txt.append('        <span class="cl-line">%s</span>' % esc(c['line']))
    txt.append('      </span>')
    inner = tile(c, marks) + LF + LF.join(txt)

    out = ['  <li class="%s" data-slug="%s" data-cat="%s" data-band="%s">'
           % (' '.join(cls), attr(c['slug']), attr(c['cat'] or ''), c['band'])]
    if c['href']:
        out += ['    <a class="cl-hit" href="%s" data-cursor="Read the case">'
                % attr(c['href']),
                inner,
                '      <span class="cl-go mono">Read the case '
                '<i aria-hidden="true">&rarr;</i></span>',
                '    </a>']
    else:
        out += ['    <button type="button" class="cl-hit" data-cursor="Open">',
                inner,
                '      <span class="cl-go mono">Details '
                '<i aria-hidden="true">&rarr;</i></span>',
                '    </button>']
    if c['site'] and not c['href']:
        out.append('    <a class="cl-site mono" href="%s" target="_blank" '
                   'rel="noopener">%s <i aria-hidden="true">&nearr;</i></a>'
                   % (attr(c['site']), esc(host(c['site']))))
    out.append('  </li>')
    return LF.join(out)


# ----------------------------------------------------------------- the chips
def chips(data):
    """Everything, then one chip per shelf, with its count.

    The count is the reason these are generated. A chip that says 3 over a
    filter that shows 2 is the one error on this page nobody forgives."""
    cl = data['clients']
    rows = [('', 'Everything', len(cl))]
    for key, label in data['_categories'].items():
        rows.append((key, label, sum(1 for c in cl if c['cat'] == key)))
    uncat = [c['name'] for c in cl if not c['cat']]

    out = ['  <div class="cl-chips" role="group" aria-label="Filter clients by sector">']
    for key, label, n in rows:
        out.append('    <button type="button" class="chip%s" data-cat="%s" '
                   'aria-pressed="%s"><span>%s</span>'
                   '<i class="chip-n" aria-hidden="true">%02d</i></button>'
                   % (' on' if key == '' else '', attr(key),
                      'true' if key == '' else 'false', esc(label), n))
    out.append('  </div>')
    if uncat:
        # Said out loud rather than filed under a guess. Twelve on Everything
        # and eleven across the shelves is a discrepancy a reader can see, so
        # the page explains it before they have to wonder.
        out.append('  <p class="cl-uncat">%s %s no published sector, so %s '
                   'under Everything rather than filed under a guess.'
                   '</p>' % (esc(' and '.join(uncat)),
                             'carry' if len(uncat) > 1 else 'carries',
                             'they appear only' if len(uncat) > 1
                             else 'it appears only'))
    return LF.join(out)


# -------------------------------------------------------------- the js record
def clients_js(data, marks):
    """The overlay's data. One record per client, null preserved as null —
    the overlay is what turns a null into a visible [[NEEDS]], so stripping
    them here would quietly hide the holes instead of showing them."""
    keep = ('slug', 'name', 'sector', 'cat', 'band', 'href', 'site', 'mark',
            'init', 'line', 'note', 'came', 'did', 'got', 'outcome')
    out = []
    for c in data['clients']:
        rec = {k: c[k] for k in keep}
        if c['mark'] and c['slug'] in marks:
            m = marks[c['slug']]
            rec['tile'] = {'ground': m['ground'],
                           'avif': m['files']['avif'],
                           'webp': m['files']['webp'],
                           'jpg': m['files']['jpg']}
        out.append(rec)

    body = json.dumps({'cats': data['_categories'], 'list': out},
                      indent=2, ensure_ascii=False)
    return (
        '/* ============================================================================'
        + LF +
        '   NUANSE — clients.js · the roster record' + LF +
        LF +
        '   GENERATED by tools/build-roster.py from tools/clients.json.' + LF +
        '   Do not hand-edit: the next run overwrites it. Edit the JSON.' + LF +
        LF +
        '   This is the data behind each card\'s overlay on /work. A null field is' + LF +
        '   not an omission to be tidied up — it is the house rule showing through,' + LF +
        '   and roster.js renders it as a visible [[NEEDS: ...]]. Filling one in' + LF +
        '   means being told the fact, not thinking of a plausible one.' + LF +
        '   ========================================================================== */' + LF +
        'window.NU_CLIENTS = ' + body + ';' + LF)


# ---------------------------------------------------------------- the writing
def splice(page, name, block):
    """Replace what sits between two markers. Asserts both exist exactly once:
    a generator that silently appends a second roster is worse than one that
    refuses to run."""
    a = '<!-- %s:START' % name
    b = '<!-- %s:END -->' % name
    assert page.count(a) == 1, 'work/index.html: %s marker not found once' % a
    assert page.count(b) == 1, 'work/index.html: %s marker not found once' % b
    i = page.index(a)
    i = page.index('-->', i) + 3
    j = page.index(b)
    return page[:i] + LF + block + LF + '  ' + page[j:]


def main():
    strict = '--strict' in sys.argv
    data, marks = load()
    validate(data, marks)

    raw = io.open(PAGE, encoding='utf-8', newline='').read()
    crlf = CRLF in raw
    page = raw.replace(CRLF, LF)
    page = splice(page, 'FILTER', chips(data))
    page = splice(page, 'ROSTER',
                  (LF + LF).join(card(c, marks) for c in data['clients']))
    io.open(PAGE, 'w', encoding='utf-8', newline='').write(
        CRLF.join(page.split(LF)) if crlf else page)

    io.open(JSOUT, 'w', encoding='utf-8', newline='').write(clients_js(data, marks))

    # ------------------------------------------------------------- the report
    cl = data['clients']
    print('  %d clients -> site/work/index.html (crlf=%s) + '
          'site/assets/js/clients.js' % (len(cl), crlf))
    for key, label in data['_categories'].items():
        print('    %-16s %2d' % (label, sum(1 for c in cl if c['cat'] == key)))
    print('    %-16s %2d' % ('(no shelf)', sum(1 for c in cl if not c['cat'])))

    holes = [(c['slug'], k) for c in cl for k in ('came', 'did', 'got', 'outcome')
             if c[k] is None and c['band'] != 'case']
    by = {}
    for slug, k in holes:
        by.setdefault(slug, []).append(k)
    print('\n  %d fields will render as [[NEEDS]] across %d clients:'
          % (len(holes), len(by)))
    for slug in sorted(by):
        print('    %-18s %s' % (slug, ' '.join(by[slug])))
    print('\n  These are brief/09-feedback-round.md §5 Q2. They are not a bug '
          'and not\n  a placeholder to be written over — they are what the '
          'client has not sent.')
    if strict and holes:
        print('\n  --strict: refusing to pass with %d unfilled fields.' % len(holes),
              file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
