import assert from "node:assert/strict";
import { test } from "node:test";
import {
	ELEMENTS,
	elementByAtomicNumber,
	type ElementReference,
} from "../periodic-table/element-reference";
import {
	DISCOVERY_RANGE,
	DEFAULT_MODE_STATE,
	ELECTRONEGATIVITY_RANGE,
	HALF_LIFE_RANGE,
	IONIZATION_RANGE,
	RADIUS_RANGE,
	TEMPERATURE_SLIDER,
	TABLE_MODES,
	cellMode,
	celsiusFromKelvin,
	celsiusText,
	discoveryYear,
	halfLifeBadge,
	halfLifeText,
	isotopeText,
	kelvinFromCelsius,
	knownAt,
	matterState,
	type TableMode,
} from "../periodic-table/phase";

const element = (atomicNumber: number) => {
	const found = elementByAtomicNumber(atomicNumber);
	assert.ok(found, `missing Z = ${atomicNumber}`);
	return found;
};

test("the slider converts between its unit and the model unit", () => {
	assert.equal(kelvinFromCelsius(25), 298.15);
	assert.equal(celsiusFromKelvin(273.15), 0);
	assert.equal(TEMPERATURE_SLIDER.defaultCelsius, 25);
	assert.ok(TEMPERATURE_SLIDER.minCelsius > -273.15, "the slider must stay above absolute zero");
	assert.ok(TEMPERATURE_SLIDER.maxCelsius > celsiusFromKelvin(6203), "tungsten must fit");
});

test("the readout follows the language", () => {
	assert.equal(celsiusText(298.15, "en"), "25 °C");
	assert.equal(celsiusText(298.15, "de"), "25 °C");
	assert.equal(celsiusText(273.15 - 273.15, "en"), "-273 °C");
});

test("the state follows the melting and boiling point of oxygen", () => {
	const oxygen = element(8);
	const state = (temperatureK: number) => matterState(oxygen, temperatureK);
	assert.equal(state(50), "solid");
	assert.equal(state(54), "solid");
	assert.equal(state(60), "liquid");
	assert.equal(state(90), "liquid");
	assert.equal(state(91), "gas");
	assert.equal(state(200), "gas");
	assert.equal(state(0), "unknown", "absolute zero is not a state the model knows");
});

test("carbon and arsenic sublime instead of melting", () => {
	const carbon = element(6);
	assert.equal(matterState(carbon, 3000), "solid");
	assert.equal(matterState(carbon, 4000), "gas");
	const arsenic = element(33);
	assert.equal(matterState(arsenic, 800), "solid");
	assert.equal(matterState(arsenic, 900), "gas");
});

test("an element without thermal data stays unknown", () => {
	assert.equal(matterState(element(85), 300), "unknown");
	const fermium = element(100);
	assert.equal(matterState(fermium, 300), "solid");
	assert.equal(
		matterState(fermium, 2000),
		"unknown",
		"above the melting point without a boiling point",
	);
});

test("the discovery year separates antiquity from the synthetic elements", () => {
	assert.equal(discoveryYear(element(26)), undefined, "iron counts as known since antiquity");
	assert.equal(discoveryYear(element(117)), 2010);
	assert.equal(knownAt(element(26), 1000), true);
	assert.equal(knownAt(element(33), 1300), true);
	assert.equal(knownAt(element(33), 1299), false);
	assert.equal(knownAt(element(117), 2009), false);
	assert.equal(knownAt(element(117), 2010), true);
	assert.deepEqual(DISCOVERY_RANGE, { min: 1300, max: 2010 });
	const years = ELEMENTS.map(discoveryYear).filter((year) => year !== undefined);
	assert.ok(years.every((year) => year >= DISCOVERY_RANGE.min && year <= DISCOVERY_RANGE.max));
});

test("the default mode state shows the reference conditions", () => {
	assert.equal(DEFAULT_MODE_STATE.mode, "off");
	assert.equal(DEFAULT_MODE_STATE.temperatureK, 298.15);
	assert.equal(DEFAULT_MODE_STATE.year, DISCOVERY_RANGE.max);
	assert.deepEqual(TABLE_MODES, [
		"off",
		"temperature",
		"discovery",
		"radius",
		"electronegativity",
		"ionization",
		"halfLife",
	]);
});

