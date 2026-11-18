# Electrochemistry audit

Reviewed on 2026-11-17. The local branch was clean at [`c8c0ea0`][revision], 17 commits ahead of [GitHub `main` at `6d3d228`][upstream]. The unpublished work includes inventory limits on electrode reactions, source polarity and current control, reference electrodes and salt bridges, a twelve-cell example, movable cables, and separate readings for branches of the device network. The findings below describe the local revision, including this unpublished work.

TypeScript passed with `node node_modules/typescript/bin/tsc --noEmit`. The numerical observations come from a temporary Node harness calling the checked-in Chemlib code directly. The harness instantiated the real mixtures, electrodes, devices and cables and used the default 1 s step and 298.15 K. It built the cable connections in memory. It did not exercise WebWriter, Pixi rendering, or interactive wiring. **Reproduced** means the result was observed in that harness. **Code review** means the behavior follows from the cited implementation and was not separately exercised. Currents below are magnitudes unless the sign is relevant.

Code links pin the audited revision. They become available on GitHub once it has that commit. The cited files and line numbers are also available locally at that revision, for example with `git show c8c0ea08312d9217824944d54618c378088411c1:chemlib/Simulation.ts | nl -ba`.

## Follow-up review

The original observations below refer to the audited revision. The follow-up reviewed the implementation through `edffc34` and its thirteen audit commits.

| Finding | Follow-up |
| --- | --- |
| EC-01 | No steady current without an ionic path. The analytical RC pulse now also requires two wetted electrodes. |
| EC-02 | Cell and instrument network share the source EMF. Parallel-load tests confirm both voltage-mode current limiting and constant-current regulation at the source terminals. A reagent limit caps the cell branch. |
| EC-03 | A dry reference gives no reading. A third reference now measures against the local electrolyte through a dedicated voltage lead. A two-electrode reference pair no longer provides a driven current path. |
| EC-04 | Fe(III)/Fe(II) and metal couples accept an absent product and can create the currently tabulated ions. A future polyatomic product still needs a molecule definition. |
| EC-05 | A shared electrolyte balances the total electrode charge once. The chlorine equilibrium now also accounts for acidification through dissolved chlorine. |
| EC-06 | Metal displacement limits the extent in electron equivalents and converts back to moles with each species' own valence. |
| EC-07 | Electrolysis books water and settles the electrolyte after changing inventory. |
| EC-08 | The source reports its solved terminal voltage and current. Removing a lead invalidates measurements across the affected network. |
| EC-09 | The conductivity, separation and immersed area set the resistance. Electrode wetting now measures below the surface, and both bridge legs have to reach the liquid. The bridge resistance is invariant to electrode ordering. |
| EC-10 | Free-ion concentrations and a transfer-limited current bound replaced analytical totals and step-size-only limits. Shared reagent spending is capped. Activity coefficients, explicit migration and flow-dependent mass transport remain model extensions. |
| EC-11 | The root finder treats out-of-range trials as bracket limits and retries at source compliance. |
| EC-12 | Escaped gas is unavailable for reaction. Chlorine hydrolysis now solves a reversible equilibrium with the actual pH and inventory. The collector still assumes gas reaching its attached vessel outlet is routed into the tube. |
| EC-13 | The exposed layer controls chemistry with a finite inventory. Partial surface coverage and a potential-dependent passivation model remain extensions. |

