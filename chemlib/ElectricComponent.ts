import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";

/**
 * An enum for the specific electric component types, used for identification
 *
 * @export
 * @enum {number}
 */
export enum EComponentType {
	Electrode = "electrode",
	Cable = "cable",
	Source = "source",
	Voltmeter = "voltmeter",
	Ammeter = "ammeter",
}

export const VOLTMETER_MODEL_CURRENT = 2;
export const AMMETER_MODEL_VOLTAGE = 10;

/**
 * Metal deposited on an electrode by reduction. The deposit belongs to the
 * electrode and not to the solution, so it shows as a coating on the strip
 * instead of as a sediment in the vessel.
 *
 * @export
 * @interface ElectrodePlating
 */
export interface ElectrodePlating {
	/** The deposited metal, neutral. */
	molecule: Molecule;
	/** Deposited amount in mol. */
	mol: number;
	/** Bulk volume of the deposit in litres, for the coating thickness. */
	litres: number;
	/** Bulk volume of one mole of the metal in litres. */
	litresPerMol: number;
}

/**
 * Representation of an electric component
 *
 * @class ElectricComponent
 * @typedef {ElectricComponent}
 */
class ElectricComponent {
	/**
	 * The type of the component
	 *
	 * @type {EComponentType}
	 */
	_type: EComponentType;
	/**
	 * The specific id of the object
	 *
	 * @type {number}
	 */
	_id: number;
	/**
	 * A list containing all connected objects
	 *
	 * @type {Array<ElectricComponent>}
	 */
	_connections: Array<ElectricComponent>;
	/**
	 * for electrodes: The solutiuon, the electrode is connected to
	 *
	 * @type {Mixture}
	 */
	_connectedMix: Mixture;
	/**
	 * The number of possible connections
	 *
	 * @type {number}
	 */
	_conCount: number;
	/**
	 * for electrodes: The Material of the electrode
	 *
	 * @readonly
	 * @type {Molecule}
	 */
	_material: Molecule;
	/**
	 * for voltage sources: the source voltage in volts
	 *
	 * @readonly
	 * @type {number}
	 */
	_sourceVoltage: number;
	/**
	 * for voltage sources: the source current in ampere
	 *
	 * @readonly
	 * @type {number}
	 */
	_sourceCurrent: number;
	/**
	 * for voltage sources: which pole the electrode at `_connections[0]` sits
	 * on. 1 puts it on the plus pole, -1 on the minus pole, and 0 leaves the
	 * direction to the model, which then drives the couple pair that needs
	 * driving.
	 *
	 * @type {(-1 | 0 | 1)}
	 */
	_polarity: -1 | 0 | 1 = 0;
	/**
	 * for voltmeter: the indicated voltage
	 *
	 * @type {number}
	 */
	_visibleVoltage: number | null;
	/**
	 * for electrodes: metal deposited on the electrode by reduction, keyed by
	 * the SMILES of the deposited element
	 *
	 * @type {Map<string, ElectrodePlating>}
	 */
	_plating: Map<string, ElectrodePlating> = new Map();

	/**
	 * Creates a new electric component.
	 *
	 * @constructor
	 * @param {number} nIndex - the given object id
	 * @param {EComponentType} nType - the type of the electrical component
	 * @param {{
	 * 			nMixture?: Mixture;
	 * 			nMaterial?: Molecule;
	 * 			nSourceVoltage?: number;
	 * 			nSourceCurrent?: number;
	 * 		}} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
	 * @param {Mixture} param0.nMixture - for electrodes: The possible initially connected solution
	 * @param {Molecule} param0.nMaterial - for electrodes: The electrodes material, molecule should be neutral
	 * @param {number} param0.nSourceVoltage - for voltage sources: The source voltage
	 * @param {number} param0.nSourceCurrent - for voltage sources: The source current
	 */
	constructor(
		nIndex: number,
		nType: EComponentType,
		{
			nMixture,
			nMaterial,
			nSourceVoltage,
			nSourceCurrent,
		}: {
			nMixture?: Mixture;
			nMaterial?: Molecule;
			nSourceVoltage?: number;
			nSourceCurrent?: number;
		} = {}
	) {
		this._type = nType;
		this._id = nIndex;
		this._connections = new Array<ElectricComponent>();

		switch (this._type) {
			case EComponentType.Source:
				this._conCount = 2;
				this._sourceVoltage = nSourceVoltage;
				this._sourceCurrent = nSourceCurrent;
				break;
			case EComponentType.Voltmeter:
				this._conCount = 2;
				this._sourceCurrent = VOLTMETER_MODEL_CURRENT;
				this._visibleVoltage = 0;
				break;
			case EComponentType.Ammeter:
				this._conCount = 2;
				this._sourceVoltage = AMMETER_MODEL_VOLTAGE;
				break;
			case EComponentType.Cable:
				this._conCount = 2;
				break;
			case EComponentType.Electrode:
				this._conCount = 1;
				this._material = nMaterial;
				this._connectedMix = nMixture;
				break;
			default:
				break;
		}
	}

