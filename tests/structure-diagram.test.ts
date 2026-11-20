import { strict as assert } from "node:assert";
import { gridCell } from "../molecule-builder/canvas-grid";
import { catalogStructures } from "../molecule-builder/catalog";
import { canBond, formula } from "../molecule-builder/geometry";
import {
	chemicalFormula, crystalSpecies, editableRepeatUnit, electronDots, empiricalCrystalFormula, freeCrystalSite, lewisDiagram, monatomicCharge,
} from "../molecule-builder/structure-diagram";
import { newCrystal, readStructure, type Crystal, type Molecule } from "../molecule-builder/structure";

assert.deepEqual(gridCell(22), { length: 1, pixels: 22 });
assert.deepEqual(gridCell(11), { length: 2, pixels: 22 });
assert.deepEqual(gridCell(4.5), { length: 5, pixels: 22.5 });
assert.deepEqual(gridCell(123), { length: .2, pixels: 24.6 });
assert.equal(gridCell(0), undefined);
assert.equal(gridCell(Infinity), undefined);

const molecule = (name: string) => catalogStructures(name)[0] as Molecule;
const crystal = (name: string) => catalogStructures(name)[0] as Crystal;

const water = lewisDiagram(molecule("Wasser"));
assert.deepEqual(water.atoms.map(atom => atom.oxidation), [-2, 1, 1]);
assert.deepEqual(water.atoms.map(atom => atom.electrons), [4, 0, 0]);
assert.equal(electronDots([0, 0], [[1, 0], [-1, 0]], 4).length, 4);
assert.equal(electronDots([0, 0], [], 3).length, 3);
assert.deepEqual(lewisDiagram(molecule("Sauerstoff")).atoms.map(atom => atom.oxidation), [0, 0]);
const peroxide = lewisDiagram(molecule("Wasserstoffperoxidlösung"));
assert.deepEqual(peroxide.atoms.filter(atom => atom.atomicNumber === 8).map(atom => atom.oxidation), [-1, -1]);
assert.deepEqual(lewisDiagram(molecule("Ethanol")).atoms.filter(atom => atom.atomicNumber === 6).map(atom => atom.oxidation).sort(), [-1, -3]);

const sodium = crystal("Natriumchlorid");
assert.equal(empiricalCrystalFormula(sodium), "NaCl");
assert.deepEqual(crystalSpecies(sodium).map(group => group.label), ["Na⁺", "Cl⁻"]);
assert.equal(crystal("Kupfer(II)-sulfat-Pentahydrat").sites.find(site => site.ion === "Cu²⁺").charge, 0);
assert.equal(monatomicCharge(crystal("Kupfer(II)-sulfat-Pentahydrat").sites.find(site => site.ion === "Cu²⁺")), 2);
assert.equal(monatomicCharge(crystal("Kupfer(II)-sulfat-Pentahydrat").sites.find(site => site.ion === "SO₄²⁻")), 0);
assert.equal(chemicalFormula("CuSO4·5H2O"), "CuSO₄·5H₂O");
assert.ok(sodium.sites.every(site => site.fractional.some((coordinate, axis) => coordinate !== freeCrystalSite(sodium.sites)[axis])));

const draft = newCrystal();
draft.sites = [
	{ id: 1, atomicNumber: 20, charge: 2, fractional: [0, 0, 0] },
	{ id: 2, atomicNumber: 17, charge: -1, fractional: [.5, .5, .5] },
	{ id: 3, atomicNumber: 17, charge: -1, fractional: [.25, .25, .25] },
];
assert.equal(empiricalCrystalFormula(draft), "CaCl₂");
draft.sites[2].occupancy = .5;
assert.equal(empiricalCrystalFormula(draft), "Ca₂Cl₃");

const expected = new Map([
	["Stärke", "C6H10O5"], ["Cellulose", "C6H10O5"], ["Polyethylen (PE)", "C2H4"], ["Polypropylen (PP)", "C3H6"],
	["Polystyrol (PS)", "C8H8"], ["Polyvinylchlorid (PVC)", "C2H3Cl"], ["Polyethylenterephthalat (PET)", "C10H8O4"],
	["Polymilchsäure (PLA)", "C3H4O2"], ["Polyamid 6", "C6H11NO"],
]);
for (const [name, composition] of expected) {
	const reference = molecule(name);
	const diagram = lewisDiagram(reference);
	const copy = editableRepeatUnit(reference);
	assert.equal(formula(copy), composition, name);
	assert.equal(copy.atoms.length, diagram.atoms.length, name);
	assert.ok(reference.atoms.length > copy.atoms.length, name);
	assert.equal(diagram.atoms.reduce((sum, atom) => sum + atom.oxidation, 0), 0, name);
	assert.deepEqual((readStructure(JSON.parse(JSON.stringify(copy))) as Molecule).repeatUnit, copy.repeatUnit, name);
}

const pet = editableRepeatUnit(molecule("Polyethylenterephthalat (PET)"));
assert.equal(pet.bonds.filter(bond => bond.order === 2).length, 5);
const polystyrene = editableRepeatUnit(molecule("Polystyrol (PS)"));
assert.equal(polystyrene.bonds.filter(bond => bond.order === 2).length, 3);
const pe = editableRepeatUnit(molecule("Polyethylen (PE)"));
const appended = { id: 900, atomicNumber: 1, charge: 0, diagram: [0, 0] as const, position: [0, 0, 0] as const };
assert.equal(canBond({ ...pe, atoms: [...pe.atoms, appended] }, pe.repeatUnit.ends[0], appended.id, 1), false);

const complex = catalogStructures("Tollens-Reagenz")[0] as Molecule;
assert.equal(complex.bonds.filter(bond => bond.dative).length, 2);
assert.equal(lewisDiagram(complex).atoms.find(atom => atom.atomicNumber === 47).oxidation, 1);
assert.deepEqual(lewisDiagram(complex).atoms.filter(atom => atom.atomicNumber === 7).map(atom => atom.electrons), [0, 0]);
