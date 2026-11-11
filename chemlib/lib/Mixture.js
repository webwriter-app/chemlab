import { StructureManager } from "./StructureManager";
/**
 * A Representation of a mixture of one or more instances of {@link Molecule}
 *
 * @class Mixture
 * @typedef {Mixture}
 */
var Mixture = /** @class */ (function () {
    /**
     * Returns a new mixture object
     *
     * @constructor
     * @param {*} nIndex - the unique id for the object
     */
    function Mixture(nIndex) {
        /**
         * Marks the current volume if the mixture is a solution
         *
         * @type {number}
         */
        this._solutionVolume = 0;
        /**
         * Is true if the mixture is a solution
         *
         * @type {boolean}
         */
        this._isSolution = false;
        /**
         * The current temperature of the solution in kelvin - wip
         *
         * @type {number}
         */
        this._temperature = 298.15;
        /**
         * The current temperature of the solution in pascal - wip
         *
         * @type {number}
         */
        this._pressure = 101325;
        this._id = nIndex;
        this._activeMolecules = new Array();
        this._molProperties = {};
    }
    /**
     * Adds a new {@link Molecule} to the mixture or calls {@link changeMolecule()} if the object is already included in {@link _activeMolecules}
     *
     * @public
     * @param {Molecule} nMolecule - the {@link Molecule} object to add
     * @param {number} amountMol - the amount in moles
     */
    Mixture.prototype.addMolecule = function (nMolecule, amountMol) {
        var _this = this;
        var bIncluded = false;
        var usedIndex = -1;
        this._activeMolecules.forEach(function (molecule) {
            if (nMolecule._atoms.length === 1) {
                if (molecule._atoms.length === 1 &&
                    nMolecule._atoms[0].getSymbol() === molecule._atoms[0].getSymbol() &&
                    nMolecule._totalCharge === molecule._totalCharge) {
                    bIncluded = true;
                    usedIndex = molecule._id;
                }
            }
            else {
                if (nMolecule.smilesString === molecule.smilesString &&
                    nMolecule._totalCharge === molecule._totalCharge) {
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
                    this._activeMolecules.forEach(function (molecule) {
                        _this.changeMolecule(molecule._id, 0);
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
                this._activeMolecules.forEach(function (molecule) {
                    _this.changeMolecule(molecule._id, 0);
                });
            }
        }
    };
    /**
     * Removes a molecule from the mixture by deleting its entries in {@link _activeMolecules} and {@link _molProperties}
     *
     * @public
     * @param {number} rId - the id of the molecule to remove
     */
    Mixture.prototype.remMolecule = function (rId) {
        var _this = this;
        var rMoleculeIndex = -1;
        this._activeMolecules.forEach(function (molecule) {
            if (molecule._id === rId) {
                rMoleculeIndex = _this._activeMolecules.indexOf(molecule);
            }
        });
        this._activeMolecules.splice(rMoleculeIndex, 1);
        delete this._molProperties[rId + "n"];
        delete this._molProperties[rId + "m"];
        delete this._molProperties[rId + "c"];
    };
    /**
     * Changes the amount of a given {@link Molecule}. Calls {@link remMolecule()} if neccessary
     *
     * @public
     * @param {number} iMol - the id of the molecule
     * @param {number} amountMol - the amount to add (positive) ore remove (negative)
     */
    Mixture.prototype.changeMolecule = function (iMol, amountMol) {
        var molMass = this._molProperties[iMol + "m"] / this._molProperties[iMol + "n"];
        this._molProperties[iMol + "n"] += amountMol;
        this._molProperties[iMol + "m"] += amountMol * molMass;
        var cMol = this._activeMolecules.find(function (mol) {
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
    };
    return Mixture;
}());
export { Mixture };
//# sourceMappingURL=Mixture.js.map