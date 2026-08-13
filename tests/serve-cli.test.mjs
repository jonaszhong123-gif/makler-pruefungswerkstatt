import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { formatBindUrl, parseServeOptions, startServer } from '../scripts/serve.mjs'

const cwd = resolve('test-project')
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('server CLI keeps loopback defaults', () => {
  assert.deepEqual(parseServeOptions(['node', 'serve.mjs'], cwd), {
    root: cwd,
    port: 5173,
    host: '127.0.0.1',
  })
})

test('server CLI accepts the explicit LAN preview contract', () => {
  assert.deepEqual(parseServeOptions(['node', 'serve.mjs', 'dist', '4174', '0.0.0.0'], cwd), {
    root: resolve(cwd, 'dist'),
    port: 4174,
    host: '0.0.0.0',
  })
  assert.equal(formatBindUrl('0.0.0.0', 4174), 'http://0.0.0.0:4174')
  assert.equal(formatBindUrl('::', 4174), 'http://[::]:4174')
})

test('server CLI rejects unsafe port and host values', () => {
  for (const port of ['0', '65536', '4.2', 'abc']) {
    assert.throws(() => parseServeOptions(['node', 'serve.mjs', 'dist', port], cwd), /Invalid port/)
  }
  for (const host of ['', ' 0.0.0.0', 'http://0.0.0.0', '999.1.1.1', 'bad/host']) {
    assert.throws(() => parseServeOptions(['node', 'serve.mjs', 'dist', '4174', host], cwd), /Invalid host/)
  }
})

test('server logs the actual dynamically assigned port', async () => {
  const writes = []
  const server = startServer(
    { root: cwd, port: 0, host: '127.0.0.1' },
    (chunk) => writes.push(String(chunk)),
  )
  try {
    await once(server, 'listening')
    const address = server.address()
    assert.equal(typeof address, 'object')
    assert.match(writes.join(''), new RegExp(`http://127\\.0\\.0\\.1:${address.port}\\n`))
    assert.doesNotMatch(writes.join(''), /:0\n/)
  } finally {
    await new Promise((resolveClose, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolveClose())
    })
  }
})

test('npm scripts separate loopback and LAN ports', () => {
  assert.equal(packageJson.scripts.dev, 'node scripts/serve.mjs . 5173')
  assert.equal(packageJson.scripts['dev:lan'], 'node scripts/serve.mjs . 5174 0.0.0.0')
  assert.equal(packageJson.scripts.preview, 'node scripts/serve.mjs dist 4173')
  assert.equal(packageJson.scripts['preview:lan'], 'node scripts/serve.mjs dist 4174 0.0.0.0')
})
