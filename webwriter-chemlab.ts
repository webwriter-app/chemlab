import { drawerLabels, effectiveLanguage, localize } from "./localization/localization";
import { html, LitElement, PropertyValueMap } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
	customElement,
	property,
	query,
} from "lit/decorators.js";

import { style } from "chemlab-style";

import * as PIXI from "pixi.js";
import * as chemlib from "chemlib";
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
import SlTab from "@shoelace-style/shoelace/dist/components/tab/tab.component.js";
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js";
import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.component.js";
import SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group.component.js";
import SlTabPanel from "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.component.js";
import SlSplitPanel from "@shoelace-style/shoelace/dist/components/split-panel/split-panel.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlRating from "@shoelace-style/shoelace/dist/components/rating/rating.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlMenuLabel from "@shoelace-style/shoelace/dist/components/menu-label/menu-label.component.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.component.js";
import SlCarouselItem from "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js";
import SlDrawer from "@shoelace-style/shoelace/dist/components/drawer/drawer.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";

import "@shoelace-style/shoelace/dist/themes/light.css";

import { setAnimation } from "@shoelace-style/shoelace/dist/utilities/animation-registry.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("@shoelace-style/shoelace/dist");

import {
	HelpOverlay,
	HelpPopup,
} from "@webwriter/wui/dist/helpSystem/helpSystem.js";
import {
	uniqueNamesGenerator,
	Config,
	adjectives,
	colors,
	animals,
} from "unique-names-generator";
import Chart from "chart.js/auto";

