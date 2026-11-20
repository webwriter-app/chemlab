import { chemicalCatalog, isWaterDefinition, type CatalogChemical, type MoleculeDefinition } from "../data/chemicals";
import { legacyElementKeyToAtomicNumber } from "../periodic-table/legacy-names";
import type { Molecule as LabMolecule } from "../chemlib";
import { fitGeometry } from "./geometry";
import { type Atom, type Bond, type Crystal, type Molecule, type Point3, type Structure } from "./structure";

const entries = new Map(chemicalCatalog.map(entry => [entry.name, entry]));
export const catalogEntry = (key: string) => entries.get(key);

// Conventional rock-salt cells. The phase is the normal-pressure B1 structure;
// the length below is estimated from the density already used by the catalog.
const rockSaltMass = new Map([
	["NaCl", [22.989769, 35.45]], ["KCl", [39.0983, 35.45]], ["NaBr", [22.989769, 79.904]],
	["KBr", [39.0983, 79.904]], ["NaI", [22.989769, 126.90447]], ["KI", [39.0983, 126.90447]],
]);
const faceCentered: Point3[] = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]];
const sitesPerCell = new Map([
	["Eisen", { sites: [[0, 0, 0], [.5, .5, .5]] as Point3[], mass: 55.845, bravais: "cI", spaceGroup: "Im-3m" }],
	["Kupfer", { sites: faceCentered, mass: 63.546, bravais: "cF", spaceGroup: "Fm-3m" }],
]);
const AVOGADRO_PER_ANGSTROM_CUBE = 0.602214076;

function catalogCrystal(entry: CatalogChemical): Crystal | undefined {
	const { recipe, preview } = entry;
	if (recipe?.phase !== "solid" || !preview) return undefined;
	const metal = sitesPerCell.get(entry.name);
	const salt = entry.category === "Salze" ? rockSaltMass.get(entry.formula) : undefined;
	if (!salt && !metal) return undefined;
	const length = Math.cbrt((metal ? metal.mass * metal.sites.length : 4 * (salt[0] + salt[1]))
		/ (AVOGADRO_PER_ANGSTROM_CUBE * recipe.density));
	const cation = legacyElementKeyToAtomicNumber(preview.atoms[0]);
	const anion = salt ? legacyElementKeyToAtomicNumber(preview.atoms[1]) : undefined;
	const sites = (metal?.sites ?? faceCentered).map((fractional, index) => ({
		id: index + 1, atomicNumber: cation, charge: salt ? 1 : 0, fractional,
	}));
	if (salt) {
		faceCentered.forEach(([x, y, z], index) => sites.push({
			id: index + 5, atomicNumber: anion, charge: -1, fractional: [(x + .5) % 1, y, z],
		}));
	}
	return {
		version: 1, kind: "crystal", name: entry.formula, catalogKey: entry.name, source: "catalog-density",
		cell: { lengths: [length, length, length], angles: [90, 90, 90] }, sites,
		bravais: metal?.bravais ?? "cF", spaceGroup: metal?.spaceGroup ?? "Fm-3m",
	};
}

function diagramPositions(atoms: Atom[], bonds: Bond[]) {
	// A deterministic diagram for catalog entries with no stored 2D coordinates.
	const count = atoms.length;
	const positions = atoms.map(({ diagram }) => [...diagram]);
	for (let iteration = 0; iteration < 70; iteration++) {
		const step = .024 * (1 - iteration / 75);
		for (let a = 0; a < count; a++) {
			for (let b = a + 1; b < count; b++) {
				const dx = positions[b][0] - positions[a][0];
				const dy = positions[b][1] - positions[a][1];
				const distance = Math.max(.1, Math.hypot(dx, dy));
				const push = step / distance ** 3;
				positions[a][0] -= dx * push;
				positions[a][1] -= dy * push;
				positions[b][0] += dx * push;
				positions[b][1] += dy * push;
			}
		}
		for (const bond of bonds) {
			const a = positions[bond.from - 1];
			const b = positions[bond.to - 1];
			const dx = b[0] - a[0], dy = b[1] - a[1];
			const distance = Math.max(.1, Math.hypot(dx, dy));
			const pull = (distance - 1.4) / distance * step * 5;
			a[0] += dx * pull; a[1] += dy * pull;
			b[0] -= dx * pull; b[1] -= dy * pull;
		}
	}
	return atoms.map((atom, index) => {
		const [x, y] = positions[index];
		return { ...atom, diagram: [x, y] as const, position: [x, y, 0] as const };
	});
}

function catalogMolecule(key: string | undefined, definition: MoleculeDefinition): Molecule | undefined {
	const atoms: Atom[] = [];
	for (const [index, element] of definition.atoms.entries()) {
		const atomicNumber = legacyElementKeyToAtomicNumber(element);
		if (!atomicNumber) return undefined;
		const angle = index * 2.3999632297;
		const radius = Math.sqrt(index);
		const x = radius * Math.cos(angle), y = radius * Math.sin(angle);
		atoms.push({ id: index + 1, atomicNumber, charge: definition.charges?.[index] ?? 0, diagram: [x, y], position: [x, y, 0] });
	}
	const bonds: Bond[] = [];
	for (const entry of definition.bonds ?? []) {
		const [pair, type, orderText] = entry.split(":");
		const [from, to] = pair.split("-").map(index => Number(index) + 1);
		const order = Number(orderText);
		// Ionic relationships in simulation recipes refer to modeled ions.
		if (type === "ionic" || type === "metallic") return undefined;
		if (!atoms[from - 1] || !atoms[to - 1] || (order !== 1 && order !== 2 && order !== 3)) return undefined;
		bonds.push({ from, to, order });
	}
	return { version: 1, kind: "molecule", name: definition.formula, catalogKey: key, atoms, bonds };
}

