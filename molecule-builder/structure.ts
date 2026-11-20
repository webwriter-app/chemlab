import { isAtomicNumber } from "../periodic-table/selection";

export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];
export type BondOrder = 1 | 2 | 3;
export type Atom = {
	id: number;
	atomicNumber: number;
	charge: number;
	isotope?: number;
	diagram: Point2;
	position: Point3;
};

export type Bond = { from: number; to: number; order: BondOrder; dative?: true };
export type RepeatUnit = { atoms: number[]; ends: [number, number] };
export type Cell = { lengths: Point3; angles: Point3 };
export type Site = Omit<Atom, "diagram" | "position"> & { fractional: Point3; occupancy?: number; ion?: string };
type Base = { version: 1; name: string; catalogKey?: string; source?: string };
export type Representation = "constituent" | "repeat-unit" | "ionic-components" | "conformer" | "experimental";
export type Molecule = Base & {
	kind: "molecule";
	atoms: Atom[];
	bonds: Bond[];
	geometry?: "idealized" | "supplied" | "estimated";
	representation?: Representation;
	repeatUnit?: RepeatUnit;
};
export type Crystal = Base & {
	kind: "crystal";
	cell: Cell;
	sites: Site[];
	bravais?: string;
	spaceGroup?: string;
	conditions?: string;
	temperatureK?: number;
};
export type Structure = Molecule | Crystal;

export const MAX_ATOMS = 128;
export const MAX_SITES = 128;
export const MAX_FILE_BYTES = 512 * 1024;
export const EMPTY_CELL: Cell = { lengths: [5, 5, 5], angles: [90, 90, 90] };
export const newMolecule = (): Molecule => ({ version: 1, kind: "molecule", name: "", atoms: [], bonds: [] });
export const newCrystal = (): Crystal => ({ version: 1, kind: "crystal", name: "", cell: EMPTY_CELL, sites: [] });

export function cellVectors({ lengths: [a, b, c], angles }: Cell): [Point3, Point3, Point3] {
	const [alpha, beta, gamma] = angles.map(angle => angle * Math.PI / 180);
	const y = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma);
	return [
		[a, 0, 0],
		[b * Math.cos(gamma), b * Math.sin(gamma), 0],
		[c * Math.cos(beta), c * y, c * Math.sqrt(1 - Math.cos(beta) ** 2 - y ** 2)],
	];
}

export function cartesian(vectors: [Point3, Point3, Point3], [x, y, z]: Point3): Point3 {
	const [a, b, c] = vectors;
	return [a[0] * x + b[0] * y + c[0] * z, a[1] * x + b[1] * y + c[1] * z, a[2] * x + b[2] * y + c[2] * z];
}

export function fractional([a, b, c]: [Point3, Point3, Point3], point: Point3): Point3 {
	const z = point[2] / c[2];
	const y = (point[1] - c[1] * z) / b[1];
	const x = (point[0] - b[0] * y - c[0] * z) / a[0];
	const wrap = (value: number) => ((value % 1) + 1) % 1;
	return [wrap(x), wrap(y), wrap(z)];
}

export function isCell(cell: Cell): boolean {
	return cell.lengths.every(value => Number.isFinite(value) && value >= 0.1 && value <= 200)
		&& cell.angles.every(value => Number.isFinite(value) && value >= 1 && value <= 179)
		&& cellVectors(cell)[2][2] > 0.001;
}

export function replicatedSites(crystal: Crystal, repeats: number) {
	const vectors = cellVectors(crystal.cell);
	const sites: { site: Site; position: Point3 }[] = [];
	for (let x = 0; x < repeats; x++) {
		for (let y = 0; y < repeats; y++) {
			for (let z = 0; z < repeats; z++) {
				for (const site of crystal.sites) {
					const [a, b, c] = site.fractional;
					sites.push({ site, position: cartesian(vectors, [a + x, b + y, c + z]) });
				}
			}
		}
	}
	return sites;
}

