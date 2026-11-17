import { Mixture } from "./Mixture";
import { StructureManager, RedoxCouple } from "./StructureManager";
import { Molecule } from "./Molecule";
import { Atom } from "./Atom";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";
import { saltSolubility } from "./saltSolubility";
import { complexFormation } from "./complexes";
import { evolvedGases } from "./gasEvolution";

const saltEquilibria = Object.entries(saltSolubility).map(([formula, data]) => {
	const [cation, anion, cations = 1, anions = 1] = data.ions;
	const product = data.ksp ?? (cations * data.saturation) ** cations * (anions * data.saturation) ** anions;
	return { formula, cation, anion, cations, anions, product };
}).sort((a, b) => a.product - b.product);

const complexEquilibria = Object.values(complexFormation);

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

/**
 * The proton, built once so the H⁺/H₂ couple can be looked up by its mass.
 * Protons are never stored in a mixture, so the couple needs a stand-in
 * molecule to reach the redox table.
 */
let protonIon: Molecule | undefined;
function proton(): Molecule {
	if (!protonIon) {
		protonIon = StructureManager.newMolecule();
		protonIon.addAtom("hydrogen", "H", 1);
	}
	return protonIon;
}

/** Water, built once so the O₂/H₂O couple can be looked up by its mass. */
let waterMolecule: Molecule | undefined;
function water(): Molecule {
	if (!waterMolecule) {
		waterMolecule = StructureManager.newMolecule();
		const oxygen = waterMolecule.addAtom("oxygen", "O");
		const first = waterMolecule.addAtom("hydrogen", "H");
		const second = waterMolecule.addAtom("hydrogen", "H");
		waterMolecule.addBond(oxygen._id, first._id, 1, 100, "covalent");
		waterMolecule.addBond(oxygen._id, second._id, 1, 100, "covalent");
	}
	return waterMolecule;
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
}

/**
 * One half-reaction a vessel can run at an electrode, with the potential the
 * couple has in that vessel and the amount it can convert.
 *
 * @interface HalfCandidate
 */
interface HalfCandidate {
	/** The redox couple behind the half-reaction. */
	couple: RedoxCouple;
	/** Electrode potential of the couple in this vessel, in V. */
	potential: number;
	/** Largest amount that can react, in mol of electrons. */
	available: number;
	/**
	 * Whether the half-reaction consumes a dissolved anion. Water reduction at
	 * the cathode is only offered against such an anode, because that is the
	 * pairing whose charge balance the vessel can carry.
	 */
	anion: boolean;
	/** Apply the half-reaction for `electronMol` electrons. */
	apply(electronMol: number): void;
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
	 * Looks up the redox couple (reduced form, oxidized form, electron count,
	 * standard electrode potential) for an element by its molar mass, as used
	 * internally by {@link sEChem}.
	 *
	 * @public
	 * @static
	 * @param {Molecule} molecule - a neutral element or its ion
	 * @returns {(RedoxCouple | undefined)}
	 */
	public static getRedoxData(molecule: Molecule): RedoxCouple | undefined {
		return StructureManager._moleculeData["redox"][
			molecule.getTotMolMass().toString()
		];
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
	 * Simulation of a galvanic element or an electrolysis
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} sElectrode1 - first electrode
	 * @param {ElectricComponent} sElectrode2 - second electrode
	 * @param {ElectricComponent} sDevice - device in between the electrodes: Source or voltmeter
	 */
	public static sEChem(
		sElectrode1: ElectricComponent,
		sElectrode2: ElectricComponent,
		sDevice: ElectricComponent
	): void {
		if (sDevice._type === EComponentType.Voltmeter) sDevice._visibleVoltage = 0;
		if (
			sDevice._type === EComponentType.Ammeter ||
			!ComponentManager.isConnected(sElectrode1, sElectrode2) ||
			!sElectrode1._connectedMix?._isSolution ||
			!sElectrode2._connectedMix?._isSolution
		) {
			return;
		}

		const bElectrolysis = sDevice._type === EComponentType.Source;
		if (!bElectrolysis) sDevice._visibleVoltage = null;
		// A source has two poles, and the electrode on the plus pole is the
		// anode: that is where oxidation takes place. With a polarity set the
		// direction is fixed, so the cell can be driven either way without
		// swapping the source for a voltmeter. Without one the model picks the
		// direction itself, which is what a supply does when the wiring is
		// left to it.
		const plus = bElectrolysis && sDevice._polarity !== 0
			? ComponentManager.terminalElectrode(sDevice, sDevice._polarity > 0 ? 0 : 1)
			: undefined;
		const forced: [ElectricComponent, ElectricComponent] | undefined =
			plus === sElectrode1 ? [sElectrode1, sElectrode2]
				: plus === sElectrode2 ? [sElectrode2, sElectrode1]
					: undefined;
		const orientations: [ElectricComponent, ElectricComponent][] = forced
			? [forced]
			: [[sElectrode1, sElectrode2], [sElectrode2, sElectrode1]];
		let reaction: { anode: HalfCandidate; cathode: HalfCandidate; voltage: number; standard: number } | undefined;

		for (const [anodeElectrode, cathodeElectrode] of orientations) {
			for (const anode of this.anodeCandidates(anodeElectrode)) {
				for (const cathode of this.cathodeCandidates(cathodeElectrode, anode)) {
					const voltage = cathode.potential - anode.potential;
					const standard = cathode.couple.sep - anode.couple.sep;
					if (bElectrolysis) {
						// Without a fixed polarity the source drives the cell
						// against its own voltage, so a pair that would run on
						// its own is not what a supply does. A fixed polarity is
						// not negotiable, so there such a pair runs too: the
						// source then only adds to the cell.
						if (!forced && voltage > 0) continue;
						// The source has to reach the decomposition voltage.
						if (!(Math.abs(sDevice._sourceVoltage) >= -voltage)) continue;
						// Ranking by the standard potentials keeps the choice
						// stable: the Nernst potentials drift while the cell runs
						// and would otherwise let two pairs alternate.
						if (reaction && !(standard > reaction.standard)) continue;
					} else if (voltage <= 0 || (reaction && voltage <= reaction.voltage)) continue;
					reaction = { anode, cathode, voltage, standard };
				}
			}
		}
		if (!reaction) return;
		const { anode, cathode, voltage } = reaction;
		const electronMol = Math.min(
			sDevice._sourceCurrent * this._simTimeStep / this._faradayConst,
			anode.available,
			cathode.available
		);
		if (!(electronMol > 0)) return;

		if (!bElectrolysis) sDevice._visibleVoltage = Math.max(0, voltage);
		anode.apply(electronMol);
		cathode.apply(electronMol);
	}

