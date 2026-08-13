import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { constants } from 'node:fs'
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { caseFiles, oralQuestions, writtenQuestions } from '../src/data/practice.js'
import { learningOutcomes } from '../src/data/curriculum.js'
import { createInitialProgress, STORAGE_KEY } from '../src/utils/progress.js'
import { startServer } from './serve.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const host = '127.0.0.1'
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 820, height: 900 },
  { width: 1440, height: 1000 },
]
const routes = [
  'today',
  'exam-plan',
  'learning-path',
  'case-workshop',
  'written',
  'oral',
  'mistakes',
  'sources',
]

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))

async function firstExisting(paths) {
  for (const path of paths) {
    if (!path) continue
    try {
      await access(path, constants.X_OK)
      return path
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error('Google Chrome wurde an keinem unterstützten Pfad gefunden.')
}

async function waitForDevTools(profile, browser, stderr) {
  const activePortFile = join(profile, 'DevToolsActivePort')
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    if (browser.exitCode !== null) {
      throw new Error(`Headless-Browser endete vor CDP-Bereitschaft (${browser.exitCode}).\n${stderr()}`)
    }
    try {
      const [portLine] = (await readFile(activePortFile, 'utf8')).trim().split(/\r?\n/u)
      const port = Number(portLine)
      if (Number.isInteger(port) && port > 0) return port
    } catch {
      // Chrome writes the file only after the debugging socket is ready.
    }
    await delay(100)
  }
  throw new Error(`CDP-Port wurde nicht rechtzeitig bereitgestellt.\n${stderr()}`)
}

async function waitForPageTarget(port) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://${host}:${port}/json/list`)
      const targets = await response.json()
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
      if (page) return page
    } catch {
      // The HTTP discovery endpoint can lag slightly behind DevToolsActivePort.
    }
    await delay(100)
  }
  throw new Error('Kein CDP-Seitenziel gefunden.')
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url)
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Map()
    this.opened = new Promise((resolveOpen, rejectOpen) => {
      this.socket.addEventListener('open', resolveOpen, { once: true })
      this.socket.addEventListener('error', () => rejectOpen(new Error('CDP-WebSocket konnte nicht geöffnet werden.')), { once: true })
    })
    this.socket.addEventListener('message', (event) => this.handleMessage(event.data))
    this.socket.addEventListener('close', () => {
      for (const { reject } of this.pending.values()) reject(new Error('CDP-Verbindung geschlossen.'))
      this.pending.clear()
    })
  }

  handleMessage(raw) {
    const message = JSON.parse(String(raw))
    if (message.id) {
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`))
      else pending.resolve(message.result ?? {})
      return
    }
    for (const listener of this.listeners.get(message.method) ?? []) listener(message.params ?? {})
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? []
    listeners.push(listener)
    this.listeners.set(method, listeners)
  }

  async send(method, params = {}) {
    await this.opened
    const id = this.nextId
    this.nextId += 1
    return new Promise((resolveCommand, rejectCommand) => {
      this.pending.set(id, { method, resolve: resolveCommand, reject: rejectCommand })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    if (this.socket.readyState === WebSocket.OPEN) this.socket.close()
  }
}

function detailFromException(params) {
  const detail = params.exceptionDetails ?? params
  return detail.exception?.description ?? detail.text ?? JSON.stringify(detail)
}

async function stopBrowser(browser, cdp) {
  if (!browser) return
  if (browser.exitCode === null && cdp) await cdp.send('Browser.close').catch(() => {})
  if (browser.exitCode === null) {
    await Promise.race([once(browser, 'exit'), delay(5_000)])
  }
  if (browser.exitCode === null) {
    browser.kill('SIGTERM')
    await Promise.race([once(browser, 'exit'), delay(5_000)])
  }
  if (browser.exitCode === null) throw new Error(`Eigener Browserprozess ${browser.pid} konnte nicht beendet werden.`)
}

async function closeServer(server) {
  if (!server?.listening) return
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => error ? rejectClose(error) : resolveClose())
  })
}

function makeWrittenAnswer(question) {
  const units = Array.from({ length: Math.max(question.minUnits, 3) }, (_, index) => (
    `Gedankenschritt ${index + 1}: Fakten, Begründung, Prüfschritt und Aussagegrenze bleiben getrennt`
  ))
  let answer = `${units.join('. ')}.`
  while (answer.length < question.minChars) answer += ' Der nächste Schritt bleibt beleggebunden und nachvollziehbar.'
  return answer
}

function makeNote(minimum) {
  let note = 'Fakten und offene Punkte werden getrennt; Vertrag und aktuelle Autorität bleiben zu prüfen.'
  while (note.length < minimum) note += ' Der nächste Schritt wird klar benannt.'
  return note
}

function makeCaseOutput(minimum) {
  let output = 'Ich trenne Aktenfakt, offene Angabe, Prüfschritt, Grenze und nächste Kundenrückmeldung.'
  while (output.length < minimum) output += ' Der Bearbeitungsstand bleibt nachvollziehbar.'
  return output
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...await listFiles(join(directory, entry.name), relativePath))
    else files.push(relativePath)
  }
  return files.sort()
}

async function assertFreshBuild() {
  const manifest = JSON.parse(await readFile(join(dist, 'build-manifest.json'), 'utf8'))
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0, 'Build-Manifest enthält keine Laufzeitdateien')
  assert.equal(new Set(manifest.files).size, manifest.files.length, 'Build-Manifest enthält doppelte Dateien')
  assert.equal(manifest.files.includes('src/data/caseFile.js'), false, 'Obsoletes caseFile.js steht noch im Build-Manifest')
  for (const relativePath of manifest.files) {
    assert.equal(relativePath.includes('\\'), false, `Manifest-Pfad ist nicht portabel: ${relativePath}`)
    assert.equal(relativePath.startsWith('../') || relativePath.startsWith('/'), false, `Manifest-Pfad verlässt das Projekt: ${relativePath}`)
    const [sourceBytes, distBytes] = await Promise.all([
      readFile(join(root, relativePath)),
      readFile(join(dist, relativePath)),
    ])
    assert.deepEqual(distBytes, sourceBytes, `Dist-Datei ist gegenüber der Quelle veraltet: ${relativePath}`)
  }
  const actualFiles = await listFiles(dist)
  const expectedFiles = [...manifest.files, 'build-manifest.json'].sort()
  assert.deepEqual(actualFiles, expectedFiles, 'dist enthält fehlende oder nicht im Manifest geführte Dateien')
}

let server
let browser
let cdp
let temporaryProfile

try {
  await assertFreshBuild()

  server = startServer({ root: dist, port: 0, host })
  await once(server, 'listening')
  const address = server.address()
  assert.equal(typeof address, 'object')
  const origin = `http://${host}:${address.port}`

  const browserPath = await firstExisting([
    process.env.MAKLER_QA_BROWSER,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ])
  assert.equal(basename(browserPath).toLowerCase(), 'chrome.exe', `qa:browser verlangt echtes Google Chrome, erhalten: ${browserPath}`)
  temporaryProfile = await mkdtemp(join(tmpdir(), 'makler-browser-smoke-'))
  let browserStderr = ''
  try {
    browser = spawn(browserPath, [
      '--headless=new',
      '--remote-debugging-port=0',
      '--remote-allow-origins=*',
      `--user-data-dir=${temporaryProfile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-crash-reporter',
      '--disable-features=Translate',
      '--disable-sync',
      'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
  } catch (error) {
    throw new Error(`BROWSER_SPAWN_BLOCKED: Chrome konnte nicht gestartet werden (${error.code ?? 'unknown'}): ${error.message}`, { cause: error })
  }
  browser.stderr?.setEncoding('utf8')
  browser.stderr?.on('data', (chunk) => {
    browserStderr = `${browserStderr}${chunk}`.slice(-8_000)
  })

  const spawnBlocked = new Promise((_, reject) => {
    browser.once('error', (error) => {
      reject(new Error(`BROWSER_SPAWN_BLOCKED: Chrome konnte nicht gestartet werden (${error.code ?? 'unknown'}): ${error.message}`))
    })
  })
  const debuggingPort = await Promise.race([
    waitForDevTools(temporaryProfile, browser, () => browserStderr),
    spawnBlocked,
  ])
  const target = await waitForPageTarget(debuggingPort)
  cdp = new CdpClient(target.webSocketDebuggerUrl)
  await cdp.opened

  const diagnostics = []
  cdp.on('Runtime.exceptionThrown', (params) => diagnostics.push(`exception: ${detailFromException(params)}`))
  cdp.on('Runtime.consoleAPICalled', (params) => {
    if (!['error', 'warning', 'assert'].includes(params.type)) return
    const text = params.args?.map((item) => item.value ?? item.description ?? '').join(' ')
    diagnostics.push(`console.${params.type}: ${text}`)
  })
  cdp.on('Log.entryAdded', ({ entry }) => {
    if (['error', 'warning'].includes(entry?.level)) diagnostics.push(`log.${entry.level}: ${entry.text}`)
  })
  cdp.on('Network.responseReceived', ({ response }) => {
    if (response?.status >= 400) diagnostics.push(`HTTP ${response.status}: ${response.url}`)
  })
  cdp.on('Network.loadingFailed', ({ errorText, blockedReason, canceled, type }) => {
    diagnostics.push(`network.loadingFailed: ${errorText ?? 'unknown'}${blockedReason ? ` (${blockedReason})` : ''}${canceled ? ' [canceled]' : ''}${type ? ` ${type}` : ''}`)
  })

  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Runtime.enable'),
    cdp.send('Log.enable'),
    cdp.send('Network.enable'),
  ])
  const browserVersion = await cdp.send('Browser.getVersion')
  assert.match(browserVersion.product, /Chrome\//u, `qa:browser hat kein echtes Chrome-Produkt verbunden: ${browserVersion.product}`)

  async function evaluate(expression) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) throw new Error(detailFromException(result))
    return result.result?.value
  }

  async function call(fn, ...args) {
    return evaluate(`(${fn})(${args.map((value) => JSON.stringify(value)).join(',')})`)
  }

  async function waitFor(expression, label, timeout = 7_000) {
    const deadline = Date.now() + timeout
    let lastError
    while (Date.now() < deadline) {
      try {
        const value = await evaluate(expression)
        if (value) return value
      } catch (error) {
        lastError = error
      }
      await delay(50)
    }
    throw new Error(`DOM-Wartezeit überschritten: ${label}${lastError ? ` (${lastError.message})` : ''}`)
  }

  let navigationSequence = 0
  async function setViewport({ width, height }) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: height,
    })
  }

  async function navigate(hash, viewport, expectedView) {
    await setViewport(viewport)
    const diagnosticStart = diagnostics.length
    navigationSequence += 1
    const url = `${origin}/?qa=${navigationSequence}${hash}`
    await cdp.send('Page.navigate', { url })
    await waitFor(
      `document.readyState === 'complete' && document.querySelector('.view-shell[data-view="${expectedView}"]') !== null`,
      `${expectedView} bei ${viewport.width}px`,
    )
    if (expectedView === 'sources') {
      await waitFor("document.querySelector('.source-card, .error-banner') !== null", 'Quellenregister geladen')
    }
    await delay(100)
    const newDiagnostics = diagnostics.slice(diagnosticStart)
    assert.deepEqual(newDiagnostics, [], `${expectedView} @ ${viewport.width}px enthält Browserfehler`)
  }

  async function click(selector) {
    const clickState = await call((target) => {
      const element = document.querySelector(target)
      return {
        exists: element instanceof HTMLElement,
        disabled: element instanceof HTMLButtonElement && element.disabled,
      }
    }, selector)
    if (!clickState.exists) throw new Error(`Klickziel fehlt: ${selector}`)
    if (clickState.disabled) throw new Error(`Klickziel ist deaktiviert: ${selector}`)
    return call((target) => {
      const element = document.querySelector(target)
      element.click()
      return true
    }, selector)
  }

  async function setInput(selector, value) {
    return call((target, nextValue) => {
      const element = document.querySelector(target)
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        throw new Error(`Eingabefeld fehlt: ${target}`)
      }
      element.value = nextValue
      element.dispatchEvent(new Event('input', { bubbles: true }))
      return element.value.length
    }, selector, value)
  }

  async function clearLocalProgress() {
    await evaluate(`window.localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`)
  }

  async function assertRouteLayout(route, viewport) {
    const result = await call((expectedRoute, expectedWidth) => {
      const rootWidths = {
        html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }
      const documentWidth = Math.max(rootWidths.html, rootWidths.body)
      const activeRail = document.querySelector('.main-nav .is-active')
      const intentionalScrollSelector = '.practice-tabs, .table-scroll'
      const describeElement = (element, rect = element.getBoundingClientRect()) => {
        const className = typeof element.className === 'string'
          ? element.className.trim().replaceAll(/\s+/gu, '.')
          : ''
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${className ? `.${className}` : ''}`,
          text: element.textContent.trim().replaceAll(/\s+/gu, ' ').slice(0, 80),
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
        }
      }
      const isVisible = (element) => {
        if (element.closest('[inert], [aria-hidden="true"]')) return false
        if (typeof element.checkVisibility === 'function'
          && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && style.visibility !== 'collapse'
          && Number(style.opacity) !== 0
          && rect.width > 0
          && rect.height > 0
      }
      const scrollHosts = [...document.querySelectorAll(intentionalScrollSelector)].filter(isVisible)
      const containedScrollHosts = new Set(scrollHosts.filter((host) => {
        const overflowX = getComputedStyle(host).overflowX
        return host.scrollWidth > host.clientWidth + 1 && ['auto', 'scroll'].includes(overflowX)
      }))
      const outOfBounds = [...document.body.querySelectorAll('*')].flatMap((element) => {
        if (!isVisible(element)) return []
        const scrollHost = element.closest(intentionalScrollSelector)
        if (scrollHost !== element && containedScrollHosts.has(scrollHost)) return []
        const rect = element.getBoundingClientRect()
        if (rect.left >= -1 && rect.right <= window.innerWidth + 1) return []
        return [describeElement(element, rect)]
      })
      const scrollLeaks = scrollHosts.flatMap((host) => {
        const rect = host.getBoundingClientRect()
        const overflowX = getComputedStyle(host).overflowX
        const overflowAmount = host.scrollWidth - host.clientWidth
        const withinViewport = rect.left >= -1 && rect.right <= window.innerWidth + 1
        const containsOverflow = overflowAmount <= 1 || ['auto', 'scroll'].includes(overflowX)
        if (withinViewport && containsOverflow) return []
        return [{
          ...describeElement(host, rect),
          clientWidth: host.clientWidth,
          scrollWidth: host.scrollWidth,
          overflowAmount,
          overflowX,
        }]
      })
      const overflowContributors = [...document.body.querySelectorAll('*')].flatMap((element) => {
        const intentionalHost = element.closest(intentionalScrollSelector)
        if (containedScrollHosts.has(intentionalHost)) return []
        const rect = element.getBoundingClientRect()
        const internalOverflow = element.scrollWidth - element.clientWidth
        const boundaryOverflow = Math.max(-rect.left, rect.right - window.innerWidth, 0)
        if (internalOverflow <= 1 && boundaryOverflow <= 1) return []
        return [{
          ...describeElement(element, rect),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          internalOverflow,
          boundaryOverflow: Math.round(boundaryOverflow * 10) / 10,
          overflowX: getComputedStyle(element).overflowX,
          excluded: Boolean(element.closest('[inert], [aria-hidden="true"]')),
          visible: isVisible(element),
        }]
      }).sort((left, right) => (
        Math.max(right.internalOverflow, right.boundaryOverflow)
        - Math.max(left.internalOverflow, left.boundaryOverflow)
      )).slice(0, 12)
      const interactive = [...document.querySelectorAll([
        'a[href]',
        'button',
        'input:not([type="hidden"]):not(:disabled)',
        'textarea:not(:disabled)',
        'select:not(:disabled)',
        'label.file-action',
      ].join(','))]
      const undersized = interactive.flatMap((element) => {
        if (element instanceof HTMLInputElement && element.type === 'file') return []
        if (!isVisible(element)) return []
        const rect = element.getBoundingClientRect()
        if (rect.width >= 43.5 && rect.height >= 43.5) return []
        return [{
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.className ? `.${String(element.className).trim().replaceAll(/\s+/gu, '.')}` : ''}`,
          text: element.textContent.trim().slice(0, 55),
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        }]
      })
      return {
        view: document.querySelector('.view-shell[data-view]')?.dataset.view,
        innerWidth: window.innerWidth,
        documentWidth,
        rootWidths,
        activeView: activeRail?.dataset.view,
        overflow: documentWidth > window.innerWidth + 1,
        overflowContributors,
        outOfBounds,
        scrollLeaks,
        undersized,
        expectedRoute,
        expectedWidth,
      }
    }, route, viewport.width)
    assert.equal(result.view, route, `Falsche Ansicht für #/${route}`)
    assert.equal(result.activeView, route, `Desktop-Navigation markiert #/${route} nicht aktiv`)
    assert.equal(result.innerWidth, viewport.width, `Viewport ${viewport.width}px wurde nicht angewendet`)
    assert.deepEqual(result.outOfBounds, [], `${route} @ ${viewport.width}px hat sichtbare Elemente außerhalb des Viewports`)
    assert.deepEqual(result.scrollLeaks, [], `${route} @ ${viewport.width}px enthält absichtlich horizontale Bereiche nicht lokal`)
    assert.equal(
      result.overflow,
      false,
      `${route} @ ${viewport.width}px hat horizontale Dokumentüberbreite (${result.documentWidth}px; roots=${JSON.stringify(result.rootWidths)}; candidates=${JSON.stringify(result.overflowContributors)})`,
    )
    assert.deepEqual(result.undersized, [], `${route} @ ${viewport.width}px hat Interaktionsziele unter 44px`)
  }

  for (const viewport of viewports) {
    for (const route of routes) {
      await navigate(`#/${route}`, viewport, route)
      await assertRouteLayout(route, viewport)
    }
  }

  for (const viewport of viewports.filter(({ width }) => width <= 820)) {
    await navigate('#/sources', viewport, 'sources')
    await click('[data-action="drawer-open"]')
    await waitFor("document.querySelector('#mobile-navigation.is-open') !== null", 'mobiler Drawer geöffnet')
    await delay(250)
    await assertRouteLayout('sources', viewport)
    const drawer = await evaluate(`(() => {
      const host = document.querySelector('#mobile-navigation .drawer-nav')
      const active = host?.querySelector('.is-active[aria-current="page"]')
      const hostBox = host?.getBoundingClientRect()
      const activeBox = active?.getBoundingClientRect()
      return {
        current: active?.dataset.view,
        visible: Boolean(hostBox && activeBox && activeBox.top >= hostBox.top - 1 && activeBox.bottom <= hostBox.bottom + 1),
        bodyLocked: document.body.classList.contains('drawer-open') && getComputedStyle(document.body).overflow === 'hidden',
      }
    })()`)
    assert.deepEqual(drawer, { current: 'sources', visible: true, bodyLocked: true }, `Mobiler aktiver Eintrag @ ${viewport.width}px`)
    await click('#mobile-navigation .drawer-nav .is-active')
    await waitFor("!document.body.classList.contains('drawer-open')", 'Drawer-Scroll-Lock entfernt')
    assert.equal(await evaluate("getComputedStyle(document.body).overflow !== 'hidden'"), true)
  }

  const desktop = viewports.at(-1)
  await navigate('#/oral', desktop, 'oral')
  const hashBeforeSkip = await evaluate('window.location.hash')
  await click('.skip-link')
  const skipResult = await evaluate(`(() => {
    const link = document.querySelector('.skip-link')
    const focused = document.activeElement?.id
    link.focus()
    const rect = link.getBoundingClientRect()
    return {
      hash: window.location.hash,
      focused,
      width: rect.width,
      height: rect.height,
    }
  })()`)
  assert.equal(skipResult.hash, hashBeforeSkip, 'Skip-Link darf die Route nicht überschreiben')
  assert.equal(skipResult.focused, 'main-content', 'Skip-Link fokussiert nicht den Hauptinhalt')
  assert.ok(skipResult.width >= 44 && skipResult.height >= 44, 'Skip-Link ist kleiner als 44px')

  await clearLocalProgress()
  await navigate('#/today', desktop, 'today')
  await click('.today-brief [data-action="navigate"]')
  await waitFor(`window.location.hash === '#/learning-path/${learningOutcomes[0].id}'`, 'Today-Lektions-Deep-Link')
  assert.equal(await evaluate("document.querySelector('.lesson-line.is-targeted')?.dataset.target"), learningOutcomes[0].id)

  const firstOutcome = learningOutcomes[0]
  const correctIndex = firstOutcome.course.selfCheck.correctIndex
  const wrongIndex = (correctIndex + 1) % firstOutcome.course.selfCheck.options.length
  assert.equal(await evaluate("document.querySelector('[data-action=\"lesson-complete\"]')?.disabled"), true)
  await click(`[data-action="lesson-check"][data-index="${wrongIndex}"]`)
  assert.equal(await evaluate("document.querySelector('[data-action=\"lesson-complete\"]')?.disabled"), true)
  assert.equal(await evaluate("document.querySelector('.check-feedback')?.classList.contains('is-wrong')"), true)
  await click(`[data-action="lesson-check"][data-index="${correctIndex}"]`)
  assert.equal(await evaluate("document.querySelector('[data-action=\"lesson-complete\"]')?.disabled"), false)
  await click('[data-action="lesson-complete"]')
  const lessonProgress = await evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`)
  assert.ok(lessonProgress.completedLessons.includes(firstOutcome.id), 'Richtig geprüfte Lektion wurde nicht abgeschlossen')

  const written = writtenQuestions[0]
  await navigate(`#/written/${written.id}`, desktop, 'written')
  assert.equal(await evaluate("document.querySelector('.reference-panel') === null"), true)
  await click('[data-action="written-submit"]')
  assert.equal(await evaluate("document.querySelector('.reference-panel') === null"), true)
  await setInput('[data-input="written-answer"]', makeWrittenAnswer(written))
  await click('[data-action="written-submit"]')
  assert.equal(await evaluate("Boolean(document.querySelector('.reference-panel') && document.querySelector('.rubric-panel') && document.querySelector('[data-input=\"written-answer\"]').readOnly)"), true)
  await setViewport(viewports[0])
  await assertRouteLayout('written', viewports[0])
  const writtenDimensions = Object.keys(written.rubric)
  for (const [index, dimension] of writtenDimensions.entries()) {
    const score = index === 1 ? 0 : 1
    await click(`[data-action="score"][data-dimension="${dimension}"][data-score="${score}"]`)
  }
  await click('[data-action="practice-finish"]')
  const failedWritten = await evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`)
  const writtenReview = failedWritten.reviewQueue.find((item) => item.kind === 'written' && item.sourceId === written.id)
  assert.equal(writtenReview?.due, 'jetzt', 'Null in einer nicht-ersten schriftlichen Rubrikdimension muss sofort fällig sein')
  assert.match(writtenReview?.label ?? '', /Praxistauglichkeit/, 'Queue-Label nennt die fehlgeschlagene schriftliche Dimension nicht')
  await setViewport(desktop)
  await navigate('#/mistakes', desktop, 'mistakes')
  const writtenSourceSelector = `.queue-list.detailed [data-view="written"][data-target="${written.id}"]`
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(writtenSourceSelector)})?.closest('.queue-group')?.querySelector('h2')?.textContent`), 'jetzt')
  await click(writtenSourceSelector)
  await waitFor(`window.location.hash === '#/written/${written.id}'`, 'schriftlicher Queue-Deep-Link')
  await click('[data-action="practice-redo"]')
  assert.equal(await evaluate("document.querySelector('.reference-panel') === null && !document.querySelector('[data-input=\"written-answer\"]').readOnly"), true)

  const oral = oralQuestions[0]
  await navigate(`#/oral/${oral.id}`, viewports[0], 'oral')
  await assertRouteLayout('oral', viewports[0])
  assert.equal(await evaluate("document.querySelector('.locked-panel') !== null && document.querySelector('.oral-observation') === null"), true)
  assert.equal(await evaluate("document.querySelector('[data-action=\"oral-submit\"]')?.disabled"), true)
  await assert.rejects(() => click('[data-action="oral-submit"]'), /deaktiviert/)
  await setInput('[data-input="oral-note"]', makeNote(oral.minNoteChars + 300))
  assert.equal(await evaluate("document.querySelector('[data-action=\"oral-submit\"]')?.disabled"), false, 'Gültige Live-Notiz aktiviert die mündliche Abgabe nicht sofort')
  await click('[data-action="oral-submit"]')
  assert.equal(await evaluate("Boolean(document.querySelector('.oral-observation') && document.querySelector('.rubric-panel') && document.querySelector('[data-input=\"oral-note\"]').readOnly)"), true)
  await assertRouteLayout('oral', viewports[0])
  const oralDimensions = Object.keys(oral.rubric)
  for (const [index, dimension] of oralDimensions.entries()) {
    await click(`[data-action="score"][data-dimension="${dimension}"][data-score="${index === oralDimensions.length - 1 ? 0 : 1}"]`)
  }
  await click('[data-action="practice-finish"]')
  const failedOral = await evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`)
  const oralReview = failedOral.reviewQueue.find((item) => item.kind === 'oral' && item.sourceId === oral.id)
  assert.equal(oralReview?.due, 'jetzt', 'Null in einer nicht-ersten mündlichen Rubrikdimension muss sofort fällig sein')
  assert.match(oralReview?.label ?? '', /Schlüssige Argumentation/, 'Queue-Label nennt die fehlgeschlagene mündliche Dimension nicht')

  const timedOral = oralQuestions[1]
  const timerSeed = failedOral
  timerSeed.oralNotes[timedOral.id] = ''
  timerSeed.oralAttempts[timedOral.id] = {
    revealed: false,
    attempts: 0,
    elapsedSeconds: timedOral.minSeconds - 1,
    scores: {},
    submittedAt: null,
    completedAt: null,
  }
  await call((key, value) => localStorage.setItem(key, value), STORAGE_KEY, JSON.stringify(timerSeed))
  await navigate(`#/oral/${timedOral.id}`, viewports[0], 'oral')
  await assertRouteLayout('oral', viewports[0])
  assert.equal(await evaluate("document.querySelector('[data-action=\"oral-submit\"]')?.disabled"), true)
  await click('[data-action="timer-toggle"]')
  await delay(1_100)
  assert.equal(await evaluate("document.querySelector('[data-action=\"oral-submit\"]')?.disabled"), false, 'Erreichter Live-Timer aktiviert die mündliche Abgabe nicht sofort')
  await click('[data-action="timer-toggle"]')

  const seededProgress = createInitialProgress()
  seededProgress.reviewQueue = [
    { id: 'later-lesson', kind: 'lesson', sourceId: firstOutcome.id, label: 'Später · Lektion', due: 'später', createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'now-new', kind: 'oral', sourceId: oral.id, label: 'Jetzt · neuer', due: 'jetzt', createdAt: '2026-08-02T08:00:00.000Z' },
    { id: 'next-case', kind: 'case', sourceId: caseFiles[0].id, label: 'Als Nächstes · Fall', due: 'als Nächstes', createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'now-old', kind: 'written', sourceId: written.id, label: 'Jetzt · älter', due: 'jetzt', createdAt: '2026-08-01T08:00:00.000Z' },
  ]
  await call((key, value) => localStorage.setItem(key, value), STORAGE_KEY, JSON.stringify(seededProgress))
  await navigate('#/mistakes', desktop, 'mistakes')
  const queueOrder = await evaluate("[...document.querySelectorAll('.queue-list.detailed button')].map((button) => `${button.dataset.view}:${button.dataset.target}`)")
  assert.deepEqual(queueOrder, [
    `written:${written.id}`,
    `oral:${oral.id}`,
    `case-workshop:${caseFiles[0].id}`,
    `learning-path:${firstOutcome.id}`,
  ])
  await click('.queue-list.detailed button')
  await waitFor(`window.location.hash === '#/written/${written.id}'`, 'priorisierter Queue-Deep-Link')

  const denseQueueProgress = createInitialProgress()
  denseQueueProgress.reviewQueue = Array.from({ length: 12 }, (_, index) => ({
    id: `dense-${index}`,
    kind: index % 2 === 0 ? 'written' : 'oral',
    sourceId: index % 2 === 0 ? written.id : oral.id,
    label: `Sehr langer Wiederholungseintrag ${index + 1} · Fachliche Trennung, Praxistauglichkeit und schlüssige Argumentation mit dokumentiertem nächsten Kundenkontakt`,
    due: index % 3 === 0 ? 'jetzt' : index % 3 === 1 ? 'als Nächstes' : 'später',
    createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T08:00:00.000Z`,
  }))
  await call((key, value) => localStorage.setItem(key, value), STORAGE_KEY, JSON.stringify(denseQueueProgress))
  await navigate('#/mistakes', viewports[0], 'mistakes')
  await assertRouteLayout('mistakes', viewports[0])

  const allCompleteProgress = createInitialProgress()
  allCompleteProgress.completedLessons = learningOutcomes.map(({ id }) => id)
  await call((key, value) => localStorage.setItem(key, value), STORAGE_KEY, JSON.stringify(allCompleteProgress))
  await navigate('#/today', viewports[0], 'today')
  await assertRouteLayout('today', viewports[0])
  const completeToday = await evaluate(`(() => {
    const brief = document.querySelector('.today-brief')
    return {
      text: brief?.textContent ?? '',
      action: brief?.querySelector('.primary-action')?.textContent.trim() ?? '',
      queue: document.querySelector('.queue-preview')?.textContent ?? '',
    }
  })()`)
  assert.match(completeToday.text, /23 LEKTIONEN ABGESCHLOSSEN|vollständig bearbeitet/i)
  assert.match(completeToday.action, /^Lernpfad wiederholen(?:\s*→)?$/)
  assert.doesNotMatch(completeToday.text, /NÄCHSTE LEKTION/)
  assert.match(completeToday.queue, /Lernpfad vollständig/)

  await clearLocalProgress()
  const firstCase = caseFiles[0]
  const firstStep = firstCase.steps[0]
  await navigate(`#/case-workshop/${firstCase.id}`, viewports[0], 'case-workshop')
  await assertRouteLayout('case-workshop', viewports[0])
  const caseButtonSelector = `[data-action="case-step-complete"][data-step="${firstStep.id}"]`
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(caseButtonSelector)})?.disabled`), true)
  await assert.rejects(() => click(caseButtonSelector), /deaktiviert/)
  await setInput(`[data-input="case-output"][data-id="${firstStep.id}"]`, makeCaseOutput(firstStep.minChars + 600))
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(caseButtonSelector)})?.disabled`), false, 'Gültiger Live-Falloutput aktiviert den Abschluss nicht sofort')
  await click(caseButtonSelector)
  assert.equal(await evaluate(`Boolean(document.querySelector(${JSON.stringify(`.case-step.is-complete [data-input="case-output"][data-id="${firstStep.id}"]`)})?.readOnly)`), true)
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(caseButtonSelector)})?.disabled`), false, 'Abschluss zurücknehmen darf nicht deaktiviert sein')
  await assertRouteLayout('case-workshop', viewports[0])

  assert.deepEqual(diagnostics, [], 'Browserlauf enthält Console-, Runtime-, Log- oder HTTP-Fehler')
  process.stdout.write([
    `Browser DOM QA PASS: ${browserVersion.product} (${basename(browserPath)}).`,
    `${viewports.length * routes.length} Routen-/Viewport-Kombinationen: 320, 390, 820, 1440px.`,
    'Flows PASS: mobile Navigation, Skip-Link, Today-Deep-Link/Abschlusszustand, Lesson-Gate, Written-Retry, Oral-Notiz/Timer-Gates, Rubrikdimensionen, Review-Priorität/Deep-Links, Case-Output.',
    'Console/Runtime/HTTP/Network-loading errors: 0; Dokument-Overflow: 0; Element-Grenzverletzungen: 0; Scroll-Containment-Leaks: 0; sichtbare Interaktionsziele unter 44px: 0.',
  ].join('\n') + '\n')
} finally {
  let cleanupError
  try {
    await stopBrowser(browser, cdp)
  } catch (error) {
    cleanupError = error
  }
  cdp?.close()
  try {
    await closeServer(server)
  } catch (error) {
    cleanupError ??= error
  }
  if (temporaryProfile) {
    try {
      await rm(temporaryProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    } catch (error) {
      cleanupError ??= error
    }
  }
  if (cleanupError) throw cleanupError
}
