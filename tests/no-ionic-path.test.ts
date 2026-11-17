import assert from "node:assert/strict";
import { test } from "node:test";
import { NoIonicPathTransientModel } from "../chemlib/NoIonicPathTransientModel";

const parameters = { emf: 1, resistance: 1000, capacitance: 10e-6 };
const close = (actual: number, expected: number, tolerance = 1e-12) =>
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

test("matches the isolated galvanic cell reference case", () => {
	const model = new NoIonicPathTransientModel(parameters);
	close(model.initialCurrent, 1e-3);
	close(model.timeConstant, 0.01);
	close(model.at(0.01).current, 1e-3 / Math.E);
	close(model.at(1).charge, 10e-6);
	close(model.at(1).opposingVoltage, 1);
	close(model.timeToCutoff(10e-6), 0.04605170185988092);
	close(model.at(model.timeToCutoff(10e-6)).current, 10e-6);
	assert.equal(model.timeToCutoff(1e-3), 0);
});

test("precharge can reverse the pulse and is excluded from charge transferred", () => {
	const model = new NoIonicPathTransientModel({ ...parameters, initialCharge: 20e-6 });
	const initial = model.at(0);
	close(initial.current, -1e-3);
	close(initial.charge, 20e-6);
	close(initial.transferredCharge, 0);
	const final = model.at(1);
	close(final.charge, 10e-6);
	close(final.transferredCharge, -10e-6);
	close(final.electronEquivalents, -10e-6 / 96485.33212, 1e-20);
	close(model.timeToCutoff(10e-6), 0.04605170185988092);
});

test("an interval much shorter than the time constant still transfers charge", () => {
	const model = new NoIonicPathTransientModel(parameters);
	const duration = 1e-20;
	const sample = model.at(duration);
	close(sample.transferredCharge, duration * model.initialCurrent, 1e-35);
});

test("rejects invalid resistance, capacitance, initial charge, sampling time and cutoff", () => {
	for (const invalid of [
		{ resistance: 0 }, { resistance: Infinity }, { capacitance: -1 },
		{ emf: NaN }, { initialCharge: Infinity },
	]) {
		assert.throws(() => new NoIonicPathTransientModel({ ...parameters, ...invalid }), RangeError);
	}
	const model = new NoIonicPathTransientModel(parameters);
	assert.throws(() => model.at(-1), RangeError);
	assert.throws(() => model.timeToCutoff(0), RangeError);
});
