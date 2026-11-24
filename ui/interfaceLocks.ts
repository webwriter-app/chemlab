/**
 * Authoring rules for the learner-facing laboratory.
 *
 * The options menu belongs to the teacher, but its values describe what a
 * published widget may show. Keeping the region rule and the drawer tab here
 * makes both testable without a Lit element or a browser.
 */

export type PaletteTab = "components" | "chemicals";

/** The palette tabs in the order they appear, and in the order they are lost. */
export const PALETTE_TABS: readonly PaletteTab[] = ["components", "chemicals"];

/**
 * The four regions a teacher can take away from learners. The keys are also
 * the option and property names, so a missing region shows up in the entry
 * and in the tests rather than only in the options menu.
 */
export const INTERFACE_LOCK_OPTIONS = {
	hideComponentPalette: {
		type: "boolean" as const, group: "interface", attribute: "hide-component-palette",
		label: { _: "Hide component palette for learners", "de-DE": "Gerätepalette für Lernende ausblenden" },
		description: {
			_: "Hides the components tab of the palette. The chemicals tab stays open, unless it is hidden as well.",
			"de-DE": "Blendet den Reiter „Komponenten“ der Palette aus. Der Reiter „Chemikalien“ bleibt offen, solange er nicht ebenfalls ausgeblendet ist.",
		},
	},
	hideChemicalPalette: {
		type: "boolean" as const, group: "interface", attribute: "hide-chemical-palette",
		label: { _: "Hide chemical palette for learners", "de-DE": "Chemikalienpalette für Lernende ausblenden" },
		description: {
			_: "Hides the chemicals tab of the palette. Hiding both palette tabs removes the palette and its handle, and nothing can be dosed any more.",
			"de-DE": "Blendet den Reiter „Chemikalien“ der Palette aus. Sind beide Reiter ausgeblendet, entfallen Palette und Griff, und es lässt sich nichts mehr dosieren.",
		},
	},
	hideObjectActions: {
		type: "boolean" as const, group: "interface", attribute: "hide-object-actions",
		label: { _: "Hide object actions for learners", "de-DE": "Objektaktionen für Lernende ausblenden" },
		description: {
			_: "Hides the object card with contents, pouring, emptying, saving and the device settings. Pouring from vessel to vessel is refused as well.",
			"de-DE": "Blendet die Objektkarte mit Inhalt, Umfüllen, Leeren, Speichern und den Geräteeinstellungen aus. Auch das Umfüllen von Gefäß zu Gefäß entfällt.",
		},
	},
	hideDiagramSystem: {
		type: "boolean" as const, group: "interface", attribute: "hide-diagram-system",
		label: { _: "Hide diagram system for learners", "de-DE": "Diagrammsystem für Lernende ausblenden" },
		description: {
			_: "Hides the diagram drawer and its handle. Measurements keep being recorded in the background.",
			"de-DE": "Blendet die Diagrammablage samt Griff aus. Die Messwerte werden im Hintergrund weiter aufgezeichnet.",
		},
	},
};

export type InterfaceLockKey = keyof typeof INTERFACE_LOCK_OPTIONS;
export type InterfaceLocks = Record<InterfaceLockKey, boolean>;

export const UNLOCKED_INTERFACE: InterfaceLocks = {
	hideComponentPalette: false,
	hideChemicalPalette: false,
	hideObjectActions: false,
	hideDiagramSystem: false,
};

/**
 * The palette tabs a viewer keeps. Each lock takes its own tab, and two locked
 * tabs leave nothing: the drawer and its handle disappear with them, which is
 * the only state in which the lab cannot be dosed at all.
 */
export function paletteTabs(hideComponents: boolean, hideChemicals: boolean): PaletteTab[] {
	return PALETTE_TABS.filter(tab => !(tab === "components" ? hideComponents : hideChemicals));
}

/**
 * The drawer tab a viewer may land on, or `undefined` when the palette is gone.
 * A tab that was open before the lock applied falls back to the first tab that
 * is still there.
 */
export function paletteTab(tab: PaletteTab, hideComponents: boolean, hideChemicals = false): PaletteTab | undefined {
	const tabs = paletteTabs(hideComponents, hideChemicals);
	return tabs.includes(tab) ? tab : tabs[0];
}

/**
 * Whether a region is hidden for this viewer. Authoring always keeps every
 * region, because the teacher has to be able to fill and inspect the widget.
 */
export function hidesRegion(region: InterfaceLockKey, locks: InterfaceLocks, authoring: boolean): boolean {
	return !authoring && locks[region];
}