function record(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function numbers(value: unknown, length: number): value is number[] {
	return Array.isArray(value) && value.length === length
		&& value.every(item => typeof item === "number" && Number.isFinite(item) && Math.abs(item) <= 10_000);
}

function atomIdentity(value: unknown): value is Pick<Atom, "id" | "atomicNumber" | "charge" | "isotope"> & Record<string, unknown> {
	return record(value) && Number.isSafeInteger(value.id) && Number(value.id) > 0 && isAtomicNumber(value.atomicNumber)
		&& Number.isInteger(value.charge) && Math.abs(Number(value.charge)) <= 8
		&& (value.isotope === undefined || (Number.isInteger(value.isotope)
			&& Number(value.isotope) >= value.atomicNumber && Number(value.isotope) <= 400));
}

function uniqueIds(values: { id: number }[]) {
	return new Set(values.map(value => value.id)).size === values.length;
}

/** Read only known fields and validate the whole snapshot before adopting it. */
export function readStructure(value: unknown): Structure | null {
	if (!record(value) || value.version !== 1 || typeof value.name !== "string" || value.name.length > 160) return null;
	const base: Base = { version: 1, name: value.name };
	if (typeof value.catalogKey === "string" && value.catalogKey.length <= 160) base.catalogKey = value.catalogKey;
	if (typeof value.source === "string" && value.source.length <= 240) base.source = value.source;
	if (value.kind === "molecule") {
		if (!Array.isArray(value.atoms) || value.atoms.length > MAX_ATOMS
			|| !Array.isArray(value.bonds) || value.bonds.length > MAX_ATOMS * 4) return null;
		const atoms: Atom[] = [];
		for (const atom of value.atoms) {
			if (!atomIdentity(atom) || !numbers(atom.diagram, 2) || !numbers(atom.position, 3)) return null;
			const { id, atomicNumber, charge, isotope, diagram, position } = atom;
			atoms.push({ id, atomicNumber, charge, isotope, diagram: [...diagram] as [number, number], position: [...position] as [number, number, number] });
		}
		if (!uniqueIds(atoms)) return null;
		const atomIds = new Set(atoms.map(atom => atom.id));
		const pairs = new Set<string>();
		const bonds: Bond[] = [];
		for (const bond of value.bonds) {
			if (!record(bond) || typeof bond.from !== "number" || typeof bond.to !== "number"
				|| !atomIds.has(bond.from) || !atomIds.has(bond.to) || bond.from === bond.to
				|| (bond.order !== 1 && bond.order !== 2 && bond.order !== 3)) return null;
			const pair = [bond.from, bond.to].sort((a, b) => a - b).join("-");
			if (pairs.has(pair)) return null;
			pairs.add(pair);
			bonds.push({ from: bond.from, to: bond.to, order: bond.order, ...(bond.dative === true ? { dative: true as const } : {}) });
		}
		const geometry = value.geometry === "idealized" || value.geometry === "supplied" || value.geometry === "estimated"
			? value.geometry : undefined;
		const representation = value.representation === "constituent" || value.representation === "repeat-unit"
			|| value.representation === "ionic-components" || value.representation === "conformer" || value.representation === "experimental"
			? value.representation : undefined;
		const repeat = value.repeatUnit;
		const repeatAtoms = record(repeat) && Array.isArray(repeat.atoms) ? repeat.atoms : [];
		const repeatUnit = repeatAtoms.length >= 2 && repeatAtoms.length <= atomIds.size
			&& new Set(repeatAtoms).size === repeatAtoms.length && repeatAtoms.every(id => atomIds.has(id)) && record(repeat)
			&& Array.isArray(repeat.ends) && repeat.ends.length === 2 && repeat.ends[0] !== repeat.ends[1]
			&& repeat.ends.every(id => repeatAtoms.includes(id))
			? { atoms: [...repeatAtoms] as number[], ends: [repeat.ends[0], repeat.ends[1]] as [number, number] }
			: undefined;
		return { ...base, kind: "molecule", atoms, bonds, geometry, representation, repeatUnit };
	}
	if (value.kind !== "crystal" || !record(value.cell)
		|| !numbers(value.cell.lengths, 3) || !numbers(value.cell.angles, 3)
		|| !Array.isArray(value.sites) || value.sites.length > MAX_SITES) return null;
	const cell: Cell = { lengths: [...value.cell.lengths] as [number, number, number], angles: [...value.cell.angles] as [number, number, number] };
	if (!isCell(cell)) return null;
	const sites: Site[] = [];
	const positions = new Set<string>();
	for (const site of value.sites) {
		if (!atomIdentity(site) || !numbers(site.fractional, 3)
			|| site.fractional.some(coordinate => coordinate < 0 || coordinate >= 1)) return null;
		const occupancy = site.occupancy;
		if (occupancy !== undefined && (typeof occupancy !== "number" || !(occupancy > 0 && occupancy <= 1))) return null;
		const position = site.fractional.join(",");
		if (positions.has(position)) return null;
		positions.add(position);
		const { id, atomicNumber, charge, isotope } = site;
		const ion = typeof site.ion === "string" ? site.ion.trim().slice(0, 60) || undefined : undefined;
		sites.push({ id, atomicNumber, charge, isotope, ion, occupancy: occupancy as number | undefined,
			fractional: [...site.fractional] as [number, number, number] });
	}
	if (!uniqueIds(sites)) return null;
	const bravais = typeof value.bravais === "string" ? value.bravais.slice(0, 60) : undefined;
	const spaceGroup = typeof value.spaceGroup === "string" ? value.spaceGroup.slice(0, 60) : undefined;
	const conditions = typeof value.conditions === "string" ? value.conditions.slice(0, 96) : undefined;
	const temperatureK = typeof value.temperatureK === "number" && Number.isFinite(value.temperatureK) && value.temperatureK >= 0
		? value.temperatureK : undefined;
	return { ...base, kind: "crystal", cell, sites, bravais, spaceGroup, conditions, temperatureK };
}
