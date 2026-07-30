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

	constructor(host: ChemLab) {
		this.host = host;
		host.addController(this);
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
			// !(info === this.host.curr_name) ? this.host._getObject(sprite) : {};
			this.host.reportXApi("focused", sprite.name);

			if (this.host.hasTouch && event.pointerType === "touch") {
				if (!this.host.touchHighlight) {
					sprite.emit("mouseenter", event);
					this.host.touchHighlight = true;
					return;
				} else {
					this.host.touchHighlight = false;
				}
			}

			if (this.host.dragToggle || !this.host.hasTouch) {
				this._dragStart(sprite);
				if (this.host.hasTouch) {
					return;
				}
			}

			let contextBadge: SlBadge = this.host.shadowRoot.getElementById(
				"contextBadge"
			) as SlBadge;
			contextBadge.innerHTML = this.host.dictionary[sprite.name.split(":")[0]];

			if (event.button === 2 || event.pointerType != "mouse") {
				let currSprite = this.host.app.stage.children[this.host.curr_stage_index];
				this.host.contextPopupAnchor.style.top =
					currSprite.y.toString() + "px";
				this.host.contextPopupAnchor.style.left =
					currSprite.x.toString() + "px";
				this.host.contextPopupAnchor.style.width =
					currSprite.width.toString() + "px";
				this.host.contextPopupAnchor.style.height =
					currSprite.height.toString() + "px";
				this.host.contextPopup.reposition();

				let contextInfoBox: HTMLDivElement =
					this.host.shadowRoot.getElementById(
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
			if (!this.host.hasTouch) {
				contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m-32 16h16v72H64V80a48.05 48.05 0 0 1 48-48m32 192h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> Kontextmenü</p>
				<sl-divider style="margin-top: 2px; margin-bottom: 2px"></sl-divider>
				<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 64v24h-64V32h16a48.05 48.05 0 0 1 48 48m-48 144h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"/></svg> Bewegen</p>
				`;
			} else {
				if (this.host.dragToggle) {
					contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M22 43c-4.726-1.767-8.667-7.815-10.64-11.357c-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.882 3.003C37.095 39.82 35.256 42.034 33 43c-3.5 1.5-6.63 1.634-11 0M10 8h22m-18 4l-4-4l4-4m14 0l4 4l-4 4"/></svg> Bewegen</p>`;
				} else {
					contextActionsInfo.innerHTML = `<p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"><path stroke-linejoin="round" d="M15 26V15a3 3 0 1 1 6 0v11"/><path stroke-linejoin="round" d="M39 25v6.5C39 37.851 33.851 43 27.5 43h-1C20.149 43 15 37.851 15 31.5V25"/><path stroke-linejoin="round" d="M21 29v-5a3 3 0 1 1 6 0v5m0 0v-5a3 3 0 1 1 6 0v5m0 0v-5a3 3 0 1 1 6 0v5"/><path d="M28 15a9.97 9.97 0 0 0-1.959-5.945A9.99 9.99 0 0 0 18 5a9.99 9.99 0 0 0-8.042 4.055A9.97 9.97 0 0 0 8 15"/></g></svg> Kontextmenü</p>`;
				}
			}

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
	_dragStart(sprite: PIXI.Sprite): void {
		this.host.dragObject = sprite;
		this.host.app.stage.on("pointermove", (event) => {
			this._dragMove(event);
			this.host.contextPopup.active = false;
		});
	}

	/**
	 * custom drag event for sprites, handles interaction behaviour
	 *
	 * @private
	 * @param {*} event - the drag event data
	 */
	_dragMove(event): void {
		if (this.host.dragObject) {
			this.host.dragObject.parent.toLocal(
				event.global,
				null,
				this.host.dragObject.position
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
		if (typeof this.host.dragObject != "undefined") {
			if (this.host.app.stage._events["pointermove"]) {
				delete this.host.app.stage._events["pointermove"];
				this.host.app.stage._eventsCount -= 1;
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
		this.host.app.stage.on("mousemove", (event) => {
			this.host.mousePos = [event.screenX, event.screenY];
			if (!this._mouseInbounds(this.host.curr_stage_index, 0)) {
				this._dragEnd();
			}
		});
		this.host.app.stage.on("pointerdown", (event) => {
			if (this.host.contextMenu.style.display != "none") {
				this.host.contextMenu.style.display = "none";
				return;
			}
			if(event.pointerType === "mouse" && event.button === 2 || event.pointerType != "mouse" && event.pressure > 0.7){
				this.host.mousePos = [event.screenX, event.screenY];
				if (
					this.host.curr_stage_index > -1 &&
					this._mouseInbounds(this.host.curr_stage_index, 0)
				) {
					return;
				}
				this.host.contextMenu.style.display = "";
				this.host.contextMenu.style.top =
					Math.round(event.globalY).toString() + "px";
				this.host.contextMenu.style.left =
					Math.round(event.globalX).toString() + "px";
				this.host.contextPopup.active = false;

				this.host.reportXApi("opened", "objectMenu");
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
