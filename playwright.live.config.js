const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright config for running blackbox smoke tests against the live site.
 * Used by the live-smoke.yml workflow and local `npx playwright test --config=playwright.live.config.js`.
 * Only runs tests tagged with @blackbox or in the blackbox-smoke spec file.
 */
module.exports = defineConfig({
    testDir: "./tests/e2e",
    testMatch: "blackbox-smoke.e2e.spec.js",
    timeout: 30_000,
    expect: {
        timeout: 15_000
    },
    retries: 2,
    fullyParallel: true,
    reporter: [["html", { open: "never" }]],
    use: {
        baseURL: "https://www.waterapps.com.au",
        trace: "on-first-retry",
        screenshot: "only-on-failure"
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        },
        {
            name: "mobile",
            use: { ...devices["iPhone 14"] }
        }
    ]
});
