import { Container, Graphics, Rectangle, Sprite, Text, type Texture } from "pixi.js";
import { EComponentType, type ElectricComponent } from "../chemlib/ElectricComponent";
import { ELECTRODE_AREA } from "../chemlib/halfReactions";
import { MOLAR_GAS_VOLUME_ML } from "../chemlib/gasEvolution";

function reading(value: number | null | undefined, unit: string): string {
	return `${Number.isFinite(value) ? Number(value.toPrecision(4)) : "—"} ${unit}`;
}

/**
 * A device shows the magnitude of the current: the sign of the solved value
 * only says which electrode came first in the circuit walk.
 */
function currentReading(value: number | null | undefined): string {
	return reading(Number.isFinite(value) ? Math.abs(value as number) : value, "A");
}

/**
 * Bulk volume of metal that fills the electrode strip as a coating. The strip
 * measures 15 x 75 mm, so this is a layer of about 10 µm, which is already a
 * clearly visible plating after a minute at one ampere.
 */
const PLATING_REFERENCE_LITRES = 1.125e-5;

export class ElectricDeviceView extends Container {
	private lines: { text: Text; maxWidth: number }[] = [];
	private indicator?: Graphics;
	private active = false;
	private measuredVoltage: number | null = null;
	private coating?: Graphics;
	private strip?: { left: number; right: number; top: number; bottom: number };
	private coatingKey = "";

	constructor(readonly component: ElectricComponent, texture: Texture, width: number, height: number) {
		super({ interactiveChildren: false });
		this.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
		this.addChild(new Sprite({ texture, anchor: 0.5, width, height, eventMode: "none" }));
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
				// The tube occupies the left half of the artboard; the reading
				// sits beside it so it stays legible on a narrow sprite.
				addLine(0.72, 0.5, 0.05, 0.5);
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
				this.coating = new Graphics({ eventMode: "none" });
				this.addChild(this.coating);
				addLine(0.5, 10 / 75, 0.103, 0.72);
				break;
		}
		this.refresh();
	}

	setActive(active: boolean): void {
		if (this.active === active) return;
		this.active = active;
		this.measuredVoltage = null;
		if (this.indicator) this.indicator.tint = active ? 0x68d681 : 0x3b5255;
		this.refresh();
	}

	refresh(hasVoltageReading?: boolean): boolean {
		const component = this.component;
		let values: string[];
		switch (component._type) {
			case EComponentType.Source:
				// A source in voltage mode shows the voltage it is set to and
				// the current the cell solves; in current mode it shows the
				// current it is set to and the voltage it had to apply.
				values = component._sourceMode === "current"
					? [reading(component._visibleVoltage, "V"), currentReading(component._sourceCurrent)]
					: [reading(component._sourceVoltage, "V"),
						currentReading(component._visibleCurrent ?? component._sourceCurrent)];
				break;
			case EComponentType.Voltmeter:
				if (hasVoltageReading !== undefined) {
					this.measuredVoltage = this.active && hasVoltageReading ? component._visibleVoltage : null;
				}
				values = [reading(this.measuredVoltage, "V")];
				break;
			case EComponentType.Ammeter:
				values = [currentReading(component._visibleCurrent)];
				break;
			case EComponentType.Multimeter:
				if (hasVoltageReading !== undefined) {
					this.measuredVoltage = this.active && hasVoltageReading ? component._visibleVoltage : null;
				}
				values = [component._meterMode === "voltage"
					? reading(this.measuredVoltage, "V")
					: currentReading(component._visibleCurrent)];
				break;
			case EComponentType.GasCollector:
				// The tube collects what has bubbled out of the vessel it
				// stands in, reported as the volume at lab conditions.
				values = [reading((component._connectedMix?.evolvedGasMol ?? 0) * MOLAR_GAS_VOLUME_ML, "mL")];
				break;
			case EComponentType.Label:
				values = [component._labelText];
				break;
			case EComponentType.Electrode:
				values = [component._material?._atoms[0]?.getSymbol() ?? ""];
				break;
			default:
				return false;
		}

		let changed = false;
		this.lines.forEach(({ text, maxWidth }, index) => {
			const value = values[index];
			if (text.text === value) return;
			text.text = value;
			text.scale.set(1);
			if (text.width > maxWidth) text.scale.set(maxWidth / text.width);
			changed = true;
		});
		return this.refreshCoating() || changed;
	}

	/**
	 * Draws the metal deposited on an electrode as a coating on the strip. The
	 * layer grows from the lower end upwards, so a thin deposit stays where the
	 * electrode dips into the solution.
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
		const area = this.component._area > 0 ? this.component._area : ELECTRODE_AREA;
		const reference = PLATING_REFERENCE_LITRES * area / ELECTRODE_AREA;
		const coverage = plating ? Math.min(1, plating.litres / reference) : 0;
		const key = plating && coverage > 0 ? `${plating.molecule.smilesString}:${coverage.toFixed(3)}` : "";
		if (key === this.coatingKey) return false;
		this.coatingKey = key;
		coating.clear();
		if (!plating || !key) return true;
		const hex = plating.molecule._atoms[0]?.getCPKHEX();
		const parsed = hex ? parseInt(hex, 16) : NaN;
		const height = (strip.bottom - strip.top) * coverage;
		coating.rect(strip.left, strip.bottom - height, strip.right - strip.left, height)
			.fill({ color: Number.isFinite(parsed) ? parsed : 0x84949b, alpha: 0.88 })
			.stroke({ color: 0x36515d, width: 0.6, alpha: 0.55 });
		return true;
	}
}
