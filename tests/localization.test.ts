import assert from "node:assert/strict";
import { test } from "node:test";
import { translate } from "../localization/localization";

test("unknown language uses English and explicit German still uses German", () => {
    const label = "ChemLab wird geladen";
    assert.equal(translate(label, ""), "Loading ChemLab");
    assert.equal(translate(label, "de"), label);
    assert.equal(translate(label, "fr"), "Chargement de ChemLab");
});
