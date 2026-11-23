# ChemLab structure coverage

This report tracks the [Molecule Builder → ChemLab compatibility handoff](structure-library.md#molecule-builder--chemlab-compatibility-handoff).
It is generated from `data/chemicals.ts`, `molecule-builder/catalog.ts` and `chemlib/saltSolubility.ts`;
do not edit it by hand. Regenerate with `scripts/generate-structure-coverage.ts` and verify with `tests/structure-coverage.test.ts`.

A salt identity is **paired** when the catalog holds a dosed solid and a dosed aqueous stock for the same analytical compound.
Forms are joined by the catalog formula without hydrate water, because a pentahydrate reference and an anhydrous stock describe the same solution.
Reference-only behaviour is an interim gap, not an exemption.

## Summary

| Measure | Count |
| --- | ---: |
| Catalog entries | 181 |
| Entries with a builder structure | 170 |
| Entries without a builder structure | 11 |
| Dosed entries (solid or aqueous) | 137 |
| Dosed salt entries | 62 |
| Molecular reagents outside the salt pairing | 75 |
| Mixtures shown by their constituents | 19 |
| Salt entries in total | 62 |
| Salt identities | 31 |
| Salt identities with both forms | 31 |
| Salt identities with a solid form only | 0 |
| Salt identities with an aqueous form only | 0 |
| Salt identities with neither form | 0 |

## Salt forms

| Salt | Solid recipe | Aqueous stock | Reference only | Status | Material data |
| --- | --- | --- | --- | --- | --- |
| (NH₄)₂SO₄ | Ammoniumsulfat | Ammoniumsulfatlösung | — | paired | 4.1 mol/L saturation, 1.769 g/mL solid density ((NH4)2SO4) |
| AgCl | Silberchlorid | Silberchloridlösung (gesättigt) | — | paired | 0.000013 mol/L saturation, Ksp 1.80e-10, 5.56 g/mL solid density (AgCl) |
| AgNO₃ | Silbernitrat | Silbernitratlösung | — | paired | 8.8 mol/L saturation, 4.35 g/mL solid density (AgNO3) |
| BaCl₂ | Bariumchlorid | Bariumchloridlösung | — | paired | 1.38 mol/L saturation, 3.86 g/mL solid density (BaCl2) |
| BaSO₄ | Bariumsulfat | Bariumsulfatlösung (gesättigt) | — | paired | 0.00001 mol/L saturation, Ksp 1.10e-10, 4.49 g/mL solid density (BaSO4) |
| CH₃COONa | Natriumacetat | Natriumacetatlösung | — | paired | 4.29 mol/L saturation, 1.528 g/mL solid density (CH3COONa) |
| Ca(OH)₂ | Calciumhydroxid | Kalkwasser | — | paired | 0.011 mol/L saturation, Ksp 6.60e-6, 2.21 g/mL solid density (Ca(OH)2) |
| CaCO₃ | Calciumcarbonat | Calciumcarbonatlösung (gesättigt) | — | paired | 0.000058 mol/L saturation, Ksp 3.40e-9, 2.71 g/mL solid density (CaCO3) |
| CaCl₂ | Calciumchlorid | Calciumchloridlösung | — | paired | 5.04 mol/L saturation, 2.15 g/mL solid density (CaCl2) |
| CaSO₄ | Calciumsulfat-Dihydrat (hydrate) | Calciumsulfatlösung (gesättigt) | — | paired | 0.0069 mol/L saturation, Ksp 4.90e-5, 2.97 g/mL solid density (CaSO4) |
| CuSO₄ | Kupfer(II)-sulfat-Pentahydrat (hydrate) | Kupfer(II)-sulfatlösung | — | paired | 1.29 mol/L saturation, 3.6 g/mL solid density (CuSO4) |
| FeCl₃ | Eisen(III)-chlorid | Eisen(III)-chloridlösung | — | paired | 2.69 mol/L saturation, 2.9 g/mL solid density (FeCl3) |
| FeS | Eisen(II)-sulfid | Eisen(II)-sulfidlösung (gesättigt) | — | paired | 3.6e-7 mol/L saturation, Ksp 6.00e-19, 4.84 g/mL solid density (FeS) |
| FeSO₄ | Eisen(II)-sulfat-Heptahydrat (hydrate) | Eisen(II)-sulfatlösung | — | paired | 0.93 mol/L saturation, 3.64 g/mL solid density (FeSO4) |
| KBr | Kaliumbromid | Kaliumbromidlösung | — | paired | 4.57 mol/L saturation, 2.75 g/mL solid density (KBr) |
| KCl | Kaliumchlorid | Kaliumchloridlösung | — | paired | 4.02 mol/L saturation, 1.98 g/mL solid density (KCl) |
| KI | Kaliumiodid | Kaliumiodidlösung | — | paired | 6.09 mol/L saturation, 3.12 g/mL solid density (KI) |
| KMnO₄ | Kaliumpermanganat | Kaliumpermanganatlösung | — | paired | 0.39 mol/L saturation, 2.703 g/mL solid density (KMnO4) |
| KNO₃ | Kaliumnitrat | Kaliumnitratlösung | — | paired | 2.77 mol/L saturation, 2.11 g/mL solid density (KNO3) |
| KNaC₄H₄O₆ | Kaliumnatriumtartrat (hydrate) | Kaliumnatriumtartratlösung | — | paired | 2.2 mol/L saturation, 1.79 g/mL solid density (KNaC4H4O6) |
| KSCN | Kaliumthiocyanat | Kaliumthiocyanatlösung | — | paired | 9.8 mol/L saturation, 1.886 g/mL solid density (KSCN) |
| MgSO₄ | Magnesiumsulfat-Heptahydrat (hydrate) | Magnesiumsulfatlösung | — | paired | 2.8 mol/L saturation, 2.66 g/mL solid density (MgSO4) |
| NH₄Cl | Ammoniumchlorid | Ammoniumchloridlösung | — | paired | 4.6 mol/L saturation, 1.527 g/mL solid density (NH4Cl) |
| NaBr | Natriumbromid | Natriumbromidlösung | — | paired | 7.06 mol/L saturation, 3.2 g/mL solid density (NaBr) |
| NaCl | Natriumchlorid | Natriumchloridlösung (1 mol/L) | — | paired | 5.43 mol/L saturation, 2.16 g/mL solid density (NaCl) |
| NaHCO₃ | Natriumhydrogencarbonat | Natriumhydrogencarbonatlösung | — | paired | 1.14 mol/L saturation, 2.16 g/mL solid density (NaHCO3) |
| NaI | Natriumiodid | Natriumiodidlösung | — | paired | 7.95 mol/L saturation, 3.67 g/mL solid density (NaI) |
| Na₂CO₃ | Natriumcarbonat | Natriumcarbonatlösung | — | paired | 2.01 mol/L saturation, 2.54 g/mL solid density (Na2CO3) |
| Na₂SO₄ | Natriumsulfat | Natriumsulfatlösung | — | paired | 1.3 mol/L saturation, 2.66 g/mL solid density (Na2SO4) |
| Na₂S₂O₃ | Natriumthiosulfat-Pentahydrat (hydrate) | Natriumthiosulfatlösung | — | paired | 3.6 mol/L saturation, 2.345 g/mL solid density (Na2S2O3) |
| ZnSO₄ | Zinksulfat | Zinksulfatlösung | — | paired | 1.79 mol/L saturation, 3.54 g/mL solid density (ZnSO4) |

## Remaining gaps


## Entries without a builder structure

- Bariumchlorid (Salze) — BaCl₂
- Eisen(III)-chlorid (Salze) — FeCl₃
- Natriumcarbonat (Salze) — Na₂CO₃
- Natriumsulfat (Salze) — Na₂SO₄
- Silbernitrat (Salze) — AgNO₃
- Zinksulfat (Salze) — ZnSO₄
- Paraffinöl (Lösungsmittel)
- Lackmus (Indikatoren und Nachweisreagenzien)
- Rotkohlsaft (Indikatoren und Nachweisreagenzien)
- Schiff-Reagenz (Indikatoren und Nachweisreagenzien)
- Olivenöl (Fette und Tenside)

## Entries without a dose

- Aldehyde: Methanal (Formaldehyd)
- Lösungsmittel: Paraffinöl, Petrolether
- Metalle: Kalium, Natrium
- Indikatoren und Nachweisreagenzien: Benedict-Reagenz, Bromthymolblau, Bromwasser, Fehling I, Fehling II, Indigo, Lackmus, Lugolsche Lösung, Methylorange, Phenolphthalein, Rotkohlsaft, Schiff-Reagenz, Tollens-Reagenz, Universalindikator
- Kohlenhydrate und Aminosäuren: Cellulose, Fructose, Glycin, Saccharose, Stärke
- Fette und Tenside: Natriumdodecylsulfat, Natriumstearat, Olivenöl, Stearinsäure, Ölsäure
- Kunststoffe und Monomere: Methylmethacrylat, Polyamid 6, Polyethylen (PE), Polyethylenterephthalat (PET), Polymilchsäure (PLA), Polypropylen (PP), Polystyrol (PS), Polyvinylchlorid (PVC), Styrol
- Stoffgemische: Haushaltsessig, Leitungswasser, Luft, Mineralwasser, Sand, Zitronensaft
