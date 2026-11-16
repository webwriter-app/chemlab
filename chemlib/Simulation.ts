import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";
import { saltSolubility } from "./saltSolubility";

const saltEquilibria = Object.entries(saltSolubility).map(([formula, data]) => {
	const [cation, anion, cations = 1, anions = 1] = data.ions;
	const product = data.ksp ?? (cations * data.saturation) ** cations * (anions * data.saturation) ** anions;
	return { formula, cation, anion, cations, anions, product };
}).sort((a, b) => a.product - b.product);

function saltIonProduct(positive: number, negative: number, cations: number, anions: number): number {
	return Math.max(0, positive) ** cations * Math.max(0, negative) ** anions;
}

type AcidBaseFamily = AcidBaseSystem & { representative: Molecule; step: number; members: Molecule[] };

export interface AcidEquilibriumSpecies {
	formula: string;
	charge: number;
	amount: number;
	concentration: number;
	/** Share of its acid family; solvent ions do not belong to a displayed family. */
	fraction?: number;
	/** A representative structure for this protonation state, built only when drawn. */
	structure: () => Molecule | undefined;
}

// Draw a representative structure for each macroscopic protonation state.
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
			const sites = [...atoms].filter((atom) => ["O", "S"].includes(atom.getSymbol())).flatMap((site) => {
				const links = neighbors(site);
				const hydrogen = links.find(({ atom }) => atom.getSymbol() === "H" && atoms.has(atom))?.atom;
				if (!hydrogen) return [];
				// Prefer carboxyl protons over alcohol protons (e.g. citric acid).
				const carboxyl = links.some(({ atom }) => atom.getSymbol() === "C" &&
					neighbors(atom).some(({ atom, order }) => atom.getSymbol() === "O" && order === 2));
				return [{ site, hydrogen, carboxyl }];
			}).sort((a, b) => Number(b.carboxyl) - Number(a.carboxyl));
			if (!sites.length) { cache.set(removed, undefined); return; }
			const { site, hydrogen } = sites[0];
			atoms.delete(hydrogen);
			charges.set(site, charges.get(site) - 1);
		} else {
			const site = [...atoms].find((atom) => ["O", "S"].includes(atom.getSymbol()) && charges.get(atom) < 0);
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
		const salt = saltEquilibria.find(({ cation, anion, cations, anions }) =>
			cations === 1 && anions === 1 && pair[0].smilesString === cation && pair[1].smilesString === anion);
		if (!salt) return false;
		const amount = mix._molProperties[molecule._id + "n"];
		mix.remMolecule(molecule._id);
		const existing = mix._activeMolecules.find((item) => item.solidSaltFormula === salt.formula);
		mix.addMolecule(existing ?? this.makeSolidSalt(salt.formula, pair, [1, 1]), amount);
		return true;
	}

	private static equilibrateSalts(mix: Mixture): void {
		const volume = mix._solutionVolume;
		const ions = new Map(mix._activeMolecules.filter((item) => item._totalCharge !== 0)
			.map((item) => [item.smilesString, item]));
		const solids = new Map(mix._activeMolecules.filter((item) => item.solidSaltFormula)
			.map((item) => [item.solidSaltFormula, item]));
		if (!ions.size && !solids.size) return;
		for (let pass = 0; pass < 32; pass++) {
			let changed = false;
			for (const { formula, cation, anion, cations, anions, product } of saltEquilibria) {
				const positive = ions.get(cation);
				const negative = ions.get(anion);
				const solid = solids.get(formula);
				if ((!positive || !negative) && !solid) continue;
				const p = positive ? mix._molProperties[positive._id + "n"] / volume : 0;
				const n = negative ? mix._molProperties[negative._id + "n"] / volume : 0;
				const ionProduct = (delta: number) =>
					saltIonProduct(p + delta * cations, n + delta * anions, cations, anions);
				const current = ionProduct(0);
				if (Math.abs(current - product) <= product * 1e-8) continue;
				const available = solid ? mix._molProperties[solid._id + "n"] / volume : 0;
				let low = current > product ? -Math.min(p / cations, n / anions) : 0;
				let high = current > product ? 0 : available;
				if (low === high) continue;
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
					const positiveIon = positive ?? solid.solidSaltIons[0];
					const negativeIon = negative ?? solid.solidSaltIons[1];
					mix.addMolecule(positiveIon, amount * cations);
					mix.addMolecule(negativeIon, amount * anions);
					ions.set(cation, positiveIon);
					ions.set(anion, negativeIon);
					mix.changeMolecule(solid._id, -amount);
					if (!mix._molProperties[solid._id + "n"]) solids.delete(formula);
					// the dissolved bulk no longer occupies its solid volume
					mix.addedVolume = Math.max(0, mix.addedVolume -
						this.bulkLitresPerMol({ formula, cations, anions }, positiveIon, negativeIon) * amount);
				} else {
					mix.changeMolecule(positive._id, amount * cations);
					mix.changeMolecule(negative._id, amount * anions);
					if (!mix._molProperties[positive._id + "n"]) ions.delete(cation);
					if (!mix._molProperties[negative._id + "n"]) ions.delete(anion);
					const deposit = solid ?? this.makeSolidSalt(formula, [positive, negative], [cations, anions]);
					mix.addMolecule(deposit, -amount);
					solids.set(formula, deposit);
					// newly settled solid takes up its bulk volume again
					mix.addedVolume += this.bulkLitresPerMol({ formula, cations, anions }, positive, negative) * -amount;
				}
				changed = true;
			}
			if (!changed) break;
		}
	}

	/** Read-only fraction of saturation for the modeled salt closest to its limit. */
	public static getSaltSaturation(mix: Mixture): { formula: string; fraction: number } | undefined {
		const volume = mix._solutionVolume;
		if (!mix._isSolution || !(volume > 0)) return;
		const concentrations = new Map<string, number>();
		for (const ion of mix._activeMolecules) {
			if (!ion._totalCharge || ion.solidSaltFormula) continue;
			const moles = mix._molProperties[ion._id + "n"];
			if (moles > 0 && Number.isFinite(moles)) concentrations.set(ion.smilesString, moles / volume);
		}
		let closest: { formula: string; fraction: number } | undefined;
		for (const { formula, cation, anion, cations, anions, product } of saltEquilibria) {
			const positive = concentrations.get(cation);
			const negative = concentrations.get(anion);
			if (positive === undefined || negative === undefined) continue;
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
	 * @returns {({ red: string; ox: string; el: number; sep: number } | undefined)}
	 */
	public static getRedoxData(
		molecule: Molecule
	): { red: string; ox: string; el: number; sep: number } | undefined {
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

		for (const [anodeElectrode, cathodeElectrode] of [[sElectrode1, sElectrode2], [sElectrode2, sElectrode1]]) {
			const material = anodeElectrode._material;
			const oxidation = material && this.getRedoxData(material);
			if (!oxidation || material.smilesString !== oxidation.red) continue;
			const anode = anodeElectrode._connectedMix;
			const cathode = cathodeElectrode._connectedMix;
			for (const cathodeIon of cathode._activeMolecules) {
				if (cathodeIon._totalCharge <= 0) continue;
				const reduction = this.getRedoxData(cathodeIon);
				if (!reduction || cathodeIon.smilesString !== reduction.ox) continue;
				const voltage = reduction.sep - oxidation.sep;
				if (bElectrolysis) {
					if (voltage > 0 || !(sDevice._sourceVoltage >= -voltage) ||
						(reaction && voltage <= reaction.voltage)) continue;
				} else if (voltage <= 0 || (reaction && voltage <= reaction.voltage)) continue;
				reaction = { anode, cathode, material, cathodeIon, oxidation, reduction, voltage };
			}
		}
		if (!reaction) return;
		const { anode, cathode, material, cathodeIon, oxidation, reduction } = reaction;
		const zAnode = oxidation.el;
		const zCathode = reduction.el;
		const current = sDevice._sourceCurrent;
		const electronMol = Math.min(
			current * this._simTimeStep / this._faradayConst,
			cathode._molProperties[cathodeIon._id + "n"] * zCathode
		);
		if (!(electronMol > 0)) return;

		if (!bElectrolysis) {
			const anodeIon = anode._activeMolecules.find((molecule) => molecule.smilesString === oxidation.ox);
			const potential = (standard: number, mix: Mixture, ion: Molecule | undefined, electrons: number) => {
				const concentration = ion ? mix._molProperties[ion._id + "c"] : undefined;
				const activity = Number.isFinite(concentration) && concentration > 0 ? concentration : 1;
				return standard + this._gasConst * mix._temperature / (electrons * this._faradayConst) * Math.log(activity);
			};
			sDevice._visibleVoltage = Math.max(0,
				potential(reduction.sep, cathode, cathodeIon, zCathode) -
				potential(oxidation.sep, anode, anodeIon, zAnode));
		}

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
	 * neutralizes H+ ions and OH- ions and adds water accordingly: Returns the molar amount if neutralized ions
	 *
	 * @public
	 * @static
	 * @param {Mixture} sMix - the current solution
	 * @returns {number}
	 */
	public static sNeutralize(sMix: Mixture): number {
		let iWater: number, mH: Molecule, mOH: Molecule, cH: number, cOH: number;
		sMix._activeMolecules.forEach((molecule) => {
			if (molecule.smilesString === "[H+]") {
				mH = molecule;
				cH = sMix._molProperties[molecule._id + "c"];
			} else if (molecule.smilesString === "[OH-]") {
				mOH = molecule;
				cOH = sMix._molProperties[molecule._id + "c"];
			} else if (StructureManager.isWater(molecule)) {
				iWater = molecule._id;
			}
		});

		if (mH != undefined && mOH != undefined) {
			var nNeutralize = Math.min(
				cH * sMix._solutionVolume,
				cOH * sMix._solutionVolume
			);

			sMix.addMolecule(mH, -nNeutralize);
			sMix.addMolecule(mOH, -nNeutralize);
			sMix.changeMolecule(iWater, nNeutralize);
		}

		return nNeutralize == null ? 0 : nNeutralize;
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
		return Math.round(AcidBase.pH(systems, spectatorCharge) * 1000) / 1000;
	}

	/** Read-only equilibrium view of modeled polyprotic families; stored amounts remain analytical totals. */
	public static getPolyproticEquilibrium(sMix: Mixture): {
		pH: number; species: AcidEquilibriumSpecies[]; analyticalMolecules: Set<Molecule>;
	} {
		const { systems, spectatorCharge } = this.acidBaseComposition(sMix);
		const H = AcidBase.solveProton(systems, spectatorCharge);
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
			AcidBase.speciesFractions(family, H).forEach((fraction, step) => {
				const concentration = family.totalC * fraction;
				const charge = family.protonatedCharge - step;
				const formula = symbols.map((symbol) => {
					const count = symbol === "H" ? protonatedHydrogens - step : elements.get(symbol);
					return count > 0 ? symbol + subscript(count) : "";
				}).join("") + superscript(charge);
				species.push({ formula, charge, fraction, concentration, amount: concentration * volume,
					structure: () => protonationStructure(family.representative, step - family.step) });
			});
		}
		// Water ions are listed for every solution: hydroxide bases only act
		// through spectator charge, so without them OH- would stay invisible.
		const OH = AcidBase.Kw / H;
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
			const conjList = acidbaseData[key]["conj"];
			if (Array.isArray(conjList)) {
				for (const [index, aliases] of conjList.entries()) {
					for (const alias of Array.isArray(aliases) ? aliases : [aliases]) {
						conjugateToFamily[alias] = { key, step: index + 1 };
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
