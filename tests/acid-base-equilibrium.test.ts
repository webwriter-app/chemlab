import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, StructureManager, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration, type MoleculeDefinition } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { complexEquilibrium } from "../chemlib/complexes";

function dose(name: string, ml: number, concentration?: number) {
	const entry = chemicalCatalog.find(item => item.name === name);
	assert.ok(entry?.recipe, name);
	const recipe = concentration === undefined ? entry.recipe : withConcentration(entry.recipe, concentration);
	return prepareDose(recipe, loadMoleculeDefinition)(ml);
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

function near(actual: number, expected: number, tolerance: number) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected} (±${tolerance})`);
}

function solute(atoms: MoleculeDefinition["atoms"], bonds: MoleculeDefinition["bonds"], charges?: number[]) {
	return loadMoleculeDefinition({ atoms, bonds, formula: "", charges });
}

test("conjugate acetates and ammonium speciate without the parent acids", () => {
	const acetate = solute(["carbon", "carbon", "oxygen", "oxygen", "hydrogen", "hydrogen", "hydrogen"],
		["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1", "0-4:covalent:1", "0-5:covalent:1", "0-6:covalent:1"],
		[0, 0, 0, -1]);
	const sodium = StructureManager.newMolecule();
	sodium.addAtom("sodium", "Na", 1);
	const ammonium = StructureManager.newMolecule();
	const nitrogen = ammonium.addAtom("nitrogen", "N", 1);
	for (let i = 0; i < 4; i++) {
		const hydrogen = ammonium.addAtom("hydrogen", "H");
		ammonium.addBond(nitrogen._id, hydrogen._id, 1, 100, "covalent");
	}
	for (const [counterion, expected] of [[sodium, 8.875], [ammonium, 7]] as const) {
		const solution = dose("Wasser", 100);
		solution.addMolecule(acetate, 0.01);
		solution.addMolecule(counterion, 0.01);
		near(Simulation.getpH(solution), expected, 0.005);
	}
});

test("glycine is a zwitterion and boric acid forms tetrahydroxyborate", () => {
	const glycine = chemicalCatalog.find(item => item.name === "Glycin").preview;
	const solution = dose("Wasser", 100);
	solution.addMolecule(loadMoleculeDefinition(glycine), 0.01);
	const result = Simulation.getPolyproticEquilibrium(solution);
	near(result.pH, 5.97, 0.03);
	const zwitterion = result.species.find(species => species.name === "Glycin");
	assert.ok(zwitterion.fraction > 0.99);
	assert.deepEqual(zwitterion.structure()._atoms.map(atom => atom.getIonicCharge()).filter(Boolean).sort(), [-1, 1]);

	const boric = dose("Wasser", 100);
	boric.addMolecule(solute(["boron", "oxygen", "oxygen", "oxygen", "hydrogen", "hydrogen", "hydrogen"],
		["0-1:covalent:1", "0-2:covalent:1", "0-3:covalent:1", "1-4:covalent:1", "2-5:covalent:1", "3-6:covalent:1"]), 0.001);
	const borate = Simulation.getPolyproticEquilibrium(boric).species.find(item => item.formula === "B(OH)₄⁻");
	assert.equal(borate.structure()._atoms.filter(atom => atom.getSymbol() === "O").length, 4);
});

test("silver and ammonia obey the shared solution equilibrium", () => {
	const solution = mix(dose("Silbernitratlösung", 100, 0.02), dose("Ammoniaklösung", 100, 0.04));
	const result = Simulation.getPolyproticEquilibrium(solution);
	near(result.pH, 10.1165, 0.01);
	const complex = result.species.find(item => item.formula === "Ag(NH₃)₂⁺");
	const free = result.species.filter(item => item.formula === "NH₃" || item.formula === "NH₄⁺");
	assert.ok(complex?.concentration > 0.008);
	near(free.reduce((total, item) => total + item.concentration, 0) + 2 * complex.concentration, 0.02, 1e-10);
});

test("several metal ions compete for the same limited ammonia", () => {
	const ligand = { key: "N", totalC: 0.03, pKa: [9.25], protonatedCharge: 1 };
	const copper = { key: "[Cu2+]", totalC: 0.01, pKa: [7.5], protonatedCharge: 2 };
	const zinc = { key: "[Zn2+]", totalC: 0.01, pKa: [9.0, 9.5, 10.5, 11.5], protonatedCharge: 2 };
	const equilibrium = complexEquilibrium([ligand, copper, zinc])(1e-9);
	let bound = 0;
	for (const species of equilibrium.complexes) {
		assert.ok(species.concentration > 0);
		bound += species.concentration * species.formation.count;
		near(equilibrium.unbound.get(species.metal) + species.concentration, species.metal.totalC, 1e-12);
	}
	near(bound + equilibrium.unbound.get(ligand), ligand.totalC, 1e-12);
});

function solidAmounts(solution: Mixture) {
	return Object.fromEntries(solution._activeMolecules.filter(molecule => molecule.solidSaltFormula)
		.map(molecule => [molecule.solidSaltFormula, solution._molProperties[molecule._id + "n"]]));
}

test("calcium oxalate precipitates from an organic acid and an inorganic salt", () => {
	const solution = mix(dose("Oxalsäure", 100, 0.02), dose("Calciumchloridlösung", 100, 0.02));
	const before = solidAmounts(solution).CaC2O4;
	near(before, 0.00182, 0.00003);
	near(Simulation.getpH(solution), 1.724, 0.02);
	Simulation.sSolvation(solution);
	near(solidAmounts(solution).CaC2O4, before, 1e-10);
});

test("coupled carbonate and phosphate precipitates settle in one solvation call", () => {
	const solution = mix(dose("Wasser", 100), dose("Natriumcarbonatlösung", 40, 0.04),
		dose("Calciumchloridlösung", 40, 0.02), dose("Phosphorsäure (1 mol/L)", 40, 0.02),
		dose("Natronlauge (1 mol/L)", 40, 0.03));
	const amounts = solidAmounts(solution);
	const pH = Simulation.getpH(solution);
	Simulation.sSolvation(solution);
	assert.equal(Simulation.getpH(solution), pH);
	assert.deepEqual(Object.keys(solidAmounts(solution)), Object.keys(amounts));
	for (const [formula, amount] of Object.entries(amounts)) near(solidAmounts(solution)[formula], amount, 1e-10);
});
