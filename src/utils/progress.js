export const STORAGE_KEY = 'makler-pruefungswerkstatt.progress.v2'
export const LEGACY_STORAGE_KEY = 'makler-pruefungswerkstatt.progress.v1'

const DUE_VALUES = new Set(['jetzt', 'als Nächstes', 'später'])
const REVIEW_KINDS = new Set(['lesson', 'case', 'written', 'oral'])
const SCORE_VALUES = new Set([0, 1, 2])
const RUBRIC_DIMENSION_LABELS = {
  fachlicheRichtigkeit: 'Fachliche Richtigkeit',
  praxistauglichkeit: 'Praxistauglichkeit',
  schluessigeArgumentation: 'Schlüssige Argumentation',
}

export const createInitialProgress = () => ({
  version: 2,
  completedLessons: [],
  lessonChecks: {},
  completedCaseSteps: [],
  caseOutputs: {},
  writtenAnswers: {},
  writtenAttempts: {},
  oralNotes: {},
  oralAttempts: {},
  mistakes: [],
  reviewQueue: [],
  notes: {},
  legacyV1: null,
})

export const toggleArrayItem = (values, id) =>
  values.includes(id) ? values.filter((value) => value !== id) : [...values, id]

export const upsertReviewItem = (queue, item) => [
  item,
  ...queue.filter((entry) => entry.id !== item.id),
]

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const isStringRecord = (value) => isObject(value) && Object.values(value).every((item) => typeof item === 'string')
const isNullableDate = (value) => value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
const isWholeNumber = (value) => Number.isInteger(value) && value >= 0

function isScoreRecord(value) {
  return isObject(value)
    && Object.entries(value).every(([key, score]) => key.length > 0 && SCORE_VALUES.has(score))
}

function isLessonCheck(value) {
  return isObject(value)
    && isWholeNumber(value.selectedIndex)
    && typeof value.correct === 'boolean'
    && isWholeNumber(value.attempts)
    && isNullableDate(value.checkedAt)
}

function isWrittenAttempt(value) {
  return isObject(value)
    && typeof value.revealed === 'boolean'
    && isWholeNumber(value.attempts)
    && isScoreRecord(value.scores)
    && isNullableDate(value.submittedAt)
    && isNullableDate(value.completedAt)
}

function isOralAttempt(value) {
  return isObject(value)
    && typeof value.revealed === 'boolean'
    && isWholeNumber(value.attempts)
    && isWholeNumber(value.elapsedSeconds)
    && isScoreRecord(value.scores)
    && isNullableDate(value.submittedAt)
    && isNullableDate(value.completedAt)
}

function isRecordOf(value, predicate) {
  return isObject(value) && Object.values(value).every(predicate)
}

function isMistake(value) {
  return isObject(value)
    && ['id', 'code', 'context', 'kind', 'sourceId', 'createdAt'].every((field) => typeof value[field] === 'string')
    && REVIEW_KINDS.has(value.kind)
    && !Number.isNaN(Date.parse(value.createdAt))
}

function isReviewItem(value) {
  return isObject(value)
    && ['id', 'kind', 'sourceId', 'label', 'due'].every((field) => typeof value[field] === 'string')
    && REVIEW_KINDS.has(value.kind)
    && DUE_VALUES.has(value.due)
    && isNullableDate(value.createdAt)
}

function isLegacyMistake(value) {
  return isObject(value)
    && ['id', 'code', 'context', 'createdAt'].every((field) => typeof value[field] === 'string')
    && !Number.isNaN(Date.parse(value.createdAt))
}

function isLegacyReviewItem(value) {
  return isObject(value)
    && ['id', 'kind', 'sourceId', 'label', 'due'].every((field) => typeof value[field] === 'string')
    && REVIEW_KINDS.has(value.kind)
    && DUE_VALUES.has(value.due)
}

function isLegacyArchive(value) {
  return isObject(value)
    && value.version === 1
    && isStringArray(value.completedLessons)
    && isStringArray(value.completedCaseSteps)
    && isStringRecord(value.writtenAnswers)
    && isStringArray(value.writtenReviewed)
    && isStringRecord(value.oralAssessments)
    && Array.isArray(value.mistakes)
    && value.mistakes.every(isLegacyMistake)
    && Array.isArray(value.reviewQueue)
    && value.reviewQueue.every(isLegacyReviewItem)
    && isStringRecord(value.notes)
}

