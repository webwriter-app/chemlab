import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";
import { ELECTRODE_AREA } from "./halfReactions";

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
	Multimeter = "multimeter",
	Bridge = "bridge",
	GasCollector = "gascollector",
	Label = "label",
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
	 * The partners on each terminal, indexed by terminal. The array always has
	 * `_conCount` slots and a slot that carries no cable stays empty, so the
	 * index of a partner is the terminal it sits on. That is what makes
	 * `_connections[0]` a stable reference for the first pole of a source even
	 * when the second pole was wired first.
	 *
	 * @type {Array<ElectricComponent | undefined>}
	 */
	_connections: Array<ElectricComponent | undefined>;
	/**
	 * for electrodes: The solutiuon, the electrode is connected to
	 *
	 * @type {Mixture}
	 */
	_connectedMix: Mixture;
	/**
	 * for a salt bridge: the two vessels its legs dip into, in the order of
	 * the legs. A bridge carries no cable, so this is what joins it to the
	 * cell; the simulation closes the charge balance of both vessels when a
	 * bridge spans the two half-cells of a running circuit.
	 *
	 * @type {Mixture[]}
	 */
	_bridgeMixes: Mixture[] = [];
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
	 * for electrodes: the wetted area in cm². The current density the kinetics
	 * are written in follows from it, so a wider strip carries more current at
	 * the same overpotential.
	 *
	 * @type {number}
	 */
	_area: number = ELECTRODE_AREA;
	/**
	 * for electrodes: the fixed potential in V against the standard hydrogen
	 * electrode when the electrode is a reference electrode. Such an electrode
	 * holds its potential instead of settling at a mixed potential, so it needs
	 * no vessel of its own.
	 *
	 * @type {(number | undefined)}
	 */
	_reference?: number;
	/**
	 * for sources: whether the source sets the voltage and lets the cell solve
	 * the current, or sets the current and lets the cell solve the voltage it
	 * needs. A galvanostat is the second kind.
	 *
	 * @type {("voltage" | "current")}
	 */
	_sourceMode: "voltage" | "current" = "voltage";
	/**
	 * for sources in current mode: the largest voltage the source may apply
	 * before it gives up and behaves like a voltage source at that limit, in V.
	 *
	 * @type {number}
	 */
	_complianceVoltage: number = 30;
	/**
	 * for a multimeter: whether it reads the voltage across the cell or the
	 * current through it. The two modes differ in what the meter does to the
	 * circuit, not only in what it shows.
	 *
	 * @type {("voltage" | "current")}
	 */
	_meterMode: "voltage" | "current" = "voltage";
	/**
	 * for a label: the text it shows on the canvas.
	 *
	 * @type {string}
	 */
	_labelText: string = "";
	/**
	 * the palette variant the component was placed as, so a saved layout can
	 * restore the size and the material it was authored with.
	 *
	 * @type {(string | undefined)}
	 */
	_variantId?: string;
	/**
	 * for voltmeters, multimeters in voltage mode and sources in current mode:
	 * the voltage the cell solve found, in volt. `null` until the cell has been
	 * solved once, so a meter that is not in a running circuit shows a dash
	 * instead of a zero it never measured.
	 *
	 * @type {(number | null)}
	 */
	_visibleVoltage: number | null = null;
	/**
	 * for sources and ammeters: the current the cell solve found, in ampere.
	 * `null` until the cell has been solved once.
	 *
	 * @type {(number | null)}
	 */
	_visibleCurrent: number | null = null;
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

		switch (this._type) {
			case EComponentType.Source:
				this._conCount = 2;
				this._sourceVoltage = nSourceVoltage;
				this._sourceCurrent = nSourceCurrent;
				break;
			case EComponentType.Voltmeter:
				this._conCount = 2;
				this._sourceCurrent = VOLTMETER_MODEL_CURRENT;
				break;
			case EComponentType.Ammeter:
				this._conCount = 2;
				this._sourceVoltage = AMMETER_MODEL_VOLTAGE;
				break;
			case EComponentType.Multimeter:
				this._conCount = 2;
				break;
			case EComponentType.Cable:
				this._conCount = 2;
				break;
			case EComponentType.Electrode:
				this._conCount = 1;
				this._material = nMaterial;
				this._connectedMix = nMixture;
				break;
			// A salt bridge, a gas collector and a label carry no cables: they
			// act on the vessel they sit in or on, not on the circuit.
			case EComponentType.Bridge:
			case EComponentType.GasCollector:
			case EComponentType.Label:
				this._conCount = 0;
				break;
			default:
				break;
		}
		// One slot per terminal, so the index of a partner is the terminal it
		// sits on. A device without terminals gets an empty array.
		this._connections = new Array<ElectricComponent | undefined>(this._conCount > 0 ? this._conCount : 0);
	}

	/**
	 * The terminals that carry no cable yet.
	 *
	 * @readonly
	 * @type {number[]}
	 */
	get freeTerminals(): number[] {
		const free: number[] = [];
		for (let terminal = 0; terminal < this._conCount; terminal++) {
			if (!this._connections[terminal]) free.push(terminal);
		}
		return free;
	}

	/**
	 * Puts a partner on one terminal of this device, without touching the
	 * partner. The caller that wires both sides is {@link connect} or
	 * `connectDevices`.
	 *
	 * @public
	 * @param {ElectricComponent} partner - the component to place
	 * @param {number} terminal - the terminal to place it on
	 * @returns {boolean} whether the terminal was free
	 */
	public attach(partner: ElectricComponent, terminal: number): boolean {
		if (!(terminal >= 0) || terminal >= this._conCount) return false;
		if (this._connections[terminal]) return false;
		this._connections[terminal] = partner;
		return true;
	}

	/**
	 * Connects one electric component to another. The partner takes its first
	 * free terminal; the terminal of this device can be chosen, which is what
	 * lets a source keep its plus pole on terminal 0.
	 *
	 * @public
	 * @param {ElectricComponent} nComposite - the other component
	 * @param {number} [terminal] - the terminal of this device to use
	 * @returns {string} an empty string on success, a message otherwise
	 */
	public connect(nComposite: ElectricComponent, terminal?: number): string {
		if (!(this._conCount > 0) || !(nComposite._conCount > 0)) {
			return "Mindestens eine Komponente hat keine Ein/Ausgänge.";
		}
		const free = this.freeTerminals;
		const partnerFree = nComposite.freeTerminals;
		if (free.length === 0 || partnerFree.length === 0) {
			return "Mindestens eine Komponente hat keine Ein/Ausgänge mehr.";
		}
		const slot = terminal !== undefined && free.includes(terminal) ? terminal : free[0];
		this._connections[slot] = nComposite;
		nComposite._connections[partnerFree[0]] = this;
		return "";
	}

	/**
	 * Removes an existing connection. The terminal keeps its slot, so the
	 * remaining partners stay on the terminals they were put on.
	 *
	 * @public
	 * @param {ElectricComponent} rComposite - the connected component
	 * @returns {string} an empty string on success, a message otherwise
	 */
	public disconnect(rComposite: ElectricComponent): string {
		const index = this._connections.indexOf(rComposite);
		if (index < 0) return "Die gewählten Komponenten sind nicht verbunden.";
		this._connections[index] = undefined;
		const back = rComposite._connections.indexOf(this);
		if (back >= 0) rComposite._connections[back] = undefined;
		return "";
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
