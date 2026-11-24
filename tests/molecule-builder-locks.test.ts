import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
	INTERFACE_LOCK_OPTIONS,
	UNLOCKED_INTERFACE,
	builderViewLockOption,
	effectiveView,
	hidesRegion,
	readViewLock,
	type InterfaceLockKey,
	type InterfaceLocks,
} from "../molecule-builder/interface-locks";

const source = readFileSync("webwriter-chemlab-molecule-builder.ts", "utf8");
const regions = Object.keys(INTERFACE_LOCK_OPTIONS) as InterfaceLockKey[];

const allLocked: InterfaceLocks = Object.fromEntries(regions.map(region => [region, true])) as InterfaceLocks;

/**
 * The options menu is the teacher's control panel, but its values only bind
 * the published widget. These checks keep the two states apart: the editor
 * always keeps every region and both views, while a learner follows the
 * authored lock even when WebGL is missing.
 */

test("unknown view locks fall back to free", () => {
	assert.equal(readViewLock("free"), "free");
	assert.equal(readViewLock("3d"), "3d");
	assert.equal(readViewLock("2d"), "2d");
	for (const value of [undefined, null, "", "2D", "3D", "structure", 3]) {
		assert.equal(readViewLock(value), "free", String(value));
	}
});

test("a view lock binds learners and falls back from missing WebGL", () => {
	assert.equal(effectiveView("3d", "free", false, true), "3d");
	assert.equal(effectiveView("2d", "free", false, true), "2d");
	assert.equal(effectiveView("2d", "3d", false, true), "3d");
	assert.equal(effectiveView("3d", "2d", false, true), "2d");
	assert.equal(effectiveView("2d", "3d", false, false), "2d");
	assert.equal(effectiveView("3d", "3d", false, false), "2d");
	// The authoring view keeps its own switch and never inherits a learner lock.
	assert.equal(effectiveView("2d", "3d", true, true), "2d");
	assert.equal(effectiveView("3d", "2d", true, false), "3d");
});

test("interface locks hide each region only outside authoring", () => {
	for (const region of regions) {
		assert.equal(hidesRegion(region, UNLOCKED_INTERFACE, false), false, region);
		assert.equal(hidesRegion(region, allLocked, false), true, region);
		assert.equal(hidesRegion(region, allLocked, true), false, region);
	}
});

test("every interface switch carries its own boolean option and attribute", () => {
	assert.deepEqual(regions, [
		"hideElementPalette", "hideEditingTools", "hideCanvasControls",
		"hideModelCard", "hideSelectionCard", "hideDocumentActions",
	]);
	const attributes: Record<InterfaceLockKey, string> = {
		hideElementPalette: "hide-element-palette",
		hideEditingTools: "hide-editing-tools",
		hideCanvasControls: "hide-canvas-controls",
		hideModelCard: "hide-model-card",
		hideSelectionCard: "hide-selection-card",
		hideDocumentActions: "hide-document-actions",
	};
	for (const region of regions) {
		const option = INTERFACE_LOCK_OPTIONS[region];
		assert.equal(option.type, "boolean", region);
		assert.equal(option.attribute, attributes[region], region);
		assert.ok(option.label._, region);
		assert.ok(option.label["de-DE"], region);
		assert.ok(option.description._, region);
		assert.ok(option.description["de-DE"], region);
	}
});

test("the view lock offers free, 3D and structure choices in both languages", () => {
	assert.equal(builderViewLockOption.type, "select");
	assert.equal(builderViewLockOption.attribute, "locked-view");
	assert.deepEqual(builderViewLockOption.options.map(option => option.value), ["free", "3d", "2d"]);
	for (const option of builderViewLockOption.options) {
		assert.ok(option.label._, option.value);
		assert.ok(option.label["de-DE"], option.value);
	}
	assert.ok(builderViewLockOption.label._);
	assert.ok(builderViewLockOption.label["de-DE"]);
	assert.ok(builderViewLockOption.description._);
	assert.ok(builderViewLockOption.description["de-DE"]);
});

test("the builder publishes the options and guards every learner region", () => {
	assert.match(source, /lockedView: builderViewLockOption/);
	assert.match(source, /\.\.\.INTERFACE_LOCK_OPTIONS/);
	assert.match(source, /get canAuthor\(\): boolean/);
	assert.match(source, /get view\(\): BuilderView/);
	assert.match(source, /if \(!this\.canAuthor \|\| !this\.isConnected\) return;/);
	assert.match(source, /attributeFilter: \["class", "contenteditable"\]/);
	assert.match(source, /if \(documentHidden \|\| !event\.dataTransfer\?\.files\.length\) return;/);
	for (const region of regions) {
		assert.match(source, new RegExp(`accessor ${region} = false`), region);
		assert.match(source, new RegExp(`this\\.#hides\\("${region}"\\)`), region);
	}
});
