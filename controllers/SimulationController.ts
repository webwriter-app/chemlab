import { ReactiveController } from "lit";

import type { ChemLab } from "../webwriter-chemlab";

/**
 * Owns the widget's simulation ticker system: the list of active per-frame
 * update functions, their registration/removal, and the PixiJS ticker loop
 * that drives them.
 *
 * The individual tick functions themselves currently live on the host, since
 * they are tightly coupled to the Pixi canvas (sprite lookup, textures, cable
 * geometry). This controller schedules and runs them — always with the host as
 * `this` — and wires up diagram creation for titration / e-chem experiments.
 *
 * @implements {ReactiveController}
 */
export class SimulationController implements ReactiveController {
	private host: ChemLab;

	/**
	 * Registered ticker entries, each `[name, fn, args]`. `fn` is invoked with
	 * the host as its `this` on every frame.
	 */
	tickerFunctionList: Array<any> = [];

	constructor(host: ChemLab) {
		this.host = host;
		host.addController(this);
	}

	/** No reactive lifecycle work; the loop is driven by the Pixi ticker. */
	hostConnected(): void {}

	/**
	 * Registers the per-frame loop on the host's PixiJS ticker. Must be called
	 * once the Pixi application exists (after canvas init).
	 */
	public startLoop(): void {
		this.host.app.ticker.add(() => {
			let indexCount: number = 0;
			while (typeof this.tickerFunctionList[indexCount] != "undefined") {
				this.tickerFunctionList[indexCount][1].apply(
					this.host,
					this.tickerFunctionList[indexCount][2]
				);
				indexCount += 1;
			}
		});
	}

	/**
	 * Adds a function to the ticker list and, for titration / e-chem
	 * experiments, creates the corresponding diagram.
	 *
	 * @param name - unique name of the ticker function
	 * @param fn - the function reference (invoked with the host as `this`)
	 * @param args - additional arguments passed on each tick
	 */
	public pushTickerFunction(
		name: string,
		fn: Function,
		args: Array<any>
	): void {
		this.tickerFunctionList.push([name, fn, args]);
		this.host.tickerTimeObj[name] = 0;
		// console.log(this.host.tickerTimeObj);
		if (name.includes("transfer") || name.includes("echem")) {
			this.host.diagrams.createDiagram(name, args);
		}
	}

	/**
	 * Removes a function from the ticker list.
	 *
	 * @param name - the name of the function to remove
	 */
	public remTickerFunction(name: string): void {
		let toRemove: number = -1;
		for (let i = 0; i < this.tickerFunctionList.length; i++) {
			if (this.tickerFunctionList[i][0] === name) {
				toRemove = i;
			}
		}
		if (toRemove > -1) {
			this.tickerFunctionList.splice(toRemove, 1);
		}
	}
}
