const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MANAGEMENT_DASHBOARD_PATH = path.join(__dirname, "..", "management-dashboard.html");
const MANAGEMENT_DASHBOARD_JS_PATH = path.join(__dirname, "..", "scripts", "management-dashboard.js");

const managementDashboardHtml = fs.readFileSync(MANAGEMENT_DASHBOARD_PATH, "utf8");
const managementDashboardJs = fs.readFileSync(MANAGEMENT_DASHBOARD_JS_PATH, "utf8");

test("management dashboard includes moderation section and script wiring", () => {
    assert.match(managementDashboardHtml, /id="reviews-moderation"/);
    assert.match(managementDashboardHtml, /id="reviewsModerationRefresh"/);
    assert.match(managementDashboardHtml, /scripts\/management-dashboard\.js/);
    assert.match(managementDashboardHtml, /id="portalUserChip"/);
});

test("management dashboard moderation script calls review moderation endpoints", () => {
    assert.match(managementDashboardJs, /\/reviews\?status=pending&limit=25/);
    assert.match(managementDashboardJs, /\/reviews\/'\s*\+\s*encodeURIComponent\(reviewId\)\s*\+\s*'\/moderate/);
    assert.match(managementDashboardJs, /data-decision="approved"/);
    assert.match(managementDashboardJs, /data-decision="rejected"/);
});

test("management dashboard stays behind auth gate", () => {
    assert.match(managementDashboardHtml, /window\.__WATERAPPS_PORTAL_AUTH_STATUS/);
    assert.match(managementDashboardHtml, /data-portal-auth/);
    assert.match(managementDashboardHtml, /dashboardMetaRedirect/);
});
