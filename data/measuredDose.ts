import { Mixture, Molecule, StructureManager } from "../chemlib";
import type { ChemicalRecipe, MoleculeDefinition } from "./chemicals";

export interface SavedDose {
	recipe: ChemicalRecipe;
	volumeMl: number;
}

export function prepareDose(recipe: ChemicalRecipe, load: (definition: MoleculeDefinition) => Molecule) {
	const parts = recipe.parts
		.filter(({ amount }) => Number.isFinite(amount) && amount > 0)
		.map(({ molecule, amount }) => {
			const loaded = load(molecule);
			if (recipe.phase === "solid") loaded.dosedAsSolid = true;
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
