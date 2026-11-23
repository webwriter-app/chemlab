import type { AqueousAcidBase } from "../chemlib/AcidBase";
import { saltSolubility } from "../chemlib/saltSolubility";

export interface MoleculeDefinition {
	formula: string;
	name?: string;
	atoms: string[];
	bonds: string[];
	charges?: number[];
	aqueousAcidBase?: AqueousAcidBase;
}

export interface ChemicalRecipe {
	phase: "solid" | "liquid";
	parts: Array<{ molecule: MoleculeDefinition; amount: number }>;
	density: number;
	/** Solute amounts are expressed in mol per model litre of aqueous solution. */
	aqueousMolar?: true;
}

export function isWaterDefinition(molecule: MoleculeDefinition): boolean {
	return molecule.atoms.length === 3 && molecule.atoms.filter((atom) => atom === "hydrogen").length === 2 &&
		molecule.atoms.includes("oxygen") && molecule.bonds.length === 2;
}

export function withConcentration(recipe: ChemicalRecipe, concentration: number, stockConcentration = 1): ChemicalRecipe {
	const parts = recipe.parts.filter(({ molecule }) => !isWaterDefinition(molecule));
	return {
		phase: "liquid", density: 1, aqueousMolar: true,
		parts: [{ molecule: water, amount: 55.5 }, ...parts.map(({ molecule, amount }) =>
			({ molecule, amount: amount * concentration / stockConcentration }))],
	};
}

export const chemicalClasses = [
	"Salze", "Anorganische Säuren", "Basen", "Carbonsäuren", "Alkohole",
	"Aldehyde", "Ketone", "Ester", "Kohlenwasserstoffe", "Lösungsmittel",
	"Halogenkohlenwasserstoffe",
	"Metalle", "Nichtmetalle und Gase", "Oxide", "Indikatoren und Nachweisreagenzien",
	"Kohlenhydrate und Aminosäuren", "Fette und Tenside", "Kunststoffe und Monomere", "Stoffgemische",
] as const;

type ChemicalClass = typeof chemicalClasses[number];

export interface CatalogChemical {
	name: string;
	formula: string;
	category: ChemicalClass;
	recipe?: ChemicalRecipe;
	preview?: MoleculeDefinition;
	concentrationLimit?: number;
}

// Catalog names are also saved permission and preview keys. Short labels are presentation only.
export const solutionDisplayNames: Readonly<Record<string, string>> = {
	"Natriumchloridlösung (1 mol/L)": "Natriumchlorid",
	"Kupfer(II)-sulfatlösung": "Kupfer(II)-sulfat",
	"Zinksulfatlösung": "Zinksulfat",
	"Eisen(II)-sulfatlösung": "Eisen(II)-sulfat",
	"Silbernitratlösung": "Silbernitrat",
	"Bariumchloridlösung": "Bariumchlorid",
	"Calciumchloridlösung": "Calciumchlorid",
	"Eisen(III)-chloridlösung": "Eisen(III)-chlorid",
	"Natriumcarbonatlösung": "Natriumcarbonat",
	"Natriumhydrogencarbonatlösung": "Natriumhydrogencarbonat",
	"Natriumsulfatlösung": "Natriumsulfat",
	"Kaliumchloridlösung": "Kaliumchlorid",
	"Kaliumbromidlösung": "Kaliumbromid",
	"Kaliumiodidlösung": "Kaliumiodid",
	"Kaliumnitratlösung": "Kaliumnitrat",
	"Natronlauge (1 mol/L)": "Natronlauge",
	"Kalilauge (1 mol/L)": "Kalilauge",
	"Ammoniaklösung": "Ammoniak",
	"Salzsäure (1 mol/L)": "Salzsäure",
	"Schwefelsäure (1 mol/L)": "Schwefelsäure",
	"Phosphorsäure (1 mol/L)": "Phosphorsäure",
	"Wasserstoffperoxidlösung": "Wasserstoffperoxid",
};

// Nominal concentrations of concentrated reagent stocks, in mol/L.
// HCl 37%, NH3 28%, H3PO4 85%, acetic acid 99–100% and formic acid 98–100%:
// https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/product/documents/391/185/merc130093-w281145-acid-emsure-emparta-mk.pdf
// https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/product/documents/331/248/emd-solutions-ms.pdf
const concentratedReagent = {
	hydrochloricAcid: 12.1,
	sulfuricAcid: 18.4, // 98%, 1.84 g/mL, Merck 112080
	phosphoricAcid: 14.7,
	ammonia: 14.8,
	sodiumHydroxide: 19, // 50%, 1.52 g/mL, Merck 100238
	potassiumHydroxide: 11.6, // 45%, 1.45 g/mL, Evonik Pure Grade
	aceticAcid: 17.5,
	formicAcid: 26,
	propionicAcid: 13.3, // 99.5%, 0.993 g/mL, Sigma 402907
	lacticAcid: 11.3, // 85%, Sigma L1250
	// For solid acids use aqueous reference limits near room temperature.
	citricAcid: 4, // Approximate saturation from 59.2 wt% at 20 °C, Sigma C1909
	oxalicAcid: 1, // Verified aqueous stock at 20 °C, Sigma 247537
};

