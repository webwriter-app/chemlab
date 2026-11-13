import { CanvasSource, Container, DOMAdapter, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { ChemComponent } from "../chemlib";

export type VesselHint = "grain" | "pour";

type Slice = readonly [height: number, radius: number];
type Point = { x: number; y: number };

interface SolidParticle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: number;
	/** depth at which the particle lands and disappears into the sediment */
	floor: number;
}

// Interior cross sections, in the corresponding SVG viewBox coordinates.
const interiors = {
	beaker: { center: 13.23, width: 26.458333, height: 34.395833,
		profile: [[4.5, 11.9], [31.7, 11.9], [32.7, 10.9], [33.1, 7]] },
	flask: { center: 15.86, width: 31.75, height: 41.275,
		profile: [[17, 6.8], [37.2, 12.75], [38.5, 12], [39.7, 8], [40.2, 4]] },
	burette: { center: 10.12, width: 21.166666, height: 105.83333,
		profile: [[3.6, 2.35], [81, 2.35], [81.7, 1.8]] },
	testtube: { center: 10.345, width: 21.166666, height: 39.687499,
		profile: [[3.7, 2.58], [36.4, 2.58], [37.1, 2.25], [37.35, 1.4]] },
	separatingfunnel: { center: 45, width: 90, height: 235,
		profile: [[58, 19], [77, 35], [103, 42], [126, 32], [153, 13], [171, 4], [181, 3]] },
} satisfies Record<string, { center: number; width: number; height: number; profile: Slice[] }>;

type VesselType = keyof typeof interiors;

export function isVesselType(type: string): type is VesselType {
	return Object.hasOwnProperty.call(interiors, type);
}

// Cross-sectional volume in units of π, for a frustum with linearly varying radius.
function frustum(height: number, first: number, second: number): number {
	return height * (first * first + first * second + second * second) / 3;
}

function circularSegment(cut: number): number {
	if (cut <= -1) return 1;
	if (cut >= 1) return 0;
	return (Math.acos(cut) - cut * Math.sqrt(1 - cut * cut)) / Math.PI;
}

export class VesselView extends Container {
	/** max particles animated per vessel, keeps small mixtures cheap */
	private static readonly MAX_PARTICLES = 70;
	/** profile-space accelerations and speed limits, tuned per particle kind */
	private static readonly GRAIN_GRAVITY = 60;
	private static readonly PRECIPITATE_GRAVITY = 22;
	private static readonly GRAIN_TERMINAL = 80;
	private static readonly PRECIPITATE_TERMINAL = 7;

	private fillShape = new Graphics({ eventMode: "none" });
	private particlesShape = new Graphics({ eventMode: "none" });
	private outline: Point[];
	private profile: Slice[];
	private lastFraction = -1;
	private lastAngle = 0;
	private lastLiquid = false;
	private lastSediment = 0;
	private lastSedimentColor = 0;
	private lastWobble = 0;
	/** last reported sediment mass, to detect precipitation and dissolution */
	private sedimentMass = 0;
	/** sediment fraction the fill graphics currently show, eased to the target */
	private sedimentDrawn = -1;
	private sedimentFraction = 0;
	private fillFraction = 0;
	private liquidFilled = false;
	private sedimentColor = 0;
	/** solid particles falling or sinking in the liquid */
	private particles: SolidParticle[] = [];
	/** remaining pour stream visibility in ms */
	private streamMs = 0;
	/** remaining surface wobble in ms, plus its age for the decay curve */
	private wobbleMs = 0;
	private wobbleAge = 0;
	private initialized = false;

