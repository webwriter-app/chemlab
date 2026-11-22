import type { Atom, Bond, Molecule } from "./structure";

export type BondMode = "auto" | "covalent" | "ionic";

const commonIons: Readonly<Record<number, number>> = {
	3: 1, 11: 1, 19: 1, 37: 1, 55: 1, 12: 2, 20: 2, 38: 2, 56: 2,
	8: -2, 9: -1, 16: -2, 17: -1, 35: -1, 53: -1,
};

function ionicLimits(left: Atom, right: Atom): [number, number] | undefined {
	const a = left.charge || commonIons[left.atomicNumber];
	const b = right.charge || commonIons[right.atomicNumber];
	return a * b < 0 ? [a, b] : undefined;
}

export const isCovalentBond = (bond: Bond) => bond.kind !== "ionic";
const connects = (bond: Bond, id: number) => bond.from === id || bond.to === id;

export function bondKind(molecule: Molecule, from: number, to: number, mode: BondMode): "ionic" | "covalent" {
	if (mode !== "auto") return mode;
	const left = molecule.atoms.find(atom => atom.id === from);
	const right = molecule.atoms.find(atom => atom.id === to);
	const others = molecule.bonds.filter(bond => !(connects(bond, from) && connects(bond, to)));
	const attached = others.some(bond => isCovalentBond(bond) && (connects(bond, from) || connects(bond, to)));
	return left && right && !attached && ionicLimits(left, right) ? "ionic" : "covalent";
}

export function canAssociateIons(molecule: Molecule, from: number, to: number): boolean {
	const left = molecule.atoms.find(atom => atom.id === from);
	const right = molecule.atoms.find(atom => atom.id === to);
	const limits = left && right && ionicLimits(left, right);
	if (!limits) return false;
	const others = molecule.bonds.filter(bond => !(connects(bond, from) && connects(bond, to)));
	return [left, right].every((atom, index) => atom.charge ||
		(!others.some(bond => isCovalentBond(bond) && connects(bond, atom.id)) &&
			others.filter(bond => !isCovalentBond(bond) && connects(bond, atom.id)).length < Math.abs(limits[index])));
}

/** Each association contributes one charge unit to an otherwise neutral monatomic site. */
export function ionicCharges(molecule: Molecule): ReadonlyMap<number, number> {
	const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const charges = new Map(molecule.atoms.map(atom => [atom.id, atom.charge]));
	for (const bond of molecule.bonds) {
		if (isCovalentBond(bond)) continue;
		const left = atoms.get(bond.from);
		const right = atoms.get(bond.to);
		const limits = ionicLimits(left, right);
		if (!limits) continue;
		if (!left.charge) charges.set(left.id, charges.get(left.id) + Math.sign(limits[0]));
		if (!right.charge) charges.set(right.id, charges.get(right.id) + Math.sign(limits[1]));
	}
	return charges;
}

/** An unfinished salt formula can be drawn, but it has no stock composition yet. */
export function completeIonicFormula(molecule: Molecule, charges: ReadonlyMap<number, number>): boolean {
	const ions = new Set(molecule.bonds.filter(bond => !isCovalentBond(bond)).flatMap(bond => [bond.from, bond.to]));
	return molecule.atoms.every(atom => !ions.has(atom.id) ||
		(atom.charge || commonIons[atom.atomicNumber]) === charges.get(atom.id));
}
