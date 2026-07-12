(function () {
  const stage = document.getElementById('videoStage');
  if (!stage) return;

  // Array-driven, one entry per video. Title matches the caption shown under the clip.
  const videos = [
    { title: 'Перенос календарного события из Microsoft Exchange в CommuniGate Pro', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Перенос календарного события из Microsoft Exchange в CommuniGate Pro.mp4' },
    { title: 'Перенос календарного события из CommuniGate Pro в Microsoft Exchange', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Перенос календарного события из CommuniGate Pro в Microsoft Exchange.mp4' },
    { title: 'Синхронизация графика занятости в двух почтовых системах', poster: 'assets/images/video/video-poster.png', src: 'assets/video/Синхронизация графика занятости в двух почтовых системах.mp4' }
  ];

  let current = 0;
  const mod = (n, m) => ((n % m) + m) % m;

  const slides = {
    prev: stage.querySelector('[data-role="prev"]'),
    active: stage.querySelector('[data-role="active"]'),
    next: stage.querySelector('[data-role="next"]')
  };
  const captionEl = document.getElementById('videoCaption');
  const section = stage.closest('.video');

  function setSlot(role, video) {
    const img = slides[role].querySelector('[data-role-img]');
    img.src = video.poster;
    img.alt = video.title;
  }

  // Restart the CSS swap animation in the given direction ('next' | 'prev').
  function animate(dir) {
    if (!section) return;
    section.classList.remove('is-next', 'is-prev');
    void section.offsetWidth; // force reflow so the animation replays on every navigation
    section.classList.add(dir === 'prev' ? 'is-prev' : 'is-next');
  }

  function render(dir) {
    setSlot('prev', videos[mod(current - 1, videos.length)]);
    setSlot('active', videos[current]);
    setSlot('next', videos[mod(current + 1, videos.length)]);
    captionEl.textContent = videos[current].title;
    if (dir) animate(dir);
  }

  function goTo(index, dir) {
    current = mod(index, videos.length);
    render(dir);
  }

  function openCurrent() {
    const src = videos[current].src;
    if (src) window.open(encodeURI(src), '_blank', 'noopener');
  }

  document.getElementById('videoPrevBtn').addEventListener('click', () => goTo(current - 1, 'prev'));
  document.getElementById('videoNextBtn').addEventListener('click', () => goTo(current + 1, 'next'));
  slides.prev.addEventListener('click', () => goTo(current - 1, 'prev'));
  slides.next.addEventListener('click', () => goTo(current + 1, 'next'));

  const playBtn = stage.querySelector('.video__play');
  if (playBtn) {
    playBtn.addEventListener('click', openCurrent);
    playBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCurrent();
      }
    });
  }

  render();
})();
