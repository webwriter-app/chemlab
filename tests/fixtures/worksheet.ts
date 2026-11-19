/**
 * Minimal worksheet double for the routing tests.
 *
 * The Node test environment has no DOM, so the fixture provides exactly the
 * surface `periodic-table/routing.ts` needs: a scope that lists elements by
 * tag, elements with an ID and a listener pair, events with a composed path,
 * and an observer that a test can trigger by hand.
 *
 * @module tests/fixtures/worksheet
 */

import type {
	RoutingElement,
	RoutingEvent,
	RoutingObserver,
	RoutingRoot,
} from "../../periodic-table/routing";

/** Tag of the periodic table widget. */
export const TABLE_TAG = "webwriter-chemlab-periodic-table";

/** Listener signature of the fixture. */
export type FakeListener = (event: RoutingEvent) => void;

/**
 * Rejects selectors the fixture does not implement.
 *
 * @param selector - Selector passed to `querySelectorAll`.
 */
function assertTagSelector(selector: string) {
	if (!/^[a-z][a-z0-9-]*$/.test(selector)) {
		throw new Error(`fixture only supports tag selectors, got ${selector}`);
	}
}

/** Event with a fixed composed path. */
export class FakeEvent implements RoutingEvent {
	readonly type: string;
	readonly detail: unknown;
	readonly #path: readonly unknown[];

	/**
	 * @param type - Event type.
	 * @param detail - Event payload.
	 * @param path - Composed path, nearest node first.
	 */
	constructor(type: string, detail: unknown, path: readonly unknown[]) {
		this.type = type;
		this.detail = detail;
		this.#path = path;
	}

	/** @returns The composed path, nearest node first. */
	composedPath(): readonly unknown[] {
		return this.#path;
	}
}

/** Element double with children, listeners and bubbling dispatch. */
export class FakeElement implements RoutingElement {
	id = "";
	readonly localName: string;
	readonly children: FakeElement[] = [];
	parent: FakeElement | null = null;
	owner: FakeWorksheet | null = null;
	readonly #listeners = new Map<string, Set<FakeListener>>();

	/**
	 * @param localName - Lowercase tag name.
	 */
	constructor(localName: string) {
		this.localName = localName;
	}

	/** @returns The uppercase tag name. */
	get tagName(): string {
		return this.localName.toUpperCase();
	}

	/**
	 * Appends a child.
	 *
	 * @param child - Element to append.
	 * @returns The appended child.
	 */
	append(child: FakeElement): FakeElement {
		child.parent = this;
		child.owner = null;
		this.children.push(child);
		return child;
	}

	/** Detaches the element from its parent or from the worksheet. */
	remove() {
		if (this.parent !== null) {
			const index = this.parent.children.indexOf(this);
			if (index >= 0) this.parent.children.splice(index, 1);
			this.parent = null;
			return;
		}
		if (this.owner === null) return;
		const index = this.owner.children.indexOf(this);
		if (index >= 0) this.owner.children.splice(index, 1);
		this.owner = null;
	}

	/**
	 * Lists descendants of one tag.
	 *
	 * @param selector - Tag selector.
	 * @returns Matching descendants in document order.
	 */
	querySelectorAll(selector: string): FakeElement[] {
		assertTagSelector(selector);
		const found: FakeElement[] = [];
		const walk = (node: FakeElement) => {
			for (const child of node.children) {
				if (child.localName === selector) found.push(child);
				walk(child);
			}
		};
		walk(this);
		return found;
	}

	/**
	 * @param type - Event type.
	 * @param listener - Listener to add.
	 */
	addEventListener(type: string, listener: FakeListener) {
		let set = this.#listeners.get(type);
		if (set === undefined) {
			set = new Set();
			this.#listeners.set(type, set);
		}
		set.add(listener);
	}

	/**
	 * @param type - Event type.
	 * @param listener - Listener to remove.
	 */
	removeEventListener(type: string, listener: FakeListener) {
		this.#listeners.get(type)?.delete(listener);
	}

	/**
	 * Counts the listeners of one type.
	 *
	 * @param type - Event type.
	 * @returns Number of registered listeners.
	 */
	listenerCount(type: string): number {
		return this.#listeners.get(type)?.size ?? 0;
	}

	/**
	 * Dispatches an event that bubbles to the worksheet root.
	 *
	 * @param type - Event type.
	 * @param detail - Event payload.
	 * @returns The dispatched event.
	 */
	dispatch(type: string, detail: unknown): FakeEvent {
		const path: unknown[] = [];
		let node: FakeElement | null = this;
		while (node !== null) {
			path.push(node);
			node = node.parent;
		}
		const event = new FakeEvent(type, detail, path);
		for (const entry of path) {
			if (!(entry instanceof FakeElement)) continue;
			for (const listener of [...(entry.#listeners.get(type) ?? [])]) listener(event);
		}
		return event;
	}
}

/** Worksheet scope double. */
export class FakeWorksheet implements RoutingRoot {
	readonly children: FakeElement[] = [];

	/**
	 * Appends a top-level element.
	 *
	 * @param child - Element to append.
	 * @returns The appended child.
	 */
	append(child: FakeElement): FakeElement {
		child.parent = null;
		child.owner = this;
		this.children.push(child);
		return child;
	}

	/**
	 * Lists descendants of one tag.
	 *
	 * @param selector - Tag selector.
	 * @returns Matching descendants in document order.
	 */
	querySelectorAll(selector: string): FakeElement[] {
		assertTagSelector(selector);
		const found: FakeElement[] = [];
		const walk = (node: FakeElement) => {
			for (const child of node.children) {
				if (child.localName === selector) found.push(child);
				walk(child);
			}
		};
		for (const child of this.children) {
			if (child.localName === selector) found.push(child);
			walk(child);
		}
		return found;
	}
}

/** Observer double that a test triggers by hand. */
export class FakeObserver implements RoutingObserver {
	readonly targets: RoutingRoot[] = [];
	disconnects = 0;
	readonly #refresh: () => void;

	/**
	 * @param refresh - Callback the router passes in.
	 */
	constructor(refresh: () => void) {
		this.#refresh = refresh;
	}

	/**
	 * @param target - Scope the router watches.
	 */
	observe(target: RoutingRoot) {
		this.targets.push(target);
	}

	/** Records the disconnect. */
	disconnect() {
		this.disconnects += 1;
	}

	/** Runs the refresh callback once, as a batched mutation would. */
	trigger() {
		this.#refresh();
	}
}

/** Observer factory that keeps every created observer for the test. */
export class FakeObserverFactory {
	readonly observers: FakeObserver[] = [];

	/** @returns A factory for `SelectionRouterOptions.createObserver`. */
	get factory(): (refresh: () => void) => RoutingObserver {
		return (refresh) => {
			const observer = new FakeObserver(refresh);
			this.observers.push(observer);
			return observer;
		};
	}

	/** @returns The most recently created observer. */
	get last(): FakeObserver {
		const observer = this.observers[this.observers.length - 1];
		if (observer === undefined) throw new Error("no observer created yet");
		return observer;
	}
}

/**
 * Creates a table host element.
 *
 * @param id - Host ID.
 * @returns The host element.
 */
export function tableHost(id: string): FakeElement {
	const host = new FakeElement(TABLE_TAG);
	host.id = id;
	return host;
}
