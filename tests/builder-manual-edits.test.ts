import assert from "node:assert/strict";
import { test } from "node:test";
import { idealSolubility, ionCharge, saltSolubility } from "../chemlib/saltSolubility";
import { chemicalCatalog } from "../data/chemicals";
import { analyzeBuilderCompound, builderRecipes, builderStockFor, hydrateBuilderChemical,
	ionicHydroxide, portableBuilderChemical, readBuilderChemical } from "../molecule-builder/custom-compounds";
import { reviewIsCurrent } from "../molecule-builder/lookup-guard";
import { catalogReagent, definitionSignature, reagentLimit } from "../molecule-builder/reagent-forms";
import type { Bond, Molecule } from "../molecule-builder/structure";

/** A structure as the builder hands it over: atoms in a row, bonds by id. */
function molecule(numbers: number[], bonds: Bond[], name = "", charges?: number[]): Molecule {
	return {
		version: 1, kind: "molecule", name, bonds,
		atoms: numbers.map((atomicNumber, index) => ({ id: index + 1, atomicNumber,
			charge: charges?.[index] ?? 0, diagram: [index, 0] as [number, number],
			position: [index, 0, 0] as [number, number, number] })),
	};
}

const edge = (from: number, to: number, order: Bond["order"] = 1): Bond => ({ from, to, order });
const ionic = (from: number, to: number, order: Bond["order"] = 1): Bond => ({ from, to, order, kind: "ionic" });

const catalogEntry = (name: string) => {
	const entry = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(entry, `catalog entry ${name}`);
	return entry;
};

/** The solute parts of a prepared stock, without its solvent. */
const solutesOf = (recipe: { parts: { molecule: { formula: string } }[] }) =>
	recipe.parts.filter(part => part.molecule.formula !== "H₂O").map(part => part.molecule.formula);

/** The water molecules of a formula unit, drawn as the catalog draws them. */
function withWater(numbers: number[], bonds: Bond[], waters: number) {
	for (let index = 0; index < waters; index++) {
		const start = numbers.length;
		numbers.push(8, 1, 1);
		bonds.push(edge(start + 1, start + 2), edge(start + 1, start + 3));
	}
	return { numbers, bonds };
}

/** Iron(III) chloride, drawn the way the catalog stores it. */
const ferricChloride = molecule([26, 17, 17, 17], [ionic(1, 2), ionic(1, 3), ionic(1, 4)]);

/** Iron(II) chloride: one chloride less than the catalog knows. */
const ferrousChloride = molecule([26, 17, 17], [ionic(1, 2), ionic(1, 3)]);

/**
 * Copper(II) sulfate pentahydrate. The ionic bonds sit on the single-bonded
 * sulfate oxygens, as in the catalog definition: an anion oxygen that also
 * carries a double bond would read as a completed valence and fail the graph.
 */
const pentahydrate = (() => {
	const { numbers, bonds } = withWater([29, 16, 8, 8, 8, 8], [edge(2, 3, 2), edge(2, 4, 2),
		edge(2, 5), edge(2, 6), ionic(1, 5), ionic(1, 6)], 5);
	return molecule(numbers, bonds);
})();

test("a hand-drawn salt finds the weighed catalog form of its formula unit", () => {
	const analysis = analyzeBuilderCompound(ferricChloride);
	assert.ok(analysis);
	assert.equal(analysis.classification, "salt");
	assert.equal(analysis.signature, "Cl-1.Cl-1.Cl-1.Fe+3");
	const recipes = builderRecipes(analysis, .1);
	assert.equal(recipes.identity.name, "Eisen(III)-chlorid");
	assert.equal(recipes.identity.density, 2.9);
	assert.equal(recipes.crystalWater, 0);
	assert.equal(recipes.limit, 1);
	assert.ok(recipes.solid.recipe);
	assert.equal(recipes.solid.recipe.phase, "solid");
	assert.equal(recipes.solid.recipe.density, 2.9);
	assert.equal(recipes.solid.recipe.parts[0].molecule.formula, "FeCl₃");
	// The prepared stock doses the ions the drawing dissociates into.
	assert.ok(recipes.stock.recipe);
	assert.equal(recipes.stock.recipe.aqueousMolar, true);
	assert.deepEqual(solutesOf(recipes.stock.recipe), ["Fe", "Cl", "Cl", "Cl"]);
	// The stored definition and the drawing meet in one text.
	assert.equal(definitionSignature(analysis.unit), analysis.signature);
});

