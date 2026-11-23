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

const bicarbonate = "Natriumhydrogencarbonat";
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

test("the archived bicarbonate crystal selects a recipe with an explicit proton and aqueous ions", () => {
	const [crystal] = catalogStructures(bicarbonate);
	assert.equal(crystal.kind, "crystal");
	assert.equal(matchingRecipe(readStructure(JSON.parse(JSON.stringify(crystal))))?.name, bicarbonate);
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
