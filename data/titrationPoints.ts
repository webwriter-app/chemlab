import type { ChartAxis } from "./diagramRanges";
import type { PlotPoint } from "./measurementHistory";

export const titrationMarkerKinds = ["equivalence", "neutral", "half-equivalence"] as const;
export type TitrationMarkerKind = typeof titrationMarkerKinds[number];
type Sample = { volume: number; pH: number };
export type TitrationMarker = Sample & { kind: TitrationMarkerKind };

/** Find observed points on increasing-volume sections of a pH titration trace. */
export function titrationPoints(points: readonly PlotPoint[], phAxis: ChartAxis): TitrationMarker[] {
	const markers: TitrationMarker[] = [];
	const samples: Sample[] = [];
	for (const point of points) {
		const pH = point[phAxis];
		const volume = point[phAxis === "x" ? "y" : "x"];
		const previous = samples[samples.length - 1];
		if (pH === null || volume === null || (previous && volume <= previous.volume)) {
			markers.push(...analyseRun(samples));
			samples.length = 0;
		}
		if (pH !== null && volume !== null) samples.push({ volume, pH });
	}
	markers.push(...analyseRun(samples));
	return markers;
}

function analyseRun(points: readonly Sample[]): TitrationMarker[] {
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

	// Bracket each peak by lower slopes on both sides. This excludes an
	// unfinished rise and avoids treating pH rounding noise as an endpoint.
	let lastEquivalence = points[0].volume === 0 ? 0 : undefined;
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
		const volume = peakVolume(points, slopes, first, last);
		markers.push({ kind: "equivalence", volume, pH: interpolate(points, volume) });
		if (lastEquivalence !== undefined) {
			const half = (lastEquivalence + volume) / 2;
			markers.push({ kind: "half-equivalence", volume: half, pH: interpolate(points, half) });
		}
		lastEquivalence = volume;
		first = last;
	}
	return markers;
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
