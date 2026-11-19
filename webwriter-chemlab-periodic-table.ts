/**
 * Standalone periodic table widget for WebWriter.
 *
 * The entry owns the WebWriter options, the live selection property, the
 * selection event and the browsing session (query, family filter, layout
 * override). Reference data, layout, search, strings and the detail card live in
 * `periodic-table/` so they stay testable without a DOM.
 *
 * @packageDocumentation
 */

import { LitElementWw, action } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { html, type PropertyValues } from "lit";

import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlSpinner from "@shoelace-style/shoelace/dist/components/spinner/spinner.component.js";
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("@shoelace-style/shoelace/dist");
import "@shoelace-style/shoelace/dist/themes/light.css";

import {
	CATEGORIES,
	LAYOUT,
	categoryOf,
	elementByAtomicNumber,
	type ElementReference,
} from "./periodic-table/element-reference";
import {
	GRID,
	seriesJumpTarget,
	type GridCell,
} from "./periodic-table/layout";
import { focusTargetAfterLayout, gridKeyTarget } from "./periodic-table/keyboard";
import { searchElements, type SearchResult } from "./periodic-table/search";
import {
	ELEMENT_SELECTION_EVENT,
	elementSelection,
	parseAtomicNumberAttribute,
	SelectionModel,
	type ElementSelectionV1,
} from "./periodic-table/selection";
import {
	categoryText,
	conditionsText,
	detailRows,
	sourceOf,
	sourceUsage,
} from "./periodic-table/details";
import { periodicTableStyles } from "./periodic-table/styles";
import {
	format,
	languageAncestors,
	resolveLanguage,
	strings,
	type Language,
	type Strings,
} from "./periodic-table/strings";

/** Author layout choice. `auto` follows the container width. */
export type PeriodicTableView = "auto" | "table" | "list";

/** Layout actually rendered; `auto` is resolved before rendering. */
type ResolvedView = "table" | "list";

const VIEWS: readonly PeriodicTableView[] = ["auto", "table", "list"];

/** Container width below which `auto` switches to the list. */
const LIST_BREAKPOINT = 680;

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
 * Bilingual periodic table with a live element selection.
 *
 * @fires chemlab:element-selection - After a user action that changed the selection.
 */
@customElement("webwriter-chemlab-periodic-table")
export class ChemLabPeriodicTable extends LitElementWw {
	/**
	 * Shoelace components used inside the shadow root.
	 *
	 * `LitElementWw` renders through a scoped custom element registry, so a tag
	 * that is missing here stays an unknown element: the toolbar would show the
	 * bare text of its buttons and options instead of the controls. The entries
	 * also keep the component modules in the bundle, because the imports are
	 * otherwise unused and get tree-shaken away. The list includes the elements
	 * the components use in their own templates, because a scoped registry does
	 * not inherit them from the global one.
	 */
	static scopedElements = {
		"sl-button": SlButton,
		"sl-details": SlDetails,
		"sl-icon": SlIcon,
		"sl-icon-button": SlIconButton,
		"sl-input": SlInput,
		"sl-option": SlOption,
		"sl-popup": SlPopup,
		"sl-select": SlSelect,
		"sl-spinner": SlSpinner,
		"sl-tag": SlTag,
	};

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
	#query = "";
	#category: string | null = null;
	#width: number | null = null;
	#resizeObserver: ResizeObserver | null = null;
	#languageObserver: MutationObserver | null = null;
	#matching: ReadonlySet<number> = new Set();
	#rovingOverride: number | null = null;
	#focusBeforeLayout: number | null = null;
	#restoreFocusPending = false;

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

	/** Measures the host once and then follows every resize. */
	protected firstUpdated() {
		this.#measure();
		this.#observeLanguage();
		if (typeof ResizeObserver === "function") {
			this.#resizeObserver = new ResizeObserver(() => this.#measure());
			this.#resizeObserver.observe(this);
		}
	}

	/** Follows the language of the enclosing content. */
	connectedCallback() {
		super.connectedCallback();
		this.#observeLanguage();
	}

	/** Stops observing the host and the enclosing content. */
	disconnectedCallback() {
		this.#resizeObserver?.disconnect();
		this.#resizeObserver = null;
		this.#languageObserver?.disconnect();
		this.#languageObserver = null;
		super.disconnectedCallback();
	}

