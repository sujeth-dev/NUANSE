# The portrait system — current state, the gap, and the prompt

The ten drawn portraits on `/team` are built in code, not drawn in a tool:
`site/assets/js/team.js` emits one inline SVG per person from a record. They
work — each person is identifiable, nobody is invented, and the set survives
reduced motion, touch and a GSAP-less page.

They are also **one template run ten times**, and that is the thing to fix.
This file is the current state, an honest account of what is missing, and the
prompt to generate the next person — or to re-cut all ten.

Read `05-conventions.md` first. Three typefaces, navy/copper/cream sampled
from the logo master, no invented facts. None of that moves.

---

## 1 · Current state — exactly what exists

### 1.1 The canvas

```
viewBox           0 0 200 250          (4:5, rendered 150-240px wide)
navy   N          #0D1A41
cream  C          #FCF7F1
ground            diagonal hatch, 14px pitch, navy at 12% opacity
```

Every shape is drawn against four numbers — the face ellipse:

```
cx 100   cy 106   rx 34   ry 42        → spans x 66-134, y 64-148
```

Fixed landmarks, identical on all ten:

| Feature | Geometry |
|---|---|
| Eyes | dots r2.6 at (87,108) and (113,108) |
| Brows | arcs y91-97, stroke 4.2 (heavy) or 2.2 (soft) |
| Nose | 3-point path, y112-127 |
| Mouth | arc y136-144, or an open-smile wedge y137-152 |
| Ears | ellipses rx5 ry9 at (66,112) and (134,112) |
| Neck | rect x88-112, y140-172 |
| Shoulders | one path, crown at y170, full width by y252 |
| Hairline | front hair stops near y84 |
| Beard | fills y114-165, top edge y131 at centre |
| Plate no. | mono 9px at (10,18) |

### 1.2 Layer order — load-bearing, in this sequence

```
 1 hatch ground
 2 shoulders
 3 ears            ← unless earsOver
 4 BACK hair       (length, behind the face)
 5 ears            ← if earsOver (swept-mid only)
 6 neck
 7 DRESS           (neckline)
 8 face ellipse    ← the face cuts the hair, not the reverse
 9 facial          (beard / stubble / moustache)
10 FRONT hair      (crown, stops at the hairline)
11 earring         (cream halo, so it survives hair over the ear)
12 brows
13 eyes + glasses
14 nose
15 mouth
16 plate number
```

Hair is two layers and that is the whole trick. Drawn as one silhouette on
top of the face, the inner edge lands across the eyes and every long style
reads as a helmet.

### 1.3 The vocabulary

```
hair   swept-mid  curls-long  curls-tall  curls-volume  curls-crop
       waves-long waves-xlong straight-long  crop  short      (10, one each)
brow   heavy | soft
feat   glasses-square  glasses-round  moustache  beard-full
       stubble  smile-open  earring
dress  blazer  collar  collar-open  crew  round
```

A record is one line of data:

```js
{ name: 'Manideep Chilukuri', role: 'Application Development',
  skills: 'websites',
  hair: 'curls-crop', brow: 'heavy', feat: 'beard-full', dress: 'collar' }
```

### 1.4 Failure modes already found and fixed

Do not reintroduce these. Each cost a render to find and none of them looked
wrong in the code:

1. **Hair as one silhouette** → hairline across the eyes, helmet.
2. **Beard as a crescent band** → cream chin inside a dark outline, reads as a
   mask laid on the face. A beard is a *filled* lower face with the mouth cut
   back out in cream.
3. **Beard from eye level to below the chin** → a long full beard nobody in the
   source photographs wears. y126-162 is the neat trimmed line.
4. **Dress shapes starting above y178** → the shoulder silhouette only reaches
   y170 at the centre, so they float in the hatch. Lapels meeting at a point
   read as a bow tie.
5. **Sideburns beside square glasses** → read as headphones.
6. **Nose inked cream so it would cut out of a beard** → it sits at y112-127
   and the beard top is y131, so it is always on skin. It vanished.
7. **20% stubble drawn past the jaw** → a grey smudge on the neck.
8. **A symmetric dark mass either side of the face** → reads female at render
   size whatever brows, glasses and moustache you put on top of it.

---

## 2 · The gap — why ten portraits read as one

**The evidence is `assets/portraits-current-state.png`** — all ten at ship
size, side by side, regenerated any time by `tools/portrait-contact-sheet.js`
against a running harness. Judge the SET, not a portrait. Two things are
obvious there and invisible one card at a time:

