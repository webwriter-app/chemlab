import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
	componentGraphic,
	componentVariants,
	layoutTextureUrls,
	savedComponentVariant,
} from "../data/componentGraphics";

/** The authored devices of a template, in the order the data block lists them. */
function templateDevices(file: string): Record<string, unknown>[] {
	const html = readFileSync(`snippets/${file}`, "utf8");
	const data = JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/s)[1]) as {
		availableComponents?: Record<string, unknown>[];
	};
	return data.availableComponents ?? [];
}

test("a blank lab asks for no component texture", () => {
	assert.deepEqual(layoutTextureUrls([]), []);
});

test("every palette variant asks for the graphic its view draws", () => {
	// The prefetch of a palette card and the load before a placement both go
	// through the derivation, so the two have to agree for every variant.
	for (const variant of Object.values(componentVariants).flat()) {
		const entry = { type: variant.type, variantId: variant.id };
		// A cable draws its own strand and is the one family without a texture.
		const expected = variant.type === "cable" ? [] : [componentGraphic(variant.type, variant.id).url];
		assert.deepEqual(layoutTextureUrls([entry]), expected, variant.id);
	}
});

test("devices of one family share their texture", () => {
	const urls = layoutTextureUrls([
		{ type: "beaker", variantId: "beaker:100ml" },
		{ type: "beaker", variantId: "beaker:400ml" },
		{ type: "Beaker" },
		{ type: "flask", variantId: "flask:250ml" },
	]);
	assert.deepEqual(urls, [componentGraphic("beaker").url, componentGraphic("flask").url]);
});

test("a variant that does not belong to the device falls back to its type", () => {
	const electrode = componentGraphic("electrode").url;
	assert.equal(savedComponentVariant("electrode", "electrode:she")?.id, "electrode:she");
	assert.equal(savedComponentVariant("electrode", "electrode:gone"), undefined);
	assert.equal(savedComponentVariant("beaker", "electrode:she"), undefined);
	assert.equal(savedComponentVariant("Beaker", "beaker:100ml")?.id, "beaker:100ml");
	// A saved entry may carry no variant at all, or a field of another type.
	for (const stale of [undefined, null, 42, "", "electrode:gone"]) {
		assert.equal(savedComponentVariant("electrode", stale), undefined, String(stale));
	}
	assert.deepEqual(layoutTextureUrls([{ type: "electrode", variantId: "electrode:gone" }]), [electrode]);
	assert.deepEqual(layoutTextureUrls([{ type: "beaker", variantId: "electrode:she" }]), [componentGraphic("beaker").url]);
	assert.deepEqual(layoutTextureUrls([{ type: "electrode", capacityMl: 250 }]), [electrode]);
});

test("a variant with its own artwork asks for that artwork", () => {
	const plain = componentGraphic("electrode").url;
	for (const variantId of ["electrode:she", "electrode:calomel"]) {
		const urls = layoutTextureUrls([{ type: "electrode", variantId }]);
		assert.deepEqual(urls, [componentGraphic("electrode", variantId).url], variantId);
		assert.notEqual(urls[0], plain, variantId);
	}
});

test("a device of an unknown type asks for the fallback artwork", () => {
	const fallback = componentGraphic("not-a-component").url;
	assert.deepEqual(layoutTextureUrls([{ type: "not-a-component" }]), [fallback]);
	// Legacy entries can name a device the type table leaves to its own list.
	assert.deepEqual(
		layoutTextureUrls([{ type: "separatingfunnel" }]),
		[componentGraphic("separatingfunnel").url],
	);
	assert.notEqual(componentGraphic("separatingfunnel").url, fallback);
});

test("a cable carries no texture", () => {
	assert.deepEqual(layoutTextureUrls([{ type: "cable", variantId: "cable:banana" }]), []);
	assert.deepEqual(layoutTextureUrls([{ type: "Cable", variantId: "cable:mixed" }]), []);
	assert.deepEqual(
		layoutTextureUrls([{ type: "beaker" }, { type: "cable" }, { type: "beaker" }]),
		[componentGraphic("beaker").url],
	);
});

test("the electrochemistry template asks only for what it shows", () => {
	const urls = layoutTextureUrls(templateDevices("Beispiel-Elektrochemie.html"));
	// Every family the fifteen setups use, plus the artwork of the one reference
	// electrode that brings its own drawing. A metal strip shares the electrode
	// artwork, so the copper and zinc cells do not add a texture of their own.
	assert.deepEqual(urls, [
		componentGraphic("beaker").url,
		componentGraphic("electrode").url,
		componentGraphic("bridge").url,
		componentGraphic("label").url,
		componentGraphic("voltmeter").url,
		componentGraphic("ammeter").url,
		componentGraphic("source").url,
		componentGraphic("gascollector").url,
		componentGraphic("multimeter").url,
		componentGraphic("electrode", "electrode:calomel").url,
	]);
	// The catalogue would also carry these, and the full load used to fetch them.
	for (const unused of ["flask", "burette", "testtube", "cable", "electrode:she"]) {
		assert.ok(!urls.includes(componentGraphic(unused.split(":")[0], unused).url), unused);
	}
});

test("the titration templates ask only for their glassware", () => {
	assert.deepEqual(
		layoutTextureUrls(templateDevices("Beispiel-Titration.html")),
		[componentGraphic("beaker").url, componentGraphic("burette").url],
	);
	assert.deepEqual(
		layoutTextureUrls(templateDevices("Beispiel-Titrationstypen.html")),
		[componentGraphic("beaker").url, componentGraphic("burette").url, componentGraphic("label").url],
	);
});

test("an edit that introduces a new variant names the texture it adds", () => {
	const devices = templateDevices("Beispiel-Elektrochemie.html");
	const before = layoutTextureUrls(devices);
	const after = layoutTextureUrls([...devices, { type: "Electrode", variantId: "electrode:she" }]);
	// The ensure before assembling compares the two lists: only the new artwork
	// has to be fetched, and the layouts that were already assembled stay as
	// they are.
	assert.deepEqual(
		after.filter((url) => !before.includes(url)),
		[componentGraphic("electrode", "electrode:she").url],
	);
	assert.equal(after.length, before.length + 1);
});
