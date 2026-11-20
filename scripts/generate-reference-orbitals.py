"""Generate phase isosurfaces for the named catalog geometries with PySCF 2.11
and scikit-image 0.25. Run from the repository root with one BLAS thread.
"""

import base64
import json
from pathlib import Path

import numpy as np
from pyscf import dft, gto, lib
from skimage.measure import marching_cubes

CATALOG = Path("data/structures/catalog.generated.json")
OUTPUT = Path("data/structures/orbitals.generated.json")
STEP = 0.22  # Å
LEVEL = 0.045  # bohr^(-3/2)
POSITION_SCALE = 1000  # signed 16-bit vertex coordinates, in mÅ

# Spin is 2S. Oxygen has two singly occupied alpha orbitals in its triplet.
EXAMPLES = {
    "Wasserstoff": (0, ["homo", "lumo"]),
    "Stickstoff": (0, ["homo", "homo-1", "lumo"]),
    "Sauerstoff": (2, ["somo", "somo-1"]),
    "Wasser": (0, ["homo", "homo-1"]),
    "Methan": (0, ["homo", "homo-3"]),
    "Ammoniaklösung": (0, ["homo", "homo-1"]),
    "Ethen": (0, ["homo", "lumo"]),
    "Ethin": (0, ["homo", "homo-1"]),
    "Kohlenstoffdioxid": (0, ["homo", "homo-2"]),
    "Methanal (Formaldehyd)": (0, ["homo", "lumo"]),
}


def encode(array, dtype):
    return base64.b64encode(array.astype(dtype).tobytes()).decode("ascii")


def calculate(structure, spin, names):
    atoms = structure["atoms"]
    positions = np.array([a["position"] for a in atoms])
    mol = gto.M(atom=[(a["atomicNumber"], a["position"]) for a in atoms],
                unit="Angstrom", basis="def2-svp", spin=spin, charge=sum(a["charge"] for a in atoms), verbose=0)
    model = (dft.UKS if spin else dft.RKS)(mol)
    model.xc = "pbe0"
    model.conv_tol = 1e-9
    model.kernel()
    if not model.converged:
        raise RuntimeError(f"SCF did not converge for {structure['name']}")
    occupied = np.flatnonzero(model.mo_occ[0] if spin else model.mo_occ)
    coefficients = model.mo_coeff[0] if spin else model.mo_coeff

    origin = positions.min(axis=0) - 3
    shape = np.ceil((positions.max(axis=0) + 3 - origin) / STEP).astype(int) + 1
    coords = np.indices(shape).reshape(3, -1).T * STEP + origin
    basis = model._numint.eval_ao(mol, coords / lib.param.BOHR)
    result = []
    for name in names:
        base, _, offset = name.partition("-")
        index = int(occupied[-1]) + (1 if base == "lumo" else -int(offset or "0"))
        field = (basis @ coefficients[:, index]).reshape(tuple(shape))
        if max(np.abs(np.take(field, [0, field.shape[axis] - 1], axis=axis)).max() for axis in range(3)) >= LEVEL:
            raise RuntimeError(f"Isosurface intersects sample bounds for {structure['name']} {name}")
        phases = []
        for phase in (1, -1):
            if (phase * field).max() <= LEVEL:
                phases.append(None)
                continue
            vertices, indices, _, _ = marching_cubes(phase * field, level=LEVEL, spacing=(STEP,) * 3,
                                                      allow_degenerate=False)
            vertices += origin
            # Enforce outward winding. The signed volume is translation invariant for a closed surface.
            a, b, c = (vertices[indices[:, i]] for i in range(3))
            if np.einsum("ij,ij->i", a, np.cross(b, c)).sum() < 0:
                indices = indices[:, ::-1]
            if len(vertices) > 65535 or np.abs(vertices).max() * POSITION_SCALE >= 32768:
                raise RuntimeError("Surface exceeds packed mesh range")
            phases.append([encode(np.rint(vertices * POSITION_SCALE), "<i2"), encode(indices, "<u2")])
        result.append([name, phases])
    return result


def main():
    lib.num_threads(1)
    catalog = json.loads(CATALOG.read_text())
    entries = {}
    for key, (spin, names) in EXAMPLES.items():
        structure = catalog[key]
        # This signature couples the reference to the exact nuclear geometry used for the calculation.
        signature = [[a["atomicNumber"], a["charge"], *a["position"]] for a in structure["atoms"]]
        entries[key] = [signature, calculate(structure, spin, names)]
        print(key, structure["name"], *names, flush=True)
    OUTPUT.write_text(json.dumps(entries, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
