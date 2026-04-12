(function (root, factory) {
    const api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.WaterAppsGuideHelpers = api;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', api.setupWebsiteGuide, { once: true });
        } else {
            api.setupWebsiteGuide();
        }
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const GUIDE_STEPS = {
        start: {
            id: 'start',
            title: 'What are you here to solve today?',
            body: 'Pick the path that is closest to your current need. I will narrow it down and point you to the best next step on the site.',
            choices: [
                { id: 'cloud_platform', label: 'Cloud or platform uplift', nextStepId: 'cloud_platform' },
                { id: 'security_compliance', label: 'Security or compliance readiness', recommendationId: 'security_compliance' },
                { id: 'ai_automation', label: 'AI workflow automation', recommendationId: 'ai_workflow_automation' },
                { id: 'intelligent_products', label: 'Intelligent products and agents', recommendationId: 'intelligent_products' },
                { id: 'website_workflows', label: 'Website or lightweight workflow', nextStepId: 'website_workflows' },
                { id: 'site_tour', label: 'Show me around the site', nextStepId: 'site_tour' },
                { id: 'talk_now', label: 'I want to talk now', recommendationId: 'book_discovery' }
            ]
        },
        cloud_platform: {
            id: 'cloud_platform',
            title: 'Which cloud or delivery path sounds closest?',
            body: 'This helps me point you toward the right architecture discussion instead of a generic consulting page.',
            choices: [
                { id: 'regulated_uplift', label: 'Regulated or approval-heavy delivery', recommendationId: 'platform_uplift_regulated' },
                { id: 'modernization', label: 'Modernization without a full rebuild', recommendationId: 'platform_uplift_modernize' },
                { id: 'quick_review', label: 'I need a fast architecture review', recommendationId: 'architecture_review' }
            ]
        },
        website_workflows: {
            id: 'website_workflows',
            title: 'What kind of website or workflow help do you need?',
            body: 'I can point you to the simplest fit first, then you can decide whether you want a call or a scoped enquiry.',
            choices: [
                { id: 'lead_capture', label: 'Lead capture and website guidance', recommendationId: 'website_guide_product' },
                { id: 'lightweight_forms', label: 'Lightweight forms and intake workflows', recommendationId: 'lightweight_workflows' },
                { id: 'booking', label: 'Scheduling or booking flow', recommendationId: 'scheduling_solution' }
            ]
        },
        site_tour: {
            id: 'site_tour',
            title: 'What would you like to see first?',
            body: 'I will point you to the pages that make the fastest sense for a new visitor.',
            choices: [
                { id: 'tour_services', label: 'Services and delivery approach', recommendationId: 'site_tour_services' },
                { id: 'tour_products', label: 'Products and reusable solutions', recommendationId: 'site_tour_products' },
                { id: 'tour_proof', label: 'Proof, case studies, and credibility', recommendationId: 'site_tour_proof' },
                { id: 'tour_trust', label: 'Enterprise readiness and trust pages', recommendationId: 'site_tour_trust' }
            ]
        }
    };

    const GUIDE_RECOMMENDATIONS = {
        platform_uplift_regulated: {
            id: 'platform_uplift_regulated',
            eyebrow: 'Best fit',
            title: 'Start with a controlled architecture and delivery assessment',
            summary: 'Your situation sounds like a regulated or approval-heavy platform uplift. The strongest first move is to review delivery friction, environment drift, release gates, and modernization sequence before changing tools.',
            reasons: [
                'This path is strongest when traceability, controls, and release confidence matter as much as delivery speed.',
                'WaterApps is positioned around enterprise platform uplift for banks, government, and other control-heavy teams.',
                'The right next step is usually a scoped assessment, not a generic rebuild.'
            ],
            primaryAction: { label: 'View services', href: '#services' },
            secondaryAction: { label: 'Book discovery call', href: '#contact', prefillContact: true },
            links: [
                { label: 'Enterprise readiness', href: 'enterprise-readiness.html' },
                { label: 'Case studies', href: '#case-studies' }
            ],
            briefTopic: 'regulated platform uplift and delivery assessment'
        },
        platform_uplift_modernize: {
            id: 'platform_uplift_modernize',
            eyebrow: 'Recommended path',
            title: 'Focus on modernization without unnecessary rebuilds',
            summary: 'The best fit looks like targeted platform improvement: cleaner controls, stronger workflows, and reusable patterns without rewriting everything.',
            reasons: [
                'You likely need modernization with delivery continuity, not tool churn for its own sake.',
                'The site already points to architecture patterns, reusable workflows, and productized delivery paths.',
                'The most useful next move is to review services, products, and a scoped discovery path.'
            ],
            primaryAction: { label: 'See products and reusable offers', href: '#products' },
            secondaryAction: { label: 'Send a scoped enquiry', href: '#contact', prefillContact: true },
            links: [
                { label: 'Services overview', href: '#services' },
                { label: 'Capability statement', href: 'capability-statement.html' }
            ],
            briefTopic: 'platform modernization without a full rebuild'
        },
        architecture_review: {
            id: 'architecture_review',
            eyebrow: 'Fastest next step',
            title: 'Use WaterApps as an architecture review partner',
            summary: 'If you need direction quickly, the best path is a focused review covering current-state constraints, reusable options, and a safe implementation sequence.',
            reasons: [
                'This route is high value when you need clarity before committing budget or platform changes.',
                'It produces a sharper outcome than a generic contact request because the problem framing is already clear.',
                'You can then move into platform uplift, intelligent workflow automation, or a product path with less guesswork.'
            ],
            primaryAction: { label: 'Go to contact and booking', href: '#contact', prefillContact: true },
            secondaryAction: { label: 'View capability statement', href: 'capability-statement.html' },
            links: [
                { label: 'Our approach', href: '#approach' },
                { label: 'Insights', href: 'insights.html' }
            ],
            briefTopic: 'fast architecture review'
        },
        security_compliance: {
            id: 'security_compliance',
            eyebrow: 'Best fit',
            title: 'Review the enterprise-readiness and secure-delivery path first',
            summary: 'Your need points to stronger architecture controls, audit-ready delivery, and procurement-friendly evidence rather than a generic implementation conversation.',
            reasons: [
                'This path is strongest when buyers or stakeholders need trust material before they engage.',
                'WaterApps already publishes buyer-facing readiness content and secure architecture signals on the site.',
                'A scoped conversation is still valuable, but the trust pages should come first.'
            ],
            primaryAction: { label: 'Open enterprise readiness', href: 'enterprise-readiness.html' },
            secondaryAction: { label: 'Discuss requirements', href: '#contact', prefillContact: true },
            links: [
                { label: 'AI use assurance', href: 'ai-use-assurance.html' },
                { label: 'Capability statement', href: 'capability-statement.html' }
            ],
            briefTopic: 'security and compliance readiness'
        },
        ai_workflow_automation: {
            id: 'ai_workflow_automation',
            eyebrow: 'Strongest match',
            title: 'Explore AI workflow automation and guided delivery',
            summary: 'This looks like a good fit for an intelligent workflow or back-office automation path, where `n8n`, agent reasoning, and reusable controls work together.',
            reasons: [
                'WaterApps is actively shaping AI, automation, and controlled workflow delivery as a product direction.',
                'The best path is a bounded workflow with clear handoffs, approvals, and visible next actions.',
                'A structured discovery call is the right next step if you already have a business process in mind.'
            ],
            primaryAction: { label: 'Read AI workflow insight', href: 'insights-n8n-aiops-platform.html' },
            secondaryAction: { label: 'Book a workflow review', href: '#contact', prefillContact: true },
            links: [
                { label: 'Products', href: '#products' },
                { label: 'Insights library', href: 'insights.html' }
            ],
            briefTopic: 'AI workflow automation'
        },
        intelligent_products: {
            id: 'intelligent_products',
            eyebrow: 'Recommended path',
            title: 'Start with intelligent products and agentic workflows',
            summary: 'Your request maps best to WaterApps work around AI agents, guided workflows, MCP integration, and reusable product foundations.',
            reasons: [
                'This is the strongest fit when you want software that reasons, guides, or orchestrates work rather than just storing data.',
                'The safest WaterApps pattern is product core plus workflow layer plus agent layer, not one giant autonomous bot.',
                'The right next step is usually product scoping with a narrow high-value use case.'
            ],
            primaryAction: { label: 'See product paths', href: '#products' },
            secondaryAction: { label: 'Discuss an intelligent product', href: '#contact', prefillContact: true },
            links: [
                { label: 'SchedulEase', href: 'schedulease.html' },
                { label: 'AI use assurance', href: 'ai-use-assurance.html' }
            ],
            briefTopic: 'intelligent products and agentic workflows'
        },
        website_guide_product: {
            id: 'website_guide_product',
            eyebrow: 'Recommended offer',
            title: 'Use a guided website assistant with lead qualification',
            summary: 'If your site needs to help newcomers find the right path, a guided website assistant is the strongest fit. It combines site navigation, qualification, and next-step conversion without collapsing into a generic chatbot.',
            reasons: [
                'This is best when visitors need help choosing between services, products, or engagement paths.',
                'It improves conversion while also becoming a reusable client-facing product pattern.',
                'It works well with a website plus follow-up workflow rather than a large platform build.'
            ],
            primaryAction: { label: 'Send a guided website enquiry', href: '#contact', prefillContact: true },
            secondaryAction: { label: 'View products', href: '#products' },
            links: [
                { label: 'Case studies', href: '#case-studies' },
                { label: 'Capability statement', href: 'capability-statement.html' }
            ],
            briefTopic: 'guided website assistant and lead qualification'
        },
        lightweight_workflows: {
            id: 'lightweight_workflows',
            eyebrow: 'Good fit',
            title: 'Start with a lightweight intake or workflow pattern',
            summary: 'A smaller serverless or workflow-first build is likely the best starting point if you need forms, intake, routing, or simple automations without a large product platform.',
            reasons: [
                'This works well for public forms, lead capture, approvals, and simple process automation.',
                'It is usually cheaper and faster than starting with a heavyweight platform.',
                'It can still be designed to grow into a broader intelligent workflow later.'
            ],
            primaryAction: { label: 'Open contact and scope it', href: '#contact', prefillContact: true },
            secondaryAction: { label: 'View services', href: '#services' },
            links: [
                { label: 'Products', href: '#products' },
                { label: 'Insights', href: 'insights.html' }
            ],
            briefTopic: 'lightweight intake and workflow automation'
        },
        scheduling_solution: {
            id: 'scheduling_solution',
            eyebrow: 'Product fit',
            title: 'SchedulEase is the closest product path',
            summary: 'If you are looking at booking, scheduling, reminders, or timezone-aware coordination, SchedulEase is the strongest existing product direction.',
            reasons: [
                'This path already exists as a reusable product rather than a vague service idea.',
                'It is a strong fit for booking flows, reminders, follow-up, and guided scheduling improvements.',
                'You can review the product first, then decide whether you need productization, implementation, or consulting help.'
            ],
            primaryAction: { label: 'Open SchedulEase', href: 'schedulease.html' },
            secondaryAction: { label: 'Book a SchedulEase discussion', href: '#contact', prefillContact: true },
            links: [
                { label: 'Products', href: '#products' },
                { label: 'Contact', href: '#contact' }
            ],
            briefTopic: 'scheduling and booking automation'
        },
        site_tour_services: {
            id: 'site_tour_services',
            eyebrow: 'Site guide',
            title: 'Start with services and delivery approach',
            summary: 'If you are new here, the best path is to review services first, then move into approach and contact once you know the shape of the engagement.',
            reasons: [
                'This gives the clearest view of where WaterApps helps and how work is structured.',
                'It is the best entry point for buyers who need an overview before looking at products or proof.',
                'You can still move quickly into a discovery call if something matches.'
            ],
            primaryAction: { label: 'Jump to services', href: '#services' },
            secondaryAction: { label: 'See our approach', href: '#approach' },
            links: [
                { label: 'Contact', href: '#contact' },
                { label: 'Capability statement', href: 'capability-statement.html' }
            ],
            briefTopic: 'services overview and delivery approach'
        },
        site_tour_products: {
            id: 'site_tour_products',
            eyebrow: 'Site guide',
            title: 'Start with products and reusable solutions',
            summary: 'If you want to see where WaterApps is building repeatable offerings, the products section is the best first stop.',
            reasons: [
                'This path helps visitors understand the difference between bespoke consulting and reusable productized offers.',
                'It is the best place to explore intelligent and automation-led solutions quickly.',
                'From there, SchedulEase and related offers become easier to assess.'
            ],
            primaryAction: { label: 'Jump to products', href: '#products' },
            secondaryAction: { label: 'Open SchedulEase', href: 'schedulease.html' },
            links: [
                { label: 'Case studies', href: '#case-studies' },
                { label: 'Contact', href: '#contact' }
            ],
            briefTopic: 'product tour and reusable solutions'
        },
        site_tour_proof: {
            id: 'site_tour_proof',
            eyebrow: 'Site guide',
            title: 'Start with proof, credentials, and case studies',
            summary: 'If you want to understand credibility first, review the proof-heavy sections before you decide whether to talk or keep exploring.',
            reasons: [
                'This route suits buyers who need confidence signals early.',
                'It brings case studies, credentials, and trust material closer together.',
                'It is usually the best route for enterprise and stakeholder readers.'
            ],
            primaryAction: { label: 'Jump to case studies', href: '#case-studies' },
            secondaryAction: { label: 'View credentials', href: '#credentials' },
            links: [
                { label: 'Enterprise readiness', href: 'enterprise-readiness.html' },
                { label: 'Capability statement', href: 'capability-statement.html' }
            ],
            briefTopic: 'case studies and credibility review'
        },
        site_tour_trust: {
            id: 'site_tour_trust',
            eyebrow: 'Site guide',
            title: 'Start with trust and enterprise-readiness pages',
            summary: 'If you care about buyer confidence, governance, and readiness signals first, the best route is through the trust pages before a contact step.',
            reasons: [
                'This is the right path for procurement-minded or compliance-sensitive readers.',
                'It aligns with how WaterApps positions itself for regulated sectors.',
                'It sets up a much better later conversation than jumping straight to a generic contact form.'
            ],
            primaryAction: { label: 'Open enterprise readiness', href: 'enterprise-readiness.html' },
            secondaryAction: { label: 'Open AI use assurance', href: 'ai-use-assurance.html' },
            links: [
                { label: 'Capability statement', href: 'capability-statement.html' },
                { label: 'Contact', href: '#contact' }
            ],
            briefTopic: 'enterprise readiness and trust review'
        },
        book_discovery: {
            id: 'book_discovery',
            eyebrow: 'Best next step',
            title: 'Go straight to booking or a scoped enquiry',
            summary: 'If you already know you want to talk, the fastest move is to use the booking or contact path now and carry a short summary into that handoff.',
            reasons: [
                'You do not need to over-explore the site if the need is already clear.',
                'A short guided brief can still make the first conversation better.',
                'WaterApps already has contact and booking routes on the homepage.'
            ],
            primaryAction: { label: 'Go to contact and booking', href: '#contact', prefillContact: true },
            secondaryAction: { label: 'Book Google Calendar fallback', href: 'https://calendar.app.google/MaHkjyQHyDLd5qPw5', external: true },
            links: [
                { label: 'Capability statement', href: 'capability-statement.html' },
                { label: 'Services', href: '#services' }
            ],
            briefTopic: 'discovery call or scoped enquiry'
        }
    };

    function cloneStep(step) {
        if (!step) return null;
        return {
            id: step.id,
            title: step.title,
            body: step.body,
            choices: step.choices.map((choice) => ({ ...choice }))
        };
    }

    function getGuideStep(stepId) {
        return cloneStep(GUIDE_STEPS[stepId] || GUIDE_STEPS.start);
    }

    function getGuideRecommendation(recommendationId) {
        const recommendation = GUIDE_RECOMMENDATIONS[recommendationId];
        if (!recommendation) return null;
        return {
            ...recommendation,
            reasons: recommendation.reasons.slice(),
            links: recommendation.links.map((link) => ({ ...link })),
            primaryAction: { ...recommendation.primaryAction },
            secondaryAction: recommendation.secondaryAction ? { ...recommendation.secondaryAction } : null
        };
    }

    function resolveGuideChoice(stepId, choiceId) {
        const step = GUIDE_STEPS[stepId] || GUIDE_STEPS.start;
        const choice = step.choices.find((candidate) => candidate.id === choiceId);
        if (!choice) return null;

        return {
            choice: { ...choice },
            nextStepId: choice.nextStepId || null,
            recommendation: choice.recommendationId ? getGuideRecommendation(choice.recommendationId) : null
        };
    }

    function buildGuideBrief(recommendationId, answers) {
        const recommendation = getGuideRecommendation(recommendationId);
        if (!recommendation) return '';

        const selectedAnswers = Array.isArray(answers)
            ? answers.map((answer) => `- ${answer.label}`).join('\n')
            : '';

        const relatedLinks = recommendation.links
            .map((link) => `${link.label}: ${link.href}`)
            .join('\n');

        return [
            'Website Guide summary',
            `Recommended path: ${recommendation.title}`,
            `Topic: ${recommendation.briefTopic}`,
            selectedAnswers ? 'Visitor selections:\n' + selectedAnswers : '',
            relatedLinks ? 'Suggested pages:\n' + relatedLinks : '',
            'Please contact me about this path.'
        ].filter(Boolean).join('\n\n');
    }

    function emitGuideEvent(eventName, params) {
        if (typeof trackEvent === 'function') {
            trackEvent(eventName, params || {});
        }
    }

    function navigateToHref(href) {
        if (!href) return;
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
        window.location.href = href;
    }

    function prefillContactFromGuide(recommendationId, answers) {
        const messageField = document.getElementById('contact-message');
        if (!messageField) return;

        const brief = buildGuideBrief(recommendationId, answers);
        if (!brief) return;

        const currentValue = (messageField.value || '').trim();
        if (!currentValue) {
            messageField.value = brief;
        } else if (!currentValue.includes('Website Guide summary')) {
            messageField.value = `${currentValue}\n\n---\n\n${brief}`;
        }

        messageField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function createChoiceButton(choice) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'guide-choice text-left';
        button.textContent = choice.label;
        button.dataset.choiceId = choice.id;
        return button;
    }

    function createLinkButton(action, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = action.label;
        return button;
    }

    function setupWebsiteGuide() {
        const launcher = document.getElementById('guide-launcher');
        const panel = document.getElementById('guide-panel');
        const backdrop = document.getElementById('guide-backdrop');
        const closeButton = document.getElementById('guide-close');
        const resetButton = document.getElementById('guide-reset');
        const questionTitle = document.getElementById('guide-question-title');
        const questionBody = document.getElementById('guide-question-body');
        const choiceList = document.getElementById('guide-choice-list');
        const historyList = document.getElementById('guide-history');
        const resultShell = document.getElementById('guide-result-shell');
        const stepShell = document.getElementById('guide-step-shell');
        const resultEyebrow = document.getElementById('guide-result-eyebrow');
        const resultTitle = document.getElementById('guide-result-title');
        const resultSummary = document.getElementById('guide-result-summary');
        const resultReasons = document.getElementById('guide-result-reasons');
        const resultLinks = document.getElementById('guide-result-links');
        const resultPrimary = document.getElementById('guide-result-primary');
        const resultSecondary = document.getElementById('guide-result-secondary');
        const guideSummary = document.getElementById('guide-summary');
        const openTriggers = Array.from(document.querySelectorAll('[data-guide-open]'));

        if (!launcher || !panel || !backdrop || !questionTitle || !choiceList || !historyList || !resultShell || !stepShell) {
            return;
        }

        let state = {
            currentStepId: 'start',
            answers: [],
            recommendationId: null
        };

        function renderHistory() {
            historyList.innerHTML = '';
            state.answers.forEach((answer) => {
                const item = document.createElement('span');
                item.className = 'guide-history-chip';
                item.textContent = answer.label;
                historyList.append(item);
            });
            guideSummary.textContent = state.answers.length === 0
                ? 'Choose a path and I will point you to the best page or next action.'
                : 'Current path: ' + state.answers.map((answer) => answer.label).join(' -> ');
        }

        function renderStep(stepId) {
            const step = getGuideStep(stepId);
            if (!step) return;

            state.currentStepId = step.id;
            state.recommendationId = null;

            stepShell.classList.remove('hidden');
            resultShell.classList.add('hidden');

            questionTitle.textContent = step.title;
            questionBody.textContent = step.body;
            choiceList.innerHTML = '';

            step.choices.forEach((choice) => {
                const button = createChoiceButton(choice);
                button.addEventListener('click', () => {
                    const resolution = resolveGuideChoice(step.id, choice.id);
                    if (!resolution) return;

                    state.answers.push({
                        stepId: step.id,
                        choiceId: choice.id,
                        label: choice.label
                    });

                    emitGuideEvent('site_guide_choice', {
                        step_id: step.id,
                        choice_id: choice.id,
                        choice_label: choice.label
                    });

                    renderHistory();

                    if (resolution.recommendation) {
                        renderRecommendation(resolution.recommendation.id);
                        return;
                    }

                    if (resolution.nextStepId) {
                        renderStep(resolution.nextStepId);
                    }
                });
                choiceList.append(button);
            });
        }

        function renderLinks(links) {
            resultLinks.innerHTML = '';
            links.forEach((link) => {
                const anchor = document.createElement('a');
                anchor.href = link.href;
                anchor.className = 'guide-link-chip';
                anchor.textContent = link.label;
                resultLinks.append(anchor);
            });
        }

        function bindResultButton(button, recommendationId, action, eventSource) {
            if (!button) return;
            button.hidden = !action;
            if (!action) return;
            button.textContent = action.label;
            button.setAttribute('aria-label', action.label);
            button.onclick = () => {
                emitGuideEvent('site_guide_cta', {
                    recommendation_id: recommendationId,
                    cta_label: action.label,
                    cta_href: action.href,
                    source: eventSource
                });

                if (action.prefillContact) {
                    prefillContactFromGuide(recommendationId, state.answers);
                }

                if (action.external) {
                    window.open(action.href, '_blank', 'noopener,noreferrer');
                    return;
                }

                closeGuide();
                navigateToHref(action.href);
            };
        }

        function renderRecommendation(recommendationId) {
            const recommendation = getGuideRecommendation(recommendationId);
            if (!recommendation) return;

            state.recommendationId = recommendation.id;

            stepShell.classList.add('hidden');
            resultShell.classList.remove('hidden');

            resultEyebrow.textContent = recommendation.eyebrow;
            resultTitle.textContent = recommendation.title;
            resultSummary.textContent = recommendation.summary;
            resultReasons.innerHTML = recommendation.reasons
                .map((reason) => `<li>${reason}</li>`)
                .join('');

            renderLinks(recommendation.links);
            bindResultButton(resultPrimary, recommendation.id, recommendation.primaryAction, 'primary');
            bindResultButton(resultSecondary, recommendation.id, recommendation.secondaryAction, 'secondary');

            emitGuideEvent('site_guide_recommendation', {
                recommendation_id: recommendation.id,
                answer_count: state.answers.length
            });
        }

        function openGuide(source) {
            panel.classList.remove('hidden');
            backdrop.classList.remove('hidden');
            document.body.classList.add('guide-open');
            launcher.setAttribute('aria-expanded', 'true');
            emitGuideEvent('site_guide_open', {
                source: source || 'launcher'
            });
        }

        function closeGuide() {
            panel.classList.add('hidden');
            backdrop.classList.add('hidden');
            document.body.classList.remove('guide-open');
            launcher.setAttribute('aria-expanded', 'false');
        }

        function resetGuide() {
            state = {
                currentStepId: 'start',
                answers: [],
                recommendationId: null
            };
            renderHistory();
            renderStep('start');
            emitGuideEvent('site_guide_reset', {
                source: 'manual'
            });
        }

        launcher.addEventListener('click', () => {
            if (panel.classList.contains('hidden')) {
                openGuide('launcher');
            } else {
                closeGuide();
            }
        });

        openTriggers.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openGuide(trigger.dataset.guideOpen || 'inline_cta');
            });
        });

        backdrop.addEventListener('click', closeGuide);
        closeButton?.addEventListener('click', closeGuide);
        resetButton?.addEventListener('click', resetGuide);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeGuide();
            }
        });

        renderHistory();
        renderStep('start');
    }

    return {
        GUIDE_STEPS,
        GUIDE_RECOMMENDATIONS,
        getGuideStep,
        getGuideRecommendation,
        resolveGuideChoice,
        buildGuideBrief,
        setupWebsiteGuide
    };
});
