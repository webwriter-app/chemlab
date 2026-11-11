import { Atom } from "./Atom";
import { Bond } from "./Bond";
// @ts-ignore
import { Kekule } from "kekule";
/**
 * Representation of a molecule
 *
 * @class Molecule
 * @typedef {Molecule}
 */
var Molecule = /** @class */ (function () {
    /**
     * Returns a molecule with a specific id. Can be generated from a preexisting kekule.js object
     *
     * @constructor
     * @param {number} nIndex - the specific id for the object
     * @param {?*} [nKek] - the kekule.js molecule object
     */
    function Molecule(nIndex, nKek) {
        /**
         * The english name of the molecule. Must be fetched seperately
         *
         * @type {string}
         */
        this.name = "";
        /**
         * The current SMILES representation of the molecule
         *
         * @type {string}
         */
        this.smilesString = "";
        /**
         * The current InChi representation of the molecule. Must be generated seperately
         *
         * @type {string}
         */
        this.InChiString = "";
        /**
         * The current InChi key of the molecule. Must be generated seperately
         *
         * @type {string}
         */
        this.InChIKey = "";
        /**
         * The number of atoms in the molecule
         *
         * @type {number}
         */
        this._atomCount = 0;
        /**
         * The number of bonds in the molecule
         *
         * @type {number}
         */
        this._bondCount = 0;
        /**
         * The total charge of the molecule
         *
         * @type {number}
         */
        this._totalCharge = 0;
        this._id = nIndex;
        this._bondTypes = Object.values(Kekule.BondType).filter(function (elem) {
            return elem !== null;
        });
        this._bondTypes.pop();
        this._bondTypes.push("acidbase");
        this._bondTypes = this._bondTypes.reverse();
        this._atoms = new Array();
        this._bonds = new Array();
        if (nKek === undefined) {
            this._kekule_obj = new Kekule.Molecule();
        }
        else {
            this._kekule_obj = nKek;
        }
    }
    /**
     * Generates the {@link smilesString} of the molecule using kekule.js
     *
     * @public
     */
    Molecule.prototype.setSmilesString = function () {
        this.smilesString = "";
        this.smilesString = Kekule.IO.saveFormatData(this._kekule_obj, "smi", {
            ignoreImplicitHydrogens: true,
        });
        if (this.smilesString === undefined) {
            if (this._atomCount === 1 &&
                this._atoms[0].getSymbol() === "H" &&
                this._totalCharge === 1) {
                this.smilesString = "[H+]";
            }
        }
        if (this.smilesString === "[O-]" &&
            this._atomCount === 2 &&
            this._totalCharge === -1) {
            this.smilesString = "[OH-]";
        }
    };
    /**
     * Calculates and sets the {@link _totalCharge} of the molecule
     *
     * @public
     */
    Molecule.prototype.calcTotalCharge = function () {
        var _this = this;
        this._totalCharge = 0;
        this._atoms.forEach(function (atom) {
            _this._totalCharge += atom.getIonicCharge();
        });
        this._kekule_obj.charge = this._totalCharge;
        this.setSmilesString();
    };
    /**
     * Returns the total molar mass of the molecule
     *
     * @public
     * @returns {number}
     */
    Molecule.prototype.getTotMolMass = function () {
        var molMass = 0;
        this._atoms.forEach(function (atom) {
            molMass += atom.getAtomicMass();
        });
        return molMass;
    };
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
    Molecule.prototype.addAtom = function (nName, nSymbol, nIonicCharge, nPos2Dx, nPos2Dy, nImport) {
        if (nIonicCharge === void 0) { nIonicCharge = 0; }
        if (nPos2Dx === void 0) { nPos2Dx = Math.random() * 2; }
        if (nPos2Dy === void 0) { nPos2Dy = Math.random() * 2; }
        var kek_atom;
        var atom;
        if (nImport === undefined) {
            kek_atom = this._kekule_obj.appendAtom(nSymbol);
            atom = new Atom(nName, kek_atom, nIonicCharge, this._atomCount);
            atom.setPos2D(nPos2Dx, nPos2Dy);
            atom._kekule_obj.setCoord2D({ x: nPos2Dx, y: nPos2Dy });
        }
        else {
            atom = new Atom(nName, nImport, nIonicCharge, this._atomCount);
        }
        this._atoms.push(atom);
        this._atomCount += 1;
        this.calcTotalCharge();
        this.setSmilesString();
        return atom;
    };
    /**
     * Returns a specific {@link Atom} of the molecule by its id
     *
     * @public
     * @param {number} sIndex - the id of the {@link Atom} object
     * @returns {Atom}
     */
    Molecule.prototype.getAtomFromIndex = function (sIndex) {
        var retAtom = undefined;
        this._atoms.forEach(function (atom) {
            if (atom._id === sIndex) {
                retAtom = atom;
            }
        });
        return retAtom;
    };
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
    Molecule.prototype.addBond = function (nFIndex, nTIndex, nMagnitude, nLength, nType, nImport) {
        var nFrom = null;
        var nTo = null;
        this._atoms.forEach(function (atom) {
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
                if (nFrom.getElectronNegativityPauling() >
                    nTo.getElectronNegativityPauling()) {
                    nFrom.updateElectrons(1, -1);
                    nTo.updateElectrons(1, 1);
                }
                else {
                    nFrom.updateElectrons(1, 1);
                    nTo.updateElectrons(1, -1);
                }
            }
            if (nImport === undefined) {
                this._kekule_obj.appendBond([nFrom._kekule_obj, nTo._kekule_obj], nMagnitude, this._bondTypes.includes(nType, 1)
                    ? nType
                    : this._bondTypes[this._bondTypes.length - 1]);
            }
            this._bonds.push(new Bond(nType, nMagnitude, nLength, nFrom, nTo, this._bondCount));
            this._bondCount += 1;
        }
        this.calcTotalCharge();
    };
    /**
     * Removes an {@link Atom} from the molecule and corrects all corresponding variables
     *
     * @public
     * @param {number} rIndex - the id of the atom to be removed
     */
    Molecule.prototype.remAtom = function (rIndex) {
        var rAtom = null;
        var curr_bonds = this._bonds.length;
        var to_remove = [];
        this._atoms.forEach(function (atom) {
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
    };
    /**
     * Removes an {@link Bond} from the molecule
     *
     * @public
     * @param {number} rIndex - the id of the bond to be removed
     */
    Molecule.prototype.remBond = function (rIndex) {
        var rBond = null;
        var kek_curr_bonds = this._kekule_obj.connectors.length;
        var to_remove = [];
        var removed = 0;
        this._bonds.forEach(function (bond) {
            if (bond._id === rIndex) {
                rBond = bond;
            }
        });
        for (var i = 0; i < kek_curr_bonds; i++) {
            var kek_bond = this._kekule_obj.connectors[i];
            if ((rBond._from._kekule_obj === kek_bond.connectedObjs[0] &&
                rBond._to._kekule_obj === kek_bond.connectedObjs[1]) ||
                (rBond._from._kekule_obj === kek_bond.connectedObjs[1] &&
                    rBond._to._kekule_obj === kek_bond.connectedObjs[0])) {
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
    };
    return Molecule;
}());
export { Molecule };
//# sourceMappingURL=Molecule.js.map