test("one chloride less is another compound, not the same one", () => {
	const analysis = analyzeBuilderCompound(ferrousChloride);
	assert.ok(analysis);
	assert.equal(analysis.classification, "salt");
	assert.equal(analysis.signature, "Cl-1.Cl-1.Fe+2");
	const recipes = builderRecipes(analysis, .1);
	// No weighed catalog form exists for this composition, but its ions do.
	assert.equal(recipes.identity, undefined);
	assert.deepEqual(recipes.solid, { reason: "identity-missing" });
	assert.ok(recipes.stock.recipe);
	assert.deepEqual(solutesOf(recipes.stock.recipe), ["Fe", "Cl", "Cl"]);
	// The same atoms with covalent bonds are a molecule, and no weighed salt.
	const covalent = analyzeBuilderCompound(molecule([26, 17, 17, 17], [edge(1, 2), edge(1, 3), edge(1, 4)]));
	assert.equal(covalent.classification, "other");
	assert.equal(covalent.signature, "Cl3Fe");
	assert.deepEqual(builderRecipes(covalent, .1).solid, { reason: "identity-missing" });
});

test("an ion pair whose charge balance does not close is not analysed", () => {
	// Calcium carries two electrons into an ionic bond, so one chloride leaves
	// a fragment no solution holds, and the analysis has no formula unit.
	assert.equal(analyzeBuilderCompound(molecule([20, 17], [ionic(1, 2)])), undefined);
	assert.equal(analyzeBuilderCompound(molecule([11, 8], [ionic(1, 2)])), undefined);
	// A polyatomic anion without its precomputed charges fails the same guard.
	assert.equal(analyzeBuilderCompound(molecule([19, 7, 8, 8, 8],
		[edge(2, 3, 2), edge(2, 4), edge(2, 5), ionic(1, 4)])), undefined);
	// A single atom is no compound at all.
	assert.equal(analyzeBuilderCompound(molecule([26], [])), undefined);
});

test("a nitrate carries the charges the catalog stores, and then it matches", () => {
	const nitrate = molecule([19, 7, 8, 8, 8], [edge(2, 3, 2), edge(2, 4), edge(2, 5), ionic(1, 4)],
		"", [0, 1, 0, 0, -1]);
	const analysis = analyzeBuilderCompound(nitrate);
	assert.ok(analysis);
	assert.equal(analysis.signature, "K+1.NO3-1");
	const recipes = builderRecipes(analysis, .1);
	assert.equal(recipes.identity.name, "Kaliumnitrat");
	assert.equal(recipes.solid.recipe.density, 2.11);
	assert.deepEqual(solutesOf(recipes.stock.recipe), ["K", "NO3"]);
	// Ammonium chloride is the cation side of the same rule.
	const ammonium = analyzeBuilderCompound(molecule([7, 1, 1, 1, 1, 17],
		[edge(1, 2), edge(1, 3), edge(1, 4), edge(1, 5), ionic(1, 6)]));
	assert.equal(ammonium.signature, "Cl-1.H4N+1");
	assert.equal(builderRecipes(ammonium, .1).identity.name, "Ammoniumchlorid");
});

