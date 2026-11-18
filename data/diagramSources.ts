import { TIME_CHANNEL, type MeasurementChannel } from "./measurementHistory";

export type DiagramAxis = typeof TIME_CHANNEL | MeasurementChannel;
export type DiagramSuggestion = { title: string; x: DiagramAxis; y: MeasurementChannel };
export type InstrumentSuggestion = { title: string; quantities: readonly string[] };
type Titration = { burette: string; vessel: string };

export function axisId(axis: DiagramAxis): string {
	return axis === TIME_CHANNEL ? axis : axis.id;
}

export function componentKey(channel: MeasurementChannel): string {
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

/** Build proposals from the sources of currently running experiments. */
export function suggestDiagrams(
	channels: readonly MeasurementChannel[],
	titrations: readonly Titration[],
	instruments: ReadonlyMap<string, InstrumentSuggestion>,
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
	for (const [key, { title, quantities }] of instruments) {
		for (const quantity of quantities) {
			const y = byComponent.get(key)?.get(quantity);
			if (y) suggestions.push({ title, x: TIME_CHANNEL, y });
		}
	}
	return suggestions;
}
