"""Generate the offline structure library from curated PubChem, COD and ASE records.

Run with ASE 3.26.0, Gemmi 0.7.3 and RDKit 2025.3.5:
python scripts/generate-structure-library.py PATH_TO_CACHE
The cache uses CID.sdf for PubChem conformers and cod-selected.zip for the CIFs.
Missing PubChem conformers are estimated from the curated SMILES. CIFs are required.
"""
import argparse
import json
from collections import Counter
from pathlib import Path
import re
from zipfile import ZipFile

from ase.data import atomic_numbers, chemical_symbols, reference_states
import gemmi
from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem, rdDepictor, rdMolDescriptors


ROOT = Path(__file__).resolve().parents[1] / "data" / "structures"
MANIFEST = json.loads((ROOT / "sources.json").read_text())
COD = "https://www.crystallography.net/cod/"
ASE = "https://ase.gitlab.io/ase/ase/data.html"
NIST = "https://cccbdb.nist.gov/diatomicexpbondx.asp"
IUPAC = "https://goldbook.iupac.org/terms/view/C01286"

FCC = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]]
BCC = [[0, 0, 0], [.5, .5, .5]]
HCP = [[1 / 3, 2 / 3, .25], [2 / 3, 1 / 3, .75]]
DHCP = [[0, 0, 0], [0, 0, .5], [1 / 3, 2 / 3, .25], [2 / 3, 1 / 3, .75]]


def point(values, digits=5):
    return [round(float(value), digits) or 0 for value in values]


def composition(formula):
    return Counter({symbol: int(n or 1) for symbol, n in re.findall(r"([A-Z][a-z]?)(\d*)", formula)})


def molecule(mol, name, source, representation, conformer=None):
    mol = Chem.AddHs(mol, addCoords=conformer is not None)
    if mol.GetNumAtoms() > 128:
        raise ValueError(f"{name} exceeds the editor atom limit")
    Chem.Kekulize(mol, clearAromaticFlags=True)
    if conformer is None and mol.GetNumAtoms() > 1:
        params = AllChem.ETKDGv3()
        params.randomSeed = 61453
        params.maxIterations = 150
        if AllChem.EmbedMolecule(mol, params) >= 0:
            if AllChem.MMFFHasAllMoleculeParams(mol):
                AllChem.MMFFOptimizeMolecule(mol, maxIters=160)
            elif AllChem.UFFHasAllMoleculeParams(mol):
                AllChem.UFFOptimizeMolecule(mol, maxIters=160)
            conformer = mol.GetConformer()
    coordinates = None if conformer is None else [point(mol.GetConformer().GetAtomPosition(i)) for i in range(mol.GetNumAtoms())]
    # Keep the positions of salts' disconnected constituents from overlapping.
    if coordinates:
        fragments = Chem.GetMolFrags(mol)
        if len(fragments) > 1:
            right = 0
            for fragment in fragments:
                minimum = min(coordinates[i][0] for i in fragment)
                for i in fragment:
                    coordinates[i][0] = round(coordinates[i][0] + right - minimum, 5)
                right = max(coordinates[i][0] for i in fragment) + 3
    rdDepictor.Compute2DCoords(mol)
    diagram = mol.GetConformer()
    atoms = []
    for atom in mol.GetAtoms():
        index = atom.GetIdx()
        xy = point(diagram.GetAtomPosition(index))[:2]
        row = dict(id=index + 1, atomicNumber=atom.GetAtomicNum(), charge=atom.GetFormalCharge(), diagram=xy,
                   position=coordinates[index] if coordinates is not None else [*xy, 0])
        if atom.GetIsotope():
            row["isotope"] = atom.GetIsotope()
        atoms.append(row)
    bonds = [dict(from_=b.GetBeginAtomIdx() + 1, to=b.GetEndAtomIdx() + 1, order=int(b.GetBondTypeAsDouble()))
             for b in mol.GetBonds()]
    bonds = [{"from": row["from_"], "to": row["to"], "order": row["order"]} for row in bonds]
    return dict(version=1, kind="molecule", name=name, source=source, representation=representation,
                geometry=("supplied" if representation == "conformer" else "estimated") if coordinates is not None else None,
                atoms=atoms, bonds=bonds)


