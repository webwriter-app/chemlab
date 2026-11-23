import type { AqueousAcidBase } from "./AcidBase";
import { Atom } from "./Atom";
import { Bond } from "./Bond";
import { Kekule } from "./kekule";

/**
 * Representation of a molecule
 *
 * @class Molecule
 * @typedef {Molecule}
 */
class Molecule {
	aqueousAcidBase?: AqueousAcidBase;
	/** Catalog phase at the time of dosing, used when no phase change is modeled. */
	dosedAsSolid?: boolean;
	/** Formula of a solid phase tracked by the salt equilibrium. */
	solidSaltFormula?: string;
	/**
	 * One structure per ion of the formula unit, in the order of the solubility
	 * table. A double salt keeps both of its cations here, so dissolving it
	 * returns the same charge balance it was dosed with.
	 */
	solidSaltIons?: readonly Molecule[];
	/**
	 * Bulk volume of one mole of this dosed solid in litres, from the density of
	 * its own recipe. A hydrate occupies more volume than the anhydrous salt of
	 * the solubility table, so dissolving it has to release this volume and not
	 * the tabulated one.
	 */
	solidBulkLitresPerMol?: number;
	/**
	 * A list of all available bond types
	 *
	 * @readonly
	 * @type {Array<any>}
	 */
	readonly _bondTypes: Array<any>;

	/**
	 * The english name of the molecule. Must be fetched seperately
	 *
	 * @type {string}
	 */
	name: string = "";
	/**
	 * The current SMILES representation of the molecule
	 *
	 * @type {string}
	 */
	smilesString: string = "";
	private smilesBatch?: { dirty: boolean };
	/**
	 * The current InChi representation of the molecule. Must be generated seperately
	 *
	 * @type {string}
	 */
	InChiString: string = "";
	/**
	 * The current InChi key of the molecule. Must be generated seperately
	 *
	 * @type {string}
	 */
	InChIKey: string = "";

	/**
	 * The number of atoms in the molecule
	 *
	 * @type {number}
	 */
	_atomCount: number = 0;
	/**
	 * The number of bonds in the molecule
	 *
	 * @type {number}
	 */
	_bondCount: number = 0;
	/**
	 * The total charge of the molecule
	 *
	 * @type {number}
	 */
	_totalCharge: number = 0;
	/**
	 * A list containing all {@link Atom} objects of the molecule
	 *
	 * @type {Array<Atom>}
	 */
	_atoms: Array<Atom>;
	/**
	 * A list containing all {@link Bond} objects of the molecule
	 *
	 * @type {Array<Bond>}
	 */
	_bonds: Array<Bond>;
	/**
	 * The corresponding kekule.js molecule object
	 *
	 * @type {*}
	 */
	_kekule_obj: any;
	/**
	 * The specific id of the object
	 *
	 * @readonly
	 * @type {number}
	 */
	readonly _id: number;

	/**
	 * Returns a molecule with a specific id. Can be generated from a preexisting kekule.js object
	 *
	 * @constructor
	 * @param {number} nIndex - the specific id for the object
	 * @param {?*} [nKek] - the kekule.js molecule object
	 */
	constructor(nIndex: number, nKek?: any) {
		this._id = nIndex;
		this._bondTypes = Object.values(Kekule.BondType).filter(function (elem) {
			return elem !== null;
		});
		this._bondTypes.pop();
		this._bondTypes.push("acidbase");
		this._bondTypes = this._bondTypes.reverse();

		this._atoms = new Array<Atom>();
		this._bonds = new Array<Bond>();

		if (nKek === undefined) {
			this._kekule_obj = new Kekule.Molecule();
		} else {
			this._kekule_obj = nKek;
		}
	}

