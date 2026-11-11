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
 * Static solver for aqueous acid–base equilibria.
 *
 * @export
 * @abstract
 * @class AcidBase
 * @typedef {AcidBase}
 */
var AcidBase = /** @class */ (function () {
    function AcidBase() {
    }
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
    AcidBase.systemCharge = function (system, H) {
        var Ka = system.pKa.map(function (p) { return Math.pow(10, -p); });
        // unnormalised abundances of each protonation state (delta_0 = 1)
        var delta = [1];
        for (var k = 0; k < Ka.length; k++) {
            delta.push((delta[k] * Ka[k]) / H);
        }
        var sum = 0;
        for (var _i = 0, delta_1 = delta; _i < delta_1.length; _i++) {
            var d = delta_1[_i];
            sum += d;
        }
        var averageCharge = 0;
        for (var k = 0; k < delta.length; k++) {
            averageCharge += (delta[k] / sum) * (system.protonatedCharge - k);
        }
        return system.totalC * averageCharge;
    };
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
    AcidBase.chargeResidual = function (H, systems, spectatorCharge, Kw) {
        var net = H - Kw / H + spectatorCharge;
        for (var _i = 0, systems_1 = systems; _i < systems_1.length; _i++) {
            var system = systems_1[_i];
            net += AcidBase.systemCharge(system, H);
        }
        return net;
    };
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
    AcidBase.solveProton = function (systems, spectatorCharge, Kw) {
        if (Kw === void 0) { Kw = AcidBase.Kw; }
        // bracket the root on the pH scale; residual is positive at high [H+]
        // (low pH) and negative at low [H+] (high pH)
        var pHlow = -2; // [H+] = 100 mol/L, strongly acidic bound
        var pHhigh = 16; // [H+] = 1e-16 mol/L, strongly basic bound
        for (var i = 0; i < 100; i++) {
            var pHmid = (pHlow + pHhigh) / 2;
            var residual = AcidBase.chargeResidual(Math.pow(10, -pHmid), systems, spectatorCharge, Kw);
            if (residual > 0) {
                // too acidic, move to higher pH
                pHlow = pHmid;
            }
            else {
                pHhigh = pHmid;
            }
        }
        return Math.pow(10, -(pHlow + pHhigh) / 2);
    };
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
    AcidBase.pH = function (systems, spectatorCharge, Kw) {
        if (Kw === void 0) { Kw = AcidBase.Kw; }
        return -Math.log10(AcidBase.solveProton(systems, spectatorCharge, Kw));
    };
    /**
     * Ion product of water at 25 °C (mol^2/L^2).
     *
     * @static
     * @type {number}
     */
    AcidBase.Kw = 1e-14;
    return AcidBase;
}());
export { AcidBase };
//# sourceMappingURL=AcidBase.js.map