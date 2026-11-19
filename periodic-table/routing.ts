/**
 * Worksheet routing for the periodic table selection event.
 *
 * A receiver in the same worksheet — a builder or a lab instance — binds to one
 * table by its host ID. The binding is resolved against an explicit worksheet
 * root, compared literally, and re-checked synchronously before every delivery,
 * so a stale listener can never deliver an event from a source that has since
 * been duplicated, removed or rebound.
 *
 * The module only needs a small part of the DOM, which keeps it testable in
 * Node: a root that can list elements of a tag, elements with an ID, a listener
 * pair and an event with a composed path. The widget itself stays free of
 * receiver logic; the picker and the lab actions belong to their own work
 * packages.
 *
 * @module periodic-table/routing
 */

import {
	ELEMENT_SELECTION_EVENT,
	isAtomicNumber,
	type ElementSelectionV1,
} from "./selection";

/** Element contract the router needs. */
export interface RoutingElement {
	/** Host ID, compared literally. */
	readonly id: string;
	/** Lowercase tag name, used to check the expected widget. */
	readonly localName: string;
	/** Lists descendants matching a tag selector. */
	querySelectorAll(selector: string): ArrayLike<RoutingElement>;
	/** Registers a listener for one event type. */
	addEventListener(type: string, listener: (event: RoutingEvent) => void): void;
	/** Removes a listener for one event type. */
	removeEventListener(type: string, listener: (event: RoutingEvent) => void): void;
}

/** Event contract the router needs. */
export interface RoutingEvent {
	/** Event type. */
	readonly type: string;
	/** Event payload, validated before delivery. */
	readonly detail?: unknown;
	/** Path from the dispatching node to the root, as the browser reports it. */
	composedPath?(): readonly unknown[];
}

/** Worksheet scope the router resolves against. */
export interface RoutingRoot {
	/** Lists descendants matching a tag selector. */
	querySelectorAll(selector: string): ArrayLike<RoutingElement>;
}

/** Observer contract, so a test can drive refreshes without a real DOM. */
export interface RoutingObserver {
	/** Starts watching the worksheet for child, ID and binding changes. */
	observe(target: RoutingRoot): void;
	/** Stops watching. */
	disconnect(): void;
}

/** Options of a receiver binding. */
export interface SelectionRouterOptions {
	/** Worksheet scope the source is resolved in. */
	readonly root: RoutingRoot;
	/** Host ID of the table the receiver is bound to. */
	readonly sourceId: string;
	/** Tag the source must carry, usually the table's custom element name. */
	readonly expectedTag: string;
	/** Receives every validated selection of the resolved source. */
	readonly onSelection: (selection: ElementSelectionV1) => void;
	/** Observer factory; defaults to `MutationObserver` when the host has one. */
	readonly createObserver?: (refresh: () => void) => RoutingObserver | null;
}

/**
 * Resolves a source element by ID inside a worksheet scope.
 *
 * The ID is compared literally and the tag must match, so a duplicate ID or a
 * wrong widget type resolves to nothing instead of to the first hit.
 *
 * @param root - Worksheet scope.
 * @param sourceId - Host ID to look for.
 * @param expectedTag - Tag the element must carry.
 * @returns The single matching element, or `null` when the binding is ambiguous.
 */
export function resolveSource(
	root: RoutingRoot,
	sourceId: string,
	expectedTag: string,
): RoutingElement | null {
	if (sourceId === "") return null;
	let found: RoutingElement | null = null;
	const candidates = root.querySelectorAll(expectedTag);
	for (let index = 0; index < candidates.length; index += 1) {
		const candidate = candidates[index];
		if (candidate.id !== sourceId) continue;
		if (found !== null) return null;
		found = candidate;
	}
	return found;
}

/**
 * Validates an arbitrary event payload.
 *
 * @param detail - Payload of a selection event.
 * @returns `true` for a version 1 payload with a valid atomic number.
 */
