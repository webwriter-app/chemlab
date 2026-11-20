import metalReferences from "../data/structures/metals.generated.json";
import type { Crystal } from "../molecule-builder/structure";

const metalCells = metalReferences as unknown as Readonly<Partial<Record<number, Crystal | null>>>;

/** Missing measured bulk lattice is null. Elements outside the metal set are undefined. */
export function metalCrystal(atomicNumber: number): Crystal | null | undefined {
	return metalCells[atomicNumber];
}
