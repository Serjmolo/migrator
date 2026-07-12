(function() {
    // ---------- ФИКСИРОВАННЫЕ КОНСТАНТЫ ----------
    const MB_TO_BYTES = 1048576;
    const AVG_SIZE_NO_BYTES = 32740;
    const AVG_SIZE_ATT_BYTES = 1519608;
    const AVG_SIZE_NO_MB = AVG_SIZE_NO_BYTES / MB_TO_BYTES;
    const AVG_SIZE_ATT_MB = AVG_SIZE_ATT_BYTES / MB_TO_BYTES;

    const SPEED_NO_MBPS = 19905 / 1200;
    const SPEED_ATT_MBPS = 19451 / 180;

    // ----- КАСТОМНАЯ ЛОГАРИФМИЧЕСКАЯ ШКАЛА -----
    const CALIBRATION_POINTS = [
        { pos: 0,   volumeMB: 1 },
        { pos: 25,  volumeMB: 1024 * 1024 },
        { pos: 50,  volumeMB: 100 * 1024 * 1024 },
        { pos: 75,  volumeMB: 350 * 1024 * 1024 },
        { pos: 100, volumeMB: 700 * 1024 * 1024 }
    ];

    function findSegment(pos) {
        for (let i = 0; i < CALIBRATION_POINTS.length - 1; i++) {
            if (pos >= CALIBRATION_POINTS[i].pos && pos <= CALIBRATION_POINTS[i+1].pos) {
                return { left: CALIBRATION_POINTS[i], right: CALIBRATION_POINTS[i+1] };
            }
        }
        return { left: CALIBRATION_POINTS[0], right: CALIBRATION_POINTS[CALIBRATION_POINTS.length-1] };
    }

    function sliderToVolume(sliderPos) {
        let seg = findSegment(sliderPos);
        let t = (sliderPos - seg.left.pos) / (seg.right.pos - seg.left.pos);
        let logLeft = Math.log10(seg.left.volumeMB);
        let logRight = Math.log10(seg.right.volumeMB);
        let logVolume = logLeft + t * (logRight - logLeft);
        return Math.pow(10, logVolume);
    }

    function formatVolume(megabytes) {
        if (megabytes < 1024) return megabytes.toFixed(2) + ' МБ';
        if (megabytes < 1024 * 1024) return (megabytes / 1024).toFixed(2) + ' ГБ';
        return (megabytes / (1024 * 1024)).toFixed(2) + ' ТБ';
    }

    function formatEmailsWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return "письмо";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "письма";
        return "писем";
    }

    function formatDaysWord(days) {
        if (days % 10 === 1 && days % 100 !== 11) return "день";
        if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return "дня";
        return "дней";
    }

    function formatTimeDetailed(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00:00";
        let days = Math.floor(seconds / 86400);
        let remaining = seconds % 86400;
        let hours = Math.floor(remaining / 3600);
        let minutes = Math.floor((remaining % 3600) / 60);
        let secs = Math.floor(remaining % 60);
        let hh = hours.toString().padStart(2, '0');
        let mm = minutes.toString().padStart(2, '0');
        let ss = secs.toString().padStart(2, '0');
        if (days > 0) {
            return `${days} ${formatDaysWord(days)} и ${hh}:${mm}:${ss}`;
        }
        return `${hh}:${mm}:${ss}`;
    }

    // DOM элементы
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeDisplay = document.getElementById('volumeDisplay');
    const ratioSlider = document.getElementById('ratioSlider');
    const ratioDisplay = document.getElementById('ratioDisplay');
    const avgSizeInfo = document.getElementById('avgSizeInfo');
    const totalCountInfo = document.getElementById('totalCountInfo');
    const migrationTimeSpan = document.getElementById('migrationTime');
    const migrationSpeedSpan = document.getElementById('migrationSpeed');
    const hoursPerDaySlider = document.getElementById('hoursPerDaySlider');
    const hoursPerDayDisplay = document.getElementById('hoursPerDayDisplay');
    const workDaysValueSpan = document.getElementById('workDaysValue');
    const workDaysLabel = document.getElementById('workDaysLabel');

    // ---- Факторы миграции (чеки) ----
    const factorSATA = document.getElementById('factorSATA');
    const factorAntivirus = document.getElementById('factorAntivirus');
    const factorSZI = document.getElementById('factorSZI');

    // Функция для округления рабочих дней вверх
    function getRoundedWorkDays(totalWorkSeconds, hoursPerDay) {
        if (hoursPerDay <= 0 || totalWorkSeconds <= 0) return 0;
        const secondsPerWorkDay = hoursPerDay * 3600;
        return Math.ceil(totalWorkSeconds / secondsPerWorkDay);
    }

    function calculate() {
        let sliderPos = parseFloat(volumeSlider.value);
        let totalVolumeMB = sliderToVolume(sliderPos);
        let ratio = parseFloat(ratioSlider.value) / 100;
        let activeHoursPerDay = parseInt(hoursPerDaySlider.value, 10);

        // ---- Расчёт коэффициента замедления от факторов ----
        let slowdownFactor = 1.0;
        if (factorSATA && factorSATA.checked) slowdownFactor *= 1.4;
        if (factorAntivirus && factorAntivirus.checked) slowdownFactor *= 1.3;
        // Для СЗИ пока используем фиксированный коэффициент, т.к. нет поля ввода
        if (factorSZI && factorSZI.checked) slowdownFactor *= 1.5;  // +50% по умолчанию

        hoursPerDayDisplay.textContent = activeHoursPerDay + ' ч';
        workDaysLabel.textContent = `Рабочих дней (по ${activeHoursPerDay} ч/день)`;

		// Обновляем заголовок длительности
		const durationLabel = document.getElementById('durationLabel');
		durationLabel.textContent = `Длительность (при работе ${activeHoursPerDay} часов в день)`;

        volumeDisplay.textContent = formatVolume(totalVolumeMB);
        ratioDisplay.textContent = (ratio * 100).toFixed(1) + '%';

        if (totalVolumeMB <= 0) {
            migrationTimeSpan.textContent = '00:00:00';
            migrationSpeedSpan.innerHTML = '0 <span class="unit">писем/сек</span>';
            avgSizeInfo.textContent = '— МБ';
            totalCountInfo.textContent = '— шт';
            workDaysValueSpan.textContent = '0';
            return;
        }

        // Расчёт количества сообщений
        let totalCount = totalVolumeMB / (AVG_SIZE_NO_MB * (1 - ratio) + AVG_SIZE_ATT_MB * ratio);
        let countNo = totalCount * (1 - ratio);
        let countAtt = totalCount * ratio;

        let avgSizeMB = (countNo * AVG_SIZE_NO_MB + countAtt * AVG_SIZE_ATT_MB) / totalCount;
        avgSizeInfo.textContent = avgSizeMB.toFixed(3) + ' МБ (' + (avgSizeMB * MB_TO_BYTES).toFixed(0) + ' байт)';
        totalCountInfo.textContent = Math.round(totalCount).toLocaleString() + ' шт';

        let volumeNo = countNo * AVG_SIZE_NO_MB;
        let volumeAtt = countAtt * AVG_SIZE_ATT_MB;

        let timeNoSec = volumeNo / SPEED_NO_MBPS;
        let timeAttSec = volumeAtt / SPEED_ATT_MBPS;
        let netWorkSeconds = timeNoSec + timeAttSec;  // чистое время при 24 часах в день

		// Календарное время с учётом рабочих часов и факторов замедления
		let workSecondsPerDay = activeHoursPerDay * 3600;
		let totalWorkSeconds = netWorkSeconds * slowdownFactor;  // общее время работы с учётом замедлений

		// Расчёт календарного времени через полные и неполные дни
		let fullDays = Math.floor(totalWorkSeconds / workSecondsPerDay);
		let remainingSeconds = totalWorkSeconds % workSecondsPerDay;

		if (remainingSeconds === 0) {
			// Ровно укладывается в целое количество дней
			calendarSeconds = fullDays * 24 * 3600;
		} else {
			// Нужен ещё один неполный день (в нём будет отработано remainingSeconds часов)
			calendarSeconds = fullDays * 24 * 3600 + remainingSeconds;
		}

        let migrationSpeedVal = (totalCount / netWorkSeconds) / slowdownFactor;
        let roundedSpeed = Math.round(migrationSpeedVal);
        let speedWord = formatEmailsWord(roundedSpeed);

        migrationTimeSpan.textContent = formatTimeDetailed(calendarSeconds);
        migrationSpeedSpan.innerHTML = roundedSpeed.toLocaleString() + ' <span class="unit">' + speedWord + '/сек</span>';

        // ---- Отображение рабочих дней (округление вверх) ----
        const roundedWorkDays = getRoundedWorkDays(totalWorkSeconds, activeHoursPerDay);
        workDaysValueSpan.textContent = roundedWorkDays;

    }

    // Добавляем слушатели событий
    volumeSlider.addEventListener('input', calculate);
    ratioSlider.addEventListener('input', calculate);
    hoursPerDaySlider.addEventListener('input', calculate);

    if (factorSATA) factorSATA.addEventListener('change', calculate);
    if (factorAntivirus) factorAntivirus.addEventListener('change', calculate);
    if (factorSZI) factorSZI.addEventListener('change', calculate);

    // Начальные значения
    volumeSlider.value = 25;
    hoursPerDaySlider.value = 24;
    calculate();
})();
