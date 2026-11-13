import { drawerLabels, effectiveLanguage, localize } from "./localization/localization";
import { html, LitElement, nothing, PropertyValueMap } from "lit";
import { repeat } from "lit/directives/repeat.js";
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

import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js";
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.component.js";
import SlBadge from "@shoelace-style/shoelace/dist/components/badge/badge.component.js";
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js";
import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.component.js";
import SlSplitPanel from "@shoelace-style/shoelace/dist/components/split-panel/split-panel.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlRating from "@shoelace-style/shoelace/dist/components/rating/rating.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
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
	Config,
	adjectives,
	colors,
	animals,
} from "unique-names-generator";
import Chart from "chart.js/auto";

import { HALF_PI, isNumber } from "chart.js/helpers";

import { dictionary as germanDictionary } from "./data/dictionary";
import { pHColors as phColorScale } from "./data/phColors";
import { defaultMolecules, defaultMixtures } from "./data/presets";
import { sendXApiStatement } from "./services/xapi";
import { DiagramController } from "./controllers/DiagramController";
import { SimulationController } from "./controllers/SimulationController";
import { componentGraphic, componentVariant, componentVariants, type ComponentVariant, type PaletteComponent } from "./data/componentGraphics";
import { renderComponentPaletteIcon } from "./data/componentPaletteIcons";
import { chemicalCatalogGroups, isWaterDefinition, withConcentration, type ChemicalRecipe, type MoleculeDefinition } from "./data/chemicals";
import { loadMoleculeDefinition } from "./data/moleculeDefinition";
import { catalogPreviews } from "./data/chemicalPreviews.generated";
import { prepareDose, type SavedDose } from "./data/measuredDose";
import { STANDARD_CANVAS_HEIGHT } from "./controllers/WorkspaceCamera";
import { CanvasController } from "./controllers/CanvasController";

type SelectedChemical = { key: string; name: string; recipe: ChemicalRecipe };
type ChemicalConcentration = { initial: number; max: number; stock?: number };
const MIN_CONCENTRATION = 0.001;
type AmountSource = { name: string; recipe: ChemicalRecipe; dose: (volumeMl: number) => chemlib.Mixture } |
	{ vessel: chemlib.ChemComponent };

