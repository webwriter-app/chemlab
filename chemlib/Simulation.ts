import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";
import { saltSolubility } from "./saltSolubility";
import { complexFormation } from "./complexes";

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

type AcidBaseFamily = AcidBaseSystem & { representative: Molecule; step: number; members: Molecule[] };

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

		// Salts still dissociate explicitly into their ions, which feed the
		// solubility model and the electrochemistry code. Iterate until the
		// dissolution has stabilised.
		let changed: boolean;
		do {
			changed = false;
			const salts = cMixture._activeMolecules.filter((molecule) => StructureManager.isSalt(molecule));
			for (const salt of salts) {
				const parts = this.cacheDissociation(salt);
				if (parts && this.registerSolidSalt(cMixture, salt, parts)) {
					changed = true;
					continue;
				}
				if (parts && this.sEquilibriumSalt(cMixture, salt, parts[0], parts[1])) {
					changed = true;
				}
			}
		} while (changed);
		this.equilibrateSalts(cMixture);
		// Hydroxides consume cations, which shifts the other salt equilibria.
		if (this.equilibrateHydroxides(cMixture)) this.equilibrateSalts(cMixture);
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

	private static registerSolidSalt(mix: Mixture, molecule: Molecule, ions: [Molecule, Molecule]): boolean {
		const pair = ions[0]._totalCharge > 0 ? ions : [ions[1], ions[0]] as const;
		const salt = saltEquilibria.find(({ cation, anion }) =>
			pair[0].smilesString === cation && pair[1].smilesString === anion);
		if (!salt) return false;
		const amount = mix._molProperties[molecule._id + "n"];
		mix.remMolecule(molecule._id);
		const existing = mix._activeMolecules.find((item) => item.solidSaltFormula === salt.formula);
		mix.addMolecule(existing ?? this.makeSolidSalt(salt.formula, pair, [salt.cations, salt.anions]), amount);
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

	private static equilibrateSalts(mix: Mixture): void {
		const volume = mix._solutionVolume;
		const acidbaseData = StructureManager._moleculeData["acidbase"];
		// Acids stay whole, so their conjugate anions only exist as computed
		// speciation; {@link saltIons} exposes those too.
		if (!mix._activeMolecules.some((item) => item._totalCharge || item.solidSaltFormula ||
			acidbaseData[item.smilesString] !== undefined)) return;
		const solids = new Map(mix._activeMolecules.filter((item) => item.solidSaltFormula)
			.map((item) => [item.solidSaltFormula, item]));
		for (let pass = 0; pass < 32; pass++) {
			const ions = this.saltIons(mix);
			let changed = false;
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
			if (!changed) break;
		}
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
	 * @returns {({ red: string; ox: string; el: number; sep: number; density: number } | undefined)}
	 */
	public static getRedoxData(
		molecule: Molecule
	): { red: string; ox: string; el: number; sep: number; density: number } | undefined {
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
		type HalfReaction = NonNullable<ReturnType<typeof Simulation.getRedoxData>>;
		let reaction: {
			anode: Mixture; cathode: Mixture; material: Molecule; cathodeIon: Molecule;
			oxidation: HalfReaction; reduction: HalfReaction; voltage: number;
		} | undefined;

		// Nernst: E = E° + RT/(zF) * ln(activity of the oxidised form). The term
		// belongs in the pair selection, not only in the display, because a
		// concentration cell has equal standard potentials on both sides and
		// its whole voltage comes from the two activities differing.
		const potential = (standard: number, mix: Mixture, ion: Molecule | undefined, electrons: number) => {
			const concentration = ion ? mix._molProperties[ion._id + "c"] : undefined;
			const activity = Number.isFinite(concentration) && concentration > 0 ? concentration : 1;
			return standard + this._gasConst * mix._temperature / (electrons * this._faradayConst) * Math.log(activity);
		};

		for (const [anodeElectrode, cathodeElectrode] of [[sElectrode1, sElectrode2], [sElectrode2, sElectrode1]]) {
			const material = anodeElectrode._material;
			const oxidation = material && this.getRedoxData(material);
			if (!oxidation || material.smilesString !== oxidation.red) continue;
			const anode = anodeElectrode._connectedMix;
			const cathode = cathodeElectrode._connectedMix;
			const anodeIon = anode._activeMolecules.find((molecule) => molecule.smilesString === oxidation.ox);
			for (const cathodeIon of cathode._activeMolecules) {
				if (cathodeIon._totalCharge <= 0) continue;
				const reduction = this.getRedoxData(cathodeIon);
				if (!reduction || cathodeIon.smilesString !== reduction.ox) continue;
				const voltage = potential(reduction.sep, cathode, cathodeIon, reduction.el) -
					potential(oxidation.sep, anode, anodeIon, oxidation.el);
				if (bElectrolysis) {
					if (voltage > 0 || !(sDevice._sourceVoltage >= -voltage) ||
						(reaction && voltage <= reaction.voltage)) continue;
				} else if (voltage <= 0 || (reaction && voltage <= reaction.voltage)) continue;
				reaction = { anode, cathode, material, cathodeIon, oxidation, reduction, voltage };
			}
		}
		if (!reaction) return;
		const { anode, cathode, material, cathodeIon, oxidation, reduction, voltage } = reaction;
		const zAnode = oxidation.el;
		const zCathode = reduction.el;
		const current = sDevice._sourceCurrent;
		const electronMol = Math.min(
			current * this._simTimeStep / this._faradayConst,
			cathode._molProperties[cathodeIon._id + "n"] * zCathode
		);
		if (!(electronMol > 0)) return;

		if (!bElectrolysis) sDevice._visibleVoltage = Math.max(0, voltage);

		const anodeAtom = material._atoms[0];
		const cathodeAtom = cathodeIon._atoms[0];
		const anodeProduct = StructureManager.newMolecule();
		anodeProduct.addAtom(anodeAtom.getName().toLowerCase(), anodeAtom.getSymbol(), zAnode);
		anode.addMolecule(anodeProduct, electronMol / zAnode);
		const cathodeProduct = StructureManager.newMolecule();
		cathodeProduct.addAtom(cathodeAtom.getName().toLowerCase(), cathodeAtom.getSymbol(), cathodeIon._totalCharge - zCathode);
		cathode.addMolecule(cathodeProduct, electronMol / zCathode);
		cathode.changeMolecule(cathodeIon._id, -electronMol / zCathode);
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
		{ density }: { density: number }
	): number {
		return density > 0 ? molecule.getTotMolMass() / (density * 1000) : 0;
	}

	/**
	 * Dissoziation of salts: Returns true because salts dissoziate completely
	 *
	 * @private
	 * @static
	 * @param {Mixture} sMix - the current solution
	 * @param {Molecule} cMolecule - the undissoziated salt molecule
	 * @param {Molecule} pMolecule1 - one ion, cation or anion
	 * @param {Molecule} pMolecule2 - one ion, cation or anion
	 * @returns {boolean}
	 */
	private static sEquilibriumSalt(
		sMix: Mixture,
		cMolecule: Molecule,
		pMolecule1: Molecule,
		pMolecule2: Molecule
	): boolean {
		var nMolC: number =
			sMix._molProperties[cMolecule._id + "n"] === undefined
				? 0
				: sMix._molProperties[cMolecule._id + "n"];
		var cMolP1: number =
			sMix._molProperties[pMolecule1._id + "c"] === undefined
				? 0
				: sMix._molProperties[pMolecule1._id + "c"];
		var cMolP2: number =
			sMix._molProperties[pMolecule2._id + "c"] === undefined
				? 0
				: sMix._molProperties[pMolecule2._id + "c"];
		var molPKl: number =
			StructureManager._moleculeData["salt"][cMolecule.smilesString] ===
			undefined
				? -1
			: StructureManager._moleculeData["salt"][cMolecule.smilesString]["pKL"];
		var molKl: number = Math.pow(10, -molPKl);

		const deficit = molKl - cMolP1 * cMolP2;
		if (deficit <= 0 || nMolC <= 0 || sMix._solutionVolume <= 0) return false;
		const sum = cMolP1 + cMolP2;
		const concentration = 2 * deficit / (Math.sqrt(sum * sum + 4 * deficit) + sum);
		const amount = Math.min(concentration * sMix._solutionVolume, nMolC);
		if (!(amount > 0)) return false;
		sMix.addMolecule(pMolecule1, amount);
		sMix.addMolecule(pMolecule2, amount);
		sMix.changeMolecule(cMolecule._id, -amount);
		// release the bulk volume of the dissolved portion, keeping the dosed
		// solid volume consistent with what actually stays solid
		const cation = pMolecule1._totalCharge > 0 ? pMolecule1 : pMolecule2;
		const anion = cation === pMolecule1 ? pMolecule2 : pMolecule1;
		const entry = saltEquilibria.find(({ cation: c, anion: a }) =>
			cation.smilesString === c && anion.smilesString === a);
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
