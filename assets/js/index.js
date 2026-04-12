function trackEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
}

(function setupMobileMenu() {
    const toggleButton = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!toggleButton || !mobileMenu) return;

    const menuLinks = mobileMenu.querySelectorAll('a');

    function closeMenu() {
        mobileMenu.classList.add('hidden');
        toggleButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggleButton.innerHTML = '<i class="fas fa-bars text-lg"></i>';
    }

    function openMenu() {
        mobileMenu.classList.remove('hidden');
        toggleButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        toggleButton.innerHTML = '<i class="fas fa-xmark text-lg"></i>';
    }

    toggleButton.addEventListener('click', () => {
        const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    menuLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
})();

function localDateKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function filterSlotsByLocalDate(slots, dateValue) {
    if (!Array.isArray(slots)) return [];
    if (!dateValue) return slots;
    return slots.filter((slot) => {
        const slotDate = new Date((slot && slot.slotStart) || '');
        if (Number.isNaN(slotDate.getTime())) return false;
        return localDateKeyFromDate(slotDate) === dateValue;
    });
}

function createAvailabilityRequestUrl(baseEndpoint, selectedDate) {
    const url = new URL(baseEndpoint);
    url.searchParams.set('days', selectedDate ? '14' : '7');
    if (selectedDate) {
        url.searchParams.set('date', selectedDate);
    }
    return url.toString();
}

if (typeof window !== 'undefined') {
    window.WaterAppsBookingHelpers = {
        localDateKeyFromDate,
        filterSlotsByLocalDate,
        createAvailabilityRequestUrl
    };
}

(function setupBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const statusEl = document.getElementById('booking-form-status');
    const submitButton = document.getElementById('booking-submit');
    const refreshButton = document.getElementById('booking-refresh');
    const slotSelect = document.getElementById('booking-slot');
    const dateInput = document.getElementById('booking-date');
    const timezoneInput = document.getElementById('booking-timezone');
    const timezoneSummary = document.getElementById('booking-timezone-summary');
    const fieldNames = ['name', 'email', 'company', 'timezone', 'date', 'slotStart', 'notes'];
    let latestSlots = [];

    const configuredContactEndpoint = (
        (window.WATERAPPS_CONFIG && window.WATERAPPS_CONFIG.contactApiEndpoint) ||
        window.WATERAPPS_CONTACT_API_ENDPOINT ||
        ''
    ).trim();

    function deriveEndpointFromContact(pathSuffix) {
        if (!configuredContactEndpoint) return '';
        return configuredContactEndpoint.replace(/\/contact$/, pathSuffix);
    }

    const availabilityEndpoint = (
        form.dataset.availabilityEndpoint ||
        deriveEndpointFromContact('/availability')
    ).trim();

    const bookingEndpoint = (
        form.dataset.bookingEndpoint ||
        deriveEndpointFromContact('/booking')
    ).trim();

    if (timezoneInput && !timezoneInput.value) {
        timezoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    }

    function resolveDisplayTimeZone() {
        const candidate = (timezoneInput?.value || '').trim();
        if (!candidate) {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        }
        try {
            new Intl.DateTimeFormat(undefined, { timeZone: candidate }).format(new Date());
            return candidate;
        } catch {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        }
    }

    function updateTimezoneSummary() {
        if (!timezoneSummary) return;
        timezoneSummary.textContent = `Slots are shown in your selected timezone: ${resolveDisplayTimeZone()}.`;
    }

    function setStatus(kind, message) {
        if (!statusEl) return;
        statusEl.className = 'rounded-lg px-4 py-3 text-sm';
        if (kind === 'success') {
            statusEl.classList.add('bg-green-50', 'text-green-800', 'border', 'border-green-200');
        } else if (kind === 'warn') {
            statusEl.classList.add('bg-amber-50', 'text-amber-900', 'border', 'border-amber-200');
        } else {
            statusEl.classList.add('bg-red-50', 'text-red-800', 'border', 'border-red-200');
        }
        statusEl.textContent = message;
        statusEl.classList.remove('hidden');
    }

    function clearStatus() {
        if (!statusEl) return;
        statusEl.textContent = '';
        statusEl.classList.add('hidden');
    }

    function clearFieldErrors() {
        fieldNames.forEach((name) => {
            const input = form.elements.namedItem(name);
            const errorEl = document.getElementById(`booking-error-${name}`);
            if (input && typeof input.removeAttribute === 'function') {
                input.removeAttribute('aria-invalid');
            }
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('hidden');
            }
        });
    }

    function applyFieldErrors(fieldErrors) {
        if (!fieldErrors || typeof fieldErrors !== 'object') return;
        Object.entries(fieldErrors).forEach(([name, message]) => {
            const input = form.elements.namedItem(name);
            const errorEl = document.getElementById(`booking-error-${name}`);
            if (input && typeof input.setAttribute === 'function') {
                input.setAttribute('aria-invalid', 'true');
            }
            if (errorEl) {
                errorEl.textContent = String(message || 'Please check this field.');
                errorEl.classList.remove('hidden');
            }
        });
    }

    function setLoadingSlots(isLoading) {
        if (!refreshButton) return;
        refreshButton.disabled = isLoading;
        refreshButton.textContent = isLoading ? 'Loading...' : 'Refresh Slots';
    }

    function setSubmitting(isSubmitting) {
        if (!submitButton) return;
        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? 'Submitting...' : 'Request Booking';
    }

    function slotLabel(slotStart) {
        const date = new Date(slotStart);
        if (Number.isNaN(date.getTime())) return slotStart;
        const timeZone = resolveDisplayTimeZone();
        return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone,
            timeZoneName: 'short'
        });
    }

    function renderSlotOptions(slots) {
        if (!slotSelect) return;
        slotSelect.innerHTML = '';

        if (!Array.isArray(slots) || slots.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No slots available for selected date';
            slotSelect.append(option);
            return;
        }

        const promptOption = document.createElement('option');
        promptOption.value = '';
        promptOption.textContent = 'Select a slot';
        slotSelect.append(promptOption);

        slots.forEach((slot) => {
            const option = document.createElement('option');
            option.value = slot.slotStart;
            option.textContent = slotLabel(slot.slotStart);
            slotSelect.append(option);
        });
    }

    function filterSlotsByDate(dateValue) {
        return filterSlotsByLocalDate(latestSlots, dateValue);
    }

    function refreshRenderedSlots() {
        renderSlotOptions(filterSlotsByDate(dateInput?.value || ''));
        updateTimezoneSummary();
    }

    async function loadSlots(options = {}) {
        const silent = Boolean(options.silent);
        if (!silent) {
            clearStatus();
        }
        if (!availabilityEndpoint) {
            if (!silent) {
                setStatus('warn', 'Booking availability API is not configured. Please email varun@waterapps.com.au.');
            }
            renderSlotOptions([]);
            return;
        }

        setLoadingSlots(true);
        try {
            const selectedDate = dateInput?.value || '';
            const response = await fetch(createAvailabilityRequestUrl(availabilityEndpoint, selectedDate));
            const data = await response.json();
            if (!response.ok) {
                if (!silent) {
                    setStatus('error', data?.message || 'Unable to load availability right now.');
                }
                renderSlotOptions([]);
                trackEvent('booking_slots_load', {
                    result: 'error',
                    status_code: response.status,
                    error_code: data?.code || 'unknown',
                    section: 'contact'
                });
                return;
            }

            latestSlots = Array.isArray(data?.slots) ? data.slots : [];
            const filtered = filterSlotsByDate(selectedDate);
            renderSlotOptions(filtered);
            updateTimezoneSummary();
            if (!silent && filtered.length > 0) {
                setStatus('success', `Loaded ${filtered.length} available slot${filtered.length === 1 ? '' : 's'}.`);
            } else if (!silent) {
                setStatus('warn', 'No slots available for the selected date. Please try another date.');
            }
            trackEvent('booking_slots_load', {
                result: 'success',
                slot_count: filtered.length,
                section: 'contact'
            });
        } catch (err) {
            if (!silent) {
                setStatus('error', 'Unable to load booking slots right now. Please try again.');
            }
            renderSlotOptions([]);
            console.error('Booking slots load failed', err);
            trackEvent('booking_slots_load', {
                result: 'error',
                status_code: 0,
                error_code: 'network_error',
                section: 'contact'
            });
        } finally {
            setLoadingSlots(false);
        }
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            loadSlots();
        });
    }

    if (dateInput) {
        dateInput.addEventListener('change', async () => {
            await loadSlots();
        });
    }

    if (timezoneInput) {
        timezoneInput.addEventListener('change', refreshRenderedSlots);
        timezoneInput.addEventListener('blur', refreshRenderedSlots);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearStatus();
        clearFieldErrors();

        if (!bookingEndpoint) {
            setStatus('warn', 'Booking API is not configured. Please email varun@waterapps.com.au.');
            trackEvent('booking_request_submit', {
                result: 'blocked',
                reason: 'endpoint_not_configured',
                section: 'contact'
            });
            return;
        }

        const formData = new FormData(form);
        const payload = {
            name: (formData.get('name') || '').toString(),
            email: (formData.get('email') || '').toString(),
            company: (formData.get('company') || '').toString(),
            timezone: (formData.get('timezone') || '').toString(),
            slotStart: (formData.get('slotStart') || '').toString(),
            notes: (formData.get('notes') || '').toString()
        };

        if (!payload.slotStart) {
            applyFieldErrors({ slotStart: 'Please select an available slot.' });
            setStatus('error', 'Please select an available slot.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(bookingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            let data = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok) {
                form.reset();
                if (timezoneInput) {
                    timezoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                }
                await loadSlots({ silent: true });
                setStatus('success', data?.message || 'Booking request submitted successfully.');
                trackEvent('booking_request_submit', {
                    result: 'success',
                    section: 'contact',
                    ...(form.dataset.pilotSource ? { cta_source: form.dataset.pilotSource } : {})
                });
                return;
            }

            if (response.status === 400 && data?.fieldErrors) {
                applyFieldErrors(data.fieldErrors);
                setStatus('error', data?.message || 'Please correct the highlighted fields and try again.');
            } else if (response.status === 403) {
                setStatus('error', 'This booking form cannot be submitted from the current origin.');
            } else {
                setStatus('error', data?.message || 'Unable to submit booking request right now.');
            }

            trackEvent('booking_request_submit', {
                result: 'error',
                status_code: response.status,
                error_code: data?.code || 'unknown',
                section: 'contact'
            });
        } catch (err) {
            setStatus('error', 'Network error while submitting booking request. Please try again.');
            console.error('Booking submit failed', err);
            trackEvent('booking_request_submit', {
                result: 'error',
                status_code: 0,
                error_code: 'network_error',
                section: 'contact'
            });
        } finally {
            setSubmitting(false);
        }
    });

    updateTimezoneSummary();
    loadSlots();
})();

