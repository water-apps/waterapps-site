const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const INDEX_PATH = path.join(__dirname, "..", "index.html");
const INDEX_JS_PATH = path.join(__dirname, "..", "assets", "js", "index.js");
const SCHEDULEASE_PATH = path.join(__dirname, "..", "schedulease.html");
const MANAGEMENT_DASHBOARD_PATH = path.join(__dirname, "..", "management-dashboard.html");
const MANAGEMENT_DASHBOARD_JS_PATH = path.join(__dirname, "..", "scripts", "management-dashboard.js");
const PORTAL_LOGIN_PATH = path.join(__dirname, "..", "portal-login.html");
const PORTAL_AUTH_CONFIG_PATH = path.join(__dirname, "..", "scripts", "portal-auth-config.js");

const indexHtml = fs.readFileSync(INDEX_PATH, "utf8");
const indexJs = fs.readFileSync(INDEX_JS_PATH, "utf8");
const scheduleaseHtml = fs.readFileSync(SCHEDULEASE_PATH, "utf8");
const managementDashboardHtml = fs.readFileSync(MANAGEMENT_DASHBOARD_PATH, "utf8");
const managementDashboardJs = fs.readFileSync(MANAGEMENT_DASHBOARD_JS_PATH, "utf8");
const portalLoginHtml = fs.readFileSync(PORTAL_LOGIN_PATH, "utf8");
const portalAuthConfigJs = fs.readFileSync(PORTAL_AUTH_CONFIG_PATH, "utf8");

test("booking flow critical UI exists on homepage", () => {
    assert.match(indexHtml, /id="booking-form"/);
    assert.match(indexHtml, /id="booking-slot"/);
    assert.match(indexHtml, /id="booking-submit"/);
    assert.match(indexHtml, /id="booking-refresh"/);
});

test("booking form is wired to availability and booking APIs", () => {
    assert.match(
        indexHtml,
        /id="booking-form"[\s\S]*data-availability-endpoint="https:\/\/[^"]+\/availability"/
    );
    assert.match(
        indexHtml,
        /id="booking-form"[\s\S]*data-booking-endpoint="https:\/\/[^"]+\/booking"/
    );
});

test("google calendar fallback link is present and safe", () => {
    assert.match(
        indexHtml,
        /href="https:\/\/calendar\.app\.google\/MaHkjyQHyDLd5qPw5"/
    );
    assert.match(indexHtml, /target="_blank"/);
    assert.match(indexHtml, /rel="noopener noreferrer"/);
});

test("contact form endpoint is present", () => {
    assert.match(
        indexHtml,
        /id="contact-form"[^>]*data-api-endpoint="https:\/\/[^"]+\/contact"/
    );
});

test("homepage includes client recommendation carousel", () => {
    assert.match(indexHtml, /id="recommendation-carousel"/);
    assert.match(indexHtml, /data-recommendation-slide/);
    assert.match(indexHtml, /id="recommendation-prev"/);
    assert.match(indexHtml, /id="recommendation-next"/);
    assert.match(indexJs, /setupRecommendationCarousel/);
    assert.match(indexJs, /recommendation_carousel_navigate/);
});

test("analytics tracks google calendar fallback click", () => {
    assert.match(indexJs, /href\.includes\('calendar\.app\.google'\)/);
    assert.match(indexJs, /cta_type:\s*'google_calendar_booking'/);
});

test("homepage exposes productized offer path with SchedulEase link", () => {
    assert.match(indexHtml, /id="products"/);
    assert.match(indexHtml, /Book SchedulEase Demo/);
    assert.match(indexHtml, /href="schedulease\.html"/);
    assert.match(indexJs, /cta_type:\s*'schedulease_offer'/);
});

test("SchedulEase offer page exists with conversion CTA", () => {
    assert.match(scheduleaseHtml, /<h1[^>]*>\s*SchedulEase\s*<\/h1>/);
    assert.match(scheduleaseHtml, /Book SchedulEase Demo/);
    assert.match(scheduleaseHtml, /href="index\.html#contact"/);
});

test("management dashboard includes moderation section and script wiring", () => {
    assert.match(managementDashboardHtml, /id="reviews-moderation"/);
    assert.match(managementDashboardHtml, /id="reviewsModerationRefresh"/);
    assert.match(managementDashboardHtml, /scripts\/management-dashboard\.js/);
});

test("management dashboard moderation script calls review moderation endpoints", () => {
    assert.match(managementDashboardJs, /\/reviews\?status=pending&limit=25/);
    assert.match(managementDashboardJs, /\/reviews\/'\s*\+\s*encodeURIComponent\(reviewId\)\s*\+\s*'\/moderate/);
    assert.match(managementDashboardJs, /data-decision="approved"/);
    assert.match(managementDashboardJs, /data-decision="rejected"/);
});

test("production portal config disables preview password login on live host", () => {
    assert.match(portalAuthConfigJs, /allowPreviewPasswordLoginOnProduction:\s*false/);
});

test("portal login page does not publish fallback credentials", () => {
    assert.doesNotMatch(portalLoginHtml, /Login details to use now/);
    assert.doesNotMatch(portalLoginHtml, /Fallback password \(temporary\): any 10\+ characters/);
    assert.doesNotMatch(portalLoginHtml, /Waterapps1234/);
});

test("management dashboard sanitizes external review profile links", () => {
    assert.match(managementDashboardJs, /function sanitizeExternalUrl/);
    assert.match(managementDashboardJs, /parsed\.protocol !== 'http:' && parsed\.protocol !== 'https:'/);
    assert.match(managementDashboardJs, /LinkedIn profile unavailable/);
});
