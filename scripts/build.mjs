import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'

const root = resolve(process.cwd())
const dist = resolve(root, 'dist')
const distFromRoot = relative(root, dist)
if (!distFromRoot
  || distFromRoot === '..'
  || distFromRoot.startsWith(`..${sep}`)
  || isAbsolute(distFromRoot)) {
  throw new Error('Ungültiges Build-Ziel')
}

await mkdir(join(dist, 'src', 'data'), { recursive: true })
await mkdir(join(dist, 'src', 'utils'), { recursive: true })
await mkdir(join(dist, 'src', 'assets'), { recursive: true })

const files = [
  ['index.html', 'index.html'],
  ['src/app.js', 'src/app.js'],
  ['src/styles.css', 'src/styles.css'],
  ['src/assets/makler-workflow-abstract.png', 'src/assets/makler-workflow-abstract.png'],
  ['src/data/catalog.js', 'src/data/catalog.js'],
  ['src/data/caseFile.js', 'src/data/caseFile.js'],
  ['src/data/sources.json', 'src/data/sources.json'],
  ['src/utils/progress.js', 'src/utils/progress.js'],
]

for (const [from, to] of files) await cp(join(root, from), join(dist, to), { force: true })
const manifest = {
  name: 'Makler Prüfungswerkstatt',
  version: 'v0',
  builtAt: new Date().toISOString(),
  files: files.map(([, to]) => to),
}
await writeFile(join(dist, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

const html = await readFile(join(dist, 'index.html'), 'utf8')
if (!html.includes('./src/app.js') || !html.includes('./src/styles.css')) throw new Error('Build-Prüfung: relativer Einstieg fehlt')
if (/(?:href|src)="\/src\//.test(html)) throw new Error('Build-Prüfung: domain-root Laufzeitpfad gefunden')
process.stdout.write(`Build PASS: ${files.length} Laufzeitdateien nach dist kopiert.\n`)
