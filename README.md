# Chemlab (`@webwriter/chemlab@2.0.0`)
[License: MIT](LICENSE) | Version: 2.0.0

Build molecules, explore the periodic table, and simulate chemistry experiments.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Beispiel Titration | `@webwriter/chemlab/snippets/Beispiel-Titration.html` |
| Beispiel Titrationstypen | `@webwriter/chemlab/snippets/Beispiel-Titrationstypen.html` |
| Beispiel Batterie | `@webwriter/chemlab/snippets/Beispiel-Batterie.html` |
| Beispiel Elektrochemie | `@webwriter/chemlab/snippets/Beispiel-Elektrochemie.html` |
| Beispiel Periodensystem | `@webwriter/chemlab/snippets/Beispiel-Periodensystem.html` |



## `ChemLab` (`<webwriter-chemlab>`)
chemlab webwriter widget for presenting interactive chemistry experiments

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab.js"></script>
<webwriter-chemlab></webwriter-chemlab>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/chemlab
```

```html
<link href="@webwriter/chemlab/widgets/webwriter-chemlab.css" rel="stylesheet">
<script type="module" src="@webwriter/chemlab/widgets/webwriter-chemlab.js"></script>
<webwriter-chemlab></webwriter-chemlab>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `lang` | - | - | - | ✗ |
| `ChemLab.optionGroups` | `object` | - | `{ appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false }, analytics: { label: { _: "xAPI", "de-DE": "xAPI" }, collapsible: true, advanced: true }, }` | ✗ |
| `ChemLab.options` | `object` | - | `{ moleculeBuilderId: { type: "string" as const, group: "appearance", attribute: "molecule-builder-id", label: { _: "Linked Molecule Builder ID", "de-DE": "ID des verknüpften Molekülbaukastens" }, }, newSmilesDrawer: { type: "select" as const, group: "appearance", label: { _: "Experimental molecule drawing", "de-DE": "Experimentelle Moleküldarstellung" }, options: [ { value: "1", label: { _: "Enabled", "de-DE": "Aktiviert" } }, { value: "0", label: { _: "Disabled", "de-DE": "Deaktiviert" } }, ], }, thumbnailBadges: { type: Boolean, group: "appearance", label: { _: "Label thumbnail sources", "de-DE": "Vorschaubild-Quellen anzeigen" }, }, enablexAPI: { type: Boolean, group: "analytics", label: { _: "Send xAPI statements", "de-DE": "xAPI-Statements senden" }, }, xAPIKey: { type: "password" as const, group: "analytics", label: { _: "xAPI key", "de-DE": "xAPI-Schlüssel" }, }, }` | ✗ |
| `options` | - | - | - | ✗ |
| `optionGroups` | - | - | - | ✗ |
| `message` | - | - | - | ✗ |
| `canvasArea` | `HTMLDivElement` | - | - | ✗ |
| `canvasZoom` | `HTMLDivElement` | - | - | ✗ |
| `thumbnailBadges` (`thumbnailBadges`) | `boolean` | temporary debug toggle: label each vessel thumbnail with its render<br>source (smilesdrawer / kekule / text) | `false` | ✓ |
| `showTitrationMarkers` (`show-titration-markers`) | `boolean` | - | `false` | ✓ |
| `measurements` | `DiagramController` | controller owning all Chart.js diagrams | `new MeasurementRecorder(this)` | ✗ |
| `diagrams` | - | - | `new DiagramController(this)` | ✗ |
| `simulation` | `SimulationController` | controller owning the PixiJS ticker system (loop + registered functions) | `new SimulationController(this)` | ✗ |
| `circuits` | `CircuitSchedule` | the one clock per physical circuit that advances its chemistry | `new CircuitSchedule( this.simulation, () => this.activeInstruments(), (device) => this.circuitIdentity(device), (device) => this.advanceCircuit(device), )` | ✗ |
| `moleculeBuilderId` (`molecule-builder-id`) | `string` | - | `""` | ✓ |
| `ChemLab.shadowRootOptions` | `*` | early fix for webwriter focus issues | `{ ...LitElement.shadowRootOptions, delegatesFocus: true, }` | ✗ |
| `ChemLab.scopedElements` | - | - | - | ✗ |
| `canAuthor` | `boolean` | - | - | ✗ |
| `transferTarget` | `PIXI.Container \| undefined` | - | - | ✗ |
| `draggingPalette` | `boolean` | - | - | ✗ |
| `isDiagramPanelOpen` | `boolean` | - | - | ✗ |
| `selectedObjectSprite` | `PIXI.Container \| undefined` | - | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `itemName` | - | `key: string`
| `requestCanvasRender` | - | -
| `updateZoomLabel` | - | `zoom: number`
| `updateGridScale` | - | `widthPx: number`, `widthMm: number`
| `queueSurfaceDisplacement` | - | `electrode: chemlib.ElectricComponent`
| `reconcileCircuits` | Brings the circuit clocks in line with the instruments that are<br>switched on. Called whenever a lead, a bridge, a device or an<br>instrument changes, so a clock never outlives the circuit it belongs<br>to. | -
| `invalidateElectricalReadings` | - | `devices: readonly chemlib.ElectricComponent[]`
| `placeSelectedComponent` | Places the variant the palette holds, if one is held. The answer is<br>synchronous because the caller decides between placing and panning; the<br>placement itself waits for the texture of the variant and finishes on its<br>own. | `x: number`, `y: number`
| `saveComponentPosition` | - | `sprite: PIXI.Container`
| `saveComponentPositions` | - | `sprites: readonly PIXI.Container[]`
| `cancelDoseForNavigation` | - | -
| `clearChemicalSelection` | - | -
| `closeAmountMenu` | - | -
| `openChemicalAmountMenu` | - | `sprite: PIXI.Container`
| `trackVesselTransfer` | - | `source: chemlib.ChemComponent`, `anchor: PIXI.Container | undefined`, `point: PIXI.PointData`
| `finishDragTransfer` | - | `drop=false`
| `beginChemicalDose` | - | `sprite: PIXI.Container`, `pointerId: number`
| `removeObjects` | - | `sprites: readonly PIXI.Container[]`
| `clearObjectSelection` | - | -
| `connectElectrical` | Joins two devices with a cable. This is the single entry point for<br>wiring: the canvas drag, the restore path and the settings panel all go<br>through it, so a cable always lands in the same three places - the<br>device terminals, the component list and the canvas. | `from: chemlib.ElectricComponent`, `to: chemlib.ElectricComponent`, `terminalFrom: ?number`, `terminalTo: ?number`, `authored: boolean=true`
| `syncAuthoredConnections` | Rewrites the authored connection list of a device from its live<br>terminals. The order is what matters: `polarity` names the electrode on<br>terminal 0, so a rewire has to be written back in terminal order rather<br>than appended.<br><br>A cable is written back as the device on each of its ends, with `null`<br>for an end that hangs free, so the position in the list is the end. | `device: chemlib.ElectricComponent`
| `reportXApi` | Public entry point for reactive controllers to emit an xAPI statement.<br>Delegates to _sendxAPiStatement. | `action: string`, `context: string`, `extra: object`
| `closeDiagramPanel` | - | -
| `hasDiagramSource` | - | `label: string`
| `highlightDiagramSource` | - | `label: string`, `active: boolean`
| `clearDiagramSourceHighlight` | - | -
| `centerDiagramSource` | - | `label: string`
| `refreshDiagramPicker` | - | -
| `collectDiagramSuggestions` | - | -
| `reviewBuilderStructure` | - | `snapshot: Structure`
| `positionSelectionSummary` | - | `bounds: PIXI.Bounds | undefined`, `canvasWidth: number`, `canvasHeight: number`, `groupSelected: boolean`
| `positionAmountMenu` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `label` | `[object Object]` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


