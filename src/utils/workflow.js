export const DUE_ORDER = Object.freeze(['jetzt', 'als Nächstes', 'später'])

export const normalizeDue = (due) => DUE_ORDER.includes(due) ? due : 'später'

const parsedDate = (value) => {
  if (typeof value !== 'string') return null
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

export function sortReviewQueue(queue) {
  return queue
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const dueDifference = DUE_ORDER.indexOf(normalizeDue(left.item.due))
        - DUE_ORDER.indexOf(normalizeDue(right.item.due))
      if (dueDifference !== 0) return dueDifference

      const leftDate = parsedDate(left.item.createdAt)
      const rightDate = parsedDate(right.item.createdAt)
      if (leftDate !== null && rightDate !== null && leftDate !== rightDate) return leftDate - rightDate
      if (leftDate !== null && rightDate === null) return -1
      if (leftDate === null && rightDate !== null) return 1
      return left.index - right.index
    })
    .map(({ item }) => item)
}

function validMinimum(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function countReasoningUnits(text) {
  const separatedBullets = text.replace(/[\t ]+[•·][\t ]+/gu, '\n')
  return separatedBullets
    .split(/[.!?。！？;；\r\n]+|^\s*[-*•]\s+/gmu)
    .map((unit) => unit.trim())
    .filter(Boolean)
    .length
}

export function isValidWrittenAnswer(text, minChars, minUnits) {
  if (typeof text !== 'string' || !validMinimum(minChars) || !validMinimum(minUnits)) return false
  const trimmed = text.trim()
  return trimmed.length >= minChars && countReasoningUnits(trimmed) >= minUnits
}

export function isValidOralAttempt({ elapsedSeconds, notes, minSeconds, minNoteChars } = {}) {
  if (!validMinimum(minSeconds) || !validMinimum(minNoteChars)) return false
  const timerQualified = typeof elapsedSeconds === 'number'
    && Number.isFinite(elapsedSeconds)
    && elapsedSeconds >= minSeconds
  const notesQualified = typeof notes === 'string' && notes.trim().length >= minNoteChars
  return timerQualified || notesQualified
}

export function isValidCaseOutput(text, minChars) {
  return typeof text === 'string'
    && validMinimum(minChars)
    && text.trim().length >= minChars
}

export function scoreIsPassing(scores, dimensions) {
  if (scores === null || typeof scores !== 'object' || Array.isArray(scores)) return false
  if (!Array.isArray(dimensions) || dimensions.length === 0) return false
  return dimensions.every((dimension) => (
    typeof scores[dimension] === 'number'
    && Number.isFinite(scores[dimension])
    && scores[dimension] >= 1
  ))
}

export const upsertReviewQueueItem = (queue, item) => [
  item,
  ...queue.filter((entry) => entry.id !== item.id),
]

export const removeReviewItemsForSource = (queue, kind, sourceId) => (
  queue.filter((item) => item.kind !== kind || item.sourceId !== sourceId)
)