function catalogDefinitions(entry: CatalogChemical) {
	const parts = entry.recipe?.parts ?? [];
	if (entry.recipe?.aqueousMolar) {
		if (entry.formula === "NaCl") {
			return [
				{ formula: "Na⁺", atoms: ["sodium"], charges: [1], bonds: [] },
				{ formula: "Cl⁻", atoms: ["chlorine"], charges: [-1], bonds: [] },
			];
		}
		return parts.map(part => part.molecule).filter(definition => !isWaterDefinition(definition));
	}
	return entry.preview ? [entry.preview] : parts.map(part => part.molecule);
}

/** Use the structure ChemLab actually models, without transferring mixture amounts. */
export function fromLabMolecule(molecule: LabMolecule, name: string): Molecule | undefined {
	const atoms = molecule._atoms;
	const indexes = new Map(atoms.map((atom, index) => [atom, index]));
	const bonds = molecule._bonds.filter(bond => bond._type !== "ionic" && bond._type !== "metallic").map(bond =>
		`${indexes.get(bond._from)}-${indexes.get(bond._to)}:${bond._type}:${bond._magnitude}`);
	const graph = catalogMolecule(undefined, {
		atoms: atoms.map(atom => atom.getSymbol()), charges: atoms.map(atom => atom.getIonicCharge()), bonds, formula: name,
	});
	if (!graph) return undefined;
	const placed = { ...graph, atoms: diagramPositions(graph.atoms, graph.bonds) };
	return fitGeometry(placed) ?? placed;
}

const models = new Map<string, Structure[]>();
for (const entry of chemicalCatalog) {
	const crystal = catalogCrystal(entry);
	const molecules = catalogDefinitions(entry).flatMap(definition => catalogMolecule(entry.name, definition) ?? []);
	const items = crystal ? [crystal] : molecules;
	if (items.length) models.set(entry.name, items);
}

export function hasCatalogStructure(key: string) {
	return models.has(key);
}

export function catalogStructures(key: string): Structure[] {
	return (models.get(key) ?? []).map(structure => {
		if (structure.kind === "crystal") return structure;
		const placed = { ...structure, atoms: diagramPositions(structure.atoms, structure.bonds) };
		return fitGeometry(placed) ?? placed;
	});
}

export const structureCatalog = chemicalCatalog.filter(({ name }) => models.has(name));

/** Compare composition, charge and connectivity independently of atom IDs and the camera. */
function sameGraph(a: Molecule, b: Molecule) {
	if (a.atoms.length !== b.atoms.length || a.bonds.length !== b.bonds.length) return false;
	const neighbors = (molecule: Molecule, id: number) => new Map(molecule.bonds.flatMap(({ from, to, order }) =>
		from === id ? [[to, order]] : to === id ? [[from, order]] : []));
	const candidates = a.atoms.map(atom => {
		const links = neighbors(a, atom.id);
		return { id: atom.id, links, matches: b.atoms.flatMap(other => {
			if (atom.atomicNumber !== other.atomicNumber || atom.charge !== other.charge || atom.isotope !== other.isotope) return [];
			const options = neighbors(b, other.id);
			const signature = (bonds: Map<number, number>) => [...bonds.values()].sort().join();
			return signature(links) === signature(options) ? [{ id: other.id, links: options }] : [];
		}) };
	}).sort((left, right) => left.matches.length - right.matches.length || right.links.size - left.links.size);
	const mapped = new Map<number, number>();
	const used = new Set<number>();
	let steps = 0;
	const visit = (index: number): boolean => {
		if (index === candidates.length) return true;
		if (++steps > 20_000) return false;
		const node = candidates[index];
		for (const match of node.matches) {
			if (used.has(match.id) || [...mapped].some(([id, other]) => node.links.get(id) !== match.links.get(other))) continue;
			mapped.set(node.id, match.id);
			used.add(match.id);
			if (visit(index + 1)) return true;
			mapped.delete(node.id);
			used.delete(match.id);
		}
		return false;
	};
	return visit(0);
}

function exactCrystal(a: Crystal, b: Crystal) {
	return a.cell.lengths.every((value, index) => value === b.cell.lengths[index])
		&& a.cell.angles.every((value, index) => value === b.cell.angles[index])
		&& a.sites.length === b.sites.length
		&& a.sites.every(site => b.sites.some(other => site.atomicNumber === other.atomicNumber && site.charge === other.charge
			&& site.isotope === other.isotope && site.fractional.every((value, index) => value === other.fractional[index])));
}

export function matchingRecipe(structure: Structure): CatalogChemical | undefined {
	const matches = (entry: CatalogChemical) => {
		if (!entry.recipe) return false;
		const [model, multiple] = models.get(entry.name) ?? [];
		// A single displayed solute can identify one stock only when its recipe
		// has no other solutes. A selected ion never represents a multi-ion stock.
		if (!model || multiple || model.kind !== structure.kind) return false;
		if (model.kind === "crystal" && structure.kind === "crystal") return exactCrystal(model, structure);
		return model.kind === "molecule" && structure.kind === "molecule" && sameGraph(model, structure);
	};
	const preferred = structure.catalogKey ? entries.get(structure.catalogKey) : undefined;
	if (preferred && matches(preferred)) return preferred;
	const found = chemicalCatalog.filter(matches);
	return found.length === 1 ? found[0] : undefined;
}
