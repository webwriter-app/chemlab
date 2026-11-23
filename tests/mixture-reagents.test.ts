import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, MOLAR_GAS_VOLUME, Simulation, StructureManager,
	type Mixture, type Molecule } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";
import { catalogAqueousStructure, catalogStructures } from "../molecule-builder/catalog";

/**
 * The mixtures of the library were reference-only entries: a name, a formula
 * and no portion. Each one now doses the substances it is made of, so the
 * documented model decides what the vessel shows — a hydrocarbon band, a
 * saturated iodine stock, an alkaline copper solution, a bottle of air. The
 * cases where the model stops short (no copper tartrate complex, no triiodide,
 * no calcite kinetics) are the documented gaps, not silent exemptions.
 */
const mixtures = ["Petrolether", "Lugolsche Lösung", "Fehling I", "Fehling II", "Benedict-Reagenz",
	"Tollens-Reagenz", "Universalindikator", "Sand", "Leitungswasser", "Mineralwasser",
	"Haushaltsessig", "Zitronensaft", "Luft"] as const;

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	assert.ok(item.recipe, `recipe ${name}`);
	return item as typeof item & { recipe: NonNullable<typeof item.recipe> };
}

/** The stock the palette offers: the recipe at the row's own concentration limit. */
function stock(name: string) {
	const recipe = entry(name).recipe;
	const limit = entry(name).concentrationLimit;
	return limit != null && recipe.aqueousMolar ? withConcentration(recipe, limit) : recipe;
}

