import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, solutionDisplayNames, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { prepareMixtureDose, snapshotMixture } from "../data/savedMixtures";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * Iron(II) sulfide is the one salt whose solubility product only holds when the
 * anion's protonation follows along: sulfide is almost entirely hydrogen
 * sulfide and hydrogen sulfide at its own saturation pH, so the analytical
 * amount in solution is 470 times the square root of the Ksp. The table
 * therefore carries a `saturation` far above the root, and the salt loop
 * re-solves the acid-base speciation for every trial amount instead of
 * freezing the protonation share of the current bath.
 */
const SOLID = "Eisen(II)-sulfid";
const STOCK = "Eisen(II)-sulfidlösung (gesättigt)";
const CATION = "[Fe2+]";
const ANION = "[S2-]";
/** Analytical sulfide concentration of the saturated bath, in mol/L. */
const SATURATED = 3.636e-7;

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

function dryDose(name: string, moles: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `solid recipe ${name}`);
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return prepareDose(recipe, loadMoleculeDefinition)(moles * molarMass / recipe.density);
}

/** A beaker dosed in the given order, so both orders can be compared. */
function beaker(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel;
}

function vessel(...portions: Mixture[]) {
	return beaker(...portions)._content;
}

function moles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

function solidMoles(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function concentration(solution: Mixture, smiles: string) {
	return moles(solution, smiles) / solution._solutionVolume;
}

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

test("iron(II) sulfide comes as a dry solid and a saturated stock", () => {
	const solid = entry(SOLID);
	assert.ok(solid.recipe, `${SOLID} has a recipe`);
	assert.equal(solid.recipe.phase, "solid", `${SOLID} is dosed as a solid`);
	assert.equal(solid.concentrationLimit, undefined, `${SOLID} is not a stock`);
	near(solid.recipe.density, saltSolubility.FeS.solidDensity, 1e-12);
	assert.equal(solid.recipe.density, 4.84, "density of the mineral");

	const liquid = entry(STOCK);
	assert.ok(liquid.recipe, `${STOCK} has a recipe`);
	assert.equal(liquid.recipe.phase, "liquid", `${STOCK} is a stock`);
	assert.equal(liquid.recipe.aqueousMolar, true);
	near(liquid.concentrationLimit, saltSolubility.FeS.saturation, 1e-15);
	assert.equal(solutionDisplayNames[STOCK], SOLID, "the stock carries the solid's name");

	// The saturation is far above the root of the Ksp, not below it like the
	// other sparingly soluble salts: at its own pH the sulfide is protonated to
	// hydrogen sulfide, so the dissolved analytical amount can be much larger
	// than the free sulfide the product is written in.
	const root = Math.sqrt(saltSolubility.FeS.ksp);
	assert.ok(saltSolubility.FeS.saturation > 100 * root,
		`${saltSolubility.FeS.saturation} exceeds ${root} by the protonation`);
	near(saltSolubility.FeS.saturation, 3.6e-7, 1e-15);
});

test("the formula unit splits into the two ions of the table", () => {
	const solution = vessel(dose("Wasser", 100, 1), dryDose(SOLID, 1e-3));
	const solid = solution._activeMolecules.find(molecule => molecule.solidSaltFormula === "FeS");
	assert.ok(solid, "the excess settles as iron(II) sulfide");
	// The stored spelling has to be the one the solubility table keys, because
	// the salt loops look the ions up by their SMILES.
	assert.deepEqual(solid.solidSaltIons?.map(ion => ion.smilesString), [...saltSolubility.FeS.ions]);
	assert.equal(solid.smilesString, "[S2-].[Fe2+]");

	// Both ions of the formula unit are booked, and the reservoir carries the
	// rest of the dry dose.
	near(solidMoles(solution, "FeS") + moles(solution, CATION), 1e-3);
	near(solidMoles(solution, "FeS") + moles(solution, ANION), 1e-3);
	near(moles(solution, CATION), moles(solution, ANION), 1e-15);
});

test("a dry dose settles at the solubility product of its own protonation", () => {
	const solution = vessel(dose("Wasser", 100, 1), dryDose(SOLID, 0.01));
	near(solution._solutionVolume, 0.1);
	near(solidMoles(solution, "FeS"), 0.01, 1e-7);
	near(concentration(solution, CATION), SATURATED, 1e-9);
	near(concentration(solution, ANION), SATURATED, 1e-9);

	// Sulfide is a base, so the saturated bath reads basic and stays clear.
	near(Simulation.getpH(solution), 7.651, 1e-3);
	assert.equal(solution.evolvedGas.get("H2S") ?? 0, 0, "nothing escapes at this pH");
	const state = Simulation.getSaltSaturation(solution);
	assert.equal(state?.formula, "FeS");
	near(state.fraction, 1, 1e-6);

	// The reservoir decides the amount, not the concentration: twice the solid
	// leaves the same saturated solution behind.
	const doubled = vessel(dose("Wasser", 100, 1), dryDose(SOLID, 0.02));
	near(concentration(doubled, CATION), SATURATED, 1e-9);
	near(solidMoles(doubled, "FeS"), 0.02, 1e-7);
	near(Simulation.getpH(doubled), Simulation.getpH(solution), 1e-9);

	// Dosed below its own saturation the salt dissolves without a residue. At
	// this dilution both protons come off the sulfide, so the bath is basic.
	const clear = vessel(dose("Wasser", 100, 1), dryDose(SOLID, 1e-8));
	assert.equal(solidMoles(clear, "FeS"), 0, "the small dose is gone");
	near(concentration(clear, CATION), 1e-7, 1e-15);
	assert.ok((Simulation.getSaltSaturation(clear)?.fraction ?? 1) < 0.5, "the small dose is far from saturation");
	const pH = Simulation.getpH(clear);
	assert.ok(pH > 7.2 && pH < 7.35, `the diluted sulfide reads ${pH}`);
});

test("acid dissolves the settled sulfide and releases hydrogen sulfide", () => {
	// Water first, then the acid: the settled salt is attacked and disappears.
	const jar = beaker(dose("Wasser", 100, 1), dryDose(SOLID, 0.01));
	jar.addContents({ nMix: dose("Salzsäure (1 mol/L)", 100, 1) });
	const settled = jar._content;
	assert.equal(solidMoles(settled, "FeS"), 0, "the acid dissolves the sulfide");
	near(settled._solutionVolume, 0.2);
	near(concentration(settled, CATION), 0.05, 1e-7);
	near(concentration(settled, ANION), 0.05, 1e-7);
	near(Simulation.getpH(settled), 0.398, 1e-3);
	// 0.05 mol/L sulfide is still below the Henry solubility of 0.1 mol/L.
	assert.equal(settled.evolvedGas.get("H2S") ?? 0, 0, "no gas at 0.05 mol/L");
	// The dissolved solid gives its bulk volume back to the liquid.
	assert.ok(settled.addedVolume < 1e-9, `${settled.addedVolume} is released`);

	// The same dose straight into the acid: 0.1 mol/L stays dissolved.
	const direct = vessel(dose("Salzsäure (1 mol/L)", 100, 1), dryDose(SOLID, 0.01));
	assert.equal(solidMoles(direct, "FeS"), 0, "the acid dissolves the dry dose");
	near(concentration(direct, CATION), 0.1, 1e-7);
	near(concentration(direct, ANION), 0.1, 1e-7);
	near(Simulation.getpH(direct), 0.097, 1e-3);

	// Less acid leaves no room for the sulfide: half of it escapes as gas.
	const escaping = vessel(dose("Salzsäure (1 mol/L)", 50, 1), dryDose(SOLID, 0.01));
	near(concentration(escaping, CATION), 0.2, 1e-7);
	near(concentration(escaping, ANION), 0.1, 1e-7);
	near(escaping.evolvedGas.get("H2S") ?? 0, 5e-3, 1e-6);
	near(Simulation.getpH(escaping), 0.222, 1e-3);

	// The order of the two doses does not change the bath.
	const dryFirst = vessel(dryDose(SOLID, 0.01), dose("Salzsäure (1 mol/L)", 100, 1));
	near(Simulation.getpH(dryFirst), Simulation.getpH(direct), 1e-9);
	near(concentration(dryFirst, CATION), concentration(direct, CATION), 1e-15);

	// 120 mL of acid dilute the same dose to 0.0833 mol/L.
	const diluted = vessel(dose("Salzsäure (1 mol/L)", 120, 1), dryDose(SOLID, 0.01));
	near(concentration(diluted, CATION), 1 / 12, 1e-9);
	near(Simulation.getpH(diluted), 0.079, 1e-3);
});

test("the stock, the dry salt and a supersaturated dose reach the same bath", () => {
	const dry = vessel(dose("Wasser", 100, 1), dryDose(SOLID, 0.01));
	const stock = vessel(dose(STOCK, 100, saltSolubility.FeS.saturation));
	assert.equal(solidMoles(stock, "FeS"), 0, "the stock stays clear at its limit");
	near(stock._solutionVolume, 0.1);
	// The stock's rounded limit sits a per mille below the bath the solid
	// reaches, so both read the same saturation and nearly the same pH.
	near(concentration(stock, CATION) / concentration(dry, CATION), 1, 2e-2);
	near(Simulation.getpH(stock), Simulation.getpH(dry), 1e-2);
	assert.ok((Simulation.getSaltSaturation(stock)?.fraction ?? 1) < 1, "the stock is undersaturated");

	// A dose above the limit is not supersaturated for long: the excess falls
	// out as iron(II) sulfide, so the bath ends on the same saturation.
	const supersaturated = vessel(dose(STOCK, 100, 1e-5));
	near(solidMoles(supersaturated, "FeS"), 1e-6 - SATURATED * 0.1, 2e-9);
	near(concentration(supersaturated, CATION), SATURATED, 1e-9);
	near(Simulation.getpH(supersaturated), Simulation.getpH(dry), 1e-9);
});

test("a saved iron(II) sulfide dose keeps its reservoir and its bulk", () => {
	const dosed = dryDose(SOLID, 0.01);
	const molarMass = loadMoleculeDefinition(entry(SOLID).recipe!.parts[0].molecule).getTotMolMass();
	const bulk = molarMass / 4.84 / 1000;
	// The dose volume follows from the mass and the mineral density.
	near(dosed.addedVolume / (bulk * 0.01), 1, 1e-4);

	const recipe = snapshotMixture(dosed);
	assert.ok(recipe, "the dry dose snapshots");
	near(recipe.parts[0].bulk ?? 0, bulk, 1e-12);
	assert.equal(recipe.parts[0].solid, true, "the dose is saved as a solid");

	const restore = prepareMixtureDose(recipe, loadMoleculeDefinition);
	assert.ok(restore, "the snapshot restores");
	const back = vessel(dose("Wasser", 100, 1), restore(recipe.sampleMl));
	near(concentration(back, CATION), SATURATED, 1e-8);
	near(concentration(back, ANION), SATURATED, 1e-8);
	near(solidMoles(back, "FeS"), 0.01, 1e-7);
	near(Simulation.getpH(back), 7.651, 1e-3);
	// The restore rebuilds the bulk from its molar amount, the dose from a
	// weighed mass, so the two volumes agree to the rounding of the balance.
	near(back.addedVolume / dosed.addedVolume, 1, 1e-4);

	// A snapshot without the bulk volume falls back to the tabulated density,
	// so the bath and the reservoir are the same either way.
	delete recipe.parts[0].bulk;
	const legacy = prepareMixtureDose(recipe, loadMoleculeDefinition);
	assert.ok(legacy, "the legacy snapshot restores");
	const fallback = vessel(dose("Wasser", 100, 1), legacy(recipe.sampleMl));
	near(concentration(fallback, CATION), SATURATED, 1e-8);
	near(solidMoles(fallback, "FeS"), 0.01, 1e-7);
});
