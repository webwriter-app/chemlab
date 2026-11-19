# Interactive periodic table MVP

The [implementation handoff](periodic-table-implementation.md) specifies the file layout, data schema, selection contract and acceptance checks for this plan.

## Product and scope

Add an independently insertable `<webwriter-chemlab-periodic-table>` widget alongside ChemLab. It takes over element discovery, reference information and element picking from the former molecule builder. The future molecule builder owns atoms, bonds and structural editing. ChemLab owns substances, mixtures, quantities and experiments. All three should be useful on their own, and selecting an element should leave each widget's scientific state intact until the learner takes an explicit action.

The supplied *Open-source interactive periodic tables* research brief (19 November 2026, pp. 2–8) sets the MVP baseline. Use its overview-to-detail workflow, the compact selector idea from OSSCAR, and the emphasis on provenance from Periodisk. Keep property heatmaps, rankings and two-to-four-element comparison together as a later release. The future molecule builder is the natural home for formula or molar-mass tools. Isotope exploration and 3D views can be considered separately.

| MVP feature | Observable outcome |
| --- | --- |
| Periodic overview | All 118 recognized elements are reachable. Group and period headings, the detached series and a category legend explain the layout. |
| Search and filters | Search matches element names, symbols and atomic numbers. An optional category filter narrows results without moving cells in the table. |
| Element details | Selecting an element shows identity, classification, weight, phase and electron configuration, with applicability and source information. |
| Responsive and accessible operation | Keyboard, mouse and touch work across both the table and a compact searchable list. Focus, selection and categories have distinguishable cues. |
| WebWriter authoring | Authors can set an initial element and choose automatic layout, table or list. Learners can explore and reset to that initial view. |
| Interoperability | The widget accepts a validated atomic number and emits a versioned selection event. A simple host fixture proves the contract with two independent instances. |

## Interface and interaction

### Layout

- Use a Lit component and a CSS grid for placement. At wide container sizes, show a slim search/filter toolbar, the table with its legend, and a detail pane when enough width remains for comfortable cells. Start the prototype with side-by-side panes at approximately 1,000 CSS px and a stacked detail card at approximately 680–999 CSS px. Tune these against the actual WebWriter selection and resize handles.
- Use the searchable list by default at smaller container widths. Each result row displays atomic number, symbol, name and a category cue. Keep a Table/List switch available so learners can intentionally open the periodic layout in a scrollable region. Size the touch rows generously and keep details in normal document flow to avoid trapping scroll in a worksheet.
- Use compact Shoelace controls and the Chemlab theme where it fits. A table cell needs the atomic number, symbol, and an optional abbreviated name at larger sizes. Use color for families with a labeled legend. Add a border/style change for selection and a distinct focus ring. Show the category in plain text in results and details. Provide a forced-colors mode with visible cell borders and focus.
- Place lanthanides and actinides in detached rows and give the period 6/7 placeholders a text label and a keyboard path to the appropriate series. Keep each element interactive exactly once. Store display coordinates separately from chemical group membership. Document the adopted group-3 placement convention in the data notes and describe ambiguous group entries explicitly in the detail card.

### Search, focus and selection

