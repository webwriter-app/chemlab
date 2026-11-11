import { Molecule } from "./Molecule";
import { Mixture } from "./Mixture";
/**
 * Static management class for {@link Mixture} and {@link Molecule} objects
 *
 * @export
 * @abstract
 * @class StructureManager
 * @typedef {StructureManager}
 */
export declare abstract class StructureManager {
    /**
     * The number of current {@link Molecule} objects minus one
     *
     * @static
     * @type {number}
     */
    static _moleculeCount: number;
    /**
     * The number of current {@link Mixture} objects minus one
     *
     * @static
     * @type {number}
     */
    static _mixtureCount: number;
    /**
     * Json object containing molecule specific information. The keys are SMILES strings
     *
     * @static
     * @type {Object}
     */
    static _moleculeData: Object;
    /**
     * A list of molecule parts e.g. dissoziated ions of salts. Gets filled at runtime
     *
     * @static
     * @type {Object}
     */
    static _moleculeParts: Object;
    static fetchSuccess: boolean;
    /**
     * Generates a new {@link Mixture} object with a unique id and returns it
     *
     * @public
     * @static
     * @returns {Mixture}
     */
    static newMixture(): Mixture;
    /**
     * Generates a new {@link Molecule} object with a unique id and returns it. Can be based on an existing kekule.js molecule object
     *
     * @public
     * @static
     * @param {?*} [nKek] - kekule.js molecule object
     * @returns {Molecule}
     */
    static newMolecule(nKek?: any): Molecule;
    /**
     * Checks wether a {@link Molecule} object represents water. Returns true if so
     *
     * @public
     * @static
     * @param {Molecule} molecule - the molecule to check
     * @returns {boolean}
     */
    static isWater(molecule: Molecule): boolean;
    /**
     * Checks wether a {@link Molecule} object represents a salt. Returns true if so
     *
     * @public
     * @static
     * @param {Molecule} molecule - the molecule to check
     * @returns {boolean}
     */
    static isSalt(molecule: Molecule): boolean;
    /**
     * Checks wether a {@link Molecule} object represents an acid or a base. Returns true if so
     *
     * @public
     * @static
     * @param {Molecule} molecule - the molecule to check
     * @returns {boolean}
     */
    static isAcidBase(molecule: Molecule): boolean;
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
    static getMoleculePart(sIndex: number, oMolecule: Molecule, fBIndex: number, nCharge: number): Molecule;
    /**
     * calculates a simple 2D structure for a {@link Molecule} object and saves the corresponding coordinates for each {@link Atom}
     *
     * @public
     * @static
     * @param {Molecule} molecule - the {@link Molecule} object to calculate on
     * @param {boolean} [bEpairs=false] - describes wether free electon pairs should be taken into account. False by default
     */
    static calcPos2D(molecule: Molecule, bEpairs?: boolean): void;
    /**
     * Returns a new {@link Molecule} object based on an existing kekule.js molecule
     *
     * @public
     * @static
     * @param {*} nKek - the underlying kekule.js molecule object
     * @returns {Molecule}
     */
    static loadFromKekule(nKek: any): Molecule;
    /**
     * Uses kekule.js to return a list of HTML elements with a drawn structure of each active {@link Molecule} in a {@link Mixture}
     *
     * @public
     * @static
     * @param {Mixture} mixture - thre {@link Mixture} to draw from
     * @param {HTMLElement} parentElement - existing HTML element to which the generated elements will be added as children
     * @returns {HTMLElement[]}
     */
    static printMolecules_arr(mixture: Mixture, dimx: number, dimy: number): string[];
    static printMolecule(molecule: Molecule, dimx: number, dimy: number): string;
    /**
     * Inputs data from {@link fetchChemData()} to a given {@link Molecule}
     *
     * @public
     * @static
     * @async
     * @param {Molecule}  - the specific {@link Molecule} object
     * @returns {*}
     */
    static getChemData(molecule: Molecule): Promise<void>;
    /**
     * Fetches the pubchem database for data based off of a given SMILES String for a molecule. Returns a promise for use in {@link getChemData()}
     *
     * @private
     * @static
     * @async
     * @template T
     * @param {string} smiles - the SMILES string to search for
     * @returns {Promise<T>}
     */
    private static fetchChemData;
}
