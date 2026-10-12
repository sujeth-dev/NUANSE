/* ============================================================================
   NUANSE — boot.js

   Capability flags, set on <html> before first paint. Loaded synchronously in
   <head>, which is the point: .rm and .touch have to exist before any CSS
   that branches on them is applied, or reduced-motion users see one frame of
   the full-motion page.

   Why this is a file and not an inline <script>: the CSP drops
   'unsafe-inline' from script-src. An inline script could have been allowed
   with a 'sha256-...' hash instead, and that would save a request — but the
   hash has to match byte for byte across every page, and the failure mode
   when it drifts is silent: the script is blocked, .rm never lands, and
   reduced-motion users quietly get animations. A 400-byte same-origin file
   that is immutable-cached costs a few milliseconds once and cannot fail
   that way.
   ========================================================================== */
(function () {
  var d = document.documentElement;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('rm');
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) d.classList.add('touch');
  } catch (e) {}
  d.classList.add('js', 'loading');
})();
