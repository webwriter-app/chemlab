import { strict as assert } from "node:assert";
import { catalogAqueousStructure, catalogIsMixture, catalogStructures, matchingRecipe, structureCatalog } from "../molecule-builder/catalog";
import { crystalIonColors, crystalRadii, latticePositions, siteIon } from "../molecule-builder/crystal-display";
import { canBond, dot, electronRegions, fitGeometry, shapeName, subtract } from "../molecule-builder/geometry";
import { atomRadius, estimatedBondLength, spaceFillingRadius } from "../molecule-builder/radii";
import { hasMolecularDisplays, moleculeOrbitals, unpackOrbitalSurface } from "../molecule-builder/orbitals";
import { atomicShells, atomicSpecies, electronConfiguration, orbitalOccupation, orbitalOrientations } from "../molecule-builder/atomic-configuration";
import { angularOrbital, atomicFamilyParts, atomicOrbitalField, atomicOrbitalMesh, atomicOrbitalSlice, atomicOverlayParts } from "../molecule-builder/atomic-orbitals";
import { ELEMENTS, categoryOf } from "../periodic-table/element-reference";
import { metalCrystal } from "../periodic-table/metal-reference";
import { cartesian, cellVectors, fractional, newMolecule, readStructure, replicatedSites, type Crystal, type Molecule } from "../molecule-builder/structure";

const waterReference = catalogStructures("Wasser")[0] as Molecule;
assert.equal(waterReference.geometry, "supplied");
assert.equal(waterReference.representation, "experimental");
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
assert.deepEqual(new Set(salt.sites.map(siteIon)), new Set(["Na⁺", "Cl⁻"]));
assert.notEqual(crystalIonColors(salt).get("Na⁺"), crystalIonColors(salt).get("Cl⁻"));
assert.deepEqual(crystalIonColors(readStructure(JSON.parse(JSON.stringify(salt))) as Crystal), crystalIonColors(salt));
assert.equal(latticePositions(salt, 1).length, 14);
assert.equal(latticePositions(salt, 2).length, 63);
assert.equal(latticePositions(metalCrystal(26), 1).length, 9);
assert.equal(latticePositions(metalCrystal(80), 1).length, 8);
assert.equal(latticePositions(catalogStructures("Calciumcarbonat")[0] as Crystal, 1).length, 10);
assert.equal(latticePositions(catalogStructures("Calciumsulfat-Dihydrat")[0] as Crystal, 1).length, 9);
const hydratedCopperSulfate = catalogStructures("Kupfer(II)-sulfat-Pentahydrat")[0] as Crystal;
assert.equal(hydratedCopperSulfate.sites.filter(site => site.atomicNumber === 8 && siteIon(site) === "SO₄²⁻").length, 8);
assert.equal(hydratedCopperSulfate.sites.filter(site => site.atomicNumber === 8 && !siteIon(site)).length, 10);
assert.deepEqual(new Set(hydratedCopperSulfate.sites.filter(site => site.ion).map(site => site.ion)), new Set(["Cu²⁺", "SO₄²⁻"]));
const centralIon = cartesian(cellVectors(salt.cell), salt.sites.find(site => site.charge === 1)
	.fractional.map(value => value + 1) as [number, number, number]);
const neighbors = replicatedSites(salt, 3).filter(({ site, position }) => site.charge === -1
	&& Math.abs(Math.hypot(...position.map((value, index) => value - centralIon[index])) - salt.cell.lengths[0] / 2) < .0001);
assert.equal(neighbors.length, 6);
const sodium = salt.sites.find(site => site.charge === 1);
const chloride = salt.sites.find(site => site.charge === -1);
assert.deepEqual(crystalRadii(salt).get(sodium.id), { pm: 102, model: "ionic", coordination: 6 });
assert.deepEqual(crystalRadii(salt).get(chloride.id), { pm: 181, model: "ionic", coordination: 6 });
assert.equal(crystalRadii({ ...salt, catalogKey: undefined }).get(chloride.id)?.model, "schematic");
const oxide = catalogStructures("Magnesiumoxid")[0] as Crystal;
assert.equal(crystalRadii(oxide).get(oxide.sites.find(site => site.atomicNumber === 8).id)?.pm, 140);
const copper = metalCrystal(29);
assert.ok(Math.abs(crystalRadii(copper).get(copper.sites[0].id).pm - 128) < 2);
assert.equal(atomRadius(6).pm, 76);
assert.deepEqual(spaceFillingRadius(6), { pm: 170, model: "vdw" });
assert.deepEqual(spaceFillingRadius(8), { pm: 152, model: "vdw" });
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