- **Yusra (07) and Manasi (08) are nearly the same drawing.** Both long dark
  hair, both an earring, and the identical face under it. Hair texture and a
  neckline are carrying the whole distinction between two people.
- **Manish (05) and Manideep (10) have the same problem** — a beard, dark hair
  and one face shared between them.

That is the system's limit, not the drawing's: there is no key on the record
that could make their faces differ.

This is the honest list. Every item is a thing the system *cannot currently
express*, not a thing drawn badly.

**2.1 One face for everyone.** All ten share the identical ellipse — same
width, same length, same jaw, same chin. This is the single largest reason the
set reads as a template. Two people with the same hair length are then
distinguishable only by accessories.

**2.2 One pair of eyes.** Two dots, same radius, same coordinates, no lids, no
shape, no direction of gaze. Eyes are where a portrait becomes a person.

**2.3 One nose, one mouth.** The same three-point path and the same arc on all
ten.

**2.4 One pose.** Every portrait is dead-on frontal and perfectly symmetrical.
The source photographs are not — Hari T. is a three-quarter turn. Symmetry is
what makes a drawn face read as an icon rather than as someone.

**2.5 Two colours.** Navy and cream, plus a 12% hatch. The brand palette has
copper, stone, blush, olive, royal and ox and none of them appear. Copper is
~3% of every other page in the build; the team page spends none.

**2.6 One line weight.** Strokes run 1.8-2.8 everywhere, geometrically even.
Nothing reads as having been *drawn* — there is no pressure, no overshoot, no
hand.

**2.7 One ground.** The same hatch at the same angle at the same opacity behind
all ten, so the set has no rhythm of its own.

**2.8 Nothing connects a person to their work.** A photographer, a developer
and a materials artist are drawn with exactly the same vocabulary. The page
says what each person does in mono underneath and the drawing never agrees.

---

## 3 · Expansion axes — how to close it

In the order of how much each buys. Each is a new key on the record, so adding
one does not disturb any existing portrait: an absent key takes the current
value as its default, which means the ten keep working while the system grows.

| # | Axis | Key | Values | Buys |
|---|---|---|---|---|
| 1 | Face geometry | `face` | `{rx, ry, jaw}` — rx 30-37, ry 38-46, jaw `soft`/`square`/`tapered` | the biggest single gain; ten different heads |
| 2 | Eyes | `eyes` | `round` `narrow` `hooded` `wide` `smiling` | where a face becomes a person |
| 3 | Pose | `pose` | `front` `three-quarter` (face + features offset 4-7px, far ear hidden) | breaks the icon symmetry |
| 4 | Accent | `accent` | one brand colour, on exactly ONE element | ties the page to the brand's 3% rule |
| 5 | Ground | `ground` | hatch angle / pitch / a solid or dotted field | gives the grid rhythm |
| 6 | Nose + mouth | `nose` `mouth` | 3-4 variants each | removes the last shared paths |
| 7 | Craft marker | `craft` | one small object or motif tied to the role | makes the drawing agree with the caption |

**On axis 4, carefully.** Copper is the house accent and it is ~3% of any page.
Ten copper portraits would be a palette, not an accent. Either one accent
colour per person used on one element only (a collar, an earring, a frame
rule), or the accent reserved for the founder's card alone. Decide once and
write it down here.

**On axis 7, more carefully still.** A camera for the photographer is the
obvious move and it is also the cheap one — it risks turning a roster of people
into a set of job icons. The better version is a motif in the *ground* behind
them rather than an object in their hands.

---

## 4 · The prompt — generating a new person

Paste this whole block. Replace the bracketed parts. It is written to be given
to Claude with `site/assets/js/team.js` open.

