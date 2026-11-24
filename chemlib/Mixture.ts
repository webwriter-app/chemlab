import { Molecule } from "./Molecule";
import { StructureManager } from "./StructureManager";
import { ethanolWaterExcessVolume } from "./ethanolWaterVolume";
import { saltSolubility } from "./saltSolubility";
import { splitLiquidPhases, type LiquidPhase } from "./liquidPhases";
import { evolvedGases } from "./gasEvolution";

/**
 * Colour of a solid that has no tabulated one, taken from the CPK colour of
 * its first atom so an undissolved metal matches how the app draws it
 * elsewhere.
 */
function elementColor(molecule: Molecule): number {
	const hex = molecule._atoms[0]?.getCPKHEX();
	const value = hex ? parseInt(hex, 16) : NaN;
	return Number.isFinite(value) ? value : 0xf3eee1;
}

function isEthanol(molecule: Molecule): boolean {
	if (molecule._totalCharge !== 0 || molecule._atoms.length !== 9 || molecule._bonds.length !== 8) return false;
	const atoms = molecule._atoms.map((atom) => atom.getSymbol());
	return atoms.filter((symbol) => symbol === "H").length === 6 &&
		atoms.filter((symbol) => symbol === "C").length === 2 &&
		atoms.includes("O") &&
		molecule._bonds.every((bond) => bond._type === "covalent" && bond._magnitude === 1) &&
		molecule._bonds.some((bond) =>
			bond._from.getSymbol() === "C" && bond._to.getSymbol() === "C") &&
		molecule._bonds.some((bond) => {
			const symbols = [bond._from.getSymbol(), bond._to.getSymbol()];
			return symbols.includes("C") && symbols.includes("O");
		});
}

/**
 * A Representation of a mixture of one or more instances of {@link Molecule}
 *
 * @class Mixture
 * @typedef {Mixture}
 */
class Mixture {
	/**
	 * The specific id of the object
	 *
	 * @type {number}
	 */
	_id: number;
	/**
	 * A list of all current {@link Molecule} objects within the mixture
	 *
	 * @type {Array<Molecule>}
	 */
	_activeMolecules: Array<Molecule>;
	/**
	 * A Json object containing data for each {@link Molecule} of the mixture. Gets filed at runtime
	 *
	 * @type {{}}
	 */
	_molProperties: {};
	/**
	 * Marks the current volume if the mixture is a solution
	 *
	 * @type {number}
	 */
	_solutionVolume: number = 0;

	/** Measured volume of additions beyond the water tracked by the solution model, in L. */
	addedVolume = 0;
	hasLiquidVolume = false;
	/**
	 * Gas that has left the solution, keyed by the id in `evolvedGases`, in
	 * mol. This is the separated tally: it sits in the headspace, as a second
	 * liquid or as a solid, and it is no longer available to an electrode.
	 */
	evolvedGas: Map<string, number> = new Map();
	/**
	 * Gas still dissolved in the solution, keyed by the id in `evolvedGases`,
	 * in mol. A gas produced at an electrode enters here first and only the
	 * part above the saturation concentration separates into
	 * {@link evolvedGas}. The dissolved part is what the Nernst term reads and
	 * what a half-reaction can consume again.
	 */
	dissolvedGas: Map<string, number> = new Map();
	/**
	 * Gas a fresh dose offers to a vessel, keyed by the id in `evolvedGases`,
	 * in mol. A dose is built by the palette before its target is known, so it
	 * cannot say how much of the gas the solution will take: the vessel
	 * decides when the dose arrives, dissolving up to the tabulated saturation
	 * and letting the rest pass into the gas space. The receiving vessel
	 * consumes the offer, so it is admitted exactly once.
	 */
	offeredGas: Map<string, number> = new Map();
	/**
	 * Analytical hypochlorous acid and hypochlorite together, in mol. Chlorine
	 * that dissolves hydrolyses to HOCl, H⁺ and Cl⁻; the family is kept as one
	 * number because neither HOCl nor ClO⁻ is a stored molecule, and the
	 * acid–base solver splits it by its own pKa.
	 */
	hypochlorite = 0;
	/**
	 * Net charge the half-reactions have left in the vessel without a stored
	 * counter-ion, in mol. Positive means excess cations, as after a cathodic
	 * water reduction that leaves hydroxide; negative means excess anions, as
	 * after an anodic water oxidation that leaves protons. The acid–base charge
	 * balance reads it as a spectator charge, so an electrolysis in a neutral
	 * salt solution still closes.
	 *
	 * It is an amount rather than a concentration so that it survives dilution
	 * and pouring unchanged: adding water moves no charge, and a transferred
	 * portion carries its share.
	 */
	excessCharge = 0;
	/**
	 * Charge the electrode reactions have moved into the vessel as stored
	 * species, in mol. A dissolving anode leaves its cation behind and the
	 * electrons leave through the wire, so the compartment would turn
	 * positive; a salt bridge carries the counter-ion in and keeps it
	 * neutral. {@link Simulation.sEChem} books the opposite into
	 * `excessCharge` when a bridge joins the two vessels.
	 */
	electrodeCharge = 0;