function pure(name: string, category: ChemicalClass, preview: MoleculeDefinition,
	phase: ChemicalRecipe["phase"], density: number, concentrationLimit?: number): CatalogChemical {
	return { name, category, formula: preview.formula, preview, recipe: { phase, density, parts: [{ molecule: preview, amount: 1 }] },
		concentrationLimit };
}

function element(name: string, formula: string, atom: string, density: number, category: ChemicalClass = "Metalle"): CatalogChemical {
	return pure(name, category, { formula, atoms: [atom], bonds: [] }, "solid", density);
}

function reference(name: string, category: ChemicalClass, formula: string, preview?: MoleculeDefinition): CatalogChemical {
	return { name, category, formula, preview };
}

// The solubility table is the single source for a dosed salt: its key is the
// catalog formula, so a formula unit, its solid density and its saturation
// cannot drift apart.
function salt(name: string, formula: string, metal: string, anion: string): CatalogChemical {
	return pure(name, "Salze", { formula, atoms: [metal, anion], bonds: ["0-1:ionic:1"] }, "solid", saltSolubility[formula].solidDensity);
}

// Use explicit hydrogens, as in the existing molecule editor.
function molecule(formula: string, heavyAtoms: string[], bonds: string[], hydrogens: number[]): MoleculeDefinition {
	const atoms = [...heavyAtoms];
	const allBonds = [...bonds];
	hydrogens.forEach((count, index) => {
		for (let i = 0; i < count; i++) {
			allBonds.push(`${index}-${atoms.length}:covalent:1`);
			atoms.push("hydrogen");
		}
	});
	return { formula, atoms, bonds: allBonds };
}

const water = molecule("H₂O", ["oxygen"], [], [2]);
const hcl: MoleculeDefinition = { formula: "HCl", atoms: ["hydrogen", "chlorine"], bonds: ["0-1:acidbase:1"] };
const naoh: MoleculeDefinition = { formula: "NaOH", atoms: ["sodium", "oxygen", "hydrogen"], bonds: ["0-1:acidbase:1", "1-2:covalent:1"] };

function aqueous(name: string, category: ChemicalClass, solute: MoleculeDefinition, concentrationLimit = 1): CatalogChemical {
	return { name, category, formula: solute.formula, preview: solute,
		concentrationLimit,
		recipe: { phase: "liquid", density: 1, aqueousMolar: true, parts: [{ molecule: water, amount: 55.5 }, { molecule: solute, amount: 1 }] } };
}

function covalent(formula: string, atoms: string[], links: readonly (readonly [number, number, number?])[], hydrogens: number[]): MoleculeDefinition {
	return molecule(formula, atoms, links.map(([from, to, order = 1]) => `${from}-${to}:covalent:${order}`), hydrogens);
}

function carbonChain(length: number): [string[], [number, number][]] {
	return [Array<string>(length).fill("carbon"),
		Array.from({ length: length - 1 }, (_, index) => [index, index + 1])];
}

function alkane(formula: string, length: number): MoleculeDefinition {
	const [atoms, bonds] = carbonChain(length);
	return covalent(formula, atoms, bonds, atoms.map((_, index) => index === 0 || index === length - 1 ? 3 : 2));
}

function alkanol(formula: string, length: number, position: number): MoleculeDefinition {
	const [atoms, bonds] = carbonChain(length);
	return covalent(formula, [...atoms, "oxygen"], [...bonds, [position, length]],
		[...atoms.map((_, index) => (index === 0 || index === length - 1 ? 3 : 2) - Number(index === position)), 1]);
}

function organic(name: string, category: ChemicalClass, structure: MoleculeDefinition, density: number,
	phase: ChemicalRecipe["phase"] = "liquid", concentrationLimit?: number) {
	return pure(name, category, structure, phase, density, concentrationLimit);
}

const propanone = covalent("C₃H₆O", ["carbon", "carbon", "carbon", "oxygen"], [[0, 1], [1, 2], [1, 3, 2]], [3, 0, 3, 0]);
const sulfuricAcid = covalent("H₂SO₄", ["sulfur", "oxygen", "oxygen", "oxygen", "oxygen"], [[0, 1, 2], [0, 2, 2], [0, 3], [0, 4]], [0, 0, 0, 1, 1]);
const phosphoricAcid = covalent("H₃PO₄", ["phosphorus", "oxygen", "oxygen", "oxygen", "oxygen"], [[0, 1, 2], [0, 2], [0, 3], [0, 4]], [0, 0, 1, 1, 1]);
const formicAcid = covalent("CH₂O₂", ["carbon", "oxygen", "oxygen"], [[0, 1, 2], [0, 2]], [1, 0, 1]);
const ammonia = molecule("NH₃", ["nitrogen"], [], [3]);
const peroxide = covalent("H₂O₂", ["oxygen", "oxygen"], [[0, 1]], [1, 1]);
const carbonDioxide = covalent("CO₂", ["carbon", "oxygen", "oxygen"], [[0, 1, 2], [0, 2, 2]], [0, 0, 0]);
const ethene = covalent("C₂H₄", ["carbon", "carbon"], [[0, 1, 2]], [2, 2]);
const iodine = covalent("I₂", ["iodine", "iodine"], [[0, 1]], [0, 0]);

