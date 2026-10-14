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

  /* The curtain theatre plays once per session, not on every page view. With
     real page navigation now in play this matters more than it did: without
     it, every click through the site would replay the full opener. */
  let SEEN = false;
  try {
    SEEN = sessionStorage.getItem('nu-seen') === '1';
    sessionStorage.setItem('nu-seen', '1');
  } catch (e) {}

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
     and it is gated off on touch and reduced motion, where a GPU canvas is
     not worth the battery. */
  const FOIL = (() => {
    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
    const FS = [
      'precision highp float;',
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
      audit: { ramp: ['#0D1A41', '#08112E', '#B56528', '#D58A4E'], warp: 3.0, scale: 1.6, speed: 0.45, grain: 0.03 }
    };

    const hx = (h) => [
      parseInt(h.slice(1, 3), 16) / 255,
      parseInt(h.slice(3, 5), 16) / 255,
      parseInt(h.slice(5, 7), 16) / 255
    ];

    function fit(cv) {
      const r = cv.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(2, (r.width * d) | 0);
      const h = Math.max(2, (r.height * d) | 0);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }

    const rigs = [];
    let running = false;
    let last = 0;

    function add(sel, name) {
      const cv = $(sel);
      if (!cv) return null;
      if (TOUCH || RM) { cv.style.display = 'none'; return null; }

      let gl = null;
      try {
        gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
      } catch (e) {}
      const bail = () => { cv.style.display = 'none'; return null; };
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
        e.preventDefault(); g.on = false; cv.style.display = 'none';
      });
      g.draw();                        /* one frame now, so nothing starts blank */
      rigs.push(g);
      return g;
    }

    function tick(now) {
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
  const navIn = $('.nav-in');
  const navBar = $('.nav-bar');
  const navEnd = $('.nav-end');
  const navBrand = $('.nav-brand');
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
     it is the reason the slot exists: there, the hero's S flies up into it on
     scroll, so the mark starts invisible and the dashed ring stands empty
     until it lands. A page that flies it is a page with a .flyer; everything
     else simply has its logo, ring filled, from the first frame — which is
     also what the no-GSAP path below has always done. */
  if (nav && $('.flyer')) {
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
    buildS3D();          /* decorative, but an empty 220px box is worse */
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

    window.addEventListener('pointermove', (e) => {
      lx = e.clientX; ly = e.clientY;
      cx(lx); cy(ly);
      check(e.target);
    }, { passive: true });
    /* scrolling moves targets under a stationary pointer */
    window.addEventListener('scroll', () => {
      if (lx >= 0) check(document.elementFromPoint(lx, ly));
    }, { passive: true });
    document.addEventListener('pointerleave', () => check(null));
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
      stopScroll();
      cursorRest();
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else {
      setNav(nav.dataset.prev === '1');
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

  /* --- expanded / compact ---
     Requirement 4. Driven off the first frame's own height, not a pixel
     threshold, so it stays correct when that frame's height changes — and so
     a project page's opening frame drives it the same way the hero does.

     Hysteresis is the point of the two thresholds: collapse at 62% of the
     frame, expand again at 42%. A nav parked exactly on one boundary would
     otherwise flicker on every small scroll. */
  const navAnchor = $('[data-nav-anchor]');
  let compact = false;
  function setCompact(on) {
    if (compact === on || !nav) return;
    compact = on;
    if (RM) { nav.classList.toggle('compact', on); parkInd(); return; }
    const targets = [navIn, navBrand, navEnd, navBar, $('.wordmark'), $('.turned'), menuBtn].filter(Boolean);
    const state = Flip.getState(targets, { props: 'padding,gap' });
    nav.classList.toggle('compact', on);
    Flip.from(state, {
      duration: 0.6,
      ease: EASE,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.3 })
    });
    /* the pill is measured after the Flip has written the new layout */
    requestAnimationFrame(parkInd);
  }
  /* Focus landing inside the nav forces it open, so a keyboard user never
     meets a collapsed pill with links they cannot reach. */
  if (nav) {
    nav.addEventListener('focusin', () => {
      if (compact && window.innerWidth > 900) setCompact(false);
    });
  }

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
    if (!a || !a.offsetWidth || compact) { navInd.classList.remove('on'); return; }
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
    const leave = () => { window.location.href = url; };
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

  /* ---------------------------------------------------------------- LOADER */
  function loader(done) {
    if (!curtain) { done(); return; }
    if (RM || SEEN) {
      markOnNavy();
      gsap.timeline({ onComplete: done })
        .to(curtain, { opacity: 0, duration: RM ? 0.5 : 0.3, ease: 'none' }, RM ? 0.2 : 0)
        .set(curtain, { visibility: 'hidden', opacity: 1 })
        .set(cover, { display: 'none' })
        .add(() => FOIL.setActive('open', false));
      return;
    }
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
  function sizeFooter() {
    if (page && footer) page.style.marginBottom = `${footer.offsetHeight}px`;
  }

  /* The 3D mark: eighteen stacked copies of the real asset, ramped from dark
     through copper to a cream highlight. Built here rather than in markup so
     the layer count can drop under reduced motion, and so no `style`
     attribute is ever written into innerHTML — the CSP would block it. */
  const s3dObj = $('.s3d-obj');
  /* Queries its own host rather than closing over the const above, so it can
     also be called from the no-GSAP branch, which runs earlier. Building the
     mark needs no animation library — it is img elements and a transform. */
  function buildS3D() {
    const host = $('.s3d-obj');
    if (!host) return;
    const base = host.dataset.copper;
    const tip = host.dataset.cream;
    if (!base || !tip) return;
    const n = RM ? 6 : 18;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const layer = document.createElement('div');
      layer.className = 's3d-l';
      const img = document.createElement('img');
      img.className = 'mark';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.decoding = 'async';
      img.width = 256;
      img.height = 369;
      if (i === n - 1) {
        img.src = tip;                                 /* cream front face */
      } else {
        img.src = base;
        /* 0.386 lands the copper master on the dark brown the design used at
           the back of the stack; the last few layers lift past 1 to reach
           copper-light before the cream face. */
        const b = i > n - 4 ? 1.18 : 0.386 + t * 0.614;
        img.style.filter = `brightness(${b.toFixed(3)})`;
      }
      layer.style.transform = `translateZ(${((i - (n - 1) / 2) * 2.2).toFixed(1)}px)`;
      layer.appendChild(img);
      frag.appendChild(layer);
    }
    host.replaceChildren(frag);
  }

  function wireS3D() {
    const s3d = $('.s3d');
    if (!s3d || !s3dObj) return;
    let idle = null;
    let dragging = false;
    if (!RM) {
      idle = gsap.to(s3dObj, {
        rotationY: 16, rotationX: -4, duration: 3.2,
        yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true
      });
      gsap.set(s3dObj, { rotationY: -16 });
    }
    /* the mark only sways while the footer is in view and nothing else owns
       the stage */
    const sync = () => {
      if (!idle) return;
      if (MOTION.ft && !calm() && !dragging) idle.play();
      else idle.pause();
    };
    onIdleChange(sync);

    const spring = () => {
      gsap.to(s3dObj, {
        x: 0, y: 0, rotationX: 0, rotationY: 0,
        duration: RM ? 0.3 : 1.8,
        ease: RM ? 'none' : 'elastic.out(1,0.32)',
        onComplete: () => { if (idle) { gsap.set(s3dObj, { rotationY: -16 }); idle.restart(); sync(); } }
      });
    };

    let sx = 0;
    let sy = 0;
    s3d.addEventListener('pointerdown', (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY;
      s3d.setPointerCapture(e.pointerId);
      sync();
      gsap.killTweensOf(s3dObj, 'x,y');
    });
    s3d.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      gsap.set(s3dObj, {
        x: dx * 0.55, y: dy * 0.55,
        rotationY: clamp(dx * 0.6, -80, 80),
        rotationX: clamp(-dy * 0.6, -60, 60)
      });
    });
    const release = () => { if (dragging) { dragging = false; spring(); } };
    s3d.addEventListener('pointerup', release);
    s3d.addEventListener('pointercancel', release);
    /* keyboard gets the same spring, so the toy is not mouse-only */
    s3d.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key];
      if (!k) return;
      e.preventDefault();
      if (idle) idle.pause();
      gsap.timeline()
        .to(s3dObj, { x: k[0], y: k[1], rotationY: k[0], rotationX: -k[1], duration: 0.3 })
        .add(spring);
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
    /* the wash behind the expanded nav */
    ScrollTrigger.create({
      start: 20, end: 'max',
      onToggle: (s) => { if (nav) nav.classList.toggle('scrolled', s.isActive); }
    });

    /* expanded -> compact, with hysteresis off the first frame's height */
    if (navAnchor && nav) {
      const frame = () => navAnchor.offsetHeight || window.innerHeight;
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: () => {
          const y = window.scrollY || window.pageYOffset;
          const h = frame();
          if (!compact && y > h * 0.62) setCompact(true);
          else if (compact && y < h * 0.42) setCompact(false);
        }
      });
    }

    /* the indicator parks on the current page's link, once layout exists */
    parkInd();

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
          { y: () => -window.innerHeight * 0.25, opacity: 0.3 },
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
        onEnter: () => setNav(true)
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
    buildS3D();
    wireS3D();
    watchTurns();
    buildHooks.forEach((fn) => fn());      /* page scripts register their pins */
    buildCoreScroll();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    loader(() => {
      html.classList.remove('loading');
      if (RM || SEEN) introHooks.forEach((fn) => fn());
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
    RM, TOUCH, SEEN, EASE, $, $$, clamp, esc,
    /* text */
    wrapS, wrapWords, markS, watchTurns,
    /* motion */
    MOTION, calm, pinClaim, onIdleChange, syncIdle, FOIL,
    /* scroll */
    lenis, stopScroll, startScroll, jumpTo,
    /* chrome */
    nav, setNav, setMenu, toast, cursorRest, sizeFooter, goPage, trap, loopPath,
    navSlot, navMark, navSpin,
    /* lifecycle: page scripts hook in rather than racing boot */
    onBuild: (fn) => buildHooks.push(fn),
    onIntro,
    onReady: (fn) => readyHooks.push(fn),
    onResize: (fn) => resizeHooks.push(fn),
    onEsc: (fn) => escHooks.push(fn)
  };
})();
