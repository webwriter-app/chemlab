/**
 * Generates `data/structureDefinitions.generated.ts` from the shared structure
 * library.
 *
 * `data/structures/catalog.generated.json` is the one place that holds the
 * reviewed molecular graphs of the structure library. The ChemLab catalog needs
 * the same graphs as `MoleculeDefinition`s, so a dosed reagent and the structure
 * the molecule builder shows cannot drift apart. This script converts every
 * `kind: "molecule"` entry and writes the tracked module; the conversion itself
 * lives in `scripts/structure-definition-model.ts`, which
 * `tests/structure-definitions.test.ts` re-runs to keep the output fresh.
 *
 * Bundle this entry for Node and run it from the repository root:
 *
 *   node_modules/.bin/esbuild scripts/generate-structure-definitions.ts --bundle \
 *       --platform=node --format=esm --outfile=.structure-definitions-bundle.mjs
 *   node .structure-definitions-bundle.mjs          # regenerate
 *   node .structure-definitions-bundle.mjs --check  # verify the tracked file
 *
 * @module scripts/generate-structure-definitions
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildStructureDefinitions, structureDefinitionEntries, elementNamesFromSource } from "./structure-definition-model";

// The bundle runs from the repository root, like the coverage generator.
const ROOT = process.cwd();
const CATALOG_PATH = join(ROOT, "data", "structures", "catalog.generated.json");
const ELEMENT_DATA_PATH = join(ROOT, "chemlib", "ElementData.ts");
const OUTPUT_PATH = join(ROOT, "data", "structureDefinitions.generated.ts");

async function main() {
	const check = process.argv.includes("--check");
	const catalogSource = await readFile(CATALOG_PATH, "utf8");
	const elementSource = await readFile(ELEMENT_DATA_PATH, "utf8");
	const source = buildStructureDefinitions(catalogSource, elementSource);
	if (check) {
		const current = await readFile(OUTPUT_PATH, "utf8").catch(() => "");
		if (current !== source) {
			console.error("data/structureDefinitions.generated.ts is out of date; rerun scripts/generate-structure-definitions.ts");
			process.exitCode = 1;
			return;
		}
		console.log("data/structureDefinitions.generated.ts is up to date");
		return;
	}
	await writeFile(OUTPUT_PATH, source);
	const count = structureDefinitionEntries(JSON.parse(catalogSource), elementNamesFromSource(elementSource)).length;
	console.log(`wrote ${count} molecular graphs to ${OUTPUT_PATH}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
