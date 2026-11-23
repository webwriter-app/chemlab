/**
 * Builds the coverage report that tracks the Molecule Builder → ChemLab
 * handoff: which catalog compound can be placed as a reagent, and which salt
 * exists as a solid and as an aqueous stock.
 *
 * The report is derived from the live modules, so adding a catalog entry
 * without regenerating the artifacts fails `tests/structure-coverage.test.ts`.
 * `scripts/generate-structure-coverage.ts` writes the tracked files.
 *
 * Salt forms are joined by their catalog formula without hydrate water. That
 * is the analytical compound a dose resolves to: a pentahydrate reference and
 * an anhydrous stock describe the same solution, while the formula keeps
 * different salts apart without guessing charges that ionic recipes leave
 * implicit (`data/chemicals.ts`).
 *
 * @module scripts/structure-coverage-model
 */

import { saltSolubility } from "../chemlib/saltSolubility";
import {
	chemicalCatalog,
	chemicalClasses,
	isWaterDefinition,
	type CatalogChemical,
	type ChemicalRecipe,
	type MoleculeDefinition,
} from "../data/chemicals";
import { catalogIsMixture, catalogStructures } from "../molecule-builder/catalog";

/**
 * Why a catalog entry still has no dose.
 *
 * The report prints one line per gap with its reason, because a gap without a
 * reason cannot be told apart from an oversight. The key is the catalog name;
 * an entry without an entry here is reported as `ohne Rezept`, which is what an
 * unfinished row looks like.
 */
export const GAP_REASONS: Readonly<Record<string, string>> = {
	Lackmus: "Farbstoffgemisch ohne Archivstruktur; das Modell kennt keinen Indikatorumschlag",
	Rotkohlsaft: "Gemisch von Anthocyanen ohne Archivstruktur; das Modell kennt keinen Indikatorumschlag",
	"Schiff-Reagenz": "Fuchsin-Schwefeldioxid-Lösung ohne Archivstruktur; eine Vertreterstruktur wäre eine gesetzte Identität",
	Olivenöl: "Esteröl; die Phasenrechnung liest Sauerstoff als polar und damit als mischbar",
};

/** How a single catalog entry reaches the lab; salts still name their phase separately. */
export type EntryForm = "salt" | "reagent" | "reference";

/** The statuses that describe a salt identity rather than a single entry. */
export type SaltStatus = "paired" | "solid-only" | "stock-only" | "reference-only";

export interface CoverageEntry {
	name: string;
	category: string;
	formula: string;
	form: EntryForm;
	phase: ChemicalRecipe["phase"] | null;
	dosable: boolean;
	dosed: boolean;
	structures: number;
	/** Formula of the analytical compound, without hydrate water. */
	identity: string | null;
	hydrated: boolean;
	/** The catalog shows the entry as a mixture of its constituents. */
	mixture: boolean;
}

export interface SaltSolubilityRecord {
	key: string;
	saturation?: number;
	ksp?: number;
	solidDensity?: number;
}

/** One catalog entry behind a salt form; hydrates keep their water of crystallization. */
export interface SaltForm {
	name: string;
	hydrated: boolean;
}

export interface SaltGroup {
	identity: string;
	label: string;
	status: SaltStatus;
	solid: SaltForm[];
	stock: SaltForm[];
	reference: SaltForm[];
	hydratedReference: boolean;
	solubility: SaltSolubilityRecord | null;
	gap: string | null;
}

export interface CoverageSummary {
	catalogEntries: number;
	withStructure: number;
	withoutStructure: number;
	dosed: number;
	reagents: number;
	mixtures: number;
	saltEntries: number;
	dosedSaltEntries: number;
	saltIdentities: number;
	paired: number;
	solidOnly: number;
	stockOnly: number;
	referenceOnly: number;
}

export interface CoverageReport {
	generatedBy: string;
	summary: CoverageSummary;
	salts: SaltGroup[];
	entries: CoverageEntry[];
	unstructured: Array<{ name: string; category: string; formula: string }>;
}

