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
