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
	source: [206, 130],
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
	// vessel rim, like the graduated tube it models. The right half of the
	// artboard carries the collected volume.
	gascollector: [40, 120],
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
	// electrochemical series and a neighbouring step is a small one.
	electrode: [
		["carbon", "Graphit"], ["platinum", "Platin"], ["gold", "Gold"],
		["silver", "Silber"], ["copper", "Kupfer"], ["lead", "Blei"],
		["tin", "Zinn"], ["iron", "Eisen"], ["nickel", "Nickel"],
		["cobalt", "Cobalt"], ["chromium", "Chrom"], ["zinc", "Zink"],
		["aluminum", "Aluminium"], ["magnesium", "Magnesium"], ["antimony", "Antimon"],
	].map(([element, name]): ComponentVariant => ({
		id: `electrode:${element}`, type: "electrode", size: "", material: { element, name },
	})),
	source: [
		{ id: "source:standard", type: "source", size: "" },
		// The same instrument at a smaller artboard, for cells that need the
		// room for vessels and electrodes.
		{ id: "source:compact", type: "source", size: "kompakt", artboard: [120, 76] },
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

export function componentGraphic(type: string): ComponentGraphic {
	if (Object.hasOwnProperty.call(componentGraphics, type)) return componentGraphics[type];
	if (Object.hasOwnProperty.call(otherGraphics, type)) return otherGraphics[type];
	return { url: fallback };
}

export const componentTextureUrls = [
	fallback,
	...Object.values(componentGraphics).map(({ url }) => url),
	...Object.values(otherGraphics).map(({ url }) => url),
];
