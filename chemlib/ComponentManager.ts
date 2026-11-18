import { EComponentType, ElectricComponent } from "./ElectricComponent";
import { ChemComponent, ComponentType } from "./ChemComponent";
import { Mixture } from "./Mixture";
import { Molecule } from "./Molecule";

/**
 * An abstact managing class for all components
 *
 * @export
 * @abstract
 * @class ComponentManager
 * @typedef {ComponentManager}
 */
export abstract class ComponentManager {
	/**
	 * the number of the current {@link ChemComponent} objects minus one
	 *
	 * @static
	 * @type {number}
	 */
	static _chemComponentCount: number = 0;
	/**
	 * The standard volumes of all chemComponents in mL
	 *
	 * @type {object}
	 */
	static _standardVolumes: object = {
		testtube: 10,
		beaker: 400,
		flask: 250,
		burette: 25,
		separatingfunnel: 250,
		Condenser: 1000
	};
	/**
	 * the number of the current {@link ElectricComponent} objects minus one
	 *
	 * @static
	 * @type {number}
	 */
	static _electricComponentCount: number = 0;

	/**
	 * Generates and returns an new {@link ChemComponent} object with an id representing the next value of the chem component count
	 *
	 * @public
	 * @static
	 * @param {ComponentType} nType - the type of the component from {@link ComponentType}: Testtube, Beaker, Flask, Condenser, Separatingfunnel, Burette
	 * @param {?Mixture} [nMixture] - a possible initial {@link Mixture} object as the content
	 * @returns {ChemComponent}
	 */
	public static newChemComponent(
		nType: ComponentType,
		nMixture?: Mixture
	): ChemComponent {
		this._chemComponentCount += 1;
		return new ChemComponent(this._chemComponentCount+this._electricComponentCount-1, nType, nMixture);
	}
	/**
	 * Generates and returns an new {@link ElectricComponent} object with an id representing the next value of the electric component count
	 *
	 * @public
	 * @static
	 * @param {EComponentType} nType - the type of the component from {@link EComponentType}: Electrode, Cable, Source, Voltmeter
	 * @param {{
	 * 			nMixture?: Mixture;
	 * 			nMaterial?: Molecule;
	 * 			nSourceVoltage?: number;
	 * 		}} [param0={}] - json object containing all possible parameters. Each can be set specifically or left empty
	 * @param {Mixture} param0.nMixture - for electrodes: The possible initially connected solution
	 * @param {Molecule} param0.nMaterial - for electrodes: The electrodes material, molecule should be neutral
	 * @param {number} param0.nSourceVoltage - for voltage sources: The source voltage
	 * @param {number} param0.nSourceCurrent - for voltage sources: The source current
	 * @returns {ElectricComponent}
	 */
	public static newElectricComponent(
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
	): ElectricComponent {
		this._electricComponentCount += 1;
		return new ElectricComponent(this._electricComponentCount+this._chemComponentCount-1, nType, {
			nMixture: nMixture,
			nMaterial: nMaterial,
			nSourceVoltage: nSourceVoltage,
			nSourceCurrent: nSourceCurrent,
		});
	}

	/**
	 * Every device wired to the given one, the device itself included.
	 *
	 * A circuit branches: a voltmeter may hang on the same post as the
	 * supply, and a lead that is plugged in at one end only ends in nothing.
	 * A walk that follows a single branch and stops at its end would miss
	 * the other one, so every reached device is kept and the search
	 * continues from each of them.
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} device - the device to start from
	 * @returns {ElectricComponent[]}
	 */
	public static connectedDevices(device: ElectricComponent): ElectricComponent[] {
		const visited: ElectricComponent[] = [device];
		for (let cursor = 0; cursor < visited.length; cursor++) {
			for (const partner of visited[cursor].partners) {
				if (!visited.includes(partner)) visited.push(partner);
			}
		}
		return visited;
	}

	/**
	 * returns whether two objects are electrically connected
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} component1 - the first object
	 * @param {ElectricComponent} component2 - the second object
	 * @returns {boolean}
	 */
	public static isConnected(
		component1: ElectricComponent,
		component2: ElectricComponent
	): boolean {
		if (component1 === component2) return true;
		return this.connectedDevices(component1).includes(component2);
	}

	/**
	 * The electrode that sits on one pole of a device, following the cables
	 * from that terminal. A source has two poles, and which electrode hangs on
	 * which pole is what gives the cell its direction.
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} device - the device whose terminal to follow
	 * @param {number} terminal - index of the terminal in `_connections`
	 * @returns {(ElectricComponent | undefined)}
	 */
	public static terminalElectrode(
		device: ElectricComponent,
		terminal: number
	): ElectricComponent | undefined {
		const starts = device._connections[terminal] ?? [];
		if (!starts.length) return undefined;
		const visited: ElectricComponent[] = [device];
		const queue: ElectricComponent[] = [...starts];
		while (queue.length > 0) {
			const current: ElectricComponent = queue.shift();
			if (visited.includes(current)) continue;
			visited.push(current);
			if (current._type === EComponentType.Electrode) return current;
			// Only cables are transparent: anything else ends the branch.
			if (current._type !== EComponentType.Cable) continue;
			queue.push(...current.partners);
		}
		return undefined;
	}

	/**
	 * checks if a complete circuit is available
	 *
	 * @public
	 * @static
	 * @param {ElectricComponent} testComponent - an object from the circuit
	 * @returns {ElectricComponent[]}
	 */
	public static isCircuit(
		testComponent: ElectricComponent
	): ElectricComponent[] {
		const visited = this.connectedDevices(testComponent);

		// A cell needs two electrodes that carry its current and at least one
		// device between them. An ammeter in series adds a second device, so
		// the count is not fixed: the pair comes first, the devices follow.
		const electrodes: ElectricComponent[] = [];
		const devices: ElectricComponent[] = [];
		visited.forEach((component) => {
			if (component._type === EComponentType.Electrode) {
				electrodes.unshift(component);
			}
			if (
				component._type === EComponentType.Source ||
				component._type === EComponentType.Voltmeter ||
				component._type === EComponentType.Ammeter ||
				component._type === EComponentType.Multimeter
			) {
				devices.push(component);
			}
		});

		// A reference electrode senses the potential of the cell instead of
		// carrying its current, so it is not part of the pair that does. A
		// third electrode that is a reference therefore leaves the cell intact
		// and follows the pair, where the simulation treats it as a sensor.
		// More than two reacting electrodes still describe no single cell.
		const carrying = electrodes.filter((electrode) => electrode._reference === undefined);
		const sensing = electrodes.filter((electrode) => electrode._reference !== undefined);
		if (carrying.length > 2) return [];
		const pair = [...carrying, ...sensing].slice(0, 2);

		if (pair.length === 2 && devices.length > 0) {
			return [
				...pair,
				...electrodes.filter((electrode) => !pair.includes(electrode)),
				...devices,
			];
		}

		return [];
	}
}