(function setupGuidedIntake() {
    const container = document.getElementById('guided-intake');
    if (!container) return;

    const endpoint = (
        container.dataset.apiEndpoint ||
        (window.WATERAPPS_CONFIG && window.WATERAPPS_CONFIG.contactApiEndpoint) ||
        ''
    ).trim();

    const SERVICES = [
        'DevSecOps & Cloud Transformation',
        'Platform Engineering',
        'Quality Engineering & Release',
        'Security & Compliance',
        'AIOps & Observability',
        'Workforce / Operating Model',
        'Something Else',
    ];

    const INDUSTRIES = [
        'Banking & Financial Services',
        'Government & Public Sector',
        'Telco & Utilities',
        'Insurance',
        'Healthcare',
        'Technology / SaaS',
        'Other',
    ];

    const state = { service: null, industry: null };

    const step1El = document.getElementById('guided-step-1');
    const step2El = document.getElementById('guided-step-2');
    const step3El = document.getElementById('guided-step-3');
    const serviceChipsEl = document.getElementById('guided-service-chips');
    const industryChipsEl = document.getElementById('guided-industry-chips');
    const summaryEl = document.getElementById('guided-summary');
    const statusEl = document.getElementById('guided-status');
    const submitBtn = document.getElementById('guided-submit');
    const back2Btn = document.getElementById('guided-back-2');
    const back3Btn = document.getElementById('guided-back-3');

    const dots = {
        1: document.querySelector('[data-step-dot="1"]'),
        2: document.querySelector('[data-step-dot="2"]'),
        3: document.querySelector('[data-step-dot="3"]'),
    };

    function safeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function renderChips(container, items, selected, onSelect) {
        container.innerHTML = items.map((item) => {
            const active = item === selected;
            return `<button type="button"
                data-chip="${safeHtml(item)}"
                class="px-4 py-2 rounded-full border text-sm font-medium transition
                    ${active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
                    }">
                ${safeHtml(item)}
            </button>`;
        }).join('');

        container.querySelectorAll('[data-chip]').forEach((btn) => {
            btn.addEventListener('click', () => onSelect(btn.dataset.chip));
        });
    }

    function updateDots(activeStep) {
        [1, 2, 3].forEach((n) => {
            const dot = dots[n];
            if (!dot) return;
            const done = n < activeStep;
            const active = n === activeStep;
            dot.className = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ' + (
                done    ? 'bg-blue-200 text-blue-800' :
                active  ? 'bg-blue-600 text-white' :
                          'bg-gray-200 text-gray-500'
            );
            dot.textContent = done ? '✓' : String(n);
        });
    }

    function showStep(n) {
        [step1El, step2El, step3El].forEach((el, i) => {
            if (el) el.classList.toggle('hidden', i + 1 !== n);
        });
        updateDots(n);
    }

    function updateSummary() {
        if (!summaryEl) return;
        if (state.service || state.industry) {
            const parts = [];
            if (state.service) parts.push('Service: <strong>' + safeHtml(state.service) + '</strong>');
            if (state.industry) parts.push('Industry: <strong>' + safeHtml(state.industry) + '</strong>');
            summaryEl.innerHTML = parts.join(' &nbsp;·&nbsp; ');
            summaryEl.classList.remove('hidden');
        } else {
            summaryEl.classList.add('hidden');
        }
    }

    function buildMessage() {
        const challenge = (document.getElementById('guided-challenge')?.value || '').trim();
        return [
            state.service  ? 'Enquiry type: ' + state.service : null,
            state.industry ? 'Industry: ' + state.industry    : null,
            '',
            'Challenge / goal:',
            challenge,
        ].filter((l) => l !== null).join('\n');
    }

    function setStatus(kind, msg) {
        if (!statusEl) return;
        statusEl.className = 'rounded-lg px-4 py-3 text-sm mb-4';
        statusEl.classList.add(
            kind === 'success' ? 'bg-green-50'  : kind === 'warn' ? 'bg-amber-50'  : 'bg-red-50',
            kind === 'success' ? 'text-green-800' : kind === 'warn' ? 'text-amber-900' : 'text-red-800',
            kind === 'success' ? 'border-green-200' : kind === 'warn' ? 'border-amber-200' : 'border-red-200',
            'border'
        );
        statusEl.textContent = msg;
        statusEl.classList.remove('hidden');
    }

    function clearStatus() {
        if (!statusEl) return;
        statusEl.textContent = '';
        statusEl.classList.add('hidden');
    }

    function showFieldError(fieldId, msg) {
        const el = document.getElementById('guided-error-' + fieldId);
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
    }

    function clearFieldErrors() {
        ['name', 'email', 'challenge'].forEach((f) => {
            const el = document.getElementById('guided-error-' + f);
            if (el) { el.textContent = ''; el.classList.add('hidden'); }
        });
    }

    function setSubmitting(busy) {
        if (!submitBtn) return;
        submitBtn.disabled = busy;
        submitBtn.textContent = busy ? 'Sending…' : 'Send Enquiry';
    }

    // ── Chip render ──────────────────────────────────────────

    function onIndustrySelect(value) {
        state.industry = value;
        renderChips(industryChipsEl, INDUSTRIES, state.industry, onIndustrySelect);
        setTimeout(() => { updateSummary(); showStep(3); }, 120);
    }

    function onServiceSelect(value) {
        state.service = value;
        renderChips(serviceChipsEl, SERVICES, state.service, onServiceSelect);
        renderChips(industryChipsEl, INDUSTRIES, state.industry, onIndustrySelect);
        setTimeout(() => showStep(2), 120);
    }

    renderChips(serviceChipsEl, SERVICES, state.service, onServiceSelect);
    renderChips(industryChipsEl, INDUSTRIES, state.industry, onIndustrySelect);

    // ── Navigation ───────────────────────────────────────────

    back2Btn && back2Btn.addEventListener('click', () => showStep(1));
    back3Btn && back3Btn.addEventListener('click', () => showStep(2));

    // ── Submit ───────────────────────────────────────────────

    submitBtn && submitBtn.addEventListener('click', async () => {
        clearStatus();
        clearFieldErrors();

        const name      = (document.getElementById('guided-name')?.value      || '').trim();
        const email     = (document.getElementById('guided-email')?.value     || '').trim();
        const company   = (document.getElementById('guided-company')?.value   || '').trim();
        const phone     = (document.getElementById('guided-phone')?.value     || '').trim();
        const challenge = (document.getElementById('guided-challenge')?.value || '').trim();

        let hasError = false;
        if (!name)      { showFieldError('name', 'Name is required.');          hasError = true; }
        if (!email)     { showFieldError('email', 'Work email is required.');    hasError = true; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          showFieldError('email', 'Enter a valid email address.'); hasError = true; }
        if (!challenge) { showFieldError('challenge', 'Please describe your challenge or goal.'); hasError = true; }
        if (hasError) return;

        if (!endpoint) {
            setStatus('warn', 'Form endpoint not configured. Please email varun@waterapps.com.au directly.');
            trackEvent('contact_form_submit', { result: 'blocked', reason: 'endpoint_not_configured', section: 'guided_intake' });
            return;
        }

        const message = buildMessage();
        const payload = { name, email, company, phone, message };

        setSubmitting(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let data = null;
            try { data = await response.json(); } catch { data = null; }

            if (response.ok) {
                step3El.innerHTML = `
                    <div class="text-center py-8">
                        <svg class="w-14 h-14 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Enquiry received</h3>
                        <p class="text-gray-600 text-sm max-w-xs mx-auto">
                            ${safeHtml(data?.message || "Thanks for reaching out. We'll be in touch shortly.")}
                        </p>
                    </div>`;
                updateDots(4);
                trackEvent('contact_form_submit', { result: 'success', section: 'guided_intake', service: state.service, industry: state.industry });
                return;
            }

            if (response.status === 400 && data?.fieldErrors) {
                Object.entries(data.fieldErrors).forEach(([k, v]) => showFieldError(k, v));
                setStatus('error', data?.message || 'Please correct the highlighted fields.');
            } else if (response.status === 403) {
                setStatus('error', 'This form cannot be submitted from the current origin. Please email varun@waterapps.com.au.');
            } else if (response.status === 429) {
                setStatus('error', 'Too many requests. Please wait a moment and try again.');
            } else {
                setStatus('error', data?.message || 'Something went wrong. Please email varun@waterapps.com.au.');
            }
            trackEvent('contact_form_submit', { result: 'error', status_code: response.status, section: 'guided_intake' });
        } catch (err) {
            setStatus('error', 'Unable to submit right now. Check your connection or email varun@waterapps.com.au.');
            trackEvent('contact_form_submit', { result: 'error', status_code: 0, error_code: 'network_error', section: 'guided_intake' });
            console.error('Guided intake submit failed', err);
        } finally {
            setSubmitting(false);
        }
    });

    showStep(1);
})();

