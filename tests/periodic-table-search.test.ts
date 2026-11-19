import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEMENTS, categoryOf } from "../periodic-table/element-reference";
import { normalizeQuery, searchElements } from "../periodic-table/search";

const numbers = (query: string, options?: Parameters<typeof searchElements>[1]) =>
	searchElements(query, options).map((result) => result.atomicNumber);

test("an empty query lists every element in atomic-number order", () => {
	const results = searchElements("");
	assert.equal(results.length, ELEMENTS.length);
	assert.deepEqual(
		results.map((result) => result.atomicNumber),
		ELEMENTS.map((element) => element.atomicNumber),
	);
	assert.ok(results.every((result) => result.kind === "all"));
});

test("an all-digit query matches the atomic number exactly and nothing else", () => {
	assert.deepEqual(numbers("8"), [8]);
	assert.deepEqual(numbers(" 26 "), [26]);
	assert.deepEqual(numbers("118"), [118]);
	assert.deepEqual(numbers("0"), []);
	assert.deepEqual(numbers("119"), []);
	assert.deepEqual(numbers("08"), [8]);
});

test("a symbol match outranks a name or alias match", () => {
	assert.deepEqual(numbers("ca"), [20, 6, 48, 55, 98, 21]);
	assert.deepEqual(numbers("Ca"), [20, 6, 48, 55, 98, 21]);
	assert.equal(searchElements("ca")[0].kind, "symbol");
});

test("a localized name matches in either language", () => {
	assert.deepEqual(numbers("Wasserstoff"), [1]);
	assert.deepEqual(numbers("hydrogen"), [1]);
	assert.deepEqual(numbers("Sauerstoff"), [8]);
	assert.deepEqual(numbers("oxygen"), [8]);
	assert.equal(searchElements("Wasserstoff")[0].kind, "name");
});

test("the interface language decides which canonical name wins inside a tier", () => {
	const german = searchElements("Kohlenstoff", { locale: "de" });
	assert.deepEqual(german.map((result) => result.atomicNumber), [6]);
	const english = searchElements("carbon", { locale: "en" });
	assert.deepEqual(english.map((result) => result.atomicNumber), [6]);
});

test("diacritics and case never decide a match", () => {
	assert.deepEqual(numbers("molybdan"), [42]);
	assert.deepEqual(numbers("Molybdän"), [42]);
	assert.deepEqual(numbers("MOLYBDÄN"), [42]);
	assert.equal(normalizeQuery("  Molybdän "), "molybdan");
});

test("curated aliases are searchable", () => {
	assert.deepEqual(numbers("aluminum"), [13]);
	assert.deepEqual(numbers("sulphur"), [16]);
	assert.deepEqual(numbers("ferrum"), [26]);
	assert.deepEqual(numbers("cuprum"), [29]);
	assert.deepEqual(numbers("columbium"), [41]);
});

test("prefix and substring matches come last", () => {
	const results = searchElements("gen");
	assert.ok(results.length > 0);
	const kinds = new Set(results.map((result) => result.kind));
	assert.ok(kinds.has("prefix") || kinds.has("substring"));
	const ranks = results.map((result) => result.kind);
	assert.ok(ranks.indexOf("prefix") === -1 || ranks.indexOf("substring") === -1 ||
		ranks.indexOf("prefix") < ranks.indexOf("substring"));
});

test("the category filter applies before ranking", () => {
	const all = numbers("ca");
	assert.deepEqual(all, [20, 6, 48, 55, 98, 21]);
	const alkaline = numbers("ca", { category: "alkaline-earth-metal" });
	assert.deepEqual(alkaline, [20]);
	const nonmetal = numbers("ca", { category: "nonmetal" });
	assert.deepEqual(nonmetal, [6]);
	assert.deepEqual(numbers("ca", { category: "noble-gas" }), []);
});

test("an empty query with a category filter lists that family only", () => {
	const results = searchElements("", { category: "noble-gas" });
	assert.ok(results.length > 0);
	for (const result of results) {
		assert.equal(categoryOf(result.atomicNumber), "noble-gas");
	}
	assert.deepEqual(
		results.map((result) => result.atomicNumber),
		ELEMENTS.filter((element) => categoryOf(element.atomicNumber) === "noble-gas")
			.map((element) => element.atomicNumber),
	);
});

test("an unknown query returns nothing", () => {
	assert.deepEqual(numbers("xyzzy"), []);
	assert.deepEqual(numbers("Unobtainium"), []);
});

test("results are stable and free of duplicates", () => {
	const first = numbers("e");
	const second = numbers("e");
	assert.deepEqual(first, second);
	assert.equal(new Set(first).size, first.length);
});
