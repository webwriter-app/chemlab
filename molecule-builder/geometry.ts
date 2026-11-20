import { dataValue, elementByAtomicNumber } from "../periodic-table/element-reference";
import type { Molecule, Point3 } from "./structure";

// Cordero et al., Dalton Trans. 2008, doi:10.1039/B801115J. Values are in pm.
const covalent = new Map([
	[1, 31], [5, 84], [6, 76], [7, 71], [8, 66], [9, 57], [11, 166], [12, 141],
	[13, 121], [14, 111], [15, 107], [16, 105], [17, 102], [19, 203], [20, 176],
	[26, 132], [28, 124], [29, 132], [30, 122], [35, 120], [47, 145], [50, 139], [53, 139], [78, 136],
]);
// Shannon, Acta Cryst. A32 (1976), six-coordinate effective ionic radii in pm.
const ionic = new Map([["11:1", 102], ["19:1", 138], ["17:-1", 181], ["35:-1", 196], ["53:-1", 220]]);

export function atomRadius(atomicNumber: number, sixCoordinateCharge?: number) {
	const ion = ionic.get(`${atomicNumber}:${sixCoordinateCharge}`);
	if (ion !== undefined) return { pm: ion, model: "ionic" } as const;
	const covalentRadius = covalent.get(atomicNumber);
	if (covalentRadius !== undefined && sixCoordinateCharge === undefined) return { pm: covalentRadius, model: "covalent" } as const;
	const pm = dataValue(elementByAtomicNumber(atomicNumber).radius);
	return pm === undefined ? { pm: 90, model: "schematic" } as const : { pm, model: "empirical" } as const;
}

const colors = new Map([
	[1, 0xf0f0f0], [6, 0x41454a], [7, 0x3050f8], [8, 0xff3030], [9, 0x73c952],
	[11, 0xab5cf2], [12, 0x75bd31], [13, 0xbfa6a6], [14, 0xd7aa86], [15, 0xff8000],
	[16, 0xf3d326], [17, 0x39b540], [19, 0x8f40d4], [26, 0xe06633], [29, 0xb87333],
	[30, 0x7d80b0], [35, 0xa62929], [47, 0xb7b9bd], [53, 0x940094],
]);

export function atomColor(atomicNumber: number): number {
	return colors.get(atomicNumber) ?? 0x828b94;
}

export const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const subtract = (a: Point3, b: Point3): Point3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = ([x, y, z]: Point3, factor: number): Point3 => [x * factor, y * factor, z * factor];
const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const unit = (a: Point3): Point3 => scale(a, 1 / (Math.hypot(...a) || 1));
export const perpendicular = (axis: Point3): Point3 => unit(cross(axis, Math.abs(axis[2]) < 0.85 ? [0, 0, 1] : [0, 1, 0]));

const valenceElectrons = new Map([[1, 1], [5, 3], [6, 4], [7, 5], [8, 6], [9, 7], [14, 4], [15, 5], [16, 6], [17, 7], [35, 7], [53, 7]]);
const maximumOrder = new Map([[1, 1], [5, 4], [6, 4], [7, 4], [8, 3], [9, 1], [14, 4], [15, 5], [16, 6], [17, 1], [35, 1], [53, 1]]);

export function canBond(molecule: Molecule, from: number, to: number, order: number): boolean {
	return [from, to].every(id => {
		const atom = molecule.atoms.find(item => item.id === id);
		if (!atom) return false;
		const other = id === from ? to : from;
		const sum = molecule.bonds.reduce((count, bond) =>
			(bond.from === id && bond.to !== other) || (bond.to === id && bond.from !== other) ? count + bond.order : count, order);
		return sum <= (maximumOrder.get(atom.atomicNumber) ?? 6);
	});
}

type Shape = { angle: number; domains: number };
function shapeFor(molecule: Molecule, id: number): Shape | null {
	const atom = molecule.atoms.find(entry => entry.id === id);
	const bonds = molecule.bonds.filter(bond => bond.from === id || bond.to === id);
	if (bonds.length < 2) return { angle: 180, domains: 2 };
	const electrons = valenceElectrons.get(atom.atomicNumber);
	if (electrons === undefined) return null;
	const remaining = electrons - atom.charge - bonds.reduce((sum, bond) => sum + bond.order, 0);
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
export function fitGeometry(molecule: Molecule): Molecule | null {
	const neighbors = new Map(molecule.atoms.map(atom => [atom.id, [] as { id: number; order: number }[]]));
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
				const radius = atomRadius(atoms.get(id).atomicNumber).pm + atomRadius(atoms.get(child.id).atomicNumber).pm;
				const distance = radius / 100 * (child.order === 3 ? 0.87 : child.order === 2 ? 0.92 : 1);
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
