import assert from "node:assert/strict";
import { test } from "node:test";
import { AcidBase, ComponentManager, EComponentType as Type, Simulation, StructureManager, connectDevices, connectionPairs, plugCable,
	restoreCables, type ElectricComponent } from "../chemlib";
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

function moles(mix: ReturnType<typeof dose>, smiles: string): number {
	return mix._activeMolecules.reduce((sum, molecule) => sum + (molecule.smilesString === smiles
		? mix._molProperties[molecule._id + "n"] : 0), 0);
}

function metalMoles(mix: ReturnType<typeof dose>, symbol: string): number {
	return mix._activeMolecules.reduce((sum, molecule) => sum + mix._molProperties[molecule._id + "n"] *
		molecule._atoms.filter(atom => atom.getSymbol() === symbol).length, 0);
}

test("a bridged step shares bath equilibria between conductivity and electrode candidates", t => {
	const implicit = cell();
	const explicit = cell();
	const connect = ([first, second]: ReturnType<typeof cell>) => {
		const meter = ComponentManager.newElectricComponent(Type.Voltmeter);
		wire(first, meter, 0);
		wire(second, meter, 0);
		return meter;
	};
	const implicitMeter = connect(implicit);
	const explicitMeter = connect(explicit);
	const proton = t.mock.method(AcidBase, "solveProton");
	const resistance = Simulation.ionicResistance(...explicit, true);
	Simulation.sEChem(...explicit, [explicitMeter], { ionicResistance: resistance });
	const separateSolves = proton.mock.callCount();
	proton.mock.resetCalls();

	Simulation.sEChem(...implicit, [implicitMeter], { bridge: true });
	assert.equal(proton.mock.callCount(), separateSolves - 2);
	assert.equal(implicitMeter._visibleCurrent, explicitMeter._visibleCurrent);
	assert.equal(implicitMeter._visibleVoltage, explicitMeter._visibleVoltage);
	assert.ok(implicitMeter._visibleVoltage > 1);
});

test("unwired iron and zinc acquire a copper coating while their own metal dissolves", () => {
	for (const [element, symbol] of [["iron", "Fe"], ["zinc", "Zn"]]) {
		const mix = dose("Kupfer(II)-sulfatlösung");
		const strip = electrode(element, symbol, mix);
		strip._immersion = { x: 0, area: 0 };
		const before = metalMoles(mix, "Cu");
		assert.equal(Simulation.sSurfaceDisplacement(strip), false);
		const span = { top: 12, bottom: 35 };
		strip._immersion = { x: 0, area: 3.45, span };
		assert.equal(Simulation.sSurfaceDisplacement(strip), true);
		const deposit = strip.plating.mol;
		assert.equal(Simulation.sSurfaceDisplacement(strip), true);
		assert.ok(strip.plating.mol > deposit);
		assert.equal(strip.plating.molecule.smilesString, "[Cu]");
		assert.deepEqual(strip.plating.span, span);
		const consumed = before - metalMoles(mix, "Cu");
		assert.ok(Math.abs(consumed - strip.plating.mol) < 1e-12,
			`${symbol}: ${consumed} mol Cu consumed, ${strip.plating.mol} mol Cu deposited`);
		assert.ok(Math.abs(metalMoles(mix, symbol) - strip.plating.mol) < 1e-12);
		assert.equal(moles(mix, "[Cu]"), 0);
		strip._immersion = { x: 0, area: 0 };
		const wetDeposit = strip.plating.mol;
		assert.equal(Simulation.sSurfaceDisplacement(strip), false);
		assert.equal(strip.plating.mol, wetDeposit);
		assert.deepEqual(strip.plating.span, span);
	}
});

