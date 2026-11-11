import { EComponentType, ElectricComponent } from "./ElectricComponent";
import { ChemComponent, ComponentType } from "./ChemComponent";
import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";
/**
 * An abstact managing class for all components
 *
 * @export
 * @abstract
 * @class ComponentManager
 * @typedef {ComponentManager}
 */
export declare abstract class ComponentManager {
    /**
     * the number of the current {@link ChemComponent} objects minus one
     *
     * @static
     * @type {number}
     */
    static _chemComponentCount: number;
    /**
     * The standard volumes of all chemComponents in mL
     *
     * @type {object}
     */
    static _standardVolumes: object;
    /**
     * the number of the current {@link ElectricComponent} objects minus one
     *
     * @static
     * @type {number}
     */
    static _electricComponentCount: number;
    /**
     * Generates and returns an new {@link ChemComponent} object with an id representing the next value of the chem component count
     *
     * @public
     * @static
     * @param {ComponentType} nType - the type of the component from {@link ComponentType}: Testtube, Beaker, Flask, Condenser, Separatingfunnel, Burette
     * @param {?Mixture} [nMixture] - a possible initial {@link Mixture} object as the content
     * @returns {ChemComponent}
     */
    static newChemComponent(nType: ComponentType, nMixture?: Mixture): ChemComponent;
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
    static newElectricComponent(nType: EComponentType, { nMixture, nMaterial, nSourceVoltage, nSourceCurrent, }?: {
        nMixture?: Mixture;
        nMaterial?: Molecule;
        nSourceVoltage?: number;
        nSourceCurrent?: number;
    }): ElectricComponent;
    /**
     * returns whether two objects are electrically connected
     *
     * @public
     * @static
     * @param {ElectricComponent} component1 - the first object
     * @param {ElectricComponent} component2 - the second object
     * @returns {boolean}
     */
    static isConnected(component1: ElectricComponent, component2: ElectricComponent): boolean;
    /**
     * checks if a complete circuit is available
     *
     * @public
     * @static
     * @param {ElectricComponent} testComponent - an object from the circuit
     * @returns {ElectricComponent[]}
     */
    static isCircuit(testComponent: ElectricComponent): ElectricComponent[];
}
