import { ReactiveController } from "lit";
import * as PIXI from "pixi.js";
import * as chemlib from "../chemlib";

import { CABLE_DIAMETER_MM, componentArtboardMm, componentGraphic, componentTextureUrls } from "../data/componentGraphics";

import { MILLIMETERS_PER_WORLD_UNIT, STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH, WorkspaceCamera } from "./WorkspaceCamera";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { ElectricDeviceView } from "./ElectricDeviceView";
import { isVesselType, VesselView } from "./VesselView";

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
	private selection: PIXI.Container[] = [];
	private marquee?: { id: number; start: PIXI.PointData; end?: PIXI.PointData };
	private groupDrag?: { id: number; origin: PIXI.PointData; anchor: PIXI.PointData; moved: boolean;
		items: { sprite: PIXI.Container; x: number; y: number }[] };
	private touchListeners?: AbortController;
	private touches = new Map<number, { x: number; y: number }>();
	private pinching = false;
	private spritesByLabel = new Map<string, PIXI.Container>();
	private vessels = new Map<chemlib.ChemComponent, VesselView>();
	private scaleTextures = new Map<string, PIXI.Texture>();
	private changedVessels = new Set<VesselView>();
	private cables = new Map<PIXI.Graphics, chemlib.ElectricComponent>();
	private cableRopes = new Map<PIXI.Graphics, CableRope>();
	private cablesDirty = false;
	/** electrode sprites moved along with a vessel since the last save */
	private attachedElectrodesMoved = new Set<PIXI.Container>();

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
		this.host.clearObjectSelection(true);
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
		const snappedDx = anchor.x - drag.anchor.x;
		const snappedDy = anchor.y - drag.anchor.y;
		for (const { sprite, x, y } of drag.items) {
			sprite.position.set(x + snappedDx, y + snappedDy);
			if (sprite instanceof VesselView) this.moveAttachedElectrodes(sprite, snappedDx, snappedDy);
			if (this.cables.size && !(sprite instanceof VesselView)) this.cablesDirty = true;
		}
		this.drawSelection();
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
			this.host._hideAlert();
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
		this._dragActive = false;
		this.dragPointerId = undefined;
		this.pan = undefined;
		this.host.dragObject = undefined;
		for (const { sprite, x, y } of this.groupDrag?.items ?? []) {
			sprite.position.set(x, y);
			if (this.cables.size && !(sprite instanceof VesselView)) this.cablesDirty = true;
		}
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

	refreshDeviceDisplay(component: chemlib.ElectricComponent, hasVoltageReading?: boolean): void {
		const view = this.spritesByLabel.get(`${component._type}:${component._id}`);
		if (view instanceof ElectricDeviceView && view.refresh(hasVoltageReading)) this.host.requestCanvasRender();
	}
	private createComponentView(component: chemlib.ChemComponent | chemlib.ElectricComponent): PIXI.Container {
		const type = component._type;
		const graphic = componentGraphic(type);
		const texture = PIXI.Assets.get<PIXI.Texture>(graphic.url);
		const capacityMl = component instanceof chemlib.ChemComponent ? component._volume : undefined;
		const [widthMm, heightMm] = componentArtboardMm(type, capacityMl);
		const width = widthMm / MILLIMETERS_PER_WORLD_UNIT;
		const height = heightMm / MILLIMETERS_PER_WORLD_UNIT;
		return component instanceof chemlib.ChemComponent && isVesselType(type)
			? new VesselView(component, type, texture, width, height, this.scaleTextures)
			: component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable
				// Cables render as rope polylines and carry no texture.
				? new PIXI.Graphics()
				: component instanceof chemlib.ElectricComponent
					? new ElectricDeviceView(component, texture, width, height)
					: new PIXI.Sprite({ texture, width, height, anchor: 0.5 });
	}

	createPlacementPreview(component: chemlib.ChemComponent | chemlib.ElectricComponent): PIXI.Container {
		const preview = this.createComponentView(component);
		preview.alpha = 0.5;
		preview.visible = false;
		this.placementPreviewLayer.addChild(preview);
		return preview;
	}

	addComponentView(component: chemlib.ChemComponent | chemlib.ElectricComponent, select = true): PIXI.Container {
		const type = component._type;
		const info = `${type}:${component._id}`;
		const sprite = this.createComponentView(component);

		// Cables draw in world coordinates and carry their own transform at (0,0).
		if (!(component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable)) {
			sprite.x = this.host.mousePos[0];
			sprite.y = this.host.mousePos[1];
		}
		sprite.eventMode = component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable
			? "none"
			: "static";
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
			if (event.button === 0 && this.selection.includes(sprite)) {
				const items = this.selection.filter((item) => !item.label.startsWith("cable:"))
					.map((item) => ({ sprite: item, x: item.x, y: item.y }));
				const anchor = items.find((item) => item.sprite === sprite) ?? items[0];
				if (anchor) this.groupDrag = {
					id: event.pointerId, origin: this.camera.toWorld(event.global.x, event.global.y), anchor, items, moved: false,
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
			this.changedVessels.add(sprite);
		}
		if (component instanceof chemlib.ElectricComponent && type === chemlib.EComponentType.Cable) {
			this.cables.set(sprite as PIXI.Graphics, component);
			this.cableRopes.delete(sprite as PIXI.Graphics);
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
			this.host.dragObject.position.copyFrom(position);
			if (this.host.dragObject instanceof VesselView) {
				this.moveAttachedElectrodes(this.host.dragObject, dx, dy);
			}

			const transferTarget = this.trackVesselTransfer(event);
			if (this.host.dragObject instanceof VesselView) {
				this.host.dragObject.rotation = transferTarget
					? (this.host.dragObject.x > transferTarget.x ? -0.35 : 0.35) : 0;
				return;
			}

			let mouseHoverObject: number = -1;
			for (let i = 0; i < this.world.children.length; i++) {
				if (
					this.world.children[i] !== this.host.dragObject &&
					this._mouseInbounds(
						i,
						50
					)
				) {
					const upperSprite = this.host.dragObject
					let bottomSprite = this.world.children[i];
					let cObj: any = undefined;
					let cOType: string = bottomSprite.label
						.split(":")[0]
						.toLowerCase();
					let cOId: number = Number.parseInt(
						bottomSprite.label.split(":")[1]
					);
					if (
						chemlib.ComponentType.Beaker ===
							(cOType as chemlib.ComponentType) ||
						chemlib.ComponentType.Flask ===
							(cOType as chemlib.ComponentType)
					) {
						this.host.allChemComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							this.host.curr_obj._type ===
								chemlib.EComponentType.Electrode &&
							cObj
							&& (upperSprite.y > bottomSprite.y - bottomSprite.height/2 && upperSprite.y < bottomSprite.y + upperSprite.height/2 && upperSprite.x > bottomSprite.x - bottomSprite.width/2 && upperSprite.x < bottomSprite.x + bottomSprite.width/2)
						) {
							this.host._emitAlert(
								this.host.message("{from} in {to} einfügen.", {
									from: this.host.itemName(this.host.curr_obj._type),
									to: this.host.itemName(cObj._type),
								}),
								"primary",
								false
							);
							mouseHoverObject = i;
						}
					}
					if (
						Object.values(chemlib.EComponentType).includes(
							cOType as chemlib.EComponentType
						)
					) {
						this.host.allEComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							Object.values(chemlib.EComponentType).includes(
								this.host.curr_obj._type
							)
						) {
							if (
								this.host.curr_obj._type !=
									chemlib.EComponentType.Cable &&
								cObj._type != chemlib.EComponentType.Cable
							) {
								this.host._emitAlert(
									this.host.message("{from} und {to} verbinden.", {
										from: this.host.itemName(this.host.curr_obj._type),
										to: this.host.itemName(cObj._type),
									}),
									"primary",
									false
								);
								mouseHoverObject = i;
							}
						}
					}
				}
			}
			if (mouseHoverObject === -1) {
				this.host.dragObject.rotation = 0;
				this.host._hideAlert();
			}
		}
	}

	/**
	 * function to be called when a sprite is placed. Handles interactions
	 *
	 * @private
	 * @async
	 * @returns {Promise<void>}
	 */
	async _dragEnd(event: PIXI.FederatedPointerEvent): Promise<void> {
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
		for (let i = 0; i < this.world.children.length; i++) {
			if (
				this.world.children[i] !== this.host.dragObject &&
				this._mouseInbounds(
					i,
				50
				)
			) {
				const upperSprite = this.host.dragObject
				let bottomSprite = this.world.children[i];
				let cObj: any = undefined;
				let cOType: string = bottomSprite.label
					.split(":")[0]
					.toLowerCase();
				let cOId: number = Number.parseInt(
					bottomSprite.label.split(":")[1]
				);
				let dialogPanel =
					this.host.confirmDialog.shadowRoot.querySelector(
						".dialog__panel"
					) as HTMLDivElement;
				if (
					chemlib.ComponentType.Beaker ===
						(cOType as chemlib.ComponentType) ||
					chemlib.ComponentType.Flask ===
						(cOType as chemlib.ComponentType)
				) {
					this.host.allChemComponents.forEach((comp) => {
						if (comp._id === cOId) {
							cObj = comp;
						}
					});
					if (
						this.host.curr_obj._type ===
							chemlib.EComponentType.Electrode &&
						cObj &&
						(upperSprite.y > bottomSprite.y - bottomSprite.height/2 && upperSprite.y < bottomSprite.y + upperSprite.height/2 && upperSprite.x > bottomSprite.x - bottomSprite.width/2 && upperSprite.x < bottomSprite.x + bottomSprite.width/2)
					) {
						const point = this.viewportPoint(this.host.mousePos[0], this.host.mousePos[1]);
						dialogPanel.style.top = `${point.y}px`;
						dialogPanel.style.left = `${point.x}px`;
						this.host.confirmDialog.show();
						await this.host.waitUntil(
							() => this.host.confirmAction != 0
						);
						// console.log(this.host.confirmAction);
						if (this.host.confirmAction === 1) {
							this.host.curr_obj._connectedMix = cObj._content;
							this.host._emitAlert(
								this.host.message("{from} in {to} eingefügt.", {
									from: this.host.itemName(this.host.curr_obj._type),
									to: this.host.itemName(cObj._type),
								}),
								"success",
								false,
								1500
							);
							this.host.reportXApi(
								"added",
								this.host.curr_obj._type +
									":" +
									this.host.curr_obj._id,
								{
									response: cOType + ":" + cOId,
									success: true,
									completion: true,
								}
							);
							this.host._getObject(
								this.world.children[
									this.host.curr_stage_index
								]
							);
						}
						this.host.confirmAction = 0;
					}
					cObj = undefined;
				}
				if (
					Object.values(chemlib.EComponentType).includes(
						cOType as chemlib.EComponentType
					)
				) {
					this.host.allEComponents.forEach((comp) => {
						if (comp._id === cOId) {
							cObj = comp;
						}
					});
					if (
						Object.values(chemlib.EComponentType).includes(
							this.host.curr_obj._type
						)
					) {
						if (
							this.host.curr_obj._type !=
								chemlib.EComponentType.Cable &&
							cObj._type != chemlib.EComponentType.Cable
						) {
							const point = this.viewportPoint(this.host.mousePos[0], this.host.mousePos[1]);
							dialogPanel.style.top = `${point.y}px`;
							dialogPanel.style.left = `${point.x}px`;
							this.host.confirmDialog.show();
							await this.host.waitUntil(
								() => this.host.confirmAction != 0
							);
							// console.log(this.host.confirmAction);
							if (this.host.confirmAction === 1) {
								this.host._addEcon(cObj);
							}
							this.host.confirmAction = 0;
						}
						cObj = undefined;
					}
				}
			}
		}
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
		app.stage.addChild(this.grid.mesh, this.world, this.placementPreviewLayer, this.selectionOverlay);
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
			if (this.marquee?.id === event.pointerId) {
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
				void this._dragEnd(event);
			}
		};
		stage.on("pointerup", finishPointer);
		stage.on("pointerupoutside", finishPointer);
	}

	markVesselChanged(component: chemlib.ChemComponent): void {
		const view = this.vessels.get(component);
		if (!view) return;
		this.changedVessels.add(view);
		this.host.requestCanvasRender();
	}

	flushChanges(): void {
		for (const view of this.changedVessels) view.updateContents();
		this.changedVessels.clear();
		this.updateElectrodeStacking();
		if (this.cablesDirty || this.cables.size) {
			this.cablesDirty = false;
			// requests a render again while any rope is awake, which keeps
			// the sim loop ticking until all cables have settled
			this.updateCablePositions();
		}
	}

	/**
	 * Moves the electrode sprites standing inside a vessel's contents by the
	 * same offset the vessel itself was moved by, so electrodes travel with
	 * their vessel.
	 *
	 * @private
	 * @param {VesselView} vessel - the moved vessel view
	 * @param {number} dx - the world-space x offset
	 * @param {number} dy - the world-space y offset
	 */
	private moveAttachedElectrodes(vessel: VesselView, dx: number, dy: number): void {
		if (!(dx || dy) || !this.host.allEComponents.length) return;
		const mix = vessel.component._content;
		for (const eComp of this.host.allEComponents) {
			if (eComp._type !== chemlib.EComponentType.Electrode || eComp._connectedMix !== mix) continue;
			const electrode = this.spritesByLabel.get(`${eComp._type}:${eComp._id}`);
			if (!electrode || this.host.dragObject === electrode) continue;
			electrode.x += dx;
			electrode.y += dy;
			this.attachedElectrodesMoved.add(electrode);
		}
		if (this.cables.size) this.cablesDirty = true;
	}

	/**
	 * Keeps an inserted electrode behind its vessel's glass and contents by
	 * lowering it below the vessel sprite in the world ordering.
	 *
	 * @private
	 */
	private updateElectrodeStacking(): void {
		const stage = this.world;
		for (const [component, view] of this.vessels) {
			for (const eComp of this.host.allEComponents) {
				if (eComp._type !== chemlib.EComponentType.Electrode || eComp._connectedMix !== component._content) continue;
				const electrode = this.spritesByLabel.get(`${eComp._type}:${eComp._id}`);
				if (!electrode || !electrode.parent) continue;
				if (stage.getChildIndex(electrode) > stage.getChildIndex(view)) {
					stage.setChildIndex(electrode, stage.getChildIndex(view));
				}
			}
		}
	}

	private updateCablePositions(): void {
		const stage = this.world;
		let anyAwake = false;
		for (const [sprite, cable] of this.cables) {
			const [first, second] = cable._connections;
			const from = first && this.spritesByLabel.get(`${first._type}:${first._id}`);
			const to = second && this.spritesByLabel.get(`${second._type}:${second._id}`);
			if (!from || !to) {
				this.host.removeObjects([sprite]);
				continue;
			}
			const endpoints: [number, number, number, number] = [from.x, from.y, to.x, to.y];

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

			const index = stage.getChildIndex(sprite);
			const behindDevices = Math.min(stage.getChildIndex(from), stage.getChildIndex(to));
			if (index > behindDevices) stage.setChildIndex(sprite, behindDevices);
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
			const from = first && this.spritesByLabel.get(`${first._type}:${first._id}`);
			const to = second && this.spritesByLabel.get(`${second._type}:${second._id}`);
			if (!from || !to) continue;
			if (!movedSprites.includes(from) && !movedSprites.includes(to)) continue;
			rope.restLength = Math.max(Math.hypot(to.x - from.x, to.y - from.y), 1) * CABLE_SLACK;
			rope.awake = true;
			rope.idleFrames = 0;
		}
		this.host.requestCanvasRender();
	}
}
