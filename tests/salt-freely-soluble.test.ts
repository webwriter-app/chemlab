import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, solutionDisplayNames, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * Three freely soluble salts whose anion the equilibria do not run: ammonium
 * sulfate joins the ammonia and sulfuric-acid families through its own ions,
 * while thiocyanate and permanganate travel as spectators. Each pair is joined
 * by a `saltSolubility` entry, so the dry salt settles at the same saturation
 * as the stock.
 */
const pairs = [
	{ solid: "Ammoniumsulfat", stock: "Ammoniumsulfatlösung", table: "(NH4)2SO4",
		cation: "[N+]", anion: "[O-]S(=O)(=O)[O-]", cations: 2, anions: 1 },
	{ solid: "Kaliumthiocyanat", stock: "Kaliumthiocyanatlösung", table: "KSCN",
		cation: "[K+]", anion: "N#C[S-]", cations: 1, anions: 1 },
	{ solid: "Kaliumpermanganat", stock: "Kaliumpermanganatlösung", table: "KMnO4",
		cation: "[K+]", anion: "[O-][Mn](=O)(=O)=O", cations: 1, anions: 1 },
];

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function dose(name: string, ml: number, concentration = 1) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `recipe ${name}`);
	return prepareDose(withConcentration(recipe, concentration), loadMoleculeDefinition)(ml);
}

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

test("the three salts come as a dry solid and as a stock", () => {
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
		near(liquid.concentrationLimit, saturation(table), 1e-15);
		// The palette names the stock after its salt, like the other stocks.
		assert.equal(solutionDisplayNames[stock], solid, `${stock} is labelled ${solid}`);
	}
});

test("a dry dose dissolves into the same solution as its stock", () => {
	for (const { solid, stock, table, cation, anion, cations, anions } of pairs) {
		const fromSolid = mix(dose("Wasser", 100), dryDose(solid, 0.01));
		const fromStock = mix(dose(stock, 100, 0.1));
		for (const bath of [fromSolid, fromStock]) {
			assert.equal(solidMoles(bath, table), 0, `${solid} dissolves at 0.1 mol/L`);
			near(bath._solutionVolume, 0.1);
			near(ionMoles(bath, cation) / bath._solutionVolume, 0.1 * cations, 1e-8);
			near(ionMoles(bath, anion) / bath._solutionVolume, 0.1 * anions, 1e-8);
			assert.ok((Simulation.getSaltSaturation(bath)?.fraction ?? 0) < 1, `${solid} stays unsaturated`);
		}
		near(Simulation.getpH(fromStock), Simulation.getpH(fromSolid), 1e-9);
	}
});

test("the two spectator salts leave the water equilibrium alone", () => {
	for (const { solid, table, cation, anion } of pairs.slice(1)) {
		const bath = mix(dose("Wasser", 100), dryDose(solid, 0.01));
		// Neither thiocyanate nor permanganate has an acid-base entry, so the
		// bath stays neutral while both ions keep their full amount.
		near(Simulation.getpH(bath), 7, 1e-9);
		near(ionMoles(bath, cation) / bath._solutionVolume, 0.1, 1e-9);
		near(ionMoles(bath, anion) / bath._solutionVolume, 0.1, 1e-9);
	}
});

test("ammonium sulfate acidifies through the existing ammonia family", () => {
	// 0.1 mol/L salt is 0.2 mol/L ammonium next to 0.1 mol/L sulfate. The
	// hydrogen sulfate equilibrium takes part of the released protons back, so
	// the bath reads 5.491 instead of the 4.974 of a 0.2-molar ammonium
	// chloride solution. Both families are already in the table; the salt adds
	// no reaction of its own.
	const bath = mix(dose("Wasser", 100), dryDose("Ammoniumsulfat", 0.01));
	near(Simulation.getpH(bath), 5.491, 1e-3);
	const chloride = mix(dose("Ammoniumchloridlösung", 100, 0.2));
	near(Simulation.getpH(chloride), 4.974, 1e-3);
	assert.ok(Simulation.getpH(bath) > Simulation.getpH(chloride));

	// Two millimoles of sodium hydroxide neutralise part of the ammonium.
	const neutralised = mix(dose("Ammoniumsulfatlösung", 100, 0.1), dose("Natronlauge (1 mol/L)", 20, 0.1));
	near(Simulation.getpH(neutralised), 8.296, 1e-3);
});

test("the sulfate takes part in the existing salt equilibria", () => {
	// Barium chloride precipitates the sulfate of the ammonium stock as
	// BaSO4, so the salt is not a dead pair of ions in the bath.
	const precipitated = mix(dose("Ammoniumsulfatlösung", 100, 0.1), dose("Bariumchloridlösung", 1, 0.1));
	near(solidMoles(precipitated, "BaSO4"), 1e-4, 1e-9);
	near(ionMoles(precipitated, "[Ba2+]") / precipitated._solutionVolume, 1.1226e-9, 1e-12);
	near(Simulation.getpH(precipitated), 5.489, 1e-3);
});

test("excess dry salt settles at the tabulated saturation and redissolves on dilution", () => {
	for (const { solid, table, cation, cations } of pairs) {
		const limit = saturation(table);
		const dosed = 0.1 * (limit + 2);
		const loaded = mix(dose("Wasser", 100), dryDose(solid, dosed));
		const reservoir = solidMoles(loaded, table);
		assert.ok(reservoir > 0, `${solid} keeps a reservoir above saturation`);
		near(ionMoles(loaded, cation) / loaded._solutionVolume, cations * limit, 0.02);
		near(ionMoles(loaded, cation) + cations * reservoir, cations * dosed, 1e-9);

		const diluted = mix(loaded, dose("Wasser", 900));
		assert.equal(solidMoles(diluted, table), 0, `${solid} dissolves in ten times the water`);
		near(diluted._solutionVolume, 1, 1e-9);
		near(ionMoles(diluted, cation) / diluted._solutionVolume, cations * dosed, 1e-9);
	}
});

test("the stock stays clear at its own limit", () => {
	for (const { stock, table, cation, cations } of pairs) {
		const loaded = dose(stock, 100, saturation(table));
		assert.equal(solidMoles(loaded, table), 0, `${stock} keeps no reservoir at its limit`);
		// At its own limit the bath reads as saturated, never beyond it. The
		// fraction is clamped to one, so a dosed stock sits on the mark.
		const state = Simulation.getSaltSaturation(loaded);
		assert.equal(state?.formula, table);
		assert.ok((state?.fraction ?? 0) <= 1, `${stock} stays within its saturation`);
		assert.ok((state?.fraction ?? 0) > 0.9, `${stock} reads near saturation`);
		near(ionMoles(loaded, cation) / loaded._solutionVolume, cations * saturation(table), 1e-6);
	}
});
