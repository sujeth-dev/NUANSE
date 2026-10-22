/* ============================================================================
   NUANSE — team.js · ten people, one standard

   The ten drawn portraits in one 5x2 grid, and the brief builder that
   lights up the ones your brief needs.

   TEN NAMED PEOPLE, NOT EIGHT INVENTED ROLES. This file used to carry eight
   unnamed roles — "Design lead", "Producer" — with a portrait picked from
   eight hair shapes. The studio publishes ten people, by name, with roles.
   Names and roles here are exactly as published; nothing is paraphrased and
   nothing is added. See brief/06-revision-plan.md §1.9 and decision D3.

   The portraits stay drawn rather than photographed. That is still the right
   call while the kit ships no team photography — but these are real people
   now, so the drawing has a duty it did not have before. Each one is built
   from what a photograph of that person actually shows: the shape of the
   head, hair, glasses, beard, the eyes, whether they are turned, an open
   smile, an earring, what they are wearing at the collar.
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

  const { $, $$, RM, esc } = NU;

  /* ============================================================ 10 · TEAM
     name  — as published
     photo — the slug of the plate in site/assets/team/, or absent for none
     role  — as published, verbatim
     skills— the chips this role answers to (D4)
     hair  — one silhouette per person, never two the same
     brow  — heavy | soft
     feat  — glasses, facial hair, expression, earring
     dress — what the shoulders carry
     face  — {rx 31-37, ry 40-45, jaw soft|square|tapered}
     eyes  — round | wide | hooded | smiling | narrow
     pose  — three-quarter, with turn (+1 right, -1 left) and dx 4-7

     The last three keys are expansion axes 1-3 from brief/08-portrait-system.md
     §3, added because the first cut of these ten shared ONE face, ONE pair of
     eyes and ONE dead-on pose: Yusra and Manasi were very nearly the same
     drawing, and so were Manish and Manideep. No key on the record could tell
     them apart. Each axis is optional and falls back to the old value, so any
     one of them can be reverted on its own. */
  const TEAM = [
    { name: 'Abhinav Marothia', photo: 'abhinav-marothia', role: 'Founder & Creative Director',
      skills: 'strategy identity websites content film performance',
      hair: 'swept-wave', brow: 'heavy', feat: 'glasses-square moustache stubble-jaw', dress: 'blazer',
      face: { rx: 36, ry: 42, jaw: 'square' }, eyes: 'round' },
    { name: 'Harshit R.', photo: 'harshit-r', role: 'Full-Stack Development & 3D',
      skills: 'websites',
      hair: 'curls-mid', brow: 'heavy', feat: 'glasses-round stubble-jaw', dress: 'crew',
      face: { rx: 34, ry: 44, jaw: 'square' }, eyes: 'round', pose: 'three-quarter', turn: 1, dx: 4 },
    { name: 'Sujeeth', photo: 'sujeeth', role: 'UI/UX & Web Design',
      skills: 'websites identity',
      hair: 'curls-tall', brow: 'heavy', feat: 'moustache stubble', dress: 'collar',
      face: { rx: 36, ry: 41, jaw: 'soft' }, eyes: 'round' },
    { name: 'Likhita R. Jain', photo: 'likhita-r-jain', role: 'Sustainable Materials & Arts',
      skills: 'identity',
      hair: 'waves-long', brow: 'soft', feat: 'smile-open', dress: 'round',
      face: { rx: 36, ry: 41, jaw: 'soft' }, eyes: 'smiling' },
    { name: 'Manish S.', photo: 'manish-s', role: 'Performance Marketing',
      skills: 'performance',
      hair: 'quiff', brow: 'heavy', feat: 'stubble-jaw moustache', dress: 'crew',
      face: { rx: 32, ry: 45, jaw: 'square' }, eyes: 'smiling', pose: 'three-quarter', turn: -1, dx: 4 },
    { name: 'Varun KS', photo: 'varun-ks', role: 'Photography & Videography',
      skills: 'film content',
      hair: 'curls-volume', brow: 'heavy', feat: 'moustache', dress: 'crew',
      face: { rx: 37, ry: 40, jaw: 'square' }, eyes: 'hooded' },
    { name: 'Yusra', photo: 'yusra', role: 'Client Acquisition',
      skills: 'strategy',
      hair: 'sleek-part', brow: 'soft', feat: 'earring', dress: 'blazer',
      face: { rx: 31, ry: 43, jaw: 'tapered' }, eyes: 'wide' },
    { name: 'Manasi', photo: 'manasi', role: 'Business Development',
      skills: 'strategy',
      hair: 'side-swept', brow: 'soft', feat: 'earring smile-open', dress: 'collar-open',
      face: { rx: 34, ry: 40, jaw: 'soft' }, eyes: 'smiling', pose: 'three-quarter', turn: -1, dx: 5 },
    { name: 'Hari T.', photo: 'hari-t', role: 'Relationship Manager',
      skills: 'strategy',
      hair: 'short', brow: 'heavy', feat: 'beard-light moustache smile-open', dress: 'collar',
      face: { rx: 37, ry: 43, jaw: 'square' }, eyes: 'smiling', pose: 'three-quarter', turn: -1, dx: 6 },
    { name: 'Manideep Chilukuri', photo: 'manideep-chilukuri', role: 'Application Development',
      skills: 'websites',
      hair: 'curls-crop', brow: 'heavy', feat: 'beard-light moustache', dress: 'collar',
      face: { rx: 32, ry: 45, jaw: 'tapered' }, eyes: 'hooded' }
  ];

  /* The head used to be one ellipse — cx100 cy106 rx34 ry42 — and every
     feature was written against those four numbers as a literal. It is now a
     path built from the record's `face`, and the eyes, brows, nose, mouth,
     ears, earring and beard are all DERIVED from it, so they move with the
     head they belong to instead of sitting where the old ellipse put them.

     Hair stays authored against the canonical head and is scaled into the
     real one by a transform. Every hair shape is pure fill with no stroke, so
     scaling costs no line weight — and the five silhouettes carried over from
     the first cut are untouched rather than re-cut by hand.

     Hair is still TWO layers, which is the whole trick. BACK carries the
     length and sits behind the face; FRONT is the crown and stops at a
     hairline near y84; the face is drawn between them. Drawn as one
     silhouette on top, the inner edge lands across the eyes and every long
     style reads as a helmet.

     The beard is CLIPPED to the face path rather than drawn to fit it. One
     generous blob inside the clip follows whatever jaw the record asks for
     and can never poke past the chin — which is the §1.4/7 defect, found by
     drawing stubble to fit one fixed ellipse. */
  function portrait(p, i) {
    const N = '#0D1A41';
    const C = '#FCF7F1';
    const has = (k) => (' ' + p.feat + ' ').indexOf(' ' + k + ' ') > -1;
    const r = (v) => Math.round(v * 10) / 10;

    /* ---------------------------------------------------- the head, axis 1 */
    const F = p.face || {};
    const rx = F.rx || 34;
    const ry = F.ry || 42;
    /* jaw — the width at the angle, the width at the chin, how far down the
       angle sits, and the four numbers that steer the two curves into and out
       of it. The first cut of this set the corner by rounding alone, which
       broke the tangent where the jaw meets the chin and left a visible NOTCH
       in the side of every soft and tapered head, and a SHELF with the chin
       hanging below it on every square one. The tangents are tuned here
       instead: `out`/`in` say how the cheek arrives at the jaw, `hold`/`drop`
       how the chin leaves it, and the two are kept close enough that the
       outline stays one continuous line.

       What makes a jaw read square at 180px is not a sharp corner — it is a
       WIDE angle sitting LOW with a flat chin under it. Drawn as a hard
       corner it reads as a step cut into the face. */
    const JAW = {
      soft: { w: 0.82, chin: 0.36, y: 0.48, hold: 0.18, drop: 0.5, out: 0.45, in: 0.3 },
      square: { w: 0.84, chin: 0.46, y: 0.56, hold: 0.45, drop: 0.36, out: 0.6, in: 0.18 },
      tapered: { w: 0.78, chin: 0.36, y: 0.46, hold: 0.3, drop: 0.55, out: 0.5, in: 0.26 }
    };
    const jw = JAW[F.jaw] || JAW.soft;
    const jawW = rx * jw.w;
    const chinW = rx * jw.chin;
    /* the head is widest just above the eyes. Carrying the widest point up to
       the temple is what made the tapered heads read as light bulbs. */
    const cheekY = -ry * 0.12;
    const jawY = ry * jw.y;

    /* ---------------------------------------------------- the pose, axis 3
       turn +1 is the head turned to the viewer's right, -1 to the left. The
       head moves half of dx and the features all of it, the far eye and brow
       foreshorten toward the centre line, and the far ear goes entirely. That
       spread is what reads as a turn; moving everything together only reads
       as a portrait sitting off-centre in its frame. */
    const turn = p.pose === 'three-quarter' ? (p.turn || 1) : 0;
    const dx = turn * (p.dx || 5);
    const cx = 100 + dx * 0.5;
    const fx = 100 + dx;
    const cy = 106;

    /* One side of the head as three segments — crown to the widest point, the
       cheek down to the jaw angle, the jaw in to the middle of the chin —
       held as offsets from the centre so the same list can be emitted forward
       down the right side and reversed back up the left. The head is then one
       closed path and the jaw is the only thing that differs between two
       people. Three segments, not four: the fourth anchor the chin used to
       have is where the outline kinked. */
    const SEG = [
      [[rx * 0.56, -ry], [rx, -ry * 0.66], [rx, cheekY]],
      [[rx, cheekY + (jawY - cheekY) * 0.52],
        [jawW + (rx - jawW) * jw.out, jawY - (jawY - cheekY) * jw.in],
        [jawW, jawY]],
      [[jawW - (jawW - chinW) * jw.hold, jawY + (ry - jawY) * jw.drop],
        [chinW, ry],
        [0, ry]]
    ];
    const pt = (o, s) => `${r(cx + s * o[0])} ${r(cy + o[1])}`;
    let faceD = `M ${r(cx)} ${r(cy - ry)}`;
    SEG.forEach((g) => { faceD += ` C ${pt(g[0], 1)} ${pt(g[1], 1)} ${pt(g[2], 1)}`; });
    for (let k = SEG.length - 1; k >= 0; k--) {
      const g = SEG[k];
      faceD += ` C ${pt(g[1], -1)} ${pt(g[0], -1)} ${pt(k ? SEG[k - 1][2] : [0, -ry], -1)}`;
    }
    faceD += 'Z';
    const clip = 'pf' + i;

    /* every landmark, read off the head rather than written down */
    const eyeY = cy + 2;
    const eyeW = rx * 0.38;
    const eyeL = fx - eyeW * (turn < 0 ? 0.84 : 1);
    const eyeR = fx + eyeW * (turn > 0 ? 0.84 : 1);
    const browY = cy - 10;
    /* tied to the chin, not to a number: at 0.78 the open smile on the two
       shortest faces came within 2px of the jaw and read as a mouth sliding
       off the bottom of the head */
    const mouthY = cy + ry * 0.72;
    const earY = cy + ry * 0.14;
    const botY = cy + ry;

    /* Length behind the head: a blob the face covers, plus two falls. The
       blob runs to y186, ten past the shoulder line, because cut level with
       it at y176 the two edges met within half a pixel of each other and the
       hatch showed through the seam as a cream nick. It is navy drawn over
       navy, so the overlap costs nothing. */
    const fall = (yEnd, flare) => `
      <path d="M64 96 C58 50 92 38 100 42 C132 38 146 56 140 96
        C140 130 139 152 137 186 L63 186 C61 152 64 130 64 96Z" fill="${N}"/>
      <path d="M62 100 C${56 - flare} 150 ${60 - flare} ${yEnd - 30} ${56 - flare} ${yEnd}
        L78 ${yEnd} C74 ${yEnd - 32} 72 150 74 112Z" fill="${N}"/>
      <path d="M138 100 C${144 + flare} 150 ${140 + flare} ${yEnd - 30} ${144 + flare} ${yEnd}
        L122 ${yEnd} C126 ${yEnd - 32} 128 150 126 112Z" fill="${N}"/>`;

    const BACK = {
      /* A NAPE, not two falls beside the face.
         The source photograph is shoulder-length waved hair, and three
         attempts at drawing it honestly all read female at lane size, because
         at 100-240px a dark mass either side of the face down to the jaw IS
         the signal, and it drowns out brows, glasses and a moustache put on
         top of it. So the length moves behind the head: it sits between x78
         and x122 where the shoulders all but cover it, and the face is framed
         by nothing. A deliberate trade of literal likeness for a portrait
         that reads as the person it names. */
      'swept-wave': `
        <path d="M72 96 C66 50 92 38 100 42 C130 38 140 54 134 96
          C134 118 130 142 126 164 L78 164 C74 142 72 118 72 96Z" fill="${N}"/>`,
      /* Harshit: SHORT curls, and the length is what has to say so. The first
         cut put curls beside the jaw at x56-80 and x120-144 and it went
         straight into failure mode 8 — a dark mass either side of the face
         down to the jaw reads female at lane size however male everything
         drawn on top of it is. So the length is a nape and nothing else: it
         sits at y130-156 between x72 and x128, where the neck covers the
         middle and the jaw covers the top, and all that shows is curl between
         the jaw and the collar at y176. */
      'curls-mid': `<g fill="${N}">
        <path d="M76 92 C72 56 92 44 100 46 C128 44 132 58 128 92 L128 134 L72 134Z"/>
        <circle cx="82" cy="140" r="10"/><circle cx="118" cy="140" r="10"/>
        <circle cx="100" cy="146" r="10"/></g>`,
      'waves-long': fall(180, 3),
      'sleek-part': fall(216, 5),
      /* Manasi: swept to one side, so the two falls are deliberately unequal
         — long past the shoulder on the left, cut short at the jaw on the
         right. Two falls of equal length is the bob this is not. */
      'side-swept': `
        <path d="M64 96 C58 50 92 38 100 42 C132 38 146 56 140 96
          C140 130 139 152 137 186 L63 186 C61 152 64 130 64 96Z" fill="${N}"/>
        <path d="M60 100 C48 146 50 176 42 202 L74 202 C74 166 72 138 74 112Z" fill="${N}"/>
        <path d="M140 100 C146 126 146 142 138 152
          C132 144 128 130 126 112Z" fill="${N}"/>`,
      'curls-tall': '', 'curls-volume': '', 'curls-crop': '', quiff: '', short: ''
    };

    /* the crown. Every one stops at a hairline near y84, so there is always a
       forehead between the hair and the eyes at y108. */
    const FRONT = {
      /* Swept back off the forehead and across, with the wave left in the
         inner edge: the left temple low, the right hairline riding high.
         Asymmetry is what stops a crown reading as a cap. No sideburn blocks
         — drawn beside the square glasses they read as headphones, which is
         the kind of thing only a rendered frame tells you. */
      'swept-wave': `<path d="M62 104 C56 56 84 38 108 44 C134 50 144 74 139 103
          C136 86 128 74 114 70 C104 66 100 80 88 78
          C78 76 70 86 64 100 C63 101 62 102 62 104Z" fill="${N}"/>`,
      /* a medium curl worn close at the sides. Drawn wide — temple circles out
         at x55 and x145 — it stopped being hair and became a halo around the
         face, which is the same dark-mass-either-side problem by another
         route. It clears the head by 5px and no more. */
      'curls-mid': `<g fill="${N}"><circle cx="100" cy="52" r="14"/>
        <circle cx="84" cy="58" r="13"/><circle cx="116" cy="56" r="13"/>
        <circle cx="73" cy="76" r="12"/><circle cx="127" cy="74" r="12"/>
        <circle cx="91" cy="52" r="12"/><circle cx="109" cy="50" r="12"/>
        <circle cx="70" cy="92" r="9"/><circle cx="130" cy="90" r="9"/>
        <circle cx="100" cy="64" r="13"/></g>`,
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
      /* Manish: lifted at the front, cut close at the back. Twice this was
         drawn as a mass rising off the crown and twice it read as a TOP KNOT,
         because a shape narrower than the head sitting on top of it is a bun
         whatever its outline does. What fixes it is width at the base and
         lean: the silhouette leaves the temple at full head width, peaks
         forward at y46, and runs away flat to the back of the head. */
      quiff: `<path d="M64 102 C60 78 60 60 68 54
        C78 46 120 48 130 58 C136 66 136 86 136 102
        C130 84 114 74 100 74 C86 74 70 82 64 102Z" fill="${N}"/>`,
      'waves-long': `<path d="M63 106 C60 62 86 48 104 52 C130 48 142 68 137 106
        C133 88 126 78 112 76 C96 73 76 82 63 106Z" fill="${N}"/>`,
      /* Yusra: flat to the head and smooth. The part was drawn as a cream
         sliver off the crown and at ship size it read as a scratch in the
         ink, which is the same thing the first swept crown was told. So the
         part is in the SILHOUETTE instead — the crown rides higher and
         further over on the right than the left. */
      'sleek-part': `<path d="M62 106 C56 54 86 40 102 46 C132 42 144 62 138 106
        C136 82 124 72 104 72 C84 72 68 82 62 106Z" fill="${N}"/>`,
      /* Manasi: the fringe sweeps down over one temple and the other side of
         the forehead is left open */
      'side-swept': `<path d="M62 108 C56 56 86 40 104 46 C130 52 142 70 138 104
        C134 84 126 74 112 72 C98 70 82 82 74 102 C72 108 67 112 62 108Z" fill="${N}"/>`,
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

    /* The hair is drawn against the canonical head and scaled into this one.
       Width tracks the head exactly, since hair has to sit ON it. Height only
       follows it part of the way: hair is not longer because a face is, and
       at full scale a tall narrow head stretched the crown with it until
       Manish's quiff came out as a top knot. And it never shrinks: the long
       styles are cut blunt at y176 because that is where the shoulders take
       over, so scaling them up the page by even 3% lifts that edge clear of
       the shoulder and opens a cream gap in the silhouette. Scaling DOWN the
       page only ever overlaps more, which costs nothing. */
    const s3 = (v) => Math.round(v * 1000) / 1000;
    const hairG = (d) => (d
      ? `<g transform="translate(${r(cx)} ${cy})` +
        ` scale(${s3(rx / 34)} ${s3(Math.max(1, 1 + (ry / 42 - 1) * 0.6))})` +
        ` translate(-100 -106)">${d}</g>`
      : '');

    /* Long hair covers the ears, so they go behind it — except where the hair
       is short enough that showing them is the point. On a turn the far ear
       has gone behind the head and is simply not drawn. */
    const ear = (s) => `<ellipse cx="${r(cx + s * (rx - 1))}" cy="${r(earY)}"` +
      ` rx="5" ry="9" fill="${C}" stroke="${N}" stroke-width="2"/>`;
    const ears = (turn >= 0 ? ear(-1) : '') + (turn <= 0 ? ear(1) : '');
    const earsOver = !BACK[p.hair];

    let hatch = '';
    for (let k = -250; k < 250; k += 14) hatch += `<line x1="${k}" y1="0" x2="${k + 250}" y2="250"/>`;

    /* --- brows. The clearest signal a flat two-colour face has, and nobody
       had any: without them Abhinav read as a woman wearing his own glasses.
       The outer end sits a shade lower than the inner one, mirrored either
       side, so the pair arches rather than slants. */
    const heavy = p.brow === 'heavy';
    const bw = rx * (heavy ? 0.3 : 0.24);
    const brow = (x, s) => `<path d="M${r(x + s * bw)} ${r(browY + 1)}` +
      ` Q${r(x)} ${r(browY - (heavy ? 5 : 4))} ${r(x - s * bw * 0.88)} ${r(browY)}"/>`;
    const brows = `<g stroke="${N}" stroke-width="${heavy ? 4.2 : 2.2}" fill="none"` +
      ` stroke-linecap="round">${brow(eyeL, -1)}${brow(eyeR, 1)}</g>`;

    /* --- eyes, axis 2. Two dots at fixed coordinates were the whole set's
       eyes, which is a large part of why ten faces read as one: this is where
       a portrait becomes a person. Five shapes, all still flat navy — a lid
       line, an open almond, a heavy hood, a crinkle, a narrow lens. */
    const EYE = {
      round: (x) => `<circle cx="${r(x)}" cy="${r(eyeY)}" r="3" fill="${N}"/>` +
        `<path d="M${r(x - 5.5)} ${r(eyeY - 4.2)} Q${r(x)} ${r(eyeY - 7.6)}` +
        ` ${r(x + 5.5)} ${r(eyeY - 4.2)}" fill="none" stroke="${N}"` +
        ` stroke-width="1.6" stroke-linecap="round"/>`,
      wide: (x) => `<path d="M${r(x - 6)} ${r(eyeY)} Q${r(x)} ${r(eyeY - 5.6)}` +
        ` ${r(x + 6)} ${r(eyeY)} Q${r(x)} ${r(eyeY + 4.6)} ${r(x - 6)} ${r(eyeY)}Z"` +
        ` fill="none" stroke="${N}" stroke-width="1.5"/>` +
        `<circle cx="${r(x)}" cy="${r(eyeY)}" r="2.6" fill="${N}"/>`,
      hooded: (x) => `<circle cx="${r(x)}" cy="${r(eyeY + 1)}" r="2.6" fill="${N}"/>` +
        `<path d="M${r(x - 6.5)} ${r(eyeY - 2.4)} Q${r(x)} ${r(eyeY - 5.4)}` +
        ` ${r(x + 6.5)} ${r(eyeY - 1.6)}" fill="none" stroke="${N}"` +
        ` stroke-width="3" stroke-linecap="round"/>`,
      smiling: (x) => `<path d="M${r(x - 6.5)} ${r(eyeY + 1)} Q${r(x)} ${r(eyeY - 6)}` +
        ` ${r(x + 6.5)} ${r(eyeY + 1)}" fill="none" stroke="${N}"` +
        ` stroke-width="2.6" stroke-linecap="round"/>`,
      narrow: (x) => `<path d="M${r(x - 6.5)} ${r(eyeY)} Q${r(x)} ${r(eyeY - 4)}` +
        ` ${r(x + 6.5)} ${r(eyeY)} Q${r(x)} ${r(eyeY + 2.4)} ${r(x - 6.5)} ${r(eyeY)}Z"` +
        ` fill="${N}"/>`
    };
    const drawEye = EYE[p.eyes] || EYE.round;
    let eyes = drawEye(eyeL) + drawEye(eyeR);

    /* and whatever sits in front of them. The lenses sit a shade outboard of
       the pupils, as a frame worn on a face does. */
    if (has('glasses-square')) {
      eyes += `<g fill="none" stroke="${N}" stroke-width="2.8">` +
        `<rect x="${r(eyeL - 13.5)}" y="${r(eyeY - 9)}" width="24" height="21" rx="3"/>` +
        `<rect x="${r(eyeR - 10.5)}" y="${r(eyeY - 9)}" width="24" height="21" rx="3"/>` +
        `<path d="M${r(eyeL + 10.5)} ${r(eyeY)} L${r(eyeR - 10.5)} ${r(eyeY)}"/>` +
        `<path d="M${r(eyeL - 13.5)} ${r(eyeY - 3)} L${r(cx - rx + 1)} ${r(eyeY - 1)}"/>` +
        `<path d="M${r(eyeR + 13.5)} ${r(eyeY - 3)} L${r(cx + rx - 1)} ${r(eyeY - 1)}"/></g>`;
    } else if (has('glasses-round')) {
      eyes += `<g fill="none" stroke="${N}" stroke-width="1.5">` +
        `<circle cx="${r(eyeL)}" cy="${r(eyeY + 1)}" r="11"/>` +
        `<circle cx="${r(eyeR)}" cy="${r(eyeY + 1)}" r="11"/>` +
        `<path d="M${r(eyeL + 11)} ${r(eyeY)} L${r(eyeR - 11)} ${r(eyeY)}"/>` +
        `<path d="M${r(eyeL - 11.5)} ${r(eyeY - 2)} L${r(cx - rx + 1)} ${r(eyeY - 1)}"/>` +
        `<path d="M${r(eyeR + 11.5)} ${r(eyeY - 2)} L${r(cx + rx - 1)} ${r(eyeY - 1)}"/></g>`;
    }

    /* --- the beard, and the mouth that sits inside it ---
       A FILLED lower face, not a band around one. The band version left the
       chin cream inside a dark outline, which is what made it read as a mask
       laid over the face instead of as a beard growing on it.

       Both weights and both stubbles are the same blob at four depths, cut to
       the face by the clip: sideburns high at the edges, the cheek line
       dipping in the middle. `beard-light` is the trimmed line that stops at
       the jaw; `beard-full` carries up the cheek. */
    const blob = (top, dipC, o) =>
      `<path d="M${r(cx - rx - 8)} ${r(cy + ry * top)} Q${r(fx)} ${r(cy + ry * dipC)}` +
      ` ${r(cx + rx + 8)} ${r(cy + ry * top)} L${r(cx + rx + 8)} ${r(botY + 10)}` +
      ` L${r(cx - rx - 8)} ${r(botY + 10)}Z" fill="${N}"${o ? ` opacity="${o}"` : ''}/>`;
    const beardFull = has('beard-full');
    const beardLight = has('beard-light');
    const beard = beardFull || beardLight;
    let facial = '';
    if (beardFull) facial += blob(0.14, 0.71, '');
    else if (beardLight) facial += blob(0.34, 0.86, '');
    /* stubble stays a wash rather than a shape: an opacity field the clip
       keeps wholly inside the face, because the same shape drawn past the jaw
       reads as a grey smudge on the neck. Set any heavier than this it stops
       being a shadow on a jaw and becomes a grey mask laid across the face —
       the cheek line has to sit well below the nose for it to read. */
    else if (has('stubble-jaw')) facial += blob(0.44, 1.02, '.18');
    else if (has('stubble')) facial += blob(0.54, 1.08, '.15');
    /* a moustache only shows on skin; inside a full beard it is already
       there. Over a light beard the top of it still reads, which is the
       difference between a trimmed beard and a trimmed beard with one. */
    if (has('moustache') && !beardFull) {
      facial += `<path d="M${r(fx - rx * 0.53)} ${r(mouthY - 8)} Q${r(fx)} ${r(mouthY - 19)}` +
        ` ${r(fx + rx * 0.53)} ${r(mouthY - 8)} Q${r(fx)} ${r(mouthY - 3)}` +
        ` ${r(fx - rx * 0.53)} ${r(mouthY - 8)}Z" fill="${N}"/>`;
    }
    if (facial) facial = `<g clip-path="url(#${clip})">${facial}</g>`;

    /* the mouth is cut back out of the beard in cream, or drawn on skin */
    const ink = beard ? C : N;
    const mw = rx * 0.26;
    const mouth = has('smile-open')
      ? `<path d="M${r(fx - mw * 1.44)} ${r(mouthY - 2)} Q${r(fx)} ${r(mouthY + 13)}` +
        ` ${r(fx + mw * 1.44)} ${r(mouthY - 2)} Q${r(fx)} ${r(mouthY + 4)}` +
        ` ${r(fx - mw * 1.44)} ${r(mouthY - 2)}Z" fill="${ink}"/>`
      : `<path d="M${r(fx - mw)} ${r(mouthY)} Q${r(fx)} ${r(mouthY + 5)}` +
        ` ${r(fx + mw)} ${r(mouthY)}" fill="none" stroke="${ink}"` +
        ` stroke-width="2" stroke-linecap="round"/>`;

    /* drawn after the hair, with a cream halo: both people wearing one have
       hair over the ear, and without the halo the earring is simply not
       there. It goes on the near ear, the far one not being in the drawing. */
    const eSide = turn > 0 ? -1 : 1;
    const earring = has('earring')
      ? `<circle cx="${r(cx + eSide * (rx - 1))}" cy="${r(cy + ry * 0.5)}" r="5" fill="${C}"/>` +
        `<circle cx="${r(cx + eSide * (rx - 1))}" cy="${r(cy + ry * 0.5)}" r="2.8" fill="${N}"/>`
      : '';

    /* a bare plate number. It used to read NN/10, which states the team's
       size in every portrait — rendered into the SVG, where no grep of the
       markup would ever find it. Matches the "Proof 01" idiom on /work. */
    const n = ('0' + (i + 1)).slice(-2);
    /* aria-hidden, because the drawing is the hover state now. The plate
       underneath is the portrait of record and the caption carries the name
       and the role as live text; a second announced portrait of the same
       person would just be said twice. */
    return `<svg viewBox="0 0 200 250" aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="${clip}"><path d="${faceD}"/></clipPath></defs>` +
      `<g stroke="${N}" stroke-width=".7" opacity=".12">${hatch}</g>` +
      `<path d="M28 252 C34 190 70 170 100 170 C130 170 166 190 172 252Z" fill="${N}"/>` +
      (earsOver ? '' : ears) +
      hairG(BACK[p.hair] || '') +
      (earsOver ? ears : '') +
      `<path d="M88 140 L88 172 L112 172 L112 140" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      (DRESS[p.dress] || '') +
      `<path d="${faceD}" fill="${C}" stroke="${N}" stroke-width="2"/>` +
      facial +
      hairG(FRONT[p.hair] || FRONT.short) +
      earring + brows + eyes +
      /* the nose is always on skin and always inked: tying it to the beard
         made it cream-on-cream and it simply disappeared. On a turn it points
         the way the head is facing, which is most of what sells the turn. */
      `<path d="M${r(fx)} ${r(cy + 6)} L${r(fx + (turn || -1) * 3.4)} ${r(cy + ry * 0.48)}` +
      ` L${r(fx - (turn || -1))} ${r(cy + ry * 0.5)}" fill="none" stroke="${N}"` +
      ` stroke-width="1.8" stroke-linecap="round"/>` +
      mouth +
      `<text x="10" y="18" font-family="IBM Plex Mono, monospace" font-size="9" fill="${N}" letter-spacing="1.5">${n}</text></svg>`;
  }

  /* The photograph, out of the record tools/build-team-photos.py writes.
     It sits under the drawing and is what the card shows at rest; the
     drawing comes up over it on hover. No plate, no <picture>, and that
     person simply keeps the drawing - which is why this returns '' rather
     than reaching for a placeholder. */
  const SIZES = '(max-width:900px) 44vw, 230px';
  function plate(p) {
    const set = (window.NU_TEAM_PHOTOS || {})[p.photo];
    if (!set) return '';
    return '<picture>' +
      `<source type="image/avif" srcset="${set.avif}" sizes="${SIZES}">` +
      `<source type="image/webp" srcset="${set.webp}" sizes="${SIZES}">` +
      `<img class="tm-img" src="${set.src}" srcset="${set.jpg}" sizes="${SIZES}"` +
      ` width="240" height="300" alt="" loading="lazy" decoding="async">` +
      '</picture>';
  }

  const scatter = $('.scatter');
  function buildTeam() {
    if (!scatter) return;
    TEAM.forEach((p, i) => {
      const f = document.createElement('figure');
      f.className = 'tm';
      f.dataset.i = String(i);
      f.dataset.skills = p.skills;
      f.innerHTML = '<div class="tm-in"><div class="tm-ph">' + plate(p) + portrait(p, i) + '</div>' +
        `<figcaption><span class="t-name" data-full="${esc(p.name)}">${esc(p.name)}</span>` +
        `<span class="t-role">${esc(p.role)}</span></figcaption></div>`;
      scatter.appendChild(f);
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

  /* ================================================= 10 · the brief builder
     Lights up who a brief needs, in place: the founder answers every brief,
     everyone else dims unless the skill is theirs. No skill, nobody dims. */
  function wireBuilder() {
    const chips = $$('.chip');
    if (!chips.length || !scatter) return;
    function setBrief(skill) {
      $$('.tm').forEach((m) => {
        const on = !skill || m.dataset.i === '0' ||
          m.dataset.skills.split(' ').indexOf(skill) > -1;
        m.classList.toggle('off', !on);
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
    /* --- 10 · TEAM: one even grid, labels write on --- */
    if (!RM) $$('.t-name').forEach((n) => { n.textContent = ''; });
    ScrollTrigger.create({ trigger: '.scatter', start: 'top 80%', once: true, onEnter: typeNames });
  });
})();
