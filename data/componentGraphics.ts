import beaker from "../media/beaker.svg";
import flask from "../media/flask.svg";
import burette from "../media/burette.svg";
import testtube from "../media/testtube.svg";
import source from "../media/source_off.svg";
import voltmeter from "../media/voltmeter_off.svg";
import ammeter from "../media/ammeter.svg";
import multimeter from "../media/multimeter.svg";
import bridge from "../media/bridge.svg";
import gascollector from "../media/gascollector.svg";
import label from "../media/label.svg";
import electrode from "../media/electrode.svg";
import referenceShe from "../media/reference_she.svg";
import referenceCalomel from "../media/reference_calomel.svg";
import separatingfunnel from "../media/separatingfunnel.svg";
import condenser from "../media/condenser.svg";
import fallback from "../media/default.svg";
import cable from "../media/cable.svg";
import { AMMETER_MODEL_VOLTAGE, VOLTMETER_MODEL_CURRENT } from "../chemlib/ElectricComponent";

interface ComponentGraphic {
	url: string;
	// Fraction of the SVG artboard occupied by the measured part. For burettes
	// the width refers to the glass tube, excluding the stopcock handle.
	widthFraction?: number;
	heightFraction?: number;
	capacityMl?: number;
}

export const componentGraphics = {
	beaker: { url: beaker, capacityMl: 400, widthFraction: 0.955, heightFraction: 0.971 },
	flask: { url: flask, capacityMl: 250, widthFraction: 0.842, heightFraction: 0.978 },
	burette: { url: burette, capacityMl: 25, widthFraction: 0.254, heightFraction: 0.955 },
	testtube: { url: testtube, capacityMl: 10, widthFraction: 0.279, heightFraction: 0.901 },
	electrode: { url: electrode },
	source: { url: source },
	voltmeter: { url: voltmeter },
	ammeter: { url: ammeter },
	multimeter: { url: multimeter },
	bridge: { url: bridge },
	gascollector: { url: gascollector },
	label: { url: label },
} satisfies Record<string, ComponentGraphic>;

export type PaletteComponent = keyof typeof componentGraphics;
type DimensionsMm = readonly [width: number, height: number];

const vesselDimensions = {
	// Lenz DURAN low-form beakers, 7 0010 series.
	// https://lenz-laborglas.de/en/kcproduct/beakers-low-shape/?download_pdf=1446
	beaker: { 50: [42, 60], 100: [50, 70], 250: [70, 95], 400: [80, 110], 600: [90, 125], 1000: [105, 145] },
	// Corning PYREX 4980, body outside diameter × overall height.
	// https://www.corning.com/catalog/cls/documents/selection-guides/CLS-GL-001.pdf
	flask: { 50: [51, 78], 125: [67, 114], 250: [82, 132], 500: [101, 176], 1000: [129, 216] },
	// Eisco CH0240A / CH0240BAM / CH0240CAM, outside tube diameter × overall length.
	// https://www.eiscolabs.com/collections/ptfe-key-stopcock/products/ch0240a
	// https://www.eiscolabs.com/collections/ptfe-key-stopcock/products/ch0240b-am
	// https://www.eiscolabs.com/products/ch0240c-am
	burette: { 10: [11, 457.2], 25: [13, 572], 50: [14, 775] },
	// DURAN 261300602, Corning 99445-13, Eisco CH0718D01 and CH0718E.
	// https://www.dwk.com/duran-test-tube-beaded-rim-5-ml-10-x-100-mm-261300602
	// https://ecatalog.corning.com/life-sciences/b2b/JP/en/Glassware/Centrifuge-Tubes%2C-Glass/PYREX%C2%AE-Disposable-Rimless-Culture-Tubes%2C-Bulk-Pack/p/99445-13HW
	// https://www.eiscolabs.com/products/ch0718d01pk48
	// https://www.eiscolabs.com/products/ch0718epk48
	testtube: { 5: [10, 100], 10: [13, 100], 15: [15, 130], 20: [16, 150] },
} satisfies Record<string, Record<number, DimensionsMm>>;

// Stäubli FLEXI-E 1.0, outside diameter including insulation.
// https://media.ec.staubli.com/tm/datasheets/en/60.7008-%7B%7D_en.pdf
export const CABLE_DIAMETER_MM = 2.7;

