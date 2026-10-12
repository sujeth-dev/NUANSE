/* ============================================================================
   NUANSE — work/zingara.js · ONE signature element

   "The menu, re-set." Everything visual lives in work/zingara.css and is
   driven off a single custom property, --p, from 0 (before) to 1 (after).
   This file only decides what --p should be, which keeps the whole
   correction interpolating in CSS rather than in JavaScript.

   Three things can move it, in descending authority:

     1. the visitor, by dragging the stage or using the range input
     2. the keyboard, through that same range input
     3. one slow automatic sweep on first sight, as an invitation

   The moment the visitor takes the control, every automatic driver stops for
   good. An element that keeps moving after you have touched it feels broken.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, clamp } = NU;

  const zm = $('.zm');
  if (!zm) return;

  const stage = $('.zm-stage', zm);
  const range = $('.zm-range', zm);
  const lBefore = $('.zm-l-before', zm);
  const lAfter = $('.zm-l-after', zm);

  let p = 0;                 /* 0..1 */
  let taken = false;         /* the visitor has used the control */
  let sweeping = false;

  /* The one write. Everything else is CSS reading --p.
     `data-settled` is the one thing that cannot interpolate: a typeface
     swap. It flips once, past halfway, under cover of the cross-fade. */
  function setP(v, fromUser) {
    p = clamp(v, 0, 1);
    zm.style.setProperty('--p', p.toFixed(4));
    zm.dataset.settled = p > 0.5 ? '1' : '0';
    if (range && !fromUser) range.value = String(Math.round(p * 100));
    if (lBefore) lBefore.classList.toggle('is-on', p < 0.5);
    if (lAfter) lAfter.classList.toggle('is-on', p >= 0.5);
  }

  /* --- the visitor takes over --- */
  function claim() {
    taken = true;
    sweeping = false;
    if (window.gsap) gsap.killTweensOf(auto);
  }

  const auto = { p: 0 };

  /* dragging anywhere on the sheet, not just on the control: the menu is the
     thing you want to touch, so it is the thing that responds */
  let down = false;
  const fromEvent = (e) => {
    const r = stage.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };
  stage.addEventListener('pointerdown', (e) => {
    down = true;
    claim();
    stage.setPointerCapture(e.pointerId);
    setP(fromEvent(e));
  });
  stage.addEventListener('pointermove', (e) => { if (down) setP(fromEvent(e)); });
  ['pointerup', 'pointercancel'].forEach((t) =>
    stage.addEventListener(t, () => { down = false; }));

  /* the range input is the keyboard path and the accessible name */
  if (range) {
    range.addEventListener('input', () => { claim(); setP(+range.value / 100, true); });
    range.addEventListener('pointerdown', claim);
  }

  setP(RM ? 1 : 0);

  /* --- the invitation ---
     One slow sweep on first sight, wide enough to show both states and to
     explain what the control does. Not a twitch.

     Everything above this line is plain CSS and plain events, so the
     correction still drags and still answers the keyboard on a page where
     GSAP never loaded — only the unprompted sweep is lost. Under reduced
     motion the page simply presents the corrected menu and never animates. */
  if (!RM && !NU.dead) {
    NU.onBuild(() => {
      ScrollTrigger.create({
        trigger: zm,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          if (taken) return;
          sweeping = true;
          auto.p = 0;
          gsap.timeline({ onComplete: () => { sweeping = false; } })
            .to(auto, {
              p: 0.82, duration: 1.6, ease: NU.EASE,
              onUpdate: () => { if (!taken) setP(auto.p); }
            })
            .to(auto, {
              p: 0.18, duration: 1.1, ease: NU.EASE,
              onUpdate: () => { if (!taken) setP(auto.p); }
            }, '+=.45');
        }
      });

      /* The readout counts up once, like the home page's results. Figures
         here are facts about the work — items kept, faces removed, columns —
         not claimed outcomes, so they need no source note. */
      ScrollTrigger.create({
        trigger: '.zm-readout', start: 'top 88%', once: true,
        onEnter: () => {
          $$('.zm-readout b').forEach((el, i) => {
            const m = el.textContent.trim().match(/^(\d+)$/);
            if (!m) return;                       /* "4 → 1" stays as written */
            const target = +m[1];
            const o = { v: 0 };
            gsap.to(o, {
              v: target, duration: 0.9, delay: i * 0.12, ease: 'power2.out',
              onUpdate: () => { el.textContent = String(Math.round(o.v)); }
            });
          });
        }
      });
    });
  }
})();
