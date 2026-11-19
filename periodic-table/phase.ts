/**
 * Matter state of an element at a temperature.
 *
 * The bundle stores the melting, boiling and sublimation points at 1 bar, so the
 * state follows the tabulated boundaries directly. The model is deliberately
 * small and states its approximations:
 *
 * - The melting point is used as it stands. Its pressure dependence is a few
 *   kelvin over the whole range and changes sign between substances, so a
 *   one-sided correction would be worse than the tabulated value.
 * - Carbon and arsenic have no liquid phase at standard pressure; their
 *   sublimation point is the only boundary.
 * - An element without any thermal data stays `unknown` at every temperature
 *   instead of being guessed.
 *
 * @module periodic-table/phase
 */

import { ELEMENTS, type ElementReference } from "./element-reference";
import type { Language } from "./strings";

/** Aggregate state of an element at a given temperature. */
export type MatterState = "solid" | "liquid" | "gas" | "unknown";

/** Temperature the slider and the readout work in. */
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
 * Determines the aggregate state of an element at a temperature.
 *
 * @param element Element of the reference bundle.
 * @param temperatureK Temperature to evaluate at, in kelvin.
 * @returns The state, or `unknown` where the bundle carries no boundary.
 */
export function matterState(element: ElementReference, temperatureK: number): MatterState {
	if (!(temperatureK > 0)) return "unknown";
	const melting = element.melting.status === "unavailable" ? undefined : element.melting.value;
	if (melting !== undefined) {
		const boiling = element.boiling.status === "unavailable" ? undefined : element.boiling.value;
		if (boiling === undefined) return temperatureK < melting ? "solid" : "unknown";
		// A substance whose boiling point sits at or below its melting point has
		// no liquid range, so the single boundary describes the sublimation.
		if (boiling <= melting) return temperatureK < boiling ? "solid" : "gas";
		if (temperatureK < melting) return "solid";
		return temperatureK < boiling ? "liquid" : "gas";
	}
	if (element.sublimation.status === "unavailable") return "unknown";
	return temperatureK < element.sublimation.value ? "solid" : "gas";
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
 * any record is never hidden, because the table cannot place it on the timeline.
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
export type TableMode = "off" | "temperature" | "discovery";

/** Every mode the table offers, in the order of the switch. */
export const TABLE_MODES: readonly TableMode[] = ["off", "temperature", "discovery"];

/** The condition a mode evaluates at. */
export interface ModeState {
	/** Active mode. */
	readonly mode: TableMode;
	/** Temperature in kelvin, used by the temperature mode. */
	readonly temperatureK: number;
	/** Year, used by the discovery mode. */
	readonly year: number;
}

/** Mode state of a freshly loaded table: no mode, reference conditions. */
export const DEFAULT_MODE_STATE: ModeState = {
	mode: "off",
	temperatureK: kelvinFromCelsius(TEMPERATURE_SLIDER.defaultCelsius),
	year: DISCOVERY_RANGE.max,
};

/** What a mode adds to one cell. */
export interface CellMode {
	/** State the cell is coloured by, or `null` when no mode is active. */
	readonly state: MatterState | null;
	/** Text of the corner badge, or `null` when the cell carries none. */
	readonly badge: string | null;
	/** Whether the mode hides the cell because the element does not match it. */
	readonly hidden: boolean;
}

/**
 * Derives the mode decoration of one cell.
 *
 * A mode hides the elements it cannot place instead of dimming them: an element
 * without thermal data has no state at any temperature, and an element that was
 * not yet known has no place on the timeline. A dimmed tile would still occupy
 * its slot and read as a value, so the table drops it and leaves a hole.
 *
 * @param element Element of the reference bundle.
 * @param state Current mode state.
 * @returns The state colour, the corner badge and whether the cell is hidden.
 */
export function cellMode(element: ElementReference, state: ModeState): CellMode {
	switch (state.mode) {
		case "off":
			return { state: null, badge: null, hidden: false };
		case "temperature": {
			const matter = matterState(element, state.temperatureK);
			return { state: matter, badge: null, hidden: matter === "unknown" };
		}
		case "discovery": {
			const year = discoveryYear(element);
			return {
				state: null,
				badge: year === undefined ? null : String(year),
				hidden: !knownAt(element, state.year),
			};
		}
	}
}
