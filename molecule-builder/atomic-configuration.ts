import { dataValue, elementByAtomicNumber } from "../periodic-table/element-reference";
import { monatomicCharge } from "./crystal-display";
import type { Structure } from "./structure";

const coreNumbers = new Map([["He", 2], ["Ne", 10], ["Ar", 18], ["Kr", 36], ["Xe", 54], ["Rn", 86]]);
const orbitalLetters = "spdf";

export type Subshell = { n: number; l: number; electrons: number; label: string };
export type AtomicSpecies = { atomicNumber: number; charge: number; boundReference: boolean };
export type AtomicConfiguration = {
	text: string;
	subshells: Subshell[];
	valence: Subshell[];
	predicted: boolean;
	formal: boolean;
	electrons: number;
};

// Common monatomic ions in the teaching catalog. Cations are ground-state
// occupations (NIST ASD). Oxide and sulfide use the formal closed-shell ion model.
const ionConfigurations = new Map([
	["3:1", "[He]"], ["8:-2", "[Ne]"], ["9:-1", "[Ne]"], ["11:1", "[Ne]"], ["12:2", "[Ne]"], ["13:3", "[Ne]"],
	["16:-2", "[Ar]"], ["17:-1", "[Ar]"], ["19:1", "[Ar]"], ["20:2", "[Ar]"],
	["25:2", "[Ar] 3d5"], ["25:4", "[Ar] 3d3"], ["26:2", "[Ar] 3d6"], ["26:3", "[Ar] 3d5"],
	["28:2", "[Ar] 3d8"], ["29:1", "[Ar] 3d10"], ["29:2", "[Ar] 3d9"], ["30:2", "[Ar] 3d10"],
	["35:-1", "[Kr]"], ["38:2", "[Kr]"], ["47:1", "[Kr] 4d10"], ["53:-1", "[Xe]"], ["56:2", "[Xe]"],
]);

function expand(text: string): Subshell[] {
	const terms = text.trim().split(/\s+/).filter(Boolean);
	const core = /^\[([A-Z][a-z])\]$/.exec(terms[0] ?? "");
	const atomicNumber = core && coreNumbers.get(core[1]);
	const subshells = atomicNumber ? expand(dataValue(elementByAtomicNumber(atomicNumber).configuration) ?? "") : [];
	for (const term of terms.slice(core ? 1 : 0)) {
		const match = /^(\d)([spdf])(\d+)$/.exec(term);
		if (!match) continue;
		const [, n, letter, electrons] = match;
		subshells.push({ n: Number(n), l: orbitalLetters.indexOf(letter), electrons: Number(electrons), label: n + letter });
	}
	return subshells;
}

const cache = new Map<string, AtomicConfiguration>();

export function electronConfiguration(atomicNumber: number, charge: number): AtomicConfiguration {
	const key = `${atomicNumber}:${charge}`;
	const cached = cache.get(key);
	if (cached) return cached;
	const electrons = atomicNumber - charge;
	const neutral = elementByAtomicNumber(atomicNumber).configuration;
	const text = electrons === 0 ? "" : electrons === 1 ? "1s1"
		: charge ? ionConfigurations.get(key) ?? "" : dataValue(neutral) ?? "";
	const subshells = expand(text);
	const verified = subshells.reduce((sum, item) => sum + item.electrons, 0) === electrons;
	const tail = text.replace(/^\[[^\]]+\]\s*/, "");
	const outer = Math.max(...subshells.map(shell => shell.n));
	const valence = tail !== text && tail ? subshells.slice(-tail.split(/\s+/).length)
		: subshells.filter(shell => shell.n === outer);
	const result = {
		text: verified ? text : "", subshells: verified ? subshells : [], valence: verified ? valence : [], electrons,
		predicted: !charge && neutral.status === "predicted",
		formal: key === "8:-2" || key === "16:-2",
	};
	cache.set(key, result);
	return result;
}

export function atomicSpecies(structure: Structure, id: number): AtomicSpecies | undefined {
	if (structure.kind === "crystal") {
		const site = structure.sites.find(entry => entry.id === id);
		if (!site) return undefined;
		const charge = monatomicCharge(site.ion ? { ...site, charge: 0 } : site);
		return { atomicNumber: site.atomicNumber, charge, boundReference: !charge };
	}
	const atom = structure.atoms.find(entry => entry.id === id);
	if (!atom) return undefined;
	const bonded = structure.bonds.some(bond => bond.from === id || bond.to === id);
	return { atomicNumber: atom.atomicNumber, charge: bonded ? 0 : atom.charge, boundReference: bonded };
}

const orientations = [
	["s"], ["p(z)", "p(x)", "p(y)"],
	["d(z²)", "d(xz)", "d(yz)", "d(x²−y²)", "d(xy)"],
	["f(0)", "f(1, cos)", "f(1, sin)", "f(2, cos)", "f(2, sin)", "f(3, cos)", "f(3, sin)"],
] as const;

export function orbitalOrientations(l: number): readonly string[] {
	return orientations[l] ?? [];
}

export function atomicShells(configuration: AtomicConfiguration) {
	const electrons = new Map<number, number>();
	for (const shell of configuration.subshells) electrons.set(shell.n, (electrons.get(shell.n) ?? 0) + shell.electrons);
	return [...electrons].sort(([a], [b]) => a - b).map(([n, electrons]) => ({ n, electrons, label: "KLMNOPQ"[n - 1] }));
}

/** A conventional assignment to equivalent orbitals for the school-level
 * diagram: fill each with one parallel spin before adding opposite spins. */
export function orbitalOccupation(subshell: Subshell, orientation: number): 0 | 1 | 2 {
	return (Number(orientation < subshell.electrons) + Number(orientation + 2 * subshell.l + 1 < subshell.electrons)) as 0 | 1 | 2;
}

export const shellColors = ["#167fbd", "#147a69", "#8051b5", "#a45115", "#ac4570", "#3966b4", "#637323"];
export const subshellColors = shellColors.slice(0, 4);

export function shellOrbit(index: number, count: number) {
	return { radius: (13 + (index + 1) * 81 / Math.max(1, count)) / 94, seconds: 7 + index * 2.5 };
}
