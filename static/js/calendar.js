/**
 * Custom Calendar Date Picker
 * Usage: initCustomCalendar('input-id', { maxDate: new Date(), initialValue: '2000-01-15' })
 */
function initCustomCalendar(inputId, options) {
    options = options || {};
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

    const originalInput = document.getElementById(inputId);
    if (!originalInput) return;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-calendar-wrapper';
    originalInput.parentNode.insertBefore(wrapper, originalInput);

    // Move original input into wrapper and hide it (it becomes the hidden value holder)
    wrapper.appendChild(originalInput);
    originalInput.type = 'hidden';
    originalInput.removeAttribute('id');

    // Create display input
    const displayInput = document.createElement('input');
    displayInput.type = 'text';
    displayInput.readOnly = true;
    displayInput.id = inputId;
    displayInput.className = 'custom-calendar-input';
    displayInput.placeholder = 'Select date';
    const inlineStyle = originalInput.getAttribute('data-style');
    if (inlineStyle) {
        displayInput.style.cssText = inlineStyle;
    }
    wrapper.insertBefore(displayInput, originalInput);

    // Calendar popup
    const calendar = document.createElement('div');
    calendar.className = 'custom-calendar';
    wrapper.appendChild(calendar);

    let currentMonth, currentYear, selectedDate = null;
    let isOpen = false;

    // Initialize
    if (options.initialValue) {
        const parts = options.initialValue.split('-');
        if (parts.length === 3) {
            selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            currentMonth = selectedDate.getMonth();
            currentYear = selectedDate.getFullYear();
            originalInput.value = options.initialValue;
            displayInput.value = formatDisplay(selectedDate);
        }
    }
    if (selectedDate === null) {
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
    }

    function formatDisplay(d) {
        return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
    }

    function formatValue(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function isDisabled(d) {
        if (options.maxDate && d > options.maxDate) return true;
        if (options.minDate && d < options.minDate) return true;
        return false;
    }

    function isSameDay(a, b) {
        return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function render() {
        const today = new Date();
        today.setHours(0,0,0,0);

        let html = '<div class="custom-calendar-header">';
        html += '<button type="button" class="custom-calendar-nav" data-dir="-1">';
        html += '<svg class="custom-calendar-nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        html += '</button>';
        html += '<span class="custom-calendar-title">' + MONTH_NAMES[currentMonth] + ' ' + currentYear + '</span>';
        html += '<button type="button" class="custom-calendar-nav" data-dir="1">';
        html += '<svg class="custom-calendar-nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        html += '</button>';
        html += '</div>';

        html += '<div class="custom-calendar-weekdays">';
        for (let i = 0; i < 7; i++) {
            html += '<div class="custom-calendar-weekday">' + DAY_NAMES[i] + '</div>';
        }
        html += '</div>';

        html += '<div class="custom-calendar-days">';

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const d = new Date(currentYear, currentMonth - 1, day);
            const disabled = isDisabled(d);
            html += '<div class="custom-calendar-day other-month' + (disabled ? ' disabled' : '') + '" data-date="' + formatValue(d) + '">' + day + '</div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(currentYear, currentMonth, day);
            const disabled = isDisabled(d);
            const sel = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            let cls = 'custom-calendar-day';
            if (sel) cls += ' selected';
            if (isToday && !sel) cls += ' today';
            if (disabled) cls += ' disabled';
            html += '<div class="' + cls + '" data-date="' + formatValue(d) + '">' + day + '</div>';
        }

        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let day = 1; day <= remaining; day++) {
            const d = new Date(currentYear, currentMonth + 1, day);
            const disabled = isDisabled(d);
            html += '<div class="custom-calendar-day other-month' + (disabled ? ' disabled' : '') + '" data-date="' + formatValue(d) + '">' + day + '</div>';
        }

        html += '</div>';
        calendar.innerHTML = html;

        calendar.querySelectorAll('.custom-calendar-nav').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dir = parseInt(this.getAttribute('data-dir'), 10);
                currentMonth += dir;
                if (currentMonth > 11) { currentMonth = 0; currentYear++; }
                if (currentMonth < 0) { currentMonth = 11; currentYear--; }
                render();
            });
        });

        calendar.querySelectorAll('.custom-calendar-day:not(.disabled)').forEach(function(cell) {
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                const val = this.getAttribute('data-date');
                const parts = val.split('-');
                selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                currentMonth = selectedDate.getMonth();
                currentYear = selectedDate.getFullYear();
                originalInput.value = val;
                displayInput.value = formatDisplay(selectedDate);
                close();
            });
        });
    }

    function open() {
        if (isOpen) return;
        isOpen = true;
        render();
        calendar.classList.add('open');
    }

    function close() {
        isOpen = false;
        calendar.classList.remove('open');
    }

    displayInput.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isOpen) close(); else open();
    });

    document.addEventListener('click', function(e) {
        if (isOpen && !wrapper.contains(e.target)) {
            close();
        }
    });
}

