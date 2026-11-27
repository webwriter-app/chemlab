import { drawerLabels, effectiveLanguage, localize } from "./localization/localization";
import { html, LitElement, noChange, nothing, PropertyValueMap, render } from "lit";
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

import { style } from "./chemlab-style.js";

import * as PIXI from "pixi.js";
import * as chemlib from "./chemlib";
import SmilesDrawer from "smiles-drawer"

import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.component.js";
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
import { dictionary as germanDictionary } from "./data/dictionary";
import { pHColors as phColorScale, pHTextColor } from "./data/phColors";
import { defaultMolecules, defaultMixtures } from "./data/presets";
import { sendXApiStatement } from "./services/xapi";
import { DiagramController } from "./controllers/DiagramController";
import { axisId, componentKey, DiagramSuggestionQueue, selectedDiagramSourceGroups, suggestDiagrams,
	type DiagramAxis, type InstrumentSuggestion, type QueuedDiagramSuggestion } from "./data/diagramSources";
import { TIME_CHANNEL, type MeasurementChannel } from "./data/measurementHistory";
import { MeasurementRecorder } from "./controllers/MeasurementRecorder";
import { SimulationController } from "./controllers/SimulationController";
import { CircuitSchedule } from "./controllers/CircuitSchedule";
import {
	componentGraphic,
	componentVariant,
	componentVariants,
	layoutTextureUrls,
	savedComponentVariant,
	type ComponentVariant,
	type PaletteComponent,
} from "./data/componentGraphics";
import { renderComponentPaletteIcon } from "./data/componentPaletteIcons";
import { chemicalCatalog, chemicalCatalogGroups, solutionDisplayNames, withConcentration, type ChemicalRecipe, type MoleculeDefinition } from "./data/chemicals";
import { loadMoleculeDefinition } from "./data/moleculeDefinition";
import { BUILDER_TAG, worksheetPeers, worksheetPeer, worksheetScope, type BuilderReceiver } from "./molecule-builder/exchange";
import { readStructure, type Structure } from "./molecule-builder/structure";
import { analyzeBuilderCompound, builderRecipes, builderStockFor, enrichBuilderCompound, expectedDissociations,
	hydrateBuilderChemical, pendingBuilderChemicals, portableBuilderChemical, readBuilderChemical,
	type BuilderChemical, type BuilderGap, type CompoundAnalysis, type CompoundFacts } from "./molecule-builder/custom-compounds";
import { reviewIsCurrent } from "./molecule-builder/lookup-guard";
import { iupacSource } from "./chemlib/IupacDissociation";
import { readAqueousAcidBase } from "./chemlib/AcidBase";
import { catalogPreviews } from "./data/chemicalPreviews.generated";
import { DEFAULT_GAS_DOSE_ML, GAS_DOSE_MAX_ML, prepareDose, type DoseRecipe, type SavedDose } from "./data/measuredDose";
import { readSavedMixtures, snapshotMixture, type SavedMixture } from "./data/savedMixtures";
import { vesselCarouselEntries, type VesselPlating } from "./data/vesselCarousel";
import { STANDARD_CANVAS_WIDTH } from "./controllers/WorkspaceCamera";
import { CanvasController } from "./controllers/CanvasController";
import type { VesselHint } from "./controllers/VesselView";
import { guard } from "lit/directives/guard.js";
import { renderValueControl, valueControlStyles } from "./ui/valueControl";
import { INTERFACE_LOCK_OPTIONS, hidesRegion, paletteTab, paletteTabs,
	type InterfaceLockKey, type InterfaceLocks, type PaletteTab } from "./ui/interfaceLocks";
import { cardNeedsFill, runStep, type ObjectCardNodes } from "./ui/objectCard";

type BuilderReview = { structure: Structure; reagent?: string; loading: boolean; analysis?: CompoundAnalysis; facts?: CompoundFacts };
type SelectedChemical = { key: string; name: string; recipe: DoseRecipe };
type ChemicalConcentration = { initial: number; max: number };
type ChemicalPermissionItem = { name: string; concentrationLimit?: number };
const catalogConcentrationLimits = new Map(chemicalCatalog.flatMap(({ name, concentrationLimit }) =>
	concentrationLimit ? [[name, concentrationLimit] as const] : []));

/**
 * Millilitres one dose step covers for a gas.
 *
 * A liquid or solid portion advances in millilitres that the vessel has to
 * have room for; a gas dose is the volume it takes up at lab conditions, so a
 * 1 mL click would be a twentieth of a millimole and show no bubbles at all.
 */
const GAS_DOSE_STEP_ML = 5;

/**
 * Vessel animation a dose asks for. A gas neither falls in as grains nor
 * pours, so it gets no hint and the rising bubbles come from the gas that
 * leaves the solution.
 */
function doseHint(recipe: DoseRecipe): VesselHint | undefined {
	return recipe.phase === "solid" ? "grain" : recipe.phase === "liquid" ? "pour" : undefined;
}

/** Scale of one dose step for a recipe, see {@link GAS_DOSE_STEP_ML}. */
function doseStepMl(recipe: DoseRecipe): number {
	return recipe.phase === "gas" ? GAS_DOSE_STEP_ML : 1;
}

function chemicalConcentration({ concentrationLimit }: ChemicalPermissionItem): ChemicalConcentration | undefined {
	return concentrationLimit ? { initial: Math.min(1, concentrationLimit), max: concentrationLimit } : undefined;
}

function concentrationPresets({ max }: ChemicalConcentration): number[] {
	return [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2].filter((value) => value < max).concat(max);
}
type AmountSource = { name: string; recipe: DoseRecipe; dose: (volumeMl: number) => chemlib.Mixture } |
	{ vessel: chemlib.ChemComponent };

type TransferRoute = { anchor: PIXI.Container; target: chemlib.ChemComponent; from: AmountSource };
type TransferFeedback = TransferRoute & {
	amount: number;
	phase: "arming" | "running" | "limit" | "dose";
	gesture: "drop" | "press";
	progress?: number;
};

const TRANSFER_HOLD_MS = 1500;
const TRANSFER_HOLD_RADIUS = 10;
const PALETTE_DRAG_THRESHOLD = 6;
const DRAG_TRANSFER_TASK = "drag-transfer";
const SURFACE_DISPLACEMENT_TASK = "surface-displacement";
const MIN_TWO_PANELS_WIDTH = 560;
const RC_UPDATE_MS = 50;
const DIAGRAM_PICKER_CLOSE_MS = 2000;
const CUSTOM_CHEMICAL_GROUP = "custom";
const LEGACY_STATE_ATTRIBUTE = "chemlab-state";
const worksheetWrites = new WeakMap<Document, Promise<void>>();
/** A card that carries nothing to derive; the palette passes it as its activation. */
const nothingToHydrate = () => {};

/** What a palette card adds to its shared frame beside the name tag. */
type PaletteCardOptions = {
	/** A chemical card lays out its own body under the preview area. */
	chemical?: boolean;
	/** The permission menu the name tag opens. */
	permissions?: { open: boolean; label: string; toggle: () => void; options: unknown };
	/** Runs when the card is hovered or focused, e.g. to hydrate it. */
	activate?: () => void;
	/** A compact icon beside the name tag, e.g. opening the structure. */
	action?: unknown;
};
const CONTROL_ICONS = {
	power: "M8 2v5m3.2-3.8a5.5 5.5 0 1 1-6.4 0",
	drop: "M8 2.4c1.4 2.2 4 4.5 4 7a4 4 0 1 1-8 0c0-2.5 2.6-4.8 4-7Z",
	play: "M5 3.5 12 8l-7 4.5z",
	stop: "M4 4h8v8H4z",
	cancel: "m4 4 8 8m0-8-8 8",
	fit: "M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4M5.5 5.5h5v5h-5z",
	minus: "M4 8h8",
	confirm: "m3.5 8 3 3 6-6",
	save: "M2.5 2.5h9L14 5v8.5H2.5zM5 2.5v4h5v-4m-5 11v-4h6v4",
};
type RCSettings = NonNullable<chemlib.ElectricComponent["_rcSettings"]>;
type RCReadout = { sample: chemlib.NoIonicPathTransientSample; timeConstant: number; cutoffAt: number };

function isPassiveMeter(device: chemlib.ElectricComponent): boolean {
	const { Ammeter, Multimeter, Voltmeter } = chemlib.EComponentType;
	return device._type === Ammeter || device._type === Multimeter || device._type === Voltmeter;
}