test("the identity follows the chemistry, not the layout, the name or the camera", () => {
	const moved: Molecule = {
		...pentahydrate, name: "Mein Salz",
		atoms: pentahydrate.atoms.map((atom, index) => ({ ...atom, diagram: [index * 3, index * 2],
			position: [index * 1.5, index * -0.75, index * 0.25] })),
		bonds: [...pentahydrate.bonds].reverse(),
	};
	const original = analyzeBuilderCompound(pentahydrate);
	const edited = analyzeBuilderCompound(moved);
	assert.ok(original);
	assert.ok(edited);
	assert.equal(original.signature, "5H2O.Cu+2.O4S-2");
	assert.equal(original.formula, "CuH10O9S");
	assert.equal(edited.signature, original.signature);
	assert.equal(edited.formula, "CuH10O9S");
	assert.equal(edited.crystalWater, 5);
	const identity = builderRecipes(edited, .1).identity;
	assert.equal(identity.name, "Kupfer(II)-sulfat-Pentahydrat");
	assert.equal(identity.density, 2.286);
	assert.equal(builderRecipes(edited, .1).crystalWater, 5);
});

test("a stale catalog key never authorizes another composition", () => {
	// Four waters with the pentahydrate's key: the key is only a tiebreaker
	// inside the signature the drawing produced.
	const { numbers, bonds } = withWater([29, 16, 8, 8, 8, 8], [edge(2, 3, 2), edge(2, 4, 2),
		edge(2, 5), edge(2, 6), ionic(1, 5), ionic(1, 6)], 4);
	const tetrahydrate: Molecule = { ...molecule(numbers, bonds), catalogKey: "Kupfer(II)-sulfat-Pentahydrat" };
	const analysis = analyzeBuilderCompound(tetrahydrate);
	assert.ok(analysis);
	assert.equal(analysis.crystalWater, 4);
	assert.equal(analysis.signature, "4H2O.Cu+2.O4S-2");
	assert.deepEqual(builderRecipes(analysis, .1).solid, { reason: "identity-missing" });
	// The anhydrous salt is a different catalog row, and not the pentahydrate.
	const anhydrous = analyzeBuilderCompound(molecule([29, 16, 8, 8, 8, 8],
		[edge(2, 3, 2), edge(2, 4, 2), edge(2, 5), edge(2, 6), ionic(1, 5), ionic(1, 6)]));
	assert.equal(anhydrous.signature, "Cu+2.O4S-2");
	assert.equal(builderRecipes(anhydrous, .1).identity, undefined);
	// A salt key on a water molecule does not turn it into that salt.
	const stamped: Molecule = { ...molecule([8, 1, 1], [edge(1, 2), edge(1, 3)]), catalogKey: "Natriumchlorid" };
	const water = analyzeBuilderCompound(stamped);
	assert.equal(water.signature, "1H2O");
	assert.equal(builderRecipes(water, .1).identity, undefined);
	assert.deepEqual(builderRecipes(water, .1).solid, { reason: "identity-missing" });
});