const TRANSFER_HOLD_MS = 1500;
const TRANSFER_HOLD_RADIUS = 6;
const DRAG_TRANSFER_TASK = "drag-transfer";

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
		panelVariant: {
			type: "select" as const,
			group: "appearance",
			label: { _: "Panel layout", "de-DE": "Panel-Ansicht" },
			options: [
				{ value: "1", label: { _: "All panels", "de-DE": "Alle Bereiche" } },
				{ value: "2", label: { _: "Content and molecule", "de-DE": "Inhalt und Molekül" } },
				{ value: "3", label: { _: "Content only", "de-DE": "Nur Inhalt" } },
			],
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
		this.updateLocalizedControls();
		if (this.hasUpdated) {
			this.displayedGridWidthMm = undefined;
			this.canvas.updateScaleReadouts();
			this._updatePopup();
		}
	});

	private localizeControl(element: Pick<HTMLElement, "dataset">, property: "label" | "title" | "textContent" | "placeholder", source: string) {
		element.dataset.message = source;
		element.dataset.messageProperty = property;
		Reflect.set(element, property, this.message(source));
	}

	private updateLocalizedControls() {
		this.shadowRoot?.querySelectorAll<HTMLElement>("[data-message]").forEach(element => {
			Reflect.set(element, element.dataset.messageProperty!, this.message(element.dataset.message!));
		});
		this.shadowRoot?.querySelectorAll<HTMLElement>("[data-element-name]").forEach(element => {
			element.title = this.itemName(element.dataset.elementName!) + "\n" + this.itemName(element.dataset.elementCategory!);
		});
		this.diagrams.updateLabels();
	}

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
	/**
	 * molecule editor area in the teacher drawer
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#molConfig")
	private accessor molConfig: HTMLDivElement;
	/**
	 * mixture editor area in the teacher drawer
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#mixConfig")
	private accessor mixConfig: HTMLDivElement;
	/**
	 * molecule list element inside the tab panel
	 *
	 * @private
	 * @type {SlCarousel}
	 */
	@query("#mixCarousel")
	private accessor mixCarousel: SlCarousel;
	/**
	 * confirmation dialog box element
	 *
	 * @private
	 * @type {SlDialog}
	 */
	@query("#confirmDialog")
	accessor confirmDialog: SlDialog;
	/**
	 * input for molar amounts of molecules
	 *
	 * @private
	 * @type {SlInput}
	 */
	@query("#molAmount")
	private accessor molAmount: SlInput;
	/**
	 * search field for filtering element data
	 *
	 * @private
	 * @type {SlInput}
	 */
	@query("#elemSearch")
	private accessor elemSearch: SlInput;
	/**
	 * main panel tab for current component
	 *
	 * @private
	 * @type {HTMLElement}
	 */
	@query("#settings_drawer")
	private accessor settings_drawer: HTMLElement;
	/**
	 * shoelace badge for labeling possible conent in a component
	 *
	 * @private
	 * @type {SlTag}
	 */
	@query("#property_badge")
	private accessor property_tag: SlTag;
	/**
	 * molecule select for new bonds
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#bond_1")
	private accessor bond_sel_1: SlSelect;
	/**
	 * molecule select for new bonds
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#bond_2")
	private accessor bond_sel_2: SlSelect;
	/**
	 * bond type select
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#bond_3")
	private accessor bond_sel_3: SlSelect;
	/**
	 * select for e-component connection partners 
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#newECon")
	private accessor conSelect: SlSelect;
	/**
	 * slider for bond magnitude of new bonds
	 *
	 * @private
	 * @type {HTMLInputElement}
	 */
	@query("#bondMag")
	private accessor bondMag: HTMLInputElement;
	/**
	 * container for the connection view of the panel
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#conInfo")
	private accessor eConInfo: HTMLDivElement;
	/**
	 * container for the information view of the panel
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#compInfo")
	private accessor eCompInfo: HTMLDivElement;
	/**
	 * shoelace alert element for all messages
	 *
	 * @private
	 * @type {SlAlert}
	 */
	@query("#dialogOverview")
	private accessor dialogAlert: SlAlert;
	/**
	 * container inside object context menu showing molar info
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#contextMolInfo")
	private accessor contextMolInfo: HTMLDivElement;
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
	 * select for premade molecules inside the panel
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#molSelect")
	private accessor molSelect: SlSelect;
	/**
	 * select for premade mixtures inside the panel
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#mixSelect")
	private accessor mixSelect: SlSelect;
	/**
	 * input for the volume of premade mixtures
	 *
	 * @private
	 * @type {SlInput}
	 */
	@query("#mixVolAmount")
	private accessor mixVolAmount: SlInput;
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
	 * part of the tab panels split panel element, contains element overview and molecule split panel
	 *
	 * @private
	 * @type {SlSplitPanel}
	 */
	@query("#atom_panel")
	private accessor atomPanel: SlSplitPanel;
	/**
	 * part of the tab panels split panel element, contains molecule carousel and molecule editor
	 *
	 * @private
	 * @type {SlSplitPanel}
	 */
	@query("#molecule_panel")
	private accessor moleculePanel: SlSplitPanel;


	/**
	 * color palet for pH indication
	 *
	 * @private
	 * @type {object}
	 */
	@property({ attribute: false })
	private accessor pHColors: object = phColorScale;
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
	 * show colored element symbols
	 *
	 * @private
	 * @type {number}
	 */
	@property({ attribute: false })
	private accessor useColoredElements: number = 1;
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
	 * Tracks whether the atom options have already been loaded.
	 *
	 * @private
	 * @type {boolean}
	 */
	private atomsListed = false;
	/**
	 * which e-component info to show in the panel
	 *
	 * @private
	 * @type {boolean[]}
	 */
	@property({ attribute: false })
	private accessor eCompPanelVisible: boolean[] = [false, false, false];
	/**
	 * list of available electrode materials
	 *
	 * @private
	 * @type {{}}
	 */
	@property({ attribute: false })
	private accessor electrodeMaterials = [];
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
	 * list of currently filtered element categories
	 *
	 * @private
	 * @type {string[]}
	 */
	@property({ attribute: false })
	private accessor filterCategories: string[] = [];
	/**
	 * the currently selected component/e-component object
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	accessor curr_obj: any = null;

	@state()
	private accessor objectPanelOpen = false;

	@state() private accessor fullWidthMode = false;
	@state() private accessor diagramPanelOpen = false;
	@state() private accessor teacherDrawerOpen = false;
	private teacherDrawerChoice?: boolean;
	private workspaceResizeObserver?: ResizeObserver;
	private workspaceClassObserver?: MutationObserver;
	@state() private accessor teacherTab: "components" | "chemicals" = "components";
	@state() private accessor permissionTooltip: { anchor: HTMLElement; type: PaletteComponent; text: string } | undefined;
	@state() private accessor visibleVariants: Partial<Record<PaletteComponent, string>> = {};
	@state() private accessor componentToPlace: string | undefined;
	@state() private accessor selectedChemical: SelectedChemical | undefined;
	@state() private accessor chemicalConcentrations = new Map<string, number>();
	@state() private accessor editingConcentration: string | undefined;
	@state() private accessor amountMenu: {
		target: chemlib.ChemComponent;
		anchor: PIXI.Container;
		from: AmountSource;
		amount: number;
		max: number;
		editing?: boolean;
	} | undefined;
	@state() private accessor fillMeter: { x: number; y: number; volume: number; capacity: number } | undefined;
	private chemicalPreviews = new Map<string, string>();
	private pendingChemicalPreviews = new Map<string, MoleculeDefinition>();
	private chemicalPreviewFrame?: number;
	@state() private accessor chemicalCatalogOpened = false;
	@state() private accessor chemicalQuery = "";
	@state() private accessor openedChemicalSections = new Set(["Salze"]);
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

	@state()
	private accessor editingMolecule = false;
	/**
	 * the currently modified molecule object
	 *
	 * @private
	 * @type {chemlib.Molecule}
	 */
	@property({ attribute: false })
	private accessor curr_mol: chemlib.Molecule = null;
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
	 * the current panel variant
	 *
	 * @private
	 * @type {string}
	 */
	@property({ type: String, reflect: true })
	private accessor panelVariant: string = "1";
	/**
	 * if an action is permitted or aborted
	 *
	 * @private
	 * @type {number}
	 */
	@property({ attribute: false })
	accessor confirmAction: number = 0; //0-pending,1-true,2-false
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
	private accessor smilesDrawer150: SmilesDrawer = null
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
		this.smilesDrawer150 = new SmilesDrawer.SvgDrawer({ width: 150, height: 150, explicitHydrogens: true, compactDrawing: false });
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
			"sl-button-group": SlButtonGroup,
			"sl-split-panel": SlSplitPanel,
			"sl-tag": SlTag,
			"sl-divider": SlDivider,
			"sl-range": SlRange,
			"sl-select": SlSelect,
			"sl-option": SlOption,
			"sl-rating": SlRating,
			"sl-input": SlInput,
			"sl-alert": SlAlert,
			"sl-carousel": SlCarousel,
			"sl-carousel-item": SlCarouselItem,

			"sl-card": SlCard,
			"sl-checkbox": SlCheckbox,

			"sl-tooltip": SlTooltip,
			"sl-popup": SlPopup,
			"sl-tab": SlTab,
			"sl-tab-group": SlTabGroup,
			"sl-tab-panel": SlTabPanel,
			"sl-dialog": SlDialog,
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
		this.ownerDocument.defaultView?.cancelAnimationFrame(this.chemicalPreviewFrame);
		this.chemicalPreviewFrame = undefined;
		this.pendingChemicalPreviews.clear();
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
		const drawer = this.shadowRoot.getElementById("teacherDrawer");
		const drawerStyle = getComputedStyle(drawer);
		const triggerHeight = Number.parseFloat(drawerStyle.getPropertyValue("--panel-trigger-height"));
		const triggerInset = Number.parseFloat(drawerStyle.getPropertyValue("--teacher-drawer-trigger-inset"));
		const standardDrawerBody = 240;
		this.teacherDrawerOpen = this.teacherDrawerChoice ??
			(this.containerDiv.clientHeight >= STANDARD_CANVAS_HEIGHT + standardDrawerBody + triggerHeight + 2 * triggerInset);
	}

	protected updated(changed: PropertyValueMap<any>): void {
		super.updated(changed);
		if (!this.canAuthor && this.teacherTab === "chemicals") {
			this.shadowRoot.querySelector<SlTabGroup>("#teacherTabs").show("components");
		}
		if (!this.canAuthor || changed.has("invComponents")) this.permissionTooltip = undefined;
		if (changed.has("panelVariant")) this._changePanelVariant();
		if (["availableMolecules", "availableMixtures", "availableComponents", "invComponents"].some((name) => changed.has(name))) {
			this.persistAuthoredData();
		}
		if (this.app && this.refreshFromRemoteData) {
			this.refreshFromRemoteData = false;
			if (changed.has("availableMolecules")) {
				this._listMolecules();
				this.molConfig.replaceChildren();
				this._listMolConfig();
			}
			if (changed.has("availableMixtures")) {
				this._listMixtures();
				this.mixConfig.replaceChildren();
				this._listMixConfig();
			}
			if (changed.has("availableComponents")) {
				this.stopDose?.();
				this.cancelDoseForNavigation();
				this.closeAmountMenu();
				this.hideFillMeter();
				this.simulation.stopExperiments();
				this.curr_obj = null;
				this.curr_name = "";
				this.curr_stage_index = -1;
				this.editingMolecule = false;
				this.objectPanelOpen = false;
				this.canvas.clearSprites();
				this.allChemComponents = [];
				this.allEComponents = [];
				this.electrodeMaterials = [];
				this.avComponentsSprites = [];
				this._loadComponents();
			}
		}
		if (this.canvas.selectedObjects.length || changed.has("curr_obj") || changed.has("curr_name") || changed.has("editingMolecule")) {
			this.canvas.drawSelection();
		}
		if (changed.has("amountMenu")) this.positionAmountMenu();
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
		if (Array.isArray(value.availableComponents)) this.availableComponents = value.availableComponents;
		if (Array.isArray(value.invComponents)) {
			const componentNames = Object.keys(chemlib.ComponentType).concat(Object.keys(chemlib.EComponentType));
			this.invComponents = value.invComponents.map(value => String(value).trim()).filter(Boolean).map(value =>
				componentNames.find(key => this.dictionary[key.toLowerCase()] === value)?.toLowerCase() ?? value.toLowerCase()
			);
		}
	}

	private readAuthoredData() {
		const block = this.dataBlock();
		if (!block || this.updatingDataBlock) return;
		try {
			const value = JSON.parse(block.textContent ?? "");
			if (!value || typeof value !== "object") return;
			const incoming = JSON.stringify({
				availableMolecules: value.availableMolecules ?? this.availableMolecules,
				availableMixtures: value.availableMixtures ?? this.availableMixtures,
				availableComponents: value.availableComponents ?? this.availableComponents,
				invComponents: value.invComponents ?? this.invComponents,
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
			availableMolecules: this.availableMolecules,
			availableMixtures: this.availableMixtures,
			availableComponents: this.availableComponents,
			invComponents: this.invComponents,
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
			this._emitAlert(this.message("Die Arbeitsfläche konnte nicht geladen werden."), "danger", true);
			return;
		}
		// The first load uses the latest authored data, including updates during asset loading.
		this.refreshFromRemoteData = false;
		this.focus();
		setAnimation(this.dialogAlert, "alert.show", {
			keyframes: [{ opacity: "0" }, { opacity: "1" }],
			options: {
				duration: 50,
			},
		});

		setAnimation(this.dialogAlert, "alert.hide", {
			keyframes: [{ opacity: "1" }, { opacity: "0" }],
			options: {
				duration: 50,
			},
		});

		this.simulation.startLoop(() => this.canvas.flushChanges());
		this._listMolecules();
		this._listMixtures();
		this._listMolConfig();
		this._listMixConfig();
		this._loadComponents();
		this._changePanelVariant();
		if (this.canAuthor) {
			this.localizeControl(this.settings_drawer, "textContent", "neues Molekül");
			this._newMol();
			this._listAtoms();
			this.moleculePanel.position = 0;
			this.shadowRoot.getElementById("addToElectrode").style.visibility =
				"hidden";
			this.molAmount.style.visibility = "hidden";
			this.molSelect.style.visibility = "hidden";
			this.shadowRoot.getElementById("comp_panel").style.display = "";
			this.shadowRoot.getElementById("ecomp_panel").style.display =
				"none";
			this.curr_mol._bondTypes.forEach((key) => {
				if(key in this.dictionary && key!= "hydrogen"){
					// @ts-ignore
					let bondType: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					this.localizeControl(bondType, "textContent", this.dictionary[key]);
					bondType.value = key;
					this.bond_sel_3.appendChild(bondType);
				}
			});

		}

		this._sendxAPiStatement("registered", "chemlab");
		this._emitAlert(
			this.message("klicke zum Starten in das Fenster!"),
			"success",
			true,
			10000
		);
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
					if (
						sprite.y - sprite.height / 2 >
							currSprite.y + currSprite.height / 2 &&
						(sprite.x < currSprite.x + currSprite.width / 2 ||
							sprite.x > currSprite.x - currSprite.width / 2)
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
			chemlib.Simulation.sEChem(
				circuitComps[0],
				circuitComps[1],
				circuitComps[2]
			);

			const firstMix = circuitComps[0]._connectedMix;
			const secondMix = circuitComps[1]._connectedMix;
			for (const vessel of this.allChemComponents) {
				if (vessel._content === firstMix || vessel._content === secondMix) this.canvas.markVesselChanged(vessel);
			}
			if (circuitComps.includes(this.curr_obj) ||
				this.curr_obj?._content === firstMix || this.curr_obj?._content === secondMix) this._updatePopup();
			this.diagrams.appendEChemPoint(source, circuitComps);
		}
		this.canvas.refreshDeviceDisplay(source, !!circuitComps);
	}

	private operatingCircuit(device: chemlib.ElectricComponent): chemlib.ElectricComponent[] | undefined {
		const circuit = chemlib.ComponentManager.isCircuit(device);
		if (circuit[2] === device && circuit.slice(0, 2).every((electrode) =>
			electrode._type === chemlib.EComponentType.Electrode && electrode._connectedMix?._isSolution)) return circuit;
	}

	private runningCurrent(source: chemlib.ElectricComponent): number {
		const ticker = `echem${source._type}:${source._id}`;
		return this.simulation.hasTask(ticker) && this.operatingCircuit(source)
			? source._sourceCurrent || 0 : 0;
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

	private startComponentDrag(event: PointerEvent, variant: ComponentVariant): void {
		if (!this.canAuthor && !this.isVariantAllowed(variant)) return;
		let preview: PIXI.Container | undefined;
		this.startPaletteDrag(event, {
			start: () => {
				const { type, capacityMl, material } = variant;
				let model: chemlib.ChemComponent | chemlib.ElectricComponent;
				if (capacityMl !== undefined) {
					const vessel = new chemlib.ChemComponent(-1, type as chemlib.ComponentType);
					vessel._volume = capacityMl;
					model = vessel;
				} else {
					model = new chemlib.ElectricComponent(-1, type as chemlib.EComponentType, {
						nMaterial: material && this.newElectrodeMaterial(material),
						nSourceVoltage: type === chemlib.EComponentType.Source && this.canAuthor ? 0 : undefined,
						nSourceCurrent: type === chemlib.EComponentType.Source && this.canAuthor ? 0 : undefined,
					});
				}
				preview = this.canvas.createPlacementPreview(model);
			},
			move: (pointer) => {
				const point = this.canvas.worldPointFromViewport(pointer.clientX, pointer.clientY);
				preview.visible = !!point;
				if (point) preview.position.copyFrom(this.canvas.snapPosition(point.x, point.y));
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

	placeSelectedComponent(x: number, y: number): boolean {
		const variant = componentVariant(this.componentToPlace);
		this.componentToPlace = undefined;
		return variant ? this.addPaletteComponent(variant, x, y) : false;
	}

	private addPaletteComponent(variant: ComponentVariant, x: number, y: number): boolean {
		if (!this.canAuthor && !this.isVariantAllowed(variant)) return false;
		const position = this.canvas.snapPosition(x, y);
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
				if (material) device._material = this.newElectrodeMaterial(material);
				this.allEComponents.push(device);
				component = device;
			}
			const sprite = this.canvas.addComponentView(component);
			sprite.position.copyFrom(position);
			return true;
		}
		const entry = {
			type, variantId, pos: [position.x, position.y], capacityMl, vol: 0, content: "",
			voltage: 0, current: 0, material: "", connections: [],
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

	private previewMolecule(definition: MoleculeDefinition): string | undefined {
		const key = JSON.stringify(definition);
		if (!this.chemicalPreviews.has(key) && this.teacherTab === "chemicals" && this.teacherDrawerOpen) {
			this.pendingChemicalPreviews.set(key, definition);
			this.scheduleChemicalPreview();
		}
		return this.chemicalPreviews.get(key);
	}

	private scheduleChemicalPreview(): void {
		if (this.chemicalPreviewFrame !== undefined) return;
		this.chemicalPreviewFrame = this.ownerDocument.defaultView?.requestAnimationFrame(() => {
			this.chemicalPreviewFrame = undefined;
			if (!this.isConnected || !this.canAuthor || !this.teacherDrawerOpen || this.teacherTab !== "chemicals") {
				this.pendingChemicalPreviews.clear();
				return;
			}
			const next = this.pendingChemicalPreviews.entries().next();
			if (next.done) return;
			const [key, definition] = next.value;
			this.pendingChemicalPreviews.delete(key);
			try {
				const molecule = loadMoleculeDefinition(definition);
				this.chemicalPreviews.set(key, chemlib.StructureManager.printMolecule(molecule, 80, 60, 14));
			} catch {
				this.chemicalPreviews.set(key, "");
			}
			this.requestUpdate();
			if (this.pendingChemicalPreviews.size) this.scheduleChemicalPreview();
		});
	}

	private buildDose(recipe: ChemicalRecipe) {
		return prepareDose(recipe, (definition) => this._loadMolecule(definition.formula, false, definition));
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

	private addMeasuredDose(target: chemlib.ChemComponent, dose: (volumeMl: number) => chemlib.Mixture, requestedMl: number): number {
		const portion = dose(requestedMl);
		const fraction = target._content.fractionThatFits(portion, target._volume / 1000);
		const volumeMl = requestedMl * fraction;
		if (volumeMl <= 1e-8) return 0;
		target.addContents({ nMix: fraction === 1 ? portion : dose(volumeMl) });
		this.canvas.markVesselChanged(target);
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
		if (!this.canAuthor || !selected) return false;
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
			if (!("vessel" in from) && !this.canAuthor) {
				this.finishDragTransfer();
				return;
			}
			drag.heldMs += elapsedMs;
			if (drag.heldMs < drag.nextDoseMs) return;
			drag.active = true;
			const steps = 1 + Math.floor((drag.heldMs - drag.nextDoseMs) / 50);
			drag.nextDoseMs += steps * 50;
			const requestedMl = steps * 0.4;
			const added = "vessel" in from
				? this.transferMeasuredVolume(from.vessel, target, requestedMl)
				: this.addMeasuredDose(target, from.dose, requestedMl);
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
			this.canvas.markVesselChanged(source);
			this.canvas.markVesselChanged(target);
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
		if (!this.canAuthor) return;
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
				this.clearObjectSelection(true);
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
			if (!this.canAuthor) {
				this.closeAmountMenu();
				return;
			}
			result = this.addMeasuredDose(target, from.dose, amount);
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
		if (!this.canAuthor || !selected) return false;
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
			totalMl += this.addMeasuredDose(target, dose, requestedMl);
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

	/**
	 * updates the information shown for the selected object
	 *
	 * @private
	 */
	private _updatePopup(): void {
		if (!this.curr_obj || this.editingMolecule) return;
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
			this.contextMolInfo.style.display = "";
			this.contextMolInfo.innerHTML = "";
			this.contextMixInfo.innerHTML = "";
			this.curr_obj._content._activeMolecules.forEach((mol) => {
				let formula: string = mol._kekule_obj
					.calcFormula()
					.getDisplayText();
				this.contextMolInfo.innerHTML += `
                <div style="display:flex; align-items: flex-start; justify-content: space-between; padding-top: 5px; padding-bottom: 5px">
                    <sl-tag id="contextTag" size="small" variant="neutral" title=${
						mol.name
					} style="margin-right: 10px; margin-left: 5px">${formula}</sl-tag>
                    <div style="display:flex; flex-direction:column; border-radius: 2px; background-color: #fff; margin-right: 5px">
                    <p>
                    n: ${this.curr_obj._content._molProperties[
						mol._id + "n"
					].toExponential(2)} mol
                    </p>
                    <p>
                    m: ${this.curr_obj._content._molProperties[
						mol._id + "m"
					].toExponential(2)} g
                    </p>
                    </div>
                </div>
                `;
				this.contextMolInfo.innerHTML += `<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl-divider>`;
			});
			if (
				this.curr_obj._type === chemlib.ComponentType.Burette ||
				this.curr_obj._type === chemlib.ComponentType.Separatingfunnel
			) {
				this.openBtn.style.display = "";
			}
			const mixture = this.curr_obj._content as chemlib.Mixture;
			const volume = mixture.contentVolume;
			if (volume > 0) {
				this.contextMixInfo.style.display = "";
				const pH = mixture._isSolution ? chemlib.Simulation.getpH(mixture) : undefined;
				this.contextMixInfo.innerHTML += `
					<div style="display: flex; flex-direction: column">
				<p>vol: ${(volume * 1000).toFixed(1)} mL</p>
						${pH === undefined ? "" : `<p>pH: ${pH}</p>`}
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					</div>
                `;
				this.contextMixInfo.style.borderLeftColor = pH === undefined ? "" : this.pHColors[Math.round(pH)];
			}
		}
		if (
			Object.values(chemlib.EComponentType).includes(
				this.curr_obj._type.toLowerCase() as chemlib.EComponentType
			)
		) {
			this.contextEchemInfo.style.display = "";
			this.contextEchemInfo.innerHTML = "";
			if (
				this.curr_obj._type === chemlib.EComponentType.Source ||
				this.curr_obj._type === chemlib.EComponentType.Voltmeter
			) {
				this.activateEComp.style.display = "";
				if (this.curr_obj._type === chemlib.EComponentType.Voltmeter) {
					const reading = this.voltageReading(this.curr_obj);
					this.shadowRoot.getElementById("shownVoltage").textContent = reading;
					this.contextEchemInfo.innerHTML = `
						<p>${this.message("Spannung")}: ${reading}</p>
						<p>${this.message("Modellstrom")}: ${this.curr_obj._sourceCurrent} A</p>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				} else {
					const current = this.runningCurrent(this.curr_obj);
					let electronMolRate: number =
						current / chemlib.Simulation._faradayConst;
					this.contextEchemInfo.innerHTML = `
						<div style="display: flex; flex-direction: column">
							<p>Stromstärke: ${current.toExponential(2)} A</p>
							<p>Faraday, 1. Gesetz: ${electronMolRate.toExponential(
								2
							)} mol e⁻/s</p>
						</div>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				}
			} else if (this.curr_obj._type === chemlib.EComponentType.Ammeter) {
				this.contextEchemInfo.innerHTML = `<p>${this.message("Modellspannung")}: ${this.curr_obj._sourceVoltage} V</p>
					<p>${this.message("Strommessung noch nicht verfügbar")}</p>`;
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
				let circuitComps: chemlib.ElectricComponent[] =
					typeof material != "undefined"
						? chemlib.ComponentManager.isCircuit(this.curr_obj)
						: [];
				if (
					circuitComps.length === 3 &&
					circuitComps[2]._type === chemlib.EComponentType.Source
				) {
					let device: chemlib.ElectricComponent = circuitComps[2];
					let redox = chemlib.Simulation.getRedoxData(material);
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
		const newSelection = this.editingMolecule || this.curr_name !== name;
		this.editingMolecule = false;
		let chemlib_obj = null;

		let type: string = name.split(":")[0];
		let id: number = Number.parseInt(name.split(":")[1]);

		this.localizeControl(this.settings_drawer, "textContent", this.dictionary[type] ?? type);

		if (
			Object.values(chemlib.ComponentType).includes(
				type.toLowerCase() as chemlib.ComponentType
			)
		) {
			this.shadowRoot.getElementById("ecomp_panel").style.display =
				"none";
			this.shadowRoot.getElementById("comp_panel").style.display = "";

			this.mixCarousel.innerHTML = "";
			this._listAtoms();

			this.curr_mol = null;
			this._newMol();

			if (this.bond_sel_3.innerHTML === "") {
				this.curr_mol._bondTypes.forEach((key) => {
					if(key in this.dictionary && key!= "hydrogen"){
						// @ts-ignore
						let bondType: SlOption = this.shadowRoot.createElement(
							"sl-option"
						) as SlOption;
						this.localizeControl(bondType, "textContent", this.dictionary[key]);
						bondType.value = key;
						this.bond_sel_3.appendChild(bondType);
					}
				});
			}

			this.allChemComponents.forEach((comp) => {
				if (
					comp._type === (type as chemlib.ComponentType) &&
					comp._id === id
				) {
					chemlib_obj = comp;
				}
			});

			this.mixVolAmount.max = chemlib_obj._volume;

			if (chemlib_obj._content._activeMolecules.length > 0) {
				this.property_tag.variant = "primary";
				this.localizeControl(this.property_tag, "textContent", "Inhalt");
			} else {
				this.property_tag.variant = "warning";
				this.localizeControl(this.property_tag, "textContent", "leer");
			}

			let canvas_arr: string[] =
				chemlib.StructureManager.printMolecules_arr(
					chemlib_obj._content,
					100,
					100
				);
			chemlib_obj._content._activeMolecules.forEach(async (mol) => {
				let currIndex =
					chemlib_obj._content._activeMolecules.indexOf(mol);
				let img = document.createElement("svg");
				img.style.width = "190px"
				img.style.height = "80px"
				let infoDiv = document.createElement("div");
				infoDiv.style.display = "flex";
				infoDiv.style.flexDirection = "row";
				infoDiv.style.justifyContent = "space-between"
				infoDiv.style.overflow = "hidden";
				infoDiv.style.width = "150px";
				infoDiv.style.height = "80px";
				infoDiv.style.borderStyle = "solid";
				infoDiv.style.borderRadius = "5px";
				infoDiv.style.borderWidth = "2px";
				infoDiv.style.borderColor = "#0284c7";
				infoDiv.appendChild(img);
				if(this.newSmilesDrawer === 1){
					SmilesDrawer.parse(mol.smilesString, (tree)=> {
						this.smilesDrawer100.draw(tree, img, 'light');
					}, (err) => {
						console.log("Fallback rendering for " + mol.name + "("+mol.smilesString+")")
						img.remove()
						let fallbackImg = document.createElement("img")
						fallbackImg.style.width = "190px"
						fallbackImg.style.height = "80px"
						fallbackImg.src = canvas_arr[chemlib_obj._content._activeMolecules.indexOf(mol)]
						infoDiv.appendChild(fallbackImg)
					})
				}else{
					img.remove()
					let fallbackImg = document.createElement("img")
					fallbackImg.style.width = "190px"
					fallbackImg.style.height = "80px"
					fallbackImg.src = canvas_arr[chemlib_obj._content._activeMolecules.indexOf(mol)]
					infoDiv.appendChild(fallbackImg)
				}
				// @ts-ignore
				let cItem: SlCarouselItem = this.shadowRoot.createElement(
					"sl-carousel-item"
				) as SlCarouselItem;
				cItem.appendChild(infoDiv);
				this.mixCarousel.appendChild(cItem);
				chemlib.StructureManager.getChemData(
					chemlib_obj._content._activeMolecules[currIndex]
				);
				await this.waitUntil(
					() =>
						chemlib_obj._content._activeMolecules[currIndex].name !=
						""
				);
				if (this.curr_obj === chemlib_obj) this._updatePopup();
				infoDiv.innerHTML += `
                        <div style="display: block; background-color: #fdfdfd; border-radius: 5px; overflow: hidden">
                            <h5 title="${
								chemlib_obj._content._activeMolecules[currIndex]
									.name
							}">${
					chemlib_obj._content._activeMolecules[currIndex].name
				}</h5>
                            <p style="margin-bottom: 0px">${
								"n: " +
								chemlib_obj._content._molProperties[
									mol._id + "n"
								].toExponential(2)
							}</p>
                            <p style="margin-bottom: 0px">${
								"m: " +
								chemlib_obj._content._molProperties[
									mol._id + "m"
								].toExponential(2)
							}</p>
                            <p style="margin-bottom: 0px">${
								chemlib_obj._content._isSolution
									? "c:" +
									  chemlib_obj._content._molProperties[
											mol._id + "c"
									  ].toExponential(2)
									: ""
							}</p>
                        </div>
                    `;
			});
		}

		if (
			Object.values(chemlib.EComponentType).includes(
				type.toLowerCase() as chemlib.EComponentType
			)
		) {
			this.shadowRoot.getElementById("comp_panel").style.display = "none";
			this.shadowRoot.getElementById("ecomp_panel").style.display = "";

			this.allEComponents.forEach((comp) => {
				if (
					comp._type === (type as chemlib.EComponentType) &&
					comp._id === id
				) {
					chemlib_obj = comp;
				}
			});

			this.conSelect.innerHTML = "";
			this.allEComponents.forEach((eComp) => {
				if (typeof eComp != "undefined") {
					if (
						eComp._id != chemlib_obj._id &&
						!chemlib_obj._connections.includes(eComp) &&
						eComp._type.toLowerCase() != "cable"
					) {
						// @ts-ignore
						let option: SlOption = this.shadowRoot.createElement(
							"sl-option"
						) as SlOption;
						option.value =
							eComp._type +
							":" +
							this.allEComponents.indexOf(eComp);
						option.innerHTML = this.itemName(eComp._type);
						option.onpointerover = (event) => {
							this.canvas.world.children.forEach((sprite) => {
								if (
									Number.parseInt(
										sprite.label.split(":")[1]
									) === eComp._id &&
									sprite.label.split(":")[0] === eComp._type
								) {
									this.canvas._tintSprite(sprite, 0xbbf7d0);
								}
							});
						};
						option.onpointerout = (event) => {
							this.canvas.world.children.forEach((sprite) => {
								let color: number = 0xffffff;
								this.availableComponents.forEach(
									(availComp) => {
										if (
											availComp["type"] ===
												eComp._type.toLowerCase() &&
											availComp["id"] === eComp._id
										) {
											if (
												this.hasAttribute(
													"contenteditable"
												)
											) {
												color = 0xa7dbec;
											}
										}
									}
								);
								this.canvas._tintSprite(sprite, color);
							});
						};
						this.conSelect.appendChild(option);
					}
				}
			});
			this.eConInfo.innerHTML = "";
			if (!sprite.label.includes("cable")) {
				chemlib_obj._connections.forEach(
					(cable: chemlib.ElectricComponent) => {
						const conComp: chemlib.ElectricComponent =
							cable._connections[0] === chemlib_obj
								? cable._connections[1]
								: cable._connections[0];
						if (!conComp) return;
						// @ts-ignore
						let tag: SlTag = this.shadowRoot.createElement(
							"sl-tag"
						) as SlTag;
						tag.innerHTML = this.itemName(conComp._type);
						tag.style.margin = "5px";
						this.localizeControl(tag, "title", "Doppelklicken zum Lösen der Verbindung.");
						tag.addEventListener("pointerenter", (event) => {
							tag.variant = "success";
							this.canvas.world.children.forEach((sprite) => {
								if (
									Number.parseInt(
										sprite.label.split(":")[1]
									) === conComp._id &&
									sprite.label.split(":")[0] === conComp._type
								) {
									this.canvas._tintSprite(sprite, 0xbbf7d0);
								}
							});
						});
						tag.addEventListener("pointerleave", (event) => {
							tag.variant = "neutral";
							this.canvas.world.children.forEach((sprite) => {
								this.canvas._tintSprite(sprite, 0xffffff);
							});
						});
						tag.addEventListener("dblclick", () => {
							const cableView = this.canvas.world.children.find(({ label }) => label === `cable:${cable._id}`);
							if (!cableView) return;
							this.removeObjects([cableView]);
							this._emitAlert(this.message("Verbindung gelöst zwischen {from} und {to}", {
								from: this.itemName(chemlib_obj._type), to: this.itemName(conComp._type),
							}), "danger", false, 1500);
							this.canvas.world.children.forEach((view) => this.canvas._tintSprite(view, 0xffffff));
						});
						this.eConInfo.appendChild(tag);
					}
				);
			}
			let eDivArr: HTMLCollection = this.eCompInfo.children;
			switch (chemlib_obj._type) {
				case "cable":
					this.eCompInfo.style.visibility = "hidden";
					this.conSelect.value = "";
					this.eCompPanelVisible = [false, false, false];
					break;
				case "source":
					this.eCompInfo.style.visibility = "";
					this.conSelect.value = "";
					this.eCompPanelVisible = [false, true, false];
					let voltageInput: SlInput = this.shadowRoot.getElementById(
						"sourceVoltage"
					) as SlInput;
					let currentInput: SlInput = this.shadowRoot.getElementById(
						"sourceCurrent"
					) as SlInput;
					if (typeof chemlib_obj._sourceCurrent != "undefined") {
						currentInput.value = chemlib_obj._sourceCurrent
							.toString()
							.replace(",", ".");
					} else {
						currentInput.value = "0";
					}
					if (typeof chemlib_obj._sourceVoltage != "undefined") {
						voltageInput.value = chemlib_obj._sourceVoltage
							.toString()
							.replace(",", ".");
					} else {
						voltageInput.value = "0";
					}
					break;
				case "voltmeter":
				case "ammeter":
					this.eCompInfo.style.visibility = "";
					this.conSelect.value = "";
					this.eCompPanelVisible = [true, false, false];
					break;
				case "electrode":
					this.eCompInfo.style.visibility = "";
					this.conSelect.value = "";
					this.eCompPanelVisible = [false, false, true];
					let mixTag: SlTag = this.shadowRoot.getElementById(
						"conMix"
					) as SlTag;
					let compName: string = "";
					this.allChemComponents.forEach((comp) => {
						if (chemlib_obj._connectedMix === comp._content) {
							compName = comp._type;
						}
					});
					mixTag.innerHTML = chemlib_obj._connectedMix
						? this.message("Lösung in {name}", { name: this.itemName(compName) })
						: "kein Gemisch";
					let matSel: SlSelect = this.shadowRoot.getElementById(
						"electrodeSelect"
					) as SlSelect;
					matSel.innerHTML = "";
					this.electrodeMaterials.forEach((molData) => {
						// @ts-ignore
						let molOption: SlOption = this.shadowRoot.createElement(
							"sl-option"
						) as SlOption;
						molOption.value = molData[0];
						molOption.innerHTML = molData[0];
						matSel.appendChild(molOption);
					});
					if (
						typeof chemlib_obj._material != "undefined" &&
						matSel.innerHTML.includes(chemlib_obj._material.name)
					) {
						matSel.value = chemlib_obj._material.name;
					}
					break;
				default:
					this.eCompInfo.style.visibility = "";
					this.conSelect.value = "";
					this.eCompPanelVisible = [true, true, true];
					break;
			}
			for (let i = 0; i < eDivArr.length; i++) {
				(eDivArr[i] as HTMLDivElement).style.display = this
					.eCompPanelVisible[i]
					? ""
					: "none";
			}
		}

		this.curr_stage_index = this.canvas.world.children.indexOf(sprite);
		this.curr_obj = chemlib_obj;
		this.curr_name = name;
		if (newSelection) this.setObjectPanelOpen(false);
		this._updatePopup();

		this.requestUpdate();
	}


	/**
	 * asynchronous timer function to be used in other functions; returns, if the condition is met 
	 *
	 * @param {*} condition - a condition to check
	 * @param {number} [checkInterval=10] - the check interval
	 * @returns {*}
	 */
	waitUntil = (condition, checkInterval = 10) => {
		return new Promise<void>((resolve) => {
			let interval = setInterval(() => {
				if (!condition()) return;
				clearInterval(interval);
				resolve();
			}, checkInterval);
		});
	};

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
		if (event.key === "Escape" && !event.defaultPrevented && !event.isComposing && !this.confirmDialog?.open &&
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
			event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || this.editingMolecule || this.confirmDialog?.open) return;
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
			(component._type === chemlib.EComponentType.Cable && component._connections.some((end) => labels.has(labelOf(end)))));
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
			for (const partner of component._connections) affectedElectrical.add(partner);
		}
		for (const component of removedElectrical) labels.add(labelOf(component));
		const selected = world.children[this.curr_stage_index];
		if (selected && labels.has(selected.label)) {
			this.stopDose?.();
			this.hideFillMeter();
			this.localizeControl(this.settings_drawer, "textContent", "Objekt");
			this.shadowRoot.getElementById("comp_panel").style.display = "none";
			this.shadowRoot.getElementById("ecomp_panel").style.display = "none";
			this.clearObjectSelection(true);
		}
		for (const component of removedElectrical) {
			if (component._type === chemlib.EComponentType.Cable) this.removeAuthoredCableConnection(component);
		}
		for (const component of removedElectrical) {
			for (const partner of [...component._connections]) this._remEcon(component, partner);
		}
		for (const electrode of detachedElectrodes) {
			const vessel = removedMixtures.get(electrode._connectedMix);
			electrode._connectedMix = undefined;
			this._emitAlert(this.message("{from} aus {to} entfernt.", {
				from: this.itemName(electrode._type), to: this.itemName(vessel._type),
			}), "danger", false, 1500);
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
			if (!this.editingMolecule && this.allEComponents.includes(this.curr_obj) &&
				(removedElectrical.length || affectedElectrical.has(this.curr_obj))) this._getObject(selected);
		}
	}

	private refreshDeviceAfterRemoval(component: chemlib.ElectricComponent): void {
		const { Source, Voltmeter } = chemlib.EComponentType;
		if ((component._type !== Source && component._type !== Voltmeter) || this.operatingCircuit(component)) return;
		if (component._type === Voltmeter) component._visibleVoltage = 0;
		const label = `${component._type}:${component._id}`;
		const ticker = "echem" + label;
		if (!this.simulation.hasTask(ticker)) return;
		this.simulation.stopTask(ticker);
		this.canvas.setDeviceActive(component, false);
		this._sendxAPiStatement("completed", ticker);
		this.requestUpdate();
	}

	private removeAuthoredCableConnection(cable: chemlib.ElectricComponent): void {
		if (!this.canAuthor || cable._connections.length !== 2) return;
		const indices = cable._connections.map((end) => {
			const sprite = this.canvas.world.children.find(({ label }) => label === `${end._type}:${end._id}`);
			return sprite ? this.availableComponents.indexOf(this.findAuthoredComponent(sprite)) : -1;
		});
		if (indices.some((index) => index < 0)) return;
		const [first, second] = indices;
		this.availableComponents = this.availableComponents.map((entry, index) => {
			if (index !== first && index !== second) return entry;
			const partner = index === first ? second : first;
			entry["connections"] = (entry["connections"] ?? []).filter((connection: number) => connection !== partner);
			return entry;
		});
	}

	clearObjectSelection(closeEditor = false): void {
		if (this.editingMolecule && !closeEditor) return;
		this.editingMolecule = false;
		this.canvas.clearGroupSelection();
		this.curr_obj = null;
		this.curr_name = "";
		this.curr_stage_index = -1;
		this.setObjectPanelOpen(false);
	}

	/**
	 * loads available molecules into the corresponding select menu in the panel
	 *
	 * @private
	 */
	private _listMolecules(): void {
		this.molSelect.innerHTML = "";
		this.availableMolecules.forEach((molObject) => {
			// @ts-ignore
			let molEntry: SlOption = this.shadowRoot.createElement(
				"sl-option"
			) as SlOption;
			molEntry.innerHTML = molObject["formula"];
			molEntry.value = molObject["formula"];
			this.molSelect.appendChild(molEntry);
		});
	}

	/**
	 * loads available mixtures into the corresponding select menu in the panel
	 *
	 * @private
	 */
	private _listMixtures(): void {
		this.mixSelect.innerHTML = "";
		this.availableMixtures.forEach((mixObject) => {
			// @ts-ignore
			let mixEntry: SlOption = this.shadowRoot.createElement(
				"sl-option"
			) as SlOption;
			mixEntry.innerHTML = mixObject["name"];
			mixEntry.value = mixObject["name"];
			this.mixSelect.appendChild(mixEntry);
		});
	}

	/**
	 * loads available molecules into the teacher drawer, also appends controls
	 *
	 * @private
	 */
	private _listMolConfig(): void {
		// @ts-ignore
		let addMolButton: HTMLButtonElement = this.shadowRoot.createElement(
			"button"
		) as HTMLButtonElement;
		addMolButton.id = "enter";
		this.localizeControl(addMolButton, "textContent", "hinzufügen");
		addMolButton.onclick = (event) => {
			this.canvas.clearGroupSelection();
			this.localizeControl(this.settings_drawer, "textContent", "neues Molekül");
			this.editingMolecule = true;
			this._newMol();
			this._listAtoms();
			this.setObjectPanelOpen(true);
			this.shadowRoot.getElementById("comp_panel").style.display = "";
			this.shadowRoot.getElementById("ecomp_panel").style.display =
				"none";
		};

		this.molConfig.appendChild(addMolButton);

		this.availableMolecules.forEach((molEntry) => {
			// @ts-ignore
			let molDetails: SlDetails = this.shadowRoot.createElement(
				"sl-details"
			) as SlDetails;
			molDetails.summary = molEntry["formula"];
			// @ts-ignore
			let delMolButton: HTMLButtonElement = this.shadowRoot.createElement(
				"button"
			) as HTMLButtonElement;
			this.localizeControl(delMolButton, "textContent", "entfernen");
			delMolButton.className = "remObj";
			delMolButton.onclick = (event) => {
				this._emitAlert(
					this.message("Abhängige Einträge müssen ebenfalls entfernt werden."),
					"primary",
					true
				);
				let arrCopy: object[] = [];
				this.availableMolecules.forEach((molEntry) => {
					if (molEntry["formula"] !== molDetails.summary) {
						arrCopy.push(molEntry);
					}
				});
				this.availableMolecules = arrCopy;
				this._listMolecules();
				molDetails.remove();
			};
			// @ts-ignore
			let molAtoms: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			this.localizeControl(molAtoms, "label", "Atome");
			molAtoms.size = "small";
			molAtoms.readonly = true;
			molAtoms.value = JSON.stringify(molEntry["atoms"])
				.replace("[", "")
				.replace("]", "")
				.replace(/"/g, "");
			// @ts-ignore
			let molBonds: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			molBonds.autocomplete = "off";
			this.localizeControl(molBonds, "label", "Bindungen");
			molBonds.size = "small";
			molBonds.readonly = true;
			molBonds.value = JSON.stringify(molEntry["bonds"])
				.replace("[", "")
				.replace("]", "")
				.replace(/"/g, "");

			molDetails.appendChild(delMolButton);
			molDetails.appendChild(molAtoms);
			molDetails.appendChild(molBonds);

			this.molConfig.appendChild(molDetails);
		});
	}

	/**
	 *loads available mixtures into the teacher drawer, also appends controls
	 *
	 * @private
	 */
	private _listMixConfig(): void {
		// @ts-ignore
		let addMixButton: HTMLButtonElement = this.shadowRoot.createElement(
			"button"
		) as HTMLButtonElement;
		addMixButton.id = "enter";
		this.localizeControl(addMixButton, "textContent", "hinzufügen");
		addMixButton.onclick = (event) => {
			// @ts-ignore
			let mixDetails: SlDetails = this.shadowRoot.createElement(
				"sl-details"
			) as SlDetails;
			mixDetails.summary = "neues Gemisch";
			// @ts-ignore
			let setMixButton: HTMLButtonElement = this.shadowRoot.createElement(
				"button"
			) as HTMLButtonElement;
			this.localizeControl(setMixButton, "textContent", "speichern");
			setMixButton.id = "foldMenu";
			setMixButton.onclick = (event) => {
				let newMixEntry: object = {
					name: mixName.value,
					content: contentString.split(","),
				};
				mixDetails.summary = newMixEntry["name"];

				this.availableMixtures = [
					...this.availableMixtures,
					newMixEntry,
				];
				this.mixConfig.innerHTML = "";
				mixDetails.remove();
				this._listMixConfig();
				this._listMixtures();
			};
			// @ts-ignore
			let delMixButton: HTMLButtonElement = this.shadowRoot.createElement(
				"button"
			) as HTMLButtonElement;
			this.localizeControl(delMixButton, "textContent", "entfernen");
			delMixButton.className = "remObj";
			delMixButton.onclick = (event) => {
				let arrCopy: object[] = [];
				this.availableMixtures.forEach((mixEntry) => {
					if (
						mixEntry["name"] !==
						mixDetails.summary.replace("_", " ")
					) {
						arrCopy.push(mixEntry);
					}
				});
				this.availableMixtures = arrCopy;
				this._listMixtures();
				mixDetails.remove();
			};
			// @ts-ignore
			let mixName: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			mixName.autocomplete = "off";
			this.localizeControl(mixName, "label", "Name");
			mixName.size = "small";
			mixName.readonly = false;
			// @ts-ignore
			let mixMolAmount: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			mixMolAmount.autocomplete = "off";
			this.localizeControl(mixMolAmount, "label", "Molekül: Stoffmenge");
			mixMolAmount.size = "small";
			mixMolAmount.type = "number";
			mixMolAmount.placeholder = "mol";
			mixMolAmount.min = 0;
			mixMolAmount.readonly = false;
			mixMolAmount.oninput = (event) => {
				if (isNumber(mixMolAmount.value)) {
					mixContent.disabled = false;
				}
			};
			// @ts-ignore
			let mixContent: SlSelect = this.shadowRoot.createElement(
				"sl-select"
			) as SlSelect;
			this.localizeControl(mixContent, "label", "Molekül: Auswahl");
			mixContent.size = "small";
			mixContent.hoist = true;
			mixContent.multiple = true;
			mixContent.disabled = true;
			let contentString: string = "";
			this.availableMolecules.forEach((molEntry) => {
				// @ts-ignore
				let molOption: SlOption = this.shadowRoot.createElement(
					"sl-option"
				) as SlOption;
				molOption.value = molEntry["formula"];
				molOption.innerHTML = molEntry["formula"];
				molOption.onclick = (event) => {
					contentString =
						contentString === ""
							? molOption.value +
							  ":" +
							  mixMolAmount.value.toString()
							: (contentString +=
									"," +
									molOption.value +
									":" +
									mixMolAmount.value.toString());
					mixMolAmount.value = "";
					mixMolAmount.focus();
					mixContent.disabled = true;
				};
				mixContent.appendChild(molOption);
			});

			mixDetails.appendChild(setMixButton);
			mixDetails.appendChild(delMixButton);
			mixDetails.appendChild(mixName);
			mixDetails.appendChild(mixMolAmount);
			mixDetails.appendChild(mixContent);

			this.mixConfig.appendChild(mixDetails);
			mixDetails.show();
		};
		this.mixConfig.appendChild(addMixButton);

		this.availableMixtures.forEach((mixEntry) => {
			// @ts-ignore
			let mixDetails: SlDetails = this.shadowRoot.createElement(
				"sl-details"
			) as SlDetails;
			mixDetails.summary = mixEntry["name"];
			// @ts-ignore
			let delMixButton: HTMLButtonElement = this.shadowRoot.createElement(
				"button"
			) as HTMLButtonElement;
			this.localizeControl(delMixButton, "textContent", "entfernen");
			delMixButton.className = "remObj";
			delMixButton.onclick = (event) => {
				this._emitAlert(
					this.message("Abhängige Einträge müssen ebenfalls entfernt werden."),
					"primary",
					true
				);
				let arrCopy: object[] = [];
				this.availableMixtures.forEach((mixEntry) => {
					if (
						mixEntry["name"] !==
						mixDetails.summary.replace("_", " ")
					) {
						arrCopy.push(mixEntry);
					}
				});
				this.availableMixtures = arrCopy;
				this._listMixtures();
				mixDetails.remove();
			};
			// @ts-ignore
			let mixContent: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			mixContent.autocomplete = "off";
			this.localizeControl(mixContent, "label", "Inhalt");
			mixContent.size = "small";
			mixContent.readonly = true;
			mixContent.value = JSON.stringify(mixEntry["content"])
				.replace("[", "")
				.replace("]", "")
				.replace(/"/g, "");

			mixDetails.appendChild(delMixButton);
			mixDetails.appendChild(mixContent);

			this.mixConfig.appendChild(mixDetails);
		});
	}

	/**
	 * loads element data into the panel view
	 *
	 * @private
	 */
	private _listAtoms(): void {
		let elements: string[] = chemlib.ElementData.getElementList();
		let field = this.shadowRoot.getElementById("atoms");

		if (this.atomsListed) {
			return;
		}

		let atom_container = field.appendChild(
			document.createElement("atom_container")
		);

		elements.forEach((element) => {
			let atom = document.createElement("button");
			let atom_data = chemlib.ElementData.getData(element);
			atom.id = "buttonAtom";

			if (this.useColoredElements === 1) {
				// thin enough to leave the 18px cell room for its symbol
				atom.style.borderBottomWidth = "3px";
				switch (atom_data["category"]) {
					case "diatomic nonmetal":
						if (atom_data["group"] === 17) {
							atom.style.borderColor = "#e83c95";
						} else {
							atom.style.borderColor = "#e42050";
						}
						break;
					case "noble gas":
						atom.style.borderColor = "#b6778c";
						break;
					case "alkali metal":
						atom.style.borderColor = "#73962c";
						break;
					case "alkaline earth metal":
						atom.style.borderColor = "#0e9a60";
						break;
					case "metalloid":
						atom.style.borderColor = "#806db6";
						break;
					case "polyatomic nonmetal":
						atom.style.borderColor = "#e42050";
						break;
					case "post-transition metal":
					case "transition metal":
						atom.style.borderColor = "#0f69af";
						break;
					case "lanthanide":
						atom.style.borderColor = "#2dbecd";
						break;
					case "actinide":
						atom.style.borderColor = "#3a9890";
						break;
					default:
						atom.style.borderColor = "#4f4f4f";
						break;
				}
			}

			atom.addEventListener("click", () => {
				this.curr_mol.addAtom(
					atom_data["name"].toLowerCase(),
					atom_data["symbol"]
				);
				this.curr_mol._atoms.forEach(atom=>{
					console.log(atom._pos2D.toString())
				})
				this._sendxAPiStatement(
					"appended",
					this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
						":" +
						this.curr_mol._id,
					{
						response: atom_data["name"],
						completion: true,
						success: true,
					}
				);
				let src_string: string = chemlib.StructureManager.printMolecule(
					this.curr_mol,
					150,
					150
				);
				(
					this.shadowRoot.getElementById(
						"mol_preview"
					) as HTMLImageElement
				).src = src_string;
				this.bond_sel_1.innerHTML = "";
				this.bond_sel_2.innerHTML = "";
				this.curr_mol._atoms.forEach((atom) => {
					// @ts-ignore
					let atom_option_1: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					atom_option_1.textContent = this.itemName(atom.getName()) + ":" + atom._id;
					atom_option_1.value = atom.getName() + ":" + atom._id;
					this.bond_sel_1.appendChild(atom_option_1);

					// @ts-ignore
					let atom_option_2: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					atom_option_2.textContent = this.itemName(atom.getName()) + ":" + atom._id;
					atom_option_2.value = atom.getName() + ":" + atom._id;
					this.bond_sel_2.appendChild(atom_option_2);
				});
				this.requestUpdate();
			});
			atom.dataset.elementName = atom_data["name"].toLowerCase();
			atom.dataset.elementCategory = atom_data["category"];
			atom.title = this.itemName(atom.dataset.elementName) + "\n" + this.itemName(atom.dataset.elementCategory);
			atom.innerHTML = atom_data["symbol"];

			// place the button on the periodic-table grid using its
			// standard coords (xpos 1-18, ypos 1-7 main table,
			// 9 lanthanides, 10 actinides). Guard against non-numeric
			// values so a stray entry can't disrupt the grid.
			let xpos = atom_data["xpos"];
			let ypos = atom_data["ypos"];
			if (typeof xpos === "number" && typeof ypos === "number") {
				atom.style.gridColumn = String(xpos);
				atom.style.gridRow = String(ypos);
			}

			atom_container.appendChild(atom);
		});

		this.atomsListed = true;
	}

	/**
	 * filters elements based on selected categories, can be called multiple times
	 *
	 * @private
	 * @param {string} color - the color code of the selected category
	 */
	private _changeFilter(color: string): void {
		let filterButtons: NodeListOf<Element> =
			this.shadowRoot.querySelectorAll("#filterButton");

		if (color === "none") {
			this.filterCategories = [];
			filterButtons.forEach((button) => {
				(button as HTMLButtonElement).style.backgroundColor = "#fff";
				(button as HTMLButtonElement).style.color = "#000";
			});
		} else {
			let currButton: HTMLButtonElement = null;

			filterButtons.forEach((button) => {
				if ((button as HTMLButtonElement).style.borderColor === color) {
					currButton = button as HTMLButtonElement;
				}
			});

			if (this.filterCategories.includes(color)) {
				this.filterCategories.splice(
					this.filterCategories.indexOf(color),
					1
				);
				currButton.style.backgroundColor = "#fff";
				currButton.style.color = "#000";
			} else {
				this.filterCategories.push(color);
				currButton.style.backgroundColor = color;
				currButton.style.color = "#fff";
			}
		}

		this._filterAtoms();
		this._sendxAPiStatement("submitted", "filter " + this.filterCategories);
	}

	/**
	 * filters elements based on user input
	 *
	 * @private
	 */
	private _filterAtoms(): void {
		let atomButtons: HTMLCollectionOf<HTMLButtonElement> = this.shadowRoot
			.getElementById("atoms")
			.getElementsByTagName("atom_container")[0]
			.getElementsByTagName("button");
		let searchItem: string = this.elemSearch.value.toLowerCase();

		let filterIndices: number[] = [];

		for (let i = 0; i < atomButtons.length; i++) {
			let currElem: HTMLButtonElement = atomButtons.item(i);
			if (this.filterCategories.length < 1) {
				break;
			}
			if (!this.filterCategories.includes(currElem.style.borderColor)) {
				currElem.style.display = "none";
				filterIndices.push(i);
			} else {
				atomButtons.item(i).style.display = "";
			}
		}

		if (searchItem === "") {
			for (let i = 0; i < atomButtons.length; i++) {
				if (!filterIndices.includes(i)) {
					atomButtons.item(i).style.display = "";
				}
			}
			return;
		}

		for (let i = 0; i < atomButtons.length; i++) {
			let currElem: HTMLButtonElement = atomButtons.item(i);

			if (!filterIndices.includes(i)) {
				if (
					!(
						currElem.title
							.split("\n")[0]
							.toLowerCase()
							.includes(searchItem) ||
						currElem.innerHTML.toLowerCase().includes(searchItem)
					)
				) {
					currElem.style.display = "none";
				} else {
					atomButtons.item(i).style.display = "";
				}
			}
		}
	}

	/**
	 * saves a new chemlib molecule, updates molecule list
	 *
	 * @private
	 * @param {chemlib.Molecule} mol - the molecule object
	 */
	private _saveMolecule(mol: chemlib.Molecule): void {
		let molName: string = mol._kekule_obj.calcFormula().getDisplayText();
		let molAtoms: string[] = [];
		let molBonds: string[] = [];

		mol._atoms.forEach((atom) => {
			let label: string = atom.getName().toLowerCase();
			molAtoms.push(label);
		});

		mol._bonds.forEach((bond) => {
			let label: string =
				bond._from._id +
				"-" +
				bond._to._id +
				":" +
				bond._type.toLowerCase() +
				":" +
				bond._magnitude;
			molBonds.push(label);
		});

		let isAvailable: boolean = false;
		this.availableMolecules.forEach((molEntry) => {
			if (molEntry["formula"] === molName) {
				isAvailable = true;
				return;
			}
		});
		if (!isAvailable) {
			this.availableMolecules = [
				...this.availableMolecules,
				{
					formula: molName,
					atoms: molAtoms,
					bonds: molBonds,
				},
			];
		}

		this._listMolecules();
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

				let mol: chemlib.Molecule = this._loadMolecule(
					molFormula,
					false
				);
				newMix.addMolecule(mol, molAmount);
			});
		}

		this.mixSelect.value = "";
		this.mixVolAmount.value = "";
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
				switch (newComp._type) {
					case chemlib.EComponentType.Electrode:
						if (variant?.material) newComp._material = this.newElectrodeMaterial(variant.material);
						else if (component["material"]) {
							newComp._material = this._loadMolecule(component["material"], false);
							newComp._material.name = component["material"];
						}
						if (!newComp._material) break;
						if (newComp._material._atoms.length === 0) {
							newComp._material = undefined;
							break;
						}
						const material = newComp._material;
						if (!this.electrodeMaterials.some(([name]) => name === material.name)) {
							this.electrodeMaterials.push([material.name, material]);
						}
						break;
					case chemlib.EComponentType.Source:
						newComp._sourceVoltage = Number.parseFloat(component["voltage"]) || 0;
						newComp._sourceCurrent = Number.parseFloat(component["current"]) || 0;
						break;
					default:
						break;
				}
				this.allEComponents.push(newComp);
			}

			const sprite = this.canvas.addComponentView(newComp, entry !== undefined);
			sprite.x = component["pos"][0];
			sprite.y = component["pos"][1];

			if (this.hasAttribute("contenteditable")) {
				this.canvas._tintSprite(sprite, 0xa7dbec);
			} else {
				this.canvas._tintSprite(sprite, 0xffffff);
			}

			this.avComponentsSprites.push([sprite, newComp._id]);
			component["id"] = newComp._id;
		}
		this.availableComponents.forEach((comp) => {
			comp["connections"].forEach((index) => {
				let id = this.availableComponents[index]["id"];
				let source: chemlib.ElectricComponent;
				let partner: chemlib.ElectricComponent;
				this.allEComponents.forEach((eComp) => {
					if (eComp._type.toLowerCase() != "cable") {
						if (eComp._id === id) {
							partner = eComp;
						}
						if (eComp._id === comp["id"]) {
							source = eComp;
						}
					}
				});
				// console.log(source._type, partner._type);
				let save: boolean = true;
				this.allEComponents.forEach((eComp) => {
					if (eComp._type.toLowerCase() === "cable") {
						if (
							eComp._connections.includes(partner) &&
							eComp._connections.includes(source)
						) {
							// console.log("false");
							save = false;
						}
					}
				});
				if (save) {
					// console.log("attempt connection");
					this._addEcon(partner, source);
				}
			});
		});
	}

	/**
	 * loads prebuild molecules from database
	 *
	 * @private
	 * @param {string} formula - the formula of the molecule
	 * @param {boolean} append - if the molecule should be appended to bond selecions
	 * @param {?object} [entry] - a specific entry to load from
	 * @returns {chemlib.Molecule} - the molecule object
	 */
	private _loadMolecule(
		formula: string,
		append: boolean,
		entry?: object
	): chemlib.Molecule {
		let definition = entry;
		if (!definition) {
			for (let i = this.availableMolecules.length - 1; i >= 0; i--) {
				const candidate = this.availableMolecules[i];
				if (candidate["formula"] !== formula) continue;
				definition = candidate;
				break;
			}
		}
		return loadMoleculeDefinition(definition as MoleculeDefinition | undefined,
			append ? (atom) => this._appendBondsList(atom) : undefined);
	}

	/**
	 * adds an atom to the selection lists for new bonds
	 *
	 * @private
	 * @param {chemlib.Atom} atom - the atom object
	 */
	private _appendBondsList(atom: chemlib.Atom): void {
		this.bond_sel_1.innerHTML = "";
		this.bond_sel_2.innerHTML = "";
		this.bond_sel_1.value = "";
		this.bond_sel_2.value = "";
		this.bond_sel_3.value = "";

		// @ts-ignore
		let atomOption1: SlOption = this.shadowRoot.createElement("sl-option");
		atomOption1.textContent = this.itemName(atom.getName()) + ":" + atom._id;
		atomOption1.value = atom.getName() + ":" + atom._id;
		this.bond_sel_1.appendChild(atomOption1);
		// @ts-ignore
		let atomOption2: SlOption = this.shadowRoot.createElement("sl-option");
		atomOption2.textContent = this.itemName(atom.getName()) + ":" + atom._id;
		atomOption2.value = atom.getName() + ":" + atom._id;
		this.bond_sel_2.appendChild(atomOption2);
	}

	/**
	 * adds the current molecule to a mixture
	 *
	 * @private
	 */
	private _addToObj(): void {
		if (this.hasAttribute("contenteditable")) {
			let mol: chemlib.Molecule = this.curr_mol;
			this._saveMolecule(mol);
			this.molConfig.innerHTML = "";
			this._listMolConfig();
			this._newMol();
			this.editingMolecule = false;
			this.setObjectPanelOpen(false);
		} else {
			if (this.curr_mol._atoms.length === 0) {
				this._emitAlert(
					this.message("Es wurde kein Atom zum Molekül hinzugefügt."),
					"warning",
					true
				);
				return;
			}
			let amountRegex = /^[0-9]+(\.[0-9]+)?$/;
			if (
				this.molAmount.value === "" ||
				!amountRegex.test(this.molAmount.value)
			) {
				this._emitAlert(
					this.message("Es wurde keine/eine falsche Menge angegeben. Der Wert muss eine Zahl ohne Einheit sein."),
					"warning",
					true
				);
				this._sendxAPiStatement("appended", this.curr_name, {
					response:
						this.curr_mol._kekule_obj
							.calcFormula()
							.getDisplayText() +
						":" +
						this.curr_mol._id +
						"|" +
						this.molAmount.value,
					success: false,
					completion: true,
				});
				return;
			}

			this._saveMolecule(this.curr_mol);
			this.curr_obj.addContents({
				nMolecule: this.curr_mol,
				nMolAmount: Number.parseFloat(this.molAmount.value),
			});
			this.canvas.markVesselChanged(this.curr_obj);
			this._sendxAPiStatement("appended", this.curr_name, {
				response:
					this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
					":" +
					this.curr_mol._id +
					"|" +
					this.molAmount.value,
				success: true,
				completion: true,
			});
			this._getObject(this.canvas.world.children[this.curr_stage_index]);
			(
				this.shadowRoot.getElementById(
					"mol_preview"
				) as HTMLImageElement
			).src = "";

			this.bond_sel_1.innerHTML = "";
			this.bond_sel_2.innerHTML = "";
			this.bond_sel_1.value = "";
			this.bond_sel_2.value = "";
			this.bond_sel_3.value = "";
			this.molAmount.value = "";
		}
	}

	/**
	 * appends the current molecule to the list of electrode materials
	 *
	 * @private
	 * @async
	 * @returns {Promise<void>}
	 */
	private async _newElectrodeMat(): Promise<void> {
		if (this.curr_mol._atoms.length > 1) {
			this._emitAlert(
				this.message("Ein Elektrodenmaterial muss ein elementarer Stoff aus einem Atom sein."),
				"warning",
				true
			);
			return;
		}
		chemlib.StructureManager.getChemData(this.curr_mol);
		await this.waitUntil(() => this.curr_mol.name != "");
		this.electrodeMaterials.push([this.curr_mol.name, this.curr_mol]);
		this._newMol();
	}

	/**
	 * creates an empty molecule object
	 *
	 * @private
	 */
	private _newMol(): void {
		let mol: chemlib.Molecule = chemlib.StructureManager.newMolecule();
		this.curr_mol = mol;
		(
			this.shadowRoot.getElementById("mol_preview") as HTMLImageElement
		).src = "";
		this.bond_sel_1.innerHTML = "";
		this.bond_sel_1.value = "";
		this.bond_sel_2.innerHTML = "";
		this.bond_sel_2.value = "";
		this.bond_sel_3.value = "";
	}

	/**
	 * sets a new bond between selected molecules from the panel
	 *
	 * @private
	 */
	private _enter(): void {
		if (this.bond_sel_1.value === "" || this.bond_sel_2.value === "") {
			this._emitAlert(
				this.message("Es wurden keine Atome für eine Bindung ausgewählt."),
				"warning",
				true
			);
			this._sendxAPiStatement(
				"joined",
				this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
					":" +
					this.curr_mol._id,
				{
					response:
						this.bond_sel_1.value +
						"|" +
						this.bond_sel_2.value +
						"|" +
						this.bond_sel_3.value,
					success: false,
					completion: true,
				}
			);
			return;
		}
		if (this.bond_sel_1.value === this.bond_sel_2.value) {
			this._emitAlert(
				this.message("Die ausgefählten Atome dürfen nicht die selben sein."),
				"warning",
				true
			);
			this._sendxAPiStatement(
				"joined",
				this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
					":" +
					this.curr_mol._id,
				{
					response:
						this.bond_sel_1.value +
						"|" +
						this.bond_sel_2.value +
						"|" +
						this.bond_sel_3.value,
					success: false,
					completion: true,
				}
			);
			return;
		}
		if (this.bond_sel_3.value === "") {
			this._emitAlert(
				this.message("Es muss eine Bindungsart ausgewählt werden."),
				"warning",
				true
			);
			this._sendxAPiStatement(
				"joined",
				this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
					":" +
					this.curr_mol._id,
				{
					response:
						this.bond_sel_1.value +
						"|" +
						this.bond_sel_2.value +
						"|" +
						this.bond_sel_3.value,
					success: false,
					completion: true,
				}
			);
			return;
		}
		this.curr_mol.addBond(
			Number.parseInt((this.bond_sel_1.value as string).split(":")[1]),
			Number.parseInt((this.bond_sel_2.value as string).split(":")[1]),
			Number.parseInt(this.bondMag.value),
			100,
			this.bond_sel_3.value as string
		);
		let src_string: string = chemlib.StructureManager.printMolecule(
			this.curr_mol,
			150,
			150
		);
		(
			this.shadowRoot.getElementById("mol_preview") as HTMLImageElement
		).src = src_string;

		this._sendxAPiStatement(
			"joined",
			this.curr_mol._kekule_obj.calcFormula().getDisplayText() +
				":" +
				this.curr_mol._id,
			{
				response:
					this.bond_sel_1.value +
					"|" +
					this.bond_sel_2.value +
					"|" +
					this.bond_sel_3.value,
				success: true,
				completion: true,
			}
		);
	}

	/**
	 * adds a ne connection between two electric components
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} partner - the component to connect to
	 * @param {?chemlib.ElectricComponent} [source] - the component to connect from
	 */
	_addEcon(
		partner: chemlib.ElectricComponent,
		source?: chemlib.ElectricComponent
	): void {
		let cable: chemlib.ElectricComponent =
			chemlib.ComponentManager.newElectricComponent(
				chemlib.EComponentType.Cable
			);
		let message: string = "";
		let ret1: string = "";
		let ret2: string = "";
		let sComp: chemlib.ElectricComponent = source ?? this.curr_obj;
		ret1 += sComp.connect(cable);
		ret2 += cable.connect(partner);
		if (ret1 != ret2) {
			message = ret1 + "\n" + ret2;
		} else {
			message = ret1;
		}
		this.allEComponents.push(cable);
		this.canvas.addComponentView(cable, false);
		if (!source) {
			const sprite = this.canvas.world.children.find(
				(sprite) => sprite.label === sComp._type + ":" + sComp._id
			);
			this._getObject(sprite);
		}
		let isAvail1, isAvail2;
		if (message === "" && typeof source === "undefined") {
			this.availableComponents.forEach((comp) => {
				if (comp["id"] === sComp._id) {
					isAvail1 = [true, this.availableComponents.indexOf(comp)];
				}
				if (comp["id"] === partner._id) {
					isAvail2 = [true, this.availableComponents.indexOf(comp)];
				}
			});
			if (
				typeof isAvail1 != "undefined" &&
				typeof isAvail2 != "undefined"
			) {
				if (isAvail1[0] && isAvail2[0]) {
					this.availableComponents[isAvail1[1]]["connections"].push(
						isAvail2[1]
					);
					this.availableComponents[isAvail2[1]]["connections"].push(
						isAvail1[1]
					);

					let arrCopy: object[] = [];
					this.availableComponents.forEach((comp) => {
						arrCopy.push(comp);
					});
					this.availableComponents = [];
					this.availableComponents = arrCopy;
				}
			}
			if(this.curr_obj._type != "cable" && partner._type != "cable"){
				this._emitAlert(
					message === ""
						? this.message("Neue Verbindung zwischen {from} und {to}", { from: this.itemName(this.curr_obj._type), to: this.itemName(partner._type) })
						: message,
					"success",
					false,
					1500
				);
			}
			this._sendxAPiStatement(
				"joined",
				this.curr_obj._type + this.curr_obj._id,
				{
					response: partner._type + ":" + partner._id,
					success: true,
					completion: true,
				}
			);
		} else if (message != "") {
			this._emitAlert(message.split("\n").filter(Boolean).map(line => this.message(line)).join("\n"), "warning", true);
			this._sendxAPiStatement(
				"joined",
				this.curr_obj._type + this.curr_obj._id,
				{
					response: partner._type + ":" + partner._id,
					success: false,
					completion: true,
				}
			);
		}
	}

	/**
	 * removes a connection between a selected sprites object an its partner
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} partner - the object to which the connection is to be removed
	 */
	private _remEcon(component: chemlib.ElectricComponent, partner: chemlib.ElectricComponent): void {
		const message: string = component.disconnect(partner);
		if (message === "") {
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
			this._emitAlert(message.split("\n").filter(Boolean).map(line => this.message(line)).join("\n"), "warning", true);
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
	 * applies a material to the selected electrode from the panel
	 *
	 * @private
	 */
	private _setElectrodeMaterlial(): void {
		if (!this.canAuthor) return;
		let matSel: SlSelect = this.shadowRoot.getElementById(
			"electrodeSelect"
		) as SlSelect;
		this.electrodeMaterials.forEach((molData) => {
			if (matSel.value === molData[0]) {
				this.curr_obj._material = molData[1];
			}
		});
		if (!this.curr_obj._material) return;
		const formula = this.curr_obj._material._kekule_obj.calcFormula().getDisplayText();
		const preset = componentVariants.electrode.find(({ material }) => material.name === this.curr_obj._material.name);
		this.saveSelectedComponent({ material: formula, variantId: preset?.id });
		this.canvas.refreshDeviceDisplay(this.curr_obj);
		this._updatePopup();
		this._sendxAPiStatement(
			"submitted",
			"ElectrodeMaterlial " +
				formula +
				":" +
				this.curr_obj._id
		);
	}

	/**
	 * applies the given values from the panel to the selected e-component
	 *
	 * @private
	 */
	private _setSourceValues(): void {
		let voltageInput: SlInput = this.shadowRoot.getElementById(
			"sourceVoltage"
		) as SlInput;
		let currentInput: SlInput = this.shadowRoot.getElementById(
			"sourceCurrent"
		) as SlInput;

		this.curr_obj._sourceVoltage = Number.parseFloat(voltageInput.value) || 0;
		this.curr_obj._sourceCurrent = Number.parseFloat(currentInput.value) || 0;
		this.saveSelectedComponent({ voltage: this.curr_obj._sourceVoltage, current: this.curr_obj._sourceCurrent });
		this.canvas.refreshDeviceDisplay(this.curr_obj);
		this._updatePopup();

		this._sendxAPiStatement(
			"submitted",
			"voltage " + this.curr_obj._type + ":" + this.curr_obj._id
		);
	}


	/**
	 * shows an alert with given properties
	 *
	 * @private
	 * @param {string} text - the content of the alert
	 * @param {string} variant - the showlace color variant
	 * @param {boolean} closable - if the alert box can be closed
	 * @param {?number} [duration] - how long the alert box will be shown
	 */
	_emitAlert(
		text: string,
		variant: string,
		closable: boolean,
		duration?: number
	) {
		this.shadowRoot.getElementById("dialogText").textContent = text;
		// @ts-ignore
		this.dialogAlert.variant = variant;
		this.dialogAlert.closable = closable;
		if (duration) {
			this.dialogAlert.duration = duration;
		} else {
			this.dialogAlert.duration = Infinity;
		}
		this.dialogAlert.show();
	}

	/**
	 * hides the alert box
	 *
	 * @private
	 */
	_hideAlert(): void {
		this.dialogAlert.hide();
	}

	/**
	 * applies the selected panel variant by modifying the split panel positions
	 *
	 * @private
	 */
	private _changePanelVariant(): void {
		switch (this.panelVariant) {
			case "1":
				this.atomPanel.position = 55;
				this.moleculePanel.position = 35;
				this.mixCarousel.slidesPerPage = 2;
				this.mixCarousel.slidesPerMove = 2;
				break;
			case "2":
				this.atomPanel.position = 100;
				this.moleculePanel.position = 35;
				this.mixCarousel.slidesPerPage = 4;
				this.mixCarousel.slidesPerMove = 4;
				break;
			case "3":
				this.atomPanel.position = 100;
				this.moleculePanel.position = 100;
				this.mixCarousel.slidesPerPage = 4;
				this.mixCarousel.slidesPerMove = 4;
				break;
			default:
				break;
		}
		this.requestUpdate();
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
				class=${`${this.objectPanelOpen ? "show-object-panel" : ""} ${diagramOpen ? "show-diagram-panel" : ""}`}
			>
				<div id="canvasArea">
					${this.pix_canvas}
					${this.renderObjectSummary()}
					${this.renderGroupSummary()}
					${this.renderFillMeter()}
					${this.renderAmountMenu()}
					${this.renderControlButtons()}
				</div>
				${this.renderObjectDetails()}
				${this.renderDiagramDetails(diagramAvailable, diagramOpen)}
				${this.renderConfirmDialog()}
				${this.renderTeacherDrawer()}
				<sl-popup id="permissionPopup" placement="top" distance="8" flip shift arrow
					.anchor=${this.permissionTooltip?.anchor} .active=${!!this.permissionTooltip}>
					<div id="permissionTooltip" role="tooltip">${this.permissionTooltip?.text}</div>
				</sl-popup>
			</div>
		`;
	}

	private renderConfirmDialog() {
		return html`
				<sl-dialog id="confirmDialog" no-header label=${this.message("bestätigen")}>
					<div
						style="display: flex; flex-direction: row; align-items: center"
					>
						<p>${this.message("Aktion bestätigen:")}</p>
						<button
							aria-label=${this.message("bestätigen")}
							@click="${(event) => {
								this.confirmAction = 1;
								this.confirmDialog.hide();
							}}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 48 48"
							>
								<path
									fill="#288d00"
									fill-rule="evenodd"
									d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20m10.742-26.33a1 1 0 1 0-1.483-1.34L21.28 29.567l-6.59-6.291a1 1 0 0 0-1.382 1.446l7.334 7l.743.71l.689-.762z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<button
							aria-label=${this.message("Abbrechen")}
							@click="${(event) => {
								this.confirmAction = 2;
								this.confirmDialog.hide();
							}}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 48 48"
							>
								<path
									fill="#d10000"
									fill-rule="evenodd"
									d="M44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4s20 8.954 20 20m-27.778 7.778a1 1 0 0 1 0-1.414L22.586 24l-6.364-6.364a1 1 0 0 1 1.414-1.414L24 22.586l6.364-6.364a1 1 0 0 1 1.414 1.414L25.414 24l6.364 6.364a1 1 0 0 1-1.414 1.414L24 25.414l-6.364 6.364a1 1 0 0 1-1.414 0"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</sl-dialog>
		`;
	}

	private setObjectPanelOpen(open: boolean): void {
		if (open && this.canvas.selectedObjects.length) return;
		if (this.objectPanelOpen === open) return;
		this.objectPanelOpen = open;
		this._sendxAPiStatement(open ? "opened" : "closed", "objectPanel");
	}

	private renderObjectDetails() {
		const groupSelected = this.canvas.selectedObjects.length > 0;
		return html`
			<aside id="objectArea" class="workspace-side">
				<sl-details class="workspace-details" .open=${this.objectPanelOpen}
					?disabled=${groupSelected || (!this.curr_obj && !this.editingMolecule)}
					@sl-show=${(event: Event) => { if (event.target === event.currentTarget) this.setObjectPanelOpen(true); }}
					@sl-hide=${(event: Event) => { if (event.target === event.currentTarget) this.setObjectPanelOpen(false); }}>
					<span slot="summary" class="workspace-summary" title=${this.message("Objekt")}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
							<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M9 3v10"/>
						</svg>
						<span class="panel-button-label">${this.message("Objekt")}</span>
					</span>
					${this.renderPanelArrows("left")}
					${this.renderObjectPanel()}
				</sl-details>
			</aside>`;
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
		this._sendxAPiStatement(open ? "opened" : "closed", "diagramPanel");
	}

	private renderPanelArrows(direction: "left" | "right" | "up") {
		const paths = {
			left: ["m9 3-4 4 4 4", "m5 3 4 4-4 4"],
			right: ["m5 3 4 4-4 4", "m9 3-4 4 4 4"],
			up: ["m3 9 4-4 4 4", "m3 5 4 4 4-4"],
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
				<sl-alert
					id="dialogOverview"
					style="top: 0px; left: 0px"
					closable
				>
					<p id="dialogText"></p>
				</sl-alert>
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
		this.teacherDrawerChoice = this.teacherDrawerOpen = open;
		if (!open) this.permissionTooltip = undefined;
	}

	private renderTeacherDrawer() {
		const label = this.message(this.canAuthor ? "Lehrkraft Steuerung" : "Komponenten");
		return html`
			<sl-details id="teacherDrawer" class="workspace-details" .open=${this.teacherDrawerOpen}
				@sl-show=${(event: Event) => this.onTeacherDrawerToggle(event, true)}
				@sl-hide=${(event: Event) => this.onTeacherDrawerToggle(event, false)}>
				<span slot="summary" class="workspace-summary" title=${label}>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
						<path d="M2 6h12v7H2zM5 6V3h6v3M2 9h12"/>
					</svg>
					<span class="panel-button-label">${label}</span>
				</span>
				${this.renderPanelArrows("up")}
				<div id="teacherDrawerContent">
					${this.canAuthor && this.selectedChemical ? html`
						<sl-button size="small" @click=${this.clearChemicalSelection}>
							${this.selectedChemical.name} ×
						</sl-button>` : ""}
					<sl-tab-group id="teacherTabs" class=${this.canAuthor ? "" : "learner-tabs"}
						@sl-tab-show=${(event: CustomEvent<{ name: "components" | "chemicals" }>) => {
							if (event.target === event.currentTarget) {
								this.teacherTab = event.detail.name;
								if (this.teacherTab === "chemicals") this.chemicalCatalogOpened = true;
								this.permissionTooltip = undefined;
							}
						}}>
						<sl-tab slot="nav" panel="components" active>${this.message("Komponenten")}</sl-tab>
						<sl-tab slot="nav" panel="chemicals" ?disabled=${!this.canAuthor}>${this.message("Chemikalien")}</sl-tab>
						<sl-tab-panel name="components" active>${this.renderComponentPalette()}</sl-tab-panel>
						<sl-tab-panel name="chemicals" class="author-only">
							${this.canAuthor && this.chemicalCatalogOpened ? this.renderChemicalCatalog() : nothing}
							<sl-details summary=${this.message("Eigene Moleküle und Gemische")}>
								<div class="teacher-editors">
									<section><h3>${this.message("Moleküle")}</h3><div id="molConfig"></div></section>
									<section><h3>${this.message("Gemische")}</h3><div id="mixConfig"></div></section>
								</div>
							</sl-details>
						</sl-tab-panel>
					</sl-tab-group>
				</div>
			</sl-details>
		`;
	}

	private renderComponentPalette() {
		const cards = (Object.keys(componentVariants) as PaletteComponent[]).map((type) => {
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
			const permissionVariant = allowed.length === 0 ? "danger" : partiallyAllowed ? "primary" : "success";
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
						<path d=${step < 0 ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"}/>
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
					<sl-badge pill variant=${permissionVariant}>
						${allowed.length} / ${variants.length}
					</sl-badge>
				</button>`;
			return html`
				<div class="teacher-card" role="group" aria-label=${name}>
					<div class="component-card-header">
						<sl-tag size="small" variant=${this.canAuthor ? permissionVariant : "neutral"}>${name}</sl-tag>
						${this.canAuthor ? badge : nothing}
					</div>
					<div class="component-variant">
						${arrow(-1, this.message(current.material ? "Vorheriges Material" : "Vorherige Größe"))}
						<div class="component-variant-body">
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
								<sl-tag size="small" variant=${currentAllowed ? "primary" : "neutral"} aria-live="polite">${variantLabel}</sl-tag>
							</button>
							${this.canAuthor ? html`
								<div class="component-permission">
									<sl-tooltip hoist content=${this.message("Für Lernende erlauben")}>
									<sl-checkbox size="small" .checked=${currentAllowed}
											aria-label=${`${itemLabel} · ${this.message("Für Lernende erlauben")}`}
											@sl-change=${(event: Event) => this.setVariantAllowed(current, (event.currentTarget as SlCheckbox).checked)}>
											${this.message("Für Lernende erlauben")}
										</sl-checkbox>
									</sl-tooltip>
								</div>` : nothing}
						</div>
						${arrow(1, this.message(current.material ? "Nächstes Material" : "Nächste Größe"))}
					</div>
				</div>`;
		});
		if (cards.every((card) => card === nothing)) return html`<p>${this.message("Keine Geräte freigegeben.")}</p>`;
		return html`<div class="component-palette">${cards}</div>`;
	}

	private renderChemicalTile(key: string, name: string, formula: string, recipe: ChemicalRecipe, src?: string,
		concentration?: ChemicalConcentration) {
		const value = this.chemicalConcentrations.get(key) ?? concentration?.initial ?? 0;
		const concentrationLabel = concentration ? `${this.formatAmount(value, 8)} mol/L` : "";
		const label = concentration ? name.replace(/ \(1 mol\/L\)$/, "") : name;
		const chemical = { key, name: concentration ? `${label} (${concentrationLabel})` : name,
			recipe: concentration ? withConcentration(recipe, value, concentration.stock) : recipe };
		const tile = html`
			<button type="button" class=${concentration ? "chemical-tile-button" : "chemical-tile"} contenteditable="false"
				aria-label=${chemical.name} aria-pressed=${this.selectedChemical?.key === key}
				@pointerdown=${(event: PointerEvent) => this.startChemicalDrag(event, chemical, src)}
				@dragstart=${this.preventNativePaletteDrag}
				@click=${(event: MouseEvent) => {
					if (this.consumePaletteClick(event)) return;
					const wasSelected = this.selectedChemical?.key === key;
					this.clearChemicalSelection();
					this.componentToPlace = undefined;
					if (wasSelected) return;
					this.clearObjectSelection(true);
					this.selectedChemical = chemical;
				}}>
			<span class="chemical-preview">${src ? html`<img src=${src} alt="" draggable="false" decoding="async" loading="lazy"/>`
				: html`<span>${formula}</span>`}</span>
			<sl-badge pill variant="neutral">${label}</sl-badge>
			${src ? html`<small>${formula}</small>` : nothing}
			</button>`;
		if (!concentration) return tile;
		const setValue = (next: number) => {
			const bounded = Math.max(MIN_CONCENTRATION, Math.min(concentration.max, next));
			this.chemicalConcentrations = new Map(this.chemicalConcentrations).set(key, bounded);
			if (this.selectedChemical?.key === key) {
				this.cancelDoseForNavigation();
				this.closeAmountMenu();
				this.selectedChemical = {
					key, name: `${label} (${this.formatAmount(bounded, 8)} mol/L)`,
					recipe: withConcentration(recipe, bounded, concentration.stock),
				};
			}
		};
		return html`
			<div class="chemical-tile chemical-tile-with-concentration" contenteditable="false">
				${tile}
				${this.renderConcentrationControl(key, label, value, concentration.max, concentrationLabel, setValue)}
			</div>`;
	}

	private renderConcentrationControl(key: string, name: string, value: number, max: number, label: string,
		setValue: (next: number) => void) {
		const presets = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2].filter((preset) => preset < max);
		presets.push(max);
		const index = presets.reduce((nearest, preset, i) =>
			Math.abs(value - preset) < Math.abs(value - presets[nearest]) ? i : nearest, 0);
		const editing = this.editingConcentration === key;
		const edit = async (event: Event) => {
			const control = (event.currentTarget as HTMLElement).parentElement;
			this.editingConcentration = key;
			await this.updateComplete;
			const input = control?.querySelector<HTMLInputElement>("input[type=text]");
			input?.focus({ preventScroll: true });
			input?.select();
		};
		const finish = (input: HTMLInputElement, cancel = false, restoreFocus = false) => {
			if (this.editingConcentration !== key) return;
			const raw = input.value.trim();
			const next = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(raw) ? Number(raw.replace(",", ".")) : NaN;
			if (!cancel && (!Number.isFinite(next) || next < MIN_CONCENTRATION || next > max)) {
				if (restoreFocus) {
					input.setCustomValidity(this.message("Gib eine Konzentration zwischen {min} und {max} mol/L ein.",
						{ min: this.formatAmount(MIN_CONCENTRATION, 15), max: this.formatAmount(max, 15) }));
					input.reportValidity();
					return;
				}
			} else if (!cancel) setValue(next);
			this.editingConcentration = undefined;
			if (restoreFocus) {
				const control = input.parentElement;
				void this.updateComplete.then(() => control?.querySelector<HTMLInputElement>("input[type=range]")?.focus({ preventScroll: true }));
			}
		};
		const changeBy = (delta: number) => setValue(Number((value + delta).toPrecision(15)));
		const accessibleName = `${name} · ${this.message("Konzentration in mol/L")}`;
		return html`
			<div class="chemical-concentration">
				<button type="button" class="amount-menu-button" aria-label=${this.message("Konzentration verringern")}
					?disabled=${value <= MIN_CONCENTRATION} @click=${() => changeBy(-0.1)}>−</button>
				<div class="amount-menu-quantity volume-bar" style=${`--amount-progress: ${100 * index / (presets.length - 1)}%`}>
					<span class="amount-menu-value" ?inert=${editing}>${label}</span>
					${editing ? html`
						<input class="amount-editor" type="text" inputmode="decimal" autocomplete="off" aria-label=${accessibleName}
							.value=${String(value)} @input=${(event: Event) => (event.currentTarget as HTMLInputElement).setCustomValidity("")}
							@blur=${(event: FocusEvent) => finish(event.currentTarget as HTMLInputElement)}
							@keydown=${(event: KeyboardEvent) => {
								if (event.key !== "Enter" && event.key !== "Escape") return;
								event.preventDefault();
								event.stopPropagation();
								finish(event.currentTarget as HTMLInputElement, event.key === "Escape", true);
							}}>
					` : html`
						<input class="amount-slider" type="range" dir="ltr" min="0" max=${presets.length - 1} step="1" .value=${String(index)}
							aria-label=${accessibleName} aria-valuetext=${label}
							title=${this.message("Konzentration bearbeiten (Doppelklick oder F2)")}
							@input=${(event: Event) => setValue(presets[(event.currentTarget as HTMLInputElement).valueAsNumber])}
							@dblclick=${edit} @keydown=${(event: KeyboardEvent) => {
								if (event.key !== "F2") return;
								event.preventDefault();
								void edit(event);
							}}>
					`}
				</div>
				<button type="button" class="amount-menu-button" aria-label=${this.message("Konzentration erhöhen")}
					?disabled=${value >= max} @click=${() => changeBy(0.1)}>+</button>
			</div>`;
	}

	private renderCustomChemical(key: string, name: string, recipe: ChemicalRecipe) {
		const preview = recipe.parts.find(({ molecule }) =>
			!["H₂O", "OH2", "H2O"].includes(molecule.formula))?.molecule ?? recipe.parts[0]?.molecule;
		if (!preview) return nothing;
		const waterMoles = recipe.parts.reduce((sum, part) => sum + (isWaterDefinition(part.molecule) ? part.amount : 0), 0);
		const soluteMoles = recipe.parts.reduce((sum, part) => sum + (!isWaterDefinition(part.molecule) ? part.amount : 0), 0);
		const stock = waterMoles > 0 ? soluteMoles / (waterMoles * 0.018015) : 0;
		const concentration = Number.isFinite(stock) && stock > 0
			? { initial: Math.max(MIN_CONCENTRATION, stock), max: Math.max(1, stock), stock: soluteMoles }
			: undefined;
		return this.renderChemicalTile(key, name, preview.formula, recipe, this.previewMolecule(preview), concentration);
	}

	private rememberChemicalSection(event: Event, category: string): void {
		if (event.target !== event.currentTarget || this.openedChemicalSections.has(category)) return;
		this.openedChemicalSections = new Set([...this.openedChemicalSections, category]);
	}

	private renderChemicalCatalog() {
		const molecules = this.availableMolecules as MoleculeDefinition[];
		const normalize = (value: string) => value.normalize("NFKC").toLowerCase();
		const query = normalize(this.chemicalQuery.trim());
		const matches = (...values: string[]) => !query || values.some((value) => normalize(value).includes(query));
		const groups = chemicalCatalogGroups.flatMap(({ category, items }) => {
			const label = this.message(category);
			const visible = matches(category, label) ? items : items.filter((item) =>
				matches(item.name, this.message(item.name), item.formula, item.category, this.message(item.category)));
			return visible.length ? [{ category, label, items: visible }] : [];
		});
		const renderedGroups = repeat(groups, ({ category }) => category, ({ category, label, items }) => html`
				<sl-details class="chemical-section" ?open=${!!query || category === "Salze"}
					@sl-show=${(event: Event) => this.rememberChemicalSection(event, category)}>
					<sl-tag slot="summary" size="small">${label}</sl-tag>
					${query || this.openedChemicalSections.has(category) ? html`<div class="chemical-grid">
						${items.map((item) => this.renderChemicalTile(item.name, this.message(item.name), item.formula,
							item.recipe, catalogPreviews[item.name], item.concentrationLimit && { initial: 1, max: item.concentrationLimit }))}
					</div>` : nothing}
				</sl-details>`);
		const customLabel = this.message("Eigene Stoffe");
		const customMolecules = molecules.filter((molecule) => matches(molecule.formula, customLabel));
		const customMixtures = this.availableMixtures.filter((mixture) => matches(mixture["name"], customLabel));
		return html`
			<sl-input class="chemical-search" size="small" type="search" clearable contenteditable="false"
				label=${this.message("Chemikalien suchen")} .value=${this.chemicalQuery}
				@sl-input=${(event: Event) => { this.chemicalQuery = (event.currentTarget as SlInput).value; }}>
			</sl-input>
			${renderedGroups}
			${customMolecules.length || customMixtures.length ? html`
				<sl-details class="chemical-section" ?open=${!!query}
					@sl-show=${(event: Event) => this.rememberChemicalSection(event, "Eigene Stoffe")}>
					<sl-tag slot="summary" size="small">${customLabel}</sl-tag>
					${query || this.openedChemicalSections.has("Eigene Stoffe") ? html`<div class="chemical-grid">
						${customMolecules.map((molecule) => this.renderCustomChemical("mol:" + molecule.formula, molecule.formula, {
							phase: ["OH2", "H2O"].includes(molecule.formula) ? "liquid" : "solid",
							density: 1, parts: [{ molecule, amount: 1 }],
						}))}
						${customMixtures.map((mixture) => {
							const parts = (mixture["content"] as string[]).flatMap((entry) => {
								const [formula, rawAmount] = entry.split(":");
								const molecule = molecules.find((item) => item.formula === formula.trim());
								const amount = Number(rawAmount);
								return molecule && Number.isFinite(amount) && amount > 0 ? [{ molecule, amount }] : [];
							});
							return this.renderCustomChemical("mix:" + mixture["name"], mixture["name"], {
								phase: parts.some(({ molecule }) => ["OH2", "H2O"].includes(molecule.formula)) ? "liquid" : "solid",
								density: 1, parts,
							});
						})}
					</div>` : nothing}
				</sl-details>` : !groups.length ? html`<p>${this.message("Keine Chemikalien gefunden.")}</p>` : nothing}
		`;
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
		return this.curr_obj && !this.editingMolecule ? this.canvas.world.children[this.curr_stage_index] : undefined;
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
		const above = top - gap - height;
		const below = bottom + gap;
		const maxX = Math.max(padding, canvasWidth - padding - width);
		const maxY = Math.max(padding, canvasHeight - padding - height);
		let x = (left + right - width) / 2;
		let y = above;
		if (above < padding) {
			if (below <= maxY) {
				y = below;
			} else if (right + gap <= maxX || left - gap - width >= padding) {
				x = right + gap <= maxX ? right + gap : left - gap - width;
				y = (top + bottom - height) / 2;
			} else if (canvasHeight - bottom > top) {
				y = below;
			}
		}
		summary.style.transform = `translate(${Math.max(padding, Math.min(x, maxX))}px, ${Math.max(padding, Math.min(y, maxY))}px)`;
		summary.setAttribute("data-anchored", "");
	}

	private renderSelectionDeleteButton(remove: () => void) {
		return html`
			<button type="button" class="remObj" @click=${remove}>
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
				${this.message("löschen")}
			</button>`;
	}

	private renderObjectSummary() {
		const name = this.itemName(this.curr_name.split(":")[0]);
		return html`
			<section id="contextInfoBox" class="selection-info" ?hidden=${!this.curr_obj || this.editingMolecule}>
				<sl-badge class="selection-info-title">${name}</sl-badge>
				<div
					id="contextEchemInfo"
					style="display: flex; flex-direction: column"
				></div>
				<div
					id="contextMolInfo"
					style="display: flex; flex-direction: column"
				></div>
				<div
					id="contextMixInfo"
					style="display: flex; flex-direction: column; border-left: 5px solid; margin-left: 5px"
				></div>
				<div class="selection-actions">
					${this.renderSelectionDeleteButton(() => this._removeSprite())}
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
			</section>
		`;
	}

	private renderObjectPanel() {
		return html`
			<section
				id="objectPanel"
				aria-label=${this.message("Objekt")}
			>
				<h3 id="settings_drawer">${this.message("Objekt")}</h3>
				${this.renderCompPanel()}
				${this.renderEcompPanel()}
			</section>
		`;
	}

	private renderCompPanel() {
		return html`
								<div id="comp_panel">
									<sl-split-panel
										id="atom_panel"
										position="55"
										disabled
										style="overflow: hidden; --divider-width: 2px"
									>
										<div
											slot="start"
											style="display: flex; overflow: hidden;"
										>
											<sl-split-panel
												id="molecule_panel"
												vertical
												style="width: 100%; --divider-width: 2px"
												position="35"
												disabled
											>
												<div
													slot="start"
													style="height: 100%; display: flex; overflow: hidden"
												>
													<div
														id="molecule_container"
													>
														<div
															style="display:flex; flex-direction: row; align-items: center; margin-bottom: 5px"
														>
															<sl-badge
																size="small"
																id="property_badge"
															></sl-badge>
															<button
																@click="${(
																	event
																) => {
																	if (!this.curr_obj || this.editingMolecule) return;
																	this.curr_obj._content = chemlib.StructureManager.newMixture();
																	this.canvas.markVesselChanged(this.curr_obj);
																	this.saveSelectedComponent({ content: "", vol: 0, doses: [] });
																	this._getObject(this.canvas.world.children[this.curr_stage_index]);
																	this.requestUpdate();
																}}"
																title=${this.message("Objekt leeren")}
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="16"
																	height="16"
																	viewBox="0 0 16 16"
																>
																	<path
																		fill="#d10000"
																		d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
																	/>
																</svg>
															</button>
															<sl-input
																autocomplete="off"
																id="mixVolAmount"
																size="small"
																type="number"
																placeholder=${this.message("Menge in mL")}
																min="0"
																style="width: 120px; margin-inline: 5px; margin-top: 5px;"
																@sl-input="${(
																	event
																) => {
																	if (
																		isNumber(
																			this
																				.mixVolAmount
																				.value
																		)
																	) {
																		if (
																			Number.parseInt(
																				this
																					.mixVolAmount
																					.value
																			) >
																			Number.parseInt(
																				this
																					.mixVolAmount
																					.max as string
																			)
																		) {
																			this.mixVolAmount.value =
																				this
																					.mixVolAmount
																					.max as string;
																		}
																		this.mixSelect.disabled =
																			false;
																	} else {
																		this.mixSelect.disabled =
																			true;
																	}
																}}"
															></sl-input>
															<sl-select
																id="mixSelect"
																size="small"
																hoist
																disabled
																placeholder=${this.message("Bestehende")}
																style="width:150px"
																@sl-change="${(
																	event
																) => {
																	if (
																		this
																			.mixVolAmount
																			.value !=
																		""
																	) {
																		if (
																			Number.parseFloat(
																				this
																					.mixVolAmount
																					.value
																			) >
																			0
																		) {
																			this.curr_obj.addContents(
																				{
																					nMix: this._loadMixture(
																						(
																							this
																								.mixSelect
																								.value as string
																						).replace(
																							"_",
																							" "
																						),
																						Number.parseFloat(
																							this
																								.mixVolAmount
																								.value
																						) /
																							1000
																					),
																				}
																			);
																			this.canvas.markVesselChanged(this.curr_obj);
																			this.mixSelect.disabled =
																				true;
																			this._getObject(
																				this.canvas.world.children[
																					this
																						.curr_stage_index
																				]
																			);
																			this.requestUpdate();
																		} else {
																			this._emitAlert(
																				this.message("Das Volumen muss größer als Null sein."),
																				"warning",
																				true
																			);
																		}
																	} else {
																		this._emitAlert(
																			this.message("Es muss ein Volumen angegeben werden."),
																			"warning",
																			true
																		);
																	}
																}}"
															>
															</sl-select>
														</div>
														<sl-carousel
															navigation
															slides-per-page="2"
															slides-per-move="2"
															style="height: 100px; width: 100%"
															id="mixCarousel"
														>
														</sl-carousel>
													</div>
												</div>
												<div
													slot="end"
													style="display: block; overflow: hidden"
												>
													<sl-badge
														size="small"
														variant="primary"
														>${this.message("Molekül")}</sl-badge
													>
													<button
														id="newMol"
														@click="${() => {
															this._newMol();
															this._sendxAPiStatement(
																"created",
																"emptyMolecule"
															);
														}}"
													>
														${this.message("zurücksetzen")}
													</button>
													<button
														id="enter"
														@click="${this
															._addToObj}"
													>
														${this.message("hinzufügen")}
													</button>
													<button
														id="addToElectrode"
														@click="${this
															._newElectrodeMat}"
													>
														${this.message("+ Elektrodenmaterial")}
													</button>
													<div
														id="mol_prev_div"
														style="display: flex; justify-content: space-between;"
													>
														<div
															id="mol_preview_container"
															style="width: 160px; margin-top: 11px"
														>
															<sl-select
																id="molSelect"
																size="small"
																placeholder=${this.message("Bestehende")}
																placement="bottom"
																hoist
																@sl-change="${() => {
																	this.curr_mol =
																		this._loadMolecule(
																			this
																				.molSelect
																				.value as string,
																			true
																		);
																	let src_string: string =
																		chemlib.StructureManager.printMolecule(
																			this
																				.curr_mol,
																			150,
																			150
																		);
																	(
																		this.shadowRoot.getElementById(
																			"mol_preview"
																		) as HTMLImageElement
																	).src =
																		src_string;
																	this.molSelect.value =
																		"";
																	this.requestUpdate();
																}}"
															></sl-select>
															<img
																id="mol_preview"
																src=""
																onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIj48cGF0aCBzdHJva2U9IiNkZWRlZGUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0ibTEwLjUgNy41bDIgM2wtMiAzaC0zbC0yLTNsMi0zeiIvPjxwYXRoIHN0cm9rZT0iI2RlZGVkZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtMTUuNSA0LjVsMiAzbC0yIDNoLTNsLTItM2wyLTN6bTAgMTJsMiAzbS0xMi0xNWwyIDNtNSA5bC0xIDEuNW0tNC00LjVsLTEgMS41bS0xLTQuNWgtMW0xMyAzaDNtLTUtM2wyIDNsLTIgM2gtM2wtMi0zbDItM3oiLz48Y2lyY2xlIGN4PSIxMC41IiBjeT0iMTkuNSIgcj0iLjUiIGZpbGw9IiNkZWRlZGUiLz48Y2lyY2xlIGN4PSI1LjUiIGN5PSIxNi41IiByPSIuNSIgZmlsbD0iI2RlZGVkZSIvPjxjaXJjbGUgY3g9IjIuNSIgY3k9IjEwLjUiIHI9Ii41IiBmaWxsPSIjZGVkZWRlIi8+PC9nPjwvc3ZnPg=='"
															/>
														</div>

														<div id="bondSelect">
															<sl-input
																autocomplete="off"
																id="molAmount"
																type="number"
																maxlength="6"
																rows="1"
																resize="none"
																placeholder=${this.message("Menge in mol")}
																min="0"
																size="small"
																style="width: 208px; margin-top: 5px; margin-right: 2px"
															></sl-input>
															<sl-select
																id="bond_1"
																placeholder=${this.message("Bindung von")}
																placement="bottom"
																size="small"
																hoist
															></sl-select>
															<sl-select
																id="bond_2"
																placeholder=${this.message("Bindung zu")}
																placement="bottom"
																size="small"
																hoist
															></sl-select>
															<sl-select
																id="bond_3"
																placeholder=${this.message("Bindungsart wählen")}
																placement="top"
																size="small"
																hoist
															></sl-select>
															<div
																style="display: flex; margin-bottom: 20px; align-items: center"
															>
																<sl-tooltip
																	id="bondMagTooltip"
																	content="Bindungsgrad"
																	placement="bottom"
																>
																	<input
																		style="height: 0px; width: 75px"
																		type="range"
																		id="bondMag"
																		value="1"
																		min="1"
																		max="3"
																		style="width: 100px; margin-top: 10px"
																	/>
																</sl-tooltip>

																<button
																	id="enter"
																	@click="${this
																		._enter}"
																>
																	${this.message("neue Bindung")}
																</button>
															</div>
														</div>
													</div>
												</div>
											</sl-split-panel>
										</div>
										<div
											slot="end"
											style=" height: 300px; display: block;"
										>
											<div
												style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 4px; width: 327.6px"
											>
												<sl-badge
													size="small"
													variant="primary"
													style="position: sticky"
													>${this.message("Elemente")}</sl-badge
												>
												<button
													@click="${() => {
														this._changeFilter(
															"none"
														);
													}}"
													title=${this.message("Filter zurücksetzen")}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 16 16"
													>
														<path
															fill="#d10000"
															d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
														/>
													</svg>
												</button>
												<div
													id="filterDiv"
													style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: baseline; gap: 3px; width: 100%"
												>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(232, 60, 149)"
															);
														}}"
														id="filterButton"
														style="border-color: #e83c95; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Halogene")}
													>
														${this.message("Halogene")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(228, 32, 80)"
															);
														}}"
														id="filterButton"
														style="border-color: #e42050; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Nichtmetalle")}
													>
														${this.message("Nichtmetalle")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(182, 119, 140)"
															);
														}}"
														id="filterButton"
														style="border-color: #b6778c; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Edelgase")}
													>
														${this.message("Edelgase")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(115, 150, 44)"
															);
														}}"
														id="filterButton"
														style="border-color: #73962c; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Alkalimetalle")}
													>
														${this.message("Alkalimetalle")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(14, 154, 96)"
															);
														}}"
														id="filterButton"
														style="border-color: #0e9a60; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Erdalkalimetalle")}
													>
														${this.message("Erdalkalimetalle")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(128, 109, 182)"
															);
														}}"
														id="filterButton"
														style="border-color: #806db6; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Halbmetalle")}
													>
														${this.message("Halbmetalle")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(15, 105, 175)"
															);
														}}"
														id="filterButton"
														style="border-color: #0f69af; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Übergangsmetalle")}
													>
														${this.message("Übergangsmetalle")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(45, 190, 205)"
															);
														}}"
														id="filterButton"
														style="border-color: #2dbecd; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Lanthanoide")}
													>
														${this.message("Lanthanoide")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(58, 152, 144)"
															);
														}}"
														id="filterButton"
														style="border-color: #3a9890; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Actinoide")}
													>
														${this.message("Actinoide")}
													</button>
													<button
														@click="${(event) => {
															this._changeFilter(
																"rgb(79, 79, 79)"
															);
														}}"
														id="filterButton"
														style="border-color: #4f4f4f; border-width: 3px; flex-shrink: 0"
														title=${this.message("Kategorie: Unbekannt")}
													>
														${this.message("Unbekannt")}
													</button>
												</div>
											</div>
											<sl-input
												autocomplete="off"
												id="elemSearch"
												spellcheck="false"
												type="text"
												rows="1"
												resize="none"
												placeholder=${this.message("Suche nach Name oder Symbol")}
												size="small"
												style="width: 91%; margin-top: 3px; margin-inline: 5px"
												@sl-input="${this._filterAtoms}"
											></sl-input>
											<div id="atoms"></div>
										</div>
									</sl-split-panel>
								</div>
		`;
	}

	private renderEcompPanel() {
		return html`
								<div id="ecomp_panel">
									<sl-split-panel
										position="50"
										style="width: 100%; --divider-width: 2px"
										disabled
									>
										<div
											slot="start"
											style="display: flex; align-items: flex-start; justify-content: flex-start; overflow: hidden;"
										>
											<div
												style="display: flex; flex-direction: column;     align-items: baseline;"
											>
												<div
													style="display: flex; flex-direction: row"
												>
													<sl-badge
														>${this.message("Verbindungen")}</sl-badge
													>
													<button
														id="enter"
														@click="${() => {
															if(this
																.allEComponents[
																Number.parseInt(
																	(
																		this
																			.conSelect
																			.value as string
																	).split(
																		":"
																	)[1]
																)
															] != undefined){
															this._addEcon(
																this
																	.allEComponents[
																	Number.parseInt(
																		(
																			this
																				.conSelect
																				.value as string
																		).split(
																			":"
																		)[1]
																	)
																]
															);}
														}}"
													>
														${this.message("neu anlegen")}
													</button>
												</div>
												<sl-select
													id="newECon"
													size="small"
													placeholder=${this.message("Gegenstück")}
													hoist
												></sl-select>
												<div
													id="conInfo"
													style="display: flex; flex-direction: row"
												></div>
											</div>
										</div>
										<div
											slot="end"
											style="display: flex; align-items: flex-start; justify-content: flex-start; overflow: hidden;"
										>
											<div
												style="display: flex; flex-direction: column;"
											>
												<sl-badge
													>${this.message("Eigenschaften")}</sl-badge
												>
												<div
													id="compInfo"
													style="display: flex; flex-direction: column; justify-content: flex-start"
												>
													<div>
																<p>${this.message(this.curr_obj?._type === chemlib.EComponentType.Ammeter ? "Modellspannung" : "Spannung")}</p>
														<sl-tag
															id="shownVoltage"
															variant="warning"
																	>${this.curr_obj?._type === chemlib.EComponentType.Ammeter ? `${this.curr_obj._sourceVoltage} V` : this.voltageReading(this.curr_obj)}</sl-tag
														>
																${this.curr_obj?._type === chemlib.EComponentType.Ammeter ? html`<p>${this.message("Strommessung noch nicht verfügbar")}</p>` : nothing}
													</div>
													<div id="eCompInnerInfo">
														<sl-input
															autocomplete="off"
															id="sourceVoltage"
															size="small"
															label=${this.message("Quellspannung")}
															type="number"
															value="0"
															style="max-width: 100px"
														></sl-input>
														<sl-input
															autocomplete="off"
															id="sourceCurrent"
															size="small"
															label=${this.message("Quellstromstärke")}
															type="number"
															value="0"
															style="max-width: 100px"
														></sl-input>
														<button
															id="enter"
															@click="${this
																._setSourceValues}"
														>
															${this.message("bestätigen")}
														</button>
													</div>
													<div id="eCompInnerInfo">
														<p>
															${this.message("verbundenes Gemisch")}
														</p>
														<sl-tag
															id="conMix"
															variant="primary"
														></sl-tag>
														<p>
															${this.message("Elektrodenmaterial")}
														</p>
																<p ?hidden=${this.canAuthor}>${this.curr_obj?._material ? this.itemName(this.curr_obj._material.name) : this.message("kein Material")}</p>
																<sl-select class="author-only"
															id="electrodeSelect"
															size="small"
														></sl-select>
																<button class="author-only"
															id="enter"
															@click="${this
																._setElectrodeMaterlial}"
														>
															${this.message("bestätigen")}
														</button>
													</div>
												</div>
											</div>
										</div>
									</sl-split-panel>
								</div>
		`;
	}

	private voltageReading(device?: chemlib.ElectricComponent): string {
		if (device?._visibleVoltage === null) return this.message("Spannung nicht berechenbar");
		return `${(device?._visibleVoltage ?? 0).toExponential(2)} V`;
	}
}
