import { html, nothing, svg } from "lit";
import { atomSymbol, electronDots, formalCharge, signedNumber, type lewisDiagram } from "./structure-diagram";
import { point2, type HydrationWater } from "./aqueous-preview";
import { bondPolarity, polarityColors, polarityLevel, POLARITY_STOPS } from "./bond-polarity";
import type { Point2, Point3 } from "./structure";

type Diagram = ReturnType<typeof lewisDiagram>;
export type DiagramBox = readonly [number, number, number, number];

function bounds(points: Point2[]) {
	const x = points.map(point => point[0]);
	const y = points.map(point => point[1]);
	return { left: Math.min(...x), right: Math.max(...x), top: Math.max(...y), bottom: Math.min(...y) };
}

export function lewisViewBox(diagram: Diagram, waters: readonly HydrationWater<Point3>[] = []): DiagramBox {
	if (!diagram.atoms.length) return [-3, -2, 6, 4];
	const points = [...diagram.atoms.map(atom => atom.diagram), ...waters.flatMap(water => [water.oxygen, ...water.hydrogens].map(point2))];
	const { left, right, top, bottom } = bounds(points);
	const paddingX = diagram.ends ? 1.75 : .9;
	const paddingY = .95;
	return [left - paddingX, -top - paddingY, right - left + 2 * paddingX, top - bottom + 2 * paddingY];
}

