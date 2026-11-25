import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
	DEFAULT_FILTERS,
	FILTERS_VERSION,
	readFilters,
	filtersText,
	type AuthoredFilters,
} from "../periodic-table/authored-filters";
import {
	INTERFACE_LOCK_OPTIONS,
	UNLOCKED_INTERFACE,
	hidesRegion,
	ribbonAvailable,
	type InterfaceLockKey,
	type InterfaceLocks,
} from "../periodic-table/interface-locks";
import {
	DEFAULT_MODE_STATE,
	DISCOVERY_RANGE,
	ELECTRONEGATIVITY_RANGE,
	HALF_LIFE_RANGE,
	IONIZATION_RANGE,
	RADIUS_RANGE,
	TEMPERATURE_SLIDER,
	kelvinFromCelsius,
} from "../periodic-table/phase";

const source = readFileSync("webwriter-chemlab-periodic-table.ts", "utf8");
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
	editingConfig: Record<string, { content?: string }>;
};
const regions = Object.keys(INTERFACE_LOCK_OPTIONS) as InterfaceLockKey[];
const allLocked: InterfaceLocks = Object.fromEntries(regions.map(region => [region, true])) as InterfaceLocks;

/** Every region a teacher can lock, with the attribute that carries it. */
const ATTRIBUTES: Record<InterfaceLockKey, string> = {
	hideFilters: "hide-filters",
	hideModes: "hide-modes",
	hideLayoutSwitch: "hide-layout-switch",
	hideInfo: "hide-info",
};

/**
 * The filters and the locks of the periodic table share one document.
 *
 * A teacher prepares a narrowed table and publishes it, so the filters belong to
 * the widget document and not to the session of whoever opens it. The locks are
 * options of the same menu; they take regions away from learners while the
 * authoring view keeps them. These checks hold the stored shape, the
 * normalization of a hand-edited block and the wiring in the widget.
 */

test("the stored filters keep their version and read back unchanged", () => {
	const authored: AuthoredFilters = {
		query: "eisen",
		category: "transition-metal",
		mode: {
			mode: "temperature",
			temperatureK: 1200,
			year: 1850,
			radiusPm: 140,
			electronegativity: 2.1,
			ionizationEv: 9.4,
			halfLifeLogSeconds: 12.5,
		},
	};
	const text = filtersText(authored);
	const stored = JSON.parse(text) as { version: number };
	assert.equal(stored.version, FILTERS_VERSION);
	assert.deepEqual(readFilters(stored), authored);
	assert.equal(filtersText(readFilters(stored)), text);
	// The plain table is a valid document as well.
	assert.deepEqual(readFilters(JSON.parse(filtersText(DEFAULT_FILTERS))), DEFAULT_FILTERS);
});

test("a broken or outdated block falls back instead of emptying the table", () => {
	assert.deepEqual(readFilters(undefined), DEFAULT_FILTERS);
	assert.deepEqual(readFilters(null), DEFAULT_FILTERS);
	assert.deepEqual(readFilters("eisen"), DEFAULT_FILTERS);
	assert.deepEqual(readFilters(42), DEFAULT_FILTERS);
	// An unknown family means every family, an unknown mode means `off`.
	assert.deepEqual(readFilters({ query: "eisen", category: "unobtainium" }), { ...DEFAULT_FILTERS, query: "eisen" });
	assert.deepEqual(readFilters({ mode: { mode: "density" } }), DEFAULT_FILTERS);
	// A missing query is not a search for anything.
	assert.deepEqual(readFilters({ category: null }), DEFAULT_FILTERS);
});

