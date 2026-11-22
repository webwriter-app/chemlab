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
	| "filtersLabel"
	| "filterHeading"
	| "searchLabel"
	| "searchPlaceholder"
	| "viewLabel"
	| "viewTable"
	| "viewList"
	| "reset"
	| "resetMode"
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
	| "detailsLabel"
	| "detailsEmpty"
	| "detailsHint"
	| "detailsExpand"
	| "detailsCollapse"
	| "swapUnit"
	| "fieldGroup"
	| "fieldPeriod"
	| "fieldFamily"
	| "fieldBlock"
	| "fieldWeight"
	| "fieldPhase"
	| "fieldMelting"
	| "fieldBoiling"
	| "fieldSublimation"
	| "fieldDiscovery"
	| "fieldConfiguration"
	| "fieldShells"
	| "fieldReferenceLattice"
	| "valueSolidMercury"
	| "fieldRadius"
	| "fieldElectronegativity"
	| "fieldIonization"
	| "fieldHalfLife"
	| "fieldStableNuclide"
	| "fieldMassNumber"
	| "sectionPosition"
	| "sectionProperties"
	| "sectionHistory"
	| "sectionStructure"
	| "sectionTemperatures"
	| "qualifierHint"
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
	| "discoveryAntiquity"
	| "modeLabel"
	| "modeHeading"
	| "modeOff"
	| "modeTemperature"
	| "modeDiscovery"
	| "modeRadius"
	| "modeElectronegativity"
	| "modeIonization"
	| "modeHalfLife"
	| "temperatureSlider"
	| "yearSlider"
	| "radiusSlider"
	| "electronegativitySlider"
	| "ionizationSlider"
	| "halfLifeSlider"
	| "halfLifeStable"
	| "stateLegend"
	| "stateUnknown"
	| "infoLabel"
	| "infoIntro"
	| "infoConditions"
	| "infoPhaseModel"
	| "infoDiscovery"
	| "infoFields"
	| "infoClose"
	| "sourceRelease"
	| "sourceRetrieved"
	| "sourceLicense"
	| "fieldIdentity"
	| "fieldGermanName"
	| "fieldSymbol"
	| "fieldName"
	| "fieldUncertainty"
	| "fieldNoteCodes"
	| "infoSources"
	| "infoNotes"
	| "printTitle";

/** One language's strings. */
export type Strings = Readonly<Record<StringKey, string>>;

const EN: Strings = {
	widgetLabel: "Periodic table",
	filtersLabel: "Search and filter",
	filterHeading: "Filter",
	searchLabel: "Search elements",
	searchPlaceholder: "Name, symbol, number",
	viewLabel: "Layout",
	viewTable: "Table",
	viewList: "List",
	reset: "Reset",
	resetMode: "Reset mode",
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
	detailsLabel: "Element details",
	detailsEmpty: "Select an element to see its details.",
	detailsHint: "Values refer to the neutral atom.",
	detailsExpand: "Show all details",
	detailsCollapse: "Show less",
	swapUnit: "Switch unit",
	fieldGroup: "Group",
	fieldReferenceLattice: "Reference lattice",
	valueSolidMercury: "solid below 234.3 K",
	fieldPeriod: "Period",
	fieldFamily: "Family",
	fieldBlock: "Block",
	fieldWeight: "Standard atomic weight",
	fieldPhase: "State",
	fieldMelting: "Melting point",
	fieldBoiling: "Boiling point",
	fieldSublimation: "Sublimation point",
	fieldDiscovery: "Discovered",
	fieldConfiguration: "Electron configuration",
	fieldShells: "Electrons per shell",
	fieldRadius: "Atomic radius",
	fieldElectronegativity: "Electronegativity",
	fieldIonization: "Ionization energy",
	fieldHalfLife: "Half-life",
	fieldStableNuclide: "Stable nuclide",
	fieldMassNumber: "Mass number",
	sectionPosition: "Position",
	sectionProperties: "Properties",
	sectionHistory: "History",
	sectionStructure: "Structure",
	sectionTemperatures: "Temperatures",
	qualifierHint: "Predicted value, not measured",
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
	discoveryAntiquity: "Antiquity",
	modeLabel: "Show",
	modeHeading: "Display",
	modeOff: "Off",
	modeTemperature: "Temperature",
	modeDiscovery: "Discovery",
	modeRadius: "Radius",
	modeElectronegativity: "Electronegativity",
	modeIonization: "Ionization",
	modeHalfLife: "Half-life",
	temperatureSlider: "Temperature",
	yearSlider: "Year",
	radiusSlider: "Largest atomic radius",
	electronegativitySlider: "Smallest electronegativity",
	ionizationSlider: "Smallest ionization energy",
	halfLifeSlider: "Shortest half-life",
	halfLifeStable: "stable",
	stateLegend: "State at these conditions",
	stateUnknown: "Unknown",
	infoLabel: "Sources and notes",
	infoIntro:
		"The table is built from the sources below. Every value keeps the state its source reports: reported, predicted or unavailable.",
	infoConditions: "States and temperatures refer to {conditions}.",
	infoPhaseModel:
		"At other temperatures the state follows the melting and boiling points at 1 bar. Carbon and arsenic sublime, so they have no liquid range at standard pressure.",
	infoDiscovery:
		"Years of discovery and first synthesis follow the source. Eleven elements have been in use since antiquity and carry no year.",
	infoFields: "Fields",
	infoSources: "Sources",
	infoNotes: "Notes",
	infoClose: "Close",
	sourceRelease: "Release {release}",
	sourceRetrieved: "Retrieved {retrieved}",
	sourceLicense: "License: {license}",
	fieldIdentity: "Identity",
	fieldGermanName: "German name",
	fieldSymbol: "Symbol",
	fieldName: "Name",
	fieldUncertainty: "Uncertainty digits",
	fieldNoteCodes: "Note codes",
	printTitle: "Periodic table",
};

