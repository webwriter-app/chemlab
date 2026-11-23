import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, solutionDisplayNames, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { prepareMixtureDose, snapshotMixture } from "../data/savedMixtures";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltSolubility } from "../chemlib/saltSolubility";

/**
 * A hydrate is one formula unit whose crystal water sits next to the salt
 * skeleton as unbonded neutral H₂O fragments. The fragment bookkeeping then
 * hands one water to the solvent per crystal water, so the dry solid dissolves
 * into the bath of its anhydrous salt plus that water. Each crystal carries the
 * density of its own mineral, so the dose mass and the bulk volume follow the
 * crystals and not the anhydrous powder.
 */
interface Hydrate {
	name: string;
	formula: string;
	/** density of the mineral in g/mL */
	density: number;
	waters: number;
	/** the stock that carries the same analytical salt */
	stock: string;
	/** short label the palette shows for that stock */
	stockLabel: string;
	/** key of the anhydrous salt in the solubility table */
	table: string;
}

const hydrates: Hydrate[] = [
	// Chalcanthite, melanterite, gypsum and epsomite.
	// https://www.mindat.org/min-19816.html https://www.mindat.org/min-16198.html
	// https://www.mindat.org/min-1784.html https://www.mindat.org/min-1393.html
	{ name: "Kupfer(II)-sulfat-Pentahydrat", formula: "CuSO₄·5 H₂O", density: 2.286, waters: 5,
		stock: "Kupfer(II)-sulfatlösung", stockLabel: "Kupfer(II)-sulfat", table: "CuSO4" },
	{ name: "Eisen(II)-sulfat-Heptahydrat", formula: "FeSO₄·7 H₂O", density: 1.895, waters: 7,
		stock: "Eisen(II)-sulfatlösung", stockLabel: "Eisen(II)-sulfat", table: "FeSO4" },
	{ name: "Calciumsulfat-Dihydrat", formula: "CaSO₄·2 H₂O", density: 2.32, waters: 2,
		stock: "Calciumsulfatlösung (gesättigt)", stockLabel: "Calciumsulfat", table: "CaSO4" },
	{ name: "Magnesiumsulfat-Heptahydrat", formula: "MgSO₄·7 H₂O", density: 1.68, waters: 7,
		stock: "Magnesiumsulfatlösung", stockLabel: "Magnesiumsulfat", table: "MgSO4" },
];

/** One unbonded water molecule, as the crystal-water fragments are built. */
const WATER = {
	formula: "H₂O", atoms: ["oxygen", "hydrogen", "hydrogen"],
	bonds: ["0-1:covalent:1", "0-2:covalent:1"],
};
const WATER_MOLAR_MASS = loadMoleculeDefinition(WATER).getTotMolMass();

function entry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

/** The anhydrous salt of a hydrate in the solubility table. */
function solubility(hydrate: Hydrate) {
	const row = saltSolubility[hydrate.table];
	assert.ok(row, `solubility row ${hydrate.table}`);
	return row;
}

function ions(hydrate: Hydrate) {
	const [cation, anion] = solubility(hydrate).ions;
	return { cation, anion };
}

