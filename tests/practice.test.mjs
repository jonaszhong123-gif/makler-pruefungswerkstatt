import assert from 'node:assert/strict'
import test from 'node:test'
import { examSubjects, learningOutcomes, outcomeSlots } from '../src/data/curriculum.js'
import { caseFiles, oralQuestions, writtenQuestions } from '../src/data/practice.js'

const outcomeIds = new Set(learningOutcomes.map(({ id }) => id))
const outcomesById = new Map(learningOutcomes.map((outcome) => [outcome.id, outcome]))
const slotsById = new Map(outcomeSlots.map((slot) => [slot.id, slot]))
const subjectsById = new Map(examSubjects.map((subject) => [subject.id, subject]))
const expectedRubricDimensions = {
  written: ['fachlicheRichtigkeit', 'praxistauglichkeit'],
  oral: ['fachlicheRichtigkeit', 'praxistauglichkeit', 'schluessigeArgumentation'],
}
const expectedPrefixes = { 'M1-A': 'S6-', 'M1-B': 'S7-', 'M2-A': 'S9-', 'M2-B': 'S10-' }
const expectedWrittenMappings = [
  ['w-m1a-business-document', 'M1-A', 'S6-01', 'LO-03'],
  ['w-m1a-scope-agreement', 'M1-A', 'S6-02', 'LO-04'],
  ['w-m1a-private-information', 'M1-A', 'S6-03', 'LO-05'],
  ['w-m1a-commercial-information', 'M1-A', 'S6-04', 'LO-06'],
  ['w-m1a-risk-analysis', 'M1-A', 'S6-05', 'LO-07'],
  ['w-m1a-coverage-concept', 'M1-A', 'S6-06', 'LO-08'],
  ['w-m1a-policy-check', 'M1-A', 'S6-07', 'LO-09'],
  ['w-m1a-information-duties', 'M1-A', 'S6-08', 'LO-22'],
  ['w-m1b-policy-admin', 'M1-B', 'S7-01', 'LO-10'],
  ['w-m1b-claim-intake', 'M1-B', 'S7-02', 'LO-11'],
  ['w-m1b-claim-handling', 'M1-B', 'S7-03', 'LO-12'],
  ['w-m1b-broker-clause', 'M1-B', 'S7-04', 'LO-13'],
  ['w-m1b-sensitive-data', 'M1-B', 'S7-05', 'LO-15'],
  ['w-m1b-customer-termination', 'M1-B', 'S7-06', 'LO-16'],
  ['w-m1b-insurer-termination', 'M1-B', 'S7-07', 'LO-17'],
  ['w-m1b-spoken-termination-review', 'M1-B', 'S7-08', 'LO-18'],
]
const expectedOralMappings = [
  ['o-m2a-trade-registration', 'M2-A', 'S9-01', 'LO-01'],
  ['o-m2a-permission-boundary', 'M2-A', 'S9-02', 'LO-02'],
  ['o-m2a-business-document', 'M2-A', 'S9-03', 'LO-03'],
  ['o-m2a-scope-agreement', 'M2-A', 'S9-04', 'LO-04'],
  ['o-m2a-private-information', 'M2-A', 'S9-05', 'LO-05'],
  ['o-m2a-commercial-information', 'M2-A', 'S9-06', 'LO-06'],
  ['o-m2a-risk-analysis', 'M2-A', 'S9-07', 'LO-07'],
  ['o-m2a-coverage-concept', 'M2-A', 'S9-08', 'LO-08'],
  ['o-m2a-policy-check', 'M2-A', 'S9-09', 'LO-09'],
  ['o-m2a-ethics', 'M2-A', 'S9-10', 'LO-19'],
  ['o-m2a-product-development', 'M2-A', 'S9-11', 'LO-20'],
  ['o-m2a-self-complaint', 'M2-A', 'S9-12', 'LO-21'],
  ['o-m2a-information-duties', 'M2-A', 'S9-13', 'LO-22'],
  ['o-m2a-quality-system', 'M2-A', 'S9-14', 'LO-23'],
  ['o-m2b-policy-admin', 'M2-B', 'S10-01', 'LO-10'],
  ['o-m2b-claim-intake', 'M2-B', 'S10-02', 'LO-11'],
  ['o-m2b-claim-handling', 'M2-B', 'S10-03', 'LO-12'],
  ['o-m2b-broker-clause', 'M2-B', 'S10-04', 'LO-13'],
  ['o-m2b-insurer-complaint', 'M2-B', 'S10-05', 'LO-14'],
  ['o-m2b-customer-termination', 'M2-B', 'S10-06', 'LO-16'],
  ['o-m2b-insurer-termination', 'M2-B', 'S10-07', 'LO-17'],
  ['o-m2b-review-termination', 'M2-B', 'S10-08', 'LO-18'],
]