	/** Records `amountMol` of a gas as escaped from the solution. */
	evolveGas(gas: string, amountMol: number): void {
		if (!(amountMol > 0)) return;
		this.evolvedGas.set(gas, (this.evolvedGas.get(gas) ?? 0) + amountMol);
	}

	/**
	 * Brings `amountMol` of a gas into the vessel. The solution takes up to its
	 * saturation concentration and the rest separates as the phase the gas
	 * takes at lab conditions. A gas without a tabulated solubility is
	 * insoluble and separates at once.
	 *
	 * @param {string} gas - id in `evolvedGases`
	 * @param {number} amountMol - amount offered to the vessel
	 * @param {number} [solubility] - saturation concentration in mol/L; the
	 * tabulated value of the gas is used when it is omitted
	 */
	admitGas(gas: string, amountMol: number, solubility = evolvedGases[gas]?.solubility): void {
		if (!(amountMol > 0)) return;
		const volume = this._solutionVolume;
		const capacity = solubility > 0 && volume > 0 ? solubility * volume : 0;
		const held = this.dissolvedGas.get(gas) ?? 0;
		const dissolved = Math.min(amountMol, Math.max(0, capacity - held));
		if (dissolved > 0) this.dissolvedGas.set(gas, held + dissolved);
		this.evolveGas(gas, amountMol - dissolved);
	}

	/**
	 * Removes up to `amountMol` of a gas from the solution and returns what it
	 * could take. Only the dissolved part is available; the separated tally is
	 * out of reach of an electrode.
	 *
	 * @param {string} gas - id in `evolvedGases`
	 * @param {number} amountMol - amount asked for
	 * @returns {number} amount actually taken from the solution
	 */
	takeGas(gas: string, amountMol: number): number {
		if (!(amountMol > 0)) return 0;
		const held = this.dissolvedGas.get(gas) ?? 0;
		const taken = Math.min(held, amountMol);
		if (taken > 0) this.dissolvedGas.set(gas, held - taken);
		return taken;
	}

	/**
	 * Total gas that has left the solution as a gas, in mol. A halogen that
	 * separated as a liquid or a solid is not part of this: it never reaches a
	 * collection tube.
	 */
	get evolvedGasMol(): number {
		let total = 0;
		for (const [gas, amount] of this.evolvedGas) {
			if (evolvedGases[gas]?.phase !== "gas") continue;
			total += amount;
		}
		return total;
	}

	/**
	 * Solid material sitting in the vessel: precipitated salts and doses that
	 * have not dissolved yet. A metal that the acid could not consume stays
	 * here, so the vessel keeps showing it.
	 */
	get solidSediment(): { mass: number; color: number } {
		let mass = 0;
		let color = 0xf3eee1;
		let largest = 0;
		for (const molecule of this._activeMolecules) {
			if (!molecule.solidSaltFormula && !molecule.dosedAsSolid) continue;
			const grams = this._molProperties[molecule._id + "m"];
			mass += grams;
			if (grams > largest) {
				largest = grams;
				color = molecule.solidSaltFormula
					? saltSolubility[molecule.solidSaltFormula]?.color ?? 0xf3eee1
					: elementColor(molecule);
			}
		}
		return { mass, color };
	}

