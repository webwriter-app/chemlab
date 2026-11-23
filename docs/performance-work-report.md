# ChemLab performance work report

Work report for the packages in the [coding handoff](performance-coding-handoff.md). Every package starts from `4b82c34` on `vibe/perf-packages`, a worktree of the checkout that holds the handoff. Baselines were reproduced on the same machine before the change, alternating baseline and candidate runs.

## Environment

- Node harness: `esbuild --bundle --platform=node --format=esm --external:kekule`, run with `node --import ./tests/dom-shim.mjs`.
- Temporary harness `.perf-bench.ts` is not committed. It parses the JSON data block of a snippet, rebuilds each vessel the way the widget's restore path does, reads `Simulation.getPolyproticEquilibrium` and counts `Molecule.prototype.setSmilesString`.
- Type check: `npx tsc --noEmit`. Tests: the esbuild loop from AGENTS.md. Release build: `npx @webwriter/build` (one shot, no source map). `@webwriter/build` 1.15.0.

## 1. Batch protonation graph construction

`chemlib/Simulation.ts`: the atom and bond copy plus the hydrogen addition in `protonationStructure` run inside `Molecule.batchStructureChanges`, and the finished graph enters the cache after the batch closes. Selection and charges are untouched, and nothing in the block reads the SMILES.

| Fixture | Serializations | Median ms | Chemistry digest |
| --- | ---: | ---: | --- |
| Electrochemistry, before | 352 | 1817.8 | `60699fc5be15fbb2` |
| Electrochemistry, after | 112 | 897.1 | `60699fc5be15fbb2` |
| Titration Types, before | 251 | 1422.5 | `49fc2bffa98f3479` |
| Titration Types, after | 125 | 1011.9 | `49fc2bffa98f3479` |

The digest covers per vessel the liquid volume, pH, species by chemical identity with moles and charge, sediment mass and colour, dissolved and evolved gas, excess charge, liquid phases and the aqueous acid–base metadata of the saved molecules. Both fixtures restore 352 and 251 serializations in the baseline on every run.

Two further probes exercise the paths the fixtures do not isolate. A custom chloroacetic acid (`ClCC(O)=O`, pKa 2.87, absent from the tabulated families) checks proton removal, dosed ammonia checks proton addition, and dosed iron(III) chloride checks an explicitly charged species with its hydrolysis family. Both sides agree on pH, species, sediment, gas, excess charge and metadata; the custom acid reads pH 2.514, ammonia 11.122 and iron(III) chloride 1.644 in both.

Regression: `tests/protonation-batch.test.ts` builds a custom acid and counts graph edits and serializations while the first `getpH` runs. One protonation state needs seven atoms and six bonds, so the assertion `serializations * 4 <= atoms + bonds` fails on the unbatched path (13 serializations) and passes after the change (one). A second test asserts that a repeated read rebuilds nothing.

Verified with `npx tsc --noEmit`, all tests in AGENTS.md, and the release build listing 9.7 MiB for `webwriter-chemlab.js`. The rebuilt bundle differs from the committed one only in this function. The browser check in a local WebWriter import is still pending for this package.

## 2. One advance per physical circuit

Each switched-on instrument used to run its own fixed-step `stepElectrochemistry`, and every one of those calls solved and booked the whole circuit. A supply with a parallel voltmeter therefore advanced the same cell twice per frame, and three instruments three times. The chemistry of a cell no longer belongs to the instrument that happens to hang in it.

`controllers/CircuitSchedule.ts` keeps one `CircuitClock` per physical circuit. The identity is the sorted `${_type}:${_id}/${_connectedMix?._id ?? ""}` list of `ComponentManager.connectedDevices(device)`, or `undefined` when fewer than two devices meet, so a device that hangs in nothing gets no clock of its own. `reconcile()` is idempotent and authoritative: clocks whose identity vanished are closed, survivors keep their phase, new ones start. It runs first inside every clock step, on instrument start and stop, on wiring, bath, removal and layout changes, and `clear()` on a replaced layout.

Instruments keep their `echem<type>:<id>` activation marker, because `hasTask`, the cell current, the popup and the diagram suggestions read it, but they book no chemistry. The one step of a circuit reaches `advanceCircuit(observer)`, and which observer of the circuit does the work is arbitrary: automatic polarity (`openSign * magnitude / transfer`) and `solveCell` are both antisymmetric in the electrode order. A probe drives a bridged Daniell cell under 3 V with the electrodes swapped for `_polarity` 1, 0 and −1 and books the same deposit to a relative difference of 1e-12, with the same terminal voltage and the cell current only changing sign.

Meters without an ionic path keep their own RC transient: they call the new `SimulationController.markRunning(name, live)`, which registers the per-meter closure and runs it once immediately, exactly as before. Their chemistry stays suppressed by the `hasRCReadout` guard, which moved from `stepElectrochemistry` into `advanceCircuit` so it covers the circuit step rather than a meter's own.

| Instruments switched on | Advances per step, before | after |
| --- | ---: | ---: |
| source | 1 | 1 |
| source + parallel voltmeter | 2 | 1 |
| source + voltmeter + ammeter | 3 | 1 |
| two separate circuits | 2 per circuit | 1 per circuit |

Chemistry parity on the same cell (bridged Daniell, 3 V with the plus pole on the copper side, ten steps of 100 ms):

| Run | Zinc deposit after ten steps |
| --- | ---: |
| Scheduled circuit, source plus parallel voltmeter | 1.3795582e-7 mol |
| Reference, ten solves of one source | 1.3795583e-7 mol |
| Twenty solves, the rate the old path produced | 2.7963831e-7 mol |

The scheduled run matches the single solve to 9e-8 relative, and twenty solves turn over 2.027 times as much, so the doubling is measurable in the fixture that used to show it.

Regression: `tests/circuit-schedule.test.ts` counts steps with a stub clock — one clock per circuit whatever hangs in it, separate clocks for separate circuits, a joining instrument keeps the phase, stopping one instrument leaves the circuit running and stopping the last ends it, rewiring splits, `clear()` closes everything — and repeats the deposit comparison above against a direct solve.

Verified with `npx tsc --noEmit`, all 28 test files from AGENTS.md, and the release build. `git diff --stat dist/` lists only `dist/widgets/webwriter-chemlab.js` (156 insertions, 4 deletions), with no source map. The browser check in a local WebWriter import is still pending for this package and for package 1.
