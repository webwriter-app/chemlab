/**
 * Authoring rules for the learner-facing molecule builder.
 *
 * The options menu belongs to the teacher, but its values describe what a
 * published widget may show. Keeping the normalization and the region rule
 * here makes both testable without a Lit element or a browser.
 */

export type BuilderView = "3d" | "2d";
export type ViewLock = "free" | BuilderView;

export const VIEW_LOCK_OPTIONS = [
	{ value: "free", label: { _: "Free", "de-DE": "Frei" } },
	{ value: "3d", label: { _: "3D only", "de-DE": "Nur 3D" } },
	{ value: "2d", label: { _: "2D structure only", "de-DE": "Nur Strukturansicht" } },
];

export const builderViewLockOption = {
	type: "select" as const,
	attribute: "locked-view",
	label: { _: "View for learners", "de-DE": "Ansicht für Lernende" },
	description: {
		_: "Locks the published widget to one canvas view. The authoring view keeps its 3D/2D switch.",
		"de-DE": "Legt die Ansicht des veröffentlichten Widgets fest. In der Bearbeitung bleibt der 3D/2D-Umschalter verfügbar.",
	},
	options: VIEW_LOCK_OPTIONS,
};

/**
 * The six regions a teacher can take away from learners. The keys are also
 * the option and property names, so a missing region shows up in the entry
 * and in the tests rather than only in the options menu.
 */
export const INTERFACE_LOCK_OPTIONS = {
	hideElementPalette: {
		type: "boolean" as const, attribute: "hide-element-palette",
		label: { _: "Hide element palette for learners", "de-DE": "Elementpalette für Lernende ausblenden" },
		description: {
			_: "Hides the element list at the left edge.",
			"de-DE": "Blendet die Elementliste am linken Rand aus.",
		},
	},
	hideEditingTools: {
		type: "boolean" as const, attribute: "hide-editing-tools",
		label: { _: "Hide editing tools for learners", "de-DE": "Bearbeitungswerkzeuge für Lernende ausblenden" },
		description: {
			_: "Hides the new-structure and editing toolbar below the title.",
			"de-DE": "Blendet die Werkzeugleiste für neue Strukturen und die Bearbeitung unter dem Titel aus.",
		},
	},
	hideCanvasControls: {
		type: "boolean" as const, attribute: "hide-canvas-controls",
		label: { _: "Hide canvas controls for learners", "de-DE": "Zeichenflächen-Steuerung für Lernende ausblenden" },
		description: {
			_: "Hides the 3D/2D, zoom, fit and fullscreen buttons at the canvas edge.",
			"de-DE": "Blendet 3D/2D-, Zoom-, Einpassen- und Vollbildknöpfe am Rand der Zeichenfläche aus.",
		},
	},
	hideModelCard: {
		type: "boolean" as const, attribute: "hide-model-card",
		label: { _: "Hide model card for learners", "de-DE": "Modellkarte für Lernende ausblenden" },
		description: {
			_: "Hides the formula and display card at the top left.",
			"de-DE": "Blendet die Karte mit Formel und Darstellung oben links aus.",
		},
	},
	hideSelectionCard: {
		type: "boolean" as const, attribute: "hide-selection-card",
		label: { _: "Hide selection card for learners", "de-DE": "Auswahlkarte für Lernende ausblenden" },
		description: {
			_: "Hides the selected atom's info card at the bottom left.",
			"de-DE": "Blendet die Info-Karte des gewählten Atoms unten links aus.",
		},
	},
	hideDocumentActions: {
		type: "boolean" as const, attribute: "hide-document-actions",
		label: { _: "Hide catalog, file and send for learners", "de-DE": "Katalog, Datei und Senden für Lernende ausblenden" },
		description: {
			_: "Hides catalog, file and send. Preview actions stay available.",
			"de-DE": "Blendet Katalog, Datei und Senden aus. Die Vorschau-Aktionen bleiben verfügbar.",
		},
	},
};

export type InterfaceLockKey = keyof typeof INTERFACE_LOCK_OPTIONS;
export type InterfaceLocks = Record<InterfaceLockKey, boolean>;

export const UNLOCKED_INTERFACE: InterfaceLocks = {
	hideElementPalette: false,
	hideEditingTools: false,
	hideCanvasControls: false,
	hideModelCard: false,
	hideSelectionCard: false,
	hideDocumentActions: false,
};

/** Reads an authored value; anything but a known lock means free. */
export function readViewLock(value: unknown): ViewLock {
	return value === "3d" || value === "2d" ? value : "free";
}

/**
 * The view a canvas may actually show.
 *
 * A lock only binds outside authoring. A 3D lock needs WebGL, so a failed
 * renderer falls back to the structure drawing instead of an empty canvas.
 */
export function effectiveView(
	view: BuilderView,
	lock: unknown,
	authoring: boolean,
	gpuAvailable: boolean,
): BuilderView {
	const requested: BuilderView = view === "2d" ? "2d" : "3d";
	if (authoring) return requested;
	const locked = readViewLock(lock);
	if (locked === "free") return requested;
	return locked === "3d" && gpuAvailable ? "3d" : "2d";
}

/**
 * Whether a region is hidden for this viewer. Authoring always keeps every
 * region, because the teacher has to be able to fill and inspect the widget.
 */
export function hidesRegion(region: InterfaceLockKey, locks: InterfaceLocks, authoring: boolean): boolean {
	return !authoring && locks[region];
}
