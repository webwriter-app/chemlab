import referenceData from "../data/structures/orbitals.generated.json";
import { add, cross, dot, electronRegions, perpendicular, scale, subtract, unit } from "./geometry";
import { meshNormals } from "./orbital-mesh";
import type { Atom, Bond, Molecule, Point3, Structure } from "./structure";

export type MolecularDisplay = "sticks" | "space-filling" | "orbitals";
export const ORBITAL_PHASE_COLORS = [0x177da6, 0xd67b27] as const;

type PackedSurface = [positions: string, indices: string];
type ReferenceOrbital = [label: string, phases: [PackedSurface | null, PackedSurface | null]];
type Reference = [atoms: number[][], orbitals: ReferenceOrbital[]];
const references = referenceData as unknown as Readonly<Partial<Record<string, Reference>>>;
const referencesByGeometry = new Map(Object.values(references).map(ref => [JSON.stringify(ref[0]), ref[1]]));

type Lobe = { center: Point3; axis: Point3; length: number; width: number; phase: 0 | 1 };
type Orbital =
	| { id: string; kind: "reference"; label: string; phases: ReferenceOrbital[1] }
	| { id: string; kind: "sigma" | "pi" | "lone"; atoms: Atom[]; number?: number; lobes: Lobe[] };
const cache = new WeakMap<Molecule, Orbital[]>();
const connected = new WeakMap<Molecule, boolean>();

export function hasMolecularDisplays(structure: Structure): structure is Molecule {
	if (structure.kind !== "molecule" || !structure.bonds.length
		|| structure.representation === "aqueous-ions" || structure.representation === "ionic-components") return false;
	const cached = connected.get(structure);
	if (cached !== undefined) return cached;
	const neighbors = new Map(structure.atoms.map(atom => [atom.id, [] as number[]]));
	for (const bond of structure.bonds) {
		neighbors.get(bond.from).push(bond.to);
		neighbors.get(bond.to).push(bond.from);
	}
	const visited = new Set([structure.atoms[0].id]);
	for (const id of visited) for (const neighbor of neighbors.get(id)) visited.add(neighbor);
	const result = visited.size === structure.atoms.length;
	connected.set(structure, result);
	return result;
}

function referenceOrbitals(molecule: Molecule): Orbital[] | undefined {
	if (molecule.geometry !== "supplied") return undefined;
	const signature = JSON.stringify(molecule.atoms.map(atom => [atom.atomicNumber, atom.charge, ...atom.position]));
	return referencesByGeometry.get(signature)?.map(([label, phases]) => ({ id: "reference:" + label, kind: "reference", label, phases }));
}

const mainGroup = new Set([1, 5, 6, 7, 8, 9, 14, 15, 16, 17, 35, 53]);

function piAxis(bond: Bond, axis: Point3, atom: Atom, bonds: readonly Bond[], atoms: Map<number, Atom>) {
	const neighbors = bonds.filter(other => other !== bond && (other.from === atom.id || other.to === atom.id));
	const directions = neighbors.map(other => unit(subtract(atoms.get(other.from === atom.id ? other.to : other.from).position, atom.position)));
	const normal = directions.map(direction => cross(axis, direction)).find(direction => Math.hypot(...direction) > .15);
	if (!normal) return undefined;
	const normalUnit = unit(normal);
	return directions.every(direction => Math.abs(dot(normalUnit, direction)) < .3) ? normalUnit : null;
}

/** Local valence-bond illustrations. The angular directions follow the displayed
 * geometry. The surfaces are schematic and carry no quantum-mechanical energies. */
