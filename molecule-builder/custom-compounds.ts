import { readAqueousAcidBase, type AqueousAcidBase } from "../chemlib/AcidBase";
import { iupacSource, lookupIupacDissociation } from "../chemlib/IupacDissociation";
import { ElementData } from "../chemlib/ElementData";
import { lookupCompound, lookupDissociation, type CompoundMetadata, type DissociationRow } from "../chemlib/PubChem";
import { saltSolubility } from "../chemlib/saltSolubility";
import { chemicalCatalog, type ChemicalRecipe, type MoleculeDefinition, withConcentration } from "../data/chemicals";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { commonIonCharge, completeIonicFormula, isCovalentBond, ionicCharges } from "./bond-types";
import { formula } from "./formula";
import { catalogReagent, formulaUnit, reagentLimit, type CatalogIdentity } from "./reagent-forms";
import { readStructure, type Atom, type Bond, type Molecule, type Structure } from "./structure";

type Classification = "acid" | "base" | "ampholyte" | "salt" | "other";
export type CompoundAnalysis = {
	molecule: Molecule;
	/** The whole formula unit as a stored definition, crystal water included. */
	unit: MoleculeDefinition;
	formula: string;
	smiles: string;
	molarMass: number;
	classification: Classification;
	acidSites: number;
	baseSites: number;
	stockSupported: boolean;
	solutes: MoleculeDefinition[];
	/** Formula-unit signature: the same chemistry has the same text. */
	signature: string;
	/** Neutral water molecules the formula unit carries. */
	crystalWater: number;
};

/** Why an analysed compound cannot be dosed in one of its two forms. */
export type BuilderGap = "analysis-missing" | "identity-missing" | "density-missing" | "ambiguous-density" |
	"ions-unsupported" | "concentration-missing" | "above-saturation" | "pka-series-missing";

/** The two forms a builder compound can dose, with the reason when one is missing. */
export type BuilderRecipes = {
	/** The weighed catalog form, when the drawing is one the catalog knows. */
	identity?: CatalogIdentity;
	crystalWater: number;
	/** Most concentrated stock this compound can carry, in mol/L. */
	limit: number;
	solid: { recipe?: ChemicalRecipe; reason?: BuilderGap };
	stock: { recipe?: ChemicalRecipe; reason?: BuilderGap };
};
export type CompoundFacts = {
	metadata?: CompoundMetadata;
	dissociation?: AqueousAcidBase;
	pKaSource?: string;
};
export type BuilderChemical = {
	structure: Structure;
	key: string;
	facts?: CompoundFacts;
	stockConcentration?: number;
	/** The form the worksheet doses: a weighed solid, or the prepared stock. */
	phase?: "solid";
	analysis?: CompoundAnalysis;
	recipe?: ChemicalRecipe;
	/** Set once the deferred analysis ran, also when it found nothing to analyse. */
	hydrated?: boolean;
};

const names = ElementData.getElementList();
const hydrogenValences: Readonly<Record<number, number>> = { 5: 3, 6: 4, 7: 3, 8: 2, 14: 4 };
const halogens = new Set([9, 17, 35, 53]);
/** Elements whose atoms carry a valence a hydrogen can complete. */
const organicCenters = new Set([1, 6, 7, 8, 9, 14, 15, 16, 17, 35, 53]);
const oxygen = 8, hydrogen = 1;

function atomLinks(atoms: readonly Atom[], bonds: readonly Bond[]) {
	const byId = new Map(atoms.map(atom => [atom.id, atom]));
	const links = new Map(atoms.map(atom => [atom.id, [] as { atom: Atom; order: number }[]]));
	for (const { from, to, order } of bonds) {
		links.get(from).push({ atom: byId.get(to), order });
		links.get(to).push({ atom: byId.get(from), order });
	}
	return links;
}

const isWaterPart = (part: readonly Atom[]) => part.length === 3 &&
	part.filter(atom => atom.atomicNumber === oxygen).length === 1 &&
	part.filter(atom => atom.atomicNumber === hydrogen).length === 2;

