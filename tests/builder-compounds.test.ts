import assert from "node:assert/strict";
import { test } from "node:test";
import { Simulation } from "../chemlib";
import { readIupacDissociation } from "../chemlib/IupacDissociation";
import { bondKind, canAssociateIons, ionicCharges } from "../molecule-builder/bond-types";
import { analyzeBuilderCompound, builderStock, builderStockFor, enrichBuilderCompound, hydrateBuilderChemical,
	portableBuilderChemical, readBuilderChemical, resolveDissociation } from "../molecule-builder/custom-compounds";
import { electronRegions } from "../molecule-builder/geometry";
import { lewisDiagram } from "../molecule-builder/structure-diagram";
import { readStructure, type Bond, type Molecule } from "../molecule-builder/structure";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { snapshotMixture } from "../data/savedMixtures";

function molecule(numbers: number[], bonds: Bond[]): Molecule {
	return {
		version: 1, kind: "molecule", name: "", bonds,
		atoms: numbers.map((atomicNumber, index) => ({ id: index + 1, atomicNumber, charge: 0,
			diagram: [index, 0], position: [index, 0, 0] })),
	};
}

const edge = (from: number, to: number, order: Bond["order"] = 1): Bond => ({ from, to, order });
const tfa = molecule([6, 6, 8, 8, 9, 9, 9],
	[edge(1, 2), edge(2, 3, 2), edge(2, 4), edge(1, 5), edge(1, 6), edge(1, 7)]);

test("automatic mode distinguishes ionic MgCl₂ from polar covalent HCl", () => {
	const salt = molecule([12, 17, 17], []);
	assert.equal(bondKind(salt, 1, 2, "auto"), "ionic");
	assert.equal(canAssociateIons(salt, 1, 2), true);
	salt.bonds.push({ ...edge(1, 2), kind: "ionic" }, { ...edge(1, 3), kind: "ionic" });
	assert.deepEqual([...ionicCharges(salt).values()], [2, -1, -1]);
	assert.deepEqual(lewisDiagram(salt).atoms.map(atom => atom.charge), [2, -1, -1]);
	assert.equal(electronRegions(salt).some(region => region.kind === "bond"), false);
	assert.equal(analyzeBuilderCompound(salt).classification, "salt");
	assert.equal(analyzeBuilderCompound(salt).solutes.length, 3);
	assert.deepEqual(readStructure(JSON.parse(JSON.stringify(salt))).bonds, salt.bonds);
	assert.equal(bondKind(molecule([1, 17], []), 1, 2, "auto"), "covalent");
	assert.equal(bondKind(molecule([6, 9], []), 1, 2, "auto"), "covalent");
});

