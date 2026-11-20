const MIN_CELL_PIXELS = 22;

/** Pick the next 1, 2, 5, 10 step with at least 22 screen pixels per cell. */
export function gridCell(pixelsPerUnit: number) {
	if (!(Number.isFinite(pixelsPerUnit) && pixelsPerUnit > 0)) return;
	const units = MIN_CELL_PIXELS / pixelsPerUnit;
	if (!Number.isFinite(units)) return;
	const exponent = Math.floor(Math.log10(units));
	const power = 10 ** exponent;
	const length = Number(([1, 2, 5, 10].find(step => step * power >= units - power * 1e-12) * power).toPrecision(12));
	return { length, pixels: length * pixelsPerUnit };
}
