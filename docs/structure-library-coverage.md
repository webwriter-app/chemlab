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
| Catalog entries | 176 |
| Entries with a builder structure | 165 |
| Entries without a builder structure | 11 |
| Dosed entries (solid or aqueous) | 95 |
| Dosed salt entries | 48 |
| Molecular reagents outside the salt pairing | 47 |
| Mixtures shown by their constituents | 19 |
| Salt entries in total | 55 |
| Salt identities | 30 |
| Salt identities with both forms | 23 |
| Salt identities with a solid form only | 0 |
| Salt identities with an aqueous form only | 2 |
| Salt identities with neither form | 5 |

## Salt forms

| Salt | Solid recipe | Aqueous stock | Reference only | Status | Material data |
| --- | --- | --- | --- | --- | --- |
| (NH₄)₂SO₄ | Ammoniumsulfat | Ammoniumsulfatlösung | — | paired | 4.1 mol/L saturation, 1.769 g/mL solid density ((NH4)2SO4) |
| AgCl | Silberchlorid | Silberchloridlösung (gesättigt) | — | paired | 0.000013 mol/L saturation, Ksp 1.80e-10, 5.56 g/mL solid density (AgCl) |
| AgNO₃ | Silbernitrat | Silbernitratlösung | — | paired | 8.8 mol/L saturation, 4.35 g/mL solid density (AgNO3) |
| BaCl₂ | Bariumchlorid | Bariumchloridlösung | — | paired | 1.38 mol/L saturation, 3.86 g/mL solid density (BaCl2) |
| BaSO₄ | Bariumsulfat | Bariumsulfatlösung (gesättigt) | — | paired | 0.00001 mol/L saturation, Ksp 1.10e-10, 4.49 g/mL solid density (BaSO4) |
| CH₃COONa | Natriumacetat | Natriumacetatlösung | — | paired | 4.29 mol/L saturation, 1.528 g/mL solid density (CH3COONa) |
| CaCO₃ | Calciumcarbonat | Calciumcarbonatlösung (gesättigt) | — | paired | 0.000058 mol/L saturation, Ksp 3.40e-9, 2.71 g/mL solid density (CaCO3) |
| CaCl₂ | Calciumchlorid | Calciumchloridlösung | — | paired | 5.04 mol/L saturation, 2.15 g/mL solid density (CaCl2) |
| CaSO₄·2 H₂O | — | — | Calciumsulfat-Dihydrat (hydrate) | reference only | Ksp 4.90e-5, 2.97 g/mL solid density (CaSO4) |
| CuSO₄ | — | Kupfer(II)-sulfatlösung | Kupfer(II)-sulfat-Pentahydrat (hydrate) | stock only | 1.29 mol/L saturation, 3.6 g/mL solid density (CuSO4) |
| FeCl₃ | Eisen(III)-chlorid | Eisen(III)-chloridlösung | — | paired | 2.69 mol/L saturation, 2.9 g/mL solid density (FeCl3) |
| FeS | — | — | Eisen(II)-sulfid | reference only | not tabulated |
| FeSO₄ | — | Eisen(II)-sulfatlösung | Eisen(II)-sulfat-Heptahydrat (hydrate) | stock only | 0.93 mol/L saturation, 3.64 g/mL solid density (FeSO4) |
| KBr | Kaliumbromid | Kaliumbromidlösung | — | paired | 4.57 mol/L saturation, 2.75 g/mL solid density (KBr) |
| KCl | Kaliumchlorid | Kaliumchloridlösung | — | paired | 4.02 mol/L saturation, 1.98 g/mL solid density (KCl) |
| KI | Kaliumiodid | Kaliumiodidlösung | — | paired | 6.09 mol/L saturation, 3.12 g/mL solid density (KI) |
| KMnO₄ | Kaliumpermanganat | Kaliumpermanganatlösung | — | paired | 0.39 mol/L saturation, 2.703 g/mL solid density (KMnO4) |
| KNO₃ | Kaliumnitrat | Kaliumnitratlösung | — | paired | 2.77 mol/L saturation, 2.11 g/mL solid density (KNO3) |
| KNaC₄H₄O₆ | — | — | Kaliumnatriumtartrat | reference only | not tabulated |
| KSCN | Kaliumthiocyanat | Kaliumthiocyanatlösung | — | paired | 9.8 mol/L saturation, 1.886 g/mL solid density (KSCN) |
| MgSO₄·7 H₂O | — | — | Magnesiumsulfat-Heptahydrat (hydrate) | reference only | not tabulated |
| NH₄Cl | Ammoniumchlorid | Ammoniumchloridlösung | — | paired | 4.6 mol/L saturation, 1.527 g/mL solid density (NH4Cl) |
| NaBr | Natriumbromid | Natriumbromidlösung | — | paired | 7.06 mol/L saturation, 3.2 g/mL solid density (NaBr) |
| NaCl | Natriumchlorid | Natriumchloridlösung (1 mol/L) | — | paired | 5.43 mol/L saturation, 2.16 g/mL solid density (NaCl) |
| NaHCO₃ | Natriumhydrogencarbonat | Natriumhydrogencarbonatlösung | — | paired | 1.14 mol/L saturation, 2.16 g/mL solid density (NaHCO3) |
| NaI | Natriumiodid | Natriumiodidlösung | — | paired | 7.95 mol/L saturation, 3.67 g/mL solid density (NaI) |
| Na₂CO₃ | Natriumcarbonat | Natriumcarbonatlösung | — | paired | 2.01 mol/L saturation, 2.54 g/mL solid density (Na2CO3) |
| Na₂SO₄ | Natriumsulfat | Natriumsulfatlösung | — | paired | 1.3 mol/L saturation, 2.66 g/mL solid density (Na2SO4) |
| Na₂S₂O₃·5 H₂O | — | — | Natriumthiosulfat-Pentahydrat (hydrate) | reference only | not tabulated |
| ZnSO₄ | Zinksulfat | Zinksulfatlösung | — | paired | 1.79 mol/L saturation, 3.54 g/mL solid density (ZnSO4) |

