import { EComponentType, ElectricComponent } from "./ElectricComponent";

/**
 * One two-terminal device of the network between the two electrodes, with the
 * resistance it brings and the EMF it drives.
 *
 * @export
 * @interface CircuitElement
 */
export interface CircuitElement {
	/**
	 * The device the element stands for, or undefined for the cell branch that
	 * {@link circuitReadings} adds while the cell is open.
	 */
	device?: ElectricComponent;
	/** Node of the device's first terminal. */
	a: number;
	/** Node of the device's second terminal. */
	b: number;
	/** Resistance in Ω. */
	resistance: number;
	/** EMF in V from `a` to `b`; positive raises `a` above `b`. */
	emf: number;
}

/**
 * The devices of a circuit, reduced to the nodes and elements of a linear
 * network.
 *
 * A lab circuit is not a single loop. A voltmeter sits across the cell while
 * the supply drives it, an ammeter sits in series with the supply, and a
 * second meter may hang on the same posts. Each device therefore has to be
 * read where it actually is, which needs the network and not only the loop.
 * The cell itself is not part of it: it is the branch between the two
 * electrode nodes, and {@link circuitReadings} adds it once its current is
 * known.
 *
 * A network without electrodes is a supply wired straight into a meter. It
 * has no cell, so `first` and `second` are -1 and the elements' own EMFs are
 * the only thing that drives it.
 *
 * @export
 * @interface CircuitNetwork
 */
export interface CircuitNetwork {
	/** Node of the first electrode, or -1 when the network carries no cell. */
	first: number;
	/** Node of the second electrode, or -1 when the network carries no cell. */
	second: number;
	/** Node held at zero volts. */
	ground: number;
	/** Number of nodes. */
	nodes: number;
	/** The elements between them. */
	elements: CircuitElement[];
}

/**
 * What one device reads: the voltage across it and the current through it,
 * both taken from its own first terminal towards its second.
 *
 * @export
 * @interface CircuitReading
 */
export interface CircuitReading {
	/** Voltage across the device in V. */
	voltage: number;
	/** Current through the device in A. */
	current: number;
}

/**
 * Solves `matrix · x = rhs` by Gaussian elimination with partial pivoting.
 * The matrices here have one row per node of a lab circuit, so the cubic cost
 * is irrelevant and the plain algorithm is the clearest one.
 *
 * @private
 * @param {number[][]} matrix - the coefficients
 * @param {number[]} rhs - the right-hand side
 * @returns {(number[] | undefined)} the solution, or undefined when the system is singular
 */
function solveLinear(matrix: number[][], rhs: number[]): number[] | undefined {
	const size = rhs.length;
	const rows = matrix.map((row, index) => [...row, rhs[index]]);
	for (let column = 0; column < size; column++) {
		let pivot = column;
		for (let row = column + 1; row < size; row++) {
			if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
		}
		if (!(Math.abs(rows[pivot][column]) > 1e-18)) return undefined;
		if (pivot !== column) {
			const swap = rows[pivot];
			rows[pivot] = rows[column];
			rows[column] = swap;
		}
		const lead = rows[column][column];
		for (let row = column + 1; row < size; row++) {
			const factor = rows[row][column] / lead;
			if (factor === 0) continue;
			for (let k = column; k <= size; k++) rows[row][k] -= factor * rows[column][k];
		}
	}
	const solution = new Array<number>(size).fill(0);
	for (let row = size - 1; row >= 0; row--) {
		let sum = rows[row][size];
		for (let k = row + 1; k < size; k++) sum -= rows[row][k] * solution[k];
		solution[row] = sum / rows[row][row];
	}
	return solution;
}

/**
 * The node voltages of the network, with the network's ground node held at
 * zero. `injections` are currents pushed into a node in A; `withEmf` decides
 * whether the elements' own sources drive the network or are shorted out,
 * which is what the Thevenin resistance needs.
 *
 * @private
 * @param {CircuitNetwork} network - the network to solve
 * @param {Map<number, number>} injections - currents into a node in A
 * @param {boolean} withEmf - whether the elements' EMFs act
 * @param {CircuitElement} [extra] - one more element to include, for the cell branch
 * @returns {(number[] | undefined)} the voltage of every node, or undefined when the system is singular
 */
