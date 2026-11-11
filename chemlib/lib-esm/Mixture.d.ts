import { Molecule } from "./Molecule";
/**
 * A Representation of a mixture of one or more instances of {@link Molecule}
 *
 * @class Mixture
 * @typedef {Mixture}
 */
declare class Mixture {
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
    _solutionVolume: number;
    /**
     * Is true if the mixture is a solution
     *
     * @type {boolean}
     */
    _isSolution: boolean;
    /**
     * The current temperature of the solution in kelvin - wip
     *
     * @type {number}
     */
    _temperature: number;
    /**
     * The current temperature of the solution in pascal - wip
     *
     * @type {number}
     */
    _pressure: number;
    /**
     * Returns a new mixture object
     *
     * @constructor
     * @param {*} nIndex - the unique id for the object
     */
    constructor(nIndex: any);
    /**
     * Adds a new {@link Molecule} to the mixture or calls {@link changeMolecule()} if the object is already included in {@link _activeMolecules}
     *
     * @public
     * @param {Molecule} nMolecule - the {@link Molecule} object to add
     * @param {number} amountMol - the amount in moles
     */
    addMolecule(nMolecule: Molecule, amountMol: number): void;
    /**
     * Removes a molecule from the mixture by deleting its entries in {@link _activeMolecules} and {@link _molProperties}
     *
     * @public
     * @param {number} rId - the id of the molecule to remove
     */
    remMolecule(rId: number): void;
    /**
     * Changes the amount of a given {@link Molecule}. Calls {@link remMolecule()} if neccessary
     *
     * @public
     * @param {number} iMol - the id of the molecule
     * @param {number} amountMol - the amount to add (positive) ore remove (negative)
     */
    changeMolecule(iMol: number, amountMol: number): void;
}
export { Mixture };
