import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { chemicalCatalog, type MoleculeDefinition } from "../data/chemicals";
import { evolvedGases } from "../chemlib/gasEvolution";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

/**
 * The library graphs of the catalog are dosed as reagents. A row carries the
 * graph as its portion, so the palette offers it like any other substance, and
 * the documented model decides what happens to it: a spectator molecule stays
 * neutral, an ampholyte runs through its `acidbase` family, a fatty acid
 * dissociates, a weighed plastic stays a body.
 */
const rows = [
	["Methanal (Formaldehyd)", "gas"],
	["Bromwasser", "liquid"],
	["Phenolphthalein", "solid"],
	["Bromthymolblau", "solid"],
	["Methylorange", "solid"],
	["Indigo", "solid"],
	["Glycin", "solid"],
	["Fructose", "solid"],
	["Saccharose", "solid"],
	["Stärke", "solid"],
	["Cellulose", "solid"],
	["Stearinsäure", "solid"],
	["Ölsäure", "liquid"],
	["Natriumstearat", "solid"],
	["Natriumdodecylsulfat", "solid"],
	["Polyethylen (PE)", "solid"],
	["Polypropylen (PP)", "solid"],
	["Polystyrol (PS)", "solid"],
	["Polyvinylchlorid (PVC)", "solid"],
	["Polyethylenterephthalat (PET)", "solid"],
	["Polymilchsäure (PLA)", "solid"],
	["Polyamid 6", "solid"],
	["Styrol", "liquid"],
	["Methylmethacrylat", "liquid"],
] as const;

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function dose(name: string, ml: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `recipe ${name}`);
	const portion = prepareDose(recipe, loadMoleculeDefinition)(ml);
	assert.ok(portion, `portion ${name}`);
	return portion;
}

