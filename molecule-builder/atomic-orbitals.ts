import type { Subshell } from "./atomic-configuration";
import { meshNormals, type OrbitalMesh } from "./orbital-mesh";
import type { Point3 } from "./structure";

export type AtomicOrbitalDisplay = {
	atomicNumber: number;
	atomId: number;
	electrons: number;
	subshell?: Subshell;
	orientation: number;
	region: number;
};

export type AtomicOrbitalPart = { subshell: Subshell; orientation: number; region: number; key: string; scale: number };

export function atomicOrbitalKey({ subshell, orientation, region }: Pick<AtomicOrbitalDisplay, "subshell" | "orientation" | "region">) {
	return [subshell?.label, orientation, region].join(":");
}

const contour = .2;
const bohrAngstrom = .5291772109;

function laguerre(order: number, alpha: number, x: number) {
	let previous = 1, value = 1 + alpha - x;
	for (let k = 2; k <= order; k++) {
		[previous, value] = [value, ((2 * k - 1 + alpha - x) * value - (k - 1 + alpha) * previous) / k];
	}
	return order === 0 ? 1 : value;
}

/** Real spherical harmonics up to f. Only a positive normalization constant
 * is omitted. Each orientation uses a fixed axis or real cosine/sine basis.
 */
export function angularOrbital(l: number, orientation: number, x: number, y: number, z: number) {
	switch (l) {
		case 0: return 1;
		case 1: return [z, x, y][orientation];
		case 2: return [3 * z * z - 1, x * z, y * z, x * x - y * y, x * y][orientation];
		case 3: return [z * (5 * z * z - 3), x * (5 * z * z - 1), y * (5 * z * z - 1),
			z * (x * x - y * y), x * y * z, x * (x * x - 3 * y * y), y * (3 * x * x - y * y)][orientation];
		default: return 0;
	}
}

function angularPeak(l: number, orientation: number) {
	let peak = 0;
	for (let sample = 0; sample < 768; sample++) {
		const z = 1 - 2 * (sample + .5) / 768;
		const r = Math.sqrt(1 - z * z), phi = sample * 2.399963229728653;
		peak = Math.max(peak, Math.abs(angularOrbital(l, orientation, r * Math.cos(phi), r * Math.sin(phi), z)));
	}
	return peak;
}

/** Rₙₗ in ρ = 2Zr/(na₀), up to an overall positive normalization. */
function radialOrbital(n: number, l: number, rho: number) {
	return rho ** l * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
}

function radialRanges(n: number, l: number) {
	const edges = [0];
	const end = 22 + 6 * n;
	let previous = laguerre(n - l - 1, 2 * l + 1, 0);
	for (let sample = 1; sample <= end * 32; sample++) {
		const rho = sample / 32;
		const next = laguerre(n - l - 1, 2 * l + 1, rho);
		if (previous !== 0 && previous * next <= 0) {
			let from = rho - 1 / 32, to = rho;
			for (let i = 0; i < 18; i++) {
				const mid = (from + to) / 2;
				if (laguerre(n - l - 1, 2 * l + 1, mid) * previous > 0) from = mid;
				else to = mid;
			}
			edges.push((from + to) / 2);
		}
		previous = next;
	}
	edges.push(end);
	return edges;
}

const radialProfiles = new Map<string, { start: number; end: number; peak: number; extent: number }>();

function radialProfile(n: number, l: number, region: number) {
	const key = `${n}:${l}:${region}`;
	const cached = radialProfiles.get(key);
	if (cached) return cached;
	const ranges = radialRanges(n, l);
	const start = ranges[region], end = ranges[region + 1];
	let peak = 0;
	for (let i = 0; i <= 400; i++) {
		peak = Math.max(peak, Math.abs(radialOrbital(n, l, start + (end - start) * i / 400)));
	}
	let extent = end;
	for (let i = 400; i >= 0; i--) {
		const rho = start + (end - start) * i / 400;
		if (Math.abs(radialOrbital(n, l, rho)) >= peak * contour) {
			extent = rho + (end - start) * 2 / 400;
			break;
		}
	}
	const result = { start, end, peak, extent };
	radialProfiles.set(key, result);
	return result;
}

const overlayCache = new WeakMap<readonly Subshell[], AtomicOrbitalPart[]>();

/** Compress the relative radii between subshells so inner orbitals remain
 * legible. Within one subshell, all orientations and regions share a scale. */