const GENERATED_BY = "scripts/generate-structure-coverage.ts";
const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

function compareText(a: string, b: string): number {
	return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Names the analytical compound of a catalog formula: subscript digits become
 * ASCII, spaces disappear and hydrate water after the middle dot is dropped.
 */
export function normalizeFormula(formula: string): string {
	return formula
		.split("·")[0]
		.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => String(SUBSCRIPT_DIGITS.indexOf(digit)))
		.replace(/\s+/g, "");
}

function ionic(definition: MoleculeDefinition): boolean {
	return definition.bonds.some((bond) => bond.split(":")[1] === "ionic");
}

function hasNetCharge(definition: MoleculeDefinition): boolean {
	return (definition.charges ?? []).reduce((sum, charge) => sum + charge, 0) !== 0;
}

/** Every modeled species besides the solvent, whether solid or dissolved. */
function soluteParts(entry: CatalogChemical): MoleculeDefinition[] {
	return (entry.recipe?.parts ?? []).map(({ molecule }) => molecule).filter((molecule) => !isWaterDefinition(molecule));
}

function isSalt(entry: CatalogChemical): boolean {
	if (entry.category === "Salze") return true;
	// A mixed stock carries ions without being a salt: Fehling II holds tartrate
	// and lye, Tollens' reagent the diamminesilver complex, Lugol's solution
	// iodide next to iodine. Only a formula that the solubility table knows can
	// stand as one, otherwise the report would file `CuSO4(aq)` as an identity
	// next to the copper sulfate it holds.
	if (!Object.prototype.hasOwnProperty.call(saltSolubility, normalizeFormula(entry.formula))) return false;
	if (soluteParts(entry).some((part) => ionic(part) || hasNetCharge(part))) return true;
	return entry.preview ? ionic(entry.preview) : false;
}

const catalogOrder = new Map<string, number>(chemicalClasses.map((category, index) => [category, index]));

function byCatalogOrder(a: { name: string; category: string }, b: { name: string; category: string }): number {
	const left = catalogOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER;
	const right = catalogOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER;
	return left === right ? compareText(a.name, b.name) : left - right;
}

function solubilityOf(entry: CatalogChemical): SaltSolubilityRecord | null {
	const key = normalizeFormula(entry.formula);
	if (!key || !Object.prototype.hasOwnProperty.call(saltSolubility, key)) return null;
	const record = saltSolubility[key];
	return { key, saturation: record.saturation, ksp: record.ksp, solidDensity: record.solidDensity };
}

/** Reads the material data a later recipe would need, without inventing any. */
export function describeSolubility(record: SaltSolubilityRecord | null): string {
	if (!record) return "not tabulated";
	const parts: string[] = [];
	if (record.saturation !== undefined) parts.push(`${record.saturation} mol/L saturation`);
	if (record.ksp !== undefined) parts.push(`Ksp ${record.ksp.toExponential(2)}`);
	if (record.solidDensity !== undefined) parts.push(`${record.solidDensity} g/mL solid density`);
	return parts.length ? `${parts.join(", ")} (${record.key})` : `listed without data (${record.key})`;
}

function gapOf(group: Omit<SaltGroup, "gap" | "label" | "status">, status: SaltStatus, label: string): string | null {
	if (status === "paired") return null;
	const hydrate = group.hydratedReference
		? ` The only solid reference is a hydrate (${group.reference.map(({ name }) => name).join(", ")}), so a recipe needs a decided hydrate.`
		: "";
	const reference = status === "reference-only" || !group.reference.length || group.hydratedReference
		? ""
		: ` The catalog lists ${group.reference.map(({ name }) => name).join(", ")} as reference only, so neither form is dosed yet.`;
	if (status === "reference-only") {
		return `Neither phase has a recipe for ${label}; only the structural preview exists.${hydrate}`;
	}
	if (status === "solid-only") {
		return group.solubility
			? `Aqueous stock missing for ${label}; ${describeSolubility(group.solubility)} is tabulated.${reference}`
			: `Aqueous stock missing for ${label} and chemlib/saltSolubility.ts has no entry for it.${reference}`;
	}
	return `Solid recipe missing for ${label}; ${group.solubility
		? `${describeSolubility(group.solubility)} is tabulated.`
		: "chemlib/saltSolubility.ts has no entry for it."}${hydrate}${reference}`;
}

