/**
 * Gases that can leave an open vessel, and the solutes they leave as.
 *
 * A volatile solute escapes once its dissolved concentration passes the
 * saturation value at room temperature and 1 atm. The values are the usual
 * Henry solubilities, so a carbonate only fizzes while the solution is acidic
 * enough to hold carbonic acid, and a lab ammonia solution keeps its ammonia.
 */

/**
 * One gas that can evolve from a solution.
 *
 * @typedef {EvolvedGas}
 */
export interface EvolvedGas {
	/** Formula shown on the vessel card. */
	formula: string;
	/**
	 * Phase the substance takes once it has left the solution. Chlorine
	 * bubbles out as a gas, bromine separates as a second liquid and iodine
	 * settles as a solid, so only the first of them reaches a collection tube.
	 */
	phase: "gas" | "liquid" | "solid";
	/**
	 * Key of the acid family in the acidbase table whose neutral form escapes
	 * as this gas. Absent for a gas that only forms through a redox reaction.
	 */
	family?: string;
	/**
	 * Saturation concentration of the dissolved form in mol/L at 25 °C and
	 * 1 atm. Whatever exceeds it separates as {@link phase}; the dissolved
	 * part is what the electrode can reach and what sets the partial pressure.
	 */
	solubility?: number;
	/**
	 * SMILES of the species as a half-reaction term writes it. Only the gases
	 * that take part in an electrode reaction carry one; it lets the Nernst
	 * term find the dissolved amount behind a term such as `[Cl2]`.
	 */
	smiles?: string;
	/** Molar mass in g/mol, for the amount a condensed phase is shown in. */
	molarMass?: number;
	/** Density in g/mL of the condensed phase, for the volume it takes up. */
	density?: number;
}

/**
 * Molar volume of an ideal gas at 25 °C and 1 bar, in L/mol. A collected gas
 * is reported as the volume it would take up at lab conditions.
 *
 * @type {number}
 */
export const MOLAR_GAS_VOLUME = 24.47;

/**
 * The same molar volume in mL/mol, which is the unit a collection tube reads.
 *
 * @type {number}
 */
export const MOLAR_GAS_VOLUME_ML = MOLAR_GAS_VOLUME * 1000;

/** Gas constant in L·bar/(mol·K), the unit the molar volume comes out in. */
const GAS_CONSTANT = 0.0831446;

/**
 * Molar volume of an ideal gas at the vessel's own temperature and pressure,
 * in L/mol. A tube in a warm solution holds less gas than one at room
 * temperature, and the reading follows the vessel rather than a constant.
 *
 * @export
 * @param {number} temperature - temperature in K
 * @param {number} [pressure=101325] - pressure in Pa
 * @returns {number} molar volume in L/mol
 */
export function molarGasVolume(temperature: number, pressure = 101325): number {
	if (!(temperature > 0) || !(pressure > 0)) return MOLAR_GAS_VOLUME;
	return GAS_CONSTANT * temperature / (pressure / 1e5);
}

/**
 * Gases keyed by the id used on {@link Mixture.evolvedGas}.
 *
 * @type {Readonly<Record<string, EvolvedGas>>}
 */
export const evolvedGases: Readonly<Record<string, EvolvedGas>> = {
	// CO2: 0.034 mol/L in water at 25 °C and 1 atm
	CO2: { formula: "CO₂", phase: "gas", family: "C(=O)(O)O", solubility: 0.034 },
	// H2S: about 0.1 mol/L in saturated water
	H2S: { formula: "H₂S", phase: "gas", family: "S", solubility: 0.1 },
	// NH3: about 15 mol/L in the concentrated solution, so a lab solution stays
	NH3: { formula: "NH₃", phase: "gas", family: "N", solubility: 15 },
	// H2: 0.78 mmol/L, practically insoluble, and only formed on a metal surface
	H2: { formula: "H₂", phase: "gas", solubility: 7.8e-4, smiles: "[H][H]" },
	// O2: 1.3 mmol/L, the value that makes a water electrolysis bubble at all
	O2: { formula: "O₂", phase: "gas", solubility: 1.3e-3, smiles: "[O2]" },
	// Cl2: about 0.09 mol/L apparent, part of it already hydrolysed
	Cl2: { formula: "Cl₂", phase: "gas", solubility: 0.09, smiles: "[Cl2]" },
	// Br2: 0.21 mol/L, and the excess separates as a heavy liquid
	Br2: { formula: "Br₂", phase: "liquid", solubility: 0.21, smiles: "[Br2]", molarMass: 159.808, density: 3.1028 },
	// I2: 1.3 mmol/L, and the excess settles as a solid
	I2: { formula: "I₂", phase: "solid", solubility: 1.3e-3, smiles: "[I2]", molarMass: 253.809, density: 4.933 },
};

/**
 * The gas a half-reaction term stands for, found by its SMILES. A term that is
 * not a gas species returns `undefined`.
 *
 * @export
 * @param {string} smiles - SMILES of the term
 * @returns {(EvolvedGas | undefined)}
 */
export function gasForSmiles(smiles: string): EvolvedGas | undefined {
	for (const gas of Object.values(evolvedGases)) {
		if (gas.smiles === smiles) return gas;
	}
	return undefined;
}
