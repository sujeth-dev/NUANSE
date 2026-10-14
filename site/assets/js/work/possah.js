/* ============================================================================
   NUANSE — work/possah.js · ONE signature element

   "The voice, held." Everything visual lives in work/possah.css and runs off
   two custom properties, --x (soft 0 -> bold 1) and --y (playful 0 ->
   composed 1). This file only decides what those should be, which keeps the
   whole cross-fade interpolating in CSS rather than in JavaScript — the same
   division of labour as work/zingara.js.

   Three things can move the point, in descending authority:

     1. the visitor, by dragging the pad
     2. the keyboard, through the two range inputs
     3. one slow automatic drift on first sight, as an invitation

   The moment the visitor takes the control, every automatic driver stops for
   good. An element that keeps moving after you have touched it feels broken.

   Possah's own position is Bold + Composed, plotted at 0.75, 0.75 — which
   is where the tone-of-voice page of the guidelines puts it, and where this
   rests. The board does not place the mark in the corner, and neither
   does this.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, RM, clamp } = NU;

  const pv = $('.pv');
  if (!pv) return;

  /* Where the board plots the brand: inside the Bold + Composed quadrant,
     not at its corner. work/possah.css derives --drift from the same pair,
     so the two must stay in step. */
  const HX = 0.75;
  const HY = 0.75;

  const pad = $('.pv-pad', pv);
  const rx = $('.pv-x', pv);
  const ry = $('.pv-y', pv);
  const say = $('.pv-say', pv);

  let x = HX;
  let y = HY;
  let taken = false;

  /* The quadrant names are descriptions of the matrix, not claims about the
     brand. Only the Bold + Composed one is Possah's own, and the board says
     so in as many words. */
  function quadrant(qx, qy) {
    const bold = qx >= 0.5;
    const comp = qy >= 0.5;
    if (bold && comp) return ['bc', 'Bold + Composed'];
    if (bold && !comp) return ['bp', 'Bold + Playful'];
    if (!bold && comp) return ['sc', 'Soft + Composed'];
    return ['sp', 'Soft + Playful'];
  }

  let sayTimer = null;

  /* The two writes. Everything else is CSS reading --x and --y, including the
     drift that drives the cross-fade — CSS derives that with max(). */
  function setXY(nx, ny, fromUser) {
    x = clamp(nx, 0, 1);
    y = clamp(ny, 0, 1);
    pv.style.setProperty('--x', x.toFixed(4));
    pv.style.setProperty('--y', y.toFixed(4));

    const [key, label] = quadrant(x, y);
    pv.dataset.q = key;
    if (rx && fromUser !== 'x') rx.value = String(Math.round(x * 100));
    if (ry && fromUser !== 'y') ry.value = String(Math.round(y * 100));
    /* aria-valuetext rather than the raw number: "72" means nothing, "Bold"
       is the thing the control actually selects */
    if (rx) rx.setAttribute('aria-valuetext', x >= 0.5 ? 'Bold' : 'Soft');
    if (ry) ry.setAttribute('aria-valuetext', y >= 0.5 ? 'Composed' : 'Playful');

    /* The cross-fade is silent to a screen reader, so the state is also said
       in words — but only once the visitor has stopped moving. Announcing on
       every pointer sample would be unusable. */
    if (say) {
      /* the same one-sided Chebyshev drift work/possah.css derives; if these
         two disagree the page says one thing and shows another */
      const drift = Math.max(0, (HX - x) / HX, (HY - y) / HY);
      const which = drift > 0.5
        ? 'showing the lines the brand does not write'
        : 'showing the lines the brand writes';
      clearTimeout(sayTimer);
      sayTimer = setTimeout(() => { say.textContent = `${label}, ${which}.`; }, 400);
    }
  }

  function claim() {
    taken = true;
    if (window.gsap) gsap.killTweensOf(auto);
  }

  const auto = { x: HX, y: HY };

  /* --- dragging the pad --- */
  let down = false;
  const fromEvent = (e) => {
    const r = pad.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  };
  pad.addEventListener('pointerdown', (e) => {
    down = true;
    claim();
    pad.setPointerCapture(e.pointerId);
    setXY(...fromEvent(e));
  });
  pad.addEventListener('pointermove', (e) => { if (down) setXY(...fromEvent(e)); });
  ['pointerup', 'pointercancel'].forEach((t) =>
    pad.addEventListener(t, () => { down = false; }));

  /* --- the keyboard path --- */
  if (rx) {
    rx.addEventListener('input', () => { claim(); setXY(+rx.value / 100, y, 'x'); });
    rx.addEventListener('pointerdown', claim);
  }
  if (ry) {
    ry.addEventListener('input', () => { claim(); setXY(x, +ry.value / 100, 'y'); });
    ry.addEventListener('pointerdown', claim);
  }

  /* Possah's own position, and the resting state under reduced motion. */
  setXY(HX, HY);

  /* --- the invitation ---
     One slow drift away from the brand's corner and back, far enough to show
     that the lines change and that the point is draggable. Not a twitch.

     Everything above this line is plain CSS and plain events, so the matrix
     still drags and still answers the keyboard on a page where GSAP never
     loaded — only the unprompted drift is lost. Under reduced motion the page
     simply presents the brand at its own position and never animates. */
  if (!RM && !NU.dead) {
    NU.onBuild(() => {
      ScrollTrigger.create({
        trigger: pv,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          if (taken) return;
          auto.x = HX;
          auto.y = HY;
          const step = {
            duration: 1.5, ease: NU.EASE,
            onUpdate: () => { if (!taken) setXY(auto.x, auto.y); }
          };
          gsap.timeline()
            .to(auto, Object.assign({ x: 0.18, y: 0.3 }, step))
            .to(auto, Object.assign({}, step, { x: HX, y: HY, duration: 1.2 }), '+=.7');
        }
      });
    });
  }
})();