def pubchem(key, record, cache):
    cid, smiles, name = record["cid"], record["smiles"], record["formula"]
    mol = Chem.MolFromSmiles(smiles)
    if mol is None or composition(rdMolDescriptors.CalcMolFormula(mol)) != composition(name):
        raise ValueError(f"Wrong composition in the vetted PubChem manifest for {key} (CID {cid})")
    source = f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}"
    sdf = cache / "pubchem" / f"{cid}.sdf"
    if sdf.exists():
        reference = next(iter(Chem.SDMolSupplier(str(sdf), removeHs=False)), None)
        if reference and reference.GetConformer().Is3D() and Chem.MolToSmiles(Chem.RemoveHs(reference)) == Chem.MolToSmiles(mol):
            return molecule(reference, name, source, "conformer", reference.GetConformer())
    representation = "ionic-components" if len(Chem.GetMolFrags(mol)) > 1 else None
    return molecule(mol, name, source, representation)


def crystal(name, lengths, angles, locations, space_group, bravais, source, temperature=None, conditions=None):
    # Apply the same coordinate rounding to every source. Round boundary sites
    # back to zero so they aren't duplicated when the cell repeats.
    sites = {}
    for number, coords, charge, occupancy in locations:
        wrapped = tuple(round(value % 1, 5) % 1 for value in coords)
        sites.setdefault((number, wrapped), (charge, occupancy))
    result = [dict(id=i + 1, atomicNumber=number, charge=charge, fractional=list(coords))
              for i, ((number, coords), (charge, _)) in enumerate(sites.items())]
    for row, (_, occupancy) in zip(result, sites.values()):
        if occupancy < .9999:
            row["occupancy"] = round(occupancy, 5)
    if not result or len(result) > 128:
        raise ValueError(f"{name}: invalid site count {len(result)}")
    return dict(version=1, kind="crystal", name=name, cell=dict(lengths=point(lengths), angles=point(angles)),
                sites=result, bravais=bravais, spaceGroup=space_group, source=source,
                temperatureK=temperature, conditions=conditions)


def metal_cell(symbol, kind, a, c, source):
    conditions = "α-Hg · solid below 234.3 K" if symbol == "Hg" else None
    if kind == "rhombohedral":
        ref = reference_states[atomic_numbers[symbol]]
        basis = [[x, x, x] for x in ref["basis_x"]]
        lengths, angles = [a] * 3, [ref["alpha"]] * 3
        sg = "R-3m"
        bravais = "hR"
    else:
        basis, sg, bravais = {
            "fcc": (FCC, "Fm-3m", "cF"), "bcc": (BCC, "Im-3m", "cI"), "sc": ([[0, 0, 0]], "Pm-3m", "cP"),
            "hcp": (HCP, "P63/mmc", "hP"), "dhcp": (DHCP, "P63/mmc", "hP"),
            "bct": (BCC, "I4/mmm", "tI"), "tin": ([[0, 0, 0], [0, .5, .25], [.5, .5, .5], [.5, 0, .75]], "I41/amd", "tI"),
        }[kind]
        lengths = [a, a, c]
        angles = [90, 90, 120 if kind in ("hcp", "dhcp") else 90]
    return crystal(symbol, lengths, angles, [(atomic_numbers[symbol], xyz, 0, 1) for xyz in basis],
                   sg, bravais, source, conditions=conditions)


def ase_metal(symbol):
    atomic_number = atomic_numbers[symbol]
    ref = reference_states[atomic_number] if atomic_number < len(reference_states) else None
    if not ref or ref["symmetry"] not in ("fcc", "bcc", "hcp", "rhombohedral", "bct", "sc"):
        return None
    a = ref["a"]
    return metal_cell(symbol, "tin" if symbol == "Sn" else ref["symmetry"], a, a * ref.get("c/a", 1), ASE)


def label_crystal_ions(model, cell, ions):
    # A plain symbol selects all matching sites. A [symbol, neighbor, Å]
    # rule only selects sites near already assigned atoms of the same ion.
    # This separates polyatomic anions from neutral water in hydrates.
    points = [gemmi.Fractional(*site["fractional"]) for site in model["sites"]]
    symbols = [chemical_symbols[site["atomicNumber"]] for site in model["sites"]]
    for ion, rules in ions.items():
        members = set()
        for rule in rules:
            if isinstance(rule, str):
                members.update(i for i, symbol in enumerate(symbols) if symbol == rule)
                continue
            element, neighbor, cutoff = rule
            reference = [i for i in members if symbols[i] == neighbor]
            members.update(i for i, symbol in enumerate(symbols) if symbol == element and any(
                cell.find_nearest_pbc_image(points[i], points[j]).dist() <= cutoff for j in reference
            ))
        for i in members:
            model["sites"][i]["ion"] = ion


