import { Molecule } from "./Molecule";
import { Atom } from "./Atom";
import { Mixture } from "./Mixture";
import { Kekule } from "./kekule";

import { lookupCompound } from "./PubChem";

/**
 * Static management class for {@link Mixture} and {@link Molecule} objects
 *
 * @export
 * @abstract
 * @class StructureManager
 * @typedef {StructureManager}
 */
export abstract class StructureManager {
	/**
	 * The number of current {@link Molecule} objects minus one
	 *
	 * @static
	 * @type {number}
	 */
	static _moleculeCount: number = -1;
	/**
	 * The number of current {@link Mixture} objects minus one
	 *
	 * @static
	 * @type {number}
	 */
	static _mixtureCount: number = -1;

	/**
	 * Json object containing molecule specific information. The keys are SMILES strings
	 *
	 * @static
	 * @type {Object}
	 */
	static _moleculeData: Object = {
		solvent: {
			water: "O",
		},
		// Acid/base characterisation consumed by Simulation.getpH.
		//   pks:  successive acid dissociation constants pKa1, pKa2, ... ordered
		//         most-acidic-proton first. A bare number is treated as a single
		//         pKa (monoprotic). Polyprotic acids list every ionisable proton.
		//   base: true when the KEY molecule is the neutral base form of a
		//         molecular base (e.g. NH3); pks then holds the pKa of its
		//         conjugate acid (NH4+), and its protonated charge is the key
		//         charge plus the number of protons it can accept.
		//   conj: conjugate SMILES by deprotonation step; a step can have several
		//         equivalent SMILES. These species can also enter from a salt.
		//         A base lists its protonated acid here as step 0.
		//   alias: alternate SMILES for the same stored acid/base form.
		//   step: stored form's protonation step for an ampholyte.
		// SMILES are matched as strings, and Molecule.setSmilesString writes the
		// heavy-atom skeleton in Kekule's own atom order. Every entry therefore
		// lists the hand-written form and the form the code generates for the
		// same species, so a stored ion is recognised whichever way it was built.
		acidbase: {
			"Cl": { "pks": -6 },
			"CC(O)=O": { "pks": 4.75, "conj": [["CC(=O)[O-]", "CC([O-])=O", "[O-]C(C)=O", "[O-]C(=O)C", "O=C(C)[O-]"]] },
			"OS(=O)(=O)O": { "alias": "O=S(O)(O)=O" },
			"O=S(O)(O)=O": { "pks": [-3, 1.99], "conj": [
				["[O-]S(=O)(=O)O", "[O-]S(=O)(O)=O"], ["[O-]S(=O)(=O)[O-]"],
			] },
			"O=CO": { "pks": 3.77, "conj": [["[O-]C=O", "O=C[O-]"]] },
			"CCC(O)=O": { "pks": 4.87, "conj": [["CCC(=O)[O-]", "CCC([O-])=O", "[O-]C(=O)CC"]] },
			"O=C(O)C(O)C": { "pks": 3.86, "conj": [["CC(O)C(=O)[O-]", "[O-]C(=O)C(O)C", "O=C([O-])C(O)C"]] },
			"O=C(O)C(O)=O": { "pks": [1.25, 4.27], "conj": [
				["[O-]C(=O)C(O)=O", "O=C(O)C(=O)[O-]", "O=C(O)C([O-])=O"],
				["[O-]C(=O)C(=O)[O-]", "[O-]C(=O)C([O-])=O", "O=C([O-])C(=O)[O-]"],
			] },
			// Tartaric acid. Its dianion is the anion the solubility table lists for
			// potassium sodium tartrate, so the tartrate of that stock folds into
			// this family and the double salt reacts basic (about pH 8.7 at
			// 0.1 mol/L) instead of acting as a spectator. The first alias is the
			// form the table names, the others are the hand-written orientations
			// Kekule regenerates for the same structure.
			"O=C(O)C(O)C(O)C(O)=O": { "pks": [2.98, 4.34], "conj": [
				["[O-]C(=O)C(O)C(O)C(O)=O", "O=C(O)C(O)C(O)C(=O)[O-]", "O=C(O)C(O)C(O)C([O-])=O"],
				["[O-]C(=O)C(O)C(O)C(=O)[O-]", "O=C([O-])C(O)C(O)C(=O)[O-]"],
			] },
			"O=C(O)CC(O)(C(O)=O)CC(O)=O": { "pks": [3.13, 4.76, 6.40] },
			"[Na]O": { "pks": -0.56 },
			"CC(=O)O": { "alias": "CC(O)=O" },
			"C1=CC=C(C=C1)C(=O)O": { "pks": 4.19 },
			"O=C(O)C(C(=O)O)C(=O)O": { "pks": [3.13, 4.76, 6.40] },
			"C(C(=O)O)C(=O)O": { "pks": [2.83, 5.69] },
			"N#CC(=O)O": { "pks": 4.62 },
			"C(C(=O)O)N": { "alias": "NCC(O)=O" },
			"O=C(C)O": { "alias": "CC(O)=O" },
			"NCC(=O)O": { "alias": "NCC(O)=O" },
			"[NH3+]CC(=O)[O-]": { "alias": "NCC(O)=O" },
			"[N+]CC([O-])=O": { "alias": "NCC(O)=O" },
			// Glycine: glycinium, zwitterion (stored neutral), glycinate.
			// https://doi.org/10.1002/anie.202014133
			"NCC(O)=O": { "pks": [2.34, 9.58], "step": 1, "conjOffset": 0, "conj": [
				["[NH3+]CC(=O)O", "[N+]CC(O)=O", "[N+]CC(=O)O"],
				[],
				["NCC(=O)[O-]", "NCC([O-])=O", "[O-]C(=O)CN"],
			] },
			"[N+](=O)(O)[O-]": { "pks": -1.3 },
			"OP(=O)(O)O": { "alias": "O=P(O)(O)O" },
			"O=P(O)(O)O": { "pks": [2.15, 7.21, 12.35], "conj": [
				["[O-]P(=O)(O)O", "[O-]P(O)(O)=O"], ["[O-]P(=O)(O)[O-]"],
				["[PO4-3]", "[O-]P(=O)([O-])[O-]", "[O-]P([O-])(=O)[O-]"],
			] },
			"F": { "pks": 3.17, "conj": ["[F-]"] },
			"O=C(O)O": { "alias": "C(=O)(O)O" },
			"C(=O)(O)O": { "pks": [6.35, 10.33], "conj": [
				["[O-]C(=O)O", "[O-]C(O)=O"], ["[CO3-2]", "[O-]C(=O)[O-]"],
			] },
			"S": { "pks": [7.0, 12.9], "conj": [["[SH-]", "[S-]"], ["[S-2]", "[S2-]"]] },
			"OB(O)O": { "alias": "B(O)(O)O" },
			"B(O)(O)O": { "pks": 9.24, "conj": [["[B-](O)(O)(O)O", "O[B-](O)(O)O"]] },
			"[K]O": { "pks": -1.1 },
			"N": { "pks": 9.25, "base": true, "conj": ["[N+]", "[NH4+]"] },
			// Cation hydrolysis: the aquo complex is a weak acid, so a metal ion
			// is listed with the pKa of its first deprotonation,
			// M(H2O)n^z+ -> M(OH)^(z-1)+ + H+. Its own charge is the fully
			// protonated charge, so no `base` flag is needed. These entries also
			// let Simulation.equilibrateHydroxides pin the free cation.
			// Amphoteric cations list the whole hydroxo chain, so the last state
			// is the anionic hydroxo complex (zincate, aluminate, plumbite,
			// chromite) and the hydroxide redissolves in excess base. The sum of
			// the pKa values follows from the overall formation constant of that
			// complex, sum(pKa) = 14 n - log(beta_n); the split between the steps
			// is smoothed to stay monotonic.
			"[Fe3+]": { "pks": [2.19, 3.5, 6.0] },
			"[Al3+]": { "pks": [5.0, 5.5, 6.0, 6.2] },
			"[Cr3+]": { "pks": [3.9, 6.0, 7.5, 8.6] },
			"[Hg2+]": { "pks": [3.7] },
			"[Cu2+]": { "pks": [7.5] },
			"[Pb2+]": { "pks": [7.7, 9.0, 10.3] },
			"[Zn2+]": { "pks": [9.0, 9.5, 10.5, 11.5] },
			"[Fe2+]": { "pks": [9.5] },
			"[Co2+]": { "pks": [9.65] },
			"[Ni2+]": { "pks": [9.9] },
			"[Cr2+]": { "pks": [10.0] },
			"[Cd2+]": { "pks": [10.1] },
			"[Mn2+]": { "pks": [10.6] },
			"[Mg2+]": { "pks": [11.4] },
			"[Ag+]": { "pks": [12.0] },
			"[Ca2+]": { "pks": [12.6] },
			"[Ba2+]": { "pks": [13.4] }
			},
	};

