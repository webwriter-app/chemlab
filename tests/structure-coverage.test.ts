import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chemicalCatalog } from "../data/chemicals";
import {
	buildCoverageReport,
	normalizeFormula,
	renderCoverageJson,
	renderCoverageMarkdown,
} from "../scripts/structure-coverage-model";

const REGENERATE = "node_modules/.bin/esbuild scripts/generate-structure-coverage.ts --bundle --platform=node --format=esm --outfile=.coverage-bundle.mjs && node .coverage-bundle.mjs";

function readTracked(relative: string): string {
	return readFileSync(relative, "utf8");
}

test("the tracked coverage artifacts match the current catalog", () => {
	const report = buildCoverageReport();
	assert.equal(
		readTracked("data/structures/coverage.json"),
		renderCoverageJson(report),
		`data/structures/coverage.json is out of date; run ${REGENERATE}`,
	);
	assert.equal(
		readTracked("docs/structure-library-coverage.md"),
		renderCoverageMarkdown(report),
		`docs/structure-library-coverage.md is out of date; run ${REGENERATE}`,
	);
});

test("the summary counts the catalog without double counting", () => {
	const { summary, entries, salts } = buildCoverageReport();
	assert.equal(summary.catalogEntries, chemicalCatalog.length);
	assert.equal(summary.catalogEntries, entries.length);
	assert.equal(summary.withStructure + summary.withoutStructure, summary.catalogEntries);
	assert.equal(
		summary.reagents + summary.dosedSaltEntries,
		summary.dosed,
		"every dosed entry belongs to exactly one group",
	);
	assert.equal(summary.paired + summary.solidOnly + summary.stockOnly + summary.referenceOnly, summary.saltIdentities);
	assert.equal(summary.saltIdentities, salts.length);
	assert.ok(summary.dosed <= summary.catalogEntries);
	assert.equal(entries.filter((entry) => entry.identity !== null).length, summary.saltEntries);
	assert.equal(entries.filter((entry) => entry.form === "reference").length, summary.catalogEntries - summary.dosed);
	assert.equal(summary.mixtures, entries.filter((entry) => entry.mixture).length);
	assert.ok(summary.mixtures <= summary.catalogEntries - summary.dosed, "a mixture without a recipe cannot be dosed");
});

test("every dosed salt names its phase and its catalog entry", () => {
	const names = new Set(chemicalCatalog.map((entry) => entry.name));
	for (const group of buildCoverageReport().salts) {
		for (const { name } of [...group.solid, ...group.stock, ...group.reference]) {
			assert.ok(names.has(name), `${group.label} lists ${name}, which is not in the catalog`);
		}
		if (group.status === "paired") assert.ok(group.solid.length && group.stock.length);
		if (group.status === "solid-only") assert.equal(group.stock.length, 0);
		if (group.status === "stock-only") assert.equal(group.solid.length, 0);
		if (group.status === "reference-only") assert.equal(group.solid.length + group.stock.length, 0);
		assert.equal(group.gap === null, group.status === "paired", `${group.label} needs a gap sentence unless it is paired`);
	}
});

test("every dosed entry carries a recipe phase", () => {
	for (const entry of buildCoverageReport().entries) {
		if (entry.dosed) assert.ok(entry.phase, `${entry.name} is dosed without a phase`);
		else assert.equal(entry.phase, null);
		if (entry.dosable) assert.ok(entry.structures > 0);
	}
});

test("salt identities drop hydrate water and subscripts", () => {
	assert.equal(normalizeFormula("CuSO₄·5 H₂O"), "CuSO4");
	assert.equal(normalizeFormula("NaHCO₃"), "NaHCO3");
	assert.equal(normalizeFormula("CaSO₄ · 2 H₂O"), "CaSO4");
	assert.equal(normalizeFormula("(NH₄)₂SO₄"), "(NH4)2SO4");
	assert.notEqual(normalizeFormula("NaCl"), normalizeFormula("NaBr"));
});

test("a hydrated solid joins the anhydrous stock of its salt", () => {
	const report = buildCoverageReport();
	const copper = report.salts.find((group) => group.identity === "CuSO4");
	assert.ok(copper, "missing the CuSO₄ group");
	// The pentahydrate is a dosed solid, so the group is a full pair and no
	// hydrate is left as a reference.
	assert.equal(copper.status, "paired");
	assert.equal(copper.hydratedReference, false);
	assert.deepEqual(copper.reference, []);
	assert.ok(copper.solid.some((form) => form.hydrated && form.name.includes("Pentahydrat")));
	assert.ok(copper.stock.length > 0, "the CuSO₄ group should carry the dosed stock");
	// Gypsum and epsomite join their anhydrous stocks the same way, each with a
	// stock of its own where the palette did not carry one.
	for (const [identity, hydrate, stock] of [
		["CaSO4", "Dihydrat", "Calciumsulfatlösung"],
		["MgSO4", "Heptahydrat", "Magnesiumsulfatlösung"],
	] as const) {
		const group = report.salts.find((candidate) => candidate.identity === identity);
		assert.ok(group, `missing the ${identity} group`);
		assert.equal(group.status, "paired");
		assert.equal(group.hydratedReference, false);
		assert.ok(group.solid.some((form) => form.hydrated && form.name.includes(hydrate)));
		assert.ok(group.stock.some((form) => form.name.includes(stock)), `${identity} has no saturated stock`);
	}
	// The two hydrates that were the last reference-only sulfates now carry a
	// solid and a stock as well: their ions have a place in the model.
	for (const [identity, solid, stock] of [
		["Na2S2O3", "Natriumthiosulfat-Pentahydrat", "Natriumthiosulfatlösung"],
		["KNaC4H4O6", "Kaliumnatriumtartrat", "Kaliumnatriumtartratlösung"],
	] as const) {
		const group = report.salts.find((candidate) => candidate.identity === identity);
		assert.ok(group, `missing the ${identity} group`);
		assert.equal(group.status, "paired");
		assert.equal(group.hydratedReference, false);
		assert.ok(group.solid.some((form) => form.hydrated && form.name === solid), `${identity} has no hydrate`);
		assert.ok(group.stock.some((form) => form.name === stock), `${identity} has no stock`);
	}
	// Iron(II) sulfide is the last salt without a recipe: neither a solubility
	// row nor a sulfide family exists yet.
	const ironSulfide = report.salts.find((group) => group.identity === "FeS");
	assert.ok(ironSulfide, "missing the FeS group");
	assert.equal(ironSulfide.status, "reference-only");
	assert.equal(ironSulfide.hydratedReference, false);
	assert.deepEqual(ironSulfide.reference.map((form) => form.name), ["Eisen(II)-sulfid"]);
	assert.equal(new Set(report.salts.map((group) => group.identity)).size, report.salts.length);
});