function nodeVoltages(
	network: CircuitNetwork,
	injections: Map<number, number>,
	withEmf: boolean,
	extra?: CircuitElement
): number[] | undefined {
	const ground = network.ground;
	const row = new Map<number, number>();
	for (let node = 0; node < network.nodes; node++) {
		if (node !== ground) row.set(node, row.size);
	}
	const size = row.size;
	const matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));
	const rhs = new Array<number>(size).fill(0);
	const add = (node: number, value: number): void => {
		const index = row.get(node);
		if (index !== undefined) rhs[index] += value;
	};
	const stamp = (element: CircuitElement): void => {
		const conductance = 1 / element.resistance;
		if (!Number.isFinite(conductance) || !(conductance > 0)) return;
		const a = row.get(element.a);
		const b = row.get(element.b);
		if (a !== undefined) matrix[a][a] += conductance;
		if (b !== undefined) matrix[b][b] += conductance;
		if (a !== undefined && b !== undefined) {
			matrix[a][b] -= conductance;
			matrix[b][a] -= conductance;
		}
		if (withEmf && element.emf) {
			add(element.a, conductance * element.emf);
			add(element.b, -conductance * element.emf);
		}
	};
	for (const element of network.elements) stamp(element);
	if (extra) stamp(extra);
	for (const [node, value] of injections) add(node, value);
	const solved = solveLinear(matrix, rhs);
	if (!solved) return undefined;
	const voltages = new Array<number>(network.nodes).fill(0);
	for (const [node, index] of row) voltages[node] = solved[index];
	return voltages;
}

/**
 * Builds the network of a set of devices.
 *
 * Every terminal of every device becomes a node, and a connection joins the
 * two terminals it sits between. A cable is therefore not a node of its own
 * but an element between the posts it is plugged into, which is what lets a
 * meter be read across itself.
 *
 * The elements start without an EMF: which way a source drives is a question
 * about the cell, so the caller sets it once it knows the cell's potentials.
 *
 * @export
 * @param {readonly ElectricComponent[]} devices - the devices of the circuit
 * @returns {(CircuitNetwork | undefined)} the network, or undefined when the devices are not wired together
 */
export function circuitNetwork(
	devices: readonly ElectricComponent[]
): CircuitNetwork | undefined {
	// The walk from the given devices reaches everything wired to them,
	// cables included: they are devices of their own since they became
	// placeable.
	const visited: ElectricComponent[] = [];
	for (const device of devices) {
		if (!visited.includes(device)) visited.push(device);
	}
	for (let cursor = 0; cursor < visited.length; cursor++) {
		for (const partner of visited[cursor].partners) {
			if (!visited.includes(partner)) visited.push(partner);
		}
	}
	for (const device of devices) {
		if (!visited.includes(device)) return undefined;
	}

	// One slot per terminal, joined wherever a connection sits between two of
	// them. The slots are merged with a union-find, so a chain of cables ends
	// up as one node however long it is.
	const slots = new Map<string, number>();
	const parent: number[] = [];
	const slotOf = (device: ElectricComponent, terminal: number): number => {
		const key = `${device._id}:${terminal}`;
		let index = slots.get(key);
		if (index === undefined) {
			index = slots.size;
			slots.set(key, index);
			parent.push(index);
		}
		return index;
	};
	const find = (index: number): number => {
		let root = index;
		while (parent[root] !== root) root = parent[root];
		while (parent[index] !== root) {
			const next = parent[index];
			parent[index] = root;
			index = next;
		}
		return root;
	};
	const join = (a: number, b: number): void => {
		const rootA = find(a);
		const rootB = find(b);
		if (rootA !== rootB) parent[rootB] = rootA;
	};
	for (const device of visited) {
		for (let terminal = 0; terminal < device._conCount; terminal++) slotOf(device, terminal);
	}
	for (const device of visited) {
		for (let terminal = 0; terminal < device._conCount; terminal++) {
			for (const partner of device._connections[terminal]) {
				const back = partner.terminalsOf(device);
				for (const other of back) join(slotOf(device, terminal), slotOf(partner, other));
			}
		}
	}
	// A device that is not an element of the circuit is a piece of metal: the
	// strip of an electrode, the legs of a bridge. Its terminals are the same
	// conductor, so two leads on one strip meet each other.
	for (const device of visited) {
		if (Number.isFinite(device.resistance)) continue;
		for (let terminal = 1; terminal < device._conCount; terminal++) {
			join(slotOf(device, 0), slotOf(device, terminal));
		}
	}

	// The roots are the nodes, numbered in the order they first appear.
	const nodes = new Map<number, number>();
	const nodeOf = (device: ElectricComponent, terminal: number): number => {
		const root = find(slotOf(device, terminal));
		let index = nodes.get(root);
		if (index === undefined) {
			index = nodes.size;
			nodes.set(root, index);
		}
		return index;
	};
	const elements: CircuitElement[] = [];
	for (const device of visited) {
		if (device._conCount !== 2) continue;
		const resistance = device.resistance;
		if (!Number.isFinite(resistance) || !(resistance > 0)) continue;
		const a = nodeOf(device, 0);
		const b = nodeOf(device, 1);
		// A device whose two terminals sit on the same node is shorted out by
		// its own wiring, so it carries nothing and drops nothing.
		if (a === b) continue;
		elements.push({ device, a, b, resistance, emf: 0 });
	}
	const electrodes = visited.filter((device) => device._type === EComponentType.Electrode);
	const first = electrodes[0] ? nodeOf(electrodes[0], 0) : -1;
	const second = electrodes[1] ? nodeOf(electrodes[1], 0) : -1;
	return {
		first,
		second,
		// A network without a cell still needs a reference, and the first
		// node is as good as any: only differences are ever read.
		ground: second >= 0 ? second : 0,
		nodes: nodes.size,
		elements,
	};
}

