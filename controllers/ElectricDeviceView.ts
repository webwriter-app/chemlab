import { CanvasSource, Container, DOMAdapter, Graphics, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { EComponentType, type ElectricComponent } from "../chemlib/ElectricComponent";
import { ELECTRODE_AREA } from "../chemlib/halfReactions";
import { MOLAR_GAS_VOLUME_ML } from "../chemlib/gasEvolution";
import { componentTerminals, componentVariant, type TerminalPoint } from "../data/componentGraphics";
import { AQUEOUS_FILL } from "./VesselView";

function reading(value: number | null | undefined, unit: string): string {
	return `${Number.isFinite(value) ? Number(value.toPrecision(4)) : "—"} ${unit}`;
}

/**
 * The bare magnitude of a reading, without its unit, for a display that
 * prints the unit on a line of its own.
 */
function magnitude(value: number | null | undefined): string {
	return `${Number.isFinite(value) ? Number(Math.abs(value as number).toPrecision(4)) : "—"}`;
}

/**
 * A device shows the magnitude of the current: the sign of the solved value
 * only says which electrode came first in the circuit walk.
 */
function currentReading(value: number | null | undefined): string {
	return `${magnitude(value)} A`;
}

/**
 * Bulk volume of metal that fills the electrode strip as a coating. The strip
 * is a gauge rather than a scale: a layer of about 4 µm is a plating that is
 * already clearly visible after a minute at a few hundred milliamps, so that
 * is what fills it. A thicker deposit keeps the strip full.
 */
const PLATING_REFERENCE_LITRES = 1.8e-6;

/**
 * The share of the reference volume at which the coating has become fully
 * opaque. A fresh deposit first tints the whole strip and only then thickens,
 * so the first metal to arrive reads as a haze over the metal instead of a
 * band at its lower end.
 */
const PLATING_OPAQUE_AT = 0.35;

/**
 * How far the coating bulges past the strip once the deposit reaches the
 * reference thickness. A layer grows in thickness, which in a flat drawing
 * reads as a wider silhouette, not as a taller one.
 */
const PLATING_MAX_BULGE = 1.25;

/**
 * The drawn coating textures, one per metal colour. A deposit is a sprite
 * scaled to its thickness, so the texture is built once and the per-frame
 * work stays a transform instead of a geometry rebuild.
 */
const platingTextures = new Map<number, Texture>();

/**
 * Builds the look of a metal coating: a body that darkens towards the lower,
 * older end, crystalline grains that catch the light at different angles,
 * fine horizontal grain, and a lit left flank with a shadowed right edge, the
 * way the electrode graphic itself is lit. The colour comes from the metal,
 * so copper, zinc and silver each read as themselves.
 *
 * @param {number} color - the metal colour as 0xRRGGBB
 * @returns {Texture} the coating texture, cached per colour
 */
function platingTexture(color: number): Texture {
	const cached = platingTextures.get(color);
	if (cached) return cached;
	const resolution = 3;
	const width = 32;
	const height = 128;
	const canvas = DOMAdapter.get().createCanvas(width * resolution, height * resolution);
	const context = canvas.getContext("2d");
	context.scale(resolution, resolution);
	const shade = (factor: number, alpha = 1) => {
		const channel = (shift: number) =>
			Math.min(255, Math.round(((color >> shift) & 0xff) * factor));
		return `rgba(${channel(16)}, ${channel(8)}, ${channel(0)}, ${alpha})`;
	};
	// The deposit is seen through the solution, which pulls every colour
	// towards its own blue. A dark, saturated body keeps the contrast against
	// the pale electrode, and a highlight mixed towards white is the only
	// thing that can still read as a sheen under that overlay.
	const lighten = (amount: number, alpha = 1) => {
		const channel = (shift: number) => {
			const base = (color >> shift) & 0xff;
			return Math.round(base + (255 - base) * amount);
		};
		return `rgba(${channel(16)}, ${channel(8)}, ${channel(0)}, ${alpha})`;
	};
	const body = context.createLinearGradient(0, 0, 0, height);
	body.addColorStop(0, shade(0.86));
	body.addColorStop(0.5, shade(0.68));
	body.addColorStop(1, shade(0.52));
	context.fillStyle = body;
	context.fillRect(0, 0, width, height);
	// A deposit is crystalline: grains grow side by side and catch the light
	// at different angles. The patches are seeded from the colour, so a metal
	// always looks the same and the texture stays cacheable.
	let seed = (color >>> 0) || 1;
	const random = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 0x100000000;
	};
	for (let patch = 0; patch < 320; patch++) {
		const x = random() * width;
		const y = random() * height;
		const radiusX = 0.5 + random() * 1.3;
		const radiusY = 0.7 + random() * 1.9;
		context.fillStyle = random() > 0.45
			? lighten(0.16 + random() * 0.3, 0.07 + random() * 0.11)
			: shade(0.5 + random() * 0.22, 0.06 + random() * 0.1);
		context.beginPath();
		context.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2);
		context.fill();
	}
	// Fine horizontal grain: a grown layer is never perfectly even.
	for (let line = 0, dark = true; line < height; line += 1, dark = !dark) {
		context.fillStyle = dark ? shade(0.5, 0.05) : lighten(0.3, 0.04);
		context.fillRect(0, line, width, 0.6);
	}
	// The strip is lit from the left, so the coating is too: a bright flank, a
	// dull middle and a shadowed right edge.
	const flank = context.createLinearGradient(0, 0, width, 0);
	flank.addColorStop(0, lighten(0.55, 0.5));
	flank.addColorStop(0.22, lighten(0.4, 0.16));
	flank.addColorStop(0.62, shade(0.85, 0));
	flank.addColorStop(1, shade(0.35, 0.5));
	context.fillStyle = flank;
	context.fillRect(0, 0, width, height);
	const texture = new Texture({
		source: new CanvasSource({ resource: canvas, resolution, autoGenerateMipmaps: true }),
	});
	platingTextures.set(color, texture);
	return texture;
}