	get contentVolume(): number {
		return this.contentVolumeWith();
	}

	/** Immiscible liquid phases, lightest first, or [] while all is miscible. */
	get liquidPhases(): LiquidPhase[] {
		return splitLiquidPhases(this);
	}

	get hasLiquidContents(): boolean {
		return this._solutionVolume > 0 || this.hasLiquidVolume || this._activeMolecules.some(isEthanol);
	}

	/** Predicts the volume in litres after mixing in a homogeneous portion. */
	contentVolumeWith(portion?: Mixture, fraction = 1): number {
		const additiveVolume = Math.max(0, this._solutionVolume) + this.addedVolume +
			(portion ? (Math.max(0, portion._solutionVolume) + portion.addedVolume) * fraction : 0);
		let water = 0;
		let ethanol = 0;
		for (const [mixture, scale] of [[this, 1], [portion, fraction]] as const) {
			if (!mixture || scale <= 0) continue;
			for (const molecule of mixture._activeMolecules) {
				const mass = mixture._molProperties[molecule._id + "m"] * scale;
				if (!(mass > 0)) continue;
				if (StructureManager.isWater(molecule)) water += mass;
				else if (isEthanol(molecule)) ethanol += mass;
				else return additiveVolume;
			}
		}
		if (!ethanol) return additiveVolume;
		// Keep the nominal pure-component densities used for lab doses. Apply only
		// the excess volume from the reference model, so pure water stays at 1 g/mL.
		return water / 1000 + ethanol / 789 + ethanolWaterExcessVolume(water, ethanol);
	}

	fractionThatFits(portion: Mixture, capacity: number, maximum = 1): number {
		if (!(capacity > 0 && maximum > 0)) return 0;
		if (this.contentVolumeWith(portion, maximum) <= capacity + 1e-12) return maximum;
		let low = 0;
		let high = maximum;
		for (let step = 0; step < 38; step++) {
			const middle = (low + high) / 2;
			if (this.contentVolumeWith(portion, middle) <= capacity) low = middle;
			else high = middle;
		}
		return low;
	}
	/**
	 * Is true if the mixture is a solution
	 *
	 * @type {boolean}
	 */
	_isSolution: boolean = false;
	/**
	 * The current temperature of the solution in kelvin - wip
	 *
	 * @type {number}
	 */
	_temperature: number = 298.15;
	/**
	 * The current temperature of the solution in pascal - wip
	 *
	 * @type {number}
	 */
	_pressure: number = 101325;

	/**
	 * Returns a new mixture object
	 *
	 * @constructor
	 * @param {*} nIndex - the unique id for the object
	 */
	constructor(nIndex) {
		this._id = nIndex;
		this._activeMolecules = new Array<Molecule>();
		this._molProperties = {};
	}

