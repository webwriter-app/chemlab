import { ElementData } from "../chemlib/ElementData";
import { idealSolubility, normalizeFormula, saltSolubility } from "../chemlib/saltSolubility";
import { chemicalCatalog, type CatalogChemical, type MoleculeDefinition } from "../data/chemicals";
import { ionicCharges, isCovalentBond } from "./bond-types";
import { formula } from "./formula";
import type { Atom, Bond, Molecule } from "./structure";

const elementNames = ElementData.getElementList();
const elementNumbers = new Map(elementNames.map((name, index) => [name, index + 1]));

/**
 * One connected fragment of a formula unit, written the way the catalog writes
 * a molecule definition. The charges are the ones the ionic bonds leave behind,
 * so a fragment is always an ion of the solution or a neutral molecule.
 */
export type UnitFragment = {
	/** Element names in fragment order, as `MoleculeDefinition.atoms` spells them. */
	atoms: string[];
	/** Charge per atom after the ionic transfer. */
	charges: number[];
	/** Bonds inside the fragment, as `MoleculeDefinition.bonds` writes them. */
	bonds: string[];
	/** Hill formula of the fragment. */
	formula: string;
	/** Net charge of the fragment. */
	charge: number;
};

/**
 * A formula unit split into the ions of the solution and the crystal water it
 * carries, plus the text that names exactly this composition.
 */
export type FormulaUnit = {
	/** Ionic and molecular fragments in graph order. */
	fragments: UnitFragment[];
	/** Neutral water fragments, in graph order. */
	water: UnitFragment[];
	/**
	 * Canonical text of the formula unit: the sorted fragment formulas with
	 * their net charges, plus the number of crystal waters when there are any.
	 * Two drawings of one compound share it, whatever their atom numbering,
	 * bond layout or camera; a different stoichiometry, protonation state or
	 * hydrate does not.
	 */
	signature: string;
};

/** A catalog solid whose formula unit is the one a drawing was identified as. */
export type CatalogIdentity = {
	/** Catalog name, also the permission key of the reagent. */
	name: string;
	/** Catalog formula, hydrates included. */
	formula: string;
	/** Solid density of the weighed form, in g/mL. */
	density: number;
	/** The authored formula unit, the one whose equilibria are modelled. */
	molecule: MoleculeDefinition;
};

/** Why a structure has no weighed catalog form. */
export type ReagentGap = "identity-missing" | "density-missing" | "ambiguous-density";

export type ReagentMatch = { identity: CatalogIdentity; reason?: undefined } | { identity?: undefined; reason: ReagentGap };

const isWater = (fragment: UnitFragment) => fragment.atoms.length === 3 && fragment.charge === 0 &&
	fragment.atoms.filter(name => name === "oxygen").length === 1 &&
	fragment.atoms.filter(name => name === "hydrogen").length === 2;

function signatureOf(fragments: readonly UnitFragment[], water: number): string {
	const tokens = fragments.map(({ formula: hill, charge }) => charge ? `${hill}${charge > 0 ? "+" : ""}${charge}` : hill);
	if (water) tokens.push(`${water}H2O`);
	return tokens.sort().join(".");
}

/**
 * Splits a graph into the fragments a solution would hold: every covalent
 * component is one fragment, and the ionic bonds between them carry the
 * charges. The result is the identity of the compound, independent of the atom
 * numbering, the drawing layout and the viewing geometry.
 *
 * @export
 * @param {readonly Atom[]} atoms - the graph with any implicit hydrogens added
 * @param {readonly Bond[]} bonds - its bonds
 * @returns {FormulaUnit} the fragments and their signature
 */
export function formulaUnit(atoms: readonly Atom[], bonds: readonly Bond[]): FormulaUnit {
	const molecule: Molecule = { version: 1, kind: "molecule", name: "", atoms: [...atoms], bonds: [...bonds] };
	const charges = ionicCharges(molecule);
	const links = new Map(atoms.map(atom => [atom.id, [] as number[]]));
	for (const bond of bonds) if (isCovalentBond(bond)) {
		links.get(bond.from)?.push(bond.to);
		links.get(bond.to)?.push(bond.from);
	}
	const seen = new Set<number>();
	const fragments: UnitFragment[] = [];
	for (const root of atoms) {
		if (seen.has(root.id)) continue;
		const members = new Set([root.id]);
		for (const id of members) {
			seen.add(id);
			for (const neighbor of links.get(id) ?? []) if (!seen.has(neighbor)) members.add(neighbor);
		}
		const part = atoms.filter(atom => members.has(atom.id));
		const indexes = new Map(part.map((atom, index) => [atom.id, index]));
		const fragment: UnitFragment = {
			atoms: part.map(atom => elementNames[atom.atomicNumber - 1]),
			charges: part.map(atom => charges.get(atom.id)),
			bonds: bonds.filter(bond => indexes.has(bond.from) && indexes.has(bond.to))
				.map(({ from, to, order }) => `${indexes.get(from)}-${indexes.get(to)}:covalent:${order}`),
			formula: formula({ ...molecule, atoms: part, bonds: [] }),
			charge: part.reduce((sum, atom) => sum + charges.get(atom.id), 0),
		};
		fragments.push(fragment);
	}
	const water = fragments.filter(isWater);
	const solute = fragments.filter(fragment => !isWater(fragment));
	return { fragments: solute, water, signature: signatureOf(solute, water.length) };
}

/**
 * The same split for a stored definition, so a catalog recipe and a drawing of
 * the same compound meet in one identity.
 *
 * @export
 * @param {MoleculeDefinition} definition - the stored formula unit
 * @returns {FormulaUnit} the fragments and their signature
 */
