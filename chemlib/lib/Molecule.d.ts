import { Atom } from "./Atom";
import { Bond } from "./Bond";
/**
 * Representation of a molecule
 *
 * @class Molecule
 * @typedef {Molecule}
 */
declare class Molecule {
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
    name: string;
    /**
     * The current SMILES representation of the molecule
     *
     * @type {string}
     */
    smilesString: string;
    /**
     * The current InChi representation of the molecule. Must be generated seperately
     *
     * @type {string}
     */
    InChiString: string;
    /**
     * The current InChi key of the molecule. Must be generated seperately
     *
     * @type {string}
     */
    InChIKey: string;
    /**
     * The number of atoms in the molecule
     *
     * @type {number}
     */
    _atomCount: number;
    /**
     * The number of bonds in the molecule
     *
     * @type {number}
     */
    _bondCount: number;
    /**
     * The total charge of the molecule
     *
     * @type {number}
     */
    _totalCharge: number;
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
    constructor(nIndex: number, nKek?: any);
    /**
     * Generates the {@link smilesString} of the molecule using kekule.js
     *
     * @public
     */
    setSmilesString(): void;
    /**
     * Calculates and sets the {@link _totalCharge} of the molecule
     *
     * @public
     */
    calcTotalCharge(): void;
    /**
     * Returns the total molar mass of the molecule
     *
     * @public
     * @returns {number}
     */
    getTotMolMass(): number;
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
    addAtom(nName: string, nSymbol: string, nIonicCharge?: number, nPos2Dx?: number, nPos2Dy?: number, nImport?: any): Atom;
    /**
     * Returns a specific {@link Atom} of the molecule by its id
     *
     * @public
     * @param {number} sIndex - the id of the {@link Atom} object
     * @returns {Atom}
     */
    getAtomFromIndex(sIndex: number): Atom;
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
    addBond(nFIndex: number, nTIndex: number, nMagnitude: number, nLength: number, nType: string, nImport?: any): void;
    /**
     * Removes an {@link Atom} from the molecule and corrects all corresponding variables
     *
     * @public
     * @param {number} rIndex - the id of the atom to be removed
     */
    remAtom(rIndex: number): void;
    /**
     * Removes an {@link Bond} from the molecule
     *
     * @public
     * @param {number} rIndex - the id of the bond to be removed
     */
    remBond(rIndex: number): void;
}
export { Molecule };
