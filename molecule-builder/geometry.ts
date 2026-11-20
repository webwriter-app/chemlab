import { ElementData } from "../chemlib/ElementData";
import { elementByAtomicNumber } from "../periodic-table/element-reference";
import { diatomics } from "../data/structures/sources.json";
import { atomRadius, estimatedBondLength } from "./radii";
import type { Atom, Bond, Molecule, Point3, Structure } from "./structure";

const experimentalDiatomics = new Map(Object.values(diatomics).map(([number, order, length]) => [`${number}:${order}`, length]));

function bondLength(molecule: Molecule, left: Atom, right: Atom, order: Bond["order"]): number {
	if (molecule.atoms.length === 2 && !left.charge && !right.charge && left.atomicNumber === right.atomicNumber) {
		const reference = experimentalDiatomics.get(`${left.atomicNumber}:${order}`);
		if (reference !== undefined) return reference;
	}
	return estimatedBondLength(left.atomicNumber, right.atomicNumber, order);
}

const colors = ElementData.getElementList().map(key => {
	const hex = ElementData.getData(key)?.["cpk-hex"];
	return typeof hex === "string" && /^[0-9a-f]{6}$/i.test(hex) ? Number.parseInt(hex, 16) : 0x828b94;
});

export function atomColor(atomicNumber: number): number {
	return colors[atomicNumber - 1] ?? 0x828b94;
}

export const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const subtract = (a: Point3, b: Point3): Point3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = ([x, y, z]: Point3, factor: number): Point3 => [x * factor, y * factor, z * factor];
export const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const unit = (a: Point3): Point3 => scale(a, 1 / (Math.hypot(...a) || 1));
export const perpendicular = (axis: Point3): Point3 => unit(cross(axis, Math.abs(axis[2]) < 0.85 ? [0, 0, 1] : [0, 1, 0]));

const maximumOrder = new Map([[1, 1], [5, 4], [6, 4], [7, 4], [8, 3], [9, 1], [14, 4], [15, 5], [16, 6], [17, 1], [35, 1], [53, 1]]);

function mainGroupValence(atomicNumber: number): number | undefined {
	if (atomicNumber === 2) return 2;
	const group = elementByAtomicNumber(atomicNumber).group;
	if (group.status !== "reported" && group.status !== "predicted") return undefined;
	return group.value <= 2 ? group.value : group.value >= 13 ? group.value - 10 : undefined;
}

export function remainingElectrons(atom: Atom, bonds: readonly Bond[], continuations = 0) {
	const valence = mainGroupValence(atom.atomicNumber);
	return valence === undefined ? undefined : valence - atom.charge - continuations - bonds.reduce((sum, bond) => {
		if (bond.from !== atom.id && bond.to !== atom.id) return sum;
		return sum + (bond.dative ? (bond.from === atom.id ? 2 : 0) : bond.order);
	}, 0);
}

export function canBond(molecule: Molecule, from: number, to: number, order: number): boolean {
	return [from, to].every(id => {
		const atom = molecule.atoms.find(item => item.id === id);
		if (!atom) return false;
		const other = id === from ? to : from;
		const sum = molecule.bonds.reduce((count, bond) =>
			(bond.from === id && bond.to !== other) || (bond.to === id && bond.from !== other) ? count + bond.order : count, order);
		const continuation = molecule.repeatUnit?.ends.includes(id) ? 1 : 0;
		return sum + continuation <= (maximumOrder.get(atom.atomicNumber) ?? 6);
	});
}

type Shape = { angle: number; domains: number };
function shapeFor(molecule: Molecule, id: number): Shape | null {
	const atom = molecule.atoms.find(entry => entry.id === id);
	const bonds = molecule.bonds.filter(bond => bond.from === id || bond.to === id);
	if (bonds.length < 2) return { angle: 180, domains: 2 };
	const remaining = remainingElectrons(atom, bonds);
	if (remaining === undefined) return null;
	const domains = bonds.length + remaining / 2;
	if (remaining < 0 || remaining % 2 !== 0 || domains < 2 || domains > 4) return null;
	return { domains, angle: domains === 2 ? 180 : domains === 3 ? 120 : 109.4712206 };
}

export function shapeName(molecule: Molecule, id: number) {
	const neighbors = molecule.bonds.filter(bond => bond.from === id || bond.to === id).length;
	if (neighbors < 2) return undefined;
	const shape = shapeFor(molecule, id);
	if (!shape) return undefined;
	if (shape.domains === 2) return "linear";
	if (neighbors === 2) return "bent";
	if (shape.domains === 3) return "trigonal";
	return neighbors === 3 ? "pyramidal" : "tetrahedral";
}

/** Deterministic local VSEPR for acyclic species. Ring conformation and stereo
 * assignment require additional constraints and are kept outside this fitter. */
