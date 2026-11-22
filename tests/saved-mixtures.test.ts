import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { readSavedMixtures, snapshotMixture } from "../data/savedMixtures";

function stock(name: string, ml: number): Mixture {
	const recipe = chemicalCatalog.find(item => item.name === name)?.recipe;
	assert.ok(recipe, name);
	return prepareDose(recipe, loadMoleculeDefinition)(ml);
}

function save(mix: Mixture) {
	const recipe = snapshotMixture(mix);
	assert.ok(recipe);
	const [saved] = readSavedMixtures(JSON.parse(JSON.stringify([{ key: "saved-mixture:test", name: "Stock", recipe }])));
	assert.ok(saved);
	return saved;
}

function amounts(mix: Mixture) {
	return new Map(mix._activeMolecules.map(molecule => [
		molecule.solidSaltFormula ?? molecule.smilesString,
		mix._molProperties[molecule._id + "n"] as number,
	]));
}

test("a saved solution retains its molar ratios, volume and pH when dosed again", () => {
	const beaker = ComponentManager.newChemComponent(ComponentType.Beaker);
	beaker.addContents({ nMix: stock("Schwefelsäure (1 mol/L)", 25) });
	beaker.addContents({ nMix: stock("Wasser", 75) });
	const original = beaker._content;
	const saved = save(original);
	const portion = prepareDose(saved.recipe, loadMoleculeDefinition)(50);
	assert.ok(Math.abs(portion.contentVolume - 0.05) < 1e-10);
	for (const [species, moles] of amounts(original)) {
		assert.ok(Math.abs(amounts(portion).get(species) - moles / 2) < 1e-10, species);
	}
	assert.ok(Math.abs(Simulation.getpH(portion) - Simulation.getpH(original)) < 0.01);
	beaker._content = StructureManager.newMixture();
	assert.equal(amounts(prepareDose(saved.recipe, loadMoleculeDefinition)(50)).size, amounts(portion).size);
});

test("sediment keeps its constituent ions and separated headspace stays behind", () => {
	const beaker = ComponentManager.newChemComponent(ComponentType.Beaker);
	beaker.addContents({ nMix: stock("Kupfer(II)-sulfatlösung", 25) });
	beaker.addContents({ nMix: stock("Natriumcarbonatlösung", 25) });
	const original = beaker._content;
	const solid = original._activeMolecules.find(molecule => molecule.solidSaltFormula);
	assert.ok(solid?.solidSaltIons, "fixture must form a precipitate");
	original.evolveGas("O2", 0.1);
	original.dissolvedGas.set("O2", 1e-6);
	original.excessCharge = 1e-9;
	const saved = save(original);
	const dose = prepareDose(saved.recipe, loadMoleculeDefinition)(saved.recipe.sampleMl / 2);
	const restored = dose._activeMolecules.find(molecule => molecule.solidSaltFormula === solid.solidSaltFormula);
	assert.deepEqual(restored.solidSaltIons.map(ion => ion.smilesString), solid.solidSaltIons.map(ion => ion.smilesString));
	assert.equal(dose.evolvedGas.size, 0);
	assert.equal(dose.dissolvedGas.get("O2"), 5e-7);
	assert.equal(dose.excessCharge, 5e-10);
	const target = ComponentManager.newChemComponent(ComponentType.Beaker);
	target.addContents({ nMix: dose });
	assert.ok(target._content.solidSediment.mass > 0);
});

test("dry ionic compounds keep their charge and solid phase through a JSON round trip", () => {
	const dry = stock("Natriumchlorid", 5);
	const saved = save(dry);
	const dose = prepareDose(saved.recipe, loadMoleculeDefinition)(5);
	const original = dry._activeMolecules[0];
	const reconstructed = dose._activeMolecules[0];
	assert.deepEqual(reconstructed._atoms.map(atom => atom.getIonicCharge()), original._atoms.map(atom => atom.getIonicCharge()));
	assert.equal(reconstructed._bonds[0].getType(), "ionic");
	assert.equal(reconstructed.dosedAsSolid, true);
	assert.equal(dose.hasLiquidContents, false);
	assert.ok(Math.abs(dose.solidSediment.mass - dry.solidSediment.mass) < 1e-10);
});
