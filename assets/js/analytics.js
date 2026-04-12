window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag("js", new Date());

/* Detect test / bot / localhost traffic and tag it so GA4 can filter it out.
   GA4 Admin → Data Settings → Data Filters → create filter on traffic_type = 'internal'
   to exclude from reporting views. */
(function () {
  var host = window.location.hostname || '';
  var ua = navigator.userAgent || '';
  var isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  var isPlaywright = /HeadlessChrome|Playwright/i.test(ua);
  var isPreview = host.indexOf('.vite.') > -1 || host.indexOf('preview') > -1;
  var isTest = isLocalhost || isPlaywright || isPreview;

  var configParams = {};
  if (isTest) {
    configParams.traffic_type = 'internal';
    configParams.custom_map = { dimension1: 'traffic_type' };
  }
  window.gtag("config", "G-EVEC7YRTYC", configParams);
})();
