import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialProgress, parseProgress, toggleArrayItem, upsertReviewItem } from '../src/utils/progress.js'

test('initial progress does not fabricate results', () => {
  const progress = createInitialProgress()
  assert.equal(progress.version, 1)
  assert.deepEqual(progress.mistakes, [])
  assert.deepEqual(progress.reviewQueue, [])
  assert.equal('passRate' in progress, false)
})

test('toggleArrayItem adds and removes a local step', () => {
  assert.deepEqual(toggleArrayItem([], 'step-a'), ['step-a'])
  assert.deepEqual(toggleArrayItem(['step-a'], 'step-a'), [])
})

test('review items are unique and newest first', () => {
  const first = { id: 'x', kind: 'case', sourceId: 'facts', label: 'Fakten', due: 'später' }
  const updated = { ...first, due: 'jetzt' }
  assert.deepEqual(upsertReviewItem([first], updated), [updated])
})

test('stored progress keeps unknown extra fields out of the required shape', () => {
  const parsed = parseProgress(JSON.stringify({ ...createInitialProgress(), completedLessons: ['risk-chain'], untrustedExtra: 'drop me' }))
  assert.deepEqual(parsed.completedLessons, ['risk-chain'])
  assert.equal('untrustedExtra' in parsed, false)
  assert.throws(() => parseProgress('{"version":2}'), /Datenversion/)
})

test('malformed version-one progress fails closed', () => {
  assert.throws(
    () => parseProgress(JSON.stringify({ ...createInitialProgress(), completedLessons: 'not-an-array' })),
    /Fortschrittsdaten/,
  )
  assert.throws(
    () => parseProgress(JSON.stringify({ ...createInitialProgress(), reviewQueue: [{ id: 'x' }] })),
    /Fortschrittsdaten/,
  )
  assert.throws(
    () => parseProgress(JSON.stringify({ ...createInitialProgress(), mistakes: [{ id: 'x', code: 'F1', context: 'Test', createdAt: 'not-a-date' }] })),
    /Fortschrittsdaten/,
  )
})
