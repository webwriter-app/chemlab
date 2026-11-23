import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, ComponentType, Simulation, type Mixture } from "../chemlib";
import { chemicalCatalog, withConcentration } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { prepareMixtureDose, snapshotMixture } from "../data/savedMixtures";
import { catalogAqueousStructure, catalogStructures, matchingRecipe } from "../molecule-builder/catalog";
import { aqueousComponents } from "../molecule-builder/aqueous-preview";
import { readStructure } from "../molecule-builder/structure";

const solidBicarbonate = "Natriumhydrogencarbonat";
const bicarbonate = "Natriumhydrogencarbonatlösung";
const carbonate = "Natriumcarbonatlösung";

function dose(name: string, ml: number, concentration: number) {
	const entry = chemicalCatalog.find(item => item.name === name);
	assert.ok(entry?.recipe, name);
	return prepareDose(withConcentration(entry.recipe, concentration), loadMoleculeDefinition)(ml);
}

function mix(...portions: Mixture[]) {
	const vessel = ComponentManager.newChemComponent(ComponentType.Beaker);
	for (const portion of portions) vessel.addContents({ nMix: portion });
	return vessel._content;
}

function near(actual: number, expected: number, tolerance = 0.01) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

function dryDose(moles: number) {
	const recipe = chemicalCatalog.find(item => item.name === solidBicarbonate).recipe;
	const molarMass = loadMoleculeDefinition(recipe.parts[0].molecule).getTotMolMass();
	return prepareDose(recipe, loadMoleculeDefinition)(moles * molarMass / recipe.density);
}

function solidMoles(solution: Mixture) {
	return solution._activeMolecules.filter(molecule => molecule.solidSaltFormula === "NaHCO3")
		.reduce((sum, molecule) => sum + solution._molProperties[molecule._id + "n"], 0);
}

test("dry bicarbonate preserves its mass and charge through save/restore and dissolves like the stock", () => {
	const dry = dryDose(0.01);
	assert.equal(dry.hasLiquidContents, false);
	assert.equal(dry._activeMolecules.length, 1);
	const salt = dry._activeMolecules[0];
	assert.equal(salt.dosedAsSolid, true);
	assert.equal(salt._totalCharge, 0);
	assert.deepEqual(salt._atoms.map(atom => atom.getIonicCharge()), [1, 0, 0, -1, 0, 0]);
	near(dry._molProperties[salt._id + "n"], 0.01, 1e-12);
	near(salt.getTotMolMass(), 84.01, 0.02);
	const saved = snapshotMixture(dry);
	const restored = prepareMixtureDose(JSON.parse(JSON.stringify(saved)), loadMoleculeDefinition)(saved.sampleMl);
	const solution = mix(dose("Wasser", 100, 1), restored);
	near(solidMoles(solution), 0, 1e-10);
	near(solution._solutionVolume, 0.1, 1e-10);
	near(Simulation.getpH(solution), Simulation.getpH(dose(bicarbonate, 100, 0.1)), 0.001);
});

test("excess dry bicarbonate leaves a reservoir that dissolves after dilution and survives restore", () => {
	const saturated = mix(dose("Wasser", 100, 1), dryDose(0.2));
	const remaining = solidMoles(saturated);
	assert.ok(remaining > 0.07 && remaining < 0.1, `solid reservoir ${remaining}`);
	const sodium = saturated._activeMolecules.find(molecule => molecule.smilesString === "[Na+]");
	near(saturated._molProperties[sodium._id + "n"] + remaining, 0.2, 1e-8);
	const saved = snapshotMixture(saturated);
	const restored = prepareMixtureDose(JSON.parse(JSON.stringify(saved)), loadMoleculeDefinition)(saved.sampleMl);
	near(solidMoles(restored), remaining, 1e-10);
	const diluted = mix(restored, dose("Wasser", 200, 1));
	near(solidMoles(diluted), 0, 1e-10);
	near(Simulation.getpH(diluted), Simulation.getpH(dose(bicarbonate, 300, 2 / 3)), 0.001);
});

