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
| Catalog entries | 157 |
| Entries with a builder structure | 152 |
| Entries without a builder structure | 5 |
| Dosed entries (solid or aqueous) | 66 |
| Dosed salt entries | 19 |
| Molecular reagents outside the salt pairing | 47 |
| Mixtures shown by their constituents | 19 |
| Salt entries in total | 36 |
| Salt identities | 30 |
| Salt identities with both forms | 2 |
| Salt identities with a solid form only | 5 |
| Salt identities with an aqueous form only | 10 |
| Salt identities with neither form | 13 |

## Salt forms

| Salt | Solid recipe | Aqueous stock | Reference only | Status | Material data |
| --- | --- | --- | --- | --- | --- |
| (NH₄)₂SO₄ | — | — | Ammoniumsulfat | reference only | not tabulated |
| AgCl | — | — | Silberchlorid | reference only | Ksp 1.80e-10, 5.56 g/mL solid density (AgCl) |
| AgNO₃ | — | Silbernitratlösung | — | stock only | 8.8 mol/L saturation, 4.35 g/mL solid density (AgNO3) |
| BaCl₂ | — | Bariumchloridlösung | — | stock only | 1.38 mol/L saturation, 3.86 g/mL solid density (BaCl2) |
| BaSO₄ | — | — | Bariumsulfat | reference only | Ksp 1.10e-10, 4.49 g/mL solid density (BaSO4) |
| CH₃COONa | — | — | Natriumacetat | reference only | not tabulated |
| CaCO₃ | — | — | Calciumcarbonat | reference only | Ksp 3.40e-9, 2.71 g/mL solid density (CaCO3) |
| CaCl₂ | — | Calciumchloridlösung | Calciumchlorid | stock only | 5.04 mol/L saturation, 2.15 g/mL solid density (CaCl2) |
| CaSO₄·2 H₂O | — | — | Calciumsulfat-Dihydrat (hydrate) | reference only | Ksp 4.90e-5, 2.97 g/mL solid density (CaSO4) |
| CuSO₄ | — | Kupfer(II)-sulfatlösung | Kupfer(II)-sulfat-Pentahydrat (hydrate) | stock only | 1.29 mol/L saturation, 3.6 g/mL solid density (CuSO4) |
| FeCl₃ | — | Eisen(III)-chloridlösung | — | stock only | 2.69 mol/L saturation, 2.9 g/mL solid density (FeCl3) |
| FeS | — | — | Eisen(II)-sulfid | reference only | not tabulated |
| FeSO₄ | — | Eisen(II)-sulfatlösung | Eisen(II)-sulfat-Heptahydrat (hydrate) | stock only | 0.93 mol/L saturation, 3.64 g/mL solid density (FeSO4) |
| KBr | Kaliumbromid | — | — | solid only | 4.57 mol/L saturation, 2.75 g/mL solid density (KBr) |
| KCl | Kaliumchlorid | — | — | solid only | 4.02 mol/L saturation, 1.98 g/mL solid density (KCl) |
| KI | Kaliumiodid | — | — | solid only | 6.09 mol/L saturation, 3.12 g/mL solid density (KI) |
| KMnO₄ | — | — | Kaliumpermanganat | reference only | not tabulated |
| KNO₃ | — | Kaliumnitratlösung | Kaliumnitrat | stock only | 2.77 mol/L saturation, 2.11 g/mL solid density (KNO3) |
| KNaC₄H₄O₆ | — | — | Kaliumnatriumtartrat | reference only | not tabulated |
| KSCN | — | — | Kaliumthiocyanat | reference only | not tabulated |
| MgSO₄·7 H₂O | — | — | Magnesiumsulfat-Heptahydrat (hydrate) | reference only | not tabulated |
| NH₄Cl | — | — | Ammoniumchlorid | reference only | not tabulated |
| NaBr | Natriumbromid | — | — | solid only | not tabulated |
| NaCl | Natriumchlorid | Natriumchloridlösung (1 mol/L) | — | paired | 5.43 mol/L saturation, 2.16 g/mL solid density (NaCl) |
| NaHCO₃ | Natriumhydrogencarbonat | Natriumhydrogencarbonatlösung | — | paired | 1.14 mol/L saturation, 2.16 g/mL solid density (NaHCO3) |
| NaI | Natriumiodid | — | — | solid only | not tabulated |
| Na₂CO₃ | — | Natriumcarbonatlösung | — | stock only | 2.01 mol/L saturation, 2.54 g/mL solid density (Na2CO3) |
| Na₂SO₄ | — | Natriumsulfatlösung | — | stock only | 1.3 mol/L saturation, 2.66 g/mL solid density (Na2SO4) |
| Na₂S₂O₃·5 H₂O | — | — | Natriumthiosulfat-Pentahydrat (hydrate) | reference only | not tabulated |
| ZnSO₄ | — | Zinksulfatlösung | — | stock only | 1.79 mol/L saturation, 3.54 g/mL solid density (ZnSO4) |

## Remaining gaps

