import assert from 'node:assert/strict'
import test from 'node:test'
import {
  attachLegacyV1,
  createInitialProgress,
  exportProgress,
  failedRubricDimensionLabels,
  parseProgress,
  reviewDueForScores,
  STORAGE_KEY,
  toggleArrayItem,
  upsertReviewItem,
} from '../src/utils/progress.js'

test('v2 progress starts with explicit learning, practice and review surfaces', () => {
  const progress = createInitialProgress()
  assert.equal(progress.version, 2)
  assert.deepEqual(progress.completedLessons, [])
  assert.deepEqual(progress.lessonChecks, {})
  assert.deepEqual(progress.caseOutputs, {})
  assert.deepEqual(progress.writtenAttempts, {})
  assert.deepEqual(progress.oralAttempts, {})
  assert.deepEqual(progress.reviewQueue, [])
  assert.equal(progress.legacyV1, null)
  assert.match(STORAGE_KEY, /\.v2$/)
})

test('array toggles and queue upserts stay deterministic', () => {
  assert.deepEqual(toggleArrayItem([], 'LO-01'), ['LO-01'])
  assert.deepEqual(toggleArrayItem(['LO-01'], 'LO-01'), [])
  const first = { id: 'written-w1', kind: 'written', sourceId: 'w1', label: 'alt', due: 'später', createdAt: null }
  const newer = { ...first, label: 'neu', due: 'jetzt' }
  assert.deepEqual(upsertReviewItem([first], newer), [newer])
})

test('valid v2 data round-trips through export and parser', () => {
  const progress = createInitialProgress()
  progress.lessonChecks['LO-01'] = {
    selectedIndex: 2,
    correct: true,
    attempts: 1,
    checkedAt: '2026-08-13T10:00:00.000Z',
  }
  progress.writtenAttempts.w1 = {
    revealed: true,
    attempts: 1,
    scores: { fachlicheRichtigkeit: 2, praxistauglichkeit: 1 },
    submittedAt: '2026-08-13T10:01:00.000Z',
    completedAt: '2026-08-13T10:02:00.000Z',
  }
  progress.oralAttempts.o1 = {
    revealed: false,
    attempts: 0,
    elapsedSeconds: 35,
    scores: {},
    submittedAt: null,
    completedAt: null,
  }
  const parsed = parseProgress(exportProgress(progress))
  assert.deepEqual(parsed, progress)
  assert.notEqual(parsed.writtenAttempts, progress.writtenAttempts)
})

const legacyProgress = () => ({
  version: 1,
  completedLessons: ['scope-before-product', 'risk-chain'],
  completedCaseSteps: ['facts', 'missing'],
  writtenAnswers: { 'w-structure': 'Fakten, Lücken und Ableitungen bleiben getrennt.' },
  writtenReviewed: ['w-structure'],
  oralAssessments: { 'o-opening': 'klar und systematisch' },
  mistakes: [{ id: 'm1', code: 'K1', context: 'Alt', createdAt: '2026-08-12T10:00:00.000Z', extra: 'drop me' }],
  reviewQueue: [
    { id: 'lesson-scope', kind: 'lesson', sourceId: 'scope-before-product', label: 'Auftrag vor Produkt', due: 'später', extra: 'drop me' },
    { id: 'case-facts', kind: 'case', sourceId: 'facts', label: 'Fakten', due: 'als Nächstes' },
    { id: 'written-structure', kind: 'written', sourceId: 'w-structure', label: 'Sachverhalt strukturieren', due: 'jetzt' },
    { id: 'oral-opening', kind: 'oral', sourceId: 'o-opening', label: 'Gesprächseröffnung', due: 'jetzt' },
  ],
  notes: { frei: 'Historische Notiz' },
  untrustedExtra: 'drop me',
})

