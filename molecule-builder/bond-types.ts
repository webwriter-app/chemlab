import { ElementData } from "../chemlib/ElementData";
import type { Atom, Bond, Molecule } from "./structure";

export type BondMode = "auto" | "covalent" | "ionic";

const commonIons: Readonly<Record<number, number>> = {
	3: 1, 11: 1, 19: 1, 37: 1, 55: 1, 12: 2, 20: 2, 38: 2, 56: 2,
	8: -2, 9: -1, 16: -2, 17: -1, 35: -1, 53: -1,
};

/**
 * The single charge an element's ion carries in the solubility table: +1 for
 * the alkali metals and +2 for the alkaline earths, −2 for oxide and sulfide,
 * −1 for the halides. An element outside the table has no such expectation.
 *
 * @export
 * @param {number} atomicNumber - the element
 * @returns {number | undefined} the table charge, if the element has one
 */
export const commonIonCharge = (atomicNumber: number) => commonIons[atomicNumber];

const elementNames = ElementData.getElementList();
/** The Pauling value `Molecule.addBond` compares, including its gaps. */
const electronegativity = (atomicNumber: number) =>
	(ElementData.getData(elementNames[atomicNumber - 1]) as Record<string, number | null>)["electronegativity_pauling"];

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

/**
 * The charges an ionic bond leaves behind, following `Molecule.addBond`: one
 * electron moves from the less electronegative atom to the more
 * electronegative one, on top of whatever charge the drawing already carries,
 * and a bond between two atoms of the same element moves nothing at all. The
 * catalog definitions are written pre-compensated for exactly this transfer,
 * so the analysis reads the same ions the lab builds from them.
 *
 * @export
 * @param {Molecule} molecule - the drawn graph
 * @returns {ReadonlyMap<number, number>} the charge per atom id
 */
export function ionicCharges(molecule: Molecule): ReadonlyMap<number, number> {
	const charges = new Map(molecule.atoms.map(atom => [atom.id, atom.charge]));
	for (const bond of molecule.bonds) {
		if (isCovalentBond(bond)) continue;
		const from = molecule.atoms.find(atom => atom.id === bond.from);
		const to = molecule.atoms.find(atom => atom.id === bond.to);
		if (!from || !to || from.atomicNumber === to.atomicNumber) continue;
		const fromGains = electronegativity(from.atomicNumber) > electronegativity(to.atomicNumber);
		charges.set(from.id, charges.get(from.id) + (fromGains ? -1 : 1));
		charges.set(to.id, charges.get(to.id) + (fromGains ? 1 : -1));
	}
	return charges;
}

/**
 * An unfinished salt formula can be drawn, but it has no stock composition yet:
 * half a calcium ion or a bare oxide is not a pair the solubility table knows.
 *
 * The check runs per ion, not per atom. A polyatomic ion is one ion, so its
 * member atoms carry no charge of their own that a table entry could confirm —
 * a carbonate's member oxygen would read as a bare O²⁻ against the table's −2
 * and no carbonate, sulfate or nitrate would ever be whole. A single-atom ion
 * is compared with the charge its element has in the table, which keeps a
 * calcium with one chloride or a sodium with one oxygen detectable; an element
 * outside the table (iron, copper, silver) has no such expectation and only has
 * to be an ion at all.
 *
 * @export
 * @param {Molecule} molecule - the drawn graph
 * @param {ReadonlyMap<number, number>} charges - the charges the ionic bonds produce
 * @returns {boolean} true when every ion of the formula unit is complete
 */
export function completeIonicFormula(molecule: Molecule, charges: ReadonlyMap<number, number>): boolean {
	const byId = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const ions = new Set(molecule.bonds.filter(bond => !isCovalentBond(bond)).flatMap(bond => [bond.from, bond.to]));
	const links = new Map(molecule.atoms.map(atom => [atom.id, [] as number[]]));
	for (const bond of molecule.bonds) if (isCovalentBond(bond)) {
		links.get(bond.from).push(bond.to);
		links.get(bond.to).push(bond.from);
	}
	const seen = new Set<number>();
	for (const root of ions) {
		if (seen.has(root)) continue;
		const part = [root];
		seen.add(root);
		for (const id of part) for (const neighbor of links.get(id)) {
			if (seen.has(neighbor)) continue;
			seen.add(neighbor);
			part.push(neighbor);
		}
		const total = part.reduce((sum, id) => sum + charges.get(id), 0);
		if (part.length > 1) {
			if (!total) return false;
			continue;
		}
		const expected = commonIonCharge(byId.get(root).atomicNumber);
		if (!total || (expected !== undefined && Math.abs(total) !== Math.abs(expected))) return false;
	}
	return true;
}