	constructor(readonly component: ChemComponent, type: VesselType, texture: Texture, width: number, height: number,
		scaleTextures: Map<string, Texture>) {
		super({ interactiveChildren: false });
		const glass = new Sprite({ texture, anchor: 0.5, width, height, eventMode: "none" });
		const { center, width: svgWidth, height: svgHeight, profile } = interiors[type];
		this.profile = profile;
		this.outline = [
			...profile.map(([y, r]) => ({ x: -r, y })),
			...profile.map(([y, r]) => ({ x: r, y })).reverse(),
		];
		this.fillShape.position.set(width * (center / svgWidth - 0.5), -height / 2);
		this.fillShape.scale.set(width / svgWidth, height / svgHeight);
		this.particlesShape.position = this.fillShape.position;
		this.particlesShape.scale = this.fillShape.scale;
		this.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
		// Particles swim in the liquid (above the fill) but behind the glass.
		this.addChild(this.fillShape, this.particlesShape, glass);
		if (Number.isFinite(component._volume) && component._volume > 0) {
			const key = `${type}:${component._volume}`;
			let scale = scaleTextures.get(key);
			if (!scale) {
				scale = this.createScale(type, width, height);
				scaleTextures.set(key, scale);
			}
			this.addChild(new Sprite({ texture: scale, width, height, anchor: 0.5, eventMode: "none" }));
		}
	}

