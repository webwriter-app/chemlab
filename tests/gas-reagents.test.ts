import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { MOLAR_GAS_VOLUME, evolvedGases } from "../chemlib/gasEvolution";
import { chemicalCatalog } from "../data/chemicals";
import { DEFAULT_GAS_DOSE_ML, GAS_DOSE_MAX_ML, prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { catalogStructures } from "../molecule-builder/catalog";

/**
 * A gas is dosed as the volume it would take up at lab conditions, not as a
 * weighed portion. The dose therefore carries no liquid and no bulk volume:
 * the receiving vessel decides how much of it the solution dissolves, up to
 * the tabulated Henry saturation, and the rest joins the gas space. Only
 * carbon dioxide is booked as a solute, because the model keeps dissolved CO₂
 * as the carbonic-acid family that the gas evolution removes from.
 */

const gases = chemicalCatalog.filter(entry => entry.recipe?.phase === "gas");

function entry(name: string) {
	const found = chemicalCatalog.find(item => item.name === name);
	assert.ok(found?.recipe, name);
	return found;
}

function dose(name: string, volumeMl: number, concentration = 1): Mixture {
	const recipe = entry(name).recipe;
	const prepared = prepareDose(concentration === 1 ? recipe : { ...recipe, aqueousMolar: true }, loadMoleculeDefinition);
	assert.ok(prepared, name);
	const portion = prepared(volumeMl);
	assert.ok(portion, name);
	return portion;
}

function vesselWith(...portions: Mixture[]) {
	const beaker = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) beaker.addContents({ nMix: portion });
	return beaker;
}

function near(actual: number, expected: number, tolerance = 0.01) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

/** Amount of one gas in mol, dissolved or separated. */
function gasMol(mix: Mixture, gas: string) {
	return (mix.dissolvedGas.get(gas) ?? 0) + (mix.evolvedGas.get(gas) ?? 0);
}

test("every catalog gas names a tabulated gas and carries a builder structure", () => {
	assert.ok(gases.length >= 11, `${gases.length}`);
	for (const gas of gases) {
		const recipe = gas.recipe!;
		const table = evolvedGases[recipe.gas!];
		assert.ok(table, gas.name);
		assert.equal(table.phase, "gas", gas.name);
		assert.ok(table.solubility! > 0, gas.name);
		// a gas at lab conditions is lighter than any liquid or solid portion
		assert.ok(recipe.density > 0 && recipe.density < 0.005, `${gas.name}: ${recipe.density}`);
		assert.ok(catalogStructures(gas.name).length > 0, gas.name);
	}
});

test("a gas dose takes up the molar volume and brings no liquid", () => {
	const portion = dose("Sauerstoff", 100);
	assert.equal(portion.hasLiquidVolume, false);
	assert.equal(portion.hasLiquidContents, false);
	assert.equal(portion.contentVolume, 0);
	assert.equal(portion.addedVolume, 0);
	near(portion.offeredGas.get("O2")!, 0.1 / MOLAR_GAS_VOLUME, 1e-12);
	// the same volume is always the same amount, which is what a saved dose restores
	near(dose("Sauerstoff", 100).offeredGas.get("O2")!, 0.1 / MOLAR_GAS_VOLUME, 1e-12);
	near(portion.offeredGas.get("O2")! * GAS_DOSE_MAX_ML / DEFAULT_GAS_DOSE_ML, 0.5 / MOLAR_GAS_VOLUME, 1e-12);
});

test("carbon dioxide dissolves as carbonic acid and the excess escapes", () => {
	const beaker = vesselWith(dose("Wasser", 100));
	beaker.addContents({ nMix: dose("Kohlenstoffdioxid", 100) });
	const mix = beaker._content;
	near(mix._solutionVolume, 0.1, 1e-9);
	// dissolved CO₂ is the neutral carbonic acid of the acid-base table
	const carbonic = mix._activeMolecules.find(molecule => !StructureManager.isWater(molecule));
	assert.ok(carbonic, "carbonic acid");
	const moles = mix._molProperties[carbonic._id + "n"];
	near(moles / mix._solutionVolume, evolvedGases.CO2.solubility!, 5e-4);
	// what the saturation does not hold leaves the solution
	near(moles + mix.evolvedGas.get("CO2")!, 0.1 / MOLAR_GAS_VOLUME, 1e-9);
	near(Simulation.getpH(mix), 3.91, 0.01);
});

test("chlorine hydrolyses to hypochlorous acid and acidifies the water", () => {
	const beaker = vesselWith(dose("Wasser", 100));
	beaker.addContents({ nMix: dose("Chlor", 100) });
	const mix = beaker._content;
	const dosed = 0.1 / MOLAR_GAS_VOLUME;
	// chlorine is far more soluble than one portion needs, so none of it leaves
	assert.equal(mix.evolvedGas.get("Cl2"), undefined);
	// and half of what dissolved has hydrolysed
	assert.ok(mix.hypochlorite > 0);
	near(mix.hypochlorite + mix.dissolvedGas.get("Cl2")!, dosed, 1e-9);
	near(mix.hypochlorite, mix.dissolvedGas.get("Cl2")!, 1e-4);
	assert.ok(Simulation.getpH(mix) < 3, `${Simulation.getpH(mix)}`);
});

test("a sparingly soluble gas splits into solution and gas space", () => {
	const beaker = vesselWith(dose("Wasser", 100));
	beaker.addContents({ nMix: dose("Stickstoff", 100) });
	const mix = beaker._content;
	const dosed = 0.1 / MOLAR_GAS_VOLUME;
	near(mix.dissolvedGas.get("N2")!, evolvedGases.N2.solubility! * 0.1, 1e-12);
	near(mix.evolvedGas.get("N2")!, dosed - mix.dissolvedGas.get("N2")!, 1e-12);
	near(Simulation.getpH(mix), 7, 0.001);
});

test("a vessel without liquid keeps the whole dose in its gas space", () => {
	const beaker = vesselWith(dose("Sauerstoff", 100));
	assert.equal(beaker._content.dissolvedGas.size, 0);
	near(beaker._content.evolvedGas.get("O2")!, 0.1 / MOLAR_GAS_VOLUME, 1e-12);
	assert.ok(beaker._content.evolvedGasMol > 0);
});

test("a dose is offered once and follows the solution it lands in", () => {
	const portion = dose("Stickstoff", 100);
	const beaker = vesselWith(dose("Wasser", 100));
	beaker.addContents({ nMix: portion });
	// the vessel consumed the offer, so a second use of the same dose adds nothing
	assert.equal(portion.offeredGas.size, 0);
	beaker.addContents({ nMix: portion });
	const mix = beaker._content;
	near(gasMol(mix, "N2"), 0.1 / MOLAR_GAS_VOLUME, 1e-12);
});
