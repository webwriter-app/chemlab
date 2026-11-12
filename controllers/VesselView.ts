import { CanvasSource, Container, DOMAdapter, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { ChemComponent } from "../chemlib";

type Slice = readonly [height: number, radius: number];
type Point = { x: number; y: number };

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
	private fillShape = new Graphics({ eventMode: "none" });
	private outline: Point[];
	private profile: Slice[];
	private lastFraction = -1;
	private lastAngle = 0;
	private lastLiquid = false;

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
		this.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
		this.addChild(this.fillShape, glass);
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

	updateContents(): void {
		const mixture = this.component._content;
		const liquid = mixture.hasLiquidContents;
		const fraction = mixture.contentVolume * 1000 / this.component._volume;
		// Older solid mixtures store moles without a bulk volume.
		const fill = fraction > 0 ? Math.min(1, fraction) : !liquid && mixture._activeMolecules.length ? 0.035 : 0;
		this.updateFill(fill, liquid);
	}

	updateAngle(): void {
		this.updateFill(this.lastFraction, this.lastLiquid);
	}

	private updateFill(fraction: number, liquid: boolean): void {
		const angle = liquid ? this.rotation : 0;
		if (fraction === this.lastFraction && angle === this.lastAngle && liquid === this.lastLiquid) return;
		this.lastFraction = fraction;
		this.lastAngle = angle;
		this.lastLiquid = liquid;
		this.fillShape.clear();
		if (fraction <= 0) return;

		// Project gravity into the SVG coordinates after the artboard is scaled to the measured dimensions.
		const sin = Math.sin(angle) * this.fillShape.scale.x / this.fillShape.scale.y;
		const cos = Math.cos(angle);
		const depth = ({ x, y }: Point) => x * sin + y * cos;
		const depths = this.outline.map(depth);
		const surface = this.surfaceAt(fraction, Math.min(...depths), Math.max(...depths), sin, cos);
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
		if (submerged.length < 3) return;
		this.fillShape.poly(submerged).fill(liquid ? { color: 0x4592b7, alpha: 0.55 } : { color: 0x827d6f, alpha: 0.72 });
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
