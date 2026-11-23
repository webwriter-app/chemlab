import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { prepareMixtureDose, snapshotMixture } from "../data/savedMixtures";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * A hydrate is one formula unit whose crystal water sits next to the salt
 * skeleton as unbonded neutral H₂O fragments. The fragment bookkeeping then
 * hands one water to the solvent per crystal water, so the dry solid dissolves
 * into the bath of its anhydrous salt plus that water. The pentahydrate of
 * copper sulfate is the first entry; its density is its own, so the dose mass
 * and the bulk volume follow the blue crystals and not the anhydrous powder.
 */
const hydrate = "Kupfer(II)-sulfat-Pentahydrat";
const table = "CuSO4";

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

function water() {
	return mix(dose("Wasser", 100));
}

function ionMoles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? (solution._molProperties[molecule._id + "n"] ?? 0) : 0;
}

function solidMoles(solution: Mixture, formula: string) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

test("the pentahydrate carries five crystal waters and its own density", () => {
	const solid = entry(hydrate);
	assert.ok(solid.recipe, `${hydrate} has a recipe`);
	assert.equal(solid.recipe.phase, "solid", `${hydrate} is dosed as a solid`);
	assert.equal(solid.recipe.parts.length, 1);
	assert.equal(solid.formula, "CuSO₄·5 H₂O");
	// Chalcanthite packs 249.68 g/mol into 2.286 g/mL, not the 3.6 g/mL of the
	// anhydrous powder, so the dose mass and its bulk volume follow the crystal.
	near(solid.recipe.density, 2.286, 1e-12);

	const definition = solid.preview;
	assert.ok(definition, `${hydrate} has a structure`);
	assert.equal(definition.atoms.filter(atom => atom === "oxygen").length, 9, "four sulfate oxygens and five waters");
	assert.equal(definition.atoms.filter(atom => atom === "hydrogen").length, 10, "two hydrogens per water");
	// Both crystal hydrogens hang on their own oxygen: the water is a fragment
	// of its own and never bonded to the sulfate.
	assert.equal(definition.atoms.length, 1 + 5 + 15, "copper, the sulfate and five waters");
	assert.equal(definition.bonds.length, 6 + 10, "six skeleton bonds and one O–H pair per water");
});

test("the dry hydrate dissolves into its five waters and releases its bulk", () => {
	const bath = mix(water(), dryDose(hydrate, 0.01));
	assert.equal(solidMoles(bath, table), 0, "the pentahydrate dissolves at 0.01 mol");
	// 100 mL of water plus the 0.05 mol of crystal water of the dose.
	const crystalWater = 0.05 * loadMoleculeDefinition({
		formula: "H₂O", atoms: ["oxygen", "hydrogen", "hydrogen"], bonds: ["0-1:covalent:1", "0-2:covalent:1"],
	}).getTotMolMass() / 1000;
	near(bath._solutionVolume, 0.1 + crystalWater, 1e-12);
	// The ions sit in that larger volume, so a 0.1-molar dose reads marginally
	// below 0.1 mol/L instead of exactly on the mark.
	const expected = 0.01 / (0.1 + crystalWater);
	near(ionMoles(bath, "[Cu2+]") / bath._solutionVolume, expected, 1e-12);
	near(ionMoles(bath, "[O-]S(=O)(=O)[O-]") / bath._solutionVolume, expected, 1e-12);
	// The dosed bulk of the crystals is gone once they are dissolved.
	near(bath.addedVolume, 0, 1e-12);
	// The bath is the same as an equimolar stock at that concentration.
	const stock = mix(dose("Kupfer(II)-sulfatlösung", 100.9, expected));
	near(ionMoles(stock, "[Cu2+]") / stock._solutionVolume, expected, 1e-6);
	near(Simulation.getpH(bath), Simulation.getpH(stock), 1e-3);
	assert.ok((Simulation.getSaltSaturation(bath)?.fraction ?? 0) < 1, "the hydrate stays unsaturated");
});

test("an overdosed hydrate keeps an anhydrous reservoir and returns its crystal water", () => {
	const bath = mix(water(), dryDose(hydrate, 0.2));
	const reservoir = solidMoles(bath, table);
	assert.ok(reservoir > 0, "0.2 mol in 100 mL settle as a reservoir");
	// The reservoir is the anhydrous salt of the solubility table, so only its
	// saturation is dissolved.
	const limit = saltSolubility[table].saturation;
	assert.ok(limit !== undefined);
	near(ionMoles(bath, "[Cu2+]") / bath._solutionVolume, limit, 0.02);
	// A trace settles as Cu(OH)₂, because the saturated copper bath sits just
	// above its own hydroxide product; everything else stays dissolved or in
	// the sulfate reservoir.
	const hydroxide = solidMoles(bath, "Cu(OH)2");
	near(ionMoles(bath, "[Cu2+]") + reservoir + hydroxide, 0.2, 1e-9);
	// The settled volume follows the anhydrous salt of the table, 159.61 g/mol
	// at 3.6 g/mL, and not the 109.22 mL/mol the blue crystals occupied.
	near(bath.addedVolume / (reservoir + hydroxide), 0.15961 / 3.6, 5e-4);
	// The five waters per formula unit stayed in the solvent even though the
	// salt itself settled back in.
	const total = 0.2 * 5 * loadMoleculeDefinition({
		formula: "H₂O", atoms: ["oxygen", "hydrogen", "hydrogen"], bonds: ["0-1:covalent:1", "0-2:covalent:1"],
	}).getTotMolMass() / 1000;
	near(bath._solutionVolume, 0.1 + total, 1e-12);
});

test("a saved hydrate keeps the bulk volume of its crystals", () => {
	const dosed = dryDose(hydrate, 0.01);
	const definition = entry(hydrate).preview;
	assert.ok(definition);
	const bulk = loadMoleculeDefinition(definition).getTotMolMass() / 2.286 / 1000;
	const recipe = snapshotMixture(dosed);
	assert.ok(recipe, "the dry dose can be saved");
	assert.equal(recipe.parts.length, 1);
	near(recipe.parts[0].bulk ?? 0, bulk, 1e-12);
	const restored = prepareMixtureDose(recipe, loadMoleculeDefinition);
	assert.ok(restored, "the saved dose loads again");
	const [molecule] = restored(1)._activeMolecules;
	near(molecule.solidBulkLitresPerMol ?? 0, bulk, 1e-12);
	// A recipe without the field still loads: it falls back to the tabulated
	// bulk of the anhydrous salt.
	delete recipe.parts[0].bulk;
	const legacy = prepareMixtureDose(recipe, loadMoleculeDefinition);
	assert.ok(legacy);
	assert.equal(legacy(1)._activeMolecules[0].solidBulkLitresPerMol, undefined);
});
