/**
 * Default preset content for a fresh widget instance.
 *
 * These are the initial values of the reflected `availablemolecules` /
 * `availablemixtures` attributes before an author overrides them. Component
 * presets default to an empty list.
 */

/** Molecules offered by default (water). */
export const defaultMolecules: Array<object> = [
	{
		formula: "OH2",
		atoms: ["oxygen", "hydrogen", "hydrogen"],
		bonds: ["0-1:covalent:1", "0-2:covalent:1"],
	},
];

/** Mixtures offered by default (none). */
export const defaultMixtures: Array<object> = [];
