import { Application, CanvasSource, Graphics, Point, Sprite, Text, Texture } from "pixi.js";
import {
	Container3D, CylinderGeometry, DirectionalLight, Geometry3D, Material3D, Mesh3D, Plane,
	Sphere, SphereGeometry, Vector3, View3D,
} from "@pixi/3d";
import type { ShaderBit } from "@pixi/3d";
import { atomColor, add, cross, electronRegions, perpendicular, scale, subtract, unit } from "./geometry";
import { crystalIonColors, crystalRadii, latticePositions, siteIon } from "./crystal-display";
import { atomRadius, spaceFillingRadius } from "./radii";
import { hasMolecularDisplays, moleculeOrbitals, ORBITAL_PHASE_COLORS, unpackOrbitalSurface, type MolecularDisplay } from "./orbitals";
import { aqueousComponents, hydrationWaters } from "./aqueous-preview";
import { cartesian, cellVectors, replicatedSites, type Point3, type Structure } from "./structure";

const vector = ([x, y, z]: Point3) => ({ x, y, z });
const cellCorners: Point3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
/** The camera's vertical field of view in degrees, the default of the 3D view. */
const CAMERA_FOV = 60;
/** Share of the short edge the structure fills, leaving room for the canvas controls. */
const FIT_FILL = 0.8;
/** Screen distance of the cell-axis cue from the upper right corner, in pixels. */
const AXIS_ORIGIN = 34;
/** Length of the cell-axis cue arrows, in pixels. */
const AXIS_LENGTH = 20;
const AXIS_COLORS = [0xb45309, 0x0f766e, 0x6d28d9];
/**
 * How far the silhouette of an atom darkens, as a share of its lit colour.
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

/** ChemLab blue for the unfinished bond while the user drags its endpoint. */
const BOND_PREVIEW_COLOR = 0x0086c5;
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
/** Strength of the ring on a selected atom, where it replaces the shaded edge. */
const SELECTION_MARK = 1;
/**
 * Strength of the ring under the pointer.
 *
 * The lattice site picker highlights the atom a row belongs to, and that cue
 * has to be distinguishable from a selection: the same ring at a little over
 * half the strength reads as a preview rather than as a second selection.
 */
const HOVER_MARK = 0.55;
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
 * The vignette and the selection glow are both soft radial fields, and one
 * gradient texture costs a single draw where a stack of concentric circles
 * would band. The texture is stretched to the canvas or to the atom, so its
 * pixel size only sets how smooth the ramp is.
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

/** What the scene shows besides the structure itself. */
export type SceneDisplay = { electrons: boolean; lattice: boolean; edges: boolean; axes: boolean; hydration: boolean; molecular: MolecularDisplay; orbitalId?: string };