/** Saturated amount per litre, which the stock's concentration limit also caps. */
function saturation(hydrate: Hydrate) {
	const limit = solubility(hydrate).saturation;
	assert.ok(limit !== undefined, `${hydrate.table} needs a tabulated saturation`);
	return limit;
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

test("every sulfate hydrate carries its crystal waters and the density of its mineral", () => {
	for (const hydrate of hydrates) {
		const solid = entry(hydrate.name);
		assert.ok(solid.recipe, `${hydrate.name} has a recipe`);
		assert.equal(solid.recipe.phase, "solid", `${hydrate.name} is dosed as a solid`);
		assert.equal(solid.recipe.parts.length, 1, `${hydrate.name} is dosed as one formula unit`);
		assert.equal(solid.formula, hydrate.formula);
		near(solid.recipe.density, hydrate.density, 1e-12);

		const definition = solid.preview;
		assert.ok(definition, `${hydrate.name} has a structure`);
		const count = (atom: string) => definition.atoms.filter(candidate => candidate === atom).length;
		// Metal, sulfate and one unbonded H₂O per crystal water.
		assert.equal(definition.atoms.length, 6 + 3 * hydrate.waters, `${hydrate.name} atom count`);
		assert.equal(definition.bonds.length, 6 + 2 * hydrate.waters, `${hydrate.name} bond count`);
		assert.equal(count("oxygen"), 4 + hydrate.waters, `${hydrate.name} carries its waters as oxygen`);
		assert.equal(count("hydrogen"), 2 * hydrate.waters, `${hydrate.name} carries two hydrogens per water`);

		// The crystals are lighter than the anhydrous powder, so their bulk volume
		// and their dose mass cannot come from the solubility table.
		const row = solubility(hydrate);
		assert.ok(row.solidDensity !== undefined, `${hydrate.table} has a solid density`);
		assert.ok(hydrate.density < row.solidDensity, `${hydrate.name} is lighter than its anhydrous salt`);
	}
});

test("a dry hydrate dissolves into its crystal water and gives back its bulk", () => {
	for (const hydrate of hydrates) {
		const { cation, anion } = ions(hydrate);
		// A tenth of the saturated amount in 100 mL, capped at 0.01 mol so a
		// copper bath stays below its own hydroxide product.
		const moles = Math.min(0.01, 0.2 * saturation(hydrate) * 0.1);
		const bath = mix(water(), dryDose(hydrate.name, moles));
		assert.equal(solidMoles(bath, hydrate.table), 0, `${moles} mol of ${hydrate.name} dissolve`);
		assert.deepEqual(bath._activeMolecules.filter(molecule => molecule.solidSaltFormula)
			.map(molecule => molecule.solidSaltFormula), [], `${hydrate.name} leaves no sediment`);
		// The crystal water joins the solvent, so the dose volume grows with it.
		const crystalWater = moles * hydrate.waters * WATER_MOLAR_MASS / 1000;
		near(bath._solutionVolume, 0.1 + crystalWater, 1e-12);
		// The ions sit in that larger volume, so a 0.1-molar dose reads marginally
		// below 0.1 mol/L instead of exactly on the mark.
		const expected = moles / bath._solutionVolume;
		near(ionMoles(bath, cation) / bath._solutionVolume, expected, 1e-12);
		near(ionMoles(bath, anion) / bath._solutionVolume, expected, 1e-12);
		// The dosed bulk of the crystals is gone once they are dissolved.
		near(bath.addedVolume, 0, 1e-12);
		// The bath is the same as an equimolar stock at that concentration.
		const stock = mix(dose(hydrate.stock, 100, expected));
		near(ionMoles(stock, cation) / stock._solutionVolume, expected, 1e-6);
		near(Simulation.getpH(bath), Simulation.getpH(stock), 1e-3);
		assert.ok((Simulation.getSaltSaturation(bath)?.fraction ?? 0) < 1, `${hydrate.name} stays unsaturated`);
	}
});

test("an overdosed hydrate keeps an anhydrous reservoir and returns its crystal water", () => {
	for (const hydrate of hydrates) {
		const { cation } = ions(hydrate);
		const { ksp, solidDensity } = solubility(hydrate);
		// Two and a half times what a saturated solution holds in 100 mL.
		const moles = 2.5 * saturation(hydrate) * 0.1;
		const bath = mix(water(), dryDose(hydrate.name, moles));
		const reservoir = solidMoles(bath, hydrate.table);
		assert.ok(reservoir > 0, `${moles} mol of ${hydrate.name} settle as a reservoir`);

		// The reservoir is the anhydrous salt of the solubility table, so only its
		// product is dissolved: the Ksp where one is tabulated, else the
		// tabulated saturation. Gypsum's ideal solubility sits above its stock
		// limit, which is why the limit must not be the expected value.
		const dissolved = ksp !== undefined ? Math.sqrt(ksp) : saturation(hydrate);
		const free = ionMoles(bath, cation) / bath._solutionVolume;
		near(free, dissolved, 0.005 * dissolved);

		// Everything dosed is dissolved, in the reservoir, or in a hydroxide
		// trace: only the saturated copper bath sits above its own Cu(OH)₂.
		const hydroxide = bath._activeMolecules
			.filter(molecule => molecule.solidSaltFormula && molecule.solidSaltFormula !== hydrate.table)
			.reduce((sum, molecule) => sum + bath._molProperties[molecule._id + "n"], 0);
		near(free * bath._solutionVolume + reservoir + hydroxide, moles, 1e-9);

		// The settled volume follows the anhydrous salt, not the crystals: the
		// copper hydroxide trace shifts the average by under a thousandth.
		assert.ok(solidDensity !== undefined);
		const crystal = entry(hydrate.name).preview;
		assert.ok(crystal);
		const anhydrous = loadMoleculeDefinition(crystal).getTotMolMass() -
			hydrate.waters * WATER_MOLAR_MASS;
		near(bath.addedVolume / (reservoir + hydroxide), anhydrous / solidDensity / 1000, 2e-3);

		// The crystal water stayed in the solvent even though the salt settled
		// back in.
		near(bath._solutionVolume, 0.1 + moles * hydrate.waters * WATER_MOLAR_MASS / 1000, 1e-12);
	}
});

test("a saved hydrate keeps the bulk volume of its crystals", () => {
	for (const hydrate of hydrates) {
		const definition = entry(hydrate.name).preview;
		assert.ok(definition);
		const bulk = loadMoleculeDefinition(definition).getTotMolMass() / hydrate.density / 1000;
		const recipe = snapshotMixture(dryDose(hydrate.name, 0.01));
		assert.ok(recipe, `the dry dose of ${hydrate.name} can be saved`);
		assert.equal(recipe.parts.length, 1);
		near(recipe.parts[0].bulk ?? 0, bulk, 1e-12);
		const restored = prepareMixtureDose(recipe, loadMoleculeDefinition);
		assert.ok(restored, `the saved dose of ${hydrate.name} loads again`);
		near(restored(1)._activeMolecules[0].solidBulkLitresPerMol ?? 0, bulk, 1e-12);
		// A recipe without the field still loads: it falls back to the tabulated
		// bulk of the anhydrous salt.
		delete recipe.parts[0].bulk;
		const legacy = prepareMixtureDose(recipe, loadMoleculeDefinition);
		assert.ok(legacy);
		assert.equal(legacy(1)._activeMolecules[0].solidBulkLitresPerMol, undefined);
	}
});

test("each sulfate hydrate stock is the saturated solution of its salt", () => {
	for (const hydrate of hydrates) {
		const stock = entry(hydrate.stock);
		assert.ok(stock.recipe, `${hydrate.stock} is dosable`);
		assert.equal(stock.recipe.phase, "liquid");
		assert.equal(stock.concentrationLimit, saturation(hydrate));
		assert.equal(solutionDisplayNames[hydrate.stock], hydrate.stockLabel);
		// A stock of a sparingly soluble salt stays below its own product; the
		// rounded limit is what the concentration selector offers.
		const { ksp } = solubility(hydrate);
		if (ksp !== undefined) {
			assert.ok(saturation(hydrate) <= Math.sqrt(ksp),
				`${hydrate.stock} is no more concentrated than its solubility product allows`);
		}
	}
});
