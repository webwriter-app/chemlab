import { ReactiveController } from "lit";
import * as PIXI from "pixi.js";
import * as chemlib from "../chemlib";

import { componentGraphic, componentTextureUrls } from "../data/componentGraphics";

import { STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH, WorkspaceCamera } from "./WorkspaceCamera";
import { WorkspaceGrid } from "./WorkspaceGrid";

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
	private resizeObserver?: ResizeObserver;
	private pan?: { id: number; x: number; y: number; moved: boolean; deselect: boolean };

	/** true while a sprite drag is in progress (pointermove listener attached) */
	private _dragActive: boolean = false;
	private _dragMoved = false;
	private dragPointerId: number | undefined;
	private expandAfterDrag = false;
	/** Stable pointermove handler, so it can be removed again with .off(). */
	private _dragMoveHandler = (event: PIXI.FederatedPointerEvent): void => {
		if (event.pointerId !== this.dragPointerId) return;
		this._dragMoved = true;
		this.updateMousePosition(event);
		this._dragMove(event);
	};
	/** offset from the sprite's origin to the point where it was grabbed, so a
	 * drag keeps that point under the pointer instead of snapping to the centre */
	private _dragOffset: PIXI.Point = new PIXI.Point();
	/** pending long-press timer id (touch/pen context-menu trigger) */
	private _longPressTimer: number = undefined;
	/** stage move handler that cancels a long-press once the pointer moves */
	private _longPressMoveHandler: (event: any) => void = undefined;
	/** reused scratch Graphics used to rasterize each cable's curved-line texture */
	private _cableGraphics: PIXI.Graphics = new PIXI.Graphics();
	private cableEndpoints = new WeakMap<PIXI.Sprite, [number, number, number, number]>();

	constructor(host: ChemLab) {
		this.host = host;
		host.addController(this);
	}

	/**
	 * Arms a long-press: runs `action` after 500ms unless the pointer moves
	 * more than a few pixels or is lifted first. Used to give touch/pen input a
	 * context-menu gesture equivalent to a right-click.
	 *
	 * @private
	 * @param {() => void} action - what to run when the press is held
	 * @param {*} event - the originating pointerdown event
	 */
	private _armLongPress(action: () => void, event: any): void {
		this._clearLongPress();
		const startX: number = event.global.x;
		const startY: number = event.global.y;
		this._longPressMoveHandler = (moveEvent: any) => {
			const dx: number = moveEvent.global.x - startX;
			const dy: number = moveEvent.global.y - startY;
			if (Math.sqrt(dx * dx + dy * dy) > 10) {
				this._clearLongPress();
			}
		};
		this.host.app.stage.on("globalpointermove", this._longPressMoveHandler);
		this._longPressTimer = window.setTimeout(() => {
			this._clearLongPress();
			action();
		}, 500);
	}

	/**
	 * Cancels a pending long-press, if any.
	 *
	 * @private
	 */
	private _clearLongPress(): void {
		if (this._longPressTimer !== undefined) {
			window.clearTimeout(this._longPressTimer);
			this._longPressTimer = undefined;
		}
		if (this._longPressMoveHandler !== undefined) {
			this.host.app.stage.off(
				"globalpointermove",
				this._longPressMoveHandler
			);
			this._longPressMoveHandler = undefined;
		}
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
		if (!this.host.app || this._dragActive || this.pan) return;
		this.camera.zoomAt(factor, this.camera.width / 2, this.camera.height / 2);
		this.applyCamera();
	}

	private zoomFromWheel = (event: WheelEvent): void => {
		if ((!event.ctrlKey && !event.metaKey) || this._dragActive || this.pan) return;
		const bounds = this.host.app.canvas.getBoundingClientRect();
		if (!bounds.width || !bounds.height) return;
		event.preventDefault();
		const x = (event.clientX - bounds.left) * this.camera.width / bounds.width;
		const y = (event.clientY - bounds.top) * this.camera.height / bounds.height;
		const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.camera.height : 1);
		this.camera.zoomAt(Math.exp(Math.max(-1, Math.min(1, -pixels * 0.002))), x, y);
		this.applyCamera();
	};

	private applyCamera(): void {
		this.world.position.set(this.camera.offsetX, this.camera.offsetY);
		this.world.scale.set(this.camera.zoom);
		this.grid?.update(this.camera);
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

	private beginPan(event: PIXI.FederatedPointerEvent): void {
		if (this.pan) return;
		if (event.button === 1) event.preventDefault();
		this.pan = {
			id: event.pointerId, x: event.global.x, y: event.global.y,
			moved: false, deselect: event.button === 0,
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
		this._clearLongPress();
		this.camera.panBy(dx, dy);
		this.applyCamera();
		this.updateMousePosition(event);
	}

	private _openCanvasMenu(x: number, y: number): void {
		const point = this.screenToViewport(x, y);
		const workspace = this.host.containerDiv;
		const bounds = workspace.getBoundingClientRect();
		const menu = this.host.contextMenu;
		menu.style.display = "";
		menu.style.top = `${point.y - bounds.top - workspace.clientTop}px`;
		menu.style.left = `${point.x - bounds.left - workspace.clientLeft}px`;
		this.host.reportXApi("opened", "objectMenu");
	}

	hostConnected(): void {
		this.observeCanvas();
		this.host.app?.start();
	}

	hostDisconnected(): void {
		this.cancelPointerInteraction();
		this.resizeObserver?.disconnect();
		this.resizeObserver = undefined;
		this.host.app?.stop();
	}

	private cancelPointerInteraction(): void {
		this._clearLongPress();
		this.host.app?.stage.off("globalpointermove", this._dragMoveHandler);
		this._dragActive = false;
		this.dragPointerId = undefined;
		this.expandAfterDrag = false;
		this.pan = undefined;
		this.host.dragObject = undefined;
	}

	removeSprite(sprite: PIXI.Container): void {
		this.world.removeChild(sprite);
		if (sprite instanceof PIXI.Sprite && sprite.texture instanceof PIXI.RenderTexture) {
			sprite.texture.destroy(true);
		}
		sprite.destroy();
	}

	clearSprites(): void {
		this.cancelPointerInteraction();
		for (const sprite of [...this.world.children]) this.removeSprite(sprite);
	}

	setDeviceActive(sprite: PIXI.Sprite, active: boolean): void {
		const graphic = componentGraphic(sprite.label.split(":")[0]);
		sprite.texture = PIXI.Assets.get<PIXI.Texture>(active ? graphic.active ?? graphic.url : graphic.url);
	}
	/**
	 * adds a new sprite to the canvas
	 *
	 * @private
	 * @param {string} info - a string containing the name of the object and its id
	 */
	_addSprite(info: string, select = true, capacityMl?: number): PIXI.Sprite {
		const graphic = componentGraphic(info.split(":")[0]);
		const sprite = new PIXI.Sprite(PIXI.Assets.get<PIXI.Texture>(graphic.url));
		const scale = graphic.capacityMl && capacityMl ? Math.cbrt(capacityMl / graphic.capacityMl) : 1;

		sprite.anchor.set(0.5);

		sprite.x = this.host.mousePos[0];
		sprite.y = this.host.mousePos[1];
		sprite.width = graphic.width * scale;
		sprite.height = graphic.height * scale;
		sprite.eventMode = "static";
		sprite.cursor = "pointer";
		sprite.on("pointerdown", (event) => {
			event.stopPropagation();
			if (this._dragActive || this.pan) return;
			this.host.contextMenu.style.display = "none";
			if (event.button === 1) {
				this.beginPan(event);
				return;
			}
			this.updateMousePosition(event);
			if (event.button === 0 && this.host.beginChemicalDose(sprite, event.pointerId)) return;
			const drag = event.button === 0 && !sprite.label.startsWith("cable:");
			this.expandAfterDrag = drag && this.world.children[this.host.curr_stage_index] !== sprite;
			this.host._getObject(sprite, !drag);
			this.host.reportXApi("focused", sprite.label);
			if (drag) this._dragStart(sprite, event);
		});

		sprite.label = info;
		this.world.addChild(sprite);
		if (select && !sprite.label.includes("cable")) {
			this.host._getObject(sprite);
		}
		this.host.reportXApi("inserted", sprite.label);
		return sprite;
	}

	/**
	 * modifies sprite events when an object gets dragged
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the dragged sprite
	 */
	_dragStart(sprite: PIXI.Sprite, event: PIXI.FederatedPointerEvent): void {
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
			this.host.dragObject.position.set(
				local.x + this._dragOffset.x,
				local.y + this._dragOffset.y
			);

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
		this._clearLongPress();
		if (!this._dragActive) return;
		this.host.app.stage.off("globalpointermove", this._dragMoveHandler);
		this._dragActive = false;
		const expand = this.expandAfterDrag;
		this.expandAfterDrag = false;
		if (!this._dragMoved || !this.host.dragObject) {
			this.host.dragObject = undefined;
			if (expand) this.host.expandSelectedObjectPanel();
			return;
		}
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
						this.world.children[
							this.host.curr_stage_index
						].rotation = 0;
						if (this.host.confirmAction === 1) {
							this.host.curr_obj.transferContents({}, cObj);
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
		if (expand) this.host.expandSelectedObjectPanel();
	}

	/**
	 * tints a sprite with a color
	 *
	 * @private
	 * @param {PIXI.Container} sprite - the sprite to be tinted
	 * @param {number} color - the selected color
	 */
	_tintSprite(sprite: PIXI.Container, color: number): void {
		sprite.tint = color;
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
				data: { scaleMode: "nearest" },
			})));
		} catch (error) {
			app.destroy(true, { children: true });
			throw error;
		}
		this.host.app = app;
		this.host.pix_canvas.appendChild(app.canvas);
		this.host.app.stage.eventMode = "static";
		this.host.app.stage.hitArea = this.host.app.screen;
		this.grid = new WorkspaceGrid();
		app.stage.addChild(this.grid.mesh, this.world);
		app.canvas.addEventListener("wheel", this.zoomFromWheel, { passive: false });
		this.observeCanvas();
		this.applyCamera();
		// pointermove (not mousemove) so mousePos stays current for touch too.
		// A drag is ended only on pointerup/pointerupoutside — not when the
		// pointer briefly leaves the sprite bounds during a fast drag.
		this.host.app.stage.on("pointermove", (event) => {
			this.updateMousePosition(event);
		});
		app.stage.on("globalpointermove", (event) => this.movePan(event));
		app.stage.on("pointerdown", (event) => {
			if (this._dragActive || this.pan) return;
			this.updateMousePosition(event);
			if (this.host.contextMenu.style.display !== "none") {
				this.host.contextMenu.style.display = "none";
				if (event.button === 0) this.host.clearObjectSelection();
				return;
			}
			if (event.target === app.stage && event.button === 0) {
				if (this.host.placeSelectedComponent(this.host.mousePos[0], this.host.mousePos[1])) return;
				this.beginPan(event);
				if (!this.host.canAuthor && event.pointerType !== "mouse") {
					const { x, y } = event.global;
					this._armLongPress(() => {
						if (this.pan) this.pan.deselect = false;
						this._openCanvasMenu(x, y);
					}, event);
				}
			} else if (event.button === 1) {
				this.beginPan(event);
			} else if (!this.host.canAuthor && event.button === 2) {
				this._openCanvasMenu(event.global.x, event.global.y);
			}
		});
		const finishPointer = (event: PIXI.FederatedPointerEvent) => {
			if (this.pan?.id === event.pointerId) {
				const { moved, deselect } = this.pan;
				this.pan = undefined;
				this._clearLongPress();
				if (deselect && !moved) this.host.clearObjectSelection();
			} else if (!this.pan && (!this._dragActive || event.pointerId === this.dragPointerId)) {
				void this._dragEnd();
			}
		};
		this.host.app.stage.on("pointerup", finishPointer);
		this.host.app.stage.on("pointerupoutside", finishPointer);
		this.host.app.stage.on("pointercancel", (event) => {
			if (this.pan?.id === event.pointerId || this.dragPointerId === event.pointerId) this.cancelPointerInteraction();
		});
	}

	/**
	 * ticker function to update sprite textures according to the components content
	 *
	 * @private
	 */
	_updateSpriteTextures(): void {
		for (const sprite of this.world.children) {
			const [type, id] = sprite.label.split(":");
			const graphic = componentGraphic(type);
			if (!graphic.capacityMl) continue;
			const component = this.host.allChemComponents.find((entry) => entry._type === type && entry._id === Number(id));
			if (!component) continue;
			const mixture = component._content;
			const filled = mixture._isSolution || mixture.hasLiquidVolume ? graphic.liquid : graphic.solid;
			const url = mixture._activeMolecules.length ? filled ?? graphic.url : graphic.url;
			const texture = PIXI.Assets.get<PIXI.Texture>(url);
			if (sprite instanceof PIXI.Sprite && sprite.texture !== texture) sprite.texture = texture;
		}
	}

	/**
	 * ticker function to update cables and their positions
	 *
	 * @private
	 */
	_updateCablePos(): void {
		const cables = this.host.allEComponents.filter((component) => component._type === chemlib.EComponentType.Cable);
		if (cables.length === 0) return;
		const stage = this.world;
		const sprites = new Map(stage.children.map((sprite) => [sprite.label, sprite]));
		const selected = stage.children[this.host.curr_stage_index];
		for (const cable of cables) {
			const sprite = sprites.get(`cable:${cable._id}`);
			if (!(sprite instanceof PIXI.Sprite) || sprite.parent !== stage) continue;
			const [first, second] = cable._connections;
			const from = first && sprites.get(`${first._type}:${first._id}`);
			const to = second && sprites.get(`${second._type}:${second._id}`);
			if (!from || !to || from.parent !== stage || to.parent !== stage) {
				this.host._getObject(sprite);
				this.host._removeSprite();
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
				if (previous instanceof PIXI.RenderTexture) previous.destroy(true);
				this.cableEndpoints.set(sprite, endpoints);
			}
			const index = stage.getChildIndex(sprite);
			const behindDevices = Math.min(stage.getChildIndex(from), stage.getChildIndex(to));
			if (index > behindDevices) stage.setChildIndex(sprite, behindDevices);
		}
		if (selected?.parent === stage && this.host.curr_obj) this.host.curr_stage_index = stage.getChildIndex(selected);
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

		const lineWidth: number = 3;
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
			.stroke({ width: lineWidth, color: 0x000000, cap: "round" });
		const texture = this.host.app.renderer.generateTexture({
			target: graphics,
			frame: new PIXI.Rectangle(minX, minY, w, h),
		});

		return { texture, cx: minX + w / 2, cy: minY + h / 2, w, h };
	}
}
