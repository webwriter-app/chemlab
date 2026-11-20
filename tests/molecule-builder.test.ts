import { strict as assert } from "node:assert";
import { catalogIsMixture, catalogStructures, matchingRecipe, structureCatalog } from "../molecule-builder/catalog";
import { atomRadius, canBond, electronRegions, fitGeometry, shapeName } from "../molecule-builder/geometry";
import { ELEMENTS, categoryOf } from "../periodic-table/element-reference";
import { metalCrystal } from "../periodic-table/metal-reference";
import { cartesian, cellVectors, fractional, newMolecule, readStructure, replicatedSites, type Crystal, type Molecule } from "../molecule-builder/structure";

const waterReference = catalogStructures("Wasser")[0] as Molecule;
assert.equal(waterReference.geometry, "supplied");
assert.equal(waterReference.representation, "conformer");
const water = fitGeometry(waterReference);
assert.equal(water.geometry, "idealized");
const oxygen = water.atoms.find(atom => atom.atomicNumber === 8);
assert.equal(shapeName(water, oxygen.id), "bent");
const [h1, h2] = water.atoms.filter(atom => atom.atomicNumber === 1);
const vectors = [h1, h2].map(atom => atom.position.map((value, index) => value - oxygen.position[index]));
const angle = Math.acos(vectors[0].reduce((dot, coordinate, index) => dot + coordinate * vectors[1][index], 0)
	/ Math.hypot(...vectors[0]) / Math.hypot(...vectors[1])) * 180 / Math.PI;
assert.ok(Math.abs(angle - 109.47) < .02);
const valence = electronRegions(waterReference);
assert.deepEqual(valence.filter(region => region.kind === "lone").map(region => region.electrons), [2, 2]);
assert.deepEqual(valence.filter(region => region.kind === "bond").map(region => region.electrons), [2, 2]);
const fitRing = fitGeometry(catalogStructures("Cyclohexan")[0] as Molecule);
const ringCarbons = fitRing.atoms.filter(atom => atom.atomicNumber === 6);
assert.equal(fitRing.geometry, "estimated");
assert.ok(Math.max(...ringCarbons.map(atom => atom.position[2])) - Math.min(...ringCarbons.map(atom => atom.position[2])) > .08);
const ringPositions = new Map(fitRing.atoms.map(atom => [atom.id, atom.position]));
for (const bond of fitRing.bonds) {
	const from = ringPositions.get(bond.from), to = ringPositions.get(bond.to);
	const length = Math.hypot(...from.map((value, index) => value - to[index]));
	assert.ok(length > .8 && length < 1.8);
}
assert.equal(canBond(water, h1.id, h2.id, 1), false);
assert.deepEqual(readStructure(JSON.parse(JSON.stringify(water))), readStructure(water));
assert.equal(readStructure({ ...water, bonds: [{ from: 1, to: 500, order: 1 }] }), null);
assert.equal(readStructure({ ...water, atoms: [oxygen, oxygen] }), null);
const methane = catalogStructures("Methan")[0] as Molecule;
assert.equal(shapeName(methane, methane.atoms.find(atom => atom.atomicNumber === 6).id), "tetrahedral");
assert.equal(fitGeometry(newMolecule()).geometry, "idealized");

const salt = catalogStructures("Natriumchlorid")[0] as Crystal;
assert.equal(salt.kind, "crystal");
assert.equal(salt.spaceGroup, "Fm-3m");
assert.equal(salt.sites.filter(site => site.charge === 1).length, 4);
assert.equal(salt.sites.filter(site => site.charge === -1).length, 4);
const centralIon = cartesian(cellVectors(salt.cell), salt.sites.find(site => site.charge === 1)
	.fractional.map(value => value + 1) as [number, number, number]);
const neighbors = replicatedSites(salt, 3).filter(({ site, position }) => site.charge === -1
	&& Math.abs(Math.hypot(...position.map((value, index) => value - centralIon[index])) - salt.cell.lengths[0] / 2) < .0001);
assert.equal(neighbors.length, 6);
assert.ok(atomRadius(17, -1).pm > atomRadius(11, 1).pm);
assert.ok(Math.abs(salt.cell.lengths[0] - 5.64) < .03);
assert.equal(readStructure({ ...salt, cell: { ...salt.cell, angles: [150, 30, 30] } }), null);
const cell = cellVectors({ lengths: [3, 4, 5], angles: [85, 72, 115] });
const point = fractional(cell, cartesian(cell, [.2, .3, .4]));
assert.ok(point.every((value, index) => Math.abs(value - [.2, .3, .4][index]) < .000001));
assert.equal(matchingRecipe(salt)?.name, "Natriumchlorid");
assert.equal(matchingRecipe({ ...salt, sites: salt.sites.slice(1) }), undefined);
assert.deepEqual(catalogStructures("Natriumchloridlösung (1 mol/L)").map(model => model.name), ["Na⁺", "Cl⁻"]);
assert.equal(matchingRecipe(catalogStructures("Natriumchloridlösung (1 mol/L)")[0]), undefined);
assert.equal(metalCrystal(25).sites.length, 58);
assert.equal(metalCrystal(26).bravais, "cI");
assert.equal(metalCrystal(29).bravais, "cF");
assert.match(metalCrystal(80).conditions, /solid below/);
assert.equal(metalCrystal(87), null);
assert.equal(metalCrystal(8), undefined);
const metalCategories = new Set(["alkali-metal", "alkaline-earth-metal", "transition-metal", "post-transition-metal", "lanthanide", "actinide"]);
for (const { atomicNumber, symbol } of ELEMENTS) {
	const metal = metalCategories.has(categoryOf(atomicNumber)) || (atomicNumber >= 109 && atomicNumber <= 116);
	const lattice = metalCrystal(atomicNumber);
	assert.equal(lattice !== undefined, metal, symbol);
	if (!lattice) continue;
	assert.ok(readStructure(lattice), symbol);
	assert.ok(lattice.sites.every(site => site.atomicNumber === atomicNumber), symbol);
}
for (const { name } of structureCatalog) {
	const display = catalogStructures(name);
	assert.ok(display.length || catalogIsMixture(name), `Missing classification for ${name}`);
	for (const model of display) {
		assert.ok(readStructure(model), `Invalid structure for ${name}`);
		if (model.kind === "molecule") assert.ok(model.geometry, `Missing geometry for ${name}`);
	}
}
const acetate = catalogStructures("Natriumacetat")[0] as Crystal;
const acetateOxygen = acetate.sites.filter(site => site.atomicNumber === 8).reduce((sum, site) => sum + (site.occupancy ?? 1), 0);
assert.ok(Math.abs(acetateOxygen - 8) < 1e-6);
assert.equal(matchingRecipe(catalogStructures("Haushaltsessig")[0]), undefined);
assert.equal(matchingRecipe({ ...water, atoms: [...water.atoms].reverse(), catalogKey: undefined })?.name, "Wasser");
assert.equal(matchingRecipe({ ...water, atoms: water.atoms.map(atom => atom.atomicNumber === 8 ? { ...atom, isotope: 18 } : atom) }), undefined);
