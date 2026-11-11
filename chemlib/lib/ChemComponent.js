import { ComponentManager } from "./ComponentManager";
import { Simulation } from "./Simulation";
import { StructureManager } from "./StructureManager";
/**
 * An enum for the specific component types, used for identification
 *
 * @export
 * @enum {number}
 */
export var ComponentType;
(function (ComponentType) {
    ComponentType["Testtube"] = "testtube";
    ComponentType["Beaker"] = "beaker";
    ComponentType["Flask"] = "flask";
    ComponentType["Condenser"] = "condenser";
    ComponentType["Separatingfunnel"] = "separatingfunnel";
    ComponentType["Burette"] = "burette";
})(ComponentType || (ComponentType = {}));
/**
 * Representation of a chemical lab component
 *
 * @class ChemComponent
 * @typedef {ChemComponent}
 */
var ChemComponent = /** @class */ (function () {
    /**
     * Creates a new chemical component.
     *
     * @constructor
     * @param {number} nIndex - the object id
     * @param {ComponentType} nType - the component type out of {@link ComponentType}
     * @param {Mixture} [nMixture=StructureManager.newMixture()] - the initial contents of the component, optional
     */
    function ChemComponent(nIndex, nType, nMixture) {
        if (nMixture === void 0) { nMixture = StructureManager.newMixture(); }
        /**
         * The component's max volume in litres
         *
         * @type {number}
         */
        this._volume = 1;
        /**
         * The volume of contents in L that'll get transferred from the component by default when calling {@link transferContents}
         *
         * @type {number}
         */
        this._outVol = 0;
        this._type = nType;
        this._id = nIndex;
        switch (this._type) {
            case ComponentType.Beaker:
            case ComponentType.Flask:
            case ComponentType.Testtube:
                this._inOutLimits = [1, 0];
                break;
            case ComponentType.Condenser:
                this._inOutLimits = [1, 1];
                break;
            case ComponentType.Burette:
            case ComponentType.Separatingfunnel:
                this._inOutLimits = [0, 1];
                this._outVol = Simulation._simStepSize;
                break;
            default:
                this._inOutLimits = [0, 0];
                break;
        }
        this._inlets = new Array();
        this._outlets = new Array();
        this._influences = new Array();
        this._content = nMixture;
        this._volume = ComponentManager._standardVolumes[nType.toLowerCase()];
    }
    /**
     * Sets the default output volume in {@link _outVol}
     *
     * @public
     * @param {number} nAmount - the new volume in litres
     */
    ChemComponent.prototype.setOutVol = function (nAmount) {
        if (this._type === ComponentType.Separatingfunnel ||
            this._type === ComponentType.Burette) {
            this._outVol = nAmount;
        }
    };
    /**
     * Connects one component to another, if possible
     *
     * @public
     * @param {ChemComponent} nComposit - the other component
     */
    ChemComponent.prototype.connect = function (nComposit) {
        if (this._outlets.length < this._inOutLimits[1] &&
            nComposit._inlets.length < nComposit._inOutLimits[0]) {
            this._outlets.push(nComposit);
            nComposit._inlets.push(this);
        }
    };
    /**
     * adds one {@link Molecule} or a whole {@link Mixture} in the specified quantity to the components content
     *
     * @public
     * @param {{ nMix?: Mixture; nMolecule?: Molecule; nMolAmount?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Mixture} param0.nMix - a {@link Mixture} object, when a mix shall be added
     * @param {Molecule} param0.nMolecule - a {@link Molecule} object, when a single molecule shall be added
     * @param {number} param0.nMolAmount - the amount in moles
     */
    ChemComponent.prototype.addContents = function (_a) {
        var _b = _a === void 0 ? {} : _a, nMix = _b.nMix, nMolecule = _b.nMolecule, nMolAmount = _b.nMolAmount;
        if (nMix != null && nMolecule == null) {
            if (this._content == null) {
                if (nMolAmount == null) {
                    this._content = nMix;
                    return;
                }
                else {
                    this._content = StructureManager.newMixture();
                    this.addContents({
                        nMix: nMix,
                        nMolecule: nMolecule,
                        nMolAmount: nMolAmount,
                    });
                }
            }
            else {
                for (var _i = 0, _c = nMix._activeMolecules; _i < _c.length; _i++) {
                    var mol = _c[_i];
                    this._content.addMolecule(mol, nMolAmount == null
                        ? nMix._molProperties[mol._id + "n"]
                        : Math.min(nMix._molProperties[mol._id + "n"], nMolAmount));
                }
            }
        }
        if (nMix == null && nMolecule != null) {
            if (this._content != null) {
                this._content.addMolecule(nMolecule, nMolAmount == null ? Simulation._simStepSize : nMolAmount);
            }
        }
        Simulation.sSolvation(this._content);
    };
    /**
     * transfers contents of the component to another. Either a single molecule or a part of the entire mix, if no molecule is specified
     *
     * @public
     * @param {{ tMol?: Molecule; tVolume?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Molecule} param0.tMol - a {@link Molecule} object, if a molecule shall be transfered
     * @param {number} param0.tVolume: tVolume - the volume to be transferred. An empty value either means everything or a specific amount based on the type of the component
     * @param {ChemComponent} tDest - the component object, to which the contents shall be transferred to
     */
    ChemComponent.prototype.transferContents = function (_a, tDest) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, tMol = _b.tMol, tVolume = _b.tVolume;
        // console.log(tDest)
        if (tDest._inOutLimits[0] > 0) {
            if (tMol != null) {
                tDest.addContents({
                    nMolecule: tMol,
                    nMolAmount: tVolume == null
                        ? this._outVol === 0
                            ? this._content._molProperties[tMol._id + "n"]
                            : Math.min(this._outVol * this._content._molProperties[tMol._id + "c"], this._content._molProperties[tMol._id + "n"])
                        : Math.min(tVolume * this._content._molProperties[tMol._id + "c"], this._content._molProperties[tMol._id + "n"]),
                });
                this._content.changeMolecule(tMol._id, -(tVolume == null
                    ? this._outVol === 0
                        ? this._content._molProperties[tMol._id + "n"]
                        : this._outVol * this._content._molProperties[tMol._id + "c"]
                    : tVolume * this._content._molProperties[tMol._id + "c"]));
            }
            if (tMol == null) {
                var molData_1 = [];
                this._content._activeMolecules.forEach(function (mol) {
                    molData_1.push([
                        mol._id,
                        _this._content._molProperties[mol._id + "c"],
                        _this._content._molProperties[mol._id + "n"],
                    ]);
                });
                molData_1.forEach(function (data) {
                    var mol = _this._content._activeMolecules.find(function (mol) {
                        return mol._id === data[0];
                    });
                    tDest.addContents({
                        nMolecule: mol,
                        nMolAmount: tVolume == null
                            ? _this._outVol === 0
                                ? data[2]
                                : Math.min(_this._outVol * data[1], data[2])
                            : Math.min(tVolume * data[1], data[2]),
                    });
                    _this._content.changeMolecule(data[0], -(tVolume == null
                        ? _this._outVol === 0
                            ? data[2]
                            : _this._outVol * data[1]
                        : tVolume * data[1]));
                });
            }
            // if(this._content._activeMolecules.length === 0){
            // 	this._content._isSolution = false
            // }
            if (tDest._content._isSolution) {
                Simulation.sNeutralize(tDest._content);
            }
        }
    };
    return ChemComponent;
}());
export { ChemComponent };
//# sourceMappingURL=ChemComponent.js.map