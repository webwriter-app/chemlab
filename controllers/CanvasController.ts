import { ReactiveController } from "lit";
import * as PIXI from "pixi.js";
import * as chemlib from "../chemlib";

import { CABLE_DIAMETER_MM, componentArtboardMm, componentGraphic, componentTextureUrls } from "../data/componentGraphics";

import { MILLIMETERS_PER_WORLD_UNIT, STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH, WorkspaceCamera } from "./WorkspaceCamera";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { ElectricDeviceView } from "./ElectricDeviceView";
import { isVesselType, VesselView, type VesselHint } from "./VesselView";

import type { ChemLab } from "../webwriter-chemlab";

// Cables are rope-simulated polylines drawn into the canvas world.

/** Number of rope chain points per cable, including the two pinned ends. */
const CABLE_SEGMENTS = 14;
/** Distance-constraint passes per simulation step. */
const CABLE_ITERATIONS = 5;
/** Gravity acting on rope points in world units per s^2 (1.5 mm per unit). */
const CABLE_GRAVITY = 4000;
/** Velocity damping applied per step. */
const CABLE_DAMPING = 0.92;
/** Extra length a cable keeps over the straight device distance, so a
 * fresh or re-dropped cable settles with a slight sag instead of taut. */
const CABLE_SLACK = 1.1;
/** Per-point movement in world units below which a rope counts as settled. */
const CABLE_SETTLE = 0.25;
/** Name of the background task that keeps the canvas refreshing while cables move. */
const CABLE_TASK = "cables";
/** Name of the background task that keeps the canvas refreshing while vessel particles move. */
const VESSEL_TASK = "vessel-anim";

/**
 * Component types that hang into a vessel and therefore have to overlap it:
 * an electrode and a gas collection tube stand in the solution, a salt bridge
 * reaches into two vessels, and a burette is clamped above its vessel with the
 * tip in the mouth.
 */
const DIPPED_TYPES: ReadonlySet<string> = new Set(["electrode", "gascollector", "bridge", "burette"]);

/**
 * Component types that are not physical: a label lies over whatever it
 * annotates and a cable runs between devices, so neither takes up room.
 */
const UNBODIED_TYPES: ReadonlySet<string> = new Set(["label", "cable"]);

/**
 * Offsets tried when a component is dropped from the palette onto an occupied
 * spot, ordered by distance so the nearest free place wins.
 */
const PLACEMENT_OFFSETS: readonly (readonly [number, number])[] = (() => {
	const offsets: Array<[number, number]> = [];
	for (let dx = -4; dx <= 4; dx++) for (let dy = -4; dy <= 4; dy++) offsets.push([dx, dy]);
	return offsets.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
})();

/**
 * Simulation state of one rope-simulated cable: a verlet point chain
 * pinned to the connected device sprites at both ends.
 *
 * @typedef {CableRope}
 */
interface CableRope {
	/** current positions of the chain; first/last are pinned */
	points: Array<{ x: number; y: number }>;
	/** positions of the previous integration step */
	prev: Array<{ x: number; y: number }>;
	/** unconstrained material length of the cable in world units */
	restLength: number;
	/** true while the rope keeps simulating until it settles */
	awake: boolean;
	/** consecutive settled frames; puts the rope back to sleep */
	idleFrames: number;
	/** device positions the rope is currently pinned to */
	endpoints: [number, number, number, number];
}

/**
 * Owns the PixiJS canvas layer: application/stage lifecycle, sprite
 * creation and the custom drag interaction. These methods manipulate the
 * shared widget state and UI through the host reference.
 *
 * @implements {ReactiveController}
 */
export class CanvasController implements ReactiveController {
	private host: ChemLab;
	readonly world = new PIXI.Container({ sortableChildren: true, eventMode: "passive" });
	private camera = new WorkspaceCamera();
	private grid?: WorkspaceGrid;
	private showGrid = true;
	private resizeObserver?: ResizeObserver;
	private pan?: { id: number; x: number; y: number; moved: boolean; deselectOnTap: boolean };
	private selectionOverlay = new PIXI.Graphics({ eventMode: "none" });
	private placementPreviewLayer = new PIXI.Container({ eventMode: "none" });
	/** draws the rubber-band wire of a connection drag, in world coordinates */
	private wireLayer = new PIXI.Container({ eventMode: "none" });
	private wireGraphics = new PIXI.Graphics({ eventMode: "none" });
	/** the connection drag in progress, if any */
	private wire?: { id: number; from: chemlib.ElectricComponent; terminal: number; sprite: ElectricDeviceView };
	/** the device under the pointer whose free terminals are shown */
	private hoveredPorts?: ElectricDeviceView;
	/** the device under the pointer while a wire is being dragged */
	private wireTarget?: ElectricDeviceView;
	private selection: PIXI.Container[] = [];
	private marquee?: { id: number; start: PIXI.PointData; end?: PIXI.PointData };
	private groupDrag?: { id: number; origin: PIXI.PointData; anchor: PIXI.PointData; moved: boolean;
		offset: PIXI.PointData; items: { sprite: PIXI.Container; x: number; y: number }[] };
	private touchListeners?: AbortController;
	private touches = new Map<number, { x: number; y: number }>();
	private pinching = false;
	private spritesByLabel = new Map<string, PIXI.Container>();
	private vessels = new Map<chemlib.ChemComponent, VesselView>();
	private scaleTextures = new Map<string, PIXI.Texture>();
	private changedVessels = new Map<VesselView, VesselHint | undefined>();
	private cables = new Map<PIXI.Graphics, chemlib.ElectricComponent>();
	private cableRopes = new Map<PIXI.Graphics, CableRope>();
	private cablesDirty = false;
	/** electrode sprites moved along with a vessel since the last save */
	private attachedElectrodesMoved = new Set<PIXI.Container>();
	/** the drawn artboard of each sprite, in world units, for the collision test */
	private footprints = new WeakMap<PIXI.Container, { width: number; height: number }>();

	/** true while a sprite drag is in progress (pointermove listener attached) */
	private _dragActive: boolean = false;
	private _dragMoved = false;
	private dragPointerId: number | undefined;
	/** Stable pointermove handler, so it can be removed again with .off(). */
	private _dragMoveHandler = (event: PIXI.FederatedPointerEvent): void => {
		if (event.pointerId !== this.dragPointerId) return;
		this._dragMoved = true;
		this.updateMousePosition(event);
		const sprite = this.host.dragObject;
		const angle = sprite?.rotation;
		this._dragMove(event);
		if (sprite instanceof VesselView) {
			if (sprite.rotation !== angle) sprite.updateAngle();
		} else if (this.cables.size) this.cablesDirty = true;
		this.drawSelection();
	};
	/** offset from the sprite's origin to the point where it was grabbed, so a
	 * drag keeps that point under the pointer instead of snapping to the centre */
	private _dragOffset: PIXI.Point = new PIXI.Point();

	constructor(host: ChemLab) {
		this.host = host;
		host.addController(this);
	}

	private updateMousePosition(event: PIXI.FederatedPointerEvent): void {
		const world = this.camera.toWorld(event.global.x, event.global.y);
		this.host.mousePos = [world.x, world.y];
	}

	private screenToViewport(x: number, y: number): PIXI.Point {
		const bounds = this.host.app.canvas.getBoundingClientRect();
		const { width, height } = this.host.app.screen;
		return new PIXI.Point(
			bounds.left + x * bounds.width / width,
			bounds.top + y * bounds.height / height
		);
	}

	viewportPoint(x: number, y: number): PIXI.Point {
		const screen = this.camera.toScreen(x, y);
		return this.screenToViewport(screen.x, screen.y);
	}

	worldPointFromViewport(x: number, y: number) {
		const bounds = this.host.app.canvas.getBoundingClientRect();
		if (x < bounds.left || x >= bounds.right || y < bounds.top || y >= bounds.bottom) return;
		const { width, height } = this.host.app.screen;
		return this.camera.toWorld((x - bounds.left) * width / bounds.width, (y - bounds.top) * height / bounds.height);
	}

	componentAtViewport(x: number, y: number): PIXI.Container | undefined {
		const app = this.host.app;
		const bounds = app.canvas.getBoundingClientRect();
		if (x < bounds.left || x >= bounds.right || y < bounds.top || y >= bounds.bottom) return;
		const { events } = app.renderer;
		const point = new PIXI.Point();
		events.mapPositionToPoint(point, x, y);
		return events.rootBoundary.hitTest(point.x, point.y) ?? undefined;
	}

	vesselAtViewport(x: number, y: number): VesselView | undefined {
		const app = this.host.app;
		const bounds = app.canvas.getBoundingClientRect();
		if (x < bounds.left || x >= bounds.right || y < bounds.top || y >= bounds.bottom) return;
		const point = new PIXI.Point();
		app.renderer.events.mapPositionToPoint(point, x, y);
		// Palette drags can reach the canvas without Pixi receiving a pointerdown.
		const pointInVessel = new PIXI.Point();
		for (let i = this.world.children.length - 1; i >= 0; i--) {
			const sprite = this.world.children[i];
			if (!(sprite instanceof VesselView) || !sprite.visible || !(sprite.component._volume > 0)) continue;
			const local = sprite.toLocal(point, undefined, pointInVessel);
			if (sprite.hitArea.contains(local.x, local.y)) return sprite;
		}
	}

