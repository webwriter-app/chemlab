/**
 * Reference data for the periodic table widget.
 *
 * The records themselves are generated from the vendored sources under
 * `data/periodic-table/`; this module owns the schema, the generated bundle
 * import and the indexed access by atomic number. Nothing here depends on the
 * lab widget, on Lit or on the DOM, so the data can be tested and reused on its
 * own.
 *
 * @module periodic-table/element-reference
 */

import {
	PERIODIC_TABLE_CATEGORIES,
	PERIODIC_TABLE_CONDITIONS,
	PERIODIC_TABLE_DATA_VERSION,
	PERIODIC_TABLE_ELEMENTS,
	PERIODIC_TABLE_LAYOUT,
	PERIODIC_TABLE_PLACEMENT,
	PERIODIC_TABLE_SCHEMA_VERSION,
	PERIODIC_TABLE_SOURCES,
} from "../data/periodic-table/elements.generated";

/** Identifier of a vendored source, as declared in `data/periodic-table/sources.json`. */
export type SourceId = string;

/** Where a single value comes from. */
export interface Provenance {
	/** Source identifier; always one of the keys of {@link PERIODIC_TABLE_SOURCES}. */
	readonly sourceId: SourceId;
	/** Optional pointer into the source, for example `elements.json#fe`. */
	readonly locator?: string;
}

/**
 * A value together with its epistemic state.
 *
 * `reported` means the source states the value for the element, `predicted`
 * means it is an extrapolation, and `unavailable` means no value is known.
 */
export type DataValue<T> =
	| {
			readonly status: "reported" | "predicted";
			readonly value: T;
			readonly provenance: Provenance;
	  }
	| { readonly status: "unavailable"; readonly provenance?: Provenance };

/**
 * The group of an element.
 *
 * A group number is not always meaningful: the f-block members of periods 6 and
 * 7 have no group in any convention (`unassigned`), and group 3 is read
 * differently by different tables (`convention-dependent`).
 */
export type GroupAssignment =
	| DataValue<number>
	| {
			readonly status: "unassigned" | "convention-dependent";
			readonly provenance: Provenance;
	  };

/**
 * The standard atomic weight.
 *
 * `value` keeps the published decimal string and its parenthesised uncertainty
 * digits, `interval` keeps the two endpoints of an element whose isotopic
 * composition varies, `none` means no standard atomic weight exists (the
 * element has no stable isotope) and `unavailable` means the value is unknown.
 */
export type StandardAtomicWeight =
	| {
			readonly kind: "value";
			readonly decimal: string;
			readonly uncertaintyDigits?: string;
			readonly noteCodes?: readonly string[];
			readonly provenance: Provenance;
	  }
	| {
			readonly kind: "interval";
			readonly lower: string;
			readonly upper: string;
			readonly noteCodes?: readonly string[];
			readonly provenance: Provenance;
	  }
	| { readonly kind: "none"; readonly provenance: Provenance }
	| { readonly kind: "unavailable" };

/** Orbital block of an element. */
export type ElementBlock = "s" | "p" | "d" | "f";

/** Aggregate state of the elemental substance at the bundle conditions. */
export type ElementPhase = "solid" | "liquid" | "gas";

/** One element of the reference bundle. */
export interface ElementReference {
	/** Atomic number, 1–118. */
	readonly atomicNumber: number;
	/** IUPAC element symbol. */
	readonly symbol: string;
	/** Element name per language. */
	readonly names: { readonly en: string; readonly de: string };
	/** Additional searchable names, for example older or systematic spellings. */
	readonly aliases?: { readonly en?: readonly string[]; readonly de?: readonly string[] };
	/** Where the identity of the element was checked. */
	readonly identitySources: { readonly iupac: Provenance; readonly germanName: Provenance };
	/** Period, 1–7. */
	readonly period: number;
	/** Group assignment, see {@link GroupAssignment}. */
	readonly group: GroupAssignment;
	/** Orbital block. */
	readonly block: DataValue<ElementBlock>;
	/** Standard atomic weight, see {@link StandardAtomicWeight}. */
	readonly weight: StandardAtomicWeight;
	/** Neutral ground-state electron configuration in noble-gas shorthand. */
	readonly configuration: DataValue<string>;
	/** Electrons per shell, derived from the configuration. */
	readonly shells: readonly number[];
	/** Aggregate state at the bundle conditions. */
	readonly phase: DataValue<ElementPhase>;
}

/** Localised label of a teaching category. */
export interface PeriodicTableCategory {
	readonly en: string;
	readonly de: string;
}

/** Where an element sits in the display grid, and which teaching category it carries. */
export interface PeriodicTablePlacement {
	/** Grid row, 1-based. Rows 1–7 are the main grid, 8 and 9 the detached series. */
	readonly row: number;
	/** Grid column, 1-based, 1–18. */
	readonly column: number;
	/** Teaching category key, one of the keys of {@link PERIODIC_TABLE_CATEGORIES}. */
	readonly category: string;
}

