import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'
import { SourceTextModule } from 'node:vm'

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'artifacts') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (['.js', '.mjs'].includes(extname(entry.name))) files.push(path)
  }
  return files
}

const failures = []
for (const file of await walk(process.cwd())) {
  try {
    const source = await readFile(file, 'utf8')
    new SourceTextModule(source, { identifier: file })
  } catch (error) {
    failures.push(`${relative(process.cwd(), file)}\n${error instanceof Error ? error.stack : error}`)
  }
}

if (failures.length) {
  process.stderr.write(failures.join('\n'))
  process.exit(1)
}

process.stdout.write('Typecheck PASS: alle JavaScript-Module wurden als ECMAScript-Module geparst.\n')
