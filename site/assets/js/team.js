/* ============================================================================
   NUANSE — team.js · ten people, one standard

   The ten drawn portraits, the brief builder that lifts the ones your brief
   needs into the lane, and the parallax scatter.

   TEN NAMED PEOPLE, NOT EIGHT INVENTED ROLES. This file used to carry eight
   unnamed roles — "Design lead", "Producer" — with a portrait picked from
   eight hair shapes. The studio publishes ten people, by name, with roles.
   Names and roles here are exactly as published; nothing is paraphrased and
   nothing is added. See brief/06-revision-plan.md §1.9 and decision D3.

   The portraits stay drawn rather than photographed. That is still the right
   call while the kit ships no team photography — but these are real people
   now, so the drawing has a duty it did not have before. Each one is built
   from what a photograph of that person actually shows: hair, glasses,
   beard, an open smile, an earring, what they are wearing at the collar.
   Nothing beyond that is implied, and the style stays plainly stylised so no
   drawing can be mistaken for a likeness it has not earned. If the
   photography is ever put on file it beats any of this and the page should
   take it.

   The chips each person answers to are read off their published role rather
   than guessed — decision D4. Three client-side roles (Client Acquisition,
   Business Development, Relationship Manager) map to `strategy` because it is
   the nearest of the six chips to all three. That is a judgement, it is the
   only one in the table, and it is written down here rather than buried.

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

  /* ============================================================ 10 · TEAM
     name  — as published
     role  — as published, verbatim
     skills— the chips this role answers to (D4)
     hair  — one of the shapes below
     feat  — glasses, facial hair, expression, earring
     dress — what the shoulders carry */
  const TEAM = [
    { name: 'Abhinav Marothia', role: 'Founder & Creative Director',
      skills: 'strategy identity websites content film performance',
      hair: 'swept-mid', brow: 'heavy', feat: 'glasses-square moustache',
      dress: 'blazer' },
    { name: 'Harshit R.', role: 'Full-Stack Development & 3D',
      skills: 'websites',
      hair: 'curls-long', brow: 'heavy', feat: 'glasses-round', dress: 'crew' },
    { name: 'Sujeeth', role: 'UI/UX & Web Design',
      skills: 'websites identity',
      hair: 'curls-tall', brow: 'heavy', feat: 'moustache stubble',
      dress: 'collar' },
    { name: 'Likhita R. Jain', role: 'Sustainable Materials & Arts',
      skills: 'identity',
      hair: 'waves-long', brow: 'soft', feat: 'smile-open', dress: 'round' },
    { name: 'Manish S.', role: 'Performance Marketing',
      skills: 'performance',
      hair: 'crop', brow: 'heavy', feat: 'beard-full moustache', dress: 'crew' },
    { name: 'Varun KS', role: 'Photography & Videography',
      skills: 'film content',
      hair: 'curls-volume', brow: 'heavy', feat: 'moustache', dress: 'crew' },
    { name: 'Yusra', role: 'Client Acquisition',
      skills: 'strategy',
      hair: 'waves-xlong', brow: 'soft', feat: 'earring', dress: 'blazer' },
    { name: 'Manasi', role: 'Business Development',
      skills: 'strategy',
      hair: 'straight-long', brow: 'soft', feat: 'earring',
      dress: 'collar-open' },
    { name: 'Hari T.', role: 'Relationship Manager',
      skills: 'strategy',
      hair: 'short', brow: 'heavy', feat: 'beard-full smile-open',
      dress: 'collar' },
    { name: 'Manideep Chilukuri', role: 'Application Development',
      skills: 'websites',
      hair: 'curls-crop', brow: 'heavy', feat: 'beard-full', dress: 'collar' }
  ];

  /* The face is an ellipse at cx100 cy106, rx34 ry42 — so it spans x 66-134
     and y 64-148. Every shape below is drawn against those four numbers.

     Hair is TWO layers. BACK carries the length and sits behind the face;
     FRONT is the crown and stops at a hairline near y84; the face ellipse is
     drawn between them. Drawn as one silhouette on top the inner edge lands
     across the eyes and every long style reads as a helmet.

     No two people share a hair shape, a brow weight and a neckline. That is
     deliberate: ten portraits built from four hair shapes and one neckline
     read as one template run ten times, however carefully each is drawn. */
  function portrait(p, i) {
    const N = '#0D1A41';
    const C = '#FCF7F1';
    const has = (k) => (' ' + p.feat + ' ').indexOf(' ' + k + ' ') > -1;

    /* length behind the head: a blob the face covers, plus two falls */
    const fall = (yEnd, flare) => `
      <path d="M64 96 C58 50 92 38 100 42 C132 38 146 56 140 96
        C140 130 139 152 137 176 L63 176 C61 152 64 130 64 96Z" fill="${N}"/>
      <path d="M62 100 C${56 - flare} 150 ${60 - flare} ${yEnd - 30} ${56 - flare} ${yEnd}
        L78 ${yEnd} C74 ${yEnd - 32} 72 150 74 112Z" fill="${N}"/>
      <path d="M138 100 C${144 + flare} 150 ${140 + flare} ${yEnd - 30} ${144 + flare} ${yEnd}
        L122 ${yEnd} C126 ${yEnd - 32} 128 150 126 112Z" fill="${N}"/>`;

    const BACK = {
      /* A man's shoulder-length sweep. Two falls of equal width either side of
         a rounded cap is a centre-parted bob however long you make it, which
         is exactly how this read first time. So: the length is TUCKED BEHIND
         THE EARS — narrow, set back at x63-76 and x124-137 — and cut blunt at
         y152 rather than tapering. The silhouette is the signal; the glasses,
         brows and moustache only confirm it. */
      /* A NAPE, not two falls beside the face.
         The source photograph is shoulder-length waved hair, and three
         attempts at drawing it honestly all read female at lane size, because
         at 100-240px a dark mass either side of the face down to the jaw IS
         the signal, and it drowns out brows, glasses and a moustache put on
         top of it. So the length moves behind the head: it sits at y140-168
         between x78 and x122, where the shoulders all but cover it, and the
         face is framed by nothing. A deliberate trade of literal likeness for
         a portrait that reads as the person it names. */
      'swept-mid': `
        <path d="M70 96 C64 50 92 38 100 42 C130 38 140 54 134 96
          C134 118 130 140 126 164 L78 164 C74 140 70 118 70 96Z" fill="${N}"/>`,
      'waves-long': fall(180, 3),
      /* curls, so the length has to look curled: a straight fall either side
         reads as long straight hair, which is not what the photograph shows
         and not how Harshit reads next to Manasi, who IS straight-long */
      'curls-long': fall(180, 4) + `<g fill="${N}">
        <circle cx="62" cy="122" r="13"/><circle cx="59" cy="144" r="13"/>
        <circle cx="63" cy="165" r="12"/><circle cx="70" cy="181" r="10"/>
        <circle cx="138" cy="122" r="13"/><circle cx="141" cy="144" r="13"/>
        <circle cx="137" cy="165" r="12"/><circle cx="130" cy="181" r="10"/></g>`,
      'waves-xlong': fall(216, 6),
      'straight-long': fall(220, 0),
      'curls-tall': '', 'curls-volume': '', 'curls-crop': '', crop: '', short: ''
    };

    /* the crown. Every one stops at a hairline near y84, so there is always a
       forehead between the hair and the eyes at y108. */
    const FRONT = {
      /* SWEPT BACK off the forehead, with the ears left showing and the length
         falling behind them. This is the third attempt and the first that
         reads right at 100px in the lane.

         What failed: a rounded cap plus two equal falls either side of the
         jaw is a centre-parted bob however long it is and whatever brows,
         glasses and moustache you hang on it — at lane size the silhouette is
         all there is, and the silhouette was saying the opposite of the
         caption. A drawn parting read as a scratch at that size.

         What works is the hairline and the ears: hair off the forehead to y76
         in the centre, temples at y96, and the falls set out to x55-72 and
         x128-145 so they sit BEHIND the ears, which are then drawn over the
         top. Visible ears with length behind them is the whole read. */
      /* Swept back and across, with the left temple low and the right hairline
         riding high — asymmetry is what stops a crown reading as a bob. No
         sideburn blocks: drawn beside the square glasses they read as
         headphones, which is the kind of thing only a rendered frame tells
         you. */
      'swept-mid': `<path d="M62 104 C58 54 86 40 106 46 C132 52 142 74 138 102
          C133 84 123 72 107 70 C91 68 76 79 67 94 C65 97 63 101 62 104Z" fill="${N}"/>`,
      'curls-long': `<g fill="${N}"><circle cx="76" cy="80" r="14"/>
        <circle cx="88" cy="64" r="14"/><circle cx="104" cy="60" r="15"/>
        <circle cx="121" cy="66" r="14"/><circle cx="132" cy="82" r="13"/>
        <circle cx="66" cy="98" r="10"/><circle cx="136" cy="98" r="10"/></g>`,
      'curls-tall': `<g fill="${N}"><circle cx="100" cy="40" r="15"/>
        <circle cx="80" cy="50" r="14"/><circle cx="120" cy="50" r="14"/>
        <circle cx="69" cy="70" r="14"/><circle cx="131" cy="70" r="14"/>
        <circle cx="100" cy="56" r="16"/><circle cx="66" cy="90" r="11"/>
        <circle cx="134" cy="90" r="11"/><circle cx="87" cy="62" r="13"/>
        <circle cx="113" cy="62" r="13"/></g>`,
      /* Varun: high and wide */
      'curls-volume': `<g fill="${N}"><circle cx="100" cy="44" r="17"/>
        <circle cx="76" cy="54" r="16"/><circle cx="124" cy="54" r="16"/>
        <circle cx="62" cy="76" r="15"/><circle cx="138" cy="76" r="15"/>
        <circle cx="60" cy="96" r="11"/><circle cx="140" cy="96" r="11"/>
        <circle cx="88" cy="54" r="14"/><circle cx="112" cy="54" r="14"/>
        <circle cx="100" cy="64" r="15"/></g>`,
      /* Manideep: the same curl, worn close — smaller circles, tighter to the
         skull, so he and Varun are not one drawing twice */
      'curls-crop': `<g fill="${N}"><circle cx="100" cy="54" r="14"/>
        <circle cx="82" cy="60" r="13"/><circle cx="118" cy="60" r="13"/>
        <circle cx="69" cy="76" r="12"/><circle cx="131" cy="76" r="12"/>
        <circle cx="91" cy="52" r="12"/><circle cx="109" cy="52" r="12"/>
        <circle cx="66" cy="92" r="9"/><circle cx="134" cy="92" r="9"/></g>`,
      'waves-long': `<path d="M63 106 C60 62 86 48 104 52 C130 48 142 68 137 106
        C133 88 126 78 112 76 C96 73 76 82 63 106Z" fill="${N}"/>`,
      'waves-xlong': `<path d="M62 106 C58 58 88 44 100 48 C132 44 144 64 138 106
        C134 86 124 76 100 78 C78 80 68 88 62 106Z" fill="${N}"/>`,
      'straight-long': `<path d="M62 106 C58 58 88 44 100 48 C132 44 144 64 138 106
        C136 84 122 74 100 74 C78 74 64 84 62 106Z" fill="${N}"/>
        <path d="M98 74 L102 74 L103 92 L97 92Z" fill="${C}" opacity=".55"/>`,
      crop: `<path d="M66 98 C66 66 88 58 100 58 C112 58 134 66 134 98
        C127 80 113 74 100 74 C87 74 74 80 66 98Z" fill="${N}"/>`,
      short: `<path d="M64 102 C60 62 90 52 104 56 C126 52 142 70 136 102
        C128 84 112 76 98 78 C84 80 72 88 64 102Z" fill="${N}"/>`
    };

    /* a neckline each, so the row is ten people and not one template */
    const DRESS = {
      /* the founder, and the one client-facing role that wears a jacket.
         Notch lapels running the full drop, the shirt showing as a V between
         them: lapels that meet at a point read as a bow tie, and anything
         starting above y178 pokes out of the shoulder silhouette, which only
         reaches y170 at the centre. */
      blazer: `<path d="M86 178 L100 210 L114 178 L124 186 L116 252 L84 252 L76 186Z"
          fill="${C}" stroke="${N}" stroke-width="2"/>
        <path d="M86 178 L100 210 L94 252 L76 252 L76 186Z" fill="${N}"/>
        <path d="M114 178 L100 210 L106 252 L124 252 L124 186Z" fill="${N}"/>`,
      collar: `<path d="M88 174 L100 198 L112 174 L120 180 L113 208 L87 208 L80 180Z"
        fill="${C}" stroke="${N}" stroke-width="1.8"/>`,
      'collar-open': `<path d="M88 176 L100 206 L112 176 L122 184 L114 222 L86 222 L78 184Z"
        fill="${C}" stroke="${N}" stroke-width="2"/>`,
      crew: `<path d="M84 176 Q100 190 116 176" fill="none" stroke="${C}"
        stroke-width="2.6" stroke-linecap="round"/>`,
      round: `<path d="M82 174 Q100 196 118 174" fill="none" stroke="${C}"
        stroke-width="2.6" stroke-linecap="round"/>`
    };

    /* Long hair covers the ears, so they go behind it — except on the swept
       back style, where showing them is the point. */
    const ears =
      `<ellipse cx="66" cy="112" rx="5" ry="9" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      `<ellipse cx="134" cy="112" rx="5" ry="9" fill="${C}" stroke="${N}" stroke-width="2"/>`;
    const earsOver = p.hair === 'swept-mid';

    let hatch = '';
    for (let k = -250; k < 250; k += 14) hatch += `<line x1="${k}" y1="0" x2="${k + 250}" y2="250"/>`;

    /* --- brows. The clearest signal a flat two-colour face has, and nobody
       had any: without them Abhinav read as a woman wearing his own glasses. */
    const brow = p.brow === 'heavy'
      ? `<g stroke="${N}" stroke-width="4.2" fill="none" stroke-linecap="round">` +
        `<path d="M77 97 Q87 91 96 96"/><path d="M104 96 Q113 91 123 97"/></g>`
      : `<g stroke="${N}" stroke-width="2.2" fill="none" stroke-linecap="round">` +
        `<path d="M79 96 Q87 92 95 95"/><path d="M105 95 Q113 92 121 96"/></g>`;

    /* --- eyes, and whatever sits in front of them --- */
    let eyes = `<g fill="${N}"><circle cx="87" cy="108" r="2.6"/>` +
      `<circle cx="113" cy="108" r="2.6"/></g>`;
    if (has('glasses-square')) {
      eyes += `<g fill="none" stroke="${N}" stroke-width="2.8">` +
        `<rect x="73" y="99" width="25" height="21" rx="3"/>` +
        `<rect x="102" y="99" width="25" height="21" rx="3"/>` +
        `<path d="M98 108 L102 108"/><path d="M73 105 L65 107"/>` +
        `<path d="M127 105 L135 107"/></g>`;
    } else if (has('glasses-round')) {
      eyes += `<g fill="none" stroke="${N}" stroke-width="1.5">` +
        `<circle cx="86" cy="109" r="11"/><circle cx="114" cy="109" r="11"/>` +
        `<path d="M97 108 L103 108"/><path d="M75 106 L66 107"/>` +
        `<path d="M125 106 L134 107"/></g>`;
    }

    /* --- the beard, and the mouth that sits inside it ---
       A FILLED lower face, not a band around one. The band version left the
       chin cream inside a dark outline, which is what made it read as a mask
       laid over the face instead of as a beard growing on it. */
    const beard = has('beard-full');
    let facial = '';
    if (beard) {
      facial += `<path d="M67 114 C70 125 84 131 100 131 C116 131 130 125 133 114
        C133 146 118 165 100 165 C82 165 67 146 67 114Z" fill="${N}"/>`;
    } else if (has('stubble')) {
      /* kept wholly inside the face ellipse, whose bottom is y148: a beard may
         sit past the jaw and still read as a beard, but a 20%-opacity shape
         doing the same reads as a grey smudge on the neck. */
      facial += `<path d="M76 128 C78 142 88 147 100 147 C112 147 122 142 124 128
        C121 138 112 142 100 142 C88 142 79 138 76 128Z" fill="${N}" opacity=".2"/>`;
    }
    /* a moustache only shows on skin; inside a full beard it is already there */
    if (has('moustache') && !beard) {
      facial += `<path d="M82 131 Q100 120 118 131 Q100 136 82 131Z" fill="${N}"/>`;
    }

    /* the mouth is cut back out of the beard in cream, or drawn on skin */
    const ink = beard ? C : N;
    const mouth = has('smile-open')
      ? `<path d="M87 137 Q100 152 113 137 Q100 143 87 137Z" fill="${ink}"/>`
      : `<path d="M91 139 Q100 144 109 139" fill="none" stroke="${ink}"
           stroke-width="2" stroke-linecap="round"/>`;

    /* drawn after the hair, with a cream halo: both people wearing one have
       hair over the ear, and without the halo the earring is simply not there */
    const earring = has('earring')
      ? `<circle cx="134" cy="127" r="5" fill="${C}"/>` +
        `<circle cx="134" cy="127" r="2.8" fill="${N}"/>`
      : '';

    /* a bare plate number. It used to read NN/10, which states the team's
       size in every portrait — rendered into the SVG, where no grep of the
       markup would ever find it. Matches the "Proof 01" idiom on /work. */
    const n = ('0' + (i + 1)).slice(-2);
    /* role=img with a label, not a decorative image: the caption carries the
       name and the role as live text, so the drawing says what it is and
       stops there. */
    return `<svg viewBox="0 0 200 250" role="img" aria-label="Drawn portrait of ${esc(p.name)}">` +
      `<g stroke="${N}" stroke-width=".7" opacity=".12">${hatch}</g>` +
      `<path d="M28 252 C34 190 70 170 100 170 C130 170 166 190 172 252Z" fill="${N}"/>` +
      (earsOver ? '' : ears) +
      (BACK[p.hair] || '') +
      (earsOver ? ears : '') +
      `<path d="M88 140 L88 172 L112 172 L112 140" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      (DRESS[p.dress] || '') +
      `<ellipse cx="100" cy="106" rx="34" ry="42" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      facial +
      (FRONT[p.hair] || FRONT.short) +
      earring + brow + eyes +
      /* the nose sits at y112-127 and the beard's top edge is y131, so the
         nose is always on skin and always inked. Tying it to the beard made
         it cream-on-cream and it simply disappeared. */
      `<path d="M100 112 L97 126 L102 127" fill="none" stroke="${N}"
         stroke-width="1.8" stroke-linecap="round"/>` +
      mouth +
      `<text x="10" y="18" font-family="IBM Plex Mono, monospace" font-size="9" fill="${N}" letter-spacing="1.5">${n}</text></svg>`;
  }

  const scatter = $('.scatter');
  const laneRow = $('.lane-row');
  /* one per person, so the parallax does not move two of them in step */
  const SPEEDS = [0.2, 0.9, 0.5, 1.1, 0.7, 0.3, 1, 0.6, 0.85, 0.45];
  function buildTeam() {
    if (!scatter || !laneRow) return;
    TEAM.forEach((p, i) => {
      const f = document.createElement('figure');
      f.className = 'tm';
      f.dataset.i = String(i);
      f.dataset.skills = p.skills;
      f.dataset.speed = String(SPEEDS[i] || 0.5);
      f.innerHTML = '<div class="tm-in"><div class="tm-ph">' + portrait(p, i) + '</div>' +
        `<figcaption><span class="t-name" data-full="${esc(p.name)}">${esc(p.name)}</span>` +
        `<span class="t-role">${esc(p.role)}</span></figcaption></div>`;
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

  /* ================================================= 10 · the brief builder */
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
     never arrives this page still has ten people in it rather than an
     empty grid. */
  buildTeam();
  if (NU.dead) return;

  /* ========================================================== build phase */
  NU.onBuild(() => {
    wireBuilder();
    /* --- 10 · TEAM: parallax scatter, labels write on --- */
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