const fixedDimensions: Readonly<Partial<Record<string, DimensionsMm>>> = {
	// PHYWE 07856-00 strip form, shared by the material variants.
	// https://www.phywe.com/equipment-accessories/chemicals-and-test-papers/metals/copper-strip-electrode-for-student-electrochemistry-experiments-length-75-mm-width-15-mm_31559_33813/
	electrode: [15, 75],
	// PHYWE 13506-93, front of housing (W × H).
	// https://repository.phywe.com/v1/get-file/?path=bedienungsanleitungen%2F13506.93%2F1350693e.pdf
	// The default artboard is the compact housing: the full-size one is four
	// times as wide as a 100 mL beaker and pushes the vessels off the canvas.
	source: [120, 76],
	// PeakTech P 205-05 and P 205-04, front of housing (W × H).
	// https://www.peaktech.de/media/7c/56/30/1617257827/Products_2021_EN.pdf
	voltmeter: [90, 106],
	ammeter: [90, 106],
	multimeter: [90, 106],
	// A salt bridge spans two vessels, so its artboard is wide and flat. The
	// two legs sit at 1/8 and 7/8 of the width, which is where the view looks
	// for the vessels it joins.
	bridge: [120, 60],
	// A gas collection tube stands over an electrode and reaches above the
	// vessel rim, like the graduated tube it models. The artboard is the tube
	// itself, so the sprite centre is the axis the tube hangs on.
	gascollector: [20, 120],
	label: [100, 22],
	cable: [CABLE_DIAMETER_MM, CABLE_DIAMETER_MM],
	// Legacy components outside the palette.
	// https://www.dwk.com/duran-separating-funnel-spherical-pear-shape-250-ml-242913608
	separatingfunnel: [90, 235],
	// https://www.eiscolabs.com/products/ch01012d
	condenser: [28.575, 450.85],
};

export interface ComponentVariant {
	id: string;
	type: PaletteComponent;
	size: string;
	capacityMl?: number;
	material?: { element: string; name: string };
	/** Artboard override in mm, for a variant that is the same device at another size. */
	artboard?: DimensionsMm;
	/** Graphic override, for a variant that is a different device of the same type. */
	url?: string;
	/** Short label drawn on the device itself, where the graphic has room for one. */
	short?: string;
	/**
	 * Fixed electrode potential in V against the standard hydrogen electrode.
	 * A reference electrode holds this potential instead of reacting, so it
	 * carries no material and needs no vessel.
	 */
	reference?: number;
}

function capacities(type: keyof typeof vesselDimensions): ComponentVariant[] {
	return Object.keys(vesselDimensions[type]).map(Number)
		.map((capacityMl) => ({ id: `${type}:${capacityMl}ml`, type, size: `${capacityMl} mL`, capacityMl }));
}

export const componentVariants = {
	beaker: capacities("beaker"),
	flask: capacities("flask"),
	burette: capacities("burette"),
	testtube: capacities("testtube"),
	// Ordered from noble to base, so the carousel follows the
	// electrochemical series and a neighbouring step is a small one. The two
	// reference electrodes close the list: they are electrodes that hold a
	// potential instead of taking part in the reaction.
	electrode: [
		...[
			["carbon", "Graphit"], ["platinum", "Platin"], ["gold", "Gold"],
			["silver", "Silber"], ["copper", "Kupfer"], ["lead", "Blei"],
			["tin", "Zinn"], ["iron", "Eisen"], ["nickel", "Nickel"],
			["cobalt", "Cobalt"], ["chromium", "Chrom"], ["zinc", "Zink"],
			["aluminum", "Aluminium"], ["magnesium", "Magnesium"], ["antimony", "Antimon"],
		].map(([element, name]): ComponentVariant => ({
			id: `electrode:${element}`, type: "electrode", size: "", material: { element, name },
		})),
		// Standard hydrogen electrode: platinised platinum under 1 bar H2 in
		// 1 mol/L H+, which defines the zero of the potential scale.
		{ id: "electrode:she", type: "electrode", size: "SHE", short: "SHE",
			url: referenceShe, reference: 0 },
		// Saturated calomel electrode: Hg2Cl2 over mercury in saturated KCl.
		{ id: "electrode:calomel", type: "electrode", size: "Kalomel", short: "KCl",
			url: referenceCalomel, reference: 0.241 },
	],
	source: [
		// The compact housing is the default, so a freshly placed source does
		// not dwarf the vessels it drives.
		{ id: "source:compact", type: "source", size: "" },
		// The same instrument at the full housing, for a bench that has room.
		{ id: "source:large", type: "source", size: "groß", artboard: [206, 130] },
	],
	voltmeter: [{ id: "voltmeter:standard", type: "voltmeter", size: `${VOLTMETER_MODEL_CURRENT} A` }],
	ammeter: [{ id: "ammeter:standard", type: "ammeter", size: `${AMMETER_MODEL_VOLTAGE} V` }],
	multimeter: [{ id: "multimeter:standard", type: "multimeter", size: "" }],
	bridge: [{ id: "bridge:standard", type: "bridge", size: "" }],
	gascollector: [{ id: "gascollector:standard", type: "gascollector", size: "" }],
	label: [{ id: "label:standard", type: "label", size: "" }],
} satisfies Record<PaletteComponent, ComponentVariant[]>;

