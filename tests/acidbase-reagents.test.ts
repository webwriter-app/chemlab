import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration, type MoleculeDefinition } from "../data/chemicals";
import { saltSolubility } from "../chemlib/saltSolubility";
import { structureGraphs } from "../data/structureDefinitions.generated";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { catalogStructures } from "../molecule-builder/catalog";

/**
 * The reagents whose molecular graph comes from the shared structure library:
 * four acids that carry their own acid-base data on the definition, plus slaked
 * lime with its saturated stock. The names must stay exactly as the library
 * spells them, because `catalogStructures` pairs the palette card with the
 * molecule builder by name.
 */
const acids = [
	{ name: "Salpetersäure", formula: "HNO₃", molarMass: 63.012, pKa: [-1.3], phase: "liquid", density: 1, limit: 14.4 },
	{ name: "Benzoesäure", formula: "C₇H₆O₂", molarMass: 122.123, pKa: [4.19], phase: "solid", density: 1.32 },
	{ name: "Sorbinsäure", formula: "C₆H₈O₂", molarMass: 112.128, pKa: [4.76], phase: "solid", density: 1.2 },
	{ name: "Tetradecansäure (Myristinsäure)", formula: "C₁₄H₂₈O₂", molarMass: 228.376, pKa: [4.9], phase: "solid",
		density: 0.86 },
];

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function dose(name: string, ml: number, concentration?: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `recipe ${name}`);
	return prepareDose(concentration === undefined ? recipe : withConcentration(recipe, concentration), loadMoleculeDefinition)(ml);
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

/** Everything dissolved that is not water. */
function soluteMoles(solution: Mixture) {
	return solution._activeMolecules.filter(molecule => !StructureManager.isWater(molecule))
		.reduce((sum, molecule) => sum + (solution._molProperties[molecule._id + "n"] ?? 0), 0);
}

