import { css, html } from "lit";
import { live } from "lit/directives/live.js";

type ValueControl = {
	label: string;
	unit: string;
	value: number;
	min: number;
	max: number;
	step: number;
	rangeStep?: number;
	rangeMin?: number;
	rangeMax?: number;
	onChange: (value: number) => void;
	onInput?: (value: number) => void;
	disabled?: boolean;
	locale?: string;
	decreaseLabel?: string;
	increaseLabel?: string;
	invalidLabel?: string;
};

/** A range for quick adjustment and one field for exact, localized entry. */
export function renderValueControl({
	label, unit, value, min, max, step, rangeStep = step, rangeMin = min, rangeMax = max,
	onChange, onInput, disabled, locale, decreaseLabel = `− ${label}`, increaseLabel = `+ ${label}`,
	invalidLabel = "Enter a number.",
}: ValueControl) {
	const clamp = (next: number) => Math.max(min, Math.min(max, next));
	const clampRange = (next: number) => Math.max(rangeMin, Math.min(rangeMax, next));
	const round = (next: number) => Number(next.toPrecision(14));
	const numberOptions: Intl.NumberFormatOptions = {
		useGrouping: false, maximumSignificantDigits: 6, numberingSystem: "latn",
	};
	let formatter: Intl.NumberFormat;
	try {
		formatter = new Intl.NumberFormat(locale || "de", numberOptions);
	} catch {
		formatter = new Intl.NumberFormat("de", numberOptions);
	}
	const format = (next: number) => next !== 0 && (Math.abs(next) < 1e-5 || Math.abs(next) >= 1e9)
		? Number(next.toPrecision(4)).toExponential() : formatter.format(next);
	const formatValue = format(value);
	const formattedReadout = `${formatValue} ${unit}`;
	const position = clampRange(value);
	const percent = rangeMax > rangeMin ? 100 * (position - rangeMin) / (rangeMax - rangeMin) : 0;
	const adjust = (direction: number) => (event: MouseEvent) =>
		onChange(clamp(round(value + direction * step * (event.shiftKey ? 10 : 1))));
	const readRange = (input: HTMLInputElement) => {
		const raw = input.valueAsNumber;
		// The last stop can be an exact capacity or remaining volume that does not
		// lie on the increments used for the rest of the track.
		if (raw === rangeMax || raw === rangeMin) return raw;
		return clampRange(round(rangeMin + Math.round((raw - rangeMin) / rangeStep) * rangeStep));
	};
	const commitText = (input: HTMLInputElement) => {
		if (!input.hasAttribute("data-edited")) {
			input.value = formatValue;
			return;
		}
		const raw = input.value.trim().replace(",", ".");
		const parsed = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw) ? Number(raw) : NaN;
		if (!Number.isFinite(parsed)) {
			input.setCustomValidity(invalidLabel);
			return;
		}
		const next = clamp(parsed);
		input.removeAttribute("data-edited");
		input.value = format(next);
		if (next !== value) onChange(next);
	};
	return html`<div class="value-control" role="group" aria-label=${label} contenteditable="false">
		<div class="value-control-row">
			<span class="value-control-label">${label}</span>
			<sl-button size="small" class="value-control-step" title=${decreaseLabel} aria-label=${decreaseLabel}
				?disabled=${disabled || value <= min} @click=${adjust(-1)}>−</sl-button>
			<label class="value-control-number">
				<input class="value-control-exact" type="text" inputmode="decimal" autocomplete="off"
					aria-label=${`${label} (${unit})`} .value=${formatValue} ?disabled=${!!disabled}
					@focusin=${(event: FocusEvent) => {
						const input = event.currentTarget as HTMLInputElement;
						if (input.hasAttribute("data-edited")) return;
						const decimal = formatter.formatToParts(1.1).find(part => part.type === "decimal")?.value ?? ".";
						input.value = String(value).replace(".", decimal);
					}}
					@input=${(event: Event) => {
						const input = event.currentTarget as HTMLInputElement;
						input.setAttribute("data-edited", "");
						input.setCustomValidity("");
					}}
					@change=${(event: Event) => commitText(event.currentTarget as HTMLInputElement)}
					@focusout=${(event: FocusEvent) => commitText(event.currentTarget as HTMLInputElement)}
					@keydown=${(event: KeyboardEvent) => {
						if (event.key !== "Enter" || event.isComposing) return;
						event.preventDefault();
						event.stopPropagation();
						const input = event.currentTarget as HTMLInputElement;
						commitText(input);
						input.reportValidity();
					}}>
				<span aria-hidden="true">${unit}</span>
			</label>
			<sl-button size="small" class="value-control-step" title=${increaseLabel} aria-label=${increaseLabel}
				?disabled=${disabled || value >= max} @click=${adjust(1)}>+</sl-button>
		</div>
		<input class="value-control-range" type="range" step="any" dir="ltr" min=${rangeMin} max=${rangeMax}
			.value=${live(String(position))} style=${`--value-progress:${percent}%`}
			aria-label=${label} aria-valuetext=${formattedReadout} ?disabled=${disabled || !(rangeMax > rangeMin)}
			@input=${(event: Event) => onInput?.(readRange(event.currentTarget as HTMLInputElement))}
			@change=${(event: Event) => onChange(readRange(event.currentTarget as HTMLInputElement))}
			@keydown=${(event: KeyboardEvent) => {
				const delta = { ArrowLeft: -rangeStep, ArrowDown: -rangeStep, ArrowRight: rangeStep, ArrowUp: rangeStep,
					PageDown: -rangeStep * 10, PageUp: rangeStep * 10 }[event.key];
				const next = event.key === "Home" ? rangeMin : event.key === "End" ? rangeMax
					: delta === undefined ? undefined : clampRange(round(position + delta));
				if (next === undefined) return;
				event.preventDefault();
				onChange(next);
			}}>
	</div>`;
}

