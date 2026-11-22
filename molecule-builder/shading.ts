import { CanvasSource, Sprite, Texture } from "pixi.js";
import { DirectionalLight, Material3D, View3D } from "@pixi/3d";
import type { Hemisphere, Material3DOptions, ShaderBit } from "@pixi/3d";

/**
 * The look both 3D views share: the hemisphere fill, the sun, the rim shading
 * and the vignette.
 *
 * The structure view and the atom view show different bodies, but they sit in
 * the same workspace, so a sphere has to be lit the same way in both. Keeping
 * the numbers here means a change to the light reaches the atom view too,
 * instead of the two drifting apart.
 */

/**
 * Sky and ground of the hemisphere fill.
 *
 * The fill is normal-aware, so it reaches a surface turned away from the camera
 * and keeps the shadow side readable; the sun on top of it gives that side a
 * direction. The ground colour is a cool slate rather than a neutral grey, so
 * the lower half of a body picks up the same tint as the workspace around it.
 */
export const VIEW_ENVIRONMENT: Hemisphere = { skyColor: 0xffffff, groundColor: 0xa6b4c3, intensity: 0.94 };

/**
 * Intensity of the sun.
 *
 * Direct light is divided by pi, so a sun near 2 lights a surface fully on its
 * own; the hemisphere then only fills the side the sun does not reach.
 */
const SUN_INTENSITY = 2.15;

/**
 * Adds the sun that gives every body a lit side and a shadow side.
 *
 * The light sits in world space, so orbiting the camera walks around the
 * shading instead of dragging it along. That is what makes a sphere read as a
 * body rather than as a flat disc, and it is why the atom view needs the same
 * light as the structure view.
 */
export function addSun(view: View3D) {
	const sun = new DirectionalLight({ color: 0xffffff, intensity: SUN_INTENSITY });
	sun.position.set(3, 6, 7);
	sun.lookAt({ x: 0, y: 0, z: 0 });
	view.root.addChild(sun);
	return sun;
}

/**
 * How far the silhouette of a body darkens, as a share of its lit colour.
 *
 * The CPK palette runs from white hydrogen to near-black iodine, so no canvas
 * colour can separate every atom from the background: the best any single
 * backdrop manages is 2.7:1, and only pure black reaches even that. The edge
 * therefore has to come from the atom itself. A sphere lit from the front
 * shades towards its rim only weakly, because the hemisphere fill is
 * normal-aware and still reaches a surface turned away from the camera, so the
 * rim is darkened here on top of the lighting.
 */
const RIM_STRENGTH = 0.8;
/**
 * How tightly the darkening hugs the silhouette.
 *
 * A low power spreads the darkening across the whole sphere and reads as a
 * dirty surface; a high power confines it to a narrow band that reads as the
 * edge of a round body. The value is a falloff exponent on the facing term, so
 * it is independent of the atom's size and of the camera distance.
 */
const RIM_POWER = 2.2;
/** The black silhouette leaves the central CPK colour visible. */
const MARK_COLOR = [0, 0, 0, 1];
/**
 * How wide the mark's band is, as the facing term where it fades out.
 *
 * The facing term is the cosine between the surface normal and the view
 * direction, so 0.62 covers the outer 22 % of the projected radius. The band
 * holds full strength over its inner 45 % and fades over the rest, which reads
 * as a drawn outline rather than as a tint: on a typical atom the solid part is
 * about two pixels and the falloff another five, so the ring stays crisp at any
 * zoom without eating into the element colour.
 */
const MARK_WIDTH = 0.62;

/**
 * Darkens a surface as its normal turns away from the camera, and draws the
 * mark of a selected or hovered atom into the same band.
 *
 * The darkening is the shading counterpart of an ink outline: the same
 * silhouette contrast, but following the surface instead of a shell pushed out
 * along the normal. It therefore scales with curvature rather than with world
 * units, so a hydrogen and a caesium get the same proportional rim, and it
 * leaves no ring behind a translucent surface. Runs after the light loop, where
 * `finalColor` is lit linear light, so the multiply darkens the shaded result.
 *
 * The mark reuses that band instead of adding geometry: where the surface turns
 * away from the camera the colour is mixed towards the accent, which draws a
 * ring exactly on the silhouette. A ring is the one cue that survives a crowded
 * lattice, because it does not depend on the atom's own colour — a glow behind
 * the atom washes out against a light neighbour, and a recoloured sphere would
 * read as a different element. The body keeps its CPK colour; only the edge
 * carries the accent, and `markStrength` at zero leaves the atom untouched.
 */
const rimBit: ShaderBit = {
	name: "atomRim",
	bindings: { material: { rimStrength: "f32", rimPower: "f32", markStrength: "f32", markWidth: "f32", markColor: "vec4<f32>" } },
	gpu: {
		fragment: {
			lobePostLighting: `{
				let rimFacing = max(dot(normal, viewDir), 0.0);
				finalColor *= 1.0 - material.rimStrength * pow(1.0 - rimFacing, material.rimPower);
				let markEdge = 1.0 - smoothstep(material.markWidth * 0.55, material.markWidth, rimFacing);
				finalColor = mix(finalColor, material.markColor.rgb, markEdge * material.markStrength);
			}`,
		},
	},
	gl: {
		fragment: {
			lobePostLighting: `{
				float rimFacing = max(dot(normal, viewDir), 0.0);
				finalColor *= 1.0 - material.rimStrength * pow(1.0 - rimFacing, material.rimPower);
				float markEdge = 1.0 - smoothstep(material.markWidth * 0.55, material.markWidth, rimFacing);
				finalColor = mix(finalColor, material.markColor.rgb, markEdge * material.markStrength);
			}`,
		},
	},
};