function ion(formula: string, atom: string, charge: number): MoleculeDefinition {
	return { formula, atoms: [atom], bonds: [], charges: [charge] };
}

function oxoanion(formula: string, center: string, double: number, single: number): MoleculeDefinition {
	const size = double + single;
	return { formula, atoms: [center, ...Array<string>(size).fill("oxygen")],
		bonds: Array.from({ length: size }, (_, i) => `0-${i + 1}:covalent:${i < double ? 2 : 1}`),
		charges: [0, ...Array<number>(double).fill(0), ...Array<number>(single).fill(-1)] };
}

function saltSolution(name: string, formula: string, salt: string, cation: MoleculeDefinition, anion: MoleculeDefinition,
	cations = 1, anions = 1): CatalogChemical {
	return { name, formula, category: "Salze", concentrationLimit: saltSolubility[salt].saturation, recipe: { phase: "liquid", density: 1, aqueousMolar: true, parts: [
		{ molecule: water, amount: 55.5 }, { molecule: cation, amount: cations }, { molecule: anion, amount: anions },
	] } };
}

const sulfate = oxoanion("SO₄²⁻", "sulfur", 2, 2);
const nitrate = oxoanion("NO₃⁻", "nitrogen", 1, 2);
nitrate.charges = [1, 0, -1, -1];
const chloride = ion("Cl⁻", "chlorine", -1);
const bromide = ion("Br⁻", "bromine", -1);
const iodide = ion("I⁻", "iodine", -1);
const carbonate = oxoanion("CO₃²⁻", "carbon", 1, 2);
// Keep the proton explicit: the archived NaHCO₃ crystal omits H positions.
// This ion joins the same carbonic-acid family as the carbonate stock.
const bicarbonate: MoleculeDefinition = { formula: "HCO₃⁻",
	atoms: ["carbon", "oxygen", "oxygen", "oxygen", "hydrogen"],
	bonds: ["0-1:covalent:2", "0-2:covalent:1", "0-3:covalent:1", "3-4:covalent:1"],
	charges: [0, 0, -1, 0, 0] };
