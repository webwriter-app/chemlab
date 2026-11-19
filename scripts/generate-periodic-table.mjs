#!/usr/bin/env node
/**
 * Generates `data/periodic-table/elements.generated.ts` from the vendored
 * sources.
 *
 * The script reads three pinned inputs, verifies their digests against
 * `data/periodic-table/sources.json`, merges them with the curation table in
 * `data/periodic-table/curation.json`, validates the result and writes a
 * deterministic TypeScript module. Run it without arguments to regenerate and
 * with `--check` to verify that the tracked output is up to date.
 *
 * @module scripts/generate-periodic-table
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data", "periodic-table");
const OUTPUT_PATH = join(DATA_DIR, "elements.generated.ts");

/** Subshell occupation of the noble-gas cores used by the source shorthand. */
const NOBLE_GAS_CORES = {
	He: [[1, "s", 2]],
	Ne: [[1, "s", 2], [2, "s", 2], [2, "p", 6]],
	Ar: [[1, "s", 2], [2, "s", 2], [2, "p", 6], [3, "s", 2], [3, "p", 6]],
	Kr: [
		[1, "s", 2], [2, "s", 2], [2, "p", 6], [3, "s", 2], [3, "p", 6],
		[3, "d", 10], [4, "s", 2], [4, "p", 6],
	],
	Xe: [
		[1, "s", 2], [2, "s", 2], [2, "p", 6], [3, "s", 2], [3, "p", 6],
		[3, "d", 10], [4, "s", 2], [4, "p", 6], [4, "d", 10], [5, "s", 2], [5, "p", 6],
	],
	Rn: [
		[1, "s", 2], [2, "s", 2], [2, "p", 6], [3, "s", 2], [3, "p", 6],
		[3, "d", 10], [4, "s", 2], [4, "p", 6], [4, "d", 10], [5, "s", 2], [5, "p", 6],
		[4, "f", 14], [5, "d", 10], [6, "s", 2], [6, "p", 6],
	],
};

const TERM_PATTERN = /^([1-7])([spdf])\[(\d+)\]$/;
const CORE_PATTERN = /^[A-Z][a-z]?$/;

/** Thrown for any input that violates the contract; the message names the record. */
class GenerationError extends Error {}

/**
 * Reads and parses a JSON file.
 *
 * @param {string} path Absolute path.
 * @returns {Promise<unknown>} Parsed content.
 */
async function readJson(path) {
	return JSON.parse(await readFile(path, "utf8"));
}

/**
 * Computes the SHA-256 digest of a file.
 *
 * @param {string} path Absolute path.
 * @returns {Promise<string>} Lowercase hex digest.
 */
async function digest(path) {
	return createHash("sha256").update(await readFile(path)).digest("hex");
}

/**
 * Fails the run unless a condition holds.
 *
 * @param {unknown} condition Condition to check.
 * @param {string} message Message for the failure.
 */
function assert(condition, message) {
	if (!condition) throw new GenerationError(message);
}

/**
 * Expands the source shorthand of an electron configuration.
 *
 * @param {string} shorthand Configuration such as `Ar 3d[10] 4s[1]`.
 * @returns {{ core: string | null, terms: number[][], text: string }} Expanded terms and normalised text.
 */
function parseConfiguration(shorthand) {
	const tokens = shorthand.trim().split(/\s+/);
	let core = null;
	let terms = [];
	if (CORE_PATTERN.test(tokens[0]) && NOBLE_GAS_CORES[tokens[0]]) {
		core = tokens.shift();
		terms = NOBLE_GAS_CORES[core].map((term) => [...term]);
	}
	for (const token of tokens) {
		const match = TERM_PATTERN.exec(token);
		assert(match, `unreadable configuration term "${token}" in "${shorthand}"`);
		terms.push([Number(match[1]), match[2], Number(match[3])]);
	}
	const text = [
		core ? `[${core}]` : null,
		...terms
			.slice(core ? NOBLE_GAS_CORES[core].length : 0)
			.map(([n, l, count]) => `${n}${l}${count}`),
	]
		.filter(Boolean)
		.join(" ");
	return { core, terms, text };
}