/** A weighed portion, given as the amount of substance, the way the palette reads it back. */
function dryDose(name: string, moles: number) {
	const recipe = entry(name).recipe;
	assert.ok(recipe, `solid recipe ${name}`);
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return dose(name, moles * molarMass / recipe.density);
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

/**
 * Amount of the dosed organic substance in mol. The loader's canonical SMILES
 * is not a stable key across processes (Kekule tie-breaks a stereogenic double
 * bond differently), so the test names the portion by the largest graph that is
 * not the solvent instead.
 */
function organicMoles(solution: Mixture) {
	const molecule = solution._activeMolecules
		.filter(item => !StructureManager.isWater(item))
		.sort((left, right) => right._atoms.length - left._atoms.length)[0];
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

function near(actual: number, expected: number, tolerance: number) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected} (±${tolerance})`);
}

test("every library reagent is a portion with a graph the palette can show", () => {
	for (const [name, phase] of rows) {
		const item = entry(name);
		assert.ok(item.recipe, `${name} has a recipe`);
		assert.equal(item.recipe.phase, phase, `${name} is dosed as a ${phase}`);
		assert.ok(item.preview, `${name} has a preview structure`);
		const molecule = loadMoleculeDefinition(item.preview as MoleculeDefinition);
		assert.ok(molecule._atoms.length > 0, `${name} carries atoms`);
		// None of these rows is an ion pair: they are molecular or ionic single
		// graphs, and only a salt goes through the solubility table.
		assert.equal(StructureManager.isSalt(molecule), false, `${name} is no salt`);
		assert.ok(item.recipe.density > 0 || item.recipe.aqueousMolar, `${name} has a portion measure`);
		assert.ok(item.category, `${name} sits in a substance class`);
	}
});

test("bromine water is a saturated stock of dissolved bromine", () => {
	const recipe = entry("Bromwasser").recipe;
	assert.ok(recipe && recipe.aqueousMolar, "bromine water is read as a stock solution");
	const solution = mix(dose("Wasser", 100), dose("Bromwasser", 1));
	near(organicMoles(solution), 0.001, 1e-6);
	// Dissolved bromine is a spectator: the halogen/halide pair belongs to the
	// electrodes, not to the acid-base model.
	near(Simulation.getpH(solution), 7, 0.05);
	near(solution._solutionVolume, 0.101, 5e-4);
	const limit = entry("Bromwasser").concentrationLimit;
	assert.equal(limit, evolvedGases.Br2.solubility, "the stock cannot exceed its own solubility");
});

test("formaldehyde arrives as a gas volume and stays dissolved", () => {
	const solution = mix(dose("Wasser", 100), dose("Methanal (Formaldehyd)", 100));
	// 100 ml at the molar gas volume, booked as the dissolved aldehyde.
	near(organicMoles(solution), 100 / 1000 / 24.465, 1e-4);
	near(solution._solutionVolume, 0.1, 1e-4);
	assert.equal(solution.solidSediment.mass, 0);
	near(Simulation.getpH(solution), 7, 0.05);
});

test("glycine is an ampholyte that buffers on both sides of its isoelectric point", () => {
	const water = mix(dose("Wasser", 100), dryDose("Glycin", 0.001));
	near(Simulation.getpH(water), 6.041, 0.02);
	// The same half equivalent of acid and of base without the ampholyte: the
	// amino acid takes the protons and the hydroxide into its own two groups,
	// so both flasks end closer to the middle than the plain reagent does.
	const acid = mix(dose("Wasser", 100), dose("Salzsäure (1 mol/L)", 0.5), dryDose("Glycin", 0.001));
	Simulation.sSolvation(acid);
	const plainAcid = mix(dose("Wasser", 100), dose("Salzsäure (1 mol/L)", 0.5));
	Simulation.sSolvation(plainAcid);
	assert.ok(Simulation.getpH(acid) > Simulation.getpH(plainAcid),
		`the carboxyl group buffers: ${Simulation.getpH(acid)} vs ${Simulation.getpH(plainAcid)}`);
	const base = mix(dose("Wasser", 100), dose("Natronlauge (1 mol/L)", 0.5), dryDose("Glycin", 0.001));
	Simulation.sSolvation(base);
	const plainBase = mix(dose("Wasser", 100), dose("Natronlauge (1 mol/L)", 0.5));
	Simulation.sSolvation(plainBase);
	assert.ok(Simulation.getpH(base) < Simulation.getpH(plainBase),
		`the ammonium group buffers: ${Simulation.getpH(base)} vs ${Simulation.getpH(plainBase)}`);
	// Only the ampholyte reaches the middle of the two: a plain salt would not.
	assert.ok(Simulation.getpH(water) > Simulation.getpH(acid) && Simulation.getpH(water) < Simulation.getpH(base));
});

test("the two fatty acids dissociate and the soaps stay neutral spectators", () => {
	const stearic = mix(dose("Wasser", 100), dryDose("Stearinsäure", 0.001));
	near(Simulation.getpH(stearic), 3.458, 0.02);
	const oleic = mix(dose("Wasser", 100), dose("Ölsäure", 1));
	// One millilitre weighs 0.895 g, so the portion is 3.17 mmol in 100 ml.
	near(organicMoles(oleic), 0.00317, 1e-4);
	near(Simulation.getpH(oleic), 3.263, 0.02);
	// The sodium salts carry their internal ±1 charge, so the charge balance
	// books them as spectators and the vessel stays neutral.
	for (const name of ["Natriumstearat", "Natriumdodecylsulfat", "Methylorange"]) {
		const solution = mix(dose("Wasser", 100), dryDose(name, 0.001));
		near(Simulation.getpH(solution), 7, 0.05);
		assert.ok(solution.solidSediment.mass > 0, `${name} is a weighed portion`);
	}
});

test("sugars and dyes are heavy portions that leave the water neutral", () => {
	for (const name of ["Fructose", "Saccharose", "Stärke", "Cellulose", "Phenolphthalein",
		"Bromthymolblau", "Indigo"]) {
		const solution = mix(dose("Wasser", 100), dryDose(name, 0.001));
		near(Simulation.getpH(solution), 7, 0.05);
		near(solution._solutionVolume, 0.1, 1e-4);
		near(solution.solidSediment.mass, dryDose(name, 0.001).solidSediment.mass, 1e-9);
	}
	// The library holds one and the same disaccharide cut for both starch and
	// cellulose, which is why the two rows share their graph.
	const starch = loadMoleculeDefinition(entry("Stärke").preview as MoleculeDefinition);
	const cellulose = loadMoleculeDefinition(entry("Cellulose").preview as MoleculeDefinition);
	assert.equal(starch._atoms.length, cellulose._atoms.length);
	assert.equal(starch._bonds.length, cellulose._bonds.length);
	assert.equal(starch.getTotMolMass(), cellulose.getTotMolMass());
});

test("a weighed plastic stays a body instead of spreading into a liquid layer", () => {
	for (const name of ["Polyethylen (PE)", "Polypropylen (PP)", "Polystyrol (PS)",
		"Polyvinylchlorid (PVC)", "Polyethylenterephthalat (PET)", "Polymilchsäure (PLA)", "Polyamid 6"]) {
		const portion = dryDose(name, 0.001);
		const solution = mix(dose("Wasser", 100), portion);
		near(solution.solidSediment.mass, portion.solidSediment.mass, 1e-9);
		assert.ok(solution.solidSediment.mass > 0.05, `${name} is visible as sediment`);
		// A hydrocarbon graph would read as a water-immiscible liquid; the
		// weighed portion must not, because nothing of it dissolves or melts.
		assert.deepEqual(solution.liquidPhases, [], `${name} forms no second liquid phase`);
		near(Simulation.getpH(solution), 7, 0.05);
	}
});

test("styrene is an immiscible liquid that floats on the water", () => {
	const solution = mix(dose("Wasser", 100), dose("Styrol", 1));
	const phases = solution.liquidPhases;
	assert.equal(phases.length, 2, "styrene separates from water");
	assert.equal(phases[0].nonpolar, true, "the organic phase is listed first, lightest on top");
	assert.ok(phases[0].density < phases[1].density);
	near(phases[0].volume, 0.001, 5e-5);
	near(organicMoles(solution), 0.001 * 0.909 / 0.10415, 5e-5);
	// Methyl methacrylate carries the ester oxygen, so the model keeps it
	// miscible; the row says so instead of hiding the gap.
	assert.deepEqual(mix(dose("Wasser", 100), dose("Methylmethacrylat", 1)).liquidPhases, []);
});
