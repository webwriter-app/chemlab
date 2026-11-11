import { EComponentType, ElectricComponent } from "./ElectricComponent";
import { ChemComponent } from "./ChemComponent";
/**
 * An abstact managing class for all components
 *
 * @export
 * @abstract
 * @class ComponentManager
 * @typedef {ComponentManager}
 */
var ComponentManager = /** @class */ (function () {
    function ComponentManager() {
    }
    /**
     * Generates and returns an new {@link ChemComponent} object with an id representing the next value of the chem component count
     *
     * @public
     * @static
     * @param {ComponentType} nType - the type of the component from {@link ComponentType}: Testtube, Beaker, Flask, Condenser, Separatingfunnel, Burette
     * @param {?Mixture} [nMixture] - a possible initial {@link Mixture} object as the content
     * @returns {ChemComponent}
     */
    ComponentManager.newChemComponent = function (nType, nMixture) {
        this._chemComponentCount += 1;
        return new ChemComponent(this._chemComponentCount + this._electricComponentCount - 1, nType, nMixture);
    };
    /**
     * Generates and returns an new {@link ElectricComponent} object with an id representing the next value of the electric component count
     *
     * @public
     * @static
     * @param {EComponentType} nType - the type of the component from {@link EComponentType}: Electrode, Cable, Source, Voltmeter
     * @param {{
     * 			nMixture?: Mixture;
     * 			nMaterial?: Molecule;
     * 			nSourceVoltage?: number;
     * 		}} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Mixture} param0.nMixture - for electrodes: The possible initially connected solution
     * @param {Molecule} param0.nMaterial - for electrodes: The electrodes material, molecule should be neutral
     * @param {number} param0.nSourceVoltage - for voltage sources: The source voltage
     * @param {number} param0.nSourceCurrent - for voltage sources: The source current
     * @returns {ElectricComponent}
     */
    ComponentManager.newElectricComponent = function (nType, _a) {
        var _b = _a === void 0 ? {} : _a, nMixture = _b.nMixture, nMaterial = _b.nMaterial, nSourceVoltage = _b.nSourceVoltage, nSourceCurrent = _b.nSourceCurrent;
        this._electricComponentCount += 1;
        return new ElectricComponent(this._electricComponentCount + this._chemComponentCount - 1, nType, {
            nMixture: nMixture,
            nMaterial: nMaterial,
            nSourceVoltage: nSourceVoltage,
            nSourceCurrent: nSourceCurrent,
        });
    };
    /**
     * returns whether two objects are electrically connected
     *
     * @public
     * @static
     * @param {ElectricComponent} component1 - the first object
     * @param {ElectricComponent} component2 - the second object
     * @returns {boolean}
     */
    ComponentManager.isConnected = function (component1, component2) {
        var conStatus = false;
        var visited = new Array();
        var currComponent = component1;
        while (!conStatus) {
            visited.push(currComponent._id);
            if (currComponent === component2) {
                conStatus = true;
            }
            else {
                var hasNext = false;
                currComponent._connections.forEach(function (conElem) {
                    if (!visited.includes(conElem._id)) {
                        hasNext = true;
                        currComponent = conElem;
                    }
                });
                if (!hasNext) {
                    break;
                }
            }
        }
        return conStatus;
    };
    /**
     * checks if a complete circuit is available
     *
     * @public
     * @static
     * @param {ElectricComponent} testComponent - an object from the circuit
     * @returns {ElectricComponent[]}
     */
    ComponentManager.isCircuit = function (testComponent) {
        // breadth-first traversal of the connection graph, using `visited`
        // itself as the queue with `cursor` as the read pointer
        var visited = [testComponent];
        var cursor = 0;
        while (cursor < visited.length) {
            visited[cursor]._connections.forEach(function (component) {
                if (typeof (component) != 'undefined' && !visited.includes(component)) {
                    visited.push(component);
                }
            });
            cursor += 1;
        }
        var componentsNoCables = [];
        visited.forEach(function (component) {
            if (component._type === EComponentType.Electrode) {
                componentsNoCables.unshift(component);
            }
            if (component._type === EComponentType.Source ||
                component._type === EComponentType.Voltmeter) {
                componentsNoCables.push(component);
            }
        });
        if (componentsNoCables.length === 3) {
            return componentsNoCables;
        }
        return [];
    };
    /**
     * the number of the current {@link ChemComponent} objects minus one
     *
     * @static
     * @type {number}
     */
    ComponentManager._chemComponentCount = 0;
    /**
     * The standard volumes of all chemComponents in mL
     *
     * @type {object}
     */
    ComponentManager._standardVolumes = {
        testtube: 10,
        beaker: 400,
        flask: 250,
        burette: 25,
        separatingfunnel: 250,
        Condenser: 1000
    };
    /**
     * the number of the current {@link ElectricComponent} objects minus one
     *
     * @static
     * @type {number}
     */
    ComponentManager._electricComponentCount = 0;
    return ComponentManager;
}());
export { ComponentManager };
//# sourceMappingURL=ComponentManager.js.map