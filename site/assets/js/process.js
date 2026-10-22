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
    /* --- the figures: drawn in once, then a small loop each while on screen.
       Reduced motion gets the finished drawings and nothing that moves. --- */
    stages.forEach((s) => {
      const art = $('.stage-art', s);
      if (!art) return;
      const lines = $$('.ln', art);
      const loupe = $('.sa-loupe', art);
      if (loupe) gsap.set(loupe, { x: 140, y: 74 });
      if (RM) return;
      const intro = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 75%', once: true } });
      intro.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.07, ease: 'power2.out' });
      const bars = $$('.sa-bar', art);
      if (bars.length) intro.from(bars, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.2);

      const loop = gsap.timeline({ repeat: -1, paused: true });
      if (loupe) {
        loop.to(loupe, { keyframes: [{ x: 200, y: 112 }, { x: 128, y: 152 }, { x: 176, y: 196 }, { x: 140, y: 74 }],
          duration: 7, ease: 'sine.inOut' });
      }
      const sign = $('.sa-sign', art);
      const seal = $('.sa-seal', art);
      if (sign && seal) {
        loop.fromTo(sign, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' })
          .fromTo(seal, { scale: 1.5, opacity: 0, svgOrigin: '232 64' }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
          .to([sign, seal], { opacity: 0, duration: 0.5 }, '+=2.2')
          .set(sign, { opacity: 1, strokeDashoffset: 1 });
      }
      const swash = $('.sa-swash', art);
      const nib = $('.sa-nib', art);
      if (swash && nib) {
        const len = swash.getTotalLength();
        gsap.set(swash, { strokeDasharray: len, strokeDashoffset: len });
        const pen = { t: 0 };
        const place = () => {
          const at = pen.t * len;
          const a = swash.getPointAtLength(at);
          const b = swash.getPointAtLength(Math.min(len, at + 1));
          const deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 60;
          nib.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${deg})`);
          gsap.set(swash, { strokeDashoffset: len * (1 - pen.t) });
        };
        place();
        loop.to(pen, { t: 1, duration: 2.4, ease: 'power1.inOut', onUpdate: place })
          .to(swash, { opacity: 0, duration: 0.5 }, '+=1.4')
          .add(() => { pen.t = 0; place(); })
          .set(swash, { opacity: 1 });
      }
      const ping = $('.sa-ping', art);
      if (ping) {
        loop.fromTo(ping, { scale: 1, opacity: 0.8, svgOrigin: '264 62' }, { scale: 3.4, opacity: 0, duration: 1.6, ease: 'power2.out' })
          .to(bars, { scaleY: 0.86, transformOrigin: '50% 100%', duration: 0.8, stagger: 0.12, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
      }
      ScrollTrigger.create({
        trigger: s, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => { if (self.isActive) loop.play(); else loop.pause(); }
      });
    });

    if (!RM && $('.pr-fill')) {
      gsap.fromTo('.pr-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.pr-list', start: 'top 60%', end: 'bottom 60%', scrub: true }
      });
    }
  });
})();