/** Gathers the catalog, the builder structures and the solubility table into one report. */
export function buildCoverageReport(): CoverageReport {
	const entries: CoverageEntry[] = [];
	const unstructured: CoverageReport["unstructured"] = [];
	const groups = new Map<string, { solid: SaltForm[]; stock: SaltForm[]; reference: SaltForm[] }>();

	for (const entry of chemicalCatalog) {
		const structures = catalogStructures(entry.name).length;
		if (!structures) unstructured.push({ name: entry.name, category: entry.category, formula: entry.formula });
		const salt = isSalt(entry);
		const hydrated = entry.formula.includes("·");
		const identity = normalizeFormula(entry.formula) || null;
		const phase = entry.recipe?.phase ?? null;
		const mixture = catalogIsMixture(entry.name);
		const form: EntryForm = !entry.recipe ? "reference" : salt ? "salt" : "reagent";
		entries.push({
			name: entry.name,
			category: entry.category,
			formula: entry.formula,
			form,
			phase,
			dosable: structures > 0,
			dosed: entry.recipe !== undefined,
			structures,
			identity: salt ? identity : null,
			hydrated,
			mixture,
		});
		if (!salt || !identity) continue;
		const group = groups.get(identity) ?? { solid: [], stock: [], reference: [] };
		const member: SaltForm = { name: entry.name, hydrated };
		if (!entry.recipe) group.reference.push(member);
		else if (entry.recipe.phase === "solid") group.solid.push(member);
		else group.stock.push(member);
		groups.set(identity, group);
	}

	const salts: SaltGroup[] = [];
	for (const [identity, group] of groups) {
		const status: SaltStatus = group.solid.length && group.stock.length ? "paired"
			: group.solid.length ? "solid-only" : group.stock.length ? "stock-only" : "reference-only";
		const members = [...group.solid, ...group.stock, ...group.reference]
			.map((form) => chemicalCatalog.find((entry) => entry.name === form.name))
			.filter((entry): entry is CatalogChemical => entry !== undefined);
		const label = members.find((entry) => !entry.formula.includes("·"))?.formula ?? members[0]?.formula ?? identity;
		const byName = (a: SaltForm, b: SaltForm) => compareText(a.name, b.name);
		const solid = [...group.solid].sort(byName);
		const stock = [...group.stock].sort(byName);
		const reference = [...group.reference].sort(byName);
		const solubility = members.map(solubilityOf).find((record): record is SaltSolubilityRecord => record !== null) ?? null;
		const provided = { identity, solid, stock, reference, hydratedReference: reference.some((form) => form.hydrated), solubility };
		salts.push({ label, status, ...provided, gap: gapOf(provided, status, label) });
	}
	salts.sort((a, b) => compareText(a.label, b.label) || compareText(a.identity, b.identity));

	const count = (status: SaltStatus) => salts.filter((group) => group.status === status).length;
	const summary: CoverageSummary = {
		catalogEntries: entries.length,
		withStructure: entries.filter((entry) => entry.structures > 0).length,
		withoutStructure: unstructured.length,
		dosed: entries.filter((entry) => entry.dosed).length,
		reagents: entries.filter((entry) => entry.form === "reagent").length,
		mixtures: entries.filter((entry) => entry.mixture).length,
		saltEntries: entries.filter((entry) => entry.identity !== null).length,
		dosedSaltEntries: entries.filter((entry) => entry.dosed && entry.identity !== null).length,
		saltIdentities: salts.length,
		paired: count("paired"),
		solidOnly: count("solid-only"),
		stockOnly: count("stock-only"),
		referenceOnly: count("reference-only"),
	};

	entries.sort(byCatalogOrder);
	unstructured.sort(byCatalogOrder);
	return { generatedBy: GENERATED_BY, summary, salts, entries, unstructured };
}

