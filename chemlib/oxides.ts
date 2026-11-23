import type { Molecule } from "./Molecule";

/**
 * How an acid attacks one solid oxide, written as one formula unit.
 *
 * The model keeps an oxide as a molecular solid, because it is not a salt in
 * the sense of the solubility table: no solubility product, no ion pair that
 * could be registered. A weighed portion therefore lies at the bottom of the
 * vessel until an acid reaches it, and then it dissolves into exactly the
 * cation the oxide carries.
 */
export interface OxideAttack {
	/** Cation the oxide leaves behind, in the SMILES spelling of `saltSolubility`. */
	cation: string;
	/** Cations per formula unit. */
	cations: number;
	/** Protons one formula unit consumes. */
	protons: number;
	/** Water molecules one formula unit releases. */
	water: number;
	/**
	 * Solid that a drop of water makes of the oxide before any acid arrives,
	 * as the formula key of the solubility table. Quicklime slakes to slaked
	 * lime, and from then on the hydroxide equilibria carry it.
	 */
	slaking?: string;
}

export interface Oxide {
	/** Atoms of the metal-bearing element in one formula unit. */
	metal: number;
	/** Atoms of oxygen in one formula unit. */
	oxygen: number;
	/** The acid attack, if the model carries one. */
	attack?: OxideAttack;
	/**
	 * Why the oxide stays a spectator. Every entry without an attack needs
	 * one, so a missing reaction is a stated decision and not an oversight.
	 */
	note?: string;
}

/**
 * The oxides the model recognises from their elements alone.
 *
 * A dose is identified by counting its atoms, not by reading a name or a
 * SMILES string: the palette, a saved mixture and a structure that came back
 * from the molecule builder all carry the same graph, and an edited graph
 * keeps its identity as long as it still contains that formula unit. Bond
 * orders and formal charges are deliberately ignored — a drawn Cu²⁺–O²⁻ and a
 * drawn Cu=O are the same substance.
 *
 * Ferric oxide needs iron(III) in the vessel before it dissolves, which the
 * acid supplies as protons; manganese dioxide would have to oxidise something
 * and silicon dioxide is an acidic oxide that dissolves in lye, neither of
 * which this model couples to the acid-base solver, so both stay inert and say
 * so. See `docs/structure-library.md`.
 */
export const OXIDES: Readonly<Record<string, Oxide>> = {
	Ca: { metal: 1, oxygen: 1, attack: { cation: "[Ca2+]", cations: 1, protons: 2, water: 1,
		slaking: "Ca(OH)2" } },
	Cu: { metal: 1, oxygen: 1, attack: { cation: "[Cu2+]", cations: 1, protons: 2, water: 1 } },
	Mg: { metal: 1, oxygen: 1, attack: { cation: "[Mg2+]", cations: 1, protons: 2, water: 1 } },
	Fe: { metal: 2, oxygen: 3, attack: { cation: "[Fe3+]", cations: 2, protons: 6, water: 3 } },
	Mn: { metal: 1, oxygen: 2, note:
		"Mangan(IV)-oxid müsste etwas oxidieren; die Lösung des Modells kennt keine gekoppelte Redoxreaktion mit einem Feststoff." },
	Si: { metal: 1, oxygen: 2, note:
		"Siliciumdioxid ist ein Säureoxid und löst sich in Lauge; das Modell koppelt keine Silicatbildung an den pH-Löser." },
};

/**
 * The oxide a molecule is, or undefined if it is not one the table knows.
 *
 * The stoichiometry has to match a row exactly: a graph of Fe₃O₄ or Cu₂O stays
 * a molecular solid without a reaction, which the coverage report records as
 * an open model rather than a missing recipe.
 *
 * @export
 * @param {Molecule} molecule - the dosed solid
 * @returns {(Oxide | undefined)}
 */
export function oxideOf(molecule: Molecule): Oxide | undefined {
	const counts = new Map<string, number>();
	for (const atom of molecule._atoms) {
		const symbol = atom.getSymbol();
		counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
	}
	// An oxide is a binary compound of oxygen; a hydroxide, a carbonate or a
	// hydrate carries hydrogen and belongs to another model.
	if (counts.has("H") || counts.size !== 2) return;
	const oxygen = counts.get("O") ?? 0;
	const [symbol] = [...counts.keys()].filter((key) => key !== "O");
	const oxide = OXIDES[symbol];
	if (!oxide || oxide.oxygen !== oxygen || oxide.metal !== counts.get(symbol)) return;
	return oxide;
}
