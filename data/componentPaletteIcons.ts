import { svg } from "lit";
import type { ComponentVariant } from "./componentGraphics";

const glass = "#e0f2f7";
const highlight = "#f6fcfe";
const body = "#e6edf2";
const screen = "#f4faf1";

const icons = {
	beaker: svg`
		<path d="M19 12h42l-5 6v28a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z" fill=${glass}/>
		<path d="M19 18h37"/>
		<path d="M26 26h10m-10 7h7m-7 7h10"/>`,
	flask: svg`
		<path d="M33 9h14v14l13 22a4 4 0 0 1-4 6H24a4 4 0 0 1-4-6l13-22z" fill=${glass}/>
		<path d="M31 9h18M29 39h9m-12 6h12"/>`,
	burette: svg`
		<path d="M32 6h16v36l-6 12h-4l-6-12z" fill=${glass}/>
		<ellipse cx="40" cy="6" rx="8" ry="2" fill=${highlight}/>
		<path d="M33 15h8m-8 5h5m-5 5h8m-8 5h5m-5 5h8"/>
		<path d="M27 41h26m-26-4v8m26-8v8" stroke="#965026" stroke-width="3"/>`,
	testtube: svg`
		<path d="M29 9h22v32a11 11 0 0 1-22 0z" fill=${glass}/>
		<ellipse cx="40" cy="9" rx="11" ry="3" fill=${highlight}/>
		<path d="M35 18v19" stroke="#6699aa"/>`,
	source: svg`
		<rect x="12" y="12" width="56" height="36" rx="5" fill=${body}/>
		<rect x="18" y="18" width="24" height="15" rx="2" fill=${screen}/>
		<path d="m31 20-5 7h7l-4 4"/>
		<circle cx="55" cy="25" r="5" fill="#b8c6d0"/>
		<circle cx="51" cy="40" r="2.4" fill="#b84a4a" stroke="none"/>
		<circle cx="60" cy="40" r="2.4" fill="currentColor" stroke="none"/>`,
};

const meter = (symbol: string) => svg`
	<rect x="15" y="10" width="50" height="40" rx="5" fill=${body}/>
	<rect x="22" y="17" width="36" height="19" rx="2" fill=${screen}/>
	<path d=${symbol}/>
	<circle cx="33" cy="43" r="2.4" fill="#b84a4a" stroke="none"/>
	<circle cx="47" cy="43" r="2.4" fill="currentColor" stroke="none"/>`;

const materialColors: Record<string, string> = {
	carbon: "#54606a",
	platinum: "#c7ccd8",
	copper: "#ca8053",
	zinc: "#98adbb",
	iron: "#788696",
	magnesium: "#d4d9dd",
	nickel: "#b4b1a0",
};

export function renderComponentPaletteIcon(variant: ComponentVariant, sizeFraction: number) {
	const scale = variant.capacityMl === undefined ? 1 : 0.87 + sizeFraction * 0.13;
	let drawing;
	switch (variant.type) {
		case "electrode":
			drawing = svg`
				<path d="M33 7h14v46H33z" fill=${materialColors[variant.material?.element ?? "carbon"]}/>
				<path d="M37 12v35" stroke="#f4f8fb" stroke-opacity="0.8"/>`;
			break;
		case "voltmeter":
			drawing = meter("m34 22 6 10 6-10");
			break;
		case "ammeter":
			drawing = meter("m34 32 6-10 6 10m-10-4h8");
			break;
		default:
			drawing = icons[variant.type];
	}
	return svg`
		<svg class="component-preview" viewBox="0 0 80 60" aria-hidden="true" focusable="false">
			<g transform=${`translate(40 30) scale(${scale}) translate(-40 -30)`}
				stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
				${drawing}
			</g>
		</svg>`;
}