/** A stored definition of a graph, as the catalog writes its formula units. */
function storedDefinition(atoms: readonly Atom[], bonds: readonly Bond[]): MoleculeDefinition {
	const indexes = new Map(atoms.map((atom, index) => [atom.id, index]));
	return {
		formula: formula({ version: 1, kind: "molecule", name: "", atoms: [...atoms], bonds: [] }),
		atoms: atoms.map(atom => names[atom.atomicNumber - 1]),
		charges: atoms.map(atom => atom.charge),
		bonds: bonds.filter(bond => indexes.has(bond.from) && indexes.has(bond.to))
			.map(({ from, to, order, kind }) => `${indexes.get(from)}-${indexes.get(to)}:${kind === "ionic" ? "ionic" : "covalent"}:${order}`),
	};
}

/**
 * A hydroxide drawn as a neutral molecule is the ionic compound it is: one
 * metal with n hydroxyls, every bond drawn covalent and no charge anywhere.
 * Left alone, such a drawing would read as a neutral molecule, carry no acid or
 * base site and dose a stock that models nothing. The conversion only changes
 * which bonds carry the electron transfer, so the metal gets +n and every
 * hydroxyl −1 by the same rule every other salt follows.
 *
 * A drawing only qualifies when the table knows the hydroxide or the metal's
 * ion charge matches the count, so an arbitrary metal–oxygen cluster stays what
 * it was drawn as.
 *
 * @export
 * @param {Molecule} structure - the drawing, implicit hydrogens already added
 * @returns {Molecule | undefined} the ionic reading, or nothing when it is none
 */
export function ionicHydroxide(structure: Molecule): Molecule | undefined {
	if (structure.bonds.some(bond => !isCovalentBond(bond)) || structure.atoms.some(atom => atom.charge)) return;
	const metal = structure.atoms.filter(atom => atom.atomicNumber !== hydrogen && atom.atomicNumber !== oxygen);
	const oxygens = structure.atoms.filter(atom => atom.atomicNumber === oxygen);
	const hydrogens = structure.atoms.filter(atom => atom.atomicNumber === hydrogen);
	const count = oxygens.length;
	if (metal.length !== 1 || !count || count > 3 || hydrogens.length !== count ||
		structure.atoms.length !== 1 + 2 * count) return;
	const [ion] = metal;
	const symbol = ElementData.getData(names[ion.atomicNumber - 1])?.["symbol"];
	if (commonIonCharge(ion.atomicNumber) !== count && !(symbol && saltSolubility[`${symbol}(OH)${count > 1 ? count : ""}`])) return;
	const links = atomLinks(structure.atoms, structure.bonds);
	const single = (atom: Atom, element: number) => links.get(atom.id).filter(link => link.atom.atomicNumber === element && link.order === 1);
	if (links.get(ion.id).length !== count ||
		!oxygens.every(atom => single(atom, ion.atomicNumber).length === 1 && single(atom, hydrogen).length === 1) ||
		!hydrogens.every(atom => single(atom, oxygen).length === 1)) return;
	const hydroxyl = new Set(oxygens.map(atom => `${ion.id}-${atom.id}`));
	return { ...structure, bonds: structure.bonds.map(bond =>
		hydroxyl.has(`${bond.from}-${bond.to}`) ? { ...bond, kind: "ionic" as const } : bond) };
}

export function analyzeBuilderCompound(structure: Structure): CompoundAnalysis | undefined {
	if (structure.kind !== "molecule" || structure.atoms.length < 2 || structure.repeatUnit ||
		structure.representation === "aqueous-ions" || structure.representation === "constituent" ||
		structure.bonds.some(bond => bond.dative) || structure.atoms.some(atom => atom.isotope !== undefined)) return;
	return analyzeGraph(structure);
}