/**
 * The Thevenin equivalent of the network between the two electrodes: the
 * voltage it holds when nothing flows and the resistance it presents.
 *
 * The cell is solved against this pair instead of against a fixed series
 * resistance, so a voltmeter in series with the supply really does stop the
 * current, and one across the cell really does read the cell.
 *
 * @export
 * @param {CircuitNetwork} network - the network to reduce
 * @returns {({ voltage: number; resistance: number } | undefined)} the open-circuit voltage in V and the resistance in Ω
 */
export function circuitThevenin(
	network: CircuitNetwork
): { voltage: number; resistance: number } | undefined {
	if (network.first < 0 || network.second < 0) return undefined;
	const open = nodeVoltages(network, new Map(), true);
	if (!open) return undefined;
	const driven = new Map<number, number>([[network.first, 1], [network.second, -1]]);
	const loaded = nodeVoltages(network, driven, false);
	if (!loaded) return undefined;
	return {
		voltage: open[network.first] - open[network.second],
		resistance: loaded[network.first] - loaded[network.second],
	};
}

/**
 * The voltage across and the current through every device of the network,
 * once the cell between the two electrodes carries `current`.
 *
 * The cell drives the network with the current it carries, so one nodal solve
 * gives every reading. A cell that carries nothing is open instead: its EMF
 * is then the branch that drives the network, which is what a voltmeter
 * across an idle cell reads.
 *
 * Without a cell the elements' own EMFs are the only drive, which is what a
 * supply wired straight into a meter needs.
 *
 * @export
 * @param {CircuitNetwork} network - the network to read
 * @param {{ emf: number; resistance: number; current: number; open: boolean }} [cell] - the cell's voltage in V, its electrolyte resistance in Ω, the current it carries in A, and whether it is open
 * @returns {(Map<ElectricComponent, CircuitReading> | undefined)} the reading of each device, or undefined when the system is singular
 */
export function circuitReadings(
	network: CircuitNetwork,
	cell?: { emf: number; resistance: number; current: number; open: boolean }
): Map<ElectricComponent, CircuitReading> | undefined {
	const injections = new Map<number, number>();
	let branch: CircuitElement | undefined;
	if (cell?.open) {
		if (Number.isFinite(cell.emf)) {
			branch = {
				a: network.first, b: network.second,
				resistance: cell.resistance > 0 ? cell.resistance : 1,
				emf: cell.emf,
			};
		}
	} else if (cell) {
		// The cell's current leaves it at the second electrode and returns at
		// the first, so that is how it enters the network.
		injections.set(network.first, -cell.current);
		injections.set(network.second, cell.current);
	}
	const voltages = nodeVoltages(network, injections, true, branch);
	if (!voltages) return undefined;
	const readings = new Map<ElectricComponent, CircuitReading>();
	for (const element of network.elements) {
		if (!element.device) continue;
		const voltage = voltages[element.a] - voltages[element.b];
		readings.set(element.device, {
			voltage,
			current: (voltage - element.emf) / element.resistance,
		});
	}
	return readings;
}
