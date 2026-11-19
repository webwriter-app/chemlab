# Periodic table MVP implementation handoff

Implement the [MVP product plan](periodic-table-mvp.md) in the ChemLab checkout. The deliverable is a standalone, bilingual WebWriter periodic table, a table-only worksheet snippet and a tested selection contract. Validate integration with ChemLab and molecule-builder stubs. Real receivers and the linked three-widget lesson follow in a separate release. Keep the current lab widget and its snippets compatible.

## 1. Entry point and WebWriter verification

Start by reading the repository [AGENTS.md](../AGENTS.md). Use the existing root npm package and dependency versions. The `dev` script currently launches Vite. Use `npm ci` and `npx @webwriter/build dev` in the repository root for the actual widget workflow. The product check takes place through WebWriter's local package import.

| Proposed path | Responsibility |
| --- | --- |
| `webwriter-periodic-table.ts` | Register `webwriter-periodic-table`, declare WebWriter options and own widget state, rendering and lifecycle. |
| `periodic-table/element-reference.ts` | Reference types, generated data import, indexed access by atomic number. |
| `periodic-table/selection.ts` | Dependency-free selection event name, payload and runtime validators. |
| `periodic-table/layout.ts` | Display coordinates, category keys and pure keyboard-neighbor calculation. |
| `periodic-table/search.ts` | Localized search indexing, normalization and result ranking. |
| `periodic-table/strings.ts`, `periodic-table/styles.ts` | EN/DE interface strings, container layout, category tokens and focus. |
| `data/periodic-table/`, `scripts/generate-periodic-table.mjs` | Approved source inputs, attribution, generated bundle and reproducible generation. |
| `tests/periodic-table-*.test.ts`, `tests/fixtures/` | Pure logic tests and a small integration fixture for real custom events and widget references. |
| `snippets/Beispiel-Periodensystem.html` | Standalone example worksheet. |