	/**
	 * Restores result focus after a layout change.
	 *
	 * The element that owned focus is remembered by atomic number, so it survives
	 * the switch between the grid and the list. When it is no longer part of the
	 * results, the search field is the stable fallback.
	 */
	protected updated() {
		if (!this.#restoreFocusPending) return;
		this.#restoreFocusPending = false;
		const previous = this.#focusBeforeLayout;
		this.#focusBeforeLayout = null;
		const target = focusTargetAfterLayout(previous, atomicNumber => this.#matching.has(atomicNumber));
		const element = target === null
			? null
			: this.renderRoot.querySelector<HTMLElement>(`[data-atomic-number="${target}"]`);
		if (!element) {
			this.renderRoot.querySelector<HTMLElement>("sl-input")?.focus();
			return;
		}
		element.focus();
		this.#reveal(element);
	}

	/** Watches every ancestor the language walk visits for a `lang` change. */
	#observeLanguage() {
		this.#languageObserver?.disconnect();
		this.#languageObserver = null;
		if (typeof MutationObserver !== "function") return;
		const observer = new MutationObserver(() => this.requestUpdate());
		for (const node of languageAncestors(this)) {
			const candidate = node as unknown as Node;
			if (candidate?.nodeType !== 1) continue;
			observer.observe(candidate, { attributes: true, attributeFilter: ["lang"] });
		}
		this.#languageObserver = observer;
	}

	/** Records the host width, which decides the automatic layout. */
	#measure() {
		const width = this.getBoundingClientRect().width;
		if (width <= 0 || width === this.#width) return;
		const before = this.#resolvedView;
		this.#width = width;
		if (this.#resolvedView !== before) this.#captureResultFocus();
		this.requestUpdate();
	}

	/**
	 * Remembers which result owns focus before the layout changes.
	 *
	 * Only a focused result is restored; a click on a toolbar control leaves focus
	 * where the user put it.
	 */
	#captureResultFocus() {
		const root = this.renderRoot as ShadowRoot;
		const active = (root.activeElement ?? null) as HTMLElement | null;
		if (!active) {
			this.#restoreFocusPending = false;
			return;
		}
		const raw = active.dataset?.atomicNumber;
		this.#restoreFocusPending = true;
		this.#focusBeforeLayout = raw ? Number(raw) : null;
	}

	/**
	 * Scrolls a focused result into the widget's own scroll area.
	 *
	 * @param target - Focused cell or list row.
	 */
	#reveal(target: HTMLElement) {
		const pane = target.closest(".table-pane") as HTMLElement | null;
		if (!pane) return;
		const paneRect = pane.getBoundingClientRect();
		const rect = target.getBoundingClientRect();
		if (rect.left < paneRect.left) pane.scrollLeft += rect.left - paneRect.left;
		else if (rect.right > paneRect.right) pane.scrollLeft += rect.right - paneRect.right;
		if (rect.top < paneRect.top) pane.scrollTop += rect.top - paneRect.top;
		else if (rect.bottom > paneRect.bottom) pane.scrollTop += rect.bottom - paneRect.bottom;
	}

