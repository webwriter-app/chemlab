import { elementByAtomicNumber } from "../periodic-table/element-reference";
import { siteIon } from "./crystal-display";
import { remainingElectrons } from "./geometry";
import type { Bond, Crystal, Molecule, Point2, Point3, Site } from "./structure";

// IUPAC PAC 88 (2016), 831–839, §6.1. Atomic numbers index the Allen scale.
const allen: Record<number, number> = {
	1: 2.300, 2: 4.160, 3: .912, 4: 1.576, 5: 2.051, 6: 2.544, 7: 3.066, 8: 3.610, 9: 4.193, 10: 4.787,
	11: .912, 12: 1.293, 13: 1.613, 14: 1.916, 15: 2.253, 16: 2.589, 17: 2.869, 18: 3.242, 19: .734, 20: 1.034,
	21: 1.19, 22: 1.38, 23: 1.53, 24: 1.65, 25: 1.75, 26: 1.80, 27: 1.84, 28: 1.88, 29: 1.85, 30: 1.597,
	31: 1.756, 32: 1.994, 33: 2.211, 34: 2.424, 35: 2.685, 36: 2.966, 37: .706, 38: .963, 39: 1.12, 40: 1.32,
	41: 1.41, 42: 1.47, 43: 1.51, 44: 1.54, 45: 1.56, 46: 1.58, 47: 1.87, 48: 1.52, 49: 1.656, 50: 1.834,
	51: 1.984, 52: 2.158, 53: 2.359, 54: 2.582, 55: .659, 56: .881, 71: 1.09, 72: 1.16, 73: 1.34, 74: 1.47,
	75: 1.60, 76: 1.65, 77: 1.68, 78: 1.72, 79: 1.92, 80: 1.76, 81: 1.789, 82: 1.854, 83: 2.01, 84: 2.19,
	85: 2.39, 86: 2.60,
};

export const atomSymbol = (number: number) => elementByAtomicNumber(number).symbol;
export const subscript = (value: string) => value.replace(/\d/g, digit => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)]);
export function chemicalFormula(value: string) {
	return value.split("·").map(part => part.replace(/^(\s*\d+)?(.*)$/, (_, coefficient, compound) =>
		(coefficient ?? "") + subscript(compound))).join("·");
}
export const signedNumber = (value: number) => value > 0 ? `+${value}` : value < 0 ? `−${-value}` : String(value);
export const formalCharge = (value: number) => value === 0 ? ""
	: `${Math.abs(value) === 1 ? "" : Math.abs(value)}${value > 0 ? "+" : "−"}`;

export function lewisDiagram(molecule: Molecule) {
	const repeat = molecule.repeatUnit;
	const members = repeat ? new Set(repeat.atoms) : undefined;
	const visible = members ? molecule.atoms.filter(atom => members.has(atom.id)) : molecule.atoms;
	const atoms = new Map(visible.map(atom => [atom.id, atom]));
	const bonds = molecule.bonds.filter(bond => atoms.has(bond.from) && atoms.has(bond.to));
	const oxidation = new Map<number, number>(visible.map(atom => [atom.id, atom.charge]));
	const incident = new Map<number, Bond[]>(visible.map(atom => [atom.id, []]));
	const assign = (from: number, to: number, order: number) => {
		const a = atoms.get(from).atomicNumber, b = atoms.get(to).atomicNumber;
		if (a === b) return;
		if (allen[a] === undefined || allen[b] === undefined || allen[a] === allen[b]) {
			oxidation.set(from, undefined);
			oxidation.set(to, undefined);
			return;
		}
		const step = Math.sign(allen[b] - allen[a]) * order;
		if (oxidation.get(from) !== undefined) oxidation.set(from, oxidation.get(from) + step);
		if (oxidation.get(to) !== undefined) oxidation.set(to, oxidation.get(to) - step);
	};
	for (const bond of bonds) {
		incident.get(bond.from).push(bond);
		incident.get(bond.to).push(bond);
		// Catalog coordination bonds retain the donor's pair. Their stored
		// formal charges describe the free donor and acceptor.
		if (!bond.dative) assign(bond.from, bond.to, bond.order);
	}
	if (repeat) assign(...repeat.ends, 1);
	return {
		bonds, ends: repeat?.ends,
		atoms: visible.map(atom => ({
			...atom, oxidation: oxidation.get(atom.id), bonds: incident.get(atom.id),
			electrons: remainingElectrons(atom, incident.get(atom.id), Number(repeat?.ends.includes(atom.id) ?? false)),
		})),
	};
}

