import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { Atom } from "./Atom";
import { ElementData } from "./ElementData";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";
import { saltSolubility, saltIonList } from "./saltSolubility";
import { complexEquilibrium } from "./complexes";
import { evolvedGases, gasForSmiles } from "./gasEvolution";
import {
	HalfReaction,
	HalfReactionTerm,
	OPEN_CIRCUIT_RESISTANCE,
	GAS_PARTIAL_PRESSURE,
	MASS_TRANSFER_COEFFICIENT,
	ELECTRODE_BODY_LITRES,
	halfReactionsOn,
	oxidationOf,
	reductionOf,
	currentDensity,
	currentDensitySlope,
	materialName,
	atomSymbol,
	isPassive,
	reactsWithWater,
} from "./halfReactions";
import { circuitNetwork, circuitThevenin, circuitReadings, type CircuitElement, type CircuitNetwork, type CircuitReading } from "./circuit";
import { NoIonicPathTransientModel, type NoIonicPathTransientSample } from "./NoIonicPathTransientModel";
import {
	pathResistance,
	bridgeResistance,
	solutionConductivity,
	DEFAULT_ELECTRODE_SPACING,
	MIN_ELECTRODE_SPACING,
	type ConductingIon,
} from "./conductivity";

const saltEquilibria = Object.entries(saltSolubility).map(([formula, data]) => {
	// `cation` and `anion` remain the pair the hydroxide equilibria read; `ions`
	// carries every ion of the formula unit, which a double salt needs.
	const [cation, anion, cations = 1, anions = 1] = data.ions;
	const ions = saltIonList(data.ions);
	const saturation = data.saturation ?? 0;
	const product = data.ksp ?? ions.reduce((value, { count }) =>
		value * (count * saturation) ** count, 1);
	return { formula, cation, anion, cations, anions, ions, product,
		ionCount: ions.reduce((sum, { count }) => sum + count, 0) };
}).sort((a, b) => a.product - b.product);


/**
 * Current density below which an electrode counts as carrying nothing, in
 * A/cm². An ideally polarisable electrode has no potential at all, and the
 * solver would otherwise report its starting guess as if it were a result.
 */
const PLATEAU_CURRENT = 1e-12;

/** Effective volume per cm² of a fully covering, 4 µm immersion deposit. */
const DISPLACEMENT_FILM_LITRES_PER_CM2 = 4e-7;

/**
 * Activity a species is assumed to have when it is not in the vessel yet, in
 * mol/L. A reaction that produces a species cannot be blocked by its own
 * absence, so the reactions without a circuit read a trace instead of zero.
 */
const TRACE_ACTIVITY = 1e-9;

/**
 * Slope of a reference electrode's current against its overpotential, in
 * A/cm²/V. It is large enough that the electrode holds its potential to well
 * under a millivolt at any current the cell carries, and small enough that the
 * Newton solve stays well conditioned.
 */
const REFERENCE_STIFFNESS = 1e3;

/**
 * Largest current density a reference electrode passes, in A/cm². A reference
 * senses a potential through its ionic contact; it is not a current path, so
 * the couple it stands for must not be able to carry the cell's current. The
 * limit sits far above what a voltmeter draws — 0.1 µA over the default area is
 * 2.2e-8 A/cm² — and far below any reaction current, so a measurement is
 * unaffected while a driven cell cannot close its loop through the reference.
 */
const REFERENCE_CURRENT_DENSITY = 1e-6;

/**
 * Equilibrium constant of the chlorine hydrolysis
 * `Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻` at 25 °C. It is small, so most of the
 * dissolved chlorine stays as Cl₂ and only a little of it acidifies the
 * solution, which is what a chlorine water smells and bleaches like.
 */
const CHLORINE_HYDROLYSIS = 4.2e-4;
const HYPOCHLOROUS_PKA = 7.5;

// A hydroxide's anion is the water equilibrium's OH-, not a stored ion, so the
// generic salt loop cannot see it. Those entries are solved separately by
// {@link Simulation.equilibrateHydroxides}.
const hydroxideEquilibria = saltEquilibria.filter(({ anion }) => anion === "[OH-]");
const otherSaltEquilibria = saltEquilibria.filter(({ anion }) => anion !== "[OH-]");

/** The hydroxide ion, built once for the solids that precipitate from it. */
let hydroxideIon: Molecule | undefined;
function hydroxideMolecule(): Molecule {
	if (!hydroxideIon) {
		hydroxideIon = StructureManager.newMolecule();
		const oxygen = hydroxideIon.addAtom("oxygen", "O", -1);
		const hydrogen = hydroxideIon.addAtom("hydrogen", "H");
		hydroxideIon.addBond(oxygen._id, hydrogen._id, 1, 100, "covalent");
	}
	return hydroxideIon;
}

/**
 * Solubility product from one concentration per ion of the formula unit and
 * the count of each. Every ion enters with its own exponent, so a double salt
 * multiplies the terms of both cations into the same product.
 *
 * @param {readonly number[]} concentrations - concentration per ion, mol/L
 * @param {readonly number[]} counts - copies of each ion per formula unit
 * @returns {number} the product that the entry's Ksp is compared against
 */
function saltIonProduct(concentrations: readonly number[], counts: readonly number[]): number {
	let product = 1;
	for (let index = 0; index < counts.length; index++) {
		product *= Math.max(0, concentrations[index] ?? 0) ** counts[index];
	}
	return product;
}

/**
 * One conjugate family of a solution. A family built from stored molecules
 * carries a representative and its members; a family that exists only as
 * numbers, such as the hypochlorite from chlorine hydrolysis, has neither.
 */
type AcidBaseFamily = AcidBaseSystem & {
	key: string;
	representative?: Molecule;
	step: number;
	members: Molecule[];
};

/** One ion of a salt formula unit, with how many of it the unit contains. */
interface SaltFragment {
	ion: Molecule;
	count: number;
}

/**
 * Proton state of a trial solution while a salt is being dissolved or
 * precipitated. The acid-base balance moves with the amount, so a projection
 * needs the proton concentration of that trial amount and the amounts the
 * complexes leave of each acid family.
 */
interface SaltIonState {
	/** Proton concentration of the trial state, in mol/L. */
	H: number;
	/** Unbound amount per acid-family key, in mol/L; absent without complexes. */
	unbound?: Map<string, number>;
}

/** A free ion as the salt equilibria see it: stored as a molecule, or computed from an acid family. */
interface SaltIon {
	/** Structure used when a solid precipitates from this ion. */
	molecule: Molecule;
	/** Current concentration in mol/L. */
	readonly concentration: number;
	/**
	 * Activity the Nernst equation reads, in mol/L. A hydrolysing cation is
	 * only partly present as the free ion — the rest sits in its hydrolysis
	 * products — so this is the analytical total of its acid family times the
	 * fraction of this very protonation step, divided by the complex factor.
	 * For a spectator ion it equals {@link concentration}.
	 */
	readonly activity: number;
	/**
	 * Free concentration if `delta` mol/L of this ion dissolved (negative:
	 * precipitated) in the given trial state.
	 *
	 * The ion's reservoir is its acid family, so dissolving more of a
	 * hydrolysing anion raises that family's analytical total and the protons
	 * follow; {@link SaltIonState} carries the proton concentration that the
	 * trial amount produces. A projection that freezes the protonation share
	 * makes a sulfide look nearly unchanged when it is added, which is how
	 * iron(II) sulfide got stuck at a fraction of its tabulated solubility.
	 */
	concentrationAt(delta: number, state: SaltIonState): number;
	/** Acid family whose analytical total this ion moves, if it has one. */
	readonly family?: AcidBaseFamily;
	/** Largest concentration that can be removed without going negative. */
	readonly removable: number;
	/** Apply a change in mol/L of this ion. */
	change(delta: number): void;
	/**
	 * Whether the ion is stored as its own molecule, or only exists as a
	 * protonation step of an acid family. A change to a computed ion is booked
	 * against its analytical parent, which also moves the protons, so the
	 * electrochemistry has to put those back.
	 */
	readonly computed: boolean;
}

/**
 * One vessel as the electrochemistry sees it. The free-ion view and the
 * proton concentration are expensive to build, so they are computed once per
 * vessel and step and shared by every half-reaction of both electrodes.
 *
 * @interface VesselView
 */
interface VesselView {
	/** The vessel itself. */
	mix: Mixture;
	/** Free concentration of every dissolved species, mol/L. */
	ions: Map<string, SaltIon>;
	/** Free proton concentration, mol/L. */
	protons: number;
}

/**
 * One half-reaction an electrode can run, with the potential the couple has in
 * that vessel and the amount it can convert.
 *
 * @interface HalfCandidate
 */
interface HalfCandidate {
	/** The half-reaction behind it. */
	reaction: HalfReaction;
	/** Equilibrium potential of the couple in this vessel, in V. */
	equilibrium: number;
	/** Whether the reduced side is present, so the reaction can run anodically. */
	canOxidise: boolean;
	/** Whether the oxidised side is present, so the reaction can run cathodically. */
	canReduce: boolean;
	/** Largest anodic extent, in mol of electrons. */
	anodicLimit: number;
	/** Largest cathodic extent, in mol of electrons. */
	cathodicLimit: number;
	/** Largest anodic current density the extent allows in one step, A/cm². */
	anodicDensity: number;
	/** Largest cathodic current density the extent allows in one step, A/cm². */
	cathodicDensity: number;
	/** Fraction of the whole wet electrode represented by this surface patch. */
	surfaceFraction?: number;
	/**
	 * Slope of the current against the overpotential in A/cm²/V, for an
	 * electrode that holds its potential instead of following Butler–Volmer.
	 * A reference electrode is such a candidate: it is not consumed and it
	 * does not polarise, so it pins the potential it is built for.
	 */
	stiffness?: number;
	/** Apply the half-reaction for `electronMol` electrons; positive is oxidation. */
	apply(electronMol: number): void;
}

/**
 * The mixed potential of one electrode, with the current each of its
 * half-reactions carries there.
 *
 * @interface MixedPotential
 */
interface MixedPotential {
	/**
	 * The potential the electrode settles at, in V, or `NaN` when it has none.
	 * An ideally polarisable electrode — a noble metal in a solution whose
	 * couples are all one-way — has no defined potential: its net current
	 * vanishes over a whole interval, so every value in it is a solution.
	 */
	potential: number;
	/** Current density of each candidate at {@link potential}, A/cm². */
	currents: number[];
	/**
	 * Mean of the candidates' equilibrium potentials, in V. Always finite, so
	 * it serves as the starting point of a solve even when the electrode has
	 * no potential of its own.
	 */
	guess: number;
}

/**
 * The open-circuit potentials of a cell: the mixed potential each electrode
 * settles at when no current flows. They are the one-sided limits of the loop
 * residual, because the model has no double-layer capacitance and the
 * electrode potential is continuous at I = 0 while the current is not. Their
 * difference is the cell voltage, so the cell changes direction exactly when
 * the source exceeds it.
 *
 * @interface CellLimits
 */
interface CellLimits {
	/** First electrode at zero current, V. */
	openFirst: number;
	/** Second electrode at zero current, V. */
	openSecond: number;
	/** Starting point for the first electrode's solve, V. */
	guessFirst: number;
	/** Starting point for the second electrode's solve, V. */
	guessSecond: number;
}

/**
 * The wetted area of the two electrodes of a cell, in cm². The kinetics are
 * written per area, so the current a cell carries at a given overpotential
 * scales with it.
 *
 * @interface CellAreas
 */
interface CellAreas {
	/** First electrode's area in cm². */
	first: number;
	/** Second electrode's area in cm². */
	second: number;
}

/**
 * What one electrode is about to convert in a step, before anything is booked.
 *
 * The extents of both electrodes are collected first and only then applied,
 * because two electrodes of the same vessel can draw on the same inventory:
 * an anode and a cathode in one beaker both consume the salt they share, and
 * booking them one after the other would let the second one spend what the
 * first one already took.
 *
 * @interface ElectrodeBooking
 */
interface ElectrodeBooking {
	/** The electrode's half-reactions. */
	candidates: HalfCandidate[];
	/** Current density each of them carries, A/cm². */
	currents: number[];
	/** Length of the step in s. */
	dt: number;
	/** Wetted area of the electrode in cm². */
	area: number;
	/** The vessel it dips into, if it has one. */
	view?: VesselView;
}

/**
 * The solution of one cell: both electrode potentials and the current through
 * the circuit, with the current density each half-reaction carries.
 *
 * @interface CellSolution
 */
interface CellSolution {
	/** Potential of the first electrode, V. */
	first: number;
	/** Potential of the second electrode, V. */
	second: number;
	/** Current through the cell, A. Positive means the first electrode is the anode. */
	current: number;
	/** Current density of each candidate at the first electrode, A/cm². */
	firstCurrents: number[];
	/** Current density of each candidate at the second electrode, A/cm². */
	secondCurrents: number[];
}

export interface AcidEquilibriumSpecies {
	formula: string;
	charge: number;
	amount: number;
	concentration: number;
	/** Substance name carried over from a folded stored ion, if any. */
	name?: string;
	/** Share of its acid family; solvent ions do not belong to a displayed family. */
	fraction?: number;
	/** A representative structure for this protonation state, built only when drawn. */
	structure: () => Molecule | undefined;
}

// Draw a representative structure for each macroscopic protonation state.
/** Charge-suffixed formula (Hill order) for programmatically built ions. */
function ionFormula(ion: Molecule): string {
	const counts = new Map<string, number>();
	for (const atom of ion._atoms) {
		counts.set(atom.getSymbol(), (counts.get(atom.getSymbol()) ?? 0) + 1);
	}
	let symbols = [...counts.keys()].sort();
	if (counts.has("C")) symbols = ["C", ...symbols.filter((symbol) => symbol !== "C")];
	return symbols.map((symbol) => symbol + subscript(counts.get(symbol))).join("") +
		superscript(ion._totalCharge);
}
const protonationStructures = new WeakMap<Molecule, Map<number, Molecule | undefined>>();
function protonationStructure(source: Molecule, removed: number): Molecule | undefined {
	if (!removed) return source;
	let cache = protonationStructures.get(source);
	if (!cache) protonationStructures.set(source, cache = new Map());
	if (cache.has(removed)) return cache.get(removed);

	const atoms = new Set(source._atoms);
	const charges = new Map(source._atoms.map((atom) => [atom, atom.getIonicCharge()]));
	const neighbors = (atom: typeof source._atoms[number]) => source._bonds.flatMap((bond) =>
		bond._from === atom ? [{ atom: bond._to, order: bond._magnitude }] :
		bond._to === atom ? [{ atom: bond._from, order: bond._magnitude }] : []);
	for (let step = 0; step < Math.abs(removed); step++) {
		if (removed > 0) {
			const sites = [...atoms].filter((atom) => ["O", "S", "N", "P"].includes(atom.getSymbol())).flatMap((site) => {
				const links = neighbors(site);
				const hydrogen = links.find(({ atom }) => atom.getSymbol() === "H" && atoms.has(atom))?.atom;
				if (!hydrogen) return [];
				// Prefer carboxyl protons over alcohol protons (e.g. citric acid),
				// and both over an ammonium proton (e.g. glycine).
				const carboxyl = links.some(({ atom }) => atom.getSymbol() === "C" &&
					neighbors(atom).some(({ atom, order }) => atom.getSymbol() === "O" && order === 2));
				const rank = carboxyl ? 0 : ["O", "S"].includes(site.getSymbol()) ? 1 : 2;
				return [{ site, hydrogen, rank }];
			}).sort((a, b) => a.rank - b.rank);
			if (!sites.length) { cache.set(removed, undefined); return; }
			const { site, hydrogen } = sites[0];
			atoms.delete(hydrogen);
			charges.set(site, charges.get(site) - 1);
		} else {
			// Protonate an anionic O/S first; a molecular base (ammonia, amines)
			// has no anion, so its basic heteroatom takes the proton instead.
			const site = [...atoms].find((atom) => ["O", "S"].includes(atom.getSymbol()) && charges.get(atom) < 0) ??
				[...atoms].find((atom) => ["N", "P"].includes(atom.getSymbol()) && charges.get(atom) === 0);
			if (!site) { cache.set(removed, undefined); return; }
			charges.set(site, charges.get(site) + 1);
		}
	}
	const structure = StructureManager.newMolecule();
	// Nothing in this block reads the SMILES, so the graph is built as one
	// batch and serialized once when the batch closes.
	structure.batchStructureChanges(() => {
		const copies = new Map([...atoms].map((atom) => [atom,
			structure.addAtom(atom.getName().toLowerCase(), atom.getSymbol(), charges.get(atom))]));
		for (const bond of source._bonds) {
			const from = copies.get(bond._from);
			const to = copies.get(bond._to);
			if (from && to) structure.addBond(from._id, to._id, bond._magnitude, bond._length, bond._type);
		}
		if (removed < 0) {
			for (const [atom, copy] of copies) {
				for (let count = atom.getIonicCharge(); count < charges.get(atom); count++) {
					const hydrogen = structure.addAtom("hydrogen", "H");
					structure.addBond(copy._id, hydrogen._id, 1, 100, "covalent");
				}
			}
		}
	});
	cache.set(removed, structure);
	return structure;
}

const explicitAcidStates = new Map<string, Molecule>();

/** Structures for families whose changes involve more than removing an H atom. */
function explicitAcidState(key: string, step: number): Molecule | undefined {
	const id = `${key}/${step}`;
	const cached = explicitAcidStates.get(id);
	if (cached) return cached;
	let structure: Molecule;
	const bind = (a: Atom, b: Atom, order = 1) =>
		structure.addBond(a._id, b._id, order, 100, "covalent");
	const hydrogens = (a: Atom, count: number) => {
		for (let i = 0; i < count; i++) bind(a, structure.addAtom("hydrogen", "H"));
	};
	if (key === "NCC(O)=O") {
		structure = StructureManager.newMolecule();
		const nitrogen = structure.addAtom("nitrogen", "N", step < 2 ? 1 : 0);
		const carbon = structure.addAtom("carbon", "C");
		const carboxyl = structure.addAtom("carbon", "C");
		const oxygen = structure.addAtom("oxygen", "O", step > 0 ? -1 : 0);
		bind(nitrogen, carbon);
		bind(carbon, carboxyl);
		bind(carboxyl, structure.addAtom("oxygen", "O"), 2);
		bind(carboxyl, oxygen);
		hydrogens(nitrogen, step < 2 ? 3 : 2);
		hydrogens(carbon, 2);
		if (step === 0) hydrogens(oxygen, 1);
		structure.name = ["Glycinium", "Glycin", "Glycinat"][step];
	} else if (key === "B(O)(O)O") {
		structure = StructureManager.newMolecule();
		const boron = structure.addAtom("boron", "B", -step);
		for (let i = 0; i < 3 + step; i++) {
			const oxygen = structure.addAtom("oxygen", "O");
			bind(boron, oxygen);
			hydrogens(oxygen, 1);
		}
		structure.name = step === 1 ? "Tetrahydroxyborat" : "Borsäure";
	} else return undefined;
	explicitAcidStates.set(id, structure);
	return structure;
}

/**
 * Aliases the acid-base data lists for one protonation step of a family.
 *
 * A species can be written in more than one SMILES: the hand-written form and
 * the form Kekulé generates for the same structure. The solubility table names
 * one of them, so the salt loop has to know every name a step goes by.
 *
 * @param {string} key - data key of the acid family
 * @param {number} step - protonation step, counted from the fully protonated form
 * @returns {string[]} the SMILES the data lists for that step
 */
function conjugateAliases(key: string, step: number): string[] {
	const entry: object = StructureManager._moleculeData["acidbase"][key];
	const list = entry?.["conj"];
	if (!Array.isArray(list)) return [];
	// A base is stored in its neutral form, so its first conjugate is the
	// protonated acid at step 0 rather than the first deprotonation.
	const offset: number = entry["conjOffset"] ?? (entry["base"] ? 0 : 1);
	const aliases = list[step - offset];
	return Array.isArray(aliases) ? aliases : aliases ? [aliases] : [];
}

