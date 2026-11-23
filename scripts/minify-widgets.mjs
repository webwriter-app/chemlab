#!/usr/bin/env node
/**
 * Minifies the release bundles that `npx @webwriter/build` writes to `dist/widgets`.
 *
 * The WebWriter build has no minification switch, so the release runs in two
 * steps: the builder produces the readable single-file bundles with their CSS
 * and metadata, and this script shrinks the JavaScript afterwards. Each entry is
 * a self-contained ES module, so transforming it on its own is enough; nothing
 * is re-bundled and the loader rules of the builder stay the single source of
 * truth for how assets are inlined.
 *
 * `dist/` holds the minified result, while `npx @webwriter/build dev` keeps
 * writing readable bundles with inline source maps for development.
 *
 * Usage: `node scripts/minify-widgets.mjs` after a release build in the
 * repository root. The `esbuild` it imports ships as a dependency of the
 * declared `vite` dev dependency.
 *
 * Pass `--keep-names` to retain function and class names for `.name` lookups in
 * diagnostics. That costs about 30 kB gzip on the lab entry.
 */
import * as esbuild from "esbuild";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const keepNames = process.argv.includes("--keep-names");
const directory = path.join(process.cwd(), "dist", "widgets");
const kib = bytes => `${(bytes / 1024).toFixed(1)} KiB`;

const names = (await readdir(directory)).filter(name => name.endsWith(".js")).sort();
if (!names.length) {
	console.error(`No bundles in ${directory}. Run "npx @webwriter/build" first.`);
	process.exit(1);
}

for (const name of names) {
	const file = path.join(directory, name);
	const source = await readFile(file, "utf8");
	const before = (await stat(file)).size;
	// Legal comments move to the end of the file so licence notices survive.
	const { code } = await esbuild.transform(source, {
		loader: "js",
		format: "esm",
		target: "es2022",
		minify: true,
		keepNames,
		legalComments: "eof",
		sourcefile: name,
	});
	await writeFile(file, code, "utf8");
	const after = Buffer.byteLength(code);
	const saved = before ? Math.round((1 - after / before) * 1000) / 10 : 0;
	console.log(`${name}: ${kib(before)} to ${kib(after)} (-${saved} %)`);
}