/** Metadata of a vendored source. */
export interface PeriodicTableSource {
	readonly publisher: string;
	readonly title: string;
	readonly url: string;
	readonly release: string;
	readonly retrieved: string;
	readonly license: string;
	readonly redistribution: string;
	readonly attribution: string;
	readonly input: string;
	readonly sha256: string;
}

/** Conditions the phase values refer to. */
export interface PeriodicTableConditions {
	readonly temperatureK: number;
	readonly pressureBar: number;
}

/** A detached f-block row of the display grid. */
export interface PeriodicTableSeriesRow {
	readonly row: number;
	readonly category: string;
	readonly firstAtomicNumber: number;
	readonly lastAtomicNumber: number;
	readonly firstColumn: number;
}

/** A cell of the main grid that stands for a detached series. */
export interface PeriodicTablePlaceholder {
	readonly row: number;
	readonly column: number;
	readonly category: string;
}

/** Frame of the display grid. */
export interface PeriodicTableLayout {
	readonly columns: number;
	readonly periodRows: number;
	readonly seriesRows: readonly PeriodicTableSeriesRow[];
	readonly placeholders: readonly PeriodicTablePlaceholder[];
}

/** Version of the shipped data, independent of the schema version. */
export const PERIODIC_TABLE_DATA = PERIODIC_TABLE_DATA_VERSION;

/** Version of the record schema. */
export const PERIODIC_TABLE_SCHEMA = PERIODIC_TABLE_SCHEMA_VERSION;

/** Conditions the phase values refer to. */
export const CONDITIONS: PeriodicTableConditions = PERIODIC_TABLE_CONDITIONS;

/** Metadata of every vendored source, keyed by source identifier. */
export const SOURCES: Readonly<Record<SourceId, PeriodicTableSource>> = PERIODIC_TABLE_SOURCES;

/** Teaching categories with their localised labels. */
export const CATEGORIES: Readonly<Record<string, PeriodicTableCategory>> = PERIODIC_TABLE_CATEGORIES;

/** Frame of the display grid. */
export const LAYOUT: PeriodicTableLayout = PERIODIC_TABLE_LAYOUT;

/** All elements, sorted by atomic number. */
export const ELEMENTS: readonly ElementReference[] = PERIODIC_TABLE_ELEMENTS;

/** Number of elements in the bundle. */
export const ELEMENT_COUNT = PERIODIC_TABLE_ELEMENTS.length;

const ELEMENTS_BY_NUMBER: ReadonlyMap<number, ElementReference> = new Map(
	PERIODIC_TABLE_ELEMENTS.map((element) => [element.atomicNumber, element]),
);

const PLACEMENT_BY_NUMBER: ReadonlyMap<number, PeriodicTablePlacement> = new Map(
	Object.entries(PERIODIC_TABLE_PLACEMENT).map(([key, placement]) => [Number(key), placement]),
);

/**
 * Looks up an element by atomic number.
 *
 * @param atomicNumber Atomic number, 1–118.
 * @returns The element, or `undefined` outside the supported range.
 */
export function elementByAtomicNumber(atomicNumber: number): ElementReference | undefined {
	if (!Number.isInteger(atomicNumber)) return undefined;
	return ELEMENTS_BY_NUMBER.get(atomicNumber);
}

/**
 * Looks up the display placement of an element.
 *
 * @param atomicNumber Atomic number, 1–118.
 * @returns The placement, or `undefined` outside the supported range.
 */
export function placementOf(atomicNumber: number): PeriodicTablePlacement | undefined {
	if (!Number.isInteger(atomicNumber)) return undefined;
	return PLACEMENT_BY_NUMBER.get(atomicNumber);
}

/**
 * Looks up the teaching category of an element.
 *
 * @param atomicNumber Atomic number, 1–118.
 * @returns The category key, or `undefined` outside the supported range.
 */
export function categoryOf(atomicNumber: number): string | undefined {
	return placementOf(atomicNumber)?.category;
}

/** A standard atomic weight rendered for one locale. */
export type AtomicWeightText =
	| { readonly kind: "value"; readonly text: string }
	| { readonly kind: "interval"; readonly lower: string; readonly upper: string }
	| { readonly kind: "none" }
	| { readonly kind: "unavailable" };

/**
 * Renders a standard atomic weight with the decimal separator of a locale.
 *
 * Interval endpoints are returned separately so the caller can join them with a
 * separator that cannot be confused with the decimal separator.
 *
 * @param weight The weight to render.
 * @param locale Interface language.
 * @returns The rendered weight, or the reason why there is none.
 */
export function atomicWeightText(
	weight: StandardAtomicWeight,
	locale: "en" | "de",
): AtomicWeightText {
	const separator = locale === "de" ? "," : ".";
	const localize = (decimal: string) => decimal.replace(".", separator);
	switch (weight.kind) {
		case "value":
			return {
				kind: "value",
				text:
					weight.uncertaintyDigits === undefined
						? localize(weight.decimal)
						: `${localize(weight.decimal)}(${weight.uncertaintyDigits})`,
			};
		case "interval":
			return {
				kind: "interval",
				lower: localize(weight.lower),
				upper: localize(weight.upper),
			};
		case "none":
			return { kind: "none" };
		case "unavailable":
			return { kind: "unavailable" };
	}
}
