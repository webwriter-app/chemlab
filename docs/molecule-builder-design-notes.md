# Molecule Builder design backlog

The builder, the standalone periodic table, and ChemLab were reviewed side by side. The builder already shares the other widgets’ Shoelace controls, selected blue, light gray surfaces, and thin borders. The main opportunities are to make the canvas the visual focus, give each action a predictable location, and make the structure easy to read.

## 1. Give the canvas a clear control hierarchy

The header, open catalog row, tool row, and palette header each look like a toolbar. Opening a catalog structure also leaves the chooser above the canvas, showing the name a second time. Keep one document header for the current structure and entry points to the catalog, files, and ChemLab. Present catalog and file actions in a compact surface anchored to their button. Use one canvas control row for selection, atom placement, and bonds. Put the `3D` / `2D` switch, zoom, and fit on the canvas, using the same icon sizes, surfaces, and focus treatment as the ChemLab controls. Show bond-order choices beside the bond tool while it is active.

## 2. Make the elements palette a workspace panel

In the embedded list, use the periodic table’s element accents and selected-cell treatment to identify the active element. The palette currently repeats that selection in a separate tag and gives **Add atom** equal prominence to **Place atom**. Use the palette selection to identify what will be placed and give the canvas tool the placement affordance. Keep one explicit keyboard and touch alternative to dragging. In a narrow embed, make the list a collapsible panel so an open palette leaves part of the scene visible. Use ChemLab’s attached drawer handle as the interaction reference. In a full-width embed, keep the 40/60 grid split and switch back to a list if the palette gets too narrow for readable grid symbols.

## 3. Bring selection and model information together

The inspector currently sits in a full-width strip below the workspace. The model label, source, and ion legend sit separately and can spread far apart across a wide canvas. Keep a single model summary at the canvas edge with the compound, representation, and any active overlay legend. Use a compact card for the selected atom or site, following ChemLab’s object info card. In the 3D view, anchor the card to a canvas edge so it stays stable while rotating. Show coordinates, occupancy, cell metrics, and provenance in expandable details. Keep read-only previews and editable drafts visually distinct through a short status tag and a single primary action.

## 4. Make the structure itself easier to read

The default fit on a wide display leaves a small crystal in the middle of a large workspace. Let fit use more of the available short edge while reserving clearance for canvas controls and the largest atom. In crystals, group repetition, cell edges, and lattice markers under a shared set of display controls. Add an optional small orientation cue for the cell axes. When lattice points are active, put their marker beside the ion swatches to explain what the dots represent. Keep valence electron controls in the same position for molecules. Use the periodic table’s category colours for element navigation and the formula-keyed ion palette inside the structure view.

## Suggested order

1. Consolidate workspace controls and improve fit. Check one simple molecule, a hydrate, and a crystal with three or more cells per axis.
2. Improve the embedded palette and selected-site card. Check keyboard-only placement, touch placement, and narrow and full-width worksheets.
3. Refine preview and handoff. Check the catalog, a downloaded structure, and ChemLab receiving an editable draft in the same worksheet.