	/** Interface language of the surrounding content. */
	get #language(): Language {
		return resolveLanguage(this);
	}

	/** Layout to render, with `auto` resolved against the measured width. */
	get #resolvedView(): ResolvedView {
		const view = this.effectiveView;
		if (view !== "auto") return view;
		return this.#width !== null && this.#width < LIST_BREAKPOINT ? "list" : "table";
	}

	/** Current search hits, best match first. */
	#matches(): readonly SearchResult[] {
		return searchElements(this.#query, { locale: this.#language, category: this.#category });
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

	/**
	 * Switches the layout for this session only.
	 *
	 * @param view - Layout the learner asked for.
	 */
	#setView(view: ResolvedView) {
		if (this.#resolvedView === view) return;
		this.#captureResultFocus();
		this.#viewOverride = view;
		this.requestUpdate();
	}

	/**
	 * Toggles the family filter.
	 *
	 * @param category - Category key the learner pressed.
	 */
	#toggleCategory(category: string) {
		this.#category = this.#category === category ? null : category;
		this.requestUpdate();
	}

	/**
	 * Moves focus to the first element of a detached series.
	 *
	 * The jump is a navigation aid, not a selection: it changes no selection and
	 * dispatches no event. The tab order follows the jump so Tab returns there.
	 *
	 * @param seriesRow - Row of the detached series.
	 */
	#jumpToSeries(seriesRow: number) {
		const target = seriesJumpTarget(seriesRow);
		if (target === null) return;
		this.#rovingOverride = target;
		this.requestUpdate();
		this.#focusElement(target);
	}

	/**
	 * Focuses the cell or list row of an element once it is rendered.
	 *
	 * @param atomicNumber - Element to focus.
	 */
	#focusElement(atomicNumber: number) {
		void this.updateComplete.then(() => {
			const target = this.renderRoot.querySelector<HTMLElement>(
				`[data-atomic-number="${atomicNumber}"]`,
			);
			target?.focus();
		});
	}

	/** Clears query, filter, layout override and selection. */
	#reset() {
		this.#query = "";
		this.#category = null;
		this.#viewOverride = null;
		this.#clearFromUser();
		this.requestUpdate();
	}

	/** Reads the search field. */
	#onQueryInput = (event: Event) => {
		const value = (event.target as { value?: string }).value ?? "";
		if (value === this.#query) return;
		this.#query = value;
		this.requestUpdate();
	};

	/** Selects the best match on Enter, so the field works without a mouse. */
	#onSearchKeydown = (event: KeyboardEvent) => {
		if (event.key !== "Enter" || event.isComposing) return;
		const [first] = this.#matches();
		if (!first) return;
		event.preventDefault();
		this.#selectFromUser(first.atomicNumber);
		this.#focusElement(first.atomicNumber);
	};

	/** Reads the family filter. */
	#onCategoryChange = (event: Event) => {
		const value = (event.target as { value?: string }).value ?? "";
		this.#category = value === "" ? null : value;
		this.requestUpdate();
	};

	/**
	 * Handles the grid keys of a cell.
	 *
	 * Enter and Space activate the cell through the native click of the button
	 * wrapper, so only the navigation keys are handled here. A handled key is
	 * consumed, which keeps WebWriter's own shortcuts out of the grid; every other
	 * key keeps its default and still reaches the editor.
	 *
	 * @param event - Key event of the cell.
	 * @param atomicNumber - Element of the cell.
	 */
	#onCellKeydown = (event: KeyboardEvent, atomicNumber: number) => {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const target = gridKeyTarget(atomicNumber, event.key, value => this.#matching.has(value));
		if (!target.handled) return;
		event.preventDefault();
		event.stopPropagation();
		if (target.atomicNumber === null) return;
		this.#rovingOverride = target.atomicNumber;
		this.requestUpdate();
		this.#focusElement(target.atomicNumber);
	};

	/**
	 * Picks the single cell that takes part in the tab order.
	 *
	 * @param matching - Atomic numbers that pass the current filter.
	 * @returns The atomic number of the tabbable cell, or `null` when nothing matches.
	 */
	#rovingTarget(matching: ReadonlySet<number>): number | null {
		const selected = this.#selection.value;
		if (selected !== null && matching.has(selected)) return selected;
		const override = this.#rovingOverride;
		if (override !== null && matching.has(override)) return override;
		for (const cell of GRID.cells) {
			if (matching.has(cell.atomicNumber)) return cell.atomicNumber;
		}
		return null;
	}

	/**
	 * Renders the result count line.
	 *
	 * @param t - Interface strings.
	 * @param count - Number of matching elements.
	 * @returns The live region text.
	 */
	#renderCount(t: Strings, count: number) {
		if (count === 0) return t.noResults;
		if (count === 1) return t.resultCountOne;
		return format(t.resultCount, { count });
	}

	/**
	 * Renders the toolbar with search, family filter, layout switch and reset.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @returns The toolbar.
	 */
	#renderToolbar(t: Strings, language: Language) {
		const resolved = this.#resolvedView;
		return html`
			<div class="toolbar">
				<sl-input
					class="search"
					type="search"
					size="small"
					clearable
					label=${t.searchLabel}
					placeholder=${t.searchPlaceholder}
					.value=${this.#query}
					@sl-input=${this.#onQueryInput}
					@keydown=${this.#onSearchKeydown}
				></sl-input>
				<sl-select
					class="filter"
					size="small"
					clearable
					label=${t.filterLabel}
					placeholder=${t.filterAll}
					.value=${this.#category ?? ""}
					@sl-change=${this.#onCategoryChange}
				>
					${Object.entries(CATEGORIES).map(([key, category]) => html`
						<sl-option value=${key}>${category[language]}</sl-option>
					`)}
				</sl-select>
				<div class="views" role="group" aria-label=${t.viewLabel}>
					<sl-button
						size="small"
						variant=${resolved === "table" ? "primary" : "default"}
						@click=${() => this.#setView("table")}
					>${t.viewTable}</sl-button>
					<sl-button
						size="small"
						variant=${resolved === "list" ? "primary" : "default"}
						@click=${() => this.#setView("list")}
					>${t.viewList}</sl-button>
				</div>
				<sl-button size="small" @click=${() => this.#reset()}>${t.reset}</sl-button>
			</div>
		`;
	}

	/**
	 * Renders one element cell of the grid.
	 *
	 * @param cell - Cell of the display grid.
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param matching - Atomic numbers that pass the current filter.
	 * @param roving - Atomic number of the tabbable cell.
	 * @returns The grid cell.
	 */
	#renderCell(
		cell: GridCell,
		t: Strings,
		language: Language,
		matching: ReadonlySet<number>,
		roving: number | null,
	) {
		const element = elementByAtomicNumber(cell.atomicNumber);
		if (!element) return null;
		const enabled = matching.has(cell.atomicNumber);
		const selected = this.#selection.value === cell.atomicNumber;
		const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
		const label = format(t.cellLabel, {
			number: element.atomicNumber,
			name: element.names[language],
			symbol: element.symbol,
			category: categoryText(element, language),
		});
		return html`
			<div
				class="cell category-${cell.category}"
				role="gridcell"
				aria-selected=${selected}
				aria-disabled=${!enabled}
				aria-label=${label}
				tabindex=${cell.atomicNumber === roving ? 0 : -1}
				data-atomic-number=${cell.atomicNumber}
				style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				@click=${() => enabled && this.#selectFromUser(cell.atomicNumber)}
				@keydown=${(event: KeyboardEvent) => enabled && this.#onCellKeydown(event, cell.atomicNumber)}
			>
				<span class="cell-number">${cell.atomicNumber}</span>
				<span class="cell-symbol">${element.symbol}</span>
				<span class="cell-name">${element.names[language]}</span>
			</div>
		`;
	}

	/**
	 * Renders the table layout.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param matching - Atomic numbers that pass the current filter.
	 * @returns The grid with group labels, period gutter, placeholders and series rows.
	 */
	#renderGrid(t: Strings, language: Language, matching: ReadonlySet<number>) {
		const roving = this.#rovingTarget(matching);
		const groupLabels = Array.from({ length: GRID.columns }, (_, index) => html`
			<div
				class="group-label"
				role="columnheader"
				style="--pt-row:1;--pt-column:${index + 2}"
			>${index + 1}</div>
		`);
		const mainRows = GRID.rows
			.filter(row => row.section === "main")
			.map(row => html`
				<div class="grid-row" role="row">
					<div
						class="gutter"
						role="rowheader"
						style="--pt-row:${row.row + 1};--pt-column:1"
					>${row.row}</div>
					${row.cells.map(cell => this.#renderCell(cell, t, language, matching, roving))}
				</div>
			`);
		const placeholders = GRID.placeholders.map(placeholder => {
			const series = GRID.seriesRows.find(entry => entry.row === placeholder.seriesRow);
			const text = series
				? format(t.placeholderLabel, {
					first: series.firstAtomicNumber,
					last: series.lastAtomicNumber,
				})
				: "";
			return html`
				<div
					class="placeholder category-${placeholder.category}"
					style="--pt-row:${placeholder.row + 1};--pt-column:${placeholder.column + 1}"
				>
					<span class="placeholder-text">${text}</span>
				</div>
			`;
		});
		const seriesRows = GRID.rows
			.filter(row => row.section === "series")
			.map(row => {
				const series = GRID.seriesRows.find(entry => entry.row === row.row);
				const name = series ? CATEGORIES[series.category]?.[language] ?? series.category : "";
				return html`
					<div class="grid-row" role="row">
						<div
							class="series-header"
							role="rowheader"
							style="--pt-row:${row.row + 2};--pt-column:1 / span 3"
						>${name}</div>
						${row.cells.map(cell => this.#renderCell(cell, t, language, matching, roving))}
					</div>
				`;
			});
		return html`
			<div class="table-pane">
				<div class="grid" role="grid" aria-label=${t.gridLabel}>
					<div class="grid-row" role="row">
						<div class="gutter" role="columnheader" style="--pt-row:1;--pt-column:1"></div>
						${groupLabels}
					</div>
					${mainRows}
					${placeholders}
					${seriesRows}
				</div>
				<div class="series-jumps">
					${LAYOUT.seriesRows.map(series => html`
						<sl-button size="small" @click=${() => this.#jumpToSeries(series.row)}>
							${format(t.jumpToSeries, {
								series: CATEGORIES[series.category]?.[language] ?? series.category,
							})}
						</sl-button>
					`)}
				</div>
				<ul class="legend" aria-label=${t.legendLabel}>
					${Object.entries(CATEGORIES).map(([key, category]) => html`
						<li>
							<button
								class="legend-item category-${key}"
								type="button"
								aria-pressed=${this.#category === key}
								@click=${() => this.#toggleCategory(key)}
							>
								<span class="legend-swatch"></span>${category[language]}
							</button>
						</li>
					`)}
				</ul>
			</div>
		`;
	}

	/**
	 * Renders the list layout with the detail card after the selected row.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param matches - Search hits in display order.
	 * @param details - Rendered detail card.
	 * @returns The list.
	 */
	#renderList(
		t: Strings,
		language: Language,
		matches: readonly SearchResult[],
		details: unknown,
	) {
		const selected = this.#selection.value;
		const selectedVisible = matches.some(match => match.atomicNumber === selected);
		const rows = matches.map(match => {
			const element = elementByAtomicNumber(match.atomicNumber);
			if (!element) return null;
			const isSelected = match.atomicNumber === selected;
			return html`
				<li>
					<button
						class="list-row category-${categoryOf(element.atomicNumber) ?? "unknown"}"
						type="button"
						aria-pressed=${isSelected}
						data-atomic-number=${element.atomicNumber}
						@click=${() => this.#selectFromUser(element.atomicNumber)}
					>
						<span class="list-number">${element.atomicNumber}</span>
						<span class="list-symbol">${element.symbol}</span>
						<span class="list-name">${element.names[language]}</span>
						<span class="list-category">${categoryText(element, language)}</span>
					</button>
					${isSelected ? html`<div class="list-details">${details}</div>` : null}
				</li>
			`;
		});
		return html`
			<div class="table-pane">
				<ul class="list" aria-label=${t.gridLabel}>
					${selectedVisible ? null : html`<li class="list-details">${details}</li>`}
					${rows}
				</ul>
			</div>
		`;
	}

	/**
	 * Renders the print-only overview.
	 *
	 * The overview is always in the DOM and hidden on screen, so both author
	 * layouts print the same complete grid and the selected details. It carries no
	 * interactive element and is hidden from assistive technology, because the
	 * screen layout already exposes the same content.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param element - Selected element, or `null` for the empty card.
	 * @returns The print overview.
	 */
	#renderPrintOverview(t: Strings, language: Language, element: ElementReference | null) {
		const groupLabels = Array.from({ length: GRID.columns }, (_, index) => html`
			<div class="print-group" style="--pt-row:1;--pt-column:${index + 2}">${index + 1}</div>
		`);
		const periodLabels = Array.from({ length: GRID.periodRows }, (_, index) => html`
			<div class="print-gutter" style="--pt-row:${index + 2};--pt-column:1">${index + 1}</div>
		`);
		const cells = GRID.cells.map(cell => {
			const entry = elementByAtomicNumber(cell.atomicNumber);
			if (!entry) return null;
			const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
			return html`
				<div
					class="print-cell category-${cell.category}"
					style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				>
					<span class="print-number">${cell.atomicNumber}</span>
					<span class="print-symbol">${entry.symbol}</span>
				</div>
			`;
		});
		const placeholders = GRID.placeholders.map(placeholder => html`
			<div
				class="print-placeholder category-${placeholder.category}"
				style="--pt-row:${placeholder.row + 1};--pt-column:${placeholder.column + 1}"
			></div>
		`);
		const seriesLabels = GRID.seriesRows.map(series => html`
			<div
				class="print-series"
				style="--pt-row:${series.row + 2};--pt-column:1 / span 3"
			>${CATEGORIES[series.category]?.[language] ?? series.category}</div>
		`);
		const rows = element ? detailRows(element, language) : [];
		return html`
			<div class="print-overview" aria-hidden="true">
				<h2 class="print-title">${t.widgetLabel}</h2>
				<div class="print-grid">
					<div class="print-gutter" style="--pt-row:1;--pt-column:1"></div>
					${groupLabels}
					${periodLabels}
					${cells}
					${placeholders}
					${seriesLabels}
				</div>
				<div class="print-details">
					${element
						? html`
							<h3>${element.symbol} · ${element.names[language]}</h3>
							<dl class="print-fields">
								${rows.map(row => html`
									<div>
										<dt>${row.label}</dt>
										<dd>${row.value}${row.qualifier ? ` (${row.qualifier})` : ""}</dd>
									</div>
								`)}
							</dl>
							<p class="print-hint">${t.detailsHint} ${conditionsText(language)}</p>
						`
						: html`<p class="print-hint">${t.detailsEmpty}</p>`}
				</div>
			</div>
		`;
	}

	/**
	 * Renders the detail card of one element.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param element - Selected element, or `null` for the empty card.
	 * @returns The detail card.
	 */
	#renderDetails(t: Strings, language: Language, element: ElementReference | null) {
		if (!element) {
			return html`<div class="details"><p class="details-empty">${t.detailsEmpty}</p></div>`;
		}
		const rows = detailRows(element, language);
		const usage = sourceUsage(element, language);
		return html`
			<div class="details category-${categoryOf(element.atomicNumber) ?? "unknown"}">
				<div class="details-head">
					<div class="details-symbol">${element.symbol}</div>
					<div>
						<h3 class="details-name">${element.names[language]}</h3>
						<p class="details-sub">
							${element.atomicNumber} · ${element.symbol} · ${categoryText(element, language)}
						</p>
					</div>
				</div>
				<dl class="details-fields">
					${rows.map(row => html`
						<div class="details-row">
							<dt>${row.label}</dt>
							<dd>
								${row.value}${row.qualifier
									? html`<span class="qualifier">${row.qualifier}</span>`
									: null}
							</dd>
						</div>
					`)}
				</dl>
				<p class="details-hint">${t.detailsHint} ${conditionsText(language)}</p>
				<sl-details class="sources" summary=${t.sourcesLabel}>
					<p class="details-hint">${t.sourcesHint}</p>
					${usage.map(entry => {
						const source = sourceOf(entry.sourceId);
						if (!source) return null;
						return html`
							<div class="source">
								<p class="source-title">${source.publisher} — ${source.title}</p>
								<p class="source-line">${entry.fields.join(", ")}</p>
								<p class="source-line">
									${format(t.sourceRelease, { release: source.release })} ·
									${format(t.sourceRetrieved, { retrieved: source.retrieved })}
								</p>
								<p class="source-line">
									${format(t.sourceLicense, { license: source.license })}
								</p>
								<a
									class="source-link"
									href=${source.url}
									target="_blank"
									rel="noreferrer noopener"
								>${source.url}</a>
							</div>
						`;
					})}
				</sl-details>
			</div>
		`;
	}

	render() {
		const language = this.#language;
		const t = strings(language);
		const matches = this.#matches();
		const matching = new Set(matches.map(match => match.atomicNumber));
		this.#matching = matching;
		const selected = this.#selection.value;
		const element = selected === null ? null : elementByAtomicNumber(selected) ?? null;
		const details = this.#renderDetails(t, language, element);
		const resolved = this.#resolvedView;
		return html`
			<div class="widget">
				${this.#renderToolbar(t, language)}
				<p class="result-count" aria-live="polite">${this.#renderCount(t, matches.length)}</p>
				${resolved === "list"
					? this.#renderList(t, language, matches, details)
					: html`
						<div class="body">
							${this.#renderGrid(t, language, matching)}
							<div class="details-pane">${details}</div>
						</div>
					`}
				${this.#renderPrintOverview(t, language, element)}
			</div>
		`;
	}

	static styles = periodicTableStyles;
}

declare global {
	interface HTMLElementTagNameMap {
		"webwriter-chemlab-periodic-table": ChemLabPeriodicTable;
	}
}
