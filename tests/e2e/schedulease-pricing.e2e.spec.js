const { test, expect } = require("@playwright/test");

test.describe("SchedulEase pricing page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/schedulease.html");
    });

    test("pricing section exists and is visible", async ({ page }) => {
        const pricing = page.locator("#pricing");
        await expect(pricing).toBeVisible();
        await expect(pricing.locator("h2")).toHaveText("Pricing");
    });

    test("displays all three pricing tiers", async ({ page }) => {
        const cards = page.locator("#pricing .grid > div");
        await expect(cards).toHaveCount(3);

        const tierNames = page.locator("#pricing h3");
        await expect(tierNames.nth(0)).toHaveText("Starter");
        await expect(tierNames.nth(1)).toHaveText("Growth");
        await expect(tierNames.nth(2)).toHaveText("Enterprise");
    });

    test("Starter tier shows $0 / month", async ({ page }) => {
        const starter = page.locator("#pricing .grid > div").first();
        const price = starter.locator("p.text-3xl");
        await expect(price).toContainText("$0");
        await expect(price).toContainText("/ month");
        await expect(starter).toContainText("Free forever");
    });

    test("Growth tier shows $49 / month with Most Popular badge", async ({ page }) => {
        const growth = page.locator("#pricing .grid > div").nth(1);
        const price = growth.locator("p.text-3xl");
        await expect(price).toContainText("$49");
        await expect(price).toContainText("/ month");
        await expect(growth.locator("span.bg-blue-600")).toHaveText("Most Popular");
    });

    test("Enterprise tier shows Custom pricing", async ({ page }) => {
        const enterprise = page.locator("#pricing .grid > div").nth(2);
        const price = enterprise.locator("p.text-3xl");
        await expect(price).toHaveText("Custom");
        await expect(enterprise).toContainText("Tailored to your organization");
    });

    test("each tier has correct feature count", async ({ page }) => {
        const cards = page.locator("#pricing .grid > div");
        for (let i = 0; i < 3; i++) {
            const features = cards.nth(i).locator("ul li");
            await expect(features).toHaveCount(4);
        }
    });

    test("Starter features match product spec", async ({ page }) => {
        const starter = page.locator("#pricing .grid > div").first();
        await expect(starter).toContainText("Single meeting type");
        await expect(starter).toContainText("1 connected calendar");
        await expect(starter).toContainText("Email notifications");
        await expect(starter).toContainText("Timezone-aware booking");
    });

    test("Growth features match product spec", async ({ page }) => {
        const growth = page.locator("#pricing .grid > div").nth(1);
        await expect(growth).toContainText("Multiple meeting types");
        await expect(growth).toContainText("Team calendars");
        await expect(growth).toContainText("Custom intake fields");
        await expect(growth).toContainText("Analytics dashboard");
    });

    test("Enterprise features match product spec", async ({ page }) => {
        const enterprise = page.locator("#pricing .grid > div").nth(2);
        await expect(enterprise).toContainText("Multi-tenant rollout");
        await expect(enterprise).toContainText("SSO & RBAC");
        await expect(enterprise).toContainText("Dedicated support");
        await expect(enterprise).toContainText("Environment governance");
    });

    test("all CTA buttons link to contact form", async ({ page }) => {
        const ctas = page.locator('#pricing a[href="index.html#contact"]');
        await expect(ctas).toHaveCount(3);

        await expect(ctas.nth(0)).toContainText("Start Free Trial");
        await expect(ctas.nth(1)).toContainText("Get Started");
        await expect(ctas.nth(2)).toContainText("Contact Sales");
    });

    test("Growth tier has visual emphasis (blue border)", async ({ page }) => {
        const growth = page.locator("#pricing .grid > div").nth(1);
        await expect(growth).toHaveClass(/border-blue-600/);
        await expect(growth).toHaveClass(/border-2/);
    });

    test("pricing cards are responsive — 3 columns on desktop", async ({ page }) => {
        const grid = page.locator("#pricing .grid");
        await expect(grid).toHaveClass(/md:grid-cols-3/);
    });
});