// @ts-ignore
import beaker_svg from "./media/beaker.svg";
// @ts-ignore
import beaker_fl_svg from "./media/beaker_full_l.svg";
// @ts-ignore
import beaker_fs_svg from "./media/beaker_full_s.svg";
// @ts-ignore
import flask_svg from "./media/flask.svg";
// @ts-ignore
import flask_fl_svg from "./media/flask_full_l.svg";
// @ts-ignore
import flask_fs_svg from "./media/flask_full_s.svg";
// @ts-ignore
import burette_svg from "./media/burette.svg";
// @ts-ignore
import burette_fl_svg from "./media/burette_full_l.svg";
// @ts-ignore
import burette_fs_svg from "./media/burette_full_s.svg";
// @ts-ignore
import testtube_svg from "./media/testtube.svg";
// @ts-ignore
import testtube_fl_svg from "./media/testtube_full_l.svg";
// @ts-ignore
import testtube_fs_svg from "./media/testtube_full_S.svg";
// @ts-ignore
import cable_svg from "./media/cable.svg";
// @ts-ignore
import source_off_svg from "./media/source_off.svg";
// @ts-ignore
import source_on_svg from "./media/source_on.svg";
// @ts-ignore
import voltmeter_off_svg from "./media/voltmeter_off.svg";
// @ts-ignore
import voltmeter_on_svg from "./media/voltmeter_on.svg";
// @ts-ignore
import default_svg from "./media/default.svg";
// @ts-ignore
import bg_svg from "./media/bg.png";
import { HALF_PI, isNumber } from "chart.js/helpers";

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

	private readonly message = localize(this, () => {
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
		this.diagramList.forEach(([, , updateLabels]) => updateLabels());
	}

	private itemName(key: string) {
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
	private accessor containerDiv: HTMLDivElement;
	/**
	 * molecule part of context menu in teacher view
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#molConfig")
	private accessor molConfig: SlMenu;
	/**
	 * mixture part of context menu in teacher view
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#mixConfig")
	private accessor mixConfig: SlMenu;
	/**
	 * component part of context menu in teacher view
	 *
	 * @private
	 * @type {SlMenu}
	 */
	@query("#compConfig")
	private accessor compConfig: SlMenu;
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
	private accessor contextMenu: SlMenu;
	/**
	 * confirmation dialog box element
	 *
	 * @private
	 * @type {SlDialog}
	 */
	@query("#confirmDialog")
	private accessor confirmDialog: SlDialog;
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
	 * shoelace tab container for the panel 
	 *
	 * @private
	 * @type {SlTabGroup}
	 */
	@query("#tab_select")
	private accessor tab_select: SlTabGroup;
	/**
	 * main panel tab for current component
	 *
	 * @private
	 * @type {SlTab}
	 */
	@query("#settings_drawer")
	private accessor settings_drawer: SlTab;
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
	 * shoelace popup containing the object context menu element
	 *
	 * @private
	 * @type {SlPopup}
	 */
	@query("#contextPopup")
	private accessor contextPopup: SlPopup;
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
	 * shoelace popup containing the tab panel
	 *
	 * @private
	 * @type {SlPopup}
	 */
	@query("#tabPopup")
	private accessor tabPopup: SlPopup;
	/**
	 * anchor element of the panel popup
	 *
	 * @private
	 * @type {HTMLSpanElement}
	 */
	@query("#tabPopupAnchor")
	private accessor tabPopupAnchor: HTMLSpanElement;
	/**
	 * anchor element of the context popup
	 *
	 * @private
	 * @type {HTMLSpanElement}
	 */
	@query("#contextPopupAnchor")
	private accessor contextPopupAnchor: HTMLSpanElement;
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
	 * shoelace drawer containing diagramm containers
	 *
	 * @private
	 * @type {SlDrawer}
	 */
	@query("#diagramDrawer")
	private accessor diagramDrawer: SlDrawer;
	/**
	 * main container inside diagram drawer for all diagrams and headings
	 *
	 * @private
	 * @type {HTMLDivElement}
	 */
	@query("#canvasContainer")
	private accessor canvasContainer: HTMLDivElement;
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
	private accessor pHColors: object = {
		// *pride*
		0: "#ee1c25",
		1: "#f26724",
		2: "#f9c511",
		3: "#f5ed1c",
		4: "#b5d333",
		5: "#83c241",
		6: "#33a94b",
		7: "#33a94b",
		8: "#22b46b",
		9: "#0bb8b6",
		10: "#4690cd",
		11: "#3853a4",
		12: "#5a51a2",
		13: "#63459d",
		14: "#462c83",
	};
	/**
	 * dictionary for german translation of all internal keywords
	 *
	 * @private
	 * @type {object}
	 */
	@property({ attribute: false })
	private accessor dictionary: object = {
		testtube: "Reagenzglas",
		beaker: "Becherglas",
		burette: "Bürette",
		flask: "Kolben",
		condenser: "Kühler",
		separatingfunnel: "Scheidetrichter",
		cable: "Kabel",
		electrode: "Elektrode",
		source: "Spannungsquelle",
		voltmeter: "Voltmeter",
		hydrogen: "Wasserstoff",
		helium: "Helium",
		lithium: "Lithium",
		beryllium: "Beryllium",
		boron: "Bor",
		carbon: "Kohlenstoff",
		nitrogen: "Stickstoff",
		oxygen: "Sauerstoff",
		fluorine: "Fluor",
		neon: "Neon",
		sodium: "Natrium",
		magnesium: "Magnesium",
		aluminum: "Aluminium",
		silicon: "Silizium",
		phosphorus: "Phosphor",
		sulfur: "Schwefel",
		chlorine: "Chlor",
		argon: "Argon",
		potassium: "Kalium",
		calcium: "Calcium",
		scandium: "Scandium",
		titanium: "Titan",
		vanadium: "Vanadium",
		chromium: "Chrom",
		manganese: "Mangan",
		iron: "Eisen",
		cobalt: "Cobalt",
		nickel: "Nickel",
		copper: "Kupfer",
		zinc: "Zink",
		gallium: "Gallium",
		germanium: "Germanium",
		arsenic: "Arsen",
		selenium: "Selen",
		bromine: "Brom",
		krypton: "Krypton",
		rubidium: "Rubidium",
		strontium: "Strontium",
		yttrium: "Yttrium",
		zirconium: "Zirkonium",
		niobium: "Niob",
		molybdenum: "Molybdän",
		technetium: "Technetium",
		ruthenium: "Ruthenium",
		rhodium: "Rhodium",
		palladium: "Palladium",
		silver: "Silber",
		cadmium: "Cadmium",
		indium: "Indium",
		tin: "Zinn",
		antimony: "Antimon",
		tellurium: "Tellur",
		iodine: "Iod",
		xenon: "Xenon",
		cesium: "Caesium",
		barium: "Barium",
		lanthanum: "Lanthan",
		cerium: "Cer",
		praseodymium: "Praseodym",
		neodymium: "Neodym",
		promethium: "Promethium",
		samarium: "Samarium",
		europium: "Europium",
		gadolinium: "Gadolinium",
		terbium: "Terbium",
		dysprosium: "Dysprosium",
		holmium: "Holmium",
		erbium: "Erbium",
		thulium: "Thulium",
		ytterbium: "Ytterbium",
		lutetium: "Lutetium",
		hafnium: "Hafnium",
		tantalum: "Tantal",
		tungsten: "Wolfram",
		rhenium: "Rhenium",
		osmium: "Osmium",
		iridium: "Iridium",
		platinum: "Platin",
		gold: "Gold",
		mercury: "Quecksilber",
		thallium: "Thallium",
		lead: "Blei",
		bismuth: "Wismut",
		polonium: "Polonium",
		astatine: "Astat",
		radon: "Radon",
		francium: "Francium",
		radium: "Radium",
		actinium: "Actinium",
		thorium: "Thorium",
		protactinium: "Protactinium",
		uranium: "Uran",
		neptunium: "Neptunium",
		plutonium: "Plutonium",
		americium: "Americium",
		curium: "Curium",
		berkelium: "Berkelium",
		californium: "Californium",
		einsteinium: "Einsteinium",
		fermium: "Fermium",
		mendelevium: "Mendelevium",
		nobelium: "Nobelium",
		lawrencium: "Lawrencium",
		rutherfordium: "Rutherfordium",
		dubnium: "Dubnium",
		seaborgium: "Seaborgium",
		bohrium: "Bohrium",
		hassium: "Hassium",
		meitnerium: "Meitnerium",
		darmstadtium: "Darmstadtium",
		roentgenium: "Roentgenium",
		copernicium: "Copernicium",
		nihonium: "Nihonium",
		flerovium: "Flerovium",
		moscovium: "Moscovium",
		livermorium: "Livermorium",
		tennessine: "Tenness",
		oganesson: "Oganesson",
		ununennium: "Ununennium",
		"alkali metal": "Alkalimetall",
		"alkaline earth metal": "Erdalkalimetall",
		"transition metal": "Übergangsmetall",
		"post-transition metal": "Postübergangsmetall",
		metalloid: "Halbmetall",
		"polyatomic nonmetal": "Polyatomares Nichtmetall",
		"diatomic nonmetal": "Diatomares Nichtmetall",
		halogen: "Halogen",
		"noble gas": "Edelgas",
		lanthanide: "Lanthanoid",
		actinide: "Actinoid",
		ionic: "ionische Bindung",
		acidbase: "Säure/Base Bindung",
		covalent: "kovalente Bindung"
	};
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
	private accessor availableMolecules: Array<object> = [
		{
			formula: "OH2",
			atoms: ["oxygen", "hydrogen", "hydrogen"],
			bonds: ["0-1:covalent:1", "0-2:covalent:1"],
		},
	];
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
	private accessor availableMixtures: Array<object> = [
	];
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
	private accessor availableComponents: Array<object> = [];
	private dataObserver?: MutationObserver;
	private savedDataSnapshot: string | null = null;
	private updatingDataBlock = false;
	private refreshFromRemoteData = false;
	private legacyData: Record<string, unknown> | null = null;
	/**
	 * list of all sprites of available components
	 *
	 * @private
	 * @type {Array<[PIXI.Sprite, number]>}
	 */
	@property({ attribute: false })
	private accessor avComponentsSprites: Array<[PIXI.Sprite, number]> = [];
	/**
	 * bounding rectangle of the main canvas for relative positioning
	 *
	 * @private
	 * @type {DOMRect}
	 */
	@property({ attribute: false })
	private accessor canvasBoundingRect: DOMRect;
	/**
	 * list of functions to be iteratively called by the PixiJS ticker system
	 *
	 * @private
	 * @type {Array<any>}
	 */
	@property({ attribute: false })
	private accessor tickerFunctionList: Array<any> = [];
	/**
	 * list of current diagrams, contains charts and corresponding div containers
	 *
	 * @private
	 * @type {Array<any>}
	 */
	@property({ attribute: false })
	private accessor diagramList: Array<any> = [];
	/**
	 * database to store update intervals for ticker functions
	 *
	 * @private
	 * @type {object}
	 */
	@property({ attribute: false })
	private accessor tickerTimeObj: object = {};
	/**
	 * show diagram lines
	 *
	 * @private
	 * @type {boolean}
	 */
	@property({ attribute: false })
	private accessor diagShowLine: boolean = false;
	/**
	 * device has touch abilities
	 *
	 * @private
	 * @type {boolean}
	 */
	@property({ attribute: false })
	private accessor hasTouch: boolean = false;
	/**
	 * touch input mode (drag/click)
	 *
	 * @private
	 * @type {boolean}
	 */
	@property({ attribute: false })
	private accessor dragToggle: boolean = true;
	/**
	 * simulate mouseover event when clicking once on a component sprite (for touch use)
	 *
	 * @private
	 * @type {boolean}
	 */
	@property({ attribute: false })
	private accessor touchHighlight: boolean = false;
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
	private accessor dragObject = undefined;
	/**
	 * current mouse position
	 *
	 * @private
	 * @type {number[]}
	 */
	@property({ attribute: false })
	private accessor mousePos: number[] = [0, 0];
	/**
	 * seperate container element for the PixiJS Application
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	private accessor pix_canvas = document.createElement("p_c");
	/**
	 * the PixiJS Application
	 *
	 * @private
	 * @type {*}
	 */
	@property({ attribute: false })
	private accessor app = null;
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
	private accessor allChemComponents: chemlib.ChemComponent[] = [];
	/**
	 * list of all current e-component objects
	 *
	 * @private
	 * @type {chemlib.ElectricComponent[]}
	 */
	@property({ attribute: false })
	private accessor allEComponents: chemlib.ElectricComponent[] = [];
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
	private accessor curr_obj: any = null;
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
	private accessor curr_stage_index: number = -1;
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
	private accessor confirmAction: number = 0; //0-pending,1-true,2-false
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
		this.hasTouch = navigator.maxTouchPoints > 0;
		this.addEventListener("fullscreenchange", () => {
			this.containerDiv.style.width = this.clientWidth + "px";
			this.containerDiv.style.height = this.clientHeight + "px";
			this.app.resizeTo = this.containerDiv;
			this.app.resize();
			this.requestUpdate();
		});
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

	/**
	 * all used custom elements, mainly shoelace elements and the webwriter helpOverlay
	 *
	 * @static
	 * @readonly
	 * @type {{ "sl-details": any; "sl-button": any; "sl-icon-button": any; "sl-icon": any; "sl-badge": any; "sl-button-group": any; "sl-tab": any; "sl-tab-group": any; "sl-tab-panel": any; "sl-split-panel": any; "sl-tag": any; "sl-divider": any; ... 20 more ...; "webwriter-helppopup": any; }}
	 */
	static get scopedElements() {
		return {
			"sl-details": SlDetails,
			"sl-button": SlButton,
			"sl-icon-button": SlIconButton,
			"sl-icon": SlIcon,
			"sl-badge": SlBadge,
			"sl-button-group": SlButtonGroup,
			"sl-tab": SlTab,
			"sl-tab-group": SlTabGroup,
			"sl-tab-panel": SlTabPanel,
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
			"sl-popup": SlPopup,
			"sl-card": SlCard,
			"sl-checkbox": SlCheckbox,
			"sl-drawer": SlDrawer,
			"sl-tooltip": SlTooltip,
			"sl-dialog": SlDialog,

			"webwriter-helpoverlay": HelpOverlay,
			"webwriter-helppopup": HelpPopup,
		};
	}

	connectedCallback(): void {
		const legacyNames = ["availablemolecules", "availablemixtures", "availablecomponents", "invcomponents"];
		this.legacyData = legacyNames.some((name) => this.hasAttribute(name)) ? {
			availableMolecules: this.readLegacyArray("availablemolecules"),
			availableMixtures: this.readLegacyArray("availablemixtures"),
			availableComponents: this.readLegacyArray("availablecomponents"),
			invComponents: this.getAttribute("invcomponents") ? this.getAttribute("invcomponents")!.split(",") : [],
		} : null;
		if (this.legacyData) this.applyAuthoredData(this.legacyData);
		super.connectedCallback();
		this.dataObserver = new MutationObserver(() => this.readAuthoredData());
		this.dataObserver.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["slot", "type"] });
		if (this.dataBlock()) this.readAuthoredData();
		else this.persistAuthoredData();
	}

	disconnectedCallback(): void {
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
		if (this.refreshFromRemoteData) {
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
				this.app.stage.children.filter((child) => child.name !== "bg_sprite").forEach((child) => this.app.stage.removeChild(child));
				this.allChemComponents = [];
				this.allEComponents = [];
				this.electrodeMaterials = [];
				this.avComponentsSprites = [];
				void this._loadComponents();
				this.compConfig.replaceChildren();
				this._listCompConfig();
			}
			if (changed.has("invComponents")) this.filterComponents();
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
		this.legacyData = null;
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
		this._canvas_init();
		this.focus();
		this.canvasBoundingRect = this.containerDiv.getBoundingClientRect();
		if (this.hasTouch) {
			let changeInput: HTMLButtonElement = this.shadowRoot.getElementById(
				"changeInput"
			) as HTMLButtonElement;
			let toggleDrag: HTMLButtonElement = this.shadowRoot.getElementById(
				"toggleDrag"
			) as HTMLButtonElement;
			changeInput.innerHTML = `                    
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"><path d="M12.566 26.182Q10 27.941 10 32c0 4.06 4.975 11 9.462 11h11.48C35.332 43 38 39.15 38 36.06V23.01a3 3 0 0 0-3-3h-.01A2.99 2.99 0 0 0 32 23"/><path d="M13.981 28.445V8.005a3 3 0 0 1 3.006-2.997a3.014 3.014 0 0 1 3.006 3.015v15.569"/><path stroke-linejoin="round" d="M19.993 23.008v-3.992a3.016 3.016 0 0 1 6.03 0v3.992"/><path stroke-linejoin="round" d="M26 22.716v-2.713a3 3 0 0 1 6 0v3"/></g></svg>
            `;
			toggleDrag.style.visibility = "visible";
		}
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

		let bg_sprite = PIXI.Sprite.from(bg_svg);
		bg_sprite.name = "bg_sprite";
		bg_sprite.anchor.set(0);
		bg_sprite.x = 0;
		bg_sprite.y = 0;
		bg_sprite.width = this.containerDiv.clientWidth;
		bg_sprite.height = this.containerDiv.clientHeight;
		bg_sprite.eventMode = "none";
		this.app.stage.addChild(bg_sprite);
		this.app.ticker.add(() => {
			let indexCount: number = 0;
			while (typeof this.tickerFunctionList[indexCount] != "undefined") {
				this.tickerFunctionList[indexCount][1].apply(
					this,
					this.tickerFunctionList[indexCount][2]
				);
				indexCount += 1;
			}
		});
		this._pushTickerFunction(
			this._updateTickerPopup.name,
			this._updateTickerPopup,
			[]
		);
		this._pushTickerFunction(
			this._updateCablePos.name,
			this._updateCablePos,
			[]
		);
		this._pushTickerFunction(
			this._updateSpriteTextures.name,
			this._updateSpriteTextures,
			[]
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
		this._listCompConfig();
		this._changePanelVariant();
		if (!this.hasAttribute("contenteditable")) {
			this.shadowRoot.getElementById("teacherContext").remove();
		} else {
			this.shadowRoot.getElementById("studentContext").remove();
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
			this.settings_drawer.removeAttribute("disabled");
			// this.curr_mol._bondTypes.forEach((key) => {
			// 	if(key in this.dictionary && key!= "hydrogen"){
			// 		// @ts-ignore
			// 		let bondType: SlOption = this.shadowRoot.createElement(
			// 			"sl-option"
			// 		) as SlOption;
			// 		bondType.innerHTML = this.dictionary[key];
			// 		bondType.value = key;
			// 		this.bond_sel_3.appendChild(bondType);
			// 	}
			// });

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
	 * puts a new function in the ticker list, creates new diagram if neccessary
	 *
	 * @private
	 * @param {string} name - the name of the function
	 * @param {Function} fn - the function reference
	 * @param {Array<any>} args - additional arguments of the function
	 */
	private _pushTickerFunction(
		name: string,
		fn: Function,
		args: Array<any>
	): void {
		this.tickerFunctionList.push([name, fn, args]);
		this.tickerTimeObj[name] = 0;
		// console.log(this.tickerTimeObj);
		if (name.includes("transfer") || name.includes("echem")) {
			for (let i = 0; i < this.diagramList.length; i++) {
				if (
					(this.diagramList[i][1] as HTMLDivElement).children[0]
						.id === name
				) {
					return;
				}
			}
			// @ts-ignore
			let canvasBundle: HTMLDivElement = this.shadowRoot.createElement(
				"div"
			) as HTMLDivElement;
			canvasBundle.style.borderTopStyle = "solid";
			canvasBundle.style.borderTopWidth = "2px";
			canvasBundle.style.borderTopColor = "#e5e5e5";
			canvasBundle.style.marginBlock = "20px";
			// @ts-ignore
			let canvasDiv: HTMLDivElement = this.shadowRoot.createElement(
				"div"
			) as HTMLDivElement;
			canvasDiv.style.width = "100%";
			canvasDiv.style.maxWidth = "500px";
			canvasDiv.style.height = "400px";
			// @ts-ignore
			let canvas: HTMLCanvasElement = this.shadowRoot.createElement(
				"canvas"
			) as HTMLCanvasElement;
			canvas.id = name;

			// @ts-ignore
			let canvasHeading: HTMLHeadingElement = this.shadowRoot.createElement("h5") as HTMLHeadingElement;
			const chartNumber = this.diagramList.length;
			const chartHeading = name.includes("transfer") ? "Titration"
				: name.includes("source") ? "Elektrolyse" : "Galvanische Zelle";

			canvasDiv.appendChild(canvas);
			// @ts-ignore
			let canvasHeadingContainer: HTMLDivElement = this.shadowRoot.createElement("div") as HTMLDivElement;
			canvasHeadingContainer.style.display = "flex";
			canvasHeadingContainer.style.alignItems = "baseline";
			// @ts-ignore
			let trashButton: HTMLButtonElement = this.shadowRoot.createElement(
				"button"
			) as HTMLButtonElement;
			trashButton.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16"><path fill="#d10000" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>`;
			trashButton.onclick = () => {
				const index = this.diagramList.findIndex(([, container]) => container === canvasDiv);
				if (index >= 0) {
					this.diagramList.splice(index, 1);
					chart.destroy();
				}
				canvasBundle.remove();
				this._sendxAPiStatement("removed", "diagram-" + name);
			};
			canvasHeadingContainer.appendChild(canvasHeading);
			canvasHeadingContainer.appendChild(trashButton);
			canvasBundle.appendChild(canvasHeadingContainer);
			canvasBundle.appendChild(canvasDiv);
			this.canvasContainer.appendChild(canvasBundle);

			let chartLabel = "";
			let chartTitleX = "";
			let chartTitleY = "";

			if (name.includes("transfer")) {
				chartLabel = "pH";
				chartTitleX = "Volumen [ml]";
				chartTitleY = "pH Wert";
			}
			if (name.includes("echem")) {
				if (name.includes("source")) {
					chartLabel = "n";
					chartTitleX = "Zeit [s]";
					chartTitleY = "umgesetzte Stoffmenge [mol]";
				}
				if (name.includes("voltmeter")) {
					chartLabel = "Spannung";
					chartTitleX = "Zeit [s]";
					chartTitleY = "Zellspannung [V]";
				}
			}
			let chart = new Chart(canvas, {
				type: "line",
				data: {
					labels: [],
					datasets: [],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						x: {
							beginAtZero: true,
							title: {
								text: this.message(chartTitleX),
								display: true,
							},
							grid: {
								drawOnChartArea: false,
							},
						},
						y: {
							beginAtZero: true,
							title: {
								text: this.message(chartTitleY),
								display: true,
							},
							grid: {
								drawOnChartArea: false,
							},
						},
					},
				},
			});

			chart.data.datasets.push({
				label: this.message(chartLabel),
				data: [],
				tension: 0.4,
				showLine: this.diagShowLine,
			});
			if (name.includes("source")) {
				chart.data.datasets.push({
					label: this.message(chartLabel),
					data: [],
					tension: 0.4,
					showLine: this.diagShowLine,
				});

			}

			const ionSymbols = name.includes("source")
				? chemlib.ComponentManager.isCircuit(args[1] as chemlib.ElectricComponent)
					.map(electrode => electrode._material?._atoms[0]?.getSymbol())
				: undefined;
			const updateLabels = () => {
				canvasHeading.innerText = chartNumber + ": " + this.message(chartHeading);
				chart.options.scales.x.title.text = this.message(chartTitleX);
				chart.options.scales.y.title.text = this.message(chartTitleY);
				if (ionSymbols) {
					chart.data.datasets.forEach((dataset, index) => {
						const symbol = ionSymbols[index];
						dataset.label = symbol ? this.message("Stoffmenge {symbol} Ionen [mol]", { symbol }) : chartLabel;
					});
				} else {
					chart.data.datasets[0].label = this.message(chartLabel);
				}
				chart.update("none");
			};
			updateLabels();
			this.diagramList.push([chart, canvasDiv, updateLabels]);
			this._sendxAPiStatement("created", "diagram-" + name);
		}
	}

	/**
	 * removes a ticker function from the list
	 *
	 * @private
	 * @param {string} name - the name of the function
	 */
	private _remTickerFunction(name: string): void {
		let toRemove: number = -1;
		for (let i = 0; i < this.tickerFunctionList.length; i++) {
			if (this.tickerFunctionList[i][0] === name) {
				toRemove = i;
			}
		}
		if (toRemove > -1) {
			this.tickerFunctionList.splice(toRemove, 1);
		}
	}

	/**
	 * ticker function to update popup contents regulary
	 *
	 * @private
	 */
	private _updateTickerPopup(): void {
		if (
			this.contextPopup.active &&
			(this.shadowRoot.getElementById("contextInfoBox") as HTMLDivElement)
				.style.visibility === "visible"
		) {
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
	 * ticker function to update sprite textures according to the components content
	 *
	 * @private
	 */
	private _updateSpriteTextures(): void {
		this.app.stage.children.forEach((sprite: PIXI.Sprite) => {
			let name: string = sprite.name
				.split(":")[0]
				.replace(
					sprite.name.split(":")[0][0],
					sprite.name.split(":")[0][0].toUpperCase()
				);
			let id: number = Number.parseInt(sprite.name.split(":")[1]);
			if (Object.keys(chemlib.ComponentType).includes(name)) {
				this.allChemComponents.forEach((comp) => {
					if (comp._type === name.toLowerCase() && comp._id === id) {
						let tex: undefined;
						if (comp._content._activeMolecules.length > 0) {
							if (comp._content._isSolution) {
								switch (comp._type) {
									case "beaker":
										tex = beaker_fl_svg;
										break;
									case "testtube":
										tex = testtube_fl_svg;
										break;
									case "flask":
										tex = flask_fl_svg;
										break;
									case "burette":
										tex = burette_fl_svg;
										break;
									default:
										break;
								}
								sprite.texture = PIXI.Texture.from(tex);
							} else {
								switch (comp._type) {
									case "beaker":
										tex = beaker_fs_svg;
										break;
									case "testtube":
										tex = testtube_fs_svg;
										break;
									case "flask":
										tex = flask_fs_svg;
										break;
									case "burette":
										tex = burette_fs_svg;
										break;
									default:
										break;
								}
								sprite.texture = PIXI.Texture.from(tex);
							}
						} else {
							switch (comp._type) {
								case "beaker":
									tex = beaker_svg;
									break;
								case "testtube":
									tex = testtube_svg;
									break;
								case "flask":
									tex = flask_svg;
									break;
								case "burette":
									tex = burette_svg;
									break;
								default:
									break;
							}
							sprite.texture = PIXI.Texture.from(tex);
						}
					}
				});
			}
		});
	}

	/**
	 * ticker function to update cables and their positions
	 *
	 * @private
	 */
	private _updateCablePos(): void {
		let index0: number;
		this.app.stage.children.forEach((sprite: PIXI.Sprite) => {
			index0 = this.app.stage.children.indexOf(sprite);
			if (sprite.name.includes("cable")) {
				let id: number = Number.parseInt(sprite.name.split(":")[1]);
				this.allEComponents.forEach((eComp) => {
					if (
						eComp._type === chemlib.EComponentType.Cable &&
						eComp._id === id
					) {
						let con1: chemlib.ElectricComponent | undefined =
							eComp._connections[0];
						let con2: chemlib.ElectricComponent | undefined =
							eComp._connections[1];

						if (
							typeof con1 != "undefined" &&
							typeof con2 != "undefined"
						) {
							let pos1, pos2: number[];
							let index1, index2: number;
							this.app.stage.children.forEach((conSprite) => {
								if (
									conSprite.name.includes(
										con1._type + ":" + con1._id
									)
								) {
									index1 =
										this.app.stage.children.indexOf(
											conSprite
										);
									pos1 = [conSprite.x, conSprite.y];
								}
								if (
									conSprite.name.includes(
										con2._type + ":" + con2._id
									)
								) {
									index2 =
										this.app.stage.children.indexOf(
											conSprite
										);
									pos2 = [conSprite.x, conSprite.y];
								}
							});
							let minIndex: number = Math.min(
								index0,
								index1,
								index2
							);
							if (minIndex != index0) {
								let buffer: any =
									this.app.stage.children[minIndex];
								this.app.stage.children[minIndex] = sprite;
								this.app.stage.children[index0] = buffer;
							}
							sprite.height = Math.sqrt(
								Math.pow(pos1[0] - pos2[0], 2) +
									Math.pow(pos1[1] - pos2[1], 2)
							);
							sprite.x = (pos1[0] + pos2[0]) / 2;
							sprite.y = (pos1[1] + pos2[1]) / 2;
							sprite.rotation =
								Math.atan(
									(pos1[1] - pos2[1]) / (pos1[0] - pos2[0])
								) + HALF_PI;
						} else {
							this._getObject(sprite);
							this._removeSprite();
						}
					}
				});
			}
		});
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
		let keyName =
			"transfer" +
			source._type +
			":" +
			source._id +
			this.app.stage.children.indexOf(currSprite);
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
						for (let i = 0; i < this.diagramList.length; i++) {
							if (
								(
									this.diagramList[i][1] as HTMLDivElement
								).children[0].id.includes(
									source._type + ":" + source._id
								)
							) {
								let chart: Chart = this.diagramList[i][0];
								chart.data.labels.push(
									(chart.data.labels.length > 0
										? Number.parseFloat(
												chart.data.labels[
													chart.data.labels.length - 1
												] as string
										  )
										: 0) +
										source._outVol * 1000
								);
								chart.data.datasets.forEach((dataset) => {
									dataset.data.push(
										chemlib.Simulation.getpH(
											destObj._content
										)
									);
								});
								chart.update();
							}
						}
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
		let keyName =
			"echem" +
			source._type +
			":" +
			source._id +
			this.app.stage.children.indexOf(currSprite);
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

				for (let i = 0; i < this.diagramList.length; i++) {
					if (
						(
							this.diagramList[i][1] as HTMLDivElement
						).children[0].id.includes(
							source._type + ":" + source._id
						)
					) {
						let chart: Chart = this.diagramList[i][0];
						chart.data.labels.push(
							(chart.data.labels.length > 0
								? Number.parseFloat(
										chart.data.labels[
											chart.data.labels.length - 1
										] as string
								  )
								: 0) + 1
						);
						chart.data.datasets.forEach((dataset) => {
							if (
								source._type ===
								chemlib.EComponentType.Voltmeter
							) {
								dataset.data.push(source._visibleVoltage);
							} else {
								let datasetId: number =
									chart.data.datasets.indexOf(dataset);
								circuitComps[
									datasetId
								]._connectedMix._activeMolecules.forEach(
									(mol) => {
										// console.log(
										// 	mol._atomCount,
										// 	mol._totalCharge,
										// 	mol._atoms[0].getName(),
										// 	circuitComps[
										// 		datasetId
										// 	]._material._atoms[0].getName(),
										// 	circuitComps[datasetId]
										// 		._connectedMix._molProperties
										// );
										if (
											mol._atomCount === 1 &&
											mol._totalCharge != 0 &&
											mol._atoms[0].getName() ===
												circuitComps[
													datasetId
												]._material._atoms[0].getName()
										) {
											dataset.data.push(
												circuitComps[datasetId]
													._connectedMix
													._molProperties[
													mol._id + "n"
												]
											);
										}
									}
								);
							}
						});
						chart.update();
					}
				}
			}
		}
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

		this._addSprite(component._type + ":" + component._id);
	}

	/**
	 * adds a new sprite to the canvas
	 *
	 * @private
	 * @param {string} info - a string containing the name of the object and its id
	 */
	private _addSprite(info: string): void {
		let spriteHeight: number = 0;
		let spriteWidth: number = 0;
		let spriteTexture: any = null;

		switch (info.split(":")[0]) {
			case "beaker":
				spriteHeight = 130;
				spriteWidth = 100;
				spriteTexture = beaker_svg;
				break;
			case "flask":
				spriteHeight = 156;
				spriteWidth = 120;
				spriteTexture = flask_svg;
				break;
			case "burette":
				spriteHeight = 400;
				spriteWidth = 80;
				spriteTexture = burette_svg;
				break;
			case "testtube":
				spriteHeight = 150;
				spriteWidth = 80;
				spriteTexture = testtube_svg;
				break;
			case "cable":
				spriteHeight = 50;
				spriteWidth = 3;
				spriteTexture = cable_svg;
				break;
			case "source":
				spriteHeight = 150;
				spriteWidth = 200;
				spriteTexture = source_off_svg;
				break;
			case "voltmeter":
				spriteHeight = 150;
				spriteWidth = 200;
				spriteTexture = voltmeter_off_svg;
				break;
			case "electrode":
				spriteHeight = 70;
				spriteWidth = 25;
				spriteTexture = default_svg;
				break;
			default:
				spriteHeight = 70;
				spriteWidth = 50;
				spriteTexture = default_svg;
				break;
		}
		let sprite = PIXI.Sprite.from(spriteTexture);

		sprite.anchor.set(0.5);

		sprite.x = this.mousePos[0];
		sprite.y = this.mousePos[1];
		sprite.width = spriteWidth;
		sprite.height = spriteHeight;
		sprite.eventMode = "static";
		sprite.cursor = "pointer";
		sprite.on("pointerdown", (event) => {
			this._getObject(sprite);
			// !(info === this.curr_name) ? this._getObject(sprite) : {};
			this._sendxAPiStatement("focused", sprite.name);

			if (this.hasTouch && event.pointerType === "touch") {
				if (!this.touchHighlight) {
					sprite.emit("mouseenter", event);
					this.touchHighlight = true;
					return;
				} else {
					this.touchHighlight = false;
				}
			}

			if (this.dragToggle || !this.hasTouch) {
				this._dragStart(sprite);
				if (this.hasTouch) {
					return;
				}
			}

			let contextBadge: SlBadge = this.shadowRoot.getElementById(
				"contextBadge"
			) as SlBadge;
			contextBadge.textContent = this.itemName(sprite.name.split(":")[0]);

			if (event.button === 2 || event.pointerType != "mouse") {
				let currSprite = this.app.stage.children[this.curr_stage_index];
				this.contextPopupAnchor.style.top =
					currSprite.y.toString() + "px";
				this.contextPopupAnchor.style.left =
					currSprite.x.toString() + "px";
				this.contextPopupAnchor.style.width =
					currSprite.width.toString() + "px";
				this.contextPopupAnchor.style.height =
					currSprite.height.toString() + "px";
				this.contextPopup.reposition();

				let contextInfoBox: HTMLDivElement =
					this.shadowRoot.getElementById(
						"contextInfoBox"
					) as HTMLDivElement;
				contextInfoBox.style.visibility = "visible";
				let contextActionsInfo: HTMLDivElement =
					this.shadowRoot.getElementById(
						"contextActionsInfo"
					) as HTMLDivElement;
				contextActionsInfo.style.display = "none";

				this._updatePopup();

				this.contextPopup.active = true;
				this.contextPopup.reposition();
				this._sendxAPiStatement("opened", "contextMenu-" + sprite.name);
			}
		});
		sprite.on("mouseenter", async (event) => {
			await this.waitUntil(() => {
				return true;
			}, 500);
			if (this.app.stage.children.indexOf(sprite) === -1) {
				return;
			}
			if (
				!this._mouseInbounds(this.app.stage.children.indexOf(sprite), 0)
			) {
				return;
			}

			let contextBadge: SlBadge = this.shadowRoot.getElementById(
				"contextBadge"
			) as SlBadge;
			let contextInfoBox: HTMLDivElement = this.shadowRoot.getElementById(
				"contextInfoBox"
			) as HTMLDivElement;
			let contextActionsInfo: HTMLDivElement =
				this.shadowRoot.getElementById(
					"contextActionsInfo"
				) as HTMLDivElement;

			if (
				this.contextPopup.active === true &&
				contextInfoBox.style.visibility === "visible"
			) {
				return;
			}

			this.contextPopupAnchor.style.top = sprite.y.toString() + "px";
			this.contextPopupAnchor.style.left = sprite.x.toString() + "px";
			this.contextPopupAnchor.style.width =
				sprite.width.toString() + "px";
			this.contextPopupAnchor.style.height =
				sprite.height.toString() + "px";
			this.contextPopup.reposition();

			contextBadge.textContent = this.itemName(info.split(":")[0]);

			contextInfoBox.style.visibility = "hidden";
			contextActionsInfo.style.display = "";
			if (!this.hasTouch) {
				contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m-32 16h16v72H64V80a48.05 48.05 0 0 1 48-48m32 192h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> ${this.message("Kontextmenü")}</p>
				<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl-divider>
				<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 64v24h-64V32h16a48.05 48.05 0 0 1 48 48m-48 144h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> ${this.message("Bewegen")}</p>
				`;
			} else {
				if (this.dragToggle) {
					contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M22 43c-4.726-1.767-8.667-7.815-10.64-11.357c-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.882 3.003C37.095 39.82 35.256 42.034 33 43c-3.5 1.5-6.63 1.634-11 0M10 8h22m-18 4l-4-4l4-4m14 0l4 4l-4 4"/></svg> ${this.message("Bewegen")}</p>`;
				} else {
					contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"><path stroke-linejoin="round" d="M15 26V15a3 3 0 1 1 6 0v11"/><path stroke-linejoin="round" d="M39 25v6.5C39 37.851 33.851 43 27.5 43h-1C20.149 43 15 37.851 15 31.5V25"/><path stroke-linejoin="round" d="M21 29v-5a3 3 0 1 1 6 0v5m0 0v-5a3 3 0 1 1 6 0v5m0 0v-5a3 3 0 1 1 6 0v5"/><path d="M28 15a9.97 9.97 0 0 0-1.959-5.945A9.99 9.99 0 0 0 18 5a9.99 9.99 0 0 0-8.042 4.055A9.97 9.97 0 0 0 8 15"/></g></svg> ${this.message("Kontextmenü")}</p>`;
				}
			}

			this.contextPopup.active = true;
			this._sendxAPiStatement("opened", "hover-" + sprite.name);
		});

		sprite.on("mouseleave", (event) => {
			let contextInfoBox: HTMLDivElement = this.shadowRoot.getElementById(
				"contextInfoBox"
			) as HTMLDivElement;

			if (
				this.contextPopup.active === true &&
				contextInfoBox.style.visibility === "visible"
			) {
				return;
			}

			contextInfoBox.style.visibility = "visible";
			this.contextPopup.active = false;
		});

		sprite.name = info;
		this.app.stage.addChild(sprite);
		if (!sprite.name.includes("cable")) {
			this._getObject(sprite);
		}
		this._sendxAPiStatement("inserted", sprite.name);
	}

	/**
	 * modifies sprite events when an object gets dragged
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the dragged sprite
	 */
	private _dragStart(sprite: PIXI.Sprite): void {
		this.dragObject = sprite;
		this.app.stage.on("pointermove", (event) => {
			this._dragMove(event);
			this.contextPopup.active = false;
		});
	}

	/**
	 * custom drag event for sprites, handles interaction behaviour
	 *
	 * @private
	 * @param {*} event - the drag event data
	 */
	private _dragMove(event): void {
		if (this.dragObject) {
			this.dragObject.parent.toLocal(
				event.global,
				null,
				this.dragObject.position
			);

			let mouseHoverObject: number = -1;
			for (let i = 0; i < this.app.stage.children.length; i++) {
				if (
					i != this.curr_stage_index &&
					this._mouseInbounds(
						i,
						50
					)
				) {
					let upperSprite = this.app.stage.children[this.curr_stage_index]
					let bottomSprite = this.app.stage.children[i];
					let cObj: any = undefined;
					let cOType: string = bottomSprite.name
						.split(":")[0]
						.toLowerCase();
					let cOId: number = Number.parseInt(
						bottomSprite.name.split(":")[1]
					);
					if (
						chemlib.ComponentType.Beaker ===
							(cOType as chemlib.ComponentType) ||
						chemlib.ComponentType.Flask ===
							(cOType as chemlib.ComponentType)
					) {
						this.allChemComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							this.curr_obj._type ===
								chemlib.EComponentType.Electrode &&
							cObj
							&& (upperSprite.y > bottomSprite.y - bottomSprite.height/2 && upperSprite.y < bottomSprite.y + upperSprite.height/2 && upperSprite.x > bottomSprite.x - bottomSprite.width/2 && upperSprite.x < bottomSprite.x + bottomSprite.width/2)
						) {
							this._emitAlert(
								this.message("{from} in {to} einfügen.", { from: this.itemName(this.curr_obj._type), to: this.itemName(cObj._type) }),
								"primary",
								false
							);
							mouseHoverObject = i;
						}
					}
					if (
						Object.values(chemlib.EComponentType).includes(
							cOType as chemlib.EComponentType
						)
					) {
						this.allEComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							Object.values(chemlib.EComponentType).includes(
								this.curr_obj._type
							)
						) {
							if (
								this.curr_obj._type !=
									chemlib.EComponentType.Cable &&
								cObj._type != chemlib.EComponentType.Cable
							) {
								this._emitAlert(
									this.message("{from} und {to} verbinden.", { from: this.itemName(this.curr_obj._type), to: this.itemName(cObj._type) }),
									"primary",
									false
								);
								mouseHoverObject = i;
							}
						}
					}
					if (
						Object.values(chemlib.ComponentType).includes(
							cOType as chemlib.ComponentType
						)
					) {
						this.allChemComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							(
							this.curr_obj._type ===
								chemlib.ComponentType.Beaker ||
							this.curr_obj._type ===
								chemlib.ComponentType.Flask ||
							this.curr_obj._type ===
								chemlib.ComponentType.Testtube
							)

							&& (upperSprite.y < bottomSprite.y - Math.min(50, bottomSprite.height))
						) {
							this.app.stage.children[
								this.curr_stage_index
							].rotation =
								this.app.stage.children[
									this.curr_stage_index
								].x > bottomSprite.x
									? -20
									: 20;
							this._emitAlert(
								this.message("Inhalt aus {from} zu {to} transferieren.", { from: this.itemName(this.curr_obj._type), to: this.itemName(cObj._type) }),
								"primary",
								false
							);
							mouseHoverObject = i;
						}
					}
				}
			}
			if (mouseHoverObject === -1) {
				this.app.stage.children[this.curr_stage_index].rotation = 0;
				this._hideAlert();
			}
		}
	}

	/**
	 * function to be called when a sprite is placed. Handles interactions
	 *
	 * @private
	 * @async
	 * @returns {Promise<void>}
	 */
	private async _dragEnd(): Promise<void> {
		if (typeof this.dragObject != "undefined") {
			if (this.app.stage._events["pointermove"]) {
				delete this.app.stage._events["pointermove"];
				this.app.stage._eventsCount -= 1;
				for (let i = 0; i < this.app.stage.children.length; i++) {
					if (
						i != this.curr_stage_index &&
						this._mouseInbounds(
							i,
						50
						)
					) {
						let upperSprite = this.app.stage.children[this.curr_stage_index]
						let bottomSprite = this.app.stage.children[i];
						let cObj: any = undefined;
						let cOType: string = bottomSprite.name
							.split(":")[0]
							.toLowerCase();
						let cOId: number = Number.parseInt(
							bottomSprite.name.split(":")[1]
						);
						let dialogPanel =
							this.confirmDialog.shadowRoot.querySelector(
								".dialog__panel"
							) as HTMLDivElement;
						if (
							chemlib.ComponentType.Beaker ===
								(cOType as chemlib.ComponentType) ||
							chemlib.ComponentType.Flask ===
								(cOType as chemlib.ComponentType)
						) {
							this.allChemComponents.forEach((comp) => {
								if (comp._id === cOId) {
									cObj = comp;
								}
							});
							if (
								this.curr_obj._type ===
									chemlib.EComponentType.Electrode &&
								cObj &&
								(upperSprite.y > bottomSprite.y - bottomSprite.height/2 && upperSprite.y < bottomSprite.y + upperSprite.height/2 && upperSprite.x > bottomSprite.x - bottomSprite.width/2 && upperSprite.x < bottomSprite.x + bottomSprite.width/2)
							) {
								dialogPanel.style.top =
									(
										this.canvasBoundingRect.y +
										this.mousePos[1]
									).toString() + "px";
								dialogPanel.style.left =
									(
										this.canvasBoundingRect.x +
										this.mousePos[0]
									).toString() + "px";
								this.confirmDialog.show();
								await this.waitUntil(
									() => this.confirmAction != 0
								);
								// console.log(this.confirmAction);
								if (this.confirmAction === 1) {
									this.curr_obj._connectedMix = cObj._content;
									this._emitAlert(
										this.message("{from} in {to} eingefügt.", { from: this.itemName(this.curr_obj._type), to: this.itemName(cObj._type) }),
										"success",
										false,
										1500
									);
									this._sendxAPiStatement(
										"added",
										this.curr_obj._type +
											":" +
											this.curr_obj._id,
										{
											response: cOType + ":" + cOId,
											success: true,
											completion: true,
										}
									);
									this._getObject(
										this.app.stage.children[
											this.curr_stage_index
										]
									);
								}
								this.confirmAction = 0;
							}
							cObj = undefined;
						}
						if (
							Object.values(chemlib.EComponentType).includes(
								cOType as chemlib.EComponentType
							)
						) {
							this.allEComponents.forEach((comp) => {
								if (comp._id === cOId) {
									cObj = comp;
								}
							});
							if (
								Object.values(chemlib.EComponentType).includes(
									this.curr_obj._type
								)
							) {
								if (
									this.curr_obj._type !=
										chemlib.EComponentType.Cable &&
									cObj._type != chemlib.EComponentType.Cable
								) {
									dialogPanel.style.top =
										(
											this.canvasBoundingRect.y +
											this.mousePos[1]
										).toString() + "px";
									dialogPanel.style.left =
										(
											this.canvasBoundingRect.x +
											this.mousePos[0]
										).toString() + "px";
									this.confirmDialog.show();
									await this.waitUntil(
										() => this.confirmAction != 0
									);
									// console.log(this.confirmAction);
									if (this.confirmAction === 1) {
										this._addEcon(cObj);
									}
									this.confirmAction = 0;
								}
								cObj = undefined;
							}
						}
						if (
							Object.values(chemlib.ComponentType).includes(
								cOType as chemlib.ComponentType
							)
						) {
							this.allChemComponents.forEach((comp) => {
								if (comp._id === cOId) {
									cObj = comp;
								}
							});
							if (
								(
								this.curr_obj._type ===
									chemlib.ComponentType.Beaker ||
								this.curr_obj._type ===
									chemlib.ComponentType.Flask ||
								this.curr_obj._type ===
									chemlib.ComponentType.Testtube
								)
								&& (upperSprite.y < bottomSprite.y - Math.min(50, bottomSprite.height))
							) {
								dialogPanel.style.top =
									(
										this.canvasBoundingRect.y +
										this.mousePos[1]
									).toString() + "px";
								dialogPanel.style.left =
									(
										this.canvasBoundingRect.x +
										this.mousePos[0]
									).toString() + "px";
								this.confirmDialog.show();
								await this.waitUntil(
									() => this.confirmAction != 0
								);
								this.app.stage.children[
									this.curr_stage_index
								].rotation = 0;
								if (this.confirmAction === 1) {
									this.curr_obj.transferContents({}, cObj);
									this._getObject(this.dragObject);
									this._emitAlert(
										this.message("Inhalt aus {from} zu {to} überführt.", { from: this.itemName(this.curr_obj._type), to: this.itemName(cObj._type) }),
										"success",
										false,
										1500
									);
									this._sendxAPiStatement(
										"appended",
										this.curr_obj.type +
											":" +
											this.curr_obj._id,
										{
											response: cOType + ":" + cOId,
											success: true,
											completion: true,
										}
									);
								}
								this.confirmAction = 0;
							}
							cObj = undefined;
						}
					}
				}
			}
		}
		if (this.app.stage.children.length > 1) {
			let wasAvail: boolean = false;
			let ObjectId: number;
			this.avComponentsSprites.forEach((arr) => {
				if (
					!wasAvail &&
					arr[0] === this.app.stage.children[this.curr_stage_index]
				) {
					wasAvail = true;
					ObjectId = arr[1];
				}
			});
			if (wasAvail && this.hasAttribute("contenteditable")) {
				let compIndex: number;
				this.availableComponents.forEach((comp) => {
					if (comp["id"] === ObjectId) {
						compIndex = this.availableComponents.indexOf(comp);
					}
				});
				if (
					this.availableComponents[compIndex]["pos"][0] !=
						this.app.stage.children[this.curr_stage_index].x ||
					this.availableComponents[compIndex]["pos"][1] !=
						this.app.stage.children[this.curr_stage_index].y
				) {
					this.availableComponents[compIndex]["pos"][0] =
						this.app.stage.children[this.curr_stage_index].x;
					this.availableComponents[compIndex]["pos"][1] =
						this.app.stage.children[this.curr_stage_index].y;

					let arrCopy: object[] = [];
					this.availableComponents.forEach((comp) => {
						arrCopy.push(comp);
					});
					this.availableComponents = [];
					this.availableComponents = arrCopy;
				}
			}
		}
	}

	/**
	 * updates the information shown in the object context menu
	 *
	 * @private
	 */
	private _updatePopup(): void {
		this.shadowRoot.getElementById("foldMenu").style.display = "";
		this.shadowRoot.getElementById("rem_obj").style.display = "";
		if (
			Object.values(chemlib.ComponentType).includes(
				this.curr_obj._type.toLowerCase() as chemlib.ComponentType
			)
		) {
			this.shadowRoot.getElementById("contextEchemInfo").style.display =
				"none";

			this.contextMolInfo.style.display = "";
			this.contextMixInfo.style.display = "";
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
                    <div>
                </div>
                `;
				this.contextMolInfo.innerHTML += `<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl-divider>`;
			});
			this.activateEComp.style.display = "none";
			if (
				this.curr_obj._type === chemlib.ComponentType.Burette ||
				this.curr_obj._type === chemlib.ComponentType.Separatingfunnel
			) {
				this.openBtn.style.display = "";
				this.requestUpdate();
			} else {
				this.openBtn.style.display = "none";
			}
			if (
				this.curr_obj._content._activeMolecules.length > 0 &&
				this.curr_obj._content._isSolution
			) {
				this.contextMixInfo.innerHTML += `
					<div style="display: flex; flex-direction: column">
						<p>vol: ${this.curr_obj._content._solutionVolume.toExponential(2)} l</p>
						<p>pH: ${chemlib.Simulation.getpH(this.curr_obj._content)}</p>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
					</div>
                `;
				this.contextMixInfo.style.borderLeftColor =
					this.pHColors[
						Math.round(
							chemlib.Simulation.getpH(this.curr_obj._content)
						)
					];
			}
		}
		if (
			Object.values(chemlib.EComponentType).includes(
				this.curr_obj._type.toLowerCase() as chemlib.EComponentType
			)
		) {
			this.shadowRoot.getElementById("contextMolInfo").style.display =
				"none";
			this.shadowRoot.getElementById("contextMixInfo").style.display =
				"none";
			this.openBtn.style.display = "none";
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
				}
			} else if (this.curr_obj._type === chemlib.EComponentType.Electrode){
				this.activateEComp.style.display = "none";
				this.contextEchemInfo.innerHTML = `
						<div style="display: flex; flex-direction: column; align-content: flex-start; align-items: flex-start">
							<sl-tag id="contextTag" variant="neutral" size="small" style="margin: 5px">${this.itemName(this.curr_obj._material.name)}</sl-tag>
							<p>${typeof this.curr_obj._connectedMix != "undefined" ? this.message("verbunden") : this.message("nicht verbunden")}</p>
						</div>
						<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl<divider>
						`;
			} else {
				this.activateEComp.style.display = "none";
			}
		}
		let wasAvail: boolean = false;
		this.avComponentsSprites.forEach((arr) => {
			if (arr[0] === this.app.stage.children[this.curr_stage_index]) {
				wasAvail = true;
			}
		});
		if (wasAvail && this.hasAttribute("contenteditable")) {
			this.shadowRoot.getElementById("foldMenu").style.display = "none";
			this.shadowRoot.getElementById("rem_obj").style.display = "none";
		}
	}

	/**
	 * retrieves object information for a given sprite, updates the panel
	 *
	 * @private
	 * @param {*} sprite - the seleted sprite
	 */
	private _getObject(sprite): void {
		let name = sprite.name;
		let chemlib_obj = null;

		let type: string = name.split(":")[0];
		let id: number = Number.parseInt(name.split(":")[1]);

		this.localizeControl(this.settings_drawer, "textContent", this.dictionary[type]);

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
									this._tintSprite(sprite, 0xbbf7d0);
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
								this._tintSprite(sprite, color);
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
									this._tintSprite(sprite, 0xbbf7d0);
								}
							});
						});
						tag.addEventListener("pointerleave", (event) => {
							tag.variant = "neutral";
							this.app.stage.children.forEach((sprite) => {
								this._tintSprite(sprite, 0xffffff);
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
										this._tintSprite(sprite, 0xffffff);
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

		this.settings_drawer.removeAttribute("disabled");
		(this.shadowRoot.getElementById("tab_select") as SlTabGroup).show(
			"settings"
		);

		this.curr_stage_index = this.app.stage.children.indexOf(sprite);
		this.curr_obj = chemlib_obj;
		this.curr_name = name;

		this.requestUpdate();
	}

	/**
	 * tints a sprite with a color
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the sprite to be tinted
	 * @param {number} color - the selected color
	 */
	private _tintSprite(sprite: PIXI.Sprite, color: number): void {
		sprite.tint = color;
	}

	/**
	 * asynchronous timer function to be used in other functions; returns, if the condition is met 
	 *
	 * @param {*} condition - a condition to check
	 * @param {number} [checkInterval=10] - the check interval
	 * @returns {*}
	 */
	private waitUntil = (condition, checkInterval = 10) => {
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
	private _removeSprite(): void {
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

		this.app.stage.removeChildAt(this.curr_stage_index);

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
		this.settings_drawer.setAttribute("disabled", "");
		if (this.settings_drawer.active) {
			this.shadowRoot.getElementById("comp_panel").style.display = "none";
			this.shadowRoot.getElementById("ecomp_panel").style.display =
				"none";
		}

		this._remTickerFunction(
			"transfer" + this.curr_name + this.curr_stage_index
		);

		this._sendxAPiStatement("removed", this.curr_name);

		this.curr_obj = null;
		this.curr_name = "";
		this.contextPopup.active = false;

		if (this.app.stage.children.length === 1) {
			this.curr_stage_index = -1;
			return;
		}
		this._updateCablePos();
		this._getObject(
			this.app.stage.children[this.app.stage.children.length - 1]
		);
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
	 * loads available molecule into the teacher context menu, also appends controls
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
			this.tabPopup.active = true;
			this.tab_select.show("settings");
			this.contextMenu.style.display = "none";
			this.shadowRoot.getElementById("comp_panel").style.display = "";
			this.shadowRoot.getElementById("ecomp_panel").style.display =
				"none";
			this.settings_drawer.removeAttribute("disabled");
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
	 *loads available mixtures into the teacher context menu, also appends controls
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
	 * loads available components into the teacher context menu, also appends controls
	 *
	 * @private
	 */
	private _listCompConfig(): void {
		// @ts-ignore
		let addCompButton: HTMLButtonElement = this.shadowRoot.createElement(
			"button"
		) as HTMLButtonElement;
		addCompButton.id = "enter";
		this.localizeControl(addCompButton, "textContent", "hinzufügen");
		addCompButton.onclick = (event) => {
			// @ts-ignore
			let compDetails: SlDetails = this.shadowRoot.createElement(
				"sl-details"
			) as SlDetails;
			compDetails.summary = "neues Objekt";
			// @ts-ignore
			let setCompButton: HTMLButtonElement = this.shadowRoot.createElement("button") as HTMLButtonElement;
			this.localizeControl(setCompButton, "textContent", "speichern");
			setCompButton.id = "foldMenu";
			setCompButton.onclick = (event) => {
				if (compType.value != "") {
					if (compType.value === "Electrode") {
						if (compMaterial.value === "") {
							this._emitAlert(
								this.message("Der Elektrode muss ein Material zugewiesen werden!"),
								"warning",
								true
							);
							return;
						}
					}
					let newCompEntry: object = {
						type: compType.value,
						content: contentString.split(":")[0],
						vol:
							Number.parseFloat(contentString.split(":")[1]) /
							1000,
						pos: [this.mousePos[0], this.mousePos[1]],
						voltage: compVoltage.value,
						current: compCurrent.value,
						material: compMaterial.value,
						connections: [],
					};
					compDetails.summary = newCompEntry["type"];

					this.availableComponents = [
						...this.availableComponents,
						newCompEntry,
					];
					this._loadComponents(newCompEntry);
					this.compConfig.innerHTML = "";
					this._listCompConfig();
				} else {
					this._emitAlert(
						this.message("es muss ein Objekttyp angegeben werden!"),
						"warning",
						true
					);
				}
			};
			// @ts-ignore
			let delCompButton: HTMLButtonElement = this.shadowRoot.createElement("button") as HTMLButtonElement;
			this.localizeControl(delCompButton, "textContent", "entfernen");
			delCompButton.className = "remObj";
			delCompButton.onclick = (event) => {
				compDetails.remove();
			};
			// @ts-ignore
			let compType: SlSelect = this.shadowRoot.createElement(
				"sl-select"
			) as SlInput;
			this.localizeControl(compType, "label", "Typ");
			compType.size = "small";
			compType.hoist = true;
			Object.values(chemlib.ComponentType).forEach((type) => {
				if(type != "condenser" && type != "separatingfunnel"){
					// @ts-ignore
					let typeOption: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					typeOption.value = type.replace(type[0], type[0].toUpperCase());
					typeOption.innerHTML = this.itemName(type)
					compType.appendChild(typeOption);
				}

			});
			Object.values(chemlib.EComponentType).forEach((type) => {
				if (type != "cable") {
					// @ts-ignore
					let typeOption: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					typeOption.value = type.replace(
						type[0],
						type[0].toUpperCase()
					);
					typeOption.innerHTML = type.replace(
						type[0],
						type[0].toUpperCase()
					);
					compType.appendChild(typeOption);
				}
			});
			compType.onclick = (event) => {
				switch (compType.value) {
					case "Electrode":
						compContent.style.display = "none";
						compMixVolume.style.display = "none";
						compVoltage.style.display = "none";
						compCurrent.style.display = "none";
						compMaterial.style.display = "";
						break;
					case "Source":
						compContent.style.display = "none";
						compMixVolume.style.display = "none";
						compVoltage.style.display = "";
						compCurrent.style.display = "";
						compMaterial.style.display = "none";
						break;
					case "Voltmeter":
						compMixVolume.style.display = "none";
						compContent.style.display = "none";
						compVoltage.style.display = "none";
						compCurrent.style.display = "none";
						compMaterial.style.display = "none";
						break;
					case "Condenser":
					case "Testtube":
					case "Separatingfunnel":
					case "Burette":
					case "Flask":
					case "Beaker":
						compContent.style.display = "";
						compMixVolume.style.display = "";
						compMixVolume.max =
							chemlib.ComponentManager._standardVolumes[
								(compType.value as String).toLowerCase()
							];
						compVoltage.style.display = "none";
						compCurrent.style.display = "none";
						compMaterial.style.display = "none";
						break;
					default:
						compContent.style.display = "none";
						compMixVolume.style.display = "none";
						compVoltage.style.display = "none";
						compCurrent.style.display = "none";
						compMaterial.style.display = "none";
						break;
				}
			};
			// @ts-ignore
			let compMixVolume: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compMixVolume.autocomplete = "off";
			this.localizeControl(compMixVolume, "label", "Inhalt: Volumen");
			compMixVolume.size = "small";
			compMixVolume.type = "number";
			this.localizeControl(compMixVolume, "placeholder", "Milliliter");
			compMixVolume.min = 0;
			compMixVolume.readonly = false;
			compMixVolume.oninput = (event) => {
				if (isNumber(compMixVolume.value)) {
					if (
						Number.parseInt(compMixVolume.value) >
						Number.parseInt(compMixVolume.max as string)
					) {
						compMixVolume.value = compMixVolume.max as string;
					}
					compContent.disabled = false;
				}
			};
			// @ts-ignore
			let compContent: SlSelect = this.shadowRoot.createElement(
				"sl-select"
			) as SlSelect;
			this.localizeControl(compContent, "label", "Inhalt: Auswahl");
			compContent.size = "small";
			compContent.hoist = true;
			compContent.multiple = true;
			compContent.disabled = true;
			let contentString: string = "";
			this.availableMixtures.forEach((mixEntry) => {
				//@ts-ignore
				let mixOption: SlOption = this.shadowRoot.createElement(
					"sl-option"
				) as SlOption;
				mixOption.value = mixEntry["name"];
				mixOption.innerHTML = mixEntry["name"];
				mixOption.onclick = (event) => {
					contentString =
						contentString === ""
							? mixOption.value +
							  ":" +
							  compMixVolume.value.toString()
							: (contentString +=
									"," +
									mixOption.value +
									":" +
									compMixVolume.value);
					compMixVolume.value = "";
					compMixVolume.focus();
					compContent.disabled = true;
				};
				compContent.appendChild(mixOption);
			});
			//@ts-ignore
			let compVoltage: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compVoltage.autocomplete = "off";
			this.localizeControl(compVoltage, "label", "Spannung");
			compVoltage.size = "small";
			compVoltage.readonly = false;
			// @ts-ignore
			let compCurrent: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compCurrent.autocomplete = "off";
			this.localizeControl(compCurrent, "label", "Stromstärke");
			compCurrent.size = "small";
			compCurrent.readonly = false;
			// @ts-ignore
			let compMaterial: SlSelect = this.shadowRoot.createElement(
				"sl-select"
			) as SlInput;
			this.localizeControl(compMaterial, "label", "Material");
			compMaterial.size = "small";
			this.localizeControl(compMaterial, "placeholder", "Element");
			compMaterial.hoist = true;
			this.availableMolecules.forEach((molEntry) => {
				if(molEntry["atoms"].length === 1){
					//@ts-ignore
					let molMatOption: SlOption = this.shadowRoot.createElement(
						"sl-option"
					) as SlOption;
					molMatOption.value = molEntry["formula"];
					molMatOption.innerHTML = molEntry["formula"];
					compMaterial.appendChild(molMatOption);
				}
			});

			compMixVolume.style.display = "none";
			compContent.style.display = "none";
			compVoltage.style.display = "none";
			compCurrent.style.display = "none";
			compMaterial.style.display = "none";

			compDetails.appendChild(setCompButton);
			compDetails.appendChild(delCompButton);
			compDetails.appendChild(compType);
			compDetails.appendChild(compMixVolume);
			compDetails.appendChild(compContent);
			compDetails.appendChild(compVoltage);
			compDetails.appendChild(compCurrent);
			compDetails.appendChild(compMaterial);

			this.compConfig.appendChild(compDetails);
			compDetails.show();
		};
		this.compConfig.appendChild(addCompButton);

		this.availableComponents.forEach((compEntry) => {
			// @ts-ignore
			let compDetails: SlDetails = this.shadowRoot.createElement(
				"sl-details"
			) as SlDetails;
			compDetails.summary = compEntry["type"];
			compDetails.id = compEntry["id"];
			// @ts-ignore
			let delCompButton: HTMLButtonElement = this.shadowRoot.createElement("button") as HTMLButtonElement;
			this.localizeControl(delCompButton, "textContent", "entfernen");
			delCompButton.className = "remObj";
			delCompButton.onclick = (event) => {
				let arrCopy: object[] = [];
				this.availableComponents.forEach((compEntry) => {
					if (compEntry["connections"].length > 0) {
						let remIndices: number[] = [];
						for (
							let i = 0;
							i < compEntry["connections"].length;
							i++
						) {
							if (
								compEntry["connections"][i] ===
								Number.parseInt(compDetails.id)
							) {
								remIndices.push(i);
							}
							if (
								compEntry["connections"][i] >
								Number.parseInt(compDetails.id)
							) {
								compEntry["connections"][i] -= 1;
							}
						}
						remIndices.forEach((index) => {
							compEntry["connections"].splice(index, 1);
						});
					}
					if (compEntry["id"] != Number.parseInt(compDetails.id)) {
						arrCopy.push(compEntry);
					}
				});
				this.availableComponents = arrCopy;
				let spriteIndex: number;
				this.avComponentsSprites.forEach((arr) => {
					if (arr[1] === Number.parseInt(compDetails.id)) {
						spriteIndex = this.avComponentsSprites.indexOf(arr);
						this._getObject(arr[0]);
					}
				});
				this._removeSprite();
				this.avComponentsSprites.splice(spriteIndex, 1);
				compDetails.remove();
			};
			// @ts-ignore
			let compContent: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compContent.autocomplete = "off";
			this.localizeControl(compContent, "label", "Inhalt");
			compContent.size = "small";
			compContent.readonly = true;
			if (typeof compEntry["content"] != "undefined") {
				compContent.value = (
					JSON.stringify(compEntry["content"]) +
					":" +
					JSON.stringify(compEntry["vol"])
				)
					.replace("[", "")
					.replace("]", "")
					.replace(/"/g, "");
			}
			// @ts-ignore
			let compVoltage: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compVoltage.autocomplete = "off";
			this.localizeControl(compVoltage, "label", "Spannung");
			compVoltage.size = "small";
			compVoltage.readonly = true;
			if (typeof compEntry["voltage"] != "undefined") {
				compVoltage.value = JSON.stringify(compEntry["voltage"])
					.replace("[", "")
					.replace("]", "")
					.replace(/"/g, "");
			}
			// @ts-ignore
			let compCurrent: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			this.localizeControl(compCurrent, "label", "Stromstärke");
			compCurrent.size = "small";
			compCurrent.readonly = true;
			if (typeof compEntry["current"] != "undefined") {
				compCurrent.value = JSON.stringify(compEntry["current"])
					.replace("[", "")
					.replace("]", "")
					.replace(/"/g, "");
			}
			// @ts-ignore
			let compMaterial: SlInput = this.shadowRoot.createElement(
				"sl-input"
			) as SlInput;
			compMaterial.autocomplete = "off";
			this.localizeControl(compMaterial, "label", "Material");
			compMaterial.size = "small";
			compMaterial.readonly = true;
			if (typeof compEntry["material"] != "undefined") {
				compMaterial.value = JSON.stringify(compEntry["material"])
					.replace("[", "")
					.replace("]", "")
					.replace(/"/g, "");
			}

			switch (compDetails.summary) {
				case "Electrode":
					compContent.style.display = "none";
					compVoltage.style.display = "none";
					compCurrent.style.display = "none";
					compMaterial.style.display = "";
					break;
				case "Source":
					compContent.style.display = "none";
					compVoltage.style.display = "";
					compCurrent.style.display = "";
					compMaterial.style.display = "none";
					break;
				case "Voltmeter":
					compContent.style.display = "none";
					compVoltage.style.display = "none";
					compCurrent.style.display = "none";
					compMaterial.style.display = "none";
					break;
				case "Condenser":
				case "Testtube":
				case "Separatingfunnel":
				case "Burette":
				case "Flask":
				case "Beaker":
					compContent.style.display = "";
					compVoltage.style.display = "none";
					compCurrent.style.display = "none";
					compMaterial.style.display = "none";
					break;
			}

			compDetails.appendChild(delCompButton);
			compDetails.appendChild(compContent);
			compDetails.appendChild(compVoltage);
			compDetails.appendChild(compCurrent);
			compDetails.appendChild(compMaterial);

			this.compConfig.appendChild(compDetails);
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
				atom.style.borderBottomWidth = "10px";
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
			atom.style.minWidth = "20px";
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
			// console.log("loop", component);
			if (typeof entry != "undefined") {
				if (component != entry) {
					continue;
				}
			}

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
			} else {
				newComp = chemlib.ComponentManager.newElectricComponent(
					component["type"].toLowerCase()
				);
				switch (component["type"]) {
					case "Electrode":
						newComp._material = this._loadMolecule(
							component["material"],
							false
						);
						chemlib.StructureManager.getChemData(newComp._material);
						await this.waitUntil(
							() =>
								(newComp as chemlib.ElectricComponent)._material
									.name != ""
						);
						this.electrodeMaterials.push([
							newComp._material.name,
							newComp._material,
						]);
						break;
					case "Source":
						newComp._sourceVoltage = Number.parseFloat(
							component["voltage"]
						);
						newComp._sourceCurrent = Number.parseFloat(
							component["current"]
						);
					default:
						break;
				}
				this.allEComponents.push(newComp);
			}

			this._addSprite(newComp._type + ":" + newComp._id);
			let sprite: PIXI.Sprite =
				this.app.stage.children[this.curr_stage_index];
			sprite.x = component["pos"][0];
			sprite.y = component["pos"][1];

			if (this.hasAttribute("contenteditable")) {
				this._tintSprite(sprite, 0xa7dbec);
			} else {
				this._tintSprite(sprite, 0xffffff);
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
			this.tabPopup.active = false;
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
	private _addEcon(
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
		this._addSprite(cable._type + ":" + cable._id);
		this.app.stage.children.forEach((sprite) => {
			if (
				sprite.name.includes(sComp._type.toLowerCase()) &&
				sprite.name.includes(sComp._id)
			) {
				this._getObject(sprite);
			}
		});
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
		this._sendxAPiStatement(
			"submitted",
			"ElectrodeMaterlial " +
				this.curr_obj._material._kekule_obj
					.calcFormula()
					.getDisplayText() +
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

		this.curr_obj._sourceVoltage = Number.parseFloat(voltageInput.value);
		this.curr_obj._sourceCurrent = Number.parseFloat(currentInput.value);

		this._sendxAPiStatement(
			"submitted",
			"voltage " + this.curr_obj._type + ":" + this.curr_obj._id
		);
	}

	/**
	 * checks, if the mouse is within the specified borders around a sprite
	 *
	 * @private
	 * @param {number} index - the index of the sprite
	 * @param {number} offset - an added offset between the sprite and the border
	 * @returns {boolean}
	 */
	private _mouseInbounds(index: number, offset: number): boolean {
		if (this.app.stage.children.length === 1) {
			return false;
		}
		let objWidth: number = this.app.stage.children[index].width;
		let objHeight: number = this.app.stage.children[index].height;
		let objX: number = this.app.stage.children[index].x - 0.5 * objWidth;
		let objY: number = this.app.stage.children[index].y - 0.5 * objHeight;

		return (
			this.mousePos[0] > objX - offset &&
			this.mousePos[0] < objWidth + objX + offset &&
			this.mousePos[1] > objY - offset &&
			this.mousePos[1] < objHeight + objY + offset
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
	private _emitAlert(
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
	private _hideAlert(): void {
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
	 * changes bewteen mouse and touch input
	 *
	 * @private
	 * @param {HTMLButtonElement} targetButton - the corresponding button that was pressed
	 */
	private _changeInputMode(targetButton: HTMLButtonElement): void {
		let toggleDrag: HTMLButtonElement = this.shadowRoot.getElementById(
			"toggleDrag"
		) as HTMLButtonElement;
		this.hasTouch = !this.hasTouch;
		if (this.hasTouch) {
			targetButton.innerHTML = `                    
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"><path d="M12.566 26.182Q10 27.941 10 32c0 4.06 4.975 11 9.462 11h11.48C35.332 43 38 39.15 38 36.06V23.01a3 3 0 0 0-3-3h-.01A2.99 2.99 0 0 0 32 23"/><path d="M13.981 28.445V8.005a3 3 0 0 1 3.006-2.997a3.014 3.014 0 0 1 3.006 3.015v15.569"/><path stroke-linejoin="round" d="M19.993 23.008v-3.992a3.016 3.016 0 0 1 6.03 0v3.992"/><path stroke-linejoin="round" d="M26 22.716v-2.713a3 3 0 0 1 6 0v3"/></g></svg>
            `;
			toggleDrag.style.visibility = "visible";
			this._sendxAPiStatement("selected", "touch input");
		} else {
			targetButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22q-2.9 0-4.95-2.05T5 15V9q0-2.9 2.05-4.95T12 2t4.95 2.05T19 9v6q0 2.9-2.05 4.95T12 22m1-13h4q0-1.8-1.137-3.175T13 4.1zM7 9h4V4.1q-1.725.35-2.863 1.725T7 9m5 11q2.075 0 3.538-1.463T17 15v-4H7v4q0 2.075 1.463 3.538T12 20m0-9"/></svg>
            `;
			toggleDrag.style.visibility = "hidden";
			this._sendxAPiStatement("selected", "mouse input");
		}
	}

	/**
	 * changes the touch input submode
	 *
	 * @private
	 * @param {HTMLButtonElement} targetButton - the corresponding button that was pressed
	 */
	private _toggleDrag(targetButton: HTMLButtonElement): void {
		let toggleDrag: HTMLButtonElement = this.shadowRoot.getElementById(
			"toggleDrag"
		) as HTMLButtonElement;
		this.dragToggle = !this.dragToggle;
		if (this.dragToggle) {
			targetButton.innerHTML = `                    
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><defs><mask id="ipTMove0"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"><path fill="#555" d="M22 43c-4.726-1.767-8.667-7.815-10.64-11.357c-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.882 3.003C37.095 39.82 35.256 42.034 33 43c-3.5 1.5-6.63 1.634-11 0"/><path d="M10 8h22m-18 4l-4-4l4-4m14 0l4 4l-4 4"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTMove0)"/></svg>
            `;
			this._sendxAPiStatement("selected", "touch drag mode");
		} else {
			targetButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M22 43c-4.726-1.767-8.667-7.815-10.64-11.357c-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.882 3.003C37.095 39.82 35.256 42.034 33 43c-3.5 1.5-6.63 1.634-11 0M10 8h22m-18 4l-4-4l4-4m14 0l4 4l-4 4"/></svg>
            `;
			this._sendxAPiStatement("selected", "touch select mode");
		}
	}

	/**
	 * initializes the canvas and its events
	 *
	 * @private
	 */
	private _canvas_init() {
		this.app = new PIXI.Application<HTMLCanvasElement>({
			background: "rgb(238, 243, 246)",
			backgroundAlpha: 0,
			resizeTo: this.containerDiv,
		});

		this.pix_canvas.appendChild(this.app.view);
		PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
		this.app.stage.eventMode = "static";
		this.app.stage.hitArea = this.app.screen;
		this.app.stage.sortableChildren = true;
		this.app.stage.on("mousemove", (event) => {
			this.mousePos = [event.screenX, event.screenY];
			if (!this._mouseInbounds(this.curr_stage_index, 0)) {
				this._dragEnd();
			}
		});
		this.app.stage.on("pointerdown", (event) => {
			if (this.contextMenu.style.display != "none") {
				this.contextMenu.style.display = "none";
				return;
			}
			if(event.pointerType === "mouse" && event.button === 2 || event.pointerType != "mouse" && event.pressure > 0.7){
				this.mousePos = [event.screenX, event.screenY];
				if (
					this.curr_stage_index > -1 &&
					this._mouseInbounds(this.curr_stage_index, 0)
				) {
					return;
				}
				this.contextMenu.style.display = "";
				this.contextMenu.style.top =
					Math.round(event.globalY).toString() + "px";
				this.contextMenu.style.left =
					Math.round(event.globalX).toString() + "px";
				this.contextPopup.active = false;

				this._sendxAPiStatement("opened", "objectMenu");
			}
			
		});
		this.app.stage.on("pointerup", () => {
			this._dragEnd();
		});
		this.app.stage.on("pointerupoutside", () => {
			this._dragEnd();
		});
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
		if (!this.enablexAPI || this.hasAttribute("contenteditable")) {
			return;
		}

		let date: Date = new Date();
		var session: string =
			date.getDay().toString() +
			date.getMonth().toString() +
			date.getFullYear().toString() +
			this.RndName;

		var verb = {
			id: "",
			display: {
				de: "",
				"en-US": "",
			},
		};
		switch (action) {
			case "pressed":
				verb.id = "http://future-learning.info/xAPI/verb/pressed";
				verb.display.de = "drückte";
				verb.display["en-US"] = "pressed";
				break;
			case "completed":
				verb.id = "http://activitystrea.ms/schema/1.0/complete";
				verb.display.de = "beendete";
				verb.display["en-US"] = "completed";
				break;
			case "selected":
				verb.id = "https://brindlewaye.com/xAPITerms/verbs/selected";
				verb.display.de = "wählte";
				verb.display["en-US"] = "selected";
				break;
			case "closed":
				verb.id = "http://activitystrea.ms/schema/1.0/close";
				verb.display.de = "schloss";
				verb.display["en-US"] = "closed";
				break;
			case "focused":
				verb.id = "http://id.tincanapi.com/verb/focused";
				verb.display.de = "wählte";
				verb.display["en-US"] = "focused";
				break;
			case "submitted":
				verb.id = "https://w3id.org/xapi/dod-isd/verbs/submitted";
				verb.display.de = "reichte ein";
				verb.display["en-US"] = "submitted";
				break;
			case "opened":
				verb.id = "http://activitystrea.ms/schema/1.0/open";
				verb.display.de = "oeffnete";
				verb.display["en-US"] = "opened";
				break;
			case "created":
				verb.id = "http://activitystrea.ms/schema/1.0/create";
				verb.display.de = "erstellte";
				verb.display["en-US"] = "created";
				break;
			case "registered":
				verb.id = "http://adlnet.gov/expapi/verbs/registered";
				verb.display.de = "registrierte";
				verb.display["en-US"] = "registered";
				break;
			case "started":
				verb.id = "http://activitystrea.ms/schema/1.0/start";
				verb.display.de = "startete";
				verb.display["en-US"] = "started";
				break;
			case "inserted":
				verb.id = "http://activitystrea.ms/schema/1.0/insert";
				verb.display.de = "fügte ein";
				verb.display["en-US"] = "inserted";
				break;
			case "removed":
				verb.id = "http://activitystrea.ms/schema/1.0/remove";
				verb.display.de = "entfernte";
				verb.display["en-US"] = "removed";
				break;
			case "added":
				verb.id = "http://activitystrea.ms/schema/1.0/add";
				verb.display.de = "fügte hinzu";
				verb.display["en-US"] = "added";
				break;
			case "appended":
				verb.id = "http://activitystrea.ms/schema/1.0/append";
				verb.display.de = "erweiterte";
				verb.display["en-US"] = "appended";
				break;
			case "joined":
				verb.id = "http://activitystrea.ms/schema/1.0/join";
				verb.display.de = "verband";
				verb.display["en-US"] = "joined";
				break;
			default:
				break;
		}
		const statement = {
			actor: {
				mbox: "mailto:dummy@webwriterchemlabdummymail.de",
				name: session,
			},
			verb: verb,
			object: {
				objectType: "Agent",
				name: context,
				mbox:
					"mailto:dummy" +
					context.replace(":", "") +
					"@webwriterchemlabdummymail.de",
			},
			result: extra,
		};
		await fetch("https://lrs.elearn.rwth-aachen.de/data/xAPI/statements", {
			mode: "cors",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Experience-API-Version": "1.0.3",
				Authorization: this.xAPIKey,
			},
			body: JSON.stringify(statement),
		})
			.then((response) => {
				/*console.log(response)*/
			})
			.catch((error) => console.error(error.message));
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
			<webwriter-helpoverlay>
				<webwriter-helppopup
					slot="popupContainer"
					target="contextInfoBox"
				>
					<div slot="content">
						<sl-badge>${this.message("Objekt-Kontextmenü")}</sl-badge>
						<p lang=${this.lang}>
							${this.message("Hier können das Objekt verwaltet und grundlegende Information angesehen werden.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup
					slot="popupContainer"
					target="buttonFullscreen"
				>
					<div slot="content">
						<sl-badge>${this.message("Vollbild an/aus")}</sl-badge>
						<p lang=${this.lang}>
							${this.message("Über diesen Button kann der Vollbildmodus an und aus geschaltet werden. Aktuell deaktiviert.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup slot="popupContainer" target="changeInput">
					<div slot="content">
						<sl-badge>${this.message("Eingabemodus")}</sl-badge>
						<p lang=${this.lang}>
							${this.message("Über diesen Button kann zwischen Maus- und Touch-Steuerung gewechselt werden.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup slot="popupContainer" target="toggleDrag">
					<div slot="content">
						<sl-badge>${this.message("Dragging an/aus")}</sl-badge>
						<p lang=${this.lang}>
							${this.message("Bei der Touch-Steuerung kann über diesen Button umgeschaltet werden, wie Objekte auf Berührungen reagieren.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup
					slot="popupContainer"
					target="toggleDiagramDrawer"
				>
					<div slot="content">
						<sl-badge>${this.message("Diagramm Menü")}</sl-badge>
						<p lang=${this.lang}>
							${this.message("Über diesen Button wird das Diagramm Menü an der linken Seite geöffnet.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup slot="popupContainer" target="contextMenu">
					<div slot="content">
						<sl-badge>${this.message("Kontextmenü")}</sl-badge>
						<p lang=${this.lang}>
							${this.hasAttribute("contenteditable") ? this.message("Uber dieses Menü können chemische Stoffe und Komponenten erstellt und vorgegeben werden.") : this.message("Über dieses Menü können neue Objekte ausgewählt und platziert werden.")}
						</p>
					</div>
				</webwriter-helppopup>
				<webwriter-helppopup
					slot="popupContainer"
					target="dialogOverview"
				>
					<div slot="content">
						<sl-badge>${this.message("Message Toast")}</sl-badge>
						<p lang=${this.lang}>${this.message("Hier werden Statusmeldungen angezeigt.")}</p>
					</div>
				</webwriter-helppopup>
			</webwriter-helpoverlay>
			<div id="upper">
				${this.pix_canvas}
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
							@sl-change=${(event) => {
								this.diagShowLine = !this.diagShowLine;
								this.diagramList.forEach((diag) => {
									diag[0].data.datasets.forEach((dataset) => {
										dataset.showLine = this.diagShowLine;
									});
									diag[0].update();
								});
							}}
							><p>${this.message("Kurven anzeigen")}</p></sl-checkbox
						>
					</div>
					<div
						id="canvasContainer"
						style="position: absolute; top: 50px; left: 0px; width: 100%; max-height: 550px; overflow: auto"
					></div>
				</sl-drawer>
				<div
					id="buttonRowTop"
					style="position: absolute; top: 0px; right: 0px; display: flex; flex-direction: column"
				>
					<button
						id="buttonFullscreen"
						aria-label=${this.message("Vollbild an/aus")}
						disabled
						@click="${() => {
							if (
								!(this.ownerDocument.fullscreenElement === this)
							) {
								this.requestFullscreen();
								this.tab_select.onpointerdown = () => {
									this.tab_select.onpointermove = (event) => {
										this.tabPopupAnchor.style.top =
											(
												Number.parseInt(
													this.tabPopupAnchor.style.top.split(
														"px"
													)[0]
												) + event.movementY
											).toString() + "px";
										this.tabPopupAnchor.style.left =
											(
												Number.parseInt(
													this.tabPopupAnchor.style.left.split(
														"px"
													)[0]
												) + event.movementX
											).toString() + "px";
										this.tabPopup.reposition();
									};
								};
								this.tab_select.onpointerup = () => {
									this.tab_select.onpointermove = null;
								};

								this._sendxAPiStatement(
									"selected",
									"fullscreen mode"
								);
							} else {
								this.containerDiv.style.width = "800px";
								this.containerDiv.style.height = "600px";
								this.app.resizeTo = this.containerDiv;
								this.app.resize();
								this.tab_select.onpointerdown = null;
								this.tab_select.onpointerup = null;
								this.tabPopupAnchor.style.top = 0 + "px";
								this.tabPopupAnchor.style.left = 0 + "px";
								this.tabPopup.reposition();
								this.ownerDocument.exitFullscreen();

								this._sendxAPiStatement(
									"selected",
									"window mode"
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
					<button
						id="changeInput"
						aria-label=${this.message("Eingabemodus")}
						@click="${(event) => {
							this._changeInputMode(
								event.target as HTMLButtonElement
							);
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
								d="M12 22q-2.9 0-4.95-2.05T5 15V9q0-2.9 2.05-4.95T12 2t4.95 2.05T19 9v6q0 2.9-2.05 4.95T12 22m1-13h4q0-1.8-1.137-3.175T13 4.1zM7 9h4V4.1q-1.725.35-2.863 1.725T7 9m5 11q2.075 0 3.538-1.463T17 15v-4H7v4q0 2.075 1.463 3.538T12 20m0-9"
							/>
						</svg>
					</button>
					<button
						id="toggleDrag"
						aria-label=${this.message("Dragging an/aus")}
						@click="${(event) => {
							this._toggleDrag(event.target as HTMLButtonElement);
						}}"
						style="visibility: hidden"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 48 48"
						>
							<defs>
								<mask id="ipTMove0">
									<g
										fill="none"
										stroke="#fff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="4"
									>
										<path
											fill="#555"
											d="M22 43c-4.726-1.767-8.667-7.815-10.64-11.357c-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.882 3.003C37.095 39.82 35.256 42.034 33 43c-3.5 1.5-6.63 1.634-11 0"
										/>
										<path
											d="M10 8h22m-18 4l-4-4l4-4m14 0l4 4l-4 4"
										/>
									</g>
								</mask>
							</defs>
							<path
								fill="currentColor"
								d="M0 0h48v48H0z"
								mask="url(#ipTMove0)"
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
				<div
					id="contextMenu"
					style="position: absolute; display:none; box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33); border-radius: 5px"
				>
					<sl-menu id="teacherContext">
						<sl-menu-label> ${this.message("Lehrkraft Steuerung")} </sl-menu-label>
						<sl-menu-item>
							${this.message("Allgemein")}
							<sl-menu
								class="optionsDetails"
								slot="submenu"
								style="width: 200px"
							>
								<p>${this.message("Ausblenden")}</p>
								<sl-select
									id="invCompSelect"
									size="small"
									placement="bottom"
									hoist
									clearable
									multiple
									@sl-change="${() => {
										this.invComponents = this.invCompSelect
											.value as string[];
									}}"
								>
								</sl-select>
							</sl-menu>
						</sl-menu-item>

						<sl-menu-item>
							${this.message("Moleküle")}
							<sl-menu
								id="molConfig"
								slot="submenu"
								style="width: 200px; font-size: 10pt"
							>
							</sl-menu>
						</sl-menu-item>
						<sl-menu-item>
							${this.message("Gemische")}
							<sl-menu
								id="mixConfig"
								slot="submenu"
								style="width: 200px; font-size: 10pt"
							>
							</sl-menu>
						</sl-menu-item>
						<sl-menu-item>
							${this.message("Komponenten")}
							<sl-menu
								id="compConfig"
								slot="submenu"
								style="width: 200px; font-size: 10pt"
							>
							</sl-menu>
						</sl-menu-item>
					</sl-menu>

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
				<!-- TODO: make placement dynamic -->
				<sl-popup
					id="contextPopup"
					placement="right-start"
					skidding="-50"
					distance="-20"
					strategy="fixed"
					flip
					flip-fallback-strategy="best-fit"
				>
					<span
						slot="anchor"
						id="contextPopupAnchor"
						style="position: absolute"
					></span>
					<div
						style="display:flex; flex-direction: column; align-items: start"
					>
						<sl-badge
							id="contextBadge"
							size="small"
							style="box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33); margin-left: 0px"
							>name
						</sl-badge>
						<div id="contextActionsInfo"></div>
					</div>
					<div
						id="contextInfoBox"
						style="background-color: #ffffff8d; backdrop-filter: blur(20px); border-radius: 5px; box-shadow: 0px 0px 12px 3px rgba(0,0,0,0.33);"
					>
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
								id="foldMenu"
								@click="${() => {
									this.tab_select.show("settings");
									this.tabPopup.active = true;
									this.contextPopup.active = false;
									this._sendxAPiStatement(
										"opened",
										"objectPanel"
									);
								}}"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="bi bi-arrow-up-short"
									viewBox="0 0 16 16"
								>
									<path
										fill-rule="evenodd"
										d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5"
									/>
								</svg>
								${this.message("Panel anzeigen")}
							</button>
							<button
								id="openComp"
								@click="${(event) => {
									let currSprite =
										this.app.stage.children[
											this.curr_stage_index
										];
									if (
										!this.tickerFunctionList.some(([id]) => id === "transfer" + this.curr_name + this.curr_stage_index)
									) {
										this.requestUpdate();
										let source = this.curr_obj;
										this._pushTickerFunction(
											"transfer" +
												this.curr_name +
												this.curr_stage_index,
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
										this._remTickerFunction(
											"transfer" +
												this.curr_name +
												this.curr_stage_index
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
								${this.message(this.tickerFunctionList.some(([id]) => id === "transfer" + this.curr_name + this.curr_stage_index) ? "Schließen" : "Öffnen")}
							</button>
							<button
								id="activateEComp"
								@click="${(event) => {
									let currSprite =
										this.app.stage.children[
											this.curr_stage_index
										];
									if (
										!this.tickerFunctionList.some(([id]) => id === "echem" + this.curr_name + this.curr_stage_index)
									) {
										this.requestUpdate();
										(currSprite as PIXI.Sprite).texture =
											this.curr_obj._type.toLowerCase() ===
											"source"
												? PIXI.Texture.from(
														source_on_svg
												  )
												: PIXI.Texture.from(
														voltmeter_on_svg
												  );
										let source = this.curr_obj;
										this._pushTickerFunction(
											"echem" +
												this.curr_name +
												this.curr_stage_index,
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
										(currSprite as PIXI.Sprite).texture =
											this.curr_obj._type.toLowerCase() ===
											"source"
												? PIXI.Texture.from(
														source_off_svg
												  )
												: PIXI.Texture.from(
														voltmeter_off_svg
												  );
										this._remTickerFunction(
											"echem" +
												this.curr_name +
												this.curr_stage_index
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
								${this.message(this.tickerFunctionList.some(([id]) => id === "echem" + this.curr_name + this.curr_stage_index) ? "Ausschalten" : "Einschalten")}
							</button>
						</div>
					</div>
				</sl-popup>

				<sl-popup
					showHelp="Panel"
					id="tabPopup"
					placement="bottom-start"
				>
					<span
						slot="anchor"
						id="tabPopupAnchor"
						style="position: absolute; top: 0px; left: 0px"
					></span>
					<div helpAnchor style="width: 800px; height: 523px">
						<sl-tab-group
							id="tab_select"
							style="display: block; box-shadow: 0px 6px 12px 0px rgba(0,0,0,0.33); border-radius: 5px"
						>
							<sl-tab
								id="settings_drawer"
								slot="nav"
								panel="settings"
								disabled
								>${this.message("Objekt")}</sl-tab
							>
							<sl-tab-panel id="details_settings" name="settings">
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
																	this.curr_obj._content =
																		chemlib.StructureManager.newMixture();
																	this._getObject(
																		this.app
																			.stage
																			.children[
																			this
																				.curr_stage_index
																		]
																	);
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
																				this
																					.app
																					.stage
																					.children[
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
												style="display: flex; justify-content: space-between; align-items: center; width: 327.6px"
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
													style="display: flex; justify-content: space-between; align-items: baseline; overflow: auto"
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
							</sl-tab-panel>
						</sl-tab-group>
						<button
							@click="${() => {
								this.tabPopup.active = false;
								this._sendxAPiStatement(
									"closed",
									"objectPanel"
								);
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
					</div>
				</sl-popup>
			</div>
		`;
	}
}
