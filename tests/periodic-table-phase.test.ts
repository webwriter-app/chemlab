import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, elementByAtomicNumber } from "../periodic-table/element-reference";
import {
	DISCOVERY_RANGE,
	DEFAULT_MODE_STATE,
	PRESSURE_SLIDER,
	TEMPERATURE_SLIDER,
	TABLE_MODES,
	boilingPointAt,
	cellMode,
	celsiusFromKelvin,
	celsiusText,
	discoveryYear,
	kelvinFromCelsius,
	knownAt,
	log10FromPressure,
	matterState,
	pressureFromLog10,
	pressureText,
} from "../periodic-table/phase";

const element = (atomicNumber: number) => {
	const found = elementByAtomicNumber(atomicNumber);
	assert.ok(found, `missing Z = ${atomicNumber}`);
	return found;
};

const near = (actual: number | undefined, expected: number, tolerance: number, label: string) => {
	assert.ok(actual !== undefined, `${label} is undefined`);
	assert.ok(
		Math.abs(actual - expected) <= tolerance,
		`${label} is ${actual}, expected ${expected} ± ${tolerance}`,
	);
};

test("the sliders convert between their unit and the model unit", () => {
	assert.equal(kelvinFromCelsius(25), 298.15);
	assert.equal(celsiusFromKelvin(273.15), 0);
	assert.equal(pressureFromLog10(0), 1);
	assert.equal(pressureFromLog10(-3), 0.001);
	near(log10FromPressure(10), 1, 1e-12, "log10 of 10 bar");
	assert.equal(TEMPERATURE_SLIDER.defaultCelsius, 25);
	assert.equal(PRESSURE_SLIDER.defaultLog10Bar, 0);
	assert.ok(TEMPERATURE_SLIDER.minCelsius > -273.15, "the slider must stay above absolute zero");
	assert.ok(TEMPERATURE_SLIDER.maxCelsius > celsiusFromKelvin(6203), "tungsten must fit");
	assert.equal(pressureFromLog10(PRESSURE_SLIDER.maxLog10Bar), 10);
});

test("the readout follows the language", () => {
	assert.equal(celsiusText(298.15, "en"), "25 °C");
	assert.equal(celsiusText(298.15, "de"), "25 °C");
	assert.equal(celsiusText(273.15 - 273.15, "en"), "-273 °C");
	assert.equal(pressureText(1, "en"), "1 bar");
	assert.equal(pressureText(0.1, "en"), "0.1 bar");
	assert.equal(pressureText(0.1, "de"), "0,1 bar");
	assert.equal(pressureText(0.001, "de"), "0,001 bar");
	assert.equal(pressureText(10, "en"), "10 bar");
});

test("the boiling point rises with pressure and keeps its 1-bar value", () => {
	const bromine = element(35);
	assert.equal(boilingPointAt(bromine, 1), 332);
	near(boilingPointAt(bromine, 0.1), 272.7, 0.5, "bromine at 0.1 bar");
	near(boilingPointAt(bromine, 10), 424.3, 0.5, "bromine at 10 bar");
	near(boilingPointAt(bromine, 0.001), 200.9, 0.5, "bromine at 1 mbar");
	let previous = 0;
	for (let log10Bar = PRESSURE_SLIDER.minLog10Bar; log10Bar <= PRESSURE_SLIDER.maxLog10Bar; log10Bar += 0.25) {
		const boiling = boilingPointAt(bromine, pressureFromLog10(log10Bar));
		assert.ok(boiling !== undefined && boiling > previous, `not rising at ${log10Bar}`);
		previous = boiling;
	}
	assert.equal(boilingPointAt(element(85), 1), undefined, "astatine has no boiling point");
});

test("the state follows the melting and boiling point of oxygen", () => {
	const oxygen = element(8);
	const state = (temperatureK: number, pressureBar = 1) =>
		matterState(oxygen, { temperatureK, pressureBar });
	assert.equal(state(50), "solid");
	assert.equal(state(54), "solid");
	assert.equal(state(60), "liquid");
	assert.equal(state(90), "liquid");
	assert.equal(state(91), "gas");
	assert.equal(state(200), "gas");
	assert.equal(state(100, 10), "liquid", "10 bar lifts the boiling point above 100 K");
	assert.equal(state(100, 0.001), "gas", "1 mbar drops the boiling point below 100 K");
	assert.equal(state(0), "unknown", "absolute zero is not a state the model knows");
});

test("carbon and arsenic sublime instead of melting", () => {
	const carbon = element(6);
	assert.equal(matterState(carbon, { temperatureK: 3000, pressureBar: 1 }), "solid");
	assert.equal(matterState(carbon, { temperatureK: 4000, pressureBar: 1 }), "gas");
	const arsenic = element(33);
	assert.equal(matterState(arsenic, { temperatureK: 800, pressureBar: 1 }), "solid");
	assert.equal(matterState(arsenic, { temperatureK: 900, pressureBar: 1 }), "gas");
});

test("an element without thermal data stays unknown", () => {
	assert.equal(matterState(element(85), { temperatureK: 300, pressureBar: 1 }), "unknown");
	const fermium = element(100);
	assert.equal(matterState(fermium, { temperatureK: 300, pressureBar: 1 }), "solid");
	assert.equal(
		matterState(fermium, { temperatureK: 2000, pressureBar: 1 }),
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
	assert.equal(DEFAULT_MODE_STATE.pressureBar, 1);
	assert.equal(DEFAULT_MODE_STATE.year, DISCOVERY_RANGE.max);
	assert.deepEqual(TABLE_MODES, ["off", "temperature", "pressure", "discovery"]);
});

test("a cell carries the state, the badge and the dimming of its mode", () => {
	const oxygen = element(8);
	const tennessine = element(117);
	assert.deepEqual(cellMode(oxygen, DEFAULT_MODE_STATE), {
		state: null,
		badge: null,
		dimmed: false,
	});
	assert.deepEqual(cellMode(oxygen, { ...DEFAULT_MODE_STATE, mode: "temperature" }), {
		state: "gas",
		badge: null,
		dimmed: false,
	});
	assert.deepEqual(
		cellMode(oxygen, { ...DEFAULT_MODE_STATE, mode: "temperature", temperatureK: 70 }),
		{ state: "liquid", badge: null, dimmed: false },
	);
	assert.deepEqual(
		cellMode(oxygen, { ...DEFAULT_MODE_STATE, mode: "pressure", pressureBar: 0.001 }),
		{ state: "gas", badge: null, dimmed: false },
	);
	assert.deepEqual(cellMode(tennessine, { ...DEFAULT_MODE_STATE, mode: "discovery", year: 1900 }), {
		state: null,
		badge: "2010",
		dimmed: true,
	});
	assert.deepEqual(cellMode(tennessine, { ...DEFAULT_MODE_STATE, mode: "discovery" }), {
		state: null,
		badge: "2010",
		dimmed: false,
	});
	assert.deepEqual(cellMode(element(26), { ...DEFAULT_MODE_STATE, mode: "discovery", year: 1300 }), {
		state: null,
		badge: null,
		dimmed: false,
	});
});
