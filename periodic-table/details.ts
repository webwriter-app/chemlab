/**
 * Detail card content of the periodic table.
 *
 * The card is assembled from the reference record instead of being written into
 * the template, so the same rows feed the visible card, the print overview and
 * the tests. Every row keeps the epistemic state of its value: a predicted phase
 * and a missing configuration must not look like a reported one.
 *
 * @module periodic-table/details
 */

import {
	CATEGORIES,
	CONDITIONS,
	SOURCES,
	atomicWeightText,
	categoryOf,
	type DataValue,
	type ElementReference,
	type PeriodicTableSource,
} from "./element-reference";
import {
	celsiusFromKelvin,
	halfLifeText,
	isotopeText,
	matterState,
	type MatterState,
	type TableMode,
} from "./phase";
import { format, strings, type Language, type Strings } from "./strings";

/**
 * Section of the detail card a row belongs to.
 *
 * The order of the members is the order the card shows them in: the key rows
 * come first, and `temperatures` opens the part that only the expanded card
 * reveals.
 */
export type DetailSection =
	| "header"
	| "properties"
	| "temperatures"
	| "position"
	| "history"
	| "structure";

/** One row of the detail card. */
export interface DetailRow {
	/** Stable key, used for tests and for the print overview. */
	readonly key: string;
	/** Localized field label. */
	readonly label: string;
	/** Rendered value. */
	readonly value: string;
	/** Section of the card the row is grouped under. */
	readonly section: DetailSection;
	/** Optional qualifier such as `predicted`. */
	readonly qualifier?: string;
	/** State the row is about, so the card can draw its colour next to the value. */
	readonly swatch?: MatterState;
}

/**
 * Renders the conditions the state values refer to.
 *
 * The pressure is fixed: the bundle stores its thermal data at 1 bar and the
 * table only varies the temperature.
 *
 * @param language - Interface language.
 * @param temperatureK - Temperature to render, the bundle temperature by default.
 * @returns The conditions as text, for example `25 °C · 1 bar`.
 */
export function conditionsText(
	language: Language,
	temperatureK: number = CONDITIONS.temperatureK,
): string {
	return format(strings(language).conditions, {
		temperature: numberText(celsiusFromKelvin(temperatureK), language),
		pressure: numberText(CONDITIONS.pressureBar, language),
	});
}

/**
 * Renders a number with at most two decimals and the separator of a language.
 *
 * @param value - Number to render.
 * @param language - Interface language.
 * @returns The number as text, for example `54,36`.
 */
export function numberText(value: number, language: Language): string {
	const text = String(Number(value.toFixed(2)));
	return language === "de" ? text.replace(".", ",") : text;
}

/**
 * Renders a temperature in kelvin with its Celsius equivalent.
 *
 * The number and its unit are joined by a non-breaking space, so a narrow card
 * wraps the Celsius value as a whole instead of leaving the degree sign alone on
 * the next line.
 *
 * @param kelvin - Temperature in kelvin.
 * @param language - Interface language.
 * @returns The temperature, for example `54,36 K (−218,79 °C)`.
 */
export function temperatureText(kelvin: number, language: Language): string {
	const celsius = celsiusFromKelvin(kelvin);
	return `${numberText(kelvin, language)}\u00A0K (${numberText(celsius, language)}\u00A0°C)`;
}

/**
 * Renders the aggregate state of an element.
 *
 * @param state - State to render.
 * @param t - Interface strings.
 * @returns The localized state label.
 */
export function stateText(state: MatterState, t: Strings): string {
	switch (state) {
		case "solid":
			return t.phaseSolid;
		case "liquid":
			return t.phaseLiquid;
		case "gas":
			return t.phaseGas;
		case "unknown":
			return t.stateUnknown;
	}
}

/**
 * Renders when an element became known.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns The year with its discoverer, `Antiquity`, or the reason why there is none.
 */
export function discoveryText(element: ElementReference, language: Language): string {
	const t = strings(language);
	switch (element.discovery.kind) {
		case "antiquity":
			return t.discoveryAntiquity;
		case "unavailable":
			return t.valueUnavailable;
		case "year":
			return element.discovery.by
				? `${element.discovery.year} · ${element.discovery.by}`
				: String(element.discovery.year);
	}
}

/**
 * Renders a standard atomic weight for the detail card.
 *
 * Interval endpoints are wrapped in brackets and separated by a comma in English
 * and a semicolon in German, so the separator can never be read as a decimal
 * separator.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns The rendered weight or the reason why there is none.
 */
export function weightText(element: ElementReference, language: Language): string {
	const text = atomicWeightText(element.weight, language);
	switch (text.kind) {
		case "value":
			return text.text;
		case "interval":
			return language === "de" ? `[${text.lower}; ${text.upper}]` : `[${text.lower}, ${text.upper}]`;
		case "none":
			return strings(language).weightNone;
		case "unavailable":
			return strings(language).weightUnavailable;
	}
}

