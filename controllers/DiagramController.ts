import { html, nothing, type ReactiveController } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { axisTrimSelection, diagramData, moveTrimHandle, trimmedAxisRange, TRIM_STEPS,
	type AxisRange, type AxisRanges, type ChartAxis, type TrimHandle } from "../data/diagramRanges";
import { TIME_CHANNEL, type MeasurementChannel, type PlotPoint } from "../data/measurementHistory";
import { axisId, componentKey, type DiagramAxis } from "../data/diagramSources";
import { titrationMarkerKinds, titrationPoints, type TitrationMarkerKind } from "../data/titrationPoints";
import type { ChemLab } from "../webwriter-chemlab";
import { Chart } from "./diagramChart";

type AxisDrag = {
	pointer: number;
	startPixel: number;
	startStep: number;
	pixels: number;
	domain: AxisRange;
};

type DiagramPoint = { x: number; y: number | null; coarse?: true };

type Diagram = {
	id: number;
	x: DiagramAxis;
	y: DiagramAxis;
	card: Ref<HTMLElement>;
	title?: string;
	canvas: Ref<HTMLCanvasElement>;
	fitted?: AxisRanges;
	markerKinds?: TitrationMarkerKind[];
	zoom: Partial<AxisRanges>;
	trimDomain: Partial<AxisRanges>;
	drag: Partial<Record<ChartAxis, AxisDrag>>;
	chart?: Chart<"line", DiagramPoint[]>;
	viewRevision?: number;
	snapshot?: ReturnType<typeof diagramData> & { revision: number; points?: PlotPoint[] };
	markers?: { visible: boolean; doseTime?: number; series: DiagramPoint[][] };
};

const titrationMarkerStyles = {
	equivalence: { label: "Äquivalenzpunkt (geschätzt)", shape: "triangle", color: "warning" },
	neutral: { label: "Neutralpunkt (25 °C)", shape: "circle", color: "success" },
	"half-equivalence": { label: "Halbäquivalenzpunkt (geschätzt)", shape: "rectRot", color: "primary" },
} as const;

function titrationPhAxis({ x, y }: Diagram): ChartAxis | undefined {
	if (x === TIME_CHANNEL || y === TIME_CHANNEL) return undefined;
	const deliveredVolume = (axis: MeasurementChannel) => axis.component === "burette" && axis.quantity === "Abgegebenes Volumen";
	if (y.quantity === "pH" && deliveredVolume(x)) return "y";
	if (x.quantity === "pH" && deliveredVolume(y)) return "x";
	return undefined;
}

/** Owns the plots and their references to the shared recording. */
export class DiagramController implements ReactiveController {
	private readonly diagrams: Diagram[] = [];
	private nextId = 1;
	private frame?: number;
	private viewport?: IntersectionObserver;
	private readonly visible = new Set<Element>();
	private readonly observed = new Set<Element>();
	private dirty = true;
	private viewRevision = 0;
	private markersVisible = false;
	showLine = true;

	constructor(private readonly host: ChemLab) {
		host.addController(this);
		host.measurements.onChange = () => {
			this.requestDraw();
			this.host.refreshDiagramPicker();
		};
	}

	get hasDiagrams(): boolean {
		return this.diagrams.length > 0;
	}

	private get canSeeMarkers(): boolean {
		return this.host.canAuthor || this.host.showTitrationMarkers;
	}

