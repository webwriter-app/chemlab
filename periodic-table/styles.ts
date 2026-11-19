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
	:host {
		display: block;
		box-sizing: border-box;
		padding: 0.75rem;
		font-family: var(--sl-font-sans, system-ui, sans-serif);
		color: var(--sl-color-neutral-900, #1c1c1e);
		background: var(--sl-color-neutral-0, #ffffff);

		--pt-cell-height: 3rem;
		/* The detail card spans three rows of the table and the two gaps between
		   them, so its height follows the cell height instead of its content. */
		--pt-details-height: calc(3 * var(--pt-cell-height) + 4px);
		--pt-details-border: 1px;
		--pt-cell-bar: 0.4rem;
		--pt-gutter: 1.5rem;
		--pt-series-gap: 0.5rem;
		--pt-radius: 4px;
		--pt-border: var(--sl-color-neutral-200, #e2e2e6);
		--pt-surface: var(--sl-color-neutral-0, #ffffff);
		--pt-inset: var(--sl-color-neutral-50, #f7f7f8);
		--pt-ink: var(--sl-color-neutral-900, #1c1c1e);
		--pt-ink-soft: var(--sl-color-neutral-700, #3f3f46);
		--pt-accent: var(--sl-color-primary-600, #0b6bcb);

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

	* {
		box-sizing: border-box;
	}

	.widget {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.5rem;
	}

	/* The info button sits at the top of the toolbar, while the fields keep their
	   labels above them and therefore align to the bottom. */
	.toolbar .info-button {
		align-self: start;
	}

	.toolbar .search {
		flex: 1 1 12rem;
		min-width: 8rem;
	}

	.toolbar .filter {
		flex: 0 1 11rem;
		min-width: 8rem;
	}

	.toolbar sl-input::part(form-control-label),
	.toolbar sl-select::part(form-control-label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.views {
		display: flex;
		gap: 0.25rem;
	}

	.result-count {
		min-height: 1rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--pt-ink-soft);
	}

	.table-pane {
		min-width: 0;
		overflow-x: auto;
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

	/* The detail card is a grid item of the table, so it fills the free block
	   above the transition metals and never covers a cell. It is also the query
	   container of the card, so the card can stack its columns when the block
	   gets narrow. */
	.details-slot {
		display: grid;
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

	/* The cell copies the element cards of the lab widget: a white card with a
	   thin border in the family colour, the symbol in the middle and a bar of the
	   same colour along the bottom edge. */
	.cell {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		min-height: var(--pt-cell-height);
		padding: 2px 1px calc(var(--pt-cell-bar) + 2px);
		overflow: hidden;
		border: 1.5px solid var(--pt-cell-fill, var(--pt-border));
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

	/* A mode fills the card with the state colour and keeps the family bar, so
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
	.cell.state-unknown {
		background: var(--pt-state-unknown);
	}

	.cell.is-dimmed {
		opacity: 0.35;
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
		filter: brightness(0.96);
	}

	.cell[aria-disabled="true"] {
		opacity: 0.3;
		cursor: default;
	}

	.cell[aria-disabled="true"]:hover {
		filter: none;
	}

	.cell:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.cell[aria-selected="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 2px var(--pt-accent);
	}

	.cell-number {
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
	}

	.cell-symbol {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.cell-name {
		display: none;
		max-width: 100%;
		overflow: hidden;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@container (min-width: 1000px) {
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

	.series-jumps {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.4rem;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.4rem;
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--pt-border);
		border-radius: 999px;
		background: var(--pt-surface);
		color: var(--pt-ink-soft);
		font: inherit;
		font-size: 0.7rem;
		cursor: pointer;
	}

	.legend-item[aria-pressed="true"] {
		border-color: var(--pt-accent);
		color: var(--pt-ink);
		box-shadow: inset 0 0 0 1px var(--pt-accent);
	}

	.legend-item:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.legend-swatch {
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

	.mode-value {
		flex: 0 0 auto;
		min-width: 5.5rem;
		font-size: 0.75rem;
		color: var(--pt-ink-soft);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.state-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	.state-legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.state-swatch {
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 15%, transparent);
		border-radius: 2px;
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
	.state-swatch.state-unknown {
		background: var(--pt-state-unknown);
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

	.list-row:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.list-row[aria-pressed="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 1px var(--pt-accent);
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

	.list-details {
		margin: 0.25rem 0 0.5rem;
	}

	/* The detail card is a Shoelace card, so it shares the surface, the border and
	   the header rhythm of the rest of the widget. It fills the free block of the
	   table, so its height is pinned to the three rows it spans: a card that grows
	   with its content would stretch those rows and leave the periods with uneven
	   cells. A long element scrolls inside the body instead. */
	.details-card {
		height: var(--pt-details-height);
		min-width: 0;
		--padding: 0;
		--border-color: var(--sl-color-neutral-300, #d4d4d8);
		--border-width: var(--pt-details-border);
		--border-radius: 6px;
		--sl-panel-background-color: var(--pt-surface);
	}

	.details-card::part(base) {
		height: 100%;
		overflow: hidden;
	}

	/* The header carries the identity of the element in one row: the coloured
	   thumbnail, the name, the atomic number, the family, and the conditions the
	   state values refer to. It sits on the inset surface, so the card reads as a
	   titled panel instead of a plain box. */
	.details-card::part(header) {
		padding: 3px 6px;
		border-bottom: 1px solid var(--pt-border);
		background: color-mix(in srgb, var(--pt-cell-fill, var(--pt-inset)) 16%, var(--pt-surface));
	}

	.details-head {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
	}

	.details-thumb {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 12%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-surface));
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1;
	}

	.details-title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		line-height: 1.1;
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

	/* The body is the slot itself, so the two columns are its flex items. It takes
	   the rest of the fixed card height and scrolls, which keeps the card at the
	   height of the block it fills. */
	.details-card::part(body) {
		display: flex;
		flex: 1;
		min-height: 0;
		padding: 4px 6px;
		overflow: auto;
	}

	.details-sections {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
		width: 100%;
		min-width: 0;
	}

	.details-column {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.details-divider {
		--spacing: 0;
		--color: var(--pt-border);
	}

	/* A rule separates the two sections of a column, so the headings do not have
	   to carry the whole structure on their own. */
	.details-rule {
		--spacing: 0.1rem;
		--color: var(--pt-border);
	}

	.details-section {
		min-width: 0;
	}

	.details-heading {
		margin: 0 0 1px;
		font-size: 0.55rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--pt-ink-soft);
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
		font-size: 0.7rem;
		line-height: 1.2;
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
	   glance instead of hanging on a dot of half a millimetre. */
	.details-state::part(base) {
		height: auto;
		padding: 0 0.3rem;
		border-color: color-mix(in srgb, var(--pt-ink) 18%, transparent);
		color: var(--pt-ink);
		font-size: 0.6rem;
		line-height: 1.35;
	}

	.details-state.state-solid::part(base) {
		background: var(--pt-state-solid);
	}

	.details-state.state-liquid::part(base) {
		background: var(--pt-state-liquid);
	}

	.details-state.state-gas::part(base) {
		background: var(--pt-state-gas);
	}

	.details-state.state-unknown::part(base) {
		background: var(--pt-state-unknown);
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

	/* A narrow card stacks the two columns, because two half-width columns would
	   break every value onto a second line. The threshold is the width of the card
	   itself, not of the widget: the card spans ten of the eighteen columns, so it
	   is already too narrow for two columns while the table still has room. The
	   card then grows with its content, which keeps the cells of the periods even
	   instead of squeezing the stacked rows into the height of three rows. */
	@container (max-width: 28rem) {
		.details-card {
			height: auto;
		}

		.details-card::part(base) {
			height: auto;
			overflow: visible;
		}

		.details-card::part(body) {
			flex: 0 0 auto;
			overflow: visible;
		}

		.details-sections {
			flex-direction: column;
		}

		.details-divider {
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
		:host {
			padding: 0;
		}

		.toolbar,
		.result-count,
		.modes,
		.state-legend,
		.table-pane,
		.series-jumps,
		.legend {
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
	:host(.ww-beforeprint) .result-count,
	:host(.ww-beforeprint) .modes,
	:host(.ww-beforeprint) .state-legend,
	:host(.ww-beforeprint) .table-pane,
	:host(.ww-beforeprint) .series-jumps,
	:host(.ww-beforeprint) .legend {
		display: none !important;
	}

	:host(.ww-beforeprint) .print-overview {
		display: block;
	}

	@media (forced-colors: active) {
		.cell,
		.list-row,
		.legend-item,
		.details-card,
		.placeholder-text {
			border: 1px solid CanvasText;
			background: Canvas;
		}

		.cell:focus-visible,
		.list-row:focus-visible,
		.legend-item:focus-visible {
			outline: 2px solid Highlight;
		}

		.cell[aria-selected="true"],
		.list-row[aria-pressed="true"] {
			outline: 2px solid Highlight;
		}
	}
`;
