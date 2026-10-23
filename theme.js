// Loaded in <head> (not deferred) so the theme is set before first paint.
// Follows the system setting unless the visitor has picked one with the toggle.
(() => {
  const root = document.documentElement;
  let system, choice;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') choice = saved;
  } catch {}
  try { system = matchMedia('(prefers-color-scheme: dark)'); } catch {}

  function update() {
    const dark = choice ? choice === 'dark' : !!system?.matches;
    root.dataset.theme = dark ? 'dark' : 'light';
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    button.hidden = false;
    button.setAttribute('aria-pressed', String(dark));
    button.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
    button.firstElementChild.textContent = dark ? '☀︎' : '☾';
  }

  update();
  document.addEventListener('DOMContentLoaded', () => {
    update();
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      choice = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', choice); } catch {}
      update();
    });
  });
  system?.addEventListener?.('change', update);
})();
