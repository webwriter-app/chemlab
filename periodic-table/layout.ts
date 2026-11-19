/**
 * Display geometry of the periodic table.
 *
 * The grid is built from the curated placement table, not from period and group
 * numbers: the display keeps a placeholder at (6, 3) and (7, 3) and detaches the
 * f-block into two labelled rows, so a cell position is a layout decision and
 * not a chemical statement. Everything here is pure, so the widget, the keyboard
 * navigation and the tests share one source of truth.
 *
 * @module periodic-table/layout
 */

import {
	ELEMENTS,
	LAYOUT,
	placementOf,
	type PeriodicTableLayout,
} from "./element-reference";

/** Which part of the display grid a cell belongs to. */
export type GridSection = "main" | "series";

/** One element in the display grid. */
export interface GridCell {
	/** Atomic number of the element in this cell. */
	readonly atomicNumber: number;
	/** Grid row, 1-based. Rows 1–7 are the main grid, 8 and 9 the detached series. */
	readonly row: number;
	/** Grid column, 1-based, 1–18. */
	readonly column: number;
	/** Teaching category key of the element. */
	readonly category: string;
	/** Whether the cell sits in the main grid or in a detached series row. */
	readonly section: GridSection;
}

/** A main-grid cell that stands for a detached series instead of an element. */
export interface GridPlaceholder {
	/** Grid row of the placeholder. */
	readonly row: number;
	/** Grid column of the placeholder. */
	readonly column: number;
	/** Teaching category of the series the placeholder stands for. */
	readonly category: string;
	/** Row of the detached series, or `null` when the layout has no such row. */
	readonly seriesRow: number | null;
}

/** One row of the display grid. */
export interface GridRow {
	/** Grid row, 1-based. */
	readonly row: number;
	/** Whether the row belongs to the main grid or to a detached series. */
	readonly section: GridSection;
	/** Cells of the row, ordered by column. */
	readonly cells: readonly GridCell[];
}

/** The complete display grid. */
export interface PeriodicGrid {
	/** Number of element columns, 18 for the standard layout. */
	readonly columns: number;
	/** Number of main-grid period rows, 7 for the standard layout. */
	readonly periodRows: number;
	/** All rows that hold at least one cell, ordered by row. */
	readonly rows: readonly GridRow[];
	/** All element cells, ordered by row and column. */
	readonly cells: readonly GridCell[];
	/** Placeholders that stand for a detached series. */
	readonly placeholders: readonly GridPlaceholder[];
	/** The detached series rows of the layout. */
	readonly seriesRows: PeriodicTableLayout["seriesRows"];
}

/** A rectangular block of grid positions. */
export interface GridBlock {
	/** First grid row of the block, 1-based. */
	readonly row: number;
	/** First grid column of the block, 1-based. */
	readonly column: number;
	/** Number of rows the block covers. */
	readonly rowSpan: number;
	/** Number of columns the block covers. */
	readonly columnSpan: number;
}

/** Direction of a keyboard step inside the grid. */
export type GridDirection = "left" | "right" | "up" | "down";

/**
 * Builds the display grid from a layout description.
 *
 * @param layout - Frame of the grid; defaults to the shipped layout.
 * @returns The grid with every element placed once.
 */
export function buildGrid(layout: PeriodicTableLayout = LAYOUT): PeriodicGrid {
	const seriesByCategory = new Map(layout.seriesRows.map((series) => [series.category, series]));
	const cells: GridCell[] = [];
	for (const element of ELEMENTS) {
		const placement = placementOf(element.atomicNumber);
		if (!placement) continue;
		cells.push({
			atomicNumber: element.atomicNumber,
			row: placement.row,
			column: placement.column,
			category: placement.category,
			section: placement.row <= layout.periodRows ? "main" : "series",
		});
	}
	const rows: GridRow[] = [];
	for (const row of [...new Set(cells.map((cell) => cell.row))].sort((a, b) => a - b)) {
		rows.push({
			row,
			section: row <= layout.periodRows ? "main" : "series",
			cells: cells.filter((cell) => cell.row === row).sort((a, b) => a.column - b.column),
		});
	}
	const placeholders: GridPlaceholder[] = layout.placeholders.map((placeholder) => ({
		row: placeholder.row,
		column: placeholder.column,
		category: placeholder.category,
		seriesRow: seriesByCategory.get(placeholder.category)?.row ?? null,
	}));
	return {
		columns: layout.columns,
		periodRows: layout.periodRows,
		rows,
		cells,
		placeholders,
		seriesRows: layout.seriesRows,
	};
}

