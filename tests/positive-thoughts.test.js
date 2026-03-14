const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SCRIPT_PATH = path.join(__dirname, "..", "assets", "js", "positive-thoughts.js");
const SOURCE = fs.readFileSync(SCRIPT_PATH, "utf8");

function loadHelpers(overrides = {}) {
    const windowObject = overrides.window || {};
    const context = {
        window: windowObject,
        document: overrides.document || {
            getElementById() {
                return null;
            }
        },
        Math,
        JSON,
        console
    };

    vm.createContext(context);
    vm.runInContext(SOURCE, context, { filename: "assets/js/positive-thoughts.js" });
    return windowObject.WaterAppsPositiveThoughtsHelpers;
}

test("positive thought helpers are exposed for unit validation", () => {
    const helpers = loadHelpers();
    assert.ok(helpers);
    assert.equal(typeof helpers.buildPositiveThoughtsCollection, "function");
    assert.equal(typeof helpers.getStorageState, "function");
    assert.equal(typeof helpers.getQuoteIndex, "function");
    assert.equal(Array.isArray(helpers.VISUAL_SOURCES), true);
    assert.equal(helpers.VISUAL_SOURCES.length >= 3, true);
});

test("buildPositiveThoughtsCollection returns 1200 unique original thoughts", () => {
    const helpers = loadHelpers();
    const collection = helpers.buildPositiveThoughtsCollection(1200);

    assert.equal(collection.length, 1200);
    assert.equal(new Set(collection.map((item) => item.text)).size, 1200);
    assert.match(collection[0].source, /WaterApps original positive thoughts collection/);
});

test("getStorageState falls back safely when localStorage is unavailable", () => {
    const helpers = loadHelpers();
    const state = helpers.getStorageState(null, 1200);

    assert.equal(state.seed, 0);
    assert.equal(state.seenCount, 0);
});

test("getStorageState reads stored seed and seenCount when present", () => {
    const helpers = loadHelpers();
    const storage = {
        getItem() {
            return JSON.stringify({ seed: 77, seenCount: 8 });
        }
    };

    const state = helpers.getStorageState(storage, 1200);

    assert.equal(state.seed, 77);
    assert.equal(state.seenCount, 8);
});

test("getQuoteIndex rotates through the collection using seed plus seen count", () => {
    const helpers = loadHelpers();
    const index = helpers.getQuoteIndex({ seed: 1198, seenCount: 5 }, 1200);

    assert.equal(index, 3);
});
