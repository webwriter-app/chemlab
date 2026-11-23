import type { ElectricComponent } from "../chemlib";

/**
 * The scheduler a circuit clock runs on.
 *
 * {@link SimulationController} implements it; a test can drive the schedule by
 * hand with a clock that runs one fixed step per call.
 */
export interface CircuitClock {
	/**
	 * Registers a task that runs once per fixed simulation step.
	 *
	 * @param {string} name - task name of the clock
	 * @param {() => void} step - one simulation step of the circuit
	 */
	startFixedStepTask(name: string, step: () => void): void;
	/**
	 * Removes a task again.
	 *
	 * @param {string} name - task name of the clock
	 */
	stopTask(name: string): void;
}

/** One clock and the instruments that observe its circuit. */
interface CircuitRunner {
	/** Identity of the wiring this clock belongs to. */
	readonly identity: string;
	/** Task name of the clock. */
	readonly task: string;
	/** Instruments of the circuit at the last reconcile. */
	observers: ElectricComponent[];
}

/**
 * Advances every physical circuit once per simulation step.
 *
 * An instrument used to advance the circuit it hangs in, so a supply with a
 * parallel voltmeter solved the same cell twice per step and reacted twice as
 * fast. The instruments now only carry their activation marker; the circuit
 * owns one clock, and every instrument of that circuit shares it.
 */
export class CircuitSchedule {
	private readonly runners = new Map<string, CircuitRunner>();
	private sequence = 0;

	/**
	 * @param {CircuitClock} clock - the scheduler the clocks run on
	 * @param {() => Iterable<ElectricComponent>} observers - instruments that are switched on right now
	 * @param {(device: ElectricComponent) => (string | undefined)} identityOf - identity of the circuit a device is wired into
	 * @param {(device: ElectricComponent) => void} advance - advances one circuit by one simulation step
	 */
	constructor(
		private readonly clock: CircuitClock,
		private readonly observers: () => Iterable<ElectricComponent>,
		private readonly identityOf: (device: ElectricComponent) => string | undefined,
		private readonly advance: (device: ElectricComponent) => void,
	) {}

	/**
	 * Brings the clocks in line with the instruments that are switched on.
	 *
	 * Runs when an instrument starts or stops, when a lead or a bridge is
	 * placed, and before every step. A circuit that kept its identity keeps its
	 * clock, so a second instrument joins the phase the chemistry is already
	 * running in instead of restarting it.
	 */
	reconcile(): void {
		const groups = new Map<string, ElectricComponent[]>();
		for (const device of this.observers()) {
			const identity = this.identityOf(device);
			if (identity === undefined) continue;
			const group = groups.get(identity);
			if (group) group.push(device);
			else groups.set(identity, [device]);
		}
		// A circuit that was rewired, split up or switched off loses its clock.
		for (const runner of [...this.runners.values()]) {
			if (!groups.has(runner.identity)) this.close(runner);
		}
		for (const [identity, devices] of groups) {
			const runner = this.runners.get(identity);
			if (runner) {
				runner.observers = devices;
				continue;
			}
			const created: CircuitRunner = { identity, task: `echemCircuit${++this.sequence}`, observers: devices };
			this.runners.set(identity, created);
			this.clock.startFixedStepTask(created.task, () => this.step(created));
		}
	}

	/**
	 * Drops every clock. The layout the clocks belonged to is replaced, so the
	 * activation markers are gone with it.
	 */
	clear(): void {
		for (const runner of [...this.runners.values()]) this.close(runner);
	}

	/** Number of circuits that are advancing, for tracing and tests. */
	get clockCount(): number {
		return this.runners.size;
	}

	private close(runner: CircuitRunner): void {
		if (this.runners.get(runner.identity) === runner) this.runners.delete(runner.identity);
		this.clock.stopTask(runner.task);
	}

	private step(runner: CircuitRunner): void {
		// A stopped instrument, a removed device or a changed lead is picked up
		// before the solve, so a clock never advances a circuit that no longer
		// exists and a split never leaves one half without a clock.
		this.reconcile();
		if (this.runners.get(runner.identity) !== runner) return;
		const device = runner.observers[0];
		if (!device) return;
		this.advance(device);
	}
}
