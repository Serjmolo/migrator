(function () {
  const header = document.querySelector('.header');
  if (!header) return;

  // Switch to the solid (white bg, dark text) state once the page leaves the hero.
  const THRESHOLD = 40;

  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > THRESHOLD);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
