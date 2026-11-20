import { categoryOf, elementByAtomicNumber } from "../periodic-table/element-reference";
import { cartesian, cellVectors, type Crystal, type Point3, type Site } from "./structure";

import { atomRadius, ionicRadius, type Radius } from "./radii";

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

// Coordination of the indicated crystal phases, including rock salt, corundum,
// tenorite and rutile. A formula alone cannot establish a coordination number.
const sixCoordinateSalts = new Set([
	"Natriumchlorid", "Natriumbromid", "Natriumiodid", "Kaliumchlorid", "Kaliumbromid", "Kaliumiodid",
	"Silberchlorid", "Magnesiumoxid", "Calciumoxid",
]);
const oxideCoordination: Readonly<Partial<Record<string, Record<number, number>>>> = {
	"Eisen(III)-oxid": { 8: 4, 26: 6 }, "Kupfer(II)-oxid": { 8: 4, 29: 4 },
	"Mangan(IV)-oxid": { 8: 3, 25: 6 }, "Bariumsulfat": { 56: 12 },
};

export function monatomicCharge(site: Site): number {
	const ion = siteIon(site);
	const symbol = elementByAtomicNumber(site.atomicNumber).symbol;
	const suffix = ion?.startsWith(symbol) ? ion.slice(symbol.length) : "";
	if (!/^[¹²³⁴⁵⁶⁷⁸]?[⁺⁻]$/.test(suffix)) return site.charge;
	const magnitude = suffix.length === 1 ? 1 : "⁰¹²³⁴⁵⁶⁷⁸".indexOf(suffix[0]);
	return suffix.endsWith("⁺") ? magnitude : -magnitude;
}

/** Use half the nearest-neighbour spacing for a bulk elemental metal phase. */
function metallicRadius(crystal: Crystal, site: Site, vectors: ReturnType<typeof cellVectors>): Radius | undefined {
	const category = categoryOf(site.atomicNumber);
	if (!crystal.source || !(category?.endsWith("-metal") || category === "lanthanide" || category === "actinide")
		|| !crystal.sites.every(other => other.atomicNumber === site.atomicNumber && !siteIon(other))) return undefined;
	let min = Infinity;
	for (const other of crystal.sites) {
		const delta = other.fractional.map((n, i) => n - site.fractional[i]);
		for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
			const length = Math.hypot(...cartesian(vectors, [delta[0] + x, delta[1] + y, delta[2] + z]));
			if (length > 1e-6) min = Math.min(min, length);
		}
	}
	return Number.isFinite(min) ? { pm: Math.round(min * 500) / 10, model: "metallic" } : undefined;
}

const radiiByCrystal = new WeakMap<Crystal, ReadonlyMap<number, Radius>>();

export function crystalRadii(crystal: Crystal): ReadonlyMap<number, Radius> {
	const cached = radiiByCrystal.get(crystal);
	if (cached) return cached;
	const vectors = cellVectors(crystal.cell);
	const radii = new Map<number, Radius>(crystal.sites.map(site => {
		const charge = monatomicCharge(site);
		if (!charge) return [site.id, metallicRadius(crystal, site, vectors) ?? atomRadius(site.atomicNumber)];
		const coordination = crystal.source && crystal.catalogKey && (sixCoordinateSalts.has(crystal.catalogKey)
			? 6 : oxideCoordination[crystal.catalogKey]?.[site.atomicNumber]);
		return [site.id, coordination && ionicRadius(site.atomicNumber, charge, coordination) || { pm: 80, model: "schematic" }];
	}));
	radiiByCrystal.set(crystal, radii);
	return radii;
}