export class MoleculeScene {
	static async create(host: HTMLElement, updateScale: (pixelsPerAngstrom: number) => void) {
		const app = new Application();
		try {
			await app.init({ preference: "webgl", backgroundAlpha: 0, antialias: true,
				resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
			if (typeof WebGL2RenderingContext === "undefined" || !("gl" in app.renderer)
				|| !(app.renderer.gl instanceof WebGL2RenderingContext)) {
				throw new Error("Molecular rendering requires WebGL 2");
			}
			return new MoleculeScene(app, host, updateScale);
		} catch (error) {
			if (app.renderer) app.destroy(true, { children: true });
			throw error;
		}
	}

	readonly #app: Application;
	readonly #view: View3D;
	readonly #content = new Container3D();
	readonly #edges = new Container3D();
	readonly #electrons = new Container3D();
	readonly #orbital = new Container3D({ eventMode: "none" });
	readonly #orbitalGeometries: Geometry3D[] = [];
	readonly #orbitalMaterials = ORBITAL_PHASE_COLORS.map(baseColor => new Material3D({
		baseColor, roughness: .68, alphaMode: "blend", alpha: .76,
	}));
	readonly #hydration = new Container3D({ eventMode: "none" });
	readonly #lattice = new Graphics({ eventMode: "none" });
	readonly #axes = new Graphics({ eventMode: "none" });
	readonly #axisLabels = ["a", "b", "c"].map(() => new Text({ text: "", style: { fontSize: 10, fill: 0x52525b } }));
	readonly #projected = new Point();
	readonly #axisTip = new Point();
	readonly #sphere = new SphereGeometry({ radius: 1, widthSegments: 20, heightSegments: 14 });
	readonly #spaceSphere = new SphereGeometry({ radius: 1, widthSegments: 40, heightSegments: 28 });
	readonly #cylinder = new CylinderGeometry({ height: 1, radiusTop: 1, radiusBottom: 1, radialSegments: 10 });
	readonly #materials = new Map<string, Material3D>();
	readonly #bondRegion = new Material3D({ baseColor: 0x0284c7, roughness: .85, alphaMode: "blend", alpha: .28 });
	readonly #loneRegion = new Material3D({ baseColor: 0xc084fc, roughness: .85, alphaMode: "blend", alpha: .39 });
	readonly #picks = new Map<Mesh3D, { id: number; color: number; ionic: boolean; opacity: number; position: Point3; radius: number }>();
	readonly #observer: ResizeObserver;
	readonly #preview: Mesh3D;
	readonly #vignette: Sprite;
	readonly #textures: Texture[] = [];
	#selected: Set<number> = new Set();
	#hovered?: number;
	#structure?: Structure;
	#showElectrons = false;
	#molecular: MolecularDisplay = "sticks";
	#orbitalId?: string;
	#orbitalBounds: Point3[] = [];
	#showHydration = false;
	#hydrationBounds: Point3[] = [];
	#showLattice = false;
	#showEdges = true;
	#showAxes = false;
	#latticePoints: ReturnType<typeof vector>[] = [];
	#repeats = 0;
	#frame = 0;
	#target: Point3 = [0, 0, 0];
	#distance = 6;
	#yaw = 0.34;
	#pitch = 0.24;
	#bounds: Point3[] = [];
	#atomRadius = 0;
	#lastPixelsPerAngstrom = 0;

	private constructor(app: Application, host: HTMLElement, private readonly updateScale: (pixelsPerAngstrom: number) => void) {
		this.#app = app;
		this.#view = new View3D({
			autoResize: false, environment: { skyColor: 0xffffff, groundColor: 0xa6b4c3, intensity: 0.94 },
		});
		this.#vignette = new Sprite({ texture: this.#track(radialTexture(vignetteStops())), eventMode: "none" });
		app.stage.addChild(this.#view, this.#vignette, this.#lattice, this.#axes, ...this.#axisLabels);
		this.#sizeVignette();
		for (const label of this.#axisLabels) label.visible = false;
		this.#view.setSize(app.screen.width, app.screen.height);
		const sun = new DirectionalLight({ color: 0xffffff, intensity: 2.15 });
		sun.position.set(3, 6, 7);
		sun.lookAt({ x: 0, y: 0, z: 0 });
		this.#view.root.addChild(sun, this.#content, this.#edges, this.#electrons, this.#orbital, this.#hydration);
		this.#preview = this.#rod();
		this.#preview.material = this.#material(BOND_PREVIEW_COLOR);
		this.#preview.visible = false;
		this.#view.root.addChild(this.#preview);
		app.canvas.style.display = "block";
		app.canvas.setAttribute("aria-hidden", "true");
		host.append(app.canvas);
		this.#observer = new ResizeObserver(() => {
			if (host.clientWidth && host.clientHeight) {
				app.renderer.resize(host.clientWidth, host.clientHeight);
				this.#view.setSize(host.clientWidth, host.clientHeight);
				this.#sizeVignette();
				this.#draw();
			}
		});
		this.#observer.observe(host);
		this.#camera();
	}

	/**
	 * Remember a generated texture so {@link destroy} can free it.
	 *
	 * A missing 2D context leaves {@link Texture.EMPTY}, which belongs to Pixi
	 * and must never be destroyed; only textures this scene created are kept.
	 */
	#track(texture: Texture) {
		if (texture !== Texture.EMPTY) this.#textures.push(texture);
		return texture;
	}

	/** Centre the vignette's circle on the canvas and size it past the corners. */
	#sizeVignette() {
		const { width, height } = this.#app.screen;
		const side = Math.hypot(width, height) / VIGNETTE_REACH;
		this.#vignette.width = this.#vignette.height = side;
		this.#vignette.position.set((width - side) / 2, (height - side) / 2);
	}

	/**
	 * A cached material for one colour, opacity and mark strength.
	 *
	 * Every atom and bond takes the rim, translucent ones included: the term
	 * darkens the surface itself rather than drawing a shell behind it, so a
	 * partly occupied site keeps a readable edge without gaining a solid ring.
	 * The electron clouds use their own materials and stay unrimmed, because
	 * they are a haze around the atoms rather than bodies of their own.
	 *
	 * The mark is part of the key because it is a uniform: a selected atom needs
	 * its own material, and swapping the uniform on a shared one would outline
	 * every atom of that colour.
	 */
	#material(color: number, opacity = 1, mark = 0) {
		const key = `${color}:${opacity}:${mark}`;
		let material = this.#materials.get(key);
		if (!material) {
			material = new Material3D({ baseColor: color, roughness: 0.61, alpha: opacity,
				alphaMode: opacity < 1 ? "blend" : "opaque",
				extraBits: [rimBit] });
			material.data.rimStrength = RIM_STRENGTH;
			material.data.rimPower = RIM_POWER;
			material.data.markWidth = MARK_WIDTH;
			material.data.markColor = MARK_COLOR;
			material.data.markStrength = mark;
			this.#materials.set(key, material);
		}
		return material;
	}

	#rod() {
		return new Mesh3D({ geometry: this.#cylinder, material: this.#material(0x858f9b), eventMode: "none" });
	}

	#line(mesh: Mesh3D, from: Point3, to: Point3, width: number) {
		const direction = subtract(to, from);
		mesh.position.copyFrom(vector(scale(add(from, to), 0.5)));
		mesh.scale.set(width, Math.hypot(...direction), width);
		mesh.quaternion.setFromUnitVectors({ x: 0, y: 1, z: 0 }, vector(unit(direction)));
	}

	#atom(id: number, atomicNumber: number, position: Point3, radius: number, occupancy = 1, ionColor?: number) {
		const color = ionColor ?? atomColor(atomicNumber);
		const opacity = Math.max(.18, Math.round(occupancy * 20) / 20);
		const geometry = this.#molecular === "space-filling" ? this.#spaceSphere : this.#sphere;
		const mesh = new Mesh3D({
			geometry, material: this.#material(color, opacity), eventMode: "static",
			hitVolume: new Sphere(new Vector3(), 1), position: vector(position),
		});
		mesh.scale.set(radius);
		this.#content.addChild(mesh);
		this.#bounds.push(position);
		this.#atomRadius = Math.max(this.#atomRadius, radius);
		this.#picks.set(mesh, { id, color, ionic: ionColor !== undefined, opacity, position, radius });
	}

	#renderElectrons(structure: Structure, show: boolean) {
		for (const child of this.#electrons.removeChildren()) child.destroy({ children: true });
		if (structure.kind !== "molecule" || !show) return;
		for (const region of electronRegions(structure)) {
			const direction = subtract(region.to, region.from);
			const span = Math.hypot(...direction);
			const axis = unit(direction);
			const center = scale(add(region.from, region.to), .5);
			const bond = region.kind === "bond";
			const width = bond ? .18 + .035 * (region.electrons / 2 - 1) : Math.max(.14, span * .47);
			const cloud = new Mesh3D({
				geometry: this.#sphere, material: bond ? this.#bondRegion : this.#loneRegion,
				position: vector(center), eventMode: "none",
			});
			cloud.scale.set(width, span / 2, width);
			cloud.quaternion.setFromUnitVectors({ x: 0, y: 1, z: 0 }, vector(axis));
			this.#electrons.addChild(cloud);
			const across = perpendicular(axis);
			const dotMaterial = this.#material(bond ? 0x075985 : 0x6b21a8);
			for (let index = 0; index < region.electrons; index++) {
				const row = Math.floor(index / 2) - (Math.ceil(region.electrons / 2) - 1) / 2;
				const side = region.electrons === 1 ? 0 : index % 2 === 0 ? -.058 : .058;
				const position = vector(add(add(center, scale(across, side)), scale(axis, row * Math.min(.14, span / 4))));
				const dot = new Mesh3D({ geometry: this.#sphere, material: dotMaterial, position, eventMode: "none" });
				dot.scale.set(.047);
				this.#electrons.addChild(dot);
			}
		}
	}

	#renderOrbital(structure: Structure, orbitalId: string | undefined) {
		for (const child of this.#orbital.removeChildren()) child.destroy();
		for (const geometry of this.#orbitalGeometries.splice(0)) geometry.destroy();
		this.#orbitalBounds = [];
		if (this.#molecular !== "orbitals" || !hasMolecularDisplays(structure)) return;
		const orbitals = moleculeOrbitals(structure);
		const orbital = orbitals.find(item => item.id === orbitalId) ?? orbitals[0];
		if (!orbital) return;
		if (orbital.kind === "reference") {
			for (const [phase, packed] of orbital.phases.entries()) {
				if (!packed) continue;
				const meshData = unpackOrbitalSurface(packed);
				const geometry = new Geometry3D(meshData);
				this.#orbitalGeometries.push(geometry);
				this.#orbital.addChild(new Mesh3D({ geometry, material: this.#orbitalMaterials[phase], eventMode: "none" }));
				const { positions } = meshData;
				for (let i = 0; i < positions.length; i += 3) this.#orbitalBounds.push([positions[i], positions[i + 1], positions[i + 2]]);
			}
			return;
		}
		for (const lobe of orbital.lobes) {
			const mesh = new Mesh3D({ geometry: this.#sphere, material: this.#orbitalMaterials[lobe.phase],
				position: vector(lobe.center), eventMode: "none" });
			mesh.scale.set(lobe.width, lobe.length, lobe.width);
			mesh.quaternion.setFromUnitVectors({ x: 0, y: 1, z: 0 }, vector(lobe.axis));
			this.#orbital.addChild(mesh);
			const across = perpendicular(lobe.axis);
			const normal = unit(cross(lobe.axis, across));
			this.#orbitalBounds.push(...[scale(lobe.axis, lobe.length), scale(across, lobe.width), scale(normal, lobe.width)]
				.flatMap(extent => [add(lobe.center, extent), subtract(lobe.center, extent)]));
		}
	}

	#renderHydration(structure: Structure, show: boolean) {
		for (const child of this.#hydration.removeChildren()) child.destroy();
		this.#hydrationBounds = [];
		if (!show || structure.kind !== "molecule") return;
		const atom = (position: Point3, number: number, radius: number) => {
			const mesh = new Mesh3D({ geometry: this.#sphere, material: this.#material(atomColor(number)), position: vector(position) });
			mesh.scale.set(radius);
			this.#hydration.addChild(mesh);
			this.#hydrationBounds.push(position);
		};
		const rod = (from: Point3, to: Point3, color: number, width: number) => {
			const mesh = new Mesh3D({ geometry: this.#cylinder, material: this.#material(color) });
			this.#line(mesh, from, to, width);
			this.#hydration.addChild(mesh);
		};
		for (const ion of aqueousComponents(structure)) {
			for (const { oxygen, hydrogens, contact } of hydrationWaters(ion, 3)) {
				atom(oxygen, 8, .22);
				for (const hydrogen of hydrogens) {
					atom(hydrogen, 1, .13);
					rod(oxygen, hydrogen, 0x64748b, .028);
				}
				const axis = subtract(contact.to, contact.from);
				const color = contact.kind === "hydrogen" ? 0x6940a2 : 0x167384;
				const dash = contact.kind === "hydrogen" ? .09 : .04;
				for (let offset = .22; offset < .82; offset += .15) {
					rod(add(contact.from, scale(axis, offset)), add(contact.from, scale(axis, offset + dash)), color, .026);
				}
			}
		}
	}

	setScene(structure: Structure, repeats: number, selection: number[], display: SceneDisplay) {
		const molecular = hasMolecularDisplays(structure) ? display.molecular : "sticks";
		const rebuild = structure !== this.#structure || repeats !== this.#repeats || molecular !== this.#molecular;
		this.#molecular = molecular;
		const crystal = structure.kind === "crystal";
		const latticeVisible = crystal && display.lattice;
		const edgesVisible = crystal && display.edges;
		const axesVisible = crystal && display.axes;
		if (rebuild || latticeVisible !== this.#showLattice || edgesVisible !== this.#showEdges || axesVisible !== this.#showAxes) {
			this.#showLattice = latticeVisible;
			this.#showEdges = edgesVisible;
			this.#showAxes = axesVisible;
			this.#latticePoints = latticeVisible ? latticePositions(structure, repeats).map(vector) : [];
			this.#lattice.visible = latticeVisible;
			this.#edges.visible = edgesVisible;
			this.#draw();
		}
		if (rebuild) {
			this.#structure = structure;
			this.#repeats = repeats;
			this.#bounds = [];
			this.#atomRadius = 0;
			this.#picks.clear();
			for (const child of this.#content.removeChildren()) child.destroy({ children: true });
			for (const child of this.#edges.removeChildren()) child.destroy({ children: true });
			if (structure.kind === "crystal") {
				const vectors = cellVectors(structure.cell);
				const corners = cellCorners.map(corner => cartesian(vectors, scale(corner, repeats)));
				this.#bounds.push(...corners);
				for (const axis of [0, 1, 2]) {
					for (let u = 0; u <= repeats; u++) {
						for (let v = 0; v <= repeats; v++) {
							const start: [number, number, number] = [0, 0, 0];
							start[(axis + 1) % 3] = u;
							start[(axis + 2) % 3] = v;
							const end = [...start] as [number, number, number];
							end[axis] = repeats;
							const edge = this.#rod();
							this.#line(edge, cartesian(vectors, start), cartesian(vectors, end), 0.024);
							this.#edges.addChild(edge);
						}
					}
				}
				const colors = crystalIonColors(structure);
				const radii = crystalRadii(structure);
				for (const { site, position } of replicatedSites(structure, repeats)) {
					const radius = radii.get(site.id);
					const physical = radius.model === "ionic" || radius.model === "metallic";
					this.#atom(site.id, site.atomicNumber, position, radius.pm * (physical ? .01 : .0065),
						site.occupancy, colors.get(siteIon(site)));
				}
			} else {
				const positions = new Map(structure.atoms.map(atom => [atom.id, atom.position]));
				for (const bond of molecular === "space-filling" ? [] : structure.bonds) {
					const from = positions.get(bond.from), to = positions.get(bond.to);
					const axis = unit(subtract(to, from));
					const rods = molecular === "orbitals" ? 1 : bond.order;
					for (let index = 0; index < rods; index++) {
						const offset = scale(perpendicular(axis), (index - (rods - 1) / 2) * 0.13);
						const rod = this.#rod();
						this.#line(rod, add(from, offset), add(to, offset), molecular === "orbitals" ? .025 : .046);
						this.#content.addChild(rod);
					}
				}
				const bonded = new Set(structure.bonds.flatMap(bond => [bond.from, bond.to]));
				for (const atom of structure.atoms) {
					const radius = molecular === "space-filling" ? spaceFillingRadius(atom.atomicNumber).pm / 100
						: molecular === "orbitals" ? Math.min(.18, atomRadius(atom.atomicNumber).pm * .004)
						: atom.charge && !bonded.has(atom.id) ? .32 : atomRadius(atom.atomicNumber).pm * .0052;
					this.#atom(atom.id, atom.atomicNumber, atom.position, radius);
				}
			}
		}
		const electrons = molecular === "sticks" && display.electrons;
		if (rebuild || electrons !== this.#showElectrons) {
			this.#showElectrons = electrons;
			this.#renderElectrons(structure, electrons);
			this.#draw();
		}
		const orbitalId = molecular === "orbitals" ? display.orbitalId : undefined;
		if (rebuild || orbitalId !== this.#orbitalId) {
			this.#orbitalId = orbitalId;
			this.#renderOrbital(structure, orbitalId);
			this.#draw();
		}
		if (rebuild || display.hydration !== this.#showHydration) {
			this.#showHydration = display.hydration;
			this.#renderHydration(structure, display.hydration);
			this.#draw();
		}
		const selected = new Set(selection);
		if (rebuild || selected.size !== this.#selected.size || selection.some(id => !this.#selected.has(id))) {
			this.#selected = selected;
			this.#applyMarks();
		}
	}

	/**
	 * Outline the selected atoms, and the one under the pointer.
	 *
	 * One system serves molecules and lattices alike, and it never recolours a
	 * body: the sphere keeps its CPK colour and only its silhouette takes the
	 * accent, so a marked atom still reads as the element it is. A ring is also
	 * the only cue that holds up in a packed lattice, where a glow behind the
	 * atom disappears against a light neighbour and a tint would be mistaken for
	 * a second species. A selection outranks the hover mark, so pointing at an
	 * already selected site does not dim it.
	 */
	#applyMarks() {
		for (const [mesh, atom] of this.#picks) {
			const mark = this.#selected.has(atom.id) ? SELECTION_MARK : atom.id === this.#hovered ? HOVER_MARK : 0;
			mesh.material = this.#material(atom.color, atom.opacity, mark);
		}
		this.#draw();
	}

	/**
	 * Outline one atom as a preview, or clear the outline with `undefined`.
	 *
	 * The lattice site picker uses this to show which atom a row belongs to
	 * before the row is clicked, so the pointer never has to guess between two
	 * sites of the same element.
	 */
	highlight(id?: number) {
		if (id === this.#hovered) return;
		this.#hovered = id;
		this.#applyMarks();
	}

	get canvas() { return this.#app.canvas; }

	#point(clientX: number, clientY: number) {
		const box = this.canvas.getBoundingClientRect();
		return { x: (clientX - box.left) * this.#app.screen.width / box.width, y: (clientY - box.top) * this.#app.screen.height / box.height };
	}

	pick(clientX: number, clientY: number): number | undefined {
		const target = this.#view.raycast(this.#point(clientX, clientY))?.target;
		return target instanceof Mesh3D ? this.#picks.get(target)?.id : undefined;
	}

	placement(clientX: number, clientY: number, origin = this.#target): Point3 {
		const camera = this.#view.camera.position;
		const normal = unit(subtract([camera.x, camera.y, camera.z], this.#target));
		const plane = new Plane().setFromNormalAndCoplanarPoint(vector(normal), vector(origin));
		const hit = this.#view.screenToWorld(this.#point(clientX, clientY), plane);
		return hit ? [hit.x, hit.y, hit.z] : origin;
	}

	preview(id?: number, clientX?: number, clientY?: number) {
		const start = [...this.#picks.values()].find(atom => atom.id === id)?.position;
		this.#preview.visible = !!start && clientX !== undefined;
		if (start && clientX !== undefined) this.#line(this.#preview, start, this.placement(clientX, clientY, start), .05);
		this.#draw();
	}

	orbit(dx: number, dy: number) {
		this.#yaw -= dx * 0.009;
		this.#pitch = Math.max(-1.5, Math.min(1.5, this.#pitch + dy * 0.009));
		this.#camera();
	}

	zoom(factor: number) {
		this.#distance = Math.max(.75, Math.min(40_000, this.#distance * factor));
		this.#camera();
	}

	fit() {
		const aspect = this.#app.screen.width / this.#app.screen.height;
		const short = Math.min(1, Math.max(.32, aspect));
		const bounds = [...this.#bounds, ...this.#hydrationBounds, ...this.#orbitalBounds];
		const min = [0, 1, 2].map(axis => Math.min(...bounds.map(point => point[axis])));
		const max = [0, 1, 2].map(axis => Math.max(...bounds.map(point => point[axis])));
		this.#target = bounds.length ? min.map((value, axis) => (value + max[axis]) / 2) as [number, number, number] : [0, 0, 0];
		const radius = bounds.length ? Math.max(...bounds.map(point => Math.hypot(...subtract(point, this.#target)))) : 1;
		// Fit the short edge, so a wide embed does not shrink the structure to a
		// sliver. The padding keeps the canvas controls clear of the atoms and
		// scales with the structure, so a single molecule does not end up as a
		// dot in the middle of the workspace.
		const outer = radius + this.#atomRadius;
		const padding = Math.max(.3, Math.min(.7, outer * .12));
		this.#distance = Math.max(1.6, (outer + padding) / (Math.tan(CAMERA_FOV / 2 * Math.PI / 180) * short * FIT_FILL));
		this.#camera();
	}

	#camera() {
		const offset: Point3 = [Math.cos(this.#pitch) * Math.sin(this.#yaw), Math.sin(this.#pitch), Math.cos(this.#pitch) * Math.cos(this.#yaw)];
		const camera = this.#view.camera;
		camera.near = .1;
		camera.far = Math.max(1000, this.#distance * 3);
		camera.position.copyFrom(vector(add(this.#target, scale(offset, this.#distance))));
		camera.lookAt(vector(this.#target));
		this.#draw();
	}

	#draw() {
		if (this.#frame) return;
		this.#frame = requestAnimationFrame(() => {
			this.#frame = 0;
			const camera = this.#view.camera;
			// Use the screen-facing plane through the orbit target as the scale reference.
			const pixelsPerAngstrom = this.#app.screen.height * camera.zoom
				/ (2 * this.#distance * Math.tan(camera.fov * Math.PI / 360));
			if (pixelsPerAngstrom !== this.#lastPixelsPerAngstrom) {
				this.#lastPixelsPerAngstrom = pixelsPerAngstrom;
				this.updateScale(pixelsPerAngstrom);
			}
			if (this.#showLattice) {
				this.#lattice.clear();
				for (const [index, point] of this.#latticePoints.entries()) {
					const position = this.#view.worldToScreen(point, this.#projected, index > 0);
					if (position) this.#lattice.circle(position.x, position.y, 3);
				}
				this.#lattice.fill(0x283648).stroke({ color: 0xffffff, width: 1.2 });
			}
			this.#drawAxes();
			this.#app.render();
		});
	}

	/**
	 * Draws the small orientation cue for the cell axes in the upper right corner.
	 * The arrows keep a fixed screen length, so the cue stays readable at any zoom.
	 */
	#drawAxes() {
		this.#axes.clear();
		for (const label of this.#axisLabels) label.visible = false;
		const structure = this.#structure;
		if (!this.#showAxes || structure?.kind !== "crystal") return;
		const base = this.#view.worldToScreen(vector(this.#target), this.#projected);
		if (!base) return;
		const originX = this.#app.screen.width - AXIS_ORIGIN;
		const originY = AXIS_ORIGIN;
		for (const [index, cell] of cellVectors(structure.cell).entries()) {
			const tip = this.#view.worldToScreen(vector(add(this.#target, cell)), this.#axisTip, true);
			if (!tip) continue;
			const dx = tip.x - base.x;
			const dy = tip.y - base.y;
			const length = Math.hypot(dx, dy);
			if (length < 1e-3) continue;
			const x = originX + dx / length * AXIS_LENGTH;
			const y = originY + dy / length * AXIS_LENGTH;
			this.#axes.moveTo(originX, originY).lineTo(x, y).stroke({ color: AXIS_COLORS[index], width: 1.6 });
			const label = this.#axisLabels[index];
			label.text = "abc"[index];
			label.position.set(x + dx / length * 5 - 3, y + dy / length * 5 - 6);
			label.visible = true;
		}
	}

	destroy() {
		cancelAnimationFrame(this.#frame);
		this.#observer.disconnect();
		this.#app.destroy(true, { children: true });
		this.#sphere.destroy();
		this.#spaceSphere.destroy();
		this.#cylinder.destroy();
		this.#bondRegion.destroy();
		this.#loneRegion.destroy();
		for (const geometry of this.#orbitalGeometries) geometry.destroy();
		for (const material of this.#orbitalMaterials) material.destroy();
		this.#axes.destroy();
		for (const label of this.#axisLabels) label.destroy();
		for (const material of this.#materials.values()) material.destroy();
		for (const texture of this.#textures) texture.destroy(true);
	}
}
