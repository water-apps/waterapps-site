const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const INDEX_PATH = path.join(__dirname, "..", "index.html");
const INDEX_JS_PATH = path.join(__dirname, "..", "assets", "js", "index.js");
const MANAGEMENT_DASHBOARD_PATH = path.join(__dirname, "..", "management-dashboard.html");
const MANAGEMENT_DASHBOARD_JS_PATH = path.join(__dirname, "..", "scripts", "management-dashboard.js");

const indexHtml = fs.readFileSync(INDEX_PATH, "utf8");
const indexJs = fs.readFileSync(INDEX_JS_PATH, "utf8");
const managementDashboardHtml = fs.readFileSync(MANAGEMENT_DASHBOARD_PATH, "utf8");
const managementDashboardJs = fs.readFileSync(MANAGEMENT_DASHBOARD_JS_PATH, "utf8");

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

test("analytics tracks google calendar fallback click", () => {
    assert.match(indexJs, /href\.includes\('calendar\.app\.google'\)/);
    assert.match(indexJs, /cta_type:\s*'google_calendar_booking'/);
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