const variantsById = new Map(Object.values(componentVariants).flat().map((variant) => [variant.id, variant]));

export function componentVariant(id?: string): ComponentVariant | undefined {
	return id === undefined ? undefined : variantsById.get(id);
}

export function componentArtboardMm(type: string, capacityMl?: number, variantId?: string): DimensionsMm {
	const override = componentVariant(variantId)?.artboard;
	if (override) return override;
	const { capacityMl: standard, widthFraction = 1, heightFraction = 1 } = componentGraphic(type);
	if (standard) {
		const sizes: Record<number, DimensionsMm> = vesselDimensions[type];
		const measured = sizes[capacityMl];
		const [width, height] = measured ?? sizes[standard];
		// Older authored documents can specify capacities outside the catalogue.
		const scale = !measured && Number.isFinite(capacityMl) && capacityMl > 0 ? Math.cbrt(capacityMl / standard) : 1;
		return [width * scale / widthFraction, height * scale / heightFraction];
	}
	const [width, height] = Object.hasOwnProperty.call(fixedDimensions, type) ? fixedDimensions[type] : fixedDimensions.electrode;
	return [width / widthFraction, height / heightFraction];
}

const otherGraphics: Record<string, ComponentGraphic> = {
	cable: { url: cable },
	separatingfunnel: { url: separatingfunnel },
	condenser: { url: condenser },
};

/**
 * The graphic of a component. A variant may bring its own artboard, which is
 * how the two reference electrodes share the electrode type with the metal
 * strips while looking like the instruments they are.
 *
 * @export
 * @param {string} type - the component type
 * @param {string} [variantId] - the variant, when the caller knows it
 * @returns {ComponentGraphic}
 */
export function componentGraphic(type: string, variantId?: string): ComponentGraphic {
	const override = componentVariant(variantId)?.url;
	if (override) return { url: override };
	if (Object.hasOwnProperty.call(componentGraphics, type)) return componentGraphics[type];
	if (Object.hasOwnProperty.call(otherGraphics, type)) return otherGraphics[type];
	return { url: fallback };
}

/**
 * A terminal of a device, in normalized artboard coordinates (0..1 from the
 * top left). Normalized coordinates survive a variant that stretches the same
 * texture onto another artboard, so `source:compact` keeps its posts.
 *
 * @export
 * @interface TerminalPoint
 */
export interface TerminalPoint {
	x: number;
	y: number;
	/**
	 * radius of the drawn binding post, as a fraction of the artboard height.
	 * The marker ring is drawn around it, so the plug of the graphic stays
	 * visible under the ring.
	 */
	r?: number;
}

// The posts are the coloured binding posts of the drawn front panels: the red
// one is the plus pole and comes first, so terminal 0 is always plus.
const terminalTable: Readonly<Record<string, readonly TerminalPoint[]>> = {
	// PHYWE 13506-93: red post at (174, 108), black post at (191, 108) of 206 x 130.
	source: [{ x: 174 / 206, y: 108 / 130, r: 8 / 130 }, { x: 191 / 206, y: 108 / 130, r: 8 / 130 }],
	// PeakTech P 205: red post at (30, 88), black post at (60, 88) of 90 x 106.
	voltmeter: [{ x: 30 / 90, y: 88 / 106, r: 8 / 106 }, { x: 60 / 90, y: 88 / 106, r: 8 / 106 }],
	ammeter: [{ x: 30 / 90, y: 88 / 106, r: 8 / 106 }, { x: 60 / 90, y: 88 / 106, r: 8 / 106 }],
	multimeter: [{ x: 30 / 90, y: 88 / 106, r: 8 / 106 }, { x: 60 / 90, y: 88 / 106, r: 8 / 106 }],
	// The strip of the electrode graphic starts at y = 0.4 of 75; the cable
	// clips onto the top of the strip, above the material label.
	electrode: [{ x: 0.5, y: 0.02 }],
};

/**
 * The terminals of a device type, in normalized artboard coordinates. A device
 * that carries no cable (a salt bridge, a gas collection tube, a label) has
 * none.
 *
 * @export
 * @param {string} type - the component type
 * @returns {readonly TerminalPoint[]}
 */
export function componentTerminals(type: string): readonly TerminalPoint[] {
	return terminalTable[type] ?? [];
}

export const componentTextureUrls = [
	fallback,
	...Object.values(componentGraphics).map(({ url }) => url),
	...Object.values(otherGraphics).map(({ url }) => url),
	// Variant graphics are not part of the type table, so they are listed here
	// to be loaded with the rest.
	...Object.values(componentVariants).flat().flatMap((variant) => ("url" in variant && variant.url ? [variant.url] : [])),
];
