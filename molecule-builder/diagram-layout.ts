import { cross, fitGeometry, perpendicular, unit } from "./geometry";
import type { Atom, Molecule, Point2, Point3 } from "./structure";

function congestion(molecule: Molecule, positions: readonly Point2[]) {
	const neighbors = new Map(molecule.atoms.map((atom, index) => [atom.id, { index, adjacent: [] as number[] }]));
	for (const { from, to } of molecule.bonds) {
		neighbors.get(from).adjacent.push(neighbors.get(to).index);
		neighbors.get(to).adjacent.push(neighbors.get(from).index);
	}
	let score = 0;
	for (const { index, adjacent } of neighbors.values()) {
		const [x, y] = positions[index];
		for (let other = index + 1; other < positions.length; other++) {
			const [a, b] = positions[other];
			score += 4 * Math.max(0, .58 - Math.hypot(a - x, b - y)) ** 2;
		}
		const angles = adjacent.map(other => Math.atan2(positions[other][1] - y, positions[other][0] - x));
		for (const [i, angle] of angles.entries()) {
			for (const other of angles.slice(i + 1)) score += Math.max(0, Math.cos(angle - other) - .898) ** 2;
		}
	}
	return score;
}

export function diagramIsCrowded(molecule: Molecule) {
	return molecule.bonds.length > 0 && congestion(molecule, molecule.atoms.map(atom => atom.diagram)) > .0001;
}

const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const center = (atoms: readonly Atom[], points: readonly Point2[]): Point2 => {
	const bonded = atoms.map((atom, index) => ({ atom, point: points[index] })).filter(({ atom }) => atom.atomicNumber !== 1);
	const positions = bonded.length ? bonded.map(row => row.point) : points;
	return [positions.reduce((sum, point) => sum + point[0], 0) / positions.length,
		positions.reduce((sum, point) => sum + point[1], 0) / positions.length];
};

/** Search projections of the fitted geometry for a legible Lewis drawing. */
export function improveDiagram(molecule: Molecule): Molecule {
	if (molecule.repeatUnit || !diagramIsCrowded(molecule)) return molecule;
	const previous = molecule.atoms.map(atom => atom.diagram);
	const anchor = center(molecule.atoms, previous);
	let best = previous;
	let bestScore = congestion(molecule, best);
	for (let sample = 0; sample < 48; sample++) {
		const z = 1 - 2 * (sample + .5) / 48;
		const radius = Math.sqrt(1 - z * z);
		const angle = sample * 2.3999632297;
		const normal = [radius * Math.cos(angle), radius * Math.sin(angle), z] as const;
		const right = perpendicular(normal), up = unit(cross(normal, right));
		const candidate = molecule.atoms.map(({ position }) => [dot(right, position), dot(up, position)] as Point2);
		const score = congestion(molecule, candidate);
		if (score >= bestScore) continue;
		best = candidate;
		bestScore = score;
		if (score < .000001) break;
	}
	if (best === previous) return molecule;
	const origin = center(molecule.atoms, best);
	return { ...molecule, atoms: molecule.atoms.map((atom, index) => ({
		...atom, diagram: [best[index][0] - origin[0] + anchor[0], best[index][1] - origin[1] + anchor[1]],
	})) };
}

export function repairSavedDiagram(molecule: Molecule) {
	if (molecule.source || !diagramIsCrowded(molecule)) return molecule;
	return improveDiagram(molecule.geometry ? molecule : fitGeometry(molecule));
}