test("every threshold starts at the end that hides nothing", () => {
	// The radius hides the elements above the threshold, the other three hide the
	// ones below it, so the permissive end differs between them.
	assert.equal(DEFAULT_MODE_STATE.radiusPm, RADIUS_RANGE.max);
	assert.equal(DEFAULT_MODE_STATE.electronegativity, ELECTRONEGATIVITY_RANGE.min);
	assert.equal(DEFAULT_MODE_STATE.ionizationEv, IONIZATION_RANGE.min);
	assert.equal(DEFAULT_MODE_STATE.halfLifeLogSeconds, HALF_LIFE_RANGE.min);
	// At the default threshold only the elements without a value are hidden, so
	// switching a mode on never drops an element the source could place.
	const hidden = (mode: TableMode) =>
		ELEMENTS.filter((entry) => cellMode(entry, { ...DEFAULT_MODE_STATE, mode }).hidden).map(
			(entry) => entry.symbol,
		);
	const withoutValue = (pick: (entry: ElementReference) => { readonly status: string }) =>
		ELEMENTS.filter((entry) => pick(entry).status === "unavailable").map((entry) => entry.symbol);
	assert.deepEqual(hidden("radius"), withoutValue((entry) => entry.radius));
	assert.deepEqual(hidden("electronegativity"), withoutValue((entry) => entry.electronegativity));
	assert.deepEqual(hidden("ionization"), []);
	assert.deepEqual(hidden("halfLife"), []);
	assert.deepEqual(hidden("discovery"), []);
	assert.deepEqual(hidden("off"), []);
});

test("the property ranges cover the bundle", () => {
	assert.deepEqual(RADIUS_RANGE, { min: 25, max: 265 });
	assert.deepEqual(ELECTRONEGATIVITY_RANGE, { min: 0.7, max: 3.98 });
	assert.deepEqual(IONIZATION_RANGE, { min: 3.89, max: 24.59 });
	// The half-life spans more than thirty orders of magnitude, so the slider
	// works in decades of seconds.
	assert.deepEqual(HALF_LIFE_RANGE, { min: -4, max: 27 });
});

test("a cell carries the state, the badge and the hiding of its mode", () => {
	const oxygen = element(8);
	const tennessine = element(117);
	assert.deepEqual(cellMode(oxygen, DEFAULT_MODE_STATE), {
		state: null,
		badge: null,
		hidden: false,
	});
	assert.deepEqual(cellMode(oxygen, { ...DEFAULT_MODE_STATE, mode: "temperature" }), {
		state: "gas",
		badge: null,
		hidden: false,
	});
	assert.deepEqual(
		cellMode(oxygen, { ...DEFAULT_MODE_STATE, mode: "temperature", temperatureK: 70 }),
		{ state: "liquid", badge: null, hidden: false },
	);
	assert.deepEqual(cellMode(tennessine, { ...DEFAULT_MODE_STATE, mode: "discovery", year: 1900 }), {
		state: null,
		badge: "2010",
		hidden: true,
	});
	assert.deepEqual(cellMode(tennessine, { ...DEFAULT_MODE_STATE, mode: "discovery" }), {
		state: null,
		badge: "2010",
		hidden: false,
	});
	assert.deepEqual(cellMode(element(26), { ...DEFAULT_MODE_STATE, mode: "discovery", year: 1300 }), {
		state: null,
		badge: null,
		hidden: false,
	});
});

test("the temperature mode hides the elements it cannot place", () => {
	// Astatine carries no thermal data, so it has no state at any temperature.
	const astatine = element(85);
	assert.equal(matterState(astatine, 298.15), "unknown");
	assert.equal(cellMode(astatine, { ...DEFAULT_MODE_STATE, mode: "temperature" }).hidden, true);
	assert.equal(cellMode(astatine, DEFAULT_MODE_STATE).hidden, false);
	// Oxygen is placed at every temperature the slider reaches.
	for (const temperatureK of [1, 70, 298.15, 6000]) {
		assert.equal(
			cellMode(element(8), { ...DEFAULT_MODE_STATE, mode: "temperature", temperatureK }).hidden,
			false,
		);
	}
});

