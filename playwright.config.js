const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/e2e",
    timeout: 30_000,
    expect: {
        timeout: 10_000
    },
    retries: process.env.CI ? 1 : 0,
    fullyParallel: true,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
    use: {
        baseURL: "http://127.0.0.1:4173",
        trace: "on-first-retry"
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        }
    ],
    webServer: {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});

