import { drawerLabels, effectiveLanguage, localize } from "./localization/localization";
import { html, LitElement, nothing, PropertyValueMap, render } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";
import { live } from "lit/directives/live.js";
import { LitElementWw } from "@webwriter/lit";
import {
	customElement,
	property,
	query,
	state,
} from "lit/decorators.js";

import { style } from "chemlab-style";

import * as PIXI from "pixi.js";
import * as chemlib from "./chemlib";
import SmilesDrawer from "smiles-drawer"

import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlBadge from "@shoelace-style/shoelace/dist/components/badge/badge.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.component.js";
import SlCarouselItem from "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.component.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlTab from "@shoelace-style/shoelace/dist/components/tab/tab.component.js";
import SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group.component.js";
import SlTabPanel from "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.component.js";

import "@shoelace-style/shoelace/dist/themes/light.css";

import { setAnimation } from "@shoelace-style/shoelace/dist/utilities/animation-registry.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("@shoelace-style/shoelace/dist");

import {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} from "unique-names-generator";
import Chart from "chart.js/auto";


import { dictionary as germanDictionary } from "./data/dictionary";
import { pHColors as phColorScale, pHTextColor } from "./data/phColors";
import { defaultMolecules, defaultMixtures } from "./data/presets";
import { sendXApiStatement } from "./services/xapi";
import { DiagramController } from "./controllers/DiagramController";
import { SimulationController } from "./controllers/SimulationController";
import { componentGraphic, componentVariant, componentVariants, type ComponentVariant, type PaletteComponent } from "./data/componentGraphics";
import { renderComponentPaletteIcon } from "./data/componentPaletteIcons";
import { chemicalCatalog, chemicalCatalogGroups, solutionDisplayNames, withConcentration, type ChemicalRecipe, type MoleculeDefinition } from "./data/chemicals";
import { loadMoleculeDefinition } from "./data/moleculeDefinition";
import { catalogPreviews } from "./data/chemicalPreviews.generated";
import { prepareDose, type SavedDose } from "./data/measuredDose";
import { vesselCarouselEntries, type VesselPlating } from "./data/vesselCarousel";
import { STANDARD_CANVAS_WIDTH } from "./controllers/WorkspaceCamera";
import { CanvasController } from "./controllers/CanvasController";
import type { VesselHint } from "./controllers/VesselView";

type SelectedChemical = { key: string; name: string; recipe: ChemicalRecipe };
type ChemicalConcentration = { initial: number; max: number };
type ChemicalPermissionItem = { name: string; concentrationLimit?: number };
const catalogConcentrationLimits = new Map(chemicalCatalog.flatMap(({ name, concentrationLimit }) =>
	concentrationLimit ? [[name, concentrationLimit] as const] : []));

function chemicalConcentration({ concentrationLimit }: ChemicalPermissionItem): ChemicalConcentration | undefined {
	return concentrationLimit ? { initial: Math.min(1, concentrationLimit), max: concentrationLimit } : undefined;
}

function concentrationPresets({ max }: ChemicalConcentration): number[] {
	return [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2].filter((value) => value < max).concat(max);
}
type AmountSource = { name: string; recipe: ChemicalRecipe; dose: (volumeMl: number) => chemlib.Mixture } |
	{ vessel: chemlib.ChemComponent };

const TRANSFER_HOLD_MS = 1500;
const TRANSFER_HOLD_RADIUS = 6;
const DRAG_TRANSFER_TASK = "drag-transfer";
const MIN_TWO_PANELS_WIDTH = 480;

/**
 * chemlab webwriter widget for presenting interactive chemistry experiments
 *
 * @export
 * @class ChemLab
 * @typedef {ChemLab}
 * @extends {LitElementWw}
 */
@customElement("webwriter-chemlab")
export class ChemLab extends LitElementWw {

	static override properties = { lang: { attribute: false, noAccessor: true } };
	override get lang() { return effectiveLanguage(this); }
	override set lang(value: string) { this.setAttribute("lang", value); }