```
You are adding one person to the NUANSE team page portrait system.

CONTEXT TO READ FIRST
  site/assets/js/team.js          the system, and the ten existing records
  brief/08-portrait-system.md     §1 current state, §1.4 failure modes
  brief/05-conventions.md         three typefaces, the palette, no invented facts

THE PERSON
  Name (exactly as published):    [NAME]
  Role (exactly as published):    [ROLE]
  Source:                         [photograph / screenshot — attach it]
  What the photograph shows:      [hair length and texture; glasses and their
                                   shape; facial hair and how trimmed; whether
                                   they are smiling; earrings; what they wear
                                   at the collar; head angle]
  Chips they answer to:           [from the six: strategy identity websites
                                   content film performance — read off the
                                   ROLE WORDING, never guessed]

THE ART CONTRACT — do not break these
  - Flat two-colour vector. Navy #0D1A41 on cream #FCF7F1. No gradients, no
    shading, no third colour unless this file's §3 axis 4 has been decided.
  - viewBox 0 0 200 250. The face ellipse is cx100 cy106 rx34 ry42 unless the
    record carries a `face` key. Every shape is positioned against it.
  - The layer order in §1.2 is fixed. Hair is two layers: BACK behind the face
    for length, FRONT over it for the crown, stopping at a hairline near y84.
  - Plainly stylised and respectful. The likeness is hair, glasses, facial
    hair, expression and what they wear — nothing more. These are real people.
  - Nothing is invented. If the photograph does not show it, it is not drawn.
    A missing fact is a question for the user, never a plausible guess.

WHAT TO PRODUCE
  1. The record, in the shape of the ten already there.
  2. Only the NEW shapes needed. Reuse the existing vocabulary wherever it
     honestly fits — but do NOT reuse a hair shape that another person already
     has. Ten people sharing four shapes is the defect this system is being
     pulled out of. One silhouette per person.
  3. A one-line comment on any new shape saying what in the photograph it is
     drawn from.

THEN — and this is not optional
  Render it and LOOK AT IT at the size it ships: 150-240px in the scatter,
  and in the lane. Screenshot the element, do not reason about the path data.
  Check specifically:
    - is there a forehead between the hairline and the eyes?
    - at render size, does the silhouette alone say the right thing? The
      silhouette beats every detail you hang on it.
    - does anything poke outside the shoulder silhouette, which only reaches
      y170 at the centre?
    - does any feature land on a same-coloured field and disappear?
    - put it beside the other ten. Does it read as the same hand?
  Re-cut and re-render until all five pass. Expect two or three rounds; every
  defect in §1.4 was invisible until something was rendered.

VERIFY
  node --check site/assets/js/team.js
  the chip filter still matches brief/06-revision-plan.md §6 D4
  /team clean in desktop, reduced motion, touch 390x844, and GSAP blocked
  zero axe violations
```

---

## 5 · The prompt — the deep creative pass

For re-cutting all ten rather than adding one. This is the bigger job and
wants its own session.

```
You are art-directing the NUANSE team portraits, not patching them.

THE PROBLEM, stated plainly: ten portraits are drawn from one face, one pair
of eyes, one nose, one mouth, one pose, one line weight and one ground. They
are identifiable and they are lifeless. See brief/08-portrait-system.md §2 for
the full account — work from that list, not from a fresh opinion.

SCOPE
  Implement expansion axes 1, 2 and 3 from §3 — face geometry, eyes, pose —
  across all ten. Those three buy the most and touch no colour decision.
  Axes 4-7 (accent, ground, nose/mouth, craft marker) are OUT unless the user
  has answered §3's accent question; propose, do not decide.

METHOD
  1. Add each axis as an optional key with the current value as its default,
     so the ten keep rendering while the system grows and any one axis can be
     reverted alone.
  2. Re-derive every person's values from their source photograph. Where the
     photograph does not say, leave the default and note it — do not invent a
     jaw.
  3. Build a contact sheet: all ten rendered side by side at ship size, before
     and after. Judge the SET, not the portrait. The question is whether ten
     people now look like ten people.
  4. Expect the first pass to look worse. Variation without control reads as
     inconsistency; the set has to still look like one hand drew it.

CONSTRAINTS THAT DO NOT MOVE
  Flat two-colour vector. Static SVG built above the no-GSAP guard, so the
  page still publishes everyone when GSAP fails. No new dependency, no raster,
  no build step. Every portrait still role="img" with a label naming only the
  person. The real people rule from §4 stands.

DELIVER
  The contact sheets, the diff, and a written answer to one question: which of
  the three axes earned its complexity? Be willing to say an axis did not and
  to drop it. A system with two axes that work beats three where one is noise.
```

---

## 6 · If the photography ever arrives

Decision D3 in `06-revision-plan.md` stands: drawn portraits hold the page
*until* the studio's own photography is on file, and then the photography beats
any drawing. The live site already publishes black-and-white portraits of all
ten. If those files are put into the asset pool, this whole system retires to
`tools/` and the page takes the photographs through the existing responsive
pipeline, exactly as the project pages do.

Nothing here is an argument for keeping the drawings. It is an argument for the
drawings being good while they are what we have.
