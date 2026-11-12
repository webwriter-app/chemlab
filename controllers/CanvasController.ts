import { ReactiveController } from "lit";
import * as PIXI from "pixi.js";
import * as chemlib from "../chemlib";

import { CABLE_DIAMETER_MM, componentArtboardMm, componentGraphic, componentTextureUrls } from "../data/componentGraphics";

import { MILLIMETERS_PER_WORLD_UNIT, STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH, WorkspaceCamera } from "./WorkspaceCamera";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { ElectricDeviceView } from "./ElectricDeviceView";
import { isVesselType, VesselView } from "./VesselView";

import type { ChemLab } from "../webwriter-chemlab";

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
	private cables = new Map<PIXI.Sprite, chemlib.ElectricComponent>();
	private cablesDirty = false;

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
	/** reused scratch Graphics used to rasterize each cable's curved-line texture */
	private _cableGraphics: PIXI.Graphics = new PIXI.Graphics();
	private cableEndpoints = new WeakMap<PIXI.Sprite, [number, number, number, number]>();

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
		const { width, height } = this.host.app.screen;
		return this.camera.toWorld((x - bounds.left) * width / bounds.width, (y - bounds.top) * height / bounds.height);
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

	private get pointerBusy(): boolean {
		return !!(this._dragActive || this.pan || this.pinching || this.marquee || this.groupDrag);
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
			const bounds = sprite.getBounds();
			if (sprite.label.startsWith("cable:")) {
				return bounds.minX >= rect.left && bounds.maxX <= rect.right && bounds.minY >= rect.top && bounds.maxY <= rect.bottom;
			}
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
		if (this.showGrid) this.grid?.update(this.camera);
		this.updateScaleReadouts();
		if (this.selection.length || this.marquee || this.host.selectedObjectSprite) this.drawSelection();
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

	private cancelPointerInteraction(): void {
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
		if (sprite instanceof PIXI.Sprite) this.cables.delete(sprite);
		if (sprite instanceof PIXI.Sprite && sprite.texture instanceof PIXI.RenderTexture) {
			sprite.texture.destroy(true);
		}
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
	/**
	 * adds a new sprite to the canvas
	 *
	 * @private
	 * @param component - the model represented by this view
	 */
	addComponentView(component: chemlib.ChemComponent | chemlib.ElectricComponent, select = true): PIXI.Container {
		const type = component._type;
		const info = `${type}:${component._id}`;
		const graphic = componentGraphic(type);
		const texture = PIXI.Assets.get<PIXI.Texture>(graphic.url);
		const capacityMl = component instanceof chemlib.ChemComponent ? component._volume : undefined;
		const [widthMm, heightMm] = componentArtboardMm(type, capacityMl);
		const width = widthMm / MILLIMETERS_PER_WORLD_UNIT;
		const height = heightMm / MILLIMETERS_PER_WORLD_UNIT;
		const sprite = component instanceof chemlib.ChemComponent && isVesselType(type)
			? new VesselView(component, type, texture, width, height, this.scaleTextures)
			: component instanceof chemlib.ElectricComponent && type !== chemlib.EComponentType.Cable
				? new ElectricDeviceView(component, texture, width, height)
				: new PIXI.Sprite({ texture, width, height, anchor: 0.5 });

		sprite.x = this.host.mousePos[0];
		sprite.y = this.host.mousePos[1];
		sprite.eventMode = "static";
		sprite.cursor = "pointer";
		sprite.on("pointerdown", (event) => {
			event.stopPropagation();
			if (this.pointerBusy) return;
			if (event.button === 1) {
				this.beginPan(event);
				return;
			}
			this.updateMousePosition(event);
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
			this.cables.set(sprite as PIXI.Sprite, component);
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
			this.host.dragObject.position.copyFrom(position);

			let mouseHoverObject: number = -1;
			for (let i = 0; i < this.world.children.length; i++) {
				if (
					i != this.host.curr_stage_index &&
					this._mouseInbounds(
						i,
						50
					)
				) {
					let upperSprite = this.world.children[this.host.curr_stage_index]
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
					if (
						Object.values(chemlib.ComponentType).includes(
							cOType as chemlib.ComponentType
						)
					) {
						this.host.allChemComponents.forEach((comp) => {
							if (comp._id === cOId) {
								cObj = comp;
							}
						});
						if (
							(
							this.host.curr_obj._type ===
								chemlib.ComponentType.Beaker ||
							this.host.curr_obj._type ===
								chemlib.ComponentType.Flask ||
							this.host.curr_obj._type ===
								chemlib.ComponentType.Testtube
							)

							&& (upperSprite.y < bottomSprite.y - Math.min(50, bottomSprite.height))
						) {
							this.world.children[
								this.host.curr_stage_index
							].rotation =
								this.world.children[
									this.host.curr_stage_index
								].x > bottomSprite.x
									? -20
									: 20;
							this.host._emitAlert(
								this.host.message("Inhalt aus {from} zu {to} transferieren.", {
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
			if (mouseHoverObject === -1) {
				this.world.children[this.host.curr_stage_index].rotation = 0;
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
	async _dragEnd(): Promise<void> {
		if (!this._dragActive) return;
		this.host.app.stage.off("globalpointermove", this._dragMoveHandler);
		this._dragActive = false;
		this.dragPointerId = undefined;
		if (!this._dragMoved || !this.host.dragObject) {
			this.host.dragObject = undefined;
			return;
		}
		this.drawSelection();
		for (let i = 0; i < this.world.children.length; i++) {
			if (
				i != this.host.curr_stage_index &&
				this._mouseInbounds(
					i,
				50
				)
			) {
				let upperSprite = this.world.children[this.host.curr_stage_index]
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
				if (
					Object.values(chemlib.ComponentType).includes(
						cOType as chemlib.ComponentType
					)
				) {
					this.host.allChemComponents.forEach((comp) => {
						if (comp._id === cOId) {
							cObj = comp;
						}
					});
					if (
						(
						this.host.curr_obj._type ===
							chemlib.ComponentType.Beaker ||
						this.host.curr_obj._type ===
							chemlib.ComponentType.Flask ||
						this.host.curr_obj._type ===
							chemlib.ComponentType.Testtube
						)
						&& (upperSprite.y < bottomSprite.y - Math.min(50, bottomSprite.height))
					) {
						const point = this.viewportPoint(this.host.mousePos[0], this.host.mousePos[1]);
						dialogPanel.style.top = `${point.y}px`;
						dialogPanel.style.left = `${point.x}px`;
						this.host.confirmDialog.show();
						await this.host.waitUntil(
							() => this.host.confirmAction != 0
						);
						upperSprite.rotation = 0;
						if (upperSprite instanceof VesselView) upperSprite.updateAngle();
						this.drawSelection();
						if (this.host.confirmAction === 1) {
							this.host.curr_obj.transferContents({}, cObj);
							this.markVesselChanged(this.host.curr_obj);
							this.markVesselChanged(cObj);
							this.host._getObject(this.host.dragObject);
							this.host._emitAlert(
								this.host.message("Inhalt aus {from} zu {to} überführt.", {
									from: this.host.itemName(this.host.curr_obj._type),
									to: this.host.itemName(cObj._type),
								}),
								"success",
								false,
								1500
							);
							this.host.reportXApi(
								"appended",
								this.host.curr_obj.type +
									":" +
									this.host.curr_obj._id,
								{
									response: cOType + ":" + cOId,
									success: true,
									completion: true,
								}
							);
						}
						this.host.confirmAction = 0;
					}
					cObj = undefined;
				}
			}
		}
		if (this.host.dragObject) this.host.saveComponentPosition(this.host.dragObject);
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
		app.stage.addChild(this.grid.mesh, this.world, this.selectionOverlay);
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
					this.host.saveComponentPositions(drag.items.map(({ sprite }) => sprite));
				}
			} else if (this.pan?.id === event.pointerId) {
				const { moved, deselectOnTap } = this.pan;
				this.pan = undefined;
				if (deselectOnTap && !moved) {
					if (event.pointerType === "touch" && event.type === "pointerup" && event.target === stage) {
						this.updateMousePosition(event);
						if (this.host.placeSelectedComponent(this.host.mousePos[0], this.host.mousePos[1])) return;
					}
					this.host.clearObjectSelection();
				}
			} else if (this._dragActive && event.pointerId === this.dragPointerId) {
				void this._dragEnd();
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
		if (this.cablesDirty) {
			this.cablesDirty = false;
			this.updateCablePositions();
		}
	}

	private updateCablePositions(): void {
		const stage = this.world;
		const selected = stage.children[this.host.curr_stage_index];
		let selectionMoved = false;
		for (const [sprite, cable] of this.cables) {
			const [first, second] = cable._connections;
			const from = first && this.spritesByLabel.get(`${first._type}:${first._id}`);
			const to = second && this.spritesByLabel.get(`${second._type}:${second._id}`);
			if (!from || !to) {
				this.host.removeObjects([sprite]);
				continue;
			}
			const current = this.cableEndpoints.get(sprite);
			const endpoints: [number, number, number, number] = [from.x, from.y, to.x, to.y];
			if (!current || endpoints.some((value, index) => value !== current[index])) {
				const curve = this._buildCableCurve([from.x, from.y], [to.x, to.y]);
				const previous = sprite.texture;
				sprite.texture = curve.texture;
				sprite.setSize(curve.w, curve.h);
				sprite.position.set(curve.cx, curve.cy);
				sprite.rotation = 0;
				selectionMoved ||= sprite === selected || this.selection.includes(sprite);
				if (previous instanceof PIXI.RenderTexture) previous.destroy(true);
				this.cableEndpoints.set(sprite, endpoints);
			}
			const index = stage.getChildIndex(sprite);
			const behindDevices = Math.min(stage.getChildIndex(from), stage.getChildIndex(to));
			if (index > behindDevices) stage.setChildIndex(sprite, behindDevices);
		}
		if (selected?.parent === stage && this.host.curr_obj) this.host.curr_stage_index = stage.getChildIndex(selected);
		if (selectionMoved) this.drawSelection();
	}

	/**
	 * Draws a sagging cubic-bezier cable between two world-space points
	 * and bakes it into a texture sized to fit it exactly, so the cable
	 * sprite can keep using the same anchor(0.5)/width/height contract
	 * every other sprite relies on (see {@link _mouseInbounds}).
	 *
	 * @private
	 * @param {number[]} pos1 - world [x, y] of the first endpoint
	 * @param {number[]} pos2 - world [x, y] of the second endpoint
	 * @returns {{texture: PIXI.Texture, cx: number, cy: number, w: number, h: number}}
	 */
	private _buildCableCurve(
		pos1: number[],
		pos2: number[]
	): { texture: PIXI.Texture; cx: number; cy: number; w: number; h: number } {
		const dx: number = pos2[0] - pos1[0];
		const dy: number = pos2[1] - pos1[1];
		const len: number = Math.sqrt(dx * dx + dy * dy) || 1;
		// perpendicular unit vector, so the sag reads the same regardless
		// of the cables orientation on the canvas
		const nx: number = -dy / len;
		const ny: number = dx / len;
		const sag: number = Math.min(Math.max(len * 0.15, 8), 40);

		const cp1x: number = pos1[0] + dx / 3 + nx * sag;
		const cp1y: number = pos1[1] + dy / 3 + ny * sag;
		const cp2x: number = pos1[0] + (dx * 2) / 3 + nx * sag;
		const cp2y: number = pos1[1] + (dy * 2) / 3 + ny * sag;

		const lineWidth = CABLE_DIAMETER_MM / MILLIMETERS_PER_WORLD_UNIT;
		const pad: number = lineWidth / 2 + 2;
		// the convex hull of the endpoints + control points bounds a
		// cubic bezier curve exactly, so this is a tight fit
		const xs: number[] = [pos1[0], cp1x, cp2x, pos2[0]];
		const ys: number[] = [pos1[1], cp1y, cp2y, pos2[1]];
		const minX: number = Math.min(...xs) - pad;
		const maxX: number = Math.max(...xs) + pad;
		const minY: number = Math.min(...ys) - pad;
		const maxY: number = Math.max(...ys) + pad;
		const w: number = Math.max(1, maxX - minX);
		const h: number = Math.max(1, maxY - minY);

		const graphics = this._cableGraphics
			.clear()
			.moveTo(pos1[0], pos1[1])
			.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pos2[0], pos2[1])
			.stroke({ width: lineWidth, color: 0x30404d, cap: "round" })
			.moveTo(pos1[0], pos1[1])
			.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pos2[0], pos2[1])
			.stroke({ width: lineWidth * 0.35, color: 0x687d8b, cap: "round" });
		const texture = this.host.app.renderer.generateTexture({
			target: graphics,
			frame: new PIXI.Rectangle(minX, minY, w, h),
		});

		return { texture, cx: minX + w / 2, cy: minY + h / 2, w, h };
	}
}
