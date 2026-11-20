import { Application } from "pixi.js";
import {
	Container3D, CylinderGeometry, DirectionalLight, Material3D, Mesh3D, Plane,
	Sphere, SphereGeometry, Vector3, View3D,
} from "@pixi/3d";
import { atomColor, atomRadius, add, electronRegions, perpendicular, scale, subtract, unit } from "./geometry";
import { cartesian, cellVectors, replicatedSites, type Point3, type Structure } from "./structure";

const vector = ([x, y, z]: Point3) => ({ x, y, z });
const cellCorners: Point3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];

export class MoleculeScene {
	static async create(host: HTMLElement) {
		const app = new Application();
		try {
			await app.init({ preference: "webgl", background: 0xfbfbfa, antialias: true,
				resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
			if (typeof WebGL2RenderingContext === "undefined" || !("gl" in app.renderer)
				|| !(app.renderer.gl instanceof WebGL2RenderingContext)) {
				throw new Error("Molecular rendering requires WebGL 2");
			}
			return new MoleculeScene(app, host);
		} catch (error) {
			if (app.renderer) app.destroy(true, { children: true });
			throw error;
		}
	}

	readonly #app: Application;
	readonly #view: View3D;
	readonly #content = new Container3D();
	readonly #electrons = new Container3D();
	readonly #sphere = new SphereGeometry({ radius: 1, widthSegments: 20, heightSegments: 14 });
	readonly #cylinder = new CylinderGeometry({ height: 1, radiusTop: 1, radiusBottom: 1, radialSegments: 10 });
	readonly #materials = new Map<string, Material3D>();
	readonly #bondRegion = new Material3D({ baseColor: 0x0284c7, roughness: .85, alphaMode: "blend", alpha: .28 });
	readonly #loneRegion = new Material3D({ baseColor: 0xc084fc, roughness: .85, alphaMode: "blend", alpha: .39 });
	readonly #picks = new Map<Container3D, { id: number; color: number; opacity: number; position: Point3 }>();
	readonly #observer: ResizeObserver;
	readonly #preview: Mesh3D;
	#selected: Set<number> = new Set();
	#structure?: Structure;
	#showElectrons = false;
	#repeats = 0;
	#frame = 0;
	#target: Point3 = [0, 0, 0];
	#distance = 6;
	#yaw = 0.34;
	#pitch = 0.24;
	#bounds: Point3[] = [];

	private constructor(app: Application, host: HTMLElement) {
		this.#app = app;
		this.#view = new View3D({
			autoResize: true, environment: { skyColor: 0xffffff, groundColor: 0xa6b4c3, intensity: 0.94 },
		});
		app.stage.addChild(this.#view);
		const sun = new DirectionalLight({ color: 0xffffff, intensity: 2.15 });
		sun.position.set(3, 6, 7);
		sun.lookAt({ x: 0, y: 0, z: 0 });
		this.#view.root.addChild(sun, this.#content, this.#electrons);
		this.#preview = this.#rod();
		this.#preview.material = this.#material(0x0086c5);
		this.#preview.visible = false;
		this.#view.root.addChild(this.#preview);
		app.canvas.style.display = "block";
		app.canvas.setAttribute("aria-hidden", "true");
		host.append(app.canvas);
		this.#observer = new ResizeObserver(() => {
			if (host.clientWidth && host.clientHeight) {
				app.renderer.resize(host.clientWidth, host.clientHeight);
				this.#draw();
			}
		});
		this.#observer.observe(host);
		this.#camera();
	}

	#material(color: number, opacity = 1) {
		const key = `${color}:${opacity}`;
		let material = this.#materials.get(key);
		if (!material) {
			material = new Material3D({ baseColor: color, roughness: 0.61, alpha: opacity,
				alphaMode: opacity < 1 ? "blend" : "opaque" });
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

	#atom(id: number, atomicNumber: number, position: Point3, crystal: boolean, sixCoordinateCharge?: number, occupancy = 1) {
		const color = atomColor(atomicNumber);
		const opacity = Math.max(.18, Math.round(occupancy * 20) / 20);
		const radius = atomRadius(atomicNumber, sixCoordinateCharge).pm * (crystal ? .0065 : .0052);
		const mesh = new Mesh3D({
			geometry: this.#sphere, material: this.#material(color, opacity), eventMode: "static",
			hitVolume: new Sphere(new Vector3(), 1), position: vector(position),
		});
		mesh.scale.set(radius);
		this.#content.addChild(mesh);
		this.#bounds.push(position);
		this.#picks.set(mesh, { id, color, opacity, position });
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

	setScene(structure: Structure, repeats: number, selection: number[], showElectrons = false) {
		const rebuild = structure !== this.#structure || repeats !== this.#repeats;
		if (rebuild) {
			this.#structure = structure;
			this.#repeats = repeats;
			this.#bounds = [];
			this.#picks.clear();
			for (const child of this.#content.removeChildren()) child.destroy({ children: true });
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
							this.#content.addChild(edge);
						}
					}
				}
				for (const { site, position } of replicatedSites(structure, repeats)) {
					const charge = structure.catalogKey && structure.spaceGroup === "Fm-3m" && site.charge ? site.charge : undefined;
					this.#atom(site.id, site.atomicNumber, position, true, charge, site.occupancy);
				}
			} else {
				const positions = new Map(structure.atoms.map(atom => [atom.id, atom.position]));
				for (const bond of structure.bonds) {
					const from = positions.get(bond.from), to = positions.get(bond.to);
					const axis = unit(subtract(to, from));
					for (let index = 0; index < bond.order; index++) {
						const offset = scale(perpendicular(axis), (index - (bond.order - 1) / 2) * 0.13);
						const rod = this.#rod();
						this.#line(rod, add(from, offset), add(to, offset), 0.046);
						this.#content.addChild(rod);
					}
				}
				for (const atom of structure.atoms) this.#atom(atom.id, atom.atomicNumber, atom.position, false);
			}
		}
		if (rebuild || showElectrons !== this.#showElectrons) {
			this.#showElectrons = showElectrons;
			this.#renderElectrons(structure, showElectrons);
			this.#draw();
		}
		const selected = new Set(selection);
		if (rebuild || selected.size !== this.#selected.size || selection.some(id => !this.#selected.has(id))) {
			this.#selected = selected;
			for (const [mesh, atom] of this.#picks) {
				(mesh as Mesh3D).material = selected.has(atom.id) ? this.#material(0x0086c5) : this.#material(atom.color, atom.opacity);
			}
			this.#draw();
		}
	}

	get canvas() { return this.#app.canvas; }

	#point(clientX: number, clientY: number) {
		const box = this.canvas.getBoundingClientRect();
		return { x: (clientX - box.left) * this.#app.screen.width / box.width, y: (clientY - box.top) * this.#app.screen.height / box.height };
	}

	pick(clientX: number, clientY: number): number | undefined {
		const hit = this.#view.raycast(this.#point(clientX, clientY));
		return hit ? this.#picks.get(hit.target)?.id : undefined;
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
		this.#distance = Math.max(0.75, Math.min(40_000, this.#distance * factor));
		this.#camera();
	}

	fit() {
		const min = [0, 1, 2].map(axis => Math.min(...this.#bounds.map(point => point[axis])));
		const max = [0, 1, 2].map(axis => Math.max(...this.#bounds.map(point => point[axis])));
		this.#target = this.#bounds.length ? min.map((value, axis) => (value + max[axis]) / 2) as [number, number, number] : [0, 0, 0];
		const radius = this.#bounds.length ? Math.max(...this.#bounds.map(point => Math.hypot(...subtract(point, this.#target)))) : 1;
		const aspect = this.#app.screen.width / this.#app.screen.height;
		this.#distance = Math.max(4, (radius + .7) * 2.7 / Math.min(1, Math.max(.32, aspect)));
		this.#camera();
	}

	#camera() {
		const offset: Point3 = [Math.cos(this.#pitch) * Math.sin(this.#yaw), Math.sin(this.#pitch), Math.cos(this.#pitch) * Math.cos(this.#yaw)];
		const camera = this.#view.camera;
		camera.far = Math.max(1000, this.#distance * 3);
		camera.position.copyFrom(vector(add(this.#target, scale(offset, this.#distance))));
		camera.lookAt(vector(this.#target));
		this.#draw();
	}

	#draw() {
		if (this.#frame) return;
		this.#frame = requestAnimationFrame(() => {
			this.#frame = 0;
			this.#app.render();
		});
	}

	destroy() {
		cancelAnimationFrame(this.#frame);
		this.#observer.disconnect();
		this.#app.destroy(true, { children: true });
		this.#sphere.destroy();
		this.#cylinder.destroy();
		this.#bondRegion.destroy();
		this.#loneRegion.destroy();
		for (const material of this.#materials.values()) material.destroy();
	}
}