const waterIonStructures = new Map<number, Molecule>();
function waterIonStructure(charge: number): Molecule {
	let structure = waterIonStructures.get(charge);
	if (!structure) {
		structure = StructureManager.newMolecule();
		const oxygen = structure.addAtom("oxygen", "O", charge);
		for (let i = 0; i < 2 + charge; i++) {
			const hydrogen = structure.addAtom("hydrogen", "H");
			structure.addBond(oxygen._id, hydrogen._id, 1, 100, "covalent");
		}
		waterIonStructures.set(charge, structure);
	}
	return structure;
}

const subscript = (count: number) => count === 1 ? "" : String(count).replace(/\d/g, (digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)]);
const superscript = (charge: number) => charge === 0 ? "" :
	(Math.abs(charge) === 1 ? "" : String(Math.abs(charge)).replace(/\d/g, (digit) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)])) +
	(charge < 0 ? "⁻" : "⁺");

/**
 * A static class used to access all chemical simulations
 *
 * @export
 * @abstract
 * @class Simulation
 * @typedef {Simulation}
 */
export abstract class Simulation {
	/**
	 * The default volume for transfer of chemicals in litres (default: 1mL)
	 *
	 * @static
	 * @type {number}
	 */
	static _simStepSize: number = 0.001;
	/**
	 * The default time step used for simuations in seconds
	 *
	 * The step is also the interval at which a running experiment is solved,
	 * so the chemistry keeps its real-time speed: ten steps of 0.1 s book the
	 * same turnover as one step of 1 s, only with ten times the samples.
	 *
	 * @static
	 * @type {number}
	 */
	static _simTimeStep: number = 0.1;
	/**
	 * Faradays constant: The charge contained in one mole in C/mol
	 *
	 * @static
	 * @readonly
	 * @type {number}
	 */
	static readonly _faradayConst: number = 9.64853321233100184e4;
	/**
	 * Ideal gas constant in J/mol*K
	 *
	 * @static
	 * @readonly
	 * @type {number}
	 */
	static readonly _gasConst: number = 8.31446261815324;
	/** Element symbol to element name, built once for the metal deposits. */
	private static _elementNames: Map<string, string> | undefined;
	/** Neutral single-atom molecules by SMILES, built once and reused. */
	private static _metalMolecules: Map<string, Molecule> = new Map();

	/**
	 * Setter for {@link _simStepSize}
	 *
	 * @public
	 * @static
	 * @param {number} nValue
	 */
	public static setSimStepSize(nValue: number): void {
		this._simStepSize = nValue;
	}

	/**
	 * Setter for {@link _simTimeStep}
	 *
	 * @public
	 * @static
	 * @param {number} nValue
	 */
	public static setSimTimeStep(nValue: number): void {
		this._simTimeStep = nValue;
	}

	/**
	 * Simulation of the solvation of molecules in aqueous solution, including neutralization of acids and bases
	 *
	 * @public
	 * @static
	 * @param {Mixture} cMixture - the solution to simulate
	 */
	public static sSolvation(cMixture: Mixture): void {
		if (!cMixture._isSolution || !(cMixture._solutionVolume > 0)) {
			return;
		}

		// Acids and bases are left intact as whole molecules; their conjugate
		// parts are only cached so {@link getpH} can classify them and identify
		// conjugate bases. Their actual equilibrium speciation is not tracked as
		// discrete ions but computed on demand from the charge balance.
		cMixture._activeMolecules.forEach((molecule) => {
			if (StructureManager.isAcidBase(molecule)) {
				this.cacheDissociation(molecule);
			}
		});

		// A dosed metal reacts with the cations of less noble elements before the
		// salt equilibria run, so the ions it releases take part in them.
		this.sRedoxSolution(cMixture);
		// The same metal surface reduces the protons of an acid to hydrogen.
		this.sMetalAcid(cMixture);

		// Salts still dissociate explicitly into their ions, which feed the
		// solubility model and the electrochemistry code. Iterate until the
		// dissolution has stabilised.
		let changed: boolean;
		do {
			changed = false;
			const salts = cMixture._activeMolecules.filter((molecule) => StructureManager.isSalt(molecule));
			for (const salt of salts) {
				const ions = this.saltFragments(salt);
				if (!ions) continue;
				if (this.registerSolidSalt(cMixture, salt, ions)) {
					changed = true;
					continue;
				}
				if (this.sDissolveSalt(cMixture, salt, ions)) {
					changed = true;
				}
			}
		} while (changed);
		this.settleSaltsAndHydroxides(cMixture);
		// Escaping gas removes solute and shifts the acid-base balance, so the
		// equilibria have to settle again after each pass.
		for (let pass = 0; pass < 4 && this.sGasEvolution(cMixture); pass++) {
			this.settleSaltsAndHydroxides(cMixture);
		}
	}

	/**
	 * Settles the salt and hydroxide equilibria together.
	 *
	 * Both consume the same cations and both move the pH, so one pass of each
	 * is not a fixed point: a salt that precipitates lowers the free cation and
	 * lets the hydroxide dissolve, and the other way round. CuSO₄ + Na₂CO₃
	 * needs this, because CuCO₃ and Cu(OH)₂ compete for the copper.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to equilibrate
	 */
	private static settleSaltsAndHydroxides(mix: Mixture): void {
		for (let pass = 0; pass < 64; pass++) {
			const chlorineMoved = this.equilibrateChlorineHydrolysis(mix);
			const saltsMoved = this.equilibrateSalts(mix);
			const hydroxidesMoved = this.equilibrateHydroxides(mix);
			if (!chlorineMoved && !saltsMoved && !hydroxidesMoved) break;
		}
	}

	private static makeSolidSalt(formula: string, ions: readonly Molecule[], counts: readonly number[]): Molecule {
		const solid = StructureManager.newMolecule();
		solid.name = solid.solidSaltFormula = formula;
		solid.solidSaltIons = ions;
		ions.forEach((ion, index) => {
			if (!ion) return;
			for (let unit = 0; unit < counts[index]; unit++) {
				const atoms = new Map(ion._atoms.map((atom) => [atom._id,
					solid.addAtom(atom.getName().toLowerCase(), atom.getSymbol(), atom.getIonicCharge())._id]));
				for (const bond of ion._bonds) {
					solid.addBond(atoms.get(bond._from._id), atoms.get(bond._to._id), bond._magnitude, bond._length, bond._type);
				}
			}
		});
		return solid;
	}

	/**
	 * Bulk volume in litres that one mole of a solid salt occupies. Used to
	 * release the dosed bulk volume when a solid dissolves and to reclaim it
	 * when ions precipitate, keeping {@link Mixture.addedVolume} consistent
	 * with the dissolved and settled amounts.
	 */
	private static bulkLitresPerMol(
		formula: string,
		ions: readonly Molecule[],
		counts: readonly number[]
	): number {
		const molarMass = ions.reduce((sum, ion, index) =>
			ion ? sum + ion.getTotMolMass() * counts[index] : sum, 0);
		const density = saltSolubility[formula]?.solidDensity ?? 2.2;
		return molarMass / (density * 1000);
	}

	/**
	 * Splits a salt molecule into the ions of one formula unit, so a 1:2 salt
	 * yields one cation and two anions. The counts feed the solubility product
	 * and the solid-salt registration, which both need the stoichiometry of the
	 * salt rather than a single ion pair.
	 *
	 * The ions are rebuilt from the atoms instead of going through
	 * {@link StructureManager.getMoleculePart}, which neutralises the pair it
	 * cuts apart and therefore cannot split a salt with more than one ionic
	 * bond without losing the ionic charges.
	 *
	 * @private
	 * @static
	 * @param {Molecule} molecule - the salt molecule to split
	 * @returns {SaltFragment[]} the distinct ions with their count per formula unit
	 */
	private static saltFragments(molecule: Molecule): SaltFragment[] | undefined {
		if (!molecule._bonds.some((bond) => bond._type === "ionic")) return undefined;
		const seen = new Set<number>();
		const fragments: SaltFragment[] = [];
		for (const start of molecule._atoms) {
			if (seen.has(start._id)) continue;
			// collect the atoms that covalent bonds hold together into one ion
			const members: Atom[] = [];
			const queue: Atom[] = [start];
			seen.add(start._id);
			while (queue.length) {
				const atom = queue.pop();
				members.push(atom);
				for (const bond of molecule._bonds) {
					if (bond._type === "ionic") continue;
					const next = bond._from === atom ? bond._to : bond._to === atom ? bond._from : undefined;
					if (!next || seen.has(next._id)) continue;
					seen.add(next._id);
					queue.push(next);
				}
			}
			const ion = StructureManager.newMolecule();
			const ids = new Map<number, number>();
			ion.batchStructureChanges(() => {
				for (const atom of members) {
					ids.set(atom._id, ion.addAtom(atom.getName().toLowerCase(), atom.getSymbol(), atom.getIonicCharge())._id);
				}
				for (const bond of molecule._bonds) {
					if (bond._type === "ionic") continue;
					if (!ids.has(bond._from._id) || !ids.has(bond._to._id)) continue;
					ion.addBond(ids.get(bond._from._id), ids.get(bond._to._id), bond._magnitude, bond._length, bond._type);
				}
			});
			const known = fragments.find(({ ion: other }) => other.smilesString === ion.smilesString);
			if (known) known.count += 1;
			else fragments.push({ ion, count: 1 });
		}
		return fragments;
	}

	private static registerSolidSalt(mix: Mixture, molecule: Molecule, ions: SaltFragment[]): boolean {
		const dissolved = ions.filter(({ ion }) => !StructureManager.isWater(ion));
		if (!dissolved.some(({ ion }) => ion._totalCharge > 0) ||
			!dissolved.some(({ ion }) => ion._totalCharge < 0)) return false;
		// Match the whole set of ions, not just the first cation and anion: a
		// two-ion row must never absorb a double salt and drop its second cation.
		const salt = saltEquilibria.find((entry) => entry.ions.length === dissolved.length &&
			entry.ions.every(({ smiles }) => dissolved.some(({ ion }) => ion.smilesString === smiles)));
		if (!salt) return false;
		const amount = mix._molProperties[molecule._id + "n"];
		mix.remMolecule(molecule._id);
		// The reservoir is the anhydrous salt of the solubility table. Water of
		// crystallisation of a dosed hydrate therefore joins the solvent, and the
		// dosed bulk volume gives way to the reservoir's own.
		const water = ions.find(({ ion }) => StructureManager.isWater(ion));
		if (water) mix.addMolecule(water.ion, amount * water.count);
		const parts = salt.ions.map(({ smiles, count }) => ({
			molecule: dissolved.find(({ ion }) => ion.smilesString === smiles).ion, count }));
		const formulaIons = parts.map(({ molecule: ion }) => ion);
		const counts = parts.map(({ count }) => count);
		if (molecule.solidBulkLitresPerMol !== undefined) {
			mix.addedVolume = Math.max(0, mix.addedVolume -
				molecule.solidBulkLitresPerMol * amount +
				this.bulkLitresPerMol(salt.formula, formulaIons, counts) * amount);
		}
		const existing = mix._activeMolecules.find((item) => item.solidSaltFormula === salt.formula);
		mix.addMolecule(existing ?? this.makeSolidSalt(salt.formula, formulaIons, counts), amount);
		return true;
	}

	/** Charge correction for protonation and hydrolysis coupled to complexation. */
	private static complexChargeHook(systems: AcidBaseFamily[]): ((H: number) => number) | undefined {
		const equilibrium = complexEquilibrium(systems);
		return equilibrium ? H => equilibrium(H).chargeCorrection : undefined;
	}

	/**
	 * Free-ion view of a solution for the salt equilibria. Stored ions are read
	 * directly. Conjugate anions of stored acids exist only as computed
	 * speciation, so they are exposed here as well; a change to one of them is
	 * booked against its analytical parent, which keeps the acid whole.
	 */
	private static saltIons(mix: Mixture, { systems, H, speciation } = this.solveAqueousEquilibrium(mix)): Map<string, SaltIon> {
		const volume = mix._solutionVolume;
		const ions = new Map<string, SaltIon>();
		const bound = speciation?.unbound;
		const stored = (molecule: Molecule): SaltIon => {
			const current = () => (mix._molProperties[molecule._id + "n"] ?? 0) / volume;
			// Ksp, conductivity and Nernst use the same unbound ion pool.
			const family = systems.find((item) => item.members.includes(molecule));
			const fraction = family ? this.speciesFraction(family, molecule, H) *
				((bound?.get(family) ?? family.totalC) / family.totalC) : 1;
			const free = () => family
				? family.members.reduce((sum, member) =>
					sum + (mix._molProperties[member._id + "n"] ?? 0), 0) / volume * fraction
				: current();
			return {
				molecule,
				get concentration() { return free(); },
				get activity() { return free(); },
				concentrationAt: (delta, state) => family
					? this.speciesFraction(family, molecule, state.H) *
						(state.unbound?.get(family.key) ?? family.totalC + delta)
					: current() + delta,
				family,
				get removable() { return current(); },
				change: (delta) => mix.changeMolecule(molecule._id, delta * volume),
				computed: false,
			};
		};
		for (const molecule of mix._activeMolecules) {
			if (!molecule._totalCharge || molecule.solidSaltFormula) continue;
			ions.set(molecule.smilesString, stored(molecule));
		}
		if (!systems.length) return ions;
		for (const family of systems) {
			const freeShare = (bound?.get(family) ?? family.totalC) / family.totalC;
			const fractions = AcidBase.speciesFractions(family, H).map(fraction => fraction * freeShare);
			const total = () => family.members.reduce((sum, member) =>
				sum + (mix._molProperties[member._id + "n"] ?? 0), 0) / volume;
			for (let step = 1; step < fractions.length; step++) {
				const molecule = this.familySpecies(family, step);
				if (!molecule || molecule._totalCharge >= 0) continue;
				// The table names an anion by the form its stock is stored with,
				// which can differ from the structure generated at this step. Any
				// name of this step that the table carries can key the ion.
				const key = [molecule.smilesString, ...conjugateAliases(family.key, step)]
					.find((name) => saltEquilibria.some(({ anion }) => anion === name));
				if (!key) continue;
				ions.set(key, {
					molecule,
					get concentration() { return total() * fractions[step]; },
					get activity() { return total() * fractions[step]; },
					concentrationAt: (delta, state) =>
						(AcidBase.speciesFractions(family, state.H)[step] ?? 0) *
						(state.unbound?.get(family.key) ?? family.totalC + delta),
					family,
					get removable() { return total(); },
					change: (delta) => this.changeFamily(mix, family, delta * volume),
					computed: true,
				});
			}
		}
		return ions;
	}

	/** Representative molecule for one protonation step of a family, if one can be built. */
	private static familySpecies(family: AcidBaseFamily, step: number): Molecule | undefined {
		if (!family.representative) return undefined;
		const explicit = explicitAcidState(family.key, step);
		if (explicit) return explicit;
		const charge = family.protonatedCharge - step;
		const stored = family.members.find((member) => member._totalCharge === charge);
		if (stored) return stored;
		const parts = this.cacheDissociation(family.representative);
		const part = parts?.find((item) => item && item !== family.representative &&
			item.smilesString !== "[H+]" && item._totalCharge === charge);
		return part ?? protonationStructure(family.representative, step - family.step);
	}

	/**
	 * Share of a family's analytical total that sits in one of its members.
	 *
	 * The step of a member follows from its own charge, not from the step of the
	 * family's representative: a stored chloride belongs to the HCl family whose
	 * representative is the neutral acid, but the chloride itself is the second
	 * step. Reading the representative's step would report the acid's share.
	 */
	private static speciesFraction(family: AcidBaseFamily, molecule: Molecule, H: number): number {
		const fractions = AcidBase.speciesFractions(family, H);
		const step = family.protonatedCharge - molecule._totalCharge;
		return fractions[Math.min(Math.max(step, 0), fractions.length - 1)] ?? 0;
	}

	/** Adds to or removes from a family's analytical total, keeping its members consistent. */
	private static changeFamily(mix: Mixture, family: AcidBaseFamily, amountMol: number): void {
		if (amountMol > 0) {
			mix.addMolecule(family.representative, amountMol);
			return;
		}
		let remaining = -amountMol;
		// Prefer the analytical acid over a stored conjugate ion, so a dosed
		// acid keeps its identity while its computed anion precipitates.
		const members = [...family.members].sort((a, b) =>
			Number(a._totalCharge !== 0) - Number(b._totalCharge !== 0));
		for (const member of members) {
			if (!(remaining > 0)) break;
			const available = mix._molProperties[member._id + "n"];
			if (!(available > 0)) continue;
			const take = Math.min(available, remaining);
			mix.changeMolecule(member._id, -take);
			remaining -= take;
		}
	}

	private static equilibrateSalts(mix: Mixture): boolean {
		const volume = mix._solutionVolume;
		const acidbaseData = StructureManager._moleculeData["acidbase"];
		// Acids stay whole, so their conjugate anions only exist as computed
		// speciation; {@link saltIons} exposes those too.
		if (!mix._activeMolecules.some((item) => item._totalCharge || item.solidSaltFormula ||
			acidbaseData[item.smilesString] !== undefined)) return false;
		const solids = new Map(mix._activeMolecules.filter((item) => item.solidSaltFormula)
			.map((item) => [item.solidSaltFormula, item]));
		let changed = false;
		const equilibrium = this.solveAqueousEquilibrium(mix);
		let ions = this.saltIons(mix, equilibrium);
		for (const { formula, ions: species, product } of otherSaltEquilibria) {
			// One entry per ion of the formula unit, in table order. A double
			// salt therefore moves both of its cations with the same amount.
			const parts = species.map(({ smiles, count }) => ({ ion: ions.get(smiles), count }));
			const counts = species.map(({ count }) => count);
			const solid = solids.get(formula);
			if (!solid && parts.some(({ ion }) => !ion)) continue;
			const current = saltIonProduct(parts.map(({ ion }) => ion ? ion.concentration : 0), counts);
			if (Math.abs(current - product) <= product * 1e-8) continue;
			// The free concentrations of a trial amount, with the acid-base and
			// complex equilibria re-solved for it. A salt that dissolves partly
			// hydrolysable ions only finds its product this way.
			const projection = this.saltProjection(parts, counts, equilibrium);
			const available = solid ? mix._molProperties[solid._id + "n"] / volume : 0;
			const removable = Math.min(...parts.map(({ ion, count }) =>
				ion ? ion.removable / count : Infinity));
			let low = current > product ? -removable : 0;
			let high = current > product ? 0 : available;
			if (!(low < high)) continue;
			let delta = high;
			if (projection(high) > product) {
				for (let step = 0; step < 52; step++) {
					const middle = (low + high) / 2;
					if (projection(middle) > product) high = middle;
					else low = middle;
				}
				delta = (low + high) / 2;
			}
			const amount = delta * volume;
			if (Math.abs(amount) <= 1e-14) continue;
			// The solid carries one structure per ion, so a species that the
			// solution has run out of still has a structure to deposit.
			const structures = parts.map(({ ion }, index) => ion?.molecule ?? solid?.solidSaltIons?.[index]);
			if (amount > 0) {
				parts.forEach(({ ion, count }, index) => {
					if (ion) ion.change(amount * count / volume);
					else if (structures[index]) mix.addMolecule(structures[index], amount * count);
				});
				mix.changeMolecule(solid._id, -amount);
				// A reservoir that came out within rounding is empty; a rest of a
				// few 10⁻¹⁷ mol is the subtraction's dust, not a wet residue.
				// {@link Mixture.changeMolecule} has already dropped a reservoir
				// that reached zero, so the property can be gone.
				const left = mix._molProperties[solid._id + "n"];
				if (left !== undefined && !(left > Math.max(amount, 0) * 1e-9)) mix.remMolecule(solid._id);
				if (!mix._molProperties[solid._id + "n"]) solids.delete(formula);
				// the dissolved bulk no longer occupies its solid volume
				mix.addedVolume = Math.max(0, mix.addedVolume -
					this.bulkLitresPerMol(formula, structures, counts) * amount);
			} else {
				parts.forEach(({ ion, count }) => ion.change(amount * count / volume));
				const deposit = solid ?? this.makeSolidSalt(formula, structures, counts);
				mix.addMolecule(deposit, -amount);
				solids.set(formula, deposit);
				// newly settled solid takes up its bulk volume again
				mix.addedVolume += this.bulkLitresPerMol(formula, structures, counts) * -amount;
			}
			changed = true;
			ions = this.saltIons(mix);
		}
		return changed;
	}