function validRCSettings(value: unknown): value is RCSettings {
	if (!value || typeof value !== "object") return false;
	const { capacitance, seriesResistance, cutoff } = value as RCSettings;
	return Number.isFinite(capacitance) && capacitance > 0 &&
		Number.isFinite(seriesResistance) && seriesResistance >= 0 &&
		(cutoff === undefined || (Number.isFinite(cutoff) && cutoff > 0));
}

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
		interface: { label: { _: "Learner interface", "de-DE": "Oberfläche für Lernende" }, collapsible: true, advanced: false },
		analytics: { label: { _: "xAPI", "de-DE": "xAPI" }, collapsible: true, advanced: true },
	};
	static options = {
		moleculeBuilderId: {
			type: "string" as const, group: "appearance", attribute: "molecule-builder-id",
			label: { _: "Linked Molecule Builder ID", "de-DE": "ID des verknüpften Molekülbaukastens" },
		},
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
		...INTERFACE_LOCK_OPTIONS,
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
	static styles = [style, valueControlStyles];

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
	 * The card nodes the last successful fill wrote into. A card that was
	 * rebuilt, or a fill that never ran, leaves the stored nodes behind and the
	 * next update fills the card again, siehe `cardNeedsFill`.
	 */
	private filledCardNodes?: ObjectCardNodes;
	/** Mixtures whose aqueous solver failed once, so the error is not repeated. */
	private equilibriumFailures = new WeakSet<chemlib.Mixture>();
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
	 * container inside object context menu showing general info on current e-component
	 *
	 * @private
	 * @type {HTMLButtonElement}
	 */
	@query("#contextEchemInfo")
	private accessor contextEchemInfo: HTMLDivElement;
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

	@property({ type: Boolean, reflect: true, attribute: "show-titration-markers" })
	accessor showTitrationMarkers = false;

	/*
	 * Learner locks from the options menu, see `ui/interfaceLocks.ts`. Each one
	 * only takes effect outside the authoring view, so the teacher keeps the
	 * full laboratory while editing.
	 */
	@property({ type: Boolean, reflect: true, attribute: "hide-component-palette" })
	accessor hideComponentPalette = false;
	@property({ type: Boolean, reflect: true, attribute: "hide-chemical-palette" })
	accessor hideChemicalPalette = false;
	@property({ type: Boolean, reflect: true, attribute: "hide-object-actions" })
	accessor hideObjectActions = false;
	@property({ type: Boolean, reflect: true, attribute: "hide-diagram-system" })
	accessor hideDiagramSystem = false;

	private dataObserver?: MutationObserver;
	private savedDataSnapshot: string | null = null;
	private authoredWriteQueued = false;
	private refreshFromRemoteData = false;
	/**
	 * the layout the widget was embedded with, kept for the learner's reset
	 *
	 * @private
	 */
	private startingLayout?: object[];

	/**
	 * list of all sprites of available components
	 *
	 * @private
	 * @type {Array<[PIXI.Container, number]>}
	 */
	@property({ attribute: false })
	accessor avComponentsSprites: Array<[PIXI.Container, number]> = [];
	/**
	 * controller owning all Chart.js diagrams
	 *
	 * @type {DiagramController}
	 */
	readonly measurements = new MeasurementRecorder(this);
	diagrams = new DiagramController(this);
	/**
	 * controller owning the PixiJS ticker system (loop + registered functions)
	 *
	 * @type {SimulationController}
	 */
	simulation = new SimulationController(this);
	/**
	 * the one clock per physical circuit that advances its chemistry
	 *
	 * @type {CircuitSchedule}
	 */
	readonly circuits = new CircuitSchedule(
		this.simulation,
		() => this.activeInstruments(),
		(device) => this.circuitIdentity(device),
		(device) => this.advanceCircuit(device),
	);
	private readonly surfaceElectrodes = new Set<chemlib.ElectricComponent>();
	private readonly capacitorCharges = new Map<string, number>();
	private readonly rcReadouts = new Map<chemlib.ElectricComponent, RCReadout>();
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
	@state()
	private accessor canvasLoading: { value: number; task: string; restored?: number; total?: number } | undefined = {
		value: 0, task: "Grafik vorbereiten",
	};
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
	@state() private accessor diagramPickerOpen = false;
	@state() private accessor diagramDismissedOpen = false;
	private diagramPickerListeners?: AbortController;
	private diagramPickerCloseTimer?: ReturnType<typeof setTimeout>;
	private readonly diagramMenus = new Set<HTMLElement>();
	private diagramChannelVersion = 0;
	private readonly suggestionQueue = new DiagramSuggestionQueue();
	private diagramX = "";
	private diagramY = "";
	@state() private accessor teacherDrawerOpen = false;
	private teacherDrawerChoice?: boolean;
	private workspaceResizeObserver?: ResizeObserver;
	private workspaceClassObserver?: MutationObserver;
	private selectVisibilityObserver?: IntersectionObserver;
	@state() private accessor teacherTab: "components" | "chemicals" = "components";
	@property({ type: String, attribute: "molecule-builder-id", reflect: true }) accessor moleculeBuilderId = "";
	@state() private accessor builderAvailable = false;
	private observeBuilder?: MutationObserver;
	@state() private accessor builderReview: BuilderReview | undefined;
	@state() private accessor builderTarget: { key?: string; structure?: Structure } | undefined;
	@state() private accessor builderReferences: BuilderChemical[] = [];
	@state() private accessor sessionBuilderReferences: BuilderChemical[] = [];
	/** guards the deferred analysis of saved compounds against a second round */
	private builderHydrating = false;
	@state() private accessor savedVesselMixtures: SavedMixture[] = [];
	@state() private accessor sessionVesselMixtures: SavedMixture[] = [];
	@state() private accessor mixtureDraft: { vessel: chemlib.ChemComponent; name: string } | undefined;

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
	} | undefined;
	private amountMenuObserver?: ResizeObserver;
	@state() private accessor transferFeedback: TransferFeedback | undefined;
	private amountFormatLanguage?: string;
	private amountFormatters = new Map<number, Intl.NumberFormat>();
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
			fromAttribute: (value: string) => {
				if (value === "true") {
					return true;
				}
					return value === "";
			},
			toAttribute: (value: boolean) => {
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
	/** Allocated on first use by the selected vessel's structure thumbnails. */
	private smilesDrawer100?: InstanceType<typeof SmilesDrawer.SvgDrawer>;

	@property({ type: Number, reflect: true })
	private accessor newSmilesDrawer: number = 1;

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
			"sl-button-group": SlButtonGroup,
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
		const updateBuilder = () => {
			const available = worksheetPeers(this, BUILDER_TAG).length > 0;
			if (available === this.builderAvailable) return;
			this.builderAvailable = available;
			if (this.curr_obj) void this.updateComplete.then(() => this._updatePopup());
		};
		updateBuilder();
		this.observeBuilder = new MutationObserver(records => {
			const containsBuilder = (node: Node) => node instanceof Element
				&& (node.localName === BUILDER_TAG || node.querySelector(BUILDER_TAG));
			if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(containsBuilder))) updateBuilder();
		});
		this.observeBuilder.observe(worksheetScope(this), { childList: true, subtree: true });
		this.dataObserver = new MutationObserver(() => this.readAuthoredData());
		this.dataObserver.observe(this, {
			childList: true, characterData: true, subtree: true, attributes: true,
			attributeFilter: [LEGACY_STATE_ATTRIBUTE, "slot", "type"],
		});
		this.readAuthoredData();
		this.observeWorkspaceLayout();
	}

	disconnectedCallback(): void {
		this.amountMenuObserver?.disconnect();
		this.observeBuilder?.disconnect();
		this.observeBuilder = undefined;
		this.closeDiagramPicker();
		this.stopDose?.();
		this.cancelDoseForNavigation();
		this.closeAmountMenu();
		this.hideTransferFeedback();
		this.workspaceResizeObserver?.disconnect();
		this.workspaceResizeObserver = undefined;
		this.workspaceClassObserver?.disconnect();
		this.workspaceClassObserver = undefined;
		this.selectVisibilityObserver?.disconnect();
		this.selectVisibilityObserver = undefined;
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
			this.closeDiagramPicker();
		}
		const width = this.containerDiv.clientWidth;
		const panelMax = parseFloat(getComputedStyle(this.ownerDocument.documentElement).fontSize) * 24;
		const diagramWidth = this.diagramPanelAvailable && this.diagramPanelOpen ? Math.min(width * 0.44, panelMax) : 0;
		this.teacherDrawerOpen = this.teacherDrawerChoice ?? (width >= STANDARD_CANVAS_WIDTH + panelMax + diagramWidth);
		if (width < MIN_TWO_PANELS_WIDTH && this.#paletteOpen && this.diagramPanelAvailable) {
			this.diagramPanelOpen = false;
		}
		for (const select of this.containerDiv.querySelectorAll<SlSelect>("sl-select[open]")) {
			select.popup.reposition();
		}
	}

	protected updated(changed: PropertyValueMap<any>): void {
		super.updated(changed);
		if (!this.canAuthor || changed.has("invComponents") || changed.has("chemicalPermissions")) this.permissionTooltip = undefined;
		if (["contentEditable", "availableMolecules", "availableMixtures", "availableComponents", "invComponents", "chemicalPermissions", "savedVesselMixtures"].some((name) => changed.has(name))) {
			runStep("save the worksheet state", () => this.persistAuthoredData());
		}
		if (this.#paletteOpen && this.#paletteTab === "chemicals") {
			runStep("prepare the builder chemicals", () => this.startBuilderHydration());
		}
		if (this.app && !this.canvasLoading && this.refreshFromRemoteData) {
			this.refreshFromRemoteData = false;
			runStep("rebuild the authored layout", () => {
				if (changed.has("availableComponents")) {
					// A layout replaced in the worksheet is the configuration the
					// learner's reset returns to.
					this.rememberStartingLayout();
					this.rebuildAuthoredLayout();
				}
			});
		}
		if (this.canvas.selectedObjects.length || changed.has("curr_obj") || changed.has("curr_name") || changed.has("mixtureDraft")) {
			runStep("redraw the selection", () => this.canvas.drawSelection());
		}
		if (changed.has("amountMenu") || changed.has("transferFeedback")) {
			const targetChanged = (changed.has("amountMenu") && changed.get("amountMenu")?.anchor !== this.amountMenu?.anchor)
				|| (changed.has("transferFeedback") && changed.get("transferFeedback")?.anchor !== this.transferFeedback?.anchor);
			runStep("place the amount menu", () => {
				if (targetChanged && this.app) this.canvas.drawSelection();
				else this.positionAmountMenu();
			});
		}
		// The card heading comes from the template, its contents from the
		// imperative fill. A selection change fills it after the render, and so
		// does a card whose nodes were rebuilt or a fill that never ran, so a
		// visible card never lacks its contents. The steps above run through
		// runStep because this fill is the last thing the update does: a failing
		// housekeeping step in the authoring view would otherwise leave the card
		// with its heading and nothing below it.
		const card = this.curr_obj && !this.#hides("hideObjectActions")
			? { echem: this.contextEchemInfo, carousel: this.contextMolInfo, summary: this.contextMixInfo }
			: undefined;
		if (cardNeedsFill(changed.has("curr_obj") || changed.has("curr_name"), card, this.filledCardNodes)) {
			this._updatePopup();
		}
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
		this.builderReferences = Array.isArray(value.builderReferences)
			? value.builderReferences.slice(0, 30).map(readBuilderChemical).filter(Boolean) : [];
		this.savedVesselMixtures = readSavedMixtures(value.savedVesselMixtures);

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
		// A document saved by the previous build can have a newer snapshot in
		// the attribute than in its script. Migrate it on the next author save.
		const raw = this.getAttribute(LEGACY_STATE_ATTRIBUTE) ?? this.dataBlock()?.textContent;
		if (raw == null || raw === this.savedDataSnapshot) return;
		try {
			const value = JSON.parse(raw);
			if (!value || typeof value !== "object") return;
			const incoming = JSON.stringify({
				layoutScale: 1,
				availableMolecules: value.availableMolecules ?? this.availableMolecules,
				availableMixtures: value.availableMixtures ?? this.availableMixtures,
				availableComponents: value.availableComponents ?? this.availableComponents,
				invComponents: value.invComponents ?? this.invComponents,
				chemicalPermissions: value.chemicalPermissions ?? this.chemicalPermissions,
				...(Array.isArray(value.builderReferences) && value.builderReferences.length ? { builderReferences: value.builderReferences } : {}),
				...(Array.isArray(value.savedVesselMixtures) && value.savedVesselMixtures.length ? { savedVesselMixtures: value.savedVesselMixtures } : {}),
			});
			if (incoming === this.savedDataSnapshot) return;
			this.refreshFromRemoteData = this.hasUpdated;
			this.applyAuthoredData(value);
			this.savedDataSnapshot = this.serializeAuthoredData();
		} catch (error) {
			console.error("Unable to read the saved chemistry lab state", error);
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
			...(this.builderReferences.length ? { builderReferences: this.builderReferences.map(portableBuilderChemical) } : {}),
			...(this.savedVesselMixtures.length ? { savedVesselMixtures: this.savedVesselMixtures } : {}),
		});
	}

	private persistAuthoredData() {
		if (!this.isConnected || !this.canAuthor || this.authoredWriteQueued) return;
		const document = this.ownerDocument;
		this.authoredWriteQueued = true;
		// Let the editor's MutationObserver record one widget's replacement
		// before another widget in the same document changes its script.
		const previous = worksheetWrites.get(document) ?? Promise.resolve();
		worksheetWrites.set(document, previous.then(() => {
			this.authoredWriteQueued = false;
			if (this.ownerDocument === document) runStep("write the JSON data slot", () => this.writeAuthoredData());
		}));
	}

	private writeAuthoredData() {
		if (!this.isConnected || !this.canAuthor) return;
		const snapshot = this.serializeAuthoredData();
		const existing = this.dataBlock();
		if (snapshot === this.savedDataSnapshot && existing && !this.hasAttribute(LEGACY_STATE_ATTRIBUTE)) return;
		// A different revision makes WebWriter replace the script as a whole.
		// Editing its text causes the editor to treat JSON as document text.
		const block = this.ownerDocument.createElement("script");
		block.type = "application/json";
		block.slot = "data";
		block.dataset.chemlabRevision = String((Number(existing?.dataset.chemlabRevision) || 0) + 1);
		// Some WebWriter versions collapse repeated spaces in script text.
		// The snapshot is compact JSON, so space runs belong to string values.
		block.textContent = snapshot.replace(/</g, "\\u003c").replace(/ {2,}/g, spaces => "\\u0020".repeat(spaces.length));
		this.savedDataSnapshot = snapshot;
		if (existing) existing.replaceWith(block);
		else this.append(block);
		this.removeAttribute(LEGACY_STATE_ATTRIBUTE);
		for (const name of ["availablemolecules", "availablemixtures", "availablecomponents", "invcomponents"]) this.removeAttribute(name);
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
			await this.paintLoadingProgress();
			await this.canvas.init(layoutTextureUrls(this.availableComponents), (fraction) => {
				this.canvasLoading = { value: 10 + 15 * fraction, task: "Gerätegrafiken laden" };
			});
			await this.restoreInitialLayout();
			this.canvas.fitObjects();
			this.canvas.flushChanges();
			this.app.render();
			this.simulation.startLoop(() => this.canvas.flushChanges());
			this._sendxAPiStatement("registered", "chemlab");
		} catch (error) {
			console.error("Unable to initialize the Chemlab canvas", error);
			this._notify(this.message("Die Arbeitsfläche konnte nicht geladen werden."));
		} finally {
			this.canvasLoading = undefined;
		}
	}

	private paintLoadingProgress(): Promise<void> {
		const view = this.ownerDocument.defaultView;
		// Yield past a paint when visible, with a timer fallback for hidden embeds.
		return new Promise(resolve => {
			if (this.ownerDocument.hidden) {
				view.setTimeout(resolve, 0);
				return;
			}
			const afterPaint = view.setTimeout(() => {
				view.cancelAnimationFrame(frame);
				resolve();
			}, 40);
			const frame = view.requestAnimationFrame(() => {
				view.clearTimeout(afterPaint);
				view.setTimeout(resolve, 0);
			});
		});
	}

	private async restoreInitialLayout(): Promise<void> {
		// Prepare the models off the stage so the authored layout can be replaced
		// during loading without leaving partially restored devices on screen.
		for (;;) {
			this.refreshFromRemoteData = false;
			const entries = this.availableComponents;
			const models = new Map<object, chemlib.ChemComponent | chemlib.ElectricComponent>();
			const total = entries.length;
			if (total) {
				const reportRestored = (restored: number) => {
					this.canvasLoading = { value: 25 + 60 * restored / total, task: "Gespeicherte Geräte vorbereiten", restored, total };
					return this.paintLoadingProgress();
				};
				await reportRestored(0);
				let sliceStarted = performance.now();
				for (const entry of entries) {
					if (this.refreshFromRemoteData) break;
					models.set(entry, this.createSavedComponent(entry));
					if (models.size < total && performance.now() - sliceStarted >= 24) {
						await reportRestored(models.size);
						sliceStarted = performance.now();
					}
				}
				if (this.refreshFromRemoteData) continue;
			}
			this.canvasLoading = { value: 90, task: total ? "Versuchsaufbau und Verbindungen einsetzen" : "Arbeitsfläche zeichnen" };
			await this.paintLoadingProgress();
			// The startup load covers the layout as it was embedded. A layout
			// replaced from the worksheet while loading brings devices whose
			// textures nobody has asked for yet; a graphic that fails here costs
			// its own device, not the canvas.
			try {
				await this.canvas.loadTextures(layoutTextureUrls(entries));
			} catch (error) {
				console.error("Unable to load the component textures", error);
			}
			if (this.refreshFromRemoteData) continue;
			this.rememberStartingLayout();
			this._loadComponents(undefined, models);
			return;
		}
	}

	/**
	 * Keeps the embedded layout as the configuration a learner returns to.
	 * Learners append their own devices to `availableComponents`, so the live
	 * field is no starting point.
	 */
	private rememberStartingLayout(): void {
		this.startingLayout = JSON.parse(JSON.stringify(this.availableComponents)) as object[];
	}

	/**
	 * Rebuilds the stage from `availableComponents`. A layout replaced in the
	 * worksheet and the learner's reset share this path, so the two cannot
	 * drift apart.
	 */
	private rebuildAuthoredLayout(): void {
		this.stopDose?.();
		this.cancelDoseForNavigation();
		this.closeAmountMenu();
		this.hideTransferFeedback();
		this.simulation.stopExperiments();
		this.circuits.clear();
		this.capacitorCharges.clear();
		this.rcReadouts.clear();
		this.curr_obj = null;
		this.curr_name = "";
		this.curr_stage_index = -1;

		this.measurements.retire([...this.allChemComponents, ...this.allEComponents]);
		this.canvas.clearSprites();
		this.allChemComponents = [];
		this.allEComponents = [];
		this.pruneDiagramSuggestions();

		this.avComponentsSprites = [];
		// A replaced layout is a fresh load: it brings devices the startup
		// load never saw, and it gets the same fit as the first one.
		void this.canvas.loadTextures(layoutTextureUrls(this.availableComponents)).catch((error) => {
			console.error("Unable to load the component textures", error);
		}).then(() => {
			if (!this.isConnected || !this.app) return;
			this._loadComponents();
			this.canvas.fitObjects();
		});
	}

	/**
	 * Returns the canvas to the layout the widget was embedded with. This is
	 * the learner's way back after trying things out; authoring keeps its own
	 * history in the worksheet, so the button only appears outside it. The
	 * measurements and diagrams of the abandoned run go with it, because their
	 * sources no longer exist.
	 */
	resetCanvas(): void {
		if (this.canAuthor || !this.app || this.canvasLoading || !this.startingLayout) return;
		this.closeDiagramPicker();
		this.diagrams.clear();
		this.measurements.clear();
		this.suggestionQueue.clear();
		this.clearObjectSelection();
		this.availableComponents = JSON.parse(JSON.stringify(this.startingLayout)) as object[];
		this.rebuildAuthoredLayout();
		this.requestUpdate();
		this._sendxAPiStatement("started", "chemlab");
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

	/** Transfers one titration dose to the receiving vessel. */
	private stepTitration(source: chemlib.ChemComponent): boolean {
		if (!source._content._activeMolecules.length) return false;
		const target = this.canvas.titrationTarget(source);
		if (!target) return false;
		const transferredMl = source.transferContents({}, target) * 1000;
		if (!(transferredMl > 0)) return false;
		const equilibria = this.measurements.record([source, target], [], { source, target, volume: transferredMl });
		this.canvas.markVesselChanged(source);
		this.canvas.markVesselChanged(target);
		if (this.curr_obj === source || this.curr_obj === target) this._updatePopup(equilibria.get(this.curr_obj._content));
		return true;
	}

	/**
	 * Advances a connected electrochemical experiment by one simulation step.
	 * The circuit clock calls this once per circuit and step; a live
	 * transient is kept out by {@link advanceCircuit}.
	 */
	private stepElectrochemistry(source: chemlib.ElectricComponent): void {
		const circuitComps = this.operatingCircuit(source);
		if (circuitComps) {
			const [first, second, ...devices] = circuitComps;
			const firstMix = first._connectedMix;
			const secondMix = second._connectedMix;
			const bridge = this.bridgeBetween(firstMix, secondMix);
			const cell = this.rcCellKey(first, second);
			// Only a cell with stored RC charge needs the resistance before the
			// step. Normal runs derive it from the same bath views as the solve.
			const ionicResistance = this.capacitorCharges.has(cell)
				? chemlib.Simulation.ionicResistance(first, second, bridge) : undefined;
			if (Number.isFinite(ionicResistance)) this.capacitorCharges.delete(cell);
			chemlib.Simulation.sEChem(first, second, devices, { bridge, ionicResistance });

			const vessels = this.allChemComponents.filter(vessel => vessel._content === firstMix || vessel._content === secondMix);
			const equilibria = this.measurements.record(vessels, circuitComps);
			for (const vessel of vessels) this.canvas.markVesselChanged(vessel);
			if (circuitComps.includes(this.curr_obj) ||
				this.curr_obj?._content === firstMix || this.curr_obj?._content === secondMix) {
				this._updatePopup(equilibria.get(this.curr_obj?._content));
			}
			// The electrodes carry the deposit, so their views need a redraw too.
			for (const device of circuitComps) this.canvas.refreshDeviceDisplay(device);
			return;
		}
		// A supply wired straight into a meter carries no cell, so the cell
		// solve has nothing to work on; the network is still driven.
		const network = this.meterCircuit(source);
		if (network) {
			chemlib.Simulation.sCircuit(network);
			this.measurements.record([], network);
			for (const device of network) this.canvas.refreshDeviceDisplay(device);
			if (network.includes(this.curr_obj)) this._updatePopup();
		} else this.clearEChemReadings(source);
		this.canvas.refreshDeviceDisplay(source);
	}

	queueSurfaceDisplacement(electrode: chemlib.ElectricComponent): void {
		if (!chemlib.Simulation.canDisplaceOn(electrode)) {
			if (this.surfaceElectrodes.delete(electrode) && !this.surfaceElectrodes.size) {
				this.simulation.stopTask(SURFACE_DISPLACEMENT_TASK);
			}
			return;
		}
		this.surfaceElectrodes.add(electrode);
		if (!this.simulation.hasTask(SURFACE_DISPLACEMENT_TASK)) {
			this.simulation.startFixedStepTask(SURFACE_DISPLACEMENT_TASK, () => this.stepSurfaceDisplacement());
		}
	}

	private stepSurfaceDisplacement(): void {
		const mixtures = new Set<chemlib.Mixture>();
		let updateSelection = false;
		for (const electrode of this.surfaceElectrodes) {
			if (!this.allEComponents.includes(electrode) || !chemlib.Simulation.sSurfaceDisplacement(electrode)) {
				this.surfaceElectrodes.delete(electrode);
				continue;
			}
			mixtures.add(electrode._connectedMix);
			updateSelection ||= this.curr_obj === electrode;
			this.canvas.refreshDeviceDisplay(electrode);
		}
		if (!this.surfaceElectrodes.size) this.simulation.stopTask(SURFACE_DISPLACEMENT_TASK);
		if (!mixtures.size) return;
		const vessels = this.allChemComponents.filter(vessel => mixtures.has(vessel._content));
		const equilibria = this.measurements.record(vessels);
		for (const vessel of vessels) this.canvas.markVesselChanged(vessel);
		if (updateSelection || mixtures.has(this.curr_obj?._content)) {
			this._updatePopup(equilibria.get(this.curr_obj?._content));
		}
	}

	private ionicResistance(first: chemlib.ElectricComponent, second: chemlib.ElectricComponent): number {
		return chemlib.Simulation.ionicResistance(first, second,
			this.bridgeBetween(first._connectedMix, second._connectedMix));
	}

	private hasRCReadout(device: chemlib.ElectricComponent): boolean {
		return this.rcReadouts.has(device) && this.simulation.hasTask("echem" + device._type + ":" + device._id);
	}

	private rcCellKey(first: chemlib.ElectricComponent, second: chemlib.ElectricComponent): string {
		return [first, second].sort((a, b) => a._id - b._id)
			.map(electrode => `${electrode._id}/${electrode._connectedMix?._id}`).join(":");
	}

	/** The instruments that are switched on right now, one marker each. */
	private activeInstruments(): chemlib.ElectricComponent[] {
		return this.allEComponents.filter((device) =>
			(device._type === chemlib.EComponentType.Source || isPassiveMeter(device)) &&
			this.simulation.hasTask(`echem${device._type}:${device._id}`));
	}

	/**
	 * The physical circuit a device belongs to, as a value that changes when
	 * the wiring does: the members it reaches and the vessel each of them
	 * dips into. A moved electrode, a new lead or a placed bridge re-keys the
	 * circuit, and its clock starts a fresh phase.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} device - a device of the circuit
	 * @returns {?string} the identity, or undefined for a device that hangs in nothing
	 */
	private circuitIdentity(device: chemlib.ElectricComponent): string | undefined {
		const members = chemlib.ComponentManager.connectedDevices(device);
		if (members.length < 2) return undefined;
		return members.map((member) => `${member._type}:${member._id}/${member._connectedMix?._id ?? ""}`)
			.sort().join(",");
	}

	/**
	 * One simulation step of a circuit, driven by its clock instead of by
	 * every instrument that hangs in it. A live transient books its own
	 * analytic readings, so the chemistry waits for it.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} device - an active instrument of the circuit
	 */
	private advanceCircuit(device: chemlib.ElectricComponent): void {
		if (chemlib.ComponentManager.connectedDevices(device).some((member) => this.hasRCReadout(member))) return;
		this.stepElectrochemistry(device);
	}

	/**
	 * Brings the circuit clocks in line with the instruments that are
	 * switched on. Called whenever a lead, a bridge, a device or an
	 * instrument changes, so a clock never outlives the circuit it belongs
	 * to.
	 */
	reconcileCircuits(): void {
		this.circuits.reconcile();
	}

	private startElectricalExperiment(name: string, meter: chemlib.ElectricComponent): void {
		if (!isPassiveMeter(meter) || !meter.rcSettings) {
			this.simulation.markRunning(name);
			this.circuits.reconcile();
			return;
		}

		let sinceRefresh = RC_UPDATE_MS;
		let circuitKey: string | undefined;
		let active: {
			cell: string;
			devices: chemlib.ElectricComponent[];
			model: chemlib.NoIonicPathTransientModel;
			readMeters: (sample: chemlib.NoIonicPathTransientSample) => void;
			elapsed: number;
			advanceRecording: (elapsed: number) => void;
			cutoffAt: number;
			settled?: boolean;
		} | undefined;

		this.simulation.markRunning(name, (elapsedMs) => {
			if (active && !active.settled) {
				active.elapsed += elapsedMs / 1000;
				active.advanceRecording(active.elapsed);
				this.capacitorCharges.set(active.cell, active.model.at(active.elapsed).charge);
			}
			sinceRefresh += elapsedMs;
			if (sinceRefresh < RC_UPDATE_MS) return !!active;
			sinceRefresh %= RC_UPDATE_MS;

			const circuit = this.operatingCircuit(meter);
			const electrodes = circuit?.slice(0, 2).sort((a, b) => a._id - b._id);
			const [first, second] = electrodes ?? [];
			const cell = first && second ? this.rcCellKey(first, second) : undefined;
			const resistance = first && second ? this.ionicResistance(first, second) : undefined;
			const config = meter.rcSettings;
			const devices = circuit?.slice(2) ?? [];
			const powered = devices.some((device) => device._type === chemlib.EComponentType.Source);
			if (!active && devices.some((device) => device !== meter && this.hasRCReadout(device))) {
				circuitKey = undefined;
				return true;
			}
			const key = cell && config && resistance === Infinity && !powered
				? JSON.stringify([cell, config, chemlib.ComponentManager.connectedDevices(meter).map(device =>
					[device._id, device._meterMode, device._connections.map(post => post.map(partner => partner._id))])])
				: undefined;
			if (key !== circuitKey) {
				circuitKey = key;
				if (active) {
					for (const device of active.devices) {
						device._visibleCurrent = null;
						device._visibleVoltage = null;
						device._cellCurrent = null;
						this.canvas.refreshDeviceDisplay(device);
					}
					this.measurements.record([], active.devices);
				}
				active = undefined;
				this.rcReadouts.delete(meter);
				if (this.curr_obj === meter) this._updatePopup();
				if (key && cell && config) {
					const prepared = chemlib.Simulation.prepareNoIonicPathTransient(first, second, devices, resistance,
						{ ...config, initialCharge: this.capacitorCharges.get(cell) });
					if (prepared) {
						const { model } = prepared;
						const cutoff = config.cutoff ?? Math.max(Number.MIN_VALUE, Math.abs(model.initialCurrent) * 0.01);
						active = { ...prepared, cell, devices, elapsed: 0, cutoffAt: model.timeToCutoff(cutoff),
							advanceRecording: this.measurements.startTransient(model, prepared.meterFactors) };
					}
				}
			}
			if (!active) {
				if (cell && resistance !== undefined && Number.isFinite(resistance)) this.capacitorCharges.delete(cell);
				return false;
			}

			if (!active.settled) {
				const sample = active.model.at(active.elapsed);
				active.readMeters(sample);
				this.measurements.record([], active.devices);
				active.settled = sample.current === 0 || active.elapsed / active.model.timeConstant >= 40;
				this.rcReadouts.set(meter, {
					sample, timeConstant: active.model.timeConstant, cutoffAt: active.cutoffAt,
				});
				for (const device of active.devices) this.canvas.refreshDeviceDisplay(device);
				if (this.curr_obj === meter) this._updatePopup();
			}
			return true;
		});
		this.circuits.reconcile();
	}

	/**
	 * The devices of a network that carries no cell: a supply wired straight
	 * into a meter.
	 *
	 * {@link chemlib.Simulation.sEChem} needs two electrodes, so a circuit
	 * without them is read by {@link chemlib.Simulation.sCircuit} instead. A
	 * network that carries an electrode is left to the cell solve, and one
	 * without a supply has nothing to measure.
	 */
	private meterCircuit(device: chemlib.ElectricComponent): chemlib.ElectricComponent[] | undefined {
		const connected = chemlib.ComponentManager.connectedDevices(device);
		if (connected.some((component) => component._type === chemlib.EComponentType.Electrode)) return undefined;
		if (!connected.some((component) => component._type === chemlib.EComponentType.Source)) return undefined;
		const meters = connected.filter((component) =>
			component._type === chemlib.EComponentType.Voltmeter ||
			component._type === chemlib.EComponentType.Ammeter ||
			component._type === chemlib.EComponentType.Multimeter);
		return meters.length ? connected : undefined;
	}

	private operatingCircuit(device: chemlib.ElectricComponent): chemlib.ElectricComponent[] | undefined {
		const circuit = chemlib.ComponentManager.isCircuit(device);
		if (circuit.length < 3 || !circuit.slice(2).includes(device)) return undefined;
		// Every electrode reaches the cell through the vessel it dips into, a
		// reference included: it senses the potential through that contact.
		if (!circuit.slice(0, 2).every((electrode) =>
			electrode._type === chemlib.EComponentType.Electrode &&
			electrode._connectedMix?._isSolution)) return undefined;
		return circuit;
	}

	/**
	 * The salt bridge on the canvas that joins the two half-cells of a
	 * circuit, if there is one. The bridge carries no cable, so its two legs
	 * decide: it has to dip into both vessels for the ionic current to close
	 * the cell. The bridge itself is returned because its length and bore
	 * decide how well it conducts.
	 */
	private bridgeBetween(first?: chemlib.Mixture, second?: chemlib.Mixture): chemlib.ElectricComponent | undefined {
		if (!first || !second || first === second) return undefined;
		return this.allEComponents.find((device) =>
			device._type === chemlib.EComponentType.Bridge &&
			device._bridgeMixes.includes(first) && device._bridgeMixes.includes(second));
	}

	/**
	 * The current the cell between the two electrodes carries, in ampere.
	 * A supply that also feeds a lead laid across the electrodes delivers
	 * more than the cell takes, and the law of Faraday is about what happens
	 * at the electrodes, not about what leaves the supply.
	 */
	private cellCurrent(source: chemlib.ElectricComponent): number {
		const ticker = `echem${source._type}:${source._id}`;
		return this.simulation.hasTask(ticker) && this.operatingCircuit(source)
			? Math.abs(source._cellCurrent ?? 0) : 0;
	}

	/**
	 * Clears the readings a stopped experiment left behind. The cell solve
	 * writes the voltage and the current of every device in the circuit, not
	 * only of the one that was switched on, so the meters would otherwise keep
	 * showing the last value they saw.
	 */
	private clearEChemReadings(source: chemlib.ElectricComponent): void {
		this.rcReadouts.delete(source);
		const devices = chemlib.ComponentManager.connectedDevices(source);
		if (devices.some((device) => this.hasRCReadout(device))) return;
		this.invalidateElectricalReadings(devices);
	}

	invalidateElectricalReadings(devices: readonly chemlib.ElectricComponent[]): void {
		for (const device of devices) {
			this.queueSurfaceDisplacement(device);
			this.rcReadouts.delete(device);
			device._cellCurrent = null;
			if (device._visibleVoltage === null && device._visibleCurrent === null) continue;
			device._visibleVoltage = null;
			device._visibleCurrent = null;
			this.canvas.refreshDeviceDisplay(device);
		}
		this.measurements.record([], devices);
	}

	get canAuthor(): boolean {
		const editable = this.getAttribute("contenteditable");
		return editable === "" || editable === "true";
	}

	get #interfaceLocks(): InterfaceLocks {
		return {
			hideComponentPalette: this.hideComponentPalette,
			hideChemicalPalette: this.hideChemicalPalette,
			hideObjectActions: this.hideObjectActions,
			hideDiagramSystem: this.hideDiagramSystem,
		};
	}

	/** The palette tabs this viewer keeps, in the order they appear. */
	get #paletteTabs(): PaletteTab[] {
		return paletteTabs(this.#hides("hideComponentPalette"), this.#hides("hideChemicalPalette"));
	}

	/**
	 * The tab the opened palette shows, or `undefined` when both palette locks
	 * apply. Every reader asks here, so drawer, label and hydration agree.
	 */
	get #paletteTab(): PaletteTab | undefined {
		return paletteTab(this.teacherTab, this.#hides("hideComponentPalette"), this.#hides("hideChemicalPalette"));
	}

	/** Whether the palette is on screen: opened, and holding at least one tab. */
	get #paletteOpen(): boolean {
		return this.teacherDrawerOpen && this.#paletteTab !== undefined;
	}

	/** Whether a locked region is taken away from this viewer. */
	#hides(region: InterfaceLockKey): boolean {
		return hidesRegion(region, this.#interfaceLocks, this.canAuthor);
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
		const graphicUrl = componentGraphic(variant.type, variant.id).url;
		// The ghost is built on the first move past the drag threshold, which is
		// a few pixels away: the texture has to be on its way before that.
		this.prefetchComponentTexture(variant);
		let preview: PIXI.Container | undefined;
		this.startPaletteDrag(event, {
			start: () => {
				// A preview draws the texture, so a device whose graphic has not
				// arrived yet is dropped without a ghost rather than as an empty
				// frame. The drop itself waits for the download.
				if (!this.canvas.hasTexture(graphicUrl)) return;
				preview = this.canvas.createPlacementPreview(this.previewModel(variant));
			},
			move: (pointer) => {
				if (!preview) return;
				const point = this.canvas.worldPointFromViewport(pointer.clientX, pointer.clientY);
				preview.visible = !!point;
				if (point) {
					preview.position.copyFrom(this.canvas.freePlacement(preview, point.x, point.y));
				}
				this.requestCanvasRender();
			},
			drop: (pointer) => {
				const point = this.canvas.worldPointFromViewport(pointer.clientX, pointer.clientY);
				if (point) void this.addPaletteComponent(variant, point.x, point.y);
			},
			cleanup: () => {
				if (!preview) return;
				preview.destroy({ children: true });
				this.requestCanvasRender();
			},
		});
	}

	/**
	 * Warms the texture of a palette variant, so the drag ghost can be drawn as
	 * soon as the gesture starts. The startup load covers the authored layout
	 * only; a device from the palette arrives here first.
	 *
	 * @private
	 * @param {ComponentVariant} variant - the palette variant
	 */
	private prefetchComponentTexture(variant: ComponentVariant): void {
		if (!this.app) return;
		void this.canvas.loadTexture(componentGraphic(variant.type, variant.id).url).catch((error) => {
			console.error("Unable to load the component texture of", variant.id, error);
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
		if (variant.ends) device._cableEnds = [...variant.ends];
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
		const preview = this.canvas.createPlacementPreview(this.previewModel(variant));
		const position = this.canvas.freePlacement(preview, x, y);
		preview.destroy({ children: true });
		return position;
	}

	/**
	 * Places the variant the palette holds, if one is held. The answer is
	 * synchronous because the caller decides between placing and panning; the
	 * placement itself waits for the texture of the variant and finishes on its
	 * own.
	 *
	 * @param {number} x - the world x of the click
	 * @param {number} y - the world y of the click
	 * @returns {boolean} whether a placement was started
	 */
	placeSelectedComponent(x: number, y: number): boolean {
		const variant = componentVariant(this.componentToPlace);
		this.componentToPlace = undefined;
		if (!variant || (!this.canAuthor && !this.isVariantAllowed(variant))) return false;
		void this.addPaletteComponent(variant, x, y);
		return true;
	}

	private async addPaletteComponent(variant: ComponentVariant, x: number, y: number): Promise<boolean> {
		if (!this.canAuthor && !this.isVariantAllowed(variant)) return false;
		const { id: variantId, type, capacityMl, material } = variant;
		try {
			// The footprint is measured on a preview and the view draws the
			// texture, so both need the graphic of this variant.
			await this.canvas.loadTexture(componentGraphic(type, variantId).url);
		} catch (error) {
			console.error("Unable to load the component texture of", variantId, error);
			return false;
		}
		// The widget may have been detached while the graphic was on its way.
		if (!this.isConnected || !this.app) return false;
		const position = this.freePlacementFor(variant, x, y);
		this.componentToPlace = undefined;
		this.clearChemicalSelection();
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
				if (variant.ends) device._cableEnds = [...variant.ends];
				this.allEComponents.push(device);
				component = device;
			}
			const sprite = this.canvas.addComponentView(component);
			sprite.position.copyFrom(position);
			if (component instanceof chemlib.ElectricComponent) {
				this.canvas.attachDevice(component, sprite);
				this.measurements.record([], [component]);
			} else this.measurements.record([component]);
			return true;
		}
		const entry = {
			type, variantId, pos: [position.x, position.y], capacityMl, vol: 0, content: "",
			voltage: 0, current: 0, material: "", connections: [], labelText: "",
			// A reference electrode brings its potential with it, so the
			// authored entry has to carry it or the restore loses it.
			reference: variant.reference,
			// A cable carries the plug on each end and where a free end lies,
			// so a lead that was laid out before it was wired comes back as it
			// was left.
			ends: variant.ends,
			offsets: variant.ends ? [[-12, 0], [12, 0]] : undefined,
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

	private buildDose(recipe: DoseRecipe) {
		return prepareDose(recipe, loadMoleculeDefinition);
	}

	private hideTransferFeedback(): void {
		this.ownerDocument.defaultView?.clearTimeout(this.meterTimeout);
		this.transferFeedback = undefined;
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
		this.amountMenuObserver?.disconnect();
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
		this.measurements.record([target]);
		this.canvas.markVesselChanged(target, hint);
		return volumeMl;
	}

	private saveMeasuredDose(sprite: PIXI.Container, recipe: DoseRecipe, volumeMl: number): void {
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
		this.hideTransferFeedback();
		const dose = this.buildDose(selected.recipe);
		if (dose) this.openAmountMenu(target, sprite, { name: selected.name, recipe: selected.recipe, dose });
		return true;
	}

	trackVesselTransfer(source: chemlib.ChemComponent, anchor: PIXI.Container | undefined, point: PIXI.PointData): void {
		// Pouring from vessel to vessel belongs to the object card a locked
		// learner interface takes away; dosing from the palette keeps working.
		if (this.#hides("hideObjectActions")) return;
		this.trackDragTransfer(anchor, point, { vessel: source });
	}

	get transferTarget(): PIXI.Container | undefined {
		return this.amountMenu?.anchor ?? this.transferFeedback?.anchor;
	}

	get activePourTarget(): PIXI.Container | undefined {
		return this.transferFeedback?.phase === "running" && "vessel" in this.transferFeedback.from
			? this.transferFeedback.anchor : undefined;
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
				current.nextDoseMs = TRANSFER_HOLD_MS;
				this.transferFeedback = { ...this.transferFeedback, progress: 0 };
			}
			return;
		}
		this.hideTransferFeedback();
		const drag = { anchor, target, from, point, heldMs: 0, nextDoseMs: TRANSFER_HOLD_MS, active: false, totalMl: 0 };
		this.dragTransfer = drag;
		const route = { anchor, target, from };
		this.transferFeedback = { ...route, amount: 0, phase: "arming", gesture: "drop", progress: 0 };
		this.canvas.drawSelection();
		let progress = 0;
		this.simulation.startTask(DRAG_TRANSFER_TASK, (elapsedMs) => {
			drag.heldMs += elapsedMs;
			if (drag.heldMs < drag.nextDoseMs) {
				const next = Math.floor(drag.heldMs / 50) * 50;
				if (!drag.active && next !== progress) {
					progress = next;
					this.transferFeedback = { ...route, amount: 0, phase: "arming", gesture: "drop", progress: next / TRANSFER_HOLD_MS };
				}
				return;
			}
			drag.active = true;
			const steps = 1 + Math.floor((drag.heldMs - drag.nextDoseMs) / 50);
			drag.nextDoseMs += steps * 50;
			const requestedMl = steps * 0.4 * ("vessel" in from ? 1 : doseStepMl(from.recipe));
			const added = this.applyTransfer(route, requestedMl);
			drag.totalMl += added;
			const limit = this.transferReachedLimit(route, requestedMl, added);
			this.transferFeedback = { ...route, amount: drag.totalMl, phase: limit ? "limit" : "running", gesture: "drop" };
			if ("vessel" in from) this.canvas.updatePourAngle(this.activePourTarget);
			if (limit) this.simulation.stopTask(DRAG_TRANSFER_TASK);
		});
	}

	finishDragTransfer(drop = false): void {
		const drag = this.dragTransfer;
		if (!drag) return;
		this.dragTransfer = undefined;
		this.simulation.stopTask(DRAG_TRANSFER_TASK);
		this.hideTransferFeedback();
		this.canvas.drawSelection();
		this.finishMeasuredTransfer(drag, drag.totalMl);
		if (drop && !drag.active) this.openAmountMenu(drag.target, drag.anchor, drag.from);
	}

	private applyTransfer({ from, target }: TransferRoute, amount: number): number {
		return "vessel" in from
			? this.transferMeasuredVolume(from.vessel, target, amount)
			: this.addMeasuredDose(target, from.dose, amount, doseHint(from.recipe));
	}

	private transferReachedLimit({ from, target }: TransferRoute, requested: number, added: number): boolean {
		const gas = "recipe" in from && from.recipe.phase === "gas";
		return added < requested - 1e-8 || (!gas && target._content.contentVolume * 1000 >= target._volume - 1e-8);
	}

	private finishMeasuredTransfer({ from, target, anchor }: TransferRoute, amount: number): void {
		if (!(amount > 0)) return;
		if ("vessel" in from) {
			this.reportXApi("appended", `${from.vessel._type}:${from.vessel._id}`, {
				response: anchor.label, success: true, completion: true,
			});
		} else this.saveMeasuredDose(anchor, from.recipe, amount);
		if (this.curr_obj === target || ("vessel" in from && this.curr_obj === from.vessel)) this._updatePopup();
	}

	private transferMeasuredVolume(source: chemlib.ChemComponent, target: chemlib.ChemComponent, amount: number): number {
		const result = source.transferContents({ tVolume: amount / 1000 }, target) * 1000;
		if (result > 0) {
			this.measurements.record([source, target], [], { source, target, volume: result });
			this.canvas.markVesselChanged(source);
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
		if (event.button !== 0 || !event.isPrimary || !this.app) return;
		// A fresh primary press can only arrive while an older palette gesture is
		// still open if that gesture never saw its end. The editor around the
		// widget may swallow the pointerup, and the controller would then keep
		// `paletteDrag` set, which makes `pointerBusy` true and refuses every
		// later drag until the page reloads. Starting over heals that.
		this.paletteDrag?.abort();
		if (this.canvas.pointerBusy) return;
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
			if (!(pointer.buttons & 1)) {
				controller.abort();
				return;
			}
			if (!this.suppressPaletteClick) {
				if (Math.hypot(pointer.clientX - event.clientX, pointer.clientY - event.clientY) <= PALETTE_DRAG_THRESHOLD) return;
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
				try {
					gesture.start();
				} catch (error) {
					// A start that throws would leave the tile dragging without a
					// preview and without a dose, so end the gesture and say why.
					console.error("Unable to start the palette drag", error);
					controller.abort();
					return;
				}
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
		view.addEventListener("blur", () => controller.abort(), { signal: controller.signal });
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
		let from: Extract<AmountSource, { recipe: DoseRecipe }> | undefined;
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
			preview.hidden = !!this.dragTransfer;
		};
		this.startPaletteDrag(event, {
			start: () => {
				this.clearObjectSelection();
				const dose = this.buildDose(chemical.recipe);
				if (!dose) {
					// Without a dose the gesture has nothing to carry, so say which
					// chemical has no recipe instead of ending in silence.
					console.warn("Unable to prepare the dose of", chemical.name);
					return;
				}
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
				// The preview hangs in the shadow root, so its badge must come
				// from the scoped registry as well.
				const badge = this.createScoped(html`<sl-badge pill>${chemical.name}</sl-badge>`);
				if (badge) preview.append(badge);
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
		if (transfer && this.#hides("hideObjectActions")) return;
		// A gas brings no volume of its own and takes no room in the vessel, so
		// its dose is bounded by what one portion from a gas bottle can be. What
		// the solution dissolves is decided when the dose arrives.
		const gas = !transfer && from.recipe.phase === "gas";
		const incoming = transfer ? from.vessel._content : from.dose(target._volume * 2);
		const limit = gas ? GAS_DOSE_MAX_ML
			: !transfer || target._inOutLimits[0] > 0
				? incoming.contentVolume * 1000 * target._content.fractionThatFits(incoming, target._volume / 1000)
				: 0;
		const max = Number.isFinite(limit) && limit > 1e-8 ? limit : 0;
		const amount = transfer ? max : gas ? Math.min(DEFAULT_GAS_DOSE_ML, max) : Math.min(1, max);
		const menu = { target, anchor, from, max, amount };
		this.amountMenu = menu;
		void this.updateComplete.then(() => {
			if (!this.isConnected || this.amountMenu !== menu) return;
			const panel = this.shadowRoot.querySelector<HTMLElement>("#amountMenu");
			if (!panel) return;
			// Shoelace buttons can change the panel's height after its first render.
			this.amountMenuObserver ??= new ResizeObserver(() => this.positionAmountMenu());
			this.amountMenuObserver.disconnect();
			this.amountMenuObserver.observe(panel);
			panel.focus({ preventScroll: true });
		});
	}

	private setAmount(value: number): void {
		const menu = this.amountMenu;
		if (!menu || !Number.isFinite(value)) return;
		const amount = Math.max(0, Math.min(menu.max, value));
		if (amount !== menu.amount) this.amountMenu = { ...menu, amount };
	}

	private handleAmountMenuKey(event: KeyboardEvent): void {
		if (event.key !== "Enter" || event.isComposing || event.defaultPrevented) return;
		if (event.target !== event.currentTarget && !(event.target instanceof HTMLInputElement && event.target.type === "range")) return;
		event.preventDefault();
		event.stopPropagation();
		this.confirmAmount();
	}

	private dismissAmountMenu(): void {
		this.closeAmountMenu();
		this.app?.canvas.focus({ preventScroll: true });
	}

	private formatAmount(amount: number, maximumSignificantDigits: number): string {
		const language = this.lang || undefined;
		if (language !== this.amountFormatLanguage) {
			this.amountFormatLanguage = language;
			this.amountFormatters.clear();
		}
		let formatter = this.amountFormatters.get(maximumSignificantDigits);
		if (!formatter) {
			const options = { maximumSignificantDigits };
			try {
				formatter = new Intl.NumberFormat(language, options);
			} catch {
				formatter = new Intl.NumberFormat(undefined, options);
			}
			this.amountFormatters.set(maximumSignificantDigits, formatter);
		}
		return formatter.format(amount);
	}

	private confirmAmount(): void {
		// Focus can stay on the text field when the button is activated inside the
		// scoped shadow root. Apply the edit before reading the amount.
		const exact = this.shadowRoot.querySelector<HTMLInputElement>("#amountMenu .value-control-exact[data-edited]");
		if (exact) {
			exact.dispatchEvent(new Event("change"));
			if (!exact.reportValidity()) return;
		}
		const menu = this.amountMenu;
		if (!menu || !(menu.amount > 0) || menu.amount > menu.max) return;
		const { from, target, anchor, amount } = menu;
		if (!this.allChemComponents.includes(target)) {
			this.closeAmountMenu();
			return;
		}
		if ("vessel" in from && !this.allChemComponents.includes(from.vessel)) {
			this.closeAmountMenu();
			return;
		}
		const result = this.applyTransfer(menu, amount);
		if (result > 0) {
			this.finishMeasuredTransfer(menu, result);
			this.dismissAmountMenu();
		} else {
			this.amountMenu = { ...menu, amount: 0, max: 0 };
			void this.updateComplete.then(() => this.shadowRoot.querySelector<HTMLElement>("#amountMenu")?.focus({ preventScroll: true }));
		}
	}

	beginChemicalDose(sprite: PIXI.Container, pointerId: number): boolean {
		const selected = this.selectedChemical;
		if (!selected) return false;
		if (this.stopDose) return true;
		const target = this.doseTarget(sprite);
		if (!target) return false;
		const dose = this.buildDose(selected.recipe);
		if (!dose) return true;

		this.hideTransferFeedback();
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
		const stepMl = doseStepMl(selected.recipe);
		const route: TransferRoute = { anchor: sprite, target, from: { name: selected.name, recipe: selected.recipe, dose } };
		const add = (requestedMl: number, phase: "running" | "dose") => {
			const added = this.applyTransfer(route, requestedMl);
			totalMl += added;
			const limit = this.transferReachedLimit(route, requestedMl, added);
			this.transferFeedback = { ...route, amount: totalMl, phase: limit ? "limit" : phase, gesture: "press" };
			return limit;
		};
		const finish = (click: boolean, save = true) => {
			this.simulation.stopTask(task);
			controller.abort();
			if (canvasView.hasPointerCapture(pointerId)) canvasView.releasePointerCapture(pointerId);
			this.stopDose = undefined;
			if (click && !holding) add(stepMl, "dose");
			if (click && !holding) this.meterTimeout = view.setTimeout(() => this.hideTransferFeedback(), 850);
			else this.hideTransferFeedback();
			if (save) this.saveMeasuredDose(sprite, selected.recipe, totalMl);
			if (this.curr_obj === target) this._updatePopup();
		};
		let progress = 0;
		this.simulation.startTask(task, (elapsedMs) => {
			heldMs += elapsedMs;
			if (heldMs < nextDoseMs) {
				const next = Math.floor(heldMs / 50) * 50;
				if (!holding && next !== progress) {
					progress = next;
					this.transferFeedback = { ...route, amount: 0, phase: "arming", gesture: "press", progress: next / 300 };
				}
				return;
			}
			holding = true;
			const steps = 1 + Math.floor((heldMs - nextDoseMs) / 50);
			nextDoseMs += steps * 50;
			const full = add(steps * 0.4 * stepMl, "running");
			if ((full || heldMs >= nextStatusMs) && this.curr_obj === target) {
				this._updatePopup();
				nextStatusMs = heldMs + 500;
			}
			if (full) this.simulation.stopTask(task);
		});
		this.stopDose = (save = false) => finish(false, save);
		const options = { capture: true, signal: controller.signal };
		view.addEventListener("pointerup", (event) => {
			if (event.pointerId === pointerId) finish(holding || this.canvas.vesselAtViewport(event.clientX, event.clientY) === sprite);
		}, options);
		view.addEventListener("pointermove", (event) => {
			if (event.pointerId === pointerId &&
				(!(event.buttons & 1) || this.canvas.vesselAtViewport(event.clientX, event.clientY) !== sprite)) finish(false);
		}, options);
		const cancel = (event: PointerEvent) => {
			if (event.pointerId === pointerId) finish(false);
		};
		view.addEventListener("pointercancel", cancel, options);
		canvasView.addEventListener("lostpointercapture", cancel, options);
		view.addEventListener("blur", () => finish(false), { signal: controller.signal });
		this.transferFeedback = { ...route, amount: 0, phase: "arming", gesture: "press", progress: 0 };
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
				this.smilesDrawer100 ??= new SmilesDrawer.SvgDrawer({
					width: 100, height: 100, explicitHydrogens: true, compactDrawing: false, terminalCarbons: true,
				});
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

	/**
	 * Fills a node of this shadow root with a template.
	 *
	 * `render` builds the template's elements through the document registry
	 * unless it receives the render options of the host, and this widget
	 * registers every Shoelace element only in the registry of its shadow root.
	 * Without the options a tag stays an unknown element that shows its text
	 * without its pill, and a carousel item keeps no width.
	 */
	private renderScoped(node: Node, template: unknown): void {
		render(template, node as HTMLElement, this.renderOptions);
	}

	/**
	 * Builds one element in the registry of the shadow root, for markup that
	 * leaves the template, such as the badge of the drag preview.
	 */
	private createScoped<T extends Element>(template: unknown): T | undefined {
		const holder = this.ownerDocument.createElement("div");
		render(template, holder, this.renderOptions);
		const node = holder.firstElementChild as T | null;
		node?.remove();
		return node ?? undefined;
	}

	private renderVesselCarousel(mixture: chemlib.Mixture, equilibrium?: ReturnType<typeof chemlib.Simulation.getPolyproticEquilibrium>): void {
		const carousel = this.contextMolInfo;
		const reset = this.carouselMixture !== mixture;
		this.carouselMixture = mixture;
		const entries = vesselCarouselEntries(mixture, equilibrium, this.vesselPlatings(mixture));
		const concentrationLine = (concentration: number) => Number.isFinite(concentration)
			? html`<p>c: ${concentration.toExponential(2)} mol/L</p>` : nothing;
		const slide = (thumbnail: unknown, title: string, details: unknown, cardClass = "", model?: chemlib.Molecule) => html`
			<sl-carousel-item>
				<div class="vessel-carousel-card ${cardClass}">
					${thumbnail}
					<div class="vessel-carousel-quantities">
						<div class="vessel-carousel-title">
							<h5 title=${title}>${title}</h5>
							${model && this.builderAvailable
								? this.renderStructureAction(() => this.openSpeciesInBuilder(model, title)) : nothing}
						</div>
						${details}
					</div>
				</div>
			</sl-carousel-item>`;
		this.renderScoped(carousel, html`
			${repeat(entries, ({ key }) => key, ({ molecule, species, gas, plating, phase }) => {
				if (gas) {
					// A halogen that left the solution is a liquid or a solid
					// at room conditions, so the card reports the amount in
					// the unit its phase calls for instead of a gas volume.
					const mass = gas.amount * (gas.molarMass ?? 0);
					const details = gas.phase === "liquid"
						? html`<p>V: ${this.formatAmount(mass / (gas.density || 1), 3)} mL</p>`
						: gas.phase === "solid"
							? html`<p>m: ${this.formatAmount(mass, 3)} g</p>`
							: html`<p>n: ${this.formatAmount(gas.amount * 1000, 3)} mmol</p>`;
					return slide(html`<span class="vessel-carousel-thumbnail">${gas.formula}</span>`,
						gas.formula, details);
				}
				if (plating) {
					// The deposit is a bare element, so its formula is the
					// clearest title; a PubChem name would come back in English.
					const metal = plating.molecule;
					const formula = metal._kekule_obj.calcFormula().getDisplayText();
					return slide(this.vesselThumbnail(metal, formula), formula, html`
						<p class="vessel-carousel-location">${this.message("auf der Elektrode")}</p>
						<p>m: ${this.formatAmount(plating.mol * metal.getTotMolMass(), 3)} g</p>`, "plated", metal);
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
						name || formula, concentrationLine(concentration), "", thumbnail);
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
					${concentration}`, "", molecule);
			})}
		`);
		if (reset) void carousel.updateComplete.then(() => {
			if (this.carouselMixture === mixture) carousel.goToSlide(0, "instant");
		});
	}

	/**
	 * updates the information shown for the selected object
	 *
	 * @private
	 */
	private _updatePopup(recordedEquilibrium?: ReturnType<typeof chemlib.Simulation.getPolyproticEquilibrium>): void {
		const component = this.curr_obj;
		if (!component) {
			this.filledCardNodes = undefined;
			return;
		}
		// A locked learner interface renders no object card, so the containers
		// this fills do not exist. Selecting a device still draws the selection.
		if (this.#hides("hideObjectActions")) {
			this.filledCardNodes = undefined;
			return;
		}
		// A fill can run before the first render, and then the `@query`
		// accessors are still empty. Leaving the record unset lets the next
		// update try again, instead of leaving a card without its contents.
		const echem = this.contextEchemInfo as HTMLDivElement | undefined;
		const carousel = this.contextMolInfo as SlCarousel | undefined;
		const summary = this.contextMixInfo as HTMLDivElement | undefined;
		if (!echem || !carousel || !summary) return;
		echem.hidden = !(component instanceof chemlib.ElectricComponent);
		carousel.hidden = true;
		summary.style.display = "none";
		if (component instanceof chemlib.ChemComponent) {
			const mixture = component._content;
			const hasContents = mixture._activeMolecules.length > 0;
			const equilibrium = recordedEquilibrium ?? (hasContents ? this.mixtureEquilibrium(mixture) : undefined);
			if (hasContents) {
				carousel.hidden = false;
				try {
					this.renderVesselCarousel(mixture, equilibrium);
				} catch (error) {
					console.error("Unable to fill the vessel contents", error);
				}
				try {
					this.renderVesselSummary(mixture, equilibrium?.pH);
				} catch (error) {
					console.error("Unable to fill the vessel summary", error);
				}
			}
		} else if (component instanceof chemlib.ElectricComponent) {
			this.renderScoped(echem, keyed(component, this.renderElectricalReadouts(component)));
		}
		this.filledCardNodes = { echem, carousel, summary };
		this.canvas.drawSelection();
	}

	/**
	 * The aqueous equilibrium of a mixture, or `undefined` when the solver
	 * fails. A failure costs the pH line and not the contents card, and it is
	 * logged once per mixture so a stuck solver cannot flood the console.
	 */
	private mixtureEquilibrium(mixture: chemlib.Mixture): ReturnType<typeof chemlib.Simulation.getPolyproticEquilibrium> | undefined {
		if (!mixture._isSolution || !(mixture._solutionVolume > 0)) return undefined;
		try {
			return chemlib.Simulation.getPolyproticEquilibrium(mixture);
		} catch (error) {
			if (!this.equilibriumFailures.has(mixture)) {
				this.equilibriumFailures.add(mixture);
				console.error("Unable to solve the aqueous equilibrium", error);
			}
			return undefined;
		}
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
		this.renderScoped(this.contextMixInfo, html`
			${amount > 0 && Number.isFinite(amount) ? html`
				<sl-tag size="small" variant="neutral">${liquid ? `${amount.toFixed(1)} mL` : `${this.formatAmount(amount, 3)} g`}</sl-tag>` : nothing}
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
		`);
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
		if (this.mixtureDraft?.vessel !== this.curr_obj) this.mixtureDraft = undefined;
		this.curr_name = name;
		// The card is filled after the render, so the fill writes into the nodes
		// the update puts on screen; siehe `updated`.
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
		const removedElectrical = this.allEComponents.filter((component) => labels.has(labelOf(component)));
		const removedChemical = this.allChemComponents.filter((component) => labels.has(labelOf(component)));
		const drag = this.dragTransfer;
		if (drag && (removedChemical.includes(drag.target) ||
			("vessel" in drag.from && removedChemical.includes(drag.from.vessel)))) this.finishDragTransfer();
		const menu = this.amountMenu;
		if (menu && (removedChemical.includes(menu.target) ||
			("vessel" in menu.from && removedChemical.includes(menu.from.vessel)))) this.closeAmountMenu();
		if (this.transferFeedback && removedChemical.includes(this.transferFeedback.target)) {
			this.stopDose?.();
			this.hideTransferFeedback();
		}
		const removedMixtures = new Map(removedChemical.map((component) => [component._content, component]));
		const detachedElectrodes = this.allEComponents.filter((component) => component._type === chemlib.EComponentType.Electrode &&
			removedMixtures.has(component._connectedMix) && !labels.has(labelOf(component)));
		// Collect the affected circuit while the connections still exist.
		const affectedElectrical = new Set([...removedElectrical, ...detachedElectrodes]);
		for (const component of affectedElectrical) {
			for (const partner of component.partners) affectedElectrical.add(partner);
		}
		for (const component of removedElectrical) labels.add(labelOf(component));
		const selected = world.children[this.curr_stage_index];
		if (selected && labels.has(selected.label)) {
			this.stopDose?.();
			this.hideTransferFeedback();
			this.clearObjectSelection();
		}
		// A lead that hangs on a removed device survives with a free end where
		// its plug was, so the rest of the wiring stays intact.
		for (const component of removedElectrical) this.canvas.releaseCableEnds(component);
		for (const component of removedElectrical) {
			for (const partner of [...component.partners]) this._remEcon(component, partner);
		}
		for (const electrode of detachedElectrodes) electrode._connectedMix = undefined;
		this.measurements.retire([...removedChemical, ...removedElectrical]);
		this.allChemComponents = this.allChemComponents.filter((component) => !labels.has(labelOf(component)));
		this.allEComponents = this.allEComponents.filter((component) => !labels.has(labelOf(component)));
		this.pruneDiagramSuggestions();
		for (const sprite of [...world.children]) {
			if (!labels.has(sprite.label)) continue;
			this.removeAuthoredComponent(sprite);
			this.canvas.removeSprite(sprite);
			this.simulation.stopTask("transfer" + sprite.label);
			this.simulation.stopTask("echem" + sprite.label);
			this.circuits.reconcile();
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
		this.measurements.record([], [component]);
		const label = `${component._type}:${component._id}`;
		const ticker = "echem" + label;
		if (!this.simulation.hasTask(ticker)) return;
		this.simulation.stopTask(ticker);
		this.circuits.reconcile();
		this.canvas.setDeviceActive(component, false);
		this._sendxAPiStatement("completed", ticker);
		this.requestUpdate();
	}

	clearObjectSelection(): void {
		this.mixtureDraft = undefined;
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

	private createSavedComponent(component: object): chemlib.ChemComponent | chemlib.ElectricComponent {
		const type = component["type"].toLowerCase();
		// The same rule derives the textures of the layout, so a variant that is
		// refused here is never requested there either.
		const variant = savedComponentVariant(type, component["variantId"]);

		let newComp: chemlib.ChemComponent | chemlib.ElectricComponent;

		if (
			Object.values(chemlib.ComponentType).includes(
			type as chemlib.ComponentType
			)
		) {
			newComp = chemlib.ComponentManager.newChemComponent(
				type
			);
			let newMix: chemlib.Mixture = this._loadMixture(
				component["content"],
				component["vol"]
			);
			newComp.addContents({ nMix: newMix });
			const capacity = Number(component["capacityMl"] ?? variant?.capacityMl);
			if (Number.isFinite(capacity) && capacity > 0) newComp._volume = capacity;
			if (typeof component["stepVolumeMl"] === "number") newComp.setBuretteStepMl(component["stepVolumeMl"]);
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
					if (variant?.reference !== undefined) break;
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
				case chemlib.EComponentType.Cable: {
					const ends = component["ends"];
					if (Array.isArray(ends) && ends.length === 2) {
						newComp._cableEnds = [
							ends[0] === "crocodile" ? "crocodile" : "banana",
							ends[1] === "crocodile" ? "crocodile" : "banana",
						];
					} else if (variant?.ends) {
						newComp._cableEnds = [...variant.ends];
					}
					const offsets = component["offsets"];
					if (Array.isArray(offsets) && offsets.length === 2) {
						newComp._endOffsets = offsets.map((offset: number[]) => ({
							x: Number(offset?.[0]) || 0,
							y: Number(offset?.[1]) || 0,
						})) as [{ x: number; y: number }, { x: number; y: number }];
					}
					break;
				}
				default:
					break;
			}
			// An electrode's wetted area and a reference electrode's fixed
			// potential are properties of the electrode, not of its type.
			if (newComp._type === chemlib.EComponentType.Electrode) {
				const area = Number.parseFloat(component["area"]);
				if (Number.isFinite(area) && area > 0) newComp._area = area;
				const reference = variant?.reference ?? Number.parseFloat(component["reference"]);
				if (Number.isFinite(reference)) newComp._reference = reference;
			}
			const config = component["rcSettings"];
			if (isPassiveMeter(newComp) && (config === null || validRCSettings(config))) {
				newComp._rcSettings = config;
			}
		}
		return newComp;
	}

	private _loadComponents(entry?: object, models?: ReadonlyMap<object, chemlib.ChemComponent | chemlib.ElectricComponent>): void {
		for (const component of this.availableComponents) {
			if (entry && component !== entry) continue;
			const newComp = models?.get(component) ?? this.createSavedComponent(component);
			if (newComp instanceof chemlib.ChemComponent) this.allChemComponents.push(newComp);
			else this.allEComponents.push(newComp);

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
		// The explicit cables come first: a layout that carries both a cable
		// entry and the partner indices of its devices is not wired twice.
		chemlib.restoreCables(
			this.availableComponents as chemlib.ConnectionEntry[],
			(id) => this.allEComponents.find((component) => component._id === id),
			(cable, end, device) => chemlib.plugCable(cable, end, device)
		);
		chemlib.restoreConnections(
			this.availableComponents as chemlib.ConnectionEntry[],
			(id) => this.allEComponents.find((component) => component._id === id),
			// A pair the cable entries already joined is left alone. Wiring is
			// otherwise free to lay a second lead between the same two devices,
			// which is what a supply and a meter need.
			(a, b) => !chemlib.alreadyWired(a, b) &&
				this.connectElectrical(a, b, undefined, undefined, false)
		);
		this.canvas.attachDevices();
		this.circuits.reconcile();
		const added = entry && this.allChemComponents.find(component => component._id === entry["id"] && component._type === entry["type"]);
		const device = entry && this.allEComponents.find(component => component._id === entry["id"] && component._type === entry["type"]);
		this.measurements.record(entry ? added ? [added] : [] : this.allChemComponents,
			entry ? device ? [device] : [] : this.allEComponents);
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
	 * @param {boolean} [authored=true] - whether to record the cable in the worksheet
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
		this.queueSurfaceDisplacement(from);
		this.queueSurfaceDisplacement(to);
		this.allEComponents.push(cable);
		const sprite = this.canvas.addComponentView(cable, false);
		// The plugs of both devices change from free to occupied.
		this.canvas.refreshDeviceDisplay(from);
		this.canvas.refreshDeviceDisplay(to);
		// The two devices are one circuit now, so their clocks merge.
		this.circuits.reconcile();
		if (!authored) return true;
		this.authorCable(cable, sprite);
		this.syncAuthoredConnections(from);
		this.syncAuthoredConnections(to);
		this._sendxAPiStatement("joined", from._type + from._id, {
			response: to._type + ":" + to._id,
			success: true,
			completion: true,
		});
		return true;
	}

	/**
	 * Saves a cable that was laid by dragging in the worksheet. The partner
	 * lists of the two devices cannot carry it: they name each partner once,
	 * so a second lead between the same pair would be lost. The cable entry
	 * names the device on each of its ends instead, which keeps parallel leads
	 * apart and brings them back one by one.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} cable - the cable to record
	 * @param {PIXI.Container} sprite - its view, which the entry is found by
	 */
	private authorCable(cable: chemlib.ElectricComponent, sprite: PIXI.Container): void {
		if (!this.canAuthor) return;
		const entry = {
			id: cable._id, type: cable._type, variantId: cable._variantId,
			pos: [sprite.x, sprite.y], capacityMl: 0, vol: 0, content: "",
			voltage: 0, current: 0, material: "", connections: [], labelText: "",
			ends: [...cable._cableEnds],
			offsets: cable._endOffsets.map(({ x, y }) => [x, y]),
		};
		this.availableComponents = [...this.availableComponents, entry];
		this.avComponentsSprites.push([sprite, cable._id]);
		this.syncAuthoredConnections(cable);
	}

	/**
	 * Rewrites the authored connection list of a device from its live
	 * terminals. The order is what matters: `polarity` names the electrode on
	 * terminal 0, so a rewire has to be written back in terminal order rather
	 * than appended.
	 *
	 * A cable is written back as the device on each of its ends, with `null`
	 * for an end that hangs free, so the position in the list is the end.
	 *
	 * @param {chemlib.ElectricComponent} device - the device to write back
	 */
	syncAuthoredConnections(device: chemlib.ElectricComponent): void {
		if (!this.canAuthor) return;
		const entry = this.authoredEntryOf(device);
		if (!entry) return;
		if (device._type === chemlib.EComponentType.Cable) {
			// A cable names the device on each of its ends, so the position in
			// the list is the end and a free end is `null`.
			entry["connections"] = device._connections.map((end) => {
				const index = end.length ? this.authoredIndexOf(end[0]) : -1;
				return index >= 0 ? index : null;
			});
			entry["offsets"] = device._endOffsets.map(({ x, y }) => [x, y]);
			this.availableComponents = [...this.availableComponents];
			return;
		}
		const partners: number[] = [];
		for (const cable of device.partners) {
			const other = cable.partners.find((end) => end !== device);
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
		const affected = chemlib.ComponentManager.connectedDevices(component);
		const message: string = component.disconnect(partner);
		if (message === "") {
			this.invalidateElectricalReadings(affected);
			this.syncAuthoredConnections(component);
			this.syncAuthoredConnections(partner);
			// The freed plug has to read as free again.
			this.canvas.refreshDeviceDisplay(component);
			this.canvas.refreshDeviceDisplay(partner);
			// A lead that came off splits the circuit in two.
			this.circuits.reconcile();
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
	 * Reports a failure in the status strip above the canvas. The strip is not
	 * modal and never blocks the canvas, so the notice can appear while the
	 * user keeps working; a new notice replaces the previous one. A failed
	 * canvas is the only thing it reports, so the strip carries the error
	 * styling itself.
	 *
	 * @private
	 * @param {string} text - the notice
	 * @param {number} [duration=2000] - how long the notice stays, in ms
	 */
	_notify(text: string, duration = 2000): void {
		const strip = this.statusStrip;
		if (!strip) return;
		strip.textContent = text;
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
		const paletteOpen = this.#paletteOpen;
		return html`
			<div
				id="upper"
				?data-loading=${!!this.canvasLoading}
				?data-loading-grid=${!!this.canvasLoading && this.canvas.gridVisible}
				@keydown=${this.deleteSelection}
				@sl-show=${this.boundSelectMenu}
				@sl-hide=${this.unobserveSelectMenu}
				class=${`${diagramOpen ? "show-diagram-panel" : ""} ${paletteOpen ? "show-palette" : ""}`}
			>
				<div id="canvasArea" aria-busy=${!!this.canvasLoading}>
					${this.pix_canvas}
					${this.renderObjectSummary()}
					${this.renderGroupSummary()}
					${this.renderAmountMenu()}
					${this.renderControlButtons()}
					${this.renderBuilderExchange()}
				</div>
				${this.renderDiagramDetails(diagramAvailable, diagramOpen)}
				${this.renderTeacherDrawer()}
				<sl-popup id="permissionPopup" placement="top" distance="8" flip shift arrow
					.anchor=${this.permissionTooltip?.anchor} .active=${!!this.permissionTooltip}>
					<div id="permissionTooltip" role="tooltip">${this.permissionTooltip?.text}</div>
				</sl-popup>
				${this.canvasLoading ? this.renderCanvasLoading(this.canvasLoading) : nothing}
			</div>
		`;
	}

	private renderCanvasLoading({ value, task, restored, total }: NonNullable<ChemLab["canvasLoading"]>) {
		const label = this.message("ChemLab wird geladen");
		return html`
			<div id="canvasLoading">
				<div class="loading-heading">
					<span class="loading-icon" aria-hidden="true">
						<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 2.5h10M4 2.5v9.75c0 .7.55 1.25 1.25 1.25h5.5c.7 0 1.25-.55 1.25-1.25V2.5M4 7.5h8M4 10h2.5"/>
						</svg>
					</span>
					<strong>${label}</strong>
				</div>
				<progress .value=${Math.round(value)} max="100" aria-label=${label}></progress>
				<div class="loading-task">
					<span role="status">${this.message(task)}</span>
					${total ? html`<sl-badge variant="neutral" pill aria-hidden="true">${restored} / ${total}</sl-badge>` : nothing}
				</div>
			</div>
		`;
	}

	private get diagramPanelAvailable(): boolean {
		return !this.#hides("hideDiagramSystem") && this.diagrams.hasDiagrams;
	}

	get isDiagramPanelOpen(): boolean {
		return this.diagramPanelAvailable && this.diagramPanelOpen;
	}

	closeDiagramPanel(): void {
		this.diagramPanelOpen = false;
	}

	hasDiagramSource(label: string): boolean {
		return this.canvas.hasComponent(label);
	}

	highlightDiagramSource(label: string, active: boolean): void {
		this.canvas.highlightDiagramSource(label, active);
	}

	clearDiagramSourceHighlight(): void {
		this.canvas.clearDiagramSourceHighlight();
	}

	centerDiagramSource(label: string): void {
		this.canvas.centerComponent(label);
	}

	refreshDiagramPicker(): void {
		const version = this.measurements.history.channelVersion;
		if (version !== this.diagramChannelVersion) {
			this.diagramChannelVersion = version;
			this.collectDiagramSuggestions();
			// Only the axis menus read the channel list, and only while they are shown.
			if (this.diagramPickerOpen || this.isDiagramPanelOpen) this.requestUpdate();
		}
	}

	collectDiagramSuggestions(): void {
		if (this.simulation.hasRunningExperiments &&
			this.suggestionQueue.collect(this.diagramSuggestions(this.measurements.history.channels))) this.requestUpdate();
	}

	/** The objects that are on the canvas right now, keyed like a channel's component. */
	private liveDiagramSources(): Set<string> {
		return new Set([...this.allChemComponents, ...this.allEComponents]
			.map(({ _type, _id }) => `${_type}:${_id}`));
	}

	/** Both objects of a suggestion are still on the canvas. */
	private diagramSourcesLive(x: DiagramAxis, y: MeasurementChannel, live: ReadonlySet<string>): boolean {
		return live.has(componentKey(y)) && (x === TIME_CHANNEL || live.has(componentKey(x)));
	}

	/** Forgets suggestions whose objects left the canvas, dismissed ones included. */
	private pruneDiagramSuggestions(): boolean {
		const live = this.liveDiagramSources();
		return this.suggestionQueue.prune(({ x, y }) => this.diagramSourcesLive(x, y, live));
	}

	private openDiagramPicker(controls: HTMLElement): void {
		if (this.isDiagramPanelOpen || this.diagramPickerOpen) return;
		this.collectDiagramSuggestions();
		this.diagramPickerOpen = true;
		this.diagramPickerListeners = new AbortController();
		const { signal } = this.diagramPickerListeners;
		// A hoisted dropdown leaves the panel, so the pointer over it still counts as inside.
		const outside = (event: Event) => {
			const path = event.composedPath();
			return !path.includes(controls) && !path.some(node => this.diagramMenus.has(node as HTMLElement));
		};
		const options = { capture: true, signal };
		const view = this.ownerDocument.defaultView;
		view?.addEventListener("pointerdown", event => {
			if (outside(event)) this.closeDiagramPicker();
		}, options);
		view?.addEventListener("pointermove", event => {
			if (event.pointerType === "touch") return;
			if (outside(event)) this.scheduleDiagramPickerClose();
			else this.cancelDiagramPickerClose();
		}, options);
		view?.addEventListener("focusin", event => {
			if (outside(event)) this.closeDiagramPicker();
		}, options);
		view?.addEventListener("keydown", event => {
			if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
			const restoreFocus = event.composedPath().includes(controls);
			this.closeDiagramPicker();
			if (restoreFocus) controls.querySelector<HTMLElement>("#diagramHandle")?.focus({ preventScroll: true });
		}, { signal });
		view?.addEventListener("blur", () => this.closeDiagramPicker(), { signal });
	}

	/** The picker waits a moment before it closes, so the pointer can reach a dropdown. */
	private scheduleDiagramPickerClose(): void {
		if (this.diagramPickerCloseTimer !== undefined) return;
		this.diagramPickerCloseTimer = setTimeout(() => {
			this.diagramPickerCloseTimer = undefined;
			this.closeDiagramPicker();
		}, DIAGRAM_PICKER_CLOSE_MS);
	}

	private cancelDiagramPickerClose(): void {
		clearTimeout(this.diagramPickerCloseTimer);
		this.diagramPickerCloseTimer = undefined;
	}

	private closeDiagramPicker(): void {
		this.cancelDiagramPickerClose();
		this.diagramPickerListeners?.abort();
		this.diagramPickerListeners = undefined;
		this.diagramMenus.clear();
		this.diagramPickerOpen = false;
		this.diagramDismissedOpen = false;
		this.diagramX = this.diagramY = "";
	}

	private get diagramSelection(): Set<string> {
		const group = this.canvas.selectedObjects;
		return new Set(group.length ? group.map(sprite => sprite.label) : this.curr_obj ? [this.curr_name] : []);
	}

	private createDiagram(x: DiagramAxis, y: DiagramAxis, title?: string): void {
		if (!this.diagramPanelAvailable) this.closeDiagramPanel();
		this.diagrams.create(x, y, title);
		this.closeDiagramPicker();
		if (!this.isDiagramPanelOpen) this.shadowRoot.querySelector<HTMLElement>("#diagramHandle")?.focus({ preventScroll: true });
	}

	private selectDiagramSuggestion({ key, title, x, y }: QueuedDiagramSuggestion): void {
		this.suggestionQueue.remove(key);
		this.diagramDismissedOpen = false;
		if (!this.diagrams.hasPair(x, y)) this.createDiagram(x, y, title);
		this.onDiagramToggle(true);
		void this.updateComplete.then(async () => {
			this.focusDiagramSuggestion(x, y);
			if (!this.isDiagramPanelOpen) return;
			const drawer = this.shadowRoot.querySelector<HTMLElement>("#inlineDiagramPanel");
			if (drawer) drawer.scrollTop = drawer.scrollHeight;
			// The canvas fits the full setup on each resize while the drawer animates.
			const layout = this.containerDiv.getAnimations().filter(animation =>
				animation instanceof CSSTransition && animation.transitionProperty === "grid-template-columns");
			if (!layout.length) return;
			await Promise.allSettled(layout.map(animation => animation.finished));
			requestAnimationFrame(() => {
				if (this.isDiagramPanelOpen && this.diagrams.hasPair(x, y)) this.focusDiagramSuggestion(x, y);
			});
		});
	}

	private focusDiagramSuggestion(x: DiagramAxis, y: MeasurementChannel): void {
		this.canvas.centerComponents(x === TIME_CHANNEL ? [componentKey(y)] : [componentKey(x), componentKey(y)]);
	}

	private boundSelectMenu(event: Event): void {
		const select = event.target;
		if (!(select instanceof SlSelect)) return;
		const { popup } = select;
		// Hoisting clears the drawer or card scroll area. The workspace still
		// bounds the popup, including the listbox's scrollable height.
		popup.flipBoundary = this.containerDiv;
		popup.shiftBoundary = this.containerDiv;
		popup.autoSizeBoundary = this.containerDiv;
		popup.autoSize = "both";
		popup.flipPadding = popup.shiftPadding = popup.autoSizePadding = 4;
		if (select.classList.contains("diagram-axis-select")) this.diagramMenus.add(popup);
		// A hoisted list can stay visible after its trigger scrolls out of the drawer.
		this.selectVisibilityObserver ??= new IntersectionObserver(entries => {
			for (const { target, isIntersecting } of entries) {
				if (isIntersecting || !(target instanceof SlSelect)) continue;
				this.selectVisibilityObserver?.unobserve(target);
				void target.hide();
			}
		}, { root: this.containerDiv });
		this.selectVisibilityObserver.observe(select);
	}

	private unobserveSelectMenu(event: Event): void {
		if (event.target instanceof SlSelect) this.selectVisibilityObserver?.unobserve(event.target);
	}

	private renderSelectedDiagramAxes(channels: MeasurementChannel[], selection: ReadonlySet<string>) {
		const groups = selectedDiagramSourceGroups(channels, selection)
			.sort((a, b) => a.sources[0].number - b.sources[0].number);
		for (const { sources } of groups) {
			sources.sort((a, b) => this.diagrams.measurementLabel(a).localeCompare(this.diagrams.measurementLabel(b), this.lang));
		}
		const sources: DiagramAxis[] = [TIME_CHANNEL, ...groups.flatMap(group => group.sources)];
		if (!groups.length) return html`
			<p class="diagram-empty">${this.message("Die ausgewählten Objekte liefern keine Messdaten.")}</p>`;
		const current = (id: string) => sources.find(axis => axisId(axis) === id);
		const x = current(this.diagramX);
		const y = current(this.diagramY);
		const select = (axis: "x" | "y", label: string, value?: DiagramAxis, excluded?: DiagramAxis) => html`
			<sl-select class="diagram-axis-select" size="small" hoist contenteditable="false"
				label=${this.message(label)} placeholder=${this.message("Datenquelle wählen")}
				.value=${live(value ? encodeURIComponent(axisId(value)) : "")}
				@sl-change=${(event: Event) => {
					const selected = decodeURIComponent(String((event.currentTarget as SlSelect).value));
					if (axis === "x") this.diagramX = selected;
					else this.diagramY = selected;
					const nextX = current(this.diagramX);
					const nextY = current(this.diagramY);
					if (nextX && nextY && nextX !== nextY) this.createDiagram(nextX, nextY);
					else this.requestUpdate();
				}}>
				<sl-option value=${TIME_CHANNEL} ?disabled=${excluded === TIME_CHANNEL}>${this.diagrams.label(TIME_CHANNEL)}</sl-option>
				${repeat(groups, group => group.key, ({ sources }) => {
					const owner = this.diagrams.objectLabel(sources[0]);
					return html`
						<sl-divider></sl-divider>
						<div role="group" aria-label=${owner}>
							<div class="diagram-axis-group-label" aria-hidden="true">${owner}</div>
							${repeat(sources, source => source.id, source => html`
								<sl-option value=${encodeURIComponent(source.id)} ?disabled=${source === excluded}>
									${this.diagrams.measurementLabel(source)}<span hidden> · ${owner}</span>
								</sl-option>`)}
						</div>`;
				})}
			</sl-select>`;
		return html`${select("x", "X-Achse", x, y)}${select("y", "Y-Achse", y, x)}`;
	}

	private diagramSuggestions(channels: MeasurementChannel[]) {
		const key = (object: chemlib.ChemComponent | chemlib.ElectricComponent) => `${object._type}:${object._id}`;
		const gasVessels = new Set<chemlib.Mixture>();
		const titrations = this.allChemComponents.flatMap(source => {
			if (source._type !== chemlib.ComponentType.Burette || !this.simulation.hasTask("transfer" + key(source))) return [];
			const target = this.canvas.titrationTarget(source);
			if (!target) return [];
			gasVessels.add(target._content);
			return [{ burette: key(source), vessel: key(target) }];
		});
		const instruments = new Map<string, InstrumentSuggestion>();
		const { GasCollector, Source, Ammeter, Multimeter, Cable } = chemlib.EComponentType;
		const addInstruments = (devices: readonly chemlib.ElectricComponent[], title: string) => {
			for (const device of devices) {
				if (device._type !== Source && !isPassiveMeter(device)) continue;
				if (!this.simulation.hasTask("echem" + key(device))) continue;
				const wired = device._connections.every(terminal => terminal.some(partner =>
					partner._type !== Cable || partner.partners.length === 2));
				if (!wired) continue;
				const quantities = device._type === Source ? ["Stromstärke", "Spannung"] :
					[device._type === Ammeter || (device._type === Multimeter && device._meterMode === "current")
						? "Stromstärke" : "Spannung"];
				instruments.set(key(device), { title, quantities });
			}
		};
		for (const starter of this.allEComponents) {
			if (!this.simulation.hasTask("echem" + key(starter))) continue;
			const circuit = this.operatingCircuit(starter);
			if (!circuit) {
				const network = this.meterCircuit(starter);
				if (network) addInstruments(network, "Stromkreis");
				continue;
			}
			const [first, second, ...devices] = circuit;
			if ([first, second].some(electrode => electrode._immersion?.area === 0)) continue;
			const a = first._connectedMix;
			const b = second._connectedMix;
			if (a === b || this.bridgeBetween(a, b)) {
				const sources = devices.filter(device => device._type === Source);
				const powered = sources.some(device => this.simulation.hasTask("echem" + key(device)));
				addInstruments(devices, sources.length ? "Elektrolyse" : "Galvanische Zelle");
				if (powered) {
					gasVessels.add(a);
					gasVessels.add(b);
				}
			} else if (this.hasRCReadout(starter)) {
				addInstruments(devices, "Kapazitiver Impuls");
			}
		}
		for (const device of this.allEComponents) {
			if (device._type === GasCollector && device._connectedMix?._isSolution && gasVessels.has(device._connectedMix)) {
				instruments.set(key(device), { title: "Gasentwicklung", quantities: ["Gesammeltes Gasvolumen"] });
			}
		}
		return suggestDiagrams(channels, titrations, instruments);
	}

	/** One suggestion as a button that turns it into a diagram. */
	private renderDiagramSuggestion(suggestion: QueuedDiagramSuggestion, dismissed = false) {
		return html`<sl-button class="diagram-suggestion${dismissed ? " diagram-suggestion-dismissed" : ""}" size="small"
			@pointerenter=${(event: PointerEvent) => {
				if (event.pointerType !== "touch") this.focusDiagramSuggestion(suggestion.x, suggestion.y);
			}}
			@click=${() => this.selectDiagramSuggestion(suggestion)}>
			<span class="diagram-suggestion-title">${this.message(suggestion.title)}</span>
			<span class="diagram-suggestion-axis"><b>Y</b> ${this.diagrams.label(suggestion.y)}</span>
			<span class="diagram-suggestion-axis"><b>X</b> ${this.diagrams.label(suggestion.x)}</span>
		</sl-button>`;
	}

	private renderDiagramBuilder(embedded: boolean, channels: MeasurementChannel[],
		{ pending, dismissed }: ReturnType<DiagramSuggestionQueue["list"]>) {
		const selection = this.diagramSelection;
		const title = this.message(embedded ? "Diagramm hinzufügen" :
			selection.size && !pending.length && !dismissed.length ? "Achsen wählen" : "Diagrammvorschläge");
		const dismiss = this.message("Vorschlag ausblenden");
		const dismissedLabel = this.message("Ausgeblendet");
		return html`<section class="diagram-builder diagram-surface ${embedded ? "diagram-builder-inline" : "diagram-builder-popup"}"
			id=${embedded ? "diagramBuilderInline" : "diagramBuilderPopup"} aria-label=${title}>
			<div class="diagram-builder-header">
				<sl-tag class="diagram-section-tag" size="small" variant="primary">
					${title}
				</sl-tag>
				${dismissed.length ? html`
					<button type="button" class="diagram-dismissed-trigger" aria-expanded=${String(this.diagramDismissedOpen)}
						aria-controls="diagramDismissedList" aria-label=${this.message("Ausgeblendete Vorschläge")}
						title=${this.message("Ausgeblendete Vorschläge")}
						@click=${() => { this.diagramDismissedOpen = !this.diagramDismissedOpen; }}
						@keydown=${(event: KeyboardEvent) => {
							if (event.key !== "Escape" || !this.diagramDismissedOpen) return;
							event.stopPropagation();
							this.diagramDismissedOpen = false;
						}}>
						<sl-tag size="small" variant="warning">${dismissedLabel}<svg class="palette-card-menu-indicator"
							width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
							<path d="m2.5 4.5 3.5 3 3.5-3"/>
						</svg></sl-tag>
					</button>` : nothing}
			</div>
			${dismissed.length && this.diagramDismissedOpen ? html`
				<div class="diagram-suggestions" id="diagramDismissedList" role="group"
					aria-label=${this.message("Ausgeblendete Vorschläge")}>
					${repeat(dismissed, ({ key }) => key, suggestion => this.renderDiagramSuggestion(suggestion, true))}
				</div>` : nothing}
			${pending.length ? html`
				<div class="diagram-suggestions">
					${repeat(pending, ({ key }) => key, suggestion => html`
						<div class="diagram-suggestion-row">
							${this.renderDiagramSuggestion(suggestion)}
							<sl-button class="diagram-control diagram-dismiss" size="small" title=${dismiss} aria-label=${dismiss}
								@click=${(event: MouseEvent) => {
									if (event.detail === 0) this.shadowRoot.querySelector<HTMLElement>("#diagramHandle")?.focus({ preventScroll: true });
									this.suggestionQueue.dismiss(suggestion.key);
									this.requestUpdate();
								}}>
								<span class="panel-button-label">${dismiss}</span>
								<svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" aria-hidden="true">
									<path d="m3 3 6 6m0-6-6 6"/>
								</svg>
							</sl-button>
						</div>`)}
				</div>` : nothing}
			${selection.size ? this.renderSelectedDiagramAxes(channels, selection) : !pending.length && !dismissed.length ? html`
				<p class="diagram-empty">${this.message("Wähle Objekte auf dem Canvas, um ein eigenes Diagramm zu erstellen.")}</p>` : nothing}
		</section>`;
	}

	private renderDiagramDetails(available: boolean, open: boolean) {
		if (this.#hides("hideDiagramSystem")) return nothing;
		const channels = open || this.diagramPickerOpen || this.suggestionQueue.size ? this.measurements.history.channels : [];
		const active = this.suggestionQueue.size && this.simulation.hasRunningExperiments
			? this.diagramSuggestions(channels) : [];
		const activePairs = new Set(active.map(({ x, y }) => JSON.stringify([axisId(x), axisId(y)])));
		const suggestions = this.suggestionQueue.list(({ x, y }) =>
			activePairs.has(JSON.stringify([axisId(x), axisId(y)])) && !this.diagrams.hasPair(x, y));
		const handleLabel = suggestions.pending.length
			? this.message("Diagramme ({count} Vorschläge)", { count: suggestions.pending.length }) : this.message("Diagramme");
		return html`
			<aside id="diagramArea" class="workspace-side">
				<div id="diagramControls"
					@pointerenter=${() => this.cancelDiagramPickerClose()}
					@pointerleave=${(event: PointerEvent) => {
						if (this.diagramPickerOpen && event.pointerType !== "touch") this.scheduleDiagramPickerClose();
					}}>
					<button id="diagramHandle" type="button" aria-expanded=${String(open || this.diagramPickerOpen)}
						aria-controls=${!open && this.diagramPickerOpen ? "diagramBuilderPopup" : "inlineDiagramPanel"} aria-label=${handleLabel}
						title=${handleLabel} class=${available || suggestions.pending.length ? "" : "diagram-handle-idle"}
						@pointerenter=${(event: PointerEvent) => {
							if (!open && event.pointerType === "mouse") this.openDiagramPicker((event.currentTarget as HTMLElement).parentElement);
						}}
						@click=${(event: PointerEvent) => {
							if (available) this.onDiagramToggle(!open);
							else if (this.diagramPickerOpen && event.pointerType !== "mouse") this.closeDiagramPicker();
							else this.openDiagramPicker((event.currentTarget as HTMLElement).parentElement);
						}}>
						${open ? nothing : html`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M2 2v12h12M4 11l3-4 3 2 4-5"/>
						</svg>`}
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true">
							<path d=${open ? "m9 3-4 4 4 4" : "m5 3 4 4-4 4"}/>
						</svg>
						${!open && suggestions.pending.length ? html`
							<sl-badge class="diagram-suggestion-count" variant="primary" pill aria-hidden="true">${suggestions.pending.length}</sl-badge>` : nothing}
					</button>
					${!open && this.diagramPickerOpen ? this.renderDiagramBuilder(false, channels, suggestions) : nothing}
				</div>
				<div id="inlineDiagramPanel" ?inert=${!open} aria-hidden=${String(!open)}
					@pointerleave=${() => this.clearDiagramSourceHighlight()}>
					${open ? this.renderDiagramBuilder(true, channels, suggestions) : nothing}
					<div class="diagram-toolbar diagram-surface">
						<sl-checkbox .checked=${this.diagrams.showLine} @sl-change=${() => this.diagrams.toggleShowLine()}>
							${this.message("Kurven anzeigen")}
						</sl-checkbox>
						${this.canAuthor ? html`
							<sl-checkbox .checked=${this.showTitrationMarkers} @sl-change=${(event: Event) => {
								this.showTitrationMarkers = (event.currentTarget as SlCheckbox).checked;
							}}>
								${this.message("Titrationspunkte für Lernende anzeigen")}
							</sl-checkbox>` : nothing}
					</div>
					${this.diagrams.renderCards()}
				</div>
			</aside>`;
	}

	private onDiagramToggle(open: boolean): void {
		if (!this.diagramPanelAvailable || this.diagramPanelOpen === open) return;
		this.closeDiagramPicker();
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
		const resetCanvasLabel = this.message("Arbeitsfläche auf den Ausgangsaufbau zurücksetzen");
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
					<sl-button-group label=${this.message("Zoom")}>
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
					</sl-button-group>
					<sl-button id="buttonFullscreen" size="small" title=${this.message("Vollbild an/aus")}
						aria-label=${this.message("Vollbild an/aus")} @click=${this.toggleFullscreen}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<path d="M6 2H2v4m8-4h4v4m0 4v4h-4m-4 0H2v-4"/>
						</svg>
					</sl-button>
					${this.canAuthor ? nothing : html`
						<sl-button id="resetCanvas" size="small" title=${resetCanvasLabel}
							aria-label=${resetCanvasLabel} @click=${() => this.resetCanvas()}>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
								stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M13.5 8a5.5 5.5 0 1 1-1.7-3.96"/>
								<path d="M13.5 2.5v3.4h-3.4"/>
							</svg>
						</sl-button>
					`}
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
			if (this.#paletteTab === "chemicals") this.startBuilderHydration();
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
		// A locked palette tab leaves the other one, and the drawer names what it
		// still holds. The teacher always keeps both; two locked tabs leave no
		// drawer and no handle, because a handle would open an empty palette.
		const tabs = this.#paletteTabs;
		const tab = this.#paletteTab;
		if (tab === undefined) return nothing;
		const showComponents = tabs.includes("components");
		const showChemicals = tabs.includes("chemicals");
		const label = this.message(this.canAuthor ? "Lehrkraft Steuerung"
			: tabs.length === 1 ? (showComponents ? "Komponenten" : "Chemikalien") : "Komponenten");
		const componentsOpen = this.teacherDrawerOpen && tab === "components";
		const chemicalsOpen = this.teacherDrawerOpen && tab === "chemicals";
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
									this.permissionTooltip = undefined;
								}
							}}>
							${showComponents ? html`
								<sl-tab slot="nav" panel="components" ?active=${tab === "components"}>${this.message("Komponenten")}</sl-tab>
							` : nothing}
							${showChemicals ? html`
								<sl-tab slot="nav" panel="chemicals" ?active=${tab === "chemicals"}>${this.message("Chemikalien")}</sl-tab>
							` : nothing}
							${showComponents ? html`
								<sl-tab-panel name="components" ?active=${tab === "components"}>
									<div class="palette-content">${selected}${guard(componentsOpen
										? [true, this.lang, this.canAuthor, this.invComponents, this.visibleVariants,
											this.componentToPlace, this.permissionTooltip]
										: [false], () => componentsOpen ? this.renderComponentPalette() : noChange)}</div>
								</sl-tab-panel>
							` : nothing}
							${showChemicals ? html`
							<sl-tab-panel name="chemicals" ?active=${tab === "chemicals"}>
								<div class="palette-content">
									${selected}
									${guard(chemicalsOpen
										? [true, this.lang, this.canAuthor, this.chemicalPermissions, this.chemicalQuery,
											this.chemicalGroup, this.activeChemicalConcentrations, this.selectedChemical?.key,
											this.openConcentrationMenu, this.builderAvailable, this.builderReferences, this.sessionBuilderReferences,
											this.savedVesselMixtures, this.sessionVesselMixtures]
										: [false], () => chemicalsOpen ? this.renderChemicalCatalog() : noChange)}
								</div>
							</sl-tab-panel>
							` : nothing}
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
							@pointerenter=${() => this.prefetchComponentTexture(current)}
							@focus=${() => this.prefetchComponentTexture(current)}
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
						<sl-tag class="palette-variant-value" size="small" variant=${currentAllowed ? "primary" : "neutral"}
							title=${variantLabel} aria-live="polite">${variantLabel}</sl-tag>
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
		badge: unknown, body: unknown, options: PaletteCardOptions = {}) {
		const { chemical = false, permissions, activate = nothingToHydrate, action } = options;
		return html`
			<div class="palette-card${chemical ? " palette-card-chemical" : ""}" role="group" aria-label=${name}
				@pointerenter=${activate} @focusin=${activate}>
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
						${action ?? nothing}
					</div>
					${this.canAuthor ? badge : nothing}
				</div>
				${chemical ? html`
					<div class="chemical-card-body">
						<div class="chemical-card-preview" ?inert=${permissions?.open} ?data-menu-open=${permissions?.open}>${body}</div>
						${permissions?.open ? html`
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

	private renderChemicalTile(key: string, name: string, formula: string, recipe: DoseRecipe, src?: string,
		concentrationMolPerL?: number) {
		const label = this.chemicalTileLabel(name, concentrationMolPerL);
		const selection = (): SelectedChemical => ({
			key, name: label,
			recipe: concentrationMolPerL === undefined || "kind" in recipe ? recipe : withConcentration(recipe, concentrationMolPerL),
		});
		return html`
			<button type="button" class="chemical-tile" contenteditable="false"
				aria-label=${label} aria-pressed=${this.selectedChemical?.key === key}
				@pointerdown=${(event: PointerEvent) => this.startChemicalDrag(event, selection(), src)}
				@dragstart=${this.preventNativePaletteDrag}
				@click=${(event: MouseEvent) => {
					if (this.consumePaletteClick(event)) return;
					const wasSelected = this.selectedChemical?.key === key;
					this.clearChemicalSelection();
					this.componentToPlace = undefined;
					if (wasSelected) return;
					this.clearObjectSelection();
					this.selectedChemical = selection();
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
		const customLabel = this.builderText("Custom chemicals", "Eigene Chemikalien");
		const structureLabel = this.builderText("Molecule Builder", "Molekülbaukasten");
		const mixtureLabel = this.builderText("Saved mixtures", "Gespeicherte Gemische");
		const structures = [
			...this.builderReferences.filter(item => this.canAuthor || this.isChemicalAllowed(item.key)),
			...this.sessionBuilderReferences,
		];
		const mixtures = [
			...this.savedVesselMixtures.filter(item => this.canAuthor || this.isChemicalAllowed(item.key)),
			...this.sessionVesselMixtures,
		];
		const hasCustom = !!(structures.length || mixtures.length);
		const customSelected = hasCustom && this.chemicalGroup === CUSTOM_CHEMICAL_GROUP;
		const activeGroup = groupChoices.find((group) => group.id === this.chemicalGroup);
		const activeId = customSelected ? CUSTOM_CHEMICAL_GROUP : activeGroup?.id ?? "all";
		const showHeadings = activeId === "all";
		const allLabel = this.message("Alle Stoffe");
		type Item = (typeof groupChoices)[number]["items"][number];
		const seen = new Set<string>();
		const sections = (customSelected ? [] : activeGroup ? [activeGroup] : groupChoices).flatMap((group) => {
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
		const shownStructures = activeGroup ? [] : structures.filter(item => matches(customLabel, structureLabel, item.structure.name, item.analysis?.formula ?? ""));
		const shownMixtures = activeGroup ? [] : mixtures.filter(item => matches(customLabel, mixtureLabel, item.name,
			...item.recipe.parts.map(({ molecule }) => molecule.formula)));
		const items = [
			...sections.flatMap(({ subgroups }) => subgroups.flatMap(({ items }) => items)),
			...shownStructures.filter(item => item.recipe && this.builderReferences.includes(item))
				.map(item => ({ name: item.key, label: item.structure.name })),
			...shownMixtures.filter(item => this.savedVesselMixtures.includes(item))
				.map(item => ({ name: item.key, label: item.name })),
		];
		const hasResults = !!(sections.length || shownStructures.length || shownMixtures.length);
		return html`
			<div class="chemical-filters">
				<sl-select class="chemical-group-select" size="small" hoist contenteditable="false"
					label=${this.message("Stoffklasse")} .value=${activeId}
					@sl-change=${(event: Event) => {
						this.chemicalGroup = String((event.currentTarget as SlSelect).value);
						this.openConcentrationMenu = undefined;
					}}>
					<sl-option value="all">${allLabel}</sl-option>
					${groupChoices.map((group) => html`<sl-option value=${group.id}>${group.label}</sl-option>`)}
					${hasCustom ? html`<sl-option value=${CUSTOM_CHEMICAL_GROUP}>${customLabel}</sl-option>` : nothing}
				</sl-select>
				<sl-input class="chemical-search" size="small" type="search" clearable contenteditable="false"
					label=${this.message("Chemikalien suchen")} placeholder=${this.message("Name oder Formel suchen")}
					.value=${this.chemicalQuery}
					@sl-input=${(event: Event) => { this.chemicalQuery = (event.currentTarget as SlInput).value; }}>
				</sl-input>
				${this.canAuthor && items.length ? html`
					<div class="chemical-filter-badge">${this.renderChemicalPermissionBadge(customSelected ? customLabel : activeGroup?.label ?? allLabel, items)}</div>` : nothing}
			</div>
			${hasResults ? keyed(activeId, html`
				${repeat(sections, (section) => section.id, (section) => this.renderPaletteSection(
					section.label,
					repeat(section.subgroups, (subgroup) => subgroup.id, (subgroup) => this.renderPaletteSubgroup(
						subgroup.label, section.label,
						repeat(subgroup.items, (item) => item.name, (item) => this.renderChemicalCard(item)),
						showHeadings ? 4 : 3
					)), showHeadings
				))}
				${shownStructures.length || shownMixtures.length ? this.renderPaletteSection(customLabel, html`
					${shownStructures.length ? this.renderPaletteSubgroup(structureLabel, customLabel,
						repeat(shownStructures, item => item.key, item => this.renderBuilderReference(item)), showHeadings ? 4 : 3) : nothing}
					${shownMixtures.length ? this.renderPaletteSubgroup(mixtureLabel, customLabel,
						repeat(shownMixtures, item => item.key, item => this.renderSavedMixture(item)), showHeadings ? 4 : 3) : nothing}
				`, showHeadings) : nothing}`) : html`<p class="palette-empty" role="status">${this.message("Keine Chemikalien gefunden.")}</p>`}
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
		const preview = this.renderChemicalTile(activeKey, name, item.formula, item.recipe, src, active);
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
		const action = this.builderAvailable
			? this.renderStructureAction(() => this.openInBuilder({ key: item.name })) : nothing;
		return this.renderPaletteCard(name, variant, badge, body, { chemical: true, permissions, action });
	}

	private renderSavedMixture(item: SavedMixture) {
		const sharable = this.canAuthor && this.savedVesselMixtures.includes(item);
		const removable = sharable || this.sessionVesselMixtures.includes(item);
		const badge = sharable ? this.renderChemicalPermissionBadge(item.name, [{ name: item.key, label: item.name }]) : nothing;
		const variant = sharable ? this.palettePermissionVariant(Number(this.isChemicalAllowed(item.key)), 1) : "primary";
		const formulas = [...new Set(item.recipe.parts.map(({ molecule }) => molecule.formula))];
		const summary = formulas.length > 3 ? `${formulas.slice(0, 3).join(" · ")} · …` : formulas.join(" · ");
		return this.renderPaletteCard(item.name, variant, badge, html`
			<div class="palette-preview-area palette-variant" title=${formulas.join(" · ")}>
				${this.renderChemicalTile(item.key, item.name, summary, item.recipe)}
				${sharable ? this.renderChemicalPermission(item.key, item.name) : nothing}
			</div>
			${removable ? html`<div class="custom-card-actions">${this.renderSelectionDeleteButton(
				() => this.removeSavedMixture(item), this.builderText("Delete mixture", "Gemisch löschen"))}</div>` : nothing}
		`, { chemical: true });
	}

	private builderText(en: string, de: string) {
		return this.lang?.toLowerCase().startsWith("de") ? de : en;
	}

	/**
	 * Names the data a missing dose waits for, so a rejected compound says what
	 * it needs instead of only refusing the button.
	 *
	 * @private
	 * @param {BuilderGap} [reason] - the gap the recipe reported
	 * @returns {string} the localized reason
	 */
	private builderGapText(reason: BuilderGap | undefined): string {
		if (reason === "identity-missing") return this.builderText(
			"the archive holds no crystal or molecular definition of this compound",
			"das Archiv führt keine Kristall- oder Moleküldefinition dieses Stoffes");
		if (reason === "density-missing") return this.builderText(
			"no solid density is recorded for it",
			"für den Stoff ist keine Schüttdichte hinterlegt");
		if (reason === "ambiguous-density") return this.builderText(
			"several catalog entries share this formula with different densities",
			"mehrere Katalogeinträge teilen diese Formel mit verschiedenen Dichten");
		if (reason === "ions-unsupported") return this.builderText(
			"its ions do not dissolve in the model",
			"seine Ionen lösen sich im Modell nicht");
		if (reason === "concentration-missing") return this.builderText(
			"enter a concentration",
			"gib eine Konzentration ein");
		if (reason === "above-saturation") return this.builderText(
			"that is above the concentration the model carries for this compound",
			"das liegt über der Konzentration, die das Modell für den Stoff trägt");
		if (reason === "pka-series-missing") return this.builderText(
			"the aqueous pKa series of this acid is incomplete",
			"die wässrige pKa-Reihe dieser Säure ist unvollständig");
		return this.builderText("the structure could not be analysed",
			"die Struktur ließ sich nicht auswerten");
	}

	reviewBuilderStructure(snapshot: Structure): boolean {
		const structure = readStructure(snapshot);
		if (!structure || !(structure.kind === "crystal" ? structure.sites.length : structure.atoms.length)) return false;
		this.builderTarget = undefined;
		const review = { structure, loading: true };
		this.builderReview = review;
		void Promise.all([import("./molecule-builder/catalog"), import("./molecule-builder/geometry")]).then(async ([catalog, geometry]) => {
			if (!reviewIsCurrent(this, this.builderReview, review)) return;
			const analysis = analyzeBuilderCompound(structure);
			const match = catalog.matchingRecipe(analysis?.molecule ?? structure) ?? catalog.matchingRecipe(structure);
			const facts = !match && analysis ? await enrichBuilderCompound(analysis) : undefined;
			if (!reviewIsCurrent(this, this.builderReview, review)) return;
			const name = facts?.metadata?.name.slice(0, 160) || structure.name.trim() || analysis?.formula || geometry.formula(structure);
			this.builderReview = { structure: { ...structure, name }, reagent: match?.name, analysis, facts, loading: false };
		}).catch(() => {
			if (reviewIsCurrent(this, this.builderReview, review)) this.builderReview = { structure, loading: false };
		});
		return true;
	}

	private useBuilderReagent(key: string): boolean {
		const item = chemicalCatalog.find(entry => entry.name === key);
		if (!item?.recipe || (!this.canAuthor && !this.isChemicalAllowed(key))) return false;
		const concentration = chemicalConcentration(item);
		const allowed = concentration ? this.allowedConcentrationsFor(key, concentration.initial) : [];
		const active = concentration ? allowed.includes(this.activeChemicalConcentrations[key])
			? this.activeChemicalConcentrations[key] : allowed[0] ?? (this.canAuthor ? concentration.initial : undefined) : undefined;
		if (concentration && active === undefined) return false;
		this.clearChemicalSelection();
		this.clearObjectSelection();
		this.componentToPlace = undefined;
		this.selectedChemical = {
			key: active === undefined ? key : `${key}@${active}`,
			name: this.chemicalTileLabel(this.chemicalDisplayLabel(item), active),
			recipe: active === undefined ? item.recipe : withConcentration(item.recipe, active),
		};
		this.builderReview = undefined;
		return true;
	}

	/**
	 * Stores a reviewed structure as a palette reagent, a weighed solid or a
	 * plain reference.
	 *
	 * The weighed form exists only for a compound the catalog does not already
	 * hold: a catalog solid is selected as that reagent instead, so the palette
	 * never carries a second entry for one substance. Both forms keep the same
	 * key, and both derive their recipe again from the current structure at the
	 * moment of use, so an edited structure cannot dose an old recipe.
	 *
	 * @private
	 * @param {BuilderReview} review - the panel this button belongs to
	 * @param {"stock" | "solid" | "reference"} [form] - the form to store
	 */
	private saveBuilderReference(review: BuilderReview, form: "stock" | "solid" | "reference" = "reference"): void {
		const references = this.canAuthor ? this.builderReferences : this.sessionBuilderReferences;
		if (references.length >= 30 || this.builderReview !== review) return;
		const { structure, analysis } = review;
		if (form === "solid") {
			if (!this.canAuthor || review.reagent || !analysis) return;
			const recipes = builderRecipes(analysis, undefined, review.facts);
			if (!recipes.solid.recipe) return;
			this.storeBuilderReference({ structure, facts: review.facts, phase: "solid" }, analysis);
			return;
		}
		let facts = review.facts;
		let stockConcentration: number | undefined;
		if (form === "stock") {
			if (!this.canAuthor || !analysis?.stockSupported || review.reagent) return;
			const input = this.shadowRoot.querySelector<SlInput>("#builderStockConcentration");
			const manual = this.shadowRoot.querySelector<SlInput>("#builderManualPka");
			stockConcentration = input.valueAsNumber;
			if (manual) {
				const values = manual.value.trim().split(/\s*;\s*|\s+/).filter(Boolean).map(value => Number(value.replace(",", ".")));
				const dissociation = readAqueousAcidBase({ pKa: values, step: analysis.baseSites });
				if (dissociation?.pKa.length !== expectedDissociations(analysis)) {
					manual.setCustomValidity(this.builderText("Enter the requested aqueous pKa values in order.", "Gib die wässrigen pKa-Werte in Reihenfolge ein."));
					manual.reportValidity();
					return;
				}
				facts = { ...facts, dissociation, pKaSource: "manual" };
			}
			if (!input.reportValidity()) return;
			const recipes = builderRecipes(analysis, stockConcentration, facts);
			if (!recipes.stock.recipe) {
				input.setCustomValidity(this.builderGapText(recipes.stock.reason));
				input.reportValidity();
				return;
			}
		}
		this.storeBuilderReference({ structure, facts, stockConcentration }, analysis);
	}

	/** Appends the hydrated compound to the palette it belongs to and opens it. */
	private storeBuilderReference(entry: Omit<BuilderChemical, "key">, analysis?: CompoundAnalysis): void {
		const id = Array.from(crypto.getRandomValues(new Uint32Array(2)), value => value.toString(36)).join("-");
		const item = hydrateBuilderChemical({ ...entry, key: `builder-chemical:${id}` }, analysis);
		if (this.canAuthor) {
			this.builderReferences = [...this.builderReferences, item];
			this.persistAuthoredData();
		} else this.sessionBuilderReferences = [...this.sessionBuilderReferences, item];
		this.openCustomChemicals();
		this.builderReview = undefined;
	}

	private openCustomChemicals(): void {
		// A locked chemical palette has nowhere to show the new reference; the
		// structure is still stored, it just stays invisible for the learner.
		if (this.#hides("hideChemicalPalette")) return;
		this.chemicalGroup = CUSTOM_CHEMICAL_GROUP;
		this.chemicalQuery = "";
		this.openConcentrationMenu = undefined;
		this.teacherTab = "chemicals";
		this.teacherDrawerChoice = this.teacherDrawerOpen = true;
		if (this.containerDiv.clientWidth < MIN_TWO_PANELS_WIDTH) this.closeDiagramPanel();
		this.startBuilderHydration();
		void this.updateComplete.then(() => this.renderRoot.querySelector<SlTabGroup>("#teacherTabs")?.show("chemicals"));
	}

	private toggleMixtureDraft(vessel: chemlib.ChemComponent): void {
		if (this.mixtureDraft?.vessel === vessel) {
			this.mixtureDraft = undefined;
			return;
		}
		const prefix = this.builderText("Mixture", "Gemisch");
		const names = new Set([...this.savedVesselMixtures, ...this.sessionVesselMixtures].map(item => item.name));
		let number = 1;
		while (names.has(`${prefix} ${number}`)) number++;
		this.mixtureDraft = { vessel, name: `${prefix} ${number}` };
		void this.updateComplete.then(() => {
			const input = this.shadowRoot.querySelector<HTMLInputElement>("#mixtureName");
			input?.focus({ preventScroll: true });
			input?.select();
		});
	}

	private saveVesselMixture(vessel: chemlib.ChemComponent): void {
		if (this.curr_obj !== vessel || this.mixtureDraft?.vessel !== vessel) return;
		const input = this.shadowRoot.querySelector<HTMLInputElement>("#mixtureName");
		if (!input) return;
		const name = input.value.trim();
		const recipe = name && snapshotMixture(vessel._content);
		if (!recipe) {
			input.setCustomValidity(name
				? this.builderText("The vessel has no contents to save.", "Das Gefäß hat keinen speicherbaren Inhalt.")
				: this.builderText("Enter a mixture name.", "Gib einen Namen für das Gemisch ein."));
			input.reportValidity();
			return;
		}
		const id = Array.from(crypto.getRandomValues(new Uint32Array(2)), value => value.toString(36)).join("-");
		const saved = { key: `saved-mixture:${id}`, name, recipe };
		if (this.canAuthor) this.savedVesselMixtures = [...this.savedVesselMixtures, saved];
		else this.sessionVesselMixtures = [...this.sessionVesselMixtures, saved];
		this.closeMixtureDraft();
		this.openCustomChemicals();
	}

	private closeMixtureDraft(): void {
		this.mixtureDraft = undefined;
		this.shadowRoot.querySelector<HTMLElement>("#saveVesselMixture")?.focus({ preventScroll: true });
	}

	private removeSavedMixture(item: SavedMixture): void {
		if (this.canAuthor && this.savedVesselMixtures.includes(item)) {
			this.savedVesselMixtures = this.savedVesselMixtures.filter(entry => entry.key !== item.key);
			this.setChemicalBlocked(item.key, false);
		} else this.sessionVesselMixtures = this.sessionVesselMixtures.filter(entry => entry.key !== item.key);
		if (this.selectedChemical?.key === item.key) this.clearChemicalSelection();
	}

	private renderMixtureDraft(vessel: chemlib.ChemComponent) {
		const draft = this.mixtureDraft;
		if (draft?.vessel !== vessel) return nothing;
		const name = this.builderText("Mixture name", "Name des Gemischs");
		const save = this.builderText("Save mixture", "Gemisch speichern");
		return html`<div id="mixtureSaveControls" class="mixture-save-controls" contenteditable="false"
			@keydown=${(event: KeyboardEvent) => {
				if (event.key !== "Escape" || event.isComposing) return;
				event.preventDefault();
				event.stopPropagation();
				this.closeMixtureDraft();
			}}>
			<input id="mixtureName" type="text" maxlength="80" required aria-label=${name} placeholder=${name} .value=${draft.name}
				@input=${(event: Event) => (event.currentTarget as HTMLInputElement).setCustomValidity("")}
				@keydown=${(event: KeyboardEvent) => {
					if (event.key !== "Enter" || event.isComposing) return;
					event.preventDefault();
					event.stopPropagation();
					this.saveVesselMixture(vessel);
				}}/>
			<button type="button" class="object-summary-action save-mixture" aria-label=${save} title=${save}
				@click=${() => this.saveVesselMixture(vessel)}>
				<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
					stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${CONTROL_ICONS.confirm}/></svg>
			</button>
		</div>`;
	}

	private openSpeciesInBuilder(molecule: chemlib.Molecule, name: string) {
		void import("./molecule-builder/catalog").then(({ fromLabMolecule }) => {
			const structure = fromLabMolecule(molecule, name);
			if (structure && this.isConnected) this.openInBuilder({ structure });
		}).catch(error => console.warn("Unable to open a ChemLab species in the builder", error));
	}

	private openInBuilder(target: { key?: string; structure?: Structure }) {
		this.builderReview = undefined;
		this.builderTarget = target;
		const widget = worksheetPeer(this, BUILDER_TAG, this.moleculeBuilderId);
		if (widget) this.sendBuilderPreview(widget);
	}

	private sendBuilderPreview(widget: HTMLElement) {
		const target = this.builderTarget;
		if (!target || !worksheetPeers(this, BUILDER_TAG).includes(widget)) return;
		const receiver = widget as BuilderReceiver;
		const opened = target.structure ? receiver.viewStructure?.(target.structure) : receiver.viewCatalogStructure?.(target.key);
		if (opened) {
			this.builderTarget = undefined;
			widget.scrollIntoView({ block: "nearest" });
		}
	}

	private renderBuilderReference(item: BuilderChemical) {
		const { structure, facts } = item;
		const label = structure.name || this.builderText("Structure", "Struktur");
		// The saved form, derived again from the structure: a weighed solid or the
		// prepared stock, whichever this compound was stored as.
		const dose = item.hydrated ? builderStockFor(item) : undefined;
		const sharable = !!dose && this.canAuthor && this.builderReferences.includes(item);
		const allowed = this.isChemicalAllowed(item.key);
		const remove = () => {
			if (this.canAuthor && this.builderReferences.includes(item)) {
				this.builderReferences = this.builderReferences.filter(entry => entry !== item);
				this.setChemicalBlocked(item.key, false);
				this.persistAuthoredData();
			} else this.sessionBuilderReferences = this.sessionBuilderReferences.filter(entry => entry !== item);
			if (this.selectedChemical?.key === item.key) this.clearChemicalSelection();
		};
		const formula = item.analysis?.formula ?? facts?.metadata?.formula ?? label;
		const badge = sharable ? this.renderChemicalPermissionBadge(label, [{ name: item.key, label }]) : nothing;
		return this.renderPaletteCard(label, sharable ? this.palettePermissionVariant(Number(allowed), 1) : "primary", badge, html`
			<div class="palette-preview-area palette-variant">
				${dose ? html`
					${this.renderChemicalTile(item.key, this.chemicalTileLabel(label, item.stockConcentration), formula, dose)}
					${sharable ? this.renderChemicalPermission(item.key, label) : nothing}` : html`
					<span class="chemical-preview chemical-preview-pending"><span>${formula}</span></span>`}
			</div>
			${item.analysis ? this.renderBuilderFacts(item.analysis, facts,
				item.phase === "solid" ? undefined : item.stockConcentration) : nothing}
			<div class="custom-card-actions">
				${this.canAuthor || this.sessionBuilderReferences.includes(item) ? this.renderSelectionDeleteButton(
					remove, this.builderText("Delete structure", "Struktur löschen")) : nothing}
			</div>
		`, {
			chemical: true,
			activate: () => this.hydrateBuilderReference(item),
			action: this.renderStructureAction(() => this.openInBuilder({ structure })),
		});
	}

	/**
	 * Swaps a saved compound for its hydrated copy. The key stays the same, so the
	 * card keeps its place in the palette and only gains its tile and facts.
	 *
	 * @param {BuilderChemical} item - the restored compound
	 */
	private hydrateBuilderReference(item: BuilderChemical): void {
		if (item.hydrated) return;
		const hydrated = hydrateBuilderChemical(item);
		const swap = (entries: BuilderChemical[]) => entries.map(entry => entry === item ? hydrated : entry);
		this.builderReferences = swap(this.builderReferences);
		this.sessionBuilderReferences = swap(this.sessionBuilderReferences);
	}

	/**
	 * Derives the saved compounds one at a time, so opening the palette pays for
	 * one graph at a time instead of all thirty in the same frame.
	 */
	private startBuilderHydration(): void {
		if (this.builderHydrating) return;
		const pending = pendingBuilderChemicals([...this.builderReferences, ...this.sessionBuilderReferences]);
		if (!pending.length) return;
		this.builderHydrating = true;
		const next = (index: number) => {
			if (!this.isConnected || index >= pending.length) {
				this.builderHydrating = false;
				return;
			}
			this.hydrateBuilderReference(pending[index]);
			setTimeout(() => next(index + 1), 0);
		};
		setTimeout(() => next(0), 0);
	}

	private renderBuilderFacts(analysis: CompoundAnalysis, facts?: CompoundFacts, concentration?: number) {
		const classifications = {
			acid: this.builderText("Acid", "Säure"), base: this.builderText("Base", "Base"),
			ampholyte: this.builderText("Ampholyte", "Ampholyt"), salt: this.builderText("Ionic salt", "Ionensalz"),
			other: this.builderText("Molecular compound", "Molekülverbindung"),
		};
		const pKa = facts?.dissociation?.pKa;
		const cid = facts?.metadata?.cid;
		const source = facts?.pKaSource === "manual" ? this.builderText("Entered manually", "Manuell eingetragen") : facts?.pKaSource;
		return html`<div class="custom-compound-facts">
			<sl-tag size="small">${analysis.formula}</sl-tag>
			<sl-tag size="small" title=${this.builderText("Class inferred from structure", "Stoffklasse aus Struktur abgeleitet")}>
				${classifications[analysis.classification]}</sl-tag>
			${concentration !== undefined ? html`<sl-tag size="small">${this.formatAmount(concentration, 5)} mol/L</sl-tag>`
				: html`<sl-tag size="small">${this.formatAmount(facts?.metadata?.molarMass ?? analysis.molarMass, 5)} g/mol</sl-tag>`}
			${pKa?.length ? html`<sl-tag size="small" title=${source ?? ""}>
				${analysis.classification === "base" ? "pKaH" : "pKa"} ${pKa.map(value => this.formatAmount(value, 5)).join(" · ")}
			</sl-tag>` : nothing}
			${cid ? html`<a href=${`https://pubchem.ncbi.nlm.nih.gov/compound/${cid}#section=Dissociation-Constants`}
				target="_blank" rel="noopener noreferrer">PubChem</a>` : nothing}
			${facts?.pKaSource === iupacSource ? html`<a href="https://github.com/IUPAC/Dissociation-Constants"
				target="_blank" rel="noopener noreferrer" title="IUPAC Digitized pKa Dataset · CC BY-NC 4.0">IUPAC</a>` : nothing}
		</div>`;
	}

	private renderBuilderExchange() {
		const review = this.builderReview;
		const target = this.builderTarget;
		if (!review && !target) return nothing;
		const item = review?.reagent && chemicalCatalog.find(entry => entry.name === review.reagent);
		const permitted = item && (this.canAuthor || this.isChemicalAllowed(item.name));
		const builders = target ? worksheetPeers(this, BUILDER_TAG) : [];
		const recipes = review ? builderRecipes(review.analysis, undefined, review.facts) : undefined;
		const limit = recipes?.limit ?? 1;
		// A sparingly soluble compound is dosed as the saturated stock it really
		// is, instead of offering a concentration the model would refuse.
		const stockValue = String(Number(Math.min(0.1, limit).toPrecision(6)));
		const solidGap = recipes && !recipes.solid.recipe ? recipes.solid.reason : undefined;
		const fallback = !builders.length
			? this.builderText("Place a Molecule Builder in this worksheet to view the structure.", "Platziere einen Molekülbaukasten in diesem Arbeitsblatt, um die Struktur anzusehen.")
			: this.builderText("Choose a Molecule Builder to view the structure.", "Wähle einen Molekülbaukasten für die Strukturansicht.");
		return html`<section class="builder-exchange" aria-live="polite">
			<div class="builder-reference-list">
				<sl-tag size="small" variant="primary">${review?.structure.name || target?.key || this.builderText("Structure", "Struktur")}</sl-tag>
				${review?.loading ? html`<p>${this.builderText("Identifying compound…", "Verbindung wird bestimmt…")}</p>`
				: review ? html`
					${review.analysis ? this.renderBuilderFacts(review.analysis, review.facts) : nothing}
					${permitted ? html`<p>${this.chemicalDisplayLabel(item)}</p>` : nothing}
					${recipes && solidGap ? html`<p class="builder-gap">${this.builderText("No dry dose", "Keine Trockendosis")}:
						${this.builderGapText(solidGap)}</p>` : nothing}
					${review.analysis && expectedDissociations(review.analysis) > 0 && !review.facts?.dissociation
						? html`<p>${this.builderText("Acid–base behavior inferred. No complete aqueous pKa series found.",
							"Säure-Base-Verhalten aus der Struktur abgeleitet. Keine vollständige wässrige pKa-Reihe gefunden.")}</p>` : nothing}
					${this.canAuthor && !review.reagent && review.analysis?.stockSupported ? html`
						<div class="custom-stock-fields">
							<sl-input id="builderStockConcentration" size="small" type="number" min="0.000001" max=${String(limit)}
								step="any" required value=${stockValue}
								label=${this.builderText("Aqueous stock (mol/L)", "Wässrige Stammlösung (mol/L)")}
								@sl-input=${(event: Event) => (event.currentTarget as SlInput).setCustomValidity("")}></sl-input>
							${expectedDissociations(review.analysis) && !review.facts?.dissociation ? html`
								<sl-input id="builderManualPka" size="small" label=${this.builderText("Aqueous pKa (separate values with ;)", "Wässrige pKa (Werte mit ; trennen)")}
									@sl-input=${(event: Event) => (event.currentTarget as SlInput).setCustomValidity("")}></sl-input>` : nothing}
						</div>
						<p>${this.builderText("The stock assumes the compound is dissolved.", "Die Stammlösung setzt voraus, dass der Stoff gelöst ist.")}</p>
						${limit < 1 ? html`<p class="builder-gap">${this.builderText(
							`At most ${this.formatAmount(limit, 3)} mol/L dissolve; a dry dose leaves the rest as sediment.`,
							`Höchstens ${this.formatAmount(limit, 3)} mol/L lösen sich; eine Trockendosis lässt den Rest als Bodensatz stehen.`)}</p>` : nothing}
					` : nothing}
					<div>
						${permitted ? html`<sl-button size="small" variant="primary" @click=${() => this.useBuilderReagent(item.name)}>
							${this.builderText("Select catalog reagent", "Katalogreagenz auswählen")}</sl-button>` : nothing}
						${this.canAuthor && !review.reagent && recipes?.solid.recipe ? html`
							<sl-button size="small" variant="primary" ?disabled=${this.builderReferences.length >= 30}
								@click=${() => this.saveBuilderReference(review, "solid")}>${this.builderText("Save solid", "Feststoff speichern")}</sl-button>` : nothing}
						${this.canAuthor && !review.reagent && review.analysis?.stockSupported ? html`
							<sl-button size="small" variant="primary" ?disabled=${this.builderReferences.length >= 30}
								@click=${() => this.saveBuilderReference(review, "stock")}>${this.builderText("Save aqueous stock", "Stammlösung speichern")}</sl-button>` : nothing}
						<sl-button size="small" ?disabled=${(this.canAuthor ? this.builderReferences : this.sessionBuilderReferences).length >= 30}
							@click=${() => this.saveBuilderReference(review, "reference")}>${this.builderText("Save as reference", "Als Referenz speichern")}</sl-button>
					</div>
				` : html`
					<p>${fallback}</p>
					<div>${builders.map((widget, index) => html`<sl-button size="small" @click=${() => this.sendBuilderPreview(widget)}>
						${widget.id || `Molecule Builder ${index + 1}`}
					</sl-button>`)}</div>
				`}
				<sl-button size="small" @click=${() => { this.builderReview = this.builderTarget = undefined; }}>
					${this.builderText("Close", "Schließen")}
				</sl-button>
			</div>
		</section>`;
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

	private renderCompactAction(label: string, icon: keyof typeof CONTROL_ICONS, action: () => void,
		{ id, primary = false, disabled = false }: { id?: string; primary?: boolean; disabled?: boolean } = {}) {
		return html`<sl-button size="small" class="compact-control-button" id=${id ?? nothing}
			variant=${primary ? "primary" : "default"} title=${label} aria-label=${label} ?disabled=${disabled} @click=${action}>
			<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
				stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${CONTROL_ICONS[icon]}/></svg>
		</sl-button>`;
	}

	private renderAmountMenu() {
		const menu = this.amountMenu;
		const feedback = this.transferFeedback;
		const route = menu ?? feedback;
		if (!route) return nothing;
		const vesselName = (vessel: chemlib.ChemComponent) => `${this.itemName(vessel._type)} ${vessel._id + 1}`;
		const from = "vessel" in route.from ? vesselName(route.from.vessel) : route.from.name;
		const transfer = "vessel" in route.from;
		const title = this.message(transfer ? "Inhalt übertragen" : "Stoff hinzufügen");
		const capacity = route.target._volume;
		const volume = Math.max(0, Math.min(capacity, route.target._content.contentVolume * 1000));
		const fillLabel = `${this.formatAmount(volume, 4)} / ${this.formatAmount(capacity, 5)} mL`;
		const changeAmount = (value: number) => this.setAmount(value);
		return html`
			<section id="amountMenu" class="selection-info" data-wide data-transfer-phase=${menu ? "manual" : feedback.phase}
				tabindex=${menu ? -1 : nothing} contenteditable="false" aria-labelledby="amountMenuTitle"
				@keydown=${this.handleAmountMenuKey}>
				<div class="amount-menu-heading">
					<strong id="amountMenuTitle">${title}</strong>
					${menu ? html`<sl-button-group class="amount-menu-actions" label=${title}>
						${this.renderCompactAction(this.message(menu.max > 0 ? "Abbrechen" : "Schließen"), "cancel", this.dismissAmountMenu)}
						${menu.max > 0 ? this.renderCompactAction(this.message(transfer ? "Übertragen" : "Hinzufügen"), "confirm",
							this.confirmAmount.bind(this), { primary: true, disabled: menu.amount <= 0 }) : nothing}
					</sl-button-group>` : nothing}
				</div>
				<div class="amount-menu-route">
					<sl-tag size="small" variant="neutral">${from}</sl-tag>
					<span class="amount-menu-arrow" aria-hidden="true">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor">
							<path d="M2.5 8h10m-4-4 4 4-4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
					<sl-tag size="small" variant="primary">${vesselName(route.target)}</sl-tag>
				</div>
				<div class="transfer-meter" role="meter" aria-label=${this.message("Füllstand")} aria-valuemin="0"
					aria-valuemax=${capacity} aria-valuenow=${volume} aria-valuetext=${fillLabel}
					style=${`--transfer-progress: ${volume / capacity}`}>
					<span class="transfer-progress-fill"></span><span>${fillLabel}</span>
				</div>
				${menu ? (menu.max > 0 ? renderValueControl({
					label: this.message("Menge"), unit: "mL", value: menu.amount, min: 0, max: menu.max,
					hint: `max. ${this.formatAmount(menu.max, 7)} mL`,
					step: 0.1, rangeStep: menu.max >= 1 ? 1 : menu.max >= 0.1 ? 0.1 : menu.max / 10, locale: this.lang,
					decreaseLabel: this.message("Menge verringern"), increaseLabel: this.message("Menge erhöhen"),
					invalidLabel: this.message("Gib eine Zahl ein."),
					onChange: changeAmount, onInput: changeAmount,
				}) : html`<span class="transfer-caption" role="status">${this.message("Keine Menge verfügbar.")}</span>`)
					: this.renderTransferFeedback(feedback)}
			</section>`;
	}

	private renderTransferFeedback(feedback: TransferFeedback) {
		if (feedback.phase === "arming") {
			return html`<div class="transfer-caption">${feedback.gesture === "drop"
				? this.builderText("Release to choose an amount. Hold to pour.", "Loslassen für Mengenwahl. Halten zum Füllen.")
				: this.builderText("Release for one dose. Keep holding to fill.", "Loslassen für Einzeldosis. Halten zum Füllen.")}</div>
				${feedback.progress === undefined ? nothing : html`<div class="transfer-hold-track" role="progressbar"
					aria-label=${this.builderText("Time held over the vessel", "Wartezeit über dem Gefäß")}
					aria-valuenow=${Math.round(feedback.progress * 100)} style=${`--transfer-progress: ${feedback.progress}`}>
					<span class="transfer-progress-fill"></span>
				</div>`}`;
		}
		const note = feedback.phase === "limit"
			? this.builderText("Transfer limit reached", "Transfergrenze erreicht")
			: feedback.phase === "running" ? this.builderText("Release to stop", "Loslassen zum Stoppen") : "";
		return html`<div class="transfer-caption transfer-result">
			<span>${note}</span>
			${feedback.amount > 0 ? html`<strong>+${this.formatAmount(feedback.amount, 4)} mL</strong>` : nothing}
		</div>`;
	}

	private renderGroupSummary() {
		if (this.#hides("hideObjectActions")) return nothing;
		const selected = this.canvas.selectedObjects;
		if (!selected.length) return nothing;
		const title = this.builderText("Selected objects", "Ausgewählte Objekte");
		const count = this.builderText(`${selected.length} selected`, `${selected.length} ausgewählt`);
		const center = this.builderText("Centre selection", "Auswahl zentrieren");
		const clear = this.builderText("Clear selection", "Auswahl aufheben");
		const components = new Map([...this.allChemComponents, ...this.allEComponents]
			.map(component => [`${component._type}:${component._id}`, component]));
		const focusCanvas = () => this.app?.canvas.focus({ preventScroll: true });
		return html`
			<section id="groupSelectionInfo" class="selection-info" data-wide aria-label=${title} contenteditable="false">
				<div class="object-summary-heading">
					<sl-tag size="small" variant="primary">${count}</sl-tag>
					<div class="object-summary-actions">
						<sl-button-group label=${title}>
							${this.renderCompactAction(center, "fit", () => this.canvas.centerComponents(this.canvas.selectedObjects.map(({ label }) => label)))}
							${this.renderCompactAction(clear, "cancel", () => {
								this.canvas.clearGroupSelection();
								focusCanvas();
							})}
						</sl-button-group>
						${this.renderSelectionDeleteButton(() => {
							this.removeObjects(this.canvas.selectedObjects);
							focusCanvas();
						})}
					</div>
				</div>
				<ul class="group-selection-list" aria-label=${title}>
					${repeat(selected, sprite => sprite.label, (sprite, index) => {
						const [type, id] = sprite.label.split(":");
						const component = components.get(sprite.label);
						const variantId = component instanceof chemlib.ElectricComponent ? component._variantId : undefined;
						const variant = componentVariant(variantId);
						const name = `${this.objectSummaryName(type, variantId)} ${Number(id) + 1}`;
						const detail = component instanceof chemlib.ChemComponent && component._volume > 0
							? `max. ${this.formatAmount(component._volume, 4)} mL`
							: variant?.material && this.message(variant.material.name);
						const select = this.builderText(`Select only ${name}`, `Nur ${name} auswählen`);
						const remove = this.builderText(`Remove ${name} from selection`, `${name} aus Auswahl entfernen`);
						return html`<li class="group-selection-row">
							<button type="button" class="group-selection-object" title=${select} aria-label=${select}
								@click=${() => { this._getObject(sprite); focusCanvas(); }}>
								<sl-tag size="small" variant="primary">${name}</sl-tag>
								${detail ? html`<small>${detail}</small>` : nothing}
							</button>
							${this.renderCompactAction(remove, "minus", () => {
								this.canvas.removeFromGroupSelection(sprite);
								void this.updateComplete.then(() => {
									const rows = this.groupSummary?.querySelectorAll<HTMLElement>(".group-selection-row sl-button");
									if (rows?.length) rows[Math.min(index, rows.length - 1)].focus();
									else focusCanvas();
								});
							})}
						</li>`;
					})}
				</ul>
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
		const route = this.amountMenu ?? this.transferFeedback;
		if (!route || !this.app) return;
		const summary = this.shadowRoot.querySelector<HTMLElement>("#amountMenu");
		const { width, height } = this.app.screen;
		const anchor = route.anchor;
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

	/**
	 * The compact control that opens a compound in the molecule builder. It
	 * carries the same box as the object card's actions, so a palette card and
	 * a vessel carousel slide show one affordance; the text lives in the label
	 * and the tooltip only.
	 *
	 * @private
	 * @param {() => void} open - opens the structure in the builder
	 * @returns {unknown} the icon button
	 */
	private renderStructureAction(open: () => void) {
		const label = this.builderText("View structure", "Struktur ansehen");
		return html`
			<button type="button" class="object-summary-action structure-action" contenteditable="false"
				aria-label=${label} title=${label} @click=${open}>
				<svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none"
					stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
					<circle cx="8" cy="8.6" r="1.9"/>
					<circle cx="8" cy="2.7" r="1.4"/>
					<circle cx="3" cy="11.6" r="1.4"/>
					<circle cx="13" cy="11.6" r="1.4"/>
					<path d="M8 6.7V4.1M6.6 9.5 4.3 10.8M9.4 9.5l2.3 1.3"/>
				</svg>
			</button>`;
	}

	private renderSelectionDeleteButton(remove: () => void, label = this.message("löschen")) {
		return html`
			<button type="button" class="remObj object-summary-action" aria-label=${label} title=${label} @click=${remove}>
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
			</button>`;
	}

	private emptyVessel(vessel: chemlib.ChemComponent): void {
		this.mixtureDraft = undefined;
		this.stopDose?.(true);
		this.finishDragTransfer();
		this.closeAmountMenu();
		this.hideTransferFeedback();
		const previous = vessel._content;
		vessel._content = chemlib.StructureManager.newMixture();
		for (const device of this.allEComponents) {
			if (device._connectedMix === previous) device._connectedMix = vessel._content;
		}
		this.measurements.record([vessel]);
		this.canvas.markVesselChanged(vessel);
		this.saveSelectedComponent({ content: "", vol: 0, doses: [] });
		this._updatePopup();
		this.requestUpdate();
	}

	private renderValveControls(vessel: chemlib.ChemComponent) {
		const burette = vessel._type === chemlib.ComponentType.Burette;
		if (!burette && vessel._type !== chemlib.ComponentType.Separatingfunnel) return nothing;
		const task = `transfer${vessel._type}:${vessel._id}`;
		const flowing = this.simulation.hasTask(task);
		const volume = vessel.buretteStepMl;
		const setStep = (amount: number) => {
			if (!vessel.setBuretteStepMl(amount)) return;
			this.requestUpdate();
		};
		const actions = html`<sl-button-group class="device-actions" label=${this.itemName(vessel._type)}>
			${burette ? this.renderCompactAction(this.message("Einzeldosis"), "drop", () => {
				if (this.stepTitration(vessel)) return;
				this._notify(this.message(!vessel._content._activeMolecules.length ? "Die Bürette ist leer."
					: !this.canvas.titrationTarget(vessel) ? "Platziere ein Gefäß unter der Bürette."
					: "Das Zielgefäß kann nichts mehr aufnehmen."));
			}, { id: "dispenseBurette", disabled: flowing }) : nothing}
			${this.renderCompactAction(this.message(flowing ? "Hahn schließen" : "Hahn öffnen"), flowing ? "stop" : "play", () => {
				if (flowing) this.simulation.stopTask(task);
				else this.simulation.startExperiment(task, () => this.stepTitration(vessel));
				this.requestUpdate();
				this._sendxAPiStatement(flowing ? "completed" : "started", task);
			}, { id: "openComp", primary: flowing })}
		</sl-button-group>`;
		return keyed(vessel, html`
			<div class="device-controls" ?data-adjustable=${burette}>
				${burette ? renderValueControl({
					label: this.message("Dosierschritt"), unit: "mL", value: volume, actions,
					min: Number.MIN_VALUE * 1000, max: Number.MAX_VALUE, rangeMin: .01, rangeMax: 1, step: .01,
					locale: this.lang, invalidLabel: this.message("Gib eine Zahl ein."), onInput: setStep, onChange: (amount) => {
						setStep(amount);
						this.saveSelectedComponent({ stepVolumeMl: vessel.buretteStepMl });
					},
				}) : actions}
			</div>`);
	}

	private renderElectricalControls(device: chemlib.ElectricComponent) {
		const { Source, Multimeter } = chemlib.EComponentType;
		const source = device._type === Source;
		if (!source && device._type !== Multimeter) return nothing;
		const mode = source ? device._sourceMode : device._meterMode;
		const current = mode === "current";
		const changeMode = (next: "voltage" | "current") => {
			if (next === mode) return;
			if (source) {
				device._sourceMode = next;
				this.saveSelectedComponent({ sourceMode: next });
			} else {
				device._meterMode = next;
				device._visibleVoltage = device._visibleCurrent = null;
				this.saveSelectedComponent({ meterMode: next });
			}
			this.canvas.refreshDeviceDisplay(device);
			this._updatePopup();
			this.requestUpdate();
		};
		const key = current ? "_sourceCurrent" : "_sourceVoltage";
		const value = Math.abs(device[key] ?? 0);
		const setpoint = (next: number) => {
			device[key] = next;
			this.canvas.refreshDeviceDisplay(device);
			this.requestUpdate();
		};
		const actions = html`<div class="device-actions">
			<sl-button-group class="device-mode" label=${this.message(source ? "Betriebsart" : "Messbereich")}>
				${(["voltage", "current"] as const).map(next => {
					const label = this.message(next === "voltage"
						? source ? "Spannung vorgeben" : "Spannung" : source ? "Stromstärke vorgeben" : "Stromstärke");
					return html`<sl-button size="small" class="compact-control-button" data-mode=${next}
						variant=${mode === next ? "primary" : "default"}
						aria-pressed=${mode === next} aria-label=${label} title=${label} @click=${() => changeMode(next)}>
						${next === "voltage" ? "V" : "A"}</sl-button>`;
				})}
			</sl-button-group>
		</div>`;
		return keyed(device, html`
			<div class="device-controls" ?data-adjustable=${source}>
				${source ? renderValueControl({
					label: this.message(current ? "Sollstrom" : "Sollspannung"), unit: current ? "A" : "V", value, actions,
					min: 0, max: Number.MAX_VALUE, rangeMax: current ? 2 : 30,
					step: current ? .01 : .1, rangeStep: current ? .01 : .5,
					locale: this.lang, invalidLabel: this.message("Gib eine Zahl ein."), onInput: setpoint, onChange: (next) => {
						setpoint(next);
						this.saveSelectedComponent(current ? { current: next } : { voltage: next });
						this._sendxAPiStatement("submitted", `${current ? "current" : "voltage"} ${device._type}:${device._id}`);
					},
				}) : actions}
			</div>`);
	}

	private renderElectricalPower(device: chemlib.ElectricComponent) {
		if (device._type !== chemlib.EComponentType.Source && !isPassiveMeter(device)) return nothing;
		const task = `echem${device._type}:${device._id}`;
		const active = this.simulation.hasTask(task);
		return this.renderCompactAction(this.message(active ? "Ausschalten" : "Einschalten"), "power", () => {
			this.canvas.setDeviceActive(device, !active);
			if (active) {
				this.simulation.stopTask(task);
				this.circuits.reconcile();
				this.clearEChemReadings(device);
			} else this.startElectricalExperiment(task, device);
			this._updatePopup();
			this.requestUpdate();
			this._sendxAPiStatement(active ? "completed" : "started", task);
		}, { id: "activateEComp", primary: active });
	}

	private renderElectricalSettings(device: chemlib.ElectricComponent) {
		const { Cable, Electrode, Source } = chemlib.EComponentType;
		if (device._type === Cable) return nothing;
		const connections = device.partners.flatMap(cable => {
			const other = cable.partners.find(end => end !== device);
			return other ? [{ cable, other }] : [];
		});
		const hasElectrode = device._type === Electrode && componentVariant(device._variantId)?.reference === undefined;
		const materials = this.canAuthor && hasElectrode
			? componentVariants.electrode.filter(variant => variant.material)
			: [];
		const material = materials.find(variant => variant.material?.name === device._material?.name);
		const hasSource = device._type === Source;
		const passiveMeter = isPassiveMeter(device);
		const hasLabel = device._type === chemlib.EComponentType.Label;
		if (!hasSource && !passiveMeter && !hasLabel && !hasElectrode && !connections.length) return nothing;
		const label = (other: chemlib.ElectricComponent) => `${this.itemName(other._type)} · ${other._id + 1}`;
		// A source has two poles, and the electrode on the plus pole is the
		// anode. The select names the electrodes, so the user never has to
		// think about which cable went into which terminal.
		const plusPole = hasSource ? chemlib.ComponentManager.terminalElectrode(device, 0) : undefined;
		const minusPole = hasSource ? chemlib.ComponentManager.terminalElectrode(device, 1) : undefined;
		const poles = plusPole && minusPole && plusPole !== minusPole
			? { plus: plusPole, minus: minusPole } : undefined;
		const settings = this.canAuthor && (hasSource || passiveMeter || hasLabel || hasElectrode);
		if (!settings && !connections.length) return nothing;
		const settingsLabel = this.message(settings ? "Erweiterte Einstellungen" : "Verbunden mit");
		return keyed(device, html`
			<sl-details class="electrical-settings" title=${settingsLabel}
				@sl-after-show=${() => this.canvas.drawSelection()} @sl-after-hide=${() => this.canvas.drawSelection()}>
				<span slot="summary">${settingsLabel}</span>
				<svg slot="expand-icon" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
					stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
				<svg slot="collapse-icon" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
					stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 10 4-4 4 4"/></svg>
				${settings && hasSource ? keyed(device._sourceMode, device._sourceMode === "current" ? html`
					<sl-input size="small" type="number" min="0" step="any" contenteditable="false"
						label=${this.message("Grenzspannung in V")} .value=${String(device._complianceVoltage)}
						@sl-change=${(event: Event) => {
							const input = event.currentTarget as SlInput;
							const value = input.valueAsNumber;
							if (Number.isFinite(value) && value >= 0) {
								device._complianceVoltage = value;
								this.saveSelectedComponent({ complianceVoltage: value });
							}
							input.value = String(device._complianceVoltage);
						}}></sl-input>`
					: html`<sl-input size="small" type="number" min="0" step="any" contenteditable="false"
						label=${this.message("Strombegrenzung in A (0 = unbegrenzt)")} .value=${String(device._sourceCurrent ?? 0)}
						@sl-change=${(event: Event) => {
							const input = event.currentTarget as SlInput;
							const value = input.value === "" ? 0 : input.valueAsNumber;
							if (Number.isFinite(value) && value >= 0) {
								device._sourceCurrent = value;
								this.saveSelectedComponent({ current: value });
							}
							input.value = String(device._sourceCurrent);
						}}></sl-input>`) : nothing}
				${settings && passiveMeter ? this.renderRCSettings(device) : nothing}
				${settings && hasLabel ? html`
					<sl-input id="labelText" size="small" contenteditable="false"
						label=${this.message("Beschriftung")} .value=${device._labelText ?? ""}></sl-input>
					<sl-button size="small" @click=${() => {
						device._labelText = this.shadowRoot.querySelector<SlInput>("#labelText").value;
						this.saveSelectedComponent({ labelText: device._labelText });
						this.canvas.refreshDeviceDisplay(device);
						this._updatePopup();
					}}>${this.message("bestätigen")}</sl-button>` : nothing}
				${settings && hasElectrode ? html`
					<sl-input id="electrodeArea" size="small" type="number" min="0.1" step="0.1" contenteditable="false"
						label=${this.message("Benetzte Fläche in cm²")}
						.value=${device._area > 0 ? String(device._area) : ""}
						placeholder=${String(Math.round(device.activeArea * 100) / 100)}></sl-input>
					<sl-input id="electrodeReference" size="small" type="number" step="0.01" contenteditable="false"
						label=${this.message("Bezugspotential in V (leer = keine Referenz)")}
						.value=${device._reference === undefined ? "" : String(device._reference)}></sl-input>
					<sl-button size="small" @click=${() => {
						const area = Number.parseFloat(this.shadowRoot.querySelector<SlInput>("#electrodeArea").value);
						const raw = this.shadowRoot.querySelector<SlInput>("#electrodeReference").value.trim();
						const reference = raw === "" ? Number.NaN : Number.parseFloat(raw);
						device._area = Number.isFinite(area) && area > 0 ? area : 0;
						device._reference = Number.isFinite(reference) ? reference : undefined;
						this.saveSelectedComponent({ area: device._area, reference: device._reference });
						this.queueSurfaceDisplacement(device);
						this.canvas.refreshDeviceDisplay(device);
						this._updatePopup();
					}}>${this.message("bestätigen")}</sl-button>` : nothing}
				${settings && poles ? html`
					<sl-select size="small" hoist contenteditable="false" label=${this.message("Polung")}
						.value=${live(String(device._polarity ?? 0))} @sl-change=${(event: Event) => {
							const polarity = Number((event.currentTarget as SlSelect).value);
							device._polarity = polarity === 1 ? 1 : polarity === -1 ? -1 : 0;
							this.saveSelectedComponent({ polarity: device._polarity });
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
					}}>
						<sl-option value="0">${this.message("automatisch")}</sl-option>
						<sl-option value="1">${this.message("Plus an")} ${label(poles.plus)}</sl-option>
						<sl-option value="-1">${this.message("Plus an")} ${label(poles.minus)}</sl-option>
					</sl-select>` : nothing}
				${materials.length ? html`
					<sl-select size="small" hoist contenteditable="false" label=${this.message("Elektrodenmaterial")}
						placeholder=${device._material ? this.itemName(device._material.name) : this.message("kein Material")}
						.value=${live(material?.id ?? "")} @sl-change=${(event: Event) => {
							const selected = componentVariant(String((event.currentTarget as SlSelect).value));
							if (!selected?.material) return;
							device._variantId = selected.id;
							device._material = this.newElectrodeMaterial(selected.material);
							device._bodyMol = null;
							device._plating.clear();
							const formula = device._material._kekule_obj.calcFormula().getDisplayText();
							this.saveSelectedComponent({ material: formula, variantId: selected.id });
							this.queueSurfaceDisplacement(device);
							this.canvas.refreshDeviceDisplay(device);
							this._updatePopup();
							this._sendxAPiStatement("submitted", `ElectrodeMaterlial ${formula}:${device._id}`);
						}}>
						${materials.map(variant => html`<sl-option value=${variant.id}>${this.message(variant.material?.name ?? "")}</sl-option>`)}
					</sl-select>` : nothing}
				${connections.length ? html`
					<div class="connection-list">
						${settings ? html`<span class="connection-list-label">${this.message("Verbunden mit")}</span>` : nothing}
						${connections.map(({ other }) => html`<sl-tag size="small" variant="neutral">${label(other)}</sl-tag>`)}
					</div>` : nothing}
			</sl-details>
		`);
	}

	private renderRCSettings(device: chemlib.ElectricComponent) {
		const config = device._rcSettings;
		const defaultMicrofarads = (device.defaultRCCapacitance ?? 0) * 1e6;
		return html`
			<sl-details summary=${this.message("Kapazitiver Zellstrom (RC-Modell)")}
				@sl-after-show=${() => this.canvas.drawSelection()} @sl-after-hide=${() => this.canvas.drawSelection()}>
				<p>${defaultMicrofarads > 0
					? this.message("Für getrennte Halbzellen gilt standardmäßig ein Modellwert von {value} µF. 0 schaltet das RC-Modell aus.", { value: defaultMicrofarads })
					: this.message("Näherung für getrennte Halbzellen ohne Ionenverbindung. Mit leerer Kapazität bleibt sie aus.")}</p>
				<sl-input id="rcCapacitance" type="number" step="any" size="small" contenteditable="false"
					label=${this.message("Effektive Kapazität [µF]")}
					placeholder=${defaultMicrofarads > 0 ? String(defaultMicrofarads) : ""}
					.value=${config === null ? "0" : config ? String(config.capacitance * 1e6) : ""}></sl-input>
				<sl-input id="rcResistance" type="number" step="any" size="small" contenteditable="false"
					label=${this.message("Zusätzlicher Reihenwiderstand [Ω]")}
					.value=${String(config?.seriesResistance ?? 0)}></sl-input>
				<sl-input id="rcCutoff" type="number" step="any" size="small" contenteditable="false"
					label=${this.message("Stromschwelle [µA]")} placeholder="1 %"
					.value=${config?.cutoff === undefined ? "" : String(config.cutoff * 1e6)}></sl-input>
				<sl-button size="small" @click=${() => {
					const value = (id: string) => this.shadowRoot.querySelector<SlInput>(id).value.trim();
					const rawCapacitance = value("#rcCapacitance");
					const capacitance = rawCapacitance ? Number(rawCapacitance) * 1e-6 : device.defaultRCCapacitance;
					const seriesResistance = Number(value("#rcResistance"));
					const rawCutoff = value("#rcCutoff");
					const cutoff = rawCutoff ? Number(rawCutoff) * 1e-6 : undefined;
					let next: chemlib.ElectricComponent["_rcSettings"];
					if (capacitance === 0) next = null;
					else if (capacitance !== undefined && (rawCapacitance || seriesResistance !== 0 || rawCutoff)) {
						next = { capacitance, seriesResistance, cutoff };
					}
					if (next && !validRCSettings(next)) return;
					device._rcSettings = next;
					this.saveSelectedComponent({ rcSettings: next });
					const task = `echem${device._type}:${device._id}`;
					if (this.simulation.hasTask(task)) {
						this.rcReadouts.delete(device);
						this.startElectricalExperiment(task, device);
					}
					this._updatePopup();
					this.requestUpdate();
				}}>${this.message("bestätigen")}</sl-button>
			</sl-details>`;
	}

	private renderElectricalReadouts(device: chemlib.ElectricComponent) {
		const { Source, Voltmeter, Multimeter, Electrode, Bridge, GasCollector, Label } = chemlib.EComponentType;
		const type = device._type;
		const source = type === Source;
		const value = (reading: number, unit: string, magnitude: boolean) =>
			Number.isFinite(reading) ? `${this.formatAmount(magnitude ? Math.abs(reading) : reading, 4)} ${unit}` : `— ${unit}`;
		const tag = (text: string, label?: string) => html`<span class="device-reading"
			title=${label ?? text}>${text}</span>`;
		const readouts = (items: unknown) => html`<div class="device-readouts">${items}</div>`;

		if (source || isPassiveMeter(device)) {
			const voltage = type === Voltmeter || (type === Multimeter && device._meterMode === "voltage");
			const rc = this.hasRCReadout(device) ? this.rcReadouts.get(device) : undefined;
			const details = source && this.simulation.hasTask(`echem${type}:${device._id}`) ? html`
				<p>${this.message("Polung")}: ${this.polarityReading(device)}</p>
				<p>Faraday: ${this.formatAmount(this.cellCurrent(device) / chemlib.Simulation._faradayConst, 3)} mol e⁻/s</p>`
				: rc ? this.renderRCReadout(device, rc) : nothing;
			return html`
				${readouts(html`
					${source || voltage ? tag(value(device._visibleVoltage, "V", false), this.message("Gemessene Spannung")) : nothing}
					${source || !voltage ? tag(value(device._visibleCurrent, "A", true), this.message("Gemessene Stromstärke")) : nothing}
				`)}
				${details !== nothing ? html`<details class="device-diagnostics" @toggle=${() => this.canvas.drawSelection()}>
					<summary>${this.message(rc ? "Kapazitiver Zellstrom (RC-Modell)" : "Messdetails")}</summary>${details}
				</details>` : nothing}`;
		}
		if (type === Electrode) {
			const material = device._material;
			const deposit = device.plating;
			const power = material && chemlib.ComponentManager.isCircuit(device).slice(2).find(component => component._type === Source);
			const redox = power && chemlib.oxidationOf(material.smilesString);
			const rate = redox && chemlib.Simulation.faradayLaw(this.cellCurrent(power), redox.el, material.getTotMolMass());
			return html`
				${readouts(tag(this.message(device._connectedMix ? "eingetaucht" : "nicht eingetaucht")))}
				${deposit ? html`<p>${this.message("abgeschieden")}: ${this.formatAmount(deposit.mol * deposit.molecule.getTotMolMass(), 3)}
					g ${deposit.molecule._kekule_obj.calcFormula().getDisplayText()}</p>` : nothing}
				${rate ? html`<details class="device-diagnostics" @toggle=${() => this.canvas.drawSelection()}>
					<summary>Faraday (z = ${redox.el})</summary>
					<p>${this.message("Stoffmengenrate")}: ${this.formatAmount(rate.substanceMol, 3)} mol/s</p>
					<p>${this.message("Massenrate")}: ${this.formatAmount(rate.massGrams, 3)} g/s</p>
				</details>` : nothing}`;
		}
		if (type === Bridge) {
			const legs = device._bridgeMixes.flatMap(mix => {
				const vessel = this.allChemComponents.find(component => component._content === mix);
				return vessel ? [`${this.itemName(vessel._type)} · ${vessel._id + 1}`] : [];
			});
			return legs.length ? readouts(legs.map(name => tag(name))) : readouts(tag(this.message("kein Gefäß")));
		}
		if (type === GasCollector) {
			const mix = device._connectedMix;
			const escaped = Math.max(0, (mix?.evolvedGasMol ?? 0) - device._tubeBaseline);
			return readouts(tag(`${this.formatAmount(escaped * chemlib.molarGasVolume(mix?._temperature, mix?._pressure) * 1000, 3)} mL`,
				this.message("gesammelt")));
		}
		return type === Label ? html`<p>${device._labelText || this.message("kein Text")}</p>` : nothing;
	}

	private renderRCReadout(device: chemlib.ElectricComponent, { sample, timeConstant, cutoffAt }: RCReadout) {
		const number = (value: number) => value.toPrecision(4);
		const duration = (seconds: number) => {
			if (seconds >= 1) return `${number(seconds)} s`;
			if (seconds >= 1e-3 || seconds === 0) return `${number(seconds * 1000)} ms`;
			return `${number(seconds * 1e6)} µs`;
		};
		return html`
			${device._rcSettings === undefined && device.defaultRCCapacitance
				? html`<p>${this.message("Modellwert: {value} µF", { value: device.defaultRCCapacitance * 1e6 })}</p>` : nothing}
			<p>I: ${number(sample.current)} A</p>
			<p>Q: ${number(sample.charge * 1e6)} µC</p>
			<p>ΔQ: ${number(sample.transferredCharge * 1e6)} µC</p>
			<p>${this.message("Gegenspannung")}: ${number(sample.opposingVoltage)} V</p>
			<p>${this.message("Treibende Spannung")}: ${number(sample.drivingVoltage)} V</p>
			<p>τ: ${duration(timeConstant)}</p>
			<p>${this.message("Dauer bis zur Stromschwelle")}: ${duration(cutoffAt)}</p>`;
	}

	private objectSummaryName(type: string, variantId?: string): string {
		const variant = componentVariant(variantId);
		return variant?.reference !== undefined ? this.message(variant.size) : this.itemName(type);
	}

	private renderObjectSummary() {
		if (this.#hides("hideObjectActions")) return nothing;
		const vessel = this.curr_obj instanceof chemlib.ChemComponent ? this.curr_obj : undefined;
		const device = this.curr_obj instanceof chemlib.ElectricComponent ? this.curr_obj : undefined;
		const name = this.objectSummaryName(this.curr_name.split(":")[0], device?._variantId);
		const material = device?._material && this.itemName(device._material.name);
		const emptyLabel = this.message("Objekt leeren");
		const saveLabel = this.builderText("Save contents as mixture", "Inhalt als Gemisch speichern");
		return html`
			<section id="contextInfoBox" class="selection-info" ?hidden=${!this.curr_obj}>
				<div class="object-summary-heading">
					<sl-tag size="small" variant="primary" title=${material || nothing}>${name}</sl-tag>
					<div class="object-summary-actions">
						${device ? this.renderElectricalPower(device) : nothing}
						${vessel?._content._activeMolecules.length ? html`
							<button type="button" class="object-summary-action empty-vessel"
								aria-label=${emptyLabel} title=${emptyLabel} @click=${() => this.emptyVessel(vessel)}>
								<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor"
									stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M1.5 7 7 1.5 11 5.5 9 5.5 5 9.5a1 1 0 0 1-1.5 0L1.5 7Z"/>
									<path d="M11.5 8.5c.8 1 2 2.4 2 3.5a2 2 0 0 1-4 0c0-1.1 1.2-2.5 2-3.5Z"/>
								</svg>
							</button>
							<button id="saveVesselMixture" type="button" class="object-summary-action save-mixture"
								aria-label=${saveLabel} title=${saveLabel} aria-expanded=${this.mixtureDraft?.vessel === vessel}
								aria-controls="mixtureSaveControls" @click=${() => this.toggleMixtureDraft(vessel)}>
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
									stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${CONTROL_ICONS.save}/></svg>
							</button>` : nothing}
						${this.renderSelectionDeleteButton(() => this._removeSprite())}
					</div>
				</div>
				${vessel ? html`${this.renderMixtureDraft(vessel)}${this.renderValveControls(vessel)}` : nothing}
				<div id="contextEchemInfo" ?hidden=${!device}></div>
				<sl-carousel id="contextMolInfo" pagination mouse-dragging slides-per-page="1" slides-per-move="1"
					aria-label=${this.message("Inhalt")} hidden></sl-carousel>
				<div id="contextMixInfo" style="display: none"></div>
				${device ? html`${this.renderElectricalControls(device)}${this.renderElectricalSettings(device)}` : nothing}
			</section>
		`;
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
