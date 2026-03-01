function trackEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
}

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
        return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
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
                    section: 'contact'
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

    loadSlots();
})();

(function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = document.getElementById('contact-form-status');
    const submitButton = document.getElementById('contact-submit');
    const fieldNames = ['name', 'email', 'company', 'phone', 'message'];
    const endpoint = (
        form.dataset.apiEndpoint ||
        (window.WATERAPPS_CONFIG && window.WATERAPPS_CONFIG.contactApiEndpoint) ||
        window.WATERAPPS_CONTACT_API_ENDPOINT ||
        ''
    ).trim();

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
            const errorEl = document.getElementById(`contact-error-${name}`);
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
            const errorEl = document.getElementById(`contact-error-${name}`);
            if (input && typeof input.setAttribute === 'function') {
                input.setAttribute('aria-invalid', 'true');
            }
            if (errorEl) {
                errorEl.textContent = String(message || 'Please check this field.');
                errorEl.classList.remove('hidden');
            }
        });
    }

    function setSubmitting(isSubmitting) {
        if (!submitButton) return;
        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? 'Sending...' : 'Send Message';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearStatus();
        clearFieldErrors();

        if (!endpoint) {
            setStatus('warn', 'Contact form API is not configured yet. Please email varun@waterapps.com.au or use the booking link above.');
            trackEvent('contact_form_submit', {
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
            phone: (formData.get('phone') || '').toString(),
            message: (formData.get('message') || '').toString()
        };

        setSubmitting(true);

        try {
            const response = await fetch(endpoint, {
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
                setStatus('success', data?.message || "Thank you for contacting WaterApps. We'll be in touch shortly.");
                form.reset();
                trackEvent('contact_form_submit', {
                    result: 'success',
                    section: 'contact'
                });
                return;
            }

            if (response.status === 400 && data?.fieldErrors) {
                applyFieldErrors(data.fieldErrors);
                setStatus('error', data?.message || 'Please correct the highlighted fields and try again.');
            } else if (response.status === 403) {
                setStatus('error', 'This form cannot be submitted from the current site origin. Please email varun@waterapps.com.au directly.');
            } else if (response.status === 429) {
                setStatus('error', 'Too many requests. Please wait a moment and try again.');
            } else {
                setStatus('error', data?.message || 'Something went wrong. Please email varun@waterapps.com.au directly.');
            }

            trackEvent('contact_form_submit', {
                result: 'error',
                status_code: response.status,
                error_code: data?.code || 'unknown',
                section: 'contact'
            });
        } catch (err) {
            setStatus('error', 'Unable to submit the form right now. Please check your connection or email varun@waterapps.com.au directly.');
            trackEvent('contact_form_submit', {
                result: 'error',
                status_code: 0,
                error_code: 'network_error',
                section: 'contact'
            });
            console.error('Contact form submit failed', err);
        } finally {
            setSubmitting(false);
        }
    });
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
