import assert from "node:assert/strict";
import { test } from "node:test";
import {
	atomicWeightText,
	CATEGORIES,
	CONDITIONS,
	ELEMENT_COUNT,
	ELEMENTS,
	elementByAtomicNumber,
	LAYOUT,
	placementOf,
	SOURCES,
} from "../periodic-table/element-reference";
import { legacyElementKeyToAtomicNumber, normalizeElementName } from "../periodic-table/legacy-names";

const byNumber = new Map(ELEMENTS.map((element) => [element.atomicNumber, element]));

test("the bundle holds one record for every atomic number from 1 to 118", () => {
	assert.equal(ELEMENT_COUNT, 118);
	assert.equal(ELEMENTS.length, 118);
	for (let z = 1; z <= 118; z++) {
		const element = elementByAtomicNumber(z);
		assert.ok(element, `missing Z = ${z}`);
		assert.equal(element.atomicNumber, z);
	}
	assert.equal(new Set(ELEMENTS.map((element) => element.symbol)).size, 118);
	assert.equal(elementByAtomicNumber(0), undefined);
	assert.equal(elementByAtomicNumber(119), undefined);
	assert.equal(elementByAtomicNumber(8.5), undefined);
});

test("every record carries a bilingual name and a resolvable provenance", () => {
	const sourceIds = new Set(Object.keys(SOURCES));
	for (const element of ELEMENTS) {
		assert.ok(element.names.en.length > 0, element.symbol);
		assert.ok(element.names.de.length > 0, element.symbol);
		assert.ok(sourceIds.has(element.identitySources.iupac.sourceId), element.symbol);
		assert.ok(sourceIds.has(element.identitySources.germanName.sourceId), element.symbol);
		const provenances = [element.group, element.block, element.configuration, element.phase];
		for (const record of provenances) {
			if (record.provenance) assert.ok(sourceIds.has(record.provenance.sourceId), element.symbol);
		}
		if (element.weight.kind !== "unavailable") {
			assert.ok(sourceIds.has(element.weight.provenance.sourceId), element.symbol);
		}
	}
});

test("the shells add up to the atomic number", () => {
	for (const element of ELEMENTS) {
		const electrons = element.shells.reduce((sum, count) => sum + count, 0);
		assert.equal(electrons, element.atomicNumber, element.symbol);
		assert.ok(element.shells.length <= element.period, element.symbol);
	}
});

test("the placement table covers the grid without collisions", () => {
	const cells = new Set();
	for (let z = 1; z <= 118; z++) {
		const placement = placementOf(z);
		assert.ok(placement, `missing placement for Z = ${z}`);
		assert.ok(placement.row >= 1 && placement.row <= 9, `row of Z = ${z}`);
		assert.ok(placement.column >= 1 && placement.column <= LAYOUT.columns, `column of Z = ${z}`);
		assert.ok(Object.hasOwn(CATEGORIES, placement.category), `category of Z = ${z}`);
		const cell = `${placement.row}:${placement.column}`;
		assert.equal(cells.has(cell), false, `collision at ${cell}`);
		cells.add(cell);
	}
	for (const placeholder of LAYOUT.placeholders) {
		assert.equal(cells.has(`${placeholder.row}:${placeholder.column}`), false);
	}
	assert.equal(LAYOUT.columns, 18);
	assert.equal(LAYOUT.periodRows, 7);
	assert.equal(LAYOUT.seriesRows.length, 2);
});

test("the main grid follows the period and the detached rows follow the series", () => {
	for (const element of ELEMENTS) {
		const placement = placementOf(element.atomicNumber);
		const series = LAYOUT.seriesRows.find((row) => row.row === placement.row);
		if (series) {
			assert.ok(element.atomicNumber >= series.firstAtomicNumber, element.symbol);
			assert.ok(element.atomicNumber <= series.lastAtomicNumber, element.symbol);
			assert.equal(placement.column, series.firstColumn + element.atomicNumber - series.firstAtomicNumber);
		} else {
			assert.equal(placement.row, element.period, element.symbol);
		}
	}
	assert.deepEqual(placementOf(1), { row: 1, column: 1, category: "nonmetal" });
	assert.deepEqual(placementOf(2), { row: 1, column: 18, category: "noble-gas" });
	assert.deepEqual(placementOf(26), { row: 4, column: 8, category: "transition-metal" });
	assert.deepEqual(placementOf(57), { row: 8, column: 3, category: "lanthanide" });
	assert.deepEqual(placementOf(71), { row: 8, column: 17, category: "lanthanide" });
	assert.deepEqual(placementOf(89), { row: 9, column: 3, category: "actinide" });
	assert.deepEqual(placementOf(118), { row: 7, column: 18, category: "unknown" });
});

