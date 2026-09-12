/* Delegated pointer updates: one active surface, one queued animation frame.
   No render loop when idle. Project filter replacements are observed locally. */
(() => {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null, bounds = null, pointer = null, frame = 0, parallaxDirty = true;
  const visibleDrawings = new Set();
  const drawings = [];
  const canTilt = () => finePointer.matches && !reducedMotion.matches && !document.hidden;

  function reset() {
    if (active) {
      active.classList.remove('depth-tracking');
      ['--tilt-x', '--tilt-y', '--light-x', '--light-y'].forEach(name => active.style.removeProperty(name));
    }
    active = bounds = pointer = null;
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(update); }
  function update() {
    frame = 0;
    // Read before writing; pointer movement does not remeasure the document.
    const positions = parallaxDirty && !reducedMotion.matches
      ? [...visibleDrawings].map(item => [item, item.section.getBoundingClientRect().top]) : [];
    parallaxDirty = false;
    if (active && pointer && canTilt()) {
      const x = Math.max(-1, Math.min(1, (pointer.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointer.y - bounds.top) / bounds.height * 2 - 1));
      const max = Number(active.dataset.depthTilt);
      active.style.setProperty('--tilt-x', `${(-y * max).toFixed(2)}deg`);
      active.style.setProperty('--tilt-y', `${(x * max).toFixed(2)}deg`);
      active.style.setProperty('--light-x', `${(x + 1) * 50}%`);
      active.style.setProperty('--light-y', `${(y + 1) * 50}%`);
      pointer = null;
    }
    positions.forEach(([item, top]) => item.svg.style.setProperty('--parallax-y', `${Math.max(-28, Math.min(28, -top * item.speed)).toFixed(1)}px`));
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      target.classList.toggle('depth-in-view', isIntersecting);
      target.classList.toggle('depth-offscreen', !isIntersecting);
      if (!isIntersecting && active === target) reset();
      drawings.filter(item => item.section === target).forEach(item => {
        if (isIntersecting) visibleDrawings.add(item); else visibleDrawings.delete(item);
      });
    });
    parallaxDirty = true;
    schedule();
  });
  function surface(element, max) {
    if (!element || element.classList.contains('depth-surface')) return;
    element.classList.add('depth-surface');
    element.dataset.depthTilt = max;
    observer.observe(element);
  }
  function layers(root, selector) { root.querySelectorAll(selector).forEach(el => el.classList.add('depth-layer')); }
  function projects() {
    document.querySelectorAll('.project-card').forEach(card => {
      surface(card, 3.5);
      layers(card, '.project-art, .project-body');
    });
  }
  function init() {
    const hero = document.querySelector('.system-action');
    surface(hero, 4);
    if (hero) layers(hero, '.system-head, .system-stats');
    surface(document.querySelector('#about .portrait'), .8);
    projects();
    document.querySelectorAll('.skill-grid article, .journey-card, .cert-card').forEach(el => el.classList.add('depth-card'));
    const grid = document.querySelector('#project-grid');
    if (grid) new MutationObserver(records => {
      records.forEach(record => record.removedNodes.forEach(node => {
        if (node.nodeType === 1) { observer.unobserve(node); if (node === active) reset(); }
      }));
      projects();
    }).observe(grid, {childList: true});

    const art = [
      ['.hero', .028, '<path d="M40 52 90 24l50 28v58l-50 29-50-29Z M40 52l50 29 50-29M90 81v58M90 24v57 M40 110l50-29 50 29"/>'],
      ['#about', .045, '<ellipse cx="90" cy="80" rx="68" ry="25" transform="rotate(-30 90 80)"/><ellipse cx="90" cy="80" rx="68" ry="25" transform="rotate(30 90 80)"/><circle cx="90" cy="80" r="6"/><circle cx="33" cy="57" r="3"/><circle cx="145" cy="108" r="3"/>'],
      ['#contact', .018, '<path d="m25 90 70-42 65 34-70 42Z m0-18 70-42 65 34-70 42Z m0 36 70-42 65 34-70 42Z"/>']
    ];
    art.forEach(([selector, speed, markup]) => {
      const section = document.querySelector(selector);
      if (!section) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'depth-atmosphere';
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.innerHTML = `<svg class="depth-drawing" viewBox="0 0 180 165" focusable="false">${markup}</svg>`;
      section.prepend(wrapper);
      drawings.push({section, speed, svg: wrapper.firstElementChild});
      observer.observe(section);
    });
  }
  document.addEventListener('pointerover', event => {
    if (!canTilt() || event.pointerType === 'touch') return;
    const target = event.target.closest?.('[data-depth-tilt]');
    if (!target || target === active) return;
    reset();
    active = target;
    bounds = target.getBoundingClientRect();
    target.classList.add('depth-tracking');
  }, {passive: true});
  document.addEventListener('pointermove', event => {
    if (!active || !canTilt()) return;
    pointer = {x: event.clientX, y: event.clientY};
    schedule();
  }, {passive: true});
  document.addEventListener('pointerout', event => {
    if (active && !active.contains(event.relatedTarget)) reset();
  }, {passive: true});
  document.addEventListener('pointercancel', reset, {passive: true});
  document.addEventListener('focusin', reset);
  addEventListener('blur', reset);
  addEventListener('scroll', () => { reset(); parallaxDirty = true; if (!reducedMotion.matches) schedule(); }, {passive: true});
  addEventListener('resize', () => { reset(); parallaxDirty = true; schedule(); }, {passive: true});
  function motionChanged() {
    reset();
    cancelAnimationFrame(frame);
    frame = 0;
    document.documentElement.classList.toggle('depth-page-hidden', document.hidden);
    drawings.forEach(item => item.svg.style.removeProperty('--parallax-y'));
    parallaxDirty = true;
    if (!document.hidden && !reducedMotion.matches) schedule();
  }
  document.addEventListener('visibilitychange', motionChanged);
  reducedMotion.addEventListener('change', motionChanged);
  finePointer.addEventListener('change', motionChanged);
  // Deferred scripts run while readyState is "interactive". Wait for app.js's
  // earlier DOMContentLoaded handler to render both projects and capabilities.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
})();