const normalize = (value) => value.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('de-AT')
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const assertUniqueIds = (items, label) => {
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length, `${label} IDs must be unique`)
}

const assertMappings = (item) => {
  assert.ok(Array.isArray(item.outcomeIds) && item.outcomeIds.length > 0, `${item.id} outcomes`)
  assert.ok(Array.isArray(item.slotIds) && item.slotIds.length > 0, `${item.id} slots`)
  assert.equal(new Set(item.outcomeIds).size, item.outcomeIds.length, `${item.id} outcome IDs must not repeat`)
  assert.equal(new Set(item.slotIds).size, item.slotIds.length, `${item.id} slot IDs must not repeat`)
  assert.ok(item.outcomeIds.every((id) => outcomeIds.has(id)), `${item.id} uses a known outcome`)
  assert.ok(item.slotIds.every((id) => slotsById.has(id)), `${item.id} uses a known slot`)

  const mappedOutcomes = [...new Set(item.slotIds.map((id) => slotsById.get(id).outcomeId))]
  assert.deepEqual(mappedOutcomes, item.outcomeIds, `${item.id} slot/outcome mapping must be exact and ordered`)
  assert.ok(item.slotIds.every((id) => slotsById.get(id).subjectId === item.module || item.moduleFocus?.includes(slotsById.get(id).subjectId)), `${item.id} slot/module mapping`)
}

const assertAssessmentTargets = (question, kind) => {
  assert.equal(question.slotIds.length, 1, `${question.id} must stay focused on one slot`)
  assert.equal(question.outcomeIds.length, 1, `${question.id} must stay focused on one outcome`)
  assert.ok(Array.isArray(question.assessmentTargets), `${question.id} assessment targets`)
  assert.equal(question.assessmentTargets.length, question.slotIds.length, `${question.id} one target per slot`)
  assert.deepEqual(question.assessmentTargets.map(({ slotId }) => slotId), question.slotIds, `${question.id} target slots`)
  assert.deepEqual(question.assessmentTargets.map(({ outcomeId }) => outcomeId), question.outcomeIds, `${question.id} target outcomes`)

  const subject = subjectsById.get(question.module)
  assert.ok(subject, `${question.id} subject`)
  assert.equal(subject.mode, kind === 'written' ? 'schriftlich' : 'mündlich', `${question.id} correct mode`)

  const visiblePoints = kind === 'written' ? question.referencePoints : question.observationPoints
  for (const target of question.assessmentTargets) {
    assert.deepEqual(Object.keys(target).sort(), ['evidence', 'outcomeId', 'slotId'], `${question.id} exact target keys`)
    assert.ok(nonEmptyString(target.evidence), `${question.id} target evidence`)
    const slot = slotsById.get(target.slotId)
    assert.ok(slot, `${question.id} target slot`)
    assert.equal(slot.subjectId, question.module, `${question.id} target subject`)
    assert.equal(slot.outcomeId, target.outcomeId, `${question.id} target outcome mapping`)
    assert.ok(target.slotId.startsWith(expectedPrefixes[question.module]), `${question.id} target prefix`)
    assert.ok(outcomesById.has(target.outcomeId), `${question.id} target known outcome`)
    assert.ok(normalize(question.prompt).includes(normalize(target.evidence)), `${question.id} evidence must be required by prompt`)
    assert.ok(visiblePoints.some((point) => normalize(point).includes(normalize(target.evidence))), `${question.id} evidence must be visible in assessment points`)
  }
}

const assertRubric = (question, dimensions) => {
  assert.deepEqual(Object.keys(question.rubric), dimensions, `${question.id} rubric dimensions`)
  for (const dimension of dimensions) {
    assert.deepEqual(Object.keys(question.rubric[dimension]), ['score0', 'score1', 'score2'])
    assert.ok(Object.values(question.rubric[dimension]).every((entries) => Array.isArray(entries) && entries.length > 0 && entries.every((entry) => entry.trim())))
  }
}

test('practice inventory contains substantial original written, oral and case material', () => {
  assert.equal(writtenQuestions.length, 16)
  assert.equal(oralQuestions.length, 22)
  assert.ok(caseFiles.length >= 9)
  assertUniqueIds(writtenQuestions, 'written')
  assertUniqueIds(oralQuestions, 'oral')
  assertUniqueIds(caseFiles, 'case')
  assert.ok([...writtenQuestions, ...oralQuestions].every((item) => item.provenance === 'original' && item.nonOfficial === true))
  assert.ok(caseFiles.every((item) => item.status === 'derived'))
})

test('every practice item maps exactly to source-confirmed outcomes and examination slots', () => {
  for (const item of [...writtenQuestions, ...oralQuestions, ...caseFiles]) assertMappings(item)
})