test("the numeric modes read their slider as a threshold", () => {
	const iron = element(26);
	const radius = (radiusPm: number) =>
		cellMode(iron, { ...DEFAULT_MODE_STATE, mode: "radius", radiusPm });
	assert.deepEqual(radius(265), { state: null, badge: "126", hidden: false });
	assert.deepEqual(radius(126), { state: null, badge: "126", hidden: false }, "the bound counts as shown");
	assert.deepEqual(radius(125), { state: null, badge: "126", hidden: true });

	const electronegativity = (value: number) =>
		cellMode(iron, { ...DEFAULT_MODE_STATE, mode: "electronegativity", electronegativity: value });
	assert.deepEqual(electronegativity(0.7), { state: null, badge: "1.83", hidden: false });
	assert.deepEqual(electronegativity(1.83), { state: null, badge: "1.83", hidden: false });
	assert.deepEqual(electronegativity(1.84), { state: null, badge: "1.83", hidden: true });

	const ionization = (value: number) =>
		cellMode(iron, { ...DEFAULT_MODE_STATE, mode: "ionization", ionizationEv: value });
	assert.deepEqual(ionization(3.89), { state: null, badge: "7.9", hidden: false });
	assert.deepEqual(ionization(7.91), { state: null, badge: "7.9", hidden: true });

	const halfLife = (logSeconds: number) =>
		cellMode(iron, { ...DEFAULT_MODE_STATE, mode: "halfLife", halfLifeLogSeconds: logSeconds });
	assert.deepEqual(halfLife(-4), { state: null, badge: "∞", hidden: false }, "a stable nuclide never hides");
	assert.deepEqual(halfLife(27), { state: null, badge: "∞", hidden: false });
});

test("a numeric mode hides the elements without a value", () => {
	// Helium carries neither an empirical radius nor a Pauling electronegativity.
	const helium = element(2);
	assert.equal(cellMode(helium, { ...DEFAULT_MODE_STATE, mode: "radius" }).hidden, true);
	assert.equal(cellMode(helium, { ...DEFAULT_MODE_STATE, mode: "electronegativity" }).hidden, true);
	assert.equal(cellMode(helium, { ...DEFAULT_MODE_STATE, mode: "ionization" }).hidden, false);
	assert.equal(cellMode(helium, { ...DEFAULT_MODE_STATE, mode: "radius" }).badge, null);
});

test("the half-life mode keeps the radioactive elements above the threshold", () => {
	const technetium = element(43);
	const bismuth = element(83);
	const threshold = (logSeconds: number) =>
		cellMode(technetium, { ...DEFAULT_MODE_STATE, mode: "halfLife", halfLifeLogSeconds: logSeconds });
	assert.equal(threshold(14).hidden, false, "4.2 million years is longer than 10^14 s");
	assert.equal(threshold(15).hidden, true);
	assert.equal(threshold(14).badge, "10⁶ a");
	assert.equal(
		cellMode(bismuth, { ...DEFAULT_MODE_STATE, mode: "halfLife" }).badge,
		"10¹⁹ a",
	);
});

test("a half-life is rendered in the unit that keeps it short", () => {
	assert.equal(halfLifeText(0.00058, "en"), "580 µs");
	assert.equal(halfLifeText(0.051, "en"), "51 ms");
	assert.equal(halfLifeText(29160, "en"), "8.1 h");
	assert.equal(halfLifeText(1320, "en"), "22 min");
	assert.equal(halfLifeText(330350.4, "en"), "3.82 d");
	assert.equal(halfLifeText(140996345254477060, "de"), "4,47·10⁹ a");
	assert.equal(halfLifeText(140996345254477060, "en", 2), "4.5·10⁹ a");
	assert.equal(halfLifeBadge(0.00058, "de"), "580 µs");
	assert.equal(halfLifeBadge(29160, "en"), "8.1 h");
	assert.equal(halfLifeBadge(140996345254477060, "en"), "10⁹ a");
	assert.equal(isotopeText(238, "U"), "²³⁸U");
	assert.equal(isotopeText(294, "Og"), "²⁹⁴Og");
});