/**
 * The drawn interior of the gas collection tube, in artboard fractions of the
 * 20 x 120 mm graphic: the glass wall is 1.2 mm thick, so the bore runs from
 * 2.6 to 17.4 across and from 2.6 to 115.4 down, with the rounded closed top
 * of 5.4 mm.
 */
const TUBE_BORE = { left: 2.6 / 20, right: 17.4 / 20, top: 2.6 / 120, bottom: 115.4 / 120, radius: 5.4 / 120 };

/**
 * Volume of that bore in millilitres, so the collected gas can be turned into
 * a filling level. A 14.8 mm bore over 112.8 mm holds about 19.4 mL.
 */
const TUBE_VOLUME_ML = Math.PI * (14.8 / 2) ** 2 * 112.8 / 1000;

export class ElectricDeviceView extends Container {
	private lines: { text: Text; maxWidth: number }[] = [];
	private indicator?: Graphics;
	private active = false;
	private coating?: Sprite;
	private strip?: { left: number; right: number; top: number; bottom: number };
	private coatingKey = "";
	/** the liquid column inside a gas collection tube, drawn behind the glass */
	private tubeFill?: Graphics;
	/** the drawn bore of the tube in local coordinates */
	private tube?: { left: number; right: number; top: number; bottom: number; radius: number };
	/** what the tube currently shows, so it is only redrawn on change */
	private tubeKey = "";
	/** the terminals of this device in local coordinates, empty if it has none */
	private readonly terminals: TerminalPoint[];
	/** the drawn size in world units, for the port marker radius */
	private readonly artboard: { width: number; height: number };
	/** the permanent terminal markers, created for a device that has terminals */
	private portLayer?: Graphics;
	/** what the port layer currently shows, so it is only redrawn on change */
	private portKey = "";
	/** whether the pointer rests on this device, which brightens its free plugs */
	private portHover = false;
	/** the terminal a dragged cable would land on, or -1 */
	private portHighlight = -1;

