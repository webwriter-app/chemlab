import assert from "node:assert/strict";
import { test } from "node:test";
import { Molecule, Simulation } from "../chemlib";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

/**
 * Chloroacetic acid is absent from the tabulated acid families, so the
 * protonation states of a custom compound are built on demand. Every graph
 * edit would otherwise reserialize the SMILES, which dominates the cost.
 */
function chloroaceticAcid() {
	return loadMoleculeDefinition({
		formula: "C₂H₃ClO₂",
		atoms: ["carbon", "carbon", "oxygen", "oxygen", "chlorine", "hydrogen", "hydrogen", "hydrogen"],
		bonds: ["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1", "3-6:covalent:1", "0-4:covalent:1", "0-5:covalent:1", "0-7:covalent:1"],
		aqueousAcidBase: { step: 0, pKa: [2.87] },
	});
}

function water(ml: number) {
	const entry = chemicalCatalog.find((item) => item.name === "Wasser");
	assert.ok(entry?.recipe, "Wasser");
	return prepareDose(entry.recipe, loadMoleculeDefinition)(ml);
}

type GraphEdits = { atoms: number; bonds: number; serializations: number };

/** Counts graph edits and SMILES serializations while a closure runs. */
function countGraphEdits<T>(run: () => T) {
	const counts: GraphEdits = { atoms: 0, bonds: 0, serializations: 0 };
	const target = Molecule.prototype as unknown as {
		addAtom: (...args: never[]) => unknown;
		addBond: (...args: never[]) => unknown;
		setSmilesString: () => void;
	};
	const { addAtom, addBond, setSmilesString } = target;
	target.addAtom = function (this: Molecule, ...args: never[]) {
		counts.atoms += 1;
		return addAtom.apply(this, args);
	};
	target.addBond = function (this: Molecule, ...args: never[]) {
		counts.bonds += 1;
		return addBond.apply(this, args);
	};
	target.setSmilesString = function (this: Molecule) {
		counts.serializations += 1;
		return setSmilesString.call(this);
	};
	let value: T;
	try {
		value = run();
	} finally {
		Object.assign(target, { addAtom, addBond, setSmilesString });
	}
	return { counts, value };
}

test("a custom protonation state is serialized once, not once per graph edit", () => {
	const solution = water(100);
	const acid = chloroaceticAcid();
	assert.equal(acid.smilesString, "ClCC(O)=O");
	solution.addMolecule(acid, 1e-3);

	const { counts, value } = countGraphEdits(() => Simulation.getpH(solution));
	assert.ok(counts.atoms > 0, "the conjugate state is built on demand");
	assert.ok(counts.serializations > 0, "the built state is serialized");
	assert.ok(
		counts.serializations * 4 <= counts.atoms + counts.bonds,
		`${counts.serializations} serializations for ${counts.atoms} atoms and ${counts.bonds} bonds`,
	);
	// A single monoprotic acid with pKa 2.87 at 0.01 mol/L.
	const ka = 10 ** -2.87;
	const protons = (-ka + Math.sqrt(ka * ka + 4 * ka * 0.01)) / 2;
	assert.ok(Math.abs(value - -Math.log10(protons)) < 0.002, `${value} vs ${-Math.log10(protons)}`);
});

test("a repeated read of the same solution rebuilds no protonation state", () => {
	const solution = water(100);
	solution.addMolecule(chloroaceticAcid(), 1e-3);
	const first = Simulation.getpH(solution);
	const { counts, value } = countGraphEdits(() => Simulation.getpH(solution));
	assert.deepEqual(counts, { atoms: 0, bonds: 0, serializations: 0 });
	assert.equal(value, first);
});
