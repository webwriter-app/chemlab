/**
 * An enum for the specific electric component types, used for identification
 *
 * @export
 * @enum {number}
 */
export var EComponentType;
(function (EComponentType) {
    EComponentType["Electrode"] = "electrode";
    EComponentType["Cable"] = "cable";
    EComponentType["Source"] = "source";
    EComponentType["Voltmeter"] = "voltmeter";
})(EComponentType || (EComponentType = {}));
/**
 * Representation of an electric component
 *
 * @class ElectricComponent
 * @typedef {ElectricComponent}
 */
var ElectricComponent = /** @class */ (function () {
    /**
     * Creates a new electric component.
     *
     * @constructor
     * @param {number} nIndex - the given object id
     * @param {EComponentType} nType - the type of the electrical component
     * @param {{
     * 			nMixture?: Mixture;
     * 			nMaterial?: Molecule;
     * 			nSourceVoltage?: number;
     * 			nSourceCurrent?: number;
     * 		}} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Mixture} param0.nMixture - for electrodes: The possible initially connected solution
     * @param {Molecule} param0.nMaterial - for electrodes: The electrodes material, molecule should be neutral
     * @param {number} param0.nSourceVoltage - for voltage sources: The source voltage
     * @param {number} param0.nSourceCurrent - for voltage sources: The source current
     */
    function ElectricComponent(nIndex, nType, _a) {
        var _b = _a === void 0 ? {} : _a, nMixture = _b.nMixture, nMaterial = _b.nMaterial, nSourceVoltage = _b.nSourceVoltage, nSourceCurrent = _b.nSourceCurrent;
        this._type = nType;
        this._id = nIndex;
        this._connections = new Array();
        switch (this._type) {
            case EComponentType.Source:
                this._conCount = 2;
                this._sourceVoltage = nSourceVoltage;
                this._sourceCurrent = nSourceCurrent;
            case EComponentType.Voltmeter:
                this._visibleVoltage = 0;
            case EComponentType.Cable:
                this._conCount = 2;
                break;
            case EComponentType.Electrode:
                this._conCount = 1;
                this._material = nMaterial;
                this._connectedMix = nMixture;
                break;
            default:
                break;
        }
    }
    /**
     * Connects one electric component to another
     *
     * @public
     * @param {ElectricComponent} nComposite - the other component
     */
    ElectricComponent.prototype.connect = function (nComposite) {
        var message = "";
        if (this._conCount > this._connections.length &&
            nComposite._conCount > nComposite._connections.length) {
            this._connections.push(nComposite);
            nComposite._connections.push(this);
        }
        else {
            message = "Mindestens eine Komponente hat keine Ein/Ausgänge mehr.";
        }
        return message;
    };
    /**
     * Removes an existing connection
     *
     * @public
     * @param {ElectricComponent} rComposite - the connected component
     */
    ElectricComponent.prototype.disconnect = function (rComposite) {
        var message = "";
        if (this._connections.includes(rComposite) && rComposite._connections.includes(this)) {
            this._connections.splice(this._connections.indexOf(rComposite), 1);
            rComposite._connections.splice(rComposite._connections.indexOf(this), 1);
        }
        else {
            message = "Die gewählten Komponenten sind nicht verbunden.";
        }
        return message;
    };
    /**
     * for electrodes: sets the connected mixture
     *
     * @public
     * @param {Mixture} nMix - the solution to connect to
     */
    ElectricComponent.prototype.setMixture = function (nMix) {
        if (this._type === EComponentType.Electrode) {
            this._connectedMix = nMix;
        }
    };
    return ElectricComponent;
}());
export { ElectricComponent };
//# sourceMappingURL=ElectricComponent.js.map