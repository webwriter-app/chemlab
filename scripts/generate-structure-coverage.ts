// Writes the tracked structure-coverage artifacts. Bundle this entry for Node
// and run it from the repository root:
//
//   node_modules/.bin/esbuild scripts/generate-structure-coverage.ts --bundle \
//       --platform=node --format=esm --outfile=.coverage-bundle.mjs
//   node .coverage-bundle.mjs          # regenerate
//   node .coverage-bundle.mjs --check  # verify the tracked files
//
// The model reads the live catalog, so the report cannot drift from
// `data/chemicals.ts` and `molecule-builder/catalog.ts`.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoverageReport, renderCoverageJson, renderCoverageMarkdown } from "./structure-coverage-model";

const ROOT = process.cwd();
const JSON_PATH = join(ROOT, "data", "structures", "coverage.json");
const MARKDOWN_PATH = join(ROOT, "docs", "structure-library-coverage.md");

const report = buildCoverageReport();
const files: Array<[string, string]> = [
	[JSON_PATH, renderCoverageJson(report)],
	[MARKDOWN_PATH, renderCoverageMarkdown(report)],
];

if (process.argv.includes("--check")) {
	const stale = files.filter(([path, expected]) => {
		let current = "";
		try {
			current = readFileSync(path, "utf8");
		} catch {
			return true;
		}
		return current !== expected;
	});
	if (stale.length) {
		console.error(`${stale.map(([path]) => path).join("\n")} out of date; run scripts/generate-structure-coverage.ts`);
		process.exitCode = 1;
	} else {
		console.log("Structure coverage artifacts are up to date.");
	}
} else {
	for (const [path, content] of files) writeFileSync(path, content);
	console.log(`Wrote ${files.map(([path]) => path).join(" and ")}.`);
}
