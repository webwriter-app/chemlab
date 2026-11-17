import { ComponentManager } from "./ComponentManager";
import { EComponentType, ElectricComponent } from "./ElectricComponent";

/**
 * A component entry of the authored data block, reduced to what restoring the
 * wiring needs: the runtime id the entry became and the indices of the entries
 * it is wired to.
 *
 * @export
 * @interface ConnectionEntry
 */
export interface ConnectionEntry {
	id?: number;
	connections?: number[];
}

/**
 * Whether two devices may be joined by a cable. A device without terminals (a
 * salt bridge, a gas collection tube, a label) never takes one, a device whose
 * terminals are all taken cannot take another, and a pair that is already
 * wired is not wired a second time.
 *
 * @export
 * @param {ElectricComponent} a - the first device
 * @param {ElectricComponent} b - the second device
 * @returns {boolean}
 */
export function canConnect(a: ElectricComponent, b: ElectricComponent): boolean {
	if (!a || !b || a === b) return false;
	if (!(a._conCount > 0) || !(b._conCount > 0)) return false;
	if (a._connections.includes(b)) return false;
	return a.freeTerminals.length > 0 && b.freeTerminals.length > 0;
}

/**
 * Joins two devices with a fresh cable and returns it, or `undefined` when the
 * pair cannot be joined. The terminals default to the first free one on each
 * side, so a caller that only knows the two devices still gets a sensible
 * wiring; a terminal that is already taken falls back the same way.
 *
 * @export
 * @param {ElectricComponent} a - the first device
 * @param {ElectricComponent} b - the second device
 * @param {number} [terminalA] - the terminal of `a` to use
 * @param {number} [terminalB] - the terminal of `b` to use
 * @returns {(ElectricComponent | undefined)} the cable, or undefined
 */
export function connectDevices(
	a: ElectricComponent,
	b: ElectricComponent,
	terminalA?: number,
	terminalB?: number
): ElectricComponent | undefined {
	if (!canConnect(a, b)) return undefined;
	const freeA = a.freeTerminals;
	const freeB = b.freeTerminals;
	const slotA = terminalA !== undefined && freeA.includes(terminalA) ? terminalA : freeA[0];
	const slotB = terminalB !== undefined && freeB.includes(terminalB) ? terminalB : freeB[0];
	if (slotA === undefined || slotB === undefined) return undefined;
	const cable = ComponentManager.newElectricComponent(EComponentType.Cable);
	// `canConnect` guarantees both slots are free, so neither attach can fail.
	a.attach(cable, slotA);
	b.attach(cable, slotB);
	cable.attach(a, 0);
	cable.attach(b, 1);
	return cable;
}

/**
 * The pairs of entries the authored data block describes, deduplicated and in
 * the order the block lists them. A pair is keyed by the smaller index first,
 * so an entry that names its partner without the partner naming it back still
 * yields exactly one cable.
 *
 * @export
 * @param {readonly ConnectionEntry[]} entries - the authored component entries
 * @returns {Array<[number, number]>} pairs of entry indices
 */
export function connectionPairs(entries: readonly ConnectionEntry[]): Array<[number, number]> {
	const seen = new Set<string>();
	const pairs: Array<[number, number]> = [];
	entries.forEach((entry, index) => {
		for (const partner of entry.connections ?? []) {
			if (!Number.isInteger(partner) || partner < 0 || partner >= entries.length) continue;
			if (partner === index) continue;
			const key = index < partner ? `${index}:${partner}` : `${partner}:${index}`;
			if (seen.has(key)) continue;
			seen.add(key);
			pairs.push([index, partner]);
		}
	});
	return pairs;
}

/**
 * Rebuilds the cables of a restored layout. Each entry carries the runtime id
 * of the component it became, so the lookup resolves an entry index to the
 * live device. A pair whose devices are missing, or that the connect callback
 * refuses, is counted and skipped instead of aborting the whole restore.
 *
 * @export
 * @template T
 * @param {readonly ConnectionEntry[]} entries - the authored component entries
 * @param {(id: number) => (T | undefined)} lookup - resolves a runtime id to a device
 * @param {(a: T, b: T) => boolean} connect - wires two devices, true on success
 * @returns {{ connected: number; skipped: number; missing: number }}
 */
export function restoreConnections<T>(
	entries: readonly ConnectionEntry[],
	lookup: (id: number) => T | undefined,
	connect: (a: T, b: T) => boolean
): { connected: number; skipped: number; missing: number } {
	let connected = 0;
	let skipped = 0;
	let missing = 0;
	for (const [first, second] of connectionPairs(entries)) {
		const idA = entries[first].id;
		const idB = entries[second].id;
		const a = idA === undefined ? undefined : lookup(idA);
		const b = idB === undefined ? undefined : lookup(idB);
		if (!a || !b) {
			missing += 1;
			continue;
		}
		if (connect(a, b)) connected += 1;
		else skipped += 1;
	}
	return { connected, skipped, missing };
}
