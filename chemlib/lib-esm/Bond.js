/**
 * Representation of an atomic bond
 *
 * @class Bond
 * @typedef {Bond}
 */
var Bond = /** @class */ (function () {
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
    function Bond(pType, pMagnitude, pLength, pFrom, pTo, pIndex) {
        this._id = pIndex;
        this._type = pType;
        this._magnitude = pMagnitude;
        this._length = pLength;
        this._from = pFrom;
        this._to = pTo;
    }
    /**
     * Returns the type of the bond
     *
     * @public
     * @returns {string}
     */
    Bond.prototype.getType = function () {
        return this._type;
    };
    /**
     * Returns the length of the bond
     *
     * @public
     * @returns {number}
     */
    Bond.prototype.getLength = function () {
        return this._length;
    };
    /**
     * Returns the magnitude of the bond
     *
     * @public
     * @returns {number}
     */
    Bond.prototype.getMagnitude = function () {
        return this._magnitude;
    };
    return Bond;
}());
export { Bond };
//# sourceMappingURL=Bond.js.map