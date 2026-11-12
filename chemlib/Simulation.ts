import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { ElectricComponent, EComponentType } from "./ElectricComponent";
import { ComponentManager } from "./ComponentManager";
import { AcidBase, AcidBaseSystem } from "./AcidBase";

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
		if (!cMixture._isSolution) {
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
				if (parts && this.sEquilibriumSalt(cMixture, salt, parts[0], parts[1])) {
					changed = true;
				}
			}
		} while (changed);
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
				: StructureManager._moleculeData["salt"][cMolecule.smilesString]["pkl"];
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
		if (!sMix._isSolution || sMix._solutionVolume <= 0) {
			return 7.0;
		}

		const acidbaseData: object = StructureManager._moleculeData["acidbase"];

		const systems: AcidBaseSystem[] = [];
		// data key (protonated-acid SMILES) -> index of its system in `systems`,
		// so every protonation state of one acid family lands in a single system
		const familyIndex: { [key: string]: number } = {};
		// conjugate-species SMILES -> the data key of the acid family it belongs
		// to, so a conjugate supplied on its own (buffer anion, or the anion of a
		// dissolving salt) is folded into that family instead of being treated as
		// an unrelated spectator ion
		const conjugateToFamily: { [smiles: string]: string } = {};
		let spectatorCharge: number = 0;

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
			protonatedCharge: number
		): AcidBaseSystem => {
			let idx: number = familyIndex[key];
			if (idx === undefined) {
				idx = systems.length;
				familyIndex[key] = idx;
				systems.push({
					totalC: 0,
					pKa: pKaList(acidbaseData[key]),
					protonatedCharge: protonatedCharge,
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
				for (const c of conjList) {
					conjugateToFamily[c] = key;
				}
			}
		}

		// pass 1: molecules that are themselves listed acids or bases
		sMix._activeMolecules.forEach((molecule) => {
			const smiles: string = molecule.smilesString;
			const entry: object = acidbaseData[smiles];
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
			familyFor(smiles, protonatedCharge).totalC += conc(molecule);

			// map the actual conjugate base so a buffer built from this acid plus
			// its conjugate salt folds into the same family
			if (!entry["base"] && parts != undefined) {
				const conjugate: Molecule =
					parts[0].smilesString === "[H+]" ? parts[1] : parts[0];
				if (conjugate != undefined && conjugate.smilesString != "") {
					conjugateToFamily[conjugate.smilesString] = smiles;
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

			const familyKey: string = conjugateToFamily[smiles];
			if (familyKey != undefined) {
				// every parent acid in the data is neutral when fully protonated,
				// so a family created here has protonatedCharge 0
				familyFor(familyKey, 0).totalC += conc(molecule);
			} else {
				spectatorCharge += molecule._totalCharge * conc(molecule);
			}
		});

		const pH: number = AcidBase.pH(systems, spectatorCharge);
		return Math.round(pH * 1000) / 1000;
	}

}
