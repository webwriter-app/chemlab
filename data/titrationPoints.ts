import type { ChartAxis } from "./diagramRanges";
import type { PlotPoint } from "./measurementHistory";

export const titrationMarkerKinds = ["equivalence", "neutral", "half-equivalence"] as const;
export type TitrationMarkerKind = typeof titrationMarkerKinds[number];
type Sample = { volume: number; pH: number };
export type TitrationMarker = Sample & { kind: TitrationMarkerKind; coarse?: true };
type Endpoint = { volume: number; coarse?: true };

/** Find observed points on increasing-volume sections of a pH titration trace. */
export function titrationPoints(points: readonly PlotPoint[], phAxis: ChartAxis, firstDoseTime?: number): TitrationMarker[] {
	const markers: TitrationMarker[] = [];
	const samples: (Sample & { time: number })[] = [];
	for (const point of points) {
		const pH = point[phAxis];
		const volume = point[phAxis === "x" ? "y" : "x"];
		const previous = samples[samples.length - 1];
		if (pH === null || volume === null || (previous && volume <= previous.volume)) {
			markers.push(...analyseRun(samples, firstDoseTime));
			samples.length = 0;
		}
		if (pH !== null && volume !== null) samples.push({ volume, pH, time: point.time });
	}
	markers.push(...analyseRun(samples, firstDoseTime));
	return markers;
}

function analyseRun(points: readonly (Sample & { time: number })[], firstDoseTime?: number): TitrationMarker[] {
	if (points.length < 2) return [];
	const markers: TitrationMarker[] = [];
	const slopes: number[] = [];
	for (let i = 1; i < points.length; i++) {
		const a = points[i - 1];
		const b = points[i];
		// The current aqueous model defaults to 298.15 K.
		if ((a.pH < 7 && b.pH >= 7) || (a.pH > 7 && b.pH <= 7)) {
			const volume = a.volume + (b.volume - a.volume) * ((7 - a.pH) / (b.pH - a.pH));
			markers.push({ kind: "neutral", volume, pH: 7 });
		}
		slopes.push((b.pH - a.pH) / (b.volume - a.volume));
	}

	const endpoints = resolvedEndpoints(points, slopes);
	if (!endpoints.length && markers.length === 1) {
		const coarse = coarseEndpoint(points, slopes, markers[0].volume);
		if (coarse !== undefined) endpoints.push({ volume: coarse, coarse: true });
	}

	let lastEquivalence = points[0].volume === 0 || points[0].time === firstDoseTime ? 0 : undefined;
	for (const endpoint of endpoints) {
		const { volume } = endpoint;
		markers.push({ kind: "equivalence", ...endpoint, pH: interpolate(points, volume) });
		if (lastEquivalence !== undefined) {
			const half = (lastEquivalence + volume) / 2;
			if (half >= points[0].volume) {
				markers.push({ kind: "half-equivalence", ...endpoint, volume: half, pH: interpolate(points, half) });
			}
		}
		lastEquivalence = volume;
	}
	return markers;
}

function resolvedEndpoints(points: readonly Sample[], slopes: readonly number[]): Endpoint[] {
	const endpoints: Endpoint[] = [];
	// Bracket each peak by lower slopes on both sides. This excludes an
	// unfinished rise and avoids treating pH rounding noise as an endpoint.
	for (let first = 1; first < slopes.length - 1; first++) {
		const sign = Math.sign(slopes[first]);
		const height = Math.abs(slopes[first]);
		if (!(height > Math.abs(slopes[first - 1]))) continue;
		let last = first;
		while (last + 1 < slopes.length && Math.abs(slopes[last + 1] - slopes[first]) <= height * 1e-9) last++;
		if (last + 1 >= slopes.length || Math.abs(slopes[last + 1]) >= height) {
			first = last;
			continue;
		}
		let left = first - 1;
		let right = last + 1;
		while (left > 0 && sign * slopes[left - 1] >= 0 && Math.abs(slopes[left - 1]) <= Math.abs(slopes[left])) left--;
		while (right + 1 < slopes.length && sign * slopes[right + 1] >= 0 &&
			Math.abs(slopes[right + 1]) <= Math.abs(slopes[right])) right++;
		if (sign * slopes[left] < 0 || sign * slopes[right] < 0 ||
			height < 1.3 * Math.max(Math.abs(slopes[left]), Math.abs(slopes[right])) ||
			Math.abs(points[right + 1].pH - points[left].pH) < 0.5) {
			first = last;
			continue;
		}
		endpoints.push({ volume: peakVolume(points, slopes, first, last) });
		first = last;
	}
	return endpoints;
}

/** Estimate an unresolved transition from one to three large, adjacent steps around pH 7. */
function coarseEndpoint(points: readonly Sample[], slopes: readonly number[], neutralVolume: number): number | undefined {
	const direction = Math.sign(points[points.length - 1].pH - points[0].pH);
	const change = (i: number) => direction * (points[i + 1].pH - points[i].pH);
	let peak = -1;
	for (let i = 0; i < slopes.length; i++) {
		if (change(i) < -1e-6) return undefined;
		if (change(i) >= 0.5 && (peak < 0 || Math.abs(slopes[i]) > Math.abs(slopes[peak]))) peak = i;
	}
	if (peak < 0) return undefined;

	const comparable = (i: number) => change(i) >= 0.5 && Math.abs(slopes[i]) >= 0.45 * Math.abs(slopes[peak]);
	let left = peak;
	let right = peak;
	while (left > 0 && comparable(left - 1)) left--;
	while (right + 1 < slopes.length && comparable(right + 1)) right++;
	const start = points[left];
	const end = points[right + 1];
	if (right - left >= 3 || Math.abs(end.pH - start.pH) < 2 ||
		neutralVolume < start.volume || neutralVolume > end.volume) return undefined;

	// Prefer a measured near-neutral point between steep steps. This avoids
	// shifting the estimate by half a dose when a step already landed there.
	for (let i = left + 1; i <= right; i++) {
		if (Math.abs(points[i].pH - 7) < 0.05) return points[i].volume;
	}
	return (start.volume + end.volume) / 2;
}

function peakVolume(points: readonly Sample[], slopes: readonly number[], first: number, last: number): number {
	const low = points[first].volume;
	const high = points[last + 1].volume;
	const middle = (low + high) / 2;
	if (first !== last) return middle;

	// Sub-step estimate from the maximum of a parabola fitted to the peak
	// and its neighbours. Use the actual dose spacing of the secants.
	const left = (points[first - 1].volume + low) / 2;
	const right = (high + points[first + 2].volume) / 2;
	const peak = Math.abs(slopes[first]);
	const rising = (peak - Math.abs(slopes[first - 1])) / (middle - left);
	const falling = (Math.abs(slopes[first + 1]) - peak) / (right - middle);
	const curvature = (falling - rising) / (right - left);
	if (!(curvature < 0)) return middle;
	const maximum = (left + middle) / 2 - rising / (2 * curvature);
	return Math.min(high, Math.max(low, maximum));
}

function interpolate(points: readonly Sample[], volume: number): number {
	let lower = 0;
	let upper = points.length - 1;
	while (upper - lower > 1) {
		const middle = Math.floor((upper + lower) / 2);
		if (points[middle].volume <= volume) lower = middle;
		else upper = middle;
	}
	const a = points[lower];
	const b = points[upper];
	return a.pH + (b.pH - a.pH) * ((volume - a.volume) / (b.volume - a.volume));
}
