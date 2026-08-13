import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'

const [app, styles, index, catalog, caseFile, buildScript] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/catalog.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/caseFile.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
])

function assertOrdered(source, parts) {
  let cursor = -1
  for (const part of parts) {
    const next = source.indexOf(part, cursor + 1)
    assert.ok(next > cursor, `expected ${part} after position ${cursor}`)
    cursor = next
  }
}

test('the eight requested work areas are present exactly once in navigation', () => {
  for (const label of ['Heute', 'Prüfungsplan', 'Lernpfad', 'Fallwerkstatt', 'Schriftlich', 'Mündlich', 'Fehler', 'Quellen']) {
    assert.equal((app.match(new RegExp(`label: '${label}'`, 'g')) ?? []).length, 1)
  }
  assert.match(app, /data-module="\$\{escapeHtml\(module\.code\)\}"/)
  assert.match(app, /question\.module === moduleCode/)
})

test('only the four Module 1 and 2 subjects are catalogued', () => {
  const codes = [...catalog.matchAll(/code: '(M\d-[AB])'/g)].map((match) => match[1])
  assert.deepEqual([...new Set(codes)].sort(), ['M1-A', 'M1-B', 'M2-A', 'M2-B'])
  assert.doesNotMatch(catalog, /M3-[A-Z]/)
})

test('the original case exposes all eight decision layers', () => {
  for (const id of ['facts', 'missing', 'risks', 'rule', 'solution', 'contract', 'explanation', 'next']) {
    assert.match(caseFile, new RegExp(`id: '${id}'`))
  }
  assert.match(caseFile, /CONTRACT_CHECK_REQUIRED/)
  assert.match(app, /INSUFFICIENT_EVIDENCE/)
})

test('accessibility and explicit non-happy states remain part of the UI contract', () => {
  assert.match(index, /<html lang="de">/)
  assert.match(app, /class="skip-link"/)
  assert.match(app, /role="alert"/)
  assert.match(app, /aria-live="polite"/)
  assert.match(app, /Produktempfehlung erstellen<\/button>/)
  assert.match(app, /Noch kein Fehler protokolliert/)
  assert.match(app, /Register nicht verfügbar/)
  assert.match(app, /keydown/)
  assert.match(app, /focusMain\(\)/)
  assert.match(app, /ArrowDown/)
})

test('responsive and reduced-motion rules are explicit', () => {
  for (const width of ['1120px', '820px', '540px']) assert.match(styles, new RegExp(`max-width: ${width}`))
  assert.match(styles, /prefers-reduced-motion: reduce/)
  assert.match(styles, /:focus-visible/)
  assert.match(styles, /border-radius:\s*(?:8|12)px/)
  assert.match(styles, /height:\s*72px/)
  assert.match(styles, /min-height:\s*44px/)
  assert.match(styles, /backdrop-filter:\s*blur/)
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient/i)
})