test("thresholds outside their range are clamped to the slider", () => {
	const low = readFilters({ mode: { mode: "halfLife", halfLifeLogSeconds: -99, year: -5, radiusPm: 0 } });
	assert.equal(low.mode.mode, "halfLife");
	assert.equal(low.mode.halfLifeLogSeconds, HALF_LIFE_RANGE.min);
	assert.equal(low.mode.year, DISCOVERY_RANGE.min);
	assert.equal(low.mode.radiusPm, RADIUS_RANGE.min);
	const high = readFilters({
		mode: { mode: "radius", halfLifeLogSeconds: 99, year: 3000, radiusPm: 9999, electronegativity: 40, ionizationEv: 900, temperatureK: 1e9 },
	});
	assert.equal(high.mode.year, DISCOVERY_RANGE.max);
	assert.equal(high.mode.radiusPm, RADIUS_RANGE.max);
	assert.equal(high.mode.electronegativity, ELECTRONEGATIVITY_RANGE.max);
	assert.equal(high.mode.ionizationEv, IONIZATION_RANGE.max);
	assert.equal(high.mode.temperatureK, kelvinFromCelsius(TEMPERATURE_SLIDER.maxCelsius));
	const mixed = readFilters({ mode: { mode: "temperature", temperatureK: "warm" } });
	assert.equal(mixed.mode.temperatureK, DEFAULT_MODE_STATE.temperatureK);
	assert.equal(mixed.mode.year, DEFAULT_MODE_STATE.year);
});

test("interface locks hide each region only outside authoring", () => {
	assert.deepEqual(regions, ["hideFilters", "hideModes", "hideLayoutSwitch", "hideInfo"]);
	for (const region of regions) {
		assert.equal(UNLOCKED_INTERFACE[region], false, region);
		assert.equal(hidesRegion(region, UNLOCKED_INTERFACE, false), false, region);
		assert.equal(hidesRegion(region, allLocked, false), true, region);
		// The teacher fills the widget, so a lock never takes a region from them.
		assert.equal(hidesRegion(region, allLocked, true), false, region);
	}
});

test("the ribbon disappears only when all three of its groups are locked", () => {
	assert.equal(ribbonAvailable(false, false, false), true);
	assert.equal(ribbonAvailable(true, false, false), true);
	assert.equal(ribbonAvailable(false, true, false), true);
	assert.equal(ribbonAvailable(false, false, true), true);
	assert.equal(ribbonAvailable(true, true, false), true);
	assert.equal(ribbonAvailable(true, false, true), true);
	assert.equal(ribbonAvailable(false, true, true), true);
	assert.equal(ribbonAvailable(true, true, true), false);
});

test("every interface switch carries its own boolean option and attribute", () => {
	for (const region of regions) {
		const option = INTERFACE_LOCK_OPTIONS[region];
		assert.equal(option.type, "boolean", region);
		assert.equal(option.group, "interface", region);
		assert.equal(option.attribute, ATTRIBUTES[region], region);
		assert.ok(option.label._, region);
		assert.ok(option.label["de-DE"], region);
		assert.ok(option.description._, region);
		assert.ok(option.description["de-DE"], region);
	}
});

test("the table publishes the options and reads the stored filters", () => {
	assert.match(source, /\.\.\.INTERFACE_LOCK_OPTIONS/);
	assert.match(source, /interface: \{ label: \{ _: "Learner interface"/);
	assert.match(source, /get canAuthor\(\): boolean/);
	assert.match(source, /attributeFilter: \["class", "contenteditable"\]/);
	assert.match(source, /if \(!this\.canAuthor \|\| !this\.isConnected\) return;/);
	assert.match(source, /:scope > script\[type="application\/json"\]\[slot="data"\]/);
	assert.match(source, /block\.dataset\.chemlabRevision/);
	assert.match(source, /this\.#restoreFilters\(\);/);
	for (const region of regions) {
		assert.match(source, new RegExp(`accessor ${region} = false`), region);
		assert.match(source, new RegExp(`this\\.#hides\\("${region}"\\)`), region);
	}
	// Search, family filter, mode chips, six sliders and both resets reach the
	// document; a table that never changes a filter writes nothing.
	assert.ok(source.match(/this\.#schedulePersist\(\);/g)?.length ?? 0 >= 11);
	assert.match(source, /if \(this\.#hides\("hideLayoutSwitch"\)\) return this\.view;/);
	assert.match(source, /if \(!ribbonAvailable\(hideFilters, hideModes, hideLayoutSwitch\)\) return nothing;/);
});

test("the worksheet finds the data block of the table", () => {
	const entry = manifest.editingConfig["./widgets/webwriter-chemlab-periodic-table"];
	assert.ok(entry, "the periodic table is listed in the editing config");
	assert.equal(entry.content, "script?");
});
