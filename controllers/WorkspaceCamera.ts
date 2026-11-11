export const STANDARD_CANVAS_WIDTH = 800;
export const STANDARD_CANVAS_HEIGHT = 600;

export class WorkspaceCamera {
	width = STANDARD_CANVAS_WIDTH;
	height = STANDARD_CANVAS_HEIGHT;
	zoom = 1;
	x = STANDARD_CANVAS_WIDTH / 2;
	y = STANDARD_CANVAS_HEIGHT / 2;
	private navigated = false;

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
		const next = Math.max(0.025, Math.min(8, this.zoom * factor));
		if (next === this.zoom) return;
		const anchor = this.toWorld(screenX, screenY);
		this.navigated = true;
		this.zoom = next;
		this.x = anchor.x - (screenX - this.width / 2) / next;
		this.y = anchor.y - (screenY - this.height / 2) / next;
	}
}
