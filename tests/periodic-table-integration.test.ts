import assert from "node:assert/strict";
import { test } from "node:test";
import {
	SelectionRouter,
	isSelectionPayload,
	resolveSource,
	type RoutingObserver,
} from "../periodic-table/routing";
import { ELEMENT_SELECTION_EVENT, elementSelection } from "../periodic-table/selection";
import {
	FakeElement,
	FakeObserverFactory,
	FakeWorksheet,
	TABLE_TAG,
	tableHost,
} from "./fixtures/worksheet";

/** Receiver stub that records every delivered atomic number. */
class Receiver {
	readonly received: (number | null)[] = [];
	readonly router: SelectionRouter;

	constructor(root: FakeWorksheet, sourceId: string, observers: FakeObserverFactory) {
		this.router = new SelectionRouter({
			root,
			sourceId,
			expectedTag: TABLE_TAG,
			onSelection: (selection) => this.received.push(selection.atomicNumber),
			createObserver: observers.factory,
		});
	}
}

/** Builds a worksheet with two tables and one receiver per table. */
function worksheet() {
	const root = new FakeWorksheet();
	const tableA = root.append(tableHost("table-a"));
	const tableB = root.append(tableHost("table-b"));
	const observers = new FakeObserverFactory();
	const builder = new Receiver(root, "table-a", observers);
	const lab = new Receiver(root, "table-b", observers);
	builder.router.bind();
	lab.router.bind();
	return { root, tableA, tableB, observers, builder, lab };
}

test("a receiver only counts the table it is bound to", () => {
	const { tableA, tableB, builder, lab } = worksheet();
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, [8]);
	assert.deepEqual(lab.received, []);
	tableB.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(29, "table-b"));
	assert.deepEqual(builder.received, [8]);
	assert.deepEqual(lab.received, [29]);
});

test("a deliberate clear is delivered once and a property write is not an event", () => {
	const { tableA, builder } = worksheet();
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(null, "table-a"));
	assert.deepEqual(builder.received, [8, null]);
	// A reverse write into the table sets the property; it dispatches nothing.
	assert.deepEqual(builder.received, [8, null]);
});

test("a duplicate ID resolves to nothing instead of to the first hit", () => {
	const { root, tableA, builder } = worksheet();
	const duplicate = root.append(tableHost("table-a"));
	assert.equal(resolveSource(root, "table-a", TABLE_TAG), null);
	builder.router.refresh();
	assert.equal(builder.router.source, null);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	duplicate.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(26, "table-a"));
	assert.deepEqual(builder.received, []);
	// Removing the duplicate restores the binding.
	duplicate.remove();
	builder.router.refresh();
	assert.equal(builder.router.source, tableA);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, [8]);
});

test("a rebind in the same task ignores the stale source", () => {
	const { root, tableA, builder } = worksheet();
	const replacement = root.append(tableHost("table-a"));
	tableA.remove();
	builder.router.refresh();
	assert.equal(builder.router.source, replacement);
	assert.equal(tableA.listenerCount(ELEMENT_SELECTION_EVENT), 0);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, []);
	replacement.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(47, "table-a"));
	assert.deepEqual(builder.received, [47]);
});

test("an event from a child of the source is rejected", () => {
	const { tableA, builder } = worksheet();
	const child = tableA.append(new FakeElement("div"));
	child.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, []);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, [8]);
});

test("an invalid payload is rejected", () => {
	const { tableA, builder } = worksheet();
	for (const detail of [
		undefined,
		null,
		"8",
		{ version: 2, atomicNumber: 8 },
		{ version: 1, atomicNumber: 0 },
		{ version: 1, atomicNumber: 119 },
		{ version: 1, atomicNumber: 8.5 },
		{ version: 1, atomicNumber: 8, sourceId: 7 },
	]) {
		assert.equal(isSelectionPayload(detail), false, JSON.stringify(detail));
		tableA.dispatch(ELEMENT_SELECTION_EVENT, detail);
	}
	assert.deepEqual(builder.received, []);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, [8]);
});

test("removal and reconnection deliver once per change after recovery", () => {
	const { root, tableA, builder } = worksheet();
	tableA.remove();
	builder.router.refresh();
	assert.equal(builder.router.source, null);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, []);
	root.append(tableA);
	builder.router.refresh();
	assert.equal(builder.router.source, tableA);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, [8]);
	assert.equal(tableA.listenerCount(ELEMENT_SELECTION_EVENT), 1);
});

test("the observer watches once and is released on dispose", () => {
	const { root, tableA, observers, builder } = worksheet();
	assert.equal(observers.observers.length, 2);
	const observer = observers.observers[0];
	assert.deepEqual(observer.targets, [root]);
	observer.trigger();
	assert.equal(builder.router.source, tableA);
	builder.router.dispose();
	assert.equal(observer.disconnects, 1);
	assert.equal(tableA.listenerCount(ELEMENT_SELECTION_EVENT), 0);
	tableA.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(builder.received, []);
});

test("a host without MutationObserver still binds", () => {
	const root = new FakeWorksheet();
	const table = root.append(tableHost("table-a"));
	const received: (number | null)[] = [];
	const router = new SelectionRouter({
		root,
		sourceId: "table-a",
		expectedTag: TABLE_TAG,
		onSelection: (selection) => received.push(selection.atomicNumber),
		createObserver: (): RoutingObserver | null => null,
	});
	router.bind();
	assert.equal(router.source, table);
	table.dispatch(ELEMENT_SELECTION_EVENT, elementSelection(8, "table-a"));
	assert.deepEqual(received, [8]);
	router.dispose();
});

test("an empty source ID never binds", () => {
	const root = new FakeWorksheet();
	const table = root.append(tableHost(""));
	assert.equal(resolveSource(root, "", TABLE_TAG), null);
	assert.equal(resolveSource(root, "table-a", TABLE_TAG), null);
	table.id = "table-a";
	assert.equal(resolveSource(root, "table-a", TABLE_TAG), table);
});