test('root document can shrink to the scrollbar-reduced layout viewport', () => {
  for (const selector of ['html', 'body']) {
    const rule = styles.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([^{}]*)\\}`))
    assert.ok(rule, `expected a root ${selector} rule`)
    assert.match(rule[1], /min-width:\s*0;/)
    assert.doesNotMatch(rule[1], /min-width:\s*320px;/)
  }
})

test('language aid and local-only progress are explicit', () => {
  assert.match(app, /Deutsch bleibt Normebene/)
  assert.match(app, /lang="zh-Hans"/)
  assert.match(app, /window\.localStorage/)
  assert.match(app, /fetch\(new URL\('\.\/data\/sources\.json', import\.meta\.url\), \{ cache: 'no-store' \}\)/)
  assert.doesNotMatch(app, /fetch\(['"]\/src\//)
})

test('runtime assets are relative for GitHub project pages', () => {
  assert.match(index, /href="\.\/src\/styles\.css"/)
  assert.match(index, /src="\.\/src\/app\.js"/)
  assert.doesNotMatch(index, /(?:href|src)="\/src\//)
  assert.doesNotMatch(app, /(?:src="|fetch\(['"])\/src\//)
})

test('build target containment is cross-platform', () => {
  assert.match(buildScript, /from 'node:path'/)
  assert.match(buildScript, /const distFromRoot = relative\(root, dist\)/)
  assert.match(buildScript, /distFromRoot\.startsWith\(`\.\.\$\{sep\}`\)/)
  assert.match(buildScript, /isAbsolute\(distFromRoot\)/)
  assert.doesNotMatch(buildScript, /root\}\\\\/)
})

test('mobile navigation is an accessible eight-route drawer', () => {
  assert.match(app, /aria-controls="mobile-navigation"/)
  assert.match(app, /id="mobile-navigation"/)
  assert.match(app, /role="dialog"/)
  assert.match(app, /aria-modal="true"/)
  assert.match(app, /aria-expanded="false"/)
  assert.match(app, /aria-current="page"/)
  assert.match(app, /document\.body\.classList\.add\('drawer-open'\)/)
  assert.match(app, /event\.key === 'Escape'/)
  assert.match(app, /event\.key === 'Tab'/)
  assert.match(app, /drawerRestoreTarget/)
  assert.match(app, /'\.skip-link, \.mobile-topbar, \.app-frame'/)
  assert.match(app, /element\.toggleAttribute\('inert', isInert\)/)
  assert.match(app, /nav\.scrollTop =/)
  assert.doesNotMatch(app, /scrollIntoView/)

  const renderFlow = app.slice(app.indexOf('function render()'), app.indexOf('function openDrawer()'))
  const openFlow = app.slice(app.indexOf('function openDrawer()'), app.indexOf('function closeDrawer('))
  const closeFlow = app.slice(app.indexOf('function closeDrawer('), app.indexOf('function closeTooltip()'))
  assertOrdered(renderFlow, ['setDrawerBackgroundInert(false)', "document.body.classList.remove('drawer-open')", 'drawerRestoreTarget = null', "document.querySelector('#root').innerHTML"])
  assertOrdered(openFlow, ['drawerRestoreTarget =', 'setDrawerBackgroundInert(true)', "drawer.removeAttribute('inert')", 'active.focus'])
  assertOrdered(closeFlow, ['setDrawerBackgroundInert(false)', 'focusTarget.focus', "drawer.classList.remove('is-open')", "drawer.setAttribute('inert', '')"])
})

test('storage hints never claim success after a localStorage failure', () => {
  assert.equal((app.match(/class="storage-hint"/g) ?? []).length, 2)
  assert.doesNotMatch(app, /<small>lokal gespeichert<\/small>/)
  assert.match(app, /function storageHintText\(\)[\s\S]*Speicherung nicht bestätigt[\s\S]*lokal gespeichert/)
  assert.match(app, /querySelectorAll\('\.storage-hint'\)/)
  assert.match(app, /hint\.textContent = storageHintText\(\)/)
  const saveFlow = app.slice(app.indexOf('function saveProgress()'), app.indexOf('function updateProgress('))
  assert.match(saveFlow, /catch \{[\s\S]*clearSaveAnnouncement\(\)/)
})

test('Today opens a concrete lesson and uses the local visual anchor', async () => {
  assert.match(app, /data-lesson=/)
  assert.match(app, /encodeURIComponent\(state\.lessonTarget\)/)
  assert.match(app, /focusLessonTarget\(\)/)
  assert.match(app, /window\.scrollTo\(/)
  assert.match(app, /src="\.\/src\/assets\/makler-workflow-abstract\.png"/)
  assert.match(app, /alt="Abstrakte Papierkomposition mit einer dunkelgrünen Prüflinie/)
  assert.match(app, /width="1536" height="1024"/)
  const image = await stat(new URL('../src/assets/makler-workflow-abstract.png', import.meta.url))
  assert.ok(image.size > 0)
})

test('tooltip, save toast and back-to-top have explicit accessible contracts', () => {
  assert.match(app, /role="tooltip"/)
  assert.match(app, /aria-describedby="derived-tooltip"/)
  assert.match(app, /Didaktisch aus bestätigten Lernergebnissen abgeleitet/)
  assert.match(index, /id="save-toast"/)
  assert.match(index, /role="status" aria-live="polite" aria-atomic="true"/)
  assert.match(app, /window\.localStorage\.setItem[\s\S]*announceSaved\(\)/)
  assert.match(app, /data-action="back-to-top"/)
  assert.match(app, /prefers-reduced-motion: reduce/)
  assert.match(app, /behavior = .* \? 'auto' : 'smooth'/)
})
