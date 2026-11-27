/**
 * Browser fixture for the worksheet routing contract.
 *
 * The Node tests cover the router against a fake worksheet. This fixture runs
 * the same contract in a real browser, where the parts the fake cannot show
 * matter: composed events crossing a shadow boundary, upgrade timing of a
 * property written before the element is defined, and focus restoration across
 * a layout change.
 *
 * Build it with esbuild and open `worksheet.html` next to it:
 *
 * ```sh
 * node_modules/.bin/esbuild tests/fixtures/worksheet-browser.ts \
 *     --bundle --format=esm --target=es2022 --outfile=tests/fixtures/worksheet-browser.js
 * ```
 *
 * esbuild writes `worksheet-browser.css` next to it; the page links both. The
 * generated files are not committed.
 *
 * @module tests/fixtures/worksheet-browser
 */

import "../../webwriter-chemlab-periodic-table";
import {
	SelectionRouter,
	type RoutingRoot,
} from "../../periodic-table/routing";
import { ELEMENT_SELECTION_EVENT, elementSelection } from "../../periodic-table/selection";

/** Tag of the periodic table widget. */
const TABLE_TAG = "webwriter-chemlab-periodic-table";

/** Table host with the widget's public surface. */
interface TableElement extends HTMLElement {
	selectedAtomicNumber: number | null;
	updateComplete: Promise<unknown>;
}

/** One fixture exercise. */
interface Exercise {
	readonly name: string;
	readonly expected: string;
	readonly run: () => Promise<string>;
}

const worksheet = document.getElementById("worksheet") as HTMLElement & RoutingRoot;
const results = document.getElementById("results") as HTMLElement;
const summary = document.getElementById("summary") as HTMLElement;

/** Receiver stub with a visible last value and delivery count. */
class Stub {
	readonly received: (number | null)[] = [];
	readonly router: SelectionRouter;
	readonly #panel: HTMLElement;

	/**
	 * @param sourceId - Host ID the stub is bound to.
	 * @param panel - Element that shows the stub output.
	 */
	constructor(sourceId: string, panel: HTMLElement) {
		this.#panel = panel;
		this.router = new SelectionRouter({
			root: worksheet,
			sourceId,
			expectedTag: TABLE_TAG,
			onSelection: (selection) => {
				this.received.push(selection.atomicNumber);
				this.render();
			},
		});
		this.router.bind();
		this.render();
	}

	/** Clears the recorded deliveries. */
	reset() {
		this.received.length = 0;
		this.render();
	}

	/** @returns The recorded deliveries as a compact string. */
	get text(): string {
		return `[${this.received.map((value) => (value === null ? "null" : value)).join(",")}]`;
	}

	/** Writes the stub output into its panel. */
	render() {
		const last = this.received.length === 0 ? "–" : String(this.received[this.received.length - 1]);
		this.#panel.textContent = `last: ${last} · deliveries: ${this.received.length}`;
	}
}

const tableA = document.getElementById("table-a") as TableElement;
const tableB = document.getElementById("table-b") as TableElement;
const builder = new Stub("table-a", document.getElementById("builder") as HTMLElement);
const lab = new Stub("table-b", document.getElementById("lab") as HTMLElement);

