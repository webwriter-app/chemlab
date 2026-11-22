import { LitElementWw } from "@webwriter/lit";
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import SlBadge from "@shoelace-style/shoelace/dist/components/badge/badge.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlSpinner from "@shoelace-style/shoelace/dist/components/spinner/spinner.component.js";
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import { ChemLabPeriodicTable, LIST_ICON, TABLE_ICON } from "./webwriter-chemlab-periodic-table";
import { elementByAtomicNumber } from "./periodic-table/element-reference";
import { metalCrystal } from "./periodic-table/metal-reference";
import { ELEMENT_SELECTION_EVENT, isAtomicNumber, type ElementSelectionV1 } from "./periodic-table/selection";
import { SelectionRouter } from "./periodic-table/routing";
import { catalogAqueousStructure, catalogEntry, catalogIsMixture, catalogStructures, structureCatalog } from "./molecule-builder/catalog";
import { BUILDER_TAG, LAB_TAG, TABLE_TAG, worksheetPeers, worksheetScope, type LabReceiver } from "./molecule-builder/exchange";
import { colorHex, crystalIonColors, crystalRadii, siteIon } from "./molecule-builder/crystal-display";
import { add, fitGeometry, canBond, shapeName, formula, subtract } from "./molecule-builder/geometry";
import {
	MAX_ATOMS, MAX_SITES, MAX_FILE_BYTES, cellVectors, fractional, isCell,
	newCrystal, newMolecule, readStructure, type BondOrder, type Cell, type Point2, type Point3, type Structure,
} from "./molecule-builder/structure";
import { chemicalFormula, crystalSpecies, editableRepeatUnit, empiricalCrystalFormula, freeCrystalSite, lewisDiagram, monatomicCharge } from "./molecule-builder/structure-diagram";
import { aqueousComponents, hydrationWaters } from "./molecule-builder/aqueous-preview";
import { diagramIsCrowded, improveDiagram, repairSavedDiagram } from "./molecule-builder/diagram-layout";
import { lewisViewBox, renderLewis, type DiagramBox } from "./molecule-builder/lewis-view";
import { atomRadius, spaceFillingRadius } from "./molecule-builder/radii";
import { hasMolecularDisplays, moleculeOrbitals, ORBITAL_PHASE_COLORS, type MolecularDisplay } from "./molecule-builder/orbitals";
import { atomicSpecies, electronConfiguration, type AtomicSpecies } from "./molecule-builder/atomic-configuration";
import { AtomicFigure } from "./molecule-builder/atomic-figure";
import { atomicModelStyles, initialAtomChoices, pauseShellElectronsOption, renderAtomicControls,
	type AtomicModel } from "./molecule-builder/atomic-model";
import { gridCell } from "./molecule-builder/canvas-grid";
import { builderStyles } from "./molecule-builder/styles";
import type { MoleculeScene } from "./molecule-builder/scene";

type AtomInspection = { species: AtomicSpecies; configuration: ReturnType<typeof electronConfiguration> };
type Tool = "orbit" | "atom" | "bond";
type Pointer = { x: number; y: number; id?: number };
type Gesture = Pointer & { from?: number; distance: number; moved: boolean; diagram?: Point2 };
const symbol = (atomicNumber: number) => elementByAtomicNumber(atomicNumber)?.symbol ?? "";
const chargeText = (charge: number) => charge === 0 ? "" : `${Math.abs(charge) > 1 ? Math.abs(charge) : ""}${charge > 0 ? "+" : "−"}`;
const distance = (a: Pointer, b: Pointer) => Math.hypot(a.x - b.x, a.y - b.y);
const pointer = (event: PointerEvent): Pointer => ({ x: event.clientX, y: event.clientY, id: event.pointerId });
const groups = [...new Set(structureCatalog.map(entry => entry.category))];
/**
 * The element grid needs about 20 px per column, so the palette takes the width
 * of the table (27rem, capped at 55 % of the workspace) while the grid is shown.
 * The body loses 15 px to the palette padding and border, which leaves 417 px for
 * eighteen columns at the cap. Below 410 px of body the grid clips its symbols,
 * so the grid button stays disabled and its tooltip names the reason.
 */
const PALETTE_GRID_MIN = 410;
/** Share of the workspace the palette may take while the element grid is shown. */
const PALETTE_GRID_SHARE = .55;
/** Palette padding and border, which the element grid does not get. */
const PALETTE_CHROME = 15;
/** Canvas view controls use the same icon size as the lab's canvas controls. */
const CUBE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
	<path d="M8 1.9 13.8 5v6L8 14.1 2.2 11V5z" /><path d="M2.2 5 8 8.1 13.8 5M8 8.1v6" /></svg>`;
const ATOMIC_ORBITALS_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">
	<path d="M8 8C2 8 1 5 2.8 3.2 4.6 1.5 8 2 8 8s3.4 6.5 5.2 4.8C15 11 14 8 8 8Z" />
	<circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /></svg>`;
const BACK_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">
	<path d="M13 8H3m4-4L3 8l4 4" /></svg>`;
const superscript = (value: string) => value.replace(/[0-9+−]/g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻"["0123456789+−".indexOf(c)]);
const PLANE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
	<path d="M8 1.9 13.8 5v6L8 14.1 2.2 11V5z" /><circle cx="8" cy="8" r="1.7" /></svg>`;
/** Fit control of the canvas, drawn exactly like the lab's fit button. */
const FIT_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
	<path d="M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4" /><rect x="5" y="5" width="6" height="6" rx="0.5" /></svg>`;
const FULLSCREEN_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
	<path d="M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4" /></svg>`;
const EXIT_FULLSCREEN_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
	<path d="M2 6h4V2m4 0v4h4m0 4h-4v4m-4 0v-4H2" /></svg>`;
const NEW_MOLECULE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
	<path d="m6 6 3-2M6 8l3 2m4 .7v4.2m-2.1-2.1h4.2" /><circle cx="4.5" cy="7" r="1.7" />
	<circle cx="10.4" cy="3.3" r="1.6" /><circle cx="10.4" cy="10.7" r="1.4" /></svg>`;
const NEW_CRYSTAL_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
	<path d="m7.3 1.8 4.9 3v4.1l-4.9 4.2-5-3.7V4.8zm-5 3 5 3 4.9-3M7.3 7.8v5.1m6-2.5v4.5m-2.2-2.2h4.5" /></svg>`;
/** Zoom controls of the canvas, drawn exactly like the lab's zoom buttons. */
const ZOOM_IN_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" aria-hidden="true">
	<path d="M3 8h10M8 3v10" /></svg>`;
const ZOOM_OUT_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" aria-hidden="true">
	<path d="M3 8h10" /></svg>`;
/** Ribbon icons: the header actions and the editing tools carry no text. */
const CATALOG_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M6.2 2h3.6M6.8 2v4.3L3.4 12.2A1.1 1.1 0 0 0 4.4 13.8h7.2a1.1 1.1 0 0 0 1-1.6L9.2 6.3V2" />
	<path d="M4.9 9.6h6.2" /></svg>`;
const FILE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M4 2.2h4.6L12 5.6v8.2H4z" /><path d="M8.6 2.2v3.4H12" /></svg>`;
const SEND_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M2.6 9.6v2.9a1.1 1.1 0 0 0 1.1 1.1h8.6a1.1 1.1 0 0 0 1.1-1.1V9.6" />
	<path d="M8 10.2V2.4M5.1 5.3 8 2.4l2.9 2.9" /></svg>`;
const ORBIT_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M13.2 8a5.2 5.2 0 1 1-1.6-3.8" /><path d="M13.4 2.4v3.2H10.2" /></svg>`;
const CURSOR_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M4.2 2.6 12 8.4l-3.6.5-1.7 3.4z" /></svg>`;
const ATOM_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.2">
	<circle cx="8" cy="8" r="1.5" /><ellipse cx="8" cy="8" rx="5.8" ry="2.4" />
	<ellipse cx="8" cy="8" rx="5.8" ry="2.4" transform="rotate(60 8 8)" /></svg>`;
const BOND_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
	<circle cx="3.9" cy="12.1" r="1.7" /><circle cx="12.1" cy="3.9" r="1.7" /><path d="M5.2 10.8 10.8 5.2" /></svg>`;
const GEOMETRY_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
	<path d="M8 8 3.6 4.4M8 8l4.4-3.6M8 8v4.6" /><circle cx="8" cy="8" r="1.4" />
	<circle cx="3.6" cy="4.4" r="1.2" /><circle cx="12.4" cy="4.4" r="1.2" /><circle cx="8" cy="12.6" r="1.2" /></svg>`;
const CRYSTAL_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
	<path d="M8 2.2 13.4 6.3 8 13.8 2.6 6.3z" /><path d="M2.6 6.3h10.8M8 2.2 6.1 6.3 8 13.8l1.9-7.5z" /></svg>`;
/** Display switches of the model summary, one glyph per legend entry. */
const EDGES_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
	<path d="M8 2 13.6 5.2v5.6L8 14 2.4 10.8V5.2z" /></svg>`;
const LATTICE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" stroke="none">
	<circle cx="3.4" cy="3.4" r="1.3" /><circle cx="8" cy="3.4" r="1.3" /><circle cx="12.6" cy="3.4" r="1.3" />
	<circle cx="3.4" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12.6" cy="8" r="1.3" />
	<circle cx="3.4" cy="12.6" r="1.3" /><circle cx="8" cy="12.6" r="1.3" /><circle cx="12.6" cy="12.6" r="1.3" /></svg>`;
