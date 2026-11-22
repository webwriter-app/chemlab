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
		/* The catalog headings repeat the chemical drawer of the lab, so the
		   group badges carry the same lilac band as the palette sections. */
		--palette-heading-fill: #e8e0ee;
		--palette-heading-badge: #ded3e7;
		--palette-heading-ink: #4e3e5d;
		position: relative;
		border: 1px solid var(--outline);
		border-radius: 5px;
		overflow: hidden;
		background: white;
		/* Every small control in the widget is as tall as a filter chip, so the
		   header, the tool row and the canvas controls share one rhythm. */
		--sl-input-height-small: var(--chip-height);
	}
	.document, .tools, .view-buttons, .fields, .palette-tools, .tool-group, .palette-heading,
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
	.tools sl-button::part(base) { box-shadow: var(--shadow); }
	/* Icon controls carry their label in the tooltip only, so the label part
	   keeps the square metrics of the lab's canvas buttons. */
	.icon-control::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-inline-size: 24px;
		padding-inline: 3px;
	}
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
	/* The catalog lists every substance of the lab, so it scrolls inside the
	   popup instead of growing past the widget. */
	.catalog-surface { inline-size: min(22rem, 80cqw); gap: .3rem; }
	.catalog-search { min-inline-size: 0; }
	.catalog-list {
		display: grid;
		gap: .35rem;
		max-block-size: min(22rem, 52vh);
		overflow: auto;
		overscroll-behavior: contain;
	}
	.catalog-group, .catalog-entries { display: grid; gap: 2px; }
	.catalog-group-heading {
		position: sticky;
		inset-block-start: 0;
		z-index: 1;
		padding: 2px 4px;
		border-radius: 3px;
		background: var(--palette-heading-fill);
		color: var(--palette-heading-ink);
	}
	.catalog-group-heading > sl-badge { max-inline-size: 100%; margin: 0; }
	.catalog-group-heading > sl-badge::part(base) {
		padding: 1px 5px;
		border: 0;
		background: var(--palette-heading-badge);
		color: inherit;
		white-space: normal;
		overflow-wrap: anywhere;
		line-height: 1.25;
	}
	.catalog-entry {
		display: flex;
		align-items: baseline;
		gap: .35rem;
		padding: 3px 6px;
		border: 1px solid transparent;
		border-radius: 3px;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.catalog-entry:hover { background: var(--sl-color-neutral-100, #f4f4f5); }
	.catalog-entry:focus-visible { outline: 2px solid var(--blue); outline-offset: 1px; }
	.catalog-entry.is-selected {
		border-color: var(--blue);
		background: color-mix(in srgb, var(--blue) 10%, white);
	}
	.catalog-entry-name { font-weight: 500; }
	.catalog-entry-formula { color: var(--sl-color-neutral-600, #52525b); font-size: .75rem; }
	.catalog-note {
		margin: 0;
		padding: 0 6px 3px;
		color: var(--sl-color-neutral-600, #52525b);
		font-size: .75rem;
	}
	.surface .fields { flex-direction: column; align-items: stretch; gap: .4rem; }
	.surface .fields label { display: grid; gap: .15rem; }
	.surface select { inline-size: 100%; }
	/* The popup box is absolutely positioned but carries no z-index of its own,
	   so the canvas, which is positioned later in tree order, painted over it.
	   The header keeps its popups above the workspace and the palette handle. */
	.document sl-popup::part(popup) { z-index: 4; }
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
	/* Fullscreen hands the widget the whole screen. The builder takes that box
	   and the workspace grows into the rest, so the canvas fills the screen
	   instead of keeping the height it has in an embed. */
	:host(:fullscreen) { block-size: 100%; }
	:host(:fullscreen) .builder, .builder:popover-open {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		block-size: 100%;
	}
	.builder:popover-open {
		position: fixed;
		inset: 0;
		inline-size: 100%;
		max-inline-size: none;
		max-block-size: none;
		margin: 0;
	}
	:host(:fullscreen) .workspace, .builder:popover-open .workspace {
		flex: 1 1 auto;
		block-size: auto;
		min-block-size: 0;
	}
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
	.board { position: relative; min-block-size: 0; background-color: #fbfbfa; }
	.board[data-unit-grid] {
		background-image: linear-gradient(to right, rgb(47 58 73 / 10%) 1px, transparent 1px),
			linear-gradient(to bottom, rgb(47 58 73 / 10%) 1px, transparent 1px);
		background-size: var(--grid-cell) var(--grid-cell);
		background-position: center;
	}
	.board:focus-visible { outline: 2px solid var(--blue); outline-offset: -2px; }
	.scene, .drawing { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
	.scene { overflow: hidden; }
	.drawing { display: block; background: radial-gradient(#d4d8db 1px, transparent 1px) 1px 1px / 18px 18px; }
	.drawing [data-atom] { cursor: pointer; }
	.board:has(.lewis-view) { background-color: #fafbfc; }
	.drawing.lewis-view {
		--diagram-top: min(5.8rem, 21%);
		--diagram-bottom: min(5rem, 18%);
		inset: var(--diagram-top) 1.5rem var(--diagram-bottom);
		inline-size: calc(100% - 3rem);
		block-size: calc(100% - var(--diagram-top) - var(--diagram-bottom));
		background: none;
		color: #263247;
	}
	.lewis-bond { fill: none; stroke: #39475a; stroke-width: .036; stroke-linecap: round; stroke-linejoin: round; }
	.lewis-bond[data-active] { stroke: var(--blue); stroke-width: .06; }
	.lewis-hit { fill: transparent; stroke: transparent; stroke-width: .023; }
	.lewis-atom[data-active] .lewis-hit { fill: #f2f5f8; stroke: black; }
	.lewis-symbol { font-size: .31px; font-weight: 650; fill: currentColor; }
	.lewis-electron { fill: #37465a; }
	.hydration-water text { fill: #334155; font-weight: 650; font-size: .24px; }
	.hydration-water [data-water-atom="O"] { fill: #9e3223; }
	.hydration-contact { stroke: #6940a2; stroke-width: .035; stroke-dasharray: .12 .10; }
	.hydration-contact[data-contact="ion-dipole"] { stroke: #167384; stroke-dasharray: .045 .09; }
	.hydration-key { display: flex; align-items: baseline; gap: .35rem; flex-wrap: wrap; }
	.hydration-key span::before { content: ""; display: inline-block; width: .9em; margin-inline-end: .25em; border-top: 2px dashed #6940a2; }
	.hydration-key [data-contact="ion-dipole"]::before { border-top: 2px dotted #167384; }
	.lewis-atom[data-active] .lewis-electron { fill: #6b21a8; r: .036px; }
	.lewis-atom :is(text, .lewis-electron) { pointer-events: none; }
	.oxidation-number, .formal-charge { font-size: .165px; font-weight: 700; }
	.formal-charge { fill: #263247; }
	[data-oxidation="negative"] { color: #075985; fill: #075985; }
	[data-oxidation="positive"] { color: #9e3223; fill: #9e3223; }
	[data-oxidation="neutral"] { color: #555f70; fill: #555f70; }
	.oxidation-number { paint-order: stroke; stroke: #fafbfc; stroke-width: .05; stroke-linejoin: round; }
	.repeat-unit > path { fill: none; stroke: #5b6573; stroke-width: .042; }
	.repeat-unit > text { font-size: .27px; font-style: italic; fill: currentColor; }
	.lewis-legend { display: flex; align-items: baseline; flex-wrap: wrap; gap: .4rem; color: #4c5563; }
	.lewis-legend span { font-weight: 700; }
	.formula-view {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		gap: .9rem;
		padding: 3.75rem 2.5rem;
		overflow: auto;
		text-align: center;
		background: #fafbfc;
	}
	.formula-display { display: grid; gap: .4rem; }
	.formula-heading { color: #4c5563; font-size: .8rem; }
	.empirical-formula { color: #233044; font-size: clamp(1.15rem, 4cqw, 2.65rem); font-weight: 650; overflow-wrap: anywhere; }
	.formula-ions, .ion-entry {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: .4rem;
	}
	.ion-site {
		--ion-color: var(--blue);
		padding: .24rem .53rem;
		border: 1px solid color-mix(in srgb, var(--ion-color) 32%, white);
		border-radius: 4px;
		background: color-mix(in srgb, var(--ion-color) 8%, white);
		color: #233044;
		font: inherit;
		font-weight: 650;
		cursor: pointer;
	}
	.ion-site:hover, .ion-site[aria-pressed="true"] { border-color: var(--ion-color); }
	.ion-site[aria-pressed="true"] { box-shadow: inset 0 -2px var(--ion-color); }
	.ion-site:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
	.ion-entry { padding: .35rem; }
	.ion-entry label { display: inline-flex; gap: .3rem; align-items: center; font-size: .78rem; }
	.ion-entry input { width: 3.2rem; }
	/* The canvas controls repeat the lab's zoom cluster: same inset, same gap,
	   same 24 px buttons on the light surface with the soft control shadow. */
	.view-tools {
		position: absolute;
		inset-block-end: 4px;
		inset-inline-end: 4px;
		z-index: 2;
		display: grid;
		justify-items: end;
		max-inline-size: calc(100% - 8px);
		gap: 5px;
		--sl-input-height-small: 24px;
	}
	.view-buttons { justify-content: flex-end; gap: 3px; }
	.atomic-hint {
		position: absolute;
		inset-block-end: calc(100% + 5px);
		inset-inline-end: 0;
		pointer-events: none;
		white-space: nowrap;
		padding: .2rem .38rem;
		border: 1px solid #bfd4e0;
		border-radius: 4px;
		background: white;
		color: #16384d;
		font: 600 .72rem/1.2 system-ui;
	}
	.atomic-hint .nucleus { pointer-events: auto; }
	.grid-scale::part(base) { background: var(--control); box-shadow: var(--shadow); }
	.grid-scale::part(content) { display: flex; align-items: center; gap: .35rem; font-variant-numeric: tabular-nums; }
	.grid-scale-line {
		display: inline-block;
		inline-size: var(--grid-cell);
		block-size: 4px;
		box-sizing: border-box;
		border: 1px solid currentColor;
		border-block-start: 0;
	}
	.view-tools sl-button::part(base) { box-shadow: var(--shadow); }
	.view-tools sl-button:not([aria-pressed="true"])::part(base):not(:hover):not(:active) { background: var(--control); }
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
	.summary-formula { font-size: .88rem; font-weight: 650; overflow-wrap: anywhere; }
	.summary-caption, .summary-variant > span { color: var(--sl-color-neutral-600, #52525b); }
	.summary-variant {
		display: grid;
		align-items: center;
		grid-template-columns: auto minmax(0, 1fr);
		gap: .35rem;
	}
	.summary-variant select { min-inline-size: 0; max-inline-size: 100%; }
	.model-summary output { color: #52525b; }
	.atomic-summary { max-block-size: min(17rem, calc(100% - 1rem)); }
	.atomic-title, .atomic-configuration { display: flex; align-items: center; flex-wrap: wrap; gap: .3rem; }
	.atomic-configuration strong { overflow-wrap: anywhere; font-weight: 650; }
	.builder-atom-figure { position: absolute; inset: 0; }

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
	/* The site picker lists every atom as a chip instead of hiding the list in a
	   select, so a hover can outline the matching atom in the lattice. */
	.site-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		max-block-size: 6.5rem;
		overflow: auto;
		overscroll-behavior: contain;
	}
	.site-chip {
		padding: 1px 5px;
		border: 1px solid var(--outline);
		border-radius: 3px;
		background: white;
		color: inherit;
		font: inherit;
		font-size: .74rem;
		line-height: 1.3;
		cursor: pointer;
	}
	.site-chip:hover { border-color: var(--sl-color-primary-400, #38bdf8); }
	.site-chip:focus-visible { outline: 2px solid var(--blue); outline-offset: 1px; }
	.site-chip[aria-pressed="true"] {
		border-color: var(--blue);
		background: color-mix(in srgb, var(--blue) 10%, white);
	}
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
	.bond-lengths { display: grid; gap: .2rem; }
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
			inset-block: 50% auto;
			transform: translateY(-50%);
		}
		.view-buttons { flex-direction: column; align-items: end; }
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
