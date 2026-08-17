(function () {
  // Mobile view of the capability table (Figma 770:1826): one module column at
  // a time beside the label column, stepped by the arrows in each module head.
  // Every module carries its own copy of the arrows, so clicks are delegated.
  const root = document.getElementById('tableModules');
  if (!root) return;

  const modules = Array.from(root.querySelectorAll('.table__module'));
  if (modules.length < 2) return;

  let index = 0;

  function show(next) {
    index = Math.min(modules.length - 1, Math.max(0, next));
    modules.forEach((el, i) => el.classList.toggle('is-active', i === index));
    // Ends lose the arrow that would go nowhere, matching the design.
    modules[index].querySelectorAll('.table__module-nav').forEach((btn) => {
      const dir = Number(btn.dataset.dir);
      btn.disabled = dir < 0 ? index === 0 : index === modules.length - 1;
    });
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.table__module-nav');
    if (!btn || btn.disabled) return;
    show(index + Number(btn.dataset.dir));
  });

  // Swiping the card does the same thing; vertical drags stay a page scroll.
  const SWIPE = 40;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  root.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  root.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) <= Math.abs(dy)) return;
    show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  show(0);
})();