/**
 * Date Of Birth Picker (day/month/year) inspired by modern onboarding UIs.
 * Usage: initDobPicker('input-id', { maxDate: new Date(), minYear: 1920, initialValue: '2000-01-15' })
 */
function initDobPicker(inputId, options) {
    options = options || {};

    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const originalInput = document.getElementById(inputId);
    if (!originalInput) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-calendar-wrapper';
    originalInput.parentNode.insertBefore(wrapper, originalInput);
    wrapper.appendChild(originalInput);

    originalInput.type = 'hidden';
    originalInput.removeAttribute('id');

    const displayInput = document.createElement('input');
    displayInput.type = 'text';
    displayInput.readOnly = true;
    displayInput.id = inputId;
    displayInput.className = 'custom-calendar-input dob-display-input';
    displayInput.placeholder = 'Select date of birth';
    wrapper.insertBefore(displayInput, originalInput);

    const picker = document.createElement('div');
    picker.className = 'dob-picker';
    wrapper.appendChild(picker);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = options.maxDate ? new Date(options.maxDate) : today;
    maxDate.setHours(0, 0, 0, 0);

    const inferredMinYear = maxDate.getFullYear() - 110;
    const minYear = options.minYear || inferredMinYear;
    const maxYear = options.maxYear || maxDate.getFullYear();

    function parseDateValue(value) {
        if (!value) return null;
        const parts = value.split('-');
        if (parts.length !== 3) return null;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
        return date;
    }

    function formatValue(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function formatDisplay(date) {
        return String(date.getDate()).padStart(2, '0') + ' ' + MONTHS_SHORT[date.getMonth()] + ' ' + date.getFullYear();
    }

    function daysInMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function clampDate(date) {
        if (date > maxDate) return new Date(maxDate);
        const minDate = new Date(minYear, 0, 1);
        if (date < minDate) return minDate;
        return date;
    }

    let selectedDate = parseDateValue(options.initialValue || originalInput.value);
    if (!selectedDate) {
        selectedDate = new Date(Math.min(maxYear, maxDate.getFullYear() - 25), 0, 1);
    }
    selectedDate = clampDate(selectedDate);

    let draftDate = new Date(selectedDate);
    let isOpen = false;

    function syncValue() {
        originalInput.value = formatValue(selectedDate);
        displayInput.value = formatDisplay(selectedDate);
    }

    function renderYearOptions(selectedYear) {
        let html = '';
        for (let y = maxYear; y >= minYear; y--) {
            html += '<option value="' + y + '"' + (y === selectedYear ? ' selected' : '') + '>' + y + '</option>';
        }
        return html;
    }

    function renderMonthOptions(selectedMonth) {
        let html = '';
        for (let i = 0; i < 12; i++) {
            html += '<option value="' + i + '"' + (i === selectedMonth ? ' selected' : '') + '>' + MONTHS_FULL[i] + '</option>';
        }
        return html;
    }

    function renderDayOptions(year, month, selectedDay) {
        const maxDay = daysInMonth(year, month);
        let html = '';
        for (let d = 1; d <= maxDay; d++) {
            html += '<option value="' + d + '"' + (d === selectedDay ? ' selected' : '') + '>' + d + '</option>';
        }
        return html;
    }

    function normalizeDraftDate() {
        const y = draftDate.getFullYear();
        const m = draftDate.getMonth();
        const d = Math.min(draftDate.getDate(), daysInMonth(y, m));
        draftDate = clampDate(new Date(y, m, d));
    }

    function renderPicker() {
        normalizeDraftDate();

        picker.innerHTML = '' +
            '<div class="dob-picker-header">' +
                '<h4 class="dob-picker-title">Date of Birth</h4>' +
                '<p class="dob-picker-subtitle">Choose day, month and year</p>' +
            '</div>' +
            '<div class="dob-picker-grid">' +
                '<label class="dob-picker-field">' +
                    '<span class="dob-picker-label">Day</span>' +
                    '<select class="dob-picker-select" data-part="day">' + renderDayOptions(draftDate.getFullYear(), draftDate.getMonth(), draftDate.getDate()) + '</select>' +
                '</label>' +
                '<label class="dob-picker-field">' +
                    '<span class="dob-picker-label">Month</span>' +
                    '<select class="dob-picker-select" data-part="month">' + renderMonthOptions(draftDate.getMonth()) + '</select>' +
                '</label>' +
                '<label class="dob-picker-field">' +
                    '<span class="dob-picker-label">Year</span>' +
                    '<select class="dob-picker-select" data-part="year">' + renderYearOptions(draftDate.getFullYear()) + '</select>' +
                '</label>' +
            '</div>' +
            '<div class="dob-picker-actions">' +
                '<button type="button" class="dob-btn dob-btn-secondary" data-action="cancel">Cancel</button>' +
                '<button type="button" class="dob-btn dob-btn-primary" data-action="apply">Apply</button>' +
            '</div>';

        const daySelect = picker.querySelector('select[data-part="day"]');
        const monthSelect = picker.querySelector('select[data-part="month"]');
        const yearSelect = picker.querySelector('select[data-part="year"]');

        function handleSelectChange() {
            const year = parseInt(yearSelect.value, 10);
            const month = parseInt(monthSelect.value, 10);
            const day = parseInt(daySelect.value, 10);

            const maxDay = daysInMonth(year, month);
            if (day > maxDay) {
                daySelect.innerHTML = renderDayOptions(year, month, maxDay);
            } else if (daySelect.options.length !== maxDay) {
                daySelect.innerHTML = renderDayOptions(year, month, day);
            }

            const finalDay = Math.min(parseInt(daySelect.value, 10), daysInMonth(year, month));
            draftDate = clampDate(new Date(year, month, finalDay));

            if (draftDate.getFullYear() !== year || draftDate.getMonth() !== month || draftDate.getDate() !== finalDay) {
                daySelect.innerHTML = renderDayOptions(draftDate.getFullYear(), draftDate.getMonth(), draftDate.getDate());
                monthSelect.value = String(draftDate.getMonth());
                yearSelect.value = String(draftDate.getFullYear());
            }
        }

        daySelect.addEventListener('change', handleSelectChange);
        monthSelect.addEventListener('change', handleSelectChange);
        yearSelect.addEventListener('change', handleSelectChange);

        picker.querySelector('[data-action="cancel"]').addEventListener('click', function (e) {
            e.stopPropagation();
            draftDate = new Date(selectedDate);
            close();
        });

        picker.querySelector('[data-action="apply"]').addEventListener('click', function (e) {
            e.stopPropagation();
            selectedDate = new Date(draftDate);
            syncValue();
            close();
        });
    }

    function open() {
        if (isOpen) return;
        draftDate = new Date(selectedDate);
        renderPicker();
        picker.classList.add('open');
        isOpen = true;
    }

    function close() {
        picker.classList.remove('open');
        isOpen = false;
    }

    displayInput.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isOpen) {
            close();
        } else {
            open();
        }
    });

    picker.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
        if (isOpen && !wrapper.contains(e.target)) {
            close();
        }
    });

    syncValue();
}