export function atomicOverlayParts(subshells: readonly Subshell[]): AtomicOrbitalPart[] {
	const cached = overlayCache.get(subshells);
	if (cached) return cached;
	const outermost = subshells.map(({ n, l }) => radialProfile(n, l, n - l - 1).extent);
	const reach = Math.max(...subshells.map(({ n }, i) => n * outermost[i]));
	const parts = subshells.flatMap((subshell, i) => {
		const { n, l } = subshell;
		const outerScale = Math.sqrt(n * outermost[i] / reach);
		return Array.from({ length: 2 * l + 1 }, (_, orientation) =>
			Array.from({ length: n - l }, (_, region) => {
				const part = { subshell, orientation, region };
				return { ...part, key: atomicOrbitalKey(part),
					scale: outerScale * radialProfile(n, l, region).extent / outermost[i] };
			})).flat();
	});
	overlayCache.set(subshells, parts);
	return parts;
}

/** Select one radial region so inner shells can be inspected through their
 * nodes. The volume uses normalized coordinates for multielectron atoms. */
export function atomicOrbitalField(n: number, l: number, orientation: number, region: number) {
	const { start, end, peak, extent } = radialProfile(n, l, region);
	const inversePeak = 1 / (peak * angularPeak(l, orientation));
	return {
		extent,
		value(x: number, y: number, z: number) {
			const radius = Math.hypot(x, y, z);
			const rho = radius * extent;
			if (rho < start || rho > end) return 0;
			const angular = radius === 0 ? Number(l === 0) : angularOrbital(l, orientation, x / radius, y / radius, z / radius);
			return radialOrbital(n, l, rho) * angular * inversePeak;
		},
	};
}

const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] as const;
const tetrahedra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]] as const;

function contourMesh(points: Float32Array, values: Float32Array, grid: number, positive: boolean): OrbitalMesh | undefined {
	const vertices: number[] = [], triangles: number[] = [];
	const edges = new Map<number, number>();
	const level = positive ? contour : -contour;
	const inside = (value: number) => positive ? value > level : value < level;
	const vertex = (a: number, b: number) => {
		const key = Math.min(a, b) * values.length + Math.max(a, b);
		let index = edges.get(key);
		if (index !== undefined) return index;
		index = vertices.length / 3;
		const t = (level - values[a]) / (values[b] - values[a]);
		for (let axis = 0; axis < 3; axis++) vertices.push(points[a * 3 + axis] + t * (points[b * 3 + axis] - points[a * 3 + axis]));
		edges.set(key, index);
		return index;
	};
	const triangle = (a: number, b: number, c: number, interior: number) => {
		const i = a * 3, j = b * 3, k = c * 3;
		const [x, y, z] = [vertices[j] - vertices[i], vertices[j + 1] - vertices[i + 1], vertices[j + 2] - vertices[i + 2]];
		const [u, v, w] = [vertices[k] - vertices[i], vertices[k + 1] - vertices[i + 1], vertices[k + 2] - vertices[i + 2]];
		const towardInside = (y * w - z * v) * (points[interior * 3] - vertices[i])
			+ (z * u - x * w) * (points[interior * 3 + 1] - vertices[i + 1])
			+ (x * v - y * u) * (points[interior * 3 + 2] - vertices[i + 2]);
		triangles.push(a, towardInside > 0 ? c : b, towardInside > 0 ? b : c);
	};
	const cornerOffsets = corners.map(([x, y, z]) => x + (y + z * grid) * grid);
	const plane = grid * grid;
	const ids = new Int32Array(8), flags = new Uint8Array(8);
	for (let z = 0; z < grid - 1; z++) for (let y = 0; y < grid - 1; y++) for (let x = 0; x < grid - 1; x++) {
		const base = x + y * grid + z * plane;
		let count = 0;
		for (let n = 0; n < 8; n++) {
			const id = base + cornerOffsets[n];
			ids[n] = id;
			flags[n] = Number(inside(values[id]));
			count += flags[n];
		}
		if (!count || count === 8) continue;
		for (const tetra of tetrahedra) {
			const inner: number[] = [], outer: number[] = [];
			for (const corner of tetra) (flags[corner] ? inner : outer).push(ids[corner]);
			if (!inner.length || !outer.length) continue;
			if (inner.length === 2) {
				const a = vertex(inner[0], outer[0]), b = vertex(inner[0], outer[1]);
				const c = vertex(inner[1], outer[0]), d = vertex(inner[1], outer[1]);
				triangle(a, b, c, inner[0]);
				triangle(c, b, d, inner[1]);
			} else {
				const [one, rest] = inner.length === 1 ? [inner, outer] : [outer, inner];
				const [a, b, c] = rest.map(id => vertex(one[0], id));
				triangle(a, b, c, inner[0]);
			}
		}
	}
	if (!triangles.length) return undefined;
	const positions = Float32Array.from(vertices), indices = Uint32Array.from(triangles);
	return { positions, indices, normals: meshNormals(positions, indices) };
}

