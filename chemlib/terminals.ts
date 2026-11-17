import { ComponentManager } from "./ComponentManager";
import { EComponentType, ElectricComponent, type CableEnd } from "./ElectricComponent";

/**
 * A component entry of the authored data block, reduced to what restoring the
 * wiring needs: the runtime id the entry became and the indices of the entries
 * it is wired to.
 *
 * A cable entry lists one index per end, with `null` for an end that hangs
 * free, so the position in the list is the end it belongs to. Every other
 * entry lists the devices it is wired to, in terminal order.
 *
 * @export
 * @interface ConnectionEntry
 */
export interface ConnectionEntry {
	id?: number;
	type?: string;
	connections?: Array<number | null>;
}

/**
 * Whether two devices are already joined by a cable. A device slot holds the
 * cable that occupies it, not the device at the far end, so the cable has to
 * be followed to its other end.
 *
 * @export
 * @param {ElectricComponent} a - the first device
 * @param {ElectricComponent} b - the second device
 * @returns {boolean}
 */
export function alreadyWired(a: ElectricComponent, b: ElectricComponent): boolean {
	for (const partner of a._connections) {
		if (!partner) continue;
		if (partner === b) return true;
		if (partner._type === EComponentType.Cable && partner._connections.includes(b)) return true;
	}
	return false;
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
	if (alreadyWired(a, b)) return false;
	return a.freeTerminals.length > 0 && b.freeTerminals.length > 0;
}

/**
 * The plug a cable end needs to fit a terminal: a metal strip is clamped, an
 * instrument post is plugged into.
 *
 * @private
 * @param {ElectricComponent} device - the device
 * @param {number} terminal - the terminal index
 * @returns {CableEnd}
 */
function endFor(device: ElectricComponent, terminal: number): CableEnd {
	return device.socketAt(terminal) === "clip" ? "crocodile" : "banana";
}

/**
 * Joins two devices with a fresh cable and returns it, or `undefined` when the
 * pair cannot be joined. The terminals default to the first free one on each
 * side, so a caller that only knows the two devices still gets a sensible
 * wiring; a terminal that is already taken falls back the same way.
 *
 * The cable takes the plugs its two devices need, so the implicit path also
 * works for a metal electrode, which only accepts a crocodile clip.
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
	cable._cableEnds = [endFor(a, slotA), endFor(b, slotB)];
	// `canConnect` guarantees both slots are free, so neither attach can fail.
	a.attach(cable, slotA);
	b.attach(cable, slotB);
	cable.attach(a, 0);
	cable.attach(b, 1);
	return cable;
}

/**
 * Whether one end of a cable fits a terminal of a device. The end has to be
 * free, the device must not already sit on the other end, the terminal has to
 * be free, and the plug has to match the socket: a crocodile clip clamps onto
 * a metal electrode, a banana plug goes into a binding post.
 *
 * @export
 * @param {ElectricComponent} cable - the cable
 * @param {number} end - the end of the cable, 0 or 1
 * @param {ElectricComponent} device - the device to plug into
 * @param {number} [terminal] - the terminal to use, first free by default
 * @returns {boolean}
 */
export function canPlug(
	cable: ElectricComponent,
	end: number,
	device: ElectricComponent,
	terminal?: number
): boolean {
	if (!cable || !device || cable === device) return false;
	if (cable._type !== EComponentType.Cable) return false;
	if (!(end === 0 || end === 1)) return false;
	if (cable._connections[end]) return false;
	if (cable._connections.includes(device)) return false;
	const free = device.freeTerminals;
	if (!free.length) return false;
	const slot = terminal !== undefined && free.includes(terminal) ? terminal : free[0];
	const socket = device.socketAt(slot);
	if (!socket) return false;
	return socket === (cable._cableEnds[end] === "crocodile" ? "clip" : "banana");
}

/**
 * Plugs one end of a cable into a terminal of a device. The cable keeps its
 * other end, so a cable can be wired one end at a time.
 *
 * @export
 * @param {ElectricComponent} cable - the cable
 * @param {number} end - the end of the cable, 0 or 1
 * @param {ElectricComponent} device - the device to plug into
 * @param {number} [terminal] - the terminal to use, first free by default
 * @returns {boolean} whether the end was plugged in
 */
export function plugCable(
	cable: ElectricComponent,
	end: number,
	device: ElectricComponent,
	terminal?: number
): boolean {
	if (!canPlug(cable, end, device, terminal)) return false;
	const free = device.freeTerminals;
	const slot = terminal !== undefined && free.includes(terminal) ? terminal : free[0];
	if (slot === undefined) return false;
	device.attach(cable, slot);
	cable.attach(device, end);
	return true;
}

/**
 * The pairs of entries the authored data block describes, deduplicated and in
 * the order the block lists them. A pair is keyed by the smaller index first,
 * so an entry that names its partner without the partner naming it back still
 * yields exactly one cable.
 *
 * A cable entry lists the devices on its two ends, not partners of its own, so
 * it takes no part in the implicit wiring.
 *
 * @export
 * @param {readonly ConnectionEntry[]} entries - the authored component entries
 * @returns {Array<[number, number]>} pairs of entry indices
 */
export function connectionPairs(entries: readonly ConnectionEntry[]): Array<[number, number]> {
	const seen = new Set<string>();
	const pairs: Array<[number, number]> = [];
	entries.forEach((entry, index) => {
		if (entry.type === EComponentType.Cable) return;
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

/**
 * Plugs the ends of the cables a layout was saved with. A cable entry names
 * the device on each of its ends, so the position in the list is the end; an
 * end that was saved as `null` stays free. This runs before the implicit
 * wiring, so a layout that carries both descriptions is not wired twice.
 *
 * @export
 * @template T
 * @param {readonly ConnectionEntry[]} entries - the authored component entries
 * @param {(id: number) => (T | undefined)} lookup - resolves a runtime id to a device
 * @param {(cable: T, end: number, device: T) => boolean} plug - plugs one end, true on success
 * @returns {{ plugged: number; skipped: number; missing: number }}
 */
export function restoreCables<T>(
	entries: readonly ConnectionEntry[],
	lookup: (id: number) => T | undefined,
	plug: (cable: T, end: number, device: T) => boolean
): { plugged: number; skipped: number; missing: number } {
	let plugged = 0;
	let skipped = 0;
	let missing = 0;
	for (const entry of entries) {
		if (entry.type !== EComponentType.Cable || entry.id === undefined) continue;
		const cable = lookup(entry.id);
		if (!cable) {
			missing += 1;
			continue;
		}
		(entry.connections ?? []).forEach((partner, end) => {
			if (partner === null || partner === undefined) return;
			const device = lookup(partner);
			if (!device) {
				missing += 1;
				return;
			}
			if (plug(cable, end, device)) plugged += 1;
			else skipped += 1;
		});
	}
	return { plugged, skipped, missing };
}