	private trackVesselTransfer(event: PIXI.FederatedPointerEvent): VesselView | undefined {
		const source = this.host.dragObject;
		if (!(source instanceof VesselView)) return;
		const { Beaker, Flask, Testtube } = chemlib.ComponentType;
		const type = source.component._type;
		if (type !== Beaker && type !== Flask && type !== Testtube) return;
		const { x, y } = event.global;
		const withinCanvas = x >= 0 && y >= 0 && x < this.camera.width && y < this.camera.height;
		const target = withinCanvas ? this.world.children.find((sprite, index): sprite is VesselView =>
			sprite instanceof VesselView && sprite !== source && sprite.component._inOutLimits[0] > 0 &&
			source.y < sprite.y - Math.min(50, sprite.height) && this._mouseInbounds(index, 50)) : undefined;
		const point = this.screenToViewport(x, y);
		this.host.trackVesselTransfer(source.component, target, point);
		return target;
	}

	zoomBy(factor: number): void {
		if (!this.host.app || this.pointerBusy) return;
		this.camera.zoomAt(factor, this.camera.width / 2, this.camera.height / 2);
		this.applyCamera();
	}

	resetZoom(): void {
		if (!this.host.app || this.pointerBusy) return;
		this.camera.resetZoom();
		this.applyCamera();
	}

	get gridVisible(): boolean {
		return this.showGrid;
	}

	toggleGrid(): void {
		this.showGrid = !this.showGrid;
		if (this.grid) {
			this.grid.mesh.visible = this.showGrid;
			if (this.showGrid) this.grid.update(this.camera);
		}
		this.updateScaleReadouts();
		this.host.requestUpdate();
		this.host.requestCanvasRender();
	}

	snapPosition(x: number, y: number): PIXI.PointData {
		return this.showGrid ? this.camera.snapToGrid(x, y) : { x, y };
	}

	/**
	 * The nearest position to a wanted one at which a sprite does not land on
	 * another component. Used when a component is dropped from the palette, so
	 * a drop never stacks two components on the same place. A spot that also
	 * stays on the standard canvas wins over a nearer one that would leave it.
	 *
	 * @param {PIXI.Container} sprite - the sprite about to be placed
	 * @param {number} x - the wanted world x
	 * @param {number} y - the wanted world y
	 * @returns {PIXI.PointData}
	 */
	freePlacement(sprite: PIXI.Container, x: number, y: number): PIXI.PointData {
		const { width, height } = this.footprintSize(sprite);
		let fallback: PIXI.PointData | undefined;
		for (const [stepX, stepY] of PLACEMENT_OFFSETS) {
			const candidate = { x: x + stepX * width * 0.75, y: y + stepY * height * 0.75 };
			if (this.collidesAt([{ sprite, x: candidate.x, y: candidate.y }])) continue;
			if (this.onCanvas(candidate, width, height)) return candidate;
			fallback ??= candidate;
		}
		return fallback ?? { x, y };
	}

	/**
	 * Whether a box of the given size, centred on a point, lies on the standard
	 * canvas.
	 *
	 * @private
	 * @param {PIXI.PointData} centre - the centre of the box
	 * @param {number} width - the box width
	 * @param {number} height - the box height
	 * @returns {boolean}
	 */
	private onCanvas(centre: PIXI.PointData, width: number, height: number): boolean {
		return centre.x - width / 2 >= 0 && centre.x + width / 2 <= STANDARD_CANVAS_WIDTH
			&& centre.y - height / 2 >= 0 && centre.y + height / 2 <= STANDARD_CANVAS_HEIGHT;
	}

	/**
	 * The drawn size of a sprite in world units. The artboard is recorded when
	 * the view is built, because the bounds of a container also cover the
	 * particles and the pour stream a vessel draws outside its glass.
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the sprite
	 * @returns {{ width: number; height: number }}
	 */
	private footprintSize(sprite: PIXI.Container): { width: number; height: number } {
		return this.footprints.get(sprite) ?? { width: sprite.width, height: sprite.height };
	}

	/**
	 * The component type of a sprite, taken from its label, which is always
	 * `type:id`.
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the sprite
	 * @returns {string}
	 */
	private static spriteType(sprite: PIXI.Container): string {
		const label = sprite.label ?? "";
		const colon = label.indexOf(":");
		return colon < 0 ? label : label.slice(0, colon);
	}

	/**
	 * Whether two sprites are allowed to share the same place. A device that
	 * hangs into a vessel has to overlap it, and a label or a cable is not a
	 * physical object at all.
	 *
	 * @private
	 * @param {PIXI.Container} first - one sprite
	 * @param {PIXI.Container} second - the other sprite
	 * @returns {boolean}
	 */
	private mayOverlap(first: PIXI.Container, second: PIXI.Container): boolean {
		const firstType = CanvasController.spriteType(first);
		const secondType = CanvasController.spriteType(second);
		if (UNBODIED_TYPES.has(firstType) || UNBODIED_TYPES.has(secondType)) return true;
		if (isVesselType(firstType) && DIPPED_TYPES.has(secondType)) return true;
		if (isVesselType(secondType) && DIPPED_TYPES.has(firstType)) return true;
		return false;
	}

	/**
	 * Whether any of the given sprites, placed at the given positions, would
	 * land on a component it may not overlap. The sprites in the list are not
	 * obstacles for each other, so a selection moves as one rigid body.
	 *
	 * @private
	 * @param {readonly { sprite: PIXI.Container; x: number; y: number }[]} moving - the sprites and their wanted positions
	 * @returns {boolean}
	 */
	private collidesAt(moving: readonly { sprite: PIXI.Container; x: number; y: number }[]): boolean {
		const moved = new Set(moving.map(({ sprite }) => sprite));
		const wanted = moving.map(({ sprite, x, y }) => {
			const { width, height } = this.footprintSize(sprite);
			return { sprite, left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
		});
		for (const other of this.world.children) {
			if (moved.has(other) || !other.visible) continue;
			const { width, height } = this.footprintSize(other);
			const left = other.x - width / 2;
			const right = other.x + width / 2;
			const top = other.y - height / 2;
			const bottom = other.y + height / 2;
			for (const box of wanted) {
				if (this.mayOverlap(box.sprite, other)) continue;
				if (box.left < right && box.right > left && box.top < bottom && box.bottom > top) return true;
			}
		}
		return false;
	}

	/**
	 * The offset a set of sprites can really be moved by: the wanted one, else
	 * the same x at the old y, else the old x at the new y, else no movement.
	 * Sliding along one axis is what lets a component be pushed along the side
	 * of another instead of sticking to it.
	 *
	 * @private
	 * @param {readonly PIXI.Container[]} moving - the sprites that travel together
	 * @param {number} dx - the wanted x offset
	 * @param {number} dy - the wanted y offset
	 * @returns {PIXI.PointData}
	 */
	private freeOffset(moving: readonly PIXI.Container[], dx: number, dy: number): PIXI.PointData {
		for (const [stepX, stepY] of [[dx, dy], [dx, 0], [0, dy], [0, 0]]) {
			const wanted = moving.map((sprite) => ({ sprite, x: sprite.x + stepX, y: sprite.y + stepY }));
			if (!this.collidesAt(wanted)) return { x: stepX, y: stepY };
		}
		return { x: 0, y: 0 };
	}

	/**
	 * The sprites that travel with a dragged one: a vessel carries the
	 * electrodes standing in it.
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the dragged sprite
	 * @returns {PIXI.Container[]}
	 */
	private movingWith(sprite: PIXI.Container): PIXI.Container[] {
		if (!(sprite instanceof VesselView)) return [sprite];
		return [sprite, ...this.attachedElectrodesOf(sprite)];
	}

	/**
	 * The electrode sprites standing in a vessel.
	 *
	 * @private
	 * @param {VesselView} vessel - the vessel view
	 * @returns {PIXI.Container[]}
	 */
	private attachedElectrodesOf(vessel: VesselView): PIXI.Container[] {
		const mix = vessel.component._content;
		const found: PIXI.Container[] = [];
		for (const eComp of this.host.allEComponents) {
			if (eComp._type !== chemlib.EComponentType.Electrode || eComp._connectedMix !== mix) continue;
			const electrode = this.spritesByLabel.get(`${eComp._type}:${eComp._id}`);
			if (electrode) found.push(electrode);
		}
		return found;
	}

	fitObjects(): void {
		if (!this.host.app || this.pointerBusy || !this.world.children.length) return;
		this.camera.fit(this.world.getLocalBounds(), this.host.canvasZoom.offsetHeight + 4);
		this.applyCamera();
	}

	private zoomFromWheel = (event: WheelEvent): void => {
		if (!event.deltaY || this.pointerBusy) return;
		const bounds = this.host.app.canvas.getBoundingClientRect();
		if (!bounds.width || !bounds.height) return;
		event.preventDefault();
		const x = (event.clientX - bounds.left) * this.camera.width / bounds.width;
		const y = (event.clientY - bounds.top) * this.camera.height / bounds.height;
		const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.camera.height : 1);
		this.camera.zoomAt(Math.exp(Math.max(-1, Math.min(1, -pixels * 0.002))), x, y);
		this.applyCamera();
	};

