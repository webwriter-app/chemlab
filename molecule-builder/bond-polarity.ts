import { dataValue, elementByAtomicNumber } from "../periodic-table/element-reference";
import type { Atom, Bond } from "./structure";

const LEVELS = 16;
export const POLARITY_STOPS = [.32, .5, .68] as const;
export const POLARITY_KEY = { poor: "#bd500f", even: "#626f80", rich: "#087b70" } as const;

/** Signed Pauling Δχ from the first atom to the second. This is a bond model,
 * based on element values, without a prediction of atomic partial charges.
 */
export function bondPolarity(bond: Bond, atoms: ReadonlyMap<number, Pick<Atom, "atomicNumber">>): number | undefined {
	if (bond.kind === "ionic" || bond.dative) return undefined;
	const from = atoms.get(bond.from)?.atomicNumber;
	const to = atoms.get(bond.to)?.atomicNumber;
	if (from === undefined || to === undefined) return undefined;
	if (from === to) return 0;
	const a = dataValue(elementByAtomicNumber(from).electronegativity);
	const b = dataValue(elementByAtomicNumber(to).electronegativity);
	return a === undefined || b === undefined ? undefined : Math.round((b - a) * 100) / 100;
}

/** Quantize the display only, so the 3D renderer can reuse a small set of
 * textures. A fixed scale keeps weak bonds weak next to strongly polar ones.
 */
export function polarityLevel(delta: number): number {
	if (!delta) return 0;
	const strength = Math.sqrt(Math.min(Math.abs(delta) / 2, 1));
	return Math.sign(delta) * Math.max(1, Math.round(LEVELS * strength));
}

function mixColor(color: string, strength: number) {
	const channels = [1, 3, 5].map(offset => {
		const neutral = parseInt(POLARITY_KEY.even.slice(offset, offset + 2), 16);
		const saturated = parseInt(color.slice(offset, offset + 2), 16);
		return Math.round(neutral + strength * (saturated - neutral)).toString(16).padStart(2, "0");
	});
	return "#" + channels.join("");
}

/** Colour stops from the start of the bond towards its end. */
export function polarityColors(level: number): readonly [string, string, string] {
	const strength = Math.abs(level) / LEVELS;
	const poor = mixColor(POLARITY_KEY.poor, strength);
	const rich = mixColor(POLARITY_KEY.rich, strength);
	return level < 0 ? [rich, POLARITY_KEY.even, poor] : [poor, POLARITY_KEY.even, rich];
}
