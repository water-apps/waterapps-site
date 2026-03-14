(function positiveThoughtsFeature() {
    const DEFAULT_COUNT = 1200;
    const STORAGE_KEY = 'waterapps-positive-thoughts-state-v1';
    const VISUAL_SOURCES = [
        {
            label: 'Ocean waves',
            imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ocean%20waves%20water.jpg',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ocean_waves_water.jpg',
            credit: 'Public-domain photo via Wikimedia Commons'
        },
        {
            label: 'Mediterranean sunrise',
            imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mediteranian%20sea%20at%20sunrise.jpg',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mediteranian_sea_at_sunrise.jpg',
            credit: 'CC0 photo via Wikimedia Commons'
        },
        {
            label: 'Sunrise near sea',
            imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sun%20rise%20near%20sea.jpg',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sun_rise_near_sea.jpg',
            credit: 'CC0 photo via Wikimedia Commons'
        }
    ];

    function buildPositiveThoughtsCollection(count) {
        const openings = [
            'Today is a good day to',
            'You are allowed to',
            'A steady team can',
            'Quiet confidence helps you',
            'Small acts of courage can',
            'Patience gives you room to',
            'Your next step can',
            'Consistent effort will',
            'The work in front of you can',
            'A clear mind lets you',
            'You do not need permission to',
            'Even a hard season can',
            'Good systems help you',
            'A thoughtful pause will',
            'Trust in your practice can',
            'Fresh energy can',
            'When you keep going, you',
            'Every careful improvement can',
            'Kind leadership will',
            'A grounded start can'
        ];

        const actions = [
            'build',
            'unlock',
            'protect',
            'grow',
            'steady',
            'strengthen',
            'clarify',
            'reshape',
            'refresh',
            'improve',
            'elevate',
            'restore'
        ];

        const subjects = [
            'momentum',
            'trust',
            'your outlook',
            'the next release',
            'team energy',
            'good habits',
            'calm focus',
            'lasting progress',
            'better conversations',
            'the path ahead',
            'your confidence',
            'smarter routines',
            'creative thinking',
            'a stronger foundation',
            'real optimism'
        ];

        const closings = [
            'one honest step at a time.',
            'without rushing the result.',
            'while keeping your standards high.',
            'in a way that others can feel.',
            'and make the next decision easier.',
            'with more grace than you think.',
            'and turn effort into evidence.',
            'while leaving room for joy.',
            'and create space for better work.',
            'with steady, repeatable care.'
        ];

        const themes = [
            'Momentum',
            'Clarity',
            'Confidence',
            'Resilience',
            'Focus',
            'Teamwork',
            'Growth',
            'Calm',
            'Leadership',
            'Possibility'
        ];

        const visuals = [
            'Skyline Blue',
            'Calm Water',
            'Morning Lift',
            'Bright Horizon',
            'Clear Current',
            'Open Air'
        ];

        const sourceLabel = 'WaterApps original positive thoughts collection';
        const quotes = [];
        const seen = new Set();
        let index = 0;

        while (quotes.length < count) {
            const opening = openings[Math.floor(index / (actions.length * subjects.length * closings.length)) % openings.length];
            const action = actions[Math.floor(index / (subjects.length * closings.length)) % actions.length];
            const subject = subjects[Math.floor(index / closings.length) % subjects.length];
            const closing = closings[index % closings.length];
            const text = `${opening} ${action} ${subject} ${closing}`;

            if (!seen.has(text)) {
                seen.add(text);
                quotes.push({
                    id: `pt-${quotes.length + 1}`,
                    text,
                    theme: themes[quotes.length % themes.length],
                    visual: visuals[quotes.length % visuals.length],
                    source: sourceLabel
                });
            }

            index += 1;
        }

        return quotes;
    }

    function safeParse(jsonText) {
        try {
            return JSON.parse(jsonText);
        } catch {
            return null;
        }
    }

    function getStorageState(storage, length) {
        if (!storage || typeof storage.getItem !== 'function') {
            return { seed: 0, seenCount: 0 };
        }

        const parsed = safeParse(storage.getItem(STORAGE_KEY) || '');
        const seed = Number.isInteger(parsed?.seed) ? parsed.seed : Math.floor(Math.random() * Math.max(length, 1));
        const seenCount = Number.isInteger(parsed?.seenCount) ? parsed.seenCount : 0;
        return { seed, seenCount };
    }

    function persistStorageState(storage, state) {
        if (!storage || typeof storage.setItem !== 'function') return;
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function getQuoteIndex(state, length) {
        if (!length) return 0;
        const seed = Number.isInteger(state?.seed) ? state.seed : 0;
        const seenCount = Number.isInteger(state?.seenCount) ? state.seenCount : 0;
        return ((seed % length) + length + seenCount) % length;
    }

    function makeTracker() {
        return function trackThoughtEvent(eventName, params) {
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                window.gtag('event', eventName, params || {});
            }
        };
    }

    if (typeof window !== 'undefined') {
        window.WaterAppsPositiveThoughtsHelpers = {
            DEFAULT_COUNT,
            STORAGE_KEY,
            VISUAL_SOURCES,
            buildPositiveThoughtsCollection,
            getStorageState,
            getQuoteIndex
        };
    }

    if (typeof document === 'undefined') return;

    const thoughtText = document.getElementById('positive-thought-text');
    const thoughtTheme = document.getElementById('positive-thought-theme');
    const thoughtSource = document.getElementById('positive-thought-source');
    const thoughtCount = document.getElementById('positive-thought-count');
    const nextButton = document.getElementById('positive-thought-next');
    const thoughtImage = document.getElementById('positive-thought-image');
    const thoughtImageCredit = document.getElementById('positive-thought-image-credit');

    if (!thoughtText || !thoughtTheme || !thoughtSource || !thoughtCount || !nextButton) return;

    const trackEvent = makeTracker();
    const collection = buildPositiveThoughtsCollection(DEFAULT_COUNT);
    let storageState = getStorageState(window.localStorage, collection.length);
    let currentIndex = getQuoteIndex(storageState, collection.length);

    function render(index, source) {
        const thought = collection[index];
        if (!thought) return;
        const visual = VISUAL_SOURCES[index % VISUAL_SOURCES.length];

        thoughtText.textContent = thought.text;
        thoughtTheme.textContent = `${thought.theme} - ${thought.visual}`;
        thoughtSource.textContent = `Source: ${thought.source}`;
        thoughtCount.textContent = `${collection.length.toLocaleString()} original thoughts ready`;
        if (thoughtImage && visual) {
            thoughtImage.src = visual.imageUrl;
            thoughtImage.alt = `${visual.label} photography from Wikimedia Commons`;
        }
        if (thoughtImageCredit && visual) {
            thoughtImageCredit.innerHTML = `Photo: <a href="${visual.sourceUrl}" target="_blank" rel="noopener noreferrer" class="underline decoration-blue-200 underline-offset-2 hover:text-white">${visual.credit}</a>`;
        }

        if (source) {
            trackEvent('positive_thought_render', {
                section: 'positive-thoughts',
                source,
                theme: thought.theme,
                index: index + 1,
                collection_size: collection.length,
                visual_label: visual ? visual.label : ''
            });
        }
    }

    render(currentIndex, 'initial_load');

    storageState = {
        seed: storageState.seed,
        seenCount: storageState.seenCount + 1
    };
    persistStorageState(window.localStorage, storageState);

    nextButton.addEventListener('click', function handleNextThought() {
        currentIndex = (currentIndex + 1) % collection.length;
        render(currentIndex, 'manual_next');
        storageState = {
            seed: storageState.seed,
            seenCount: storageState.seenCount + 1
        };
        persistStorageState(window.localStorage, storageState);
    });
})();