	constructor(readonly component: ElectricComponent, texture: Texture, width: number, height: number) {
		super({ interactiveChildren: false });
		this.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
		this.addChild(new Sprite({ texture, anchor: 0.5, width, height, eventMode: "none" }));
		this.artboard = { width, height };
		// The artboard coordinates of the terminals become local offsets from
		// the sprite centre, which is where the texture is anchored.
		this.terminals = componentTerminals(component._type).map(({ x, y, r }) => ({
			x: width * (x - 0.5),
			y: height * (y - 0.5),
			r: height * (r ?? 0),
		}));
		const addLine = (x: number, y: number, fontSize: number, maxWidth: number) => {
			const text = new Text({ anchor: 0.5, resolution: 3, eventMode: "none",
				style: { fontFamily: "monospace", fontSize: height * fontSize, fontWeight: "bold", fill: 0x213a2c } });
			text.position.set(width * (x - 0.5), height * (y - 0.5));
			this.lines.push({ text, maxWidth: width * maxWidth });
			this.addChild(text);
		};
		const addIndicator = (x: number, y: number, radius: number) => {
			this.indicator = new Graphics({ eventMode: "none" })
				.circle(width * (x - 0.5), height * (y - 0.5), height * radius).fill(0xffffff);
			this.indicator.tint = 0x3b5255;
			this.addChild(this.indicator);
		};

		switch (component._type) {
			case EComponentType.Source:
				addLine(65.5 / 206, 41 / 130, 0.16, 0.43);
				addLine(65.5 / 206, 72 / 130, 0.16, 0.43);
				addIndicator(46 / 206, 106.5 / 130, 0.028);
				break;
			case EComponentType.Voltmeter:
				addLine(0.5, 42 / 106, 0.17, 0.65);
				addIndicator(15 / 90, 73 / 106, 0.026);
				break;
			case EComponentType.Ammeter:
				addLine(0.5, 37.5 / 106, 0.155, 0.65);
				addLine(0.5, 52 / 106, 0.085, 0.65);
				break;
			case EComponentType.Multimeter:
				addLine(0.5, 41 / 106, 0.17, 0.65);
				break;
			case EComponentType.GasCollector:
				// The tube shows what it holds as a liquid column, so it needs
				// no text of its own; the collected volume is in the panel.
				this.tube = {
					left: width * (TUBE_BORE.left - 0.5),
					right: width * (TUBE_BORE.right - 0.5),
					top: height * (TUBE_BORE.top - 0.5),
					bottom: height * (TUBE_BORE.bottom - 0.5),
					radius: height * TUBE_BORE.radius,
				};
				this.tubeFill = new Graphics({ eventMode: "none" });
				// Behind the glass, so the outline, the graduation and the
				// highlight stay on top of the liquid.
				this.addChildAt(this.tubeFill, 0);
				break;
			case EComponentType.Label:
				addLine(0.5, 0.5, 0.46, 0.9);
				break;
			case EComponentType.Electrode:
				// The strip of the electrode graphic spans 0.4..14.6 of 15 across
				// and 0.4..74.6 of 75 down; the material label ends at y = 16.
				this.strip = {
					left: width * (0.4 / 15 - 0.5),
					right: width * (14.6 / 15 - 0.5),
					top: height * (16 / 75 - 0.5),
					bottom: height * (74.6 / 75 - 0.5),
				};
				this.coating = new Sprite({ anchor: 0.5, eventMode: "none", visible: false });
				this.addChild(this.coating);
				addLine(0.5, 10 / 75, 0.103, 0.72);
				break;
		}
		// The plugs are permanent, so they sit above the graphic and above the
		// coating an electrode carries.
		if (this.terminals.length) {
			this.portLayer = new Graphics({ eventMode: "none" });
			this.addChild(this.portLayer);
		}
		this.refresh();
	}

	setActive(active: boolean): void {
		if (this.active === active) return;
		this.active = active;
		if (this.indicator) this.indicator.tint = active ? 0x68d681 : 0x3b5255;
		this.refresh();
	}

	/**
	 * The radius of a terminal marker in world units. It grows with the device
	 * so a post on the large source stays as easy to hit as one on a meter.
	 *
	 * @readonly
	 * @type {number}
	 */
	get portRadius(): number {
		return Math.max(1.2, Math.min(2.6, this.artboard.height * 0.028));
	}

	/**
	 * The terminal whose marker lies under a point in local coordinates, or -1
	 * when the point is on none of them. The grab radius is wider than the
	 * drawn marker, so a terminal is easy to pick without aiming.
	 *
	 * @param {number} x - local x
	 * @param {number} y - local y
	 * @returns {number} the terminal index, or -1
	 */
	portAt(x: number, y: number): number {
		const reach = this.portRadius * 1.9;
		let best = -1;
		let bestDistance = reach;
		this.terminals.forEach((terminal, index) => {
			const distance = Math.hypot(x - terminal.x, y - terminal.y);
			if (distance <= bestDistance) {
				best = index;
				bestDistance = distance;
			}
		});
		return best;
	}

	/**
	 * The local position of one terminal, for drawing a wire that starts there.
	 *
	 * @param {number} terminal - the terminal index
	 * @returns {(TerminalPoint | undefined)}
	 */
	terminalPoint(terminal: number): TerminalPoint | undefined {
		return this.terminals[terminal];
	}

