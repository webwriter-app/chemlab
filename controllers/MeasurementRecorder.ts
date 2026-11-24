import type { ReactiveController } from "lit";
import { EComponentType, Simulation, StructureManager, molarGasVolume, type ChemComponent, type ElectricComponent, type Mixture, type NoIonicPathTransientModel } from "../chemlib";
import { evolvedGases } from "../chemlib/gasEvolution";
import { MeasurementHistory, type MeasurementChannel } from "../data/measurementHistory";
import type { ChemLab } from "../webwriter-chemlab";

type Component = ChemComponent | ElectricComponent;
type Equilibrium = ReturnType<typeof Simulation.getPolyproticEquilibrium>;

export class MeasurementRecorder implements ReactiveController {
	readonly history = new MeasurementHistory();
	private readonly groups = new WeakMap<ChemComponent, Map<string, string>>();
	private readonly delivery = new WeakMap<ChemComponent, number>();
	private readonly firstDoses = new Map<string, { receiverPH: string; time: number }>();
	private expiry?: ReturnType<typeof setTimeout>;
	onChange?: () => void;

	constructor(private readonly host: ChemLab) {
		host.addController(this);
	}

	hostConnected(): void {
		this.scheduleExpiry();
	}

	hostDisconnected(): void {
		clearTimeout(this.expiry);
		this.expiry = undefined;
	}

	private scheduleExpiry(): void {
		if (!this.host.isConnected || this.expiry !== undefined) return;
		const next = this.history.nextExpiry;
		if (next === undefined) return;
		this.expiry = setTimeout(() => {
			this.expiry = undefined;
			if (this.history.prune()) this.onChange?.();
			this.scheduleExpiry();
		}, Math.max(0, Math.ceil(next - this.history.now())));
	}

	private prefix(component: Component): string {
		return `${component._type}:${component._id}/`;
	}

	private channel(component: Component, group: MeasurementChannel["group"],
		quantity: string, unit?: string, species?: string, key = ""): MeasurementChannel {
		return { id: this.prefix(component) + quantity + key, group, component: component._type,
			number: component._id + 1, quantity, unit, species };
	}

	record(vessels: readonly ChemComponent[] = [], instruments: readonly ElectricComponent[] = [],
		delivery?: { source: ChemComponent; target: ChemComponent; volume: number }): ReadonlyMap<Mixture, Equilibrium | undefined> {
		const time = this.history.now();
		let changed = false;
		// These snapshots belong to this measurement only. A caller can reuse
		// them for an immediate readout before the next simulation mutation.
		const mixtures = new Map<Mixture, Equilibrium | undefined>();
		for (const vessel of vessels) {
			const mix = vessel._content;
			if (!mixtures.has(mix)) mixtures.set(mix, mix._isSolution && mix._solutionVolume > 0
				? Simulation.getPolyproticEquilibrium(mix) : undefined);
			changed = this.recordVessel(vessel, time, mixtures.get(mix)) || changed;
		}
		if (delivery && delivery.source._type === "burette") {
			const { source, target, volume } = delivery;
			const channel = this.deliveredVolumeChannel(source);
			const previous = this.delivery.get(source);
			if (previous === undefined) {
				this.firstDoses.set(channel.id, { receiverPH: this.channel(target, "vessel", "pH").id, time });
			}
			const total = (previous ?? 0) + volume;
			this.delivery.set(source, total);
			changed = this.history.record(channel, total, time, true) || changed;
		}
		const meters = new Set(instruments);
		if (mixtures.size) {
			for (const device of this.host.allEComponents) {
				if (device._type === EComponentType.GasCollector && mixtures.has(device._connectedMix)) meters.add(device);
			}
		}
		for (const device of meters) changed = this.recordInstrument(device, time) || changed;
		if (changed) {
			this.onChange?.();
			this.scheduleExpiry();
		}
		return mixtures;
	}

	// The setup sample at 0 mL may expire while the titration itself is still recorded.
	firstTitrationDoseTime(deliveredVolume: string, pH: string): number | undefined {
		const dose = this.firstDoses.get(deliveredVolume);
		return dose?.receiverPH === pH ? dose.time : undefined;
	}

	startTransient(model: NoIonicPathTransientModel,
		meterFactors: ReadonlyMap<ElectricComponent, { voltage: number; current: number }>): (elapsed: number) => void {
		const factors = new Map<string, number>();
		for (const [device, { voltage, current }] of meterFactors) {
			if (device._type === EComponentType.Voltmeter ||
				(device._type === EComponentType.Multimeter && device._meterMode === "voltage")) {
				factors.set(this.channel(device, "instrument", "Spannung", "V").id, voltage);
			} else if (device._type === EComponentType.Ammeter || device._type === EComponentType.Multimeter) {
				factors.set(this.channel(device, "instrument", "Stromstärke", "A").id, current);
			}
		}
		const advance = this.history.startTransient(model.timeConstant, elapsed => model.at(elapsed).current, factors);
		this.scheduleExpiry();
		return advance;
	}

	retire(components: readonly Component[]): void {
		if (!components.length) return;
		const time = this.history.now();
		for (const component of components) this.history.retire(this.prefix(component), time);
		this.onChange?.();
		this.scheduleExpiry();
	}

