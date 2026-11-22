import { ElementData } from "../chemlib/ElementData";
import type { Structure } from "./structure";

const elementNames = ElementData.getElementList();

export function formula(structure: Structure): string {
	if (structure.kind === "crystal" && structure.catalogKey && structure.name) return structure.name;
	const counts = new Map<string, number>();
	for (const { atomicNumber } of structure.kind === "molecule" ? structure.atoms : structure.sites) {
		const symbol = ElementData.getData(elementNames[atomicNumber - 1])?.["symbol"];
		if (!symbol) continue;
		counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
	}
	const ordered = [...counts.keys()].sort((a, b) => a.localeCompare(b, "en"));
	if (counts.has("C")) {
		ordered.splice(ordered.indexOf("C"), 1);
		if (counts.has("H")) ordered.splice(ordered.indexOf("H"), 1);
		ordered.unshift(...(counts.has("H") ? ["C", "H"] : ["C"]));
	}
	const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
	const divisor = structure.kind === "crystal" ? [...counts.values()].reduce(gcd, 0) : 1;
	return ordered.map(symbol => {
		const count = counts.get(symbol) / divisor;
		return symbol + (count > 1 ? String(count) : "");
	}).join("");
}
