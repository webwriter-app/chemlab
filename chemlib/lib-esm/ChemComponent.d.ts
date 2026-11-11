import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";
/**
 * An enum for the specific component types, used for identification
 *
 * @export
 * @enum {number}
 */
export declare enum ComponentType {
    Testtube = "testtube",
    Beaker = "beaker",
    Flask = "flask",
    Condenser = "condenser",
    Separatingfunnel = "separatingfunnel",
    Burette = "burette"
}
/**
 * Representation of a chemical lab component
 *
 * @class ChemComponent
 * @typedef {ChemComponent}
 */
declare class ChemComponent {
    /**
     * The type of the component
     *
     * @type {ComponentType}
     */
    _type: ComponentType;
    /**
     * The specific id of the object
     *
     * @type {number}
     */
    _id: number;
    /**
     * A list of connected components on the intake side
     *
     * @type {Array<ChemComponent>}
     */
    _inlets: Array<ChemComponent>;
    /**
     * A list of connected components on the outtake side
     *
     * @type {Array<ChemComponent>}
     */
    _outlets: Array<ChemComponent>;
    /**
     * The component's max volume in litres
     *
     * @type {number}
     */
    _volume: number;
    /**
     * A list of components that influent the component with temperature or pressure - wip
     *
     * @type {Array<ChemComponent>}
     */
    _influences: Array<ChemComponent>;
    /**
     * The content of the component, e.g. a solution
     *
     * @type {Mixture}
     */
    _content: Mixture;
    /**
     * The volume of contents in L that'll get transferred from the component by default when calling {@link transferContents}
     *
     * @type {number}
     */
    _outVol: number;
    /**
     * The amounts of intakes an outlets of a component
     *
     * @readonly
     * @type {[number, number]}
     */
    readonly _inOutLimits: [number, number];
    /**
     * Creates a new chemical component.
     *
     * @constructor
     * @param {number} nIndex - the object id
     * @param {ComponentType} nType - the component type out of {@link ComponentType}
     * @param {Mixture} [nMixture=StructureManager.newMixture()] - the initial contents of the component, optional
     */
    constructor(nIndex: number, nType: ComponentType, nMixture?: Mixture);
    /**
     * Sets the default output volume in {@link _outVol}
     *
     * @public
     * @param {number} nAmount - the new volume in litres
     */
    setOutVol(nAmount: number): void;
    /**
     * Connects one component to another, if possible
     *
     * @public
     * @param {ChemComponent} nComposit - the other component
     */
    connect(nComposit: ChemComponent): void;
    /**
     * adds one {@link Molecule} or a whole {@link Mixture} in the specified quantity to the components content
     *
     * @public
     * @param {{ nMix?: Mixture; nMolecule?: Molecule; nMolAmount?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Mixture} param0.nMix - a {@link Mixture} object, when a mix shall be added
     * @param {Molecule} param0.nMolecule - a {@link Molecule} object, when a single molecule shall be added
     * @param {number} param0.nMolAmount - the amount in moles
     */
    addContents({ nMix, nMolecule, nMolAmount, }?: {
        nMix?: Mixture;
        nMolecule?: Molecule;
        nMolAmount?: number;
    }): void;
    /**
     * transfers contents of the component to another. Either a single molecule or a part of the entire mix, if no molecule is specified
     *
     * @public
     * @param {{ tMol?: Molecule; tVolume?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
     * @param {Molecule} param0.tMol - a {@link Molecule} object, if a molecule shall be transfered
     * @param {number} param0.tVolume: tVolume - the volume to be transferred. An empty value either means everything or a specific amount based on the type of the component
     * @param {ChemComponent} tDest - the component object, to which the contents shall be transferred to
     */
    transferContents({ tMol, tVolume }: {
        tMol?: Molecule;
        tVolume?: number;
    }, tDest: ChemComponent): void;
}
export { ChemComponent };