	/**
	 * A list of molecule parts e.g. dissoziated ions of salts. Gets filled at runtime
	 *
	 * @static
	 * @type {Object}
	 */
	static _moleculeParts: Object = {};


	/**
	 * Generates a new {@link Mixture} object with a unique id and returns it
	 *
	 * @public
	 * @static
	 * @returns {Mixture}
	 */
	public static newMixture(): Mixture {
		this._mixtureCount += 1;
		return new Mixture(this._mixtureCount);
	}

	/**
	 * Generates a new {@link Molecule} object with a unique id and returns it. Can be based on an existing kekule.js molecule object
	 *
	 * @public
	 * @static
	 * @param {?*} [nKek] - kekule.js molecule object
	 * @returns {Molecule}
	 */
	public static newMolecule(nKek?: any): Molecule {
		this._moleculeCount += 1;
		return new Molecule(this._moleculeCount, nKek);
	}

	/**
	 * Checks wether a {@link Molecule} object represents water. Returns true if so
	 *
	 * @public
	 * @static
	 * @param {Molecule} molecule - the molecule to check
	 * @returns {boolean}
	 */
	public static isWater(molecule: Molecule): boolean {
		let numOxygen: number = 0;
		let numHydrogen: number = 0;
		let numBonds: number = 0;

		let returnValue: boolean = true;

		molecule._atoms.forEach((atom) => {
			if (atom.getSymbol() == "O") {
				numOxygen += 1;
			} else if (atom.getSymbol() == "H") {
				numHydrogen += 1;
			} else {
				returnValue = false;
			}
		});

		if (!(numOxygen === 1 && numHydrogen === 2)) {
			returnValue = false;
		}

		molecule._bonds.forEach((bond) => {
			numBonds += 1;
			if (bond._type != "covalent" || bond._magnitude != 1) {
				returnValue = false;
			}
		});

		if (numBonds != 2) {
			returnValue = false;
		}

		return returnValue;
	}

