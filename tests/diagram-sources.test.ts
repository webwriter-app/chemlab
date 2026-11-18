import assert from "node:assert/strict";
import { test } from "node:test";
import { DiagramSuggestionQueue, selectedDiagramSourceGroups, suggestDiagrams } from "../data/diagramSources";
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

test("axis menus have a separate group for each selected object", () => {
	assert.deepEqual(selectedDiagramSourceGroups(channels, new Set(["beaker:0", "beaker:1"])), [
		{ key: "beaker:0", sources: [pH, sodium] },
		{ key: "beaker:1", sources: [otherPH] },
	]);
	assert.deepEqual(selectedDiagramSourceGroups(channels, new Set(["beaker:1", "multimeter:3"])), [
		{ key: "beaker:1", sources: [otherPH] },
		{ key: "multimeter:3", sources: [amps, volts] },
	]);
	assert.deepEqual(selectedDiagramSourceGroups(channels, new Set(["cable:4"])), []);
});

test("running titration uses the receiver's pH and the running circuit uses the meter mode", () => {
	const candidates = suggestDiagrams(channels, [{ burette: "burette:2", vessel: "beaker:1" }],
		new Map([["multimeter:3", { title: "Elektrolyse", quantities: ["Stromstärke"] }]]));
	assert.deepEqual(candidates, [
		{ title: "Titration", x: delivery, y: otherPH },
		{ title: "Elektrolyse", x: TIME_CHANNEL, y: amps },
	]);
});

test("existing channels and recordings from stopped experiments do not create suggestions", () => {
	const history = new MeasurementHistory();
	const time = history.now();
	history.record(pH, 7, time);
	history.record(amps, 0.9, time);
	history.record(amps, null, time + 1);
	assert.deepEqual(suggestDiagrams(history.channels, [], new Map()), []);
	assert.equal(history.points(TIME_CHANNEL, amps.id)[0].y, 0.9);
});

test("suggestions accumulate across starts and remain selectable after dismissal", () => {
	const queue = new DiagramSuggestionQueue();
	const titration = { title: "Titration", x: delivery, y: pH };
	const circuit = { title: "Stromkreis", x: TIME_CHANNEL, y: amps } as const;
	const list = () => queue.list(() => true);
	assert.equal(queue.collect([titration]), true);
	assert.equal(queue.collect([circuit]), true);
	assert.equal(queue.collect([]), false);
	assert.deepEqual(list().pending.map(({ y }) => y.id), [pH.id, amps.id]);

	queue.dismiss(list().pending[0].key);
	assert.equal(queue.collect([titration, circuit]), false);
	assert.deepEqual(list().pending.map(({ y }) => y.id), [amps.id]);
	assert.deepEqual(list().dismissed.map(({ y }) => y.id), [pH.id]);
	assert.deepEqual(queue.list(({ y }) => y.id !== pH.id).dismissed, []);
});
