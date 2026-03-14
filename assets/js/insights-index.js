(function () {
    "use strict";

    function initInsightsIndex() {
        var catalog = document.querySelector("[data-insights-catalog]");
        var searchInput = document.getElementById("insights-search-input");
        var filters = Array.prototype.slice.call(document.querySelectorAll(".insights-filter"));
        var resultCount = document.getElementById("insights-results-count");
        var emptyState = document.getElementById("insights-empty-state");

        if (!catalog || !searchInput || !filters.length || !resultCount || !emptyState) {
            return;
        }

        var cards = Array.prototype.slice.call(catalog.querySelectorAll(".insight-card"));
        var activeFilter = "all";

        function normalize(value) {
            return (value || "").toLowerCase().trim();
        }

        function matches(card, query) {
            var topics = normalize(card.getAttribute("data-topic"));
            var keywords = normalize(card.getAttribute("data-keywords"));
            var text = normalize(card.textContent);
            var filterOk = activeFilter === "all" || topics.indexOf(activeFilter) !== -1;
            var queryOk = !query || text.indexOf(query) !== -1 || keywords.indexOf(query) !== -1 || topics.indexOf(query) !== -1;
            return filterOk && queryOk;
        }

        function render() {
            var query = normalize(searchInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var show = matches(card, query);
                card.classList.toggle("hidden", !show);
                if (show) visible += 1;
            });

            resultCount.textContent = String(visible);
            emptyState.classList.toggle("hidden", visible !== 0);
        }

        filters.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filters.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                render();
            });
        });

        searchInput.addEventListener("input", render);
        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initInsightsIndex);
    } else {
        initInsightsIndex();
    }
})();
