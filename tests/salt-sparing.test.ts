import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * The three sparingly soluble salts whose solubility table entry carries a
 * Ksp. Each one is dosed as a dry solid and as a saturated stock: Ksp decides
 * how much of the solid dissolves, the rounded `saturation` only caps the
 * stock's concentration selector.
 */
const pairs = [
	{ solid: "Silberchlorid", stock: "Silberchloridlösung (gesättigt)", table: "AgCl",
		cation: "[Ag+]", anion: "[Cl-]", metal: "Silber" },
	{ solid: "Bariumsulfat", stock: "Bariumsulfatlösung (gesättigt)", table: "BaSO4",
		cation: "[Ba2+]", anion: "[O-]S(=O)(=O)[O-]", metal: "Barium" },
	{ solid: "Calciumcarbonat", stock: "Calciumcarbonatlösung (gesättigt)", table: "CaCO3",
		cation: "[Ca2+]", anion: "[O-]C(=O)[O-]", metal: "Calcium" },
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

function moles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

function solidMoles(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

/** Ideal solubility of a 1:1 salt from its Ksp, in mol/L. */
function idealSolubility(table: string) {
	const ksp = saltSolubility[table].ksp;
	assert.ok(ksp !== undefined, `Ksp ${table}`);
	return Math.sqrt(ksp);
}

function saturation(table: string) {
	const limit = saltSolubility[table].saturation;
	assert.ok(limit !== undefined, `saturation ${table}`);
	return limit;
}

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

test("a sparingly soluble salt comes as a dry solid and a saturated stock", () => {
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
		// The stock has to stay undersaturated at its own limit, so the rounded
		// value never exceeds the ideal solubility of the Ksp it belongs to.
		assert.ok(saturation(table) <= idealSolubility(table), `${stock} stays below its Ksp`);
	}
});

test("a dose below the solubility product dissolves completely", () => {
	// Half a micromole in 100 mL is 5 µmol/L, below the ideal solubility of all
	// three salts, so nothing stays behind.
	for (const { solid, table, cation, anion } of pairs) {
		const solution = mix(dose("Wasser", 100, 1), dryDose(solid, 5e-7));
		assert.equal(solidMoles(solution, table), 0, `${solid} dissolves below its Ksp`);
		near(solution._solutionVolume, 0.1);
		near(moles(solution, cation) / 0.1, 5e-6, 1e-15);
		near(moles(solution, anion) / 0.1, 5e-6, 1e-15);
		assert.ok((Simulation.getSaltSaturation(solution)?.fraction ?? 0) < 1, `${solid} stays unsaturated`);
	}

	// Silver and barium chloride solutions stay neutral, carbonate is a base.
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Silberchlorid", 5e-7))), 7, 1e-3);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Bariumsulfat", 5e-7))), 7, 1e-3);
	near(Simulation.getpH(mix(dose("Wasser", 100, 1), dryDose("Calciumcarbonat", 5e-7))), 8.691, 1e-3);
});

test("undissolved excess settles at the solubility product, not at the stock's limit", () => {
	for (const { solid, table, cation, anion } of pairs) {
		const dosed = 1e-3;
		const solution = mix(dose("Wasser", 100, 1), dryDose(solid, dosed));
		const reservoir = solidMoles(solution, table);
		assert.ok(reservoir > 0, `${solid} keeps a reservoir above its Ksp`);
		near(reservoir + moles(solution, cation), dosed, 1e-9);
		near(reservoir + moles(solution, anion), dosed, 1e-9);

		const state = Simulation.getSaltSaturation(solution);
		assert.equal(state?.formula, table, `${solid} saturates on its own entry`);
		near(state.fraction, 1, 1e-6);

		// Silver and barium have no side equilibrium, so their free ions sit on
		// the root of the Ksp — above the rounded stock limit, because the
		// solubility product stays the product.
		if (table !== "CaCO3") {
			near(moles(solution, cation) / 0.1, idealSolubility(table), 1e-9);
			assert.ok(moles(solution, cation) / 0.1 > saturation(table), `${solid} dissolves past the stock limit`);
			near(moles(solution, anion) / 0.1, idealSolubility(table), 1e-9);
		}
	}

	// Carbonate is a base, so the free carbonate is only a fraction of the
	// dissolved one and more calcium stays in solution than the square root.
	const carbonate = mix(dose("Wasser", 100, 1), dryDose("Calciumcarbonat", 1e-3));
	near(moles(carbonate, "[Ca2+]") / 0.1, 1.11495e-4, 1e-8);
	near(Simulation.getpH(carbonate), 9.907, 1e-3);
});

