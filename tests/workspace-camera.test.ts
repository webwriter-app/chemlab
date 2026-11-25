import assert from "node:assert/strict";
import { test } from "node:test";
import { WorkspaceCamera } from "../controllers/WorkspaceCamera";

type Bounds = { x: number; y: number; width: number; height: number };

/** The four corners of a world rectangle, in screen coordinates. */
function corners(camera: WorkspaceCamera, bounds: Bounds) {
	return [
		camera.toScreen(bounds.x, bounds.y),
		camera.toScreen(bounds.x + bounds.width, bounds.y),
		camera.toScreen(bounds.x, bounds.y + bounds.height),
		camera.toScreen(bounds.x + bounds.width, bounds.y + bounds.height),
	];
}

/**
 * Asserts that a fitted camera shows the whole rectangle: every corner lies
 * inside the viewport and above the strip reserved for the canvas controls.
 */
function assertInFrame(camera: WorkspaceCamera, bounds: Bounds, bottomInset: number) {
	const reserved = Math.min(bottomInset, camera.height / 2);
	for (const point of corners(camera, bounds)) {
		assert.ok(point.x >= -0.001 && point.x <= camera.width + 0.001,
			`x ${point.x} outside 0…${camera.width}`);
		assert.ok(point.y >= -0.001 && point.y <= camera.height - reserved + 0.001,
			`y ${point.y} outside 0…${camera.height - reserved}`);
	}
}

test("a fitted layout stays inside the viewport", () => {
	const layouts: Bounds[] = [
		{ x: 0, y: 0, width: 800, height: 600 },
		{ x: -1200, y: -400, width: 2400, height: 1600 },
		{ x: 400, y: 300, width: 40, height: 30 },
		{ x: 7, y: -133, width: 789, height: 854 },
	];
	const viewports: [number, number][] = [[800, 600], [1600, 1000], [420, 900], [1000, 300]];
	for (const bounds of layouts) {
		for (const [width, height] of viewports) {
			const camera = new WorkspaceCamera();
			camera.resize(width, height);
			camera.fit(bounds, 28);
			assertInFrame(camera, bounds, 28);
		}
	}
});

test("opening a drawer refits the layout into the narrower canvas", () => {
	const bounds: Bounds = { x: 0, y: 0, width: 800, height: 600 };
	const camera = new WorkspaceCamera();
	camera.resize(1000, 700);
	camera.fit(bounds, 28);
	assertInFrame(camera, bounds, 28);

	// The palette takes a column, so the canvas area shrinks.
	camera.resize(620, 700);
	camera.fit(bounds, 28);
	assertInFrame(camera, bounds, 28);
	assert.ok(camera.zoom < 1, "the narrower canvas needs a smaller zoom");
});

test("a layout wider than the canvas is scaled down, not cropped", () => {
	const camera = new WorkspaceCamera();
	camera.resize(400, 400);
	camera.fit({ x: 0, y: 0, width: 1600, height: 100 }, 0);
	assertInFrame(camera, { x: 0, y: 0, width: 1600, height: 100 }, 0);
	assert.ok(camera.zoom < 1);
});

test("an empty or unmeasurable layout leaves the camera alone", () => {
	const camera = new WorkspaceCamera();
	camera.resize(800, 600);
	camera.zoom = 2;
	camera.x = 100;
	camera.y = 200;
	camera.fit({ x: 0, y: 0, width: 0, height: 0 }, 0);
	assert.equal(camera.zoom, 2);
	assert.equal(camera.x, 100);
	assert.equal(camera.y, 200);

	camera.fit({ x: Number.NaN, y: 0, width: 10, height: 10 }, 0);
	assert.equal(camera.zoom, 2);
	assert.equal(camera.x, 100);
});

test("a dragged object's anchor lands on the grid drawn at the current zoom", () => {
	const camera = new WorkspaceCamera();
	camera.resize(737, 503);
	camera.panBy(33.4, -22.1);
	const anchorX = -27.3, anchorY = -54.6;
	for (const factor of [.47, 3.2, 2.1]) {
		camera.zoomAt(factor, 137, 229);
		const step = camera.gridCellWidth;
		const { x, y } = camera.snapToGrid(-45.3, 170.2, anchorX, anchorY);
		assert.ok(Math.abs((x + anchorX) / step - Math.round((-45.3 + anchorX) / step)) < 1e-8);
		assert.ok(Math.abs((y + anchorY) / step - Math.round((170.2 + anchorY) / step)) < 1e-8);
	}
});

test("the selection outline encloses its contents on visible grid lines after zoom and pan", () => {
	const camera = new WorkspaceCamera();
	camera.resize(737, 503);
	camera.zoomAt(1.27, 129, 150);
	camera.panBy(26.5, -37.2);
	const step = camera.gridCellWidth;
	const start = camera.toScreen(-3 * step, 2 * step);
	const end = camera.toScreen(step, 8 * step);
	const frame = camera.encloseInGrid(start.x, start.y + 1, end.x - 1, end.y);
	assert.deepEqual(frame, { left: start.x, top: start.y, right: end.x, bottom: end.y });
});
