import { Container, Graphics, type PointData } from "pixi.js";
import type { CableEnd, ElectricComponent } from "../chemlib/ElectricComponent";
import { CABLE_DIAMETER_MM } from "../data/componentGraphics";
import { MILLIMETERS_PER_WORLD_UNIT } from "./WorkspaceCamera";

/** Number of rope chain points per cable, including the two pinned ends. */
const CABLE_SEGMENTS = 14;
/** Distance-constraint passes per simulation step. */
const CABLE_ITERATIONS = 5;
/** Gravity acting on rope points in world units per s^2 (1.5 mm per unit). */
const CABLE_GRAVITY = 4000;
/** Velocity damping per 1/60 s, so the rope feels the same at any sub-step. */
const CABLE_DAMPING = 0.92;
/** Longest integration step in seconds. Gravity is strong compared with the
 * span of a lead, so a whole frame at a low frame rate would shake the rope
 * harder than the constraints can answer and it would never come to rest. */
const CABLE_SUBSTEP = 1 / 240;
/** Extra length a cable keeps over the straight end distance, so a fresh or
 * re-dropped cable settles with a slight sag instead of taut. */
export const CABLE_SLACK = 1.1;
/** Per-point movement in world units below which a rope counts as settled. */
const CABLE_SETTLE = 0.25;
/** Grab radius around an end marker, in world units. */
const END_REACH = 4.5;
/** Reach of the rope hit test, in world units. */
const ROPE_REACH = 3;

/** The two collar colours of a lead, so the ends stay distinguishable. */
const END_COLOURS: readonly [number, number] = [0xb84a4a, 0x2b3a44];

/**
 * The drawn view of a cable: a rope-simulated lead with a plug on each end.
 *
 * The rope lives in the local coordinates of the container, so the cable can be
 * moved as one object while its ends stay pinned to the terminals they are
 * plugged into. An end that is plugged into nothing sits at the offset the
 * component records, which is what lets a cable be laid out before it is wired.
 *
 * @export
 * @class CableView
 * @typedef {CableView}
 */
export class CableView extends Container {
	/** the drawn rope, in local coordinates */
	private readonly rope = new Graphics({ eventMode: "none" });
	/** the two end markers, in local coordinates */
	private readonly markers: [Graphics, Graphics];
	/** current positions of the chain; first and last are pinned */
	private points: Array<{ x: number; y: number }> = [];
	/** positions of the previous integration step */
	private prev: Array<{ x: number; y: number }> = [];
	/** unconstrained material length of the cable in world units */
	private restLength = 0;
	/** true while the rope keeps simulating until it settles */
	private awake = true;
	/** consecutive settled frames; puts the rope back to sleep */
	private idleFrames = 0;
	/** the two pinned ends in local coordinates */
	private ends: [PointData, PointData];
	/** whether the drawn rope has to be rebuilt */
	private dirty = true;

	constructor(readonly component: ElectricComponent) {
		super({ interactiveChildren: false });
		const [first, second] = component._endOffsets;
		this.ends = [{ x: first.x, y: first.y }, { x: second.x, y: second.y }];
		this.markers = [
			this.createMarker(component._cableEnds[0], END_COLOURS[0]),
			this.createMarker(component._cableEnds[1], END_COLOURS[1]),
		];
		this.addChild(this.rope, ...this.markers);
		this.hitArea = {
			contains: (x: number, y: number): boolean => this.contains(x, y),
		};
		this.reseed();
		this.resetLength(this.ends[0], this.ends[1]);
		this.draw();
	}

	/**
	 * Whether the rope is still moving, so the canvas keeps refreshing.
	 *
	 * @readonly
	 * @type {boolean}
	 */
	get moving(): boolean {
		return this.awake;
	}

	/**
	 * The end whose marker lies under a point in local coordinates, or -1. The
	 * grab radius is wider than the drawn plug, so an end is easy to pick.
	 *
	 * @param {number} x - local x
	 * @param {number} y - local y
	 * @returns {number} the end index, or -1
	 */
	endAt(x: number, y: number): number {
		let best = -1;
		let bestDistance = END_REACH;
		this.ends.forEach((end, index) => {
			const distance = Math.hypot(x - end.x, y - end.y);
			if (distance <= bestDistance) {
				best = index;
				bestDistance = distance;
			}
		});
		return best;
	}

