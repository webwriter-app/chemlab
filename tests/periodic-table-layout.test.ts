import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, LAYOUT, placementOf } from "../periodic-table/element-reference";
import {
	DETAIL_SLOT,
	GRID,
	buildGrid,
	cellAt,
	cellOf,
	firstInRow,
	lastInRow,
	neighborAtomicNumber,
} from "../periodic-table/layout";

test("the grid places every element exactly once", () => {
	assert.equal(GRID.cells.length, ELEMENTS.length);
	assert.equal(new Set(GRID.cells.map((cell) => cell.atomicNumber)).size, ELEMENTS.length);
	for (const element of ELEMENTS) {
		const cell = cellOf(element.atomicNumber);
		assert.ok(cell, `missing cell for Z = ${element.atomicNumber}`);
		const placement = placementOf(element.atomicNumber);
		assert.ok(placement);
		assert.equal(cell.row, placement.row);
		assert.equal(cell.column, placement.column);
		assert.equal(cell.category, placement.category);
	}
	assert.equal(cellOf(0), undefined);
	assert.equal(cellOf(119), undefined);
});

test("no two elements share a grid position", () => {
	const seen = new Set<string>();
	for (const cell of GRID.cells) {
		const key = `${cell.row}:${cell.column}`;
		assert.ok(!seen.has(key), `duplicate position ${key}`);
		seen.add(key);
		assert.ok(cell.column >= 1 && cell.column <= GRID.columns, `column out of range: ${key}`);
		assert.ok(cell.row >= 1 && cell.row <= GRID.periodRows + 2, `row out of range: ${key}`);
	}
});

test("the main grid keeps the f-block placeholders and detaches the series", () => {
	assert.equal(GRID.placeholders.length, 2);
	const lanthanide = GRID.placeholders.find((entry) => entry.category === "lanthanide");
	const actinide = GRID.placeholders.find((entry) => entry.category === "actinide");
	assert.ok(lanthanide);
	assert.ok(actinide);
	assert.deepEqual([lanthanide.row, lanthanide.column], [6, 3]);
	assert.deepEqual([actinide.row, actinide.column], [7, 3]);
	assert.equal(lanthanide.seriesRow, 8);
	assert.equal(actinide.seriesRow, 9);
	assert.equal(cellAt(6, 3), undefined);
	assert.equal(cellAt(7, 3), undefined);
	assert.equal(cellOf(57)?.section, "series");
	assert.equal(cellOf(71)?.section, "series");
	assert.equal(cellOf(89)?.section, "series");
	assert.equal(cellOf(103)?.section, "series");
	assert.equal(cellOf(56)?.section, "main");
	assert.equal(cellOf(72)?.section, "main");
});

test("the series rows start at column 3 and hold fifteen elements each", () => {
	for (const series of LAYOUT.seriesRows) {
		const row = GRID.rows.find((entry) => entry.row === series.row);
		assert.ok(row);
		assert.equal(row.section, "series");
		assert.equal(row.cells.length, 15);
		assert.equal(row.cells[0].atomicNumber, series.firstAtomicNumber);
		assert.equal(row.cells[0].column, series.firstColumn);
		assert.equal(row.cells[row.cells.length - 1].atomicNumber, series.lastAtomicNumber);
	}
});

test("horizontal steps stay in the row and stop at the boundary", () => {
	assert.equal(neighborAtomicNumber(1, "right"), 2);
	assert.equal(neighborAtomicNumber(2, "right"), null);
	assert.equal(neighborAtomicNumber(1, "left"), null);
	assert.equal(neighborAtomicNumber(4, "left"), 3);
	assert.equal(neighborAtomicNumber(11, "right"), 12);
	assert.equal(neighborAtomicNumber(18, "right"), null);
	assert.equal(neighborAtomicNumber(57, "left"), null);
	assert.equal(neighborAtomicNumber(71, "right"), null);
	assert.equal(neighborAtomicNumber(57, "right"), 58);
});

test("vertical steps follow the column and never cross into a series row", () => {
	assert.equal(neighborAtomicNumber(1, "down"), 3);
	assert.equal(neighborAtomicNumber(2, "down"), 10);
	assert.equal(neighborAtomicNumber(2, "up"), null);
	assert.equal(neighborAtomicNumber(1, "up"), null);
	assert.equal(neighborAtomicNumber(3, "up"), 1);
	assert.equal(neighborAtomicNumber(57, "up"), null);
	assert.equal(neighborAtomicNumber(57, "down"), 89);
	assert.equal(neighborAtomicNumber(89, "up"), 57);
	assert.equal(neighborAtomicNumber(103, "down"), null);
	assert.equal(neighborAtomicNumber(58, "up"), null);
	assert.equal(neighborAtomicNumber(58, "down"), 90);
});

test("Home and End resolve to the first and last element of a row", () => {
	assert.equal(firstInRow(1), 1);
	assert.equal(lastInRow(1), 2);
	assert.equal(firstInRow(2), 3);
	assert.equal(lastInRow(2), 10);
	assert.equal(firstInRow(8), 57);
	assert.equal(lastInRow(8), 71);
	assert.equal(firstInRow(9), 89);
	assert.equal(lastInRow(9), 103);
	assert.equal(firstInRow(42), null);
	assert.equal(lastInRow(42), null);
});

test("a grid built from another layout keeps the same cells", () => {
	const grid = buildGrid();
	assert.equal(grid.cells.length, GRID.cells.length);
	assert.equal(grid.columns, GRID.columns);
	assert.equal(grid.periodRows, GRID.periodRows);
	assert.equal(cellOf(26, grid)?.atomicNumber, 26);
	assert.equal(cellAt(4, 8, grid)?.atomicNumber, 26);
	assert.equal(neighborAtomicNumber(26, "right", grid), 27);
	assert.equal(neighborAtomicNumber(26, "down", grid), 44);
});

test("the detail card sits in the free block above the transition metals", () => {
	assert.deepEqual({ ...DETAIL_SLOT }, { row: 1, column: 3, rowSpan: 3, columnSpan: 10 });
	for (let row = DETAIL_SLOT.row; row < DETAIL_SLOT.row + DETAIL_SLOT.rowSpan; row++) {
		for (let column = DETAIL_SLOT.column; column < DETAIL_SLOT.column + DETAIL_SLOT.columnSpan; column++) {
			assert.equal(cellAt(row, column), undefined, `cell at ${row}:${column}`);
			assert.equal(
				GRID.placeholders.some((entry) => entry.row === row && entry.column === column),
				false,
				`placeholder at ${row}:${column}`,
			);
		}
	}
	// The block is bounded by the s- and p-block edges of periods 1 to 3.
	assert.equal(cellAt(1, 1)?.atomicNumber, 1);
	assert.equal(cellAt(1, 18)?.atomicNumber, 2);
	assert.equal(cellAt(2, 2)?.atomicNumber, 4);
	assert.equal(cellAt(2, 13)?.atomicNumber, 5);
	assert.equal(cellAt(3, 2)?.atomicNumber, 12);
	assert.equal(cellAt(3, 13)?.atomicNumber, 13);
	assert.equal(cellAt(4, 3)?.atomicNumber, 21);
});
