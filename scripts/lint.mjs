import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const allowedHex = new Set(['#f4f0e7', '#161815', '#214e3b', '#dde3d8', '#667064', '#c9cbbf'])
const checkedExtensions = new Set(['.js', '.css', '.html', '.json', '.md', '.mjs'])
const errors = []

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'artifacts') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (checkedExtensions.has(extname(entry.name))) files.push(path)
  }
  return files
}

for (const path of await walk(root)) {
  const name = relative(root, path).replaceAll('\\', '/')
  const text = await readFile(path, 'utf8')
  const lineCount = text.split(/\r?\n/).length
  if ((extname(path) === '.js' || extname(path) === '.mjs') && lineCount > 1000) {
    errors.push(`${name}: ${lineCount} Zeilen (Maximum 1000)`)
  }
  if (name.startsWith('src/') && text.includes('scrollIntoView')) errors.push(`${name}: verbotene Scroll-Methode gefunden`)
  if (name.startsWith('src/') && /const\s+styles\s*=/.test(text)) errors.push(`${name}: verbotener globaler Stilname gefunden`)
  if (name.startsWith('src/') && /console\.(log|warn|error)\s*\(/.test(text)) errors.push(`${name}: Console-Ausgabe gefunden`)
  if (name.endsWith('.css')) {
    const colors = text.match(/#[0-9a-fA-F]{6}/g) ?? []
    for (const color of colors) {
      if (!allowedHex.has(color.toLowerCase())) errors.push(`${name}: Farbe außerhalb der Palette ${color}`)
    }
  }
}

const sources = JSON.parse(await readFile(join(root, 'src/data/sources.json'), 'utf8'))
for (const source of sources.items) {
  if (!['current', 'superseded', 'pending'].includes(source.status)) errors.push(`sources.json: ungültiger Status ${source.status}`)
  if (!['confirmed', 'derived', 'unknown'].includes(source.factStatus)) errors.push(`sources.json: ungültiger Faktstatus ${source.factStatus}`)
}

if (errors.length) {
  process.stderr.write(`${errors.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write('Lint PASS: Struktur, verbotene Muster, Palette und Quellenstatus geprüft.\n')
