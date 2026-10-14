/* ============================================================================
   NUANSE — team.js · eight people, one standard

   The eight drawn portraits, the brief builder that lifts the ones your brief
   needs into the lane, and the parallax scatter. Moved off the home page
   verbatim.

   The portraits are drawn, not photographed: the kit ships no team
   photography and inventing faces would be worse than drawing them. See
   brief/04-asset-inventory.md item 11.

   Loaded after core.js and only by team.html. Everything shared — the loader,
   nav, cursor, scroll, footer, the focus trap — is core's. It registers through
   NU rather than racing core's boot: NU.onBuild for anything that creates a
   ScrollTrigger, NU.onReady for after the curtain has lifted.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, EASE, esc } = NU;

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

  /* ===================================================== the no-GSAP floor
     The portraits are static SVG, so they are built above the guard: if GSAP
     never arrives this page still has eight people in it rather than an
     empty grid. */
  buildTeam();
  if (NU.dead) return;

  /* ========================================================== build phase */
  NU.onBuild(() => {
    wireBuilder();
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
  });
})();
