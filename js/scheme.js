(function () {
  // graph.html renders the full 1360px-wide diagram and this fits it to the
  // screen: plain scale when the viewport is landscape-ish, rotated 90° when
  // turning it sideways buys a meaningfully larger scale (i.e. on phones held
  // upright). Without the rotation a 360px screen would show it at ~26%.
  const stage = document.getElementById('schemeStage');
  const fit = document.getElementById('schemeFit');
  if (!stage || !fit) return;

  const MARGIN = 0.96; // breathing room around the diagram
  const ROTATE_GAIN = 1.15; // only rotate when it is clearly worth it

  function apply() {
    // Measure unscaled, otherwise the previous transform feeds back into the fit.
    fit.style.transform = 'translate(-50%, -50%)';
    const w = fit.offsetWidth;
    const h = fit.offsetHeight;
    if (!w || !h) return;

    const box = stage.getBoundingClientRect();
    const plain = Math.min(box.width / w, box.height / h);
    const rotated = Math.min(box.width / h, box.height / w);
    const useRotation = rotated > plain * ROTATE_GAIN;
    const scale = (useRotation ? rotated : plain) * MARGIN;

    fit.style.transform =
      'translate(-50%, -50%)' + (useRotation ? ' rotate(90deg)' : '') + ' scale(' + scale + ')';
  }

  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('orientationchange', apply, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  apply();

  const fsBtn = document.getElementById('schemeFullscreen');
  if (fsBtn) {
    // Real fullscreen needs a user gesture, so it is a button rather than
    // something the page requests on load.
    fsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    });
  }

  const closeBtn = document.getElementById('schemeClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      // Opened via target="_blank", so there is a tab to close; if the page was
      // reached some other way, fall back to going back.
      window.close();
      window.setTimeout(() => { if (!window.closed) history.back(); }, 100);
    });
  }
})();