function idealizedGeometry(molecule: Molecule): Molecule | null {
	const neighbors = new Map(molecule.atoms.map(atom => [atom.id, [] as { id: number; order: Bond["order"] }[]]));
	for (const bond of molecule.bonds) {
		neighbors.get(bond.from).push({ id: bond.to, order: bond.order });
		neighbors.get(bond.to).push({ id: bond.from, order: bond.order });
	}
	const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const placements = new Map<number, Point3>();
	let componentX = 0;
	for (const root of molecule.atoms) {
		if (placements.has(root.id)) continue;
		placements.set(root.id, [componentX, 0, 0]);
		let rightEdge = componentX;
		const queue = [{ id: root.id, parent: 0, plane: [0, 0, 1] as Point3 }];
		while (queue.length) {
			const { id, parent, plane } = queue.shift();
			const current = placements.get(id);
			const children = neighbors.get(id).filter(neighbor => neighbor.id !== parent);
			if (!children.length) continue;
			const shape = shapeFor(molecule, id);
			if (!shape) return null;
			const axis = parent ? unit(subtract(placements.get(parent), current)) : [-1, 0, 0] as const;
			const tangent = Math.abs(dot(axis, plane)) < 0.99 ? unit(cross(plane, axis)) : perpendicular(axis);
			const normal = unit(cross(axis, tangent));
			const indexOffset = Number(!parent);
			const angle = shape.angle * Math.PI / 180;
			const step = shape.domains === 3 ? Math.PI : 2 * Math.PI / 3;
			for (const [index, child] of children.entries()) {
				if (placements.has(child.id)) return null;
				const azimuth = (index - indexOffset) * step;
				const direction = !parent && index === 0 ? axis : add(scale(axis, Math.cos(angle)),
					scale(add(scale(tangent, Math.cos(azimuth)), scale(normal, Math.sin(azimuth))), Math.sin(angle)));
				const distance = bondLength(molecule, atoms.get(id), atoms.get(child.id), child.order);
				const position = add(current, scale(direction, distance));
				placements.set(child.id, position);
				rightEdge = Math.max(rightEdge, position[0]);
				queue.push({ id: child.id, parent: id, plane: Math.abs(dot(axis, direction)) < 0.99 ? unit(cross(axis, direction)) : normal });
			}
		}
		componentX = rightEdge + 3;
	}
	return { ...molecule, geometry: "idealized", atoms: molecule.atoms.map(atom => ({ ...atom, position: placements.get(atom.id) })) };
}

/** Distance-constraint relaxation for rings and unsupported coordination.
 * Bond lengths are weighted above approximate angles and nonbonded separation. */
function estimatedGeometry(molecule: Molecule): Molecule {
	const atoms = molecule.atoms;
	const indexes = new Map(atoms.map((atom, index) => [atom.id, index]));
	const neighbors: { index: number; length: number }[][] = atoms.map(() => []);
	const lengths = molecule.bonds.map(bond => {
		const a = indexes.get(bond.from), b = indexes.get(bond.to);
		const distance = bondLength(molecule, atoms[a], atoms[b], bond.order);
		neighbors[a].push({ index: b, length: distance });
		neighbors[b].push({ index: a, length: distance });
		return { a, b, distance };
	});
	const angles = neighbors.flatMap((edges, center) => edges.flatMap((left, index) => edges.slice(index + 1).map(right => {
		const ideal = shapeFor(molecule, atoms[center].id)?.angle;
		const angle = (ideal ?? (edges.length <= 3 ? 120 : edges.length === 4 ? 109.47 : 90)) * Math.PI / 180;
		const distance = Math.sqrt(left.length ** 2 + right.length ** 2 - 2 * left.length * right.length * Math.cos(angle));
		return { a: left.index, b: right.index, distance };
	})));
	const points = atoms.map(({ diagram: [x, y] }, index) => {
		const angle = index * 2.3999632297;
		return [x + .19 * Math.cos(angle), y + .19 * Math.sin(angle), .4 * Math.sin(index * 1.73)];
	});
	const groups: number[][] = [];
	const visited = new Set<number>();
	points.forEach((_, index) => {
		if (visited.has(index)) return;
		const group = [index];
		visited.add(index);
		for (let cursor = 0; cursor < group.length; cursor++) {
			for (const edge of neighbors[group[cursor]]) {
				if (visited.has(edge.index)) continue;
				visited.add(edge.index);
				group.push(edge.index);
			}
		}
		groups.push(group);
	});
	const separate = groups.flatMap(group => group.flatMap((a, index) => group.slice(index + 1).flatMap(b =>
		neighbors[a].some(edge => edge.index === b) ? [] : [{ a, b, distance:
			Math.max(0.74, (atomRadius(atoms[a].atomicNumber).pm + atomRadius(atoms[b].atomicNumber).pm) * .0095) }])));
	const constrain = ({ a, b, distance }: typeof lengths[number], weight: number, repelOnly = false) => {
		const from = points[a], to = points[b];
		const x = to[0] - from[0], y = to[1] - from[1], z = to[2] - from[2];
		const actual = Math.hypot(x, y, z);
		if (actual < 1e-8 || (repelOnly && actual >= distance)) return;
		const correction = (actual - distance) / actual * weight / 2;
		from[0] += x * correction; from[1] += y * correction; from[2] += z * correction;
		to[0] -= x * correction; to[1] -= y * correction; to[2] -= z * correction;
	};
	for (let pass = 0; pass < 120; pass++) {
		for (const pair of separate) constrain(pair, .24, true);
		for (const angle of angles) constrain(angle, .13);
		for (const bond of lengths) constrain(bond, .66);
	}
	let edge = 0;
	for (const group of groups) {
		const min = Math.min(...group.map(index => points[index][0]));
		for (const index of group) points[index][0] += edge - min;
		edge = Math.max(...group.map(index => points[index][0])) + 3;
	}
	return { ...molecule, geometry: "estimated", atoms: atoms.map((atom, index) => ({
		...atom, position: points[index] as [number, number, number],
	})) };
}

