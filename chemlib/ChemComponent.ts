import { ComponentManager } from "./ComponentManager";
import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";
import { Simulation } from "./Simulation";
import { StructureManager } from "./StructureManager";

/**
 * An enum for the specific component types, used for identification
 *
 * @export
 * @enum {number}
 */
export enum ComponentType {
	Testtube = "testtube",
	Beaker = "beaker",
	Flask = "flask",
	Condenser = "condenser",
	Separatingfunnel = "separatingfunnel",
	Burette = "burette",
}

/**
 * Representation of a chemical lab component
 *
 * @class ChemComponent
 * @typedef {ChemComponent}
 */
class ChemComponent {
	/**
	 * The type of the component
	 *
	 * @type {ComponentType}
	 */
	_type: ComponentType;
	/**
	 * The specific id of the object
	 *
	 * @type {number}
	 */
	_id: number;
	/**
	 * A list of connected components on the intake side
	 *
	 * @type {Array<ChemComponent>}
	 */
	_inlets: Array<ChemComponent>;
	/**
	 * A list of connected components on the outtake side
	 *
	 * @type {Array<ChemComponent>}
	 */
	_outlets: Array<ChemComponent>;
	/**
	 * The component's max volume in litres
	 *
	 * @type {number}
	 */
	_volume: number = 1;
	/**
	 * A list of components that influent the component with temperature or pressure - wip
	 *
	 * @type {Array<ChemComponent>}
	 */
	_influences: Array<ChemComponent>;
	/**
	 * The content of the component, e.g. a solution
	 *
	 * @type {Mixture}
	 */
	_content: Mixture;
	/**
	 * The volume of contents in L that'll get transferred from the component by default when calling {@link transferContents}
	 *
	 * @type {number}
	 */
	_outVol: number = 0;
	/**
	 * The amounts of intakes an outlets of a component
	 *
	 * @readonly
	 * @type {[number, number]}
	 */
	readonly _inOutLimits: [number, number];

	/**
	 * Creates a new chemical component.
	 *
	 * @constructor
	 * @param {number} nIndex - the object id
	 * @param {ComponentType} nType - the component type out of {@link ComponentType}
	 * @param {Mixture} [nMixture=StructureManager.newMixture()] - the initial contents of the component, optional
	 */
	constructor(
		nIndex: number,
		nType: ComponentType,
		nMixture: Mixture = StructureManager.newMixture()
	) {
		this._type = nType;
		this._id = nIndex;
		switch (this._type) {
			case ComponentType.Beaker:
			case ComponentType.Flask:
			case ComponentType.Testtube:
				this._inOutLimits = [1, 0];
				break;
			case ComponentType.Condenser:
				this._inOutLimits = [1, 1];
				break;
			case ComponentType.Burette:
			case ComponentType.Separatingfunnel:
				this._inOutLimits = [0, 1];
				this._outVol = Simulation._simStepSize;
				break;
			default:
				this._inOutLimits = [0, 0];
				break;
		}

		this._inlets = new Array<ChemComponent>();
		this._outlets = new Array<ChemComponent>();
		this._influences = new Array<ChemComponent>();
		this._content = nMixture;
		this._volume = ComponentManager._standardVolumes[nType.toLowerCase()]
	}

	/**
	 * Sets the default output volume in {@link _outVol}
	 *
	 * @public
	 * @param {number} nAmount - the new volume in litres
	 */
	public setOutVol(nAmount: number): void {
		if (
			this._type === ComponentType.Separatingfunnel ||
			this._type === ComponentType.Burette
		) {
			this._outVol = nAmount;
		}
	}

	/**
	 * Connects one component to another, if possible
	 *
	 * @public
	 * @param {ChemComponent} nComposit - the other component
	 */
	public connect(nComposit: ChemComponent): void {
		if (
			this._outlets.length < this._inOutLimits[1] &&
			nComposit._inlets.length < nComposit._inOutLimits[0]
		) {
			this._outlets.push(nComposit);
			nComposit._inlets.push(this);
		}
	}

