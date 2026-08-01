import { ReactiveController } from "lit";
import * as PIXI from "pixi.js";
import * as chemlib from "chemlib";
import SlBadge from "@shoelace-style/shoelace/dist/components/badge/badge.component.js";

// @ts-ignore
import beaker_svg from "../media/beaker.svg";
// @ts-ignore
import flask_svg from "../media/flask.svg";
// @ts-ignore
import burette_svg from "../media/burette.svg";
// @ts-ignore
import testtube_svg from "../media/testtube.svg";
// @ts-ignore
import cable_svg from "../media/cable.svg";
// @ts-ignore
import source_off_svg from "../media/source_off.svg";
// @ts-ignore
import voltmeter_off_svg from "../media/voltmeter_off.svg";
// @ts-ignore
import default_svg from "../media/default.svg";
import { HALF_PI } from "chart.js/helpers";
// @ts-ignore
import beaker_fl_svg from "../media/beaker_full_l.svg";
// @ts-ignore
import beaker_fs_svg from "../media/beaker_full_s.svg";
// @ts-ignore
import flask_fl_svg from "../media/flask_full_l.svg";
// @ts-ignore
import flask_fs_svg from "../media/flask_full_s.svg";
// @ts-ignore
import burette_fl_svg from "../media/burette_full_l.svg";
// @ts-ignore
import burette_fs_svg from "../media/burette_full_s.svg";
// @ts-ignore
import testtube_fl_svg from "../media/testtube_full_l.svg";
// @ts-ignore
import testtube_fs_svg from "../media/testtube_full_S.svg";

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

	/** true while a sprite drag is in progress (pointermove listener attached) */
	private _dragActive: boolean = false;
	/** stable pointermove handler, so it can be removed again with .off() */
	private _dragMoveHandler = (event: any): void => {
		this._dragMove(event);
		this.host.contextPopup.active = false;
	};
	/** offset from the sprite's origin to the point where it was grabbed, so a
	 * drag keeps that point under the pointer instead of snapping to the centre */
	private _dragOffset: PIXI.Point = new PIXI.Point();
	/** inactivity timer that closes the sprite context popup */
	private _contextCloseTimer: number = undefined;
	/** pointer-move handler that closes the context popup once the pointer
	 * travels far enough from both the sprite and the dialog */
	private _contextMoveHandler: (event: PointerEvent) => void = undefined;
	/** pending long-press timer id (touch/pen context-menu trigger) */
	private _longPressTimer: number = undefined;
	/** stage move handler that cancels a long-press once the pointer moves */
	private _longPressMoveHandler: (event: any) => void = undefined;

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

	/**
	 * Stops an in-progress drag without running the drop logic (used when a
	 * long-press turns the gesture into a context-menu open instead of a move).
	 *
	 * @private
	 */
	private _cancelDrag(): void {
		if (this._dragActive) {
			this.host.app.stage.off("pointermove", this._dragMoveHandler);
			this._dragActive = false;
		}
		if (
			this.host.curr_stage_index > -1 &&
			this.host.app.stage.children[this.host.curr_stage_index]
		) {
			this.host.app.stage.children[this.host.curr_stage_index].rotation = 0;
		}
		this.host.dragObject = undefined;
		this.host._hideAlert();
	}

	/**
	 * Opens the info/actions context popup for a sprite (right-click or
	 * long-press).
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the sprite the popup belongs to
	 */
	private _openSpriteContext(sprite: PIXI.Sprite): void {
		let currSprite = this.host.app.stage.children[this.host.curr_stage_index];
		this.host.contextPopupAnchor.style.top = currSprite.y.toString() + "px";
		this.host.contextPopupAnchor.style.left = currSprite.x.toString() + "px";
		this.host.contextPopupAnchor.style.width =
			currSprite.width.toString() + "px";
		this.host.contextPopupAnchor.style.height =
			currSprite.height.toString() + "px";
		this.host.contextPopup.reposition();

		let contextInfoBox: HTMLDivElement = this.host.shadowRoot.getElementById(
			"contextInfoBox"
		) as HTMLDivElement;
		contextInfoBox.style.visibility = "visible";
		let contextActionsInfo: HTMLDivElement =
			this.host.shadowRoot.getElementById(
				"contextActionsInfo"
			) as HTMLDivElement;
		contextActionsInfo.style.display = "none";

		this.host._updatePopup();

		this.host.contextPopup.active = true;
		this.host.contextPopup.reposition();
		this.host.reportXApi("opened", "contextMenu-" + sprite.name);
		this._startContextAutoClose(sprite);
	}

	/**
	 * Auto-closes the sprite context popup opened by {@link _openSpriteContext}.
	 * Two independent triggers: an inactivity timeout (reset while the pointer
	 * is over the dialog) and a distance check that closes it once the pointer
	 * moves far enough from both the sprite and the dialog.
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the sprite the popup belongs to
	 */
	private _startContextAutoClose(sprite: PIXI.Sprite): void {
		this._stopContextAutoClose();
		const TIMEOUT: number = 4000; // ms of inactivity before closing
		const DISTANCE: number = 150; // px from the sprite or dialog edge

		const resetTimer = () => {
			if (this._contextCloseTimer !== undefined) {
				window.clearTimeout(this._contextCloseTimer);
			}
			this._contextCloseTimer = window.setTimeout(
				() => this._closeSpriteContext(),
				TIMEOUT
			);
		};
		resetTimer();

		const distToRect = (x, y, r): number => {
			const dx: number = Math.max(r.left - x, 0, x - r.right);
			const dy: number = Math.max(r.top - y, 0, y - r.bottom);
			return Math.sqrt(dx * dx + dy * dy);
		};

		this._contextMoveHandler = (event: PointerEvent) => {
			// self-clean if the popup was closed by some other path
			if (!this.host.contextPopup.active) {
				this._stopContextAutoClose();
				return;
			}
			const infoBox: HTMLDivElement = this.host.shadowRoot.getElementById(
				"contextInfoBox"
			) as HTMLDivElement;
			const dialogRect = infoBox.getBoundingClientRect();
			const canvasRect = (
				this.host.app.view as HTMLCanvasElement
			).getBoundingClientRect();
			const b = sprite.getBounds();
			const spriteRect = {
				left: canvasRect.left + b.x,
				top: canvasRect.top + b.y,
				right: canvasRect.left + b.x + b.width,
				bottom: canvasRect.top + b.y + b.height,
			};
			const distDialog: number = distToRect(
				event.clientX,
				event.clientY,
				dialogRect
			);
			// over the dialog: keep it open and restart the inactivity timer
			if (distDialog === 0) {
				resetTimer();
				return;
			}
			const distSprite: number = distToRect(
				event.clientX,
				event.clientY,
				spriteRect
			);
			if (distDialog > DISTANCE && distSprite > DISTANCE) {
				this._closeSpriteContext();
			}
		};
		window.addEventListener("pointermove", this._contextMoveHandler);
	}

	/**
	 * Tears down the context auto-close timer and pointer listener.
	 *
	 * @private
	 */
	private _stopContextAutoClose(): void {
		if (this._contextCloseTimer !== undefined) {
			window.clearTimeout(this._contextCloseTimer);
			this._contextCloseTimer = undefined;
		}
		if (this._contextMoveHandler !== undefined) {
			window.removeEventListener("pointermove", this._contextMoveHandler);
			this._contextMoveHandler = undefined;
		}
	}

	/**
	 * Closes the sprite context popup and stops its auto-close watchers.
	 *
	 * @private
	 */
	private _closeSpriteContext(): void {
		this.host.contextPopup.active = false;
		this._stopContextAutoClose();
	}

	/**
	 * Opens the canvas "new object" menu at the given viewport coordinates
	 * (right-click or long-press on empty canvas).
	 *
	 * @private
	 * @param {number} x - viewport x in px
	 * @param {number} y - viewport y in px
	 */
	private _openCanvasMenu(x: number, y: number): void {
		this.host.contextMenu.style.display = "";
		this.host.contextMenu.style.top = Math.round(y).toString() + "px";
		this.host.contextMenu.style.left = Math.round(x).toString() + "px";
		this.host.contextPopup.active = false;
		this.host.reportXApi("opened", "objectMenu");
	}

	/** No reactive lifecycle work; the canvas is driven imperatively. */
	hostConnected(): void {}
	/**
	 * adds a new sprite to the canvas
	 *
	 * @private
	 * @param {string} info - a string containing the name of the object and its id
	 */
	_addSprite(info: string): void {
		let spriteHeight: number = 0;
		let spriteWidth: number = 0;
		let spriteTexture: any = null;

		switch (info.split(":")[0]) {
			case "beaker":
				spriteHeight = 130;
				spriteWidth = 100;
				spriteTexture = beaker_svg;
				break;
			case "flask":
				spriteHeight = 156;
				spriteWidth = 120;
				spriteTexture = flask_svg;
				break;
			case "burette":
				spriteHeight = 400;
				spriteWidth = 80;
				spriteTexture = burette_svg;
				break;
			case "testtube":
				spriteHeight = 150;
				spriteWidth = 80;
				spriteTexture = testtube_svg;
				break;
			case "cable":
				spriteHeight = 50;
				spriteWidth = 3;
				spriteTexture = cable_svg;
				break;
			case "source":
				spriteHeight = 150;
				spriteWidth = 200;
				spriteTexture = source_off_svg;
				break;
			case "voltmeter":
				spriteHeight = 150;
				spriteWidth = 200;
				spriteTexture = voltmeter_off_svg;
				break;
			case "electrode":
				spriteHeight = 70;
				spriteWidth = 25;
				spriteTexture = default_svg;
				break;
			default:
				spriteHeight = 70;
				spriteWidth = 50;
				spriteTexture = default_svg;
				break;
		}
		let sprite = PIXI.Sprite.from(spriteTexture);

		sprite.anchor.set(0.5);

		sprite.x = this.host.mousePos[0];
		sprite.y = this.host.mousePos[1];
		sprite.width = spriteWidth;
		sprite.height = spriteHeight;
		sprite.eventMode = "static";
		sprite.cursor = "pointer";
		sprite.on("pointerdown", (event) => {
			this.host._getObject(sprite);
			this.host.reportXApi("focused", sprite.name);

			let contextBadge: SlBadge = this.host.shadowRoot.getElementById(
				"contextBadge"
			) as SlBadge;
			contextBadge.innerHTML = this.host.dictionary[sprite.name.split(":")[0]];

			if (event.pointerType === "mouse") {
				// left button drags, right button opens the context popup
				if (event.button === 2) {
					this._openSpriteContext(sprite);
				} else {
					this._dragStart(sprite, event);
				}
			} else {
				// touch / pen: move to drag, press-and-hold for the context popup
				this._dragStart(sprite, event);
				this._armLongPress(() => {
					this._cancelDrag();
					this._openSpriteContext(sprite);
				}, event);
			}
		});
		sprite.on("mouseenter", async (event) => {
			await this.host.waitUntil(() => {
				return true;
			}, 500);
			if (this.host.app.stage.children.indexOf(sprite) === -1) {
				return;
			}
			if (
				!this._mouseInbounds(this.host.app.stage.children.indexOf(sprite), 0)
			) {
				return;
			}

			let contextBadge: SlBadge = this.host.shadowRoot.getElementById(
				"contextBadge"
			) as SlBadge;
			let contextInfoBox: HTMLDivElement = this.host.shadowRoot.getElementById(
				"contextInfoBox"
			) as HTMLDivElement;
			let contextActionsInfo: HTMLDivElement =
				this.host.shadowRoot.getElementById(
					"contextActionsInfo"
				) as HTMLDivElement;

			if (
				this.host.contextPopup.active === true &&
				contextInfoBox.style.visibility === "visible"
			) {
				return;
			}

			this.host.contextPopupAnchor.style.top = sprite.y.toString() + "px";
			this.host.contextPopupAnchor.style.left = sprite.x.toString() + "px";
			this.host.contextPopupAnchor.style.width =
				sprite.width.toString() + "px";
			this.host.contextPopupAnchor.style.height =
				sprite.height.toString() + "px";
			this.host.contextPopup.reposition();

			contextBadge.innerHTML = this.host.dictionary[info.split(":")[0]];

			contextInfoBox.style.visibility = "hidden";
			contextActionsInfo.style.display = "";
			contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m-32 16h16v72H64V80a48.05 48.05 0 0 1 48-48m32 192h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> Kontextmenü</p>
				<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl-divider>
				<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 64v24h-64V32h16a48.05 48.05 0 0 1 48 48m-48 144h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> Bewegen</p>
				`;

			this.host.contextPopup.active = true;
			this.host.reportXApi("opened", "hover-" + sprite.name);
		});

		sprite.on("mouseleave", (event) => {
			let contextInfoBox: HTMLDivElement = this.host.shadowRoot.getElementById(
				"contextInfoBox"
			) as HTMLDivElement;

			if (
				this.host.contextPopup.active === true &&
				contextInfoBox.style.visibility === "visible"
			) {
				return;
			}

			contextInfoBox.style.visibility = "visible";
			this.host.contextPopup.active = false;
		});

		sprite.name = info;
		this.host.app.stage.addChild(sprite);
		if (!sprite.name.includes("cable")) {
			this.host._getObject(sprite);
		}
		this.host.reportXApi("inserted", sprite.name);
	}

	/**
	 * modifies sprite events when an object gets dragged
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the dragged sprite
	 */
	_dragStart(sprite: PIXI.Sprite, event: any): void {
		this._stopContextAutoClose();
		this.host.dragObject = sprite;
		this._dragActive = true;
		// remember where inside the sprite it was grabbed, so it doesn't jump
		const local = sprite.parent.toLocal(event.global);
		this._dragOffset.set(sprite.x - local.x, sprite.y - local.y);
		this.host.app.stage.on("pointermove", this._dragMoveHandler);
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
			for (let i = 0; i < this.host.app.stage.children.length; i++) {
				if (
					i != this.host.curr_stage_index &&
					this._mouseInbounds(
						i,
						50
					)
				) {
					let upperSprite = this.host.app.stage.children[this.host.curr_stage_index]
					let bottomSprite = this.host.app.stage.children[i];
					let cObj: any = undefined;
					let cOType: string = bottomSprite.name
						.split(":")[0]
						.toLowerCase();
					let cOId: number = Number.parseInt(
						bottomSprite.name.split(":")[1]
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
								this.host.curr_obj._type +
									" in " +
									cObj._type +
									" einfügen.",
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
									this.host.curr_obj._type +
										" und " +
										cObj._type +
										" verbinden.",
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
							this.host.app.stage.children[
								this.host.curr_stage_index
							].rotation =
								this.host.app.stage.children[
									this.host.curr_stage_index
								].x > bottomSprite.x
									? -20
									: 20;
							this.host._emitAlert(
								"Inhalt aus " +
									this.host.curr_obj._type +
									" zu " +
									cObj._type +
									" transferieren.",
								"primary",
								false
							);
							mouseHoverObject = i;
						}
					}
				}
			}
			if (mouseHoverObject === -1) {
				this.host.app.stage.children[this.host.curr_stage_index].rotation = 0;
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
		if (typeof this.host.dragObject != "undefined") {
			if (this._dragActive) {
				this.host.app.stage.off("pointermove", this._dragMoveHandler);
				this._dragActive = false;
				for (let i = 0; i < this.host.app.stage.children.length; i++) {
					if (
						i != this.host.curr_stage_index &&
						this._mouseInbounds(
							i,
						50
						)
					) {
						let upperSprite = this.host.app.stage.children[this.host.curr_stage_index]
						let bottomSprite = this.host.app.stage.children[i];
						let cObj: any = undefined;
						let cOType: string = bottomSprite.name
							.split(":")[0]
							.toLowerCase();
						let cOId: number = Number.parseInt(
							bottomSprite.name.split(":")[1]
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
								dialogPanel.style.top =
									(
										this.host.canvasBoundingRect.y +
										this.host.mousePos[1]
									).toString() + "px";
								dialogPanel.style.left =
									(
										this.host.canvasBoundingRect.x +
										this.host.mousePos[0]
									).toString() + "px";
								this.host.confirmDialog.show();
								await this.host.waitUntil(
									() => this.host.confirmAction != 0
								);
								// console.log(this.host.confirmAction);
								if (this.host.confirmAction === 1) {
									this.host.curr_obj._connectedMix = cObj._content;
									this.host._emitAlert(
										this.host.curr_obj._type +
											" in " +
											cObj._type +
											" eingefügt.",
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
										this.host.app.stage.children[
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
									dialogPanel.style.top =
										(
											this.host.canvasBoundingRect.y +
											this.host.mousePos[1]
										).toString() + "px";
									dialogPanel.style.left =
										(
											this.host.canvasBoundingRect.x +
											this.host.mousePos[0]
										).toString() + "px";
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
								dialogPanel.style.top =
									(
										this.host.canvasBoundingRect.y +
										this.host.mousePos[1]
									).toString() + "px";
								dialogPanel.style.left =
									(
										this.host.canvasBoundingRect.x +
										this.host.mousePos[0]
									).toString() + "px";
								this.host.confirmDialog.show();
								await this.host.waitUntil(
									() => this.host.confirmAction != 0
								);
								this.host.app.stage.children[
									this.host.curr_stage_index
								].rotation = 0;
								if (this.host.confirmAction === 1) {
									this.host.curr_obj.transferContents({}, cObj);
									this.host._getObject(this.host.dragObject);
									this.host._emitAlert(
										"Inhalt aus " +
											this.host.curr_obj._type +
											" zu " +
											cObj._type +
											" überführt.",
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
			}
		}
		if (this.host.app.stage.children.length > 1) {
			let wasAvail: boolean = false;
			let ObjectId: number;
			this.host.avComponentsSprites.forEach((arr) => {
				if (
					!wasAvail &&
					arr[0] === this.host.app.stage.children[this.host.curr_stage_index]
				) {
					wasAvail = true;
					ObjectId = arr[1];
				}
			});
			if (wasAvail && this.host.hasAttribute("contenteditable")) {
				let compIndex: number;
				this.host.availableComponents.forEach((comp) => {
					if (comp["id"] === ObjectId) {
						compIndex = this.host.availableComponents.indexOf(comp);
					}
				});
				if (
					this.host.availableComponents[compIndex]["pos"][0] !=
						this.host.app.stage.children[this.host.curr_stage_index].x ||
					this.host.availableComponents[compIndex]["pos"][1] !=
						this.host.app.stage.children[this.host.curr_stage_index].y
				) {
					this.host.availableComponents[compIndex]["pos"][0] =
						this.host.app.stage.children[this.host.curr_stage_index].x;
					this.host.availableComponents[compIndex]["pos"][1] =
						this.host.app.stage.children[this.host.curr_stage_index].y;

					let arrCopy: object[] = [];
					this.host.availableComponents.forEach((comp) => {
						arrCopy.push(comp);
					});
					this.host.availableComponents = [];
					this.host.availableComponents = arrCopy;
				}
			}
		}
	}

	/**
	 * tints a sprite with a color
	 *
	 * @private
	 * @param {PIXI.Sprite} sprite - the sprite to be tinted
	 * @param {number} color - the selected color
	 */
	_tintSprite(sprite: PIXI.Sprite, color: number): void {
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
		if (this.host.app.stage.children.length === 1) {
			return false;
		}
		let objWidth: number = this.host.app.stage.children[index].width;
		let objHeight: number = this.host.app.stage.children[index].height;
		let objX: number = this.host.app.stage.children[index].x - 0.5 * objWidth;
		let objY: number = this.host.app.stage.children[index].y - 0.5 * objHeight;

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
	_canvas_init() {
		this.host.app = new PIXI.Application<HTMLCanvasElement>({
			background: "rgb(238, 243, 246)",
			backgroundAlpha: 0,
			resizeTo: this.host.containerDiv,
		});

		this.host.pix_canvas.appendChild(this.host.app.view);
		PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
		this.host.app.stage.eventMode = "static";
		this.host.app.stage.hitArea = this.host.app.screen;
		this.host.app.stage.sortableChildren = true;
		// pointermove (not mousemove) so mousePos stays current for touch too.
		// A drag is ended only on pointerup/pointerupoutside — not when the
		// pointer briefly leaves the sprite bounds during a fast drag.
		this.host.app.stage.on("pointermove", (event) => {
			this.host.mousePos = [event.screenX, event.screenY];
		});
		this.host.app.stage.on("pointerdown", (event) => {
			if (this.host.contextMenu.style.display != "none") {
				this.host.contextMenu.style.display = "none";
				return;
			}
			this.host.mousePos = [event.screenX, event.screenY];
			// a press on an existing object is handled by that sprite
			if (
				this.host.curr_stage_index > -1 &&
				this._mouseInbounds(this.host.curr_stage_index, 0)
			) {
				return;
			}
			// open the "new object" menu: right-click on mouse, long-press on touch
			if (event.pointerType === "mouse") {
				if (event.button === 2) {
					this._openCanvasMenu(event.globalX, event.globalY);
				}
			} else {
				const gx: number = event.globalX;
				const gy: number = event.globalY;
				this._armLongPress(() => this._openCanvasMenu(gx, gy), event);
			}
		});
		this.host.app.stage.on("pointerup", () => {
			this._dragEnd();
		});
		this.host.app.stage.on("pointerupoutside", () => {
			this._dragEnd();
		});
	}

	/**
	 * ticker function to update sprite textures according to the components content
	 *
	 * @private
	 */
	_updateSpriteTextures(): void {
		this.host.app.stage.children.forEach((sprite: PIXI.Sprite) => {
			let name: string = sprite.name
				.split(":")[0]
				.replace(
					sprite.name.split(":")[0][0],
					sprite.name.split(":")[0][0].toUpperCase()
				);
			let id: number = Number.parseInt(sprite.name.split(":")[1]);
			if (Object.keys(chemlib.ComponentType).includes(name)) {
				this.host.allChemComponents.forEach((comp) => {
					if (comp._type === name.toLowerCase() && comp._id === id) {
						let tex: undefined;
						if (comp._content._activeMolecules.length > 0) {
							if (comp._content._isSolution) {
								switch (comp._type) {
									case "beaker":
										tex = beaker_fl_svg;
										break;
									case "testtube":
										tex = testtube_fl_svg;
										break;
									case "flask":
										tex = flask_fl_svg;
										break;
									case "burette":
										tex = burette_fl_svg;
										break;
									default:
										break;
								}
								sprite.texture = PIXI.Texture.from(tex);
							} else {
								switch (comp._type) {
									case "beaker":
										tex = beaker_fs_svg;
										break;
									case "testtube":
										tex = testtube_fs_svg;
										break;
									case "flask":
										tex = flask_fs_svg;
										break;
									case "burette":
										tex = burette_fs_svg;
										break;
									default:
										break;
								}
								sprite.texture = PIXI.Texture.from(tex);
							}
						} else {
							switch (comp._type) {
								case "beaker":
									tex = beaker_svg;
									break;
								case "testtube":
									tex = testtube_svg;
									break;
								case "flask":
									tex = flask_svg;
									break;
								case "burette":
									tex = burette_svg;
									break;
								default:
									break;
							}
							sprite.texture = PIXI.Texture.from(tex);
						}
					}
				});
			}
		});
	}

	/**
	 * ticker function to update cables and their positions
	 *
	 * @private
	 */
	_updateCablePos(): void {
		let index0: number;
		this.host.app.stage.children.forEach((sprite: PIXI.Sprite) => {
			index0 = this.host.app.stage.children.indexOf(sprite);
			if (sprite.name.includes("cable")) {
				let id: number = Number.parseInt(sprite.name.split(":")[1]);
				this.host.allEComponents.forEach((eComp) => {
					if (
						eComp._type === chemlib.EComponentType.Cable &&
						eComp._id === id
					) {
						let con1: chemlib.ElectricComponent | undefined =
							eComp._connections[0];
						let con2: chemlib.ElectricComponent | undefined =
							eComp._connections[1];

						if (
							typeof con1 != "undefined" &&
							typeof con2 != "undefined"
						) {
							let pos1, pos2: number[];
							let index1, index2: number;
							this.host.app.stage.children.forEach((conSprite) => {
								if (
									conSprite.name.includes(
										con1._type + ":" + con1._id
									)
								) {
									index1 =
										this.host.app.stage.children.indexOf(
											conSprite
										);
									pos1 = [conSprite.x, conSprite.y];
								}
								if (
									conSprite.name.includes(
										con2._type + ":" + con2._id
									)
								) {
									index2 =
										this.host.app.stage.children.indexOf(
											conSprite
										);
									pos2 = [conSprite.x, conSprite.y];
								}
							});
							let minIndex: number = Math.min(
								index0,
								index1,
								index2
							);
							if (minIndex != index0) {
								let buffer: any =
									this.host.app.stage.children[minIndex];
								this.host.app.stage.children[minIndex] = sprite;
								this.host.app.stage.children[index0] = buffer;
							}
							sprite.height = Math.sqrt(
								Math.pow(pos1[0] - pos2[0], 2) +
									Math.pow(pos1[1] - pos2[1], 2)
							);
							sprite.x = (pos1[0] + pos2[0]) / 2;
							sprite.y = (pos1[1] + pos2[1]) / 2;
							sprite.rotation =
								Math.atan(
									(pos1[1] - pos2[1]) / (pos1[0] - pos2[0])
								) + HALF_PI;
						} else {
							this.host._getObject(sprite);
							this.host._removeSprite();
						}
					}
				});
			}
		});
	}
}