	/**
	 * Ion product of one salt as a function of how much of it dissolves.
	 *
	 * The free concentration of an ion is its share of the acid family's
	 * analytical total, and that share depends on the protons. Adding a
	 * hydrolysing anion therefore raises its own free concentration twice: once
	 * through the total and once through the proton balance it pulls along.
	 * Freezing the share at the current pH turns that into a straight line and
	 * makes a salt like iron(II) sulfide look saturated while it is not, so
	 * every trial amount re-solves the charge balance instead.
	 *
	 * The trial state is exactly the state {@link Mixture} reads after the
	 * same amount is applied: {@link changeFamily} moves the analytical total by
	 * the amount, and complex formation follows the new totals.
	 *
	 * @private
	 * @static
	 * @param parts - the ions of the formula unit with their counts
	 * @param counts - count of each ion per formula unit, in table order
	 * @param equilibrium - the aqueous equilibrium of the current solution
	 * @returns {(delta: number) => number} the ion product at that amount, in mol/L
	 */
	private static saltProjection(
		parts: ReadonlyArray<{ ion?: SaltIon; count: number }>,
		counts: readonly number[],
		equilibrium: { systems: AcidBaseFamily[]; spectatorCharge: number; H: number; Kw: number },
	): (delta: number) => number {
		const { systems, spectatorCharge, H, Kw } = equilibrium;
		const productAt = (state: SaltIonState, delta: number) => saltIonProduct(parts.map(({ ion, count }) =>
			ion ? ion.concentrationAt(delta * count, state) : 0), counts);
		return (delta) => {
			// A salt of spectator ions moves nothing but its own total, so the
			// current proton state still holds and the solve can be skipped.
			const shifts = new Map<AcidBaseFamily, number>();
			let spectator = spectatorCharge;
			for (const { ion, count } of parts) {
				if (!ion) continue;
				if (ion.family) shifts.set(ion.family, (shifts.get(ion.family) ?? 0) + delta * count);
				else spectator += delta * count * ion.molecule._totalCharge;
			}
			if (!shifts.size && spectator === spectatorCharge) return productAt({ H }, delta);
			const trial = shifts.size
				? systems.map((system) => shifts.has(system)
					? { ...system, totalC: Math.max(0, system.totalC + shifts.get(system)) }
					: system)
				: systems;
			const complexes = shifts.size ? complexEquilibrium(trial) : undefined;
			const protons = AcidBase.solveProton(trial, spectator, Kw,
				complexes ? (h) => complexes(h).chargeCorrection : undefined);
			const state: SaltIonState = { H: protons,
				unbound: complexes ? this.unboundPools(complexes(protons)) : undefined };
			return productAt(state, delta);
		};
	}

	/** Amounts the complexes leave of each acid family, keyed by the family key. */
	private static unboundPools(speciation?: { unbound: Map<AcidBaseFamily, number> }):
		Map<string, number> | undefined {
		return speciation
			? new Map([...speciation.unbound].map(([family, amount]) => [family.key, amount]))
			: undefined;
	}

	/**
	 * Hydroxide equilibria. The anion of a hydroxide is the water equilibrium's
	 * OH-, so the free cation and the pH determine each other and the generic
	 * salt loop cannot solve them. While the solid is present the cation is
	 * pinned by its solubility product, which makes its charge a function of
	 * [H+] alone; one charge-balance solve then gives the pH and the mass
	 * balance gives the amount of solid.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to equilibrate
	 * @returns {boolean} whether any hydroxide amount changed
	 */
	private static equilibrateHydroxides(mix: Mixture): boolean {
		const volume = mix._solutionVolume;
		if (!(volume > 0) || !hydroxideEquilibria.length) return false;
		const Kw = AcidBase.kwAt(mix._temperature);
		let changed = false;
		let composition = this.acidBaseComposition(mix);
		for (const { formula, cation, cations, anions, product } of hydroxideEquilibria) {
			const solid = mix._activeMolecules.find((item) => item.solidSaltFormula === formula);
			const { systems, spectatorCharge } = composition;
			let family = systems.find((item) => item.key === cation);
			if (!family && solid) {
				const representative = solid.solidSaltIons[0];
				const constants = StructureManager._moleculeData["acidbase"][cation]?.pks ?? [];
				family = { key: cation, representative, members: [], totalC: 0, step: 0,
					protonatedCharge: representative._totalCharge, pKa: Array.isArray(constants) ? constants : [constants] };
				systems.push(family);
			}
			if (!family) continue;
			const solidMol = solid ? mix._molProperties[solid._id + "n"] ?? 0 : 0;
			const dissolved = family.totalC;
			const total = dissolved + solidMol / volume;
			if (!(total > 0)) continue;

			// free cation concentration while the solid is present
			const freeAt = (H: number) => Math.pow(product * Math.pow(H / Kw, anions), 1 / cations);
			const equilibrium = complexEquilibrium(systems, { family, total, maxFree: freeAt });
			const H = AcidBase.solveProton(systems, spectatorCharge, Kw, H => equilibrium(H).chargeCorrection);
			const next = equilibrium(H).pinnedTotal;
			const nextSolid = (total - next) * volume;
			if (Math.abs(next - dissolved) <= total * 1e-9 &&
				Math.abs(nextSolid - solidMol) <= total * volume * 1e-9) continue;

			const bulk = this.bulkLitresPerMol(formula,
				[family.representative, hydroxideMolecule()], [cations, anions]);
			this.changeFamily(mix, family, (next - dissolved) * volume);
			if (nextSolid > 0) {
				if (solid) mix.changeMolecule(solid._id, nextSolid - solidMol);
				else mix.addMolecule(this.makeSolidSalt(formula,
					[family.representative, hydroxideMolecule()], [cations, anions]), nextSolid);
				mix.addedVolume += bulk * (nextSolid - solidMol);
			} else if (solid) {
				mix.changeMolecule(solid._id, -solidMol);
				mix.addedVolume = Math.max(0, mix.addedVolume - bulk * solidMol);
			}
			changed = true;
			composition = this.acidBaseComposition(mix);
		}
		return changed;
	}

	/** Read-only fraction of saturation for the modeled salt closest to its limit. */
	public static getSaltSaturation(mix: Mixture): { formula: string; fraction: number } | undefined {
		const volume = mix._solutionVolume;
		if (!mix._isSolution || !(volume > 0)) return;
		const ions = this.saltIons(mix);
		let closest: { formula: string; fraction: number } | undefined;
		for (const { formula, ions: species, product, ionCount } of saltEquilibria) {
			const concentrations = species.map(({ smiles }) => ions.get(smiles)?.concentration);
			if (concentrations.some((value) => !(value > 0))) continue;
			// Use a concentration-scale fraction: scaling all ion concentrations
			// by one half scales the gauge by one half, regardless of stoichiometry.
			const ratio = saltIonProduct(concentrations,
				species.map(({ count }) => count)) / product;
			const fraction = Math.min(1, ratio ** (1 / ionCount));
			if (!closest || fraction > closest.fraction) closest = { formula, fraction };
		}
		return closest;
	}

	/**
	 * Splits a molecule at its first ionic or acidbase bond into two conjugate
	 * parts and caches them in {@link StructureManager._moleculeParts}. Returns
	 * the cached parts, or undefined if the molecule has no such bond.
	 *
	 * @private
	 * @static
	 * @param {Molecule} cMolecule - the molecule to dissociate
	 * @returns {[Molecule, Molecule]}
	 */
	private static cacheDissociation(
		cMolecule: Molecule
	): [Molecule, Molecule] {
		if (
			StructureManager._moleculeParts[cMolecule.smilesString + "p1"] !=
				undefined &&
			StructureManager._moleculeParts[cMolecule.smilesString + "p2"] !=
				undefined
		) {
			return [
				StructureManager._moleculeParts[cMolecule.smilesString + "p1"],
				StructureManager._moleculeParts[cMolecule.smilesString + "p2"],
			];
		}

		for (let bond of cMolecule._bonds) {
			if (bond._type === "ionic" || bond._type === "acidbase") {
				let fromNCharge: number = 0;
				let toNCharge: number = 0;

				if (bond._type === "acidbase") {
					if (
						bond._from.getElectronNegativityPauling() >
						bond._to.getElectronNegativityPauling()
					) {
						fromNCharge = -1;
						toNCharge = 1;
					} else {
						fromNCharge = 1;
						toNCharge = -1;
					}
				}

				let pMolecule1: Molecule = StructureManager.getMoleculePart(
					bond._from._id,
					cMolecule,
					bond._id,
					fromNCharge
				);
				let pMolecule2: Molecule = StructureManager.getMoleculePart(
					bond._to._id,
					cMolecule,
					bond._id,
					toNCharge
				);

				StructureManager._moleculeParts[cMolecule.smilesString + "p1"] =
					pMolecule1;
				StructureManager._moleculeParts[cMolecule.smilesString + "p2"] =
					pMolecule2;
				return [pMolecule1, pMolecule2];
			}
		}

		return undefined;
	}

	/**
	 * Faraday's laws of electrolysis: converts a charge passed through an
	 * electrode into the amount of substance converted there and its mass.
	 * The 1st law (mass proportional to charge) follows from dividing by
	 * {@link _faradayConst}; the 2nd law (for equal charge, mass proportional
	 * to the equivalent weight M/z) follows from comparing the result across
	 * electrodes with different `electronCount`/`molarMass`.
	 *
	 * @public
	 * @static
	 * @param {number} chargeCoulombs - charge passed, Q = I*t, in coulombs
	 * @param {number} electronCount - electrons transferred per particle (z)
	 * @param {number} molarMass - molar mass of the converted substance in g/mol
	 * @returns {{electronMol: number, substanceMol: number, massGrams: number}}
	 */
	public static faradayLaw(
		chargeCoulombs: number,
		electronCount: number,
		molarMass: number
	): { electronMol: number; substanceMol: number; massGrams: number } {
		let electronMol: number = chargeCoulombs / this._faradayConst;
		let substanceMol: number = electronMol / electronCount;
		let massGrams: number = substanceMol * molarMass;
		return { electronMol, substanceMol, massGrams };
	}

	/**
	 * Builds the free-ion view of one vessel for the electrochemistry: the
	 * concentration of every dissolved species and the free proton
	 * concentration. It is built once per vessel and step because the salt-ion
	 * view solves the proton balance.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the vessel to read
	 * @returns {VesselView}
	 */
	private static vesselView(mix: Mixture): VesselView {
		const equilibrium = this.solveAqueousEquilibrium(mix);
		return { mix, ions: this.saltIons(mix, equilibrium), protons: equilibrium.H };
	}

	/**
	 * Activity of a gas in a vessel. A solution that holds the gas dissolved
	 * reads the fraction of its saturation concentration it actually carries,
	 * capped at {@link GAS_PARTIAL_PRESSURE}; a solution that holds none reads
	 * the standard state, because a gas-evolving electrode sits in contact
	 * with its own gas at that pressure and the model has no headspace to read
	 * a lower value from. The dissolved amount is what an electrode can reach,
	 * so a couple that has used it up falls below the standard state instead
	 * of drawing on gas that has already left the vessel.
	 *
	 * @private
	 * @static
	 * @param {string} gas - id in `evolvedGases`
	 * @param {Mixture} mix - the vessel
	 * @returns {number}
	 */
	private static gasActivity(gas: string, mix: Mixture): number {
		const dissolved = mix.dissolvedGas.get(gas) ?? 0;
		if (!(dissolved > 0)) return GAS_PARTIAL_PRESSURE;
		const solubility = evolvedGases[gas]?.solubility;
		if (!(solubility > 0) || !(mix._solutionVolume > 0)) return GAS_PARTIAL_PRESSURE;
		return Math.min(GAS_PARTIAL_PRESSURE, dissolved / (solubility * mix._solutionVolume));
	}

	/**
	 * Activity of one species of a half-reaction in a vessel. A solid is a pure
	 * phase; a gas or a separated halogen reads {@link gasActivity}, and a
	 * halogen that has already separated as a liquid or a solid is a pure
	 * phase of its own. Water is the solvent. Everything else is read from the
	 * free-ion view, so a computed conjugate anion counts as much as a stored
	 * one, and a hydrolysing cation counts with the share that is actually
	 * free rather than with its analytical total.
	 *
	 * @private
	 * @static
	 * @param {HalfReactionTerm} term - the species
	 * @param {VesselView} view - the vessel it sits in
	 * @returns {number}
	 */
	private static termActivity(term: HalfReactionTerm, view: VesselView): number {
		const gas = gasForSmiles(term.smiles);
		if (gas) {
			const id = Object.keys(evolvedGases).find((key) => evolvedGases[key] === gas);
			// A halogen that has separated as a liquid or a solid is a pure
			// phase of its own, so it reads 1 as soon as any of it is there.
			if (gas.phase !== "gas" && id && (view.mix.evolvedGas.get(id) ?? 0) > 0) return 1;
			return id ? this.gasActivity(id, view.mix) : GAS_PARTIAL_PRESSURE;
		}
		if (term.phase === "solid") return 1;
		if (term.phase === "gas" || term.phase === "liquid") return GAS_PARTIAL_PRESSURE;
		if (term.smiles === "[H+]") return view.protons;
		if (term.smiles === "O") return 1;
		const ion = view.ions.get(term.smiles);
		if (ion) return ion.activity;
		const stored = view.mix._activeMolecules.find((molecule) => molecule.smilesString === term.smiles);
		return stored ? (view.mix._molProperties[stored._id + "c"] ?? 0) : 0;
	}

	/**
	 * Nernst potential of a half-reaction in a vessel:
	 * `E = sep + RT/(zF) · Σ νᵢ ln aᵢ`.
	 *
	 * A species that is absent makes the logarithm singular, but it does not
	 * rule the couple out: the reaction can still run in the direction that
	 * produces it. The trace activity keeps the potential finite and puts it
	 * on the correct side of the standard value — a couple whose product is
	 * missing sits far above it and drives towards forming that product, a
	 * metal whose cation is missing far below it and drives towards
	 * dissolving. Which direction may actually run is decided by the educt
	 * check in {@link electrodeCandidates}, which reads the true zero.
	 *
	 * @private
	 * @static
	 * @param {HalfReaction} reaction - the half-reaction
	 * @param {VesselView} view - the vessel it sits in
	 * @returns {number}
	 */
	private static halfReactionPotential(reaction: HalfReaction, view: VesselView): number {
		let sum = 0;
		for (const term of reaction.terms) {
			const activity = this.termActivity(term, view);
			sum += term.coefficient * Math.log(activity > 0 ? activity : TRACE_ACTIVITY);
		}
		return reaction.sep + this._gasConst * view.mix._temperature /
			(reaction.el * this._faradayConst) * sum;
	}

	/**
	 * Neutral single-atom molecule for a SMILES such as `[Cu]`, built once and
	 * reused. A cathode deposits the metal of the ion it reduces, and that ion
	 * may exist only as computed speciation, so the deposit cannot always be
	 * derived from a stored molecule.
	 *
	 * @private
	 * @static
	 * @param {string} smiles - SMILES of the neutral element
	 * @returns {(Molecule | undefined)}
	 */
	private static metalMolecule(smiles: string): Molecule | undefined {
		const cached = this._metalMolecules.get(smiles);
		if (cached) return cached;
		const symbol = atomSymbol(smiles);
		if (!symbol) return undefined;
		const name = this.elementName(symbol);
		if (!name) return undefined;
		const molecule = StructureManager.newMolecule();
		molecule.addAtom(name, symbol);
		this._metalMolecules.set(smiles, molecule);
		return molecule;
	}

	/**
	 * English element name of a symbol, as the element table and the
	 * half-reaction table spell it. Built once and reused.
	 *
	 * @private
	 * @static
	 * @param {string} symbol - the element symbol
	 * @returns {(string | undefined)}
	 */
	private static elementName(symbol: string): string | undefined {
		if (!this._elementNames) {
			this._elementNames = new Map();
			for (const name of ElementData.getElementList()) {
				const data = ElementData.getData(name);
				if (data?.["symbol"]) this._elementNames.set(data["symbol"], name);
			}
		}
		return this._elementNames.get(symbol);
	}

	/**
	 * Single-atom ion for a SMILES such as `[Zn2+]`, built once and reused. A
	 * half-reaction that produces an ion the vessel does not hold yet has no
	 * stored molecule to book against, so the ion is built from its own
	 * SMILES; without it the reaction would run and leave no trace.
	 *
	 * @private
	 * @static
	 * @param {string} smiles - SMILES of the ion
	 * @returns {(Molecule | undefined)}
	 */
	private static ionMolecule(smiles: string): Molecule | undefined {
		const cached = this._metalMolecules.get(smiles);
		if (cached) return cached;
		const symbol = atomSymbol(smiles);
		const charge = /^\[[A-Z][a-z]?(\d*)([+-])\]$/.exec(smiles);
		if (!symbol || !charge) return undefined;
		const name = this.elementName(symbol);
		if (!name) return undefined;
		const magnitude = charge[1] ? Number(charge[1]) : 1;
		const molecule = StructureManager.newMolecule();
		molecule.addAtom(name, symbol, charge[2] === "-" ? -magnitude : magnitude);
		this._metalMolecules.set(smiles, molecule);
		return molecule;
	}

	/**
	 * Half-reactions an electrode can run in its vessel. A reaction is offered
	 * when at least one of its two sides is present; which direction it may
	 * actually run is decided by the mixed-potential solve, not here. A
	 * couple whose product is missing is therefore still offered, and the
	 * direction check below is what keeps it from running backwards.
	 *
	 * Each candidate also carries the largest current density its two
	 * directions can carry, taken from the concentration of the species they
	 * consume and a mass-transfer coefficient. The solve has to respect that:
	 * a couple whose gas has only just started to form can carry a few
	 * microamps, not the current of a full electrode. Without the bound the two
	 * gas couples of a water electrolysis cancelled each other at a potential
	 * where the current was set by the resistance alone, and the cell
	 * oscillated between that degenerate root and the real one. The bound is a
	 * transport limit, so it does not move with the integration step.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the electrode and its vessel
	 * @param {VesselView} view - the vessel it dips into
	 * @returns {HalfCandidate[]}
	 */
	private static electrodeCandidates(
		electrode: ElectricComponent,
		view: VesselView,
		displacement = false
	): HalfCandidate[] {
		const material = electrode._material;
		const top = electrode.plating;
		const candidatesFor = (surface: Molecule | undefined, amount: number, fraction = 1) =>
			this.surfaceCandidates(electrode, view, surface, amount, fraction, displacement);
		if (!top || top.molecule.smilesString === material?.smilesString) {
			return candidatesFor(material, this.bodyAmount(electrode) + (top?.mol ?? 0));
		}
		// The wired solver treats the top layer as the working surface. During
		// displacement, a growing deposit and exposed base metal share one potential.
		if (!displacement) return candidatesFor(top.molecule, top.mol);
		const wet = electrode._immersion?.span;
		const coated = top.span;
		let coatedArea = electrode.activeArea;
		let overlap = 1;
		if (wet && coated) {
			const wetLength = wet.bottom - wet.top;
			coatedArea *= (coated.bottom - coated.top) / wetLength;
			overlap = Math.max(0, Math.min(wet.bottom, coated.bottom) - Math.max(wet.top, coated.top)) / wetLength;
		}
		const coverage = overlap * Math.min(1, top.litres / (coatedArea * DISPLACEMENT_FILM_LITRES_PER_CM2));
		return [
			...candidatesFor(material, this.bodyAmount(electrode), 1 - coverage),
			...candidatesFor(top.molecule, top.mol, coverage),
		];
	}

