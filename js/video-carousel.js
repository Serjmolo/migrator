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

  function setSlot(role, video) {
    const img = slides[role].querySelector('[data-role-img]');
    img.src = video.poster;
    img.alt = video.title;
  }

  function render() {
    setSlot('prev', videos[mod(current - 1, videos.length)]);
    setSlot('active', videos[current]);
    setSlot('next', videos[mod(current + 1, videos.length)]);
    captionEl.textContent = videos[current].title;
  }

  function goTo(index) {
    current = mod(index, videos.length);
    render();
  }

  function openCurrent() {
    const src = videos[current].src;
    if (src) window.open(encodeURI(src), '_blank', 'noopener');
  }

  document.getElementById('videoPrevBtn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('videoNextBtn').addEventListener('click', () => goTo(current + 1));
  slides.prev.addEventListener('click', () => goTo(current - 1));
  slides.next.addEventListener('click', () => goTo(current + 1));

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
