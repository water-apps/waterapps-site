const { test, expect } = require("@playwright/test");

test.describe("portal login auth flows", () => {
    test("redirects unauthenticated user from dashboard to portal login", async ({ page }) => {
        await page.goto("/management-dashboard.html");
        await expect(page).toHaveURL(/\/portal-login\.html$/);
    });

    test("allows preview password login on non-production host", async ({ page }) => {
        await page.goto("/portal-login.html");

        await page.fill("#email", "varun@waterapps.com.au");
        await page.fill("#password", "StrongPassword123");
        await page.click("#passwordLoginSubmitBtn");

        await expect(page).toHaveURL(/\/management-dashboard\.html$/);
        await expect(page.locator("#portalUserChip")).toContainText("varun@waterapps.com.au");
        await expect(page.locator("#reviewsModerationStatus")).toContainText("Preview password login is active");
    });

    test("rejects preview password login for non-approved email domains", async ({ page }) => {
        await page.goto("/portal-login.html");

        await page.fill("#email", "test@example.com");
        await page.fill("#password", "StrongPassword123");
        await page.click("#passwordLoginSubmitBtn");

        await expect(page).toHaveURL(/\/portal-login\.html$/);
        await expect(page.locator("#formMessage")).toContainText("Email domain not allowed for preview login");
    });
});