const DE: Strings = {
	widgetLabel: "Periodensystem",
	filtersLabel: "Suchen und filtern",
	filterHeading: "Filter",
	searchLabel: "Elemente suchen",
	searchPlaceholder: "Name, Symbol, Nummer",
	viewLabel: "Darstellung",
	viewTable: "Tabelle",
	viewList: "Liste",
	reset: "Zurücksetzen",
	resetMode: "Modus zurücksetzen",
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
	detailsLabel: "Elementdaten",
	detailsEmpty: "Wähle ein Element, um seine Daten zu sehen.",
	detailsHint: "Die Werte gelten für das neutrale Atom.",
	detailsExpand: "Alle Daten anzeigen",
	detailsCollapse: "Weniger anzeigen",
	swapUnit: "Einheit wechseln",
	fieldGroup: "Gruppe",
	fieldReferenceLattice: "Referenzgitter",
	valueSolidMercury: "fest unterhalb von 234,3 K",
	fieldPeriod: "Periode",
	fieldFamily: "Stoffklasse",
	fieldBlock: "Block",
	fieldWeight: "Standardatommasse",
	fieldPhase: "Aggregatzustand",
	fieldMelting: "Schmelzpunkt",
	fieldBoiling: "Siedepunkt",
	fieldSublimation: "Sublimationspunkt",
	fieldDiscovery: "Entdeckt",
	fieldConfiguration: "Elektronenkonfiguration",
	fieldShells: "Elektronen je Schale",
	fieldRadius: "Atomradius",
	fieldElectronegativity: "Elektronegativität",
	fieldIonization: "Ionisierungsenergie",
	fieldHalfLife: "Halbwertszeit",
	fieldStableNuclide: "Stabiles Nuklid",
	fieldMassNumber: "Massenzahl",
	sectionPosition: "Position",
	sectionProperties: "Eigenschaften",
	sectionHistory: "Geschichte",
	sectionStructure: "Aufbau",
	sectionTemperatures: "Temperaturen",
	qualifierHint: "Vorhergesagter Wert, nicht gemessen",
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
	discoveryAntiquity: "Antike",
	modeLabel: "Anzeigen",
	modeHeading: "Anzeige",
	modeOff: "Aus",
	modeTemperature: "Temperatur",
	modeDiscovery: "Entdeckung",
	modeRadius: "Radius",
	modeElectronegativity: "Elektronegativität",
	modeIonization: "Ionisierung",
	modeHalfLife: "Halbwertszeit",
	temperatureSlider: "Temperatur",
	yearSlider: "Jahr",
	radiusSlider: "Größter Atomradius",
	electronegativitySlider: "Kleinste Elektronegativität",
	ionizationSlider: "Kleinste Ionisierungsenergie",
	halfLifeSlider: "Kürzeste Halbwertszeit",
	halfLifeStable: "stabil",
	stateLegend: "Aggregatzustand bei diesen Bedingungen",
	stateUnknown: "Unbekannt",
	infoLabel: "Quellen und Hinweise",
	infoIntro:
		"Die Tabelle beruht auf den unten genannten Quellen. Jeder Wert behält den Stand seiner Quelle: berichtet, vorhergesagt oder nicht verfügbar.",
	infoConditions: "Aggregatzustände und Temperaturen gelten für {conditions}.",
	infoPhaseModel:
		"Bei anderen Temperaturen folgt der Aggregatzustand dem Schmelz- und dem Siedepunkt bei 1 bar. Kohlenstoff und Arsen sublimieren und haben bei Normaldruck keinen flüssigen Bereich.",
	infoDiscovery:
		"Jahreszahlen der Entdeckung und der ersten Darstellung folgen der Quelle. Elf Elemente sind seit der Antike in Gebrauch und tragen keine Jahreszahl.",
	infoFields: "Felder",
	infoSources: "Quellen",
	infoNotes: "Hinweise",
	infoClose: "Schließen",
	sourceRelease: "Ausgabe {release}",
	sourceRetrieved: "Abgerufen am {retrieved}",
	sourceLicense: "Lizenz: {license}",
	fieldIdentity: "Identität",
	fieldGermanName: "Deutscher Name",
	fieldSymbol: "Symbol",
	fieldName: "Name",
	fieldUncertainty: "Unsicherheitsstellen",
	fieldNoteCodes: "Fußnoten",
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
