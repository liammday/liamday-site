/**
 * variant.js — Profile variant switcher for liamday.co.uk
 *
 * Non-default variants are pre-rendered with the HTML `hidden` attribute
 * by Jekyll (no flash of wrong content). This script only needs to act
 * when a non-default variant is active.
 *
 * Usage:
 *   ?variant=pm       → Product Manager · Digital & Mobile
 *   ?variant=defence  → Product Manager · Defence & Government
 *   ?variant=default  → Reset to default profile
 *   (no param)        → Use cookie if set, else default
 *
 * Share a targeted URL:  https://www.liamday.co.uk/?variant=pm
 * The variant is remembered for 24 hours via cookie.
 */

(function () {
  var COOKIE = 'cv_variant';
  var TTL    = 60 * 60 * 24; // 24 h
  var VALID  = ['default', 'pm', 'defence'];

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(val) {
    document.cookie = COOKIE + '=' + val + '; path=/; max-age=' + TTL + '; SameSite=Lax';
  }

  function getVariant() {
    var p = param('variant');
    if (p && VALID.indexOf(p) !== -1) { setCookie(p); return p; }
    var c = getCookie(COOKIE);
    if (c && VALID.indexOf(c) !== -1) return c;
    return 'default';
  }

  function applyVariant(variant) {
    // Show elements matching this variant, hide all others
    var els = document.querySelectorAll('[data-variant]');
    for (var i = 0; i < els.length; i++) {
      els[i].hidden = (els[i].getAttribute('data-variant') !== variant);
    }
  }

  var variant = getVariant();

  // Default is already correct in the server-rendered HTML (others start hidden).
  // Only manipulate the DOM when switching to a non-default variant.
  if (variant !== 'default') {
    document.addEventListener('DOMContentLoaded', function () {
      applyVariant(variant);
    });
  }
})();
