import { Mixture, Molecule, StructureManager } from "../chemlib";
import type { ChemicalRecipe, MoleculeDefinition } from "./chemicals";
import { prepareMixtureDose, type MixtureRecipe } from "./savedMixtures";

export type DoseRecipe = ChemicalRecipe | MixtureRecipe;

export interface SavedDose {
	recipe: DoseRecipe;
	volumeMl: number;
}

export function prepareDose(recipe: DoseRecipe, load: (definition: MoleculeDefinition) => Molecule) {
	if ("kind" in recipe) return prepareMixtureDose(recipe, load);
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