	static optionGroups = {
		appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false },
		analytics: { label: { _: "xAPI", "de-DE": "xAPI" }, collapsible: true, advanced: true },
	};
	static options = {
		newSmilesDrawer: {
			type: "select" as const,
			group: "appearance",
			label: { _: "Experimental molecule drawing", "de-DE": "Experimentelle Moleküldarstellung" },
			options: [
				{ value: "1", label: { _: "Enabled", "de-DE": "Aktiviert" } },
				{ value: "0", label: { _: "Disabled", "de-DE": "Deaktiviert" } },
			],
		},
		thumbnailBadges: {
			type: Boolean,
			group: "appearance",
			label: { _: "Label thumbnail sources", "de-DE": "Vorschaubild-Quellen anzeigen" },
		},
		enablexAPI: {
			type: Boolean,
			group: "analytics",
			label: { _: "Send xAPI statements", "de-DE": "xAPI-Statements senden" },
		},
		xAPIKey: {
			type: "password" as const,
			group: "analytics",
			label: { _: "xAPI key", "de-DE": "xAPI-Schlüssel" },
		},
	};
	options = ChemLab.options;
	optionGroups = ChemLab.optionGroups;

	readonly message = localize(this, () => {
		this.options = drawerLabels(ChemLab.options, this.lang);
		this.optionGroups = drawerLabels(ChemLab.optionGroups, this.lang);
		this.diagrams.updateLabels();
		if (this.hasUpdated) {
			this.displayedGridWidthMm = undefined;
			this.canvas.updateScaleReadouts();
			this._updatePopup();
		}
	});


	itemName(key: string) {
		return this.message(this.dictionary[key?.toLowerCase()] ?? key ?? "");
	}


	/**
	 * css styles
	 *
	 * @static
	 * @type {*}
	 */
	static styles = style;

	/**
	 * main container of the canvas
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#upper")
	accessor containerDiv: HTMLDivElement;
	private vesselThumbnails = new WeakMap<chemlib.Molecule, { drawer: number; element: Element }>();
	private vesselNameRequests = new WeakSet<chemlib.Molecule>();
	private carouselMixture?: chemlib.Mixture;
	/**
	 * status strip element for short, non-blocking notices
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#statusStrip")
	private accessor statusStrip: HTMLDivElement;
	/**
	 * container inside object context menu showing molar info
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#contextMolInfo")
	private accessor contextMolInfo: SlCarousel;
	@query("#contextInfoBox")
	private accessor objectSummary: HTMLElement;
	@query("#groupSelectionInfo")
	private accessor groupSummary: HTMLElement;
	/**
	 * container inside object context menu showing general info on current mixture
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#contextMixInfo")
	private accessor contextMixInfo: HTMLDivElement;
	/**
	 * button inside object context menu to open burette components
	 *
	 * @private
	 * @type {HTMLButtonElement}
	 */
	@query("#openComp")
	private accessor openBtn: HTMLButtonElement;
	/**
	 * button inside object context menu to activate electric components
	 *
	 * @private
	 * @type {HTMLButtonElement}
	 */
	@query("#activateEComp")
	private accessor activateEComp: HTMLButtonElement;
	/**
	 * container inside object context menu showing general info on current e-component
	 *
	 * @private
	 * @type {HTMLButtonElement}
	 */
	@query("#contextEchemInfo")
	private accessor contextEchemInfo: HTMLButtonElement;
	/**
	 * part of options, toggles xAPI statements
	 *
	 * @private
	 * @type {SlCheckbox}
	 */
	@query("#xAPICheck")
	private accessor xAPICheck: SlCheckbox;
	/**
	 * xAPI API key input
	 *
	 * @private
	 * @type {SlInput}
	 */
	@query("#xAPIKeyInput")
	private accessor xAPIKeyInput: SlInput;
	/**
	 * main container inside diagram drawer for all diagrams and headings
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */

	readonly canvasContainer = Object.assign(document.createElement("div"), { id: "canvasContainer" });

	@query("#canvasArea")
	accessor canvasArea: HTMLDivElement;

	@query("#canvasZoom")
	accessor canvasZoom: HTMLDivElement;
	@query("#zoomLevel", true)
	private accessor zoomLevel: HTMLElement;
	@query("#gridScale", true)
	private accessor gridScale: HTMLElement;
	@query("#gridScaleValue", true)
	private accessor gridScaleValue: HTMLElement;
	private displayedGridWidthMm?: number;
	/**
	 * part of options, toggles different panel variants 
	 *
	 * @private
	 * @type {SlRadioGroup}
	 */


	/**
	 * color palet for pH indication
	 *
	 * @private
	 * @type {object}
	 */
	@property({ attribute: false })
	private accessor pHColors = phColorScale;
	/**
	 * dictionary for german translation of all internal keywords
	 *
	 * @private
	 * @type {object}
	 */
	@property({ attribute: false })
	accessor dictionary: object = germanDictionary;
	/**
	 * reflected data on available molecules
	 *
	 * @private
	 * @type {Array<object>}
	 */
	@property({
		type: Array<object>,
		attribute: false,
	})
	private accessor availableMolecules: Array<object> = defaultMolecules;
	/**
	 * reflected data on available mixtures
	 *
	 * @private
	 * @type {Array<object>}
	 */
	@property({
		type: Array<object>,
		attribute: false,
	})
	private accessor availableMixtures: Array<object> = defaultMixtures;
	/**
	 * reflected data on available components
	 *
	 * @private
	 * @type {Array<object>}
	 */
	@property({
		type: Array<object>,
		attribute: false,
	})
	accessor availableComponents: Array<object> = [];
	/**
	 * temporary debug toggle: label each vessel thumbnail with its render
	 * source (smilesdrawer / kekule / text)
	 *
	 * @property {boolean} thumbnailBadges
	 */
	@property({ type: Boolean, reflect: true })
	accessor thumbnailBadges = false;
	private dataObserver?: MutationObserver;
	private savedDataSnapshot: string | null = null;
	private updatingDataBlock = false;
	private refreshFromRemoteData = false;

	/**
	 * list of all sprites of available components
	 *
	 * @private
	 * @type {Array<[PIXI.Container, number]>}
	 */
	@property({ attribute: false })
	accessor avComponentsSprites: Array<[PIXI.Container, number]> = [];
	/**
	 * controller owning all Chart.js diagrams (titration / e-chem)
	 *
	 * @type {DiagramController}
	 */
	diagrams = new DiagramController(this);
	/**
	 * controller owning the PixiJS ticker system (loop + registered functions)
	 *
	 * @type {SimulationController}
	 */
	simulation = new SimulationController(this);
	/**
	 * controller owning the PixiJS canvas layer (app, sprites, drag)
	 *
	 * @type {CanvasController}
	 */
	private canvas = new CanvasController(this);
	/**
	 * currently dragged sprite object
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	accessor dragObject = undefined;
	/**
	 * current mouse position
	 *
	 * @private
	 * @type {number[]}
	 */
	@property({ attribute: false })
	accessor mousePos: number[] = [0, 0];
	/**
	 * seperate container element for the PixiJS Application
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	accessor pix_canvas = document.createElement("p_c");
	/**
	 * the PixiJS Application
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	accessor app: PIXI.Application<PIXI.WebGLRenderer<HTMLCanvasElement>> | null = null;
	private canvasReady: Promise<void>;
	/**
	 * list of all current component objects
	 *
	 * @private
	 * @type {chemlib.ChemComponent[]}
	 */
	@property({ attribute: false })
	accessor allChemComponents: chemlib.ChemComponent[] = [];
	/**
	 * list of all current e-component objects
	 *
	 * @private
	 * @type {chemlib.ElectricComponent[]}
	 */
	@property({ attribute: false })
	accessor allEComponents: chemlib.ElectricComponent[] = [];
	/**
	 * the currently selected component/e-component object
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	accessor curr_obj: any = null;


	@state() private accessor fullWidthMode = false;
	@state() private accessor diagramPanelOpen = false;
	@state() private accessor teacherDrawerOpen = false;
	private teacherDrawerChoice?: boolean;
	private workspaceResizeObserver?: ResizeObserver;
	private workspaceClassObserver?: MutationObserver;
	@state() private accessor teacherTab: "components" | "chemicals" = "components";
	@state() private accessor permissionTooltip: { anchor: HTMLElement; type: string; text: string } | undefined;
	@state() private accessor visibleVariants: Partial<Record<PaletteComponent, string>> = {};
	@state() private accessor componentToPlace: string | undefined;
	@state() private accessor selectedChemical: SelectedChemical | undefined;
	/** per chemical: blocked for learners, or the concentrations offered as separate tiles */
	@state() private accessor chemicalPermissions: Record<string, { blocked?: true; concentrations?: number[] }> = {};
	@state() private accessor amountMenu: {
		target: chemlib.ChemComponent;
		anchor: PIXI.Container;
		from: AmountSource;
		amount: number;
		max: number;
		editing?: boolean;
	} | undefined;
	@state() private accessor fillMeter: { x: number; y: number; volume: number; capacity: number } | undefined;
	@state() private accessor chemicalCatalogOpened = false;
	@state() private accessor chemicalQuery = "";
	@state() private accessor activeChemicalConcentrations: Record<string, number> = {};
	@state() private accessor openConcentrationMenu: string | undefined;
	/** the chemical category currently shown in the catalog */
	@state() private accessor chemicalGroup = "Salze";
	private stopDose?: (save?: boolean) => void;
	private paletteDrag?: AbortController;
	private suppressPaletteClick = false;
	private dragTransfer?: {
		anchor: PIXI.Container;
		target: chemlib.ChemComponent;
		from: AmountSource;
		point: PIXI.PointData;
		heldMs: number;
		nextDoseMs: number;
		active: boolean;
		totalMl: number;
	};
	private meterTimeout?: number;
	private statusTimeout?: number;

	/**
	 * the name of the current object
	 *
	 * @private
	 * @type {string}
	 */
	@property({ attribute: false })
	private accessor curr_name: string = "";
	/**
	 * the index of the sprite of the selected object in the PixiJS stage
	 *
	 * @private
	 * @type {number}
	 */
	@property({ attribute: false })
	accessor curr_stage_index: number = -1;
	/**
	 * the random pseudonym of the current session
	 *
	 * @private
	 * @type {string}
	 */
	@property({ attribute: false })
	private accessor RndName: string = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
	});
	/**
	 * reflected list of disabled compoents/e-components in the student view
	 *
	 * @private
	 * @type {string[]}
	 */
	@property({
		type: Array<String>,
		attribute: false,
	})
	private accessor invComponents: string[] = [];
	/**
	 * reflected, if xAPI statements should be sent
	 *
	 * @private
	 * @type {boolean}
	 */
	@property({
		type: Boolean,
		reflect: true,
		converter: {
			fromAttribute: (value: string, type: boolean) => {
				if (value === "true") {
					return true;
				}
					return value === "";
			},
			toAttribute: (value: boolean, type: string) => {
				if (value) {
					return "true";
				}
				return "false";
			},
		},
	})
	private accessor enablexAPI: boolean = false;
	/**
	 * reflected, the current xAPI key
	 *
	 * @private
	 * @type {string}
	 */
	@property({ type: String, reflect: true })
	private accessor xAPIKey: string =
		"";
	/**
	 * SmilesDrawer instance to draw molecules in a 100x100 canvas
	 *
	 * @private
	 * @type {SmilesDrawer}
	 */
	@property({attribute: false})
	private accessor smilesDrawer100: SmilesDrawer = null
	/**
	 * SmilesDrawer instance to draw molecules in a 150x150 canvas
	 *
	 * @private
	 * @type {SmilesDrawer}
	 */
	@property({attribute: false})
	/**
	 * wether to use the SmilesDrawer package
	 *
	 * @private
	 * @type {number}
	 */
	@property({type: Number, reflect: true})
	private accessor newSmilesDrawer: number = 1
	/**
	 * Creates an instance of ChemLab.
	 *
	 * @constructor
	 */
	constructor() {
		super();
		console.log(SmilesDrawer)
		this.smilesDrawer100 = new SmilesDrawer.SvgDrawer({ width: 100, height: 100, explicitHydrogens: true, compactDrawing: false, terminalCarbons: true});
	}

	/**
	 * early fix for webwriter focus issues
	 *
	 * @static
	 * @type {*}
	 */
	static shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static get scopedElements() {
		return {
			"sl-details": SlDetails,
			"sl-button": SlButton,
			"sl-icon-button": SlIconButton,
			"sl-icon": SlIcon,
			"sl-badge": SlBadge,
			"sl-tag": SlTag,
			"sl-divider": SlDivider,
			"sl-select": SlSelect,
			"sl-option": SlOption,
			"sl-input": SlInput,
			"sl-carousel": SlCarousel,
			"sl-carousel-item": SlCarouselItem,

			"sl-checkbox": SlCheckbox,

			"sl-tooltip": SlTooltip,
			"sl-popup": SlPopup,
			"sl-tab": SlTab,
			"sl-tab-group": SlTabGroup,
			"sl-tab-panel": SlTabPanel,
		};
	}

	connectedCallback(): void {
		const legacyNames = ["availablemolecules", "availablemixtures", "availablecomponents", "invcomponents"];
		const legacyData = legacyNames.some((name) => this.hasAttribute(name)) ? {
			availableMolecules: this.readLegacyArray("availablemolecules"),
			availableMixtures: this.readLegacyArray("availablemixtures"),
			availableComponents: this.readLegacyArray("availablecomponents"),
			invComponents: this.getAttribute("invcomponents") ? this.getAttribute("invcomponents")!.split(",") : [],
		} : null;
		if (legacyData) this.applyAuthoredData(legacyData);
		super.connectedCallback();
		this.dataObserver = new MutationObserver(() => this.readAuthoredData());
		this.dataObserver.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["slot", "type"] });
		if (this.dataBlock()) this.readAuthoredData();
		this.observeWorkspaceLayout();
	}

	disconnectedCallback(): void {
		this.stopDose?.();
		this.cancelDoseForNavigation();
		this.closeAmountMenu();
		this.hideFillMeter();
		this.workspaceResizeObserver?.disconnect();
		this.workspaceResizeObserver = undefined;
		this.workspaceClassObserver?.disconnect();
		this.workspaceClassObserver = undefined;
		this.dataObserver?.disconnect();
		this.dataObserver = undefined;
		super.disconnectedCallback();
	}

	private observeWorkspaceLayout(): void {
		if (!this.containerDiv || this.workspaceResizeObserver || !this.isConnected) return;
		const update = () => this.updateWorkspaceLayout();
		this.workspaceResizeObserver = new ResizeObserver(update);
		this.workspaceResizeObserver.observe(this.containerDiv);
		this.workspaceClassObserver = new MutationObserver(() => {
			update();
			this.requestUpdate();
		});
		this.workspaceClassObserver.observe(this, { attributes: true, attributeFilter: ["class", "contenteditable"] });
		update();
	}

	private updateWorkspaceLayout(): void {
		const wide = this.classList.contains("ww-full-width");
		if (wide !== this.fullWidthMode) {
			this.fullWidthMode = wide;
			this.diagramPanelOpen = wide;
		}
		const width = this.containerDiv.clientWidth;
		const panelMax = parseFloat(getComputedStyle(this.ownerDocument.documentElement).fontSize) * 24;
		const diagramWidth = this.diagramPanelAvailable && this.diagramPanelOpen ? Math.min(width * 0.27, panelMax) : 0;
		this.teacherDrawerOpen = this.teacherDrawerChoice ?? (width >= STANDARD_CANVAS_WIDTH + panelMax + diagramWidth);
		if (width < MIN_TWO_PANELS_WIDTH && this.teacherDrawerOpen && this.diagramPanelAvailable) {
			this.diagramPanelOpen = false;
		}
	}

	protected updated(changed: PropertyValueMap<any>): void {
		super.updated(changed);
		if (!this.canAuthor || changed.has("invComponents") || changed.has("chemicalPermissions")) this.permissionTooltip = undefined;
		if (["availableMolecules", "availableMixtures", "availableComponents", "invComponents", "chemicalPermissions"].some((name) => changed.has(name))) {
			this.persistAuthoredData();
		}
		if (this.app && this.refreshFromRemoteData) {
			this.refreshFromRemoteData = false;
			if (changed.has("availableComponents")) {
				this.stopDose?.();
				this.cancelDoseForNavigation();
				this.closeAmountMenu();
				this.hideFillMeter();
				this.simulation.stopExperiments();
				this.curr_obj = null;
				this.curr_name = "";
				this.curr_stage_index = -1;

				this.canvas.clearSprites();
				this.allChemComponents = [];
				this.allEComponents = [];

				this.avComponentsSprites = [];
				this._loadComponents();
			}
		}
		if (this.canvas.selectedObjects.length || changed.has("curr_obj") || changed.has("curr_name")) {
			this.canvas.drawSelection();
		}
		if (changed.has("amountMenu")) this.positionAmountMenu();
		if (changed.has("thumbnailBadges")) {
			// Thumbnails are cached per molecule; rebuild them so the labels
			// appear or disappear immediately when the option toggles.
			this.vesselThumbnails = new WeakMap();
			if (this.hasUpdated) this._updatePopup();
		}
	}

	private readLegacyArray(name: string): object[] | undefined {
		const raw = this.getAttribute(name);
		if (raw === null) return undefined;
		try {
			const value = JSON.parse(raw);
			return Array.isArray(value) ? value : undefined;
		} catch {
			return undefined;
		}
	}

	private dataBlock(): HTMLScriptElement | null {
		return this.querySelector(':scope > script[type="application/json"][slot="data"]');
	}

	private applyAuthoredData(value: Record<string, unknown>) {
		if (Array.isArray(value.availableMolecules)) this.availableMolecules = value.availableMolecules;
		if (Array.isArray(value.availableMixtures)) this.availableMixtures = value.availableMixtures;
		if (Array.isArray(value.availableComponents)) {
			// Setups authored before `layoutScale` carry world-unit positions
			// from the 1.5 mm-per-unit era; scale them once to the 1 mm unit.
			const needsScale = value.layoutScale !== 1;
			this.availableComponents = value.availableComponents.map((component) => {
				if (!needsScale || typeof component !== "object" || component === null) return component;
				const pos = (component as Record<string, unknown>)["pos"];
				if (!Array.isArray(pos) || pos.length !== 2 || !pos.every(Number.isFinite)) return component;
				return { ...component, pos: [pos[0] * 1.5, pos[1] * 1.5] };
			});
		}
		if (Array.isArray(value.invComponents)) {
			const componentNames = Object.keys(chemlib.ComponentType).concat(Object.keys(chemlib.EComponentType));
			this.invComponents = value.invComponents.map(value => String(value).trim()).filter(Boolean).map(value =>
				componentNames.find(key => this.dictionary[key.toLowerCase()] === value)?.toLowerCase() ?? value.toLowerCase()
			);
		}
		if ("chemicalPermissions" in value) {
			const permissions: typeof this.chemicalPermissions = Object.create(null);
			for (const [name, entry] of Object.entries((value.chemicalPermissions ?? {}) as Record<string, { blocked?: unknown; concentrations?: unknown }>)) {
				if (!entry || typeof entry !== "object") continue;
				const max = catalogConcentrationLimits.get(name);
				const concentrations = max && Array.isArray(entry.concentrations)
					? [...new Set(entry.concentrations.filter((value): value is number =>
						typeof value === "number" && Number.isFinite(value) && value > 0)
						.map((value) => Math.min(value, max)))].sort((left, right) => left - right)
					: undefined;
				if (entry.blocked) permissions[name] = { blocked: true };
				else if (concentrations?.length) permissions[name] = { concentrations };
			}
			this.chemicalPermissions = permissions;
		}
	}

	private readAuthoredData() {
		const block = this.dataBlock();
		if (!block || this.updatingDataBlock) return;
		try {
			const value = JSON.parse(block.textContent ?? "");
			if (!value || typeof value !== "object") return;
			const incoming = JSON.stringify({
				layoutScale: 1,
				availableMolecules: value.availableMolecules ?? this.availableMolecules,
				availableMixtures: value.availableMixtures ?? this.availableMixtures,
				availableComponents: value.availableComponents ?? this.availableComponents,
				invComponents: value.invComponents ?? this.invComponents,
				chemicalPermissions: value.chemicalPermissions ?? this.chemicalPermissions,
			});
			if (incoming === this.savedDataSnapshot) return;
			this.refreshFromRemoteData = this.hasUpdated;
			this.updatingDataBlock = true;
			this.applyAuthoredData(value);
			this.savedDataSnapshot = this.serializeAuthoredData();
			for (const name of ["availablemolecules", "availablemixtures", "availablecomponents", "invcomponents"]) this.removeAttribute(name);
		} catch (error) {
			console.error("Unable to read chemistry lab data block", error);
		} finally {
			this.updatingDataBlock = false;
		}
	}

	private serializeAuthoredData() {
		return JSON.stringify({
			layoutScale: 1,
			availableMolecules: this.availableMolecules,
			availableMixtures: this.availableMixtures,
			availableComponents: this.availableComponents,
			invComponents: this.invComponents,
			chemicalPermissions: this.chemicalPermissions,
		});
	}

	private persistAuthoredData() {
		if (!this.isConnected || this.updatingDataBlock) return;
		const snapshot = this.serializeAuthoredData();
		if (snapshot === this.savedDataSnapshot) return;
		let block = this.dataBlock();
		if (!block) {
			block = this.ownerDocument.createElement("script");
			block.type = "application/json";
			block.slot = "data";
			this.append(block);
		}
		this.updatingDataBlock = true;
		block.textContent = snapshot.replace(/</g, "\\u003c");
		this.savedDataSnapshot = snapshot;
		for (const name of ["availablemolecules", "availablemixtures", "availablecomponents", "invcomponents"]) this.removeAttribute(name);
		this.updatingDataBlock = false;
	}

	/**
	 * loads canvas and initial state of the widget upon loading, initializes ticker
	 *
	 * @protected
	 * @param {(PropertyValueMap<any> | Map<PropertyKey, unknown>)} _changedProperties
	 */
	protected firstUpdated(
		_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
	): void {
		super.firstUpdated(_changedProperties);
		for (const panel of this.shadowRoot.querySelectorAll(".workspace-side > sl-details")) {
			// The grid animates the width. Keep the disclosure body at its full height.
			setAnimation(panel, "details.show", { keyframes: [], options: { duration: 0 } });
			setAnimation(panel, "details.hide", {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				options: { duration: 120, easing: "ease-out" },
			});
		}
		this.observeWorkspaceLayout();
		this.canvasReady = this.initializeCanvas();
	}

	protected override async getUpdateComplete(): Promise<boolean> {
		const complete = await super.getUpdateComplete();
		await this.canvasReady;
		return complete;
	}

	private async initializeCanvas(): Promise<void> {
		try {
			await this.canvas.init();
		} catch (error) {
			console.error("Unable to initialize the Chemlab canvas", error);
			this._notify(this.message("Die Arbeitsfläche konnte nicht geladen werden."), "danger");
			return;
		}
		// The first load uses the latest authored data, including updates during asset loading.
		this.refreshFromRemoteData = false;
		this.focus();
		this.simulation.startLoop(() => this.canvas.flushChanges());
		this._loadComponents();
		this._sendxAPiStatement("registered", "chemlab");
		this._notify(this.message("klicke zum Starten in das Fenster!"), "neutral", 10000);
	}

	requestCanvasRender(): void {
		this.simulation.requestRender();
	}

	updateZoomLabel(zoom: number): void {
		const percent = zoom * 100;
		const text = percent < 1 ? "<1 %" : `${Math.round(percent)} %`;
		if (this.zoomLevel && this.zoomLevel.textContent !== text) this.zoomLevel.textContent = text;
	}

	updateGridScale(widthPx: number, widthMm: number): void {
		if (!this.gridScale || !this.gridScaleValue) return;
		const lineWidth = `${widthPx.toFixed(2)}px`;
		if (this.gridScale.style.getPropertyValue("--grid-cell-width") !== lineWidth) {
			this.gridScale.style.setProperty("--grid-cell-width", lineWidth);
		}
		if (this.displayedGridWidthMm === widthMm) return;
		this.displayedGridWidthMm = widthMm;
		const length = widthMm >= 1000 ? `${widthMm / 1000} m` : widthMm >= 10 ? `${widthMm / 10} cm` : `${widthMm} mm`;
		// Only the length is shown; the "per cell" context stays available as
		// tooltip and screen-reader label on the tag.
		const scaleLabel = this.message("{length} pro Kästchen", { length });
		if (this.gridScale.title !== scaleLabel) {
			this.gridScale.title = scaleLabel;
			this.gridScale.setAttribute("aria-label", scaleLabel);
		}
		this.gridScaleValue.textContent = length;
	}

	/**
	 * Transfers one titration dose to the vessel below the burette and updates the diagram.
	 *
	 * @private
	 * @param {PIXI.Container} currSprite - the view of the burette
	 * @param {chemlib.ChemComponent} source - the chemlib object of the burette
	 */
	private stepTitration(
		currSprite: PIXI.Container,
		source: chemlib.ChemComponent
	): void {
		if (source._content._activeMolecules.length > 0) {
			let destSprite: PIXI.Container = undefined;
			this.canvas.world.children.forEach((sprite) => {
				if (sprite != currSprite) {
					// Only vessels that sit below the burette and overlap it
					// horizontally receive the dose. Without the overlap test a
					// row of setups would all pour into the lowest vessel.
					const overlapsHorizontally =
						sprite.x - sprite.width / 2 < currSprite.x + currSprite.width / 2 &&
						sprite.x + sprite.width / 2 > currSprite.x - currSprite.width / 2;
					if (
						sprite.y - sprite.height / 2 >
							currSprite.y + currSprite.height / 2 &&
						overlapsHorizontally
					) {
						if (typeof destSprite === "undefined") {
							destSprite = sprite;
						} else {
							if (destSprite.y - sprite.y > 0) {
								destSprite = sprite;
							}
						}
					}
				}
			});
			let destObj: chemlib.ChemComponent = undefined;
			this.allChemComponents.forEach((comp) => {
				if (typeof destSprite != "undefined") {
					if (
						destSprite.label.split(":")[0] === comp._type &&
						Number.parseInt(destSprite.label.split(":")[1]) ===
							comp._id
					) {
						destObj = comp;
					}
				}
			});
			if (typeof destObj != "undefined") {
				if (source._content._activeMolecules.length > 0) {
					source.transferContents({}, destObj);
					this.canvas.markVesselChanged(source);
					this.canvas.markVesselChanged(destObj);
					if (this.curr_obj === source || this.curr_obj === destObj) this._updatePopup();
					this.diagrams.appendTitrationPoint(source, destObj);
				}
			}
		}
	}

	/**
	 * Advances a connected electrochemical experiment by one simulation step.
	 */
	private stepElectrochemistry(source: chemlib.ElectricComponent): void {
		const circuitComps = this.operatingCircuit(source);
		if (circuitComps) {
			const firstMix = circuitComps[0]._connectedMix;
			const secondMix = circuitComps[1]._connectedMix;
			chemlib.Simulation.sEChem(
				circuitComps[0],
				circuitComps[1],
				circuitComps.slice(2),
				{ bridge: this.bridgeJoins(firstMix, secondMix) }
			);

			for (const vessel of this.allChemComponents) {
				if (vessel._content === firstMix || vessel._content === secondMix) this.canvas.markVesselChanged(vessel);
			}
			// A gas collection tube shows what has bubbled out of its vessel,
			// so it needs a redraw whenever that vessel reacted.
			for (const device of this.allEComponents) {
				if (device._type === chemlib.EComponentType.GasCollector &&
					(device._connectedMix === firstMix || device._connectedMix === secondMix)) {
					this.canvas.refreshDeviceDisplay(device);
				}
			}
			if (circuitComps.includes(this.curr_obj) ||
				this.curr_obj?._content === firstMix || this.curr_obj?._content === secondMix) this._updatePopup();
			// The electrodes carry the deposit, so their views need a redraw too.
			this.canvas.refreshDeviceDisplay(circuitComps[0]);
			this.canvas.refreshDeviceDisplay(circuitComps[1]);
			this.diagrams.appendEChemPoint(source, circuitComps);
		}
		this.canvas.refreshDeviceDisplay(source);
	}

	private operatingCircuit(device: chemlib.ElectricComponent): chemlib.ElectricComponent[] | undefined {
		const circuit = chemlib.ComponentManager.isCircuit(device);
		if (circuit.length < 3 || !circuit.slice(2).includes(device)) return undefined;
		// A reference electrode holds its potential without a vessel of its
		// own, so only an electrode that has to react needs a solution.
		if (!circuit.slice(0, 2).every((electrode) =>
			electrode._type === chemlib.EComponentType.Electrode &&
			(electrode._reference !== undefined || electrode._connectedMix?._isSolution))) return undefined;
		return circuit;
	}

	/**
	 * Whether a salt bridge on the canvas joins the two half-cells of a
	 * circuit. The bridge carries no cable, so its two legs decide: it has to
	 * dip into both vessels for the ionic current to close the cell.
	 */
	private bridgeJoins(first?: chemlib.Mixture, second?: chemlib.Mixture): boolean {
		if (!first || !second || first === second) return false;
		return this.allEComponents.some((device) =>
			device._type === chemlib.EComponentType.Bridge &&
			device._bridgeMixes.includes(first) && device._bridgeMixes.includes(second));
	}

	private runningCurrent(source: chemlib.ElectricComponent): number {
		const ticker = `echem${source._type}:${source._id}`;
		// The solved current is signed by which electrode happens to come
		// first in the circuit walk, so only its magnitude is meaningful here:
		// the ammeter shows a magnitude and the Faraday rate needs one.
		return this.simulation.hasTask(ticker) && this.operatingCircuit(source)
			? Math.abs(source._visibleCurrent ?? 0) : 0;
	}

	/**
	 * Clears the readings a stopped experiment left behind. The cell solve
	 * writes the voltage and the current of every device in the circuit, not
	 * only of the one that was switched on, so the meters would otherwise keep
	 * showing the last value they saw.
	 */
	private clearEChemReadings(): void {
		for (const device of this.allEComponents) {
			if (device._visibleVoltage === null && device._visibleCurrent === null) continue;
			device._visibleVoltage = null;
			device._visibleCurrent = null;
			this.canvas.refreshDeviceDisplay(device);
		}
	}

	get canAuthor(): boolean {
		const editable = this.getAttribute("contenteditable");
		return editable === "" || editable === "true";
	}

	private isVariantAllowed(variant: ComponentVariant): boolean {
		return !this.invComponents.includes(variant.type) && !this.invComponents.includes(variant.id);
	}

	private setVariantAllowed(variant: ComponentVariant, allowed: boolean): void {
		if (!this.canAuthor) return;
		const blocked = new Set(this.invComponents);
		const variants = componentVariants[variant.type];
		if (blocked.delete(variant.type)) variants.forEach(({ id }) => blocked.add(id));
		if (allowed) blocked.delete(variant.id);
		else blocked.add(variant.id);
		if (variants.every(({ id }) => blocked.has(id))) {
			variants.forEach(({ id }) => blocked.delete(id));
			blocked.add(variant.type);
		}
		this.invComponents = [...blocked];
	}

	private toggleAllVariants(type: PaletteComponent): void {
		if (!this.canAuthor) return;
		const variants = componentVariants[type];
		const wereAllAllowed = variants.every((variant) => this.isVariantAllowed(variant));
		const blocked = new Set(this.invComponents);
		blocked.delete(type);
		for (const { id } of variants) blocked.delete(id);
		if (wereAllAllowed) blocked.add(type);
		this.invComponents = [...blocked];
	}

	/** true unless the chemical is blocked for learners */
	private isChemicalAllowed(name: string): boolean {
		return !this.chemicalPermissions[name]?.blocked;
	}

	/** the concentrations currently offered for a concentration-capable chemical */
	private allowedConcentrationsFor(name: string, initial: number): number[] {
		const entry = this.chemicalPermissions[name];
		if (entry?.blocked) return [];
		return entry?.concentrations ?? [initial];
	}

	private setChemicalBlocked(name: string, blocked: boolean): void {
		if (!this.canAuthor) return;
		const { [name]: _removed, ...rest } = this.chemicalPermissions;
		this.chemicalPermissions = blocked ? { ...rest, [name]: { blocked: true } } : rest;
	}

	private setAllowedConcentrations(name: string, values: number[]): void {
		if (!this.canAuthor) return;
		const concentrations = [...new Set(values)].sort((left, right) => left - right);
		this.chemicalPermissions = {
			...this.chemicalPermissions,
			[name]: concentrations.length ? { concentrations } : { blocked: true },
		};
	}

	/** Permission counts use the same variants that the bulk action toggles. */
	private chemicalPermissionSummary(items: (ChemicalPermissionItem & { label?: string })[]) {
		let allowed = 0;
		let total = 0;
		const labels: string[] = [];
		for (const item of items) {
			const concentration = chemicalConcentration(item);
			const label = this.chemicalDisplayLabel(item);
			if (concentration) {
				const permitted = this.allowedConcentrationsFor(item.name, concentration.initial);
				const values = this.concentrationVariants(item.name, concentration);
				total += values.length;
				for (const value of values) {
					if (!permitted.includes(value)) continue;
					allowed++;
					labels.push(this.chemicalTileLabel(label, value));
				}
			} else {
				total++;
				if (this.isChemicalAllowed(item.name)) {
					allowed++;
					labels.push(label);
				}
			}
		}
		return { allowed, total, labels };
	}

	private concentrationVariants(name: string, concentration: ChemicalConcentration): number[] {
		// Keep previously saved concentrations editable even when they aren't presets.
		const allowed = this.allowedConcentrationsFor(name, concentration.initial);
		return [...new Set([...concentrationPresets(concentration), ...allowed])].sort((left, right) => left - right);
	}

	private toggleAllChemicals(items: ChemicalPermissionItem[], block: boolean): void {
		if (!this.canAuthor) return;
		const next = { ...this.chemicalPermissions };
		for (const item of items) {
			const concentration = chemicalConcentration(item);
			if (block) next[item.name] = { blocked: true };
			else if (concentration) next[item.name] = { concentrations: this.concentrationVariants(item.name, concentration) };
			else delete next[item.name];
		}
		this.chemicalPermissions = next;
	}

	private startComponentDrag(event: PointerEvent, variant: ComponentVariant): void {
		if (!this.canAuthor && !this.isVariantAllowed(variant)) return;
		let preview: PIXI.Container | undefined;
		this.startPaletteDrag(event, {
			start: () => {
				preview = this.canvas.createPlacementPreview(this.previewModel(variant));
			},
			move: (pointer) => {
				const point = this.canvas.worldPointFromViewport(pointer.clientX, pointer.clientY);
				preview.visible = !!point;
				if (point) {
					const snapped = this.canvas.snapPosition(point.x, point.y);
					preview.position.copyFrom(this.canvas.freePlacement(preview, snapped.x, snapped.y));
				}
				this.requestCanvasRender();
			},
			drop: (pointer) => {
				const point = this.canvas.worldPointFromViewport(pointer.clientX, pointer.clientY);
				if (point) this.addPaletteComponent(variant, point.x, point.y);
			},
			cleanup: () => {
				if (!preview) return;
				preview.destroy({ children: true });
				this.requestCanvasRender();
			},
		});
	}

	/**
	 * A throwaway component for a palette variant, used to draw the drag ghost
	 * and to measure the footprint before the real component exists.
	 *
	 * @private
	 * @param {ComponentVariant} variant - the palette variant
	 * @returns {chemlib.ChemComponent | chemlib.ElectricComponent}
	 */
	private previewModel(variant: ComponentVariant): chemlib.ChemComponent | chemlib.ElectricComponent {
		const { id: variantId, type, capacityMl, material } = variant;
		if (capacityMl !== undefined) {
			const vessel = new chemlib.ChemComponent(-1, type as chemlib.ComponentType);
			vessel._volume = capacityMl;
			return vessel;
		}
		const device = new chemlib.ElectricComponent(-1, type as chemlib.EComponentType, {
			nMaterial: material && this.newElectrodeMaterial(material),
			nSourceVoltage: type === chemlib.EComponentType.Source && this.canAuthor ? 0 : undefined,
			nSourceCurrent: type === chemlib.EComponentType.Source && this.canAuthor ? 0 : undefined,
		});
		device._variantId = variantId;
		if (variant.reference !== undefined) device._reference = variant.reference;
		return device;
	}

	/**
	 * The nearest free spot to a wanted one for a component from the palette.
	 * The footprint is measured on a throwaway preview, because the real view
	 * is built later and would otherwise land on top of what is already there.
	 *
	 * @private
	 * @param {ComponentVariant} variant - the palette variant
	 * @param {number} x - the wanted world x
	 * @param {number} y - the wanted world y
	 * @returns {PIXI.PointData}
	 */
	private freePlacementFor(variant: ComponentVariant, x: number, y: number): PIXI.PointData {
		const snapped = this.canvas.snapPosition(x, y);
		const preview = this.canvas.createPlacementPreview(this.previewModel(variant));
		const position = this.canvas.freePlacement(preview, snapped.x, snapped.y);
		preview.destroy({ children: true });
		return position;
	}

	placeSelectedComponent(x: number, y: number): boolean {
		const variant = componentVariant(this.componentToPlace);
		this.componentToPlace = undefined;
		return variant ? this.addPaletteComponent(variant, x, y) : false;
	}

	private addPaletteComponent(variant: ComponentVariant, x: number, y: number): boolean {
		if (!this.canAuthor && !this.isVariantAllowed(variant)) return false;
		const position = this.freePlacementFor(variant, x, y);
		this.componentToPlace = undefined;
		this.clearChemicalSelection();
		const { id: variantId, type, capacityMl, material } = variant;
		if (!this.canAuthor) {
			let component: chemlib.ChemComponent | chemlib.ElectricComponent;
			if (capacityMl !== undefined) {
				const vessel = chemlib.ComponentManager.newChemComponent(type as chemlib.ComponentType);
				vessel._volume = capacityMl;
				this.allChemComponents.push(vessel);
				component = vessel;
			} else {
				const device = chemlib.ComponentManager.newElectricComponent(type as chemlib.EComponentType);
				device._variantId = variantId;
				if (material) device._material = this.newElectrodeMaterial(material);
				if (variant.reference !== undefined) device._reference = variant.reference;
				this.allEComponents.push(device);
				component = device;
			}
			const sprite = this.canvas.addComponentView(component);
			sprite.position.copyFrom(position);
			if (component instanceof chemlib.ElectricComponent) this.canvas.attachDevice(component, sprite);
			return true;
		}
		const entry = {
			type, variantId, pos: [position.x, position.y], capacityMl, vol: 0, content: "",
			voltage: 0, current: 0, material: "", connections: [], labelText: "",
			// A reference electrode brings its potential with it, so the
			// authored entry has to carry it or the restore loses it.
			reference: variant.reference,
		};
		this.availableComponents = [...this.availableComponents, entry];
		this._loadComponents(entry);
		return true;
	}

	private newElectrodeMaterial({ element, name }: ComponentVariant["material"]): chemlib.Molecule {
		const molecule = chemlib.StructureManager.newMolecule();
		molecule.addAtom(element, chemlib.ElementData.getData(element)["symbol"]);
		molecule.name = name;
		return molecule;
	}

	private findAuthoredComponent(sprite: PIXI.Container): object | undefined {
		const match = this.avComponentsSprites.find(([entry]) => entry === sprite);
		return match && this.availableComponents.find((component) =>
			`${String(component["type"]).toLowerCase()}:${component["id"]}` === sprite.label);
	}

	saveComponentPosition(sprite: PIXI.Container): void {
		this.saveComponentPositions([sprite]);
	}

	saveComponentPositions(sprites: readonly PIXI.Container[]): void {
		if (!this.canAuthor) return;
		let changed = false;
		for (const sprite of sprites) {
			const entry = this.findAuthoredComponent(sprite);
			if (entry && (entry["pos"][0] !== sprite.x || entry["pos"][1] !== sprite.y)) {
				entry["pos"] = [sprite.x, sprite.y];
				changed = true;
			}
		}
		if (changed) this.availableComponents = [...this.availableComponents];
	}

	private removeAuthoredComponent(sprite: PIXI.Container): void {
		if (!this.canAuthor) return;
		const entry = this.findAuthoredComponent(sprite);
		if (!entry) return;
		const index = this.availableComponents.indexOf(entry);
		this.avComponentsSprites = this.avComponentsSprites.filter(([current]) => current !== sprite);
		this.availableComponents = this.availableComponents
			.filter((component) => component !== entry)
			.map((component) => {
				component["connections"] = (component["connections"] ?? [])
					.filter((connection: number) => connection !== index)
					.map((connection: number) => connection > index ? connection - 1 : connection);
				return component;
			});
	}

	private buildDose(recipe: ChemicalRecipe) {
		return prepareDose(recipe, loadMoleculeDefinition);
	}

	private hideFillMeter(): void {
		this.ownerDocument.defaultView?.clearTimeout(this.meterTimeout);
		this.fillMeter = undefined;
	}

	private saveSelectedComponent(fields: Record<string, unknown>): void {
		if (!this.canAuthor) return;
		const sprite = this.canvas.world.children[this.curr_stage_index];
		const entry = sprite && this.findAuthoredComponent(sprite);
		if (entry) {
			Object.assign(entry, fields);
			this.availableComponents = [...this.availableComponents];
		}
	}

	cancelDoseForNavigation(): void {
		this.stopDose?.(true);
		this.paletteDrag?.abort();
		this.finishDragTransfer();
	}

	clearChemicalSelection(): void {
		this.cancelDoseForNavigation();
		this.selectedChemical = undefined;
		this.closeAmountMenu();
	}

	closeAmountMenu(): void {
		this.amountMenu = undefined;
	}

	private doseTarget(sprite: PIXI.Container): chemlib.ChemComponent | undefined {
		return this.allChemComponents.find((component) =>
			`${component._type}:${component._id}` === sprite.label && Number.isFinite(component._volume) && component._volume > 0);
	}

	private addMeasuredDose(target: chemlib.ChemComponent, dose: (volumeMl: number) => chemlib.Mixture, requestedMl: number, hint?: VesselHint): number {
		const portion = dose(requestedMl);
		const fraction = target._content.fractionThatFits(portion, target._volume / 1000);
		const volumeMl = requestedMl * fraction;
		if (volumeMl <= 1e-8) return 0;
		target.addContents({ nMix: fraction === 1 ? portion : dose(volumeMl) });
		this.canvas.markVesselChanged(target, hint);
		return volumeMl;
	}

	private saveMeasuredDose(sprite: PIXI.Container, recipe: ChemicalRecipe, volumeMl: number): void {
		const entry = this.findAuthoredComponent(sprite);
		if (!this.canAuthor || !entry || volumeMl <= 0) return;
		const record: SavedDose = { recipe, volumeMl };
		entry["doses"] = [...(entry["doses"] ?? []), record];
		this.availableComponents = [...this.availableComponents];
	}

	openChemicalAmountMenu(sprite: PIXI.Container): boolean {
		const selected = this.selectedChemical;
		if (!selected) return false;
		const target = this.doseTarget(sprite);
		if (!target) return false;
		this.cancelDoseForNavigation();
		this.hideFillMeter();
		const dose = this.buildDose(selected.recipe);
		if (dose) this.openAmountMenu(target, sprite, { name: selected.name, recipe: selected.recipe, dose });
		return true;
	}

	trackVesselTransfer(source: chemlib.ChemComponent, anchor: PIXI.Container | undefined, point: PIXI.PointData): void {
		this.trackDragTransfer(anchor, point, { vessel: source });
	}

	get transferTarget(): PIXI.Container | undefined {
		return this.dragTransfer?.anchor;
	}

	get draggingPalette(): boolean {
		return !!this.paletteDrag;
	}

	private trackDragTransfer(anchor: PIXI.Container | undefined, point: PIXI.PointData, from: AmountSource): void {
		const target = anchor && this.doseTarget(anchor);
		if (this.dragTransfer?.anchor !== anchor || !target) this.finishDragTransfer();
		if (!target || ("vessel" in from && (from.vessel === target || target._inOutLimits[0] <= 0))) return;
		const current = this.dragTransfer;
		if (current) {
			if (!current.active && Math.hypot(point.x - current.point.x, point.y - current.point.y) > TRANSFER_HOLD_RADIUS) {
				current.point = point;
				current.heldMs = 0;
			}
			return;
		}
		const drag = { anchor, target, from, point, heldMs: 0, nextDoseMs: TRANSFER_HOLD_MS, active: false, totalMl: 0 };
		this.dragTransfer = drag;
		this.canvas.drawSelection();
		this.simulation.startTask(DRAG_TRANSFER_TASK, (elapsedMs) => {
			drag.heldMs += elapsedMs;
			if (drag.heldMs < drag.nextDoseMs) return;
			drag.active = true;
			const steps = 1 + Math.floor((drag.heldMs - drag.nextDoseMs) / 50);
			drag.nextDoseMs += steps * 50;
			const requestedMl = steps * 0.4;
			const added = "vessel" in from
				? this.transferMeasuredVolume(from.vessel, target, requestedMl)
				: this.addMeasuredDose(target, from.dose, requestedMl, from.recipe.phase === "solid" ? "grain" : "pour");
			drag.totalMl += added;
			this.updateFillMeter(anchor, target);
			if (added < requestedMl - 1e-8 || target._content.contentVolume * 1000 >= target._volume - 1e-8) {
				this.simulation.stopTask(DRAG_TRANSFER_TASK);
			}
		});
	}

	finishDragTransfer(drop = false): void {
		const drag = this.dragTransfer;
		if (!drag) return;
		this.dragTransfer = undefined;
		this.simulation.stopTask(DRAG_TRANSFER_TASK);
		this.hideFillMeter();
		this.canvas.drawSelection();
		const { anchor, target, from, totalMl } = drag;
		if (totalMl > 0) {
			if ("vessel" in from) {
				this.reportXApi("appended", `${from.vessel._type}:${from.vessel._id}`, {
					response: anchor.label, success: true, completion: true,
				});
			} else this.saveMeasuredDose(anchor, from.recipe, totalMl);
			if (this.curr_obj === target || ("vessel" in from && this.curr_obj === from.vessel)) this._updatePopup();
		}
		if (drop && !drag.active) this.openAmountMenu(target, anchor, from);
	}

	private transferMeasuredVolume(source: chemlib.ChemComponent, target: chemlib.ChemComponent, amount: number): number {
		const result = source.transferContents({ tVolume: amount / 1000 }, target) * 1000;
		if (result > 0) {
			this.canvas.markVesselChanged(source, "pour");
			this.canvas.markVesselChanged(target, "pour");
		}
		return result;
	}

	private startPaletteDrag(event: PointerEvent, gesture: {
		start: () => void;
		move: (pointer: PointerEvent) => void;
		drop: (pointer: PointerEvent) => void;
		cleanup: () => void;
	}): void {
		if (event.button !== 0 || !event.isPrimary || !this.app || this.canvas.pointerBusy) return;
		const button = event.currentTarget as HTMLButtonElement;
		const view = this.ownerDocument.defaultView;
		// Keep WebWriter's editor from turning the gesture into a native HTML drag.
		event.preventDefault();
		event.stopPropagation();
		button.focus({ preventScroll: true });
		const controller = new AbortController();
		this.paletteDrag = controller;
		this.suppressPaletteClick = false;
		const options = { capture: true, signal: controller.signal };
		controller.signal.addEventListener("abort", () => {
			this.paletteDrag = undefined;
			button.classList.remove("palette-dragging");
			if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
			gesture.cleanup();
		}, { once: true });
		view.addEventListener("pointermove", (pointer) => {
			if (pointer.pointerId !== event.pointerId) return;
			if (!this.suppressPaletteClick) {
				if (Math.hypot(pointer.clientX - event.clientX, pointer.clientY - event.clientY) <= TRANSFER_HOLD_RADIUS) return;
				this.suppressPaletteClick = true;
				this.stopDose?.(true);
				this.closeAmountMenu();
				this.componentToPlace = undefined;
				this.selectedChemical = undefined;
				button.classList.add("palette-dragging");
				try {
					button.setPointerCapture(pointer.pointerId);
				} catch {
					// Window listeners also handle pointers that cannot be captured.
				}
				gesture.start();
			}
			gesture.move(pointer);
		}, options);
		view.addEventListener("pointerup", (pointer) => {
			if (pointer.pointerId !== event.pointerId) return;
			try {
				if (this.suppressPaletteClick) gesture.drop(pointer);
			} finally {
				controller.abort();
			}
		}, options);
		view.addEventListener("pointercancel", (pointer) => {
			if (pointer.pointerId === event.pointerId) controller.abort();
		}, options);
		button.addEventListener("lostpointercapture", () => controller.abort(), options);
		button.addEventListener("contextmenu", (menuEvent) => menuEvent.preventDefault(), options);
		view.addEventListener("blur", () => controller.abort(), options);
	}

	private preventNativePaletteDrag(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
	}

	private consumePaletteClick(event: MouseEvent): boolean {
		if (!event.detail || !this.suppressPaletteClick) return false;
		this.suppressPaletteClick = false;
		return true;
	}

	private startChemicalDrag(event: PointerEvent, chemical: SelectedChemical, src: string): void {
		let from: Extract<AmountSource, { recipe: ChemicalRecipe }> | undefined;
		let preview: HTMLDivElement | undefined;
		const track = (pointer: PointerEvent) => {
			if (!from || !preview) return;
			const point = { x: pointer.clientX, y: pointer.clientY };
			const container = this.containerDiv;
			const bounds = container.getBoundingClientRect();
			const x = (point.x - bounds.left) * container.offsetWidth / bounds.width - container.clientLeft;
			const y = (point.y - bounds.top) * container.offsetHeight / bounds.height - container.clientTop;
			preview.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
			this.trackDragTransfer(this.canvas.vesselAtViewport(point.x, point.y), point, from);
		};
		this.startPaletteDrag(event, {
			start: () => {
				this.clearObjectSelection();
				const dose = this.buildDose(chemical.recipe);
				if (!dose) return;
				from = { name: chemical.name, recipe: chemical.recipe, dose };
				const document = this.ownerDocument;
				preview = document.createElement("div");
				preview.className = "chemical-drag-preview";
				preview.setAttribute("aria-hidden", "true");
				if (src) {
					const image = document.createElement("img");
					image.src = src;
					image.alt = "";
					preview.append(image);
				}
				const badge = document.createElement("sl-badge");
				badge.setAttribute("pill", "");
				badge.textContent = chemical.name;
				preview.append(badge);
				this.containerDiv.append(preview);
			},
			move: track,
			drop: (pointer) => {
				track(pointer);
				this.finishDragTransfer(!!from);
			},
			cleanup: () => {
				preview?.remove();
				if (from) this.finishDragTransfer();
			},
		});
	}

	private openAmountMenu(target: chemlib.ChemComponent, anchor: PIXI.Container, from: AmountSource): void {
		const transfer = "vessel" in from;
		const incoming = transfer ? from.vessel._content : from.dose(target._volume * 2);
		const limit = !transfer || target._inOutLimits[0] > 0
			? incoming.contentVolume * 1000 * target._content.fractionThatFits(incoming, target._volume / 1000)
			: 0;
		const max = Number.isFinite(limit) && limit > 1e-8 ? limit : 0;
		const menu = { target, anchor, from, max, amount: transfer ? max : Math.min(1, max) };
		this.amountMenu = menu;
		void this.updateComplete.then(() => {
			if (this.amountMenu === menu) this.shadowRoot.querySelector<HTMLElement>("#amountMenu")?.focus({ preventScroll: true });
		});
	}

	private adjustAmount(steps: number): void {
		if (this.amountMenu?.editing && !this.finishAmountEdit()) return;
		const menu = this.amountMenu;
		if (!menu || menu.max <= 0) return;
		this.setAmount(Number((menu.amount + steps / 10).toPrecision(15)));
	}

	private setAmount(value: number): void {
		const menu = this.amountMenu;
		if (!menu) return;
		const amount = Math.max(0, Math.min(menu.max, value));
		if (amount !== menu.amount || menu.editing) this.amountMenu = { ...menu, amount, editing: false };
	}

	private slideAmount(event: Event): void {
		const slider = event.currentTarget as HTMLInputElement;
		const max = Number(slider.max);
		const raw = slider.valueAsNumber;
		// Keep the actual capacity reachable when it falls between whole millilitres.
		const amount = raw === max ? max : Math.min(max, Math.round(raw));
		slider.valueAsNumber = amount;
		this.setAmount(amount);
	}

	private async editAmount(): Promise<void> {
		const menu = this.amountMenu;
		if (!menu || menu.editing) return;
		this.amountMenu = { ...menu, editing: true };
		await this.updateComplete;
		const field = this.shadowRoot.querySelector<HTMLInputElement>("#amountMenuValue");
		field?.focus({ preventScroll: true });
		field?.select();
	}

	private finishAmountEdit(): boolean {
		const menu = this.amountMenu;
		const field = this.shadowRoot.querySelector<HTMLInputElement>("#amountMenuValue");
		if (!menu?.editing || !field) return false;
		const value = field.value.trim();
		const amount = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value) ? Number(value.replace(",", ".")) : NaN;
		if (!Number.isFinite(amount) || amount < 0 || amount > menu.max) {
			field.setCustomValidity(this.message("Gib eine Menge zwischen 0 und {max} mL ein.", {
				max: this.formatAmount(menu.max, 15),
			}));
			field.reportValidity();
			field.focus({ preventScroll: true });
			return false;
		}
		this.setAmount(amount);
		return true;
	}

	private handleAmountMenuKey(event: KeyboardEvent): void {
		const menu = this.amountMenu;
		if (!menu || event.isComposing || event.defaultPrevented || menu.max <= 0) return;
		const target = event.target as HTMLElement;
		if (target.id === "amountMenuValue") {
			if (event.key !== "Enter" && event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			if (event.key === "Escape") this.amountMenu = { ...menu, editing: false };
			else if (!this.finishAmountEdit()) return;
			void this.updateComplete.then(() => this.shadowRoot.querySelector<HTMLElement>("#amountMenuSlider")?.focus({ preventScroll: true }));
			return;
		}
		const onSlider = target.id === "amountMenuSlider";
		const steps = onSlider || event.shiftKey ? 10 : 1;
		switch (event.key) {
			case "ArrowLeft":
			case "ArrowDown":
				this.adjustAmount(-steps);
				break;
			case "ArrowRight":
			case "ArrowUp":
				this.adjustAmount(steps);
				break;
			case "Home":
				this.setAmount(0);
				break;
			case "End":
				this.setAmount(menu.max);
				break;
			case "F2":
				if (!onSlider && event.target !== event.currentTarget) return;
				void this.editAmount();
				break;
			case "Enter":
				if (event.target !== event.currentTarget && !onSlider) return;
				this.confirmAmount();
				break;
			default:
				return;
		}
		event.preventDefault();
		event.stopPropagation();
	}

	private formatAmount(amount: number, maximumSignificantDigits: number): string {
		const options = { maximumSignificantDigits };
		try {
			return new Intl.NumberFormat(this.lang || undefined, options).format(amount);
		} catch {
			return new Intl.NumberFormat(undefined, options).format(amount);
		}
	}

	private confirmAmount(): void {
		if (this.amountMenu?.editing && !this.finishAmountEdit()) return;
		const menu = this.amountMenu;
		if (!menu || !(menu.amount > 0) || menu.amount > menu.max) return;
		const { from, target, anchor, amount } = menu;
		if (!this.allChemComponents.includes(target)) {
			this.closeAmountMenu();
			return;
		}
		let result: number;
		if ("vessel" in from) {
			const source = from.vessel;
			if (!this.allChemComponents.includes(source)) {
				this.closeAmountMenu();
				return;
			}
			result = this.transferMeasuredVolume(source, target, amount);
			if (result > 0) {
				this.reportXApi("appended", `${source._type}:${source._id}`, {
					response: anchor.label, success: true, completion: true,
				});
			}
		} else {
			// A palette drag clears the selection. The open menu owns the recipe for this dose.
			result = this.addMeasuredDose(target, from.dose, amount, from.recipe.phase === "solid" ? "grain" : "pour");
			this.saveMeasuredDose(anchor, from.recipe, result);
		}
		if (this.curr_obj === target || ("vessel" in from && this.curr_obj === from.vessel)) this._updatePopup();
		if (result > 0) {
			this.closeAmountMenu();
			this.app?.canvas.focus({ preventScroll: true });
		} else {
			this.amountMenu = { ...menu, amount: 0, max: 0 };
			void this.updateComplete.then(() => this.shadowRoot.querySelector<HTMLElement>("#amountMenu")?.focus({ preventScroll: true }));
		}
	}

	private updateFillMeter(sprite: PIXI.Container, target: chemlib.ChemComponent): number {
		const { minX, maxX, y, height } = sprite.getBounds();
		const canvas = this.app.screen;
		const volume = target._content.contentVolume * 1000;
		this.fillMeter = {
			x: Math.max(0, maxX + 92 <= canvas.width ? maxX + 6 : minX - 86),
			y: Math.max(0, Math.min(canvas.height - 24, y + height / 2 - 12)),
			volume, capacity: target._volume,
		};
		return volume;
	}

	beginChemicalDose(sprite: PIXI.Container, pointerId: number): boolean {
		const selected = this.selectedChemical;
		if (!selected) return false;
		if (this.stopDose) return true;
		const target = this.doseTarget(sprite);
		if (!target) return false;
		const dose = this.buildDose(selected.recipe);
		if (!dose) return true;

		this.hideFillMeter();
		const controller = new AbortController();
		const view = this.ownerDocument.defaultView;
		const canvasView = this.app.canvas;
		// Keep receiving the release when the pointer leaves the vessel or canvas.
		try {
			canvasView.setPointerCapture(pointerId);
		} catch {
			// Window listeners still handle releases when capture is unavailable.
		}
		let totalMl = 0;
		let holding = false;
		let heldMs = 0;
		let nextDoseMs = 300;
		let nextStatusMs = 500;
		const task = "chemical-dose";
		const add = (requestedMl: number) => {
			const hint: VesselHint = selected.recipe.phase === "solid" ? "grain" : "pour";
			totalMl += this.addMeasuredDose(target, dose, requestedMl, hint);
			return target._volume - this.updateFillMeter(sprite, target) <= 1e-8;
		};
		const finish = (click: boolean, save = true) => {
			this.simulation.stopTask(task);
			controller.abort();
			if (canvasView.hasPointerCapture(pointerId)) canvasView.releasePointerCapture(pointerId);
			this.stopDose = undefined;
			if (click && !holding) add(1);
			if (click) this.meterTimeout = view.setTimeout(() => this.hideFillMeter(), 650);
			else this.hideFillMeter();
			if (save) this.saveMeasuredDose(sprite, selected.recipe, totalMl);
			if (this.curr_obj === target) this._updatePopup();
		};
		this.simulation.startTask(task, (elapsedMs) => {
			heldMs += elapsedMs;
			if (heldMs < nextDoseMs) return;
			holding = true;
			const steps = 1 + Math.floor((heldMs - nextDoseMs) / 50);
			nextDoseMs += steps * 50;
			const full = add(steps * 0.4);
			if ((full || heldMs >= nextStatusMs) && this.curr_obj === target) {
				this._updatePopup();
				nextStatusMs = heldMs + 500;
			}
			if (full) this.simulation.stopTask(task);
		});
		this.stopDose = (save = false) => finish(false, save);
		const options = { capture: true, signal: controller.signal };
		view.addEventListener("pointerup", (event) => {
			if (event.pointerId === pointerId) finish(true);
		}, options);
		view.addEventListener("pointercancel", (event) => {
			if (event.pointerId === pointerId) finish(false);
		}, options);
		view.addEventListener("blur", () => finish(false), options);
		this.updateFillMeter(sprite, target);
		return true;
	}

	private labelThumbnailSource(container: HTMLElement, source: string): void {
		if (!this.thumbnailBadges) return;
		container.dataset.source = source;
		let badge = container.querySelector<HTMLElement>(":scope > .vessel-thumbnail-source");
		if (!badge) {
			badge = this.ownerDocument.createElement("span");
			badge.className = "vessel-thumbnail-source";
			container.append(badge);
		}
		badge.textContent = source;
	}

	private vesselThumbnail(molecule: chemlib.Molecule, formula: string): Element {
		const cached = this.vesselThumbnails.get(molecule);
		if (cached?.drawer === this.newSmilesDrawer) return cached.element;
		const document = this.ownerDocument;
		const container = document.createElement("span");
		container.className = "vessel-carousel-thumbnail";
		const badge = () => {
			if (!this.thumbnailBadges) return;
			const tag = document.createElement("span");
			tag.className = "vessel-thumbnail-source";
			container.append(tag);
		};
		const fallback = () => {
			try {
				const image = document.createElement("img");
				image.src = chemlib.StructureManager.printMolecule(molecule, 100, 100);
				image.alt = formula;
				container.replaceChildren(image);
				this.labelThumbnailSource(container, "kekule");
			} catch {
				container.textContent = formula;
				this.labelThumbnailSource(container, "text");
			}
		};
		badge();
		if (this.newSmilesDrawer === 1) {
			try {
				SmilesDrawer.parse(molecule.smilesString, (tree) => {
					const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					this.smilesDrawer100.draw(tree, svg, "light");
					container.replaceChildren(svg);
					this.labelThumbnailSource(container, "smilesdrawer");
				}, fallback);
			} catch {
				fallback();
			}
		} else fallback();
		this.vesselThumbnails.set(molecule, { drawer: this.newSmilesDrawer, element: container });
		return container;
	}

	/**
	 * Metals deposited on the electrodes that dip into this vessel. They are
	 * species of the cell, so the vessel card lists them, but they sit on the
	 * strip and not in the solution.
	 *
	 * @private
	 * @param {chemlib.Mixture} mixture - the vessel to read
	 * @returns {VesselPlating[]}
	 */
	private vesselPlatings(mixture: chemlib.Mixture): VesselPlating[] {
		const platings: VesselPlating[] = [];
		for (const device of this.allEComponents) {
			if (device._type !== chemlib.EComponentType.Electrode || device._connectedMix !== mixture) continue;
			for (const entry of device.platings) platings.push({ molecule: entry.molecule, mol: entry.mol });
		}
		return platings;
	}

	private renderVesselCarousel(mixture: chemlib.Mixture, equilibrium?: ReturnType<typeof chemlib.Simulation.getPolyproticEquilibrium>): void {
		const carousel = this.contextMolInfo;
		const reset = this.carouselMixture !== mixture;
		this.carouselMixture = mixture;
		const entries = vesselCarouselEntries(mixture, equilibrium, this.vesselPlatings(mixture));
		const concentrationLine = (concentration: number) => Number.isFinite(concentration)
			? html`<p>c: ${concentration.toExponential(2)} mol/L</p>` : nothing;
		const slide = (thumbnail: unknown, title: string, details: unknown, cardClass = "") => html`
			<sl-carousel-item>
				<div class="vessel-carousel-card ${cardClass}">
					${thumbnail}
					<div class="vessel-carousel-quantities">
						<h5 title=${title}>${title}</h5>
						${details}
					</div>
				</div>
			</sl-carousel-item>`;
		render(html`
			${repeat(entries, ({ key }) => key, ({ molecule, species, gas, plating, phase }) => {
				if (gas) {
					return slide(html`<span class="vessel-carousel-thumbnail">${gas.formula}</span>`,
						gas.formula, html`<p>n: ${this.formatAmount(gas.amount * 1000, 3)} mmol</p>`);
				}
				if (plating) {
					// The deposit is a bare element, so its formula is the
					// clearest title; a PubChem name would come back in English.
					const metal = plating.molecule;
					const formula = metal._kekule_obj.calcFormula().getDisplayText();
					return slide(this.vesselThumbnail(metal, formula), formula, html`
						<p class="vessel-carousel-location">${this.message("auf der Elektrode")}</p>
						<p>m: ${this.formatAmount(plating.mol * metal.getTotMolMass(), 3)} g</p>`, "plated");
				}
				if (species) {
					const { formula, concentration, structure, name } = species;
					const thumbnail = structure();
					if (thumbnail && !thumbnail.name && !this.vesselNameRequests.has(thumbnail)) {
						this.vesselNameRequests.add(thumbnail);
						void chemlib.StructureManager.getChemData(thumbnail).then(() => {
							if (this.curr_obj?._content === mixture) this._updatePopup();
						}).catch(() => { /* Keep the formula as the fallback title. */ });
					}
					return slide(thumbnail ? this.vesselThumbnail(thumbnail, formula) : html`<span class="vessel-carousel-thumbnail">${formula}</span>`,
						name || formula, concentrationLine(concentration));
				}
				const formula = molecule._kekule_obj.calcFormula().getDisplayText();
				if (!molecule.name && !molecule.solidSaltFormula && !this.vesselNameRequests.has(molecule)) {
					this.vesselNameRequests.add(molecule);
					void chemlib.StructureManager.getChemData(molecule).then(() => {
						if (this.curr_obj?._content === mixture && molecule.name) this._updatePopup();
					}).catch(() => { /* Keep the formula as the fallback title. */ });
				}
				const { _id: id } = molecule;
				const properties = mixture._molProperties;
				const concentration = equilibrium && phase !== "solid" && !chemlib.nonpolarDensity(molecule) &&
					!chemlib.StructureManager.isWater(molecule)
					? concentrationLine(properties[id + "c"]) : nothing;
				const showMass = (phase === "solid" && mixture.hasLiquidContents) || (!equilibrium && entries.length > 1);
				const mass = properties[id + "m"];
				return slide(this.vesselThumbnail(molecule, formula), molecule.name || formula, html`
					${showMass && Number.isFinite(mass) ? html`<p>m: ${this.formatAmount(mass, 3)} g</p>` : nothing}
					${concentration}`);
			})}
		`, carousel);
		if (reset) void carousel.updateComplete.then(() => {
			if (this.carouselMixture === mixture) carousel.goToSlide(0, "instant");
		});
	}

	/**
	 * updates the information shown for the selected object
	 *
	 * @private
	 */
	private _updatePopup(): void {
		if (!this.curr_obj) return;
		this.contextEchemInfo.style.display = "none";
		this.contextMolInfo.style.display = "none";
		this.contextMixInfo.style.display = "none";
		this.openBtn.style.display = "none";
		this.activateEComp.style.display = "none";
		if (
			Object.values(chemlib.ComponentType).includes(
				this.curr_obj._type.toLowerCase() as chemlib.ComponentType
			)
		) {
			const mixture = this.curr_obj._content as chemlib.Mixture;
			const hasContents = mixture._activeMolecules.length > 0;
			const equilibrium = hasContents && mixture._isSolution && mixture._solutionVolume > 0
				? chemlib.Simulation.getPolyproticEquilibrium(mixture) : undefined;
			if (hasContents) {
				this.contextMolInfo.style.display = "";
				this.renderVesselCarousel(mixture, equilibrium);
			}
			if (
				this.curr_obj._type === chemlib.ComponentType.Burette ||
				this.curr_obj._type === chemlib.ComponentType.Separatingfunnel
			) {
				this.openBtn.style.display = "";
			}
			if (hasContents) this.renderVesselSummary(mixture, equilibrium?.pH);
		}
		if (
			Object.values(chemlib.EComponentType).includes(
				this.curr_obj._type.toLowerCase() as chemlib.EComponentType
			)
		) {
			this.contextEchemInfo.style.display = "";
			this.contextEchemInfo.innerHTML = "";
			const type = this.curr_obj._type;
			// A multimeter reads whichever quantity its mode selects, and the
			// mode also decides what the meter does to the circuit.
			const meterReadsCurrent = type === chemlib.EComponentType.Multimeter &&
				this.curr_obj._meterMode === "current";
			if (
				type === chemlib.EComponentType.Source ||
				type === chemlib.EComponentType.Voltmeter ||
				type === chemlib.EComponentType.Multimeter
			) {
				this.activateEComp.style.display = "";
				if (type === chemlib.EComponentType.Source) {
					const current = this.runningCurrent(this.curr_obj);
					let electronMolRate: number =
						current / chemlib.Simulation._faradayConst;
					this.contextEchemInfo.innerHTML = `
						<div style="display: flex; flex-direction: column">
							<p>Stromstärke: ${current.toExponential(2)} A</p>
							<p>Faraday, 1. Gesetz: ${electronMolRate.toExponential(
								2
							)} mol e⁻/s</p>
							<p>${this.message("Polung")}: ${this.polarityReading(this.curr_obj)}</p>
						</div>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				} else if (meterReadsCurrent) {
					const current = this.runningCurrent(this.curr_obj);
					this.contextEchemInfo.innerHTML = `
						<p>Stromstärke: ${current.toExponential(2)} A</p>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				} else {
					const reading = this.voltageReading(this.curr_obj);
					this.contextEchemInfo.innerHTML = `
						<p>${this.message("Spannung")}: ${reading}</p>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				}
			} else if (type === chemlib.EComponentType.Ammeter) {
				const current = this.runningCurrent(this.curr_obj);
				this.contextEchemInfo.innerHTML = `
					<p>Stromstärke: ${current.toExponential(2)} A</p>
					<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					`;
			} else if (type === chemlib.EComponentType.Bridge) {
				// A bridge carries no cable, so the legs are the only thing
				// that says which two half-cells it joins.
				const vesselName = (mix?: chemlib.Mixture) => {
					const vessel = this.allChemComponents.find((component) => component._content === mix);
					return vessel ? `${this.itemName(vessel._type)} · ${vessel._id + 1}` : this.message("kein Gefäß");
				};
				const legs = this.curr_obj._bridgeMixes;
				this.contextEchemInfo.innerHTML = `
					<div style="display: flex; flex-direction: column">
						<p>${this.message("Schenkel")}: ${legs.length}</p>
						${legs.map((mix) => `<p>${vesselName(mix)}</p>`).join("")}
					</div>
					<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					`;
			} else if (type === chemlib.EComponentType.GasCollector) {
				const collected = (this.curr_obj._connectedMix?.evolvedGasMol ?? 0) * chemlib.MOLAR_GAS_VOLUME_ML;
				this.contextEchemInfo.innerHTML = `
					<p>${this.message("gesammelt")}: ${this.formatAmount(collected, 3)} mL</p>
					<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					`;
			} else if (type === chemlib.EComponentType.Label) {
				this.contextEchemInfo.innerHTML = `
					<p>${this.curr_obj._labelText || this.message("kein Text")}</p>
					<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					`;
			} else if (this.curr_obj._type === chemlib.EComponentType.Electrode){
				this.activateEComp.style.display = "none";
				// an electrode has no material until one is assigned in the
				// panel, and a material's name is only filled in once its chem
				// data has been fetched.
				let material: chemlib.Molecule = this.curr_obj._material;
				this.contextEchemInfo.innerHTML = `
						<div style="display: flex; flex-direction: column; align-content: flex-start; align-items: flex-start">
							<sl-tag id="contextTag" variant="neutral" size="small" style="margin: 5px"></sl-tag>
							<p>${typeof this.curr_obj._connectedMix != "undefined" ? this.message("verbunden") : this.message("nicht verbunden")}</p>
						</div>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				this.contextEchemInfo.querySelector("#contextTag").textContent = material
					? this.itemName(material.name || "unbekannt")
					: this.message("kein Material");
				// Metal deposited on the strip is part of the cell, so the
				// electrode reports how much of it sits on the surface.
				const deposit = this.curr_obj.plating;
				if (deposit) {
					const line = this.ownerDocument.createElement("p");
					line.textContent = `${this.message("abgeschieden")}: ` +
						`${this.formatAmount(deposit.mol * deposit.molecule.getTotMolMass(), 3)} g ` +
						deposit.molecule._kekule_obj.calcFormula().getDisplayText();
					this.contextEchemInfo.querySelector("div").append(line);
				}
				let circuitComps: chemlib.ElectricComponent[] =
					typeof material != "undefined"
						? chemlib.ComponentManager.isCircuit(this.curr_obj)
						: [];
				const source = circuitComps.slice(2)
					.find((comp) => comp._type === chemlib.EComponentType.Source);
				if (source) {
					let device: chemlib.ElectricComponent = source;
					let redox = chemlib.oxidationOf(material.smilesString);
					if (typeof redox != "undefined") {
						// charge for exactly 1s at the source current, so
						// faradayLaw's output doubles as a per-second rate
						let faraday = chemlib.Simulation.faradayLaw(
							this.runningCurrent(device),
							redox.el,
							material.getTotMolMass()
						);
						this.contextEchemInfo.innerHTML += `
							<div style="display: flex; flex-direction: column">
								<p>Faraday, 2. Gesetz (z=${redox.el}):</p>
								<p>Stoffmengenrate: ${faraday.substanceMol.toExponential(
									2
								)} mol/s</p>
								<p>Massenrate: ${faraday.massGrams.toExponential(2)} g/s</p>
							</div>
							<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
							`;
					}
				}
			}
		}

		this.canvas.drawSelection();
	}

	private renderVesselSummary(mixture: chemlib.Mixture, pH?: number): void {
		const liquid = mixture.hasLiquidContents;
		const amount = liquid ? mixture.contentVolume * 1000 : mixture._activeMolecules.reduce((sum, { _id }) => {
			const mass = mixture._molProperties[_id + "m"];
			return mass > 0 && Number.isFinite(mass) ? sum + mass : sum;
		}, 0);
		const color = Number.isFinite(pH) ? this.pHColors[Math.max(0, Math.min(14, Math.round(pH)))] : undefined;
		const saturation = color === undefined ? undefined : chemlib.Simulation.getSaltSaturation(mixture);
		const percent = saturation && (saturation.fraction >= 1 - 1e-8 ? 100 : Math.min(99, Math.round(100 * saturation.fraction)));
		const saturationLabel = saturation && this.message("Salzsättigung: {salt}", { salt: saturation.formula });
		if (!(amount > 0 && Number.isFinite(amount)) && color === undefined) return;
		this.contextMixInfo.style.display = "";
		render(html`
			${amount > 0 && Number.isFinite(amount) ? html`
				<sl-tag size="small" variant="neutral">${liquid ? `${amount.toFixed(1)} mL` : `${this.formatAmount(amount, 3)} g`}</sl-tag>` : nothing}
			${color === undefined ? nothing : html`
				<sl-tag class="vessel-ph-tag" size="small" variant="neutral"
					style=${`--indicator-color: ${color}; --indicator-text: ${pHTextColor(color)}`}>pH ${pH}</sl-tag>`}
			${saturation ? html`
				<sl-tag class="vessel-saturation-tag" size="small" variant="neutral" role="meter"
					aria-label=${saturationLabel} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${percent}
					title=${`${saturationLabel} · ${percent}%`}>
					<span class="vessel-saturation-circle" aria-hidden="true"
						style=${`--saturation-fill: ${percent}%`}></span>
				</sl-tag>` : nothing}
		`, this.contextMixInfo);
	}

	/**
	 * retrieves object information for a given sprite, updates the panel
	 *
	 * @private
	 * @param {*} sprite - the seleted sprite
	 */
	_getObject(sprite): void {
		if (!sprite) return;
		this.canvas.clearGroupSelection();
		const name = sprite.label;
		this.curr_stage_index = this.canvas.world.children.indexOf(sprite);
		this.curr_obj = [...this.allChemComponents, ...this.allEComponents].find(
			(component) => `${component._type}:${component._id}` === name
		) ?? null;
		this.curr_name = name;
		this._updatePopup();

		this.requestUpdate();
	}


	/**
	 * removes an object and its corresponding sprite
	 * 
	 * @private
	 */
	_removeSprite(): void {
		const sprite = this.canvas.world.children[this.curr_stage_index];
		if (sprite) this.removeObjects([sprite]);
	}

	private deleteSelection(event: KeyboardEvent): void {
		if (event.key === "Escape" && !event.defaultPrevented && !event.isComposing &&
			(this.selectedChemical || this.amountMenu || this.paletteDrag || this.dragTransfer)) {
			event.preventDefault();
			event.stopPropagation();
			const focusCanvas = !!this.amountMenu;
			this.clearChemicalSelection();
			this.canvas.cancelVesselDrag();
			if (focusCanvas) this.app?.canvas.focus({ preventScroll: true });
			return;
		}
		if (event.key !== "Delete" || event.defaultPrevented || event.isComposing ||
			event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		for (const target of event.composedPath()) {
			if (target === event.currentTarget) break;
			if (target instanceof Element && target.matches("input, textarea, select, sl-input, sl-select, [role='textbox'], [contenteditable]:not([contenteditable='false'])")) return;
		}
		const group = this.canvas.selectedObjects;
		const single = this.canvas.world.children[this.curr_stage_index];
		if (!group.length && !single) return;
		event.preventDefault();
		event.stopPropagation();
		this.removeObjects(group.length ? group : [single]);
	}

	removeObjects(sprites: readonly PIXI.Container[]): void {
		const world = this.canvas.world;
		const targets = sprites.filter((sprite) => sprite.parent === world);
		if (!targets.length) return;
		const labelOf = (component: chemlib.ChemComponent | chemlib.ElectricComponent) => `${component._type}:${component._id}`;
		const labels = new Set(targets.map(({ label }) => label));
		const removedElectrical = this.allEComponents.filter((component) => labels.has(labelOf(component)) ||
			(component._type === chemlib.EComponentType.Cable && component._connections.some((end) => end && labels.has(labelOf(end)))));
		const removedChemical = this.allChemComponents.filter((component) => labels.has(labelOf(component)));
		const drag = this.dragTransfer;
		if (drag && (removedChemical.includes(drag.target) ||
			("vessel" in drag.from && removedChemical.includes(drag.from.vessel)))) this.finishDragTransfer();
		const menu = this.amountMenu;
		if (menu && (removedChemical.includes(menu.target) ||
			("vessel" in menu.from && removedChemical.includes(menu.from.vessel)))) this.closeAmountMenu();
		const removedMixtures = new Map(removedChemical.map((component) => [component._content, component]));
		const detachedElectrodes = this.allEComponents.filter((component) => component._type === chemlib.EComponentType.Electrode &&
			removedMixtures.has(component._connectedMix) && !labels.has(labelOf(component)));
		// Collect the affected circuit while the connections still exist.
		const affectedElectrical = new Set([...removedElectrical, ...detachedElectrodes]);
		for (const component of affectedElectrical) {
			for (const partner of component._connections.filter(Boolean)) affectedElectrical.add(partner);
		}
		for (const component of removedElectrical) labels.add(labelOf(component));
		const selected = world.children[this.curr_stage_index];
		if (selected && labels.has(selected.label)) {
			this.stopDose?.();
			this.hideFillMeter();
			this.clearObjectSelection();
		}
		for (const component of removedElectrical) {
			for (const partner of [...component._connections].filter(Boolean)) this._remEcon(component, partner);
		}
		for (const electrode of detachedElectrodes) {
			const vessel = removedMixtures.get(electrode._connectedMix);
			electrode._connectedMix = undefined;
			this._notify(this.message("{from} aus {to} entfernt.", {
				from: this.itemName(electrode._type), to: this.itemName(vessel._type),
			}), "warning", 1500);
		}
		this.allChemComponents = this.allChemComponents.filter((component) => !labels.has(labelOf(component)));
		this.allEComponents = this.allEComponents.filter((component) => !labels.has(labelOf(component)));
		for (const sprite of [...world.children]) {
			if (!labels.has(sprite.label)) continue;
			this.removeAuthoredComponent(sprite);
			this.canvas.removeSprite(sprite);
			this.simulation.stopTask("transfer" + sprite.label);
			this.simulation.stopTask("echem" + sprite.label);
			this._sendxAPiStatement("removed", sprite.label);
		}
		for (const component of affectedElectrical) {
			if (!labels.has(labelOf(component))) this.refreshDeviceAfterRemoval(component);
		}
		if (selected?.parent === world) {
			this.curr_stage_index = world.getChildIndex(selected);
			if (this.allEComponents.includes(this.curr_obj) &&
				(removedElectrical.length || affectedElectrical.has(this.curr_obj))) this._getObject(selected);
		}
	}

	private refreshDeviceAfterRemoval(component: chemlib.ElectricComponent): void {
		const { Source, Voltmeter, Ammeter, Multimeter } = chemlib.EComponentType;
		if ((component._type !== Source && component._type !== Voltmeter &&
			component._type !== Ammeter && component._type !== Multimeter) ||
			this.operatingCircuit(component)) return;
		if (component._type === Voltmeter || component._type === Multimeter) component._visibleVoltage = null;
		component._visibleCurrent = null;
		const label = `${component._type}:${component._id}`;
		const ticker = "echem" + label;
		if (!this.simulation.hasTask(ticker)) return;
		this.simulation.stopTask(ticker);
		this.canvas.setDeviceActive(component, false);
		this._sendxAPiStatement("completed", ticker);
		this.requestUpdate();
	}

	clearObjectSelection(): void {

		this.canvas.clearGroupSelection();
		this.curr_obj = null;
		this.curr_name = "";
		this.curr_stage_index = -1;
	}


	/**
	 * loads prebuild mixtures from database
	 *
	 * @private
	 * @param {string} name -the name of the mixture
	 * @param {number} volAmount - the volume of the mixture
	 * @param {?object} [entry] - a specific entry to load from
	 * @returns {chemlib.Mixture} - the mixture object
	 */
	private _loadMixture(
		name: string,
		volAmount: number,
		entry?: object
	): chemlib.Mixture {
		let newMix = chemlib.StructureManager.newMixture();
		let selMixEntry: object = {};

		if (typeof entry === "undefined") {
			this.availableMixtures.forEach((mixEntry) => {
				if (mixEntry["name"] === name) {
					selMixEntry = mixEntry;
				}
			});
		} else {
			selMixEntry = entry;
		}

		if (Object.keys(selMixEntry).length != 0) {
			selMixEntry["content"].forEach((mixEntry) => {
				let molFormula: string = mixEntry.split(":")[0];
				let molAmount: number =
					Number.parseFloat(mixEntry.split(":")[1]) * volAmount;

				let mol: chemlib.Molecule = this._loadMolecule(molFormula);
				newMix.addMolecule(mol, molAmount);
			});
		}

		return newMix;
	}

	/**
	 * loads prebuild mixtures from database
	 *
	 * @private
	 * @async
	 * @param {?object} [entry] - a specific entry to load from
	 * @returns {Promise<void>}
	 */
	private async _loadComponents(entry?: object): Promise<void> {
		// console.log(this.availableComponents, entry);
		for (let component of this.availableComponents) {
			if (entry && component !== entry) continue;
			const type = component["type"].toLowerCase();
			const savedVariant = componentVariant(component["variantId"]);
			const variant = savedVariant?.type === type ? savedVariant : undefined;

			let newComp: chemlib.ChemComponent | chemlib.ElectricComponent;

			if (
				Object.values(chemlib.ComponentType).includes(
				type as chemlib.ComponentType
				)
			) {
				newComp = chemlib.ComponentManager.newChemComponent(
					type
				);
				this.allChemComponents.push(newComp);
				let newMix: chemlib.Mixture = this._loadMixture(
					component["content"],
					component["vol"]
				);
				newComp.addContents({ nMix: newMix });
				const capacity = Number(component["capacityMl"] ?? variant?.capacityMl);
				if (Number.isFinite(capacity) && capacity > 0) newComp._volume = capacity;
				for (const saved of (component["doses"] ?? []) as SavedDose[]) {
					const dose = this.buildDose(saved.recipe);
					if (dose && Number.isFinite(saved.volumeMl) && saved.volumeMl > 0) {
						newComp.addContents({ nMix: dose(saved.volumeMl) });
					}
				}
			} else {
				newComp = chemlib.ComponentManager.newElectricComponent(
					type
				);
				// The variant decides the artboard, so a compact source keeps
				// its size when the layout is restored.
				newComp._variantId = variant?.id;
				switch (newComp._type) {
					case chemlib.EComponentType.Electrode:
						if (variant?.material) newComp._material = this.newElectrodeMaterial(variant.material);
						else if (component["material"]) {
							newComp._material = this._loadMolecule(component["material"]);
							newComp._material.name = component["material"];
						}
						if (!newComp._material) break;
						if (newComp._material._atoms.length === 0) {
							newComp._material = undefined;
							break;
						}
						break;
					case chemlib.EComponentType.Source:
						newComp._sourceVoltage = Number.parseFloat(component["voltage"]) || 0;
						newComp._sourceCurrent = Number.parseFloat(component["current"]) || 0;
						newComp._polarity = Number.parseInt(component["polarity"]) === 1 ? 1
							: Number.parseInt(component["polarity"]) === -1 ? -1 : 0;
						newComp._sourceMode = component["sourceMode"] === "current" ? "current" : "voltage";
						newComp._complianceVoltage = Number.parseFloat(component["complianceVoltage"]) || 30;
						break;
					case chemlib.EComponentType.Multimeter:
						newComp._meterMode = component["meterMode"] === "current" ? "current" : "voltage";
						break;
					case chemlib.EComponentType.Label:
						newComp._labelText = String(component["labelText"] ?? "");
						break;
					default:
						break;
				}
				// An electrode's wetted area and a reference electrode's fixed
				// potential are properties of the electrode, not of its type.
				if (newComp._type === chemlib.EComponentType.Electrode) {
					const area = Number.parseFloat(component["area"]);
					if (Number.isFinite(area) && area > 0) newComp._area = area;
					const reference = Number.parseFloat(component["reference"]);
					if (Number.isFinite(reference)) newComp._reference = reference;
				}
				this.allEComponents.push(newComp);
			}

			// The id is recorded before the view is built, so a component whose
			// view fails still takes part in the wiring below.
			component["id"] = newComp._id;
			let sprite: PIXI.Container;
			try {
				sprite = this.canvas.addComponentView(newComp, entry !== undefined);
			} catch (error) {
				// One device that cannot be drawn must not take the rest of the
				// layout with it: the wiring is restored after this loop, and a
				// throw here would leave the whole setup without cables.
				console.error("Unable to build the view of", newComp._type, newComp._id, error);
				continue;
			}
			sprite.x = component["pos"][0];
			sprite.y = component["pos"][1];

			if (this.hasAttribute("contenteditable")) {
				this.canvas._tintSprite(sprite, 0xa7dbec);
			} else {
				this.canvas._tintSprite(sprite, 0xffffff);
			}

			this.avComponentsSprites.push([sprite, newComp._id]);
		}
		// Rebuild the wiring from the authored indices. Each entry now carries
		// the runtime id of the component it became, so the lookup is exact;
		// the pairs are deduplicated and a pair that is already wired is left
		// alone, which makes this safe to run again when a single component is
		// added to an existing layout.
		chemlib.restoreConnections(
			this.availableComponents as chemlib.ConnectionEntry[],
			(id) => this.allEComponents.find((component) => component._id === id),
			(a, b) => this.connectElectrical(a, b, undefined, undefined, false)
		);
		if (entry === undefined) this.canvas.attachDevices();
	}


	private _loadMolecule(formula: string): chemlib.Molecule {
		const definitions = this.availableMolecules as MoleculeDefinition[];
		for (let index = definitions.length - 1; index >= 0; index--) {
			if (definitions[index].formula === formula) return loadMoleculeDefinition(definitions[index]);
		}
		return loadMoleculeDefinition();
	}

	/**
	 * Joins two devices with a cable. This is the single entry point for
	 * wiring: the canvas drag, the restore path and the settings panel all go
	 * through it, so a cable always lands in the same three places - the
	 * device terminals, the component list and the canvas.
	 *
	 * @param {chemlib.ElectricComponent} from - the device the cable starts at
	 * @param {chemlib.ElectricComponent} to - the device it ends at
	 * @param {?number} [terminalFrom] - the terminal of `from`, first free by default
	 * @param {?number} [terminalTo] - the terminal of `to`, first free by default
	 * @param {boolean} [authored=true] - whether to record the cable in the data block
	 * @returns {boolean} whether a cable was laid
	 */
	connectElectrical(
		from: chemlib.ElectricComponent,
		to: chemlib.ElectricComponent,
		terminalFrom?: number,
		terminalTo?: number,
		authored = true
	): boolean {
		const cable = chemlib.connectDevices(from, to, terminalFrom, terminalTo);
		if (!cable) return false;
		this.allEComponents.push(cable);
		this.canvas.addComponentView(cable, false);
		// The plugs of both devices change from free to occupied.
		this.canvas.refreshDeviceDisplay(from);
		this.canvas.refreshDeviceDisplay(to);
		if (!authored) return true;
		this.syncAuthoredConnections(from);
		this.syncAuthoredConnections(to);
		this._notify(this.message("Neue Verbindung zwischen {from} und {to}", {
			from: this.itemName(from._type), to: this.itemName(to._type),
		}), "success", 1500);
		this._sendxAPiStatement("joined", from._type + from._id, {
			response: to._type + ":" + to._id,
			success: true,
			completion: true,
		});
		return true;
	}

	/**
	 * Rewrites the authored connection list of a device from its live
	 * terminals. The order is what matters: `polarity` names the electrode on
	 * terminal 0, so a rewire has to be written back in terminal order rather
	 * than appended.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} device - the device to write back
	 */
	private syncAuthoredConnections(device: chemlib.ElectricComponent): void {
		if (!this.canAuthor) return;
		const entry = this.authoredEntryOf(device);
		if (!entry) return;
		const partners: number[] = [];
		for (const cable of device._connections) {
			if (!cable) continue;
			const other = cable._connections.find((end) => end && end !== device);
			const index = other ? this.authoredIndexOf(other) : -1;
			if (index >= 0 && !partners.includes(index)) partners.push(index);
		}
		entry["connections"] = partners;
		this.availableComponents = [...this.availableComponents];
	}

	/**
	 * The authored entry a live device came from, or undefined when the device
	 * was placed in this session and has no entry yet.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} device - the live device
	 * @returns {?object}
	 */
	private authoredEntryOf(device: chemlib.ElectricComponent): object | undefined {
		const sprite = this.canvas.world.children.find(({ label }) => label === `${device._type}:${device._id}`);
		return sprite ? this.findAuthoredComponent(sprite) : undefined;
	}

	/**
	 * The index of a live device in the authored component list, or -1.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} device - the live device
	 * @returns {number}
	 */
	private authoredIndexOf(device: chemlib.ElectricComponent): number {
		const entry = this.authoredEntryOf(device);
		return entry ? this.availableComponents.indexOf(entry) : -1;
	}

	/**
	 * removes a connection between a selected sprites object an its partner
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} component - the object to disconnect
	 * @param {chemlib.ElectricComponent} partner - the object to which the connection is to be removed
	 */
	private _remEcon(component: chemlib.ElectricComponent, partner: chemlib.ElectricComponent): void {
		const message: string = component.disconnect(partner);
		if (message === "") {
			this.syncAuthoredConnections(component);
			this.syncAuthoredConnections(partner);
			// The freed plug has to read as free again.
			this.canvas.refreshDeviceDisplay(component);
			this.canvas.refreshDeviceDisplay(partner);
			this._sendxAPiStatement(
				"removed",
				"eCon " + component._type + component._id,
				{
					response: partner._type + ":" + partner._id,
					success: true,
					completion: true,
				}
			);
		} else {
			this._notify(message.split("\n").filter(Boolean).map(line => this.message(line)).join("\n"), "warning", 4000);
			this._sendxAPiStatement(
				"removed",
				"eCon " + component._type + component._id,
				{
					response: partner._type + ":" + partner._id,
					success: false,
					completion: true,
				}
			);
		}
	}

	/**
	 * Shows a short notice in the status strip above the canvas. The strip is
	 * not modal and never blocks the canvas, so a notice can appear while the
	 * user keeps working; a new notice replaces the previous one.
	 *
	 * @private
	 * @param {string} text - the notice
	 * @param {string} [variant="neutral"] - neutral, success, warning or danger
	 * @param {number} [duration=2000] - how long the notice stays, in ms
	 */
	_notify(text: string, variant: "neutral" | "success" | "warning" | "danger" = "neutral", duration = 2000): void {
		const strip = this.statusStrip;
		if (!strip) return;
		strip.textContent = text;
		strip.dataset.variant = variant;
		strip.hidden = false;
		const view = this.ownerDocument.defaultView;
		view?.clearTimeout(this.statusTimeout);
		this.statusTimeout = view?.setTimeout(() => { strip.hidden = true; }, duration);
	}

	/**
	 * sends an xAPi statement with a fetch request
	 *
	 * @private
	 * @async
	 * @param {string} action - the verb of the statement
	 * @param {string} context - the name of the object being interacted with
	 * @param {?object} [extra] - the result of the interaction
	 * @returns {Promise<void>}
	 */
	private async _sendxAPiStatement(
		action: string,
		context: string,
		extra?: object
	): Promise<void> {
		return sendXApiStatement(
			{
				enabled: this.enablexAPI && !this.hasAttribute("contenteditable"),
				rndName: this.RndName,
				apiKey: this.xAPIKey,
			},
			action,
			context,
			extra
		);
	}

	/**
	 * Public entry point for reactive controllers to emit an xAPI statement.
	 * Delegates to {@link _sendxAPiStatement}.
	 *
	 * @param action - the verb of the statement
	 * @param context - the name of the object being interacted with
	 * @param extra - the optional result of the interaction
	 */
	public reportXApi(action: string, context: string, extra?: object): void {
		this._sendxAPiStatement(action, context, extra);
	}

	/**
	 * renders the entire widget
	 *
	 * @returns {*}
	 */
	render() {
		const diagramAvailable = this.diagramPanelAvailable;
		const diagramOpen = diagramAvailable && this.diagramPanelOpen;
		return html`
			<div
				id="upper"
				@keydown=${this.deleteSelection}
				class=${`${diagramOpen ? "show-diagram-panel" : ""} ${this.teacherDrawerOpen ? "show-palette" : ""}`}
			>
				<div id="canvasArea">
					${this.pix_canvas}
					${this.renderObjectSummary()}
					${this.renderGroupSummary()}
					${this.renderFillMeter()}
					${this.renderAmountMenu()}
					${this.renderControlButtons()}
				</div>
				${this.renderDiagramDetails(diagramAvailable, diagramOpen)}
				${this.renderTeacherDrawer()}
				<sl-popup id="permissionPopup" placement="top" distance="8" flip shift arrow
					.anchor=${this.permissionTooltip?.anchor} .active=${!!this.permissionTooltip}>
					<div id="permissionTooltip" role="tooltip">${this.permissionTooltip?.text}</div>
				</sl-popup>
			</div>
		`;
	}

	private get diagramPanelAvailable(): boolean {
		return this.diagrams.hasDiagrams || this.simulation.hasRunningExperiments;
	}

	private renderDiagramDetails(available: boolean, open: boolean) {
		return html`
			<aside id="diagramArea" class="workspace-side">
				<sl-details class="workspace-details" .open=${open} ?disabled=${!available}
					@sl-show=${(event: Event) => this.onDiagramToggle(event, true)}
					@sl-hide=${(event: Event) => this.onDiagramToggle(event, false)}>
					<span slot="summary" class="workspace-summary" title=${this.message("Diagramme")}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M2 2v12h12M4 11l3-4 3 2 4-5"/>
						</svg>
						<span class="panel-button-label">${this.message("Diagramme")}</span>
					</span>
					${this.renderPanelArrows("right")}
					<div id="inlineDiagramPanel">
						<sl-checkbox .checked=${this.diagrams.showLine} @sl-change=${() => this.diagrams.toggleShowLine()}>
							${this.message("Kurven anzeigen")}
						</sl-checkbox>
						${this.canvasContainer}
					</div>
				</sl-details>
			</aside>`;
	}

	private onDiagramToggle(event: Event, open: boolean): void {
		if (event.target !== event.currentTarget || !this.diagramPanelAvailable || this.diagramPanelOpen === open) return;
		this.diagramPanelOpen = open;
		if (open && this.teacherDrawerOpen && this.containerDiv.clientWidth < MIN_TWO_PANELS_WIDTH) this.closeTeacherDrawer();
		this._sendxAPiStatement(open ? "opened" : "closed", "diagramPanel");
	}

	private renderPanelArrows(direction: "right" | "left") {
		const paths = {
			right: ["m5 3 4 4-4 4", "m9 3-4 4 4 4"],
			left: ["m9 3-4 4 4 4", "m5 3 4 4-4 4"],
		};
		return html`
			<svg slot="expand-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true"><path d=${paths[direction][0]}/></svg>
			<svg slot="collapse-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true"><path d=${paths[direction][1]}/></svg>`;
	}

	private renderControlButtons() {
		const gridLabel = this.message("Canvas-Raster");
		const resetZoomLabel = this.message("Zoom auf 100 % zurücksetzen");
		return html`
				<div id="canvasZoom">
					<sl-tag id="gridScale" size="small" ?hidden=${!this.canvas.gridVisible}>
						<span class="grid-scale-line" aria-hidden="true"></span><span id="gridScaleValue"></span>
					</sl-tag>
					<button type="button" id="resetZoom" title=${resetZoomLabel} aria-label=${resetZoomLabel}
						aria-describedby="zoomLevel" @click=${() => this.canvas.resetZoom()}>
						<sl-tag id="zoomLevel" size="small" variant="primary">100 %</sl-tag>
					</button>
					<sl-button size="small" variant=${this.canvas.gridVisible ? "primary" : "default"}
						title=${gridLabel} aria-label=${gridLabel} aria-pressed=${this.canvas.gridVisible}
						@click=${() => this.canvas.toggleGrid()}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M2 2h12v12H2zM6 2v12m4-12v12M2 6h12M2 10h12"/>
						</svg>
					</sl-button>
					<sl-button size="small" title=${this.message("Vergrößern")}
						aria-label=${this.message("Vergrößern")} @click=${() => this.canvas.zoomBy(1.25)}>
						<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg>
					</sl-button>
					<sl-button size="small" title=${this.message("Verkleinern")}
						aria-label=${this.message("Verkleinern")} @click=${() => this.canvas.zoomBy(0.8)}>
						<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" aria-hidden="true"><path d="M3 8h10"/></svg>
					</sl-button>
					<sl-button size="small" title=${this.message("Alle Objekte einpassen")}
						aria-label=${this.message("Alle Objekte einpassen")} @click=${() => this.canvas.fitObjects()}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4"/>
							<rect x="5" y="5" width="6" height="6" rx="0.5"/>
						</svg>
					</sl-button>
					<sl-button id="buttonFullscreen" size="small" title=${this.message("Vollbild an/aus")}
						aria-label=${this.message("Vollbild an/aus")} @click=${this.toggleFullscreen}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4"/>
						</svg>
					</sl-button>
				</div>
				<div id="statusStrip" role="status" aria-live="polite" hidden></div>
		`;
	}

	private async toggleFullscreen(): Promise<void> {
		const exit = this.ownerDocument.fullscreenElement === this;
		try {
			if (exit) await this.ownerDocument.exitFullscreen();
			else await this.requestFullscreen();
			this._sendxAPiStatement("selected", exit ? "window mode" : "fullscreen mode");
		} catch (error) {
			console.warn("Unable to change Chemlab fullscreen mode", error);
		}
	}

	private onTeacherDrawerToggle(event: Event, open: boolean): void {
		if (event.target !== event.currentTarget || this.teacherDrawerOpen === open) return;
		if (open) {
			this.teacherDrawerChoice = this.teacherDrawerOpen = true;
			if (this.diagramPanelAvailable && this.containerDiv.clientWidth < MIN_TWO_PANELS_WIDTH) this.diagramPanelOpen = false;
		} else {
			this.closeTeacherDrawer();
		}
	}

	private closeTeacherDrawer(): void {
		this.teacherDrawerChoice = this.teacherDrawerOpen = false;
		this.permissionTooltip = undefined;
		this.openConcentrationMenu = undefined;
	}

	private renderTeacherDrawer() {
		const label = this.message(this.canAuthor ? "Lehrkraft Steuerung" : "Komponenten");
		const selected = this.selectedChemical ? html`
			<sl-button class="selected-chemical" size="small" @click=${this.clearChemicalSelection}>
				${this.selectedChemical.name} ×
			</sl-button>` : nothing;
		return html`
			<aside id="paletteArea" class="workspace-side" aria-label=${label}>
				<sl-details id="teacherDrawer" class="workspace-details" .open=${this.teacherDrawerOpen}
					@sl-show=${(event: Event) => this.onTeacherDrawerToggle(event, true)}
					@sl-hide=${(event: Event) => this.onTeacherDrawerToggle(event, false)}>
					<span slot="summary" class="workspace-summary" title=${label}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M2 6h12v7H2zM5 6V3h6v3M2 9h12"/>
						</svg>
						<span class="panel-button-label">${label}</span>
					</span>
					${this.renderPanelArrows("left")}
					<div id="teacherDrawerContent">
						<sl-tab-group id="teacherTabs"
							@sl-tab-show=${(event: CustomEvent<{ name: "components" | "chemicals" }>) => {
								if (event.target === event.currentTarget) {
									this.teacherTab = event.detail.name;
									if (this.teacherTab === "chemicals") this.chemicalCatalogOpened = true;
									this.permissionTooltip = undefined;
								}
							}}>
							<sl-tab slot="nav" panel="components" active>${this.message("Komponenten")}</sl-tab>
							<sl-tab slot="nav" panel="chemicals">${this.message("Chemikalien")}</sl-tab>
							<sl-tab-panel name="components" active>
								<div class="palette-content">${selected}${this.renderComponentPalette()}</div>
							</sl-tab-panel>
							<sl-tab-panel name="chemicals">
								<div class="palette-content">
									${selected}
									${this.chemicalCatalogOpened ? this.renderChemicalCatalog() : nothing}
								</div>
							</sl-tab-panel>
						</sl-tab-group>
					</div>
				</sl-details>
			</aside>
		`;
	}

	private renderComponentPalette() {
		const types = Object.keys(componentVariants) as PaletteComponent[];
		const groups = [
			{ label: this.message("Glasgeräte"), types: types.filter(type => componentGraphic(type).capacityMl !== undefined) },
			{ label: this.message("Elektrogeräte"), types: types.filter(type => componentGraphic(type).capacityMl === undefined) },
		].flatMap(({ label, types }) => {
			const cards = types.map(type => this.renderComponentCard(type)).filter(card => card !== nothing);
			return cards.length ? [this.renderPaletteSection(label, this.renderPaletteSubgroup("", label, cards))] : [];
		});
		return groups.length ? groups : html`<p class="palette-empty">${this.message("Keine Geräte freigegeben.")}</p>`;
	}

	private renderComponentCard(type: PaletteComponent) {
		const variants: ComponentVariant[] = componentVariants[type];
		const allowed = variants.filter((variant) => this.isVariantAllowed(variant));
		const visible = this.canAuthor ? variants : allowed;
		if (!visible.length) return nothing;
		const graphic = componentGraphic(type);
		const current = visible.find(({ id }) => id === this.visibleVariants[type]) ??
			visible.find(({ capacityMl }) => capacityMl === graphic.capacityMl) ?? visible[0];
		const position = visible.indexOf(current);
		const name = this.itemName(type);
		const variantLabel = current.material ? this.message(current.material.name) : current.size || this.message("Standard");
		const partiallyAllowed = allowed.length > 0 && allowed.length < variants.length;
		const permissionVariant = this.palettePermissionVariant(allowed.length, variants.length);
		const currentAllowed = allowed.includes(current);
		const showPermissionTooltip = (event: Event) => {
			if (!partiallyAllowed) return;
			this.permissionTooltip = {
				anchor: event.currentTarget as HTMLElement,
				type,
				text: allowed.map((variant) => variant.material ? this.message(variant.material.name) : variant.size).join(", "),
			};
		};
		const hidePermissionTooltip = (event: Event) => {
			if (this.permissionTooltip?.anchor === event.currentTarget) this.permissionTooltip = undefined;
		};
		const itemLabel = `${name} · ${variantLabel}`;
		const changeVariant = (step: number) => {
			const next = visible[(position + step + visible.length) % visible.length];
			this.visibleVariants = { ...this.visibleVariants, [type]: next.id };
			if (this.componentToPlace === current.id) this.componentToPlace = undefined;
		};
		const arrow = (step: number, label: string) => html`
			<sl-button class="variant-arrow" size="small" variant="text" ?disabled=${visible.length < 2}
				aria-label=${`${name} · ${label}`} title=${label} @click=${() => changeVariant(step)}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
					<path d=${step < 0 ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"}/>
				</svg>
			</sl-button>`;
		const permissionCount = this.message("{allowed} von {total} Varianten freigegeben", { allowed: allowed.length, total: variants.length });
		const permissionAction = this.message(allowed.length === variants.length ? "Alle Varianten sperren" : "Alle Varianten freigeben");
		const badge = html`
			<button type="button" class="component-permission-toggle"
				title=${partiallyAllowed ? nothing : this.message("Doppelklick zum Umschalten aller Varianten")}
				aria-label=${`${name} · ${permissionCount} · ${permissionAction}`}
				aria-describedby=${this.permissionTooltip?.type === type ? "permissionTooltip" : nothing}
				@pointerenter=${showPermissionTooltip} @pointerleave=${hidePermissionTooltip}
				@focus=${showPermissionTooltip} @blur=${hidePermissionTooltip}
				@keydown=${(event: KeyboardEvent) => { if (event.key === "Escape") hidePermissionTooltip(event); }}
				@dblclick=${() => this.toggleAllVariants(type)}
				@click=${(event: MouseEvent) => { if (event.detail === 0) this.toggleAllVariants(type); }}>
				${this.renderPaletteBadge(allowed.length, variants.length)}
			</button>`;
		return this.renderPaletteCard(name, permissionVariant, badge, html`
				<div class="palette-variant">
					<div class="palette-preview-area">
						<button type="button" class="component-tile" contenteditable="false"
							aria-label=${itemLabel} aria-pressed=${this.componentToPlace === current.id}
							@pointerdown=${(event: PointerEvent) => this.startComponentDrag(event, current)}
							@dragstart=${this.preventNativePaletteDrag}
							@click=${(event: MouseEvent) => {
								if (this.consumePaletteClick(event)) return;
								this.componentToPlace = this.componentToPlace === current.id ? undefined : current.id;
								this.clearChemicalSelection();
							}}>
							${renderComponentPaletteIcon(current, variants.indexOf(current) / Math.max(1, variants.length - 1))}
						</button>
						${this.canAuthor ? html`
							<div class="palette-card-permission">
								<sl-tooltip hoist content=${this.message("Für Lernende erlauben")}>
									<sl-checkbox size="small" .checked=${currentAllowed}
										aria-label=${`${itemLabel} · ${this.message("Für Lernende erlauben")}`}
										@sl-change=${(event: Event) => this.setVariantAllowed(current, (event.currentTarget as SlCheckbox).checked)}>
										${this.message("Für Lernende erlauben")}
									</sl-checkbox>
								</sl-tooltip>
							</div>` : nothing}
					</div>
					<div class="palette-variant-controls">
						${arrow(-1, this.message(current.material ? "Vorheriges Material" : "Vorherige Größe"))}
						<sl-tag class="palette-variant-value" size="small" variant=${currentAllowed ? "primary" : "neutral"} aria-live="polite">${variantLabel}</sl-tag>
						${arrow(1, this.message(current.material ? "Nächstes Material" : "Nächste Größe"))}
					</div>
				</div>
		`);
	}

	private renderPaletteSection(label: string, content: unknown, showHeading = true) {
		return html`
			<section class="palette-section" aria-label=${label}>
				${showHeading ? html`
					<div class="palette-section-heading" role="heading" aria-level="3">
						<sl-badge variant="primary">${label}</sl-badge>
					</div>` : nothing}
				<div class="palette-section-body">${content}</div>
			</section>`;
	}

	private renderPaletteSubgroup(label: string, sectionLabel: string, cards: unknown, headingLevel = 4) {
		return html`
			<div class="palette-subgroup" role="group" aria-label=${label || sectionLabel}>
				${label ? html`
					<div class="palette-subgroup-heading" role="heading" aria-level=${headingLevel}>
						<sl-badge variant="neutral">${label}</sl-badge>
					</div>` : nothing}
				<div class="palette-card-list">${cards}</div>
			</div>`;
	}

	private palettePermissionVariant(allowed: number, total: number) {
		return allowed === 0 ? "danger" : allowed < total ? "primary" : "success";
	}

	private renderPaletteBadge(allowed: number, total: number) {
		return html`<sl-badge pill variant=${this.palettePermissionVariant(allowed, total)}>${allowed} / ${total}</sl-badge>`;
	}

	private renderPaletteCard(name: string, variant: ReturnType<typeof this.palettePermissionVariant>,
		badge: unknown, body: unknown, chemical = false, permissions?: { open: boolean; label: string; toggle: () => void; options: unknown }) {
		return html`
			<div class="palette-card${chemical ? " palette-card-chemical" : ""}" role="group" aria-label=${name}>
				<div class="palette-card-header">
					<div class="palette-card-name">
						${permissions ? html`
							<button type="button" class="palette-card-menu-trigger" contenteditable="false"
								aria-label=${permissions.label} aria-expanded=${permissions.open} @click=${permissions.toggle}
								@keydown=${(event: KeyboardEvent) => {
									if (event.key !== "Escape" || !permissions.open) return;
									event.stopPropagation();
									permissions.toggle();
								}}>
								<sl-tag size="small" variant=${variant} title=${name}>${name}<svg class="palette-card-menu-indicator"
									width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
									<path d="m2.5 4.5 3.5 3 3.5-3"/>
								</svg></sl-tag>
							</button>` : html`<sl-tag size="small" variant=${this.canAuthor ? variant : "neutral"} title=${name}>${name}</sl-tag>`}
					</div>
					${this.canAuthor ? badge : nothing}
				</div>
				${permissions ? html`
					<div class="chemical-card-body">
						<div class="chemical-card-preview" ?inert=${permissions.open} ?data-menu-open=${permissions.open}>${body}</div>
						${permissions.open ? html`
							<div class="chemical-concentration-permissions palette-variant" role="group"
								aria-label=${permissions.label} tabindex="0" contenteditable="false"
								@keydown=${(event: KeyboardEvent) => {
									if (event.key !== "Escape") return;
									event.stopPropagation();
									permissions.toggle();
									(event.currentTarget as HTMLElement).closest(".palette-card")
										?.querySelector<HTMLButtonElement>(".palette-card-menu-trigger")?.focus();
								}}>
								${permissions.options}
							</div>` : nothing}
					</div>` : body}
			</div>`;
	}

	private renderChemicalPermissionBadge(label: string, items: (ChemicalPermissionItem & { label?: string })[]) {
		const { allowed, total, labels } = this.chemicalPermissionSummary(items);
		const allAllowed = allowed === total;
		const toggle = () => this.toggleAllChemicals(items, allAllowed);
		const count = this.message("{allowed} von {total} Varianten freigegeben", { allowed, total });
		const action = this.message(allAllowed ? "Alle Varianten sperren" : "Alle Varianten freigeben");
		return html`
			<button type="button" class="component-permission-toggle" contenteditable="false"
				title=${allowed && !allAllowed ? `${this.message("Freigaben")}: ${labels.join(", ")}`
					: this.message("Doppelklick zum Umschalten aller Varianten")}
				aria-label=${`${label} · ${count} · ${action}`}
				@dblclick=${toggle}
				@click=${(event: MouseEvent) => { if (event.detail === 0) toggle(); }}>
				${this.renderPaletteBadge(allowed, total)}
			</button>`;
	}

	private chemicalDisplayLabel({ name, label }: { name: string; label?: string }): string {
		return label ?? this.message(solutionDisplayNames[name] ?? name);
	}

	private chemicalTileLabel(name: string, concentrationMolPerL?: number): string {
		return concentrationMolPerL == null ? name : `${name} (${this.formatAmount(concentrationMolPerL, 8)} mol/L)`;
	}

	private renderChemicalTile(key: string, name: string, formula: string, recipe: ChemicalRecipe, src?: string,
		concentrationMolPerL?: number) {
		const label = this.chemicalTileLabel(name, concentrationMolPerL);
		const chemical = { key, name: label, recipe };
		return html`
			<button type="button" class="chemical-tile" contenteditable="false"
				aria-label=${chemical.name} aria-pressed=${this.selectedChemical?.key === key}
				@pointerdown=${(event: PointerEvent) => this.startChemicalDrag(event, chemical, src)}
				@dragstart=${this.preventNativePaletteDrag}
				@click=${(event: MouseEvent) => {
					if (this.consumePaletteClick(event)) return;
					const wasSelected = this.selectedChemical?.key === key;
					this.clearChemicalSelection();
					this.componentToPlace = undefined;
					if (wasSelected) return;
					this.clearObjectSelection();
					this.selectedChemical = chemical;
				}}>
				<span class="chemical-preview">${src ? html`<img src=${src} alt="" draggable="false" decoding="async" loading="lazy"/>`
					: html`<span>${formula}</span>`}</span>
			</button>`;
	}

	private renderChemicalCatalog() {
		const normalize = (value: string) => value.normalize("NFKC").toLowerCase();
		const query = normalize(this.chemicalQuery.trim());
		const matches = (...values: string[]) => !query || values.some((value) => normalize(value).includes(query));
		const groupChoices = chemicalCatalogGroups.flatMap(({ category, items }) => {
			const entries = this.canAuthor ? items : items.filter((item) => this.isChemicalAllowed(item.name));
			return entries.length ? [{ id: category.replace(/ /g, "_"), category, label: this.message(category), items: entries }] : [];
		});
		const activeGroup = groupChoices.find((group) => group.id === this.chemicalGroup);
		const allLabel = this.message("Alle Stoffe");
		type Item = (typeof groupChoices)[number]["items"][number];
		const seen = new Set<string>();
		const sections = (activeGroup ? [activeGroup] : groupChoices).flatMap((group) => {
			const solutions: Item[] = [];
			const other: Item[] = [];
			for (const item of group.items) {
				const label = this.chemicalDisplayLabel(item);
				if (seen.has(item.name) || !matches(group.category, group.label, item.name, this.message(item.name), label, item.formula)) continue;
				seen.add(item.name);
				const isSolution = item.recipe.aqueousMolar || chemicalConcentration(item);
				(isSolution ? solutions : other).push(item);
			}
			const subgroup = (id: string, label: string, items: Item[]) => ({ id, label, items });
			const subgroups = [
				subgroup("other", solutions.length ? this.message("Weitere Stoffe") : "", other),
				subgroup("solutions", this.message("Lösungen"), solutions),
			].filter(({ items }) => items.length);
			return subgroups.length ? [{ ...group, subgroups }] : [];
		});
		const items = sections.flatMap(({ subgroups }) => subgroups.flatMap(({ items }) => items));
		return html`
			<div class="chemical-filters">
				<sl-select class="chemical-group-select" size="small" hoist contenteditable="false"
					label=${this.message("Stoffklasse")} .value=${activeGroup?.id ?? "all"}
					@sl-change=${(event: Event) => {
						this.chemicalGroup = String((event.currentTarget as SlSelect).value);
						this.openConcentrationMenu = undefined;
					}}>
					<sl-option value="all">${allLabel}</sl-option>
					${groupChoices.map((group) => html`<sl-option value=${group.id}>${group.label}</sl-option>`)}
				</sl-select>
				<sl-input class="chemical-search" size="small" type="search" clearable contenteditable="false"
					label=${this.message("Chemikalien suchen")} placeholder=${this.message("Name oder Formel suchen")}
					.value=${this.chemicalQuery}
					@sl-input=${(event: Event) => { this.chemicalQuery = (event.currentTarget as SlInput).value; }}>
				</sl-input>
				${this.canAuthor && items.length ? html`
					<div class="chemical-filter-badge">${this.renderChemicalPermissionBadge(activeGroup?.label ?? allLabel, items)}</div>` : nothing}
			</div>
			${items.length ? keyed(activeGroup?.id ?? "all", html`
				${repeat(sections, (section) => section.id, (section) => this.renderPaletteSection(
					section.label,
					repeat(section.subgroups, (subgroup) => subgroup.id, (subgroup) => this.renderPaletteSubgroup(
						subgroup.label, section.label,
						repeat(subgroup.items, (item) => item.name, (item) => this.renderChemicalCard(item)),
						activeGroup ? 3 : 4
					)), !activeGroup
				))}`) : html`<p class="palette-empty" role="status">${this.message("Keine Chemikalien gefunden.")}</p>`}
		`;
	}

	private renderChemicalCard(item: ChemicalPermissionItem & {
		formula: string; recipe: ChemicalRecipe; label?: string; preview?: MoleculeDefinition;
	}) {
		const concentration = chemicalConcentration(item);
		const name = this.chemicalDisplayLabel(item);
		const src = catalogPreviews[item.name];
		const allowed = concentration ? this.allowedConcentrationsFor(item.name, concentration.initial) : [];
		const values = concentration ? this.canAuthor ? this.concentrationVariants(item.name, concentration) : allowed : [];
		const saved = this.activeChemicalConcentrations[item.name];
		const active = values.includes(saved) ? saved
			: concentration && values.includes(concentration.initial) ? concentration.initial : values[0];
		const activeKey = active === undefined ? item.name : `${item.name}@${active}`;
		const preview = this.renderChemicalTile(activeKey, name, item.formula,
			active === undefined ? item.recipe : withConcentration(item.recipe, active), src, active);
		const allowedCount = concentration ? allowed.length : Number(this.isChemicalAllowed(item.name));
		const variant = this.palettePermissionVariant(allowedCount, concentration ? values.length : 1);
		const badge = this.canAuthor ? this.renderChemicalPermissionBadge(name, [item]) : nothing;
		const concentrationLabel = (value: number) => `${this.formatAmount(value, 8)} mol/L`;
		const permissionsOpen = this.openConcentrationMenu === item.name;
		const permissions = this.canAuthor && concentration ? {
			open: permissionsOpen,
			label: `${name} · ${this.message("Freigegebene Konzentrationen")}`,
			toggle: () => { this.openConcentrationMenu = permissionsOpen ? undefined : item.name; },
			options: permissionsOpen ? repeat(values, (value) => value, (value) => html`
				<sl-checkbox size="small" .checked=${live(allowed.includes(value))}
					@sl-change=${(event: Event) => {
						const checked = (event.currentTarget as SlCheckbox).checked;
						this.setAllowedConcentrations(item.name, checked ? [...allowed, value] : allowed.filter((entry) => entry !== value));
					}}>
					${concentrationLabel(value)}
				</sl-checkbox>`) : nothing,
		} : undefined;
		const choose = (value: number) => {
			if (value === active || !values.includes(value)) return;
			this.activeChemicalConcentrations = { ...this.activeChemicalConcentrations, [item.name]: value };
			if (this.selectedChemical?.key === activeKey) this.clearChemicalSelection();
		};
		const position = values.indexOf(active);
		const arrow = (step: -1 | 1) => html`
			<button type="button" class="chemical-carousel-arrow" contenteditable="false"
				aria-label=${this.message(step < 0 ? "Vorherige Konzentration" : "Nächste Konzentration")}
				@click=${() => choose(values[(position + step + values.length) % values.length])}>
				<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
					<path d=${step < 0 ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"}/>
				</svg>
			</button>`;
		const body = active !== undefined ? html`
			<div class="palette-variant">
				<div class="palette-preview-area">${preview}</div>
				<div class="palette-variant-controls" role="group" aria-label=${`${name} · ${this.message("Konzentration zum Dosieren")}`}>
					${values.length > 1 ? arrow(-1) : nothing}
					<span class="palette-variant-value chemical-dose-value" aria-live="polite">
						<sl-badge>${concentrationLabel(active)}</sl-badge>
					</span>
					${values.length > 1 ? arrow(1) : nothing}
				</div>
			</div>` : html`
			<div class="palette-preview-area palette-variant">
				${preview}
				${this.canAuthor ? this.renderChemicalPermission(item.name, name) : nothing}
			</div>`;
		return this.renderPaletteCard(name, variant, badge, body, true, permissions);
	}

	private renderChemicalPermission(name: string, label: string) {
		const checked = this.isChemicalAllowed(name);
		const changeText = this.message("Für Lernende erlauben");
		return html`
			<div class="palette-card-permission">
				<sl-tooltip hoist content=${changeText}>
					<sl-checkbox size="small" .checked=${live(checked)} aria-label=${`${label} · ${changeText}`}
						@sl-change=${(event: Event) => this.setChemicalBlocked(name, !(event.currentTarget as SlCheckbox).checked)}>
						${changeText}
					</sl-checkbox>
				</sl-tooltip>
			</div>`;
	}

	private renderFillMeter() {
		const meter = this.fillMeter;
		if (!meter) return nothing;
		const volume = Math.max(0, Math.min(meter.capacity, meter.volume));
		const label = `${volume.toFixed(1)} / ${meter.capacity} mL`;
		return html`
			<div class="fill-meter volume-bar" role="meter" aria-label=${this.message("Füllstand")}
				aria-valuemin="0" aria-valuemax=${meter.capacity} aria-valuenow=${volume} aria-valuetext=${label}
				style=${`left: ${meter.x}px; top: ${meter.y}px; --amount-progress: ${100 * volume / meter.capacity}%`}>
				${label}
			</div>`;
	}

	private renderAmountMenu() {
		const menu = this.amountMenu;
		if (!menu) return nothing;
		const from = "vessel" in menu.from ? this.itemName(menu.from.vessel._type) : menu.from.name;
		const target = this.itemName(menu.target._type);
		const decrease = this.message("Menge verringern");
		const increase = this.message("Menge erhöhen");
		const formattedAmount = `${this.formatAmount(menu.amount, 7)} mL`;
		const editLabel = this.message("Menge bearbeiten (Doppelklick oder F2)");
		return html`
			<section id="amountMenu" class="selection-info" tabindex="-1" aria-labelledby="amountMenuTitle"
				@keydown=${this.handleAmountMenuKey}>
				<div id="amountMenuTitle" class="selection-labels">
					<sl-badge variant="primary">${from}</sl-badge>
					<span class="amount-menu-arrow" aria-hidden="true">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor">
							<path d="M2.5 8h10m-4-4 4 4-4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
					<sl-badge class="selection-info-title">${target}</sl-badge>
				</div>
				${!(menu.max > 0) ? html`
					<div class="amount-menu-row">
						<span role="status">${this.message("Keine Menge verfügbar.")}</span>
						<sl-button size="small" @click=${() => {
							this.closeAmountMenu();
							this.app.canvas.focus({ preventScroll: true });
						}}>${this.message("Schließen")}</sl-button>
					</div>` : html`
					<div class="amount-menu-row">
						<button type="button" class="amount-menu-button" title=${decrease} aria-label=${decrease}
							aria-disabled=${menu.amount <= 0}
							@click=${(event: MouseEvent) => this.adjustAmount(event.shiftKey ? -10 : -1)}>−</button>
						<div class="amount-menu-quantity volume-bar" style=${`--amount-progress: ${100 * menu.amount / menu.max}%`}>
							<output class="amount-menu-value" for="amountMenuSlider" ?inert=${!!menu.editing}>${formattedAmount}</output>
							${menu.editing ? html`
								<input id="amountMenuValue" type="text" inputmode="decimal" autocomplete="off"
									aria-label=${this.message("Menge in mL")}
									.value=${menu.amount.toLocaleString("en", { useGrouping: false, maximumSignificantDigits: 17 })}
									@input=${(event: Event) => (event.currentTarget as HTMLInputElement).setCustomValidity("")}>
							` : html`
								<input id="amountMenuSlider" type="range" dir="ltr" min="0" max=${menu.max} step="any"
								.value=${String(menu.amount)}
								aria-label=${this.message("Menge in mL")} aria-valuetext=${formattedAmount} title=${editLabel}
								@input=${this.slideAmount} @dblclick=${this.editAmount}>
							`}
						</div>
						<button type="button" class="amount-menu-button" title=${increase} aria-label=${increase}
							aria-disabled=${menu.amount >= menu.max}
							@click=${(event: MouseEvent) => this.adjustAmount(event.shiftKey ? 10 : 1)}>+</button>
						<sl-button size="small" variant="default" class="amount-menu-confirm" title=${this.message("bestätigen")}
							aria-label=${this.message("bestätigen")} ?disabled=${!menu.editing && menu.amount <= 0} @click=${this.confirmAmount}>
							<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
								<path d="m3 8 3 3 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</sl-button>
					</div>`}
			</section>`;
	}

	private renderGroupSummary() {
		const selected = this.canvas.selectedObjects;
		if (!selected.length) return nothing;
		return html`
			<section id="groupSelectionInfo" class="selection-info" aria-label=${this.message("Ausgewählte Objekte")}>
				<div class="selection-labels">
					${selected.map(({ label }) => html`
						<sl-badge class="selection-info-title">${this.itemName(label.split(":")[0])}</sl-badge>`)}
				</div>
				<div class="selection-actions">
					${this.renderSelectionDeleteButton(() => this.removeObjects(this.canvas.selectedObjects))}
				</div>
			</section>
		`;
	}

	get selectedObjectSprite(): PIXI.Container | undefined {
		return this.curr_obj ? this.canvas.world.children[this.curr_stage_index] : undefined;
	}

	positionSelectionSummary(bounds: PIXI.Bounds | undefined, canvasWidth: number, canvasHeight: number, groupSelected: boolean): void {
		const summary = groupSelected ? this.groupSummary : this.objectSummary;
		this.positionCanvasPanel(summary, bounds, canvasWidth, canvasHeight);
	}

	positionAmountMenu(): void {
		if (!this.amountMenu || !this.app) return;
		const summary = this.shadowRoot.querySelector<HTMLElement>("#amountMenu");
		const { width, height } = this.app.screen;
		const anchor = this.amountMenu.anchor;
		const bounds = anchor.parent && anchor.getBounds();
		this.positionCanvasPanel(summary, bounds && bounds.maxX > 0 && bounds.maxY > 0 &&
			bounds.minX < width && bounds.minY < height ? bounds : undefined, width, height);
	}

	private positionCanvasPanel(summary: HTMLElement, bounds: PIXI.Bounds | undefined, canvasWidth: number, canvasHeight: number): void {
		if (!summary) return;
		if (!bounds || summary.hidden) {
			summary.removeAttribute("data-anchored");
			return;
		}

		const padding = 4;
		const gap = 8;
		const width = summary.offsetWidth;
		const height = summary.offsetHeight;
		const left = Math.max(0, bounds.minX);
		const right = Math.min(canvasWidth, bounds.maxX);
		const top = Math.max(0, bounds.minY);
		const bottom = Math.min(canvasHeight, bounds.maxY);
		const maxX = Math.max(padding, canvasWidth - padding - width);
		const maxY = Math.max(padding, canvasHeight - padding - height);
		const rightSide = right + gap;
		const leftSide = left - gap - width;
		let x = (left + right - width) / 2;
		let y = top - gap - height;
		if (rightSide <= maxX || leftSide >= padding) {
			// Prefer sitting beside the object; use the right side by default.
			x = rightSide <= maxX ? rightSide : leftSide;
			y = (top + bottom - height) / 2;
		} else if (y < padding) {
			y = bottom + gap <= maxY || canvasHeight - bottom > top ? bottom + gap : y;
		}
		summary.style.transform = `translate(${Math.max(padding, Math.min(x, maxX))}px, ${Math.max(padding, Math.min(y, maxY))}px)`;
		summary.setAttribute("data-anchored", "");
	}

	private renderSelectionDeleteButton(remove: () => void, iconOnly = false) {
		return html`
			<button type="button" class=${iconOnly ? "remObj object-summary-action" : "remObj"} aria-label=${this.message("löschen")} title=${this.message("löschen")} @click=${remove}>
				<svg
					aria-hidden="true"
					width="12"
					height="12"
					viewBox="0 0 16 16"
				>
					<path
						fill="currentColor"
						d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
					/>
				</svg>
				${iconOnly ? nothing : this.message("löschen")}
			</button>`;
	}

	private emptyVessel(vessel: chemlib.ChemComponent): void {
		this.stopDose?.(true);
		this.finishDragTransfer();
		this.closeAmountMenu();
		this.hideFillMeter();
		const previous = vessel._content;
		vessel._content = chemlib.StructureManager.newMixture();
		for (const device of this.allEComponents) {
			if (device._connectedMix === previous) device._connectedMix = vessel._content;
		}
		this.canvas.markVesselChanged(vessel);
		this.saveSelectedComponent({ content: "", vol: 0, doses: [] });
		this._updatePopup();
		this.requestUpdate();
	}

	private renderElectricalSettings(device: chemlib.ElectricComponent) {
		const { Cable, Electrode, Source } = chemlib.EComponentType;
		if (device._type === Cable) return nothing;
		const connections = device._connections.filter(Boolean).flatMap(cable => {
			const other = cable._connections.find(end => end && end !== device);
			return other ? [{ cable, other }] : [];
		});
		// A reference electrode is a variant without a material, so the list
		// only offers the metal strips.
		const materials = this.canAuthor && device._type === Electrode
			? componentVariants.electrode.filter(variant => variant.material)
			: [];
		const material = materials.find(variant => variant.material?.name === device._material?.name);
		const hasSource = device._type === Source;
		const hasMeter = device._type === chemlib.EComponentType.Multimeter;
		const hasLabel = device._type === chemlib.EComponentType.Label;
		const hasElectrode = device._type === Electrode;
		if (!hasSource && !hasMeter && !hasLabel && !hasElectrode && !connections.length) return nothing;
		const label = (other: chemlib.ElectricComponent) => `${this.itemName(other._type)} · ${other._id + 1}`;
		// A source has two poles, and the electrode on the plus pole is the
		// anode. The select names the electrodes, so the user never has to
		// think about which cable went into which terminal.
		const plusPole = hasSource ? chemlib.ComponentManager.terminalElectrode(device, 0) : undefined;
		const minusPole = hasSource ? chemlib.ComponentManager.terminalElectrode(device, 1) : undefined;
		const poles = plusPole && minusPole && plusPole !== minusPole
			? { plus: plusPole, minus: minusPole } : undefined;
		return keyed(device, html`
			<sl-details class="electrical-settings" summary=${this.message("Eigenschaften")}
				@sl-after-show=${() => this.canvas.drawSelection()} @sl-after-hide=${() => this.canvas.drawSelection()}>
				${hasSource ? html`
					<label>${this.message("Betriebsart")}
					<select contenteditable="false" @change=${(event: Event) => {
							const mode = (event.currentTarget as HTMLSelectElement).value === "current" ? "current" : "voltage";
							device._sourceMode = mode;
							this.saveSelectedComponent({ sourceMode: mode });
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
					}}>
						<option value="voltage" ?selected=${device._sourceMode !== "current"}>${this.message("Spannung vorgeben")}</option>
						<option value="current" ?selected=${device._sourceMode === "current"}>${this.message("Stromstärke vorgeben")}</option>
					</select></label>
					${device._sourceMode === "current" ? html`
						<sl-input id="complianceVoltage" size="small" type="number" contenteditable="false"
							label=${this.message("Grenzspannung")} .value=${String(device._complianceVoltage ?? 30)}></sl-input>` : nothing}
					<sl-input id="sourceVoltage" size="small" type="number" contenteditable="false"
						label=${this.message("Quellspannung")} .value=${String(device._sourceVoltage ?? 0)}></sl-input>
					<sl-input id="sourceCurrent" size="small" type="number" contenteditable="false"
						label=${this.message("Quellstromstärke")} .value=${String(device._sourceCurrent ?? 0)}></sl-input>
					<sl-button size="small" @click=${() => {
						const value = (id: string) => Number.parseFloat(this.shadowRoot.querySelector<SlInput>(id).value) || 0;
						device._sourceVoltage = value("#sourceVoltage");
						device._sourceCurrent = value("#sourceCurrent");
						const compliance = this.shadowRoot.querySelector<SlInput>("#complianceVoltage");
						if (compliance) device._complianceVoltage = Math.abs(Number.parseFloat(compliance.value)) || 30;
						this.saveSelectedComponent({
							voltage: device._sourceVoltage,
							current: device._sourceCurrent,
							complianceVoltage: device._complianceVoltage,
						});
						this.canvas.refreshDeviceDisplay(device);
						this._updatePopup();
						this._sendxAPiStatement("submitted", "voltage " + device._type + ":" + device._id);
					}}>${this.message("bestätigen")}</sl-button>` : nothing}
				${hasMeter ? html`
					<label>${this.message("Messbereich")}
					<select contenteditable="false" @change=${(event: Event) => {
							const mode = (event.currentTarget as HTMLSelectElement).value === "current" ? "current" : "voltage";
							device._meterMode = mode;
							this.saveSelectedComponent({ meterMode: mode });
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
					}}>
						<option value="voltage" ?selected=${device._meterMode !== "current"}>${this.message("Spannung")}</option>
						<option value="current" ?selected=${device._meterMode === "current"}>${this.message("Stromstärke")}</option>
					</select></label>` : nothing}
				${hasLabel ? html`
					<sl-input id="labelText" size="small" contenteditable="false"
						label=${this.message("Beschriftung")} .value=${device._labelText ?? ""}></sl-input>
					<sl-button size="small" @click=${() => {
						device._labelText = this.shadowRoot.querySelector<SlInput>("#labelText").value;
						this.saveSelectedComponent({ labelText: device._labelText });
						this.canvas.refreshDeviceDisplay(device);
						this._updatePopup();
					}}>${this.message("bestätigen")}</sl-button>` : nothing}
				${hasElectrode ? html`
					<sl-input id="electrodeArea" size="small" type="number" min="0.1" step="0.1" contenteditable="false"
						label=${this.message("Benetzte Fläche in cm²")} .value=${String(device._area ?? chemlib.ELECTRODE_AREA)}></sl-input>
					<sl-input id="electrodeReference" size="small" type="number" step="0.01" contenteditable="false"
						label=${this.message("Bezugspotential in V (leer = keine Referenz)")}
						.value=${device._reference === undefined ? "" : String(device._reference)}></sl-input>
					<sl-button size="small" @click=${() => {
						const area = Number.parseFloat(this.shadowRoot.querySelector<SlInput>("#electrodeArea").value);
						const raw = this.shadowRoot.querySelector<SlInput>("#electrodeReference").value.trim();
						const reference = raw === "" ? Number.NaN : Number.parseFloat(raw);
						device._area = Number.isFinite(area) && area > 0 ? area : chemlib.ELECTRODE_AREA;
						device._reference = Number.isFinite(reference) ? reference : undefined;
						this.saveSelectedComponent({ area: device._area, reference: device._reference });
						this.canvas.refreshDeviceDisplay(device);
						this._updatePopup();
					}}>${this.message("bestätigen")}</sl-button>` : nothing}
				${poles ? html`
					<label>${this.message("Polung")}
					<select contenteditable="false" @change=${(event: Event) => {
							const polarity = Number.parseInt((event.currentTarget as HTMLSelectElement).value);
							device._polarity = polarity === 1 ? 1 : polarity === -1 ? -1 : 0;
							this.saveSelectedComponent({ polarity: device._polarity });
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
					}}>
						<option value="0" ?selected=${device._polarity === 0}>${this.message("automatisch")}</option>
						<option value="1" ?selected=${device._polarity === 1}>${this.message("Plus an")} ${label(poles.plus)}</option>
						<option value="-1" ?selected=${device._polarity === -1}>${this.message("Plus an")} ${label(poles.minus)}</option>
					</select></label>` : nothing}
				${materials.length ? html`
					<label>${this.message("Elektrodenmaterial")}
					<select contenteditable="false" @change=${(event: Event) => {
							const selected = componentVariant((event.currentTarget as HTMLSelectElement).value);
							if (!selected?.material) return;
							device._material = this.newElectrodeMaterial(selected.material);
							const formula = device._material._kekule_obj.calcFormula().getDisplayText();
							this.saveSelectedComponent({ material: formula, variantId: selected.id });
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
							this._sendxAPiStatement("submitted", `ElectrodeMaterlial ${formula}:${device._id}`);
						}}>
						<option value="" ?selected=${!material} disabled>${device._material ? this.itemName(device._material.name) : this.message("kein Material")}</option>
						${materials.map(variant => html`<option value=${variant.id} ?selected=${variant === material}>${this.message(variant.material?.name ?? "")}</option>`)}
					</select></label>` : nothing}
				${connections.length ? html`
					<div class="connection-list">
						<span class="connection-list-label">${this.message("Verbunden mit")}</span>
						${connections.map(({ other }) => html`<sl-tag size="small" variant="neutral">${label(other)}</sl-tag>`)}
					</div>` : nothing}
			</sl-details>
		`);
	}

	private renderObjectSummary() {
		const name = this.itemName(this.curr_name.split(":")[0]);
		const vessel = this.curr_obj instanceof chemlib.ChemComponent ? this.curr_obj : undefined;
		const device = this.curr_obj instanceof chemlib.ElectricComponent ? this.curr_obj : undefined;
		const emptyLabel = this.message("Objekt leeren");
		return html`
			<section id="contextInfoBox" class="selection-info" ?hidden=${!this.curr_obj}>
				<div class="object-summary-heading">
					<sl-tag size="small" variant="primary">${name}</sl-tag>
					${vessel?._content._activeMolecules.length ? html`
						<button type="button" class="object-summary-action empty-vessel"
							aria-label=${emptyLabel} title=${emptyLabel} @click=${() => this.emptyVessel(vessel)}>
							<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor"
								stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M1.5 7 7 1.5 11 5.5 9 5.5 5 9.5a1 1 0 0 1-1.5 0L1.5 7Z"/>
								<path d="M11.5 8.5c.8 1 2 2.4 2 3.5a2 2 0 0 1-4 0c0-1.1 1.2-2.5 2-3.5Z"/>
							</svg>
						</button>` : nothing}
					${this.renderSelectionDeleteButton(() => this._removeSprite(), true)}
				</div>
				<div id="contextEchemInfo"></div>
				<sl-carousel id="contextMolInfo" pagination mouse-dragging slides-per-page="1" slides-per-move="1"
					aria-label=${this.message("Inhalt")} style="display: none"></sl-carousel>
				<div id="contextMixInfo" style="display: none"></div>
				<div class="selection-actions">
					<button
						id="openComp"
						@click="${(event) => {
							let currSprite =
								this.canvas.world.children[
									this.curr_stage_index
								];
							if (
								!this.simulation.hasTask("transfer" + this.curr_name)
							) {
								this.requestUpdate();
								let source = this.curr_obj;
								this.simulation.startExperiment("transfer" + this.curr_name, source,
									() => this.stepTitration(currSprite, source));
								this._sendxAPiStatement(
									"started",
									"transfer" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							} else {
								this.requestUpdate();
								this.simulation.stopTask(
									"transfer" +
										this.curr_name
								);
								this._sendxAPiStatement(
									"completed",
									"transfer" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							}
						}}"
					>
						${this.message(this.simulation.hasTask("transfer" + this.curr_name) ? "Schließen" : "Öffnen")}
					</button>
					<button
						id="activateEComp"
						@click="${(event) => {
							if (
								!this.simulation.hasTask("echem" + this.curr_name)
							) {
								this.requestUpdate();
								this.canvas.setDeviceActive(this.curr_obj, true);
								let source = this.curr_obj;
								this.simulation.startExperiment("echem" + this.curr_name, source,
									() => this.stepElectrochemistry(source));
								this._updatePopup();
								this._sendxAPiStatement(
									"started",
									"echem" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							} else {
								this.requestUpdate();
								this.canvas.setDeviceActive(this.curr_obj, false);
								this.simulation.stopTask(
									"echem" +
										this.curr_name
								);
								this.clearEChemReadings();
								this._updatePopup();
								this._sendxAPiStatement(
									"completed",
									"echem" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							}
						}}"
					>
						${this.message(this.simulation.hasTask("echem" + this.curr_name) ? "Ausschalten" : "Einschalten")}
					</button>
				</div>
				${device ? this.renderElectricalSettings(device) : nothing}
			</section>
		`;
	}


	private voltageReading(device?: chemlib.ElectricComponent): string {
		if (device?._visibleVoltage === null) return this.message("Spannung nicht berechenbar");
		return `${(device?._visibleVoltage ?? 0).toExponential(2)} V`;
	}

	/**
	 * Names the electrode that sits on the plus pole of a source, which is the
	 * one where oxidation runs. Without a set polarity the model picks the
	 * direction itself, so there is no pole to name.
	 */
	private polarityReading(device: chemlib.ElectricComponent): string {
		if (device._polarity === 0) return this.message("automatisch");
		const pole = chemlib.ComponentManager.terminalElectrode(device, device._polarity > 0 ? 0 : 1);
		if (!pole) return this.message("automatisch");
		return `${this.message("Plus an")} ${this.itemName(pole._type)} · ${pole._id + 1}`;
	}
}