- Rank exact atomic number, symbol and name matches first, followed by prefix and substring matches. Match names in the current language and in English, case and diacritic insensitive. Use curated aliases such as “aluminium/aluminum” and “sulfur/sulphur”. Show a result count and a clear action. Keep the selected element and its details visible when a query excludes it.
- Clicking or tapping a cell selects it. In search, Enter selects the top result when present. Hover and focus preview identity without changing the selected element. Clear selection or change search independently. Reset returns to the author’s initial selection and view and clears the learner’s filters.
- Use the WAI-ARIA layout grid pattern. Give the grid one tab stop and use roving tabindex. Arrow keys follow table coordinates, skipping empty cells. Home and End reach the ends of the current row, and labeled series jump controls provide an explicit path between the main grid and detached rows. Enter and Space select the focused cell. Use native buttons in the compact list and normal Tab order for search and details. Use an accessible name such as “8, Oxygen, O, nonmetal” and expose selected state separately.
- Keep focus in the table during keyboard exploration. Provide a predictable path to the details and back to the selected element. In compact list mode, show the details next to the selected row or near the toolbar when filters hide that row. When the container changes layout, restore focus to the same atomic number if focus was inside the table or list and the element remains available. Announce result counts and selection changes without announcing every visual hover. Test against WCAG 2.2 AA and with an actual screen reader. [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Data and scientific semantics

Use **atomic number** as the canonical element identifier. The current `ElementData` is part of the simulation and includes a proton entry and a placeholder for element 119. Build a small, versioned element reference package for the 118-element educational view. Add an adapter for ChemLab's existing element-name keys, preserving the legacy keys in saved molecule definitions. Generate and validate the reference bundle as a build-time task. Ship the resulting data with the widget for offline use.

| Data | Representation |
| --- | --- |
| Identity | Atomic number, IUPAC symbol, English and German names and aliases, period, group where assigned, block and category. |
| Weight | Relative standard atomic weight as a value with stated uncertainty or a closed interval. Use a discriminated record for cases with no standard atomic weight. A separately sourced isotope mass number can appear as an explicitly labeled integer. Retain the source precision. |
| Electronic structure | Ground-state electron configuration for the neutral atom. Record whether it is reported, predicted or unavailable. |
| Phase | Solid, liquid, gas or unavailable at a stated reference condition such as 25 °C and 1 bar. Only use data for those conditions or supplied with a verified conversion. Keep predicted values visibly qualified. |
| Provenance | Each scientific field points to a source ID and version, with conditions and units where applicable. A compact source expander in the detail card exposes the link, release date and caveats. |

Use IUPAC to validate element identity and CIAAW for standard atomic weights, including interval and uncertainty cases. Review PSE-info's MIT-labeled data as a candidate for the remaining fields. Pin the source revision, approve each imported field and document upstream sources and redistribution terms. Audit any legacy data before reuse and attribute dataset and source licenses independently. If a reliable phase or configuration is absent, show “Unavailable”. The bundled MVP data should use text and CSS. [IUPAC periodic table](https://iupac.org/what-we-do/periodic-table-of-elements/) · [CIAAW standard atomic weights](https://www.ciaaw.org/atomic-weights.htm) · [PSE-info dataset and terms](https://pse-info.de/en/data)

Validate uniqueness, exactly one record for each Z from 1 to 118, layout coordinates, localization fallback, source IDs, interval bounds, phase conditions and absence of simulation pseudo-elements. Spot-check H, Ar (interval), Fe and Cu (transition metals), Br and Hg (phase at reference conditions), Tc (no standard weight), and Og (prediction/unknown policy).

## Packaging and coordination

Use the existing repository, npm install and WebWriter build. Register `./widgets/webwriter-chemlab-periodic-table.*` in `package.json` with the same `source` and `default` export pattern as ChemLab, and add a localized `./widgets/webwriter-chemlab-periodic-table` entry in `editingConfig`. Register the future builder as a third independent entry when it is ready. Keep each widget's entry point, styles and translations isolated. Import the lightweight element reference and contract modules directly so the table's bundle has no simulation, Pixi, Chart.js or Kekule dependency. Prototype with `LitElementWw` like ChemLab. Verify that WebWriter can insert each shipped widget individually and can load multiple instances in one worksheet. [WebWriter package configuration](https://webwriter.app/docs/packages/configuring/) · [WebWriter Lit quickstart](https://webwriter.app/docs/quickstart/)

WebWriter's Deep Learning Model package uses five separate widget exports and a separate snippet export. Its MNIST snippet places the five widgets directly in the worksheet and supplies each consumer's source references as attributes pointing to widget IDs. Follow that composition pattern for chemistry lessons. Ship a table-only example with the MVP. Once the builder and lab receivers exist, add a second snippet containing all three widgets, preconfigured with explicit references. Authors can then insert a complete lesson or assemble their own from the individual widgets. [Deep Learning Model package manifest](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/package.json#L68-L96) · [MNIST worksheet snippet](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/snippets/MNIST.html#L1-L23)

### State and public API

- **Authored state** lives in attributes such as `initial-element`, `view="auto|table|list"` and `lang`. Reflect edits through normal WebWriter author controls and verify save, reopen and undo/redo. Reserve structured, versioned child data for later configurations that outgrow attributes. Inherit host language with a fallback to English for unsupported translations. Expose CSS variables for the family palette, surfaces and focus.
- **Session state** contains search, category, focus and current selection. It stays in the instance, including in a worksheet with two tables. Author settings and learner gestures have separate ownership.
- **MVP API** exposes `selectedAtomicNumber` as a read/write property accepting a valid atomic number or null. An optional observer can subscribe to `chemlab:element-selection`, a bubbling, composed custom event with `{ version: 1, atomicNumber: number | null, sourceId?: string }`. Emit it after a user selection, deselection or reset that changes the selected value. A host property write updates the view silently and idempotently. Reject invalid numbers at the boundary. Keep keyboard focus independent of host-driven changes.
- **Explicit transfer** is a separate command from browsing. When receivers are available, an application can offer actions such as “Use element in builder” or “Find in lab”. Include the intended receiver in an explicit document-local binding. The MVP tests the contract in a host fixture and leaves receiver actions for their implementation phases.

### Three-widget data flow

| Direction | Payload | Receiving behavior |
| --- | --- | --- |
| Table → molecule builder | Atomic number | Set the atom tool or open the element picker at that atom. Place atoms through a builder action. |
| Table → ChemLab | Atomic number | Filter or highlight relevant catalog entries, for example Cu metal versus copper sulfate. Placing a substance requires a specific catalog entry, phase, optional concentration, quantity and target. An element alone supplies none of these. |
| Builder → table | Atomic number of a focused atom | Show element details through a silent property update. A future multi-element comparison can receive the distinct element list. |
| Builder → ChemLab | Versioned molecular graph and optional identifiers | Validate atoms, bonds and charges, map supported elements into the existing molecule-definition representation, and preview the candidate before registering it. Establish simulation capability and required solution properties separately before dosing. |
| ChemLab → builder or table | Source molecule definition or atomic number | Open a copy of the molecule in the builder, or inspect a selected atom or constituent element in the table. Amounts, mixtures, chart data and experiment state stay owned by ChemLab. |

For a future graph contract, use stable atom IDs with atomic number, formal charge and optional isotope, explicit bond endpoints and order, and optional stereochemistry. Preserve SMILES and InChI/InChIKey as exchange and lookup metadata where available. The graph carries editable atom and bond identity. A future adapter can map supported graphs to ChemLab's `MoleculeDefinition` and explicitly report unsupported features. Test charged species, disconnected ions and round trips before enabling import. ChemLab's simulation catalog remains a distinct layer for phase, density, solubility and reactions.

### Linking widgets in a worksheet

- **Authoring.** Put an optional, persisted reference for each supported input on its receiver. For example, the builder can have an `element-source-id` referencing a periodic table. Use the WebWriter-assigned widget ID after verifying its lifecycle in the packaging spike. The reference package's shared source selector suggests a reusable Shoelace control for choosing a compatible widget, clearing the binding and locating the selected source. Present a friendly widget label and enough context to distinguish multiple instances. A binding enables delivery of an explicit handoff and can also support a passive preview where specified. Delivery from one source to multiple receivers requires explicit targeting for commands. [Deep Learning Model source selector](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/components/reference-element-select.ts) · [Training widget input references](https://github.com/webwriter-app/deep-learning-model/blob/62c24468cf36b3d6128cef7ea3ed9de365cb661c/widgets/webwriter-model-training.ts#L240-L248)
- **Resolution.** Resolve a reference against compatible widget hosts within the current worksheet. Re-resolve on source or consumer insertion, removal, reconnection and binding changes. Use host lifecycle hooks where available, or one scoped mutation observer when needed. Detach listeners on rebind and disconnect. Leave empty, missing, ambiguous or incompatible references unresolved and show an author-facing way to repair them. Keep the standalone workflow usable in every case. Use explicit IDs and lifecycle updates in place of the reference selector's document-wide discovery, nearest-sibling default and polling.
- **Copy and persistence.** Verify how WebWriter imports snippets, remaps IDs and rewrites cross-widget attributes on duplication and paste. When a linked set is copied, remap its internal references to the new copies where the host exposes a reliable old-to-new ID mapping. If the mapping is unavailable, clear or flag copied bindings for explicit relinking wherever the host lets us detect the copy. Gate release of the linked snippet on verifying that insertion and duplication cannot silently target an earlier copy. Never guess a target based on document order. Cover save/reopen, undo/redo, deletion and moving a source outside the worksheet. Persist the binding and author preferences. Keep resolved DOM references, listeners and learner selections in memory.
- **Contract and deployment.** The MVP proves the link semantics using two tables and stub receivers. Use the public property and versioned custom event for standalone hosts and verify delivery across the editor's Shadow DOM boundaries. Record the observed host behavior before implementing the real link picker. For separate frames, evaluate WebWriter's communication bridge in a later integration step, validating origins and payload versions at that boundary.

### Example lesson workflow

A learner selects oxygen in the periodic table and inspects its electron configuration. An explicit handoff activates the oxygen tool in the builder, where the learner can complete a water molecule. The builder sends a copy of the structure to ChemLab, which can match it to the existing water catalog entry and show its usual dosing controls. The learner chooses the vessel and amount. In a table-only worksheet, the interaction ends naturally at the element details. In a lab-only worksheet, the existing water catalog entry remains usable directly.

## Implementation sequence and acceptance

| Work package | Implementation | Exit check |
| --- | --- | --- |
| 1. Packaging and contract spike | Register a minimal table entry. Prove selected-Z property, events and independent instances with a stub receiver. Check WebWriter IDs and reference attributes on save, duplication and snippet insertion. | Local WebWriter import shows both widget entries. A worksheet with both widgets and a table-only worksheet reopen correctly. Document observed ID behavior and any remapping limitation. Host-driven selection produces zero selection events. |
| 2. Data and provenance | Select the pinned sources, add a generator, normalize and validate the 118 records and write attribution. Build EN/DE labels and the legacy-name adapter. | Data tests pass, the license record is reviewable, and weight/phase edge cases render correctly without a network. |
| 3. Core browsing UI | Implement table, detached series, details, search, legend, category filter, layout switch and reset. | Every element is selectable in both layouts. Search and filters leave a pinned selection intact. A resized worksheet has legible cells or a usable list, with no clipped detail controls. |
| 4. Keyboard and authoring | Implement roving focus, accessible search, language and theme fallback, author controls and print overview. | Verify keyboard-only navigation through gaps and both detached rows. Test a screen reader and touch, save/reopen, undo/redo, and a compact and full-width WebWriter embed. |
| 5. Integration and release | Test event routing with two tables and stub ChemLab/builder receivers. Inspect built assets and export the table-only snippet. | One gesture produces one event and only the paired receiver reacts. A missing, duplicated or incompatible reference dispatches no command. The table-only snippet inserts twice with independent state and works offline. An existing ChemLab document loads as before. |

Keep commits scoped to the work packages. Use `npm ci` and `npx @webwriter/build dev` in the existing checkout and verify the MVP via local WebWriter import. The first release is complete when the standalone table passes these checks and the two receiver stubs demonstrate the versioned element handoff. Real molecule exchange is a later integration milestone.