function validateV2(parsed) {
  return isObject(parsed)
    && parsed.version === 2
    && isStringArray(parsed.completedLessons)
    && isRecordOf(parsed.lessonChecks, isLessonCheck)
    && isStringArray(parsed.completedCaseSteps)
    && isStringRecord(parsed.caseOutputs)
    && isStringRecord(parsed.writtenAnswers)
    && isRecordOf(parsed.writtenAttempts, isWrittenAttempt)
    && isStringRecord(parsed.oralNotes)
    && isRecordOf(parsed.oralAttempts, isOralAttempt)
    && Array.isArray(parsed.mistakes)
    && parsed.mistakes.every(isMistake)
    && Array.isArray(parsed.reviewQueue)
    && parsed.reviewQueue.every(isReviewItem)
    && isStringRecord(parsed.notes)
    && (parsed.legacyV1 === undefined || parsed.legacyV1 === null || isLegacyArchive(parsed.legacyV1))
}

function cloneV2(parsed) {
  return {
    version: 2,
    completedLessons: [...parsed.completedLessons],
    lessonChecks: structuredClone(parsed.lessonChecks),
    completedCaseSteps: [...parsed.completedCaseSteps],
    caseOutputs: { ...parsed.caseOutputs },
    writtenAnswers: { ...parsed.writtenAnswers },
    writtenAttempts: structuredClone(parsed.writtenAttempts),
    oralNotes: { ...parsed.oralNotes },
    oralAttempts: structuredClone(parsed.oralAttempts),
    mistakes: parsed.mistakes.map((item) => ({ ...item })),
    reviewQueue: parsed.reviewQueue.map((item) => ({ ...item })),
    notes: { ...parsed.notes },
    legacyV1: parsed.legacyV1 == null ? null : sanitizeV1(parsed.legacyV1),
  }
}

function sanitizeV1(parsed) {
  if (!isObject(parsed) || parsed.version !== 1) {
    throw new Error('Ungültige lokale Fortschrittsdaten')
  }

  const completedLessons = parsed.completedLessons ?? []
  const completedCaseSteps = parsed.completedCaseSteps ?? []
  const writtenAnswers = parsed.writtenAnswers ?? {}
  const writtenReviewed = parsed.writtenReviewed ?? []
  const oralAssessments = parsed.oralAssessments ?? {}
  const notes = parsed.notes ?? {}
  const mistakes = parsed.mistakes ?? []
  const reviewQueue = parsed.reviewQueue ?? []

  if (!isStringArray(completedLessons)
    || !isStringArray(completedCaseSteps)
    || !isStringRecord(writtenAnswers)
    || !isStringArray(writtenReviewed)
    || !isStringRecord(oralAssessments)
    || !isStringRecord(notes)
    || !Array.isArray(mistakes)
    || !mistakes.every(isLegacyMistake)
    || !Array.isArray(reviewQueue)
    || !reviewQueue.every(isLegacyReviewItem)) {
    throw new Error('Ungültige lokale Fortschrittsdaten')
  }

  return {
    version: 1,
    completedLessons: [...completedLessons],
    completedCaseSteps: [...completedCaseSteps],
    writtenAnswers: { ...writtenAnswers },
    writtenReviewed: [...writtenReviewed],
    oralAssessments: { ...oralAssessments },
    mistakes: mistakes.map(({ id, code, context, createdAt }) => ({ id, code, context, createdAt })),
    reviewQueue: reviewQueue
      .map(({ id, kind, sourceId, label, due }) => ({ id, kind, sourceId, label, due })),
    notes: { ...notes },
  }
}

function migrateV1(parsed) {
  return { ...createInitialProgress(), legacyV1: sanitizeV1(parsed) }
}

export const parseProgress = (raw) => {
  const parsed = JSON.parse(raw)
  if (isObject(parsed) && parsed.version === 1) return migrateV1(parsed)
  if (!validateV2(parsed)) throw new Error('Ungültige oder unbekannte lokale Datenversion')
  return cloneV2(parsed)
}

export const attachLegacyV1 = (progress, raw) => {
  if (!validateV2(progress)) throw new Error('Ungültige aktuelle Fortschrittsdaten')
  const current = cloneV2(progress)
  try {
    const parsed = JSON.parse(raw)
    return { ...current, legacyV1: sanitizeV1(parsed) }
  } catch {
    return current
  }
}

export const failedRubricDimensionLabels = (scores, dimensions) => dimensions
  .filter((dimension) => scores[dimension] === 0)
  .map((dimension) => RUBRIC_DIMENSION_LABELS[dimension] ?? dimension)

export const reviewDueForScores = (scores, dimensions) =>
  failedRubricDimensionLabels(scores, dimensions).length > 0 ? 'jetzt' : 'als Nächstes'

export const exportProgress = (progress) => {
  if (!validateV2(progress)) throw new Error('Fortschritt kann nicht exportiert werden')
  return `${JSON.stringify(progress, null, 2)}\n`
}
