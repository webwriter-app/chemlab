import assert from "node:assert/strict";
import { test } from "node:test";
import { diagramData } from "../data/diagramRanges";

test("fit both axes to the drawable data while keeping missing readings as gaps", () => {
	const result = diagramData([
		{ time: 0, x: 0, y: null },
		{ time: 1, x: 85, y: 1.1004 },
		{ time: 2, x: null, y: 5 },
		{ time: 3, x: 85.0000001, y: 1.0999 },
		{ time: 4, x: 400, y: null },
	]);
	assert.deepEqual(result.ranges, {
		x: { min: 85, max: 85.0000001 },
		y: { min: 1.0999, max: 1.1004 },
	});
	assert.deepEqual(result.data, [
		{ x: 0, y: null },
		{ x: 85, y: 1.1004 },
		{ x: 85, y: null },
		{ x: 85.0000001, y: 1.0999 },
		{ x: 400, y: null },
	]);
});

test("constant and negative axes get visible ranges", () => {
	const result = diagramData([
		{ time: 0, x: 0, y: -4 },
		{ time: 1, x: 0, y: -2 },
	]);
	assert.deepEqual(result.ranges, { x: { min: -1, max: 1 }, y: { min: -4, max: -2 } });
});

test("missing measurements do not reserve axis space", () => {
	assert.equal(diagramData([{ time: 0, x: 100, y: null }]).ranges, undefined);
});
