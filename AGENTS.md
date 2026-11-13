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
- Der Canvas unterstützt Maus, Touch und Stift. Ziehen behält den Griffpunkt bei. Das Pixi-Raster zeichnet den sichtbaren Ausschnitt. Geräte und Kabel liegen in Weltkoordinaten. Alt+Ziehen mit der Maus auf freier Fläche zieht einen Auswahlrahmen auf. Entf löscht die Einzel- oder Rahmenselektion. Ziehen auf freier Fläche, die mittlere Maustaste und die Zwei-Finger-Geste verschieben die Ansicht. Mausrad, Zwei-Finger-Geste und Zoomtasten ändern den Maßstab. Kabel werden als Bézierkurven gezeichnet.
- Beide Rollen platzieren Geräte aus der unteren Palette. Der JSON-Datenblock speichert unter `invComponents` ausgeschlossene Gerätetypen und Größenvarianten. Ältere Einträge, die einen ganzen Typ ausschließen, gelten für alle Varianten dieses Typs.
- Das Periodensystem verwendet feste, kompakte Grid-Spalten in seinem Split-Panel und umbrechende Filter. Das Auswahl-Popup behandelt Elektroden ohne Material. Fehler in einem Ticker-Callback können die gesamte Canvas-Schleife unterbrechen.

## Geplante Darstellung von Feststoffen und Flüssigkeiten

- Zuerst Salze und Niederschläge animieren. Bei der Zugabe fallen Körner ins Gefäß. Bei einer Ausfällung entstehen feine Partikel in der Flüssigkeit, sinken ab und bilden einen Bodensatz. Löst Chemlib beim Verdünnen einen Teil des Feststoffs wieder auf, nimmt der sichtbare Bodensatz entsprechend ab.
- Chemlib berechnet die Feststoffmenge. Pixi visualisiert sie mit einer begrenzten Zahl von Partikeln. Die Animation nutzt den vorhandenen Ticker, solange sich Partikel bewegen. Abgesetztes Material bleibt als statische Grafik sichtbar.
- Für Flüssigkeiten die vorhandene Füllfläche weiterverwenden. Beim Gießen einen Strahl und eine kurz schwingende Oberfläche ergänzen. Der aus dem Volumen berechnete Füllstand bleibt an der Geräteskala ablesbar.
