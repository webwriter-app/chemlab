import type { AqueousAcidBase } from "../chemlib/AcidBase";
import { MOLAR_GAS_VOLUME } from "../chemlib/gasEvolution";
import { saltSolubility } from "../chemlib/saltSolubility";
import { structureGraphs } from "./structureDefinitions.generated";

export interface MoleculeDefinition {
	formula: string;
	name?: string;
	atoms: string[];
	bonds: string[];
	charges?: number[];
	aqueousAcidBase?: AqueousAcidBase;
}

export interface ChemicalRecipe {
	phase: "solid" | "liquid" | "gas";
	parts: Array<{ molecule: MoleculeDefinition; amount: number }>;
	/** Density in g/mL. A gas carries the density it has at lab conditions. */
	density: number;
	/** Solute amounts are expressed in mol per model litre of aqueous solution. */
	aqueousMolar?: true;
	/**
	 * Id of the gas in `evolvedGases`, for a reagent that is dosed as the
	 * volume it takes up. The amount then follows from the molar volume and
	 * the target vessel decides how much of it the solution dissolves, so the
	 * parts carry no measure of their own.
	 */
	gas?: string;
	/**
	 * Shares of a gas mixture, as fractions of the dosed volume. A bottle of air
	 * is not one gas, so a dose books every constituent into the target's gas
	 * space instead of naming a single {@link gas}.
	 */
	gases?: ReadonlyArray<{ gas: string; share: number }>;
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
	"Magnesiumsulfatlösung": "Magnesiumsulfat",
	"Silbernitratlösung": "Silbernitrat",
	"Bariumchloridlösung": "Bariumchlorid",
	"Calciumchloridlösung": "Calciumchlorid",
	"Eisen(III)-chloridlösung": "Eisen(III)-chlorid",
	"Natriumcarbonatlösung": "Natriumcarbonat",
	"Natriumhydrogencarbonatlösung": "Natriumhydrogencarbonat",
	"Silberchloridlösung (gesättigt)": "Silberchlorid",
	"Bariumsulfatlösung (gesättigt)": "Bariumsulfat",
	"Calciumcarbonatlösung (gesättigt)": "Calciumcarbonat",
	"Eisen(II)-sulfidlösung (gesättigt)": "Eisen(II)-sulfid",
	"Calciumsulfatlösung (gesättigt)": "Calciumsulfat",
	"Natriumsulfatlösung": "Natriumsulfat",
	"Kaliumchloridlösung": "Kaliumchlorid",
	"Kaliumbromidlösung": "Kaliumbromid",
	"Kaliumiodidlösung": "Kaliumiodid",
	"Kaliumnitratlösung": "Kaliumnitrat",
	"Ammoniumsulfatlösung": "Ammoniumsulfat",
	"Kaliumthiocyanatlösung": "Kaliumthiocyanat",
	"Kaliumpermanganatlösung": "Kaliumpermanganat",
	"Natriumthiosulfatlösung": "Natriumthiosulfat",
	"Kaliumnatriumtartratlösung": "Kaliumnatriumtartrat",
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
	nitricAcid: 14.4, // 65%, 1.39 g/mL, 65 · 1.39 / 63.01 · 10 = 14.34 mol/L
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
// One ionic bond per hydroxide, so the salt solver splits Ca²⁺ + 2 [OH-], the
// ions the solubility table lists. This is the only spelling that reaches the
// hydroxide equilibria: a hand-built, imported or builder-derived graph carries
// an `acidbase` bond on each hydroxide instead, which `acidBaseComposition`
// splits into neutral fragments and the salt solver does not recognise, so such
// a graph stays a molecular solid without a solubility product. The catalog
// therefore draws the ionic graph and gives the weighed solid and the saturated
// stock the same definition, so the two can never disagree.
const calciumHydroxide: MoleculeDefinition = {
	formula: "Ca(OH)₂", atoms: ["calcium", "oxygen", "hydrogen", "oxygen", "hydrogen"],
	bonds: ["0-1:ionic:1", "1-2:covalent:1", "0-3:ionic:1", "3-4:covalent:1"],
};

function aqueous(name: string, category: ChemicalClass, solute: MoleculeDefinition, concentrationLimit = 1): CatalogChemical {
	return { name, category, formula: solute.formula, preview: solute,
		concentrationLimit,
		recipe: { phase: "liquid", density: 1, aqueousMolar: true, parts: [{ molecule: water, amount: 55.5 }, { molecule: solute, amount: 1 }] } };
}

/**
 * A reagent bottle that holds several modeled substances instead of one.
 *
 * The card keeps the formula the bottle carries, because a reagent mixture has
 * no single graph, while the parts are what the model doses: they are given in
 * mol per model litre at concentration 1, exactly like a stock of one solute.
 * That way `withConcentration` sets the strength of the whole mixture with one
 * number and the charge of the parts stays balanced under dilution, and the
 * acid-base, salt, hydroxide and complex solvers only ever see the ion pairs
 * the bottle really contains. A part the structure library does not carry turns
 * the row back into a reference entry, so the palette still lists the bottle
 * and the coverage report keeps counting the gap instead of dosing a substitute.
 */
function mixedStock(name: string, category: ChemicalClass, formula: string,
	parts: ReadonlyArray<{ molecule: MoleculeDefinition | undefined; amount: number }>,
	concentrationLimit: number): CatalogChemical {
	if (parts.some(({ molecule }) => !molecule)) return reference(name, category, formula);
	const solute = parts as ReadonlyArray<{ molecule: MoleculeDefinition; amount: number }>;
	return { name, category, formula, concentrationLimit,
		recipe: { phase: "liquid", density: 1, aqueousMolar: true,
			parts: [{ molecule: water, amount: 55.5 }, ...solute.map(({ molecule, amount }) => ({ molecule, amount }))] } };
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

// A reagent whose molecular graph comes from the shared structure library, so
// the catalog card, the dose and the structure the molecule builder shows are
// one and the same graph. Only spectator substances use this path: an acid, a
// base or a salt needs its own definition, because the dissociation of the
// model hangs on `acidbase` and `ionic` bonds and on the ion spellings of the
// solubility table. A substance the library does not carry keeps its entry
// without a recipe, so the palette still lists it and the coverage report keeps
// counting the gap.
function molecular(name: string, category: ChemicalClass, formula: string, density: number,
	phase: ChemicalRecipe["phase"] = "solid", concentrationLimit?: number): CatalogChemical {
	const graph = structureGraphs[name];
	if (!graph) return { name, category, formula };
	return pure(name, category, { formula, ...graph }, phase, density, concentrationLimit);
}

// One graph of the shared structure library, asked for by its library key. A
// row that needs a single part of a library structure — one ion of a mixture,
// say — cannot go through a recipe that names the whole substance, so it asks
// for the key directly.
function libraryMolecule(key: string, formula: string): MoleculeDefinition | undefined {
	const graph = structureGraphs[key];
	return graph ? { formula, ...graph } : undefined;
}

// An acid whose graph comes from the structure library keeps that graph and
// carries its own acid-base data, because the hand-written table in
// `StructureManager` keys on its own SMILES spellings and the library draws the
// same molecule with different ones. `aqueousAcidBase` travels on the
// definition, so the catalog card, the dose, the conjugate cards and the
// structure the molecule builder shows stay one graph.
function libraryAcidBase(name: string, formula: string, aqueousAcidBase: AqueousAcidBase): MoleculeDefinition | undefined {
	const graph = libraryMolecule(name, formula);
	return graph ? { ...graph, aqueousAcidBase } : undefined;
}

// A solid acid is dosed as a weighed portion and dissolves completely: the
// model has no solubility product for a molecular crystal, so a dose smaller
// than the saturation of the real substance dissolves, and a larger one does
// too. `density` only sets the bulk volume the portion takes up before it
// dissolves. A fatty acid that is a liquid at room temperature takes the same
// route as the pure liquid, because the model reads the acid-base family from
// the definition and not from the phase of the portion.
function acidReagent(name: string, category: ChemicalClass, formula: string, density: number,
	aqueousAcidBase: AqueousAcidBase, phase: "solid" | "liquid" = "solid"): CatalogChemical {
	const preview = libraryAcidBase(name, formula, aqueousAcidBase);
	return preview ? pure(name, category, preview, phase, density) : { name, category, formula };
}

// The same acid as a stock. `concentrationLimit` is the concentration the
// palette offers, so a saturated stock reads like lime water or bromine water.
function acidSolution(name: string, category: ChemicalClass, formula: string, aqueousAcidBase: AqueousAcidBase,
	concentrationLimit: number): CatalogChemical {
	const preview = libraryAcidBase(name, formula, aqueousAcidBase);
	return preview ? aqueous(name, category, preview, concentrationLimit) : { name, category, formula };
}

// A stock whose solute is a graph of the shared library: bromine water is the
// saturated solution of the library's Br₂, so the card, the dose and the
// structure in the molecule builder show the same molecule.
function graphSolution(name: string, category: ChemicalClass, formula: string,
	solute: MoleculeDefinition | undefined, concentrationLimit: number): CatalogChemical {
	return solute ? aqueous(name, category, { ...solute, formula }, concentrationLimit) : { name, category, formula };
}

/**
 * A portion taken from a gas bottle: the palette asks for a volume and books the
 * molar amount, so the recipe carries the volume rather than a weighed portion
 * and the graph from the library only serves the card.
 *
 * With a `gas` key the receiving vessel decides how much of it dissolves, up to
 * the tabulated Henry saturation, and the rest joins the gas space. `parts`
 * names a species the dose books instead: carbon dioxide needs it because the
 * model keeps dissolved CO₂ as the carbonic-acid family that the gas evolution
 * removes from, and formaldehyde needs it because it has no Henry row and a
 * portion must not escape again.
 */
function gasReagent(name: string, category: ChemicalClass, gas: string | undefined, formula: string,
	molarMass: number, fallback: MoleculeDefinition, parts: ChemicalRecipe["parts"] = []): CatalogChemical {
	const graph = structureGraphs[name];
	const preview = graph ? { formula, ...graph } : fallback;
	const recipe: ChemicalRecipe = { phase: "gas", density: molarMass / (MOLAR_GAS_VOLUME * 1000), parts };
	if (gas) recipe.gas = gas;
	return { name, category, formula, preview, recipe };
}

/**
 * A portion from a gas bottle that holds a mixture rather than one gas. The
 * palette asks for a volume and every share lands in the target's gas space,
 * so a dose of air carries its nitrogen, oxygen and argon together. A
 * constituent the gas table does not know is dropped by the dose, which is why
 * the recipe only names gases with a Henry row.
 */
function gasMixture(name: string, category: ChemicalClass, formula: string, molarMass: number,
	gases: ChemicalRecipe["gases"]): CatalogChemical {
	return { name, category, formula,
		recipe: { phase: "gas", density: molarMass / (MOLAR_GAS_VOLUME * 1000), parts: [], gases } };
}

const propanone = covalent("C₃H₆O", ["carbon", "carbon", "carbon", "oxygen"], [[0, 1], [1, 2], [1, 3, 2]], [3, 0, 3, 0]);
const sulfuricAcid = covalent("H₂SO₄", ["sulfur", "oxygen", "oxygen", "oxygen", "oxygen"], [[0, 1, 2], [0, 2, 2], [0, 3], [0, 4]], [0, 0, 0, 1, 1]);
const phosphoricAcid = covalent("H₃PO₄", ["phosphorus", "oxygen", "oxygen", "oxygen", "oxygen"], [[0, 1, 2], [0, 2], [0, 3], [0, 4]], [0, 0, 1, 1, 1]);
const formicAcid = covalent("CH₂O₂", ["carbon", "oxygen", "oxygen"], [[0, 1, 2], [0, 2]], [1, 0, 1]);
const ammonia = molecule("NH₃", ["nitrogen"], [], [3]);
const peroxide = covalent("H₂O₂", ["oxygen", "oxygen"], [[0, 1]], [1, 1]);
const carbonDioxide = covalent("CO₂", ["carbon", "oxygen", "oxygen"], [[0, 1, 2], [0, 2, 2]], [0, 0, 0]);
// Dissolved carbon dioxide is the carbonic-acid family of the acid-base table,
// whose neutral form is what the gas evolution removes. A dose of the gas
// therefore books this molecule and not the linear CO₂ of the bottle.
const carbonicAcid = covalent("H₂CO₃", ["carbon", "oxygen", "oxygen", "oxygen"], [[0, 1, 2], [0, 2], [0, 3]], [0, 0, 1, 1]);
const ethene = covalent("C₂H₄", ["carbon", "carbon"], [[0, 1, 2]], [2, 2]);
const iodine = covalent("I₂", ["iodine", "iodine"], [[0, 1]], [0, 0]);
// The two reagent graphs a mixture row reuses: lemon juice doses the citric
// acid of its own catalog row, and sand the silicon dioxide of the oxide row.
// Both stay one graph, so a portion of the mixture and a portion of the pure
// substance reach the same acid family and the same solid.
const citricAcid = covalent("C₆H₈O₇",
	[...Array(6).fill("carbon"), ...Array(7).fill("oxygen")],
	[[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6], [0, 7, 2], [0, 8], [4, 9, 2], [4, 10], [5, 11, 2], [5, 12]],
	[0, 2, 0, 2, 0, 0, 1, 0, 1, 0, 1, 0, 1]);
const siliconDioxide = covalent("SiO₂", ["silicon", "oxygen", "oxygen"], [[0, 1, 2], [0, 2, 2]], [0, 0, 0]);
// The technical mixture of light alkanes is dosed as the n-hexane it is mainly
// made of, and the library already carries that graph.
const hexane = libraryMolecule("Hexan", "C₆H₁₄") ?? alkane("C₆H₁₄", 6);
// The indicator dyes and the citrate ion are library graphs like the ones
// above: the universal indicator is the three dyes of their own catalog rows at
// equal strength, and Benedict's reagent holds its copper with the citrate that
// the structure library already draws.
const phenolphthalein = libraryMolecule("Phenolphthalein", "C₂₀H₁₄O₄");
const bromothymolBlue = libraryMolecule("Bromthymolblau", "C₂₇H₂₈Br₂O₅S");
const methylOrange = libraryMolecule("Methylorange", "C₁₄H₁₄N₃NaO₃S");
const citrate = libraryMolecule("@citrate", "C₆H₅O₇³⁻");

function ion(formula: string, atom: string, charge: number): MoleculeDefinition {
	return { formula, atoms: [atom], bonds: [], charges: [charge] };
}

function oxoanion(formula: string, center: string, double: number, single: number): MoleculeDefinition {
	const size = double + single;
	return { formula, atoms: [center, ...Array<string>(size).fill("oxygen")],
		bonds: Array.from({ length: size }, (_, i) => `0-${i + 1}:covalent:${i < double ? 2 : 1}`),
		charges: [0, ...Array<number>(double).fill(0), ...Array<number>(single).fill(-1)] };
}

// Water of crystallisation sits next to the salt skeleton as unbonded neutral
// H₂O fragments. The fragment bookkeeping of the salt then hands one water to
// the solvent per crystal water, so a hydrate dissolves into the same bath as
// an equimolar dose of its anhydrous salt plus that water.
function addCrystalWater(atoms: string[], bonds: string[], count: number): void {
	for (let index = 0; index < count; index++) {
		const base = atoms.length;
		atoms.push("oxygen", "hydrogen", "hydrogen");
		bonds.push(`${base}-${base + 1}:covalent:1`, `${base}-${base + 2}:covalent:1`);
	}
}

// A stock of a salt. The second cation is optional because a double salt such
// as potassium sodium tartrate carries two different cations per anion; the
// parts mirror the ion list of the solubility table, so the stock dissociates
// into exactly the ions the table pairs with the solid.
function saltSolution(name: string, formula: string, salt: string, cation: MoleculeDefinition, anion: MoleculeDefinition,
	cations = 1, anions = 1, extraCation?: MoleculeDefinition, extraCations = 1): CatalogChemical {
	const parts = [
		{ molecule: water, amount: 55.5 }, { molecule: cation, amount: cations }, { molecule: anion, amount: anions },
	];
	if (extraCation) parts.push({ molecule: extraCation, amount: extraCations });
	return { name, formula, category: "Salze", concentrationLimit: saltSolubility[salt].saturation, recipe: { phase: "liquid", density: 1, aqueousMolar: true, parts } };
}

const sulfate = oxoanion("SO₄²⁻", "sulfur", 2, 2);
const nitrate = oxoanion("NO₃⁻", "nitrogen", 1, 2);
nitrate.charges = [1, 0, -1, -1];
const chloride = ion("Cl⁻", "chlorine", -1);
const bromide = ion("Br⁻", "bromine", -1);
const iodide = ion("I⁻", "iodine", -1);
const carbonate = oxoanion("CO₃²⁻", "carbon", 1, 2);
// The sulfide ion is written [S2-], the form the solubility table and the
// second step of the hydrogen-sulfide family carry; [S-2] is the hand-written
// orientation Kekule accepts for it, but `registerSolidSalt` matches the
// fragment literally, so only this spelling finds its reservoir.
const sulfide = ion("S²⁻", "sulfur", -2);
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
// The cations of the two waters and of the three copper and silver reagents.
// Each is the single-atom ion the solubility tables key their precipitates on,
// so a stock splits into exactly the species the hydroxide and complex solvers
// look for.
const calcium = ion("Ca²⁺", "calcium", 2);
const magnesium = ion("Mg²⁺", "magnesium", 2);
const copper = ion("Cu²⁺", "copper", 2);
const silver = ion("Ag⁺", "silver", 1);
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
// Thiocyanate carries its charge on sulfur and keeps the carbon-nitrogen
// triple bond, so it serialises as the N#C[S-] of the solubility table.
// Neither Kekule nor the chemistry tables know a thiocyanate complex, so the
// ion stays a spectator and the table entry only fixes its stock limit.
const thiocyanate = { formula: "SCN⁻", atoms: ["sulfur", "carbon", "nitrogen"],
	bonds: ["0-1:covalent:1", "1-2:covalent:3"], charges: [-1, 0, 0] };
// Permanganate is the tetrahedral oxoanion with three double-bonded oxygens,
// the [O-][Mn](=O)(=O)=O of the table. The model runs no MnO4- reduction, so
// the ion travels unchanged and only potassium and the anion are booked.
const permanganate = oxoanion("MnO₄⁻", "manganese", 3, 1);
// Thiosulfate keeps the sulfur-sulfur bond of the sulfate group: one sulfur
// sits in the middle with two double-bonded oxygens, the terminal sulfur and
// the remaining oxygen each carry one charge. It serialises as the
// [O-]S(=O)([S-])=O of the table and stays a spectator ion, because no
// acid-base, complex or half-reaction table names a thiosulfate species.
const thiosulfate: MoleculeDefinition = { formula: "S₂O₃²⁻", atoms: ["sulfur", "sulfur", "oxygen", "oxygen", "oxygen"],
	bonds: ["0-1:covalent:1", "0-2:covalent:2", "0-3:covalent:2", "0-4:covalent:1"], charges: [0, -1, 0, 0, -1] };
// Tartrate is the dianion of tartaric acid: the four-carbon chain carries one
// hydroxyl on each inner carbon and a carboxylate at both ends. Both charges
// sit on the single-bonded carboxyl oxygens, which leaves the
// [O-]C(=O)C(O)C(O)C(=O)[O-] of the table and of the tartaric-acid family.
const tartrate: MoleculeDefinition = { formula: "C₄H₄O₆²⁻",
	atoms: ["carbon", "carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen", "oxygen", "oxygen", "oxygen",
		"hydrogen", "hydrogen", "hydrogen", "hydrogen"],
	bonds: ["0-1:covalent:1", "1-2:covalent:1", "2-3:covalent:1", "0-4:covalent:2", "0-5:covalent:1",
		"1-6:covalent:1", "2-7:covalent:1", "3-8:covalent:2", "3-9:covalent:1",
		"1-10:covalent:1", "2-11:covalent:1", "6-12:covalent:1", "7-13:covalent:1"],
	charges: [0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, 0] };


// The sparingly soluble salts keep a solubility product instead of a
// saturation, so their formula units have to serialise as the ions of the Ksp
// entry. They are built like the soluble sulfates and carbonates: the skeleton
// stays neutral and one ionic bond per unprotonated oxygen hands over one
// electron, which leaves [Ba2+]/[Ca2+] next to [O-]S(=O)(=O)[O-] or
// [O-]C(=O)[O-]. Silver chloride is the plain 1:1 case of `salt()`.
const silverChloride: MoleculeDefinition = { formula: "AgCl",
	atoms: ["silver", "chlorine"], bonds: ["0-1:ionic:1"] };
const bariumSulfate: MoleculeDefinition = { formula: "BaSO₄",
	atoms: ["barium", ...sulfate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:2", "1-4:covalent:1", "1-5:covalent:1", "0-4:ionic:1", "0-5:ionic:1"] };
const calciumCarbonate: MoleculeDefinition = { formula: "CaCO₃",
	atoms: ["calcium", ...carbonate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:1", "1-4:covalent:1", "0-3:ionic:1", "0-4:ionic:1"] };
// Iron(II) sulfide is the 1:1 case of the same route, but it needs two
// electrons: sulfur is divalent and takes both, while a single ionic bond moves
// only one. The stored graph therefore starts one electron short of the two
// ions, and the one bond hands over the last one, which leaves the [Fe2+] and
// [S2-] of the solubility table. The sulfide then joins the hydrogen-sulfide
// family (pKa 7.0 and 12.9), so the bath turns basic as the anion takes
// protons instead of settling at pH 7 like the spectator anions.
const ironSulfide: MoleculeDefinition = { formula: "FeS",
	atoms: ["iron", "sulfur"], bonds: ["0-1:ionic:1"], charges: [1, -1] };

// Ammonium sulfate and the two potassium salts follow the same route: the
// skeleton stays neutral and one ionic bond per unprotonated oxygen or per
// anion hands over its electron, which leaves the [N+], [K+], N#C[S-] and
// [O-][Mn](=O)(=O)=O fragments the solubility table lists. The ammonium sits
// on both sulfates, so the salt carries 2 [N+] next to one sulfate, and each
// ammonium keeps its four explicit hydrogens like the NH₄Cl formula unit.
const ammoniumSulfate: MoleculeDefinition = { formula: "(NH₄)₂SO₄",
	atoms: ["nitrogen", "nitrogen", ...sulfate.atoms, ...Array<string>(8).fill("hydrogen")],
	bonds: ["2-3:covalent:2", "2-4:covalent:2", "2-5:covalent:1", "2-6:covalent:1",
		"0-5:ionic:1", "1-6:ionic:1",
		"0-7:covalent:1", "0-8:covalent:1", "0-9:covalent:1", "0-10:covalent:1",
		"1-11:covalent:1", "1-12:covalent:1", "1-13:covalent:1", "1-14:covalent:1"] };
const potassiumThiocyanate: MoleculeDefinition = { formula: "KSCN",
	atoms: ["potassium", "sulfur", "carbon", "nitrogen"],
	bonds: ["1-2:covalent:1", "2-3:covalent:3", "0-1:ionic:1"] };
const potassiumPermanganate: MoleculeDefinition = { formula: "KMnO₄",
	atoms: ["potassium", ...permanganate.atoms],
	bonds: ["1-2:covalent:2", "1-3:covalent:2", "1-4:covalent:2", "1-5:covalent:1", "0-5:ionic:1"] };

// A hydrated sulfate repeats the zinc sulfate bond pattern and carries its
// crystal waters. The density of the crystal feeds the dose mass, and the bulk
// volume of that dose travels with the solid, so dissolving it gives back the
// volume the crystals occupied: chalcanthite 2.286 g/mL for the pentahydrate,
// melanterite 1.895 for the iron heptahydrate, gypsum 2.32 for the calcium
// dihydrate and epsomite 1.68 for the magnesium heptahydrate.
// https://www.mindat.org/min-19816.html https://www.mindat.org/min-16198.html
// https://www.mindat.org/min-1784.html https://www.mindat.org/min-1393.html
function sulfateHydrate(formula: string, metal: string, waters: number): MoleculeDefinition {
	const atoms = [metal, ...sulfate.atoms];
	const bonds = ["1-2:covalent:2", "1-3:covalent:2", "1-4:covalent:1", "1-5:covalent:1",
		"0-4:ionic:1", "0-5:ionic:1"];
	addCrystalWater(atoms, bonds, waters);
	return { formula, atoms, bonds };
}
const copperSulfatePentahydrate = sulfateHydrate("CuSO₄·5 H₂O", "copper", 5);
const ironSulfateHeptahydrate = sulfateHydrate("FeSO₄·7 H₂O", "iron", 7);
const calciumSulfateDihydrate = sulfateHydrate("CaSO₄·2 H₂O", "calcium", 2);
const magnesiumSulfateHeptahydrate = sulfateHydrate("MgSO₄·7 H₂O", "magnesium", 7);

// The other two hydrated salts follow the same route: the anion skeleton stays
// neutral, one ionic bond per unprotonated oxygen hands over one electron, and
// the crystal water sits next to the formula unit as separate H₂O fragments.
// Sodium thiosulfate is the photographic fixing salt (pentahydrate 1.667 g/mL);
// the thiosulfate keeps both charges on the terminal sulfur and on the free
// oxygen, so the two sodiums leave it as the anion of the solubility table.
// https://en.wikipedia.org/wiki/Sodium_thiosulfate
const sodiumThiosulfatePentahydrate: MoleculeDefinition = { formula: "Na₂S₂O₃·5 H₂O",
	atoms: ["sodium", "sodium", ...thiosulfate.atoms],
	bonds: ["2-3:covalent:1", "2-4:covalent:2", "2-5:covalent:2", "2-6:covalent:1",
		"0-6:ionic:1", "1-3:ionic:1"] };
addCrystalWater(sodiumThiosulfatePentahydrate.atoms, sodiumThiosulfatePentahydrate.bonds, 5);
// Potassium sodium tartrate is the Rochelle salt of Fehling's solution and of
// the Seignette crystals (tetrahydrate 1.79 g/mL). It is a double salt: the
// potassium sits on one carboxylate and the sodium on the other, so the two
// different cations of the solubility table appear next to the tartrate.
// https://www.scbt.com/p/potassium-sodium-tartrate-6381-59-5
const potassiumSodiumTartrateTetrahydrate: MoleculeDefinition = { formula: "KNaC₄H₄O₆·4 H₂O",
	atoms: ["potassium", "sodium", ...tartrate.atoms],
	bonds: ["2-3:covalent:1", "3-4:covalent:1", "4-5:covalent:1", "2-6:covalent:2", "2-7:covalent:1",
		"3-8:covalent:1", "4-9:covalent:1", "5-10:covalent:2", "5-11:covalent:1",
		"3-12:covalent:1", "4-13:covalent:1", "8-14:covalent:1", "9-15:covalent:1",
		"0-7:ionic:1", "1-11:ionic:1"] };
addCrystalWater(potassiumSodiumTartrateTetrahydrate.atoms, potassiumSodiumTartrateTetrahydrate.bonds, 4);

const sodiumChloride = salt("Natriumchlorid", "NaCl", "sodium", "chlorine");
const aceticAcid = molecule("C₂H₄O₂", ["carbon", "carbon", "oxygen", "oxygen"],
	["0-1:covalent:1", "1-2:covalent:2", "1-3:covalent:1"], [3, 0, 0, 1]);
// Library graphs a reagent needs as one dissolved part rather than as a whole
// catalog entry: the aldehyde of a gas dose and the bromine of bromine water.
const methanal = libraryMolecule("Methanal (Formaldehyd)", "CH₂O");
const methanalDose: ChemicalRecipe["parts"] = methanal ? [{ molecule: methanal, amount: 1 }] : [];
const bromine = libraryMolecule("Bromwasser", "Br₂ (aq)");

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
	// Alkali metals decompose water, so their density feeds the bulk volume of
	// a portion and the drop that reacts, not a solubility.
	element("Natrium", "Na", "sodium", 0.968),
	element("Kalium", "K", "potassium", 0.862),
	element("Kohlenstoff", "C", "carbon", 2.26, "Nichtmetalle und Gase"),
	element("Schwefel", "S", "sulfur", 2.07, "Nichtmetalle und Gase"),
	pure("Iod", "Nichtmetalle und Gase", iodine, "solid", 4.93),
	gasReagent("Wasserstoff", "Nichtmetalle und Gase", "H2", "H₂", 2.016,
		covalent("H₂", ["hydrogen", "hydrogen"], [[0, 1]], [0, 0])),
	gasReagent("Sauerstoff", "Nichtmetalle und Gase", "O2", "O₂", 31.998,
		covalent("O₂", ["oxygen", "oxygen"], [[0, 1, 2]], [0, 0])),
	gasReagent("Stickstoff", "Nichtmetalle und Gase", "N2", "N₂", 28.014,
		covalent("N₂", ["nitrogen", "nitrogen"], [[0, 1, 3]], [0, 0])),
	gasReagent("Kohlenstoffdioxid", "Nichtmetalle und Gase", "CO2", carbonDioxide.formula, 44.009,
		carbonDioxide, [{ molecule: carbonicAcid, amount: 1 }]),
	gasReagent("Chlor", "Nichtmetalle und Gase", "Cl2", "Cl₂", 70.906,
		covalent("Cl₂", ["chlorine", "chlorine"], [[0, 1]], [0, 0])),
	// Hydrogen chloride enters the water as the acid itself, so the dose books
	// the stored acid and the gas evolution only takes back what exceeds the
	// 12.1 mol/L saturation of the concentrated acid. The Henry row is what
	// makes a bubbled portion dissolve as H⁺ and Cl⁻ from the first step.
	gasReagent("Chlorwasserstoff", "Nichtmetalle und Gase", "HCl", "HCl", 36.46, hcl,
		[{ molecule: hcl, amount: 1 }]),
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
	// Sparingly soluble salts: the solid keeps a reservoir, and the stock below
	// is its saturated solution. Ksp decides how much dissolves, the rounded
	// `saturation` only caps the stock's concentration selector.
	pure("Silberchlorid", "Salze", silverChloride, "solid", saltSolubility.AgCl.solidDensity),
	pure("Bariumsulfat", "Salze", bariumSulfate, "solid", saltSolubility.BaSO4.solidDensity),
	pure("Calciumcarbonat", "Salze", calciumCarbonate, "solid", saltSolubility.CaCO3.solidDensity),
	// The black sulfide is the fourth of them. Its anion is not a spectator but
	// the base of the hydrogen-sulfide family, so the little that dissolves
	// turns the water basic and the reservoir settles at the root of the product
	// with that protonation.
	pure("Eisen(II)-sulfid", "Salze", ironSulfide, "solid", saltSolubility.FeS.solidDensity),
	// Freely soluble salts with an anion the equilibrium model does not run:
	// the dry salt settles at its saturation and the stock is the same bath.
	pure("Ammoniumsulfat", "Salze", ammoniumSulfate, "solid", saltSolubility["(NH4)2SO4"].solidDensity),
	pure("Kaliumthiocyanat", "Salze", potassiumThiocyanate, "solid", saltSolubility.KSCN.solidDensity),
	pure("Kaliumpermanganat", "Salze", potassiumPermanganate, "solid", saltSolubility.KMnO4.solidDensity),
	aqueous("Natriumchloridlösung (1 mol/L)", "Salze", sodiumChloride.preview, saltSolubility.NaCl.saturation),
	saltSolution("Kaliumchloridlösung", "KCl", "KCl", potassium, chloride),
	saltSolution("Kaliumbromidlösung", "KBr", "KBr", potassium, bromide),
	saltSolution("Kaliumiodidlösung", "KI", "KI", potassium, iodide),
	saltSolution("Natriumbromidlösung", "NaBr", "NaBr", sodium, bromide),
	saltSolution("Natriumiodidlösung", "NaI", "NaI", sodium, iodide),
	saltSolution("Kupfer(II)-sulfatlösung", "CuSO₄", "CuSO4", ion("Cu²⁺", "copper", 2), sulfate),
	saltSolution("Zinksulfatlösung", "ZnSO₄", "ZnSO4", ion("Zn²⁺", "zinc", 2), sulfate),
	saltSolution("Eisen(II)-sulfatlösung", "FeSO₄", "FeSO4", ion("Fe²⁺", "iron", 2), sulfate),
	saltSolution("Magnesiumsulfatlösung", "MgSO₄", "MgSO4", ion("Mg²⁺", "magnesium", 2), sulfate),
	saltSolution("Silbernitratlösung", "AgNO₃", "AgNO3", ion("Ag⁺", "silver", 1), nitrate),
	saltSolution("Bariumchloridlösung", "BaCl₂", "BaCl2", ion("Ba²⁺", "barium", 2), chloride, 1, 2),
	saltSolution("Calciumchloridlösung", "CaCl₂", "CaCl2", ion("Ca²⁺", "calcium", 2), chloride, 1, 2),
	saltSolution("Eisen(III)-chloridlösung", "FeCl₃", "FeCl3", ion("Fe³⁺", "iron", 3), chloride, 1, 3),
	saltSolution("Natriumcarbonatlösung", "Na₂CO₃", "Na2CO3", sodium, carbonate, 2),
	saltSolution("Natriumsulfatlösung", "Na₂SO₄", "Na2SO4", sodium, sulfate, 2),
	saltSolution("Kaliumnitratlösung", "KNO₃", "KNO3", potassium, nitrate),
	saltSolution("Ammoniumchloridlösung", "NH₄Cl", "NH4Cl", ammonium, chloride),
	saltSolution("Natriumacetatlösung", "CH₃COONa", "CH3COONa", sodium, acetate),
	saltSolution("Silberchloridlösung (gesättigt)", "AgCl", "AgCl", ion("Ag⁺", "silver", 1), chloride),
	saltSolution("Bariumsulfatlösung (gesättigt)", "BaSO₄", "BaSO4", ion("Ba²⁺", "barium", 2), sulfate),
	saltSolution("Calciumcarbonatlösung (gesättigt)", "CaCO₃", "CaCO3", ion("Ca²⁺", "calcium", 2), carbonate),
	// Saturated iron(II) sulfide water: 3.6·10⁻⁷ mol/L is all the product
	// allows at the pH the sulfide itself sets, so the stock reads as a
	// saturated solution and not as a rack reagent.
	saltSolution("Eisen(II)-sulfidlösung (gesättigt)", "FeS", "FeS", ion("Fe²⁺", "iron", 2), sulfide),
	// Gypsum is sparingly soluble, so its stock is a saturated solution; the
	// Ksp decides how much of a dry dose dissolves, the limit only caps the
	// concentration selector.
	saltSolution("Calciumsulfatlösung (gesättigt)", "CaSO₄", "CaSO4", ion("Ca²⁺", "calcium", 2), sulfate),
	saltSolution("Ammoniumsulfatlösung", "(NH₄)₂SO₄", "(NH4)2SO4", ammonium, sulfate, 2, 1),
	saltSolution("Kaliumthiocyanatlösung", "KSCN", "KSCN", potassium, thiocyanate),
	saltSolution("Kaliumpermanganatlösung", "KMnO₄", "KMnO4", potassium, permanganate),
	// The sulfate hydrates name their crystals: the dose follows the water of
	// crystallisation and the density of the mineral, and dissolving the solid
	// returns that water to the solvent. Each one joins the stock of its
	// anhydrous salt above, so gypsum pairs with a saturated calcium sulfate
	// solution and epsomite with the magnesium sulfate stock.
	pure("Kupfer(II)-sulfat-Pentahydrat", "Salze", copperSulfatePentahydrate, "solid", 2.286),
	pure("Eisen(II)-sulfat-Heptahydrat", "Salze", ironSulfateHeptahydrate, "solid", 1.895),
	pure("Calciumsulfat-Dihydrat", "Salze", calciumSulfateDihydrate, "solid", 2.32),
	pure("Magnesiumsulfat-Heptahydrat", "Salze", magnesiumSulfateHeptahydrate, "solid", 1.68),
	// The archived crystal selects the dry salt; the stock is a separate reagent.
	pure("Natriumhydrogencarbonat", "Salze", sodiumBicarbonate, "solid", saltSolubility.NaHCO3.solidDensity),
	saltSolution("Natriumhydrogencarbonatlösung", "NaHCO₃", "NaHCO3", sodium, bicarbonate),
	saltSolution("Natriumthiosulfatlösung", "Na₂S₂O₃", "Na2S2O3", sodium, thiosulfate, 2, 1),
	saltSolution("Kaliumnatriumtartratlösung", "KNaC₄H₄O₆", "KNaC4H4O6", potassium, tartrate, 1, 1, sodium),
	// The fixing salt and the Rochelle salt carry their own anion now, and the
	// tartrate joins the tartaric-acid family, so both dose like the sulfates
	// above and pair with the stocks below.
	pure("Natriumthiosulfat-Pentahydrat", "Salze", sodiumThiosulfatePentahydrate, "solid", 1.667),
	pure("Kaliumnatriumtartrat", "Salze", potassiumSodiumTartrateTetrahydrate, "solid", 1.79),
	pure("Natriumhydroxid", "Basen", naoh, "solid", 2.13),
	aqueous("Natronlauge (1 mol/L)", "Basen", naoh, concentratedReagent.sodiumHydroxide),
	aqueous("Kalilauge (1 mol/L)", "Basen", { formula: "KOH", atoms: ["potassium", "oxygen", "hydrogen"],
		bonds: ["0-1:acidbase:1", "1-2:covalent:1"] }, concentratedReagent.potassiumHydroxide),
	aqueous("Ammoniaklösung", "Basen", ammonia, concentratedReagent.ammonia),
	// Slaked lime is a sparingly soluble salt, so the weighed portion keeps a
	// sediment and the saturated stock is the clear solution above it. The stock
	// carries the ideal solubility, not the 0.023 mol/L of real lime water,
	// because the model has no CaOH⁺ ion pair and therefore no second route into
	// solution. No concentration limit on the solid: a limited entry would be
	// wrapped into a stock and could no longer be dosed as a solid.
	pure("Calciumhydroxid", "Basen", calciumHydroxide, "solid", saltSolubility["Ca(OH)2"].solidDensity),
	aqueous("Kalkwasser", "Basen", calciumHydroxide, saltSolubility["Ca(OH)2"].saturation),
	aqueous("Salzsäure (1 mol/L)", "Anorganische Säuren", hcl, concentratedReagent.hydrochloricAcid),
	aqueous("Schwefelsäure (1 mol/L)", "Anorganische Säuren", sulfuricAcid, concentratedReagent.sulfuricAcid),
	aqueous("Phosphorsäure (1 mol/L)", "Anorganische Säuren", phosphoricAcid, concentratedReagent.phosphoricAcid),
	// Nitric acid is a strong acid and an oxidising agent; only the first role is
	// modelled, so it doses like hydrochloric acid. pKa from the usual tables of
	// strong mineral acids (HNO₃ −1.3).
	acidSolution("Salpetersäure", "Anorganische Säuren", "HNO₃", { pKa: [-1.3], step: 0 }, concentratedReagent.nitricAcid),
	pure("Wasser", "Lösungsmittel", water, "liquid", 1),
	organic("Cyclohexan", "Kohlenwasserstoffe", covalent("C₆H₁₂", Array(6).fill("carbon"),
		[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], [2, 2, 2, 2, 2, 2]), 0.779),
	organic("Heptan", "Kohlenwasserstoffe", alkane("C₇H₁₆", 7), 0.684),
	organic("Hexan", "Kohlenwasserstoffe", alkane("C₆H₁₄", 6), 0.659),
	organic("Cyclohexen", "Kohlenwasserstoffe", covalent("C₆H₁₀", Array(6).fill("carbon"),
		[[0, 1, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], [1, 1, 2, 2, 2, 2]), 0.811),
	gasReagent("Methan", "Kohlenwasserstoffe", "CH4", "CH₄", 16.043, molecule("CH₄", ["carbon"], [], [4])),
	gasReagent("Ethen", "Kohlenwasserstoffe", "C2H4", ethene.formula, 28.054, ethene),
	gasReagent("Propan", "Kohlenwasserstoffe", "C3H8", "C₃H₈", 44.097, alkane("C₃H₈", 3)),
	gasReagent("Butan", "Kohlenwasserstoffe", "C4H10", "C₄H₁₀", 58.124, alkane("C₄H₁₀", 4)),
	gasReagent("Ethin", "Kohlenwasserstoffe", "C2H2", "C₂H₂", 26.038,
		covalent("C₂H₂", ["carbon", "carbon"], [[0, 1, 3]], [1, 1])),
	molecular("Dichlormethan", "Halogenkohlenwasserstoffe", "CH₂Cl₂", 1.327, "liquid"),
	molecular("Bromethan", "Halogenkohlenwasserstoffe", "C₂H₅Br", 1.46, "liquid"),
	gasReagent("Chlorethen (Vinylchlorid)", "Halogenkohlenwasserstoffe", "C2H3Cl", "C₂H₃Cl", 62.498,
		covalent("C₂H₃Cl", ["carbon", "carbon", "chlorine"], [[0, 1, 2], [0, 2]], [2, 1, 0])),
	// Liquid paraffin is the technical C₁₀–C₁₆ cut, so the library carries no
	// single graph for it. The dose uses the middle of the cut as its
	// representative — dodecane — and the density of the oil itself, which keeps
	// a portion as thick as it was poured. A hydrocarbon is a spectator.
	pure("Paraffinöl", "Lösungsmittel", alkane("C₁₂H₂₆", 12), "liquid", 0.84),
	// Petroleum ether is the technical mixture of light alkanes; the model doses
	// the n-hexane it is mainly made of, so a portion floats as its own band like
	// every other hydrocarbon. Its density is the middle of the 0.64–0.66 range
	// the fraction covers.
	pure("Petrolether", "Lösungsmittel", hexane, "liquid", 0.66),
	organic("Ethanol", "Alkohole", alkanol("C₂H₆O", 2, 1), 0.789),
	organic("Methanol", "Alkohole", covalent("CH₄O", ["carbon", "oxygen"], [[0, 1]], [3, 1]), 0.792),
	organic("Propan-1-ol", "Alkohole", alkanol("C₃H₈O", 3, 0), 0.803),
	organic("Propan-2-ol", "Alkohole", alkanol("C₃H₈O", 3, 1), 0.785),
	organic("Butan-1-ol", "Alkohole", alkanol("C₄H₁₀O", 4, 0), 0.810),
	organic("Butan-2-ol", "Alkohole", alkanol("C₄H₁₀O", 4, 1), 0.806),
	organic("Pentan-1-ol", "Alkohole", alkanol("C₅H₁₂O", 5, 0), 0.814),
	molecular("3-Methylbutan-1-ol (Isoamylalkohol)", "Alkohole", "C₅H₁₂O", 0.810, "liquid"),
	molecular("Tetradecan-1-ol (Myristylalkohol)", "Alkohole", "C₁₄H₃₀O", 0.824, "solid"),
	organic("Ethan-1,2-diol", "Alkohole", covalent("C₂H₆O₂", ["carbon", "carbon", "oxygen", "oxygen"],
		[[0, 1], [0, 2], [1, 3]], [2, 2, 1, 1]), 1.11),
	organic("Glycerin", "Alkohole", covalent("C₃H₈O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [0, 3], [1, 4], [2, 5]], [2, 1, 2, 1, 1, 1]), 1.26),
	organic("Ethanal", "Aldehyde", covalent("C₂H₄O", ["carbon", "carbon", "oxygen"], [[0, 1], [1, 2, 2]], [3, 1, 0]), 0.784),
	organic("Propanal", "Aldehyde", covalent("C₃H₆O", ["carbon", "carbon", "carbon", "oxygen"],
		[[0, 1], [1, 2], [2, 3, 2]], [3, 2, 1, 0]), 0.798),
	// Methanal is a gas at room temperature, so it dosed by the volume it takes
	// up like every other gas, and the vessel books the dissolved aldehyde. The
	// model runs neither its hydrate nor an oxidation, so the portion stays a
	// spectator that dissolves completely.
	gasReagent("Methanal (Formaldehyd)", "Aldehyde", undefined, "CH₂O", 30.026,
		covalent("CH₂O", ["carbon", "oxygen"], [[0, 1, 2]], [2, 0]), methanalDose),
	molecular("Benzaldehyd", "Aldehyde", "C₇H₆O", 1.045, "liquid"),
	organic("Aceton", "Ketone", propanone, 0.791),
	organic("Butan-2-on", "Ketone", covalent("C₄H₈O", ["carbon", "carbon", "carbon", "carbon", "oxygen"],
		[[0, 1], [1, 2], [2, 3], [1, 4, 2]], [3, 0, 2, 3, 0]), 0.805),
	organic("Essigsäure", "Carbonsäuren", aceticAcid, 1.05, "liquid", concentratedReagent.aceticAcid),
	organic("Ameisensäure", "Carbonsäuren", formicAcid, 1.22, "liquid", concentratedReagent.formicAcid),
	organic("Propionsäure", "Carbonsäuren", covalent("C₃H₆O₂", ["carbon", "carbon", "carbon", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [2, 3, 2], [2, 4]], [3, 2, 0, 0, 1]), 0.993, "liquid", concentratedReagent.propionicAcid),
	organic("Milchsäure", "Carbonsäuren", covalent("C₃H₆O₃", ["carbon", "carbon", "carbon", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [1, 2], [1, 3], [2, 4, 2], [2, 5]], [3, 1, 0, 1, 0, 1]), 1.21, "liquid", concentratedReagent.lacticAcid),
	organic("Zitronensäure", "Carbonsäuren", citricAcid, 1.665, "solid", concentratedReagent.citricAcid),
	organic("Oxalsäure", "Carbonsäuren", covalent("C₂H₂O₄", ["carbon", "carbon", "oxygen", "oxygen", "oxygen", "oxygen"],
		[[0, 1], [0, 2, 2], [0, 3], [1, 4, 2], [1, 5]], [0, 0, 0, 1, 0, 1]), 1.90, "solid", concentratedReagent.oxalicAcid),
	// Three acids the library draws but the hand-written acid-base table never
	// spelled. Benzoic acid 4.19 is the standard value the table already carries
	// under its own SMILES; sorbic acid 4.76 is the tabulated sorbate constant.
	// The apparent constant of the long-chain fatty acids spreads over
	// 4.5–5.3 depending on the method, so myristic acid takes 4.9 and stays a
	// weak acid whose portion barely dissolves in the real world anyway.
	acidReagent("Benzoesäure", "Carbonsäuren", "C₇H₆O₂", 1.32, { pKa: [4.19], step: 0 }),
	acidReagent("Sorbinsäure", "Carbonsäuren", "C₆H₈O₂", 1.20, { pKa: [4.76], step: 0 }),
	acidReagent("Tetradecansäure (Myristinsäure)", "Carbonsäuren", "C₁₄H₂₈O₂", 0.86, { pKa: [4.9], step: 0 }),
	organic("Ethylacetat", "Ester", covalent("C₄H₈O₂", ["carbon", "carbon", "oxygen", "oxygen", "carbon", "carbon"],
		[[0, 1], [1, 2, 2], [1, 3], [3, 4], [4, 5]], [3, 0, 0, 0, 2, 3]), 0.902),
	molecular("Isoamylacetat", "Ester", "C₇H₁₄O₂", 0.876, "liquid"),
	molecular("Myristylmyristat", "Ester", "C₂₈H₅₆O₂", 0.85, "solid"),
	// The six oxides of the classic salt analysis. What one is never depends on a
	// bond order or a formal charge: `chemlib/oxides.ts` counts the atoms of a
	// dosed graph, so the drawing below only has to carry the formula unit, and a
	// Cu=O and a drawn Cu²⁺–O²⁻ are the same weighed portion. Densities are the
	// handbook values of the real solids.
	pure("Kupfer(II)-oxid", "Oxide", covalent("CuO", ["copper", "oxygen"], [[0, 1, 2]], [0, 0]),
		"solid", 6.31),
	pure("Magnesiumoxid", "Oxide", covalent("MgO", ["magnesium", "oxygen"], [[0, 1, 2]], [0, 0]),
		"solid", 3.58),
	pure("Calciumoxid", "Oxide", covalent("CaO", ["calcium", "oxygen"], [[0, 1, 2]], [0, 0]),
		"solid", 3.34),
	pure("Eisen(III)-oxid", "Oxide", covalent("Fe₂O₃",
		["iron", "iron", "oxygen", "oxygen", "oxygen"],
		[[0, 2], [0, 3], [1, 3], [1, 4]], [0, 0, 0, 0, 0]), "solid", 5.24),
	pure("Mangan(IV)-oxid", "Oxide", covalent("MnO₂", ["manganese", "oxygen", "oxygen"],
		[[0, 1, 2], [0, 2, 2]], [0, 0, 0]), "solid", 5.03),
	pure("Siliciumdioxid", "Oxide", siliconDioxide, "solid", 2.65),
	aqueous("Wasserstoffperoxidlösung", "Indikatoren und Nachweisreagenzien", peroxide),
	// Bromine water is the saturated solution of the library's Br₂, 0.21 mol/L
	// at 25 °C (`evolvedGases.Br2`). The dissolved bromine is a spectator: the
	// model neither brominates nor oxidises with it.
	graphSolution("Bromwasser", "Indikatoren und Nachweisreagenzien", "Br₂ (aq)", bromine, 0.21),
	// Lugol's solution is iodine dissolved in potassium iodide. The model has no
	// triiodide and keeps iodine as a sparingly soluble solid, so the stock stops
	// just below the tabulated iodine saturation: a real Lugol's solution is a
	// tenth of a molar only because the triiodide holds it. Above the saturation
	// the excess would settle as solid iodine.
	mixedStock("Lugolsche Lösung", "Indikatoren und Nachweisreagenzien", "I₂ / KI (aq)",
		[{ molecule: iodine, amount: 1 }, { molecule: potassium, amount: 3 }, { molecule: iodide, amount: 3 }],
		1.2e-3),
	// Fehling I is the copper sulfate solution, Fehling II the alkaline Rochelle
	// salt that keeps the copper dissolved. Both dose their ions; the model has
	// no copper tartrate complex, so mixing the two precipitates copper(II)
	// hydroxide — the documented gap of this pair.
	mixedStock("Fehling I", "Indikatoren und Nachweisreagenzien", "CuSO₄ (aq)",
		[{ molecule: copper, amount: 1 }, { molecule: sulfate, amount: 1 }], 0.28),
	mixedStock("Fehling II", "Indikatoren und Nachweisreagenzien", "KNaC₄H₄O₆ / NaOH (aq)",
		[{ molecule: tartrate, amount: 1 }, { molecule: potassium, amount: 1 },
			{ molecule: sodium, amount: 1 }, { molecule: naoh, amount: 2 }], 0.5),
	// Benedict's reagent holds its copper with citrate and carbonate instead of
	// tartrate. It carries the same gap: the table knows no copper citrate
	// complex, so the copper precipitates as its hydroxide.
	mixedStock("Benedict-Reagenz", "Indikatoren und Nachweisreagenzien", "CuSO₄ / Na₃C₆H₅O₇ / Na₂CO₃ (aq)",
		[{ molecule: copper, amount: 1 }, { molecule: sulfate, amount: 1 }, { molecule: citrate, amount: 1 },
			{ molecule: carbonate, amount: 1 }, { molecule: sodium, amount: 5 }], 0.05),
	reference("Schiff-Reagenz", "Indikatoren und Nachweisreagenzien", ""),
	// Tollens' reagent is the diamminesilver complex that the complex table
	// already carries, so the bottle doses silver nitrate plus the ammonia and
	// lye that build it, and the free silver stays far below the oxide product.
	mixedStock("Tollens-Reagenz", "Indikatoren und Nachweisreagenzien", "[Ag(NH₃)₂]OH (aq)",
		[{ molecule: silver, amount: 1 }, { molecule: nitrate, amount: 1 },
			{ molecule: ammonia, amount: 3 }, { molecule: naoh, amount: 2 }], 0.05),
	// The three indicators are weighed dyes with the library graph on the card.
	// The model has no colour change, so a portion stays a spectator; methyl
	// orange is the sodium salt of its sulfonic acid, but the library draws the
	// ion pair as one net-neutral graph without an ionic bond, which keeps it
	// out of the salt solver as well.
	molecular("Phenolphthalein", "Indikatoren und Nachweisreagenzien", "C₂₀H₁₄O₄", 1.277),
	molecular("Bromthymolblau", "Indikatoren und Nachweisreagenzien", "C₂₇H₂₈Br₂O₅S", 1.25),
	molecular("Methylorange", "Indikatoren und Nachweisreagenzien", "C₁₄H₁₄N₃NaO₃S", 1.28),
	reference("Lackmus", "Indikatoren und Nachweisreagenzien", ""),
	// The universal indicator is a mixture of the three dyes above at equal
	// strength. None of them is ionised in the model, so a portion stays neutral
	// and only adds its share of organic matter.
	mixedStock("Universalindikator", "Indikatoren und Nachweisreagenzien", "",
		[{ molecule: methylOrange, amount: 1 / 3 }, { molecule: bromothymolBlue, amount: 1 / 3 },
			{ molecule: phenolphthalein, amount: 1 / 3 }], 1.5e-3),
	reference("Rotkohlsaft", "Indikatoren und Nachweisreagenzien", ""),
	molecular("Indigo", "Indikatoren und Nachweisreagenzien", "C₁₆H₁₀N₂O₂", 1.199),
	organic("Glucose", "Kohlenhydrate und Aminosäuren", covalent("C₆H₁₂O₆",
		[...Array(6).fill("carbon"), ...Array(6).fill("oxygen")],
		[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6, 2], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
		[1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1]), 1.54, "solid"),
	// Glycin is the one ampholyte of the set: it sits on two protonation steps
	// and carries its constants with the library graph, so a portion reads the
	// isoelectric pH near 6 like any other diprotic acid. The sugars and the two
	// polysaccharides have no modelled reaction — no hydrolysis, no fermentation
	// and no glycoside — so they dissolve as spectators.
	acidReagent("Glycin", "Kohlenhydrate und Aminosäuren", "C₂H₅NO₂", 1.607, { pKa: [2.34, 9.58], step: 1 }),
	molecular("Fructose", "Kohlenhydrate und Aminosäuren", "C₆H₁₂O₆", 1.59),
	molecular("Saccharose", "Kohlenhydrate und Aminosäuren", "C₁₂H₂₂O₁₁", 1.587),
	molecular("Stärke", "Kohlenhydrate und Aminosäuren", "(C₆H₁₀O₅)ₙ", 1.5),
	molecular("Cellulose", "Kohlenhydrate und Aminosäuren", "(C₆H₁₀O₅)ₙ", 1.5),
	reference("Olivenöl", "Fette und Tenside", ""),
	// Both fatty acids keep an acid family: the apparent constants of the long
	// chain spread over 4.5–5.3, so stearic acid takes 4.9 like myristic acid
	// and oleic acid 5.02. Stearic acid is the weighed solid, oleic acid the
	// liquid; the model dissolves the whole portion, which oleic acid only does
	// as a trace, so its pH is a lower bound. The two soaps are net-neutral
	// library graphs whose charges sit inside the molecule, so the salt solver
	// does not split them and no surfactant behaviour is modelled.
	acidReagent("Stearinsäure", "Fette und Tenside", "C₁₈H₃₆O₂", 0.94, { pKa: [4.9], step: 0 }),
	acidReagent("Ölsäure", "Fette und Tenside", "C₁₈H₃₄O₂", 0.895, { pKa: [5.02], step: 0 }, "liquid"),
	molecular("Natriumstearat", "Fette und Tenside", "C₁₈H₃₅NaO₂", 1.03),
	molecular("Natriumdodecylsulfat", "Fette und Tenside", "C₁₂H₂₅NaO₄S", 1.01),
	// A plastic is a bulk material: the library graph is its repeat unit, the
	// density is the bulk density of the polymer, and the weighed portion stays
	// a spectator solid. Neither polymerisation nor depolymerisation is modelled.
	molecular("Polyethylen (PE)", "Kunststoffe und Monomere", "(C₂H₄)ₙ", 0.94),
	molecular("Polypropylen (PP)", "Kunststoffe und Monomere", "(C₃H₆)ₙ", 0.90),
	molecular("Polystyrol (PS)", "Kunststoffe und Monomere", "(C₈H₈)ₙ", 1.05),
	molecular("Polyvinylchlorid (PVC)", "Kunststoffe und Monomere", "(C₂H₃Cl)ₙ", 1.40),
	molecular("Polyethylenterephthalat (PET)", "Kunststoffe und Monomere", "(C₁₀H₈O₄)ₙ", 1.38),
	molecular("Polymilchsäure (PLA)", "Kunststoffe und Monomere", "(C₃H₄O₂)ₙ", 1.24),
	molecular("Polyamid 6", "Kunststoffe und Monomere", "(C₆H₁₁NO)ₙ", 1.13),
	// Styrene is the one monomer that separates: the phase split only asks for
	// carbon and hydrogen, so it floats as its own band, while methyl
	// methacrylate counts as polar and mixes with the water.
	molecular("Styrol", "Kunststoffe und Monomere", "C₈H₈", 0.909, "liquid"),
	molecular("Methylmethacrylat", "Kunststoffe und Monomere", "C₅H₈O₂", 0.94, "liquid"),
	// The household mixtures of the catalog. Each one doses the substances it is
	// made of, so vinegar acidifies like its acid and lemon juice like its citric
	// acid, while sand stays the weighed body it is.
	pure("Sand", "Stoffgemische", siliconDioxide, "solid", 2.65),
	// Tap water and mineral water carry the permanent hardness of their sulfates
	// and chlorides and the temporary hardness of their hydrogen carbonates. The
	// calcium level stays below the calcite product of the model, which has no
	// kinetics: real hard water is supersaturated with respect to calcite and
	// stays clear, while this bath would drop it. The mineral water carries the
	// dissolved carbon dioxide of a bottle, which keeps its pH near neutral.
	mixedStock("Leitungswasser", "Stoffgemische", "Ca²⁺ / Mg²⁺ / HCO₃⁻ (aq)",
		[{ molecule: calcium, amount: 2.5e-4 }, { molecule: magnesium, amount: 1.5e-4 },
			{ molecule: bicarbonate, amount: 7e-4 }, { molecule: sulfate, amount: 3e-5 },
			{ molecule: chloride, amount: 4e-5 }], 1),
	mixedStock("Mineralwasser", "Stoffgemische", "Ca²⁺ / Mg²⁺ / HCO₃⁻ / CO₂ (aq)",
		[{ molecule: calcium, amount: 6e-4 }, { molecule: magnesium, amount: 3e-4 },
			{ molecule: bicarbonate, amount: 1.6e-3 }, { molecule: sulfate, amount: 5e-5 },
			{ molecule: chloride, amount: 1e-4 }, { molecule: carbonicAcid, amount: 6e-4 }], 1),
	mixedStock("Haushaltsessig", "Stoffgemische", "CH₃COOH (aq)",
		[{ molecule: aceticAcid, amount: 1 }], 0.83),
	mixedStock("Zitronensaft", "Stoffgemische", "C₆H₈O₇ (aq)",
		[{ molecule: citricAcid, amount: 1 }], 0.3),
	// Air is dosed by its volume and lands in the gas space of the target, so a
	// share of it dissolves and the rest stays above the liquid. Dry air is
	// 78.08 % nitrogen, 20.95 % oxygen and 0.93 % argon; the 0.04 % of carbon
	// dioxide is left out, because it would enter the bath as the carbonic-acid
	// family and change the pH of every vessel it is bubbled through.
	// Dry air by volume: nitrogen 78.08 %, oxygen 20.95 %, argon 0.93 % and
	// carbon dioxide 0.04 %. The four shares add up to one portion, so a dose of
	// one litre really fills one litre of gas space.
	gasMixture("Luft", "Stoffgemische", "N₂ / O₂ / Ar / CO₂", 28.97,
		[{ gas: "N2", share: 0.7808 }, { gas: "O2", share: 0.2095 },
			{ gas: "Ar", share: 0.0093 }, { gas: "CO2", share: 0.0004 }]),
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
