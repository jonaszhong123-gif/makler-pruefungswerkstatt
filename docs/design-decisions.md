# Design decisions — Deep-green Prüfungswerkstatt

## Gewählte Richtung

Die bestätigte Richtung verbindet die bestehende Fallakten-Werkstatt mit einer ruhigen, tiefgrünen Prüfungslogik. Die Oberfläche bleibt ein lokales Arbeitsinstrument: redaktionelle Typografie für Orientierung, klare Linien für die Aktenstruktur und wenige erhöhte Papierlagen für echte Hierarchie. Sie ist weder KPI-Dashboard noch Kartenwand.

Die Today-Ansicht hat zwei unterschiedliche Aufgaben. Der heutige Arbeitsauftrag ist die stärkste, direkt ausführbare Ebene. Die Einordnung der Werkstatt und die abstrakte Prüflinie schaffen Kontext, dürfen den nächsten Schritt aber nicht verdecken. Auf Mobilgeräten steht deshalb der Arbeitsauftrag samt Fortsetzen-Aktion vor Positionierungstext und Vier-Fächer-Ledger.

## Designsystem

| Rolle | Wert | Verwendung |
| --- | --- | --- |
| Papier | `#F4F0E7` | Grundfläche und helle Glasebenen |
| Tinte | `#161815` | Text, starke Linien und Desktop-Navigation |
| Tiefgrün | `#214E3B` | primäre Aktion, Fokus, aktive und bestätigte Zustände |
| Sage | `#DDE3D8` | zurückhaltende Arbeits- und Statusflächen |
| Randnotiz | `#667064` | Metadaten und sekundärer Text |
| Falz | `#C9CBBF` | Trennlinien und passive Grenzen |

- Basisabstand: 8 px und nachvollziehbare Vielfache davon.
- Radius: 8 px für Bedienflächen, 12 px für echte Papier- oder Glasebenen.
- Schatten: nur für schwebende beziehungsweise vor der Grundfläche liegende Ebenen wie Arbeitsauftrag, Aktenblatt, Drawer, Tooltip und Toast.
- Transparenz: Papier- und Sage-Flächen verwenden `rgba(...)` plus `backdrop-filter`; es gibt keine Verläufe.
- Bewegung: rund 180 ms mit ruhiger Ease-Kurve. `prefers-reduced-motion: reduce` reduziert Übergänge und Animationen praktisch auf null.
- Typografie: redaktionelle Serifenschrift für Aussagen und Kapitel, nüchterne Sans-Serif-Schrift für Navigation, Status und Bedienung. Operationstitel bleiben kompakter als der Today-Titel.

## Navigation und responsive Hierarchie

- Desktop behält die sticky linke Navigation. Die Fallwerkstatt bleibt bei breiter Desktopfläche dreispaltig: Aktenregister, Arbeitsblatt und Entscheidungstor.
- Bis einschließlich 820 px ersetzt eine 72 px hohe sticky Topbar die alte gestapelte Navigation.
- Der rechte Drawer enthält alle acht Routen. Er besitzt `aria-expanded`, `aria-controls`, `aria-current`, Fokusübergabe, Tab-Begrenzung, Escape-/Backdrop-Schließen, Fokusrückgabe und Body-Scroll-Lock. Während er geöffnet ist, sind Skip-Link, Topbar und App-Fläche per `inert` aus Fokus- und Accessibility-Baum genommen; beim Schließen wird dieser Zustand vor der Fokusrückgabe aufgehoben.
- Direkte Routen wie `#/sources` markieren beim Öffnen des Drawers den aktiven Eintrag und machen ihn innerhalb des Drawer-Scrollcontainers sichtbar. `scrollIntoView` wird nicht verwendet.
- `#/learning-path/<lesson-id>` adressiert den nächsten noch nicht abgeschlossenen Lernschritt. Die Today-Aktion setzt diesen Deep-Link, scrollt mit `window.scrollTo` und fokussiert den konkreten Lernschritt, ohne ihn automatisch als erledigt zu markieren.
- Komponenten dürfen intern horizontal scrollen, etwa Aktenregister oder Aufgabenreiter. Die Dokumentseite selbst darf bei 320, 390, 820 und 1440 px keine horizontale Überbreite erzeugen.

## Bildfunktion

`src/assets/makler-workflow-abstract.png` ist ein lokaler, textfreier kognitiver Anker: Eine dunkelgrüne Prüflinie verbindet mehrere Entscheidungspunkte. Das Bild liegt im Today-Kontext, ist entsättigt und hat explizite intrinsische Maße. Es wird nicht lazy geladen, weil es auf breiten Ansichten Teil des Einstiegs ist. Auf Mobilgeräten wird es ausgeblendet, damit Aufgabe, Aktion, Positionierung und Fach-Ledger Vorrang haben.

## Interaktion und Barrierefreiheit

- Skip-Link, semantische Landmarks und eine 3 px starke `:focus-visible`-Kontur bleiben erhalten.
- Buttons, Filter-Chips, Status-Chips, Sprachhilfe und Selbsteinschätzung haben mindestens 44 × 44 CSS-Pixel.
- Der `derived`-Tooltip erklärt einen tatsächlich vorkommenden Quellenstatus. Er ist über Hover, Fokus, Klick und Touch erreichbar und lässt sich mit Escape schließen.
- Ein `aria-live="polite"`-Toast wird ausschließlich nach erfolgreichem `localStorage.setItem` ausgelöst. Speicherfehler bleiben stattdessen als Alert sichtbar.
- Notiz- und Antwortfelder zeigen denselben realen Speicherstatus: `lokal gespeichert` nur nach bestätigbarem Speicherzustand, andernfalls `Speicherung nicht bestätigt`. Ein später Fehler löscht noch wartende Erfolgs-Toast-Ankündigungen.
- Lange Seiten enthalten eine tastaturbedienbare Nach-oben-Aktion mit `window.scrollTo`; Reduced Motion schaltet dabei auf sofortiges Scrollen.
- Hover, Fokus, Active und Disabled sind unterscheidbar. Disabled-Zustände bleiben echte fachliche Grenzen und werden nicht als verfügbare Aktion inszeniert.

## Inhaltliche und technische Grenzen

- Die vier Gegenstände M1-A, M1-B, M2-A und M2-B bleiben getrennt. Es entsteht keine Gesamtnote, Quote, Prognose oder erfundene Statistik.
- `confirmed`, `derived`, `unknown`, `INSUFFICIENT_EVIDENCE` und `CONTRACT_CHECK_REQUIRED` bleiben sichtbar und werden nicht in Gewissheit umgedeutet.
- Modul 3 / Unternehmerprüfung bleibt ausgeschlossen.
- Daten in `src/data` werden durch die visuelle Überarbeitung nicht verändert.
- Es gibt keine neue Abhängigkeit, keinen Hotlink, keine CSS-Illustration, keinen Commit, Push, Upload oder Deployment.
- Der dependency-free ES-Module-Aufbau bleibt bestehen. Das Build-Skript kopiert die lokale Bilddatei zusammen mit den Laufzeitdateien nach `dist` und prüft das Ziel mit `node:path.relative`, `sep` und `isAbsolute` plattformunabhängig als Unterverzeichnis des Projektroots.
- HTML-Laufzeitressourcen verwenden project-pages-safe relative URLs (`./src/...`). Das Quellenregister wird modulrelativ mit `new URL('./data/sources.json', import.meta.url)` geladen, damit sowohl GitHub-Pages-Projektpfade als auch der gebaute `dist`-Baum korrekt funktionieren.