/**
 * Counts the electrons per shell.
 *
 * @param {number[][]} terms Expanded subshell terms.
 * @returns {number[]} Electrons in shell 1, 2, …
 */
function shellsOf(terms) {
	const shells = [];
	for (const [n, , count] of terms) shells[n - 1] = (shells[n - 1] ?? 0) + count;
	return Array.from(shells, (count) => count ?? 0);
}

/**
 * Compares two expanded term lists.
 *
 * @param {number[][]} left First list.
 * @param {number[][]} right Second list.
 * @returns {boolean} Whether both describe the same occupation.
 */
function sameTerms(left, right) {
	const order = (terms) =>
		JSON.stringify(
			[...terms].sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])),
		);
	return order(left) === order(right);
}

/**
 * Splits the CIAAW note codes.
 *
 * @param {string | undefined} notes Note string such as `g r`.
 * @returns {string[]} Individual codes.
 */
function noteCodes(notes) {
	return (notes ?? "").split(/\s+/).filter(Boolean);
}

/**
 * Builds the standard atomic weight record.
 *
 * @param {object} entry Parsed CIAAW record.
 * @returns {object} Weight record.
 */
function buildWeight(entry) {
	const provenance = { sourceId: "ciaaw", locator: `atomic-weights.htm#${entry.symbol}` };
	const parsed = entry.parsed;
	switch (parsed.kind) {
		case "value": {
			const codes = noteCodes(parsed.notes);
			return {
				kind: "value",
				decimal: parsed.decimal,
				...(parsed.unc ? { uncertaintyDigits: parsed.unc } : {}),
				...(codes.length ? { noteCodes: codes } : {}),
				provenance,
			};
		}
		case "interval": {
			const codes = noteCodes(parsed.notes);
			return {
				kind: "interval",
				lower: parsed.lower,
				upper: parsed.upper,
				...(codes.length ? { noteCodes: codes } : {}),
				provenance,
			};
		}
		case "none":
			return { kind: "none", provenance };
		default:
			throw new GenerationError(`unknown weight kind "${parsed.kind}" for ${entry.symbol}`);
	}
}

/**
 * Builds the group assignment of an element.
 *
 * @param {number} atomicNumber Atomic number.
 * @param {object} curation Curation table.
 * @param {object} source PSE-info record.
 * @returns {object} Group assignment.
 */
function buildGroup(atomicNumber, curation, source) {
	const provenance = { sourceId: "pse-info", locator: `elements.json#${source.symbol.toLowerCase()}` };
	const convention = curation.groupConvention;
	if (convention.conventionDependent.includes(atomicNumber)) {
		return { status: "convention-dependent", provenance };
	}
	if (convention.unassigned.includes(atomicNumber)) {
		return { status: "unassigned", provenance };
	}
	const reported = convention.reported[String(atomicNumber)];
	const value = reported ?? source.group;
	assert(
		Number.isInteger(value) && value >= 1 && value <= 18,
		`group of ${source.symbol} is ${value}, expected 1–18`,
	);
	return { status: "reported", value, provenance };
}

/**
 * Builds one element record.
 *
 * @param {number} atomicNumber Atomic number.
 * @param {object} context Loaded sources and curation.
 * @returns {object} Element record.
 */
