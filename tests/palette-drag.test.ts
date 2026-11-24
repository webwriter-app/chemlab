import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("webwriter-chemlab.ts", "utf8");

/**
 * A palette drag keeps its AbortController until the press ends, and the
 * controller counts as a busy canvas (`draggingPalette` feeds `pointerBusy`).
 * A pointerup that never arrives therefore refuses every later drag until the
 * page reloads, which is exactly what the editor around the widget can cause by
 * swallowing the event. A fresh primary press starts over instead, and a start
 * that throws ends the gesture instead of leaving the tile dragging alone.
 */

const startPaletteDrag = source.slice(
	source.indexOf("private startPaletteDrag("),
	source.indexOf("private preventNativePaletteDrag("),
);

test("a new press ends a gesture that never saw its pointerup", () => {
	const body = startPaletteDrag.slice(startPaletteDrag.indexOf("{"));
	const abort = body.indexOf("this.paletteDrag?.abort()");
	const busy = body.indexOf("if (this.canvas.pointerBusy) return;");
	assert.ok(abort > 0, "the gesture is aborted");
	assert.ok(busy > abort, "the abort runs before the busy guard refuses the press");
	// The other preconditions still come first, so a secondary touch or a
	// right click cannot abort a running drag.
	const guard = body.indexOf("if (event.button !== 0 || !event.isPrimary || !this.app) return;");
	assert.ok(guard > 0 && guard < abort);
});

test("the controller belongs to the canvas while it is open", () => {
	const canvas = readFileSync("controllers/CanvasController.ts", "utf8");
	assert.match(source, /get draggingPalette\(\): boolean \{\n\t\treturn !!this\.paletteDrag;/);
	assert.match(canvas, /this\._dragActive \|\| this\.pan \|\| this\.pinching \|\| this\.marquee \|\| this\.groupDrag \|\| this\.host\.draggingPalette/);
});

test("a start that throws ends the gesture and reports the failure", () => {
	assert.match(
		startPaletteDrag,
		/try \{\n\t\t\t\t\tgesture\.start\(\);\n\t\t\t\t\} catch \(error\) \{[\s\S]*?console\.error\("Unable to start the palette drag", error\);[\s\S]*?controller\.abort\(\);[\s\S]*?return;/,
	);
});

test("a chemical without a dose says which one it is", () => {
	const startChemicalDrag = source.slice(
		source.indexOf("private startChemicalDrag("),
		source.indexOf("private openAmountMenu("),
	);
	assert.match(startChemicalDrag, /const dose = this\.buildDose\(chemical\.recipe\);\n\t\t\t\tif \(!dose\) \{[\s\S]*?console\.warn\("Unable to prepare the dose of", chemical\.name\);[\s\S]*?\n\t\t\t\t\}/);
});
