export interface MoleculeDefinition {
	formula: string;
	atoms: string[];
	bonds: string[];
	charges?: number[];
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

function pure(name: string, category: ChemicalClass, preview: MoleculeDefinition,
	phase: ChemicalRecipe["phase"], density: number): CatalogChemical {
	return { name, category, formula: preview.formula, preview, recipe: { phase, density, parts: [{ molecule: preview, amount: 1 }] },
		concentrationLimit: category === "Carbonsäuren" || category === "Basen" ? 1 : undefined };
}

function element(name: string, formula: string, atom: string, density: number, category: ChemicalClass = "Metalle"): CatalogChemical {
	return pure(name, category, { formula, atoms: [atom], bonds: [] }, "solid", density);
}

function reference(name: string, category: ChemicalClass, formula: string, preview?: MoleculeDefinition): CatalogChemical {
	return { name, category, formula, preview };
}

function salt(name: string, formula: string, metal: string, anion: string, density: number): CatalogChemical {
	return pure(name, "Salze", { formula, atoms: [metal, anion], bonds: ["0-1:ionic:1"] }, "solid", density);
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

function organic(name: string, category: ChemicalClass, structure: MoleculeDefinition, density: number, phase: ChemicalRecipe["phase"] = "liquid") {
	return pure(name, category, structure, phase, density);
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

function saltSolution(name: string, formula: string, cation: MoleculeDefinition, anion: MoleculeDefinition,
	cations = 1, anions = 1): CatalogChemical {
	return { name, formula, category: "Salze", concentrationLimit: 1, recipe: { phase: "liquid", density: 1, aqueousMolar: true, parts: [
		{ molecule: water, amount: 55.5 }, { molecule: cation, amount: cations }, { molecule: anion, amount: anions },
	] } };
}

const sulfate = oxoanion("SO₄²⁻", "sulfur", 2, 2);
const nitrate = oxoanion("NO₃⁻", "nitrogen", 1, 2);
nitrate.charges = [1, 0, -1, -1];
const chloride = ion("Cl⁻", "chlorine", -1);
const carbonate = oxoanion("CO₃²⁻", "carbon", 1, 2);
const sodium = ion("Na⁺", "sodium", 1);


const sodiumChloride = salt("Natriumchlorid", "NaCl", "sodium", "chlorine", 2.16);
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
	salt("Kaliumchlorid", "KCl", "potassium", "chlorine", 1.98),
	salt("Natriumbromid", "NaBr", "sodium", "bromine", 3.20),
	salt("Kaliumbromid", "KBr", "potassium", "bromine", 2.75),
	salt("Natriumiodid", "NaI", "sodium", "iodine", 3.67),
	salt("Kaliumiodid", "KI", "potassium", "iodine", 3.12),
	aqueous("Natriumchloridlösung (1 mol/L)", "Salze", sodiumChloride.preview, 2),
	saltSolution("Kupfer(II)-sulfatlösung", "CuSO₄", ion("Cu²⁺", "copper", 2), sulfate),
	saltSolution("Zinksulfatlösung", "ZnSO₄", ion("Zn²⁺", "zinc", 2), sulfate),
	saltSolution("Eisen(II)-sulfatlösung", "FeSO₄", ion("Fe²⁺", "iron", 2), sulfate),
	saltSolution("Silbernitratlösung", "AgNO₃", ion("Ag⁺", "silver", 1), nitrate),
	saltSolution("Bariumchloridlösung", "BaCl₂", ion("Ba²⁺", "barium", 2), chloride, 1, 2),
	saltSolution("Calciumchloridlösung", "CaCl₂", ion("Ca²⁺", "calcium", 2), chloride, 1, 2),
	saltSolution("Eisen(III)-chloridlösung", "FeCl₃", ion("Fe³⁺", "iron", 3), chloride, 1, 3),
	saltSolution("Natriumcarbonatlösung", "Na₂CO₃", sodium, carbonate, 2),
	saltSolution("Natriumsulfatlösung", "Na₂SO₄", sodium, sulfate, 2),
	saltSolution("Kaliumnitratlösung", "KNO₃", ion("K⁺", "potassium", 1), nitrate),
	reference("Kupfer(II)-sulfat-Pentahydrat", "Salze", "CuSO₄·5 H₂O"),
	reference("Calciumcarbonat", "Salze", "CaCO₃"),
	reference("Calciumsulfat-Dihydrat", "Salze", "CaSO₄·2 H₂O"),
	reference("Natriumhydrogencarbonat", "Salze", "NaHCO₃"),
	reference("Magnesiumsulfat-Heptahydrat", "Salze", "MgSO₄·7 H₂O"),
	reference("Ammoniumchlorid", "Salze", "NH₄Cl"),
	reference("Natriumacetat", "Salze", "CH₃COONa"),
	reference("Natriumthiosulfat-Pentahydrat", "Salze", "Na₂S₂O₃·5 H₂O"),
	reference("Kaliumpermanganat", "Salze", "KMnO₄"),
	reference("Kaliumthiocyanat", "Salze", "KSCN"),
	reference("Kaliumnatriumtartrat", "Salze", "KNaC₄H₄O₆"),
	reference("Eisen(II)-sulfat-Heptahydrat", "Salze", "FeSO₄·7 H₂O"),
	reference("Ammoniumsulfat", "Salze", "(NH₄)₂SO₄"),
	reference("Eisen(II)-sulfid", "Salze", "FeS"),
	reference("Kaliumnitrat", "Salze", "KNO₃"),
	reference("Calciumchlorid", "Salze", "CaCl₂"),
	reference("Silberchlorid", "Salze", "AgCl"),
	reference("Bariumsulfat", "Salze", "BaSO₄"),
	pure("Natriumhydroxid", "Basen", naoh, "solid", 2.13),
	aqueous("Natronlauge (1 mol/L)", "Basen", naoh, 2),
	aqueous("Kalilauge (1 mol/L)", "Basen", { formula: "KOH", atoms: ["potassium", "oxygen", "hydrogen"], bonds: ["0-1:acidbase:1", "1-2:covalent:1"] }),
	aqueous("Ammoniaklösung", "Basen", ammonia),
	reference("Calciumhydroxid", "Basen", "Ca(OH)₂"),
	reference("Kalkwasser", "Basen", "Ca(OH)₂ (aq)"),
	aqueous("Salzsäure (1 mol/L)", "Anorganische Säuren", hcl, 2),
	aqueous("Schwefelsäure (1 mol/L)", "Anorganische Säuren", sulfuricAcid),
	aqueous("Phosphorsäure (1 mol/L)", "Anorganische Säuren", phosphoricAcid),
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
	organic("Essigsäure", "Carbonsäuren", aceticAcid, 1.05),
	organic("Ameisensäure", "Carbonsäuren", formicAcid, 1.22),
	organic("Propionsäure", "Carbonsäuren", covalent("C₃H₆O₂", ["carbon", "carbon", "carbon", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [2, 3, 2], [2, 4]], [3, 2, 0, 0, 1]), 0.993),
	organic("Milchsäure", "Carbonsäuren", covalent("C₃H₆O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [1, 3], [2, 4, 2], [2, 5]], [3, 1, 0, 1, 0, 1]), 1.21),
	organic("Zitronensäure", "Carbonsäuren", covalent("C₆H₈O₇",
		[...Array(6).fill("carbon"), ...Array(7).fill("oxygen")],
		[[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6], [0, 7, 2], [0, 8], [4, 9, 2], [4, 10], [5, 11, 2], [5, 12]],
		[0, 2, 0, 2, 0, 0, 1, 0, 1, 0, 1, 0, 1]), 1.665, "solid"),
	organic("Oxalsäure", "Carbonsäuren", covalent("C₂H₂O₄", ["carbon", "carbon", "oxygen", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [0, 2, 2], [0, 3], [1, 4, 2], [1, 5]], [0, 0, 0, 1, 0, 1]), 1.90, "solid"),
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
	reference("Phenolphthalein", "Indikatoren und Nachweisreagenzien", "C₂₀H₁₂O₄"),
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
