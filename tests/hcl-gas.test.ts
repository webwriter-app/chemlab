import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { evolvedGases, MOLAR_GAS_VOLUME } from "../chemlib/gasEvolution";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { catalogAqueousStructure, catalogStructures, structureCatalog } from "../molecule-builder/catalog";

/**
 * Hydrogen chloride is bubbled in as a gas and behaves as the strong acid it
 * is: a portion dissolves completely in a lab beaker, sets the pH from its own
 * amount and leaves chloride that a silver salt precipitates. The saturation
 * bound is the 12.1 mol/L of the concentrated acid, and it holds the stored
 * acid rather than the neutral share of its family — with a pKa of −6 the
 * neutral share is a few 10⁻⁸ of the total, which a neutral-share limit would
 * read as "nothing dissolved yet". Chloride that came in with a salt belongs
 * to the same family but is a spectator, so it can neither escape as HCl nor
 * keep the vessel from taking up a portion.
 */

const gas = 0.1 / MOLAR_GAS_VOLUME;

function entry(name: string) {
	const found = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(found?.recipe, name);
	return found;
}

function dose(name: string, volumeMl: number) {
	const prepared = prepareDose(entry(name).recipe!, loadMoleculeDefinition);
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

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

/** Stored hydrogen chloride, which is the analytical acid of its family. */
function acidMol(mix: Mixture) {
	const acid = mix._activeMolecules.find(molecule => molecule.smilesString === "Cl");
	return acid ? (mix._molProperties[acid._id + "n"] ?? 0) : 0;
}

function evolved(mix: Mixture, gas: string) {
	return mix.evolvedGas.get(gas) ?? 0;
}

function freeIon(mix: Mixture, smiles: string) {
	return Simulation.saltIons(mix).get(smiles)?.concentration;
}

test("the catalog offers hydrogen chloride as a gas and a Henry row bounds it", () => {
	const bottle = entry("Chlorwasserstoff");
	const recipe = bottle.recipe!;
	assert.equal(recipe.phase, "gas");
	assert.equal(recipe.gas, "HCl");
	assert.equal(bottle.formula, "HCl");
	// the dose books the acid itself, the way carbon dioxide books carbonic acid
	assert.equal(recipe.parts?.length, 1);
	assert.equal(recipe.parts![0].amount, 1);
	// a gas at lab conditions is far lighter than any liquid or solid portion
	assert.ok(recipe.density > 0 && recipe.density < 0.005, `${recipe.density}`);
	const table = evolvedGases.HCl;
	assert.ok(table, "Henry row");
	assert.equal(table.phase, "gas");
	assert.equal(table.family, "Cl");
	assert.equal(table.dissociated, true);
	// the saturation is the 37 % saturated acid the lab keeps as a stock
	assert.equal(table.solubility, 12.1);
});

test("a portion dissolves completely and sets the pH from its own amount", () => {
	const beaker = vesselWith(dose("Wasser", 100), dose("Chlorwasserstoff", 100));
	const mix = beaker._content;
	near(mix._solutionVolume, 0.1);
	// a 100 mL portion is 4.09 mmol, so 0.041 mol/L of the strong acid
	near(acidMol(mix), gas, 1e-12);
	near(acidMol(mix) / mix._solutionVolume, 0.040866, 1e-5);
	near(Simulation.getpH(mix), 1.389, 0.01);
	// well below the 12.1 mol/L saturation, so the whole portion stays dissolved
	assert.equal(mix.evolvedGas.get("HCl"), undefined);
	near(mix.dissolvedGas.get("HCl") ?? 0, 0);
	// the acid gives its proton to the charge balance and leaves a free chloride
	near(freeIon(mix, "[Cl-]")!, 0.040866, 1e-5);
});

test("what exceeds the saturation leaves the solution", () => {
	// 20.4 mmol of gas in 1 mL of water is more than the 12.1 mol/L the acid holds
	const beaker = vesselWith(dose("Wasser", 1), dose("Chlorwasserstoff", 500));
	const mix = beaker._content;
	const dosed = 0.5 / MOLAR_GAS_VOLUME;
	near(acidMol(mix) / mix._solutionVolume, evolvedGases.HCl.solubility!, 1e-6);
	near(evolved(mix, "HCl"), dosed - acidMol(mix), 1e-12);
	assert.ok(evolved(mix, "HCl") > 0);
	near(acidMol(mix) + evolved(mix, "HCl"), dosed, 1e-12);
	// the vented gas is a gas phase, so a collection tube reaches it
	near(mix.evolvedGasMol, evolved(mix, "HCl"), 1e-12);
});

test("a dose without water keeps its acid and dissolves it later", () => {
	// The dose books a solute, not an offer to the gas space, so a portion that
	// arrives in a dry beaker stays there and only meets water when it comes.
	const beaker = vesselWith(dose("Chlorwasserstoff", 100));
	const mix = beaker._content;
	near(acidMol(mix), gas, 1e-12);
	assert.equal(mix._solutionVolume, 0);
	assert.equal(mix.evolvedGas.size, 0);
	beaker.addContents({ nMix: dose("Wasser", 100) });
	near(Simulation.getpH(mix), 1.389, 0.01);
	near(acidMol(mix), gas, 1e-12);
});

test("the chloride of a salt is a spectator and stays in the solution", () => {
	const beaker = vesselWith(dose("Natriumchloridlösung (1 mol/L)", 100),
		dose("Chlorwasserstoff", 500));
	const mix = beaker._content;
	const dosed = 0.5 / MOLAR_GAS_VOLUME;
	assert.equal(mix.evolvedGas.get("HCl"), undefined);
	near(acidMol(mix), dosed, 1e-12);
	// the stock brings 0.1 mol of chloride of its own
	near(freeIon(mix, "[Cl-]")!, 1 + dosed / mix._solutionVolume, 1e-6);
});

test("the gas fizzes a carbonate and leaves the chloride behind", () => {
	// 10 mL of the molar carbonate stock hold 10 mmol, more acid than it takes
	// to drive all of the carbon dioxide out of the solution
	const beaker = vesselWith(dose("Natriumcarbonatlösung", 10),
		dose("Chlorwasserstoff", 500));
	const mix = beaker._content;
	const carbonate = 0.01;
	near(evolved(mix, "CO2"), carbonate - evolvedGases.CO2.solubility! * mix._solutionVolume, 1e-5);
	assert.ok(Simulation.getpH(mix) < 2, `${Simulation.getpH(mix)}`);
});

test("silver nitrate precipitates the chloride and keeps the proton", () => {
	const beaker = vesselWith(dose("Silbernitratlösung", 100), dose("Chlorwasserstoff", 100));
	const mix = beaker._content;
	const solid = mix._activeMolecules.find(molecule => molecule.solidSaltFormula === "AgCl");
	assert.ok(solid, "silver chloride settles");
	near(mix._molProperties[solid._id + "n"], gas, 1e-9);
	// the silver takes the chloride, so the acid is gone and its proton stays
	// in the solution as the nitric acid of the stock
	near(Simulation.getpH(mix), 1.389, 0.01);
	assert.equal(mix.evolvedGas.get("HCl"), undefined);
});

test("the hydrochloric acid stock keeps reading the same", () => {
	const beaker = vesselWith(dose("Salzsäure (1 mol/L)", 100));
	const mix = beaker._content;
	near(acidMol(mix), 0.1, 1e-12);
	near(Simulation.getpH(mix), 0, 0.01);
	assert.equal(mix.evolvedGas.get("HCl"), undefined);
});

test("a two-dose portion adds up and stays below the saturation", () => {
	const beaker = vesselWith(dose("Wasser", 100), dose("Chlorwasserstoff", 100),
		dose("Chlorwasserstoff", 100));
	const mix = beaker._content;
	near(acidMol(mix), 2 * gas, 1e-12);
	near(Simulation.getpH(mix), -Math.log10(2 * gas / 0.1), 0.01);
	assert.equal(mix.evolvedGas.get("HCl"), undefined);
});

test("the molecule builder draws hydrogen chloride from the catalog", () => {
	assert.ok(structureCatalog.some(item => item.name === "Chlorwasserstoff"));
	const structures = catalogStructures("Chlorwasserstoff");
	assert.equal(structures.length, 1);
	// H–Cl is one hydrogen on one chlorine, and the acid-base bond draws as a
	// single bond in the builder
	assert.equal(structures[0].atoms.length, 2);
	assert.equal(structures[0].bonds.length, 1);
	// a gas bottle is no aqueous solution, so there is no ion pair to draw
	assert.equal(catalogAqueousStructure("Chlorwasserstoff"), undefined);
	// and its reference graph is the one the dose loads
	assert.equal(entry("Chlorwasserstoff").preview?.formula, "HCl");
});
