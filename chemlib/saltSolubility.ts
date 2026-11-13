type SaltIons = readonly [cation: string, anion: string, cations?: number, anions?: number];

interface SaltSolubility {
	ions: SaltIons;
	saturation?: number;
	ksp?: number;
	color?: number;
}

// Approximate mol/L of saturated aqueous solution near 20 °C. Where available,
// convert the saturated mass fraction using the density of that same solution.
// https://www.sigmaaldrich.com/AU/en/support/calculators-and-apps/solubility-table-compounds-water-temperature
// CaCl2: https://amcmud.com/wp-content/uploads/sites/2/2017/10/CALCIUM-CHLORIDE-PDS.pdf
export const saltSolubility: Readonly<Record<string, SaltSolubility>> = {
	NaCl: { ions: ["[Na+]", "[Cl-]"], saturation: 5.43 },
	KCl: { ions: ["[K+]", "[Cl-]"], saturation: 4.02 },
	KBr: { ions: ["[K+]", "[Br-]"], saturation: 4.57 },
	KI: { ions: ["[K+]", "[I-]"], saturation: 6.09 },
	CuSO4: { ions: ["[Cu2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.29, color: 0x5289b1 },
	ZnSO4: { ions: ["[Zn2+]", "[O-]S(=O)(=O)[O-]"], saturation: 1.79 },
	FeSO4: { ions: ["[Fe2+]", "[O-]S(=O)(=O)[O-]"], saturation: 0.93, color: 0x97ab8b },
	AgNO3: { ions: ["[Ag+]", "[O-][N+](=O)[O-]"], saturation: 8.80 },
	BaCl2: { ions: ["[Ba2+]", "[Cl-]", 1, 2], saturation: 1.38 },
	CaCl2: { ions: ["[Ca2+]", "[Cl-]", 1, 2], saturation: 5.04 },
	FeCl3: { ions: ["[Fe3+]", "[Cl-]", 1, 3], saturation: 2.69, color: 0xb88546 },
	Na2CO3: { ions: ["[Na+]", "[O-]C(=O)[O-]", 2, 1], saturation: 2.01 },
	Na2SO4: { ions: ["[Na+]", "[O-]S(=O)(=O)[O-]", 2, 1], saturation: 1.30 },
	KNO3: { ions: ["[K+]", "[O-][N+](=O)[O-]"], saturation: 2.77 },

	// Dilute-solution products near 25 °C. Solve with concentrations as
	// activities. The concentrated salts above use empirical model thresholds.
	// https://openstax.org/books/chemistry-2e/pages/j-solubility-products
	AgCl: { ions: ["[Ag+]", "[Cl-]"], ksp: 1.8e-10 },
	AgBr: { ions: ["[Ag+]", "[Br-]"], ksp: 5.0e-13, color: 0xe7dbad },
	AgI: { ions: ["[Ag+]", "[I-]"], ksp: 8.3e-17, color: 0xd6bd65 },
	BaSO4: { ions: ["[Ba2+]", "[O-]S(=O)(=O)[O-]"], ksp: 1.1e-10 },
	CaSO4: { ions: ["[Ca2+]", "[O-]S(=O)(=O)[O-]"], ksp: 4.9e-5 },
	CaCO3: { ions: ["[Ca2+]", "[O-]C(=O)[O-]"], ksp: 3.4e-9 },
	BaCO3: { ions: ["[Ba2+]", "[O-]C(=O)[O-]"], ksp: 2.6e-9 },
	Ag2SO4: { ions: ["[Ag+]", "[O-]S(=O)(=O)[O-]", 2, 1], ksp: 1.2e-5 },
};
