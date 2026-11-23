# ChemLab performance coding handoff

This handoff follows the startup audit at `53c9b9a`. Use it to implement and verify the next changes in ChemLab. The [previous implementation plan](performance-implementation-plan.md) describes earlier work on the ticker, recorder, charts, and palette.

## Work order

| Order | Work package | When it is done |
| --- | --- | --- |
| 1 | Batch protonation graph construction | Startup does fewer SMILES serializations and the restored chemistry matches. |
| 2 | Advance each physical electrical circuit once per simulation step | Switching on a meter attached to an active circuit leaves reaction progress unchanged. |
| 3 | Reduce the cost of the single-file widget build | The measured size benefit survives WebWriter import, export, and chemistry or chart checks. |
| 4 | Load only textures needed for the initial layout | First placement, document updates, and restored layouts still work with a cold asset cache. |
| 5 | Defer analysis of saved custom compounds | The worksheet mounts with the same custom entries and permissions, and dosing hydrates a recipe on demand. |

Start with package 1. Packages 3–5 can be developed independently once the baseline is captured. Keep each verified package in its own commit and follow [AGENTS.md](../AGENTS.md) for build, test, and push instructions. Start from the current checkout, record its revision, and check for unrelated work before staging changes.

## Baseline and measurement

The audit loaded the built release widget in local headless Firefox 160 with software WebGL and DPR 1. Each row is the median of three fresh page loads from a local server. The ready time ends when ChemLab clears the loading state after its first canvas render.

| Fixture | Canvas ready | CPU time preparing saved models |
| --- | ---: | ---: |
| Blank ChemLab | 1.0 s | — |
| [Electrochemistry](../snippets/Beispiel-Elektrochemie.html) | 2.3 s | 1.15 s |
| [Titration Types](../snippets/Beispiel-Titrationstypen.html) | 3.1 s | 1.76 s |

Use those figures to choose what to investigate. Set acceptance against a baseline you reproduce on the same machine. Keep the release build and the dev build with inline source maps separate in results. Use identical fixtures, browser settings, and cache conditions for both sides of a comparison. Alternate baseline and candidate runs and record the median and spread. When timings vary, prefer repeatable counts such as SMILES serializations, textures awaited, and reaction steps.

Keep instrumentation in a temporary fixture or behind a development-only switch. Capture module request and execution, Pixi initialization, texture readiness, saved-model preparation, scene and cable assembly, initial measurement recording, first render, and time until input works. Count authored entries and rendered objects separately. The Electrochemistry fixture has 115 saved entries and restores 144 objects after wiring. Verify the final interaction in a local WebWriter import as well. Headless timings describe the fixture, while the editor adds its own loading and embedding costs.

## 1. Batch protonation graph construction

**Evidence.** A browser prototype reduced Electrochemistry startup from 388 to 148 SMILES serialization calls and Titration Types from 351 to 225. In four warmed Node runs per variant, legacy vessel preparation fell from 1,439 to 671 ms for Electrochemistry and from 1,128 to 640 ms for Titration Types. The Node comparison excluded rendering, saved doses, and the electrical models. The normalized before-and-after chemistry snapshots matched.

**Implementation**

