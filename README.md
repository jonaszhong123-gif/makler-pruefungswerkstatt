# Makler Prüfungswerkstatt — v1 Modul 1/2

Eine lokale, quellensichtbare Lernwerkstatt mit dem Ziel, auf Modul 1 und Modul 2 der österreichischen Versicherungsmakler-Befähigungsprüfung vorzubereiten. Modul 3 / Unternehmerprüfung ist ausdrücklich ausgeschlossen.

## Start

Voraussetzung: Node.js 20.19 oder neuer. Die Anwendung hat keine externen Laufzeit- oder Entwicklungsabhängigkeiten.

```powershell
cd D:\Codex\Projects\makler-pruefungswerkstatt
npm.cmd run dev
```

Danach `http://127.0.0.1:5173` öffnen. Eine Installation mit `npm install` ist nicht nötig.

Gebauter Stand:

```powershell
npm.cmd run build
npm.cmd run preview
```

Danach `http://127.0.0.1:4173` öffnen.

## Enthalten

- vollständige Coverage Matrix mit 23 Qualifikationsergebnissen und 38 Zuordnungen zu § 6, § 7, § 9 und § 10;
- vier getrennte Gegenstände M1-A, M1-B, M2-A und M2-B mit den geltenden Prüfungsregeln;
- 23 originale, vollständige Lektionen mit `Ich kann`, Entscheidungsrahmen, Ablauf, Fehlern, Mikrofall, Selbstcheck, Quellen, Aussagegrenzen und Abschlussgate;
- 12 schriftliche und 13 mündliche originale Übungen sowie 9 originale, spartenübergreifende Fälle mit jeweils drei verpflichtenden Outputs;
- echte Lernschleife von Heute über Lektion und Selbstcheck zu Prüfungstraining, Fehlerprotokoll, Deep-Link-Wiederholung und bestandenem Abschluss;
- laufende Kundenbetreuung in M1-B/M2-B: Polizzenverwaltung, Schadenaufnahme/-meldung/-bearbeitung/-abwicklung, Maklerklauseln, sensible Daten, Beschwerde gegenüber dem Versicherer sowie Kündigungen durch Kunde und Versicherer einschließlich Bewertung einer bereits erklärten Kundenkündigung;
- Rechtsnavigator für GewO, MaklerG, VersVG, VAG 2016, Standesrecht, ABGB, UGB, KSchG, DSG/DSGVO, UWG, ECG und TKG 2021 sowie Sparten-Navigation Sach/Personen/Vermögen;
- lokaler Fortschritt in `localStorage` mit validiertem JSON-Export/-Import, ohne Konto, Server oder automatischen Upload.

Die Übungen sind eigenständig erstellt. Sie sind keine offiziellen Prüfungsfragen, keine reproduzierten BÖV-Inhalte und keine Erfolgsprognose.

## Fakten- und Inhaltsgrenzen

Faktenautorität für den am 13.08.2026 verifizierten Stand sind ausschließlich die WKO-Befähigungsprüfungsordnung und RIS. Konsolidierte Rechtslinks müssen vor einer konkreten Anwendung auf Tagesstand und einschlägige Fassung geprüft werden (`CURRENT_AUTHORITY_REQUIRED`). Produkt-, Deckungs- und Vertragsfragen bleiben ohne konkreten Originalvertrag `CONTRACT_CHECK_REQUIRED`; unbelegte Angaben bleiben `unknown` oder `missing`.

Der interne KB-Preflight ergab:

```text
KB_SNAPSHOT_MATCH
ROUTE_NO_MATCH
primary_card: null
supporting_cards: []
content_status: BLOCKED_PENDING_EVIDENCE
source_text_returned: false
```

Daher wurde kein interner Originaltext verwendet. Es wurden keine privaten BÖV-Lehrmittel, Tabellen, Originalfragen oder Antworten hochgeladen, kopiert oder veröffentlicht.

Die Anwendung ist keine offizielle Prüfungsplattform und keine Rechts-, Vertrags- oder Produktempfehlung.

## Qualität prüfen

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run qa:browser
```

`qa:browser` prüft den gebauten `dist`-Stand mit einem temporären, isolierten Headless-Chrome-/Edge-Profil bei 320, 390, 820 und 1440 px. Der Lauf benötigt keine Browserbibliothek und entfernt seinen eigenen Server, Browserprozess und Profilordner wieder.

## Projektstruktur

- `src/app.js` — Browserzustand, Persistenz und Interaktionen
- `src/views/templates.js` — datengesteuerte Ansichten
- `src/data/curriculum.js` — 23 Ergebnisse, 38 Slots, Regeln, Rechts- und Sparten-Navigation
- `src/data/practice.js` — originale schriftliche, mündliche und Fallübungen
- `src/data/sources.json` — auditiertes Quellenregister
- `src/utils/` — Fortschritt, Router und Workflow-Gates
- `tests/` — Daten-, Mapping-, Workflow-, Migrations- und UI-Vertragstests
- `scripts/` — lokaler Server, Build, Lint und Modulsyntaxprüfung

## Veröffentlichungsgrenze

Dieser v1-Arbeitsstand ist nur lokal implementiert und geprüft. Er wurde in diesem Auftrag weder committed noch gepusht noch veröffentlicht. Eine möglicherweise noch erreichbare GitHub-Pages-Seite repräsentiert bis zu einer getrennten Veröffentlichung weiterhin einen älteren Stand.
