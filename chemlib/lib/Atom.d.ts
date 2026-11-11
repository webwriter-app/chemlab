/**
 * Representation of an atom
 *
 * @class Atom
 * @typedef {Atom}
 */
declare class Atom {
    /**
     * the element of the atom shown via a data subset from {@link ElementData}
     *
     * @readonly
     * @type {object}
     */
    readonly _element: object;
    /**
     * The ionic charge of the atom
     *
     * @type {number}
     */
    _ionicCharge: number;
    /**
     * The ionic type of the atom (cation/anion/neutral)
     *
     * @type {string}
     */
    _ionicType: string;
    /**
     * The number of current bonding electrons of the atom
     *
     * @type {number}
     */
    _bondingElectrons: number;
    /**
     * The current electron configuration of the atom including its charge
     *
     * @type {string}
     */
    _effectiveElectronConfiguration: string;
    /**
     * The current electron configuration of the atom in sematic representation including its charge
     *
     * @type {string}
     */
    _effectiveElectronConfigurationSemantic: string;
    /**
     * The corresponding kekule.js object
     *
     * @type {*}
     */
    _kekule_obj: any;
    /**
     * The x and y positions of the atom within a molecule. Used to draw the shape
     *
     * @type {Array<number>}
     */
    _pos2D: Array<number>;
    /**
     * The specific id of the object
     *
     * @readonly
     * @type {number}
     */
    readonly _id: number;
    /**
     * Returns a new atom object
     *
     * @constructor
     * @param {string} pName - the name of the element
     * @param {*} nkek - a possible underlying kekule.js atom object
     * @param {number} [pIonicCharge=0] - the ionic charge (default is 0)
     * @param {number} nIndex- the id of the object
     */
    constructor(pName: string, nkek: any, pIonicCharge: number, nIndex: number);
    /**
     * Sets the current charge and number of bonding electrons and updates the electron configuration
     *
     * @public
     * @param {number} uValue - the number of new bonds
     * @param {number} uCharge - the amount of new charges
     */
    updateElectrons(uValue: number, uCharge: number): void;
    /**
     * Setter for the {@link _pos2D} Array
     *
     * @public
     * @param {number} nX - new x coordinate
     * @param {number} nY - new y coordinate
     */
    setPos2D(nX: number, nY: number): void;
    /**
     * Returns the corresponding kekule.js object
     *
     * @public
     * @returns {*}
     */
    getKekuleObj(): any;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getName(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getProtons(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getElectrons(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getNeutrons(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getNumber(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getAtomicMass(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getDensity(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getBoil(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getCategory(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getMelt(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getMolarHeat(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getPeriod(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getGroup(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getPhase(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getElectronConfiguration(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getElectronConfigurationSemantic(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getElectronAffinity(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getElectronNegativityPauling(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getBlock(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getSymbol(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getDiscoveryBy(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getNamedBy(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getSource(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getBohrModelImage(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getBohrModel3D(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getSpectralImg(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getSummary(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getYpos(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getWXpos(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getWYpos(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getXpos(): number;
    /**
     * Getter for named property
     *
     * @public
     * @returns {[number]}
     */
    getShells(): [number];
    /**
     * Getter for named property
     *
     * @public
     * @returns {[number]}
     */
    getIonizationEnergies(): [number];
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getCPKHEX(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {object}
     */
    getImage(): object;
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    getIonicType(): string;
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    getIonicCharge(): number;
    /**
     * Sets the ionic charge of the atom and determines if its an ion
     *
     * @public
     * @param {number} pCharge
     */
    setIonicCharge(pCharge: number): void;
}
export { Atom };
