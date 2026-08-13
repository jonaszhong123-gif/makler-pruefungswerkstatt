import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const data = JSON.parse(await readFile(new URL('../src/data/sources.json', import.meta.url), 'utf8'))

test('minimum official sources are registered with explicit statuses', () => {
  const byId = Object.fromEntries(data.items.map((item) => [item.id, item]))
  assert.equal(byId['wko-bpo-2024'].status, 'current')
  assert.equal(byId['ris-vv-2026'].status, 'current')
  assert.equal(byId['ris-apo-2004'].status, 'current')
  assert.equal(byId['ris-vv-2010'].status, 'superseded')
})

test('state dates and fees remain missing instead of becoming zero', () => {
  const stateEntry = data.items.find((item) => item.id === 'state-dates-fees')
  assert.equal(stateEntry.status, 'pending')
  assert.equal(stateEntry.url, null)
  assert.match(stateEntry.note, /missing/)
  assert.doesNotMatch(stateEntry.note, /€|EUR|\b0\b/)
})

test('BÖV material is not treated as an authority or copied source', () => {
  const boev = data.items.find((item) => item.id === 'boev-2025')
  assert.equal(boev.status, 'pending')
  assert.equal(boev.factStatus, 'unknown')
  assert.match(boev.note, /kein Originaltext/)
})
