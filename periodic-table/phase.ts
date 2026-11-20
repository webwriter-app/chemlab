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

import { ELEMENTS, dataValue, type ElementReference } from "./element-reference";
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
export type TableMode =
	| "off"
	| "temperature"
	| "discovery"
	| "radius"
	| "electronegativity"
	| "ionization"
	| "halfLife";

/** Every mode the table offers, in the order of the switch. */
export const TABLE_MODES: readonly TableMode[] = [
	"off",
	"temperature",
	"discovery",
	"radius",
	"electronegativity",
	"ionization",
	"halfLife",
];

/**
 * The modes the property carousel offers as chips.
 *
 * `off` is the resting state and not a chip: the reset button beside the
 * carousel clears the mode, the same way the reset beside the search clears the
 * query and the family filter. Keeping `off` out of the strip leaves the six
 * modes that colour or badge a cell, and the way back is one button in the same
 * row instead of a chip that scrolls with the others.
 */
export const MODE_CHOICES: readonly TableMode[] = TABLE_MODES.filter((mode) => mode !== "off");

/** Bounds of a numeric mode, taken from the bundle. */
export interface ModeRange {
	/** Lowest slider value. */
	readonly min: number;
	/** Highest slider value. */
	readonly max: number;
}

/**
 * Collects the bounds of a numeric property over the bundle.
 *
 * The bounds are rounded outward to the slider step, so the first and the last
 * position of the slider still show every element that carries a value.
 *
 * @param values Values of the property, without the elements that have none.
 * @param step Slider step.
 * @returns The bounds, or `0`–`0` when the bundle carries no value at all.
 */
function propertyRange(values: readonly number[], step: number): ModeRange {
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const value of values) {
		if (value < min) min = value;
		if (value > max) max = value;
	}
	if (!Number.isFinite(min)) return { min: 0, max: 0 };
	const round = (value: number) => Number((value * 1e4).toFixed(0)) / 1e4;
	return {
		min: round(Math.floor(min / step) * step),
		max: round(Math.ceil(max / step) * step),
	};
}

/** Values of one numeric property, without the elements that have none. */
function propertyValues(read: (element: ElementReference) => number | undefined): readonly number[] {
	const values: number[] = [];
	for (const element of ELEMENTS) {
		const value = read(element);
		if (value !== undefined) values.push(value);
	}
	return values;
}

/** Empirical atomic radii the radius mode spans, in picometres. */
export const RADIUS_RANGE: ModeRange = propertyRange(
	propertyValues((element) => dataValue(element.radius)),
	1,
);

/** Pauling electronegativities the electronegativity mode spans. */
export const ELECTRONEGATIVITY_RANGE: ModeRange = propertyRange(
	propertyValues((element) => dataValue(element.electronegativity)),
	0.01,
);

/** First ionization energies the ionization mode spans, in electronvolts. */
export const IONIZATION_RANGE: ModeRange = propertyRange(
	propertyValues((element) => dataValue(element.ionization)),
	0.01,
);

/**
 * Half-lives the half-life mode spans, as decadic logarithms of seconds.
 *
 * The range is logarithmic because the values cover more than thirty orders of
 * magnitude: a linear slider would put every element but bismuth at its left
 * end.
 */
export const HALF_LIFE_RANGE: ModeRange = (() => {
	const logs = propertyValues((element) =>
		element.halfLife.kind === "value" ? Math.log10(element.halfLife.seconds) : undefined,
	);
	const range = propertyRange(logs, 1);
	return { min: range.min, max: range.max };
})();

/** The condition a mode evaluates at. */
export interface ModeState {
	/** Active mode. */
	readonly mode: TableMode;
	/** Temperature in kelvin, used by the temperature mode. */
	readonly temperatureK: number;
	/** Year, used by the discovery mode. */
	readonly year: number;
	/** Largest empirical radius the radius mode shows, in picometres. */
	readonly radiusPm: number;
	/** Smallest Pauling electronegativity the electronegativity mode shows. */
	readonly electronegativity: number;
	/** Smallest first ionization energy the ionization mode shows, in electronvolts. */
	readonly ionizationEv: number;
	/** Smallest half-life the half-life mode shows, as the decadic logarithm of seconds. */
	readonly halfLifeLogSeconds: number;
}

/**
 * Mode state of a freshly loaded table: no mode, reference conditions.
 *
 * Every numeric threshold starts at the end that hides nothing, so switching a
 * mode on shows the whole table before the learner narrows it.
 */
