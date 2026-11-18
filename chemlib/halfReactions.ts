import { Molecule } from "./Molecule";

/**
 * One species of a half-reaction, with the stoichiometric coefficient it
 * carries in the reaction as written.
 *
 * @export
 * @interface HalfReactionTerm
 */
export interface HalfReactionTerm {
	/** SMILES of the species. */
	smiles: string;
	/**
	 * Positive on the oxidised side of the reaction as written, negative on
	 * the reduced side. A reaction runs forward (reduction) when the oxidised
	 * species takes up electrons.
	 */
	coefficient: number;
	/** Where the species sits. */
	phase: "solid" | "solution" | "gas";
}

/**
 * One half-reaction of the electrochemistry, with its thermodynamics and its
 * kinetics.
 *
 * The reaction is written as a reduction,
 * `Σ ν_ox · Ox + z e⁻ → Σ ν_red · Red`, so the Nernst equation reads
 * `E = sep + RT/(zF) · Σ νᵢ ln aᵢ` with the coefficients of {@link terms}.
 * Writing it this way lets a reaction carry as many species as it needs
 * instead of exactly one pair, which is what the old table could express.
 *
 * The kinetics are a single Butler–Volmer branch pair with one Tafel slope,
 * `i(η) = i₀ · (10^(η/b) − 10^(−η/b))`, calibrated through a reference
 * overpotential at {@link REFERENCE_CURRENT_DENSITY} rather than through a
 * literature exchange current density: the tabulated i₀ values scatter over
 * orders of magnitude between sources and surfaces, while the overpotential at
 * a stated current density is what a lab measurement gives.
 *
 * @export
 * @interface HalfReaction
 */
export interface HalfReaction {
	/** Identifier, unique within the table. */
	id: string;
	/** Species with their stoichiometry. */
	terms: HalfReactionTerm[];
	/** Electrons transferred per formula unit. */
	el: number;
	/** Standard electrode potential in V against the standard hydrogen electrode. */
	sep: number;
	/** Bulk density in g/mL of a solid product, for the volume a deposit takes. */
	density?: number;
	/** Id in `evolvedGases` of the gaseous product. */
	gas?: string;
	/** Reference overpotential in V at {@link REFERENCE_CURRENT_DENSITY}. */
	etaRef: number;
	/** Tafel slope in V per decade. */
	b: number;
	/**
	 * Electrode materials the parameterisation applies to, spelled as the
	 * element name of the electrode. Empty means any conductor.
	 */
	materials: string[];
}

/** Current density the kinetic parameters are calibrated at, in A/cm². */
export const REFERENCE_CURRENT_DENSITY = 0.02;
/** Geometric area of one electrode strip, in cm². */
export const ELECTRODE_AREA = 4.5;
/**
 * Resistance above which the circuit between the two electrodes counts as
 * open, in Ω. A voltmeter is the only device that reaches it, and a cell that
 * is read by one carries no current worth booking; a lead laid straight
 * across the electrodes is far below it and lets the cell discharge.
 */
export const OPEN_CIRCUIT_RESISTANCE = 1e5;
/** Partial pressure a gas is assumed to have once it has left the solution, in bar. */
export const GAS_PARTIAL_PRESSURE = 1;

/** A metal/metal-ion couple: the body dissolves into its own cation. */
function metalCouple(
	id: string,
	metal: string,
	ion: string,
	el: number,
	sep: number,
	density: number,
	etaRef: number,
	b: number
): HalfReaction {
	return {
		id,
		terms: [
			{ smiles: ion, coefficient: 1, phase: "solution" },
			{ smiles: metal, coefficient: -1, phase: "solid" },
		],
		el,
		sep,
		density,
		etaRef,
		b,
		materials: [],
	};
}

/** `2 H⁺ + 2 e⁻ → H₂`, parameterised for one electrode material. */
function hydrogenCouple(materials: string[], etaRef: number, b: number): HalfReaction {
	return {
		id: materials.length ? `H+/H2@${materials.join("+")}` : "H+/H2",
		terms: [
			{ smiles: "[H+]", coefficient: 2, phase: "solution" },
			{ smiles: "[H][H]", coefficient: -1, phase: "gas" },
		],
		el: 2,
		sep: 0,
		gas: "H2",
		etaRef,
		b,
		materials,
	};
}

/** `O₂ + 4 H⁺ + 4 e⁻ → 2 H₂O`, parameterised for one electrode material. */
function oxygenCouple(materials: string[], etaRef: number, b: number): HalfReaction {
	return {
		id: materials.length ? `O2/H2O@${materials.join("+")}` : "O2/H2O",
		terms: [
			{ smiles: "[O2]", coefficient: 1, phase: "gas" },
			{ smiles: "[H+]", coefficient: 4, phase: "solution" },
			{ smiles: "O", coefficient: -2, phase: "solution" },
		],
		el: 4,
		sep: 1.229,
		gas: "O2",
		etaRef,
		b,
		materials,
	};
}

