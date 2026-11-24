import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { cardNeedsFill, runStep, type ObjectCardNodes } from "../ui/objectCard";

const source = readFileSync("webwriter-chemlab.ts", "utf8");

const echem: ObjectCardNodes = { echem: { node: "echem" }, carousel: { node: "carousel" }, summary: { node: "summary" } };

/**
 * The object card draws its heading in the template and its contents through a
 * fill that runs afterwards. The rule below decides when that fill has to run,
 * so a visible card can never show a name and nothing else: a new selection
 * always refills, a replaced card refills, and a fill that never ran keeps
 * asking until it succeeded.
 */

test("a new selection fills the object card", () => {
	assert.equal(cardNeedsFill(true, echem, undefined), true);
	assert.equal(cardNeedsFill(true, echem, echem), true);
});

test("an unchanged card is not filled again", () => {
	assert.equal(cardNeedsFill(false, echem, echem), false);
});

test("a card the template rebuilt is filled again", () => {
	const rebuilt: ObjectCardNodes = {
		echem: { node: "echem-2" },
		carousel: { node: "carousel-2" },
		summary: { node: "summary-2" },
	};
	assert.equal(cardNeedsFill(false, rebuilt, echem), true);
	// One replaced node is enough: the fill writes into all three.
	assert.equal(cardNeedsFill(false, { ...echem, carousel: { node: "carousel-2" } }, echem), true);
	assert.equal(cardNeedsFill(false, { ...echem, summary: { node: "summary-2" } }, echem), true);
	assert.equal(cardNeedsFill(false, { ...echem, echem: { node: "echem-2" } }, echem), true);
});

test("a fill that never ran is repeated on the next update", () => {
	// The first click can happen before the render produced the card nodes, and
	// the fill then leaves no record behind; the next render retries.
	assert.equal(cardNeedsFill(false, echem, undefined), true);
});

test("a missing card never triggers a fill", () => {
	// A locked learner interface renders no object card at all.
	assert.equal(cardNeedsFill(true, undefined, undefined), false);
	assert.equal(cardNeedsFill(false, undefined, echem), false);
});

test("the lab asks the rule after every render and no longer fills before it", () => {
	const updated = source.slice(source.indexOf("protected updated(changed"));
	assert.match(updated, /cardNeedsFill\(changed\.has\("curr_obj"\) \|\| changed\.has\("curr_name"\)/);
	const selection = source.slice(source.indexOf("_getObject(sprite): void"), source.indexOf("_removeSprite(): void"));
	assert.doesNotMatch(selection, /_updatePopup\(\)/);
	assert.match(selection, /requestUpdate\(\)/);
});

test("the object card records the nodes it filled", () => {
	const popup = source.slice(source.indexOf("private _updatePopup("), source.indexOf("private renderVesselSummary("));
	assert.match(popup, /this\.filledCardNodes = \{ echem, carousel, summary \}/);
	// Without the nodes the fill stops instead of writing into nothing.
	assert.match(popup, /if \(!echem \|\| !carousel \|\| !summary\) return;/);
	assert.match(popup, /this\.filledCardNodes = undefined;\n\t\t\treturn;/);
});

test("a failing aqueous solver keeps the contents card", () => {
	const source_ = source.slice(source.indexOf("private mixtureEquilibrium("), source.indexOf("private renderVesselSummary("));
	assert.match(source_, /try \{[\s\S]*getPolyproticEquilibrium[\s\S]*\} catch \(error\)/);
	assert.match(source_, /return undefined;/);
});

test("a failing step does not stop the steps after it", () => {
	const seen: string[] = [];
	const reported: string[] = [];
	const report = (message: string) => reported.push(message);
	runStep("write the data block", () => {
		seen.push("first");
		throw new Error("boom");
	}, report);
	runStep("redraw the selection", () => seen.push("second"), report);
	assert.deepEqual(seen, ["first", "second"]);
	assert.deepEqual(reported, ["Unable to write the data block"]);
});

test("a step that works reports nothing and runs once", () => {
	let ran = 0;
	let reports = 0;
	runStep("place the amount menu", () => { ran += 1; }, () => { reports += 1; });
	assert.equal(ran, 1);
	assert.equal(reports, 0);
});

test("the report receives the failure itself", () => {
	const failure = new Error("boom");
	const reported: unknown[] = [];
	runStep("rebuild the authored layout", () => { throw failure; }, (_message, error) => reported.push(error));
	assert.deepEqual(reported, [failure]);
});

test("the lab runs the housekeeping steps before the card fill through runStep", () => {
	const updated = source.slice(source.indexOf("protected updated(changed"));
	const fill = updated.indexOf('cardNeedsFill(changed.has("curr_obj")');
	assert.ok(fill > 0, "the update asks the fill rule");
	const before = updated.slice(0, fill);
	for (const step of [
		"write the data block",
		"prepare the builder chemicals",
		"rebuild the authored layout",
		"redraw the selection",
		"place the amount menu",
	]) {
		assert.ok(before.includes(`runStep("${step}"`), `the step "${step}" runs through runStep`);
	}
	// The fill itself stays outside the guard: a throw inside it must surface
	// instead of being reported as a housekeeping failure.
	assert.doesNotMatch(updated.slice(fill), /runStep\(/);
});
