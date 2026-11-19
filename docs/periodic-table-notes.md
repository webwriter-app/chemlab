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

## Work package 3: browsing interface

- **The grid is derived, not written.** `periodic-table/layout.ts` builds the display grid from the curated placement table: 18 columns, seven period rows, two detached series rows and the two f-block placeholders at (6, 3) and (7, 3). `cellOf`, `cellAt`, `neighborAtomicNumber`, `firstInRow`, `lastInRow` and `seriesJumpTarget` are pure, so the widget, the keyboard navigation and the tests share one source of truth. A display row is `row + 1` for the main grid and `row + 2` for a series row, because the group-label row and the series gap sit between them.
- **Vertical steps never leave their section.** Up and down scan the rows of the same section for the same column and stop at the boundary instead of wrapping. The two series rows count as one section, so down from lanthanum reaches actinium; the main grid and the series never mix.
- **Search is a fixed tier order.** `periodic-table/search.ts` normalizes query and tokens the same way (NFD, diacritics stripped, case folded, whitespace collapsed), so `molybdan` finds Molybdän. Tiers are `all < number < symbol < name < alias < prefix < substring`, then the interface language, then the atomic number. An all-digit query matches the atomic number exactly and nothing else, which keeps `8` from also listing every element with an 8 in its name. The family filter applies before ranking.
- **The table is an ARIA grid, the list is a list of buttons.** Cells are `role="gridcell"` with `aria-selected` and a roving `tabindex`, activated by click, Enter or Space; the list uses native buttons with `aria-pressed`. That keeps the grid pattern intact for the keyboard work package and avoids a button inside a gridcell, which would announce the selection twice.
- **Layout follows the container, not the viewport.** `auto` resolves against a `ResizeObserver` width on the host and switches to the list below 680 px. The table pane scrolls horizontally instead of shrinking below 30 rem, so a narrow embed keeps readable cells. The detail card moves into the right column from 1000 px container width; below that it stacks under the table, and in list mode it is inserted directly after the selected row.
- **The detail card keeps the epistemic state.** `periodic-table/details.ts` renders group, period, family, block, weight, phase, configuration and shells, and marks a predicted value with a qualifier. A weight interval is bracketed and joined with a comma in English and a semicolon in German, so the separator can never be read as a decimal separator. The sources section groups the fields by the source they came from.
- **The interface language is resolved per render.** `resolveLanguage` walks `parentElement` and leaves a shadow tree through `getRootNode().host`, so the table follows the surrounding content instead of `LitElementWw.lang`, which stops at the shadow boundary.

## Work package 4: accessibility and authoring

- **The key rules are a pure module.** `periodic-table/keyboard.ts` turns a key press into the cell that should take focus, using the same display grid as the renderer. A step keeps walking in the requested direction until it finds an available element or reaches the boundary, so a filtered-out cell is never a focus stop and a step never wraps. Home and End take the first and last available cell of the row, and the two detached series rows count as one section, so down from lanthanum reaches actinium while a step from the main grid never enters the f-block.
- **Only the six navigation keys are consumed.** Enter and Space stay with the native activation of the cell, and a handled arrow, Home or End calls `preventDefault` and `stopPropagation` so WebWriter's own shortcuts do not fire inside the grid. Every other key keeps its default and still reaches the editor. A modifier key is left alone, so Alt+arrow and Ctrl+arrow keep their host meaning.
- **The series jump is navigation, not selection.** The jump buttons move focus to the first member of the series and dispatch no selection event; the tab order follows the jump through a roving override, so Tab returns to the series instead of the previously selected cell.
- **Focus survives a layout change by atomic number.** Before a view switch or a resize that crosses the 680 px breakpoint, the widget records which result owned focus. After the update it restores that element only while it is still part of the results, otherwise the search field is the fallback. A click on a toolbar control leaves focus where the user put it, because no result owned it.
- **A focused cell is revealed inside the widget.** `#reveal` adjusts the scroll offsets of the table pane instead of calling `scrollIntoView`, so restoring focus never scrolls the worksheet around the widget.
- **The language observer follows the same walk as the resolver.** `languageAncestors` returns the node chain `resolveLanguage` visits, and the widget observes each element of that chain for `lang` changes. A language switch on the worksheet or on an enclosing section re-renders the table while keeping the selection and the query.
- **Printing uses one noninteractive overview.** The overview is always in the DOM, hidden on screen and hidden from assistive technology, and shows the complete grid plus the selected details. `@media print` covers exported HTML and `:host(.ww-beforeprint)` covers WebWriter's print preview; both hide the toolbar, the result count, the table pane, the detail pane, the series jumps and the legend, so a narrow instance that defaults to the list still prints the grid.

## Work package 5: worksheet routing and the table-only snippet

- **The router is a module, not widget code.** `periodic-table/routing.ts` binds a receiver to one table by host ID and delivers only validated selections of that table. The picker and the lab actions stay in their own work packages; this module is what both will use.
- **The binding is resolved against an explicit worksheet root.** `resolveSource` lists the elements of the expected tag and compares the ID literally, so a duplicate ID resolves to nothing instead of to the first hit, and a wrong widget type never binds. An empty ID never binds.
- **Every delivery is re-checked synchronously.** The listener compares `composedPath()[0]` with the resolved source, so an event that bubbles out of a child of the table is rejected even when it carries the right `sourceId`. It then re-resolves the binding and validates the payload, so a stale listener cannot deliver after a duplicate, a removal or a rebind in the same task.
- **The payload check is the same one the widget uses.** `isSelectionPayload` accepts version 1 with `null` or an atomic number from 1 to 118 and an optional string `sourceId`; everything else is dropped without a delivery.
- **One listener per binding.** Rebinding detaches the previous listener, and `dispose` detaches and disconnects the observer. A receiver therefore counts one delivery per change, also after a removal and a reconnection.
- **The observer is injectable.** The default watches the worksheet for child, ID and binding changes with a `MutationObserver`; a host without one still binds, it just does not refresh by itself. The tests drive refreshes through a fake observer, because the Node environment has no DOM.
- **The snippet is table-only.** `snippets/Beispiel-Periodensystem.html` holds one `webwriter-chemlab-periodic-table` with `initial-element="8"` and `view="auto"` and no `lang` attribute, so the table inherits the language of the surrounding content. It loads no simulation assets: the entry imports only `periodic-table/` and `data/periodic-table/`.
- **The snippet needs both registrations.** The file is listed under `exports` and carries a `label` in `editingConfig`; without either it does not appear in WebWriter.

## Open checks awaiting a manual WebWriter import

- WebWriter version and the observed save/reopen behaviour of `initial-element` and `view`.
- Whether the editor writes `initial-element=""` or removes the attribute when the number field is emptied.
- Whether the widget ID survives save, reopen, duplicate, paste and undo/redo, which the worksheet linking fixture depends on.
