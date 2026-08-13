const WKO_SOURCE_ID = 'wko-bpo-2024'

export const examSubjects = [
  {
    id: 'M1-A', module: 'Modul 1', mode: 'schriftlich', paragraph: '§ 6',
    title: 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement schriftlich',
    duration: { plannedMinutes: 120, maximumMinutes: 150, label: '120 Min. vorgesehen · Ende nach 150 Min.' },
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit'], sourceId: WKO_SOURCE_ID, officialStatus: 'confirmed',
  },
  {
    id: 'M1-B', module: 'Modul 1', mode: 'schriftlich', paragraph: '§ 7',
    title: 'Laufende Kundenbetreuung schriftlich',
    duration: { plannedMinutes: 120, maximumMinutes: 150, label: '120 Min. vorgesehen · Ende nach 150 Min.' },
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit'], sourceId: WKO_SOURCE_ID, officialStatus: 'confirmed',
  },
  {
    id: 'M2-A', module: 'Modul 2', mode: 'mündlich', paragraph: '§ 9',
    title: 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement mündlich',
    duration: { minimumMinutes: 30, maximumMinutes: 40, label: 'mind. 30 Min. · Ende nach 40 Min.' },
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit', 'schlüssige Argumentation'], sourceId: WKO_SOURCE_ID, officialStatus: 'confirmed',
  },
  {
    id: 'M2-B', module: 'Modul 2', mode: 'mündlich', paragraph: '§ 10',
    title: 'Laufende Kundenbetreuung mündlich',
    duration: { minimumMinutes: 30, maximumMinutes: 40, label: 'mind. 30 Min. · Ende nach 40 Min.' },
    criteria: ['fachliche Richtigkeit', 'Praxistauglichkeit', 'schlüssige Argumentation'], sourceId: WKO_SOURCE_ID, officialStatus: 'confirmed',
  },
]

const slotPlan = {
  'M1-A': ['LO-03', 'LO-04', 'LO-05', 'LO-06', 'LO-07', 'LO-08', 'LO-09', 'LO-22'],
  'M1-B': ['LO-10', 'LO-11', 'LO-12', 'LO-13', 'LO-15', 'LO-16', 'LO-17', 'LO-18'],
  'M2-A': ['LO-01', 'LO-02', 'LO-03', 'LO-04', 'LO-05', 'LO-06', 'LO-07', 'LO-08', 'LO-09', 'LO-19', 'LO-20', 'LO-21', 'LO-22', 'LO-23'],
  'M2-B': ['LO-10', 'LO-11', 'LO-12', 'LO-13', 'LO-14', 'LO-16', 'LO-17', 'LO-18'],
}

const subjectParagraphs = { 'M1-A': '§ 6', 'M1-B': '§ 7', 'M2-A': '§ 9', 'M2-B': '§ 10' }
const subjectSlotPrefixes = { 'M1-A': 'S6', 'M1-B': 'S7', 'M2-A': 'S9', 'M2-B': 'S10' }

export const outcomeSlots = Object.entries(slotPlan).flatMap(([subjectId, outcomeIds]) =>
  outcomeIds.map((outcomeId, index) => ({
    id: `${subjectSlotPrefixes[subjectId]}-${String(index + 1).padStart(2, '0')}`,
    paragraph: subjectParagraphs[subjectId],
    subjectId,
    ordinal: index + 1,
    outcomeId,
    sourceId: WKO_SOURCE_ID,
    sourceLocator: `${subjectParagraphs[subjectId]} Abs. 1 Z ${index + 1}`,
  })),
)

const areas = {
  grundlagen: 'Geschäftsgrundlagen',
  anbahnung: 'Vertragsanbahnung',
  betreuung: 'Laufende Kundenbetreuung',
  qualitaet: 'Qualitätssicherung und -entwicklung',
}

