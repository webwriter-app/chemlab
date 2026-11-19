import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, SOURCES, elementByAtomicNumber } from "../periodic-table/element-reference";
import {
	categoryText,
	conditionsText,
	detailRows,
	groupText,
	sourceOf,
	sourceUsage,
	weightText,
} from "../periodic-table/details";

const element = (atomicNumber: number) => {
	const found = elementByAtomicNumber(atomicNumber);
	assert.ok(found, `missing Z = ${atomicNumber}`);
	return found;
};

test("the detail card lists the eight reference fields in a fixed order", () => {
	const rows = detailRows(element(26), "en");
	assert.deepEqual(
		rows.map((row) => row.key),
		["group", "period", "family", "block", "weight", "phase", "configuration", "shells"],
	);
	for (const row of rows) {
		assert.ok(row.label.length > 0, row.key);
		assert.ok(row.value.length > 0, row.key);
	}
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

test("the conditions line names temperature and pressure", () => {
	assert.equal(conditionsText("en"), "25 °C · 1 bar");
	assert.equal(conditionsText("de"), "25 °C · 1 bar");
});

test("every source usage names a known source and at least one field", () => {
	for (const entry of ELEMENTS) {
		const usage = sourceUsage(entry, "en");
		assert.ok(usage.length > 0, entry.symbol);
		for (const record of usage) {
			assert.ok(SOURCES[record.sourceId], `${entry.symbol}: ${record.sourceId}`);
			assert.ok(record.fields.length > 0, `${entry.symbol}: ${record.sourceId}`);
			assert.ok(sourceOf(record.sourceId));
		}
	}
});

test("the source usage of one element covers identity, weight and configuration", () => {
	const usage = sourceUsage(element(26), "en");
	const fields = usage.flatMap((entry) => entry.fields);
	assert.ok(fields.includes("Identity"));
	assert.ok(fields.includes("Standard atomic weight"));
	assert.ok(fields.includes("Electron configuration"));
	assert.equal(new Set(usage.map((entry) => entry.sourceId)).size, usage.length);
});

test("an unknown source identifier resolves to nothing", () => {
	assert.equal(sourceOf("does-not-exist"), undefined);
});