	private static surfaceCandidates(electrode: ElectricComponent, view: VesselView, surface: Molecule | undefined,
		solidAmount: number, surfaceFraction: number, displacement: boolean): HalfCandidate[] {
		if (!(surfaceFraction > 0)) return [];
		const candidates: HalfCandidate[] = [];
		const volume = view.mix._solutionVolume;
		const surfaceName = materialName(surface);
		const surfaceSmiles = surface?.smilesString;
		/**
		 * Amount of a gas species the vessel can give up. Only the dissolved
		 * part is within reach of an electrode; a halogen that separated as a
		 * liquid or a solid is still there to be consumed, but a gas that has
		 * left the vessel is gone.
		 */
		const gasAmount = (reaction: HalfReaction): number => {
			if (!reaction.gas) return 0;
			const dissolved = view.mix.dissolvedGas.get(reaction.gas) ?? 0;
			const separated = evolvedGases[reaction.gas]?.phase === "gas"
				? 0
				: view.mix.evolvedGas.get(reaction.gas) ?? 0;
			return dissolved + separated;
		};
		const amountOf = (term: HalfReactionTerm, reaction: HalfReaction): number => {
			if (gasForSmiles(term.smiles)) return gasAmount(reaction);
			if (term.phase === "solid") return term.smiles === surfaceSmiles ? solidAmount : 0;
			if (term.smiles === "O") return Infinity;
			// Protons are not a stored species: an acid family releases more as
			// they are taken and water supplies them otherwise, so only the
			// current bounds how many a step may convert.
			if (term.smiles === "[H+]") return Infinity;
			// The bound is the analytical inventory, not the free-ion activity:
			// a hydrolysed cation can still be consumed down to its last trace,
			// because its hydrolysis equilibrium releases more as it is taken.
			const ion = view.ions.get(term.smiles);
			if (ion) return ion.concentration * volume;
			const stored = view.mix._activeMolecules.find((molecule) => molecule.smilesString === term.smiles);
			return stored ? (view.mix._molProperties[stored._id + "c"] ?? 0) * volume : 0;
		};
		// Concentration the transport limit reads. A solid body and the solvent
		// are reservoirs, and protons are replenished by their acid family, so
		// none of them limits the rate. A gas is limited by the part that is
		// still dissolved, which is its amount over the solution volume; a
		// separated halogen is a reservoir of its own.
		const transferConcentration = (term: HalfReactionTerm, reaction: HalfReaction): number => {
			if (gasForSmiles(term.smiles)) {
				const id = reaction.gas;
				if (!id) return 0;
				const separated = evolvedGases[id]?.phase === "gas"
					? 0
					: view.mix.evolvedGas.get(id) ?? 0;
				if (separated > 0) return Infinity;
				return (view.mix.dissolvedGas.get(id) ?? 0) / volume;
			}
			if (term.phase === "solid") return Infinity;
			if (term.smiles === "O" || term.smiles === "[H+]") return Infinity;
			return this.termActivity(term, view);
		};
		// `i = z F k c / ν` in A/cm², with the concentration in mol/cm³. The
		// slowest species of a direction sets the rate.
		const transferDensity = (term: HalfReactionTerm, reaction: HalfReaction, coefficient: number): number => {
			const concentration = transferConcentration(term, reaction) / 1000;
			return Number.isFinite(concentration)
				? reaction.el * this._faradayConst * MASS_TRANSFER_COEFFICIENT * concentration / coefficient
				: Infinity;
		};
		for (const reaction of halfReactionsOn(surfaceName)) {
			const metal = displacement && !reaction.gas
				? reaction.terms.find(term => term.phase === "solid" && atomSymbol(term.smiles)) : undefined;
			if (displacement && !metal) continue;
			// A passive film blocks the couple of the metal it covers, so the
			// strip behaves as an inert conductor and only the couples of the
			// solution run on it. The film is read from the pH the vessel
			// already has; solving it again here would cost a bisection per
			// candidate.
			if (isPassive(surfaceName, -Math.log10(view.protons)) &&
				reaction.terms.some((term) =>
					term.phase === "solid" && term.coefficient < 0 && term.smiles === surfaceSmiles)) continue;
			const equilibrium = this.halfReactionPotential(reaction, view);
			if (!Number.isFinite(equilibrium)) continue;
			let canOxidise = true;
			let canReduce = !metal || !reactsWithWater(atomSymbol(metal.smiles));
			let anodicLimit = Infinity;
			let cathodicLimit = Infinity;
			let anodicDensity = Infinity;
			let cathodicDensity = Infinity;
			for (const term of reaction.terms) {
				const amount = amountOf(term, reaction);
				if (term.coefficient < 0) {
					if (!(amount > 0)) canOxidise = false;
					else {
						anodicLimit = Math.min(anodicLimit, amount / -term.coefficient * reaction.el);
						anodicDensity = Math.min(anodicDensity, transferDensity(term, reaction, -term.coefficient));
					}
				} else {
					if (!(amount > 0)) canReduce = false;
					else {
						cathodicLimit = Math.min(cathodicLimit, amount / term.coefficient * reaction.el);
						cathodicDensity = Math.min(cathodicDensity, transferDensity(term, reaction, term.coefficient));
					}
				}
			}
			if (!canOxidise && !canReduce) continue;
			candidates.push({
				reaction,
				equilibrium,
				canOxidise,
				canReduce,
				anodicLimit,
				cathodicLimit,
				anodicDensity,
				cathodicDensity,
				surfaceFraction,
				apply: (electronMol) => this.applyHalfReaction(reaction, electronMol, electrode, view),
			});
		}
		return candidates;
	}

	/**
	 * Books the extent of one half-reaction on its vessel and electrode.
	 * `electronMol` is positive for oxidation. Protons and hydroxide are not
	 * stored species, so they are booked against the acid family that supplies
	 * them, or as excess charge when the vessel has none: that is what lets an
	 * electrolysis in a neutral salt solution close its charge balance.
	 *
	 * @private
	 * @static
	 * @param {HalfReaction} reaction - the half-reaction that ran
	 * @param {number} electronMol - electrons transferred, positive for oxidation
	 * @param {ElectricComponent} electrode - the electrode it ran on
	 * @param {VesselView} view - the vessel it ran in
	 */
	private static applyHalfReaction(
		reaction: HalfReaction,
		electronMol: number,
		electrode: ElectricComponent,
		view: VesselView
	): void {
		const mix = view.mix;
		const volume = mix._solutionVolume;
		const extent = electronMol / reaction.el;
		const material = electrode._material;
		// A metal that reduces water cannot be deposited from an aqueous
		// solution: the deposit is oxidised again as fast as it forms, so the
		// electrode only sees hydrogen evolution and hydroxide. The cation is
		// a catalyst and stays in solution. A strip of such a metal is not a
		// deposit and keeps its own couple.
		const waterReactive = extent < 0 && reaction.terms.some((term) =>
			term.phase === "solid" && term.coefficient < 0 &&
			reactsWithWater(atomSymbol(term.smiles)) &&
			!(material !== undefined && material.smilesString === term.smiles));
		for (const term of reaction.terms) {
			const delta = term.coefficient * extent;
			if (!(Math.abs(delta) > 0)) continue;
			if (waterReactive && term.phase === "solution") continue;
			// A halogen is a gas species whatever phase it separates in, so it
			// is booked before the solid branch can mistake it for a deposit.
			const gas = gasForSmiles(term.smiles);
			if (gas) {
				if (!reaction.gas) continue;
				if (delta > 0) {
					// The solution takes up to its saturation concentration and
					// only the rest separates, so a gas that is still dissolved
					// stays available to the electrode.
					mix.admitGas(reaction.gas, delta, gas.solubility);
					continue;
				}
				// Consumption reaches the dissolved part first. A halogen that
				// separated as a liquid or a solid is still in the vessel and
				// goes back into solution as it is used up; a gas that escaped
				// is gone.
				const wanted = -delta;
				const left = wanted - mix.takeGas(reaction.gas, wanted);
				if (left > 0 && gas.phase !== "gas") {
					mix.evolvedGas.set(reaction.gas,
						Math.max(0, (mix.evolvedGas.get(reaction.gas) ?? 0) - left));
				}
				continue;
			}
			if (term.phase === "solid") {
				if (waterReactive) {
					// The deposit is destroyed by the solvent as it forms,
					// `Na + H₂O → Na⁺ + OH⁻ + ½ H₂`, with the cation left in
					// solution by the skip above.
					mix.admitGas("H2", delta / 2, evolvedGases.H2.solubility);
					mix.excessCharge += delta;
					continue;
				}
				if (material !== undefined && material.smilesString === term.smiles) {
					if (delta < 0) {
						// The strip dissolves. Its own metal may sit on top of
						// it as a deposit, and that layer goes first; only what
						// is left over thins the body itself.
						const own = electrode.platings.find((item) =>
							item.molecule.smilesString === term.smiles);
						const fromLayer = own ? Math.min(own.mol, -delta) : 0;
						if (fromLayer > 0) electrode.unplate(own.molecule, fromLayer);
						const fromBody = -delta - fromLayer;
						if (fromBody > 0) {
							electrode._bodyMol = Math.max(0, this.bodyAmount(electrode) - fromBody);
						}
						mix.addedVolume = Math.max(0, mix.addedVolume +
							this.metalBulkLitresPerMol(material, reaction) * delta);
						continue;
					}
					// Its own cation is deposited on the strip, which builds
					// the body up again. It is booked as a layer so the coating
					// shows and so the next dissolution takes it first.
					electrode.plate(material, delta, this.metalBulkLitresPerMol(material, reaction));
					continue;
				}
				const plating = electrode.platings.find((item) => item.molecule.smilesString === term.smiles);
				if (delta < 0) {
					if (plating) electrode.unplate(plating.molecule, -delta);
					continue;
				}
				const metal = plating?.molecule ?? this.metalMolecule(term.smiles);
				if (!metal) continue;
				electrode.plate(metal, delta, this.metalBulkLitresPerMol(metal, reaction));
				continue;
			}
			if (term.smiles === "O") {
				// Water is the solvent, so a unit activity is right in the
				// Nernst equation but wrong for the inventory: an oxygen
				// evolution step really consumes it. Booking the term through
				// addMolecule keeps the solution volume and every
				// concentration in step with the smaller solvent amount.
				const water = mix._activeMolecules.find((molecule) => StructureManager.isWater(molecule));
				if (water) mix.addMolecule(water, delta);
				continue;
			}
			if (term.smiles === "[H+]") {
				// Protons are not stored as a molecule. The vessel keeps them as
				// excess charge, which the charge balance turns into a pH and
				// into the protonation state of whatever acid families it holds.
				mix.excessCharge -= delta;
				continue;
			}
			const ion = view.ions.get(term.smiles);
			if (ion) {
				ion.change(delta / volume);
				// The charge of a stored ion stays in the vessel while the
				// electrons leave through the wire, so it is booked for the
				// salt bridge to compensate.
				mix.electrodeCharge += delta * ion.molecule._totalCharge;
				// A computed anion belongs to an acid family, and moving the
				// family also moves its protons. Only the anion was meant to
				// change, so the protons are put back: one per unit of the
				// anion's charge, because that is how many the parent acid
				// carries. A monoprotic halide needs one, a sulfate two.
				if (ion.computed && delta < 0) {
					mix.excessCharge += delta * Math.abs(ion.molecule._totalCharge);
				}
				continue;
			}
			const stored = mix._activeMolecules.find((molecule) => molecule.smilesString === term.smiles);
			if (stored) {
				mix.changeMolecule(stored._id, delta);
				mix.electrodeCharge += delta * stored._totalCharge;
				continue;
			}
			// A reaction that produces an ion the vessel does not hold yet has
			// nothing to book against, so the ion is built from its own SMILES
			// and the product really appears. Removing an absent species has
			// nothing to take and is skipped.
			if (!(delta > 0)) continue;
			const created = this.ionMolecule(term.smiles);
			if (!created) continue;
			mix.addMolecule(created, delta);
			mix.electrodeCharge += delta * created._totalCharge;
		}
	}

	/**
	 * Solves a strictly increasing function for a target value. Newton alone
	 * cannot do it: the Butler–Volmer currents are exponential, so a step from
	 * a poor start overshoots into the clamped region and the residual stops
	 * being finite. The root is therefore bracketed first by walking outward
	 * from the start, and the iteration falls back to bisection whenever a
	 * Newton step would leave the bracket.
	 *
	 * A residual of `±Infinity` is a statement about the side, not a failure:
	 * the caller reports it where the argument lies outside the range the
	 * function is defined on, and the function is non-decreasing, so the root
	 * is below a `+Infinity` and above a `-Infinity`. Treating it as a bracket
	 * edge lets the search close on the edge of the defined range, which is
	 * the largest value the model can really reach. Only `NaN` — a value that
	 * says nothing at all — ends the search.
	 *
	 * @private
	 * @static
	 * @param {(potential: number) => number} value - the increasing function
	 * @param {(potential: number) => number} slope - its derivative
	 * @param {number} target - the value to reach
	 * @param {number} start - potential to start from
	 * @returns {(number | undefined)} the potential, or undefined if no root was found
	 */
	private static solveMonotone(
		value: (potential: number) => number,
		slope: (potential: number) => number,
		target: number,
		start: number
	): number | undefined {
		const residual = (potential: number) => value(potential) - target;
		let low = start;
		let high = start;
		let fLow = residual(low);
		let fHigh = fLow;
		if (Number.isNaN(fLow)) return undefined;
		if (fLow === 0) return start;
		let distance = 0.05;
		for (let step = 0; step < 40; step++) {
			if (fLow > 0) {
				low = start - distance;
				fLow = residual(low);
				if (Number.isNaN(fLow)) return undefined;
				if (fLow < 0) break;
			} else {
				high = start + distance;
				fHigh = residual(high);
				if (Number.isNaN(fHigh)) return undefined;
				if (fHigh > 0) break;
			}
			distance *= 2;
		}
		if (!(fLow <= 0 && fHigh >= 0)) return undefined;
		let potential = Math.max(low, Math.min(high, start));
		for (let step = 0; step < 100; step++) {
			const current = residual(potential);
			if (Number.isNaN(current)) return undefined;
			if (current === 0) return potential;
			if (current < 0) low = potential;
			else high = potential;
			const derivative = slope(potential);
			let next = Number.isFinite(derivative) && derivative > 0
				? potential - current / derivative
				: NaN;
			if (!(next > low && next < high)) next = (low + high) / 2;
			if (Math.abs(next - potential) < 1e-12) return next;
			potential = next;
		}
		return potential;
	}

	/**
	 * Current density one candidate carries at a given potential. A candidate
	 * that lacks the educt for one direction is held to the other: a couple
	 * with no reduced form can only take electrons, one with no oxidised form
	 * can only give them. Clamping keeps the sum monotone, which is what makes
	 * the root unique, and it replaces the earlier active-set refinement that
	 * could empty the set when every candidate ran the wrong way.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate} candidate - the half-reaction
	 * @param {number} potential - electrode potential in V
	 * @returns {number} current density in A/cm²
	 */
	private static candidateCurrent(candidate: HalfCandidate, potential: number): number {
		const density = candidate.stiffness !== undefined
			? candidate.stiffness * (potential - candidate.equilibrium)
			: currentDensity(candidate.reaction, potential - candidate.equilibrium);
		const bounded = Math.max(-candidate.cathodicDensity,
			Math.min(candidate.anodicDensity, density)) * (candidate.surfaceFraction ?? 1);
		if (!candidate.canOxidise) return Math.min(0, bounded);
		if (!candidate.canReduce) return Math.max(0, bounded);
		return bounded;
	}

	/** Slope of {@link candidateCurrent}, zero on the clamped side. */
	private static candidateSlope(candidate: HalfCandidate, potential: number): number {
		if (candidate.stiffness !== undefined) {
			// A stiff candidate is clamped by its own density limits too, and
			// the plateau it reaches there is flat like any other.
			const linear = candidate.stiffness * (potential - candidate.equilibrium);
			if (linear > candidate.anodicDensity || linear < -candidate.cathodicDensity) return 0;
			return candidate.stiffness;
		}
		const density = currentDensity(candidate.reaction, potential - candidate.equilibrium);
		if (!candidate.canOxidise && density > 0) return 0;
		if (!candidate.canReduce && density < 0) return 0;
		if (density > candidate.anodicDensity || density < -candidate.cathodicDensity) return 0;
		return currentDensitySlope(candidate.reaction, potential - candidate.equilibrium) * (candidate.surfaceFraction ?? 1);
	}

	/**
	 * Potential at which one electrode carries no net current: its mixed
	 * potential. The sum is non-decreasing in the potential, so the root is
	 * unique — unless the sum vanishes over a whole interval, which is what an
	 * ideally polarisable electrode does. Such an electrode has no potential of
	 * its own, and reporting the starting guess as one would put a noble metal
	 * in an acid at the mean of its couples instead of leaving it undefined.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} candidates - the electrode's half-reactions
	 * @param {number} [start] - potential to start from
	 * @returns {MixedPotential}
	 */
	private static mixedPotential(
		candidates: HalfCandidate[],
		start?: number
	): MixedPotential {
		const currents = candidates.map(() => 0);
		if (candidates.length === 0) return { potential: NaN, currents, guess: NaN };
		const total = (potential: number) => candidates.reduce((sum, candidate) =>
			sum + this.candidateCurrent(candidate, potential), 0);
		const slope = (potential: number) => candidates.reduce((sum, candidate) =>
			sum + this.candidateSlope(candidate, potential), 0);
		const guess = start ?? candidates.reduce((sum, candidate) =>
			sum + candidate.equilibrium, 0) / candidates.length;
		const potential = this.solveMonotone(total, slope, 0, guess);
		if (potential === undefined) return { potential: NaN, currents, guess };
		candidates.forEach((candidate, index) => {
			currents[index] = this.candidateCurrent(candidate, potential);
		});
		// An electrode whose couples all run one way only has no potential of
		// its own: the sum vanishes over a whole interval and the solve reports
		// one of its edges. It is defined only when a couple is reversible, or
		// when two one-way couples meet at a real mixed potential and both
		// carry current — a base metal corroding in water, for instance.
		const reversible = candidates.some((candidate) =>
			candidate.canOxidise && candidate.canReduce);
		const carrying = currents.some((current) => Math.abs(current) > PLATEAU_CURRENT);
		if (!reversible && !carrying) return { potential: NaN, currents, guess };
		return { potential, currents, guess };
	}

	/**
	 * The open-circuit potentials of a cell: the mixed potential each electrode
	 * settles at with no current flowing. The loop residual is continuous in
	 * the potential but jumps in the current at I = 0, so these two values are
	 * the one-sided limits that decide which way the cell runs. An electrode
	 * without a potential of its own leaves its limit undefined, and the cell
	 * solve then has to start from the guesses instead.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} first - first electrode's half-reactions
	 * @param {HalfCandidate[]} second - second electrode's half-reactions
	 * @returns {CellLimits}
	 */
	private static cellLimits(first: HalfCandidate[], second: HalfCandidate[]): CellLimits {
		const a = this.mixedPotential(first);
		const b = this.mixedPotential(second);
		return {
			openFirst: a.potential,
			openSecond: b.potential,
			guessFirst: a.guess,
			guessSecond: b.guess,
		};
	}

