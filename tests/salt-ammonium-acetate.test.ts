import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * Two freely soluble salts whose ions are weak electrolytes. Ammonium and
 * acetate are handled by the acid-base solver, so these are the first dosed
 * salts that shift the pH through their own ions instead of through a
 * hydrolysing cation from the hydroxide table.
 */
const pairs = [
	{ solid: "Ammoniumchlorid", stock: "Ammoniumchloridlösung", table: "NH4Cl",
		cation: "[N+]", anion: "[Cl-]", cations: 1, anions: 1, pH: 5.125 },
	{ solid: "Natriumacetat", stock: "Natriumacetatlösung", table: "CH3COONa",
		cation: "[Na+]", anion: "CC(=O)[O-]", cations: 1, anions: 1, pH: 8.875 },
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

test("ammonium chloride and sodium acetate come as a dry solid next to their stock", () => {
	for (const { solid, stock, table, cation, anion, cations, anions } of pairs) {
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

		// The ionic bond has to split the dry salt into exactly the ions of the
		// solubility table, or the reservoir would never register.
		const built = loadMoleculeDefinition(dry.recipe.parts[0].molecule);
		const fragments: { ion: { smilesString: string }; count: number }[] =
			(Simulation as unknown as { saltFragments(molecule: typeof built): typeof fragments })
				.saltFragments(built);
		const found = fragments.map(({ ion, count }) => [ion.smilesString, count]);
		assert.deepEqual(found, [[cation, cations], [anion, anions]], `${solid} splits into its table ions`);
	}
});

test("the dry salt dissolves into the same solution as its stock", () => {
	for (const { solid, stock, table, cation, anion, cations, anions } of pairs) {
		const fromSolid = mix(dose("Wasser", 100, 1), dryDose(solid, 0.01));
		assert.equal(solidMoles(fromSolid, table), 0, `${solid} dissolves at 0.1 mol/L`);
		near(fromSolid._solutionVolume, 0.1);
		near(ionMoles(fromSolid, cation) / 0.1, 0.1 * cations, 1e-8);
		near(ionMoles(fromSolid, anion) / 0.1, 0.1 * anions, 1e-8);

		const fromStock = dose(stock, 100, 0.1);
		near(fromStock._solutionVolume, 0.1);
		near(ionMoles(fromStock, cation), ionMoles(fromSolid, cation), 1e-10);
		near(ionMoles(fromStock, anion), ionMoles(fromSolid, anion), 1e-10);
		near(Simulation.getpH(fromStock), Simulation.getpH(fromSolid), 1e-6);
	}
});

test("both salts reach the pH of their ion as a weak electrolyte", () => {
	// Ideal limits for 0.1 mol/L at 25 °C: NH₄⁺ with pKa 9.25 gives 5.12,
	// acetate with pKa 4.75 gives 8.88.
	for (const { solid, pH } of pairs) {
		near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose(solid, 0.01))), pH, 0.003);
	}
});

test("excess dry salt settles at the tabulated saturation and redissolves on dilution", () => {
	for (const { solid, table, cation, anion, cations, anions } of pairs) {
		const limit = saturation(table);
		const dosed = 0.1 * (limit + 2);
		const loaded = mix(dose("Wasser", 100, 1), dryDose(solid, dosed));
		const reservoir = solidMoles(loaded, table);
		assert.ok(reservoir > 0, `${solid} keeps a reservoir above saturation`);
		assert.ok(reservoir < dosed * 0.999, `${solid} does not keep the whole dose as a solid`);
		const dissolved = dosed - reservoir;
		near(ionMoles(loaded, cation), dissolved * cations, 1e-8 * dosed);
		near(ionMoles(loaded, anion), dissolved * anions, 1e-8 * dosed);
		const state = Simulation.getSaltSaturation(loaded);
		assert.equal(state?.formula, table, `${solid} saturates on its own entry`);
		near(state.fraction, 1, 0.01);

		const diluted = mix(loaded, dose("Wasser", 400, 1));
		assert.equal(solidMoles(diluted, table), 0, `${solid} redissolves on dilution`);
		near(ionMoles(diluted, cation), dosed * cations, 1e-8 * dosed);
		assert.ok((Simulation.getSaltSaturation(diluted)?.fraction ?? 1) < 1);
	}
});

test("the two ions take part in the usual neutralisations", () => {
	// Acetate buffers the acid at its pKa; ammonium the base at its own.
	const acetate = mix(dose("Natriumacetatlösung", 100, 0.1), dose("Salzsäure (1 mol/L)", 5, 1));
	near(acetate._solutionVolume, 0.105);
	near(ionMoles(acetate, "CC(=O)[O-]"), 0.01);
	near(Simulation.getpH(acetate), 4.75, 0.01);

	const ammonium = mix(dose("Ammoniumchloridlösung", 100, 0.1), dose("Natronlauge (1 mol/L)", 5, 1));
	near(ammonium._solutionVolume, 0.105);
	near(ionMoles(ammonium, "[N+]"), 0.01);
	near(Simulation.getpH(ammonium), 9.25, 0.01);
});
