import { css, html, nothing, svg } from "lit";
import { isotopeText } from "../periodic-table/phase";
import { atomicShells, mutedShellColor, orbitalOccupation, orbitalOrientations, shellColors, shellOrbit, subshellColors, visibleAtomicSubshells,
	type AtomicConfiguration, type Subshell } from "./atomic-configuration";
import { atomicOrbitalSlice, atomicPhaseColors } from "./atomic-orbitals";
import { nucleonColors, schematicNucleons, type referenceNucleus } from "./atomic-nucleus";

export type AtomicModel = "bohr" | "orbitals";
export type AtomChoices = { model: AtomicModel; shell?: number; subshell?: string; showCore?: boolean };
export const initialAtomChoices = (model: AtomicModel = "bohr"): AtomChoices => ({ model });
type Translate = (en: string, de: string) => string;

export const pauseShellElectronsOption = {
	type: "boolean" as const, attribute: "pause-shell-electrons",
	label: { _: "Pause electron motion in the shell model", "de-DE": "Elektronenbewegung im Schalenmodell anhalten" },
};

const superscript = (value: number) => String(value).replace(/\d/g, digit => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)]);
const orbitalGlyph = ["—", "↑", "↑↓"];

export function atomicOrbitalLabel(subshell: Subshell, orientation: number, t: Translate) {
	const electrons = orbitalOccupation(subshell, orientation);
	const count = [t("empty", "unbesetzt"), t("1 electron", "1 Elektron"), t("2 electrons", "2 Elektronen")][electrons];
	return `${subshell.n}${orbitalOrientations(subshell.l)[orientation]} · ${count}`;
}

export function renderNucleusLabel(nucleus: ReturnType<typeof referenceNucleus>, symbol: string, t: Translate) {
	if (!nucleus) return nothing;
	const { massNumber, protons, neutrons, abundant } = nucleus;
	const isotope = isotopeText(massNumber, symbol);
	const label = t(`${isotope} · ${protons} protons · ${neutrons} neutrons`,
		`${isotope} · ${protons} Protonen · ${neutrons} Neutronen`);
	const context = abundant ? t("Most abundant isotope", "Häufigstes Isotop")
		: t("Longest-lived isotope", "Langlebigstes Isotop");
	return html`<span class="nucleus" role="img" aria-label=${label} title=${`${context} · ${label}`}>
		${isotope} · <span style="color:${nucleonColors.proton}">${protons} p⁺</span> ·
		<span style="color:${nucleonColors.neutron}">${neutrons} n</span>
	</span>`;
}

