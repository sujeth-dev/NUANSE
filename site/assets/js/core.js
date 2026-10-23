/* ============================================================================
   NUANSE — core.js · shared behaviour

   Everything that exists once and is used by every page: helpers, capability
   flags, the S text utilities, the copper-foil ground, the motion registry,
   smooth scroll, the loader curtain and page-change transition, the nav in
   both states, the cursor, the S counter, the toast, and the footer with its
   draggable 3D mark.

   Page scripts (home.js, work/<slug>.js) get at all of it through the NU
   namespace at the bottom of this file. They never redeclare a helper.

   Style: modern syntax — const, arrow functions, template literals — applied
   consistently across every file in assets/js/. The reference build was
   ES5-flavoured; brief/05-conventions.md allows the switch at the split, on
   the condition that it is decided once and applied everywhere. It is.

   No-JS and no-GSAP both have real paths. If GSAP fails to load, this file
   lifts the curtain, wires the menu by hand and exits — the page still reads.
   That is the single easiest thing to lose in a rebuild.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- helpers */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = document.documentElement;
  const RM = html.classList.contains('rm');
  const TOUCH = html.classList.contains('touch');

  /* The opener plays on every fresh arrival: a first visit, a refresh, a
     typed address. A page reached through the curtain (boot.js marks it
     .via) does not replay it; it lifts the curtain it arrived under, so a
     click through the site is one continuous move rather than an opener
     per page. */
  const VIA = html.classList.contains('via');

  /* ------------------------------------------------------------- S wrapping
     Wraps every s/S in a text node in a <span class="s">, keeping whole words
     unbroken so a turned letter never causes a line to re-wrap. This is the
     nuanse-house implementation (its line 795) rather than the current
     build's: it walks text nodes, so it survives nested markup, and it
     handles the no-break case explicitly.

     Only ever applied to copy. The logo is an asset, never a glyph. */
  const wrapS = (t) => esc(t).replace(/[sS]/g, (m) => `<span class="s">${m}</span>`);
  const wrapWords = (t) =>
    t.split(' ').map((w) => `<span class="nw">${wrapS(w)}</span>`).join(' ');

  function markS(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (/[sS]/.test(n.nodeValue) && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach((t) => {
      if (t.parentNode.closest('.s, script, style')) return;
      const frag = document.createDocumentFragment();
      /* split on whitespace first so each word can be kept unbreakable */
      t.nodeValue.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) {
          frag.appendChild(document.createTextNode(word));
          return;
        }
        if (!/[sS]/.test(word)) {
          frag.appendChild(document.createTextNode(word));
          return;
        }
        const wrap = document.createElement('span');
        wrap.className = 'nw';
        wrap.innerHTML = wrapS(word);
        frag.appendChild(wrap);
      });
      t.parentNode.replaceChild(frag, t);
    });
  }

  /* ------------------------------------------------------- copper foil (GL)
     Domain-warped fbm noise ramped through the palette, drifting slowly. One
     shader source, one GL context per canvas — contexts cannot share a
     program. Deliberately above the GSAP guard: it needs no animation library,
     and it now runs everywhere the page has a ground to show. On touch it
     draws at half resolution and 30fps, which the soft noise hides; under
     reduced motion it draws one still frame and never moves. Where WebGL is
     missing or fails, the canvas stays up empty and its CSS background, a
     still of the same ground, shows through: it is never just gone. Only the
     opener and the loupe stay desktop-only (EVERYWHERE below). */
  const FOIL = (() => {
    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
    const FS = [
      /* highp is optional in fragment shaders and some Android GPUs lack it;
         asking for it there fails the compile and the ground was simply gone */
      '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;',
      '#else', 'precision mediump float;', '#endif',
      'uniform vec2 uRes; uniform float uT,uWarp,uScale,uGrain;',
      'uniform vec3 cA,cB,cC,cD;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
      'float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
      ' return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.0,a=0.5;for(int k=0;k<5;k++){v+=a*vn(p);p*=2.02;a*=0.5;}return v;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/uRes;vec2 p=uv*uScale;p.x*=uRes.x/uRes.y;',
      ' vec2 q=vec2(fbm(p+vec2(0.0,uT*0.07)),fbm(p+vec2(5.2,1.3)-uT*0.05));',
      ' vec2 r=vec2(fbm(p+uWarp*q+vec2(1.7,9.2)),fbm(p+uWarp*q+vec2(8.3,2.8)));',
      ' float f=clamp(fbm(p+uWarp*r)*1.3-0.1,0.0,1.0);',
      ' vec3 col=mix(cA,cB,smoothstep(0.0,0.44,f));',
      ' col=mix(col,cC,smoothstep(0.40,0.74,f));',
      ' col=mix(col,cD,smoothstep(0.72,1.0,f));',
      ' col+=(hash(gl_FragCoord.xy+vec2(uT))-0.5)*uGrain;',
      ' gl_FragColor=vec4(col,1.0);}'
    ].join('\n');

    /* The hero sits on cream and ramps up into navy; the opener sits on navy
       and ramps up into copper. The same effect reads as foil on both. */
    const PRE = {
      hero:  { ramp: ['#FCF7F1', '#E6DED2', '#D58A4E', '#0D1A41'], warp: 4.2, scale: 2.3, speed: 1,   grain: 0.05 },
      open:  { ramp: ['#0D1A41', '#08112E', '#B56528', '#D58A4E'], warp: 3.6, scale: 1.8, speed: 1.6, grain: 0.04 },
      audit: { ramp: ['#0D1A41', '#08112E', '#B56528', '#D58A4E'], warp: 3.0, scale: 1.6, speed: 0.45, grain: 0.03 },
      /* The hero's loupe. The client's note on this screen was that the ground
         should get "brighter with the blue element rather than plain", and the
         loupe was the plain part: 350px of flat navy.

         This ramp is the only one in the file with no copper in it, and that
         is a contrast decision rather than a taste one. The loupe carries the
         annotations in --copper-l at 10px, which needs 4.5:1. Against the
         brightest colour here, #1B2B66, copper-l measures 4.78:1 and cream
         12.45:1; against --copper-l itself it would measure 1.0. So the blue
         brightens and the copper stays legible on top of it. */
      lens:  { ramp: ['#0D1A41', '#16245A', '#08112E', '#1B2B66'], warp: 3.4, scale: 2.0, speed: 0.6, grain: 0.03 }
    };

    const hx = (h) => [
      parseInt(h.slice(1, 3), 16) / 255,
      parseInt(h.slice(3, 5), 16) / 255,
      parseInt(h.slice(5, 7), 16) / 255
    ];

    function fit(cv) {
      const r = cv.getBoundingClientRect();
      const d = TOUCH ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(2, (r.width * d) | 0);
      const h = Math.max(2, (r.height * d) | 0);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }

    /* the grounds that must show on every device; the rest are desktop extras */
    const EVERYWHERE = { hero: 1, audit: 1 };
    const rigs = [];
    let running = false;
    let last = 0;

    function add(sel, name) {
      const cv = $(sel);
      if (!cv) return null;
      if (!EVERYWHERE[name] && (TOUCH || RM)) { cv.style.display = 'none'; return null; }

      let gl = null;
      try {
        gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
      } catch (e) {}
      const bail = () => (EVERYWHERE[name] ? null : (cv.style.display = 'none', null));
      if (!gl) return bail();

      const sh = (ty, src) => {
        const s = gl.createShader(ty);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = sh(gl.VERTEX_SHADER, VS);
      const fs = sh(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return bail();

      const pr = gl.createProgram();
      gl.attachShader(pr, vs);
      gl.attachShader(pr, fs);
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return bail();
      gl.useProgram(pr);

      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const lp = gl.getAttribLocation(pr, 'p');
      gl.enableVertexAttribArray(lp);
      gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);

      const U = {};
      ['uRes', 'uT', 'uWarp', 'uScale', 'uGrain', 'cA', 'cB', 'cC', 'cD']
        .forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });

      const P = PRE[name];
      gl.uniform1f(U.uWarp, P.warp);
      gl.uniform1f(U.uScale, P.scale);
      gl.uniform1f(U.uGrain, P.grain);
      ['cA', 'cB', 'cC', 'cD'].forEach((k, i) => {
        const c = hx(P.ramp[i]);
        gl.uniform3f(U[k], c[0], c[1], c[2]);
      });

      const g = {
        cv, name, t: Math.random() * 30, on: true,
        draw() {
          fit(cv);
          gl.viewport(0, 0, cv.width, cv.height);
          gl.uniform2f(U.uRes, cv.width, cv.height);
          gl.uniform1f(U.uT, g.t * P.speed);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      };
      cv.addEventListener('webglcontextlost', (e) => {
        e.preventDefault(); g.on = false; if (!EVERYWHERE[name]) cv.style.display = 'none';
      });
      g.draw();                        /* one frame now, so nothing starts blank */
      if (RM) return g;                /* the still frame is all reduced motion gets */
      rigs.push(g);
      return g;
    }

    function tick(now) {
      if (TOUCH && last && now - last < 31) { requestAnimationFrame(tick); return; }
      const dt = last ? Math.min(now - last, 60) : 16.7;
      last = now;
      for (const g of rigs) { if (g.on) { g.t += dt / 1000; g.draw(); } }
      requestAnimationFrame(tick);
    }

    return {
      add,
      start() { if (!running && rigs.length) { running = true; requestAnimationFrame(tick); } },
      setActive(name, on) { rigs.forEach((g) => { if (g.name === name) g.on = !!on; }); },
      refit() { rigs.forEach((g) => { fit(g.cv); g.draw(); }); }
    };
  })();

  /* The curtain's ground is on every page, so core owns it. Page scripts add
     their own canvases (the hero's, the audit's) and the shared ticker picks
     them up — start() is guarded, so calling it again is free. */
  FOIL.add('.curtain-foil', 'open');
  FOIL.start();

  /* ---------------------------------------------------- shared DOM handles */
  const nav = $('.nav');
  const navSlot = $('.nav-slot');
  const navSpin = $('.nav-spin');
  const navMark = $('.nav-mark');
  const menu = $('.menu');
  const menuBtn = $('.menu-btn');
  const curtain = $('.curtain');
  const toastEl = $('.toast');

  /* ------------------------------------------------------- WHICH PAGE THIS IS
     The nav is four pages now, not four anchors on one. aria-current is set
     here and its colour is in core.css, so the page you are on is marked
     before GSAP is even asked for - and still marked if it never arrives.

     /services, /services.html and /services/ are one page, and so are /work,
     /work/index.html and /work/. cleanUrls serves the short form; a file://
     open or a direct .html hit must light the same link. */
  const pageKey = (u) => {
    let p = u.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p || '/';
  };
  let currentLink = null;
  function markCurrentPage() {
    const here = pageKey(window.location);
    $$('.nav-links a, .menu a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href[0] === '#' || /^(mailto|tel):/.test(href)) return;
      let url;
      try { url = new URL(href, window.location.href); } catch (e) { return; }
      if (url.origin !== window.location.origin) return;
      /* A case page lives under the work index, so Work is where you are
         even though the paths are not equal. An exact match still wins: an
         ancestor only takes the indicator if nothing exact has claimed it. */
      const key = pageKey(url);
      const exact = key === here;
      if (!exact && !(key !== '/' && here.indexOf(key + '/') === 0)) {
        a.removeAttribute('aria-current');
        return;
      }
      a.setAttribute('aria-current', exact ? 'page' : 'true');
      if (a.closest('.nav-links') && (exact || !currentLink)) currentLink = a;
    });
  }
  markCurrentPage();

  /* ------------------------------------------------------- THE NAV'S MARK
     The slot holds the logo on every page. The home page is the exception and
     it is the reason the slot exists: there, the mark settles into it as you
     start to scroll, so it starts invisible and the dashed ring stands empty
     until it lands. That page says so with data-mark-settles on <body>;
     every other page simply has its logo, ring filled, from the first frame,
     which is also what the no-GSAP path below has always done. */
  if (nav && document.body.hasAttribute('data-mark-settles')) {
    nav.classList.add('mark-flies');
  } else if (navSlot) {
    navSlot.classList.add('filled');
  }

  /* ------------------------------------------------ graceful no-GSAP exit
     The page must still read. Lift the curtain, give the menu button a plain
     class toggle so every destination stays reachable, and stop. */
  if (!window.gsap) {
    html.classList.remove('loading');
    if (curtain) curtain.style.display = 'none';
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', () => {
        const open = !menu.classList.contains('open');
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', String(!open));
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.textContent = open ? 'Close' : 'Menu';
      });
    }
    if (navMark) navMark.style.opacity = 1;
    if (navSlot) navSlot.classList.add('filled');
    /* The follow needs GSAP; the rest state does not. Without this the ring
       sat in the top-left corner for the whole visit, which is the parked
       cursor the rest state exists to stop. .cur-dead centres it in CSS,
       because transform here belongs to the breath. */
    const curEl = $('.cur');
    if (curEl) curEl.classList.add('rest', 'cur-dead');
    window.NU = { RM, TOUCH, $, $$, clamp, esc, wrapS, wrapWords, markS, dead: true };
    return;
  }

  /* Register what this page actually loaded, rather than naming every plugin
     and throwing a ReferenceError on a page that does not need them all.
     DrawSVG draws the home page's redline and nothing else, so a project page
     has no reason to carry it; ScrollTrigger, Flip and CustomEase are chassis
     and every page loads them. A missing plugin is a page that chose not to
     ship it, not a fault. */
  gsap.registerPlugin.apply(gsap, [
    typeof ScrollTrigger !== 'undefined' && ScrollTrigger,
    typeof Flip !== 'undefined' && Flip,
    typeof DrawSVGPlugin !== 'undefined' && DrawSVGPlugin,
    typeof CustomEase !== 'undefined' && CustomEase
  ].filter(Boolean));
  /* One curve rules everything: cubic-bezier(.7,0,.2,1) */
  CustomEase.create('nu', 'M0,0 C0.7,0 0.2,1 1,1');
  const EASE = 'nu';
  gsap.defaults({ ease: EASE, duration: 0.6 });

  /* ---------------------------------------------------------------- MOTION
     One moving thing per screen. Pins claim the stage; ambient motion yields
     to them and also sleeps while its own section is out of view. Page
     scripts register their pins through NU.pinClaim. */
  const MOTION = { pin: 0, hero: true, ft: false };
  const calm = () => MOTION.pin > 0;
  const idleHooks = [];
  const onIdleChange = (fn) => { idleHooks.push(fn); };
  const syncIdle = () => { idleHooks.forEach((fn) => fn()); };
  function pinClaim(s) {
    MOTION.pin += s.isActive ? 1 : -1;
    if (MOTION.pin < 0) MOTION.pin = 0;
    syncIdle();
  }
  /* A pin is a sticky stage, not ScrollTrigger's pin. Switching a stage to
     position:fixed is read by Chrome as a full-screen layout shift (CLS 1
     per pin, every visit), and sticky is composited, so it holds still
     under Lenis and under native touch scrolling alike. The section grows
     by the run; the trigger spans it top to bottom. `run` is in viewport
     heights, as the old '+=115%' ends were. */
  function stickPin(sec, stage, run) {
    sec.classList.add('stuck-run');
    stage.classList.add('stuck-stage');
    sec.style.setProperty('--run', run);
    return { trigger: sec, start: 'top top', end: 'bottom bottom', onToggle: pinClaim };
  }

  /* ---------------------------------------------------------------- Lenis */
  let lenis = null;
  if (!RM && !TOUCH && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const stopScroll = () => { if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden'; };
  const startScroll = () => { if (lenis) lenis.start(); else document.body.style.overflow = ''; };
  function jumpTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (lenis) lenis.scrollTo(el || 0, { immediate: true, force: true });
    else {
      const y = el ? el.getBoundingClientRect().top + window.pageYOffset : 0;
      window.scrollTo(0, y);
    }
    ScrollTrigger.update();
  }

  /* ----------------------------------------------------------------- toast */
  let toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    clearTimeout(toastT);
    gsap.to(toastEl, { opacity: 1, y: 0, duration: 0.6 });
    toastT = setTimeout(() => gsap.to(toastEl, { opacity: 0, y: 20, duration: 0.6 }), 2600);
  }

  /* ---------------------------------------------------------------- CURSOR
     Requirement 2. A 40px copper ring follows at all times; over a
     [data-cursor] element it swells to a 100px filled disc and the label
     fades in. Leaving, it returns to the ring. The geometry is CSS; this only
     drives position and the two state classes. */
  const cur = $('.cur');
  let curHidden = false;
  if (cur && !TOUCH && !RM) {
    const cLab = $('b', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: 0.5, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.5, ease: 'power3' });
    let lastLabel = '';
    let lx = -1;
    let ly = -1;

    /* Over a text field the ring fights the I-beam. Audit inputs, search
       fields and anything contenteditable all count. */
    const isText = (t) =>
      !!(t && t.closest && t.closest('input:not([type=range]),textarea,select,[contenteditable=true]'));

    function check(target) {
      if (isText(target)) {
        if (!curHidden) { curHidden = true; cur.classList.add('hide'); }
        cur.classList.remove('big');
        return;
      }
      if (curHidden) { curHidden = false; cur.classList.remove('hide'); }
      const t = target && target.closest && target.closest('[data-cursor]');
      if (t) {
        const l = t.getAttribute('data-cursor');
        /* the lastLabel guard avoids a reflow on every pointermove */
        if (l !== lastLabel) { cLab.textContent = l; lastLabel = l; }
        cur.classList.add('big');
      } else {
        cur.classList.remove('big');
      }
    }

    /* --- the rest state ---
       With no input for REST_AFTER the ring stops following, drifts back to
       the centre of the window and breathes there (the keyframe is in
       core.css); the next move, scroll or keypress brings it straight back.

       "No input" counts scrolling and typing as well as pointer movement. A
       wheel with a parked pointer is still someone reading, and a ring that
       wandered off mid-sentence would be answering a question nobody asked.

       It starts at rest rather than waiting for the first pointermove. Before
       this, the ring sat at 0,0 until you moved — a copper circle in the
       top-left corner of a page nobody had touched yet. */
    const REST_AFTER = 2400;
    let restT = null;
    let resting = false;
    let drift = null;

    /* --- the float ---
       At rest the ring used to come to the centre of the window and stop
       there, breathing. Breathing is a size change, so what you actually saw
       was a copper circle pinned to one point - "stuck in one position", and
       that was the note.

       So it wanders instead. Six legs around the anchor, each a different
       length and a different distance, on sine easing so it never arrives
       anywhere squarely; then it repeats from a fresh set of legs. The
       radius is wider across than down because a browser window is, and the
       whole figure stays inside a 56-96px orbit so the ring reads as
       floating in one region rather than crossing the page on its own.

       It owns x and y while it runs, which is why wake() kills it before
       handing the pointer's real position back to the quickTo pair. Two
       things tweening one property is the one way this can go wrong. */
    function stopDrift() {
      if (drift) { drift.kill(); drift = null; }
    }
    function startDrift(ox, oy, travel) {
      stopDrift();
      const leg = () => {
        const a = Math.random() * Math.PI * 2;
        const r = 28 + Math.random() * 20;
        return {
          x: ox + Math.cos(a) * r * 1.6,
          y: oy + Math.sin(a) * r,
          duration: 3.4 + Math.random() * 2.2,
          ease: 'sine.inOut'
        };
      };
      drift = gsap.timeline({ repeat: -1, repeatRefresh: true });
      if (travel) drift.to(cur, { x: ox, y: oy, duration: 1.1, ease: 'power2.out' }, 0);
      for (let i = 0; i < 6; i++) drift.to(cur, leg());
    }

    function rest(now) {
      clearTimeout(restT);
      restT = null;
      resting = true;
      cur.classList.remove('big');
      cur.classList.add('rest');
      lastLabel = '';
      const ox = window.innerWidth / 2;
      const oy = window.innerHeight / 2;
      if (now) gsap.set(cur, { x: ox, y: oy });
      startDrift(ox, oy, !now);
    }
    function wake() {
      if (resting) {
        resting = false;
        stopDrift();
        cur.classList.remove('rest');
        /* the ring is off wandering and the pointer is not, so it is handed
           its real position before the timer starts again */
        if (lx >= 0) { cx(lx); cy(ly); }
      }
      clearTimeout(restT);
      restT = setTimeout(rest, REST_AFTER);
    }

    window.addEventListener('pointermove', (e) => {
      lx = e.clientX; ly = e.clientY;
      wake();
      cx(lx); cy(ly);
      check(e.target);
    }, { passive: true });
    /* scrolling moves targets under a stationary pointer */
    window.addEventListener('scroll', () => {
      wake();
      if (lx >= 0) check(document.elementFromPoint(lx, ly));
    }, { passive: true });
    /* a keyboard user is working too, and the ring should not creep across
       their screen while they tab through the nav */
    window.addEventListener('keydown', wake, { passive: true });
    /* the pointer has left the window: that is the end of the input, not a
       pause in it, so the ring goes home without waiting out the timer */
    document.addEventListener('pointerleave', () => { check(null); rest(); });
    /* the centre moved */
    window.addEventListener('resize', () => { if (resting) rest(true); }, { passive: true });
    rest(true);
  }
  const cursorRest = () => { if (cur) cur.classList.remove('big'); };

  /* --------------------------------------------------------------- MAGNETS */
  if (!TOUCH && !RM) {
    $$('.magnet').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, {
          x: (e.clientX - r.left - r.width / 2) * 0.18,
          y: (e.clientY - r.top - r.height / 2) * 0.3,
          duration: 0.6
        });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.9 }));
    });
  }

  /* --------------------------------------------------------- THE S COUNTER
     Answer to open question 3: as in nuanse-house. The visual flip is pure
     CSS and reverts on un-hover; the count is a running tally of letters
     turned on this visit, so the letter springs back and the number does not.
     Typing `nuanse` latches every S at once, and that one sticks. */
  const turnedN = $('.turned-n');
  let turns = 0;
  function bump(n) {
    turns += n || 1;
    if (!turnedN) return;
    turnedN.textContent = turns < 10 ? `0${turns}` : String(turns);
    if (!RM) gsap.fromTo(turnedN, { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 });
  }
  /* one tally per container entered, not per letter crossed */
  function watchTurns(root) {
    $$('.h-split, .turn', root || document).forEach((h) => {
      h.addEventListener('mouseenter', () => {
        const n = $$('.s', h).length;
        if (n) bump(n);
      });
    });
  }
  let keybuf = '';
  window.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (!e.key || e.key.length !== 1) return;
    keybuf = (keybuf + e.key.toLowerCase()).slice(-6);
    if (keybuf !== 'nuanse') return;
    keybuf = '';
    const on = !document.body.classList.contains('allturn');
    document.body.classList.toggle('allturn', on);
    if (on) bump($$('.s').length);
  });
  /* Touch has no hover, so the device would simply be absent there. A
     triple-tap on the mark is the nuanse-house answer and it is three lines. */
  if (navSlot) {
    let taps = [];
    navSlot.addEventListener('touchend', () => {
      const now = Date.now();
      taps = taps.filter((x) => now - x < 700);
      taps.push(now);
      if (taps.length < 3) return;
      taps = [];
      const on = !document.body.classList.contains('allturn');
      document.body.classList.toggle('allturn', on);
    });
  }

  /* ------------------------------------------------------------------- NAV */
  const setNav = (dark) => { if (nav) nav.classList.toggle('dark', dark); };

  /* --- A1/D1 · revealed or hidden ---
     The header is not persistent any more. It is present and expanded for the
     whole opening frame, hides as you scroll down, and comes back the moment
     you scroll up. The scroll half of that is in buildCoreScroll below; this
     is the state, so that the menu and the focus handler can reach it too.

     navHold exists for one case that would otherwise be a trap: the menu's
     Close button IS the header's menu button, so a header that slid away
     while the full-screen menu was open would take the only pointer route
     out of it with it. Esc and the focus trap would still work, which is
     exactly the kind of "technically reachable" that the conventions file
     says is not good enough.

     Note on the no-GSAP path: buildCoreScroll never runs there, so nothing
     ever sets .away and the header simply stays visible for the whole visit.
     That is the right degradation rather than an oversight — A1 asks for a
     header that is present and readable with GSAP blocked, and a permanent
     one satisfies that. The hiding is the enhancement. */
  let away = false;
  let navHold = false;
  function setAway(on) {
    if (!nav) return;
    if (on && navHold) return;
    if (away === on) return;
    away = on;
    nav.classList.toggle('away', on);
  }

  /* --- the full-screen menu: owns every destination while collapsed --- */
  let lastMenuFocus = null;
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (open) {
      lastMenuFocus = document.activeElement;
      nav.dataset.prev = nav.classList.contains('dark') ? '1' : '0';
      setNav(true);
      /* reveal first, then hold: the Close button is in the header */
      navHold = false;
      setAway(false);
      navHold = true;
      stopScroll();
      cursorRest();
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else {
      setNav(nav.dataset.prev === '1');
      navHold = false;
      startScroll();
      if (lastMenuFocus) lastMenuFocus.focus({ preventScroll: true });
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  /* focus trap */
  if (menu) {
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
      const f = $$('a,button', menu);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* Round 3: the header no longer collapses or hides on scroll. It is one
     solid capsule for the whole visit — brand, links, the audit and Menu —
     because the compact pill read as an empty bar. Tabbing in still reveals
     it, for any page that calls setAway itself. */
  if (nav) nav.addEventListener('focusin', () => setAway(false));

  /* --- the sliding indicator ---
     Ported from nuanse-house, where it tracked whichever section owned the
     screen. The nav is four PAGES now, so the question it answers changed
     with it: not "which section" but "which page". It parks on the link for
     the page you are on and stays there.

     On the home page nothing matches - its nav points at the four other
     pages - so the indicator stays hidden rather than guessing. That is the
     honest answer: there is no fifth link saying "home". */
  const navInd = $('.nav-ind');
  function indTo(a) {
    if (!navInd) return;
    if (!a || !a.offsetWidth) { navInd.classList.remove('on'); return; }
    navInd.classList.add('on');
    navInd.style.width = `${a.offsetWidth}px`;
    navInd.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  function parkInd() { indTo(currentLink); }

  /* ------------------------------------------------- CURTAIN / PAGE CHANGE
     One element does the opener and every page change. With real pages now,
     an internal link plays the curtain down, then lets the browser navigate;
     the destination's own loader plays it back up. No router, no SPA. */
  const cover = $('.curtain-cover');
  const cmFlip = $('.cm-flip');
  const cmNavy = $('.cm-navy');
  const cmCopper = $('.cm-copper');
  const dim = $('.page-dim');
  const cMarks = $('.curtain-marks');
  const cLabel = $('.curtain-label');
  const cRule = $('.cl-rule');
  let busy = false;

  /* The mark on the curtain is two stacked copies of the real asset, and
     which one shows is a question about the ground under it. The first-visit
     opener starts on the cream cover, where the navy copy is the logo and the
     copper one fades up as the cover lifts. Every other time the curtain is
     shown — a page change, an anchor jump, a return visit — there is no
     cover, the ground is navy, and the navy copy reads as a flat blue S on
     navy rather than as the mark. So every one of those paths asks for copper
     before it shows anything. */
  function markOnNavy() {
    if (cmNavy) gsap.set(cmNavy, { opacity: 0 });
    if (cmCopper) gsap.set(cmCopper, { opacity: 1 });
  }

  /* an in-page anchor: curtain down, jump, curtain up */
  function goAnchor(target) {
    if (busy) return;
    busy = true;
    FOIL.setActive('open', true);
    markOnNavy();
    const wasMenu = menu && menu.classList.contains('open');
    if (RM) {
      gsap.timeline({ onComplete: () => { busy = false; } })
        .set(curtain, { yPercent: 0, opacity: 0, visibility: 'visible' })
        .to(curtain, { opacity: 1, duration: 0.3, ease: 'none' })
        .add(() => { if (wasMenu) setMenu(false); jumpTo(target); })
        .to(curtain, { opacity: 0, duration: 0.3, ease: 'none' })
        .set(curtain, { visibility: 'hidden' });
      return;
    }
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(curtain, { yPercent: 100, visibility: 'visible', opacity: 1 })
      .set(cmFlip, { rotation: 0 })
      .to(dim, { opacity: 0.45, duration: 0.45 }, 0)
      .to(curtain, { yPercent: 0, duration: 0.45 }, 0)
      .to(cmFlip, { rotation: 360, duration: 0.9 }, 0)
      .add(() => { if (wasMenu) setMenu(false); jumpTo(target); gsap.set(dim, { opacity: 0 }); }, 0.45)
      .to(curtain, { yPercent: -100, duration: 0.45 }, 0.45)
      .set(curtain, { visibility: 'hidden' })
      .add(() => FOIL.setActive('open', false));
  }

  /* a real page change: curtain down, then hand over to the browser */
  function goPage(url) {
    if (busy) return;
    busy = true;
    FOIL.setActive('open', true);
    markOnNavy();
    const leave = () => {
      try { sessionStorage.setItem('nu-via', '1'); } catch (e) {}
      window.location.href = url;
    };
    if (RM) {
      gsap.timeline({ onComplete: leave })
        .set(curtain, { yPercent: 0, opacity: 0, visibility: 'visible' })
        .to(curtain, { opacity: 1, duration: 0.3, ease: 'none' });
      return;
    }
    gsap.timeline({ onComplete: leave })
      .set(curtain, { yPercent: 100, visibility: 'visible', opacity: 1 })
      .set(cmFlip, { rotation: 0 })
      .to(dim, { opacity: 0.45, duration: 0.45 }, 0)
      .to(curtain, { yPercent: 0, duration: 0.45 }, 0)
      .to(cmFlip, { rotation: 360, duration: 0.9 }, 0);
  }

  /* [data-goto] is an in-page anchor. Any other internal link is a page
     change. Modified clicks and new-tab intents are left entirely alone. */
  $$('[data-goto]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      let t = a.getAttribute('data-goto');
      if (t === '#top') t = $('#top') || $('[data-nav-anchor]');
      goAnchor(t);
    });
  });
  /* A mailto does nothing visible on a machine with no mail app set up, so
     every mail link also copies the address and says so. The link itself is
     never prevented: where a mail app exists it still opens. */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    const addr = decodeURIComponent(a.getAttribute('href').slice(7).split('?')[0]);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(addr).then(
        () => toast(`Opening your mail app · ${addr} copied`),
        () => toast(`Opening your mail app · ${addr}`));
    } else {
      toast(`Opening your mail app · ${addr}`);
    }
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-goto') || a.dataset.noCurtain === '1') return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;         /* outbound: leave it */
    if (url.pathname === window.location.pathname) return;      /* same page */
    e.preventDefault();
    goPage(url.href);
  });

  /* --------------------------------------------- BACK, AND THE CURTAIN
     A6. "Work -> Zingara -> back leaves the page stuck showing the wallpaper
     layer." Reproduced before it was fixed, and the mechanism is this:

     goPage() is deliberately a one-way door. It sets busy, asks the foil for
     the 'open' ground, animates the curtain to FULL COVER, and only then
     hands over to the browser — the cover is the page transition, so it must
     still be down at the moment the document is abandoned.

     Press Back and that document comes out of the back/forward cache exactly
     as it was abandoned. bfcache restores the DOM, the inline styles GSAP
     wrote and every live closure variable; it does not re-run the script and
     it does not fire `load`, so nothing here used to get told. The page came
     back with .curtain at visibility:visible, opacity:1, yPercent:0 over the
     whole viewport at z-index 300, and .curtain-foil — the copper-foil canvas
     — drawing at opacity .42 underneath it. That canvas on the navy ground IS
     the "wallpaper layer" in the report. The page scrolled perfectly well the
     whole time; it was covered, not frozen, which is exactly what the report
     described.

     busy also came back true, which was the quieter half of the same bug:
     every later goPage() and goAnchor() returns early on it, so after one
     Back no internal link on the page did anything at all.

     Measured in the harness, which had to be taught to have a bfcache first:
     Playwright passes --disable-back-forward-cache in its own default args,
     and with it in place Back is an ordinary fresh load — the one case that
     does NOT show the bug. A first pass over this found nothing for that
     reason.

     The fix is to put the chrome back the way loader() leaves it. It runs
     only for a persisted restore: an ordinary Back that misses the cache is a
     fresh document whose own loader handles it. */
  function restoreChrome() {
    busy = false;
    FOIL.setActive('open', false);
    /* loader() finishes with the curtain hidden and off the top, the cream
       cover display:none and the dim clear. Both of its paths land there —
       one by yPercent, one by opacity — so resetting all three is what makes
       this correct after either. */
    if (curtain) gsap.set(curtain, { visibility: 'hidden', opacity: 1, yPercent: -100 });
    if (cover) gsap.set(cover, { display: 'none' });
    if (dim) gsap.set(dim, { opacity: 0 });
    if (cmFlip) gsap.set(cmFlip, { rotation: 0 });
    html.classList.remove('loading');
    /* The menu is a plausible thing to have left open, and its clip-path
       would be restored open with it. */
    if (menu && menu.classList.contains('open')) setMenu(false);
    /* Scrolling was stopped for the transition. Nothing else restarts it. */
    startScroll();
    /* Present after a Back, whatever state the header was left in — someone
       returning to a page wants to know where they are. */
    setAway(false);
    /* The viewport may be a different size than when the page was abandoned
       (a rotation, a resized window), and every pin was measured against the
       old one. */
    sizeFooter();
    ScrollTrigger.refresh();
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted) restoreChrome(); });

  /* ---------------------------------------------------------------- LOADER */
  let introRan = false;
  function loader(done) {
    if (!curtain) { done(); return; }
    if (RM) {
      markOnNavy();
      gsap.timeline({ onComplete: done })
        .to(curtain, { opacity: 0, duration: 0.5, ease: 'none' }, 0.2)
        .set(curtain, { visibility: 'hidden', opacity: 1 })
        .set(cover, { display: 'none' })
        .add(() => FOIL.setActive('open', false));
      return;
    }
    /* Through the curtain: the page starts under the same navy, foil and
       copper mark the last one left on, holds a beat so the ground is seen
       moving, and the curtain carries on up the way it came. A fade here
       read as a flash, which was the glitch on every page change. */
    if (VIA) {
      markOnNavy();
      gsap.set(cover, { display: 'none' });
      introRan = true;
      gsap.timeline({ onComplete: done })
        .to(cmFlip, { rotation: 360, duration: 0.7 }, 0)
        .to(curtain, { yPercent: -100, duration: 0.6 }, 0.22)
        .add(() => { introHooks.forEach((fn) => fn()); }, 0.4)
        .set(curtain, { visibility: 'hidden' })
        .set(cmFlip, { rotation: 0 })
        .add(() => FOIL.setActive('open', false));
      return;
    }
    introRan = true;
    /* The opener: the cream cover lifts off a copper-foil navy ground, the
       mark turns, then four pre-press crop marks and a measuring rule
       appear — the page is being registered on press before it prints.

       The mark is the real asset now, so the turn runs the other way round
       from the old typographic version: the asset IS the reversed S, so it
       starts mirrored (reading as a conventional S) and rotates to true,
       cross-fading navy to copper as it lands. Same beat, real logo. */
    gsap.set(cmFlip, { scaleX: -1 });
    gsap.timeline({ onComplete: done })
      .to(cmFlip, { scaleX: 1, duration: 0.45 }, 0.05)
      .to(cmNavy, { opacity: 0, duration: 0.45 }, 0.05)
      .to(cmCopper, { opacity: 1, duration: 0.45 }, 0.05)
      .to(cover, { yPercent: -100, duration: 0.5 }, 0.28)
      .to(cMarks, { opacity: 1, duration: 0.28, ease: 'none' }, 0.46)
      .to(cLabel, { opacity: 1, duration: 0.28, ease: 'none' }, 0.52)
      .to(cRule, { scaleX: 1, duration: 0.42 }, 0.52)
      .to(curtain, { yPercent: -100, duration: 0.5 }, 0.72)
      .add(() => { introHooks.forEach((fn) => fn()); }, 0.85)
      .set(curtain, { visibility: 'hidden' })
      .set(cover, { display: 'none' })
      .set($('.curtain-mark'), { scale: 0.5 })
      .set([cMarks, cLabel], { opacity: 0 })
      .set(cRule, { scaleX: 0 })
      .add(() => FOIL.setActive('open', false));
  }
  const introHooks = [];
  const onIntro = (fn) => { introHooks.push(fn); };

  /* ---------------------------------------------------------------- FOOTER */
  const page = $('.page');
  const footer = $('.footer');
  /* The footer is revealed from under the page, which only works while it
     fits the screen: fixed to the bottom, anything taller than the window is
     cut off at the top and can never be scrolled to. On a short phone it is,
     so there it simply follows the page instead. */
  function sizeFooter() {
    if (!page || !footer) return;
    footer.classList.remove('ft-flow');
    const tall = footer.offsetHeight > window.innerHeight + 1;
    footer.classList.toggle('ft-flow', tall);
    page.style.marginBottom = tall ? '' : `${footer.offsetHeight}px`;
  }

  /* The footer's S. The wordmark is cut in two by tools/build-brand-assets.py,
     the letters and the copper S, and the S is laid back over its own gap so
     the mark reads whole. At rest it floats, barely: a few percent of lift
     and a degree or two of lean, only while the footer is on screen and
     nothing else owns the stage. Hovered, it swells a little and its
     outline draws round it (the outline is CSS, so it also answers focus).
     Pulled, it follows the pointer at half the distance and springs home on
     release. The outline sits a few pixels off the S's own contour and the
     nearest letter is further than the swell plus the outline, so the two
     never touch the N or the E. */
  function wireFtS() {
    const s = $('.ft-s');
    if (!s || RM) return;
    let idle = null;
    let dragging = false;
    let over = false;
    idle = gsap.to(s, {
      yPercent: -2.2, rotation: 1.6, duration: 2.9,
      yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true
    });
    const sync = () => {
      if (MOTION.ft && !calm() && !dragging && !over) idle.play();
      else idle.pause();
    };
    onIdleChange(sync);

    const swell = (on) => gsap.to(s, {
      scale: on ? 1.07 : 1, duration: on ? 0.7 : 0.5,
      ease: on ? 'elastic.out(1,0.5)' : 'power3.out', overwrite: 'auto'
    });
    const home = () => {
      s.classList.remove('drag');
      gsap.to(s, {
        x: 0, y: 0, rotation: 0, duration: 1.5,
        ease: 'elastic.out(1,0.34)', overwrite: 'auto',
        onComplete: sync
      });
      swell(over);
    };

    s.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      over = true; sync(); swell(true);
    });
    s.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      over = false;
      if (!dragging) { swell(false); sync(); }
    });

    let sx = 0;
    let sy = 0;
    s.addEventListener('pointerdown', (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY;
      s.setPointerCapture(e.pointerId);
      s.classList.add('drag');
      sync();
      gsap.killTweensOf(s, 'x,y,rotation');
      gsap.to(s, { scale: 1.1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    });
    s.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      gsap.set(s, { x: dx * 0.5, y: dy * 0.5, rotation: clamp(dx * 0.06, -12, 12) });
    });
    const release = () => { if (dragging) { dragging = false; home(); } };
    s.addEventListener('pointerup', release);
    s.addEventListener('pointercancel', release);
    /* the keyboard gets the same pull and spring, so the toy is not mouse-only */
    s.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-36, 0], ArrowRight: [36, 0], ArrowUp: [0, -36], ArrowDown: [0, 36] }[e.key];
      if (!k) return;
      e.preventDefault();
      idle.pause();
      gsap.timeline()
        .to(s, { x: k[0], y: k[1], rotation: k[0] * 0.2, scale: 1.08, duration: 0.3, ease: 'power3.out' })
        .add(home);
    });
  }

  /* ------------------------------------------------------- shared scroll
     Built once, after any page pins exist, so trigger order is right. */
  function buildCoreScroll() {
    /* Nav theme per section.

       Scoped to sections INSIDE .page on purpose. The footer is
       position:fixed, so its getBoundingClientRect is viewport-relative and
       constant — ScrollTrigger resolves it to a scroll position near zero and
       fires its onEnter immediately, which flips the nav to its dark theme
       while the hero is still on screen. Cream ink on the cream hero: the nav
       all but disappears. The footer gets its own trigger further down, off
       maxScroll, which is the correct way to catch it. */
    $$('.page section[data-nav]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 36px', end: 'bottom 36px',
        onEnter: () => setNav(sec.dataset.nav === 'dark'),
        onEnterBack: () => setNav(sec.dataset.nav === 'dark')
      });
    });
    /* A trigger whose start is already behind us at load never fires onEnter,
       so the opening section's theme has to be set by hand. */
    const firstSec = $('.page section[data-nav]');
    if (firstSec) setNav(firstSec.dataset.nav === 'dark');
    /* the indicator parks on the current page's link, once layout exists */
    parkInd();

    /* the header hides on the way down and comes back on the way up */
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => setAway(s.direction === 1 && s.scroll() > 120)
    });

    /* the nav mark rotates with scroll progress */
    if (!RM && navSpin) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (s) => gsap.set(navSpin, { rotation: s.progress * 360 })
      });
    }

    /* heading reveals: words rise from their mask */
    $$('.h-split').forEach((h) => {
      if (h.dataset.noReveal === '1') return;
      const ws = $$('.wi', h);
      if (RM || !ws.length) {
        gsap.from(h, {
          opacity: 0, duration: 0.6, ease: 'none',
          scrollTrigger: { trigger: h, start: 'top 90%', once: true }
        });
        return;
      }
      gsap.fromTo(ws,
        { yPercent: 115, rotation: 2 },
        { yPercent: 0, rotation: 0, duration: 0.7, stagger: 0.05,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });

    /* body copy fades up to ink. No blur: cheap, and the words never look
       broken mid-reveal.

       It starts at 0, not at the 0.2 it used to: at 0.2 the copy is visible
       but measures 1.41:1, so a visitor who stops scrolling mid-reveal, or
       whose tab is throttled, is left looking at body text they cannot read.
       Absent is honest; illegible is not. The reduced-motion branch just
       below already faded from 0, so this is one behaviour now, not two. */
    $$('.ink').forEach((p) => {
      if (RM) {
        gsap.from(p, {
          opacity: 0, duration: 0.6, ease: 'none',
          scrollTrigger: { trigger: p, start: 'top 92%', once: true }
        });
        return;
      }
      gsap.fromTo(p, { opacity: 0 }, {
        opacity: 1, duration: 0.7,
        scrollTrigger: { trigger: p, start: 'top 90%', once: true }
      });
    });

    /* the footer lifts into place as the page clears it */
    if (footer) {
      if (!RM) {
        gsap.fromTo('.ft-in',
          { y: () => (footer.classList.contains('ft-flow') ? 0 : -window.innerHeight * 0.25), opacity: 0.3 },
          { y: 0, opacity: 1, ease: 'none',
            scrollTrigger: {
              start: () => ScrollTrigger.maxScroll(window) - footer.offsetHeight,
              end: () => ScrollTrigger.maxScroll(window),
              scrub: true, invalidateOnRefresh: true
            } });
      }
      ScrollTrigger.create({
        start: () => ScrollTrigger.maxScroll(window) - footer.offsetHeight * 0.5,
        end: 'max',
        onEnter: () => { setNav(true); footer.classList.add('ft-seen'); }
      });
      ScrollTrigger.create({
        trigger: footer, start: 'top bottom', end: 'bottom top',
        onToggle: (s) => { MOTION.ft = s.isActive; syncIdle(); }
      });
    }
  }

  /* ------------------------------------------------------------------- ESC */
  const escHooks = [];
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    escHooks.forEach((fn) => fn());
    if (menu && menu.classList.contains('open')) setMenu(false);
  });

  /* ------------------------------------------------------------------ boot */
  let booted = false;
  const buildHooks = [];
  function boot() {
    if (booted) return;
    booted = true;
    markPage();
    sizeFooter();
    wireFtS();
    watchTurns();
    buildHooks.forEach((fn) => fn());      /* page scripts register their pins */
    buildCoreScroll();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    loader(() => {
      html.classList.remove('loading');
      if (!introRan) introHooks.forEach((fn) => fn());
      startScroll();
      ScrollTrigger.refresh();
      readyHooks.forEach((fn) => fn());
    });
  }
  const readyHooks = [];

  /* split every .h-split into masked words and wrap its S's. Done once, in
     core, so every page's headings behave identically. */
  function markPage() {
    $$('.h-split').forEach((h) => {
      if (h.dataset.split === '1') return;
      /* A heading can opt out and do its own splitting. The home page's
         headline does: it is written as five lines, one of which is a slot
         whose word changes, and flattening it to text would throw that slot
         away. Nothing else uses this, and a page that takes it on owes its
         own masks, its own wrapS and its own aria-label. */
      if (h.dataset.split === 'skip') return;
      h.dataset.split = '1';
      const label = h.textContent.replace(/\s+/g, ' ').trim();
      if (!h.closest('[aria-hidden=true]')) h.setAttribute('aria-label', label);
      const tmp = document.createElement('div');
      tmp.innerHTML = h.innerHTML;
      const text = tmp.textContent.replace(/\s+/g, ' ').trim();
      h.innerHTML = text.split(' ')
        .map((w) => `<span class="w" aria-hidden="true"><span class="wi">${wrapS(w)}</span></span>`)
        .join(' ');
    });
    $$('.btn-label').forEach((b) => {
      if (b.dataset.split === '1') return;
      b.dataset.split = '1';
      b.innerHTML = wrapS(b.textContent);
    });
  }

  /* Boot waits for two things: the fonts, so nothing measures against a
     fallback face, and the DOM, so every page script has had its turn to
     register through onBuild. Waiting on fonts alone is a race — document.
     fonts.ready can already be resolved, and its .then would then fire in the
     microtask gap between this script tag and the next one, booting before
     home.js has registered a single pin. */
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const domReady = new Promise((res) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => res(), { once: true });
    } else {
      /* a frame, not a microtask: it has to clear sibling deferred scripts */
      requestAnimationFrame(() => res());
    }
  });
  Promise.all([domReady, fontsReady]).then(boot, boot);
  setTimeout(boot, 2500);               /* never let a font stall the page */

  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      sizeFooter();
      FOIL.refit();
      ScrollTrigger.refresh();
      resizeHooks.forEach((fn) => fn());
    }, 200);
  });
  const resizeHooks = [];
  resizeHooks.push(parkInd);          /* the pill's links move when it reflows */

  /* ------------------------------------------------- A HAND-DRAWN LOOP
     One open ellipse, overshooting itself by a tenth of a turn, with a slow
     wobble on the radius so it reads as drawn rather than plotted. The home
     page loops its slider annotations with it and the work index loops the
     proof prints, so it is here rather than in either of them. */
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

  /* --------------------------------------------------------- A FOCUS TRAP
     A modal must not let Tab walk out of it. Promoted out of home.js: the
     case overlay moved to the work index and the audit modal stayed on the
     home page, so two pages need this and neither owns it. */
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

  /* --------------------------------------------------------------- exports
     The contract page scripts build against. Anything a second page needs
     belongs here; anything only one page needs stays in that page's script. */
  window.NU = {
    /* flags and helpers */
    RM, TOUCH, VIA, EASE, $, $$, clamp, esc,
    /* text */
    wrapS, wrapWords, markS, watchTurns,
    /* motion */
    MOTION, calm, pinClaim, stickPin, onIdleChange, syncIdle, FOIL,
    /* scroll */
    lenis, stopScroll, startScroll, jumpTo,
    /* chrome */
    nav, setNav, setAway, setMenu, toast, cursorRest, sizeFooter, goPage, trap, loopPath,
    navSlot, navMark, navSpin,
    /* lifecycle: page scripts hook in rather than racing boot */
    onBuild: (fn) => buildHooks.push(fn),
    onIntro,
    onReady: (fn) => readyHooks.push(fn),
    onResize: (fn) => resizeHooks.push(fn),
    onEsc: (fn) => escHooks.push(fn)
  };
})();
