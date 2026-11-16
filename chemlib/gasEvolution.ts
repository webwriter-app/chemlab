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
	 * Key of the acid family in the acidbase table whose neutral form escapes
	 * as this gas. Absent for a gas that only forms through a redox reaction.
	 */
	family?: string;
	/** Saturation concentration of the neutral form in mol/L at 25 °C, 1 atm. */
	solubility?: number;
}

/**
 * Gases keyed by the id used on {@link Mixture.evolvedGas}.
 *
 * @type {Readonly<Record<string, EvolvedGas>>}
 */
export const evolvedGases: Readonly<Record<string, EvolvedGas>> = {
	// CO2: 0.034 mol/L in water at 25 °C and 1 atm
	CO2: { formula: "CO₂", family: "C(=O)(O)O", solubility: 0.034 },
	// H2S: about 0.1 mol/L in saturated water
	H2S: { formula: "H₂S", family: "S", solubility: 0.1 },
	// NH3: about 15 mol/L in the concentrated solution, so a lab solution stays
	NH3: { formula: "NH₃", family: "N", solubility: 15 },
	// H2: practically insoluble, and only formed on a metal surface
	H2: { formula: "H₂" },
	// The halogens and oxygen leave an electrode as a gas and do not stay
	// dissolved, so they carry no solubility: whatever is produced escapes.
	Cl2: { formula: "Cl₂" },
	Br2: { formula: "Br₂" },
	I2: { formula: "I₂" },
	O2: { formula: "O₂" },
};
