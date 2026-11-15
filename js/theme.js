/**
 * Theme Manager for Astrotools
 * Handles Dark / Light theme toggling with localStorage persistence
 */

const THEME_STORAGE_KEY = 'astrotools_theme';

export function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  // Default to dark mode for Astrotools
  return 'dark';
}

export function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }
  updateThemeButtonUI();
  window.dispatchEvent(new CustomEvent('astrotools-theme-changed', { detail: { theme } }));
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const target = current === 'light' ? 'dark' : 'light';
  setTheme(target);
  return target;
}

export function updateThemeButtonUI() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const iconEl = document.getElementById('theme-toggle-icon');
  const textEl = document.getElementById('theme-toggle-text');
  const btn = document.getElementById('btn-theme-toggle');

  if (iconEl) {
    iconEl.textContent = isLight ? '🌙' : '☀️';
  }
  if (textEl) {
    textEl.textContent = isLight ? 'Dark' : 'Light';
  }
  if (btn) {
    btn.setAttribute('title', isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme');
  }
}

export function initTheme() {
  // Apply initial theme
  const initial = getPreferredTheme();
  setTheme(initial);

  const btn = document.getElementById('btn-theme-toggle');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
}