test('written and oral inventories retain their exact focused mappings', () => {
  const mapping = ({ id, module, slotIds, outcomeIds: mappedOutcomeIds }) => [id, module, slotIds[0], mappedOutcomeIds[0]]
  assert.deepEqual(writtenQuestions.map(mapping), expectedWrittenMappings)
  assert.deepEqual(oralQuestions.map(mapping), expectedOralMappings)
})

test('all 38 slots are assessed once in the correct written or oral mode', () => {
  const writtenTargetSlots = writtenQuestions.flatMap(({ assessmentTargets }) => assessmentTargets.map(({ slotId }) => slotId))
  const oralTargetSlots = oralQuestions.flatMap(({ assessmentTargets }) => assessmentTargets.map(({ slotId }) => slotId))
  const expectedWrittenSlots = expectedWrittenMappings.map(([, , slotId]) => slotId)
  const expectedOralSlots = expectedOralMappings.map(([, , slotId]) => slotId)

  assert.equal(new Set(writtenTargetSlots).size, writtenTargetSlots.length, 'written slots must not be overtagged')
  assert.equal(new Set(oralTargetSlots).size, oralTargetSlots.length, 'oral slots must not be overtagged')
  assert.deepEqual(writtenTargetSlots, expectedWrittenSlots)
  assert.deepEqual(oralTargetSlots, expectedOralSlots)
  assert.equal([...writtenTargetSlots, ...oralTargetSlots].length, 38)
  assert.deepEqual([...writtenTargetSlots, ...oralTargetSlots].sort(), outcomeSlots.map(({ id }) => id).sort())
  assert.ok(writtenTargetSlots.every((id) => id.startsWith('S6-') || id.startsWith('S7-')))
  assert.ok(oralTargetSlots.every((id) => id.startsWith('S9-') || id.startsWith('S10-')))
})

test('every written and oral item has an exact, visibly assessed target', () => {
  for (const question of writtenQuestions) assertAssessmentTargets(question, 'written')
  for (const question of oralQuestions) assertAssessmentTargets(question, 'oral')
})

test('written answers have a meaningful response gate and a two-dimensional 0-2 rubric', () => {
  for (const question of writtenQuestions) {
    assert.ok(question.minChars >= 120, `${question.id} minimum characters`)
    assert.ok(question.minUnits >= 2, `${question.id} minimum content units`)
    assert.ok(question.prompt.trim().length > 80, `${question.id} prompt`)
    assert.ok(question.referencePoints.length >= question.minUnits, `${question.id} reference points`)
    assertRubric(question, expectedRubricDimensions.written)
  }
})

test('oral attempts have timer/note gates, follow-ups, observation points and three-dimensional scoring', () => {
  for (const question of oralQuestions) {
    assert.ok(question.minSeconds >= 30, `${question.id} timer threshold`)
    assert.ok(question.minNoteChars >= 80, `${question.id} notes threshold`)
    assert.ok(question.prompt.trim().length > 60, `${question.id} prompt`)
    assert.ok(question.followUps.length >= 2, `${question.id} follow-ups`)
    assert.ok(question.observationPoints.length >= 3, `${question.id} observation points`)
    assertRubric(question, expectedRubricDimensions.oral)
  }
})

test('LO-10 formal prompts require an explicit external-change review decision and retain both gates', () => {
  const questions = [
    writtenQuestions.find(({ id }) => id === 'w-m1b-policy-admin'),
    oralQuestions.find(({ id }) => id === 'o-m2b-policy-admin'),
  ]

  for (const question of questions) {
    assert.ok(question, 'LO-10 formal question exists')
    assert.match(question.prompt, /externes (?:rechtliches|wirtschaftliches|gesellschaftliches) Veränderungssignal/i)
    assert.match(question.prompt, /entscheiden Sie ausdrücklich, ob .* eine Risiko- oder Vertragsprüfung auslöst/i)
    assert.match(question.prompt, /unbestätigt/i)
    assert.match(question.prompt, /ohne [^.]*aktuelle Rechts/i)
    assert.match(JSON.stringify(question), /CONTRACT_CHECK_REQUIRED/)
    assert.match(JSON.stringify(question), /CURRENT_AUTHORITY_REQUIRED/)
  }
})

test('LO-01 tests Gewerbeanmeldung and LO-05 stays with private customers', () => {
  const registrationQuestions = [...writtenQuestions, ...oralQuestions].filter(({ outcomeIds: ids }) => ids.includes('LO-01'))
  assert.equal(registrationQuestions.length, 1)
  assert.match(registrationQuestions[0].prompt, /Gewerbeanmeldung/i)

  const privateInformationQuestions = [...writtenQuestions, ...oralQuestions].filter(({ outcomeIds: ids }) => ids.includes('LO-05'))
  assert.equal(privateInformationQuestions.length, 2)
  assert.ok(privateInformationQuestions.every(({ prompt, tags }) => /Privatkund(?:e|in)/i.test(prompt) && tags.includes('Privatkunde') && !tags.includes('Gewerbekunde')))
})

