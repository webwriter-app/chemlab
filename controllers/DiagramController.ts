import { ReactiveController } from "lit";
import Chart from "chart.js/auto";
import * as chemlib from "../chemlib";

import type { ChemLab } from "../webwriter-chemlab";

/**
 * Owns all Chart.js concerns for the widget: the live titration / e-chem
 * diagrams shown in the diagram drawer.
 *
 * The host's ticker functions drive the underlying chemlib simulation and then
 * delegate every charting side-effect to this controller, keeping the two
 * responsibilities separate.
 *
 * @implements {ReactiveController}
 */
export class DiagramController implements ReactiveController {
	private host: ChemLab;

	/**
	 * List of active diagrams. Each entry is a `[Chart, containerDiv, updateLabels]` tuple,
	 * where the container's first child carries the experiment id.
	 */
	private diagramList: Array<[Chart<"line">, HTMLDivElement, () => void]> = [];

	get hasDiagrams(): boolean {
		return this.diagramList.length > 0;
	}

	public updateLabels(): void {
		this.diagramList.forEach(([, , updateLabels]) => updateLabels());
	}

	/** Whether datasets should draw connecting lines between points. */
	showLine: boolean = false;

	constructor(host: ChemLab) {
		this.host = host;
		host.addController(this);
	}

	/** No reactive lifecycle work; diagrams are driven imperatively by the host. */
	hostConnected(): void {}

	/**
	 * Toggles line drawing for all existing diagrams and redraws them.
	 * Bound to the "Kurven anzeigen" checkbox in the diagram drawer.
	 */
	public toggleShowLine(): void {
		this.showLine = !this.showLine;
		this.diagramList.forEach((diag) => {
			diag[0].data.datasets.forEach((dataset) => {
				dataset.showLine = this.showLine;
			});
			diag[0].update();
		});
	}

