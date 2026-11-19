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
	type ElementReference,
	type PeriodicTableSource,
} from "./element-reference";
import { celsiusFromKelvin, matterState, type MatterState, type PhaseConditions } from "./phase";
import { format, strings, type Language, type Strings } from "./strings";

/** One row of the detail card. */
export interface DetailRow {
	/** Stable key, used for tests and for the print overview. */
	readonly key: string;
	/** Localized field label. */
	readonly label: string;
	/** Rendered value. */
	readonly value: string;
	/** Optional qualifier such as `predicted`. */
	readonly qualifier?: string;
}

/**
 * Renders the conditions the state values refer to.
 *
 * @param language - Interface language.
 * @param conditions - Conditions to render, the bundle conditions by default.
 * @returns The conditions as text, for example `25 °C · 1 bar`.
 */
export function conditionsText(
	language: Language,
	conditions: PhaseConditions = CONDITIONS,
): string {
	return format(strings(language).conditions, {
		temperature: numberText(celsiusFromKelvin(conditions.temperatureK), language),
		pressure: numberText(conditions.pressureBar, language),
	});
}

/**
 * Renders a number with at most two decimals and the separator of a language.
 *
 * @param value - Number to render.
 * @param language - Interface language.
 * @returns The number as text, for example `54,36`.
 */
function numberText(value: number, language: Language): string {
	const text = String(Number(value.toFixed(2)));
	return language === "de" ? text.replace(".", ",") : text;
}

/**
 * Renders a temperature in kelvin with its Celsius equivalent.
 *
 * @param kelvin - Temperature in kelvin.
 * @param language - Interface language.
 * @returns The temperature, for example `54,36 K (−218,79 °C)`.
 */
export function temperatureText(kelvin: number, language: Language): string {
	const celsius = celsiusFromKelvin(kelvin);
	return `${numberText(kelvin, language)} K (${numberText(celsius, language)} °C)`;
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
 * The state row follows the conditions the card names. At the bundle conditions
 * it shows the reported phase with its provenance, because that is the better
 * answer there: astatine carries a predicted phase but no thermal data, so the
 * computed state would be `unknown`. At any other condition the row is computed
 * from the melting and boiling points.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @param conditions - Conditions the state row refers to, the bundle conditions by default.
 * @returns Group, period, family, block, weight, state, melting, boiling, sublimation, discovery, configuration and shells.
 */
export function detailRows(
	element: ElementReference,
	language: Language,
	conditions: PhaseConditions = CONDITIONS,
): readonly DetailRow[] {
	const t = strings(language);
	const rows: DetailRow[] = [
		{ key: "group", label: t.fieldGroup, value: groupText(element, language) },
		{ key: "period", label: t.fieldPeriod, value: String(element.period) },
		{ key: "family", label: t.fieldFamily, value: categoryText(element, language) },
	];
	if (element.block.status === "unavailable") {
		rows.push({ key: "block", label: t.fieldBlock, value: t.valueUnavailable });
	} else {
		rows.push({
			key: "block",
			label: t.fieldBlock,
			value: element.block.value,
			...(element.block.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({ key: "weight", label: t.fieldWeight, value: weightText(element, language) });
	const atBundle =
		conditions.temperatureK === CONDITIONS.temperatureK &&
		conditions.pressureBar === CONDITIONS.pressureBar;
	if (!atBundle) {
		rows.push({
			key: "phase",
			label: t.fieldPhase,
			value: stateText(matterState(element, conditions), t),
		});
	} else if (element.phase.status === "unavailable") {
		rows.push({ key: "phase", label: t.fieldPhase, value: t.valueUnavailable });
	} else {
		const phase = { solid: t.phaseSolid, liquid: t.phaseLiquid, gas: t.phaseGas }[element.phase.value];
		rows.push({
			key: "phase",
			label: t.fieldPhase,
			value: phase,
			...(element.phase.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({
		key: "melting",
		label: t.fieldMelting,
		...temperatureRow(element.melting, language, t),
	});
	rows.push({
		key: "boiling",
		label: t.fieldBoiling,
		...temperatureRow(element.boiling, language, t),
	});
	if (element.sublimation.status !== "unavailable") {
		rows.push({
			key: "sublimation",
			label: t.fieldSublimation,
			...temperatureRow(element.sublimation, language, t),
		});
	}
	rows.push({ key: "discovery", label: t.fieldDiscovery, value: discoveryText(element, language) });
	if (element.configuration.status === "unavailable") {
		rows.push({ key: "configuration", label: t.fieldConfiguration, value: t.valueUnavailable });
	} else {
		rows.push({
			key: "configuration",
			label: t.fieldConfiguration,
			value: element.configuration.value,
			...(element.configuration.status === "predicted" ? { qualifier: t.valuePredicted } : {}),
		});
	}
	rows.push({ key: "shells", label: t.fieldShells, value: element.shells.join(" · ") });
	return rows;
}

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
		default:
			return field;
	}
}
