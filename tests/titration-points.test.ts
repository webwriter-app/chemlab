import assert from "node:assert/strict";
import { test } from "node:test";
import { titrationPoints } from "../data/titrationPoints";

const trace = (pH: (number | null)[]) => pH.map((y, x) => ({ time: x, x, y }));

test("equivalence, neutral crossing and half-equivalence have distinct meanings", () => {
	const samples = trace([2, 2.1, 2.2, 2.6, 3, 8.7, 10, 10.2]);
	const markers = titrationPoints(samples, "y");
	const equivalence = markers.find(marker => marker.kind === "equivalence");
	const neutral = markers.find(marker => marker.kind === "neutral");
	const half = markers.find(marker => marker.kind === "half-equivalence");
	assert.ok(Math.abs(equivalence.volume - 4.5) < 0.05);
	assert.ok(neutral.volume > equivalence.volume);
	assert.equal(neutral.pH, 7);
	assert.equal(half.volume, equivalence.volume / 2);
	assert.deepEqual(titrationPoints(samples.map(({ time, x, y }) => ({ time, x: y, y: x })), "x"), markers);
});

test("the detector supports two separated equivalence points", () => {
	const samples = trace([1, 1.1, 1.2, 1.6, 4.3, 4.8, 5, 5.1, 5.3, 5.8, 9.8, 10.2, 10.25]);
	const markers = titrationPoints(samples, "y");
	const equivalences = markers.filter(marker => marker.kind === "equivalence").map(marker => marker.volume);
	assert.equal(equivalences.length, 2);
	assert.ok(Math.abs(equivalences[0] - 3.5) < 0.05);
	assert.ok(Math.abs(equivalences[1] - 9.5) < 0.05);
	assert.deepEqual(markers.filter(marker => marker.kind === "half-equivalence").map(marker => marker.volume),
		[equivalences[0] / 2, (equivalences[0] + equivalences[1]) / 2]);
});

test("an unfinished rise, steady drift or data gap produces no false equivalence", () => {
	assert.deepEqual(titrationPoints(trace([2, 2.1, 2.3, 2.8, 4.5]), "y"), []);
	assert.deepEqual(titrationPoints(trace([2, 2.5, 3, 3.5, 4]), "y"), []);
	assert.deepEqual(titrationPoints(trace([3, 4, null, 8, 9]), "y"), []);
	const changedAtSameVolume = trace([3, 4, 8, 9]);
	changedAtSameVolume[2].x = 1;
	assert.deepEqual(titrationPoints(changedAtSameVolume, "y"), []);
});

test("the recorded first dose allows interpolation at half-equivalence without extrapolation", () => {
	const samples = trace([2, 2.1, 2.2, 2.6, 3, 8.7, 10, 10.2]);
	const hasHalf = (points: typeof samples, firstDoseTime: number) =>
		titrationPoints(points, "y", firstDoseTime).some(marker => marker.kind === "half-equivalence");
	assert.ok(hasHalf(samples.slice(1), 1));
	assert.equal(hasHalf(samples.slice(2), 1), false);
	assert.equal(hasHalf(samples.slice(3), 3), false);
});
