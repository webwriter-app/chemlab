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
