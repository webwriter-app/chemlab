import type { Molecule } from "./Molecule";
import type { Mixture } from "./Mixture";
import { saltSolubility } from "./saltSolubility";

/**
 * Densities in g/ml near 20 °C of water-immiscible organic liquids, keyed by
 * the canonical SMILES Kekule generates for the catalog structures. Sources:
 * supplier safety data sheets (Heptan 0.684, Hexan 0.659, Cyclohexan 0.779,
 * Cyclohexen 0.811).
 */
const knownDensities: Readonly<Record<string, number>> = {
	"CCCCCCC": 0.684,
	"CCCCCC": 0.659,
	"C1CCCCC1": 0.779,
	"C=1CCCCC=1": 0.811,
};

const organicElements = new Set(["C", "H", "F", "Cl", "Br", "I"]);
const halogens = new Set(["F", "Cl", "Br", "I"]);

/**
 * Returns the density of a water-immiscible organic liquid in g/ml, or 0 when
 * the molecule is ionic, contains polar atoms or carries no carbon at all.
 * Editor-drawn hydrocarbons fall back to typical densities.
 *
 * @param {Molecule} molecule - the molecule to classify
 * @returns {number} density in g/ml, 0 for polar or ionic molecules
 */
export function nonpolarDensity(molecule: Molecule): number {
	if (molecule._totalCharge !== 0) return 0;
	if (molecule._atoms.some((atom) => atom.getIonicCharge())) return 0;
	const symbols = molecule._atoms.map((atom) => atom.getSymbol());
	if (!symbols.includes("C") || symbols.some((symbol) => !organicElements.has(symbol))) return 0;
	// Elemental carbon is a dosable solid in the catalog, not a hydrocarbon.
	if (symbols.every((symbol) => symbol === "C")) return 0;
	const known = knownDensities[molecule.smilesString];
	if (known) return known;
	return symbols.some((symbol) => halogens.has(symbol)) ? 1.2 : 0.7;
}

export interface LiquidPhase {
	/** phase volume in litres */
	volume: number;
	/** phase density in g/ml */
	density: number;
	/** true for the water-immiscible organic phase */
	nonpolar: boolean;
}

/**
 * Splits the liquid contents of a mixture into immiscible phases, ordered
 * lightest first (as they stack in a vessel: lightest on top). Dissolved
 * salts stay in the polar phase and raise its density, so a dense organic
 * solvent would sink below brine. Returns an empty array while no
 * water-immiscible liquid is present (the common case).
 *
 * @param {Mixture} mixture - the mixture to split
 * @returns {Array<LiquidPhase>} lightest phase first, or [] for one phase
 */
export function splitLiquidPhases(mixture: Mixture): LiquidPhase[] {
	let nonpolarVolume = 0;
	let nonpolarMass = 0;
	let polarMass = 0;
	let settledVolume = 0;
	for (const molecule of mixture._activeMolecules) {
		const mass = mixture._molProperties[molecule._id + "m"];
		if (!(mass > 0)) continue;
		if (molecule.solidSaltFormula || molecule.dosedAsSolid) {
			// Settled solid: rendered as the sediment bed, not part of a band.
			// A weighed plastic counts here too, even though its graph is a
			// hydrocarbon: a granule does not spread into a floating layer.
			const bulk = molecule.solidBulkLitresPerMol;
			if (bulk !== undefined) settledVolume += bulk * mixture._molProperties[molecule._id + "n"];
			else settledVolume += mass / (saltSolubility[molecule.solidSaltFormula ?? ""]?.solidDensity ?? 2.2) / 1000;
			continue;
		}
		const density = nonpolarDensity(molecule);
		if (density > 0) {
			// A dosed organic liquid knows its own density, which keeps the band
			// as thick as the portion the palette poured in.
			const bulk = molecule.liquidBulkLitresPerMol;
			nonpolarMass += mass;
			nonpolarVolume += bulk !== undefined
				? bulk * mixture._molProperties[molecule._id + "n"]
				: mass / density / 1000;
		} else polarMass += mass;
	}
	if (!(nonpolarVolume > 1e-12)) return [];
	// Volumes stay consistent with the mixture's volume model: the polar band
	// is the aqueous solution (water plus everything dissolved in it), the
	// nonpolar band covers the dosed organic liquids; settled solids surface
	// through addedVolume and contentVolume.
	const polarVolume = Math.max(0, mixture._solutionVolume) +
		Math.max(0, mixture.addedVolume - nonpolarVolume);
	const nonpolar: LiquidPhase = {
		volume: nonpolarVolume,
		density: nonpolarMass / (nonpolarVolume * 1000),
		nonpolar: true,
	};
	if (!(polarMass > 0 && polarVolume > 1e-9)) return [nonpolar];
	const polar: LiquidPhase = {
		volume: polarVolume,
		density: Math.min(1.35, Math.max(0.75,
			polarMass / (Math.max(1e-9, polarVolume - settledVolume) * 1000))),
		nonpolar: false,
	};
	return polar.density <= nonpolar.density ? [polar, nonpolar] : [nonpolar, polar];
}