test("a neutral hydroxide drawing is the ionic compound it is", () => {
	// Slaked lime drawn as a molecule: Ca with two covalent hydroxyls.
	const lime = molecule([20, 8, 1, 8, 1], [edge(1, 2), edge(2, 3), edge(1, 4), edge(4, 5)]);
	const converted = ionicHydroxide(lime);
	assert.ok(converted);
	assert.deepEqual(converted.bonds.map(bond => bond.kind), ["ionic", undefined, "ionic", undefined]);
	assert.deepEqual(converted.atoms.map(atom => atom.charge), [0, 0, 0, 0, 0]);
	const analysis = analyzeBuilderCompound(converted);
	assert.equal(analysis.classification, "salt");
	assert.equal(analysis.signature, "Ca+2.HO-1.HO-1");
	assert.equal(analysis.signature, definitionSignature(catalogEntry("Calciumhydroxid").recipe.parts[0].molecule));
	assert.equal(builderRecipes(analysis, .1).identity.name, "Calciumhydroxid");
	// Soda lye follows the same conversion.
	const lye = ionicHydroxide(molecule([11, 8, 1], [edge(1, 2), edge(2, 3)]));
	const lyeAnalysis = analyzeBuilderCompound(lye);
	assert.equal(lyeAnalysis.signature, "HO-1.Na+1");
	assert.equal(lyeAnalysis.signature, definitionSignature(catalogEntry("Natriumhydroxid").recipe.parts[0].molecule));
	assert.equal(builderRecipes(lyeAnalysis, .1).identity.name, "Natriumhydroxid");
	// Only a hydroxide with one metal, one hydroxyl per hydrogen and a matching
	// ion charge qualifies; everything else stays what it was drawn as.
	assert.equal(ionicHydroxide(molecule([13, 8, 1, 8, 1], [edge(1, 2), edge(2, 3), edge(1, 4), edge(4, 5)])), undefined);
	assert.equal(ionicHydroxide(molecule([26, 8, 8, 8], [edge(1, 2), edge(1, 3), edge(1, 4)])), undefined);
	assert.equal(ionicHydroxide(molecule([20, 8, 1, 8, 1, 8, 1, 8, 1],
		[edge(1, 2), edge(2, 3), edge(1, 4), edge(4, 5), edge(1, 6), edge(6, 7), edge(1, 8), edge(8, 9)])), undefined);
	assert.equal(ionicHydroxide(molecule([20, 8, 1], [ionic(1, 2), edge(2, 3)])), undefined);
});

test("the weighed solid is the catalog recipe, the stock its diluted form", () => {
	const analysis = analyzeBuilderCompound(pentahydrate);
	assert.ok(analysis);
	const recipes = builderRecipes(analysis, .1);
	const authored = catalogEntry("Kupfer(II)-sulfat-Pentahydrat").recipe;
	const unit = recipes.solid.recipe.parts[0].molecule;
	const stored = authored.parts[0].molecule;
	// The dry form is the catalog recipe itself, crystal water included. Only
	// the order of the bonds differs: the catalog writes them in its own
	// authored order, the analysis appends the ionic ones after the covalent.
	assert.equal(recipes.solid.recipe.phase, "solid");
	assert.equal(recipes.solid.recipe.density, authored.density);
	assert.deepEqual(unit.atoms, stored.atoms);
	assert.deepEqual(unit.charges, stored.charges);
	assert.equal(unit.formula, stored.formula);
	assert.deepEqual([...unit.bonds].sort(), [...stored.bonds].sort());
	assert.equal(definitionSignature(stored), analysis.signature);
	assert.equal(recipes.limit, 1);
	// The stock is the dissolved formula unit, not the weighed crystal.
	assert.equal(recipes.stock.recipe.phase, "liquid");
	assert.deepEqual(solutesOf(recipes.stock.recipe), ["Cu", "O4S"]);
});

test("a saturated solid refuses the stock above its tabulated limit", () => {
	const analysis = analyzeBuilderCompound(molecule([47, 17], [ionic(1, 2)]));
	assert.equal(analysis.signature, "Ag+1.Cl-1");
	const recipes = builderRecipes(analysis, .1);
	assert.equal(recipes.identity.name, "Silberchlorid");
	assert.equal(recipes.solid.recipe.density, 5.56);
	assert.equal(recipes.limit, saltSolubility.AgCl.saturation);
	assert.deepEqual(recipes.stock, { reason: "above-saturation" });
	assert.ok(builderRecipes(analysis, 1e-5).stock.recipe);
	// A row with a measured saturation reads it, a bare product follows the
	// ideal solubility, and neither ever exceeds the one molar builder stock.
	const identity = recipes.identity;
	assert.equal(reagentLimit(identity), saltSolubility.AgCl.saturation);
	assert.equal(reagentLimit({ ...identity, formula: "BaSO₄" }), saltSolubility.BaSO4.saturation);
	const ideal = idealSolubility(saltSolubility.AgCl.ksp, saltSolubility.AgCl.ions);
	assert.ok(ideal > 1.3e-5 && ideal < 1.4e-5);
	assert.equal(reagentLimit({ ...identity, formula: "Ca(OH)₂" }), saltSolubility["Ca(OH)2"].saturation);
	// The charges of a tabulated ion are read from its SMILES.
	assert.equal(ionCharge("[O-][N+](=O)[O-]"), -1);
	assert.equal(ionCharge("[Fe+3]"), 3);
	assert.equal(ionCharge("[O-]S(=O)(=O)[O-]"), -2);
});