	hostUpdated(): void {
		if (this.markersVisible !== this.canSeeMarkers) {
			this.markersVisible = this.canSeeMarkers;
			this.dirty = true;
			this.viewRevision++;
		}
		if (!this.host.isDiagramPanelOpen) {
			if (this.viewport) this.releaseViewport();
			return;
		}
		this.viewport ??= new IntersectionObserver(entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) this.visible.add(entry.target);
				else this.visible.delete(entry.target);
			}
			this.requestDraw();
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
			diagram.snapshot = undefined;
			diagram.markers = undefined;
			diagram.viewRevision = undefined;
			diagram.drag = {};
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
		this.diagrams.push({ id, x, y, title, card: createRef(), canvas: createRef(), zoom: {}, trimDomain: {}, drag: {} });
		this.host.requestUpdate();
		this.host.reportXApi("created", "diagram-" + id);
		this.requestDraw();
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
							${diagram.fitted ? html`${this.renderTrimTrack(diagram, "x")}${this.renderTrimTrack(diagram, "y")}` : nothing}
						</div>
						${this.canSeeMarkers && diagram.markerKinds?.length ? html`
							<div class="diagram-marker-legend">
								${diagram.markerKinds.map(kind => html`
									<span><i class=${"diagram-marker diagram-marker-" + kind} aria-hidden="true"></i>
										${message(titrationMarkerStyles[kind].label)}</span>`)}
							</div>` : nothing}
						${this.renderSources(diagram)}
					</section>`;
			})}
		</div>`;
	}

	private renderTrimTrack(diagram: Diagram, axis: ChartAxis) {
		const message = this.host.message;
		const horizontal = axis === "x";
		const full = diagram.fitted[axis];
		const domain = diagram.drag[axis]?.domain ?? diagram.trimDomain[axis] ?? full;
		const range = diagram.zoom[axis] ?? full;
		const selection = axisTrimSelection(domain, range);
		const digits = Math.min(17, Math.max(4, Math.ceil(Math.log10(
			Math.max(Math.abs(range.min), Math.abs(range.max)) / (range.max - range.min))) + 3));
		const format = new Intl.NumberFormat(this.host.lang || undefined, { maximumSignificantDigits: digits, useGrouping: false });
		const percent = (step: number) => step / TRIM_STEPS * 100 + "%";
		const axisLabel = message(horizontal ? "X-Achse" : "Y-Achse");
		const move = (handle: TrimHandle, position: number) => {
			const currentFull = diagram.fitted?.[axis] ?? full;
			const currentDomain = diagram.drag[axis]?.domain ?? diagram.trimDomain[axis] ?? currentFull;
			const current = diagram.zoom[axis] ?? diagram.drag[axis]?.domain ?? currentFull;
			const next = moveTrimHandle(axisTrimSelection(currentDomain, current), handle, position);
			const value = trimmedAxisRange(currentDomain, next)[handle];
			if (value === current[handle]) return;
			const zoom = { ...current, [handle]: value };
			if (!(zoom.min < zoom.max)) return;
			diagram.zoom[axis] = zoom.min === currentFull.min && zoom.max === currentFull.max ? undefined : zoom;
			this.host.requestUpdate();
			this.invalidate(diagram);
		};
		const pointerPosition = (event: PointerEvent) => horizontal ? event.clientX : -event.clientY;
		const renderHandle = (handle: TrimHandle) => html`
			<button type="button" role="slider" class="diagram-trim-handle diagram-trim-${handle}"
				aria-label=${`${axisLabel} · ${message(handle === "min" ? "Untere Grenze" : "Obere Grenze")}`}
				aria-orientation=${horizontal ? "horizontal" : "vertical"}
				aria-valuemin=${handle === "min" ? domain.min : range.min}
				aria-valuemax=${handle === "max" ? domain.max : range.max}
				aria-valuenow=${range[handle]} aria-valuetext=${format.format(range[handle])}
				title=${format.format(range[handle])}
				@pointerenter=${() => this.host.requestUpdate()}
				@focus=${() => this.host.requestUpdate()}
				@pointerdown=${(event: PointerEvent) => {
					if (event.button !== 0 || diagram.drag[axis]) return;
					const button = event.currentTarget as HTMLButtonElement;
					const rect = button.parentElement.getBoundingClientRect();
					const pixels = horizontal ? rect.width : rect.height;
					if (!pixels) return;
					const currentFull = diagram.fitted?.[axis] ?? full;
					const currentDomain = diagram.trimDomain[axis] ?? currentFull;
					const startStep = axisTrimSelection(currentDomain, diagram.zoom[axis] ?? currentFull)[handle];
					diagram.drag[axis] = { pointer: event.pointerId, startPixel: pointerPosition(event),
						startStep, pixels, domain: currentDomain };
					button.setPointerCapture(event.pointerId);
				}}
				@pointermove=${(event: PointerEvent) => {
					const drag = diagram.drag[axis];
					if (drag?.pointer !== event.pointerId) return;
					move(handle, drag.startStep + (pointerPosition(event) - drag.startPixel) * TRIM_STEPS / drag.pixels);
				}}
				@lostpointercapture=${(event: PointerEvent) => {
					if (diagram.drag[axis]?.pointer !== event.pointerId) return;
					delete diagram.drag[axis];
					this.host.requestUpdate();
				}}
				@keydown=${(event: KeyboardEvent) => {
					const step = TRIM_STEPS / (event.shiftKey ? 1000 : 100);
					let position: number;
					switch (event.key) {
						case "ArrowLeft":
						case "ArrowDown": position = selection[handle] - step; break;
						case "ArrowRight":
						case "ArrowUp": position = selection[handle] + step; break;
						case "Home": position = 0; break;
						case "End": position = TRIM_STEPS; break;
						default: return;
					}
					event.preventDefault();
					move(handle, position);
				}}></button>`;
		const reset = message(horizontal ? "X-Achse automatisch skalieren" : "Y-Achse automatisch skalieren");
		return html`
			<div class="diagram-trim-track diagram-trim-track-${axis}" role="group" aria-label=${axisLabel}
				style=${`--trim-min:${percent(selection.min)};--trim-max:${percent(selection.max)}`}>
				<div class="diagram-trim-rail"></div>
				<div class="diagram-trim-window" title=${message("Doppelklick für feinere Bereichsauswahl")}
					@dblclick=${() => {
						if (!diagram.zoom[axis]) return;
						diagram.trimDomain[axis] = diagram.zoom[axis];
						this.host.requestUpdate();
					}}></div>
				${renderHandle("min")}${renderHandle("max")}
			</div>
			<button type="button" class="diagram-axis-reset diagram-axis-reset-${axis}" aria-label=${reset} title=${reset}
				?disabled=${!diagram.zoom[axis]} @click=${() => {
					delete diagram.zoom[axis];
					delete diagram.trimDomain[axis];
					this.host.requestUpdate();
					this.invalidate(diagram);
				}}>${axis.toUpperCase()} ↺</button>`;
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
						@pointerenter=${(event: PointerEvent) => { if (event.pointerType !== "touch") highlight(true); }}
						@pointerleave=${() => highlight(false)}
						@pointercancel=${() => highlight(false)}
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

	private createChart(canvas: HTMLCanvasElement, card: HTMLElement, phAxis?: ChartAxis) {
		const style = getComputedStyle(card);
		const ink = style.color;
		const accent = style.getPropertyValue("--sl-color-primary-600").trim() || "#0284c7";
		const axisTitleColor = style.getPropertyValue("--diagram-axis-color").trim() || "#075985";
		const grid = style.getPropertyValue("--sl-color-neutral-200").trim() || "#e5e7eb";
		const surface = style.getPropertyValue("--sl-color-neutral-0").trim() || "#fff";
		const font = { family: style.fontFamily, size: 11 };
		const scale = () => ({
			type: "linear" as const,
			bounds: "data" as const,
			ticks: { color: ink, font, maxTicksLimit: 6 },
			border: { color: grid },
			grid: { color: grid, tickLength: 3 },
			title: {
				color: axisTitleColor,
				font: { ...font, size: Number.parseFloat(style.getPropertyValue("--diagram-axis-font-size")) || 11, weight: "bold" as const },
				display: true, text: "",
			},
		});
		return new Chart<"line", DiagramPoint[]>(canvas, {
			type: "line",
			plugins: [{
				id: "axis-trim-layout",
				afterLayout(chart) {
					const { left, right, top, bottom } = chart.chartArea;
					const plot = canvas.parentElement;
					plot.style.setProperty("--plot-left", `${left}px`);
					plot.style.setProperty("--plot-right", `${chart.width - right}px`);
					plot.style.setProperty("--plot-top", `${top}px`);
					plot.style.setProperty("--plot-bottom", `${chart.height - bottom}px`);
				},
			}],
			data: { datasets: [{
				data: [], borderColor: accent, backgroundColor: accent, borderWidth: 1.6,
				pointRadius: 1.5, pointHoverRadius: 4, pointHitRadius: 4, spanGaps: false, order: 1,
			}, ...(phAxis ? titrationMarkerKinds.map(kind => {
				const { shape, color, label } = titrationMarkerStyles[kind];
				const ink = style.getPropertyValue(`--sl-color-${color}-600`).trim();
				return {
					data: [], label: this.host.message(label), pointStyle: shape, showLine: false,
					pointRadius: kind === "neutral" ? 7 : 5, pointHoverRadius: 7, pointHitRadius: 7, pointBorderWidth: 1.5,
					pointBorderColor: kind === "neutral" ? ink : surface,
					pointBackgroundColor: kind === "neutral" ? "transparent" : ink,
				};
			}) : [])] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				layout: { padding: { top: 13, right: 13, bottom: 24, left: 24 } },
				interaction: { mode: "nearest", intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: surface, titleColor: ink, bodyColor: ink, borderColor: grid,
						borderWidth: 1, cornerRadius: 4, padding: 6, displayColors: false,
						titleFont: font, bodyFont: font,
						callbacks: phAxis ? {
							title: items => items.some(item => item.datasetIndex > 0) ? "" : items[0]?.label ?? "",
							label: item => {
								if (item.datasetIndex === 0) return item.formattedValue;
								const pH = item.parsed[phAxis];
								const volume = item.parsed[phAxis === "x" ? "y" : "x"];
								if ((item.raw as DiagramPoint).coarse) {
									return [item.dataset.label, `≈ ${Number(volume.toPrecision(3))} mL · pH ${Number(pH.toFixed(2))}`,
										this.host.message("Grobe Schätzung aus wenigen Messpunkten")];
								}
								return `${item.dataset.label} · ${Number(volume.toPrecision(6))} mL · pH ${Number(pH.toPrecision(5))}`;
							},
						} : undefined,
					},
				},
				scales: { x: scale(), y: scale() },
			},
		});
	}

	private invalidate(diagram?: Diagram): void {
		if (diagram) diagram.viewRevision = undefined;
		else this.viewRevision++;
		this.requestDraw();
	}

	private requestDraw(): void {
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
			const phAxis = titrationPhAxis(diagram);
			const xId = axisId(diagram.x);
			const yId = axisId(diagram.y);
			const history = this.host.measurements.history;
			const revision = history.pairRevision(xId, yId);
			let snapshot = diagram.snapshot;
			const dataChanged = snapshot?.revision !== revision;
			if (dataChanged) {
				const points = history.points(xId, yId);
				snapshot = diagram.snapshot = { ...diagramData(points), revision, points: phAxis ? points : undefined };
			}
			if (!dataChanged && diagram.chart && diagram.viewRevision === this.viewRevision) continue;
			const chart = diagram.chart ??= this.createChart(canvas.value, card.value, phAxis);
			const { data, ranges } = snapshot;
			const previous = diagram.fitted;
			diagram.fitted = ranges;
			if (Boolean(previous) !== Boolean(ranges) || (ranges && previous &&
				(["x", "y"] as const).some(axis => diagram.zoom[axis] && !diagram.trimDomain[axis] && !diagram.drag[axis] &&
					(ranges[axis].min !== previous[axis].min || ranges[axis].max !== previous[axis].max)))) {
				this.host.requestUpdate();
			}
			const dataset = chart.data.datasets[0];
			dataset.data = data;
			dataset.showLine = this.showLine;
			// Give points on the fitted bounds room for their marker. A manually
			// zoomed axis clips exactly at its selected range.
			const xPadding = diagram.zoom.x ? 0 : 2;
			const yPadding = diagram.zoom.y ? 0 : 2;
			dataset.clip = { left: xPadding, right: xPadding, top: yPadding, bottom: yPadding };
			if (phAxis) {
				const doseTime = this.host.measurements.firstTitrationDoseTime(
					phAxis === "y" ? xId : yId, phAxis === "y" ? yId : xId);
				const visible = this.canSeeMarkers;
				if (dataChanged || diagram.markers?.visible !== visible || diagram.markers.doseTime !== doseTime) {
					const markers = visible ? titrationPoints(snapshot.points, phAxis, doseTime) : [];
					const series = titrationMarkerKinds.map(kind => markers.filter(marker => marker.kind === kind)
						.map(({ volume, pH, coarse }) => phAxis === "y" ? { x: volume, y: pH, coarse } : { x: pH, y: volume, coarse }));
					diagram.markers = { visible, doseTime, series };
				}
				const markerKinds: TitrationMarkerKind[] = [];
				titrationMarkerKinds.forEach((kind, index) => {
					const markerData = diagram.markers.series[index];
					const series = chart.data.datasets[index + 1];
					series.label = this.host.message(titrationMarkerStyles[kind].label);
					series.data = markerData;
					series.clip = {
						left: xPadding ? 8 : 0, right: xPadding ? 8 : 0, top: yPadding ? 8 : 0, bottom: yPadding ? 8 : 0,
					};
					if (markerData.length) markerKinds.push(kind);
				});
				if (markerKinds.join() !== (diagram.markerKinds ?? []).join()) {
					diagram.markerKinds = markerKinds;
					this.host.requestUpdate();
				}
			}
			for (const axis of ["x", "y"] as const) {
				const options = chart.options.scales[axis];
				const range = diagram.zoom[axis] ?? ranges?.[axis];
				options.min = range?.min;
				options.max = range?.max;
				options.title.text = this.scaleLabel(diagram[axis]);
			}
			chart.update("none");
			diagram.viewRevision = this.viewRevision;
		}
	}
}
