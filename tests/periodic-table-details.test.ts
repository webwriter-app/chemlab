import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, SOURCES, elementByAtomicNumber } from "../periodic-table/element-reference";
import {
	categoryText,
	conditionsText,
	detailRows,
	discoveryText,
	groupText,
	sourceFieldText,
	sourceList,
	stateText,
	temperatureText,
	weightText,
} from "../periodic-table/details";
import { strings } from "../periodic-table/strings";

const element = (atomicNumber: number) => {
	const found = elementByAtomicNumber(atomicNumber);
	assert.ok(found, `missing Z = ${atomicNumber}`);
	return found;
};

test("the detail card lists the eleven reference fields in a fixed order", () => {
	const rows = detailRows(element(26), "en");
	assert.deepEqual(
		rows.map((row) => row.key),
		[
			"group",
			"period",
			"family",
			"block",
			"weight",
			"phase",
			"melting",
			"boiling",
			"discovery",
			"configuration",
			"shells",
		],
	);
	for (const row of rows) {
		assert.ok(row.label.length > 0, row.key);
		assert.ok(row.value.length > 0, row.key);
	}
});

test("every row belongs to one section of the card", () => {
	const rows = detailRows(element(26), "en");
	const sections = new Map(rows.map((row) => [row.key, row.section]));
	assert.equal(sections.get("family"), "header");
	assert.equal(sections.get("group"), "position");
	assert.equal(sections.get("period"), "position");
	assert.equal(sections.get("block"), "position");
	assert.equal(sections.get("weight"), "properties");
	assert.equal(sections.get("phase"), "properties");
	assert.equal(sections.get("melting"), "properties");
	assert.equal(sections.get("boiling"), "properties");
	assert.equal(sections.get("discovery"), "history");
	assert.equal(sections.get("configuration"), "structure");
	assert.equal(sections.get("shells"), "structure");
	for (const entry of ELEMENTS) {
		for (const row of detailRows(entry, "en")) {
			assert.ok(
				["header", "position", "properties", "history", "structure"].includes(row.section),
				`${entry.symbol} ${row.key}`,
			);
		}
	}
});

test("the state row carries the colour the card draws next to it", () => {
	const phase = (atomicNumber: number, temperatureK?: number) =>
		detailRows(element(atomicNumber), "en", temperatureK).find((row) => row.key === "phase");
	assert.equal(phase(8)?.swatch, "gas");
	assert.equal(phase(8, 70)?.swatch, "liquid");
	assert.equal(phase(26)?.swatch, "solid");
	assert.equal(phase(85, 400)?.swatch, "unknown");
	for (const row of detailRows(element(26), "en")) {
		if (row.key === "phase") continue;
		assert.equal(row.swatch, undefined, row.key);
	}
});

test("an element that sublimes gains a twelfth row", () => {
	const carbon = detailRows(element(6), "en").map((row) => row.key);
	assert.ok(carbon.includes("sublimation"));
	assert.equal(carbon.length, 12);
	assert.ok(!detailRows(element(26), "en").some((row) => row.key === "sublimation"));
});

test("the detail card is fully localized", () => {
	const english = detailRows(element(8), "en");
	const german = detailRows(element(8), "de");
	assert.equal(english.length, german.length);
	assert.notEqual(english[0].label, german[0].label);
	assert.equal(english[2].value, "Nonmetal");
	assert.equal(german[2].value, "Nichtmetall");
});

test("a weight interval is bracketed with a separator that is not a decimal comma", () => {
	assert.equal(weightText(element(8), "en"), "[15.99903, 15.99977]");
	assert.equal(weightText(element(8), "de"), "[15,99903; 15,99977]");
	assert.equal(weightText(element(26), "en"), "55.845(2)");
	assert.equal(weightText(element(26), "de"), "55,845(2)");
});

test("an element without a standard atomic weight says so", () => {
	const text = weightText(element(99), "en");
	assert.ok(text.length > 0);
	assert.ok(!/[0-9]/.test(text), text);
});

test("group assignments keep their epistemic state", () => {
	assert.equal(groupText(element(26), "en"), "8");
	assert.equal(groupText(element(57), "en"), "Depends on the convention");
	assert.equal(groupText(element(57), "de"), "Hängt von der Konvention ab");
	assert.equal(groupText(element(58), "en"), "Not assigned");
	assert.equal(groupText(element(58), "de"), "Nicht zugeordnet");
});

test("a predicted value carries a qualifier and a reported one does not", () => {
	const rows = detailRows(element(26), "en");
	const block = rows.find((row) => row.key === "block");
	assert.ok(block);
	assert.equal(block.qualifier, undefined);
	const predicted = ELEMENTS.filter((entry) =>
		detailRows(entry, "en").some((row) => row.qualifier !== undefined),
	);
	for (const entry of predicted) {
		for (const row of detailRows(entry, "en")) {
			if (row.qualifier !== undefined) assert.equal(row.qualifier, "predicted");
		}
	}
});

