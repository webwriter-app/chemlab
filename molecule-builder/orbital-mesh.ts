import { cross, unit } from "./geometry";

export type OrbitalMesh = {
	positions: Float32Array;
	indices: Uint16Array | Uint32Array;
	normals: Float32Array;
};

export function meshNormals(positions: Float32Array, indices: OrbitalMesh["indices"]) {
	const normals = new Float32Array(positions.length);
	for (let i = 0; i < indices.length; i += 3) {
		const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
		const normal = cross([positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]],
			[positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]]);
		for (const j of [a, b, c]) for (let axis = 0; axis < 3; axis++) normals[j + axis] += normal[axis];
	}
	for (let i = 0; i < normals.length; i += 3) normals.set(unit([normals[i], normals[i + 1], normals[i + 2]]), i);
	return normals;
}
