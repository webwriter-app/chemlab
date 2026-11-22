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
import { property } from "lit/decorators.js";
import { html, nothing, svg, type PropertyValues } from "lit";

import SlBadge from "@shoelace-style/shoelace/dist/components/badge/badge.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.component.js";
import SlCarouselItem from "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlSpinner from "@shoelace-style/shoelace/dist/components/spinner/spinner.component.js";
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("@shoelace-style/shoelace/dist");
import "@shoelace-style/shoelace/dist/themes/light.css";

import {
	CATEGORIES,
	categoryOf,
	elementByAtomicNumber,
	type ElementReference,
} from "./periodic-table/element-reference";
import { DETAIL_SLOT, GRID, type GridCell } from "./periodic-table/layout";
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
	keyRows,
	numberText,
	rowFace,
	sourceFieldText,
	sourceList,
	stateText,
	type DetailRow,
	type DetailSection,
} from "./periodic-table/details";
import {
	DEFAULT_MODE_STATE,
	DISCOVERY_RANGE,
	ELECTRONEGATIVITY_RANGE,
	HALF_LIFE_RANGE,
	IONIZATION_RANGE,
	MODE_CHOICES,
	RADIUS_RANGE,
	TEMPERATURE_SLIDER,
	cellMode,
	celsiusFromKelvin,
	celsiusText,
	halfLifeText,
	kelvinFromCelsius,
	type MatterState,
	type ModeState,
	type TableMode,
} from "./periodic-table/phase";
import { periodicTableStyles } from "./periodic-table/styles";
import {
	format,
	languageAncestors,
	resolveLanguage,
	strings,
	type Language,
	type Strings,
} from "./periodic-table/strings";

import { electronConfiguration } from "./molecule-builder/atomic-configuration";
import { AtomicFigure } from "./molecule-builder/atomic-figure";
import { atomicModelStyles, initialAtomChoices, pauseShellElectronsOption, renderAtomicControls } from "./molecule-builder/atomic-model";
import { BUILDER_TAG, worksheetPeers, worksheetScope, type AtomReceiver } from "./molecule-builder/exchange";

const ATOM_PREVIEW_ICON = svg`<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor">
	<circle cx="8" cy="8" r="5.6" /><circle cx="8" cy="8" r="2.8" /><circle cx="8" cy="2.4" r="1.1" fill="currentColor" />
</svg>`;
const ELEMENT_DETAILS_ICON = svg`<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
	<path d="M4 4h9M4 8h9M4 12h9M2 4h.1M2 8h.1M2 12h.1" />
</svg>`;
const OPEN_BUILDER_ICON = svg`<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round">
	<path d="M10 3h3v3m0-3L7 9m5-1v5H3V4h5" />
</svg>`;

/** Author layout choice. `auto` follows the container width. */
export type PeriodicTableView = "auto" | "table" | "list";

/** Layout actually rendered; `auto` is resolved before rendering. */
type ResolvedView = "table" | "list";

const VIEWS: readonly PeriodicTableView[] = ["auto", "table", "list"];

/** Container width below which `auto` switches to the list. */
const LIST_BREAKPOINT = 680;

/** States the legend of a mode lists, in the order of the phase model. */
const STATES: readonly MatterState[] = ["solid", "liquid", "gas"];

/** How the detail card is presented in the current layout. */
interface DetailsOptions {
	/** Whether the card shows the sections below its key rows. */
	readonly expanded: boolean;
	/** Whether the card offers the corner toggle; the list keeps its card open. */
	readonly collapsible: boolean;
}

/** One labelled section of the expanded detail card. */
interface DetailSectionEntry {
	/** Section to pick from the rows of the card. */
	readonly section: DetailSection;
	/** String key of the heading. */
	readonly label: keyof Strings;
}

/**
 * Sections the expanded card adds below the key rows, in display order.
 *
 * The key rows already carry the weight and the answer of the current mode, so
 * the sections start with the temperatures: that is the first part the collapsed
 * card leaves out.
 */
const DETAIL_SECTIONS: readonly DetailSectionEntry[] = [
	{ section: "properties", label: "sectionProperties" },
	{ section: "temperatures", label: "sectionTemperatures" },
	{ section: "position", label: "sectionPosition" },
	{ section: "history", label: "sectionHistory" },
	{ section: "structure", label: "sectionStructure" },
];

/**
 * Info icon of the toolbar button.
 *
 * The icon is a data URI instead of a Shoelace icon name, because the widget
 * ships no icon assets and the default icon library would fetch them from a CDN.
 */
const INFO_ICON = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
		'<circle cx="8" cy="8" r="6.5" fill="none" stroke="#3f3f46" stroke-width="1.3"/>' +
		'<circle cx="8" cy="4.9" r=".95" fill="#3f3f46"/>' +
		'<rect x="7.15" y="6.6" width="1.7" height="5.1" rx=".85" fill="#3f3f46"/>' +
		"</svg>",
)}`;

/**
 * Cursor icon of the empty detail card.
 *
 * It points at the table, which is where the missing selection comes from. Like
 * the info icon it is a data URI, so the widget needs no icon assets.
 */
const POINTER_ICON = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
		'<path d="M4 2v11l2.7-2.7 1.9 4 2-1-1.9-3.9H13z" fill="#3f3f46"/>' +
		"</svg>",
)}`;

/**
 * Grid icon of the table view button.
 *
 * Inline SVG like the canvas controls, because the widget ships no icon assets
 * and the default Shoelace icon library would fetch them from a CDN.
 */
export const TABLE_ICON = html`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
		<path d="M2 2.5h12v11H2z"/><path d="M6 2.5v11M10 2.5v11M2 6.2h12M2 9.9h12"/>
	</svg>
`;

/** List icon of the list view button. */
export const LIST_ICON = html`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
		<path d="M5.8 4h8.2M5.8 8h8.2M5.8 12h8.2"/>
		<circle cx="2.8" cy="4" r="1" fill="currentColor" stroke="none"/>
		<circle cx="2.8" cy="8" r="1" fill="currentColor" stroke="none"/>
		<circle cx="2.8" cy="12" r="1" fill="currentColor" stroke="none"/>
	</svg>
`;

/** Reset icon of the reset button. */
const RESET_ICON = html`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
		<path d="M13.6 8a5.6 5.6 0 1 1-1.64-3.96"/><path d="M13.6 2.6v2.6h-2.6"/>
	</svg>
`;

/**
 * Funnel icon of the filter toggle.
 *
 * The toggle opens the panel with the search field and the family carousel, so
 * the icon names the whole panel instead of only the families.
 */
