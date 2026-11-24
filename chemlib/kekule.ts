// @ts-ignore
import { Kekule } from "kekule/mod/io";
// The renderer entry adds `Kekule.Render` and `Kekule.DomUtils`; both entries load
// their own dependencies, so this pair covers everything ChemLab uses.
// @ts-ignore
import "kekule/mod/render";

/**
 * The Kekulé instance limited to the modules ChemLab needs
 *
 * ChemLab builds molecules, writes SMILES and paints structures. The full
 * `kekule` entry additionally ships widgets, spectroscopy, Chinese localization
 * and the OpenBabel, Indigo and InChI bridges, none of which the laboratory
 * reaches. Importing the two modular entries instead removes about 2.1 MB from
 * the single-file release build without changing any of the calls below.
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
 * A page that also loads a second copy of Kekulé can leave that registry empty
 * or redefine the classes it was filled with; the lookup then raises "Can not
 * write data of format: smi". Because every atom addition refreshes the SMILES,
 * such a page could not build a single molecule: the first atom aborted, so no
 * object, no chemical dose and no restored layout ever reached the canvas.
 *
 * The SMILES writer itself needs neither the registry nor a class check, so it
 * is constructed directly here. A missing writer or a failing write returns
 * `undefined` instead of throwing, which keeps the calling molecule alive.
 *
 * @public
 */
export function writeSmiles(structure: any, options?: object): string | undefined {
	// @ts-ignore - the IO namespace comes from the modular entry
	const io: any = (Kekule as any).IO;
	const Writer = io?.SmilesMolWriter;
	if (Writer) {
		try {
			const written = new Writer().writeData(structure, undefined, "smi", options);
			if (typeof written === "string") {
				return written;
			}
		} catch (error) {
			warnSmilesFailure(error);
		}
	}
	try {
		const written = io?.saveFormatData?.(structure, "smi", options);
		return typeof written === "string" ? written : undefined;
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