	/**
	 * adds one {@link Molecule} or a whole {@link Mixture} in the specified quantity to the components content
	 *
	 * @public
	 * @param {{ nMix?: Mixture; nMolecule?: Molecule; nMolAmount?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
	 * @param {Mixture} param0.nMix - a {@link Mixture} object, when a mix shall be added
	 * @param {Molecule} param0.nMolecule - a {@link Molecule} object, when a single molecule shall be added
	 * @param {number} param0.nMolAmount - the amount in moles
	 */
	public addContents({
		nMix,
		nMolecule,
		nMolAmount,
	}: { nMix?: Mixture; nMolecule?: Molecule; nMolAmount?: number } = {}): void {
		if (nMix != null && nMolecule == null) {
			if (this._content == null) {
				if (nMolAmount == null) {
					this._content = nMix;
					return;
				} else {
					this._content = StructureManager.newMixture();
					this.addContents({
						nMix: nMix,
						nMolecule: nMolecule,
						nMolAmount: nMolAmount,
					});
				}
			} else {
				const incomingMol = nMix._activeMolecules.reduce((sum, mol) => sum + nMix._molProperties[mol._id + "n"], 0);
				const addedMol = nMix._activeMolecules.reduce((sum, mol) => sum +
					Math.min(nMix._molProperties[mol._id + "n"], nMolAmount ?? Infinity), 0);
				if (incomingMol > 0 && addedMol > 0) {
					this._content.addedVolume += nMix.addedVolume * addedMol / incomingMol;
					this._content.hasLiquidVolume ||= nMix.hasLiquidVolume;
				}
				for (let mol of nMix._activeMolecules) {
					this._content.addMolecule(
						mol,
						nMolAmount == null
							? nMix._molProperties[mol._id + "n"]
							: Math.min(nMix._molProperties[mol._id + "n"], nMolAmount)
					);
				}
			}
		}
		if (nMix == null && nMolecule != null) {
			if (this._content != null) {
				this._content.addMolecule(
					nMolecule,
					nMolAmount == null ? Simulation._simStepSize : nMolAmount
				);
			}
		}

		Simulation.sSolvation(this._content);
	}

	/**
	 * transfers contents of the component to another. Either a single molecule or a part of the entire mix, if no molecule is specified
	 *
	 * @public
	 * @param {{ tMol?: Molecule; tVolume?: number }} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
	 * @param {Molecule} param0.tMol - a {@link Molecule} object, if a molecule shall be transfered
	 * @param {number} param0.tVolume: tVolume - the volume to be transferred. An empty value either means everything or a specific amount based on the type of the component
	 * @param {ChemComponent} tDest - the component object, to which the contents shall be transferred to
	 */
	public transferContents(
		{ tMol, tVolume }: { tMol?: Molecule; tVolume?: number } = {},
		tDest: ChemComponent
	): void {
		// console.log(tDest)
		if (tDest === this) return;
		if (tDest._inOutLimits[0] > 0) {
			const volume = this._content.contentVolume;
			if (volume > 0 && tMol == null) {
				const requested = tVolume ?? (this._outVol || volume);
				const maximum = Math.max(0, Math.min(1, requested / volume));
				const fraction = tDest._content.fractionThatFits(this._content, tDest._volume / 1000, maximum);
				if (fraction <= 0) return;
				const portion = StructureManager.newMixture();
				for (const mol of [...this._content._activeMolecules]) {
					const amount = this._content._molProperties[mol._id + "n"] * fraction;
					portion.addMolecule(mol, amount);
					this._content.changeMolecule(mol._id, -amount);
				}
				portion.hasLiquidVolume = this._content.hasLiquidVolume;
				portion.addedVolume = this._content.addedVolume * fraction;
				this._content.addedVolume -= portion.addedVolume;
				if (fraction === 1) this._content.hasLiquidVolume = false;
				tDest.addContents({ nMix: portion });
				if (tDest._content._isSolution) Simulation.sNeutralize(tDest._content);
				return;
			}
			if (tMol != null) {
				tDest.addContents({
					nMolecule: tMol,
					nMolAmount:
						tVolume == null
							? this._outVol === 0
								? this._content._molProperties[tMol._id + "n"]
								: Math.min(
										this._outVol * this._content._molProperties[tMol._id + "c"],
										this._content._molProperties[tMol._id + "n"]
								  )
							: Math.min(
									tVolume * this._content._molProperties[tMol._id + "c"],
									this._content._molProperties[tMol._id + "n"]
							  ),
				});
				this._content.changeMolecule(
					tMol._id,
					-(tVolume == null
						? this._outVol === 0
							? this._content._molProperties[tMol._id + "n"]
							: this._outVol * this._content._molProperties[tMol._id + "c"]
						: tVolume * this._content._molProperties[tMol._id + "c"])
				);
			}
			if (tMol == null) {
				let molData: number[][] = [];
				this._content._activeMolecules.forEach((mol) => {
					molData.push([
						mol._id,
						this._content._molProperties[mol._id + "c"],
						this._content._molProperties[mol._id + "n"],
					]);
				});
				molData.forEach((data) => {
					let mol: Molecule = this._content._activeMolecules.find((mol) => {
						return mol._id === data[0];
					});
					tDest.addContents({
						nMolecule: mol,
						nMolAmount:
							tVolume == null
								? this._outVol === 0
									? data[2]
									: Math.min(this._outVol * data[1], data[2])
								: Math.min(tVolume * data[1], data[2]),
					});
					this._content.changeMolecule(
						data[0],
						-(tVolume == null
							? this._outVol === 0
								? data[2]
								: this._outVol * data[1]
							: tVolume * data[1])
					);
				});
			}
			// if(this._content._activeMolecules.length === 0){
			// 	this._content._isSolution = false
			// }
			if(tDest._content._isSolution){
				Simulation.sNeutralize(tDest._content)
			}
		}
	}
}

export { ChemComponent };