- **(NH₄)₂SO₄** — Neither phase has a recipe for (NH₄)₂SO₄; only the structural preview exists.
- **AgCl** — Neither phase has a recipe for AgCl; only the structural preview exists.
- **AgNO₃** — Solid recipe missing for AgNO₃; 8.8 mol/L saturation, 4.35 g/mL solid density (AgNO3) is tabulated.
- **BaCl₂** — Solid recipe missing for BaCl₂; 1.38 mol/L saturation, 3.86 g/mL solid density (BaCl2) is tabulated.
- **BaSO₄** — Neither phase has a recipe for BaSO₄; only the structural preview exists.
- **CH₃COONa** — Neither phase has a recipe for CH₃COONa; only the structural preview exists.
- **CaCO₃** — Neither phase has a recipe for CaCO₃; only the structural preview exists.
- **CaCl₂** — Solid recipe missing for CaCl₂; 5.04 mol/L saturation, 2.15 g/mL solid density (CaCl2) is tabulated. The catalog lists Calciumchlorid as reference only, so neither form is dosed yet.
- **CaSO₄·2 H₂O** — Neither phase has a recipe for CaSO₄·2 H₂O; only the structural preview exists. The only solid reference is a hydrate (Calciumsulfat-Dihydrat), so a recipe needs a decided hydrate.
- **CuSO₄** — Solid recipe missing for CuSO₄; 1.29 mol/L saturation, 3.6 g/mL solid density (CuSO4) is tabulated. The only solid reference is a hydrate (Kupfer(II)-sulfat-Pentahydrat), so a recipe needs a decided hydrate.
- **FeCl₃** — Solid recipe missing for FeCl₃; 2.69 mol/L saturation, 2.9 g/mL solid density (FeCl3) is tabulated.
- **FeS** — Neither phase has a recipe for FeS; only the structural preview exists.
- **FeSO₄** — Solid recipe missing for FeSO₄; 0.93 mol/L saturation, 3.64 g/mL solid density (FeSO4) is tabulated. The only solid reference is a hydrate (Eisen(II)-sulfat-Heptahydrat), so a recipe needs a decided hydrate.
- **KBr** — Aqueous stock missing for KBr; 4.57 mol/L saturation, 2.75 g/mL solid density (KBr) is tabulated.
- **KCl** — Aqueous stock missing for KCl; 4.02 mol/L saturation, 1.98 g/mL solid density (KCl) is tabulated.
- **KI** — Aqueous stock missing for KI; 6.09 mol/L saturation, 3.12 g/mL solid density (KI) is tabulated.
- **KMnO₄** — Neither phase has a recipe for KMnO₄; only the structural preview exists.
- **KNO₃** — Solid recipe missing for KNO₃; 2.77 mol/L saturation, 2.11 g/mL solid density (KNO3) is tabulated. The catalog lists Kaliumnitrat as reference only, so neither form is dosed yet.
- **KNaC₄H₄O₆** — Neither phase has a recipe for KNaC₄H₄O₆; only the structural preview exists.
- **KSCN** — Neither phase has a recipe for KSCN; only the structural preview exists.
- **MgSO₄·7 H₂O** — Neither phase has a recipe for MgSO₄·7 H₂O; only the structural preview exists. The only solid reference is a hydrate (Magnesiumsulfat-Heptahydrat), so a recipe needs a decided hydrate.
- **NH₄Cl** — Neither phase has a recipe for NH₄Cl; only the structural preview exists.
- **NaBr** — Aqueous stock missing for NaBr and chemlib/saltSolubility.ts has no entry for it.
- **NaI** — Aqueous stock missing for NaI and chemlib/saltSolubility.ts has no entry for it.
- **Na₂CO₃** — Solid recipe missing for Na₂CO₃; 2.01 mol/L saturation, 2.54 g/mL solid density (Na2CO3) is tabulated.
- **Na₂SO₄** — Solid recipe missing for Na₂SO₄; 1.3 mol/L saturation, 2.66 g/mL solid density (Na2SO4) is tabulated.
- **Na₂S₂O₃·5 H₂O** — Neither phase has a recipe for Na₂S₂O₃·5 H₂O; only the structural preview exists. The only solid reference is a hydrate (Natriumthiosulfat-Pentahydrat), so a recipe needs a decided hydrate.
- **ZnSO₄** — Solid recipe missing for ZnSO₄; 1.79 mol/L saturation, 3.54 g/mL solid density (ZnSO4) is tabulated.

## Entries without a builder structure

- Paraffinöl (Lösungsmittel)
- Lackmus (Indikatoren und Nachweisreagenzien)
- Rotkohlsaft (Indikatoren und Nachweisreagenzien)
- Schiff-Reagenz (Indikatoren und Nachweisreagenzien)
- Olivenöl (Fette und Tenside)

## Entries without a dose

- Salze: Ammoniumchlorid, Ammoniumsulfat, Bariumsulfat, Calciumcarbonat, Calciumchlorid, Calciumsulfat-Dihydrat, Eisen(II)-sulfat-Heptahydrat, Eisen(II)-sulfid, Kaliumnatriumtartrat, Kaliumnitrat, Kaliumpermanganat, Kaliumthiocyanat, Kupfer(II)-sulfat-Pentahydrat, Magnesiumsulfat-Heptahydrat, Natriumacetat, Natriumthiosulfat-Pentahydrat, Silberchlorid
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