function analyzeGraph(structure: Molecule): CompoundAnalysis | undefined {
	const incoming = ionicCharges(structure);
	const authored = new Map(structure.atoms.map(atom => [atom.id, atom.charge]));
	const atoms = structure.atoms.map(atom => ({ ...atom, charge: incoming.get(atom.id) }));
	const bonds = structure.bonds.filter(isCovalentBond);
	let ionic = bonds.length !== structure.bonds.length;
	if (ionic && !completeIonicFormula(structure, incoming)) return;
	const originalLinks = atomLinks(atoms, bonds);
	let id = Math.max(...atoms.map(atom => atom.id)) + 1;
	for (const atom of [...atoms]) {
		const neighbors = originalLinks.get(atom.id);
		if (!neighbors.length || !hydrogenValences[atom.atomicNumber]) continue;
		// Implicit hydrogens complete an organic valence. A metal neighbour is no
		// carbon chain, so a drawn M–O–M oxide keeps the oxygens it was drawn with
		// instead of growing a hydroxyl.
		if (neighbors.some(({ atom: neighbor }) => !organicCenters.has(neighbor.atomicNumber))) continue;
		const order = neighbors.reduce((sum, link) => sum + link.order, 0);
		const adjustment = atom.atomicNumber === 6 ? -Math.abs(atom.charge) : atom.charge;
		const missing = hydrogenValences[atom.atomicNumber] + adjustment - order;
		if (missing < 0 || missing > 4) return;
		for (let place = 0; place < missing; place++) {
			const addedId = id++;
			atoms.push({ id: addedId, atomicNumber: 1, charge: 0, position: atom.position, diagram: atom.diagram });
			bonds.push({ from: atom.id, to: addedId, order: 1, kind: "covalent" });
		}
	}
	const hydroxide = ionicHydroxide({ ...structure, atoms, bonds });
	if (hydroxide) {
		ionic = true;
		const converted = ionicCharges(hydroxide);
		for (const atom of atoms) atom.charge = converted.get(atom.id) ?? atom.charge;
	}
	const molecule = hydroxide ?? { ...structure, atoms, bonds: [...bonds, ...structure.bonds.filter(bond => !isCovalentBond(bond))] };
	const links = atomLinks(atoms, bonds);
	const byId = new Map(atoms.map(atom => [atom.id, atom]));
	const unseen = new Set(byId.keys());
	const parts: Atom[][] = [];
	for (const root of unseen) {
		const component = new Set([root]);
		for (const id of component) {
			unseen.delete(id);
			for (const { atom } of links.get(id)) component.add(atom.id);
		}
		parts.push([...component].map(id => byId.get(id)));
	}
	const chargeOf = (part: readonly Atom[]) => part.reduce((sum, atom) => sum + atom.charge, 0);
	const ions = parts.filter(part => !isWaterPart(part));
	// A formula unit is ionic when it holds more than one solute fragment, also
	// when the drawing leaves the ions unconnected instead of bonding them: the
	// catalog writes its salts both ways, and the ion pair is the same salt.
	ionic = ionic || ions.length > 1;
	if (ionic ? ions.some(part => !chargeOf(part)) || chargeOf(ions.flat()) !== 0
		: parts.length !== 1) return;
	// Without a drawn ionic bond every fragment is a whole ion, so a bare atom
	// has to carry the charge its element has in the table: half a calcium or a
	// singly charged oxygen is not an ion pair any solubility model knows.
	if (ionic && bonds.length === structure.bonds.length && ions.some(part => part.length === 1 &&
		commonIonCharge(part[0].atomicNumber) !== undefined && commonIonCharge(part[0].atomicNumber) !== part[0].charge)) return;
	const hasBond = (atom: Atom, element: number, order?: number) => links.get(atom.id).some(link =>
		link.atom.atomicNumber === element && (order === undefined || link.order === order));
	const carbonyl = (atom: Atom) => atom.atomicNumber === 6 && (hasBond(atom, 8, 2) || hasBond(atom, 16, 2));
	let acidSites = 0, baseSites = 0;
	if (!ionic) for (const atom of atoms) {
		const adjacent = links.get(atom.id);
		if (atom.atomicNumber === 8 && hasBond(atom, 1, 1) && adjacent.some(({ atom: center }) =>
			carbonyl(center) || ([15, 16].includes(center.atomicNumber) && hasBond(center, 8, 2)) ||
			(center.atomicNumber === 6 && hasBond(center, 6, 2)))) acidSites++;
		if (atom.atomicNumber === 1 && adjacent.some(({ atom }) => halogens.has(atom.atomicNumber))) acidSites++;
		if (atom.atomicNumber === 16 && hasBond(atom, 1, 1)) acidSites++;
		if (atom.atomicNumber === 7 && atom.charge > 0 && hasBond(atom, 1, 1)) acidSites++;
		if (atom.atomicNumber === 7 && atom.charge === 0 && adjacent.every(({ order, atom }) =>
			order < 3 && !carbonyl(atom)) &&
			(!hasBond(atom, 1, 1) || adjacent.filter(({ atom }) => atom.atomicNumber === 6 && hasBond(atom, 6, 2)).length < 2)) baseSites++;
	}
	// The split reads the authored charges and adds the transfer itself, so the
	// unit keeps the charges a stored definition carries.
	const unitAtoms = atoms.map(atom => ({ ...atom, charge: authored.get(atom.id) ?? 0 }));
	const unitFormula = formulaUnit(unitAtoms, molecule.bonds);
	const solutes: MoleculeDefinition[] = unitFormula.fragments.map(fragment =>
		({ formula: fragment.formula, atoms: fragment.atoms, charges: fragment.charges, bonds: fragment.bonds }));
	const unit = storedDefinition(unitAtoms, molecule.bonds);
	try {
		const models = solutes.map(definition => loadMoleculeDefinition(definition));
		if (models.some(model => !model.smilesString) ||
			models.some((model, index) => model._bondCount !== solutes[index].bonds.length)) return;
		const classification = ionic ? "salt" : acidSites && baseSites ? "ampholyte" : acidSites ? "acid" : baseSites ? "base" : "other";
		// Bare oxide and sulfide ions require hydrolysis models before dosing.
		const stockSupported = ionic ? !ions.some(part => part.length === 1 && [oxygen, 16].includes(part[0].atomicNumber) && part[0].charge < -1)
			: chargeOf(parts[0]) === 0;
		return { molecule, unit, formula: formula(molecule), smiles: models.map(model => model.smilesString).sort().join("."),
			molarMass: loadMoleculeDefinition(unit).getTotMolMass(),
			classification, acidSites, baseSites, stockSupported, solutes,
			signature: unitFormula.signature, crystalWater: unitFormula.water.length };
	} catch {
		return undefined;
	}
}

