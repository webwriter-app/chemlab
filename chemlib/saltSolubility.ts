/**
 * The ions of one salt formula unit for the solubility table. The cation and
 * the anion keep the first two slots because the hydroxide equilibria read the
 * anion there; a double salt such as potassium sodium tartrate carries its
 * second cation in the fifth slot. No entry needs a third ion, and an anion
 * that does not fit a single charge remains unrepresented rather than wrong.
 */
type SaltIons = readonly [
	cation: string,
	anion: string,
	cations?: number,
	anions?: number,
	extraCation?: string,
	extraCations?: number,
];

/** One ion of a formula unit, with how many copies of it the unit contains. */
export interface SaltIonCount {
	/** SMILES of the ion, as the mixture stores it. */
	smiles: string;
	/** Number of these ions per formula unit. */
	count: number;
}

/**
 * The ions of one formula unit in table order, with their counts.
 *
 * The salt loop needs every ion of a salt, not just the pair that a 1:1 salt
 * has: potassium sodium tartrate dissociates into two cations and one anion,
 * and dropping either cation would break the charge balance of the solution.
 *
 * @param {SaltIons} ions - the table entry
 * @returns {SaltIonCount[]} the ions that carry the formula unit
 */
export function saltIonList(ions: SaltIons): SaltIonCount[] {
	const [cation, anion, cations = 1, anions = 1, extraCation, extraCations = 1] = ions;
	const list: SaltIonCount[] = [{ smiles: cation, count: cations }, { smiles: anion, count: anions }];
	if (extraCation) list.push({ smiles: extraCation, count: extraCations });
	return list;
}

interface SaltSolubility {
	ions: SaltIons;
	saturation?: number;
	ksp?: number;
	color?: number;
	/** bulk density (g/ml) of the solid salt, for volume and sediment rendering */
	solidDensity?: number;
}