const AXES_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M3.4 12.6V3.4M3.4 12.6h9.2M3.4 12.6 8.6 7.4" /><path d="M3.4 2.2v1.2M2.2 12.6h1.2M9.6 6.4 8.6 7.4 9.6 8.4" /></svg>`;
const ELECTRONS_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" stroke="none">
	<circle cx="4.4" cy="8" r="1.7" /><circle cx="11.6" cy="8" r="1.7" /></svg>`;

@customElement(BUILDER_TAG)
export class ChemLabMoleculeBuilder extends LitElementWw {
	static styles = [builderStyles, atomicModelStyles];
	static scopedElements = {
		"webwriter-chemlab-periodic-table": ChemLabPeriodicTable,
		"chemlab-atomic-figure": AtomicFigure,
		"sl-badge": SlBadge, "sl-button": SlButton, "sl-details": SlDetails, "sl-icon": SlIcon,
		"sl-input": SlInput, "sl-popup": SlPopup, "sl-spinner": SlSpinner, "sl-tag": SlTag,
	};
	static options = {
		pauseShellElectrons: pauseShellElectronsOption,
		elementSourceId: {
			type: "string" as const, attribute: "element-source-id",
			label: { _: "Linked periodic table ID", "de-DE": "ID des verknüpften Periodensystems" },
		},
		labId: {
			type: "string" as const, attribute: "lab-id",
			label: { _: "Linked ChemLab ID", "de-DE": "ID des verknüpften ChemLab" },
		},
	};
	options = ChemLabMoleculeBuilder.options;
	@property({ type: String, attribute: "element-source-id", reflect: true }) accessor elementSourceId = "";
	@property({ type: String, attribute: "lab-id", reflect: true }) accessor labId = "";
	@property({ type: Boolean, attribute: "pause-shell-electrons", reflect: true }) accessor pauseShellElectrons = false;

	@state() private accessor draft: Structure = newMolecule();
	@state() private accessor preview: Structure | undefined;
	@state() private accessor catalogKey = "";
	@state() private accessor catalogVariants: Structure[] = [];
	@state() private accessor catalogIndex = 0;
	@state() private accessor catalogQuery = "";
	@state() private accessor openPanel: "catalog" | "file" | undefined;
	@state() private accessor labs: HTMLElement[] = [];
	@state() private accessor showLabs = false;
	@state() private accessor paletteOpen = true;
	@state() private accessor paletteNarrow = false;
	@state() private accessor pickerView: "list" | "table" = "list";
	@state() private accessor showElectrons = false;
	@state() private accessor molecularDisplay: MolecularDisplay = "sticks";
	@state() private accessor orbitalId = "";
	@state() private accessor inspectedAtom: { id: number; returnView: "2d" | "3d" } | undefined;
	@state() private accessor dismissedLone: number | undefined;
	@state() private accessor atomChoices = initialAtomChoices();
	@state() private accessor showHydration = false;
	@state() private accessor showLattice = false;
	@state() private accessor showEdges = true;
	@state() private accessor showAxes = false;
	@state() private accessor view: "3d" | "2d" = "3d";
	@state() private accessor tool: Tool = "orbit";
	@state() private accessor element = 6;
	@state() private accessor picked: number | undefined;
	@state() private accessor hoveredAtom: number | undefined;
	@state() private accessor bondStart: number | undefined;
	@state() private accessor bondOrder: BondOrder = 1;
	@state() private accessor repeats = 1;
	@state() private accessor notice = "";
	@state() private accessor gpu: "idle" | "loading" | "ready" | "unavailable" = "idle";
	@state() private accessor diagramBox: DiagramBox | undefined;
	@state() private accessor fullscreen: "native" | "viewport" | undefined;
	@state() private accessor ionCharge = 0;
	@state() private accessor diagramDrag: { id: number; position: Point2 } | undefined;
	@state() private accessor bondPreview: Point2 | undefined;
	@state() private accessor paletteDrag: (Pointer & { atomicNumber: number }) | undefined;
	#scene?: MoleculeScene;
	#sceneLoad = 0;
	#fitNext = true;
	#past: Structure[] = [];
	#future: Structure[] = [];
	#elementDrag?: AbortController;
	#fileOpen = 0;
	#gesture?: Gesture;
	#pointers = new Map<number, Pointer>();
	#router?: SelectionRouter;
	#paletteObserver?: ResizeObserver;
	#boardObserver?: ResizeObserver;
	#scenePixelsPerAngstrom = 0;
	#dataObserver?: MutationObserver;
	#worksheetObserver?: MutationObserver;
	#waitingForLab = false;
	#lastSaved = "";
	#aqueousCache?: {
		structure: Structure;
		components: ReturnType<typeof aqueousComponents>;
		waters: ReturnType<typeof hydrationWaters>;
		monatomicIons: ReadonlySet<number>;
	};
	#lewisCache?: { structure: Structure; value: ReturnType<typeof lewisDiagram> };
	#atomicScale = 0;
	@state() private accessor orbitalHint: string | undefined;
	get #atomicFigure() { return this.renderRoot.querySelector<AtomicFigure>("chemlab-atomic-figure"); }

	get #current() { return this.preview ?? this.draft; }
	get #atoms() { const current = this.#current; return current.kind === "molecule" ? current.atoms : current.sites; }
	get #readonly() { return this.preview !== undefined; }

	get #atomicTarget() {
		const current = this.#current;
		if (this.inspectedAtom) return this.#atoms.find(atom => atom.id === this.inspectedAtom.id);
		if ((this.view === "3d" || this.gpu === "unavailable") && current.kind === "molecule" && current.atoms.length === 1
			&& current.atoms[0].id !== this.dismissedLone) return current.atoms[0];
		return undefined;
	}

	get #atomInspection(): AtomInspection | undefined {
		const atom = this.#atomicTarget;
		if (!atom) return undefined;
		const species = atomicSpecies(this.#current, atom.id);
		if (!species) return undefined;
		return { species, configuration: electronConfiguration(species.atomicNumber, species.charge) };
	}

	#resetAtomicChoices() {
		this.atomChoices = initialAtomChoices();
		this.orbitalHint = undefined;
	}

	#inspectAtom(id: number) {
		this.#resetAtomicChoices();
		this.bondStart = undefined;
		this.inspectedAtom = { id, returnView: this.view };
		if (this.gpu !== "unavailable") this.view = "3d";
		this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(".atomic-summary .atomic-back")?.focus());
	}

	#leaveAtom() {
		if (this.inspectedAtom) {
			this.view = this.gpu === "unavailable" ? "2d" : this.inspectedAtom.returnView;
			this.inspectedAtom = undefined;
		} else this.dismissedLone = this.#atomicTarget?.id;
		this.#resetAtomicChoices();
		this.updateComplete.then(() => (this.renderRoot.querySelector<HTMLElement>(".inspect-atom")
			?? this.renderRoot.querySelector<HTMLElement>(".board"))?.focus());
	}

	#t(en: string, de: string) { return this.lang?.toLowerCase().startsWith("de") ? de : en; }

	override connectedCallback() {
		super.connectedCallback();
		this.ownerDocument.addEventListener("fullscreenchange", this.#onFullscreenChange);
		this.#restore();
		this.#dataObserver = new MutationObserver(() => this.#restore());
		this.#dataObserver.observe(this, { childList: true, subtree: true, characterData: true });
		this.#worksheetObserver = new MutationObserver(records => {
			if (records.some(record => record.type === "attributes")) this.requestUpdate();
			if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
				node instanceof Element && (node.matches(LAB_TAG) || node.querySelector(LAB_TAG))))) this.#refreshLabs();
		});
		this.#worksheetObserver.observe(worksheetScope(this), { childList: true, subtree: true });
		this.#worksheetObserver.observe(this, { attributes: true, attributeFilter: ["class"] });
		this.#refreshLabs();
		this.#bindTable();
	}

	override disconnectedCallback() {
		this.ownerDocument.removeEventListener("fullscreenchange", this.#onFullscreenChange);
		this.renderRoot.querySelector(".builder")?.removeAttribute("popover");
		this.fullscreen = undefined;
		this.#boardObserver?.disconnect();
		this.#boardObserver = undefined;
		this.#scenePixelsPerAngstrom = 0;
		this.#fileOpen++;
		this.#sceneLoad++;
		this.#elementDrag?.abort();
		this.paletteDrag = undefined;
		this.#pointers.clear();
		this.#gesture = undefined;
		this.#router?.dispose();
		this.#paletteObserver?.disconnect();
		this.#paletteObserver = undefined;
		this.#dataObserver?.disconnect();
		this.#worksheetObserver?.disconnect();
		this.#scene?.canvas.removeEventListener("webglcontextlost", this.#onContextLost);
		this.#scene?.destroy();
		this.#scene = undefined;
		this.gpu = "idle";
		super.disconnectedCallback();
	}

	override updated(changed: Map<PropertyKey, unknown>) {
		if (!this.#boardObserver) {
			const board = this.renderRoot.querySelector(".board");
			if (board) {
				this.#boardObserver = new ResizeObserver(() => this.#syncGrid());
				this.#boardObserver.observe(board);
			}
		}
		if (changed.has("elementSourceId")) this.#bindTable();
		this.#observePalette();
		const atomic = this.#atomInspection;
		const sceneVisible = this.view === "3d" && !atomic;
		if (!atomic) this.#atomicScale = 0;
		if (sceneVisible && this.gpu === "idle") void this.#startScene();
		if (this.#scene && sceneVisible) {
			this.#scene.setScene(this.#current, this.repeats, [this.picked, this.bondStart].filter(id => id !== undefined),
				{ electrons: this.showElectrons, lattice: this.showLattice, edges: this.showEdges, axes: this.showAxes,
					molecular: this.molecularDisplay, orbitalId: this.orbitalId,
					hydration: this.showHydration && this.#current.kind === "molecule" && this.#current.representation === "aqueous-ions" });
			if (this.#fitNext) {
				this.#fitNext = false;
				this.#scene.fit();
			}
		}
		this.#syncGrid();
	}

	#onFullscreenChange = () => {
		const native = (this.getRootNode() as Document | ShadowRoot).fullscreenElement === this;
		if (native || this.fullscreen === "native") this.fullscreen = native ? "native" : undefined;
	};

	#onViewportToggle = (event: Event) => {
		const builder = event.currentTarget as HTMLElement;
		if (event.target !== builder || builder.matches(":popover-open")) return;
		builder.removeAttribute("popover");
		if (this.fullscreen === "viewport") this.fullscreen = undefined;
	};

	#toggleFullscreen = async () => {
		const builder = this.renderRoot.querySelector<HTMLElement>(".builder");
		if (this.fullscreen === "viewport") {
			builder?.hidePopover();
			return;
		}
		try {
			if (this.fullscreen === "native") await this.ownerDocument.exitFullscreen();
			else await this.requestFullscreen();
		} catch {
			if (this.fullscreen !== "native" && typeof builder?.showPopover === "function") {
				try {
					// The top layer fills this document's viewport, including inside a worksheet frame.
					builder.setAttribute("popover", "auto");
					builder.showPopover();
					this.fullscreen = "viewport";
					return;
				} catch {
					builder.removeAttribute("popover");
				}
			}
			this.notice = this.#t("Fullscreen is unavailable in this worksheet.", "Vollbild ist in diesem Arbeitsblatt nicht verfügbar.");
		}
	};

	#syncGrid() {
		const board = this.renderRoot.querySelector<HTMLElement>(".board");
		const scale = this.renderRoot.querySelector<HTMLElement>(".grid-length");
		if (!board || !scale) return;
		const drawing = this.renderRoot.querySelector<SVGSVGElement>(".lewis-view");
		const box = drawing?.viewBox.baseVal;
		const atomic = this.#atomInspection;
		const pixelsPerUnit = atomic ? (this.atomChoices.model === "orbitals" ? this.#atomicScale : 0)
			: this.view === "3d" ? this.#scenePixelsPerAngstrom
				: box && Math.min(drawing.clientWidth / box.width, drawing.clientHeight / box.height);
		const cell = gridCell(pixelsPerUnit);
		board.toggleAttribute("data-unit-grid", !!cell);
		scale.parentElement.hidden = !cell;
		if (!cell) return;
		const size = `${cell.pixels.toFixed(3)}px`;
		if (board.style.getPropertyValue("--grid-cell") !== size) board.style.setProperty("--grid-cell", size);
		const length = cell.length.toLocaleString(this.lang?.startsWith("de") ? "de" : "en", { maximumSignificantDigits: 4 });
		const label = atomic || this.view === "3d" ? `${length} Å` : `${length} ${this.#t("du", "ZE")}`;
		if (scale.textContent !== label) scale.textContent = label;
		scale.parentElement.title = atomic || this.view === "3d"
			? this.#t("Width of one grid cell at the centre of rotation.", "Breite eines Rasterkästchens am Drehzentrum.")
			: this.#t("Width of one grid cell in diagram units.", "Breite eines Rasterkästchens in Zeichnungseinheiten.");
	}

	#bindTable() {
		this.#router?.dispose();
		if (!this.elementSourceId || !this.isConnected) return;
		this.#router = new SelectionRouter({
			root: worksheetScope(this) as unknown as ConstructorParameters<typeof SelectionRouter>[0]["root"],
			expectedTag: TABLE_TAG,
			sourceId: this.elementSourceId,
			onSelection: detail => { if (detail.atomicNumber !== null) this.#chooseElement(detail.atomicNumber); },
		});
		this.#router.bind();
	}

	/**
	 * Watches the workspace width. The palette takes the width of the element grid
	 * while the grid is shown, so a narrow embed disables the grid button instead
	 * of clipping the symbols. The measurement is the workspace, not the palette,
	 * because the palette is narrow in the list and would block its own switch.
	 */
	#observePalette() {
		const workspace = this.renderRoot.querySelector<HTMLElement>(".workspace");
		if (!workspace) {
			this.#paletteObserver?.disconnect();
			this.#paletteObserver = undefined;
			return;
		}
		if (this.#paletteObserver) return;
		this.#paletteObserver = new ResizeObserver(entries => {
			const width = entries[0]?.contentRect.width ?? 0;
			// The 27rem cap of the stylesheet is wider than the grid needs, so only
			// the share decides whether the grid fits.
			const narrow = width > 0 && width * PALETTE_GRID_SHARE < PALETTE_GRID_MIN + PALETTE_CHROME;
			if (narrow !== this.paletteNarrow) this.paletteNarrow = narrow;
		});
		this.#paletteObserver.observe(workspace);
	}

	async #startScene() {
		const host = this.renderRoot.querySelector<HTMLElement>(".scene");
		if (!host) return;
		const request = ++this.#sceneLoad;
		this.gpu = "loading";
		try {
			const { MoleculeScene } = await import("./molecule-builder/scene");
			if (request !== this.#sceneLoad || !host.isConnected || this.gpu !== "loading") return;
			const scene = await MoleculeScene.create(host, pixelsPerAngstrom => {
				if (request !== this.#sceneLoad) return;
				this.#scenePixelsPerAngstrom = pixelsPerAngstrom;
				if (this.view === "3d") this.#syncGrid();
			});
			if (request !== this.#sceneLoad || !host.isConnected || this.gpu !== "loading" || this.#scene) {
				scene.destroy();
				return;
			}
			this.#scene = scene;
			scene.canvas.addEventListener("webglcontextlost", this.#onContextLost, { once: true });
			this.#fitNext = true;
			this.gpu = "ready";
		} catch (error) {
			console.warn("ChemLab Molecule Builder could not initialize 3D", error);
			if (request === this.#sceneLoad && host.isConnected && this.gpu === "loading") this.#fallback();
		}
	}

	#onContextLost = (event: Event) => {
		if (event.currentTarget === this.#scene?.canvas) this.#fallback();
	};

	#fallback() {
		this.#scene?.destroy();
		this.#scene = undefined;
		this.gpu = "unavailable";
		this.view = "2d";
		this.notice = this.#t("3D is unavailable. You can keep working in Structure view.", "3D ist nicht verfügbar. Die Strukturansicht bleibt bedienbar.");
	}

	#dataBlock() { return this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"][slot="data"]'); }

	#restore() {
		const value = this.#dataBlock()?.textContent ?? "";
		if (value === this.#lastSaved) return;
		try {
			if (value.length > MAX_FILE_BYTES) throw new Error("File too large");
			const snapshot = value ? readStructure(JSON.parse(value)) : newMolecule();
			if (!snapshot) throw new Error("Invalid structure");
			this.#past = [];
			this.#future = [];
			this.#lastSaved = value;
			this.draft = snapshot.kind === "molecule" ? repairSavedDiagram(snapshot) : snapshot;
			this.#resetSelection();
		} catch {
			this.notice = this.#t("The saved structure could not be opened.", "Die gespeicherte Struktur konnte nicht geöffnet werden.");
		}
	}

	#save() {
		if (this.contentEditable === "false" || !this.isConnected) return;
		const data = JSON.stringify(this.draft).replace(/</g, "\\u003c");
		let block = this.#dataBlock();
		if (!block) {
			block = this.ownerDocument.createElement("script");
			block.type = "application/json";
			block.slot = "data";
			this.append(block);
		}
		this.#lastSaved = data;
		block.textContent = data;
	}

	#record(next: Structure, fit = false) {
		this.#past = [...this.#past.slice(-59), this.draft];
		this.#future = [];
		this.draft = next;
		this.#fitNext ||= fit;
		this.notice = "";
		this.#save();
	}

	#resetSelection() {
		this.picked = undefined;
		this.hoveredAtom = undefined;
		this.bondStart = undefined;
		if (this.inspectedAtom && this.gpu !== "unavailable") this.view = this.inspectedAtom.returnView;
		this.inspectedAtom = undefined;
		this.dismissedLone = undefined;
		this.#resetAtomicChoices();
		this.bondPreview = undefined;
		this.repeats = 1;
		this.#fitNext = true;
		this.diagramBox = undefined;
		this.ionCharge = 0;
		this.tool = "orbit";
	}

	#new(kind: Structure["kind"]) {
		this.#fileOpen++;
		this.preview = undefined;
		this.openPanel = undefined;
		this.catalogKey = "";
		this.catalogVariants = [];
		this.catalogIndex = 0;
		this.#record(kind === "crystal" ? newCrystal() : newMolecule(), true);
		this.#resetSelection();
	}

	#history(redo: boolean) {
		if (this.#readonly) return;
		const source = redo ? this.#future : this.#past;
		const snapshot = source.pop();
		if (!snapshot) return;
		(redo ? this.#past : this.#future).push(this.draft);
		this.draft = snapshot;
		this.#resetSelection();
		this.#save();
	}

	#chooseElement(atomicNumber: number) {
		if (this.element !== atomicNumber && this.draft.kind === "crystal") {
			const charges = new Set(this.draft.sites.filter(site => site.atomicNumber === atomicNumber).map(monatomicCharge));
			this.ionCharge = charges.size === 1 ? charges.values().next().value : 0;
		}
		this.element = atomicNumber;
	}

	#selectPalette = (event: CustomEvent<ElementSelectionV1>) => {
		if (event.detail.atomicNumber !== null) this.#chooseElement(event.detail.atomicNumber);
	};

	#dragPalette = (event: CustomEvent<Pointer & { atomicNumber: number; pointerId: number }>) => {
		if (this.#readonly || !isAtomicNumber(event.detail.atomicNumber)) return;
		const start = event.detail;
		this.#elementDrag?.abort();
		const abort = this.#elementDrag = new AbortController();
		const options = { signal: abort.signal };
		const clear = () => { this.paletteDrag = undefined; abort.abort(); };
		window.addEventListener("pointermove", move => {
			if (move.pointerId !== start.pointerId || (!this.paletteDrag && distance(start, pointer(move)) < 5)) return;
			this.paletteDrag = { ...pointer(move), atomicNumber: start.atomicNumber };
		}, options);
		window.addEventListener("pointerup", up => {
			if (up.pointerId !== start.pointerId) return;
			if (this.paletteDrag && this.#stageTarget(up.clientX, up.clientY)) {
				this.#chooseElement(start.atomicNumber);
				this.#addAtom(this.#placement(up.clientX, up.clientY), start.atomicNumber);
			}
			clear();
		}, options);
		window.addEventListener("pointercancel", cancel => { if (cancel.pointerId === start.pointerId) clear(); }, options);
		window.addEventListener("blur", clear, options);
	};

	#insideBoard(x: number, y: number) {
		const box = this.renderRoot.querySelector(".board")?.getBoundingClientRect();
		return !!box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
	}

	#stageTarget(x: number, y: number) {
		if (!this.#insideBoard(x, y)) return false;
		const hit = this.shadowRoot?.elementFromPoint(x, y);
		const surface = this.view === "3d" || this.#atomicTarget ? ".board" : ".drawing, .formula-view";
		return !!hit?.closest(surface) && !hit.closest(".view-tools, .model-summary, .selection-card, .ion-entry, .ion-site");
	}

	#placement(x: number, y: number): Point3 | undefined {
		const atomic = this.#atomicTarget;
		if (this.inspectedAtom) return undefined;
		if (atomic && "position" in atomic) {
			const bounds = this.renderRoot.querySelector(".board")?.getBoundingClientRect();
			return bounds ? add(atomic.position, [2 * (x - bounds.left) / bounds.width - 1, 1 - 2 * (y - bounds.top) / bounds.height, 0]) : undefined;
		}
		if (this.view === "3d" && this.#scene) {
			const point = this.#scene.placement(x, y);
			return point;
		}
		if (atomic) return undefined;
		const [a, b] = this.#diagramPoint(x, y);
		return [a, b, 0];
	}

	/** The view centre, so an atom can be placed without a pointer. */
	#centre(): Point3 | undefined {
		if (this.#atomicTarget) return undefined;
		const box = this.renderRoot.querySelector(".board")?.getBoundingClientRect();
		return box ? this.#placement(box.left + box.width / 2, box.top + box.height / 2) : [0, 0, 0];
	}

	#addAtom(position?: Point3, atomicNumber = this.element) {
		if (this.#readonly) return;
		const current = this.draft;
		const atoms = this.#atoms;
		const max = current.kind === "crystal" ? MAX_SITES : MAX_ATOMS;
		if (atoms.length >= max) {
			this.notice = this.#t("This structure has reached the editor limit.", "Diese Struktur hat die Bearbeitungsgrenze erreicht.");
			return;
		}
		const id = atoms.reduce((highest, atom) => Math.max(highest, atom.id), 0) + 1;
		if (!Number.isSafeInteger(id)) return;
		const angle = atoms.length * 2.3999632297;
		const radius = 0.9 * Math.sqrt(atoms.length);
		const wasAtomic = !!this.#atomicTarget;
		const lone = current.kind === "molecule" && atoms.length === 1 && wasAtomic ? current.atoms[0].position : [0, 0, 0];
		const [x, y, z] = position ?? [lone[0] + radius * Math.cos(angle), lone[1] + radius * Math.sin(angle), lone[2]];
		if (![x, y, z].every(coordinate => Number.isFinite(coordinate) && Math.abs(coordinate) <= 10_000)) {
			this.notice = this.#t("Place the atom within the editor’s coordinate range.", "Platziere das Atom innerhalb des Koordinatenbereichs.");
			return;
		}
		if (this.inspectedAtom) this.#leaveAtom();
		this.bondStart = undefined;
		this.bondPreview = undefined;
		this.dismissedLone = undefined;
		this.#resetAtomicChoices();
		const identity = { id, atomicNumber, charge: 0 };
		if (current.kind === "crystal") {
			const formulaView = this.view === "2d";
			const coords = formulaView ? freeCrystalSite(current.sites)
				: position ? fractional(cellVectors(current.cell), position) : [x - Math.floor(x), y - Math.floor(y), .5] as const;
			if (current.sites.some(site => site.fractional.every((coordinate, axis) => Math.abs(coordinate - coords[axis]) < 1e-6))) {
				this.notice = this.#t("A site already occupies that position.", "Diese Position ist bereits belegt.");
				return;
			}
			this.#record({ ...current, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined,
				source: undefined, sites: [...current.sites, { ...identity, charge: formulaView ? this.ionCharge : 0, fractional: coords }] });
		} else {
			if (this.view === "2d" && !this.diagramBox && !current.repeatUnit) this.diagramBox = lewisViewBox(this.#lewis(current));
			const atom = { ...identity, diagram: [x, y] as Point2, position: [x, y, z] as Point3 };
			const repeatUnit = current.repeatUnit && { ...current.repeatUnit, atoms: [...current.repeatUnit.atoms, id] };
			this.#record({ ...current, name: "", catalogKey: undefined, source: undefined, representation: undefined, repeatUnit,
				geometry: undefined, atoms: [...current.atoms, atom] }, wasAtomic);
		}
		this.picked = id;
	}

	#setTool(tool: Tool) {
		if (this.inspectedAtom) this.#leaveAtom();
		this.tool = this.#readonly ? "orbit" : tool;
		this.bondStart = undefined;
		this.bondPreview = undefined;
		this.#scene?.preview();
	}

	/**
	 * Outline the atom a site chip belongs to, or clear the outline with
	 * `undefined`. The 3D scene draws the ring itself, the 2D diagram reads the
	 * same state, so both views answer a hover the same way.
	 */
	#hoverAtom(id: number | undefined) {
		if (this.hoveredAtom === id) return;
		this.hoveredAtom = id;
		this.#scene?.highlight(id);
	}

	#selectAtom(id: number | undefined) {
		this.picked = id;
		if (id === undefined || this.tool !== "bond" || this.#readonly) return;
		if (this.bondStart && this.bondStart !== id) this.#connectBond(this.bondStart, id);
		else this.bondStart = this.bondStart === id ? undefined : id;
	}

	#connectBond(from: number, to: number) {
		const draft = this.draft;
		this.bondStart = undefined;
		if (this.#readonly || draft.kind !== "molecule" || from === to) return;
		if (!canBond(draft, from, to, this.bondOrder)) {
			this.notice = this.#t("That bond order exceeds the supported valence.", "Diese Bindungsordnung überschreitet die unterstützte Valenz.");
			return;
		}
		const bonds = draft.bonds.filter(bond => !(bond.from === from && bond.to === to || bond.from === to && bond.to === from));
		const next = { ...draft, name: "", catalogKey: undefined, source: undefined, representation: undefined,
			geometry: undefined, bonds: [...bonds, { from, to, order: this.bondOrder }] };
		if (this.view === "2d") {
			const fitted = fitGeometry(next);
			const readable = improveDiagram(fitted);
			if (readable !== fitted) this.diagramBox = undefined;
			this.#record(readable, true);
		} else if (diagramIsCrowded(next)) {
			const readable = improveDiagram(fitGeometry(next));
			this.diagramBox = undefined;
			this.#record({ ...next, atoms: next.atoms.map((atom, index) => ({ ...atom, diagram: readable.atoms[index].diagram })) });
		} else this.#record(next);
		this.picked = to;
	}

	#removeAtom() {
		if (this.#readonly || this.picked === undefined) return;
		const id = this.picked;
		const draft = this.draft;
		if (draft.kind === "molecule") {
			const repeatUnit = draft.repeatUnit && !draft.repeatUnit.ends.includes(id)
				? { ...draft.repeatUnit, atoms: draft.repeatUnit.atoms.filter(atom => atom !== id) } : undefined;
			this.#record({ ...draft, name: "", catalogKey: undefined, source: undefined, representation: undefined, repeatUnit, geometry: undefined,
				atoms: draft.atoms.filter(atom => atom.id !== id), bonds: draft.bonds.filter(bond => bond.from !== id && bond.to !== id) });
		} else this.#record({ ...draft, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined, source: undefined,
			sites: draft.sites.filter(site => site.id !== id) });
		this.picked = this.bondStart = undefined;
	}

	#updateCharge(value: number) {
		if (this.#readonly || this.picked === undefined || !Number.isInteger(value) || Math.abs(value) > 8) return;
		const id = this.picked;
		const draft = this.draft;
		if (draft.kind === "molecule") this.#record({ ...draft, name: "", catalogKey: undefined, source: undefined, representation: undefined, geometry: undefined,
			atoms: draft.atoms.map(atom => atom.id === id ? { ...atom, charge: value } : atom) });
		else this.#record({ ...draft, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined, source: undefined,
			sites: draft.sites.map(site => site.id === id ? { ...site, charge: value, ion: undefined } : site) });
	}

	#geometry() {
		if (this.#readonly || this.draft.kind !== "molecule") return;
		const next = improveDiagram(fitGeometry(this.draft));
		this.diagramBox = undefined;
		this.#record(next, true);
		this.view = this.gpu === "unavailable" ? "2d" : "3d";
	}

	#diagramPoint(x: number, y: number): Point2 {
		const transform = this.renderRoot.querySelector<SVGSVGElement>(".drawing")?.getScreenCTM();
		if (!transform) return [0, 0];
		const point = new DOMPoint(x, y).matrixTransform(transform.inverse());
		return [point.x, -point.y];
	}

	#hit(event: PointerEvent) {
		if (!this.#stageTarget(event.clientX, event.clientY)) return undefined;
		if (this.#atomicTarget) return undefined;
		if (this.view === "3d" && this.#scene) return this.#scene.pick(event.clientX, event.clientY);
		const inside = this.shadowRoot?.elementFromPoint(event.clientX, event.clientY)?.closest("[data-atom]");
		return inside ? Number(inside.getAttribute("data-atom")) : undefined;
	}

	/**
	 * True when the event started inside a card that sits on the canvas and
	 * scrolls on its own. Those cards keep their wheel and drag gestures, so a
	 * scroll inside the selection card never turns into a zoom of the scene.
	 */
	#overPanel(event: Event) {
		return event.composedPath().some(target => target instanceof Element
			&& (target.classList.contains("view-tools") || target.classList.contains("model-summary")
				|| target.classList.contains("selection-card") || target.classList.contains("ion-entry")
				|| target.classList.contains("ion-site")));
	}

	#pointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || this.#overPanel(event)) return;
		const point = pointer(event);
		this.#pointers.set(event.pointerId, point);
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		if (this.#pointers.size > 1) {
			const [a, b] = this.#pointers.values();
			this.#gesture = { ...point, moved: true, distance: distance(a, b) };
			this.diagramDrag = undefined;
			this.bondPreview = undefined;
			this.#scene?.preview();
			return;
		}
		const from = this.#hit(event);
		this.#gesture = { ...point, from, distance: 0, moved: false };
		if (from && this.view === "2d" && this.tool !== "bond" && !this.#readonly && this.draft.kind === "molecule") {
			this.#gesture.diagram = this.draft.atoms.find(atom => atom.id === from)?.diagram;
		}
	};

	#pointerMove = (event: PointerEvent) => {
		const gesture = this.#gesture;
		if (!gesture || !this.#pointers.has(event.pointerId)) return;
		const point = pointer(event);
		const previous = this.#pointers.get(event.pointerId);
		this.#pointers.set(event.pointerId, point);
		if (this.#pointers.size > 1) {
			const [a, b] = this.#pointers.values();
			const next = distance(a, b);
			if (gesture.distance > 0 && next > 0) {
				const factor = gesture.distance / next;
				if (this.view === "3d") {
					if (!this.#atomicTarget) this.#scene?.zoom(factor);
				} else if (!this.#atomicTarget) {
					const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
					this.#moveDiagram(factor, { x: midpoint.x + (previous.x - point.x) / 2,
						y: midpoint.y + (previous.y - point.y) / 2 }, midpoint);
				}
			}
			gesture.distance = next;
			return;
		}
		if (gesture.distance || (!gesture.moved && distance(gesture, point) < 5)) return;
		gesture.moved = true;
		if (!this.#atomicTarget && this.tool === "bond" && gesture.from && !this.#readonly) {
			if (this.view === "3d") this.#scene?.preview(gesture.from, point.x, point.y);
			else this.bondPreview = this.#diagramPoint(point.x, point.y);
		} else if (this.view === "3d") {
			if (!this.#atomicTarget) this.#scene?.orbit(point.x - gesture.x, point.y - gesture.y);
		} else if (gesture.diagram) {
			const last = this.#diagramPoint(gesture.x, gesture.y);
			const next = this.#diagramPoint(point.x, point.y);
			gesture.diagram = [gesture.diagram[0] + next[0] - last[0], gesture.diagram[1] + next[1] - last[1]];
			this.diagramDrag = { id: gesture.from, position: gesture.diagram };
		} else this.#moveDiagram(1, gesture, point);
		gesture.x = point.x;
		gesture.y = point.y;
	};

	#pointerUp = (event: PointerEvent) => {
		if (!this.#pointers.delete(event.pointerId)) return;
		if (this.#pointers.size) return;
		const gesture = this.#gesture;
		this.#gesture = undefined;
		this.#scene?.preview();
		this.bondPreview = undefined;
		const drag = this.diagramDrag;
		this.diagramDrag = undefined;
		if (!gesture || gesture.distance || this.inspectedAtom || event.type === "pointercancel") return;
		const hit = this.#hit(event);
		if (gesture.moved) {
			if (drag && this.draft.kind === "molecule") {
				if (!drag.position.every(coordinate => Number.isFinite(coordinate) && Math.abs(coordinate) <= 10_000)) return;
				const draft = this.draft;
				const id = drag.id;
				this.diagramBox ??= lewisViewBox(this.#lewis(draft));
				this.#record({ ...draft, atoms: draft.atoms.map(atom => atom.id === id ? { ...atom, diagram: drag.position,
					position: draft.geometry ? atom.position : [...drag.position, atom.position[2]] } : atom) });
			} else if (gesture.from && hit && !this.#readonly && this.tool === "bond") this.#connectBond(gesture.from, hit);
		} else if (hit) this.#selectAtom(hit);
		else if (this.tool === "atom" && (this.view === "3d" || this.#current.kind === "molecule")
			&& this.#stageTarget(event.clientX, event.clientY)) {
			this.#addAtom(this.#placement(event.clientX, event.clientY));
		} else {
			this.picked = undefined;
			this.bondStart = undefined;
		}
	};

	#moveDiagram(factor: number, from?: Pointer, to = from) {
		const current = this.#current;
		if (current.kind !== "molecule") return;
		const base = lewisViewBox(this.#lewis(current), this.showHydration ? this.#aqueous(current).waters : []);
		const [x, y, width, height] = this.diagramBox ?? base;
		const [a, b] = from ? this.#diagramPoint(from.x, from.y) : [x + width / 2, -(y + height / 2)];
		const [c, d] = to ? this.#diagramPoint(to.x, to.y) : [a, b];
		const zoom = Math.max(base[2] / 8, Math.min(base[2] * 4, width * factor)) / width;
		this.diagramBox = [a - (c - x) * zoom, -b - (-d - y) * zoom, width * zoom, height * zoom];
	}

	#wheel = (event: WheelEvent) => {
		if (this.#overPanel(event) || this.#atomicTarget || (this.view === "3d" ? !this.#scene : this.#current.kind !== "molecule")) return;
		event.preventDefault();
		const factor = Math.exp(Math.max(-100, Math.min(100, event.deltaY)) * 0.004);
		if (this.view === "3d") this.#scene?.zoom(factor);
		else this.#moveDiagram(factor, { x: event.clientX, y: event.clientY });
	};

	#keys = (event: KeyboardEvent) => {
		if (event.key === "Escape" && this.#atomicTarget && !event.composedPath().some(target => target instanceof HTMLSelectElement)) {
			event.preventDefault();
			event.stopPropagation();
			this.#leaveAtom();
			return;
		}
		if (this.inspectedAtom && event.key === "Delete") return;
		if (event.composedPath().some(target => target instanceof Element && target.matches("input, select, textarea, [role=listbox]"))) return;
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !this.#readonly) {
			event.preventDefault();
			event.stopPropagation();
			this.#history(event.shiftKey);
		} else if (event.key === "Delete" && this.picked !== undefined && !this.#readonly) {
			event.preventDefault();
			event.stopPropagation();
			this.#removeAtom();
		} else if (event.key === "Escape" && this.bondStart !== undefined) {
			this.#setTool(this.tool);
		} else if (!event.repeat && (event.key === "Enter" || event.key === " ") && this.tool === "atom" && !this.#readonly
			&& event.composedPath()[0] === this.renderRoot.querySelector(".board")) {
			// The keyboard counterpart to dropping an element on the canvas.
			event.preventDefault();
			this.#addAtom(this.view === "2d" ? undefined : this.#centre());
		}
	};

	#updateCell(key: keyof Cell, index: number, field: HTMLInputElement) {
		if (this.#readonly || this.draft.kind !== "crystal") return;
		const crystal = this.draft;
		const values = [...crystal.cell[key]] as [number, number, number];
		values[index] = field.valueAsNumber;
		const cell = { ...crystal.cell, [key]: values };
		if (isCell(cell)) this.#record({ ...crystal, cell, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined, source: undefined }, true);
		else {
			field.value = String(crystal.cell[key][index]);
			this.notice = this.#t("These lengths and angles do not form a valid cell.", "Diese Längen und Winkel ergeben keine gültige Zelle.");
		}
	}

	#updateSite(index: number, field: HTMLInputElement) {
		if (this.#readonly || this.draft.kind !== "crystal") return;
		const crystal = this.draft;
		const site = crystal.sites.find(entry => entry.id === this.picked);
		if (!site) return;
		const value = field.valueAsNumber;
		if (!Number.isFinite(value) || value < 0 || value >= 1) {
			field.value = String(site.fractional[index]);
			return;
		}
		const fractional = [...site.fractional] as [number, number, number];
		fractional[index] = value;
		if (crystal.sites.some(other => other.id !== site.id && other.fractional.every((coordinate, axis) => coordinate === fractional[axis]))) {
			field.value = String(site.fractional[index]);
			this.notice = this.#t("A site already occupies that position.", "Diese Position ist bereits belegt.");
			return;
		}
		this.#record({ ...crystal, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined, source: undefined,
			sites: crystal.sites.map(other => other.id === site.id ? { ...site, fractional, ion: undefined } : other) });
	}

	viewCatalogStructure(key: string): boolean {
		if (!catalogEntry(key)) return false;
		const overview = catalogAqueousStructure(key);
		const variants = overview ? [overview] : catalogStructures(key);
		this.catalogKey = key;
		this.catalogVariants = variants;
		this.catalogIndex = 0;
		this.openPanel = undefined;
		if (variants.length) this.#openPreview(variants[0]);
		else {
			this.preview = undefined;
			this.#resetSelection();
			this.notice = catalogIsMixture(key)
				? this.#t("This mixture has no unique structure.", "Dieses Gemisch hat keine eindeutige Struktur.")
				: this.#t("No verified structure is available.", "Es ist keine verifizierte Struktur verfügbar.");
		}
		return true;
	}

	/** Opens an isolated element from another widget on the worksheet. */
	viewAtom(atomicNumber: number, model: AtomicModel = "bohr"): boolean {
		if (!isAtomicNumber(atomicNumber)) return false;
		this.viewStructure({ ...newMolecule(), name: symbol(atomicNumber),
			atoms: [{ id: 1, atomicNumber, charge: 0, diagram: [0, 0], position: [0, 0, 0] }] });
		this.atomChoices = initialAtomChoices(model);
		this.openPanel = undefined;
		this.view = this.gpu === "unavailable" ? "2d" : "3d";
		void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(".board")?.focus({ preventScroll: true }));
		return true;
	}

	viewStructure(snapshot: Structure): boolean {
		const structure = readStructure(snapshot);
		if (!structure) return false;
		this.catalogKey = "";
		this.catalogVariants = [];
		this.#openPreview(structure.kind === "molecule" ? repairSavedDiagram(structure) : structure);
		return true;
	}

	#openPreview(snapshot: Structure) {
		this.#fileOpen++;
		this.preview = snapshot;
		this.#resetSelection();
		this.notice = "";
	}

	#closePreview(edit: boolean) {
		const current = this.preview;
		this.preview = undefined;
		this.catalogKey = "";
		this.catalogVariants = [];
		// The chooser has done its job once a structure is adopted or dismissed, so it
		// no longer covers the canvas and repeats the name in the document header.
		this.openPanel = undefined;
		if (edit && current) this.#record(current.kind === "molecule" ? editableRepeatUnit(current) : current, true);
		this.#resetSelection();
	}

	#openFile = async (file?: File) => {
		if (!file) return;
		const request = ++this.#fileOpen;
		try {
			if (file.size > MAX_FILE_BYTES) throw new Error("File too large");
			const structure = readStructure(JSON.parse(await file.text()));
			if (!structure) throw new Error("Invalid structure");
			if (request !== this.#fileOpen || !this.isConnected) return;
			this.#closePreview(false);
			this.#record(structure.kind === "molecule" ? repairSavedDiagram(structure) : structure, true);
			this.openPanel = undefined;
		} catch {
			if (request === this.#fileOpen) this.notice = this.#t("Could not open this ChemLab structure file.", "Diese ChemLab-Strukturdatei konnte nicht geöffnet werden.");
		}
	};

	#refreshLabs() {
		const peers = worksheetPeers(this, LAB_TAG);
		const labs = peers.filter(peer => typeof (peer as LabReceiver).reviewBuilderStructure === "function");
		if (labs.length !== this.labs.length || labs.some((lab, index) => lab !== this.labs[index])) this.labs = labs;
		if (!labs.length) this.showLabs = false;
		if (labs.length === peers.length || this.#waitingForLab) return;
		const root = this.getRootNode() as Node & { customElements?: CustomElementRegistry };
		const registry = root.customElements ?? this.ownerDocument.defaultView?.customElements;
		if (!registry || registry.get(LAB_TAG)) return;
		this.#waitingForLab = true;
		void registry.whenDefined(LAB_TAG).then(() => {
			this.#waitingForLab = false;
			if (this.isConnected) this.#refreshLabs();
		});
	}

	#prepareSend() {
		this.#refreshLabs();
		const matching = this.labId ? this.labs.filter(lab => lab.id === this.labId) : this.labs;
		if (matching.length === 1) return this.#send(matching[0]);
		this.showLabs = this.labs.length > 0;
		this.notice = "";
	}

	#send(target: HTMLElement) {
		if (!worksheetPeers(this, LAB_TAG).includes(target) || !(target as LabReceiver).reviewBuilderStructure?.(this.#current)) {
			this.notice = this.#t("This ChemLab could not receive the structure.", "Dieses ChemLab konnte die Struktur nicht empfangen.");
			return;
		}
		this.showLabs = false;
		this.notice = this.#t("Structure sent for review in ChemLab.", "Struktur zur Prüfung an ChemLab gesendet.");
		target.scrollIntoView({ block: "nearest" });
	}

	/**
	 * The catalog opens as a flat list grouped by chemical class. A native select
	 * would open a second dropdown on top of the popup, so every substance is a
	 * row of its own. Its variants live in the model summary after selection.
	 */
	#renderCatalog() {
		if (this.openPanel !== "catalog") return nothing;
		const query = this.catalogQuery.trim().toLowerCase();
		const matches = (entry: (typeof structureCatalog)[number]) => !query
			|| entry.name.toLowerCase().includes(query) || entry.formula.toLowerCase().includes(query);
		const sections = groups.map(category => ({
			category, entries: structureCatalog.filter(entry => entry.category === category && matches(entry)),
		})).filter(section => section.entries.length);
		const selected = this.catalogKey;
		return html`<div class="surface catalog-surface" role="group" aria-label=${this.#t("ChemLab catalog", "ChemLab-Katalog")}>
			<sl-input class="catalog-search" size="small" type="search" clearable
				label=${this.#t("Search the catalog", "Katalog durchsuchen")}
				placeholder=${this.#t("Search name or formula", "Name oder Formel suchen")}
				.value=${this.catalogQuery}
				@sl-input=${(event: Event) => { this.catalogQuery = (event.currentTarget as SlInput).value; }}></sl-input>
			<div class="catalog-list">
				${sections.length ? sections.map(section => html`<section class="catalog-group" aria-label=${section.category}>
					<div class="catalog-group-heading" role="heading" aria-level="3">
						<sl-badge variant="primary">${section.category}</sl-badge>
					</div>
					<div class="catalog-entries">
						${section.entries.map(entry => html`
							<button type="button" class="catalog-entry${entry.name === selected ? " is-selected" : ""}"
								aria-pressed=${String(entry.name === selected)} @click=${(event: MouseEvent) => {
									this.viewCatalogStructure(entry.name);
									if (event.detail === 0) void this.updateComplete.then(() => {
										(this.renderRoot.querySelector<HTMLElement>(".summary-variant select")
											?? this.renderRoot.querySelector<HTMLElement>(".board"))?.focus();
									});
								}}>
								<span class="catalog-entry-name">${entry.name}</span>
								<span class="catalog-entry-formula">${entry.formula}</span>
							</button>
						`)}
					</div>
				</section>`) : html`<p class="catalog-note" role="status">
					${this.#t("No substance matches this search.", "Keine Substanz passt zu dieser Suche.")}</p>`}
			</div>
		</div>`;
	}

	#renderTargetPicker() {
		if (!this.showLabs) return nothing;
		return html`<div class="surface" role="group" aria-label=${this.#t("Send to", "Senden an")}>
			<span>${this.#t("Send to", "Senden an")}</span>
			${this.labs.map((lab, index) => html`<sl-button size="small" @click=${() => this.#send(lab)}>
				${lab.id || `ChemLab ${index + 1}`}
			</sl-button>`)}
			<sl-button size="small" @click=${() => { this.showLabs = false; }}>${this.#t("Cancel", "Abbrechen")}</sl-button>
		</div>`;
	}

	#renderFileActions() {
		if (this.openPanel !== "file") return nothing;
		const canDownload = this.#atoms.length > 0;
		const filename = (this.#current.name || formula(this.#current)).replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "");
		const downloadUrl = canDownload ? "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.#current, null, 2)) : undefined;
		return html`<div id="file-actions" class="surface" role="group" aria-label=${this.#t("File", "Datei")}>
			<input type="file" hidden accept=".json,application/json" @change=${(event: Event) => {
				const input = event.currentTarget as HTMLInputElement;
				void this.#openFile(input.files?.[0]); input.value = "";
			}} />
			<sl-button size="small" @click=${() => this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
				${this.#t("Open file", "Datei öffnen")}
			</sl-button>
			<sl-button size="small" href=${downloadUrl ?? nothing} download=${(filename || "structure") + ".chemlab-structure.json"}
				?disabled=${!canDownload}>${this.#t("Download", "Herunterladen")}</sl-button>
		</div>`;
	}

	/**
	 * Renders a compact icon control, the shape the canvas controls share with
	 * the lab. The label only lives in the tooltip and the accessible name, so
	 * every caller has to pass one.
	 */
	#iconButton(options: {
		label: string; icon: unknown; pressed?: boolean; expanded?: boolean; disabled?: boolean;
		slot?: string; onClick: () => void;
	}) {
		return html`<sl-button class="icon-control" size="small" slot=${options.slot ?? nothing}
			aria-label=${options.label} title=${options.label}
			variant=${options.pressed ? "primary" : "default"}
			aria-pressed=${options.pressed === undefined ? nothing : String(options.pressed)}
			aria-expanded=${options.expanded === undefined ? nothing : String(options.expanded)}
			?disabled=${options.disabled} @click=${options.onClick}>${options.icon}</sl-button>`;
	}

	#renderHistoryButton(redo: boolean) {
		const label = redo ? this.#t("Redo", "Wiederholen") : this.#t("Undo", "Rückgängig");
		return html`<sl-button class="icon-control" size="small" aria-label=${label} title=${label}
			?disabled=${!(redo ? this.#future : this.#past).length} @click=${() => this.#history(redo)}>
			<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
				<path transform=${redo ? "translate(16 0) scale(-1 1)" : ""} d="M6 4 3 7l3 3M3 7h6a3 3 0 0 1 0 6H8"
					fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</sl-button>`;
	}

	#renderPickerLayout(view: "list" | "table", active: boolean) {
		const label = view === "list" ? this.#t("List view", "Listenansicht") : this.#t("Grid view", "Rasteransicht");
		const blocked = view === "table" && this.paletteNarrow;
		const hint = blocked
			? this.#t("The grid needs a wider palette. Widen the widget to use it.",
				"Das Raster braucht eine breitere Palette. Vergrößere das Widget dafür.")
			: label;
		return html`<sl-button class="icon-control" size="small" aria-label=${label} title=${hint}
			variant=${active ? "primary" : "default"} aria-pressed=${String(active)} ?disabled=${blocked}
			@click=${() => { this.pickerView = view; }}>${view === "list" ? LIST_ICON : TABLE_ICON}</sl-button>`;
	}

	#lewis(structure: Extract<Structure, { kind: "molecule" }>) {
		if (this.#lewisCache?.structure !== structure) this.#lewisCache = { structure, value: lewisDiagram(structure) };
		return this.#lewisCache.value;
	}

	#aqueous(structure: Extract<Structure, { kind: "molecule" }>) {
		if (this.#aqueousCache?.structure !== structure) {
			const components = structure.representation === "aqueous-ions" ? aqueousComponents(structure) : [];
			const monatomicIons = new Set(components.filter(component => component.atoms.length === 1 && component.charge)
				.map(component => component.atoms[0].id));
			this.#aqueousCache = { structure, components, monatomicIons, waters: components.flatMap(component => hydrationWaters(component, 2)) };
		}
		return this.#aqueousCache;
	}

	#renderDrawing(colors: ReadonlyMap<string, number>) {
		const current = this.#current;
		if (current.kind === "molecule") {
			const diagram = this.#lewis(current);
			const aqueous = this.#aqueous(current);
			const waters = this.showHydration ? aqueous.waters : [];
			return renderLewis(diagram, this.diagramBox ?? lewisViewBox(diagram, waters), {
				waters, monatomicIons: aqueous.monatomicIons,
				picked: this.picked, hovered: this.hoveredAtom, bondStart: this.bondStart, from: this.#gesture?.from,
				preview: this.bondPreview, order: this.bondOrder, drag: this.diagramDrag,
				label: this.#t(diagram.ends ? "Lewis structure of the repeating unit" : "Lewis structure",
					diagram.ends ? "Lewis-Struktur der Wiederholungseinheit" : "Lewis-Struktur"),
				oxidationLabel: this.#t("Oxidation state", "Oxidationszahl"),
				unknownLabel: this.#t("undetermined", "nicht bestimmt"),
			});
		}
		const nominal = current.catalogKey ? catalogEntry(current.catalogKey)?.formula : undefined;
		const groups = crystalSpecies(current).filter(group => group.ion);
		return html`<div class="formula-view">
			${current.sites.length ? html`<div class="formula-display">
				<div class="formula-heading">${this.#t("Empirical formula", "Verhältnisformel")}</div>
				<div class="empirical-formula">${nominal ? chemicalFormula(nominal) : empiricalCrystalFormula(current)}</div>
				${groups.length ? html`<div class="formula-ions" role="group" aria-label=${this.#t("Ions", "Ionen")}>
					${groups.map(group => {
						const selected = group.sites.some(site => site.id === this.picked);
						return html`<button type="button" class="ion-site" aria-pressed=${String(selected)}
							style=${group.ion ? `--ion-color: ${colorHex(colors.get(group.ion))}` : nothing}
							@click=${() => { this.picked = selected ? undefined : group.sites[0].id; }}>${group.label}</button>`;
					})}
				</div>` : nothing}
			</div>` : nothing}
			${!this.#readonly && this.tool === "atom" ? html`<div class="ion-entry">
				<sl-tag size="small" variant="primary">${symbol(this.element)}</sl-tag>
				<label>${this.#t("Ion charge", "Ionenladung")}
					<input type="number" min="-8" max="8" step="1" .value=${String(this.ionCharge)}
						@change=${(event: Event) => {
							const input = event.currentTarget as HTMLInputElement;
							if (input.checkValidity() && Number.isInteger(input.valueAsNumber)) this.ionCharge = input.valueAsNumber;
							else input.value = String(this.ionCharge);
						}} />
				</label>
				<sl-button size="small" @click=${() => this.#addAtom()}>
					${this.ionCharge ? this.#t("Add ion", "Ion hinzufügen") : this.#t("Add neutral atom", "Neutrales Atom hinzufügen")}
				</sl-button>
			</div>` : nothing}
		</div>`;
	}

	#renderAtomicSummary({ species, configuration }: AtomInspection) {
		const name = elementByAtomicNumber(species.atomicNumber).names[this.#t("en", "de")];
		const t = (en: string, de: string) => this.#t(en, de);
		return html`<section class="model-summary atomic-summary" aria-label=${t("Atom models", "Atommodelle")}>
			<div class="atomic-title">
				<sl-button size="small" class="icon-control atomic-back" aria-label=${t("Back to structure", "Zur Struktur")}
					title=${t("Back to structure", "Zur Struktur")} @click=${() => this.#leaveAtom()}>${BACK_ICON}</sl-button>
				<strong class="summary-formula">${name}</strong>
			</div>
			${species.boundReference ? html`<span class="summary-caption">${t("Isolated neutral atom reference", "Referenz für das isolierte neutrale Atom")}</span>` : nothing}
			${configuration.formal ? html`<span class="summary-caption">${t("Formal ion · closed-shell model", "Formales Ion · Modell mit geschlossener Schale")}</span>` : nothing}
			${renderAtomicControls(configuration, this.atomChoices, choices => {
				this.atomChoices = choices;
				if (choices.model !== "orbitals") this.#atomicScale = 0;
			}, t)}
		</section>`;
	}

	#renderOrbitals(current: Extract<Structure, { kind: "molecule" }>) {
		const orbitals = moleculeOrbitals(current);
		const orbital = orbitals.find(item => item.id === this.orbitalId) ?? orbitals[0];
		const atomLabel = (atom: { atomicNumber: number; id: number }) => `${symbol(atom.atomicNumber)}${atom.id}`;
		const reference = orbital?.kind === "reference";
		if (!orbital) return html`<span class="summary-caption">${this.#t("No orbital model for this structure.",
			"Für diese Struktur ist kein Orbitalmodell verfügbar.")}</span>`;
		return html`
			<label class="summary-variant">
				<span>${this.#t("Orbital", "Orbital")}</span>
				<select @change=${(event: Event) => {
					this.orbitalId = (event.currentTarget as HTMLSelectElement).value;
					this.#fitNext = true;
				}}>
					${orbitals.map(item => html`<option value=${item.id} ?selected=${item === orbital}>${item.kind === "reference"
						? item.label.toUpperCase().replace("-", "−").replace("SOMO", "SOMO α")
						: item.kind === "lone" ? `${this.#t("Lone pair", "Freies Elektronenpaar")} · ${atomLabel(item.atoms[0])} (${item.number})`
							: `${item.kind === "pi" ? "π" : "σ"}${item.number ? " " + item.number : ""} · ${item.atoms.map(atomLabel).join("–")}`}</option>`)}
				</select>
			</label>
			<span class="summary-caption" title=${reference
				? this.#t("Signed wavefunction isosurface at |ψ| = 0.045 bohr⁻³ᐟ². Spin-up (α) for open-shell oxygen.",
					"Vorzeichenflächen bei |ψ| = 0,045 bohr⁻³ᐟ². Für offenschaligen Sauerstoff gilt Spin α.")
				: this.#t("Local valence-bond picture following the structure geometry. Delocalization and orbital energies are outside this model.",
					"Lokales Valenzbindungsmodell anhand der Strukturgeometrie. Delokalisierung und Orbitalenergien werden nicht berechnet.")}>
				${reference ? "PBE0/def2-SVP" : this.#t("Schematic valence bond", "Schematisches Valenzbindungsmodell")}
			</span>
			<span class="structure-legend" role="group" aria-label=${this.#t("Wavefunction phase", "Phase der Wellenfunktion")}>
				${ORBITAL_PHASE_COLORS.map((color, index) => (orbital.kind !== "reference" || orbital.phases[index]) ?
					html`<span style="--swatch: ${colorHex(color)}">${index ? "−ψ" : "+ψ"}</span>` : nothing)}
			</span>
		`;
	}

	#renderModelSummary(current: Structure, ionColors: ReadonlyMap<string, number>) {
		const crystal = current.kind === "crystal";
		const aqueous = !crystal && current.representation === "aqueous-ions" ? this.#aqueous(current) : undefined;
		const selectedEntry = catalogEntry(this.catalogKey);
		const missing = selectedEntry && !this.catalogVariants.length;
		const showOxidation = !crystal && this.view === "2d" && current.atoms.length > (aqueous?.monatomicIons.size ?? 0);
		const showDisplay = this.view === "3d" && (crystal || (this.#atoms.length > 0 && this.gpu === "ready"));
		const options = this.catalogVariants.length > 1;
		const displays = showDisplay && hasMolecularDisplays(current);
		const molecular = displays ? this.molecularDisplay : "sticks";
		const lone = !crystal && current.atoms.length === 1 ? current.atoms[0] : undefined;
		const composition = lone ? elementByAtomicNumber(lone.atomicNumber).names[this.#t("en", "de")]
			: this.#atoms.length && (!crystal || this.view === "3d")
			? chemicalFormula(aqueous ? current.name : !crystal && current.repeatUnit && this.view === "2d"
				? formula({ ...current, atoms: this.#lewis(current).atoms }) : formula(current))
			: "";
		const status = this.notice || (this.bondStart ? this.#t("Choose the other atom.", "Wähle das zweite Atom.") : "");
		const toggle = (label: string, icon: unknown, value: boolean, onClick: () => void) => this.#iconButton({
			label, icon, pressed: value, onClick,
		});
		return html`<div class="model-summary" ?hidden=${!(missing || composition || options || showDisplay || showOxidation || status)}>
			${missing ? html`<strong class="summary-formula">${selectedEntry.name}</strong>` : nothing}
			${composition && !missing && !options ? html`<div class="fields">
				<strong class="summary-formula">${composition}</strong>
				${!crystal && current.repeatUnit ? html`<span class="summary-caption">${this.view === "2d"
					? this.#t("Repeating unit", "Wiederholungseinheit")
					: this.#t("Polymer", "Polymer")}</span>` : nothing}
			</div>` : nothing}
			${options ? html`<label class="summary-variant">
				<span>${catalogIsMixture(this.catalogKey) ? this.#t("Constituent", "Bestandteil") : this.#t("Variant", "Variante")}</span>
				<select .value=${String(this.catalogIndex)} @change=${(event: Event) => {
					const index = Number((event.currentTarget as HTMLSelectElement).value);
					const variant = this.catalogVariants[index];
					if (!variant) return;
					this.catalogIndex = index;
					this.#openPreview(variant);
				}}>
					${this.catalogVariants.map((variant, index) => html`<option value=${index} ?selected=${index === this.catalogIndex}>
						${variant.name || formula(variant)}
					</option>`)}
				</select>
			</label>` : nothing}
			${aqueous && aqueous.components.length ? html`
				<div class="fields" aria-label=${this.#t("Representative dissolved species", "Repräsentative gelöste Spezies")}>
					${aqueous.components.map(component => html`<sl-tag size="small" variant=${component.charge ? "primary" : "neutral"}>
						${component.label}
					</sl-tag>`)}
				</div>
				<div class="fields">
					<sl-button size="small" variant=${this.showHydration ? "primary" : "default"}
						aria-pressed=${String(this.showHydration)} title=${this.#t(
							"Schematic water orientation around dissolved ions", "Schematische Anordnung von Wasser um gelöste Ionen")}
						@click=${() => {
							this.showHydration = !this.showHydration;
							this.diagramBox = undefined;
							this.#fitNext = true;
						}}>${this.#t("Hydration shells", "Hydrathüllen")}</sl-button>
				</div>
				${this.showHydration ? html`<div class="hydration-key">
					<span data-contact="hydrogen">${this.#t("Hydrogen bond", "Wasserstoffbrücke")}</span>
					<span data-contact="ion-dipole">${this.#t("Ion–dipole", "Ion–Dipol")}</span>
				</div>` : nothing}
			` : nothing}
			${ionColors.size && this.view === "3d" ? html`<span class="structure-legend" role="group" aria-label=${this.#t("Ion colours", "Ionenfarben")}>
				${[...ionColors].map(([ion, color]) => html`<span style="--swatch: ${colorHex(color)}">${ion}</span>`)}
				${crystal && this.showLattice ? html`<span data-marker="lattice">${this.#t("Lattice points", "Gitterpunkte")}</span>` : nothing}
			</span>` : nothing}
			${displays ? html`<label class="summary-variant">
				<span>${this.#t("Model", "Modell")}</span>
				<select @change=${(event: Event) => {
					this.molecularDisplay = (event.currentTarget as HTMLSelectElement).value as MolecularDisplay;
					this.#fitNext = true;
				}}>
					<option value="sticks" ?selected=${molecular === "sticks"}>${this.#t("Ball and stick", "Kugel-Stab")}</option>
					<option value="space-filling" ?selected=${molecular === "space-filling"}>${this.#t("Space-filling", "Kalottenmodell")}</option>
					<option value="orbitals" ?selected=${molecular === "orbitals"}>${this.#t("Orbitals", "Orbitale")}</option>
				</select>
			</label>` : nothing}
			${molecular === "orbitals" && current.kind === "molecule" ? this.#renderOrbitals(current) : nothing}
			${molecular === "space-filling" ? html`<span class="summary-caption" title=${this.#t(
				"Van der Waals radii draw the overlapping molecular envelope.", "Van-der-Waals-Radien bilden die überlappende Molekülhülle.")}>
				${this.#t("Van der Waals radii", "Van-der-Waals-Radien")}</span>` : nothing}
			${current.kind === "molecule" && molecular === "sticks" && this.showElectrons && this.view === "3d" ? html`
				<span class="structure-legend" title=${this.#t(
					"Approximate Lewis and VSEPR regions. Dots represent electron counts in the displayed bonding model.",
					"Angenäherte Lewis- und VSEPR-Bereiche. Punkte stehen für die Elektronenzahl im dargestellten Bindungsmodell.",
				)}>
					<span data-region="bond">${this.#t("Bonding", "Bindend")}</span>
					<span data-region="lone">${this.#t("Nonbonding", "Nichtbindend")}</span>
				</span>` : nothing}
			${showOxidation ? html`
				<div class="lewis-legend" title=${this.#t("Ionic approximation of the drawn bonds using Allen electronegativity. ? marks an undetermined value.",
					"Ionische Näherung der gezeichneten Bindungen nach Allen-Elektronegativität. ? kennzeichnet einen unbestimmten Wert.")}>
					${this.#t("Oxidation state", "Oxidationszahl")}
					<span data-oxidation="negative">−</span><span data-oxidation="neutral">0</span><span data-oxidation="positive">+</span>
				</div>` : nothing}
			${showDisplay && (crystal || molecular === "sticks") ? html`<div class="display-controls" role="group" aria-label=${this.#t("Display", "Darstellung")}>
				${crystal ? html`<label>${this.#t("Cells", "Zellen")}
					<select .value=${String(this.repeats)} @change=${(event: Event) => {
						this.repeats = Number((event.currentTarget as HTMLSelectElement).value);
						this.#fitNext = true;
						this.diagramBox = undefined;
					}}>
						${[1, 2, 3].filter(value => value ** 3 * current.sites.length <= 1800)
							.map(value => html`<option value=${value} ?selected=${value === this.repeats}>${value} × ${value} × ${value}</option>`)}
					</select></label>` : nothing}
				${crystal ? toggle(this.#t("Cell edges", "Zellkanten"), EDGES_ICON, this.showEdges, () => { this.showEdges = !this.showEdges; }) : nothing}
				${crystal ? toggle(this.#t("Lattice points", "Gitterpunkte"), LATTICE_ICON, this.showLattice, () => { this.showLattice = !this.showLattice; }) : nothing}
				${crystal ? toggle(this.#t("Axes", "Achsen"), AXES_ICON, this.showAxes, () => { this.showAxes = !this.showAxes; }) : nothing}
				${current.kind === "molecule" && current.atoms.length && molecular === "sticks" && this.view === "3d" && this.gpu === "ready"
					? toggle(this.#t("Valence electrons", "Valenzelektronen"), ELECTRONS_ICON, this.showElectrons, () => { this.showElectrons = !this.showElectrons; })
					: nothing}
			</div>` : nothing}
			<output aria-live="polite" ?hidden=${!status}>${status}</output>
		</div>`;
	}

	/** The selection card follows the lab's object info card and stays at the canvas edge. */
	#renderSelectionCard() {
		const current = this.#current;
		const atom = this.#atoms.find(entry => entry.id === this.picked);
		if (!atom && !this.#atoms.length) return nothing;
		const species = current.kind === "crystal" && atom ? siteIon(atom) : undefined;
		const title = atom ? `${symbol(atom.atomicNumber)}${chargeText(atom.charge)} · ${atom.id}`
			: this.#t("No selection", "Keine Auswahl");
		const shape = atom && current.kind === "molecule" ? shapeName(current, atom.id) : undefined;
		const shapeLabel = {
			linear: this.#t("Linear", "Linear"), bent: this.#t("Bent", "Gewinkelt"),
			trigonal: this.#t("Trigonal planar", "Trigonal-planar"), pyramidal: this.#t("Trigonal pyramidal", "Trigonal-pyramidal"),
			tetrahedral: this.#t("Tetrahedral", "Tetraedrisch"),
		};
		const radius = atom && (current.kind === "crystal" ? crystalRadii(current).get(atom.id)
			: this.view === "3d" && hasMolecularDisplays(current) && this.molecularDisplay === "space-filling"
				? spaceFillingRadius(atom.atomicNumber) : atom.charge && !current.bonds.some(bond => bond.from === atom.id || bond.to === atom.id)
					? undefined : atomRadius(atom.atomicNumber));
		const radiusLabel = radius && {
			covalent: this.#t("covalent", "kovalent"), empirical: this.#t("empirical", "empirisch"),
			ionic: this.#t(`ionic, CN ${radius.coordination}`, `ionisch, KZ ${radius.coordination}`),
			metallic: this.#t("metallic", "metallisch"), vdw: "van der Waals", schematic: "",
		}[radius.model];
		const here = atom && current.kind === "molecule" && current.atoms.find(entry => entry.id === atom.id);
		const lengths = here && current.kind === "molecule" && current.geometry
			? current.bonds.flatMap(bond => {
				const id = bond.from === atom.id ? bond.to : bond.to === atom.id ? bond.from : undefined;
				const neighbor = current.atoms.find(entry => entry.id === id);
				return neighbor ? [{ neighbor, length: Math.hypot(...subtract(here.position, neighbor.position)) }] : [];
			}) : [];
		const occupancy = atom && "occupancy" in atom ? atom.occupancy : undefined;
		return html`<aside class="selection-card" aria-label=${this.#t("Selection", "Auswahl")}>
			<div class="card-head">
				<sl-tag size="small" variant=${atom ? "primary" : "neutral"}>${title}</sl-tag>
				${atom && !this.#atomicTarget ? html`<sl-button class="icon-control inspect-atom" size="small"
					aria-label=${this.#t("View atom models", "Atommodelle ansehen")}
					title=${this.#t("View atom models", "Atommodelle ansehen")}
					@click=${() => this.#inspectAtom(atom.id)}>${ATOMIC_ORBITALS_ICON}</sl-button>` : nothing}
				${atom && !this.#readonly ? html`<sl-button class="icon-control" size="small" variant="danger" outline
					aria-label=${this.#t("Delete", "Löschen")} title=${this.#t("Delete", "Löschen")} @click=${this.#removeAtom}>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"
						stroke-linecap="round" aria-hidden="true">
						<path d="M2.5 4h9M5.5 4V2.5h3V4M4 4l.5 7.5h5L10 4" />
					</svg>
				</sl-button>` : nothing}
			</div>
			${atom ? html`<div class="card-facts">
				${species ? html`<sl-tag size="small">${species}</sl-tag>` : nothing}
				${radius && radiusLabel ? html`<sl-tag size="small" title=${radius.model === "covalent" || radius.model === "empirical"
					? this.#t("Reference radius. Atom markers are reduced in ball-and-stick and orbital views.",
						"Referenzradius. Die Atommarker sind im Kugel-Stab- und Orbitalmodell verkleinert.") : ""}>${radius.pm} pm · ${radiusLabel}</sl-tag>` : this.view === "3d"
					? html`<sl-tag size="small">${this.#t("Schematic size", "Schematische Größe")}</sl-tag>` : nothing}
				${shape ? html`<sl-tag size="small">${shapeLabel[shape]}</sl-tag>` : nothing}
				${occupancy !== undefined ? html`<sl-tag size="small">${Number((100 * occupancy).toFixed(1))} %</sl-tag>` : nothing}
			</div>` : nothing}
			<sl-details summary=${current.kind === "crystal" ? this.#t("Site properties", "Gitterplatz-Eigenschaften")
					: this.#t("Atom properties", "Atom-Eigenschaften")} ?open=${!atom && this.view === "3d"}>
				<div class="fields">
					${lengths.length ? html`<div class="bond-lengths">
						<span class="summary-caption">${current.kind === "molecule" && current.geometry === "supplied"
							? this.#t("3D bond lengths", "3D-Bindungslängen") : this.#t("Estimated 3D bond lengths", "Geschätzte 3D-Bindungslängen")}</span>
						<div class="card-facts">${lengths.map(({ neighbor, length }) => html`<sl-tag size="small">${symbol(neighbor.atomicNumber)} ·
							${neighbor.id} · ${length.toLocaleString(this.#t("en", "de"), { maximumFractionDigits: 3 })} Å</sl-tag>`)}</div>
					</div>` : nothing}
					<div class="site-picker" role="group" aria-label=${current.kind === "crystal"
						? this.#t("Site", "Gitterplatz") : this.#t("Atom", "Atom")}>
						${this.#atoms.map(entry => html`<button type="button" class="site-chip"
							aria-pressed=${String(entry.id === this.picked)}
							@pointerenter=${() => this.#hoverAtom(entry.id)} @pointerleave=${() => this.#hoverAtom(undefined)}
							@focus=${() => this.#hoverAtom(entry.id)} @blur=${() => this.#hoverAtom(undefined)}
							@click=${() => { this.picked = entry.id; }}>${symbol(entry.atomicNumber)}${chargeText(entry.charge)} · ${entry.id}</button>`)}
					</div>
					${atom && !this.#readonly ? html`<label>${this.#t("Formal charge", "Formalladung")}
						<input type="number" min="-8" max="8" step="1" .value=${String(atom.charge)} @change=${(event: Event) => {
							const input = event.currentTarget as HTMLInputElement;
							if (!input.checkValidity() || input.value === "") { input.value = String(atom.charge); return; }
							this.#updateCharge(input.valueAsNumber);
						}} /></label>` : nothing}
					${atom && current.kind === "molecule" && !this.#readonly ? current.bonds.filter(bond =>
						bond.from === atom.id || bond.to === atom.id).map(bond => {
							const to = this.#atoms.find(entry => entry.id === (bond.from === atom.id ? bond.to : bond.from));
							return html`<sl-button size="small" @click=${() => this.#record({
									...current, name: "", catalogKey: undefined, source: undefined, representation: undefined,
								geometry: undefined, bonds: current.bonds.filter(entry => entry !== bond),
							})}>${this.#t("Remove bond to", "Bindung lösen zu")} ${symbol(to.atomicNumber)} · ${to.id}</sl-button>`;
						}) : nothing}
					${atom && "fractional" in atom ? atom.fractional.map((value, index) => html`<label>${["x/a", "y/b", "z/c"][index]}
						<input type="number" step=".05" min="0" max=".999999" .value=${String(Number(value.toFixed(6)))} ?readonly=${this.#readonly}
							@change=${(event: Event) => this.#updateSite(index, event.currentTarget as HTMLInputElement)} />
					</label>`) : nothing}
				</div>
			</sl-details>
			${current.kind === "crystal" ? html`<sl-details summary=${this.#t("Unit cell", "Elementarzelle")}>
				<div class="fields">
					${current.bravais ? html`<sl-tag size="small">${current.bravais} · ${current.spaceGroup}</sl-tag>` : nothing}
					${current.source === "catalog-density" ? html`<sl-tag size="small">${this.#t("Cell size estimated from catalog density", "Zellgröße aus Katalogdichte geschätzt")}</sl-tag>` : nothing}
					${current.temperatureK ? html`<sl-tag size="small">${current.temperatureK} K</sl-tag>` : nothing}
					${current.conditions ? html`<sl-tag size="small">${current.conditions === "hydrogen-positions-unreported"
						? this.#t("Hydrogen positions unreported", "Wasserstoffpositionen nicht angegeben") : current.conditions}</sl-tag>` : nothing}
					${current.sites.some(site => site.occupancy !== undefined) ? html`
						<sl-tag size="small">${this.#t("Partially occupied sites", "Teilbesetzte Gitterplätze")}</sl-tag>` : nothing}
					${(["lengths", "angles"] as const).map(key => current.cell[key].map((value, index) => {
						const label = (key === "lengths" ? ["a (Å)", "b (Å)", "c (Å)"] : ["α (°)", "β (°)", "γ (°)"])[index];
						return html`<label>${label}<input type="number" step="any" aria-label=${label}
							.value=${String(Number(value.toFixed(4)))} ?readonly=${this.#readonly}
							@change=${(event: Event) => this.#updateCell(key, index, event.currentTarget as HTMLInputElement)} /></label>`;
					}))}
				</div>
			</sl-details>` : nothing}
		</aside>`;
	}

	render() {
		const current = this.#current;
		const lattice = metalCrystal(this.element);
		const paletteVisible = this.paletteOpen && !this.#readonly;
		const fullWidth = this.classList.contains("ww-full-width");
		const pickerView = fullWidth && !this.paletteNarrow ? this.pickerView : "list";
		const ionColors = current.kind === "crystal" ? crystalIonColors(current) : new Map<string, number>();
		const tool = (value: Tool, label: string, icon: unknown) => this.#iconButton({
			label, icon, pressed: value === this.tool, onClick: () => this.#setTool(value),
		});
		const newTools = html`<div class="tool-group" role="group" aria-label=${this.#t("New structure", "Neue Struktur")}>
			${this.#iconButton({ label: this.#t("New molecule", "Neues Molekül"), icon: NEW_MOLECULE_ICON,
				onClick: () => this.#new("molecule") })}
			${this.#iconButton({ label: this.#t("New lattice", "Neues Gitter"), icon: NEW_CRYSTAL_ICON,
				onClick: () => this.#new("crystal") })}
		</div>`;
		const atomic = this.#atomInspection;
		const explicitAtom = !!this.inspectedAtom;
		const sceneVisible = this.view === "3d" && !atomic;
		const fit = () => {
			if (atomic) this.#atomicFigure?.fit();
			else this.#scene?.fit();
			this.diagramBox = undefined;
			this.requestUpdate();
		};
		const zoom = (factor: number) => {
			if (atomic) this.#atomicFigure?.zoom(factor);
			else if (this.view === "3d") this.#scene?.zoom(factor);
			else this.#moveDiagram(factor);
		};
		const title = current.catalogKey ? catalogEntry(current.catalogKey)?.name ?? current.name : current.name || formula(current);
		const toggle = (panel: "catalog" | "file") => () => { this.openPanel = this.openPanel === panel ? undefined : panel; };
		return html`<div class="builder" contenteditable="false" @keydown=${this.#keys} @toggle=${this.#onViewportToggle}
			@dragover=${(event: DragEvent) => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); }}
			@drop=${(event: DragEvent) => { if (event.dataTransfer?.files.length) { event.preventDefault(); void this.#openFile(event.dataTransfer.files[0]); } }}>
			<header class="document">
				<div class="document-title">
					<h5 title=${title}>${title}</h5>
					<sl-tag size="small" variant=${this.#readonly ? "warning" : "neutral"}>
						${this.#readonly ? this.#t("Preview", "Vorschau") : this.#t("Draft", "Entwurf")}
					</sl-tag>
				</div>
				<div class="document-actions">
					${this.#readonly ? newTools : nothing}
					<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.openPanel === "catalog"}>
						${this.#iconButton({ slot: "anchor", label: this.#t("ChemLab catalog", "ChemLab-Katalog"), icon: CATALOG_ICON,
							pressed: this.openPanel === "catalog", expanded: this.openPanel === "catalog", onClick: toggle("catalog") })}
						${this.#renderCatalog()}
					</sl-popup>
					<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.openPanel === "file"}>
						${this.#iconButton({ slot: "anchor", label: this.#t("File", "Datei"), icon: FILE_ICON,
							pressed: this.openPanel === "file", expanded: this.openPanel === "file", onClick: toggle("file") })}
						${this.#renderFileActions()}
					</sl-popup>
					${this.#atoms.length && this.labs.length ? html`<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.showLabs}>
						${this.#iconButton({ slot: "anchor", label: this.#t("Send to ChemLab", "An ChemLab senden"), icon: SEND_ICON,
							pressed: this.showLabs, expanded: this.showLabs, onClick: this.#prepareSend })}
						${this.#renderTargetPicker()}
					</sl-popup>` : nothing}
					${this.#readonly ? html`
						<sl-button size="small" variant="primary" @click=${() => this.#closePreview(true)}>${this.#t("Edit copy", "Kopie bearbeiten")}</sl-button>
						<sl-button size="small" @click=${() => this.#closePreview(false)}>${this.#t("Close preview", "Vorschau schließen")}</sl-button>
					` : nothing}
				</div>
			</header>
			${this.#readonly ? nothing : html`<div class="tools" role="toolbar" aria-label=${this.#t("Editing tools", "Bearbeitungswerkzeuge")}>
				${newTools}
				<div class="tool-group" role="group" aria-label=${this.#t("Tools", "Werkzeuge")}>
					${tool("orbit", this.view === "3d" ? this.#t("Orbit", "Drehen") : this.#t("Select", "Auswählen"),
						this.view === "3d" ? ORBIT_ICON : CURSOR_ICON)}
					${tool("atom", this.view === "2d" && current.kind === "crystal"
						? this.#t("Place ion or atom", "Ion oder Atom platzieren") : this.#t("Place atom", "Atom platzieren"), ATOM_ICON)}
					${current.kind === "molecule" ? tool("bond", this.#t("Draw bond", "Bindung zeichnen"), BOND_ICON) : nothing}
					${this.tool === "bond" ? html`<span class="bond-orders" role="group" aria-label=${this.#t("Bond order", "Bindungsordnung")}>
						${([1, 2, 3] as BondOrder[]).map(order => html`<sl-button class="icon-control" size="small"
							variant=${order === this.bondOrder ? "primary" : "default"} aria-pressed=${String(order === this.bondOrder)}
							aria-label=${this.#t(`Bond order ${order}`, `Bindungsordnung ${order}`)}
							title=${this.#t(`Bond order ${order}`, `Bindungsordnung ${order}`)}
							@click=${() => { this.bondOrder = order; }}>${order}</sl-button>`)}
					</span>` : nothing}
				</div>
				${current.kind === "molecule" && current.bonds.length ? html`<div class="tool-group">
					${this.#iconButton({ label: this.#t("Fit geometry", "Geometrie anpassen"), icon: GEOMETRY_ICON, onClick: this.#geometry })}
				</div>` : nothing}
				${this.#past.length || this.#future.length ? html`<div class="tool-group" role="group" aria-label=${this.#t("History", "Verlauf")}>
					${this.#renderHistoryButton(false)}${this.#renderHistoryButton(true)}
				</div>` : nothing}
			</div>`}
			<div class="workspace" data-palette=${paletteVisible ? pickerView : nothing} ?data-collapsed=${!this.#readonly && !paletteVisible}>
				${this.#readonly ? nothing : html`<aside class="palette">
					<button class="palette-handle" type="button" aria-expanded=${String(paletteVisible)} aria-controls="palette-body"
						aria-label=${paletteVisible ? this.#t("Collapse the element palette", "Elementpalette einklappen")
							: this.#t("Open the element palette", "Elementpalette öffnen")}
						title=${paletteVisible ? this.#t("Collapse the element palette", "Elementpalette einklappen")
							: this.#t("Open the element palette", "Elementpalette öffnen")}
						@click=${() => { this.paletteOpen = !this.paletteOpen; }}>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true">
							<path d=${paletteVisible ? "m9 3-4 4 4 4" : "m5 3 4 4-4 4"} />
						</svg>
					</button>
					<div class="palette-body" id="palette-body" ?hidden=${!paletteVisible}>
						<div class="palette-heading">
							${lattice ? this.#iconButton({ label: this.#t("View crystal", "Kristall ansehen"), icon: CRYSTAL_ICON,
								onClick: () => this.viewStructure(lattice) }) : nothing}
							${lattice === null ? html`<sl-tag size="small">${this.#t("Bulk lattice unavailable", "Keine experimentelle Gitterstruktur")}</sl-tag>` : nothing}
							${fullWidth ? html`<div class="palette-tools" role="group" aria-label=${this.#t("Element palette layout", "Darstellung der Elementpalette")}>
								${this.#renderPickerLayout("list", pickerView === "list")}${this.#renderPickerLayout("table", pickerView === "table")}
							</div>` : nothing}
						</div>
						<webwriter-chemlab-periodic-table .view=${pickerView} picker-mode .selectedAtomicNumber=${this.element}
							@chemlab:element-selection=${this.#selectPalette} @chemlab:element-drag=${this.#dragPalette}>
						</webwriter-chemlab-periodic-table>
					</div>
				</aside>`}
				<main class="visual">
					<div class="board" tabindex="0" aria-label=${this.#t("Structure workspace", "Struktur-Arbeitsfläche")}
						@pointerdown=${this.#pointerDown} @pointermove=${this.#pointerMove} @pointerup=${this.#pointerUp} @pointercancel=${this.#pointerUp} @wheel=${this.#wheel}>
						<div class="scene" ?hidden=${!sceneVisible}></div>
						${atomic ? html`<chemlab-atomic-figure class="builder-atom-figure" lang=${this.#t("en", "de")}
							.atomicNumber=${atomic.species.atomicNumber} .configuration=${atomic.configuration} .choices=${this.atomChoices}
							.symbolText=${symbol(atomic.species.atomicNumber) + superscript(chargeText(atomic.species.charge))}
							.pause=${this.pauseShellElectrons} .interactive=${explicitAtom || this.tool === "orbit"}
							.externalOrbitalLabel=${true}
							@orbital-label=${(event: CustomEvent<string | undefined>) => { this.orbitalHint = event.detail; }}
							@atomic-scale=${(event: CustomEvent<number>) => { this.#atomicScale = event.detail; this.#syncGrid(); }}>
						</chemlab-atomic-figure>` : !sceneVisible ? this.#renderDrawing(ionColors) : nothing}
						${this.gpu === "loading" && sceneVisible ? html`<p class="empty" role="status"><sl-spinner></sl-spinner>
							${this.#t("Loading 3D view", "3D-Ansicht wird geladen")}</p>`
							: !this.#atoms.length ? html`<p class="empty">
							${this.view === "2d" && current.kind === "crystal"
								? this.tool === "atom" ? nothing : this.#t("Choose an element to add a crystal site.", "Wähle ein Element für einen Gitterplatz.")
								: this.#t("Drag an element here, or choose Place atom and click the canvas.",
									"Ziehe ein Element hierher oder wähle Atom platzieren und klicke auf die Fläche.")}
							</p>` : nothing}
						<div class="view-tools" role="group" aria-label=${this.#t("Canvas view", "Ansicht der Zeichenfläche")}>
							${atomic && this.atomChoices.model === "orbitals" && this.orbitalHint
								? html`<span class="orbital-hint" role="tooltip">${this.orbitalHint}</span>` : nothing}
							<sl-tag size="small" class="grid-scale" hidden>
								<span class="grid-scale-line" aria-hidden="true"></span><span class="grid-length"></span>
							</sl-tag>
							<div class="view-buttons">
								${explicitAtom ? nothing : html`
									${this.#iconButton({ label: this.#t("3D view", "3D-Ansicht"), icon: CUBE_ICON, pressed: this.view === "3d",
										disabled: this.gpu === "unavailable", onClick: () => { this.view = "3d"; } })}
									${this.#iconButton({ label: this.#t("Structure view", "Strukturansicht"), icon: PLANE_ICON, pressed: this.view === "2d",
										onClick: () => {
											if (this.#atomicTarget) this.#leaveAtom();
											this.view = "2d";
										} })}
								`}
								${atomic || (sceneVisible && this.gpu === "ready") || (this.view === "2d" && current.kind === "molecule") ? html`
									${this.#iconButton({ label: this.#t("Zoom in", "Vergrößern"), icon: ZOOM_IN_ICON, onClick: () => zoom(.83) })}
									${this.#iconButton({ label: this.#t("Zoom out", "Verkleinern"), icon: ZOOM_OUT_ICON, onClick: () => zoom(1.2) })}
								` : nothing}
								${atomic || sceneVisible || current.kind === "molecule"
									? this.#iconButton({ label: this.#t("Fit view", "Ansicht einpassen"), icon: FIT_ICON, onClick: fit }) : nothing}
								${this.#iconButton({ label: this.fullscreen ? this.#t("Exit fullscreen", "Vollbild verlassen")
									: this.#t("Fullscreen", "Vollbild"), icon: this.fullscreen ? EXIT_FULLSCREEN_ICON : FULLSCREEN_ICON,
									pressed: !!this.fullscreen, onClick: this.#toggleFullscreen })}
							</div>
						</div>
						${atomic ? this.#renderAtomicSummary(atomic) : this.#renderModelSummary(current, ionColors)}
						${explicitAtom || (atomic && this.#readonly && this.picked === undefined) ? nothing : this.#renderSelectionCard()}
					</div>
				</main>
			</div>
			${this.paletteDrag ? html`<div class="ghost" aria-hidden="true" style="left:${this.paletteDrag.x}px;top:${this.paletteDrag.y}px">
				${symbol(this.paletteDrag.atomicNumber)}
			</div>` : nothing}
		</div>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"webwriter-chemlab-molecule-builder": ChemLabMoleculeBuilder;
	}
}
