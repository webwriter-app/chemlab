export type CompoundMetadata = {
	cid: number;
	name: string;
	formula?: string;
	molarMass?: number;
	inchi?: string;
	inchiKey?: string;
};

const base = "https://pubchem.ncbi.nlm.nih.gov";
const cache = new Map<string, Promise<CompoundMetadata | undefined>>();
const dissociationCache = new Map<number, Promise<DissociationRow[]>>();
const cacheLimit = 128;

function remember<Key, Value>(cache: Map<Key, Value>, key: Key, value: Value): Value {
	cache.set(key, value);
	if (cache.size > cacheLimit) cache.delete(cache.keys().next().value);
	return value;
}

async function request(path: string) {
	try {
		const response = await fetch(base + path, { signal: AbortSignal.timeout(5000) });
		return response.ok ? await response.json() : undefined;
	} catch {
		return undefined;
	}
}

/** Look up the submitted structure by SMILES. Do not substitute a formula or similarity match. */
export function lookupCompound(smiles: string): Promise<CompoundMetadata | undefined> {
	if (!smiles) return Promise.resolve(undefined);
	const cached = cache.get(smiles);
	if (cached) return cached;
	const properties = "Title,IUPACName,MolecularFormula,MolecularWeight,InChI,InChIKey";
	const fetchCompound = request(`/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/property/${properties}/JSON`)
		.then(data => {
			const rows = data?.PropertyTable?.Properties;
			const row = rows?.length === 1 ? rows[0] : undefined;
			const name = row?.Title || row?.IUPACName;
			if (!Number.isSafeInteger(row?.CID) || row.CID <= 0 || typeof name !== "string") {
				cache.delete(smiles);
				return undefined;
			}
			const molarMass = Number(row.MolecularWeight);
			return { cid: row.CID, name, formula: typeof row.MolecularFormula === "string" ? row.MolecularFormula : undefined,
				molarMass: Number.isFinite(molarMass) && molarMass > 0 ? molarMass : undefined,
				inchi: typeof row.InChI === "string" ? row.InChI : undefined,
				inchiKey: typeof row.InChIKey === "string" ? row.InChIKey : undefined };
		});
	return remember(cache, smiles, fetchCompound);
}

export type DissociationRow = { text: string; name: string; source: string };
type ViewSection = { TOCHeading?: string; Section?: ViewSection[]; Information?: unknown[] };
function dissociationSection(sections: ViewSection[]): ViewSection | undefined {
	for (const section of sections ?? []) {
		if (section.TOCHeading === "Dissociation Constants") return section;
		const child = dissociationSection(section.Section);
		if (child) return child;
	}
}

export function lookupDissociation(cid: number): Promise<DissociationRow[]> {
	const cached = dissociationCache.get(cid);
	if (cached) return cached;
	const result = request(`/rest/pug_view/data/compound/${cid}/JSON?heading=Dissociation%20Constants`).then(data => {
		const record = data?.Record;
		if (!record) {
			dissociationCache.delete(cid);
			return [];
		}
		const references = new Map<number, string>((record.Reference ?? []).map(ref => [ref.ReferenceNumber, ref.SourceName]));
		const section = dissociationSection(record.Section);
		return (section?.Information ?? []).flatMap((item: {
			ReferenceNumber?: number; Name?: string; Value?: { StringWithMarkup?: { String?: string }[] };
		}) => (item.Value?.StringWithMarkup ?? []).flatMap(({ String: text }) => typeof text === "string"
			? [{ text, name: item.Name ?? "", source: references.get(item.ReferenceNumber) ?? "PubChem" }] : []));
	});
	return remember(dissociationCache, cid, result);
}
