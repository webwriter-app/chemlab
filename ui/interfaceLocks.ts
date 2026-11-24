/**
 * Authoring rules for the learner-facing laboratory.
 *
 * The options menu belongs to the teacher, but its values describe what a
 * published widget may show. Keeping the region rule and the drawer tab here
 * makes both testable without a Lit element or a browser.
 */

export type PaletteTab = "components" | "chemicals";

/**
 * The three regions a teacher can take away from learners. The keys are also
 * the option and property names, so a missing region shows up in the entry
 * and in the tests rather than only in the options menu.
 */
export const INTERFACE_LOCK_OPTIONS = {
	hideComponentPalette: {
		type: "boolean" as const, group: "interface", attribute: "hide-component-palette",
		label: { _: "Hide component palette for learners", "de-DE": "Gerätepalette für Lernende ausblenden" },
		description: {
			_: "Hides the components tab of the palette. The chemicals tab stays open, because dosing is the only way into the lab.",
			"de-DE": "Blendet den Reiter „Komponenten“ der Palette aus. Der Reiter „Chemikalien“ bleibt offen, weil sich ohne ihn nichts dosieren lässt.",
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
	hideObjectActions: false,
	hideDiagramSystem: false,
};

/**
 * The drawer tab a viewer may land on. Without the component palette only the
 * chemicals remain, whichever tab was open before the lock applied.
 */
export function paletteTab(tab: PaletteTab, hideComponents: boolean): PaletteTab {
	return hideComponents ? "chemicals" : tab;
}

/**
 * Whether a region is hidden for this viewer. Authoring always keeps every
 * region, because the teacher has to be able to fill and inspect the widget.
 */
export function hidesRegion(region: InterfaceLockKey, locks: InterfaceLocks, authoring: boolean): boolean {
	return !authoring && locks[region];
}
