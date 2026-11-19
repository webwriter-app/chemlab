# Periodic table MVP implementation handoff

Implement the [MVP product plan](periodic-table-mvp.md) in the ChemLab checkout. The deliverable is a standalone, bilingual WebWriter periodic table, a table-only worksheet snippet and a tested selection contract. Validate integration with ChemLab and molecule-builder stubs. Real receivers and the linked three-widget lesson follow in a separate release. Keep the current lab widget and its snippets compatible.

## 1. Entry point and WebWriter verification

Start by reading the repository [AGENTS.md](../AGENTS.md). Use the existing root npm package and dependency versions. The `dev` script currently launches Vite. Use `npm ci` and `npx @webwriter/build dev` in the repository root for the actual widget workflow. The product check takes place through WebWriter's local package import.

Reserve `webwriter-chemlab-periodic-table` for the tag, source entry and built export. The published `@webwriter/chemdraw` package already uses `webwriter-periodic-table`. Include Chemdraw in the local WebWriter smoke test and verify that both tables can be inserted into the same worksheet with independent behavior, including after reopening it. [Chemdraw package API](https://www.npmjs.com/package/@webwriter/chemdraw)

| Proposed path | Responsibility |
| --- | --- |
| `webwriter-chemlab-periodic-table.ts` | Register `webwriter-chemlab-periodic-table`, declare WebWriter options and own widget state, rendering and lifecycle. |
| `periodic-table/element-reference.ts` | Reference types, generated data import, indexed access by atomic number. |
| `periodic-table/selection.ts` | Dependency-free selection event name, payload and runtime validators. |
| `periodic-table/layout.ts` | Display coordinates, category keys and pure keyboard-neighbor calculation. |
| `periodic-table/search.ts` | Localized search indexing, normalization and result ranking. |
| `periodic-table/strings.ts`, `periodic-table/styles.ts` | EN/DE interface strings, container layout, category tokens and focus. |
| `data/periodic-table/`, `scripts/generate-periodic-table.mjs` | Approved source inputs, attribution, generated bundle and reproducible generation. |
| `tests/periodic-table-*.test.ts`, `tests/fixtures/` | Pure logic tests and a small integration fixture for real custom events and widget references. |
| `snippets/Beispiel-Periodensystem.html` | Standalone example with oxygen selected, automatic layout, and the worksheet language inherited. |

Add `./widgets/webwriter-chemlab-periodic-table.*` to `package.json#exports` with `source: "./webwriter-chemlab-periodic-table.ts"` and `default: "./dist/widgets/webwriter-chemlab-periodic-table.*"`. Add `editingConfig["./widgets/webwriter-chemlab-periodic-table"].label` with English, German and `_` fallback. Add the root entry to `tsconfig.json#include`, which currently names the ChemLab entry explicitly. Export the snippet and register its separate editing label in the final work package. Copy the structure of existing exports and generate the snippet markup from a real WebWriter save. [WebWriter package configuration](https://webwriter.app/docs/packages/configuring/) · [Snippet configuration](https://webwriter.app/docs/snippets/configuring/)

Build the first spike with a small temporary element fixture and both widget entries. Use `LitElementWw`, the same custom-element decorator and the scoped Shoelace import pattern in [webwriter-chemlab.ts](../webwriter-chemlab.ts). Import only the Shoelace components used by the table. Check standalone insertion, insertion beside ChemLab, two tables in one worksheet, and preview/export. Save a worksheet with an authored option, inspect it using Edit source and reopen it. Record the WebWriter version and any assumptions that the build or editor disproves. [WebWriter saving and editing](https://webwriter.app/docs/widgets/editingandsaving/)

Use ChemLab's `static options` and instance `options` pattern. Start with a number option for the initial element (1–118, step 1, blank for no selection) and a select option for the layout. Verify how the editor maps these property names to the saved attributes. If the native number option cannot be cleared, provide an author-only clear action that removes `initial-element`. Check that a saved widget can be reopened without the test fixture. Keep temporary data and stub tags out of the exported worksheet.

## 2. Reference data and reproducible generation

Use an atomic-number keyed, read-only bundle with one record for each Z from 1 to 118. Keep positions and teaching categories in human-reviewable tables, separate from scientific group and phase. Expose `elementByAtomicNumber(z)` from a lightweight module. Keep compatibility with [ChemLab's ElementData](../chemlib/ElementData.ts) through a later-facing, pure adapter from legacy names to Z, with explicit aliases and an unavailable result for unknown or pseudo-elements. Place the adapter outside the table entry's imports and leave legacy keys in saved ChemLab documents.

Suggested generated schema:

```ts
type SourceId = string
type Provenance = { sourceId: SourceId; locator?: string }
type DataValue<T> =
  | { status: 'reported' | 'predicted'; value: T; provenance: Provenance }
  | { status: 'unavailable'; provenance?: Provenance }

type GroupAssignment =
  | DataValue<number>
  | { status: 'unassigned' | 'convention-dependent'; provenance: Provenance }

type StandardAtomicWeight =
  | { kind: 'value'; decimal: string; uncertaintyDigits?: string; noteCodes?: readonly string[]; provenance: Provenance }
  | { kind: 'interval'; lower: string; upper: string; noteCodes?: readonly string[]; provenance: Provenance }
  | { kind: 'none'; provenance: Provenance }
  | { kind: 'unavailable' }

type ElementReference = {
  atomicNumber: number
  symbol: string
  names: { en: string; de: string }
  aliases?: Partial<Record<'en' | 'de', readonly string[]>>
  identitySources: { iupac: Provenance; germanName: Provenance }
  period: number
  group: GroupAssignment
  block: DataValue<'s' | 'p' | 'd' | 'f'>
  weight: StandardAtomicWeight
  configuration: DataValue<string>
  phase: DataValue<'solid' | 'liquid' | 'gas'>
}
```

Declare phase temperature and pressure once in bundle metadata. Source metadata records publisher, exact artifact or table URL, release date or revision, retrieval date and redistribution terms. Record a SHA-256 digest for each vendored generator input. Keep the data version separate from the schema version so a new source edition can update data without changing the contract.

| Field | Source and import decision |
| --- | --- |
| Identity | Check Z, symbol and English name against IUPAC. Record the source for German names separately. Start with the MIT-labeled PSE-info data as a candidate and review its exact revision and field provenance. Record curated search aliases as project data. |
| Standard atomic weight | Use CIAAW as the authority. Preserve decimal strings, parenthesized uncertainty digits and relevant note codes. Present the weight as dimensionless. Use locale decimal separators and separate interval endpoints unambiguously in both locales. Display “No standard atomic weight” separately from “Unavailable”. Keep isotope mass numbers out of this field. |
| Phase | Describe the elemental substance at 25 °C and 1 bar. Show conditions alongside the value and record the reference form where relevant. The PSE-info input's bare phase field carries no explicit conditions. Use it only with supporting evidence for these conditions. |
| Electron configuration | Use neutral ground-state configurations. Cross-check candidates against the NIST Atomic Spectra Database where available. Represent reported, predicted and unavailable states separately. |
| Placement and family | Save a local, documented classification and layout convention with the bundle. Preserve the distinction between an unassigned group, a convention-dependent assignment and missing data. |

See [IUPAC periodic table](https://iupac.org/what-we-do/periodic-table-of-elements/), [CIAAW standard atomic weights](https://www.ciaaw.org/atomic-weights.htm), [PSE-info data and license](https://pse-info.de/en/data), [PSE-info raw data](https://github.com/komed3/periodic-table/blob/master/_db/elements.json), and [NIST ground-state data definitions](https://physics.nist.gov/PhysRefData/ASD/Html/iehelp.html).

Use `node scripts/generate-periodic-table.mjs` and `--check` for regeneration and validation. Prefer pinned, redistribution-approved inputs checked into the repo. For any reference whose redistribution terms require a different approach, use it for verification and document what the generator can lawfully read and ship. Build from the tracked output with zero network requests for reference data. Emit stable key order and records sorted by Z. Validate missing or duplicate elements, source IDs, category keys, coordinate collisions, numeric bounds and phase conditions. Check representative cases against the pinned releases, including an interval for Ar, a value with uncertainty for Cu, no standard weight for Tc, ground-state exceptions such as Cr and Cu, and the prediction or unavailable policy for Og.

## 3. State and public contract

Use reflected WebWriter options for author settings. Keep transient state per instance.

| Input or state | Semantics |
| --- | --- |
| `initial-element="8"` | Author default. Trim the attribute, accept only an all-digit value in 1–118, and use no initial selection for missing or invalid markup. |
| `view="auto"`, `view="table"`, or `view="list"` | Author default, with invalid markup treated as `auto`. A learner can temporarily switch modes. |
| `lang` | Resolve EN/DE from the element or enclosing content, with English fallback. Canonical element keys stay language-independent. |
| `selectedAtomicNumber` | Live JavaScript property, defaulting to the authored initial value. Accept integers 1–118 or `null`. Ignore invalid writes and preserve the previous valid selection. |
| Query, category, focused cell, view override | Session state. Keep each independent of selection, including through layout changes. |

Use separate localized strings and language resolution. The existing [ChemLab helper](../localization/localization.ts) imports the lab's message bundle and defaults to German. Resolve the nearest explicit `lang` on the widget or enclosing content, crossing shadow hosts where needed, then map regional EN/DE tags and fall back to English. Recompute on an ancestor language change or reconnection while preserving the current element and query. Verify the localized labels and author options in editing and preview. [WebWriter options and state](https://webwriter.app/docs/widgets/state/) · [WebWriter focus management](https://webwriter.app/docs/widgets/focusmanagement/)

```ts
export const ELEMENT_SELECTION_EVENT = 'chemlab:element-selection'

export type ElementSelectionV1 = Readonly<{
  version: 1
  atomicNumber: number | null
  sourceId?: string
}>
```

Update selection synchronously and dispatch once from the widget host after a user action that changes it. Use `CustomEvent<ElementSelectionV1>` with `bubbles: true` and `composed: true`. Include the current host `id` as `sourceId` when present. A property assignment, initialization, author update, focus movement, search and hover dispatch zero selection events. A repeated click on the selected element keeps it selected. Provide an explicit clear action. Validate arbitrary event details in consumers. Treat `sourceId` as metadata. The routing fixture verifies that the event came from the resolved source element before delivering it.

Keep an internal unset state distinct from a deliberate `null`. Register the live property with Lit without attribute reflection, and verify its upgrade behavior for a property written before custom-element registration. Use this matrix for both implementation and tests.

| Action | Result | Selection events |
| --- | --- | --- |
| Create with authored Z=8 | Start at 8 unless a valid host write before upgrade or first render supplied a different value, including `null`. | 0 |
| Set a valid live value or change an authored default via editor or undo/redo | Live writes update selection silently. An initial-element edit reapplies the new selection default. A view edit clears the temporary view override and only affects layout. | 0 |
| Set `"8"`, `NaN`, 0, 119 or a fraction as a live value | Preserve the current selection. Markup parsing is a separate boundary. | 0 |
| Select a different element, clear or reset | Apply the resulting selection. Reset also clears query, category and temporary layout choice. | 1 if the selection changed |
| Click the selected element, navigate, hover or search | Keep the existing selection. | 0 |
| Move the same node, or reopen saved markup as a new node | The same node keeps the session. A new node starts from authored settings. | 0 |

## 4. Layout, accessibility and search

Render ordinary DOM and CSS. Use 18 display columns and seven period rows, followed by two labeled detached rows. Start with group-3 placeholders in periods 6 and 7 and all 15 members of each detached series displayed in columns 3–17. Document this display convention. Determine the group field in details independently from the source. The main grid and detached rows form one logical ARIA grid, with row labels and column indices that account for sparse rows. Keep period and series labels in a separate gutter from the 18 slots. Use passive group-3 placeholders and labeled jump buttons outside the grid's roving order. Each element appears once in the active interactive view. [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

- Use one focusable button per element with an accessible name containing Z, name, symbol and category. Wrap it in a gridcell and expose selection on that cell. Use roving `tabindex` so one available grid button is in the page tab order. Let native button click handle Enter and Space to avoid duplicate events.
- On left/right, find the next available element in the same row. On up/down, scan successive rows for the same column within the main or detached section. Stop at the boundary. Home/End go to the first/last available cell in the row. Series jump controls take focus to the first available member of the named series. Check that Right from H reaches He, Down from He reaches Ne, and Right from He stays there. Consume handled grid keys and verify that WebWriter still receives its shortcuts outside the grid.
- Use container widths of about 680 and 1,000 CSS px as initial breakpoints. Below 680 use the list by default. Between 680 and 1,000 stack details beneath the table. At wider sizes put details beside it if the main grid can retain legible cells. Allow horizontal overflow only inside the table when a narrow instance explicitly requests it. Use at least 24 × 24 CSS px targets and aim for 44 px list rows. Use a per-widget ResizeObserver only where the active DOM layout needs the width in JavaScript, and disconnect it on removal. [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Precompute search tokens once per locale. Trim and normalize case and diacritics. Search both EN and DE names and a short set of curated aliases. An all-digit query matches Z exactly. Rank exact symbols ahead of exact names and aliases, then prefix matches, then substring matches. Prefer the current-language canonical name within a matching tier, then sort by Z. Apply the category filter before ranking. An empty query returns the category's elements in Z order. Try `"8"` for O only, `" ca "` for Ca ahead of longer names, and `"Wasserstoff"` in the English interface.
- Keep grid cells in place and disable nonmatching buttons for pointer and keyboard interaction. The list renders matching elements. When results are empty, leave the toolbar and prior selection's details available and remove the grid's tab stop. Announce result counts without moving focus. In the search field, Enter selects the top match for a nonempty query. Ignore Enter during input method composition.
- Use one detail region in the active layout. In list mode put it directly below the selected row. If filtering hides that row, place the region immediately after the toolbar. Show the symbol and localized name, then group, period and family, then weight, phase and electron configuration. A collapsed sources section identifies the fields each source supports. Put a keyboard-accessible way to move to the details near the toolbar and return to the selected result when it is available.
- Track result focus by Z before a layout change. After Lit updates, restore it only if the widget's result area owned focus before the update and the user has not moved focus elsewhere. If that Z disappeared from the results, use the search field as a stable fallback. If the focused result is offscreen in table mode, reveal it inside the widget's scroll area. A host selection update leaves focus where it is. Test empty results, resizing with a cell focused, resizing from elsewhere in the worksheet, and moving from a chosen list row to its details.
- Use ChemLab's neutral surfaces and grouped controls with an independent, labeled family palette. Provide one print-only, noninteractive overview for both author layouts. Use `:host(.ww-beforeprint)` for WebWriter and `@media print` for exported HTML. Print the grid and selected details, with interactive controls outside the print flow. Test both routes from a narrow widget that defaults to the list. [WebWriter printing](https://webwriter.app/docs/widgets/printing/)

## 5. Worksheet linking fixture and follow-up design

Use the Deep Learning Model example as the packaging and composition precedent. A compatible receiver will persist an optional attribute such as `element-source-id`. Later, a reusable author picker can list eligible widget hosts in the current worksheet and let authors locate or clear a selected source. Keep the actual picker and all lab and builder actions in the receiver work packages. [Deep Learning Model source picker](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/components/reference-element-select.ts) · [MNIST snippet](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/snippets/MNIST.html)

Build a fixture with tables A and B, a builder stub bound to A and a lab stub bound to B. Give the resolver an explicit worksheet root from the test host. Compare ID strings literally. A binding resolves only when exactly one element in that scope has the ID and the element has the expected tag. Use a direct listener and dispose it on rebind, removal or disconnect. A scoped observer can coalesce refreshes for child, binding and ID changes. Before delivery, synchronously verify that the source still resolves from the receiver's current binding and that `event.composedPath()[0]` is the actual source host. This covers the gap before an observer runs and rejects child events with a matching `sourceId`. Validate the payload version and values before updating the stub. Use a display of the last received element and delivery count as the fixture output.

| Fixture exercise | Expected result |
| --- | --- |
| Select O in A, then Cu in B | A's stub receives only O. B's stub receives only Cu. Each counter increments once. |
| Clear A, then write a value to A using the stub's reverse-preview action | The clear delivers `null` once. The reverse property write changes A's view and delivers no selection event. |
| Insert a duplicate ID or rebind immediately before dispatch, in the same task | An event from the now-stale source is ignored even before the observer refreshes the listener. |
| Dispatch a selection event from a child with a matching source ID, or supply a wrong version or invalid Z | Neither stub state nor delivery count changes. |
| Remove a source, then reconnect it or bind to another table | Only the currently resolved source delivers, with one delivery per change after recovery. |

In WebWriter record scope boundaries and ID behavior after save/reopen, duplicate, paste, undo/redo and snippet insertion. Include a wrong-type ID and two copies of the same worksheet fragment. An earlier widget can still resolve uniquely if the host regenerates the copy's ID but preserves the receiver's old reference. Verify both ID uniqueness and paired destinations after copying. Use an authoritative old-to-new ID mapping when the host supplies one. If copy behavior is unresolved, deliver the table-only snippet and standalone property/event integration. The linked lesson requires evidence that copies cannot route to earlier widgets.

Later, table-to-builder transfers select an atom tool and table-to-lab transfers look up matching catalog species. Use an explicit targeted action for transfers. The existing selection event provides a browsing signal. Builder-to-lab exchange will carry a versioned graph and separately validated species metadata, as described in the product plan. Reserve real material registration and dosing for ChemLab's normal workflow.

## 6. Commit boundaries and release checks

| Commit | Deliverable and acceptance |
| --- | --- |
| 1. WebWriter entry and contract | Both ChemLab entries appear in local import. The table can be placed alone, twice with isolated state, or beside Chemdraw. A host write produces zero events and a user change produces one event. Record observed embedding and ID behavior. |
| 2. Reference data | Generator and validator cover all 118 elements. Re-running generation is byte-stable. Approved source revisions, redistribution terms and known gaps are documented. |
| 3. Browsing UI | Search, filter, list, table and details work in EN and DE at 320, 680 and 1,000 CSS px and through intermediate widths. Verify display at 200% zoom. Details remain visible for an element excluded by a filter. |
| 4. Accessibility and authoring | Keyboard and screen-reader checks pass for sparse rows, detached series, result counts and layout transitions. The authored initial element and view survive save/reopen and undo/redo. Learner interaction leaves authored attributes untouched. Print preview is legible. |
| 5. Snippet and integration | Table-only snippet inserts twice and the saved table operates offline. Stub delivery verifies pairing, lifecycle, invalid payload rejection and recovery after relinking. The table-only view loads without simulation assets. An existing ChemLab worksheet opens and its controls work. |

Use the repository's esbuild and Node test workflow for pure validation, search and navigation. Run `npx tsc --noEmit`, the reference generation check and the existing regression suite. Use a browser fixture for composed events, upgrade timing and focus tests, then repeat user-facing flows in WebWriter through local import and preview. Record browser fixture results separately from WebWriter results.

Run `npx @webwriter/build` once for release validation. Inspect the built widget assets and the output of `npm pack --dry-run` for both widget entries and the table snippet. Inspect the table-only module graph or network requests for Pixi, Chart.js, ChemLib and Kekule. Verify offline browsing in a saved table-only worksheet with its package assets already available, including reload with external requests blocked. Report the chosen source revisions, host behavior, open limitations and any WebWriter checks awaiting manual import. Create one commit after each verified work package.
