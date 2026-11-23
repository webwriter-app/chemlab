import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { atomSymbol, oxidationOf, reactsWithWater, waterReactiveSymbols } from "../chemlib/halfReactions";

/**
 * Sodium, potassium and calcium decompose water. The metal takes the protons
 * and leaves its hydroxide, `2 M + 2 H₂O → 2 M⁺ + 2 OH⁻ + H₂`, so a piece of
 * sodium in a beaker of water turns caustic and gives off hydrogen. An acid
 * delivers the protons instead, and only what the acid leaves over reaches the
 * water. `Simulation.sMetalWater` runs between both paths and before the
 * displacement, because a metal that attacks the solvent never reaches a
 * dissolved cation as the elemental metal.
 */

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function dose(name: string, ml: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `recipe ${name}`);
	return prepareDose(recipe, loadMoleculeDefinition)(ml);
}

/** A weighed portion, given as the amount of substance, the way the palette reads it back. */
function dryDose(name: string, moles: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `solid recipe ${name}`);
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return prepareDose(recipe, loadMoleculeDefinition)(moles * molarMass / recipe.density);
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

function moles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

/** Dissolved and escaped hydrogen, the way the vessel counts it. */
function hydrogen(solution: Mixture) {
	return (solution.dissolvedGas.get("H2") ?? 0) + (solution.evolvedGas.get("H2") ?? 0);
}

