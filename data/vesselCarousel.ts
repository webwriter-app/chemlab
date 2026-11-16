import { StructureManager, type Mixture, type Molecule } from "../chemlib";
import type { AcidEquilibriumSpecies, Simulation } from "../chemlib/Simulation";

type VesselEntry = (
	{ key: Molecule; molecule: Molecule; species?: never } |
	{ key: string; species: AcidEquilibriumSpecies; molecule?: never }
) & { phase: "solid" | "liquid" | "ion" };

/** Keep insertion order within condensed phases; sort all aqueous ions together. */
export function vesselCarouselEntries(mixture: Mixture, equilibrium?: ReturnType<typeof Simulation.getPolyproticEquilibrium>): VesselEntry[] {
	const solids: VesselEntry[] = [];
	const liquids: VesselEntry[] = [];
	const ions: Array<{ entry: VesselEntry; concentration: number }> = [];
	const liquid = mixture.hasLiquidContents;
	for (const molecule of mixture._activeMolecules) {
		if (equilibrium?.analyticalMolecules.has(molecule)) continue;
		const storedSolid = molecule.dosedAsSolid && !(equilibrium && StructureManager.isAcidBase(molecule));
		if (molecule.solidSaltFormula || storedSolid || (!liquid && !molecule._totalCharge)) {
			solids.push({ key: molecule, molecule, phase: "solid" });
		} else if (molecule._totalCharge) {
			const concentration = mixture._molProperties[molecule._id + "c"];
			ions.push({ entry: { key: molecule, molecule, phase: "ion" },
				concentration: Number.isFinite(concentration) ? concentration : -Infinity });
		} else {
			liquids.push({ key: molecule, molecule, phase: "liquid" });
		}
	}
	const occurrences = new Map<string, number>();
	for (const species of equilibrium?.species ?? []) {
		const index = occurrences.get(species.formula) ?? 0;
		occurrences.set(species.formula, index + 1);
		const key = `${species.formula}:${index}`;
		if (species.charge) ions.push({ entry: { key, species, phase: "ion" }, concentration: species.concentration });
		else liquids.push({ key, species, phase: "liquid" });
	}
	ions.sort((a, b) => a.concentration === b.concentration ? 0 : b.concentration - a.concentration);
	return [...solids, ...liquids, ...ions.map(({ entry }) => entry)];
}