	/**
	 * Creates a new diagram (canvas + chart) for a titration or e-chem
	 * experiment and appends it to the diagram drawer. No-op if a diagram for
	 * this experiment already exists.
	 *
	 * @param name - the ticker/experiment name (e.g. "transfer...", "echem...")
	 * @param source - the device that starts the experiment, used to label electrochemistry datasets
	 *   datasets from the circuit's electrodes
	 */
	public createDiagram(name: string, source: chemlib.ChemComponent | chemlib.ElectricComponent): void {
		for (let i = 0; i < this.diagramList.length; i++) {
			if (
				(this.diagramList[i][1] as HTMLDivElement).children[0]
					.id === name
			) {
				return;
			}
		}
		// @ts-ignore
		let canvasBundle: HTMLDivElement = this.host.shadowRoot.createElement(
			"div"
		) as HTMLDivElement;
		canvasBundle.style.borderTopStyle = "solid";
		canvasBundle.style.borderTopWidth = "2px";
		canvasBundle.style.borderTopColor = "#e5e5e5";
		canvasBundle.style.marginBlock = "20px";
		// @ts-ignore
		let canvasDiv: HTMLDivElement = this.host.shadowRoot.createElement(
			"div"
		) as HTMLDivElement;
		canvasDiv.style.width = "100%";
		canvasDiv.style.maxWidth = "500px";
		canvasDiv.style.height = "400px";
		// @ts-ignore
		let canvas: HTMLCanvasElement = this.host.shadowRoot.createElement(
			"canvas"
		) as HTMLCanvasElement;
		canvas.id = name;

		// @ts-ignore
		let canvasHeading: HTMLHeadingElement = this.host.shadowRoot.createElement("h5") as HTMLHeadingElement;
		const chartNumber = this.diagramList.length;
		const chartHeading = name.includes("transfer")
			? "Titration"
			: name.includes("source") ? "Elektrolyse" : "Galvanische Zelle";

		canvasDiv.appendChild(canvas);
		// @ts-ignore
		let canvasHeadingContainer: HTMLDivElement = this.host.shadowRoot.createElement("div") as HTMLDivElement;
		canvasHeadingContainer.style.display = "flex";
		canvasHeadingContainer.style.alignItems = "baseline";
		// @ts-ignore
		let trashButton: HTMLButtonElement = this.host.shadowRoot.createElement(
			"button"
		) as HTMLButtonElement;
		trashButton.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16"><path fill="#d10000" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>`;
		trashButton.onclick = () => {
			const index = this.diagramList.findIndex(([, container]) => container === canvasDiv);
			if (index !== -1) {
				this.diagramList[index][0].destroy();
				this.diagramList.splice(index, 1);
			}
			canvasBundle.remove();
			this.host.requestUpdate();
			this.host.reportXApi("removed", "diagram-" + name);
		};
		canvasHeadingContainer.appendChild(canvasHeading);
		canvasHeadingContainer.appendChild(trashButton);
		canvasBundle.appendChild(canvasHeadingContainer);
		canvasBundle.appendChild(canvasDiv);
		this.host.canvasContainer.appendChild(canvasBundle);

		let chartLabel: string;
		let chartTitleX: string;
		let chartTitleY: string;

		if (name.includes("transfer")) {
			chartLabel = "pH";
			chartTitleX = "Volumen [ml]";
			chartTitleY = "pH Wert";
		}
		if (name.includes("echem")) {
			if (name.includes("source")) {
				chartLabel = "n";
				chartTitleX = "Zeit [s]";
				chartTitleY = "umgesetzte Stoffmenge [mol]";
			}
			if (name.includes("voltmeter")) {
				chartLabel = "Spannung";
				chartTitleX = "Zeit [s]";
				chartTitleY = "Zellspannung [V]";
			}
		}
		let chart = new Chart(canvas, {
			type: "line",
			data: {
				labels: [],
				datasets: [],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						beginAtZero: true,
						title: {
							text: chartTitleX,
							display: true,
						},
						grid: {
							drawOnChartArea: false,
						},
					},
					y: {
						beginAtZero: true,
						title: {
							text: chartTitleY,
							display: true,
						},
						grid: {
							drawOnChartArea: false,
						},
					},
				},
			},
		});

		chart.data.datasets.push({
			label: chartLabel,
			data: [],
			tension: 0.4,
			showLine: this.showLine,
		});
		if (name.includes("source")) {
			chart.data.datasets.push({
				label: chartLabel,
				data: [],
				tension: 0.4,
				showLine: this.showLine,
			});

		}

		const ionSymbols = name.includes("source")
			? chemlib.ComponentManager.isCircuit(source as chemlib.ElectricComponent)
				.map(electrode => electrode._material?._atoms[0]?.getSymbol())
			: [];
		const updateLabels = () => {
			canvasHeading.innerText = chartNumber + ": " + this.host.message(chartHeading);
			chart.options.scales.x.title.text = this.host.message(chartTitleX);
			chart.options.scales.y.title.text = this.host.message(chartTitleY);
			chart.data.datasets.forEach((dataset, index) => {
				const symbol = ionSymbols[index];
				dataset.label = symbol
					? this.host.message("Stoffmenge {symbol} Ionen [mol]", { symbol })
					: this.host.message(chartLabel);
			});
			chart.update("none");
		};
		updateLabels();
		this.diagramList.push([chart, canvasDiv, updateLabels]);
		this.host.requestUpdate();
		this.host.reportXApi("created", "diagram-" + name);
	}

	/**
	 * Appends a titration data point (pH vs. added volume) to any diagram that
	 * belongs to the given source component.
	 *
	 * @param source - the burette / source component being titrated from
	 * @param dest - the destination component whose pH is measured
	 */
	public appendTitrationPoint(
		source: chemlib.ChemComponent,
		dest: chemlib.ChemComponent
	): void {
		for (let i = 0; i < this.diagramList.length; i++) {
			if (
				(
					this.diagramList[i][1] as HTMLDivElement
				).children[0].id.includes(
					source._type + ":" + source._id
				)
			) {
				const chart = this.diagramList[i][0];
				chart.data.labels.push(
					(chart.data.labels.length > 0
						? Number.parseFloat(
								chart.data.labels[
									chart.data.labels.length - 1
								] as string
						  )
						: 0) +
						source._outVol * 1000
				);
				chart.data.datasets.forEach((dataset) => {
					dataset.data.push(
						chemlib.Simulation.getpH(
							dest._content
						)
					);
				});
				chart.update();
			}
		}
	}

	/**
	 * Appends an electrochemistry data point to any diagram belonging to the
	 * given source component: cell voltage for a voltmeter, or converted amount
	 * of substance per electrode for a source (electrolysis).
	 *
	 * @param source - the voltmeter / source e-component
	 * @param circuitComps - the resolved circuit `[electrode, electrode, device]`
	 */
	public appendEChemPoint(
		source: chemlib.ElectricComponent,
		circuitComps: Array<chemlib.ElectricComponent>
	): void {
		for (let i = 0; i < this.diagramList.length; i++) {
			if (
				(
					this.diagramList[i][1] as HTMLDivElement
				).children[0].id.includes(
					source._type + ":" + source._id
				)
			) {
				const chart = this.diagramList[i][0];
				chart.data.labels.push(
					(chart.data.labels.length > 0
						? Number.parseFloat(
								chart.data.labels[
									chart.data.labels.length - 1
								] as string
						  )
						: 0) + 1
				);
				chart.data.datasets.forEach((dataset) => {
					if (
						source._type ===
						chemlib.EComponentType.Voltmeter
					) {
						dataset.data.push(source._visibleVoltage);
					} else {
						let datasetId: number =
							chart.data.datasets.indexOf(dataset);
						circuitComps[
							datasetId
						]._connectedMix._activeMolecules.forEach(
							(mol) => {
								if (
									mol._atomCount === 1 &&
									mol._totalCharge != 0 &&
									mol._atoms[0].getName() ===
										circuitComps[
											datasetId
										]._material._atoms[0].getName()
								) {
									dataset.data.push(
										circuitComps[datasetId]
											._connectedMix
											._molProperties[
											mol._id + "n"
										]
									);
								}
							}
						);
					}
				});
				chart.update();
			}
		}
	}
}
