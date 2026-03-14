(function enforceCanonicalHost() {
    var host = window.location.hostname.toLowerCase();
    if (host === "waterapps.com.au") {
        window.location.replace("https://www.waterapps.com.au" + window.location.pathname + window.location.search + window.location.hash);
    }
})();
