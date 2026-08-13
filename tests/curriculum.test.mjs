import assert from 'node:assert/strict'
import test from 'node:test'
import {
  examRules,
  examSubjects,
  learningOutcomes,
  outcomeSlots,
} from '../src/data/curriculum.js'

const expectedSubjects = [
  ['M1-A', 'Modul 1', 'schriftlich', '§ 6', 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement schriftlich'],
  ['M1-B', 'Modul 1', 'schriftlich', '§ 7', 'Laufende Kundenbetreuung schriftlich'],
  ['M2-A', 'Modul 2', 'mündlich', '§ 9', 'Geschäftsgrundlagen, Vertragsanbahnung und Qualitätsmanagement mündlich'],
  ['M2-B', 'Modul 2', 'mündlich', '§ 10', 'Laufende Kundenbetreuung mündlich'],
]

const expectedSlotPlan = {
  'M1-A': ['LO-03', 'LO-04', 'LO-05', 'LO-06', 'LO-07', 'LO-08', 'LO-09', 'LO-22'],
  'M1-B': ['LO-10', 'LO-11', 'LO-12', 'LO-13', 'LO-15', 'LO-16', 'LO-17', 'LO-18'],
  'M2-A': ['LO-01', 'LO-02', 'LO-03', 'LO-04', 'LO-05', 'LO-06', 'LO-07', 'LO-08', 'LO-09', 'LO-19', 'LO-20', 'LO-21', 'LO-22', 'LO-23'],
  'M2-B': ['LO-10', 'LO-11', 'LO-12', 'LO-13', 'LO-14', 'LO-16', 'LO-17', 'LO-18'],
}

const expectedOutcomeTitles = [
  ['LO-01', 'selbstständig ein Gewerbe als Versicherungsmakler anzumelden'],
  ['LO-02', 'seinen/ihren Berechtigungsumfang in Abgrenzung zu anderen Berufsgruppen mit Versicherungsbezug (zB Versicherungsagenten, gewerbliche Vermögensberater) einzuhalten'],
  ['LO-03', 'Geschäftsunterlagen für seine/ihre Tätigkeit als Versicherungsmakler/Versicherungsmaklerin zu erarbeiten'],
  ['LO-04', 'den Umfang seiner/ihrer Maklertätigkeit mit dem Kunden zu vereinbaren'],
  ['LO-05', 'relevante Informationen eines Privatkunden zu erheben'],
  ['LO-06', 'relevante Informationen eines Gewerbekunden bzw. Freiberuflers/einer Freiberuflerin zu erheben'],
  ['LO-07', 'eine Risikoanalyse durchzuführen'],
  ['LO-08', 'ein Deckungskonzept für Kunden zu entwickeln'],
  ['LO-09', 'die vom Versicherer ausgestellte Polizze zu prüfen'],
  ['LO-10', 'die Polizzen des Kunden zu verwalten'],
  ['LO-11', 'Schadensfälle aufzunehmen und beim Versicherer zu melden'],
  ['LO-12', 'Schadensfälle für den Versicherungsnehmer zu bearbeiten und abzuwickeln'],
  ['LO-13', 'den Versicherungsschutz durch Hinzunahme individueller Maklerklauseln zu optimieren'],
  ['LO-14', 'Beschwerden von Kunden über einen Versicherer zu bearbeiten'],
  ['LO-15', 'mit persönlichen und sensiblen Daten von Kunden umzugehen'],
  ['LO-16', 'Kündigungen von Verträgen durch den Kunden rechtskonform vorzunehmen'],
  ['LO-17', 'Kündigungen durch den Versicherer zu beurteilen'],
  ['LO-18', 'eine vom Kunden ausgesprochene Kündigung eines Versicherungsvertrages zu beurteilen'],
  ['LO-19', 'ethische Grundsätze in seiner Geschäftstätigkeit zu definieren und einzuhalten'],
  ['LO-20', 'durch dynamische Produktentwicklung für die Weiterentwicklung des Versicherungswesens zu sorgen'],
  ['LO-21', 'Beschwerden über sich zu bearbeiten'],
  ['LO-22', 'gesetzliche Informationspflichten einzuhalten'],
  ['LO-23', 'Maßnahmen zur Qualitätssicherung und -optimierung für die Kundenberatung zu implementieren'],
]

const expectedSlots = [
  ['S6-01', 'M1-A', '§ 6', 1, 'LO-03', '§ 6 Abs. 1 Z 1'],
  ['S6-02', 'M1-A', '§ 6', 2, 'LO-04', '§ 6 Abs. 1 Z 2'],
  ['S6-03', 'M1-A', '§ 6', 3, 'LO-05', '§ 6 Abs. 1 Z 3'],
  ['S6-04', 'M1-A', '§ 6', 4, 'LO-06', '§ 6 Abs. 1 Z 4'],
  ['S6-05', 'M1-A', '§ 6', 5, 'LO-07', '§ 6 Abs. 1 Z 5'],
  ['S6-06', 'M1-A', '§ 6', 6, 'LO-08', '§ 6 Abs. 1 Z 6'],
  ['S6-07', 'M1-A', '§ 6', 7, 'LO-09', '§ 6 Abs. 1 Z 7'],
  ['S6-08', 'M1-A', '§ 6', 8, 'LO-22', '§ 6 Abs. 1 Z 8'],
  ['S7-01', 'M1-B', '§ 7', 1, 'LO-10', '§ 7 Abs. 1 Z 1'],
  ['S7-02', 'M1-B', '§ 7', 2, 'LO-11', '§ 7 Abs. 1 Z 2'],
  ['S7-03', 'M1-B', '§ 7', 3, 'LO-12', '§ 7 Abs. 1 Z 3'],
  ['S7-04', 'M1-B', '§ 7', 4, 'LO-13', '§ 7 Abs. 1 Z 4'],
  ['S7-05', 'M1-B', '§ 7', 5, 'LO-15', '§ 7 Abs. 1 Z 5'],
  ['S7-06', 'M1-B', '§ 7', 6, 'LO-16', '§ 7 Abs. 1 Z 6'],
  ['S7-07', 'M1-B', '§ 7', 7, 'LO-17', '§ 7 Abs. 1 Z 7'],
  ['S7-08', 'M1-B', '§ 7', 8, 'LO-18', '§ 7 Abs. 1 Z 8'],
  ['S9-01', 'M2-A', '§ 9', 1, 'LO-01', '§ 9 Abs. 1 Z 1'],
  ['S9-02', 'M2-A', '§ 9', 2, 'LO-02', '§ 9 Abs. 1 Z 2'],
  ['S9-03', 'M2-A', '§ 9', 3, 'LO-03', '§ 9 Abs. 1 Z 3'],
  ['S9-04', 'M2-A', '§ 9', 4, 'LO-04', '§ 9 Abs. 1 Z 4'],
  ['S9-05', 'M2-A', '§ 9', 5, 'LO-05', '§ 9 Abs. 1 Z 5'],
  ['S9-06', 'M2-A', '§ 9', 6, 'LO-06', '§ 9 Abs. 1 Z 6'],
  ['S9-07', 'M2-A', '§ 9', 7, 'LO-07', '§ 9 Abs. 1 Z 7'],
  ['S9-08', 'M2-A', '§ 9', 8, 'LO-08', '§ 9 Abs. 1 Z 8'],
  ['S9-09', 'M2-A', '§ 9', 9, 'LO-09', '§ 9 Abs. 1 Z 9'],
  ['S9-10', 'M2-A', '§ 9', 10, 'LO-19', '§ 9 Abs. 1 Z 10'],
  ['S9-11', 'M2-A', '§ 9', 11, 'LO-20', '§ 9 Abs. 1 Z 11'],
  ['S9-12', 'M2-A', '§ 9', 12, 'LO-21', '§ 9 Abs. 1 Z 12'],
  ['S9-13', 'M2-A', '§ 9', 13, 'LO-22', '§ 9 Abs. 1 Z 13'],
  ['S9-14', 'M2-A', '§ 9', 14, 'LO-23', '§ 9 Abs. 1 Z 14'],
  ['S10-01', 'M2-B', '§ 10', 1, 'LO-10', '§ 10 Abs. 1 Z 1'],
  ['S10-02', 'M2-B', '§ 10', 2, 'LO-11', '§ 10 Abs. 1 Z 2'],
  ['S10-03', 'M2-B', '§ 10', 3, 'LO-12', '§ 10 Abs. 1 Z 3'],
  ['S10-04', 'M2-B', '§ 10', 4, 'LO-13', '§ 10 Abs. 1 Z 4'],
  ['S10-05', 'M2-B', '§ 10', 5, 'LO-14', '§ 10 Abs. 1 Z 5'],
  ['S10-06', 'M2-B', '§ 10', 6, 'LO-16', '§ 10 Abs. 1 Z 6'],
  ['S10-07', 'M2-B', '§ 10', 7, 'LO-17', '§ 10 Abs. 1 Z 7'],
  ['S10-08', 'M2-B', '§ 10', 8, 'LO-18', '§ 10 Abs. 1 Z 8'],
]

const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const nonEmptyStrings = (value) => Array.isArray(value) && value.length > 0 && value.every(nonEmptyString)

test('curriculum exposes the four official Modul 1/2 subjects exactly', () => {
  assert.equal(examSubjects.length, 4)
  assert.deepEqual(
    examSubjects.map(({ id, module, mode, paragraph, title }) => [id, module, mode, paragraph, title]),
    expectedSubjects,
  )
  assert.ok(examSubjects.every((subject) => subject.sourceId === 'wko-bpo-2024'))
  assert.ok(examSubjects.every((subject) => subject.officialStatus === 'confirmed'))
})

test('all 38 examination slots follow the source-confirmed 8/8/14/8 mapping', () => {
  assert.equal(outcomeSlots.length, 38)
  assert.equal(new Set(outcomeSlots.map(({ id }) => id)).size, 38)

  for (const [subjectId, expectedOutcomes] of Object.entries(expectedSlotPlan)) {
    const slots = outcomeSlots.filter((slot) => slot.subjectId === subjectId)
    assert.equal(slots.length, expectedOutcomes.length, `${subjectId} slot count`)
    assert.deepEqual(slots.map(({ outcomeId }) => outcomeId), expectedOutcomes, `${subjectId} outcome order`)
    assert.deepEqual(slots.map(({ ordinal }) => ordinal), expectedOutcomes.map((_, index) => index + 1))
    assert.ok(slots.every((slot) => slot.sourceId === 'wko-bpo-2024'))
    assert.ok(slots.every((slot) => nonEmptyString(slot.sourceLocator)))
  }

  assert.deepEqual(
    outcomeSlots.map(({ id, subjectId, paragraph, ordinal, outcomeId, sourceLocator }) => [id, subjectId, paragraph, ordinal, outcomeId, sourceLocator]),
    expectedSlots,
  )

  const subjectsById = new Map(examSubjects.map((subject) => [subject.id, subject]))
  for (const slot of outcomeSlots) {
    const subject = subjectsById.get(slot.subjectId)
    assert.ok(subject, `${slot.id} subject`)
    assert.equal(slot.paragraph, subject.paragraph, `${slot.id} paragraph`)
    assert.equal(subject.mode, slot.id.startsWith('S6-') || slot.id.startsWith('S7-') ? 'schriftlich' : 'mündlich', `${slot.id} mode`)
  }
})

test('all 23 source-confirmed outcomes retain their exact titles and contain a complete original lesson', () => {
  assert.equal(learningOutcomes.length, 23)
  assert.equal(new Set(learningOutcomes.map(({ id }) => id)).size, 23)
  assert.deepEqual(learningOutcomes.map(({ id }) => id), Array.from({ length: 23 }, (_, index) => `LO-${String(index + 1).padStart(2, '0')}`))
  assert.deepEqual(learningOutcomes.map(({ id, title }) => [id, title]), expectedOutcomeTitles)

  for (const outcome of learningOutcomes) {
    assert.ok(nonEmptyString(outcome.area), `${outcome.id} area`)
    assert.ok(nonEmptyString(outcome.title), `${outcome.id} title`)
    assert.equal(outcome.officialStatus, 'confirmed')
    assert.equal(outcome.courseStatus, 'derived')
    assert.equal(outcome.sourceId, 'wko-bpo-2024')

    const { course } = outcome
    assert.ok(nonEmptyString(course.ichKann), `${outcome.id} Ich kann`)
    assert.ok(nonEmptyString(course.decisionFramework?.title), `${outcome.id} framework title`)
    assert.ok(nonEmptyStrings(course.decisionFramework?.points), `${outcome.id} framework points`)
    assert.ok(nonEmptyStrings(course.workflow), `${outcome.id} workflow`)
    assert.ok(nonEmptyStrings(course.commonErrors), `${outcome.id} common errors`)
    assert.ok(nonEmptyString(course.microCase?.title), `${outcome.id} microcase title`)
    assert.ok(nonEmptyString(course.microCase?.situation), `${outcome.id} microcase situation`)
    assert.ok(nonEmptyString(course.microCase?.task), `${outcome.id} microcase task`)
    assert.ok(nonEmptyStrings(course.microCase?.walkthrough), `${outcome.id} microcase walkthrough`)

    const check = course.selfCheck
    assert.ok(nonEmptyString(check?.question), `${outcome.id} self-check question`)
    assert.ok(nonEmptyStrings(check?.options) && check.options.length >= 2, `${outcome.id} self-check options`)
    assert.ok(Number.isInteger(check.correctIndex) && check.correctIndex >= 0 && check.correctIndex < check.options.length, `${outcome.id} self-check answer`)
    assert.ok(nonEmptyString(check.explanation), `${outcome.id} self-check explanation`)

    assert.ok(Array.isArray(course.sourceRefs) && course.sourceRefs.length >= 2, `${outcome.id} sources`)
    assert.ok(course.sourceRefs.some((source) => source.sourceId === 'wko-bpo-2024' && nonEmptyString(source.locator)), `${outcome.id} official source`)
    assert.ok(course.sourceRefs.some((source) => source.status === 'current-text-must-be-verified'), `${outcome.id} current-law source gate`)
    assert.ok(nonEmptyStrings(course.boundaries), `${outcome.id} boundaries`)
    assert.ok(course.boundaries.every((boundary) => ['CURRENT_AUTHORITY_REQUIRED', 'CONTRACT_CHECK_REQUIRED'].includes(boundary)), `${outcome.id} valid boundaries`)
    assert.ok(nonEmptyString(course.completionRule), `${outcome.id} completion rule`)
  }
})

test('exam rules encode the current Modul 1/2 constraints and exclude Modul 3', () => {
  assert.equal(examRules.officialStatus, 'confirmed')
  assert.equal(examRules.sourceId, 'wko-bpo-2024')
  assert.equal(examRules.selection.minimumSelectedOutcomesPerSubject, 3)
  assert.match(examRules.selection.simultaneousSubjects, /auf einmal abzulegen/i)
  assert.ok(examRules.aids.allowed.some((entry) => /unkommentierte gedruckte.*Rechtsvorschriften/i.test(entry)))
  assert.ok(examRules.aids.prohibited.some((entry) => /Bücher/i.test(entry)))
  assert.ok(examRules.aids.prohibited.some((entry) => /gedruckte Lernbehelfe/i.test(entry)))
  assert.ok(examRules.aids.prohibited.some((entry) => /elektronische Hilfsmittel/i.test(entry)))
  assert.match(examRules.aids.committeeCaveat, /Prüfungskommission/i)
  assert.match(examRules.aids.committeeCaveat, /unkommentierte gedruckte Rechtsvorschriften/i)
  assert.match(examRules.aids.committeeCaveat, /ausschließen/i)
  assert.match(examRules.aids.committeeCaveat, /zweifelsfreie Bewertung der zu erbringenden Lernergebnisse/i)
  assert.doesNotMatch(examRules.aids.committeeCaveat, /für den Prüfungsgegenstand als nicht geeignet/i)
  assert.deepEqual(examRules.grading, ['Sehr gut', 'Gut', 'Befriedigend', 'Genügend', 'Nicht genügend'])
  assert.match(examRules.passing.module1, /beide Prüfungsgegenstände.*Genügend/i)
  assert.match(examRules.passing.module2, /beide Prüfungsgegenstände.*Genügend/i)
  assert.match(examRules.passing.repetition, /nur die.*Nicht genügend.*Prüfungsgegenstände/i)
  assert.equal(examRules.exemptions.module1.length, 2)
  assert.ok(examRules.exemptions.module1.some((entry) => /30 ECTS/i.test(entry)))
  assert.ok(examRules.exemptions.module1.some((entry) => /Versicherungsagenten/i.test(entry)))
  assert.match(examRules.branchBalance, /\btunlichst\b.*ausgewogen.*Versicherungszweigen.*VAG 2016/i)
  assert.deepEqual(examRules.scope.included, ['Modul 1', 'Modul 2'])
  assert.deepEqual(examRules.scope.excluded, ['Modul 3'])
  assert.match(examRules.scope.note, /Unternehmerprüfung.*nicht Gegenstand/i)
})

test('LO-10 teaches the full ongoing policy-management cycle', () => {
  const lesson = JSON.stringify(learningOutcomes.find(({ id }) => id === 'LO-10')?.course)
  assert.match(lesson, /externe.*Veränderungen/i)
  assert.match(lesson, /Risiken.*(?:periodisch|turnusmäßig)|(?:periodisch|turnusmäßig).*Risiken/i)
  assert.match(lesson, /Indizes|Indexentwicklungen/i)
  assert.match(lesson, /Änderungs- oder Verbesserungsvorschläge/i)
  assert.match(lesson, /Verzug mit Folgeprämien/i)
})

test('LO-20 teaches development monitoring and adaptation paths', () => {
  const lesson = JSON.stringify(learningOutcomes.find(({ id }) => id === 'LO-20')?.course)
  assert.match(lesson, /internationale/i)
  assert.match(lesson, /rechtliche/i)
  assert.match(lesson, /wirtschaftliche/i)
  assert.match(lesson, /gesellschaftliche/i)
  assert.match(lesson, /Anpassung von Produkten oder Klauseln/i)
})
