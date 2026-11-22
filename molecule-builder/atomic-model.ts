import { css, html, nothing, svg } from "lit";
import { atomicShells, orbitalOccupation, orbitalOrientations, type AtomicConfiguration, type Subshell } from "./atomic-configuration";
import { atomicOrbitalSlice } from "./atomic-orbitals";

export type AtomicModel = "bohr" | "shells" | "orbitals";
export type AtomChoices = { model: AtomicModel; shell?: number; subshell?: string; orientation: number; region?: number };
export const initialAtomChoices = (model: AtomicModel = "bohr"): AtomChoices => ({ model, orientation: 0 });
type Translate = (en: string, de: string) => string;

const phases = ["#177da6", "#d67b27"];
const models: { mode: AtomicModel; en: string; de: string }[] = [
	{ mode: "bohr", en: "Bohr", de: "Bohr" },
	{ mode: "shells", en: "Shells", de: "Schalen" },
	{ mode: "orbitals", en: "Orbitals", de: "Orbitale" },
];
export const orbitalGlyph = ["—", "↑", "↑↓"];
const superscript = (value: number) => String(value).replace(/\d/g, digit => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)]);

export function atomChoice(configuration: AtomicConfiguration, choices: AtomChoices) {
	const shells = atomicShells(configuration);
	const subshell = configuration.subshells.find(entry => entry.label === choices.subshell)
		?? configuration.subshells[configuration.subshells.length - 1];
	const regions = subshell ? subshell.n - subshell.l : 0;
	return {
		shells, shell: shells.find(entry => entry.n === choices.shell)?.n ?? shells[shells.length - 1]?.n,
		subshell, orientation: subshell && choices.orientation <= 2 * subshell.l ? choices.orientation : 0,
		region: Math.min(choices.region ?? regions - 1, Math.max(0, regions - 1)), regions,
	};
}

export function atomicOrbitalLabel(subshell: Subshell, orientation: number, t: Translate) {
	const electrons = orbitalOccupation(subshell, orientation);
	const count = [t("empty", "unbesetzt"), t("1 electron", "1 Elektron"), t("2 electrons", "2 Elektronen")][electrons];
	return `${subshell.n}${orbitalOrientations(subshell.l)[orientation]} · ${count}`;
}

export function renderAtomicControls(configuration: AtomicConfiguration, choices: AtomChoices, change: (choices: AtomChoices) => void,
	t: Translate) {
	const { shells, shell, subshell, region, regions } = atomChoice(configuration, choices);
	const chip = (label: unknown, title: string, pressed: boolean, onClick: () => void) => html`
		<button type="button" class="atom-chip" title=${title} aria-label=${title} aria-pressed=${String(pressed)} @click=${onClick}>
			<sl-tag size="small" variant=${pressed ? "primary" : "neutral"}>${label}</sl-tag>
		</button>`;
	const orbital = choices.model === "orbitals";
	return html`
		<div class="atomic-controls">
			<div class="atom-controls-row" role="group" aria-label=${t("Atom model", "Atommodell")}>
				${models.map(({ mode, en, de }) => html`<sl-button size="small" variant=${choices.model === mode ? "primary" : "default"}
					aria-pressed=${String(choices.model === mode)} @click=${() => change({ ...choices, model: mode })}>${t(en, de)}</sl-button>`)}
			</div>
			${configuration.predicted ? html`<sl-tag size="small">${t("Predicted", "Vorhergesagt")}</sl-tag>` : nothing}
			${!shells.length ? html`<span>${configuration.electrons === 0 ? t("No electrons", "Keine Elektronen")
				: t("Configuration unavailable", "Konfiguration nicht verfügbar")}</span>` : html`
				<div class="atom-controls-row electron-config-chips" role="group" aria-label=${t("Electron configuration", "Elektronenkonfiguration")}>
					${orbital ? configuration.subshells.map(entry => chip(entry.label + superscript(entry.electrons),
						`${entry.label} · ${entry.electrons} e⁻`, subshell?.label === entry.label,
						() => change({ ...choices, subshell: entry.label, orientation: 0, region: undefined })))
						: shells.map(entry => chip(`${entry.label} · ${entry.electrons}`,
							`${t("Shell", "Schale")} ${entry.label} · ${entry.electrons} e⁻`, shell === entry.n,
							() => change({ ...choices, shell: entry.n })))}
				</div>
				${orbital && regions > 1 ? html`
					<div class="atom-controls-row" role="group" aria-label=${t("Radial region", "Radialbereich")}>
						${Array.from({ length: regions }, (_, i) => chip(i + 1,
							`${t("Radial region", "Radialbereich")} ${i + 1} / ${regions}`, i === region,
							() => change({ ...choices, region: i })))}
					</div>` : nothing}
			`}
		</div>`;
}

