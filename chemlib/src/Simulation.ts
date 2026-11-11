import { Mixture } from "./Mixture";
import { StructureManager } from "./StructureManager";
import { Molecule } from "./Molecule";
import { ElectricComponent } from "./ElectricComponent";
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
		var bRepeat: number = 0;
		var n: number = 1;
		while (bRepeat < n) {
			bRepeat = 0;

			var toDissolve: Array<Molecule> = [];
			cMixture._activeMolecules.forEach((molecule) => {
				if (StructureManager.isSalt(molecule)) {
					toDissolve.push(molecule);
				}
			});

			n = toDissolve.length;
			toDissolve.forEach((cMolecule) => {
				var parts: [Molecule, Molecule] = this.cacheDissociation(cMolecule);
				if (parts === undefined) {
					return;
				}
				bRepeat = this.sEquilibriumSalt(
					cMixture,
					cMolecule,
					parts[0],
					parts[1]
				)
					? bRepeat + 1
					: bRepeat;
			});
		}
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
		if (
			!ComponentManager.isConnected(sElectrode1, sElectrode2) ||
			!sElectrode1._connectedMix._isSolution ||
			!sElectrode2._connectedMix._isSolution
		) {
			return;
		}

		var bElectrolysis = sDevice._type === "source";
		var sElectrodeCathode: ElectricComponent,
			sElectrodeAnode: ElectricComponent;
		var eDataRed: object,
			eDataOx: object

		let voltage: number = bElectrolysis ? Number.MAX_SAFE_INTEGER : 0
		sElectrode1._connectedMix._activeMolecules.forEach(mol1 =>{
			sElectrode2._connectedMix._activeMolecules.forEach(mol2 =>{
				let mol1in: boolean = false
				let mol2in: boolean = false
				let mol1entry, mol2entry
				Object.keys(StructureManager._moleculeData["redox"]).forEach(key =>{
					let entry = StructureManager._moleculeData["redox"][key]
					// console.log(entry, mol1, mol2)
					if(entry["red"] === mol1.smilesString || entry["ox"] === mol1.smilesString){
						mol1in = true
						mol1entry = entry
					}
					if(entry["red"] === mol2.smilesString || entry["ox"] === mol2.smilesString){
						mol2in = true
						mol2entry = entry
					}
				})
				// console.log(mol1entry, mol2entry)
				if(mol1in && mol2in){
					// console.log("found")
					if(bElectrolysis){
						if(Math.abs(mol1entry["sep"]-mol2entry["sep"]) < voltage){
							voltage = Math.abs(mol1entry["sep"]-mol2entry["sep"])
							if(mol1entry["sep"] > mol2entry["sep"]){
								sElectrodeCathode = sElectrode2
								eDataRed = mol2entry
								sElectrodeAnode = sElectrode1
								eDataOx = mol2entry
							}else{
								sElectrodeCathode = sElectrode1
								eDataRed = mol1entry
								sElectrodeAnode = sElectrode2
								eDataOx = mol2entry
							}
						}
					}else{
						if(Math.abs(mol1entry["sep"]-mol2entry["sep"]) > voltage){
							// console.log("drin", Math.abs(mol1entry["sep"]-mol2entry["sep"]))
							voltage = Math.abs(mol1entry["sep"]-mol2entry["sep"])
							if(mol1entry["sep"] < mol2entry["sep"]){
								sElectrodeCathode = sElectrode2
								eDataRed = mol2entry
								sElectrodeAnode = sElectrode1
								eDataOx = mol1entry
							}else{
								sElectrodeCathode = sElectrode1
								eDataRed = mol1entry
								sElectrodeAnode = sElectrode2
								eDataOx = mol2entry
							}
						}
					}
				}
			})
		})
			

		var sMixAnode: Mixture = sElectrodeAnode._connectedMix;
		var sMixCathode: Mixture = sElectrodeCathode._connectedMix;

		let MixAnodeIons: Molecule[] = [];
		let MixCathodeIons: Molecule[] = [];

		for (let molecule of sMixAnode._activeMolecules) {
			if (molecule._totalCharge != 0) {
				MixAnodeIons.push(molecule);
			}
		}
		for (let molecule of sMixCathode._activeMolecules) {
			if (molecule._totalCharge != 0) {
				MixCathodeIons.push(molecule);
			}
		}

		let eMaterialAnode: Molecule = sElectrodeAnode._material;

		let nProdAnode: Molecule = StructureManager.newMolecule();
		nProdAnode.addAtom(
			eMaterialAnode._atoms[0]._element["name"].toLowerCase(),
			eMaterialAnode._atoms[0]._element["symbol"],
			eMaterialAnode._totalCharge + eDataOx["el"]
		);
		sMixAnode.addMolecule(nProdAnode, 1e-7);

		let nProdAnodeMixId: number;
		for (let ion of MixAnodeIons) {
			if (ion.smilesString === nProdAnode.smilesString) {
				nProdAnodeMixId = ion._id;
			}
		}

		let eCorrIon: Molecule;
		let eVoltage: number = bElectrolysis ? sDevice._sourceVoltage : 0;

		for (let ion of MixCathodeIons) {
			if(eDataRed["ox"] === ion.smilesString){
				eCorrIon = ion
			}
		}

			if (bElectrolysis) {
				if (
					eDataRed["sep"] < eDataOx["sep"] &&
					eDataOx["sep"] - eDataRed["sep"] < eVoltage
				) {
					eVoltage = Math.abs(
						eDataOx["sep"] -
							((this._gasConst * sMixAnode._temperature) /
								(eDataOx["el"] * this._faradayConst)) *
								Math.log(
									1 / StructureManager._moleculeData[nProdAnode._id + "c"] ==
										null
										? 0
										: StructureManager._moleculeData[nProdAnodeMixId + "c"]
								) -
							(eDataRed["sep"] -
								((this._gasConst * sMixCathode._temperature) /
									(eDataRed["el"] * this._faradayConst)) *
									Math.log(StructureManager._moleculeData[eCorrIon._id + "c"]))
					);
				}
			} else {
				if (
					eDataRed["sep"] > eDataOx["sep"] &&
					eDataRed["sep"] - eDataOx["sep"] > eVoltage
				) {
					eVoltage = Math.abs(
						eDataOx["sep"] -
							((this._gasConst * sMixAnode._temperature) /
								(eDataOx["el"] * this._faradayConst)) *
								Math.log(1 / sMixAnode._molProperties[nProdAnodeMixId + "c"]) -
							(eDataRed["sep"] -
								((this._gasConst * sMixCathode._temperature) /
									(eDataRed["el"] * this._faradayConst)) *
									Math.log(1 / sMixCathode._molProperties[eCorrIon._id + "c"]))
					);
				}
			}

		if (eCorrIon != undefined) {
			let zAnode: number = eDataOx["el"];
			let zCathode: number = StructureManager._moleculeData["redox"][
				eCorrIon.getTotMolMass().toString()
			]["el"];

			// Faraday's 1st law: moles of electrons transferred, n_e = Q/F = I*t/F.
			// The same current flows through the whole series circuit, so this is
			// shared by both electrodes - each one's own conversion is then
			// n_e/z (Faraday's 2nd law), independently, with no LCM balancing
			// needed (that's only for balancing a discrete stoichiometric
			// equation, not for splitting a continuous charge flow).
			let electronMol: number =
				((!bElectrolysis ? 0.5 : sDevice._sourceCurrent) * this._simTimeStep) /
				this._faradayConst;

			// can't consume more cathode ions than are actually present
			electronMol = Math.min(
				electronMol,
				sElectrodeCathode._connectedMix._molProperties[eCorrIon._id + "n"] *
					zCathode
			);

			sMixAnode.addMolecule(nProdAnode, electronMol / zAnode);

			let nProdCathode: Molecule = StructureManager.newMolecule();
			nProdCathode.addAtom(
				eCorrIon._atoms[0]._element["name"].toLowerCase(),
				eCorrIon._atoms[0]._element["symbol"],
				eCorrIon._totalCharge - zCathode
			);
			sMixCathode.addMolecule(nProdCathode, electronMol / zCathode);
			sMixCathode.changeMolecule(eCorrIon._id, -electronMol / zCathode);
		}

		if (!bElectrolysis) {
			sDevice._visibleVoltage = eVoltage;
		}
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

		if (cMolP1 * cMolP2 < molKl) {
			var nDiff: number = Math.min(
				Math.sqrt(molKl - cMolP1 * cMolP2) * sMix._solutionVolume,
				nMolC
			);

			sMix.addMolecule(pMolecule1, nDiff);
			sMix.addMolecule(pMolecule2, nDiff);
			sMix.changeMolecule(cMolecule._id, -nDiff);
		}

		return nDiff < 1e-5;
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
