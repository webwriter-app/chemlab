/**
 * Guards the scoped render of the widget entries.
 *
 * `LitElementWw` keeps its own custom element registry per shadow root, and
 * `@open-wc/scoped-elements` hands it to Lit as `renderOptions.creationScope`.
 * A bare `render(template, node)` builds through the document registry instead,
 * so a fill lands on unknown elements: the object card then showed its name and
 * plain text where its carousel, its pH tag and its saturation tag belonged,
 * and no type checker notices. A Shoelace tag built with
 * `document.createElement("sl-…")` fails the same way.
 *
 * Both rules are checked against the source text, because the entries cannot be
 * imported in Node: Lit reads a DOM while it initialises.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const ROOT = process.cwd();
const ENTRIES = ["webwriter-chemlab.ts", "webwriter-chemlab-periodic-table.ts", "webwriter-chemlab-molecule-builder.ts"];

/** Directories whose sources may build a Shoelace tag imperatively. */
const DIRECTORIES = ["ui", "data", "controllers", "periodic-table", "molecule-builder"];

const sources = new Map<string, string>();
for (const entry of ENTRIES) sources.set(entry, readFileSync(resolve(ROOT, entry), "utf8"));

/**
 * A `render` call and the source text of its arguments.
 */
interface RenderCall {
	/** One entry per top-level argument, untrimmed. */
	readonly args: string[];
}

/**
 * Reads the arguments of the call that starts at a `render` identifier.
 *
 * Strings and template literals are stepped over, and an interpolation inside a
 * template literal counts as code again, so a bracket of a nested template does
 * not end the call. Without that, the multi-line fills of the widget would end at
 * the wrong bracket and every call would look safe.
 *
 * @param source - Source text to read.
 * @param start - Index of the identifier.
 * @returns The arguments, or `undefined` when no call starts there.
 */
function callArguments(source: string, start: number): string[] | undefined {
	const open = source.indexOf("(", start);
	if (open < 0) return undefined;
	const args: string[] = [];
	let depth = 1;
	let quote: string | undefined;
	let templates = 0;
	const interpolations: number[] = [];
	let from = open + 1;
	for (let index = open + 1; index < source.length; index++) {
		const char = source[index];
		if (quote !== undefined) {
			if (char === "\\") index++;
			else if (char === quote) quote = undefined;
			continue;
		}
		if (templates > interpolations.length) {
			// Template text: only an escape, the closing backtick and an
			// interpolation mean anything here.
			if (char === "\\") index++;
			else if (char === "`") templates--;
			else if (char === "$" && source[index + 1] === "{") {
				interpolations.push(0);
				index++;
			}
			continue;
		}
		if (char === "'" || char === '"') quote = char;
		else if (char === "`") templates++;
		else if (char === "{" && interpolations.length) interpolations[interpolations.length - 1]++;
		else if (char === "}" && interpolations.length) {
			if (interpolations[interpolations.length - 1] === 0) interpolations.pop();
			else interpolations[interpolations.length - 1]--;
		} else if (char === "(") depth++;
		else if (char === ")") {
			depth--;
			if (depth === 0) {
				args.push(source.slice(from, index));
				return args;
			}
		} else if (char === "," && depth === 1) {
			args.push(source.slice(from, index));
			from = index + 1;
		}
	}
	return undefined;
}

/**
 * Collects the calls of the imported `render` function of a source text.
 *
 * A call without arguments is the `render()` method of a Lit element and is
 * skipped; the same name as a property (`.render(`) is not the imported one.
 *
 * @param source - Source text to scan.
 * @returns One entry per call.
 */
function renderCalls(source: string): RenderCall[] {
	const calls: RenderCall[] = [];
	for (const match of source.matchAll(/(?<![\w.$])render\(/g)) {
		const args = callArguments(source, match.index);
		if (!args) continue;
		if (args.length === 1 && args[0].trim() === "") continue;
		calls.push({ args });
	}
	return calls;
}

/**
 * Finds every `createElement` of a Shoelace tag in a source text.
 *
 * @param source - Source text to scan.
 * @returns The matched tag names.
 */
function createdShoelaceTags(source: string): string[] {
	return [...source.matchAll(/createElement\(\s*["'](sl-[a-z-]+)["']/g)].map((match) => match[1]);
}

/**
 * Reads every TypeScript file of the given directories.
 *
 * @param directory - Directory relative to the repository root.
 * @returns File names relative to it, mapped to their source text.
 */
function readSources(directory: string): Map<string, string> {
	const found = new Map<string, string>();
	for (const item of readdirSync(resolve(ROOT, directory), { withFileTypes: true })) {
		if (item.isDirectory()) {
			for (const [name, text] of readSources(`${directory}/${item.name}`)) found.set(name, text);
		} else if (item.name.endsWith(".ts")) {
			found.set(`${directory}/${item.name}`, readFileSync(resolve(ROOT, directory, item.name), "utf8"));
		}
	}
	return found;
}

test("the fills of the widget render through the scoped registry", () => {
	for (const [entry, source] of sources) {
		for (const call of renderCalls(source)) {
			assert.equal(call.args.length, 3, `${entry}: render needs a target and the render options: ${call.args[0].trim().slice(0, 40)}`);
			assert.equal(call.args[2].trim(), "this.renderOptions", `${entry}: a fill renders through the render options of the host`);
		}
	}
});

test("a fill without the render options is found", () => {
	// The pattern of the bug: the object card was filled through the document
	// registry, so a tag of the template stayed an unknown element.
	const reverted = "\t\trender(html`<p>${format(amount, 2)} mL, ${keys.map(key => html`<b>${key}</b>`)}</p>`, carousel);\n";
	const calls = renderCalls(reverted);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.length, 2);
	assert.equal(calls[0].args[1].trim(), "carousel");
});

test("the ChemLab widget keeps both scoped helpers", () => {
	const source = sources.get("webwriter-chemlab.ts") ?? "";
	assert.match(source, /private renderScoped\(node: Node, template: unknown\): void/);
	assert.match(source, /private createScoped<T extends Element>\(template: unknown\): T \| undefined/);
	assert.equal(renderCalls(source).length, 2, "only the helpers call render directly");
});

test("no Shoelace tag is built in the document registry", () => {
	const texts = new Map(sources);
	for (const directory of DIRECTORIES) {
		for (const [name, text] of readSources(directory)) texts.set(name, text);
	}
	for (const [name, text] of texts) {
		assert.deepEqual(createdShoelaceTags(text), [], `${name}: build a Shoelace tag through the scoped render`);
	}
});

test("the default export locations stay untouched", () => {
	// Both entries render Shoelace markup only in templates, which Lit builds
	// through the registry of the host, so they never need a scoped helper.
	for (const entry of ENTRIES.slice(1)) {
		const source = sources.get(entry) ?? "";
		assert.equal(renderCalls(source).length, 0, `${entry} renders in its template only`);
	}
});
