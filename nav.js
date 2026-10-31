const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
// The page behind the menu: hidden from clicks, keys and screen readers while it's open.
const behind = document.querySelectorAll('main, .site-header');

function setOpen(open, { focus = false } = {}) {
  if (open === nav.classList.contains('open')) return;
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  for (const el of behind) el.inert = open;
  if (focus) (open ? nav.querySelector('a') : toggle).focus();
}

toggle.addEventListener('click', (e) => {
  e.stopPropagation();
  // e.detail is 0 for keyboard presses: only then move focus into the menu.
  setOpen(!nav.classList.contains('open'), { focus: e.detail === 0 });
});

document.addEventListener('click', (e) => {
  if (!toggle.contains(e.target) && !nav.contains(e.target)) {
    setOpen(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false, { focus: true });
});

// Coming back with the browser's back button can restore the page with the menu open.
window.addEventListener('pageshow', () => setOpen(false));