/** The reference's capped neighbors provide 3D context. Editing starts with
 * the actual unit and its two continuation bonds. */
export function editableRepeatUnit(molecule: Molecule): Molecule {
	if (!molecule.repeatUnit || molecule.repeatUnit.atoms.length === molecule.atoms.length) return molecule;
	const unit = lewisDiagram(molecule);
	return { ...molecule, atoms: molecule.atoms.filter(atom => molecule.repeatUnit.atoms.includes(atom.id)), bonds: unit.bonds };
}

/** Lay pairs and single dots in angular gaps around the atom symbol. */
export function electronDots(center: Point2, neighbors: Point2[], count: number, used: number[] = []): Point2[] {
	if (!(count > 0 && count <= 8)) return [];
	const [x, y] = center;
	const directions = [...used, ...neighbors.map(([a, b]) => Math.atan2(b - y, a - x))];
	const dots: Point2[] = [];
	for (let pair = 0; pair < count; pair += 2) {
		let angle = Math.PI / 2;
		let best = -Infinity;
		for (let sample = 0; sample < 24; sample++) {
			const candidate = Math.PI / 2 + sample * Math.PI / 12;
			const gap = Math.min(Math.PI, ...directions.map(direction => Math.acos(Math.max(-1, Math.min(1, Math.cos(direction - candidate))))));
			if (gap > best + 1e-6) { angle = candidate; best = gap; }
		}
		directions.push(angle);
		const dx = Math.cos(angle), dy = Math.sin(angle);
		for (const offset of pair + 1 < count ? [-.055, .055] : [0]) {
			dots.push([x + .32 * dx - offset * dy, y + .32 * dy + offset * dx]);
		}
	}
	return dots;
}

export function crystalSpecies(crystal: Crystal) {
	const groups = new Map<string, { label: string; ion?: string; sites: Site[] }>();
	for (const site of crystal.sites) {
		const ion = siteIon(site);
		const label = ion || atomSymbol(site.atomicNumber);
		if (!groups.has(label)) groups.set(label, { label, ion, sites: [] });
		groups.get(label).sites.push(site);
	}
	return [...groups.values()].sort((a, b) => speciesOrder(a.ion) - speciesOrder(b.ion) || a.label.localeCompare(b.label, "en"));
}

const speciesOrder = (ion?: string) => ion?.endsWith("⁺") ? 0 : ion?.endsWith("⁻") ? 1 : 2;

export { monatomicCharge } from "./crystal-display";

/** Get the smallest supported stoichiometric ratio from unit-cell occupancies. */
export function empiricalCrystalFormula(crystal: Crystal): string {
	const counts = new Map<number, { amount: number; order: number }>();
	for (const site of crystal.sites) {
		const item = counts.get(site.atomicNumber) ?? { amount: 0, order: 2 };
		item.amount += site.occupancy ?? 1;
		item.order = Math.min(item.order, speciesOrder(siteIon(site)));
		counts.set(site.atomicNumber, item);
	}
	if (!counts.size) return "";
	const min = Math.min(...[...counts.values()].map(item => item.amount));
	let multiplier = 1;
	const ratios = [...counts.values()].map(item => item.amount / min);
	while (multiplier <= 24 && ratios.some(ratio => Math.abs(ratio * multiplier - Math.round(ratio * multiplier)) > .002)) multiplier++;
	const integral = multiplier <= 24;
	return [...counts].sort(([a, left], [b, right]) =>
		left.order - right.order || (allen[a] ?? Infinity) - (allen[b] ?? Infinity) || a - b).map(([number, { amount }]) => {
		const ratio = integral ? Math.round(amount / min * multiplier) : Number((amount / min).toFixed(3));
		return atomSymbol(number) + (ratio === 1 ? "" : subscript(String(ratio)));
	}).join("");
}

/** Pick a free fractional position for editing composition in the formula view. */
export function freeCrystalSite(sites: Site[]): Point3 {
	const fractions = [.5, 0, .25, .75, .125, .375, .625, .875];
	for (const z of fractions) {
		for (const y of fractions) {
			for (const x of fractions) {
				if (!sites.some(({ fractional: [a, b, c] }) => Math.max(Math.abs(a - x), Math.abs(b - y), Math.abs(c - z)) < 1e-6)) {
					return [x, y, z];
				}
			}
		}
	}
	throw new Error("No free fractional site"); // 512 candidates, at most 128 sites.
}
