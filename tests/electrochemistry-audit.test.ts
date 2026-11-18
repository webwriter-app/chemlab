import assert from "node:assert/strict";
import { test } from "node:test";
import { ComponentManager, EComponentType as Type, Simulation, StructureManager, connectDevices, type ElectricComponent } from "../chemlib";
import { chemicalCatalog } from "../data/chemicals";
import { prepareDose } from "../data/measuredDose";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";

function dose(name: string, ml = 100) {
	const recipe = chemicalCatalog.find(item => item.name === name)?.recipe;
	assert.ok(recipe, name);
	const mixture = prepareDose(recipe, loadMoleculeDefinition)?.(ml);
	assert.ok(mixture, name);
	Simulation.sSolvation(mixture);
	return mixture;
}

function electrode(element: string, symbol: string, mix = dose("Wasser")) {
	const material = StructureManager.newMolecule();
	material.addAtom(element, symbol);
	return ComponentManager.newElectricComponent(Type.Electrode, { nMixture: mix, nMaterial: material });
}

function wire(a: ElectricComponent, b: ElectricComponent, terminal: number) {
	assert.ok(connectDevices(a, b, terminal), `${a._type}–${b._type}`);
}

function cell() {
	return [electrode("copper", "Cu", dose("Kupfer(II)-sulfatlösung")),
		electrode("zinc", "Zn", dose("Zinksulfatlösung"))] as const;
}

test("separated Daniell cell blocks DC, including when an electrode is dry", () => {
	const [copper, zinc] = cell();
	const meter = ComponentManager.newElectricComponent(Type.Ammeter);
	wire(meter, copper, 0);
	wire(meter, zinc, 1);
	Simulation.sEChem(copper, zinc, [meter]);
	assert.equal(meter._visibleCurrent, null);
	const prepared = Simulation.prepareNoIonicPathTransient(copper, zinc, [meter], Infinity, { capacitance: 1e-5 });
	assert.ok(prepared);
	prepared.readMeters(prepared.model.at(0));
	assert.ok(meter._visibleCurrent > 0);
	Simulation.sEChem(copper, zinc, [meter], { bridge: true });
	assert.ok(meter._visibleCurrent > 0);
	const wet = copper._immersion = { x: 0, area: 0 };
	assert.equal(Simulation.ionicResistance(copper, zinc, true), Infinity);
	assert.equal(Simulation.prepareNoIonicPathTransient(copper, zinc, [meter], Infinity, { capacitance: 1e-5 }), undefined);
	Simulation.sEChem(copper, zinc, [meter], { ionicResistance: 1 });
	assert.equal(meter._visibleCurrent, null);
	wet.area = 1;
	assert.ok(Number.isFinite(Simulation.ionicResistance(copper, zinc, true)));
});

test("reports a solved supply's terminal voltage and caps its total branch current", () => {
	const [copper, zinc] = cell();
	const source = ComponentManager.newElectricComponent(Type.Source, { nSourceVoltage: 3, nSourceCurrent: 0.2 });
	source._polarity = 1;
	wire(source, copper, 0);
	wire(source, zinc, 1);
	Simulation.sEChem(copper, zinc, [source], { bridge: true });
	assert.ok(source._visibleVoltage > 2.9 && source._visibleVoltage < 3);

	const meter = ComponentManager.newElectricComponent(Type.Ammeter);
	wire(meter, source, 0);
	wire(meter, source, 1);
	Simulation.sEChem(copper, zinc, [source, meter], { bridge: true });
	assert.ok(Math.abs(Math.abs(source._visibleCurrent) - 0.2) < 1e-8);
	assert.ok(Math.abs(meter._visibleCurrent) > Math.abs(source._cellCurrent));
	source._sourceMode = "current";
	source._sourceCurrent = 0.001;
	source._complianceVoltage = 10;
	Simulation.sEChem(copper, zinc, [source, meter], { bridge: true });
	assert.ok(Math.abs(Math.abs(source._visibleCurrent) - 0.001) < 1e-8);
});

test("additional reference senses the working electrode and stops reading when dry", () => {
	const [copper, zinc] = cell();
	const meter = ComponentManager.newElectricComponent(Type.Voltmeter);
	const sense = ComponentManager.newElectricComponent(Type.Voltmeter);
	const reference = ComponentManager.newElectricComponent(Type.Electrode, { nMixture: copper._connectedMix });
	reference._reference = 0.222;
	wire(meter, copper, 0);
	wire(meter, zinc, 1);
	wire(sense, copper, 0);
	wire(sense, reference, 1);
	Simulation.sEChem(copper, zinc, [reference, meter, sense], { bridge: true });
	assert.ok(Math.abs(meter._visibleVoltage - 1.1) < 0.01);
	assert.ok(Math.abs(sense._visibleVoltage - 0.117) < 0.005);
	// The zinc electrode corrodes locally, so its half-cell collects hydrogen
	// and the cell reading drifts a few millivolts per solve step. The dry
	// reference is therefore checked against the reading it had while wet:
	// what matters is that it does not disturb the cell, not the absolute
	// value, which moves on its own.
	const wet = meter._visibleVoltage;
	reference._immersion = { x: 0, area: 0 };
	Simulation.sEChem(copper, zinc, [reference, meter, sense], { bridge: true });
	assert.equal(sense._visibleVoltage, null);
	assert.ok(Math.abs(meter._visibleVoltage - wet) < 0.02);
});

test("re-running solvation leaves chlorine at equilibrium and never consumes escaped gas", () => {
	const mix = dose("Wasser");
	mix.evolveGas("Cl2", 0.001);
	mix.admitGas("Cl2", 0.002, 0.09);
	Simulation.sSolvation(mix);
	const first = mix.hypochlorite;
	assert.ok(first > 0 && first < 0.002, `hypochlorite ${first}`);
	assert.ok(Simulation.getpH(mix) < 3, `pH ${Simulation.getpH(mix)}`);
	Simulation.sSolvation(mix);
	assert.ok(Math.abs(first - mix.hypochlorite) < 1e-10, `${first} -> ${mix.hypochlorite}`);
	assert.equal(mix.evolvedGas.get("Cl2"), 0.001);
});