function localOrbitals(molecule: Molecule): Orbital[] {
	const electrons = molecule.atoms.reduce((sum, atom) => sum + atom.atomicNumber - atom.charge, 0);
	// Electron parity detects odd-electron graphs. Neutral O₂ also needs
	// an open-shell description despite its even electron count.
	const dioxygen = molecule.atoms.length === 2 && molecule.atoms.every(atom => atom.atomicNumber === 8 && !atom.charge);
	if (electrons % 2 || dioxygen) return [];
	const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const sigmas: Orbital[] = [], pis: Orbital[] = [], lone: Orbital[] = [];
	for (const bond of molecule.bonds) {
		const a = atoms.get(bond.from), b = atoms.get(bond.to);
		if (bond.dative || !mainGroup.has(a.atomicNumber) || !mainGroup.has(b.atomicNumber)) continue;
		const direction = subtract(b.position, a.position);
		const length = Math.hypot(...direction);
		if (length < .2 || length > 4) continue;
		const center = scale(add(a.position, b.position), .5), axis = unit(direction);
		const ids = [a.id, b.id].sort((x, y) => x - y).join("-");
		sigmas.push({ id: "σ:" + ids, kind: "sigma", atoms: [a, b],
			lobes: [{ center, axis, length: .67 * length, width: Math.min(.49, .32 * length), phase: 0 }] });
		if (bond.order === 1) continue;
		const atA = piAxis(bond, axis, a, molecule.bonds, atoms), atB = piAxis(bond, axis, b, molecule.bonds, atoms);
		// A single localized π orbital requires a common plane. Omit a
		// drawn π pair if the conformer cannot supply a defensible plane.
		if (atA === null || atB === null || (atA && atB && Math.abs(dot(atA, atB)) < .87)) continue;
		const normal = atA ?? atB ?? perpendicular(axis);
		const normals = bond.order === 3 ? [normal, unit(cross(axis, normal))] : [normal];
		for (const [index, normal] of normals.entries()) {
			const width = Math.min(.46, .31 * length);
			pis.push({ id: "π:" + ids + ":" + index, kind: "pi", atoms: [a, b],
				number: bond.order === 3 ? index + 1 : undefined,
				lobes: [
					{ center: add(center, scale(normal, width * 1.12)), axis, length: .65 * length, width, phase: 0 },
					{ center: add(center, scale(normal, -width * 1.12)), axis, length: .65 * length, width, phase: 1 },
				] });
		}
	}
	const loneCounts = new Map<number, number>();
	for (const region of electronRegions(molecule)) {
		const atom = atoms.get(region.atomId);
		if (!atom || !mainGroup.has(atom.atomicNumber) || region.electrons !== 2) continue;
		const bonds = molecule.bonds.filter(bond => bond.from === atom.id || bond.to === atom.id);
		if (!bonds.length || bonds.some(bond => bond.dative) || bonds.reduce((n, bond) => n + bond.order, 0) > 4) continue;
		// An atom adjacent to a multiple bond can contribute a lone pair
		// to a delocalized system. Its orientation needs more than VSEPR.
		const neighbors = new Set(bonds.map(bond => bond.from === atom.id ? bond.to : bond.from));
		if (molecule.bonds.some(bond => bond.order > 1 && (neighbors.has(bond.from) || neighbors.has(bond.to)))) continue;
		const number = (loneCounts.get(atom.id) ?? 0) + 1;
		loneCounts.set(atom.id, number);
		const axis = unit(subtract(region.to, region.from));
		const size = Math.min(1.4, Math.hypot(...subtract(region.to, atom.position)));
		lone.push({ id: "lone:" + atom.id + ":" + number, kind: "lone", atoms: [atom], number,
			lobes: [
				{ center: add(atom.position, scale(axis, .48 * size)), axis, length: .46 * size, width: .31 * size, phase: 0 },
				{ center: add(atom.position, scale(axis, -.22 * size)), axis, length: .16 * size, width: .14 * size, phase: 1 },
			] });
	}
	return [...pis, ...sigmas, ...lone];
}

export function moleculeOrbitals(molecule: Molecule): Orbital[] {
	let orbitals = cache.get(molecule);
	if (!orbitals) {
		orbitals = referenceOrbitals(molecule) ?? localOrbitals(molecule);
		cache.set(molecule, orbitals);
	}
	return orbitals;
}

export function unpackOrbitalSurface([vertices, triangles]: PackedSurface) {
	const decode = (data: string) => new DataView(Uint8Array.from(atob(data), character => character.charCodeAt(0)).buffer);
	const packedPositions = decode(vertices), packedIndices = decode(triangles);
	const positions = Float32Array.from({ length: packedPositions.byteLength / 2 }, (_, i) => packedPositions.getInt16(i * 2, true) / 1000);
	const indices = Uint16Array.from({ length: packedIndices.byteLength / 2 }, (_, i) => packedIndices.getUint16(i * 2, true));
	const normals = meshNormals(positions, indices);
	return { positions, indices, normals };
}
