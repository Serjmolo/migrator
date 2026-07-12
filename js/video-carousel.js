(function () {
  const stage = document.getElementById('videoStage');
  if (!stage) return;

  // TODO: replace poster/src with real files once supplied — array-driven, one entry per video.
  const videos = [
    { title: 'Перенос календарного события из Microsoft Exchange в CommuniGate Pro', poster: 'assets/images/video/video-poster.png', src: '' },
    { title: 'Миграция почтовых сообщений и вложений', poster: 'assets/images/video/video-poster.png', src: '' },
    { title: 'Синхронизация учётных записей через LDAP', poster: 'assets/images/video/video-poster.png', src: '' },
    { title: 'Перенос групп рассылки и личных контактов', poster: 'assets/images/video/video-poster.png', src: '' },
    { title: 'Настройка переговорных комнат и просмотр занятости', poster: 'assets/images/video/video-poster.png', src: '' }
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

  document.getElementById('videoPrevBtn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('videoNextBtn').addEventListener('click', () => goTo(current + 1));
  slides.prev.addEventListener('click', () => goTo(current - 1));
  slides.next.addEventListener('click', () => goTo(current + 1));

  render();
})();