const sanitizedLegacyArchive = {
  version: 1,
  completedLessons: ['scope-before-product', 'risk-chain'],
  completedCaseSteps: ['facts', 'missing'],
  writtenAnswers: { 'w-structure': 'Fakten, Lücken und Ableitungen bleiben getrennt.' },
  writtenReviewed: ['w-structure'],
  oralAssessments: { 'o-opening': 'klar und systematisch' },
  mistakes: [{ id: 'm1', code: 'K1', context: 'Alt', createdAt: '2026-08-12T10:00:00.000Z' }],
  reviewQueue: [
    { id: 'lesson-scope', kind: 'lesson', sourceId: 'scope-before-product', label: 'Auftrag vor Produkt', due: 'später' },
    { id: 'case-facts', kind: 'case', sourceId: 'facts', label: 'Fakten', due: 'als Nächstes' },
    { id: 'written-structure', kind: 'written', sourceId: 'w-structure', label: 'Sachverhalt strukturieren', due: 'jetzt' },
    { id: 'oral-opening', kind: 'oral', sourceId: 'o-opening', label: 'Gesprächseröffnung', due: 'jetzt' },
  ],
  notes: { frei: 'Historische Notiz' },
}

const activeProgress = (progress) => {
  const { legacyV1: _legacyV1, ...active } = progress
  return active
}

const currentCompletionCount = (progress) => progress.completedLessons.length
  + progress.completedCaseSteps.length
  + Object.values(progress.writtenAttempts).filter((attempt) => attempt.completedAt !== null).length
  + Object.values(progress.oralAttempts).filter((attempt) => attempt.completedAt !== null).length

test('v1 migration archives every sanitized historical value without fabricating v2 progress', () => {
  const migrated = parseProgress(JSON.stringify(legacyProgress()))
  assert.deepEqual(activeProgress(migrated), activeProgress(createInitialProgress()))
  assert.equal(currentCompletionCount(migrated), 0)
  assert.deepEqual(migrated.legacyV1, sanitizedLegacyArchive)
})

test('migration and v2 export/import preserve the full sanitized historical archive', () => {
  const migrated = parseProgress(JSON.stringify(legacyProgress()))
  const imported = parseProgress(exportProgress(migrated))
  assert.deepEqual(imported, migrated)
  assert.deepEqual(imported.legacyV1, sanitizedLegacyArchive)
  assert.equal(currentCompletionCount(imported), 0)
})

test('valid legacy beside current v2 only attaches its archive and preserves current IDs', () => {
  const current = createInitialProgress()
  current.completedLessons = ['LO-23']
  current.lessonChecks = {
    'LO-23': { selectedIndex: 1, correct: true, attempts: 1, checkedAt: '2026-08-13T10:00:00.000Z' },
  }
  current.completedCaseSteps = ['p1-s1']
  current.caseOutputs = { 'p1-s1': 'Aktueller Falloutput' }
  current.writtenAnswers = { 'w-m1a-business-document': 'Aktuelle Antwort' }
  current.writtenAttempts = {
    'w-m1a-business-document': {
      revealed: true,
      attempts: 1,
      scores: { fachlicheRichtigkeit: 2, praxistauglichkeit: 2 },
      submittedAt: '2026-08-13T10:01:00.000Z',
      completedAt: '2026-08-13T10:02:00.000Z',
    },
  }
  current.oralNotes = { 'o-m2a-trade-registration': 'Aktuelle Notiz' }
  current.oralAttempts = {
    'o-m2a-trade-registration': {
      revealed: true,
      attempts: 1,
      elapsedSeconds: 90,
      scores: { fachlicheRichtigkeit: 2, praxistauglichkeit: 2, schluessigeArgumentation: 2 },
      submittedAt: '2026-08-13T10:03:00.000Z',
      completedAt: '2026-08-13T10:04:00.000Z',
    },
  }
  current.mistakes = [{
    id: 'current-mistake',
    code: 'N1',
    context: 'Aktueller Kontext',
    kind: 'oral',
    sourceId: 'o-m2a-trade-registration',
    createdAt: '2026-08-13T10:05:00.000Z',
  }]
  current.reviewQueue = [{
    id: 'written-current', kind: 'written', sourceId: 'w-m1a-business-document', label: 'Aktuell', due: 'jetzt', createdAt: null,
  }]
  current.notes = { current: 'Aktuelle freie Notiz' }

  const attached = attachLegacyV1(current, JSON.stringify(legacyProgress()))
  assert.deepEqual(activeProgress(attached), activeProgress(current))
  assert.deepEqual(attached.legacyV1, sanitizedLegacyArchive)

  const imported = parseProgress(exportProgress(attached))
  assert.deepEqual(imported, attached)
  assert.deepEqual(activeProgress(imported), activeProgress(current))
  assert.deepEqual(imported.legacyV1, sanitizedLegacyArchive)
  assert.equal(currentCompletionCount(imported), 4)
})