export function renderAtomicControls(configuration: AtomicConfiguration, choices: AtomChoices, change: (choices: AtomChoices) => void,
	t: Translate) {
	const { valence, subshells } = configuration;
	const shells = atomicShells(configuration);
	const shell = choices.shell ?? shells[shells.length - 1]?.n;
	const chip = (label: string, title: string, color: string, pressed: boolean, onClick: () => void, hint?: string) => html`
		<button type="button" class="atom-chip" style="--orbital-color:${color}" title=${hint ? `${title} · ${hint}` : title} aria-label=${title}
			aria-pressed=${String(pressed)} @click=${onClick}>
			<sl-tag pill size="small">${label}</sl-tag>
		</button>`;
	const subshellChip = (entry: Subshell) => {
		const selected = choices.subshell === entry.label;
		const hint = selected ? t("Show overview", "Übersicht anzeigen") : t("Show only this subshell", "Nur diese Unterschale anzeigen");
		return chip(entry.label + superscript(entry.electrons), `${entry.label} · ${entry.electrons} e⁻`,
			subshellColors[entry.l], selected, () => change({ ...choices, subshell: selected ? undefined : entry.label }), hint);
	};
	const orbital = choices.model === "orbitals";
	const core = subshells.filter(entry => !valence.includes(entry));
	const coreLabel = choices.showCore ? t("Hide inner orbitals", "Innere Orbitale ausblenden") : t("Show inner orbitals", "Innere Orbitale einblenden");
	return html`
		<div class="atomic-controls">
			<div class="atom-controls-row">
				<sl-button-group label=${t("Atom model", "Atommodell")}>
					<sl-button size="small" variant=${orbital ? "default" : "primary"} aria-pressed=${String(!orbital)}
						@click=${() => change({ ...choices, model: "bohr" })}>${t("Shells", "Schalen")}</sl-button>
					<sl-button size="small" variant=${orbital ? "primary" : "default"} aria-pressed=${String(orbital)}
						@click=${() => change({ ...choices, model: "orbitals" })}>${t("Orbitals", "Orbitale")}</sl-button>
				</sl-button-group>
				${configuration.predicted ? html`<sl-tag size="small" pill>${t("Predicted", "Vorhergesagt")}</sl-tag>` : nothing}
			</div>
			${!shells.length ? html`<span>${configuration.electrons === 0 ? t("No electrons", "Keine Elektronen")
				: t("Configuration unavailable", "Konfiguration nicht verfügbar")}</span>` : html`
				<div class="electron-config-chips" ?data-orbitals=${orbital} role="group" aria-label=${t("Electron configuration", "Elektronenkonfiguration")}>
					${orbital ? html`
						${choices.showCore && core.length ? html`<div class="atom-core-rail">${core.map(subshellChip)}</div>` : nothing}
						${core.length ? html`<button type="button" class="atom-core-toggle" aria-label=${coreLabel} title=${coreLabel}
							aria-expanded=${String(!!choices.showCore)} @click=${() => change({ ...choices, showCore: !choices.showCore,
								subshell: choices.showCore && core.some(entry => entry.label === choices.subshell) ? undefined : choices.subshell })}>
							<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
								<path d=${choices.showCore ? "m4.5 2.5 3.5 3.5-3.5 3.5" : "m7.5 2.5-3.5 3.5 3.5 3.5"} />
							</svg>
						</button>` : nothing}
						<div class="atom-valence-rail">${valence.map(subshellChip)}</div>
					` : shells.map(entry => {
						const selected = shell === entry.n;
						return chip(entry.label + superscript(entry.electrons),
							`${t("Shell", "Schale")} ${entry.label} · ${entry.electrons} e⁻`,
							selected ? shellColors[entry.n - 1] : mutedShellColor, selected, () => change({ ...choices, shell: entry.n }));
					})}
				</div>
			`}
		</div>`;
}

/** The SVG fallback uses the same schematic radii and angular speeds as the 3D figure. */
export function renderAtomicShells(nucleus: ReturnType<typeof referenceNucleus>, configuration: AtomicConfiguration,
	choices: AtomChoices, pause: boolean, t: Translate) {
	const shells = atomicShells(configuration);
	const shell = choices.shell ?? shells[shells.length - 1]?.n;
	const core = nucleus && schematicNucleons(nucleus, shells.length);
	return svg`<svg class="atom-shell-figure" viewBox="0 0 220 220" role="img" aria-label=${t("Bohr shell model", "Bohrsches Schalenmodell")}>
		${shells.map(({ n, electrons }, index) => {
			const { radius, seconds } = shellOrbit(index, shells.length);
			const r = radius * 94;
			const selected = n === shell;
			const color = selected ? shellColors[n - 1] : mutedShellColor;
			return svg`<g>
				<circle cx="110" cy="110" r=${r} fill="none" stroke=${color} stroke-width=${selected ? 2.5 : 1.4} stroke-opacity=${selected ? .86 : .45} />
				<g class="electron-spin" style="--orbit-period:${seconds}s;animation-play-state:${pause ? "paused" : "running"}">
					${Array.from({ length: electrons }, (_, i) => {
						const angle = (i / electrons + index * .079) * 2 * Math.PI - Math.PI / 2;
						return svg`<circle cx=${110 + r * Math.cos(angle)} cy=${110 + r * Math.sin(angle)}
							r=${shells.length > 4 ? 2.7 : 3.6} fill=${color} />`;
					})}
				</g>
			</g>`;
		})}
		${core?.particles.sort((a, b) => a.z - b.z).map(({ x, y, kind }) => svg`
			<circle cx=${110 + x * 94} cy=${110 - y * 94} r=${core.radius * 94} fill=${nucleonColors[kind]}
				stroke="white" stroke-opacity=".45" stroke-width=".6" />
		`)}
	</svg>`;
}