def cod_crystal(cod_id, extract, name):
    files = [path for path in extract.glob(f"**/{cod_id}.cif")]
    if len(files) != 1:
        raise ValueError(f"Expected exactly one CIF for COD {cod_id}")
    block = gemmi.cif.read_file(str(files[0])).sole_block()
    structure = gemmi.make_small_structure_from_block(block)
    sg = structure.spacegroup
    if not sg:
        raise ValueError(f"{name}: no valid space group in COD {cod_id}")
    systems = {"triclinic": "a", "monoclinic": "m", "orthorhombic": "o", "tetragonal": "t",
               "trigonal": "h", "hexagonal": "h", "cubic": "c"}
    crystal_system = sg.crystal_system_str()
    centring = sg.centring_type()
    if (crystal_system == "monoclinic" and centring != "P") or (crystal_system == "orthorhombic" and centring in "AB"):
        centring = "C"
    if sg.hm.startswith("R"):
        centring = "R"
    bravais = systems[crystal_system] + centring
    unit = structure.get_all_unit_cell_sites()
    # The viewer uses the dominant occupant only at a position with disorder.
    # It leaves out deuterium labels from the species ID so the lattice remains elemental.
    dominant = {}
    for site in unit:
        position = tuple(round(value % 1, 5) % 1 for value in site.fract.tolist())
        previous = dominant.get(position)
        if previous is None or previous.occ < site.occ:
            dominant[position] = site
    locations = []
    for position, site in dominant.items():
        number = site.element.atomic_number
        charge = 0
        if name in ("Natriumchlorid", "Kaliumchlorid", "Natriumbromid", "Kaliumbromid", "Natriumiodid", "Kaliumiodid"):
            charge = 1 if number in (11, 19) else -1
        if site.occ > 0:
            locations.append((number, position, charge, min(site.occ, 1)))
    params = list(structure.cell.parameters)
    temperature = None
    for key in ("_diffrn_ambient_temperature", "_cell_measurement_temperature"):
        raw = block.find_value(key)
        if raw and raw not in (".", "?"):
            temperature = gemmi.cif.as_number(raw)
            break
    model = crystal(name, params[:3], params[3:], locations, sg.short_name(), bravais, COD + str(cod_id) + ".html",
                    temperature=temperature, conditions=MANIFEST.get("crystalConditions", {}).get(name))
    label_crystal_ions(model, structure.cell, MANIFEST["crystalIons"].get(name, {}))
    return model


def write_records(path, records):
    lines = [f"  {json.dumps(key, ensure_ascii=False)}:{json.dumps(value, ensure_ascii=False, separators=(',', ':'))}"
             for key, value in sorted(records.items())]
    path.write_text("{\n" + ",\n".join(lines) + "\n}\n")


def generate(cache):
    extract = cache / "cif"
    extract.mkdir(exist_ok=True)
    for archive in sorted(cache.glob("cod-*.zip")):
        with ZipFile(archive) as data:
            for record in data.namelist():
                filename = Path(record).name
                if re.fullmatch(r"\d+\.cif", filename):
                    (extract / filename).write_bytes(data.read(record))
    records = {key: pubchem(key, record, cache) for key, record in MANIFEST["molecules"].items()}
    for key, (number, order, length) in MANIFEST["diatomics"].items():
        symbol = chemical_symbols[number]
        records[key] = dict(version=1, kind="molecule", name=symbol + "2", source=NIST,
                            representation="experimental", geometry="supplied", bonds=[{"from": 1, "to": 2, "order": order}],
                            atoms=[dict(id=i + 1, atomicNumber=number, charge=0, diagram=[side, 0], position=[side, 0, 0])
                                   for i, side in enumerate((-length / 2, length / 2))])
    for key, smiles in MANIFEST["repeatUnits"].items():
        records[key] = molecule(Chem.MolFromSmiles(smiles), "", IUPAC, "repeat-unit")
    for key, (name, smiles, source) in MANIFEST["specimens"].items():
        records[key] = molecule(Chem.MolFromSmiles(smiles), name, source, "constituent")
    for key, cod_id in MANIFEST["crystals"].items():
        records[key] = cod_crystal(cod_id, extract, key)
        records[key]["name"] = MANIFEST.get("crystalNames", {}).get(key, "")
    metals = {}
    for symbol in MANIFEST["metalElements"]:
        if symbol in MANIFEST["metalCifs"]:
            model = cod_crystal(MANIFEST["metalCifs"][symbol], extract, symbol)
        elif symbol in MANIFEST["metalExceptions"]:
            model = metal_cell(symbol, *MANIFEST["metalExceptions"][symbol])
        else:
            model = ase_metal(symbol)
        metals[str(atomic_numbers[symbol])] = model
    write_records(ROOT / "catalog.generated.json", records)
    write_records(ROOT / "metals.generated.json", metals)


if __name__ == "__main__":
    RDLogger.DisableLog("rdApp.warning")
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("cache", type=Path)
    generate(cli.parse_args().cache)