// Approximate mol/L of saturated aqueous solution near 20 °C. Where available,
// convert the saturated mass fraction using the density of that same solution.
// https://www.sigmaaldrich.com/AU/en/support/calculators-and-apps/solubility-table-compounds-water-temperature
// CaCl2: https://amcmud.com/wp-content/uploads/sites/2/2017/10/CALCIUM-CHLORIDE-PDS.pdf
export const saltSolubility: Readonly<Record<string, SaltSolubility>> = {
	NaCl: { ions: ["[Na+]", "[Cl-]"], saturation: 5.43, solidDensity: 2.16 },
	KCl: { ions: ["[K+]", "[Cl-]"], saturation: 4.02, solidDensity: 1.98 },
	KBr: { ions: ["[K+]", "[Br-]"], saturation: 4.57, solidDensity: 2.75 },
	KI: { ions: ["[K+]", "[I-]"], saturation: 6.09, solidDensity: 3.12 },
	// Saturated mass fractions converted with the density of that same solution:
	// NaBr 90.5 g per 100 g water (47.5 %, 1.53 g/mL), NaI 184 g per 100 g water
	// at 25 °C (64.8 %, 1.84 g/mL). Both are approximate near 20 °C.
	NaBr: { ions: ["[Na+]", "[Br-]"], saturation: 7.06, solidDensity: 3.2 },
	NaI: { ions: ["[Na+]", "[I-]"], saturation: 7.95, solidDensity: 3.67 },
	// Two freely soluble salts whose ions are weak electrolytes: 29.7 g NH₄Cl per
	// 100 g water at 25 °C (22.9 %, 1.077 g/mL) and 46.4 g sodium acetate per
	// 100 g water at 20 °C (31.7 %, 1.11 g/mL), converted the same way.
	// [N+] is Kekule's form of the ammonium ion; it joins the ammonia family
	// (alias [NH4+]), and CC(=O)[O-] joins the acetic-acid family, so both salts
	// move the water equilibrium through the existing speciation.
	NH4Cl: { ions: ["[N+]", "[Cl-]"], saturation: 4.6, solidDensity: 1.527 },
	CH3COONa: { ions: ["[Na+]", "CC(=O)[O-]"], saturation: 4.29, solidDensity: 1.528 },
	CuSO4: { ions: ["[Cu2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.29, color: 0x5289b1, solidDensity: 3.6 },
	ZnSO4: { ions: ["[Zn2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.79, solidDensity: 3.54 },
	FeSO4: { ions: ["[Fe2+]", "[O-]S(=O)(=O)[O-]"], saturation: 0.93, color: 0x97ab8b, solidDensity: 3.64 },
	// Magnesium sulfate: 35.1 g MgSO4 per 100 g water at 20 °C is 0.2916 mol in
	// a 135.1 g solution of about 26.0 wt%, which measures 1.295 g/mL and thus
	// holds those 0.2916 mol in 104.3 mL, so 2.80 mol/L. The epsomite density
	// (MgSO4·7 H2O) is 1.68 g/mL, the anhydrous one 2.66 g/mL.
	// https://www.chemicalbook.com/ChemicalProductProperty_EN_CB9122608.htm
	MgSO4: { ions: ["[Mg2+]", "[O-]S(=O)(=O)[O-]"], saturation: 2.80, solidDensity: 2.66 },
	AgNO3: { ions: ["[Ag+]", "[O-][N+](=O)[O-]"], saturation: 8.80, solidDensity: 4.35 },
	BaCl2: { ions: ["[Ba2+]", "[Cl-]", 1, 2], saturation: 1.38, solidDensity: 3.86 },
	CaCl2: { ions: ["[Ca2+]", "[Cl-]", 1, 2], saturation: 5.04, solidDensity: 2.15 },
	FeCl3: { ions: ["[Fe3+]", "[Cl-]", 1, 3], saturation: 2.69, color: 0xb88546, solidDensity: 2.9 },
	Na2CO3: { ions: ["[Na+]", "[O-]C(=O)[O-]", 2, 1], saturation: 2.01, solidDensity: 2.54 },
	// 96 g/L near 20 °C / 84.01 g/mol, rounded to the model's nominal limit.
	// https://www.solvay.com/sites/g/files/srpend221/files/2021-01/PSS-Sodium-Bicarbonate.pdf
	NaHCO3: { ions: ["[Na+]", "[O-]C(O)=O"], saturation: 1.14, solidDensity: 2.16 },
	Na2SO4: { ions: ["[Na+]", "[O-]S(=O)(=O)[O-]", 2, 1], saturation: 1.30, solidDensity: 2.66 },
	KNO3: { ions: ["[K+]", "[O-][N+](=O)[O-]"], saturation: 2.77, solidDensity: 2.11 },
	// Three more freely soluble salts whose anions are weak electrolytes or a
	// redox partner the model does not run yet. Ammonium sulfate: saturated
	// 4.1 mol/L at 25 °C (3.9 at 0 °C), solid 1.769 g/mL
	// (https://pmc.ncbi.nlm.nih.gov/articles/PMC4817497/). Potassium
	// thiocyanate: 217 g per 100 mL water at 20 °C, solid 1.886 g/mL at 15 °C
	// (https://www.chemicalbook.com/ChemicalProductProperty_EN_CB6853074.htm);
	// the saturated solution is 68.5 wt%, and with an estimated 1.40 g/mL for it
	// that is 9.8 mol/L. Potassium permanganate: 6.38 g per 100 mL at 20 °C,
	// solid 2.703 g/mL, and with an estimated 1.04 g/mL for the saturated
	// solution 0.0398 mol per 102.3 mL, so 0.39 mol/L.
	// The ammonium ion is the same [N+] as in NH₄Cl and joins the ammonia
	// family; the sulfate is the anion of the sulfuric-acid family. Thiocyanate
	// and permanganate have no entry in the acid-base or complex tables, so they
	// travel as spectator ions: no SCN⁻ complexation and no MnO₄⁻ redox.
	"(NH4)2SO4": { ions: ["[N+]", "[O-]S(=O)(=O)[O-]", 2, 1], saturation: 4.1, solidDensity: 1.769 },
	KSCN: { ions: ["[K+]", "N#C[S-]"], saturation: 9.8, solidDensity: 1.886 },
	KMnO4: { ions: ["[K+]", "[O-][Mn](=O)(=O)=O"], saturation: 0.39, solidDensity: 2.703 },

	// Dilute-solution products near 25 °C. Solve with concentrations as
	// activities. The concentrated salts above use empirical model thresholds.
	// https://openstax.org/books/chemistry-2e/pages/j-solubility-products
	// The sparingly soluble salts below also carry a `saturation`, because the
	// palette needs a concentration limit for their stock. It is the ideal
	// solubility from the Ksp, rounded down to two significant digits so the
	// saturated stock stays on the safe side of its own solubility product:
	// AgCl 1.34e-5, BaSO4 1.05e-5, CaSO4 7.00e-3 and CaCO3 5.83e-5 mol/L. Only
	// the stock's limit reads it; `saltEquilibria` keeps the Ksp as the product.
	// Gypsum measures about 0.014 mol/L, twice the ideal value here, because the
	// model carries no CaSO4(aq) ion pair; the same reason applies to the two
	// barium and silver salts above.
	AgCl: { ions: ["[Ag+]", "[Cl-]"], ksp: 1.8e-10, saturation: 1.3e-5, solidDensity: 5.56 },
	AgBr: { ions: ["[Ag+]", "[Br-]"], ksp: 5.0e-13, color: 0xe7dbad, solidDensity: 6.47 },
	AgI: { ions: ["[Ag+]", "[I-]"], ksp: 8.3e-17, color: 0xd6bd65, solidDensity: 5.68 },
	BaSO4: { ions: ["[Ba2+]", "[O-]S(=O)(=O)[O-]"], ksp: 1.1e-10, saturation: 1.0e-5, solidDensity: 4.49 },
	CaSO4: { ions: ["[Ca2+]", "[O-]S(=O)(=O)[O-]"], ksp: 4.9e-5, saturation: 6.9e-3, solidDensity: 2.97 },
	// Calcium oxalate monohydrate, approximate dilute-solution product at 25 °C.
	// https://doi.org/10.3390/cryst10100924
	CaC2O4: { ions: ["[Ca2+]", "[O-]C(=O)C(=O)[O-]"], ksp: 1.7e-9 },
	CaCO3: { ions: ["[Ca2+]", "[O-]C(=O)[O-]"], ksp: 3.4e-9, saturation: 5.8e-5, solidDensity: 2.71 },
	BaCO3: { ions: ["[Ba2+]", "[O-]C(=O)[O-]"], ksp: 2.6e-9, solidDensity: 4.29 },
	Ag2SO4: { ions: ["[Ag+]", "[O-]S(=O)(=O)[O-]", 2, 1], ksp: 1.2e-5 },

	// Sparingly soluble salts of the heavier cations, carried over from the
	// retired pKL table in StructureManager (ksp = 10^-pKL). The values are
	// approximate and a few are loose against the literature (CdCO3, CdI2,
	// MgCO3 sit one to three orders high); they are kept because the salts are
	// not dosable yet and the constants are worth having when they become so.
	// Ca3(PO4)2 is written with the correct 3:2 stoichiometry, which the old
	// key got wrong, and uses the usual Ksp for the apatite phase.
	//
	// CuCO3 is deliberately absent. Copper does not precipitate as the simple
	// carbonate but as a basic carbonate such as Cu2(OH)2CO3, which needs two
	// anions per formula unit and does not fit SaltIons. A plain CuCO3 entry
	// also fights Cu(OH)2 for the same cation: both pin the free copper, and
	// the alternating salt and hydroxide solves then converge only very slowly
	// around pH 5.6, where the carbonate speciation is steep.
	BaCrO4: { ions: ["[Ba2+]", "[O-][Cr](=O)(=O)[O-]"], ksp: 2.1e-10, solidDensity: 4.50 },
	BaF2: { ions: ["[Ba2+]", "[F-]", 1, 2], ksp: 1.7e-6, solidDensity: 4.89 },
	CaCrO4: { ions: ["[Ca2+]", "[O-][Cr](=O)(=O)[O-]"], ksp: 5.4e-3, solidDensity: 3.12 },
	CaF2: { ions: ["[Ca2+]", "[F-]", 1, 2], ksp: 2.5e-11, solidDensity: 3.18 },
	CaHPO4: { ions: ["[Ca2+]", "[O-]P(=O)(O)[O-]"], ksp: 1.2e-7, solidDensity: 2.93 },
	"Ca3(PO4)2": { ions: ["[Ca2+]", "[O-]P([O-])(=O)[O-]", 3, 2], ksp: 2.0e-29, solidDensity: 3.14 },
	CdCO3: { ions: ["[Cd2+]", "[O-]C(=O)[O-]"], ksp: 7.9e-13, solidDensity: 4.26 },
	CdF2: { ions: ["[Cd2+]", "[F-]", 1, 2], ksp: 1.1e-3, solidDensity: 6.33 },
	CdI2: { ions: ["[Cd2+]", "[I-]", 1, 2], ksp: 2.5e-4, solidDensity: 5.67 },
	CdS: { ions: ["[Cd2+]", "[S2-]"], ksp: 1.2e-30, color: 0xe8d84a, solidDensity: 4.82 },
	CuCrO4: { ions: ["[Cu2+]", "[O-][Cr](=O)(=O)[O-]"], ksp: 3.3e-6, solidDensity: 4.30 },
	CuF2: { ions: ["[Cu2+]", "[F-]", 1, 2], ksp: 2.4e-1, solidDensity: 4.23 },
	CuS: { ions: ["[Cu2+]", "[S2-]"], ksp: 1.2e-48, color: 0x1c1c22, solidDensity: 4.60 },
	FeCrO4: { ions: ["[Fe2+]", "[O-][Cr](=O)(=O)[O-]"], ksp: 8.1e-11, solidDensity: 5.20 },
	MgCO3: { ions: ["[Mg2+]", "[O-]C(=O)[O-]"], ksp: 9.3e-9, solidDensity: 2.96 },
	MgHPO4: { ions: ["[Mg2+]", "[O-]P(=O)(O)[O-]"], ksp: 1.1e-13, solidDensity: 2.13 },
	PbCO3: { ions: ["[Pb2+]", "[O-]C(=O)[O-]"], ksp: 7.4e-14, solidDensity: 6.58 },
	PbCrO4: { ions: ["[Pb2+]", "[O-][Cr](=O)(=O)[O-]"], ksp: 2.1e-14, color: 0xe8c020, solidDensity: 6.12 },
	ZnCO3: { ions: ["[Zn2+]", "[O-]C(=O)[O-]"], ksp: 1.0e-10, solidDensity: 4.40 },
	ZnS: { ions: ["[Zn2+]", "[S2-]"], ksp: 9.1e-24, color: 0xe8e4d0, solidDensity: 4.09 },

	// Hydroxides. Their anion is the water equilibrium's OH-, not a stored ion,
	// so Simulation.equilibrateHydroxides solves them instead of the generic
	// salt loop. Ag2O is the stable silver hydroxide and is written as
	// Ag2O + H2O -> 2 Ag+ + 2 OH-.
	"Cu(OH)2": { ions: ["[Cu2+]", "[OH-]", 1, 2], ksp: 4.6e-20, color: 0x4a90c4, solidDensity: 3.37 },
	"Fe(OH)2": { ions: ["[Fe2+]", "[OH-]", 1, 2], ksp: 8.3e-15, color: 0x6f8f6a, solidDensity: 3.4 },
	"Fe(OH)3": { ions: ["[Fe3+]", "[OH-]", 1, 3], ksp: 8.3e-38, color: 0x9a5b32, solidDensity: 3.4 },
	"Zn(OH)2": { ions: ["[Zn2+]", "[OH-]", 1, 2], ksp: 1.7e-16, color: 0xdfe3e6, solidDensity: 3.05 },
	"Ca(OH)2": { ions: ["[Ca2+]", "[OH-]", 1, 2], ksp: 6.6e-6, color: 0xf2f2ee, solidDensity: 2.21 },
	"Mg(OH)2": { ions: ["[Mg2+]", "[OH-]", 1, 2], ksp: 7.2e-12, color: 0xf4f4f0, solidDensity: 2.34 },
	"Ni(OH)2": { ions: ["[Ni2+]", "[OH-]", 1, 2], ksp: 6.6e-18, color: 0x8fbf6a, solidDensity: 4.1 },
	"Mn(OH)2": { ions: ["[Mn2+]", "[OH-]", 1, 2], ksp: 1.7e-13, color: 0xd8c9b0, solidDensity: 3.26 },
	"Cd(OH)2": { ions: ["[Cd2+]", "[OH-]", 1, 2], ksp: 5.6e-15, color: 0xf0f0ea, solidDensity: 4.79 },
	"Pb(OH)2": { ions: ["[Pb2+]", "[OH-]", 1, 2], ksp: 1.5e-20, color: 0xe8e8e0, solidDensity: 7.41 },
	"Cr(OH)2": { ions: ["[Cr2+]", "[OH-]", 1, 2], ksp: 6.9e-18, color: 0x9a8f6a, solidDensity: 3.0 },
	"Hg(OH)2": { ions: ["[Hg2+]", "[OH-]", 1, 2], ksp: 4.2e-26, color: 0xd8c020, solidDensity: 6.0 },
	"Al(OH)3": { ions: ["[Al3+]", "[OH-]", 1, 3], ksp: 6.8e-32, color: 0xf0f0ea, solidDensity: 2.42 },
	Ag2O: { ions: ["[Ag+]", "[OH-]", 2, 2], ksp: 2.0e-8, color: 0x4a3a2a, solidDensity: 7.14 },
};