	/**
	 * Whether a point in local coordinates lies on the drawn cable. The
	 * bounding box of a sagging rope covers a large part of the canvas, so the
	 * hit test follows the polyline and the two plugs instead.
	 *
	 * @param {number} x - local x
	 * @param {number} y - local y
	 * @returns {boolean}
	 */
	contains(x: number, y: number): boolean {
		if (this.endAt(x, y) >= 0) return true;
		for (let index = 1; index < this.points.length; index++) {
			const a = this.points[index - 1];
			const b = this.points[index];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const lengthSquared = dx * dx + dy * dy;
			const t = lengthSquared > 0
				? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared))
				: 0;
			if (Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)) <= ROPE_REACH) return true;
		}
		return false;
	}

	/**
	 * Moves the two pinned ends. A moved end wakes the rope, so the cable
	 * follows a device that was dragged or an end that was pulled.
	 *
	 * A lead that is pulled apart lengthens with its usual slack. Without that
	 * the material length would stay at the span the cable was laid at, the
	 * distance constraints could never be satisfied, and the rope would keep
	 * jittering instead of settling into a sag.
	 *
	 * @param {PointData} first - the first end in local coordinates
	 * @param {PointData} second - the second end in local coordinates
	 */
	setEnds(first: PointData, second: PointData): void {
		const [oldFirst, oldSecond] = this.ends;
		if (oldFirst.x === first.x && oldFirst.y === first.y &&
			oldSecond.x === second.x && oldSecond.y === second.y) return;
		this.ends = [{ x: first.x, y: first.y }, { x: second.x, y: second.y }];
		const span = Math.hypot(second.x - first.x, second.y - first.y);
		this.restLength = Math.max(this.restLength, span * CABLE_SLACK);
		this.awake = true;
		this.idleFrames = 0;
		this.dirty = true;
	}

	/**
	 * Sets the material length of the cable from the current end distance plus
	 * the usual slack. Called when an end is dropped, so a cable that was
	 * stretched while it was dragged settles with a sag again.
	 *
	 * @param {PointData} first - the first end in local coordinates
	 * @param {PointData} second - the second end in local coordinates
	 */
	resetLength(first: PointData, second: PointData): void {
		this.restLength = Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1) * CABLE_SLACK;
		this.awake = true;
		this.idleFrames = 0;
		this.dirty = true;
	}

	/**
	 * Integrates one simulation step: the interior points fall under gravity
	 * with damping, while the distance constraints keep every segment at
	 * `restLength / segments`. The pinned ends always win, so the drawn cable
	 * hangs between them instead of pulling them together.
	 *
	 * @param {number} dt - the step in seconds
	 */
	step(dt: number): void {
		const count = this.points.length;
		if (count < 2) return;

		// The frame is split into fixed sub-steps, so the rope behaves the same
		// at 30 and at 120 frames per second.
		const steps = Math.max(1, Math.ceil(dt / CABLE_SUBSTEP));
		const sub = dt / steps;
		let maxMove = 0;
		for (let s = 0; s < steps; s++) maxMove = this.integrate(sub);

		// The rope sleeps once it has calmed down. The test looks at a single
		// sub-step, because the integration itself leaves a jitter of one
		// gravity increment per sub-step that a whole frame would add up.
		if (maxMove < CABLE_SETTLE) {
			this.idleFrames += 1;
			if (this.idleFrames > 6) this.awake = false;
		} else {
			this.idleFrames = 0;
		}
		this.dirty = true;
	}

	/**
	 * One integration sub-step: verlet integration of the interior points
	 * under gravity and damping, then the distance constraints.
	 *
	 * @private
	 * @param {number} dt - the sub-step in seconds
	 * @returns {number} the largest movement of an interior point
	 */
	private integrate(dt: number): number {
		const { points, prev, ends } = this;
		const last = points.length - 1;

		// verlet integration of the interior points: velocity, damping, gravity
		const damping = Math.pow(CABLE_DAMPING, dt * 60);
		for (let i = 1; i < last; i++) {
			const vx = (points[i].x - prev[i].x) * damping;
			const vy = (points[i].y - prev[i].y) * damping;
			prev[i].x = points[i].x;
			prev[i].y = points[i].y;
			points[i].x += vx;
			points[i].y += vy + CABLE_GRAVITY * dt * dt;
		}

		// pin the ends before and after the constraints
		points[0].x = ends[0].x;
		points[0].y = ends[0].y;
		points[last].x = ends[1].x;
		points[last].y = ends[1].y;

		// distance constraints keep every segment at restLength / segments;
		// pinned ends cannot move, so the rope hangs between them
		const segLength = this.restLength / last;
		for (let iteration = 0; iteration < CABLE_ITERATIONS; iteration++) {
			for (let k = 0; k < last; k++) {
				const dx = points[k + 1].x - points[k].x;
				const dy = points[k + 1].y - points[k].y;
				const dist = Math.hypot(dx, dy) || 1e-9;
				const correction = (dist - segLength) / dist;
				if (k === 0) {
					points[1].x -= dx * correction;
					points[1].y -= dy * correction;
				} else if (k + 1 === last) {
					points[last - 1].x += dx * correction;
					points[last - 1].y += dy * correction;
				} else {
					points[k].x += dx * correction * 0.5;
					points[k].y += dy * correction * 0.5;
					points[k + 1].x -= dx * correction * 0.5;
					points[k + 1].y -= dy * correction * 0.5;
				}
			}
			points[0].x = ends[0].x;
			points[0].y = ends[0].y;
			points[last].x = ends[1].x;
			points[last].y = ends[1].y;
		}

		let maxMove = 0;
		for (let i = 1; i < last; i++) {
			maxMove = Math.max(
				maxMove,
				Math.abs(points[i].x - prev[i].x),
				Math.abs(points[i].y - prev[i].y)
			);
		}
		return maxMove;
	}

	/**
	 * Places the two end markers and rebuilds the rope when it moved. The
	 * markers are turned along the rope, so a plug points away from the lead
	 * and into the terminal it sits on.
	 */
	draw(): void {
		this.placeMarkers();
		if (!this.dirty) return;
		this.dirty = false;
		this.drawRope();
	}

	/**
	 * Rebuilds the chain for the current ends. A fresh cable starts as a
	 * straight line between its two ends.
	 *
	 * @private
	 */
	private reseed(): void {
		const [first, second] = this.ends;
		this.points = [];
		this.prev = [];
		for (let i = 0; i < CABLE_SEGMENTS; i++) {
			const t = i / (CABLE_SEGMENTS - 1);
			const point = {
				x: first.x + (second.x - first.x) * t,
				y: first.y + (second.y - first.y) * t,
			};
			this.points.push(point);
			this.prev.push({ x: point.x, y: point.y });
		}
	}

	/**
	 * Draws the rope as a smooth polyline with the flat cable look: a dark
	 * outer stroke and a lighter inner highlight.
	 *
	 * @private
	 */
	private drawRope(): void {
		if (this.points.length < 2) this.reseed();
		const lineWidth = CABLE_DIAMETER_MM / MILLIMETERS_PER_WORLD_UNIT;
		const { points } = this;
		const trace = (graphics: Graphics) => {
			graphics.moveTo(points[0].x, points[0].y);
			for (let k = 1; k < points.length - 1; k++) {
				const mx = (points[k].x + points[k + 1].x) / 2;
				const my = (points[k].y + points[k + 1].y) / 2;
				graphics.quadraticCurveTo(points[k].x, points[k].y, mx, my);
			}
			const last = points[points.length - 1];
			graphics.lineTo(last.x, last.y);
		};
		this.rope.clear();
		trace(this.rope);
		this.rope.stroke({ width: lineWidth, color: 0x30404d, cap: "round", join: "round" });
		trace(this.rope);
		this.rope.stroke({ width: lineWidth * 0.35, color: 0x687d8b, cap: "round", join: "round" });
	}

	/**
	 * Puts each marker on its end and turns it along the rope.
	 *
	 * @private
	 */
	private placeMarkers(): void {
		const last = this.points.length - 1;
		if (last < 1) return;
		const angles = [
			Math.atan2(this.ends[0].y - this.points[1].y, this.ends[0].x - this.points[1].x),
			Math.atan2(this.ends[1].y - this.points[last - 1].y, this.ends[1].x - this.points[last - 1].x),
		];
		this.markers.forEach((marker, index) => {
			marker.position.set(this.ends[index].x, this.ends[index].y);
			marker.rotation = angles[index];
		});
	}

	/**
	 * Builds one end marker. The plug points along +x with its tip at the
	 * origin, so the marker can simply be turned along the rope.
	 *
	 * @private
	 * @param {CableEnd} end - the kind of plug
	 * @param {number} colour - the collar colour of this end
	 * @returns {Graphics}
	 */
	private createMarker(end: CableEnd, colour: number): Graphics {
		const marker = new Graphics({ eventMode: "none" });
		if (end === "crocodile") {
			// An alligator clip: a body with two steel jaws that grip the strip.
			marker.roundRect(-8, -2.4, 6.4, 4.8, 1.8).fill(0x2f3f4a);
			marker.moveTo(-1.8, -2.2).lineTo(0.4, -0.5).lineTo(-1.8, -0.1).closePath().fill(0x9aa6b2);
			marker.moveTo(-1.8, 2.2).lineTo(0.4, 0.5).lineTo(-1.8, 0.1).closePath().fill(0x9aa6b2);
			marker.circle(-1.6, 0, 1).fill(0x6f7d8a);
			marker.roundRect(-7.6, -2.6, 1.6, 5.2, 0.7).fill(colour);
			return marker;
		}
		// A banana plug: a brass tip, a plastic body and a coloured collar.
		marker.roundRect(-1.6, -1.1, 1.6, 2.2, 0.6).fill(0xc9b27a);
		marker.roundRect(-8, -2.3, 6.4, 4.6, 1.6).fill(0x2f3f4a);
		marker.roundRect(-3.2, -2.6, 1.6, 5.2, 0.7).fill(colour);
		marker.roundRect(-7.4, -1.6, 4.2, 1, 0.5).fill({ color: 0xffffff, alpha: 0.18 });
		return marker;
	}
}
