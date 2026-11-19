/**
 * Standalone periodic table widget for WebWriter.
 *
 * The entry owns the WebWriter options, the live selection property and the
 * selection event. Reference data, layout, search and the full browsing UI live
 * in `periodic-table/` so they stay testable without a DOM.
 *
 * @packageDocumentation
 */

import { LitElementWw, action } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { css, html, type PropertyValues } from "lit";

import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("@shoelace-style/shoelace/dist");
import "@shoelace-style/shoelace/dist/themes/light.css";

import {
	ELEMENT_SELECTION_EVENT,
	elementSelection,
	parseAtomicNumberAttribute,
	SelectionModel,
	type ElementSelectionV1,
} from "./periodic-table/selection";

/** Author layout choice. `auto` follows the container width. */
export type PeriodicTableView = "auto" | "table" | "list";

const VIEWS: readonly PeriodicTableView[] = ["auto", "table", "list"];

/**
 * Parses the `view` attribute, treating unknown markup as `auto`.
 *
 * @param raw - Attribute value as read from the DOM.
 * @returns The layout choice.
 */
function parseView(raw: string | null | undefined): PeriodicTableView {
	const value = (raw ?? "").trim().toLowerCase();
	return VIEWS.find(view => view === value) ?? "auto";
}

/** Attribute converter for `initial-element`, so invalid markup means "no selection". */
const atomicNumberConverter = {
	fromAttribute: (value: string | null) => parseAtomicNumberAttribute(value),
	toAttribute: (value: number | null) => (value === null ? null : String(value)),
};

/** Attribute converter for `view`, so invalid markup means `auto`. */
const viewConverter = {
	fromAttribute: (value: string | null) => parseView(value),
	toAttribute: (value: PeriodicTableView) => value,
};

/**
 * Temporary element fixture for the first spike.
 *
 * Replaced by the generated reference bundle in the next work package.
 */
const SPIKE_ELEMENTS = [
	{ atomicNumber: 1, symbol: "H", name: "Hydrogen" },
	{ atomicNumber: 2, symbol: "He", name: "Helium" },
	{ atomicNumber: 3, symbol: "Li", name: "Lithium" },
	{ atomicNumber: 6, symbol: "C", name: "Carbon" },
	{ atomicNumber: 7, symbol: "N", name: "Nitrogen" },
	{ atomicNumber: 8, symbol: "O", name: "Oxygen" },
	{ atomicNumber: 11, symbol: "Na", name: "Sodium" },
	{ atomicNumber: 12, symbol: "Mg", name: "Magnesium" },
	{ atomicNumber: 13, symbol: "Al", name: "Aluminium" },
	{ atomicNumber: 14, symbol: "Si", name: "Silicon" },
	{ atomicNumber: 26, symbol: "Fe", name: "Iron" },
	{ atomicNumber: 29, symbol: "Cu", name: "Copper" },
];

/** Interface strings of the spike, replaced by `periodic-table/strings.ts`. */
const SPIKE_STRINGS = {
	en: { selected: "Selected", none: "No element selected", clear: "Clear" },
	de: { selected: "Ausgewählt", none: "Kein Element ausgewählt", clear: "Zurücksetzen" },
};

/**
 * Bilingual periodic table with a live element selection.
 *
 * @fires chemlab:element-selection - After a user action that changed the selection.
 */