test('current v2 without the newly introduced archive field remains importable', () => {
  const current = createInitialProgress()
  current.completedLessons = ['LO-23']
  delete current.legacyV1
  assert.deepEqual(parseProgress(JSON.stringify(current)).completedLessons, ['LO-23'])
  assert.equal(parseProgress(JSON.stringify(current)).legacyV1, null)
})

test('invalid enums, dates and score values fail closed', () => {
  const invalidDue = createInitialProgress()
  invalidDue.reviewQueue.push({ id: 'x', kind: 'written', sourceId: 'w', label: 'x', due: 'morgen', createdAt: null })
  assert.throws(() => parseProgress(JSON.stringify(invalidDue)), /Ungültige/)

  const invalidScore = createInitialProgress()
  invalidScore.writtenAttempts.w1 = {
    revealed: true,
    attempts: 1,
    scores: { fachlicheRichtigkeit: 3 },
    submittedAt: null,
    completedAt: null,
  }
  assert.throws(() => parseProgress(JSON.stringify(invalidScore)), /Ungültige/)

  const invalidDate = createInitialProgress()
  invalidDate.lessonChecks['LO-01'] = { selectedIndex: 0, correct: false, attempts: 1, checkedAt: 'missing' }
  assert.throws(() => parseProgress(JSON.stringify(invalidDate)), /Ungültige/)
})

test('invalid legacy data fails closed instead of partially archiving', () => {
  const malformedMistake = legacyProgress()
  malformedMistake.mistakes[0].createdAt = 'not-a-date'
  assert.throws(() => parseProgress(JSON.stringify(malformedMistake)), /Fortschrittsdaten/)

  const malformedQueue = legacyProgress()
  malformedQueue.reviewQueue[0].due = 'morgen'
  const current = createInitialProgress()
  current.completedLessons = ['LO-23']
  const unchanged = attachLegacyV1(current, JSON.stringify(malformedQueue))
  assert.deepEqual(unchanged.completedLessons, ['LO-23'])
  assert.equal(unchanged.legacyV1, null)
  assert.notEqual(unchanged, current)

  const malformedShape = legacyProgress()
  malformedShape.completedLessons = 'LO-01'
  assert.throws(() => parseProgress(JSON.stringify(malformedShape)), /Fortschrittsdaten/)
})

test('every failed rubric dimension makes review due jetzt and is named in German', () => {
  const writtenDimensions = ['fachlicheRichtigkeit', 'praxistauglichkeit']
  assert.equal(reviewDueForScores({ fachlicheRichtigkeit: 2, praxistauglichkeit: 0 }, writtenDimensions), 'jetzt')
  assert.deepEqual(
    failedRubricDimensionLabels({ fachlicheRichtigkeit: 0, praxistauglichkeit: 0 }, writtenDimensions),
    ['Fachliche Richtigkeit', 'Praxistauglichkeit'],
  )

  const oralDimensions = [...writtenDimensions, 'schluessigeArgumentation']
  assert.equal(reviewDueForScores({ fachlicheRichtigkeit: 2, praxistauglichkeit: 2, schluessigeArgumentation: 0 }, oralDimensions), 'jetzt')
  assert.deepEqual(
    failedRubricDimensionLabels({ fachlicheRichtigkeit: 2, praxistauglichkeit: 0, schluessigeArgumentation: 0 }, oralDimensions),
    ['Praxistauglichkeit', 'Schlüssige Argumentation'],
  )
  assert.equal(reviewDueForScores({ fachlicheRichtigkeit: 1, praxistauglichkeit: 1 }, writtenDimensions), 'als Nächstes')
})
