import type { ReactiveController } from "lit";
import Chart from "chart.js/auto";
import { TIME_CHANNEL, type MeasurementChannel } from "../data/measurementHistory";
import type { ChemLab } from "../webwriter-chemlab";

export type DiagramAxis = typeof TIME_CHANNEL | MeasurementChannel;

type Diagram = {
	id: number;
	x: DiagramAxis;
	y: DiagramAxis;
	card: HTMLElement;
	title: HTMLElement;
	canvas: HTMLCanvasElement;
	chart?: Chart<"line", { x: number; y: number | null }[]>;
};

export function axisId(axis: DiagramAxis): string {
	return axis === TIME_CHANNEL ? axis : axis.id;
}

/** Owns the plots and their references to the shared recording. */
export class DiagramController implements ReactiveController {
	private readonly diagrams: Diagram[] = [];
	private nextId = 1;
	private frame?: number;
	private viewport?: IntersectionObserver;
	private readonly visible = new Set<Element>();
	private dirty = true;
	showLine = true;

	constructor(private readonly host: ChemLab) {
		host.addController(this);
		host.measurements.onChange = () => {
			this.invalidate();
			this.host.refreshDiagramPicker();
		};
	}

	get hasDiagrams(): boolean {
		return this.diagrams.length > 0;
	}

	hostUpdated(): void {
		if (this.host.isDiagramPanelOpen && !this.viewport) {
			this.viewport = new IntersectionObserver(entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) this.visible.add(entry.target);
					else this.visible.delete(entry.target);
				}
				this.invalidate();
			}, { root: this.host.canvasContainer.parentElement });
			for (const diagram of this.diagrams) this.viewport.observe(diagram.card);
		} else if (!this.host.isDiagramPanelOpen && this.viewport) {
			this.releaseViewport();
		}
		this.schedule();
	}

	hostDisconnected(): void {
		this.host.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);
		this.frame = undefined;
		this.releaseViewport();
	}

	private releaseViewport(): void {
		this.viewport?.disconnect();
		this.viewport = undefined;
		this.visible.clear();
		for (const diagram of this.diagrams) {
			diagram.chart?.destroy();
			diagram.chart = undefined;
		}
		this.dirty = true;
	}

	updateLabels(): void {
		for (const diagram of this.diagrams) this.updateTitle(diagram);
		this.invalidate();
	}

	toggleShowLine(): void {
		this.showLine = !this.showLine;
		this.invalidate();
	}

	label(axis: DiagramAxis): string {
		const message = this.host.message;
		if (axis === TIME_CHANNEL) return message("Zeit") + " [s]";
		const component = this.host.itemName(axis.component);
		const quantity = message(axis.quantity);
		const species = axis.species ? " · " + axis.species : "";
		const unit = axis.unit ? " [" + axis.unit + "]" : "";
		return `${component} ${axis.number} · ${quantity}${species}${unit}`;
	}

	create(x: DiagramAxis, y: DiagramAxis): void {
		const { ownerDocument: document, canvasContainer } = this.host;
		const id = this.nextId++;
		const card = document.createElement("section");
		card.className = "diagram-card";
		const heading = document.createElement("div");
		heading.className = "diagram-heading";
		const title = document.createElement("h4");
		const remove = document.createElement("button");
		remove.type = "button";
		const trash = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		trash.setAttribute("viewBox", "0 0 16 16");
		trash.setAttribute("aria-hidden", "true");
		const path = document.createElementNS(trash.namespaceURI, "path");
		path.setAttribute("fill", "currentColor");
		path.setAttribute("d", "M2.5 1a1 1 0 0 0-1 1v1v1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h1.5V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 5.5 5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m2.5.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z");
		trash.append(path);
		remove.append(trash);
		remove.addEventListener("click", () => this.remove(diagram));
		heading.append(title, remove);
		const plot = document.createElement("div");
		plot.className = "diagram-plot";
		const canvas = document.createElement("canvas");
		canvas.setAttribute("role", "img");
		plot.append(canvas);
		card.append(heading, plot);
		canvasContainer.append(card);

		const diagram: Diagram = { id, x, y, card, title, canvas };
		const history = this.host.measurements.history;
		history.prune();
		history.retain(axisId(x), axisId(y));
		this.diagrams.push(diagram);
		this.viewport?.observe(card);
		this.updateTitle(diagram);
		this.host.requestUpdate();
		this.host.reportXApi("created", "diagram-" + id);
		this.invalidate();
	}

	private remove(diagram: Diagram): void {
		this.host.measurements.history.release(axisId(diagram.x), axisId(diagram.y));
		this.diagrams.splice(this.diagrams.indexOf(diagram), 1);
		this.viewport?.unobserve(diagram.card);
		this.visible.delete(diagram.card);
		diagram.chart?.destroy();
		diagram.card.remove();
		if (!this.hasDiagrams) this.host.closeDiagramPanel();
		this.host.requestUpdate();
		this.host.reportXApi("removed", "diagram-" + diagram.id);
	}

	private updateTitle(diagram: Diagram): void {
		const title = this.host.message("Diagramm {number}", { number: diagram.id });
		diagram.title.textContent = title;
		diagram.canvas.setAttribute("aria-label", `${title} · ${this.label(diagram.y)} / ${this.label(diagram.x)}`);
		const remove = diagram.card.querySelector("button");
		const removeLabel = this.host.message("Diagramm löschen");
		remove.setAttribute("aria-label", removeLabel);
		remove.title = removeLabel;
	}

	private invalidate(): void {
		this.dirty = true;
		this.schedule();
	}

	private schedule(): void {
		if (!this.dirty || this.frame !== undefined || !this.host.isConnected || !this.host.isDiagramPanelOpen) return;
		this.frame = this.host.ownerDocument.defaultView?.requestAnimationFrame(() => {
			this.frame = undefined;
			if (!this.host.isDiagramPanelOpen) return;
			this.draw();
		});
	}

	private draw(): void {
		this.dirty = false;
		for (const diagram of this.diagrams) {
			if (!this.visible.has(diagram.card)) continue;
			const xLabel = this.label(diagram.x);
			const yLabel = this.label(diagram.y);
			const chart = diagram.chart ??= new Chart(diagram.canvas, {
				type: "line",
				data: { datasets: [{ data: [], borderWidth: 1.5, pointRadius: 1.5, spanGaps: false }] },
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: false,
					plugins: { legend: { display: false } },
					scales: {
						x: { type: "linear", title: { display: true, text: xLabel } },
						y: { type: "linear", title: { display: true, text: yLabel } },
					},
				},
			});
			const points = this.host.measurements.history.points(axisId(diagram.x), axisId(diagram.y));
			let latestX: number | undefined;
			const data: { x: number; y: number | null }[] = [];
			for (const point of points) {
				if (point.x !== null) latestX = point.x;
				if (latestX !== undefined) data.push({ x: latestX, y: point.x === null ? null : point.y });
			}
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].showLine = this.showLine;
			chart.options.scales.x.title.text = xLabel;
			chart.options.scales.y.title.text = yLabel;
			chart.update("none");
		}
	}
}
