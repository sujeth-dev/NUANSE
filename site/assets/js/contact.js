/* ============================================================================
   NUANSE — contact.js · the brief that writes itself

   Item A4, route one. The visitor picks what they need; those picks compose a
   mailto: with the subject and body already written, and the button hands it
   to their own mail app. Route two on the same page is the audit, which is
   assets/js/audit.js and knows nothing about this file.

   WHY A MAILTO AND NOT A FORM. There is no server and there is not going to
   be one — the site is static, runs from file://, and ships exactly as
   committed. A contact form would therefore have to post to somebody else's
   endpoint, which means a third-party host in the CSP, a privacy story, and a
   silent failure mode where the visitor sees "thanks" and we never receive
   anything. A composed mail fails visibly or not at all, and the visitor can
   read the whole thing first.

   WHAT THE COMPOSER PROMISES, and both halves matter:

   - The draft is a real textarea, not a preview. It can be rewritten before
     it is sent.
   - Once the visitor has typed into it, the picks stop rewriting their words.
     Recomposing over somebody's sentences because they changed a chip is the
     one behaviour that would make this worse than an empty mail client. The
     dirty flag is the whole reason this file is longer than twenty lines.

   NO-JS AND NO-GSAP. The button ships with a plain mailto: href, so it sends
   mail with this file blocked entirely. Nothing here needs GSAP; it is all
   DOM and string building, and it deliberately runs ABOVE any NU.dead guard.

   Style follows core.js: modern syntax, no modules, no build step.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$ } = NU;

  const draft = $('#ct-draft');
  const subjectEl = $('#ct-subject');
  const sendEl = $('#ct-send');
  const whoEl = $('#ct-who');
  const noticedEl = $('#ct-noticed');
  /* not the contact page */
  if (!draft || !sendEl || !subjectEl) return;

  const TO = 'hello@nuanse.studio';

  /* The visitor's own words, once they have written any. Set on the first
     real keystroke in the draft and never cleared: from that point the picks
     update the subject and the mailto only, and the body is theirs. */
  let dirty = false;

  const picks = () => ({
    needs: $$('.ct-chip[data-need][aria-pressed=true]').map((b) => b.dataset.need),
    shape: ($('.ct-chip[data-shape][aria-pressed=true]') || {}).dataset,
    when: ($('.ct-chip[data-when][aria-pressed=true]') || {}).dataset
  });

  /* ------------------------------------------------------------- the subject
     Specific enough to find in a mailbox a month later, and honest when
     nothing has been picked yet. */
  function subject(p) {
    const what = p.needs.length ? p.needs.join(' + ') : 'A brief';
    const who = (whoEl && whoEl.value.trim()) || '';
    /* the business, where one was given: "Identity + Websites — Zingara" */
    const tail = who ? ` — ${who.split(',').slice(-1)[0].trim() || who}` : '';
    return `${what}${tail}`.slice(0, 120);
  }

  /* ---------------------------------------------------------------- the body
     Written as a brief rather than as form output: whole sentences, in the
     order we would want to read them, with the visitor's own two answers
     carried through verbatim. A line with nothing behind it is left out
     entirely rather than shipped as "Timing: —", because an empty field in a
     mail reads as something the sender forgot. */
  function body(p) {
    const L = [];
    L.push('Hello NUANSE,');
    L.push('');
    if (whoEl && whoEl.value.trim()) L.push(whoEl.value.trim() + '.');
    if (p.needs.length) {
      L.push(`We are after ${list(p.needs.map(lower))}.`);
    }
    if (p.shape && p.shape.shape) L.push(`${p.shape.shape}.`);
    if (p.when && p.when.when) L.push(`Timing: ${lower(p.when.when)}.`);
    if (noticedEl && noticedEl.value.trim()) {
      L.push('');
      L.push('What we have noticed:');
      L.push(noticedEl.value.trim());
    }
    L.push('');
    L.push('Where should we start?');
    L.push('');
    return L.join('\n');
  }

  /* "a, b and c" — an Oxford-free list, because the mail is prose */
  function list(a) {
    if (a.length <= 1) return a[0] || '';
    return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }
  /* "Not sure yet" is a sentence fragment mid-clause, so it is lowered —
     except where it is a proper noun, of which this vocabulary has none. */
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  /* ------------------------------------------------------------ the mailto
     encodeURIComponent on both halves, which is what makes a body with real
     newlines and an em dash survive the handoff. A mail client is handed the
     URL by the browser, so a raw newline in it would be truncated at the
     first one. */
  function compose() {
    const p = picks();
    const subj = subject(p);
    subjectEl.textContent = subj;
    /* a step that has an answer gets its number in copper */
    $$('.ct-field').forEach((f) => {
      const done = $$('.ct-chip[aria-pressed=true]', f).length > 0 ||
        $$('.ct-input', f).some((i) => i.value.trim());
      f.classList.toggle('done', done);
    });
    if (!dirty) draft.value = body(p);
    sendEl.href = `mailto:${TO}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(draft.value)}`;
  }

  /* ------------------------------------------------------------- the chips
     Multi-select where the group has no data-single, one-of where it does.
     aria-pressed is the state, read by both the CSS and the composer, so
     there is no second copy of it in a JS variable to fall out of step. */
  $$('.ct-chip').forEach((b) => {
    b.addEventListener('click', () => {
      const group = b.parentElement;
      const on = b.getAttribute('aria-pressed') === 'true';
      if (group && group.dataset.single) {
        $$('.ct-chip', group).forEach((o) => o.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', String(!on));
      } else {
        b.setAttribute('aria-pressed', String(!on));
        /* "Not sure yet" and a list of disciplines are different answers to
           the same question, so picking either clears the other. */
        if (!on) {
          const sure = b.dataset.need === 'Not sure yet';
          $$('.ct-chip[data-need]').forEach((o) => {
            if (o === b) return;
            if (sure || o.dataset.need === 'Not sure yet') o.setAttribute('aria-pressed', 'false');
          });
        }
      }
      compose();
    });
  });

  [whoEl, noticedEl].forEach((el) => {
    if (el) el.addEventListener('input', compose);
  });

  /* The draft going dirty is a one-way door, and only a real edit opens it:
     an input event fires for typing and pasting but not for the programmatic
     assignment in compose(), so this cannot trip itself. */
  draft.addEventListener('input', () => { dirty = true; });

  /* A visitor who has rewritten the draft and then changes their mind can get
     the composed version back. Without this the dirty flag would be a trap. */
  const resetEl = $('.ct-reset');
  if (resetEl) {
    resetEl.addEventListener('click', () => {
      dirty = false;
      compose();
      draft.focus({ preventScroll: true });
      if (NU.toast) NU.toast('Draft rewritten from your picks');
    });
  }

  /* first paint: an empty-handed but complete mail, so the sheet is never
     blank and the button works before a single chip is touched */
  compose();
})();
