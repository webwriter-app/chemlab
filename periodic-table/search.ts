/**
 * Localized element search.
 *
 * The index is built once per module from the reference bundle: every element
 * contributes its symbol, both canonical names and its curated aliases. A query
 * is normalized the same way the tokens are, so case, diacritics and stray
 * whitespace never decide a match. Ranking is a fixed tier order followed by the
 * interface language and the atomic number, which keeps the result list stable
 * and explainable.
 *
 * @module periodic-table/search
 */

import { ELEMENTS, categoryOf, type ElementReference } from "./element-reference";

/** Interface languages the table ships. */
export type SearchLanguage = "en" | "de";

/**
 * Why an element matched.
 *
 * `all` is the unfiltered result of an empty query, `number` an exact atomic
 * number, `symbol`, `name` and `alias` are exact matches, `prefix` and
 * `substring` are the looser tiers.
 */
export type SearchMatchKind =
	| "all"
	| "number"
	| "symbol"
	| "name"
	| "alias"
	| "prefix"
	| "substring";

/** One search hit. */
export interface SearchResult {
	/** Atomic number of the matching element. */
	readonly atomicNumber: number;
	/** Why the element matched. */
	readonly kind: SearchMatchKind;
}

/** Options of {@link searchElements}. */
export interface SearchOptions {
	/** Interface language; decides which canonical name wins inside a tier. */
	readonly locale?: SearchLanguage;
	/** Category key to filter by, or `null` for all categories. */
	readonly category?: string | null;
}

/** Rank of a match kind; lower wins. */
const KIND_RANK: Readonly<Record<SearchMatchKind, number>> = {
	all: 0,
	number: 1,
	symbol: 2,
	name: 3,
	alias: 4,
	prefix: 5,
	substring: 6,
};

/** One searchable spelling of an element. */
interface SearchToken {
	readonly text: string;
	readonly kind: "symbol" | "name" | "alias";
	readonly language: SearchLanguage | null;
}

/**
 * Normalizes a query or a token for comparison.
 *
 * Folds case, strips combining diacritics and collapses whitespace, so
 * `"  Molybdän "` and `"molybdan"` compare equal.
 *
 * @param text - Raw text.
 * @returns The normalized form.
 */
export function normalizeQuery(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Collects the searchable spellings of one element.
 *
 * @param element - Element of the reference bundle.
 * @returns Symbol, both canonical names and the curated aliases.
 */
function tokensOf(element: ElementReference): readonly SearchToken[] {
	const tokens: SearchToken[] = [
		{ text: normalizeQuery(element.symbol), kind: "symbol", language: null },
	];
	for (const language of ["en", "de"] as const) {
		tokens.push({ text: normalizeQuery(element.names[language]), kind: "name", language });
		for (const alias of element.aliases?.[language] ?? []) {
			tokens.push({ text: normalizeQuery(alias), kind: "alias", language });
		}
	}
	return tokens;
}

const TOKENS: ReadonlyMap<number, readonly SearchToken[]> = new Map(
	ELEMENTS.map((element) => [element.atomicNumber, tokensOf(element)]),
);

/** A match together with the tie-breakers of its tier. */
interface RankedMatch {
	readonly kind: SearchMatchKind;
	readonly languageRank: number;
}

/**
 * Finds the best match of one element for a normalized query.
 *
 * @param tokens - Searchable spellings of the element.
 * @param query - Normalized query, never empty.
 * @param locale - Interface language.
 * @returns The best match, or `null` when nothing matches.
 */
function bestMatch(
	tokens: readonly SearchToken[],
	query: string,
	locale: SearchLanguage,
): RankedMatch | null {
	let best: RankedMatch | null = null;
	for (const token of tokens) {
		let kind: SearchMatchKind | null = null;
		if (token.text === query) kind = token.kind;
		else if (token.text.startsWith(query)) kind = "prefix";
		else if (token.text.includes(query)) kind = "substring";
		if (!kind) continue;
		const languageRank = token.language === null || token.language === locale ? 0 : 1;
		if (
			!best ||
			KIND_RANK[kind] < KIND_RANK[best.kind] ||
			(KIND_RANK[kind] === KIND_RANK[best.kind] && languageRank < best.languageRank)
		) {
			best = { kind, languageRank };
		}
	}
	return best;
}

/**
 * Searches the reference bundle.
 *
 * An all-digit query matches the atomic number exactly and nothing else. An
 * empty query returns the category's elements in atomic-number order. The
 * category filter is applied before ranking.
 *
 * @param query - Raw query text.
 * @param options - Interface language and category filter.
 * @returns Matching elements, best match first.
 */
export function searchElements(
	query: string,
	options: SearchOptions = {},
): readonly SearchResult[] {
	const locale = options.locale ?? "en";
	const category = options.category ?? null;
	const candidates = ELEMENTS.filter(
		(element) => category === null || categoryOf(element.atomicNumber) === category,
	);
	const normalized = normalizeQuery(query);
	if (!normalized) {
		return candidates.map((element) => ({ atomicNumber: element.atomicNumber, kind: "all" }));
	}
	if (/^[0-9]+$/.test(normalized)) {
		const atomicNumber = Number(normalized);
		return candidates.some((element) => element.atomicNumber === atomicNumber)
			? [{ atomicNumber, kind: "number" }]
			: [];
	}
	const ranked: { result: SearchResult; languageRank: number }[] = [];
	for (const element of candidates) {
		const match = bestMatch(TOKENS.get(element.atomicNumber) ?? [], normalized, locale);
		if (!match) continue;
		ranked.push({
			result: { atomicNumber: element.atomicNumber, kind: match.kind },
			languageRank: match.languageRank,
		});
	}
	ranked.sort(
		(a, b) =>
			KIND_RANK[a.result.kind] - KIND_RANK[b.result.kind] ||
			a.languageRank - b.languageRank ||
			a.result.atomicNumber - b.result.atomicNumber,
	);
	return ranked.map((entry) => entry.result);
}
