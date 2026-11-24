import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { StructureManager } from "../chemlib";
import { Kekule, writeSmiles } from "../chemlib/kekule";

/**
 * Kekulé's SMILES writer is reached through a registry that belongs to the
 * page, not to the widget. A page that loads a second copy of Kekulé can leave
 * that registry empty while ChemLab keeps building molecules, and the failed
 * lookup used to abort the first atom of every structure. The laboratory now
 * writes through the writer itself, so these tests empty the registry and
 * remove the writer class to prove that both stay harmless.
 */

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
