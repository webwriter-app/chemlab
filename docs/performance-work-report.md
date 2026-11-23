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

## 3. Reduce the cost of the single-file widget build

The release imported all of `kekule`, auto-registered every Chart.js component and shipped unminified. Three changes, attributed separately below, take the lab entry from 10,167,091 to 5,055,567 bytes and from 1,915,130 to 1,137,175 bytes gzip.

### Sizes per entry

Release build in the repository root: `npx @webwriter/build` without a subcommand (`@webwriter/build` 1.15.0, resolved from the npx cache), then `node scripts/minify-widgets.mjs`. Node v23.11.0. A size below is the byte length of the committed file and `gzip -9 -c` of that same file, which keeps the original name and modification time in the gzip header; recompressing with `-n` reads a few tens of bytes lower.

| Entry | Raw before | Raw after | gzip before | gzip after | Raw | gzip |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `webwriter-chemlab.js` | 10,167,091 | 5,055,567 | 1,915,130 | 1,137,175 | −50.3 % | −40.6 % |
| `webwriter-chemlab-molecule-builder.js` | 5,343,342 | 2,856,630 | 1,224,646 | 850,694 | −46.5 % | −30.5 % |
| `webwriter-chemlab-periodic-table.js` | 3,851,377 | 1,708,178 | 779,982 | 444,140 | −55.6 % | −43.1 % |

The three CSS files are byte-identical to the previous release at 19,606 bytes each, the entry file names and the `exports` targets in `package.json` are untouched, and no bundle references a source map. Running the two commands again reproduces the same three sizes.

### Where the lab entry's saving comes from

| Step | Raw | gzip |
| --- | ---: | ---: |
| Committed release at `e4bc13f` | 10,167,091 | 1,915,130 |
| Modular Kekulé entries | 8,094,109 | 1,538,535 |
| Explicit Chart.js registration | 7,982,699 | 1,516,624 |
| Minification pass | 5,055,567 | 1,137,175 |

Kekulé accounts for 2.07 MB raw (377 kB gzip), the Chart.js registration for 111 kB (22 kB) and minification for 2.93 MB (379 kB). Only the lab entry imports these two libraries; the other two entries changed by minification alone, which is why their saving matches the last row of this table.

### Modular Kekulé

`chemlib/kekule.ts` imports `kekule/mod/io` for the `Kekule` binding and `kekule/mod/render` for its side effect, which adds `Kekule.Render` and `Kekule.DomUtils`; both entries load their own dependencies, so the pair covers molecule construction, SMILES output and structure drawing. `chemlib/Molecule.ts` and `chemlib/StructureManager.ts` import from `./kekule` instead of from `kekule`, and every other call site keeps its untyped access. The package declares no `sideEffects` field, so the render import survives esbuild's tree shaking.

The probe ran twice in separate Node processes, once against the full `kekule` entry and once against `chemlib/kekule.ts`. Each run built the tabulated acid–base families, charged salt ions and a custom compound, read the canonical SMILES of every result, looked up `Kekule.ElementCategory` for the same symbols, and recorded the presence of `Kekule.Render`, `Kekule.DomUtils` and `Kekule.globalOptions`. The two dumps were identical except for the mode label Kekulé prints for its own entry point.

### Explicit Chart.js registration

`chart.js/auto` registered every controller, scale, element and plugin. The diagrams only draw line datasets on two linear axes with points and rely on the tooltip, so `controllers/diagramChart.ts` registers `LineController`, `LineElement`, `PointElement`, `LinearScale` and `Tooltip`, and `controllers/DiagramController.ts` imports `Chart` from there. The chart configuration is unchanged; options that belong to an unregistered plugin are inert, which is why the hidden legend costs nothing.

`tests/diagram-chart.test.ts` holds the list against `createChart` and asserts the registry contents: controllers `["line"]`, scales `["linear"]`, elements `["line", "point"]`, plugins `["tooltip"]`.

A probe then rendered a real chart with the options `createChart` writes — two linear scales with tick limits and axis titles, layout padding, `interaction: "nearest"` without intersect, the hidden legend, the tooltip with a white surface and a value callback, a line dataset plus the equivalence and half-equivalence marker datasets with the `triangle` and `rectRot` point styles, and a custom `afterLayout` plugin — against a stubbed 2D context. It laid out both scales, produced the marker elements with their configured styles and kept the tooltip enabled.

### Minification

`@webwriter/build` has no minification switch, so `scripts/minify-widgets.mjs` shrinks the finished bundles afterwards. It transforms each `dist/widgets/*.js` on its own with esbuild (`loader: "js"`, `format: "esm"`, `target: "es2022"`, `minify: true`, `legalComments: "eof"`) and writes the result back. Nothing is re-bundled, so the builder's loader rules stay the single source of truth for asset inlining and for the CSS files next to each entry, and no loader-map divergence can appear. The esbuild the script imports ships with the declared `vite` dependency (0.21.5 at the top level); the builder's own nested copy (0.25.12) is not involved. Licence notices from Chart.js, `@kurkle/color` and lit survive as one trailing block comment.

`--keep-names` keeps function and class names for `.name` lookups in diagnostics and costs about 30 kB gzip on the lab entry (1,166,458); it is not the default because nothing in the source compares a name: there is no `===` against a function or class name, and the eight `constructor.name` reads only build diagnostic strings.

### Transfer savings, not startup savings

The figures above are bytes on the wire and in the parse cache. No startup time was measured for this package, because the release build needs a WebWriter import and this environment cannot run one. For orientation only: the audit saw the 1.86 MiB gzip release become ready in 1.0 s on the blank fixture, and the browser spike measured 1.09 MiB gzip for the single-file prototype. The committed release now lands at 1.08 MiB gzip, so the prototype's size is reached; whether the ready time follows it is the open question.

### Packaging scope and open checks

No WebWriter path ran for this package, successfully or otherwise: no import, no packaged load, no export. The packaging surface itself did not change — same three entry files under the same names, same `exports` targets, same CSS companions, no added chunks — only the bytes of the JavaScript differ, and the readable bundles remain available through `npx @webwriter/build dev`. That is why minification was treated as a build step rather than as a change of the default packaging that the handoff gates on browser validation. It still needs the browser pass, and this package inherits the pending checks of the two before it:

- Import all three widgets in a local WebWriter and open the Electrochemistry and Titration Types fixtures.
- Watch the structures paint: the Kekulé painter path, the fallback canvas depiction, and an imported custom compound.
- Draw a pH against delivered volume chart with the equivalence, half-equivalence and neutrality markers, then move the range handles and hover the plot.
- Export or load the packaged widget standalone, and check the atom view of the periodic table.

Shared chunks were deliberately left alone; the handoff keeps them as a separate spike, together with translations and the optional atom renderer.

Verified with `npx tsc --noEmit`, all 29 test files from AGENTS.md, and the two release commands above. The minified and the readable bundle parse and evaluate to the same point under the test DOM shim, and the minified files export `ChemLab`, `ChemLabMoleculeBuilder`, `ChemLabPeriodicTable`, `LIST_ICON` and `TABLE_ICON`, as before.
