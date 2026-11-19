/**
 * Guards the scoped element registry of the periodic table widget.
 *
 * `LitElementWw` renders through a scoped custom element registry, so a Shoelace
 * tag that is missing from `static scopedElements` stays an unknown element: the
 * toolbar then shows the bare text of its buttons and options. The same list also
 * keeps the component modules in the bundle, because the imports are otherwise
 * unused and get tree-shaken away. Both failures are invisible to the type
 * checker, so they are checked against the source text here.
 *
 * The entry module itself cannot be imported in Node, because Lit needs a DOM.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";

const ROOT = process.cwd();
const ENTRY = resolve(ROOT, "webwriter-chemlab-periodic-table.ts");
const SHOELACE = resolve(ROOT, "node_modules/@shoelace-style/shoelace/dist");

const source = readFileSync(ENTRY, "utf8");

/**
 * Collects the Shoelace tags a source text uses in its templates.
 *
 * @param text - Source text to scan.
 * @returns Tag names without the angle bracket, sorted.
 */
function usedTags(text: string): string[] {
	const tags = new Set<string>();
	for (const match of text.matchAll(/<(sl-[a-z-]+)/g)) tags.add(match[1]);
	return [...tags].sort();
}

/**
 * Reads the `static scopedElements` block of the entry.
 *
 * @returns Registered tag names mapped to the class identifier they use.
 */
function registeredElements(): Map<string, string> {
	const block = /static scopedElements = \{([\s\S]*?)\n\t\};/.exec(source);
	assert.ok(block, "the entry declares static scopedElements");
	const entries = new Map<string, string>();
	for (const match of block[1].matchAll(/"([a-z-]+)":\s*([A-Za-z0-9_]+)/g)) {
		entries.set(match[1], match[2]);
	}
	return entries;
}

/**
 * Follows the relative imports of a Shoelace dist file.
 *
 * @param file - Absolute path of the entry file.
 * @returns Every file reachable from it, including itself.
 */
function importClosure(file: string): Set<string> {
	const seen = new Set<string>();
	const stack = [file];
	while (stack.length > 0) {
		const current = stack.pop()!;
		if (seen.has(current)) continue;
		seen.add(current);
		const text = readFileSync(current, "utf8");
		for (const match of text.matchAll(/(?:from|import)\s*"([^"]+)"/g)) {
			const target = resolve(dirname(current), match[1]);
			if (existsSync(target)) stack.push(target);
		}
	}
	return seen;
}

test("every Shoelace tag in the templates is registered", () => {
	const registered = registeredElements();
	const missing = usedTags(source).filter(tag => !registered.has(tag));
	assert.deepEqual(missing, [], `unregistered tags: ${missing.join(", ")}`);
});

test("every registered element is imported from Shoelace", () => {
	const imports = new Set<string>();
	for (const match of source.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+"@shoelace-style\/shoelace\/[^"]+"/g)) {
		imports.add(match[1]);
	}
	const unimported = [...registeredElements()].filter(([, identifier]) => !imports.has(identifier));
	assert.deepEqual(unimported, [], `not imported: ${unimported.map(([tag]) => tag).join(", ")}`);
});

test("the elements a registered component renders itself are registered too", () => {
	const registered = registeredElements();
	const missing: string[] = [];
	for (const tag of registered.keys()) {
		const name = tag.replace(/^sl-/, "");
		const file = resolve(SHOELACE, `components/${name}/${name}.component.js`);
		if (!existsSync(file)) continue;
		const nested = new Set<string>();
		for (const reachable of importClosure(file)) {
			for (const nestedTag of usedTags(readFileSync(reachable, "utf8"))) nested.add(nestedTag);
		}
		for (const nestedTag of nested) {
			if (!registered.has(nestedTag)) missing.push(`${tag} needs ${nestedTag}`);
		}
	}
	assert.deepEqual(missing, [], missing.join("; "));
});
