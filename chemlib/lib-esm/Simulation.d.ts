import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";
import { ElectricComponent } from "./ElectricComponent";
/**
 * A static class used to access all chemical simulations
 *
 * @export
 * @abstract
 * @class Simulation
 * @typedef {Simulation}
 */
export declare abstract class Simulation {
    /**
     * The default volume for transfer of chemicals in litres (default: 1mL)
     *
     * @static
     * @type {number}
     */
    static _simStepSize: number;
    /**
     * The default time step used for simuations in seconds
     *
     * @static
     * @type {number}
     */
    static _simTimeStep: number;
    /**
     * Faradays constant: The charge contained in one mole in C/mol
     *
     * @static
     * @readonly
     * @type {number}
     */
    static readonly _faradayConst: number;
    /**
     * Ideal gas constant in J/mol*K
     *
     * @static
     * @readonly
     * @type {number}
     */
    static readonly _gasConst: number;
    /**
     * Setter for {@link _simStepSize}
     *
     * @public
     * @static
     * @param {number} nValue
     */
    static setSimStepSize(nValue: number): void;
    /**
     * Setter for {@link _simTimeStep}
     *
     * @public
     * @static
     * @param {number} nValue
     */
    static setSimTimeStep(nValue: number): void;
    /**
     * Simulation of the solvation of molecules in aqueous solution, including neutralization of acids and bases
     *
     * @public
     * @static
     * @param {Mixture} cMixture - the solution to simulate
     */
    static sSolvation(cMixture: Mixture): void;
    /**
     * Splits a molecule at its first ionic or acidbase bond into two conjugate
     * parts and caches them in {@link StructureManager._moleculeParts}. Returns
     * the cached parts, or undefined if the molecule has no such bond.
     *
     * @private
     * @static
     * @param {Molecule} cMolecule - the molecule to dissociate
     * @returns {[Molecule, Molecule]}
     */
    private static cacheDissociation;
    /**
     * Looks up the redox couple (reduced form, oxidized form, electron count,
     * standard electrode potential) for an element by its molar mass, as used
     * internally by {@link sEChem}.
     *
     * @public
     * @static
     * @param {Molecule} molecule - a neutral element or its ion
     * @returns {({ red: string; ox: string; el: number; sep: number } | undefined)}
     */
    static getRedoxData(molecule: Molecule): {
        red: string;
        ox: string;
        el: number;
        sep: number;
    } | undefined;
    /**
     * Faraday's laws of electrolysis: converts a charge passed through an
     * electrode into the amount of substance converted there and its mass.
     * The 1st law (mass proportional to charge) follows from dividing by
     * {@link _faradayConst}; the 2nd law (for equal charge, mass proportional
     * to the equivalent weight M/z) follows from comparing the result across
     * electrodes with different `electronCount`/`molarMass`.
     *
     * @public
     * @static
     * @param {number} chargeCoulombs - charge passed, Q = I*t, in coulombs
     * @param {number} electronCount - electrons transferred per particle (z)
     * @param {number} molarMass - molar mass of the converted substance in g/mol
     * @returns {{electronMol: number, substanceMol: number, massGrams: number}}
     */
    static faradayLaw(chargeCoulombs: number, electronCount: number, molarMass: number): {
        electronMol: number;
        substanceMol: number;
        massGrams: number;
    };
    /**
     * Simulation of a galvanic element or an electrolysis
     *
     * @public
     * @static
     * @param {ElectricComponent} sElectrode1 - first electrode
     * @param {ElectricComponent} sElectrode2 - second electrode
     * @param {ElectricComponent} sDevice - device in between the electrodes: Source or voltmeter
     */
    static sEChem(sElectrode1: ElectricComponent, sElectrode2: ElectricComponent, sDevice: ElectricComponent): void;
    /**
     * neutralizes H+ ions and OH- ions and adds water accordingly: Returns the molar amount if neutralized ions
     *
     * @public
     * @static
     * @param {Mixture} sMix - the current solution
     * @returns {number}
     */
    static sNeutralize(sMix: Mixture): number;
    /**
     * Dissoziation of salts: Returns true because salts dissoziate completely
     *
     * @private
     * @static
     * @param {Mixture} sMix - the current solution
     * @param {Molecule} cMolecule - the undissoziated salt molecule
     * @param {Molecule} pMolecule1 - one ion, cation or anion
     * @param {Molecule} pMolecule2 - one ion, cation or anion
     * @returns {boolean}
     */
    private static sEquilibriumSalt;
    /**
     * Calculates and returns the pH value of a given solution
     *
     * @public
     * @static
     * @param {Mixture} sMix - the current solution
     * @returns {number}
     */
    static getpH(sMix: Mixture): number;
}