test("argon keeps its interval and copper its uncertainty digits", () => {
	const argon = byNumber.get(18);
	assert.equal(argon.weight.kind, "interval");
	assert.equal(argon.weight.lower, "39.792");
	assert.equal(argon.weight.upper, "39.963");
	assert.deepEqual(argon.weight.noteCodes, undefined);

	const copper = byNumber.get(29);
	assert.equal(copper.weight.kind, "value");
	assert.equal(copper.weight.decimal, "63.546");
	assert.equal(copper.weight.uncertaintyDigits, "3");

	const hydrogen = byNumber.get(1);
	assert.equal(hydrogen.weight.kind, "interval");
	assert.deepEqual(hydrogen.weight.noteCodes, ["m"]);
});

test("an element without a stable isotope has no standard atomic weight", () => {
	for (const z of [43, 61, 84, 85, 86, 87, 88, 89, 93, 118]) {
		assert.equal(byNumber.get(z).weight.kind, "none", String(z));
	}
	assert.equal(byNumber.get(92).weight.kind, "value");
});

test("the ground-state exceptions survive the NIST cross-check", () => {
	assert.equal(byNumber.get(24).configuration.value, "[Ar] 3d5 4s1");
	assert.equal(byNumber.get(29).configuration.value, "[Ar] 3d10 4s1");
	assert.equal(byNumber.get(41).configuration.value, "[Kr] 4d4 5s1");
	assert.equal(byNumber.get(46).configuration.value, "[Kr] 4d10");
	assert.equal(byNumber.get(2).configuration.value, "1s2");
	assert.equal(byNumber.get(26).configuration.value, "[Ar] 3d6 4s2");
	assert.equal(byNumber.get(26).configuration.status, "reported");
});

test("the prediction policy separates reported, predicted and unavailable values", () => {
	const oganesson = byNumber.get(118);
	assert.equal(oganesson.configuration.status, "predicted");
	assert.equal(oganesson.phase.status, "predicted");
	assert.equal(oganesson.phase.value, "solid");
	assert.equal(oganesson.weight.kind, "none");

	const tennessine = byNumber.get(117);
	assert.equal(tennessine.phase.status, "unavailable");
	assert.equal(tennessine.configuration.status, "predicted");

	const fermium = byNumber.get(100);
	assert.equal(fermium.configuration.status, "predicted");
	assert.equal(fermium.phase.status, "reported");

	const einsteinium = byNumber.get(99);
	assert.equal(einsteinium.configuration.status, "reported");

	const rutherfordium = byNumber.get(104);
	assert.equal(rutherfordium.phase.status, "unavailable");
	assert.equal(byNumber.get(103).phase.status, "reported");
	// Oganesson is the only transactinide whose source record carries a phase at all.
	const predictedPhases = ELEMENTS.filter((element) => element.phase.status === "predicted");
	assert.deepEqual(predictedPhases.map((element) => element.symbol), ["Og"]);
});

test("group 3 keeps the three states apart", () => {
	const scandium = byNumber.get(21);
	assert.equal(scandium.group.status, "reported");
	assert.equal(scandium.group.value, 3);
	assert.equal(byNumber.get(39).group.value, 3);
	for (const z of [57, 89, 71, 103]) {
		assert.equal(byNumber.get(z).group.status, "convention-dependent", String(z));
	}
	for (const z of [58, 70, 90, 102]) {
		assert.equal(byNumber.get(z).group.status, "unassigned", String(z));
	}
	assert.equal(byNumber.get(26).group.value, 8);
	assert.equal(byNumber.get(118).group.value, 18);
});

test("the phase values name the conditions they refer to", () => {
	assert.equal(CONDITIONS.temperatureK, 298.15);
	assert.equal(CONDITIONS.pressureBar, 1);
	const phases = new Set(ELEMENTS.map((element) => element.phase.value).filter(Boolean));
	assert.deepEqual([...phases].sort(), ["gas", "liquid", "solid"]);
	assert.equal(byNumber.get(35).phase.value, "liquid");
	assert.equal(byNumber.get(80).phase.value, "liquid");
	assert.equal(byNumber.get(8).phase.value, "gas");
});

test("the categories carry both interface languages", () => {
	for (const [key, category] of Object.entries(CATEGORIES)) {
		assert.ok(category.en.length > 0, key);
		assert.ok(category.de.length > 0, key);
	}
	assert.equal(CATEGORIES["noble-gas"].de, "Edelgas");
	assert.equal(CATEGORIES.lanthanide.de, "Lanthanoid");
});

