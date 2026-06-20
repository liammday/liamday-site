// Light/auto/dark theme picker, ported from assets/js/theme-toggle.js.
// Sets data-theme on <html>; "auto" follows the system preference. Cookie-backed
// so the choice persists; the anti-FOUC inline script in BaseLayout applies it
// before first paint.
type Choice = 'light' | 'dark' | 'auto';

const COOKIE_NAME = 'theme';
const COOKIE_DAYS = 365;
const HTML = document.documentElement;

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function getCookie(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)theme=(\w+)/);
  return m ? m[1] : null;
}

function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (resolved === 'dark') {
    HTML.removeAttribute('data-theme');
  } else {
    HTML.setAttribute('data-theme', resolved);
  }
}

function getActiveChoice(): Choice {
  const cookie = getCookie();
  if (cookie === 'light') return 'light';
  if (cookie === 'dark') return 'dark';
  return 'auto';
}

function updatePickerUI(active: Choice): void {
  const buttons = document.querySelectorAll<HTMLElement>('#theme-picker .theme-seg');
  buttons.forEach((btn) => {
    btn.setAttribute(
      'aria-checked',
      btn.getAttribute('data-theme-choice') === active ? 'true' : 'false',
    );
  });
}

function setChoice(choice: Choice): void {
  if (choice === 'auto') {
    clearCookie(COOKIE_NAME);
    applyTheme(getSystemTheme());
  } else {
    setCookie(COOKIE_NAME, choice, COOKIE_DAYS);
    applyTheme(choice);
  }
  updatePickerUI(choice);
}

function init(): void {
  const picker = document.getElementById('theme-picker');
  if (!picker) return;

  updatePickerUI(getActiveChoice());

  picker.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>('.theme-seg');
    if (!btn) return;
    const choice = btn.getAttribute('data-theme-choice') as Choice | null;
    if (choice) setChoice(choice);
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
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
