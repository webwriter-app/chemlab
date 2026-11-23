import { ElementData, StructureManager, type Mixture, type Molecule } from "../chemlib";
import type { MoleculeDefinition } from "./chemicals";

type Constituent = {
	molecule: MoleculeDefinition;
	moles: number;
	name?: string;
	solid?: true;
	/** Bulk volume of one mole of this dosed solid in litres, see `Molecule`. */
	bulk?: number;
	/** One structure per ion of the solid's formula unit, in table order. */
	precipitate?: { formula: string; ions: MoleculeDefinition[] };
};

export type MixtureRecipe = {
	kind: "vessel-mixture";
	phase: "solid" | "liquid";
	sampleMl: number;
	addedVolumeL: number;
	parts: Constituent[];
	excessCharge: number;
	hypochlorite: number;
	dissolvedGas: Record<string, number>;
};

export type SavedMixture = { key: string; name: string; recipe: MixtureRecipe };

function describeMolecule(molecule: Molecule): MoleculeDefinition {
	const indexes = new Map(molecule._atoms.map((atom, index) => [atom, index]));
	const charges = molecule._atoms.map(atom => atom.getIonicCharge());
	const bonds = molecule._bonds.map(({ _from, _to, _type, _magnitude }) => {
		const from = indexes.get(_from);
		const to = indexes.get(_to);
		if (_type === "ionic") {
			// The loader applies charge transfer when it recreates an ionic bond.
			const change = _from.getElectronNegativityPauling() > _to.getElectronNegativityPauling() ? -1 : 1;
			charges[from] -= change;
			charges[to] += change;
		}
		return `${from}-${to}:${_type}:${_magnitude}`;
	});
	const formula = StructureManager.isWater(molecule) ? "H₂O" : molecule._kekule_obj.calcFormula().getDisplayText();
	return {
		formula: molecule.solidSaltFormula ?? formula,
		atoms: molecule._atoms.map(atom => atom.getName().toLowerCase()),
		charges, bonds, aqueousAcidBase: molecule.aqueousAcidBase && structuredClone(molecule.aqueousAcidBase),
	};
}

export function snapshotMixture(mix: Mixture): MixtureRecipe | undefined {
	const parts: Constituent[] = [];
	for (const molecule of mix._activeMolecules) {
		const moles = mix._molProperties[molecule._id + "n"];
		if (!molecule._atoms.length || !(moles > 0 && Number.isFinite(moles))) continue;
		const ions = molecule.solidSaltIons;
		parts.push({
			molecule: describeMolecule(molecule), moles, name: molecule.name || undefined,
			solid: molecule.dosedAsSolid ? true : undefined,
			bulk: molecule.dosedAsSolid && molecule.solidBulkLitresPerMol
				? molecule.solidBulkLitresPerMol : undefined,
			precipitate: molecule.solidSaltFormula && ions
				? { formula: molecule.solidSaltFormula, ions: ions.map(describeMolecule) }
				: undefined,
		});
	}
	if (!parts.length) return;
	// Legacy dry contents can lack bulk volume. Give them a nominal dosing
	// volume of 1 mL/g while preserving their molar composition and dry phase.
	const measuredMl = mix.contentVolume * 1000;
	const sampleMl = measuredMl > 0 ? measuredMl : mix._activeMolecules.reduce((sum, { _id }) =>
		sum + (mix._molProperties[_id + "m"] || 0), 0);
	if (!(sampleMl > 0 && Number.isFinite(sampleMl))) return;
	return {
		kind: "vessel-mixture", phase: mix.hasLiquidContents ? "liquid" : "solid",
		sampleMl, addedVolumeL: measuredMl > 0 ? mix.addedVolume : sampleMl / 1000,
		parts, excessCharge: mix.excessCharge, hypochlorite: mix.hypochlorite,
		dissolvedGas: Object.fromEntries(mix.dissolvedGas),
	};
}