	/**
	 * Generates the {@link smilesString} of the molecule using kekule.js
	 *
	 * @public
	 */
	public setSmilesString(): void {
		this.smilesString = "";
		this.smilesString = Kekule.IO.saveFormatData(this._kekule_obj, "smi", {
			ignoreImplicitHydrogens: true,
		});
		if (this.smilesString === undefined) {
			if (
				this._atomCount === 1 &&
				this._atoms[0].getSymbol() === "H" &&
				this._totalCharge === 1
			) {
				this.smilesString = "[H+]";
			}
		}
		if (
			this.smilesString === "[O-]" &&
			this._atomCount === 2 &&
			this._totalCharge === -1
		) {
			this.smilesString = "[OH-]";
		}
	}

	/** Refreshes SMILES once after synchronous graph edits. Atom and bond charges stay current during the edits. */
	public batchStructureChanges(update: () => void): void {
		if (this.smilesBatch !== undefined) {
			update();
			return;
		}
		const batch = { dirty: false };
		this.smilesBatch = batch;
		try {
			update();
		} finally {
			this.smilesBatch = undefined;
			if (batch.dirty) this.setSmilesString();
		}
	}

	/**
	 * Calculates and sets the {@link _totalCharge} of the molecule
	 *
	 * @public
	 */
	public calcTotalCharge(): void {
		this._totalCharge = 0;
		this._atoms.forEach((atom) => {
			this._totalCharge += atom.getIonicCharge();
		});
		this._kekule_obj.charge = this._totalCharge;

		if (this.smilesBatch) this.smilesBatch.dirty = true;
		else this.setSmilesString();
	}

	/**
	 * Returns the total molar mass of the molecule
	 *
	 * @public
	 * @returns {number}
	 */
	public getTotMolMass(): number {
		let molMass: number = 0;

		this._atoms.forEach((atom) => {
			molMass += atom.getAtomicMass();
		});

		return molMass;
	}

	/**
	 * Adds an {@link Atom} to the molecule and returns that
	 *
	 * @public
	 * @param {string} nName - the name of the element
	 * @param {string} nSymbol - the element symbol
	 * @param {number} [nIonicCharge=0] - the charge of the atom
	 * @param {number} [nPos2Dx=0] - the x coordinate of the atom (default is 0)
	 * @param {number} [nPos2Dy=0] - the y coordinate of the atom (default is 0)
	 * @param {?*} [nImport] - an existing kekule.js atom object to build from
	 * @returns {Atom}
	 */
	public addAtom(
		nName: string,
		nSymbol: string,
		nIonicCharge: number = 0,
		nPos2Dx = Math.random()*2,
		nPos2Dy = Math.random()*2,
		nImport?: any
	): Atom {
		var kek_atom: any;
		var atom: any;
		if (nImport === undefined) {
			kek_atom = this._kekule_obj.appendAtom(nSymbol);
			atom = new Atom(nName, kek_atom, nIonicCharge, this._atomCount);
			atom.setPos2D(nPos2Dx, nPos2Dy);
			atom._kekule_obj.setCoord2D({ x: nPos2Dx, y: nPos2Dy });
		} else {
			atom = new Atom(nName, nImport, nIonicCharge, this._atomCount);
		}
		this._atoms.push(atom);
		this._atomCount += 1;

		this.calcTotalCharge();
		return atom;
	}

	/**
	 * Returns a specific {@link Atom} of the molecule by its id
	 *
	 * @public
	 * @param {number} sIndex - the id of the {@link Atom} object
	 * @returns {Atom}
	 */
	public getAtomFromIndex(sIndex: number): Atom {
		var retAtom: Atom = undefined;

		this._atoms.forEach((atom) => {
			if (atom._id === sIndex) {
				retAtom = atom;
			}
		});

		return retAtom;
	}

