/**
 * Styles of the periodic table widget.
 *
 * The table reuses the lab widget's neutral Shoelace surfaces and adds one
 * labelled family palette of its own. Layout switches on container width, so the
 * same markup serves a narrow worksheet column and a full-width embed; only the
 * table pane scrolls horizontally, and only when a narrow instance explicitly
 * asks for the table.
 *
 * @module periodic-table/styles
 */

import { css } from "lit";

/** Shadow styles of the periodic table widget. */
export const periodicTableStyles = css`
	/* The widget takes the same box as the lab widget: a fixed default size that
	   the author can shrink, and a corner grip outside fullscreen. The height is
	   fixed instead of grown by the content, so the table and the list scroll
	   inside the box and an embed never pushes the page around. */
	:host {
		display: block;
		box-sizing: border-box;
		inline-size: 800px;
		max-inline-size: 100%;
		block-size: 600px;
		min-inline-size: min(260px, 100%);
		min-block-size: 280px;
		padding: 0.75rem;
		font-family: var(--sl-font-sans, system-ui, sans-serif);
		color: var(--sl-color-neutral-900, #1c1c1e);
		background: var(--sl-color-neutral-0, #ffffff);

		--pt-cell-height: 2.85rem;
		/* Height of one control in the ribbon. The family tags, the icon buttons
		   and the mode switch all take it, so the bar reads as one row of chips. */
		--pt-chip-height: 1.35rem;
		--pt-details-border: 1px;
		--pt-cell-bar: 0.22rem;
		--pt-gutter: 1.5rem;
		--pt-series-gap: 0.5rem;
		--pt-radius: 4px;
		--pt-border: var(--sl-color-neutral-200, #e2e2e6);
		--pt-surface: var(--sl-color-neutral-0, #ffffff);
		--pt-inset: var(--sl-color-neutral-50, #f7f7f8);
		--pt-ink: var(--sl-color-neutral-900, #1c1c1e);
		--pt-ink-soft: var(--sl-color-neutral-700, #3f3f46);
		--pt-accent: var(--sl-color-primary-600, #0b6bcb);
		/* Surface and shadow of the lab widget's canvas controls and object info
		   panel, so the toolbar buttons and the detail card speak the same
		   visual language as the rest of ChemLab. */
		--pt-control-shadow: 0 1px 3px rgb(0 0 0 / 14%);
		--pt-panel-shadow: 0 2px 8px rgb(0 0 0 / 9%);
		/* The open detail card covers the cells below it, so it needs a shadow
		   that lifts it off the table instead of one that only softens an edge. */
		--pt-overlay-shadow: 0 10px 26px rgb(0 0 0 / 20%), 0 2px 6px rgb(0 0 0 / 10%);

		--pt-alkali-metal: #f2a3a3;
		--pt-alkaline-earth-metal: #f7c99a;
		--pt-transition-metal: #f0dd93;
		--pt-post-transition-metal: #cfe3a4;
		--pt-metalloid: #a9dcc6;
		--pt-nonmetal: #a6d2ee;
		--pt-halogen: #9fb8e8;
		--pt-noble-gas: #b9a8e0;
		--pt-lanthanide: #d8a8d8;
		--pt-actinide: #e8a8c0;
		--pt-unknown: #d8d8d8;

		--pt-state-solid: #d7e3f4;
		--pt-state-liquid: #cfe9d8;
		--pt-state-gas: #f6e3c0;
		--pt-state-unknown: #e6e6e9;
	}

	:host(:not(:fullscreen)) {
		resize: both;
		overflow: hidden;
	}

	* {
		box-sizing: border-box;
	}

	.widget {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		block-size: 100%;
		min-block-size: 0;
	}

	.category-alkali-metal {
		--pt-cell-fill: var(--pt-alkali-metal);
	}
	.category-alkaline-earth-metal {
		--pt-cell-fill: var(--pt-alkaline-earth-metal);
	}
	.category-transition-metal {
		--pt-cell-fill: var(--pt-transition-metal);
	}
	.category-post-transition-metal {
		--pt-cell-fill: var(--pt-post-transition-metal);
	}
	.category-metalloid {
		--pt-cell-fill: var(--pt-metalloid);
	}
	.category-nonmetal {
		--pt-cell-fill: var(--pt-nonmetal);
	}
	.category-halogen {
		--pt-cell-fill: var(--pt-halogen);
	}
	.category-noble-gas {
		--pt-cell-fill: var(--pt-noble-gas);
	}
	.category-lanthanide {
		--pt-cell-fill: var(--pt-lanthanide);
	}
	.category-actinide {
		--pt-cell-fill: var(--pt-actinide);
	}
	.category-unknown {
		--pt-cell-fill: var(--pt-unknown);
	}

	/* One lightly shaded bar carries search, family filter, result count and the
	   icon buttons, so the controls read as a single unit instead of scattered
	   rows. */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.45rem;
		border: 1px solid var(--pt-border);
		border-radius: 8px;
		background: var(--pt-inset);
	}

	.toolbar .search {
		flex: 0 1 14rem;
		min-width: 7rem;
	}

	.toolbar sl-input::part(form-control-label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* The result count rides in the toolbar as a pill badge; the full sentence
	   stays available to screen readers through the hidden live region. */
	.count-badge {
		flex: 0 0 auto;
	}

	.count-badge::part(base) {
		font-variant-numeric: tabular-nums;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* Layout switch and reset are compact icon buttons with a tooltip and an
	   accessible label, styled like the canvas controls of the lab widget: a
	   light surface with a small shadow on the shaded bar. */
	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-inline-start: auto;
	}

	.views {
		display: flex;
		gap: 0.25rem;
	}

	/* The ribbon buttons sit on the surface of the panel. The active view button
	   keeps the accent fill of its primary variant, because the surface override
	   would leave its white icon on a white box. */
	.toolbar sl-button:not([variant="primary"])::part(base) {
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
	}

	.toolbar sl-button::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.4rem;
	}

	/* Every control in the ribbon takes the height of a family tag, so the bar
	   reads as one row of equal chips instead of a mix of sizes. The mode switch
	   sits in the row below and follows, because it belongs to the same band. */
	.toolbar sl-button,
	.modes sl-button {
		--sl-input-height-small: var(--pt-chip-height);
		--sl-button-font-size-small: 0.7rem;
	}

	.modes sl-button::part(label) {
		padding: 0 0.4rem;
	}

	.toolbar sl-icon-button::part(base) {
		padding: 0.25rem;
		font-size: 0.85rem;
	}

	/* The pane is the only part that scrolls: the ribbon and the mode row stay
	   put while the table or the list moves under them, and the widget itself
	   never grows past the height it was given. */
	.table-pane {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		padding-bottom: 0.25rem;
	}

	.grid {
		display: grid;
		grid-template-columns: var(--pt-gutter) repeat(18, minmax(0, 1fr));
		grid-template-rows:
			auto repeat(7, minmax(var(--pt-cell-height), auto))
			var(--pt-series-gap) repeat(2, minmax(var(--pt-cell-height), auto));
		gap: 2px;
		min-width: 30rem;
	}

	.grid-row {
		display: contents;
	}

	.cell,
	.gutter,
	.group-label,
	.placeholder,
	.series-header {
		grid-row: var(--pt-row);
		grid-column: var(--pt-column);
	}

	/* The detail card is a grid item of the table, so it starts in the free block
	   above the transition metals. The slot is only the box: the card inside it is
	   positioned and only as tall as its key rows, so it never stretches the rows
	   it spans and may reach over the cells below when it is expanded. The slot is
	   also the query container of the card, so the card can drop the conditions
	   when the block gets narrow. */
	.details-slot {
		position: relative;
		grid-row: var(--pt-row) / span var(--pt-row-span, 1);
		grid-column: var(--pt-column) / span var(--pt-column-span, 1);
		container-type: inline-size;
		min-width: 0;
		min-height: 0;
	}

	.group-label,
	.gutter {
		display: grid;
		place-items: center;
		font-size: 0.6rem;
		color: var(--pt-ink-soft);
	}

	.series-header {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 0.3rem;
		font-size: 0.65rem;
		color: var(--pt-ink-soft);
		text-align: right;
	}

	/* The cell keeps the element cards of the lab widget, but quieter: a neutral
	   border and one thin family-coloured edge along the bottom, so the family is
	   named once instead of framing the tile twice. The cell is its own container,
	   so the name appears exactly where it fits. */
	.cell {
		position: relative;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		min-height: var(--pt-cell-height);
		padding: 2px 1px calc(var(--pt-cell-bar) + 2px);
		overflow: hidden;
		border: 1px solid var(--pt-border);
		border-radius: var(--pt-radius);
		background: var(--pt-surface);
		color: var(--pt-ink);
		font: inherit;
		line-height: 1.05;
		text-align: center;
		cursor: pointer;
	}

	.cell::after {
		content: "";
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		height: var(--pt-cell-bar);
		background: var(--pt-cell-fill, var(--pt-border));
	}

	/* A mode fills the card with the state colour and keeps the family edge, so
	   both readings stay visible at once. */
	.cell.state-solid {
		background: var(--pt-state-solid);
	}
	.cell.state-liquid {
		background: var(--pt-state-liquid);
	}
	.cell.state-gas {
		background: var(--pt-state-gas);
	}

	/* The atomic number sits in a consistent corner; the discovery year takes the
	   opposite one. */
	.cell-number {
		position: absolute;
		inset-block-start: 1px;
		inset-inline-start: 3px;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.cell-year {
		position: absolute;
		inset-block-start: 1px;
		inset-inline-end: 2px;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.cell:hover {
		border-color: color-mix(in srgb, var(--pt-ink) 35%, var(--pt-border));
	}

	/* The family filter fades the cells it leaves out instead of removing them:
	   the table keeps its shape, so the learner still reads where the family
	   sits. A light blur keeps the faded text from competing with the matching
	   cells, and the faded tile still answers a click. */
	.cell.is-faded,
	.placeholder.is-faded,
	.series-header.is-faded {
		opacity: 0.32;
		filter: blur(0.4px) saturate(0.45);
	}

	.cell.is-faded:hover,
	.cell.is-faded:focus-visible {
		opacity: 0.75;
		filter: none;
	}

	/* Selection stays ChemLab blue; keyboard focus gets its own dark outer ring,
	   so the two states never look alike. */
	.cell:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 1px;
	}

	.cell[aria-selected="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 2px var(--pt-accent);
	}

	.cell-symbol {
		font-size: 1rem;
		font-weight: 700;
	}

	.cell-name {
		display: none;
		max-width: 100%;
		overflow: hidden;
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The name shows where the cell itself is wide enough to hold it. The query
	   measures the content box, so the threshold sits below the 47 px a cell
	   reaches at a 1000 px host. */
	@container (min-width: 2.75rem) {
		.cell-name {
			display: block;
		}
	}

	.placeholder {
		display: flex;
	}

	.placeholder-text {
		display: grid;
		place-items: center;
		width: 100%;
		min-height: var(--pt-cell-height);
		border: 1px dashed color-mix(in srgb, var(--pt-ink) 25%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-size: 0.6rem;
		color: var(--pt-ink-soft);
	}

	/* The families are a Shoelace carousel in the ribbon: one row that scrolls
	   sideways instead of wrapping into a second and third line, which is what
	   keeps the ribbon a single band at every width. The reset sits outside the
	   carousel, so it never scrolls out of reach. The small flex basis matters: a
	   basis of auto would be the full width of all tags, and the toolbar would
	   break the strip onto a line of its own before it ever shrank. */
	.family-strip {
		flex: 1 1 6rem;
		min-width: 7rem;
		--slide-gap: 0.25rem;
		/* The carousel sizes its slides from an aspect ratio, which would give a
		   one-row strip the height of a picture. Auto lets the tags decide the
		   height; the items inherit the same value. */
		--aspect-ratio: auto;
	}

	/* The carousel brings its own grid, gaps and arrow padding. The ribbon needs
	   the tags to sit as tightly as the rest of the bar, and each slide to take
	   the width of its own tag instead of an equal share of the strip. */
	.family-strip::part(base) {
		gap: 0.1rem;
	}

	.family-strip::part(scroll-container) {
		--slide-size: max-content;
	}

	/* The arrows take the height of a tag, so the strip reads as one row of
	   chips instead of a row of tags with two small buttons beside them. */
	.family-strip::part(navigation-button) {
		min-height: var(--pt-chip-height);
		padding: 0 0.1rem;
		font-size: 0.8rem;
	}

	/* Family names and the temperature key share one treatment: narrow
	   rectangular tags with a swatch, so neither reads as a competing control.
	   The family tags are the filter; the active one gets a clear selected state
	   in ChemLab blue. */
	.family-tag,
	.state-legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.12rem 0.4rem;
		border: 1px solid var(--pt-border);
		border-radius: 3px;
		background: var(--pt-surface);
		color: var(--pt-ink-soft);
		font-size: 0.7rem;
	}

	.family-tag {
		flex: 0 0 auto;
		min-height: var(--pt-chip-height);
		font: inherit;
		font-size: 0.7rem;
		white-space: nowrap;
		cursor: pointer;
	}

	.family-tag[aria-pressed="true"] {
		border-color: var(--pt-accent);
		background: color-mix(in srgb, var(--pt-accent) 10%, var(--pt-surface));
		box-shadow: inset 0 0 0 1px var(--pt-accent);
		color: var(--pt-ink);
	}

	.family-tag:focus-visible,
	.list-row:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 1px;
	}

	.family-swatch,
	.state-swatch {
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 15%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill);
	}

	.modes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.mode-group {
		display: flex;
		gap: 0.25rem;
	}

	.mode-slider {
		display: flex;
		flex: 1 1 16rem;
		align-items: center;
		gap: 0.5rem;
		min-width: 12rem;
	}

	.mode-slider sl-range {
		flex: 1 1 auto;
		min-width: 6rem;
	}

	/* The active mode button already names the quantity, so the range label is
	   only kept for assistive technology. */
	.mode-slider sl-range::part(form-control-label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* The current slider value rides beside the slider as a small tag. */
	.mode-value {
		flex: 0 0 auto;
	}

	.mode-value::part(base) {
		font-variant-numeric: tabular-nums;
	}

	.state-legend {
		display: flex;
		flex: 0 0 auto;
		flex-wrap: wrap;
		gap: 0.25rem 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.state-swatch.state-solid {
		background: var(--pt-state-solid);
	}
	.state-swatch.state-liquid {
		background: var(--pt-state-liquid);
	}
	.state-swatch.state-gas {
		background: var(--pt-state-gas);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.75rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--pt-border);
		border-radius: var(--pt-radius);
		background: var(--pt-surface);
		color: var(--pt-ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.list-row:hover {
		background: var(--pt-inset);
	}

	.list-number {
		width: 2rem;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
		text-align: right;
	}

	.list-symbol {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-weight: 600;
	}

	.list-name {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.list-category {
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	/* The mode rides along at the end of the row: the state as a coloured tag,
	   the discovery year as a quiet one, so the narrow list keeps the mode's
	   meaning. */
	.list-state::part(base),
	.list-year::part(base) {
		height: auto;
		padding: 0 0.3rem;
		font-size: 0.6rem;
		line-height: 1.35;
	}

	.list-year::part(base) {
		font-variant-numeric: tabular-nums;
	}

	/* In the list the card stands in for the selected row, so it sits in the flow
	   of the list and is always open: no overlay, no fixed height, no toggle. */
	.list-details {
		position: relative;
		margin: 0.25rem 0;
	}

	.list-details .details-shell {
		position: static;
		max-height: none;
		/* The card is always open here, so nothing needs clipping. The shell
		   would otherwise cut off the focus ring of the card it holds. */
		overflow: visible;
	}

	/* In the list the card sits in the flow of the rows instead of over the
	   table, so it keeps the softer panel shadow. */
	.list-details .details-card::part(base) {
		height: auto;
		box-shadow: var(--pt-panel-shadow);
	}

	.list-details .details-card::part(body) {
		flex: 0 0 auto;
		padding-bottom: 6px;
		overflow: visible;
	}

	/* The detail card is a Shoelace card with the same white surface, subtle
	   outline and soft shadow as the object info panel of the lab widget. The
	   shell is the positioned box inside the slot: collapsed it takes only the
	   height of its content, so the card is as slim as its key rows and the
	   periods around it keep their cells. */
	.details-shell {
		position: absolute;
		inset: 0 0 auto 0;
		display: flex;
		max-height: 100%;
		min-width: 0;
		overflow: hidden;
	}

	/* The open card grows downwards from the top of the block and covers the
	   cells below it. The stronger shadow lifts it off the table, so the overlay
	   reads as a layer and not as a taller cell. */
	.details-shell.is-expanded {
		inset: 0 0 auto 0;
		height: auto;
		max-height: none;
		overflow: visible;
		z-index: 6;
	}

	.details-card {
		flex: 1;
		min-width: 0;
		min-height: 0;
		--padding: 0;
		--border-color: var(--sl-color-neutral-200, #e4e4e7);
		--border-width: var(--pt-details-border);
		--border-radius: 5px;
		--sl-panel-background-color: var(--pt-surface);
	}

	/* The card takes the height of its key rows instead of the height of the
	   block, so the panel stays slim and the periods around it keep their cells.
	   It floats over the block even when it is collapsed, so it always carries
	   the lifting shadow that sets it apart from the cells around it. */
	.details-card::part(base) {
		height: auto;
		overflow: hidden;
		box-shadow: var(--pt-overlay-shadow);
	}

	/* The card takes focus when it replaces the selected list row, so it needs a
	   ring of its own: the default one hugs the border and reads as a second
	   frame. It takes the selection blue, because the card is the selection. */
	.details-card:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	/* The header carries the identity of the element in one row: the coloured
	   thumbnail, the name, the atomic number, the family, and the conditions the
	   state values refer to. It sits on the inset surface, so the card reads as a
	   titled panel instead of a plain box. */
	.details-card::part(header) {
		padding: 4px 8px;
		border-bottom: 1px solid var(--pt-border);
		background: color-mix(in srgb, var(--pt-cell-fill, var(--pt-inset)) 16%, var(--pt-surface));
	}

	.details-head {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
	}

	.details-thumb {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 12%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-surface));
		font-size: 0.85rem;
		font-weight: 700;
		line-height: 1;
	}

	.details-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.15;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The number is a quiet badge on the inset band, the family a tag in the
	   colour of the cell, so the header names the element twice without shouting. */
	.details-number::part(base) {
		background: var(--pt-surface);
		border-color: var(--pt-border);
		color: var(--pt-ink-soft);
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
	}

	.details-family::part(base) {
		height: auto;
		padding: 1px 0.35rem;
		border-color: color-mix(in srgb, var(--pt-cell-fill, var(--pt-border)) 55%, var(--pt-border));
		background: color-mix(in srgb, var(--pt-cell-fill, var(--pt-inset)) 45%, var(--pt-surface));
		color: var(--pt-ink);
		font-size: 0.6rem;
		line-height: 1.2;
	}

	.details-conditions {
		margin-inline-start: auto;
		padding-inline-start: 0.35rem;
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: var(--pt-ink-soft);
	}

	/* The body holds the key rows and, once the card is open, the sections below
	   them. Collapsed it keeps room for the toggle in its bottom-right corner and
	   scrolls if a value needs more lines than the block has. */
	.details-card::part(body) {
		display: flex;
		flex: 1;
		min-height: 0;
		padding: 6px 8px 1.5rem;
		overflow: auto;
	}

	/* The open card grows with its content instead of scrolling, and keeps room
	   for the toggle in its bottom-right corner. */
	.details-shell.is-expanded .details-card::part(body) {
		flex: 0 0 auto;
		overflow: visible;
		padding-bottom: 1.9rem;
	}

	/* The body is the single flex item of the card body, so it has to take the full
	   width itself: the key rows and the sections below them stack inside it. */
	.details-body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	/* The key rows answer the two questions the table asks: how heavy the element
	   is, and what the current mode says about it. They are the only rows the
	   collapsed card shows, so they get the readable size. */
	.details-key .details-row {
		font-size: 0.8rem;
		line-height: 1.4;
	}

	/* The open card adds the remaining sections below the key rows, in as many
	   columns as the block allows: side by side while there is room, stacked when
	   the card is narrow. A wrapping flex row instead of a grid, because the
	   sections then share the width of their own line: a grid would open as many
	   narrow columns as fit and leave the rest of the row empty, which reads as a
	   hole in the wide card of the list view. */
	.details-more {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem 0.9rem;
		align-items: flex-start;
		margin-top: 0.4rem;
		padding-top: 0.4rem;
		border-top: 1px solid var(--pt-border);
	}

	.details-section {
		display: flex;
		flex: 1 1 8.5rem;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	/* The electron configuration and the shell counts are long values that wrap
	   badly in a third of the card, so the structure section takes the full width
	   and starts a row of its own. */
	.details-section-structure {
		flex-basis: 100%;
	}

	/* The section headings are tags, so they read as labels of the card instead of
	   as another line of running text. The tag keeps the width of its text; a
	   stretched tag would read as a divider bar. */
	.details-heading {
		align-self: flex-start;
	}

	.details-heading::part(base) {
		height: auto;
		padding: 0 0.3rem;
		border-color: var(--pt-border);
		background: var(--pt-inset);
		color: var(--pt-ink-soft);
		font-size: 0.58rem;
		font-weight: 600;
		line-height: 1.45;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.details-rows {
		display: flex;
		flex-direction: column;
		margin: 0;
	}

	/* Label and value share a row, the value keeps its own column so a long
	   configuration wraps under itself instead of under the label. */
	.details-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: 0 0.3rem;
		min-width: 0;
		font-size: 0.75rem;
		line-height: 1.35;
	}

	.details-row dt {
		color: var(--pt-ink-soft);
		white-space: nowrap;
	}

	.details-row dt::after {
		content: ":";
	}

	.details-row dd {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		overflow-wrap: anywhere;
		font-variant-numeric: tabular-nums;
	}

	/* The state is a tag in the colour of the state, so the value is readable at a
	   glance instead of hanging on a dot of half a millimetre. The detail card and
	   the list rows share the tag. */
	.state-tag::part(base) {
		height: auto;
		padding: 0 0.3rem;
		border-color: color-mix(in srgb, var(--pt-ink) 18%, transparent);
		color: var(--pt-ink);
		font-size: 0.6rem;
		line-height: 1.35;
	}

	.state-tag.state-solid::part(base) {
		background: var(--pt-state-solid);
	}

	.state-tag.state-liquid::part(base) {
		background: var(--pt-state-liquid);
	}

	.state-tag.state-gas::part(base) {
		background: var(--pt-state-gas);
	}

	.state-tag.state-unknown::part(base) {
		background: var(--pt-state-unknown);
	}

	/* The toggle sits in the bottom-right corner of the card, where the eye ends
	   after the key rows. It is a compact icon button like the canvas controls, and
	   its arrow turns over while the card is open. */
	.details-toggle {
		position: absolute;
		right: 4px;
		bottom: 4px;
	}

	.details-toggle::part(base) {
		width: 1.35rem;
		height: 1.35rem;
		min-height: 0;
		padding: 0;
		border-color: var(--pt-border);
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
		color: var(--pt-ink-soft);
	}

	.details-toggle::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.details-toggle svg {
		transition: transform 120ms ease;
	}

	.details-shell.is-expanded .details-toggle svg {
		transform: rotate(180deg);
	}

	.details-qualifier::part(base) {
		background: var(--pt-inset);
		border-color: var(--pt-border);
		color: var(--pt-ink-soft);
		font-size: 0.5rem;
		line-height: 1.3;
	}

	/* The empty card has no header, so its body takes the whole height. */
	.details-card-empty::part(body) {
		display: grid;
		place-items: center;
	}

	.details-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		margin: 0;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
		text-align: center;
	}

	.details-empty-icon {
		font-size: 1.1rem;
		color: var(--pt-ink-soft);
	}

	/* A narrow card drops the conditions from the header: the temperature is set
	   by the slider above the table, so the line is the first thing that can go
	   without losing a value. */
	@container (max-width: 22rem) {
		.details-conditions {
			display: none;
		}
	}

	/* The sources and the model notes live in a dialog behind the info button, so
	   the card stays a card. The dialog gets wider margins than the Shoelace
	   default, because it carries running text and a list of sources. */
	.info::part(panel) {
		max-width: min(44rem, 92vw);
	}

	.info::part(header) {
		padding: 1.25rem 2rem 0;
	}

	.info::part(title) {
		font-size: 1.05rem;
	}

	.info::part(body) {
		padding: 1rem 2rem 1.5rem;
	}

	.info::part(footer) {
		padding: 0 2rem 1.5rem;
	}

	/* The widget ships no icon assets, so the built-in close button would ask a
	   CDN for its glyph. The footer button and Escape close the dialog instead. */
	.info::part(close-button) {
		display: none;
	}

	.info-intro {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
	}

	.info-section {
		margin-top: 1.75rem;
	}

	.info-section h3 {
		margin: 0 0 0.6rem;
		font-size: 0.95rem;
	}

	.info-note {
		margin: 0.6rem 0 0;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--pt-ink-soft);
	}

	.info-source {
		padding: 0.9rem 0;
		border-top: 1px solid var(--pt-border);
	}

	.info-source:first-of-type {
		padding-top: 0;
		border-top: none;
	}

	.info-source-title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.info-source-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin: 0.4rem 0 0;
	}

	.info-source-text {
		margin: 0.4rem 0 0;
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--pt-ink-soft);
	}

	.info-source-link {
		font-size: 0.82rem;
		color: var(--pt-accent);
		overflow-wrap: anywhere;
	}


	.print-overview {
		display: none;
	}

	.print-title {
		margin: 0 0 0.4rem;
		font-size: 1rem;
	}

	.print-grid {
		display: grid;
		grid-template-columns: var(--pt-gutter) repeat(18, minmax(0, 1fr));
		grid-template-rows:
			auto repeat(7, minmax(1.5rem, auto))
			var(--pt-series-gap) repeat(2, minmax(1.5rem, auto));
		gap: 1px;
	}

	.print-cell,
	.print-gutter,
	.print-group,
	.print-placeholder,
	.print-series {
		grid-row: var(--pt-row);
		grid-column: var(--pt-column);
	}

	.print-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 30%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill, var(--pt-inset));
		line-height: 1.05;
	}

	.print-number {
		font-size: 0.45rem;
		color: var(--pt-ink-soft);
	}

	.print-symbol {
		font-size: 0.7rem;
		font-weight: 600;
	}

	.print-gutter,
	.print-group {
		display: grid;
		place-items: center;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
	}

	.print-series {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 0.2rem;
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
	}

	.print-placeholder {
		border: 1px dashed color-mix(in srgb, var(--pt-ink) 30%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill, var(--pt-inset));
	}

	.print-details {
		margin-top: 0.6rem;
		font-size: 0.7rem;
	}

	.print-details h3 {
		margin: 0 0 0.2rem;
		font-size: 0.85rem;
	}

	.print-fields {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.1rem 0.5rem;
		margin: 0;
	}

	.print-fields div {
		display: contents;
	}

	.print-fields dt {
		color: var(--pt-ink-soft);
	}

	.print-fields dd {
		margin: 0;
	}

	.print-hint {
		margin: 0.3rem 0 0;
		color: var(--pt-ink-soft);
	}

	@media print {
		/* The printed sheet is as tall as its content, so the fixed box and the
		   scrolling pane are undone here. */
		:host {
			block-size: auto;
			min-block-size: 0;
			overflow: visible;
			padding: 0;
		}

		.widget {
			block-size: auto;
		}

		.toolbar,
		.modes,
		.state-legend,
		.table-pane {
			display: none !important;
		}

		.print-overview {
			display: block;
		}

		.print-cell,
		.print-placeholder {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}

	:host(.ww-beforeprint) .toolbar,
	:host(.ww-beforeprint) .modes,
	:host(.ww-beforeprint) .state-legend,
	:host(.ww-beforeprint) .table-pane {
		display: none !important;
	}

	:host(.ww-beforeprint) .print-overview {
		display: block;
	}

	@media (forced-colors: active) {
		.cell,
		.list-row,
		.family-tag,
		.state-legend li,
		.details-card,
		.placeholder-text {
			border: 1px solid CanvasText;
			background: Canvas;
		}

		/* Focus is an outer ring, selection a thick border, so the two states
		   stay distinct without colour. */
		.cell:focus-visible,
		.list-row:focus-visible,
		.family-tag:focus-visible {
			outline: 2px solid Highlight;
			outline-offset: 2px;
		}

		.cell[aria-selected="true"],
		.family-tag[aria-pressed="true"] {
			border: 2px solid Highlight;
			box-shadow: none;
		}
	}
`;