const outcomeDefinitions = [
  ['LO-01', areas.grundlagen, 'selbstständig ein Gewerbe als Versicherungsmakler anzumelden', {
    ichKann: 'Ich kann den Weg von der beabsichtigten Tätigkeit bis zur dokumentierten Gewerbeanmeldung strukturieren und offene Voraussetzungen sichtbar lassen.',
    decisionFramework: { title: 'Anmeldung in drei Prüffeldern', points: ['Tätigkeitsbild und angestrebten Berechtigungsumfang eindeutig beschreiben.', 'Persönliche und fachliche Voraussetzungen anhand aktueller Behördeninformationen prüfen.', 'Zuständige Stelle, erforderliche Nachweise und dokumentierten Abschluss der Anmeldung nachvollziehbar festhalten.'] },
    workflow: ['Tätigkeit und Rolle abgrenzen.', 'Aktuelle Zugangsvoraussetzungen bei der zuständigen Behörde erheben.', 'Nachweise geordnet zusammenstellen.', 'Anmeldung einbringen und behördlichen Status dokumentieren.', 'Abweichungen oder Nachforderungen als offen kennzeichnen.'],
    commonErrors: ['Eine geplante Anmeldung mit einer wirksamen Berechtigung gleichsetzen.', 'Veraltete Zugangsvoraussetzungen ungeprüft übernehmen.', 'Berechtigungsumfang und gewählte Rechtsform vermischen.'],
    microCase: { title: 'Start mit offenem Befähigungsnachweis', situation: 'Eine Gründerin möchte als Versicherungsmaklerin starten; ein Nachweis ist noch nicht abschließend beurteilt.', task: 'Ordnen Sie sichere Schritte und offene Behördenfragen.', walkthrough: ['Tätigkeitsziel und gewünschter Umfang werden schriftlich festgehalten.', 'Die aktuelle Rechtslage und Zuständigkeit werden amtlich geprüft.', 'Der ungeklärte Nachweis bleibt CURRENT_AUTHORITY_REQUIRED; Tätigkeit wird nicht vorweg als zulässig bezeichnet.'] },
    selfCheck: { question: 'Wann ist der Lernfall fachlich sauber abgeschlossen?', options: ['Sobald das Formular ausgefüllt ist.', 'Wenn Voraussetzungen, Einbringung und behördlicher Status getrennt belegt sind.', 'Wenn erste Kundentermine geplant sind.'], correctIndex: 1, explanation: 'Ein Formular allein beweist weder Berechtigung noch wirksamen Abschluss.' },
    laws: ['GewO 1994', 'Versicherungsvermittlungs-Verordnung'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-02', areas.grundlagen, 'seinen/ihren Berechtigungsumfang in Abgrenzung zu anderen Berufsgruppen mit Versicherungsbezug (zB Versicherungsagenten, gewerbliche Vermögensberater) einzuhalten', {
    ichKann: 'Ich kann eine konkrete Tätigkeit dem eigenen Berechtigungsumfang zuordnen, Überschneidungen erkennen und bei Unklarheit vor dem Handeln eine aktuelle Rechtsprüfung auslösen.',
    decisionFramework: { title: 'Rolle vor Handlung', points: ['Wer wird vertreten und in wessen Interesse wird gehandelt?', 'Welche konkrete Beratung, Vermittlung oder Nebenleistung soll erbracht werden?', 'Ist diese Handlung vom nachgewiesenen Berechtigungsumfang gedeckt oder ist eine Abgrenzung erforderlich?'] },
    workflow: ['Konkrete Handlung statt bloßer Berufsbezeichnung erfassen.', 'Vertretungs- und Interessenlage klären.', 'Eigenen Gewerbewortlaut und Umfang prüfen.', 'Nachbarberufe anhand aktueller Normen abgrenzen.', 'Unklare Fälle stoppen, dokumentieren und qualifiziert klären.'],
    commonErrors: ['Berufsbezeichnungen als austauschbar behandeln.', 'Aus Kundenerwartung eine eigene Befugnis ableiten.', 'Nebenleistungen ohne Prüfung als automatisch umfasst ansehen.'],
    microCase: { title: 'Anfrage jenseits des klaren Auftrags', situation: 'Ein Kunde verlangt zusätzlich eine Tätigkeit, die auch einem anderen reglementierten Gewerbe zugeordnet sein könnte.', task: 'Entscheiden Sie über den nächsten Schritt.', walkthrough: ['Die verlangte Einzelhandlung wird präzise beschrieben.', 'Berechtigungsumfang und Interessenrolle werden getrennt geprüft.', 'Bis zur aktuellen Klärung erfolgt keine Leistung; die Grenze wird verständlich erklärt.'] },
    selfCheck: { question: 'Welche Frage steht am Anfang?', options: ['Welches Produkt bringt den höchsten Umsatz?', 'Welche konkrete Handlung soll in welcher Rolle erbracht werden?', 'Wie nennt der Kunde die Tätigkeit?'], correctIndex: 1, explanation: 'Die rechtliche Einordnung knüpft an die konkrete Tätigkeit und Rolle an.' },
    laws: ['GewO 1994', 'MaklerG', 'Standesrecht'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-03', areas.grundlagen, 'Geschäftsunterlagen für seine/ihre Tätigkeit als Versicherungsmakler/Versicherungsmaklerin zu erarbeiten', {
    ichKann: 'Ich kann Geschäftsunterlagen zweckbezogen entwerfen, Pflichtangaben, Version und Freigabe dokumentieren und ungesicherte Rechtsinhalte von bestätigten Texten trennen.',
    decisionFramework: { title: 'Dokument mit Beweisfunktion', points: ['Welchen Geschäftsschritt und welche Zielgruppe soll das Dokument unterstützen?', 'Welche gesetzlichen, standesrechtlichen und datenschutzbezogenen Angaben sind aktuell erforderlich?', 'Wie werden Version, Verwendung, Einwilligungen und Übergabe später nachgewiesen?'] },
    workflow: ['Zweck und Nutzerkreis festlegen.', 'Pflichtfelder aus aktuellen Quellen ableiten.', 'Klare Sprache und Platz für offene Angaben gestalten.', 'Rechts- und Datenschutzprüfung veranlassen.', 'Version freigeben, verteilen und Änderungshistorie führen.'],
    commonErrors: ['Werbetext und rechtsverbindliche Information vermischen.', 'Alte Vorlagen ohne Versionsprüfung kopieren.', 'Leere Pflichtfelder im Einsatz stillschweigend mit Annahmen füllen.'],
    microCase: { title: 'Neue Erstkontakt-Unterlage', situation: 'Eine alte Vorlage soll für digitale Erstgespräche verwendet werden.', task: 'Entwickeln Sie einen sicheren Aktualisierungspfad.', walkthrough: ['Zweck, Kanal und Empfänger werden bestimmt.', 'Pflichtinformationen und Datenschutztexte werden aktuell geprüft.', 'Erst die freigegebene Version erhält Kennzeichen, Gültigkeitsstand und Ablageort.'] },
    selfCheck: { question: 'Was macht eine Vorlage auditierbar?', options: ['Viele grafische Elemente.', 'Version, Quelle, Freigabe und Verwendungszweck.', 'Ein möglichst langer Haftungsausschluss.'], correctIndex: 1, explanation: 'Auditierbarkeit verlangt nachvollziehbare Herkunft und kontrollierte Verwendung.' },
    laws: ['GewO 1994', 'MaklerG', 'DSGVO/DSG', 'ECG', 'TKG 2021', 'UWG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-04', areas.anbahnung, 'den Umfang seiner/ihrer Maklertätigkeit mit dem Kunden zu vereinbaren', {
    ichKann: 'Ich kann Auftrag, Ziel, Rollen, Mitwirkung und ausdrücklich nicht übernommene Tätigkeiten vor Beginn verständlich vereinbaren.',
    decisionFramework: { title: 'Auftragsrahmen vor Beratung', points: ['Was soll geprüft, vermittelt oder laufend betreut werden?', 'Welche Unterlagen und Mitwirkungen werden vom Kunden benötigt?', 'Welche Grenzen, Ausschlüsse und späteren Änderungen müssen ausdrücklich dokumentiert werden?'] },
    workflow: ['Kundenanliegen in eigenen Worten spiegeln.', 'Leistungsumfang und Rollen konkretisieren.', 'Benötigte Mitwirkung und Informationslücken benennen.', 'Grenzen und nicht übernommene Aufgaben festhalten.', 'Vereinbarung bestätigen und Änderungen nachführen.'],
    commonErrors: ['Ein allgemeines Beratungsgespräch als unbegrenzten Auftrag behandeln.', 'Laufende Betreuung ungefragt unterstellen.', 'Mündliche Erweiterungen nicht nachdokumentieren.'],
    microCase: { title: 'Ein Vertrag oder Gesamtbestand?', situation: 'Ein Kunde fragt wegen eines einzelnen Vertrags, erwähnt aber weitere Polizzen.', task: 'Formulieren Sie den zu klärenden Umfang.', walkthrough: ['Der konkrete Anlass wird vom möglichen Gesamtcheck getrennt.', 'Beide Varianten werden mit erforderlichen Unterlagen und Grenzen erklärt.', 'Nur der bestätigte Umfang wird bearbeitet; Erweiterungen werden neu vereinbart.'] },
    selfCheck: { question: 'Was ist bei einem unklaren Auftragsumfang richtig?', options: ['Möglichst umfassend tätig werden.', 'Umfang vor weiterer Sacharbeit klären und dokumentieren.', 'Nur intern eine Annahme notieren.'], correctIndex: 1, explanation: 'Der vereinbarte Umfang steuert Pflichten, Prüfung und Dokumentation.' },
    laws: ['MaklerG', 'ABGB', 'GewO 1994', 'Standesrecht'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-05', areas.anbahnung, 'relevante Informationen eines Privatkunden zu erheben', {
    ichKann: 'Ich kann bei Privatkunden bedarfsrelevante Fakten, Ziele, bestehende Vorsorge und fehlende Angaben verhältnismäßig erheben, ohne Lücken als Tatsachen auszugeben.',
    decisionFramework: { title: 'Privater Bedarf ohne Vorwegnahme', points: ['Welche Personen, Lebensbereiche und finanziellen Folgen sind für den Auftrag relevant?', 'Welche bestehenden Verträge, Eigenvorsorge und Prioritäten sind belegt?', 'Welche sensiblen Angaben sind notwendig, zulässig und noch offen?'] },
    workflow: ['Auftrag und Anlass bestätigen.', 'Haushalt, Verpflichtungen, Ziele und Risikotoleranz strukturiert erfragen.', 'Bestehende Unterlagen und Vorsorge erfassen.', 'Widersprüche und missing kennzeichnen.', 'Erhebung mit dem Kunden zusammenfassen und nächste Belege vereinbaren.'],
    commonErrors: ['Vermutungen aus Beruf oder Familienstand ableiten.', 'Jede verfügbare Information ohne Zweckbindung sammeln.', 'Fehlende Polizzenwerte mit Erinnerungsangaben ersetzen.'],
    microCase: { title: 'Familienänderung mit lückenhaften Unterlagen', situation: 'Nach einer Lebensveränderung möchte ein Kunde prüfen lassen, ob seine Absicherung noch passt; mehrere Verträge fehlen.', task: 'Planen Sie die Erhebung.', walkthrough: ['Anlass, Personen und wirtschaftliche Abhängigkeiten werden erhoben.', 'Vorhandene Aussagen werden als Kundenangabe, nicht als Vertragsinhalt, markiert.', 'Für konkrete Deckungsaussagen werden Originalunterlagen nachgefordert.'] },
    selfCheck: { question: 'Wie wird eine Erinnerung des Kunden an eine Deckung behandelt?', options: ['Als bestätigter Vertragsinhalt.', 'Als Kundenangabe mit CONTRACT_CHECK_REQUIRED.', 'Als unwichtige Information.'], correctIndex: 1, explanation: 'Erinnerungen können den Prüfpfad lenken, ersetzen aber keine Vertragsprüfung.' },
    laws: ['MaklerG', 'GewO 1994', 'DSGVO/DSG', 'KSchG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-06', areas.anbahnung, 'relevante Informationen eines Gewerbekunden bzw. Freiberuflers/einer Freiberuflerin zu erheben', {
    ichKann: 'Ich kann Geschäftsmodell, Wertschöpfung, Abhängigkeiten, Haftungsschnittstellen und vorhandene Vorsorge eines Betriebs evidenzorientiert erfassen.',
    decisionFramework: { title: 'Betrieb als Wirkungskette', points: ['Welche Leistungen, Standorte, Personen und Anlagen tragen die Wertschöpfung?', 'Welche Ausfälle oder Ansprüche lösen welche betrieblichen Folgen aus?', 'Welche Verträge, Reserven und organisatorischen Maßnahmen bestehen tatsächlich?'] },
    workflow: ['Auftrag, Betrieb und Rechtsform erfassen.', 'Wertschöpfungsprozess und kritische Abhängigkeiten skizzieren.', 'Sach-, Personen-, Haftungs- und Ertragsfolgen erheben.', 'Bestehende Maßnahmen und Verträge belegen.', 'Offene Werte, Schnittstellen und Veränderungen priorisieren.'],
    commonErrors: ['Branchenannahmen statt konkreter Betriebsdaten verwenden.', 'Umsatz, Wiederbeschaffungswert und Ertragsausfall verwechseln.', 'Subunternehmer- oder Lieferkettenrisiken automatisch dem Kunden zurechnen.'],
    microCase: { title: 'Kleiner Betrieb mit zentraler Maschine', situation: 'Ein Betrieb ist von einer Maschine abhängig; Ausweichmöglichkeiten und aktuelle Werte sind unbekannt.', task: 'Erstellen Sie den Erhebungspfad.', walkthrough: ['Prozess und Rolle der Maschine werden konkret beschrieben.', 'Ausweichbetrieb, Reparaturzugang und wirtschaftliche Folgen werden offen erfragt.', 'Werte und bestehende Deckung bleiben bis zu Belegen missing beziehungsweise CONTRACT_CHECK_REQUIRED.'] },
    selfCheck: { question: 'Welche Aussage ist methodisch korrekt?', options: ['Eine zentrale Maschine führt immer zum gleichen Produkt.', 'Die Abhängigkeit wird zuerst als Ereignis-Folgen-Kette erhoben.', 'Der Branchenname genügt für die Risikoanalyse.'], correctIndex: 1, explanation: 'Der individuelle Wirkungsmechanismus geht einer Lösung voraus.' },
    laws: ['UGB', 'ABGB', 'GewO 1994', 'MaklerG', 'DSGVO/DSG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-07', areas.anbahnung, 'eine Risikoanalyse durchzuführen', {
    ichKann: 'Ich kann Risiken als nachvollziehbare Ursache-Wirkungs-Ketten analysieren, vorhandene Maßnahmen berücksichtigen und Unsicherheit ausdrücklich bewerten.',
    decisionFramework: { title: 'Ereignis – Wirkung – Tragfähigkeit', points: ['Welches konkrete Ereignis kann eintreten und wodurch?', 'Welche unmittelbaren Maßnahmen und Folgewirkungen entstehen?', 'Was kann vermieden, vermindert, selbst getragen, vertraglich übertragen oder versichert werden?'] },
    workflow: ['Ziele und schützenswerte Funktionen festlegen.', 'Ereignisse und Ursachen sammeln.', 'Maßnahmen, Folgen und Abhängigkeiten verknüpfen.', 'Bestehende Kontrollen und Eigenvorsorge prüfen.', 'Prioritäten mit Begründung und Unsicherheiten dokumentieren.'],
    commonErrors: ['Nur Produktsparten auflisten.', 'Wahrscheinlichkeit oder Schadenhöhe ohne Daten erfinden.', 'Bestehende Prävention und Selbsttragung ignorieren.'],
    microCase: { title: 'Ausfall ohne bekannte Dauer', situation: 'Ein digitales Bestellsystem könnte ausfallen; Wiederanlaufzeit und Ersatzprozess sind nicht dokumentiert.', task: 'Formulieren Sie eine belastbare Risikoanalyse.', walkthrough: ['Ausfallereignis und betroffene Geschäftsprozesse werden getrennt erfasst.', 'Mögliche Folgen werden als Szenarien, nicht als sichere Schäden, beschrieben.', 'Wiederanlauf, Backup und Vertragslage werden als offene Prüfpunkte priorisiert.'] },
    selfCheck: { question: 'Was unterscheidet Risikoanalyse von Produktliste?', options: ['Sie beginnt mit Ursache, Wirkung und vorhandenen Maßnahmen.', 'Sie enthält mehr Produktnamen.', 'Sie vermeidet jede Unsicherheit.'], correctIndex: 0, explanation: 'Eine Analyse erklärt den Mechanismus und lässt Informationslücken sichtbar.' },
    laws: ['MaklerG', 'GewO 1994', 'Standesrecht'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-08', areas.anbahnung, 'ein Deckungskonzept für Kunden zu entwickeln', {
    ichKann: 'Ich kann aus Auftrag und Risikoanalyse ein begründetes Konzept entwickeln, das Ziele, Prioritäten, Eigenmaßnahmen, Transferoptionen und Vertragsprüfpunkte trennt.',
    decisionFramework: { title: 'Konzept vor Produktentscheidung', points: ['Welche Folgen sollen in welcher Priorität beherrscht werden?', 'Welche Prävention, Reserve, vertragliche Übertragung oder Versicherung kommt in Betracht?', 'Welche Leistungsgrenzen, Ausschlüsse, Summen und Obliegenheiten müssen anhand konkreter Angebote geprüft werden?'] },
    workflow: ['Bestätigte Risiken und Prioritäten übernehmen.', 'Nichtversicherungsmaßnahmen einordnen.', 'Gewünschte Deckungsfunktionen abstrakt beschreiben.', 'Angebote anhand gleicher Kriterien vergleichen.', 'Abweichungen, Lücken und Entscheidung des Kunden dokumentieren.'],
    commonErrors: ['Konzept mit einem bestimmten Tarif gleichsetzen.', 'Versicherbarkeit oder Leistung ohne Angebot bestätigen.', 'Selbstbehalte und Ausschlüsse ohne Kundenwirkung vergleichen.'],
    microCase: { title: 'Zwei Angebote, verschiedene Grenzen', situation: 'Zwei Angebote adressieren dasselbe Risiko, verwenden aber unterschiedliche Definitionen und Ausschlüsse.', task: 'Entwickeln Sie die Vergleichslogik.', walkthrough: ['Zuerst werden gewünschte Deckungsfunktionen und Prioritäten fixiert.', 'Jedes Angebot wird gegen dieselben Funktionen geprüft.', 'Nicht belegte Gleichwertigkeit bleibt CONTRACT_CHECK_REQUIRED; die Kundenentscheidung wird mit Abweichungen dokumentiert.'] },
    selfCheck: { question: 'Wann darf ein Konzept als passend gelten?', options: ['Wenn es das billigste Angebot enthält.', 'Wenn es aus Bedarf abgeleitet ist und Vertragsgrenzen geprüft sind.', 'Wenn alle denkbaren Risiken genannt sind.'], correctIndex: 1, explanation: 'Passung erfordert Bedarfskette und konkrete Vertragsprüfung.' },
    laws: ['MaklerG', 'VersVG', 'KSchG', 'Standesrecht'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-09', areas.anbahnung, 'die vom Versicherer ausgestellte Polizze zu prüfen', {
    ichKann: 'Ich kann die ausgestellte Polizze systematisch mit Antrag, Vereinbarung und akzeptiertem Konzept vergleichen und Abweichungen fristneutral zur Klärung bringen.',
    decisionFramework: { title: 'Soll – Antrag – Polizze', points: ['Welche Deckung und Vertragsdaten wurden beauftragt?', 'Was wurde beantragt und vom Versicherer tatsächlich dokumentiert?', 'Welche Abweichung ist wesentlich und welcher aktuelle Handlungsweg ist zu prüfen?'] },
    workflow: ['Freigegebenes Konzept und Antrag sichern.', 'Versicherungsnehmer, Risiko, Laufzeit und Dokumentbestand abgleichen.', 'Leistung, Summen, Ausschlüsse und Klauseln vergleichen.', 'Abweichungen nach Relevanz protokollieren.', 'Klärung veranlassen und Ergebnis beweissicher ablegen.'],
    commonErrors: ['Nur Namen und Prämie vergleichen.', 'Polizzenbeilage oder Klauselverzeichnis übergehen.', 'Für Abweichungen eine pauschale Frist behaupten.'],
    microCase: { title: 'Klausel fehlt in der Polizze', situation: 'Eine im Antrag bezeichnete Erweiterung ist in den erhaltenen Dokumenten nicht eindeutig auffindbar.', task: 'Legen Sie den Prüf- und Kommunikationsweg fest.', walkthrough: ['Antrag, Polizze, Bedingungen und Klauselverzeichnis werden gemeinsam geprüft.', 'Das Fehlen wird als Abweichung, nicht sofort als endgültiger Deckungsmangel, dokumentiert.', 'Aktuelle Rechts- und Vertragsfolgen werden geklärt; der Kunde erhält einen nachvollziehbaren Status.'] },
    selfCheck: { question: 'Welche Unterlagen bilden den Mindestvergleich?', options: ['Nur die Polizze.', 'Konzept beziehungsweise Auftrag, Antrag und vollständige Polizzenunterlagen.', 'Nur die Prämienvorschreibung.'], correctIndex: 1, explanation: 'Erst der Soll-Ist-Vergleich zeigt Abweichungen.' },
    laws: ['VersVG', 'MaklerG', 'ABGB', 'KSchG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-10', areas.betreuung, 'die Polizzen des Kunden zu verwalten', {
    ichKann: 'Ich kann Vertragsunterlagen vollständig, zugriffsgeschützt und änderungsnachvollziehbar verwalten, externe Veränderungen beobachten, Risiken periodisch überprüfen, Indizes nachhalten, Änderungs- oder Verbesserungsvorschläge dokumentiert anstoßen und einen Verzug mit Folgeprämien ohne ungeprüfte Rechtsfolge verfolgen.',
    decisionFramework: { title: 'Bestand mit Status und Beobachtungsauftrag', points: ['Welche Dokumente, Versionen, Indizes und Prämieninformationen gehören zum Vertrag?', 'Welche Änderungen beim Kunden oder in seinem Umfeld können eine neue Risikoprüfung auslösen?', 'Welche Änderungs- oder Verbesserungsvorschläge folgen aus bestätigten Abweichungen?', 'Welche Rückmeldung, Zahlung oder Vertragsbestätigung ist noch offen und wie wird sie nachverfolgt?'] },
    workflow: ['Vollständigkeit und Zuordnung der Dokumente prüfen.', 'Version, Eingang, Herkunft, vereinbarte Indizes und Prämienstatus erfassen.', 'Externe rechtliche, wirtschaftliche oder tatsächliche Veränderungen als mögliche Prüfanlässe beobachten.', 'Risiken turnusmäßig und bei konkretem Anlass mit dem Kunden überprüfen.', 'Indexentwicklungen und ihre konkrete Vertragswirkung nur anhand bestätigter Unterlagen einordnen.', 'Änderungs- oder Verbesserungsvorschläge aus bestätigten Veränderungen ableiten und mit Vorbehalt dokumentieren.', 'Einen gemeldeten Verzug mit Folgeprämien nachverfolgen, ohne Frist oder Rechtsfolge vorwegzunehmen.', 'Zugriff, Wiedervorlagen, Rückmeldungen und bestätigte Erledigung nachvollziehbar steuern.'],
    commonErrors: ['Alte und aktuelle Fassungen unmarkiert nebeneinander führen.', 'Eine externe Veränderung oder einen Index automatisch als Vertragsänderung behandeln.', 'Die periodische Risikoprüfung durch eine bloße Dateikontrolle ersetzen.', 'Änderungs- oder Verbesserungsvorschläge ohne bestätigten Sachverhalt abgeben.', 'Aus einem Verzug mit Folgeprämien ungeprüft eine bestimmte Vertrags- oder Leistungsfolge ableiten.'],
    microCase: { title: 'Index, Betriebsänderung und offene Folgeprämie', situation: 'Bei der turnusmäßigen Bestandsprüfung werden eine geänderte Nutzung, ein vertraglich genannter Index und eine als offen gemeldete Folgeprämie sichtbar; Vertragswirkung und Zahlungsstatus sind nicht bestätigt.', task: 'Stellen Sie einen auditierbaren Prüf-, Vorschlags- und Nachverfolgungsprozess her.', walkthrough: ['Dokumentherkunft, Indexbezug, Nutzungsänderung und Prämienmeldung werden mit getrenntem Status erfasst.', 'Die Risiken werden mit dem Kunden periodisch neu geprüft; ein möglicher Änderungs- oder Verbesserungsvorschlag bleibt bis zur Vertragsprüfung vorläufig.', 'Folgeprämie, Weiterleitung und Rückmeldungen werden nachverfolgt, ohne eine Frist, Säumnisfolge oder Vertragsänderung zu behaupten.'] },
    selfCheck: { question: 'Wann ist eine Bestandsprüfung fachlich vollständig?', options: ['Sobald die neueste Datei abgelegt ist.', 'Wenn Dokumentstatus, externe Veränderungen, periodische Risikoprüfung, Indizes, Vorschläge und offene Folgeprämien nachvollziehbar geprüft oder nachverfolgt sind.', 'Wenn jede Indexbewegung automatisch übernommen wurde.'], correctIndex: 1, explanation: 'Polizzenverwaltung verbindet nachvollziehbare Dokumentation mit laufender Beobachtung; konkrete Vertrags- und Rechtsfolgen bleiben prüfbedürftig.' },
    laws: ['MaklerG', 'DSGVO/DSG', 'UGB'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-11', areas.betreuung, 'Schadensfälle aufzunehmen und beim Versicherer zu melden', {
    ichKann: 'Ich kann einen Schaden sachlich aufnehmen, Tatsachen von Kundenannahmen trennen, erforderliche Erstmaßnahmen ansprechen und die Meldung nachweisbar weiterleiten.',
    decisionFramework: { title: 'Melden ohne Leistungszusage', points: ['Was ist wann, wo und wie nach derzeitiger Kenntnis geschehen?', 'Welche akuten Sicherungs- und Schadenminderungsmaßnahmen sind dokumentiert?', 'Welche Verträge könnten betroffen sein und welche Angaben oder Belege fehlen?'] },
    workflow: ['Akute Sicherheit und weitere Schäden priorisieren.', 'Ereignis, Beteiligte und Zeitangaben als Quellenangaben aufnehmen.', 'Fotos, Belege und behördliche Vorgänge erfassen.', 'Betroffene Verträge ohne Deckungszusage zuordnen.', 'Meldung übermitteln, Eingang sichern und offene Nachreichungen planen.'],
    commonErrors: ['Verschulden oder Deckung bei der Aufnahme vorwegnehmen.', 'Kundenvermutungen als festgestellte Ursache schreiben.', 'Meldung ohne Sende- oder Eingangsbeleg belassen.'],
    microCase: { title: 'Wasserschaden mit unbekannter Ursache', situation: 'In einem Betrieb tritt Wasser aus; Ursache und betroffene Verträge sind noch unklar.', task: 'Strukturieren Sie die Erstaufnahme.', walkthrough: ['Sicherung, Schadenminderung und Zuständigkeiten werden zuerst erfasst.', 'Beobachtung, Kundenangabe und unbekannte Ursache bleiben getrennt.', 'Mögliche Verträge werden gemeldet, ohne eine Leistung zu versprechen; Nachweise werden nachgereicht.'] },
    selfCheck: { question: 'Welche Formulierung ist korrekt?', options: ['Der Versicherer wird sicher zahlen.', 'Nach Kundenangabe wurde Wasser bemerkt; Ursache derzeit unknown.', 'Der Kunde hat den Schaden verursacht.'], correctIndex: 1, explanation: 'Die Meldung wahrt Quellenstatus und vermeidet ungesicherte Schlussfolgerungen.' },
    laws: ['VersVG', 'MaklerG', 'ABGB'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-12', areas.betreuung, 'Schadensfälle für den Versicherungsnehmer zu bearbeiten und abzuwickeln', {
    ichKann: 'Ich kann die Schadenbearbeitung als dokumentierten Vorgang steuern, Vertragspositionen prüfen, fehlende Belege nachführen und Entscheidungen des Versicherers nachvollziehbar erklären.',
    decisionFramework: { title: 'Anspruchsweg mit Prüfstationen', points: ['Welche Tatsachen und Schäden sind belegt?', 'Welche Vertragsbestimmungen und aktuellen Rechtsfragen sind entscheidend?', 'Welche Position vertritt der Versicherer, welche Unterlagen fehlen und welcher nächste Schritt ist sachgerecht?'] },
    workflow: ['Aktenstand und Auftrag klären.', 'Schadenpositionen mit Belegen strukturieren.', 'Vertragsgrundlagen und Mitwirkungspunkte prüfen.', 'Korrespondenz, Rückfragen und Teilentscheidungen nachhalten.', 'Ergebnis, offene Differenzen und mögliche weitere Prüfung mit dem Kunden besprechen.'],
    commonErrors: ['Eine Meldung mit Anerkennung des Anspruchs gleichsetzen.', 'Abzüge oder Ablehnung ohne Vertragsfundstelle akzeptieren oder verwerfen.', 'Belege ohne Bezug zu einer Schadenposition sammeln.'],
    microCase: { title: 'Teilweise Regulierung', situation: 'Der Versicherer ersetzt nur einen Teil der eingereichten Positionen und verweist allgemein auf Bedingungen.', task: 'Planen Sie die weitere Bearbeitung.', walkthrough: ['Jede Schadenposition wird der Entscheidung zugeordnet.', 'Vertragsfundstelle und Berechnung werden konkret angefordert und geprüft.', 'Bestätigte, strittige und fehlende Punkte werden getrennt erklärt; Rechtsfragen bleiben CURRENT_AUTHORITY_REQUIRED.'] },
    selfCheck: { question: 'Was folgt auf eine unklare Kürzung?', options: ['Sofortige Zahlungszusage an den Kunden.', 'Begründung, Berechnung und Vertragsgrundlage positionsbezogen prüfen.', 'Den Vorgang ohne Dokumentation schließen.'], correctIndex: 1, explanation: 'Nur der positionsbezogene Abgleich erlaubt eine belastbare Einordnung.' },
    laws: ['VersVG', 'MaklerG', 'ABGB', 'KSchG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-13', areas.betreuung, 'den Versicherungsschutz durch Hinzunahme individueller Maklerklauseln zu optimieren', {
    ichKann: 'Ich kann einen aus der Risikoanalyse begründeten Klauselbedarf formulieren, Wortlaut und Annahme nachweisen und die tatsächliche Vertragswirkung offen prüfen.',
    decisionFramework: { title: 'Bedarf – Wortlaut – Einbeziehung', points: ['Welche konkrete Deckungslücke oder Unklarheit soll adressiert werden?', 'Was sagt der vollständige Klauselwortlaut im Zusammenspiel mit Bedingungen und Ausschlüssen?', 'Ist die Klausel nachweislich vereinbart und in der Polizze wirksam abgebildet?'] },
    workflow: ['Bedarf aus dem Kundenrisiko ableiten.', 'Klauselwortlaut und Wechselwirkungen prüfen.', 'Unklare oder widersprüchliche Formulierungen klären.', 'Annahme und Einbeziehung dokumentieren.', 'Polizze und Beilagen gegen die Vereinbarung prüfen.'],
    commonErrors: ['Vom Klauselnamen auf die Wirkung schließen.', 'Eine eingereichte Klausel als automatisch angenommen behandeln.', 'Eine Erweiterung ohne Prüfung ihrer Grenzen als umfassend bezeichnen.'],
    microCase: { title: 'Bekannter Klauselname, anderer Wortlaut', situation: 'Ein Angebot nennt eine vertraute Klauselbezeichnung, der beigefügte Text weicht jedoch ab.', task: 'Bewerten Sie die Verwendbarkeit.', walkthrough: ['Nicht die Bezeichnung, sondern der vollständige Wortlaut wird verglichen.', 'Auswirkungen auf das konkrete Risiko und andere Bedingungen werden geprüft.', 'Bis zur bestätigten Einbeziehung bleibt jede Wirkung CONTRACT_CHECK_REQUIRED.'] },
    selfCheck: { question: 'Was beweist den Schutz durch eine Maklerklausel?', options: ['Der bekannte Kurzname.', 'Geprüfter Wortlaut plus nachgewiesene vertragliche Einbeziehung.', 'Die Aufnahme in eine interne Wunschliste.'], correctIndex: 1, explanation: 'Nur Wortlaut und Einbeziehung bestimmen die konkrete Vertragswirkung.' },
    laws: ['VersVG', 'MaklerG', 'ABGB', 'KSchG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-14', areas.betreuung, 'Beschwerden von Kunden über einen Versicherer zu bearbeiten', {
    ichKann: 'Ich kann eine Beschwerde gegen einen Versicherer in Anliegen, Fakten, gewünschtes Ergebnis und Prüfgrundlagen zerlegen und einen nachvollziehbaren Bearbeitungsweg steuern.',
    decisionFramework: { title: 'Beschwerde als überprüfbare Differenz', points: ['Welche konkrete Handlung oder Entscheidung wird beanstandet?', 'Welche Tatsachen, Vertragsstellen und Korrespondenzen tragen die Positionen?', 'Welches Ergebnis wird angestrebt und welcher interne oder externe Weg ist aktuell passend?'] },
    workflow: ['Beschwerde und Wunsch des Kunden aufnehmen.', 'Chronologie und Dokumente sichern.', 'Vertrags- und Rechtsgrundlagen prüfen.', 'Sachliche Eingabe mit konkretem Begehren übermitteln.', 'Antwort bewerten, Eskalationsoptionen aktuell prüfen und Ergebnis dokumentieren.'],
    commonErrors: ['Ärger des Kunden ungefiltert als Tatsachenbehauptung versenden.', 'Beschwerdeweg und rechtliche Anspruchsdurchsetzung gleichsetzen.', 'Eine Eskalationsstelle ohne aktuelle Zuständigkeit nennen.'],
    microCase: { title: 'Keine nachvollziehbare Antwort', situation: 'Ein Kunde erhält auf seine Leistungsanfrage nur eine knappe Ablehnung ohne konkrete Fundstelle.', task: 'Bereiten Sie die Beschwerde vor.', walkthrough: ['Anfrage, Antwort und gewünschte Klärung werden chronologisch geordnet.', 'Eine konkrete Begründung samt Vertragsbezug wird verlangt.', 'Weitere Wege werden erst nach aktueller Zuständigkeitsprüfung genannt.'] },
    selfCheck: { question: 'Was gehört in eine wirksame Beschwerde?', options: ['Nur starke Wertungen.', 'Chronologie, Belege, konkrete Differenz und gewünschte Abhilfe.', 'Eine garantierte rechtliche Bewertung.'], correctIndex: 1, explanation: 'Überprüfbare Angaben ermöglichen eine sachliche Bearbeitung.' },
    laws: ['VersVG', 'MaklerG', 'VAG 2016', 'KSchG', 'ABGB'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-15', areas.betreuung, 'mit persönlichen und sensiblen Daten von Kunden umzugehen', {
    ichKann: 'Ich kann Kundendaten zweckgebunden, sparsam, sicher und nachweisbar verarbeiten und besondere Kategorien nicht ohne geklärte Rechtsgrundlage behandeln.',
    decisionFramework: { title: 'Zweck – Grundlage – Schutz', points: ['Für welchen konkreten Zweck wird welche Information benötigt?', 'Welche aktuelle Rechtsgrundlage und welche Informationspflicht gilt?', 'Wer braucht Zugriff, wie wird übertragen, aufbewahrt, berichtigt und gelöscht?'] },
    workflow: ['Zweck und minimale Datenmenge festlegen.', 'Rechtsgrundlage und besondere Schutzbedürftigkeit prüfen.', 'Betroffene Person transparent informieren.', 'Zugriff, Übertragung und Ablage absichern.', 'Aufbewahrung, Auskunft, Berichtigung und Vorfälle prozessual steuern.'],
    commonErrors: ['Einwilligung als pauschale Lösung für jede Verarbeitung verwenden.', 'Gesundheitsdaten über ungeeignete Kanäle anfordern.', 'Daten vorsorglich ohne festgelegten Zweck unbegrenzt behalten.'],
    microCase: { title: 'Gesundheitsunterlagen per offenem Kanal', situation: 'Ein Kunde möchte sensible Befunde spontan über einen ungesicherten Kommunikationsweg senden.', task: 'Reagieren Sie datenschutzgerecht.', walkthrough: ['Der Versand wird nicht unnötig gefördert; Zweck und Erforderlichkeit werden geprüft.', 'Ein freigegebener sicherer Übermittlungsweg wird angeboten.', 'Rechtsgrundlage, Zugriff und Aufbewahrung werden aktuell dokumentiert.'] },
    selfCheck: { question: 'Was ist der erste Filter vor Datenerhebung?', options: ['Ob die Information interessant sein könnte.', 'Ob sie für einen festgelegten Zweck erforderlich und rechtmäßig verarbeitbar ist.', 'Ob Speicherplatz vorhanden ist.'], correctIndex: 1, explanation: 'Zweckbindung und Datenminimierung stehen vor der technischen Ablage.' },
    laws: ['DSGVO/DSG', 'GewO 1994', 'MaklerG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-16', areas.betreuung, 'Kündigungen von Verträgen durch den Kunden rechtskonform vorzunehmen', {
    ichKann: 'Ich kann den Kündigungswunsch präzisieren, Vertrag und aktuelle Rechtsgrundlage prüfen, Zugang beweissicher organisieren und Deckungsfolgen ohne Lückenversprechen erklären.',
    decisionFramework: { title: 'Beendigungsweg mit Wirkungsdatum', points: ['Welcher Vertrag soll aus welchem Grund zu welchem Ziel beendet werden?', 'Welche Form, Frist, Adressierung und Sonderregel ergibt sich aktuell aus Vertrag und Recht?', 'Wann ist Zugang nachweisbar und welche Anschluss- oder Lückenfolgen sind zu klären?'] },
    workflow: ['Kundenauftrag und betroffenen Vertrag eindeutig erfassen.', 'Vollständige Vertragsunterlagen und aktuelle Normen prüfen.', 'Beendigungsart, Form und Zeitpunkt bestimmen.', 'Erklärung korrekt adressieren und Zugang sichern.', 'Bestätigung, Wirksamkeit und Folgebedarf nachhalten.'],
    commonErrors: ['Eine allgemeine Kündigungsfrist auf jeden Vertrag übertragen.', 'Absendedatum und rechtzeitigen Zugang gleichsetzen.', 'Folgeversicherung als automatisch lückenlos darstellen.'],
    microCase: { title: 'Kündigungswunsch ohne vollständige Polizze', situation: 'Ein Kunde möchte rasch kündigen, legt aber nur eine Prämieninformation vor.', task: 'Bestimmen Sie das sichere Vorgehen.', walkthrough: ['Vertrag, Versicherer und gewünschter Beendigungsgrund werden konkretisiert.', 'Frist und Form bleiben bis zur Originalprüfung CONTRACT_CHECK_REQUIRED.', 'Zugang und Antwort werden beweissicher verfolgt; Anschlussfragen werden getrennt behandelt.'] },
    selfCheck: { question: 'Wann darf ein Kündigungsdatum genannt werden?', options: ['Nach Erinnerung des Kunden.', 'Nach Prüfung von Vertrag, aktuellem Recht und maßgeblichem Zugang.', 'Sobald ein neuer Anbieter gefunden ist.'], correctIndex: 1, explanation: 'Wirksamkeit hängt vom konkreten Beendigungsweg ab.' },
    laws: ['VersVG', 'ABGB', 'KSchG', 'MaklerG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-17', areas.betreuung, 'Kündigungen durch den Versicherer zu beurteilen', {
    ichKann: 'Ich kann eine Kündigung des Versicherers nach Absender, Grund, Form, Zeitpunkt und Vertragswirkung prüfen und Handlungsoptionen ohne vorschnelle Wirksamkeitsaussage ordnen.',
    decisionFramework: { title: 'Erklärung – Grundlage – Folge', points: ['Welche Erklärung ist wann und wem zugegangen?', 'Auf welche Vertrags- oder Rechtsgrundlage stützt sie sich?', 'Welche Wirksamkeit, Einwendung, Frist und Versorgungslücke muss aktuell geprüft werden?'] },
    workflow: ['Originalerklärung und Zustellnachweis sichern.', 'Vertrag, Nachträge und Ereignisbezug zusammenstellen.', 'Form, Grund und Zeitpunkt rechtlich und vertraglich prüfen.', 'Folgen und mögliche Reaktion priorisieren.', 'Kundenstatus, Maßnahmen und Ergebnis dokumentieren.'],
    commonErrors: ['Jede Mitteilung als sofort wirksame Kündigung behandeln.', 'Zugang oder Begründung aus dem Dokumentdatum ableiten.', 'Nur Ersatzdeckung suchen und die Wirksamkeit ungeprüft lassen.'],
    microCase: { title: 'Kündigung nach Schaden', situation: 'Nach einem Schaden erhält der Kunde ein Schreiben des Versicherers; Zugang und Rechtsgrundlage sind umstritten.', task: 'Strukturieren Sie die Beurteilung.', walkthrough: ['Originalschreiben und tatsächlicher Zugang werden getrennt festgestellt.', 'Vertrag, Schadenverlauf und genannte Grundlage werden geprüft.', 'Wirksamkeit und Reaktionsmöglichkeiten bleiben bis zur aktuellen Rechtsprüfung offen; Versorgungslücken werden parallel analysiert.'] },
    selfCheck: { question: 'Welcher Beleg ist neben dem Schreiben zentral?', options: ['Eine interne Vermutung.', 'Der nachweisbare Zugang und der vollständige Vertrag.', 'Eine Produktbroschüre.'], correctIndex: 1, explanation: 'Zeitpunkt und Vertragsgrundlage sind für die Beurteilung wesentlich.' },
    laws: ['VersVG', 'ABGB', 'KSchG', 'MaklerG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-18', areas.betreuung, 'eine vom Kunden ausgesprochene Kündigung eines Versicherungsvertrages zu beurteilen', {
    ichKann: 'Ich kann eine bereits erklärte Kundenkündigung auf eindeutigen Inhalt, Vertretung, Form, Zugang und möglichen Wirksamkeitszeitpunkt prüfen und Unsicherheit transparent kommunizieren.',
    decisionFramework: { title: 'Nachprüfung einer Erklärung', points: ['Was hat der Kunde genau erklärt und war der Vertrag eindeutig bezeichnet?', 'Wie, wann und an wen wurde die Erklärung übermittelt?', 'Welche vertraglichen und aktuellen gesetzlichen Regeln bestimmen die Wirkung?'] },
    workflow: ['Wortlaut und Übermittlungsbeleg sichern.', 'Betroffenen Vertrag und Erklärenden identifizieren.', 'Adressat, Form, Zugang und Zeitpunkt prüfen.', 'Bestätigung oder Widerspruch des Versicherers einordnen.', 'Status, mögliche Heilung und Folgewirkungen dokumentieren.'],
    commonErrors: ['Kündigungsabsicht mit wirksamer Kündigung gleichsetzen.', 'Eine automatisierte Sendebestätigung als Zugangsnachweis überdehnen.', 'Ein Schweigen des Versicherers als Bestätigung interpretieren.'],
    microCase: { title: 'Kurze E-Mail ohne Polizzennummer', situation: 'Der Kunde hat eine knappe Kündigungs-E-Mail gesendet; mehrere Verträge bestehen beim selben Versicherer.', task: 'Beurteilen Sie den Status.', walkthrough: ['Wortlaut, Absender, Empfänger und Versandbeleg werden gesichert.', 'Eindeutigkeit des betroffenen Vertrags und zulässige Form werden geprüft.', 'Bis zur Klärung wird keine Wirksamkeit behauptet; eine geeignete Ergänzung wird aktuell geprüft.'] },
    selfCheck: { question: 'Welche Aussage ist bei unklarer Zuordnung richtig?', options: ['Die Kündigung betrifft automatisch alle Verträge.', 'Wirksamkeit bleibt offen; Eindeutigkeit, Form und Zugang sind zu prüfen.', 'Die E-Mail ist immer unwirksam.'], correctIndex: 1, explanation: 'Ohne konkrete Prüfung ist weder Wirksamkeit noch Unwirksamkeit sicher.' },
    laws: ['VersVG', 'ABGB', 'KSchG', 'MaklerG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-19', areas.qualitaet, 'ethische Grundsätze in seiner Geschäftstätigkeit zu definieren und einzuhalten', {
    ichKann: 'Ich kann ethische Leitlinien in überprüfbare Verhaltensregeln übersetzen, Interessenkonflikte sichtbar machen und Entscheidungen aus Kundensicht begründen.',
    decisionFramework: { title: 'Darf – soll – belegbar', points: ['Ist die Handlung rechtlich und standesrechtlich zulässig?', 'Ist sie fair, transparent und am vereinbarten Kundeninteresse ausgerichtet?', 'Könnte Entscheidung, Konflikt und Vergütung gegenüber dem Kunden nachvollziehbar erklärt werden?'] },
    workflow: ['Risikofelder und typische Konflikte sammeln.', 'Prinzipien mit konkreten Verhaltensbeispielen definieren.', 'Offenlegung und Eskalationswege festlegen.', 'Mitarbeiter anhand von Fällen schulen.', 'Einhaltung prüfen und Regeln bei Erkenntnissen aktualisieren.'],
    commonErrors: ['Ethik nur als allgemeines Leitbild ohne Handlungsregel formulieren.', 'Interessenkonflikte erst nach Kundenbeschwerde offenlegen.', 'Umsatzziel automatisch mit Kundeninteresse gleichsetzen.'],
    microCase: { title: 'Vergütung und gleichwertige Optionen', situation: 'Zwei grundsätzlich passende Wege unterscheiden sich in Vergütung und weiteren Merkmalen.', task: 'Treffen Sie eine ethisch nachvollziehbare Prozessentscheidung.', walkthrough: ['Kundenbedarf und relevante Unterschiede werden nach einheitlichen Kriterien geprüft.', 'Mögliche Interessenkonflikte werden nach aktueller Pflicht transparent behandelt.', 'Empfehlung oder Auswahl wird aus Kundeninteresse dokumentiert, nicht aus Vergütung abgeleitet.'] },
    selfCheck: { question: 'Wann ist ein Ethikgrundsatz wirksam?', options: ['Wenn er gut klingt.', 'Wenn er Verhalten, Offenlegung und Kontrolle konkret steuert.', 'Wenn nur die Leitung ihn kennt.'], correctIndex: 1, explanation: 'Operationalisierte Regeln sind lern- und überprüfbar.' },
    laws: ['Standesrecht', 'MaklerG', 'GewO 1994', 'UWG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-20', areas.qualitaet, 'durch dynamische Produktentwicklung für die Weiterentwicklung des Versicherungswesens zu sorgen', {
    ichKann: 'Ich kann wiederkehrende Kundenbedarfe sowie internationale, rechtliche, wirtschaftliche und gesellschaftliche Entwicklungen evidenzbasiert beobachten und daraus prüfbare Vorschläge zur Anpassung von Produkten oder Klauseln sowie zu neuen Versicherungslösungen ableiten.',
    decisionFramework: { title: 'Entwicklungssignal statt vorschneller Produktidee', points: ['Welches wiederkehrende Kundenproblem oder welche internationale, rechtliche, wirtschaftliche oder gesellschaftliche Entwicklung ist belegt?', 'Wie verändert dieses Signal Risiken, Zielgruppen, bestehende Produkte oder einzelne Klauseln?', 'Reicht eine Anpassung von Produkt oder Klausel, oder ist eine neue Lösungshypothese zu prüfen?', 'Welche Zielwirkung, Grenzen, Fehlanreize und aktuellen Autoritätsfragen muss die Entwicklung berücksichtigen?'] },
    workflow: ['Anonymisierte Bedarfssignale und relevante internationale Entwicklungen systematisch erfassen.', 'Rechtliche, wirtschaftliche und gesellschaftliche Entwicklungen mit Quelle und Zeitstand dokumentieren.', 'Ursache, Häufigkeitsbeobachtung, Wirkung und Unsicherheit sauber trennen.', 'Bestehende Lösungen, Produkte und Klauseln gegen das bestätigte Signal prüfen.', 'Eine Anpassung von Produkten oder Klauseln beziehungsweise eine neue Anforderung mit Zielgruppe, Wirkung und Grenzen formulieren.', 'Rechtliche Zulässigkeit, Versicherbarkeit und Vertragswirkung getrennt prüfen lassen.', 'Pilotfeedback auswerten, ohne es als Marktbeweis zu überdehnen.'],
    commonErrors: ['Einen Einzelwunsch als bestätigten Marktbedarf darstellen.', 'Eine internationale oder gesellschaftliche Entwicklung ohne belastbare Quelle verallgemeinern.', 'Neue Produkte vorzuschlagen, obwohl eine begrenzte Anpassung bestehender Klauseln geprüft werden müsste.', 'Produktentwicklung mit möglichst breiter Leistungszusage verwechseln.', 'Datenschutz oder Fehlanreize bei Falldaten ignorieren.'],
    microCase: { title: 'Neue Arbeitsformen über mehrere Märkte', situation: 'Aus mehreren Ländern und Kundengruppen liegen Hinweise vor, dass neue Arbeitsformen bestehende Risikobeschreibungen berühren; rechtliche, wirtschaftliche und gesellschaftliche Rahmenbedingungen unterscheiden sich.', task: 'Leiten Sie eine belastbare Entwicklungsfrage und mögliche Anpassungspfade ab.', walkthrough: ['Internationale Signale und lokale Fälle werden nach Quelle, Zeitstand und Mechanismus getrennt.', 'Auswirkungen auf bestehende Produkte und Klauseln werden geprüft, ohne Übertragbarkeit oder Vertragswirkung zu unterstellen.', 'Anpassung eines Produkts, Änderung einer Klausel und neue Lösung werden als getrennte Hypothesen formuliert; Regulierung und Versicherbarkeit bleiben aktuelle Autoritätsfragen.'] },
    selfCheck: { question: 'Welche Reaktion entspricht dynamischer Produktentwicklung?', options: ['Aus einem Einzelwunsch sofort ein neues Produkt ableiten.', 'Internationale sowie rechtliche, wirtschaftliche und gesellschaftliche Signale belegen und dann die Anpassung von Produkten oder Klauseln gegen eine neue Lösung abwägen.', 'Bestehende Klauseln unabhängig von Veränderungen unverändert lassen.'], correctIndex: 1, explanation: 'Dynamische Entwicklung beginnt mit belegten Veränderungen und prüft gezielt, ob Produkt, Klausel oder Lösung angepasst werden sollte.' },
    laws: ['VAG 2016', 'GewO 1994', 'MaklerG', 'DSGVO/DSG', 'UWG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-21', areas.qualitaet, 'Beschwerden über sich zu bearbeiten', {
    ichKann: 'Ich kann Beschwerden über die eigene Tätigkeit unabhängig vom Verteidigungsimpuls aufnehmen, Belege sichern, mögliche Fehler prüfen und Abhilfe sowie Lernmaßnahmen dokumentieren.',
    decisionFramework: { title: 'Beschwerde – Prüfung – Lernen', points: ['Was beanstandet die Person konkret und welches Ergebnis erwartet sie?', 'Welche Akten, Pflichten und Kommunikationsschritte erlauben eine faire Prüfung?', 'Welche Abhilfe, Eskalation und systemische Verbesserung folgt aus dem Ergebnis?'] },
    workflow: ['Eingang bestätigen und Anliegen neutral zusammenfassen.', 'Akte und Kommunikationsverlauf unverändert sichern.', 'Sachverhalt, Auftrag und aktuelle Pflichten prüfen.', 'Begründet antworten und mögliche Abhilfe umsetzen.', 'Ursache, Wiederholungsrisiko und Qualitätsmaßnahme nachhalten.'],
    commonErrors: ['Die Beschwerde als persönlichen Angriff behandeln.', 'Akten nachträglich ohne Änderungsspur ergänzen.', 'Einzelfall schließen, ohne systemische Ursache zu prüfen.'],
    microCase: { title: 'Vorwurf fehlender Information', situation: 'Eine Kundin behauptet, eine wichtige Vertragsgrenze sei im Beratungsgespräch nicht erklärt worden.', task: 'Bearbeiten Sie die Beschwerde fair.', walkthrough: ['Vorwurf, gewünschte Abhilfe und Kundensicht werden neutral erfasst.', 'Auftrag, Beratungsdokumentation und Vertragsunterlagen werden unverändert geprüft.', 'Bestätigte, unklare und widerlegte Punkte werden getrennt beantwortet; Verbesserungsbedarf wird verfolgt.'] },
    selfCheck: { question: 'Welche Reaktion schützt die Nachvollziehbarkeit?', options: ['Die Akte unmarkiert ergänzen.', 'Originalakte sichern und spätere Ergänzungen als solche kennzeichnen.', 'Nur mündlich antworten.'], correctIndex: 1, explanation: 'Eine unveränderte Beweislage ist Voraussetzung fairer Prüfung.' },
    laws: ['MaklerG', 'GewO 1994', 'Standesrecht', 'DSGVO/DSG', 'ABGB'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
  ['LO-22', areas.qualitaet, 'gesetzliche Informationspflichten einzuhalten', {
    ichKann: 'Ich kann Informationspflichten dem richtigen Zeitpunkt, Kanal und Empfänger zuordnen, aktuelle Inhalte prüfen und die Erfüllung beweissicher dokumentieren.',
    decisionFramework: { title: 'Wer – was – wann – wie', points: ['Welche Rolle, Tätigkeit und Vertriebssituation löst welche Information aus?', 'Wann muss sie in welcher verständlichen Form verfügbar sein?', 'Wie werden Inhalt, Version, Übergabe und gegebenenfalls Zustimmung nachgewiesen?'] },
    workflow: ['Geschäftsschritt und Kommunikationskanal bestimmen.', 'Aktuelle Pflichtinformationen aus Primärquellen ermitteln.', 'Inhalt zielgruppengerecht und unverändert vollständig bereitstellen.', 'Zeitpunkt und Zugang dokumentieren.', 'Vorlagen und Nachweise bei Rechts- oder Prozessänderungen aktualisieren.'],
    commonErrors: ['Alle Informationen erst mit der Polizze übermitteln.', 'Webseitenhinweis ohne Prüfung des konkreten Zugangs als ausreichend behandeln.', 'Veraltete Pflichttexte wegen unverändertem Layout weiterverwenden.'],
    microCase: { title: 'Online-Erstkontakt mit alter Vorlage', situation: 'Ein digitaler Erstkontakt nutzt eine Vorlage, deren Rechtsstand nicht dokumentiert ist.', task: 'Entscheiden Sie über die weitere Verwendung.', walkthrough: ['Auslösendes Stadium und Kanal werden bestimmt.', 'Inhalte und Übermittlungsanforderungen werden aktuell geprüft.', 'Die alte Vorlage bleibt gesperrt, bis Version, Freigabe und Nachweisweg bestätigt sind.'] },
    selfCheck: { question: 'Was beweist die Einhaltung am besten?', options: ['Eine Vorlage im Ordner.', 'Aktueller Inhalt plus belegter rechtzeitiger Zugang.', 'Die Erinnerung des Beraters.'], correctIndex: 1, explanation: 'Pflicht und Erfüllung brauchen sowohl richtigen Inhalt als auch Nachweis.' },
    laws: ['GewO 1994', 'MaklerG', 'Standesrecht', 'ECG', 'TKG 2021', 'DSGVO/DSG', 'KSchG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED'],
  }],
  ['LO-23', areas.qualitaet, 'Maßnahmen zur Qualitätssicherung und -optimierung für die Kundenberatung zu implementieren', {
    ichKann: 'Ich kann Beratungsqualität über klare Standards, Stichproben, Fehlerklassen, Rückmeldungen und nachweisbare Verbesserungszyklen steuern.',
    decisionFramework: { title: 'Standard – Evidenz – Verbesserung', points: ['Welche beobachtbare Beratungsqualität soll erreicht werden?', 'Welche Akten- oder Gesprächsevidenz zeigt Erfüllung und welche Daten fehlen?', 'Welche Korrektur ist verantwortlich, terminiert und auf Wirksamkeit überprüfbar?'] },
    workflow: ['Qualitätsziel und Mindeststandard definieren.', 'Prüfkriterien und datensparsame Evidenz festlegen.', 'Stichproben oder Fallreviews durchführen.', 'Fehlerursache und Korrekturmaßnahme zuordnen.', 'Wirksamkeit erneut prüfen und Standard versioniert anpassen.'],
    commonErrors: ['Nur Abschlusszahlen als Beratungsqualität verwenden.', 'Ein Training ohne spätere Wirksamkeitsprüfung als erledigt markieren.', 'Fehlende Daten als Null oder bestandene Prüfung behandeln.'],
    microCase: { title: 'Wiederkehrende Dokumentationslücke', situation: 'In mehreren Stichproben fehlt die klare Trennung zwischen Kundenangabe und Vertragsbestätigung.', task: 'Entwerfen Sie eine Qualitätsmaßnahme.', walkthrough: ['Fehlerbild und Stichprobengrenze werden exakt dokumentiert.', 'Vorlage und Schulungsfall werden auf die Trennung von Quellenstatus ausgerichtet.', 'Eine spätere Stichprobe prüft denselben Indikator; erst dann wird Wirkung bewertet.'] },
    selfCheck: { question: 'Wann ist eine Qualitätsmaßnahme abgeschlossen?', options: ['Nach ihrer Ankündigung.', 'Nach Umsetzung und überprüfter Wirkung gegen ein definiertes Kriterium.', 'Sobald keine Beschwerde eingeht.'], correctIndex: 1, explanation: 'Ohne Wirkungsprüfung bleibt nur die Aktivität, nicht die Verbesserung belegt.' },
    laws: ['GewO 1994', 'MaklerG', 'Standesrecht', 'DSGVO/DSG'], boundaries: ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'],
  }],
]

const completionRule = 'Abgeschlossen, wenn der Fall ohne erfundene Fakten bearbeitet, die Entscheidung anhand des Frameworks begründet, alle offenen Rechts- und Vertragsfragen mit dem passenden Gate markiert und der nächste Prüfschritt benannt ist.'

export const learningOutcomes = outcomeDefinitions.map(([id, area, title, content]) => {
  const officialLocators = outcomeSlots.filter((slot) => slot.outcomeId === id).map((slot) => slot.sourceLocator)
  return {
    id,
    area,
    title,
    officialStatus: 'confirmed',
    courseStatus: 'derived',
    sourceId: WKO_SOURCE_ID,
    course: {
      ichKann: content.ichKann,
      decisionFramework: content.decisionFramework,
      workflow: content.workflow,
      commonErrors: content.commonErrors,
      microCase: content.microCase,
      selfCheck: content.selfCheck,
      sourceRefs: [
        ...officialLocators.map((locator) => ({ sourceId: WKO_SOURCE_ID, locator })),
        ...content.laws.map((name) => ({ name, status: 'current-text-must-be-verified' })),
      ],
      boundaries: content.boundaries,
      completionRule,
    },
  }
})

export const examRules = {
  sourceId: WKO_SOURCE_ID,
  effectiveFrom: '2024-07-01',
  officialStatus: 'confirmed',
  selection: {
    minimumSelectedOutcomesPerSubject: 3,
    rule: 'In jedem Prüfungsgegenstand sind mindestens drei Lernergebnisse auszuwählen.',
    simultaneousSubjects: 'Besteht ein Modul aus mehreren Gegenständen, ist dieses Modul auf einmal abzulegen.',
  },
  aids: {
    allowed: ['Unkommentierte gedruckte Ausgaben der für den Gegenstand relevanten Rechtsvorschriften.'],
    prohibited: ['Bücher', 'sonstige gedruckte Lernbehelfe', 'elektronische Hilfsmittel'],
    committeeCaveat: 'Die Prüfungskommission kann auch unkommentierte gedruckte Rechtsvorschriften von der Verwendung ausschließen, wenn diese für die zweifelsfreie Bewertung der zu erbringenden Lernergebnisse nicht geeignet sind.',
  },
  grading: ['Sehr gut', 'Gut', 'Befriedigend', 'Genügend', 'Nicht genügend'],
  passing: {
    module1: 'Modul 1 ist bestanden, wenn beide Prüfungsgegenstände mindestens mit „Genügend“ beurteilt wurden.',
    module2: 'Modul 2 ist bestanden, wenn beide Prüfungsgegenstände mindestens mit „Genügend“ beurteilt wurden.',
    repetition: 'Bei einer Wiederholung sind nur die mit „Nicht genügend“ beurteilten Prüfungsgegenstände zu wiederholen.',
  },
  exemptions: {
    module1: [
      'Beide schriftlichen Prüfungsgegenstände entfallen bei einem qualifizierenden Studium mit mindestens 30 ECTS-Anrechnungspunkten in den von der BPO bezeichneten Themenbereichen; die konkrete Anerkennung ist CURRENT_AUTHORITY_REQUIRED.',
      'Beide schriftlichen Prüfungsgegenstände entfallen bei vollständig abgelegter Befähigungsprüfung für Versicherungsagenten; die konkrete Anerkennung ist CURRENT_AUTHORITY_REQUIRED.',
    ],
    module2: 'Keine Ausnahmebestimmung in der BPO.',
  },
  branchBalance: 'Die Prüfungsaufgaben sind tunlichst ausgewogen aus Versicherungszweigen gemäß Anlage A § 7 Abs. 4 VAG 2016 zu wählen; die aktuelle Fassung und Zuordnung ist CURRENT_AUTHORITY_REQUIRED.',
  scope: {
    included: ['Modul 1', 'Modul 2'],
    excluded: ['Modul 3'],
    note: 'Modul 3 (Unternehmerprüfung) besteht offiziell, ist aber ausdrücklich nicht Gegenstand dieser Lernanwendung.',
  },
}

const risUrl = (gesetzesnummer) => `https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=${gesetzesnummer}`

export const legalNavigator = [
  ['GewO', 'Gewerbeordnung 1994', '10007517', 'Gewerbeberechtigung, Berufsausübung und Informationspflichten'],
  ['MaklerG', 'Maklergesetz', '10003415', 'Maklervertrag, Interessenwahrung und Pflichten im Maklerverhältnis'],
  ['VersVG', 'Versicherungsvertragsgesetz', '10001979', 'Zustandekommen, Durchführung und Beendigung von Versicherungsverträgen'],
  ['VAG 2016', 'Versicherungsaufsichtsgesetz 2016', '20009095', 'Aufsichtsrecht und Versicherungszweige'],
  ['Standesrecht', 'Standes- und Ausübungsregeln für Versicherungsmakler und Berater in Versicherungsangelegenheiten', '20010682', 'Berufsbezogene Verhaltens- und Ausübungsregeln'],
  ['ABGB', 'Allgemeines bürgerliches Gesetzbuch', '10001622', 'Allgemeines Vertrags-, Schadenersatz- und Stellvertretungsrecht'],
  ['UGB', 'Unternehmensgesetzbuch', '10001702', 'Unternehmensrechtliche Grundlagen und Geschäftsverkehr'],
  ['KSchG', 'Konsumentenschutzgesetz', '10002462', 'Verbraucherverträge und besondere Schutzvorschriften'],
  ['DSGVO/DSG', 'Datenschutzgesetz', '10001597', 'Nationale Datenschutzregeln; die DSGVO ist zusätzlich unmittelbar zu prüfen'],
  ['UWG', 'Bundesgesetz gegen den unlauteren Wettbewerb 1984', '10002665', 'Lauterkeit, Werbung und geschäftliche Kommunikation'],
  ['ECG', 'E-Commerce-Gesetz', '20001703', 'Informations- und Kommunikationspflichten bei Online-Diensten'],
  ['TKG 2021', 'Telekommunikationsgesetz 2021', '20011678', 'Telekommunikation und elektronische Kommunikation'],
].map(([id, title, gesetzesnummer, learningUse]) => ({
  id,
  title,
  gesetzesnummer,
  url: risUrl(gesetzesnummer),
  authority: 'RIS – Bundesrecht konsolidiert',
  linkType: 'current-consolidated-entry',
  learningUse,
  boundary: 'CURRENT_AUTHORITY_REQUIRED',
  verificationNote: 'Vor Verwendung Stichtag, geltende Fassung und den für den Fall maßgeblichen Normtext im RIS prüfen.',
}))

export const spartenNavigator = [
  {
    id: 'sach', title: 'Sachversicherungen', boundary: 'CURRENT_AUTHORITY_REQUIRED',
    cautiousExamples: ['Gebäude und Inhalt', 'technische Sachen oder Anlagen', 'Transportgüter'],
    learningRoute: ['Schützenswerte Sache und Eigentums- oder Nutzungsinteresse bestimmen.', 'Konkretes Ereignis, Ursache und Sachschadenfolge modellieren.', 'Prävention, Bewertung und Selbsttragung prüfen.', 'Versicherte Gefahren, Ausschlüsse, Entschädigungslogik und Obliegenheiten im Originalvertrag prüfen.', 'Deckungsaussage erst nach aktueller Rechts- und Vertragsprüfung formulieren.'],
  },
  {
    id: 'personen', title: 'Personenversicherungen', boundary: 'CURRENT_AUTHORITY_REQUIRED',
    cautiousExamples: ['Leben', 'Unfall', 'Krankenversorgung'],
    learningRoute: ['Betroffene Person, Lebenssituation und wirtschaftliches Ziel klären.', 'Ereignis und finanzielle oder versorgungsbezogene Folge getrennt beschreiben.', 'Gesetzliche, betriebliche und private Vorsorge nur mit Belegen erfassen.', 'Leistungsauslöser, Gesundheitsangaben, Warte- oder Ausschlussregeln im konkreten Vertrag prüfen.', 'Keine allgemeine Leistungs- oder Bedarfsaussage ohne individuellen Fall und aktuelle Autorität treffen.'],
  },
  {
    id: 'vermoegen', title: 'Vermögensversicherungen', boundary: 'CURRENT_AUTHORITY_REQUIRED',
    cautiousExamples: ['Haftpflichtrisiken', 'Rechtsschutzkonstellationen', 'finanzielle Folgeschäden'],
    learningRoute: ['Möglichen Anspruch, Pflichtverstoß oder Vermögensnachteil als Mechanismus erfassen.', 'Beteiligte, Rechtsbeziehungen und betroffene Vermögenspositionen zuordnen.', 'Vermeidung, Vertragsgestaltung und Selbsttragung als Alternativen prüfen.', 'Versicherungsfall, Anspruchsabwehr, Ausschlüsse und zeitliche Zuordnung im Originalvertrag prüfen.', 'Rechtsfrage und Versicherungsdeckung getrennt mit CURRENT_AUTHORITY_REQUIRED und CONTRACT_CHECK_REQUIRED markieren.'],
  },
]
