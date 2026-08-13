# Makler Prüfungswerkstatt — v0

Eine lokale, quellensichtbare Lernwerkstatt für die österreichische Befähigungsprüfung der Versicherungsmakler. Der v0 umfasst ausschließlich Modul 1 und Modul 2. Modul 3 / Unternehmerprüfung ist ausdrücklich ausgeschlossen.

## Direkt starten

Voraussetzung: Node.js 20.19 oder neuer. Das v0 hat keine externen Laufzeit- oder Entwicklungsabhängigkeiten.

```powershell
cd D:\Codex\Projects\makler-pruefungswerkstatt
npm.cmd run dev
```

Danach `http://127.0.0.1:5173` öffnen. Eine Installation mit `npm install` ist nicht nötig.

Für den gebauten Stand:

```powershell
npm.cmd run build
npm.cmd run preview
```

Danach `http://127.0.0.1:4173` öffnen.

## Vorschau am Handy im selben WLAN

Die gebaute Vorschau für das lokale Netzwerk auf dem PC starten:

```powershell
npm.cmd run preview:lan
```

Am Handy im selben WLAN anschließend `http://10.93.1.22:4174/` öffnen. Für den ungebauten Arbeitsstand steht entsprechend `npm.cmd run dev:lan` auf Port `5174` zur Verfügung.

`127.0.0.1` bezeichnet immer das Gerät selbst. Auf dem Handy zeigt diese Adresse daher auf das Handy und niemals auf den PC; für den Zugriff vom Handy kann sie nicht funktionieren. Die LAN-IP des PCs kann sich ändern, und eine lokale Firewall kann den Zugriff trotz korrekter Bindung blockieren.

## Enthalten

- acht direkt erreichbare Arbeitsbereiche: Heute, Prüfungsplan, Lernpfad, Fallwerkstatt, Schriftlich, Mündlich, Fehler und Quellen;
- getrennte Gegenstände M1-A, M1-B, M2-A und M2-B — ohne erfundene Gesamtbestehensquote;
- eine vollständig originale Fallakte zur Kaffeerösterei mit Fakten, fehlenden Angaben, Risiken, Regel, Lösung und Ausschlussgründen, `CONTRACT_CHECK_REQUIRED`, Kundenerklärung und nächsten Schritten;
- vier originale schriftliche Aufgaben und vier originale mündliche Nachfragen;
- lokale Arbeitsnotizen, Antworten, Bearbeitungsstand, Fehlerprotokoll und Wiederholungsqueue im Browser;
- Deutsch als Normebene; optional zuschaltbare chinesische Verständnisstützen;
- strukturiertes Quellenregister mit `current`, `superseded` und `pending` sowie `confirmed`, `derived` und `unknown`;
- sichtbare Lade-, Leer-, Fehler- und Disabled-Zustände.

Die gespeicherten Lernstände bleiben ausschließlich im lokalen `localStorage` des verwendeten Browsers. Es werden keine Daten übertragen.

## Fakten- und Inhaltsgrenzen

Faktenautorität für den Stand 2026-08-13 sind die aktuelle WKO-Befähigungsprüfungsordnung und RIS. Das BÖV-Lernmaterial 2025 ist nur als noch nicht belegtes Sekundärmaterial registriert; kein Originaltext, keine Tabelle, keine Originalfrage und keine Antwort wurde übernommen. Landesprüfungstermine und Gebühren bleiben `missing`.

Der interne KB-Preflight ergab `KB_SNAPSHOT_MATCH`, `ROUTE_NO_MATCH`, `BLOCKED_PENDING_EVIDENCE`. Deshalb wurde keine interne Karte geöffnet oder verwendet. Produkt-, Deckungs- und Vertragsfragen bleiben dort, wo Belege fehlen, `CONTRACT_CHECK_REQUIRED` beziehungsweise `unknown`.

Die Anwendung ist keine offizielle Prüfungsplattform und keine Rechts-, Vertrags- oder Produktempfehlung.

## Qualität prüfen

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Die Prüflogik verwendet nur Node-Bordmittel. Hintergrund: Die bevorzugte Vite/React/TypeScript-Installation war in dieser isolierten Umgebung nicht vollständig aus dem lokalen npm-Cache auflösbar. Der v0 wurde deshalb bewusst als dependency-free ES-Module-Anwendung umgesetzt, statt eine unvollständige oder nicht reproduzierbare Installation vorzutäuschen.

## Projektstruktur

- `src/app.js` — Zustandsmodell, Rendering und Interaktionen
- `src/styles.css` — responsives Editorial-Design und Accessibility-Zustände
- `src/data/` — strukturierte Quellen, Prüfungsgegenstände und Originalfall
- `src/utils/progress.js` — lokales Fortschrittsmodell
- `tests/` — deterministische Daten- und Fortschrittstests
- `scripts/` — lokaler Server, Build, Lint und Modulsyntaxprüfung
- `docs/design-decisions.md` — visuelle und funktionale Entscheidungen
- `docs/content-governance.md` — Quellen-, Status- und Scope-Grenzen
- `artifacts/v0/` — v0-Verifikationsartefakte

## Freigabestand

`VERÖFFENTLICHT_AM_2026-08-13`

Der am 13. August 2026 freigegebene Stand ist über GitHub Pages öffentlich erreichbar:

<https://jonaszhong123-gif.github.io/makler-pruefungswerkstatt/>

Technische Prüfungen, visuelle Bestätigung und öffentliche Bereitstellung bleiben getrennte Gates.
