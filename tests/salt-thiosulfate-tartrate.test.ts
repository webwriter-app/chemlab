import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, solutionDisplayNames, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { prepareMixtureDose, snapshotMixture } from "../data/savedMixtures";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltIonList, saltSolubility } from "../chemlib/saltSolubility";
import { catalogStructures, structureCatalog } from "../molecule-builder/catalog";

/**
 * The photographic fixing salt and the Rochelle salt close the last two salt
 * gaps of the builder catalog, except iron(II) sulfide. Both are hydrates of a
 * salt whose anion had no structure yet: a thiosulfate that keeps its
 * sulfur-sulfur bond, and a tartrate that is the dianion of the tartaric-acid
 * family. The double salt carries two different cations per anion, which is why
 * the solubility row lists the cation list in full.
 */
interface HydrateSalt {
	name: string;
	/** formula of the dry solid, with its crystal water */
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
	/** the ions of one formula unit, in the order of the solubility table */
	ions: [string, number][];
	/** amount of one ion in a 0.1-molar bath of 100 mL */
	perTenthMolar: [string, number][];
}

const THIOSULFATE = "[O-]S(=O)([S-])=O";
const TARTRATE = "[O-]C(=O)C(O)C(O)C(=O)[O-]";

const salts: HydrateSalt[] = [
	// https://en.wikipedia.org/wiki/Sodium_thiosulfate
	{ name: "Natriumthiosulfat-Pentahydrat", formula: "Na₂S₂O₃·5 H₂O", density: 1.667, waters: 5,
		stock: "Natriumthiosulfatlösung", stockLabel: "Natriumthiosulfat", table: "Na2S2O3",
		ions: [["[Na+]", 2], [THIOSULFATE, 1]], perTenthMolar: [["[Na+]", 0.02], [THIOSULFATE, 0.01]] },
	// https://www.scbt.com/p/potassium-sodium-tartrate-6381-59-5
	{ name: "Kaliumnatriumtartrat", formula: "KNaC₄H₄O₆·4 H₂O", density: 1.79, waters: 4,
		stock: "Kaliumnatriumtartratlösung", stockLabel: "Kaliumnatriumtartrat", table: "KNaC4H4O6",
		ions: [["[K+]", 1], [TARTRATE, 1], ["[Na+]", 1]],
		perTenthMolar: [["[K+]", 0.01], ["[Na+]", 0.01], [TARTRATE, 0.01]] },
];

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
	const limit = saltSolubility[table]?.saturation;
	assert.ok(limit !== undefined, `saturation ${table}`);
	return limit;
}

