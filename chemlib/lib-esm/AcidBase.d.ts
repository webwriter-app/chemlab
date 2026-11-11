/**
 * General aqueous acid–base equilibrium solver.
 *
 * This module is intentionally free of any {@link Mixture}/{@link Molecule}
 * dependency: it operates purely on numbers so it can be reused for any
 * acid/base scenario (single acid or base, buffers, polyprotic systems,
 * titration at any point) and unit-tested in isolation.
 *
 * The core idea is to describe the solution as a set of conjugate acid/base
 * {@link AcidBaseSystem}s plus a net "spectator" charge (fully dissociated
 * strong-electrolyte ions that do not take part in proton transfer), and then
 * solve the electroneutrality (charge-balance) condition for the free proton
 * concentration [H+]. Everything else — pH, pOH, degree of dissociation, the
 * full species distribution — follows from that single value.
 */
/**
 * A conjugate acid/base system, e.g. acetic acid/acetate or NH4(+)/NH3.
 *
 * @typedef {AcidBaseSystem}
 */
export interface AcidBaseSystem {
    /**
     * Total analytical concentration of the whole conjugate family in mol/L,
     * i.e. the sum over every protonation state ([HA] + [A-], or
     * [H2A] + [HA-] + [A2-], ...).
     */
    totalC: number;
    /**
     * Successive acid dissociation constants as pKa values, ordered from the
     * most acidic proton first (pKa1, pKa2, ...). The length equals the number
     * of ionizable protons, so a monoprotic acid has one entry and a diprotic
     * acid two.
     */
    pKa: number[];
    /**
     * Charge of the fully protonated form. 0 for a neutral acid such as
     * CH3COOH, +1 for a cationic acid such as NH4(+), -1 for an anionic acid
     * such as HSO4(-) treated on its own, and so on. Each successive
     * deprotonation lowers the charge by one.
     */
    protonatedCharge: number;
}
/**
 * Static solver for aqueous acid–base equilibria.
 *
 * @export
 * @abstract
 * @class AcidBase
 * @typedef {AcidBase}
 */
export declare abstract class AcidBase {
    /**
     * Ion product of water at 25 °C (mol^2/L^2).
     *
     * @static
     * @type {number}
     */
    static Kw: number;
    /**
     * Net charge concentration contributed by one {@link AcidBaseSystem} at a
     * given proton concentration.
     *
     * The relative abundance of each protonation state k (k protons already
     * removed) is delta_k = (Ka_1 * ... * Ka_k) / [H+]^k, and its charge is
     * `protonatedCharge - k`. The contribution is the concentration-weighted
     * average charge times the total analytical concentration.
     *
     * @public
     * @static
     * @param {AcidBaseSystem} system - the conjugate system
     * @param {number} H - the proton concentration [H+] in mol/L
     * @returns {number} the signed charge concentration in mol/L
     */
    static systemCharge(system: AcidBaseSystem, H: number): number;
    /**
     * Electroneutrality residual: the net charge concentration of the whole
     * solution at a trial proton concentration. Its unique root in [H+] is the
     * equilibrium proton concentration.
     *
     * @private
     * @static
     * @param {number} H - trial proton concentration [H+]
     * @param {AcidBaseSystem[]} systems - all conjugate acid/base systems
     * @param {number} spectatorCharge - net charge of spectator ions (mol/L)
     * @param {number} Kw - ion product of water
     * @returns {number}
     */
    private static chargeResidual;
    /**
     * Solves the charge balance for the equilibrium proton concentration [H+].
     *
     * The residual is strictly monotonic in [H+], so a bisection on the pH
     * scale converges reliably for any physically meaningful composition.
     *
     * @public
     * @static
     * @param {AcidBaseSystem[]} systems - all conjugate acid/base systems
     * @param {number} spectatorCharge - net charge concentration of spectator
     *   ions in mol/L (strong-base cations positive, strong-acid anions
     *   negative)
     * @param {number} [Kw=AcidBase.Kw] - ion product of water
     * @returns {number} the proton concentration [H+] in mol/L
     */
    static solveProton(systems: AcidBaseSystem[], spectatorCharge: number, Kw?: number): number;
    /**
     * Convenience wrapper returning the pH directly.
     *
     * @public
     * @static
     * @param {AcidBaseSystem[]} systems - all conjugate acid/base systems
     * @param {number} spectatorCharge - net spectator ion charge (mol/L)
     * @param {number} [Kw=AcidBase.Kw] - ion product of water
     * @returns {number} the pH of the solution
     */
    static pH(systems: AcidBaseSystem[], spectatorCharge: number, Kw?: number): number;
}
