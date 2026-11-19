/**
 * Adapter from the legacy element keys of the lab widget to atomic numbers.
 *
 * `chemlib/ElementData.ts` keys its records by lowercase English names and
 * carries two entries that are not elements at all: `proton` and the
 * `ununennium` placeholder for element 119. Saved lab documents keep those
 * keys, so this module resolves them without changing the stored data. It is
 * deliberately outside the import graph of the periodic table entry: the table
 * never needs the legacy names, and the lab widget never needs the table.
 *
 * @module periodic-table/legacy-names
 */

import { ELEMENTS } from "./element-reference";

/**
 * Legacy keys that do not describe an element of the bundle.
 *
 * `proton` is the bare nucleus the lab widget offers as a particle, and
 * `ununennium` is the systematic placeholder for element 119, which has not
 * been synthesised.
 */
export const LEGACY_PSEUDO_ELEMENTS: readonly string[] = ["proton", "ununennium"];

/**
 * Normalises a name for lookup.
 *
 * Lowercases, strips diacritics and drops everything that is not a letter or a
 * digit, so `"Hydrargyrum"`, `"hydrargyrum"` and `"hydrargyrum "` share a key.
 *
 * @param name Name to normalise.
 * @returns The lookup key.
 */
export function normalizeElementName(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
}

const INDEX: ReadonlyMap<string, number> = (() => {
	const index = new Map<string, number>();
	const add = (name: string, atomicNumber: number) => {
		const key = normalizeElementName(name);
		if (key && !index.has(key)) index.set(key, atomicNumber);
	};
	for (const element of ELEMENTS) {
		add(element.names.en, element.atomicNumber);
		add(element.names.de, element.atomicNumber);
		add(element.symbol, element.atomicNumber);
		for (const alias of element.aliases?.en ?? []) add(alias, element.atomicNumber);
		for (const alias of element.aliases?.de ?? []) add(alias, element.atomicNumber);
	}
	return index;
})();

/**
 * Resolves a legacy element key, name or symbol to an atomic number.
 *
 * @param key Legacy key such as `"eisen"`, a name such as `"Iron"` or a symbol such as `"Fe"`.
 * @returns The atomic number, or `null` for unknown and pseudo-elements.
 */
export function legacyElementKeyToAtomicNumber(key: string): number | null {
	if (typeof key !== "string") return null;
	const normalized = normalizeElementName(key);
	if (!normalized) return null;
	if (LEGACY_PSEUDO_ELEMENTS.includes(normalized)) return null;
	return INDEX.get(normalized) ?? null;
}
