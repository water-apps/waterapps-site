const { test, expect } = require("@playwright/test");

test("website guide recommends a path and prefills the contact brief", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /find the right path/i }).click();
    await expect(page.getByRole("heading", { name: /let me guide you to the right waterapps path/i })).toBeVisible();

    await page.getByRole("button", { name: "Website or lightweight workflow" }).click();
    await page.getByRole("button", { name: "Lead capture and website guidance" }).click();

    await expect(page.getByRole("heading", { name: /guided website assistant/i })).toBeVisible();

    await page.getByRole("button", { name: /send a guided website enquiry/i }).click();

    await expect(page.locator("#contact-message")).toHaveValue(/Website Guide summary/);
    await expect(page.locator("#contact-message")).toHaveValue(/guided website assistant and lead qualification/i);
});