function dose(name: string, ml: number) {
	const portion = prepareDose(stock(name), loadMoleculeDefinition)(ml);
	assert.ok(portion, `portion ${name}`);
	return portion;
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

const water = () => dose("Wasser", 100);

function solutes(solution: Mixture) {
	return solution._activeMolecules.filter(molecule => !StructureManager.isWater(molecule));
}

function molesOf(solution: Mixture, molecule: Molecule) {
	return solution._molProperties[molecule._id + "n"] ?? 0;
}

function molar(solution: Mixture, molecule: Molecule) {
	return molesOf(solution, molecule) / solution._solutionVolume;
}

/** Total amount of an element in the bath, whatever it is bound to. */
function elementMoles(solution: Mixture, symbol: string) {
	return solutes(solution).reduce((sum, molecule) => sum
		+ molecule._atoms.filter(atom => atom.getSymbol() === symbol).length * molesOf(solution, molecule), 0);
}

/** The free ion of one element and charge, as the bath keeps it. */
function ion(solution: Mixture, symbol: string, charge: number) {
	return solutes(solution).find(molecule => molecule._atoms.length === 1
		&& molecule._atoms[0].getSymbol() === symbol && molecule._atoms[0].getIonicCharge() === charge);
}

function near(actual: number, expected: number, tolerance: number, label = "") {
	assert.ok(Math.abs(actual - expected) <= tolerance,
		`${label} expected ${expected} ± ${tolerance}, read ${actual}`);
}

test("every mixture row doses and balances its formula unit", () => {
	for (const name of mixtures) {
		const { recipe, formula } = entry(name);
		assert.ok(recipe.parts.length + (recipe.gases?.length ?? 0) > 0, name);
		const charge = recipe.parts.reduce((sum, { molecule, amount }) => sum
			+ amount * (molecule.charges ?? []).reduce((total, value) => total + value, 0), 0);
		// A formula unit is neutral, also when it names a single dissolved ion
		// such as the Cu²⁺ of Fehling I: the stock carries its counter-ion.
		near(charge, 0, 1e-9, `${name} [${formula}] charge`);
	}
});

test("the builder resolves each mixture to its constituents", () => {
	for (const name of mixtures) {
		assert.ok(catalogStructures(name).length > 0, name);
		if (!entry(name).recipe.aqueousMolar) continue;
		// A stock without a net charge — the universal indicator and the two
		// halogens — has no ion pair to draw and is skipped by the overview.
		if (!catalogAqueousStructure(name)) {
			assert.ok(["Universalindikator"].includes(name), name);
		}
	}
});

test("petroleum ether floats as its own band", () => {
	const solution = mix(water(), dose("Petrolether", 10));
	Simulation.sSolvation(solution);
	near(Simulation.getpH(solution), 7, 1e-6);
	const phases = solution.liquidPhases;
	assert.equal(phases.length, 2);
	// Lightest first: the hydrocarbon sits on the water.
	assert.equal(phases[0].nonpolar, true);
	assert.equal(phases[1].nonpolar, false);
	near(phases[0].volume * 1000, 10, 1e-6, "organic band");
	near(phases[0].density, 0.66, 1e-6, "band density");
	near(phases[1].volume * 1000, 100, 1e-6, "aqueous band");
	assert.equal(solution.solidSediment.mass, 0);
});

test("paraffin oil is the alkane cut as one band", () => {
	// The library calls the oil a mixture without a graph of its own; the dose
	// takes the middle of the C₁₀–C₁₆ cut, which keeps the band a hydrocarbon
	// band and the vessel neutral.
	const solution = mix(water(), dose("Paraffinöl", 10));
	Simulation.sSolvation(solution);
	const band = solution.liquidPhases[0];
	assert.equal(band.nonpolar, true);
	near(band.volume * 1000, 10, 1e-6, "band volume");
	near(band.density, 0.84, 1e-6, "band density");
	assert.equal(solutes(solution).length, 1);
	near(solutes(solution)[0].getTotMolMass(), 170.34, 0.01, "dodecane");
	assert.equal(solution.solidSediment.mass, 0);
	near(Simulation.getpH(solution), 7, 1e-6);
});

test("Lugol's solution stays clear below the iodine saturation", () => {
	const solution = mix(water(), dose("Lugolsche Lösung", 10));
	Simulation.sSolvation(solution);
	assert.equal(solution.solidSediment.mass, 0, "no iodine settles");
	const iodine = solutes(solution).find(molecule => molecule._atoms.length === 2
		&& molecule._atoms.every(atom => atom.getSymbol() === "I"));
	const iodide = ion(solution, "I", -1);
	const potassium = ion(solution, "K", 1);
	assert.ok(iodine && iodide && potassium);
	// The bottle is one iodine per three iodide, and the model keeps both.
	near(molesOf(solution, iodide) / molesOf(solution, iodine), 3, 1e-9, "iodide per iodine");
	near(molesOf(solution, potassium), molesOf(solution, iodide), 1e-12, "potassium per iodide");
	// Below the tabulated solubility of iodine, because there is no triiodide.
	assert.ok(molar(solution, iodine) < 1.3e-3);
	near(Simulation.getpH(solution), 7, 1e-6);
});

test("Fehling I and II are clear until they meet", () => {
	const first = mix(water(), dose("Fehling I", 10));
	Simulation.sSolvation(first);
	assert.equal(first.solidSediment.mass, 0);
	near(Simulation.getpH(first), 4.819, 0.01);
	assert.ok(ion(first, "Cu", 2));
	near(elementMoles(first, "Cu"), 2.8e-3, 1e-9);

	const second = mix(water(), dose("Fehling II", 10));
	Simulation.sSolvation(second);
	assert.equal(second.solidSediment.mass, 0);
	// 0.5 mol/L Rochelle salt and 1 mol/L lye, so the portion is 0.09 M OH⁻.
	near(Simulation.getpH(second), 12.959, 0.01);

	// The documented gap: the table knows no copper tartrate complex, so the
	// bath drops copper(II) hydroxide as soon as the two meet.
	const mixed = mix(water(), dose("Fehling I", 10), dose("Fehling II", 10));
	Simulation.sSolvation(mixed);
	assert.ok(mixed.solidSediment.mass > 0.1, "copper hydroxide settles");
	assert.ok(Simulation.getpH(mixed) < Simulation.getpH(second), "the hydrolysis acidifies");
});

test("Benedict's reagent drops its copper and keeps its carbon dioxide", () => {
	const solution = mix(water(), dose("Benedict-Reagenz", 10));
	Simulation.sSolvation(solution);
	// The same gap as Fehling's pair: no copper citrate complex.
	assert.ok(solution.solidSediment.mass > 0.01);
	assert.ok(elementMoles(solution, "Cu") - (ion(solution, "Cu", 2) ? molesOf(solution, ion(solution, "Cu", 2)!) : 0) > 4e-4);
	near(Simulation.getpH(solution), 5.935, 0.01);
	// A tenth of a millimole of carbonate stays dissolved at this strength.
	assert.equal(solution.evolvedGasMol, 0);
});

test("Tollens' reagent keeps its silver dissolved", () => {
	const solution = mix(water(), dose("Tollens-Reagenz", 10));
	Simulation.sSolvation(solution);
	assert.equal(solution.solidSediment.mass, 0, "no silver oxide settles");
	near(elementMoles(solution, "Ag"), 5e-4, 1e-12);
	// One silver per three ammonia and two lye: the complex table holds the
	// silver far below the oxide product.
	near(Simulation.getpH(solution), 11.958, 0.01);
});

test("the universal indicator is three neutral dyes", () => {
	const solution = mix(water(), dose("Universalindikator", 10));
	Simulation.sSolvation(solution);
	const dyes = solutes(solution);
	assert.equal(dyes.length, 3);
	for (const dye of dyes) near(molesOf(solution, dye), 5e-6, 1e-12, "one third each");
	assert.equal(solution.solidSediment.mass, 0);
	near(Simulation.getpH(solution), 7, 1e-6);
});

test("sand is a body, not a solution", () => {
	const solution = mix(water(), dose("Sand", 10));
	Simulation.sSolvation(solution);
	// 10 mL of quartz at 2.65 g/mL; the model has no solubility product for a
	// molecular solid, so the whole portion counts as the settled body.
	near(solution.solidSediment.mass, 26.5, 0.01, "sand mass");
	assert.equal(solution.liquidPhases.length, 0, "a weighed solid forms no band");
	near(Simulation.getpH(solution), 7, 1e-6);
});

test("tap water and mineral water stay below calcite", () => {
	const tap = mix(water(), dose("Leitungswasser", 10));
	Simulation.sSolvation(tap);
	assert.equal(tap.solidSediment.mass, 0);
	near(Simulation.getpH(tap), 8.016, 0.005);
	const bicarbonate = solutes(tap).find(molecule => molecule._atoms.some(atom => atom.getSymbol() === "C"));
	assert.ok(bicarbonate);
	// Phase 2 of the carbonic-acid family (pKa 10.33, StructureManager) sets the
	// carbonate that the calcite product sees.
	const carbonate = molar(tap, bicarbonate) * 10 ** (Simulation.getpH(tap) - 10.33);
	assert.ok(elementMoles(tap, "Ca") / tap._solutionVolume * carbonate
		< (saltSolubility.CaCO3.ksp ?? Infinity), "below the calcite product");

	const mineral = mix(water(), dose("Mineralwasser", 10));
	Simulation.sSolvation(mineral);
	assert.equal(mineral.solidSediment.mass, 0);
	near(Simulation.getpH(mineral), 6.777, 0.005);
	// The bottle's carbon dioxide is the acid family, so nothing escapes at
	// 0.6 mmol/L — the saturation of CO₂ is 34 mmol/L.
	assert.equal(mineral.evolvedGasMol, 0);
	const carbonicAcid = solutes(mineral).find(molecule => molecule._atoms.filter(atom => atom.getSymbol() === "C").length === 1
		&& molecule._atoms.filter(atom => atom.getSymbol() === "O").length === 3);
	assert.ok(carbonicAcid, "the dissolved carbon dioxide");
});

test("vinegar and lemon juice acidify like their acid", () => {
	const vinegar = mix(water(), dose("Haushaltsessig", 10));
	Simulation.sSolvation(vinegar);
	near(Simulation.getpH(vinegar), 2.939, 0.005);
	assert.equal(solutes(vinegar).length, 1, "acetic acid only");

	const lemon = mix(water(), dose("Zitronensaft", 10));
	Simulation.sSolvation(lemon);
	near(Simulation.getpH(lemon), 2.381, 0.005);
	assert.equal(solutes(lemon).length, 1, "citric acid only");

	// A fifth of a litre of lemon juice contains three times the acid of the
	// same volume of vinegar, and the triprotic acid reads lower.
	assert.ok(Simulation.getpH(lemon) < Simulation.getpH(vinegar));
});

test("a bottle of air hands its shares to the gas space", () => {
	const air = dose("Luft", 1000);
	const shares = [...air.offeredGas];
	assert.equal(shares.length, 4);
	const total = shares.reduce((sum, [, amount]) => sum + amount, 0);
	near(total, 1 / MOLAR_GAS_VOLUME, 1e-12, "one litre of gas");
	const byGas = new Map(shares);
	near((byGas.get("N2") ?? 0) / total, 0.7808, 1e-9, "nitrogen share");
	near((byGas.get("O2") ?? 0) / total, 0.2095, 1e-9, "oxygen share");
	near((byGas.get("Ar") ?? 0) / total, 0.0093, 1e-9, "argon share");
	near((byGas.get("CO2") ?? 0) / total, 0.0004, 1e-9, "carbon dioxide share");

	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	vessel.addContents({ nMix: water() });
	vessel.addContents({ nMix: dose("Luft", 10) });
	Simulation.sSolvation(vessel._content);
	// The vessel dissolves what its Henry rows allow and keeps the rest above
	// the liquid: nitrogen saturates at 0.64 mmol/L, oxygen and argon fit.
	near(vessel._content.dissolvedGas.get("O2") ?? 0, 8.5615e-5, 1e-8, "oxygen dissolved");
	near(vessel._content.dissolvedGas.get("Ar") ?? 0, 3.8006e-6, 1e-9, "argon dissolved");
	near(vessel._content.dissolvedGas.get("N2") ?? 0, 6.4e-5, 1e-9, "nitrogen saturated");
	near(vessel._content.evolvedGasMol, 2.551e-4, 1e-6, "nitrogen escaped");
	near(Simulation.getpH(vessel._content), 7, 1e-6);
});
