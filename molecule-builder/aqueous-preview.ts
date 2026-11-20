import type { MoleculeDefinition } from "../data/chemicals";
import { add, perpendicular, scale, subtract, unit } from "./geometry";
import { atomSymbol, chemicalFormula } from "./structure-diagram";
import type { Atom, Molecule, Point2, Point3 } from "./structure";

const waterIon = (oxygen: boolean, hydrogenCount: number, charge: number): MoleculeDefinition => {
	const center = oxygen ? "oxygen" : "nitrogen";
	return {
		formula: oxygen ? charge > 0 ? "H₃O⁺" : "OH⁻" : "NH₄⁺",
		atoms: [center, ...Array<string>(hydrogenCount).fill("hydrogen")],
		bonds: Array.from({ length: hydrogenCount }, (_, index) => `0-${index + 1}:covalent:1`),
		charges: [charge],
	};
};

// Qualitative catalog pictures of the principal dissociation products.
// Analytical stock recipes and the equilibrium solver remain independent.
export function aqueousAcidBaseSpecies(solute: MoleculeDefinition, carboxylicAcid: boolean): MoleculeDefinition[] | undefined {
	const hydronium = waterIon(true, 3, 1);
	const formula = chemicalFormula(solute.formula);
	if (formula === "HCl") return [hydronium, { formula: "Cl⁻", atoms: ["chlorine"], bonds: [], charges: [-1] }];
	if (formula === "NH₃") return [waterIon(false, 4, 1), waterIon(true, 1, -1), solute];
	const edges = solute.bonds.map(bond => {
		const [pair, type, order] = bond.split(":");
		const [from, to] = pair.split("-").map(Number);
		return { from, to, type, order };
	});
	const conjugate = (protons: number[]): MoleculeDefinition => {
		const ids = new Map<number, number>();
		const atoms = solute.atoms.filter((_, id) => {
			if (protons.includes(id)) return false;
			ids.set(id, ids.size);
			return true;
		});
		const charges = atoms.map(() => 0);
		const bonds = edges.flatMap(({ from, to, type, order }) => {
			const a = ids.get(from), b = ids.get(to);
			if (a === undefined || b === undefined) {
				charges[a ?? b]--;
				return [];
			}
			return [`${a}-${b}:${type}:${order}`];
		});
		return { formula: "", atoms, bonds, charges };
	};
	if (carboxylicAcid) {
		const carbonyls = new Set(edges.filter(({ from, to, order }) => order === "2" &&
			solute.atoms[from] === "carbon" && solute.atoms[to] === "oxygen").map(({ from }) => from));
		const acidicOxygens = new Set(edges.filter(({ from, to, order }) => order === "1" &&
			carbonyls.has(from) && solute.atoms[to] === "oxygen").map(({ to }) => to));
		const proton = edges.find(({ from, to }) => acidicOxygens.has(from) && solute.atoms[to] === "hydrogen");
		return proton ? [hydronium, conjugate([proton.to]), solute] : undefined;
	}
	const last = solute.atoms.length - 1;
	if (formula === "H₂SO₄") return [hydronium, conjugate([last]), conjugate([last - 1, last])];
	if (formula === "H₃PO₄") return [hydronium, conjugate([last]), solute];
	return undefined;
}