test("the atomic weight renders with the decimal separator of the locale", () => {
	assert.deepEqual(atomicWeightText(byNumber.get(29).weight, "en"), { kind: "value", text: "63.546(3)" });
	assert.deepEqual(atomicWeightText(byNumber.get(29).weight, "de"), { kind: "value", text: "63,546(3)" });
	assert.deepEqual(atomicWeightText(byNumber.get(18).weight, "en"), {
		kind: "interval",
		lower: "39.792",
		upper: "39.963",
	});
	assert.deepEqual(atomicWeightText(byNumber.get(18).weight, "de"), {
		kind: "interval",
		lower: "39,792",
		upper: "39,963",
	});
	assert.deepEqual(atomicWeightText(byNumber.get(43).weight, "en"), { kind: "none" });
	assert.deepEqual(atomicWeightText({ kind: "unavailable" }, "de"), { kind: "unavailable" });
});

test("legacy keys resolve to atomic numbers and pseudo-elements do not", () => {
	assert.equal(legacyElementKeyToAtomicNumber("hydrogen"), 1);
	assert.equal(legacyElementKeyToAtomicNumber("eisen"), 26);
	assert.equal(legacyElementKeyToAtomicNumber("Iron"), 26);
	assert.equal(legacyElementKeyToAtomicNumber("Fe"), 26);
	assert.equal(legacyElementKeyToAtomicNumber(" fe "), 26);
	assert.equal(legacyElementKeyToAtomicNumber("aluminium"), 13);
	assert.equal(legacyElementKeyToAtomicNumber("aluminum"), 13);
	assert.equal(legacyElementKeyToAtomicNumber("cesium"), 55);
	assert.equal(legacyElementKeyToAtomicNumber("caesium"), 55);
	assert.equal(legacyElementKeyToAtomicNumber("sulfur"), 16);
	assert.equal(legacyElementKeyToAtomicNumber("sulphur"), 16);
	assert.equal(legacyElementKeyToAtomicNumber("wolfram"), 74);
	assert.equal(legacyElementKeyToAtomicNumber("ununoctium"), 118);
	assert.equal(legacyElementKeyToAtomicNumber("proton"), null);
	assert.equal(legacyElementKeyToAtomicNumber("ununennium"), null);
	assert.equal(legacyElementKeyToAtomicNumber("unobtainium"), null);
	assert.equal(legacyElementKeyToAtomicNumber(""), null);
	assert.equal(legacyElementKeyToAtomicNumber("   "), null);
});

test("every legacy key of the lab widget resolves or is a known pseudo-element", () => {
	const legacyKeys = [
		"hydrogen", "helium", "lithium", "beryllium", "boron", "carbon", "nitrogen", "oxygen",
		"fluorine", "neon", "sodium", "magnesium", "aluminium", "silicon", "phosphorus", "sulfur",
		"chlorine", "argon", "potassium", "calcium", "scandium", "titanium", "vanadium", "chromium",
		"manganese", "iron", "cobalt", "nickel", "copper", "zinc", "gallium", "germanium", "arsenic",
		"selenium", "bromine", "krypton", "rubidium", "strontium", "yttrium", "zirconium", "niobium",
		"molybdenum", "technetium", "ruthenium", "rhodium", "palladium", "silver", "cadmium", "indium",
		"tin", "antimony", "tellurium", "iodine", "xenon", "cesium", "barium", "lanthanum", "cerium",
		"praseodymium", "neodymium", "promethium", "samarium", "europium", "gadolinium", "terbium",
		"dysprosium", "holmium", "erbium", "thulium", "ytterbium", "lutetium", "hafnium", "tantalum",
		"tungsten", "rhenium", "osmium", "iridium", "platinum", "gold", "mercury", "thallium", "lead",
		"bismuth", "polonium", "astatine", "radon", "francium", "radium", "actinium", "thorium",
		"protactinium", "uranium", "neptunium", "plutonium", "americium", "curium", "berkelium",
		"californium", "einsteinium", "fermium", "mendelevium", "nobelium", "lawrencium",
		"rutherfordium", "dubnium", "seaborgium", "bohrium", "hassium", "meitnerium", "darmstadtium",
		"roentgenium", "copernicium", "nihonium", "flerovium", "moscovium", "livermorium", "tennessine",
		"oganesson",
	];
	assert.equal(legacyKeys.length, 118);
	const resolved = legacyKeys.map((key) => legacyElementKeyToAtomicNumber(key));
	assert.deepEqual(resolved, Array.from({ length: 118 }, (_, index) => index + 1));
	assert.equal(legacyElementKeyToAtomicNumber("proton"), null);
	assert.equal(legacyElementKeyToAtomicNumber("ununennium"), null);
});

test("name normalisation folds case, diacritics and separators", () => {
	assert.equal(normalizeElementName("Hydrargyrum"), "hydrargyrum");
	assert.equal(normalizeElementName("  Molybdän "), "molybdan");
	assert.equal(normalizeElementName("Röntgenium"), "rontgenium");
	assert.equal(normalizeElementName("H+"), "h");
});
