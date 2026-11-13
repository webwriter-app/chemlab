import { ElementData, StructureManager, type Atom } from "../chemlib";
import type { MoleculeDefinition } from "./chemicals";

export function loadMoleculeDefinition(definition?: MoleculeDefinition, onAtom?: (atom: Atom) => void) {
	const molecule = StructureManager.newMolecule();
	definition?.atoms.forEach((element, index) => {
		const atom = molecule.addAtom(element, ElementData.getData(element)["symbol"], definition.charges?.[index]);
		onAtom?.(atom);
	});
	for (const entry of definition?.bonds ?? []) {
		if (!entry) continue;
		const [pair, type, order] = entry.split(":");
		const [from, to] = pair.split("-").map((value) => Number.parseInt(value, 10));
		molecule.addBond(from, to, Number.parseInt(order, 10), 100, type);
	}
	return molecule;
}