	/**
	 * Checks wether a {@link Molecule} object represents a salt. Returns true if so
	 *
	 * @public
	 * @static
	 * @param {Molecule} molecule - the molecule to check
	 * @returns {boolean}
	 */
	public static isSalt(molecule: Molecule): boolean {
		var isIonic: boolean = false;

		molecule._bonds.forEach((bond) => {
			if (bond._type === "ionic" && bond._magnitude === 1) {
				isIonic = true;
			}
		});

		return isIonic;
	}

	/**
	 * Checks wether a {@link Molecule} object represents an acid or a base. Returns true if so
	 *
	 * @public
	 * @static
	 * @param {Molecule} molecule - the molecule to check
	 * @returns {boolean}
	 */
	public static isAcidBase(molecule: Molecule): boolean {
		if (molecule.aqueousAcidBase) return true;
		var bBondType: boolean = false;
		var bInList: boolean = false;

		molecule._bonds.forEach((bond) => {
			if (bond._type === "acidbase") {
				bBondType = true;
			}
		});

		for (var entry in this._moleculeData["acidbase"]) {
			if (molecule.smilesString === entry) {
				bInList = true;
			}
		}

		return bBondType && bInList;
	}

	/**
	 * splits off part of a larger {@link Molecule} object at a bond and returns that
	 *
	 * @public
	 * @static
	 * @param {number} sIndex - the index of one {@link Atom} object of the bond whose side should be kept and from which to start
	 * @param {Molecule} oMolecule - the original {@link Molecule}  object
	 * @param {number} fBIndex - the index ofg the other {@link Atom} object of the bond whose side should be ignored
	 * @param {number} nCharge - the charge to be added to the splitted molecule
	 * @returns {Molecule}
	 */
	public static getMoleculePart(
		sIndex: number,
		oMolecule: Molecule,
		fBIndex: number,
		nCharge: number
	): Molecule {
		var nMolecule: Molecule = StructureManager.newMolecule();

		var nextNodes: Array<number> = [];
		var currIndex: number = -1;

		var atomMap: Object = {};

		nextNodes.push(sIndex);

		while (nextNodes[currIndex + 1] != undefined) {
			currIndex += 1;
			var currNode: Atom = oMolecule.getAtomFromIndex(nextNodes[currIndex]);

			if (currIndex === 0) {
				let adjacentBonds: number = 0;

				for (let bond of oMolecule._bonds) {
					if (bond._from === currNode || bond._to === currNode) {
						adjacentBonds += 1;
					}
				}

				if (adjacentBonds === 1) {
					let nAtom: Atom = nMolecule.addAtom(
						currNode.getName().toLowerCase(),
						currNode.getSymbol(),
						currNode._ionicCharge,
						currNode._pos2D[0],
						currNode._pos2D[1]
					);
					atomMap[currNode._id] = nAtom._id;
					break;
				}
			}

			for (let bond of oMolecule._bonds) {
				if (
					(bond._from === currNode || bond._to === currNode) &&
					bond._id != fBIndex
				) {
					if (bond._from === currNode) {
						if (!nextNodes.includes(bond._to._id)) {
							nextNodes.push(bond._to._id);
							let nAtom2id: number;
							let nAtom1id: number;

							if (atomMap[currNode._id] == undefined) {
								nAtom1id = nMolecule.addAtom(
									currNode.getName().toLowerCase(),
									currNode.getSymbol(),
									bond._type === "ionic"
										? currNode._ionicCharge > 0
											? currNode._ionicCharge - 1
											: currNode._ionicCharge + 1
										: currNode._ionicCharge,
									currNode._pos2D[0],
									currNode._pos2D[1]
								)._id;
								atomMap[currNode._id] = nAtom1id;
							} else {
								nAtom1id = atomMap[currNode._id];
							}

							if (atomMap[bond._to._id] == undefined) {
								nAtom2id = nMolecule.addAtom(
									bond._to.getName().toLowerCase(),
									bond._to.getSymbol(),
									bond._type === "ionic"
										? bond._to._ionicCharge > 0
											? bond._to._ionicCharge - 1
											: bond._to._ionicCharge + 1
										: bond._to._ionicCharge,
									bond._to._pos2D[0],
									bond._to._pos2D[1]
								)._id;
								atomMap[bond._to._id] = nAtom2id;
							} else {
								nAtom2id = atomMap[bond._to._id];
							}

							nMolecule.addBond(
								nAtom1id,
								nAtom2id,
								bond._magnitude,
								bond._length,
								bond._type
							);
						}
					} else {
						if (!nextNodes.includes(bond._from._id)) {
							nextNodes.push(bond._from._id);

							let nAtom2id: number;
							let nAtom1id: number;

							if (atomMap[currNode._id] == undefined) {
								nAtom2id = nMolecule.addAtom(
									currNode.getName().toLowerCase(),
									currNode.getSymbol(),
									bond._type === "ionic"
										? currNode._ionicCharge > 0
											? currNode._ionicCharge - 1
											: currNode._ionicCharge + 1
										: currNode._ionicCharge,
									currNode._pos2D[0],
									currNode._pos2D[1]
								)._id;
								atomMap[currNode._id] = nAtom2id;
							} else {
								nAtom2id = atomMap[currNode._id];
							}

							if (atomMap[bond._from._id] == undefined) {
								nAtom1id = nMolecule.addAtom(
									bond._from.getName().toLowerCase(),
									bond._from.getSymbol(),
									bond._type === "ionic"
										? bond._from._ionicCharge > 0
											? bond._from._ionicCharge - 1
											: bond._from._ionicCharge + 1
										: bond._from._ionicCharge,
									bond._from._pos2D[0],
									bond._from._pos2D[1]
								)._id;
								atomMap[bond._from._id] = nAtom1id;
							} else {
								nAtom1id = atomMap[bond._from._id];
							}

							nMolecule.addBond(
								nAtom2id,
								nAtom1id,
								bond._magnitude,
								bond._length,
								bond._type
							);
						}
					}
				}
			}
		}
		if (
			StructureManager.isAcidBase(oMolecule) &&
			!StructureManager.isSalt(oMolecule)
		) {
			nMolecule
				.getAtomFromIndex(atomMap[sIndex])
				.setIonicCharge(
					nMolecule.getAtomFromIndex(atomMap[sIndex])._ionicCharge + nCharge
				);
			nMolecule.getAtomFromIndex(atomMap[sIndex])._kekule_obj.charge =
				nMolecule.getAtomFromIndex(atomMap[sIndex])._ionicCharge;
			nMolecule.calcTotalCharge();
		}

		return nMolecule;
	}

