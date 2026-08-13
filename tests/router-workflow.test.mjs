import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseRouteHash,
  routeForReviewItem,
  ROUTE_VIEWS,
  serializeRoute,
} from '../src/utils/router.js'
import {
  DUE_ORDER,
  isValidCaseOutput,
  isValidOralAttempt,
  isValidWrittenAnswer,
  normalizeDue,
  removeReviewItemsForSource,
  scoreIsPassing,
  sortReviewQueue,
  upsertReviewQueueItem,
} from '../src/utils/workflow.js'
import { failedRubricDimensionLabels, reviewDueForScores } from '../src/utils/progress.js'

test('all target routes round-trip safely encoded target ids', () => {
  for (const view of ['learning-path', 'case-workshop', 'written', 'oral', 'mistakes']) {
    const route = { view, targetId: 'ä /?#' }
    assert.deepEqual(parseRouteHash(serializeRoute(route)), { ...route, ignore: false })
  }
  assert.deepEqual(ROUTE_VIEWS, [
    'today', 'exam-plan', 'learning-path', 'case-workshop', 'written', 'oral', 'mistakes', 'sources',
  ])
})

test('invalid hashes, views, and targets fail to a safe route state', () => {
  assert.deepEqual(parseRouteHash('not-a-hash'), { view: 'today', targetId: null, ignore: false })
  assert.deepEqual(parseRouteHash('#/unknown/place'), { view: 'today', targetId: null, ignore: false })
  assert.deepEqual(parseRouteHash('#/written/%E0%A4%A'), { view: 'written', targetId: null, ignore: false })
  assert.deepEqual(
    parseRouteHash('#/written/not-allowed', { written: new Set(['allowed']) }),
    { view: 'written', targetId: null, ignore: false },
  )
  assert.deepEqual(parseRouteHash('#/oral/too/many'), { view: 'oral', targetId: null, ignore: false })
})

test('main content anchor explicitly tells the caller to keep the current route', () => {
  assert.deepEqual(parseRouteHash('#main-content'), { ignore: true })
})

test('review kinds map to their source routes and unknown kinds go to mistakes', () => {
  assert.deepEqual(routeForReviewItem({ kind: 'lesson', sourceId: 'l-1' }), { view: 'learning-path', targetId: 'l-1' })
  assert.deepEqual(routeForReviewItem({ kind: 'case', sourceId: 'c-1' }), { view: 'case-workshop', targetId: 'c-1' })
  assert.deepEqual(routeForReviewItem({ kind: 'written', sourceId: 'w-1' }), { view: 'written', targetId: 'w-1' })
  assert.deepEqual(routeForReviewItem({ kind: 'oral', sourceId: 'o-1' }), { view: 'oral', targetId: 'o-1' })
  assert.deepEqual(routeForReviewItem({ kind: 'other', sourceId: 'x' }), { view: 'mistakes', targetId: null })
})

test('review queue sorts by normalized due bucket, then oldest valid creation date, stably', () => {
  const queue = [
    { id: 'later-new', due: 'später', createdAt: '2026-08-03T00:00:00Z' },
    { id: 'now-new', due: 'jetzt', createdAt: '2026-08-02T00:00:00Z' },
    { id: 'next', due: 'als Nächstes', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'now-old', due: 'jetzt', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'unknown-a', due: 'unbekannt' },
    { id: 'unknown-b', due: null },
    { id: 'later-old', due: 'später', createdAt: '2026-08-01T00:00:00Z' },
  ]
  assert.deepEqual(DUE_ORDER, ['jetzt', 'als Nächstes', 'später'])
  assert.equal(normalizeDue('unbekannt'), 'später')
  assert.deepEqual(sortReviewQueue(queue).map(({ id }) => id), [
    'now-old', 'now-new', 'next', 'later-old', 'later-new', 'unknown-a', 'unknown-b',
  ])
  assert.equal(queue[0].id, 'later-new')
})

test('written answers meet both trimmed character and reasoning-unit boundaries', () => {
  const twoUnits = 'Erster Grund. Zweiter Grund'
  assert.equal(isValidWrittenAnswer(twoUnits, twoUnits.length, 2), true)
  assert.equal(isValidWrittenAnswer(twoUnits, twoUnits.length + 1, 2), false)
  assert.equal(isValidWrittenAnswer('Ein langer Gedanke ohne Trennung', 10, 2), false)
  assert.equal(isValidWrittenAnswer('Grund eins\nGrund zwei; Grund drei', 10, 3), true)
  assert.equal(isValidWrittenAnswer('Grund eins • Grund zwei', 10, 2), true)
})

test('oral attempt passes by timer or by sufficiently detailed notes', () => {
  const limits = { minSeconds: 60, minNoteChars: 20 }
  assert.equal(isValidOralAttempt({ ...limits, elapsedSeconds: 60, notes: '' }), true)
  assert.equal(isValidOralAttempt({ ...limits, elapsedSeconds: 10, notes: 'Eine ausreichend lange Notiz' }), true)
  assert.equal(isValidOralAttempt({ ...limits, elapsedSeconds: 59, notes: 'zu kurz' }), false)
  assert.equal(isValidOralAttempt({ ...limits, notes: 'zu kurz' }), false)
})

test('case output uses its exact trimmed character boundary', () => {
  assert.equal(isValidCaseOutput(' 12345 ', 5), true)
  assert.equal(isValidCaseOutput(' 1234 ', 5), false)
})

test('every requested score dimension must have an explicit passing number', () => {
  assert.equal(scoreIsPassing({ facts: 1, logic: 2 }, ['facts', 'logic']), true)
  assert.equal(scoreIsPassing({ facts: 1, logic: 0 }, ['facts', 'logic']), false)
  assert.equal(scoreIsPassing({ facts: 1 }, ['facts', 'logic']), false)
  assert.equal(scoreIsPassing({ facts: 1 }, []), false)
})

test('zero in every non-first rubric dimension is named and due now', () => {
  const dimensions = ['fachlicheRichtigkeit', 'praxistauglichkeit', 'schluessigeArgumentation']
  assert.deepEqual(
    failedRubricDimensionLabels({ fachlicheRichtigkeit: 1, praxistauglichkeit: 0, schluessigeArgumentation: 0 }, dimensions),
    ['Praxistauglichkeit', 'Schlüssige Argumentation'],
  )
  assert.equal(reviewDueForScores({ fachlicheRichtigkeit: 1, praxistauglichkeit: 0 }, dimensions), 'jetzt')
  assert.equal(reviewDueForScores({ fachlicheRichtigkeit: 1, praxistauglichkeit: 1, schluessigeArgumentation: 1 }, dimensions), 'als Nächstes')
})

test('review queue upsert deduplicates ids and removal matches kind plus source', () => {
  const old = { id: 'same', kind: 'lesson', sourceId: 'l-1', due: 'später' }
  const retained = { id: 'keep', kind: 'case', sourceId: 'l-1', due: 'jetzt' }
  const updated = { ...old, due: 'jetzt' }
  const queue = upsertReviewQueueItem([old, retained, old], updated)
  assert.deepEqual(queue, [updated, retained])
  assert.deepEqual(removeReviewItemsForSource(queue, 'lesson', 'l-1'), [retained])
  assert.deepEqual(removeReviewItemsForSource(queue, 'case', 'different'), queue)
})
