const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

function setOpen(open) {
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

toggle.addEventListener('click', (e) => {
  e.stopPropagation();
  setOpen(!nav.classList.contains('open'));
});

document.addEventListener('click', (e) => {
  if (!toggle.contains(e.target) && !nav.contains(e.target)) {
    setOpen(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setOpen(false);
});