	get selectedObjects(): readonly PIXI.Container[] {
		return this.selection;
	}

	get pointerBusy(): boolean {
		return !!(this._dragActive || this.pan || this.pinching || this.marquee || this.groupDrag || this.host.draggingPalette);
	}

	clearGroupSelection(): void {
		if (!this.selection.length) return;
		if (this.groupDrag) this.cancelPointerInteraction();
		this.selection = [];
		this.drawSelection();
		this.host.requestUpdate();
	}

	private selectionRectangle(): PIXI.Rectangle | undefined {
		const { start, end } = this.marquee ?? {};
		if (!end) return;
		return new PIXI.Rectangle(Math.min(start.x, end.x), Math.min(start.y, end.y),
			Math.abs(end.x - start.x), Math.abs(end.y - start.y));
	}

	drawSelection(): void {
		this.selectionOverlay.clear();
		const transferTarget = this.host.transferTarget;
		if (transferTarget) {
			const { x, y, width, height } = transferTarget.getBounds();
			this.selectionOverlay.rect(x - 2, y - 2, width + 4, height + 4)
				.stroke({ color: 0x0284c7, width: 1.5 });
		}
		const groupSelected = this.selection.length > 0;
		const single = this.host.selectedObjectSprite;
		const sprites = groupSelected ? this.selection : single ? [single] : [];
		const movingObjects = (this._dragActive && this._dragMoved) || this.groupDrag?.moved;
		const visibleBounds = new PIXI.Bounds();
		const { width: canvasWidth, height: canvasHeight } = this.camera;
		for (const sprite of sprites) {
			const bounds = sprite.getBounds();
			const { x, y, width, height } = bounds;
			this.selectionOverlay.rect(x - 2, y - 2, width + 4, height + 4)
				.stroke({ color: 0x0284c7, width: 1.5 });
			if (!movingObjects && bounds.maxX > 0 && bounds.maxY > 0 && bounds.minX < canvasWidth && bounds.minY < canvasHeight) {
				visibleBounds.addBounds(bounds);
			}
		}
		const rect = this.selectionRectangle();
		if (rect) {
			this.selectionOverlay.rect(rect.x, rect.y, rect.width, rect.height)
				.fill({ color: 0x0284c7, alpha: 0.14 }).stroke({ color: 0x0284c7, width: 1 });
		}
		this.host.positionSelectionSummary(visibleBounds.isValid ? visibleBounds : undefined, canvasWidth, canvasHeight, groupSelected);
		this.host.positionAmountMenu();
		this.host.requestCanvasRender();
	}

	private moveMarquee(event: PIXI.FederatedPointerEvent): void {
		if (this.marquee?.id !== event.pointerId) return;
		const { x, y } = event.global;
		const { start, end } = this.marquee;
		if (!end && Math.hypot(x - start.x, y - start.y) < 5) return;
		this.marquee.end = { x: Math.max(0, Math.min(x, this.camera.width)), y: Math.max(0, Math.min(y, this.camera.height)) };
		this.drawSelection();
	}

	private finishMarquee(event: PIXI.FederatedPointerEvent): void {
		this.moveMarquee(event);
		const rect = this.selectionRectangle();
		this.marquee = undefined;
		if (!rect) {
			this.host.clearObjectSelection();
			return;
		}
		const selected = this.world.children.filter((sprite) => {
			if (sprite.label.startsWith("cable:")) {
				// Cables are dynamic links, not selectable objects: they redraw
				// from their connected components and can only be removed by
				// deleting a connected device.
				return false;
			}
			const bounds = sprite.getBounds();
			return bounds.minX <= rect.right && bounds.maxX >= rect.left && bounds.minY <= rect.bottom && bounds.maxY >= rect.top;
		});
		this.host.clearObjectSelection();
		this.selection = selected;
		this.drawSelection();
		this.host.requestUpdate();
	}

	private moveGroup(event: PIXI.FederatedPointerEvent): void {
		const drag = this.groupDrag;
		if (!drag || drag.id !== event.pointerId) return;
		const current = this.camera.toWorld(event.global.x, event.global.y);
		const dx = current.x - drag.origin.x;
		const dy = current.y - drag.origin.y;
		if (!drag.moved && dx === 0 && dy === 0) return;
		drag.moved = true;
		const anchor = this.snapPosition(drag.anchor.x + dx, drag.anchor.y + dy);
		const wantedX = anchor.x - drag.anchor.x;
		const wantedY = anchor.y - drag.anchor.y;
		const moving = this.groupMoving(drag.items);
		const step = this.freeOffset(moving, wantedX - drag.offset.x, wantedY - drag.offset.y);
		if (!step.x && !step.y) return;
		drag.offset = { x: drag.offset.x + step.x, y: drag.offset.y + step.y };
		const selected = new Set(drag.items.map(({ sprite }) => sprite));
		for (const sprite of moving) {
			sprite.position.set(sprite.x + step.x, sprite.y + step.y);
			// Electrodes carried along by their vessel still have to be saved.
			if (!selected.has(sprite)) this.attachedElectrodesMoved.add(sprite);
			if (this.cables.size && !(sprite instanceof VesselView)) this.cablesDirty = true;
		}
		this.drawSelection();
	}

	/**
	 * The sprites a group drag has to move: the selected ones and the
	 * electrodes standing in a selected vessel. Each sprite appears once, so a
	 * selected electrode that also stands in a selected vessel is not moved
	 * twice.
	 *
	 * @private
	 * @param {readonly { sprite: PIXI.Container }[]} items - the selected sprites
	 * @returns {PIXI.Container[]}
	 */
	private groupMoving(items: readonly { sprite: PIXI.Container }[]): PIXI.Container[] {
		const moving = new Set(items.map(({ sprite }) => sprite));
		for (const { sprite } of items) {
			if (!(sprite instanceof VesselView)) continue;
			for (const electrode of this.attachedElectrodesOf(sprite)) moving.add(electrode);
		}
		return [...moving];
	}

	private observeTouches(): void {
		const view = this.host.ownerDocument.defaultView;
		if (this.touchListeners || !this.host.app || !this.host.isConnected || !view) return;
		this.touchListeners = new AbortController();
		const { signal } = this.touchListeners;
		// Observe the second touch before Pixi dispatches its pointerdown to a sprite.
		const options = { capture: true, signal };
		view.addEventListener("pointerdown", this.touchDown, options);
		view.addEventListener("pointermove", this.touchMove, options);
		view.addEventListener("pointerup", this.touchEnd, options);
		view.addEventListener("pointercancel", this.touchEnd, options);
		view.addEventListener("blur", () => {
			if (this.pointerBusy) this.cancelPointerInteraction();
			this.resetTouches();
		}, { signal });
	}

	private touchDown = (event: PointerEvent): void => {
		if (event.pointerType !== "touch" || !event.composedPath().includes(this.host.app.canvas)) return;
		this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (this.pinching || this.touches.size < 2) return;
		this.pinching = true;
		const sprite = this.host.dragObject;
		if (this._dragMoved && sprite) {
			sprite.rotation = 0;
			if (sprite instanceof VesselView) sprite.updateAngle();
			this.host.saveComponentPosition(sprite);
		}
		this.cancelPointerInteraction();
		this.host.cancelDoseForNavigation();
	};

	private touchMove = (event: PointerEvent): void => {
		const previous = this.touches.get(event.pointerId);
		if (!previous || (previous.x === event.clientX && previous.y === event.clientY)) return;
		const current = { x: event.clientX, y: event.clientY };
		this.touches.set(event.pointerId, current);
		if (this.touches.size < 2) return;
		const [first, second] = this.touches.values();
		if (current !== first && current !== second) return;
		const other = current === first ? second : first;
		const bounds = this.host.app.canvas.getBoundingClientRect();
		if (!bounds.width || !bounds.height) return;
		const scaleX = this.camera.width / bounds.width;
		const scaleY = this.camera.height / bounds.height;
		const previousDistance = Math.hypot((previous.x - other.x) * scaleX, (previous.y - other.y) * scaleY);
		const currentDistance = Math.hypot((current.x - other.x) * scaleX, (current.y - other.y) * scaleY);
		const x = ((previous.x + other.x) / 2 - bounds.left) * scaleX;
		const y = ((previous.y + other.y) / 2 - bounds.top) * scaleY;
		// The midpoint follows the fingers even at the zoom limits.
		this.camera.zoomAt(Math.max(4, currentDistance) / Math.max(4, previousDistance), x, y);
		this.camera.panBy((current.x - previous.x) * scaleX / 2, (current.y - previous.y) * scaleY / 2);
		this.applyCamera();
	};