	private createScale(type: VesselType, width: number, height: number): Texture {
		const resolution = 3;
		const canvas = DOMAdapter.get().createCanvas(Math.ceil(width * resolution), Math.ceil(height * resolution));
		const context = canvas.getContext("2d");
		context.scale(canvas.width / width, canvas.height / height);
		const capacity = this.component._volume;
		const burette = type === "burette";
		const narrow = burette || type === "testtube";
		const target = capacity / (burette ? 5 : 4);
		const magnitude = 10 ** Math.floor(Math.log10(target));
		const major = burette ? target : magnitude * [10, 5, 2.5, 2, 1].find((step) => step <= target / magnitude);
		const subdivisions = burette ? (capacity <= 10 ? 40 : capacity <= 25 ? 50 : 100) : 2;
		const tickCount = Math.floor(capacity / major * subdivisions + 1e-6);
		const { center, width: svgWidth, height: svgHeight } = interiors[type];
		const scaleX = width / svgWidth;
		const scaleY = height / svgHeight;
		const top = this.profile[0][0];
		const bottom = this.profile[this.profile.length - 1][0];
		const marks: { x: number; y: number; major: boolean }[] = [];
		// Use the narrowest cross section on the scale so every mark fits the glass.
		let majorLength = 6;
		for (let tick = burette ? 0 : 1; tick <= tickCount; tick++) {
			const value = Math.min(capacity, tick * major / subdivisions);
			const fraction = burette ? 1 - value / capacity : value / capacity;
			const y = this.surfaceAt(fraction, top, bottom, 0, 1);
			const radius = this.radiusAt(y);
			majorLength = Math.min(majorLength, radius * scaleX);
			marks.push({
				x: (center + (narrow ? radius : -0.68 * radius)) * scaleX,
				y: y * scaleY,
				major: tick % subdivisions === 0,
			});
		}
		context.strokeStyle = "#244652";
		context.lineCap = "butt";
		const direction = narrow ? -1 : 1;
		for (const { x, y, major } of marks) {
			const length = major ? majorLength : majorLength / 2;
			context.lineWidth = major ? 0.55 : 0.25;
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + direction * length, y);
			context.stroke();
		}
		return new Texture({ source: new CanvasSource({ resource: canvas, resolution, autoGenerateMipmaps: true }) });
	}

	private radiusAt(y: number): number {
		for (let index = 1; index < this.profile.length; index++) {
			const [y1, r1] = this.profile[index];
			if (y > y1) continue;
			const [y0, r0] = this.profile[index - 1];
			return r0 + (r1 - r0) * (y - y0) / (y1 - y0);
		}
		return this.profile[this.profile.length - 1][1];
	}

	updateContents(hint?: VesselHint): void {
		const mixture = this.component._content;
		const liquid = mixture.hasLiquidContents;
		const fraction = mixture.contentVolume * 1000 / this.component._volume;
		// Older solid mixtures store moles without a bulk volume.
		const fill = fraction > 0 ? Math.min(1, fraction) : !liquid && mixture._activeMolecules.length ? 0.035 : 0;
		const sediment = mixture.saltSediment;
		// Keep small precipitates visible in the teaching view.
		const sedimentFraction = liquid && sediment.mass > 1e-6
			? Math.min(fill, Math.max(0.012, sediment.mass / (2 * this.component._volume))) : 0;

		if (!this.initialized) {
			// First draw (or a restored document): show the state as it is.
			this.initialized = true;
		} else if (sediment.mass > this.sedimentMass + 1e-9 && liquid) {
			this.spawnSolidParticles(hint === "grain", sediment.mass - this.sedimentMass, fill, sedimentFraction, sediment.color);
		}
		this.sedimentMass = sediment.mass;
		if (this.sedimentDrawn < 0) this.sedimentDrawn = sedimentFraction;
		this.fillFraction = fill;
		this.liquidFilled = liquid;
		this.sedimentFraction = sedimentFraction;
		this.sedimentColor = sediment.color;
		if (hint === "pour" && liquid) {
			this.streamMs = 450;
			this.wobbleMs = 850;
			this.wobbleAge = 0;
		}
		this.updateFill(fill, liquid, this.sedimentDrawn, sediment.color);
	}

	/**
	 * Spawns particles for newly appeared solid material: dosed grains fall
	 * from the mouth into the vessel, precipitated solid suspends as fine
	 * particles in the liquid and sinks onto the sediment bed.
	 *
	 * @private
	 * @param {boolean} grains - true for a solid dose, false for precipitation
	 * @param {number} massDelta - the added solid mass in grams
	 * @param {number} fill - the current fill fraction
	 * @param {number} sedimentFraction - the target sediment fraction
	 * @param {number} color - the sediment colour
	 */
	private spawnSolidParticles(grains: boolean, massDelta: number, fill: number, sedimentFraction: number, color: number): void {
		const top = this.profile[0][0];
		const floor = this.surfaceAt(sedimentFraction, top, this.profile[this.profile.length - 1][0], 0, 1);
		const count = Math.min(16, Math.max(grains ? 10 : 4, Math.round(massDelta * 40)));
		const angle = this.rotation;
		const depth = ({ x, y }: Point) => x * Math.sin(angle) + y * Math.cos(angle);
		const floorDepth = depth({ x: 0, y: floor });
		for (let i = 0; i < count && this.particles.length < VesselView.MAX_PARTICLES; i++) {
			let x: number, y: number;
			if (grains) {
				// fall from the mouth inward
				x = (Math.random() * 2 - 1) * this.radiusAt(top) * 0.45;
				y = top - 1.5;
			} else {
				// suspend anywhere in the liquid between surface and floor
				const level = this.surfaceAt(fill, top, this.profile[this.profile.length - 1][0], 0, 1);
				const span = Math.max(floor - level, 0.5);
				y = level + Math.random() * span;
				x = (Math.random() * 2 - 1) * this.radiusAt(y) * 0.7;
			}
			this.particles.push({
				x, y,
				vx: (Math.random() * 2 - 1) * (grains ? 1.5 : 0.8),
				vy: Math.random() * 1.5,
				size: grains ? 0.55 + Math.random() * 0.45 : 0.28 + Math.random() * 0.3,
				color,
				floor: floorDepth,
			});
		}
	}

	/**
	 * Advances the vessel animations by one frame: settles the drawn
	 * sediment onto its target, integrates the solid particles, and runs
	 * the pour stream and the decaying surface wobble.
	 *
	 * @private
	 * @param {number} dtMs - elapsed time in milliseconds
	 * @returns {boolean} true while any animation stays active
	 */
	stepAnimation(dtMs: number): boolean {
		let active = false;
		let drawn = this.sedimentDrawn;

		// ease the drawn sediment towards its target
		const target = this.sedimentFraction;
		if (Math.abs(target - drawn) > 1e-5) {
			const step = (target - drawn) * Math.min(1, dtMs / 450);
			drawn = Math.abs(target - drawn) < 0.0008 ? target : drawn + step;
			this.sedimentDrawn = drawn;
			this.updateFill(this.fillFraction, this.liquidFilled, drawn, this.sedimentColor);
			active = true;
		}

		// solid particles fall / sink and land in the sediment
		if (this.particles.length) {
			const angle = this.rotation;
			const sin = Math.sin(angle);
			const cos = Math.cos(angle);
			const seconds = Math.min(dtMs, 50) / 1000;
			// local gravity direction: the vessel may sit tilted
			const gx = sin * cos;
			const gy = cos * cos;
			const remaining: SolidParticle[] = [];
			for (const particle of this.particles) {
				const grain = particle.size > 0.35;
				const gravity = grain
					? VesselView.GRAIN_GRAVITY
					: VesselView.PRECIPITATE_GRAVITY;
				const terminal = grain
					? VesselView.GRAIN_TERMINAL
					: VesselView.PRECIPITATE_TERMINAL;
				particle.vx = particle.vx * 0.96 + gx * gravity * seconds;
				particle.vy = Math.min(particle.vy + gy * gravity * seconds, terminal);
				particle.x += particle.vx * seconds;
				particle.y += particle.vy * seconds;
				const depth = particle.x * sin + particle.y * cos;
				if (depth < particle.floor - particle.size * 0.4) remaining.push(particle);
			}
			this.particles = remaining;
			this.drawParticles();
			active = true;
		}

		// pour stream and surface wobble decay after a dose
		if (this.streamMs > 0 || this.wobbleMs > 0) {
			this.streamMs = Math.max(0, this.streamMs - dtMs);
			this.wobbleMs = Math.max(0, this.wobbleMs - dtMs);
			this.wobbleAge = 850 - this.wobbleMs;
			this.drawStream();
			if (this.wobbleMs > 0) {
				const amplitude = 0.0035 * Math.exp(-this.wobbleAge / 300)
					* Math.sin(this.wobbleAge * Math.PI * 2 / 260);
				this.updateFill(this.fillFraction, this.liquidFilled, drawn, this.sedimentColor, amplitude);
			}
			active = true;
		}

		if (!this.particles.length && this.streamMs <= 0 && this.wobbleMs <= 0) {
			this.particlesShape.clear();
		}
		return active;
	}

	/** Redraws the solid particle layer within the interior profile. */
	private drawParticles(): void {
		this.particlesShape.clear();
		for (const particle of this.particles) {
			this.particlesShape.circle(particle.x, particle.y, particle.size).fill({ color: particle.color, alpha: 0.9 });
		}
	}

	/** Draws the short pour stream from the mouth to the liquid surface. */
	private drawStream(): void {
		this.drawParticles();
		if (this.streamMs <= 0) return;
		const alpha = Math.min(1, this.streamMs / 200) * 0.6;
		const top = this.profile[0][0];
		const surface = this.surfaceAt(this.fillFraction, top, this.profile[this.profile.length - 1][0], 0, 1);
		const x = this.radiusAt(top) * 0.25;
		this.particlesShape.moveTo(x, top - 8)
			.lineTo(x, surface - 0.3)
			.stroke({ color: 0x4592b7, width: 0.55, alpha, cap: "round" });
		this.particlesShape.circle(x, surface, 0.9).fill({ color: 0x4592b7, alpha: alpha * 0.8 });
	}

	updateAngle(): void {
		this.updateFill(this.lastFraction, this.lastLiquid, this.lastSediment, this.lastSedimentColor, this.lastWobble);
	}

	private updateFill(fraction: number, liquid: boolean, sediment: number, color: number, wobble: number = 0): void {
		const angle = liquid ? this.rotation : 0;
		if (fraction === this.lastFraction && angle === this.lastAngle && liquid === this.lastLiquid &&
			sediment === this.lastSediment && color === this.lastSedimentColor && wobble === this.lastWobble) return;
		this.lastFraction = fraction;
		this.lastAngle = angle;
		this.lastLiquid = liquid;
		this.lastSediment = sediment;
		this.lastSedimentColor = color;
		this.lastWobble = wobble;
		this.fillShape.clear();
		if (fraction <= 0) return;

		// Project gravity into the SVG coordinates after the artboard is scaled to the measured dimensions.
		const sin = Math.sin(angle) * this.fillShape.scale.x / this.fillShape.scale.y;
		const cos = Math.cos(angle);
		const depth = ({ x, y }: Point) => x * sin + y * cos;
		const depths = this.outline.map(depth);
		// wobble: the pour briefly pushes the filling level up and down
		const surface = this.surfaceAt(Math.max(0, Math.min(1, fraction + wobble)), Math.min(...depths), Math.max(...depths), sin, cos);
		const { submerged, edges } = this.clipAtSurface(surface, depth);
		if (submerged.length < 3) return;
		this.fillShape.poly(submerged).fill(liquid ? { color: 0x4592b7, alpha: 0.55 } : { color: 0x827d6f, alpha: 0.72 });
		if (sediment > 0) {
			const floor = this.surfaceAt(sediment, Math.min(...depths), Math.max(...depths), sin, cos);
			const deposit = this.clipAtSurface(floor, depth).submerged;
			if (deposit.length >= 3) this.fillShape.poly(deposit).fill({ color, alpha: 0.95 })
				.stroke({ color: 0x726a59, alpha: 0.8, width: 0.18 });
		}
		if (!liquid) return;
		if (fraction === 1 && angle === 0) edges.push(this.outline[0], this.outline[this.outline.length - 1]);
		for (let i = 0; i + 1 < edges.length; i += 2) {
			const [a, b] = [edges[i], edges[i + 1]];
			this.fillShape.moveTo(a.x, a.y);
			if (angle === 0) {
				const bend = Math.min(Math.abs(b.x - a.x) * 0.08, 0.65,
					(this.profile[this.profile.length - 1][0] - a.y) / 2);
				this.fillShape.quadraticCurveTo((a.x + b.x) / 2, a.y + bend, b.x, b.y);
			} else this.fillShape.lineTo(b.x, b.y);
			this.fillShape.stroke({ color: 0x287399, alpha: 0.8, width: 0.24 });
		}
	}

	private clipAtSurface(surface: number, depth: (point: Point) => number) {
		const submerged: Point[] = [];
		const edges: Point[] = [];
		for (const [index, point] of this.outline.entries()) {
			const previous = this.outline[(index + this.outline.length - 1) % this.outline.length];
			const a = depth(previous);
			const b = depth(point);
			if ((a < surface) !== (b < surface)) {
				const t = (surface - a) / (b - a);
				const edge = { x: previous.x + (point.x - previous.x) * t, y: previous.y + (point.y - previous.y) * t };
				submerged.push(edge);
				edges.push(edge);
			}
			if (b >= surface) submerged.push(point);
		}
		return { submerged, edges };
	}

	private surfaceAt(fraction: number, top: number, bottom: number, sin: number, cos: number): number {
		if (fraction >= 1) return top;
		if (fraction <= 0) return bottom;
		const volume = fraction * this.volumeBelow(top, sin, cos);
		for (let step = 0; step < 18; step++) {
			const middle = (top + bottom) / 2;
			if (this.volumeBelow(middle, sin, cos) > volume) top = middle;
			else bottom = middle;
		}
		return (top + bottom) / 2;
	}

	private volumeBelow(level: number, sin: number, cos: number): number {
		let volume = 0;
		for (let index = 1; index < this.profile.length; index++) {
			const [y0, r0] = this.profile[index - 1];
			const [y1, r1] = this.profile[index];
			const height = y1 - y0;
			if (Math.abs(sin) < 1e-8 && cos > 0) {
				const y = Math.min(y1, Math.max(y0, level));
				volume += frustum(y1 - y, r0 + (r1 - r0) * (y - y0) / height, r1);
				continue;
			}
			// A tilted horizontal plane cuts each circular cross section in a segment.
			const steps = Math.ceil(height / 0.75);
			for (let step = 0; step < steps; step++) {
				const t = (step + 0.5) / steps;
				const y = y0 + height * t;
				const r = r0 + (r1 - r0) * t;
				const cut = (level - y * cos) / Math.max(1e-8, Math.abs(sin) * r);
				volume += r * r * circularSegment(cut) * height / steps;
			}
		}
		return volume;
	}
}