function reservoir(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function near(actual: number, expected: number, tolerance: number) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected} (±${tolerance})`);
}

/** pH of a weak monoprotic acid from its pKa and its analytical concentration. */
function weakAcidPH(pKa: number, concentration: number) {
	return (pKa - Math.log10(concentration)) / 2;
}

test("the four acids keep the graph the molecule builder shows", () => {
	for (const { name, formula, molarMass, pKa, phase, density, limit } of acids) {
		const item = entry(name);
		assert.equal(item.formula, formula, `${name} keeps its formula`);

		// The palette graph is the library graph, not a copy that can drift.
		const graph = structureGraphs[name];
		assert.ok(graph, `${name} comes from the library`);
		assert.ok(item.preview, `${name} carries a preview`);
		assert.deepEqual(item.preview.atoms, graph.atoms, `${name} uses the library atoms`);
		assert.deepEqual(item.preview.bonds, graph.bonds, `${name} uses the library bonds`);
		assert.deepEqual(item.preview.charges, graph.charges, `${name} uses the library charges`);
		assert.ok(catalogStructures(name).length > 0, `${name} resolves in the builder`);

		// The acid-base data travels on the definition, because the hand-written
		// table in `StructureManager` keys on its own SMILES spellings.
		const molecule = loadMoleculeDefinition(item.preview);
		near(molecule.getTotMolMass(), molarMass, 0.01);
		assert.deepEqual(molecule.aqueousAcidBase?.pKa, pKa, `${name} lists its pKa`);
		assert.equal(molecule.aqueousAcidBase?.step, 0, `${name} has one step`);

		assert.ok(item.recipe, `recipe ${name}`);
		assert.equal(item.recipe.phase, phase, `${name} is dosed as a ${phase}`);
		near(item.recipe.density, density, 1e-12);
		// A solid carries no concentration limit, or the palette would wrap it
		// into a stock and no longer dose it as a weighed portion.
		if (phase === "solid") assert.equal(item.concentrationLimit, undefined, `${name} is not a stock`);
		else assert.equal(item.concentrationLimit, limit, `${name} offers its concentrated reagent`);
	}

	// Concentrated nitric acid: 65 % w/w at 1.39 g/mL holds 14.34 mol/L, and the
	// palette offers the usual 14.4 mol/L like the other concentrated acids.
	assert.ok((entry("Salpetersäure").concentrationLimit ?? 0) > 14);
});

test("slaked lime comes as the weighed solid and as the saturated stock", () => {
	const lime = entry("Calciumhydroxid");
	assert.ok(lime.recipe, "lime has a recipe");
	assert.equal(lime.formula, "Ca(OH)₂");
	assert.equal(lime.recipe.phase, "solid", "slaked lime is dosed as a solid");
	assert.equal(lime.concentrationLimit, undefined, "a limit would wrap the solid into a stock");
	near(lime.recipe.density, saltSolubility["Ca(OH)2"].solidDensity, 1e-12);
	assert.ok(catalogStructures("Calciumhydroxid").length > 0, "the builder shows slaked lime");

	// The ionic bonds have to split the solid into exactly the ions the
	// solubility table keys on, or the reservoir would never be registered.
	const built = loadMoleculeDefinition(lime.preview);
	assert.deepEqual(built._atoms.map(atom => atom.getSymbol()), ["Ca", "O", "H", "O", "H"]);
	const fragments = (Simulation as unknown as {
		saltFragments(molecule: typeof built): Array<{ ion: { smilesString: string }; count: number }> })
		.saltFragments(built).map(({ ion, count }) => [ion.smilesString, count]);
	assert.deepEqual(fragments, [["[Ca2+]", 1], ["[OH-]", 2]]);

	// The stock is the clear solution above the sediment, so it carries the
	// ideal solubility from the Ksp, rounded down to stay below it.
	const kalkwasser = entry("Kalkwasser");
	assert.ok(kalkwasser.recipe, "lime water has a recipe");
	assert.equal(kalkwasser.recipe.phase, "liquid");
	assert.equal(kalkwasser.recipe.aqueousMolar, true);
	const limit = saltSolubility["Ca(OH)2"].saturation;
	assert.ok(limit !== undefined, "the table carries a lime water concentration");
	near(kalkwasser.concentrationLimit ?? 0, limit, 1e-15);
	const ideal = Math.cbrt((saltSolubility["Ca(OH)2"].ksp ?? 0) / 4);
	near(ideal, 0.0118, 5e-4);
	assert.ok(limit < ideal, `${limit} mol/L stays below the ideal ${ideal} mol/L`);
});

test("nitric acid doses as a strong acid", () => {
	const tenth = mix(dose("Salpetersäure", 100, 0.1));
	near(tenth._solutionVolume, 0.1, 1e-12);
	near(Simulation.getpH(tenth), 1.002, 0.01);

	const hundredth = mix(dose("Salpetersäure", 100, 0.01));
	near(Simulation.getpH(hundredth), 2, 0.01);
});

test("lime water and a weighed portion of slaked lime reach the same solution", () => {
	const stock = mix(dose("Kalkwasser", 100, 0.011));
	near(stock._solutionVolume, 0.1, 1e-12);
	assert.equal(reservoir(stock, "Ca(OH)2"), 0, "lime water is clear at its own limit");
	near(moles(stock, "[Ca2+]") / stock._solutionVolume, 0.011, 1e-12);
	near(Simulation.getpH(stock), 12.267, 0.02);

	// 1.1 mmol is exactly the portion the stock carries in 100 mL.
	const weighed = mix(dose("Wasser", 100, 1), dryDose("Calciumhydroxid", 1.1e-3));
	assert.equal(reservoir(weighed, "Ca(OH)2"), 0, "1.1 mmol dissolves in 100 mL");
	near(moles(weighed, "[Ca2+]") / weighed._solutionVolume, 0.011, 1e-12);
	near(Simulation.getpH(weighed), Simulation.getpH(stock), 1e-9);
});

test("an excess of slaked lime settles at the solubility product", () => {
	const dosed = 1e-2;
	const solution = mix(dose("Wasser", 100, 1), dryDose("Calciumhydroxid", dosed));
	const sediment = reservoir(solution, "Ca(OH)2");
	assert.ok(sediment > 0, "slaked lime keeps a reservoir above its Ksp");

	// Everything dosed is either dissolved or in the reservoir.
	near(sediment + moles(solution, "[Ca2+]"), dosed, 1e-12);
	near(solution._solutionVolume, 0.1, 1e-12);

	// The dissolved calcium follows the Ksp together with the hydrolysis of
	// Ca²⁺ (pKa 12.6), so it sits above the ideal root while the free ion
	// product still matches the table.
	const dissolved = moles(solution, "[Ca2+]") / solution._solutionVolume;
	assert.ok(dissolved > 0.0118 && dissolved < 0.018, `${dissolved} mol/L dissolved`);
	const pH = Simulation.getpH(solution);
	assert.ok(pH > 12.35 && pH < 12.5, `pH ${pH} of saturated lime water`);

	// The stock limit is a selector cap, not a wall: the equilibria decide how
	// much stays dissolved.
	const loaded = mix(dose("Kalkwasser", 100, 0.02));
	assert.ok(reservoir(loaded, "Ca(OH)2") > 0, "twice the limit precipitates");
	near(Simulation.getpH(loaded), pH, 1e-9);
});

test("a solid acid dissolves completely and acidifies by its pKa", () => {
	const concentration = 5e-3;
	for (const { name, pKa } of acids.filter(acid => acid.phase === "solid")) {
		const solution = mix(dose("Wasser", 100, 1), dryDose(name, concentration * 0.1));
		near(solution._solutionVolume, 0.1, 1e-12);
		// The model has no solubility product for a molecular crystal, so the
		// whole portion dissolves and only the acid equilibrium sets the pH.
		// The dose leaves one solute, whole and undissociated as a molecule; its
		// SMILES is not a stable key, because Kekulé adds cis/trans marks from
		// generated coordinates.
		assert.equal(solution._activeMolecules.filter(molecule => !StructureManager.isWater(molecule)).length, 1,
			`${name} leaves one solute`);
		assert.equal(solution._activeMolecules.some(molecule => molecule.solidSaltFormula), false, `${name} leaves no sediment`);
		near(soluteMoles(solution), concentration * 0.1, 1e-12);
		near(Simulation.getpH(solution), weakAcidPH(pKa[0], concentration), 0.03);
	}

	// Benzoic acid at 0.5 mol/L is far above its real solubility of about
	// 0.028 mol/L and still gives the undissolved-free answer. The gap is the
	// missing solubility product of a molecular solid, not a dosing error.
	const oversaturated = mix(dose("Wasser", 100, 1), dryDose("Benzoesäure", 0.05));
	near(Simulation.getpH(oversaturated), weakAcidPH(4.19, 0.5), 0.05);
});

test("the acids neutralise lime water", () => {
	// 1.1 mmol of slaked lime carries 2.2 mmol of hydroxide; exactly that much
	// hydrochloric acid leaves a calcium chloride solution.
	const neutral = mix(dose("Kalkwasser", 100, 0.011), dose("Salzsäure (1 mol/L)", 2.2, 1));
	assert.equal(reservoir(neutral, "Ca(OH)2"), 0, "nothing precipitates");
	near(moles(neutral, "[Ca2+]"), 1.1e-3, 1e-12);
	near(Simulation.getpH(neutral), 6.948, 0.05);

	const excess = mix(dose("Kalkwasser", 100, 0.011), dose("Salzsäure (1 mol/L)", 10, 1));
	assert.equal(reservoir(excess, "Ca(OH)2"), 0);
	near(moles(excess, "[Ca2+]") / excess._solutionVolume, 0.01, 1e-12);
	near(Simulation.getpH(excess), 1.149, 0.01);

	// One millimole of benzoic acid takes one of the two millimoles of
	// hydroxide, so the solution stays basic and the calcium benzoate stays
	// dissolved.
	const benzoate = mix(dose("Kalkwasser", 100, 0.011), dryDose("Benzoesäure", 1e-3));
	assert.equal(reservoir(benzoate, "Ca(OH)2"), 0, "calcium benzoate stays dissolved");
	near(moles(benzoate, "[Ca2+]") / benzoate._solutionVolume, 0.011, 1e-12);
	near(Simulation.getpH(benzoate), 11.992, 0.05);
});

/**
 * The two spellings of calcium hydroxide. The catalog ships the ionic one
 * because the salt solver needs its two hydroxide ions. A hand-built, imported
 * or builder-derived graph carries an `acidbase` bond per hydroxide instead, and
 * that spelling never reaches the hydroxide equilibria: the acid-base split
 * keeps a divalent cation's fragments neutral, so the result is a molecular
 * solid that does not raise the pH. The catalog therefore ships the ionic graph
 * for both the weighed solid and the stock, so the two cannot disagree.
 */
test("only the ionic spelling of a hydroxide takes part in the salt equilibria", () => {
	const acidbaseLime: MoleculeDefinition = { formula: "Ca(OH)₂",
		atoms: ["calcium", "oxygen", "hydrogen", "oxygen", "hydrogen"],
		bonds: ["0-1:acidbase:1", "1-2:covalent:1", "0-3:acidbase:1", "3-4:covalent:1"] };
	const carrier = dose("Wasser", 100, 1);
	carrier.addMolecule(loadMoleculeDefinition(acidbaseLime), 1.1e-3);
	const built = mix(carrier);
	near(moles(built, "O[Ca]O"), 1.1e-3, 1e-12);
	near(Simulation.getpH(built), 7, 1e-9);
	assert.equal(moles(built, "[Ca2+]"), 0);

	const ionic = mix(dose("Kalkwasser", 100, 0.011));
	near(moles(ionic, "[Ca2+]"), 1.1e-3, 1e-12);
	assert.ok(Simulation.getpH(ionic) > 12, "the ionic graph raises the pH");
});