/**
 * Renders the group assignment of an element.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns The group number or the reason why there is none.
 */
export function groupText(element: ElementReference, language: Language): string {
	const t = strings(language);
	switch (element.group.status) {
		case "reported":
		case "predicted":
			return String(element.group.value);
		case "convention-dependent":
			return t.groupConventionDependent;
		case "unassigned":
			return t.groupUnassigned;
		case "unavailable":
			return t.valueUnavailable;
	}
}

/**
 * Renders the localized name of an element's teaching category.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns The category label, or an empty string for an unknown category.
 */
export function categoryText(element: ElementReference, language: Language): string {
	const category = categoryOf(element.atomicNumber);
	return category ? CATEGORIES[category]?.[language] ?? category : "";
}

/**
 * Builds the rows of the detail card.
 *
 * The state row follows the temperature the card names. At the bundle
 * temperature it shows the reported phase with its provenance, because that is
 * the better answer there: astatine carries a predicted phase but no thermal
 * data, so the computed state would be `unknown`. At any other temperature the
 * row is computed from the melting and boiling points.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @param temperatureK - Temperature the state row refers to, the bundle temperature by default.
 * @returns Group, period, family, block, weight, state, melting, boiling, sublimation, discovery, configuration and shells.
 */
export function detailRows(
	element: ElementReference,
	language: Language,
	temperatureK: number = CONDITIONS.temperatureK,
): readonly DetailRow[] {
	const t = strings(language);
	const rows: DetailRow[] = [
		{ key: "group", label: t.fieldGroup, value: groupText(element, language), section: "position" },
		{ key: "period", label: t.fieldPeriod, value: String(element.period), section: "position" },
		{ key: "family", label: t.fieldFamily, value: categoryText(element, language), section: "header" },
	];
	if (element.block.status === "unavailable") {
		rows.push({ key: "block", label: t.fieldBlock, value: t.valueUnavailable, section: "position" });
	} else {
		rows.push({
			key: "block",
			label: t.fieldBlock,
			value: element.block.value,
			section: "position",
			...(element.block.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({
		key: "weight",
		label: t.fieldWeight,
		value: weightText(element, language),
		section: "properties",
	});
	const atBundle = temperatureK === CONDITIONS.temperatureK;
	if (!atBundle) {
		const state = matterState(element, temperatureK);
		rows.push({
			key: "phase",
			label: t.fieldPhase,
			value: stateText(state, t),
			section: "properties",
			swatch: state,
		});
	} else if (element.phase.status === "unavailable") {
		rows.push({ key: "phase", label: t.fieldPhase, value: t.valueUnavailable, section: "properties" });
	} else {
		const phase = { solid: t.phaseSolid, liquid: t.phaseLiquid, gas: t.phaseGas }[element.phase.value];
		rows.push({
			key: "phase",
			label: t.fieldPhase,
			value: phase,
			section: "properties",
			swatch: element.phase.value,
			...(element.phase.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({
		key: "radius",
		label: t.fieldRadius,
		section: "properties",
		...numericRow(element.radius, (value) => `${numberText(value, language)}\u00A0pm`, t),
	});
	rows.push({
		key: "electronegativity",
		label: t.fieldElectronegativity,
		section: "properties",
		...numericRow(element.electronegativity, (value) => numberText(value, language), t),
	});
	rows.push({
		key: "ionization",
		label: t.fieldIonization,
		section: "properties",
		...numericRow(element.ionization, (value) => `${numberText(value, language)}\u00A0eV`, t),
	});
	rows.push({
		key: "halfLife",
		label: t.fieldHalfLife,
		section: "properties",
		...halfLifeRow(element, language, t),
	});
	// The thermal rows form their own section: the collapsed card ends before
	// them, because the weight and the state answer the common question and the
	// free block of the table only holds a few lines.
	rows.push({
		key: "melting",
		label: t.fieldMelting,
		section: "temperatures",
		...temperatureRow(element.melting, language, t),
	});
	rows.push({
		key: "boiling",
		label: t.fieldBoiling,
		section: "temperatures",
		...temperatureRow(element.boiling, language, t),
	});
	if (element.sublimation.status !== "unavailable") {
		rows.push({
			key: "sublimation",
			label: t.fieldSublimation,
			section: "temperatures",
			...temperatureRow(element.sublimation, language, t),
		});
	}
	rows.push({
		key: "discovery",
		label: t.fieldDiscovery,
		value: discoveryText(element, language),
		section: "history",
	});
	if (element.configuration.status === "unavailable") {
		rows.push({
			key: "configuration",
			label: t.fieldConfiguration,
			value: t.valueUnavailable,
			section: "structure",
		});
	} else {
		rows.push({
			key: "configuration",
			label: t.fieldConfiguration,
			value: element.configuration.value,
			section: "structure",
			...(element.configuration.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({
		key: "shells",
		label: t.fieldShells,
		value: element.shells.join(" · "),
		section: "structure",
	});
	return rows;
}

/**
 * Picks the rows the collapsed card shows.
 *
 * The first row is always the standard atomic weight. The second one answers the
 * mode the table is in: the state at the chosen temperature, or the value the
 * mode filters by. The expanded card leaves these rows out of its sections, so no
 * value appears twice in one card.
 *
 * @param rows - Rows of the card.
 * @param mode - Mode of the table.
 * @returns The key rows in display order.
 */
export function keyRows(rows: readonly DetailRow[], mode: TableMode): readonly DetailRow[] {
	const answer = MODE_ROW[mode];
	return rows.filter((row) => row.key === "weight" || row.key === answer);
}

/**
 * Row that answers each mode in the collapsed card.
 *
 * The temperature mode shares the state row with the off mode, because the card
 * already renders that row at the chosen temperature.
 */
const MODE_ROW: Readonly<Record<TableMode, string>> = {
	off: "phase",
	temperature: "phase",
	discovery: "discovery",
	radius: "radius",
	electronegativity: "electronegativity",
	ionization: "ionization",
	halfLife: "halfLife",
};

/**
 * Builds the value and qualifier of a temperature row.
 *
 * @param value - Temperature of the reference bundle.
 * @param language - Interface language.
 * @param t - Interface strings.
 * @returns The rendered temperature, or the reason why there is none.
 */
function temperatureRow(
	value: ElementReference["melting"],
	language: Language,
	t: Strings,
): { readonly value: string; readonly qualifier?: string } {
	if (value.status === "unavailable") return { value: t.valueUnavailable };
	return {
		value: temperatureText(value.value, language),
		...(value.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
	};
}

/**
 * Builds the value and qualifier of a numeric row.
 *
 * @param value - Numeric value of the reference bundle.
 * @param render - Renders the number with its unit.
 * @param t - Interface strings.
 * @returns The rendered value, or the reason why there is none.
 */
function numericRow(
	value: DataValue<number>,
	render: (value: number) => string,
	t: Strings,
): { readonly value: string; readonly qualifier?: string } {
	if (value.status === "unavailable") return { value: t.valueUnavailable };
	return {
		value: render(value.value),
		...(value.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
	};
}

/**
 * Builds the value of the half-life row.
 *
 * A stable nuclide has no half-life, so the row says so instead of showing a
 * number. A radioactive one names its isotope next to the duration, because the
 * bundle stores the half-life of the most stable nuclide and not of the element.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @param t - Interface strings.
 * @returns The rendered half-life.
 */
function halfLifeRow(
	element: ElementReference,
	language: Language,
	t: Strings,
): { readonly value: string } {
	const record = element.halfLife;
	switch (record.kind) {
		case "stable":
			return { value: t.halfLifeStable };
		case "unavailable":
			return { value: t.valueUnavailable };
		case "value":
			return {
				value: `${halfLifeText(record.seconds, language)} (${isotopeText(record.massNumber, element.symbol)})`,
			};
	}
}

/**
 * Lists every source of the bundle.
 *
 * @returns The source metadata in declaration order.
 */
export function sourceList(): readonly PeriodicTableSource[] {
	return Object.values(SOURCES);
}

/**
 * Localizes one field path of a source.
 *
 * The paths come from `sources.json` and name the upstream keys, so they are
 * translated here instead of being shown raw. An unknown path is returned
 * unchanged, which keeps a newly declared field visible until it gets a label.
 *
 * @param field - Field path as declared by the source.
 * @param t - Interface strings.
 * @returns The localized field name.
 */
export function sourceFieldText(field: string, t: Strings): string {
	switch (field) {
		case "names.de":
			return t.fieldGermanName;
		case "period":
			return t.fieldPeriod;
		case "group":
			return t.fieldGroup;
		case "block":
			return t.fieldBlock;
		case "phase":
			return t.fieldPhase;
		case "electron_config":
			return t.fieldConfiguration;
		case "set":
			return t.fieldFamily;
		case "temperature.melting":
			return t.fieldMelting;
		case "temperature.boiling":
			return t.fieldBoiling;
		case "temperature.sublimation":
			return t.fieldSublimation;
		case "discovery":
			return t.fieldDiscovery;
		case "symbol":
			return t.fieldSymbol;
		case "name":
			return t.fieldName;
		case "standard atomic weight":
			return t.fieldWeight;
		case "uncertainty digits":
			return t.fieldUncertainty;
		case "note codes":
			return t.fieldNoteCodes;
		case "neutral ground-state subshell occupation":
			return t.fieldShells;
		case "radius.empirical":
			return t.fieldRadius;
		case "negativity.pauling":
			return t.fieldElectronegativity;
		case "ionization.values":
			return t.fieldIonization;
		case "nuclides.half_life_sec":
			return t.fieldHalfLife;
		case "nuclides.stable":
			return t.fieldStableNuclide;
		case "nuclides.m":
			return t.fieldMassNumber;
		default:
			return field;
	}
}
