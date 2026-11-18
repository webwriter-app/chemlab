/**
 * Ionic conductivity of the electrolyte, and the resistance of the path it
 * carries the cell current through.
 *
 * A cell's internal resistance is not a property of the cell but of the
 * solution between its electrodes: a supporting electrolyte conducts a
 * thousand times better than pure water, and the same solution conducts worse
 * the further the strips are apart and the less of them is wetted. The model
 * therefore computes the resistance from the ion inventory of the vessel and
 * from the geometry the canvas measured, instead of using a fixed value.
 */

/**
 * Limiting molar conductivity of one ion at 25 °C, in S·cm²/mol.
 *
 * The value belongs to the ion as it is written, so a doubly charged ion
 * carries twice the tabulated half-ion figure. An ion that is not listed
 * falls back to {@link DEFAULT_MOLAR_CONDUCTIVITY}, which keeps an exotic
 * solute conducting instead of turning the electrolyte into an insulator.
 *
 * @type {Record<string, number>}
 */
export const MOLAR_CONDUCTIVITY: Record<string, number> = {
	"[H+]": 349.8,
	"[OH-]": 198.3,
	"[Na+]": 50.1,
	"[K+]": 73.5,
	"[Li+]": 38.7,
	"[NH4+]": 73.5,
	"[Ag+]": 61.9,
	"[Cu2+]": 107.2,
	"[Zn+2]": 105.6,
	"[Fe2+]": 108.0,
	"[Fe3+]": 204.0,
	"[Ca2+]": 119.0,
	"[Mg2+]": 106.2,
	"[Ba2+]": 127.2,
	"[Sr2+]": 119.0,
	"[Pb2+]": 142.0,
	"[Ni2+]": 108.0,
	"[Co2+]": 110.0,
	"[Mn2+]": 107.0,
	"[Cd2+]": 108.0,
	"[Sn2+]": 118.0,
	"[Hg2+]": 127.0,
	"[Al3+]": 189.0,
	"[Cl-]": 76.3,
	"[Br-]": 78.1,
	"[I-]": 76.8,
	"[F-]": 55.4,
	"[NO3-]": 71.4,
	"[O-]S(=O)(=O)[O-]": 160.0,
	"[O-]S(=O)(=O)[O-].[H+]": 50.0,
	"[O-]C([O-])=O": 138.6,
	"OC([O-])=O": 44.5,
	"CC([O-])=O": 40.9,
	"[O-]Cl(=O)(=O)=O": 67.3,
	"[O-]Cl(=O)=O": 64.6,
	"[O-]Br(=O)=O": 55.7,
	"[O-]I(=O)=O": 40.7,
	"[O-]C#N": 82.0,
	"[S-]C#N": 66.0,
	"[O-]S([O-])(=O)=O": 160.0,
	"[O-]C([O-])=O.[O-]C([O-])=O": 148.4,
	"[O-]P([O-])([O-])=O": 207.0,
	"OP([O-])([O-])=O": 114.0,
	"OP(=O)(O)[O-]": 36.0,
	"[O-][Mn](=O)(=O)=O": 61.3,
	"[O-]S(=O)(=O)[O-].[O-]S(=O)(=O)[O-]": 170.0,
};

/**
 * Molar conductivity assumed for an ion the table does not know, in
 * S·cm²/mol. It is the order of a small inorganic ion, so an unlisted solute
 * conducts like a salt rather than like water.
 *
 * @type {number}
 */
export const DEFAULT_MOLAR_CONDUCTIVITY = 50;

/**
 * Empirical ion-interaction constant of the Kohlrausch form, in
 * (mol/L)^-½. The sum of the limiting values overestimates a concentrated
 * solution because the ions shield each other; dividing by
 * `1 + K·√I` reproduces 0.1 mol/L NaCl (10.6 against 10.7 mS/cm measured)
 * and 1 mol/L NaCl (79 against 85 mS/cm).
 *
 * @type {number}
 */
export const KOHLRAUSCH_CONSTANT = 0.6;

/**
 * Relative change of the conductivity per kelvin, in 1/K. A warm electrolyte
 * conducts better because its ions move faster; 2 %/K is the usual figure for
 * a salt solution near room temperature.
 *
 * @type {number}
 */
