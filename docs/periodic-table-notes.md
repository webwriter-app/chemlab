# Periodic table implementation notes

Observations made while implementing the [handoff](periodic-table-implementation.md). The handoff and the [product plan](periodic-table-mvp.md) stay the specification; this file records what the installed toolchain and the host actually do.

## Environment

| Item | Version |
| --- | --- |
| `lit` | 3.2.1 |
| `@webwriter/lit` | 2.1.6 |
| `typescript` | 5.8 |
| Decorators | TC39 standard (`experimentalDecorators: false`) |
| Class fields | `useDefineForClassFields: true` |

## Work package 1: entry point and contract

- **A getter/setter pair cannot carry `@property`.** `@lit/reactive-element`'s standard decorator only accepts `kind: "accessor"` and `kind: "setter"` and throws `Unsupported decorator location: getter` for a pair. `selectedAtomicNumber` therefore registers through `static properties` and keeps a prototype accessor pair. `ReactiveElement.getPropertyDescriptor` wraps an existing accessor instead of replacing it, so the validating setter still runs and `requestUpdate` is still called.
- **Lit derives the attribute name from the property name.** The default is the lowercased property name, which is why the existing options are saved as `enablexapi` and `newsmilesdrawer`. `initial-element` needs an explicit `attribute: "initial-element"` in both the `@property` declaration and the option record.
- **A pre-upgrade write survives.** `ReactiveElement` copies own properties of registered reactive properties in its constructor and applies them in the first `performUpdate`, before `willUpdate`. The authored default is applied in `willUpdate`, so a host write made before `customElements.define` reaches the validating setter first and wins, including a deliberate `null`.
- **`connectedCallback` re-sets every attribute.** `LitElementWw` does `getAttributeNames().forEach(k => setAttribute(k, getAttribute(k)))`. The DOM's change-an-attribute algorithm returns early for an unchanged value, so `attributeChangedCallback` and the converter do not run a second time.
- **`LitElementWw.lang` does not cross shadow hosts.** Its getter reads `this.#lang` or `parentElement.closest("[lang]")`. The table needs its own resolver that walks `getRootNode().host`, as the handoff requires.
- **The table entry stays small.** An esbuild bundle of `webwriter-chemlab-periodic-table.ts` is 67.6 kB and contains no Pixi, Chart.js, ChemLib or Kekule module.
- **Clearing a number option.** The editor's behaviour for an empty number field is unverified without a manual import. `clearInitialElement()` is registered as an author action and removes `initial-element`, so the option can be cleared either way.

## Work package 2: reference data and generation

- **Three pinned inputs, one generated module.** `data/periodic-table/sources/` holds the PSE-info element database (MIT), the CIAAW standard atomic weights 2024 and the NIST ground-state configurations. `sources.json` records publisher, URL, release, retrieval date, redistribution terms and a SHA-256 digest per file; the generator refuses to run when a digest does not match. `node scripts/generate-periodic-table.mjs` writes `data/periodic-table/elements.generated.ts`, `--check` compares it byte for byte.
- **CIAAW is the weight authority, PSE-info the placement source.** The two disagree on six weights (F, P, Cs rounding, Zr 91.224 vs 91.222, Gd 157.25 vs 157.249, Lu 174.9668 vs 174.96669); CIAAW wins. Symbols and English names agree except for aluminium, where PSE-info writes "Aluminum"; the CIAAW spelling is canonical and the PSE-info variant is kept as an alias.
- **The NIST cross-check found exactly one configuration error.** All 99 covered elements agree with PSE-info except helium, which the source lists as `1s[1]`. The curation table overrides it to `1s[2]` and the generator compares the expanded subshell occupation, not the written order: the source writes `[Rn] 5f14 6d1 7s2` where NIST lists 4f before 5s.
- **Palladium breaks the shell-count rule.** `[Kr] 4d10` leaves the fifth shell empty, so the shell list is one shorter than the period. The generator only requires `shells.length <= period`.
- **Group 3 is left open on purpose.** Groups 1, 2 and 4–18 come from the source. Sc and Y are reported as group 3; La, Ac, Lu and Lr are `convention-dependent`, because the source's 32-column layout puts La and Ac there while the 2021 IUPAC project report recommends Lu and Lr. The remaining f-block members are `unassigned`. The display keeps a placeholder at (6, 3) and (7, 3) and detaches the series, so it does not assert either reading.
- **Prediction policy.** Configurations count as `reported` up to Z = 99, the range the NIST check covers, and as `predicted` from fermium on. Phases count as `predicted` from rutherfordium on; where the source has no phase at all the value stays `unavailable`. Oganesson is the only transactinide with a phase value, so it is the only predicted phase in the bundle.
- **Placement is a reviewable table, not a formula.** `curation.json` carries one `{row, column, category}` entry per atomic number plus the frame (18 columns, 7 period rows, two series rows, two placeholders). The generator validates uniqueness, ranges, the period of every main-grid row and the order inside each series row.
- **The legacy adapter stays outside the entry.** `periodic-table/legacy-names.ts` resolves the lowercase English keys of `chemlib/ElementData.ts`, German names, symbols and curated aliases, and returns `null` for `proton` and `ununennium`. All 118 legacy keys resolve to their atomic number.
- **`tsconfig.json` now includes the new directories.** `periodic-table/**/*.ts` and `data/periodic-table/**/*.ts` are listed explicitly, because the generated data is only reachable through a type-only import until the browsing UI lands.

## Open checks awaiting a manual WebWriter import

- WebWriter version and the observed save/reopen behaviour of `initial-element` and `view`.
- Whether the editor writes `initial-element=""` or removes the attribute when the number field is emptied.
- Whether the widget ID survives save, reopen, duplicate, paste and undo/redo, which the worksheet linking fixture depends on.