	/**
	 * Draws the terminal markers of this device. They are permanent, so the
	 * plugs of the graphic always read as the places a cable goes; a terminal
	 * that already carries a cable is drawn dimmer, and the one a dragged
	 * cable would land on is drawn in the accent colour.
	 *
	 * A post takes any number of leads, so a taken terminal is not closed: it
	 * only stops being drawn as free.
	 *
	 * @private
	 */
	private drawPorts(): void {
		const layer = this.portLayer;
		if (!layer) return;
		const loads = this.component._connections.map((partners) => partners.length);
		const key = `${loads.join(",")}|${this.portHover}|${this.portHighlight}`;
		if (key === this.portKey) return;
		this.portKey = key;
		layer.clear();
		this.terminals.forEach((point, terminal) => {
			const isFree = !loads[terminal];
			const active = terminal === this.portHighlight;
			// The ring sits just outside the drawn post, so the plus and minus
			// marks of the graphic stay readable under it.
			const radius = (point.r ?? 0) + Math.max(0.7, this.portRadius * 0.35);
			if (active) {
				layer.circle(point.x, point.y, radius + 0.6)
					.fill({ color: 0x0284c7, alpha: 0.35 })
					.stroke({ color: 0x0284c7, width: 1.1, alpha: 0.95 });
				return;
			}
			layer.circle(point.x, point.y, radius).stroke({
				color: isFree ? 0xf1f4f5 : 0x263844,
				width: isFree && this.portHover ? 1.3 : 1,
				alpha: isFree ? (this.portHover ? 0.95 : 0.6) : 0.45,
			});
		});
	}

	/**
	 * Marks the terminal a dragged cable would land on. The markers themselves
	 * stay visible, so this only changes the emphasis.
	 *
	 * @param {number} [highlight=-1] - the terminal to draw as the target
	 */
	showPorts(highlight = -1): void {
		this.portHighlight = highlight;
		this.drawPorts();
	}

	/**
	 * Drops the target emphasis again. The markers stay, because they are part
	 * of the device.
	 */
	hidePorts(): void {
		this.portHighlight = -1;
		this.drawPorts();
	}

	/**
	 * Brightens the free plugs while the pointer rests on the device, which
	 * hints that a cable can be pulled from them.
	 *
	 * @param {boolean} hovered - whether the pointer is on the device
	 */
	setPortHover(hovered: boolean): void {
		if (this.portHover === hovered) return;
		this.portHover = hovered;
		this.drawPorts();
	}

	refresh(): boolean {
		const component = this.component;
		// A cable that was laid or removed changes which plugs are free.
		this.drawPorts();
		let values: string[];
		switch (component._type) {
			case EComponentType.Source: {
				// A supply that is wired to nothing shows its setting. One
				// that is wired shows what it measures, and a dash where
				// there is no measurement: a supply whose lead hangs on one
				// post must not present its setpoint as the terminal voltage,
				// and one that cannot deliver its set current must not
				// present that either.
				const idle = !component._connections.some((list) => list.length > 0);
				const solved = component._visibleVoltage !== null || component._visibleCurrent !== null;
				const setpoint = idle || solved;
				values = [
					reading(component._visibleVoltage ?? (setpoint ? component._sourceVoltage : null), "V"),
					currentReading(component._visibleCurrent ?? (setpoint ? component._sourceCurrent : null)),
				];
				break;
			}
			case EComponentType.Voltmeter:
				values = [reading(component._visibleVoltage, "V")];
				break;
			case EComponentType.Ammeter:
				// The LCD has two rows: the reading on top and its unit below,
				// the way a bench meter prints them.
				values = [magnitude(component._visibleCurrent), "A"];
				break;
			case EComponentType.Multimeter:
				values = [component._meterMode === "voltage"
					? reading(component._visibleVoltage, "V")
					: currentReading(component._visibleCurrent)];
				break;
			case EComponentType.GasCollector:
				// The tube draws its contents instead of a reading.
				values = [];
				break;
			case EComponentType.Label:
				values = [component._labelText];
				break;
			case EComponentType.Electrode:
				// A metal strip is labelled with its element; a reference
				// electrode has no material and carries its own short name.
				values = [component._material?._atoms[0]?.getSymbol()
					?? componentVariant(component._variantId)?.short ?? ""];
				break;
			default:
				return false;
		}

		let changed = false;
		this.lines.forEach(({ text, maxWidth }, index) => {
			// A display may draw more rows than a state supplies; the spare row
			// stays blank instead of taking the whole view down.
			const value = values[index] ?? "";
			if (text.text === value) return;
			text.text = value;
			text.scale.set(1);
			if (text.width > maxWidth) text.scale.set(maxWidth / text.width);
			changed = true;
		});
		return this.refreshCoating() || this.refreshTube() || changed;
	}