export function renderAtomicShells(symbol: string, configuration: AtomicConfiguration, choices: AtomChoices, t: Translate) {
	const { shells, shell } = atomChoice(configuration, choices);
	const bohr = choices.model === "bohr";
	const center = 110;
	const step = 81 / Math.max(1, shells.length);
	return svg`<svg class="atom-shell-figure" viewBox="0 0 220 220" role="img"
		aria-label=${bohr ? t("Bohr model", "Bohrsches Modell") : t("Electron shells", "Elektronenschalen")}>
		<title>${t("Schematic shell diagram", "Schematische Schalendarstellung")}</title>
		${shells.map(({ n, electrons }, index) => {
			const radius = 13 + (index + 1) * step;
			const selected = n === shell;
			const color = selected ? "#087bb4" : "#8196a5";
			return svg`<g class="electron-shell" data-shell=${n} data-selected=${String(selected)}>
				<circle cx=${center} cy=${center} r=${radius} fill="none" stroke=${color}
					stroke-width=${bohr ? selected ? 2.5 : 1.4 : step * .72} stroke-opacity=${bohr ? .8 : selected ? .42 : .21} />
				${bohr ? Array.from({ length: electrons }, (_, i) => {
					const angle = (i / electrons + index * .079) * 2 * Math.PI - Math.PI / 2;
					return svg`<circle class="shell-electron" cx=${center + radius * Math.cos(angle)} cy=${center + radius * Math.sin(angle)}
						r=${shells.length > 4 ? 2.7 : 3.6} fill=${color} />`;
				}) : nothing}
			</g>`;
		})}
		<circle cx=${center} cy=${center} r="13" fill="#e9f4fa" stroke="#6794ae" />
		<text x=${center} y=${center} dy=".34em" text-anchor="middle" fill="#12364b" font-size="10" font-weight="700">${symbol}</text>
	</svg>`;
}

const slices = new Map<string, ReturnType<typeof atomicOrbitalSlice>>();
export function renderAtomicOrbitalTiles(configuration: AtomicConfiguration, choices: AtomChoices,
	change: (choices: AtomChoices) => void, t: Translate) {
	const { subshell, orientation, region } = atomChoice(configuration, choices);
	if (!subshell) return nothing;
	return html`<div class="atom-orbital-tiles" role="group" aria-label=${t("Orbital cross-sections", "Orbitalschnitte")}>
		${orbitalOrientations(subshell.l).map((name, i) => {
			const electrons = orbitalOccupation(subshell, i);
			const key = `${subshell.label}:${i}:${region}`;
			let slice = slices.get(key);
			if (!slice) {
				slice = atomicOrbitalSlice({ subshell, orientation: i, region, atomicNumber: 1, atomId: 1, electrons: 1 }, undefined, 48);
				slices.set(key, slice);
			}
			const label = atomicOrbitalLabel(subshell, i, t);
			return html`<button type="button" class="atom-orbital-tile" data-electrons=${electrons} title=${label}
				aria-label=${label} aria-pressed=${String(i === orientation)} @click=${() => change({ ...choices, orientation: i })}>
				${svg`<svg viewBox="0 0 48 48" aria-hidden="true">
					${slice.paths.map((path, index) => svg`<path fill=${phases[index]} d=${path} />`)}
				</svg>`}
				<span>${name} <b>${orbitalGlyph[electrons]}</b></span>
			</button>`;
		})}
	</div>`;
}

export const atomicModelStyles = css`
	.atomic-controls, .atom-controls-row { min-inline-size: 0; display: flex; flex-wrap: wrap; gap: .2rem; }
	.atomic-controls { align-items: start; flex-direction: column; }
	.atom-controls-row { align-items: center; }
	.atomic-controls sl-button { --sl-input-height-small: 1.35rem; }
	.atomic-controls sl-button::part(label) { padding-inline: .4rem; font-size: .7rem; }
	.atom-chip, .atom-orbital-tile { appearance: none; border: 0; padding: 0; background: none; color: inherit;
		font: inherit; cursor: pointer; border-radius: 4px; }
	.atom-chip:focus-visible, .atom-orbital-tile:focus-visible { outline: 2px solid var(--sl-color-primary-600, #087bb4); outline-offset: 1px; }
	.atom-chip sl-tag::part(base) { height: auto; min-height: 1.2rem; padding-inline: .3rem; font-size: .68rem; }
	.atom-shell-figure { display: block; inline-size: 100%; block-size: 100%; }
	.atom-orbital-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 2.55rem), 1fr)); gap: .15rem; }
	.atom-orbital-tile { display: grid; justify-items: center; border: 1px solid var(--sl-color-neutral-200, #e4e4e7);
		padding: .12rem .1rem; min-inline-size: 0; font-size: .64rem; line-height: 1.1; background: white; }
	.atom-orbital-tile[aria-pressed="true"] { border-color: var(--sl-color-primary-600, #087bb4); background: #eff8fd; }
	.atom-orbital-tile svg { inline-size: min(100%, 3rem); aspect-ratio: 1; }
	.atom-orbital-tile[data-electrons="0"] svg { opacity: .30; }
	.atom-orbital-tile span { overflow-wrap: anywhere; }
`;
