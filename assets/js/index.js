function trackEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
}

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

(function setupReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    const statusEl = document.getElementById('review-form-status');
    const submitButton = document.getElementById('review-submit');
    const fieldNames = ['name', 'email', 'role', 'company', 'linkedin', 'review', 'rating', 'consent'];
    const endpoint = (
        form.dataset.apiEndpoint ||
        (window.WATERAPPS_CONFIG && window.WATERAPPS_CONFIG.reviewApiEndpoint) ||
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
            const errorEl = document.getElementById(`review-error-${name}`);
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
            const errorEl = document.getElementById(`review-error-${name}`);
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
        submitButton.textContent = isSubmitting ? 'Submitting...' : 'Submit Review';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidLinkedInUrl(rawValue) {
        try {
            const parsed = new URL(rawValue);
            if (parsed.protocol !== 'https:') return false;
            const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
            if (host !== 'linkedin.com' && !host.endsWith('.linkedin.com')) return false;
            if (!parsed.pathname || parsed.pathname === '/') return false;
            return true;
        } catch {
            return false;
        }
    }

    function cleanLine(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearStatus();
        clearFieldErrors();

        if (!endpoint) {
            setStatus('warn', 'Review form API is not configured yet. Please email varun@waterapps.com.au with your review.');
            trackEvent('review_form_submit', {
                result: 'blocked',
                reason: 'endpoint_not_configured',
                section: 'reviews'
            });
            return;
        }

        const formData = new FormData(form);
        const reviewFields = {
            name: cleanLine(formData.get('name')),
            email: cleanLine(formData.get('email')),
            role: cleanLine(formData.get('role')),
            company: cleanLine(formData.get('company')),
            linkedin: cleanLine(formData.get('linkedin')),
            review: cleanLine(formData.get('review')),
            rating: cleanLine(formData.get('rating')),
            consent: formData.get('consent') === 'yes'
        };

        const fieldErrors = {};
        if (!reviewFields.name) {
            fieldErrors.name = 'Please enter your name.';
        }
        if (!reviewFields.email || !isValidEmail(reviewFields.email)) {
            fieldErrors.email = 'Please enter a valid work email.';
        }
        if (!reviewFields.linkedin || !isValidLinkedInUrl(reviewFields.linkedin)) {
            fieldErrors.linkedin = 'Please enter a valid HTTPS LinkedIn URL.';
        }
        if (!reviewFields.review || reviewFields.review.length < 30) {
            fieldErrors.review = 'Please provide at least 30 characters.';
        }
        if (!reviewFields.consent) {
            fieldErrors.consent = 'Please confirm consent before submitting.';
        }

        if (Object.keys(fieldErrors).length > 0) {
            applyFieldErrors(fieldErrors);
            setStatus('error', 'Please correct the highlighted fields and try again.');
            trackEvent('review_form_submit', {
                result: 'error',
                error_code: 'validation_error',
                section: 'reviews'
            });
            return;
        }

        const payload = {
            name: reviewFields.name,
            email: reviewFields.email,
            role: reviewFields.role,
            company: reviewFields.company,
            linkedin: reviewFields.linkedin,
            review: reviewFields.review,
            rating: reviewFields.rating,
            consent: true
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
                setStatus('success', data?.message || 'Thank you. Your review has been submitted for verification.');
                form.reset();
                trackEvent('review_form_submit', {
                    result: 'success',
                    section: 'reviews',
                    rating: reviewFields.rating || 'unspecified'
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

            trackEvent('review_form_submit', {
                result: 'error',
                status_code: response.status,
                error_code: data?.code || 'unknown',
                section: 'reviews'
            });
        } catch (err) {
            setStatus('error', 'Unable to submit the form right now. Please check your connection or email varun@waterapps.com.au directly.');
            trackEvent('review_form_submit', {
                result: 'error',
                status_code: 0,
                error_code: 'network_error',
                section: 'reviews'
            });
            console.error('Review form submit failed', err);
        } finally {
            setSubmitting(false);
        }
    });
})();

(function setupMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const menu = document.getElementById('mobile-nav-menu');
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        menu.classList.toggle('hidden', !isOpen);
    }

    toggle.addEventListener('click', () => {
        const currentlyOpen = toggle.getAttribute('aria-expanded') === 'true';
        setOpen(!currentlyOpen);
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (toggle.getAttribute('aria-expanded') !== 'true') return;
        setOpen(false);
        toggle.focus();
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