	/**
	 * Adds a new {@link Molecule} to the mixture or calls {@link changeMolecule()} if the object is already included in {@link _activeMolecules}
	 *
	 * @public
	 * @param {Molecule} nMolecule - the {@link Molecule} object to add
	 * @param {number} amountMol - the amount in moles
	 */
	public addMolecule(nMolecule: Molecule, amountMol: number): void {
		var bIncluded: boolean = false;
		var usedIndex: number = -1;

		this._activeMolecules.forEach((molecule) => {
			if (nMolecule.solidSaltFormula !== molecule.solidSaltFormula) return;
			if (nMolecule.solidSaltFormula) {
				bIncluded = true;
				usedIndex = molecule._id;
				return;
			}
			if (nMolecule._atoms.length === 1) {
				if (
					molecule._atoms.length === 1 &&
					nMolecule._atoms[0].getSymbol() === molecule._atoms[0].getSymbol() &&
					nMolecule._totalCharge === molecule._totalCharge
				) {
					bIncluded = true;
					usedIndex = molecule._id;
				}
			} else {
				if (
					nMolecule === molecule ||
					(nMolecule.smilesString && nMolecule.smilesString === molecule.smilesString &&
						nMolecule._totalCharge === molecule._totalCharge)
				) {
					bIncluded = true;
					usedIndex = molecule._id;
				}
			}
		});

		if (bIncluded) {
			if (nMolecule.aqueousAcidBase) {
				const stored = this._activeMolecules.find(molecule => molecule._id === usedIndex);
				stored.aqueousAcidBase ??= nMolecule.aqueousAcidBase;
			}
			this.changeMolecule(usedIndex, amountMol);
			if (StructureManager.isWater(nMolecule)) {
				this._solutionVolume = this._molProperties[usedIndex + "m"] / 1000;
				if (this._activeMolecules.length - 1 > 0) {
					this._activeMolecules.forEach((molecule) => {
						this.changeMolecule(molecule._id, 0);
					});
				}
			}
			return;
		}

		this._activeMolecules.push(nMolecule);
		this._molProperties[nMolecule._id + "n"] = amountMol;
		this._molProperties[nMolecule._id + "m"] =
			amountMol * nMolecule.getTotMolMass();

		if (this._isSolution && !nMolecule.solidSaltFormula) {
			this._molProperties[nMolecule._id + "c"] =
				amountMol / this._solutionVolume;
		}

		if (StructureManager.isWater(nMolecule)) {
			this._isSolution = true;
			this._solutionVolume = this._molProperties[nMolecule._id + "m"] / 1000;
			this._molProperties[nMolecule._id + "c"] =
				this._molProperties[nMolecule._id + "n"] / this._solutionVolume;

			if (this._activeMolecules.length - 1 > 0) {
				this._activeMolecules.forEach((molecule) => {
					this.changeMolecule(molecule._id, 0);
				});
			}
		}
	}

	/**
	 * Removes a molecule from the mixture by deleting its entries in {@link _activeMolecules} and {@link _molProperties}
	 *
	 * @public
	 * @param {number} rId - the id of the molecule to remove
	 */
	public remMolecule(rId: number): void {
		let rMoleculeIndex: number = -1;

		this._activeMolecules.forEach((molecule) => {
			if (molecule._id === rId) {
				rMoleculeIndex = this._activeMolecules.indexOf(molecule);
			}
		});

		this._activeMolecules.splice(rMoleculeIndex, 1);
		delete this._molProperties[rId + "n"];
		delete this._molProperties[rId + "m"];
		delete this._molProperties[rId + "c"];
	}

	/**
	 * Changes the amount of a given {@link Molecule}. Calls {@link remMolecule()} if neccessary
	 *
	 * @public
	 * @param {number} iMol - the id of the molecule
	 * @param {number} amountMol - the amount to add (positive) ore remove (negative)
	 */
	public changeMolecule(iMol: number, amountMol: number): void {
		const amount: number = this._molProperties[iMol + "n"];
		// A molecule that was added with zero amount carries no mass yet, so
		// deriving the molar mass from the amount would make it Infinity and
		// poison every later mass update. Fall back to the molecule itself.
		let molMass: number = amount > 0
			? this._molProperties[iMol + "m"] / amount
			: this._activeMolecules.find((mol) => mol._id === iMol)?.getTotMolMass() ?? 0;

		this._molProperties[iMol + "n"] += amountMol;
		this._molProperties[iMol + "m"] += amountMol * molMass;

		let cMol: Molecule = this._activeMolecules.find((mol) => {
			return mol._id === iMol;
		});
		if (StructureManager.isWater(cMol)) {
			this._solutionVolume = this._molProperties[iMol + "m"] / 1000;
		}

		if (this._isSolution && !cMol.solidSaltFormula) {
			this._molProperties[iMol + "c"] =
				this._molProperties[iMol + "n"] / this._solutionVolume;
		}

		if (this._molProperties[iMol + "n"] <= 0) {
			this.remMolecule(iMol);
		}
	}
}

export { Mixture };
