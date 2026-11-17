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
			if (diag[0].canvas.id.startsWith("echem-transient-")) return;
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
		const document = this.host.ownerDocument;
		const canvasBundle = document.createElement("div");
		canvasBundle.style.borderTopStyle = "solid";
		canvasBundle.style.borderTopWidth = "2px";
		canvasBundle.style.borderTopColor = "#e5e5e5";
		canvasBundle.style.marginBlock = "20px";
		const canvasDiv = document.createElement("div");
		canvasDiv.style.width = "100%";
		canvasDiv.style.maxWidth = "500px";
		canvasDiv.style.height = "400px";
		const canvas = document.createElement("canvas");
		canvas.id = name;

		const canvasHeading = document.createElement("h5");
		const chartNumber = this.diagramList.length;
		const transient = name.startsWith("echem-transient-");
		const chartHeading = transient ? "Kapazitiver Zellstrom (RC-Modell)" : name.includes("transfer")
			? "Titration"
			: name.includes("source") ? "Elektrolyse" : "Galvanische Zelle";

		canvasDiv.appendChild(canvas);
		const canvasHeadingContainer = document.createElement("div");
		canvasHeadingContainer.style.display = "flex";
		canvasHeadingContainer.style.alignItems = "baseline";
		const trashButton = document.createElement("button");
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
		if (transient) {
			chartLabel = "Zellstrom [A]";
			chartTitleX = "Zeit [s]";
			chartTitleY = "Zellstrom [A]";
		} else if (name.includes("echem") && source instanceof chemlib.ElectricComponent) {
			chartTitleX = "Zeit [s]";
			if (source._type === chemlib.EComponentType.Source) {
				chartLabel = "n";
				chartTitleY = "umgesetzte Stoffmenge [mol]";
			} else if (source._type === chemlib.EComponentType.Voltmeter ||
				(source._type === chemlib.EComponentType.Multimeter && source._meterMode === "voltage")) {
				chartLabel = "Spannung";
				chartTitleY = "Zellspannung [V]";
			} else {
				chartLabel = "Stromstärke";
				chartTitleY = "Stromstärke [A]";
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
						type: transient ? "linear" : "category",
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
			tension: transient ? 0 : 0.4,
			showLine: transient || this.showLine,
			pointRadius: transient ? 0 : undefined,
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

	public setTransientCurve(source: chemlib.ElectricComponent, model: chemlib.NoIonicPathTransientModel): void {
		const name = "echem-transient-" + source._type + ":" + source._id;
		this.createDiagram(name, source);
		const chart = this.diagramList.find(([chart]) => chart.canvas.id === name)?.[0];
		if (!chart) return;
		// Draw six time constants from the exact solution. Live UI cadence does
		// not determine the resolution of a brief current pulse.
		const horizon = Math.min(Number.MAX_VALUE, 6 * model.timeConstant);
		chart.data.datasets[0].data = Array.from({ length: 81 }, (_, index) => {
			const x = (index / 80) * horizon;
			return { x, y: model.at(x).current };
		});
		chart.update("none");
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
				).children[0].id === "transfer" + source._type + ":" + source._id
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
				).children[0].id === "echem" + source._type + ":" + source._id
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
				chart.data.datasets.forEach((dataset, datasetId) => {
					if (source._type === chemlib.EComponentType.Voltmeter ||
						(source._type === chemlib.EComponentType.Multimeter && source._meterMode === "voltage")) {
						dataset.data.push(source._visibleVoltage);
					} else if (source._type === chemlib.EComponentType.Ammeter ||
						source._type === chemlib.EComponentType.Multimeter) {
						dataset.data.push(source._visibleCurrent);
					} else {
						// Exactly one value per step and dataset, otherwise the
						// series drifts out of step with the labels: an electrode
						// whose ion is absent used to push nothing, one with two
						// ions of the same element pushed twice. The oxidised form
						// of the electrode's couple is the species that changes.
						const electrode = circuitComps[datasetId];
						const couple = electrode?._material
							? chemlib.oxidationOf(electrode._material.smilesString)
							: undefined;
						// the dissolved species the electrode gives off
						const dissolved = couple?.terms.find((term) =>
							term.coefficient > 0 && term.phase === "solution");
						const mix = electrode?._connectedMix;
						const ion = dissolved && mix
							? mix._activeMolecules.find((mol) => mol.smilesString === dissolved.smiles)
							: undefined;
						dataset.data.push(ion && mix ? mix._molProperties[ion._id + "n"] : 0);
					}
				});
				chart.update();
			}
		}
	}
}
