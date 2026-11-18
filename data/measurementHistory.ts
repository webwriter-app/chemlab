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
type Sample = { time: number; value: Reading };
type Series = { channel: MeasurementChannel; samples: Sample[]; current: boolean };
export type PlotPoint = { time: number; x: number | null; y: number | null };
type AxisPair = { x: string; y: string; references: number; archive: PlotPoint[] };

/** A common timeline, independent of the canvas and of Chart.js. */
export class MeasurementHistory {
	private readonly series = new Map<string, Series>();
	private readonly pairs = new Map<string, AxisPair>();
	private archivedUntil = 0;
	private latestTime = 0;

	constructor(private readonly epoch = performance.now()) {}

	now(): number {
		return Math.max(this.latestTime, performance.now() - this.epoch);
	}

	get channels(): MeasurementChannel[] {
		return [...this.series.values()].map(({ channel }) => channel);
	}

	record(channel: MeasurementChannel, value: Reading, time: number, changesOnly = false): boolean {
		time = Math.max(this.latestTime, time);
		this.latestTime = time;
		let series = this.series.get(channel.id);
		if (!series) {
			series = { channel, samples: [], current: true };
			this.series.set(channel.id, series);
		}
		if (value !== null && !Number.isFinite(value)) value = null;
		const last = series.samples[series.samples.length - 1];
		if (last?.time === time) {
			if (last.value === value) return false;
			last.value = value;
		} else {
			if ((changesOnly || value === null) && last?.value === value) return false;
			series.samples.push({ time, value });
		}
		return true;
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
			if (!series.current && end === series.samples.length) this.series.delete(id);
			else if (end > 1) series.samples.splice(0, end - 1);
		}
		this.archivedUntil = cutoff;
		return changed;
	}

	get nextExpiry(): number | undefined {
		let earliest = Infinity;
		for (const { samples } of this.series.values()) {
			const sample = samples[lowerBound(samples, this.archivedUntil)];
			if (sample) earliest = Math.min(earliest, sample.time);
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
		const xSamples = this.series.get(x)?.samples ?? [];
		const ySamples = this.series.get(y)?.samples ?? [];
		let i = lowerBound(xSamples, start);
		let j = lowerBound(ySamples, start);
		let xValue = xSamples[i - 1]?.value;
		let yValue = ySamples[j - 1]?.value;
		const points: PlotPoint[] = [];
		while (i < xSamples.length || j < ySamples.length) {
			const time = Math.min(xSamples[i]?.time ?? Infinity, ySamples[j]?.time ?? Infinity);
			if (time >= end) break;
			if (xSamples[i]?.time === time) xValue = xSamples[i++].value;
			if (ySamples[j]?.time === time) yValue = ySamples[j++].value;
			const xReading = x === TIME_CHANNEL ? time / 1000 : xValue;
			const yReading = y === TIME_CHANNEL ? time / 1000 : yValue;
			if (xReading !== undefined && yReading !== undefined) points.push({ time, x: xReading, y: yReading });
		}
		return points;
	}

	private compact(points: PlotPoint[], start: number, end: number): PlotPoint[] {
		const keep = new Set([start, end - 1]);
		for (const axis of ["x", "y"] as const) {
			let min = Infinity;
			let max = -Infinity;
			let minIndex = start;
			let maxIndex = start;
			for (let i = start; i < end; i++) {
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

function lowerBound(samples: Sample[], time: number): number {
	let lo = 0;
	let hi = samples.length;
	while (lo < hi) {
		const mid = Math.floor((lo + hi) / 2);
		if (samples[mid].time < time) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}