/** The shipped display grid. */
export const GRID: PeriodicGrid = buildGrid();

/**
 * The block above the transition metals, where the detail card sits.
 *
 * Periods 1–3 carry only the s- and p-block edges, so groups 3–12 stay empty
 * there. The block is written down rather than searched for, because the card
 * must not move when the placement table changes; `tests/periodic-table-layout.test.ts`
 * checks that no cell and no placeholder falls into it.
 */
export const DETAIL_SLOT: GridBlock = { row: 1, column: 3, rowSpan: 3, columnSpan: 10 };

const CELLS_BY_NUMBER: ReadonlyMap<number, GridCell> = new Map(
	GRID.cells.map((cell) => [cell.atomicNumber, cell]),
);

const CELLS_BY_POSITION: ReadonlyMap<string, GridCell> = new Map(
	GRID.cells.map((cell) => [`${cell.row}:${cell.column}`, cell]),
);

/**
 * Looks up the cell of an element.
 *
 * @param atomicNumber - Atomic number, 1–118.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The cell, or `undefined` outside the supported range.
 */
export function cellOf(atomicNumber: number, grid: PeriodicGrid = GRID): GridCell | undefined {
	if (grid === GRID) return CELLS_BY_NUMBER.get(atomicNumber);
	return grid.cells.find((cell) => cell.atomicNumber === atomicNumber);
}

/**
 * Looks up the cell at a grid position.
 *
 * @param row - Grid row, 1-based.
 * @param column - Grid column, 1-based.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The cell, or `undefined` when the position is empty.
 */
export function cellAt(row: number, column: number, grid: PeriodicGrid = GRID): GridCell | undefined {
	if (grid === GRID) return CELLS_BY_POSITION.get(`${row}:${column}`);
	return grid.cells.find((cell) => cell.row === row && cell.column === column);
}

/**
 * Finds the next element in a direction, skipping empty cells.
 *
 * Left and right stay in the same row. Up and down scan successive rows of the
 * same section for the same column, so the main grid and a detached series never
 * mix, and a step stops at the boundary instead of wrapping.
 *
 * @param atomicNumber - Element to start from.
 * @param direction - Direction of the step.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The neighbouring atomic number, or `null` at the boundary.
 */
export function neighborAtomicNumber(
	atomicNumber: number,
	direction: GridDirection,
	grid: PeriodicGrid = GRID,
): number | null {
	const cell = cellOf(atomicNumber, grid);
	if (!cell) return null;
	if (direction === "left" || direction === "right") {
		const step = direction === "left" ? -1 : 1;
		for (let column = cell.column + step; column >= 1 && column <= grid.columns; column += step) {
			const found = cellAt(cell.row, column, grid);
			if (found) return found.atomicNumber;
		}
		return null;
	}
	const rows = grid.rows.filter((row) => row.section === cell.section).map((row) => row.row);
	const step = direction === "up" ? -1 : 1;
	for (let index = rows.indexOf(cell.row) + step; index >= 0 && index < rows.length; index += step) {
		const found = cellAt(rows[index], cell.column, grid);
		if (found) return found.atomicNumber;
	}
	return null;
}

/**
 * Finds the first element of a row, used by Home and by the series jump buttons.
 *
 * @param row - Grid row, 1-based.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The first atomic number of the row, or `null` for an empty row.
 */
export function firstInRow(row: number, grid: PeriodicGrid = GRID): number | null {
	return grid.rows.find((entry) => entry.row === row)?.cells[0]?.atomicNumber ?? null;
}

/**
 * Finds the last element of a row, used by End.
 *
 * @param row - Grid row, 1-based.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The last atomic number of the row, or `null` for an empty row.
 */
export function lastInRow(row: number, grid: PeriodicGrid = GRID): number | null {
	const cells = grid.rows.find((entry) => entry.row === row)?.cells;
	return cells?.[cells.length - 1]?.atomicNumber ?? null;
}
