(function () {
  const form = document.getElementById('demoForm');
  if (!form) return;
  const status = document.getElementById('demoFormStatus');

  // Поля с обязательной проверкой и их сообщения об ошибке.
  const fields = [
    {
      input: form.querySelector('[name="name"]'),
      error: document.getElementById('nameError'),
      validate: (v) => (v.trim() ? '' : 'Поле должно быть заполнено'),
    },
    {
      input: form.querySelector('[name="email"]'),
      error: document.getElementById('emailError'),
      validate: (v) => {
        if (!v.trim()) return 'Поле должно быть заполнено';
        // Простая проверка формата: что-то@что-то.домен
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Введите корректный email';
      },
    },
  ].filter((f) => f.input && f.error);

  function showError(field, message) {
    field.error.textContent = message;
    field.error.hidden = false;
    field.input.classList.add('is-invalid');
    field.input.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    field.error.textContent = '';
    field.error.hidden = true;
    field.input.classList.remove('is-invalid');
    field.input.removeAttribute('aria-invalid');
  }

  // Скрываем ошибку, как только пользователь начинает исправлять поле.
  fields.forEach((field) => {
    field.input.addEventListener('input', () => {
      if (field.input.classList.contains('is-invalid')) clearError(field);
    });
  });

  // TODO: wire to a real endpoint (email/CRM) once one is available.
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalid = null;
    fields.forEach((field) => {
      const message = field.validate(field.input.value);
      if (message) {
        showError(field, message);
        if (!firstInvalid) firstInvalid = field.input;
      } else {
        clearError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    form.reset();
  });
})();