function isDefinition(definition: MoleculeDefinition): boolean {
	return !!definition && typeof definition.formula === "string" &&
		Array.isArray(definition.atoms) && definition.atoms.length > 0 &&
		definition.atoms.every(element => typeof element === "string" && ElementData.getData(element)?.["symbol"]) &&
		Array.isArray(definition.bonds) && definition.bonds.every(bond => {
			if (typeof bond !== "string") return false;
			const match = /^(\d+)-(\d+):[a-z]+:(\d+(?:\.\d+)?)$/.exec(bond);
			return !!match && Number(match[1]) !== Number(match[2]) &&
				Number(match[1]) < definition.atoms.length && Number(match[2]) < definition.atoms.length;
		}) && (definition.charges === undefined || (Array.isArray(definition.charges) &&
			definition.charges.length === definition.atoms.length && definition.charges.every(Number.isInteger)));
}

function isMixtureRecipe(value: unknown): value is MixtureRecipe {
	const recipe = value as MixtureRecipe;
	return !!recipe && recipe.kind === "vessel-mixture" && (recipe.phase === "solid" || recipe.phase === "liquid") &&
		Number.isFinite(recipe.sampleMl) && recipe.sampleMl > 0 &&
		Number.isFinite(recipe.addedVolumeL) && recipe.addedVolumeL >= 0 &&
		Number.isFinite(recipe.excessCharge) && Number.isFinite(recipe.hypochlorite) && recipe.hypochlorite >= 0 &&
		!!recipe.dissolvedGas && typeof recipe.dissolvedGas === "object" && !Array.isArray(recipe.dissolvedGas) &&
		Object.values(recipe.dissolvedGas).every(amount => Number.isFinite(amount) && amount >= 0) &&
		Array.isArray(recipe.parts) && recipe.parts.length > 0 && recipe.parts.every(part =>
			!!part && Number.isFinite(part.moles) && part.moles > 0 && isDefinition(part.molecule) &&
			(part.name === undefined || typeof part.name === "string") &&
			(part.solid === undefined || part.solid === true) &&
			(part.bulk === undefined || (Number.isFinite(part.bulk) && part.bulk > 0)) &&
			(part.precipitate === undefined || (!!part.precipitate && typeof part.precipitate.formula === "string" &&
				Array.isArray(part.precipitate.ions) && part.precipitate.ions.length >= 2 &&
				part.precipitate.ions.every(isDefinition))));
}

export function readSavedMixtures(value: unknown): SavedMixture[] {
	if (!Array.isArray(value)) return [];
	const seen = new Set<string>();
	return value.filter((item): item is SavedMixture => {
		if (!item || typeof item.key !== "string" || !/^saved-mixture:[a-z0-9-]+$/.test(item.key) || seen.has(item.key) ||
			typeof item.name !== "string" || !item.name.trim() || !isMixtureRecipe(item.recipe)) return false;
		seen.add(item.key);
		return true;
	});
}

export function prepareMixtureDose(recipe: MixtureRecipe, load: (definition: MoleculeDefinition) => Molecule) {
	if (!isMixtureRecipe(recipe)) return;
	try {
		const parts = recipe.parts.map(({ molecule, name, moles, solid, bulk, precipitate }) => {
			const model = load(molecule);
			if (name) model.name = name;
			if (solid) model.dosedAsSolid = true;
			if (bulk) model.solidBulkLitresPerMol = bulk;
			if (precipitate) {
				model.solidSaltFormula = precipitate.formula;
				model.solidSaltIons = precipitate.ions.map(ion => load(ion));
			}
			return { model, moles };
		});
		return (volumeMl: number) => {
			const fraction = volumeMl / recipe.sampleMl;
			const dose = StructureManager.newMixture();
			for (const { model, moles } of parts) dose.addMolecule(model, moles * fraction);
			dose.hasLiquidVolume = recipe.phase === "liquid";
			dose.addedVolume = recipe.addedVolumeL * fraction;
			dose.excessCharge = recipe.excessCharge * fraction;
			dose.hypochlorite = recipe.hypochlorite * fraction;
			for (const [gas, amount] of Object.entries(recipe.dissolvedGas)) dose.dissolvedGas.set(gas, amount * fraction);
			return dose;
		};
	} catch {
		return undefined;
	}
}