1. In [`protonationStructure`](../chemlib/Simulation.ts#L340), retain the existing protonation-site selection, charge calculation, and cache. Wrap the block that copies atoms and bonds and adds hydrogens in the existing [`Molecule.batchStructureChanges`](../chemlib/Molecule.ts#L152). Store the finished graph in the cache after the batch closes.
2. Follow the existing use in [`loadMoleculeDefinition`](../data/moleculeDefinition.ts#L5). The batch keeps structural edits and atom charges available while deferring SMILES generation. Confirm that the wrapped block has no intermediate SMILES consumer.
3. Compare restored per-vessel pH, liquid volume, and species by chemical identity, moles, and charge. Include sediment, gas, and custom acid–base metadata. Compare canonical values independently of runtime IDs and depiction coordinates. Exercise both proton removal and proton addition, plus an explicitly charged species.
4. Profile again. If graph building remains the main cost, test `makeSolidSalt` separately on a precipitation-heavy fixture. A later pass can screen unusable states before graph creation in [`saltIons`](../chemlib/Simulation.ts#L718), provided it preserves computed conjugate ions used by precipitation, conductivity, and electrode potentials. Measure any recipe caching separately and keep live mixtures independent.

**Acceptance.** Run the acid–base, electrochemistry, titration, and saved-mixture tests. The main fixtures should show substantially fewer startup serializations without a chemistry or initial-reading difference. Include operation counts and timings in the work report.

## 2. Advance the circuit once per simulation step

**Evidence.** An isolated reproduction used a fixed graphite/NaCl circuit with a source and an already-wired parallel voltmeter. Active source alone ran 10 reaction steps and produced 2.59 µmol dissolved H₂ in one simulated second. With both instruments active, it ran 20 steps and produced 5.18 µmol. The underlying paths are [experiment start](../webwriter-chemlab.ts#L1090), the [fixed-step scheduler](../controllers/SimulationController.ts#L79), and [`stepElectrochemistry`](../webwriter-chemlab.ts#L1002).

**Implementation**

1. Turn the reproduction into a regression test. Keep wiring, solution, source settings, and simulated elapsed time identical. Toggle only the already-wired meter. Count actual cell advances and compare gas, dissolved inventory, and voltage.
2. Schedule ordinary electrochemical advancement with one owner per physical connected circuit. Resolve the actual connected topology and use a stable circuit identity while it is unchanged. Keep device activation available to controls, readings, and diagram suggestions. Starting a second observer should leave the existing circuit clock running at its current phase.
3. Handle rewiring, source or meter removal, solution changes, and merges or splits of a network. Invalidate the grouping when its defining connections or bath attachments change. Independent circuits must still advance independently. De-duplicate per fixed simulation step, since one browser frame can legitimately process several steps after a delay.
4. Preserve the no-ionic-path RC path and its history. Check the handoff when a bridge is placed or removed and the case of a meter-only galvanic cell. Preserve the current per-instrument availability behavior and record each circuit's results on a shared time snapshot.

**Acceptance.** A parallel meter toggle changes the available readout and leaves the chemistry trajectory unchanged. Two separate active cells each advance at the normal rate. Existing RC and reference-electrode tests pass, including rewiring and stopping the last instrument. Verify a representative circuit through the normal canvas controls.

## 3. Reduce the single-file build

**Evidence.** The main release bundle was 9.7 MiB raw and 1.86 MiB gzip. The dev build with inline source maps was about 32 MiB raw. A temporary single-file build using supported modular Kekulé imports, explicit Chart.js registration, and minification reached 1.09 MiB gzip. The modular Kekulé experiment passed the acid–base and electrochemistry audit suites. Package loading and browser depiction still need verification.

**Implementation**

1. Reproduce the current WebWriter build and collect raw, gzip, and bundle-module sizes for all three entries. Keep local developer mapping and preview requirements separate from release settings. Record the exact build command and installed build-tool version.
2. Test the supported modular Kekulé entry points against [molecule construction and serialization](../chemlib/Molecule.ts#L129) and [structure rendering](../chemlib/StructureManager.ts#L630). Check canonical SMILES, charged and ionic graphs, the fallback canvas depiction, and imported or custom compounds in the browser.
3. Replace [Chart.js auto-registration](../controllers/DiagramController.ts#L4) only after enumerating the actual registered features. Test line and linear scales, point and line styles, tooltips, and ChemLab's markers, range controls, and chart updates. Measure this change separately from Kekulé and minification.
4. Validate the resulting single-file release in WebWriter. If read-time cost still matters, spike shared chunks separately. The default bundler inlines source-level dynamic imports. A shared-chunk candidate needs successful local import, packaged load, standalone or offline export, and cache behavior with multiple widgets. Test locale fallback and language changes before moving translations into separate chunks. The [periodic table's atom renderer](../molecule-builder/atomic-figure.ts#L91) is a strong candidate for that later spike because its 3D view is optional.

**Acceptance.** Report exact per-widget sizes before and after, distinguish transfer savings from measured startup savings, and document which WebWriter paths ran successfully before changing the default packaging.

## 4. Load startup textures selectively

The browser spike reduced the Electrochemistry fixture's initial textures from 18 to 10 and the blank lab's from 18 to zero. The texture stage saved tens of milliseconds. Treat this as a smaller startup improvement than chemistry or packaging.

1. Replace the full catalog load in [`CanvasController.init`](../controllers/CanvasController.ts#L1280) with unique URLs derived from the authored layout. Share resolution with [`componentGraphic`](../data/componentGraphics.ts#L246) and reproduce variant validation in [`createSavedComponent`](../webwriter-chemlab.ts#L2378). Include legacy defaults and variant-specific artwork. Procedural cables require no texture.
2. Start asset preparation alongside renderer initialization where supported. Keep progress and error handling meaningful for an empty request, failures, and remote layout replacement. Confirm the assets still match the latest layout before assembling it. Retain shared Pixi cache ownership across widgets.
3. Cover first palette preview, drag, and click placement in a cold session. [Placement previews](../controllers/CanvasController.ts#L857) assume texture availability. Prefetch or await the needed asset through a shared loader and explicitly handle cancellation, failed loads, and widget detach.
4. Test a blank lab, both saved fixtures, a legacy setup, an explicit cable setup, first placement from each device family, and a worksheet edit that introduces a previously unloaded device variant.

**Acceptance.** The blank lab becomes ready with zero component texture requests. The Electrochemistry fixture renders and wires the same objects. An unloaded palette item works on its first placement. Missing artwork presents the existing error or a deliberate fallback and leaves the widget usable.

## 5. Defer saved custom compound analysis

A warmed Node run took about 0.8 s to restore 30 portable metadata records. The standard fixtures have no such records. The eager path is [authored data restore](../webwriter-chemlab.ts#L755) into [`readBuilderChemical`](../molecule-builder/custom-compounds.ts#L201), which rebuilds the lab graph to analyze the structure and derive its recipe.

1. Keep lightweight structure and metadata validation during restore. Separate it from graph analysis and dose construction. Use validated display fields for the initial palette and preserve legacy references, learner permissions, and the saved worksheet format.
2. Hydrate and cache heavy analysis per validated compound on first use. Start hydration where the existing UI needs it and share in-flight work across preview and dosing. Revalidate at the boundary before a stock can be dosed. Invalidate the cache on edits or removal and close the loop on failed analysis.
3. Exercise first view, search, click dosing, drag dosing, save/load, learner access, and the original builder handoff. Ensure measured or manual pKa values survive the round trip and yield the same stock pH. Use a fixture with many saved compounds to measure startup and the latency of the first use.

## Verification and handoff

Run `npx tsc --noEmit`, the test loop in [AGENTS.md](../AGENTS.md), and the WebWriter build for every code package. Add focused regressions for new behavior that the current suite cannot detect. Record the commit, fixture and environment, commands run, metrics, and any WebWriter checks that remain pending. Keep the audit measurements and implementation commits distinguishable from exploratory profiling changes.

For focused checks while iterating, start with `molecule-definition.test.ts`, `acid-base-equilibrium.test.ts`, `titration-types.test.ts`, and `saved-mixtures.test.ts` for graph batching. Run `electrochemistry-audit.test.ts`, `no-ionic-path.test.ts`, and `measurement-history.test.ts` for circuit scheduling. Use `structure-diagram.test.ts`, `diagram-ranges.test.ts`, and `titration-points.test.ts` when changing the bundle, and `builder-compounds.test.ts`, `compound-metadata.test.ts`, and `saved-mixtures.test.ts` when deferring custom-compound analysis. The [worksheet browser fixture](../tests/fixtures/worksheet.html) can help reproduce browser behavior before the WebWriter check.

After these packages, profile any remaining work separately. Candidates include longer chart sessions, repeated IUPAC CSV scans for the same compound, suggestion recomputation on unrelated UI updates, wetting scans across unchanged vessels, and offscreen companion rendering. The existing [performance plan](performance-implementation-plan.md) gives the surrounding design and earlier results.
