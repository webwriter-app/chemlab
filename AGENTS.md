# Chemlab

## Projekt

Chemlab ist ein WebWriter-Widget mit einer integrierten TypeScript-Simulation. Das Labor soll über die bisherigen Versuchstypen hinaus für weitere Chemiethemen nutzbar werden. Säure-Base und Elektrochemie sind die aktuellen Schwerpunkte. Fachliche Berechnungen in `chemlib/` bleiben unabhängig von einzelnen Versuchsaufbauten.

## Entwicklung und Test in WebWriter

Lege nach Abschluss und Prüfung jedes Arbeitspakets automatisch einen Git-Commit für die zugehörigen Änderungen an. Pushe den Commit, wenn der Nutzer darum bittet.

Im Repository-Stamm ausführen.

```sh
npm ci
npx @webwriter/build dev
```

Der WebWriter-Build schreibt nach `dist/widgets/` und überwacht Änderungen. Der Nutzer importiert das Widget manuell in WebWriter. Dort werden Layout und Interaktionen im tatsächlichen Einbettungskontext geprüft. Vorlagen liegen unter `snippets/` für Titration und Batterie. Die frühere Vite-Testseite ist ein historisches Hilfsmittel.

Der Widget-Build verarbeitet den TypeScript-Quellcode in `chemlib/` direkt. `kekule` ist eine Abhängigkeit im zentralen `package.json`. Änderungen an der Simulation laufen durch denselben Build wie Änderungen am Widget.

Für die statische Prüfung im Repository-Stamm `npx tsc --noEmit` ausführen. Bei Layoutfehlern das Panel über die normale Bedienung öffnen und Breiten, Überläufe und Grid-Spalten im Originalcontainer prüfen. Erzwungene CSS-Größen im Browser können den Fehler verdecken.

## Orientierung im Code

- `controllers/` enthält die Lit-Controller für Pixi-Canvas, Chart.js und Simulationsschleife. `data/` enthält Wörterbuch, pH-Farben und Standardaufbauten. `services/xapi.ts` kapselt das optionale Reporting.
- Die Widgetklasse hält weiterhin den Zustand, die Versuchsansteuerung, die Objekt- und Moleküleditoren und die Serialisierung der Aufbauten in JSON-Datenblöcken. Ältere Aufbauten aus HTML-Attributen werden eingelesen. Die laufende Modularisierung hat diese Verantwortlichkeiten bewusst in der Widgetklasse belassen.
- `chemlib/StructureManager.ts` enthält Stoffdaten und Strukturverwaltung, `ComponentManager.ts` die Geräte- und Stromkreiserkennung, `Simulation.ts` die chemischen Abläufe und `AcidBase.ts` den wiederverwendbaren pH-Löser.

## Übernommener Entwicklungsstand