test("surface displacement respects stoichiometry, depletion and circuit ownership", () => {
	const solution = dose("Silbernitratlösung");
	const copper = electrode("copper", "Cu", solution);
	copper._bodyMol = 1e-9;
	const before = moles(solution, "[Ag+]");
	const lead = connectDevices(copper, ComponentManager.newElectricComponent(Type.Voltmeter));
	assert.equal(Simulation.sSurfaceDisplacement(copper), false);
	copper.disconnect(lead);
	assert.equal(Simulation.sSurfaceDisplacement(copper), true);
	assert.equal(Simulation.sSurfaceDisplacement(copper), false);
	assert.equal(copper.plating.molecule.smilesString, "[Ag]");
	assert.ok(Math.abs(moles(solution, "[Cu2+]") - 1e-9) < 1e-12);
	assert.ok(Math.abs(copper.plating.mol - 2e-9) < 1e-12);
	assert.ok(Math.abs(before - moles(solution, "[Ag+]") - copper.plating.mol) < 1e-12);
	const control = electrode("copper", "Cu", dose("Zinksulfatlösung"));
	assert.equal(Simulation.sSurfaceDisplacement(control), false);
	assert.equal(control.plating, undefined);
});

test("both explicit current-limit leads restore with saved component casing", () => {
	const source = ComponentManager.newElectricComponent(Type.Source, { nSourceVoltage: 2, nSourceCurrent: 0.2 });
	source._polarity = 1;
	const meter = ComponentManager.newElectricComponent(Type.Multimeter);
	meter._meterMode = "current";
	const first = ComponentManager.newElectricComponent(Type.Cable);
	const second = ComponentManager.newElectricComponent(Type.Cable);
	const components = [source, meter, first, second];
	const entries = [
		{ type: "Source", id: source._id },
		{ type: "Multimeter", id: meter._id },
		{ type: "Cable", id: first._id, connections: [0, 1] },
		{ type: "cable", id: second._id, connections: [0, 1] },
	];
	assert.deepEqual(restoreCables(entries, id => components.find(device => device._id === id), plugCable),
		{ plugged: 4, skipped: 0, missing: 0 });
	assert.deepEqual(connectionPairs(entries), []);
	for (const device of [source, meter]) assert.deepEqual(device._connections, [[first], [second]]);
	Simulation.sCircuit(ComponentManager.connectedDevices(source));
	assert.ok(Math.abs(meter._visibleCurrent - 0.2) < 1e-8);
});

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

test("SHE and calomel measure voltage but cannot serve as current-carrying half-cells", () => {
	for (const potential of [0, 0.241]) {
		const [copper] = cell();
		const reference = ComponentManager.newElectricComponent(Type.Electrode, { nMixture: copper._connectedMix });
		reference._reference = potential;
		const meter = ComponentManager.newElectricComponent(Type.Multimeter);
		wire(meter, copper, 0);
		wire(meter, reference, 1);
		Simulation.sEChem(copper, reference, [meter]);
		assert.ok(Math.abs(meter._visibleVoltage - (0.34 - potential)) < 0.01);
		assert.equal(meter._visibleCurrent, 0);

		const bypass = connectDevices(copper, reference);
		assert.ok(bypass);
		Simulation.sEChem(copper, reference, [meter]);
		assert.equal(meter._cellCurrent, null);
		copper.disconnect(bypass);

		meter._meterMode = "current";
		Simulation.sEChem(copper, reference, [meter]);
		assert.equal(meter._cellCurrent, null);
		assert.equal(meter._visibleCurrent, null);
		assert.equal(reference.plating, undefined);
	}
});

test("loading a dedicated reference lead invalidates its reading without stopping the working cell", () => {
	const [copper, zinc] = cell();
	const cellMeter = ComponentManager.newElectricComponent(Type.Voltmeter);
	const sense = ComponentManager.newElectricComponent(Type.Voltmeter);
	const shunt = ComponentManager.newElectricComponent(Type.Ammeter);
	const reference = ComponentManager.newElectricComponent(Type.Electrode, { nMixture: copper._connectedMix });
	reference._reference = 0.241;
	wire(cellMeter, copper, 0);
	wire(cellMeter, zinc, 1);
	wire(sense, copper, 0);
	wire(sense, reference, 1);
	wire(shunt, reference, 0);
	wire(shunt, copper, 1);
	Simulation.sEChem(copper, zinc, [reference, cellMeter, sense, shunt], { bridge: true });
	assert.ok(Math.abs(cellMeter._visibleVoltage - 1.1) < 0.01);
	assert.equal(sense._visibleVoltage, null);
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
