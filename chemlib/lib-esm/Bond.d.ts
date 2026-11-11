import { Atom } from "./Atom";
/**
 * Representation of an atomic bond
 *
 * @class Bond
 * @typedef {Bond}
 */
declare class Bond {
    /**
     * The bond type
     *
     * @type {string}
     */
    _type: string;
    /**
     * The bond length in nm
     *
     * @type {number}
     */
    _length: number;
    /**
     * The bond magnitude, e.g. single, double or triple bond
     *
     * @type {number}
     */
    _magnitude: number;
    /**
     * The first connected atom
     *
     * @type {Atom}
     */
    _from: Atom;
    /**
     * The second connected atom
     *
     * @type {Atom}
     */
    _to: Atom;
    /**
     * The internal id of the object
     *
     * @type {number}
     */
    _id: number;
    /**
     * Creates an instance of Bond.
     *
     * @constructor
     * @param {string} pType - the bond type mainly retrieved from kekule.js (covalent, ionic, metallic, hydrogen, acidbase)
     * @param {number} pMagnitude - the bond magnitude
     * @param {number} pLength - the bond length
     * @param {Atom} pFrom - first atom
     * @param {Atom} pTo - second atom
     * @param {number} pIndex - given object id
     */
    constructor(pType: string, pMagnitude: number, pLength: number, pFrom: Atom, pTo: Atom, pIndex: number);
    /**
     * Returns the type of the bond
     *
     * @public
     * @returns {string}
     */
    getType(): string;
    /**
     * Returns the length of the bond
     *
     * @public
     * @returns {number}
     */
    getLength(): number;
    /**
     * Returns the magnitude of the bond
     *
     * @public
     * @returns {number}
     */
    getMagnitude(): number;
}
export { Bond };
