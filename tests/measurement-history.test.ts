import assert from "node:assert/strict";
import { MeasurementHistory, TIME_CHANNEL } from "../data/measurementHistory";

const store = new MeasurementHistory();
const channel = (id: string) => ({ id, component: "beaker", group: "vessel" as const, number: 1, quantity: id });
const x = channel("x");
const y = channel("y");
const unused = channel("unused");

for (const [index, [a, b]] of [[1, 1], [4, 5], [2, 6], [3, null], [5, 2], [2, 3]].entries()) {
	const time = index * 100;
	store.record(x, a, time);
	store.record(y, b, time);
}
store.record(unused, 8, 600);
store.record(x, 7, 1200);
assert.deepEqual(store.points(x.id, y.id).map(({x, y}) => [x, y]),
	[[1, 1], [4, 5], [2, 6], [3, null], [5, 2], [2, 3], [7, 3]]);

store.retain(x.id, y.id);
store.retain(y.id, x.id);
store.prune(301_000);
assert.deepEqual(store.points(y.id, x.id).map(({x, y}) => [x, y]),
	[[1, 1], [6, 2], [null, 3], [2, 5], [3, 2], [3, 7]]);
assert.deepEqual(store.points(TIME_CHANNEL, unused.id), []);
store.release(x.id, y.id);
assert.equal(store.points(x.id, y.id)[0].time, 0);
store.release(y.id, x.id);
assert.deepEqual(store.points(x.id, y.id), [{ time: 1200, x: 7, y: 3 }]);
store.retire("y", 1300);
assert.equal(store.points(x.id, y.id).at(-1).y, null);
store.prune(302_000);
assert.equal(store.channels.some(channel => channel.id === "y"), false);

// The time axis counts from the first sample of the pair, not from the session start.
const late = new MeasurementHistory(performance.now() - 60_000);
const reading = channel("reading");
late.record(reading, 1.5, 60_000);
late.record(reading, 1.4, 60_500);
late.retain(TIME_CHANNEL, reading.id);
assert.deepEqual(late.points(TIME_CHANNEL, reading.id).map(({ x, y }) => [x, y]), [[0, 1.5], [0.5, 1.4]]);
assert.deepEqual(late.points(reading.id, TIME_CHANNEL).map(({ x, y }) => [x, y]), [[1.5, 0], [1.4, 0.5]]);
late.prune(360_000);
assert.deepEqual(late.points(TIME_CHANNEL, reading.id).map(({ x, y }) => [x, y]), [[0, 1.5], [0.5, 1.4]]);

const pulse = new MeasurementHistory(performance.now() - 1000);
const current = channel("current");
const voltage = channel("voltage");
const tau = 1e-6;
const advance = pulse.startTransient(tau, elapsed => 3 * Math.exp(-elapsed / tau),
	new Map([[current.id, -1], [voltage.id, 0.1]]));
advance(2 * tau); // Stop before the six-time-constant display horizon.
const recovered = pulse.points(current.id, voltage.id);
assert.equal(recovered.length, 81);
assert.equal(recovered[0].x, -3);
assert.ok(Math.abs(recovered.at(-1).time - recovered[0].time - 0.002) < 1e-9);
assert.ok(recovered.every(({ x, y }) => Math.abs(y + 0.1 * x) < 1e-14));
pulse.retain(current.id, voltage.id);
pulse.prune(302_000);
assert.deepEqual(pulse.points(current.id, voltage.id), recovered);
assert.deepEqual(pulse.points(TIME_CHANNEL, current.id), []);

// A visible chart can keep its current data for unrelated readings and rejoin
// after a replacement at the same timestamp or an analytic RC advance.
const revisions = new MeasurementHistory();
revisions.retain(x.id, y.id);
revisions.record(x, 1, 100);
revisions.record(y, 2, 100);
const initial = revisions.pairRevision(x.id, y.id);
revisions.record(unused, 42, 100);
assert.equal(revisions.pairRevision(x.id, y.id), initial);
revisions.record(x, 3, 100);
const replaced = revisions.pairRevision(x.id, y.id);
assert.notEqual(replaced, initial);
assert.equal(revisions.pairRevision(y.id, x.id), replaced);
const extend = revisions.startTransient(tau, () => 1, new Map([[x.id, 1]]));
const started = revisions.pairRevision(x.id, y.id);
extend(tau);
assert.notEqual(revisions.pairRevision(x.id, y.id), started);
