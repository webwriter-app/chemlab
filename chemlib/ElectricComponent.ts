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

/**
 * Resistance of one lab lead, in Ω. A lead is a wire, so it is a short in
 * every calculation that does not ask for millivolts.
 */
export const CABLE_RESISTANCE = 0.02;
/**
 * Input resistance of a bench voltmeter, in Ω. A meter that reads a voltage
 * has to draw almost nothing, otherwise it changes the voltage it measures;
 * 10 MΩ is the usual figure for a digital instrument.
 */
export const VOLTMETER_RESISTANCE = 1e7;
/**
 * Shunt resistance of a bench ammeter, in Ω. A meter that reads a current is
 * wired into the loop, so it has to drop as little as possible.
 */
export const AMMETER_RESISTANCE = 0.1;
/**
 * Internal resistance of the lab supply's output stage, in Ω. It is what
 * limits the current a source can push into a short.
 */
export const SOURCE_RESISTANCE = 0.5;

/**
 * The plug on one end of a cable. A banana plug goes into the binding post of
 * an instrument, a crocodile clip clamps onto a metal electrode, so the two
 * are not interchangeable.
 *
 * @export
 * @typedef {("banana" | "crocodile")}
 */
export type CableEnd = "banana" | "crocodile";

/**
 * The kind of socket a terminal offers. A binding post takes a banana plug, a
 * metal strip is clamped by a crocodile clip.
 *
 * @export
 * @typedef {("banana" | "clip")}
 */
