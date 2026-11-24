import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager } from "../chemlib";
import { Kekule, writeSmiles } from "../chemlib/kekule";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

const options = { ignoreImplicitHydrogens: true };

/** Water, built the same way the palette builds a catalog entry. */
function water() {
	const molecule = StructureManager.newMolecule();
	const oxygen = molecule.addAtom("oxygen", "O");
	const first = molecule.addAtom("hydrogen", "H");
	const second = molecule.addAtom("hydrogen", "H");
	molecule.addBond(oxygen._id, first._id, 1, 100, "covalent");
	molecule.addBond(oxygen._id, second._id, 1, 100, "covalent");
	return molecule;
}

/** The writer registry ChemLab no longer depends on. */
function writerRegistry(): any[] {
	return (Kekule as any).IO.ChemDataWriterManager._writers;
}

test("an independently loaded Kekulé keeps existing and new lab molecules compatible", async () => {
	const existing = water();
	assert.notEqual((globalThis as any).Kekule, Kekule);
	const { Kekule: other } = await import("kekule/mod/io");
	assert.notEqual(other.Molecule, Kekule.Molecule);
	other.IO.ChemDataWriterManager._writers.length = 0;

	assert.equal(writeSmiles(existing._kekule_obj, options), "O");
	assert.ok(existing._kekule_obj.calcFormula().getDisplayText());
	const next = water();
	const chloride = StructureManager.newMolecule();
	chloride.addAtom("chlorine", "Cl", -1);
	const mixture = StructureManager.newMixture();
	mixture.addMolecule(existing, 1);
	mixture.addMolecule(next, 1);
	mixture.addMolecule(chloride, 1);

	assert.deepEqual(mixture._activeMolecules.map(model => model.smilesString), ["O", "[Cl-]"]);
	assert.equal(mixture._molProperties[existing._id + "n"], 2);
	assert.ok(Kekule.Render.ChemObjPainter);
});

test("water added to dry salt stays solvent when another Kekulé is loaded", async () => {
	await import("kekule/mod/io");
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const [name, volumeMl] of [["Natriumchlorid", 1.1], ["Wasser", 18.8]] as const) {
		const recipe = chemicalCatalog.find(item => item.name === name)?.recipe;
		assert.ok(recipe, name);
		const dose = prepareDose(recipe, loadMoleculeDefinition)?.(volumeMl);
		assert.ok(dose, name);
		vessel.addContents({ nMix: dose });
	}
	const mixture = vessel._content;
	assert.deepEqual(mixture._activeMolecules.map(model => model.smilesString).sort(), ["O", "[Cl-]", "[Na+]"]);
	assert.ok(Math.abs(mixture.contentVolume * 1000 - 18.8) < 1e-8);
	assert.equal(Simulation.getpH(mixture), 7);
});

test("molecules without a SMILES keep separate entries in a mixture", () => {
	const first = water();
	const second = StructureManager.newMolecule();
	const carbon = second.addAtom("carbon", "C");
	const oxygen = second.addAtom("oxygen", "O");
	second.addBond(carbon._id, oxygen._id, 2, 100, "covalent");
	second.addAtom("oxygen", "O");
	first.smilesString = second.smilesString = "";

	const mixture = StructureManager.newMixture();
	mixture.addMolecule(first, 1);
	mixture.addMolecule(second, 1);
	mixture.addMolecule(first, 1);

	assert.deepEqual(mixture._activeMolecules, [first, second]);
	assert.equal(mixture._molProperties[first._id + "n"], 2);
	assert.equal(mixture._molProperties[second._id + "n"], 1);
});

test("the writer itself returns the SMILES of the registry", () => {
	const molecule = water();
	assert.equal(molecule.smilesString, "O");
	assert.equal(writeSmiles(molecule._kekule_obj, options), molecule.smilesString);
	assert.equal(
		(Kekule as any).IO.saveFormatData(molecule._kekule_obj, "smi", options),
		molecule.smilesString,
	);
});

test("an empty writer registry no longer breaks the molecule", () => {
	const registry = writerRegistry();
	const saved = registry.slice();
	registry.length = 0;
	try {
		// The registry is the reason the page reported "Can not write data of format: smi".
		assert.throws(
			() => (Kekule as any).IO.saveFormatData(water()._kekule_obj, "smi", options),
			/Can not write data of format/,
		);
		const molecule = water();
		assert.equal(molecule.smilesString, "O");
		assert.equal(molecule._atomCount, 3);
	} finally {
		registry.push(...saved);
	}
});

test("a missing SMILES writer keeps the structure and reports once", () => {
	const io = (Kekule as any).IO;
	const registry = writerRegistry();
	const savedRegistry = registry.slice();
	const savedWriter = io.SmilesMolWriter;
	const savedWarn = console.warn;
	const warnings: unknown[] = [];
	registry.length = 0;
	io.SmilesMolWriter = undefined;
	console.warn = (message: unknown) => warnings.push(message);
	try {
		const molecule = water();
		assert.equal(molecule._atomCount, 3);
		assert.equal(molecule.smilesString, undefined);
		assert.equal(warnings.length, 1);
		assert.match(String(warnings[0]), /SMILES-Schreibweise/);
	} finally {
		io.SmilesMolWriter = savedWriter;
		registry.push(...savedRegistry);
		console.warn = savedWarn;
	}
	// With the writer back, the same molecule recovers its SMILES.
	const restored = water();
	assert.equal(restored.smilesString, "O");
});

test("the molecule refreshes the SMILES after every atom and bond", () => {
	const molecule = StructureManager.newMolecule();
	const carbon = molecule.addAtom("carbon", "C");
	assert.notEqual(molecule.smilesString, "");
	const oxygen = molecule.addAtom("oxygen", "O");
	molecule.addBond(carbon._id, oxygen._id, 2, 100, "covalent");
	// The fragment has no hydrogens of its own, because the writer ignores them.
	assert.equal(molecule.smilesString, "O=[C]");
	molecule.addAtom("oxygen", "O");
	assert.equal(molecule._atomCount, 3);
});

test("the molecule reads its SMILES through the shared helper", () => {
	const source = readFileSync("chemlib/Molecule.ts", "utf8");
	assert.match(source, /this\.smilesString = writeSmiles\(this\._kekule_obj/);
	assert.doesNotMatch(source, /Kekule\.IO\.saveFormatData/);
});