// Start neutral; the ionic bond transfers one electron from Na to the
// unprotonated oxygen. Explicit charges here would count that transfer twice.
const sodiumBicarbonate: MoleculeDefinition = { formula: "NaHCO₃",
	atoms: ["sodium", ...bicarbonate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:1", "1-4:covalent:1", "4-5:covalent:1", "0-3:ionic:1"] };
const sodium = ion("Na⁺", "sodium", 1);
const potassium = ion("K⁺", "potassium", 1);
// The nitrate keeps the N⁺/O⁻ charges of its resonance limit, because
// four-bonded nitrogen cannot be neutral. Potassium donates the second
// electron to the oxygen it bonds, so the anion comes out as the
// [O-][N+](=O)[O-] of the solubility table and KNO₃ dissolves like the stock.
const potassiumNitrate: MoleculeDefinition = { formula: "KNO₃",
	atoms: ["potassium", ...nitrate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:1", "1-4:covalent:1", "0-3:ionic:1"],
	charges: [0, 1, 0, 0, -1] };
const silverNitrate: MoleculeDefinition = { formula: "AgNO₃",
	atoms: ["silver", ...nitrate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:1", "1-4:covalent:1", "0-3:ionic:1"],
	charges: [0, 1, 0, 0, -1] };
// An ionic bond moves one electron, so a 1:2 or 1:3 salt needs one bond per
// anion; the charges then come out as Ba²⁺, Ca²⁺ or Fe³⁺ with the matching
// number of chlorides, exactly as the solubility table lists them.
const bariumChloride: MoleculeDefinition = { formula: "BaCl₂",
	atoms: ["barium", "chlorine", "chlorine"],
	bonds: ["0-1:ionic:1", "0-2:ionic:1"] };
const calciumChloride: MoleculeDefinition = { formula: "CaCl₂",
	atoms: ["calcium", "chlorine", "chlorine"],
	bonds: ["0-1:ionic:1", "0-2:ionic:1"] };
const ironChloride: MoleculeDefinition = { formula: "FeCl₃",
	atoms: ["iron", "chlorine", "chlorine", "chlorine"],
	bonds: ["0-1:ionic:1", "0-2:ionic:1", "0-3:ionic:1"] };
// The sulfate and carbonate skeletons stay neutral, so the two electrons the
// alkali metals give up arrive at the two unprotonated oxygens and the anion
// serialises as the [O-]S(=O)(=O)[O-] and [O-]C(=O)[O-] of the table.
const sodiumSulfate: MoleculeDefinition = { formula: "Na₂SO₄",
	atoms: ["sodium", "sodium", ...sulfate.atoms],
	bonds: ["2-3:covalent:2", "2-4:covalent:2", "2-5:covalent:1", "2-6:covalent:1", "0-5:ionic:1", "1-6:ionic:1"] };
const zincSulfate: MoleculeDefinition = { formula: "ZnSO₄",
	atoms: ["zinc", ...sulfate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:2", "1-4:covalent:1", "1-5:covalent:1", "0-4:ionic:1", "0-5:ionic:1"] };
const sodiumCarbonate: MoleculeDefinition = { formula: "Na₂CO₃",
	atoms: ["sodium", "sodium", ...carbonate.atoms],
	bonds: ["2-3:covalent:2", "2-4:covalent:1", "2-5:covalent:1", "0-4:ionic:1", "1-5:ionic:1"] };
// Ammonium chloride gives its one electron to chlorine, so the nitrogen keeps
// its four hydrogens and one positive charge. The fragment serialises as [N+],
// Kekule's ammonium form and the key of the solubility table; [NH4+] is only
// the alias that names the ammonia family. The dry salt and the stock
// therefore acidify through the existing ammonium speciation instead of a
// salt-specific reaction.
const ammoniumChloride: MoleculeDefinition = { formula: "NH₄Cl",
	atoms: ["nitrogen", "hydrogen", "hydrogen", "hydrogen", "hydrogen", "chlorine"],
	bonds: ["0-1:covalent:1", "0-2:covalent:1", "0-3:covalent:1", "0-4:covalent:1", "0-5:ionic:1"] };
// Sodium acetate takes the oxyanion route of the carbonate and sulfate salts:
// the neutral acetate skeleton keeps three hydrogens on the methyl group, and
// the sodium gives its electron to the unprotonated oxygen, which leaves the
// CC(=O)[O-] of the solubility table and of the acetic-acid family.
const sodiumAcetate: MoleculeDefinition = { formula: "CH₃COONa",
	atoms: ["sodium", "carbon", "carbon", "oxygen", "oxygen", "hydrogen", "hydrogen", "hydrogen"],
	bonds: ["1-2:covalent:1", "2-3:covalent:2", "2-4:covalent:1", "1-5:covalent:1", "1-6:covalent:1", "1-7:covalent:1", "0-4:ionic:1"] };
const ammonium = { formula: "NH₄⁺", atoms: ["nitrogen", "hydrogen", "hydrogen", "hydrogen", "hydrogen"],
	bonds: ["0-1:covalent:1", "0-2:covalent:1", "0-3:covalent:1", "0-4:covalent:1"], charges: [1, 0, 0, 0, 0] };
const acetate = { formula: "CH₃COO⁻", atoms: ["carbon", "carbon", "oxygen", "oxygen", "hydrogen", "hydrogen", "hydrogen"],
	bonds: ["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1", "0-4:covalent:1", "0-5:covalent:1", "0-6:covalent:1"],
	charges: [0, 0, 0, -1, 0, 0, 0] };


const sodiumChloride = salt("Natriumchlorid", "NaCl", "sodium", "chlorine");
const aceticAcid = molecule("C₂H₄O₂", ["carbon", "carbon", "oxygen", "oxygen"],
	["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1"], [3, 0, 0, 1]);

// Densities in g/mL are approximate. Solution recipes use nominal amounts
// per litre of water, as in the original palette's acid/base stock solutions.
export const chemicalCatalog: CatalogChemical[] = [
	element("Eisen", "Fe", "iron", 7.87),
	element("Kupfer", "Cu", "copper", 8.96),
	element("Zink", "Zn", "zinc", 7.14),
	element("Magnesium", "Mg", "magnesium", 1.74),
	element("Aluminium", "Al", "aluminium", 2.70),
	element("Zinn", "Sn", "tin", 7.31),
	element("Silber", "Ag", "silver", 10.49),
	element("Nickel", "Ni", "nickel", 8.90),
	element("Platin", "Pt", "platinum", 21.45),
	element("Calcium", "Ca", "calcium", 1.55),
	reference("Natrium", "Metalle", "Na"),
	reference("Kalium", "Metalle", "K"),
	element("Kohlenstoff", "C", "carbon", 2.26, "Nichtmetalle und Gase"),
	element("Schwefel", "S", "sulfur", 2.07, "Nichtmetalle und Gase"),
	pure("Iod", "Nichtmetalle und Gase", iodine, "solid", 4.93),
	reference("Wasserstoff", "Nichtmetalle und Gase", "H₂", covalent("H₂", ["hydrogen", "hydrogen"], [[0, 1]], [0, 0])),
	reference("Sauerstoff", "Nichtmetalle und Gase", "O₂", covalent("O₂", ["oxygen", "oxygen"], [[0, 1, 2]], [0, 0])),
	reference("Stickstoff", "Nichtmetalle und Gase", "N₂", covalent("N₂", ["nitrogen", "nitrogen"], [[0, 1, 3]], [0, 0])),
	reference("Kohlenstoffdioxid", "Nichtmetalle und Gase", carbonDioxide.formula, carbonDioxide),
	reference("Chlor", "Nichtmetalle und Gase", "Cl₂"),
	sodiumChloride,
	salt("Kaliumchlorid", "KCl", "potassium", "chlorine"),
	salt("Natriumbromid", "NaBr", "sodium", "bromine"),
	salt("Kaliumbromid", "KBr", "potassium", "bromine"),
	salt("Natriumiodid", "NaI", "sodium", "iodine"),
	salt("Kaliumiodid", "KI", "potassium", "iodine"),
	// Every dry salt here has a stock further down under the same analytical
	// formula. The solubility table decides the rest: a saturated salt keeps a
	// reservoir at its tabulated concentration, a freely soluble one dissolves
	// completely.
	pure("Silbernitrat", "Salze", silverNitrate, "solid", saltSolubility.AgNO3.solidDensity),
	pure("Bariumchlorid", "Salze", bariumChloride, "solid", saltSolubility.BaCl2.solidDensity),
	pure("Calciumchlorid", "Salze", calciumChloride, "solid", saltSolubility.CaCl2.solidDensity),
	pure("Eisen(III)-chlorid", "Salze", ironChloride, "solid", saltSolubility.FeCl3.solidDensity),
	pure("Natriumcarbonat", "Salze", sodiumCarbonate, "solid", saltSolubility.Na2CO3.solidDensity),
	pure("Natriumsulfat", "Salze", sodiumSulfate, "solid", saltSolubility.Na2SO4.solidDensity),
	pure("Zinksulfat", "Salze", zincSulfate, "solid", saltSolubility.ZnSO4.solidDensity),
	pure("Kaliumnitrat", "Salze", potassiumNitrate, "solid", saltSolubility.KNO3.solidDensity),
	pure("Ammoniumchlorid", "Salze", ammoniumChloride, "solid", saltSolubility.NH4Cl.solidDensity),
	pure("Natriumacetat", "Salze", sodiumAcetate, "solid", saltSolubility.CH3COONa.solidDensity),
	aqueous("Natriumchloridlösung (1 mol/L)", "Salze", sodiumChloride.preview, saltSolubility.NaCl.saturation),
	saltSolution("Kaliumchloridlösung", "KCl", "KCl", potassium, chloride),
	saltSolution("Kaliumbromidlösung", "KBr", "KBr", potassium, bromide),
	saltSolution("Kaliumiodidlösung", "KI", "KI", potassium, iodide),
	saltSolution("Natriumbromidlösung", "NaBr", "NaBr", sodium, bromide),
	saltSolution("Natriumiodidlösung", "NaI", "NaI", sodium, iodide),
	saltSolution("Kupfer(II)-sulfatlösung", "CuSO₄", "CuSO4", ion("Cu²⁺", "copper", 2), sulfate),
	saltSolution("Zinksulfatlösung", "ZnSO₄", "ZnSO4", ion("Zn²⁺", "zinc", 2), sulfate),
	saltSolution("Eisen(II)-sulfatlösung", "FeSO₄", "FeSO4", ion("Fe²⁺", "iron", 2), sulfate),
	saltSolution("Silbernitratlösung", "AgNO₃", "AgNO3", ion("Ag⁺", "silver", 1), nitrate),
	saltSolution("Bariumchloridlösung", "BaCl₂", "BaCl2", ion("Ba²⁺", "barium", 2), chloride, 1, 2),
	saltSolution("Calciumchloridlösung", "CaCl₂", "CaCl2", ion("Ca²⁺", "calcium", 2), chloride, 1, 2),
	saltSolution("Eisen(III)-chloridlösung", "FeCl₃", "FeCl3", ion("Fe³⁺", "iron", 3), chloride, 1, 3),
	saltSolution("Natriumcarbonatlösung", "Na₂CO₃", "Na2CO3", sodium, carbonate, 2),
	saltSolution("Natriumsulfatlösung", "Na₂SO₄", "Na2SO4", sodium, sulfate, 2),
	saltSolution("Kaliumnitratlösung", "KNO₃", "KNO3", potassium, nitrate),
	saltSolution("Ammoniumchloridlösung", "NH₄Cl", "NH4Cl", ammonium, chloride),
	saltSolution("Natriumacetatlösung", "CH₃COONa", "CH3COONa", sodium, acetate),
	reference("Kupfer(II)-sulfat-Pentahydrat", "Salze", "CuSO₄·5 H₂O"),
	reference("Calciumcarbonat", "Salze", "CaCO₃"),
	reference("Calciumsulfat-Dihydrat", "Salze", "CaSO₄·2 H₂O"),
	// The archived crystal selects the dry salt; the stock is a separate reagent.
	pure("Natriumhydrogencarbonat", "Salze", sodiumBicarbonate, "solid", saltSolubility.NaHCO3.solidDensity),
	saltSolution("Natriumhydrogencarbonatlösung", "NaHCO₃", "NaHCO3", sodium, bicarbonate),
	reference("Magnesiumsulfat-Heptahydrat", "Salze", "MgSO₄·7 H₂O"),
	reference("Natriumthiosulfat-Pentahydrat", "Salze", "Na₂S₂O₃·5 H₂O"),
	reference("Kaliumpermanganat", "Salze", "KMnO₄"),
	reference("Kaliumthiocyanat", "Salze", "KSCN"),
	reference("Kaliumnatriumtartrat", "Salze", "KNaC₄H₄O₆"),
	reference("Eisen(II)-sulfat-Heptahydrat", "Salze", "FeSO₄·7 H₂O"),
	reference("Ammoniumsulfat", "Salze", "(NH₄)₂SO₄"),
	reference("Eisen(II)-sulfid", "Salze", "FeS"),
	reference("Silberchlorid", "Salze", "AgCl"),
	reference("Bariumsulfat", "Salze", "BaSO₄"),
	pure("Natriumhydroxid", "Basen", naoh, "solid", 2.13),
	aqueous("Natronlauge (1 mol/L)", "Basen", naoh, concentratedReagent.sodiumHydroxide),
	aqueous("Kalilauge (1 mol/L)", "Basen", { formula: "KOH", atoms: ["potassium", "oxygen", "hydrogen"],
		bonds: ["0-1:acidbase:1", "1-2:covalent:1"] }, concentratedReagent.potassiumHydroxide),
	aqueous("Ammoniaklösung", "Basen", ammonia, concentratedReagent.ammonia),
	reference("Calciumhydroxid", "Basen", "Ca(OH)₂"),
	reference("Kalkwasser", "Basen", "Ca(OH)₂ (aq)"),
	aqueous("Salzsäure (1 mol/L)", "Anorganische Säuren", hcl, concentratedReagent.hydrochloricAcid),
	aqueous("Schwefelsäure (1 mol/L)", "Anorganische Säuren", sulfuricAcid, concentratedReagent.sulfuricAcid),
	aqueous("Phosphorsäure (1 mol/L)", "Anorganische Säuren", phosphoricAcid, concentratedReagent.phosphoricAcid),
	reference("Salpetersäure", "Anorganische Säuren", "HNO₃"),
	pure("Wasser", "Lösungsmittel", water, "liquid", 1),
	organic("Cyclohexan", "Kohlenwasserstoffe", covalent("C₆H₁₂", Array(6).fill("carbon"),
		[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], [2, 2, 2, 2, 2, 2]), 0.779),
	organic("Heptan", "Kohlenwasserstoffe", alkane("C₇H₁₆", 7), 0.684),
	organic("Hexan", "Kohlenwasserstoffe", alkane("C₆H₁₄", 6), 0.659),
	organic("Cyclohexen", "Kohlenwasserstoffe", covalent("C₆H₁₀", Array(6).fill("carbon"),
		[[0, 1, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], [1, 1, 2, 2, 2, 2]), 0.811),
	reference("Methan", "Kohlenwasserstoffe", "CH₄", molecule("CH₄", ["carbon"], [], [4])),
	reference("Ethen", "Kohlenwasserstoffe", ethene.formula, ethene),
	reference("Propan", "Kohlenwasserstoffe", "C₃H₈", alkane("C₃H₈", 3)),
	reference("Butan", "Kohlenwasserstoffe", "C₄H₁₀", alkane("C₄H₁₀", 4)),
	reference("Ethin", "Kohlenwasserstoffe", "C₂H₂"),
	reference("Dichlormethan", "Halogenkohlenwasserstoffe", "CH₂Cl₂"),
	reference("Bromethan", "Halogenkohlenwasserstoffe", "C₂H₅Br"),
	reference("Chlorethen (Vinylchlorid)", "Halogenkohlenwasserstoffe", "C₂H₃Cl"),
	reference("Paraffinöl", "Lösungsmittel", ""),
	reference("Petrolether", "Lösungsmittel", ""),
	organic("Ethanol", "Alkohole", alkanol("C₂H₆O", 2, 1), 0.789),
	organic("Methanol", "Alkohole", covalent("CH₄O", ["carbon", "oxygen"], [[0, 1]], [3, 1]), 0.792),
	organic("Propan-1-ol", "Alkohole", alkanol("C₃H₈O", 3, 0), 0.803),
	organic("Propan-2-ol", "Alkohole", alkanol("C₃H₈O", 3, 1), 0.785),
	organic("Butan-1-ol", "Alkohole", alkanol("C₄H₁₀O", 4, 0), 0.810),
	organic("Butan-2-ol", "Alkohole", alkanol("C₄H₁₀O", 4, 1), 0.806),
	organic("Pentan-1-ol", "Alkohole", alkanol("C₅H₁₂O", 5, 0), 0.814),
	reference("3-Methylbutan-1-ol (Isoamylalkohol)", "Alkohole", "C₅H₁₂O"),
	reference("Tetradecan-1-ol (Myristylalkohol)", "Alkohole", "C₁₄H₃₀O"),
	organic("Ethan-1,2-diol", "Alkohole", covalent("C₂H₆O₂", ["carbon", "carbon", "oxygen", "oxygen"],
		[[0, 1], [0, 2], [1, 3]], [2, 2, 1, 1]), 1.11),
	organic("Glycerin", "Alkohole", covalent("C₃H₈O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [0, 3], [1, 4], [2, 5]], [2, 1, 2, 1, 1, 1]), 1.26),
	organic("Ethanal", "Aldehyde", covalent("C₂H₄O", ["carbon", "carbon", "oxygen"], [[0, 1], [1, 2, 2]], [3, 1, 0]), 0.784),
	organic("Propanal", "Aldehyde", covalent("C₃H₆O", ["carbon", "carbon", "carbon", "oxygen"],
		[[0, 1], [1, 2], [2, 3, 2]], [3, 2, 1, 0]), 0.798),
	reference("Methanal (Formaldehyd)", "Aldehyde", "CH₂O", covalent("CH₂O", ["carbon", "oxygen"], [[0, 1, 2]], [2, 0])),
	reference("Benzaldehyd", "Aldehyde", "C₇H₆O"),
	organic("Aceton", "Ketone", propanone, 0.791),
	organic("Butan-2-on", "Ketone", covalent("C₄H₈O", ["carbon", "carbon", "carbon", "carbon", "oxygen"],
		[[0, 1], [1, 2], [2, 3], [1, 4, 2]], [3, 0, 2, 3, 0]), 0.805),
	organic("Essigsäure", "Carbonsäuren", aceticAcid, 1.05, "liquid", concentratedReagent.aceticAcid),
	organic("Ameisensäure", "Carbonsäuren", formicAcid, 1.22, "liquid", concentratedReagent.formicAcid),
	organic("Propionsäure", "Carbonsäuren", covalent("C₃H₆O₂", ["carbon", "carbon", "carbon", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [2, 3, 2], [2, 4]], [3, 2, 0, 0, 1]), 0.993, "liquid", concentratedReagent.propionicAcid),
	organic("Milchsäure", "Carbonsäuren", covalent("C₃H₆O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [1, 3], [2, 4, 2], [2, 5]], [3, 1, 0, 1, 0, 1]), 1.21, "liquid", concentratedReagent.lacticAcid),
	organic("Zitronensäure", "Carbonsäuren", covalent("C₆H₈O₇",
		[...Array(6).fill("carbon"), ...Array(7).fill("oxygen")],
		[[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6], [0, 7, 2], [0, 8], [4, 9, 2], [4, 10], [5, 11, 2], [5, 12]],
		[0, 2, 0, 2, 0, 0, 1, 0, 1, 0, 1, 0, 1]), 1.665, "solid", concentratedReagent.citricAcid),
	organic("Oxalsäure", "Carbonsäuren", covalent("C₂H₂O₄", ["carbon", "carbon", "oxygen", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [0, 2, 2], [0, 3], [1, 4, 2], [1, 5]], [0, 0, 0, 1, 0, 1]), 1.90, "solid", concentratedReagent.oxalicAcid),
	reference("Benzoesäure", "Carbonsäuren", "C₇H₆O₂"),
	reference("Sorbinsäure", "Carbonsäuren", "C₆H₈O₂"),
	reference("Tetradecansäure (Myristinsäure)", "Carbonsäuren", "C₁₄H₂₈O₂"),
	organic("Ethylacetat", "Ester", covalent("C₄H₈O₂", ["carbon", "carbon", "oxygen", "oxygen", "carbon", "carbon"],
		[[0, 1], [1, 2, 2], [1, 3], [3, 4], [4, 5]], [3, 0, 0, 0, 2, 3]), 0.902),
	reference("Isoamylacetat", "Ester", "C₇H₁₄O₂"),
	reference("Myristylmyristat", "Ester", "C₂₈H₅₆O₂"),
	reference("Kupfer(II)-oxid", "Oxide", "CuO"),
	reference("Magnesiumoxid", "Oxide", "MgO"),
	reference("Calciumoxid", "Oxide", "CaO"),
	reference("Eisen(III)-oxid", "Oxide", "Fe₂O₃"),
	reference("Mangan(IV)-oxid", "Oxide", "MnO₂"),
	reference("Siliciumdioxid", "Oxide", "SiO₂"),
	aqueous("Wasserstoffperoxidlösung", "Indikatoren und Nachweisreagenzien", peroxide),
	reference("Bromwasser", "Indikatoren und Nachweisreagenzien", "Br₂ (aq)"),
	reference("Lugolsche Lösung", "Indikatoren und Nachweisreagenzien", "I₂ / KI (aq)"),
	reference("Fehling I", "Indikatoren und Nachweisreagenzien", "CuSO₄ (aq)"),
	reference("Fehling II", "Indikatoren und Nachweisreagenzien", ""),
	reference("Benedict-Reagenz", "Indikatoren und Nachweisreagenzien", ""),
	reference("Schiff-Reagenz", "Indikatoren und Nachweisreagenzien", ""),
	reference("Tollens-Reagenz", "Indikatoren und Nachweisreagenzien", ""),
	reference("Phenolphthalein", "Indikatoren und Nachweisreagenzien", "C₂₀H₁₄O₄"),
	reference("Bromthymolblau", "Indikatoren und Nachweisreagenzien", "C₂₇H₂₈Br₂O₅S"),
	reference("Methylorange", "Indikatoren und Nachweisreagenzien", "C₁₄H₁₄N₃NaO₃S"),
	reference("Lackmus", "Indikatoren und Nachweisreagenzien", ""),
	reference("Universalindikator", "Indikatoren und Nachweisreagenzien", ""),
	reference("Rotkohlsaft", "Indikatoren und Nachweisreagenzien", ""),
	reference("Indigo", "Indikatoren und Nachweisreagenzien", "C₁₆H₁₀N₂O₂"),
	organic("Glucose", "Kohlenhydrate und Aminosäuren", covalent("C₆H₁₂O₆",
		[...Array(6).fill("carbon"), ...Array(6).fill("oxygen")],
		[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6, 2], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
		[1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1]), 1.54, "solid"),
	reference("Glycin", "Kohlenhydrate und Aminosäuren", "C₂H₅NO₂", covalent("C₂H₅NO₂", ["carbon", "carbon", "nitrogen", "oxygen", "oxygen"],
		[[0, 1], [0, 2], [1, 3, 2], [1, 4]], [2, 0, 2, 0, 1])),
	reference("Fructose", "Kohlenhydrate und Aminosäuren", "C₆H₁₂O₆"),
	reference("Saccharose", "Kohlenhydrate und Aminosäuren", "C₁₂H₂₂O₁₁"),
	reference("Stärke", "Kohlenhydrate und Aminosäuren", "(C₆H₁₀O₅)ₙ"),
	reference("Cellulose", "Kohlenhydrate und Aminosäuren", "(C₆H₁₀O₅)ₙ"),
	reference("Olivenöl", "Fette und Tenside", ""),
	reference("Stearinsäure", "Fette und Tenside", "C₁₈H₃₆O₂"),
	reference("Ölsäure", "Fette und Tenside", "C₁₈H₃₄O₂"),
	reference("Natriumstearat", "Fette und Tenside", "C₁₈H₃₅NaO₂"),
	reference("Natriumdodecylsulfat", "Fette und Tenside", "C₁₂H₂₅NaO₄S"),
	reference("Polyethylen (PE)", "Kunststoffe und Monomere", "(C₂H₄)ₙ"),
	reference("Polypropylen (PP)", "Kunststoffe und Monomere", "(C₃H₆)ₙ"),
	reference("Polystyrol (PS)", "Kunststoffe und Monomere", "(C₈H₈)ₙ"),
	reference("Polyvinylchlorid (PVC)", "Kunststoffe und Monomere", "(C₂H₃Cl)ₙ"),
	reference("Polyethylenterephthalat (PET)", "Kunststoffe und Monomere", "(C₁₀H₈O₄)ₙ"),
	reference("Polymilchsäure (PLA)", "Kunststoffe und Monomere", "(C₃H₄O₂)ₙ"),
	reference("Styrol", "Kunststoffe und Monomere", "C₈H₈"),
	reference("Methylmethacrylat", "Kunststoffe und Monomere", "C₅H₈O₂"),
	reference("Polyamid 6", "Kunststoffe und Monomere", "(C₆H₁₁NO)ₙ"),
	reference("Sand", "Stoffgemische", ""),
	reference("Leitungswasser", "Stoffgemische", ""),
	reference("Mineralwasser", "Stoffgemische", ""),
	reference("Haushaltsessig", "Stoffgemische", "CH₃COOH (aq)"),
	reference("Zitronensaft", "Stoffgemische", ""),
	reference("Luft", "Stoffgemische", ""),
];

const catalogAliases: Partial<Record<ChemicalClass, readonly string[]>> = {
	"Lösungsmittel": ["Ethanol", "Methanol", "Propan-2-ol", "Aceton", "Butan-2-on", "Ethylacetat", "Cyclohexan", "Hexan", "Heptan"],
};

// Keep reference entries in the catalog for preview generation and future recipes.
const dosableChemicals = chemicalCatalog.filter(
	(item): item is CatalogChemical & { recipe: ChemicalRecipe } => item.recipe !== undefined,
);

export const chemicalCatalogGroups = chemicalClasses.map((category) => ({
	category,
	items: dosableChemicals.filter((item) => item.category === category || catalogAliases[category]?.includes(item.name)),
})).filter(({ items }) => items.length > 0);
