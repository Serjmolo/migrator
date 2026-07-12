(function () {
  const form = document.getElementById('demoForm');
  if (!form) return;
  const status = document.getElementById('demoFormStatus');

  // TODO: wire to a real endpoint (email/CRM) once one is available.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
  });
})();
