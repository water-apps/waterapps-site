const { test, expect } = require("@playwright/test");

function createJwt(payload) {
    const encode = (value) =>
        Buffer.from(JSON.stringify(value), "utf8")
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");
    return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;
}

test.describe("management dashboard moderation", () => {
    async function runModerationDecisionFlow(context, page, decision) {
        const expiresAt = Math.floor(Date.now() / 1000) + 3600;
        const idToken = createJwt({ email: "qa.tester@waterapps.com.au" });
        const calls = [];

        await context.addInitScript(({ token, expires }) => {
            window.prompt = () => "";
            window.sessionStorage.setItem(
                "waterapps.portal.tokens",
                JSON.stringify({
                    id_token: token,
                    access_token: "access-token",
                    expires_at: expires
                })
            );
        }, { token: idToken, expires: expiresAt });

        await page.route("**/reviews?status=pending&limit=25", async (route) => {
            calls.push({ method: route.request().method(), url: route.request().url() });
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    reviews: [
                        {
                            review_id: "review-001",
                            created_at: "2026-03-01T10:00:00Z",
                            name: "Test User",
                            email: "test.user@example.com",
                            role: "Engineering Manager",
                            company: "WaterApps",
                            linkedin: "https://www.linkedin.com/in/test-user",
                            rating: "5",
                            review: "Strong delivery and quality outcomes."
                        }
                    ]
                })
            });
        });

        await page.route("**/reviews/*/moderate", async (route) => {
            const request = route.request();
            const body = request.postDataJSON();
            calls.push({ method: request.method(), url: request.url(), body });
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    message: "moderated",
                    review_id: "review-001",
                    decision: body.decision
                })
            });
        });

        await page.goto("/management-dashboard.html");

        await expect(page.locator("#reviews-moderation")).toBeVisible();
        await expect(page.locator("#reviewsModerationList article[data-review-id='review-001']")).toBeVisible();
        await expect(page.locator("#portalUserChip")).toContainText("qa.tester@waterapps.com.au");

        const buttonName = decision === "approved" ? "Approve" : "Reject";
        await page.getByRole("button", { name: buttonName }).click();
        await expect.poll(() => {
            return calls.filter((entry) => entry.method === "POST" && entry.url.includes("/reviews/review-001/moderate")).length;
        }).toBe(1);

        const moderationCall = calls.find((entry) => entry.method === "POST" && entry.url.includes("/reviews/review-001/moderate"));
        expect(moderationCall).toBeTruthy();
        expect(moderationCall.body).toMatchObject({
            decision: decision,
            note: ""
        });

        await expect.poll(() => {
            return calls.filter((entry) => entry.method === "GET" && entry.url.includes("/reviews?status=pending&limit=25")).length;
        }).toBeGreaterThanOrEqual(2);
    }

    test("renders pending reviews and approves a submission", async ({ context, page }) => {
        await runModerationDecisionFlow(context, page, "approved");
    });

    test("renders pending reviews and rejects a submission", async ({ context, page }) => {
        await runModerationDecisionFlow(context, page, "rejected");
    });

    test("renders unsafe linkedin URLs as non-clickable text", async ({ context, page }) => {
        const expiresAt = Math.floor(Date.now() / 1000) + 3600;
        const idToken = createJwt({ email: "qa.tester@waterapps.com.au" });

        await context.addInitScript(({ token, expires }) => {
            window.sessionStorage.setItem(
                "waterapps.portal.tokens",
                JSON.stringify({
                    id_token: token,
                    access_token: "access-token",
                    expires_at: expires
                })
            );
        }, { token: idToken, expires: expiresAt });

        await page.route("**/reviews?status=pending&limit=25", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    reviews: [
                        {
                            review_id: "review-unsafe-link",
                            created_at: "2026-03-01T10:00:00Z",
                            name: "Unsafe Link Tester",
                            email: "unsafe@example.com",
                            role: "Reviewer",
                            company: "WaterApps",
                            linkedin: "javascript:alert(1)",
                            rating: "5",
                            review: "Checks unsafe link handling."
                        }
                    ]
                })
            });
        });

        await page.goto("/management-dashboard.html");

        const unsafeCard = page.locator("#reviewsModerationList article[data-review-id='review-unsafe-link']");
        await expect(unsafeCard).toBeVisible();
        await expect(unsafeCard.getByRole("link", { name: "LinkedIn profile" })).toHaveCount(0);
        await expect(unsafeCard).toContainText("LinkedIn profile unavailable");
    });
});