export function isSelectionPayload(detail: unknown): detail is ElementSelectionV1 {
	if (typeof detail !== "object" || detail === null) return false;
	const payload = detail as { version?: unknown; atomicNumber?: unknown; sourceId?: unknown };
	if (payload.version !== 1) return false;
	if (payload.atomicNumber !== null && !isAtomicNumber(payload.atomicNumber)) return false;
	if (payload.sourceId !== undefined && typeof payload.sourceId !== "string") return false;
	return true;
}

/**
 * Watches a worksheet scope for changes that can move a binding.
 *
 * @param refresh - Called once per batch of changes.
 * @returns An observer, or `null` when the host has no `MutationObserver`.
 */
function defaultObserver(refresh: () => void): RoutingObserver | null {
	if (typeof MutationObserver !== "function") return null;
	const observer = new MutationObserver(() => refresh());
	return {
		observe(target) {
			observer.observe(target as unknown as Node, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["id"],
			});
		},
		disconnect() {
			observer.disconnect();
		},
	};
}

/**
 * Delivers the selection of exactly one table to a receiver.
 *
 * A binding is resolved once, re-checked before every delivery and refreshed
 * when the worksheet changes. Rebinding, removal and disconnection dispose the
 * previous listener, so a receiver never counts a change twice.
 */
export class SelectionRouter {
	readonly #root: RoutingRoot;
	readonly #sourceId: string;
	readonly #expectedTag: string;
	readonly #onSelection: (selection: ElementSelectionV1) => void;
	readonly #createObserver: (refresh: () => void) => RoutingObserver | null;
	#source: RoutingElement | null = null;
	#observer: RoutingObserver | null = null;
	#listening = false;

	/**
	 * @param options - Worksheet scope, binding and delivery callback.
	 */
	constructor(options: SelectionRouterOptions) {
		this.#root = options.root;
		this.#sourceId = options.sourceId;
		this.#expectedTag = options.expectedTag;
		this.#onSelection = options.onSelection;
		this.#createObserver = options.createObserver ?? defaultObserver;
	}

	/** Currently resolved source, or `null` while the binding is unresolved. */
	get source(): RoutingElement | null {
		return this.#source;
	}

	/** Resolves the binding and starts watching the worksheet. */
	bind() {
		this.#resolve();
		if (this.#observer === null) {
			this.#observer = this.#createObserver(() => this.refresh());
			this.#observer?.observe(this.#root);
		}
	}

	/** Re-resolves the binding after a worksheet change. */
	refresh() {
		this.#resolve();
	}

	/** Stops delivering and watching. */
	dispose() {
		this.#detach();
		this.#observer?.disconnect();
		this.#observer = null;
		this.#source = null;
	}

	/** Resolves the source and moves the listener when the binding changed. */
	#resolve() {
		const next = resolveSource(this.#root, this.#sourceId, this.#expectedTag);
		if (next === this.#source) return;
		this.#detach();
		this.#source = next;
		if (next === null) return;
		next.addEventListener(ELEMENT_SELECTION_EVENT, this.#onEvent);
		this.#listening = true;
	}

	/** Removes the listener from the current source. */
	#detach() {
		if (!this.#listening || this.#source === null) return;
		this.#source.removeEventListener(ELEMENT_SELECTION_EVENT, this.#onEvent);
		this.#listening = false;
	}

	/**
	 * Delivers one event after checking its origin and payload.
	 *
	 * @param event - Selection event of the resolved source.
	 */
	#onEvent = (event: RoutingEvent) => {
		if (event.type !== ELEMENT_SELECTION_EVENT) return;
		const path = event.composedPath?.() ?? [];
		if (path[0] !== this.#source) return;
		if (resolveSource(this.#root, this.#sourceId, this.#expectedTag) !== this.#source) return;
		if (!isSelectionPayload(event.detail)) return;
		this.#onSelection(event.detail);
	};
}
