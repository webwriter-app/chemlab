import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { chemicalCatalog, type MoleculeDefinition } from "../data/chemicals";
import { saltSolubility } from "../chemlib/saltSolubility";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { OXIDES, oxideOf } from "../chemlib/oxides";

/**
 * The six oxides are molecular solids: not salts, because the solubility table
 * knows no ion pair for them, and not acid-base partners, because the graph
 * carries no `acidbase` bond. `chemlib/oxides.ts` identifies one from the atoms
 * of a dosed graph and decides what an acid may do with it.
 */
const oxides = ["Kupfer(II)-oxid", "Magnesiumoxid", "Calciumoxid", "Eisen(III)-oxid",
	"Mangan(IV)-oxid", "Siliciumdioxid"];

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

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

/** A weighed portion, given as the amount of substance, the way the palette reads it back. */
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

/** Every dosed solid the oxide table recognises, with its amount and its table row. */
function remaining(solution: Mixture) {
	return solution._activeMolecules
		.map(molecule => ({ molecule, oxide: oxideOf(molecule), amount: solution._molProperties[molecule._id + "n"] }))
		.filter(({ oxide, amount }) => oxide && amount > 1e-12);
}

function reservoir(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function near(actual: number, expected: number, tolerance: number) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected} (±${tolerance})`);
}

test("the catalog's oxides are weighed solids the table recognises from their atoms", () => {
	const catalog = chemicalCatalog.filter(item => item.category === "Oxide");
	assert.deepEqual(catalog.map(item => item.name).sort(), [...oxides].sort());
	const symbols = new Set<string>();
	for (const name of oxides) {
		const item = entry(name);
		assert.ok(item.recipe, `${name} has a recipe`);
		assert.equal(item.recipe.phase, "solid", `${name} is dosed as a solid`);
		const molecule = loadMoleculeDefinition(item.preview as MoleculeDefinition);
		const oxide = oxideOf(molecule);
		assert.ok(oxide, `${name} resolves through the oxide table`);
		assert.equal(StructureManager.isSalt(molecule), false, `${name} is no salt`);
		// A row either reacts or states why it does not; a silent gap would read
		// as a missing recipe in the coverage report.
		assert.ok(!!oxide.attack !== !!oxide.note, `${name} reacts or explains`);
		symbols.add(molecule._atoms.find(atom => atom.getSymbol() !== "O")?.getSymbol() ?? "");
	}
	assert.deepEqual([...symbols].sort(), ["Ca", "Cu", "Fe", "Mg", "Mn", "Si"]);
});

test("a cupric oxide dose needs two protons and leaves its cation behind", () => {
	// 3 mmol HCl against 1 mmol CuO: the oxide takes two equivalents, the rest
	// stays free, so the pH has to fall on exactly the leftover amount. The
	// water alone leaves the portion alone, which is why it arrives last.
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	vessel.addContents({ nMix: dose("Wasser", 100) });
	vessel.addContents({ nMix: dryDose("Kupfer(II)-oxid", 0.001) });
	const solution = vessel._content;
	assert.equal(remaining(solution).length, 1, "the oxide lies in the vessel until acid reaches it");
	assert.ok(solution.solidSediment.mass > 0.07, "a weighed oxide is visible as sediment");
	assert.equal(moles(solution, "[Cu2+]"), 0);
	vessel.addContents({ nMix: dose("Salzsäure (1 mol/L)", 3) });
	Simulation.sSolvation(solution);
	assert.deepEqual(remaining(solution), [], "the acid takes the whole portion");
	near(moles(solution, "[Cu2+]"), 0.001, 1e-5);
	near(Simulation.getpH(solution), 2.013, 0.05);
	assert.equal(solution.solidSediment.mass, 0, "nothing settles once the oxide is gone");
});

test("magnesium oxide consumes exactly its two equivalents", () => {
	const solution = mix(dose("Wasser", 100), dose("Salzsäure (1 mol/L)", 2), dryDose("Magnesiumoxid", 0.001));
	Simulation.sSolvation(solution);
	assert.deepEqual(remaining(solution), []);
	near(moles(solution, "[Mg2+]"), 0.001, 1e-5);
	// The acid is used up, and magnesium does not hydrolyse: the vessel returns
	// to neutral instead of holding the excess the copper case keeps.
	assert.ok(Simulation.getpH(solution) > 6.5 && Simulation.getpH(solution) < 7.5,
		`pH ${Simulation.getpH(solution)}`);
});

test("ferric oxide needs six protons per formula unit", () => {
	const solution = mix(dose("Wasser", 100), dose("Salzsäure (1 mol/L)", 6), dryDose("Eisen(III)-oxid", 0.0005));
	Simulation.sSolvation(solution);
	assert.deepEqual(remaining(solution), []);
	// Half a millimole of Fe₂O₃ carries two cations each, and the leftover acid
	// holds all of them in solution.
	near(moles(solution, "[Fe3+]"), 0.001, 1e-5);
	assert.equal(reservoir(solution, "Fe(OH)3"), 0, "no hydroxide settles beside the acid");
	const pH = Simulation.getpH(solution);
	assert.ok(pH > 1.4 && pH < 1.7, `pH ${pH}`);
});

test("quicklime slakes and its hydroxide stays sparingly soluble", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Calciumoxid", 0.002));
	Simulation.sSolvation(solution);
	assert.deepEqual(remaining(solution), [], "the water alone turns the oxide into slaked lime");
	assert.ok(saltSolubility["Ca(OH)2"], "the hydroxide is a body of the solubility table");
	// The solubility product sets the dissolved part, the mass balance the
	// rest, and the two hydroxides per cation set the pH. Above pH 12 the
	// stored calcium is mostly the Ca(OH)⁺ of its own hydrolysis family, which
	// is why the free share times the squared hydroxide is the product while
	// the weighed-in amount still leaves a body behind.
	const dissolved = moles(solution, "[Ca2+]");
	near(dissolved, 0.001617, 2e-5);
	near(reservoir(solution, "Ca(OH)2"), 0.002 - dissolved, 2e-5);
	const result = Simulation.getPolyproticEquilibrium(solution);
	const free = result.species.find(species => species.formula === "Ca²⁺");
	assert.ok(free, "the free cation of the family");
	const hydroxide = result.species.find(species => species.formula === "OH⁻");
	assert.ok(hydroxide);
	near(free.concentration * hydroxide.concentration ** 2, saltSolubility["Ca(OH)2"].ksp, 1e-8);
	near(result.pH, 12.414, 0.02);
});

test("the order of acid and quicklime does not change what the beaker holds", () => {
	// Both ways round end in the same place, and so does the hydroxide itself:
	// quicklime that an acid can take in full is attacked directly, and that
	// reaction is the net one of slaking followed by neutralisation. Slaking
	// first left the freshly made hydroxide for the hydroxide equilibria in an
	// acid bath, which read pH 8.5 instead of 6.9.
	for (const [name, first] of [["Calciumoxid", true], ["Calciumoxid", false],
		["Calciumhydroxid", false]] as const) {
		const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
		vessel.addContents({ nMix: dose("Wasser", 100) });
		if (first) vessel.addContents({ nMix: dryDose(name, 0.0011) });
		vessel.addContents({ nMix: dose("Salzsäure (1 mol/L)", 2.2) });
		if (!first) vessel.addContents({ nMix: dryDose(name, 0.0011) });
		Simulation.sSolvation(vessel._content);
		const solution = vessel._content;
		const label = `${name} ${first ? "before" : "after"} the acid`;
		near(moles(solution, "[Ca2+]"), 0.0011, 1e-5);
		assert.equal(reservoir(solution, "Ca(OH)2"), 0, `${label} leaves no hydroxide body`);
		assert.deepEqual(remaining(solution), [], label);
		near(Simulation.getpH(solution), 6.948, 0.02);
	}
});

test("manganese dioxide and silica stay inert and say why", () => {
	for (const [name, symbol] of [["Mangan(IV)-oxid", "Mn"], ["Siliciumdioxid", "Si"]] as const) {
		const solution = mix(dose("Wasser", 100), dose("Salzsäure (1 mol/L)", 3), dryDose(name, 0.001));
		Simulation.sSolvation(solution);
		const left = remaining(solution);
		assert.equal(left.length, 1, `${name} survives the acid`);
		near(left[0].amount, 0.001, 1e-6);
		assert.equal(left[0].oxide?.note?.length ? true : false, true, `${name} carries a note`);
		assert.deepEqual(Object.keys(OXIDES).filter(key => OXIDES[key].note), ["Mn", "Si"]);
		// The note names the missing coupling, so no cation is booked either.
		const cation = symbol === "Mn" ? "[Mn2+]" : "[Si4+]";
		assert.equal(moles(solution, cation), 0);
	}
});

test("neutral water leaves an oxide alone", () => {
	const solution = mix(dose("Wasser", 100), dryDose("Kupfer(II)-oxid", 0.001));
	Simulation.sSolvation(solution);
	const left = remaining(solution);
	assert.equal(left.length, 1);
	near(left[0].amount, 0.001, 1e-6);
	assert.equal(moles(solution, "[Cu2+]"), 0);
	near(Simulation.getpH(solution), 7, 0.05);
});