	private touchEnd = (event: PointerEvent): void => {
		if (this.touches.delete(event.pointerId) && this.touches.size === 0) this.pinching = false;
		if (event.type === "pointercancel" && (this.pan?.id === event.pointerId || this.dragPointerId === event.pointerId ||
			this.marquee?.id === event.pointerId || this.groupDrag?.id === event.pointerId)) {
			this.cancelPointerInteraction();
		}
	};

	private resetTouches(): void {
		this.touches.clear();
		this.pinching = false;
	}

	private applyCamera(): void {
		this.world.position.set(this.camera.offsetX, this.camera.offsetY);
		this.world.scale.set(this.camera.zoom);
		this.placementPreviewLayer.position.copyFrom(this.world.position);
		this.placementPreviewLayer.scale.copyFrom(this.world.scale);
		this.wireLayer.position.copyFrom(this.world.position);
		this.wireLayer.scale.copyFrom(this.world.scale);
		if (this.showGrid) this.grid?.update(this.camera);
		this.updateScaleReadouts();
		if (this.selection.length || this.marquee || this.host.selectedObjectSprite) this.drawSelection();
		else this.host.positionAmountMenu();
		this.host.requestCanvasRender();
	}

	updateScaleReadouts(): void {
		const { zoom, gridCellWidth } = this.camera;
		this.host.updateZoomLabel(zoom);
		if (this.showGrid) this.host.updateGridScale(gridCellWidth * zoom, gridCellWidth * MILLIMETERS_PER_WORLD_UNIT);
	}

	private observeCanvas(): void {
		if (this.resizeObserver || !this.host.app || !this.host.isConnected) return;
		const area = this.host.canvasArea;
		const app = this.host.app;
		const resize = () => {
			const width = area.clientWidth;
			const height = area.clientHeight;
			if (width < 1 || height < 1) return;
			const resolution = Math.max(1, Math.min(2, this.host.ownerDocument.defaultView.devicePixelRatio));
			if (app.screen.width !== width || app.screen.height !== height || app.renderer.resolution !== resolution) {
				app.renderer.resize(width, height, resolution);
				app.stage.hitArea = app.screen;
				// A resized backing store stays blank until the next render,
				// so paint synchronously instead of waiting for the idle ticker.
				app.render();
			}
			this.camera.resize(width, height);
			this.applyCamera();
		};
		this.resizeObserver = new ResizeObserver(resize);
		this.resizeObserver.observe(area);
		resize();
	}

	private beginPan(event: PIXI.FederatedPointerEvent, deselectOnTap = false): void {
		if (this.pan) return;
		if (event.button === 1) event.preventDefault();
		this.pan = {
			id: event.pointerId, x: event.global.x, y: event.global.y,
			moved: false, deselectOnTap,
		};
	}

	private movePan(event: PIXI.FederatedPointerEvent): void {
		const pan = this.pan;
		if (!pan || pan.id !== event.pointerId) return;
		const dx = event.global.x - pan.x;
		const dy = event.global.y - pan.y;
		if (!pan.moved && Math.hypot(dx, dy) < 5) return;
		pan.moved = true;
		pan.x = event.global.x;
		pan.y = event.global.y;
		this.camera.panBy(dx, dy);
		this.applyCamera();
		this.updateMousePosition(event);
	}

	hostConnected(): void {
		this.observeCanvas();
		this.observeTouches();
	}

	hostDisconnected(): void {
		this.cancelPointerInteraction();
		this.touchListeners?.abort();
		this.touchListeners = undefined;
		this.resetTouches();
		this.resizeObserver?.disconnect();
		this.resizeObserver = undefined;
	}

	cancelVesselDrag(): void {
		if (this._dragActive && this.host.dragObject instanceof VesselView) this.cancelPointerInteraction();
	}

	private cancelPointerInteraction(): void {
		if (this._dragActive) this.host.finishDragTransfer();
		const sprite = this.host.dragObject;
		if (this._dragActive && sprite instanceof VesselView) {
			sprite.rotation = 0;
			sprite.updateAngle();
		}
		const redrawSelection = (this._dragActive && this._dragMoved) || this.groupDrag || this.marquee;
		this.host.app?.stage.off("globalpointermove", this._dragMoveHandler);
		if (this.wire) {
			this.host.app?.stage.off("globalpointermove", this._wireMoveHandler);
			this.wire = undefined;
			this.wireGraphics.clear();
			this.clearPorts();
		}
		this._dragActive = false;
		this.dragPointerId = undefined;
		this.pan = undefined;
		this.host.dragObject = undefined;
		const items = this.groupDrag?.items ?? [];
		const selected = new Set(items.map(({ sprite }) => sprite));
		for (const { sprite, x, y } of items) {
			const dx = sprite.x - x;
			const dy = sprite.y - y;
			sprite.position.set(x, y);
			// The electrodes a vessel carried along have to go back with it.
			if (sprite instanceof VesselView && (dx || dy)) {
				for (const electrode of this.attachedElectrodesOf(sprite)) {
					if (!selected.has(electrode)) electrode.position.set(electrode.x - dx, electrode.y - dy);
				}
			}
			if (this.cables.size && !(sprite instanceof VesselView)) this.cablesDirty = true;
		}
		if (this.groupDrag) this.attachedElectrodesMoved.clear();
		this.groupDrag = undefined;
		this.marquee = undefined;
		if (redrawSelection) this.drawSelection();
	}

	removeSprite(sprite: PIXI.Container): void {
		if (this._dragActive && this.host.dragObject === sprite) this.cancelPointerInteraction();
		if (this.selection.includes(sprite)) {
			if (this.groupDrag) this.cancelPointerInteraction();
			this.selection = this.selection.filter((selected) => selected !== sprite);
			this.drawSelection();
			this.host.requestUpdate();
		}
		this.world.removeChild(sprite);
		this.spritesByLabel.delete(sprite.label);
		if (sprite instanceof VesselView) {
			this.vessels.delete(sprite.component);
			this.changedVessels.delete(sprite);
		}
		this.cables.delete(sprite as PIXI.Graphics);
		this.cableRopes.delete(sprite as PIXI.Graphics);
		this.attachedElectrodesMoved.delete(sprite);
		sprite.destroy({ children: true });
		this.host.requestCanvasRender();
	}

	clearSprites(): void {
		this.cancelPointerInteraction();
		this.clearGroupSelection();
		for (const sprite of [...this.world.children]) this.removeSprite(sprite);
	}

	setDeviceActive(component: chemlib.ElectricComponent, active: boolean): void {
		const view = this.spritesByLabel.get(`${component._type}:${component._id}`);
		if (!(view instanceof ElectricDeviceView)) return;
		view.setActive(active);
		this.host.requestCanvasRender();
	}

	refreshDeviceDisplay(component: chemlib.ElectricComponent): void {
		const view = this.spritesByLabel.get(`${component._type}:${component._id}`);
		if (view instanceof ElectricDeviceView && view.refresh()) this.host.requestCanvasRender();
	}
	private createComponentView(component: chemlib.ChemComponent | chemlib.ElectricComponent): PIXI.Container {
		const type = component._type;
		const capacityMl = component instanceof chemlib.ChemComponent ? component._volume : undefined;
		const variantId = component instanceof chemlib.ElectricComponent ? component._variantId : undefined;
		const graphic = componentGraphic(type, variantId);
		const texture = PIXI.Assets.get<PIXI.Texture>(graphic.url);
		const [widthMm, heightMm] = componentArtboardMm(type, capacityMl, variantId);
		const width = widthMm / MILLIMETERS_PER_WORLD_UNIT;
		const height = heightMm / MILLIMETERS_PER_WORLD_UNIT;
		const sprite = component instanceof chemlib.ChemComponent && isVesselType(type)
			? new VesselView(component, type, texture, width, height, this.scaleTextures)
			: component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable
				// Cables render as rope polylines and carry no texture.
				? new PIXI.Graphics()
				: component instanceof chemlib.ElectricComponent
					? new ElectricDeviceView(component, texture, width, height)
					: new PIXI.Sprite({ texture, width, height, anchor: 0.5 });
		this.footprints.set(sprite, { width, height });
		return sprite;
	}

	createPlacementPreview(component: chemlib.ChemComponent | chemlib.ElectricComponent): PIXI.Container {
		const preview = this.createComponentView(component);
		// The collision test reads the type off the label, so a preview has to
		// carry one too, or a dropped electrode would be refused by its vessel.
		preview.label = `${component._type}:${component._id}`;
		preview.alpha = 0.5;
		preview.visible = false;
		this.placementPreviewLayer.addChild(preview);
		return preview;
	}