	/**
	 * Potential at which the active candidates of one electrode carry the given
	 * current density, with the current each of them carries. The total is
	 * strictly increasing in the potential, so the root is unique.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} candidates - the electrode's half-reactions
	 * @param {boolean[]} active - which of them take part
	 * @param {number} density - current density to carry, A/cm²
	 * @param {number} start - potential to start from
	 * @returns {({potential: number, slope: number, currents: number[]} | undefined)}
	 */
	private static electrodePotential(
		candidates: HalfCandidate[],
		density: number,
		start: number
	): { potential: number; slope: number; currents: number[] } | undefined {
		const currents = candidates.map(() => 0);
		if (candidates.length === 0) return undefined;
		const total = (potential: number) => candidates.reduce((sum, candidate) =>
			sum + this.candidateCurrent(candidate, potential), 0);
		const slope = (potential: number) => candidates.reduce((sum, candidate) =>
			sum + this.candidateSlope(candidate, potential), 0);
		const potential = this.solveMonotone(total, slope, density, start);
		if (potential === undefined) return undefined;
		candidates.forEach((candidate, index) => {
			currents[index] = this.candidateCurrent(candidate, potential);
		});
		return { potential, slope: slope(potential), currents };
	}

	/**
	 * Solves the loop for a given active set: both electrode potentials follow
	 * from the current they carry, and the loop equation closes on the source
	 * and the resistance.
	 *
	 * The residual is strictly increasing in the current, so it is solved as a
	 * one-dimensional monotone root. Starting from I = 0 does not work: there
	 * the Butler–Volmer branches are in their exponential region, the slope is
	 * essentially zero and Newton advances by only b/ln10 per step. The ohmic
	 * estimate −residual(0)/R is used instead, which is already within a few
	 * percent of the root for a cell with an external resistance.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} first - first electrode's half-reactions
	 * @param {HalfCandidate[]} second - second electrode's half-reactions
	 * @param {number} source - how much the source raises the first electrode above the second, in V
	 * @param {number} resistance - resistance of the whole loop in Ω
	 * @param {CellLimits} limits - the open-circuit potentials to start from
	 * @param {CellAreas} areas - the wetted area of both electrodes in cm²
	 * @param {number} [cap] - largest current the vessels can supply, in A
	 * @returns {(CellSolution | undefined)}
	 */
	private static solveCurrent(
		first: HalfCandidate[],
		second: HalfCandidate[],
		source: number,
		resistance: number,
		limits: CellLimits,
		areas: CellAreas,
		cap = Infinity
	): CellSolution | undefined {
		// Both the residual and its slope need the same pair of electrode
		// solves, so the last probe is kept and reused.
		let probedAt = NaN;
		let probedResidual = NaN;
		let probedSlope = NaN;
		let probedFirst: { potential: number; currents: number[] } | undefined;
		let probedSecond: { potential: number; currents: number[] } | undefined;
		// An electrode without a potential of its own has no open-circuit
		// value to start from, so the mean of its equilibria is used instead.
		const startFirst = Number.isFinite(limits.openFirst) ? limits.openFirst : limits.guessFirst;
		const startSecond = Number.isFinite(limits.openSecond) ? limits.openSecond : limits.guessSecond;
		const probe = (current: number) => {
			if (current === probedAt) return;
			probedAt = current;
			const p1 = this.electrodePotential(first, current / areas.first, startFirst);
			const p2 = this.electrodePotential(second, -current / areas.second, startSecond);
			probedFirst = p1;
			probedSecond = p2;
			if (p1 === undefined || p2 === undefined) {
				// A trial current outside what an electrode can carry has no
				// potential, and the residual is increasing in the current, so
				// the sign of the trial says which side of the root it lies
				// on. Reporting the side instead of NaN lets the bracket close
				// on the largest current the cell can really carry; zero is
				// always inside the range, so only a nonzero trial gets here.
				probedResidual = current === 0 ? NaN : Math.sign(current) * Infinity;
				probedSlope = NaN;
				return;
			}
			probedResidual = p1.potential - p2.potential - source + current * resistance;
			probedSlope = 1 / (areas.first * p1.slope) +
				1 / (areas.second * p2.slope) + resistance;
		};
		probe(0);
		const start = resistance > 0 && Number.isFinite(probedResidual)
			? -probedResidual / resistance : 0;
		const current = this.solveMonotone(
			(value) => { probe(value); return probedResidual; },
			(value) => { probe(value); return probedSlope; },
			0,
			start
		);
		if (current === undefined) return undefined;
		// A vessel that cannot supply the solved current holds the cell at the
		// current it can supply, so the electrodes sit at that current's
		// potentials instead of the ones the solve asked for.
		const held = Math.abs(current) > cap ? Math.sign(current) * cap : current;
		// The root can sit exactly on the edge of what an electrode can carry,
		// and the search lands on either side of that edge. A current just
		// outside it has no potential at all, so the last feasible current is
		// taken instead of reporting nothing.
		const settle = (value: number): number | undefined => {
			probe(value);
			if (probedFirst !== undefined && probedSecond !== undefined) return value;
			let inside = 0;
			let outside = value;
			for (let step = 0; step < 60; step++) {
				const middle = (inside + outside) / 2;
				probe(middle);
				if (probedFirst !== undefined && probedSecond !== undefined) inside = middle;
				else outside = middle;
				if (Math.abs(outside - inside) < 1e-15 * Math.max(1, Math.abs(value))) break;
			}
			probe(inside);
			return probedFirst !== undefined && probedSecond !== undefined ? inside : undefined;
		};
		const settled = settle(held);
		if (settled === undefined) return undefined;
		return {
			first: probedFirst.potential,
			second: probedSecond.potential,
			current: settled,
			firstCurrents: probedFirst.currents,
			secondCurrents: probedSecond.currents,
		};
	}

	/**
	 * Solves one cell. The unknowns are the two electrode potentials and the
	 * current; the source fixes the difference of the potentials and the
	 * resistance closes the loop:
	 *
	 *   I₁(E₁) = I,  I₂(E₂) = −I,  E₁ − E₂ − U + I·R = 0
	 *
	 * Below the decomposition voltage the system has no root, because the model
	 * has no double-layer capacitance: at I = 0 each electrode sits at the
	 * balance of two one-way reactions, while any nonzero current is set by the
	 * dominant one, so the residual jumps. The one-sided limits decide which
	 * side of that jump a root can lie on.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} first - first electrode's half-reactions
	 * @param {HalfCandidate[]} second - second electrode's half-reactions
	 * @param {number} source - how much the source raises the first electrode above the second, in V
	 * @param {number} resistance - resistance of the whole loop in Ω
	 * @param {boolean} ideal - a voltmeter draws no current
	 * @param {CellLimits} limits - the one-sided limits of the cell
	 * @param {CellAreas} areas - the wetted area of both electrodes in cm²
	 * @param {number} [cap] - largest current the vessels can supply, in A
	 * @returns {(CellSolution | undefined)}
	 */
	private static solveCell(
		first: HalfCandidate[],
		second: HalfCandidate[],
		source: number,
		resistance: number,
		ideal: boolean,
		limits: CellLimits,
		areas: CellAreas,
		cap = Infinity
	): CellSolution | undefined {
		const a = this.mixedPotential(first);
		const b = this.mixedPotential(second);
		const idle = (): CellSolution => ({
			first: a.potential, second: b.potential, current: 0,
			firstCurrents: a.currents, secondCurrents: b.currents,
		});
		if (ideal) {
			// A voltmeter reads the difference of the two mixed potentials, so
			// it reads nothing at all when one of them does not exist.
			if (!Number.isFinite(a.potential) || !Number.isFinite(b.potential)) return undefined;
			return idle();
		}
		const open = limits.openFirst - limits.openSecond;
		if (!Number.isFinite(open)) {
			// An ideally polarisable electrode cannot hold the cell at zero
			// current, so the one-sided limits say nothing. Two such electrodes
			// carry nothing without a source; with one, the source sets the
			// current and the solve starts from the guesses.
			if (!source && !Number.isFinite(a.potential) && !Number.isFinite(b.potential)) {
				return { first: a.guess, second: b.guess, current: 0,
					firstCurrents: a.currents, secondCurrents: b.currents };
			}
			return this.solveCurrent(first, second, source, resistance, limits, areas, cap);
		}
		// The residual E₁ − E₂ − U + I·R grows with I, so a root with I > 0
		// needs it negative at I = 0 and one with I < 0 needs it positive.
		const anodic = open - source < 0;
		const cathodic = open - source > 0;
		if (!anodic && !cathodic) {
			// No root: the source exactly cancels the cell voltage, so no
			// current flows and both electrodes stay at their mixed potential.
			if (!Number.isFinite(a.potential) || !Number.isFinite(b.potential)) return undefined;
			return idle();
		}
		return this.solveCurrent(first, second, source, resistance, limits, areas, cap);
	}

	/**
	 * Solves a cell whose source sets the current instead of the voltage. The
	 * current fixes the current density at both electrodes, so each of them
	 * sits at the potential that density needs; the loop equation then says
	 * which voltage the source has to apply to hold it:
	 *
	 *   U = E₁ − E₂ + I·R
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} first - first electrode's half-reactions
	 * @param {HalfCandidate[]} second - second electrode's half-reactions
	 * @param {number} current - the current to force, A; positive makes the first electrode the anode
	 * @param {number} resistance - resistance of the whole loop in Ω
	 * @param {CellLimits} limits - the open-circuit potentials to start from
	 * @param {CellAreas} areas - the wetted area of both electrodes in cm²
	 * @returns {({solution: CellSolution, voltage: number} | undefined)}
	 */
	private static solveGalvanostat(
		first: HalfCandidate[],
		second: HalfCandidate[],
		current: number,
		resistance: number,
		limits: CellLimits,
		areas: CellAreas
	): { solution: CellSolution; voltage: number } | undefined {
		const startFirst = Number.isFinite(limits.openFirst) ? limits.openFirst : limits.guessFirst;
		const startSecond = Number.isFinite(limits.openSecond) ? limits.openSecond : limits.guessSecond;
		const p1 = this.electrodePotential(first, current / areas.first, startFirst);
		const p2 = this.electrodePotential(second, -current / areas.second, startSecond);
		if (p1 === undefined || p2 === undefined) return undefined;
		return {
			solution: {
				first: p1.potential, second: p2.potential, current,
				firstCurrents: p1.currents, secondCurrents: p2.currents,
			},
			voltage: p1.potential - p2.potential + current * resistance,
		};
	}

	/**
	 * The EMF at which a residual that falls as the EMF rises vanishes.
	 *
	 * Every reading of a resistive network falls as the source's EMF rises, so
	 * the root is unique. The bracket is opened by doubling the distance from
	 * the start and then narrowed by false position with the Illinois
	 * modification, which keeps one side from stalling.
	 *
	 * @private
	 * @static
	 * @param {(emf: number) => (number | undefined)} residual - the value to zero, falling in `emf`
	 * @param {number} start - the EMF to probe first, in V
	 * @returns {(number | undefined)} the EMF that zeroes it, or undefined when it has no root
	 */
	private static matchSourceEmf(
		residual: (emf: number) => number | undefined,
		start: number
	): number | undefined {
		let low = start;
		let high = start;
		let fLow = residual(low);
		if (fLow === undefined || !Number.isFinite(fLow)) return undefined;
		if (fLow === 0) return start;
		let fHigh = fLow;
		let distance = 0.05;
		for (let step = 0; step < 40; step++) {
			if (fLow > 0) {
				high = start + distance;
				fHigh = residual(high);
				if (fHigh === undefined || !Number.isFinite(fHigh)) return undefined;
				if (fHigh < 0) break;
			} else {
				low = start - distance;
				fLow = residual(low);
				if (fLow === undefined || !Number.isFinite(fLow)) return undefined;
				if (fLow > 0) break;
			}
			distance *= 2;
		}
		if (!(fLow >= 0 && fHigh <= 0)) return undefined;
		let emf = Math.max(low, Math.min(high, start));
		let value = residual(emf);
		let side = 0;
		for (let step = 0; step < 60; step++) {
			if (value === undefined || !Number.isFinite(value)) return undefined;
			if (value === 0) return emf;
			if (value > 0) {
				low = emf;
				fLow = value;
				if (side > 0) fHigh /= 2;
				side = 1;
			} else {
				high = emf;
				fHigh = value;
				if (side < 0) fLow /= 2;
				side = -1;
			}
			const span = high - low;
			if (span < 1e-12) return (low + high) / 2;
			let next = fHigh === fLow ? NaN : low - fLow * span / (fHigh - fLow);
			if (!(next > low && next < high)) next = (low + high) / 2;
			if (Math.abs(next - emf) < 1e-12) return next;
			emf = next;
			value = residual(emf);
		}
		return emf;
	}

	/**
	 * The cell solve and the network on one terminal voltage.
	 *
	 * The supply's EMF goes into the network before the cell is solved, so the
	 * cell sees the voltage the network really presents at the supply's
	 * terminals, and the current the supply delivers is the current through its
	 * own branch — parallel loads included. A current setpoint and a current
	 * limit therefore regulate what the supply itself carries, not the cell
	 * current alone.
	 *
	 * The network is linear, so the supply's own reading is affine in its EMF
	 * and in the cell current. Three probes give the coefficients, and only the
	 * cell solve has to be repeated while the EMF is matched.
	 *
	 * @private
	 * @static
	 * @param {CircuitNetwork} network - the network between the electrodes
	 * @param {CircuitElement} element - the supply's own branch
	 * @param {ElectricComponent} source - the supply
	 * @param {HalfCandidate[]} first - first electrode's half-reactions
	 * @param {HalfCandidate[]} second - second electrode's half-reactions
	 * @param {number} electrolyte - resistance of the ionic path in Ω
	 * @param {CellLimits} limits - the open-circuit potentials to start from
	 * @param {CellAreas} areas - the wetted area of both electrodes in cm²
	 * @param {number} [cap] - largest current the vessels can supply, in A
	 * @returns {(CellSolution | undefined)}
	 */
	private static solveSupply(
		network: CircuitNetwork,
		element: CircuitElement,
		source: ElectricComponent,
		first: HalfCandidate[],
		second: HalfCandidate[],
		electrolyte: number,
		limits: CellLimits,
		areas: CellAreas,
		cap = Infinity
	): CellSolution | undefined {
		// The network's answer to the supply's EMF and to the cell current,
		// taken apart so that only the cell solve has to run for the EMF.
		const probe = (emf: number, current: number) => {
			element.emf = emf;
			return circuitReadings(network, {
				emf: 0, resistance: electrolyte, current, open: false,
			})?.get(source);
		};
		const rest = probe(0, 0);
		const byEmf = probe(1, 0);
		const byCell = probe(0, 1);
		if (!rest || !byEmf || !byCell) return undefined;
		const currentOf = (emf: number, cell: number) =>
			rest.current + (byEmf.current - rest.current) * emf + (byCell.current - rest.current) * cell;
		const voltageOf = (emf: number, cell: number) =>
			rest.voltage + (byEmf.voltage - rest.voltage) * emf + (byCell.voltage - rest.voltage) * cell;
		element.emf = 1;
		const thevenin = circuitThevenin(network);
		if (!thevenin) return undefined;
		// How the supply's EMF reaches the electrodes: positive when it raises
		// the first electrode, which is the one its plus pole reaches.
		const transfer = thevenin.voltage;
		const solveAt = (emf: number) => {
			// The element keeps the EMF the cell was solved against, so the
			// readings taken afterwards see the same network.
			element.emf = emf;
			const solution = this.solveCell(first, second, transfer * emf,
				thevenin.resistance + electrolyte, false, limits, areas, cap);
			if (!solution) return undefined;
			return {
				solution,
				current: currentOf(emf, solution.current),
				voltage: voltageOf(emf, solution.current),
			};
		};
		// The EMF that drives `wanted` through the cell, which is exact while
		// the supply is the only path and a good start once it is not.
		const startFor = (wanted: number) => {
			const driven = this.solveGalvanostat(first, second, wanted,
				thevenin.resistance + electrolyte, limits, areas);
			if (!driven) return 0;
			return Math.abs(transfer) > 1e-9 ? driven.voltage / transfer : driven.voltage;
		};
		const open = limits.openFirst - limits.openSecond;
		const openSign = Number.isFinite(open) && open >= 0 ? 1 : -1;
		// A positive transfer means the plus pole reaches the first electrode.
		const plusAtFirst = transfer >= 0;
		if (source._sourceMode === "current") {
			// A galvanostat fixes the current through itself; the cell then
			// decides the voltage, and the compliance limit caps what the
			// supply may hold at its terminals.
			// A vessel that cannot supply the setpoint holds the cell at the
			// current it can supply, as a supply in constant-current mode does
			// when its compliance runs out.
			const magnitude = Math.abs(source._sourceCurrent ?? 0);
			const wanted = source._polarity === 0 ? openSign * magnitude
				: (source._polarity > 0) === plusAtFirst ? magnitude : -magnitude;
			// The supply's own reading runs against the current it delivers,
			// so a setpoint that makes the first electrode the anode is a
			// negative reading.
			const target = -wanted;
			const compliance = Math.abs(source._complianceVoltage ?? 0);
			const emf = this.matchSourceEmf((probe) => {
				const point = solveAt(probe);
				return point ? point.current - target : undefined;
			}, startFor(wanted));
			const point = emf === undefined ? undefined : solveAt(emf);
			if (point && (!(compliance > 0) || Math.abs(point.voltage) <= compliance)) {
				return point.solution;
			}
			// Either the setpoint needs more voltage than the supply may hold,
			// or no EMF drives it through the cell at all — a vessel that
			// cannot carry that current. Both leave the supply at its
			// compliance limit, where the cell decides the current, so the
			// solve is retried there instead of giving up.
			if (!(compliance > 0)) return undefined;
			const sign = (point ? Math.sign(point.voltage) : Math.sign(target)) || 1;
			const capped = this.matchSourceEmf((probe) => {
				const next = solveAt(probe);
				return next ? sign * compliance - next.voltage : undefined;
			}, emf ?? startFor(wanted));
			if (capped === undefined) return undefined;
			const held = solveAt(capped);
			return held?.solution;
		}
		// A voltage source holds its setpoint at the terminals. Without a set
		// polarity the setpoint is the cell voltage it has to overcome, so the
		// EMF is scaled by how the network transfers it to the electrodes.
		const magnitude = Math.abs(source._sourceVoltage ?? 0);
		const emf = source._polarity === 0
			? (Math.abs(transfer) > 1e-9 ? openSign * magnitude / transfer : openSign * magnitude)
			: source._polarity < 0 ? -magnitude : magnitude;
		const point = solveAt(emf);
		if (!point) return undefined;
		const limit = Math.abs(source._sourceCurrent ?? 0);
		if (!(limit > 0) || Math.abs(point.current) <= limit) {
			return point.solution;
		}
		// Beyond the setpoint the supply drops into constant-current operation
		// and the voltage falls to what the load needs at that current.
		const target = Math.sign(point.current) * limit;
		const capped = this.matchSourceEmf((probe) => {
			const next = solveAt(probe);
			return next ? next.current - target : undefined;
		}, startFor(-target));
		if (capped === undefined) return undefined;
		const held = solveAt(capped);
		return held?.solution;
	}

	/**
	 * Electrons each half-reaction of one electrode converts over the step,
	 * clamped by what its own candidate can supply. Positive is oxidation.
	 *
	 * @private
	 * @static
	 * @param {ElectrodeBooking} booking - the electrode and its currents
	 * @returns {number[]} electrons per candidate, in mol
	 */
	private static bookingExtents(booking: ElectrodeBooking): number[] {
		return booking.candidates.map((candidate, index) => {
			const density = booking.currents[index];
			if (!(Math.abs(density) > 0)) return 0;
			const electronMol = density * booking.area * booking.dt / this._faradayConst;
			return Math.max(-candidate.cathodicLimit,
				Math.min(candidate.anodicLimit, electronMol));
		});
	}

