import { dataValue, elementByAtomicNumber } from "../periodic-table/element-reference";
import type { BondOrder } from "./structure";

export type Radius = { pm: number; model: "covalent" | "empirical" | "vdw" | "ionic" | "metallic" | "schematic"; coordination?: number };

// Indexed by atomic number. Cordero et al., doi:10.1039/B801115J.
const covalentPm = [
	0, 31, 28, 128, 96, 84, 76, 71, 66, 57, 58, 166, 141, 121,
	111, 107, 105, 102, 106, 203, 176, 170, 160, 153, 139, 139, 132, 126,
	124, 132, 122, 122, 120, 119, 120, 120, 116, 220, 195, 190, 175, 164,
	154, 147, 146, 142, 139, 145, 144, 142, 139, 139, 138, 139, 140, 244,
	215, 207, 204, 203, 201, 199, 198, 198, 196, 194, 192, 192, 189, 190,
	187, 187, 175, 170, 162, 151, 144, 141, 136, 136, 132, 145, 146, 148,
	140, 150, 150, 260, 221, 215, 206, 200, 196, 190, 187, 180, 169,
];

// Mantina et al., doi:10.1021/jp8111556 (main group); Álvarez,
// doi:10.1039/C3DT50599E (other elements). Zero denotes missing data.
const vanDerWaalsPm = [
	0, 110, 140, 181, 153, 192, 170, 155, 152, 147, 154, 227, 173, 184,
	210, 180, 180, 175, 188, 275, 231, 258, 246, 242, 245, 245, 244, 240,
	240, 238, 239, 187, 211, 185, 190, 183, 202, 303, 249, 275, 252, 256,
	245, 244, 246, 244, 215, 253, 249, 193, 217, 206, 206, 198, 216, 343,
	268, 298, 288, 292, 295, 0, 290, 287, 283, 279, 287, 281, 283, 279,
	280, 274, 263, 253, 257, 249, 248, 241, 229, 232, 245, 196, 202, 207,
	197, 202, 220, 348, 283, 280, 293, 288, 271, 282, 281, 283, 305, 340,
	305, 270, 0, 0, 0, 0,
];

// Pyykkö, doi:10.1021/jp5065819. Additive single, double and triple
// bond radii (pm) for the elements most used in the molecular editor.
const molecularPm = new Map<number, number[]>([
	[1, [32]], [5, [85, 78, 73]], [6, [75, 67, 60]], [7, [71, 60, 54]],
	[8, [63, 57, 53]], [9, [64]], [13, [126, 113, 111]], [14, [116, 107, 102]],
	[15, [111, 102, 94]], [16, [103, 94, 95]], [17, [99]], [35, [114]], [53, [133]],
]);

// Shannon effective ionic radii in pm, by atomic number, charge and CN.
// The entries below have an identified coordination in the catalog.
const ionicPm = new Map([
	["8:-2:3", 136], ["8:-2:4", 138], ["8:-2:6", 140], ["11:1:6", 102], ["12:2:6", 72],
	["17:-1:6", 181], ["19:1:6", 138], ["20:2:6", 100], ["25:4:6", 53],
	["26:3:6", 64.5], ["29:2:4", 57], ["35:-1:6", 196], ["47:1:6", 115],
	["53:-1:6", 220], ["56:2:12", 161],
]);

export function ionicRadius(atomicNumber: number, charge: number, coordination: number): Radius | undefined {
	const pm = ionicPm.get(`${atomicNumber}:${charge}:${coordination}`);
	return pm === undefined ? undefined : { pm, model: "ionic", coordination };
}

export function atomRadius(atomicNumber: number): Radius {
	const covalent = covalentPm[atomicNumber];
	if (covalent) return { pm: covalent, model: "covalent" };
	const pm = dataValue(elementByAtomicNumber(atomicNumber).radius);
	return pm === undefined ? { pm: 90, model: "schematic" } : { pm, model: "empirical" };
}

export function spaceFillingRadius(atomicNumber: number): Radius {
	const pm = vanDerWaalsPm[atomicNumber];
	return pm ? { pm, model: "vdw" } : { pm: 200, model: "schematic" };
}

export function estimatedBondLength(left: number, right: number, order: BondOrder): number {
	const a = molecularPm.get(left), b = molecularPm.get(right);
	if (a?.[order - 1] && b?.[order - 1]) return (a[order - 1] + b[order - 1]) / 100;
	const sum = (a?.[0] ?? atomRadius(left).pm) + (b?.[0] ?? atomRadius(right).pm);
	return sum / 100 * ([1, .9, .82][order - 1]);
}
