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
