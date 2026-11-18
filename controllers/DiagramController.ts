import { html, nothing, type ReactiveController } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";
import Chart from "chart.js/auto";
import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import { diagramData, type AxisRange, type AxisRanges, type ChartAxis } from "../data/diagramRanges";
import { TIME_CHANNEL, type MeasurementChannel } from "../data/measurementHistory";
import { axisId, componentKey, type DiagramAxis } from "../data/diagramSources";
import type { ChemLab } from "../webwriter-chemlab";

type Diagram = {
	id: number;
	x: DiagramAxis;
	y: DiagramAxis;
	card: Ref<HTMLElement>;
	title?: string;
	canvas: Ref<HTMLCanvasElement>;
	fitted?: AxisRanges;
	zoom: Partial<AxisRanges>;
	editor?: { axis: ChartAxis; range: AxisRange };
	chart?: Chart<"line", { x: number; y: number | null }[]>;
};

/** Owns the plots and their references to the shared recording. */
export class DiagramController implements ReactiveController {
	private readonly diagrams: Diagram[] = [];
	private nextId = 1;
	private frame?: number;
	private viewport?: IntersectionObserver;
	private readonly visible = new Set<Element>();
	private readonly observed = new Set<Element>();
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
		if (!this.host.isDiagramPanelOpen) {
			if (this.viewport) this.releaseViewport();
			return;
		}
		this.viewport ??= new IntersectionObserver(entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) this.visible.add(entry.target);
				else this.visible.delete(entry.target);
			}
			this.invalidate();
		}, { root: this.host.shadowRoot.querySelector("#inlineDiagramPanel") });
		for (const { card } of this.diagrams) {
			if (!card.value || this.observed.has(card.value)) continue;
			this.observed.add(card.value);
			this.viewport.observe(card.value);
		}
		this.schedule();
	}

	hostDisconnected(): void {
		this.host.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);
		this.frame = undefined;
		this.releaseViewport();
	}

	private releaseViewport(): void {
		this.host.clearDiagramSourceHighlight();
		this.viewport?.disconnect();
		this.viewport = undefined;
		this.visible.clear();
		this.observed.clear();
		for (const diagram of this.diagrams) {
			diagram.chart?.destroy();
			diagram.chart = undefined;
		}
		this.dirty = true;
	}

	updateLabels(): void {
		this.invalidate();
	}

	toggleShowLine(): void {
		this.showLine = !this.showLine;
		this.invalidate();
	}

	label(axis: DiagramAxis): string {
		const message = this.host.message;
		if (axis === TIME_CHANNEL) return message("Zeit") + " [s]";
		return `${this.objectLabel(axis)} · ${this.measurementLabel(axis)}`;
	}

	objectLabel(channel: MeasurementChannel): string {
		return `${this.host.itemName(channel.component)} ${channel.number}`;
	}

	measurementLabel(channel: MeasurementChannel): string {
		const quantity = this.host.message(channel.quantity);
		const species = channel.species ? " · " + channel.species : "";
		const unit = channel.unit ? " [" + channel.unit + "]" : "";
		return quantity + species + unit;
	}

	hasPair(x: DiagramAxis, y: DiagramAxis): boolean {
		return this.diagrams.some(diagram => axisId(diagram.x) === axisId(x) && axisId(diagram.y) === axisId(y));
	}

	create(x: DiagramAxis, y: DiagramAxis, title?: string): void {
		const id = this.nextId++;
		const history = this.host.measurements.history;
		history.prune();
		history.retain(axisId(x), axisId(y));
		this.diagrams.push({ id, x, y, title, card: createRef(), canvas: createRef(), zoom: {} });
		this.host.requestUpdate();
		this.host.reportXApi("created", "diagram-" + id);
		this.invalidate();
	}

	private remove(diagram: Diagram): void {
		this.host.clearDiagramSourceHighlight();
		this.host.measurements.history.release(axisId(diagram.x), axisId(diagram.y));
		this.diagrams.splice(this.diagrams.indexOf(diagram), 1);
		if (diagram.card.value) {
			this.viewport?.unobserve(diagram.card.value);
			this.observed.delete(diagram.card.value);
			this.visible.delete(diagram.card.value);
		}
		diagram.chart?.destroy();
		if (!this.hasDiagrams) this.host.closeDiagramPanel();
		this.host.requestUpdate();
		this.host.reportXApi("removed", "diagram-" + diagram.id);
	}

	renderCards() {
		const message = this.host.message;
		return html`<div class="diagram-cards">
			${repeat(this.diagrams, diagram => diagram.id, diagram => {
				const title = diagram.title ? message(diagram.title) : message("Diagramm {number}", { number: diagram.id });
				const x = this.label(diagram.x);
				const y = this.label(diagram.y);
				return html`
					<section class="diagram-card" aria-label=${title} ${ref(diagram.card)}>
						<div class="diagram-heading">
							<sl-tag class="diagram-section-tag" variant="primary" size="small">${title}</sl-tag>
							<sl-button class="diagram-control diagram-remove" size="small" aria-label=${message("Diagramm löschen")}
								title=${message("Diagramm löschen")} @click=${() => this.remove(diagram)}>
								<span class="panel-button-label">${message("Diagramm löschen")}</span>
								<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor">
									<path d="M2.5 1a1 1 0 0 0-1 1v2H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h1.5V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 5.5 5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m2.5.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/>
								</svg>
							</sl-button>
						</div>
						<div class="diagram-plot">
							<canvas role="img" aria-label=${`${title} · Y: ${y} · X: ${x}`} ${ref(diagram.canvas)}></canvas>
						</div>
						${this.renderRangeControls(diagram)}
						${this.renderSources(diagram)}
					</section>`;
			})}
		</div>`;
	}

	private renderRangeControls(diagram: Diagram) {
		const message = this.host.message;
		const editor = diagram.editor;
		const edit = (axis: ChartAxis) => {
			const range = diagram.zoom[axis] ?? diagram.fitted?.[axis];
			diagram.editor = range && editor?.axis !== axis ? { axis, range } : undefined;
			this.host.requestUpdate();
		};
		const setRange = (axis: ChartAxis, range?: AxisRange) => {
			diagram.zoom[axis] = range;
			diagram.editor = undefined;
			this.host.requestUpdate();
			this.invalidate();
			diagram.card.value?.querySelector<HTMLElement>(`[data-range-axis="${axis}"]`)?.focus({ preventScroll: true });
		};
		return html`
			<div class="diagram-range-buttons">
				${(["x", "y"] as const).map(axis => html`
					<sl-button size="small" data-range-axis=${axis} ?disabled=${!diagram.fitted}
						variant=${diagram.zoom[axis] ? "primary" : "default"}
						aria-expanded=${String(editor?.axis === axis)}
						@click=${() => edit(axis)}>${message(axis === "x" ? "X-Bereich" : "Y-Bereich")}</sl-button>`)}
			</div>
			${editor ? keyed(editor, html`
				<form class="diagram-range-editor" aria-label=${message(editor.axis === "x" ? "X-Bereich" : "Y-Bereich")}
					@sl-input=${(event: Event) => {
						(event.currentTarget as HTMLFormElement).querySelector<SlInput>('[name="max"]').setCustomValidity("");
					}}
					@submit=${(event: SubmitEvent) => {
						event.preventDefault();
						const form = event.currentTarget as HTMLFormElement;
						const min = form.querySelector<SlInput>('[name="min"]').valueAsNumber;
						const upper = form.querySelector<SlInput>('[name="max"]');
						const max = upper.valueAsNumber;
						if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) {
							upper.setCustomValidity(message("Der obere Wert muss größer als der untere sein."));
							upper.reportValidity();
							return;
						}
						setRange(editor.axis, { min, max });
					}}>
					<div class="diagram-range-fields">
						<sl-input size="small" name="min" type="number" step="any" required contenteditable="false"
							label=${message("Von")} .value=${String(editor.range.min)}></sl-input>
						<sl-input size="small" name="max" type="number" step="any" required contenteditable="false"
							label=${message("Bis")} .value=${String(editor.range.max)}></sl-input>
					</div>
					<div class="diagram-range-buttons">
						<sl-button size="small" type="submit" variant="primary">${message("Anwenden")}</sl-button>
						<sl-button size="small" ?disabled=${!diagram.zoom[editor.axis]}
							@click=${() => setRange(editor.axis)}>${message("Automatisch")}</sl-button>
					</div>
				</form>`) : nothing}`;
	}

	private renderSources({ x, y }: Diagram) {
		const sources = new Map<string, MeasurementChannel>();
		for (const axis of [y, x]) {
			if (axis !== TIME_CHANNEL) sources.set(componentKey(axis), axis);
		}
		if (!sources.size) return nothing;
		return html`<div class="diagram-sources">
			${repeat(sources, ([key]) => key, ([key, source]) => {
				const name = this.objectLabel(source);
				if (!this.host.hasDiagramSource(key)) return html`<sl-tag size="small" variant="neutral">${name}</sl-tag>`;
				const highlight = (active: boolean) => this.host.highlightDiagramSource(key, active);
				return html`
					<button type="button" class="diagram-source" title=${this.host.message("Zu {name} springen", { name })}
						@pointerenter=${() => highlight(true)}
						@pointerleave=${(event: PointerEvent) => {
							if (!(event.currentTarget as HTMLElement).matches(":focus-visible")) highlight(false);
						}}
						@focus=${(event: FocusEvent) => {
							if ((event.currentTarget as HTMLElement).matches(":focus-visible")) highlight(true);
						}}
						@blur=${(event: FocusEvent) => {
							if (!(event.currentTarget as HTMLElement).matches(":hover")) highlight(false);
						}}
						@click=${() => this.host.centerDiagramSource(key)}>
						<sl-tag size="small" variant="neutral">${name}</sl-tag>
					</button>`;
			})}
		</div>`;
	}

	private scaleLabel(axis: DiagramAxis): string {
		return axis === TIME_CHANNEL ? this.label(axis) : this.measurementLabel(axis);
	}

	private createChart(canvas: HTMLCanvasElement, card: HTMLElement) {
		const style = getComputedStyle(card);
		const ink = style.color;
		const accent = style.getPropertyValue("--sl-color-primary-600").trim() || "#0284c7";
		const axisTitleColor = style.getPropertyValue("--sl-color-primary-800").trim() || "#075985";
		const grid = style.getPropertyValue("--sl-color-neutral-200").trim() || "#e5e7eb";
		const surface = style.getPropertyValue("--sl-color-neutral-0").trim() || "#fff";
		const font = { family: style.fontFamily, size: 11 };
		const scale = () => ({
			type: "linear" as const,
			bounds: "data" as const,
			ticks: { color: ink, font, maxTicksLimit: 6 },
			border: { color: grid },
			grid: { color: grid, tickLength: 3 },
			title: { color: axisTitleColor, font: { ...font, weight: "bold" as const }, display: true, text: "" },
		});
		return new Chart<"line", { x: number; y: number | null }[]>(canvas, {
			type: "line",
			data: { datasets: [{
				data: [], borderColor: accent, backgroundColor: accent, borderWidth: 1.6,
				pointRadius: 1.5, pointHoverRadius: 4, pointHitRadius: 4, spanGaps: false,
			}] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				layout: { padding: 4 },
				interaction: { mode: "nearest", intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: surface, titleColor: ink, bodyColor: ink, borderColor: grid,
						borderWidth: 1, cornerRadius: 4, padding: 6, displayColors: false,
						titleFont: font, bodyFont: font,
					},
				},
				scales: { x: scale(), y: scale() },
			},
		});
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
			const { card, canvas } = diagram;
			if (!this.visible.has(card.value) || !canvas.value) continue;
			const chart = diagram.chart ??= this.createChart(canvas.value, card.value);
			const points = this.host.measurements.history.points(axisId(diagram.x), axisId(diagram.y));
			const { data, ranges } = diagramData(points);
			if (Boolean(ranges) !== Boolean(diagram.fitted)) this.host.requestUpdate();
			diagram.fitted = ranges;
			const dataset = chart.data.datasets[0];
			dataset.data = data;
			dataset.showLine = this.showLine;
			// Give points on the fitted bounds room for their marker. A manually
			// zoomed axis clips exactly at its selected range.
			const xPadding = diagram.zoom.x ? 0 : 2;
			const yPadding = diagram.zoom.y ? 0 : 2;
			dataset.clip = { left: xPadding, right: xPadding, top: yPadding, bottom: yPadding };
			for (const axis of ["x", "y"] as const) {
				const options = chart.options.scales[axis];
				const range = diagram.zoom[axis] ?? ranges?.[axis];
				options.min = range?.min;
				options.max = range?.max;
				options.title.text = this.scaleLabel(diagram[axis]);
			}
			chart.update("none");
		}
	}
}
