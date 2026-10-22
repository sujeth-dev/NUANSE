/* ============================================================================
   NUANSE — roster.js · the client grid, its filter, and the client overlay

   Twelve clients on /work. Two have a case page of their own and route to it.
   The other ten open a screen rather than a page — the client's round-2 note,
   verbatim: "except the case studies for 2, the others let them have a
   dedicated popup screen rather than a page, which can be expandable."

   They open a screen rather than getting a page because there is nothing on
   file to put in a page. Ten clients have a name, a sector, a URL and a mark.
   A page each would be ten pages of frame around four facts.

   THE DATA IS NOT HERE. window.NU_CLIENTS comes from clients.js, which
   tools/build-roster.py generates from tools/clients.json — the same record
   that generated the cards in the markup, so the overlay and the card it came
   from cannot disagree. A null field is the house rule showing through and
   renders as a visible [[NEEDS: ...]]. Filling one in means being told the
   fact. See brief/09-feedback-round.md §5 Q2.

   Deliberately NOT part of proofs.js, which drives .case-ov: that file is
   shared with the home page, and folding this page's roster into it would
   have put twelve client records on a page that shows none of them.

   Loaded after core.js and clients.js, and only by work/index.html.

   THE NO-GSAP FLOOR IS REAL HERE, not a degraded mode. Both the filter and
   the overlay work with the CDN blocked: the filter falls back from Flip to a
   plain hide, and the overlay falls back from a clip-path open to a class, with
   a local focus trap standing in for NU.trap — which, like stopScroll and
   onEsc, is not on the small surface core.js publishes when GSAP never
   arrives (core.js:321).
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  const DATA = window.NU_CLIENTS;
  if (!NU || !DATA) return;

  const { $, $$, RM, esc } = NU;
  /* NU.esc handles & < > and deliberately leaves quotes alone, because the
     copy uses curly ones. Anything going into an attribute needs the quotes
     too, so that is this. */
  const qt = (t) => esc(String(t)).replace(/"/g, '&quot;');
  /* EASE is not on the no-GSAP surface either */
  const EASE = NU.EASE || 'power2.out';
  const HAS = typeof window.gsap !== 'undefined' && !NU.dead;

  /* clients.js stores bare filenames, because the hashes are content-derived
     and belong to the manifest rather than to a path. The prefix is this
     page's, and this page is the only one that loads this file. */
  const DIR = '../assets/work/clients/';

  const BY_SLUG = {};
  DATA.list.forEach((c, i) => { c._i = i; BY_SLUG[c.slug] = c; });
  const TOTAL = DATA.list.length;

  /* ======================================================= the overlay body
     Four parts, in the order the client asked for them and in the order a
     reader wants them: what they came with, what we did, what they got, what
     happened. */
  const needs = (c, what) =>
    `<span class="needs">[[NEEDS: ${esc(c.name)} — ${esc(what)}]]</span>`;

  const para = (s) => `<p>${esc(s)}</p>`;
  const bullets = (a) =>
    `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;

  /* "unpublished" is a real answer and a different one from null. A client
     who has not published a number has told us something; a null means
     nobody has asked them yet. They must not render the same. */
  function happened(c) {
    if (c.outcome === 'unpublished') {
      return '<p class="cl-ov-unpub">No figure is published for this ' +
        'engagement. The numbers are the client’s and they stay theirs ' +
        'until they say otherwise.</p>';
    }
    if (Array.isArray(c.outcome)) {
      return `<span class="cl-ov-num">${esc(c.outcome[0])}</span>` +
        `<span>${esc(c.outcome[1])}</span>`;
    }
    return needs(c, 'a number, or “nothing published”');
  }

  function tile(c, cls) {
    if (!c.tile) {
      return `<span class="cl-tile cl-init ${qt(cls)}" aria-hidden="true">` +
        `<span>${esc(c.init || '')}</span></span>`;
    }
    const set = (ext) => c.tile[ext]
      .map(([w, f]) => `${DIR}${f} ${w}w`).join(', ');
    return `<span class="cl-tile clm-${qt(c.slug)} ${qt(cls)}" aria-hidden="true">` +
      '<picture>' +
      `<source type="image/avif" srcset="${set('avif')}" sizes="120px">` +
      `<source type="image/webp" srcset="${set('webp')}" sizes="120px">` +
      `<img src="${DIR}${c.tile.jpg[0][1]}" width="320" height="320" ` +
      'loading="lazy" decoding="async" alt="">' +
      '</picture></span>';
  }

  function body(c) {
    const shelf = c.cat ? DATA.cats[c.cat] : 'No published sector';
    let head =
      '<div class="cl-ov-head">' + tile(c, 'cl-ov-tile') +
      '<div><p class="cl-ov-sector mono">' + esc(c.sector || shelf) + '</p>' +
      '<h2 class="cl-ov-name">' + esc(c.name) + '</h2>';
    if (c.line) head += '<p class="cl-ov-line">' + esc(c.line) + '</p>';
    if (c.note) head += '<p class="cl-ov-line">' + esc(c.note) + '</p>';
    if (c.site) {
      head += `<a class="cl-ov-out" href="${qt(c.site)}" target="_blank" ` +
        `rel="noopener">Visit ${esc(host(c.site))} <i aria-hidden="true">&nearr;</i></a>`;
    }
    head += '</div></div>';

    /* "Who they are" rather than "what they came with", and the difference
       is not cosmetic. What a client came with is a brief, and a brief is
       not published anywhere we can read it. Who they are, and what is live
       on their site today, both are - so those two are filled from the
       client's own site and this one is honest about which is which.

       "What we did" stays empty for every client and is the only field that
       does. The approach is ours, it is on no website, and it is the one
       line the studio has to write itself. */
    const parts = [
      ['Who they are', c.came ? para(c.came) : needs(c, 'who they are, in a line')],
      ['What we did', c.did ? para(c.did) : needs(c, 'the approach, one line')],
      ['What is live', c.got ? bullets(c.got) : needs(c, 'the deliverables, a list')],
      ['What it moved', happened(c)]
    ];

    /* A client with a mark on file and nothing else gets the note alone.
       Four placeholders under a card that already says nothing is published
       about this engagement is the same sentence shouted twice. */
    const bare = c.band === 'mark' && !c.came && !c.got && !c.site;
    if (bare) return head;

    const dl = '<dl class="cl-ov-parts">' + parts.map(
      ([k, v]) => `<div class="cl-ov-part"><dt>${esc(k)}</dt><dd>${v}</dd></div>`
    ).join('') + '</dl>';

    const holes = ['came', 'did', 'got', 'outcome']
      .filter((k) => c[k] === null).length;
    const COUNT = ['', 'One line', 'Two lines', 'Three lines', 'All four lines'];
    const foot = holes
      ? `<p class="qual-note cl-ov-foot">${COUNT[holes]} above ` +
        (holes === 1 ? 'is' : 'are') + ' still ours to write. Nothing is ' +
        'put there in the meantime</p>'
      : '';

    return head + dl + foot;
  }

  /* The domain, as the link's visible text. String.split with a limit
     TRUNCATES rather than capping the split, so ('https://x/y').split('//',1)
     is ['https:'] and the old test for a scheme was always false - the link
     read "Visit https:". Matched off the front instead. */
  const host = (u) => String(u)
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split('/')[0]
    .replace(/^www\./i, '');

  /* ============================================================ the sheet */
  const ov = $('.cl-ov');
  const sheet = $('.cl-ov-sheet');
  const inner = $('.cl-ov-in');
  const crumb = $('.cl-ov-crumb');
  const wideBtn = $('.cl-ov-wide');
  const closeBtn = $('.cl-ov-close');
  const grid = $('.cl-grid');
  const cards = $$('.cl');
  const chips = $$('.chip');
  if (!ov || !inner || !grid) return;

  let openFrom = null;
  let lastFocus = null;
  let current = null;

  /* the set the arrows walk: whatever is on screen under the current chip,
     in grid order. Filtering to Fashion and then paging through the whole
     twelve would make the filter a lie. */
  const visible = () => cards.filter((li) => !li.hidden);

  function show(slug, el) {
    const c = BY_SLUG[slug];
    if (!c) return;
    current = slug;
    inner.innerHTML = body(c);
    const vis = visible();
    const at = vis.findIndex((li) => li.dataset.slug === slug);
    const shelf = c.cat ? DATA.cats[c.cat] : 'Unshelved';
    if (crumb) {
      crumb.textContent = `Client ${pad(c._i + 1)} / ${pad(TOTAL)} · ${shelf}` +
        (vis.length < TOTAL ? ` · ${at + 1} of ${vis.length} shown` : '');
    }
    sheet.scrollTop = 0;
    ov.setAttribute('aria-label', c.name + ', client detail');
    if (el) openFrom = el;
  }
  const pad = (n) => (n < 10 ? '0' + n : String(n));

  /* ---------------------------------------------------- open, close, widen */
  function lock() {
    if (NU.stopScroll) NU.stopScroll();
    else document.body.style.overflow = 'hidden';
    if (NU.cursorRest) NU.cursorRest();
  }
  function unlock() {
    if (NU.startScroll) NU.startScroll();
    else document.body.style.overflow = '';
  }

  function rectInset(el) {
    const r = el.getBoundingClientRect();
    return `inset(${r.top}px ${window.innerWidth - r.right}px ` +
      `${window.innerHeight - r.bottom}px ${r.left}px)`;
  }

  function open(slug, el) {
    lastFocus = document.activeElement;
    show(slug, el);
    lock();
    ov.classList.add('open');
    if (HAS) {
      if (RM) {
        gsap.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' });
      } else {
        /* the card opening, not a page arriving — the same gesture proofs.js
           uses for the two anonymised cases, so the page has one idea of what
           opening looks like */
        gsap.fromTo(ov, { clipPath: rectInset(el), opacity: 0.4 },
          { clipPath: 'inset(0px)', opacity: 1, duration: 0.8, ease: EASE });
        gsap.fromTo(sheet, { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: EASE });
      }
    }
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!ov.classList.contains('open')) return;
    const done = () => {
      ov.classList.remove('open');
      ov.classList.remove('wide');
      if (wideBtn) {
        wideBtn.setAttribute('aria-pressed', 'false');
        wideBtn.textContent = 'Expand';
      }
      unlock();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
      current = null;
    };
    if (HAS && !RM && openFrom) {
      gsap.to(ov, {
        clipPath: rectInset(openFrom), opacity: 0.3, duration: 0.6, ease: EASE,
        onComplete: () => { gsap.set(ov, { clearProps: 'clipPath,opacity' }); done(); }
      });
    } else if (HAS) {
      gsap.to(ov, {
        opacity: 0, duration: 0.25, ease: 'none',
        onComplete: () => { gsap.set(ov, { opacity: 1 }); done(); }
      });
    } else {
      done();
    }
  }

  function step(dir) {
    const vis = visible();
    if (!vis.length || !current) return;
    let at = vis.findIndex((li) => li.dataset.slug === current);
    for (let n = 0; n < vis.length; n++) {
      at = (at + dir + vis.length) % vis.length;
      const next = vis[at];
      /* a full case has a page; the arrows stay inside the overlay set */
      if (!next.querySelector('a.cl-hit')) { show(next.dataset.slug, next); return; }
    }
  }

  /* ---------------------------------------------------------- the focus trap
     NU.trap when GSAP is alive. When it is not, core publishes a surface
     without it, and a dialog a keyboard can walk out of is worse than no
     animation — so this is the stand-in rather than a reason to disable the
     overlay on that path. */
  function localTrap(el) {
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', el)
        .filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ============================================================ the filter
     Flip where it is available, a plain hide where it is not. The chip is a
     toggle: pressing the one that is already on returns to Everything, so
     there is no state the reader cannot get out of with one click. */
  function setCat(cat) {
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
    const state = HAS && window.Flip ? Flip.getState(cards) : null;
    cards.forEach((li) => { li.hidden = !!cat && li.dataset.cat !== cat; });
    if (state) {
      Flip.from(state, {
        duration: RM ? 0 : 0.55, ease: EASE, absolute: true, scale: false,
        onEnter: (els) => (RM
          ? gsap.set(els, { opacity: 1 })
          : gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.4 })),
        onLeave: (els) => (RM ? null : gsap.to(els, { opacity: 0, duration: 0.2 })),
        onComplete: () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); }
      });
    }
    /* the overlay's arrows walk the visible set, so a filter applied while it
       is open has to re-read the crumb */
    if (current) show(current, openFrom);
  }

  chips.forEach((b) => {
    b.addEventListener('click', () => {
      const already = b.getAttribute('aria-pressed') === 'true';
      setCat(already ? '' : b.dataset.cat);
    });
  });

  /* =========================================================== wiring up
     Everything above the NU.dead guard, because all of it works without
     GSAP. The only thing that needs the library is the animation, and each
     use of it is guarded by HAS. */
  cards.forEach((li) => {
    const btn = li.querySelector('button.cl-hit');
    if (!btn) return;                        // a full case: its link routes
    btn.addEventListener('click', () => open(li.dataset.slug, li));
  });

  /* the doodles draw themselves in once, as each card arrives */
  const pen = cards.filter((li) => li.querySelector('.cl-doodle'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((rows) => rows.forEach((r) => {
      if (!r.isIntersecting) return;
      r.target.classList.add('is-drawn');
      io.unobserve(r.target);
    }), { threshold: 0.45 });
    pen.forEach((li) => io.observe(li));
  } else {
    pen.forEach((li) => li.classList.add('is-drawn'));
  }

  /* the home strip links here as /work#slug: that card's sheet opens on
     arrival, once the page has settled under it */
  const deep = cards.find((li) => '#' + li.dataset.slug === location.hash);
  if (deep && deep.querySelector('button.cl-hit')) {
    deep.scrollIntoView({ block: 'center' });
    setTimeout(() => open(deep.dataset.slug, deep), 600);
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  $$('.cl-ov-step').forEach((b) => {
    b.addEventListener('click', () => step(+b.dataset.step));
  });
  if (wideBtn) {
    wideBtn.addEventListener('click', () => {
      const on = ov.classList.toggle('wide');
      wideBtn.setAttribute('aria-pressed', String(on));
      wideBtn.textContent = on ? 'Shrink' : 'Expand';
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }
  /* clicking the ground outside the sheet closes it, which is what a reader
     expects of a sheet and costs nothing */
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  ov.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  if (NU.trap) NU.trap(ov); else localTrap(ov);
  if (NU.onEsc) NU.onEsc(close);
})();
