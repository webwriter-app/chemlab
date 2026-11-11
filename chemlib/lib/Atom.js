import { ElementData } from "./ElementData";
/**
 * Representation of an atom
 *
 * @class Atom
 * @typedef {Atom}
 */
var Atom = /** @class */ (function () {
    /**
     * Returns a new atom object
     *
     * @constructor
     * @param {string} pName - the name of the element
     * @param {*} nkek - a possible underlying kekule.js atom object
     * @param {number} [pIonicCharge=0] - the ionic charge (default is 0)
     * @param {number} nIndex- the id of the object
     */
    function Atom(pName, nkek, pIonicCharge, nIndex) {
        if (pIonicCharge === void 0) { pIonicCharge = 0; }
        /**
         * The ionic charge of the atom
         *
         * @type {number}
         */
        this._ionicCharge = 0;
        /**
         * The x and y positions of the atom within a molecule. Used to draw the shape
         *
         * @type {Array<number>}
         */
        this._pos2D = undefined;
        this._id = nIndex;
        this._element = ElementData.getData(pName);
        this._kekule_obj = nkek;
        this.setIonicCharge(pIonicCharge);
        this._kekule_obj.charge = pIonicCharge;
        this.updateElectrons(0, 0);
    }
    /**
     * Sets the current charge and number of bonding electrons and updates the electron configuration
     *
     * @public
     * @param {number} uValue - the number of new bonds
     * @param {number} uCharge - the amount of new charges
     */
    Atom.prototype.updateElectrons = function (uValue, uCharge) {
        if (uValue != 0) {
            this.setIonicCharge(this._ionicCharge + uCharge);
            this._kekule_obj.charge = this._ionicCharge;
        }
        this._bondingElectrons = this.getElectrons() - uValue;
        this._effectiveElectronConfiguration = ElementData.getData(ElementData.getNameBeforeAfter(this._element["name"].toLowerCase(), -this._ionicCharge))["electron_configuration"];
        this._effectiveElectronConfigurationSemantic = ElementData.getData(ElementData.getNameBeforeAfter(this._element["name"].toLowerCase(), -this._ionicCharge))["electron_configuration_semantic"];
    };
    /**
     * Setter for the {@link _pos2D} Array
     *
     * @public
     * @param {number} nX - new x coordinate
     * @param {number} nY - new y coordinate
     */
    Atom.prototype.setPos2D = function (nX, nY) {
        this._pos2D = [nX, nY];
        this
            ._kekule_obj
            .setCoord2D({ x: nX, y: nY });
    };
    /**
     * Returns the corresponding kekule.js object
     *
     * @public
     * @returns {*}
     */
    Atom.prototype.getKekuleObj = function () { return this._kekule_obj; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getName = function () { return this._element["name"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getProtons = function () { return this._element["number"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getElectrons = function () { return this._element["number"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getNeutrons = function () { return this._element["number"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getNumber = function () { return this._element["number"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getAtomicMass = function () { return this._element["atomic_mass"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getDensity = function () { return this._element["density"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getBoil = function () { return this._element["boil"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getCategory = function () { return this._element["category"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getMelt = function () { return this._element["melt"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getMolarHeat = function () { return this._element["molar_heat"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getPeriod = function () { return this._element["period"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getGroup = function () { return this._element["group"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getPhase = function () { return this._element["phase"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getElectronConfiguration = function () { return this._element["electron_configuration"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getElectronConfigurationSemantic = function () { return this._element["electron_configuration_semantic"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getElectronAffinity = function () { return this._element["electron_affinity"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getElectronNegativityPauling = function () { return this._element["electronegativity_pauling"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getBlock = function () { return this._element["block"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getSymbol = function () { return this._element["symbol"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getDiscoveryBy = function () { return this._element["discovered_by"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getNamedBy = function () { return this._element["named_by"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getSource = function () { return this._element["source"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getBohrModelImage = function () { return this._element["bohr_mode_image"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getBohrModel3D = function () { return this._element["bohr_model_3d"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getSpectralImg = function () { return this._element["spectral_img"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getSummary = function () { return this._element["summery"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getYpos = function () { return this._element["ypos"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getWXpos = function () { return this._element["wxpos"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getWYpos = function () { return this._element["wypos"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getXpos = function () { return this._element["xpos"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {[number]}
     */
    Atom.prototype.getShells = function () {
        return this._element["shells"];
    };
    /**
     * Getter for named property
     *
     * @public
     * @returns {[number]}
     */
    Atom.prototype.getIonizationEnergies = function () {
        return this._element["ionization_energies"];
    };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getCPKHEX = function () { return this._element["cpk-hex"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {object}
     */
    Atom.prototype.getImage = function () { return this._element["image"]; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {string}
     */
    Atom.prototype.getIonicType = function () { return this._ionicType; };
    /**
     * Getter for named property
     *
     * @public
     * @returns {number}
     */
    Atom.prototype.getIonicCharge = function () { return this._ionicCharge; };
    /**
     * Sets the ionic charge of the atom and determines if its an ion
     *
     * @public
     * @param {number} pCharge
     */
    Atom.prototype.setIonicCharge = function (pCharge) {
        this._ionicCharge = pCharge;
        if (pCharge == 0) {
            this._ionicType = "neutral";
        }
        else if (pCharge > 0) {
            this._ionicType = "Kation";
        }
        else {
            this._ionicType = "Anion";
        }
    };
    return Atom;
}());
export { Atom };
//# sourceMappingURL=Atom.js.map