/* ============================================================================
   NUANSE — home.js · the home page's seven sections

   Loaded after core.js and only by index.html. Everything here is specific to
   this page: the hero lens, the S hand-off, the manifesto letter, the pinned
   proof prints and their case overlay, the redline slider, the fanned service
   cards, the docking process panels, the team builder, and the audit.

   Nothing in this file is shared. If something here starts being imported by
   a second page, it belongs in core.js — see brief/02-project-pages.md.

   It registers through NU rather than racing core's boot: NU.onBuild for
   anything that creates a ScrollTrigger, NU.onIntro for the opener hand-off,
   NU.onReady for after the curtain has lifted.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, TOUCH, EASE, clamp, esc, wrapS, loopPath } = NU;

  /* ======================================================= 1 · HERO + LENS */
  const hero = $('#top');
  const lens = $('.hero .lens');
  const lensScale = $('.lens-scale');
  const lensToggle = $('.lens-toggle');
  const hintEl = $('.hero-hint');
  let heroS = null;
  let lensNotes = [];

  /* --- the headline, split by hand ---
     core.js splits every .h-split into masked words and wraps its S's. This
     one opts out (data-split="skip") because it is not a sentence that wraps:
     it is five written lines, and the second is a slot whose word changes. So
     the same two jobs are done here, per line, and the slot is left alone.

     The slot's own word is never S-wrapped. It is replaced four times a
     rotation and the lens clone is matched to the base glyph by index — a
     word list whose S count changes under that would quietly break the
     alignment check in wireHeroS. The turn belongs to the four lines that
     stay put. */
  const ROT_WORDS = ['identities', 'campaigns', 'websites', 'brands'];

  function splitHeadline() {
    const h = $('.hero .base .hero-h');
    if (!h || h.dataset.split === '1') return;
    h.dataset.split = '1';
    $$('.hl', h).forEach((line) => {
      const slot = $('.rot', line);
      if (slot) {
        /* the slot keeps its own span and gets one mask around it */
        const w = document.createElement('span');
        w.className = 'w';
        const wi = document.createElement('span');
        wi.className = 'wi';
        wi.appendChild(slot);
        w.appendChild(wi);
        line.textContent = '';
        line.appendChild(w);
        return;
      }
      line.innerHTML = line.textContent.trim().split(' ')
        .map((word) => `<span class="w" aria-hidden="true"><span class="wi">${wrapS(word)}</span></span>`)
        .join(' ');
    });
  }

  /* --- B2 · the word changes by ASCII flip ---
     The word used to leave out the top of its mask and the next one rise in
     from the bottom. It now stays put and changes character by character:
     normal type, dissolving into monospace glyph noise, resolving as the next
     word. Campaign to website happens through the glyphs, not through a move.

     Three things this has to respect, and each one shapes the code:

     - NOTHING below the slot may move. The slot is a line of its own, so its
       width is free, and line-height on .hero-h is a NUMBER — 0.92 of the
       element's own font-size — so swapping the serif for the mono mid-flip
       cannot change the line box either. The one way it could still move the
       page is by wrapping, which .hl-rot{white-space:nowrap} forbids.
     - Both slots take the same characters in the same frame. The lens is an
       opaque clone sitting on top of the base layer; two layers mid-flip on
       different random glyphs is the one thing that would give the device
       away. One render writes both.
     - The noise is never announced. The slot is aria-hidden and the h1 keeps
       an aria-label carrying the whole sentence with all four words in it, so
       a screen reader reads a sentence and never reads "#@$%".

     Each character gets its own window inside the flip, ordered by a shuffle
     rather than left to right: it corrupts at its rank and resolves at its
     rank past the midpoint, so the word comes apart and reassembles unevenly
     the way a signal does. */
  const NOISE = '#@$%&*/\\|<>+=~-_[]{}()01';
  let rotTl = null;
  let rotSync = null;

  function shuffled(n) {
    const a = [];
    for (let i = 0; i < n; i++) a.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function wireRotator() {
    /* both slots: the base layer's and the lens clone's. This runs after
       buildLens for that reason — a rotator wired before the clone exists
       would drive one layer and leave the other reading its first word for
       ever. */
    const slots = $$('.hero .rot');
    if (!slots.length) return;
    /* settled characters are the serif the headline is set in; the ones still
       in flight carry .gl and are set in the mono face */
    const draw = (chars, settled) => {
      let html = '';
      for (let i = 0; i < chars.length; i++) {
        if (!chars[i]) continue;
        html += settled[i] ? esc(chars[i]) : `<span class="gl">${esc(chars[i])}</span>`;
      }
      slots.forEach((s) => { s.innerHTML = html; });
    };
    /* The resolved word is S-wrapped, which it deliberately was not before.
       The old reason was real and is now gone: the lens clone used to be
       matched to the base layer glyph by glyph by index, so a word list whose
       S count changed under that would have broken the alignment check in
       wireHeroS. B4 deleted that mechanism — every S in the lens is turned in
       CSS now — and without it, leaving the slot unwrapped meant the s in
       "websites" was the one letter on the screen the lens did NOT turn.
       Mid-flip there is nothing to wrap, which is correct: a noise glyph is
       not a letter yet. */
    const plain = (word) => slots.forEach((s) => { s.innerHTML = wrapS(word); });
    plain(ROT_WORDS[0]);
    if (RM) return;                 /* one word, no flip; the label reads all four */

    const roll = () => NOISE.charAt((Math.random() * NOISE.length) | 0);

    rotTl = gsap.timeline({ repeat: -1, paused: true });
    ROT_WORDS.forEach((from, i) => {
      const to = ROT_WORDS[(i + 1) % ROT_WORDS.length];
      const n = Math.max(from.length, to.length);
      const order = shuffled(n);
      const st = { q: 0 };
      let drawn = -1;
      rotTl.fromTo(st, { q: 0 }, {
        q: 1, duration: 1.05, ease: 'none', immediateRender: false,
        /* Fourteen redraws across the flip and not sixty-three. Each redraw
           is an innerHTML of up to ten spans across two layers, and noise
           reads as noise at either rate. */
        onUpdate: () => {
          const step = (st.q * 14) | 0;
          if (step === drawn) return;
          drawn = step;
          const chars = [];
          const settled = [];
          for (let k = 0; k < n; k++) {
            const rank = order[k] / n;
            const out = 0.08 + rank * 0.34;        /* when this one corrupts */
            const back = 0.52 + rank * 0.40;       /* when it resolves       */
            if (st.q < out) { chars.push(from.charAt(k)); settled.push(true); }
            else if (st.q < back) { chars.push(roll()); settled.push(false); }
            else { chars.push(to.charAt(k)); settled.push(true); }
          }
          draw(chars, settled);
        },
        /* the flip ends on real text, not on a span soup one frame short */
        onComplete: () => { drawn = -1; plain(to); }
      }, '+=1.9');
    });

    /* One moving thing per screen: it sleeps when the hero is off-screen and
       when a pin has claimed the stage. */
    const sync = () => {
      if (!rotTl) return;
      if (NU.MOTION.hero && !NU.calm()) rotTl.play();
      else rotTl.pause();
    };
    NU.onIdleChange(sync);
    rotSync = sync;
  }

  function buildLens() {
    const baseInner = $('.hero .base .hero-inner');
    if (!baseInner || !lensScale) return;
    const clone = baseInner.cloneNode(true);
    /* the lens layer is decoration over a live layer, so nothing in it is
       focusable or announced — links and buttons become inert spans */
    $$('a,button', clone).forEach((a) => {
      const s = document.createElement('span');
      s.className = a.className;
      s.innerHTML = a.innerHTML;
      a.parentNode.replaceChild(s, a);
    });
    $$('[data-cursor]', clone).forEach((e) => e.removeAttribute('data-cursor'));
    /* the clone's h1 would be a second h1 in the document */
    const h1c = $('h1', clone);
    if (h1c) {
      const h1d = document.createElement('p');
      h1d.className = h1c.className;
      h1d.innerHTML = h1c.innerHTML;
      h1d.removeAttribute('aria-label');
      h1c.parentNode.replaceChild(h1d, h1c);
    }

    $('.hero-h-wrap', clone).insertAdjacentHTML('beforeend',
      '<span class="an an-h1">H1 · Gloock 400 · tracking −0.045em</span>' +
      '<span class="an an-h2">Cap height · 0.94 lead · balanced rag</span>' +
      '<span class="an an-h3">Every s the circle covers, turned.</span>');
    $('.hero-ctas', clone).insertAdjacentHTML('beforeend',
      '<span class="an an-cta">Copper · 3% of any page</span>');
    /* the grounds are classes, not style attributes — the CSP blocks those */
    clone.insertAdjacentHTML('beforeend',
      '<div class="swatches">' +
      '<span class="sw">Navy #0D1A41<i class="sw-navy"></i></span>' +
      '<span class="sw">Cream #FCF7F1<i class="sw-cream"></i></span>' +
      '<span class="sw">Copper #B56528<i class="sw-copper"></i></span>' +
      '</div>');
    lensScale.appendChild(clone);
    lensNotes = $$('.an,.swatches', lensScale);
    wireHeroS();
  }

  /* --- the hero's S, one letter at a time ---
     The base layer turns its own glyph on hover. This used to mark the clone's
     matching glyph too, by index, because the lens closed over the headline
     and the turn had to be visible on whichever layer you were looking at.
     B4 removed the reason: every S in the lens layer is turned in CSS now
     (`.lens .s{transform:scaleX(-1)}`, the reference's model), so the circle
     passing over a letter is what shows the turn. Marking the clone as well
     would be setting a class that changes nothing.

     What is left is the path for a visitor who is not moving the lens — the
     keyboard, and anyone who has latched the lens open with the button. One
     delegated listener on the headline rather than one per letter. */
  function wireHeroS() {
    const base = $('.hero .base .hero-h');
    if (!base) return;
    const mark = (e, on) => {
      const t = e.target;
      if (!t || !t.classList || !t.classList.contains('s')) return;
      /* the glyph you are pointing at, and nothing else on the line */
      t.classList.toggle('is-turn', on);
    };
    base.addEventListener('pointerover', (e) => mark(e, true));
    base.addEventListener('pointerout', (e) => mark(e, false));
  }

  const LR = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, locked: false };
  let lensUsed = false;
  let hintTimer = null;
  /* B4 · the lens is always live now, and pointer-driven: it follows with
     lag, grows a tenth on press, and after this long with no input it drifts
     on its own. The toggle it replaces is still here as a button, but it is
     no longer what opens the thing. */
  const LENS_IDLE = 2400;
  let lensAuto = true;
  let lensTicking = false;
  let lastInput = 0;
  let pressing = false;
  let heroWasOff = false;
  /* the reference's radius, to the figure: clamp(96px, heroWidth x .17, 190px) */
  const lensR = () => clamp(hero ? hero.clientWidth * 0.17 : 0, 96, 190);

  /* core's copper ring stands down inside the hero, because in here the lens
     IS the cursor. The class is `off` and deliberately not core's own `hide`:
     core.js's pointermove handler clears `hide` on an unconditional branch,
     so a ring hidden with it comes back the instant the visitor moves, which
     is exactly when the lens is live. `off` is one core never writes.
     It lands in core.css with A1; until then this toggles a class with no
     rule behind it, which costs nothing and breaks nothing. */
  const curEl = $('.cur');
  let curOffNow = false;
  function cursorOff(off) {
    if (!curEl || curOffNow === !!off) return;
    curOffNow = !!off;
    curEl.classList.toggle('off', curOffNow);
  }

  function retireHint() {
    if (!hintEl) return;
    clearTimeout(hintTimer);
    hintTimer = null;
    if (hintEl.dataset.gone) return;
    hintEl.dataset.gone = '1';
    if (RM) { hintEl.style.display = 'none'; return; }
    gsap.to(hintEl, { opacity: 0, duration: 0.5, onComplete: () => { hintEl.style.display = 'none'; } });
  }
  /* The annotations should not all land at once on the first look, so they
     fade in a beat after the lens opens — and the hint retires for good the
     moment it has been understood. */
  function lensFirstUse() {
    if (lensUsed) return;
    lensUsed = true;
    if (!RM && lensNotes.length) gsap.to(lensNotes, { opacity: 1, duration: 0.45, stagger: 0.04, delay: 0.18 });
    retireHint();
  }
  function applyLens() {
    lens.style.clipPath = `circle(${LR.r.toFixed(1)}px at ${LR.x.toFixed(1)}px ${LR.y.toFixed(1)}px)`;
    lensScale.style.transformOrigin = `${LR.x.toFixed(1)}px ${LR.y.toFixed(1)}px`;
  }

  /* The bubble recedes while the pointer is driving the lens and comes back
     when the lens is drifting on its own. `away` is a class, not a tween, so
     this still works with no GSAP. */
  function bubble(away) {
    if (!lensToggle) return;
    lensToggle.classList.toggle('away', !!away);
  }

  function wireLens() {
    if (!hero || !lens || !lensScale) return;
    if (!RM && lensNotes.length) gsap.set(lensNotes, { opacity: 0 });

    if (!RM && !TOUCH) {
      lensTicking = true;
      hintTimer = setTimeout(retireHint, 9000);
      /* the reference's own resting position, so the circle is somewhere
         deliberate on the first frame rather than at the top left corner */
      LR.x = LR.tx = hero.clientWidth * 0.62;
      LR.y = LR.ty = hero.clientHeight * 0.5;
      LR.tr = lensR() * 0.9;

      const target = (e) => {
        const b = hero.getBoundingClientRect();
        LR.tx = e.clientX - b.left;
        LR.ty = e.clientY - b.top;
      };
      /* The lens no longer closes over the headline. It used to, because an S
         under an opaque disc could not be seen to turn — but every S in the
         lens layer is turned in CSS now, so the circle crossing a line IS
         the turn. Closing it over the headline would hide the one place it
         has something to say.

         It DOES still close over the hero's controls, and this is the one
         place B4 departs from the reference. The reference's hero holds no
         buttons — a hint line and a label, nothing to press — so it never had
         to answer this. Ours holds two CTAs and the lens button. The lens is
         opaque and the clone inside it is inert spans, so a hovered button
         shows its hover state on the layer underneath, where the circle is
         covering it: you would be pressing a control that had stopped
         answering. Over a control the lens yields and the native cursor comes
         back, which is the whole of the carve-out — everywhere else in the
         hero the lens is the cursor, as the item asks. */
      hero.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' && !pressing) return;
        target(e);
        const onCtl = !!(e.target && e.target.closest && e.target.closest('.btn,.lens-toggle'));
        if (onCtl && !LR.locked) {
          LR.tr = 0;
          lensAuto = false;
          lastInput = performance.now();
          cursorOff(false);
          bubble(false);
          return;
        }
        if (!LR.locked) LR.tr = pressing ? lensR() * 1.1 : lensR();
        lensAuto = false;
        lastInput = performance.now();
        cursorOff(true);
        bubble(true);
      });
      /* pressing grows it a tenth — the reference's one gesture */
      hero.addEventListener('pointerdown', (e) => {
        if (e.target && e.target.closest && e.target.closest('.lens-toggle')) return;
        pressing = true;
        target(e);
        if (!LR.locked) LR.tr = lensR() * 1.1;
        lensAuto = false;
        lastInput = performance.now();
      });
      /* on the window and not on the hero: a press that ends outside it has
         still ended, and a lens left at 1.1 for ever is a bug you only find
         by dragging off the screen */
      window.addEventListener('pointerup', () => {
        pressing = false;
        if (!LR.locked && !lensAuto) LR.tr = lensR();
      });
      hero.addEventListener('pointerleave', () => {
        pressing = false;
        /* leaving is going still, only sooner: hand it to the drift now
           rather than waiting out the idle */
        lastInput = performance.now() - LENS_IDLE;
        cursorOff(false);
        bubble(false);
      });

      gsap.ticker.add(() => {
        /* the lens stops clipping once the hero is off-screen: the single
           most expensive thing on the page when idle */
        if (!NU.MOTION.hero) {
          heroWasOff = true;
          if (LR.r !== 0 || LR.tr !== 0) { LR.r = 0; LR.tr = 0; applyLens(); }
          return;
        }
        const now = performance.now();
        /* Coming back from off-screen, the target was zeroed on the way out
           and has to be restored — to the right one for the state we are in,
           or a latched lens stays shut for good once the hero has scrolled
           away and come back.

           Restored ONCE, on the frame of the return, and not whenever the
           target happens to be zero. A radius target of zero is also how the
           lens yields over a control, and a blanket `if (LR.tr === 0)` here
           reopened it on the very next frame — so the carve-out above would
           have done nothing at all. */
        if (heroWasOff) {
          heroWasOff = false;
          LR.tr = LR.locked
            ? Math.hypot(hero.clientWidth, hero.clientHeight)
            : lensR() * 0.9;
        }
        if (!LR.locked) {
          if (lensAuto || now - lastInput > LENS_IDLE) {
            lensAuto = true;
            /* B4 · the drift. Two sines of different period over the hero's
               own box, so the path does not read as a circle and does not
               depend on the window being the same shape as the section. The
               figures are the reference's. */
            const t = now / 1000;
            const w = hero.clientWidth;
            const h = hero.clientHeight;
            LR.tx = w * (0.56 + 0.30 * Math.sin(t * 0.42));
            LR.ty = h * (0.50 + 0.22 * Math.sin(t * 0.71 + 1));
            LR.tr = lensR() * 0.9;
          }
        }
        if (LR.r > 40) lensFirstUse();
        LR.x += (LR.tx - LR.x) * 0.12;
        LR.y += (LR.ty - LR.y) * 0.12;
        LR.r += (LR.tr - LR.r) * 0.08;
        applyLens();
      });
    }

    /* The bubble is also the button, and D2 kept it. On a fine pointer the
       lens needs no control at all — it is live and it drifts — so what the
       button is FOR is touch, where there is no hover, and the keyboard,
       where there is no pointer. Latched, it opens over the whole hero, which
       is the one state in which the annotations and the swatches can be read
       at leisure; clicking again hands the lens back to the pointer, or to
       the drift. The label is the review's own words. */
    let lensOn = false;
    if (lensToggle) {
      lensToggle.addEventListener('click', () => {
        lensOn = !lensOn;
        LR.locked = lensOn;
        bubble(false);
        if (lensOn) lensFirstUse();
        lensToggle.setAttribute('aria-pressed', String(lensOn));
        lensToggle.classList.toggle('on', lensOn);
        $('span', lensToggle).textContent = lensOn ? 'Close' : 'Click here';
        const b = hero.getBoundingClientRect();
        if (RM) {
          lens.style.clipPath = 'none';
          gsap.to(lens, { autoAlpha: lensOn ? 1 : 0, duration: 0.35, ease: 'none' });
          return;
        }
        if (lensOn) {
          /* it opens from the bubble itself, wherever the bubble is */
          const t = lensToggle.getBoundingClientRect();
          LR.x = LR.tx = t.left - b.left + t.width / 2;
          LR.y = LR.ty = t.top - b.top + t.height / 2;
          LR.tr = Math.hypot(b.width, b.height);
        } else {
          /* there is no closed state on a fine pointer any more, so
             unlatching returns it to the drift rather than to nothing */
          lensAuto = true;
          lastInput = performance.now() - LENS_IDLE;
          LR.tr = lensTicking ? lensR() * 0.9 : 0;
        }
        /* With the ticker running, the lerp is the only driver and a tween
           would fight it for the radius. Without it — on touch, where the
           whole branch above is never wired — the tween is the only thing
           that can move it. */
        if (lensTicking) return;
        const st = { r: LR.r };
        gsap.to(st, {
          r: LR.tr,
          duration: 1.1,
          onUpdate: () => { LR.r = st.r; applyLens(); }
        });
      });
    }
    if (RM) gsap.set(lens, { autoAlpha: 0, clipPath: 'none' });
  }

  /* --- the hero intro: words rise out of their masks --- */
  let heroIntroDone = false;
  function heroIntro() {
    if (heroIntroDone) return;
    heroIntroDone = true;
    if (RM) { gsap.from('.hero', { opacity: 0, duration: 0.6, ease: 'none' }); return; }
    /* base and lens copies run together, so the lens never shows text at a
       different point in the reveal than the layer under it */
    const bw = $$('.hero .base .wi');
    const lw = $$('.hero .lens .wi');
    const bits = $$('.hero .hero-ctas, .lens-toggle');
    gsap.timeline()
      .to(bw, { yPercent: 0, rotation: 0, duration: 1.1, stagger: 0.06 }, 0)
      .to(lw, { yPercent: 0, rotation: 0, duration: 1.1, stagger: 0.06 }, 0)
      .to(bits, {
        opacity: 1, duration: 0.9, stagger: 0.08,
        /* The intro leaves an inline opacity:1 behind, and an inline style
           outranks .lens-toggle.away — so the bubble would never recede
           again. Hand the property back to the stylesheet. */
        onComplete: () => { if (lensToggle) gsap.set(lensToggle, { clearProps: 'opacity' }); }
      }, 0.6);
  }

  /* ======================================= the S hand-off, hero -> nav slot
     The one place the live letter and the real mark meet. The flyer starts as
     the hero's glyph and cross-fades to the asset at 0.45s of a 1.1s travel —
     mid-flight, under cover of the scale change. Swapping at the endpoint
     pops, because the two silhouettes are not the same shape. */
  const flyer = $('.flyer');
  const flyIn = $('.fly-in');
  const flyLo = $('.fly-lo');
  const flyUp = $('.fly-up');
  const navSlot = NU.navSlot;
  const navMark = NU.navMark;
  let markState = 'hero';
  let flyTl = null;

  const spinRot = () => (NU.navSpin ? +gsap.getProperty(NU.navSpin, 'rotation') || 0 : 0);

  /* The flight belongs to the screens that have a wordmark beside the slot.
     Below 900px core.css hides the wordmark, the mark is the entire brand,
     and a slot that stays empty until you scroll is simply a nav with no logo
     in it. Same line as the media query in core.css. */
  const flies = () => window.innerWidth > 900;

  function fly(toNav) {
    if (!heroS || !flyer || !navSlot || !navMark) return;
    if (!flies()) {
      markState = toNav ? 'nav' : 'hero';
      navMark.style.opacity = 1;
      navSlot.classList.add('filled');
      return;
    }
    const want = toNav ? 'nav' : 'hero';
    if (markState === want) return;
    markState = want;
    if (flyTl) flyTl.kill();

    if (RM) {
      gsap.to(navMark, { opacity: toNav ? 1 : 0, duration: 0.4, ease: 'none' });
      navSlot.classList.toggle('filled', toNav);
      return;
    }

    const r1 = heroS.getBoundingClientRect();
    const r2 = navSlot.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(heroS).fontSize);
    const sc = (r2.height * 1.15) / r1.height;
    const heroPos = { x: r1.left, y: r1.top, scale: 1, rotation: 0 };
    const navPos = {
      x: r2.left + r2.width / 2 - r1.width / 2,
      y: r2.top + r2.height / 2 - r1.height / 2,
      scale: sc, rotation: spinRot()
    };
    gsap.set(flyer, { display: 'block', width: r1.width, height: r1.height, fontSize: fs });

    flyTl = gsap.timeline();
    if (toNav) {
      heroS.style.visibility = 'hidden';
      navMark.style.opacity = 0;
      gsap.set(flyer, heroPos);
      gsap.set(flyIn, { scaleX: 1 });
      gsap.set(flyer, { color: getComputedStyle(heroS).color });
      gsap.set(flyLo, { opacity: 1 });
      gsap.set(flyUp, { opacity: 0 });
      flyTl
        .to(flyer, { x: navPos.x, y: navPos.y, scale: navPos.scale, rotation: navPos.rotation, duration: 1.1 })
        .to(flyIn, { scaleX: -1, duration: 0.8 }, 0.15)
        .to(flyLo, { opacity: 0, duration: 0.4 }, 0.45)
        .to(flyUp, { opacity: 1, duration: 0.4 }, 0.45)
        .add(() => {
          navMark.style.opacity = 1;
          navSlot.classList.add('filled');
          gsap.set(flyer, { display: 'none' });
        });
    } else {
      navMark.style.opacity = 0;
      navSlot.classList.remove('filled');
      gsap.set(flyer, navPos);
      gsap.set(flyIn, { scaleX: -1 });
      gsap.set(flyLo, { opacity: 0 });
      gsap.set(flyUp, { opacity: 1 });
      flyTl
        .to(flyer, { x: heroPos.x, y: heroPos.y, scale: 1, rotation: 0, duration: 1.1 })
        .to(flyIn, { scaleX: 1, duration: 0.8 }, 0.15)
        .to(flyUp, { opacity: 0, duration: 0.4 }, 0.45)
        .to(flyLo, { opacity: 1, duration: 0.4 }, 0.45)
        .add(() => {
          heroS.style.visibility = '';
          gsap.set(flyer, { display: 'none' });
        });
    }
  }

  /* ======================================================== 3 · MANIFESTO */
  const letter = $('.letter');
  function splitLetter() {
    if (!letter) return;
    const walker = document.createTreeWalker(letter, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach((t) => {
      if (!t.nodeValue.trim()) return;
      if (t.parentNode.closest('.letter-meta,.letter-sign')) return;
      const inHead = !!t.parentNode.closest('.letter-h');
      const frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        const sp = document.createElement('span');
        sp.className = 'mw';
        if (inHead) sp.innerHTML = wrapS(p);
        else sp.textContent = p;
        frag.appendChild(sp);
      });
      t.parentNode.replaceChild(frag, t);
    });
    /* the copper underline runs under a whole phrase, not word by word */
    $$('.key', letter).forEach((k) => {
      const ws = $$('.mw', k);
      ws.forEach((w, i) => {
        w.classList.add('kw');
        if (i < ws.length - 1) { w.style.paddingRight = '.3em'; w.style.marginRight = '-.3em'; }
      });
    });
  }

  /* B5 · how far the envelope settles so the whole letter can be read.

     Measured, not chosen. The letter's height depends on its content and on
     how it wraps; the front flap's top edge is a V, so its height over the
     letter's left and right edges is not its height at the centre; and both
     change with the window. Every number here comes from offset geometry,
     which ignores transforms — so it is safe to read while the timeline that
     transforms these same elements is being built, and safe to re-read on a
     ScrollTrigger refresh. */
  function envSettle() {
    const stage = $('.mf-stage');
    const front = $('.env-front');
    if (!stage || !front || !letter) return 0;
    const lh = letter.offsetHeight;
    const letterBottom = (stage.clientHeight - lh) / 2 + lh;   /* grid-centred */
    const fw = front.offsetWidth || 1;
    const inset = Math.max(0, (fw - letter.offsetWidth) / 2) / fw;
    const notch = front.offsetHeight * 0.52 * Math.min(inset / 0.5, 1);
    /* downwards only: the envelope settles, it never rises to meet the letter */
    return Math.max(0, letterBottom + 14 - (front.offsetTop + notch));
  }

  /* ========================================================== 2 · MARQUEE */
  const mqTrack = $('.mq-track');
  function buildMarquee() {
    if (!mqTrack) return;
    mqTrack.appendChild($('.mq-set', mqTrack).cloneNode(true));
  }

  /* ================================================== 4c · THE CLIENT STRIP
     Twelve clients on a strip that keeps moving (H4). Built the way the
     disciplines marquee is — one set, cloned once, translated, wrapped — with
     three differences that each answer something the marquee does not have to:

     - the clone is aria-hidden. These are twelve real client names, and a
       screen reader reading the roster twice is a worse page, not a longer one;
     - the rail stops while the pointer is on it. The strip carries no links,
       but a name you are leaning in to read should hold still;
     - nothing is cloned at all under reduced motion or with GSAP blocked, and
       .is-rolling is never added, so the track keeps the wrapping layout it
       has in CSS and the twelve read as a block. There is no second markup
       and no put-back path — the still version is the default one. */
  const clTrack = $('.cl-track');
  let clPaused = false;
  function buildClients() {
    if (!clTrack || RM) return;
    const set = $('.cl-set', clTrack);
    if (!set) return;
    const twin = set.cloneNode(true);
    twin.setAttribute('aria-hidden', 'true');
    clTrack.appendChild(twin);
    clTrack.classList.add('is-rolling');
    /* Pause, and why it is two pairs of events rather than one.

       pointerenter/leave is the pointer answer: a name you are leaning in to
       read holds still. Touch has no hover, so it gets press-and-hold on the
       same element — which is also the only mechanism a touch visitor has for
       WCAG 2.2.2, the strip being content that moves by itself for longer
       than five seconds. Reduced motion is the other answer and the complete
       one: there, nothing is cloned and nothing ever moves. */
    const rail = clTrack.parentElement;
    const hold = (on) => () => { clPaused = on; };
    rail.addEventListener('pointerenter', hold(true));
    rail.addEventListener('pointerleave', hold(false));
    rail.addEventListener('pointerdown', hold(true));
    rail.addEventListener('pointerup', hold(false));
    rail.addEventListener('pointercancel', hold(false));
  }

  /* ============================================ the annotation loop shapes
     The loop itself is NU.loopPath: the work index draws the proof prints
     with the same hand. */
  function buildRedlines() {
    $$('.ra').forEach((a) => {
      const vertical = a.classList.contains('r');
      const path = $('path', a);
      path.setAttribute('d', vertical ? loopPath(20, 60, 17, 55) : loopPath(60, 20, 55, 16));
      path.setAttribute('vector-effect', 'non-scaling-stroke');
    });
  }

  /* ======================================================= 5 · REDLINE SLIDER */
  const stage = $('.rl-stage');
  const after = $('.mm-after');
  const handle = $('.rl-handle');
  const range = $('.rl-range');
  let annos = [];
  let pos = 10;
  let dragged = false;
  let rlDrift = null;
  let rlBase = null;
  let rlSweeping = false;
  let beforeFidget = null;

  function writeOn(a) {
    if (a.li) a.li.classList.add('on');
    if (RM) {
      gsap.set(a.path, { drawSVG: '100%' });
      a.t.textContent = a.txt;
      gsap.to([a.badge, a.t], { opacity: 1, scale: 1, duration: 0.3, ease: 'none' });
      return;
    }
    gsap.to(a.path, { drawSVG: '100%', duration: 0.8 });
    gsap.to(a.badge, { opacity: 1, scale: 1, duration: 0.6, delay: 0.2 });
    gsap.set(a.t, { opacity: 1 });
    const o = { c: 0 };
    gsap.to(o, {
      c: a.txt.length, duration: 0.7, delay: 0.25, ease: 'none',
      onUpdate: () => { a.t.textContent = a.txt.slice(0, Math.round(o.c)); }
    });
  }
  function unwrite(a) {
    if (a.li) a.li.classList.remove('on');
    gsap.killTweensOf([a.path, a.badge, a.t]);
    gsap.to(a.path, { drawSVG: '0%', duration: 0.5 });
    gsap.to([a.badge, a.t], { opacity: 0, duration: 0.4, onComplete: () => { a.t.textContent = ''; } });
  }
  function setPos(p) {
    pos = clamp(p, 0, 100);
    after.style.clipPath = `inset(0 ${(100 - pos).toFixed(2)}% 0 0)`;
    handle.style.left = `${pos.toFixed(2)}%`;
    if (range) range.value = String(Math.round(pos));
    annos.forEach((a) => {
      const on = pos >= a.x;
      if (on !== a.on) { a.on = on; if (on) writeOn(a); else unwrite(a); }
    });
  }
  function syncBefore() {
    if (!beforeFidget) return;
    if (NU.MOTION.rl && !NU.calm()) beforeFidget.play();
    else beforeFidget.pause();
  }

  /* The home page now carries a STILL of this, not the control. The full
     interaction moved to work/zingara.html, where it is that page's one
     signature element and has room to be the argument rather than a widget.
     What stays here is the part that makes the point without a control: the
     before fidgets, the after never moves, and the redlines write on.

     B6 changed what the two halves SHOW — a brand sheet with no brand design
     and the same business structured, both invented — and nothing about how
     the wipe, the rule or the three annotations work. The Zingara menu it
     used to show belongs to Zingara's case page, which is where it now
     appears and nowhere else. */
  const isStatic = !!(stage && stage.classList.contains('rl-static'));

  function wireRedline() {
    if (!stage || !after || !handle) return;
    annos = $$('.ra').map((a, i) => ({
      el: a, x: +a.dataset.x, txt: a.dataset.txt, on: false,
      path: $('path', a), badge: $('.badge', a), t: $('.t', a), li: $$('.rl-fixes li')[i]
    }));
    annos.forEach((a) => gsap.set(a.path, { drawSVG: '0%' }));
    /* a split that shows enough of both to be legible at a glance */
    setPos(isStatic ? 52 : 10);

    /* The 'before' cannot sit still — four typefaces, five colours and a
       GRAND OPENING burst. The 'after' never moves. That is the whole
       argument, made without a word of copy.

       B6 moved what fidgets along with the subject. The two logos are the
       new ones: type stretched to fit its space is never stretched to the
       same amount twice, which is the symptom the annotation at A is
       pointing at, and animating the scaleX is the shortest way to say so. */
    if (!RM) {
      const burst = $('.mm-before .burst');
      const logo = $('.mm-before .bt');
      const card = $('.mm-before .bcard');
      const chips = $$('.mm-before .bchips i');
      beforeFidget = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: 'sine.inOut' } });
      if (burst) beforeFidget.to(burst, { rotation: '+=2.6', duration: 2.2 }, 0);
      if (logo) beforeFidget.to(logo, { scaleX: 1.5, duration: 2.6 }, 0);
      if (card) beforeFidget.to(card, { scaleX: 1.22, duration: 3.1 }, 0);
      chips.forEach((c, i) => {
        beforeFidget.to(c, { x: (i % 2 ? 1 : -1) * (1.2 + i * 0.4), duration: 1.7 + i * 0.2 }, 0);
      });
      if (!beforeFidget.getChildren().length) beforeFidget = null;
    }

    if (isStatic) return;          /* no control, so nothing to drag */

    let down = false;
    const fromEvent = (e) => {
      const r = stage.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    };
    stage.addEventListener('pointerdown', (e) => {
      if (e.target === range) return;
      down = true;
      dragged = true;
      rlSweeping = false;      /* the visitor has the handle; drivers stop for good */
      stage.setPointerCapture(e.pointerId);
      setPos(fromEvent(e));
    });
    stage.addEventListener('pointermove', (e) => { if (down) setPos(fromEvent(e)); });
    ['pointerup', 'pointercancel'].forEach((t) => stage.addEventListener(t, () => { down = false; }));
    range.addEventListener('input', () => { dragged = true; setPos(+range.value); });
  }

  /* ============================================ 9 · AUDIT: annotation trail

     "Find the detail" has to reveal details worth finding. These are the
     things an audit actually looks at — the type, the colour discipline, the
     surfaces a mark has to survive, the drawing, and the listings most
     brands forget they own. Every one of them is either true of this page or
     documented in a client's kit; none is decoration.

     The pool is grouped so consecutive marks differ in kind. Sweeping the
     section should feel like being shown around a system, not like watching
     one list repeat. */
  const MARK_SETS = [
    ['type', [['Gloock 400', ''], ['Plex Mono · +0.14em', ''], ['0.94 lead', ''],
      ['−0.02em', ''], ['Kerning', ''], ['46ch', '']]],
    ['colour', [['#B56528', ''], ['Copper · 3%', ''], ['#0D1A41', ''],
      ['60 / 20 / 10', ''], ['✓', 'big']]],
    ['app', [['Menu', ''], ['Packaging', ''], ['Signage', ''],
      ['Delivery bag', ''], ['Card · 20mm', ''], ['Favicon 32px', '']]],
    ['design', [['Clear space', ''], ['Optical centre', ''], ['Grid · 12', ''],
      ['Baseline', ''], ['→', 'big']]],
    ['listing', [['Google Maps', ''], ['Swiggy', ''], ['Zomato', ''],
      ['Petpooja', ''], ['A', 'ring'], ['B', 'ring'], ['C', 'ring']]]
  ];
  function wireTrail() {
    const auditSec = $('#audit');
    const trail = $('.trail');
    if (!auditSec || !trail || TOUCH || RM) return;
    let lx = -999;
    let ly = -999;
    let mi = 0;
    /* walk the categories round-robin, and each category's own list in turn,
       so nothing repeats until everything has been seen once */
    const cursors = MARK_SETS.map(() => 0);
    function nextMark() {
      const si = mi++ % MARK_SETS.length;
      const [cat, list] = MARK_SETS[si];
      const m = list[cursors[si]++ % list.length];
      return [m[0], `${m[1]} tm-${cat}`.trim()];
    }
    auditSec.addEventListener('pointermove', (e) => {
      const r = auditSec.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - lx, y - ly) < 120) return;
      lx = x;
      ly = y;
      const m = nextMark();
      const el = document.createElement('span');
      el.className = `tmark ${m[1]}`;
      el.textContent = m[0];
      trail.appendChild(el);
      gsap.set(el, { x, y, xPercent: -50, yPercent: -50, rotation: gsap.utils.random(-14, 14) });
      gsap.timeline({ onComplete: () => el.remove() })
        .fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2 })
        .to(el, { opacity: 0, y: '-=14', duration: 0.4 });
    });
  }

  /* ============================================ 9 · the audit, moved out
     The engine that used to be here — QS, renderQ, renderResult, openAudit
     and closeAudit — is site/assets/js/audit.js as of 2026-10-20, item A5.
     It had to move because it only existed on this page and the new contact
     page carries the audit too; its styles made the same trip out of
     home.css into core.css. index.html loads audit.js after this file.

     The annotation trail above (MARK_SETS, wireTrail) deliberately did NOT
     go with it. It is the hero-adjacent flourish on this page's audit
     section, not part of the questionnaire, and no second page wants it.

     Session A's edit, in session B's file, declared on the board before and
     in the commit message. Nothing else in home.js was touched: the three
     lines that wired the modal came out of the tail below, and the hero's
     onIntro/onReady/onResize registrations beside them are untouched. */

  /* ===================================================== the no-GSAP floor
     Everything above this line that touches the DOM needs no animation
     library, so it runs either way. The two builders that used to run here -
     the team portraits and the proof photographs - went with their sections
     to team.js and proofs.js, and each one still runs above that file's
     own guard for the same reason. */
  if (NU.dead) return;                  /* no GSAP: core already lifted the curtain */

  /* this page's three extra copper-foil grounds. The loupe's is the one with
     no copper in it: see the 'lens' preset in core.js for why. */
  NU.FOIL.add('.hero-foil', 'hero');
  NU.FOIL.add('.lens-foil', 'lens');
  NU.FOIL.add('.audit-foil', 'audit');
  /* onToggle only fires on a change, so without this the audit ground would
     draw forever on a visit that never scrolls that far */
  NU.FOIL.setActive('audit', false);
  NU.FOIL.start();

  /* ========================================================== build phase */
  NU.onBuild(() => {
    /* order matters: the headline is split before the lens clones it, so the
       clone carries the same masks and the same slot; the letter is split
       before its pin reads word positions */
    splitHeadline();
    buildLens();
    wireRotator();
    wireLens();
    splitLetter();
    buildMarquee();
    buildClients();
    buildRedlines();
    wireRedline();
    wireTrail();

    heroS = $('.hero .base .hero-h .s');

    /* the hero's words start below their masks */
    if (!RM) {
      gsap.set($$('.hero .wi'), { yPercent: 115, rotation: 2 });
      gsap.set($$('.hero .hero-ctas, .lens-toggle'), { opacity: 0 });
    }

    /* --- 3 · MANIFESTO: the letter rises out of the envelope and sharpens --- */
    const words = $$('.mw', letter);
    if (!RM && words.length) {
      /* Desktop gets the per-word blur sharpen. Touch gets a plain opacity
         fade instead: 140 simultaneous blur filters is the one thing phones
         genuinely choke on, and it is a detail nobody loses on a small
         screen. */
      const SHARPEN = !TOUCH;
      if (SHARPEN) gsap.set(words, { opacity: 0.12, filter: 'blur(6px)' });
      else gsap.set(words, { opacity: 0.12 });
      const envs = [$('.env-back'), $('.env-front')];
      const mtl = gsap.timeline({ defaults: { ease: EASE } });
      /* B5 · the envelope does not vanish any more.

         It used to travel 78% of the window downwards as the letter rose,
         which cleared the letter by removing the envelope from the screen.
         Now it settles by exactly the distance that clears the letter's own
         box — envSettle() measures it — and holds there for the whole read.
         Same timing, same curve, a destination instead of an exit. */
      mtl.fromTo(letter, { y: () => window.innerHeight * 0.46, rotation: -2 }, { y: 0, rotation: 0, duration: 0.85 }, 0)
        .fromTo(envs, { y: 0 }, { y: envSettle, duration: 0.75 }, 0.25);
      /* The reading starts before the letter has finished landing, so the two
         overlap and nothing ever stops moving — hence .6 over 1.15s rather
         than .75 over 1.6s. */
      const each = 1.15 / words.length;
      if (SHARPEN) mtl.to(words, { opacity: 1, filter: 'blur(0px)', duration: 0.3, stagger: each, ease: 'none' }, 0.6);
      else mtl.to(words, { opacity: 1, duration: 0.3, stagger: each, ease: 'none' }, 0.6);
      $$('.key', letter).forEach((k) => {
        const kws = $$('.kw', k);
        const last = words.indexOf(kws[kws.length - 1]);
        mtl.to(kws, { backgroundSize: '100% 1.5px', duration: 0.25, stagger: 0.06 }, 0.6 + last * each + 0.15);
      });
      mtl.to({}, { duration: 0.1 });
      /* scrub:1 runs a full second behind the wheel and Lenis is already
         smoothing on top of that; two lags stacked is what reads as stuck.
         .45 still feels eased but answers you. */
      ScrollTrigger.create({
        trigger: '#manifesto', start: 'top top', end: '+=115%', pin: '.mf-stage',
        scrub: 0.45, animation: mtl, invalidateOnRefresh: true, onToggle: NU.pinClaim
      });

      /* B5, the second half · scrolling on, it travels into the next
         section's blue field and disappears there.

         The next section is .work, on --night. Getting there means leaving
         .mf-stage, which clips its children AND carries a transform once
         ScrollTrigger has unpinned it — and a transformed ancestor is the
         containing block for a fixed descendant, so position:fixed alone
         would not escape it. So the two halves are reparented into a fixed
         container on the body for the flight, and put back on the way up.

         The seam is free: 'bottom bottom' on #manifesto is the same scroll
         position as the pin's own release, because the pin spacer makes the
         section 115% taller than the viewport and the stage is exactly one
         viewport tall. At that instant .mf-stage's top IS the viewport top,
         so a fixed box at inset:0 is the same box the stage was, and the swap
         has nothing to show.

         The wrapper is what moves, not the halves — they are still holding
         the y that mtl gave them, and two timelines fighting over one
         transform is how a seam like this usually breaks. */
      const envFly = document.createElement('div');
      envFly.className = 'env-fly';
      envFly.setAttribute('aria-hidden', 'true');
      document.body.appendChild(envFly);
      const stageEl = $('.mf-stage');
      const back = envs[0];
      const front = envs[1];
      if (stageEl && back && front) {
        /* captured before anything moves: where each half goes home to */
        const afterBack = back.nextSibling;
        const afterFront = front.nextSibling;
        let flying = false;
        const toFly = (on) => {
          if (!!on === flying) return;
          flying = !!on;
          if (flying) { envFly.appendChild(back); envFly.appendChild(front); }
          else {
            stageEl.insertBefore(back, afterBack);
            stageEl.insertBefore(front, afterFront);
          }
        };
        const ftl = gsap.timeline({ paused: true })
          .fromTo(envFly, { y: 0, opacity: 1 },
            { y: () => window.innerHeight * 0.78, duration: 1, ease: 'none' }, 0)
          /* it reaches the blue before it goes, rather than fading on the way */
          .to(envFly, { opacity: 0, duration: 0.45, ease: 'none' }, 0.55);
        ScrollTrigger.create({
          trigger: '#manifesto', start: 'bottom bottom', end: 'bottom top',
          scrub: 0.45, animation: ftl, invalidateOnRefresh: true,
          onToggle: (sT) => toFly(sT.isActive)
        });
      }
    } else if (RM && words.length) {
      /* reduced motion still has to reach the final state */
      gsap.set(words, { opacity: 1, filter: 'none' });
      $$('.kw', letter).forEach((k) => gsap.set(k, { backgroundSize: '100% 1.5px' }));
      /* B5 under reduced motion, and this was wrong before the item was
         raised: with no timeline to move anything, the envelope sat at y:0
         with the front flap across the letter's lower third, and the letter
         was unreadable to exactly the visitor who had asked for no motion.
         The settle is a position, not an animation, so it applies here too.
         There is no flight on this path — the envelope is present for the
         read and leaves with the section, which is what it should do when
         the request is that nothing travel. */
      gsap.set([$('.env-back'), $('.env-front')], { y: envSettle() });
    }

    /* --- the S hand-off --- */
    ScrollTrigger.create({
      start: () => window.innerHeight * 0.22, end: 'max',
      onEnter: () => fly(true), onLeaveBack: () => fly(false)
    });

    /* --- 2 · MARQUEE: skews with scroll speed, eases back to straight --- */
    if (!RM && mqTrack) {
      const setW = $('.mq-set', mqTrack);
      let mx = 0;
      let vel = 0;
      let dir = 1;
      const skewTo = gsap.quickTo(mqTrack, 'skewX', { duration: 0.6, ease: EASE });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: (s) => { vel = s.getVelocity(); dir = s.direction; },
        onToggle: (s) => { NU.MOTION.mq = s.isActive; if (!s.isActive) { vel = 0; skewTo(0); } }
      });
      gsap.ticker.add((time, dt) => {
        if (!NU.MOTION.mq || NU.calm()) return;     /* sleeps off-screen and under a pin */
        const w = setW.offsetWidth;
        if (!w) return;
        const boost = Math.min(Math.abs(vel) / 350, 2);
        mx -= dir * (48 + 48 * boost) * dt / 1000;
        if (mx <= -w) mx += w;
        if (mx > 0) mx -= w;
        gsap.set(mqTrack, { x: mx });
        skewTo(clamp(-vel / 220, -6, 6));
        vel *= 0.9;
        if (Math.abs(vel) < 1) vel = 0;
      });
    }

    /* --- 4c · THE CLIENT STRIP: rolls while it is on screen ---
       34px/s, against the marquee's 46 plus its scroll boost. The marquee is
       six words in Gloock at 112px and it is meant to be felt rather than
       read; this is twelve client names, and a name going past faster than
       you can read it is the opposite of what the note asked for. */
    if (!RM && clTrack && clTrack.classList.contains('is-rolling')) {
      const sets = $$('.cl-set', clTrack);
      let clx = 0;
      ScrollTrigger.create({
        trigger: '.clients', start: 'top bottom', end: 'bottom top',
        onToggle: (s) => { NU.MOTION.cl = s.isActive; }
      });
      gsap.ticker.add((time, dt) => {
        if (!NU.MOTION.cl || NU.calm() || clPaused) return;
        /* the step is the distance between the two sets' own origins, not a
           set's width: the gap between the sets is a flex gap that clamps
           with the viewport, and measuring the origins is exact at every
           width without having to know what it clamped to */
        const step = sets[1].offsetLeft - sets[0].offsetLeft;
        if (!step) return;
        clx -= 34 * dt / 1000;
        if (clx <= -step) clx += step;
        gsap.set(clTrack, { x: clx });
      });
    }

    /* --- 5 · the slider's automatic drivers ---
       After the sweep the line drifts with scroll until the visitor takes
       over, relative to where the sweep left it so there is no jump. */
    if (stage && !isStatic) {
      rlDrift = ScrollTrigger.create({
        trigger: '#redline', start: 'top bottom', end: 'bottom top',
        onUpdate: (s) => {
          if (RM || dragged || rlSweeping || rlBase === null) return;
          setPos(rlBase.p + (s.progress - rlBase.g) * 46);
        },
        onToggle: (s) => { NU.MOTION.rl = s.isActive; syncBefore(); }
      });
      /* An invitation, not a twitch: one slow sweep wide enough to show both
         states and explain the control. */
      ScrollTrigger.create({
        trigger: '.rl-stage', start: 'top 72%', once: true,
        onEnter: () => {
          if (RM || dragged) { rlBase = { p: pos, g: rlDrift ? rlDrift.progress : 0 }; return; }
          rlSweeping = true;
          const o = { p: pos };
          gsap.timeline({
            onComplete: () => {
              rlSweeping = false;
              rlBase = { p: pos, g: rlDrift ? rlDrift.progress : 0 };
            }
          })
            .to(o, { p: 72, duration: 1.4, onUpdate: () => { if (!dragged) setPos(o.p); } })
            .to(o, { p: 34, duration: 1, onUpdate: () => { if (!dragged) setPos(o.p); } }, '+=.3');
        }
      });
    }
    if (stage) {
      /* the fidget is the argument, with or without a control */
      ScrollTrigger.create({
        trigger: '#redline', start: 'top bottom', end: 'bottom top',
        onToggle: (sT) => { NU.MOTION.rl = sT.isActive; syncBefore(); }
      });
    }

    /* --- 5 · the still one is driven by the scroll ---
       No handle here: the page is the control. The split travels left to
       right as the section crosses the screen and travels back when you
       scroll up, and setPos does the rest — it clips the after, moves the
       rule, and writes each redline on as the split passes it and unwrites
       it on the way back. Scrubbed on the same 0.45 the manifesto uses: it
       still eases, but it answers the wheel rather than running a second
       behind it. Reduced motion keeps the still 52% split it has always had. */
    if (stage && isStatic && !RM) {
      ScrollTrigger.create({
        trigger: '#redline', start: 'top 75%', end: 'bottom 60%',
        scrub: 0.45, invalidateOnRefresh: true,
        onUpdate: (s) => setPos(8 + s.progress * 84)
      });
    }

    /* --- the hero's ground sleeps once the hero is gone --- */
    ScrollTrigger.create({
      trigger: '#top', start: 'top bottom', end: 'bottom top',
      onToggle: (s) => {
        NU.MOTION.hero = s.isActive;
        NU.FOIL.setActive('hero', s.isActive);
        /* the loupe's ground sleeps with the hero's: it is only ever visible
           inside a circle on this screen, and it is a second GL context */
        NU.FOIL.setActive('lens', s.isActive);
      }
    });
    /* the closing CTA gets the same ground: it is the flattest screen in the
       file, and the copper trail already lives there on pointer intent */
    ScrollTrigger.create({
      trigger: '#audit', start: 'top bottom', end: 'bottom top',
      onToggle: (s) => { NU.FOIL.setActive('audit', s.isActive); }
    });

    NU.onIdleChange(syncBefore);
  });

  /* ------------------------------------------------------------ wiring up
     The audit modal's wiring was here and is now the tail of audit.js. */

  /* the opener hands straight into the hero reveal */
  NU.onIntro(heroIntro);
  NU.onReady(() => {
    /* a deep link or a restored scroll position lands past the hand-off */
    if (window.pageYOffset > window.innerHeight * 0.22) fly(true);
    /* the slot starts turning once the curtain is up, not under it */
    if (rotSync) rotSync();
  });
  NU.onResize(() => {
    /* the flyer's endpoints were measured at the old size */
    if (markState === 'nav' && navMark) navMark.style.opacity = 1;
    /* crossing 900px either way: below it the mark is always there, and above
       it the mark belongs to whichever side of the hand-off we are on */
    if (!flies() && navMark && navSlot) {
      navMark.style.opacity = 1;
      navSlot.classList.add('filled');
    } else if (navMark && markState === 'hero') {
      navMark.style.opacity = 0;
      if (navSlot) navSlot.classList.remove('filled');
    }
  });
})();
