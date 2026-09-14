/* Blocking head script: restore the palette before styles or body are rendered. */
(() => {
  const root = document.documentElement;
  const storageKey = 'portfolio-theme';
  const normalize = value => value === 'white' ? 'white' : 'navy';
  let saved = 'navy';
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
  root.dataset.theme = normalize(saved);
  let button;
  let transitionTimer;

  function updateControls() {
    const white = root.dataset.theme === 'white';
    if (button) button.setAttribute('aria-label', white ? 'Switch to navy theme' : 'Switch to white theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', white ? '#FFFFFF' : '#071A33');
  }

  function apply(value) {
    root.classList.add('theme-changing');
    clearTimeout(transitionTimer);
    root.dataset.theme = normalize(value);
    updateControls();
    document.dispatchEvent(new Event('themechange'));
    transitionTimer = setTimeout(() => root.classList.remove('theme-changing'), 450);
  }

  updateControls();
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    if (!button) return;
    updateControls();
    button.hidden = false;
    button.addEventListener('click', () => {
      apply(root.dataset.theme === 'navy' ? 'white' : 'navy');
      try { localStorage.setItem(storageKey, root.dataset.theme); } catch { /* Switching still works. */ }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) apply(event.newValue);
  });
})();