	/**
	 * Nernst correction for the couple's dissolved species: the oxidised form
	 * of a metal couple (its cation) or the reduced form of an anion couple
	 * (its halide). Both enter the potential with a positive sign, so one
	 * helper serves both directions.
	 *
	 * The term belongs in the pair selection, not only in the display, because
	 * a concentration cell has equal standard potentials on both sides and its
	 * whole voltage comes from the two activities differing.
	 *
	 * @private
	 * @static
	 * @param {number} standard - standard electrode potential in V
	 * @param {Mixture} mix - the vessel the couple sits in
	 * @param {number} [activity] - concentration of the dissolved species in mol/L
	 * @param {number} electrons - electrons transferred per formula unit
	 * @returns {number} the electrode potential in V
	 */
	private static nernst(
		standard: number,
		mix: Mixture,
		activity: number | undefined,
		electrons: number
	): number {
		const value = Number.isFinite(activity) && activity > 0 ? activity : 1;
		return standard + this._gasConst * mix._temperature / (electrons * this._faradayConst) * Math.log(value);
	}

	/**
	 * Free proton concentration of a solution in mol/L. A solution without an
	 * acid family is not neutral: an excess of a spectator cation is a
	 * hydroxide base, so the charge balance has to run even with no systems.
	 */
	private static protonConcentration(mix: Mixture): number {
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		return AcidBase.solveProton(systems, spectatorCharge, AcidBase.kwAt(mix._temperature),
			this.complexChargeHook(systems));
	}

	/**
	 * The acid family that supplies protons to a cathode, with the number of
	 * protons one mole of its analytical total carries. The strongest acid
	 * present gives up its protons first, so a mixture spends the strong acid
	 * before the weak one starts to buffer.
	 *
	 * @private
	 * @static
	 * @param {Mixture} mix - the solution to read
	 * @returns {({ family: AcidBaseFamily; protons: number } | undefined)}
	 */
	private static protonSource(mix: Mixture): { family: AcidBaseFamily; protons: number } | undefined {
		let best: { family: AcidBaseFamily; protons: number } | undefined;
		for (const family of this.acidBaseComposition(mix).systems) {
			// A base family is stored at its neutral step and would consume
			// protons instead of releasing them, so only acids qualify.
			if (!(family.totalC > 0) || family.step !== 0 || family.protonatedCharge > 0) continue;
			if (!(family.pKa.length > 0)) continue;
			if (!best || family.pKa[0] < best.family.pKa[0]) best = { family, protons: family.pKa.length };
		}
		return best;
	}

