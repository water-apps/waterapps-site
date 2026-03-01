const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    timeout: 30_000,
    expect: {
        timeout: 10_000
    },
    use: {
        headless: true,
        trace: "retain-on-failure"
    }
});