const bondDistance = (molecule: Molecule, index = 0) => {
	const bond = molecule.bonds[index];
	return Math.hypot(...subtract(molecule.atoms.find(atom => atom.id === bond.from).position,
		molecule.atoms.find(atom => atom.id === bond.to).position));
};
for (const [key, expected] of [["Wasser", .958], ["Methan", 1.087], ["Kohlenstoffdioxid", 1.1621],
	["Ethen", 1.339], ["Ethin", 1.2026], ["Wasserstoff", .7414], ["Stickstoff", 1.098], ["Sauerstoff", 1.208]] as const) {
	const molecule = catalogStructures(key)[0] as Molecule;
	assert.equal(molecule.representation, "experimental");
	assert.ok(Math.abs(bondDistance(molecule) - expected) < .0003, key);
}
for (const [key, expected] of [["Wasserstoff", .7414], ["Stickstoff", 1.098], ["Sauerstoff", 1.208]] as const) {
	assert.ok(Math.abs(bondDistance(fitGeometry(catalogStructures(key)[0] as Molecule)) - expected) < 1e-9);
}
assert.equal(estimatedBondLength(6, 6, 1), 1.50);
assert.equal(estimatedBondLength(6, 6, 2), 1.34);
assert.equal(estimatedBondLength(6, 6, 3), 1.20);

assert.equal(hasMolecularDisplays(salt), false);
assert.equal(hasMolecularDisplays(catalogAqueousStructure("Natriumchloridlösung (1 mol/L)")), false);
assert.equal(hasMolecularDisplays({ ...water, bonds: water.bonds.slice(0, 1) }), false);
assert.ok(hasMolecularDisplays(waterReference));
const waterOrbitals = moleculeOrbitals(waterReference);
assert.equal(waterOrbitals[0].kind, "reference");
assert.equal(moleculeOrbitals(water)[0].kind, "sigma");
// Imported geometries with a different conformer must never get an archived surface.
assert.equal(moleculeOrbitals({ ...waterReference, atoms: water.atoms })[0].kind, "sigma");
const triple = moleculeOrbitals(fitGeometry(catalogStructures("Ethin")[0] as Molecule));
const perpendicularPi = triple.filter(item => item.kind === "pi");
assert.equal(perpendicularPi.length, 2);
const directions = perpendicularPi.map(orbital => subtract(orbital.lobes[0].center, orbital.lobes[1].center));
assert.ok(Math.abs(dot(directions[0], directions[1])) < 1e-9);
const oxygenReference = catalogStructures("Sauerstoff")[0] as Molecule;
const oxygenOrbitals = moleculeOrbitals(oxygenReference);
assert.deepEqual(moleculeOrbitals(fitGeometry(oxygenReference)), []);
assert.deepEqual(oxygenOrbitals.map(orbital => orbital.kind === "reference" && orbital.label), ["somo", "somo-1"]);
for (const orbital of [...waterOrbitals, ...oxygenOrbitals]) {
	assert.ok(orbital.kind === "reference");
	for (const phase of orbital.phases) {
		if (!phase) continue;
		const { positions, indices, normals } = unpackOrbitalSurface(phase);
		assert.ok(positions.length > 20 && positions.every(Number.isFinite));
		assert.ok(indices.every(index => index < positions.length / 3));
		assert.equal(normals.length, positions.length);
	}
}

for (const { atomicNumber, symbol } of ELEMENTS) {
	const configuration = electronConfiguration(atomicNumber, 0);
	assert.equal(configuration.subshells.reduce((sum, orbital) => sum + orbital.electrons, 0), atomicNumber, symbol);
	assert.ok(configuration.subshells.every(({ n, l, electrons }) => n > l && electrons <= 2 * (2 * l + 1)), symbol);
}
assert.equal(electronConfiguration(24, 0).text, "[Ar] 3d5 4s1");
assert.equal(electronConfiguration(26, 2).text, "[Ar] 3d6");
assert.equal(electronConfiguration(17, -1).subshells.find(orbital => orbital.label === "3p").electrons, 6);
assert.equal(electronConfiguration(118, 0).predicted, true);
assert.equal(electronConfiguration(8, -2).formal, true);
assert.deepEqual(electronConfiguration(1, 1).subshells, []);
assert.equal(electronConfiguration(8, -7).text, "");
assert.deepEqual(atomicSpecies(salt, sodium.id), { atomicNumber: 11, charge: 1, boundReference: false });
const polyatomic = hydratedCopperSulfate.sites.find(site => site.atomicNumber === 8 && site.ion === "SO₄²⁻");
assert.deepEqual(atomicSpecies(hydratedCopperSulfate, polyatomic.id), { atomicNumber: 8, charge: 0, boundReference: true });
const chargedBonded = { ...water, atoms: water.atoms.map(atom => atom.id === oxygen.id ? { ...atom, charge: -1 } : atom) };
assert.deepEqual(atomicSpecies(chargedBonded, oxygen.id), { atomicNumber: 8, charge: 0, boundReference: true });
assert.deepEqual([0, 1, 2, 3].map(l => orbitalOrientations(l).length), [1, 3, 5, 7]);
assert.equal(angularOrbital(1, 0, 1, 0, 0), 0);
assert.equal(angularOrbital(1, 0, 0, 0, -1), -1);
assert.equal(angularOrbital(2, 4, 1, 0, 0), 0);
assert.ok(angularOrbital(3, 4, 1, 1, -1) < 0);
assert.ok(atomicOrbitalField(2, 0, 0, 0).value(0, 0, 0) > 0);
assert.ok(atomicOrbitalField(2, 0, 0, 1).value(.5, 0, 0) < 0);
const hydrogen = { atomicNumber: 1, atomId: 1, electrons: 1, subshell: electronConfiguration(1, 0).subshells[0],
	orientation: 0, region: 0 };
