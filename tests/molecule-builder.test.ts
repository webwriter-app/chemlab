import { strict as assert } from "node:assert";
import { catalogStructures, matchingRecipe, structureCatalog } from "../molecule-builder/catalog";
import { atomRadius, canBond, fitGeometry, shapeName } from "../molecule-builder/geometry";
import { cartesian, cellVectors, fractional, newMolecule, readStructure, replicatedSites, type Crystal, type Molecule } from "../molecule-builder/structure";

const water = catalogStructures("Wasser")[0] as Molecule;
assert.equal(water.geometry, "idealized");
const oxygen = water.atoms.find(atom => atom.atomicNumber === 8);
assert.equal(shapeName(water, oxygen.id), "bent");
const [h1, h2] = water.atoms.filter(atom => atom.atomicNumber === 1);
const vectors = [h1, h2].map(atom => atom.position.map((value, index) => value - oxygen.position[index]));
const angle = Math.acos(vectors[0].reduce((dot, coordinate, index) => dot + coordinate * vectors[1][index], 0)
	/ Math.hypot(...vectors[0]) / Math.hypot(...vectors[1])) * 180 / Math.PI;
assert.ok(Math.abs(angle - 109.47) < .02);
assert.equal(canBond(water, h1.id, h2.id, 1), false);
assert.deepEqual(readStructure(JSON.parse(JSON.stringify(water))), readStructure(water));
assert.equal(readStructure({ ...water, bonds: [{ from: 1, to: 500, order: 1 }] }), null);
assert.equal(readStructure({ ...water, atoms: [oxygen, oxygen] }), null);
const methane = catalogStructures("Methan")[0] as Molecule;
assert.equal(shapeName(methane, methane.atoms[0].id), "tetrahedral");
assert.equal(fitGeometry(newMolecule()).geometry, "idealized");

const salt = catalogStructures("Natriumchlorid")[0] as Crystal;
assert.equal(salt.kind, "crystal");
assert.equal(salt.spaceGroup, "Fm-3m");
assert.equal(salt.sites.filter(site => site.charge === 1).length, 4);
assert.equal(salt.sites.filter(site => site.charge === -1).length, 4);
const centralIon = cartesian(cellVectors(salt.cell), [1, 1, 1]);
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
assert.ok(structureCatalog.length > 30);
assert.equal(matchingRecipe({ ...water, atoms: [...water.atoms].reverse(), catalogKey: undefined })?.name, "Wasser");
assert.equal(matchingRecipe({ ...water, atoms: water.atoms.map(atom => atom.atomicNumber === 8 ? { ...atom, isotope: 18 } : atom) }), undefined);
