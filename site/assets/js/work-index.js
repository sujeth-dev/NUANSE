/* ============================================================================
   NUANSE — work-index.js · the proofs, marked up

   The three pinned proof prints, and the case overlay the two unnamed ones
   open. Moved off the home page verbatim, where it was section 4 of eleven.

   A print carrying data-href is a route to a real case page and goes there
   instead; the overlay is for the cases that have no page of their own.

   Loaded after core.js and only by work/index.html. Everything shared — the loader,
   nav, cursor, scroll, footer, the focus trap — is core's. It registers through
   NU rather than racing core's boot: NU.onBuild for anything that creates a
   ScrollTrigger, NU.onReady for after the curtain has lifted.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, EASE, clamp, esc, wrapS, wrapWords, loopPath } = NU;

  /* ---------------------------------------------- real images on the prints
     Needs no animation library, so it runs on the no-GSAP path too: if a
     photograph is supplied it should show even on a page where GSAP failed. */
  function attachPrintImages() {
    $$('.print[data-img]').forEach((p) => {
      const host = $('.print-art', p);
      if (!host) return;
      const img = document.createElement('img');
      img.className = 'print-img';
      img.alt = p.dataset.imgAlt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => { host.classList.remove('has-img'); img.remove(); });
      img.src = p.dataset.img;
      host.insertBefore(img, host.firstChild);
      host.classList.add('has-img');
    });
  }

  /* =================================================== 4 · CASE OVERLAY
     Copy is lifted from the reference build, not rewritten. Every figure in
     here came with it; brief/02-project-pages.md says to lift rather than
     rewrite, and brief/05-conventions.md says never to invent one.

     NOTE for the content pass: these three figures are live on the current
     site and are carried forward unchanged, but they have not been confirmed
     back to a source in this round. If any one of them cannot be attributed,
     it becomes a NEEDS placeholder — the markup for which is already here. */
  const CASES = [
    {
      no: 2, name: '24 SKUs. One shoot.', sector: 'D2C fashion · India', cc: '#3F4A2E',
      title: 'One light. One day. Every SKU.',
      brief: 'A fabric-first label with product people kept and photos nobody shared. Every SKU had been shot on a different day in a different light, so the store looked like a marketplace of its own.',
      fixes: [
        'One light, one angle logic, one background, planned before anyone picked up a camera.',
        'Ad creative cut from the same shoot, so the click lands on the photo it promised.',
        'Product pages rewritten so the second line of a caption carries the fabric story.'
      ],
      results: [['24', 'SKUs shot in one day'], ['2.4×', 'Return on ad spend'], ['+38%', 'Product page conversion']],
      scope: ['Shoot direction', 'Product photography', 'Reels', 'Shopify product pages', 'Meta ads']
    },
    {
      no: 3, name: 'A GCC, Bangalore', sector: 'Global capability centre', cc: '#16245A',
      title: 'We redlined “leveraging synergies”.',
      brief: 'A new global capability centre needed a strategy people could repeat, a name system for six teams and a website that helps it hire. The first draft of the strategy used “leveraging synergies” four times.',
      fixes: [
        'A name system that scales from one team to sixty without a new logo each time.',
        'Strategy cut to one sentence a new hire can say back on day one.',
        '“Leveraging synergies” became “working as one team”. Every page was held to the same test.'
      ],
      results: [['1', 'Name system for 6 teams'], ['4 wks', 'Brief to live site'], ['0', 'Uses of “synergies”']],
      scope: ['Strategy', 'Name system', 'Identity', 'Website', 'Hiring content']
    }
  ];

  const ov = $('.case-ov');
  const ovIn = $('.case-in');
  const ovClose = $('.case-close');
  let openFrom = null;
  let lastFocus = null;

  /* A figure we do not have renders as a visible placeholder, never as a
     plausible number. Call it as NEEDS('average order value, Zingara'). */
  const NEEDS = (what) => `<span class="needs">[[NEEDS: ${esc(what)}]]</span>`;
  const cell = (v) => (v && v.needs ? NEEDS(v.needs) : esc(v));

  function renderCase(i) {
    const c = CASES[i];
    ov.style.setProperty('--cc', c.cc);
    ovIn.innerHTML =
      `<div class="case-top case-x"><div><p class="mono">Case 0${c.no} · ${esc(c.sector)}</p>` +
      `<h2 class="case-title">${wrapWords(c.title)}</h2></div>` +
      `<p class="case-brief">${esc(c.brief)}</p></div>` +
      '<div class="case-grid case-x"><div><p class="mono">The redline</p><ol class="fixes">' +
      c.fixes.map((f, k) => `<li><b>${'ABC'[k]}</b><span>${esc(f)}</span></li>`).join('') +
      '</ol></div>' +
      '<div><p class="mono">Results</p><div class="results">' +
      c.results.map((r) => `<div><strong>${cell(r[0])}</strong><span>${esc(r[1])}</span></div>`).join('') +
      '</div>' +
      '<p class="mono case-scope-h">Scope</p><div class="scope">' +
      c.scope.map((s) => `<span>${esc(s)}</span>`).join('') + '</div></div></div>' +
      '<div class="case-x"><div class="case-swatch"></div><div class="case-next">' +
      '<button class="btn solid next-case"><span class="btn-ar l" aria-hidden="true">→</span>' +
      `<span class="btn-label">${wrapS('Next case')}</span>` +
      '<span class="btn-ar r" aria-hidden="true">→</span></button></div></div>';

    $('.next-case', ovIn).addEventListener('click', () => {
      const n = (i + 1) % CASES.length;
      gsap.to($$('.case-x', ovIn), {
        opacity: 0, y: -20, duration: 0.5, stagger: 0.04,
        onComplete: () => { renderCase(n); ov.scrollTop = 0; showCaseBits(); }
      });
    });
  }
  function showCaseBits() {
    gsap.fromTo($$('.case-x', ovIn),
      { opacity: 0, y: RM ? 0 : 30 },
      { opacity: 1, y: 0, duration: RM ? 0.3 : 0.9, stagger: 0.08, delay: RM ? 0 : 0.1 });
  }
  function rectInset(el) {
    const r = el.getBoundingClientRect();
    const W = window.innerWidth;
    const H = window.innerHeight;
    return `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px)`;
  }
  function openCase(i, el) {
    lastFocus = document.activeElement;
    openFrom = el;
    renderCase(i);
    ov.scrollTop = 0;
    NU.stopScroll();
    NU.cursorRest();
    ov.classList.add('open');
    if (RM) {
      gsap.fromTo(ov, { clipPath: 'inset(0px 0px 0px 0px)', opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' });
    } else {
      gsap.fromTo(ov, { clipPath: rectInset(el) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.1 });
    }
    showCaseBits();
    ovClose.focus({ preventScroll: true });
  }
  function closeCase() {
    if (!ov || !ov.classList.contains('open')) return;
    const done = () => {
      ov.classList.remove('open');
      NU.startScroll();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    if (RM || !openFrom) {
      gsap.to(ov, { opacity: 0, duration: 0.3, ease: 'none', onComplete: () => { gsap.set(ov, { opacity: 1 }); done(); } });
    } else {
      gsap.to(ov, { clipPath: rectInset(openFrom), duration: 1, onComplete: done });
    }
  }

  /* ------------------------------------------- the redlines on the prints
     Each print carries its circles as data-rl: "cx,cy,rx,ry,label", in the
     400x500 space the viewBox fixes, so the markup says where the proof was
     circled and this draws it. The loop is NU.loopPath, shared with the home
     page's slider annotations. */
  function buildPrintRedlines() {
    $$('.print').forEach((p) => {
      const art = $('.print-art', p);
      if (!art || !p.getAttribute('data-rl')) return;
      let svg = '<svg class="redline" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">';
      p.getAttribute('data-rl').split(';').forEach((r) => {
        const a = r.split(',');
        const cx = +a[0];
        const cy = +a[1];
        const rx = +a[2];
        const ry = +a[3];
        svg += `<path d="${loopPath(cx, cy, rx, ry)}"/>`;
        const tx = clamp(cx + rx * 0.92, 16, 384);
        const ty = clamp(cy - ry * 0.92, 16, 484);
        svg += `<g class="tag" transform="translate(${tx} ${ty})"><circle r="13"/><text>${a[4]}</text></g>`;
      });
      svg += '</svg>';
      art.insertAdjacentHTML('beforeend', svg);
    });
  }

  /* ===================================================== the no-GSAP floor
     The proof photographs are plain <img>, so they are attached above the
     guard and show even where GSAP failed. */
  attachPrintImages();
  if (NU.dead) return;

  /* ========================================================== build phase */
  NU.onBuild(() => {
    /* order matters: the pin's timeline reads the paths this draws */
    buildPrintRedlines();

    /* --- 4 · WORK: pinned proof prints, redlines draw, front slides away --- */
    const prints = $$('.print');
    prints.forEach((p, i) => { p.style.zIndex = String(10 - i); });
    const allPaths = $$('.print .redline path');
    gsap.set(allPaths, { drawSVG: RM ? '100%' : '0%' });
    gsap.set($$('.print .redline .tag'), RM ? { opacity: 1 } : { opacity: 0, scale: 0.3 });
    const wcN = $('.wc-n');
    const wcBar = $('.work-count .bar i');
    function setCount(i) {
      const t = ('0' + (i + 1));
      if (!wcN || wcN.textContent === t) return;
      wcN.textContent = t;
      gsap.to(wcBar, { scaleX: (i + 1) / 3, duration: 0.6 });
    }
    if (!RM && prints.length === 3) {
      gsap.set(prints[1], { rotation: 2.5, y: 12, scale: 0.965 });
      gsap.set(prints[2], { rotation: -2, y: 24, scale: 0.93 });
      const wtl = gsap.timeline({ defaults: { ease: EASE } });
      prints.forEach((p, i) => {
        const paths = $$('.redline path', p);
        const tags = $$('.redline .tag', p);
        if (i > 0) wtl.to(p, { rotation: 0, y: 0, scale: 1, duration: 0.6 }, '<.15');
        wtl.to(paths, { drawSVG: '100%', duration: 0.4, stagger: 0.12 }, i === 0 ? 0.05 : '>-.2')
          .to(tags, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12 }, '<.2');
        /* each print holds still twice as long before the next one moves, so
           the section reads as one print per scroll step */
        if (i < prints.length - 1) wtl.to(p, { yPercent: 135, rotation: -7, duration: 1 }, '+=.7');
      });
      wtl.to({}, { duration: 0.3 });
      ScrollTrigger.create({
        trigger: '#work', start: 'top top', end: '+=120%', pin: '.work-stage',
        scrub: 1, animation: wtl, invalidateOnRefresh: true, onToggle: NU.pinClaim,
        onUpdate: () => {
          let idx = 0;
          prints.forEach((p, i) => {
            if (i > 0 && gsap.getProperty(prints[i - 1], 'yPercent') > 60) idx = i;
          });
          setCount(idx);
        }
      });
    }
  });

  /* ------------------------------------------------------------ wiring up */
  $$('.print').forEach((p) => {
    const open = () => {
      if (p.dataset.href) { NU.goPage(p.dataset.href); return; }
      openCase(+p.dataset.case, p);
    };
    p.addEventListener('click', open);
    p.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      open();
    });
  });
  if (ovClose) ovClose.addEventListener('click', closeCase);
  if (ov) NU.trap(ov);
  NU.onEsc(closeCase);
})();
