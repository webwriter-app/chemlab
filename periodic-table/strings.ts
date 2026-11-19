/**
 * Interface strings and language resolution of the periodic table.
 *
 * The table ships English and German. It resolves the nearest explicit `lang`
 * on itself or on the enclosing content, crossing shadow hosts, and falls back
 * to English for every other language. The lab widget's own helper defaults to
 * German and reads the lab message bundle, so the table keeps its own strings
 * instead of inheriting that behaviour.
 *
 * @module periodic-table/strings
 */

/** Interface language of the table. */
export type Language = "en" | "de";

/** Languages the table ships, in fallback order. */
export const LANGUAGES: readonly Language[] = ["en", "de"];

/** Every interface string the table renders. */
export type StringKey =
	| "widgetLabel"
	| "searchLabel"
	| "searchPlaceholder"
	| "filterLabel"
	| "filterAll"
	| "viewLabel"
	| "viewTable"
	| "viewList"
	| "reset"
	| "resultCount"
	| "resultCountOne"
	| "noResults"
	| "legendLabel"
	| "gridLabel"
	| "groupLabel"
	| "periodLabel"
	| "seriesLabel"
	| "cellLabel"
	| "placeholderLabel"
	| "jumpToSeries"
	| "detailsLabel"
	| "detailsEmpty"
	| "detailsHint"
	| "fieldGroup"
	| "fieldPeriod"
	| "fieldFamily"
	| "fieldBlock"
	| "fieldWeight"
	| "fieldPhase"
	| "fieldConfiguration"
	| "fieldShells"
	| "groupUnassigned"
	| "groupConventionDependent"
	| "weightNone"
	| "weightUnavailable"
	| "valueUnavailable"
	| "valuePredicted"
	| "phaseSolid"
	| "phaseLiquid"
	| "phaseGas"
	| "conditions"
	| "sourcesLabel"
	| "sourcesHint"
	| "sourceRelease"
	| "sourceRetrieved"
	| "sourceLicense"
	| "fieldIdentity"
	| "fieldGermanName"
	| "printTitle";

/** One language's strings. */
export type Strings = Readonly<Record<StringKey, string>>;

const EN: Strings = {
	widgetLabel: "Periodic table",
	searchLabel: "Search elements",
	searchPlaceholder: "Name, symbol or atomic number",
	filterLabel: "Family",
	filterAll: "All families",
	viewLabel: "Layout",
	viewTable: "Table",
	viewList: "List",
	reset: "Reset",
	resultCount: "{count} elements",
	resultCountOne: "1 element",
	noResults: "No element matches the search",
	legendLabel: "Families",
	gridLabel: "Periodic table of the elements",
	groupLabel: "Group {group}",
	periodLabel: "Period {period}",
	seriesLabel: "Detached series",
	cellLabel: "{number}, {name}, {symbol}, {category}",
	placeholderLabel: "{first} to {last}",
	jumpToSeries: "Jump to {series}",
	detailsLabel: "Element details",
	detailsEmpty: "Select an element to see its details.",
	detailsHint: "Values refer to the neutral atom at 25 °C and 1 bar.",
	fieldGroup: "Group",
	fieldPeriod: "Period",
	fieldFamily: "Family",
	fieldBlock: "Block",
	fieldWeight: "Standard atomic weight",
	fieldPhase: "State",
	fieldConfiguration: "Electron configuration",
	fieldShells: "Electrons per shell",
	groupUnassigned: "Not assigned",
	groupConventionDependent: "Depends on the convention",
	weightNone: "No standard atomic weight",
	weightUnavailable: "Unavailable",
	valueUnavailable: "Unavailable",
	valuePredicted: "predicted",
	phaseSolid: "Solid",
	phaseLiquid: "Liquid",
	phaseGas: "Gas",
	conditions: "{temperature} °C · {pressure} bar",
	sourcesLabel: "Sources",
	sourcesHint: "Each field names the source it was taken from.",
	sourceRelease: "Release {release}",
	sourceRetrieved: "Retrieved {retrieved}",
	sourceLicense: "License: {license}",
	fieldIdentity: "Identity",
	fieldGermanName: "German name",
	printTitle: "Periodic table",
};

