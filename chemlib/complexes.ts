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

// Ammine complexes. The complex carries the same charge as the free cation, so
// it lowers the free cation without changing the charge balance; the ligand
// mass balance does shift, which Simulation.complexFactor accounts for.
// https://openstax.org/books/chemistry-2e/pages/15-2-lewis-acids-and-bases
export const complexFormation: Readonly<Record<string, ComplexFormation>> = {
	"[Ag(NH3)2]+": { metal: "[Ag+]", ligand: "N", count: 2, beta: 1.6e7, formula: "Ag(NH₃)₂⁺" },
	"[Cu(NH3)4]2+": { metal: "[Cu2+]", ligand: "N", count: 4, beta: 2.1e13, formula: "Cu(NH₃)₄²⁺", color: 0x1f3fa8 },
	"[Zn(NH3)4]2+": { metal: "[Zn2+]", ligand: "N", count: 4, beta: 2.9e9, formula: "Zn(NH₃)₄²⁺" },
	"[Ni(NH3)6]2+": { metal: "[Ni2+]", ligand: "N", count: 6, beta: 5.5e8, formula: "Ni(NH₃)₆²⁺", color: 0x4a6fb5 }
};
