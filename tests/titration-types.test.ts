import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ComponentManager, ComponentType, StructureManager } from "../chemlib";
import { MeasurementRecorder } from "../controllers/MeasurementRecorder";
import type { MoleculeDefinition } from "../data/chemicals";
import { loadMoleculeDefinition } from "../data/moleculeDefinition";
import { titrationPoints } from "../data/titrationPoints";

type Vessel = { content: string; vol: number; capacityMl: number };
const html = readFileSync("snippets/Beispiel-Titrationstypen.html", "utf8");
const { availableComponents, availableMixtures, availableMolecules } = JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/s)[1]) as {
	availableComponents: Vessel[];
	availableMixtures: { name: string; content: string[] }[];
	availableMolecules: MoleculeDefinition[];
};

function vessel(type: ComponentType, config: Vessel) {
	const mix = StructureManager.newMixture();
	const definition = availableMixtures.find(item => item.name === config.content);
	for (const piece of definition.content) {
		const [formula, amount] = piece.split(":");
		const molecule = loadMoleculeDefinition(availableMolecules.find(item => item.formula === formula));
		mix.addMolecule(molecule, Number(amount) * config.vol);
	}
	const component = ComponentManager.newChemComponent(type);
	component._volume = config.capacityMl;
	component.addContents({ nMix: mix });
	return component;
}

const expected = [
	{ volumes: [10], pH: [7], neutralMl: 10 },
	{ volumes: [10], pH: [4.775], neutralMl: 10.056 },
	{ volumes: [10], pH: [9.224], neutralMl: 9.944 },
	{ volumes: [10], pH: [7], neutralMl: 10 },
	{ volumes: [10], pH: [8.734], neutralMl: 9.994 },
	// The third phosphate equivalent at 30 mL falls on a broad shoulder
	// in the simulated aqueous trace, which does not give a resolved peak.
	{ volumes: [10, 20], pH: [4.683, 9.766], neutralMl: 13.815 },
];

for (const [index, reference] of expected.entries()) {
	const [receiver, titrant] = availableComponents.slice(index * 2, index * 2 + 2);
	test(`Titration Types · ${receiver.content} + ${titrant.content}`, t => {
		const beaker = vessel(ComponentType.Beaker, receiver);
		const burette = vessel(ComponentType.Burette, titrant);
		const host = { addController() {}, allEComponents: [] } as unknown as ConstructorParameters<typeof MeasurementRecorder>[0];
		const recorder = new MeasurementRecorder(host);
		recorder.record([beaker, burette]);
		while (burette._content.contentVolume > 1e-12) {
			const volume = burette.transferContents({}, beaker) * 1000;
			assert.ok(volume > 0);
			recorder.record([burette, beaker], [], { source: burette, volume });
		}

		const { history } = recorder;
		const x = history.channels.find(channel => channel.quantity === "Abgegebenes Volumen");
		const y = history.channels.find(channel => channel.component === "beaker" && channel.quantity === "pH");
		const points = history.points(x.id, y.id);
		const markers = titrationPoints(points, "y");
		t.diagnostic(markers.map(({ kind, volume, pH }) => `${kind}: ${volume.toFixed(4)} mL, pH ${pH.toFixed(4)}`).join(" | "));

		const equivalences = markers.filter(marker => marker.kind === "equivalence");
		assert.equal(equivalences.length, reference.volumes.length);
		for (const [i, { volume, pH }] of equivalences.entries()) {
			assert.ok(Math.abs(volume - reference.volumes[i]) < 0.005);
			assert.ok(Math.abs(pH - reference.pH[i]) < 0.03);
		}
		const halfEquivalences = markers.filter(marker => marker.kind === "half-equivalence");
		assert.equal(halfEquivalences.length, reference.volumes.length);
		for (const [i, { volume }] of halfEquivalences.entries()) {
			assert.ok(Math.abs(volume - ((reference.volumes[i - 1] ?? 0) + reference.volumes[i]) / 2) < 0.005);
		}

		const neutral = markers.filter(marker => marker.kind === "neutral");
		assert.equal(neutral.length, 1);
		assert.equal(neutral[0].pH, 7);
		assert.ok(Math.abs(neutral[0].volume - reference.neutralMl) < 0.1);
	});
}