const FILTER_ICON = html`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M2.2 3.2h11.6l-4.5 5.1v4.5l-2.6 1.4V8.3z"/>
	</svg>
`;

/** Slider icon of the mode toggle, which opens the property panel. */
const MODE_ICON = html`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true">
		<path d="M2.4 4.6h11.2M2.4 11.4h11.2"/>
		<circle cx="5.6" cy="4.6" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="10.4" cy="11.4" r="1.7" fill="currentColor" stroke="none"/>
	</svg>
`;

/**
 * Chevron of the detail card toggle.
 *
 * The arrow points down while the card is collapsed and is turned over by the
 * stylesheet when the card is open, so one icon serves both states.
 */
const CHEVRON_ICON = html`
	<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M4 6.2 8 10.2l4-4"/>
	</svg>
`;

/**
 * Arrows of the family carousel.
 *
 * The carousel renders its own navigation buttons and would fill them from the
 * Shoelace icon library, which the widget does not ship; the slots take these
 * inline arrows instead, so the buttons never wait for a missing asset.
 */
const CAROUSEL_PREVIOUS_ICON = html`
	<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M10 3.5 5.5 8l4.5 4.5"/>
	</svg>
`;

/** Next arrow of the family carousel. */
const CAROUSEL_NEXT_ICON = html`
	<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M6 3.5 10.5 8 6 12.5"/>
	</svg>
`;

/**
 * Localizes one mode of the switch.
 *
 * @param mode - Mode of the switch.
 * @param t - Interface strings.
 * @returns The label of the mode.
 */
