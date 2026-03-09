(function () {
  'use strict';

  var COOKIE_NAME = 'theme';
  var COOKIE_DAYS = 365;
  var HTML = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function getCookie() {
    var m = document.cookie.match(/(?:^|;\s*)theme=(\w+)/);
    return m ? m[1] : null;
  }

  function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=Lax';
  }

  function clearCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
  }

  function applyTheme(resolved) {
    if (resolved === 'dark') {
      HTML.removeAttribute('data-theme');
    } else {
      HTML.setAttribute('data-theme', resolved);
    }
  }

  function getActiveChoice() {
    var cookie = getCookie();
    if (cookie === 'light') return 'light';
    if (cookie === 'dark') return 'dark';
    return 'auto';
  }

  function setChoice(choice) {
    if (choice === 'auto') {
      clearCookie(COOKIE_NAME);
      applyTheme(getSystemTheme());
    } else {
      setCookie(COOKIE_NAME, choice, COOKIE_DAYS);
      applyTheme(choice);
    }
    updatePickerUI(choice);
  }

  function updatePickerUI(active) {
    var buttons = document.querySelectorAll('#theme-picker .theme-seg');
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-checked', btn.getAttribute('data-theme-choice') === active ? 'true' : 'false');
    });
  }

  function init() {
    var picker = document.getElementById('theme-picker');
    if (!picker) return;

    updatePickerUI(getActiveChoice());

    picker.addEventListener('click', function (e) {
      var btn = e.target.closest('.theme-seg');
      if (!btn) return;
      var choice = btn.getAttribute('data-theme-choice');
      if (choice) setChoice(choice);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        if (getActiveChoice() === 'auto') {
          applyTheme(e.matches ? 'light' : 'dark');
        }
      });
    }
  }

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