	/**
	 * Half-reactions an electrode can run as the anode of its vessel: a metal
	 * body dissolving, a dissolved anion giving up electrons, or water being
	 * oxidised to oxygen.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the electrode and its vessel
	 * @returns {HalfCandidate[]}
	 */
	private static anodeCandidates(electrode: ElectricComponent): HalfCandidate[] {
		const mix = electrode._connectedMix;
		if (!mix) return [];
		const candidates: HalfCandidate[] = [];
		const volume = mix._solutionVolume;
		// A deposit covers the strip, so it is the surface that reacts: the
		// plated metal goes back into solution as its cation, and the electrode
		// body is only attacked once the layer is gone. That is what makes a
		// plating reversible, as in a rechargeable cell.
		const plating = electrode.plating;
		const platingCouple = plating ? this.getRedoxData(plating.molecule) : undefined;
		const plated = plating && platingCouple && plating.mol > 0 &&
			plating.molecule.smilesString === platingCouple.red &&
			(platingCouple.redPhase ?? "solid") === "solid";
		if (plated && plating && platingCouple) {
			const ion = mix._activeMolecules.find((molecule) => molecule.smilesString === platingCouple.ox);
			candidates.push({
				couple: platingCouple,
				potential: this.nernst(platingCouple.sep, mix, ion ? mix._molProperties[ion._id + "c"] : undefined, platingCouple.el),
				available: plating.mol * platingCouple.el,
				anion: false,
				apply: (electronMol) => {
					const mol = electronMol / platingCouple.el;
					electrode.unplate(plating.molecule, mol);
					mix.addMolecule(this.redoxProduct(plating.molecule, platingCouple.el), mol);
				},
			});
		}
		const material = electrode._material;
		const couple = material ? this.getRedoxData(material) : undefined;
		// A metal body dissolves into its own cation. The electrode is not
		// tracked as an amount, so only the other half-reaction limits it.
		if (!plated && couple && material.smilesString === couple.red && (couple.redPhase ?? "solid") === "solid") {
			const ion = mix._activeMolecules.find((molecule) => molecule.smilesString === couple.ox);
			candidates.push({
				couple,
				potential: this.nernst(couple.sep, mix, ion ? mix._molProperties[ion._id + "c"] : undefined, couple.el),
				available: Infinity,
				anion: false,
				apply: (electronMol) => mix.addMolecule(this.redoxProduct(material, couple.el), electronMol / couple.el),
			});
		}
		// A dissolved anion is oxidised at an inert electrode. Its conjugate
		// form may only exist as computed speciation (chloride from
		// hydrochloric acid), so the salt-ion view supplies it.
		for (const ion of this.saltIons(mix).values()) {
			if (!(ion.molecule._totalCharge < 0)) continue;
			const anionCouple = this.getRedoxData(ion.molecule);
			if (!anionCouple || anionCouple.red !== ion.molecule.smilesString) continue;
			if ((anionCouple.redPhase ?? "solid") !== "solution") continue;
			// An exhausted ion must not win the pair selection with an
			// availability of zero, or the electrode would stop instead of
			// falling back to the next couple.
			if (!(ion.removable > 0)) continue;
			const gas = anionCouple.gas;
			candidates.push({
				couple: anionCouple,
				potential: this.nernst(anionCouple.sep, mix, ion.concentration, anionCouple.el),
				available: ion.removable * volume * anionCouple.el,
				anion: true,
				apply: (electronMol) => {
					ion.change(-electronMol / anionCouple.el / volume);
					if (gas) mix.evolveGas(gas, electronMol / 2);
				},
			});
		}
		// Water is oxidised to oxygen once the solution carries an acid family
		// to take up the protons; without one the model has no way to store
		// them. A halide is preferred over water even where water is the
		// thermodynamically easier oxidation, because the model has no oxygen
		// overpotential and would otherwise never show a chlorine evolution.
		const oxygen = this.getRedoxData(water());
		const source = this.protonSource(mix);
		if (oxygen && source && !candidates.some((candidate) => candidate.anion)) {
			candidates.push({
				couple: oxygen,
				potential: oxygen.sep,
				available: Infinity,
				anion: true,
				apply: (electronMol) => {
					// 2 H2O -> O2 + 4 H+ + 4 e-: one proton per electron, booked
					// against the acid family so the vessel stays neutral.
					this.changeFamily(mix, source.family, electronMol / source.protons);
					mix.evolveGas("O2", electronMol / 4);
				},
			});
		}
		return candidates;
	}

