const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SCRIPT_PATH = path.join(__dirname, "..", "assets", "js", "index.js");
const SOURCE = fs.readFileSync(SCRIPT_PATH, "utf8");

function loadBookingHelpers() {
    const windowObject = {};
    const context = {
        window: windowObject,
        document: {
            getElementById() {
                return null;
            },
            querySelectorAll() {
                return [];
            }
        },
        URL,
        Intl,
        Date,
        console
    };

    vm.createContext(context);
    vm.runInContext(SOURCE, context, { filename: "assets/js/index.js" });
    return windowObject.WaterAppsBookingHelpers;
}

test("booking helpers are exposed for unit validation", () => {
    const helpers = loadBookingHelpers();
    assert.ok(helpers);
    assert.equal(typeof helpers.localDateKeyFromDate, "function");
    assert.equal(typeof helpers.filterSlotsByLocalDate, "function");
    assert.equal(typeof helpers.createAvailabilityRequestUrl, "function");
});

test("createAvailabilityRequestUrl defaults to 7-day window without a selected date", () => {
    const helpers = loadBookingHelpers();
    const built = new URL(
        helpers.createAvailabilityRequestUrl(
            "https://roatlihulb.execute-api.ap-southeast-2.amazonaws.com/availability",
            ""
        )
    );

    assert.equal(built.origin, "https://roatlihulb.execute-api.ap-southeast-2.amazonaws.com");
    assert.equal(built.pathname, "/availability");
    assert.equal(built.searchParams.get("days"), "7");
    assert.equal(built.searchParams.get("date"), null);
});

test("createAvailabilityRequestUrl requests 14-day window when date is selected", () => {
    const helpers = loadBookingHelpers();
    const built = new URL(
        helpers.createAvailabilityRequestUrl(
            "https://roatlihulb.execute-api.ap-southeast-2.amazonaws.com/availability",
            "2026-03-05"
        )
    );

    assert.equal(built.searchParams.get("days"), "14");
    assert.equal(built.searchParams.get("date"), "2026-03-05");
});

test("filterSlotsByLocalDate filters by local date key and ignores invalid slots", () => {
    const helpers = loadBookingHelpers();
    const slots = [
        { slotStart: "2026-03-05T01:00:00Z" },
        { slotStart: "2026-03-06T02:00:00Z" },
        { slotStart: "not-a-date" }
    ];
    const expectedDate = helpers.localDateKeyFromDate(new Date("2026-03-05T01:00:00Z"));

    const filtered = helpers.filterSlotsByLocalDate(slots, expectedDate);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].slotStart, "2026-03-05T01:00:00Z");
});

test("filterSlotsByLocalDate returns all slots when no date selected", () => {
    const helpers = loadBookingHelpers();
    const slots = [
        { slotStart: "2026-03-05T01:00:00Z" },
        { slotStart: "2026-03-06T02:00:00Z" }
    ];

    const filtered = helpers.filterSlotsByLocalDate(slots, "");

    assert.deepEqual(filtered, slots);
});