export function atomicOrbitalMesh({ atomicNumber, electrons, subshell, orientation, region }: AtomicOrbitalDisplay, grid = 43) {
	if (!subshell) return { phases: [], extent: 1, physical: false };
	const { n, l } = subshell;
	const field = atomicOrbitalField(n, l, orientation, region);
	const physical = electrons === 1;
	const extent = physical ? field.extent * n * bohrAngstrom / (2 * atomicNumber) : 1;
	const size = grid ** 3;
	const points = new Float32Array(size * 3), values = new Float32Array(size);
	for (let z = 0, i = 0; z < grid; z++) for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++, i++) {
		const pos: Point3 = [2 * x / (grid - 1) - 1, 2 * y / (grid - 1) - 1, 2 * z / (grid - 1) - 1];
		points.set(pos, i * 3);
		values[i] = field.value(...pos);
	}
	return { phases: [contourMesh(points, values, grid, true), contourMesh(points, values, grid, false)], extent, physical };
}

// A common plane for every shape in the fallback. Test a few views first to
// avoid looking directly into a node of the selected real orbital.
const slicePlanes: ((x: number, y: number) => Point3)[] = [
	(x, y) => [x, y, 0], (x, y) => [x, 0, y], (x, y) => [0, x, y],
	(x, y) => [x, y * Math.SQRT1_2, y * Math.SQRT1_2],
	(x, y) => [y * Math.SQRT1_2, x, y * Math.SQRT1_2],
];

function slicePaths(side: number, sample: (x: number, y: number) => number) {
	const paths = ["", ""];
	let count = 0;
	for (let y = 0; y < side; y++) {
		for (let x = 0, start = 0, phase = -1; x <= side; x++) {
			const next = x === side ? -1 : sample((2 * x + 1) / side - 1, 1 - (2 * y + 1) / side);
			if (next === phase) continue;
			if (phase >= 0) {
				const width = x - start;
				count += width;
				paths[phase] += `M${start} ${y}h${width}v1h-${width}z`;
			}
			start = x;
			phase = next;
		}
	}
	return { count, paths };
}

export function atomicOrbitalSlice(display: AtomicOrbitalDisplay, overlay?: readonly AtomicOrbitalPart[], side = 128) {
	if (!display.subshell) return undefined;
	const { n, l } = display.subshell;
	const field = atomicOrbitalField(n, l, display.orientation, display.region);
	const key = atomicOrbitalKey(display);
	const scale = overlay?.find(part => part.key === key)?.scale ?? 1;
	const phase = (value: number) => value > contour ? 0 : value < -contour ? 1 : -1;
	const section = (side: number, plane: typeof slicePlanes[number]) =>
		slicePaths(side, (x, y) => phase(field.value(...plane(x / scale, y / scale))));
	const plane = slicePlanes.map(plane => ({ plane, count: section(32, plane).count }))
		.reduce((best, candidate) => candidate.count > best.count ? candidate : best).plane;
	const { paths } = section(side, plane);
	const backgroundSide = 64;
	const fields = overlay?.filter(part => part.key !== key).map(part => {
		const { n, l } = part.subshell;
		return { scale: part.scale, field: atomicOrbitalField(n, l, part.orientation, part.region) };
	});
	// Within each faint phase, use the union of the cross-sections so overlapping
	// inner contours do not accumulate enough opacity to hide the selection.
	const background = fields && [1, -1].map(sign => slicePaths(backgroundSide, (x, y) => {
		const distance = Math.hypot(x, y);
		const visible = fields.some(part => distance <= part.scale
			&& sign * part.field.value(...plane(x / part.scale, y / part.scale)) > contour);
		return visible ? 0 : -1;
	}).paths[0]);
	return { side, paths, background, backgroundScale: side / backgroundSide };
}

/** A subshell is shown on its own scale unless other subshells are overlaid. */
export function atomicFamilyParts(subshell: Subshell, region: number): AtomicOrbitalPart[] {
	return Array.from({ length: 2 * subshell.l + 1 }, (_, orientation) => {
		const part = { subshell, orientation, region };
		return { ...part, key: atomicOrbitalKey(part), scale: 1 };
	});
}
