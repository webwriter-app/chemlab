import { Mixture, Molecule, StructureManager } from "../chemlib";
import { MOLAR_GAS_VOLUME } from "../chemlib/gasEvolution";
import type { ChemicalRecipe, MoleculeDefinition } from "./chemicals";
import { prepareMixtureDose, type MixtureRecipe } from "./savedMixtures";

export type DoseRecipe = ChemicalRecipe | MixtureRecipe;

export interface SavedDose {
	recipe: DoseRecipe;
	volumeMl: number;
}

/**
 * Largest volume of gas one dose can add, in mL.
 *
 * A gas dose is a volume and not a portion that has to fit anywhere, so the
 * slider needs a bound of its own: 500 mL are 20.4 mmol and stay a single
 * portion from a gas bottle. The usual portion is {@link DEFAULT_GAS_DOSE_ML}.
 */
export const GAS_DOSE_MAX_ML = 500;

/** Volume a gas dose offers before the user changes it, in mL. */
export const DEFAULT_GAS_DOSE_ML = 100;

/**
 * A gas is dosed as the volume it would take up at lab conditions.
 *
 * The amount follows from the molar volume alone, so the target vessel cannot
 * change it: the vessel decides afterwards how much of it dissolves, because
 * `ChemComponent.addContents` offers the gas to the mixture.
 */
function prepareGasDose(recipe: ChemicalRecipe, load: (definition: MoleculeDefinition) => Molecule) {
	const parts = recipe.parts
		.filter(({ amount }) => Number.isFinite(amount) && amount > 0)
		.map(({ molecule, amount }) => ({ molecule: load(molecule), amount }));
	return (volumeMl: number): Mixture | undefined => {
		if (!(volumeMl > 0) || !Number.isFinite(volumeMl)) return;
		const gasMol = volumeMl / 1000 / MOLAR_GAS_VOLUME;
		const dose = StructureManager.newMixture();
		if (parts.length) {
			// The model keeps this gas as a dissolved species, so the dose books
			// that species and lets the gas evolution remove the excess.
			for (const { molecule, amount } of parts) dose.addMolecule(molecule, amount * gasMol);
		} else if (recipe.gas) {
			dose.offeredGas.set(recipe.gas, gasMol);
		} else return;
		dose.hasLiquidVolume = false;
		return dose;
	};
}

export function prepareDose(recipe: DoseRecipe, load: (definition: MoleculeDefinition) => Molecule) {
	if ("kind" in recipe) return prepareMixtureDose(recipe, load);
	if (recipe.phase === "gas") return prepareGasDose(recipe, load);
	const parts = recipe.parts
		.filter(({ amount }) => Number.isFinite(amount) && amount > 0)
		.map(({ molecule, amount }) => {
			const loaded = load(molecule);
			if (recipe.phase === "solid") {
				loaded.dosedAsSolid = true;
				// Keep the bulk volume of the dosed solid with the molecule, so
				// dissolution releases what the dose actually occupied. A hydrate
				// is packed with its water and would otherwise free too little.
				loaded.solidBulkLitresPerMol = loaded.getTotMolMass() / recipe.density / 1000;
			}
			if (recipe.phase === "liquid" && !recipe.aqueousMolar && recipe.density > 0) {
				// The same for a liquid: the immiscible layer is stacked with the
				// density its own recipe states, not with a typical hydrocarbon.
				loaded.liquidBulkLitresPerMol = loaded.getTotMolMass() / recipe.density / 1000;
			}
			return { molecule: loaded, amount };
		});
	const mass = parts.reduce((sum, part) => sum + part.amount * part.molecule.getTotMolMass(), 0);
	const waterMass = parts.reduce((sum, part) => StructureManager.isWater(part.molecule)
		? sum + part.amount * part.molecule.getTotMolMass()
		: sum, 0);
	const gramsPerMl = recipe.aqueousMolar ? 1000 : waterMass > 0 ? waterMass : mass / recipe.density;
	if (!(gramsPerMl > 0 && Number.isFinite(gramsPerMl))) return;

	const makeDose = (volumeMl: number): Mixture => {
		const dose = StructureManager.newMixture();
		for (const { molecule, amount } of parts) {
			const moles = recipe.aqueousMolar && StructureManager.isWater(molecule)
				? volumeMl / molecule.getTotMolMass()
				: amount * volumeMl / gramsPerMl;
			dose.addMolecule(molecule, moles);
		}
		dose.hasLiquidVolume = recipe.phase === "liquid";
		dose.addedVolume = Math.max(0, volumeMl / 1000 - dose._solutionVolume);
		return dose;
	};
	const referenceMl = makeDose(1).contentVolume * 1000;
	if (!(referenceMl > 0 && Number.isFinite(referenceMl))) return;
	return (volumeMl: number) => makeDose(volumeMl / referenceMl);
}