/** `X₂ + 2 e⁻ → 2 X⁻` for a dissolved halide. */
function halogenCouple(
	id: string,
	halogen: string,
	halide: string,
	sep: number,
	gas: string,
	etaRef: number,
	b: number
): HalfReaction {
	return {
		id,
		terms: [
			{ smiles: halogen, coefficient: 1, phase: "gas" },
			{ smiles: halide, coefficient: -2, phase: "solution" },
		],
		el: 2,
		sep,
		gas,
		etaRef,
		b,
		materials: [],
	};
}

/**
 * The half-reactions the model knows. Metal couples come first so a lookup by
 * species finds the metal couple before the gas couples, and the gas couples
 * follow with their material-specific parameterisations after the generic one.
 *
 * @export
 * @type {HalfReaction[]}
 */
export const halfReactions: HalfReaction[] = [
	// Base metals: hydrogen evolution on them is slow, so they polarise hard.
	metalCouple("Li+/Li", "[Li]", "[Li+]", 1, -3.04, 0.534, 0.90, 0.120),
	metalCouple("K+/K", "[K]", "[K+]", 1, -2.93, 0.862, 0.90, 0.120),
	metalCouple("Cs+/Cs", "[Cs]", "[Cs+]", 1, -2.92, 1.93, 0.90, 0.120),
	metalCouple("Ba2+/Ba", "[Ba]", "[Ba2+]", 2, -2.90, 3.51, 0.90, 0.120),
	metalCouple("Ca2+/Ca", "[Ca]", "[Ca2+]", 2, -2.87, 1.55, 0.90, 0.120),
	metalCouple("Na+/Na", "[Na]", "[Na+]", 1, -2.71, 0.968, 0.90, 0.120),
	metalCouple("Mg2+/Mg", "[Mg]", "[Mg2+]", 2, -2.372, 1.738, 0.90, 0.120),
	metalCouple("Be2+/Be", "[Be]", "[Be2+]", 2, -1.85, 1.85, 0.90, 0.120),
	metalCouple("Al3+/Al", "[Al]", "[Al3+]", 3, -1.66, 2.70, 0.90, 0.120),
	// Common metals.
	metalCouple("Zn2+/Zn", "[Zn]", "[Zn2+]", 2, -0.762, 7.14, 0.10, 0.060),
	metalCouple("Cr3+/Cr", "[Cr]", "[Cr3+]", 3, -0.74, 7.19, 0.10, 0.060),
	metalCouple("Fe2+/Fe", "[Fe]", "[Fe2+]", 2, -0.44, 7.874, 0.10, 0.060),
	metalCouple("Co2+/Co", "[Co]", "[Co2+]", 2, -0.28, 8.90, 0.10, 0.060),
	metalCouple("Ni2+/Ni", "[Ni]", "[Ni2+]", 2, -0.257, 8.908, 0.10, 0.060),
	metalCouple("Sn2+/Sn", "[Sn]", "[Sn2+]", 2, -0.141, 7.31, 0.10, 0.060),
	metalCouple("Pb2+/Pb", "[Pb]", "[Pb2+]", 2, -0.126, 11.34, 0.10, 0.060),
	// Noble metals and the fast outer-sphere couple.
	metalCouple("Cu2+/Cu", "[Cu]", "[Cu2+]", 2, 0.339, 8.96, 0.05, 0.060),
	metalCouple("Sb3+/Sb", "[Sb]", "[Sb3+]", 3, 0.152, 6.69, 0.05, 0.060),
	metalCouple("Ag+/Ag", "[Ag]", "[Ag+]", 1, 0.799, 10.49, 0.05, 0.060),
	metalCouple("Au3+/Au", "[Au]", "[Au3+]", 3, 1.50, 19.32, 0.05, 0.060),
	// Both forms are dissolved, so this couple needs no electrode material of
	// its own and runs on any conductor.
	{
		id: "Fe3+/Fe2+",
		terms: [
			{ smiles: "[Fe3+]", coefficient: 1, phase: "solution" },
			{ smiles: "[Fe2+]", coefficient: -1, phase: "solution" },
		],
		el: 1,
		sep: 0.771,
		etaRef: 0.05,
		b: 0.060,
		materials: [],
	},
	// Hydrogen evolution: very fast on platinum, slow on zinc.
	hydrogenCouple([], 0.40, 0.120),
	hydrogenCouple(["platinum"], 0.03, 0.030),
	hydrogenCouple(["copper"], 0.30, 0.120),
	hydrogenCouple(["zinc"], 0.80, 0.120),
	hydrogenCouple(["carbon"], 0.40, 0.120),
	// Oxygen evolution: the overpotential that decides whether a halide wins
	// the anode. Platinum is the better catalyst by a factor of two.
	oxygenCouple([], 0.90, 0.120),
	oxygenCouple(["platinum"], 0.45, 0.060),
	// Halogen evolution.
	halogenCouple("Cl2/Cl-", "[Cl2]", "[Cl-]", 1.358, "Cl2", 0.10, 0.040),
	halogenCouple("Br2/Br-", "[Br2]", "[Br-]", 1.066, "Br2", 0.10, 0.040),
	halogenCouple("I2/I-", "[I2]", "[I-]", 0.536, "I2", 0.10, 0.040),
];