test("the saturated stock and the dry salt reach the same solution", () => {
	for (const { solid, stock, table, cation, anion } of pairs) {
		const concentration = 1e-5;
		const fromSolid = mix(dose("Wasser", 100, 1), dryDose(solid, concentration * 0.1));
		const fromStock = dose(stock, 100, concentration);
		assert.equal(solidMoles(fromSolid, table), 0, `${solid} dissolves at ${concentration} mol/L`);
		assert.equal(solidMoles(fromStock, table), 0, `${stock} is clear at ${concentration} mol/L`);
		near(fromStock._solutionVolume, 0.1);
		near(moles(fromStock, cation), moles(fromSolid, cation), 1e-15);
		near(moles(fromStock, anion), moles(fromSolid, anion), 1e-15);
		near(Simulation.getpH(fromStock), Simulation.getpH(fromSolid), 1e-9);
	}

	// Dosed at its own limit the stock is still clear and still below its Ksp.
	for (const { stock, table } of pairs) {
		const loaded = dose(stock, 100, saturation(table));
		assert.equal(solidMoles(loaded, table), 0, `${stock} keeps no reservoir at its limit`);
		assert.ok((Simulation.getSaltSaturation(loaded)?.fraction ?? 0) < 1, `${stock} stays below its Ksp`);
	}
});

test("the sparingly soluble salts take part in the existing equilibria", () => {
	// A soluble chloride reprecipitates the silver of the saturated stock.
	const chloride = mix(dose("Silberchloridlösung (gesättigt)", 100, saturation("AgCl")),
		dose("Salzsäure (1 mol/L)", 1, 0.1));
	near(solidMoles(chloride, "AgCl"), 1.2816e-6, 1e-8);
	near(moles(chloride, "[Ag+]") / chloride._solutionVolume, 1.8177e-7, 1e-9);
	near(Simulation.getpH(chloride), 3.004, 1e-3);

	// The sulfate proof works from the barium stock as well.
	const sulfate = mix(dose("Bariumsulfatlösung (gesättigt)", 100, saturation("BaSO4")),
		dose("Natriumsulfatlösung", 1, 0.1));
	near(solidMoles(sulfate, "BaSO4"), 9.8878e-7, 1e-8);
	near(moles(sulfate, "[Ba2+]") / sulfate._solutionVolume, 1.1109e-7, 1e-9);

	// Carbonate precipitates the dry calcium carbonate completely.
	const precipitated = mix(dose("Natriumcarbonatlösung", 100, 0.05), dryDose("Calciumcarbonat", 1e-3));
	near(solidMoles(precipitated, "CaCO3"), 1e-3, 1e-8);
	near(moles(precipitated, "[Ca2+]") / precipitated._solutionVolume, 7.8364e-8, 1e-9);

	// The silver ammine complex keeps the silver chloride in solution.
	const ammine = mix(dose("Ammoniaklösung", 100, 0.5), dryDose("Silberchlorid", 1e-3));
	assert.equal(solidMoles(ammine, "AgCl"), 0, "ammonia dissolves the silver chloride");
	near(moles(ammine, "[Ag+]") / ammine._solutionVolume, 0.01, 1e-9);
	near(Simulation.getpH(ammine), 11.464, 1e-3);

	// The carbonate dissolves in excess acid and releases its carbon dioxide;
	// the sulfate stays behind in the same acid.
	const acid = mix(dose("Salzsäure (1 mol/L)", 100, 0.3), dryDose("Calciumcarbonat", 0.01));
	assert.equal(solidMoles(acid, "CaCO3"), 0, "acid dissolves the calcium carbonate");
	near(moles(acid, "[Ca2+]") / acid._solutionVolume, 0.1, 1e-9);
	near(acid.evolvedGas.get("CO2") ?? 0, 0.0066, 1e-4);
	near(Simulation.getpH(acid), 1, 1e-3);

	const sulfateAcid = mix(dose("Salzsäure (1 mol/L)", 100, 0.1), dryDose("Bariumsulfat", 1e-3));
	assert.ok(solidMoles(sulfateAcid, "BaSO4") > 9.9e-4, "barium sulfate survives the acid");
});
