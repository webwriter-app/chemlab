import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * The salts whose solubility table entry carries a saturated concentration and
 * a bulk density. Each one is dosed as a dry solid and as a stock, so the same
 * formula leaves the catalog either way.
 */
const pairs = [
	{ solid: "Silbernitrat", stock: "Silbernitratlösung", table: "AgNO3",
		cation: "[Ag+]", anion: "[O-][N+](=O)[O-]", cations: 1, anions: 1 },
	{ solid: "Bariumchlorid", stock: "Bariumchloridlösung", table: "BaCl2",
		cation: "[Ba2+]", anion: "[Cl-]", cations: 1, anions: 2 },
	{ solid: "Calciumchlorid", stock: "Calciumchloridlösung", table: "CaCl2",
		cation: "[Ca2+]", anion: "[Cl-]", cations: 1, anions: 2 },
	{ solid: "Eisen(III)-chlorid", stock: "Eisen(III)-chloridlösung", table: "FeCl3",
		cation: "[Fe3+]", anion: "[Cl-]", cations: 1, anions: 3 },
	{ solid: "Natriumcarbonat", stock: "Natriumcarbonatlösung", table: "Na2CO3",
		cation: "[Na+]", anion: "[O-]C(=O)[O-]", cations: 2, anions: 1 },
	{ solid: "Natriumsulfat", stock: "Natriumsulfatlösung", table: "Na2SO4",
		cation: "[Na+]", anion: "[O-]S(=O)(=O)[O-]", cations: 2, anions: 1 },
	{ solid: "Zinksulfat", stock: "Zinksulfatlösung", table: "ZnSO4",
		cation: "[Zn2+]", anion: "[O-]S(=O)(=O)[O-]", cations: 1, anions: 1 },
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

test("each salt of the solubility table comes as a dry solid next to its stock", () => {
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

		// The ionic bonds have to split the dry salt into exactly the ions the
		// solubility table keys on, or the reservoir would never be registered.
		const built = loadMoleculeDefinition(dry.recipe.parts[0].molecule);
		const fragments: { ion: { smilesString: string }; count: number }[] =
			(Simulation as unknown as { saltFragments(molecule: typeof built): typeof fragments })
				.saltFragments(built);
		const found = fragments.map(({ ion, count }) => [ion.smilesString, count]);
		assert.deepEqual(found, [[cation, cations], [anion, anions]], `${solid} splits into its table ions`);
	}
});

test("a dry salt dissolves into the same solution as its stock", () => {
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
		// Hydrolysing cations reach the same pH by either route.
		near(Simulation.getpH(fromStock), Simulation.getpH(fromSolid), 1e-6);
	}
});

test("the hydrolysing solids reproduce the documented pH of their stocks", () => {
	// The cation families do the work: Fe³⁺ and Zn²⁺ acidify, carbonate is a base.
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Eisen(III)-chlorid", 0.01))), 1.644, 0.002);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Zinksulfat", 0.01))), 5.516, 0.002);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Natriumcarbonat", 0.01))), 11.655, 0.005);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Silbernitrat", 0.01))), 6.479, 0.002);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Natriumsulfat", 0.01))), 7.516, 0.002);
});

test("excess dry salt settles at the tabulated saturation and redissolves on dilution", () => {
	for (const { solid, table, cation, anion, cations, anions } of pairs) {
		const limit = saturation(table);
		const dosed = 0.1 * (limit + 2);
		const loaded = mix(dose("Wasser", 100, 1), dryDose(solid, dosed));
		const reservoir = solidMoles(loaded, table);
		assert.ok(reservoir > 0, `${solid} keeps a reservoir above saturation`);
		// The reservoir holds whole formula units, so both ions have to account
		// for the rest of the dose with their own stoichiometric factor.
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

test("the dry salts take part in the same precipitations and gas evolution as their stocks", () => {
	// Chloride proof with the dry silver salt.
	const chloride = mix(dose("Natriumchloridlösung (1 mol/L)", 100, 1), dryDose("Silbernitrat", 0.01));
	near(solidMoles(chloride, "AgCl"), 0.01, 1e-4);
	assert.ok(ionMoles(chloride, "[Ag+]") / chloride._solutionVolume < 1e-4, "silver stays precipitated");

	// Sulfate proof with the dry barium salt.
	const sulfate = mix(dose("Natriumsulfatlösung", 100, 0.05), dryDose("Bariumchlorid", 0.005));
	near(solidMoles(sulfate, "BaSO4"), 0.005, 1e-5);

	// The dry carbonate gives the same CO₂ as the same amount of the stock.
	const fromSolid = mix(dose("Salzsäure (1 mol/L)", 100, 0.3), dryDose("Natriumcarbonat", 0.02));
	const fromStock = mix(dose("Natriumcarbonatlösung", 50, 0.4), dose("Salzsäure (1 mol/L)", 50, 0.6));
	const gas = fromSolid.evolvedGas.get("CO2") ?? 0;
	assert.ok(gas > 0.005, `CO₂ amount ${gas}`);
	near(gas, fromStock.evolvedGas.get("CO2") ?? 0, 1e-5);
	near(Simulation.getpH(fromSolid), Simulation.getpH(fromStock), 1e-6);
	near(solidMoles(fromSolid, "Na2CO3"), 0);
});