## `ChemLabPeriodicTable` (`<webwriter-chemlab-periodic-table>`)
Bilingual periodic table with a live element selection.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab-periodic-table.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab-periodic-table.js"></script>
<webwriter-chemlab-periodic-table></webwriter-chemlab-periodic-table>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/chemlab
```

```html
<link href="@webwriter/chemlab/widgets/webwriter-chemlab-periodic-table.css" rel="stylesheet">
<script type="module" src="@webwriter/chemlab/widgets/webwriter-chemlab-periodic-table.js"></script>
<webwriter-chemlab-periodic-table></webwriter-chemlab-periodic-table>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `ChemLabPeriodicTable.scopedElements` | `object` | Shoelace components used inside the shadow root.<br><br>`LitElementWw` renders through a scoped custom element registry, so a tag<br>that is missing here stays an unknown element: the toolbar would show the<br>bare text of its buttons and options instead of the controls. The entries<br>also keep the component modules in the bundle, because the imports are<br>otherwise unused and get tree-shaken away. The list includes the elements<br>the components use in their own templates, because a scoped registry does<br>not inherit them from the global one. | `{ "chemlab-atomic-figure": AtomicFigure, "sl-badge": SlBadge, "sl-button": SlButton, "sl-card": SlCard, "sl-carousel": SlCarousel, "sl-carousel-item": SlCarouselItem, "sl-dialog": SlDialog, "sl-divider": SlDivider, "sl-icon": SlIcon, "sl-icon-button": SlIconButton, "sl-input": SlInput, "sl-popup": SlPopup, "sl-spinner": SlSpinner, "sl-tag": SlTag, "sl-tooltip": SlTooltip, }` | ✗ |
| `ChemLabPeriodicTable.optionGroups` | `object` | - | `{ content: { label: { _: "Content", "de-DE": "Inhalt" }, collapsible: true, advanced: false }, appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false }, }` | ✗ |
| `ChemLabPeriodicTable.options` | `object` | - | `{ pauseShellElectrons: { ...pauseShellElectronsOption, group: "appearance" }, initialElement: { type: "number" as const, group: "content", attribute: "initial-element", label: { _: "Initial element (atomic number)", "de-DE": "Startelement (Ordnungszahl)" }, description: { _: "Atomic number from 1 to 118. Leave empty for no initial selection.", "de-DE": "Ordnungszahl von 1 bis 118. Leer lassen für keine Vorauswahl.", }, min: 1, max: 118, step: 1, }, view: { type: "select" as const, group: "appearance", label: { _: "Layout", "de-DE": "Darstellung" }, options: [ { value: "auto", label: { _: "Automatic", "de-DE": "Automatisch" } }, { value: "table", label: { _: "Table", "de-DE": "Tabelle" } }, { value: "list", label: { _: "List", "de-DE": "Liste" } }, ], }, }` | ✗ |
| `ChemLabPeriodicTable.actions` | `object` | - | `{ clearInitialElement: { label: { _: "Clear initial element", de: "Startelement entfernen" } }, }` | ✗ |
| `initialElement` (`initial-element`) | `number \| null` | Authored default element, `null` for no initial selection. | `null` | ✓ |
| `view` (`view`) | `PeriodicTableView` | Authored layout choice; invalid markup falls back to `auto`. | `"auto"` | ✓ |
| `pickerMode` (`picker-mode`) | `boolean` | Whether the rows act as an atom palette inside the Molecule Builder. | `false` | ✓ |
| `infoAnchor` | `PickerInfoAnchor \| null` | Free space the floating picker panel may occupy, in viewport coordinates.<br><br>The builder hands over the gap between its canvas cards, so the panel sits<br>in the canvas instead of beside the palette and never covers a card. The<br>rect is read on every reposition, which keeps the panel in place while the<br>page scrolls. Without an anchor the picker shows no panel. | `null` | ✗ |
| `pauseShellElectrons` (`pause-shell-electrons`) | `boolean` | - | `false` | ✓ |
| `selectedAtomicNumber` | `number \| null` | Currently selected atomic number, `null` when nothing is selected.<br><br>Live property without attribute reflection. Invalid writes are ignored and<br>keep the previous valid selection; a valid write dispatches no event. | - | ✗ |
| `effectiveView` | `PeriodicTableView` | Layout actually rendered: the learner's temporary choice wins over the author default. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `clearInitialElement` | Removes the authored initial element.<br><br>The native number option cannot always be cleared in the editor, so authors<br>get an explicit action for it. | -
| `refreshInfoAnchor` | Re-reads the free space of the floating panel.<br><br>The panel is anchored to a live rect instead of an element, so the popup<br>cannot watch the boxes that bound it. The builder observes them and calls<br>this after they change: the render updates the height limit and the<br>reposition moves the panel. | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Events
| Name | Description |
| :--: | :---------: |
| chemlab:element-drag | - |
| ELEMENT_SELECTION_EVENT | - |
| chemlab:element-selection | After a user action that changed the selection. |

