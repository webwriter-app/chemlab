import { html, nothing, svg } from "lit";
import { atomSymbol, electronDots, formalCharge, signedNumber, type lewisDiagram } from "./structure-diagram";
import type { Point2 } from "./structure";

type Diagram = ReturnType<typeof lewisDiagram>;
export type DiagramBox = readonly [number, number, number, number];

function bounds(points: Point2[]) {
	const x = points.map(point => point[0]);
	const y = points.map(point => point[1]);
	return { left: Math.min(...x), right: Math.max(...x), top: Math.max(...y), bottom: Math.min(...y) };
}

export function lewisViewBox(diagram: Diagram): DiagramBox {
	if (!diagram.atoms.length) return [-3, -2, 6, 4];
	const { left, right, top, bottom } = bounds(diagram.atoms.map(atom => atom.diagram));
	const paddingX = diagram.ends ? 1.75 : .9;
	const paddingY = .95;
	return [left - paddingX, -top - paddingY, right - left + 2 * paddingX, top - bottom + 2 * paddingY];
}

function bondLines(from: Point2, to: Point2, order: number, options: { active?: boolean; dative?: boolean; trimEnd?: boolean } = {}) {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
	if (length < .001) return nothing;
	const dx = (to[0] - from[0]) / length, dy = (to[1] - from[1]) / length;
	const start = Math.min(.22, length * .34);
	const end = options.trimEnd === false ? 0 : Math.min(options.dative ? .32 : .22, length * .34);
	const x1 = from[0] + dx * start, y1 = from[1] + dy * start;
	const x2 = to[0] - dx * end, y2 = to[1] - dy * end;
	return svg`<g class="lewis-bond" ?data-active=${options.active}>
		${Array.from({ length: order }, (_, index) => {
			const offset = (index - (order - 1) / 2) * .075;
			return svg`<line x1=${x1 - dy * offset} y1=${-y1 - dx * offset}
				x2=${x2 - dy * offset} y2=${-y2 - dx * offset} />`;
		})}
		${options.dative ? svg`<path d="M${x2 - dy * .055},${-y2 - dx * .055} L${x2 + dx * .11},${-y2 - dy * .11}
			L${x2 + dy * .055},${-y2 + dx * .055}" />` : nothing}
	</g>`;
}

export function renderLewis(diagram: Diagram, box: DiagramBox, options: {
	picked?: number; hovered?: number; bondStart?: number; from?: number; preview?: Point2;
	order: number; drag?: { id: number; position: Point2 }; label: string; oxidationLabel: string; unknownLabel: string;
}) {
	const atoms = diagram.atoms.map(atom => ({ ...atom, diagram: options.drag?.id === atom.id ? options.drag.position : atom.diagram }));
	const positions = new Map(atoms.map(atom => [atom.id, atom.diagram]));
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
		${repeat}
		${diagram.bonds.map(bond => svg`<g data-bond="${bond.from}-${bond.to}">
			${bondLines(positions.get(bond.from), positions.get(bond.to), bond.order,
				{ active: isActive(bond.from) || isActive(bond.to), dative: bond.dative })}
		</g>`)}
		${draftFrom && options.preview ? bondLines(draftFrom, options.preview, options.order, { active: true, trimEnd: false }) : nothing}
		${atoms.map(atom => {
			const [x, y] = atom.diagram;
			const symbol = atomSymbol(atom.atomicNumber);
			const oxidation = atom.oxidation === undefined ? "?" : signedNumber(atom.oxidation);
			const sign = atom.oxidation === undefined || atom.oxidation === 0 ? "neutral" : atom.oxidation > 0 ? "positive" : "negative";
			const charge = formalCharge(atom.charge);
			const active = isActive(atom.id);
			const partners = atom.bonds.map(bond => positions.get(bond.from === atom.id ? bond.to : bond.from));
			const occupied = [Math.PI / 2];
			if (charge) occupied.push(Math.PI / 4);
			if (atom.isotope) occupied.push(3 * Math.PI / 4);
			if (diagram.ends?.includes(atom.id)) occupied.push(atom.id === diagram.ends[0] ? Math.PI : 0);
			return svg`<g data-atom=${atom.id} ?data-active=${active} class="lewis-atom">
				<title>${symbol} · ${atom.id} · ${options.oxidationLabel} ${atom.oxidation === undefined ? options.unknownLabel : oxidation}</title>
				<circle class="lewis-hit" cx=${x} cy=${-y} r=".27" />
				<text class="lewis-symbol" x=${x} y=${-y} text-anchor="middle" dominant-baseline="central">${symbol}</text>
				<text class="oxidation-number" data-oxidation=${sign} x=${x} y=${-y - .25} text-anchor="middle">${oxidation}</text>
				${charge ? svg`<text class="formal-charge" x=${x + (symbol.length === 1 ? .15 : .23)} y=${-y - .12}>${charge}</text>` : nothing}
				${atom.isotope ? svg`<text class="formal-charge" x=${x - (symbol.length === 1 ? .15 : .23)} y=${-y - .12}
					text-anchor="end">${atom.isotope}</text>` : nothing}
				${electronDots(atom.diagram, partners, atom.electrons, occupied).map(([px, py]) =>
					svg`<circle class="lewis-electron" cx=${px} cy=${-py} r=".024" />`)}
			</g>`;
		})}
	</svg>`;
}
