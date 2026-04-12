const { test, expect } = require("@playwright/test");

const availabilitySlots = [
    {
        slotStart: "2030-04-02T01:00:00Z",
        slotEnd: "2030-04-02T01:30:00Z"
    },
    {
        slotStart: "2030-04-03T02:00:00Z",
        slotEnd: "2030-04-03T02:30:00Z"
    }
];

test("booking flow supports native scheduler with Google Calendar fallback", async ({ page }) => {
    const availabilityCalls = [];
    let bookingPayload = null;

    await page.route("**/availability**", async (route) => {
        availabilityCalls.push(new URL(route.request().url()));
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ slots: availabilitySlots })
        });
    });

    await page.route("**/booking", async (route) => {
        bookingPayload = route.request().postDataJSON();
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ message: "Booking request submitted successfully." })
        });
    });

    await page.goto("/#contact");

    const fallbackLink = page.locator('a[href="https://calendar.app.google/MaHkjyQHyDLd5qPw5"]');
    await expect(fallbackLink).toHaveCount(1);
    await expect(fallbackLink).toHaveAttribute("target", "_blank");
    await expect(fallbackLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator("#booking-timezone-summary")).toContainText("Slots are shown in your selected timezone:");

    await expect(page.locator('#booking-slot option[value="2030-04-02T01:00:00Z"]')).toHaveCount(1);
    await expect.poll(() => availabilityCalls.length).toBeGreaterThan(0);
    expect(availabilityCalls[0].searchParams.get("days")).toBe("7");

    const initialOptionText = await page.locator('#booking-slot option[value="2030-04-02T01:00:00Z"]').textContent();
    await page.fill("#booking-timezone", "America/New_York");
    await page.dispatchEvent("#booking-timezone", "change");
    const updatedOptionText = await page.locator('#booking-slot option[value="2030-04-02T01:00:00Z"]').textContent();
    expect(updatedOptionText).not.toBe(initialOptionText);
    await expect(page.locator("#booking-timezone-summary")).toContainText("America/New_York");

    await page.fill("#booking-date", "2030-04-03");
    await page.dispatchEvent("#booking-date", "change");
    await expect.poll(() => availabilityCalls.length).toBeGreaterThan(1);
    expect(availabilityCalls[availabilityCalls.length - 1].searchParams.get("days")).toBe("14");
    expect(availabilityCalls[availabilityCalls.length - 1].searchParams.get("date")).toBe("2030-04-03");

    await page.fill("#booking-name", "Test User");
    await page.fill("#booking-email", "test.user@example.com");
    await page.fill("#booking-company", "WaterApps QA");
    await page.selectOption("#booking-slot", "2030-04-03T02:00:00Z");
    await page.fill("#booking-notes", "Playwright booking regression test");
    await page.click("#booking-submit");

    await expect(page.locator("#booking-form-status")).toContainText("Booking request submitted successfully.");
    expect(bookingPayload).not.toBeNull();
    expect(bookingPayload.name).toBe("Test User");
    expect(bookingPayload.email).toBe("test.user@example.com");
    expect(bookingPayload.slotStart).toBe("2030-04-03T02:00:00Z");
});

test("contact form submits successfully", async ({ page }) => {
    let contactPayload = null;

    await page.route("**/availability**", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ slots: availabilitySlots })
        });
    });

    await page.route("**/contact", async (route) => {
        contactPayload = route.request().postDataJSON();
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ message: "Thank you for contacting WaterApps. We'll be in touch shortly." })
        });
    });

    await page.goto("/#contact");

    // Step 1: Select a service chip
    await page.locator('#guided-service-chips [data-chip]').first().click();

    // Step 2: Select an industry chip
    await page.locator('#guided-industry-chips [data-chip]').first().click();

    // Step 3: Fill contact details
    await page.fill("#guided-name", "Contact Test");
    await page.fill("#guided-email", "contact.test@example.com");
    await page.fill("#guided-company", "QA Org");
    await page.fill("#guided-phone", "+61400000000");
    await page.fill("#guided-challenge", "Playwright contact regression test.");
    await page.click("#guided-submit");

    await expect(page.locator("#guided-step-3")).toContainText("Enquiry received");
    expect(contactPayload).not.toBeNull();
    expect(contactPayload.name).toBe("Contact Test");
    expect(contactPayload.email).toBe("contact.test@example.com");
});