const { phases, extent, physical } = atomicOrbitalMesh(hydrogen);
assert.ok(physical);
assert.equal(phases[1], undefined);
assert.ok(phases[0].positions.length > 100 && phases[0].indices.length > 300);
assert.ok(phases[0].indices.every(index => index < phases[0].positions.length / 3));
const contourRadius = phases[0].positions.reduce((max, value) => Math.max(max, Math.abs(value)), 0) * extent;
assert.ok(Math.abs(contourRadius + .5291772109 * Math.log(.2)) < .005);
const f = { atomicNumber: 92, atomId: 1, electrons: 92, subshell: electronConfiguration(92, 0).subshells.find(s => s.label === "5f"),
	orientation: 4, region: 1 };
assert.ok(atomicOrbitalSlice(f).paths.every(path => path.length > 0));

const oxygenSubshells = electronConfiguration(8, 0).subshells;
const oxygenOverlay = atomicOverlayParts(oxygenSubshells);
assert.deepEqual(oxygenOverlay.map(part => part.key), ["1s:0:0", "2s:0:0", "2s:0:1", "2p:0:0", "2p:1:0", "2p:2:0"]);
assert.ok(oxygenOverlay[1].scale < oxygenOverlay[2].scale);
assert.equal(oxygenOverlay[3].scale, oxygenOverlay[4].scale);
assert.equal(atomicOverlayParts(oxygenSubshells), oxygenOverlay);
const orbital = { atomicNumber: 8, atomId: 1, electrons: 8,
	subshell: oxygenSubshells.find(shell => shell.label === "2p"), orientation: 1, region: 0 };
const sliceOverlay = atomicOrbitalSlice(orbital, oxygenOverlay);
assert.ok(sliceOverlay.paths.every(path => path.length > 0));
assert.ok(sliceOverlay.background.every(path => path.length > 0));
const heavyParts = atomicOverlayParts(electronConfiguration(118, 0).subshells);
assert.ok(heavyParts.length > 80 && heavyParts.every(part => part.scale > 0 && part.scale <= 1));

assert.deepEqual(atomicShells(electronConfiguration(26, 0)).map(shell => shell.electrons), [2, 8, 14, 2]);
assert.deepEqual(atomicShells(electronConfiguration(11, 1)).map(shell => shell.label), ["K", "L"]);
const carbonP = electronConfiguration(6, 0).subshells.find(shell => shell.label === "2p");
assert.deepEqual(atomicFamilyParts(carbonP, 0).map(part => orbitalOccupation(carbonP, part.orientation)), [1, 1, 0]);
const oxygenP = oxygenSubshells.find(shell => shell.label === "2p");
assert.deepEqual(atomicFamilyParts(oxygenP, 0).map(part => orbitalOccupation(oxygenP, part.orientation)), [2, 1, 1]);
const ironD = electronConfiguration(26, 0).subshells.find(shell => shell.label === "3d");
assert.deepEqual(atomicFamilyParts(ironD, 0).map(part => orbitalOccupation(ironD, part.orientation)), [2, 1, 1, 1, 1]);

assert.deepEqual(electronConfiguration(6, 0).valence.map(shell => shell.label), ["2s", "2p"]);
assert.deepEqual(electronConfiguration(26, 0).valence.map(shell => shell.label), ["3d", "4s"]);
assert.deepEqual(electronConfiguration(92, 0).valence.map(shell => shell.label), ["5f", "6d", "7s"]);
assert.deepEqual(electronConfiguration(11, 1).valence.map(shell => shell.label), ["2s", "2p"]);
assert.deepEqual(electronConfiguration(1, 0).valence.map(shell => shell.label), ["1s"]);
