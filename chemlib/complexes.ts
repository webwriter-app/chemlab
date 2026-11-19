import { AcidBase, type AcidBaseSystem } from "./AcidBase";

/** A soluble complex that a free cation forms with a neutral ligand. */
export interface ComplexFormation {
	/** Cation SMILES, as the code writes it. */
	metal: string;
	/** Neutral ligand SMILES, as the code writes it. */
	ligand: string;
	/** Ligands bound per complex. */
	count: number;
	/** Overall formation constant, beta_n = [complex] / ([metal] [ligand]^n). */
	beta: number;
	/** Display formula of the complex. */
	formula: string;
	/** Colour the complex gives the solution. */
	color?: number;
}

// Ammine complexes. Binding reduces the metal's hydrolysis and the amount
// of ammonia available for protonation, so both feed the charge balance.
// https://openstax.org/books/chemistry-2e/pages/15-2-lewis-acids-and-bases
export const complexFormation: Readonly<Record<string, ComplexFormation>> = {
	"[Ag(NH3)2]+": { metal: "[Ag+]", ligand: "N", count: 2, beta: 1.6e7, formula: "Ag(NH₃)₂⁺" },
	"[Cu(NH3)4]2+": { metal: "[Cu2+]", ligand: "N", count: 4, beta: 2.1e13, formula: "Cu(NH₃)₄²⁺", color: 0x1f3fa8 },
	"[Zn(NH3)4]2+": { metal: "[Zn2+]", ligand: "N", count: 4, beta: 2.9e9, formula: "Zn(NH₃)₄²⁺" },
	"[Ni(NH3)6]2+": { metal: "[Ni2+]", ligand: "N", count: 6, beta: 5.5e8, formula: "Ni(NH₃)₆²⁺", color: 0x4a6fb5 }
};

type Family = AcidBaseSystem & { key: string };
type Pin<T> = { family: T; total: number; maxFree: (H: number) => number };
type Species<T> = { metal: T; formation: ComplexFormation; concentration: number };

export interface ComplexEquilibrium<T> {
	/** Total across this family's unbound protonation states. */
	unbound: Map<T, number>;
	complexes: Species<T>[];
	chargeCorrection: number;
	/** Dissolved total of a cation in equilibrium with a solid. */
	pinnedTotal?: number;
}

/** All supported complexes share one ammonia balance and compete for the same pool. */
export function complexEquilibrium<T extends Family>(systems: readonly T[], pin?: Pin<T>):
	((H: number) => ComplexEquilibrium<T>) | undefined {
	const ligand = systems.find(system => system.key === "N");
	const metals = Object.values(complexFormation).flatMap(formation => {
		const family = systems.find(system => system.key === formation.metal);
		return family ? [{ family, formation }] : [];
	});
	if ((!ligand || !metals.length) && !pin) return undefined;

	return H => {
		const neutralFraction = ligand ? AcidBase.speciesFractions(ligand, H)[ligand.protonatedCharge] ?? 0 : 0;
		const maxFree = pin?.maxFree(H);
		const states = metals.map(entry => ({
			...entry,
			fraction: AcidBase.speciesFractions(entry.family, H)[0],
			total: pin?.family === entry.family ? pin.total : entry.family.totalC,
			cap: pin?.family === entry.family ? maxFree : Infinity,
		}));
		const unbound = new Map<T, number>();
		const complexes: Species<T>[] = [];
		const trial = (freePool: number, collect: boolean): number => {
			const freeLigand = freePool * neutralFraction;
			let used = freePool;
			for (const { family, fraction, formation, total, cap } of states) {
				const ratio = formation.beta * freeLigand ** formation.count;
				const freeMetal = Math.min(total / (1 / fraction + ratio), cap);
				const bound = freeMetal * ratio;
				used += formation.count * bound;
				if (collect) {
					unbound.set(family, freeMetal / fraction);
					complexes.push({ metal: family, formation, concentration: bound });
				}
			}
			return used;
		};
		if (ligand && states.length) {
			let low = 0;
			let high = ligand.totalC;
			const tolerance = Math.max(1e-15, high * 1e-12);
			for (let i = 0; i < 52 && high - low > tolerance; i++) {
				const mid = (low + high) / 2;
				if (trial(mid, false) > ligand.totalC) high = mid;
				else low = mid;
			}
			const freePool = (low + high) / 2;
			unbound.set(ligand, freePool);
			trial(freePool, true);
		}
		if (pin && !unbound.has(pin.family)) {
			const fraction = AcidBase.speciesFractions(pin.family, H)[0];
			unbound.set(pin.family, Math.min(pin.total, maxFree / fraction));
		}
		let chargeCorrection = 0;
		for (const [family, amount] of unbound) {
			chargeCorrection += AcidBase.systemCharge({ ...family, totalC: amount - family.totalC }, H);
		}
		for (const species of complexes) chargeCorrection += species.concentration * species.metal.protonatedCharge;
		const pinnedTotal = pin ? unbound.get(pin.family) +
			complexes.filter(({ metal }) => metal === pin.family).reduce((total, species) => total + species.concentration, 0)
			: undefined;
		return { unbound, complexes, chargeCorrection, pinnedTotal };
	};
}
