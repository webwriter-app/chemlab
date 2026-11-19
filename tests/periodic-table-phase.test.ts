import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, elementByAtomicNumber } from "../periodic-table/element-reference";
import {
	DISCOVERY_RANGE,
	DEFAULT_MODE_STATE,
	TEMPERATURE_SLIDER,
	TABLE_MODES,
	cellMode,
	celsiusFromKelvin,
	celsiusText,
	discoveryYear,
	kelvinFromCelsius,
	knownAt,
	matterState,
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
	assert.deepEqual(TABLE_MODES, ["off", "temperature", "discovery"]);
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