/**
 * A material with the shared rim shading.
 *
 * `mark` is the strength of the selection ring, which only the structure view
 * uses; the atom view leaves it at zero and keeps the edge darkening alone.
 * Every body takes the rim, translucent ones included: the term darkens the
 * surface itself rather than drawing a shell behind it, so a partly occupied
 * site keeps a readable edge without gaining a solid ring. A haze such as an
 * electron cloud is not a body and stays unrimmed.
 */
export function rimmedMaterial(options: Material3DOptions, mark = 0) {
	const material = new Material3D({ ...options, extraBits: [rimBit] });
	material.data.rimStrength = RIM_STRENGTH;
	material.data.rimPower = RIM_POWER;
	material.data.markWidth = MARK_WIDTH;
	material.data.markColor = MARK_COLOR;
	material.data.markStrength = mark;
	return material;
}

/**
 * How far the canvas corners darken, as an alpha at the corner.
 *
 * The backdrop is a flat near-white, so a structure in the middle competes with
 * the empty field around it. The vignette pulls the eye inwards without
 * touching the atoms, and it stays a screen-space effect: it never moves with
 * the camera and never hides a part of the structure that the fit put in view.
 */
const VIGNETTE_ALPHA = 0.3;
/** Radius of the vignette's clear centre, as a share of the gradient's radius. */
const VIGNETTE_CLEAR = 0.55;
/**
 * Where the canvas corner sits on the gradient, as a share of its radius.
 *
 * The gradient is drawn as a circle, not stretched to the canvas: an ellipse
 * would reach full strength at the middle of the long edges and grey out the
 * whole board. Sizing the circle past the corners keeps the edges light and
 * gathers the shadow where a vignette belongs.
 */
const VIGNETTE_REACH = 0.85;
/** Colour the vignette darkens towards, a slate that reads as shadow on white. */
const VIGNETTE_COLOR = "15, 23, 42";

/**
 * The vignette's gradient stops, eased so the darkening stays at the rim.
 *
 * A linear ramp from the centre would grey out most of the canvas, because the
 * texture is stretched over the whole board and its radius reaches the edge
 * everywhere. The clear centre therefore covers half the radius and the ramp
 * follows a smoothstep, which keeps the middle of the board white and gathers
 * the shadow in the corners where it belongs.
 */
function vignetteStops() {
	const stops: [number, string][] = [[0, `rgba(${VIGNETTE_COLOR}, 0)`], [VIGNETTE_CLEAR, `rgba(${VIGNETTE_COLOR}, 0)`]];
	for (let step = 1; step <= 6; step++) {
		const share = step / 6;
		const eased = share * share * (3 - 2 * share);
		stops.push([VIGNETTE_CLEAR + (1 - VIGNETTE_CLEAR) * share,
			`rgba(${VIGNETTE_COLOR}, ${(VIGNETTE_ALPHA * eased).toFixed(3)})`]);
	}
	return stops;
}

/**
 * A square texture painted with a radial gradient.
 *
 * One gradient texture costs a single draw where a stack of concentric circles
 * would band. The texture is stretched to the canvas, so its pixel size only
 * sets how smooth the ramp is.
 */
function radialTexture(stops: [number, string][], size = 256) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) return Texture.EMPTY;
	const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	for (const [offset, color] of stops) gradient.addColorStop(offset, color);
	context.fillStyle = gradient;
	context.fillRect(0, 0, size, size);
	return new Texture({ source: new CanvasSource({ resource: canvas }) });
}

/**
 * A screen-space vignette: a soft radial shadow that gathers in the corners.
 *
 * It is a 2D sprite on the stage rather than part of the 3D scene, so it stays
 * put while the camera orbits and never hides a body the fit put in view. Both
 * views draw the same one, which is what makes the atom view sit in the same
 * workspace as the structure view.
 */
export class Vignette {
	readonly sprite: Sprite;
	readonly #texture: Texture;

	constructor() {
		this.#texture = radialTexture(vignetteStops());
		this.sprite = new Sprite({ texture: this.#texture, eventMode: "none" });
	}

	/** Centre the circle on the canvas and size it past the corners. */
	size(width: number, height: number) {
		const side = Math.hypot(width, height) / VIGNETTE_REACH;
		this.sprite.width = this.sprite.height = side;
		this.sprite.position.set((width - side) / 2, (height - side) / 2);
	}

	destroy() {
		this.sprite.destroy();
		// A missing 2D context leaves Texture.EMPTY, which belongs to Pixi.
		if (this.#texture !== Texture.EMPTY) this.#texture.destroy(true);
	}
}
