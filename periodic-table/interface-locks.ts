/**
 * Authoring rules for the learner-facing periodic table.
 *
 * The options menu belongs to the teacher, but its values describe what a
 * published widget may show. Keeping the options and the region rule here makes
 * both testable without a Lit element or a browser, and gives the widget, the
 * menu and the tests one source for names and attributes.
 *
 * @module periodic-table/interface-locks
 */

/**
 * The four regions a teacher can take away from learners. The keys are also the
 * option and property names, so a missing region shows up in the entry and in
 * the tests rather than only in the options menu.
 *
 * A locked panel keeps its authored value: the filter and the mode the teacher
 * set still narrow the table, the learner just cannot change them. The layout
 * switch is the exception in reverse — a locked switch means the authored
 * layout is the only one, because there is no non-visual way to choose one.
 */
export const INTERFACE_LOCK_OPTIONS = {
	hideFilters: {
		type: "boolean" as const, group: "interface", attribute: "hide-filters",
		label: { _: "Hide search and family filter for learners", "de-DE": "Suche und Stoffklassenfilter für Lernende ausblenden" },
		description: {
			_: "Hides the filter panel with its search field and family carousel. The filters you set stay active in the table.",
			"de-DE": "Blendet das Filter-Panel mit Suchfeld und Stoffklassen-Karussell aus. Die eingestellten Filter bleiben in der Tabelle wirksam.",
		},
	},
	hideModes: {
		type: "boolean" as const, group: "interface", attribute: "hide-modes",
		label: { _: "Hide property modes for learners", "de-DE": "Eigenschaftsmodi für Lernende ausblenden" },
		description: {
			_: "Hides the mode panel with its carousel and slider. A mode you set keeps colouring and narrowing the table.",
			"de-DE": "Blendet das Modus-Panel mit Karussell und Regler aus. Ein eingestellter Modus färbt und beschränkt die Tabelle weiterhin.",
		},
	},
	hideLayoutSwitch: {
		type: "boolean" as const, group: "interface", attribute: "hide-layout-switch",
		label: { _: "Hide table/list switch for learners", "de-DE": "Tabellen-/Listen-Umschalter für Lernende ausblenden" },
		description: {
			_: "Hides the layout switch. Learners see the layout you chose under Darstellung.",
			"de-DE": "Blendet den Umschalter zwischen Tabelle und Liste aus. Lernende sehen die unter „Darstellung“ gewählte Ansicht.",
		},
	},
	hideInfo: {
		type: "boolean" as const, group: "interface", attribute: "hide-info",
		label: { _: "Hide source info for learners", "de-DE": "Quellenangaben für Lernende ausblenden" },
		description: {
			_: "Hides the info button in the corner and its dialog with the sources and model notes.",
			"de-DE": "Blendet den Info-Knopf in der Ecke und den Dialog mit Quellen und Modellhinweisen aus.",
		},
	},
};

/** One region a teacher can lock. */
export type InterfaceLockKey = keyof typeof INTERFACE_LOCK_OPTIONS;

/** Lock state of every region. */
export type InterfaceLocks = Record<InterfaceLockKey, boolean>;

/** Nothing locked: the state of a freshly inserted widget. */
export const UNLOCKED_INTERFACE: InterfaceLocks = {
	hideFilters: false,
	hideModes: false,
	hideLayoutSwitch: false,
	hideInfo: false,
};

/**
 * Whether a region is hidden for this viewer. Authoring always keeps every
 * region, because the teacher has to be able to see and fill the widget.
 *
 * @param region - Region the widget asks about.
 * @param locks - Authored lock state.
 * @param authoring - Whether the viewer is the author.
 * @returns `true` when the region is taken away.
 */
export function hidesRegion(region: InterfaceLockKey, locks: InterfaceLocks, authoring: boolean): boolean {
	return !authoring && locks[region];
}

/**
 * Whether the ribbon has anything left to show.
 *
 * Two of its three groups are the filter and the mode toggle, and the third is
 * the layout switch. With all three locked the bar would be an empty stripe
 * above the table, so it disappears and the table takes its height.
 *
 * @param hideFilters - Whether the filter toggle is taken away.
 * @param hideModes - Whether the mode toggle is taken away.
 * @param hideLayoutSwitch - Whether the layout switch is taken away.
 * @returns `true` when at least one group stays.
 */
export function ribbonAvailable(hideFilters: boolean, hideModes: boolean, hideLayoutSwitch: boolean): boolean {
	return !hideFilters || !hideModes || !hideLayoutSwitch;
}
