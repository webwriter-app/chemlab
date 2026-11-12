export const STANDARD_CANVAS_WIDTH = 800;
export const STANDARD_CANVAS_HEIGHT = 600;
const MIN_ZOOM = 0.025;
const MAX_ZOOM = 8;

export class WorkspaceCamera {
	width = STANDARD_CANVAS_WIDTH;
	height = STANDARD_CANVAS_HEIGHT;
	zoom = 1;
	x = STANDARD_CANVAS_WIDTH / 2;
	y = STANDARD_CANVAS_HEIGHT / 2;
	private navigated = false;
	private minZoom = MIN_ZOOM;

	get offsetX(): number {
		return this.width / 2 - this.x * this.zoom;
	}

	get offsetY(): number {
		return this.height / 2 - this.y * this.zoom;
	}

	resize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		if (!this.navigated) this.zoom = Math.min(1, width / STANDARD_CANVAS_WIDTH, height / STANDARD_CANVAS_HEIGHT);
	}

	toWorld(screenX: number, screenY: number) {
		return {
			x: this.x + (screenX - this.width / 2) / this.zoom,
			y: this.y + (screenY - this.height / 2) / this.zoom,
		};
	}

	toScreen(worldX: number, worldY: number) {
		return { x: worldX * this.zoom + this.offsetX, y: worldY * this.zoom + this.offsetY };
	}

	panBy(screenX: number, screenY: number): void {
		this.navigated = true;
		this.x -= screenX / this.zoom;
		this.y -= screenY / this.zoom;
	}

	zoomAt(factor: number, screenX: number, screenY: number): void {
		const next = Math.max(this.minZoom, Math.min(MAX_ZOOM, this.zoom * factor));
		if (next === this.zoom) return;
		const anchor = this.toWorld(screenX, screenY);
		this.navigated = true;
		this.zoom = next;
		this.x = anchor.x - (screenX - this.width / 2) / next;
		this.y = anchor.y - (screenY - this.height / 2) / next;
	}

	fit(bounds: { x: number; y: number; width: number; height: number }, bottomInset: number): void {
		const { x, y, width, height } = bounds;
		if (![x, y, width, height].every(Number.isFinite) || (width === 0 && height === 0)) return;
		const padding = Math.min(16, this.width / 8, this.height / 8);
		const reserved = Math.min(bottomInset, this.height / 2);
		this.zoom = Math.min(
			MAX_ZOOM,
			(this.width - 2 * padding) / Math.max(1, width),
			(this.height - 2 * padding - reserved) / Math.max(1, height),
		);
		// Very distant objects can require a wider view than the usual zoom limit.
		this.minZoom = Math.min(MIN_ZOOM, this.zoom);
		this.x = x + width / 2;
		this.y = y + height / 2 + reserved / (2 * this.zoom);
		this.navigated = true;
	}
}
