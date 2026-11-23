import assert from "node:assert/strict";
import { test } from "node:test";
import { Chart } from "../controllers/diagramChart";

test("register only the chart parts a diagram draws with", () => {
	// `DiagramController.createChart` builds `type: "line"` datasets on two linear
	// axes and relies on the tooltip. Everything else stays unregistered so the
	// release bundle does not carry it, and the legend option in the chart
	// configuration stays inert while the legend is hidden anyway.
	const ids = registry => Object.keys(registry.items).sort();
	assert.deepEqual(ids(Chart.registry.controllers), ["line"]);
	assert.deepEqual(ids(Chart.registry.scales), ["linear"]);
	assert.deepEqual(ids(Chart.registry.elements), ["line", "point"]);
	assert.deepEqual(ids(Chart.registry.plugins), ["tooltip"]);
});