export const CONDUCTIVITY_TEMPERATURE_COEFFICIENT = 0.02;

/**
 * Conductivity of saturated potassium chloride at 25 °C, in S/cm. A salt
 * bridge is filled with it precisely because it conducts so well.
 *
 * @type {number}
 */
export const SATURATED_KCL_CONDUCTIVITY = 0.2;

/**
 * Inner diameter of a salt bridge tube, in mm. A bridge is a narrow tube, so
 * its bore and not the vessel decides how much current it passes.
 *
 * @type {number}
 */
export const BRIDGE_BORE_MM = 8;

/**
 * Electrode spacing assumed when the canvas has not measured the layout, in
 * cm. Probes and authored data without positions fall back to it.
 *
 * @type {number}
 */
export const DEFAULT_ELECTRODE_SPACING = 2.5;

/**
 * Smallest spacing the model allows between two strips, in cm. Two strips that
 * touch would otherwise divide by zero.
 *
 * @type {number}
 */
export const MIN_ELECTRODE_SPACING = 0.2;

/**
 * One dissolved ion, as the conductivity sum needs it.
 *
 * @export
 * @interface ConductingIon
 */
export interface ConductingIon {
	/** SMILES of the ion, which is the key of {@link MOLAR_CONDUCTIVITY}. */
	smiles: string;
	/** Free concentration in mol/L. */
	concentration: number;
	/** Charge number of the ion, as the magnitude the ionic strength needs. */
	charge: number;
}

/**
 * Conductivity of a solution, in S/cm.
 *
 * The ions add up by their limiting molar conductivities, scaled by the
 * Kohlrausch factor for the ionic strength and by the temperature
 * coefficient. Pure water comes out at 5.5·10⁻⁸ S/cm, which is the textbook
 * value, and a 1 mol/L supporting electrolyte at about 80 mS/cm.
 *
 * @export
 * @param {Iterable<ConductingIon>} ions - the free ions of the solution
 * @param {number} [temperature] - the temperature in °C
 * @returns {number} the conductivity in S/cm
 */
export function solutionConductivity(ions: Iterable<ConductingIon>, temperature = 25): number {
	let sum = 0;
	let strength = 0;
	for (const ion of ions) {
		const concentration = ion.concentration;
		if (!(concentration > 0) || !Number.isFinite(concentration)) continue;
		const charge = Math.abs(ion.charge) || 1;
		sum += concentration * (MOLAR_CONDUCTIVITY[ion.smiles] ?? DEFAULT_MOLAR_CONDUCTIVITY);
		// The shielding depends on the ionic strength, which halves the
		// charge-weighted sum: a 1:1 electrolyte at c mol/L has I = c.
		strength += 0.5 * concentration * charge * charge;
	}
	if (!(sum > 0)) return 0;
	const interaction = 1 + KOHLRAUSCH_CONSTANT * Math.sqrt(strength);
	const warm = 1 + CONDUCTIVITY_TEMPERATURE_COEFFICIENT * (temperature - 25);
	return sum / (1000 * interaction) * Math.max(0.2, warm);
}

/**
 * Resistance of a conducting path, in Ω.
 *
 * @export
 * @param {number} conductivity - the conductivity of the electrolyte in S/cm
 * @param {number} length - the length of the path in cm
 * @param {number} area - its cross section in cm²
 * @returns {number} the resistance in Ω, or `Infinity` for a path that cannot
 *   carry current
 */
export function pathResistance(conductivity: number, length: number, area: number): number {
	if (!(conductivity > 0) || !(length > 0) || !(area > 0)) return Infinity;
	return length / (conductivity * area);
}

/**
 * Resistance of a salt bridge, in Ω.
 *
 * @export
 * @param {number} length - the distance between the two legs in cm
 * @returns {number} the resistance in Ω
 */
export function bridgeResistance(length: number): number {
	const bore = Math.PI * (BRIDGE_BORE_MM / 20) ** 2;
	return pathResistance(SATURATED_KCL_CONDUCTIVITY, length, bore);
}
