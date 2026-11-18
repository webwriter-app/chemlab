import { StructureManager, type Mixture, type Molecule } from "../chemlib";
import { evolvedGases } from "../chemlib/gasEvolution";
import type { AcidEquilibriumSpecies, Simulation } from "../chemlib/Simulation";

/**
 * A volatile substance that has left the solution, as the vessel card shows
 * it. Chlorine leaves as a gas, bromine as a second liquid and iodine as a
 * solid, so the card reports the amount in the unit the phase calls for.
 */
export interface VesselGas {
	formula: string;
	/** Separated amount in mol. */
	amount: number;
	/** Phase the substance took once it left the solution. */
	phase: "gas" | "liquid" | "solid";
	/** Molar mass in g/mol, for a condensed phase. */
	molarMass?: number;
	/** Density in g/mL, for a separated liquid. */
	density?: number;
}

/**
 * Metal deposited on an electrode. It is a species of the cell like any other,
 * but it sits on the strip instead of in the solution, so the card marks it.
 */
export interface VesselPlating {
	molecule: Molecule;
	/** Deposited amount in mol. */
	mol: number;
}

type VesselEntry = (
	{ key: Molecule; molecule: Molecule; species?: never; gas?: never; plating?: never } |
	{ key: string; species: AcidEquilibriumSpecies; molecule?: never; gas?: never; plating?: never } |
	{ key: string; gas: VesselGas; molecule?: never; species?: never; plating?: never } |
	{ key: string; plating: VesselPlating; molecule?: never; species?: never; gas?: never }
) & { phase: "solid" | "liquid" | "ion" | "gas" };

/** Keep insertion order within condensed phases; sort all aqueous ions together. */
export function vesselCarouselEntries(
	mixture: Mixture,
	equilibrium?: ReturnType<typeof Simulation.getPolyproticEquilibrium>,
	platings: VesselPlating[] = []
): VesselEntry[] {
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
	// A deposit is a condensed phase of the cell, so it follows the vessel's
	// own solids and is marked as sitting on the electrode.
	for (const plating of platings) {
		if (!(plating.mol > 0)) continue;
		solids.push({ key: `plated:${plating.molecule.smilesString}`, plating, phase: "solid" });
	}
	// Separated volatiles sit beside the condensed phases, last so they never
	// displace the contents the learner is watching. A halogen that left as a
	// liquid or a solid is not a gas any more, so it carries its own phase.
	const gases: VesselEntry[] = [];
	for (const [id, amount] of mixture.evolvedGas) {
		const gas = evolvedGases[id];
		if (!gas || !(amount > 0)) continue;
		gases.push({
			key: `gas:${id}`,
			gas: { formula: gas.formula, amount, phase: gas.phase, molarMass: gas.molarMass, density: gas.density },
			phase: gas.phase,
		});
	}
	return [...solids, ...liquids, ...ions.map(({ entry }) => entry), ...gases];
}
