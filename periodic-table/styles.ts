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

		--pt-cell-height: 2.6rem;
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

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		align-items: start;
	}

	@container (min-width: 1000px) {
		.body {
			grid-template-columns: minmax(0, 1fr) 18rem;
		}
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

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		min-height: var(--pt-cell-height);
		padding: 2px 1px;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 12%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		color: var(--pt-ink);
		font: inherit;
		line-height: 1.05;
		text-align: center;
		cursor: pointer;
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

	.details {
		min-width: 0;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--pt-border);
		border-radius: 6px;
		background: var(--pt-surface);
	}

	.details-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.details-symbol {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-size: 1.1rem;
		font-weight: 600;
	}

	.details-name {
		margin: 0;
		font-size: 1rem;
	}

	.details-sub {
		margin: 0;
		font-size: 0.75rem;
		color: var(--pt-ink-soft);
	}

	.details-fields {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.2rem 0.6rem;
		margin: 0.6rem 0 0;
		font-size: 0.78rem;
	}

	.details-row {
		display: contents;
	}

	.details-row dt {
		color: var(--pt-ink-soft);
	}

	.details-row dd {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.qualifier {
		margin-left: 0.3rem;
		font-size: 0.65rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--pt-ink-soft);
	}

	.details-hint {
		margin: 0.5rem 0 0;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	.details-empty {
		margin: 0;
		font-size: 0.8rem;
		color: var(--pt-ink-soft);
	}

	.sources {
		margin-top: 0.6rem;
		font-size: 0.75rem;
	}

	.source {
		margin-top: 0.4rem;
	}

	.source-title {
		margin: 0;
		font-size: 0.78rem;
	}

	.source-line {
		margin: 0.1rem 0 0;
		color: var(--pt-ink-soft);
	}

	.source-link {
		color: var(--pt-accent);
		overflow-wrap: anywhere;
	}

	@media (forced-colors: active) {
		.cell,
		.list-row,
		.legend-item,
		.details,
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
