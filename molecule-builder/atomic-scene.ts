import { Application } from "pixi.js";
import { BatchedMesh3D, Container3D, Geometry3D, Material3D, Matrix4, Mesh3D, RenderPassBit,
	SphereGeometry, TorusGeometry, View3D } from "@pixi/3d";
import { atomicShells, mutedShellColor, orbitalOccupation, shellColors, shellOrbit, visibleAtomicSubshells,
	type AtomicConfiguration, type Subshell } from "./atomic-configuration";
import { atomicOrbitalMesh, atomicOverlayParts, atomicPhaseColors, type AtomicOrbitalPart } from "./atomic-orbitals";
import { nucleonColors, orbitalNuclearRadius, referenceNucleus, schematicNucleons } from "./atomic-nucleus";
import type { AtomChoices } from "./atomic-model";

export type OrbitalHover = Pick<AtomicOrbitalPart, "orientation" | "subshell">;
type OrbitalSurface = { part: AtomicOrbitalPart; mesh: Mesh3D; phase: number };
type ShellDisplay = { n: number; ring: Mesh3D; group: Container3D; particles: Mesh3D[]; speed: number };
const neutralOpacityStep = .02;

export class AtomicScene {
	static async create(host: HTMLElement, onHover: (hit?: OrbitalHover) => void, onScale: (scale: number) => void) {
		const app = new Application();
		try {
			await app.init({ preference: "webgl", backgroundAlpha: 0, antialias: true,
				resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
			if (!("gl" in app.renderer) || !(app.renderer.gl instanceof WebGL2RenderingContext)) throw Error("WebGL 2 unavailable");
			return new AtomicScene(app, host, onHover, onScale);
		} catch (error) {
			if (app.renderer) app.destroy(true, { children: true });
			throw error;
		}
	}

	readonly #view = new View3D({
		autoResize: false, environment: { skyColor: 0xffffff, groundColor: 0xa6a6a6, intensity: 1.25 },
	});
	readonly #content = new Container3D();
	readonly #sphere = new SphereGeometry({ radius: 1, widthSegments: 18, heightSegments: 12 });
	readonly #ring = new TorusGeometry({ radius: 1, tube: .012, radialSegments: 6, tubularSegments: 70 });
	readonly #nucleons = {
		proton: new Material3D({ baseColor: nucleonColors.proton, roughness: .58 }),
		neutron: new Material3D({ baseColor: nucleonColors.neutron, roughness: .58 }),
	};
	readonly #shells = shellColors.map(baseColor => new Material3D({ baseColor, roughness: .7 }));
	readonly #rings = shellColors.map(baseColor => new Material3D({ baseColor, roughness: .7, alphaMode: "blend", alpha: .9 }));
	readonly #mutedShell = new Material3D({ baseColor: mutedShellColor, roughness: .7 });
	readonly #mutedRing = new Material3D({ baseColor: mutedShellColor, roughness: .7, alphaMode: "blend", alpha: .42 });
	readonly #phases = [.28, .64, .88].map(alpha => atomicPhaseColors.map(baseColor =>
		new Material3D({ baseColor, roughness: .7, alphaMode: "blend", alpha })));
	readonly #neutralOrbitals = Array.from({ length: 18 }, (_, index) =>
		new Material3D({ baseColor: 0x848484, roughness: .7, alphaMode: "blend", alpha: .008 + index * neutralOpacityStep }));
	readonly #observer: ResizeObserver;
	#surfaces: OrbitalSurface[] = [];
	#background: Mesh3D[] = [];
	#spins: ShellDisplay[] = [];
	#nucleus?: BatchedMesh3D;
	#ownedGeometry: Geometry3D[] = [];
	#orbitalParts: AtomicOrbitalPart[] = [];
	#builtParts = new Set<AtomicOrbitalPart>();
	#shownSubshells = new Set<Subshell>();
	#pending: AtomicOrbitalPart[] = [];
	#hover?: OrbitalHover;
	#pointer?: { x: number; y: number };
	#frame = 0;
	#timestamp = 0;
	#spin = 0;
	#running = false;
	#visible = true;
	#physical = false;
	#extent = 1;
	#distance = 4;
	#yaw = 0;
	#pitch = 0;
	#atom = 0;
	#configuration?: AtomicConfiguration;
	#choices?: AtomChoices;
	#scale = 0;

	private constructor(private app: Application, host: HTMLElement,
		private onHover: (hit?: OrbitalHover) => void, private onScale: (scale: number) => void) {
		app.stage.addChild(this.#view);
		this.#view.root.addChild(this.#content);
		this.canvas.style.display = "block";
		this.canvas.setAttribute("aria-hidden", "true");
		host.append(this.canvas);
		this.#observer = new ResizeObserver(() => {
			if (!host.clientWidth || !host.clientHeight) return;
			app.renderer.resize(host.clientWidth, host.clientHeight);
			this.#view.setSize(host.clientWidth, host.clientHeight);
			this.fit();
		});
		this.#observer.observe(host);
	}

	get canvas() { return this.app.canvas; }

	setVisible(visible: boolean) {
		if (this.#visible === visible) return;
		this.#visible = visible;
		this.#timestamp = 0;
		if (visible) this.#draw();
	}

	setModel(atomicNumber: number, configuration: AtomicConfiguration, choices: AtomChoices, animate: boolean) {
		const previous = this.#choices;
		const newModel = previous?.model !== choices.model || this.#atom !== atomicNumber || this.#configuration !== configuration;
		this.#atom = atomicNumber;
		this.#configuration = configuration;
		this.#choices = choices;
		this.#running = animate && choices.model === "bohr";
		if (newModel) {
			this.#yaw = choices.model === "bohr" ? .35 : .74;
			this.#pitch = choices.model === "bohr" ? .25 : .38;
			this.#clear();
			this.#extent = 1;
			this.#physical = choices.model === "orbitals" && configuration.electrons === 1;
			const nucleus = referenceNucleus(atomicNumber);
			if (choices.model === "bohr") {
				if (nucleus) this.#buildNucleus(nucleus, atomicShells(configuration).length);
				this.#buildShells(configuration);
			} else {
				if (nucleus) {
					const center = new Mesh3D({ geometry: this.#sphere, material: this.#nucleons.neutron,
						eventMode: "none", parent: this.#content });
					center.scale.set(orbitalNuclearRadius(nucleus, configuration.electrons));
				}
				this.#orbitalParts = atomicOverlayParts(configuration.subshells)
					.filter(part => part.region === part.subshell.n - part.subshell.l - 1)
					.sort((a, b) => b.scale - a.scale);
				if (this.#physical && this.#orbitalParts.length) {
					const [part] = this.#orbitalParts;
					const { phases, extent } = atomicOrbitalMesh({ atomId: 1, atomicNumber, electrons: 1, ...part });
					this.#extent = extent;
					this.#append(part, phases, extent);
				}
			}
			this.fit();
		}
		if (choices.model === "bohr") {
			if (newModel || previous?.shell !== choices.shell) {
				const selected = choices.shell ?? this.#spins[this.#spins.length - 1]?.n;
				for (const { n, ring, particles } of this.#spins) {
					ring.material = n === selected ? this.#rings[n - 1] : this.#mutedRing;
					const material = n === selected ? this.#shells[n - 1] : this.#mutedShell;
					for (const electron of particles) electron.material = material;
				}
			}
		} else if (newModel || previous?.subshell !== choices.subshell || previous?.showCore !== choices.showCore) {
			this.#shownSubshells = new Set(visibleAtomicSubshells(configuration, choices.showCore, choices.subshell));
			this.#pending = this.#orbitalParts.filter(part => this.#shownSubshells.has(part.subshell) && !this.#builtParts.has(part));
			this.#hover = undefined;
			this.onHover();
			this.point();
			this.#applyOrbitalMaterials();
		}
		this.#draw();
	}

	#buildNucleus(nucleus: NonNullable<ReturnType<typeof referenceNucleus>>, shellCount: number) {
		const { radius, particles } = schematicNucleons(nucleus, shellCount);
		const batch = new BatchedMesh3D({ size: particles.length, eventMode: "none" });
		const matrix = new Matrix4().makeScale(radius, radius, radius);
		for (const [i, particle] of particles.entries()) {
			batch.setGeometryAt(i, this.#sphere);
			batch.setMaterialAt(i, this.#nucleons[particle.kind]);
			batch.setMatrixAt(i, matrix.setPosition(particle));
			batch.setPassesAt(i, RenderPassBit.OPAQUE);
		}
		this.#content.addChild(batch);
		this.#nucleus = batch;
	}

	#buildShells(configuration: AtomicConfiguration) {
		const shells = atomicShells(configuration);
		for (const [index, { n, electrons }] of shells.entries()) {
			const { radius, seconds } = shellOrbit(index, shells.length);
			const ring = new Mesh3D({ geometry: this.#ring, material: this.#mutedRing, eventMode: "none", parent: this.#content });
			ring.scale.set(radius);
			ring.rotation.x = Math.PI / 2;
			const group = new Container3D({ parent: this.#content });
			const particles: Mesh3D[] = [];
			for (let i = 0; i < electrons; i++) {
				const angle = (i / electrons + index * .079) * 2 * Math.PI - Math.PI / 2;
				const electron = new Mesh3D({ geometry: this.#sphere, material: this.#mutedShell, eventMode: "none", parent: group });
				electron.scale.set(shells.length > 4 ? .025 : .034);
				electron.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0);
				particles.push(electron);
			}
			this.#spins.push({ n, ring, group, particles, speed: 2 * Math.PI / seconds });
		}
	}

	#append(part: AtomicOrbitalPart, phases: ReturnType<typeof atomicOrbitalMesh>["phases"], extent: number) {
		this.#builtParts.add(part);
		for (const [phase, buffers] of phases.entries()) {
			if (!buffers) continue;
			const geometry = new Geometry3D(buffers);
			this.#ownedGeometry.push(geometry);
			const mesh = new Mesh3D({ geometry, material: this.#neutralOrbitals[0], eventMode: "static", hitVolume: "geometry" });
			mesh.scale.set(extent);
			this.#surfaces.push({ part, mesh, phase });
		}
	}

	#applyOrbitalMaterials() {
		const hasFocus = !!this.#choices.subshell;
		const valence = this.#configuration.valence;
		const hasDirectionalOrbitals = valence.some(item => item.l > 0);
		this.#background.length = 0;
		for (const { part, mesh, phase } of this.#surfaces) {
			if (!this.#shownSubshells.has(part.subshell)) {
				mesh.removeFromParent();
				continue;
			}
			const hovered = this.#hover?.subshell === part.subshell && this.#hover.orientation === part.orientation;
			const occupied = orbitalOccupation(part.subshell, part.orientation);
			const core = !valence.includes(part.subshell);
			// A spherical or core surface should not intercept a lobe behind it.
			const spherical = part.subshell.l === 0 && hasDirectionalOrbitals;
			const background = !hasFocus && (core || spherical);
			if (background) this.#background.push(mesh);
			mesh.eventMode = background ? "none" : "static";
			const selected = this.#hover ? hovered : hasFocus;
			// Give smaller surfaces less weight, especially inner subshells.
			// Dividing the opacity across orientations curbs buildup in d and f groups.
			const opacity = .34 * part.scale ** 2 * (core ? .24 : 1) * (spherical ? .42 : 1) * (occupied ? 1 : .5)
				* (this.#hover ? .45 : 1) / Math.sqrt(2 * part.subshell.l + 1);
			mesh.material = selected ? this.#phases[hovered ? 2 : occupied ? 1 : 0][phase]
				: this.#neutralOrbitals[Math.floor(opacity / neutralOpacityStep)];
			if (!mesh.parent) this.#content.addChild(mesh);
		}
	}

	#pick() {
		let target = this.#pointer && this.#view.raycast(this.#pointer)?.target;
		if (!target && this.#pointer && this.#background.length) {
			for (const mesh of this.#background) mesh.eventMode = "static";
			target = this.#view.raycast(this.#pointer)?.target;
			for (const mesh of this.#background) mesh.eventMode = "none";
		}
		const next = target ? this.#surfaces.find(surface => surface.mesh === target)?.part : undefined;
		if (this.#hover?.subshell === next?.subshell && this.#hover?.orientation === next?.orientation) return;
		this.#hover = next;
		this.#applyOrbitalMaterials();
		this.onHover(next);
	}

	point(clientX?: number, clientY?: number) {
		const box = this.canvas.getBoundingClientRect();
		this.#pointer = clientX === undefined || this.#choices?.model !== "orbitals" || !box.width || !box.height ? undefined : {
			x: (clientX - box.left) * this.app.screen.width / box.width,
			y: (clientY - box.top) * this.app.screen.height / box.height,
		};
		this.#draw();
	}

	orbit(x: number, y: number) {
		this.#yaw -= x * .009;
		this.#pitch = Math.max(-1.45, Math.min(1.45, this.#pitch + y * .009));
		this.#camera();
	}

	zoom(factor: number) {
		this.#distance = Math.max(this.#extent * .95, Math.min(this.#extent * 22, this.#distance * factor));
		this.#camera();
	}

	fit() {
		const aspect = this.app.screen.width / this.app.screen.height;
		this.#distance = 2.75 * this.#extent / Math.max(.2, Math.min(1, aspect));
		this.#camera();
	}

	#camera() {
		const camera = this.#view.camera;
		camera.near = Math.min(.05, this.#distance * .04);
		if (this.#choices?.model === "bohr") {
			camera.position.set(0, 0, this.#distance);
			this.#nucleus?.rotation.set(this.#pitch, -this.#yaw, 0);
		} else {
			camera.position.set(this.#distance * Math.cos(this.#pitch) * Math.sin(this.#yaw),
				this.#distance * Math.sin(this.#pitch), this.#distance * Math.cos(this.#pitch) * Math.cos(this.#yaw));
		}
		camera.lookAt({ x: 0, y: 0, z: 0 });
		this.#draw();
	}

	#draw() {
		if (this.#frame || !this.#visible) return;
		this.#frame = requestAnimationFrame(now => {
			this.#frame = 0;
			if (!this.#visible) return;
			if (this.#running && this.#spins.length) {
				this.#spin += this.#timestamp ? Math.min(64, now - this.#timestamp) / 1000 : 0;
				this.#timestamp = now;
				for (const { group, speed } of this.#spins) group.rotation.z = this.#spin * speed;
			} else this.#timestamp = 0;
			const scale = this.#physical ? this.app.screen.height / (2 * this.#distance * Math.tan(this.#view.camera.fov * Math.PI / 360)) : 0;
			if (scale !== this.#scale) {
				this.#scale = scale;
				this.onScale(scale);
			}
			if (this.#pending.length) {
				const start = performance.now();
				do {
					const part = this.#pending.shift();
					const { phases } = atomicOrbitalMesh({ atomId: 1, atomicNumber: this.#atom,
						electrons: this.#configuration.electrons, ...part }, this.#configuration.valence.includes(part.subshell) ? 31 : 19);
					this.#append(part, phases, part.scale);
				} while (this.#pending.length && performance.now() - start < 5);
				this.#applyOrbitalMaterials();
			}
			this.#pick();
			this.app.render();
			if (this.#pending.length || (this.#running && this.#spins.length)) this.#draw();
		});
	}

	#clear() {
		for (const { mesh } of this.#surfaces) mesh.destroy();
		for (const node of this.#content.removeChildren()) node.destroy({ children: true });
		for (const geometry of this.#ownedGeometry) geometry.destroy();
		this.#ownedGeometry = [];
		this.#surfaces = [];
		this.#background.length = 0;
		this.#spins = [];
		this.#nucleus = undefined;
		this.#orbitalParts = [];
		this.#builtParts.clear();
		this.#shownSubshells.clear();
		this.#pending = [];
		this.#timestamp = 0;
		this.#spin = 0;
		this.#pointer = undefined;
		this.#hover = undefined;
		this.onHover();
	}

	destroy() {
		cancelAnimationFrame(this.#frame);
		this.#observer.disconnect();
		this.#clear();
		this.app.destroy(true, { children: true });
		this.#sphere.destroy();
		this.#ring.destroy();
		for (const material of [...Object.values(this.#nucleons), ...this.#shells, ...this.#rings, this.#mutedShell, this.#mutedRing,
			...this.#neutralOrbitals, ...this.#phases.flat()]) material.destroy();
	}
}
