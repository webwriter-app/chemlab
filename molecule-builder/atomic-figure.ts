import { LitElement, css, html, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { atomicDrawingStyles, atomicOrbitalLabel, initialAtomChoices, renderAtomicShells, renderNucleusLabel, renderOrbitalFallback,
	type AtomChoices } from "./atomic-model";
import type { AtomicConfiguration } from "./atomic-configuration";
import type { AtomicScene, OrbitalHover } from "./atomic-scene";
import { referenceNucleus } from "./atomic-nucleus";

export class AtomicFigure extends LitElement {
	static styles = [atomicDrawingStyles, css`
		:host { display: block; position: relative; min-inline-size: 0; min-block-size: 0; overflow: hidden; }
		.scene, .fallback { position: absolute; inset: 0; }
		.scene { touch-action: none; }
		.scene[data-interactive] { cursor: grab; }
		.scene:active[data-interactive] { cursor: grabbing; }
		[hidden] { display: none !important; }
		.fallback { overflow: auto; display: grid; align-items: center; }
		.fallback .atom-shell-figure { max-block-size: 100%; }
		.label { position: absolute; inset: auto .4rem .4rem auto; pointer-events: none; padding: .2rem .38rem;
			color: #16384d; background: white; border: 1px solid #bfd4e0; border-radius: 4px; font: 600 .72rem/1.2 system-ui; }
		.nucleus { pointer-events: auto; }
	`];
	@property({ attribute: false }) accessor atomicNumber = 1;
	@property({ attribute: false }) accessor symbolText = "H";
	@property({ attribute: false }) accessor configuration: AtomicConfiguration | undefined;
	@property({ attribute: false }) accessor choices: AtomChoices = initialAtomChoices();
	@property({ attribute: false }) accessor pause = false;
	@property({ attribute: false }) accessor interactive = true;
	@property({ attribute: false }) accessor externalLabels = false;
	@state() private accessor ready = false;
	@state() private accessor hover: OrbitalHover | undefined;
	#scene?: AtomicScene;
	#rendererHost?: HTMLElement;
	#request = 0;
	#media?: MediaQueryList;
	#visibility?: IntersectionObserver;
	#visible = true;
	#pointers = new Map<number, { x: number; y: number }>();
	#t = (en: string, de: string) => this.lang.startsWith("de") ? de : en;

	override connectedCallback() {
		super.connectedCallback();
		this.#media = this.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)");
		this.#media?.addEventListener("change", this.#motionChanged);
		if (typeof IntersectionObserver === "function") {
			this.#visibility = new IntersectionObserver(([entry]) => {
				this.#visible = entry.isIntersecting;
				this.#scene?.setVisible(this.#visible);
				if (!this.ready) this.requestUpdate();
			});
			this.#visibility.observe(this);
		}
		void this.#start();
	}

	override disconnectedCallback() {
		this.#request++;
		this.#media?.removeEventListener("change", this.#motionChanged);
		this.#visibility?.disconnect();
		this.#visibility = undefined;
		this.#visible = true;
		this.#pointers.clear();
		this.#disposeScene();
		super.disconnectedCallback();
	}

	#getOrbitalLabel() {
		return this.choices.model === "orbitals" && this.hover
			? atomicOrbitalLabel(this.hover.subshell, this.hover.orientation, this.#t) : undefined;
	}

	protected override updated(changed: PropertyValues) {
		this.#sync();
		if (this.externalLabels && (changed.has("choices") || changed.has("externalLabels")
			|| changed.has("lang") || changed.has("hover"))) {
			this.dispatchEvent(new CustomEvent("orbital-label", { detail: this.#getOrbitalLabel() }));
		}
	}

	#disposeScene() {
		const scene = this.#scene;
		this.#scene = undefined;
		scene?.canvas.removeEventListener("webglcontextlost", this.#contextLost);
		scene?.destroy();
		this.#rendererHost?.remove();
		this.#rendererHost = undefined;
		this.ready = false;
		this.hover = undefined;
	}

	async #start() {
		const request = ++this.#request;
		await this.updateComplete;
		const host = this.renderRoot.querySelector<HTMLElement>(".scene");
		if (request !== this.#request || !this.isConnected || !host) return;
		const local = this.ownerDocument.createElement("div");
		try {
			const { AtomicScene } = await import("./atomic-scene");
			if (request !== this.#request || !this.isConnected) return;
			// Give an in-flight renderer its own host so reconnecting cannot remove another scene's canvas.
			local.className = "scene";
			local.setAttribute("aria-hidden", "true");
			const scene = await AtomicScene.create(local, hit => {
				if (request === this.#request) this.hover = hit;
			}, scale => {
				if (request === this.#request) this.dispatchEvent(new CustomEvent("atomic-scale", { detail: scale }));
			});
			if (request !== this.#request || !this.isConnected) {
				scene.destroy();
				return;
			}
			host.append(local);
			this.#rendererHost = local;
			this.#scene = scene;
			scene.canvas.addEventListener("webglcontextlost", this.#contextLost, { once: true });
			scene.setVisible(this.#visible);
			this.ready = true;
		} catch {
			local.remove();
		}
	}

	#contextLost = (event: Event) => {
		if (event.currentTarget !== this.#scene?.canvas) return;
		this.#disposeScene();
		this.dispatchEvent(new CustomEvent("atomic-scale", { detail: 0 }));
	};

	#sync() {
		if (this.configuration) this.#scene?.setModel(this.atomicNumber, this.configuration, this.choices, !this.pause && !this.#media?.matches);
	}
	#motionChanged = () => this.#sync();

	fit() { this.#scene?.fit(); }
	zoom(factor: number) { this.#scene?.zoom(factor); }

	#down = (event: PointerEvent) => {
		if (!this.interactive || event.button !== 0) return;
		event.stopPropagation();
		this.#pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		this.#scene?.point();
	};

	#distance() {
		const [a, b] = this.#pointers.values();
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	#move = (event: PointerEvent) => {
		const last = this.#pointers.get(event.pointerId);
		if (!last) {
			if (event.pointerType !== "touch") this.#scene?.point(event.clientX, event.clientY);
			return;
		}
		event.stopPropagation();
		const previousDistance = this.#pointers.size === 2 ? this.#distance() : 0;
		this.#pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (previousDistance) this.zoom(previousDistance / Math.max(1, this.#distance()));
		else if (this.#pointers.size === 1) this.#scene?.orbit(event.clientX - last.x, event.clientY - last.y);
	};

	#up = (event: PointerEvent) => {
		if (!this.#pointers.delete(event.pointerId)) return;
		event.stopPropagation();
		if (event.type === "pointerup" && event.pointerType !== "touch") this.#scene?.point(event.clientX, event.clientY);
	};

	protected override render() {
		const label = this.externalLabels ? undefined : this.#getOrbitalLabel();
		const nucleus = this.choices.model === "bohr" ? referenceNucleus(this.atomicNumber) : undefined;
		return html`<div class="scene" ?hidden=${!this.ready} ?data-interactive=${this.interactive}
			@pointerdown=${this.#down} @pointermove=${this.#move} @pointerup=${this.#up} @pointercancel=${this.#up}
			@pointerleave=${() => this.#scene?.point()}
			@wheel=${(event: WheelEvent) => {
				if (!this.interactive) return;
				event.preventDefault();
				event.stopPropagation();
				this.zoom(Math.exp(Math.max(-100, Math.min(100, event.deltaY)) * .004));
			}}></div>
			${!this.ready && this.configuration ? html`<div class="fallback">
				${this.choices.model === "bohr"
					? renderAtomicShells(nucleus, this.configuration, this.choices, this.pause || !this.#visible, this.#t)
					: renderOrbitalFallback(this.configuration, this.choices, this.#t)}
			</div>` : null}
			${label ? html`<span class="label" role="tooltip">${label}</span>` : null}
			${nucleus && !this.externalLabels ? html`<span class="label">${renderNucleusLabel(nucleus, this.symbolText, this.#t)}</span>` : null}`;
	}
}
