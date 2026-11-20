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
		border: 1px solid var(--outline);
		border-radius: 5px;
		overflow: hidden;
		background: white;
	}
	.toolbar, .tools, .view-tools, .status, .inspect-title, .fields, .palette-tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: .35rem;
	}
	.toolbar, .tools {
		background: var(--control);
		padding: .4rem .5rem;
		border-bottom: 1px solid var(--line);
	}
	.toolbar { justify-content: space-between; gap: .5rem; }
	.toolbar > div { display: flex; flex-wrap: wrap; gap: .35rem; align-items: center; }
	.tools sl-button::part(base), .view-tools sl-button::part(base) { box-shadow: var(--shadow); }
	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-height: 28rem;
	}
	.workspace[data-palette] { grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr); }
	.palette {
		display: flex;
		flex-direction: column;
		gap: .4rem;
		min-width: 0;
		max-height: 32rem;
		padding: .45rem;
		border-right: 1px solid var(--outline);
		background: var(--control);
	}
	.palette > webwriter-chemlab-periodic-table {
		min-height: 0;
		overflow: auto;
		scrollbar-width: thin;
		border-radius: 5px;
		box-shadow: var(--shadow);
	}
	.visual {
		display: grid;
		grid-template-rows: minmax(18rem, 1fr) auto;
		min-width: 0;
		background: #fbfbfa;
	}
	.board { position: relative; min-height: 18rem; }
	.scene, .drawing { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
	.scene { overflow: hidden; }
	.drawing { display: block; background: radial-gradient(#d4d8db 1px, transparent 1px) 1px 1px / 18px 18px; }
	.drawing [data-atom] { cursor: pointer; }
	.view-tools { position: absolute; right: .5rem; bottom: .5rem; z-index: 1; }
	.empty { position: absolute; inset: 45% 12% auto; margin: 0; text-align: center; color: #52525b; pointer-events: none; }
	.status {
		background: white;
		border-top: 1px solid var(--line);
		min-height: 2rem;
		padding: .35rem .5rem;
		font-size: .8rem;
		justify-content: space-between;
	}
	.status :is(div, span) { min-width: 0; }
	.status output { color: #52525b; }
	.controls-panel {
		padding: .5rem;
		background: var(--control);
		border-bottom: 1px solid var(--line);
	}
	.controls-panel select { max-width: 100%; }
	.inspector {
		display: grid;
		gap: .4rem;
		padding: .55rem;
		border-top: 1px solid var(--line);
		background: white;
		box-shadow: 0 -1px 4px rgb(0 0 0 / 5%);
	}
	.inspect-title { justify-content: space-between; }
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
		.workspace[data-palette] { grid-template-columns: minmax(0, 1fr); }
		.palette { max-height: 15rem; border-right: 0; border-bottom: 1px solid var(--outline); }
		.board { min-height: 20rem; }
	}
`;
