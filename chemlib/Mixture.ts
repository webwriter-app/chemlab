import { Molecule } from "./Molecule";
import { StructureManager } from "./StructureManager";

/**
 * A Representation of a mixture of one or more instances of {@link Molecule}
 *
 * @class Mixture
 * @typedef {Mixture}
 */
class Mixture {
	/**
	 * The specific id of the object
	 *
	 * @type {number}
	 */
	_id: number;
	/**
	 * A list of all current {@link Molecule} objects within the mixture
	 *
	 * @type {Array<Molecule>}
	 */
	_activeMolecules: Array<Molecule>;
	/**
	 * A Json object containing data for each {@link Molecule} of the mixture. Gets filed at runtime
	 *
	 * @type {{}}
	 */
	_molProperties: {};
	/**
	 * Marks the current volume if the mixture is a solution
	 *
	 * @type {number}
	 */
	_solutionVolume: number = 0;

	/** Measured volume of additions beyond the water tracked by the solution model, in L. */
	addedVolume = 0;
	hasLiquidVolume = false;

	get contentVolume(): number {
		return Math.max(0, this._solutionVolume) + this.addedVolume;
	}
	/**
	 * Is true if the mixture is a solution
	 *
	 * @type {boolean}
	 */
	_isSolution: boolean = false;
	/**
	 * The current temperature of the solution in kelvin - wip
	 *
	 * @type {number}
	 */
	_temperature: number = 298.15;
	/**
	 * The current temperature of the solution in pascal - wip
	 *
	 * @type {number}
	 */
	_pressure: number = 101325;

	/**
	 * Returns a new mixture object
	 *
	 * @constructor
	 * @param {*} nIndex - the unique id for the object
	 */
	constructor(nIndex) {
		this._id = nIndex;
		this._activeMolecules = new Array<Molecule>();
		this._molProperties = {};
	}

	/**
	 * Adds a new {@link Molecule} to the mixture or calls {@link changeMolecule()} if the object is already included in {@link _activeMolecules}
	 *
	 * @public
	 * @param {Molecule} nMolecule - the {@link Molecule} object to add
	 * @param {number} amountMol - the amount in moles
	 */
	public addMolecule(nMolecule: Molecule, amountMol: number): void {
		var bIncluded: boolean = false;
		var usedIndex: number = -1;

		this._activeMolecules.forEach((molecule) => {
			if (nMolecule._atoms.length === 1) {
				if (
					molecule._atoms.length === 1 &&
					nMolecule._atoms[0].getSymbol() === molecule._atoms[0].getSymbol() &&
					nMolecule._totalCharge === molecule._totalCharge
				) {
					bIncluded = true;
					usedIndex = molecule._id;
				}
			} else {
				if (
					nMolecule.smilesString === molecule.smilesString &&
					nMolecule._totalCharge === molecule._totalCharge
				) {
					bIncluded = true;
					usedIndex = molecule._id;
				}
			}
		});

		if (bIncluded) {
			this.changeMolecule(usedIndex, amountMol);
			if (StructureManager.isWater(nMolecule)) {
				this._solutionVolume = this._molProperties[usedIndex + "m"] / 1000;
				if (this._activeMolecules.length - 1 > 0) {
					this._activeMolecules.forEach((molecule) => {
						this.changeMolecule(molecule._id, 0);
					});
				}
			}
			return;
		}

		this._activeMolecules.push(nMolecule);
		this._molProperties[nMolecule._id + "n"] = amountMol;
		this._molProperties[nMolecule._id + "m"] =
			amountMol * nMolecule.getTotMolMass();

		if (this._isSolution) {
			this._molProperties[nMolecule._id + "c"] =
				amountMol / this._solutionVolume;
		}

		if (StructureManager.isWater(nMolecule)) {
			this._isSolution = true;
			this._solutionVolume = this._molProperties[nMolecule._id + "m"] / 1000;
			this._molProperties[nMolecule._id + "c"] =
				this._molProperties[nMolecule._id + "n"] / this._solutionVolume;

			if (this._activeMolecules.length - 1 > 0) {
				this._activeMolecules.forEach((molecule) => {
					this.changeMolecule(molecule._id, 0);
				});
			}
		}
	}

	/**
	 * Removes a molecule from the mixture by deleting its entries in {@link _activeMolecules} and {@link _molProperties}
	 *
	 * @public
	 * @param {number} rId - the id of the molecule to remove
	 */
	public remMolecule(rId: number): void {
		let rMoleculeIndex: number = -1;

		this._activeMolecules.forEach((molecule) => {
			if (molecule._id === rId) {
				rMoleculeIndex = this._activeMolecules.indexOf(molecule);
			}
		});

		this._activeMolecules.splice(rMoleculeIndex, 1);
		delete this._molProperties[rId + "n"];
		delete this._molProperties[rId + "m"];
		delete this._molProperties[rId + "c"];
	}

	/**
	 * Changes the amount of a given {@link Molecule}. Calls {@link remMolecule()} if neccessary
	 *
	 * @public
	 * @param {number} iMol - the id of the molecule
	 * @param {number} amountMol - the amount to add (positive) ore remove (negative)
	 */
	public changeMolecule(iMol: number, amountMol: number): void {
		let molMass: number =
			this._molProperties[iMol + "m"] / this._molProperties[iMol + "n"];

		this._molProperties[iMol + "n"] += amountMol;
		this._molProperties[iMol + "m"] += amountMol * molMass;

		let cMol: Molecule = this._activeMolecules.find((mol) => {
			return mol._id === iMol;
		});
		if (StructureManager.isWater(cMol)) {
			this._solutionVolume = this._molProperties[iMol + "m"] / 1000;
		}

		if (this._isSolution) {
			this._molProperties[iMol + "c"] =
				this._molProperties[iMol + "n"] / this._solutionVolume;
		}

		if (this._molProperties[iMol + "n"] <= 0) {
			this.remMolecule(iMol);
		}
	}
}

export { Mixture };
