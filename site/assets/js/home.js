/* ============================================================================
   NUANSE — home.js · the home page's eleven sections

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

  const { $, $$, RM, TOUCH, EASE, clamp, esc, wrapS, wrapWords } = NU;

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

  /* ======================================================= 1 · HERO + LENS */
  const hero = $('#top');
  const lens = $('.hero .lens');
  const lensScale = $('.lens-scale');
  const lensToggle = $('.lens-toggle');
  const hintEl = $('.hero-hint');
  let heroS = null;
  let lensNotes = [];

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
        if (!LR.locked) LR.tr = window.innerWidth < 700 ? 120 : 175;
        if (LR.r < 1) { LR.x = LR.tx; LR.y = LR.ty; }
        if (!LR.locked) {
          bubble(true);
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

  function fly(toNav) {
    if (!heroS || !flyer || !navSlot || !navMark) return;
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

  /* ================================================== redline loop shapes */
  function loopPath(cx, cy, rx, ry) {
    let d = '';
    const steps = 56;
    const turns = 1.1;
    for (let k = 0; k <= steps; k++) {
      const t = (k / steps) * turns * Math.PI * 2 - 2.3;
      const g = 1 + 0.045 * Math.sin(k * 0.9) + (k / steps) * 0.07;
      d += (k ? 'L' : 'M') + (cx + Math.cos(t) * rx * g).toFixed(1) + ' ' + (cy + Math.sin(t) * ry * g).toFixed(1);
    }
    return d;
  }
  function buildRedlines() {
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
    $$('.ra').forEach((a) => {
      const vertical = a.classList.contains('r');
      const path = $('path', a);
      path.setAttribute('d', vertical ? loopPath(20, 60, 17, 55) : loopPath(60, 20, 55, 16));
      path.setAttribute('vector-effect', 'non-scaling-stroke');
    });
  }

  /* ============================================================= 8 · TEAM */
  const TEAM = [
    { role: 'Founder',          does: 'Strategy & every brief',    skills: 'strategy identity websites content film performance', hair: 'side',  gl: 1 },
    { role: 'Design lead',      does: 'Identity systems',          skills: 'identity websites',  hair: 'bob',   gl: 0 },
    { role: 'Designer',         does: 'Type, menus, packaging',    skills: 'identity',           hair: 'curly', gl: 0 },
    { role: 'Web developer',    does: 'Sites & booking flows',     skills: 'websites',           hair: 'short', gl: 1 },
    { role: 'Content lead',     does: 'Social & captions',         skills: 'content strategy',   hair: 'long',  gl: 0 },
    { role: 'Film-maker',       does: 'Reels & shoots',            skills: 'film content',       hair: 'bun',   gl: 0 },
    { role: 'Performance lead', does: 'Ads & ROAS',                skills: 'performance strategy', hair: 'bald', gl: 1 },
    { role: 'Producer',         does: 'Timelines & shoot days',    skills: 'film content identity', hair: 'crop', gl: 0 }
  ];
  /* Drawn portraits, not photographs. The kit ships no team photography, and
     inventing faces would be worse than drawing them. See
     brief/04-asset-inventory.md item 11. */
  function portrait(p, i) {
    const N = '#0D1A41';
    const C = '#FCF7F1';
    const hair = {
      short: `<path d="M64 102 C60 62 90 52 104 56 C126 52 142 70 136 102 C128 82 112 74 98 76 C84 78 72 86 64 102Z" fill="${N}"/>`,
      long: `<path d="M62 106 C56 60 88 50 102 54 C126 50 146 66 140 110 L144 170 C132 154 134 122 130 96 C118 80 86 80 72 96 C68 122 70 152 56 170Z" fill="${N}"/>`,
      bun: `<circle cx="100" cy="50" r="15" fill="${N}"/><path d="M64 102 C60 64 88 56 100 58 C118 56 142 66 136 102 C126 82 112 76 100 76 C86 76 72 84 64 102Z" fill="${N}"/>`,
      curly: `<g fill="${N}"><circle cx="72" cy="82" r="13"/><circle cx="82" cy="66" r="13"/><circle cx="100" cy="60" r="14"/><circle cx="118" cy="66" r="13"/><circle cx="129" cy="82" r="13"/><circle cx="66" cy="98" r="9"/><circle cx="135" cy="98" r="9"/></g>`,
      bald: `<path d="M70 114 C72 156 128 156 130 114 C120 138 80 138 70 114Z" fill="${N}"/><path d="M68 92 C74 70 126 70 132 92" fill="none" stroke="${N}" stroke-width="1.5" stroke-dasharray="2 4"/>`,
      side: `<path d="M64 100 C62 62 96 48 122 58 C140 66 142 86 136 102 C126 78 96 70 64 100Z" fill="${N}"/>`,
      bob: `<path d="M60 124 C52 64 92 50 104 54 C134 52 150 74 140 126 L120 122 C128 98 120 80 100 78 C84 80 76 98 80 122Z" fill="${N}"/>`,
      crop: `<path d="M66 96 C66 66 88 58 100 58 C114 58 136 66 134 96" fill="none" stroke="${N}" stroke-width="7" stroke-linecap="round"/>`
    };
    let hatch = '';
    for (let k = -250; k < 250; k += 14) hatch += `<line x1="${k}" y1="0" x2="${k + 250}" y2="250"/>`;
    const eyes = p.gl
      ? `<g fill="none" stroke="${N}" stroke-width="2"><circle cx="86" cy="108" r="9"/><circle cx="114" cy="108" r="9"/><path d="M95 108 L105 108"/></g>`
      : `<g fill="${N}"><circle cx="87" cy="108" r="2.4"/><circle cx="113" cy="108" r="2.4"/></g>`;
    return `<svg viewBox="0 0 200 250" role="img" aria-label="Portrait sketch: ${p.role}">` +
      `<g stroke="${N}" stroke-width=".7" opacity=".12">${hatch}</g>` +
      `<path d="M28 252 C34 190 70 170 100 170 C130 170 166 190 172 252Z" fill="${N}"/>` +
      `<path d="M88 140 L88 172 L112 172 L112 140" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      `<ellipse cx="66" cy="112" rx="5" ry="9" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      `<ellipse cx="134" cy="112" rx="5" ry="9" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      `<ellipse cx="100" cy="106" rx="34" ry="42" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      hair[p.hair] + eyes +
      `<path d="M100 112 L97 126 L102 127" fill="none" stroke="${N}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="M91 136 Q100 141 109 136" fill="none" stroke="${N}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<text x="10" y="18" font-family="IBM Plex Mono, monospace" font-size="9" fill="${N}" letter-spacing="1.5">${('0' + (i + 1))}/08</text></svg>`;
  }

  const scatter = $('.scatter');
  const laneRow = $('.lane-row');
  const SPEEDS = [0.2, 0.9, 0.5, 1.1, 0.7, 0.3, 1, 0.6];
  function buildTeam() {
    if (!scatter || !laneRow) return;
    TEAM.forEach((p, i) => {
      const f = document.createElement('figure');
      f.className = 'tm';
      f.dataset.i = String(i);
      f.dataset.skills = p.skills;
      f.dataset.speed = String(SPEEDS[i]);
      const label = `${('0' + (i + 1))} · ${p.role}`;
      f.innerHTML = '<div class="tm-in"><div class="tm-ph">' + portrait(p, i) + '</div>' +
        `<figcaption><span><span class="t-name" data-full="${esc(label)}">${esc(label)}</span>` +
        `<br><span class="t-role">${esc(p.does)}</span></span></figcaption></div>`;
      (i === 0 ? laneRow : scatter).appendChild(f);
    });
  }

  let typed = false;
  function typeNames() {
    if (typed) return;
    typed = true;
    $$('.t-name').forEach((n, i) => {
      const full = n.dataset.full;
      if (RM) { n.textContent = full; return; }
      const o = { c: 0 };
      gsap.to(o, {
        c: full.length, duration: 0.5, delay: i * 0.07, ease: 'none',
        onUpdate: () => { n.textContent = full.slice(0, Math.round(o.c)); }
      });
    });
  }

  /* =================================================== 4 · CASE OVERLAY
     Copy is lifted from the reference build, not rewritten. Every figure in
     here came with it; brief/02-project-pages.md says to lift rather than
     rewrite, and brief/05-conventions.md says never to invent one.

     NOTE for the content pass: these three figures are live on the current
     site and are carried forward unchanged, but they have not been confirmed
     back to a source in this round. If any one of them cannot be attributed,
     it becomes a NEEDS placeholder — the markup for which is already here. */
  const CASES = [
    {
      no: 2, name: '24 SKUs. One shoot.', sector: 'D2C fashion · India', cc: '#3F4A2E',
      title: 'One light. One day. Every SKU.',
      brief: 'A fabric-first label with product people kept and photos nobody shared. Every SKU had been shot on a different day in a different light, so the store looked like a marketplace of its own.',
      fixes: [
        'One light, one angle logic, one background, planned before anyone picked up a camera.',
        'Ad creative cut from the same shoot, so the click lands on the photo it promised.',
        'Product pages rewritten so the second line of a caption carries the fabric story.'
      ],
      results: [['24', 'SKUs shot in one day'], ['2.4×', 'Return on ad spend'], ['+38%', 'Product page conversion']],
      scope: ['Shoot direction', 'Product photography', 'Reels', 'Shopify product pages', 'Meta ads']
    },
    {
      no: 3, name: 'A GCC, Bangalore', sector: 'Global capability centre', cc: '#16245A',
      title: 'We redlined “leveraging synergies”.',
      brief: 'A new global capability centre needed a strategy people could repeat, a name system for six teams and a website that helps it hire. The first draft of the strategy used “leveraging synergies” four times.',
      fixes: [
        'A name system that scales from one team to sixty without a new logo each time.',
        'Strategy cut to one sentence a new hire can say back on day one.',
        '“Leveraging synergies” became “working as one team”. Every page was held to the same test.'
      ],
      results: [['1', 'Name system for 6 teams'], ['4 wks', 'Brief to live site'], ['0', 'Uses of “synergies”']],
      scope: ['Strategy', 'Name system', 'Identity', 'Website', 'Hiring content']
    }
  ];

  const ov = $('.case-ov');
  const ovIn = $('.case-in');
  const ovClose = $('.case-close');
  let openFrom = null;
  let lastFocus = null;

  /* A figure we do not have renders as a visible placeholder, never as a
     plausible number. Call it as NEEDS('average order value, Zingara'). */
  const NEEDS = (what) => `<span class="needs">[[NEEDS: ${esc(what)}]]</span>`;
  const cell = (v) => (v && v.needs ? NEEDS(v.needs) : esc(v));

  function renderCase(i) {
    const c = CASES[i];
    ov.style.setProperty('--cc', c.cc);
    ovIn.innerHTML =
      `<div class="case-top case-x"><div><p class="mono">Case 0${c.no} · ${esc(c.sector)}</p>` +
      `<h2 class="case-title">${wrapWords(c.title)}</h2></div>` +
      `<p class="case-brief">${esc(c.brief)}</p></div>` +
      '<div class="case-grid case-x"><div><p class="mono">The redline</p><ol class="fixes">' +
      c.fixes.map((f, k) => `<li><b>${'ABC'[k]}</b><span>${esc(f)}</span></li>`).join('') +
      '</ol></div>' +
      '<div><p class="mono">Results</p><div class="results">' +
      c.results.map((r) => `<div><strong>${cell(r[0])}</strong><span>${esc(r[1])}</span></div>`).join('') +
      '</div>' +
      '<p class="mono case-scope-h">Scope</p><div class="scope">' +
      c.scope.map((s) => `<span>${esc(s)}</span>`).join('') + '</div></div></div>' +
      '<div class="case-x"><div class="case-swatch"></div><div class="case-next">' +
      '<button class="btn solid next-case"><span class="btn-ar l" aria-hidden="true">→</span>' +
      `<span class="btn-label">${wrapS('Next case')}</span>` +
      '<span class="btn-ar r" aria-hidden="true">→</span></button></div></div>';

    $('.next-case', ovIn).addEventListener('click', () => {
      const n = (i + 1) % CASES.length;
      gsap.to($$('.case-x', ovIn), {
        opacity: 0, y: -20, duration: 0.5, stagger: 0.04,
        onComplete: () => { renderCase(n); ov.scrollTop = 0; showCaseBits(); }
      });
    });
  }
  function showCaseBits() {
    gsap.fromTo($$('.case-x', ovIn),
      { opacity: 0, y: RM ? 0 : 30 },
      { opacity: 1, y: 0, duration: RM ? 0.3 : 0.9, stagger: 0.08, delay: RM ? 0 : 0.1 });
  }
  function rectInset(el) {
    const r = el.getBoundingClientRect();
    const W = window.innerWidth;
    const H = window.innerHeight;
    return `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px)`;
  }
  function openCase(i, el) {
    lastFocus = document.activeElement;
    openFrom = el;
    renderCase(i);
    ov.scrollTop = 0;
    NU.stopScroll();
    NU.cursorRest();
    ov.classList.add('open');
    if (RM) {
      gsap.fromTo(ov, { clipPath: 'inset(0px 0px 0px 0px)', opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' });
    } else {
      gsap.fromTo(ov, { clipPath: rectInset(el) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.1 });
    }
    showCaseBits();
    ovClose.focus({ preventScroll: true });
  }
  function closeCase() {
    if (!ov || !ov.classList.contains('open')) return;
    const done = () => {
      ov.classList.remove('open');
      NU.startScroll();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    if (RM || !openFrom) {
      gsap.to(ov, { opacity: 0, duration: 0.3, ease: 'none', onComplete: () => { gsap.set(ov, { opacity: 1 }); done(); } });
    } else {
      gsap.to(ov, { clipPath: rectInset(openFrom), duration: 1, onComplete: done });
    }
  }
  /* focus trap: the overlay is modal, so Tab must not walk out of it */
  function trap(box) {
    box.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !box.classList.contains('open')) return;
      const f = $$('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])', box)
        .filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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

  /* ========================================================= 6 · SERVICES */
  function wireCards() {
    $$('.card').forEach((c) => {
      c.addEventListener('click', () => { if (TOUCH || RM) c.classList.toggle('is-flipped'); });
      c.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        c.classList.toggle('is-flipped');
      });
    });
  }

  /* ================================================== 8 · the brief builder */
  function wireBuilder() {
    const chips = $$('.chip');
    const laneN = $('.lane-n');
    if (!chips.length || !scatter || !laneRow) return;
    function setBrief(skill) {
      const state = Flip.getState('.tm');
      $$('.tm').sort((a, b) => a.dataset.i - b.dataset.i).forEach((m) => {
        const on = m.dataset.i === '0' || skill === 'all' ||
          (skill && m.dataset.skills.split(' ').indexOf(skill) > -1);
        (on ? laneRow : scatter).appendChild(m);
      });
      if (laneN) laneN.textContent = String(laneRow.children.length);
      $$('.lane .tm-in').forEach((x) => gsap.set(x, { y: 0 }));
      Flip.from(state, {
        duration: RM ? 0 : 1, ease: EASE, absolute: true, stagger: 0.03,
        onComplete: () => ScrollTrigger.refresh()
      });
    }
    chips.forEach((c) => {
      c.addEventListener('click', () => {
        const on = c.getAttribute('aria-pressed') !== 'true';
        chips.forEach((x) => x.setAttribute('aria-pressed', 'false'));
        c.setAttribute('aria-pressed', String(on));
        setBrief(on ? c.dataset.skill : null);
      });
    });
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
    ['Could a stranger tell what you sell from your name and logo in five seconds?', 'Your name and logo don’t say what you sell yet.'],
    ['Do your menu, packaging and site use the same two typefaces?', 'Typefaces change from one surface to the next.'],
    ['Do your Swiggy, Zomato or marketplace listings look like the same brand as your storefront?', 'Your listings look like a different business.'],
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
    const flags = QS.filter((q, k) => ans[k] !== 1).map((q) => `<li>${esc(q[1])}</li>`).join('');
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
     library, so it runs either way. The team portraits are static SVG and the
     proof photographs are plain <img>: if GSAP never arrives, the team
     section should still have eight people in it rather than an empty grid.
     The reference build lost both here, which is the one place its no-JS
     path was weaker than it looked. */
  buildTeam();
  attachPrintImages();
  if (NU.dead) return;                  /* no GSAP: core already lifted the curtain */

  /* this page's two extra copper-foil grounds */
  NU.FOIL.add('.hero-foil', 'hero');
  NU.FOIL.add('.audit-foil', 'audit');
  /* onToggle only fires on a change, so without this the audit ground would
     draw forever on a visit that never scrolls that far */
  NU.FOIL.setActive('audit', false);
  NU.FOIL.start();

  /* ========================================================== build phase */
  NU.onBuild(() => {
    /* order matters: the lens clone copies the already-split headline, the
       letter is split before its pin reads word positions */
    buildLens();
    wireLens();
    splitLetter();
    buildMarquee();
    buildRedlines();
    wireRedline();
    wireCards();
    wireBuilder();
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
    if (!RM && prints.length === 3) {
      gsap.set(prints[1], { rotation: 2.5, y: 12, scale: 0.965 });
      gsap.set(prints[2], { rotation: -2, y: 24, scale: 0.93 });
      const wtl = gsap.timeline({ defaults: { ease: EASE } });
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
        trigger: '#work', start: 'top top', end: '+=120%', pin: '.work-stage',
        scrub: 1, animation: wtl, invalidateOnRefresh: true, onToggle: NU.pinClaim,
        onUpdate: () => {
          let idx = 0;
          prints.forEach((p, i) => {
            if (i > 0 && gsap.getProperty(prints[i - 1], 'yPercent') > 60) idx = i;
          });
          setCount(idx);
        }
      });
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
    if (!RM && $('.pr-fill')) {
      gsap.fromTo('.pr-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.pr-list', start: 'top 60%', end: 'bottom 60%', scrub: true }
      });
    }

    /* --- 6 · the fan settles in --- */
    if (!RM) {
      gsap.from('.card', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.06, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.fan', start: 'top 85%', once: true }
      });
    }

    /* --- 8 · TEAM: parallax scatter, labels write on --- */
    if (!RM) {
      $$('.tm').forEach((t) => {
        const inner = $('.tm-in', t);
        const sp = +t.dataset.speed;
        ScrollTrigger.create({
          trigger: t, start: 'top bottom', end: 'bottom top',
          onUpdate: (self) => {
            gsap.set(inner, { y: t.closest('.lane') ? 0 : (0.5 - self.progress) * 2 * sp * 26 });
          }
        });
      });
      $$('.t-name').forEach((n) => { n.textContent = ''; });
    }
    ScrollTrigger.create({ trigger: '.scatter', start: 'top 80%', once: true, onEnter: typeNames });
    ScrollTrigger.create({ trigger: '.lane', start: 'top 85%', once: true, onEnter: typeNames });

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

    /* --- the hero's ground sleeps once the hero is gone --- */
    ScrollTrigger.create({
      trigger: '#top', start: 'top bottom', end: 'bottom top',
      onToggle: (s) => { NU.MOTION.hero = s.isActive; NU.FOIL.setActive('hero', s.isActive); }
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
  $$('.print').forEach((p) => {
    const open = () => {
      if (p.dataset.href) { NU.goPage(p.dataset.href); return; }
      openCase(+p.dataset.case, p);
    };
    p.addEventListener('click', open);
    p.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      open();
    });
  });
  if (ovClose) ovClose.addEventListener('click', closeCase);
  if (ov) trap(ov);
  if (modal) {
    trap(modal);
    $('.open-audit').addEventListener('click', openAudit);
    $('.modal-close').addEventListener('click', closeAudit);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAudit(); });
  }
  NU.onEsc(() => { closeAudit(); closeCase(); });

  /* the opener hands straight into the hero reveal */
  NU.onIntro(heroIntro);
  NU.onReady(() => {
    /* a deep link or a restored scroll position lands past the hand-off */
    if (window.pageYOffset > window.innerHeight * 0.22) fly(true);
  });
  NU.onResize(() => {
    /* the flyer's endpoints were measured at the old size */
    if (markState === 'nav' && navMark) navMark.style.opacity = 1;
  });
})();