function near(actual: number, expected: number, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const WATER_MOLAR_MASS = 18.015;

test("both salts join the solubility table and come as a dry solid next to a stock", () => {
	for (const salt of salts) {
		const row = saltSolubility[salt.table];
		assert.ok(row, `${salt.table} has a solubility row`);
		assert.deepEqual(saltIonList(row.ions).map(({ smiles, count }) => [smiles, count]), salt.ions,
			`${salt.table} keys on exactly the ions of one formula unit`);
		assert.ok(row.solidDensity !== undefined, `${salt.table} has a solid density`);

		const solid = entry(salt.name);
		assert.ok(solid.recipe, `${salt.name} has a recipe`);
		assert.equal(solid.recipe.phase, "solid", `${salt.name} is dosed as a solid`);
		assert.equal(solid.formula, salt.formula);
		assert.equal(solid.recipe.parts.length, 1, `${salt.name} is dosed as one formula unit`);
		assert.equal(solid.recipe.parts[0].molecule, solid.preview, `${salt.name} doses the structure the builder shows`);
		near(solid.recipe.density, salt.density, 1e-12);

		const liquid = entry(salt.stock);
		assert.ok(liquid.recipe, `${salt.stock} is dosable`);
		assert.equal(liquid.recipe.phase, "liquid");
		assert.equal(liquid.recipe.aqueousMolar, true);
		assert.equal(liquid.concentrationLimit, saturation(salt.table), `${salt.stock} stops at the saturation`);
		assert.equal(solutionDisplayNames[salt.stock], salt.stockLabel);

		// The point of the pair: the builder offers the same two compounds.
		assert.ok(structureCatalog.some(item => item.name === salt.name), `${salt.name} is in the builder catalog`);
		assert.equal(catalogStructures(salt.name)[0]?.kind, "crystal", `${salt.name} opens as a crystal`);
	}
});

test("a dry hydrate dissolves into its crystal water and leaves its ions behind", () => {
	const fragmentsOf = (name: string) => {
		const built = loadMoleculeDefinition(entry(name).preview);
		return (Simulation as unknown as { saltFragments(molecule: typeof built): { ion: { smilesString: string }; count: number }[] })
			.saltFragments(built).map(({ ion, count }) => [ion.smilesString, count]);
	};
	// Crystal water leaves the salt skeleton as neutral H₂O fragments, which the
	// fragment pass reports as a bare oxygen because the hydrogens stay implicit.
	assert.deepEqual(fragmentsOf("Natriumthiosulfat-Pentahydrat"),
		[["[Na+]", 2], [THIOSULFATE, 1], ["O", 5]]);
	assert.deepEqual(fragmentsOf("Kaliumnatriumtartrat"),
		[["[K+]", 1], ["[Na+]", 1], [TARTRATE, 1], ["O", 4]]);

	for (const salt of salts) {
		const moles = 0.01;
		const bath = mix(dose("Wasser", 100), dryDose(salt.name, moles));
		assert.equal(solidMoles(bath, salt.table), 0, `${moles} mol of ${salt.name} dissolve`);
		// The crystal water joins the solvent, so the dose volume grows with it.
		near(bath._solutionVolume, 0.1 + moles * salt.waters * WATER_MOLAR_MASS / 1000, 1e-12);
		near(bath.addedVolume, 0, 1e-12);
		for (const [smiles, amount] of salt.perTenthMolar) {
			near(ionMoles(bath, smiles), amount, 1e-12);
		}
		assert.ok((Simulation.getSaltSaturation(bath)?.fraction ?? 0) < 1, `${salt.name} stays unsaturated`);
	}
});

test("a dry salt dissolves into the same bath as its stock", () => {
	for (const salt of salts) {
		const fromSolid = mix(dose("Wasser", 100), dryDose(salt.name, 0.01));
		const fromStock = mix(dose(salt.stock, 100, 0.1));
		near(fromStock._solutionVolume, 0.1, 1e-12);
		for (const [smiles, amount] of salt.perTenthMolar) {
			near(ionMoles(fromSolid, smiles), amount, 1e-12);
			near(ionMoles(fromStock, smiles), amount, 1e-12);
		}
		// The crystal water of the dry dose dilutes the bath by a permille.
		near(fromSolid._solutionVolume, 0.1 + 0.01 * salt.waters * WATER_MOLAR_MASS / 1000, 1e-12);
		near(Simulation.getpH(fromSolid), Simulation.getpH(fromStock), 5e-3);
	}
});

test("the tartrate is the weak base of the tartaric-acid family and the thiosulfate a spectator", () => {
	const rochelle = mix(dose("Kaliumnatriumtartratlösung", 100, 0.1));
	// Tartrate takes the protons of water like the hydrogencarbonate: pH 8.67.
	near(Simulation.getpH(rochelle), 8.67, 0.01);
	const stock = Simulation.getPolyproticEquilibrium(rochelle);
	const tartrate = stock.species.find(item => item.formula === "C₄H₄O₆²⁻");
	assert.ok(tartrate, "the stock lists the tartrate of the acid family");
	near(tartrate.fraction ?? 0, 1, 1e-3);

	// One equivalent of acid leaves the amphiprotic hydrogen tartrate, whose pH
	// sits at the mean of the two dissociation constants.
	const half = mix(dose("Kaliumnatriumtartratlösung", 100, 0.1), dose("Salzsäure (1 mol/L)", 100, 0.1));
	near(Simulation.getpH(half), (2.98 + 4.34) / 2, 0.02);
	const species = Simulation.getPolyproticEquilibrium(half).species
		.filter(item => item.formula.startsWith("C₄H"));
	assert.deepEqual(species.map(item => item.formula), ["C₄H₆O₆", "C₄H₅O₆⁻", "C₄H₄O₆²⁻"]);
	assert.ok(species.every(item => (item.fraction ?? 0) > 0.1), "all three tartrate stages are present");

	// The thiosulfate has no acid-base, complex or half-reaction entry, so it
	// stays neutral and never enters a proton balance.
	const thiosulfate = mix(dose("Natriumthiosulfatlösung", 100, 0.1));
	assert.equal(Simulation.getpH(thiosulfate), 7);
	assert.deepEqual(Simulation.getPolyproticEquilibrium(thiosulfate).species.map(item => item.formula),
		["H₃O⁺", "OH⁻"]);
});

test("an overdosed salt settles at its saturation and redissolves on dilution", () => {
	for (const salt of salts) {
		const limit = saturation(salt.table);
		// Two and a half times what a saturated solution holds in 100 mL.
		const dosed = 2.5 * limit * 0.1;
		const bath = mix(dose("Wasser", 100), dryDose(salt.name, dosed));
		const reservoir = solidMoles(bath, salt.table);
		assert.ok(reservoir > 0, `${dosed} mol of ${salt.name} settle as a reservoir`);
		const dissolved = dosed - reservoir;
		// The reservoir is the anhydrous salt of the table, so the dissolved part
		// sits exactly on the tabulated saturation.
		for (const [smiles, count] of salt.ions) {
			near(ionMoles(bath, smiles), dissolved * count, 1e-9);
			near(ionMoles(bath, smiles) / count / bath._solutionVolume, limit, 1e-3);
		}
		const state = Simulation.getSaltSaturation(bath);
		assert.equal(state?.formula, salt.table, `${salt.name} saturates on its own entry`);
		near(state.fraction, 1, 1e-6);
		// The crystal water stays in the solvent even though the salt settled.
		near(bath._solutionVolume, 0.1 + dosed * salt.waters * WATER_MOLAR_MASS / 1000, 1e-12);

		const diluted = mix(bath, dose("Wasser", 400));
		assert.equal(solidMoles(diluted, salt.table), 0, `${salt.name} redissolves on dilution`);
		assert.ok((Simulation.getSaltSaturation(diluted)?.fraction ?? 1) < 1);
		for (const [smiles, count] of salt.ions) {
			near(ionMoles(diluted, smiles), dosed * count, 1e-9);
		}
	}
});

test("a saved dose of either hydrate keeps the bulk volume of its crystals", () => {
	for (const salt of salts) {
		const bulk = loadMoleculeDefinition(entry(salt.name).preview).getTotMolMass() / salt.density / 1000;
		const recipe = snapshotMixture(dryDose(salt.name, 0.01));
		assert.ok(recipe, `the dry dose of ${salt.name} can be saved`);
		assert.equal(recipe.parts.length, 1);
		near(recipe.parts[0].bulk ?? 0, bulk, 1e-12);
		const restored = prepareMixtureDose(recipe, loadMoleculeDefinition);
		assert.ok(restored, `the saved dose of ${salt.name} loads again`);
		near(restored(1)._activeMolecules[0].solidBulkLitresPerMol ?? 0, bulk, 1e-12);
	}
});
