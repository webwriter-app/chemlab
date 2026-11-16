type SaltIons = readonly [cation: string, anion: string, cations?: number, anions?: number];

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
	CuSO4: { ions: ["[Cu2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.29, color: 0x5289b1, solidDensity: 3.6 },
	ZnSO4: { ions: ["[Zn2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.79, solidDensity: 3.54 },
	FeSO4: { ions: ["[Fe2+]", "[O-]S(=O)(=O)[O-]"], saturation: 0.93, color: 0x97ab8b, solidDensity: 3.64 },
	AgNO3: { ions: ["[Ag+]", "[O-][N+](=O)[O-]"], saturation: 8.80, solidDensity: 4.35 },
	BaCl2: { ions: ["[Ba2+]", "[Cl-]", 1, 2], saturation: 1.38, solidDensity: 3.86 },
	CaCl2: { ions: ["[Ca2+]", "[Cl-]", 1, 2], saturation: 5.04, solidDensity: 2.15 },
	FeCl3: { ions: ["[Fe3+]", "[Cl-]", 1, 3], saturation: 2.69, color: 0xb88546, solidDensity: 2.9 },
	Na2CO3: { ions: ["[Na+]", "[O-]C(=O)[O-]", 2, 1], saturation: 2.01, solidDensity: 2.54 },
	Na2SO4: { ions: ["[Na+]", "[O-]S(=O)(=O)[O-]", 2, 1], saturation: 1.30, solidDensity: 2.66 },
	KNO3: { ions: ["[K+]", "[O-][N+](=O)[O-]"], saturation: 2.77, solidDensity: 2.11 },

	// Dilute-solution products near 25 °C. Solve with concentrations as
	// activities. The concentrated salts above use empirical model thresholds.
	// https://openstax.org/books/chemistry-2e/pages/j-solubility-products
	AgCl: { ions: ["[Ag+]", "[Cl-]"], ksp: 1.8e-10, solidDensity: 5.56 },
	AgBr: { ions: ["[Ag+]", "[Br-]"], ksp: 5.0e-13, color: 0xe7dbad, solidDensity: 6.47 },
	AgI: { ions: ["[Ag+]", "[I-]"], ksp: 8.3e-17, color: 0xd6bd65, solidDensity: 5.68 },
	BaSO4: { ions: ["[Ba2+]", "[O-]S(=O)(=O)[O-]"], ksp: 1.1e-10, solidDensity: 4.49 },
	CaSO4: { ions: ["[Ca2+]", "[O-]S(=O)(=O)[O-]"], ksp: 4.9e-5, solidDensity: 2.97 },
	CaCO3: { ions: ["[Ca2+]", "[O-]C(=O)[O-]"], ksp: 3.4e-9, solidDensity: 2.71 },
	BaCO3: { ions: ["[Ba2+]", "[O-]C(=O)[O-]"], ksp: 2.6e-9, solidDensity: 4.29 },
	Ag2SO4: { ions: ["[Ag+]", "[O-]S(=O)(=O)[O-]", 2, 1], ksp: 1.2e-5 },

	// Hydroxides. Their anion is the water equilibrium's OH-, not a stored ion,
	// so Simulation.equilibrateHydroxides solves them instead of the generic
	// salt loop. Ksp values follow the legacy pKL table in StructureManager
	// (pKL = -log10 Ksp); Ag2O is the stable silver hydroxide and is written as
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
