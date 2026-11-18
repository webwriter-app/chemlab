export const TIME_CHANNEL = "time";
const RETENTION_MS = 300_000;
const ARCHIVE_WINDOW_MS = 1000;

export type MeasurementChannel = {
	id: string;
	group: "vessel" | "instrument";
	component: string;
	number: number;
	quantity: string;
	unit?: string;
	species?: string;
};

type Reading = number | null;
type Sample = { time: number; value: Reading; analytic?: boolean };
type Series = { channel: MeasurementChannel; samples: SampleBuffer; current: boolean; lastReading?: number };

interface Samples {
	readonly length: number;
	time(index: number): number;
	value(index: number): Reading;
	analytic?(index: number): boolean;
}

/** Interleaved Float64 timestamp/value pairs. NaN encodes an unavailable sample. */
class SampleBuffer implements Samples {
	private data = new Float64Array(0);
	private start = 0;
	length = 0;

	time(index: number): number {
		return this.data[2 * (this.start + index)];
	}

	value(index: number): Reading {
		const value = this.data[2 * (this.start + index) + 1];
		return Number.isNaN(value) ? null : value;
	}

	replace(index: number, value: Reading): void {
		this.data[2 * (this.start + index) + 1] = value ?? NaN;
	}

	push(time: number, value: Reading): void {
		if (2 * (this.start + this.length) === this.data.length) {
			if (this.start > this.length / 2) {
				this.data.copyWithin(0, this.start * 2);
			} else {
				const expanded = new Float64Array(Math.max(8, this.data.length * 2));
				expanded.set(this.data.subarray(this.start * 2));
				this.data = expanded;
			}
			this.start = 0;
		}
		const end = this.length++;
		this.data[2 * (this.start + end)] = time;
		this.replace(end, value);
	}

	discard(count: number): void {
		this.start += count;
		this.length -= count;
		if (this.data.length > Math.max(8, 8 * this.length)) {
			this.data = this.data.slice(this.start * 2, (this.start + this.length) * 2);
			this.start = 0;
		}
	}
}

const EMPTY_SAMPLES = new SampleBuffer();
export type PlotPoint = { time: number; x: number | null; y: number | null; analytic?: boolean };
type Transient = {
	start: number;
	duration: number;
	timeConstant: number;
	currentAt: (elapsed: number) => number;
	factors: ReadonlyMap<string, number>;
};

type AxisPair = { x: string; y: string; references: number; archive: PlotPoint[] };

/** A common timeline, independent of the canvas and of Chart.js. */
export class MeasurementHistory {
	private readonly series = new Map<string, Series>();
	private readonly pairs = new Map<string, AxisPair>();
	private transients: Transient[] = [];
	private archivedUntil = 0;
	private latestTime = 0;
	channelVersion = 0;

	constructor(private readonly epoch = performance.now()) {}

	now(): number {
		return Math.max(this.latestTime, performance.now() - this.epoch);
	}

	get channels(): MeasurementChannel[] {
		return [...this.series.values()].map(({ channel }) => channel);
	}

	hasReading(id: string): boolean {
		const time = this.series.get(id)?.lastReading;
		return time !== undefined && time >= this.now() - RETENTION_MS;
	}

	record(channel: MeasurementChannel, value: Reading, time: number, changesOnly = false): boolean {
		time = Math.max(this.latestTime, time);
		this.latestTime = time;
		let series = this.series.get(channel.id);
		if (!series) {
			series = { channel, samples: new SampleBuffer(), current: true };
			this.series.set(channel.id, series);
			this.channelVersion++;
		}
		if (value !== null && !Number.isFinite(value)) value = null;
		const samples = series.samples;
		const last = samples.length - 1;
		const previous = last < 0 ? undefined : samples.value(last);
		if (last >= 0 && samples.time(last) === time) {
			if (previous === value) return false;
			samples.replace(last, value);
		} else {
			if ((changesOnly || value === null) && previous === value) return false;
			samples.push(time, value);
		}
		if (value !== null) {
			if (series.lastReading === undefined || series.lastReading < time - RETENTION_MS) this.channelVersion++;
			series.lastReading = time;
		}
		return true;
	}

	startTransient(timeConstant: number, currentAt: Transient["currentAt"],
		factors: Transient["factors"]): (elapsed: number) => void {
		const transient = { start: this.now(), duration: 0, timeConstant, currentAt, factors };
		this.transients.push(transient);
		return elapsed => { transient.duration = Math.max(transient.duration, elapsed); };
	}

	retire(prefix: string, time: number): void {
		for (const series of this.series.values()) {
			if (!series.channel.id.startsWith(prefix)) continue;
			this.record(series.channel, null, time);
			series.current = false;
		}
	}

	retain(x: string, y: string): void {
		const key = this.pairKey(x, y);
		const pair = this.pairs.get(key);
		if (pair) pair.references++;
		else this.pairs.set(key, { x, y, references: 1, archive: [] });
	}

	release(x: string, y: string): void {
		const key = this.pairKey(x, y);
		const pair = this.pairs.get(key);
		if (pair && --pair.references === 0) this.pairs.delete(key);
	}

	private pairKey(x: string, y: string): string {
		return JSON.stringify([x, y].sort());
	}

