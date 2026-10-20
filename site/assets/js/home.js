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

  const { $, $$, RM, TOUCH, EASE, clamp, esc, wrapS, wrapWords, loopPath } = NU;

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

  /* --- the word that changes ---
     Out the top, in from the bottom, on the same curve and the same mask the
     hero's other words rise out of. The line is a line of its own, so nothing
     around it moves; only the slot does. The lens clone is handed the same
     word at the same moment, because it is an opaque copy sitting on top and
     two layers showing two different words is the one thing that would give
     the whole device away. */
  let rotTl = null;
  let rotSync = null;
  function wireRotator() {
    /* both slots: the base layer's and the lens clone's. This runs after
       buildLens for that reason — a rotator wired before the clone exists
       would drive one layer and leave the other reading its first word for
       ever. */
    const slots = $$('.hero .rot');
    if (!slots.length) return;
    const set = (word) => slots.forEach((s) => { s.textContent = word; });
    set(ROT_WORDS[0]);
    if (RM) return;                 /* one word, no rotation; the label reads all four */

    rotTl = gsap.timeline({ repeat: -1, paused: true });
    ROT_WORDS.forEach((_, i) => {
      const next = ROT_WORDS[(i + 1) % ROT_WORDS.length];
      rotTl
        .to(slots, { yPercent: -115, rotation: -2, duration: 0.5, ease: EASE }, `+=2.2`)
        .add(() => set(next))
        /* immediateRender:false, or a paused timeline writes its from-state
           into the DOM the moment it is built: the slots would start life
           pushed out of their mask, and the inline style attribute that puts
           them there is one the CSP blocks when the lens clone re-parses it. */
        .fromTo(slots,
          { yPercent: 115, rotation: 2 },
          { yPercent: 0, rotation: 0, duration: 0.6, ease: EASE, immediateRender: false });
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
      '<span class="an an-h3">Hover one S. Only that one turns.</span>');
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
     The base layer turns its own glyph through CSS :hover. The lens is an
     opaque clone sitting on top of it, so an S inside the circle is being
     looked at in the clone while the one that turns is the original hidden
     underneath — it would read as doing nothing. The clone was made from the
     same markup, so the two lists of glyphs are in the same order: hovering
     base glyph n marks clone glyph n.

     One delegated listener on the headline rather than one per letter. */
  function wireHeroS() {
    const base = $('.hero .base .hero-h');
    const mirror = $('.hero .lens .hero-h');
    if (!base || !mirror) return;
    const bs = $$('.s', base);
    const ms = $$('.s', mirror);
    if (bs.length !== ms.length) return;   /* never guess at an alignment */
    const mark = (e, on) => {
      const t = e.target;
      if (!t || !t.classList || !t.classList.contains('s')) return;
      /* the glyph you are pointing at, and nothing else on the line */
      t.classList.toggle('is-turn', on);
      const i = bs.indexOf(t);
      if (i > -1) ms[i].classList.toggle('is-turn', on);
    };
    base.addEventListener('pointerover', (e) => mark(e, true));
    base.addEventListener('pointerout', (e) => mark(e, false));
  }

  const LR = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, locked: false };
  let lensUsed = false;
  let hintTimer = null;

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

  /* The bubble recedes while the lens is open and floats back when it closes.
     `away` is a class, not a tween, so this still works with no GSAP. */
  let idleTimer = null;
  function bubble(away) {
    if (!lensToggle) return;
    lensToggle.classList.toggle('away', !!away);
  }

  function wireLens() {
    if (!hero || !lens || !lensScale) return;
    if (!RM && lensNotes.length) gsap.set(lensNotes, { opacity: 0 });
    if (!RM && !TOUCH) {
      hintTimer = setTimeout(retireHint, 9000);
      hero.addEventListener('pointermove', (e) => {
        const b = hero.getBoundingClientRect();
        LR.tx = e.clientX - b.left;
        LR.ty = e.clientY - b.top;
        /* The loupe is 350px of opaque navy and the headline is the one thing
           on this screen you are meant to touch: pointing at an S has to turn
           that S on the page, not under a disc. So over the headline the
           loupe closes and the letters answer for themselves. Everywhere else
           in the hero it behaves exactly as it did. Latched open by the
           button, it ignores all of this - that is a mode you chose. */
        const overHead = !!(e.target && e.target.closest && e.target.closest('.hero-h-wrap'));
        if (!LR.locked) LR.tr = overHead ? 0 : (window.innerWidth < 700 ? 120 : 175);
        if (LR.r < 1) { LR.x = LR.tx; LR.y = LR.ty; }
        if (!LR.locked) {
          bubble(!overHead);
          /* going still is as good as leaving: the lens is a thing you move,
             so a parked pointer should get the resting state back */
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            if (LR.locked) return;
            LR.tr = 0;
            bubble(false);
          }, 1200);
        }
      });
      hero.addEventListener('pointerleave', () => {
        if (LR.locked) return;
        clearTimeout(idleTimer);
        LR.tr = 0;
        bubble(false);
      });
      gsap.ticker.add(() => {
        /* the lens stops clipping once the hero is off-screen: the single
           most expensive thing on the page when idle */
        if (!NU.MOTION.hero) {
          LR.tr = 0;
          if (LR.r !== 0) { LR.r = 0; applyLens(); }
          return;
        }
        if (LR.r > 40) lensFirstUse();
        if (LR.r < 0.5 && LR.tr === 0) {
          if (LR.r !== 0) { LR.r = 0; applyLens(); }
          return;
        }
        LR.x += (LR.tx - LR.x) * 0.16;
        LR.y += (LR.ty - LR.y) * 0.16;
        LR.r += (LR.tr - LR.r) * 0.12;
        applyLens();
      });
    }
    /* The bubble is also the button. Clicking it latches the lens open, which
       is the only path on touch and under reduced motion, and the keyboard
       path everywhere. Latched, it stops receding and stops floating back —
       an object that keeps moving after you have pressed it feels broken. */
    let lensOn = false;
    if (lensToggle) {
      lensToggle.addEventListener('click', () => {
        lensOn = !lensOn;
        LR.locked = lensOn;
        clearTimeout(idleTimer);
        bubble(false);
        if (lensOn) lensFirstUse();
        lensToggle.setAttribute('aria-pressed', String(lensOn));
        lensToggle.classList.toggle('on', lensOn);
        $('span', lensToggle).textContent = lensOn ? 'Look again' : 'Look closer';
        const b = hero.getBoundingClientRect();
        if (RM) {
          lens.style.clipPath = 'none';
          gsap.to(lens, { autoAlpha: lensOn ? 1 : 0, duration: 0.35, ease: 'none' });
          return;
        }
        /* the lens opens from the bubble itself, wherever the bubble is */
        const t = lensToggle.getBoundingClientRect();
        LR.x = LR.tx = t.left - b.left + t.width / 2;
        LR.y = LR.ty = t.top - b.top + t.height / 2;
        /* Both drivers are given the same target rather than one of them
           being switched off. On a pointer device the ticker is running and
           would otherwise drag the radius back while the tween pushed it out;
           on touch there is no ticker and the tween is the only thing moving
           it. Agreeing on the target makes the two harmless to each other. */
        LR.tr = lensOn ? Math.hypot(b.width, b.height) : 0;
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
     before fidgets, the after never moves, and the redlines write on. */
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

    /* The 'before' cannot sit still — four typefaces, Rs.249/- and a TODAY
       SPECIAL burst. The 'after' never moves. That is the whole argument,
       made without a word of copy. */
    if (!RM) {
      const burst = $('.mm-before .burst');
      const prices = $$('.mm-before .bi em');
      beforeFidget = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: 'sine.inOut' } });
      if (burst) beforeFidget.to(burst, { rotation: '+=2.6', duration: 2.2 }, 0);
      prices.forEach((p, i) => {
        beforeFidget.to(p, { x: (i % 2 ? 1 : -1) * (1.4 + i * 0.3), duration: 1.7 + i * 0.2 }, 0);
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

  /* ====================================================== 9 · audit modal */
  const QS = [
    ['Could a stranger tell what you sell in five seconds?', 'Your name and logo don’t say what you sell yet.'],
    ['Do your menu, packaging and site use the same two typefaces?', 'Typefaces change from one surface to the next.'],
    ['Do your delivery listings match your storefront?', 'Your listings look like a different business.'],
    ['Are your prices presented as a decision, not an apology?', 'Prices are presented apologetically.'],
    ['Has someone outside the team repeated your homepage headline back correctly?', 'Your headline isn’t being understood.'],
    ['Do your product photos share one light and one background?', 'Photos don’t share one light or background.'],
    ['Do you know last month’s cost per order or cost per reservation from ads?', 'Ad spend isn’t tied to orders yet.'],
    ['Would you charge 15% more if the brand looked as good as the product?', 'The brand is holding your pricing back.']
  ];
  const modal = $('.modal');
  const mBody = $('.m-body');
  const mStep = $('.m-step');
  const prog = $('.prog i');
  let qi = 0;
  let ans = [];
  let auditFocus = null;

  function renderQ() {
    if (qi >= QS.length) { renderResult(); return; }
    mStep.textContent = `Question ${qi + 1} of ${QS.length}`;
    prog.style.transform = `scaleX(${qi / QS.length})`;
    mBody.innerHTML = `<p class="q">${wrapWords(QS[qi][0])}</p>` +
      '<div class="answers"><button data-a="1">Yes</button><button data-a="0">No</button><button data-a="2">Not sure</button></div>';
    if (!RM) gsap.from(mBody.children, { opacity: 0, y: 20, duration: 0.6, stagger: 0.06 });
    $$('.answers button', mBody).forEach((b) => {
      b.addEventListener('click', () => { ans[qi] = +b.dataset.a; qi++; renderQ(); });
    });
    const first = $('.answers button', mBody);
    if (first) first.focus({ preventScroll: true });
  }
  function renderResult() {
    prog.style.transform = 'scaleX(1)';
    mStep.textContent = 'Your result';
    const yes = ans.filter((a) => a === 1).length;
    const line = yes >= 7
      ? 'Close. The gap is small and specific. The paid audit would name it on one page.'
      : yes >= 4
        ? 'A few details are doing quiet damage. That is usually where pricing power leaks.'
        : 'The product is ahead of the brand. That is the best problem to have, because it is fixable.';
    /* Three, not eight. A wall of negatives after a score reads as a
       verdict on the founder rather than a list of fixable details. */
    const flags = QS.filter((q, k) => ans[k] !== 1).slice(0, 3)
      .map((q) => `<li>${esc(q[1])}</li>`).join('');
    mBody.innerHTML = `<div class="result-score">${yes}<small>/8</small></div>` +
      `<p class="result-line">${esc(line)}</p>` +
      (flags ? `<p class="mono flags-h">Details we would look at first</p><ul class="flags">${flags}</ul>` : '') +
      `<a class="btn solid" href="mailto:hello@nuanse.studio?subject=${encodeURIComponent(`Paid audit — scored ${yes}/8`)}">` +
      '<span class="btn-ar l" aria-hidden="true">→</span>' +
      `<span class="btn-label">${wrapS('Book the paid audit')}</span>` +
      '<span class="btn-ar r" aria-hidden="true">→</span></a>';
    if (!RM) gsap.from(mBody.children, { opacity: 0, y: 20, duration: 0.7, stagger: 0.06 });
  }
  function openAudit() {
    auditFocus = document.activeElement;
    qi = 0;
    ans = [];
    renderQ();
    NU.stopScroll();
    NU.cursorRest();
    modal.classList.add('open');
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: RM ? 0.3 : 0.6, ease: RM ? 'none' : EASE });
    if (!RM) gsap.fromTo('.modal-card', { y: 40 }, { y: 0, duration: 0.9 });
  }
  function closeAudit() {
    if (!modal || !modal.classList.contains('open')) return;
    gsap.to(modal, {
      opacity: 0, duration: RM ? 0.3 : 0.5,
      onComplete: () => {
        modal.classList.remove('open');
        NU.startScroll();
        if (auditFocus) auditFocus.focus({ preventScroll: true });
      }
    });
  }

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
      /* the envelope clears as the letter seats, not after it, so the letter
         is never left sitting half-covered */
      mtl.fromTo(letter, { y: () => window.innerHeight * 0.46, rotation: -2 }, { y: 0, rotation: 0, duration: 0.85 }, 0)
        .fromTo(envs, { y: 0 }, { y: () => window.innerHeight * 0.78, duration: 0.75 }, 0.25);
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
    } else if (RM && words.length) {
      /* reduced motion still has to reach the final state */
      gsap.set(words, { opacity: 1, filter: 'none' });
      $$('.kw', letter).forEach((k) => gsap.set(k, { backgroundSize: '100% 1.5px' }));
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
        const boost = Math.min(Math.abs(vel) / 350, 4);
        mx -= dir * (46 + 46 * boost) * dt / 1000;
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

  /* ------------------------------------------------------------ wiring up */
  if (modal) {
    NU.trap(modal);
    $('.open-audit').addEventListener('click', openAudit);
    $('.modal-close').addEventListener('click', closeAudit);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAudit(); });
  }
  NU.onEsc(closeAudit);

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