test("dry bicarbonate reacts with acid like the same amount in solution", () => {
	const dry = mix(dose("Salzsäure (1 mol/L)", 100, 0.3), dryDose(0.02));
	const stock = mix(dose(bicarbonate, 50, 0.4), dose("Salzsäure (1 mol/L)", 50, 0.6));
	assert.ok((dry.evolvedGas.get("CO2") ?? 0) > 0.01);
	near(dry.evolvedGas.get("CO2"), stock.evolvedGas.get("CO2"), 1e-5);
	near(Simulation.getpH(dry), Simulation.getpH(stock));
	near(solidMoles(dry), 0, 1e-10);
});

test("the bicarbonate crystal selects the dry salt while the aqueous preview selects the stock", () => {
	const [crystal] = catalogStructures(solidBicarbonate);
	assert.equal(crystal.kind, "crystal");
	const match = matchingRecipe(readStructure(JSON.parse(JSON.stringify(crystal))));
	assert.equal(match?.name, solidBicarbonate);
	assert.equal(match.recipe.phase, "solid");
	if (crystal.kind !== "crystal") return;
	const edited = { ...crystal, sites: crystal.sites.slice(1) };
	assert.equal(matchingRecipe(edited), undefined, "a catalog key cannot approve an edited crystal");
	const aqueous = catalogAqueousStructure(bicarbonate);
	assert.ok(aqueous);
	assert.equal(matchingRecipe(readStructure(JSON.parse(JSON.stringify(aqueous))))?.name, bicarbonate);
	assert.deepEqual(aqueousComponents(aqueous).map(ion => [ion.label, ion.charge]), [["Na⁺", 1], ["HCO₃⁻", -1]]);
	assert.equal(aqueous.atoms.filter(atom => atom.atomicNumber === 1).length, 1);
});

test("bicarbonate and carbonate use the same family with distinct sodium stoichiometry", () => {
	const solution = dose(bicarbonate, 100, 0.1);
	near(Simulation.getpH(solution), 8.34, 0.04);
	const sodium = solution._activeMolecules.find(molecule => molecule.smilesString === "[Na+]");
	near(solution._molProperties[sodium._id + "n"], 0.01, 1e-10);
	const result = Simulation.getPolyproticEquilibrium(solution);
	assert.ok(result.species.some(species => species.charge === -1 && species.fraction > 0.97));
	const restored = prepareMixtureDose(JSON.parse(JSON.stringify(snapshotMixture(solution))), loadMoleculeDefinition)(100);
	near(Simulation.getpH(restored), Simulation.getpH(solution), 0.001);

	// One equivalent of acid turns carbonate into bicarbonate; one equivalent
	// of base turns bicarbonate into carbonate, without a second acid family.
	const acidifiedCarbonate = mix(dose(carbonate, 100, 0.1), dose("Salzsäure (1 mol/L)", 100, 0.1));
	const dilutedBicarbonate = mix(dose(bicarbonate, 100, 0.1), dose("Wasser", 100, 1));
	near(Simulation.getpH(acidifiedCarbonate), Simulation.getpH(dilutedBicarbonate));
	const basifiedBicarbonate = mix(dose(bicarbonate, 100, 0.1), dose("Natronlauge (1 mol/L)", 100, 0.1));
	const dilutedCarbonate = mix(dose(carbonate, 100, 0.1), dose("Wasser", 100, 1));
	near(Simulation.getpH(basifiedBicarbonate), Simulation.getpH(dilutedCarbonate));
});

test("acidified bicarbonate and carbonate evolve the same CO₂ for equal carbon and the right acid equivalents", () => {
	// Both end with the same carbon, sodium, chloride, volume and excess acid.
	const fromBicarbonate = mix(dose(bicarbonate, 100, 0.2), dose("Salzsäure (1 mol/L)", 100, 0.5),
		dose("Natronlauge (1 mol/L)", 100, 0.2));
	const fromCarbonate = mix(dose(carbonate, 100, 0.2), dose("Salzsäure (1 mol/L)", 100, 0.5),
		dose("Wasser", 100, 1));
	const gas = fromBicarbonate.evolvedGas.get("CO2") ?? 0;
	assert.ok(gas > 0.005 && gas < 0.02, `CO₂ amount ${gas}`);
	near(gas, fromCarbonate.evolvedGas.get("CO2") ?? 0, 1e-5);
	near(Simulation.getpH(fromBicarbonate), Simulation.getpH(fromCarbonate));
	const before = fromBicarbonate.evolvedGas.get("CO2");
	Simulation.sSolvation(fromBicarbonate);
	near(fromBicarbonate.evolvedGas.get("CO2"), before, 1e-8);
});
