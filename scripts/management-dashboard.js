(function setupReviewsModeration() {
    const section = document.getElementById('reviews-moderation');
    if (!section) return;

    const listEl = document.getElementById('reviewsModerationList');
    const statusEl = document.getElementById('reviewsModerationStatus');
    const refreshBtn = document.getElementById('reviewsModerationRefresh');

    const configuredBase = (
        section.dataset.reviewApiBase ||
        (window.WATERAPPS_DASHBOARD_CONFIG && window.WATERAPPS_DASHBOARD_CONFIG.reviewApiBase) ||
        ''
    ).trim();
    const apiBase = configuredBase.replace(/\/+$/, '');

    function setStatus(kind, message) {
        if (!statusEl) return;
        statusEl.className = 'rounded-lg border px-3 py-2 text-sm';
        if (kind === 'success') {
            statusEl.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
        } else if (kind === 'warn') {
            statusEl.classList.add('bg-amber-50', 'text-amber-900', 'border-amber-200');
        } else if (kind === 'loading') {
            statusEl.classList.add('bg-slate-50', 'text-slate-700', 'border-slate-200');
        } else {
            statusEl.classList.add('bg-rose-50', 'text-rose-800', 'border-rose-200');
        }
        statusEl.textContent = message;
        statusEl.classList.remove('hidden');
    }

    function clearStatus() {
        if (!statusEl) return;
        statusEl.textContent = '';
        statusEl.classList.add('hidden');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getAuthToken() {
        if (!window.WaterAppsPortalAuth || typeof window.WaterAppsPortalAuth.getTokens !== 'function') {
            return null;
        }
        const tokens = window.WaterAppsPortalAuth.getTokens();
        if (!tokens) return null;
        return tokens.id_token || tokens.access_token || null;
    }

    function isPreviewPasswordSession() {
        if (!window.WaterAppsPortalAuth || typeof window.WaterAppsPortalAuth.getCurrentUser !== 'function') {
            return false;
        }
        const user = window.WaterAppsPortalAuth.getCurrentUser();
        return Boolean(user && user.payload && user.payload.auth_mode === 'preview_password');
    }

    function renderReviews(reviews) {
        if (!listEl) return;
        if (!Array.isArray(reviews) || reviews.length === 0) {
            listEl.innerHTML = '<div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No pending reviews.</div>';
            return;
        }

        const cards = reviews.map((review) => {
            const reviewId = escapeHtml(review.review_id);
            const createdAt = escapeHtml(review.created_at || '');
            const name = escapeHtml(review.name || '');
            const email = escapeHtml(review.email || '');
            const role = escapeHtml(review.role || 'Not provided');
            const company = escapeHtml(review.company || 'Not provided');
            const linkedin = escapeHtml(review.linkedin || '');
            const rating = escapeHtml(review.rating || 'Not provided');
            const text = escapeHtml(review.review || '');

            return [
                '<article class="rounded-xl border border-slate-200 bg-white p-4" data-review-id="', reviewId, '">',
                '<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">',
                '<div>',
                '<h3 class="text-base font-semibold text-slate-900">', name, '</h3>',
                '<p class="text-xs text-slate-500">Review ID: ', reviewId, ' | Submitted: ', createdAt, '</p>',
                '</div>',
                '<span class="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Pending</span>',
                '</div>',
                '<dl class="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">',
                '<div><dt class="text-xs uppercase tracking-wide text-slate-500">Email</dt><dd>', email, '</dd></div>',
                '<div><dt class="text-xs uppercase tracking-wide text-slate-500">Role</dt><dd>', role, '</dd></div>',
                '<div><dt class="text-xs uppercase tracking-wide text-slate-500">Company</dt><dd>', company, '</dd></div>',
                '<div><dt class="text-xs uppercase tracking-wide text-slate-500">Rating</dt><dd>', rating, '</dd></div>',
                '</dl>',
                '<p class="mt-3 text-sm text-slate-700 whitespace-pre-wrap">', text, '</p>',
                '<p class="mt-3 text-xs"><a class="text-blue-700 underline" target="_blank" rel="noopener noreferrer" href="', linkedin, '">LinkedIn profile</a></p>',
                '<div class="mt-4 flex flex-wrap items-center gap-2">',
                '<button type="button" class="review-moderate-btn rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700" data-review-id="', reviewId, '" data-decision="approved">Approve</button>',
                '<button type="button" class="review-moderate-btn rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700" data-review-id="', reviewId, '" data-decision="rejected">Reject</button>',
                '</div>',
                '</article>'
            ].join('');
        });

        listEl.innerHTML = cards.join('');
    }

    async function fetchPendingReviews() {
        if (isPreviewPasswordSession()) {
            setStatus('warn', 'Preview password login is active. Moderation API requires Cognito SSO.');
            renderReviews([]);
            return;
        }

        if (!apiBase) {
            setStatus('warn', 'Review API base URL is not configured for this dashboard.');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            setStatus('error', 'Authentication token unavailable. Please sign in again.');
            return;
        }

        setStatus('loading', 'Loading pending reviews...');

        try {
            const response = await fetch(apiBase + '/reviews?status=pending&limit=25', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            let data = null;
            try {
                data = await response.json();
            } catch (_error) {
                data = null;
            }

            if (!response.ok) {
                const message = data && data.message ? data.message : 'Failed to load pending reviews.';
                setStatus('error', message + ' (HTTP ' + response.status + ')');
                renderReviews([]);
                return;
            }

            renderReviews(data && Array.isArray(data.reviews) ? data.reviews : []);
            clearStatus();
        } catch (_error) {
            setStatus('error', 'Network error while loading pending reviews.');
        }
    }

    async function moderateReview(reviewId, decision) {
        if (isPreviewPasswordSession()) {
            setStatus('warn', 'Preview password login cannot approve/reject reviews. Sign in with Cognito.');
            return;
        }

        if (!apiBase) {
            setStatus('warn', 'Review API base URL is not configured.');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            setStatus('error', 'Authentication token unavailable. Please sign in again.');
            return;
        }

        const note = window.prompt(
            decision === 'approved'
                ? 'Optional approval note:'
                : 'Optional rejection reason:'
        ) || '';

        setStatus('loading', 'Updating review status...');

        try {
            const response = await fetch(apiBase + '/reviews/' + encodeURIComponent(reviewId) + '/moderate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify({
                    decision: decision,
                    note: note
                })
            });

            let data = null;
            try {
                data = await response.json();
            } catch (_error) {
                data = null;
            }

            if (!response.ok) {
                const message = data && data.message ? data.message : 'Failed to update review.';
                setStatus('error', message + ' (HTTP ' + response.status + ')');
                return;
            }

            setStatus('success', 'Review ' + decision + '. Refreshing queue...');
            await fetchPendingReviews();
        } catch (_error) {
            setStatus('error', 'Network error while updating review.');
        }
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            fetchPendingReviews();
        });
    }

    if (listEl) {
        listEl.addEventListener('click', function (event) {
            const button = event.target.closest('.review-moderate-btn');
            if (!button) return;
            const reviewId = button.getAttribute('data-review-id');
            const decision = button.getAttribute('data-decision');
            if (!reviewId || !decision) return;
            moderateReview(reviewId, decision);
        });
    }

    fetchPendingReviews();
})();
