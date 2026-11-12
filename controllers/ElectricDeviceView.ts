import { Container, Graphics, Rectangle, Sprite, Text, type Texture } from "pixi.js";
import { EComponentType, type ElectricComponent } from "../chemlib/ElectricComponent";

function reading(value: number | null | undefined, unit: string): string {
	return `${Number.isFinite(value) ? Number(value.toPrecision(4)) : "—"} ${unit}`;
}

export class ElectricDeviceView extends Container {
	private lines: { text: Text; maxWidth: number }[] = [];
	private indicator?: Graphics;
	private active = false;
	private measuredVoltage: number | null = null;

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
			case EComponentType.Electrode:
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
				values = [reading(component._sourceVoltage, "V"), reading(component._sourceCurrent, "A")];
				break;
			case EComponentType.Voltmeter:
				if (hasVoltageReading !== undefined) {
					this.measuredVoltage = this.active && hasVoltageReading ? component._visibleVoltage : null;
				}
				values = [reading(this.measuredVoltage, "V")];
				break;
			case EComponentType.Ammeter:
				values = ["— A", `SET ${reading(component._sourceVoltage, "V")}`];
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
		return changed;
	}
}
