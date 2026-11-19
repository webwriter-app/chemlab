import assert from "node:assert/strict";
import { test } from "node:test";
import { StructureManager } from "../chemlib";

test("identical metadata requests share a result while a failed structure falls back independently", async t => {
	const props = [];
	props[6] = { value: { sval: "Example compound" } };
	props[12] = { value: { sval: "Example InChI" } };
	props[13] = { value: { sval: "Example key" } };
	const fetch = t.mock.method(globalThis, "fetch", async (url: string) => url.includes("known-structure")
		? { ok: true, json: async () => ({ PC_Compounds: [{ props }] }) }
		: { ok: false });
	const molecule = (smiles: string) => {
		const item = StructureManager.newMolecule();
		item.smilesString = smiles;
		return item;
	};
	const first = molecule("known-structure");
	const second = molecule(first.smilesString);
	const failed = molecule("missing-structure");

	await Promise.all([first, second, failed].map(item => StructureManager.getChemData(item)));
	assert.equal(fetch.mock.callCount(), 2);
	assert.equal(first.name, "Example compound");
	assert.equal(second.InChIKey, "Example key");
	assert.equal(failed.name, failed.smilesString);

	const later = molecule(first.smilesString);
	await StructureManager.getChemData(later);
	assert.equal(later.InChiString, "Example InChI");
	assert.equal(fetch.mock.callCount(), 2);
});
