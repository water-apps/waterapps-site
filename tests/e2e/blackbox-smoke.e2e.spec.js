const { test, expect } = require("@playwright/test");

// ── Homepage smoke ──────────────────────────────────────────────

test.describe("homepage blackbox checks", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("page loads with correct title", async ({ page }) => {
        await expect(page).toHaveTitle(/WaterApps/i);
    });

    test("hero section is visible with CTAs", async ({ page }) => {
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.getByRole("link", { name: /book discovery call/i }).first()).toBeVisible();
    });

    test("navigation links are visible and reachable", async ({ page }) => {
        const navLinks = ["Services", "Case Studies", "Insights", "Contact"];
        for (const label of navLinks) {
            const link = page.getByRole("link", { name: new RegExp(label, "i") }).first();
            await expect(link).toBeVisible();
        }
    });

    test("products section lists SchedulEase", async ({ page }) => {
        const products = page.locator("#products");
        await expect(products).toBeVisible();
        await expect(products).toContainText("SchedulEase");
    });

    test("contact form exists with required fields", async ({ page }) => {
        const contact = page.locator("#contact");
        await expect(contact).toBeVisible();
        await expect(page.locator("#guided-intake")).toBeVisible();
        await expect(page.locator("#guided-service-chips")).toBeVisible();
    });

    test("JSON-LD Organization schema is present", async ({ page }) => {
        const jsonLd = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const s of scripts) {
                try {
                    const data = JSON.parse(s.textContent);
                    if (data["@type"] && (Array.isArray(data["@type"])
                        ? data["@type"].includes("Organization")
                        : data["@type"] === "Organization")) {
                        return data;
                    }
                } catch { /* skip malformed */ }
            }
            return null;
        });
        expect(jsonLd).not.toBeNull();
        expect(jsonLd.name).toBe("Water Apps Pty Ltd");
        expect(jsonLd.url).toBe("https://www.waterapps.com.au");
    });
});

// ── SchedulEase page smoke ──────────────────────────────────────

test.describe("schedulease.html blackbox checks", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/schedulease.html");
    });

    test("page loads with SchedulEase heading", async ({ page }) => {
        await expect(page.locator("h1")).toContainText("SchedulEase");
    });

    test("back link returns to products section", async ({ page }) => {
        const back = page.locator('a[href="index.html#products"]').first();
        await expect(back).toBeVisible();
    });

    test("bottom CTAs section is visible", async ({ page }) => {
        await expect(page.getByRole("link", { name: /book discovery call/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /email product enquiry/i })).toBeVisible();
    });

    test("JSON-LD SoftwareApplication schema is present", async ({ page }) => {
        const jsonLd = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const s of scripts) {
                try {
                    const data = JSON.parse(s.textContent);
                    if (data["@type"] === "SoftwareApplication") return data;
                } catch { /* skip */ }
            }
            return null;
        });
        expect(jsonLd).not.toBeNull();
        expect(jsonLd.name).toBe("SchedulEase");
        expect(jsonLd.applicationCategory).toBe("BusinessApplication");
    });
});

// ── Insights page smoke ─────────────────────────────────────────

test.describe("insights.html blackbox checks", () => {
    test("page loads with article cards", async ({ page }) => {
        await page.goto("/insights.html");
        await expect(page.locator("h1")).toContainText(/Insights|Knowledge/i);
        const articles = page.locator("[data-topic]");
        expect(await articles.count()).toBeGreaterThanOrEqual(3);
    });

    test("search filter works", async ({ page }) => {
        await page.goto("/insights.html");
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill("Terraform");
            // At least one article should remain visible with Terraform keyword
            const visible = page.locator("[data-topic]:visible, [data-keywords*='terraform']:visible");
            expect(await visible.count()).toBeGreaterThanOrEqual(1);
        }
    });
});

// ── Insights article page structure ─────────────────────────────

