const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const INDEX_PATH = path.join(__dirname, "..", "index.html");
const INDEX_JS_PATH = path.join(__dirname, "..", "assets", "js", "index.js");
const SCHEDULEASE_PATH = path.join(__dirname, "..", "schedulease.html");

const indexHtml = fs.readFileSync(INDEX_PATH, "utf8");
const indexJs = fs.readFileSync(INDEX_JS_PATH, "utf8");
const scheduleaseHtml = fs.readFileSync(SCHEDULEASE_PATH, "utf8");

test("homepage includes client recommendation carousel", () => {
    assert.match(indexHtml, /id="recommendation-carousel"/);
    assert.match(indexHtml, /data-recommendation-slide/);
    assert.match(indexHtml, /id="recommendation-prev"/);
    assert.match(indexHtml, /id="recommendation-next"/);
    assert.match(indexJs, /setupRecommendationCarousel/);
    assert.match(indexJs, /recommendation_carousel_navigate/);
});

test("homepage exposes productized offer path with SchedulEase link", () => {
    assert.match(indexHtml, /id="products"/);
    assert.match(indexHtml, /Book SchedulEase Demo/);
    assert.match(indexHtml, /href="schedulease\.html"/);
    assert.match(indexJs, /cta_type:\s*'schedulease_offer'/);
});

test("SchedulEase offer page exists with conversion CTA", () => {
    assert.match(scheduleaseHtml, /<h1[^>]*>\s*SchedulEase\s*<\/h1>/);
    assert.match(scheduleaseHtml, /Book SchedulEase Demo/);
    assert.match(scheduleaseHtml, /href="index\.html#contact"/);
});