	addComponentView(component: chemlib.ChemComponent | chemlib.ElectricComponent, select = true): PIXI.Container {
		const type = component._type;
		const info = `${type}:${component._id}`;
		const sprite = this.createComponentView(component);

		const isCable = component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable;
		// Cables draw in world coordinates and carry their own transform at (0,0).
		if (!isCable) {
			sprite.x = this.host.mousePos[0];
			sprite.y = this.host.mousePos[1];
		}
		// A cable is a thin rope, so it gets a hit area that follows the drawn
		// polyline instead of the bounding box, which would swallow the canvas.
		sprite.eventMode = "static";
		if (isCable) (sprite as PIXI.Graphics).hitArea = this.cableHitArea(sprite as PIXI.Graphics);
		sprite.cursor = "pointer";
		sprite.on("pointerdown", (event) => {
			event.stopPropagation();
			if (this.pointerBusy) return;
			if (event.button === 1) {
				this.beginPan(event);
				return;
			}
			this.updateMousePosition(event);
			if (event.button === 0) this.host.closeAmountMenu();
			if (event.button === 2) return;
			// Pressing on a free terminal starts a wire instead of moving the
			// device, which is what makes connecting a single gesture.
			if (event.button === 0 && this.beginWire(sprite, event)) return;
			if (event.button === 0 && this.selection.includes(sprite)) {
				const items = this.selection.filter((item) => !item.label.startsWith("cable:"))
					.map((item) => ({ sprite: item, x: item.x, y: item.y }));
				const anchor = items.find((item) => item.sprite === sprite) ?? items[0];
				if (anchor) this.groupDrag = {
					id: event.pointerId, origin: this.camera.toWorld(event.global.x, event.global.y), anchor, items, moved: false,
					offset: { x: 0, y: 0 },
				};
				return;
			}
			if (event.button === 0 && this.host.beginChemicalDose(sprite, event.pointerId)) return;
			const drag = event.button === 0 && !sprite.label.startsWith("cable:");
			this.host._getObject(sprite);
			this.host.reportXApi("focused", sprite.label);
			if (drag) this._dragStart(sprite, event);
		});

		sprite.label = info;
		this.world.addChild(sprite);
		this.spritesByLabel.set(info, sprite);
		if (sprite instanceof VesselView) {
			this.vessels.set(sprite.component, sprite);
			this.changedVessels.set(sprite, undefined);
		}
		if (component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable) {
			this.cables.set(sprite as PIXI.Graphics, component);
			this.cableRopes.delete(sprite as PIXI.Graphics);
			this.cablesDirty = true;
		} else if (this.cables.size && !(sprite instanceof VesselView)) {
			// A new device lands on top of the world, so the cables have to be
			// raised above it again.
			this.cablesDirty = true;
		}
		if (select && !sprite.label.includes("cable")) {
			this.host._getObject(sprite);
		}
		this.host.reportXApi("inserted", sprite.label);
		this.host.requestCanvasRender();
		return sprite;
	}

