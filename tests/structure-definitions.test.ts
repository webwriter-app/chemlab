import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chemicalCatalog } from "../data/chemicals";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { prepareDose } from "../data/measuredDose";
import { structureGraphs } from "../data/structureDefinitions.generated";
import { ElementData } from "../chemlib";
import { buildStructureDefinitions } from "../scripts/structure-definition-model";

const GENERATE = "node_modules/.bin/esbuild scripts/generate-structure-definitions.ts --bundle --platform=node --format=esm --outfile=.structure-definitions-bundle.mjs && node .structure-definitions-bundle.mjs";

const catalog = JSON.parse(readFileSync("data/structures/catalog.generated.json", "utf8")) as Record<string, {
	kind?: string;
	atoms: Array<{ id: number; atomicNumber: number; charge?: number }>;
	bonds: Array<{ from: number; to: number; order?: number }>;
}>;

function symbolOf(name: string): string {
	const data = ElementData.getData(name) as { symbol?: string };
	assert.ok(data?.symbol, `${name} is not an element of the periodic table data`);
	return data.symbol;
}

function histogram(values: string[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
	return counts;
}

test("the tracked structure definitions match the structure library", () => {
	const expected = buildStructureDefinitions(
		readFileSync("data/structures/catalog.generated.json", "utf8"),
		readFileSync("chemlib/ElementData.ts", "utf8"),
	);
	assert.equal(readFileSync("data/structureDefinitions.generated.ts", "utf8"), expected,
		`data/structureDefinitions.generated.ts is out of date; run ${GENERATE}`);
});

test("every molecule of the structure library has a graph", () => {
	const keys = Object.keys(catalog).filter((key) => catalog[key].kind === "molecule");
	assert.ok(keys.length > 80, "the structure library carries the molecules of the catalog");
	assert.deepEqual(Object.keys(structureGraphs).sort(), keys.sort());
	for (const key of keys) {
		const graph = structureGraphs[key];
		assert.equal(graph.atoms.length, catalog[key].atoms.length, `${key} lost an atom`);
		assert.equal(graph.bonds.length, catalog[key].bonds.length, `${key} lost a bond`);
		assert.ok(graph.atoms.every((atom) => typeof atom === "string" && atom === atom.toLowerCase()),
			`${key} must name its elements the way ElementData does`);
	}
});

test("a converted graph reproduces the library molecule", () => {
	for (const key of Object.keys(structureGraphs)) {
		const structure = catalog[key];
		const molecule = loadMoleculeDefinition({ formula: "unused", ...structureGraphs[key] });
		const expectedSymbols = structure.atoms.map((atom) => symbolOf(structureGraphs[key].atoms[structure.atoms.indexOf(atom)]));
		assert.deepEqual(molecule._atoms.map((atom) => atom.getSymbol()), expectedSymbols, `${key} changed its elements`);
		assert.equal(molecule._bonds.length, structure.bonds.length, `${key} changed its bond count`);
		assert.equal(molecule._bonds.filter((bond) => bond._magnitude === 1).length,
			structure.bonds.filter((bond) => (bond.order ?? 1) === 1).length, `${key} changed a single bond`);
		assert.equal(molecule._bonds.filter((bond) => bond._magnitude === 2).length,
			structure.bonds.filter((bond) => (bond.order ?? 1) === 2).length, `${key} changed a double bond`);
		const expectedCharge = structure.atoms.reduce((sum, atom) => sum + (atom.charge ?? 0), 0);
		assert.equal(molecule._totalCharge, expectedCharge, `${key} changed its total charge`);
		assert.ok(molecule.smilesString.length > 0, `${key} has no SMILES`);
	}
});

// Reagents whose structure comes from the shared library instead of a
// hand-written definition. A name belongs here once its catalog entry uses
// `molecular()`; the list keeps a silent fallback to a recipe-less entry from
// looking like a dosed reagent.
const STRUCTURE_DERIVED = [
	"Benzaldehyd",
	"Bromethan",
	"Dichlormethan",
	"Isoamylacetat",
	"Myristylmyristat",
	"Tetradecan-1-ol (Myristylalkohol)",
	"3-Methylbutan-1-ol (Isoamylalkohol)",
];

test("every structure-derived reagent doses the graph of the library", () => {
	for (const name of STRUCTURE_DERIVED) {
		const entry = chemicalCatalog.find((candidate) => candidate.name === name);
		assert.ok(entry, `${name} is not in the catalog`);
		assert.ok(entry!.recipe, `${name} is listed but has no recipe`);
		assert.deepEqual(entry!.preview?.atoms, structureGraphs[name].atoms, `${name} previews another graph`);
		assert.deepEqual(entry!.preview?.bonds, structureGraphs[name].bonds, `${name} previews another bonding`);
		assert.equal(entry!.recipe!.parts.length, 1, `${name} is a pure substance and doses as one part`);
		assert.equal(entry!.recipe!.parts[0].molecule, entry!.preview, `${name} doses a different graph than it previews`);
	}
});

test("a structure-derived liquid doses by its density", () => {
	const entry = chemicalCatalog.find((candidate) => candidate.name === "Benzaldehyd");
	assert.ok(entry?.recipe && entry.preview);
	const dose = prepareDose(entry.recipe, (definition) => loadMoleculeDefinition(definition));
	assert.ok(dose, "a liquid reagent doses");
	const mixture = dose!(4);
	assert.equal(mixture._activeMolecules.length, 1, "the pure liquid carries one substance");
	const molecule = mixture._activeMolecules[0];
	assert.equal(molecule._atoms.length, 14, "benzaldehyde keeps seven carbons, one oxygen and six hydrogens");
	const moles = mixture._molProperties[`${molecule._id}n`];
	assert.ok(Math.abs(moles - 4 * 1.045 / molecule.getTotMolMass()) < 1e-9, "4 mL benzene carbaldehyde weigh 4.18 g");
	assert.ok(mixture.hasLiquidVolume, "a liquid dose contributes liquid volume");
});

test("an element name of a graph resolves to the same symbol in both directions", () => {
	assert.equal(symbolOf("sodium"), "Na");
	assert.equal(symbolOf("sulfur"), "S");
	assert.equal(structureGraphs["Saccharose"].atoms.filter((atom) => atom === "oxygen").length, 11);
	assert.equal(structureGraphs["Methylorange"].charges?.filter((charge) => charge !== 0).length, 2);
	assert.equal(histogram(structureGraphs["Benzoesäure"].atoms).get("carbon"), 7);
});
