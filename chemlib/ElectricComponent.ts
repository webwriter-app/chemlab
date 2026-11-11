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
	 * for voltmeter: the indicated voltage
	 *
	 * @type {number}
	 */
	_visibleVoltage: number;

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
			case EComponentType.Voltmeter:
				this._visibleVoltage = 0;
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
}

export { ElectricComponent };