/** Waits for a frame, so Lit updates and observers have run. */
function settle(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Dispatches a selection event that bubbles and crosses shadow boundaries.
 *
 * @param target - Node the event starts at.
 * @param detail - Event payload.
 */
function dispatchFrom(target: EventTarget, detail: unknown) {
	target.dispatchEvent(
		new CustomEvent(ELEMENT_SELECTION_EVENT, { detail, bubbles: true, composed: true }),
	);
}

/** @returns The cell of a table in the shadow root. */
function cellOf(table: TableElement, atomicNumber: number): HTMLElement | null {
	return table.shadowRoot?.querySelector<HTMLElement>(`[data-atomic-number="${atomicNumber}"]`) ?? null;
}

/** @returns The atomic number of the focused element, or `null`. */
function focusedAtomicNumber(table: TableElement): number | null {
	const active = table.shadowRoot?.activeElement;
	const raw = active?.getAttribute("data-atomic-number");
	if (raw != null) return Number(raw);
	return active?.matches(".list-details .details-card") ? table.selectedAtomicNumber : null;
}

/** Starts grid exercises above the auto-layout breakpoint on any viewport. */
async function withWideTable(run: () => Promise<string>): Promise<string> {
	const { inlineSize, maxInlineSize } = tableA.style;
	tableA.style.maxInlineSize = "none";
	tableA.style.inlineSize = "760px";
	try {
		await settle();
		await settle();
		return await run();
	} finally {
		tableA.style.inlineSize = inlineSize;
		tableA.style.maxInlineSize = maxInlineSize;
		await settle();
	}
}

/** Clears both stubs and restores the default selection. */
async function reset() {
	builder.reset();
	lab.reset();
	tableA.selectedAtomicNumber = null;
	tableB.selectedAtomicNumber = null;
	await settle();
}

const exercises: Exercise[] = [
	{
		name: "select O in A, then Cu in B",
		expected: "A=[8] B=[29]",
		run: async () => {
			await reset();
			dispatchFrom(tableA, elementSelection(8, "table-a"));
			dispatchFrom(tableB, elementSelection(29, "table-b"));
			return `A=${builder.text} B=${lab.text}`;
		},
	},
	{
		name: "clear A, then write a value into A",
		expected: "A=[8,null] view=26",
		run: async () => {
			await reset();
			dispatchFrom(tableA, elementSelection(8, "table-a"));
			dispatchFrom(tableA, elementSelection(null, "table-a"));
			tableA.selectedAtomicNumber = 26;
			await settle();
			return `A=${builder.text} view=${tableA.selectedAtomicNumber}`;
		},
	},
	{
		name: "duplicate ID, then remove the copy",
		expected: "A=[] after copy, A=[8] after removal",
		run: async () => {
			await reset();
			const copy = tableA.cloneNode(true) as TableElement;
			worksheet.append(copy);
			await settle();
			dispatchFrom(tableA, elementSelection(8, "table-a"));
			const blocked = builder.text;
			copy.remove();
			await settle();
			dispatchFrom(tableA, elementSelection(8, "table-a"));
			return `A=${blocked} after copy, A=${builder.text} after removal`;
		},
	},
	{
		name: "event from a child with a matching source ID",
		expected: "A=[]",
		run: async () => {
			await reset();
			const child = document.createElement("span");
			tableA.append(child);
			dispatchFrom(child, elementSelection(8, "table-a"));
			child.remove();
			return `A=${builder.text}`;
		},
	},
	{
		name: "composed event from inside the shadow root",
		expected: "A=[]",
		run: async () => {
			await reset();
			const cell = cellOf(tableA, 8);
			if (cell === null) return "A=missing cell";
			dispatchFrom(cell, elementSelection(8, "table-a"));
			return `A=${builder.text}`;
		},
	},
	{
		name: "wrong version and invalid atomic number",
		expected: "A=[]",
		run: async () => {
			await reset();
			dispatchFrom(tableA, { version: 2, atomicNumber: 8 });
			dispatchFrom(tableA, { version: 1, atomicNumber: 119 });
			dispatchFrom(tableA, { version: 1, atomicNumber: 8.5 });
			return `A=${builder.text}`;
		},
	},
	{
		name: "property written before the element upgraded",
		expected: "view=8 A=[]",
		run: async () => {
			await reset();
			const fresh = document.createElement(TABLE_TAG) as TableElement;
			fresh.id = "table-a";
			fresh.selectedAtomicNumber = 8;
			tableA.replaceWith(fresh);
			await settle();
			await fresh.updateComplete;
			const view = fresh.selectedAtomicNumber;
			const delivered = builder.text;
			fresh.replaceWith(tableA);
			await settle();
			return `view=${view} A=${delivered}`;
		},
	},
	{
		name: "arrow key moves focus to the next cell",
		expected: "focus=2",
		run: () => withWideTable(async () => {
			await reset();
			const cell = cellOf(tableA, 1);
			if (cell === null) return "focus=missing cell";
			cell.focus();
			cell.dispatchEvent(
				new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }),
			);
			await settle();
			return `focus=${focusedAtomicNumber(tableA)}`;
		}),
	},
	{
		name: "focus survives a switch to the list layout after reattachment",
		expected: "focus=8",
		run: () => withWideTable(async () => {
			await reset();
			const anchor = document.createComment("");
			tableA.replaceWith(anchor);
			anchor.replaceWith(tableA);
			tableA.selectedAtomicNumber = 8;
			await settle();
			const cell = cellOf(tableA, 8);
			if (!cell?.classList.contains("cell")) return "grid cell missing";
			cell.focus();
			tableA.style.inlineSize = "500px";
			await settle();
			await settle();
			if (!tableA.shadowRoot?.querySelector(".list")) return "list layout missing";
			return `focus=${focusedAtomicNumber(tableA)}`;
		}),
	},
];

/** Runs every exercise and writes the result table. */
async function runAll() {
	results.replaceChildren();
	let passed = 0;
	for (const exercise of exercises) {
		let actual = "";
		try {
			actual = await exercise.run();
		} catch (error) {
			actual = `error: ${String(error)}`;
		}
		const ok = actual === exercise.expected;
		if (ok) passed += 1;
		const row = document.createElement("tr");
		row.className = ok ? "pass" : "fail";
		for (const text of [exercise.name, exercise.expected, actual, ok ? "pass" : "fail"]) {
			const cell = document.createElement("td");
			cell.textContent = text;
			row.append(cell);
		}
		results.append(row);
	}
	summary.textContent = `${passed} of ${exercises.length} exercises pass`;
	await reset();
}

document.getElementById("run")?.addEventListener("click", () => void runAll());
void runAll();
