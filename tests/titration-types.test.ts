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
	// At 5 mL both HCl titrations have about 5 mmol excess strong acid in 15 mL.
	{ volumes: [10], pH: [7], halfPH: [0.4771], neutralMl: 10 },
	{ volumes: [10], pH: [4.775], halfPH: [0.4771], neutralMl: 10.056 },
	{ volumes: [10], pH: [9.224], halfPH: [4.75], neutralMl: 9.944 },
	{ volumes: [10], pH: [7], halfPH: [4.75], neutralMl: 10 },
	{ volumes: [10], pH: [8.734], halfPH: [3.77], neutralMl: 9.994 },
	// The third phosphate equivalent at 30 mL falls on a broad shoulder
	// in the simulated aqueous trace, which does not give a resolved peak.
	// Free H+ in the first phosphate buffer shifts its pH above pKa1 (2.15).
	{ volumes: [10, 20], pH: [4.683, 9.766], halfPH: [2.168, 7.21], neutralMl: 13.815 },
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
			recorder.record([burette, beaker], [], { source: burette, target: beaker, volume });
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
		for (const [i, { volume, pH }] of halfEquivalences.entries()) {
			assert.ok(Math.abs(volume - ((reference.volumes[i - 1] ?? 0) + reference.volumes[i]) / 2) < 0.005);
			assert.ok(Math.abs(pH - reference.halfPH[i]) < 0.005,
				`Expected pH ${reference.halfPH[i]} near ${volume.toFixed(3)} mL, got ${pH}`);
		}

		const neutral = markers.filter(marker => marker.kind === "neutral");
		assert.equal(neutral.length, 1);
		assert.equal(neutral[0].pH, 7);
		assert.ok(Math.abs(neutral[0].volume - reference.neutralMl) < 0.1);
	});
}

test("acetic acid and ammonia show half-equivalence after the 0 mL sample expires", t => {
	const [receiver, titrant] = availableComponents.slice(6, 8);
	const beaker = vessel(ComponentType.Beaker, receiver);
	const burette = vessel(ComponentType.Burette, titrant);
	burette.setBuretteStepMl(0.3);
	const host = { addController() {}, allEComponents: [] } as unknown as ConstructorParameters<typeof MeasurementRecorder>[0];
	const recorder = new MeasurementRecorder(host);
	const { history } = recorder;
	let time = 1;
	t.mock.method(history, "now", () => time);
	recorder.record([beaker, burette]);
	time = 301_000;
	history.prune();
	for (let i = 0; i < 61; i++) {
		const volume = burette.transferContents({}, beaker) * 1000;
		recorder.record([burette, beaker], [], { source: burette, target: beaker, volume });
		time += 100;
	}

	const volume = history.channels.find(channel => channel.quantity === "Abgegebenes Volumen");
	const pH = history.channels.find(channel => channel.component === "beaker" && channel.quantity === "pH");
	const points = history.points(volume.id, pH.id);
	assert.ok(Math.abs(points[0].x - 0.3) < 1e-9);
	const firstDoseTime = recorder.firstTitrationDoseTime(volume.id, pH.id);
	assert.equal(firstDoseTime, points[0].time);
	assert.equal(recorder.firstTitrationDoseTime(volume.id, "different-beaker/pH"), undefined);
	const half = titrationPoints(points, "y", firstDoseTime).find(marker => marker.kind === "half-equivalence");
	assert.ok(half);
	assert.ok(Math.abs(half.volume - 5) < 0.02);
	assert.ok(Math.abs(half.pH - 4.75) < 0.005);
});
