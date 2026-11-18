import { TIME_CHANNEL, type MeasurementChannel } from "./measurementHistory";

export type DiagramAxis = typeof TIME_CHANNEL | MeasurementChannel;
export type DiagramSuggestion = { title: string; x: DiagramAxis; y: MeasurementChannel };
export type InstrumentSuggestion = { title: string; quantities: readonly string[] };
type Titration = { burette: string; vessel: string };

export function axisId(axis: DiagramAxis): string {
	return axis === TIME_CHANNEL ? axis : axis.id;
}

function componentKey(channel: MeasurementChannel): string {
	return `${channel.component}:${channel.number - 1}`;
}

export function selectedDiagramSourceGroups(channels: readonly MeasurementChannel[], selection: ReadonlySet<string>) {
	const groups = new Map<string, MeasurementChannel[]>();
	for (const channel of channels) {
		const key = componentKey(channel);
		if (!selection.has(key)) continue;
		let sources = groups.get(key);
		if (!sources) groups.set(key, sources = []);
		sources.push(channel);
	}
	return [...groups].map(([key, sources]) => ({ key, sources }));
}

/** Only propose signals that belong to the identified setup or have recorded values. */
export function suggestDiagrams(
	channels: readonly MeasurementChannel[],
	titrations: readonly Titration[],
	instruments: ReadonlyMap<string, InstrumentSuggestion>,
	hasReading: (id: string) => boolean,
): DiagramSuggestion[] {
	const byComponent = new Map<string, Map<string, MeasurementChannel>>();
	for (const channel of channels) {
		if (channel.species) continue;
		const key = componentKey(channel);
		let quantities = byComponent.get(key);
		if (!quantities) byComponent.set(key, quantities = new Map());
		quantities.set(channel.quantity, channel);
	}
	const suggestions: DiagramSuggestion[] = [];
	for (const { burette, vessel } of titrations) {
		const x = byComponent.get(burette)?.get("Abgegebenes Volumen");
		const y = byComponent.get(vessel)?.get("pH");
		if (x && y) suggestions.push({ title: "Titration", x, y });
	}
	for (const [key, quantities] of byComponent) {
		const experiment = instruments.get(key);
		for (const quantity of ["Stromstärke", "Spannung", "Gesammeltes Gasvolumen"]) {
			const y = quantities.get(quantity);
			const title = experiment?.quantities.includes(quantity) ? experiment.title : undefined;
			if (!y || (!title && !hasReading(y.id))) continue;
			suggestions.push({ title: title ?? quantity, x: TIME_CHANNEL, y });
		}
	}
	// A typical standalone vessel needs at most one useful overview.
	if (!suggestions.length) {
		for (const quantities of byComponent.values()) {
			const y = [quantities.get("pH"), quantities.get("Volumen"), quantities.get("Masse")]
				.find(channel => channel && hasReading(channel.id));
			if (y) suggestions.push({ title: y.quantity, x: TIME_CHANNEL, y });
		}
	}
	return suggestions;
}
