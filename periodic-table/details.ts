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
	type Provenance,
} from "./element-reference";
import { format, strings, type Language } from "./strings";

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

/** The fields one source supports for an element. */
export interface SourceUsage {
	/** Source identifier, one of the keys of `SOURCES`. */
	readonly sourceId: string;
	/** Localized names of the fields taken from that source. */
	readonly fields: readonly string[];
}

/**
 * Renders the reference conditions of the phase values.
 *
 * @param language - Interface language.
 * @returns The conditions as text, for example `25 °C · 1 bar`.
 */
export function conditionsText(language: Language): string {
	return format(strings(language).conditions, {
		temperature: CONDITIONS.temperatureK - 273.15,
		pressure: CONDITIONS.pressureBar,
	});
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
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns Group, period, family, block, weight, phase, configuration and shells.
 */
export function detailRows(element: ElementReference, language: Language): readonly DetailRow[] {
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
	if (element.phase.status === "unavailable") {
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
 * Groups the fields of an element by the source they come from.
 *
 * @param element - Element of the reference bundle.
 * @param language - Interface language.
 * @returns One entry per source, in the order the fields appear in the record.
 */
export function sourceUsage(element: ElementReference, language: Language): readonly SourceUsage[] {
	const t = strings(language);
	const fields: readonly (readonly [string, Provenance | undefined])[] = [
		[t.fieldIdentity, element.identitySources.iupac],
		[t.fieldGermanName, element.identitySources.germanName],
		[t.fieldGroup, element.group.provenance],
		[t.fieldBlock, element.block.provenance],
		[t.fieldWeight, element.weight.kind === "unavailable" ? undefined : element.weight.provenance],
		[t.fieldPhase, element.phase.provenance],
		[t.fieldConfiguration, element.configuration.provenance],
	];
	const usage = new Map<string, string[]>();
	for (const [label, provenance] of fields) {
		if (!provenance) continue;
		const entry = usage.get(provenance.sourceId);
		if (entry) entry.push(label);
		else usage.set(provenance.sourceId, [label]);
	}
	return [...usage].map(([sourceId, labels]) => ({ sourceId, fields: labels }));
}

/**
 * Looks up the metadata of a source.
 *
 * @param sourceId - Source identifier.
 * @returns The source metadata, or `undefined` for an unknown identifier.
 */
export function sourceOf(sourceId: string) {
	return SOURCES[sourceId];
}
