/**
 * Matter state of an element at arbitrary temperature and pressure.
 *
 * The bundle stores the melting, boiling and sublimation points at 1 bar. The
 * table can show the state at any condition the learner sets, so the boundaries
 * have to move with the slider. The model is deliberately small and states its
 * approximations:
 *
 * - The melting point stays at its 1-bar value. Its pressure dependence is a few
 *   kelvin over the whole slider range and changes sign between substances, so
 *   the tabulated value is the better answer than a one-sided correction.
 * - The boiling point follows Clausius–Clapeyron with Trouton's rule,
 *   `ΔS_vap = 88 J/(mol·K)`, so `1/T = 1/Tb − R·ln(p/p0)/(ΔS_vap·Tb)`. The bundle
 *   carries no enthalpy of vaporisation, and the values of the source mix the
 *   per-molecule and per-atom convention (oxygen 3.41 kJ/mol is per atom, hydrogen
 *   0.452 kJ/mol per molecule), so a uniform entropy of vaporisation is the more
 *   honest input. It is a good estimate for most substances and understates the
 *   pressure dependence of water and the metals by roughly a tenth.
 * - Below the triple point the extrapolated boiling curve falls under the melting
 *   point. The substance then passes from solid to gas directly, which is exactly
 *   what the clamped boundary describes.
 * - Carbon and arsenic have no liquid phase at standard pressure; their
 *   sublimation point is the only boundary. It is not corrected for pressure,
 *   because the bundle carries no enthalpy of sublimation.
 * - The pressure slider stops at 10 bar. Beyond that the Trouton estimate leaves
 *   its validity range, and most substances are above their critical pressure,
 *   where a boiling point no longer exists.
 * - An element without any thermal data stays `unknown` at every condition
 *   instead of being guessed.
 *
 * @module periodic-table/phase
 */

import { ELEMENTS, type ElementReference } from "./element-reference";
import type { Language } from "./strings";

/** Aggregate state of an element at a given temperature and pressure. */
export type MatterState = "solid" | "liquid" | "gas" | "unknown";

/** Conditions a state is evaluated at. */
export interface PhaseConditions {
	/** Temperature in kelvin. */
	readonly temperatureK: number;
	/** Pressure in bar. */
	readonly pressureBar: number;
}

/** Molar gas constant in J/(mol·K). */
const GAS_CONSTANT = 8.314462618;

/** Entropy of vaporisation from Trouton's rule, in J/(mol·K). */
const TROUTON_ENTROPY = 88;

/** Pressure the tabulated boiling points refer to, in bar. */
const REFERENCE_PRESSURE_BAR = 1;

/** Temperature the sliders and the readout work in. */
export const TEMPERATURE_SLIDER = {
	/** Lowest slider value in degrees Celsius, close to absolute zero. */
	minCelsius: -273,
	/** Highest slider value in degrees Celsius, above the boiling point of tungsten. */
	maxCelsius: 6000,
	/** Slider step in kelvin. */
	stepCelsius: 1,
	/** Value the table starts with, the reference temperature of the bundle. */
	defaultCelsius: 25,
} as const;

/** Pressure slider, which works on the decadic logarithm so 1 mbar and 10 bar both fit. */
export const PRESSURE_SLIDER = {
	/** Lowest slider value, `log10(0.001 bar)`. */
	minLog10Bar: -3,
	/** Highest slider value, `log10(10 bar)`. */
	maxLog10Bar: 1,
	/** Slider step in decades. */
	stepLog10: 0.01,
	/** Value the table starts with, the reference pressure of the bundle. */
	defaultLog10Bar: 0,
} as const;

/**
 * Converts a Celsius value to kelvin.
 *
 * @param celsius Temperature in degrees Celsius.
 * @returns Temperature in kelvin.
 */
export function kelvinFromCelsius(celsius: number): number {
	return celsius + 273.15;
}

/**
 * Converts a kelvin value to Celsius.
 *
 * @param kelvin Temperature in kelvin.
 * @returns Temperature in degrees Celsius.
 */
export function celsiusFromKelvin(kelvin: number): number {
	return kelvin - 273.15;
}

/**
 * Converts a slider position to a pressure.
 *
 * @param log10Bar Decadic logarithm of the pressure in bar.
 * @returns Pressure in bar.
 */
export function pressureFromLog10(log10Bar: number): number {
	return 10 ** log10Bar;
}

/**
 * Converts a pressure to a slider position.
 *
 * @param bar Pressure in bar.
 * @returns Decadic logarithm of the pressure.
 */
export function log10FromPressure(bar: number): number {
	return Math.log10(bar);
}

/**
 * Renders a temperature for the slider readout.
 *
 * @param kelvin Temperature in kelvin.
 * @param language Interface language, which decides the decimal separator.
 * @returns The rounded temperature in degrees Celsius, for example `25 °C`.
 */
export function celsiusText(kelvin: number, language: Language): string {
	const celsius = Math.round(celsiusFromKelvin(kelvin));
	return `${localizeNumber(celsius, language)} °C`;
}

/**
 * Renders a pressure for the slider readout.
 *
 * Three significant digits cover the whole slider range: `0.001 bar` at the low
 * end and `1000 bar` at the high end.
 *
 * @param bar Pressure in bar.
 * @param language Interface language, which decides the decimal separator.
 * @returns The pressure, for example `1 bar` or `0,1 bar`.
 */
export function pressureText(bar: number, language: Language): string {
	const rounded = Number(bar.toPrecision(3));
	return `${localizeNumber(rounded, language)} bar`;
}

/**
 * Replaces the decimal point with the separator of a language.
 *
 * @param value Number to render.
 * @param language Interface language.
 * @returns The number as text.
 */
