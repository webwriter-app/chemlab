import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
	readStructure,
	withStructureDisplay,
	withoutStructureDisplay,
	type Molecule,
	type StructureDisplay,
} from "../molecule-builder/structure";

const source = readFileSync("webwriter-chemlab-molecule-builder.ts", "utf8");

const molecule: Molecule = {
	version: 1, kind: "molecule", name: "Wasser", atoms: [
		{ id: 1, atomicNumber: 8, charge: 0, diagram: [40, 30], position: [0, 0, 0] },
		{ id: 2, atomicNumber: 1, charge: 0, diagram: [20, 50], position: [0.96, 0, 0] },
		{ id: 3, atomicNumber: 1, charge: 0, diagram: [60, 50], position: [-0.32, 0.9, 0] },
	], bonds: [{ from: 1, to: 2, order: 1 }, { from: 1, to: 3, order: 1 }],
};

const switches: StructureDisplay = { hydration: true, electrons: true, polarity: true };

/**
 * Hydration shells and valence electrons are part of the saved structure, so a
 * teacher can hand a learner a structure that already shows them. The checks
 * keep that field small: only real booleans survive, the chemistry stays
 * untouched, and the edit history never carries a view.
 */

test("a saved structure keeps the view switches it was written with", () => {
	const written = withStructureDisplay(molecule, switches);
	const read = readStructure(JSON.parse(JSON.stringify(written)));
	assert.deepEqual(read?.display, switches);
	assert.equal(read?.kind, "molecule");
	assert.equal(read?.kind === "molecule" ? read.atoms.length : 0, 3);
	// Without the field the structure is just as valid; the switches simply start off.
	assert.equal(readStructure(JSON.parse(JSON.stringify(molecule)))?.display, undefined);
});

test("only real booleans count as a switch", () => {
	const fuzzy = readStructure({ ...molecule, display: { hydration: "yes" } });
	assert.equal(fuzzy?.display, undefined);
	const mixed = readStructure({ ...molecule, display: { hydration: false, electrons: 1 } });
	assert.deepEqual(mixed?.display, { hydration: false });
	assert.equal(readStructure({ ...molecule, display: [] })?.display, undefined);
	assert.equal(readStructure({ ...molecule, display: "on" })?.display, undefined);
	// An explicit "off" is a decision and has to survive the round trip.
	const off = readStructure(JSON.parse(JSON.stringify(withStructureDisplay(molecule, { hydration: false }))));
	assert.deepEqual(off?.display, { hydration: false });
});

test("the view leaves the edit history alone but stays in the document", () => {
	const withView = withStructureDisplay(molecule, switches);
	const chemistry = withoutStructureDisplay(withView);
	assert.equal("display" in chemistry, false);
	assert.deepEqual(chemistry, molecule);
	assert.equal(JSON.stringify(chemistry), JSON.stringify(molecule));
	// The history snapshots a stripped draft, so undo cannot flip a switch back.
	assert.equal("display" in withoutStructureDisplay(chemistry), false);
});

test("the builder writes the switches with every save and reads them on open", () => {
	assert.match(source, /JSON\.stringify\(withStructureDisplay\(this\.draft, this\.#viewSwitches\)\)/);
	assert.match(source, /this\.#applyDisplay\(snapshot\.display\);\s*\n\s*const structure = withoutStructureDisplay\(snapshot\);/);
	assert.match(source, /this\.#applyDisplay\(next\.display\);\s*\n\s*this\.#past = /);
	assert.match(source, /this\.draft = withoutStructureDisplay\(next\);/);
	// A learner may switch the view on screen, but the document stays the teacher's.
	assert.match(source, /#save\(\) \{\s*\n\s*if \(!this\.canAuthor \|\| !this\.isConnected\) return;/);
});

test("both switches write through the document, not around it", () => {
	assert.match(source, /this\.#setDisplay\(\{ hydration: !this\.showHydration \}\)/);
	assert.match(source, /this\.#setDisplay\(\{ electrons: !this\.showElectrons \}\)/);
	assert.equal(source.includes("this.showHydration = !this.showHydration"), false);
	assert.equal(source.includes("this.showElectrons = !this.showElectrons"), false);
	// The download keeps the view; the handover to ChemLab reviews chemistry only.
	assert.match(source, /JSON\.stringify\(withStructureDisplay\(this\.#current, this\.#viewSwitches\), null, 2\)/);
	assert.match(source, /const structure = withoutStructureDisplay\(this\.#current\);/);
	assert.match(source, /reviewBuilderStructure\?\.\(structure\)/);
});
