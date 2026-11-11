export interface MoleculeDefinition {
	formula: string;
	atoms: string[];
	bonds: string[];
}

export interface ChemicalRecipe {
	phase: "solid" | "liquid";
	parts: Array<{ molecule: MoleculeDefinition; amount: number }>;
	density: number;
}

interface CatalogChemical extends ChemicalRecipe {
	name: string;
}

function pure(name: string, molecule: MoleculeDefinition, phase: ChemicalRecipe["phase"], density: number): CatalogChemical {
	return { name, phase, density, parts: [{ molecule, amount: 1 }] };
}

function element(name: string, formula: string, atom: string, density: number): CatalogChemical {
	return pure(name, { formula, atoms: [atom], bonds: [] }, "solid", density);
}

function salt(name: string, formula: string, metal: string, anion: string, density: number): CatalogChemical {
	return pure(name, { formula, atoms: [metal, anion], bonds: ["0-1:ionic:1"] }, "solid", density);
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

function aqueous(name: string, solute: MoleculeDefinition): CatalogChemical {
	return { name, phase: "liquid", density: 1, parts: [{ molecule: water, amount: 55.5 }, { molecule: solute, amount: 1 }] };
}

const sodiumChloride = salt("Natriumchlorid", "NaCl", "sodium", "chlorine", 2.16);
const aceticAcid = molecule("C₂H₄O₂", ["carbon", "carbon", "oxygen", "oxygen"],
	["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1"], [3, 0, 0, 1]);

// Approximate densities in g/mL for translating a modeled dose volume into mass.
export const chemicalCatalog: CatalogChemical[] = [
	element("Eisen", "Fe", "iron", 7.87),
	element("Kupfer", "Cu", "copper", 8.96),
	element("Zink", "Zn", "zinc", 7.14),
	element("Magnesium", "Mg", "magnesium", 1.74),
	element("Aluminium", "Al", "aluminium", 2.70),
	element("Kohlenstoff", "C", "carbon", 2.26),
	element("Schwefel", "S", "sulfur", 2.07),
	element("Zinn", "Sn", "tin", 7.31),
	sodiumChloride,
	salt("Kaliumchlorid", "KCl", "potassium", "chlorine", 1.98),
	salt("Natriumbromid", "NaBr", "sodium", "bromine", 3.20),
	salt("Kaliumbromid", "KBr", "potassium", "bromine", 2.75),
	salt("Natriumiodid", "NaI", "sodium", "iodine", 3.67),
	salt("Kaliumiodid", "KI", "potassium", "iodine", 3.12),
	pure("Natriumhydroxid", naoh, "solid", 2.13),
	pure("Wasser", water, "liquid", 1),
	pure("Ethanol", molecule("C₂H₆O", ["carbon", "carbon", "oxygen"],
		["0-1:covalent:1", "1-2:covalent:1"], [3, 2, 1]), "liquid", 0.789),
	pure("Methanol", molecule("CH₄O", ["carbon", "oxygen"], ["0-1:covalent:1"], [3, 1]), "liquid", 0.792),
	pure("Aceton", molecule("C₃H₆O", ["carbon", "carbon", "carbon", "oxygen"],
		["0-1:covalent:1", "1-2:covalent:1", "1-3:covalent:2"], [3, 0, 3, 0]), "liquid", 0.791),
	pure("Essigsäure", aceticAcid, "liquid", 1.05),
	pure("Glycerin", molecule("C₃H₈O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		["0-1:covalent:1", "1-2:covalent:1", "0-3:covalent:1", "1-4:covalent:1", "2-5:covalent:1"],
		[2, 1, 2, 1, 1, 1]), "liquid", 1.26),
	aqueous("Salzsäure (1 mol/L)", hcl),
	aqueous("Natronlauge (1 mol/L)", naoh),
	aqueous("Natriumchloridlösung (1 mol/L)", sodiumChloride.parts[0].molecule),
];
