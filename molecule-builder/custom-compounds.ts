import { readAqueousAcidBase, type AqueousAcidBase } from "../chemlib/AcidBase";
import { iupacSource, lookupIupacDissociation } from "../chemlib/IupacDissociation";
import { ElementData } from "../chemlib/ElementData";
import { lookupCompound, lookupDissociation, type CompoundMetadata, type DissociationRow } from "../chemlib/PubChem";
import { type ChemicalRecipe, type MoleculeDefinition, withConcentration } from "../data/chemicals";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { completeIonicFormula, isCovalentBond, ionicCharges } from "./bond-types";
import { formula } from "./formula";
import { readStructure, type Atom, type Bond, type Molecule, type Structure } from "./structure";

type Classification = "acid" | "base" | "ampholyte" | "salt" | "other";
export type CompoundAnalysis = {
	molecule: Molecule;
	formula: string;
	smiles: string;
	molarMass: number;
	classification: Classification;
	acidSites: number;
	baseSites: number;
	stockSupported: boolean;
	solutes: MoleculeDefinition[];
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
	analysis?: CompoundAnalysis;
	recipe?: ChemicalRecipe;
	/** Set once the deferred analysis ran, also when it found nothing to analyse. */
	hydrated?: boolean;
};

const names = ElementData.getElementList();
const hydrogenValences: Readonly<Record<number, number>> = { 5: 3, 6: 4, 7: 3, 8: 2, 14: 4 };
const halogens = new Set([9, 17, 35, 53]);

function atomLinks(atoms: readonly Atom[], bonds: readonly Bond[]) {
	const byId = new Map(atoms.map(atom => [atom.id, atom]));
	const links = new Map(atoms.map(atom => [atom.id, [] as { atom: Atom; order: number }[]]));
	for (const { from, to, order } of bonds) {
		links.get(from).push({ atom: byId.get(to), order });
		links.get(to).push({ atom: byId.get(from), order });
	}
	return links;
}

export function analyzeBuilderCompound(structure: Structure): CompoundAnalysis | undefined {
	if (structure.kind !== "molecule" || structure.atoms.length < 2 || structure.repeatUnit ||
		structure.representation === "aqueous-ions" || structure.representation === "constituent" ||
		structure.bonds.some(bond => bond.dative) || structure.atoms.some(atom => atom.isotope !== undefined)) return;
	const charges = ionicCharges(structure);
	const atoms = structure.atoms.map(atom => ({ ...atom, charge: charges.get(atom.id) }));
	const bonds = structure.bonds.filter(isCovalentBond);
	const ionic = bonds.length !== structure.bonds.length;
	if (ionic && !completeIonicFormula(structure, charges)) return;
	const originalLinks = atomLinks(atoms, bonds);
	let id = Math.max(...atoms.map(atom => atom.id)) + 1;
	for (const atom of [...atoms]) {
		const neighbors = originalLinks.get(atom.id);
		if (!neighbors.length || !hydrogenValences[atom.atomicNumber]) continue;
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
	const molecule = { ...structure, atoms, bonds: [...bonds, ...structure.bonds.filter(bond => !isCovalentBond(bond))] };
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
	const partCharges = parts.map(part => part.reduce((sum, atom) => sum + atom.charge, 0));
	if (ionic ? parts.length < 2 || partCharges.some(charge => !charge) ||
			partCharges.reduce((sum, charge) => sum + charge, 0) !== 0 : parts.length !== 1) return;
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
	const solutes = parts.map(part => {
		const indexes = new Map(part.map(({ id }, index) => [id, index]));
		return {
			formula: formula({ ...molecule, atoms: part }),
			atoms: part.map(atom => names[atom.atomicNumber - 1]),
			charges: part.map(atom => atom.charge),
			bonds: bonds.filter(bond => indexes.has(bond.from) && indexes.has(bond.to))
				.map(({ from, to, order }) => `${indexes.get(from)}-${indexes.get(to)}:covalent:${order}`),
		};
	});
	try {
		const models = solutes.map(definition => loadMoleculeDefinition(definition));
		if (models.some(model => !model.smilesString) ||
			models.some((model, index) => model._bondCount !== solutes[index].bonds.length)) return;
		const classification = ionic ? "salt" : acidSites && baseSites ? "ampholyte" : acidSites ? "acid" : baseSites ? "base" : "other";
		// Bare oxide and sulfide ions require hydrolysis models before dosing.
		const stockSupported = ionic ? !parts.some(part => part.length === 1 && [8, 16].includes(part[0].atomicNumber) && part[0].charge < -1)
			: partCharges[0] === 0;
		return { molecule, formula: formula(molecule), smiles: models.map(model => model.smilesString).sort().join("."),
			molarMass: models.reduce((sum, model) => sum + model.getTotMolMass(), 0),
			classification, acidSites, baseSites, stockSupported, solutes };
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

export function builderStock(analysis: CompoundAnalysis | undefined, concentration: number | undefined, facts?: CompoundFacts): ChemicalRecipe | undefined {
	if (!analysis?.stockSupported || !(concentration > 0 && Number.isFinite(concentration)) || concentration > 1) return;
	const count = expectedDissociations(analysis);
	if (count && (facts?.dissociation?.pKa.length !== count || facts.dissociation.step !== analysis.baseSites)) return;
	// This is an explicitly prepared dilute aqueous stock, independent of the
	// pure compound's density or unmeasured solubility.
	return withConcentration({ aqueousMolar: true, phase: "liquid", density: 1,
		parts: analysis.solutes.map(molecule => ({ molecule: { ...molecule,
			name: analysis.solutes.length === 1 ? facts?.metadata?.name : undefined,
			aqueousAcidBase: facts?.dissociation }, amount: 1 })) }, concentration);
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
	return { structure, key, facts, stockConcentration };
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
	return { ...item, analysis, recipe: builderStock(analysis, item.stockConcentration, item.facts), hydrated: true };
}

/**
 * The stock a hydrated compound may dose. The recipe is derived again at the
 * moment of use instead of trusting the one a restore cached, so a compound
 * whose concentration or dissociation data does not fit its structure never
 * reaches a vessel.
 *
 * @export
 * @param {BuilderChemical} item - the hydrated compound
 * @returns {ChemicalRecipe | undefined}
 */
export function builderStockFor(item: BuilderChemical): ChemicalRecipe | undefined {
	return builderStock(item.analysis, item.stockConcentration, item.facts);
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
	const { key, structure, facts, stockConcentration } = item;
	if (!facts && stockConcentration === undefined) return structure;
	return { key, structure, facts, stockConcentration };
}
