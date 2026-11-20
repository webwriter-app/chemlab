import { css } from "lit";

export const builderStyles = css`
	:host {
		display: block;
		min-width: 0;
		color: var(--sl-color-neutral-800, #27272a);
		font: 14px var(--sl-font-sans, system-ui, sans-serif);
		container-type: inline-size;
	}
	[hidden] { display: none !important; }
	.builder {
		--outline: var(--sl-color-neutral-300, #d4d4d8);
		--line: var(--sl-color-neutral-200, #e4e4e7);
		--control: #f9f9f9;
		--blue: var(--sl-color-primary-600, #0284c7);
		--shadow: 0 1px 3px rgb(0 0 0 / 14%);
		--panel-shadow: 0 2px 8px rgb(0 0 0 / 9%);
		--chip-height: 1.35rem;
		--handle-width: 1.1rem;
		position: relative;
		border: 1px solid var(--outline);
		border-radius: 5px;
		overflow: hidden;
		background: white;
		/* Every small control in the widget is as tall as a filter chip, so the
		   header, the tool row and the canvas controls share one rhythm. */
		--sl-input-height-small: var(--chip-height);
	}
	.document, .tools, .view-tools, .fields, .palette-tools, .tool-group, .palette-heading,
	.document-title, .document-actions, .card-head, .card-facts, .display-controls, .bond-orders {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: .35rem;
	}
	.document, .tools {
		background: var(--control);
		padding: .35rem .5rem;
		border-bottom: 1px solid var(--line);
	}
	.document { justify-content: space-between; gap: .5rem; }
	.document-title { min-inline-size: 0; flex: 1 1 auto; }
	.document-title h5 {
		margin: 0;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: .9rem;
		font-weight: 600;
		line-height: 1.2;
	}
	.document-actions { flex: none; }
	.tool-group + .tool-group {
		border-inline-start: 1px solid var(--line);
		padding-inline-start: .35rem;
	}
	.tools sl-button::part(base), .view-tools sl-button::part(base) { box-shadow: var(--shadow); }
	.icon-control::part(label) { display: grid; place-items: center; padding-inline: .3rem; }
	/* The catalog, file and send actions open in a compact surface anchored to
	   their own button instead of pushing a full-width row under the header. */
	.surface {
		display: grid;
		gap: .45rem;
		max-inline-size: min(22rem, 80cqw);
		padding: .5rem;
		border: 1px solid var(--outline);
		border-radius: 5px;
		background: white;
		box-shadow: var(--panel-shadow);
		font-size: .8rem;
	}
	.surface .fields { flex-direction: column; align-items: stretch; gap: .4rem; }
	.surface .fields label { display: grid; gap: .15rem; }
	.surface select { inline-size: 100%; }
	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		block-size: clamp(32rem, 66vh, 42rem);
	}
	.workspace[data-palette="list"] { grid-template-columns: clamp(12rem, 34%, 16rem) minmax(0, 1fr); }
	/* The element grid needs about 20 px per column, so the palette takes the
	   width of the table instead of a share of the workspace. The 55 % cap keeps
	   the canvas usable; below it the grid button stays disabled. */
	.workspace[data-palette="table"] { grid-template-columns: minmax(0, min(27rem, 55%)) minmax(0, 1fr); }
	.workspace[data-collapsed] { grid-template-columns: 0 minmax(0, 1fr); }
	.palette {
		position: relative;
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		min-block-size: 0;
		padding: .45rem;
		border-inline-end: 1px solid var(--outline);
		background: var(--control);
	}
	.workspace[data-collapsed] .palette { padding: 0; border-inline-end: 0; }
	/* The handle is the palette's own edge, like the attached drawer handle of
	   the lab: it stays in place while the panel opens and closes. */
	.palette-handle {
		position: absolute;
		inset-block-start: .5rem;
		inset-inline-start: 100%;
		z-index: 3;
		display: grid;
		place-items: center;
		box-sizing: border-box;
		inline-size: var(--handle-width);
		block-size: 2.2rem;
		padding: 0;
		border: 1px solid var(--outline);
		border-inline-start: 0;
		border-radius: 0 4px 4px 0;
		background: var(--control);
		box-shadow: var(--shadow);
		color: var(--sl-color-neutral-600, #52525b);
		cursor: pointer;
	}
	.palette-handle:focus-visible {
		outline: 2px solid var(--sl-color-neutral-600, #52525b);
		outline-offset: -3px;
	}
	.palette-body {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: .4rem;
		min-inline-size: 0;
		min-block-size: 0;
	}
	.palette-heading { justify-content: space-between; }
	.palette > .palette-body > webwriter-chemlab-periodic-table {
		flex: 1 1 0;
		box-shadow: var(--shadow);
	}
	.visual {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		min-width: 0;
		background: #fbfbfa;
	}
	.board { position: relative; min-block-size: 0; }
	.board:focus-visible { outline: 2px solid var(--blue); outline-offset: -2px; }
	.scene, .drawing { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
	.scene { overflow: hidden; }
	.drawing { display: block; background: radial-gradient(#d4d8db 1px, transparent 1px) 1px 1px / 18px 18px; }
	.drawing [data-atom] { cursor: pointer; }
	.view-tools { position: absolute; right: .5rem; bottom: .5rem; z-index: 2; gap: .25rem; }
	.empty { position: absolute; inset: 45% 12% auto; margin: 0; text-align: center; color: #52525b; pointer-events: none; }
	/* The model summary and the selection card sit at the canvas edge, so they
	   keep their place while the structure turns. */
	.model-summary {
		position: absolute;
		inset-block-start: .5rem;
		inset-inline-start: 1.9rem;
		z-index: 2;
		display: grid;
		gap: .3rem;
		max-inline-size: min(19rem, calc(100% - 2.4rem));
		max-block-size: min(11rem, calc(100% - 1rem));
		overflow: auto;
		padding: .35rem .45rem;
		border: 1px solid var(--line);
		border-radius: 5px;
		background: white;
		box-shadow: var(--panel-shadow);
		font-size: .78rem;
	}
	.model-summary output { color: #52525b; }
	.selection-card .fields a {
		display: inline-flex;
		align-items: center;
		block-size: var(--chip-height);
		padding-inline: .4rem;
		border: 1px solid var(--line);
		border-radius: 3px;
		background: var(--control);
		color: var(--sl-color-primary-700);
		font-size: .74rem;
		text-decoration: none;
	}
	.selection-card .fields a:hover { border-color: var(--sl-color-primary-400); }
	.selection-card .fields a:focus-visible { outline: 2px solid var(--sl-color-primary-600); outline-offset: 1px; }
	.selection-card {
		position: absolute;
		inset-block-end: .5rem;
		inset-inline-start: .5rem;
		z-index: 2;
		display: grid;
		gap: .35rem;
		inline-size: max-content;
		max-inline-size: min(15rem, 62%);
		max-block-size: min(16rem, calc(100% - 4rem));
		overflow: auto;
		padding: .4rem;
		border: 1px solid var(--line);
		border-radius: 5px;
		background: white;
		box-shadow: var(--panel-shadow);
		font-size: .8rem;
		overflow-wrap: anywhere;
	}
	.card-head { justify-content: space-between; }
	.card-facts { gap: .25rem; }
	.selection-card sl-details::part(base) { border-color: var(--line); }
	.selection-card sl-details::part(header), .selection-card sl-details::part(content) {
		padding: .3rem .4rem;
	}
	.selection-card sl-details::part(header) {
		background: var(--control);
		font-size: .78rem;
	}
	.selection-card .fields { flex-direction: column; align-items: stretch; gap: .3rem; }
	.selection-card .fields label { display: grid; gap: .1rem; }
	.structure-legend { display: flex; flex-wrap: wrap; gap: .55rem; color: #52525b; }
	.structure-legend span::before {
		content: "";
		display: inline-block;
		inline-size: .6em;
		block-size: .6em;
		margin-inline-end: .3em;
		border-radius: 50%;
		background: var(--swatch, #0284c7);
	}
	.structure-legend [data-region="lone"] { --swatch: #a855f7; }
	.structure-legend [data-marker="lattice"]::before { border-radius: 1px; --swatch: #283648; }
	.display-controls { gap: .25rem; }
	.display-controls select { max-inline-size: 6rem; }
	input, select { color: inherit; font: inherit; accent-color: var(--blue); }
	select, input:not([type=file]) {
		padding: .28em .4em;
		border: 1px solid var(--outline);
		border-radius: 4px;
		background: white;
	}
	.fields label { display: inline-flex; align-items: center; gap: .3rem; font-size: .8rem; }
	.fields input[type=number] { width: 4.4em; }
	.fields select { max-width: 18rem; }
	.ghost {
		position: fixed;
		z-index: 20;
		pointer-events: none;
		transform: translate(10px, 10px);
		background: var(--blue);
		color: white;
		border-radius: 4px;
		padding: .25rem .48rem;
		box-shadow: var(--shadow);
	}
	@container (max-width: 510px) {
		/* Stacked, the palette sits above the canvas and the handle becomes a tab
		   hanging from its lower edge instead of a strip on the side. */
		.workspace[data-palette], .workspace[data-collapsed] {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: minmax(0, 2fr) minmax(0, 3fr);
		}
		.workspace[data-collapsed] { grid-template-rows: 0 minmax(0, 1fr); }
		.palette {
			border-inline-end: 0;
			border-block-end: 1px solid var(--outline);
		}
		.workspace[data-collapsed] .palette { border-block-end: 0; }
		.palette-handle {
			inset-block-start: auto;
			inset-block-end: 0;
			inset-inline-start: auto;
			inset-inline-end: .5rem;
			transform: translateY(100%);
			inline-size: 2.2rem;
			block-size: var(--handle-width);
			border: 1px solid var(--outline);
			border-block-start: 0;
			border-radius: 0 0 4px 4px;
		}
		.palette-handle svg { transform: rotate(90deg); }
		/* The canvas is narrow here, so the view controls stand in a column at the
		   right edge and the cards keep clear of it. */
		.view-tools {
			flex-direction: column;
			inset-block: 50% auto;
			transform: translateY(-50%);
		}
		/* The handle hangs below the palette here, so the summary starts under it
		   and both cards keep clear of the view controls on the right. */
		.model-summary {
			inset-block-start: 1.75rem;
			inset-inline-start: .5rem;
			max-block-size: min(11rem, calc(100% - 2.25rem));
		}
		.model-summary, .selection-card { max-inline-size: calc(100% - 4.2rem); }
	}
`;