export function expectedDissociations(analysis: CompoundAnalysis) {
	return analysis.acidSites + analysis.baseSites;
}

/** Accept consistent, complete near-ambient aqueous series, retaining the supplying annotation source. */
export function resolveDissociation(rows: readonly DissociationRow[], analysis: CompoundAnalysis): Pick<CompoundFacts, "dissociation" | "pKaSource"> {
	const count = expectedDissociations(analysis);
	if (count < 1 || count > 8) return {};
	const series = new Map<string, Map<number, number>>();
	for (const { text, name, source } of rows) {
		const value = text.normalize("NFKC").replace(/−/g, "-");
		if (/predicted|estimated|calculated|methanol|ethanol|acetonitrile|DMSO|cosolvent|pKb|pKow/i.test(value + " " + name)) continue;
		const temperatures = [...value.matchAll(/(-?\d+(?:\.\d+)?)\s*°\s*C/gi)];
		if (temperatures.some(match => Number(match[1]) < 20 || Number(match[1]) > 30)) continue;
		const matches: [string | undefined, string][] = [...value.matchAll(/\bpK\s*a\s*(H|[1-8])?\s*[:=]\s*(-?\d+(?:\.\d+)?)(?![\d.])/gi)].map(([, label, number]) => [label, number]);
		if (!matches.length && /^pKa(?:H)?$/i.test(name)) {
			const match = /^\s*(-?\d+(?:\.\d+)?)(?:\s*(?:\(|@|at\b).*)?\s*$/i.exec(value);
			if (match) matches.push([name.toUpperCase().endsWith("H") ? "H" : undefined, match[1]]);
		}
		if (!matches.length) continue;
		let steps = series.get(source);
		if (!steps) series.set(source, steps = new Map());
		for (const [label, numeric] of matches) {
			if ((!label && count > 1) || (label?.toUpperCase() === "H" && (analysis.classification !== "base" || count !== 1))) continue;
			const step = label && /^\d$/.test(label) ? Number(label) : 1;
			const number = Number(numeric);
			const previous = steps.get(step);
			if (previous === undefined) steps.set(step, number);
			else if (Math.abs(number - previous) > .35) steps.set(step, Number.NaN);
		}
	}
	const complete = [...series].flatMap(([source, steps]) => {
		const dissociation = readAqueousAcidBase({
			step: analysis.baseSites, pKa: Array.from({ length: count }, (_, index) => steps.get(index + 1)),
		});
		return dissociation ? [{ dissociation, pKaSource: source }] : [];
	});
	const preferred = complete.find(entry => entry.pKaSource.includes("IUPAC")) ?? complete[0];
	if (!preferred || complete.some(entry => entry.dissociation.pKa.some((pKa, index) =>
		Math.abs(pKa - preferred.dissociation.pKa[index]) > .35))) return {};
	return preferred;
}

export async function enrichBuilderCompound(analysis: CompoundAnalysis): Promise<CompoundFacts> {
	const metadata = await lookupCompound(analysis.smiles);
	if (!metadata) return {};
	const relativeMassError = metadata.molarMass ? Math.abs(metadata.molarMass - analysis.molarMass) / metadata.molarMass : 0;
	if (relativeMassError > .004) return {};
	const count = expectedDissociations(analysis);
	const rows = count ? await lookupDissociation(metadata.cid) : [];
	const measured = resolveDissociation(rows, analysis);
	if (measured.dissociation || !count || !metadata.inchi) return { metadata, ...measured };
	const dissociation = await lookupIupacDissociation(metadata.inchi, count, analysis.baseSites);
	return dissociation ? { metadata, dissociation, pKaSource: iupacSource } : { metadata };
}

/**
 * Both forms a builder compound can dose, with the reason where one is missing.
 *
 * The weighed form is the catalog's own recipe for the identified formula unit,
 * so a solid that was drawn and the same solid from the palette dose the same
 * modelled graph — a sodium hydroxide keeps the acid-base bond of its catalog
 * entry, and a hydrate keeps its crystal water. The prepared stock keeps the
 * ion list of the analysis, because that is what a prepared dilution holds. Its
 * concentration is limited by the strongest stock the catalog knows for the
 * compound and by the tabulated saturation, never by the one mol/L ceiling of a
 * builder stock.
 *
 * @export
 * @param {CompoundAnalysis | undefined} analysis - the analysed drawing
 * @param {number | undefined} concentration - the prepared strength in mol/L
 * @param {CompoundFacts} [facts] - verified metadata and the measured pKa series
 * @param {readonly CatalogChemical[]} [catalog] - the catalog to look the solid up in
 * @returns {BuilderRecipes} the two forms and the concentration limit
 */
export function builderRecipes(analysis: CompoundAnalysis | undefined, concentration: number | undefined,
	facts?: CompoundFacts, catalog = chemicalCatalog): BuilderRecipes {
	if (!analysis) return { crystalWater: 0, limit: 1,
		solid: { reason: "analysis-missing" }, stock: { reason: "analysis-missing" } };
	const reagent = catalogReagent(analysis.signature, catalog, analysis.molecule.catalogKey);
	const { identity } = reagent;
	const limit = identity ? reagentLimit(identity, catalog) : 1;
	const solid: BuilderRecipes["solid"] = identity
		? { recipe: { phase: "solid", density: identity.density, parts: [{ molecule: identity.molecule, amount: 1 }] } }
		: { reason: reagent.reason };
	const stock = (() => {
		if (!analysis.stockSupported) return { reason: "ions-unsupported" as const };
		if (!(concentration !== undefined && Number.isFinite(concentration) && concentration > 0)) return { reason: "concentration-missing" as const };
		if (concentration > limit) return { reason: "above-saturation" as const };
		const count = expectedDissociations(analysis);
		if (count && (facts?.dissociation?.pKa.length !== count || facts.dissociation.step !== analysis.baseSites)) return { reason: "pka-series-missing" as const };
		// This is an explicitly prepared dilute aqueous stock, independent of the
		// pure compound's density or unmeasured solubility.
		return { recipe: withConcentration({ aqueousMolar: true, phase: "liquid", density: 1,
			parts: analysis.solutes.map(molecule => ({ molecule: { ...molecule,
				name: analysis.solutes.length === 1 ? facts?.metadata?.name : undefined,
				aqueousAcidBase: facts?.dissociation }, amount: 1 })) }, concentration) };
	})();
	return { identity, crystalWater: analysis.crystalWater, limit, solid, stock };
}

/**
 * The prepared stock of a hydrated compound, or nothing when its concentration
 * or dissociation data does not fit its structure.
 *
 * @export
 * @param {CompoundAnalysis | undefined} analysis - the analysed drawing
 * @param {number | undefined} concentration - the prepared strength in mol/L
 * @param {CompoundFacts} [facts] - verified metadata and the measured pKa series
 * @param {readonly CatalogChemical[]} [catalog] - the catalog to look the solid up in
 * @returns {ChemicalRecipe | undefined} the stock recipe
 */
export function builderStock(analysis: CompoundAnalysis | undefined, concentration: number | undefined,
	facts?: CompoundFacts, catalog = chemicalCatalog): ChemicalRecipe | undefined {
	return builderRecipes(analysis, concentration, facts, catalog).stock.recipe;
}

/**
 * Reads one saved compound. Only what a restore has to validate is read: the
 * structure, its key, the metadata facts and the prepared concentration. The
 * graph analysis and the recipe are derived by {@link hydrateBuilderChemical}
 * when the palette needs them, because they rebuild the lab graph of every
 * saved compound and a worksheet can carry thirty of them.
 *
 * @export
 * @param {unknown} value - the authored entry, or a bare structure of an older worksheet
 * @param {number} index - its position, used for a legacy key
 * @returns {BuilderChemical | undefined}
 */
export function readBuilderChemical(value: unknown, index: number): BuilderChemical | undefined {
	const record = value as BuilderChemical;
	const structure = readStructure(record?.structure ?? value);
	if (!structure) return;
	if (!record.structure) return { structure, key: `builder-reference:${index}` };
	const key = typeof record.key === "string" && /^builder-chemical:[a-z0-9-]+$/.test(record.key)
		? record.key : `builder-reference:${index}`;
	const metadata = record.facts?.metadata;
	const facts: CompoundFacts = {
		metadata: metadata && Number.isSafeInteger(metadata.cid) && metadata.cid > 0 && typeof metadata.name === "string" ? metadata : undefined,
		dissociation: readAqueousAcidBase(record.facts?.dissociation),
		pKaSource: typeof record.facts?.pKaSource === "string" ? record.facts.pKaSource : undefined,
	};
	const stockConcentration = Number.isFinite(record.stockConcentration) ? record.stockConcentration : undefined;
	return { structure, key, facts, stockConcentration, ...(record.phase === "solid" ? { phase: "solid" as const } : {}) };
}

/**
 * Derives the deferred part of a saved compound: the graph analysis and the
 * stock recipe. Idempotent, so a second call after the first one settled does
 * nothing, and an item whose structure cannot be analysed is marked as well
 * instead of being retried on every render.
 *
 * @export
 * @param {BuilderChemical} item - the restored or newly saved compound
 * @param {CompoundAnalysis} [known] - an analysis the caller already holds
 * @returns {BuilderChemical} the same item once it is hydrated, otherwise a hydrated copy
 */
export function hydrateBuilderChemical(item: BuilderChemical, known?: CompoundAnalysis): BuilderChemical {
	if (item.hydrated) return item;
	const analysis = known ?? item.analysis ?? analyzeBuilderCompound(item.structure);
	const recipes = builderRecipes(analysis, item.stockConcentration, item.facts);
	return { ...item, analysis, recipe: (item.phase === "solid" ? recipes.solid : recipes.stock).recipe, hydrated: true };
}

/**
 * The form a hydrated compound doses: the weighed solid it was saved as, else
 * the prepared stock. The recipe is derived again at the moment of use instead
 * of trusting the one a restore cached, so a compound whose concentration or
 * dissociation data does not fit its structure never reaches a vessel.
 *
 * @export
 * @param {BuilderChemical} item - the hydrated compound
 * @param {readonly CatalogChemical[]} [catalog] - the catalog the solid is looked up in
 * @returns {ChemicalRecipe | undefined} the recipe of the saved form
 */
export function builderStockFor(item: BuilderChemical, catalog = chemicalCatalog): ChemicalRecipe | undefined {
	return builderRecipes(item.analysis, item.stockConcentration, item.facts, catalog)[item.phase === "solid" ? "solid" : "stock"].recipe;
}

/**
 * The compounds whose deferred analysis has not run yet.
 *
 * @export
 * @param {readonly BuilderChemical[]} items - the saved compounds
 * @returns {BuilderChemical[]}
 */
export function pendingBuilderChemicals(items: readonly BuilderChemical[]): BuilderChemical[] {
	return items.filter(item => !item.hydrated);
}

/** Keep only portable structure and verified metadata in the authored worksheet. */
export function portableBuilderChemical(item: BuilderChemical) {
	const { key, structure, facts, stockConcentration, phase } = item;
	if (!facts && stockConcentration === undefined && phase === undefined) return structure;
	return phase === "solid" ? { key, structure, facts, stockConcentration, phase } : { key, structure, facts, stockConcentration };
}