	/**
	 * How much of one species a vessel still holds, in mol. A gas counts with
	 * what has left the solution, an ion with its analytical total — a
	 * hydrolysed or complexed cation releases more as it is taken, so the
	 * stored amount is what can really be consumed.
	 *
	 * @private
	 * @static
	 * @param {VesselView} view - the vessel
	 * @param {string} key - SMILES of the species, or the gas it is
	 * @param {boolean} gas - whether the key names an evolved gas
	 * @returns {number}
	 */
	private static vesselInventory(view: VesselView, key: string, gas: boolean): number {
		if (gas) {
			// Only the dissolved part is within reach of an electrode. A
			// halogen that separated as a liquid or a solid is still in the
			// vessel and counts; a gas that escaped is gone.
			const dissolved = view.mix.dissolvedGas.get(key) ?? 0;
			const separated = evolvedGases[key]?.phase === "gas"
				? 0
				: view.mix.evolvedGas.get(key) ?? 0;
			return dissolved + separated;
		}
		const ion = view.ions.get(key);
		if (ion) return ion.removable * view.mix._solutionVolume;
		const stored = view.mix._activeMolecules.find((molecule) => molecule.smilesString === key);
		return stored ? view.mix._molProperties[stored._id + "n"] ?? 0 : 0;
	}

	/**
	 * The factor by which each vessel's bookings have to shrink so that no
	 * species is spent twice.
	 *
	 * Two electrodes in one beaker draw on the same inventory, and so do two
	 * half-reactions of one electrode. The solve decides the currents before
	 * anything is booked, so it cannot know that the sum of the demands
	 * exceeds what the vessel holds. This compares the summed demand of every
	 * species with the inventory and returns the tightest ratio per vessel;
	 * the caller feeds it back as a current cap and books the scaled extents.
	 *
	 * @private
	 * @static
	 * @param {ElectrodeBooking[]} bookings - both electrodes
	 * @param {number[][]} extents - electrons per candidate, in mol
	 * @returns {Map<Mixture, number>} the factor per vessel, at most 1
	 */
	private static inventoryScale(
		bookings: ElectrodeBooking[],
		extents: number[][]
	): Map<Mixture, number> {
		const demand = new Map<Mixture, Map<string, { view: VesselView; gas: boolean; amount: number }>>();
		bookings.forEach((booking, index) => {
			const view = booking.view;
			if (!view) return;
			const perVessel = demand.get(view.mix) ?? new Map();
			demand.set(view.mix, perVessel);
			booking.candidates.forEach((candidate, position) => {
				const electronMol = extents[index]?.[position] ?? 0;
				if (!(Math.abs(electronMol) > 0)) return;
				const extent = electronMol / candidate.reaction.el;
				for (const term of candidate.reaction.terms) {
					// Only the side that is consumed draws on the inventory.
					if (Math.sign(term.coefficient) === Math.sign(extent)) continue;
					// A solid body and the solvent are reservoirs, and protons
					// are replenished by their acid family.
					if (term.phase === "solid") continue;
					if (term.smiles === "O" || term.smiles === "[H+]") continue;
					// A halogen is a gas species whatever phase it separates
					// in, so the phase alone does not tell them apart.
					const gas = !!gasForSmiles(term.smiles);
					const key = gas ? candidate.reaction.gas : term.smiles;
					if (!key) continue;
					const entry = perVessel.get(key) ?? { view, gas, amount: 0 };
					entry.amount += Math.abs(extent * term.coefficient);
					perVessel.set(key, entry);
				}
			});
		});
		const scales = new Map<Mixture, number>();
		for (const [mix, perVessel] of demand) {
			let scale = 1;
			for (const [key, entry] of perVessel) {
				if (!(entry.amount > 0)) continue;
				scale = Math.min(scale, this.vesselInventory(entry.view, key, entry.gas) / entry.amount);
			}
			scales.set(mix, Math.max(0, scale));
		}
		return scales;
	}

	/**
	 * Books the extents of both electrodes, scaled so that a shared vessel is
	 * not overdrawn.
	 *
	 * @private
	 * @static
	 * @param {ElectrodeBooking[]} bookings - both electrodes
	 * @param {number[][]} extents - electrons per candidate, in mol
	 * @param {Map<Mixture, number>} scales - the factor per vessel
	 */
	private static applyExtents(
		bookings: ElectrodeBooking[],
		extents: number[][],
		scales: Map<Mixture, number>
	): void {
		bookings.forEach((booking, index) => {
			const scale = booking.view ? scales.get(booking.view.mix) ?? 1 : 1;
			booking.candidates.forEach((candidate, position) => {
				const electronMol = (extents[index]?.[position] ?? 0) * scale;
				if (!(Math.abs(electronMol) > 0)) return;
				candidate.apply(electronMol);
			});
		});
	}

	/**
	 * The single candidate of a reference electrode. It is not a reaction: it
	 * holds the potential it is built for and is never consumed. It is also
	 * not a current path — a reference senses a potential through its ionic
	 * contact and carries a negligible current — so its extent is capped at
	 * {@link REFERENCE_CURRENT_DENSITY} instead of being unlimited. That is
	 * what keeps a driven cell from closing its loop through the reference and
	 * running a reaction at the other electrode with no counterreaction.
	 *
	 * @private
	 * @static
	 * @param {number} potential - the fixed potential in V against the SHE
	 * @returns {HalfCandidate[]}
	 */
	private static referenceCandidates(potential: number): HalfCandidate[] {
		const reaction: HalfReaction = {
			id: `reference@${potential}`,
			terms: [],
			el: 1,
			sep: potential,
			etaRef: 0,
			b: 0.06,
			materials: [],
		};
		return [{
			reaction,
			equilibrium: potential,
			canOxidise: true,
			canReduce: true,
			anodicLimit: Infinity,
			cathodicLimit: Infinity,
			anodicDensity: REFERENCE_CURRENT_DENSITY,
			cathodicDensity: REFERENCE_CURRENT_DENSITY,
			stiffness: REFERENCE_STIFFNESS,
			apply: () => undefined,
		}];
	}

	/**
	 * The ionic current closes the charge balance of a vessel. A salt bridge
	 * carries it between two half-cells, and a shared electrolyte carries it
	 * on its own, so both cases end here. The model keeps the countercharge
	 * as a spectator charge rather than named ions.
	 *
	 * The electrode reactions book the charge they move twice: once as the
	 * change of the stored ions, which the charge balance already sees, and
	 * once as `electrodeCharge`, which only exists to be compensated here.
	 * Without this step a one-beaker cell counts the same charge twice, so
	 * removing chloride and producing hydroxide would both raise the
	 * alkalinity.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the vessel to neutralise
	 */
	private static balanceCharge(mix: Mixture): void {
		if (!mix._isSolution || !(mix._solutionVolume > 0)) return;
		mix.excessCharge -= mix.electrodeCharge;
		mix.electrodeCharge = 0;
	}

	/**
	 * Ionic resistance in Ω for the supported canvas setups. Infinity means
	 * zero ionic conductance.
	 *
	 * An electrode reaches the electrolyte through the vessel it dips into, so
	 * an electrode without a solution has no ionic contact at all. That holds
	 * for a reference electrode too: it senses a potential through the same
	 * contact, and a dry one is not part of the cell. A strip whose lower end
	 * hangs above the liquid surface is dry in the same sense, even though it
	 * sits inside the vessel.
	 *
	 * The resistance is not a constant: it follows the conductivity of the
	 * solution, the distance between the strips and the area of them the liquid
	 * covers. A salt bridge adds its own tube, which is the narrowest part of
	 * the path and therefore the one that limits the current.
	 */
	public static ionicResistance(
		first: ElectricComponent,
		second: ElectricComponent,
		bridge: boolean | ElectricComponent = false
	): number {
		return this.electrolyteResistance(first, second, bridge, mix => this.conductivity(this.vesselView(mix)));
	}

	private static electrolyteResistance(
		first: ElectricComponent, second: ElectricComponent, bridge: boolean | ElectricComponent,
		conductivityOf: (mix: Mixture) => number
	): number {
		const firstMix = first._connectedMix;
		const secondMix = second._connectedMix;
		if (!firstMix?._isSolution || !secondMix?._isSolution) return Infinity;
		if (!this.isWetted(first) || !this.isWetted(second)) return Infinity;
		if (firstMix !== secondMix) {
			if (!bridge) return Infinity;
			return this.bridgedResistance(first, second, conductivityOf, typeof bridge === "object" ? bridge : undefined);
		}
		return this.sharedResistance(first, second, conductivityOf);
	}

	/**
	 * Whether an electrode touches the liquid of its vessel. An electrode the
	 * canvas has not measured counts as wetted, so a probe or an authored
	 * layout without positions keeps working.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the strip to test
	 * @returns {boolean} true when the strip carries ionic contact
	 */
	private static isWetted(electrode: ElectricComponent): boolean {
		return electrode._immersion === undefined || electrode._immersion.area > 0;
	}

	/**
	 * Resistance of the path through one electrolyte, in Ω.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} first - one strip
	 * @param {ElectricComponent} second - the other strip
	 * @returns {number} the resistance in Ω
	 */
	private static sharedResistance(first: ElectricComponent, second: ElectricComponent, conductivityOf: (mix: Mixture) => number): number {
		const mix = first._connectedMix;
		if (!mix) return Infinity;
		const spacing = this.electrodeSpacing(first, second);
		const area = Math.min(first.activeArea, second.activeArea);
		return pathResistance(conductivityOf(mix), spacing, area);
	}

	/**
	 * Resistance of a cell whose two half-cells a salt bridge joins, in Ω.
	 *
	 * The current crosses both electrolytes and the bridge, so the three
	 * lengths add up. Each vessel contributes the stretch from its strip to the
	 * bridge leg that dips into it, and the bridge contributes its own tube.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} first - the strip of the first half-cell
	 * @param {ElectricComponent} second - the strip of the second half-cell
	 * @param {ElectricComponent} [bridge] - the bridge that joins the vessels
	 * @returns {number} the resistance in Ω
	 */
	private static bridgedResistance(
		first: ElectricComponent,
		second: ElectricComponent,
		conductivityOf: (mix: Mixture) => number,
		bridge?: ElectricComponent
	): number {
		const legs = bridge?._bridgeLegs;
		const leftFirst = bridge?._bridgeMixes[1] !== first._connectedMix;
		const firstLeg = legs?.[leftFirst ? 0 : 1];
		const secondLeg = legs?.[leftFirst ? 1 : 0];
		const firstX = first._immersion?.x;
		const secondX = second._immersion?.x;
		const firstLength = firstLeg === undefined || firstX === undefined ? DEFAULT_ELECTRODE_SPACING
			: Math.max(MIN_ELECTRODE_SPACING, Math.abs(firstX - firstLeg) / 10);
		const secondLength = secondLeg === undefined || secondX === undefined ? DEFAULT_ELECTRODE_SPACING
			: Math.max(MIN_ELECTRODE_SPACING, Math.abs(secondX - secondLeg) / 10);
		const span = firstLeg === undefined || secondLeg === undefined ? DEFAULT_ELECTRODE_SPACING * 2
			: Math.max(MIN_ELECTRODE_SPACING, Math.abs(secondLeg - firstLeg) / 10);
		const firstMix = first._connectedMix;
		const secondMix = second._connectedMix;
		if (!firstMix || !secondMix) return Infinity;
		return pathResistance(conductivityOf(firstMix), firstLength, first.activeArea) +
			bridgeResistance(span) +
			pathResistance(conductivityOf(secondMix), secondLength, second.activeArea);
	}

	/**
	 * Horizontal distance between two strips, in cm. The canvas measures it in
	 * mm; a layout the canvas has not measured falls back to a bench spacing.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} first - one strip
	 * @param {ElectricComponent} second - the other strip
	 * @returns {number} the distance in cm
	 */
	private static electrodeSpacing(first: ElectricComponent, second: ElectricComponent): number {
		const a = first._immersion?.x;
		const b = second._immersion?.x;
		if (a === undefined || b === undefined) return DEFAULT_ELECTRODE_SPACING;
		return Math.max(MIN_ELECTRODE_SPACING, Math.abs(a - b) / 10);
	}

	/**
	 * Conductivity of a vessel's electrolyte, in S/cm.
	 *
	 * The free ions of the salt equilibria carry the current, together with the
	 * protons and hydroxide ions of the water equilibrium. A vessel of pure
	 * water therefore conducts about a million times worse than one with a
	 * supporting electrolyte, which is what makes the difference between them
	 * visible in the cell current.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the vessel
	 * @returns {number} the conductivity in S/cm
	 */
	private static conductivity(view: VesselView): number {
		const { mix } = view;
		const ions: ConductingIon[] = [];
		for (const [smiles, ion] of view.ions) {
			ions.push({ smiles, concentration: ion.concentration, charge: ion.molecule._totalCharge });
		}
		const kw = AcidBase.kwAt(mix._temperature);
		ions.push({ smiles: "[H+]", concentration: view.protons, charge: 1 });
		ions.push({ smiles: "[OH-]", concentration: view.protons > 0 ? kw / view.protons : 0, charge: 1 });
		// The vessel keeps its temperature in kelvin, the conductivity table in
		// degrees Celsius.
		return solutionConductivity(ions, mix._temperature - 273.15);
	}

	/** An unwired metal surface can react while it is in contact with an electrolyte. */
	public static canDisplaceOn(electrode: ElectricComponent): boolean {
		const mix = electrode._connectedMix;
		return electrode._type === EComponentType.Electrode && electrode._reference === undefined &&
			!electrode._connections.some(terminal => terminal.length > 0) && this.isWetted(electrode) &&
			Number.isFinite(electrode.activeArea) && electrode.activeArea > 0 &&
			!!mix?._isSolution && mix._solutionVolume > 0;
	}

	/** Advances spontaneous metal deposition on a single strip at zero external current. */
	public static sSurfaceDisplacement(electrode: ElectricComponent): boolean {
		const dt = this._simTimeStep;
		if (!(Number.isFinite(dt) && dt > 0) || !this.canDisplaceOn(electrode)) return false;
		const mix = electrode._connectedMix;
		const view = this.vesselView(mix);
		const candidates = this.electrodeCandidates(electrode, view, true);
		const { potential, currents } = this.mixedPotential(candidates);
		if (!Number.isFinite(potential)) return false;

		const booking = { candidates, currents, dt, area: electrode.activeArea, view };
		const extents = this.bookingExtents(booking);
		const oxidised = extents.reduce((sum, extent) => sum + Math.max(0, extent), 0);
		const reduced = extents.reduce((sum, extent) => sum + Math.max(0, -extent), 0);
		const exchanged = Math.min(oxidised, reduced);
		if (!(exchanged > 1e-12)) return false;

		// Independent inventory caps can unbalance an otherwise open-circuit
		// solve. Lower the larger side before spending the shared solution inventory.
		const balanced = extents.map(extent => extent * exchanged / (extent > 0 ? oxidised : reduced));
		const scales = this.inventoryScale([booking], [balanced]);
		if (!(exchanged * (scales.get(mix) ?? 1) > 1e-12)) return false;
		this.applyExtents([booking], [balanced], scales);
		this.balanceCharge(mix);
		this.settleSaltsAndHydroxides(mix);
		return true;
	}