*[Events](https://developer.mozilla.org/en-US/docs/Web/Events) are dispatched by the widget after certain triggers.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `label` | `[object Object]` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, custom CSS properties, or CSS parts.*


## `ChemLabMoleculeBuilder` (`<webwriter-chemlab-molecule-builder>`)


### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab-molecule-builder.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/chemlab/widgets/webwriter-chemlab-molecule-builder.js"></script>
<webwriter-chemlab-molecule-builder></webwriter-chemlab-molecule-builder>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/chemlab
```

```html
<link href="@webwriter/chemlab/widgets/webwriter-chemlab-molecule-builder.css" rel="stylesheet">
<script type="module" src="@webwriter/chemlab/widgets/webwriter-chemlab-molecule-builder.js"></script>
<webwriter-chemlab-molecule-builder></webwriter-chemlab-molecule-builder>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `ChemLabMoleculeBuilder.scopedElements` | `object` | - | `{ "webwriter-chemlab-periodic-table": ChemLabPeriodicTable, "chemlab-atomic-figure": AtomicFigure, "sl-badge": SlBadge, "sl-button": SlButton, "sl-details": SlDetails, "sl-icon": SlIcon, "sl-input": SlInput, "sl-popup": SlPopup, "sl-spinner": SlSpinner, "sl-tag": SlTag, }` | ✗ |
| `ChemLabMoleculeBuilder.options` | `object` | - | `{ pauseShellElectrons: pauseShellElectronsOption, elementSourceId: { type: "string" as const, attribute: "element-source-id", label: { _: "Linked periodic table ID", "de-DE": "ID des verknüpften Periodensystems" }, }, labId: { type: "string" as const, attribute: "lab-id", label: { _: "Linked ChemLab ID", "de-DE": "ID des verknüpften ChemLab" }, }, }` | ✗ |
| `elementSourceId` (`element-source-id`) | `string` | - | `""` | ✓ |
| `labId` (`lab-id`) | `string` | - | `""` | ✓ |
| `pauseShellElectrons` (`pause-shell-electrons`) | `boolean` | - | `false` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `viewCatalogStructure` | - | `key: string`
| `viewAtom` | Opens an isolated element from another widget on the worksheet. | `atomicNumber: number`, `model: AtomicModel="bohr"`
| `viewStructure` | - | `snapshot: Structure`

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `label` | `[object Object]` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.15.0*