function buildElement(atomicNumber, context) {
	const { pseByNumber, ciaawByNumber, nistByNumber, curation } = context;
	const source = pseByNumber.get(atomicNumber);
	const weightEntry = ciaawByNumber.get(atomicNumber);
	assert(source, `PSE-info has no record for Z = ${atomicNumber}`);
	assert(weightEntry, `CIAAW has no record for Z = ${atomicNumber}`);
	assert(
		source.symbol === weightEntry.symbol,
		`symbol mismatch for Z = ${atomicNumber}: ${source.symbol} vs ${weightEntry.symbol}`,
	);

	const key = source.symbol.toLowerCase();
	const pseProvenance = { sourceId: "pse-info", locator: `elements.json#${key}` };
	const placement = curation.placement[String(atomicNumber)];
	assert(placement, `curation has no placement for Z = ${atomicNumber}`);

	const override = curation.overrides[String(atomicNumber)];
	const shorthand = override?.configuration ?? source.electron_config;
	const configuration = parseConfiguration(shorthand);
	const nist = nistByNumber.get(atomicNumber);
	if (nist) {
		assert(
			sameTerms(configuration.terms, nist.shells),
			`configuration of ${source.symbol} disagrees with NIST: ${JSON.stringify(configuration.terms)} vs ${JSON.stringify(nist.shells)}`,
		);
	}

	const englishName = weightEntry.name.charAt(0).toUpperCase() + weightEntry.name.slice(1);
	const aliases = [];
	for (const alias of curation.aliases[String(atomicNumber)]?.en ?? []) aliases.push(alias);
	if (source.names.en.toLowerCase() !== weightEntry.name.toLowerCase()) aliases.push(source.names.en);
	const uniqueAliases = [...new Set(aliases)].filter(
		(alias) => alias.toLowerCase() !== englishName.toLowerCase(),
	);

	const phase = source.phase;
	const phaseRecord =
		phase === undefined
			? { status: "unavailable", provenance: pseProvenance }
			: {
					status: atomicNumber >= curation.predictionPolicy.phase.fromAtomicNumber ? "predicted" : "reported",
					value: phase,
					provenance: pseProvenance,
				};

	return {
		atomicNumber,
		symbol: source.symbol,
		names: { en: englishName, de: source.names.de },
		...(uniqueAliases.length ? { aliases: { en: uniqueAliases } } : {}),
		identitySources: {
			iupac: { sourceId: "ciaaw", locator: `atomic-weights.htm#${source.symbol}` },
			germanName: pseProvenance,
		},
		period: source.period,
		group: buildGroup(atomicNumber, curation, source),
		block: { status: "reported", value: source.block, provenance: pseProvenance },
		weight: buildWeight(weightEntry),
		configuration: {
			status:
				atomicNumber >= curation.predictionPolicy.configuration.fromAtomicNumber
					? "predicted"
					: "reported",
			value: configuration.text,
			provenance: pseProvenance,
		},
		shells: shellsOf(configuration.terms),
		phase: phaseRecord,
	};
}

/**
 * Validates the merged bundle.
 *
 * @param {object[]} elements Element records.
 * @param {object} context Loaded sources and curation.
 */
