import { elementByAtomicNumber } from "../periodic-table/element-reference";
import { cartesian, cellVectors, type Crystal, type Point3, type Site } from "./structure";

export function siteIon(site: Pick<Site, "atomicNumber" | "charge" | "ion">): string | undefined {
	if (site.ion) return site.ion;
	if (!site.charge) return undefined;
	const magnitude = Math.abs(site.charge);
	const digits = "⁰¹²³⁴⁵⁶⁷⁸⁹";
	return elementByAtomicNumber(site.atomicNumber).symbol + (magnitude > 1 ? digits[magnitude] : "") + (site.charge > 0 ? "⁺" : "⁻");
}

export function crystalIonColors(crystal: Crystal) {
	const labels = new Set(crystal.sites.map(siteIon).filter((label): label is string => label !== undefined));
	const cations = [0x0072b2, 0x8d49a5, 0x398372, 0x334155];
	const anions = [0xd55e00, 0xb34b83, 0x9c791c, 0x5f6f32];
	const offsets = [0, 0];
	return new Map([...labels].sort().map(label => {
		const positive = label.endsWith("⁺");
		const palette = positive ? cations : anions;
		return [label, palette[offsets[positive ? 0 : 1]++ % palette.length]] as const;
	}));
}

export const colorHex = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

const centeringOffsets: Record<string, Point3[]> = {
	A: [[0, .5, .5]],
	B: [[.5, 0, .5]],
	C: [[.5, .5, 0]],
	I: [[.5, .5, .5]],
	F: [[0, .5, .5], [.5, 0, .5], [.5, .5, 0]],
	R: [[2 / 3, 1 / 3, 1 / 3], [1 / 3, 2 / 3, 2 / 3]],
	H: [[2 / 3, 1 / 3, 0], [1 / 3, 2 / 3, 0]],
};

export function latticePositions(crystal: Crystal, repeats: number): Point3[] {
	// Use the actual cell setting. The standardized Bravais label can differ
	// from the centering of a deposited cell, for example I2/c vs mC.
	const setting = crystal.spaceGroup?.trim()[0];
	const type = crystal.bravais?.slice(-1);
	// Gemmi abbreviates the hexagonal setting of an R group with H.
	const centering = setting === "H" && type === "R" ? "R" : setting || type || "P";
	const [alpha, beta, gamma] = crystal.cell.angles;
	const hexagonalAxes = Math.abs(alpha - 90) < 1 && Math.abs(beta - 90) < 1 && Math.abs(gamma - 120) < 1;
	const offsets = [[0, 0, 0] as Point3, ...(centering === "R" && !hexagonalAxes ? [] : centeringOffsets[centering] ?? [])];
	const vectors = cellVectors(crystal.cell);
	const positions: Point3[] = [];
	for (const [a, b, c] of offsets) {
		for (let x = 0; x + a <= repeats; x++) {
			for (let y = 0; y + b <= repeats; y++) {
				for (let z = 0; z + c <= repeats; z++) positions.push(cartesian(vectors, [x + a, y + b, z + c]));
			}
		}
	}
	return positions;
}
