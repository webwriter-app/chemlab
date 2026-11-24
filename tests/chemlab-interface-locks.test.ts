import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
	INTERFACE_LOCK_OPTIONS,
	PALETTE_TABS,
	UNLOCKED_INTERFACE,
	hidesRegion,
	paletteTab,
	paletteTabs,
	type InterfaceLockKey,
	type InterfaceLocks,
} from "../ui/interfaceLocks";

const source = readFileSync("webwriter-chemlab.ts", "utf8");
const regions = Object.keys(INTERFACE_LOCK_OPTIONS) as InterfaceLockKey[];

const allLocked: InterfaceLocks = Object.fromEntries(regions.map(region => [region, true])) as InterfaceLocks;

/**
 * The laboratory has one more role than the molecule builder: the teacher
 * fills the palette and inspects the setup, the learner only works in it. The
 * locks therefore have to leave authoring untouched while a published widget
 * follows every switch, and the reset has to know a starting point that the
 * learner's own placements cannot move.
 */

test("interface locks hide each region only outside authoring", () => {
	for (const region of regions) {
		assert.equal(hidesRegion(region, UNLOCKED_INTERFACE, false), false, region);
		assert.equal(hidesRegion(region, allLocked, false), true, region);
		assert.equal(hidesRegion(region, allLocked, true), false, region);
	}
});

test("the palette locks remove one tab each and the whole palette together", () => {
	assert.deepEqual(PALETTE_TABS, ["components", "chemicals"]);
	assert.deepEqual(paletteTabs(false, false), ["components", "chemicals"]);
	assert.deepEqual(paletteTabs(true, false), ["chemicals"]);
	assert.deepEqual(paletteTabs(false, true), ["components"]);
	assert.deepEqual(paletteTabs(true, true), []);
	// The tab that was open stays as long as it exists, otherwise the palette
	// falls back to the tab still there. Two locks leave no tab to land on.
	assert.equal(paletteTab("components", false), "components");
	assert.equal(paletteTab("chemicals", false), "chemicals");
	assert.equal(paletteTab("components", true), "chemicals");
	assert.equal(paletteTab("chemicals", false, true), "components");
	assert.equal(paletteTab("components", true, true), undefined);
	assert.equal(paletteTab("chemicals", true, true), undefined);
});

test("every interface switch carries its own boolean option and attribute", () => {
	assert.deepEqual(regions, ["hideComponentPalette", "hideChemicalPalette", "hideObjectActions", "hideDiagramSystem"]);
	const attributes: Record<InterfaceLockKey, string> = {
		hideComponentPalette: "hide-component-palette",
		hideChemicalPalette: "hide-chemical-palette",
		hideObjectActions: "hide-object-actions",
		hideDiagramSystem: "hide-diagram-system",
	};
	for (const region of regions) {
		const option = INTERFACE_LOCK_OPTIONS[region];
		assert.equal(option.type, "boolean", region);
		assert.equal(option.group, "interface", region);
		assert.equal(option.attribute, attributes[region], region);
		assert.ok(option.label._, region);
		assert.ok(option.label["de-DE"], region);
		assert.ok(option.description._, region);
		assert.ok(option.description["de-DE"], region);
	}
});

