import assert from "node:assert/strict";
import { test } from "node:test";
import { Molecule } from "../chemlib";
import { analyzeBuilderCompound, builderStockFor, hydrateBuilderChemical, pendingBuilderChemicals,
	portableBuilderChemical, readBuilderChemical, type BuilderChemical } from "../molecule-builder/custom-compounds";
import type { Bond, Molecule as StructureMolecule } from "../molecule-builder/structure";

const edge = (from: number, to: number, order: Bond["order"] = 1): Bond => ({ from, to, order });

function molecule(numbers: number[], bonds: Bond[], name = ""): StructureMolecule {
	return {
		version: 1, kind: "molecule", name, bonds,
		atoms: numbers.map((atomicNumber, index) => ({ id: index + 1, atomicNumber, charge: 0,
			diagram: [index, 0], position: [index, 0, 0] })),
	};
}

/** A saturated carboxylic acid whose alkyl chain and halogen count vary. */
function acid(carbons: number, halogens = 0): StructureMolecule {
	const numbers = [6, 8, 8];
	const bonds = [edge(1, 2, 2), edge(1, 3)];
	let last = 1;
	for (let index = 0; index < carbons; index++) {
		numbers.push(6);
		bonds.push(edge(last, numbers.length));
		last = numbers.length;
	}
	for (let index = 0; index < halogens; index++) {
		numbers.push(9);
		bonds.push(edge(last, numbers.length));
	}
	return molecule(numbers, bonds, `acid-${carbons}-${halogens}`);
}

/** Thirty analysable records, like a worksheet that collected a full palette. */
const records = Array.from({ length: 30 }, (_, index) => ({
	key: `builder-chemical:hydrate-${index}`,
	structure: acid(1 + index % 6, index % 4),
	facts: { pKaSource: "test", dissociation: { pKa: [4.76], step: 0 } },
	stockConcentration: .1,
}));

type Counts = { serializations: number };

/** Counts SMILES serializations of newly built chemlib molecules. */
function countSerializations<T>(run: () => T): { counts: Counts; value: T } {
	const counts: Counts = { serializations: 0 };
	const target = Molecule.prototype as unknown as { setSmilesString: () => void };
	const { setSmilesString } = target;
	target.setSmilesString = function (this: Molecule) {
		counts.serializations += 1;
		return setSmilesString.call(this);
	};
	let value: T;
	try {
		value = run();
	} finally {
		target.setSmilesString = setSmilesString;
	}
	return { counts, value };
}

test("restoring saved compounds defers every graph analysis", () => {
	const { counts, value } = countSerializations(() => records.map((record, index) => readBuilderChemical(record, index)));
	const restored = value.filter(Boolean);
	assert.equal(restored.length, records.length);
	assert.equal(counts.serializations, 0);
	for (const item of restored) {
		assert.equal(item.analysis, undefined);
		assert.equal(item.recipe, undefined);
		assert.notEqual(item.hydrated, true);
	}
	assert.equal(pendingBuilderChemicals(restored).length, records.length);
});

test("hydration derives analysis and stock once and is idempotent", () => {
	const restored = readBuilderChemical(records[0], 0);
	const { counts, value: hydrated } = countSerializations(() => hydrateBuilderChemical(restored));
	assert.ok(counts.serializations > 0);
	assert.equal(hydrated.hydrated, true);
	assert.equal(hydrated.analysis.classification, "acid");
	assert.ok(hydrated.analysis.formula.startsWith("C"));
	assert.ok(builderStockFor(hydrated));
	assert.equal(hydrateBuilderChemical(hydrated), hydrated);
	assert.equal(pendingBuilderChemicals([hydrated]).length, 0);
	assert.equal(builderStockFor(restored), undefined);
});

test("a structure without analysis is marked and never retried", () => {
	const single = readBuilderChemical({ key: "builder-chemical:single", structure: molecule([8], []), stockConcentration: .1 }, 0);
	assert.ok(single);
	const hydrated = hydrateBuilderChemical(single);
	assert.equal(hydrated.hydrated, true);
	assert.equal(hydrated.analysis, undefined);
	assert.equal(builderStockFor(hydrated), undefined);
	assert.equal(hydrateBuilderChemical(hydrated), hydrated);
	assert.equal(pendingBuilderChemicals([hydrated]).length, 0);
});

test("a known analysis is reused instead of being derived again", () => {
	const restored = readBuilderChemical(records[1], 0);
	const known = analyzeBuilderCompound(restored.structure);
	assert.ok(known);
	const { counts, value: hydrated } = countSerializations(() => hydrateBuilderChemical(restored, known));
	assert.equal(counts.serializations, 0);
	assert.equal(hydrated.analysis, known);
	assert.ok(builderStockFor(hydrated));
});

test("the stock is revalidated against the structure at the moment of use", () => {
	const structure = acid(1);
	const wrongPka = hydrateBuilderChemical({ key: "builder-chemical:wrong-pka", structure,
		facts: { dissociation: { pKa: [4.76, 9.9], step: 0 } }, stockConcentration: .1 });
	assert.equal(wrongPka.hydrated, true);
	assert.equal(builderStockFor(wrongPka), undefined);
	const matchingPka = hydrateBuilderChemical({ key: "builder-chemical:matching-pka", structure,
		facts: { dissociation: { pKa: [4.76], step: 0 } }, stockConcentration: .1 });
	assert.ok(builderStockFor(matchingPka));
	const tooConcentrated = hydrateBuilderChemical({ key: "builder-chemical:strong", structure, stockConcentration: 4 });
	assert.equal(builderStockFor(tooConcentrated), undefined);
	const withoutConcentration = hydrateBuilderChemical({ key: "builder-chemical:reference", structure });
	assert.equal(builderStockFor(withoutConcentration), undefined);
	assert.equal(withoutConcentration.recipe, undefined);
});

test("a bare structure of an older worksheet keeps its legacy key and hydrates", () => {
	const restored = readBuilderChemical(JSON.parse(JSON.stringify(acid(2))), 7);
	assert.ok(restored);
	assert.equal(restored.key, "builder-reference:7");
	assert.equal(restored.facts?.metadata, undefined);
	const hydrated: BuilderChemical = hydrateBuilderChemical(restored);
	assert.equal(hydrated.key, "builder-reference:7");
	assert.ok(hydrated.analysis);
	assert.equal(hydrated.recipe, undefined);
});

test("the authored worksheet keeps only the portable fields", () => {
	const restored = readBuilderChemical(records[2], 0);
	const hydrated = hydrateBuilderChemical(restored);
	const portable = JSON.parse(JSON.stringify(portableBuilderChemical(hydrated)));
	assert.deepEqual(Object.keys(portable), ["key", "structure", "facts", "stockConcentration"]);
	assert.deepEqual(portable, JSON.parse(JSON.stringify({
		key: records[2].key, structure: records[2].structure, facts: records[2].facts,
		stockConcentration: records[2].stockConcentration,
	})));
});