function validate(elements, context) {
	const { curation, sources } = context;
	assert(elements.length === 118, `expected 118 elements, got ${elements.length}`);
	const numbers = new Set();
	const symbols = new Set();
	for (const element of elements) {
		assert(
			Number.isInteger(element.atomicNumber) && element.atomicNumber >= 1 && element.atomicNumber <= 118,
			`atomic number out of range: ${element.atomicNumber}`,
		);
		assert(!numbers.has(element.atomicNumber), `duplicate atomic number ${element.atomicNumber}`);
		assert(!symbols.has(element.symbol), `duplicate symbol ${element.symbol}`);
		numbers.add(element.atomicNumber);
		symbols.add(element.symbol);
		assert(element.period >= 1 && element.period <= 7, `period out of range for ${element.symbol}`);
		// Palladium is the exception: [Kr] 4d10 leaves the fifth shell empty, so the
		// shell list is one shorter than the period.
		assert(element.shells.length <= element.period, `shell count of ${element.symbol} exceeds its period`);
		const electrons = element.shells.reduce((sum, count) => sum + count, 0);
		assert(electrons === element.atomicNumber, `shells of ${element.symbol} hold ${electrons} electrons`);
		if (element.weight.kind === "value") {
			assert(Number.isFinite(Number(element.weight.decimal)), `weight of ${element.symbol} is not numeric`);
		}
		if (element.weight.kind === "interval") {
			assert(
				Number(element.weight.lower) < Number(element.weight.upper),
				`interval of ${element.symbol} is not ordered`,
			);
		}
	}
	for (let z = 1; z <= 118; z++) assert(numbers.has(z), `missing element Z = ${z}`);

	const placements = new Map();
	for (const [key, placement] of Object.entries(curation.placement)) {
		const z = Number(key);
		assert(Number.isInteger(z) && z >= 1 && z <= 118, `placement key ${key} is not an atomic number`);
		assert(
			placement.row >= 1 && placement.row <= curation.layout.periodRows + curation.layout.seriesRows.length,
			`row of Z = ${z} is out of range`,
		);
		assert(
			placement.column >= 1 && placement.column <= curation.layout.columns,
			`column of Z = ${z} is out of range`,
		);
		assert(
			Object.hasOwn(curation.categories, placement.category),
			`unknown category "${placement.category}" for Z = ${z}`,
		);
		const cell = `${placement.row}:${placement.column}`;
		assert(!placements.has(cell), `coordinate collision at ${cell} (Z = ${z} and Z = ${placements.get(cell)})`);
		placements.set(cell, z);
	}
	assert(placements.size === 118, `expected 118 placements, got ${placements.size}`);
	for (const placeholder of curation.layout.placeholders) {
		assert(
			!placements.has(`${placeholder.row}:${placeholder.column}`),
			`placeholder at ${placeholder.row}:${placeholder.column} collides with an element`,
		);
	}
	for (const element of elements) {
		const placement = curation.placement[String(element.atomicNumber)];
		const series = curation.layout.seriesRows.find((row) => row.row === placement.row);
		if (series) {
			assert(
				element.atomicNumber >= series.firstAtomicNumber && element.atomicNumber <= series.lastAtomicNumber,
				`Z = ${element.atomicNumber} sits in the wrong series row`,
			);
			assert(
				placement.column === series.firstColumn + element.atomicNumber - series.firstAtomicNumber,
				`Z = ${element.atomicNumber} is not in series order`,
			);
		} else {
			assert(
				placement.row === element.period,
				`Z = ${element.atomicNumber} sits in row ${placement.row} but belongs to period ${element.period}`,
			);
		}
	}

	const sourceIds = new Set(Object.keys(sources.sources));
	const seen = new Set();
	const collect = (value) => {
		if (!value || typeof value !== "object") return;
		if (typeof value.sourceId === "string") seen.add(value.sourceId);
		for (const child of Object.values(value)) collect(child);
	};
	collect(elements);
	for (const id of seen) assert(sourceIds.has(id), `unknown source id "${id}"`);
}

/**
 * Checks the representative cases the handoff names.
 *
 * @param {Map<number, object>} byNumber Element records by atomic number.
 */
function validateRepresentativeCases(byNumber) {
	const argon = byNumber.get(18);
	assert(argon.weight.kind === "interval", "argon must carry an interval weight");
	assert(argon.weight.lower === "39.792" && argon.weight.upper === "39.963", "argon interval changed");

	const copper = byNumber.get(29);
	assert(copper.weight.kind === "value", "copper must carry a value weight");
	assert(copper.weight.decimal === "63.546" && copper.weight.uncertaintyDigits === "3", "copper weight changed");

	const technetium = byNumber.get(43);
	assert(technetium.weight.kind === "none", "technetium must have no standard atomic weight");

	const chromium = byNumber.get(24);
	assert(chromium.configuration.value === "[Ar] 3d5 4s1", `chromium configuration is ${chromium.configuration.value}`);
	assert(copper.configuration.value === "[Ar] 3d10 4s1", `copper configuration is ${copper.configuration.value}`);

	const helium = byNumber.get(2);
	assert(helium.configuration.value === "1s2", `helium configuration is ${helium.configuration.value}`);

	const oganesson = byNumber.get(118);
	assert(oganesson.configuration.status === "predicted", "oganesson configuration must be predicted");
	assert(oganesson.phase.status === "predicted", "oganesson phase must be predicted");
	assert(oganesson.weight.kind === "none", "oganesson must have no standard atomic weight");

	const tennessine = byNumber.get(117);
	assert(tennessine.phase.status === "unavailable", "tennessine phase must be unavailable");

	const lanthanum = byNumber.get(57);
	assert(lanthanum.group.status === "convention-dependent", "lanthanum group must be convention-dependent");
	const cerium = byNumber.get(58);
	assert(cerium.group.status === "unassigned", "cerium group must be unassigned");
	const scandium = byNumber.get(21);
	assert(scandium.group.status === "reported" && scandium.group.value === 3, "scandium group must be 3");
}

