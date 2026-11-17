export interface NoIonicPathTransientParameters {
	/** Signed cell EMF in volts, measured as first electrode minus second. */
	emf: number;
	/** Total effective series resistance in ohms, including the external load. */
	resistance: number;
	/** Effective capacitance of the isolated system in farads. */
	capacitance: number;
	initialCharge?: number;
}

export interface NoIonicPathTransientSample {
	elapsedSeconds: number;
	current: number;
	charge: number;
	transferredCharge: number;
	electronEquivalents: number;
	opposingVoltage: number;
	drivingVoltage: number;
}

const FARADAY_CONSTANT = 96485.33212;

/** Ideal series RC approximation. Charge here is electrical, not a chemical extent. */
export class NoIonicPathTransientModel {
	readonly timeConstant: number;
	readonly initialCurrent: number;
	private readonly initialCharge: number;
	private readonly initialOpposingVoltage: number;
	private readonly initialDrive: number;
	private readonly chargeSpan: number;

	constructor({ emf, resistance, capacitance, initialCharge = 0 }: NoIonicPathTransientParameters) {
		this.timeConstant = resistance * capacitance;
		this.initialCharge = initialCharge;
		this.initialOpposingVoltage = initialCharge / capacitance;
		this.initialDrive = emf - this.initialOpposingVoltage;
		this.initialCurrent = this.initialDrive / resistance;
		this.chargeSpan = capacitance * this.initialDrive;
		if (!(resistance > 0 && capacitance > 0 && this.timeConstant > 0) ||
			![resistance, capacitance, emf, initialCharge, this.timeConstant,
				this.initialDrive, this.initialCurrent, this.chargeSpan].every(Number.isFinite)) {
			throw new RangeError("Expected finite RC parameters with positive resistance and capacitance");
		}
	}

	at(elapsedSeconds: number): NoIonicPathTransientSample {
		if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
			throw new RangeError("Expected finite, nonnegative elapsed time");
		}
		const exponent = -elapsedSeconds / this.timeConstant;
		const remaining = Math.exp(exponent);
		const fraction = -Math.expm1(exponent);
		const transferredCharge = this.chargeSpan * fraction;
		return {
			elapsedSeconds,
			current: this.initialCurrent * remaining,
			charge: this.initialCharge + transferredCharge,
			transferredCharge,
			electronEquivalents: transferredCharge / FARADAY_CONSTANT,
			opposingVoltage: this.initialDrive * fraction + this.initialOpposingVoltage,
			drivingVoltage: this.initialDrive * remaining,
		};
	}

	timeToCutoff(currentMagnitude: number): number {
		if (!Number.isFinite(currentMagnitude) || currentMagnitude <= 0) {
			throw new RangeError("Expected a finite, positive cutoff current");
		}
		const initialMagnitude = Math.abs(this.initialCurrent);
		return currentMagnitude >= initialMagnitude ? 0
			: this.timeConstant * (Math.log(initialMagnitude) - Math.log(currentMagnitude));
	}
}
