/**
 * The table keeps its cell size whatever the widget does. Only the gaps grow, so
 * a wider or taller embed spreads the same tiles apart instead of blowing them
 * up. These checks read the shadow stylesheet as source, because the rule lives
 * in the CSS and no layout engine runs in this test; the measured behaviour is
 * checked in the browser, the shape of the rule here.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("periodic-table/styles.ts", "utf8");
const open = source.indexOf("export const periodicTableStyles = css`");
assert.ok(open >= 0, "missing shadow stylesheet");
const body = source.slice(open + "export const periodicTableStyles = css`".length);
const cssText = body.slice(0, body.lastIndexOf("`;"));

/** Body of the first rule with the given selector. */
function rule(selector: string): string {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, "u").exec(cssText);
	assert.ok(match, `missing rule ${selector}`);
	return match[1]!;
}

/** Value of one declaration inside a rule body, without the semicolon. */
function declaration(ruleBody: string, property: string): string {
	const match = new RegExp(`(?:^|;|\\n)\\s*${property}\\s*:([^;]*);`, "u").exec(ruleBody);
	assert.ok(match, `missing declaration ${property}`);
	return match[1]!.replace(/\s+/gu, " ").trim();
}

// The cell size is a property of the widget, not of its current width.
const host = rule(":host");
assert.match(declaration(host, "--pt-cell-width"), /^\d+(?:\.\d+)?rem$/u);
assert.match(declaration(host, "--pt-cell-height"), /^\d+(?:\.\d+)?rem$/u);

const grid = rule(".grid");
const columns = declaration(grid, "grid-template-columns");
const rows = declaration(grid, "grid-template-rows");

// Eighteen element columns, each capped at the cell width and able to shrink
// below it when the pane is narrow. A bare fraction would let the cells grow.
const elementColumns = columns.replace(/^var\(--pt-gutter\)\s*/u, "");
assert.equal(
	elementColumns,
	"repeat(18, minmax(0, var(--pt-cell-width)))",
	`element columns must be capped at the cell width, got ${elementColumns}`,
);
assert.doesNotMatch(columns, /\d+fr\b/u, "a fractional column would stretch the cells");
assert.match(rows, /minmax\(var\(--pt-cell-height\), auto\)/u);
assert.doesNotMatch(rows, /\d+fr\b/u, "a fractional row would stretch the cells");

// space-between hands the space the widget has left to the gaps; without it the
// block of tracks would sit at the start and leave one white margin instead.
assert.equal(declaration(grid, "justify-content"), "space-between");
assert.equal(declaration(grid, "align-content"), "space-between");
// The pane's height only reaches the rows when the grid takes it.
assert.equal(declaration(grid, "min-block-size"), "100%");
// A fixed height would clip a table that has to scroll in a short widget.
assert.doesNotMatch(grid, /(?:^|;)\s*block-size\s*:/u);
// The gaps stay small as a floor; space-between grows them from there.
assert.equal(declaration(grid, "gap"), "2px");

// The name still marks a cell that has reached its full width: the query
// measures the content box, which is two pixels narrower than a capped cell.
const capRem = Number.parseFloat(declaration(host, "--pt-cell-width"));
const threshold = /@container \(min-width: ([\d.]+)rem\)\s*\{\s*\.cell-name/u.exec(cssText);
assert.ok(threshold, "missing container query for the cell name");
const thresholdRem = Number.parseFloat(threshold[1]!);
assert.ok(
	thresholdRem < capRem,
	`the name threshold ${thresholdRem}rem would never be reached below the ${capRem}rem cap`,
);
assert.ok(thresholdRem * 16 > 38, "the name must not show in a shrunken cell");

// The print overview is its own sheet on paper width and keeps a proportional
// grid; the rule above must not have been copied there by accident.
const printGrid = /\.print-grid\s*\{([^}]*)\}/u.exec(cssText);
assert.ok(printGrid, "missing print grid");
assert.match(printGrid[1]!, /repeat\(18, minmax\(0, 1fr\)\)/u);

console.log("periodic-table-scaling: ok");
