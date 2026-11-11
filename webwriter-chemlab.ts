import { drawerLabels, effectiveLanguage, localize } from "./localization/localization";
import { html, LitElement, PropertyValueMap } from "lit";
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
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlMenuLabel from "@shoelace-style/shoelace/dist/components/menu-label/menu-label.component.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.component.js";
import SlCarouselItem from "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.component.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js";
import SlDrawer from "@shoelace-style/shoelace/dist/components/drawer/drawer.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";

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
import { componentGraphic, componentGraphics, type PaletteComponent } from "./data/componentGraphics";
import { chemicalCatalog, type ChemicalRecipe, type MoleculeDefinition } from "./data/chemicals";
import { prepareDose, type SavedDose } from "./data/measuredDose";
import { CanvasController } from "./controllers/CanvasController";

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
	 * main context menu element for both views
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#contextMenu")
	accessor contextMenu: SlMenu;
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
	 * select for components to get deactivated for students
	 *
	 * @private
	 * @type {SlSelect}
	 */
	@query("#invCompSelect")
	private accessor invCompSelect: SlSelect;
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
	@query("#diagramDrawer")
	private accessor diagramDrawer: SlDrawer;

	@query("#canvasContainer")
	accessor canvasContainer: HTMLDivElement;
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
	 * @type {Array<[PIXI.Sprite, number]>}
	 */
	@property({ attribute: false })
	accessor avComponentsSprites: Array<[PIXI.Sprite, number]> = [];
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
	private simulation = new SimulationController(this);
	/**
	 * controller owning the PixiJS canvas layer (app, sprites, drag)
	 *
	 * @type {CanvasController}
	 */
	private canvas = new CanvasController(this);
	/**
	 * database to store update intervals for ticker functions
	 *
	 * @type {object}
	 */
	@property({ attribute: false })
	accessor tickerTimeObj: object = {};
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
	accessor app = null;
	/**
	 * signalizes which datasets (avail. components/e-components/atoms) have already been loaded into their selects
	 *
	 * @private
	 * @type {boolean[]}
	 */
	@property({ attribute: false })
	private accessor components_signal: boolean[] = [false, false, false];
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

	@state() private accessor teacherDrawerOpen = false;
	@state() private accessor teacherTab: "components" | "chemicals" = "components";
	@state() private accessor componentCapacities: Partial<Record<PaletteComponent, number>> = {};
	@state() private accessor componentToPlace: PaletteComponent | undefined;
	@state() private accessor selectedChemical: { key: string; name: string; recipe: ChemicalRecipe } | undefined;
	@state() private accessor fillMeter: { x: number; y: number; volume: number; capacity: number } | undefined;
	private chemicalPreviews = new Map<string, string>();
	private stopDose?: () => void;
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
			"sl-menu": SlMenu,
			"sl-menu-item": SlMenuItem,
			"sl-menu-label": SlMenuLabel,
			"sl-alert": SlAlert,
			"sl-carousel": SlCarousel,
			"sl-carousel-item": SlCarouselItem,

			"sl-card": SlCard,
			"sl-checkbox": SlCheckbox,

			"sl-drawer": SlDrawer,
			"sl-tooltip": SlTooltip,
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
	}

	disconnectedCallback(): void {
		this.stopDose?.();
		this.hideFillMeter();
		this.dataObserver?.disconnect();
		this.dataObserver = undefined;
		super.disconnectedCallback();
	}

	protected updated(changed: PropertyValueMap<any>): void {
		super.updated(changed);
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
				this.hideFillMeter();
				for (const [name] of [...this.simulation.tickerFunctionList]) {
					if (name.startsWith("transfer") || name.startsWith("echem")) {
						this.simulation.remTickerFunction(name);
					}
				}
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
			if (changed.has("invComponents")) {
				this.invCompSelect.value = this.invComponents;
				this.filterComponents();
			}
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
		if (Array.isArray(value.availableComponents)) this.availableComponents = value.availableComponents;
		if (Array.isArray(value.invComponents)) {
			const componentNames = Object.keys(chemlib.ComponentType).concat(Object.keys(chemlib.EComponentType));
			this.invComponents = value.invComponents.map(String).map(value =>
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
		this.addEventListener("contextmenu", (event) => {
			event.preventDefault();
		});
		super.firstUpdated(_changedProperties);
		this.canvas.init();
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

		this.simulation.startLoop();
		this.simulation.pushTickerFunction(
			this._updateTickerPopup.name,
			this._updateTickerPopup,
			[]
		);
		this.simulation.pushTickerFunction(
			"_updateCablePos",
			this.canvas._updateCablePos,
			[],
			this.canvas
		);
		this.simulation.pushTickerFunction(
			"_updateSpriteTextures",
			this.canvas._updateSpriteTextures,
			[],
			this.canvas
		);
		this._listComponents();
		this._listEComponents();
		this.invCompSelect.value = this.invComponents;
		this.filterComponents();
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

	/**
	 * ticker function to update popup contents regulary
	 *
	 * @private
	 */
	private _updateTickerPopup(): void {
		if (this.curr_obj && !this.editingMolecule) {
			this.tickerTimeObj[this._updateTickerPopup.name] += 1;
			// @ts-ignore
			if (
				this.tickerTimeObj[this._updateTickerPopup.name] >=
				Math.round(
					0.5 *
						chemlib.Simulation._simTimeStep *
						(this.app as PIXI.Application).ticker.FPS
				)
			) {
				this.tickerTimeObj[this._updateTickerPopup.name] = 0;
				this._updatePopup();
			}
		}
	}



	/**
	 * ticker function for titraton experiments, transfers content to another component dynamically on correct sprite positioning and updates the diagram
	 *
	 * @private
	 * @param {PIXI.Sprite} currSprite - the sprite of the burette
	 * @param {chemlib.ChemComponent} source - the chemlib object of the burette
	 */
	private _updateTickerTransfer(
		currSprite: PIXI.Sprite,
		source: chemlib.ChemComponent
	): void {
		const keyName = "transfer" + currSprite.name;
		this.tickerTimeObj[keyName] += 1;
		if (
			this.tickerTimeObj[keyName] >=
			Math.round(
				chemlib.Simulation._simTimeStep *
					(this.app as PIXI.Application).ticker.FPS
			)
		) {
			this.tickerTimeObj[keyName] = 0;
			if (source._content._activeMolecules.length > 0) {
				let destSprite: PIXI.Sprite = undefined;
				this.app.stage.children.forEach((sprite) => {
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
							destSprite.name.split(":")[0] === comp._type &&
							Number.parseInt(destSprite.name.split(":")[1]) ===
								comp._id
						) {
							destObj = comp;
						}
					}
				});
				if (typeof destObj != "undefined") {
					if (source._content._activeMolecules.length > 0) {
						source.transferContents({}, destObj);
						this.diagrams.appendTitrationPoint(source, destObj);
					}
				}
			}
		}
	}

	/**
	 * ticker function for e-chem experiments, checks circuit and updates diagram
	 *
	 * @private
	 * @param {PIXI.Sprite} currSprite - the sprite of the e-component
	 * @param {chemlib.ElectricComponent} source - the e-component object
	 */
	private _updateTickerEChem(
		currSprite: PIXI.Sprite,
		source: chemlib.ElectricComponent
	): void {
		const keyName = "echem" + currSprite.name;
		this.tickerTimeObj[keyName] += 1;
		if (
			this.tickerTimeObj[keyName] >=
			Math.round(
				chemlib.Simulation._simTimeStep *
					(this.app as PIXI.Application).ticker.FPS
			)
		) {
			this.tickerTimeObj[keyName] = 0;
			let circuitComps: Array<chemlib.ElectricComponent> =
				chemlib.ComponentManager.isCircuit(source);
			if (circuitComps.length != 0) {
				chemlib.Simulation.sEChem(
					circuitComps[0],
					circuitComps[1],
					circuitComps[2]
				);

				this.diagrams.appendEChemPoint(source, circuitComps);
			}
		}
	}

	get canAuthor(): boolean {
		const editable = this.getAttribute("contenteditable");
		return editable === "" || editable === "true";
	}

	private startComponentDrag(event: DragEvent, type: PaletteComponent): void {
		if (!event.dataTransfer) return;
		event.stopPropagation();
		event.dataTransfer.effectAllowed = "copy";
		event.dataTransfer.setData("application/x-chemlab-component", type);
		this.componentToPlace = undefined;
		this.selectedChemical = undefined;
	}

	private handleComponentDragOver(event: DragEvent): void {
		if (!this.canAuthor || !event.dataTransfer?.types.includes("application/x-chemlab-component")) return;
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = "copy";
	}

	private dropComponent(event: DragEvent): void {
		const type = event.dataTransfer?.getData("application/x-chemlab-component") as PaletteComponent;
		if (!this.app || !this.canAuthor || !Object.hasOwnProperty.call(componentGraphics, type)) return;
		const bounds = this.app.view.getBoundingClientRect();
		if (event.clientX < bounds.left || event.clientX > bounds.right ||
			event.clientY < bounds.top || event.clientY > bounds.bottom) return;
		event.preventDefault();
		event.stopPropagation();
		this.addAuthoredComponent(type,
			(event.clientX - bounds.left) * this.app.screen.width / bounds.width,
			(event.clientY - bounds.top) * this.app.screen.height / bounds.height);
	}

	placeSelectedComponent(x: number, y: number): boolean {
		if (!this.canAuthor || !this.componentToPlace) return false;
		this.addAuthoredComponent(this.componentToPlace, x, y);
		return true;
	}

	private addAuthoredComponent(type: PaletteComponent, x: number, y: number): void {
		this.componentToPlace = undefined;
		this.selectedChemical = undefined;
		const graphic = componentGraphic(type);
		const capacityMl = this.componentCapacities[type] ?? graphic.capacityMl;
		const entry = {
			type, pos: [x, y], capacityMl, vol: 0, content: "",
			voltage: 0, current: 0, material: "", connections: [],
		};
		this.availableComponents = [...this.availableComponents, entry];
		this._loadComponents(entry);
	}

	private findAuthoredComponent(sprite: PIXI.DisplayObject): object | undefined {
		const match = this.avComponentsSprites.find(([entry]) => entry === sprite);
		return match && this.availableComponents.find((component) =>
			`${String(component["type"]).toLowerCase()}:${component["id"]}` === sprite.name);
	}

	saveComponentPosition(sprite: PIXI.Sprite): void {
		if (!this.canAuthor) return;
		const entry = this.findAuthoredComponent(sprite);
		if (entry && (entry["pos"][0] !== sprite.x || entry["pos"][1] !== sprite.y)) {
			entry["pos"] = [sprite.x, sprite.y];
			this.availableComponents = [...this.availableComponents];
		}
	}

	private removeAuthoredComponent(sprite: PIXI.DisplayObject): void {
		if (!this.canAuthor) return;
		const entry = this.findAuthoredComponent(sprite);
		if (!entry) return;
		const index = this.availableComponents.indexOf(entry);
		this.avComponentsSprites = this.avComponentsSprites.filter(([current]) => current !== sprite);
		this.availableComponents = this.availableComponents
			.filter((component) => component !== entry)
			.map((component) => {
				component["connections"] = component["connections"]
					.filter((connection: number) => connection !== index)
					.map((connection: number) => connection > index ? connection - 1 : connection);
				return component;
			});
	}

	private previewMolecule(definition: MoleculeDefinition): string {
		const key = JSON.stringify(definition);
		if (!this.chemicalPreviews.has(key)) {
			try {
				const molecule = this._loadMolecule(definition.formula, false, definition);
				this.chemicalPreviews.set(key, chemlib.StructureManager.printMolecule(molecule, 70, 52));
			} catch {
				this.chemicalPreviews.set(key, "");
			}
		}
		return this.chemicalPreviews.get(key);
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
		const sprite = this.app.stage.children[this.curr_stage_index];
		const entry = sprite && this.findAuthoredComponent(sprite);
		if (entry) {
			Object.assign(entry, fields);
			this.availableComponents = [...this.availableComponents];
		}
	}

	beginChemicalDose(sprite: PIXI.Sprite, pointerId: number): boolean {
		const selected = this.selectedChemical;
		if (!this.canAuthor || !selected) return false;
		if (this.stopDose) return true;
		const target = this.allChemComponents.find((component) =>
			`${component._type}:${component._id}` === sprite.name);
		if (!target || !Number.isFinite(target._volume) || target._volume <= 0) return false;
		const dose = this.buildDose(selected.recipe);
		if (!dose) return true;

		this.hideFillMeter();
		this._getObject(sprite);
		const controller = new AbortController();
		const view = this.ownerDocument.defaultView;
		const canvasView = this.app.view;
		// Keep receiving the release when the pointer leaves the vessel or canvas.
		try {
			canvasView.setPointerCapture(pointerId);
		} catch {
			// Window listeners still handle releases when capture is unavailable.
		}
		let totalMl = 0;
		let interval: number;
		let holding = false;
		const updateMeter = () => {
			const canvas = this.shadowRoot.getElementById("canvasArea").getBoundingClientRect();
			const right = this.canvas.viewportPoint(sprite.x + sprite.width / 2, sprite.y);
			const left = this.canvas.viewportPoint(sprite.x - sprite.width / 2, sprite.y);
			this.fillMeter = {
				x: Math.max(0, right.x + 92 <= canvas.right ? right.x - canvas.left + 6 : left.x - canvas.left - 86),
				y: Math.max(0, Math.min(canvas.height - 56, right.y - canvas.top - 28)),
				volume: target._content.contentVolume * 1000, capacity: target._volume,
			};
		};
		const add = (requestedMl: number) => {
			const volumeMl = Math.min(requestedMl, Math.max(0, target._volume - target._content.contentVolume * 1000));
			if (volumeMl > 1e-8) {
				target.addContents({ nMix: dose(volumeMl) });
				totalMl += volumeMl;
			}
			updateMeter();
			if (target._volume - target._content.contentVolume * 1000 <= 1e-8) view.clearInterval(interval);
		};
		const finish = (click: boolean, save = true) => {
			view.clearTimeout(delay);
			view.clearInterval(interval);
			controller.abort();
			if (canvasView.hasPointerCapture(pointerId)) canvasView.releasePointerCapture(pointerId);
			this.stopDose = undefined;
			if (click && !holding) add(1);
			if (click) this.meterTimeout = view.setTimeout(() => this.hideFillMeter(), 650);
			else this.hideFillMeter();
			const entry = this.findAuthoredComponent(sprite);
			if (save && entry && totalMl > 0) {
				const record: SavedDose = { recipe: selected.recipe, volumeMl: totalMl };
				entry["doses"] = [...(entry["doses"] ?? []), record];
				this.availableComponents = [...this.availableComponents];
			}
			if (this.curr_obj === target) this._updatePopup();
		};
		const delay = view.setTimeout(() => {
			holding = true;
			add(0.4);
			if (target._content.contentVolume * 1000 < target._volume - 1e-8) {
				interval = view.setInterval(() => add(0.4), 50);
			}
		}, 300);
		this.stopDose = () => finish(false, false);
		const options = { capture: true, signal: controller.signal };
		view.addEventListener("pointerup", (event) => {
			if (event.pointerId === pointerId) finish(true);
		}, options);
		view.addEventListener("pointercancel", (event) => {
			if (event.pointerId === pointerId) finish(false);
		}, options);
		view.addEventListener("blur", () => finish(false), options);
		updateMeter();
		return true;
	}

	/**
	 * adds a new component
	 *
	 * @private
	 * @param {boolean} e - compoent is an electric component
	 * @param {string} type - the component type
	 */
	private _addComponent(e: boolean, type: string): void {
		let component: chemlib.ChemComponent | chemlib.ElectricComponent = null;
		if (!e) {
			component = chemlib.ComponentManager.newChemComponent(
				type.toLowerCase() as chemlib.ComponentType
			);
			this.allChemComponents.push(component);
		} else {
			component = chemlib.ComponentManager.newElectricComponent(
				type.toLowerCase() as chemlib.EComponentType
			);
			this.allEComponents.push(component);
		}

		this.canvas._addSprite(component._type + ":" + component._id);
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
			if (mixture.contentVolume > 0) {
				this.contextMixInfo.style.display = "";
				const pH = mixture._isSolution ? chemlib.Simulation.getpH(mixture) : undefined;
				this.contextMixInfo.innerHTML += `
					<div style="display: flex; flex-direction: column">
						<p>vol: ${(mixture.contentVolume * 1000).toFixed(1)} mL</p>
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
					this.contextEchemInfo.innerHTML = `
						<p>${this.message("Spannung")}: ${this.curr_obj._visibleVoltage.toExponential(2) + " V"}</p>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
				} else {
					let current: number = this.curr_obj._sourceCurrent || 0;
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
			} else if (this.curr_obj._type === chemlib.EComponentType.Electrode){
				this.activateEComp.style.display = "none";
				// an electrode has no material until one is assigned in the
				// panel, and a material's name is only filled in once its chem
				// data has been fetched. This runs from the ticker via
				// _updateTickerPopup, so an unguarded access here would throw
				// every frame and take the whole canvas down with it.
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
							device._sourceCurrent || 0,
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

	}

	/**
	 * retrieves object information for a given sprite, updates the panel
	 *
	 * @private
	 * @param {*} sprite - the seleted sprite
	 */
	_getObject(sprite): void {
		if (!sprite) return;
		this.editingMolecule = false;
		const name = sprite.name;
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
							this.app.stage.children.forEach((sprite) => {
								if (
									Number.parseInt(
										sprite.name.split(":")[1]
									) === eComp._id &&
									sprite.name.split(":")[0] === eComp._type
								) {
									this.canvas._tintSprite(sprite, 0xbbf7d0);
								}
							});
						};
						option.onpointerout = (event) => {
							this.app.stage.children.forEach((sprite) => {
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
			if (!sprite.name.includes("cable")) {
				chemlib_obj._connections.forEach(
					(cable: chemlib.ElectricComponent) => {
						let conComp: chemlib.ElectricComponent =
							cable._connections[0] === chemlib_obj
								? cable._connections[1]
								: cable._connections[0];
						// @ts-ignore
						let tag: SlTag = this.shadowRoot.createElement(
							"sl-tag"
						) as SlTag;
						tag.innerHTML = this.itemName(conComp._type);
						tag.style.margin = "5px";
						this.localizeControl(tag, "title", "Doppelklicken zum Lösen der Verbindung.");
						tag.addEventListener("pointerenter", (event) => {
							tag.variant = "success";
							this.app.stage.children.forEach((sprite) => {
								if (
									Number.parseInt(
										sprite.name.split(":")[1]
									) === conComp._id &&
									sprite.name.split(":")[0] === conComp._type
								) {
									this.canvas._tintSprite(sprite, 0xbbf7d0);
								}
							});
						});
						tag.addEventListener("pointerleave", (event) => {
							tag.variant = "neutral";
							this.app.stage.children.forEach((sprite) => {
								this.canvas._tintSprite(sprite, 0xffffff);
							});
						});
						tag.addEventListener("dblclick", (event) => {
							let fallbackSprite = sprite
							this.curr_obj._connections.forEach((comp:chemlib.ElectricComponent)=>{
								if(comp._connections.includes(conComp)){
									this._emitAlert(
										this.message("Verbindung gelöst zwischen {from} und {to}", { from: this.itemName(this.curr_obj._type), to: this.itemName(conComp._type) }),
										"danger",
										false,
										1500
									);
									this._remEcon(comp);
									this.app.stage.children.forEach((sprite) => {
										this.canvas._tintSprite(sprite, 0xffffff);
									});
								}
							})
							// console.log(fallbackSprite.name)
							this._getObject(fallbackSprite)
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
					let mixVoltage: SlTag = this.shadowRoot.getElementById(
						"shownVoltage"
					) as SlTag;
					mixVoltage.innerHTML =
						chemlib_obj._visibleVoltage.toExponential(2) + " V";
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

		this.curr_stage_index = this.app.stage.children.indexOf(sprite);
		this.curr_obj = chemlib_obj;
		this.curr_name = name;
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
		if (
			Object.values(chemlib.EComponentType).includes(this.curr_obj._type)
		) {
			let length: number = this.curr_obj._connections.length;
			for (let i = 0; i < length; i++) {
				this._remEcon(this.curr_obj._connections[0]);
			}
		}
		if (
			this.curr_obj._type === "flask" ||
			this.curr_obj._type === "beaker"
		) {
			this.allEComponents.forEach((eComp) => {
				if (typeof eComp != "undefined") {
					if (eComp._type === "electrode") {
						if (eComp._connectedMix === this.curr_obj._content) {
							eComp._connectedMix = undefined;
							this._emitAlert(
								this.message("{from} aus {to} entfernt.", { from: this.itemName(eComp._type), to: this.itemName(this.curr_obj._type) }),
								"danger",
								false,
								1500
							);
						}
					}
				}
			});
		}

		const sprite = this.app.stage.children[this.curr_stage_index];
		this.stopDose?.();
		this.hideFillMeter();
		this.removeAuthoredComponent(sprite);
		this.canvas.removeSprite(sprite);

		if (this.allChemComponents.includes(this.curr_obj)) {
			this.allChemComponents.splice(
				this.allChemComponents.indexOf(this.curr_obj),
				1
			);
		}

		if (this.allEComponents.includes(this.curr_obj)) {
			this.allEComponents.splice(
				this.allEComponents.indexOf(this.curr_obj),
				1
			);
		}

		this.localizeControl(this.settings_drawer, "textContent", "Objekt");
		this.shadowRoot.getElementById("comp_panel").style.display = "none";
		this.shadowRoot.getElementById("ecomp_panel").style.display = "none";

		this.simulation.remTickerFunction("transfer" + this.curr_name);
		this.simulation.remTickerFunction("echem" + this.curr_name);

		this._sendxAPiStatement("removed", this.curr_name);

		this.clearObjectSelection();
		this.canvas._updateCablePos();
	}

	clearObjectSelection(): void {
		if (this.editingMolecule || !this.curr_obj) return;
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
	 * loads available compoents into the corresponding part of the context menu
	 *
	 * @private
	 */
	private _listComponents(): void {
		let details = this.shadowRoot.getElementById("details_comp");
		if (this.components_signal[0]) {
			return;
		}

		for (const en_key in chemlib.ComponentType) {
			if(en_key.toLowerCase() != "separatingfunnel" && en_key.toLowerCase() != "condenser"){
				const key = en_key.toLowerCase();
				// @ts-ignore
				let elem: SlMenuItem = this.shadowRoot.createElement(
					"sl-menu-item"
				) as SlMenuItem;
				elem.addEventListener("click", () => {
					this._addComponent(false, en_key);
					this.contextMenu.style.display = "none";
				});
				this.localizeControl(elem, "textContent", this.dictionary[key]);
				elem.value = key;
				details.appendChild(elem);
				// @ts-ignore
				let toElem: SlOption = this.shadowRoot.createElement(
					"sl-option"
				) as SlOption;
				toElem.style.fontSize = "11pt";
				this.localizeControl(toElem, "textContent", this.dictionary[key]);
				toElem.value = key;
				this.invCompSelect.appendChild(toElem);
			}
		}

		this.components_signal[0] = true;
	}
	/**
	 * loads available e-compoents into the corresponding part of the context menu
	 *
	 * @private
	 */
	private _listEComponents(): void {
		let details = this.shadowRoot.getElementById("details_ecomp");

		if (this.components_signal[1]) {
			return;
		}

		for (const en_key in chemlib.EComponentType) {
			if (en_key.toLowerCase() != "cable") {
				const key = en_key.toLowerCase();
				// @ts-ignore
				let elem: SlMenuItem = this.shadowRoot.createElement(
					"sl-menu-item"
				) as SlMenuItem;
				elem.addEventListener("click", () => {
					this._addComponent(true, en_key);
					this.contextMenu.style.display = "none";
				});
				this.localizeControl(elem, "textContent", this.dictionary[key]);
				elem.value = key;
				details.appendChild(elem);
				// @ts-ignore
				let toElem: SlOption = this.shadowRoot.createElement(
					"sl-option"
				) as SlOption;
				toElem.style.fontSize = "11pt";
				this.localizeControl(toElem, "textContent", this.dictionary[key]);
				toElem.value = key;
				this.invCompSelect.appendChild(toElem);
			}
		}

		this.components_signal[1] = true;
	}

	/**
	 * loads element data into the panel view
	 *
	 * @private
	 */
	private _listAtoms(): void {
		let elements: string[] = chemlib.ElementData.getElementList();
		let field = this.shadowRoot.getElementById("atoms");

		if (this.components_signal[2]) {
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

		this.components_signal[2] = true;
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

			let newComp: chemlib.ChemComponent | chemlib.ElectricComponent;

			if (
				Object.values(chemlib.ComponentType).includes(
					component["type"].toLowerCase() as chemlib.ComponentType
				)
			) {
				newComp = chemlib.ComponentManager.newChemComponent(
					component["type"].toLowerCase()
				);
				this.allChemComponents.push(newComp);
				let newMix: chemlib.Mixture = this._loadMixture(
					component["content"],
					component["vol"]
				);
				newComp.addContents({ nMix: newMix });
				const capacity = Number(component["capacityMl"]);
				if (Number.isFinite(capacity) && capacity > 0) newComp._volume = capacity;
				for (const saved of (component["doses"] ?? []) as SavedDose[]) {
					const dose = this.buildDose(saved.recipe);
					if (dose && Number.isFinite(saved.volumeMl) && saved.volumeMl > 0) {
						newComp.addContents({ nMix: dose(saved.volumeMl) });
					}
				}
			} else {
				newComp = chemlib.ComponentManager.newElectricComponent(
					component["type"].toLowerCase()
				);
				switch (newComp._type) {
					case chemlib.EComponentType.Electrode:
						if (!component["material"]) break;
						newComp._material = this._loadMolecule(
							component["material"],
							false
						);
						if (newComp._material._atoms.length === 0) {
							newComp._material = undefined;
							break;
						}
						newComp._material.name = component["material"];
						this.electrodeMaterials.push([
							newComp._material.name,
							newComp._material,
						]);
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

			const sprite = this.canvas._addSprite(
				newComp._type + ":" + newComp._id, entry !== undefined,
				newComp instanceof chemlib.ChemComponent ? newComp._volume : undefined
			);
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
		let mol: chemlib.Molecule = chemlib.StructureManager.newMolecule();
		let selMolEntry: object = {};

		if (typeof entry === "undefined") {
			this.availableMolecules.forEach((molEntry) => {
				if (molEntry["formula"] === formula) {
					selMolEntry = molEntry;
				}
			});
		} else {
			selMolEntry = entry;
		}

		if (Object.keys(selMolEntry).length != 0) {
			selMolEntry["atoms"].forEach((atomEntry) => {
				let atomSymbol: string =
					chemlib.ElementData.getData(atomEntry)["symbol"];
				let atom = mol.addAtom(atomEntry, atomSymbol);
				if (append) {
					this._appendBondsList(atom);
				}
			});
			selMolEntry["bonds"].forEach((bondEntry) => {
				if (bondEntry.length > 0) {
					let separatedEntry: string[] = bondEntry.split(":");
					let connectedIds: number[] = [
						Number.parseInt(separatedEntry[0].split("-")[0]),
						Number.parseInt(separatedEntry[0].split("-")[1]),
					];
					let bondType: string = separatedEntry[1];
					let bondMag: number = Number.parseInt(separatedEntry[2]);

					mol.addBond(
						connectedIds[0],
						connectedIds[1],
						bondMag,
						100,
						bondType
					);
				}
			});
		}

		return mol;
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
			this._getObject(this.app.stage.children[this.curr_stage_index]);
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
		this.canvas._addSprite(cable._type + ":" + cable._id);
		if (!source) {
			const sprite = this.app.stage.children.find(
				(sprite) => sprite.name === sComp._type + ":" + sComp._id
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
	private _remEcon(partner: chemlib.ElectricComponent): void {
		let message: string = this.curr_obj.disconnect(partner);
		this._getObject(this.app.stage.children[this.curr_stage_index]);
		if (message === "") {
			this._sendxAPiStatement(
				"removed",
				"eCon " + this.curr_obj._type + this.curr_obj._id,
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
				"eCon " + this.curr_obj._type + this.curr_obj._id,
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
		this.saveSelectedComponent({ material: formula });
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
	 * disables preselected compoents for student use 
	 *
	 * @private
	 */
	private filterComponents(): void {
		let eDetails = this.shadowRoot.getElementById("details_ecomp");
		let cDetails = this.shadowRoot.getElementById("details_comp");

		for (let i = 0; i < eDetails.childElementCount; i++) {
			if (this.invComponents.includes((eDetails.children[i] as SlMenuItem).value)) {
				eDetails.children[i].setAttribute("disabled", "true");
			} else {
				eDetails.children[i].removeAttribute("disabled");
			}
		}
		for (let i = 0; i < cDetails.childElementCount; i++) {
			if (this.invComponents.includes((cDetails.children[i] as SlMenuItem).value)) {
				cDetails.children[i].setAttribute("disabled", "true");
			} else {
				cDetails.children[i].removeAttribute("disabled");
			}
		}
	}

	/**
	 * renders the entire widget
	 *
	 * @returns {*}
	 */
	render() {
		return html`
			<div
				id="upper"
				class=${this.objectPanelOpen ? "show-object-panel" : ""}
			>
				<div id="canvasArea" @dragover=${this.handleComponentDragOver} @drop=${this.dropComponent}>
					${this.pix_canvas}
					${this.renderFillMeter()}
					${this.renderControlButtons()}
				</div>
				<aside id="objectArea">
					<sl-button
						id="toggleObjectPanel"
						size="small"
						variant="default"
						title=${this.message(this.objectPanelOpen ? "Schließen" : "Panel anzeigen")}
						aria-controls="objectPanel"
						aria-expanded=${this.objectPanelOpen}
						?disabled=${!this.curr_obj && !this.editingMolecule}
						@click=${() => this.setObjectPanelOpen(!this.objectPanelOpen)}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"
							aria-hidden="true">
							<rect x="3.5" y="4.5" width="17" height="15" rx="1"/>
							<path d="M15.5 5v14"/>
							<path d=${this.objectPanelOpen ? "m8 9 3 3-3 3" : "m11 9-3 3 3 3"}/>
						</svg>
						<span class="panel-button-label">${this.message(this.objectPanelOpen ? "Schließen" : "Panel anzeigen")}</span>
					</sl-button>
					${this.renderObjectSummary()}
					${this.renderObjectPanel()}
				</aside>
				${this.renderDiagramDrawer()}
				${this.renderConfirmDialog()}
				${this.renderContextMenu()}
				${this.renderTeacherDrawer()}
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
		if (this.objectPanelOpen === open) return;
		this.objectPanelOpen = open;
		this._sendxAPiStatement(open ? "opened" : "closed", "objectPanel");
	}

	private renderDiagramDrawer() {
		return html`
				<sl-drawer
					id="diagramDrawer"
					label=${this.message("Diagramme")}
					contained
					placement="start"
					no-header
				>
					<button
						@click="${() => {
							this.diagramDrawer.hide();
							this._sendxAPiStatement("closed", "diagram panel");
						}}"
						style="position: absolute; top: 7.5px; right: 7.5px"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
						>
							<path
								fill="#b80000"
								d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
							/>
						</svg>
					</button>
					<div
						style="position: absolute; top: 7.5px; left: 7.5px; display: flex; flex-direction: row; align-items: baseline"
					>
						<sl-badge variant="primary">${this.message("Diagramme")}</sl-badge>
						<sl-checkbox
							.checked=${this.diagrams.showLine}
							@sl-change=${(event) => {
								this.diagrams.toggleShowLine();
							}}
							><p>${this.message("Kurven anzeigen")}</p></sl-checkbox
						>
					</div>
					<div
						id="canvasContainer"
						style="position: absolute; top: 50px; left: 0px; width: 100%; max-height: 550px; overflow: auto"
					></div>
				</sl-drawer>
		`;
	}

	private renderControlButtons() {
		return html`
				<div
					id="buttonRowTop"
					style="position: absolute; top: 0px; right: 0px; display: flex; flex-direction: column"
				>
					<button
						id="buttonFullscreen"
						title=${this.message("Vollbild an/aus")}
						aria-label=${this.message("Vollbild an/aus")}
						@click="${() => {
							if (this.ownerDocument.fullscreenElement === this) {
								this.ownerDocument.exitFullscreen();
								this._sendxAPiStatement(
									"selected",
									"window mode"
								);
							} else {
								this.requestFullscreen();
								this._sendxAPiStatement(
									"selected",
									"fullscreen mode"
								);
							}
						}}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"
							/>
						</svg>
					</button>
				</div>
				<div
					id="buttonRowLeft"
					style="position: absolute; top: 0px; left: 0px; display: flex; flex-direction: column"
				>
					<button
						id="toggleDiagramDrawer"
						@click="${() => {
							this.diagramDrawer.show();
							this._sendxAPiStatement("opened", "diagramPanel");
						}}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M12.5 8v8l4-4zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm5-2h9V5h-9z"
							/>
						</svg>
					</button>
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

	private renderTeacherDrawer() {
		return html`
			<section id="teacherDrawer" class="author-only" aria-label=${this.message("Lehrkraft Steuerung")}>
				<sl-button size="small" aria-controls="teacherDrawerContent" aria-expanded=${this.teacherDrawerOpen}
					@click=${() => { this.teacherDrawerOpen = !this.teacherDrawerOpen; }}>
					<svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
						<path d=${this.teacherDrawerOpen ? "m4 6 4 4 4-4" : "m4 10 4-4 4 4"}/>
					</svg>
					${this.message("Lehrkraft Steuerung")}
				</sl-button>
				${this.selectedChemical ? html`
					<sl-button size="small" @click=${() => { this.selectedChemical = undefined; }}>
						${this.selectedChemical.name} ×
					</sl-button>` : ""}
				<div id="teacherDrawerContent" ?hidden=${!this.teacherDrawerOpen}>
					<div class="teacher-tabs">
						<sl-button size="small" ?outline=${this.teacherTab !== "components"}
							@click=${() => { this.teacherTab = "components"; }}>${this.message("Komponenten")}</sl-button>
						<sl-button size="small" ?outline=${this.teacherTab !== "chemicals"}
							@click=${() => { this.teacherTab = "chemicals"; }}>${this.message("Chemikalien")}</sl-button>
					</div>
					<div ?hidden=${this.teacherTab !== "components"}>
						<div class="teacher-palette">
							${(Object.keys(componentGraphics) as PaletteComponent[]).map((type) => {
								const graphic = componentGraphic(type);
								const capacity = this.componentCapacities[type] ?? graphic.capacityMl;
								const step = graphic.capacityMl && Math.max(1, Math.round(graphic.capacityMl / 10));
								return html`
									<div class="teacher-card">
										<button type="button" class="component-tile" draggable="true"
											aria-pressed=${this.componentToPlace === type}
											@dragstart=${(event: DragEvent) => this.startComponentDrag(event, type)}
											@click=${() => {
												this.componentToPlace = this.componentToPlace === type ? undefined : type;
												this.selectedChemical = undefined;
											}}>
											<img src=${graphic.url} alt="" draggable="false"/>
											<span>${this.itemName(type)}</span>
										</button>
										${capacity ? html`
											<label class="capacity-control">
												<span>${capacity} mL</span>
												<input type="range" min=${step} max=${graphic.capacityMl * 2} step=${step} .value=${String(capacity)}
													aria-label=${this.itemName(type) + " · mL"}
													@input=${(event: Event) => {
														this.componentCapacities = {
															...this.componentCapacities,
															[type]: Number((event.target as HTMLInputElement).value),
														};
													}}/>
											</label>` : ""}
									</div>
								`;
							})}
						</div>
						<sl-select id="invCompSelect" size="small" hoist clearable multiple
							label=${this.message("Ausblenden")}
							@sl-change=${() => {
								this.invComponents = this.invCompSelect.value as string[];
								this.filterComponents();
							}}>
						</sl-select>
					</div>
					<div ?hidden=${this.teacherTab !== "chemicals"}>
						${this.teacherDrawerOpen && this.teacherTab === "chemicals" ? this.renderChemicalCatalog() : ""}
						<sl-details summary=${this.message("Eigene Moleküle und Gemische")}>
							<div class="teacher-editors">
								<section><h3>${this.message("Moleküle")}</h3><div id="molConfig"></div></section>
								<section><h3>${this.message("Gemische")}</h3><div id="mixConfig"></div></section>
							</div>
						</sl-details>
					</div>
				</div>
			</section>
		`;
	}

	private renderChemicalTile(key: string, name: string, recipe: ChemicalRecipe) {
		const preview = recipe.parts.find(({ molecule }) =>
			!["H₂O", "OH2", "H2O"].includes(molecule.formula))?.molecule ?? recipe.parts[0]?.molecule;
		if (!preview) return "";
		const src = this.previewMolecule(preview);
		return html`
			<button type="button" class="chemical-tile" aria-pressed=${this.selectedChemical?.key === key}
				@click=${() => {
					this.componentToPlace = undefined;
					this.selectedChemical = this.selectedChemical?.key === key ? undefined : { key, name, recipe };
				}}>
				${src ? html`<img src=${src} alt=""/>` : ""}
				<span>${name}</span>
				<small>${preview.formula}</small>
			</button>
		`;
	}

	private renderChemicalCatalog() {
		const molecules = this.availableMolecules as MoleculeDefinition[];
		return html`
			<h3>${this.message("Feststoffe")}</h3>
			<div class="teacher-palette">${chemicalCatalog.filter((item) => item.phase === "solid")
				.map((item) => this.renderChemicalTile(item.name, this.message(item.name), item))}</div>
			<h3>${this.message("Flüssigkeiten")}</h3>
			<div class="teacher-palette">${chemicalCatalog.filter((item) => item.phase === "liquid")
				.map((item) => this.renderChemicalTile(item.name, this.message(item.name), item))}</div>
			<h3>${this.message("Eigene Stoffe")}</h3>
			<div class="teacher-palette">
				${molecules.map((molecule) => this.renderChemicalTile("mol:" + molecule.formula, molecule.formula, {
					phase: ["OH2", "H2O"].includes(molecule.formula) ? "liquid" : "solid",
					density: 1, parts: [{ molecule, amount: 1 }],
				}))}
				${this.availableMixtures.map((mixture) => {
					const parts = (mixture["content"] as string[]).flatMap((entry) => {
						const [formula, rawAmount] = entry.split(":");
						const molecule = molecules.find((item) => item.formula === formula.trim());
						const amount = Number(rawAmount);
						return molecule && Number.isFinite(amount) && amount > 0 ? [{ molecule, amount }] : [];
					});
					return this.renderChemicalTile("mix:" + mixture["name"], mixture["name"], {
						phase: parts.some(({ molecule }) => ["OH2", "H2O"].includes(molecule.formula)) ? "liquid" : "solid",
						density: 1, parts,
					});
				})}
			</div>
		`;
	}

	private renderFillMeter() {
		const meter = this.fillMeter;
		return meter ? html`
			<div class="fill-meter" style="left:${meter.x}px;top:${meter.y}px">
				<meter min="0" max=${meter.capacity} .value=${meter.volume} aria-label=${this.message("Füllstand")}></meter>
				<span>${Math.min(meter.capacity, meter.volume).toFixed(1)} / ${meter.capacity} mL</span>
			</div>` : "";
	}

	private renderContextMenu() {
		return html`
				<div
					id="contextMenu"
					style="position: absolute; display:none; box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33); border-radius: 5px"
				>
					<sl-menu id="studentContext" style="max-width: 200px;">
						<sl-menu-label>${this.message("Neues Objekt")}</sl-menu-label>
						<sl-menu-item>
							${this.message("Laborgeräte")}
							<sl-menu
								slot="submenu"
								id="details_comp"
								style="box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33);"
							>
							</sl-menu>
						</sl-menu-item>
						<sl-menu-item>
							${this.message("Elektronik")}
							<sl-menu
								slot="submenu"
								id="details_ecomp"
								style="box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33);"
							>
							</sl-menu>
						</sl-menu-item>
					</sl-menu>
				</div>
		`;
	}

	private renderObjectSummary() {
		return html`
			<section id="contextInfoBox" ?hidden=${!this.curr_obj || this.editingMolecule}>
				<sl-badge id="contextBadge">${this.itemName(this.curr_name.split(":")[0])}</sl-badge>
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
				<div style="display: flex; flex-direction:column">
					<button
						id="rem_obj"
						class="remObj"
						@click="${this._removeSprite}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 16 16"
						>
							<path
								fill="currentColor"
								d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
							/>
						</svg>
						${this.message("{name} löschen", { name: this.itemName(this.curr_name.split(":")[0]) })}
					</button>
					<button
						id="openComp"
						@click="${(event) => {
							let currSprite =
								this.app.stage.children[
									this.curr_stage_index
								];
							if (
								!this.simulation.tickerFunctionList.some(([id]) => id === "transfer" + this.curr_name)
							) {
								this.requestUpdate();
								let source = this.curr_obj;
								this.simulation.pushTickerFunction(
									"transfer" +
										this.curr_name,
									this._updateTickerTransfer,
									[currSprite, source]
								);
								this._sendxAPiStatement(
									"started",
									"transfer" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							} else {
								this.requestUpdate();
								this.simulation.remTickerFunction(
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
						${this.message(this.simulation.tickerFunctionList.some(([id]) => id === "transfer" + this.curr_name) ? "Schließen" : "Öffnen")}
					</button>
					<button
						id="activateEComp"
						@click="${(event) => {
							let currSprite =
								this.app.stage.children[
									this.curr_stage_index
								];
							if (
								!this.simulation.tickerFunctionList.some(([id]) => id === "echem" + this.curr_name)
							) {
								this.requestUpdate();
								this.canvas.setDeviceActive(currSprite as PIXI.Sprite, true);
								let source = this.curr_obj;
								this.simulation.pushTickerFunction(
									"echem" +
										this.curr_name,
									this._updateTickerEChem,
									[currSprite, source]
								);
								this._sendxAPiStatement(
									"started",
									"echem" +
										this.curr_obj._type +
										":" +
										this.curr_obj._id
								);
							} else {
								this.requestUpdate();
								this.canvas.setDeviceActive(currSprite as PIXI.Sprite, false);
								this.simulation.remTickerFunction(
									"echem" +
										this.curr_name
								);
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
						${this.message(this.simulation.tickerFunctionList.some(([id]) => id === "echem" + this.curr_name) ? "Ausschalten" : "Einschalten")}
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
				?hidden=${!this.objectPanelOpen}
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
																	this.saveSelectedComponent({ content: "", vol: 0, doses: [] });
																	this._getObject(this.app.stage.children[this.curr_stage_index]);
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
																			this.mixSelect.disabled =
																				true;
																			this._getObject(
																				this.app.stage.children[
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
														<p>${this.message("Spannung")}</p>
														<sl-tag
															id="shownVoltage"
															variant="warning"
															>${0} V</sl-tag
														>
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
														<sl-select
															id="electrodeSelect"
															size="small"
														></sl-select>
														<button
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
}