/** The tracked JSON artifact. */
export function renderCoverageJson(report: CoverageReport): string {
	return `${JSON.stringify(report, null, 2)}\n`;
}

function escapeCell(text: string): string {
	return text.replace(/\|/g, "\\|");
}

function cell(forms: readonly SaltForm[]): string {
	return forms.map((form) => escapeCell(form.hydrated ? `${form.name} (hydrate)` : form.name)).join(", ") || "—";
}

const STATUS_LABELS: Record<SaltStatus, string> = {
	paired: "paired",
	"solid-only": "solid only",
	"stock-only": "stock only",
	"reference-only": "reference only",
};

/** The tracked Markdown artifact. */
export function renderCoverageMarkdown(report: CoverageReport): string {
	const { summary } = report;
	const lines: string[] = [
		"# ChemLab structure coverage",
		"",
		"This report tracks the [Molecule Builder → ChemLab compatibility handoff](structure-library.md#molecule-builder--chemlab-compatibility-handoff).",
		"It is generated from `data/chemicals.ts`, `molecule-builder/catalog.ts` and `chemlib/saltSolubility.ts`;",
		"do not edit it by hand. Regenerate with `scripts/generate-structure-coverage.ts` and verify with `tests/structure-coverage.test.ts`.",
		"",
		"A salt identity is **paired** when the catalog holds a dosed solid and a dosed aqueous stock for the same analytical compound.",
		"Forms are joined by the catalog formula without hydrate water, because a pentahydrate reference and an anhydrous stock describe the same solution.",
		"Reference-only behaviour is an interim gap, not an exemption.",
		"",
		"## Summary",
		"",
		"| Measure | Count |",
		"| --- | ---: |",
		`| Catalog entries | ${summary.catalogEntries} |`,
		`| Entries with a builder structure | ${summary.withStructure} |`,
		`| Entries without a builder structure | ${summary.withoutStructure} |`,
		`| Dosed entries (solid or aqueous) | ${summary.dosed} |`,
		`| Dosed salt entries | ${summary.dosedSaltEntries} |`,
		`| Molecular reagents outside the salt pairing | ${summary.reagents} |`,
		`| Mixtures shown by their constituents | ${summary.mixtures} |`,
		`| Salt entries in total | ${summary.saltEntries} |`,
		`| Salt identities | ${summary.saltIdentities} |`,
		`| Salt identities with both forms | ${summary.paired} |`,
		`| Salt identities with a solid form only | ${summary.solidOnly} |`,
		`| Salt identities with an aqueous form only | ${summary.stockOnly} |`,
		`| Salt identities with neither form | ${summary.referenceOnly} |`,
		"",
		"## Salt forms",
		"",
		"| Salt | Solid recipe | Aqueous stock | Reference only | Status | Material data |",
		"| --- | --- | --- | --- | --- | --- |",
		...report.salts.map((group) => `| ${escapeCell(group.label)} | ${cell(group.solid)} | ${cell(group.stock)} | ${cell(group.reference)} | ${STATUS_LABELS[group.status]} | ${describeSolubility(group.solubility)} |`),
		"",
		"## Remaining gaps",
		"",
		...report.salts.flatMap((group) => group.gap ? [`- **${group.label}** — ${group.gap}`] : []),
		"",
		"## Entries without a builder structure",
		"",
		...report.unstructured.map((entry) => `- ${entry.name} (${entry.category})${entry.formula ? ` — ${entry.formula}` : ""}`),
		"",
	];
	const byCategory = new Map<string, string[]>();
	for (const entry of report.entries.filter((candidate) => !candidate.dosed)) {
		const names = byCategory.get(entry.category);
		if (names) names.push(entry.name);
		else byCategory.set(entry.category, [entry.name]);
	}
	lines.push("## Entries without a dose", "");
	for (const [category, names] of byCategory) {
		for (const name of names) {
			lines.push(`- ${name} (${category}) — ${GAP_REASONS[name] ?? "ohne Rezept"}`);
		}
	}
	lines.push("");
	return lines.join("\n");
}