export function definitionUnit(definition: MoleculeDefinition): FormulaUnit {
	const atoms: Atom[] = definition.atoms.map((name, index) => ({
		id: index + 1, atomicNumber: elementNumbers.get(name) ?? 1, charge: definition.charges?.[index] ?? 0,
		diagram: [index, 0], position: [index, 0, 0],
	}));
	const bonds: Bond[] = definition.bonds.flatMap(entry => {
		const [pair, type, order] = entry.split(":");
		// Stored bonds index the atom list, the graph addresses atoms by id.
		const [from, to] = pair.split("-").map(value => Number.parseInt(value, 10) + 1);
		// A stored `acidbase` bond is the heterolytic one the bath splits, so it
		// carries the charge of the ion pair it stands for.
		const ionic = type === "ionic" || type === "acidbase";
		return [{ from, to, order: Number.parseInt(order, 10) as Bond["order"], kind: ionic ? "ionic" as const : "covalent" as const }];
	});
	return formulaUnit(atoms, bonds);
}

/**
 * The identity of a stored formula unit, for the catalog index and for the
 * round trip of an analysis.
 *
 * @export
 * @param {MoleculeDefinition} definition - the stored formula unit
 * @returns {string} its formula-unit signature
 */
export const definitionSignature = (definition: MoleculeDefinition) => definitionUnit(definition).signature;

const indexes = new WeakMap<readonly CatalogChemical[], Map<string, CatalogIdentity[]>>();

function solidIndex(catalog: readonly CatalogChemical[]): Map<string, CatalogIdentity[]> {
	const cached = indexes.get(catalog);
	if (cached) return cached;
	const index = new Map<string, CatalogIdentity[]>();
	for (const entry of catalog) {
		const parts = entry.recipe?.parts;
		if (entry.recipe?.phase !== "solid" || !entry.preview || parts?.length !== 1) continue;
		const identity: CatalogIdentity = { name: entry.name, formula: entry.formula,
			density: entry.recipe.density, molecule: parts[0].molecule };
		const signature = definitionSignature(identity.molecule);
		const list = index.get(signature);
		if (list) list.push(identity);
		else index.set(signature, [identity]);
	}
	indexes.set(catalog, index);
	return index;
}

/**
 * The catalog solids whose formula unit carries this signature. More than one
 * entry means two weighed forms of the same composition — a hydrate pair, for
 * instance — and the caller has to refuse a choice it cannot make.
 *
 * @export
 * @param {string} signature - the formula-unit signature of the drawing
 * @param {readonly CatalogChemical[]} [catalog] - the catalog to search
 * @returns {CatalogIdentity[]} every weighed form of that composition
 */
export function catalogIdentities(signature: string, catalog: readonly CatalogChemical[] = chemicalCatalog): CatalogIdentity[] {
	return solidIndex(catalog).get(signature) ?? [];
}

/**
 * The weighed catalog form a drawing was identified as, or the reason why no
 * single one exists. A density that two entries disagree on is an unresolved
 * measurement, not a value to average.
 *
 * Two catalog entries can share one formula unit: glucose and fructose are the
 * same composition drawn differently, starch and cellulose are the same repeat
 * unit, quartz sand and silicium dioxide are one substance under two names.
 * Their signatures are equal because the chemistry is, so the choice among them
 * needs the name the drawing came from. The hint only ever chooses between
 * entries of the signature the drawing produced, so a stale name cannot
 * authorize a compound of another composition.
 *
 * @export
 * @param {string} signature - the formula-unit signature of the drawing
 * @param {readonly CatalogChemical[]} [catalog] - the catalog to search
 * @param {string} [preferred] - the catalog name the drawing was loaded from
 * @returns {ReagentMatch} the identity, or the gap that prevents one
 */
export function catalogReagent(signature: string, catalog: readonly CatalogChemical[] = chemicalCatalog,
	preferred?: string): ReagentMatch {
	const matches = catalogIdentities(signature, catalog);
	if (!matches.length) return { reason: "identity-missing" };
	const hinted = preferred ? matches.find(match => match.name === preferred) : undefined;
	if (hinted && Number.isFinite(hinted.density) && hinted.density > 0) return { identity: hinted };
	if (new Set(matches.map(({ density }) => density)).size > 1) return { reason: "ambiguous-density" };
	const [identity] = matches;
	if (!Number.isFinite(identity.density) || !(identity.density > 0)) return { reason: "density-missing" };
	return { identity };
}

/**
 * The strongest stock the catalog knows for a compound: the smallest tabulated
 * limit of its own catalog entries, else the tabulated saturation, else the
 * ideal solubility from the solubility product, and never more than the one
 * mol/L a builder stock may carry.
 *
 * @export
 * @param {CatalogIdentity} identity - the identified weighed form
 * @param {readonly CatalogChemical[]} [catalog] - the catalog that holds the stocks
 * @returns {number} the concentration limit in mol/L
 */
export function reagentLimit(identity: CatalogIdentity, catalog: readonly CatalogChemical[] = chemicalCatalog): number {
	const key = normalizeFormula(identity.formula);
	const limits = catalog.flatMap(entry => entry.concentrationLimit !== undefined &&
		normalizeFormula(entry.formula) === key ? [entry.concentrationLimit] : []);
	if (limits.length) return Math.min(1, Math.min(...limits));
	const tabulated = saltSolubility[key];
	const limit = tabulated?.saturation ??
		(tabulated?.ksp === undefined ? undefined : idealSolubility(tabulated.ksp, tabulated.ions));
	return Math.min(1, limit ?? 1);
}
