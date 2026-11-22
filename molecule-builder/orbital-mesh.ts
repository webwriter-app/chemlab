export type OrbitalMesh = {
	positions: Float32Array;
	indices: Uint16Array | Uint32Array;
	normals: Float32Array;
};

export function meshNormals(positions: Float32Array, indices: OrbitalMesh["indices"]) {
	const normals = new Float32Array(positions.length);
	for (let i = 0; i < indices.length; i += 3) {
		const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
		const abX = positions[b] - positions[a], acX = positions[c] - positions[a];
		const abY = positions[b + 1] - positions[a + 1], acY = positions[c + 1] - positions[a + 1];
		const abZ = positions[b + 2] - positions[a + 2], acZ = positions[c + 2] - positions[a + 2];
		const x = abY * acZ - abZ * acY, y = abZ * acX - abX * acZ, z = abX * acY - abY * acX;
		for (const offset of [a, b, c]) {
			normals[offset] += x;
			normals[offset + 1] += y;
			normals[offset + 2] += z;
		}
	}
	for (let i = 0; i < normals.length; i += 3) {
		const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
		if (!length) continue;
		normals[i] /= length;
		normals[i + 1] /= length;
		normals[i + 2] /= length;
	}
	return normals;
}