	/**
	 * Connects one electric component to another
	 *
	 * @public
	 * @param {ElectricComponent} nComposite - the other component
	 */
	public connect(nComposite: ElectricComponent): string {
		let message: string = ""
		if (
			this._conCount > this._connections.length &&
			nComposite._conCount > nComposite._connections.length
		) {
			this._connections.push(nComposite);
			nComposite._connections.push(this);
		}else{
			message = "Mindestens eine Komponente hat keine Ein/Ausgänge mehr."
		}

		return message
	}

	/**
	 * Removes an existing connection
	 *
	 * @public
	 * @param {ElectricComponent} rComposite - the connected component
	 */
	public disconnect(rComposite: ElectricComponent): string {
		let message: string = ""

		if(this._connections.includes(rComposite) && rComposite._connections.includes(this)){
			this._connections.splice(this._connections.indexOf(rComposite), 1)
			rComposite._connections.splice(rComposite._connections.indexOf(this), 1)
		}else{
			message = "Die gewählten Komponenten sind nicht verbunden."
		}


		return message
	}

	/**
	 * for electrodes: sets the connected mixture
	 *
	 * @public
	 * @param {Mixture} nMix - the solution to connect to
	 */
	public setMixture(nMix: Mixture): void {
		if (this._type === EComponentType.Electrode) {
			this._connectedMix = nMix;
		}
	}

	/**
	 * for electrodes: deposits a metal on the electrode. The deposit stays on
	 * the electrode instead of entering the solution, so it shows as a coating
	 * rather than as a sediment.
	 *
	 * @public
	 * @param {Molecule} molecule - the neutral deposited metal
	 * @param {number} amountMol - deposited amount in mol
	 * @param {number} litresPerMol - bulk volume of one mole of the metal in litres
	 */
	public plate(molecule: Molecule, amountMol: number, litresPerMol: number): void {
		if (this._type !== EComponentType.Electrode || !(amountMol > 0)) return;
		const key: string = molecule.smilesString;
		const entry: ElectrodePlating = this._plating.get(key);
		if (entry) {
			entry.mol += amountMol;
			entry.litres = entry.mol * entry.litresPerMol;
			return;
		}
		this._plating.set(key, { molecule, mol: amountMol, litres: amountMol * litresPerMol, litresPerMol });
	}

	/**
	 * for electrodes: takes metal off the deposit again, as the anode of a
	 * reversed cell does. A layer that is used up disappears, so the electrode
	 * is bare again and its own material takes over.
	 *
	 * @public
	 * @param {Molecule} molecule - the deposited metal
	 * @param {number} amountMol - amount to remove in mol
	 */
	public unplate(molecule: Molecule, amountMol: number): void {
		if (this._type !== EComponentType.Electrode || !(amountMol > 0)) return;
		const key: string = molecule.smilesString;
		const entry: ElectrodePlating = this._plating.get(key);
		if (!entry) return;
		entry.mol = Math.max(0, entry.mol - amountMol);
		entry.litres = entry.mol * entry.litresPerMol;
		if (!(entry.mol > 1e-12)) this._plating.delete(key);
	}

	/**
	 * for electrodes: every layer of the deposit, thickest first. The vessel
	 * card lists them as species that sit on the electrode rather than in the
	 * solution.
	 *
	 * @readonly
	 * @type {ElectrodePlating[]}
	 */
	get platings(): ElectrodePlating[] {
		return [...this._plating.values()].sort((a, b) => b.litres - a.litres);
	}

	/**
	 * for electrodes: the deposit with the largest volume, or undefined while
	 * the electrode is bare. Successive layers of different metals are kept
	 * apart, and the thickest one is the one the surface shows.
	 *
	 * @readonly
	 * @type {(ElectrodePlating | undefined)}
	 */
	get plating(): ElectrodePlating | undefined {
		return this.platings[0];
	}
}

export { ElectricComponent };
