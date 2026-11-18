import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { Atom } from "./Atom";
import { ElementData } from "./ElementData";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";
import { saltSolubility } from "./saltSolubility";
import { complexFormation } from "./complexes";
import { evolvedGases } from "./gasEvolution";
import {
	HalfReaction,
	HalfReactionTerm,
	ELECTRODE_AREA,
	ELECTROLYTE_RESISTANCE,
	BRIDGE_RESISTANCE,
	OPEN_CIRCUIT_RESISTANCE,
	GAS_PARTIAL_PRESSURE,
	halfReactionsOn,
	oxidationOf,
	reductionOf,
	currentDensity,
	currentDensitySlope,
	materialName,
	atomSymbol,
} from "./halfReactions";
import { circuitNetwork, circuitThevenin, circuitReadings, type CircuitElement, type CircuitNetwork, type CircuitReading } from "./circuit";
import { NoIonicPathTransientModel, type NoIonicPathTransientSample } from "./NoIonicPathTransientModel";

const saltEquilibria = Object.entries(saltSolubility).map(([formula, data]) => {
	const [cation, anion, cations = 1, anions = 1] = data.ions;
	const product = data.ksp ?? (cations * data.saturation) ** cations * (anions * data.saturation) ** anions;
	return { formula, cation, anion, cations, anions, product };
}).sort((a, b) => a.product - b.product);

const complexEquilibria = Object.values(complexFormation);

/**
 * Current density below which an electrode counts as carrying nothing, in
 * A/cm². An ideally polarisable electrode has no potential at all, and the
 * solver would otherwise report its starting guess as if it were a result.
 */
const PLATEAU_CURRENT = 1e-12;

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

function saltIonProduct(positive: number, negative: number, cations: number, anions: number): number {
	return Math.max(0, positive) ** cations * Math.max(0, negative) ** anions;
}

type AcidBaseFamily = AcidBaseSystem & { key: string; representative: Molecule; step: number; members: Molecule[] };

/** One ion of a salt formula unit, with how many of it the unit contains. */
interface SaltFragment {
	ion: Molecule;
	count: number;
}

