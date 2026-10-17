/* ============================================================================
   NUANSE — process.js · the four stages

   Panels dock in from the side they sit on, the copper rail fills with scroll,
   and the stage you are reading is the active one. Moved off the home page
   verbatim.

   setStage still writes to the live readout if it finds one. The readout was
   cut from the markup in an earlier pass; the write is guarded, so this is
   dormant rather than broken.

   Loaded after core.js and only by process.html. Everything shared — the loader,
   nav, cursor, scroll, footer, the focus trap — is core's. It registers through
   NU rather than racing core's boot: NU.onBuild for anything that creates a
   ScrollTrigger, NU.onReady for after the curtain has lifted.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM } = NU;
  const EASE_OR_NONE = NU.EASE || 'power2.out';

  /* No GSAP, no behaviour to register: core has already lifted the curtain
     and NU is the small no-GSAP surface, which has no onBuild to call. The
     page reads either way - everything below is motion, not content. */
  if (NU.dead) return;

  /* ========================================================== build phase */
  NU.onBuild(() => {
    /* --- 7 · PROCESS: docking panels, copper line, spec readout --- */
    const stages = $$('.stage');
    const rvT = $('.rv-t');
    const rvO = $('.rv-o');
    let cur = -1;
    function setStage(i) {
      if (i === cur) return;
      cur = i;
      stages.forEach((s, k) => s.classList.toggle('active', k === i));
      const st = stages[i];
      if (rvT) rvT.textContent = `Stage 0${i + 1} · ${st.dataset.name}`;
      if (rvO) rvO.textContent = st.dataset.out;
      if (!RM && rvT) gsap.fromTo(rvT, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 });
    }
    if (stages.length) setStage(0);
    stages.forEach((s, i) => {
      const panel = $('.stage-panel', s);
      const left = panel.classList.contains('dock-l');
      if (RM) {
        gsap.from(panel, { opacity: 0, duration: 0.6, ease: 'none', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
      } else {
        gsap.fromTo(panel, { x: left ? -24 : 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
      }
      ScrollTrigger.create({
        trigger: s, start: 'top 60%', end: 'bottom 60%',
        onToggle: (self) => { if (self.isActive) setStage(i); }
      });
    });
    /* the return arc draws itself as it arrives. DrawSVG where it is loaded,
       a plain fade where it is not; under reduced motion it is simply there,
       because a loop that has to animate to exist is a loop the page is
       claiming rather than drawing. */
    const arc = $$('.pr-arc path');
    if (arc.length) {
      if (RM || typeof DrawSVGPlugin === 'undefined') {
        gsap.from('.pr-close', {
          opacity: 0, duration: 0.6, ease: 'none',
          scrollTrigger: { trigger: '.pr-close', start: 'top 85%', once: true }
        });
      } else {
        gsap.fromTo(arc, { drawSVG: '0%' }, {
          drawSVG: '100%', duration: 1.1, stagger: 0.25, ease: EASE_OR_NONE,
          scrollTrigger: { trigger: '.pr-close', start: 'top 80%', once: true }
        });
      }
    }

    if (!RM && $('.pr-fill')) {
      gsap.fromTo('.pr-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.pr-list', start: 'top 60%', end: 'bottom 60%', scrub: true }
      });
    }
  });
})();
