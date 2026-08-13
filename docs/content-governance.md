# Content governance — v0

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

1. Aktuelle WKO-Befähigungsprüfungsordnung für Struktur, Gegenstände, Zeiten, Kriterien und Lernergebnisse.
2. Aktuelles RIS für Rechtsstatus der Versicherungsvermittlungs-Verordnung 2026 und der Allgemeinen Prüfungsordnung.
3. Sekundärmaterial ausschließlich zur Themenabdeckung oder Didaktik, nie als Rechtsautorität.

Die maschinenlesbaren Einträge liegen in `src/data/sources.json`. Der historische RIS-Eintrag von 2010 ist `superseded`; die neue Verordnung 2026 ist `current`. Ein fehlender Beleg bleibt `pending` / `unknown` / `missing` und wird nicht durch Annahmen ersetzt.

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
- `INSUFFICIENT_EVIDENCE`: eine belastbare Empfehlung ist mit dem aktuellen Aktenstand nicht möglich.

„Confirmed“ innerhalb des Originalfalls bestätigt nur, dass eine Angabe in der fiktiven Akte steht; es ist keine Behauptung über einen realen Kunden.

## Originalität und Grenzen

Fallakte, Aufgaben, Nachfragen, Fehlercodes und Referenzpunkte sind eigens für diesen v0 erstellt. Sie sind keine amtlichen Prüfungsfragen, keine reproduzierten BÖV-Inhalte und keine Musterlösung. Es wurden keine BÖV-Originaltexte, Tabellen, Fragen oder Antworten kopiert.

Die Anwendung trainiert einen Entscheidungsweg: Sachverhalt trennen, Lücken sichtbar machen, Risikokette erklären, Alternativen prüfen, Vertragsgrenzen benennen und einen nächsten Schritt festlegen. Sie gibt keine Rechtsberatung, Vertragsauslegung oder Produktzusage.
