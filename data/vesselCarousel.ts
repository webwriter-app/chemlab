import { StructureManager, type Mixture, type Molecule } from "../chemlib";
import { evolvedGases } from "../chemlib/gasEvolution";
import type { AcidEquilibriumSpecies, Simulation } from "../chemlib/Simulation";

/** A gas that has left the solution, as the vessel card shows it. */
export interface VesselGas {
	formula: string;
	/** Escaped amount in mol. */
	amount: number;
}

type VesselEntry = (
	{ key: Molecule; molecule: Molecule; species?: never; gas?: never } |
	{ key: string; species: AcidEquilibriumSpecies; molecule?: never; gas?: never } |
	{ key: string; gas: VesselGas; molecule?: never; species?: never }
) & { phase: "solid" | "liquid" | "ion" | "gas" };

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
		// Hide model-generated traces, but keep the dominant species even in a dilute solution.
		if (species.concentration < 1e-6 && (species.fraction ?? 0) < 1e-3) continue;
		const index = occurrences.get(species.formula) ?? 0;
		occurrences.set(species.formula, index + 1);
		const key = `${species.formula}:${index}`;
		if (species.charge) ions.push({ entry: { key, species, phase: "ion" }, concentration: species.concentration });
		else liquids.push({ key, species, phase: "liquid" });
	}
	ions.sort((a, b) => a.concentration === b.concentration ? 0 : b.concentration - a.concentration);
	// Escaped gas sits beside the condensed phases, last so it never displaces
	// the contents the learner is watching.
	const gases: VesselEntry[] = [];
	for (const [id, amount] of mixture.evolvedGas) {
		const gas = evolvedGases[id];
		if (!gas || !(amount > 0)) continue;
		gases.push({ key: `gas:${id}`, gas: { formula: gas.formula, amount }, phase: "gas" });
	}
	return [...solids, ...liquids, ...ions.map(({ entry }) => entry), ...gases];
}