(function setupRecommendationCarousel() {
    const carousel = document.getElementById('recommendation-carousel');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('[data-recommendation-slide]'));
    const dotsContainer = document.getElementById('recommendation-dots');
    const prevButton = document.getElementById('recommendation-prev');
    const nextButton = document.getElementById('recommendation-next');

    if (slides.length === 0) return;
    if (!dotsContainer) return;

    dotsContainer.innerHTML = slides
        .map((_, index) => (
            `<button type="button" class="h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-blue-200'}" data-recommendation-dot data-slide-index="${index}" aria-label="Show slide ${index + 1}"></button>`
        ))
        .join('');

    const dots = Array.from(dotsContainer.querySelectorAll('[data-recommendation-dot]'));

    let currentIndex = 0;
    let autoRotateTimer = null;
    const autoRotateMs = 9000;
    const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
        slides.forEach((slide, index) => {
            const isActive = index === currentIndex;
            slide.classList.toggle('hidden', !isActive);
            slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle('bg-blue-600', isActive);
            dot.classList.toggle('bg-blue-200', !isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function trackNavigate(source) {
        trackEvent('recommendation_carousel_navigate', {
            carousel: 'client_recommendations',
            slide_index: currentIndex + 1,
            slide_count: slides.length,
            source
        });
    }

    function goTo(index, source) {
        const nextIndex = ((index % slides.length) + slides.length) % slides.length;
        if (nextIndex === currentIndex) return;
        currentIndex = nextIndex;
        render();
        if (source) {
            trackNavigate(source);
        }
    }

    function goBy(delta, source) {
        goTo(currentIndex + delta, source);
    }

    function stopAutoRotate() {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    }

    function startAutoRotate() {
        if (reduceMotion || slides.length < 2) return;
        stopAutoRotate();
        autoRotateTimer = setInterval(() => {
            goBy(1, 'autoplay');
        }, autoRotateMs);
    }

    prevButton?.addEventListener('click', () => {
        goBy(-1, 'previous_button');
    });

    nextButton?.addEventListener('click', () => {
        goBy(1, 'next_button');
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const targetIndex = Number(dot.getAttribute('data-slide-index'));
            if (Number.isInteger(targetIndex)) {
                goTo(targetIndex, 'dot');
            }
        });
    });

    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', startAutoRotate);
    carousel.addEventListener('focusin', stopAutoRotate);
    carousel.addEventListener('focusout', () => {
        if (!carousel.contains(document.activeElement)) {
            startAutoRotate();
        }
    });

    carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goBy(-1, 'keyboard');
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goBy(1, 'keyboard');
        }
    });

    render();
    startAutoRotate();
})();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') {
            return;
        }

        const target = document.querySelector(href);
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Track CTA/contact clicks (GA4)
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
        const href = this.getAttribute('href') || '';
        const text = (this.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        const section = this.closest('section')?.id || (this.closest('footer') ? 'footer' : 'global');

        if (text.includes('Book Discovery Call')) {
            trackEvent('cta_click', {
                cta_type: 'book_discovery_call',
                cta_section: section,
                link_text: text
            });
        }

        if (text.includes('Book SchedulEase Pilot Call') || text.includes('Book SchedulEase Demo')) {
            const utmCampaign = this.dataset.utmCampaign || 'schedulease_pilot';
            const bookingForm = document.getElementById('booking-form');
            if (bookingForm) {
                bookingForm.dataset.pilotSource = utmCampaign;
            }
            trackEvent('cta_click', {
                cta_type: 'book_schedulease_pilot',
                cta_section: section,
                cta_source: utmCampaign,
                link_text: text
            });
        }

        if (href.startsWith('mailto:')) {
            trackEvent('contact_click', {
                contact_type: 'email',
                contact_section: section,
                link_text: text
            });
        }

        if (href.startsWith('tel:')) {
            trackEvent('contact_click', {
                contact_type: 'phone',
                contact_section: section,
                link_text: text
            });
        }

        if (href.includes('linkedin.com')) {
            trackEvent('contact_click', {
                contact_type: 'linkedin',
                contact_section: section,
                link_text: text
            });
        }

        if (href.includes('enterprise-readiness.html')) {
            trackEvent('cta_click', {
                cta_type: 'enterprise_readiness',
                cta_section: section,
                link_text: text
            });
        }

        const isCapabilityStatementPdfLink =
            href.includes('capability-statement-download.html') || href.endsWith('.pdf');

        if (isCapabilityStatementPdfLink) {
            trackEvent('capability_statement_pdf_download', {
                cta_type: 'capability_statement_pdf_download',
                cta_section: section,
                link_text: text
            });
        } else if (href.includes('capability-statement.html') || text.includes('Capability Statement')) {
            trackEvent('cta_click', {
                cta_type: 'capability_statement_view',
                cta_section: section,
                link_text: text
            });
        }

        if (text.includes('Request Documentation')) {
            trackEvent('cta_click', {
                cta_type: 'request_documentation',
                cta_section: section,
                link_text: text
            });
        }

        if (href.includes('insights.html')) {
            trackEvent('cta_click', {
                cta_type: 'insights',
                cta_section: section,
                link_text: text
            });
        }

        if (href.includes('schedulease.html') || text.includes('SchedulEase')) {
            trackEvent('cta_click', {
                cta_type: 'schedulease_offer',
                cta_section: section,
                link_text: text
            });
        }

        if (href.includes('calendar.app.google')) {
            trackEvent('cta_click', {
                cta_type: 'google_calendar_booking',
                cta_section: section,
                link_text: text
            });
        }

        if (text.includes('Discuss Your Requirements')) {
            trackEvent('cta_click', {
                cta_type: 'discuss_requirements',
                cta_section: section,
                link_text: text
            });
        }
    });
});

// Track case study technical detail expansions
document.querySelectorAll('#case-studies details').forEach((detailsEl, index) => {
    detailsEl.addEventListener('toggle', function () {
        if (!this.open) return;
        const title = this.closest('.case-study-card')?.querySelector('h3')?.textContent?.trim() || `case_study_${index + 1}`;
        trackEvent('case_study_expand', {
            case_study: title,
            section: 'case-studies',
            detail_type: 'technical_depth'
        });
    });
});
