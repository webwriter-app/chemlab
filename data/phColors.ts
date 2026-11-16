/**
 * Screen approximation of broad-range universal indicator paper.
 * Reference: University of Montana spectrUM, Paper Chemistry, p. 3.
 * https://www.umt.edu/spectrum/education/resources/resources-images/monte-kit-web-version---paper-chemistry.pdf
 * The darkest alkaline swatch extends to pH 14.
 */
export const pHColors: Record<number, string> = {
	0: "#a92257",
	1: "#c93045",
	2: "#df5036",
	3: "#ed7929",
	4: "#f3ac28",
	5: "#ebd538",
	6: "#adc33e",
	7: "#5f9d45",
	8: "#397d4e",
	9: "#28715f",
	10: "#246973",
	11: "#265d80",
	12: "#284d78",
	13: "#303b68",
	14: "#352e58",
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