	/**
	 * Draws the liquid column inside a gas collection tube. The tube hangs in a
	 * solution, so it starts full; the gas that bubbles up gathers at the
	 * closed top and pushes the meniscus down, the same way a vessel shows its
	 * filling.
	 *
	 * @private
	 * @return {boolean} whether the drawing changed
	 */
	private refreshTube(): boolean {
		const fill = this.tubeFill;
		const tube = this.tube;
		if (!fill || !tube) return false;
		const mix = this.component._connectedMix;
		const inSolution = !!mix?._isSolution;
		const gasMl = (mix?.evolvedGasMol ?? 0) * MOLAR_GAS_VOLUME_ML;
		const gasFraction = inSolution ? Math.max(0, Math.min(1, gasMl / TUBE_VOLUME_ML)) : 0;
		const key = inSolution ? gasFraction.toFixed(4) : "";
		if (key === this.tubeKey) return false;
		this.tubeKey = key;
		fill.clear();
		if (!key) return true;

		const { left, right, top, bottom, radius } = tube;
		const surface = top + (bottom - top) * gasFraction;
		const dome = top + radius;
		// The closed top is rounded, so a surface inside the dome has to follow
		// the corner arc instead of spanning the full bore.
		const inset = (y: number) => radius - Math.sqrt(Math.max(0, radius * radius - (dome - y) ** 2));
		const points: { x: number; y: number }[] = [{ x: left, y: bottom }];
		if (surface < dome) {
			const steps = 8;
			points.push({ x: left, y: dome });
			for (let step = 1; step <= steps; step++) {
				const y = dome - (dome - surface) * (step / steps);
				points.push({ x: left + inset(y), y });
			}
			for (let step = steps; step >= 0; step--) {
				const y = dome - (dome - surface) * (step / steps);
				points.push({ x: right - inset(y), y });
			}
		} else {
			points.push({ x: left, y: surface }, { x: right, y: surface });
		}
		points.push({ x: right, y: bottom });
		fill.poly(points).fill({ color: AQUEOUS_FILL.color, alpha: AQUEOUS_FILL.alpha });

		// A water meniscus curves down in the middle, so the surface line bends
		// away from the wall it touches.
		const edge = surface < dome ? inset(surface) : 0;
		const bend = Math.min((right - left - 2 * edge) * 0.08, 0.6);
		fill.moveTo(left + edge, surface)
			.quadraticCurveTo((left + right) / 2, surface + bend, right - edge, surface)
			.stroke({ color: 0x287399, alpha: 0.8, width: 0.24 });
		return true;
	}

	/**
	 * Draws the metal deposited on an electrode as a coating on the strip. The
	 * layer covers the whole strip from the first moment and only thickens
	 * with the deposit: the alpha climbs until the metal is opaque, then the
	 * silhouette widens past the strip.
	 *
	 * @private
	 * @return {boolean} whether the drawing changed
	 */
	private refreshCoating(): boolean {
		const coating = this.coating;
		const strip = this.strip;
		if (!coating || !strip) return false;
		const plating = this.component.plating;
		// A wider electrode carries more current at the same density, so the
		// same deposit is a thinner layer on it. Scaling the reference volume
		// with the area keeps the drawn thickness the real one.
		const area = this.component.activeArea || ELECTRODE_AREA;
		const reference = PLATING_REFERENCE_LITRES * area / ELECTRODE_AREA;
		const coverage = plating ? Math.min(1, plating.litres / reference) : 0;
		const key = plating && coverage > 0 ? `${plating.molecule.smilesString}:${coverage.toFixed(3)}` : "";
		if (key === this.coatingKey) return false;
		this.coatingKey = key;
		if (!plating || !key) {
			coating.visible = false;
			return true;
		}
		const hex = plating.molecule._atoms[0]?.getCPKHEX();
		const parsed = hex ? parseInt(hex, 16) : NaN;
		coating.texture = platingTexture(Number.isFinite(parsed) ? parsed : 0x84949b);
		const grown = Math.max(0, (coverage - PLATING_OPAQUE_AT) / (1 - PLATING_OPAQUE_AT));
		coating.alpha = Math.min(1, coverage / PLATING_OPAQUE_AT);
		coating.position.set((strip.left + strip.right) / 2, (strip.top + strip.bottom) / 2);
		coating.width = (strip.right - strip.left) * (1 + (PLATING_MAX_BULGE - 1) * grown);
		coating.height = strip.bottom - strip.top;
		coating.visible = true;
		return true;
	}
}
