import { readAqueousAcidBase, type AqueousAcidBase } from "./AcidBase";

const dataset = "https://raw.githubusercontent.com/IUPAC/Dissociation-Constants/main/iupac_high-confidence_v2_4.csv";
export const iupacSource = "IUPAC Digitized pKa Dataset";
let pending: Promise<string | undefined> | undefined;

// Handle commas, escaped quotes and line breaks inside quoted experimental notes.
function* csvRows(text: string): Generator<string[]> {
	let row: string[] = [];
	let field = "";
	for (const [value] of text.matchAll(/"(?:[^"]|"")*"|[^"\r\n,]+|,|\r?\n/g)) {
		if (value.startsWith('"')) field += value.slice(1, -1).replace(/""/g, '"');
		else if (value === ",") { row.push(field); field = ""; }
		else if (value.endsWith("\n")) { yield [...row, field]; row = []; field = ""; }
		else field += value;
	}
	if (row.length || field) yield [...row, field];
}

export function readIupacDissociation(csv: string, inchi: string, count: number, step: number): AqueousAcidBase | undefined {
	// The mapping of microscopic sites of ampholytes and polybases into one
	// macroscopic series is ambiguous in the published rows.
	if (!inchi || count < 1 || count > 8 || (step !== 0 && (step !== 1 || count !== 1))) return;
	const rows = csvRows(csv);
	const columns = rows.next().value as string[];
	if (!columns) return;
	const index = new Map(columns.map((column, offset) => [column.replace(/^\uFEFF/, ""), offset]));
	const series = new Map<string, { rank: number; pKa: number[]; problematic: boolean }>();
	for (const row of rows) {
		const cell = (key: string) => row[index.get(key)] ?? "";
		if (cell("InChI") !== inchi || cell("cosolvent") || cell("pressure")) continue;
		const condition = cell("T"), evaluation = cell("assessment");
		if (!condition || !["Reliable", "Approximate"].includes(evaluation)) continue;
		const temperature = Number(condition);
		if (!(temperature >= 20 && temperature <= 30)) continue;
		const type = cell("pka_type");
		const offset = step === 1 ? (/^pKaH1?$/.test(type) ? 0 : -1)
			: /^pKa[1-8]$/.test(type) ? Number(type.slice(-1)) - 1 : -1;
		const value = cell("pka_value");
		if (offset < 0 || offset >= count || !/^-?\d+(?:\.\d+)?$/.test(value)) continue;
		const key = [cell("unique_ID"), cell("ref"), condition, cell("remarks")].join("\u001f");
		let group = series.get(key);
		if (!group) {
			group = { pKa: new Array(count).fill(NaN), problematic: false, rank: Math.abs(temperature - 25) };
			series.set(key, group);
		}
		if (evaluation === "Approximate") group.rank = Math.max(group.rank, 10 + Math.abs(temperature - 25));
		const pKa = Number(value);
		if (Number.isFinite(group.pKa[offset]) && group.pKa[offset] !== pKa) group.problematic = true;
		group.pKa[offset] = pKa;
	}
	const best = [...series.values()].filter(group => !group.problematic)
		.flatMap(({ rank, pKa }) => {
			const data = readAqueousAcidBase({ pKa, step });
			return data ? [{ data, rank }] : [];
		}).sort((a, b) => a.rank - b.rank);
	if (!best.length) return;
	const preferred = best[0];
	if (best.some(entry => entry.rank === preferred.rank && entry.data.pKa.some((value, index) =>
		Math.abs(value - preferred.data.pKa[index]) > .35))) return;
	return preferred.data;
}

export async function lookupIupacDissociation(inchi: string, count: number, step: number) {
	if (!inchi || count < 1 || count > 8 || (step !== 0 && (step !== 1 || count !== 1))) return;
	pending ??= (async () => {
		try {
			const response = await fetch(dataset, { signal: AbortSignal.timeout(6500) });
			return response.ok ? await response.text() : undefined;
		} catch {
			return undefined;
		}
	})();
	const csv = await pending;
	if (!csv) { pending = undefined; return; }
	return readIupacDissociation(csv, inchi, count, step);
}