The three-electrode voltage estimate uses the lumped solution potential at the nearest current-carrying electrode in the same bath. It does not resolve spatial solution gradients. The chlorine equilibrium uses the existing ideal-concentration constant. The measured equilibrium constant varies with ionic strength. [Gamry, Potentiostat Fundamentals](https://www.gamry.com/application-notes/instrumentation/potentiostat-fundamentals/), [Cherney et al., aqueous free chlorine speciation](https://journals.sagepub.com/doi/10.1366/000370206777887062).

## Confirmed defects

### EC-01 · Critical · Separated half-cells sustain current with no ionic connection

- **Reproduced.** Two 100 mL half-cells, Zn in 1 M ZnSO₄ and Cu in 1 M CuSO₄, linked externally by two leads and a 0.1 Ω ammeter. The first step gave **0.407595 A without a bridge** and **0.016564 A with a bridge**. Without the bridge the model recorded uncompensated ionic charge of about +4.22 µmol in the zinc vessel and −4.22 µmol in the copper vessel.
- **Cause.** The electrolyte branch always exists at 2 Ω. A bridge adds 60 Ω. The code does not require either a shared electrolyte or an ionic connection between the vessels. With a bridge, it adjusts a bookkeeping charge without transporting any explicit counterions. A separated cell needs an ionic return path for sustained external current. A high-impedance open-circuit reading can still be a useful approximation for a cell with an ionic connection.
- **Evidence.** [Simulation.ts:1917–1932][cell-network], [Simulation.ts:1852–1856][bridge-balance], [webwriter-chemlab.ts:1009–1030][ionic-path], [OpenStax, Galvanic Cells][galvanic].

### EC-02 · Critical · The cell solve and the instrument network use different source voltages

- **Reproduced, constant-current mode.** Two 100 mL, 1 M NaCl half-cells with graphite and platinum electrodes and a bridge. A supply set to **1.000 mA** with 10 V compliance had a separate ammeter connected across the source terminals through two leads. The modeled supply delivered **2.899916 A**. The ammeter took **2.898916 A**, leaving **1.000 mA** for the cell.
- **Reproduced, voltage mode.** A 3 V supply, in series with a 10 MΩ voltmeter and a Daniell cell, had a separate ammeter branch directly across the supply through two leads. The supply delivered **4.687500 A** with a configured **0.200 A** limit. Removing that limit produced the same result. The current in the cell branch was only **0.410 µA**.
- **Cause.** `circuitThevenin` calculates both resistance and open-circuit voltage. The network still has zero source EMF at this point. The cell uses the network resistance but takes its driving voltage directly from the source setting. The source EMF is inserted for the meter calculation only after the cell has been solved. The supply control loops also regulate the cell branch current. A parallel load can change the source terminal voltage and draw current independently of the cell. In series wiring, mapping source polarity through `terminalElectrode` is additionally fragile because that search stops at instruments.
- **Evidence.** [Simulation.ts:1917–1997][source-drive], [circuit.ts:303–315][thevenin], [circuit.ts:335–365][readings], [ComponentManager.ts:151–168][pole-traversal].

### EC-03 · Critical · A dry reference electrode supplies a reaction-free return path

- **Reproduced.** Platinum dipped into 100 mL water, an idealized +0.222 V reference outside any vessel, and a directly wired 3 V source with platinum on the positive terminal. The model delivered **0.748718 A** and produced **1.940 µmol O₂** in one step, with no counterreaction. In a separate test, wiring a third electrode to an existing two-electrode cell caused circuit detection to reject the setup.
- **Cause.** The reference is eligible without a mixture. Its current is proportional to the overpotential with a very large slope and unlimited capacity in either direction. Its reaction callback does nothing. Circuit detection requires exactly two electrodes. A conventional reference senses voltage through an ionic contact and carries negligible current. A separate counter electrode closes a driven three-electrode circuit.
- **Evidence.** [Simulation.ts:1812–1833][reference-model], [Simulation.ts:1880–1906][electrode-eligibility], [ComponentManager.ts:179–207][electrode-count], [Gamry, Electrode Experiments, hosted by Caltech][reference].

### EC-04 · High · Missing products suppress feasible half-reactions

- **Reproduced.** In two initially pure water vessels, a 3 V supply made the zinc electrode anodic with platinum at the other terminal. The zinc vessel produced **0.778 µmol O₂** in one step and **no Zn²⁺**. Its candidate list contained only the hydrogen and oxygen couples. A graphite electrode in a mixture with stored Fe³⁺ and no Fe²⁺ also omitted the Fe³⁺/Fe²⁺ couple.
- **Cause.** Missing dissolved terms return zero activity, making the computed potential nonfinite. This removes the whole couple before the code checks the reactants required in each direction. The singular logarithm is a limitation of evaluating an equilibrium expression at zero activity. It does not rule out producing the absent species.
- **Evidence.** [Simulation.ts:1052–1083][nernst-code], [Simulation.ts:1170–1187][direction-check], [IUPAC Nernst equation][nernst].

### EC-05 · High · Proton bookkeeping double-counts alkalinity in one-beaker NaCl electrolysis

- **Reproduced.** Graphite anode and platinum cathode in one 100 mL beaker of 1 M NaCl, driven by a 3 V source. The first step consumed **4.27948 µmol Cl⁻**, produced **2.14535 µmol H₂** and **0.002803 µmol O₂**, and reported **pH 9.932**. The half-reactions imply `2 n(H₂) − 4 n(O₂) = 4.27948` µmol net base. The model counted **8.55896 µmol** toward alkalinity.
- **Cause.** Removing the stored chloride increases the net spectator charge. The cathodic proton adjustment adds essentially the same net charge again through `excessCharge`. This comparison uses the simulator's own half-reactions, before including real chlorine hydrolysis or hypochlorite formation.
- **Evidence.** [Simulation.ts:1256–1285][charge-booking], [Simulation.ts:2607–2613][ph-booking], [OpenStax, Electrolysis][electrolysis], [EPA, Chlorine Chemistry][chlorine].

### EC-06 · High · Metal displacement violates electron conservation

- **Reproduced.** In an isolated stoichiometry probe of the displacement routine, a 100 mL aqueous mixture started with **10.000 mmol Zn** and **5.000 mmol Ag⁺**, with spectators omitted. The model consumed both amounts and produced **10.000 mmol Zn²⁺** and **5.000 mmol Ag**. That corresponds to 20 mmol electrons released and 5 mmol consumed. The balanced reaction `Zn + 2 Ag⁺ → Zn²⁺ + 2 Ag` permits **2.500 mmol Zn** to dissolve with this silver inventory.
- **Cause.** The current calculation divides each inventory by the electron count before taking the limiting extent and then multiplies by that count to get moles converted. Electron-equivalent limits require multiplication by each species' electron count, and conversion back to species moles requires division. Equal-valence pairs can conceal this flaw.
- **Evidence.** [Simulation.ts:2115–2152][displacement], [OpenStax, Galvanic Cells][galvanic].

### EC-07 · High · Reaction steps leave the electrolyte out of equilibrium and water inventory unchanged

- **Reproduced.** In 100 mL of 0.15 M CuSO₄ at 5 V with platinum anodic and graphite cathodic, the initial solvation pass left **0.980 µmol Cu(OH)₂**. The same amount remained after ten electrochemical steps. An explicit solvation pass then dissolved it. This test isolates the stale equilibrium. It does not validate the initial predicted precipitate.
- **Reproduced.** In 100 mL of 1 M Na₂SO₄ at 1 A, the first step produced **5.182 µmol H₂** and **2.591 µmol O₂**, with water unchanged at **5.5509298 mol**. The net reaction consumes about **5.182 µmol H₂O** for those gas amounts.
- **Cause.** The electrochemical step applies electrode reactions and bridge charge bookkeeping. It does not rerun salt or hydroxide equilibria. The reaction application also skips water terms entirely. A unit solvent activity can be appropriate in the Nernst equation, but it does not balance the solvent inventory.
- **Evidence.** [Simulation.ts:1256–1285][charge-booking], [Simulation.ts:2017–2023][end-step], [Simulation.ts:455–480][equilibria], [OpenStax, Electrolysis][electrolysis].

### EC-08 · High · Instrument values can misrepresent the electrical state

- **Reproduced.** A voltmeter with just one terminal wired into a live 3 V Daniell circuit reported **0 V** and **0 A**. Its floating terminal takes the same modeled potential as the connected one. This looks like a valid zero reading on the device.
- **Code review.** Voltmeter and voltage-mode multimeter readings discard the sign. The source LCD shows the set current in current mode, including when its compliance voltage prevents delivery. In voltage mode it can substitute the set voltage for a missing terminal reading. The Faraday display divides the total source branch current by `F`, which can include a large bypass current as in EC-02. An idealized passive voltmeter calculation also displays a leakage current while the chemistry solve treats the external current as zero.
- **Evidence.** [Simulation.ts:1917–1932][cell-network], [Simulation.ts:1998–2014][meter-state], [ElectricDeviceView.ts:391–415][lcd], [webwriter-chemlab.ts:1032–1039][source-current-ui], [webwriter-chemlab.ts:2016–2027][faraday-ui].

## Model limitations and numerical risks

| ID | Classification | Finding and impact |
| --- | --- | --- |
| EC-09 | Code review · Conductivity and wetting | The nominal electrolyte path is always 2 Ω, regardless of conductivity, temperature, electrode spacing or vessel geometry. A 60 Ω bridge is another fixed resistor. The active area defaults to 4.5 cm² or an authored value, and a vessel bounding box determines whether the electrodes and bridge are attached. The liquid surface does not determine immersion. This can let a geometrically attached but dry tip participate and masks differences between pure water and supporting electrolytes. [halfReactions.ts:67–93][constants], [Simulation.ts:1908–1923][cell-resistance], [CanvasController.ts:1336–1396][wetting]. |
| EC-10 | Code review · Kinetics and shared inventory | The Nernst calculation uses concentrations as activity proxies. Stored hydrolyzing cations are read from an analytical total divided by a complex factor, rather than explicitly applying the hydrolysis fractions to get free-ion activity. The symmetric kinetic curves use fixed exchange-current parameters for each reaction/material pair, with a cap `n_available F / (Δt A)`, where `n_available` is in moles of electron equivalents. This cap responds to the integration step and does not describe diffusion or migration. Independent candidates and electrodes can draw on the same starting inventory. Their updates are applied sequentially after the solve, so there is no shared constraint enforcing the solved charge when competing reactions exhaust a reactant. [Simulation.ts:658–700][ions], [Simulation.ts:1139–1204][inventory], [Simulation.ts:1784–1798][apply-currents], [halfReactions.ts:321–352][kinetics], [IUPAC Nernst equation][nernst], [MIT electrochemical kinetics and transport notes][transport]. |
| EC-11 | Code review · Root finding at current limits | Clamping makes current a nondecreasing function of potential with possible flat intervals. A trial current outside either electrode's feasible range returns an undefined potential and makes the outer residual nonfinite. The outer solver can abandon the solve immediately when this happens, including from the ohmic starting estimate. With the current-source path the solver can likewise give up before trying the compliance-limited voltage. The likely symptom near depletion is an absent reading in a case that could still carry a smaller steady current. This case was not reproduced separately. [Simulation.ts:1312–1356][monotone], [Simulation.ts:1373–1391][clamp], [Simulation.ts:1533–1559][outer-root], [Simulation.ts:1938–1962][compliance]. |
| EC-12 | Reproduced and code review · Gas inventory, phases and collection | A beaker seeded with **10.000 mmol previously escaped Cl₂** had that tally fall during a powered step. The escaped inventory is reused as an available reactant at either electrode. Gas activity is always set to 1 bar, regardless of dissolved gas or headspace. Bromine and iodine go directly into the same gas tally, although liquid Br₂, solid I₂, and dissolved species matter at room conditions. Chlorine hydrolysis is missing. The collector reports all gas attributed to the vessel, with a fixed molar volume, regardless of whether that gas entered the tube. [Simulation.ts:1052–1083][nernst-code], [Simulation.ts:1139–1204][inventory], [Simulation.ts:1256–1285][charge-booking], [halfReactions.ts:157–178][halogen-phase], [halfReactions.ts:235–240][halogens], [ElectricDeviceView.ts:462–470][collector], [NIST bromine data][bromine], [NIST iodine data][iodine], [EPA, Chlorine Chemistry][chlorine]. |
| EC-13 | Code review · Surface and electrode inventory | A coating adds a dissolvable solid amount, but the underlying material remains an unlimited oxidation candidate. Kinetic parameters remain those of the base electrode. Depositing its own metal does not increase a tracked electrode inventory. These assumptions break coating protection and limit the accuracy of repeated plating and stripping. Generic metal couples also omit passivation and the instability of deposits such as sodium metal in water. [Simulation.ts:1139–1204][inventory], [Simulation.ts:1233–1254][plating], [halfReactions.ts:189–240][reaction-table], [OpenStax, Representative Metals][sodium]. |

## Numerical checks that passed

| Setup | Calculation or observation | Scope |
| --- | --- | --- |
| Daniell cell with a bridge and 10 MΩ voltmeter | **1.1004307 V** at the meter. The tabulated standard potentials differ by **1.101 V**. | Checks a simple open-circuit reading, with the small difference arising from the model's electrode kinetics and loading. |
| Cu/Cu²⁺ concentration cell, 1 M against 0.001 M, with bridge and voltmeter | **88.7385 mV**. With unit activity coefficients, `(RT / 2F) ln(1000)` at 298.15 K is about **88.74 mV**. | Checks Nernst sign and magnitude under the ideal-concentration approximation. |
| Water electrolysis in 1 M Na₂SO₄, 1 A, first 1 s step | **5.18213 µmol H₂**, **2.59107 µmol O₂** for either platinum or graphite. These match `It / (2F)` and `It / (4F)`. | Checks Faraday conversion for a case where the modeled side currents do not alter the first-step product ratio. The missing water consumption is EC-07. |
| Same water electrolysis tests, source terminal readings | **3.84312 V** for platinum and **4.81998 V** for graphite with two 0.02 Ω leads. | The project notes give **1.80 V** and **2.78 V**. These match the inferred interface potential differences after subtracting **2.04 V** of modeled electrolyte and lead drops at 1 A. They should not be read as modeled supply terminal voltages. |

[Simulation.ts:1052–1083][nernst-code], [Simulation.ts:1784–1798][apply-currents], [AGENTS.md:83][reported-values], [IUPAC Nernst equation][nernst], [OpenStax, Electrolysis][electrolysis].

[revision]: https://github.com/webwriter-app/chemlab/commit/c8c0ea08312d9217824944d54618c378088411c1
[upstream]: https://github.com/webwriter-app/chemlab/commit/6d3d22825864e065d19af00e170f1b7bc3b4a5eb
[cell-resistance]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1908-L1923
[cell-network]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1917-L1932
[bridge-balance]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1852-L1856
[ionic-path]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/webwriter-chemlab.ts#L1009-L1030
[compliance]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1938-L1962
[source-drive]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1917-L1997
[thevenin]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/circuit.ts#L303-L315
[readings]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/circuit.ts#L335-L365
[pole-traversal]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/ComponentManager.ts#L151-L168
[reference-model]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1812-L1833
[electrode-eligibility]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1880-L1906
[electrode-count]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/ComponentManager.ts#L179-L207
[nernst-code]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1052-L1083
[direction-check]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1170-L1187
[charge-booking]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1256-L1285
[ph-booking]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L2607-L2613
[displacement]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L2115-L2152
[end-step]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L2017-L2023
[equilibria]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L455-L480
[meter-state]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1998-L2014
[lcd]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/controllers/ElectricDeviceView.ts#L391-L415
[source-current-ui]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/webwriter-chemlab.ts#L1032-L1039
[faraday-ui]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/webwriter-chemlab.ts#L2016-L2027
[constants]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/halfReactions.ts#L67-L93
[wetting]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/controllers/CanvasController.ts#L1336-L1396
[ions]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L658-L700
[inventory]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1139-L1204
[apply-currents]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1784-L1798
[kinetics]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/halfReactions.ts#L321-L352
[monotone]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1312-L1356
[clamp]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1373-L1391
[outer-root]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1533-L1559
[halogen-phase]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/halfReactions.ts#L157-L178
[halogens]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/halfReactions.ts#L235-L240
[collector]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/controllers/ElectricDeviceView.ts#L462-L470
[plating]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/Simulation.ts#L1233-L1254
[reaction-table]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/chemlib/halfReactions.ts#L189-L240
[reported-values]: https://github.com/webwriter-app/chemlab/blob/c8c0ea08312d9217824944d54618c378088411c1/AGENTS.md#L83

[nernst]: https://doi.org/10.1351/goldbook.09068
[galvanic]: https://openstax.org/books/chemistry-2e/pages/17-2-galvanic-cells
[electrolysis]: https://openstax.org/books/chemistry-2e/pages/17-7-electrolysis
[reference]: https://mmrc.caltech.edu/Gamry/literature/2%2C%203%20and%204%20electrode%20experiments.html
[transport]: https://ocw.mit.edu/courses/10-626-electrochemical-energy-systems-spring-2014/pages/lecture-notes/
[bromine]: https://webbook.nist.gov/cgi/formula?ID=C7726956&Mask=2
[iodine]: https://webbook.nist.gov/cgi/cbook.cgi?ID=C7553562&Mask=A
[chlorine]: https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=2000229L.TXT
[sodium]: https://openstax.org/books/chemistry/pages/18-2-occurrence-and-preparation-of-the-representative-metals