const slices = new Map<string, ReturnType<typeof atomicOrbitalSlice>>();
export function renderOrbitalFallback(configuration: AtomicConfiguration, choices: AtomChoices, t: Translate) {
	const visible = visibleAtomicSubshells(configuration, choices.showCore, choices.subshell);
	return html`<div class="atom-orbital-slices">
		${visible.map(subshell => html`<div class="atom-slice-group" ?data-focused=${choices.subshell === subshell.label}>
			<strong>${subshell.label}</strong>
			<div class="atom-orbital-tiles">
				${orbitalOrientations(subshell.l).map((_, i) => {
					const electrons = orbitalOccupation(subshell, i);
					const key = `${subshell.label}:${i}`;
					let slice = slices.get(key);
					if (!slice) {
						slice = atomicOrbitalSlice({ subshell, orientation: i, region: subshell.n - subshell.l - 1, atomicNumber: 1, atomId: 1, electrons: 1 }, undefined, 40);
						slices.set(key, slice);
					}
					return html`<figure class="atom-orbital-tile" data-electrons=${electrons} title=${atomicOrbitalLabel(subshell, i, t)}>
						${svg`<svg viewBox="0 0 40 40" aria-hidden="true">
							${slice.paths.map((path, index) => svg`<path fill="#${atomicPhaseColors[index].toString(16)}" d=${path} />`)}
						</svg>`}
						<figcaption>${orbitalGlyph[electrons]}</figcaption>
					</figure>`;
				})}
			</div>
		</div>`)}
	</div>`;
}

export const atomicModelStyles = css`
	.atomic-controls { display: flex; flex-flow: column; align-items: start; min-inline-size: 0; gap: .22rem; }
	.atom-controls-row, .electron-config-chips, .atom-core-rail, .atom-valence-rail { min-inline-size: 0; display: flex; align-items: center; gap: .18rem; }
	.electron-config-chips { inline-size: 100%; flex-wrap: wrap; }
	.electron-config-chips[data-orbitals] { flex-wrap: nowrap; }
	.atom-valence-rail { flex: 0 0 auto; max-inline-size: calc(100% - 1.3rem); overflow-x: auto; scrollbar-width: thin; }
	.atom-core-rail { flex: 0 1 auto; overflow-x: auto; scrollbar-width: thin; }
	.atomic-controls sl-button { --sl-input-height-small: 1.3rem; }
	.atomic-controls sl-button::part(label) { padding-inline: .4rem; font-size: .7rem; }
	.atom-chip, .atom-core-toggle { appearance: none; border: 0; padding: 0; background: none; color: inherit;
		font: inherit; cursor: pointer; border-radius: 9px; flex: 0 0 auto; }
	.atom-core-toggle { display: grid; place-items: center; inline-size: 1.15rem; block-size: 1.15rem; color: #577181; }
	.atom-core-toggle:hover { background: #eaf2f7; }
	.atom-chip:focus-visible, .atom-core-toggle:focus-visible { outline: 2px solid var(--sl-color-primary-600, #087bb4); outline-offset: -1px; }
	.atom-chip sl-tag::part(base) {
		height: auto; min-height: 1.08rem; padding-inline: .32rem; font-size: .67rem; line-height: 1.15;
		color: color-mix(in srgb, var(--orbital-color) 75%, #13222e);
		border-color: color-mix(in srgb, var(--orbital-color) 26%, white);
		background: color-mix(in srgb, var(--orbital-color) 9%, white);
	}
	.atom-chip[aria-pressed="true"] sl-tag::part(base) {
		border-color: var(--orbital-color);
		background: color-mix(in srgb, var(--orbital-color) 20%, white);
	}
`;

export const atomicDrawingStyles = css`
	.atom-shell-figure { display: block; inline-size: 100%; block-size: 100%; }
	.electron-spin { transform-origin: 110px 110px; animation: electron-orbit var(--orbit-period) linear infinite; }
	@keyframes electron-orbit { to { transform: rotate(1turn); } }
	@media (prefers-reduced-motion: reduce) { .electron-spin { animation: none; } }
	.atom-orbital-slices { display: flex; flex-wrap: wrap; place-content: center; align-items: center; gap: .5rem; color: #465764; }
	.atom-slice-group { border: 1px solid #dbe3eb; border-radius: 5px; padding: .25rem; background: white;
		font-size: .68rem; text-align: center; }
	.atom-slice-group[data-focused] { border-color: #087bb4; }
	.atom-orbital-tiles { display: flex; flex-wrap: wrap; justify-content: center; }
	.atom-orbital-tile { margin: 0; inline-size: 2rem; text-align: center; }
	.atom-orbital-tile svg { display: block; inline-size: 100%; aspect-ratio: 1; }
	.atom-orbital-tile[data-electrons="0"] svg { opacity: .30; }
`;