export function aqueousComponents(molecule: Molecule) {
	const nodes = new Map(molecule.atoms.map(atom => [atom.id, atom]));
	const links = new Map(molecule.atoms.map(atom => [atom.id, [] as number[]]));
	for (const { from, to } of molecule.bonds) {
		links.get(from).push(to);
		links.get(to).push(from);
	}
	const visited = new Set<number>();
	const components: { atoms: Atom[]; charge: number; label: string }[] = [];
	for (const atom of molecule.atoms) {
		if (visited.has(atom.id)) continue;
		visited.add(atom.id);
		const ids = [atom.id];
		for (let i = 0; i < ids.length; i++) {
			for (const other of links.get(ids[i])) {
				if (visited.has(other)) continue;
				visited.add(other);
				ids.push(other);
			}
		}
		const atoms = ids.map(id => nodes.get(id));
		const charge = atoms.reduce((total, member) => total + member.charge, 0);
		const elements = new Map<number, number>();
		for (const { atomicNumber } of atoms) elements.set(atomicNumber, (elements.get(atomicNumber) ?? 0) + 1);
		const order = [...elements.keys()].sort((a, b) => Number(a === 8) - Number(b === 8) || a - b);
		if (order.length === 2 && order.includes(7) && order.includes(1)) order.reverse();
		if (order.length === 2 && elements.get(1) === 1 && order.includes(8)) order.reverse();
		if (elements.has(6)) order.unshift(...order.splice(order.indexOf(6), 1));
		const formula = order.map(number => atomSymbol(number) + (elements.get(number) > 1 ? elements.get(number) : "")).join("");
		const suffix = charge ? (Math.abs(charge) > 1 ? "⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(charge)] ?? Math.abs(charge) : "")
			+ (charge > 0 ? "⁺" : "⁻") : "";
		components.push({ atoms, charge, label: chemicalFormula(formula) + suffix });
	}
	return components;
}

export type HydrationWater<P> = { oxygen: P; hydrogens: [P, P]; contact: { from: P; to: P; kind: "hydrogen" | "ion-dipole" } };
type Component = ReturnType<typeof aqueousComponents>[number];

export function hydrationWaters(component: Component, dimensions: 2 | 3): HydrationWater<Point3>[] {
	if (!component.charge) return [];
	const position = (atom: Atom): Point3 => dimensions === 3 ? atom.position : [...atom.diagram, 0];
	const heavy = component.atoms.filter(atom => atom.atomicNumber !== 1);
	const core = heavy.length ? heavy : component.atoms;
	const mean = scale(core.reduce((sum, atom) => add(sum, position(atom)), [0, 0, 0] as Point3), 1 / core.length);
	const anion = component.charge < 0;
	const hydrogenDonors = component.atoms.filter(atom => atom.atomicNumber === 1);
	const donors = !anion && hydrogenDonors.length && heavy.length ? hydrogenDonors : [];
	const acceptors = anion && core.length > 1 ? core.filter(atom => [7, 8, 9, 16, 17, 35, 53].includes(atom.atomicNumber)) : [];
	const sites = donors.length ? donors : acceptors.length ? acceptors : core.length === 1 ? [] : core;
	const directions: Point3[] = sites.length ? sites.map(site => unit(subtract(position(site), mean)))
		: dimensions === 2 ? Array.from({ length: 4 }, (_, i) => [Math.cos(i * Math.PI / 2 + .36), Math.sin(i * Math.PI / 2 + .36), 0])
		: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
	return directions.filter((direction, index) => Math.hypot(...direction) > .01 && !directions.slice(0, index).some(other =>
		Math.hypot(...subtract(direction, other)) < .38)).map(direction => {
		const site = sites.find(candidate => Math.hypot(...subtract(unit(subtract(position(candidate), mean)), direction)) < .001);
		const bound = site ? position(site) : mean;
		const distance = donors.length ? 1.75 : anion ? (site ? 2.75 : 3.1) : 2.45;
		const oxygen = add(bound, scale(direction, distance));
		const lateral = dimensions === 2 ? [-direction[1], direction[0], 0] as const : perpendicular(direction);
		const length = .96, angle = 104.5 * Math.PI / 180;
		const hydrogens = anion ? [
			add(oxygen, scale(direction, -length)),
			add(oxygen, scale(add(scale(direction, -Math.cos(angle)), scale(lateral, Math.sin(angle))), length)),
		] as [Point3, Point3] : [-1, 1].map(sign => add(oxygen,
			scale(add(scale(direction, Math.cos(angle / 2)), scale(lateral, sign * Math.sin(angle / 2))), length))) as [Point3, Point3];
		return { oxygen, hydrogens, contact: { from: bound, to: anion ? hydrogens[0] : oxygen,
			kind: anion || donors.length ? "hydrogen" : "ion-dipole" } };
	});
}

export const point2 = ([x, y]: Point3): Point2 => [x, y];