export type TerminalSocket = "banana" | "clip";

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
	 * A slot is a list because a binding post takes any number of plugs: the
	 * supply and a voltmeter can share a post, and a stack of leads on one
	 * terminal is what a bench looks like. The one place that holds a single
	 * partner is the end of a cable, because a plug goes into one socket.
	 *
	 * @type {Array<ElectricComponent[]>}
	 */
	_connections: Array<ElectricComponent[]>;
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
	 * for voltage sources: the source current in ampere. In current mode it is
	 * the current the source forces; in voltage mode it is the largest current
	 * the source delivers, and a cell that would draw more makes it drop into
	 * constant-current operation. Zero leaves the current unlimited.
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
	/** Optional settings for a passive RC experiment, in F, Ω and A. */
	_rcSettings?: { capacitance: number; seriesResistance: number; cutoff?: number };
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
	 * for voltmeters, multimeters in voltage mode and sources: the voltage the
	 * cell solve found, in volt. A source in current mode shows the voltage it
	 * had to apply, one in voltage mode the voltage left after its current
	 * limit took over. `null` until the cell has been solved once, so a meter
	 * that is not in a running circuit shows a dash instead of a zero it never
	 * measured.
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
	 * for cables: the plug on each end, indexed by end. A cable that the
	 * restore path lays implicitly takes the plugs its two devices need, so an
	 * older layout keeps working without cable entries of its own.
	 *
	 * @type {[CableEnd, CableEnd]}
	 */
	_cableEnds: [CableEnd, CableEnd] = ["banana", "banana"];
	/**
	 * for cables: where an end that is plugged into nothing sits, as an offset
	 * from the cable's own position. A plugged end ignores this and follows
	 * its terminal instead, so a cable can be laid out before it is wired.
	 *
	 * @type {[{ x: number; y: number }, { x: number; y: number }]}
	 */
	_endOffsets: [{ x: number; y: number }, { x: number; y: number }] = [{ x: -12, y: 0 }, { x: 12, y: 0 }];
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
			case EComponentType.Ammeter:
				this._conCount = 2;
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
		this._connections = Array.from(
			{ length: this._conCount > 0 ? this._conCount : 0 },
			() => [] as ElectricComponent[]
		);
	}

	/**
	 * Every partner of this device, whatever terminal it sits on.
	 *
	 * @readonly
	 * @type {ElectricComponent[]}
	 */
	get partners(): ElectricComponent[] {
		return this._connections.flat();
	}

	/**
	 * Whether a terminal can take one more partner. A post on a device takes
	 * any number of plugs; an end of a cable takes one, because a plug goes
	 * into a single socket.
	 *
	 * @public
	 * @param {number} terminal - the terminal index
	 * @returns {boolean}
	 */
	public hasRoom(terminal: number): boolean {
		if (!(terminal >= 0) || terminal >= this._conCount) return false;
		return this._type === EComponentType.Cable ? this._connections[terminal].length === 0 : true;
	}

	/**
	 * The terminal a new partner should go on: the first one that carries
	 * nothing yet, so both poles of a source are used before a post is
	 * shared, and otherwise the least loaded one. -1 when nothing is free.
	 *
	 * @public
	 * @returns {number}
	 */
	public preferredTerminal(): number {
		let best = -1;
		let bestLoad = Infinity;
		for (let terminal = 0; terminal < this._conCount; terminal++) {
			if (!this.hasRoom(terminal)) continue;
			const load = this._connections[terminal].length;
			if (load === 0) return terminal;
			if (load < bestLoad) {
				best = terminal;
				bestLoad = load;
			}
		}
		return best;
	}

	/**
	 * The terminals of this device that carry the given partner.
	 *
	 * @public
	 * @param {ElectricComponent} partner - the partner to look for
	 * @returns {number[]}
	 */
	public terminalsOf(partner: ElectricComponent): number[] {
		const found: number[] = [];
		for (let terminal = 0; terminal < this._conCount; terminal++) {
			if (this._connections[terminal].includes(partner)) found.push(terminal);
		}
		return found;
	}

	/**
	 * Puts a partner on one terminal of this device, without touching the
	 * partner. The caller that wires both sides is {@link connect} or
	 * `connectDevices`.
	 *
	 * @public
	 * @param {ElectricComponent} partner - the component to place
	 * @param {number} terminal - the terminal to place it on
	 * @returns {boolean} whether the terminal took the partner
	 */
	public attach(partner: ElectricComponent, terminal: number): boolean {
		if (!this.hasRoom(terminal)) return false;
		const list = this._connections[terminal];
		if (list.includes(partner)) return false;
		list.push(partner);
		return true;
	}

	/**
	 * Takes a partner off this device. Without a terminal the first one that
	 * carries it is used, which is what a cable end drag needs.
	 *
	 * @public
	 * @param {ElectricComponent} partner - the partner to remove
	 * @param {number} [terminal] - the terminal to remove it from
	 * @returns {boolean} whether the partner was there
	 */
	public detach(partner: ElectricComponent, terminal?: number): boolean {
		const terminals = terminal === undefined
			? this._connections.map((_, index) => index)
			: [terminal];
		for (const index of terminals) {
			const list = this._connections[index];
			if (!list) continue;
			const at = list.indexOf(partner);
			if (at < 0) continue;
			list.splice(at, 1);
			return true;
		}
		return false;
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
		const slot = terminal !== undefined && this.hasRoom(terminal) ? terminal : this.preferredTerminal();
		const partnerSlot = nComposite.preferredTerminal();
		if (slot < 0 || partnerSlot < 0) {
			return "Mindestens eine Komponente hat keine Ein/Ausgänge mehr.";
		}
		this.attach(nComposite, slot);
		nComposite.attach(this, partnerSlot);
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
		if (!this.detach(rComposite)) return "Die gewählten Komponenten sind nicht verbunden.";
		rComposite.detach(this);
		return "";
	}

	/**
	 * The kind of plug a terminal of this device takes. An instrument offers
	 * binding posts, a metal strip is clamped by a crocodile clip, and a
	 * reference electrode carries a pin like an instrument does.
	 *
	 * @public
	 * @param {number} terminal - the terminal index
	 * @returns {(TerminalSocket | undefined)} the socket, or undefined for a device without terminals
	 */
	public socketAt(terminal: number): TerminalSocket | undefined {
		if (!(terminal >= 0) || terminal >= this._conCount) return undefined;
		switch (this._type) {
			case EComponentType.Source:
			case EComponentType.Voltmeter:
			case EComponentType.Ammeter:
			case EComponentType.Multimeter:
				return "banana";
			case EComponentType.Electrode:
				return this._reference === undefined ? "clip" : "banana";
			default:
				return undefined;
		}
	}

	/**
	 * The resistance the device brings into the circuit, in Ω. A lead is a
	 * wire, a voltmeter is a high-impedance load, an ammeter is a shunt, and a
	 * supply has the internal resistance of its output stage. An electrode is
	 * a terminal of the cell rather than an element of the external circuit,
	 * so it has none of its own.
	 *
	 * @readonly
	 * @type {number}
	 */
	get resistance(): number {
		switch (this._type) {
			case EComponentType.Cable:
				return CABLE_RESISTANCE;
			case EComponentType.Voltmeter:
				return VOLTMETER_RESISTANCE;
			case EComponentType.Ammeter:
				return AMMETER_RESISTANCE;
			case EComponentType.Multimeter:
				// The mode decides what the meter does to the circuit, not only
				// what it shows: a voltmeter is a load, an ammeter a shunt.
				return this._meterMode === "voltage" ? VOLTMETER_RESISTANCE : AMMETER_RESISTANCE;
			case EComponentType.Source:
				return SOURCE_RESISTANCE;
			default:
				return Infinity;
		}
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
