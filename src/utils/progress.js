export const STORAGE_KEY = 'makler-pruefungswerkstatt.progress.v1'

export const createInitialProgress = () => ({
  version: 1,
  completedLessons: [],
  completedCaseSteps: [],
  writtenAnswers: {},
  writtenReviewed: [],
  oralAssessments: {},
  mistakes: [],
  reviewQueue: [],
  notes: {},
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

function cleanObjectArray(value, fields) {
  if (!Array.isArray(value)) return null
  if (!value.every((item) => isObject(item) && fields.every((field) => typeof item[field] === 'string'))) return null
  return value.map((item) => Object.fromEntries(fields.map((field) => [field, item[field]])))
}

const hasValidDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

export const parseProgress = (raw) => {
  const parsed = JSON.parse(raw)
  if (!isObject(parsed) || parsed.version !== 1) {
    throw new Error('Unbekannte lokale Datenversion')
  }

  const initial = createInitialProgress()
  const completedLessons = parsed.completedLessons ?? initial.completedLessons
  const completedCaseSteps = parsed.completedCaseSteps ?? initial.completedCaseSteps
  const writtenAnswers = parsed.writtenAnswers ?? initial.writtenAnswers
  const writtenReviewed = parsed.writtenReviewed ?? initial.writtenReviewed
  const oralAssessments = parsed.oralAssessments ?? initial.oralAssessments
  const mistakes = cleanObjectArray(parsed.mistakes ?? initial.mistakes, ['id', 'code', 'context', 'createdAt'])
  const reviewQueue = cleanObjectArray(parsed.reviewQueue ?? initial.reviewQueue, ['id', 'kind', 'sourceId', 'label', 'due'])
  const notes = parsed.notes ?? initial.notes

  if (!isStringArray(completedLessons)
    || !isStringArray(completedCaseSteps)
    || !isStringRecord(writtenAnswers)
    || !isStringArray(writtenReviewed)
    || !isStringRecord(oralAssessments)
    || mistakes === null
    || !mistakes.every((item) => hasValidDate(item.createdAt))
    || reviewQueue === null
    || !isStringRecord(notes)) {
    throw new Error('Ungültige lokale Fortschrittsdaten')
  }

  return {
    version: 1,
    completedLessons: [...completedLessons],
    completedCaseSteps: [...completedCaseSteps],
    writtenAnswers: { ...writtenAnswers },
    writtenReviewed: [...writtenReviewed],
    oralAssessments: { ...oralAssessments },
    mistakes,
    reviewQueue,
    notes: { ...notes },
  }
}