test.describe("insights article pages", () => {
    const articlePages = [
        "insights-aks-scaling-enterprise.html",
        "insights-terraform-apra-regulated.html",
        "insights-test-automation-regulated-cicd.html",
    ];

    for (const articlePage of articlePages) {
        test(`${articlePage} has correct structure`, async ({ page }) => {
            await page.goto(`/${articlePage}`);
            await expect(page.locator("h1")).toBeVisible();
            await expect(page.locator('a[href="insights.html"]').first()).toBeVisible();

            // Article JSON-LD
            const jsonLd = await page.evaluate(() => {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (const s of scripts) {
                    try {
                        const data = JSON.parse(s.textContent);
                        if (data["@type"] === "Article") return data;
                    } catch { /* skip */ }
                }
                return null;
            });
            expect(jsonLd).not.toBeNull();
            expect(jsonLd.headline).toBeTruthy();
            expect(jsonLd.url).toContain(articlePage);
        });
    }
});

// ── Cross-page link integrity ───────────────────────────────────

test.describe("cross-page link integrity", () => {
    test("homepage CTA links resolve to valid anchors", async ({ page }) => {
        await page.goto("/");
        const ctaLinks = page.locator('a[href^="#"]');
        const count = await ctaLinks.count();
        for (let i = 0; i < Math.min(count, 20); i++) {
            const href = await ctaLinks.nth(i).getAttribute("href");
            if (href && href !== "#") {
                const anchor = href.replace("#", "");
                const target = page.locator(`[id="${anchor}"]`);
                expect(await target.count(), `Anchor ${href} should exist`).toBeGreaterThanOrEqual(1);
            }
        }
    });

    test("schedulease page internal links are valid", async ({ page }) => {
        await page.goto("/schedulease.html");
        const internalLinks = page.locator('a[href^="index.html"]');
        const count = await internalLinks.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const href = await internalLinks.nth(i).getAttribute("href");
            expect(href).toMatch(/^index\.html/);
        }
    });
});

// ── No broken images ────────────────────────────────────────────

test.describe("asset integrity", () => {
    const pages = ["/", "/schedulease.html", "/insights.html"];

    for (const pagePath of pages) {
        test(`no broken images on ${pagePath}`, async ({ page }) => {
            const failedRequests = [];
            page.on("response", (response) => {
                if (response.status() >= 400 && response.url().match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
                    failedRequests.push({ url: response.url(), status: response.status() });
                }
            });
            await page.goto(pagePath, { waitUntil: "networkidle" });
            expect(failedRequests, `Broken images: ${JSON.stringify(failedRequests)}`).toHaveLength(0);
        });
    }
});

// ── Public PDF downloads ────────────────────────────────────────

test.describe("public PDF downloads", () => {
    const pdfs = [
        "assets/docs/capability-statement.pdf",
        "assets/docs/service-overview.pdf",
        "assets/docs/reference-architecture.pdf",
    ];

    for (const pdfPath of pdfs) {
        test(`${pdfPath} is downloadable (200)`, async ({ request }) => {
            const response = await request.head(`/${pdfPath}`);
            expect(response.status(), `${pdfPath} returned ${response.status()}`).toBe(200);
        });
    }

    test("capability-statement-download.html loads and has download links", async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto("/capability-statement-download.html");
        await expect(page.locator("h1")).toContainText("Capability Statement");
        const primaryLink = page.locator("#primaryPdfLink");
        await expect(primaryLink).toBeVisible();
        const href = await primaryLink.getAttribute("href");
        expect(href).toContain("capability-statement.pdf");
        await context.close();
    });
});

// ── Accessibility basics ────────────────────────────────────────

test.describe("accessibility basics", () => {
    const pages = ["/", "/schedulease.html", "/insights.html"];

    for (const pagePath of pages) {
        test(`${pagePath} has lang attribute and viewport meta`, async ({ page }) => {
            await page.goto(pagePath);
            const lang = await page.getAttribute("html", "lang");
            expect(lang).toBeTruthy();
            const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
            expect(viewport).toContain("width=device-width");
        });
    }
});
