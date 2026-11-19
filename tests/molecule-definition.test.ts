import assert from "node:assert/strict";
import { test } from "node:test";
import { Molecule } from "../chemlib";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

test("saved polyatomic ions serialize once with their final charge and bonds", t => {
	const serialize = t.mock.method(Molecule.prototype, "setSmilesString");
	const definition = {
		formula: "OH-",
		atoms: ["oxygen", "hydrogen"],
		charges: [-1, 0],
		bonds: ["0-1:covalent:1"],
	};

	assert.equal(loadMoleculeDefinition().smilesString, "");
	assert.equal(serialize.mock.callCount(), 0);

	const restored = loadMoleculeDefinition(definition);
	assert.equal(serialize.mock.callCount(), 1);
	assert.equal(restored.smilesString, "[OH-]");
	assert.equal(restored._totalCharge, -1);
	assert.equal(restored._bonds.length, 1);

	const charges: number[] = [];
	const incremental = loadMoleculeDefinition(definition, atom => charges.push(atom.getIonicCharge()));
	assert.deepEqual(charges, [-1, 0]);
	assert.equal(incremental.smilesString, restored.smilesString);
	assert.equal(incremental.getTotMolMass(), restored.getTotMolMass());
});
