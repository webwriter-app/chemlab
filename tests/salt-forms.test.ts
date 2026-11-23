import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * Alkali halides and the one alkali nitrate that come as a dosed solid and a
 * dosed stock. Each pair is joined by an entry of `saltSolubility`, so the dry
 * salt settles against the same saturation as the stock.
 */
const pairs = [
	{ solid: "Kaliumchlorid", stock: "Kaliumchloridlösung", table: "KCl", cation: "[K+]", anion: "[Cl-]" },
	{ solid: "Kaliumbromid", stock: "Kaliumbromidlösung", table: "KBr", cation: "[K+]", anion: "[Br-]" },
	{ solid: "Kaliumiodid", stock: "Kaliumiodidlösung", table: "KI", cation: "[K+]", anion: "[I-]" },
	{ solid: "Natriumbromid", stock: "Natriumbromidlösung", table: "NaBr", cation: "[Na+]", anion: "[Br-]" },
	{ solid: "Natriumiodid", stock: "Natriumiodidlösung", table: "NaI", cation: "[Na+]", anion: "[I-]" },
	{ solid: "Kaliumnitrat", stock: "Kaliumnitratlösung", table: "KNO3", cation: "[K+]", anion: "[O-][N+](=O)[O-]" },
];

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function dose(name: string, ml: number, concentration: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `recipe ${name}`);
	return prepareDose(withConcentration(recipe, concentration), loadMoleculeDefinition)(ml);
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

function dryDose(name: string, moles: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `solid recipe ${name}`);
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return prepareDose(recipe, loadMoleculeDefinition)(moles * molarMass / recipe.density);
}

function ionMoles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

function solidMoles(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function saturation(table: string) {
	const limit = saltSolubility[table].saturation;
	assert.ok(limit !== undefined, `saturation ${table}`);
	return limit;
}

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

test("the alkali halides and potassium nitrate are dosed as solid and as stock", () => {
	for (const { solid, stock, table } of pairs) {
		const dry = entry(solid);
		assert.ok(dry.recipe, `${solid} has a recipe`);
		assert.equal(dry.recipe.phase, "solid", `${solid} is dosed as a solid`);
		assert.equal(dry.concentrationLimit, undefined, `${solid} is not a stock`);
		near(dry.recipe.density, saltSolubility[table].solidDensity, 1e-12);
		const liquid = entry(stock);
		assert.ok(liquid.recipe, `${stock} has a recipe`);
		assert.equal(liquid.recipe.phase, "liquid", `${stock} is a stock`);
		assert.equal(liquid.recipe.aqueousMolar, true);
		near(liquid.concentrationLimit, saturation(table), 1e-12);
	}
});

test("a dry alkali salt dissolves into the same solution as its stock", () => {
	for (const { solid, stock, table, cation, anion } of pairs) {
		const fromSolid = mix(dose("Wasser", 100, 1), dryDose(solid, 0.01));
		assert.equal(solidMoles(fromSolid, table), 0, `${solid} dissolves at 0.1 mol/L`);
		near(fromSolid._solutionVolume, 0.1);
		near(ionMoles(fromSolid, cation) / 0.1, 0.1, 1e-8);
		near(ionMoles(fromSolid, anion) / 0.1, 0.1, 1e-8);
		const fromStock = mix(dose(stock, 50, 0.2), dose("Wasser", 50, 1));
		assert.equal(solidMoles(fromStock, table), 0);
		near(fromStock._solutionVolume, 0.1);
		near(ionMoles(fromStock, cation) / 0.1, 0.1, 1e-8);
		near(ionMoles(fromStock, anion) / 0.1, 0.1, 1e-8);
		// Neither salt hydrolyses, so both routes stay at the neutral point.
		near(Simulation.getpH(fromSolid), 7, 1e-6);
		near(Simulation.getpH(fromStock), Simulation.getpH(fromSolid), 1e-6);
	}
});

test("excess dry salt settles at the tabulated saturation and redissolves on dilution", () => {
	for (const { solid, table, cation } of pairs) {
		const limit = saturation(table);
		const dosed = 0.1 * (limit + 2);
		const loaded = mix(dose("Wasser", 100, 1), dryDose(solid, dosed));
		const reservoir = solidMoles(loaded, table);
		assert.ok(reservoir > 0, `${solid} keeps a reservoir above saturation`);
		near(ionMoles(loaded, cation) / 0.1, limit, 0.02);
		near(ionMoles(loaded, cation) + reservoir, dosed, 1e-8);
		const diluted = mix(loaded, dose("Wasser", 400, 1));
		assert.equal(solidMoles(diluted, table), 0);
		near(ionMoles(diluted, cation), dosed, 1e-8);
	}
});
