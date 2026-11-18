import type { ReactiveController } from "lit";
import type { Ticker } from "pixi.js";
import { Simulation } from "../chemlib";

import type { ChemLab } from "../webwriter-chemlab";

type FrameTask = (elapsedMs: number) => void;

function isExperimentTask(name: string): boolean {
	return name.startsWith("transfer") || name.startsWith("echem");
}

export class SimulationController implements ReactiveController {
	private tasks = new Map<string, { startedAt: number; step: FrameTask }>();
	private flushViews?: () => void;
	private renderPending = false;

	constructor(private host: ChemLab) {
		host.addController(this);
	}

	hostConnected(): void {
		this.requestRender();
	}

	hostDisconnected(): void {
		this.host.app?.stop();
	}

	startLoop(flushViews: () => void): void {
		this.flushViews = flushViews;
		const { app } = this.host;
		app.ticker.remove(app.render, app);
		app.ticker.add(this.tick);
		this.requestRender();
	}

	requestRender(): void {
		this.renderPending = true;
		this.wake();
	}

	private wake(): void {
		if (this.flushViews && this.host.isConnected) this.host.app.start();
	}

	private tick = (ticker: Ticker): void => {
		// A suspended tab or long frame must not replay an unbounded backlog.
		const frameTime = ticker.lastTime + ticker.elapsedMS;
		for (const task of this.tasks.values()) {
			const elapsedMs = Math.min(ticker.elapsedMS, 250, frameTime - task.startedAt);
			if (elapsedMs > 0) task.step(elapsedMs);
		}

		if (this.renderPending) {
			this.flushViews();
			this.renderPending = false;
			this.host.app.render();
		}
		if (!this.tasks.size && !this.renderPending) this.host.app.stop();
	};

	startTask(name: string, step: FrameTask): void {
		this.tasks.set(name, { startedAt: performance.now(), step });
		this.wake();
	}

	startExperiment(
		name: string,
		step: () => void,
		live?: (elapsedMs: number) => boolean
	): void {
		let remainingMs = 0;
		this.startTask(name, (elapsedMs) => {
			if (live?.(elapsedMs)) {
				remainingMs = 0;
				return;
			}
			const stepMs = Simulation._simTimeStep * 1000;
			if (!Number.isFinite(stepMs) || stepMs <= 0) return;
			remainingMs = Math.min(remainingMs + elapsedMs, 8 * stepMs);
			while (remainingMs >= stepMs && this.hasTask(name)) {
				remainingMs -= stepMs;
				step();
			}
		});
		live?.(0);
		this.host.collectDiagramSuggestions();
		this.host.requestUpdate();
	}

	get hasRunningExperiments(): boolean {
		for (const name of this.tasks.keys()) {
			if (isExperimentTask(name)) return true;
		}
		return false;
	}

	hasTask(name: string): boolean {
		return this.tasks.has(name);
	}

	stopTask(name: string): void {
		if (this.tasks.delete(name) && isExperimentTask(name)) this.host.requestUpdate();
	}

	stopExperiments(): void {
		for (const name of this.tasks.keys()) {
			if (isExperimentTask(name)) this.stopTask(name);
		}
	}
}
