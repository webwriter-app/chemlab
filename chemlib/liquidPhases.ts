import type { Molecule } from "./Molecule";
import type { Mixture } from "./Mixture";

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
	if (!symbols.includes("C")) return 0;
	if (symbols.some((symbol) => !organicElements.has(symbol))) return 0;
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
	for (const molecule of mixture._activeMolecules) {
		const mass = mixture._molProperties[molecule._id + "m"];
		if (!(mass > 0)) continue;
		const density = nonpolarDensity(molecule);
		if (density > 0) {
			nonpolarMass += mass;
			nonpolarVolume += mass / density / 1000;
		} else if (!molecule.solidSaltFormula) polarMass += mass;
	}
	if (!(nonpolarVolume > 1e-12)) return [];
	// The polar phase (water with everything dissolved in it) keeps a nominal
	// 1 g/ml: the bulk volume model is too coarse for a phase band, while
	// every water-immiscible catalog liquid is lighter than that anyway.
	const polar: LiquidPhase = { volume: polarMass / 1000, density: 1, nonpolar: false };
	const nonpolar: LiquidPhase = {
		volume: nonpolarVolume,
		density: nonpolarMass / (nonpolarVolume * 1000),
		nonpolar: true,
	};
	const phases = polar.volume > 1e-9 ? [polar, nonpolar] : [nonpolar];
	return phases.sort((left, right) => left.density - right.density);
}
