/**
 * Screen approximation of the supplied pH 1–14 indicator paper reel.
 * The reel skips 4, 11 and 13, so those colors blend adjacent swatches.
 * pH 0 uses the lowest printed swatch (pH 1).
 */
export const pHColors: Record<number, string> = {
	0: "#e96a55",
	1: "#e96a55",
	2: "#ed8839",
	3: "#eca23e",
	4: "#eda63a",
	5: "#edaa35",
	6: "#edc039",
	7: "#ebd234",
	8: "#c9c83f",
	9: "#77833a",
	10: "#4d6436",
	11: "#3a5536",
	12: "#274535",
	13: "#203838",
	14: "#182b3a",
};

/** Use whichever foreground gives higher contrast on the paper swatch. */
export function pHTextColor(background: string): "#000" | "#fff" {
	const linear = (start: number) => {
		const channel = parseInt(background.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	};
	const luminance = 0.2126 * linear(1) + 0.7152 * linear(3) + 0.0722 * linear(5);
	return luminance >= Math.sqrt(0.05 * 1.05) - 0.05 ? "#000" : "#fff";
}