test("the laboratory publishes the options and guards every learner region", () => {
	assert.match(source, /\.\.\.INTERFACE_LOCK_OPTIONS/);
	assert.match(source, /interface: \{ label: \{ _: "Learner interface", "de-DE": "Oberfläche für Lernende" \}/);
	assert.match(source, /get canAuthor\(\): boolean/);
	for (const region of regions) {
		const attribute = INTERFACE_LOCK_OPTIONS[region].attribute;
		assert.match(source, new RegExp(`attribute: "${attribute}"`), region);
		assert.match(source, new RegExp(`accessor ${region} = false;`), region);
		assert.match(source, new RegExp(`this\\.#hides\\(\"${region}\"\\)`), region);
	}
});

test("the palette locks keep one tab reachable until both are locked", () => {
	// Each lock takes its own tab; the shared rule names the remaining tab and
	// the drawer renames itself to it, so a learner still sees where dosing is.
	assert.match(source, /get #paletteTabs\(\): PaletteTab\[\] \{\s*\n\s*return paletteTabs\(this\.#hides\("hideComponentPalette"\), this\.#hides\("hideChemicalPalette"\)\);/);
	assert.match(source, /get #paletteTab\(\): PaletteTab \| undefined \{\s*\n\s*return paletteTab\(this\.teacherTab, this\.#hides\("hideComponentPalette"\), this\.#hides\("hideChemicalPalette"\)\);/);
	assert.match(source, /get #paletteOpen\(\): boolean \{\s*\n\s*return this\.teacherDrawerOpen && this\.#paletteTab !== undefined;/);
	assert.match(source, /const tabs = this\.#paletteTabs;\s*\n\s*const tab = this\.#paletteTab;\s*\n\s*if \(tab === undefined\) return nothing;/);
	// A tab renders only while it exists, and its panel goes with it.
	assert.match(source, /\$\{showComponents \? html`\s*\n\s*<sl-tab slot="nav" panel="components"/);
	assert.match(source, /\$\{showChemicals \? html`\s*\n\s*<sl-tab slot="nav" panel="chemicals"/);
	assert.match(source, /\$\{showComponents \? html`\s*\n\s*<sl-tab-panel name="components"/);
	assert.match(source, /\$\{showChemicals \? html`\s*\n\s*<sl-tab-panel name="chemicals"/);
	// The grid column, the hydration and the markup share that one predicate:
	// an opened drawer without a tab would reserve space for an empty palette.
	assert.match(source, /const paletteOpen = this\.#paletteOpen;/);
	assert.match(source, /\$\{paletteOpen \? "show-palette" : ""\}/);
	assert.match(source, /if \(this\.#paletteOpen && this\.#paletteTab === "chemicals"\) \{/);
	assert.match(source, /if \(this\.#paletteTab === "chemicals"\) this\.startBuilderHydration\(\);/);
	// A structure sent from the builder cannot open a palette that is gone; it
	// is still stored, it just stays out of sight for the learner.
	assert.match(source, /if \(this\.#hides\("hideChemicalPalette"\)\) return;\s*\n\s*this\.chemicalGroup = CUSTOM_CHEMICAL_GROUP;/);
});

test("the object lock takes the card and vessel pouring, not the keyboard", () => {
	assert.match(source, /private renderObjectSummary\(\) \{\s*\n\s*if \(this\.#hides\("hideObjectActions"\)\) return nothing;/);
	assert.match(source, /private renderGroupSummary\(\) \{\s*\n\s*if \(this\.#hides\("hideObjectActions"\)\) return nothing;/);
	assert.match(source, /trackVesselTransfer\([^)]*\): void \{\s*\n(?:\s*\/\/[^\n]*\n)+\s*if \(this\.#hides\("hideObjectActions"\)\) return;/);
	assert.match(source, /if \(transfer && this\.#hides\("hideObjectActions"\)\) return;/);
	// Removing a placed device is a canvas gesture, not an object-card action.
	assert.match(source, /deleteSelection/);
});

test("the diagram lock takes the drawer and its handle but keeps recording", () => {
	assert.match(source, /return !this\.#hides\("hideDiagramSystem"\) && this\.diagrams\.hasDiagrams;/);
	assert.match(source, /private renderDiagramDetails\(available: boolean, open: boolean\) \{\s*\n\s*if \(this\.#hides\("hideDiagramSystem"\)\) return nothing;/);
});

test("the reset restores the embedded layout and belongs to learners", () => {
	assert.match(source, /private startingLayout\?: object\[\];/);
	assert.match(source, /private rememberStartingLayout\(\): void \{\s*\n\s*this\.startingLayout = JSON\.parse\(JSON\.stringify\(this\.availableComponents\)\)/);
	// The snapshot is taken where the start-up load and a replaced layout meet
	// the stage, never from the live field a learner keeps changing.
	assert.match(source, /this\.rememberStartingLayout\(\);\s*\n\s*this\._loadComponents\(undefined, models\);/);
	assert.match(source, /this\.rememberStartingLayout\(\);\s*\n\s*this\.rebuildAuthoredLayout\(\);/);
	assert.match(source, /resetCanvas\(\): void \{\s*\n\s*if \(this\.canAuthor \|\| !this\.app \|\| this\.canvasLoading \|\| !this\.startingLayout\) return;/);
	assert.match(source, /this\.diagrams\.clear\(\);\s*\n\s*this\.measurements\.clear\(\);\s*\n\s*this\.suggestionQueue\.clear\(\);/);
	assert.match(source, /this\.availableComponents = JSON\.parse\(JSON\.stringify\(this\.startingLayout\)\)/);
	// The button rides with the canvas controls and only exists outside authoring.
	assert.match(source, /\$\{this\.canAuthor \? nothing : html`\s*\n\s*<sl-button id="resetCanvas"/);
});

test("the rebuild is shared by the replaced layout and the reset", () => {
	const rebuild = source.match(/private rebuildAuthoredLayout\(\): void \{[\s\S]*?\n\t\}/);
	assert.ok(rebuild);
	for (const step of [
		"this.simulation.stopExperiments()",
		"this.circuits.clear()",
		"this.capacitorCharges.clear()",
		"this.rcReadouts.clear()",
		"this.measurements.retire(",
		"this.canvas.clearSprites()",
		"this.pruneDiagramSuggestions()",
		"this.canvas.fitObjects()",
	]) {
		assert.ok(rebuild[0].includes(step), step);
	}
});
