import assert from "node:assert/strict";
import { test } from "node:test";
import { selectedDiagramSources, suggestDiagrams } from "../data/diagramSources";
import { MeasurementHistory, TIME_CHANNEL, type MeasurementChannel } from "../data/measurementHistory";

function source(component: string, index: number, quantity: string, group: MeasurementChannel["group"] = "vessel", species?: string): MeasurementChannel {
	return { id: `${component}:${index}/${quantity}${species ?? ""}`, group, component, number: index + 1, quantity, species };
}

const pH = source("beaker", 0, "pH");
const sodium = source("beaker", 0, "Konzentration", "vessel", "Na⁺");
const otherPH = source("beaker", 1, "pH");
const delivery = source("burette", 2, "Abgegebenes Volumen");
const amps = source("multimeter", 3, "Stromstärke", "instrument");
const volts = source("multimeter", 3, "Spannung", "instrument");
const channels = [pH, sodium, otherPH, delivery, amps, volts];

test("only the selected object IDs contribute custom sources", () => {
	assert.deepEqual(selectedDiagramSources(channels, new Set(["beaker:0"])), [pH, sodium]);
	assert.deepEqual(selectedDiagramSources(channels, new Set(["beaker:1", "multimeter:3"])), [otherPH, amps, volts]);
	assert.deepEqual(selectedDiagramSources(channels, new Set(["cable:4"])), []);
});

test("titration uses the receiver's pH and a wired meter uses its active mode", () => {
	const candidates = suggestDiagrams(channels, [{ burette: "burette:2", vessel: "beaker:1" }],
		new Map([["multimeter:3", { title: "Elektrolyse", quantities: ["Stromstärke"] }]]), () => false);
	assert.deepEqual(candidates, [
		{ title: "Titration", x: delivery, y: otherPH },
		{ title: "Elektrolyse", x: TIME_CHANNEL, y: amps },
	]);
});

test("recorded signals can be suggested after unplugging without listing unavailable meters", () => {
	const history = new MeasurementHistory();
	const time = history.now();
	history.record(amps, 0.9, time);
	history.record(volts, null, time + 1);
	history.record(amps, null, time + 2);
	assert.deepEqual(suggestDiagrams(channels, [], new Map(), id => history.hasReading(id)),
		[{ title: "Stromstärke", x: TIME_CHANNEL, y: amps }]);
});

test("fallback proposes a single overview per vessel with data", () => {
	const volume = source("beaker", 0, "Volumen");
	assert.deepEqual(suggestDiagrams([volume, ...channels], [], new Map(), id => id === volume.id || id === pH.id),
		[{ title: "pH", x: TIME_CHANNEL, y: pH }]);
});
