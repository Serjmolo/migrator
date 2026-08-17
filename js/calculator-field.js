(function () {
  // Mobile-only typeable readouts for the calculator (Figma 724:817).
  //
  // js/calculator.js is a verbatim port of the regression baseline and must not
  // change, so this sits entirely outside it: it mirrors whatever that script
  // writes into the read-only <p> readouts, and pushes a typed value back by
  // moving the slider and firing the same 'input' event the sliders already
  // listen for. All formatting still comes from calculator.js.
  const fields = [
    { input: 'volumeInput', unit: 'volumeUnit', display: 'volumeDisplay', slider: 'volumeSlider', toSlider: volumeToSliderPos },
    { input: 'ratioInput', unit: 'ratioUnit', display: 'ratioDisplay', slider: 'ratioSlider', toSlider: (n) => n },
    { input: 'hoursPerDayInput', unit: 'hoursPerDayUnit', display: 'hoursPerDayDisplay', slider: 'hoursPerDaySlider', toSlider: (n) => n }
  ];

  // Mirror of the calibration in js/calculator.js — inverting its slider→volume
  // curve. Keep in step with CALIBRATION_POINTS there if that scale ever moves.
  const CALIBRATION = [
    { pos: 0, mb: 1 },
    { pos: 25, mb: 1024 * 1024 },
    { pos: 50, mb: 100 * 1024 * 1024 },
    { pos: 75, mb: 350 * 1024 * 1024 },
    { pos: 100, mb: 700 * 1024 * 1024 }
  ];

  const UNIT_MB = { 'МБ': 1, 'ГБ': 1024, 'ТБ': 1024 * 1024 };

  function volumeToSliderPos(value, unit) {
    const mb = value * (UNIT_MB[unit] || 1);
    const first = CALIBRATION[0];
    const last = CALIBRATION[CALIBRATION.length - 1];
    if (mb <= first.mb) return first.pos;
    if (mb >= last.mb) return last.pos;
    for (let i = 0; i < CALIBRATION.length - 1; i++) {
      const left = CALIBRATION[i];
      const right = CALIBRATION[i + 1];
      if (mb >= left.mb && mb <= right.mb) {
        const t = (Math.log10(mb) - Math.log10(left.mb)) / (Math.log10(right.mb) - Math.log10(left.mb));
        return left.pos + t * (right.pos - left.pos);
      }
    }
    return first.pos;
  }

  // "28.00 ГБ" → { number: "28.00", unit: "ГБ" }; "35.0%" → { "35.0", "%" }
  function splitDisplay(text) {
    const match = String(text).trim().match(/^([-\d\s.,]+)\s*(.*)$/);
    if (!match) return { number: '', unit: '' };
    return { number: match[1].replace(/\s/g, '').trim(), unit: match[2].trim() };
  }

  function parseTyped(raw) {
    const n = parseFloat(String(raw).replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  fields.forEach((cfg) => {
    const input = document.getElementById(cfg.input);
    const unitEl = document.getElementById(cfg.unit);
    const display = document.getElementById(cfg.display);
    const slider = document.getElementById(cfg.slider);
    if (!input || !unitEl || !display || !slider) return;

    let currentUnit = '';

    const wrap = input.parentElement;

    function pull() {
      const parts = splitDisplay(display.textContent);
      currentUnit = parts.unit;
      unitEl.textContent = parts.unit;
      // «%» sits flush against the number in Russian typography; «МБ» / «ч» don't.
      if (wrap) wrap.classList.toggle('calc__field--tight', parts.unit === '%');
      // Don't fight the user mid-edit; the unit label is safe to keep current.
      if (document.activeElement !== input) input.value = parts.number;
    }

    function push() {
      const typed = parseTyped(input.value);
      if (typed === null) {
        pull(); // unparseable — snap back to the real value
        return;
      }
      // A unit typed alongside the number wins, so "28 ГБ" works even while the
      // slider currently reads in ТБ; otherwise keep the displayed unit.
      const typedUnit = splitDisplay(input.value).unit.toUpperCase();
      const unit = UNIT_MB[typedUnit] ? typedUnit : currentUnit;
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const pos = Math.min(max, Math.max(min, cfg.toSlider(typed, unit)));
      slider.value = pos;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      pull();
    }

    input.addEventListener('change', push);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur(); // triggers change
      }
    });
    input.addEventListener('focus', () => input.select());

    new MutationObserver(pull).observe(display, { childList: true, characterData: true, subtree: true });
    pull();
  });
})();
