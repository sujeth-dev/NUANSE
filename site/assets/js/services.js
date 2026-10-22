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
     The page rules itself, the bad line is written out in full, the strike
     goes through it in one fast stroke, and the replacement rises up
     underneath. The order is the argument: you read the bad line before it is
     struck, and the strike is the quickest thing on the card because that is
     what a redline feels like. */
  ART.strategy = (sa, tl) => {
    const groups = $$('.sa-rule', sa);
    const top = $$('line', groups[0]);
    const bot = $$('line', groups[1]);
    const was = $('.sa-was', sa);
    const strike = $('.sa-strike', sa);
    const now = $('.sa-rise', sa);
    const lbl = $('.sa-lbl', sa);
    gsap.set([...top, ...bot], { drawSVG: '0%' });
    gsap.set(was, { opacity: 0, y: 10 });
    gsap.set(strike, { drawSVG: '0%' });
    gsap.set(now, { opacity: 0, y: 26 });
    gsap.set(lbl, { opacity: 0, scale: 1.22, svgOrigin: '48 278' });
    tl.to(top, { drawSVG: '100%', duration: 0.45, stagger: 0.07 }, 0)
      .to(was, { opacity: 1, y: 0, duration: 0.45 }, 0.3)
      /* in, not the house curve: a strike accelerates away from the hand */
      .to(strike, { drawSVG: '100%', duration: 0.3, ease: 'power2.in' }, 0.78)
      /* the pen shoves the phrase and it settles back where it was authored */
      .to(was, { x: -2.5, duration: 0.12, yoyo: true, repeat: 1 }, 0.82)
      .to(now, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }, 1.0)
      .to(bot, { drawSVG: '100%', duration: 0.4, stagger: 0.06 }, 1.05)
      .to(lbl, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 1.3);
  };

  /* --- 02 · IDENTITY · the mark seats onto its construction ---
     Grid first, then the mark, then the palette: the order a real identity
     gets built in. The construction converges onto the centre the mark is
     about to land on, and the mark resolves out of a blur onto it, which is
     the moment the card is for.

     The geometry is scaled rather than drawn. DrawSVG owns an element's
     stroke-dasharray and leaves it owned at 100%, so drawing this group
     ended it solid and threw away the 4/5 dash that says "construction".
     Scaling the group leaves the dash alone.

     The mark is an <img> centred in CSS. That centring is on the `translate`
     property, not inside `transform`, precisely so GSAP can have `transform`
     to itself here - handed a percentage translate, GSAP would resolve it to
     pixels once, at whatever size the box happened to be, and it would be
     wrong at every other size. */
  ART.identity = (sa, tl) => {
    const geo = $('.sa-geo', sa);
    const mark = $('.sa-mark', sa);
    const chips = $$('.sa-chip', sa);
    const lbl = $('.sa-lbl', sa);
    gsap.set(geo, { opacity: 0, scale: 1.16, svgOrigin: '200 118' });
    gsap.set(mark, { opacity: 0, scale: 1.12, filter: 'blur(14px)' });
    gsap.set(chips, { opacity: 0, y: 16 });
    gsap.set(lbl, { opacity: 0 });
    tl.to(geo, { opacity: 1, scale: 1, duration: 0.75 }, 0)
      .to(mark, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.75 }, 0.45)
      .to(chips, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.6)' }, 0.95)
      .to(lbl, { opacity: 1, duration: 0.4 }, 1.25);
  };

  /* --- 03 · WEBSITES · the page assembles onto its baseline ---
     The grid unfolds down the card before anything sits on it, because that
     is the claim: the grid is what the blocks are being held to. Then the
     page builds in reading order, the copy wiping in left to right the way it
     would be read, and the one copper block pops in last because it is the
     one thing to click.

     The baseline is scaled open rather than drawn for the same reason the
     construction grid in 02 is: those lines are dashed, and DrawSVG would
     end them solid. */
  ART.websites = (sa, tl) => {
    const base = $('.sa-base', sa);
    const mark = $('.sa-blocks .hdm', sa);
    const rule = $('.sa-blocks .hd', sa);
    const head = $('.sa-hl', sa);
    const copy = $$('.sa-copy rect', sa);
    const cta = $('.sa-blocks .cta', sa);
    const ctaT = $('.sa-cta-t', sa);
    const lbls = $$('.sa-lbl', sa);
    gsap.set(base, { opacity: 0, scaleY: 0.02, svgOrigin: '200 54' });
    gsap.set(mark, { opacity: 0, scale: 0, svgOrigin: '32.5 30.5' });
    gsap.set(rule, { opacity: 0, scaleX: 0, svgOrigin: '28 42' });
    gsap.set(head, { opacity: 0, y: 20 });
    /* each hairline wipes from its own left edge, so the two columns read as
       two columns rather than as one sweep across the card */
    gsap.set(copy, { opacity: 0, scaleX: 0, svgOrigin: (i, t) => t.getAttribute('x') + ' ' + t.getAttribute('y') });
    gsap.set(cta, { opacity: 0, scale: 0.55, svgOrigin: '94 207' });
    gsap.set([ctaT, ...lbls], { opacity: 0 });
    tl.to(base, { opacity: 1, scaleY: 1, duration: 0.6 }, 0)
      .to(mark, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 0.35)
      .to(rule, { opacity: 1, scaleX: 1, duration: 0.5 }, 0.4)
      .to(head, { opacity: 1, y: 0, duration: 0.55 }, 0.55)
      .to(copy, { opacity: 1, scaleX: 1, duration: 0.45, stagger: 0.06 }, 0.8)
      .to(cta, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, 1.05)
      .to(ctaT, { opacity: 1, duration: 0.35 }, 1.25)
      .to(lbls, { opacity: 1, duration: 0.4 }, 1.3);
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
    const mark = $$('.sa-area, .sa-last, .sa-last-c', sa);
    const lbls = $$('.sa-lbl', sa);
    gsap.set(rules, { opacity: 0 });
    gsap.set(line, { drawSVG: '0%' });
    gsap.set(dots, { opacity: 0 });
    gsap.set(mark, { opacity: 0 });
    gsap.set(lbls, { opacity: 0 });
    tl.to(rules, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0)
      .to(line, { drawSVG: '100%', duration: 1.1, ease: 'none' }, 0.25)
      .to(dots, { opacity: 1, duration: 0.25, stagger: 0.16 }, 0.3)
      .to(mark, { opacity: 1, duration: 0.5 }, 1.0)
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