export const valueControlStyles = css`
	.value-control {
		display: grid;
		gap: 1px;
		min-inline-size: 0;
	}
	.value-control-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 3px;
		min-inline-size: 0;
	}
	.value-control-label {
		grid-column: 1 / -1;
		font-weight: 600;
	}
	.value-control-number {
		display: flex;
		align-items: center;
		gap: .2rem;
		min-inline-size: 0;
		padding-inline: .3rem;
		border: 1px solid var(--lab-card-border);
		border-radius: 4px;
		background: var(--lab-card-inset);
		color: var(--lab-card-secondary-text);
		white-space: nowrap;
	}
	.value-control-number:focus-within { outline: 2px solid var(--sl-color-primary-600); }
	input.value-control-exact {
		inline-size: 100%;
		min-inline-size: 0;
		min-block-size: 24px;
		padding: 0;
		border: none;
		box-shadow: none;
		outline: none;
		background: transparent;
		color: var(--lab-card-text);
		font: inherit;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: end;
	}
	.value-control-step { --sl-input-height-small: 26px; }
	.value-control-step::part(label) { min-inline-size: 24px; padding: 0; font-weight: 700; }
	input.value-control-range {
		appearance: none;
		box-sizing: border-box;
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 24px;
		margin: 0;
		padding: 0;
		border: none;
		box-shadow: none;
		background: transparent;
		cursor: pointer;
		touch-action: pan-y;
	}
	input.value-control-exact:focus { box-shadow: none; }
	input.value-control-range:focus-visible { outline: 2px solid var(--sl-color-primary-600); outline-offset: -2px; border-radius: 4px; }
	.value-control-range:disabled { opacity: .45; cursor: default; }
	.value-control-range::-webkit-slider-runnable-track {
		block-size: 4px;
		border-radius: 4px;
		background: linear-gradient(to right, var(--sl-color-primary-500) var(--value-progress), var(--sl-color-neutral-200) var(--value-progress));
	}
	.value-control-range::-moz-range-track {
		block-size: 4px;
		border-radius: 4px;
		background: linear-gradient(to right, var(--sl-color-primary-500) var(--value-progress), var(--sl-color-neutral-200) var(--value-progress));
	}
	.value-control-range::-webkit-slider-thumb {
		appearance: none;
		inline-size: 12px;
		block-size: 12px;
		margin-block-start: -4px;
		border: 0;
		border-radius: 50%;
		background: var(--sl-color-primary-600);
	}
	.value-control-range::-moz-range-thumb {
		inline-size: 12px;
		block-size: 12px;
		border: 0;
		border-radius: 50%;
		background: var(--sl-color-primary-600);
	}
`;
