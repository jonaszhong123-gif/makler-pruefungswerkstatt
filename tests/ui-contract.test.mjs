import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [app, templates, router, progress, styles, index, buildScript] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/views/templates.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/utils/router.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/utils/progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
])

test('the eight work areas and explicit Modul 3 exclusion remain visible', () => {
  for (const label of ['Heute', 'Prüfungsplan', 'Lernpfad', 'Fallwerkstatt', 'Schriftlich', 'Mündlich', 'Fehler', 'Quellen']) {
    assert.equal((templates.match(new RegExp(`label: '${label}'`, 'g')) ?? []).length, 1)
  }
  assert.match(app, /M3 · EXCLUDED/)
  assert.match(templates, /vollständig außerhalb von Navigation, Kursen, Übungen und Fortschritt/)
})

test('skip navigation never becomes an application route', () => {
  assert.match(app, /class=\"skip-link\" href=\"#main-content\" data-action=\"skip-content\"/)
  assert.match(app, /action === 'skip-content'/)
  assert.match(app, /event\.preventDefault\(\)/)
  assert.match(router, /hash === '#main-content'/)
  assert.match(router, /return \{ ignore: true \}/)
})

test('Today resolves to a due source or a real lesson deep link', () => {
  assert.match(templates, /sortReviewQueue\(state\.progress\.reviewQueue\)/)
  assert.match(templates, /routeForReviewItem\(nextReview\)/)
  assert.match(templates, /view: 'learning-path', targetId: nextLesson\.id/)
  assert.doesNotMatch(templates, /nextView = .*mistakes/)
  assert.match(templates, /nextReview\s*\? 'Wiederholung öffnen'/)
  assert.match(templates, /nextLesson\s*\? 'Lektion öffnen'/)
  assert.match(templates, /: 'Lernpfad wiederholen'/)
  assert.match(templates, /23 LEKTIONEN ABGESCHLOSSEN/)
  assert.match(templates, /emptyState\('Lernpfad vollständig'/)
  assert.equal((templates.match(/NÄCHSTE LEKTION/g) ?? []).length, 1)
})

test('lesson completion is gated by a checked correct answer', () => {
  assert.match(templates, /data-action=\"lesson-check\"/)
  assert.match(templates, /!complete && !check\?\.correct \? 'disabled'/)
  assert.match(app, /selectedIndex === outcome\.course\.selfCheck\.correctIndex/)
  assert.match(app, /if \(!completed && !check\?\.correct\)/)
  assert.doesNotMatch(app, /toggle-lesson/)
})

test('written practice hides guidance until a valid fixed submission and supports retry', () => {
  assert.match(templates, /attempt\.revealed\s*\? `<section class=\"reference-panel\"/)
  assert.match(templates, /attempt\.revealed \? 'readonly'/)
  assert.match(app, /isValidWrittenAnswer\(answer, question\.minChars, question\.minUnits\)/)
  assert.match(templates, /data-action=\"practice-redo\" data-kind=\"written\"/)
  assert.match(templates, /fachlicheRichtigkeit/)
  assert.match(templates, /praxistauglichkeit/)
})

test('oral practice gates observations, supplies a timer and uses three dimensions', () => {
  assert.match(templates, /Nachfragen und Beobachtungspunkte sind noch verborgen/)
  assert.match(templates, /data-action=\"timer-toggle\"/)
  assert.match(app, /isValidOralAttempt/)
  assert.match(templates, /schluessigeArgumentation/)
  assert.match(templates, /data-action=\"practice-redo\" data-kind=\"oral\"/)
  assert.match(templates, /data-action=\"oral-submit\"[\s\S]*?canSubmit \? '' : 'disabled'/)
  assert.match(app, /function syncOralSubmitGate\(id\)/)
})

test('review queue deep-links to its source and has no manual done/delete affordance', () => {
  assert.match(templates, /routeForReviewItem\(item\)/)
  assert.match(templates, /Quelle öffnen/)
  assert.match(app, /removeReviewItemsForSource/)
  assert.doesNotMatch(`${app}\n${templates}`, /data-action=\"remove-queue\"/)
  assert.doesNotMatch(`${app}\n${templates}`, />erledigt<\/button>/)
})

test('every case step has a real output gate and reversible consistent completion', () => {
  assert.match(templates, /data-input=\"case-output\"/)
  assert.match(templates, /complete \? 'readonly'/)
  assert.match(app, /isValidCaseOutput\(output, step\.minChars\)/)
  assert.match(app, /Abschluss zurückgenommen; der Fallschritt ist wieder fällig/)
  assert.match(app, /progress\.reviewQueue\.filter\(\(item\) => item\.id !== reviewId\)/)
  assert.match(templates, /!complete && !isValidCaseOutput\(value, step\.minChars\) \? 'disabled'/)
  assert.match(app, /function syncCaseStepGate\(caseId, stepId, output\)/)
  assert.match(app, /button\.disabled = !complete && !isValidCaseOutput/)
})

test('local persistence is explicit and has validated export and import controls', () => {
  assert.match(templates, /Fortschritt bleibt in localStorage/)
  assert.match(templates, /Kein Konto, kein Server, kein automatischer Upload/)
  assert.match(app, /exportProgress\(state\.progress\)/)
  assert.match(app, /parseProgress\(await file\.text\(\)\)/)
  assert.match(app, /window\.confirm/)
})

test('accessibility, responsive layout and visual-system constraints remain explicit', () => {
  assert.match(index, /<html lang="de">/)
  assert.match(templates, /lang=\"zh-Hans\"/)
  assert.match(app, /role=\"alert\"/)
  assert.match(app, /aria-live=\"polite\"/)
  assert.match(app, /ArrowDown/)
  assert.match(app, /navigationHost\.scrollTop \+=/)
  assert.match(styles, /:focus-visible/)
  assert.match(styles, /\.queue-list li > button \{[\s\S]*?min-height: 44px/)
  for (const width of ['1120px', '820px', '540px']) assert.match(styles, new RegExp(`max-width: ${width}`))
  assert.match(styles, /prefers-reduced-motion: reduce/)
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient/i)
  assert.doesNotMatch(styles, /overflow-x:\s*clip/)
  assert.match(styles, /\.mobile-drawer \{[\s\S]*?clip-path: inset\(0 0 0 100%\);/)
  assert.match(styles, /\.mobile-drawer\.is-open \{[\s\S]*?clip-path: inset\(0\);/)
  assert.match(styles, /\.practice-tabs \{[\s\S]*?overflow-x: auto;[\s\S]*?overflow-y: hidden;/)
  assert.match(styles, /\.timer-panel > div \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(styles, /\.queue-list strong,[\s\S]*?overflow-wrap: anywhere/)
})

test('startup migration and JSON import preserve the same complete sanitized legacy archive', () => {
  assert.match(app, /attachLegacyV1\(progress, legacy\)/)
  assert.match(app, /migrated = parseProgress\(legacy\)/)
  assert.match(app, /parseProgress\(await file\.text\(\)\)/)
  assert.match(progress, /export const parseProgress = \(raw\) =>/)
  assert.match(progress, /export const attachLegacyV1 = \(progress, raw\) =>/)
  assert.doesNotMatch(`${app}\n${progress}`, /reachableLegacyIds/)
})

test('failed rubric dimensions drive both the German queue label and urgency', () => {
  assert.match(app, /failedRubricDimensionLabels\(attempt\.scores, dimensions\)/)
  assert.match(app, /failedDimensions\.join\(', '\)/)
  assert.match(app, /reviewDueForScores\(attempt\.scores, dimensions\)/)
})

test('every render clears the mobile drawer scroll lock before replacing its DOM', () => {
  assert.match(app, /function render\([^)]*\) \{\s*document\.body\.classList\.remove\('drawer-open'\)/)
})

test('the production build includes every new runtime module', () => {
  for (const path of [
    'src/data/curriculum.js',
    'src/data/practice.js',
    'src/utils/router.js',
    'src/utils/workflow.js',
    'src/views/templates.js',
  ]) assert.match(buildScript, new RegExp(path.replaceAll('/', '\\/')))
  assert.match(buildScript, /version: 'v1-modul-1-2'/)
})

test('the production build cleans only a contained non-link dist and excludes obsolete case data', () => {
  assert.match(buildScript, /const distFromRoot = relative\(root, dist\)/)
  assert.match(buildScript, /distFromRoot\.startsWith\(`\.\.\$\{sep\}`\)/)
  assert.match(buildScript, /isAbsolute\(distFromRoot\)/)
  assert.match(buildScript, /existingDist\.isSymbolicLink\(\)/)
  assert.match(buildScript, /await rm\(dist, \{ recursive: true, force: true \}\)/)
  assert.doesNotMatch(buildScript, /src\/data\/caseFile\.js/)
})