test("a weighed compound keeps its phase through the worksheet and doses its density", () => {
	const analysis = analyzeBuilderCompound(pentahydrate);
	const saved = hydrateBuilderChemical({ key: "builder-chemical:kupfersulfat", structure: pentahydrate,
		facts: {}, phase: "solid" }, analysis);
	assert.equal(saved.recipe.phase, "solid");
	assert.equal(saved.recipe.density, 2.286);
	assert.equal(saved.recipe.parts[0].molecule.formula, "CuSO₄·5 H₂O");
	const portable = portableBuilderChemical(saved);
	assert.deepEqual(Object.keys(portable), ["key", "structure", "facts", "stockConcentration", "phase"]);
	const restored = readBuilderChemical(JSON.parse(JSON.stringify(portable)), 0);
	assert.equal(restored.phase, "solid");
	assert.equal(restored.stockConcentration, undefined);
	// The palette derives the recipe again from the analysis, not from the cache.
	assert.deepEqual(builderStockFor(hydrateBuilderChemical(restored)), saved.recipe);
	// A stock keeps the short form of the record, as older worksheets wrote it.
	const stock = hydrateBuilderChemical({ key: "builder-chemical:kupfersulfat", structure: pentahydrate,
		facts: {}, stockConcentration: .1 }, analysis);
	assert.equal(stock.recipe.phase, "liquid");
	assert.deepEqual(Object.keys(portableBuilderChemical(stock)), ["key", "structure", "facts", "stockConcentration"]);
	assert.equal(builderStockFor(hydrateBuilderChemical(readBuilderChemical(portableBuilderChemical(stock), 0))).aqueousMolar, true);
});

test("a catalog lookup only answers a structure it still belongs to", () => {
	const analysis = analyzeBuilderCompound(pentahydrate);
	// The signature names the solids, the key only breaks a tie inside it.
	assert.equal(catalogReagent(analysis.signature).identity.name, "Kupfer(II)-sulfat-Pentahydrat");
	assert.equal(catalogReagent(analysis.signature, chemicalCatalog, "Natriumchlorid").identity.name,
		"Kupfer(II)-sulfat-Pentahydrat");
	assert.deepEqual(catalogReagent("Cu+2.O4S-2", chemicalCatalog, "Kupfer(II)-sulfat-Pentahydrat"),
		{ reason: "identity-missing" });
	// Two catalog rows of one composition need the name the drawing came from.
	const twin = catalogEntry("Kupfer(II)-sulfat-Pentahydrat");
	const doubled = [...chemicalCatalog, { ...twin, recipe: { ...twin.recipe, density: 2.3 } }];
	assert.deepEqual(catalogReagent(analysis.signature, doubled), { reason: "ambiguous-density" });
	assert.equal(catalogReagent(analysis.signature, doubled, "Kupfer(II)-sulfat-Pentahydrat").identity.density, 2.286);
});

test("a late catalog answer only reaches the panel it was asked for", () => {
	const host = { isConnected: true };
	const review = { analysis: undefined };
	assert.equal(reviewIsCurrent(host, review, review), true);
	assert.equal(reviewIsCurrent(host, { analysis: undefined }, review), false);
	assert.equal(reviewIsCurrent({ isConnected: false }, review, review), false);
});