	/**
	 * Forgets the whole recording, for instance when the canvas returns to its
	 * starting layout. The per-component bookkeeping lives in weak maps and
	 * dies with the components a reset replaces.
	 */
	clear(): void {
		this.history.clear();
		this.firstDoses.clear();
		clearTimeout(this.expiry);
		this.expiry = undefined;
		this.onChange?.();
	}

	private recordVessel(vessel: ChemComponent, time: number, equilibrium?: Equilibrium): boolean {
		const mix = vessel._content;
		const inventory = new Map<string, { name: string; amount: number; concentration: number | null }>();
		let mass = 0;
		const solution = mix._isSolution && mix._solutionVolume > 0;
		for (const molecule of mix._activeMolecules) {
			const amount = mix._molProperties[molecule._id + "n"];
			mass += mix._molProperties[molecule._id + "m"] || 0;
			if (!Number.isFinite(amount) || equilibrium?.analyticalMolecules.has(molecule)) continue;
			const phase = molecule.solidSaltFormula ||
				(molecule.dosedAsSolid && !(solution && StructureManager.isAcidBase(molecule))) ? "solid" : "bulk";
			const key = `${phase}/${molecule.smilesString}`;
			const previous = inventory.get(key);
			inventory.set(key, { name: molecule.name ?? molecule.smilesString, amount: amount + (previous?.amount ?? 0),
				concentration: solution && phase !== "solid" ? (amount + (previous?.amount ?? 0)) / mix._solutionVolume : null });
		}
		for (const species of equilibrium?.species ?? []) {
			const key = "equilibrium/" + species.formula;
			const previous = inventory.get(key);
			inventory.set(key, { name: species.formula, amount: species.amount + (previous?.amount ?? 0),
				concentration: species.concentration + (previous?.concentration ?? 0) });
		}
		for (const [id, amount] of mix.dissolvedGas) {
			const gas = evolvedGases[id];
			if (!gas) continue;
			inventory.set("dissolved/" + id, { name: gas.formula + " (aq)", amount,
				concentration: solution ? amount / mix._solutionVolume : null });
		}
		for (const [id, amount] of mix.evolvedGas) {
			const gas = evolvedGases[id];
			if (!gas) continue;
			if (gas.phase !== "gas") mass += amount * (gas.molarMass ?? 0);
			inventory.set("separated/" + id, { name: gas.formula + " (" + ({ gas: "g", liquid: "l", solid: "s" })[gas.phase] + ")",
				amount, concentration: null });
		}
		let known = this.groups.get(vessel);
		if (!known) this.groups.set(vessel, known = new Map());
		for (const [key, { name }] of inventory) known.set(key, name);

		const record = (quantity: string, value: Reading, unit?: string, species?: string, key?: string) =>
			this.history.record(this.channel(vessel, "vessel", quantity, unit, species, key), value, time, true);
		let changed = record("pH", equilibrium?.pH ?? null);
		changed = record("Volumen", mix.contentVolume * 1000, "mL") || changed;
		changed = record("Masse", mass, "g") || changed;
		if (vessel._type === "burette") {
			changed = this.history.record(this.deliveredVolumeChannel(vessel), this.delivery.get(vessel) ?? 0, time, true) || changed;
		}
		for (const [key, name] of known) {
			const species = inventory.get(key);
			changed = record("Stoffmenge", species?.amount ?? 0, "mol", name, key) || changed;
			if (!key.startsWith("solid/") && !key.startsWith("separated/")) {
				changed = record("Konzentration", species ? species.concentration : solution ? 0 : null, "mol/L", name, key) || changed;
			}
		}
		return changed;
	}

	private deliveredVolumeChannel(vessel: ChemComponent): MeasurementChannel {
		return this.channel(vessel, "vessel", "Abgegebenes Volumen", "mL");
	}

	private recordInstrument(device: ElectricComponent, time: number): boolean {
		const record = (quantity: string, value: Reading, unit: string, changesOnly = false) =>
			this.history.record(this.channel(device, "instrument", quantity, unit), value, time, changesOnly);
		switch (device._type) {
			case EComponentType.GasCollector: {
				const mix = device._connectedMix;
				const ml = mix ? Math.max(0, mix.evolvedGasMol - device._tubeBaseline) *
					molarGasVolume(mix._temperature, mix._pressure) * 1000 : null;
				return record("Gesammeltes Gasvolumen", ml, "mL", true);
			}
			case EComponentType.Source:
			case EComponentType.Multimeter: {
				const voltage = record("Spannung", device._type === EComponentType.Source || device._meterMode === "voltage"
					? device._visibleVoltage : null, "V");
				const current = record("Stromstärke", device._type === EComponentType.Source || device._meterMode === "current"
					? device._visibleCurrent : null, "A");
				return voltage || current;
			}
			case EComponentType.Voltmeter:
				return record("Spannung", device._visibleVoltage, "V");
			case EComponentType.Ammeter:
				return record("Stromstärke", device._visibleCurrent, "A");
			default:
				return false;
		}
	}
}

type Reading = number | null;
