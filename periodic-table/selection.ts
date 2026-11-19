/**
 * Selection contract shared by the periodic table widget and its receivers.
 *
 * The module stays dependency free so a receiver can import the event name,
 * the payload type and the validators without pulling in the table's rendering
 * code, its reference data or any Shoelace component.
 *
 * @packageDocumentation
 */

/** Name of the composed custom event a table dispatches after a user selection. */
export const ELEMENT_SELECTION_EVENT = "chemlab:element-selection";

/** Lowest atomic number the table accepts. */
export const MIN_ATOMIC_NUMBER = 1;

/** Highest atomic number the table accepts. */
export const MAX_ATOMIC_NUMBER = 118;

/**
 * Payload of {@link ELEMENT_SELECTION_EVENT}.
 *
 * `atomicNumber` is `null` for a deliberate clear. `sourceId` repeats the host
 * `id` of the dispatching table and is metadata only: a receiver still has to
 * resolve the source element itself before it trusts the event.
 */
export type ElementSelectionV1 = Readonly<{
	version: 1;
	atomicNumber: number | null;
	sourceId?: string;
}>;

/** Marker for "no selection was ever established", distinct from a deliberate `null`. */
const UNSET = Symbol("unset");

/**
 * Whether a value is an atomic number the table can select.
 *
 * @param value - Candidate of unknown type.
 * @returns `true` for integers from 1 to 118.
 */
export function isAtomicNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value)
		&& value >= MIN_ATOMIC_NUMBER && value <= MAX_ATOMIC_NUMBER;
}

/**
 * Parses the `initial-element` attribute.
 *
 * Markup is a separate boundary from live writes: the attribute is trimmed and
 * only an all-digit value in range is accepted. Everything else, including a
 * missing attribute, means "no initial selection".
 *
 * @param raw - Attribute value as read from the DOM.
 * @returns The atomic number, or `null` when the markup is missing or invalid.
 */
export function parseAtomicNumberAttribute(raw: string | null | undefined): number | null {
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!/^[0-9]+$/.test(trimmed)) return null;
	const value = Number(trimmed);
	return isAtomicNumber(value) ? value : null;
}

/**
 * Builds a frozen selection payload.
 *
 * @param atomicNumber - Selected atomic number or `null` for a clear.
 * @param sourceId - Host `id` of the dispatching table, omitted when empty.
 * @returns The payload to use as `CustomEvent.detail`.
 */
export function elementSelection(atomicNumber: number | null, sourceId?: string): ElementSelectionV1 {
	return Object.freeze({
		version: 1 as const,
		atomicNumber,
		...(sourceId ? { sourceId } : {}),
	});
}

/**
 * Validates an arbitrary event detail against {@link ElementSelectionV1}.
 *
 * @param detail - Value taken from `event.detail`.
 * @returns A frozen copy of the payload, or `null` when it is not a valid V1 selection.
 */
export function readElementSelection(detail: unknown): ElementSelectionV1 | null {
	if (!detail || typeof detail !== "object") return null;
	const candidate = detail as { version?: unknown; atomicNumber?: unknown; sourceId?: unknown };
	if (candidate.version !== 1) return null;
	if (candidate.atomicNumber !== null && !isAtomicNumber(candidate.atomicNumber)) return null;
	if (candidate.sourceId !== undefined && typeof candidate.sourceId !== "string") return null;
	return elementSelection(candidate.atomicNumber as number | null, candidate.sourceId as string | undefined);
}

/**
 * Selection state of one table instance.
 *
 * The model keeps three things apart that the widget contract depends on: an
 * internal unset state, a deliberate `null` and a valid atomic number. It also
 * remembers whether a live write already happened, so an authored default that
 * arrives later does not overwrite a host write made before the element
 * upgraded.
 */
export class SelectionModel {
	#value: number | null | typeof UNSET = UNSET;
	#authored: number | null = null;
	#written = false;

	/** Current selection; `null` when nothing is selected. */
	get value(): number | null {
		return this.#value === UNSET ? null : this.#value;
	}

	/** Whether a selection was ever established, by authored default or by a write. */
	get isSet(): boolean {
		return this.#value !== UNSET;
	}

	/** Authored default currently in effect, used by {@link reset}. */
	get authored(): number | null {
		return this.#authored;
	}

	/**
	 * Applies the authored default during initialization.
	 *
	 * A valid live write that happened before the first render wins, including a
	 * deliberate `null`.
	 *
	 * @param atomicNumber - Authored default or `null`.
	 * @returns `true` when the selection changed.
	 */
	initialize(atomicNumber: number | null): boolean {
		this.#authored = atomicNumber;
		return this.#written ? false : this.#assign(atomicNumber);
	}

	/**
	 * Reapplies a changed authored default, as an editor edit or undo/redo does.
	 *
	 * @param atomicNumber - New authored default or `null`.
	 * @returns `true` when the selection changed.
	 */
	applyAuthored(atomicNumber: number | null): boolean {
		this.#authored = atomicNumber;
		return this.#assign(atomicNumber);
	}

	/**
	 * Silent live write from a host property assignment.
	 *
	 * Invalid values are ignored and leave the previous selection in place.
	 *
	 * @param value - Candidate of unknown type.
	 * @returns `true` when the value was accepted and changed the selection.
	 */
	write(value: unknown): boolean {
		if (value === null) {
			this.#written = true;
			return this.#assign(null);
		}
		if (!isAtomicNumber(value)) return false;
		this.#written = true;
		return this.#assign(value);
	}

	/**
	 * User selection of a different element.
	 *
	 * @param atomicNumber - Atomic number the user picked.
	 * @returns `true` when the selection changed.
	 */
	select(atomicNumber: number): boolean {
		return isAtomicNumber(atomicNumber) ? this.#assign(atomicNumber) : false;
	}

	/**
	 * User clear action.
	 *
	 * @returns `true` when the selection changed.
	 */
	clear(): boolean {
		return this.#assign(null);
	}

	/**
	 * User reset action: back to the authored default.
	 *
	 * @returns `true` when the selection changed.
	 */
	reset(): boolean {
		return this.#assign(this.#authored);
	}

	#assign(next: number | null): boolean {
		const previous = this.value;
		this.#value = next;
		return previous !== next;
	}
}