/**
 * Serialises a value with a stable key order and tab indentation.
 *
 * @param {unknown} value Value to serialise.
 * @param {number} depth Current indentation depth.
 * @returns {string} TypeScript source fragment.
 */
function serialize(value, depth = 0) {
	const indent = "\t".repeat(depth);
	const inner = "\t".repeat(depth + 1);
	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		const items = value.map((item) => `${inner}${serialize(item, depth + 1)},`);
		return `[\n${items.join("\n")}\n${indent}]`;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value);
		if (entries.length === 0) return "{}";
		const items = entries.map(([key, item]) => `${inner}${JSON.stringify(key)}: ${serialize(item, depth + 1)},`);
		return `{\n${items.join("\n")}\n${indent}}`;
	}
	return JSON.stringify(value);
}

/**
 * Renders the generated module.
 *
 * @param {object} bundle Merged bundle.
 * @returns {string} Module source.
 */
function render(bundle) {
	const { sources, curation, elements, placement } = bundle;
	const lines = [];
	lines.push("// This file is generated by scripts/generate-periodic-table.mjs.");
	lines.push("// Do not edit it by hand; change the sources or the curation table and regenerate.");
	lines.push("//");
	lines.push("// Inputs:");
	for (const [id, source] of Object.entries(sources.sources)) {
		lines.push(`//   ${id}: ${source.input} (sha256 ${source.sha256})`);
	}
	lines.push("");
	lines.push('import type {');
	lines.push("\tElementReference,");
	lines.push("\tPeriodicTableCategory,");
	lines.push("\tPeriodicTableConditions,");
	lines.push("\tPeriodicTableLayout,");
	lines.push("\tPeriodicTablePlacement,");
	lines.push("\tPeriodicTableSource,");
	lines.push('} from "../../periodic-table/element-reference";');
	lines.push("");
	lines.push(`export const PERIODIC_TABLE_DATA_VERSION = ${JSON.stringify(curation.dataVersion)};`);
	lines.push(`export const PERIODIC_TABLE_SCHEMA_VERSION = ${curation.schemaVersion};`);
	lines.push("");
	lines.push("export const PERIODIC_TABLE_CONDITIONS: PeriodicTableConditions = {");
	lines.push(`\ttemperatureK: ${curation.conditions.temperatureK},`);
	lines.push(`\tpressureBar: ${curation.conditions.pressureBar},`);
	lines.push("};");
	lines.push("");
	lines.push("export const PERIODIC_TABLE_SOURCES: Readonly<Record<string, PeriodicTableSource>> = {");
	for (const [id, source] of Object.entries(sources.sources)) {
		lines.push(`\t${JSON.stringify(id)}: {`);
		for (const field of [
			"publisher",
			"title",
			"url",
			"release",
			"retrieved",
			"license",
			"redistribution",
			"attribution",
			"input",
			"sha256",
		]) {
			lines.push(`\t\t${field}: ${JSON.stringify(source[field])},`);
		}
		lines.push("\t},");
	}
	lines.push("};");
	lines.push("");
	lines.push("export const PERIODIC_TABLE_CATEGORIES: Readonly<Record<string, PeriodicTableCategory>> = {");
	for (const [key, category] of Object.entries(curation.categories)) {
		lines.push(`\t${JSON.stringify(key)}: { en: ${JSON.stringify(category.en)}, de: ${JSON.stringify(category.de)} },`);
	}
	lines.push("};");
	lines.push("");
	lines.push("export const PERIODIC_TABLE_LAYOUT: PeriodicTableLayout = {");
	lines.push(`\tcolumns: ${curation.layout.columns},`);
	lines.push(`\tperiodRows: ${curation.layout.periodRows},`);
	lines.push("\tseriesRows: [");
	for (const row of curation.layout.seriesRows) {
		lines.push(
			`\t\t{ row: ${row.row}, category: ${JSON.stringify(row.category)}, firstAtomicNumber: ${row.firstAtomicNumber}, lastAtomicNumber: ${row.lastAtomicNumber}, firstColumn: ${row.firstColumn} },`,
		);
	}
	lines.push("\t],");
	lines.push("\tplaceholders: [");
	for (const placeholder of curation.layout.placeholders) {
		lines.push(
			`\t\t{ row: ${placeholder.row}, column: ${placeholder.column}, category: ${JSON.stringify(placeholder.category)} },`,
		);
	}
	lines.push("\t],");
	lines.push("};");
	lines.push("");
	lines.push("export const PERIODIC_TABLE_ELEMENTS: readonly ElementReference[] = [");
	for (const element of elements) lines.push(`\t${JSON.stringify(element)},`);
	lines.push("];");
	lines.push("");
	lines.push("export const PERIODIC_TABLE_PLACEMENT: Readonly<Record<number, PeriodicTablePlacement>> = {");
	for (const [key, value] of Object.entries(placement)) {
		lines.push(
			`\t${key}: { row: ${value.row}, column: ${value.column}, category: ${JSON.stringify(value.category)} },`,
		);
	}
	lines.push("};");
	lines.push("");
	return lines.join("\n");
}

