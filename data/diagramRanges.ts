import type { PlotPoint } from "./measurementHistory";

export type ChartAxis = "x" | "y";
export type AxisRange = { min: number; max: number };
export type AxisRanges = Record<ChartAxis, AxisRange>;

export const TRIM_STEPS = 10_000;
export type TrimHandle = "min" | "max";

export function moveTrimHandle(selection: AxisRange, handle: TrimHandle, position: number): AxisRange {
	const step = Math.round(position);
	return handle === "min"
		? { min: Math.max(0, Math.min(selection.max - 1, step)), max: selection.max }
		: { min: selection.min, max: Math.min(TRIM_STEPS, Math.max(selection.min + 1, step)) };
}

export function axisTrimSelection(domain: AxisRange, range: AxisRange): AxisRange {
	const position = (value: number) => Math.max(0, Math.min(TRIM_STEPS,
		(value - domain.min) / (domain.max - domain.min) * TRIM_STEPS));
	return { min: position(range.min), max: position(range.max) };
}

export function trimmedAxisRange(domain: AxisRange, selection: AxisRange): AxisRange {
	const span = domain.max - domain.min;
	const valueAt = (step: number) => step === 0 ? domain.min : step === TRIM_STEPS ? domain.max :
		domain.min + span * (step / TRIM_STEPS);
	return { min: valueAt(selection.min), max: valueAt(selection.max) };
}

function fitRange(min: number, max: number): AxisRange {
	if (min < max) return { min, max };
	// A flat series still needs a nonzero scale to remain visible.
	const padding = min === 0 ? 1 : Math.max(Math.abs(min) / 100, Number.MIN_VALUE);
	return { min: Math.max(-Number.MAX_VALUE, min - padding), max: Math.min(Number.MAX_VALUE, max + padding) };
}

/** Collect the bounds of drawable points while preserving the gaps in the plot. */
export function diagramData(points: readonly PlotPoint[]) {
	const data: { x: number; y: number | null }[] = [];
	let latestX: number | undefined;
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const { x, y } of points) {
		if (x === null || !Number.isFinite(x)) {
			if (latestX !== undefined) data.push({ x: latestX, y: null });
			continue;
		}
		latestX = x;
		if (y === null || !Number.isFinite(y)) {
			data.push({ x, y: null });
			continue;
		}
		data.push({ x, y });
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	}
	const ranges: AxisRanges | undefined = minX === Infinity ? undefined :
		{ x: fitRange(minX, maxX), y: fitRange(minY, maxY) };
	return { data, ranges };
}
