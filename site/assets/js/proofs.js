/* ============================================================================
   NUANSE — proofs.js · the proofs, marked up

   The three pinned proof prints. Shared by the home page and
   work/index.html: both carry the same section.work markup, and the stack
   swaps print for print in one place as you scroll.

   A print carrying data-href is a route to a real case page. One without it
   is a case still in progress, and goes nowhere.

   Loaded after core.js. Everything shared — the loader, nav, cursor, scroll,
   footer — is core's. It registers through NU rather than
   racing core's boot: NU.onBuild for anything that creates a ScrollTrigger,
   NU.onReady for after the curtain has lifted.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, EASE, clamp, loopPath } = NU;

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
    /* the pin is the section the stack sits in, whatever its id is: the
       home page calls it #work, the work index #proofs */
    const sec = prints.length ? prints[0].closest('.work') : null;
    if (!RM && sec && prints.length === 3) {
      gsap.set(prints[1], { rotation: 2.5, y: 12, scale: 0.965 });
      gsap.set(prints[2], { rotation: -2, y: 24, scale: 0.93 });
      /* the counter follows the scrubbed timeline, not the scroll position,
         so it changes when the print does rather than a beat before */
      const wtl = gsap.timeline({
        defaults: { ease: EASE },
        onUpdate: () => {
          let idx = 0;
          prints.forEach((p, i) => {
            if (i > 0 && gsap.getProperty(prints[i - 1], 'yPercent') > 60) idx = i;
          });
          setCount(idx);
        }
      });
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
        ...NU.stickPin(sec, $('.work-stage', sec), 1.2),
        scrub: 1, animation: wtl, invalidateOnRefresh: true
      });
    }
  });

  /* ------------------------------------------------------------ wiring up */
  /* The control is .print-go inside the card, not the card: a card whose
     visible text is a whole drawn menu cannot carry "Read the case" as its
     accessible name without lying to a screen reader. The links route with
     this file blocked too. The card keeps its own click handler, so the whole
     print is still a target for the mouse, and stands aside when the click
     came from the link so nothing fires twice.

     A print with no data-href is a case still in progress: it is shown,
     marked up like the others, and goes nowhere. */
  $$('.print[data-href]').forEach((p) => {
    const open = () => NU.goPage(p.dataset.href);
    const go = $('.print-go', p);
    if (go) go.addEventListener('click', (e) => { e.preventDefault(); open(); });
    p.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('.print-go')) return;
      open();
    });
  });
})();