function near(actual: number, expected: number, tolerance: number) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected} (±${tolerance})`);
}

test("the catalog doses sodium and potassium as weighed metal pieces", () => {
	for (const [name, symbol, density] of [["Natrium", "Na", 0.968], ["Kalium", "K", 0.862]]) {
		const item = entry(name);
		assert.equal(item.category, "Metalle", `${name} is a metal`);
		assert.ok(item.recipe, `${name} has a recipe`);
		assert.equal(item.recipe.phase, "solid", `${name} is dosed as a solid`);
		near(item.recipe.density, density, 1e-9);
		const molecule = loadMoleculeDefinition(item.preview as never);
		assert.equal(molecule._atoms.length, 1, `${name} stays one atom`);
		assert.equal(atomSymbol(molecule.smilesString), symbol, `${name} is the element itself`);
		const couple = oxidationOf(molecule.smilesString);
		assert.ok(couple, `${name} has an oxidation couple`);
		assert.equal(couple.el, 1, `${name} gives one electron`);
		assert.ok(reactsWithWater(symbol), `${name} attacks water`);
	}
	// The three water-reactive metals of the catalog are exactly the ones the
	// half-reaction table names, so no solid left in the palette reacts with
	// water by accident and none that should react stays inert.
	const reactive = chemicalCatalog
		.filter(item => item.recipe?.phase === "solid")
		.map(item => loadMoleculeDefinition(item.preview as never))
		.filter(molecule => reactsWithWater(atomSymbol(molecule.smilesString)))
		.map(molecule => atomSymbol(molecule.smilesString));
	assert.deepEqual([...new Set(reactive)].sort(), ["Ca", "K", "Na"]);
	assert.deepEqual([...waterReactiveSymbols].sort(), ["Ba", "Ca", "Cs", "K", "Li", "Na"]);
});

test("sodium in water leaves sodium hydroxide and half a mole of hydrogen per atom", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Natrium", 0.002));
	near(Simulation.getpH(solution), 12.301, 0.01);
	near(moles(solution, "[Na+]"), 0.002, 1e-9);
	near(hydrogen(solution), 0.001, 1e-9);
	// 0.01 mol/L hydrogen sits far above its saturation, so most of it escapes.
	assert.ok(solution.evolvedGas.get("H2") > 0, "hydrogen leaves the vessel");
	assert.ok(solution.dissolvedGas.get("H2") > 0, "and the rest stays dissolved");
	assert.ok(moles(solution, "[Na]") < 1e-12, "the metal is used up");
	assert.equal(solution.solidSediment.mass, 0, "and no solid is left");
});

test("potassium reacts the same way, with its own mass and its own hydroxide", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Kalium", 0.001));
	near(Simulation.getpH(solution), 12, 0.01);
	near(moles(solution, "[K+]"), 0.001, 1e-9);
	near(hydrogen(solution), 0.0005, 1e-9);
});

test("calcium carries two electrons and leaves a hydroxide that stays dissolved", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Calcium", 0.001));
	near(moles(solution, "[Ca2+]"), 0.001, 1e-9);
	near(hydrogen(solution), 0.0005, 1e-9);
	// 0.01 mol/L calcium with twice its hydroxide is below the solubility
	// product, so lime water stays clear and only the hydrolysis of the cation
	// keeps the reading a little under the ideal 12.30.
	near(Simulation.getpH(solution), 12.231, 0.02);
	assert.equal(solution.solidSediment.mass, 0, "lime water stays clear");
});

test("a metal the hydrogen couple does not reach stays whole in water", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Zink", 0.002));
	near(Simulation.getpH(solution), 7, 1e-6);
	assert.equal(hydrogen(solution), 0);
	near(moles(solution, "[Zn2+]"), 0, 1e-12);
	near(solution.solidSediment.mass, 0.002 * 65.38, 1e-4);
});

test("an excess of acid takes all the metal before the water can", () => {
	// 2 mmol sodium needs 2 mmol protons, so 1 mmol of the 3 mmol acid is left.
	const solution = mix(dose("Wasser", 97), dose("Salzsäure (1 mol/L)", 3), dryDose("Natrium", 0.002));
	near(Simulation.getpH(solution), 2, 0.02);
	near(moles(solution, "[Na+]"), 0.002, 1e-9);
	near(hydrogen(solution), 0.001, 1e-9);
	assert.ok(Simulation.getpH(solution) < 2.02, "no hydroxide is left");
});

test("acid that runs out leaves the rest of the metal to the water", () => {
	// The acid takes 1 mmol sodium and pairs it with the chloride; the second
	// millimole decomposes the water, so the solution turns as alkaline as if
	// 1 mmol of sodium hydroxide had been weighed in.
	const solution = mix(dose("Wasser", 99), dose("Salzsäure (1 mol/L)", 1), dryDose("Natrium", 0.002));
	near(Simulation.getpH(solution), 12, 0.02);
	near(moles(solution, "[Na+]"), 0.002, 1e-9);
	near(hydrogen(solution), 0.001, 1e-9);
});

test("an alkaline solution does not stop the attack", () => {
	// 1 mmol of lye plus 2 mmol of sodium end at 3 mmol of hydroxide in 101 mL.
	const solution = mix(dose("Wasser", 100), dose("Natronlauge (1 mol/L)", 1), dryDose("Natrium", 0.002));
	near(hydrogen(solution), 0.001, 1e-9);
	near(Simulation.getpH(solution), 12.473, 0.02);
	assert.ok(moles(solution, "[Na]") < 1e-12, "the metal is used up");
});

test("sodium in copper sulfate forms hydroxide instead of plating the copper", () => {
	const solution = mix(dose("Wasser", 99), dose("Kupfer(II)-sulfatlösung", 1), dryDose("Natrium", 0.002));
	near(hydrogen(solution), 0.001, 1e-9);
	near(moles(solution, "[Na+]"), 0.002, 1e-9);
	assert.ok(moles(solution, "[Cu2+]") < 1e-6, "no copper ion is left");
	// Sodium is no reducing agent at a metal surface here: the hydroxide it
	// leaves precipitates the copper instead of depositing it.
	assert.ok(moles(solution, "[Cu]") < 1e-12, "no copper plating");
	near(solution.solidSediment.mass, 0.001 * 97.561, 0.002);
	assert.ok(Simulation.getpH(solution) > 7 && Simulation.getpH(solution) < 8.5, "the hydroxide holds the reading");
});

test("lime water precipitates the copper of a sulfate solution as hydroxide", () => {
	const solution = mix(dose("Wasser", 99), dose("Kupfer(II)-sulfatlösung", 1), dryDose("Calcium", 0.001));
	// The copper sulfate solution is weakly acidic on its own, so a sliver of
	// the calcium takes the proton path and the hydrogen reads a little over
	// the half mole the water alone would give.
	near(hydrogen(solution), 0.0005, 5e-6);
	assert.ok(moles(solution, "[Cu2+]") < 1e-6, "no copper ion is left");
	assert.ok(moles(solution, "[Cu]") < 1e-12, "no copper plating");
	// 1 mmol of copper hydroxide, plus the calcium sulfate that the lime does
	// not hold in solution; how much of it precipitates follows its own
	// solubility product, so the mass lies between the hydroxide alone and the
	// whole millimole of gypsum.
	const copperHydroxide = 0.001 * 97.561;
	const gypsum = 0.001 * 136.14;
	assert.ok(solution.solidSediment.mass > copperHydroxide, "gypsum precipitates too");
	assert.ok(solution.solidSediment.mass < copperHydroxide + gypsum, "but not all of it");
});
