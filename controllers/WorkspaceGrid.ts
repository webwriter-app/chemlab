import { Mesh, MeshGeometry, Shader, UniformGroup } from "pixi.js";
import type { WorkspaceCamera } from "./WorkspaceCamera";

const vertex = `
	in vec2 aPosition;
	out vec2 vScreenUv;
	void main() {
		vScreenUv = aPosition;
		gl_Position = vec4(2.0 * aPosition.x - 1.0, 1.0 - 2.0 * aPosition.y, 0.0, 1.0);
	}
`;

const fragment = `
	in vec2 vScreenUv;
	out vec4 finalColor;
	uniform vec2 uViewport;
	uniform vec2 uGridOrigin;
	uniform float uGridStep;
	void main() {
		vec2 cell = (vScreenUv * uViewport - uGridOrigin) / uGridStep;
		vec2 distancePx = abs(fract(cell + 0.5) - 0.5) * uGridStep;
		float line = 1.0 - smoothstep(0.15, 0.95, min(distancePx.x, distancePx.y));
		finalColor = vec4(mix(vec3(0.969, 0.969, 0.961), vec3(0.847), line), 1.0);
	}
`;

export class WorkspaceGrid {
	private uniforms = new UniformGroup({
		uViewport: { value: new Float32Array([800, 600]), type: "vec2<f32>" },
		uGridOrigin: { value: new Float32Array(2), type: "vec2<f32>" },
		uGridStep: { value: 20, type: "f32" },
	});

	readonly mesh = new Mesh({
		geometry: new MeshGeometry({
			positions: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
			indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
		}),
		shader: Shader.from({ gl: { vertex, fragment }, resources: { grid: this.uniforms } }),
		eventMode: "none",
	});

	update(camera: WorkspaceCamera): void {
		const { uniforms } = this.uniforms;
		const step = camera.gridCellWidth * camera.zoom;
		uniforms.uViewport[0] = camera.width;
		uniforms.uViewport[1] = camera.height;
		// Keep large world translations out of the shader's floating-point coordinates.
		uniforms.uGridOrigin[0] = camera.offsetX % step;
		uniforms.uGridOrigin[1] = camera.offsetY % step;
		uniforms.uGridStep = step;
		this.uniforms.update();
	}
}