	/**
	 * calculates a simple 2D structure for a {@link Molecule} object and saves the corresponding coordinates for each {@link Atom}
	 *
	 * @public
	 * @static
	 * @param {Molecule} molecule - the {@link Molecule} object to calculate on
	 * @param {boolean} [bEpairs=false] - describes wether free electon pairs should be taken into account. False by default
	 */
	public static calcPos2D(molecule: Molecule, bEpairs: boolean = false): void {
		var nextNodes: Array<number> = [];
		var currIndex: number = -1;

		if (molecule._bondCount === 0) {
			return;
		}

		nextNodes.push(molecule._bonds[0]._from._id);

		while (nextNodes[currIndex + 1] != undefined) {
			currIndex += 1;
			var currNode = molecule.getAtomFromIndex(nextNodes[currIndex]);
			var adjAtoms: Array<[Atom, number]> = new Array<[Atom, number]>();
			var adjBondMagnitudes: number = 0;

			var relPoint: [number, number] = [0, 0];

			molecule._bonds.forEach((bond) => {
				if (bond._from === currNode || bond._to === currNode) {
					var adjAtom: Atom = undefined;

					if (bond._from === currNode) {
						adjAtom = bond._to;
						if (!nextNodes.includes(bond._to._id)) {
							nextNodes.push(bond._to._id);
						}
						adjAtoms.push([bond._to, bond._length / 100]);
					} else {
						adjAtom = bond._from;
						if (!nextNodes.includes(bond._from._id)) {
							nextNodes.push(bond._from._id);
						}
						adjAtoms.push([bond._from, bond._length / 100]);
					}
					adjBondMagnitudes += bond._magnitude;

					if (nextNodes.indexOf(adjAtom._id) < currIndex) {
						relPoint[0] = adjAtom._pos2D[0] - currNode._pos2D[0];
						relPoint[1] = adjAtom._pos2D[1] - currNode._pos2D[1];
					}
				}
			});

			var neighborCount: number = adjAtoms.length;
			var freeEPairs = Math.ceil(
				(currNode.getShells()[currNode.getShells().length - 1] -
					adjBondMagnitudes) /
					2
			);

			var angleSteps =
				360 /
				(neighborCount + (bEpairs ? freeEPairs * 0.3 : 0)) /
				(180 / Math.PI);
			var angleOffset = Math.atan2(relPoint[1], relPoint[0]);

			var stepCount: number = 1;

			adjAtoms.forEach((element) => {
				if (nextNodes.indexOf(element[0]._id) > currIndex) {
					var nX: number =
						currNode._pos2D[0] +
						element[1] * Math.cos(angleOffset + angleSteps * stepCount);
					var nY: number =
						currNode._pos2D[1] +
						element[1] * Math.sin(angleOffset + angleSteps * stepCount);
					element[0].setPos2D(nX, nY);

					stepCount += 1;
				}
			});
		}
	}

