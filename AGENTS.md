# Chemlab

## Projekt

Chemlab ist ein WebWriter-Widget mit einer integrierten TypeScript-Simulation. Das Labor soll über die bisherigen Versuchstypen hinaus für weitere Chemiethemen nutzbar werden. Säure-Base und Elektrochemie sind die aktuellen Schwerpunkte. Fachliche Berechnungen in `chemlib/` bleiben unabhängig von einzelnen Versuchsaufbauten.

## Entwicklung und Test in WebWriter

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
- Elektrolyse nutzt die übertragene Elektronenstoffmenge pro Zeitschritt und die jeweilige Elektronenzahl pro Elektrode. Die Stromkreissuche funktioniert auch von einer Elektrode aus. Die Anzeige der Faraday-Raten ist auf Elektrolyse mit Spannungsquelle beschränkt. Die galvanische Berechnung nutzt einen festen Modellstrom von 0,5 A. Die berechnete Zersetzungsspannung begrenzt die Elektrolyse derzeit nicht.
- Der Canvas unterstützt Maus, Touch und Stift. Langes Drücken öffnet auf Touch und Stift das Kontextmenü. Ziehen behält den Griffpunkt bei. Das Pixi-Raster zeichnet den sichtbaren Ausschnitt. Geräte und Kabel liegen in Weltkoordinaten. Ziehen auf freier Fläche verschiebt die Ansicht, Strg+Mausrad oder die Zoomtasten verändern den Maßstab. Kabel werden als Bézierkurven gezeichnet.
- Das Periodensystem verwendet feste, kompakte Grid-Spalten in seinem Split-Panel und umbrechende Filter. Das Auswahl-Popup behandelt Elektroden ohne Material. Fehler in einem Ticker-Callback können die gesamte Canvas-Schleife unterbrechen.