	/** Recent samples have full resolution. Older referenced pairs are compacted together. */
	prune(now = this.now()): boolean {
		const cutoff = Math.floor((now - RETENTION_MS) / ARCHIVE_WINDOW_MS) * ARCHIVE_WINDOW_MS;
		if (cutoff <= this.archivedUntil) return false;
		let changed = false;
		for (const pair of this.pairs.values()) {
			const points = this.join(pair.x, pair.y, this.archivedUntil, cutoff);
			let start = 0;
			while (start < points.length) {
				const endTime = (Math.floor(points[start].time / ARCHIVE_WINDOW_MS) + 1) * ARCHIVE_WINDOW_MS;
				let end = start + 1;
				while (end < points.length && points[end].time < endTime) end++;
				pair.archive.push(...this.compact(points, start, end));
				start = end;
			}
			changed ||= points.length > 0;
		}
		for (const [id, series] of this.series) {
			const end = lowerBound(series.samples, cutoff);
			// Keep one state at the boundary for a later sample on the other axis.
			if (!series.current && end === series.samples.length) {
				this.series.delete(id);
				this.channelVersion++;
				changed = true;
			} else if (end > 1) series.samples.discard(end - 1);
		}
		this.transients = this.transients.filter(segment => segment.start + segment.duration * 1000 >= cutoff);
		this.archivedUntil = cutoff;
		return changed;
	}

	get nextExpiry(): number | undefined {
		let earliest = Infinity;
		for (const { samples } of this.series.values()) {
			const start = lowerBound(samples, this.archivedUntil);
			if (start < samples.length) earliest = Math.min(earliest, samples.time(start));
		}
		for (const transient of this.transients) {
			const latest = transient.start + transient.duration * 1000;
			earliest = Math.min(earliest, Math.max(this.archivedUntil, latest));
		}
		return earliest < Infinity
			? (Math.floor(earliest / ARCHIVE_WINDOW_MS) + 1) * ARCHIVE_WINDOW_MS + RETENTION_MS
			: undefined;
	}

	points(x: string, y: string): PlotPoint[] {
		const pair = this.pairs.get(this.pairKey(x, y));
		const archive = pair?.x === y && x !== y
			? pair.archive.map(point => ({ time: point.time, x: point.y, y: point.x }))
			: pair?.archive ?? [];
		return archive.concat(this.join(x, y, this.archivedUntil, Infinity));
	}

	private join(x: string, y: string, start: number, end: number): PlotPoint[] {
		const xSamples = this.samplesFor(x, start, end);
		const ySamples = this.samplesFor(y, start, end);
		let i = lowerBound(xSamples, start);
		let j = lowerBound(ySamples, start);
		let xValue = i > 0 ? xSamples.value(i - 1) : undefined;
		let yValue = j > 0 ? ySamples.value(j - 1) : undefined;
		const points: PlotPoint[] = [];
		while (i < xSamples.length || j < ySamples.length) {
			const xTime = i < xSamples.length ? xSamples.time(i) : Infinity;
			const yTime = j < ySamples.length ? ySamples.time(j) : Infinity;
			const time = Math.min(xTime, yTime);
			if (time >= end) break;
			const analytic = (xTime === time && xSamples.analytic?.(i)) ||
				(yTime === time && ySamples.analytic?.(j));
			if (xTime === time) xValue = xSamples.value(i++);
			if (yTime === time) yValue = ySamples.value(j++);
			const xReading = x === TIME_CHANNEL ? time / 1000 : xValue;
			const yReading = y === TIME_CHANNEL ? time / 1000 : yValue;
			if (xReading !== undefined && yReading !== undefined) points.push(analytic
				? { time, x: xReading, y: yReading, analytic: true } : { time, x: xReading, y: yReading });
		}
		return points;
	}

	private samplesFor(id: string, start: number, end: number): Samples {
		const samples = this.series.get(id)?.samples ?? EMPTY_SAMPLES;
		const synthetic = new Map<number, Sample>();
		for (const segment of this.transients) {
			const factor = segment.factors.get(id);
			if (factor === undefined || segment.start >= end || segment.start + segment.duration * 1000 < start) continue;
			const horizon = Math.min(segment.duration, 6 * segment.timeConstant);
			const record = (elapsed: number) => {
				const time = segment.start + elapsed * 1000;
				if (time < end) synthetic.set(time, { time, value: segment.currentAt(elapsed) * factor, analytic: true });
			};
			if (horizon > 0) for (let i = 0; i <= 80; i++) record(horizon * i / 80);
			if (segment.duration > horizon || horizon === 0) record(segment.duration);
		}
		if (!synthetic.size) return samples;
		const first = Math.max(0, lowerBound(samples, start) - 1);
		for (let i = first; i < samples.length && samples.time(i) < end; i++) {
			const time = samples.time(i);
			const value = samples.value(i);
			// A stopped or disconnected device always wins at a boundary.
			if (value === null || !synthetic.has(time)) synthetic.set(time, { time, value });
		}
		const merged = [...synthetic.values()].sort((a, b) => a.time - b.time);
		return {
			length: merged.length,
			time: index => merged[index].time,
			value: index => merged[index].value,
			analytic: index => merged[index].analytic,
		};
	}

	private compact(points: PlotPoint[], start: number, end: number): PlotPoint[] {
		const keep = new Set([start, end - 1]);
		for (const axis of ["x", "y"] as const) {
			let min = Infinity;
			let max = -Infinity;
			let minIndex = start;
			let maxIndex = start;
			for (let i = start; i < end; i++) {
				if (points[i].analytic) keep.add(i);
				const value = points[i][axis];
				if (i > start && (value === null) !== (points[i - 1][axis] === null)) {
					keep.add(i - 1);
					keep.add(i);
				}
				if (value === null) continue;
				if (value < min) { min = value; minIndex = i; }
				if (value > max) { max = value; maxIndex = i; }
			}
			keep.add(minIndex);
			keep.add(maxIndex);
		}
		return [...keep].sort((a, b) => a - b).map(index => points[index]);
	}
}

function lowerBound(samples: Samples, time: number): number {
	let lo = 0;
	let hi = samples.length;
	while (lo < hi) {
		const mid = Math.floor((lo + hi) / 2);
		if (samples.time(mid) < time) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}
