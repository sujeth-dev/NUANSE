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

  /* A hand, for the two artifacts that have one. The figure is authored into
     the drawing at the position it ends on, and every move it makes is a
     tween on one proxy that starts off the card and finishes on the numbers
     read back out of that authored transform. So it lands exactly where the
     markup parks it, and the contract above still holds: nothing restores
     anything, the drawing is only played back to what it already says.

     The figure is moved by setting its transform attribute, never by gsap
     transforms, so the two are never writing the same thing from two places. */
  const rider = (el) => {
    const m = /translate\(([-\d.]+) ([-\d.]+)\) rotate\(([-\d.]+)\)/
      .exec(el.getAttribute('transform'));
    const at = { x: +m[1], y: +m[2], r: +m[3] };
    const p = { x: at.x, y: at.y, r: at.r };
    const place = () => el.setAttribute('transform',
      'translate(' + p.x + ' ' + p.y + ') rotate(' + p.r + ')');
    const park = (x, y, r) => { p.x = x; p.y = y; p.r = r; place(); };
    return { p, at, place, park };
  };

  /* --- 01 · STRATEGY · a sentence being redlined ---
     A pen comes onto the page and does the whole job in front of you: the
     paper rules itself, the pen writes the bad line out left to right, lifts,
     holds, drops, strikes it in one fast stroke that shoves the words
     sideways, flicks off the end, comes back down and writes the
     replacement. Then it parks on the mark it made.

     The order is the argument: you read the bad line before it is struck, and
     the strike is the quickest thing on the card because that is what a
     redline feels like. The held lift before it is the rest of the argument.
     Both phrases are written under a clip that opens with the nib, so the ink
     arrives where the nib is rather than fading in whole. */
  ART.strategy = (sa, tl) => {
    const groups = $$('.sa-rule', sa);
    const top = $$('line', groups[0]);
    const bot = $$('line', groups[1]);
    const was = $('.sa-was', sa);
    const strike = $('.sa-strike', sa);
    const now = $('.sa-rise', sa);
    const lbl = $('.sa-lbl', sa);
    const wipe = $$('.sa-wipe', sa);
    const nib = $('.sa-nib', sa);
    const { p, at, place, park } = rider(nib);
    const TILT = 30;
    /* the strike is walked, not approximated: the nib rides the authored
       curve, so the ink comes off the tip and not out of the air */
    const len = strike.getTotalLength();
    const ride = { t: 0 };
    const onRide = () => {
      const d = ride.t * len;
      const u = strike.getPointAtLength(d);
      const v = strike.getPointAtLength(Math.min(len, d + 1));
      park(u.x, u.y, Math.atan2(v.y - u.y, v.x - u.x) * 180 / Math.PI + TILT);
    };
    gsap.set([...top, ...bot], { drawSVG: '0%' });
    gsap.set(strike, { drawSVG: '0%' });
    gsap.set(wipe, { scaleX: 0, svgOrigin: (i, t) => t.getAttribute('x') + ' ' + t.getAttribute('y') });
    gsap.set(now, { y: 8 });
    gsap.set(lbl, { opacity: 0, scale: 1.22, svgOrigin: '48 278' });
    gsap.set(nib, { opacity: 0 });
    park(452, 262, 54);
    tl.to(top, { drawSVG: '100%', duration: 0.45, stagger: 0.07 }, 0)
      /* the hand arrives before there is anything to read */
      .to(nib, { opacity: 1, duration: 0.2 }, 0.3)
      .to(p, { x: 44, y: 152, r: TILT, duration: 0.5, ease: 'power3.out', onUpdate: place }, 0.3)
      .to(wipe[0], { scaleX: 1, duration: 0.6, ease: 'none' }, 0.8)
      .to(p, { x: 340, duration: 0.6, ease: 'none', onUpdate: place }, 0.8)
      /* up off the page and held there: the pause is what makes the strike land */
      .to(p, { x: 36, y: 118, r: 14, duration: 0.42, ease: 'power2.inOut', onUpdate: place }, 1.5)
      .to(p, { x: 42, y: 142, r: TILT, duration: 0.14, ease: 'power2.in', onUpdate: place }, 1.98)
      /* in, not the house curve: a strike accelerates away from the hand */
      .to(strike, { drawSVG: '100%', duration: 0.3, ease: 'power2.in' }, 2.12)
      .to(ride, { t: 1, duration: 0.3, ease: 'power2.in', onUpdate: onRide }, 2.12)
      /* the pen shoves the phrase and it settles back where it was authored */
      .to(was, { x: -2.5, duration: 0.12, yoyo: true, repeat: 1 }, 2.16)
      /* a flick off the end, then back down for the replacement */
      .to(p, { x: 358, y: 104, r: 56, duration: 0.3, ease: 'power2.out', onUpdate: place }, 2.42)
      .to(p, { x: 44, y: 208, r: TILT, duration: 0.38, ease: 'power2.inOut', onUpdate: place }, 2.68)
      .to(wipe[1], { scaleX: 1, duration: 0.6, ease: 'none' }, 3.02)
      .to(now, { y: 0, duration: 0.6, ease: 'back.out(1.6)' }, 3.02)
      .to(p, { x: 340, duration: 0.6, ease: 'none', onUpdate: place }, 3.02)
      .to(bot, { drawSVG: '100%', duration: 0.4, stagger: 0.06 }, 3.4)
      /* and parks where the markup has it, which is the end of its own strike */
      .to(p, { x: at.x, y: at.y, r: at.r, duration: 0.45, ease: 'power2.inOut', onUpdate: place }, 3.56)
      .to(lbl, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 3.7);
  };

  /* --- 02 · IDENTITY · the mark seats onto its construction ---
     The construction is constructed, in the order a compass and a square
     build it: the axis runs down, the horizon opens out of the centre, the
     circle is struck from that centre with its dashes travelling round it,
     and the square turns square to the circle and snaps. The grid gives one
     small kick when it locks, because that is the moment it became a grid.

     Then the mark drops onto the centre the grid just found, out of a blur,
     and the landing spreads a ring of ink out from under it. The palette is
     stamped down one swatch at a time after, not faded.

     The geometry is scaled and turned rather than drawn. DrawSVG owns an
     element's stroke-dasharray and leaves it owned at 100%, so drawing this
     group ended it solid and threw away the 4/5 dash that says
     "construction". Scaling and rotating leave the dash alone, and turning a
     dashed circle is most of what makes it read as struck.

     The mark is an <img> centred in CSS. That centring is on the `translate`
     property, not inside `transform`, precisely so GSAP can have `transform`
     to itself here - handed a percentage translate, GSAP would resolve it to
     pixels once, at whatever size the box happened to be, and it would be
     wrong at every other size. */
  ART.identity = (sa, tl) => {
    const geo = $('.sa-geo', sa);
    const [axV, axH] = $$('line', geo);
    const ring = $('circle', geo);
    const box = $('rect', geo);
    const seat = $('.sa-seat', sa);
    const mark = $('.sa-mark', sa);
    const chips = $$('.sa-chip', sa);
    const wipe = $('.sa-wipe', sa);
    const C = '200 118';
    gsap.set(axV, { scaleY: 0, svgOrigin: '200 20' });
    gsap.set(axH, { scaleX: 0, svgOrigin: C });
    gsap.set(ring, { scale: 0, rotation: -150, svgOrigin: C });
    gsap.set(box, { opacity: 0, scale: 1.32, rotation: 45, svgOrigin: C });
    gsap.set(mark, { opacity: 0, y: -40, scale: 1.3, filter: 'blur(16px)' });
    /* each swatch stamps up off the baseline all three of them share */
    gsap.set(chips, { scaleY: 0, svgOrigin: (i, t) => t.getAttribute('x') + ' 254' });
    gsap.set(wipe, { scaleX: 0, svgOrigin: '96 262' });
    tl.to(axV, { scaleY: 1, duration: 0.5 }, 0)
      .to(axH, { scaleX: 1, duration: 0.45 }, 0.24)
      .to(ring, { scale: 1, rotation: 0, duration: 0.72, ease: 'back.out(1.5)' }, 0.5)
      .to(box, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }, 1.0)
      .to(geo, { scale: 1.03, duration: 0.18, yoyo: true, repeat: 1, svgOrigin: C }, 1.5)
      .to(mark, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.72, ease: 'power3.out' }, 1.66)
      .fromTo(seat, { opacity: 0.55, scale: 0.5, svgOrigin: C },
        { opacity: 0, scale: 1.3, duration: 0.85, ease: 'power2.out' }, 2.2)
      .to(geo, { scale: 1.02, duration: 0.14, yoyo: true, repeat: 1, svgOrigin: C }, 2.2)
      .to(chips, { scaleY: 1, duration: 0.42, stagger: 0.12, ease: 'back.out(2.2)' }, 2.36)
      .to(wipe, { scaleX: 1, duration: 0.45, ease: 'none' }, 2.78);
  };

  /* --- 03 · WEBSITES · the page assembles, then somebody clicks it ---
     The grid unfolds down the card before anything sits on it, because that
     is the claim: the grid is what the blocks are being held to. Then the
     page builds in reading order, the headline set under a wipe so it reads
     as typed rather than faded, the two columns of copy filling one after the
     other so they read as two columns, and the button arriving last.

     Then the beat the card is actually for: a pointer comes in off the card,
     goes straight for the only thing there is to click, presses it, and stays
     on it. The still it leaves behind is the artifact as authored, pointer
     included.

     The baseline is scaled open rather than drawn for the same reason the
     construction grid in 02 is: those lines are dashed, and DrawSVG would
     end them solid. */
  ART.websites = (sa, tl) => {
    const base = $('.sa-base', sa);
    const mark = $('.sa-blocks .hdm', sa);
    const rule = $('.sa-blocks .hd', sa);
    const head = $('.sa-hl', sa);
    const wipe = $('.sa-wipe', sa);
    const copy = $$('.sa-copy rect', sa);
    const col1 = copy.slice(0, 3);
    const col2 = copy.slice(3);
    const cta = $('.sa-blocks .cta', sa);
    const ctaT = $('.sa-cta-t', sa);
    const pulse = $('.sa-pulse', sa);
    const cur = $('.sa-cur', sa);
    const lbls = $$('.sa-lbl', sa);
    const { p, at, place, park } = rider(cur);
    gsap.set(base, { opacity: 0, scaleY: 0.02, svgOrigin: '200 54' });
    gsap.set(mark, { opacity: 0, scale: 0, svgOrigin: '32.5 30.5' });
    gsap.set(rule, { opacity: 0, scaleX: 0, svgOrigin: '28 42' });
    gsap.set(head, { y: 10 });
    gsap.set(wipe, { scaleX: 0, svgOrigin: '24 56' });
    /* each hairline wipes from its own left edge, so the two columns read as
       two columns rather than as one sweep across the card */
    gsap.set(copy, { opacity: 0, scaleX: 0, svgOrigin: (i, t) => t.getAttribute('x') + ' ' + t.getAttribute('y') });
    gsap.set(cta, { opacity: 0, scale: 0.55, y: 22, svgOrigin: '94 207' });
    gsap.set([ctaT, ...lbls, cur], { opacity: 0 });
    park(436, 304, 0);
    tl.to(base, { opacity: 1, scaleY: 1, duration: 0.6 }, 0)
      .to(mark, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 0.35)
      .to(rule, { opacity: 1, scaleX: 1, duration: 0.5 }, 0.42)
      .to(wipe, { scaleX: 1, duration: 0.6, ease: 'none' }, 0.62)
      .to(head, { y: 0, duration: 0.6 }, 0.62)
      .to(col1, { opacity: 1, scaleX: 1, duration: 0.42, stagger: 0.07 }, 1.08)
      .to(col2, { opacity: 1, scaleX: 1, duration: 0.42, stagger: 0.07 }, 1.34)
      .to(cta, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)' }, 1.66)
      .to(ctaT, { opacity: 1, duration: 0.35 }, 1.9)
      .to(cur, { opacity: 1, duration: 0.2 }, 2.08)
      .to(p, { x: 196, y: 250, duration: 0.52, ease: 'power3.out', onUpdate: place }, 2.08)
      .to(p, { x: at.x, y: at.y, duration: 0.3, ease: 'power2.inOut', onUpdate: place }, 2.52)
      /* the press: the pointer dips, the button gives, the ring comes off it */
      .to(p, { y: at.y + 3, duration: 0.1, yoyo: true, repeat: 1, onUpdate: place }, 2.84)
      .to(cta, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 2.84)
      .fromTo(pulse, { opacity: 0.85, scale: 1, svgOrigin: '94 207' },
        { opacity: 0, scale: 1.3, duration: 0.7, ease: 'power2.out' }, 2.95)
      .to(lbls, { opacity: 1, duration: 0.4 }, 3.04);
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