	/**
	 * A hit area that follows the drawn rope of a cable. The bounding box of a
	 * sagging cable covers a large part of the canvas, so a click would land on
	 * the cable instead of on the device behind it.
	 *
	 * @private
	 * @param {PIXI.Graphics} sprite - the cable sprite
	 * @returns {PIXI.IHitArea}
	 */
	private cableHitArea(sprite: PIXI.Graphics): PIXI.IHitArea {
		return {
			contains: (x: number, y: number): boolean => {
				const rope = this.cableRopes.get(sprite);
				if (!rope) return false;
				const reach = 3;
				for (let index = 1; index < rope.points.length; index++) {
					const a = rope.points[index - 1];
					const b = rope.points[index];
					const dx = b.x - a.x;
					const dy = b.y - a.y;
					const lengthSquared = dx * dx + dy * dy;
					const t = lengthSquared > 0
						? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared))
						: 0;
					if (Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)) <= reach) return true;
				}
				return false;
			},
		};
	}

	/**
	 * The device whose drawn area contains a point in world coordinates. The
	 * topmost one wins, so a device lying over another is the one that answers.
	 *
	 * @private
	 * @param {number} x - world-space x
	 * @param {number} y - world-space y
	 * @returns {?{ device: chemlib.ElectricComponent; sprite: ElectricDeviceView }}
	 */
	private deviceAtWorld(x: number, y: number): { device: chemlib.ElectricComponent; sprite: ElectricDeviceView } | undefined {
		for (let index = this.world.children.length - 1; index >= 0; index--) {
			const sprite = this.world.children[index];
			if (!(sprite instanceof ElectricDeviceView) || !sprite.visible) continue;
			if (Math.abs(x - sprite.x) > sprite.width / 2 || Math.abs(y - sprite.y) > sprite.height / 2) continue;
			const device = this.host.allEComponents.find((component) => `${component._type}:${component._id}` === sprite.label);
			if (device) return { device, sprite };
		}
		return undefined;
	}

	/**
	 * The world position of one terminal of a device. Devices are drawn without
	 * rotation or scale, so the local offset of the terminal is also its world
	 * offset from the sprite centre.
	 *
	 * @private
	 * @param {ElectricDeviceView} sprite - the device view
	 * @param {number} terminal - the terminal index
	 * @returns {?PIXI.PointData}
	 */
	private portWorld(sprite: ElectricDeviceView, terminal: number): PIXI.PointData | undefined {
		const point = sprite.terminalPoint(terminal);
		return point ? { x: sprite.x + point.x, y: sprite.y + point.y } : undefined;
	}

	/**
	 * Starts a connection drag when the pointer went down on a free terminal of
	 * a device. Returns whether the press was consumed, so the caller can skip
	 * the device drag.
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the pressed sprite
	 * @param {PIXI.FederatedPointerEvent} event - the press
	 * @returns {boolean}
	 */
	private beginWire(sprite: PIXI.Container, event: PIXI.FederatedPointerEvent): boolean {
		if (!(sprite instanceof ElectricDeviceView)) return false;
		const device = this.host.allEComponents.find((component) => `${component._type}:${component._id}` === sprite.label);
		if (!device) return false;
		const free = device.freeTerminals;
		if (!free.length) return false;
		const local = sprite.toLocal(event.global);
		const terminal = sprite.portAt(local.x, local.y);
		if (terminal < 0 || !free.includes(terminal)) return false;
		this.wire = { id: event.pointerId, from: device, terminal, sprite };
		sprite.showPorts(terminal);
		this.host.app.stage.on("globalpointermove", this._wireMoveHandler);
		this.drawWire(event.global);
		return true;
	}

	/** Stable pointermove handler of a connection drag, so it can be removed. */
	private _wireMoveHandler = (event: PIXI.FederatedPointerEvent): void => {
		if (event.pointerId !== this.wire?.id) return;
		this.updateMousePosition(event);
		this.drawWire(event.global);
	};

	/**
	 * Draws the rubber band of a connection drag and marks the terminal it
	 * would land on. The band turns blue over a device that accepts it, so the
	 * drop target is visible before the release.
	 *
	 * @private
	 * @param {PIXI.PointData} global - the pointer in stage coordinates
	 */
	private drawWire(global: PIXI.PointData): void {
		const wire = this.wire;
		const graphics = this.wireGraphics;
		graphics.clear();
		if (!wire) return;
		const start = this.portWorld(wire.sprite, wire.terminal);
		if (!start) return;
		const end = this.camera.toWorld(global.x, global.y);
		const target = this.deviceAtWorld(end.x, end.y);
		const accepts = !!target && target.device !== wire.from && chemlib.canConnect(wire.from, target.device);
		graphics.moveTo(start.x, start.y).lineTo(end.x, end.y)
			.stroke({ color: accepts ? 0x0284c7 : 0x64748b, width: 1.2, alpha: 0.9 });
		graphics.circle(start.x, start.y, 1.4).fill(0x0284c7);
		graphics.circle(end.x, end.y, accepts ? 2.2 : 1.4)
			.fill({ color: accepts ? 0x0284c7 : 0x94a3b8, alpha: 0.9 });
		this.updatePorts(global);
	}

	/**
	 * Ends a connection drag. Releasing over a device wires the two together,
	 * releasing anywhere else cancels without a message: a stray release is not
	 * an error worth reporting.
	 *
	 * @private
	 * @param {PIXI.FederatedPointerEvent} event - the release
	 */
	private finishWire(event: PIXI.FederatedPointerEvent): void {
		const wire = this.wire;
		this.wire = undefined;
		this.host.app.stage.off("globalpointermove", this._wireMoveHandler);
		this.wireGraphics.clear();
		wire?.sprite.hidePorts();
		this.clearPorts();
		if (!wire) return;
		const point = this.camera.toWorld(event.global.x, event.global.y);
		const target = this.deviceAtWorld(point.x, point.y);
		if (!target || target.device === wire.from) return;
		const local = target.sprite.toLocal(event.global);
		const terminal = target.sprite.portAt(local.x, local.y);
		this.host.connectElectrical(wire.from, target.device, wire.terminal, terminal >= 0 ? terminal : undefined);
	}

	/**
	 * Marks the terminal a dragged cable would land on, and brightens the free
	 * plugs of the device under the pointer. The markers themselves are part of
	 * the device and stay visible either way.
	 *
	 * @private
	 * @param {PIXI.PointData} global - the pointer in stage coordinates
	 */
	private updatePorts(global: PIXI.PointData): void {
		const world = this.camera.toWorld(global.x, global.y);
		const target = this.deviceAtWorld(world.x, world.y);
		const wire = this.wire;
		if (wire) {
			const sprite = target && target.device !== wire.from ? target.sprite : undefined;
			if (sprite !== this.wireTarget) {
				this.wireTarget?.hidePorts();
				this.wireTarget = sprite;
			}
			if (sprite && target) {
				const local = sprite.toLocal(new PIXI.Point(global.x, global.y));
				sprite.showPorts(sprite.portAt(local.x, local.y));
			}
			return;
		}
		const sprite = target?.sprite;
		if (sprite === this.hoveredPorts) return;
		this.hoveredPorts?.setPortHover(false);
		this.hoveredPorts = sprite;
		sprite?.setPortHover(true);
	}

	/**
	 * Drops the target emphasis and the hover emphasis again.
	 *
	 * @private
	 */
	private clearPorts(): void {
		this.hoveredPorts?.setPortHover(false);
		this.hoveredPorts = undefined;
		this.wireTarget?.hidePorts();
		this.wireTarget = undefined;
	}

	/**
	 * modifies sprite events when an object gets dragged
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the dragged sprite
	 */
	_dragStart(sprite: PIXI.Container, event: PIXI.FederatedPointerEvent): void {
		this._dragMoved = false;
		this.dragPointerId = event.pointerId;
		this.host.dragObject = sprite;
		this._dragActive = true;
		// remember where inside the sprite it was grabbed, so it doesn't jump
		const local = sprite.parent.toLocal(event.global);
		this._dragOffset.set(sprite.x - local.x, sprite.y - local.y);
		this.host.app.stage.on("globalpointermove", this._dragMoveHandler);
	}

	/**
	 * custom drag event for sprites, handles interaction behaviour
	 *
	 * @private
	 * @param {*} event - the drag event data
	 */
	_dragMove(event): void {
		if (this.host.dragObject) {
			// move so the grabbed point stays under the pointer (offset preserved)
			const local = this.host.dragObject.parent.toLocal(event.global);
			const position = this.snapPosition(
				local.x + this._dragOffset.x,
				local.y + this._dragOffset.y
			);
			const dx = position.x - this.host.dragObject.x;
			const dy = position.y - this.host.dragObject.y;
			const moving = this.movingWith(this.host.dragObject);
			const offset = this.freeOffset(moving, dx, dy);
			if (offset.x || offset.y) {
				for (const sprite of moving) {
					sprite.position.set(sprite.x + offset.x, sprite.y + offset.y);
					// Electrodes carried along by their vessel still have to be saved.
					if (sprite !== this.host.dragObject) this.attachedElectrodesMoved.add(sprite);
				}
				if (this.cables.size) this.cablesDirty = true;
			}

			const transferTarget = this.trackVesselTransfer(event);
			if (this.host.dragObject instanceof VesselView) {
				this.host.dragObject.rotation = transferTarget
					? (this.host.dragObject.x > transferTarget.x ? -0.35 : 0.35) : 0;
				return;
			}
		}
	}

	/**
	 * function to be called when a sprite is placed. Handles interactions
	 *
	 * @private
	 * @returns {void}
	 */
	_dragEnd(event: PIXI.FederatedPointerEvent): void {
		if (!this._dragActive) return;
		this.host.app.stage.off("globalpointermove", this._dragMoveHandler);
		this._dragActive = false;
		this.dragPointerId = undefined;
		if (!this._dragMoved || !this.host.dragObject) {
			this.host.dragObject = undefined;
			return;
		}
		const dragged = this.host.dragObject;
		this.updateMousePosition(event);
		this.trackVesselTransfer(event);
		this.host.finishDragTransfer(true);
		if (dragged instanceof VesselView) {
			dragged.rotation = 0;
			dragged.updateAngle();
		}
		this.drawSelection();
		this.relengthCablesAttachedTo([dragged]);
		// A bridge or a gas collection tube has no cable, so where it was put
		// decides which vessel it acts on.
		const draggedDevice = this.host.allEComponents.find((component) =>
			`${component._type}:${component._id}` === dragged.label);
		if (draggedDevice) this.attachDevice(draggedDevice, dragged);
		// Moving a vessel changes what the devices around it sit in, so the
		// whole set is re-evaluated and not only the dragged sprite.
		if (dragged instanceof VesselView) this.attachDevices();
		const movedElectrodes = [...this.attachedElectrodesMoved];
		this.attachedElectrodesMoved.clear();
		if (this.host.dragObject) this.host.saveComponentPositions([this.host.dragObject, ...movedElectrodes]);
		this.host.dragObject = undefined;
	}

	/**
	 * tints a sprite with a color
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the sprite to be tinted
	 * @param {number} color - the selected color
	 */
	_tintSprite(sprite: PIXI.Container, color: number): void {
		if (sprite.tint === color) return;
		sprite.tint = color;
		this.host.requestCanvasRender();
	}

	/**
	 * checks, if the mouse is within the specified borders around a sprite
	 *
	 * @private
	 * @param {number} index - the index of the sprite
	 * @param {number} offset - an added offset between the sprite and the border
	 * @returns {boolean}
	 */
	_mouseInbounds(index: number, offset: number): boolean {
		if (this.world.children.length === 1) {
			return false;
		}
		if (this.world.children[index].label.startsWith("cable:")) {
			return false;
		}
		let objWidth: number = this.world.children[index].width;
		let objHeight: number = this.world.children[index].height;
		let objX: number = this.world.children[index].x - 0.5 * objWidth;
		let objY: number = this.world.children[index].y - 0.5 * objHeight;

		return (
			this.host.mousePos[0] > objX - offset &&
			this.host.mousePos[0] < objWidth + objX + offset &&
			this.host.mousePos[1] > objY - offset &&
			this.host.mousePos[1] < objHeight + objY + offset
		);
	}

	/**
	 * initializes the canvas and its events
	 *
	 * @private
	 */
	async init(): Promise<void> {
		const app = new PIXI.Application<PIXI.WebGLRenderer<HTMLCanvasElement>>();
		await app.init({
			preference: ["webgl"],
			autoStart: false,
			backgroundAlpha: 0,
			width: STANDARD_CANVAS_WIDTH,
			height: STANDARD_CANVAS_HEIGHT,
		});
		try {
			await PIXI.Assets.load(componentTextureUrls.map((src) => ({
				src,
				// Filter the SVG textures when zooming out, including narrow sprites
				// whose horizontal and vertical scales differ substantially.
				data: { resolution: 2, scaleMode: "linear", autoGenerateMipmaps: true, maxAnisotropy: 4 },
			})));
		} catch (error) {
			app.destroy(true, { children: true });
			throw error;
		}
		this.host.app = app;
		this.host.pix_canvas.appendChild(app.canvas);
		app.canvas.tabIndex = 0;
		app.canvas.addEventListener("pointerdown", (event) => {
			if (event.button === 0) app.canvas.focus({ preventScroll: true });
		});
		this.host.app.stage.eventMode = "static";
		this.host.app.stage.hitArea = this.host.app.screen;
		this.grid = new WorkspaceGrid();
		this.grid.mesh.visible = this.showGrid;
		this.wireLayer.addChild(this.wireGraphics);
		app.stage.addChild(this.grid.mesh, this.world, this.wireLayer, this.placementPreviewLayer, this.selectionOverlay);
		app.canvas.addEventListener("contextmenu", (event) => {
			if (this.pointerBusy) {
				event.preventDefault();
				return;
			}
			const target = this.componentAtViewport(event.clientX, event.clientY);
			if (target && this.host.openChemicalAmountMenu(target)) event.preventDefault();
		});
		app.canvas.addEventListener("wheel", this.zoomFromWheel, { passive: false });
		this.observeCanvas();
		this.observeTouches();
		this.applyCamera();
		this.bindPointerEvents(app.stage);
	}

	private bindPointerEvents(stage: PIXI.Container): void {
		// pointermove (not mousemove) so mousePos stays current for touch too.
		// A drag is ended only on pointerup/pointerupoutside — not when the
		// pointer briefly leaves the sprite bounds during a fast drag.
		stage.on("pointermove", (event) => {
			this.updateMousePosition(event);
			this.updatePorts(event.global);
		});
		stage.on("globalpointermove", (event) => {
			this.movePan(event);
			this.moveMarquee(event);
			this.moveGroup(event);
		});
		stage.on("pointerdown", (event) => {
			if (this.pointerBusy) return;
			this.updateMousePosition(event);
			if (event.button === 1) {
				this.beginPan(event);
			} else if (event.target === stage && event.button === 0) {
				const { x, y } = event.global;
				if (event.pointerType === "mouse" && event.altKey) {
					this.marquee = { id: event.pointerId, start: { x, y } };
					return;
				}
				if (event.pointerType !== "touch" && this.host.placeSelectedComponent(this.host.mousePos[0], this.host.mousePos[1])) return;
				this.beginPan(event, true);
			}
		});
		const finishPointer = (event: PIXI.FederatedPointerEvent) => {
			if (this.wire?.id === event.pointerId) {
				this.finishWire(event);
			} else if (this.marquee?.id === event.pointerId) {
				this.finishMarquee(event);
			} else if (this.groupDrag?.id === event.pointerId) {
				this.moveGroup(event);
				const drag = this.groupDrag;
				this.groupDrag = undefined;
				if (drag.moved) {
					this.drawSelection();
					this.relengthCablesAttachedTo(drag.items.map(({ sprite }) => sprite));
					const movedElectrodes = [...this.attachedElectrodesMoved];
					this.attachedElectrodesMoved.clear();
					this.host.saveComponentPositions([
						...drag.items.map(({ sprite }) => sprite),
						...movedElectrodes,
					]);
				}
			} else if (this.pan?.id === event.pointerId) {
				const { moved, deselectOnTap } = this.pan;
				this.pan = undefined;
				if (deselectOnTap && !moved) {
					if (event.pointerType === "touch" && event.type === "pointerup" && event.target === stage) {
						this.updateMousePosition(event);
						if (this.host.placeSelectedComponent(this.host.mousePos[0], this.host.mousePos[1])) return;
					}
					this.host.clearChemicalSelection();
					this.host.clearObjectSelection();
				}
			} else if (this._dragActive && event.pointerId === this.dragPointerId) {
				this._dragEnd(event);
			}
		};
		stage.on("pointerup", finishPointer);
		stage.on("pointerupoutside", finishPointer);
	}

	markVesselChanged(component: chemlib.ChemComponent, hint?: VesselHint): void {
		const view = this.vessels.get(component);
		if (!view) return;
		this.changedVessels.set(view, hint ?? this.changedVessels.get(view));
		this.host.requestCanvasRender();
	}

	flushChanges(): void {
		const changed = [...this.changedVessels.keys()].map((view) => view.component._content);
		for (const [view, hint] of this.changedVessels) view.updateContents(hint);
		this.changedVessels.clear();
		// A gas collection tube shows what bubbled out of its vessel, so it
		// follows every change of that vessel, not only the electrochemical
		// ones.
		if (changed.length) {
			for (const device of this.host.allEComponents) {
				if (device._type === chemlib.EComponentType.GasCollector &&
					changed.includes(device._connectedMix)) this.refreshDeviceDisplay(device);
			}
		}
		this.updateDippedStacking();
		if (this.cablesDirty || this.cables.size) {
			this.cablesDirty = false;
			// requests a render again while any rope is awake, which keeps
			// the sim loop ticking until all cables have settled
			this.updateCablePositions();
		}
		// Vessel particle / pour animations advance per frame here; the keep
		// -alive task below holds the ticker open until none is active.
		const dtMs = this.host.app?.ticker.deltaMS ?? 16.67;
		let vesselsActive = false;
		for (const view of this.vessels.values()) vesselsActive = view.stepAnimation(dtMs) || vesselsActive;
		const simulation = this.host.simulation;
		if (vesselsActive) {
			if (!simulation.hasTask(VESSEL_TASK)) {
				simulation.startTask(VESSEL_TASK, () => this.host.requestCanvasRender());
			}
		} else if (simulation.hasTask(VESSEL_TASK)) {
			simulation.stopTask(VESSEL_TASK);
		}
	}

	/**
	 * Finds the vessel a point in world coordinates falls into. Used both when
	 * an electrode is dropped and when a saved layout is restored, so an
	 * authored electrode ends up in the same vessel a manual drop would pick.
	 *
	 * @param {number} x - world-space x
	 * @param {number} y - world-space y
	 * @returns {?VesselView} the smallest vessel containing the point
	 */
	vesselAt(x: number, y: number): VesselView | undefined {
		let found: VesselView | undefined;
		for (const view of this.vessels.values()) {
			if (x < view.x - view.width / 2 || x > view.x + view.width / 2) continue;
			if (y < view.y - view.height / 2 || y > view.y + view.height / 2) continue;
			if (!found || view.width * view.height < found.width * found.height) found = view;
		}
		return found;
	}

	/**
	 * Dips every device into the vessel it currently sits in.
	 *
	 * A saved layout does not record which vessel an electrode belongs to, so
	 * the position decides, using the same test as a manual drop. Without this
	 * an imported layout would show a cell whose electrodes are in no
	 * solution, and the simulation would never start. The same sweep runs
	 * after a vessel was moved, because that changes what the devices around
	 * it sit in.
	 */
	attachDevices(): void {
		for (const eComp of this.host.allEComponents) {
			const sprite = this.spritesByLabel.get(`${eComp._type}:${eComp._id}`);
			if (sprite) this.attachDevice(eComp, sprite);
		}
	}

	/**
	 * Resolves what a device without a cable sits in or on. An electrode dips
	 * into the vessel under its centre or under its lower end, a gas collection
	 * tube into the vessel under its lower end, and a salt bridge into the two
	 * vessels under its legs.
	 *
	 * @param {chemlib.ElectricComponent} eComp - the device to attach
	 * @param {PIXI.Container} sprite - its view, which carries the position
	 */
	attachDevice(eComp: chemlib.ElectricComponent, sprite: PIXI.Container): void {
		// The lower end of a tube or a bridge leg sits at 0.4667 of the
		// artboard height below the centre.
		const bottom = sprite.y + sprite.height * 0.4667;
		switch (eComp._type) {
			case chemlib.EComponentType.Electrode: {
				// An electrode is long and thin, so it counts as dipped in when
				// either its centre or its lower end is inside the vessel. That
				// is what a drop looks like: the strip hangs into the beaker
				// while its centre is still above the rim.
				const vessel = this.vesselAt(sprite.x, sprite.y) ?? this.vesselAt(sprite.x, bottom);
				eComp._connectedMix = vessel?.component._content;
				return;
			}
			case chemlib.EComponentType.GasCollector: {
				eComp._connectedMix = this.vesselAt(sprite.x, bottom)?.component._content;
				return;
			}
			case chemlib.EComponentType.Bridge: {
				// The legs of the bridge graphic sit at 1/8 and 7/8 of its width.
				const leg = sprite.width * 0.375;
				const first = this.vesselAt(sprite.x - leg, bottom);
				const second = this.vesselAt(sprite.x + leg, bottom);
				eComp._bridgeMixes = first && second && first !== second
					? [first.component._content, second.component._content] : [];
				return;
			}
			default:
				return;
		}
	}

	/**
	 * Keeps every device that dips into a vessel behind that vessel's glass and
	 * contents by lowering it below the vessel sprite in the world ordering.
	 * An electrode and a gas collection tube hang in one vessel, a salt bridge
	 * in two, so a bridge is lowered behind the earlier of its two vessels and
	 * is thereby behind both.
	 *
	 * @private
	 */
	private updateDippedStacking(): void {
		const stage = this.world;
		// The vessel views each dipped device has to disappear behind.
		const behind = new Map<PIXI.Container, VesselView[]>();
		const dip = (sprite: PIXI.Container | undefined, view: VesselView) => {
			if (!sprite || !sprite.parent) return;
			const views = behind.get(sprite) ?? [];
			if (!views.includes(view)) views.push(view);
			behind.set(sprite, views);
		};
		for (const [component, view] of this.vessels) {
			const mix = component._content;
			for (const eComp of this.host.allEComponents) {
				const sprite = this.spritesByLabel.get(`${eComp._type}:${eComp._id}`);
				if (!sprite) continue;
				switch (eComp._type) {
					case chemlib.EComponentType.Electrode:
					case chemlib.EComponentType.GasCollector:
						if (eComp._connectedMix === mix) dip(sprite, view);
						break;
					case chemlib.EComponentType.Bridge:
						if (eComp._bridgeMixes?.includes(mix)) dip(sprite, view);
						break;
				}
			}
		}
		for (const [sprite, views] of behind) {
			const target = Math.min(...views.map((view) => stage.getChildIndex(view)));
			if (stage.getChildIndex(sprite) > target) stage.setChildIndex(sprite, target);
		}
	}

	/**
	 * The world point where a cable leaves a device: the terminal that carries
	 * it, so a cable clips onto the top of an electrode instead of running to
	 * the middle of the strip. Falls back to the sprite centre for a device
	 * without terminals or without a recorded connection.
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the device view
	 * @param {chemlib.ElectricComponent} device - the device behind the view
	 * @param {chemlib.ElectricComponent} cable - the cable that leaves it
	 * @returns {PIXI.PointData}
	 */
	private cableTerminalPoint(sprite: PIXI.Container, device: chemlib.ElectricComponent, cable: chemlib.ElectricComponent): PIXI.PointData {
		if (sprite instanceof ElectricDeviceView) {
			// A device slot holds the cable that occupies it, not the device at
			// the far end, so the slot index is the terminal the cable sits on.
			const terminal = device._connections.indexOf(cable);
			const point = terminal >= 0 ? this.portWorld(sprite, terminal) : undefined;
			if (point) return point;
		}
		return { x: sprite.x, y: sprite.y };
	}

	/**
	 * The two world points a cable runs between, or undefined while one of its
	 * devices has no view yet.
	 *
	 * @private
	 * @param {chemlib.ElectricComponent} cable - the cable
	 * @returns {?[number, number, number, number]}
	 */
	private cableEndpoints(cable: chemlib.ElectricComponent): [number, number, number, number] | undefined {
		const [first, second] = cable._connections;
		if (!first || !second) return undefined;
		const from = this.spritesByLabel.get(`${first._type}:${first._id}`);
		const to = this.spritesByLabel.get(`${second._type}:${second._id}`);
		if (!from || !to) return undefined;
		const start = this.cableTerminalPoint(from, first, cable);
		const end = this.cableTerminalPoint(to, second, cable);
		return [start.x, start.y, end.x, end.y];
	}

	private updateCablePositions(): void {
		const stage = this.world;
		let anyAwake = false;
		for (const [sprite, cable] of this.cables) {
			const [first, second] = cable._connections;
			// A cable is only dropped when one of its devices is really gone.
			// A missing sprite alone is not enough: during a restore the views
			// are added one by one, so a cable can be laid before its partner
			// has a view, and deleting it then would silently unwire the cell.
			if (!first || !this.host.allEComponents.includes(first)
				|| !second || !this.host.allEComponents.includes(second)) {
				this.host.removeObjects([sprite]);
				continue;
			}
			const endpoints = this.cableEndpoints(cable);
			if (!endpoints) continue;

			let rope = this.cableRopes.get(sprite);
			if (!rope) {
				// A fresh cable starts as a straight line between the devices,
				// with its rest length set to the current span plus slack.
				rope = { points: [], prev: [], restLength: 0, awake: true, idleFrames: 0, endpoints };
				const dist = Math.hypot(endpoints[2] - endpoints[0], endpoints[3] - endpoints[1]);
				rope.restLength = Math.max(dist, 1) * CABLE_SLACK;
				for (let i = 0; i < CABLE_SEGMENTS; i++) {
					const t = i / (CABLE_SEGMENTS - 1);
					const point = {
						x: endpoints[0] + (endpoints[2] - endpoints[0]) * t,
						y: endpoints[1] + (endpoints[3] - endpoints[1]) * t,
					};
					rope.points.push(point);
					rope.prev.push({ x: point.x, y: point.y });
				}
				this.cableRopes.set(sprite, rope);
			} else if (endpoints.some((value, index) => value !== rope.endpoints[index])) {
				// A connected device moved: keep the stored length so bringing
				// devices closer relaxes the cable, while pulling them apart
				// only strains it.
				rope.endpoints = endpoints;
				rope.awake = true;
				rope.idleFrames = 0;
			}

			if (rope.awake) {
				this.stepRope(rope);
				this.drawRope(sprite, rope);
				anyAwake = true;
			}

			// Cables lie on top of the devices, so a cable visibly ends at the
			// plug it is clamped to instead of vanishing under the device body.
			const top = stage.children.length - 1;
			if (stage.getChildIndex(sprite) !== top) stage.setChildIndex(sprite, top);
		}
		// Keep the ticker running while any cable moves: the task requests a
		// render every frame, and the flush below steps the ropes. Only when
		// all cables have settled does the canvas go back to sleep.
		const simulation = this.host.simulation;
		if (anyAwake) {
			if (!simulation.hasTask(CABLE_TASK)) {
				simulation.startTask(CABLE_TASK, () => this.host.requestCanvasRender());
			}
		} else if (simulation.hasTask(CABLE_TASK)) {
			simulation.stopTask(CABLE_TASK);
		}
	}

	/**
	 * Integrates one simulation step of a cable rope: the interior points
	 * fall under gravity with damping, while the distance constraints keep
	 * every segment at `restLength / segments`. The pinned ends always win,
	 * so pulling devices apart stretches the drawn cable into a taut line
	 * instead of moving the devices.
	 *
	 * @private
	 * @param {CableRope} rope - the rope to simulate
	 */
	private stepRope(rope: CableRope): void {
		const { points, prev, endpoints } = rope;
		const count = points.length;
		const last = count - 1;

		// verlet integration of the interior points: velocity, damping, gravity
		const dt = Math.min(this.host.app?.ticker.deltaMS ?? 16.67, 40) / 1000;
		for (let i = 1; i < last; i++) {
			const vx = (points[i].x - prev[i].x) * CABLE_DAMPING;
			const vy = (points[i].y - prev[i].y) * CABLE_DAMPING;
			prev[i].x = points[i].x;
			prev[i].y = points[i].y;
			points[i].x += vx;
			points[i].y += vy + CABLE_GRAVITY * dt * dt;
		}

		// pin the ends to their devices before and after the constraints
		points[0].x = endpoints[0];
		points[0].y = endpoints[1];
		points[last].x = endpoints[2];
		points[last].y = endpoints[3];

		// distance constraints keep every segment at restLength / segments;
		// pinned ends cannot move, so taut cables straighten while their
		// drawn span grows with the device distance
		const segLength = rope.restLength / last;
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
			points[0].x = endpoints[0];
			points[0].y = endpoints[1];
			points[last].x = endpoints[2];
			points[last].y = endpoints[3];
		}

		// the rope sleeps once it has calmed down
		let maxMove = 0;
		for (let i = 1; i < last; i++) {
			maxMove = Math.max(
				maxMove,
				Math.abs(points[i].x - prev[i].x),
				Math.abs(points[i].y - prev[i].y)
			);
		}
		if (maxMove < CABLE_SETTLE) {
			rope.idleFrames += 1;
			if (rope.idleFrames > 6) rope.awake = false;
		} else {
			rope.idleFrames = 0;
		}
	}

	/**
	 * Draws a rope as a smooth polyline with the flat cable look: a dark
	 * outer stroke and a lighter inner highlight.
	 *
	 * @private
	 * @param {PIXI.Graphics} sprite - the cable's graphics object
	 * @param {CableRope} rope - the simulated chain to draw
	 */
	private drawRope(sprite: PIXI.Graphics, rope: CableRope): void {
		const lineWidth = CABLE_DIAMETER_MM / MILLIMETERS_PER_WORLD_UNIT;
		const { points } = rope;
		const trace = (graphics: PIXI.Graphics) => {
			graphics.moveTo(points[0].x, points[0].y);
			for (let k = 1; k < points.length - 1; k++) {
				const mx = (points[k].x + points[k + 1].x) / 2;
				const my = (points[k].y + points[k + 1].y) / 2;
				graphics.quadraticCurveTo(points[k].x, points[k].y, mx, my);
			}
			const last = points[points.length - 1];
			graphics.lineTo(last.x, last.y);
		};
		sprite.clear();
		trace(sprite);
		sprite.stroke({ width: lineWidth, color: 0x30404d, cap: "round", join: "round" });
		trace(sprite);
		sprite.stroke({ width: lineWidth * 0.35, color: 0x687d8b, cap: "round", join: "round" });
	}

	/**
	 * Gives every cable connected to one of the moved sprites a new rest
	 * length: the straight distance between its devices at the moment the
	 * movement ends, plus the usual slack.
	 *
	 * @private
	 * @param {readonly PIXI.Container[]} movedSprites - the sprites that were dropped
	 */
	private relengthCablesAttachedTo(movedSprites: readonly PIXI.Container[]): void {
		if (!this.cables.size) return;
		for (const [sprite, cable] of this.cables) {
			const rope = this.cableRopes.get(sprite);
			if (!rope) continue;
			const [first, second] = cable._connections;
			if (!first || !second) continue;
			const from = this.spritesByLabel.get(`${first._type}:${first._id}`);
			const to = this.spritesByLabel.get(`${second._type}:${second._id}`);
			if (!from || !to) continue;
			if (!movedSprites.includes(from) && !movedSprites.includes(to)) continue;
			const endpoints = this.cableEndpoints(cable);
			if (!endpoints) continue;
			rope.restLength = Math.max(Math.hypot(endpoints[2] - endpoints[0], endpoints[3] - endpoints[1]), 1) * CABLE_SLACK;
			rope.awake = true;
			rope.idleFrames = 0;
		}
		this.host.requestCanvasRender();
	}
}
