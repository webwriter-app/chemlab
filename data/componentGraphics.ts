import beaker from "../media/beaker.svg";
import flask from "../media/flask.svg";
import burette from "../media/burette.svg";
import testtube from "../media/testtube.svg";
import source from "../media/source_off.svg";
import sourceActive from "../media/source_on.svg";
import voltmeter from "../media/voltmeter_off.svg";
import voltmeterActive from "../media/voltmeter_on.svg";
import ammeter from "../media/ammeter.svg";
import electrode from "../media/default.svg";
import cable from "../media/cable.svg";
import { AMMETER_MODEL_VOLTAGE, VOLTMETER_MODEL_CURRENT } from "../chemlib/ElectricComponent";

interface ComponentGraphic {
	url: string;
	width: number;
	height: number;
	capacityMl?: number;
	active?: string;
}

export const componentGraphics = {
	beaker: { url: beaker, width: 100, height: 130, capacityMl: 400 },
	flask: { url: flask, width: 120, height: 156, capacityMl: 250 },
	burette: { url: burette, width: 80, height: 400, capacityMl: 25 },
	testtube: { url: testtube, width: 80, height: 150, capacityMl: 10 },
	electrode: { url: electrode, width: 25, height: 70 },
	source: { url: source, active: sourceActive, width: 200, height: 150 },
	voltmeter: { url: voltmeter, active: voltmeterActive, width: 200, height: 150 },
	ammeter: { url: ammeter, width: 200, height: 150 },
} satisfies Record<string, ComponentGraphic>;

export type PaletteComponent = keyof typeof componentGraphics;

export interface ComponentVariant {
	id: string;
	type: PaletteComponent;
	size: string;
	capacityMl?: number;
	material?: { element: string; name: string };
}

function capacities(type: PaletteComponent, values: number[]): ComponentVariant[] {
	return values.map((capacityMl) => ({ id: `${type}:${capacityMl}ml`, type, size: `${capacityMl} mL`, capacityMl }));
}

export const componentVariants = {
	beaker: capacities("beaker", [50, 100, 250, 400, 600, 1000]),
	flask: capacities("flask", [50, 125, 250, 500, 1000]),
	burette: capacities("burette", [10, 25, 50]),
	testtube: capacities("testtube", [5, 10, 15, 20]),
	electrode: [
		["carbon", "Graphit"], ["platinum", "Platin"], ["copper", "Kupfer"],
		["zinc", "Zink"], ["iron", "Eisen"], ["magnesium", "Magnesium"], ["nickel", "Nickel"],
	].map(([element, name]): ComponentVariant => ({
		id: `electrode:${element}`, type: "electrode", size: "", material: { element, name },
	})),
	source: [{ id: "source:standard", type: "source", size: "" }],
	voltmeter: [{ id: "voltmeter:standard", type: "voltmeter", size: `${VOLTMETER_MODEL_CURRENT} A` }],
	ammeter: [{ id: "ammeter:standard", type: "ammeter", size: `${AMMETER_MODEL_VOLTAGE} V` }],
} satisfies Record<PaletteComponent, ComponentVariant[]>;

const variantsById = new Map(Object.values(componentVariants).flat().map((variant) => [variant.id, variant]));

export function componentVariant(id?: string): ComponentVariant | undefined {
	return id === undefined ? undefined : variantsById.get(id);
}

export function componentScale(type: string, capacityMl?: number): number {
	const standardCapacity = componentGraphic(type).capacityMl;
	return standardCapacity && capacityMl > 0 ? Math.cbrt(capacityMl / standardCapacity) : 1;
}

export function componentGraphic(type: string): ComponentGraphic {
	if (type === "cable") return { url: cable, width: 3, height: 50 };
	return Object.hasOwnProperty.call(componentGraphics, type)
		? componentGraphics[type]
		: { url: electrode, width: 50, height: 70 };
}

export const componentTextureUrls = [
	cable,
	...Object.values<ComponentGraphic>(componentGraphics).flatMap(
		({ url, active }) => active ? [url, active] : [url]
	),
];
