/* ============================================================================
   NUANSE — audit.js · the two-minute brand audit

   Eight questions, a score, and the three details we would look at first.
   Loaded after core.js by every page that carries the modal markup: the home
   page, whose "Find the detail" section opens it, and the contact page, where
   it is the second of the two routes.

   WHY IT IS A FILE. It was §9 of home.js (item A5), which meant the audit
   existed on exactly one page. The contact page needs it too, and the test in
   README is the one that decides: if a second page imports it, it is not that
   page's any more. The styles made the same trip, from home.css into core.css.

   WHAT CHANGED IN THE MOVE. The questions, the scoring, the three-flag result
   and every line of copy are what home.js had. Two things are new, and both
   are fixes to defects the move exposed rather than redesigns:

   1. IT RUNS WITHOUT GSAP. In home.js the engine was defined above the
      `if (NU.dead) return` floor but wired below it, so with the CDN blocked
      the button was dead and the modal unreachable. Worse, openAudit's only
      route to visibility was a gsap tween on opacity — so had it been wired,
      it would have trapped focus behind a dialog nobody could see. Every
      animation here now sits behind one flag and the modal opens either way.
      core.css's .modal.open carries the opacity half of that.

   2. IT BRINGS ITS OWN ESC AND FOCUS TRAP WHEN CORE CANNOT. core.js's
      no-GSAP exit exports a much smaller NU — no trap, no onEsc, no
      stopScroll, no cursorRest. Each is reached through a guard with a
      plain-DOM fallback, because "the audit still works with GSAP blocked"
      has to include the keyboard.

   Style follows core.js: modern syntax, no modules, no build step.
   ========================================================================== */
(() => {
  'use strict';
  const NU = window.NU;
  if (!NU) return;

  const { $, $$, RM, esc, wrapS, wrapWords } = NU;

  const modal = $('.modal');
  const mBody = $('.m-body');
  const mStep = $('.m-step');
  const prog = $('.prog i');
  const opener = $('.open-audit');
  /* A page without the markup loads this file for free and does nothing. */
  if (!modal || !mBody || !mStep) return;

  /* The animation flag. NU.dead means core.js took its no-GSAP exit; the
     window.gsap test also covers GSAP present but failing to define. */
  const ANIM = !NU.dead && !!window.gsap;

  /* ---------------------------------------------------------- the questions
     Eight, each paired with the flag it raises when the answer is not yes.
     The flag is written as a finding rather than a scold: it is the sentence
     we would say out loud, and it is what the visitor takes away if they
     read nothing else. Carried over unchanged from home.js §9. */
  const QS = [
    ['Could a stranger tell what you do in five seconds?', 'Your name and logo don’t say what you do yet.'],
    ['Do your website, documents and social posts use the same two typefaces?', 'Typefaces change from one surface to the next.'],
    ['Do your online listings and profiles match your website?', 'Your listings look like a different business.'],
    ['Are your prices presented as a decision, not an apology?', 'Prices are presented apologetically.'],
    ['Has someone outside the team repeated your homepage headline back correctly?', 'Your headline isn’t being understood.'],
    ['Do your photos share one light and one style?', 'Photos don’t share one light or style.'],
    ['Do you know last month’s cost per lead or per sale from ads?', 'Ad spend isn’t tied to results yet.'],
    ['Would you charge 15% more if the brand looked as good as the work?', 'The brand is holding your pricing back.']
  ];

  let qi = 0;
  let ans = [];
  let auditFocus = null;

  function renderQ() {
    if (qi >= QS.length) { renderResult(); return; }
    mStep.textContent = `Question ${qi + 1} of ${QS.length}`;
    if (prog) prog.style.transform = `scaleX(${qi / QS.length})`;
    mBody.innerHTML = `<p class="q">${wrapWords(QS[qi][0])}</p>` +
      '<div class="answers"><button data-a="1">Yes</button><button data-a="0">No</button><button data-a="2">Not sure</button></div>';
    if (ANIM && !RM) gsap.from(mBody.children, { opacity: 0, y: 20, duration: 0.6, stagger: 0.06 });
    $$('.answers button', mBody).forEach((b) => {
      b.addEventListener('click', () => { ans[qi] = +b.dataset.a; qi++; renderQ(); });
    });
    const first = $('.answers button', mBody);
    if (first) first.focus({ preventScroll: true });
  }

  function renderResult() {
    if (prog) prog.style.transform = 'scaleX(1)';
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
    if (ANIM && !RM) gsap.from(mBody.children, { opacity: 0, y: 20, duration: 0.7, stagger: 0.06 });
  }

  /* ------------------------------------------------------------- open/close
     The scroll lock goes through NU where core exported it and falls back to
     plain DOM where it did not — core's no-GSAP exit ships a much smaller NU
     than its full one. */
  const stop = () => { if (NU.stopScroll) NU.stopScroll(); else document.body.style.overflow = 'hidden'; };
  const start = () => { if (NU.startScroll) NU.startScroll(); else document.body.style.overflow = ''; };

  function openAudit() {
    auditFocus = document.activeElement;
    qi = 0;
    ans = [];
    renderQ();
    stop();
    if (NU.cursorRest) NU.cursorRest();
    modal.classList.add('open');
    if (!ANIM) return;              /* core.css's .modal.open already shows it */
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: RM ? 0.3 : 0.6, ease: RM ? 'none' : NU.EASE });
    if (!RM) gsap.fromTo('.modal-card', { y: 40 }, { y: 0, duration: 0.9 });
  }

  function closeAudit() {
    if (!modal.classList.contains('open')) return;
    const done = () => {
      modal.classList.remove('open');
      start();
      if (auditFocus) auditFocus.focus({ preventScroll: true });
    };
    if (!ANIM) { done(); return; }
    gsap.to(modal, { opacity: 0, duration: RM ? 0.3 : 0.5, onComplete: done });
  }

  /* --------------------------------------------------------------- the trap
     Tab must not walk out of a dialog. core.js exports NU.trap on its full
     path and not on its no-GSAP one, so this is the same logic as a
     fallback. It is eight lines, and a modal without it is a modal a
     keyboard user falls out of the back of. */
  function trapLocal(box) {
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

  /* -------------------------------------------------------------- wiring up
     .open-audit is whatever starts it on this page — the home page's section
     button, the contact page's second route. Both call the same function and
     neither knows the other exists. */
  (NU.trap || trapLocal)(modal);
  if (opener) opener.addEventListener('click', openAudit);
  const closeBtn = $('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeAudit);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAudit(); });
  if (NU.onEsc) NU.onEsc(closeAudit);
  else document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAudit(); });

  /* A #audit deep link opens it, so the nav's "Free audit" and the footer's
     "two-minute audit" land the visitor in the questions rather than beside a
     closed dialog. Deferred to onReady so the curtain is up before the modal
     is over it. Only where there is an opener, which is the page saying it
     owns an audit. */
  if (window.location.hash === '#audit' && opener) {
    if (NU.onReady) NU.onReady(() => openAudit());
    else window.addEventListener('load', () => openAudit(), { once: true });
  }
})();