function modeText(mode: TableMode, t: Strings): string {
	switch (mode) {
		case "off":
			return t.modeOff;
		case "temperature":
			return t.modeTemperature;
		case "discovery":
			return t.modeDiscovery;
		case "radius":
			return t.modeRadius;
		case "electronegativity":
			return t.modeElectronegativity;
		case "ionization":
			return t.modeIonization;
		case "halfLife":
			return t.modeHalfLife;
	}
}

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
		"chemlab-atomic-figure": AtomicFigure,
		"sl-badge": SlBadge,
		"sl-button": SlButton,
		"sl-card": SlCard,
		"sl-carousel": SlCarousel,
		"sl-carousel-item": SlCarouselItem,
		"sl-dialog": SlDialog,
		"sl-divider": SlDivider,
		"sl-icon": SlIcon,
		"sl-icon-button": SlIconButton,
		"sl-input": SlInput,
		"sl-popup": SlPopup,
		"sl-spinner": SlSpinner,
		"sl-tag": SlTag,
		"sl-tooltip": SlTooltip,
	};

	static optionGroups = {
		content: { label: { _: "Content", "de-DE": "Inhalt" }, collapsible: true, advanced: false },
		appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false },
	};

	static options = {
		pauseShellElectrons: { ...pauseShellElectronsOption, group: "appearance" },
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

	/** Whether the rows act as an atom palette inside the Molecule Builder. */
	@property({ type: Boolean, reflect: true, attribute: "picker-mode" })
	accessor pickerMode = false;

	@property({ type: Boolean, attribute: "pause-shell-electrons", reflect: true })
	accessor pauseShellElectrons = false;

	#startElementDrag(event: PointerEvent, atomicNumber: number) {
		if (!this.pickerMode || !event.isPrimary || event.button !== 0) return;
		this.dispatchEvent(new CustomEvent("chemlab:element-drag", {
			bubbles: true,
			composed: true,
			detail: { atomicNumber, pointerId: event.pointerId, x: event.clientX, y: event.clientY },
		}));
	}


	#selection = new SelectionModel();
	#initialized = false;
	#viewOverride: PeriodicTableView | null = null;
	#query = "";
	#category: string | null = null;
	#width: number | null = null;
	#resizeObserver: ResizeObserver | null = null;
	#languageObserver: MutationObserver | null = null;
	/**
	 * Atomic numbers the keyboard may reach.
	 *
	 * In the grid this is every cell the mode can place, because the family filter
	 * only fades a cell and leaves it clickable; in the list it is the rows that
	 * survive the filter, because the list drops the rest.
	 */
	#matching: ReadonlySet<number> = new Set();
	#rovingOverride: number | null = null;
	#focusBeforeLayout: number | null = null;
	#restoreFocusPending = false;
	#mode: ModeState = DEFAULT_MODE_STATE;
	#infoOpen = false;
	#detailsExpanded = false;
	/** Whether the structure row of the card shows the electrons per shell. */
	#showShells = false;
	#atomPreview = false;
	#atomChoices = initialAtomChoices();
	#atomPreviewElement: number | null = null;
	#atomPeersObserver: MutationObserver | null = null;
	/** Whether the panel with the search field and the family carousel is open. */
	#filtersOpen = false;
	/** Whether the panel with the property modes and their slider is open. */
	#modesOpen = false;

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
		if (this.selectedAtomicNumber !== this.#atomPreviewElement) {
			this.#atomPreviewElement = this.selectedAtomicNumber;
			this.#atomChoices = initialAtomChoices(this.#atomChoices.model);
		}
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
		if (this.#atomPreview) this.#observeAtomPeers();
	}

	/** Stops observing the host and the enclosing content. */
	disconnectedCallback() {
		this.#resizeObserver?.disconnect();
		this.#resizeObserver = null;
		this.#languageObserver?.disconnect();
		this.#languageObserver = null;
		this.#atomPeersObserver?.disconnect();
		this.#atomPeersObserver = null;
		super.disconnectedCallback();
	}

	/**
	 * Restores result focus after a layout change.
	 *
	 * The element that owned focus is remembered by atomic number, so it survives
	 * the switch between the grid and the list. The list renders the selected row
	 * as its card, so a remembered selection lands on the card; otherwise the
	 * search field and then the layout switch are the stable fallbacks.
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
		if (element) {
			element.focus();
			this.#reveal(element);
			return;
		}
		const card = this.#listDetailsCard();
		if (card) {
			card.focus();
			return;
		}
		const fallback = this.renderRoot.querySelector<HTMLElement>("sl-input")
			?? this.renderRoot.querySelector<HTMLElement>(".toolbar-actions sl-button");
		fallback?.focus();
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

	/** Temperature the state rows and the cell colours refer to. */
	get #temperature(): number {
		return this.#mode.temperatureK;
	}

	/**
	 * Atomic numbers of the cells the mode can place.
	 *
	 * The grid renders these cells and fades the ones the family filter leaves
	 * out, so this set is what the keyboard may reach there.
	 *
	 * @returns The atomic numbers of every cell the grid shows.
	 */
	#placeable(): ReadonlySet<number> {
		const placeable = new Set<number>();
		for (const cell of GRID.cells) {
			const element = elementByAtomicNumber(cell.atomicNumber);
			if (element !== undefined && !cellMode(element, this.#mode).hidden) {
				placeable.add(cell.atomicNumber);
			}
		}
		return placeable;
	}

	/**
	 * Current search hits, best match first.
	 *
	 * The query applies to both layouts: the search field sits in the filter
	 * panel, which the ribbon opens in either view, so a query narrows the grid
	 * and the list alike. The family filter is part of the same call, so the two
	 * filters combine instead of replacing each other.
	 *
	 * @returns The matching elements in display order.
	 */
	#matches(): readonly SearchResult[] {
		return searchElements(this.#query, { locale: this.#language, category: this.#category });
	}

	/**
	 * Selects an element after a user action and reports the change.
	 *
	 * A new element starts with the collapsed card: the open card covers the
	 * cells below it, so it would hide the table the learner is browsing. The list
	 * keeps its card open, but the row that was pressed is gone, so focus moves to
	 * the card that replaced it.
	 *
	 * @param atomicNumber - Atomic number the user picked.
	 */
	#selectFromUser(atomicNumber: number) {
		if (!this.#selection.select(atomicNumber)) return;
		this.#detailsExpanded = false;
		this.#showShells = false;
		this.requestUpdate();
		this.#dispatchSelection();
		if (this.#resolvedView === "list" && !this.pickerMode) this.#focusDetails();
	}

	/** The card that replaced the selected list row, if the list shows one. */
	#listDetailsCard(): HTMLElement | null {
		return this.renderRoot.querySelector<HTMLElement>(".list-details .details-card");
	}

	/** Focuses the card that replaced the selected list row. */
	#focusDetails() {
		void this.updateComplete.then(() => this.#listDetailsCard()?.focus());
	}

	/** Clears the selection after a user action and reports the change. */
	#clearFromUser() {
		if (!this.#selection.clear()) return;
		this.#detailsExpanded = false;
		this.#showShells = false;
		this.requestUpdate();
		this.#dispatchSelection();
	}

	/** Opens or closes the full detail card. */
	#toggleDetails = () => {
		this.#detailsExpanded = !this.#detailsExpanded;
		this.requestUpdate();
	};

	/**
	 * Swaps the structure row between the configuration and the shell counts.
	 *
	 * The value itself is the control and carries no mark, so the row reads as
	 * plain text until it is used.
	 */
	#toggleShells = () => {
		this.#showShells = !this.#showShells;
		this.requestUpdate();
	};

	/**
	 * Closes the open detail card on Escape.
	 *
	 * The card covers the cells below it, so the key that closes an overlay has to
	 * work here as well. Focus stays on the toggle, which is still in the card.
	 *
	 * @param event - Key event of the card.
	 */
	#onDetailsKeydown = (event: KeyboardEvent) => {
		if (event.key !== "Escape" || !(this.#atomPreview || this.#detailsExpanded)) return;
		event.stopPropagation();
		if (this.#atomPreview) {
			this.#toggleAtomPreview();
			void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(".atom-preview-toggle")?.focus());
		} else {
			this.#detailsExpanded = false;
			this.requestUpdate();
		}
	};

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
	 * Switches the property the cells are coloured by.
	 *
	 * @param mode - Mode the learner pressed.
	 */
	#setMode(mode: TableMode) {
		if (this.#mode.mode === mode) return;
		this.#mode = { ...this.#mode, mode };
		this.requestUpdate();
	}

	/** Reads the temperature slider, which works in degrees Celsius. */
	#onTemperatureInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, temperatureK: kelvinFromCelsius(value) };
		this.requestUpdate();
	};

	/** Reads the year slider. */
	#onYearInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, year: value };
		this.requestUpdate();
	};

	/** Reads the atomic radius slider, which hides everything above the threshold. */
	#onRadiusInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, radiusPm: value };
		this.requestUpdate();
	};

	/** Reads the electronegativity slider, which hides everything below the threshold. */
	#onElectronegativityInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, electronegativity: value };
		this.requestUpdate();
	};

	/** Reads the ionization energy slider, which hides everything below the threshold. */
	#onIonizationInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, ionizationEv: value };
		this.requestUpdate();
	};

	/** Reads the half-life slider, which works in decades of seconds. */
	#onHalfLifeInput = (event: Event) => {
		const value = Number((event.target as { value?: string }).value ?? "");
		if (!Number.isFinite(value)) return;
		this.#mode = { ...this.#mode, halfLifeLogSeconds: value };
		this.requestUpdate();
	};

	/** Opens or closes the panel with the search field and the family filter. */
	#toggleFilters = () => {
		this.#filtersOpen = !this.#filtersOpen;
		this.requestUpdate();
	};

	/** Opens or closes the panel with the property modes. */
	#toggleModes = () => {
		this.#modesOpen = !this.#modesOpen;
		this.requestUpdate();
	};

	/** Opens the info dialog. */
	#openInfo = () => {
		this.#infoOpen = true;
		this.requestUpdate();
	};

	/**
	 * Closes the info dialog from its footer button.
	 *
	 * The flag is the only source of truth for the dialog's `open` attribute, so
	 * the click has to ask for a render; without it the button would look dead.
	 */
	#closeInfo = () => {
		this.#infoOpen = false;
		this.requestUpdate();
	};

	/** Keeps the open flag in step when the dialog closes itself. */
	#onInfoHide = () => {
		if (!this.#infoOpen) return;
		this.#infoOpen = false;
		this.requestUpdate();
	};

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

	/**
	 * Clears the property mode and restores the default thresholds.
	 *
	 * The mode panel carries no `off` chip, so this is the way back to the plain
	 * table. It also puts every slider back to the end that hides nothing, so the
	 * next mode starts from the reference state instead of the last threshold.
	 */
	#resetMode = () => {
		this.#mode = DEFAULT_MODE_STATE;
		this.requestUpdate();
	};

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
	 * Renders the ribbon: the two layer toggles, the lip that carries both
	 * layers, and the layout switch.
	 *
	 * The ribbon is the only permanently visible band. The two toggles sit on the
	 * left, the layout switch on the right, and between them one cutout anchors
	 * the lip. The band itself is painted by a pseudo-element that keeps the
	 * height of a single chip row, and the lip hangs below it as an absolutely
	 * positioned layer, so the band never grows and the table below keeps its
	 * box: an open layer covers the first rows of the table instead of pushing
	 * them down. The lip carries the lifting shadow of the detail card, so it
	 * reads as a layer above the table.
	 *
	 * Both layers share the lip and stack inside it as two sections of their own,
	 * so two open layers stay distinguishable without a divider between them. A
	 * toggle shows a filled state while its layer is open and a small dot while
	 * the layer is closed but still narrows the table, so a hidden filter never
	 * looks like no filter at all.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param resolved - Layout actually rendered.
	 * @param count - Number of matching elements.
	 * @returns The ribbon.
	 */
	#renderRibbon(t: Strings, language: Language, resolved: ResolvedView, count: number) {
		const filtersActive = this.#query !== "" || this.#category !== null;
		const modesActive = this.#mode.mode !== "off";
		const cutoutOpen = this.#filtersOpen || this.#modesOpen;
		return html`
			<div class="ribbon">
				<sl-button
					class="ribbon-toggle ${this.#filtersOpen ? "is-open" : ""} ${filtersActive ? "is-active" : ""}"
					size="small"
					title=${t.filtersLabel}
					aria-label=${t.filtersLabel}
					aria-expanded=${this.#filtersOpen}
					@click=${this.#toggleFilters}
				>${FILTER_ICON}</sl-button>
				<sl-button
					class="ribbon-toggle ${this.#modesOpen ? "is-open" : ""} ${modesActive ? "is-active" : ""}"
					size="small"
					title=${t.modeLabel}
					aria-label=${t.modeLabel}
					aria-expanded=${this.#modesOpen}
					@click=${this.#toggleModes}
				>${MODE_ICON}</sl-button>
				<div class="ribbon-cutout">
					${cutoutOpen
						? html`
							<div class="ribbon-lip">
								${this.#renderFilters(t, language, count)}
								${this.#renderModes(t, language)}
							</div>
						`
						: null}
				</div>
				<div class="views" role="group" aria-label=${t.viewLabel}>
					<sl-button
						size="small"
						variant=${resolved === "table" ? "primary" : "default"}
						title=${t.viewTable}
						aria-label=${t.viewTable}
						aria-pressed=${resolved === "table"}
						@click=${() => this.#setView("table")}
					>${TABLE_ICON}</sl-button>
					<sl-button
						size="small"
						variant=${resolved === "list" ? "primary" : "default"}
						title=${t.viewList}
						aria-label=${t.viewList}
						aria-pressed=${resolved === "list"}
						@click=${() => this.#setView("list")}
					>${LIST_ICON}</sl-button>
				</div>
			</div>
		`;
	}

	/**
	 * Renders the filter layer inside the ribbon lip.
	 *
	 * The panel holds the two controls that narrow the table, in the order they
	 * are read: the search field with the reset beside it, then the family
	 * carousel with the result count. Search and family filter combine, and both
	 * apply to the grid and the list alike, because the panel is the same in both
	 * layouts. The families are a Shoelace carousel of tags instead of a dropdown
	 * plus a legend, because the tags double as the filter and the strip stays one
	 * band at every width. It names itself through a hidden label instead of an
	 * attribute, because the carousel writes its own generic label when it
	 * connects. The reset sits outside the carousel, so it never scrolls out of
	 * reach. The result count is a pill badge, and a hidden live region keeps the
	 * full sentence for screen readers.
	 *
	 * The panel is a section in the pattern of the chemicals drawer: a heading
	 * band names the layer, the body holds the rows. That is what tells the two
	 * layers of the lip apart without a divider between them.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param count - Number of matching elements.
	 * @returns The filter panel, or nothing while it is closed.
	 */
	#renderFilters(t: Strings, language: Language, count: number) {
		if (!this.#filtersOpen) return null;
		const countText = this.#renderCount(t, count);
		return html`
			<div class="ribbon-panel filters">
				<div class="panel-heading" role="heading" aria-level="3">
					<sl-badge variant="neutral">${t.filterHeading}</sl-badge>
				</div>
				<div class="panel-body">
					<div class="panel-row">
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
						<sl-button
							class="reset"
							size="small"
							title=${t.reset}
							aria-label=${t.reset}
							@click=${() => this.#reset()}
						>${RESET_ICON}</sl-button>
					</div>
					<div class="panel-row">
						<span class="visually-hidden" id="family-strip-label">${t.legendLabel}</span>
						<sl-carousel
							class="family-strip"
							navigation
							mouse-dragging
							slides-per-page="4"
							slides-per-move="1"
							aria-labelledby="family-strip-label"
						>
							${Object.entries(CATEGORIES).map(([key, category]) => html`
								<sl-carousel-item>
									<button
										class="family-tag category-${key}"
										type="button"
										aria-pressed=${this.#category === key}
										@click=${() => this.#toggleCategory(key)}
									>
										<span class="family-swatch"></span>${category[language]}
									</button>
								</sl-carousel-item>
							`)}
							<span slot="previous-icon">${CAROUSEL_PREVIOUS_ICON}</span>
							<span slot="next-icon">${CAROUSEL_NEXT_ICON}</span>
						</sl-carousel>
						<sl-badge class="count-badge" pill variant="neutral" title=${countText}>
							${count}
						</sl-badge>
						<p class="visually-hidden" role="status" aria-live="polite">${countText}</p>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Describes the slider of the active mode.
	 *
	 * Every mode reads its slider as a threshold and states the direction in the
	 * readout, so the number alone cannot be misread: the radius keeps the elements
	 * up to the value, the other three keep the ones from it upwards.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @returns Bounds, value, readout and handler of the slider, or `null` when no mode is active.
	 */
	#slider(t: Strings, language: Language) {
		switch (this.#mode.mode) {
			case "off":
				return null;
			case "temperature":
				return {
					label: t.temperatureSlider,
					min: TEMPERATURE_SLIDER.minCelsius,
					max: TEMPERATURE_SLIDER.maxCelsius,
					step: TEMPERATURE_SLIDER.stepCelsius,
					value: celsiusFromKelvin(this.#mode.temperatureK),
					readout: celsiusText(this.#mode.temperatureK, language),
					onInput: this.#onTemperatureInput,
				};
			case "discovery":
				return {
					label: t.yearSlider,
					min: DISCOVERY_RANGE.min,
					max: DISCOVERY_RANGE.max,
					step: 1,
					value: this.#mode.year,
					readout: String(this.#mode.year),
					onInput: this.#onYearInput,
				};
			case "radius":
				return {
					label: t.radiusSlider,
					min: RADIUS_RANGE.min,
					max: RADIUS_RANGE.max,
					step: 1,
					value: this.#mode.radiusPm,
					readout: `≤ ${numberText(this.#mode.radiusPm, language)}\u00A0pm`,
					onInput: this.#onRadiusInput,
				};
			case "electronegativity":
				return {
					label: t.electronegativitySlider,
					min: ELECTRONEGATIVITY_RANGE.min,
					max: ELECTRONEGATIVITY_RANGE.max,
					step: 0.01,
					value: this.#mode.electronegativity,
					readout: `≥ ${numberText(this.#mode.electronegativity, language)}`,
					onInput: this.#onElectronegativityInput,
				};
			case "ionization":
				return {
					label: t.ionizationSlider,
					min: IONIZATION_RANGE.min,
					max: IONIZATION_RANGE.max,
					step: 0.01,
					value: this.#mode.ionizationEv,
					readout: `≥ ${numberText(this.#mode.ionizationEv, language)}\u00A0eV`,
					onInput: this.#onIonizationInput,
				};
			case "halfLife":
				return {
					label: t.halfLifeSlider,
					min: HALF_LIFE_RANGE.min,
					max: HALF_LIFE_RANGE.max,
					step: 0.1,
					value: this.#mode.halfLifeLogSeconds,
					readout: `≥ ${halfLifeText(10 ** this.#mode.halfLifeLogSeconds, language, 2)}`,
					onInput: this.#onHalfLifeInput,
				};
		}
	}

	/**
	 * Renders the property layer inside the ribbon lip.
	 *
	 * The panel decides what the cells are coloured by: the state at the chosen
	 * temperature, whether the element was already known in the chosen year, or
	 * one of the four numeric properties. The modes sit in a carousel of chips, so
	 * the row stays one band while the list of modes grows, and the slider of the
	 * active mode sits underneath it with its value as a tag. The slider is a
	 * native range input: it needs no component registration, keeps the keyboard
	 * and touch behaviour of the platform, and cannot fall back to plain text when
	 * a Shoelace build is missing. The legend of the temperature mode shares the
	 * last row, because a row of its own would cost the table the height of one
	 * period.
	 *
	 * The strip carries no `off` chip. The reset beside it is the way back to the
	 * plain table, in the same place and the same treatment as the reset beside
	 * the search, so both panels clear their own state with one button at the end
	 * of their row instead of a chip that scrolls away with the modes.
	 *
	 * The panel is a section in the pattern of the chemicals drawer, like the
	 * filter panel above it: a heading band names the layer, the body holds the
	 * rows.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @returns The property panel, or nothing while it is closed.
	 */
	#renderModes(t: Strings, language: Language) {
		if (!this.#modesOpen) return null;
		const slider = this.#slider(t, language);
		return html`
			<div class="ribbon-panel modes">
				<div class="panel-heading" role="heading" aria-level="3">
					<sl-badge variant="neutral">${t.modeHeading}</sl-badge>
				</div>
				<div class="panel-body">
					<div class="panel-row">
						<span class="visually-hidden" id="mode-strip-label">${t.modeLabel}</span>
						<sl-carousel
							class="mode-strip"
							navigation
							mouse-dragging
							slides-per-page="4"
							slides-per-move="1"
							aria-labelledby="mode-strip-label"
						>
							${MODE_CHOICES.map(mode => html`
								<sl-carousel-item>
									<button
										class="mode-tag ${this.#mode.mode === mode ? "is-active" : ""}"
										type="button"
										aria-pressed=${this.#mode.mode === mode}
										@click=${() => this.#setMode(mode)}
									>${modeText(mode, t)}</button>
								</sl-carousel-item>
							`)}
							<span slot="previous-icon">${CAROUSEL_PREVIOUS_ICON}</span>
							<span slot="next-icon">${CAROUSEL_NEXT_ICON}</span>
						</sl-carousel>
						<sl-button
							class="reset"
							size="small"
							title=${t.resetMode}
							aria-label=${t.resetMode}
							@click=${this.#resetMode}
						>${RESET_ICON}</sl-button>
					</div>
					${slider
						? html`
							<div class="mode-slider">
								<input
									class="mode-range"
									type="range"
									min=${slider.min}
									max=${slider.max}
									step=${slider.step}
									.value=${String(slider.value)}
									aria-label=${slider.label}
									@input=${slider.onInput}
								/>
								<sl-tag class="mode-value" size="small" variant="neutral">${slider.readout}</sl-tag>
							</div>
						`
						: null}
					${this.#renderStateLegend(t)}
				</div>
			</div>
		`;
	}

	/**
	 * Renders the colour key of the temperature mode.
	 *
	 * @param t - Interface strings.
	 * @returns The legend, or nothing while the temperature mode is off.
	 */
	#renderStateLegend(t: Strings) {
		if (this.#mode.mode !== "temperature") return null;
		return html`
			<ul class="state-legend" aria-label=${t.stateLegend}>
				${STATES.map(state => html`
					<li>
						<span class="state-swatch state-${state}"></span>${stateText(state, t)}
					</li>
				`)}
			</ul>
		`;
	}

	/**
	 * Renders one element cell of the grid.
	 *
	 * A cell the family filter does not match stays in place and fades instead of
	 * disappearing: the table keeps its shape, so the learner still reads where
	 * the family sits. Only a mode that cannot place an element removes its cell,
	 * because a state or a year the model does not know would read as a value.
	 *
	 * @param cell - Cell of the display grid.
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param roving - Atomic number of the tabbable cell.
	 * @param faded - Whether the family filter leaves the cell out.
	 * @returns The grid cell.
	 */
	#renderCell(cell: GridCell, t: Strings, language: Language, roving: number | null, faded: boolean) {
		const element = elementByAtomicNumber(cell.atomicNumber);
		if (!element) return null;
		const selected = this.#selection.value === cell.atomicNumber;
		const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
		const mode = cellMode(element, this.#mode, language);
		const state = mode.state === null ? null : stateText(mode.state, t);
		// The corner badge carries a bare number, so the label names the property it
		// belongs to; the state needs no such help.
		const note =
			state ?? (mode.badge === null ? null : `${modeText(this.#mode.mode, t)} ${mode.badge}`);
		const classes = ["cell", `category-${cell.category}`];
		if (mode.state !== null) classes.push(`state-${mode.state}`);
		if (faded) classes.push("is-faded");
		const label = format(t.cellLabel, {
			number: element.atomicNumber,
			name: element.names[language],
			symbol: element.symbol,
			category: categoryText(element, language),
		}) + (note === null ? "" : ` · ${note}`);
		return html`
			<div
				class=${classes.join(" ")}
				role="gridcell"
				aria-selected=${selected}
				aria-label=${label}
				tabindex=${cell.atomicNumber === roving ? 0 : -1}
				data-atomic-number=${cell.atomicNumber}
				style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				@pointerdown=${(event: PointerEvent) => this.#startElementDrag(event, cell.atomicNumber)}
				@click=${() => this.#selectFromUser(cell.atomicNumber)}
				@keydown=${(event: KeyboardEvent) => this.#onCellKeydown(event, cell.atomicNumber)}
			>
				<span class="cell-number">${cell.atomicNumber}</span>
				<span class="cell-symbol">${element.symbol}</span>
				<span class="cell-name">${element.names[language]}</span>
				${mode.badge === null ? null : html`<span class="cell-year">${mode.badge}</span>`}
			</div>
		`;
	}

	/**
	 * Renders the table layout.
	 *
	 * The detail card is a grid item of the table itself: it sits in the free block
	 * above the transition metals, so the selection is read inside the table
	 * instead of in a second column beside it. The card takes only the height of
	 * its content, so the block keeps its own size and the periods around it never
	 * stretch.
	 *
	 * Every cell the mode can place is rendered; the family filter only fades the
	 * cells it leaves out, so the table keeps its shape while the filter is on.
	 * The series labels and the placeholder cards belong to the detached rows and
	 * fade with them, because they name the same family.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param matching - Atomic numbers that pass the current filter.
	 * @param details - Rendered detail card.
	 * @returns The grid with group labels, period gutter, placeholders and series rows.
	 */
	#renderGrid(t: Strings, language: Language, matching: ReadonlySet<number>, details: unknown) {
		const roving = this.#rovingTarget(matching);
		const fadedCategory = (category: string) =>
			this.#category !== null && this.#category !== category;
		const groupLabels = Array.from({ length: GRID.columns }, (_, index) => html`
			<div
				class="group-label"
				role="columnheader"
				style="--pt-row:1;--pt-column:${index + 2}"
			>${index + 1}</div>
		`);
		const cells = (row: { readonly cells: readonly GridCell[] }) =>
			row.cells.map(cell =>
				this.#renderCell(cell, t, language, roving, !matching.has(cell.atomicNumber)),
			);
		const mainRows = GRID.rows
			.filter(row => row.section === "main")
			.map(row => html`
				<div class="grid-row" role="row">
					<div
						class="gutter"
						role="rowheader"
						style="--pt-row:${row.row + 1};--pt-column:1"
					>${row.row}</div>
					${cells(row)}
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
			const faded = fadedCategory(placeholder.category) ? " is-faded" : "";
			return html`
				<div
					class="placeholder category-${placeholder.category}${faded}"
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
				const faded = series && fadedCategory(series.category) ? " is-faded" : "";
				return html`
					<div class="grid-row" role="row">
						<div
							class="series-header${faded}"
							role="rowheader"
							style="--pt-row:${row.row + 2};--pt-column:1 / span 3"
						>${name}</div>
						${cells(row)}
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
					<div class="grid-row" role="row">
						<div
							class="details-slot"
							role="gridcell"
							style="--pt-row:${DETAIL_SLOT.row + 1};--pt-row-span:${DETAIL_SLOT.rowSpan};--pt-column:${DETAIL_SLOT.column + 1};--pt-column-span:${DETAIL_SLOT.columnSpan}"
						>${details}</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Renders the list layout with the detail card in place of the selected row.
	 *
	 * The card is always open here: the list has room for it, and a collapsed card
	 * would only repeat the row it replaces. Rendering it instead of the row keeps
	 * the identity of the element in one place, so the row and the card never show
	 * the same name twice in two different styles. A selection the mode hides has
	 * no row left, so its card moves to the top of the list.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param matches - Search hits in display order.
	 * @param element - Selected element, or `null` when nothing is selected.
	 * @param details - Rendered detail card.
	 * @returns The list.
	 */
	#renderList(
		t: Strings,
		language: Language,
		matches: readonly SearchResult[],
		element: ElementReference | null,
		details: unknown,
	) {
		const selected = this.#selection.value;
		const selectedVisible = matches.some(match => match.atomicNumber === selected);
		const rows = matches.map(match => {
			const entry = elementByAtomicNumber(match.atomicNumber);
			if (!entry) return null;
			if (!this.pickerMode && match.atomicNumber === selected) return html`<li class="list-details">${details}</li>`;
			// The mode decoration keeps its meaning in the narrow list: the state
			// or the discovery year rides along as a tag at the end of the row.
			const mode = cellMode(entry, this.#mode, this.#language);
			return html`
				<li>
					<button
						class="list-row category-${categoryOf(entry.atomicNumber) ?? "unknown"}"
						type="button"
						data-atomic-number=${entry.atomicNumber}
						aria-pressed=${match.atomicNumber === selected}
						@pointerdown=${(event: PointerEvent) => this.#startElementDrag(event, entry.atomicNumber)}
						@click=${() => this.#selectFromUser(entry.atomicNumber)}
					>
						<span class="list-number">${entry.atomicNumber}</span>
						<span class="list-symbol">${entry.symbol}</span>
						<span class="list-name">${entry.names[language]}</span>
						${this.pickerMode ? nothing : html`<span class="list-category">${categoryText(entry, language)}</span>`}
						${mode.state === null
							? mode.badge === null
								? null
								: html`<sl-tag class="list-year" size="small" variant="neutral">${mode.badge}</sl-tag>`
							: html`
							<sl-tag class="state-tag list-state state-${mode.state}" size="small" variant="neutral">
								${stateText(mode.state, t)}
							</sl-tag>
						`}
					</button>
				</li>
			`;
		});
		return html`
			<div class="table-pane">
				<ul class="list" aria-label=${t.gridLabel}>
					${!this.pickerMode && element !== null && !selectedVisible
						? html`<li class="list-details">${details}</li>`
						: null}
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
		const rows = element ? detailRows(element, language, this.#temperature) : [];
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
							<p class="print-hint">${t.detailsHint} ${conditionsText(language, this.#temperature)}</p>
						`
						: html`<p class="print-hint">${t.detailsEmpty}</p>`}
				</div>
			</div>
		`;
	}

	#atomBuilder(): AtomReceiver | undefined {
		return worksheetPeers(this, BUILDER_TAG).find((peer): peer is AtomReceiver =>
			typeof (peer as Partial<AtomReceiver>).viewAtom === "function");
	}

	#observeAtomPeers() {
		if (this.#atomPeersObserver) return;
		const registry = this.ownerDocument.defaultView?.customElements;
		if (registry && !registry.get(BUILDER_TAG)) void registry.whenDefined(BUILDER_TAG).then(() => {
			if (this.isConnected && this.#atomPreview) this.requestUpdate();
		});
		this.#atomPeersObserver = new MutationObserver(records => {
			if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
				node instanceof Element && (node.matches(BUILDER_TAG) || node.querySelector(BUILDER_TAG))))) this.requestUpdate();
		});
		this.#atomPeersObserver.observe(worksheetScope(this), { childList: true, subtree: true });
	}

	#toggleAtomPreview() {
		this.#atomPreview = !this.#atomPreview;
		if (this.#atomPreview) this.#observeAtomPeers();
		else {
			this.#atomPeersObserver?.disconnect();
			this.#atomPeersObserver = null;
		}
		this.requestUpdate();
	}

	#renderAtomPreview(element: ElementReference, language: Language) {
		const choices = this.#atomChoices;
		const configuration = electronConfiguration(element.atomicNumber, 0);
		const t = (en: string, de: string) => language === "de" ? de : en;
		const change = (next: typeof choices) => {
			this.#atomChoices = next;
			this.requestUpdate();
		};
		return html`<div class="pt-atom-preview">
			${renderAtomicControls(configuration, choices, change, t)}
			<chemlab-atomic-figure class="pt-atom-figure" lang=${language} .atomicNumber=${element.atomicNumber}
				.symbolText=${element.symbol} .configuration=${configuration} .choices=${choices} .pause=${this.pauseShellElectrons}>
			</chemlab-atomic-figure>
		</div>`;
	}

	/**
	 * Renders the detail card of one element.
	 *
	 * The card is a Shoelace card, so it shares the surface and the border of the
	 * rest of the widget. Its header carries the identity of the element in one
	 * row. Below it the card shows the key rows — the weight and the answer of the
	 * current mode — and stops there: the free block of the table is only three
	 * rows tall, and a card that grew with its content would stretch the periods
	 * around it. The toggle in the corner opens the rest as an overlay above the
	 * cells. The list passes `collapsible: false`, because its card replaces the
	 * selected row and has the room to stay open.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @param element - Selected element, or `null` for the empty card.
	 * @param options - Whether the card can collapse and whether it is open.
	 * @returns The detail card with its shell.
	 */
	#renderDetails(
		t: Strings,
		language: Language,
		element: ElementReference | null,
		options: DetailsOptions,
	) {
		if (!element) {
			return html`
				<div class="details-shell">
					<sl-card class="details-card details-card-empty" tabindex="-1">
						<div class="details-empty">
							<sl-icon class="details-empty-icon" src=${POINTER_ICON}></sl-icon>
							<p>${t.detailsEmpty}</p>
						</div>
					</sl-card>
				</div>
			`;
		}
		const atomView = this.#atomPreview;
		const openBuilder = atomView && this.#atomBuilder();
		const viewText = atomView ? (language === "de" ? "Elementinformationen" : "Element information")
			: (language === "de" ? "Atommodelle" : "Atom models");
		const builderText = language === "de" ? "Im Molekülbaukasten öffnen" : "Open in Molecule Builder";
		const rows = atomView ? [] : detailRows(element, language, this.#temperature);
		const key = keyRows(rows, this.#mode.mode);
		const rest = rows.filter(row => !key.includes(row));
		const name = element.names[language];
		const expanded = options.expanded;
		const open = !atomView && options.collapsible && expanded;
		return html`
			<div
				class="details-shell ${atomView ? "is-atom is-expanded" : open ? "is-expanded" : ""}"
				@keydown=${this.#onDetailsKeydown}
			>
				<sl-card
					class="details-card category-${categoryOf(element.atomicNumber) ?? "unknown"}"
					tabindex="-1"
				>
					<div slot="header" class="details-head">
						<span class="details-thumb">${element.symbol}</span>
						<h5 class="details-title" title=${name}>${name}</h5>
						<sl-badge class="details-number" variant="neutral" pill>
							${element.atomicNumber}
						</sl-badge>
						<sl-tag class="details-family" size="small" variant="neutral">
							${categoryText(element, language)}
						</sl-tag>
						<div class="details-view-actions">
							${openBuilder ? html`<sl-button class="details-view-button" size="small" title=${builderText} aria-label=${builderText}
								@click=${() => {
									const builder = this.#atomBuilder();
									if (builder?.viewAtom(element.atomicNumber, this.#atomChoices.model)) builder.scrollIntoView({ block: "nearest" });
								}}>${OPEN_BUILDER_ICON}</sl-button>` : nothing}
							<sl-button class="details-view-button atom-preview-toggle" size="small" variant=${atomView ? "primary" : "default"}
								title=${viewText} aria-label=${viewText} aria-pressed=${String(atomView)} @click=${this.#toggleAtomPreview}>
								${atomView ? ELEMENT_DETAILS_ICON : ATOM_PREVIEW_ICON}
							</sl-button>
						</div>
					</div>
					${atomView ? this.#renderAtomPreview(element, language) : html`<div class="details-body">
						<dl class="details-rows details-key">
							${key.map(row => this.#renderDetailRow(t, row))}
						</dl>
						${expanded
							? html`<div class="details-more">${this.#renderDetailSections(t, rest)}</div>`
							: null}
					</div>`}
				</sl-card>
				${options.collapsible && !atomView
					? html`
						<sl-button
							class="details-toggle"
							size="small"
							title=${expanded ? t.detailsCollapse : t.detailsExpand}
							aria-label=${expanded ? t.detailsCollapse : t.detailsExpand}
							aria-expanded=${expanded}
							@click=${this.#toggleDetails}
						>${CHEVRON_ICON}</sl-button>
					`
					: null}
			</div>
		`;
	}

	/**
	 * Renders the sections the expanded card adds.
	 *
	 * A section without a row is dropped, which keeps the card free of empty
	 * headings: the state row moves into the key rows in the temperature mode and
	 * the discovery row in the discovery mode, so the section it came from can
	 * become empty.
	 *
	 * @param t - Interface strings.
	 * @param rows - Rows the key rows do not already show.
	 * @returns The sections in display order.
	 */
	#renderDetailSections(t: Strings, rows: readonly DetailRow[]) {
		return DETAIL_SECTIONS.map(entry => {
			const own = rows.filter(row => row.section === entry.section);
			if (own.length === 0) return null;
			return html`
				<section class="details-section details-section-${entry.section}">
					<sl-tag class="details-heading" size="small" variant="neutral">
						${t[entry.label]}
					</sl-tag>
					<dl class="details-rows">
						${own.map(row => this.#renderDetailRow(t, row))}
					</dl>
				</section>
			`;
		});
	}

	/**
	 * Renders one row of the detail card.
	 *
	 * The state value is a tag in the colour of the state, so the value is legible
	 * at a glance. A predicted value carries a badge instead of a bare word, and
	 * the badge explains itself in a tooltip, so the card stays short without
	 * hiding what the qualifier means. A row with an alternate face renders its
	 * value as a button that swaps the two readings; the button is styled as the
	 * text it replaces, because the card should not advertise a control it does
	 * not need.
	 *
	 * @param t - Interface strings.
	 * @param row - Row to render.
	 * @returns The row.
	 */
	#renderDetailRow(t: Strings, row: DetailRow) {
		const face = rowFace(row, this.#showShells);
		const other = rowFace(row, !this.#showShells);
		const value = row.swatch
			? html`
				<sl-tag
					class="state-tag state-${row.swatch}"
					size="small"
					variant="neutral"
				>
					${face.value}
				</sl-tag>
			`
			: row.alternate
				? html`<button
					class="details-swap"
					type="button"
					aria-label=${other.label}
					@click=${this.#toggleShells}
				>${face.value}</button>`
				: html`<span>${face.value}</span>`;
		return html`
			<div class="details-row">
				<dt>${face.label}</dt>
				<dd>
					${value}
					${row.qualifier
						? html`
							<sl-tooltip content=${t.qualifierHint} hoist>
								<sl-badge class="details-qualifier" variant="neutral" pill>
									${row.qualifier}
								</sl-badge>
							</sl-tooltip>
						`
						: null}
				</dd>
			</div>
		`;
	}

	/**
	 * Renders the info dialog with the sources and the model notes.
	 *
	 * The sources are global, not per element, so they sit behind one button in
	 * the toolbar instead of in the detail card. Each source carries its release
	 * as a badge and its licence and retrieval date as tags, which keeps the
	 * block scannable while the attribution and the URL stay in running text.
	 *
	 * @param t - Interface strings.
	 * @param language - Interface language.
	 * @returns The dialog, closed unless the info button was pressed.
	 */
	#renderInfo(t: Strings, language: Language) {
		return html`
			<sl-dialog
				class="info"
				label=${t.infoLabel}
				?open=${this.#infoOpen}
				@sl-after-hide=${this.#onInfoHide}
			>
				<p class="info-intro">${t.infoIntro}</p>
				<section class="info-section">
					<h3>${t.infoSources}</h3>
					${sourceList().map(source => html`
						<article class="info-source">
							<p class="info-source-title">${source.publisher} — ${source.title}</p>
							<div class="info-source-meta">
								<sl-badge variant="neutral" pill>
									${format(t.sourceRelease, { release: source.release })}
								</sl-badge>
								<sl-tag size="small" variant="neutral">
									${format(t.sourceLicense, { license: source.license })}
								</sl-tag>
								<sl-tag size="small" variant="neutral">
									${format(t.sourceRetrieved, { retrieved: source.retrieved })}
								</sl-tag>
							</div>
							<p class="info-source-text">
								${t.infoFields}: ${source.fields.map(field => sourceFieldText(field, t)).join(", ")}
							</p>
							<p class="info-source-text">${source.attribution}</p>
							<a
								class="info-source-link"
								href=${source.url}
								target="_blank"
								rel="noreferrer noopener"
							>${source.url}</a>
						</article>
					`)}
				</section>
				<section class="info-section">
					<h3>${t.infoNotes}</h3>
					<p class="info-note">
						${format(t.infoConditions, { conditions: conditionsText(language) })}
					</p>
					<p class="info-note">${t.infoPhaseModel}</p>
					<p class="info-note">${t.infoDiscovery}</p>
				</section>
				<sl-button slot="footer" variant="primary" @click=${this.#closeInfo}>
					${t.infoClose}
				</sl-button>
			</sl-dialog>
		`;
	}

	render() {
		const language = this.#language;
		const t = strings(language);
		const resolved = this.#resolvedView;
		// A mode that cannot place an element hides it, so the count and the grid
		// agree on what is on screen.
		const matches = this.#matches().filter(match => {
			const element = elementByAtomicNumber(match.atomicNumber);
			return element !== undefined && !cellMode(element, this.#mode).hidden;
		});
		const matching = new Set(matches.map(match => match.atomicNumber));
		// The grid fades the cells the filter leaves out instead of dropping them,
		// so every cell the mode can place stays under the pointer and in the tab
		// order; the list keeps only the rows that match.
		this.#matching = resolved === "table" ? this.#placeable() : matching;
		const selected = this.#selection.value;
		const element = selected === null ? null : elementByAtomicNumber(selected) ?? null;
		const details = this.pickerMode ? null : this.#renderDetails(t, language, element, {
			expanded: resolved === "list" || this.#detailsExpanded,
			collapsible: resolved === "table",
		});
		return html`
			<div class="widget">
				${this.pickerMode ? nothing : this.#renderRibbon(t, language, resolved, matches.length)}
				${resolved === "list"
					? this.#renderList(t, language, matches, element, details)
					: this.#renderGrid(t, language, matching, details)}
				${this.pickerMode ? nothing : html`
					${this.#renderPrintOverview(t, language, element)}
					<sl-icon-button
						class="info-button"
						src=${INFO_ICON}
						label=${t.infoLabel}
						title=${t.infoLabel}
						@click=${this.#openInfo}
					></sl-icon-button>
					${this.#renderInfo(t, language)}
				`}
			</div>
		`;
	}

	static styles = [periodicTableStyles, atomicModelStyles];
}

// The builder bundles the table as a scoped component as well as a standalone widget.
if (!customElements.get("webwriter-chemlab-periodic-table")) {
	customElements.define("webwriter-chemlab-periodic-table", ChemLabPeriodicTable);
}

declare global {
	interface HTMLElementTagNameMap {
		"webwriter-chemlab-periodic-table": ChemLabPeriodicTable;
	}
}
