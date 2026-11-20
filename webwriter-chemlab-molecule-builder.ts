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
import { catalogEntry, catalogIsMixture, catalogStructures, structureCatalog } from "./molecule-builder/catalog";
import { BUILDER_TAG, LAB_TAG, TABLE_TAG, worksheetPeers, worksheetScope, type LabReceiver } from "./molecule-builder/exchange";
import { colorHex, crystalIonColors, latticePositions, siteIon } from "./molecule-builder/crystal-display";
import { atomColor, atomRadius, fitGeometry, canBond, shapeName, formula } from "./molecule-builder/geometry";
import {
	MAX_ATOMS, MAX_SITES, MAX_FILE_BYTES, cartesian, cellVectors, fractional, isCell,
	newCrystal, newMolecule, readStructure, replicatedSites, type Atom, type BondOrder, type Cell, type Point2, type Point3, type Site, type Structure,
} from "./molecule-builder/structure";
import { builderStyles } from "./molecule-builder/styles";
import type { MoleculeScene } from "./molecule-builder/scene";

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
const PLANE_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
	<path d="M8 1.9 13.8 5v6L8 14.1 2.2 11V5z" /><circle cx="8" cy="8" r="1.7" /></svg>`;
const FIT_ICON = svg`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none"
	stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
	<path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" /></svg>`;

@customElement(BUILDER_TAG)
export class ChemLabMoleculeBuilder extends LitElementWw {
	static styles = builderStyles;
	static scopedElements = {
		"webwriter-chemlab-periodic-table": ChemLabPeriodicTable,
		"sl-badge": SlBadge, "sl-button": SlButton, "sl-details": SlDetails, "sl-icon": SlIcon,
		"sl-input": SlInput, "sl-popup": SlPopup, "sl-spinner": SlSpinner, "sl-tag": SlTag,
	};
	static options = {
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
	#dataObserver?: MutationObserver;
	#worksheetObserver?: MutationObserver;
	#waitingForLab = false;
	#lastSaved = "";
	#lastDrawn?: Structure;
	#lastDrawnRepeats = 0;
	#diagramBounds: readonly [number, number, number, number] = [-6, -4, 12, 8];

	get #current() { return this.preview ?? this.draft; }
	get #atoms() { const current = this.#current; return current.kind === "molecule" ? current.atoms : current.sites; }
	get #readonly() { return this.preview !== undefined; }

	#t(en: string, de: string) { return this.lang?.toLowerCase().startsWith("de") ? de : en; }

	override connectedCallback() {
		super.connectedCallback();
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
		this.#scene?.destroy();
		this.#scene = undefined;
		this.gpu = "idle";
		super.disconnectedCallback();
	}

	override updated(changed: Map<PropertyKey, unknown>) {
		if (changed.has("elementSourceId")) this.#bindTable();
		this.#observePalette();
		if (this.view === "3d" && this.gpu === "idle") void this.#startScene();
		if (this.#scene && this.view === "3d") {
			this.#scene.setScene(this.#current, this.repeats, [this.picked, this.bondStart].filter(id => id !== undefined),
				{ electrons: this.showElectrons, lattice: this.showLattice, edges: this.showEdges, axes: this.showAxes });
			if (this.#fitNext) {
				this.#fitNext = false;
				this.#scene.fit();
			}
		}
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
			const scene = await MoleculeScene.create(host);
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

	#onContextLost = () => this.#fallback();

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
			this.draft = snapshot;
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
		this.bondStart = undefined;
		this.bondPreview = undefined;
		this.repeats = 1;
		this.#fitNext = true;
		this.#lastDrawn = undefined;
		this.tool = "orbit";
	}

