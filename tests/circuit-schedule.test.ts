import assert from "node:assert/strict";
import { test } from "node:test";
import { CircuitSchedule, type CircuitClock } from "../controllers/CircuitSchedule";
import { ComponentManager, EComponentType as Type, Simulation, StructureManager, connectDevices,
	type ElectricComponent } from "../chemlib";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

/** A clock that runs one fixed step per call, so the test counts steps. */
class TestClock implements CircuitClock {
	readonly tasks = new Map<string, () => void>();

	startFixedStepTask(name: string, step: () => void): void {
		this.tasks.set(name, step);
	}

	stopTask(name: string): void {
		this.tasks.delete(name);
	}

	/** Runs the registered steps, as one simulation frame would. */
	tick(times = 1): void {
		for (let index = 0; index < times; index++) {
			for (const step of [...this.tasks.values()]) step();
		}
	}
}

/** An instrument as the schedule sees it: an identity and nothing else. */
interface Stub {
	_type: string;
	_id: number;
	net?: string;
}

/**
 * Wires a schedule the way the widget does: the instruments that are
 * switched on decide the circuits, and one step of a circuit reaches the
 * chemistry.
 */
function harness() {
	const clock = new TestClock();
	const active = new Map<Stub, true>();
	const advances: string[] = [];
	const device = (stub: Stub) => stub as unknown as ElectricComponent;
	const schedule = new CircuitSchedule(clock, () => [...active.keys()].map(device),
		(stub) => (stub as unknown as Stub).net,
		(stub) => { advances.push(`${(stub as unknown as Stub)._type}:${(stub as unknown as Stub)._id}`); });
	const switchOn = (stub: Stub) => { active.set(stub, true); schedule.reconcile(); };
	const switchOff = (stub: Stub) => { active.delete(stub); schedule.reconcile(); };
	return { clock, schedule, advances, switchOn, switchOff };
}

test("one clock per circuit advances it once per step, whatever hangs in it", () => {
	const { clock, schedule, advances, switchOn } = harness();
	const source: Stub = { _type: "source", _id: 1, net: "a" };
	const ammeter: Stub = { _type: "ammeter", _id: 2, net: "a" };
	const voltmeter: Stub = { _type: "voltmeter", _id: 3, net: "a" };
	for (const device of [source, ammeter, voltmeter]) switchOn(device);
	assert.equal(schedule.clockCount, 1);
	clock.tick(10);
	// Three instruments used to advance the same cell three times per step.
	assert.equal(advances.length, 10);
	assert.deepEqual(new Set(advances), new Set(["source:1"]));
});

test("two circuits keep separate clocks and one instrument starting later joins the phase", () => {
	const { clock, schedule, advances, switchOn } = harness();
	const source: Stub = { _type: "source", _id: 1, net: "a" };
	const meter: Stub = { _type: "ammeter", _id: 2, net: "a" };
	const otherSource: Stub = { _type: "source", _id: 3, net: "b" };
	switchOn(source);
	switchOn(otherSource);
	assert.equal(schedule.clockCount, 2);
	clock.tick(10);
	assert.equal(advances.length, 20);
	const tasks = [...clock.tasks.keys()];
	switchOn(meter);
	// A second instrument of a running circuit does not restart it.
	assert.deepEqual([...clock.tasks.keys()], tasks);
	advances.length = 0;
	clock.tick(10);
	assert.equal(advances.length, 20);
});

test("switching an instrument off leaves the circuit running and stopping the last one ends it", () => {
	const { clock, schedule, advances, switchOn, switchOff } = harness();
	const source: Stub = { _type: "source", _id: 1, net: "a" };
	const meter: Stub = { _type: "voltmeter", _id: 2, net: "a" };
	switchOn(source);
	switchOn(meter);
	switchOff(meter);
	assert.equal(schedule.clockCount, 1);
	advances.length = 0;
	clock.tick(10);
	assert.equal(advances.length, 10);
	switchOff(source);
	assert.equal(schedule.clockCount, 0);
	assert.equal(clock.tasks.size, 0);
	clock.tick(10);
	assert.equal(advances.length, 10);
});