@customElement("webwriter-chemlab-periodic-table")
export class ChemLabPeriodicTable extends LitElementWw {
	static optionGroups = {
		content: { label: { _: "Content", "de-DE": "Inhalt" }, collapsible: true, advanced: false },
		appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false },
	};

	static options = {
		initialElement: {
			type: "number" as const,
			group: "content",
			attribute: "initial-element",
			label: { _: "Initial element (atomic number)", "de-DE": "Startelement (Ordnungszahl)" },
			description: {
				_: "Atomic number from 1 to 118. Leave empty for no initial selection.",
				"de-DE": "Ordnungszahl von 1 bis 118. Leer lassen für keine Vorauswahl.",
			},
			min: 1,
			max: 118,
			step: 1,
		},
		view: {
			type: "select" as const,
			group: "appearance",
			label: { _: "Layout", "de-DE": "Darstellung" },
			options: [
				{ value: "auto", label: { _: "Automatic", "de-DE": "Automatisch" } },
				{ value: "table", label: { _: "Table", "de-DE": "Tabelle" } },
				{ value: "list", label: { _: "List", "de-DE": "Liste" } },
			],
		},
	};

	options = ChemLabPeriodicTable.options;
	optionGroups = ChemLabPeriodicTable.optionGroups;

	/**
	 * Registers the live selection as a reactive property without an attribute.
	 *
	 * The accessor pair below is declared on the prototype, so Lit wraps it and
	 * keeps a value that a host wrote before the element upgraded.
	 */
	static properties = {
		selectedAtomicNumber: { attribute: false },
	};

	/** Authored default element, `null` for no initial selection. */
	@property({ type: Number, reflect: true, attribute: "initial-element", converter: atomicNumberConverter })
	accessor initialElement: number | null = null;

	/** Authored layout choice; invalid markup falls back to `auto`. */
	@property({ type: String, reflect: true, converter: viewConverter })
	accessor view: PeriodicTableView = "auto";

	#selection = new SelectionModel();
	#initialized = false;
	#viewOverride: PeriodicTableView | null = null;

	/**
	 * Currently selected atomic number, `null` when nothing is selected.
	 *
	 * Live property without attribute reflection. Invalid writes are ignored and
	 * keep the previous valid selection; a valid write dispatches no event.
	 */
	get selectedAtomicNumber(): number | null {
		return this.#selection.value;
	}

	set selectedAtomicNumber(value: number | null) {
		this.#selection.write(value);
	}

	/** Layout actually rendered: the learner's temporary choice wins over the author default. */
	get effectiveView(): PeriodicTableView {
		return this.#viewOverride ?? this.view;
	}

	/**
	 * Removes the authored initial element.
	 *
	 * The native number option cannot always be cleared in the editor, so authors
	 * get an explicit action for it.
	 */
	@action({ label: { _: "Clear initial element", "de-DE": "Startelement entfernen" } })
	clearInitialElement() {
		this.initialElement = null;
	}

	/**
	 * Applies the authored defaults once and follows later author edits.
	 *
	 * @param changed - Properties changed in this update cycle.
	 */
	protected willUpdate(changed: PropertyValues<this>) {
		if (!this.#initialized) {
			this.#initialized = true;
			this.#selection.initialize(this.initialElement);
		} else if (changed.has("initialElement")) {
			this.#selection.applyAuthored(this.initialElement);
		}
		if (changed.has("view")) this.#viewOverride = null;
	}

	/**
	 * Selects an element after a user action and reports the change.
	 *
	 * @param atomicNumber - Atomic number the user picked.
	 */
	#selectFromUser(atomicNumber: number) {
		if (!this.#selection.select(atomicNumber)) return;
		this.requestUpdate();
		this.#dispatchSelection();
	}

	/** Clears the selection after a user action and reports the change. */
	#clearFromUser() {
		if (!this.#selection.clear()) return;
		this.requestUpdate();
		this.#dispatchSelection();
	}

	/** Dispatches the current selection once, composed and bubbling. */
	#dispatchSelection() {
		this.dispatchEvent(new CustomEvent<ElementSelectionV1>(ELEMENT_SELECTION_EVENT, {
			bubbles: true,
			composed: true,
			detail: elementSelection(this.#selection.value, this.id || undefined),
		}));
	}

	render() {
		const strings = this.lang.toLowerCase().startsWith("de") ? SPIKE_STRINGS.de : SPIKE_STRINGS.en;
		const selected = this.#selection.value;
		const current = SPIKE_ELEMENTS.find(element => element.atomicNumber === selected);
		return html`
			<div class="spike">
				<p class="spike-status">
					${current
						? `${strings.selected}: ${current.symbol} · ${current.name} (${current.atomicNumber})`
						: strings.none}
				</p>
				<div class="spike-grid">
					${SPIKE_ELEMENTS.map(element => html`
						<sl-button
							size="small"
							variant=${element.atomicNumber === selected ? "primary" : "default"}
							@click=${() => this.#selectFromUser(element.atomicNumber)}
						>${element.symbol}</sl-button>
					`)}
				</div>
				<sl-button size="small" @click=${() => this.#clearFromUser()}>${strings.clear}</sl-button>
			</div>
		`;
	}

	static styles = css`
		:host {
			display: block;
			font-family: var(--sl-font-sans, system-ui, sans-serif);
			color: var(--sl-color-neutral-900, #1c1c1e);
			background: var(--sl-color-neutral-0, #ffffff);
			padding: 0.75rem;
			box-sizing: border-box;
		}
		.spike-status {
			margin: 0 0 0.5rem;
			font-size: 0.9rem;
			color: var(--sl-color-neutral-700, #3f3f46);
		}
		.spike-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 0.25rem;
			margin-bottom: 0.5rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		"webwriter-chemlab-periodic-table": ChemLabPeriodicTable;
	}
}