function bondLines(from: Point2, to: Point2, order: number, options: {
	active?: boolean; dative?: boolean; ionic?: boolean; trimEnd?: boolean; gradient?: { id: string; level: number };
} = {}) {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
	if (length < .001) return nothing;
	const dx = (to[0] - from[0]) / length, dy = (to[1] - from[1]) / length;
	const start = Math.min(.22, length * .34);
	const end = options.trimEnd === false ? 0 : Math.min(options.dative ? .32 : .22, length * .34);
	const x1 = from[0] + dx * start, y1 = from[1] + dy * start;
	const x2 = to[0] - dx * end, y2 = to[1] - dy * end;
	const gradient = options.gradient;
	const stroke = gradient ? `url(#${gradient.id})` : nothing;
	return svg`<g class="lewis-bond" ?data-active=${options.active} ?data-ionic=${options.ionic}>
		${gradient ? svg`<defs><linearGradient id=${gradient.id} gradientUnits="userSpaceOnUse"
			x1=${x1} y1=${-y1} x2=${x2} y2=${-y2}>
			${polarityColors(gradient.level).map((color, index) => svg`<stop offset=${POLARITY_STOPS[index]} stop-color=${color} />`)}
		</linearGradient></defs>` : nothing}
		${Array.from({ length: order }, (_, index) => {
			const offset = (index - (order - 1) / 2) * .075;
			return svg`<line x1=${x1 - dy * offset} y1=${-y1 - dx * offset}
				x2=${x2 - dy * offset} y2=${-y2 - dx * offset} stroke=${stroke}
				stroke-dasharray=${options.ionic ? ".075 .08" : "none"} />`;
		})}
		${options.dative ? svg`<path d="M${x2 - dy * .055},${-y2 - dx * .055} L${x2 + dx * .11},${-y2 - dy * .11}
			L${x2 + dy * .055},${-y2 + dx * .055}" />` : nothing}
	</g>`;
}

export function renderLewis(diagram: Diagram, box: DiagramBox, options: {
	picked?: number; hovered?: number; bondStart?: number; from?: number; preview?: Point2;
	order: number; ionicPreview?: boolean; drag?: { id: number; position: Point2 }; label: string; oxidationLabel: string; unknownLabel: string;
	waters?: readonly HydrationWater<Point3>[];
	monatomicIons?: ReadonlySet<number>;
	polarity?: boolean;
}) {
	const atoms = diagram.atoms.map(atom => ({ ...atom, diagram: options.drag?.id === atom.id ? options.drag.position : atom.diagram }));
	const positions = new Map(atoms.map(atom => [atom.id, atom.diagram]));
	const elements = options.polarity ? new Map(atoms.map(atom => [atom.id, atom])) : undefined;
	const highlighted = options.bondStart ?? options.picked;
	const isActive = (id: number) => id === highlighted || id === options.hovered;
	const draftFrom = positions.get(options.from);
	let repeat = nothing as ReturnType<typeof svg> | typeof nothing;
	if (diagram.ends) {
		const { left, right, top, bottom } = bounds(atoms.map(atom => atom.diagram));
		const a = left - .65, b = right + .65, y = -top - .65, z = -bottom + .63;
		const ends = diagram.ends.map(id => ({ id, point: positions.get(id) })).sort((x, y) => x.point[0] - y.point[0]);
		repeat = svg`<g class="repeat-unit" data-repeat-unit aria-hidden="true">
			<path d="M${a + .21} ${y} H${a} V${z} H${a + .21} M${b - .21} ${y} H${b} V${z} H${b - .21}" />
			${ends.map(({ id, point }, index) => bondLines(point, [index ? b + .36 : a - .36, point[1]], 1,
				{ active: isActive(id), trimEnd: false }))}
			<text x=${b + .12} y=${z + .14}>n</text>
		</g>`;
	}
	return html`<svg class="drawing lewis-view" viewBox=${box.join(" ")} role="img" aria-label=${options.label}>
		${options.waters?.map(({ oxygen, hydrogens, contact }) => {
			const length = Math.hypot(contact.to[0] - contact.from[0], contact.to[1] - contact.from[1]);
			const inset = Math.min(.4 / length, .24);
			const axis = [contact.to[0] - contact.from[0], contact.to[1] - contact.from[1]];
			return svg`<g class="hydration-water" aria-hidden="true" pointer-events="none">
				<line class="hydration-contact" data-contact=${contact.kind}
					x1=${contact.from[0] + axis[0] * inset} y1=${-contact.from[1] - axis[1] * inset}
					x2=${contact.to[0] - axis[0] * inset} y2=${-contact.to[1] + axis[1] * inset} />
				${hydrogens.map(hydrogen => bondLines(point2(oxygen), point2(hydrogen), 1))}
				${[oxygen, ...hydrogens].map(([x, y], index) => svg`<text x=${x} y=${-y} data-water-atom=${index ? "H" : "O"}
					text-anchor="middle" dominant-baseline="central">${index ? "H" : "O"}</text>`)}
			</g>`;
		})}
		${repeat}
		${diagram.bonds.map(bond => {
			const level = elements ? polarityLevel(bondPolarity(bond, elements) ?? 0) : 0;
			return svg`<g data-bond="${bond.from}-${bond.to}">
				${bondLines(positions.get(bond.from), positions.get(bond.to), bond.order, {
					active: isActive(bond.from) || isActive(bond.to), dative: bond.dative, ionic: bond.kind === "ionic",
					gradient: level ? { id: `polarity-${bond.from}-${bond.to}`, level } : undefined,
				})}
			</g>`;
		})}
		${draftFrom && options.preview ? bondLines(draftFrom, options.preview, options.ionicPreview ? 1 : options.order,
			{ active: true, ionic: options.ionicPreview, trimEnd: false }) : nothing}
		${atoms.map(atom => {
			const [x, y] = atom.diagram;
			const symbol = atomSymbol(atom.atomicNumber);
			const oxidation = atom.oxidation === undefined ? "?" : signedNumber(atom.oxidation);
			const showOxidation = !options.monatomicIons?.has(atom.id) && !atom.bonds.some(bond => bond.kind === "ionic");
			const sign = atom.oxidation === undefined || atom.oxidation === 0 ? "neutral" : atom.oxidation > 0 ? "positive" : "negative";
			const charge = formalCharge(atom.charge);
			const active = isActive(atom.id);
			const partners = atom.bonds.map(bond => positions.get(bond.from === atom.id ? bond.to : bond.from));
			const occupied = showOxidation ? [Math.PI / 2] : [];
			if (charge) occupied.push(Math.PI / 4);
			if (atom.isotope) occupied.push(3 * Math.PI / 4);
			if (diagram.ends?.includes(atom.id)) occupied.push(atom.id === diagram.ends[0] ? Math.PI : 0);
			return svg`<g data-atom=${atom.id} ?data-active=${active} class="lewis-atom">
				<title>${showOxidation
					? `${symbol} · ${atom.id} · ${options.oxidationLabel} ${atom.oxidation === undefined ? options.unknownLabel : oxidation}`
					: symbol + charge}</title>
				<circle class="lewis-hit" cx=${x} cy=${-y} r=".27" />
				<text class="lewis-symbol" x=${x} y=${-y} text-anchor="middle" dominant-baseline="central">${symbol}</text>
				${showOxidation ? svg`<text class="oxidation-number" data-oxidation=${sign} x=${x} y=${-y - .25}
					text-anchor="middle">${oxidation}</text>` : nothing}
				${charge ? svg`<text class="formal-charge" x=${x + (symbol.length === 1 ? .15 : .23)} y=${-y - .12}>${charge}</text>` : nothing}
				${atom.isotope ? svg`<text class="formal-charge" x=${x - (symbol.length === 1 ? .15 : .23)} y=${-y - .12}
					text-anchor="end">${atom.isotope}</text>` : nothing}
				${electronDots(atom.diagram, partners, atom.electrons, occupied).map(([px, py]) =>
					svg`<circle class="lewis-electron" cx=${px} cy=${-py} r=".024" />`)}
			</g>`;
		})}
	</svg>`;
}
