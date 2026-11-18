import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType } from "../chemlib";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

test("a burette dispenses 0.1 mL by default and applies a changed dose on its next step", () => {
	const burette = ComponentManager.newChemComponent(ComponentType.Burette);
	const beaker = ComponentManager.newChemComponent(ComponentType.Beaker);
	const water = loadMoleculeDefinition({
		formula: "H₂O", atoms: ["oxygen", "hydrogen", "hydrogen"],
		bonds: ["0-1:covalent:1", "0-2:covalent:1"],
	});
	burette._content.addMolecule(water, 0.3 / water.getTotMolMass());
	assert.equal(burette.buretteStepMl, 0.1);
	assert.ok(Math.abs(burette.transferContents({}, beaker) * 1000 - 0.1) < 1e-10);

	assert.equal(burette.setBuretteStepMl(0.15), true);
	for (const invalid of [0, -1, NaN, Infinity]) assert.equal(burette.setBuretteStepMl(invalid), false);
	assert.ok(Math.abs(burette.transferContents({}, beaker) * 1000 - 0.15) < 1e-10);
	assert.ok(Math.abs(burette.transferContents({}, beaker) * 1000 - 0.05) < 1e-10);
	assert.ok(Math.abs(beaker._content.contentVolume * 1000 - 0.3) < 1e-10);
});