## Remaining gaps

- **CaSO₄·2 H₂O** — Neither phase has a recipe for CaSO₄·2 H₂O; only the structural preview exists. The only solid reference is a hydrate (Calciumsulfat-Dihydrat), so a recipe needs a decided hydrate.
- **CuSO₄** — Solid recipe missing for CuSO₄; 1.29 mol/L saturation, 3.6 g/mL solid density (CuSO4) is tabulated. The only solid reference is a hydrate (Kupfer(II)-sulfat-Pentahydrat), so a recipe needs a decided hydrate.
- **FeS** — Neither phase has a recipe for FeS; only the structural preview exists.
- **FeSO₄** — Solid recipe missing for FeSO₄; 0.93 mol/L saturation, 3.64 g/mL solid density (FeSO4) is tabulated. The only solid reference is a hydrate (Eisen(II)-sulfat-Heptahydrat), so a recipe needs a decided hydrate.
- **KNaC₄H₄O₆** — Neither phase has a recipe for KNaC₄H₄O₆; only the structural preview exists.
- **MgSO₄·7 H₂O** — Neither phase has a recipe for MgSO₄·7 H₂O; only the structural preview exists. The only solid reference is a hydrate (Magnesiumsulfat-Heptahydrat), so a recipe needs a decided hydrate.
- **Na₂S₂O₃·5 H₂O** — Neither phase has a recipe for Na₂S₂O₃·5 H₂O; only the structural preview exists. The only solid reference is a hydrate (Natriumthiosulfat-Pentahydrat), so a recipe needs a decided hydrate.

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

- Salze: Calciumsulfat-Dihydrat, Eisen(II)-sulfat-Heptahydrat, Eisen(II)-sulfid, Kaliumnatriumtartrat, Kupfer(II)-sulfat-Pentahydrat, Magnesiumsulfat-Heptahydrat, Natriumthiosulfat-Pentahydrat
- Anorganische Säuren: Salpetersäure
- Basen: Calciumhydroxid, Kalkwasser
- Carbonsäuren: Benzoesäure, Sorbinsäure, Tetradecansäure (Myristinsäure)
- Alkohole: 3-Methylbutan-1-ol (Isoamylalkohol), Tetradecan-1-ol (Myristylalkohol)
- Aldehyde: Benzaldehyd, Methanal (Formaldehyd)
- Ester: Isoamylacetat, Myristylmyristat
- Kohlenwasserstoffe: Butan, Ethen, Ethin, Methan, Propan
- Lösungsmittel: Paraffinöl, Petrolether
- Halogenkohlenwasserstoffe: Bromethan, Chlorethen (Vinylchlorid), Dichlormethan
- Metalle: Kalium, Natrium
- Nichtmetalle und Gase: Chlor, Kohlenstoffdioxid, Sauerstoff, Stickstoff, Wasserstoff
- Oxide: Calciumoxid, Eisen(III)-oxid, Kupfer(II)-oxid, Magnesiumoxid, Mangan(IV)-oxid, Siliciumdioxid
- Indikatoren und Nachweisreagenzien: Benedict-Reagenz, Bromthymolblau, Bromwasser, Fehling I, Fehling II, Indigo, Lackmus, Lugolsche Lösung, Methylorange, Phenolphthalein, Rotkohlsaft, Schiff-Reagenz, Tollens-Reagenz, Universalindikator
- Kohlenhydrate und Aminosäuren: Cellulose, Fructose, Glycin, Saccharose, Stärke
- Fette und Tenside: Natriumdodecylsulfat, Natriumstearat, Olivenöl, Stearinsäure, Ölsäure
- Kunststoffe und Monomere: Methylmethacrylat, Polyamid 6, Polyethylen (PE), Polyethylenterephthalat (PET), Polymilchsäure (PLA), Polypropylen (PP), Polystyrol (PS), Polyvinylchlorid (PVC), Styrol
- Stoffgemische: Haushaltsessig, Leitungswasser, Luft, Mineralwasser, Sand, Zitronensaft