/**
 * Signature that identifies the couple behind a reaction, independent of the
 * kinetics. Two entries with the same key describe the same chemistry on
 * different electrode materials.
 */
function coupleKey(reaction: HalfReaction): string {
	return reaction.terms
		.map((term) => `${term.coefficient}:${term.smiles}`)
		.sort()
		.join("|");
}

/**
 * The element name of an electrode material, spelled as the table expects it.
 * An electrode without a material has none.
 *
 * @export
 * @param {(Molecule | undefined)} material - the electrode's material
 * @returns {(string | undefined)}
 */
export function materialName(material: Molecule | undefined): string | undefined {
	return material?._atoms[0]?.getName().toLowerCase();
}

/**
 * Every half-reaction that can run on an electrode of `material`. A
 * material-specific parameterisation replaces the generic one for the same
 * couple, so a couple is never offered twice on one electrode.
 *
 * @export
 * @param {(string | undefined)} material - element name of the electrode
 * @returns {HalfReaction[]}
 */
export function halfReactionsOn(material: string | undefined): HalfReaction[] {
	const specific = halfReactions.filter((reaction) =>
		reaction.materials.length > 0 && material !== undefined && reaction.materials.includes(material));
	const covered = new Set(specific.map(coupleKey));
	return [
		...specific,
		...halfReactions.filter((reaction) =>
			reaction.materials.length === 0 && !covered.has(coupleKey(reaction))),
	];
}

/**
 * The couple in which `smiles` is the reduced form, so a dosed sample of it
 * can be oxidised. Used by the reaction without a circuit, where a metal
 * dissolves into its own cation.
 *
 * @export
 * @param {string} smiles - the species to oxidise
 * @returns {(HalfReaction | undefined)}
 */
export function oxidationOf(smiles: string): HalfReaction | undefined {
	return halfReactions.find((reaction) =>
		reaction.terms.some((term) => term.smiles === smiles && term.coefficient < 0));
}

/**
 * The couple in which `smiles` is the oxidised form, so it can be reduced.
 *
 * @export
 * @param {string} smiles - the species to reduce
 * @returns {(HalfReaction | undefined)}
 */
export function reductionOf(smiles: string): HalfReaction | undefined {
	return halfReactions.find((reaction) =>
		reaction.terms.some((term) => term.smiles === smiles && term.coefficient > 0));
}

/**
 * Exchange current density of a reaction in A/cm², from its reference
 * overpotential: `i₀ = i_ref / 10^(η_ref/b)`.
 *
 * @export
 * @param {HalfReaction} reaction - the reaction
 * @returns {number}
 */
export function exchangeCurrentDensity(reaction: HalfReaction): number {
	return REFERENCE_CURRENT_DENSITY / Math.pow(10, reaction.etaRef / reaction.b);
}

/**
 * Current density of a reaction at overpotential `eta`, in A/cm². Positive is
 * anodic. The exponent is clamped so a wild Newton step cannot overflow.
 *
 * @export
 * @param {HalfReaction} reaction - the reaction
 * @param {number} eta - overpotential in V, positive anodic
 * @returns {number}
 */
export function currentDensity(reaction: HalfReaction, eta: number): number {
	const decade = Math.pow(10, Math.max(-300, Math.min(300, eta / reaction.b)));
	return exchangeCurrentDensity(reaction) * (decade - 1 / decade);
}

/**
 * Derivative of {@link currentDensity} with respect to the overpotential. It
 * stays unclamped where the current itself is clamped, because the clamp is
 * continuous and only its slope jumps.
 *
 * @export
 * @param {HalfReaction} reaction - the reaction
 * @param {number} eta - overpotential in V, positive anodic
 * @returns {number}
 */
export function currentDensitySlope(reaction: HalfReaction, eta: number): number {
	const decade = Math.pow(10, Math.max(-300, Math.min(300, eta / reaction.b)));
	return exchangeCurrentDensity(reaction) * Math.LN10 / reaction.b * (decade + 1 / decade);
}

/**
 * Element symbol of a single-atom SMILES such as `[Cu]` or `[Cu2+]`, or
 * undefined for anything else. Used to build the neutral metal a cathode
 * deposits when the ion it came from is only computed speciation.
 *
 * @export
 * @param {string} smiles - the SMILES to read
 * @returns {(string | undefined)}
 */
export function atomSymbol(smiles: string): string | undefined {
	return /^\[([A-Z][a-z]?)(?:\d*[+-]?)\]$/.exec(smiles)?.[1];
}
