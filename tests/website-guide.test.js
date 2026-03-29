const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const guideHelpers = require(path.join(__dirname, "..", "assets", "js", "site-guide.js"));

test("start step exposes the top-level guidance choices", () => {
    const step = guideHelpers.getGuideStep("start");

    assert.equal(step.id, "start");
    assert.ok(step.choices.length >= 6);
    assert.ok(step.choices.some((choice) => choice.id === "site_tour"));
    assert.ok(step.choices.some((choice) => choice.id === "intelligent_products"));
});

test("site tour branch leads to a tour recommendation", () => {
    const firstResolution = guideHelpers.resolveGuideChoice("start", "site_tour");
    assert.equal(firstResolution.nextStepId, "site_tour");
    assert.equal(firstResolution.recommendation, null);

    const secondResolution = guideHelpers.resolveGuideChoice("site_tour", "tour_proof");
    assert.equal(secondResolution.nextStepId, null);
    assert.equal(secondResolution.recommendation.id, "site_tour_proof");
    assert.match(secondResolution.recommendation.title, /proof/i);
});

test("website workflow branch recommends the guide product path", () => {
    const resolution = guideHelpers.resolveGuideChoice("website_workflows", "lead_capture");

    assert.equal(resolution.nextStepId, null);
    assert.equal(resolution.recommendation.id, "website_guide_product");
    assert.equal(resolution.recommendation.primaryAction.href, "#contact");
});

test("guide brief builds a contact-ready summary", () => {
    const brief = guideHelpers.buildGuideBrief("website_guide_product", [
        { label: "Website or lightweight workflow" },
        { label: "Lead capture and website guidance" }
    ]);

    assert.match(brief, /Website Guide summary/);
    assert.match(brief, /guided website assistant/i);
    assert.match(brief, /Lead capture and website guidance/);
    assert.match(brief, /Please contact me about this path\./);
});