	/**
	 * Returns a new {@link Molecule} object based on an existing kekule.js molecule
	 *
	 * @public
	 * @static
	 * @param {*} nKek - the underlying kekule.js molecule object
	 * @returns {Molecule}
	 */
	public static loadFromKekule(nKek: any): Molecule {
		let nMolecule: Molecule = new Molecule(nKek);

		nKek.connectors.forEach((kekBond) => {
			var nAtom1: Atom = undefined;
			var nAtom2: Atom = undefined;
			var bAtom1Used: number = -1;
			var bAtom2Used: number = -1;
			nMolecule._atoms.forEach((atom) => {
				if (atom._kekule_obj === kekBond.connectedObjs[0]) {
					bAtom1Used = nMolecule._atoms.indexOf(atom);
				}
				if (atom._kekule_obj === kekBond.connectedObjs[1]) {
					bAtom2Used = nMolecule._atoms.indexOf(atom);
				}
			});
			if (bAtom1Used === -1) {
				nAtom1 = nMolecule.addAtom(
					kekBond.connectedObjs[0].isotope.name.toLowerCase(),
					kekBond.connectedObjs[0].isotope.symbol,
					kekBond.connectedObjs[0].charge,
					kekBond.connectedObjs[0]
				);
				nAtom1.setPos2D(
					kekBond.connectedObjs[0].coord2D["x"],
					kekBond.connectedObjs[0].coord2D["y"]
				);
			} else {
				nAtom1 = nMolecule._atoms[bAtom1Used];
			}
			if (bAtom2Used === -1) {
				nAtom2 = nMolecule.addAtom(
					kekBond.connectedObjs[1].isotope.name.toLowerCase(),
					kekBond.connectedObjs[1].isotope.symbol,
					kekBond.connectedObjs[1].charge,
					kekBond.connectedObjs[1]
				);
				nAtom2.setPos2D(
					kekBond.connectedObjs[1].coord2D["x"],
					kekBond.connectedObjs[1].coord2D["y"]
				);
			} else {
				nAtom2 = nMolecule._atoms[bAtom2Used];
			}
			var vectorLength: number = Math.sqrt(
				Math.pow(
					kekBond.connectedObjs[0].coord2D["x"] -
						kekBond.connectedObjs[1].coord2D["x"],
					2
				) +
					Math.pow(
						kekBond.connectedObjs[0].coord2D["y"] -
							kekBond.connectedObjs[1].coord2D["y"],
						2
					)
			);
			nMolecule.addBond(
				nAtom1._id,
				nAtom2._id,
				kekBond.bondValence,
				vectorLength,
				kekBond.bondType,
				kekBond
			);
		});
		nKek.nodes.forEach((kekAtom) => {
			var bAtomUsed: boolean = false;
			nMolecule._atoms.forEach((atom) => {
				if (atom._kekule_obj === kekAtom) {
					bAtomUsed = true;
				}
			});
			if (!bAtomUsed) {
				var nAtom: Atom = nMolecule.addAtom(
					kekAtom.isotope.name.toLowerCase(),
					kekAtom.isotope.symbol,
					kekAtom.charge,
					kekAtom
				);
				nAtom.setPos2D(kekAtom.coord2D["x"], kekAtom.coord2D["y"]);
			}
		});

		return nMolecule;
	}