	#new(kind: Structure["kind"]) {
		this.preview = undefined;
		this.openPanel = undefined;
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
		this.element = atomicNumber;
		this.#setTool("atom");
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
			if (this.paletteDrag && this.#insideBoard(up.clientX, up.clientY)) {
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

	#placement(x: number, y: number): Point3 {
		if (this.view === "3d" && this.#scene) return this.#scene.placement(x, y);
		const [a, b] = this.#diagramPoint(x, y);
		return [a, b, 0];
	}

	/** The view centre, so an atom can be placed without a pointer. */
	#centre(): Point3 {
		const box = this.renderRoot.querySelector(".board")?.getBoundingClientRect();
		if (this.view === "3d" && this.#scene && box) return this.#scene.placement(box.left + box.width / 2, box.top + box.height / 2);
		return [0, 0, 0];
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
		const [x, y, z] = position ?? [radius * Math.cos(angle), radius * Math.sin(angle), 0];
		const identity = { id, atomicNumber, charge: 0 };
		if (current.kind === "crystal") {
			const coords = position ? fractional(cellVectors(current.cell), position) : [x - Math.floor(x), y - Math.floor(y), .5] as const;
			if (current.sites.some(site => site.fractional.every((coordinate, axis) => Math.abs(coordinate - coords[axis]) < 1e-6))) {
				this.notice = this.#t("A site already occupies that position.", "Diese Position ist bereits belegt.");
				return;
			}
			this.#record({ ...current, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined,
				source: undefined, sites: [...current.sites, { ...identity, fractional: coords }] });
		} else {
			const atom = { ...identity, diagram: [x, y] as Point2, position: [x, y, z] as Point3 };
			this.#record({ ...current, name: "", catalogKey: undefined, source: undefined, representation: undefined,
				geometry: undefined, atoms: [...current.atoms, atom] });
		}
		this.picked = id;
	}

	#setTool(tool: Tool) {
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
		this.#record({ ...draft, name: "", catalogKey: undefined, source: undefined, representation: undefined,
			geometry: undefined, bonds: [...bonds, { from, to, order: this.bondOrder }] });
		this.picked = to;
	}

	#removeAtom() {
		if (this.#readonly || this.picked === undefined) return;
		const id = this.picked;
		const draft = this.draft;
		if (draft.kind === "molecule") this.#record({ ...draft, name: "", catalogKey: undefined, source: undefined, representation: undefined, geometry: undefined,
			atoms: draft.atoms.filter(atom => atom.id !== id), bonds: draft.bonds.filter(bond => bond.from !== id && bond.to !== id) });
		else this.#record({ ...draft, name: "", catalogKey: undefined, bravais: undefined, spaceGroup: undefined, source: undefined,
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
		const next = fitGeometry(this.draft);
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
		if (!this.#insideBoard(event.clientX, event.clientY)) return undefined;
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
				|| target.classList.contains("selection-card")));
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
		this.#pointers.set(event.pointerId, point);
		if (this.#pointers.size > 1) {
			const [a, b] = this.#pointers.values();
			const next = distance(a, b);
			if (gesture.distance > 0 && next > 0) this.#scene?.zoom(gesture.distance / next);
			gesture.distance = next;
			return;
		}
		if (gesture.distance || (!gesture.moved && distance(gesture, point) < 5)) return;
		gesture.moved = true;
		if (this.tool === "bond" && gesture.from && !this.#readonly) {
			if (this.view === "3d") this.#scene?.preview(gesture.from, point.x, point.y);
			else this.bondPreview = this.#diagramPoint(point.x, point.y);
		} else if (this.view === "3d") {
			this.#scene?.orbit(point.x - gesture.x, point.y - gesture.y);
		} else if (gesture.diagram) {
			const last = this.#diagramPoint(gesture.x, gesture.y);
			const next = this.#diagramPoint(point.x, point.y);
			gesture.diagram = [gesture.diagram[0] + next[0] - last[0], gesture.diagram[1] + next[1] - last[1]];
			this.diagramDrag = { id: gesture.from, position: gesture.diagram };
		}
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
		if (!gesture || gesture.distance || event.type === "pointercancel") return;
		const hit = this.#hit(event);
		if (gesture.moved) {
			if (drag && this.draft.kind === "molecule") {
				const draft = this.draft;
				const id = drag.id;
				this.#record({ ...draft, atoms: draft.atoms.map(atom => atom.id === id ? { ...atom, diagram: drag.position,
					position: draft.geometry ? atom.position : [...drag.position, atom.position[2]] } : atom) });
			} else if (gesture.from && hit && !this.#readonly && this.tool === "bond") this.#connectBond(gesture.from, hit);
		} else if (hit) this.#selectAtom(hit);
		else if (this.tool === "atom" && this.#insideBoard(event.clientX, event.clientY)) {
			this.#addAtom(this.#placement(event.clientX, event.clientY));
		} else {
			this.picked = undefined;
			this.bondStart = undefined;
		}
	};

	#wheel = (event: WheelEvent) => {
		if (this.view !== "3d" || !this.#scene || this.#overPanel(event)) return;
		event.preventDefault();
		this.#scene.zoom(Math.exp(Math.max(-100, Math.min(100, event.deltaY)) * 0.004));
	};

	#keys = (event: KeyboardEvent) => {
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
		} else if ((event.key === "Enter" || event.key === " ") && this.tool === "atom" && !this.#readonly
			&& event.composedPath().some(target => target instanceof Element && target.classList.contains("board"))) {
			// The keyboard counterpart to dropping an element on the canvas.
			event.preventDefault();
			this.#addAtom(this.#centre());
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
		const variants = catalogStructures(key);
		this.catalogKey = key;
		this.catalogVariants = variants;
		this.catalogIndex = 0;
		this.openPanel = "catalog";
		if (variants.length) this.#openPreview(variants[0]);
		else this.preview = undefined;
		return true;
	}

	viewStructure(snapshot: Structure): boolean {
		const structure = readStructure(snapshot);
		if (!structure) return false;
		this.catalogKey = "";
		this.catalogVariants = [];
		this.#openPreview(structure);
		return true;
	}

	#openPreview(snapshot: Structure) {
		this.#fileOpen++;
		this.preview = snapshot;
		this.#resetSelection();
		this.notice = "";
		if (this.gpu !== "unavailable") this.view = "3d";
	}

	#closePreview(edit: boolean) {
		const current = this.preview;
		this.preview = undefined;
		this.catalogKey = "";
		this.catalogVariants = [];
		// The chooser has done its job once a structure is adopted or dismissed, so it
		// no longer covers the canvas and repeats the name in the document header.
		this.openPanel = undefined;
		if (edit && current) this.#record(current, true);
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
			this.#record(structure, true);
			this.openPanel = undefined;
		} catch {
			if (request === this.#fileOpen) this.notice = this.#t("Could not open this ChemLab structure file.", "Diese ChemLab-Strukturdatei konnte nicht geöffnet werden.");
		}
	};

	#download() {
		const file = new Blob([JSON.stringify(this.#current, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(file);
		const anchor = this.ownerDocument.createElement("a");
		anchor.download = (this.#current.name || formula(this.#current) || "structure").replace(/[^\p{L}\p{N}_-]+/gu, "-") + ".chemlab-structure.json";
		anchor.href = url;
		anchor.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

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
	 * row of its own and the variants of the chosen one appear right below it.
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
		const note = selected && !this.catalogVariants.length
			? catalogIsMixture(selected)
				? this.#t("Mixture with no unique structure", "Gemisch ohne eindeutige Struktur")
				: this.#t("No verified structure available", "Keine verifizierte Struktur verfügbar")
			: "";
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
								aria-pressed=${String(entry.name === selected)} @click=${() => this.viewCatalogStructure(entry.name)}>
								<span class="catalog-entry-name">${entry.name}</span>
								<span class="catalog-entry-formula">${entry.formula}</span>
							</button>
							${entry.name !== selected ? nothing : this.catalogVariants.length > 1 ? html`
								<div class="catalog-variants" role="group" aria-label=${this.#t("Structure", "Struktur")}>
									${this.catalogVariants.map((variant, index) => html`<button type="button"
										class="catalog-variant${index === this.catalogIndex ? " is-selected" : ""}"
										aria-pressed=${String(index === this.catalogIndex)} @click=${() => {
											this.catalogIndex = index;
											this.#openPreview(this.catalogVariants[index]);
										}}>${variant.name}</button>`)}
								</div>` : note ? html`<p class="catalog-note">${note}</p>` : nothing}
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
		return html`<div id="file-actions" class="surface" role="group" aria-label=${this.#t("File", "Datei")}>
			<sl-button size="small" @click=${() => this.#new("molecule")}>${this.#t("New molecule", "Neues Molekül")}</sl-button>
			<sl-button size="small" @click=${() => this.#new("crystal")}>${this.#t("New crystal", "Neuer Kristall")}</sl-button>
			<input type="file" hidden accept=".json,application/json" @change=${(event: Event) => {
				const input = event.currentTarget as HTMLInputElement;
				void this.#openFile(input.files?.[0]); input.value = "";
			}} />
			<sl-button size="small" @click=${() => this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
				${this.#t("Open file", "Datei öffnen")}
			</sl-button>
			<sl-button size="small" ?disabled=${!this.#atoms.length} @click=${this.#download}>${this.#t("Download", "Herunterladen")}</sl-button>
		</div>`;
	}

	/** Renders a compact icon control, the shape the canvas controls share with the lab. */
	#iconButton(options: { label: string; icon: unknown; pressed?: boolean; disabled?: boolean; onClick: () => void }) {
		return html`<sl-button class="icon-control" size="small" aria-label=${options.label} title=${options.label}
			variant=${options.pressed ? "primary" : "default"} aria-pressed=${options.pressed === undefined ? nothing : String(options.pressed)}
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

	#renderDrawing(colors: ReadonlyMap<string, number>) {
		const current = this.#current;
		const project = ([x, y, z]: Point3): Point2 => [x + .43 * z, y + .27 * z];
		const positions: (Atom | (Site & { diagram: Point2 }))[] = current.kind === "molecule"
			? current.atoms.map(atom => ({ ...atom, diagram: this.diagramDrag?.id === atom.id ? this.diagramDrag.position : atom.diagram }))
			: replicatedSites(current, this.repeats).map(({ site, position }) => ({ ...site, diagram: project(position) }));
		const r = this.repeats;
		const corners: Point3[] = [[0, 0, 0], [r, 0, 0], [r, r, 0], [0, r, 0], [0, 0, r], [r, 0, r], [r, r, r], [0, r, r]];
		const vectors = current.kind === "crystal" ? cellVectors(current.cell) : undefined;
		const outline = vectors ? corners.map(point => project(cartesian(vectors, point))) : [];
		const lattice = current.kind === "crystal" && this.showLattice ? latticePositions(current, r).map(project) : [];
		if (current !== this.#lastDrawn || r !== this.#lastDrawnRepeats) {
			this.#lastDrawn = current;
			this.#lastDrawnRepeats = r;
			const points = [...outline, ...positions.map(atom => atom.diagram)];
			const minX = Math.min(-3, ...points.map(point => point[0]));
			const maxX = Math.max(3, ...points.map(point => point[0]));
			const minY = Math.min(-2, ...points.map(point => -point[1]));
			const maxY = Math.max(2, ...points.map(point => -point[1]));
			this.#diagramBounds = [minX - 1.1, minY - 1.1, maxX - minX + 2.2, maxY - minY + 2.2];
		}
		const byId = new Map(positions.map(atom => [atom.id, atom.diagram] as const));
		const line = (from: Point2, to: Point2, order: number, color: string) => {
			const dx = to[0] - from[0], dy = to[1] - from[1];
			const length = Math.hypot(dx, dy) || 1;
			return Array.from({ length: order }, (_, index) => {
				const offset = (index - (order - 1) / 2) * .105;
				const x = dy / length * offset, y = dx / length * offset;
				return svg`<line x1=${from[0] + x} y1=${-from[1] + y} x2=${to[0] + x} y2=${-to[1] + y}
					stroke=${color} stroke-width=".046" stroke-linecap="round" />`;
			});
		};
		const from = byId.get(this.#gesture?.from);
		return html`<svg class="drawing" viewBox=${this.#diagramBounds.join(" ")} role="img"
			aria-label=${this.#t("Structure diagram", "Strukturzeichnung")}>
			${current.kind === "molecule"
				? current.bonds.map(bond => line(byId.get(bond.from), byId.get(bond.to), bond.order, "#52525b"))
				: outline.flatMap((point, index) => [
					line(point, outline[(index < 4 ? 0 : 4) + (index + 1) % 4], 1, "#a1a1aa"),
					index < 4 ? line(point, outline[index + 4], 1, "#a1a1aa") : nothing,
				])}
			${from && this.bondPreview ? line(from, this.bondPreview, this.bondOrder, "#0284c7") : nothing}
			${positions.map(atom => {
				const { id, atomicNumber, diagram: [x, y], charge, isotope } = atom;
				const occupancy = "occupancy" in atom ? atom.occupancy : undefined;
				const species = current.kind === "crystal" ? siteIon(atom) : undefined;
				const color = colors.get(species) ?? atomColor(atomicNumber);
				const selected = id === this.picked || id === this.bondStart;
				const hovered = id === this.hoveredAtom && !selected;
				return svg`<g data-atom=${id} aria-label=${species ? `${symbol(atomicNumber)} · ${species}` : symbol(atomicNumber)} transform="translate(${x} ${-y})"
					opacity=${selected ? 1 : Math.max(.18, occupancy ?? 1)}>
					${hovered ? svg`<circle r=".3" fill="none" stroke="#0284c7" stroke-width=".03" />` : nothing}
					<circle r=".254" fill=${selected ? "#dff3ff" : "white"} stroke=${selected ? "#0284c7" : species ? colorHex(color) : "#a1a1aa"} stroke-width=${selected ? .045 : .028} />
					<circle cx="-.17" cy="-.17" r=".075" fill=${colorHex(color)} stroke="#707780" stroke-width=".01"/>
					<text text-anchor="middle" dominant-baseline="central" font-weight="600" font-size=".23" fill="#27272a">${symbol(atomicNumber)}</text>
					${charge ? svg`<text x=".19" y="-.19" font-size=".15" font-weight="600" fill="#27272a">${chargeText(charge)}</text>` : nothing}
					${isotope ? svg`<text x="-.25" y="-.24" font-size=".13" text-anchor="end" fill="#27272a">${isotope}</text>` : nothing}
				</g>`;
			})}
			<g pointer-events="none" aria-hidden="true" data-lattice-points>
				${lattice.map(([x, y]) => svg`<circle cx=${x} cy=${-y} r=".078" fill="#283648" stroke="white" stroke-width="1.2" vector-effect="non-scaling-stroke" />`)}
			</g>
		</svg>`;
	}

	/** The model summary keeps compound, representation and display controls at the canvas edge. */
	#renderModelSummary(current: Structure, representation: string | undefined, ionColors: ReadonlyMap<string, number>) {
		const crystal = current.kind === "crystal";
		const geometry = current.kind === "molecule" && this.#atoms.length
			? current.geometry === "idealized" ? this.#t("Idealized geometry", "Idealisierte Geometrie")
				: current.geometry === "estimated" ? this.#t("Estimated geometry", "Geschätzte Geometrie")
					: this.#t("Sketch", "Skizze")
			: undefined;
		const toggle = (label: string, value: boolean, onClick: () => void) => html`<sl-button size="small"
			variant=${value ? "primary" : "default"} aria-pressed=${String(value)} @click=${onClick}>${label}</sl-button>`;
		return html`<div class="model-summary">
			<div class="fields">
				<sl-tag size="small">${crystal ? this.#t("Crystal", "Kristall") : this.#t("Molecule", "Molekül")}</sl-tag>
				${this.#atoms.length ? html`<sl-tag size="small">${formula(current)}</sl-tag>` : nothing}
				${representation ? html`<sl-tag size="small">${representation}</sl-tag>` : nothing}
				${geometry ? html`<sl-tag size="small">${geometry}</sl-tag>` : nothing}
			</div>
			${ionColors.size ? html`<span class="structure-legend" role="group" aria-label=${this.#t("Ion colours", "Ionenfarben")}>
				${[...ionColors].map(([ion, color]) => html`<span style="--swatch: ${colorHex(color)}">${ion}</span>`)}
				${crystal && this.showLattice ? html`<span data-marker="lattice">${this.#t("Lattice points", "Gitterpunkte")}</span>` : nothing}
			</span>` : nothing}
			${current.kind === "molecule" && this.showElectrons && this.view === "3d" ? html`
				<span class="structure-legend" title=${this.#t(
					"Approximate Lewis and VSEPR regions. Dots represent electron counts in the displayed bonding model.",
					"Angenäherte Lewis- und VSEPR-Bereiche. Punkte stehen für die Elektronenzahl im dargestellten Bindungsmodell.",
				)}>
					<span data-region="bond">${this.#t("Bonding", "Bindend")}</span>
					<span data-region="lone">${this.#t("Nonbonding", "Nichtbindend")}</span>
				</span>` : nothing}
			<div class="display-controls" role="group" aria-label=${this.#t("Display", "Darstellung")}>
				${crystal ? html`<label>${this.#t("Cells", "Zellen")}
					<select .value=${String(this.repeats)} @change=${(event: Event) => {
						this.repeats = Number((event.currentTarget as HTMLSelectElement).value);
						this.#fitNext = true;
						this.#lastDrawn = undefined;
					}}>
						${[1, 2, 3].filter(value => value ** 3 * current.sites.length <= 1800)
							.map(value => html`<option value=${value} ?selected=${value === this.repeats}>${value} × ${value} × ${value}</option>`)}
					</select></label>` : nothing}
				${crystal ? toggle(this.#t("Cell edges", "Zellkanten"), this.showEdges, () => { this.showEdges = !this.showEdges; }) : nothing}
				${crystal ? toggle(this.#t("Lattice points", "Gitterpunkte"), this.showLattice, () => { this.showLattice = !this.showLattice; }) : nothing}
				${crystal ? toggle(this.#t("Axes", "Achsen"), this.showAxes, () => { this.showAxes = !this.showAxes; }) : nothing}
				${current.kind === "molecule" && current.atoms.length && this.view === "3d" && this.gpu === "ready"
					? toggle(this.#t("Valence electrons", "Valenzelektronen"), this.showElectrons, () => { this.showElectrons = !this.showElectrons; })
					: nothing}
			</div>
			<output aria-live="polite">${this.notice || (this.bondStart ? this.#t("Choose the other atom.", "Wähle das zweite Atom.") : "")}</output>
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
		const radius = atom && atomRadius(atom.atomicNumber,
			current.kind === "crystal" && current.catalogKey && current.spaceGroup === "Fm-3m" && atom.charge ? atom.charge : undefined);
		const radiusLabel = {
			covalent: this.#t("covalent", "kovalent"), empirical: this.#t("empirical", "empirisch"),
			ionic: this.#t("ionic, CN 6", "ionisch, KZ 6"), schematic: this.#t("schematic", "schematisch"),
		};
		const occupancy = atom && "occupancy" in atom ? atom.occupancy : undefined;
		return html`<aside class="selection-card" aria-label=${this.#t("Selection", "Auswahl")}>
			<div class="card-head">
				<sl-tag size="small" variant=${atom ? "primary" : "neutral"}>${title}</sl-tag>
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
				${radius ? html`<sl-tag size="small">${radius.pm} pm · ${radiusLabel[radius.model]}</sl-tag>` : nothing}
				${shape ? html`<sl-tag size="small">${shapeLabel[shape]}</sl-tag>` : nothing}
				${occupancy !== undefined ? html`<sl-tag size="small">${Number((100 * occupancy).toFixed(1))} %</sl-tag>` : nothing}
			</div>` : nothing}
			<sl-details summary=${current.kind === "crystal" ? this.#t("Site properties", "Gitterplatz-Eigenschaften")
				: this.#t("Atom properties", "Atom-Eigenschaften")} ?open=${!atom}>
				<div class="fields">
					<div class="site-picker" role="group" aria-label=${current.kind === "crystal"
						? this.#t("Site", "Gitterplatz") : this.#t("Atom", "Atom")}>
						${this.#atoms.map(entry => html`<button type="button" class="site-chip"
							aria-pressed=${String(entry.id === this.picked)}
							@pointerenter=${() => this.#hoverAtom(entry.id)} @pointerleave=${() => this.#hoverAtom(undefined)}
							@focus=${() => this.#hoverAtom(entry.id)} @blur=${() => this.#hoverAtom(undefined)}
							@click=${() => this.#selectAtom(entry.id)}>${symbol(entry.atomicNumber)}${chargeText(entry.charge)} · ${entry.id}</button>`)}
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
		const representation = current.kind === "molecule" && current.representation && {
			conformer: this.#t("PubChem conformer", "PubChem-Konformer"),
			experimental: this.#t("Experimental geometry", "Experimentelle Geometrie"),
			constituent: this.#t("Mixture constituent", "Gemischbestandteil"),
			"repeat-unit": this.#t("Capped repeat-unit example", "Beispiel mit abgesättigten Wiederholungseinheiten"),
			"ionic-components": this.#t("Ionic components", "Ionenbestandteile"),
		}[current.representation];
		const tool = (value: Tool, label: string) => html`<sl-button size="small" variant=${value === this.tool ? "primary" : "default"}
			aria-pressed=${value === this.tool} @click=${() => this.#setTool(value)}>${label}</sl-button>`;
		const fit = () => { this.#scene?.fit(); this.#lastDrawn = undefined; this.requestUpdate(); };
		const title = current.catalogKey ? catalogEntry(current.catalogKey)?.name ?? current.name : current.name || formula(current);
		const toggle = (panel: "catalog" | "file") => () => { this.openPanel = this.openPanel === panel ? undefined : panel; };
		return html`<div class="builder" contenteditable="false" @keydown=${this.#keys}
			@dragover=${(event: DragEvent) => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); }}
			@drop=${(event: DragEvent) => { if (event.dataTransfer?.files.length) { event.preventDefault(); void this.#openFile(event.dataTransfer.files[0]); } }}>
			<header class="document">
				<div class="document-title">
					<sl-tag size="small" variant="primary">${this.#t("Molecule Builder", "Molekülbaukasten")}</sl-tag>
					<h5 title=${title}>${title}</h5>
					<sl-tag size="small" variant=${this.#readonly ? "warning" : "neutral"}>
						${this.#readonly ? this.#t("Preview", "Vorschau") : this.#t("Draft", "Entwurf")}
					</sl-tag>
				</div>
				<div class="document-actions">
					<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.openPanel === "catalog"}>
						<sl-button slot="anchor" size="small" aria-expanded=${this.openPanel === "catalog"} @click=${toggle("catalog")}>
							${this.#t("ChemLab catalog", "ChemLab-Katalog")}
						</sl-button>
						${this.#renderCatalog()}
					</sl-popup>
					<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.openPanel === "file"}>
						<sl-button slot="anchor" size="small" aria-expanded=${this.openPanel === "file"} @click=${toggle("file")}>
							${this.#t("File", "Datei")}
						</sl-button>
						${this.#renderFileActions()}
					</sl-popup>
					${this.#atoms.length && this.labs.length ? html`<sl-popup placement="bottom-end" distance="4" flip shift .active=${this.showLabs}>
						<sl-button slot="anchor" size="small" variant="primary" @click=${this.#prepareSend}>
							${this.#t("Send to ChemLab", "An ChemLab senden")}
						</sl-button>
						${this.#renderTargetPicker()}
					</sl-popup>` : nothing}
					${this.#readonly ? html`
						<sl-button size="small" variant="primary" @click=${() => this.#closePreview(true)}>${this.#t("Edit copy", "Kopie bearbeiten")}</sl-button>
						<sl-button size="small" @click=${() => this.#closePreview(false)}>${this.#t("Close preview", "Vorschau schließen")}</sl-button>
					` : nothing}
				</div>
			</header>
			${this.#readonly ? nothing : html`<div class="tools" role="toolbar" aria-label=${this.#t("Editing tools", "Bearbeitungswerkzeuge")}>
				<div class="tool-group" role="group" aria-label=${this.#t("Tools", "Werkzeuge")}>
					${tool("orbit", this.view === "3d" ? this.#t("Orbit", "Drehen") : this.#t("Select", "Auswählen"))}
					${tool("atom", this.#t("Place atom", "Atom platzieren"))}
					${current.kind === "molecule" ? tool("bond", this.#t("Draw bond", "Bindung zeichnen")) : nothing}
					${this.tool === "bond" ? html`<span class="bond-orders" role="group" aria-label=${this.#t("Bond order", "Bindungsordnung")}>
						${([1, 2, 3] as BondOrder[]).map(order => html`<sl-button class="icon-control" size="small"
							variant=${order === this.bondOrder ? "primary" : "default"} aria-pressed=${String(order === this.bondOrder)}
							aria-label=${this.#t(`Bond order ${order}`, `Bindungsordnung ${order}`)}
							title=${this.#t(`Bond order ${order}`, `Bindungsordnung ${order}`)}
							@click=${() => { this.bondOrder = order; }}>${order}</sl-button>`)}
					</span>` : nothing}
				</div>
				${current.kind === "molecule" && current.bonds.length ? html`<div class="tool-group">
					<sl-button size="small" @click=${this.#geometry}>${this.#t("Fit geometry", "Geometrie anpassen")}</sl-button>
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
							${lattice ? html`<sl-button size="small" @click=${() => this.viewStructure(lattice)}>
								${this.#t("View crystal", "Kristall ansehen")}</sl-button>` : nothing}
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
						<div class="scene" ?hidden=${this.view !== "3d"}></div>
						${this.view === "2d" ? this.#renderDrawing(ionColors) : nothing}
						${this.gpu === "loading" && this.view === "3d" ? html`<p class="empty" role="status"><sl-spinner></sl-spinner>
							${this.#t("Loading 3D view", "3D-Ansicht wird geladen")}</p>`
							: !this.#atoms.length ? html`<p class="empty">
								${this.#t("Drag an element here, or choose Place atom and click the canvas.",
									"Ziehe ein Element hierher oder wähle Atom platzieren und klicke auf die Fläche.")}
							</p>` : nothing}
						<div class="view-tools" role="group" aria-label=${this.#t("Canvas view", "Ansicht der Zeichenfläche")}>
							${this.#iconButton({ label: this.#t("3D view", "3D-Ansicht"), icon: CUBE_ICON, pressed: this.view === "3d",
								disabled: this.gpu === "unavailable", onClick: () => { this.view = "3d"; } })}
							${this.#iconButton({ label: this.#t("Structure view", "Strukturansicht"), icon: PLANE_ICON, pressed: this.view === "2d",
								onClick: () => { this.view = "2d"; } })}
							${this.view === "3d" && this.gpu === "ready" ? html`
								${this.#iconButton({ label: this.#t("Zoom in", "Vergrößern"), icon: "+", onClick: () => this.#scene?.zoom(.83) })}
								${this.#iconButton({ label: this.#t("Zoom out", "Verkleinern"), icon: "−", onClick: () => this.#scene?.zoom(1.2) })}
							` : nothing}
							${this.#iconButton({ label: this.#t("Fit view", "Ansicht einpassen"), icon: FIT_ICON, onClick: fit })}
						</div>
						${this.#renderModelSummary(current, representation, ionColors)}
						${this.#renderSelectionCard()}
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