test("the family label follows the placement table", () => {
	assert.equal(categoryText(element(1), "en"), "Nonmetal");
	assert.equal(categoryText(element(26), "en"), "Transition metal");
	assert.equal(categoryText(element(57), "en"), "Lanthanide");
	assert.equal(categoryText(element(89), "de"), "Actinoid");
});

test("the conditions line names the temperature and the fixed pressure", () => {
	assert.equal(conditionsText("en"), "25 °C · 1 bar");
	assert.equal(conditionsText("de"), "25 °C · 1 bar");
	assert.equal(conditionsText("en", 373.15), "100 °C · 1 bar");
	assert.equal(conditionsText("de", 373.15), "100 °C · 1 bar");
});

test("a temperature is rendered in kelvin with its Celsius equivalent", () => {
	assert.equal(temperatureText(332, "en"), "332 K (58.85 °C)");
	assert.equal(temperatureText(332, "de"), "332 K (58,85 °C)");
	assert.equal(temperatureText(0, "en"), "0 K (-273.15 °C)");
});

test("the state row follows the conditions the card names", () => {
	const oxygen = element(8);
	const atBundle = detailRows(oxygen, "en").find((row) => row.key === "phase");
	assert.ok(atBundle);
	assert.equal(atBundle.value, "Gas");
	assert.equal(atBundle.qualifier, undefined);
	const cold = detailRows(oxygen, "en", 70);
	assert.equal(cold.find((row) => row.key === "phase")?.value, "Liquid");
	const astatine = detailRows(element(85), "en").find((row) => row.key === "phase");
	assert.equal(astatine?.value, "Solid", "the reported phase wins at bundle conditions");
	assert.equal(astatine?.qualifier, undefined);
	const computed = detailRows(element(85), "en", 400);
	assert.equal(computed.find((row) => row.key === "phase")?.value, "Unknown");
	const labels = { solid: "Solid", liquid: "Liquid", gas: "Gas" } as const;
	for (const entry of ELEMENTS) {
		if (entry.phase.status === "unavailable") continue;
		const row = detailRows(entry, "en").find((candidate) => candidate.key === "phase");
		assert.equal(row?.value, labels[entry.phase.value], entry.symbol);
	}
});

test("the state labels are localized", () => {
	const english = strings("en");
	const german = strings("de");
	assert.equal(stateText("solid", english), "Solid");
	assert.equal(stateText("liquid", german), "Flüssig");
	assert.equal(stateText("gas", english), "Gas");
	assert.equal(stateText("unknown", german), "Unbekannt");
});

test("the discovery row separates a year, a discoverer and antiquity", () => {
	assert.equal(discoveryText(element(26), "en"), "Antiquity");
	assert.equal(discoveryText(element(26), "de"), "Antike");
	const withDiscoverer = ELEMENTS.find(
		(entry) => entry.discovery.kind === "year" && entry.discovery.by !== undefined,
	);
	assert.ok(withDiscoverer);
	const text = discoveryText(withDiscoverer, "en");
	assert.ok(text.startsWith(String((withDiscoverer.discovery as { year: number }).year)), text);
	assert.ok(text.includes("·"), text);
	assert.equal(discoveryText(element(117), "en"), "2010 · JINR");
});

test("every source of the bundle is listed with its metadata", () => {
	const sources = sourceList();
	assert.equal(sources.length, Object.keys(SOURCES).length);
	for (const source of sources) {
		assert.ok(source.publisher.length > 0, source.id);
		assert.ok(source.title.length > 0, source.id);
		assert.ok(source.attribution.length > 0, source.id);
		assert.ok(source.fields.length > 0, source.id);
		assert.ok(source.url.startsWith("http"), source.id);
	}
});

test("a source field path is localized and an unknown one stays visible", () => {
	const english = strings("en");
	const german = strings("de");
	assert.equal(sourceFieldText("temperature.melting", english), "Melting point");
	assert.equal(sourceFieldText("temperature.boiling", german), "Siedepunkt");
	assert.equal(sourceFieldText("discovery", english), "Discovered");
	assert.equal(sourceFieldText("electron_config", german), "Elektronenkonfiguration");
	assert.equal(sourceFieldText("not.a.field", english), "not.a.field");
	for (const source of sourceList()) {
		for (const field of source.fields) {
			const text = sourceFieldText(field, english);
			assert.ok(text.length > 0, field);
			assert.ok(!text.includes("."), `${field} is not localized`);
		}
	}
});