/** A free ion as the salt equilibria see it: stored as a molecule, or computed from an acid family. */
interface SaltIon {
	/** Structure used when a solid precipitates from this ion. */
	molecule: Molecule;
	/** Current concentration in mol/L. */
	readonly concentration: number;
	/** Concentration if `delta` mol/L of this ion were added (negative removes). */
	concentrationAt(delta: number): number;
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
	cache.set(removed, structure);
	return structure;
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
	 * @static
	 * @type {number}
	 */
	static _simTimeStep: number = 1;
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
		for (let pass = 0; pass < 8; pass++) {
			const saltsMoved = this.equilibrateSalts(mix);
			const hydroxidesMoved = this.equilibrateHydroxides(mix);
			if (!saltsMoved && !hydroxidesMoved) break;
		}
	}

	private static makeSolidSalt(formula: string, ions: readonly [Molecule, Molecule], counts: readonly [number, number]): Molecule {
		const solid = StructureManager.newMolecule();
		solid.name = solid.solidSaltFormula = formula;
		solid.solidSaltIons = ions;
		ions.forEach((ion, index) => {
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
		{ formula, cations, anions }: { formula: string; cations: number; anions: number },
		cationIon: Molecule,
		anionIon: Molecule
	): number {
		const molarMass = cationIon.getTotMolMass() * cations + anionIon.getTotMolMass() * anions;
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
			for (const atom of members) {
				ids.set(atom._id, ion.addAtom(atom.getName().toLowerCase(), atom.getSymbol(), atom.getIonicCharge())._id);
			}
			for (const bond of molecule._bonds) {
				if (bond._type === "ionic") continue;
				if (!ids.has(bond._from._id) || !ids.has(bond._to._id)) continue;
				ion.addBond(ids.get(bond._from._id), ids.get(bond._to._id), bond._magnitude, bond._length, bond._type);
			}
			const known = fragments.find(({ ion: other }) => other.smilesString === ion.smilesString);
			if (known) known.count += 1;
			else fragments.push({ ion, count: 1 });
		}
		return fragments;
	}

	private static registerSolidSalt(mix: Mixture, molecule: Molecule, ions: SaltFragment[]): boolean {
		const cation = ions.find(({ ion }) => ion._totalCharge > 0)?.ion;
		const anion = ions.find(({ ion }) => ion._totalCharge < 0)?.ion;
		if (!cation || !anion) return false;
		const salt = saltEquilibria.find((entry) =>
			entry.cation === cation.smilesString && entry.anion === anion.smilesString);
		if (!salt) return false;
		const amount = mix._molProperties[molecule._id + "n"];
		mix.remMolecule(molecule._id);
		const existing = mix._activeMolecules.find((item) => item.solidSaltFormula === salt.formula);
		mix.addMolecule(existing ?? this.makeSolidSalt(salt.formula, [cation, anion], [salt.cations, salt.anions]), amount);
		return true;
	}

	/**
	 * How far a soluble complex lifts a cation's analytical total above its free
	 * concentration. The ligand mass balance is solved by fixed-point iteration
	 * because the bound share is not always negligible next to the free ligand.
	 */
	private static complexFactor(smiles: string, systems: AcidBaseFamily[], H: number): number {
		let factor = 1;
		for (const complex of complexEquilibria) {
			if (complex.metal !== smiles) continue;
			const metalFamily = systems.find((item) => item.representative.smilesString === complex.metal);
			const ligandFamily = systems.find((item) => item.representative.smilesString === complex.ligand);
			if (!metalFamily || !ligandFamily) continue;
			// A molecular base is stored at its own protonation step, so the free
			// ligand is the fraction at that step, not the fully protonated one.
			const neutral = AcidBase.speciesFractions(ligandFamily, H)[ligandFamily.step] ?? 0;
			const metal = metalFamily.totalC;
			let free = ligandFamily.totalC * neutral;
			for (let step = 0; step < 24; step++) {
				const bound = complex.count * metal * complex.beta * Math.pow(free, complex.count) /
					(1 + complex.beta * Math.pow(free, complex.count));
				free = Math.max(0, (ligandFamily.totalC - bound) * neutral);
			}
			factor *= 1 + complex.beta * Math.pow(free, complex.count);
		}
		return factor;
	}

	/**
	 * Charge the complexed share of a cation family adds on top of what its
	 * protonation states already contribute.
	 *
	 * A complex keeps the cation's own charge, so the bound share must not be
	 * hydrolysed. The charge balance sees the whole family at its analytical
	 * total, which under-counts the bound share by the hydrolysis it would have
	 * lost; that deficit is what this returns.
	 *
	 * @private
	 * @static
	 * @param {AcidBaseFamily[]} systems - all conjugate families of the solution
	 * @param {number} H - the proton concentration [H+] in mol/L
	 * @param {string} [skip] - a cation whose complex the caller handles itself
	 * @returns {number} the signed charge concentration in mol/L
	 */
	private static complexCharge(systems: AcidBaseFamily[], H: number, skip?: string): number {
		let charge = 0;
		for (const family of systems) {
			const smiles = family.representative.smilesString;
			if (smiles === skip) continue;
			if (!complexEquilibria.some((item) => item.metal === smiles)) continue;
			const factor = this.complexFactor(smiles, systems, H);
			if (!(factor > 1)) continue;
			const fractions = AcidBase.speciesFractions(family, H);
			const free = family.totalC / (1 / fractions[0] + factor - 1);
			const removed = fractions.reduce((sum, fraction, step) => sum + fraction * step, 0);
			charge += free * (factor - 1) * removed;
		}
		return charge;
	}

	/**
	 * {@link complexCharge} as the optional hook of the acid–base solver, or
	 * undefined when no family of the solution forms a complex.
	 */
	private static complexChargeHook(systems: AcidBaseFamily[]): ((H: number) => number) | undefined {
		const present = systems.some((family) => complexEquilibria.some((item) =>
			item.metal === family.representative.smilesString));
		return present ? (H: number) => this.complexCharge(systems, H) : undefined;
	}

	/**
	 * Free-ion view of a solution for the salt equilibria. Stored ions are read
	 * directly. Conjugate anions of stored acids exist only as computed
	 * speciation, so they are exposed here as well; a change to one of them is
	 * booked against its analytical parent, which keeps the acid whole.
	 */
	private static saltIons(mix: Mixture): Map<string, SaltIon> {
		const volume = mix._solutionVolume;
		const ions = new Map<string, SaltIon>();
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const H = systems.length ?
			AcidBase.solveProton(systems, spectatorCharge, AcidBase.kwAt(mix._temperature),
				this.complexChargeHook(systems)) : 0;
		const stored = (molecule: Molecule): SaltIon => {
			const current = () => (mix._molProperties[molecule._id + "n"] ?? 0) / volume;
			// A complexed cation is present but not free, so the salt equilibria
			// see the analytical total divided by the complex factor.
			const factor = H > 0 ? this.complexFactor(molecule.smilesString, systems, H) : 1;
			return {
				molecule,
				get concentration() { return current() / factor; },
				concentrationAt: (delta) => (current() + delta) / factor,
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
			const fractions = AcidBase.speciesFractions(family, H);
			const total = () => family.members.reduce((sum, member) =>
				sum + (mix._molProperties[member._id + "n"] ?? 0), 0) / volume;
			for (let step = 1; step < fractions.length; step++) {
				const molecule = this.familySpecies(family, step);
				if (!molecule || molecule._totalCharge >= 0) continue;
				const smiles = molecule.smilesString;
				if (!saltEquilibria.some(({ anion }) => anion === smiles)) continue;
				ions.set(smiles, {
					molecule,
					get concentration() { return total() * fractions[step]; },
					concentrationAt: (delta) => (total() + delta) * fractions[step],
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
		const charge = family.protonatedCharge - step;
		const stored = family.members.find((member) => member._totalCharge === charge);
		if (stored) return stored;
		const parts = this.cacheDissociation(family.representative);
		const part = parts?.find((item) => item && item !== family.representative &&
			item.smilesString !== "[H+]" && item._totalCharge === charge);
		return part ?? protonationStructure(family.representative, step - family.step);
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
		for (let pass = 0; pass < 32; pass++) {
			const ions = this.saltIons(mix);
			let moved = false;
			for (const { formula, cation, anion, cations, anions, product } of otherSaltEquilibria) {
				const positive = ions.get(cation);
				const negative = ions.get(anion);
				const solid = solids.get(formula);
				if ((!positive || !negative) && !solid) continue;
				const ionProduct = (delta: number) => saltIonProduct(
					positive ? positive.concentrationAt(delta * cations) : 0,
					negative ? negative.concentrationAt(delta * anions) : 0,
					cations, anions);
				const current = ionProduct(0);
				if (Math.abs(current - product) <= product * 1e-8) continue;
				const available = solid ? mix._molProperties[solid._id + "n"] / volume : 0;
				const removable = Math.min(
					positive ? positive.removable / cations : Infinity,
					negative ? negative.removable / anions : Infinity);
				let low = current > product ? -removable : 0;
				let high = current > product ? 0 : available;
				if (!(low < high)) continue;
				let delta = high;
				if (ionProduct(high) > product) {
					for (let step = 0; step < 52; step++) {
						const middle = (low + high) / 2;
						if (ionProduct(middle) > product) high = middle;
						else low = middle;
					}
					delta = (low + high) / 2;
				}
				const amount = delta * volume;
				if (Math.abs(amount) <= 1e-14) continue;
				if (amount > 0) {
					const positiveIon = positive?.molecule ?? solid.solidSaltIons[0];
					const negativeIon = negative?.molecule ?? solid.solidSaltIons[1];
					if (positive) positive.change(amount * cations / volume);
					else mix.addMolecule(positiveIon, amount * cations);
					if (negative) negative.change(amount * anions / volume);
					else mix.addMolecule(negativeIon, amount * anions);
					mix.changeMolecule(solid._id, -amount);
					if (!mix._molProperties[solid._id + "n"]) solids.delete(formula);
					// the dissolved bulk no longer occupies its solid volume
					mix.addedVolume = Math.max(0, mix.addedVolume -
						this.bulkLitresPerMol({ formula, cations, anions }, positiveIon, negativeIon) * amount);
				} else {
					positive.change(amount * cations / volume);
					negative.change(amount * anions / volume);
					const deposit = solid ?? this.makeSolidSalt(formula,
						[positive.molecule, negative.molecule], [cations, anions]);
					mix.addMolecule(deposit, -amount);
					solids.set(formula, deposit);
					// newly settled solid takes up its bulk volume again
					mix.addedVolume += this.bulkLitresPerMol({ formula, cations, anions },
						positive.molecule, negative.molecule) * -amount;
				}
				changed = true;
			}
			if (!moved) break;
		}
		return changed;
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

		// Pinning one cation shifts the pH, which shifts every other family and
		// with it the pinned amount again. Iterate until a pass settles.
		for (let pass = 0; pass < 32; pass++) {
			const { systems, spectatorCharge } = this.acidBaseComposition(mix);
			let moved = false;

			for (const { formula, cation, cations, anions, product } of hydroxideEquilibria) {
				const family = systems.find((item) => item.representative.smilesString === cation);
				if (!family) continue;
				const solid = mix._activeMolecules.find((item) => item.solidSaltFormula === formula);
				const solidMol = solid ? mix._molProperties[solid._id + "n"] ?? 0 : 0;
				const dissolved = family.totalC;
				const total = dissolved + solidMol / volume;
				if (!(total > 0)) continue;

				// free cation concentration while the solid is present
				const freeAt = (H: number) => Math.pow(product * Math.pow(H / Kw, anions), 1 / cations);
				const residual = (H: number) => {
					let net = H - Kw / H + spectatorCharge;
					for (const system of systems) {
						if (system !== family) net += AcidBase.systemCharge(system, H);
					}
					// Complexes of the other cations keep their charge too.
					net += this.complexCharge(systems, H, family.representative.smilesString);
					const fraction = AcidBase.speciesFractions(family, H)[0];
					// A complex keeps the cation's own charge, so it adds charge
					// directly instead of through the hydrolysis fractions.
					const factor = this.complexFactor(family.representative.smilesString, systems, H);
					const capacity = 1 / fraction + factor - 1;
					// While the solid is present the free cation is pinned by the
					// solubility product; once the complex has taken up everything
					// there is no solid left and the analytical total rules.
					const dissolved = Math.min(total, freeAt(H) * capacity);
					const free = dissolved / capacity;
					return net + AcidBase.systemCharge({ ...family, totalC: free / fraction }, H) +
						free * (factor - 1) * family.protonatedCharge;
				};
				let low = -2;
				let high = 16;
				for (let step = 0; step < 100; step++) {
					const middle = (low + high) / 2;
					if (residual(Math.pow(10, -middle)) > 0) low = middle;
					else high = middle;
				}
				const H = Math.pow(10, -(low + high) / 2);
				const factor = this.complexFactor(family.representative.smilesString, systems, H);
				const pinned = freeAt(H) *
					(1 / AcidBase.speciesFractions(family, H)[0] + factor - 1);
				// A pinned total above what is present means the solid has dissolved.
				const next = Math.min(total, pinned);
				const nextSolid = (total - next) * volume;
				if (Math.abs(next - dissolved) <= total * 1e-9 &&
					Math.abs(nextSolid - solidMol) <= total * volume * 1e-9) continue;

				const bulk = this.bulkLitresPerMol({ formula, cations, anions },
					family.representative, hydroxideMolecule());
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
				moved = true;
			}

			if (!moved) break;
			changed = true;
		}
		return changed;
	}

	/** Read-only fraction of saturation for the modeled salt closest to its limit. */
	public static getSaltSaturation(mix: Mixture): { formula: string; fraction: number } | undefined {
		const volume = mix._solutionVolume;
		if (!mix._isSolution || !(volume > 0)) return;
		const ions = this.saltIons(mix);
		let closest: { formula: string; fraction: number } | undefined;
		for (const { formula, cation, anion, cations, anions, product } of saltEquilibria) {
			const positive = ions.get(cation)?.concentration;
			const negative = ions.get(anion)?.concentration;
			if (!(positive > 0) || !(negative > 0)) continue;
			// Use a concentration-scale fraction: scaling all ion concentrations
			// by one half scales the gauge by one half, regardless of stoichiometry.
			const ratio = saltIonProduct(positive, negative, cations, anions) / product;
			const fraction = Math.min(1, ratio ** (1 / (cations + anions)));
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
		const ions = this.saltIons(mix);
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		// A solution without any acid family still has water autoionisation, so
		// the charge balance has to run on an empty list rather than be skipped:
		// otherwise a neutral salt solution would report no protons at all and
		// every couple that reads [H⁺] would drop out of the electrode.
		const protons = AcidBase.solveProton(systems, spectatorCharge,
			AcidBase.kwAt(mix._temperature), this.complexChargeHook(systems));
		return { mix, ions, protons };
	}

	/**
	 * Activity of one species of a half-reaction in a vessel. A solid is a pure
	 * phase and a gas that has left the solution sits at
	 * {@link GAS_PARTIAL_PRESSURE}; water is the solvent. Everything else is
	 * read from the free-ion view, so a computed conjugate anion counts as much
	 * as a stored one.
	 *
	 * @private
	 * @static
	 * @param {HalfReactionTerm} term - the species
	 * @param {VesselView} view - the vessel it sits in
	 * @returns {number}
	 */
	private static termActivity(term: HalfReactionTerm, view: VesselView): number {
		if (term.phase === "solid") return 1;
		if (term.phase === "gas") return GAS_PARTIAL_PRESSURE;
		if (term.smiles === "[H+]") return view.protons;
		if (term.smiles === "O") return 1;
		const ion = view.ions.get(term.smiles);
		if (ion) return ion.concentration;
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
	 * directions can carry in one step, taken from the amount of the species
	 * they consume. The solve has to respect that: a couple whose gas has only
	 * just started to form can carry a few microamps, not the current of a
	 * full electrode. Without the bound the two gas couples of a water
	 * electrolysis cancelled each other at a potential where the current was
	 * set by the resistance alone, and the cell oscillated between that
	 * degenerate root and the real one.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the electrode and its vessel
	 * @param {VesselView} view - the vessel it dips into
	 * @param {number} dt - length of the step in s
	 * @returns {HalfCandidate[]}
	 */
	private static electrodeCandidates(
		electrode: ElectricComponent,
		view: VesselView,
		dt: number
	): HalfCandidate[] {
		const candidates: HalfCandidate[] = [];
		const material = electrode._material;
		const volume = view.mix._solutionVolume;
		const area = electrode._area > 0 ? electrode._area : ELECTRODE_AREA;
		const platings = electrode.platings;
		// A deposit covers the strip, so it is the surface that reacts: the
		// plated metal goes back into solution as its cation, and the electrode
		// body is only attacked once the layer is gone. That is what makes a
		// plating reversible, as in a rechargeable cell.
		const solidAmount = (smiles: string): number => {
			if (material !== undefined && material.smilesString === smiles) return Infinity;
			const plating = platings.find((item) => item.molecule.smilesString === smiles);
			return plating ? plating.mol : 0;
		};
		const amountOf = (term: HalfReactionTerm, reaction: HalfReaction): number => {
			if (term.phase === "solid") return solidAmount(term.smiles);
			if (term.phase === "gas") {
				return reaction.gas ? view.mix.evolvedGas.get(reaction.gas) ?? 0 : 0;
			}
			if (term.smiles === "O") return Infinity;
			// Protons are not a stored species: an acid family releases more as
			// they are taken and water supplies them otherwise, so only the
			// current bounds how many a step may convert.
			if (term.smiles === "[H+]") return Infinity;
			return this.termActivity(term, view) * volume;
		};
		for (const reaction of halfReactionsOn(materialName(material))) {
			const equilibrium = this.halfReactionPotential(reaction, view);
			if (!Number.isFinite(equilibrium)) continue;
			let canOxidise = true;
			let canReduce = true;
			let anodicLimit = Infinity;
			let cathodicLimit = Infinity;
			for (const term of reaction.terms) {
				const amount = amountOf(term, reaction);
				if (term.coefficient < 0) {
					if (!(amount > 0)) canOxidise = false;
					else anodicLimit = Math.min(anodicLimit, amount / -term.coefficient * reaction.el);
				} else {
					if (!(amount > 0)) canReduce = false;
					else cathodicLimit = Math.min(cathodicLimit, amount / term.coefficient * reaction.el);
				}
			}
			if (!canOxidise && !canReduce) continue;
			// A step may not convert more than the vessel holds, so the same
			// bound the booking applies also bounds the current density. A
			// missing step length leaves the bound open instead of making it
			// NaN, which would poison the whole solve.
			const densityOf = (limit: number) => Number.isFinite(limit) && dt > 0
				? limit * this._faradayConst / (area * dt) : Infinity;
			candidates.push({
				reaction,
				equilibrium,
				canOxidise,
				canReduce,
				anodicLimit,
				cathodicLimit,
				anodicDensity: densityOf(anodicLimit),
				cathodicDensity: densityOf(cathodicLimit),
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
		for (const term of reaction.terms) {
			const delta = term.coefficient * extent;
			if (!(Math.abs(delta) > 0)) continue;
			if (term.phase === "solid") {
				if (material !== undefined && material.smilesString === term.smiles) {
					// The electrode body itself: it is not tracked as an amount,
					// so only the volume it frees is booked.
					if (delta < 0) {
						mix.addedVolume = Math.max(0, mix.addedVolume +
							this.metalBulkLitresPerMol(material, reaction) * delta);
					}
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
			if (term.phase === "gas") {
				if (!reaction.gas) continue;
				if (delta > 0) mix.evolveGas(reaction.gas, delta);
				else mix.evolvedGas.set(reaction.gas,
					Math.max(0, (mix.evolvedGas.get(reaction.gas) ?? 0) + delta));
				continue;
			}
			if (term.smiles === "O") continue;
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
		if (!Number.isFinite(fLow)) return undefined;
		if (fLow === 0) return start;
		let distance = 0.05;
		for (let step = 0; step < 40; step++) {
			if (fLow > 0) {
				low = start - distance;
				fLow = residual(low);
				if (!Number.isFinite(fLow)) return undefined;
				if (fLow < 0) break;
			} else {
				high = start + distance;
				fHigh = residual(high);
				if (!Number.isFinite(fHigh)) return undefined;
				if (fHigh > 0) break;
			}
			distance *= 2;
		}
		if (!(fLow <= 0 && fHigh >= 0)) return undefined;
		let potential = Math.max(low, Math.min(high, start));
		for (let step = 0; step < 100; step++) {
			const current = residual(potential);
			if (!Number.isFinite(current)) return undefined;
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
			Math.min(candidate.anodicDensity, density));
		if (!candidate.canOxidise) return Math.min(0, bounded);
		if (!candidate.canReduce) return Math.max(0, bounded);
		return bounded;
	}

	/** Slope of {@link candidateCurrent}, zero on the clamped side. */
	private static candidateSlope(candidate: HalfCandidate, potential: number): number {
		if (candidate.stiffness !== undefined) return candidate.stiffness;
		const density = currentDensity(candidate.reaction, potential - candidate.equilibrium);
		if (!candidate.canOxidise && density > 0) return 0;
		if (!candidate.canReduce && density < 0) return 0;
		if (density > candidate.anodicDensity || density < -candidate.cathodicDensity) return 0;
		return currentDensitySlope(candidate.reaction, potential - candidate.equilibrium);
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
	 * @returns {(CellSolution | undefined)}
	 */
	private static solveCurrent(
		first: HalfCandidate[],
		second: HalfCandidate[],
		source: number,
		resistance: number,
		limits: CellLimits,
		areas: CellAreas
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
				probedResidual = NaN;
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
		probe(current);
		if (probedFirst === undefined || probedSecond === undefined) return undefined;
		return {
			first: probedFirst.potential,
			second: probedSecond.potential,
			current,
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
	 * @returns {(CellSolution | undefined)}
	 */
	private static solveCell(
		first: HalfCandidate[],
		second: HalfCandidate[],
		source: number,
		resistance: number,
		ideal: boolean,
		limits: CellLimits,
		areas: CellAreas
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
			return this.solveCurrent(first, second, source, resistance, limits, areas);
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
		return this.solveCurrent(first, second, source, resistance, limits, areas);
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
	 * @returns {({solution: CellSolution, limited: boolean} | undefined)}
	 */
	private static solveSupply(
		network: CircuitNetwork,
		element: CircuitElement,
		source: ElectricComponent,
		first: HalfCandidate[],
		second: HalfCandidate[],
		electrolyte: number,
		limits: CellLimits,
		areas: CellAreas
	): { solution: CellSolution; limited: boolean } | undefined {
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
				thevenin.resistance + electrolyte, false, limits, areas);
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
			const magnitude = Math.abs(source._sourceCurrent ?? 0);
			const wanted = source._polarity === 0 ? openSign * magnitude
				: (source._polarity > 0) === plusAtFirst ? magnitude : -magnitude;
			// The supply's own reading runs against the current it delivers,
			// so a setpoint that makes the first electrode the anode is a
			// negative reading.
			const target = -wanted;
			const emf = this.matchSourceEmf((probe) => {
				const point = solveAt(probe);
				return point ? point.current - target : undefined;
			}, startFor(wanted));
			if (emf === undefined) return undefined;
			const point = solveAt(emf);
			if (!point) return undefined;
			const compliance = Math.abs(source._complianceVoltage ?? 0);
			if (!(compliance > 0) || Math.abs(point.voltage) <= compliance) {
				return { solution: point.solution, limited: false };
			}
			const capped = this.matchSourceEmf((probe) => {
				const next = solveAt(probe);
				return next ? Math.sign(point.voltage) * compliance - next.voltage : undefined;
			}, emf);
			if (capped === undefined) return undefined;
			const held = solveAt(capped);
			return held ? { solution: held.solution, limited: true } : undefined;
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
			return { solution: point.solution, limited: false };
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
		return held ? { solution: held.solution, limited: true } : undefined;
	}

	/**
	 * Books the current each half-reaction of one electrode carries over the
	 * step, clamped by what the vessel can supply.
	 *
	 * @private
	 * @static
	 * @param {HalfCandidate[]} candidates - the electrode's half-reactions
	 * @param {number[]} currents - current density each of them carries, A/cm²
	 * @param {number} dt - length of the step in s
	 * @param {number} area - wetted area of the electrode in cm²
	 */
	private static applyElectrode(
		candidates: HalfCandidate[],
		currents: number[],
		dt: number,
		area: number
	): void {
		candidates.forEach((candidate, index) => {
			const density = currents[index];
			if (!(Math.abs(density) > 0)) return;
			const electronMol = density * area * dt / this._faradayConst;
			const clamped = Math.max(-candidate.cathodicLimit,
				Math.min(candidate.anodicLimit, electronMol));
			if (!(Math.abs(clamped) > 0)) return;
			candidate.apply(clamped);
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
	 * A salt bridge carries the ionic current between the two vessels, so it
	 * compensates the charge moved by stored ions. The model keeps the
	 * bridge's countercharge as a spectator charge rather than named ions.
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
	 * contact, and a dry one is not part of the cell.
	 */
	public static ionicResistance(first: ElectricComponent, second: ElectricComponent, bridge = false): number {
		const firstMix = first._connectedMix;
		const secondMix = second._connectedMix;
		if (!firstMix?._isSolution || !secondMix?._isSolution) return Infinity;
		if (firstMix !== secondMix) {
			return bridge ? ELECTROLYTE_RESISTANCE + BRIDGE_RESISTANCE : Infinity;
		}
		return ELECTROLYTE_RESISTANCE;
	}

	/** Prepares a passive galvanic RC experiment and projects its current onto the meters. */
	public static prepareNoIonicPathTransient(
		first: ElectricComponent,
		second: ElectricComponent,
		devices: readonly ElectricComponent[],
		ionicResistance: number,
		{ capacitance, seriesResistance = 0, initialCharge = 0 }:
			{ capacitance: number; seriesResistance?: number; initialCharge?: number }
	): { model: NoIonicPathTransientModel; readMeters: (sample: NoIonicPathTransientSample) => void } | undefined {
		const firstMix = first._connectedMix;
		const secondMix = second._connectedMix;
		if (ionicResistance !== Infinity || firstMix === secondMix ||
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
		const a = this.mixedPotential(this.electrodeCandidates(first, this.vesselView(firstMix), 0));
		const b = this.mixedPotential(this.electrodeCandidates(second, this.vesselView(secondMix), 0));
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
		return {
			model,
			readMeters: (sample) => {
				// Positive RC current is from the first electrode into the external load.
				const readings = circuitReadings(network, {
					emf: 0, resistance: 0, current: -sample.current, open: false,
				});
				for (const device of devices) {
					const reading = readings?.get(device);
					device._visibleCurrent = reading?.current ?? null;
					if (device._type === EComponentType.Voltmeter ||
						(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
						device._visibleVoltage = reading ? Math.abs(reading.voltage) : null;
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
		options: { bridge?: boolean; ionicResistance?: number } = {}
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
				if (device._type === EComponentType.Voltmeter ||
					device._type === EComponentType.Multimeter ||
					device._type === EComponentType.Source) {
					device._visibleVoltage = null;
				}
			}
		};
		if (!usable(mix1) || !usable(mix2)) return unsolved();
		if (!ComponentManager.isConnected(sElectrode1, sElectrode2)) return unsolved();

		const source = sDevices.find((device) => device._type === EComponentType.Source);
		const electrolyte = options.ionicResistance ?? this.ionicResistance(sElectrode1, sElectrode2, options.bridge);
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
		const candidatesOf = (electrode: ElectricComponent, mix: Mixture | undefined) =>
			electrode._reference !== undefined
				? this.referenceCandidates(electrode._reference)
				: mix?._isSolution ? this.electrodeCandidates(electrode, this.vesselView(mix), dt) : [];
		const first = candidatesOf(sElectrode1, mix1);
		const second = candidatesOf(sElectrode2, mix2);
		if (first.length === 0 || second.length === 0) return unsolved();

		const areas: CellAreas = {
			first: sElectrode1._area > 0 ? sElectrode1._area : ELECTRODE_AREA,
			second: sElectrode2._area > 0 ? sElectrode2._area : ELECTRODE_AREA,
		};
		const limits = this.cellLimits(first, second);
		// The devices between the electrodes form a network, not a single
		// loop: a voltmeter may sit across the cell while the supply drives
		// it, or in series with it. Its Thevenin equivalent is what the cell
		// is solved against, so every meter is read where it actually is.
		const network = circuitNetwork([sElectrode1, sElectrode2, ...sDevices]);
		if (!network) return unsolved();
		const element = source ? network.elements.find((entry) => entry.device === source) : undefined;
		let solution: CellSolution | undefined;
		// Whether the supply had to give up its setpoint because the load
		// would have drawn more than it allows.
		let limited = false;
		let ideal = false;
		if (source && element) {
			// The supply's EMF is part of the network, so the cell is solved
			// against the voltage the network really presents at the supply's
			// terminals, and the supply's own current is what gets regulated.
			const point = this.solveSupply(network, element, source, first, second,
				electrolyte, limits, areas);
			if (!point) return unsolved();
			solution = point.solution;
			limited = point.limited;
		} else {
			const thevenin = circuitThevenin(network);
			if (!thevenin) return unsolved();
			// Without a supply the circuit is either open (a voltmeter, which
			// draws no current) or shorted through the ammeter. Only a network
			// that really presents no path counts as open: a lead laid straight
			// across the electrodes lets the cell discharge even while a
			// voltmeter hangs on the same posts.
			ideal = thevenin.resistance > OPEN_CIRCUIT_RESISTANCE && sDevices.some((device) =>
				device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage"));
			solution = this.solveCell(first, second, thevenin.voltage,
				thevenin.resistance + electrolyte, ideal, limits, areas);
		}
		if (!solution) return unsolved();
		const readings = circuitReadings(network, {
			emf: solution.first - solution.second,
			resistance: electrolyte,
			current: solution.current,
			open: ideal,
		});

		for (const device of sDevices) {
			const reading = readings?.get(device);
			// A device whose lead hangs on one post only is not part of the
			// circuit, so it reads nothing instead of the cell's own values.
			device._visibleCurrent = reading ? reading.current : null;
			if (device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
				device._visibleVoltage = reading ? Math.abs(reading.voltage) : null;
			} else if (device._type === EComponentType.Source) {
				// A source shows the voltage it actually holds: the one it had
				// to apply in current mode, and the one left over once the
				// current limit took over in voltage mode. Without a limit the
				// setpoint stands, so the display keeps showing it.
				device._visibleVoltage = device._sourceMode === "current" || limited
					? (reading ? Math.abs(reading.voltage) : null)
					: null;
			}
		}

		this.applyElectrode(first, solution.firstCurrents, dt, areas.first);
		this.applyElectrode(second, solution.secondCurrents, dt, areas.second);
		if (separateBaths) {
			this.balanceCharge(mix1);
			this.balanceCharge(mix2);
		}
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
			if (device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
				device._visibleVoltage = reading ? Math.abs(reading.voltage) : null;
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
		if (!source || !element) return circuitReadings(network);
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
				// the electrons must balance: z_metal * n_metal = z_ion * n_ion
				const extent = Math.min(
					(mix._molProperties[metal._id + "n"] ?? 0) / oxidation.el,
					(mix._molProperties[ion._id + "n"] ?? 0) / reduction.el
				);
				if (!(extent > 1e-12)) continue;
				const metalMol = extent * oxidation.el;
				const ionMol = extent * reduction.el;
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
		for (const { ion, count } of ions) sMix.addMolecule(ion, amount * count);
		sMix.changeMolecule(cMolecule._id, -amount);
		// release the bulk volume of the dissolved portion, keeping the dosed
		// solid volume consistent with what actually stays solid
		const cation = ions.find(({ ion }) => ion._totalCharge > 0)?.ion;
		const anion = ions.find(({ ion }) => ion._totalCharge < 0)?.ion;
		const entry = cation && anion ? saltEquilibria.find(({ cation: c, anion: a }) =>
			cation.smilesString === c && anion.smilesString === a) : undefined;
		if (entry) sMix.addedVolume = Math.max(0, sMix.addedVolume -
			this.bulkLitresPerMol(entry, cation, anion) * amount);
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

	/** Read-only equilibrium view of modeled polyprotic families; stored amounts remain analytical totals. */
	public static getPolyproticEquilibrium(sMix: Mixture): {
		pH: number; species: AcidEquilibriumSpecies[]; analyticalMolecules: Set<Molecule>;
	} {
		const { systems, spectatorCharge } = this.acidBaseComposition(sMix);
		const Kw = AcidBase.kwAt(sMix._temperature);
		const H = AcidBase.solveProton(systems, spectatorCharge, Kw, this.complexChargeHook(systems));
		const volume = sMix._solutionVolume;
		const species: AcidEquilibriumSpecies[] = [];
		const analyticalMolecules = new Set<Molecule>();
		for (const family of systems) {
			if (family.pKa.length < 1 || !(family.totalC > 0)) continue;
			const elements = new Map<string, number>();
			for (const section of family.representative._kekule_obj.calcFormula().getSections()) {
				const symbol = section.obj.getSymbol();
				elements.set(symbol, (elements.get(symbol) ?? 0) + section.count);
			}
			const protonatedHydrogens = (elements.get("H") ?? 0) + family.step;
			if (protonatedHydrogens < family.pKa.length) continue;
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
				const concentration = family.totalC * fraction;
				const charge = family.protonatedCharge - step;
				// A stored species of this protonation state (or its dissociation
				// part) keeps its name and drawn structure on the species card.
				const molecule = family.members.find((item) => item._totalCharge === charge) ??
					conjugates?.find((item) => item && item !== family.representative &&
						item.smilesString !== "[H+]" && item._totalCharge === charge);
				const formula = symbols.map((symbol) => {
					const count = symbol === "H" ? protonatedHydrogens - step : elements.get(symbol);
					return count > 0 ? symbol + subscript(count) : "";
				}).join("") + superscript(charge);
				species.push({ formula, charge, fraction, concentration, amount: concentration * volume,
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
		): AcidBaseFamily => {
			let idx: number = familyIndex[key];
			if (idx === undefined) {
				idx = systems.length;
				familyIndex[key] = idx;
				systems.push({
					key,
					totalC: 0,
					pKa: pKaList(acidbaseData[key]),
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
				const offset: number = entry["base"] ? 0 : 1;
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
			if (
				entry === undefined ||
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
			const protonatedCharge: number = entry["base"]
				? molecule._totalCharge + pKaList(entry).length
				: molecule._totalCharge;
			const family = familyFor(key, protonatedCharge, molecule, entry["base"] ? pKaList(entry).length : 0);
			family.totalC += conc(molecule);
			family.members.push(molecule);

			// map the actual conjugate base so a buffer built from this acid plus
			// its conjugate salt folds into the same family
			if (!entry["base"] && parts != undefined) {
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
				molecule._totalCharge === 0 ||
				StructureManager.isWater(molecule) ||
				acidbaseData[smiles] != undefined
			) {
				return;
			}

			const conjugate = conjugateToFamily[smiles];
			if (conjugate != undefined) {
				const family = familyFor(conjugate.key, molecule._totalCharge + conjugate.step, molecule, conjugate.step);
				family.totalC += conc(molecule);
				family.members.push(molecule);
			} else {
				spectatorCharge += molecule._totalCharge * conc(molecule);
			}
		});

		// Charge the half-reactions have left behind without a stored
		// counter-ion, as after an electrolysis in a neutral salt solution.
		// It is kept as an amount, so it becomes a concentration here.
		if (sMix._solutionVolume > 0) {
			spectatorCharge += sMix.excessCharge / sMix._solutionVolume;
		}
		return { systems, spectatorCharge };
	}

}
