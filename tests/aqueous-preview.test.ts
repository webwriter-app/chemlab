import { strict as assert } from "node:assert";
import { catalogAqueousStructure, matchingRecipe, structureCatalog } from "../molecule-builder/catalog";
import { aqueousComponents, hydrationWaters } from "../molecule-builder/aqueous-preview";
import { diagramIsCrowded, repairSavedDiagram } from "../molecule-builder/diagram-layout";
import { fitGeometry, subtract } from "../molecule-builder/geometry";
import { lewisDiagram } from "../molecule-builder/structure-diagram";
import { newMolecule, readStructure, type Molecule } from "../molecule-builder/structure";

const sodium = catalogAqueousStructure("Natriumchloridlösung (1 mol/L)");
const [cation, anion] = aqueousComponents(sodium);
assert.deepEqual([cation.label, anion.label], ["Na⁺", "Cl⁻"]);
assert.equal(sodium.bonds.length, 0);
assert.equal(matchingRecipe(readStructure(JSON.parse(JSON.stringify(sodium))))?.name, sodium.catalogKey);
assert.equal(catalogAqueousStructure("Wasserstoffperoxidlösung"), undefined);
assert.equal(catalogAqueousStructure("Natriumchlorid"), undefined);
assert.equal(catalogAqueousStructure("Wasser"), undefined);
assert.deepEqual(aqueousComponents(catalogAqueousStructure("Kalkwasser")).map(component => component.label), ["Ca²⁺", "OH⁻"]);
assert.deepEqual(aqueousComponents(catalogAqueousStructure("Schwefelsäure (1 mol/L)")).map(component => component.label), ["H₃O⁺", "HSO₄⁻", "SO₄²⁻"]);

for (const entry of structureCatalog) {
	const weakAcid = entry.category === "Carbonsäuren" && entry.concentrationLimit;
	if ((!entry.recipe?.aqueousMolar && !weakAcid) || entry.name === "Wasserstoffperoxidlösung") continue;
	const preview = catalogAqueousStructure(entry.name);
	assert.ok(preview, entry.name);
	const components = aqueousComponents(preview);
	assert.ok(components.some(component => component.charge > 0), entry.name);
	assert.ok(components.some(component => component.charge < 0), entry.name);
	for (const ion of components.filter(component => component.charge)) {
		for (const dimensions of [2, 3] as const) assert.ok(hydrationWaters(ion, dimensions).length > 0, ion.label);
	}
}

for (const dimensions of [2, 3] as const) {
	const catWaters = hydrationWaters(cation, dimensions);
	assert.ok(catWaters.every(water => water.contact.kind === "ion-dipole"));
	const anWaters = hydrationWaters(anion, dimensions);
	assert.ok(anWaters.every(water => water.contact.kind === "hydrogen"));
	for (const [waters, ion] of [[catWaters, cation], [anWaters, anion]] as const) {
		const atom = ion.atoms[0];
		const center = dimensions === 2 ? [...atom.diagram, 0] as const : atom.position;
		for (const water of waters) {
			assert.ok(water.hydrogens.every(h => Math.abs(Math.hypot(...subtract(h, water.oxygen)) - .96) < 1e-9));
			const hDistance = Math.hypot(...subtract(water.hydrogens[0], center));
			const oDistance = Math.hypot(...subtract(water.oxygen, center));
			assert.equal(hDistance > oDistance, ion.charge > 0);
		}
	}
}

const draft: Molecule = {
	...newMolecule(),
	atoms: [6, 17, 1, 1, 1].map((atomicNumber, index) => ({
		id: index + 1, atomicNumber, charge: 0, diagram: ([
			[0, 0], [-.8, .85], [.48, -.68], [.56, -.75], [.70, -.93],
		] as const)[index], position: [0, 0, 0],
	})),
	bonds: [2, 3, 4, 5].map(to => ({ from: 1, to, order: 1 })),
};
const crowded = fitGeometry(draft);
assert.equal(diagramIsCrowded(crowded), true);
const repaired = repairSavedDiagram(crowded);
assert.equal(diagramIsCrowded(repaired), false);
assert.deepEqual(repaired.atoms.map(atom => atom.position), crowded.atoms.map(atom => atom.position));
assert.deepEqual(lewisDiagram(repaired).atoms.map(atom => atom.oxidation), [-2, -1, 1, 1, 1]);
assert.deepEqual(lewisDiagram(repaired).atoms.map(atom => atom.electrons), [0, 6, 0, 0, 0]);
assert.equal(repairSavedDiagram(repaired), repaired);
