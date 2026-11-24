import { Kekule } from "./vendor/kekule-runtime.mjs";

/**
 * ChemLab's own Kekulé types and registries. Each WebWriter bundle that
 * uses this module can coexist with other versions on the same document.
 *
 * @public
 */
export { Kekule };

/** The failure repeats on every atom, so it is reported once per session. */
let smilesWarningShown = false;

/**
 * Writes the SMILES of a Kekulé structure without going through the registry
 *
 * `Kekule.IO.saveFormatData(structure, "smi")` looks the writer up in
 * `ChemDataWriterManager` and matches the entry against the structure's class.
 * The SMILES writer itself needs neither the registry nor a class check, so it
 * is constructed directly here. A missing writer or a failing write returns
 * `undefined` instead of throwing, which keeps the calling molecule alive.
 *
 * @public
 */
export function writeSmiles(structure: any, options?: object): string | undefined {
	const io = Kekule.IO;
	const Writer = io?.SmilesMolWriter;
	if (Writer) {
		try {
			const written = new Writer().writeData(structure, undefined, "smi", options);
			if (typeof written === "string" && written.length > 0) {
				return written;
			}
		} catch (error) {
			warnSmilesFailure(error);
		}
	}
	try {
		const written = io?.saveFormatData?.(structure, "smi", options);
		return typeof written === "string" && written.length > 0 ? written : undefined;
	} catch (error) {
		warnSmilesFailure(error);
		return undefined;
	}
}

function warnSmilesFailure(error: unknown): void {
	if (smilesWarningShown) {
		return;
	}
	smilesWarningShown = true;
	console.warn(
		"ChemLab: Die SMILES-Schreibweise steht nicht zur Verfügung, die Moleküle bleiben ohne Strukturtext.",
		error,
	);
}