test("lookup uses exact SMILES and measured pKa drives the pH of a saved stock and mixture", async t => {
	const analysis = analyzeBuilderCompound(tfa);
	assert.equal(analysis.classification, "acid");
	assert.equal(analysis.acidSites, 1);
	assert.equal(analysis.formula, "C2HF3O2");
	assert.match(analysis.smiles, /F/);
	assert.equal(builderStock(analysis, .1), undefined);
	const fetch = t.mock.method(globalThis, "fetch", async (url: string) => {
		if (url.includes("/rest/pug/compound/smiles/")) {
			assert.ok(url.includes(encodeURIComponent(analysis.smiles)));
			return { ok: true, json: async () => ({ PropertyTable: { Properties: [
				{ CID: 6422, Title: "Trifluoroacetic acid", MolecularWeight: "114.02", MolecularFormula: "C2HF3O2" },
			] } }) };
		}
		assert.match(url, /compound\/6422\/JSON\?heading=Dissociation/);
		return { ok: true, json: async () => ({ Record: {
			Reference: [{ ReferenceNumber: 35, SourceName: "Experimental reference" }],
			Section: [{ TOCHeading: "Chemical and Physical Properties", Section: [{ TOCHeading: "Dissociation Constants",
				Information: [{ ReferenceNumber: 35, Value: { StringWithMarkup: [{ String: "pKa = 0.3" }] } }] }] }],
		} }) };
	});
	const facts = await enrichBuilderCompound(analysis);
	assert.equal(fetch.mock.callCount(), 2);
	assert.equal(facts.metadata.name, "Trifluoroacetic acid");
	assert.deepEqual(facts.dissociation, { pKa: [.3], step: 0 });
	const stock = builderStock(analysis, .1, facts);
	const solution = prepareDose(stock, loadMoleculeDefinition)(10);
	assert.ok(Math.abs(Simulation.getpH(solution) - 1.07) < .02);
	const equilibrium = Simulation.getPolyproticEquilibrium(solution);
	assert.ok(equilibrium.species.some(species => species.charge === -1 && species.formula.includes("F")));
	const saved = readBuilderChemical(JSON.parse(JSON.stringify(portableBuilderChemical({
		key: "builder-chemical:test", structure: tfa, stockConcentration: .1, facts,
	}))), 0);
	assert.equal(saved.recipe, undefined);
	const hydrated = hydrateBuilderChemical(saved);
	const restored = prepareDose(builderStockFor(hydrated), loadMoleculeDefinition)(10);
	assert.equal(Simulation.getpH(restored), Simulation.getpH(solution));
	const mixture = prepareDose(JSON.parse(JSON.stringify(snapshotMixture(solution))), loadMoleculeDefinition)(10);
	assert.equal(Simulation.getpH(mixture), Simulation.getpH(solution));
});

test("an unmatched amine uses conjugate-acid pKa, and ambiguous or nonaqueous data stay unresolved", () => {
	const pyridine = analyzeBuilderCompound(molecule([7, 6, 6, 6, 6, 6],
		[edge(1, 2, 2), edge(2, 3), edge(3, 4, 2), edge(4, 5), edge(5, 6, 2), edge(6, 1)]));
	assert.equal(pyridine.classification, "base");
	const facts = resolveDissociation([{ text: "pKa = 5.23", name: "", source: "HSDB" }], pyridine);
	assert.deepEqual(facts.dissociation, { pKa: [5.23], step: 1 });
	const solution = prepareDose(builderStock(pyridine, .1, facts), loadMoleculeDefinition)(10);
	assert.ok(Math.abs(Simulation.getpH(solution) - 9.115) < .02);
	assert.deepEqual(resolveDissociation([{ text: "pKa = 4.5 in DMSO", name: "", source: "example" }], pyridine), {});
	assert.deepEqual(resolveDissociation([{ text: "pKb = 12", name: "", source: "example" }], pyridine), {});
	const amide = analyzeBuilderCompound(molecule([6, 6, 8, 7], [edge(1, 2), edge(2, 3, 2), edge(2, 4)]));
	assert.equal(amide.classification, "other");
});

test("the IUPAC fallback uses one complete aqueous experimental series for the exact InChI", () => {
	const csv = [
		"unique_ID,InChI,pka_type,pka_value,T,assessment,ref,remarks,cosolvent,pressure",
		'a,InChI=1S/test-acid,pKa1,3.6,25,Reliable,one,"notes, with a line\nbreak",,',
		'a,InChI=1S/test-acid,pKa2,5.0,25,Reliable,one,"notes, with a line\nbreak",,',
		"a,InChI=1S/test-acid,pKa1,4.2,25,Reliable,another,,ethanol,",
		"a,InChI=1S/test-acid,pKa2,6.2,25,Reliable,another,,ethanol,",
		"b,InChI=1S/other-acid,pKa1,1.1,25,Reliable,one,,,",
	].join("\n");
	assert.deepEqual(readIupacDissociation(csv, "InChI=1S/test-acid", 2, 0), { pKa: [3.6, 5], step: 0 });
	assert.equal(readIupacDissociation(csv, "InChI=1S/other-acid", 2, 0), undefined);
});
