import { dataValue, elementByAtomicNumber } from "../periodic-table/element-reference";
import { shellOrbit } from "./atomic-configuration";
import { atomRadius } from "./radii";

// Indexed by atomic number. Highest representative isotopic composition in
// the NIST table; 0 means no abundance is given. See docs/structure-library.md.
const abundantMassNumbers = [
	0, 1, 4, 7, 9, 11, 12, 14, 16, 19,
	20, 23, 24, 27, 28, 31, 32, 35, 40, 39,
	40, 45, 48, 51, 52, 55, 56, 59, 58, 63,
	64, 69, 74, 75, 80, 79, 84, 85, 88, 89,
	90, 93, 98, 0, 102, 103, 106, 107, 114, 115,
	120, 121, 130, 127, 132, 133, 138, 139, 140, 141,
	142, 0, 152, 153, 158, 159, 164, 165, 166, 169,
	174, 175, 180, 181, 184, 187, 192, 193, 195, 197,
	202, 205, 208, 209, 0, 0, 0, 0, 0, 0,
	232, 231, 238, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const nucleonColors = { proton: "#b74536", neutron: "#62768a" };

export function referenceNucleus(atomicNumber: number) {
	const { halfLife } = elementByAtomicNumber(atomicNumber);
	const abundant = abundantMassNumbers[atomicNumber];
	const massNumber = abundant || (halfLife.kind === "value" ? halfLife.massNumber : 0);
	if (!massNumber) return undefined;
	return { massNumber, protons: atomicNumber, neutrons: massNumber - atomicNumber, abundant: !!abundant };
}
type Nucleus = NonNullable<ReturnType<typeof referenceNucleus>>;

export function nuclearRadiusAngstrom(massNumber: number) {
	// 1 fm = 10⁻⁵ Å. Use the CODATA rms charge radius for the single proton.
	const radiusFm = massNumber === 1 ? .84075 : 1.2 * Math.cbrt(massNumber);
	return radiusFm * 1e-5;
}

export function orbitalNuclearRadius(nucleus: Nucleus, electrons: number) {
	const radius = nuclearRadiusAngstrom(nucleus.massNumber);
	if (electrons === 1) return radius; // scene units are Å
	// Multielectron orbital meshes normalize the outer envelope to one unit.
	const empiricalPm = dataValue(elementByAtomicNumber(nucleus.protons).radius);
	return radius / ((empiricalPm ?? atomRadius(nucleus.protons).pm) / 100);
}

export function schematicNucleons(nucleus: Nucleus, shellCount: number) {
	const { massNumber, protons } = nucleus;
	const limit = Math.ceil(Math.cbrt(massNumber));
	const sites: { x: number; y: number; z: number; distance: number }[] = [];
	// Use the closest sites of a face-centered cubic lattice for the drawing.
	for (let x = -limit; x <= limit; x++) {
		for (let y = -limit; y <= limit; y++) {
			for (let z = -limit; z <= limit; z++) {
				if ((x + y + z) % 2 === 0) sites.push({ x, y, z, distance: x * x + y * y + z * z });
			}
		}
	}
	const positions = sites.sort((a, b) => a.distance - b.distance).slice(0, massNumber);
	const center = positions.reduce((sum, point) => ({
		x: sum.x + point.x / massNumber, y: sum.y + point.y / massNumber, z: sum.z + point.z / massNumber,
	}), { x: 0, y: 0, z: 0 });
	const spread = Math.max(...positions.map(({ x, y, z }) => Math.hypot(x - center.x, y - center.y, z - center.z)));
	const maxRadius = Math.min(.25, .115 + .037 * Math.cbrt(massNumber), .78 * shellOrbit(0, shellCount).radius);
	const particleRadius = Math.SQRT1_2;
	const scale = maxRadius / (spread + particleRadius);
	return {
		radius: particleRadius * scale,
		particles: positions.map(({ x, y, z }, i) => ({
			x: (x - center.x) * scale, y: (y - center.y) * scale, z: (z - center.z) * scale,
			kind: Math.floor((i + 1) * protons / massNumber) > Math.floor(i * protons / massNumber)
				? "proton" as const : "neutron" as const,
		})),
	};
}