export function fitGeometry(molecule: Molecule): Molecule {
	return { ...(idealizedGeometry(molecule) ?? estimatedGeometry(molecule)), source: undefined, representation: undefined };
}

export type ElectronRegion = { kind: "bond" | "lone"; from: Point3; to: Point3; electrons: number; atomId?: number };

/** Approximate Lewis/VSEPR regions for the displayed graph, with one region
 * per bonded pair of atoms. Transition-metal atomic populations are omitted. */
export function electronRegions(molecule: Molecule): ElectronRegion[] {
	const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const regions: ElectronRegion[] = molecule.bonds.flatMap(({ from, to, order }) => {
		const a = atoms.get(from).position, b = atoms.get(to).position;
		return Math.hypot(...subtract(a, b)) < 1e-6 ? [] : [{ kind: "bond", from: a, to: b, electrons: order * 2 }];
	});
	for (const atom of molecule.atoms) {
		const bonds = molecule.bonds.filter(bond => bond.from === atom.id || bond.to === atom.id);
		const remaining = remainingElectrons(atom, bonds, Number(!!molecule.repeatUnit?.ends.includes(atom.id)));
		if (!(remaining > 0 && remaining <= 8)) continue;
		const fixed = bonds.map(bond => unit(subtract(atoms.get(bond.from === atom.id ? bond.to : bond.from).position, atom.position)));
		const pairs: Point3[] = [];
		const count = Math.ceil(remaining / 2);
		for (let index = 0; index < count; index++) {
			let best = -Infinity;
			let direction: Point3 = [0, 0, 1];
			for (let sample = 0; sample < 64; sample++) {
				const z = 1 - 2 * (sample + .5) / 64;
				const r = Math.sqrt(1 - z * z);
				const candidate: Point3 = [r * Math.cos(sample * 2.3999632297), r * Math.sin(sample * 2.3999632297), z];
				const score = Math.min(2, ...[...fixed, ...pairs].map(vector => 1 - dot(vector, candidate)));
				if (score > best) { best = score; direction = candidate; }
			}
			pairs.push(direction);
		}
		for (let pass = 0; pass < 22; pass++) {
			for (const [index, axis] of pairs.entries()) {
				const repulsion = [...fixed, ...pairs.filter((_, other) => other !== index)].reduce((sum, other) => {
					const away = subtract(axis, other);
					return add(sum, scale(away, 1 / Math.max(.15, Math.hypot(...away)) ** 3));
				}, [0, 0, 0] as Point3);
				pairs[index] = unit(add(axis, scale(repulsion, .12)));
			}
		}
		const radius = atomRadius(atom.atomicNumber).pm / 100;
		for (const [index, direction] of pairs.entries()) {
			regions.push({ kind: "lone", atomId: atom.id, from: add(atom.position, scale(direction, radius * .43)),
				to: add(atom.position, scale(direction, radius * 1.6)), electrons: Math.min(2, remaining - index * 2) });
		}
	}
	return regions;
}

export function formula(structure: Structure): string {
	if (structure.kind === "crystal" && structure.catalogKey && structure.name) return structure.name;
	const counts = new Map<string, number>();
	for (const { atomicNumber } of structure.kind === "molecule" ? structure.atoms : structure.sites) {
		const symbol = elementByAtomicNumber(atomicNumber).symbol;
		counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
	}
	const ordered = [...counts.keys()].sort((a, b) => a.localeCompare(b, "en"));
	if (counts.has("C")) {
		ordered.splice(ordered.indexOf("C"), 1);
		if (counts.has("H")) ordered.splice(ordered.indexOf("H"), 1);
		ordered.unshift(...(counts.has("H") ? ["C", "H"] : ["C"]));
	}
	const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
	const divisor = structure.kind === "crystal" ? [...counts.values()].reduce(gcd, 0) : 1;
	return ordered.map(symbol => {
		const count = counts.get(symbol) / divisor;
		return symbol + (count > 1 ? String(count) : "");
	}).join("");
}
