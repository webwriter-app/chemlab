/**
 * Filters a teacher can store in the document.
 *
 * Search text, family filter and the active property mode narrow the table.
 * A teacher who prepared a view wants the learner to open exactly that view, so
 * the three belong to the document and not to the session. This module owns the
 * shape of the stored block and its normalization: a hand-edited or outdated
 * block may carry anything, and a value the model cannot read falls back to the
 * default instead of emptying the table.
 *
 * @module periodic-table/authored-filters
 */

import { CATEGORIES } from "./element-reference";
import {
	DEFAULT_MODE_STATE,
	DISCOVERY_RANGE,
	ELECTRONEGATIVITY_RANGE,
	HALF_LIFE_RANGE,
	IONIZATION_RANGE,
	RADIUS_RANGE,
	TABLE_MODES,
	TEMPERATURE_SLIDER,
	kelvinFromCelsius,
	type ModeState,
	type TableMode,
} from "./phase";

/** Version of the stored block, so an older file stays readable. */
export const FILTERS_VERSION = 1;

/** The three filters the table carries, in display order. */
export interface AuthoredFilters {
	/** Text of the search field, empty for no search. */
	readonly query: string;
	/** Family key of the active filter, `null` for every family. */
	readonly category: string | null;
	/** Mode the cells are coloured by, with its thresholds. */
	readonly mode: ModeState;
}

/** Filters of a document that carries none: nothing is narrowed. */
export const DEFAULT_FILTERS: AuthoredFilters = {
	query: "",
	category: null,
	mode: DEFAULT_MODE_STATE,
};

/** The temperature slider works in Celsius, the model in kelvin. */
const TEMPERATURE_BOUNDS = {
	min: kelvinFromCelsius(TEMPERATURE_SLIDER.minCelsius),
	max: kelvinFromCelsius(TEMPERATURE_SLIDER.maxCelsius),
} as const;

/**
 * Reads a number and keeps it inside its bounds.
 *
 * @param value - Authored value of the field.
 * @param min - Lowest value the slider can reach.
 * @param max - Highest value the slider can reach.
 * @param fallback - Value of a fresh table.
 * @returns The authored value, clamped, or the fallback when it is no number.
 */
function boundedNumber(value: unknown, min: number, max: number, fallback: number): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, value));
}

/**
 * Reads the property mode of a stored block.
 *
 * The mode name decides the slider, so an unknown name means `off`. Each
 * threshold is clamped to its own range: a value outside it would hide every
 * element and leave the learner with an empty table and no visible reason.
 *
 * @param value - Authored mode, unvalidated.
 * @returns A complete mode state.
 */
function readModeState(value: unknown): ModeState {
	const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
	const mode: TableMode = TABLE_MODES.find(entry => entry === source.mode) ?? DEFAULT_MODE_STATE.mode;
	return {
		mode,
		temperatureK: boundedNumber(source.temperatureK, TEMPERATURE_BOUNDS.min, TEMPERATURE_BOUNDS.max, DEFAULT_MODE_STATE.temperatureK),
		year: boundedNumber(source.year, DISCOVERY_RANGE.min, DISCOVERY_RANGE.max, DEFAULT_MODE_STATE.year),
		radiusPm: boundedNumber(source.radiusPm, RADIUS_RANGE.min, RADIUS_RANGE.max, DEFAULT_MODE_STATE.radiusPm),
		electronegativity: boundedNumber(source.electronegativity, ELECTRONEGATIVITY_RANGE.min, ELECTRONEGATIVITY_RANGE.max, DEFAULT_MODE_STATE.electronegativity),
		ionizationEv: boundedNumber(source.ionizationEv, IONIZATION_RANGE.min, IONIZATION_RANGE.max, DEFAULT_MODE_STATE.ionizationEv),
		halfLifeLogSeconds: boundedNumber(source.halfLifeLogSeconds, HALF_LIFE_RANGE.min, HALF_LIFE_RANGE.max, DEFAULT_MODE_STATE.halfLifeLogSeconds),
	};
}

/**
 * Reads the stored filters of a document.
 *
 * The block is treated as data, not as a promise: a family key the bundle does
 * not know falls back to every family, and anything that is not an object means
 * an unfiltered table. The function never throws, so a broken block cannot keep
 * the widget from rendering.
 *
 * @param value - Parsed JSON of the data slot, or anything else.
 * @returns The filters to show.
 */
export function readFilters(value: unknown): AuthoredFilters {
	if (typeof value !== "object" || value === null) return DEFAULT_FILTERS;
	const source = value as Record<string, unknown>;
	const query = typeof source.query === "string" ? source.query : "";
	const category = typeof source.category === "string" && source.category in CATEGORIES ? source.category : null;
	return { query, category, mode: readModeState(source.mode) };
}

/**
 * Writes the filters as the text of the data slot.
 *
 * The text is canonical: the same filters always produce the same string, so
 * the widget can compare a snapshot with the document instead of parsing it
 * back. Every field is written explicitly, including the defaults, because a
 * teacher who clears a filter has to overwrite the previous value.
 *
 * @param filters - Filters to store.
 * @returns Compact JSON for the script slot.
 */
export function filtersText(filters: AuthoredFilters): string {
	return JSON.stringify({
		version: FILTERS_VERSION,
		query: filters.query,
		category: filters.category,
		mode: {
			mode: filters.mode.mode,
			temperatureK: filters.mode.temperatureK,
			year: filters.mode.year,
			radiusPm: filters.mode.radiusPm,
			electronegativity: filters.mode.electronegativity,
			ionizationEv: filters.mode.ionizationEv,
			halfLifeLogSeconds: filters.mode.halfLifeLogSeconds,
		},
	});
}
