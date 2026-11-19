import assert from "node:assert/strict";
import { test } from "node:test";
import {
	GRID_KEYS,
	firstAvailableInRow,
	focusTargetAfterLayout,
	gridKeyTarget,
	isGridKey,
	lastAvailableInRow,
} from "../periodic-table/keyboard";
import { GRID, cellOf } from "../periodic-table/layout";

const all = () => true;

test("only the six grid keys are handled", () => {
	assert.deepEqual([...GRID_KEYS], ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);
	for (const key of GRID_KEYS) assert.equal(isGridKey(key), true);
	for (const key of ["Enter", " ", "Tab", "a", "PageDown", "Escape"]) {
		assert.equal(isGridKey(key), false);
		assert.deepEqual(gridKeyTarget(8, key, all), { handled: false, atomicNumber: null });
	}
});

test("horizontal steps stay in the row and stop at the boundary", () => {
	assert.deepEqual(gridKeyTarget(1, "ArrowRight", all), { handled: true, atomicNumber: 2 });
	assert.deepEqual(gridKeyTarget(2, "ArrowRight", all), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(1, "ArrowLeft", all), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(2, "ArrowLeft", all), { handled: true, atomicNumber: 1 });
	// Hydrogen sits in column 1, helium in column 18: the step crosses the gap.
	assert.equal(cellOf(2)?.column, 18);
	assert.deepEqual(gridKeyTarget(9, "ArrowRight", all), { handled: true, atomicNumber: 10 });
});

test("vertical steps follow the column and never wrap", () => {
	assert.deepEqual(gridKeyTarget(1, "ArrowDown", all), { handled: true, atomicNumber: 3 });
	assert.deepEqual(gridKeyTarget(2, "ArrowDown", all), { handled: true, atomicNumber: 10 });
	assert.deepEqual(gridKeyTarget(3, "ArrowUp", all), { handled: true, atomicNumber: 1 });
	assert.deepEqual(gridKeyTarget(1, "ArrowUp", all), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(118, "ArrowDown", all), { handled: true, atomicNumber: null });
	// Period 6 column 2 is barium, period 7 column 2 is radium.
	assert.deepEqual(gridKeyTarget(56, "ArrowDown", all), { handled: true, atomicNumber: 88 });
});

test("the main grid and a detached series are separate sections", () => {
	// Lanthanum sits in the placeholder column of period 6, actinium below it.
	assert.deepEqual(gridKeyTarget(57, "ArrowDown", all), { handled: true, atomicNumber: 89 });
	assert.deepEqual(gridKeyTarget(89, "ArrowUp", all), { handled: true, atomicNumber: 57 });
	assert.deepEqual(gridKeyTarget(57, "ArrowRight", all), { handled: true, atomicNumber: 58 });
	assert.deepEqual(gridKeyTarget(58, "ArrowDown", all), { handled: true, atomicNumber: 90 });
	assert.deepEqual(gridKeyTarget(71, "ArrowRight", all), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(103, "ArrowDown", all), { handled: true, atomicNumber: null });
	// A step up from the first series row stays inside the series section.
	assert.deepEqual(gridKeyTarget(57, "ArrowUp", all), { handled: true, atomicNumber: null });
});

test("Home and End reach the first and last available cell of the row", () => {
	// Period 2 starts at lithium and ends at neon.
	assert.deepEqual(gridKeyTarget(10, "Home", all), { handled: true, atomicNumber: 3 });
	assert.deepEqual(gridKeyTarget(10, "End", all), { handled: true, atomicNumber: 10 });
	assert.deepEqual(gridKeyTarget(2, "Home", all), { handled: true, atomicNumber: 1 });
	assert.deepEqual(gridKeyTarget(2, "End", all), { handled: true, atomicNumber: 2 });
	assert.deepEqual(gridKeyTarget(58, "Home", all), { handled: true, atomicNumber: 57 });
	assert.deepEqual(gridKeyTarget(58, "End", all), { handled: true, atomicNumber: 71 });
	assert.equal(firstAvailableInRow(1, all), 1);
	assert.equal(lastAvailableInRow(1, all), 2);
	assert.equal(firstAvailableInRow(99, all), null);
});

test("steps skip filtered-out cells instead of landing on them", () => {
	const even = (atomicNumber: number) => atomicNumber % 2 === 0;
	assert.deepEqual(gridKeyTarget(2, "ArrowRight", even), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(2, "ArrowLeft", even), { handled: true, atomicNumber: null });
	// Row 1 has no even cell left of helium, so Home finds helium itself.
	assert.deepEqual(gridKeyTarget(2, "Home", even), { handled: true, atomicNumber: 2 });
	// Down from helium keeps the column: neon is even and stays reachable.
	assert.deepEqual(gridKeyTarget(2, "ArrowDown", even), { handled: true, atomicNumber: 10 });
	// Column 1 holds only alkali metals, all odd, so the step runs out of cells.
	assert.deepEqual(gridKeyTarget(1, "ArrowDown", even), { handled: true, atomicNumber: null });
	// A row without any available cell yields no target.
	const none = () => false;
	assert.deepEqual(gridKeyTarget(8, "Home", none), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(8, "ArrowRight", none), { handled: true, atomicNumber: null });
});

test("a filtered row keeps the boundary instead of wrapping", () => {
	const onlyNobleGases = (atomicNumber: number) => [2, 10, 18, 36, 54, 86, 118].includes(atomicNumber);
	assert.deepEqual(gridKeyTarget(2, "ArrowDown", onlyNobleGases), { handled: true, atomicNumber: 10 });
	assert.deepEqual(gridKeyTarget(118, "ArrowDown", onlyNobleGases), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(2, "ArrowRight", onlyNobleGases), { handled: true, atomicNumber: null });
});

test("an unknown element consumes the key without moving", () => {
	assert.deepEqual(gridKeyTarget(0, "ArrowRight", all), { handled: true, atomicNumber: null });
	assert.deepEqual(gridKeyTarget(119, "Home", all), { handled: true, atomicNumber: null });
});

test("focus is restored only while the element is still in the results", () => {
	assert.equal(focusTargetAfterLayout(8, all), 8);
	assert.equal(focusTargetAfterLayout(8, (atomicNumber) => atomicNumber !== 8), null);
	assert.equal(focusTargetAfterLayout(null, all), null);
});

test("every handled key resolves inside the shipped grid", () => {
	for (const cell of GRID.cells) {
		for (const key of GRID_KEYS) {
			const target = gridKeyTarget(cell.atomicNumber, key, all);
			assert.equal(target.handled, true);
			if (target.atomicNumber === null) continue;
			assert.ok(cellOf(target.atomicNumber), `target outside the grid: ${target.atomicNumber}`);
			if (key === "Home" || key === "End") continue;
			assert.notEqual(target.atomicNumber, cell.atomicNumber, `${key} from ${cell.atomicNumber} did not move`);
		}
	}
});
