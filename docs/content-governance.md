# Content governance — v1 Modul 1/2

Stand: 2026-08-13

## Scope

- `INCLUDED`: Versicherungsmakler Modul 1 und Modul 2
- `EXCLUDED`: Modul 3 / Unternehmerprüfung
- `missing`: künftige bundeslandspezifische Prüfungstermine und Gebühren

Die UI führt die vier Prüfungsgegenstände separat:

- M1-A — Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement, schriftlich
- M1-B — Laufende Kundenbetreuung, schriftlich
- M2-A — Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement, mündlich
- M2-B — Laufende Kundenbetreuung, mündlich

## Quellenhierarchie

1. Aktuelle WKO-Befähigungsprüfungsordnung und ihre RIS-Spiegelung für Struktur, Gegenstände, Zeiten, Kriterien, Regeln und 23 Qualifikationsergebnisse.
2. Aktuelles RIS für Allgemeine Prüfungsordnung sowie GewO, MaklerG, VersVG, VAG 2016, Standesrecht, ABGB, UGB, KSchG, DSG/DSGVO, UWG, ECG und TKG 2021.
3. Sekundärmaterial ausschließlich zur hochstufigen Themenabdeckung oder Didaktik, nie als Rechtsautorität oder kopierbare Inhaltsquelle.

Die maschinenlesbaren Einträge liegen in `src/data/sources.json`. Ein fehlender Beleg bleibt `pending` / `unknown` / `missing` und wird nicht durch Annahmen ersetzt. Konsolidierte RIS-Einstiege sind keine pauschale Aussage, dass jede Norm unverändert gilt; konkrete Fassung, Stichtag und Fallbezug bleiben `CURRENT_AUTHORITY_REQUIRED`.

## Interner KB-Preflight

```text
KB_SNAPSHOT_MATCH
ROUTE_NO_MATCH
primary_card: null
supporting_cards: []
content_status: BLOCKED_PENDING_EVIDENCE
source_text_returned: false
```

Konsequenz: keine interne Karte geöffnet, ausgewählt, paraphrasiert oder als Grundlage verwendet. Der Preflight ist in der Quellenansicht sichtbar, ohne ihn als Inhaltsfreigabe umzudeuten.

## Inhaltsstatus

- `confirmed`: durch die registrierte amtliche Quelle bestätigt oder im ausdrücklich fiktiven Fall als Aktenangabe vorgegeben;
- `derived`: didaktische Ableitung oder fachlicher Prüfschritt, der als Ableitung sichtbar bleibt;
- `unknown`: nicht belegt oder im Fall noch zu erheben;
- `CONTRACT_CHECK_REQUIRED`: nur anhand konkreter Originalbedingungen entscheidbar;
- `CURRENT_AUTHORITY_REQUIRED`: aktuelle Rechtslage, Behördenpraxis oder Fassung ist vor der konkreten Aussage amtlich zu prüfen;
- `INSUFFICIENT_EVIDENCE`: eine belastbare Empfehlung ist mit dem aktuellen Aktenstand nicht möglich.

„Confirmed“ innerhalb des Originalfalls bestätigt nur, dass eine Angabe in der fiktiven Akte steht; es ist keine Behauptung über einen realen Kunden.

## Originalität und Grenzen

Alle 23 Lektionen, neun Fallakten, Aufgaben, Nachfragen, Fehlercodes und Referenzpunkte sind eigens für diese Anwendung erstellt. Sie sind keine amtlichen Prüfungsfragen, keine reproduzierten BÖV-Inhalte und keine Musterlösung. Es wurden keine privaten BÖV-Originaltexte, Tabellen, Fragen oder Antworten kopiert, hochgeladen oder veröffentlicht.

Die Anwendung trainiert einen Entscheidungsweg: Sachverhalt trennen, Lücken sichtbar machen, Risikokette erklären, Alternativen prüfen, Vertragsgrenzen benennen und einen nächsten Schritt festlegen. Sie gibt keine Rechtsberatung, Vertragsauslegung oder Produktzusage.