	/**
	 * Uses kekule.js to return a list of HTML elements with a drawn structure of each active {@link Molecule} in a {@link Mixture}
	 *
	 * @public
	 * @static
	 * @param {Mixture} mixture - thre {@link Mixture} to draw from
	 * @param {HTMLElement} parentElement - existing HTML element to which the generated elements will be added as children
	 * @returns {HTMLElement[]}
	 */
	public static printMolecules_arr(
		mixture: Mixture,
		dimx: number,
		dimy: number
	): string[] {
		let renderType = Kekule.Render.RendererType.R2D;
		let itemList: string[] = [];
		for (let molecule of mixture._activeMolecules) {
			StructureManager.calcPos2D(molecule, true);
			let canvasElem: HTMLElement = document.createElement(
				"div" + molecule._id
			);
			canvasElem.style.width = dimx.toString()
			canvasElem.style.height = dimy.toString()

			Kekule.DomUtils.clearChildContent(canvasElem);
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.NONMETAL] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.METAL] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ALKALI_METAL] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ALKALI_EARTH_METAL] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.TRANSITION_METAL] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.METALLOID] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.HALOGEN] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.NOBLE_GAS] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.LANTHANIDE] = false;
			Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ACTINIDE] = false;
			let painter = new Kekule.Render.ChemObjPainter(
				renderType,
				molecule._kekule_obj
			);
			let context = painter.createContext(canvasElem, dimx, dimy);

			painter.draw(context, { x: dimx / 2, y: dimy / 2 });
			
			let img_string:string = canvasElem.getElementsByTagName("canvas")[0].toDataURL("image/png")
			itemList.push(img_string)
		}

		return itemList;
	}

	public static printMolecule(
		molecule: Molecule,
		dimx: number,
		dimy: number,
		fitPadding?: number
	): string {
		let renderType = Kekule.Render.RendererType.R2D;
		StructureManager.calcPos2D(molecule, true);
		let canvasElem: HTMLElement = document.createElement(
			"div" + molecule._id
		);
		canvasElem.style.width = dimx.toString()
		canvasElem.style.height = dimy.toString()

		Kekule.DomUtils.clearChildContent(canvasElem);
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.NONMETAL] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.METAL] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ALKALI_METAL] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ALKALI_EARTH_METAL] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.TRANSITION_METAL] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.METALLOID] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.HALOGEN] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.NOBLE_GAS] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.LANTHANIDE] = false;
		Kekule.globalOptions.structure.implicitHydrogenEstimationStrategy.targetElementCategories[Kekule.ElementCategory.ACTINIDE] = false;
		let painter = new Kekule.Render.ChemObjPainter(
			renderType,
			molecule._kekule_obj
		);
		let context = painter.createContext(canvasElem, dimx, dimy);
	
		const options = fitPadding === undefined ? undefined : { autoShrink: true, autofitContextPadding: fitPadding };
		painter.draw(context, { x: dimx / 2, y: dimy / 2 }, options);

		return canvasElem.getElementsByTagName("canvas")[0].toDataURL("image/png")

	}

	/** Looks up optional display metadata, sharing a request for an identical structure. */
	public static async getChemData(molecule: Molecule): Promise<void> {
		const smiles = molecule.smilesString;
		const metadata = await lookupCompound(smiles);
		if (molecule.smilesString !== smiles) return;
		molecule.name = metadata?.name ?? smiles;
		if (metadata?.inchi) molecule.InChiString = metadata.inchi;
		if (metadata?.inchiKey) molecule.InChIKey = metadata.inchiKey;
	}

}