function localizeNumber(value: number, language: Language): string {
	const text = String(value);
	return language === "de" ? text.replace(".", ",") : text;
}

/**
 * Computes the boiling point of an element at a pressure.
 *
 * Clausius–Clapeyron with Trouton's rule, see the module note. The result is
 * always defined: the entropy of vaporisation is positive, so the denominator
 * stays positive for every pressure the slider reaches.
 *
 * @param element Element of the reference bundle.
 * @param pressureBar Pressure in bar.
 * @returns The boiling point in kelvin, or `undefined` when the element has none.
 */
export function boilingPointAt(element: ElementReference, pressureBar: number): number | undefined {
	if (element.boiling.status === "unavailable") return undefined;
	const boiling = element.boiling.value;
	if (!(pressureBar > 0) || pressureBar === REFERENCE_PRESSURE_BAR) return boiling;
	const shift = (GAS_CONSTANT * Math.log(pressureBar / REFERENCE_PRESSURE_BAR)) / TROUTON_ENTROPY;
	return boiling / (1 - shift);
}

/**
 * Determines the aggregate state of an element at given conditions.
 *
 * @param element Element of the reference bundle.
 * @param conditions Temperature and pressure to evaluate at.
 * @returns The state, or `unknown` where the bundle carries no boundary.
 */
export function matterState(element: ElementReference, conditions: PhaseConditions): MatterState {
	const temperature = conditions.temperatureK;
	if (!(temperature > 0)) return "unknown";
	const melting = element.melting.status === "unavailable" ? undefined : element.melting.value;
	if (melting !== undefined) {
		const boiling = boilingPointAt(element, conditions.pressureBar);
		if (boiling === undefined) return temperature < melting ? "solid" : "unknown";
		// Below the triple point the extrapolated boiling curve falls under the
		// melting point, so the clamped boundary describes the sublimation.
		if (boiling <= melting) return temperature < boiling ? "solid" : "gas";
		if (temperature < melting) return "solid";
		return temperature < boiling ? "liquid" : "gas";
	}
	if (element.sublimation.status === "unavailable") return "unknown";
	return temperature < element.sublimation.value ? "solid" : "gas";
}

/**
 * Reads the year an element was discovered or first created.
 *
 * @param element Element of the reference bundle.
 * @returns The year, or `undefined` for an element known since antiquity.
 */
export function discoveryYear(element: ElementReference): number | undefined {
	return element.discovery.kind === "year" ? element.discovery.year : undefined;
}

/**
 * Tells whether an element was known at a year.
 *
 * An element of antiquity counts as known at every year, and an element without
 * any record is never dimmed, because the table cannot place it on the timeline.
 *
 * @param element Element of the reference bundle.
 * @param year Year to evaluate at.
 * @returns Whether the element was known then.
 */
export function knownAt(element: ElementReference, year: number): boolean {
	switch (element.discovery.kind) {
		case "antiquity":
		case "unavailable":
			return true;
		case "year":
			return element.discovery.year <= year;
	}
}

/** Years the discovery slider spans, taken from the bundle. */
export const DISCOVERY_RANGE: { readonly min: number; readonly max: number } = (() => {
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const element of ELEMENTS) {
		const year = discoveryYear(element);
		if (year === undefined) continue;
		if (year < min) min = year;
		if (year > max) max = year;
	}
	return Number.isFinite(min) ? { min, max } : { min: 0, max: 0 };
})();

/** Which property the table colours its cells by. */
export type TableMode = "off" | "temperature" | "pressure" | "discovery";

/** Every mode the table offers, in the order of the switch. */
export const TABLE_MODES: readonly TableMode[] = ["off", "temperature", "pressure", "discovery"];

/** The condition a mode evaluates at. */
export interface ModeState {
	/** Active mode. */
	readonly mode: TableMode;
	/** Temperature in kelvin, used by the temperature mode. */
	readonly temperatureK: number;
	/** Pressure in bar, used by the pressure mode. */
	readonly pressureBar: number;
	/** Year, used by the discovery mode. */
	readonly year: number;
}

/** Mode state of a freshly loaded table: no mode, reference conditions. */
export const DEFAULT_MODE_STATE: ModeState = {
	mode: "off",
	temperatureK: kelvinFromCelsius(TEMPERATURE_SLIDER.defaultCelsius),
	pressureBar: pressureFromLog10(PRESSURE_SLIDER.defaultLog10Bar),
	year: DISCOVERY_RANGE.max,
};

/** What a mode adds to one cell. */
export interface CellMode {
	/** State the cell is coloured by, or `null` when no mode is active. */
	readonly state: MatterState | null;
	/** Text of the corner badge, or `null` when the cell carries none. */
	readonly badge: string | null;
	/** Whether the cell is dimmed because the element was not yet known. */
	readonly dimmed: boolean;
}

/**
 * Derives the mode decoration of one cell.
 *
 * @param element Element of the reference bundle.
 * @param state Current mode state.
 * @returns The state colour, the corner badge and the dimming of the cell.
 */
export function cellMode(element: ElementReference, state: ModeState): CellMode {
	switch (state.mode) {
		case "off":
			return { state: null, badge: null, dimmed: false };
		case "temperature":
		case "pressure":
			return {
				state: matterState(element, {
					temperatureK: state.temperatureK,
					pressureBar: state.pressureBar,
				}),
				badge: null,
				dimmed: false,
			};
		case "discovery": {
			const year = discoveryYear(element);
			return {
				state: null,
				badge: year === undefined ? null : String(year),
				dimmed: !knownAt(element, state.year),
			};
		}
	}
}
