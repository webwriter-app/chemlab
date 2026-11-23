import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { saltIonList, saltSolubility } from "../chemlib/saltSolubility";
import { buildCoverageReport, GAP_REASONS } from "../scripts/structure-coverage-model";

/**
 * The catalog-wide completeness gate for the Molecule Builder → ChemLab
 * handoff. `tests/structure-coverage.test.ts` keeps the tracked report in step
 * with the catalog and checks its arithmetic; this file holds the claim the
 * report makes: every selectable compound doses except the four named
 * references, every dose prepares, and every salt identity delivers the same
 * solution from its solid and from its stock.
 */

/** Formula units dosed in the salt parity check; 2 mmol in 100 mL. */
const MOLES = 0.002;

function catalogEntry(name: string) {
	const item = chemicalCatalog.find(candidate => candidate.name === name);
	assert.ok(item, `catalog entry ${name}`);
	return item;
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

function dryDose(name: string, moles: number) {
	const recipe = catalogEntry(name).recipe;
	assert.ok(recipe, `solid recipe ${name}`);
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return prepareDose(recipe, loadMoleculeDefinition)(moles * molarMass / recipe.density);
}

function stockDose(name: string, ml: number, concentration: number) {
	const recipe = catalogEntry(name).recipe;
	assert.ok(recipe, `stock recipe ${name}`);
	return prepareDose(withConcentration(recipe, concentration), loadMoleculeDefinition)(ml);
}

function ionMoles(solution: Mixture, smiles: string) {
	const molecule = solution._activeMolecules.find(item => item.smilesString === smiles);
	return molecule ? solution._molProperties[molecule._id + "n"] ?? 0 : 0;
}

function solidMoles(solution: Mixture, formula: string) {
	return solution._activeMolecules
		.filter(molecule => molecule.solidSaltFormula === formula)
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

function near(actual: number, expected: number, tolerance: number, label: string) {
	assert.ok(Number.isFinite(actual) && Number.isFinite(expected), `${label} is finite`);
	if (actual === 0 && expected === 0) return;
	const scale = Math.max(Math.abs(actual), Math.abs(expected));
	assert.ok(Math.abs(actual - expected) <= tolerance * scale,
		`${label}: ${actual.toExponential(4)} differs from ${expected.toExponential(4)} by more than ${tolerance * 100} %`);
}

test("only the four documented reference entries stay without a dose", () => {
	const report = buildCoverageReport();
	const undosed = report.entries.filter(entry => !entry.dosed).map(entry => entry.name).sort();
	assert.deepEqual(undosed, ["Lackmus", "Olivenöl", "Rotkohlsaft", "Schiff-Reagenz"]);
	assert.equal(report.summary.dosed, report.summary.catalogEntries - undosed.length);
	assert.deepEqual(Object.keys(GAP_REASONS).sort(), undosed,
		"every entry without a dose names its reason, and no reason outlives its gap");
	for (const entry of report.entries.filter(item => !item.dosed)) {
		assert.equal(entry.form, "reference", `${entry.name} is a reference entry`);
		assert.equal(entry.phase, null, `${entry.name} has no phase without a recipe`);
		assert.ok(GAP_REASONS[entry.name]?.trim(), `${entry.name} needs a gap reason`);
	}
});

test("every dosed catalog entry prepares a finite dose", () => {
	const report = buildCoverageReport();
	const phases = new Set<string>();
	for (const entry of report.entries) {
		if (!entry.dosed) continue;
		const recipe = catalogEntry(entry.name).recipe;
		assert.ok(recipe, `${entry.name} is dosed without a recipe`);
		assert.equal(recipe.phase, entry.phase, `${entry.name} keeps the reported phase`);
		assert.ok(Number.isFinite(recipe.density) && recipe.density > 0, `${entry.name} needs a positive density`);
		assert.ok(recipe.parts.length > 0 || recipe.gas || recipe.gases?.length,
			`${entry.name} needs parts or a named gas`);
		for (const part of recipe.parts) {
			assert.ok(Number.isFinite(part.amount) && part.amount > 0, `${entry.name} has a positive part amount`);
			const molarMass = loadMoleculeDefinition(part.molecule).getTotMolMass();
			assert.ok(Number.isFinite(molarMass) && molarMass > 0, `${entry.name} has a finite molar mass`);
		}
		const dose = prepareDose(recipe, loadMoleculeDefinition)(10);
		assert.ok(dose, `${entry.name} prepares no dose`);
		const amounts = dose._activeMolecules.map(molecule => dose._molProperties[molecule._id + "n"] ?? 0);
		assert.ok(amounts.length > 0 || dose.offeredGas.size > 0, `${entry.name} doses nothing`);
		for (const amount of amounts) {
			assert.ok(Number.isFinite(amount) && amount > 0, `${entry.name} doses a finite amount`);
		}
		if (recipe.phase === "gas") {
			assert.ok(dose.offeredGas.size > 0 || amounts.length > 0, `${entry.name} books its gas`);
		} else {
			assert.ok(dose.contentVolume > 0, `${entry.name} occupies a volume`);
		}
		phases.add(recipe.phase);
	}
	assert.deepEqual([...phases].sort(), ["gas", "liquid", "solid"], "the catalog uses every dosing phase");
});

test("all paired salts agree from their solid and from their stock", () => {
	const report = buildCoverageReport();
	assert.equal(report.summary.dosedSaltEntries, report.summary.saltEntries,
		"every dosed salt entry belongs to a paired identity");
	assert.equal(report.summary.solidOnly + report.summary.stockOnly + report.summary.referenceOnly, 0);
	let pairs = 0;
	for (const group of report.salts) {
		assert.equal(group.status, "paired", `${group.label} has no counterpart`);
		const table = saltSolubility[group.identity];
		assert.ok(table, `${group.identity} has no solubility row`);
		const solid = group.solid[0], stock = group.stock[0];
		assert.ok(solid && stock, `${group.label} names both forms`);

		const fromSolid = mix(stockDose("Wasser", 100, 1), dryDose(solid.name, MOLES));
		const fromStock = mix(stockDose(stock.name, 50, MOLES / 0.05), stockDose("Wasser", 50, 1));
		for (const ion of saltIonList(table.ions)) {
			near(ionMoles(fromSolid, ion.smiles), ionMoles(fromStock, ion.smiles), 0.01,
				`${group.identity} ${ion.smiles}`);
		}
		near(solidMoles(fromSolid, group.identity), solidMoles(fromStock, group.identity), 0.01,
			`${group.identity} reservoir`);
		near(fromSolid._solutionVolume, fromStock._solutionVolume, 0.02, `${group.identity} volume`);
		pairs++;
	}
	assert.equal(pairs, report.summary.paired);
	assert.ok(pairs >= 31, "the catalog keeps its salt identities paired");
});