const DE: Strings = {
	widgetLabel: "Periodensystem",
	searchLabel: "Elemente suchen",
	searchPlaceholder: "Name, Symbol oder Ordnungszahl",
	filterLabel: "Stoffklasse",
	filterAll: "Alle Stoffklassen",
	viewLabel: "Darstellung",
	viewTable: "Tabelle",
	viewList: "Liste",
	reset: "Zurücksetzen",
	resultCount: "{count} Elemente",
	resultCountOne: "1 Element",
	noResults: "Kein Element passt zur Suche",
	legendLabel: "Stoffklassen",
	gridLabel: "Periodensystem der Elemente",
	groupLabel: "Gruppe {group}",
	periodLabel: "Periode {period}",
	seriesLabel: "Abgesetzte Reihen",
	cellLabel: "{number}, {name}, {symbol}, {category}",
	placeholderLabel: "{first} bis {last}",
	jumpToSeries: "Zu {series} springen",
	detailsLabel: "Elementdaten",
	detailsEmpty: "Wähle ein Element, um seine Daten zu sehen.",
	detailsHint: "Die Werte gelten für das neutrale Atom bei 25 °C und 1 bar.",
	fieldGroup: "Gruppe",
	fieldPeriod: "Periode",
	fieldFamily: "Stoffklasse",
	fieldBlock: "Block",
	fieldWeight: "Standardatommasse",
	fieldPhase: "Aggregatzustand",
	fieldConfiguration: "Elektronenkonfiguration",
	fieldShells: "Elektronen je Schale",
	groupUnassigned: "Nicht zugeordnet",
	groupConventionDependent: "Hängt von der Konvention ab",
	weightNone: "Keine Standardatommasse",
	weightUnavailable: "Nicht verfügbar",
	valueUnavailable: "Nicht verfügbar",
	valuePredicted: "vorhergesagt",
	phaseSolid: "Fest",
	phaseLiquid: "Flüssig",
	phaseGas: "Gasförmig",
	conditions: "{temperature} °C · {pressure} bar",
	sourcesLabel: "Quellen",
	sourcesHint: "Jedes Feld nennt die Quelle, aus der es stammt.",
	sourceRelease: "Ausgabe {release}",
	sourceRetrieved: "Abgerufen am {retrieved}",
	sourceLicense: "Lizenz: {license}",
	fieldIdentity: "Identität",
	fieldGermanName: "Deutscher Name",
	printTitle: "Periodensystem",
};

const STRINGS: Readonly<Record<Language, Strings>> = { en: EN, de: DE };

/**
 * Maps a language tag to a shipped language.
 *
 * Regional tags such as `de-AT` or `en-GB` map to their base language; every
 * other tag falls back to English.
 *
 * @param tag - Language tag from markup or a host.
 * @returns The shipped language.
 */
export function languageFromTag(tag: string | null | undefined): Language {
	const base = (tag ?? "").trim().toLowerCase().split(/[-_]/)[0];
	return base === "de" ? "de" : "en";
}

/**
 * Returns the strings of a language.
 *
 * @param language - Shipped language.
 * @returns The string table.
 */
export function strings(language: Language): Strings {
	return STRINGS[language];
}

/**
 * Fills the placeholders of a template.
 *
 * @param template - Template with `{name}` placeholders.
 * @param values - Replacement values by placeholder name.
 * @returns The filled text; unknown placeholders stay as they are.
 */
export function format(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
	);
}

/** Minimal shape of a node the language walk needs. */
export interface LanguageNode {
	readonly nodeType?: number;
	getAttribute?(name: string): string | null;
	readonly parentElement?: LanguageNode | null;
	getRootNode?(): LanguageNode;
	readonly host?: LanguageNode | null;
}

/**
 * Reads the `lang` attribute of a node.
 *
 * @param node - Candidate node.
 * @returns The attribute value, or `null` when the node has none.
 */
function langOf(node: LanguageNode): string | null {
	if (typeof node.getAttribute !== "function") return null;
	return node.getAttribute("lang");
}

/**
 * Walks one step towards the document root, leaving a shadow tree through its host.
 *
 * @param node - Current node.
 * @returns The parent node, or `null` at the document root.
 */
function parentOf(node: LanguageNode): LanguageNode | null {
	if (node.parentElement) return node.parentElement;
	const root = typeof node.getRootNode === "function" ? node.getRootNode() : null;
	if (!root || root === node) return null;
	return root.host ?? null;
}

/**
 * Resolves the interface language of a node.
 *
 * Uses the nearest explicit `lang` on the node or on the enclosing content,
 * crossing shadow hosts, and falls back to English.
 *
 * @param node - Node to start from, usually the widget host.
 * @returns The shipped language.
 */
export function resolveLanguage(node: LanguageNode | null | undefined): Language {
	for (let current = node ?? null; current; current = parentOf(current)) {
		const tag = langOf(current);
		if (tag !== null && tag.trim() !== "") return languageFromTag(tag);
	}
	return "en";
}

/**
 * Lists the nodes the language walk visits, nearest first.
 *
 * The widget observes these nodes for `lang` changes, so a language switch on
 * the worksheet or on an enclosing section reaches the table without a reload.
 *
 * @param node - Node to start from, usually the widget host.
 * @returns The node itself and every ancestor up to the document root.
 */
export function languageAncestors(node: LanguageNode | null | undefined): LanguageNode[] {
	const chain: LanguageNode[] = [];
	for (let current = node ?? null; current; current = parentOf(current)) chain.push(current);
	return chain;
}
