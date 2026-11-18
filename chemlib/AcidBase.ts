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
export abstract class AcidBase {
	/**
	 * Ion product of water at 25 °C (mol^2/L^2).
	 *
	 * @static
	 * @type {number}
	 */
	static Kw: number = 1e-14;

	/**
	 * Ion product of water at a given temperature.
	 *
	 * Anchored exactly at {@link Kw} for 25 °C and extrapolated with the van't
	 * Hoff relation, using ΔH ≈ 55.8 kJ/mol for the autoionisation of water.
	 * That gives pKw ≈ 14.9 at 0 °C and ≈ 12.0 at 100 °C, close to the
	 * measured values.
	 *
	 * @public
	 * @static
	 * @param {number} temperature - absolute temperature in kelvin
	 * @returns {number} the ion product of water in mol^2/L^2
	 */
	public static kwAt(temperature: number): number {
		if (!(temperature > 0) || temperature === 298.15) return AcidBase.Kw;
		return AcidBase.Kw * Math.exp(-55800 / 8.31446261815324 * (1 / temperature - 1 / 298.15));
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
	public static systemCharge(system: AcidBaseSystem, H: number): number {
		const fractions = AcidBase.speciesFractions(system, H);
		return system.totalC * fractions.reduce((charge, fraction, step) =>
			charge + fraction * (system.protonatedCharge - step), 0);
	}

	/** Fractions from the fully protonated form through each deprotonation step. */
	public static speciesFractions(system: AcidBaseSystem, H: number): number[] {
		const weights = [1];
		for (const pKa of system.pKa) {
			weights.push(weights[weights.length - 1] * Math.pow(10, -pKa) / H);
		}
		const sum = weights.reduce((total, weight) => total + weight, 0);
		return weights.map((weight) => weight / sum);
	}

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
	 * @param {(H: number) => number} [extraCharge] - additional net charge
	 *   concentration that the caller derives from [H+] itself, e.g. a complex
	 *   that holds part of a family at a charge the protonation states do not
	 *   describe
	 * @returns {number}
	 */
	private static chargeResidual(
		H: number,
		systems: AcidBaseSystem[],
		spectatorCharge: number,
		Kw: number,
		extraCharge?: (H: number) => number
	): number {
		let net: number = H - Kw / H + spectatorCharge;
		for (const system of systems) {
			net += AcidBase.systemCharge(system, H);
		}
		if (extraCharge) net += extraCharge(H);
		return net;
	}

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
	 * @param {(H: number) => number} [extraCharge] - additional net charge
	 *   concentration as a function of [H+], see {@link chargeResidual}
	 * @returns {number} the proton concentration [H+] in mol/L
	 */
	public static solveProton(
		systems: AcidBaseSystem[],
		spectatorCharge: number,
		Kw: number = AcidBase.Kw,
		extraCharge?: (H: number) => number
	): number {
		// bracket the root on the pH scale; residual is positive at high [H+]
		// (low pH) and negative at low [H+] (high pH)
		let pHlow: number = -2; // [H+] = 100 mol/L, strongly acidic bound
		let pHhigh: number = 16; // [H+] = 1e-16 mol/L, strongly basic bound

		for (let i = 0; i < 100 && pHhigh - pHlow > 1e-12; i++) {
			const pHmid: number = (pHlow + pHhigh) / 2;
			const residual: number = AcidBase.chargeResidual(
				Math.pow(10, -pHmid),
				systems,
				spectatorCharge,
				Kw,
				extraCharge
			);
			if (residual > 0) {
				// too acidic, move to higher pH
				pHlow = pHmid;
			} else {
				pHhigh = pHmid;
			}
		}

		return Math.pow(10, -(pHlow + pHhigh) / 2);
	}

	/**
	 * Convenience wrapper returning the pH directly.
	 *
	 * @public
	 * @static
	 * @param {AcidBaseSystem[]} systems - all conjugate acid/base systems
	 * @param {number} spectatorCharge - net spectator ion charge (mol/L)
	 * @param {number} [Kw=AcidBase.Kw] - ion product of water
	 * @param {(H: number) => number} [extraCharge] - additional net charge
	 *   concentration as a function of [H+], see {@link chargeResidual}
	 * @returns {number} the pH of the solution
	 */
	public static pH(
		systems: AcidBaseSystem[],
		spectatorCharge: number,
		Kw: number = AcidBase.Kw,
		extraCharge?: (H: number) => number
	): number {
		return -Math.log10(AcidBase.solveProton(systems, spectatorCharge, Kw, extraCharge));
	}
}
