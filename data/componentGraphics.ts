import beaker from "../media/beaker.svg";
import beakerLiquid from "../media/beaker_full_l.svg";
import beakerSolid from "../media/beaker_full_s.svg";
import flask from "../media/flask.svg";
import flaskLiquid from "../media/flask_full_l.svg";
import flaskSolid from "../media/flask_full_s.svg";
import burette from "../media/burette.svg";
import buretteLiquid from "../media/burette_full_l.svg";
import buretteSolid from "../media/burette_full_s.svg";
import testtube from "../media/testtube.svg";
import testtubeLiquid from "../media/testtube_full_l.svg";
import testtubeSolid from "../media/testtube_full_S.svg";
import source from "../media/source_off.svg";
import sourceActive from "../media/source_on.svg";
import voltmeter from "../media/voltmeter_off.svg";
import voltmeterActive from "../media/voltmeter_on.svg";
import electrode from "../media/default.svg";
import cable from "../media/cable.svg";

interface ComponentGraphic {
	url: string;
	width: number;
	height: number;
	capacityMl?: number;
	liquid?: string;
	solid?: string;
	active?: string;
}

export const componentGraphics = {
	beaker: { url: beaker, width: 100, height: 130, capacityMl: 400, liquid: beakerLiquid, solid: beakerSolid },
	flask: { url: flask, width: 120, height: 156, capacityMl: 250, liquid: flaskLiquid, solid: flaskSolid },
	burette: { url: burette, width: 80, height: 400, capacityMl: 25, liquid: buretteLiquid, solid: buretteSolid },
	testtube: { url: testtube, width: 80, height: 150, capacityMl: 10, liquid: testtubeLiquid, solid: testtubeSolid },
	electrode: { url: electrode, width: 25, height: 70 },
	source: { url: source, active: sourceActive, width: 200, height: 150 },
	voltmeter: { url: voltmeter, active: voltmeterActive, width: 200, height: 150 },
} satisfies Record<string, ComponentGraphic>;

export type PaletteComponent = keyof typeof componentGraphics;

export function componentGraphic(type: string): ComponentGraphic {
	if (type === "cable") return { url: cable, width: 3, height: 50 };
	return Object.hasOwnProperty.call(componentGraphics, type)
		? componentGraphics[type]
		: { url: electrode, width: 50, height: 70 };
}