	/**
	 * Half-reactions an electrode can run as the cathode of its vessel: a
	 * dissolved cation taking up electrons, or the protons of the solution
	 * forming hydrogen. `anode` decides whether water may be reduced instead,
	 * because that only balances an anode that removes anions.
	 *
	 * @private
	 * @static
	 * @param {ElectricComponent} electrode - the electrode and its vessel
	 * @param {HalfCandidate} anode - the anode half-reaction it is paired with
	 * @returns {HalfCandidate[]}
	 */
	private static cathodeCandidates(electrode: ElectricComponent, anode: HalfCandidate): HalfCandidate[] {
		const mix = electrode._connectedMix;
		if (!mix) return [];
		const candidates: HalfCandidate[] = [];
		const volume = mix._solutionVolume;
		for (const ion of mix._activeMolecules) {
			if (!(ion._totalCharge > 0)) continue;
			const couple = this.getRedoxData(ion);
			if (!couple || couple.ox !== ion.smilesString) continue;
			if ((couple.oxPhase ?? "solution") !== "solution") continue;
			// Same as on the anode: a depleted cation must not block the
			// selection with an availability of zero.
			if (!((mix._molProperties[ion._id + "n"] ?? 0) > 0)) continue;
			candidates.push({
				couple,
				potential: this.nernst(couple.sep, mix, mix._molProperties[ion._id + "c"], couple.el),
				available: (mix._molProperties[ion._id + "n"] ?? 0) * couple.el,
				anion: false,
				apply: (electronMol) => {
					// The reduced metal stays on the electrode: it is a coating
					// on the strip, not a sediment in the vessel.
					const product = this.redoxProduct(ion, -couple.el);
					electrode.plate(product, electronMol / couple.el,
						this.metalBulkLitresPerMol(product, couple));
					mix.changeMolecule(ion._id, -electronMol / couple.el);
				},
			});
		}
		const hydrogen = this.getRedoxData(proton());
		if (!hydrogen) return candidates;
		const potential = this.nernst(hydrogen.sep, mix, this.protonConcentration(mix), hydrogen.el);
		const source = this.protonSource(mix);
		if (source) {
			// The protons are not stored, so the couple is read from the
			// acid-base speciation and booked against the acid family that
			// supplies them: consuming one mole of the family takes its whole
			// proton count out of the solution.
			candidates.push({
				couple: hydrogen,
				potential,
				available: source.family.totalC * source.protons * volume * hydrogen.el,
				anion: false,
				apply: (electronMol) => {
					this.changeFamily(mix, source.family, -electronMol / source.protons);
					mix.evolveGas("H2", electronMol / 2);
				},
			});
		} else if (anode.anion) {
			// 2 H2O + 2 e- -> H2 + 2 OH-. The hydroxide is not a stored species
			// either, so the couple only runs against an anode that removes
			// anions: the vessel's charge balance then turns the missing anion
			// into hydroxide, which is the net
			// 2 NaCl + 2 H2O -> 2 NaOH + Cl2 + H2.
			candidates.push({
				couple: hydrogen,
				potential,
				available: Infinity,
				anion: false,
				apply: (electronMol) => mix.evolveGas("H2", electronMol / 2),
			});
		}
		return candidates;
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
			const oxidation = this.getRedoxData(metal);
			if (!oxidation || oxidation.red !== metal.smilesString) continue;
			for (const ion of mix._activeMolecules) {
				if (ion === metal || !(ion._totalCharge > 0)) continue;
				const reduction = this.getRedoxData(ion);
				if (!reduction || reduction.ox !== ion.smilesString) continue;
				if (!(reduction.sep > oxidation.sep)) continue;
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
		const metals = mix._activeMolecules.filter((molecule) => {
			if (!molecule.dosedAsSolid) return false;
			const couple = this.getRedoxData(molecule);
			return couple !== undefined && couple.red === molecule.smilesString && couple.sep < 0;
		});
		if (metals.length === 0) return false;
		const volume = mix._solutionVolume;
		const { systems, spectatorCharge } = this.acidBaseComposition(mix);
		const H = AcidBase.solveProton(systems, spectatorCharge, AcidBase.kwAt(mix._temperature),
			this.complexChargeHook(systems));
		// only an acidic solution attacks a metal
		if (!(H > 1e-7)) return false;
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
			const couple = this.getRedoxData(metal);
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

		return { systems, spectatorCharge };
	}

}
