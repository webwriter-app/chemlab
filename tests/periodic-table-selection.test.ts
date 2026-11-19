import assert from "node:assert/strict";
import { test } from "node:test";
import {
	ELEMENT_SELECTION_EVENT,
	elementSelection,
	isAtomicNumber,
	parseAtomicNumberAttribute,
	readElementSelection,
	SelectionModel,
} from "../periodic-table/selection";

test("the event name is the documented contract", () => {
	assert.equal(ELEMENT_SELECTION_EVENT, "chemlab:element-selection");
});

test("atomic numbers are integers from 1 to 118", () => {
	for (const value of [1, 2, 8, 26, 117, 118]) assert.equal(isAtomicNumber(value), true, String(value));
	for (const value of [0, -1, 119, 1000, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "8", null, undefined, {}]) {
		assert.equal(isAtomicNumber(value), false, String(value));
	}
});

test("the initial-element attribute accepts only all-digit values in range", () => {
	assert.equal(parseAtomicNumberAttribute("8"), 8);
	assert.equal(parseAtomicNumberAttribute(" 8 "), 8);
	assert.equal(parseAtomicNumberAttribute("08"), 8);
	assert.equal(parseAtomicNumberAttribute("118"), 118);
	for (const raw of ["", "   ", null, undefined, "0", "119", "-1", "8.0", "1e2", "0x8", "eight", "+8", "8 9"]) {
		assert.equal(parseAtomicNumberAttribute(raw), null, String(raw));
	}
});

test("a selection payload is frozen and omits an empty source id", () => {
	const payload = elementSelection(8, "table-a");
	assert.deepEqual({ ...payload }, { version: 1, atomicNumber: 8, sourceId: "table-a" });
	assert.equal(Object.isFrozen(payload), true);
	assert.deepEqual({ ...elementSelection(null) }, { version: 1, atomicNumber: null });
	assert.deepEqual({ ...elementSelection(8, "") }, { version: 1, atomicNumber: 8 });
});

test("arbitrary event details are validated before use", () => {
	assert.deepEqual({ ...readElementSelection({ version: 1, atomicNumber: 8 })! }, { version: 1, atomicNumber: 8 });
	assert.deepEqual({ ...readElementSelection({ version: 1, atomicNumber: null, sourceId: "a" })! },
		{ version: 1, atomicNumber: null, sourceId: "a" });
	for (const detail of [
		null, undefined, 8, "8", [],
		{ version: 2, atomicNumber: 8 },
		{ atomicNumber: 8 },
		{ version: 1 },
		{ version: 1, atomicNumber: 0 },
		{ version: 1, atomicNumber: 119 },
		{ version: 1, atomicNumber: 8.5 },
		{ version: 1, atomicNumber: "8" },
		{ version: 1, atomicNumber: 8, sourceId: 7 },
	]) {
		assert.equal(readElementSelection(detail), null, JSON.stringify(detail));
	}
});

test("an unset model is distinct from a deliberate clear", () => {
	const model = new SelectionModel();
	assert.equal(model.isSet, false);
	assert.equal(model.value, null);
	assert.equal(model.clear(), false);
	assert.equal(model.isSet, true);
	assert.equal(model.value, null);
});

test("the authored default applies once and a later author edit reapplies", () => {
	const model = new SelectionModel();
	assert.equal(model.initialize(8), true);
	assert.equal(model.value, 8);
	assert.equal(model.initialize(8), false);
	assert.equal(model.applyAuthored(26), true);
	assert.equal(model.value, 26);
	assert.equal(model.applyAuthored(null), true);
	assert.equal(model.value, null);
});

test("a live write before the authored default wins, including a deliberate null", () => {
	const written = new SelectionModel();
	assert.equal(written.write(5), true);
	assert.equal(written.initialize(8), false);
	assert.equal(written.value, 5);

	// A fresh model already reads `null`, so the write reports no visible change
	// but still counts as the host's decision and blocks the authored default.
	const cleared = new SelectionModel();
	assert.equal(cleared.write(null), false);
	assert.equal(cleared.isSet, true);
	assert.equal(cleared.initialize(8), false);
	assert.equal(cleared.value, null);
});

test("invalid live writes keep the previous selection", () => {
	const model = new SelectionModel();
	model.initialize(8);
	for (const value of ["8", Number.NaN, 0, 119, 8.5, undefined, {}]) {
		assert.equal(model.write(value), false, String(value));
		assert.equal(model.value, 8, String(value));
	}
});

test("a repeated selection and a repeated clear report no change", () => {
	const model = new SelectionModel();
	model.initialize(8);
	assert.equal(model.select(8), false);
	assert.equal(model.select(26), true);
	assert.equal(model.select(26), false);
	assert.equal(model.clear(), true);
	assert.equal(model.clear(), false);
});

test("reset returns to the authored default", () => {
	const model = new SelectionModel();
	model.initialize(8);
	model.select(26);
	assert.equal(model.reset(), true);
	assert.equal(model.value, 8);
	assert.equal(model.reset(), false);
});

test("only a changed selection would dispatch an event", () => {
	// The widget dispatches exactly when the model reports a change, so the
	// matrix reduces to counting `true` results of the user actions.
	const model = new SelectionModel();
	model.initialize(8);
	const events = [model.select(8), model.select(26), model.clear(), model.clear()];
	assert.deepEqual(events, [false, true, true, false]);
	assert.equal(events.filter(Boolean).length, 2);
});