export const DEFAULT_MODE_STATE: ModeState = {
	mode: "off",
	temperatureK: kelvinFromCelsius(TEMPERATURE_SLIDER.defaultCelsius),
	year: DISCOVERY_RANGE.max,
	radiusPm: RADIUS_RANGE.max,
	electronegativity: ELECTRONEGATIVITY_RANGE.min,
	ionizationEv: IONIZATION_RANGE.min,
	halfLifeLogSeconds: HALF_LIFE_RANGE.min,
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

/** Seconds in a Julian year, the unit the half-life readout uses for long values. */
const SECONDS_PER_YEAR = 31_557_600;

/** Units the half-life readout picks from, largest first. */
const HALF_LIFE_UNITS: readonly { readonly seconds: number; readonly symbol: string }[] = [
	{ seconds: SECONDS_PER_YEAR, symbol: "a" },
	{ seconds: 86_400, symbol: "d" },
	{ seconds: 3_600, symbol: "h" },
	{ seconds: 60, symbol: "min" },
	{ seconds: 1, symbol: "s" },
	{ seconds: 1e-3, symbol: "ms" },
	{ seconds: 1e-6, symbol: "µs" },
];

/** Superscript digits, so an exponent reads as a power instead of a caret. */
const SUPERSCRIPT_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

/**
 * Renders an exponent as superscript digits.
 *
 * @param exponent Exponent to render.
 * @returns The exponent, for example `⁹` or `⁻¹¹`.
 */
function superscript(exponent: number): string {
	return String(exponent)
		.split("")
		.map((character) => (character === "-" ? "⁻" : SUPERSCRIPT_DIGITS[Number(character)] ?? character))
		.join("");
}

/**
 * Renders a number with a fixed number of significant digits.
 *
 * Values of four digits and more switch to a power of ten, so a half-life of
 * 4.47 billion years stays readable in a cell corner.
 *
 * @param value Number to render.
 * @param digits Significant digits to keep.
 * @param language Interface language, which decides the decimal separator.
 * @returns The number as text, for example `1,83` or `4,47·10⁹`.
 */
function significantText(value: number, digits: number, language: Language): string {
	const exponent = Math.floor(Math.log10(value));
	if (exponent >= 4) {
		const mantissa = value / 10 ** exponent;
		return `${localizeNumber(Number(mantissa.toFixed(digits - 1)), language)}·10${superscript(exponent)}`;
	}
	const decimals = Math.max(0, digits - 1 - exponent);
	return localizeNumber(Number(value.toFixed(decimals)), language);
}

/**
 * Picks the unit a half-life reads best in.
 *
 * The unit is the largest one that still leaves at least one of it, so the
 * mantissa stays between 1 and 1000: 8.1 hours instead of 0.338 days, and 22
 * minutes instead of 0.015 days. A value below the smallest unit keeps that one.
 *
 * @param seconds Half-life in seconds.
 * @returns The unit and its length in seconds.
 */
function halfLifeUnit(seconds: number): { readonly seconds: number; readonly symbol: string } {
	return (
		HALF_LIFE_UNITS.find((unit) => seconds / unit.seconds >= 1) ??
		HALF_LIFE_UNITS[HALF_LIFE_UNITS.length - 1]
	);
}

/**
 * Renders a half-life for the detail card.
 *
 * @param seconds Half-life in seconds.
 * @param language Interface language.
 * @param digits Significant digits to keep.
 * @returns The half-life with its unit, for example `4,47·10⁹ a`.
 */
export function halfLifeText(seconds: number, language: Language, digits = 3): string {
	const unit = halfLifeUnit(seconds);
	return `${significantText(seconds / unit.seconds, digits, language)} ${unit.symbol}`;
}

/**
 * Renders a half-life for the corner badge of a cell.
 *
 * The badge has the width of the atomic number beside it, so it keeps two
 * significant digits and drops the mantissa once the value reaches ten
 * thousand: `0,58 ms`, `8,1 h`, `10⁹ a`.
 *
 * @param seconds Half-life in seconds.
 * @param language Interface language.
 * @returns The compact half-life.
 */
export function halfLifeBadge(seconds: number, language: Language): string {
	const unit = halfLifeUnit(seconds);
	const amount = seconds / unit.seconds;
	const exponent = Math.floor(Math.log10(amount));
	const text = exponent >= 4 ? `10${superscript(exponent)}` : significantText(amount, 2, language);
	return `${text} ${unit.symbol}`;
}

/**
 * Renders the isotope a half-life belongs to.
 *
 * @param massNumber Mass number of the nuclide.
 * @param symbol Element symbol.
 * @returns The nuclide, for example `²³⁸U`.
 */
export function isotopeText(massNumber: number, symbol: string): string {
	return `${superscript(massNumber)}${symbol}`;
}

/**
 * Derives the mode decoration of one cell.
 *
 * A mode hides the elements it cannot place instead of dimming them: an element
 * without thermal data has no state at any temperature, an element that was not
 * yet known has no place on the timeline, and an element without a value has
 * nothing to compare with a threshold. A dimmed tile would still occupy its slot
 * and read as a value, so the table drops it and leaves a hole.
 *
 * The numeric modes read their slider as a threshold and keep the value in the
 * corner badge. The radius hides the elements above the threshold, the other
 * three hide the ones below it, so every mode starts at the end that hides
 * nothing.
 *
 * @param element Element of the reference bundle.
 * @param state Current mode state.
 * @param language Interface language, which decides the decimal separator.
 * @returns The state colour, the corner badge and whether the cell is hidden.
 */
export function cellMode(
	element: ElementReference,
	state: ModeState,
	language: Language = "en",
): CellMode {
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
		case "radius": {
			const radius = dataValue(element.radius);
			if (radius === undefined) return { state: null, badge: null, hidden: true };
			return {
				state: null,
				badge: String(radius),
				hidden: radius > state.radiusPm,
			};
		}
		case "electronegativity": {
			const value = dataValue(element.electronegativity);
			if (value === undefined) return { state: null, badge: null, hidden: true };
			return {
				state: null,
				badge: significantText(value, 3, language),
				hidden: value < state.electronegativity,
			};
		}
		case "ionization": {
			const value = dataValue(element.ionization);
			if (value === undefined) return { state: null, badge: null, hidden: true };
			return {
				state: null,
				badge: significantText(value, 3, language),
				hidden: value < state.ionizationEv,
			};
		}
		case "halfLife": {
			if (element.halfLife.kind === "stable") {
				return { state: null, badge: "∞", hidden: false };
			}
			if (element.halfLife.kind === "unavailable") {
				return { state: null, badge: null, hidden: true };
			}
			const seconds = element.halfLife.seconds;
			return {
				state: null,
				badge: halfLifeBadge(seconds, language),
				hidden: Math.log10(seconds) < state.halfLifeLogSeconds,
			};
		}
	}
}
