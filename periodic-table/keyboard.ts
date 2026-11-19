/**
 * Keyboard navigation of the periodic table grid.
 *
 * The grid is a two-dimensional ARIA grid, so the arrow keys, Home and End move
 * focus between cells instead of scrolling the page. The rules live here rather
 * than in the widget: they only need the display geometry and the set of cells
 * that currently pass the filter, so they stay testable without a DOM.
 *
 * A step never wraps and never lands on a filtered-out cell: it keeps walking in
 * the requested direction until it finds an available element or reaches the
 * boundary. The main grid and a detached series are separate sections, so a
 * vertical step never jumps from a period into the f-block.
 *
 * @module periodic-table/keyboard
 */

import {
	GRID,
	cellOf,
	neighborAtomicNumber,
	type GridDirection,
	type PeriodicGrid,
} from "./layout";

/** Keys the grid handles itself. */
export type GridKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/** Every handled key, in the order the widget documents them. */
export const GRID_KEYS: readonly GridKey[] = [
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"Home",
	"End",
];

/** Tells whether a cell may take focus, usually because it passes the filter. */
export type Availability = (atomicNumber: number) => boolean;

/** Outcome of a key press inside the grid. */
export interface GridKeyTarget {
	/** Whether the grid consumed the key; unhandled keys keep their default. */
	readonly handled: boolean;
	/** Element to focus, or `null` when the step stops at the boundary. */
	readonly atomicNumber: number | null;
}

/**
 * Narrows a key name to a handled grid key.
 *
 * @param key - `KeyboardEvent.key` of the press.
 * @returns `true` for the six handled keys.
 */
export function isGridKey(key: string): key is GridKey {
	return (GRID_KEYS as readonly string[]).includes(key);
}

/**
 * Finds the first available element of a row.
 *
 * @param row - Grid row, 1-based.
 * @param isAvailable - Filter of the current session.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The atomic number, or `null` when the row has no available cell.
 */
export function firstAvailableInRow(
	row: number,
	isAvailable: Availability,
	grid: PeriodicGrid = GRID,
): number | null {
	const cells = grid.rows.find((entry) => entry.row === row)?.cells ?? [];
	for (const cell of cells) {
		if (isAvailable(cell.atomicNumber)) return cell.atomicNumber;
	}
	return null;
}

/**
 * Finds the last available element of a row.
 *
 * @param row - Grid row, 1-based.
 * @param isAvailable - Filter of the current session.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns The atomic number, or `null` when the row has no available cell.
 */
export function lastAvailableInRow(
	row: number,
	isAvailable: Availability,
	grid: PeriodicGrid = GRID,
): number | null {
	const cells = grid.rows.find((entry) => entry.row === row)?.cells ?? [];
	for (let index = cells.length - 1; index >= 0; index -= 1) {
		if (isAvailable(cells[index].atomicNumber)) return cells[index].atomicNumber;
	}
	return null;
}

/** Arrow key to grid direction. */
const ARROW_DIRECTIONS: Readonly<
	Record<"ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", GridDirection>
> = {
	ArrowLeft: "left",
	ArrowRight: "right",
	ArrowUp: "up",
	ArrowDown: "down",
};

/**
 * Resolves a key press inside the grid to the cell that should take focus.
 *
 * @param atomicNumber - Element of the cell that has focus.
 * @param key - `KeyboardEvent.key` of the press.
 * @param isAvailable - Filter of the current session.
 * @param grid - Grid to search; defaults to the shipped grid.
 * @returns Whether the key was handled and which element to focus next.
 */
export function gridKeyTarget(
	atomicNumber: number,
	key: string,
	isAvailable: Availability,
	grid: PeriodicGrid = GRID,
): GridKeyTarget {
	if (!isGridKey(key)) return { handled: false, atomicNumber: null };
	const cell = cellOf(atomicNumber, grid);
	if (!cell) return { handled: true, atomicNumber: null };
	if (key === "Home") {
		return { handled: true, atomicNumber: firstAvailableInRow(cell.row, isAvailable, grid) };
	}
	if (key === "End") {
		return { handled: true, atomicNumber: lastAvailableInRow(cell.row, isAvailable, grid) };
	}
	const direction = ARROW_DIRECTIONS[key];
	let current = atomicNumber;
	for (;;) {
		const next = neighborAtomicNumber(current, direction, grid);
		if (next === null) return { handled: true, atomicNumber: null };
		if (isAvailable(next)) return { handled: true, atomicNumber: next };
		current = next;
	}
}

/**
 * Picks the element to focus after a layout change.
 *
 * The widget remembers which element owned focus before the change and restores
 * it only while that element is still part of the results.
 *
 * @param previous - Element that owned focus, or `null` when focus was elsewhere.
 * @param isAvailable - Filter of the new layout.
 * @returns The element to focus, or `null` when the caller should fall back.
 */
export function focusTargetAfterLayout(
	previous: number | null,
	isAvailable: Availability,
): number | null {
	if (previous === null) return null;
	return isAvailable(previous) ? previous : null;
}