test("a rewired circuit splits into two clocks and a removed one is closed", () => {
	const { clock, schedule, switchOn } = harness();
	const first: Stub = { _type: "source", _id: 1, net: "ab" };
	const second: Stub = { _type: "voltmeter", _id: 2, net: "ab" };
	switchOn(first);
	switchOn(second);
	assert.equal(schedule.clockCount, 1);
	first.net = "a";
	second.net = "b";
	schedule.reconcile();
	assert.equal(schedule.clockCount, 2);
	assert.equal(clock.tasks.size, 2);
	// A device that hangs in nothing is no circuit of its own.
	const lonely: Stub = { _type: "ammeter", _id: 3 };
	switchOn(lonely);
	assert.equal(schedule.clockCount, 2);
	switchOn(lonely);
	schedule.clear();
	assert.equal(schedule.clockCount, 0);
	assert.equal(clock.tasks.size, 0);
});

/** A mixture of the named chemical, solvated like a dosed vessel. */
function dose(name: string, ml = 100) {
	const recipe = chemicalCatalog.find(item => item.name === name)?.recipe;
	assert.ok(recipe, name);
	const mixture = prepareDose(recipe, loadMoleculeDefinition)?.(ml);
	assert.ok(mixture, name);
	Simulation.sSolvation(mixture);
	return mixture;
}

/** A metal strip dipped into a solution. */
function electrode(element: string, symbol: string, mix = dose("Wasser")) {
	const material = StructureManager.newMolecule();
	material.addAtom(element, symbol);
	return ComponentManager.newElectricComponent(Type.Electrode, { nMixture: mix, nMaterial: material });
}

/**
 * A Daniell cell under a 3 V supply, switched on as many instruments as it
 * carries. The supply's plus pole sits on the copper side, so zinc is
 * reduced onto the zinc strip and copper goes into solution; the deposit on
 * the strip is the turnover the step booked.
 */
function drivenCell(withMeter: boolean) {
	const copper = electrode("copper", "Cu", dose("Kupfer(II)-sulfatlösung"));
	const zinc = electrode("zinc", "Zn", dose("Zinksulfatlösung"));
	const source = ComponentManager.newElectricComponent(Type.Source, { nSourceVoltage: 3 });
	source._polarity = 1;
	assert.ok(connectDevices(source, copper, 0));
	assert.ok(connectDevices(source, zinc, 1));
	const meter = withMeter ? ComponentManager.newElectricComponent(Type.Voltmeter) : undefined;
	if (meter) {
		assert.ok(connectDevices(meter, source, 0));
		assert.ok(connectDevices(meter, source, 1));
	}
	const devices = meter ? [source, meter] : [source];
	const step = () => Simulation.sEChem(copper, zinc, devices, { bridge: true });
	const instruments = meter ? [source, meter] : [source];
	const identity = (device: ElectricComponent) => ComponentManager.connectedDevices(device)
		.map(member => `${member._type}:${member._id}/${member._connectedMix?._id ?? ""}`).sort().join(",");
	return { zinc, step, instruments, identity };
}

/** How much of the last step's turnover the run booked, in mole. */
function deposit(zinc: ElectricComponent): number {
	return zinc.plating?.mol ?? 0;
}

test("a supply with a parallel voltmeter reacts at the rate of one solve per step", () => {
	const scheduled = drivenCell(true);
	const clock = new TestClock();
	const schedule = new CircuitSchedule(clock, () => scheduled.instruments,
		scheduled.identity, () => scheduled.step());
	schedule.reconcile();
	assert.equal(schedule.clockCount, 1);
	clock.tick(10);

	const once = drivenCell(false);
	for (let step = 0; step < 10; step++) once.step();
	const twice = drivenCell(false);
	for (let step = 0; step < 20; step++) twice.step();

	const driven = deposit(scheduled.zinc);
	assert.ok(driven > 0, "the cell books a turnover");
	// The voltmeter draws almost nothing, so ten circuit steps book what ten
	// solves book; the difference is the load of the meter itself.
	assert.ok(Math.abs(driven / deposit(once.zinc) - 1) < 1e-4,
		`scheduled ${driven} mol, single solve ${deposit(once.zinc)} mol`);
	// The old behaviour advanced the cell once per instrument, so the same
	// ten steps booked a doubled turnover. That must not come back.
	const doubled = deposit(twice.zinc) / driven;
	assert.ok(doubled > 1.9 && doubled < 2.1, `twenty solves turn over ${doubled} times ten`);
});
