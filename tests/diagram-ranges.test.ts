import assert from "node:assert/strict";
import { test } from "node:test";
import { axisTrimSelection, diagramData, moveTrimHandle, trimmedAxisRange, TRIM_STEPS } from "../data/diagramRanges";

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

test("trimming one edge keeps the other edge and prevents crossing", () => {
	const full = { min: 0, max: TRIM_STEPS };
	const left = moveTrimHandle(full, "min", 2500);
	const both = moveTrimHandle(left, "max", 7500);
	assert.deepEqual(left, { min: 2500, max: TRIM_STEPS });
	assert.deepEqual(both, { min: 2500, max: 7500 });
	assert.deepEqual(moveTrimHandle(both, "min", -500), { min: 0, max: 7500 });
	assert.deepEqual(moveTrimHandle(both, "max", 0), { min: 2500, max: 2501 });
	assert.deepEqual(moveTrimHandle(both, "min", TRIM_STEPS), { min: 7499, max: 7500 });
});

test("the trim track maps to the current axis window for finer zoom", () => {
	const domain = { min: 1.092, max: 1.102 };
	const narrowed = trimmedAxisRange(domain, { min: 2500, max: 7500 });
	assert.ok(Math.abs(narrowed.min - 1.0945) < 1e-14);
	assert.ok(Math.abs(narrowed.max - 1.0995) < 1e-14);
	const further = trimmedAxisRange(narrowed, { min: 5000, max: TRIM_STEPS });
	assert.ok(Math.abs(further.min - 1.097) < 1e-14);
	assert.equal(further.max, narrowed.max);
	assert.deepEqual(trimmedAxisRange(domain, { min: 0, max: TRIM_STEPS }), domain);
});

test("the trim handles retain their numeric interval as the live axis grows", () => {
	const domain = { min: 0, max: 60 };
	const zoom = { min: 15, max: 45 };
	assert.deepEqual(axisTrimSelection(domain, zoom), { min: 2500, max: 7500 });
	assert.deepEqual(axisTrimSelection({ min: 0, max: 120 }, zoom), { min: 1250, max: 3750 });
	assert.deepEqual(axisTrimSelection(zoom, zoom), { min: 0, max: TRIM_STEPS });
});
