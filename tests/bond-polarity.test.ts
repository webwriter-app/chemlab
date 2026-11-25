import assert from "node:assert/strict";
import { test } from "node:test";
import { bondPolarity, polarityColors, polarityLevel, POLARITY_KEY } from "../molecule-builder/bond-polarity";

const elements = (...atomicNumbers: number[]) => new Map(atomicNumbers.map((atomicNumber, index) => [index + 1, { atomicNumber }]));
const bond = { from: 1, to: 2, order: 1 } as const;

test("bond polarity points towards oxygen and reverses with the bond endpoints", () => {
	const water = elements(1, 8, 1);
	const towardOxygen = bondPolarity(bond, water);
	assert.equal(towardOxygen, 1.24);
	assert.equal(bondPolarity({ ...bond, from: 2, to: 3 }, water), -towardOxygen);
	assert.equal(bondPolarity({ ...bond, order: 2 }, elements(6, 8)), .89);
	assert.equal(bondPolarity(bond, elements(8, 8)), 0);
});

test("ionic links, donor arrows and unavailable heteronuclear values are omitted", () => {
	assert.equal(bondPolarity({ ...bond, kind: "ionic" }, elements(11, 17)), undefined);
	assert.equal(bondPolarity({ ...bond, dative: true }, elements(7, 5)), undefined);
	assert.equal(bondPolarity(bond, elements(1, 118)), undefined);
});

test("weaker bonds have less colour contrast on the same scale", () => {
	const weak = polarityLevel(.35);
	const strong = polarityLevel(1.24);
	assert.ok(weak > 0 && weak < strong);
	assert.deepEqual(polarityColors(0), Array(3).fill(POLARITY_KEY.even));
	assert.deepEqual(polarityColors(-strong), [...polarityColors(strong)].reverse());
});