	/**
	 * Adds a new {@link Bond} between to {@link Atom} objects and adds it to {@link _bonds}
	 *
	 * @public
	 * @param {number} nFIndex - the id of the first atom
	 * @param {number} nTIndex - the id of the second atom
	 * @param {number} nMagnitude - wether its a single, double or any other bond
	 * @param {number} nLength - the bonds length
	 * @param {string} nType - the type of bond (covalent, ionic, metallic, hydrogen, acidbase)
	 * @param {?*} [nImport] - an existing kekule.js bond object
	 */
	public addBond(
		nFIndex: number,
		nTIndex: number,
		nMagnitude: number,
		nLength: number,
		nType: string,
		nImport?: any
	): void {
		let nFrom: Atom = null;
		let nTo: Atom = null;

		this._atoms.forEach((atom) => {
			if (nFIndex === atom._id) {
				nFrom = atom;
			}
			if (nTIndex === atom._id) {
				nTo = atom;
			}
		});

		if (nFrom._bondingElectrons > 0 && nTo._bondingElectrons > 0) {
			if (nType === "ionic") {
				if (nFrom.getSymbol() === nTo.getSymbol()) {
					return;
				}

				if (
					nFrom.getElectronNegativityPauling() >
					nTo.getElectronNegativityPauling()
				) {
					nFrom.updateElectrons(1, -1);
					nTo.updateElectrons(1, 1);
				} else {
					nFrom.updateElectrons(1, 1);
					nTo.updateElectrons(1, -1);
				}
			}

			if (nImport === undefined) {
				this._kekule_obj.appendBond(
					[nFrom._kekule_obj, nTo._kekule_obj],
					nMagnitude,
					this._bondTypes.includes(nType, 1)
						? nType
						: this._bondTypes[this._bondTypes.length - 1]
				);
			}
			this._bonds.push(
				new Bond(nType, nMagnitude, nLength, nFrom, nTo, this._bondCount)
			);
			this._bondCount += 1;
		}

		this.calcTotalCharge();
	}

	/**
	 * Removes an {@link Atom} from the molecule and corrects all corresponding variables
	 *
	 * @public
	 * @param {number} rIndex - the id of the atom to be removed
	 */
	public remAtom(rIndex: number): void {
		let rAtom: Atom = null;
		let curr_bonds: number = this._bonds.length;
		let to_remove: Array<number> = [];

		this._atoms.forEach((atom) => {
			if (atom._id === rIndex) {
				rAtom = atom;
			}
		});

		for (var i = 0; i < curr_bonds; i++) {
			var bond = this._bonds[i];
			if (bond._from === rAtom || bond._to === rAtom) {
				to_remove.push(bond._id);
			}
		}
		for (var j = 0; j < to_remove.length; j++) {
			this.remBond(to_remove[j]);
		}

		this._kekule_obj.removeNode(rAtom._kekule_obj);
		this._atoms.splice(this._atoms.indexOf(rAtom), 1);

		this.calcTotalCharge();
	}

	/**
	 * Removes an {@link Bond} from the molecule
	 *
	 * @public
	 * @param {number} rIndex - the id of the bond to be removed
	 */
	public remBond(rIndex: number): void {
		let rBond: Bond = null;
		let kek_curr_bonds: number = this._kekule_obj.connectors.length;
		let to_remove: Array<number> = [];
		let removed: number = 0;

		this._bonds.forEach((bond) => {
			if (bond._id === rIndex) {
				rBond = bond;
			}
		});

		for (var i = 0; i < kek_curr_bonds; i++) {
			var kek_bond = this._kekule_obj.connectors[i];
			if (
				(rBond._from._kekule_obj === kek_bond.connectedObjs[0] &&
					rBond._to._kekule_obj === kek_bond.connectedObjs[1]) ||
				(rBond._from._kekule_obj === kek_bond.connectedObjs[1] &&
					rBond._to._kekule_obj === kek_bond.connectedObjs[0])
			) {
				to_remove.push(i);
				break;
			}
		}
		for (var j = 0; j < to_remove.length; j++) {
			this._kekule_obj.removeConnector(this._kekule_obj.connectors[i]);
			removed++;
		}

		this._bonds.splice(this._bonds.indexOf(rBond), 1);

		this.calcTotalCharge();
	}
}

export { Molecule };