test('case workshop requires a written output at every step', () => {
  const stepIds = []
  for (const caseFile of caseFiles) {
    assert.ok(caseFile.facts.length >= 3, `${caseFile.id} facts`)
    assert.ok(caseFile.gates.includes('CONTRACT_CHECK_REQUIRED vor Vertragsaussage'))
    assert.ok(caseFile.gates.some((gate) => gate.includes('CURRENT_AUTHORITY_REQUIRED')))
    assert.ok(caseFile.moduleFocus.every((id) => subjectsById.get(id)?.mode === 'schriftlich'), `${caseFile.id} written module focus`)
    assert.ok(caseFile.slotIds.every((id) => !/^S(?:9|10)-/.test(id)), `${caseFile.id} must not carry oral slots`)
    assert.ok(caseFile.slotIds.every((id) => subjectsById.get(slotsById.get(id).subjectId)?.mode === 'schriftlich'), `${caseFile.id} written slots`)
    assert.ok(caseFile.steps.length >= 3, `${caseFile.id} steps`)
    for (const step of caseFile.steps) {
      stepIds.push(step.id)
      assert.ok(step.minChars >= 100, `${step.id} output threshold`)
      assert.ok(step.taskPrompt.trim().length > 50, `${step.id} task prompt`)
      assert.ok(step.checklist.length >= 3, `${step.id} checklist`)
    }
  }
  assert.equal(new Set(stepIds).size, stepIds.length, 'case step IDs must be unique')
})

test('independently audited cases retain their exact conservative written mappings', () => {
  const privateFirst = caseFiles.find(({ id }) => id === 'case-privat-first')
  assert.deepEqual(privateFirst?.moduleFocus, ['M1-A'])
  assert.deepEqual(privateFirst?.outcomeIds, ['LO-04'])
  assert.deepEqual(privateFirst?.slotIds, ['S6-02'])

  const commercialOnboarding = caseFiles.find(({ id }) => id === 'case-gewerbe-onboarding')
  assert.deepEqual(commercialOnboarding?.moduleFocus, ['M1-A'])
  assert.deepEqual(commercialOnboarding?.outcomeIds, ['LO-06', 'LO-07'])
  assert.deepEqual(commercialOnboarding?.slotIds, ['S6-04', 'S6-05'])

  const healthData = caseFiles.find(({ id }) => id === 'case-health-data')
  assert.deepEqual(healthData?.moduleFocus, ['M1-B'])
  assert.deepEqual(healthData?.outcomeIds, ['LO-15'])
  assert.deepEqual(healthData?.slotIds, ['S7-05'])
})

test('original material spans all required customer and insurance branches', () => {
  const tags = new Set([...writtenQuestions, ...oralQuestions, ...caseFiles].flatMap((item) => item.tags))
  for (const required of ['Privatkunde', 'Gewerbekunde', 'Sach', 'Haftpflicht', 'Kfz', 'Rechtsschutz', 'Leben', 'Kranken', 'Unfall']) {
    assert.ok(tags.has(required), `missing ${required}`)
  }
})

test('M1-B and M2-B stay in ongoing customer care and cover the required lifecycle topics', () => {
  const ongoingQuestions = [...writtenQuestions, ...oralQuestions].filter((item) => ['M1-B', 'M2-B'].includes(item.module))
  assert.ok(ongoingQuestions.length > 0)
  assert.ok(ongoingQuestions.every((item) => item.tags.includes('ongoing_service')))
  assert.ok(ongoingQuestions.every((item) => !item.tags.includes('acquisition') && !item.tags.includes('onboarding')))

  const tags = new Set(ongoingQuestions.flatMap((item) => item.tags))
  for (const topic of [
    'Polizzenverwaltung',
    'Schadenaufnahme',
    'Schadenmeldung',
    'Schadenbearbeitung',
    'Schadenabwicklung',
    'Maklerklauseln',
    'sensible Daten',
    'Beschwerde Versicherer',
    'Kündigung durch Kunden',
    'Kündigung durch Versicherer',
    'Bewertung Kundenkündigung',
  ]) assert.ok(tags.has(topic), `missing ongoing topic ${topic}`)

  assert.ok(writtenQuestions.filter(({ module }) => module === 'M1-B').every((item) => item.slotIds.every((id) => id.startsWith('S7-'))))
  assert.ok(oralQuestions.filter(({ module }) => module === 'M2-B').every((item) => item.slotIds.every((id) => id.startsWith('S10-'))))
})