/**
 * Runs the generator.
 *
 * @returns {Promise<void>} Resolves when the output is written or verified.
 */
async function main() {
	const check = process.argv.includes("--check");
	const sources = await readJson(join(DATA_DIR, "sources.json"));
	const curation = await readJson(join(DATA_DIR, "curation.json"));

	for (const [id, source] of Object.entries(sources.sources)) {
		const actual = await digest(join(DATA_DIR, source.input));
		assert(actual === source.sha256, `digest mismatch for ${id}: ${actual} != ${source.sha256}`);
	}

	const pse = await readJson(join(DATA_DIR, "sources", "pse-info-elements.json"));
	const ciaaw = await readJson(join(DATA_DIR, "sources", "ciaaw-atomic-weights.json"));
	const nist = await readJson(join(DATA_DIR, "sources", "nist-configurations.json"));

	const context = {
		sources,
		curation,
		pseByNumber: new Map(Object.values(pse).map((entry) => [entry.number, entry])),
		ciaawByNumber: new Map(ciaaw.map((entry) => [entry.z, entry])),
		nistByNumber: new Map(nist.map((entry) => [entry.z, entry])),
	};

	const elements = [];
	for (let z = 1; z <= 118; z++) elements.push(buildElement(z, context));
	validate(elements, context);
	validateRepresentativeCases(new Map(elements.map((element) => [element.atomicNumber, element])));

	const placement = {};
	for (const key of Object.keys(curation.placement).sort((a, b) => Number(a) - Number(b))) {
		placement[key] = curation.placement[key];
	}

	const source = render({ sources, curation, elements, placement });
	if (check) {
		const current = await readFile(OUTPUT_PATH, "utf8").catch(() => "");
		if (current !== source) {
			console.error("elements.generated.ts is out of date; run node scripts/generate-periodic-table.mjs");
			process.exitCode = 1;
			return;
		}
		console.log("elements.generated.ts is up to date");
		return;
	}
	await writeFile(OUTPUT_PATH, source);
	console.log(`wrote ${elements.length} elements to ${OUTPUT_PATH}`);
}

main().catch((error) => {
	console.error(error instanceof GenerationError ? `generation failed: ${error.message}` : error);
	process.exitCode = 1;
});