	/** Prepares a passive galvanic RC experiment and projects its current onto the meters. */
	public static prepareNoIonicPathTransient(
		first: ElectricComponent,
		second: ElectricComponent,
		devices: readonly ElectricComponent[],
		ionicResistance: number,
		{ capacitance, seriesResistance = 0, initialCharge = 0 }:
			{ capacitance: number; seriesResistance?: number; initialCharge?: number }
	): {
		model: NoIonicPathTransientModel;
		meterFactors: ReadonlyMap<ElectricComponent, { voltage: number; current: number }>;
		readMeters: (sample: NoIonicPathTransientSample) => void;
	} | undefined {
		const firstMix = first._connectedMix;
		const secondMix = second._connectedMix;
		if (ionicResistance !== Infinity || firstMix === secondMix ||
			!this.isWetted(first) || !this.isWetted(second) ||
			first._reference !== undefined || second._reference !== undefined ||
			!firstMix?._isSolution || !secondMix?._isSolution ||
			!(firstMix._solutionVolume > 0 && secondMix._solutionVolume > 0) ||
			!Number.isFinite(seriesResistance) || seriesResistance < 0 ||
			!ComponentManager.isConnected(first, second)) return undefined;
		const network = circuitNetwork([first, second, ...devices]);
		if (!network || network.elements.some(({ device }) => device?._type === EComponentType.Source)) return undefined;
		const external = circuitThevenin(network);
		if (!external || !(external.resistance > 0)) return undefined;
		// No inventory cap is needed to evaluate the initial mixed potentials.
		const a = this.mixedPotential(this.electrodeCandidates(first, this.vesselView(firstMix)));
		const b = this.mixedPotential(this.electrodeCandidates(second, this.vesselView(secondMix)));
		const emf = a.potential - b.potential;
		if (!Number.isFinite(emf)) return undefined;
		let model: NoIonicPathTransientModel;
		try {
			model = new NoIonicPathTransientModel({ emf, capacitance, initialCharge,
				resistance: external.resistance + seriesResistance });
		} catch (error) {
			if (error instanceof RangeError) return undefined;
			throw error;
		}
		// A passive network is linear. Solve once per topology at unit RC
		// current so the same signed factors can project live and past values.
		const meterFactors = circuitReadings(network, {
			emf: 0, resistance: 0, current: -1, open: false,
		}) ?? new Map<ElectricComponent, { voltage: number; current: number }>();
		return {
			model,
			meterFactors,
			readMeters: (sample) => {
				for (const device of devices) {
					const reading = meterFactors.get(device);
					device._visibleCurrent = reading ? reading.current * sample.current : null;
					// The RC model books no chemical turnover, so there is no
					// cell current to report.
					device._cellCurrent = null;
					if (device._type === EComponentType.Voltmeter ||
						(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
						// The sign is the lead orientation, as on a bench meter.
						device._visibleVoltage = reading ? reading.voltage * sample.current : null;
					}
				}
			},
		};
	}

	/**
	 * Simulation of a galvanic element or an electrolysis.
	 *
	 * Both electrodes are solved together: each sits at the mixed potential its
	 * own half-reactions give, the source fixes the difference between them and
	 * the resistance closes the loop. The current that follows decides how much
	 * each half-reaction converts in this step, so a vessel can carry as many
	 * species as it likes and several reactions can run side by side.
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} sElectrode1 - first electrode
	 * @param {ElectricComponent} sElectrode2 - second electrode
	 * @param {ElectricComponent[]} sDevices - the devices between them: a source, a voltmeter, an ammeter, or a source with an ammeter in series
	 * @param [options] - an explicit ionic resistance (Infinity for zero conductance), or legacy bridge flag
	 */
	public static sEChem(
		sElectrode1: ElectricComponent,
		sElectrode2: ElectricComponent,
		sDevices: ElectricComponent[],
		options: { bridge?: boolean | ElectricComponent; ionicResistance?: number } = {}
	): void {
		const mix1 = sElectrode1._connectedMix;
		const mix2 = sElectrode2._connectedMix;
		// Every electrode reaches the cell through the vessel it dips into, a
		// reference included: it senses the potential through that contact, so
		// a dry one is not part of the cell and cannot close a loop.
		const usable = (mix: Mixture | undefined) => !!mix?._isSolution;
		const unsolved = () => {
			for (const device of sDevices) {
				device._visibleCurrent = null;
				device._cellCurrent = null;
				if (device._type === EComponentType.Voltmeter ||
					device._type === EComponentType.Multimeter ||
					device._type === EComponentType.Source) {
					device._visibleVoltage = null;
				}
			}
		};
		if (!usable(mix1) || !usable(mix2) || !this.isWetted(sElectrode1) || !this.isWetted(sElectrode2)) {
			// The open cell cannot carry current. An independent load may
			// still be connected across the supply.
			return this.sCircuit(sDevices);
		}
		if (!ComponentManager.isConnected(sElectrode1, sElectrode2)) return unsolved();

		const source = sDevices.find((device) => device._type === EComponentType.Source);
		const referenceInPair = sElectrode1._reference !== undefined || sElectrode2._reference !== undefined;
		if (referenceInPair && (source || sDevices.some(device =>
			device._type === EComponentType.Ammeter ||
			(device._type === EComponentType.Multimeter && device._meterMode === "current")))) {
			// A reference in a two-electrode setup is only a voltage sensor.
			return this.sCircuit(sDevices);
		}
		// Views hold live ion handles and pre-step fractions. Reuse them only
		// during this solve, before reaction products are booked.
		const views = new Map<Mixture, VesselView>();
		const viewOf = (mix: Mixture) => {
			const cached = views.get(mix);
			if (cached) return cached;
			const view = this.vesselView(mix);
			views.set(mix, view);
			return view;
		};
		const electrolyte = options.ionicResistance ?? this.electrolyteResistance(
			sElectrode1, sElectrode2, options.bridge ?? false, mix => this.conductivity(viewOf(mix))
		);
		const separateBaths = !!mix1 && !!mix2 && mix1 !== mix2;
		if (electrolyte === Infinity) {
			// Leave the cell branch out. An independent load on the supply
			// can still carry current, but a passive voltmeter has no cell
			// voltage to read across the isolated electrolytes.
			this.sCircuit(sDevices);
			if (!source) {
				for (const device of sDevices) device._visibleVoltage = null;
			}
			return;
		}
		if (!Number.isFinite(electrolyte) || electrolyte < 0) return unsolved();

		const dt = this._simTimeStep;
		// The vessel views are read once: the solve probes them many times and
		// nothing is booked until it has settled.
		const view1 = mix1?._isSolution ? viewOf(mix1) : undefined;
		const view2 = mix2?._isSolution ? viewOf(mix2) : undefined;
		const candidatesOf = (electrode: ElectricComponent, view: VesselView | undefined) =>
			electrode._reference !== undefined
				? this.referenceCandidates(electrode._reference)
				: view ? this.electrodeCandidates(electrode, view) : [];
		const first = candidatesOf(sElectrode1, view1);
		const second = candidatesOf(sElectrode2, view2);
		if (first.length === 0 || second.length === 0) return unsolved();

		const areas: CellAreas = {
			first: sElectrode1.activeArea,
			second: sElectrode2.activeArea,
		};
		const limits = this.cellLimits(first, second);
		// The devices between the electrodes form a network, not a single
		// loop: a voltmeter may sit across the cell while the supply drives
		// it, or in series with it. Its Thevenin equivalent is what the cell
		// is solved against, so every meter is read where it actually is.
		const network = circuitNetwork([sElectrode1, sElectrode2, ...sDevices]);
		if (!network) return unsolved();
		const element = source ? network.elements.find((entry) => entry.device === source) : undefined;
		// Without a supply the circuit is either open (a voltmeter, which draws
		// no current) or shorted through the ammeter. Only a network that
		// really presents no path counts as open: a lead laid straight across
		// the electrodes lets the cell discharge even while a voltmeter hangs
		// on the same posts. The equivalent is read once, because the supply
		// path rewrites the network's EMF while it matches.
		const thevenin = source && element ? undefined : circuitThevenin(network);
		if (!source && !thevenin) return unsolved();
		const ideal = !!thevenin && thevenin.resistance > OPEN_CIRCUIT_RESISTANCE && sDevices.some((device) =>
			device._type === EComponentType.Voltmeter ||
			(device._type === EComponentType.Multimeter && device._meterMode === "voltage"));
		// A wire can bypass the voltmeter even when no current-mode device
		// is present. In that case the reference cannot serve as a half-cell.
		if (referenceInPair && !ideal) return this.sCircuit(sDevices);
		let solution: CellSolution | undefined;
		let extents: number[][] = [];
		let scales = new Map<Mixture, number>();
		// The solve decides the currents before anything is booked, so it
		// cannot know that two electrodes of one vessel would spend the same
		// inventory. The tightest ratio is fed back as a current cap and the
		// cell is solved again, which is what a shared electrolyte really does:
		// it holds the current at what the solution can supply.
		let cap = Infinity;
		for (let pass = 0; pass < 3; pass++) {
			if (source && element) {
				// The supply's EMF is part of the network, so the cell is solved
				// against the voltage the network really presents at the
				// supply's terminals, and the supply's own current is what gets
				// regulated.
				solution = this.solveSupply(network, element, source, first, second,
					electrolyte, limits, areas, cap);
			} else {
				solution = this.solveCell(first, second, thevenin.voltage,
					thevenin.resistance + electrolyte, ideal, limits, areas, cap);
			}
			if (!solution) return unsolved();
			const bookings: ElectrodeBooking[] = [
				{ candidates: first, currents: solution.firstCurrents, dt, area: areas.first, view: view1 },
				{ candidates: second, currents: solution.secondCurrents, dt, area: areas.second, view: view2 },
			];
			extents = bookings.map((booking) => this.bookingExtents(booking));
			scales = this.inventoryScale(bookings, extents);
			let tightest = 1;
			for (const scale of scales.values()) tightest = Math.min(tightest, scale);
			if (!(tightest < 1)) break;
			const next = Math.abs(solution.current) * tightest;
			if (!(next < Math.abs(solution.current))) break;
			cap = next;
		}
		if (!solution) return unsolved();
		const references = new Map<ElectricComponent, { electrode: ElectricComponent; offset: number } | null>();
		for (const device of sDevices) {
			if (device._reference === undefined) continue;
			const local = [sElectrode1, sElectrode2].filter(electrode =>
				electrode._connectedMix === device._connectedMix).sort((a, b) => {
				const distance = (electrode: ElectricComponent) =>
					Math.abs((device._immersion?.x ?? 0) - (electrode._immersion?.x ?? 0));
				return distance(a) - distance(b);
			})[0];
			const potential = local === sElectrode1 ? solution.first : solution.second;
			references.set(device, local && this.isWetted(device) ? { electrode: local, offset: device._reference - potential } : null);
		}
		const readings = circuitReadings(network, {
			emf: solution.first - solution.second,
			resistance: electrolyte,
			current: solution.current,
			open: ideal,
		}, references);

		for (const device of sDevices) {
			const reading = readings?.get(device);
			// A device whose lead hangs on one post only is not part of the
			// circuit, so it reads nothing instead of the cell's own values.
			// An open cell carries no external current either: the leakage a
			// voltmeter's input would draw is what the chemistry deliberately
			// leaves out, so the meter reports none rather than a current that
			// changes nothing.
			device._visibleCurrent = reading ? (ideal ? 0 : reading.current) : null;
			device._cellCurrent = solution.current;
			if (device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
				// The sign is the lead orientation, as on a bench meter: the
				// reading is positive while the first post sits above the
				// second one.
				device._visibleVoltage = reading ? reading.voltage : null;
			} else if (device._type === EComponentType.Source) {
				device._visibleVoltage = reading ? Math.abs(reading.voltage) : null;
			}
		}

		this.applyExtents([
			{ candidates: first, currents: solution.firstCurrents, dt, area: areas.first, view: view1 },
			{ candidates: second, currents: solution.secondCurrents, dt, area: areas.second, view: view2 },
		], extents, scales);
		// A shared electrolyte carries the ionic current itself, so the two
		// electrodes' bookings cancel in one vessel. Two half-cells need one
		// countercharge each.
		this.balanceCharge(mix1);
		if (separateBaths) this.balanceCharge(mix2);
		// The electrode reactions move ions and shift the pH, so the salt and
		// hydroxide equilibria they disturb have to settle again before the
		// next step reads the vessel. Without this a precipitate that the new
		// pH no longer supports stays in the beaker.
		this.settleSaltsAndHydroxides(mix1);
		if (separateBaths) this.settleSaltsAndHydroxides(mix2);
	}

	/**
	 * Cl₂(aq) + H₂O ⇌ HOCl + H⁺ + Cl⁻. Solve both directions with the
	 * current chloride and hypochlorite inventories and the coupled pH.
	 */
	private static equilibrateChlorineHydrolysis(mix: Mixture): boolean {
		const chlorine = mix.dissolvedGas.get("Cl2") ?? 0;
		const hypochlorite = mix.hypochlorite;
		const volume = mix._solutionVolume;
		if (!(volume > 0) || !(chlorine > 0 || hypochlorite > 0)) return false;

		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const chlorineFamily = systems.find(system => system.representative?.smilesString === "Cl" &&
			system.protonatedCharge === 0 && system.pKa.length === 1);
		const chloride = mix._activeMolecules.find(molecule => molecule.smilesString === "[Cl-]");
		const stored = chloride ? (mix._molProperties[chloride._id + "n"] ?? 0) / volume : 0;
		const aqueous = chlorine / volume;
		const initialHypochlorite = hypochlorite / volume;
		const trialHypochlorite = { totalC: initialHypochlorite, pKa: [HYPOCHLOROUS_PKA], protonatedCharge: 0 };
		const base = systems.filter(system => system.key !== "hypochlorite");
		const trial = [...base, trialHypochlorite];
		const Kw = AcidBase.kwAt(mix._temperature);
		const extraCharge = this.complexChargeHook(base);
		const residual = (extent: number): number => {
			trialHypochlorite.totalC = initialHypochlorite + extent;
			// Chloride created here is stored as free chloride, including in
			// concentrated HCl. The strong acid inventory stays whole.
			const H = AcidBase.solveProton(trial, spectatorCharge - extent, Kw, extraCharge);
			const acidChloride = chlorineFamily
				? Math.max(0, chlorineFamily.totalC - stored) * AcidBase.speciesFractions(chlorineFamily, H)[1] : 0;
			const HOCl = trialHypochlorite.totalC * AcidBase.speciesFractions(trialHypochlorite, H)[0];
			return HOCl * H * (stored + extent + acidChloride) - CHLORINE_HYDROLYSIS * (aqueous - extent);
		};
		let low = -Math.min(initialHypochlorite, stored);
		let high = aqueous;
		for (let i = 0; i < 48 && high - low > 1e-12; i++) {
			const mid = (low + high) / 2;
			if (residual(mid) > 0) high = mid;
			else low = mid;
		}
		const extent = (low + high) / 2 * volume;
		if (Math.abs(extent) <= 1e-12) return false;
		const ion = chloride ?? this.ionMolecule("[Cl-]");
		if (!ion) return false;
		const water = mix._activeMolecules.find(StructureManager.isWater);
		if (extent > 0) {
			mix.takeGas("Cl2", extent);
			mix.addMolecule(ion, extent);
		} else {
			mix.admitGas("Cl2", -extent, evolvedGases.Cl2.solubility);
			mix.changeMolecule(ion._id, extent);
		}
		mix.hypochlorite += extent;
		if (water) mix.changeMolecule(water._id, -extent);
		return true;
	}

	/**
	 * Simulation of a network that carries no cell: a supply wired straight
	 * into a meter, or a meter on its own.
	 *
	 * {@link sEChem} needs two electrodes, so a supply and a meter would
	 * otherwise read nothing at all. Here the supply is an EMF behind its
	 * output resistance and the meters are the loads it drives, which is what
	 * makes a voltmeter on a 2 V supply show 2 V.
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent[]} devices - the devices of the network
	 */
	public static sCircuit(devices: ElectricComponent[]): void {
		const network = circuitNetwork(devices);
		const source = devices.find((device) => device._type === EComponentType.Source);
		const readings = network ? this.driveNetwork(network, source) : undefined;
		for (const device of devices) {
			const reading = readings?.get(device);
			device._visibleCurrent = reading ? reading.current : null;
			// A network without a cell carries no cell current.
			device._cellCurrent = null;
			if (device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
				// The sign is the lead orientation, as on a bench meter.
				device._visibleVoltage = reading ? reading.voltage : null;
			} else if (device._type === EComponentType.Source) {
				// Without a cell the supply holds its own voltage, so the
				// terminal voltage is what it shows.
				device._visibleVoltage = reading ? Math.abs(reading.voltage) : null;
			}
		}
	}

	/**
	 * The readings of a network a supply drives on its own.
	 *
	 * The supply is an EMF behind its output resistance. A network of
	 * resistors is linear, so a supply that would deliver more than its
	 * current limit allows is brought to the limit by scaling its EMF: the
	 * current follows the EMF exactly, and the voltage then falls to what the
	 * load needs at that current.
	 *
	 * @private
	 * @static
	 * @param {CircuitNetwork} network - the network to drive
	 * @param {ElectricComponent} [source] - the supply, if the network has one
	 * @returns {(Map<ElectricComponent, CircuitReading> | undefined)} the reading of each device
	 */
	private static driveNetwork(
		network: CircuitNetwork,
		source?: ElectricComponent
	): Map<ElectricComponent, CircuitReading> | undefined {
		const element = source ? network.elements.find((entry) => entry.device === source) : undefined;
		if (!source || !element) return undefined;
		const magnitude = Math.abs(source._sourceVoltage ?? 0);
		const limit = Math.abs(source._sourceCurrent ?? 0);
		// The plus pole is the terminal the supply raises, so the EMF points
		// from the first terminal to the second unless the polarity says the
		// first one is the minus pole.
		const sign = source._polarity < 0 ? -1 : 1;
		if (source._sourceMode === "current") {
			// A galvanostat sets the current, so the EMF is only a probe: the
			// current follows it linearly, and the compliance voltage caps
			// what the supply may apply.
			element.emf = 1;
			const probe = circuitReadings(network);
			const drawn = probe?.get(source)?.current ?? 0;
			if (!(Math.abs(drawn) > 0)) return probe;
			const compliance = Math.abs(source._complianceVoltage ?? 0);
			const wanted = limit / Math.abs(drawn);
			element.emf = sign * (compliance > 0 ? Math.min(wanted, compliance) : wanted);
			return circuitReadings(network);
		}
		element.emf = sign * magnitude;
		const driven = circuitReadings(network);
		const drawn = driven?.get(source)?.current ?? 0;
		if (!(limit > 0) || Math.abs(drawn) <= limit) return driven;
		element.emf *= limit / Math.abs(drawn);
		return circuitReadings(network);
	}

	/**
	 * Metal displacement without a circuit: a dosed metal reduces the cation of
	 * a less noble element and goes into solution itself. {@link sEChem} drives
	 * the same couples through electrodes; on a bare metal surface the reaction
	 * runs directly, so Zn in CuSO₄ leaves Zn²⁺ and a copper deposit.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to react
	 * @returns {boolean} whether any amount changed
	 */
	private static sRedoxSolution(mix: Mixture): boolean {
		if (!mix._isSolution || !(mix._solutionVolume > 0)) return false;
		let changed = false;
		for (const metal of mix._activeMolecules) {
			if (!metal.dosedAsSolid) continue;
			const oxidation = oxidationOf(metal.smilesString);
			// only a metal that dissolves into a cation of its own
			if (!oxidation || !oxidation.terms.some((term) =>
				term.coefficient > 0 && term.phase === "solution")) continue;
			for (const ion of mix._activeMolecules) {
				if (ion === metal || !(ion._totalCharge > 0)) continue;
				const reduction = reductionOf(ion.smilesString);
				// only a cation that deposits as a solid metal
				if (!reduction || !reduction.terms.some((term) =>
					term.coefficient < 0 && term.phase === "solid")) continue;
				// The displacement runs while the couple of the ion sits above
				// the couple of the metal, at the concentrations the vessel
				// holds rather than at standard conditions.
				if (!(this.metalPotential(reduction, mix) > this.metalPotential(oxidation, mix))) continue;
				// The electrons must balance: z_metal * n_metal = z_ion * n_ion.
				// The limiting quantity is therefore an amount of electrons, and
				// each species' share of it is that amount divided by its own
				// electron count. Multiplying instead would let a monovalent ion
				// consume twice its own amount of a divalent metal.
				const electrons = Math.min(
					(mix._molProperties[metal._id + "n"] ?? 0) * oxidation.el,
					(mix._molProperties[ion._id + "n"] ?? 0) * reduction.el
				);
				if (!(electrons > 1e-12)) continue;
				const metalMol = electrons / oxidation.el;
				const ionMol = electrons / reduction.el;
				const oxidised = this.redoxProduct(metal, oxidation.el);
				const reduced = this.redoxProduct(ion, -reduction.el);
				reduced.dosedAsSolid = true;
				mix.changeMolecule(metal._id, -metalMol);
				mix.changeMolecule(ion._id, -ionMol);
				mix.addMolecule(oxidised, metalMol);
				mix.addMolecule(reduced, ionMol);
				// the dissolving metal frees its bulk volume, the deposit takes its own
				mix.addedVolume = Math.max(0, mix.addedVolume -
					this.metalBulkLitresPerMol(metal, oxidation) * metalMol +
					this.metalBulkLitresPerMol(reduced, reduction) * ionMol);
				changed = true;
			}
		}
		return changed;
	}

	/** Single-atom molecule of the same element at a charge shifted by `delta`. */
	private static redoxProduct(molecule: Molecule, delta: number): Molecule {
		const atom = molecule._atoms[0];
		const product = StructureManager.newMolecule();
		product.addAtom(atom.getName().toLowerCase(), atom.getSymbol(), molecule._totalCharge + delta);
		return product;
	}

	/** Bulk volume of one mole of a solid metal in litres. */
	private static metalBulkLitresPerMol(
		molecule: Molecule,
		{ density }: { density?: number }
	): number {
		return density > 0 ? molecule.getTotMolMass() / (density * 1000) : 0;
	}

	/**
	 * Amount of metal the strip of an electrode still holds, in mol. The strip
	 * is a finite piece of metal of {@link ELECTRODE_BODY_LITRES}, so its
	 * inventory follows from the molar mass and the density of its material
	 * and is counted down as the cell dissolves it. A material without a
	 * metal/metal-ion couple, and a reference electrode without a material,
	 * hold nothing and are not consumed.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the electrode
	 * @returns {number} the amount in mol
	 */
	private static bodyAmount(electrode: ElectricComponent): number {
		const material = electrode._material;
		if (material === undefined) return 0;
		if (electrode._bodyMol === null) {
			const couple = oxidationOf(material.smilesString);
			const litresPerMol = couple ? this.metalBulkLitresPerMol(material, couple) : 0;
			electrode._bodyMol = litresPerMol > 0 ? ELECTRODE_BODY_LITRES / litresPerMol : 0;
		}
		return electrode._bodyMol;
	}

	/**
	 * Nernst potential of a metal couple in a vessel, read from the stored
	 * species. A missing ion counts as a trace rather than as zero, because a
	 * reaction that produces it cannot be blocked by its own absence: a
	 * dissolving metal always leaves a trace of its own cation.
	 *
	 * The reactions without a circuit used to compare standard potentials,
	 * which ignores the concentrations the vessel actually holds. Reading the
	 * Nernst potential instead makes a displacement stop when the two couples
	 * meet, and lets a metal dissolve in acid only while the couple is below
	 * the hydrogen couple at the solution's own pH.
	 *
	 * @private
	 * @static
	 * @param {HalfReaction} reaction - the metal couple
	 * @param {Mixture} mix - the vessel it sits in
	 * @returns {number} the potential in V
	 */
	private static metalPotential(reaction: HalfReaction, mix: Mixture): number {
		let sum = 0;
		for (const term of reaction.terms) {
			if (term.phase !== "solution") continue;
			const stored = mix._activeMolecules.find((molecule) => molecule.smilesString === term.smiles);
			const concentration = stored ? (mix._molProperties[stored._id + "c"] ?? 0) : 0;
			sum += term.coefficient * Math.log(concentration > 0 ? concentration : TRACE_ACTIVITY);
		}
		return reaction.sep + this._gasConst * mix._temperature /
			(reaction.el * this._faradayConst) * sum;
	}

	/**
	 * A dosed metal reduces the protons of an acid to hydrogen. The reaction
	 * runs until the metal or the acid is spent, so the extent follows the
	 * titratable acidity of the solution rather than its free proton
	 * concentration alone: a weak acid keeps delivering protons as they are
	 * taken up, while a neutral or basic solution leaves the metal alone.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to react
	 * @returns {boolean} whether any amount changed
	 */
	private static sMetalAcid(mix: Mixture): boolean {
		if (!mix._isSolution || !(mix._solutionVolume > 0)) return false;
		const volume = mix._solutionVolume;
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const H = AcidBase.solveProton(systems, spectatorCharge, AcidBase.kwAt(mix._temperature),
			this.complexChargeHook(systems));
		// only an acidic solution attacks a metal
		if (!(H > 1e-7)) return false;
		// The metal dissolves while its couple sits below the hydrogen couple
		// at the solution's own pH, which is the Nernst form of the old
		// standard-potential test and follows the concentration of the metal's
		// own ion as it builds up.
		const hydrogen = this._gasConst * mix._temperature / this._faradayConst * Math.log(H);
		const metals = mix._activeMolecules.filter((molecule) => {
			if (!molecule.dosedAsSolid) return false;
			const couple = oxidationOf(molecule.smilesString);
			if (couple === undefined) return false;
			if (!couple.terms.some((term) => term.coefficient > 0 && term.phase === "solution")) return false;
			return this.metalPotential(couple, mix) < hydrogen;
		});
		if (metals.length === 0) return false;
		// Titratable acidity: the free protons plus the protons the acids still
		// hold above pH 7, which is what the metal can take up in total. Cation
		// acids such as Fe3+ hydrolyse instead of delivering protons, so only
		// neutral and anionic families count.
		const bound = (family: AcidBaseFamily, h: number) => AcidBase.speciesFractions(family, h)
			.reduce((sum, fraction, step) => sum + fraction * (family.pKa.length - step), 0);
		let capacity = (H - 1e-7) * volume;
		for (const family of systems) {
			if (!(family.totalC > 0) || family.pKa.length < 1) continue;
			if (family.protonatedCharge > 0 || !(family.pKa[0] < 7)) continue;
			capacity += family.totalC * Math.max(0, bound(family, H) - bound(family, 1e-7)) * volume;
		}
		let changed = false;
		for (const metal of metals) {
			const couple = oxidationOf(metal.smilesString);
			if (!couple) continue;
			const available = mix._molProperties[metal._id + "n"] ?? 0;
			const atoms = Math.min(available, capacity / couple.el);
			if (!(atoms > 1e-12)) continue;
			const protons = atoms * couple.el;
			mix.changeMolecule(metal._id, -atoms);
			mix.addMolecule(this.redoxProduct(metal, couple.el), atoms);
			mix.addedVolume = Math.max(0, mix.addedVolume -
				this.metalBulkLitresPerMol(metal, couple) * atoms);
			mix.evolveGas("H2", protons / 2);
			capacity -= protons;
			changed = true;
		}
		return changed;
	}

	/**
	 * Volatile solutes leave the open vessel once their dissolved
	 * concentration passes the saturation value at room temperature. The
	 * escaped amount is kept on the mixture so the vessel can show the gas.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to degas
	 * @returns {boolean} whether any amount changed
	 */
	private static sGasEvolution(mix: Mixture): boolean {
		if (!mix._isSolution || !(mix._solutionVolume > 0)) return false;
		const volume = mix._solutionVolume;
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const H = AcidBase.solveProton(systems, spectatorCharge, AcidBase.kwAt(mix._temperature),
			this.complexChargeHook(systems));
		let changed = false;
		for (const family of systems) {
			if (!(family.totalC > 0)) continue;
			const entry = Object.entries(evolvedGases)
				.find(([, gas]) => gas.family === family.key);
			if (!entry) continue;
			const [id, { solubility }] = entry;
			if (!(solubility > 0)) continue;
			// the neutral dissolved form is the one that leaves the solution
			const neutral = family.protonatedCharge;
			if (neutral < 0 || neutral > family.pKa.length) continue;
			const excess = family.totalC * AcidBase.speciesFractions(family, H)[neutral] - solubility;
			if (!(excess > 1e-9)) continue;
			const amount = Math.min(excess * volume, family.totalC * volume);
			if (!(amount > 1e-12)) continue;
			this.changeFamily(mix, family, -amount);
			mix.evolveGas(id, amount);
			changed = true;
		}
		return changed;
	}

	/**
	 * Dissoziation of salts: Returns true because salts dissoziate completely
	 *
	 * A salt without a tabulated solubility product dissolves up to the dosed
	 * amount. The sparingly soluble ones never reach this point: their solid
	 * reservoir is registered by `registerSolidSalt` and kept in equilibrium
	 * with the solution by `equilibrateSalts`.
	 *
	 * @private
	 * @static
	 * @param {Mixture} sMix - the current solution
	 * @param {Molecule} cMolecule - the undissoziated salt molecule
	 * @param {SaltFragment[]} ions - the ions of one formula unit with their counts
	 * @returns {boolean}
	 */
	private static sDissolveSalt(
		sMix: Mixture,
		cMolecule: Molecule,
		ions: SaltFragment[]
	): boolean {
		const amount: number = sMix._molProperties[cMolecule._id + "n"] ?? 0;
		if (!(amount > 0) || !(sMix._solutionVolume > 0)) return false;
		// Every fragment is booked, so the water of crystallisation of a hydrate
		// enters the solvent together with the ions.
		for (const { ion, count } of ions) sMix.addMolecule(ion, amount * count);
		sMix.changeMolecule(cMolecule._id, -amount);
		// release the bulk volume of the dissolved portion, keeping the dosed
		// solid volume consistent with what actually stays solid
		const dissolved = ions.filter(({ ion }) => !StructureManager.isWater(ion));
		const entry = saltEquilibria.find((salt) => salt.ions.length === dissolved.length &&
			salt.ions.every(({ smiles }) => dissolved.some(({ ion }) => ion.smilesString === smiles)));
		const bulk = cMolecule.solidBulkLitresPerMol ?? (entry
			? this.bulkLitresPerMol(entry.formula,
				entry.ions.map(({ smiles }) => dissolved.find(({ ion }) => ion.smilesString === smiles).ion),
				entry.ions.map(({ count }) => count))
			: 0);
		if (bulk > 0) sMix.addedVolume = Math.max(0, sMix.addedVolume - bulk * amount);
		return amount > 1e-5;
	}

	/**
	 * Calculates and returns the pH value of a given solution
	 *
	 * @public
	 * @static
	 * @param {Mixture} sMix - the current solution
	 * @returns {number}
	 */
	public static getpH(sMix: Mixture): number {
		if (!sMix._isSolution || !(sMix._solutionVolume > 0)) return 7;
		const { systems, spectatorCharge } = this.acidBaseComposition(sMix);
		return Math.round(AcidBase.pH(systems, spectatorCharge, AcidBase.kwAt(sMix._temperature),
			this.complexChargeHook(systems)) * 1000) / 1000;
	}

	private static solveAqueousEquilibrium(mix: Mixture) {
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const Kw = AcidBase.kwAt(mix._temperature);
		const complexes = complexEquilibrium(systems);
		const H = AcidBase.solveProton(systems, spectatorCharge, Kw,
			complexes ? H => complexes(H).chargeCorrection : undefined);
		return { systems, spectatorCharge, H, Kw, speciation: complexes?.(H) };
	}

	/** Read-only equilibrium view of modeled polyprotic families; stored amounts remain analytical totals. */
	public static getPolyproticEquilibrium(sMix: Mixture): {
		pH: number; species: AcidEquilibriumSpecies[]; analyticalMolecules: Set<Molecule>;
	} {
		const { systems, Kw, H, speciation } = this.solveAqueousEquilibrium(sMix);
		const volume = sMix._solutionVolume;
		const species: AcidEquilibriumSpecies[] = [];
		const analyticalMolecules = new Set<Molecule>();
		for (const { metal, formation, concentration } of speciation?.complexes ?? []) {
			if (!(concentration > 0)) continue;
			species.push({ formula: formation.formula, charge: metal.protonatedCharge,
				concentration, amount: concentration * volume, structure: () => undefined });
		}
		for (const family of systems) {
			if (family.pKa.length < 1 || !(family.totalC > 0)) continue;
			// A family that exists only as numbers has no structure to draw.
			if (!family.representative) continue;
			const elements = new Map<string, number>();
			for (const section of family.representative._kekule_obj.calcFormula().getSections()) {
				const symbol = section.obj.getSymbol();
				elements.set(symbol, (elements.get(symbol) ?? 0) + section.count);
			}
			const protonatedHydrogens = (elements.get("H") ?? 0) + family.step;
			if (protonatedHydrogens < family.pKa.length) {
				// Aqueous metal families hydrolyse bound water, so the ligand H
				// atoms do not appear in the stored metal ion's formula.
				const metal = family.representative._atoms;
				if (metal.length !== 1 || family.protonatedCharge <= 0 || !elements.has(metal[0].getSymbol())) continue;
				const symbol = metal[0].getSymbol();
				family.members.forEach(molecule => analyticalMolecules.add(molecule));
				const unbound = speciation?.unbound.get(family) ?? family.totalC;
				AcidBase.speciesFractions(family, H).forEach((fraction, step) => {
					const concentration = unbound * fraction;
					const charge = family.protonatedCharge - step;
					const formula = symbol + (step > 0 ? "(OH)" + subscript(step) : "") + superscript(charge);
					species.push({ formula, charge, fraction: concentration / family.totalC,
						concentration, amount: concentration * volume,
						structure: () => step === 0 ? family.representative : undefined });
				});
				continue;
			}
			elements.delete("H");
			const symbols = [...elements.keys()].sort();
			if (elements.has("C")) symbols.splice(symbols.indexOf("C") + 1, 0, "H");
			else if (family.protonatedCharge > 0) symbols.push("H");
			else {
				const oxygen = symbols.indexOf("O");
				if (oxygen >= 0) symbols.push(...symbols.splice(oxygen, 1));
				symbols.unshift("H");
			}
			family.members.forEach((molecule) => analyticalMolecules.add(molecule));
			// Chemical-bond dissociation parts give species with a real SMILES
			// (e.g. [Cl-] from HCl), so cards can carry name and drawing even
			// when nothing was stored at that protonation state.
			const conjugates = this.cacheDissociation(family.representative);
			AcidBase.speciesFractions(family, H).forEach((fraction, step) => {
				const concentration = (speciation?.unbound.get(family) ?? family.totalC) * fraction;
				const charge = family.protonatedCharge - step;
				// A stored species of this protonation state (or its dissociation
				// part) keeps its name and drawn structure on the species card.
				const explicit = explicitAcidState(family.key, step);
				const molecule = explicit ?? family.members.find((item) => item._totalCharge === charge) ??
					conjugates?.find((item) => item && item !== family.representative &&
						item.smilesString !== "[H+]" && item._totalCharge === charge);
				const formula = family.key === "B(O)(O)O" ? (step === 1 ? "B(OH)₄⁻" : "B(OH)₃") : symbols.map((symbol) => {
					const count = symbol === "H" ? protonatedHydrogens - step : elements.get(symbol);
					return count > 0 ? symbol + subscript(count) : "";
				}).join("") + superscript(charge);
				species.push({ formula, charge, fraction: concentration / family.totalC, concentration, amount: concentration * volume,
					name: molecule?.name, structure: () => molecule ??
						protonationStructure(family.representative, step - family.step) });
			});
		}
		// Hydroxide bases stay whole and their cation never becomes a mixture
		// ion, because only its charge feeds the pH balance. Surface each
		// stored base's cation as a computed species beside the OH-, folding
		// an existing stored ion of the same identity into one card instead
		// of showing the cation twice.
		const cationCards = new Map<string, {
			charge: number; concentration: number; name?: string; structure: () => Molecule;
		}>();
		sMix._activeMolecules.forEach((molecule) => {
			const smiles = molecule.smilesString;
			if (analyticalMolecules.has(molecule) || molecule.solidSaltFormula ||
				smiles === "[OH-]" || smiles === "[H+]" || StructureManager.isWater(molecule)) return;
			const parts = this.cacheDissociation(molecule);
			if (!parts || !parts[0] || !parts[1]) return;
			const hydroxide = parts[0].smilesString === "[OH-]" ? parts[0] :
				parts[1].smilesString === "[OH-]" ? parts[1] : undefined;
			if (!hydroxide) return;
			const cation = hydroxide === parts[0] ? parts[1] : parts[0];
			const moles = sMix._molProperties[molecule._id + "n"];
			if (!Number.isFinite(moles) || moles <= 0) return;
			analyticalMolecules.add(molecule);
			let card = cationCards.get(cation.smilesString);
			if (!card) {
				const stored = sMix._activeMolecules.find((item) => item !== molecule &&
					!analyticalMolecules.has(item) && !item.solidSaltFormula &&
					item._totalCharge !== 0 && item.smilesString === cation.smilesString);
				const storedMoles = stored ? sMix._molProperties[stored._id + "n"] : NaN;
				if (stored) analyticalMolecules.add(stored);
				card = {
					charge: cation._totalCharge,
					concentration: Number.isFinite(storedMoles) ? storedMoles / volume : 0,
					name: stored?.name,
					structure: () => stored ?? cation,
				};
				cationCards.set(cation.smilesString, card);
			}
			card.concentration += moles / volume;
		});
		cationCards.forEach(({ charge, concentration, name, structure }) => {
			species.push({
				formula: ionFormula(structure()), charge, concentration, name,
				amount: concentration * volume,
				structure,
			});
		});
		// Water ions are listed for every solution: hydroxide bases only act
		// through spectator charge, so without them OH- would stay invisible.
		const OH = Kw / H;
		species.push({ formula: "H₃O⁺", charge: 1, concentration: H, amount: H * volume, structure: () => waterIonStructure(1) },
			{ formula: "OH⁻", charge: -1, concentration: OH, amount: OH * volume, structure: () => waterIonStructure(-1) });
		return { pH: Math.round(-Math.log10(H) * 1000) / 1000, species, analyticalMolecules };
	}

	private static acidBaseComposition(sMix: Mixture) {
		const systems: AcidBaseFamily[] = [];
		let spectatorCharge = 0;
		if (!sMix._isSolution || !(sMix._solutionVolume > 0)) return { systems, spectatorCharge };

		const acidbaseData: object = StructureManager._moleculeData["acidbase"];

		// data key (protonated-acid SMILES) -> index of its system in `systems`,
		// so every protonation state of one acid family lands in a single system
		const familyIndex: { [key: string]: number } = {};
		// conjugate-species SMILES -> the data key of the acid family it belongs
		// to, so a conjugate supplied on its own (buffer anion, or the anion of a
		// dissolving salt) is folded into that family instead of being treated as
		// an unrelated spectator ion
		const conjugateToFamily: Record<string, { key: string; step: number }> = {};

		const conc = (molecule: Molecule): number => {
			const c: number = sMix._molProperties[molecule._id + "c"];
			return c === undefined ? 0 : c;
		};

		// successive pKa values for a family; a bare number means monoprotic
		const pKaList = (entry: object): number[] => {
			const p = entry["pks"];
			return Array.isArray(p) ? p.slice() : [p === undefined ? 0 : p];
		};

		// creates (once) and returns the system for an acid family
		const familyFor = (
			key: string,
			protonatedCharge: number,
			representative: Molecule,
			step: number,
			constants?: number[],
		): AcidBaseFamily => {
			let idx: number = familyIndex[key];
			if (idx === undefined) {
				idx = systems.length;
				familyIndex[key] = idx;
				systems.push({
					key,
					totalC: 0,
					pKa: constants ?? pKaList(acidbaseData[key]),
					protonatedCharge,
					representative,
					step,
					members: [],
				});
			}
			return systems[idx];
		};

		// conjugate species declared in the data that may appear without their
		// parent acid (e.g. carbonate from a carbonate salt) — registered up
		// front so their hydrolysis is modelled even if the acid is absent
		for (const key in acidbaseData) {
			const entry: object = acidbaseData[key];
			const conjList = entry["conj"];
			if (Array.isArray(conjList)) {
				// A base is stored in its neutral form, so its first conjugate is
				// the protonated acid at step 0, not the first deprotonation.
				const offset: number = entry["conjOffset"] ?? (entry["base"] ? 0 : 1);
				for (const [index, aliases] of conjList.entries()) {
					for (const alias of Array.isArray(aliases) ? aliases : [aliases]) {
						conjugateToFamily[alias] = { key, step: index + offset };
					}
				}
			}
		}

		// pass 1: molecules that are themselves listed acids or bases
		sMix._activeMolecules.forEach((molecule) => {
			const smiles: string = molecule.smilesString;
			const key: string = acidbaseData[smiles]?.alias ?? smiles;
			const entry: object = acidbaseData[key];
			const custom = molecule.aqueousAcidBase;
			if (
				(entry === undefined && !custom) ||
				smiles === "[H+]" ||
				smiles === "[OH-]" ||
				StructureManager.isWater(molecule)
			) {
				return;
			}

			// ensure the conjugate parts are available even if getpH is called
			// before sSolvation had a chance to cache them
			const parts: [Molecule, Molecule] = this.cacheDissociation(molecule);

			// hydroxide base (e.g. NaOH): the metal cation is a spectator and the
			// released OH- is accounted for through the water equilibrium
			const isHydroxide: boolean =
				parts != undefined &&
				(parts[0].smilesString === "[OH-]" ||
					parts[1].smilesString === "[OH-]");
			if (isHydroxide) {
				const cation: Molecule =
					parts[0].smilesString === "[OH-]" ? parts[1] : parts[0];
				spectatorCharge +=
					(cation != undefined ? cation._totalCharge : 1) * conc(molecule);
				return;
			}

			// a molecular base (NH3) is stored as its neutral base form, so its
			// protonated form is `pKa.length` charges higher; a normal acid is
			// stored protonated and keeps its own charge
			const step: number = entry ? entry["step"] ?? (entry["base"] ? pKaList(entry).length : 0) : custom.step;
			const family = familyFor(key, molecule._totalCharge + step, molecule, step, entry ? undefined : custom.pKa);
			family.totalC += conc(molecule);
			family.members.push(molecule);

			if (!entry && custom) {
				for (let state = 0; state <= custom.pKa.length; state++) {
					const structure = protonationStructure(molecule, state - step);
					if (structure?.smilesString && structure !== molecule && !acidbaseData[structure.smilesString]) {
						conjugateToFamily[structure.smilesString] = { key, step: state };
					}
				}
			}

			// map the actual conjugate base so a buffer built from this acid plus
			// its conjugate salt folds into the same family
			if (step === 0 && parts != undefined) {
				const conjugate: Molecule =
					parts[0].smilesString === "[H+]" ? parts[1] : parts[0];
				if (conjugate != undefined && conjugate.smilesString != "") {
					conjugateToFamily[conjugate.smilesString] = { key, step: 1 };
				}
			}
		});

		// pass 2: free ions — conjugate bases/acids fold into their family
		// (creating it if the parent acid is absent, so hydrolysis is modelled),
		// everything else is a spectator ion
		sMix._activeMolecules.forEach((molecule) => {
			const smiles: string = molecule.smilesString;
			if (
				smiles === "[H+]" ||
				smiles === "[OH-]" ||
				StructureManager.isWater(molecule) ||
				(acidbaseData[smiles] != undefined || molecule.aqueousAcidBase)
			) {
				return;
			}

			const conjugate = conjugateToFamily[smiles];
			if (conjugate != undefined) {
				const family = systems[familyIndex[conjugate.key]] ??
					familyFor(conjugate.key, molecule._totalCharge + conjugate.step, molecule, conjugate.step);
				family.totalC += conc(molecule);
				family.members.push(molecule);
			} else if (molecule._totalCharge !== 0) {
				spectatorCharge += molecule._totalCharge * conc(molecule);
			}
		});

		// Charge the half-reactions have left behind without a stored
		// counter-ion, as after an electrolysis in a neutral salt solution.
		// It is kept as an amount, so it becomes a concentration here.
		if (sMix._solutionVolume > 0) {
			spectatorCharge += sMix.excessCharge / sMix._solutionVolume;
		}
		// Dissolved chlorine hydrolyses to hypochlorous acid, a weak acid of
		// its own. Neither HOCl nor ClO⁻ is a stored molecule, so the family
		// enters the balance as numbers; its chloride is a stored ion and is
		// already counted above.
		if (sMix._solutionVolume > 0 && sMix.hypochlorite > 0) {
			systems.push({
				key: "hypochlorite",
				totalC: sMix.hypochlorite / sMix._solutionVolume,
				pKa: [HYPOCHLOROUS_PKA],
				protonatedCharge: 0,
				step: 0,
				members: [],
			});
		}
		return { systems, spectatorCharge };
	}

}