Add `./widgets/webwriter-periodic-table.*` to `package.json#exports` with `source: "./webwriter-periodic-table.ts"` and `default: "./dist/widgets/webwriter-periodic-table.*"`. Add `editingConfig["./widgets/webwriter-periodic-table"].label` with English, German and `_` fallback. Add the root entry to `tsconfig.json#include`, which currently names the ChemLab entry explicitly. Export the snippet and register its separate editing label in the final work package. Copy the structure of existing exports and generate the snippet markup from a real WebWriter save. [WebWriter package configuration](https://webwriter.app/docs/packages/configuring/) · [Snippet configuration](https://webwriter.app/docs/snippets/configuring/)

Build the first spike with a small temporary element fixture and both widget entries. Use `LitElementWw`, the same custom-element decorator and the scoped Shoelace import pattern in [webwriter-chemlab.ts](../webwriter-chemlab.ts). Import only the Shoelace components used by the table. Check standalone insertion, insertion beside ChemLab, two tables in one worksheet, and preview/export. Save a worksheet with an authored option, inspect it using Edit source and reopen it. Record the WebWriter version and any assumptions that the build or editor disproves. [WebWriter saving and editing](https://webwriter.app/docs/widgets/editingandsaving/)

## 2. Reference data and reproducible generation

Use an atomic-number keyed, read-only bundle with one record for each Z from 1 to 118. Keep positions and teaching categories in human-reviewable tables, separate from scientific group and phase. Expose `elementByAtomicNumber(z)` from a lightweight module. Keep compatibility with [ChemLab's ElementData](../chemlib/ElementData.ts) through a later-facing, pure adapter from legacy names to Z, with explicit aliases and an unavailable result for unknown or pseudo-elements. Place the adapter outside the table entry's imports and leave legacy keys in saved ChemLab documents.

Suggested generated schema:

```ts
type SourceId = string
type Provenance = { sourceId: SourceId; locator?: string }
type DataValue<T> =
  | { status: 'reported' | 'predicted'; value: T; provenance: Provenance }
  | { status: 'unavailable'; provenance?: Provenance }

type StandardAtomicWeight =
  | { kind: 'value'; decimal: string; uncertainty?: string; provenance: Provenance }
  | { kind: 'interval'; lower: string; upper: string; provenance: Provenance }
  | { kind: 'none'; provenance: Provenance }
  | { kind: 'unavailable' }

type ElementReference = {
  atomicNumber: number
  symbol: string
  names: { en: string; de: string }
  aliases?: Partial<Record<'en' | 'de', readonly string[]>>
  identitySource: Provenance
  period: number
  group: DataValue<number>
  block: DataValue<'s' | 'p' | 'd' | 'f'>
  weight: StandardAtomicWeight
  configuration: DataValue<string>
  phase: DataValue<'solid' | 'liquid' | 'gas'>
}
```

Declare the phase temperature and pressure once in bundle metadata if every phase uses those conditions. Source metadata records publisher, URL, pinned date or revision, and redistribution terms. Preserve decimal strings for published weights, uncertainties and interval endpoints. Render those using the locale's decimal separator while retaining all significant digits and trailing zeros. Keep mass number out of the MVP weight display unless it has separate provenance and labeling. Display “No standard atomic weight” separately from “Unavailable”.

Use IUPAC to check atomic number, symbol and English names. Use CIAAW to review standard atomic weights, preserving intervals and uncertainties. Use PSE-info's MIT-labeled element data as an input candidate for names and properties, checking the exact revision and field provenance. A phase needs the agreed reference conditions of 25 °C and 1 bar or evidence that the cited phase is valid there. Preserve explicitly labeled predictions and leave unsupported values unavailable. Include licenses and attribution for the inputs actually redistributed. [IUPAC periodic table](https://iupac.org/what-we-do/periodic-table-of-elements/) · [CIAAW standard atomic weights](https://www.ciaaw.org/atomic-weights.htm) · [PSE-info data and license](https://pse-info.de/en/data)

The generator reads pinned local inputs, normalizes approved fields and emits a deterministic JSON file sorted by Z with a data version and source IDs. Make generation available through a direct Node command and add a check mode that compares regenerated output with the tracked artifact. The normal widget build imports the generated file and makes zero network requests for reference data. Fail validation for missing or duplicate elements, unknown source IDs, invalid category or grid coordinates, malformed intervals and missing identity fields. Test representative data cases from the product plan, including argon, technetium and oganesson.

## 3. State and public contract

Use reflected WebWriter options for author settings. Keep transient state per instance.

| Input or state | Semantics |
| --- | --- |
| `initial-element="8"` | Author default. Missing or invalid markup means no initial selection. Parse the complete integer string and validate 1–118. |
| `view="auto"`, `view="table"`, or `view="list"` | Author default, with invalid markup treated as `auto`. A learner can temporarily switch modes. |
| `lang` | Resolve EN/DE from the element or enclosing content, with English fallback. Canonical element keys stay language-independent. |
| `selectedAtomicNumber` | Live JavaScript property, defaulting to the authored initial value. Accept integers 1–118 or `null`. Ignore invalid writes and preserve the previous valid selection. |
| Query, category, focused cell, view override | Session state. Keep each independent of selection, including through layout changes. |

Initialize live state from the authored defaults on the first update. When the author changes a preset via a reflected option or undo/redo, apply that preset to the affected transient field silently. Reconnection of the same element preserves the session. A learner reset clears query, category and view override and restores the authored initial selection. Emit only if reset changes selection. If a host sets a valid live value before the first render, use it ahead of the authored default. For the packaging spike, verify the options and focus behavior in both WebWriter editing and preview. [WebWriter options and state](https://webwriter.app/docs/widgets/state/) · [WebWriter focus management](https://webwriter.app/docs/widgets/focusmanagement/)

```ts
export const ELEMENT_SELECTION_EVENT = 'chemlab:element-selection'

export type ElementSelectionV1 = Readonly<{
  version: 1
  atomicNumber: number | null
  sourceId?: string
}>
```

Update selection synchronously and dispatch once from the widget host after a user action that changes it. Use `CustomEvent<ElementSelectionV1>` with `bubbles: true` and `composed: true`. Include the current host `id` as `sourceId` when present. A property assignment, initialization, author update, focus movement, search and hover dispatch zero selection events. A repeated click on the selected element keeps it selected. Provide an explicit clear action. Validate arbitrary event details in consumers. Treat `sourceId` as metadata. The routing fixture verifies that the event came from the resolved source element before delivering it.

## 4. Layout, accessibility and search

Render ordinary DOM and CSS. Use 18 display columns and seven period rows, followed by two labeled detached rows. Start with group-3 placeholders in periods 6 and 7 and all 15 members of each detached series displayed in columns 3–17. Document this display convention. Determine the group field in details independently from the source. The main grid and detached rows form one logical ARIA grid, with row labels and column indices that account for sparse rows. Keep period and series labels in a separate gutter from the 18 slots. Use passive group-3 placeholders and labeled jump buttons outside the grid's roving order. Each element appears once in the active interactive view. [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

- Use one focusable button per element with an accessible name containing Z, name, symbol and category. Wrap it in a gridcell and expose selection on that cell. Use roving `tabindex` so one available grid button is in the page tab order. Let native button click handle Enter and Space to avoid duplicate events.
- On left/right, find the next occupied column in the same row. On up/down, scan successive rows for the same column within the main or detached section. Stop at the boundary. Home/End go to the first/last available cell in the row. Series jump controls take focus to the first available member of the named series. Consume key events the grid handles and check that WebWriter still receives its own shortcuts when focus is outside the grid.
- Use container widths of about 680 and 1,000 CSS px as initial breakpoints. Below 680 use the list by default. Between 680 and 1,000 stack details beneath the table. At wider sizes put details beside it if the main grid can retain legible cells. An explicit Table override uses horizontal scrolling at narrow widths. Use a per-widget ResizeObserver only where the active DOM layout needs the width in JavaScript. Track focus by atomic number before switching, restore after Lit updates and disconnect the observer on removal.
- Precompute search tokens once per locale. Normalize using Unicode decomposition, diacritic removal and case folding. Sort matches by exact Z, symbol or name, then prefix, then substring. Prefer the current-language name for ties, with atomic number as the final stable tie-breaker. Apply category filtering before ranking. Keep grid cells in place and dim nonmatches with an accessible unavailable state. Omit nonmatches from roving navigation. The list renders just matches. With zero matches, announce the count and keep the toolbar and prior selection's details available.
- Use one detail region for both layouts. Show the symbol and localized name first, then group/period and family, then atomic weight, phase and electron configuration in a definition list. Offer one collapsed sources section, grouped by the fields it supports. Keep selected details visible during filtering. Keep focus on the toolbar while typing. Use Enter to select the top result only when the search query is nonempty and has a match. If the focused element becomes unavailable on a layout or filter change, restore the closest available matching control or the search input. Make clearing selection and resetting distinguishable. Test keyboard navigation, actual screen-reader announcements, touch and forced colors.
- Use ChemLab's neutral surfaces and grouped controls with an independent, labeled family palette. Provide one print-only, noninteractive overview in both author layouts. Print the grid and selected details and hide toolbar controls. Verify WebWriter print preview with a narrow table that defaults to list on screen.

## 5. Worksheet linking fixture and follow-up design

Use the Deep Learning Model example as the packaging and composition precedent. A compatible receiver will persist an optional attribute such as `element-source-id`. Later, a reusable author picker can list eligible widget hosts in the current worksheet and let authors locate or clear a selected source. Keep the actual picker and all lab and builder actions in the receiver work packages. [Deep Learning Model source picker](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/components/reference-element-select.ts) · [MNIST snippet](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/snippets/MNIST.html)

Build a fixture with tables A and B, a builder stub bound to A and a lab stub bound to B. Give the resolver an explicit worksheet root from the test host. Within that root an ID resolves only if exactly one element has that ID and is of the expected widget type. Use a direct listener on the resolved element, validate source and payload, and dispose the previous listener on rebind, removal or disconnect. A simple scoped observer can refresh the fixture on relevant changes to children or IDs, with update work coalesced. A stub can display the last received element and a delivery count. Add an explicit preview command in the fixture to verify that a silent reverse property update creates no event loop.

In WebWriter record scope boundaries and ID behavior after save/reopen, duplicate, paste, undo/redo and snippet insertion. Test two copies of the same worksheet fragment, disconnection and reconnection, missing and duplicate IDs and a wrong-type ID. Use a real document-local scope and an authoritative old-to-new ID mapping for copied bindings when the host supplies them. If copy behavior is unresolved, deliver the table-only snippet and standalone property/event integration. Keep the linked lesson gated until test evidence shows copies cannot accidentally route to earlier widgets.

Later, table-to-builder transfers select an atom tool and table-to-lab transfers look up matching catalog species. Use an explicit targeted action for transfers. The existing selection event provides a browsing signal. Builder-to-lab exchange will carry a versioned graph and separately validated species metadata, as described in the product plan. Reserve real material registration and dosing for ChemLab's normal workflow.

## 6. Commit boundaries and release checks

| Commit | Deliverable and acceptance |
| --- | --- |
| 1. WebWriter entry and contract | Both widgets appear in local import. Minimal table can be placed alone or twice with isolated selection. A host write produces zero events and a user change produces one event. Record observed embedding and ID behavior. |
| 2. Reference data | Generator and validator cover all 118 elements. Re-running generation is byte-stable. Approved source revisions, redistribution terms and known gaps are documented. |
| 3. Browsing UI | Search, filter, list, table and details work in EN and DE at 320, 680 and 1,000 CSS px and through intermediate widths. Verify display at 200% zoom. Details remain visible for an element excluded by a filter. |
| 4. Accessibility and authoring | Keyboard and screen-reader checks pass for sparse rows, detached series, result counts and layout transitions. The authored initial element and view survive save/reopen and undo/redo. Learner interaction leaves authored attributes untouched. Print preview is legible. |
| 5. Snippet and integration | Table-only snippet inserts twice and the saved table operates offline. Stub delivery verifies pairing, lifecycle, invalid payload rejection and recovery after relinking. The table-only view loads without simulation assets. An existing ChemLab worksheet opens and its controls work. |

Run `npx tsc --noEmit`, the reference generation check and the repository tests described in AGENTS.md. Exercise the UI through local WebWriter import and preview. Use browser network inspection or build import metadata to check for Pixi, Chart.js, ChemLib or Kekule in the table-only path. Document checks that require the user's manual import if the editor is unavailable to the implementing agent. Report the chosen data revisions, host behavior, open host limitations and verification results at handoff. Create one commit after each verified work package.
