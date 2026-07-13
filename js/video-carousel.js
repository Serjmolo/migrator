(function () {
  const stage = document.getElementById('videoStage');
  if (!stage) return;

  // Array-driven, one entry per video. Title matches the caption shown under the clip.
  const videos = [
    { title: 'Перенос календарного события из Microsoft Exchange в CommuniGate Pro', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Перенос календарного события из Microsoft Exchange в CommuniGate Pro.mp4' },
    { title: 'Перенос календарного события из CommuniGate Pro в Microsoft Exchange', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Перенос календарного события из CommuniGate Pro в Microsoft Exchange.mp4' },
    { title: 'Синхронизация графика занятости в двух почтовых системах', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Синхронизация графика занятости в двух почтовых системах.mp4' }
  ];

  const captionEl = document.getElementById('videoCaption');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION = 450; // keep in sync with the .video__slide transition in video.css

  const len = videos.length;
  const mod = (n, m) => ((n % m) + m) % m;

  let current = 0;
  let animating = false;

  function makeSlide(video, posClass, role) {
    const slide = document.createElement('div');
    slide.className = 'video__slide ' + posClass;
    slide.dataset.role = role;
    const img = document.createElement('img');
    img.src = video.poster;
    img.alt = video.title;
    slide.appendChild(img);
    return slide;
  }

  function setPos(slide, posClass) {
    slide.classList.remove('pos-prev', 'pos-active', 'pos-next', 'pos-offleft', 'pos-offright');
    slide.classList.add(posClass);
    slide.dataset.role = posClass.replace('pos-', '');
  }

  // Rebuild the canonical 3 peek slots for `current`. Called on load and after a
  // navigation settles — the fresh slots land exactly where the animation ended,
  // so replacing the DOM is visually seamless.
  function render() {
    stage.querySelectorAll('.video__slide').forEach((s) => s.remove());
    const prev = makeSlide(videos[mod(current - 1, len)], 'pos-prev', 'prev');
    const active = makeSlide(videos[current], 'pos-active', 'active');
    const next = makeSlide(videos[mod(current + 1, len)], 'pos-next', 'next');
    stage.prepend(prev, active, next); // before the play chip so the chip stays on top
    captionEl.textContent = videos[current].title;
  }

  // dir: +1 = next (everything shifts left), -1 = prev (everything shifts right).
  function navigate(dir) {
    if (animating) return;
    const target = mod(current + dir, len);

    if (reduceMotion.matches) {
      current = target;
      render();
      return;
    }

    animating = true;
    const prev = stage.querySelector('[data-role="prev"]');
    const active = stage.querySelector('[data-role="active"]');
    const next = stage.querySelector('[data-role="next"]');

    if (dir > 0) {
      // A new slide is staged just off the right edge, then the whole set slides
      // one step left: prev exits left, active shrinks into prev, next grows into
      // center, the incoming slide takes the right peek.
      const incoming = makeSlide(videos[mod(target + 1, len)], 'pos-offright', 'next');
      stage.prepend(incoming);
      void stage.offsetWidth; // commit the off-stage start position before transitioning
      setPos(prev, 'pos-offleft');
      setPos(active, 'pos-prev');
      setPos(next, 'pos-active');
      setPos(incoming, 'pos-next');
    } else {
      const incoming = makeSlide(videos[mod(target - 1, len)], 'pos-offleft', 'prev');
      stage.prepend(incoming);
      void stage.offsetWidth;
      setPos(next, 'pos-offright');
      setPos(active, 'pos-next');
      setPos(prev, 'pos-active');
      setPos(incoming, 'pos-prev');
    }

    captionEl.textContent = videos[target].title;
    captionEl.classList.remove('is-changing');
    void captionEl.offsetWidth;
    captionEl.classList.add('is-changing');

    window.setTimeout(() => {
      current = target;
      render();
      animating = false;
    }, DURATION);
  }

  function openCurrent() {
    const src = videos[current].src;
    if (src) window.open(encodeURI(src), '_blank', 'noopener');
  }

  document.getElementById('videoPrevBtn').addEventListener('click', () => navigate(-1));
  document.getElementById('videoNextBtn').addEventListener('click', () => navigate(1));

  // Slides are recreated on every navigation, so route their clicks via delegation.
  stage.addEventListener('click', (e) => {
    if (e.target.closest('.video__play')) {
      openCurrent();
      return;
    }
    const slide = e.target.closest('.video__slide');
    if (!slide) return;
    if (slide.dataset.role === 'prev') navigate(-1);
    else if (slide.dataset.role === 'next') navigate(1);
  });

  const playBtn = stage.querySelector('.video__play');
  if (playBtn) {
    playBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCurrent();
      }
    });
  }

  render();
})();
