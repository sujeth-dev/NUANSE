/* ============================================================================
   NUANSE — services.js · five artifacts, one ink

   One drawn artifact per discipline, each playing once when it comes into
   view. They replace the five fanned cards, which overlapped their
   neighbours and hid every deliverable behind a hover.

   The contract, and the reason this file has no reduced-motion branches:

     the SVG as authored IS the finished artifact.

   Each builder only hides parts of it and plays them back in. So under
   prefers-reduced-motion this file does nothing at all and the artifacts are
   already right; with no GSAP it never runs and they are already right; with
   no JavaScript at all they are already right. There is no code path that has
   to remember to put something back, which is the failure mode
   brief/05-conventions.md warns about - a reveal whose reduced-motion branch
   forgets its final state and strands content at opacity:0 forever.

   Nothing here loops. Each artifact is one scroll-triggered play, once, so
   "one moving thing per screen" falls out of the layout rather than needing
   the MOTION registry.

   Loaded after core.js and only by services.html.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, EASE } = NU;

  /* Every builder takes the artifact's box and a paused timeline, sets the
     hidden state with gsap.set, and tweens back to what the markup already
     says. Keyed by the artifact's own class, so the markup decides which one
     it gets and an artifact with no builder simply stays still. */
  const ART = {};

  /* --- 01 · STRATEGY · a sentence being redlined ---
     The page settles, the strike is drawn through it by hand, and the
     replacement is written in underneath. The order is the argument: you read
     the bad line before it is struck. */
  ART.strategy = (sa, tl) => {
    const rules = $$('.sa-rule line', sa);
    const strike = $('.sa-strike', sa);
    const now = $('.sa-rise', sa);
    gsap.set(rules, { opacity: 0 });
    gsap.set(strike, { drawSVG: '0%' });
    gsap.set(now, { opacity: 0, y: 16 });
    tl.to(rules, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0)
      .to(strike, { drawSVG: '100%', duration: 0.5 }, 0.3)
      .to(now, { opacity: 1, y: 0, duration: 0.6 }, 0.65);
  };

  /* --- 02 · IDENTITY · the mark seats onto its construction ---
     Grid first, then the mark, then the palette: the order a real identity
     gets built in.

     The mark fades rather than scales on purpose. It is an <img> centred by
     `transform:translate(-50%,-50%)` in CSS, and handing that transform to
     GSAP would have it resolve the percentages to pixels once, at whatever
     size the box happened to be. It would then be wrong at every other size. */
  ART.identity = (sa, tl) => {
    const geo = $$('.sa-geo > *', sa);
    const mark = $('.sa-mark', sa);
    const chips = $$('.sa-chip', sa);
    const lbl = $('.sa-lbl', sa);
    gsap.set(geo, { drawSVG: '0%' });
    gsap.set([mark, lbl], { opacity: 0 });
    gsap.set(chips, { opacity: 0, y: 12 });
    tl.to(geo, { drawSVG: '100%', duration: 0.55, stagger: 0.09 }, 0)
      .to(mark, { opacity: 1, duration: 0.5 }, 0.5)
      .to(chips, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, 0.75)
      .to(lbl, { opacity: 1, duration: 0.4 }, 0.95);
  };

  /* --- 03 · WEBSITES · the page assembles onto its baseline ---
     The grid arrives before the blocks, because that is the claim: the grid
     is what the blocks are being held to. The one copper block is the one
     thing to click. */
  ART.websites = (sa, tl) => {
    const base = $$('.sa-base line', sa);
    const blocks = $$('.sa-blocks rect', sa);
    const lbls = $$('.sa-lbl', sa);
    gsap.set(base, { opacity: 0 });
    gsap.set(blocks, { opacity: 0, y: 14 });
    gsap.set(lbls, { opacity: 0 });
    tl.to(base, { opacity: 1, duration: 0.3, stagger: 0.02 }, 0)
      .to(blocks, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, 0.25)
      .to(lbls, { opacity: 1, duration: 0.4 }, 0.8);
  };

  /* --- 04 · CONTENT & FILM · the strip advances, one frame holds ---
     The strip runs one whole frame to the left and stops with the third frame
     under the marker, and only then is the cut drawn. The strip overflows the
     box at both ends at rest, so it reads as a length of film rather than
     five boxes. */
  ART.content = (sa, tl) => {
    const strip = $('.sa-strip', sa);
    const cut = $('.sa-cut .sa-draw', sa);
    const tip = $('.sa-cut .sa-acc', sa);
    const lbl = $('.sa-lbl', sa);
    gsap.set(strip, { x: 104 });
    gsap.set(cut, { drawSVG: '0%' });
    gsap.set([tip, lbl], { opacity: 0 });
    tl.to(strip, { x: 0, duration: 0.9 }, 0)
      .to(cut, { drawSVG: '100%', duration: 0.4 }, 0.75)
      .to(tip, { opacity: 1, duration: 0.3 }, 1.0)
      .to(lbl, { opacity: 1, duration: 0.4 }, 1.05);
  };

  /* --- 05 · PERFORMANCE · the line, rising, unlabelled ---
     The dots arrive with the line that passes through them. The axes carry no
     numbers, and the artifact is honest about why in the note under it. */
  ART.performance = (sa, tl) => {
    const rules = $$('.sa-rule line', sa);
    const line = $('.sa-line', sa);
    const dots = $$('.sa-dots circle', sa);
    const lbls = $$('.sa-lbl', sa);
    gsap.set(rules, { opacity: 0 });
    gsap.set(line, { drawSVG: '0%' });
    gsap.set(dots, { opacity: 0 });
    gsap.set(lbls, { opacity: 0 });
    tl.to(rules, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0)
      .to(line, { drawSVG: '100%', duration: 1.1, ease: 'none' }, 0.25)
      .to(dots, { opacity: 1, duration: 0.25, stagger: 0.16 }, 0.3)
      .to(lbls, { opacity: 1, duration: 0.4 }, 1.1);
  };

  /* No GSAP, no behaviour to register: core has already lifted the curtain
     and NU is the small no-GSAP surface, which has no onBuild to call. The
     page reads either way - everything below is motion, not content. */
  if (NU.dead) return;

  NU.onBuild(() => {
    /* Reduced motion wants the artifacts exactly as the markup draws them, so
       the honest implementation is to not touch them. */
    if (RM) return;
    /* DrawSVG is what draws four of the five. If the page shipped without it,
       leave every artifact in its finished state rather than hiding parts of
       it and failing to bring them back. */
    if (typeof DrawSVGPlugin === 'undefined') return;

    $$('.sa').forEach((sa) => {
      const key = Array.from(sa.classList)
        .filter((c) => c !== 'sa' && c.indexOf('sa-') === 0)
        .map((c) => c.slice(3))[0];
      const build = ART[key];
      if (!build) return;
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
      build(sa, tl);
      ScrollTrigger.create({
        trigger: sa, start: 'top 78%', once: true,
        onEnter: () => tl.play()
      });
    });
  });
})();