- Der pH-Löser verwendet Ladungsbilanz und Bisektion. `Simulation.getpH` fasst Protonierungsstufen zu Stofffamilien zusammen, berücksichtigt mehrprotonige Säuren, molekulare Basen und hinterlegte konjugierte Anionen. Die Abdeckung hängt von den Stoffdaten ab. Die alten Notizen nennen unter anderem Hydrogencarbonat, Hydrogensulfid und Ammoniumsalze als offene Fälle.
- Die Elektrochemie berechnet die übertragene Elektronenstoffmenge pro Zeitschritt und berücksichtigt die Elektronenzahl je Halbreaktion. Die Stromkreissuche funktioniert auch von einer Elektrode aus. Bei Elektrolyse muss die Quellspannung die berechnete Zersetzungsspannung mindestens erreichen. Die Anzeige der Faraday-Raten ist auf Elektrolyse mit Spannungsquelle beschränkt. Das Voltmeter nutzt für galvanische Zellen einen Modellstrom von 2 A. Das Amperemeter hat eine Modellspannung von 10 V. Eine Strommessung ist noch offen.
- Der Canvas unterstützt Maus, Touch und Stift. Ziehen behält den Griffpunkt bei. Das Pixi-Raster zeichnet den sichtbaren Ausschnitt. Geräte und Kabel liegen in Weltkoordinaten. Alt+Ziehen mit der Maus auf freier Fläche zieht einen Auswahlrahmen auf. Entf löscht die Einzel- oder Rahmenselektion. Ziehen auf freier Fläche, die mittlere Maustaste und die Zwei-Finger-Geste verschieben die Ansicht. Mausrad, Zwei-Finger-Geste und Zoomtasten ändern den Maßstab. Kabel sind nicht auswählbar und werden als Verlet-Seil animiert: Sie beginnen mit der aktuellen Distanz der verbundenen Geräte, bleiben beim Zusammenrücken entspannt, verlängern sich beim Auseinanderziehen mit Spielraum, damit die Geräte frei beweglich bleiben, und erhalten beim Ablegen eine neue Länge. Ein Keep-alive-Task hält den Canvas-Refresh so lange am Laufen, bis alle Seile eingeschlafen sind. Elektroden wandern mit dem verbundenen Gefäß mit und liegen hinter dessen Inhalt.
- Beide Rollen platzieren Geräte aus der unteren Palette. Der JSON-Datenblock speichert unter `invComponents` ausgeschlossene Gerätetypen und Größenvarianten. Ältere Einträge, die einen ganzen Typ ausschließen, gelten für alle Varianten dieses Typs. Der Chemikalien-Reiter steht ebenfalls beiden Rollen offen: Unter `chemicalPermissions` führt der Datenblock je Chemikalie eine Sperre oder eine Liste freigegebener Konzentrationen; Lernende sehen je Konzentration eine eigene feste Kachel (Säuren, Basen und Lösungen zählen also 0.1 und 1 mol/L separat). Die Kategorie-Badges zeigen die Anzahl freigegebener Chemikalien, Doppelklick schaltet eine ganze Kategorie um.
- Feststoffe und Flüssigkeiten werden im Gefäß animiert. Bei der Dosis fester Stoffe fallen Körner vom Mund ins Gefäß. Bei einer Ausfällung entstehen feine Partikel in der Flüssigkeit, sinken ab und vergrößern den Bodensatz; löst Chemlib beim Verdünnen Feststoff wieder auf, läuft der gezeichnete Bodensatz auf den neuen Wert zurück. `VesselView` visualisiert die von Chemlib berechnete Feststoffmenge mit einer begrenzten Partikelzahl und nutzt dafür den Keep-alive-Task des SimulationControllers, solange Partikel oder Ease-Animationen laufen. Abgesetztes Material bleibt als statische Grafik sichtbar. Beim Gießen ergänzt ein Strahl mit kurz schwingender Oberfläche die vorhandene Füllfläche; der aus dem Volumen berechnete Füllstand bleibt an der Geräteskala ablesbar. Beim Dokument-Restore werden keine Partikel-Effekte abgespielt. Wasserunmischbare unpolare Flüssigkeiten trennen sich als zweite Phase: `Mixture.liquidPhases` teilt über `chemlib/liquidPhases.ts` nach Dichten, die VesselView stapelt die Bänder mit der leichteren Phase oben. Dosierungen fester Salze buchen ihr Schüttvolumen über `addedVolume`; `Simulation` gibt es beim Auflösen wieder frei (Tabelle `solidDensity` in `saltSolubility`) und rechnet es beim Ausfällen zurück, damit Füllstand, Fassungsvermögen und Phasengrenzen dem gelösten bzw. abgesetzten Anteil folgen.
- Das Periodensystem verwendet feste, kompakte Grid-Spalten in seinem Split-Panel und umbrechende Filter. Das Auswahl-Popup behandelt Elektroden ohne Material. Fehler in einem Ticker-Callback können die gesamte Canvas-Schleife unterbrechen.
