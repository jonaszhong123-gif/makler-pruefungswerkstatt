import {
  attachLegacyV1,
  createInitialProgress,
  exportProgress,
  failedRubricDimensionLabels,
  LEGACY_STORAGE_KEY,
  parseProgress,
  reviewDueForScores,
  STORAGE_KEY,
} from './utils/progress.js'
import { parseRouteHash, serializeRoute } from './utils/router.js'
import {
  isValidCaseOutput,
  isValidOralAttempt,
  isValidWrittenAnswer,
  removeReviewItemsForSource,
  scoreIsPassing,
  upsertReviewQueueItem,
} from './utils/workflow.js'
import {
  caseFiles,
  escapeHtml,
  learningOutcomes,
  mistakeDefinitions,
  navigation,
  navigationMarkup,
  oralQuestions,
  renderCurrentView,
  writtenQuestions,
} from './views/templates.js'

function loadProgress() {
  let current
  try {
    current = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return {
      progress: createInitialProgress(),
      error: 'Lokaler Fortschritt konnte nicht gelesen werden. Browserdaten wurden nicht verändert.',
      writeBlocked: false,
    }
  }

  if (current) {
    try {
      const progress = parseProgress(current)
      let legacy = null
      try {
        legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
      } catch {
        return {
          progress,
          error: 'Der aktuelle v2-Fortschritt wurde gelesen; das optionale v1-Archiv war nicht erreichbar.',
          writeBlocked: false,
        }
      }
      return {
        progress: legacy ? attachLegacyV1(progress, legacy) : progress,
        error: null,
        writeBlocked: false,
      }
    } catch {
      return {
        progress: createInitialProgress(),
        error: 'Die vorhandenen v2-Daten sind ungültig. Sie wurden nicht gelöscht oder überschrieben; ein geprüfter Import kann sie ausdrücklich ersetzen.',
        writeBlocked: true,
      }
    }
  }

  let legacy
  try {
    legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return {
      progress: createInitialProgress(),
      error: 'Lokaler Fortschritt konnte nicht gelesen werden. Browserdaten wurden nicht verändert.',
      writeBlocked: false,
    }
  }
  if (!legacy) return { progress: createInitialProgress(), error: null, writeBlocked: false }

  let migrated
  try {
    migrated = parseProgress(legacy)
  } catch {
    return {
      progress: createInitialProgress(),
      error: 'Die vorhandenen v1-Daten sind ungültig. Sie wurden nicht gelöscht oder überschrieben; ein geprüfter Import kann sie ausdrücklich ersetzen.',
      writeBlocked: true,
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return { progress: migrated, error: null, writeBlocked: false }
  } catch {
    return {
      progress: migrated,
      error: 'v1-Fortschritt wurde gelesen und im Arbeitsspeicher migriert, aber die v2-Speicherung ist noch nicht bestätigt.',
      writeBlocked: false,
    }
  }
}

const initial = loadProgress()
const validTargets = () => ({
  'learning-path': new Set(learningOutcomes.map((item) => item.id)),
  'case-workshop': new Set(caseFiles.map((item) => item.id)),
  written: new Set(writtenQuestions.map((item) => item.id)),
  oral: new Set(oralQuestions.map((item) => item.id)),
  mistakes: new Set(initial.progress.reviewQueue.map((item) => item.id)),
})
const firstRoute = parseRouteHash(window.location.hash, validTargets())
const state = {
  view: firstRoute.ignore ? 'today' : firstRoute.view,
  targetId: firstRoute.ignore ? null : firstRoute.targetId,
  chinese: false,
  progress: initial.progress,
  storageError: initial.error,
  storageWriteBlocked: initial.writeBlocked,
  actionStatus: '',
  sources: null,
  sourceError: null,
  sourceFilter: 'all',
  sourceQuery: '',
  timer: { id: null, running: false, elapsedSeconds: 0 },
}

let saveAnnouncementTimer
let saveHideTimer
let timerInterval

function clearSaveAnnouncement() {
  window.clearTimeout(saveAnnouncementTimer)
  window.clearTimeout(saveHideTimer)
  const toast = document.querySelector('#save-toast')
  if (toast) {
    toast.classList.remove('is-visible')
    toast.textContent = ''
  }
}

function announceSaved() {
  clearSaveAnnouncement()
  saveAnnouncementTimer = window.setTimeout(() => {
    const toast = document.querySelector('#save-toast')
    if (!toast) return
    toast.textContent = 'Lokal gespeichert'
    toast.classList.add('is-visible')
    saveHideTimer = window.setTimeout(clearSaveAnnouncement, 1800)
  }, 350)
}

function storageHintText() {
  return state.storageError ? 'Speicherung nicht bestätigt' : 'nur lokal gespeichert'
}

function syncStorageState() {
  const host = document.querySelector('#storage-status')
  if (host) host.innerHTML = storageErrorMarkup()
  document.querySelectorAll('[data-storage-hint]').forEach((hint) => {
    hint.textContent = storageHintText()
  })
}

function saveProgress({ announce = true, allowRecovery = false } = {}) {
  if (state.storageWriteBlocked && !allowRecovery) {
    state.storageError = 'Automatisches Speichern bleibt gesperrt, damit ungültige vorhandene Daten nicht überschrieben werden. Ein geprüfter Import kann sie ausdrücklich ersetzen.'
    clearSaveAnnouncement()
    syncStorageState()
    return false
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress))
    state.storageError = null
    if (allowRecovery) state.storageWriteBlocked = false
    syncStorageState()
    if (announce) announceSaved()
    return true
  } catch {
    state.storageError = 'Lokaler Fortschritt konnte nicht gespeichert werden. Prüfen Sie die Browser-Einstellungen.'
    clearSaveAnnouncement()
    syncStorageState()
    return false
  }
}

function updateProgress(updater, options) {
  state.progress = updater(state.progress)
  return saveProgress(options)
}

function storageErrorMarkup() {
  return state.storageError
    ? `<div class="error-banner" role="alert"><strong>Lokaler Speicherfehler</strong><span>${escapeHtml(state.storageError)}</span></div>`
    : ''
}

function focusMain() {
  const main = document.querySelector('#main-content')
  if (main instanceof HTMLElement) {
    main.focus({ preventScroll: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
}

function currentNavigation() {
  return navigation.find((item) => item.id === state.view) ?? navigation[0]
}

function render({ restoreMenuFocus = false, focusSelector = null } = {}) {
  document.body.classList.remove('drawer-open')
  const current = currentNavigation()
  document.querySelector('#root').innerHTML = `<a class="skip-link" href="#main-content" data-action="skip-content">Zum Inhalt springen</a><header class="mobile-topbar"><div class="mobile-brand"><span>Prüfungswerkstatt</span><strong>${escapeHtml(current.label)}</strong></div><button type="button" class="menu-button" data-action="drawer-open" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Navigation öffnen"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button></header><div class="app-frame"><aside class="app-rail"><header class="brand-block"><span class="brand-kicker">VERSICHERUNGSMAKLER</span><strong>Prüfungs<br>werkstatt</strong><p>Modul 1 / 2 · lokal</p></header><nav class="main-nav" aria-label="Hauptnavigation">${navigationMarkup(state, 'rail')}</nav><footer class="rail-footer"><button type="button" class="language-toggle" data-action="toggle-chinese" aria-pressed="${state.chinese}"><span>中文 Hilfe</span><i aria-hidden="true">${state.chinese ? 'AN' : 'AUS'}</i></button><p>Deutsch bleibt Normebene.</p><div class="scope-tag">M3 · EXCLUDED</div></footer></aside><main id="main-content" tabindex="-1"><div id="storage-status" aria-live="assertive">${storageErrorMarkup()}</div><div id="action-status" class="action-status" role="status" aria-live="polite">${escapeHtml(state.actionStatus)}</div>${renderCurrentView(state)}<div class="page-tools"><button type="button" class="back-to-top" data-action="back-to-top">Nach oben <span aria-hidden="true">↑</span></button></div><footer class="app-footer"><span>Makler Prüfungswerkstatt · localStorage</span><span>Keine offizielle Prüfungsplattform · keine Rechts- oder Vertragsberatung</span></footer></main></div><div class="nav-backdrop" data-action="drawer-close" hidden></div><aside id="mobile-navigation" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Hauptnavigation" aria-hidden="true" inert><header><div><span>Makler Prüfungswerkstatt</span><strong>${escapeHtml(current.label)}</strong></div><button type="button" class="drawer-close" data-action="drawer-close" aria-label="Navigation schließen">×</button></header><nav class="drawer-nav" aria-label="Hauptnavigation">${navigationMarkup(state, 'drawer')}</nav><footer><button type="button" class="language-toggle" data-action="toggle-chinese" aria-pressed="${state.chinese}"><span>中文 Hilfe</span><i aria-hidden="true">${state.chinese ? 'AN' : 'AUS'}</i></button><p>Deutsch bleibt Normebene.</p><div class="scope-tag">M3 · EXCLUDED</div></footer></aside>`
  if (restoreMenuFocus || focusSelector) {
    window.requestAnimationFrame(() => {
      const target = focusSelector
        ? document.querySelector(focusSelector)
        : document.querySelector('[data-action="drawer-open"]')
      if (target instanceof HTMLElement) target.focus({ preventScroll: true })
    })
  }
}

function setActionStatus(message) {
  state.actionStatus = message
  const host = document.querySelector('#action-status')
  if (host) host.textContent = message
}

function parseCurrentRoute() {
  return parseRouteHash(window.location.hash, {
    'learning-path': new Set(learningOutcomes.map((item) => item.id)),
    'case-workshop': new Set(caseFiles.map((item) => item.id)),
    written: new Set(writtenQuestions.map((item) => item.id)),
    oral: new Set(oralQuestions.map((item) => item.id)),
    mistakes: new Set(state.progress.reviewQueue.map((item) => item.id)),
  })
}

function pauseTimer({ persist = true } = {}) {
  if (!state.timer.running) return state.timer.elapsedSeconds
  window.clearInterval(timerInterval)
  state.timer.running = false
  if (persist && state.timer.id) {
    const id = state.timer.id
    const previous = state.progress.oralAttempts[id] ?? {
      revealed: false,
      attempts: 0,
      scores: {},
      submittedAt: null,
      completedAt: null,
    }
    updateProgress((progress) => ({
      ...progress,
      oralAttempts: {
        ...progress.oralAttempts,
        [id]: { ...previous, elapsedSeconds: state.timer.elapsedSeconds },
      },
    }), { announce: false })
  }
  return state.timer.elapsedSeconds
}

function navigate(view, targetId = null, restoreMenuFocus = false) {
  if (!navigation.some((item) => item.id === view)) return
  pauseTimer()
  state.actionStatus = ''
  const hash = serializeRoute({ view, targetId })
  if (window.location.hash === hash) {
    state.view = view
    state.targetId = targetId
    render({ restoreMenuFocus })
    focusMain()
    return
  }
  if (restoreMenuFocus) state.restoreMenuFocus = true
  window.location.hash = hash
}

function setDrawerBackgroundInert(isInert) {
  document.querySelectorAll('.skip-link, .mobile-topbar, .app-frame').forEach((element) => {
    if (element instanceof HTMLElement) element.inert = isInert
  })
}

function openDrawer() {
  const drawer = document.querySelector('#mobile-navigation')
  const backdrop = document.querySelector('.nav-backdrop')
  const toggle = document.querySelector('[data-action="drawer-open"]')
  if (!(drawer instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) return
  drawer.inert = false
  drawer.setAttribute('aria-hidden', 'false')
  drawer.classList.add('is-open')
  backdrop.hidden = false
  document.body.classList.add('drawer-open')
  toggle?.setAttribute('aria-expanded', 'true')
  setDrawerBackgroundInert(true)
  const navigationHost = drawer.querySelector('.drawer-nav')
  const activeItem = navigationHost?.querySelector('.is-active')
  if (navigationHost instanceof HTMLElement && activeItem instanceof HTMLElement) {
    const navigationBox = navigationHost.getBoundingClientRect()
    const activeBox = activeItem.getBoundingClientRect()
    const centeredOffset = (navigationHost.clientHeight - activeBox.height) / 2
    navigationHost.scrollTop += activeBox.top - navigationBox.top - Math.max(0, centeredOffset)
  }
  drawer.querySelector('button')?.focus()
}

function closeDrawer(restoreFocus = true) {
  const drawer = document.querySelector('#mobile-navigation')
  const backdrop = document.querySelector('.nav-backdrop')
  if (!(drawer instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) return
  drawer.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
  drawer.inert = true
  backdrop.hidden = true
  document.body.classList.remove('drawer-open')
  document.querySelector('[data-action="drawer-open"]')?.setAttribute('aria-expanded', 'false')
  setDrawerBackgroundInert(false)
  if (restoreFocus) document.querySelector('[data-action="drawer-open"]')?.focus()
}

function lessonCheck(id, selectedIndex) {
  const outcome = learningOutcomes.find((item) => item.id === id)
  if (!outcome) return
  const current = state.progress.lessonChecks[id]
  const correct = selectedIndex === outcome.course.selfCheck.correctIndex
  updateProgress((progress) => {
    const completedLessons = correct
      ? progress.completedLessons
      : progress.completedLessons.filter((item) => item !== id)
    const reviewQueue = correct
      ? progress.reviewQueue
      : upsertReviewQueueItem(progress.reviewQueue, {
        id: `lesson-${id}`,
        kind: 'lesson',
        sourceId: id,
        label: `${id} · Selbstcheck erneut bearbeiten`,
        due: 'jetzt',
        createdAt: new Date().toISOString(),
      })
    return {
      ...progress,
      completedLessons,
      reviewQueue,
      lessonChecks: {
        ...progress.lessonChecks,
        [id]: {
          selectedIndex,
          correct,
          attempts: (current?.attempts ?? 0) + 1,
          checkedAt: new Date().toISOString(),
        },
      },
    }
  })
  state.actionStatus = correct ? 'Selbstcheck richtig. Der bewusste Abschluss ist jetzt freigeschaltet.' : 'Antwort noch nicht belastbar. Die Lektion bleibt in der Wiederholung.'
  render({ focusSelector: `[data-action="lesson-check"][data-id="${id}"][data-index="${selectedIndex}"]` })
}

function toggleLessonCompletion(id) {
  const check = state.progress.lessonChecks[id]
  const completed = state.progress.completedLessons.includes(id)
  if (!completed && !check?.correct) {
    setActionStatus('Abschluss gesperrt: zuerst den Selbstcheck richtig beantworten.')
    return
  }
  updateProgress((progress) => {
    if (completed) {
      return {
        ...progress,
        completedLessons: progress.completedLessons.filter((item) => item !== id),
        reviewQueue: upsertReviewQueueItem(progress.reviewQueue, {
          id: `lesson-${id}`,
          kind: 'lesson',
          sourceId: id,
          label: `${id} · Lektion erneut beherrschen`,
          due: 'jetzt',
          createdAt: new Date().toISOString(),
        }),
      }
    }
    return {
      ...progress,
      completedLessons: [...progress.completedLessons, id],
      reviewQueue: removeReviewItemsForSource(progress.reviewQueue, 'lesson', id),
    }
  })
  state.actionStatus = completed ? 'Beherrschung zurückgenommen; die Lektion ist jetzt fällig.' : 'Lektion nach richtigem Selbstcheck abgeschlossen.'
  render({ focusSelector: `[data-action="lesson-complete"][data-id="${id}"]` })
}

function writtenAttempt(id) {
  return state.progress.writtenAttempts[id] ?? {
    revealed: false,
    attempts: 0,
    scores: {},
    submittedAt: null,
    completedAt: null,
  }
}

function oralAttempt(id) {
  return state.progress.oralAttempts[id] ?? {
    revealed: false,
    attempts: 0,
    elapsedSeconds: 0,
    scores: {},
    submittedAt: null,
    completedAt: null,
  }
}

function submitWritten(id) {
  const question = writtenQuestions.find((item) => item.id === id)
  const answer = state.progress.writtenAnswers[id] ?? ''
  if (!question || !isValidWrittenAnswer(answer, question.minChars, question.minUnits)) {
    setActionStatus(`Antwort noch nicht gültig: mindestens ${question?.minChars ?? 0} Zeichen und ${question?.minUnits ?? 0} getrennte Gedankenschritte.`)
    return
  }
  const previous = writtenAttempt(id)
  updateProgress((progress) => ({
    ...progress,
    writtenAttempts: {
      ...progress.writtenAttempts,
      [id]: {
        ...previous,
        revealed: true,
        attempts: previous.attempts + 1,
        scores: {},
        submittedAt: new Date().toISOString(),
        completedAt: null,
      },
    },
  }))
  state.actionStatus = 'Antwort fixiert. Referenzpunkte und Bewertungsraster sind jetzt sichtbar.'
  render()
}

function setScore(kind, sourceId, dimension, score) {
  const key = kind === 'written' ? 'writtenAttempts' : 'oralAttempts'
  const previous = kind === 'written' ? writtenAttempt(sourceId) : oralAttempt(sourceId)
  updateProgress((progress) => ({
    ...progress,
    [key]: {
      ...progress[key],
      [sourceId]: { ...previous, scores: { ...previous.scores, [dimension]: score } },
    },
  }))
  render({ focusSelector: `[data-action="score"][data-kind="${kind}"][data-source="${sourceId}"][data-dimension="${dimension}"][data-score="${score}"]` })
}

function reviewLabel(kind, sourceId) {
  const items = kind === 'written' ? writtenQuestions : oralQuestions
  return items.find((item) => item.id === sourceId)?.title ?? sourceId
}

function finishPractice(kind, sourceId) {
  const item = (kind === 'written' ? writtenQuestions : oralQuestions).find((entry) => entry.id === sourceId)
  const attempt = kind === 'written' ? writtenAttempt(sourceId) : oralAttempt(sourceId)
  if (!item || !attempt.revealed) return
  const dimensions = Object.keys(item.rubric)
  const completeScores = dimensions.every((dimension) => Number.isInteger(attempt.scores[dimension]))
  if (!completeScores) {
    setActionStatus('Bewertung unvollständig: für jede Dimension 0, 1 oder 2 wählen.')
    return
  }
  const passed = scoreIsPassing(attempt.scores, dimensions)
  const failedDimensions = failedRubricDimensionLabels(attempt.scores, dimensions)
  const key = kind === 'written' ? 'writtenAttempts' : 'oralAttempts'
  updateProgress((progress) => ({
    ...progress,
    [key]: {
      ...progress[key],
      [sourceId]: { ...attempt, completedAt: passed ? new Date().toISOString() : null },
    },
    reviewQueue: passed
      ? removeReviewItemsForSource(progress.reviewQueue, kind, sourceId)
      : upsertReviewQueueItem(progress.reviewQueue, {
        id: `review-${kind}-${sourceId}`,
        kind,
        sourceId,
        label: `${reviewLabel(kind, sourceId)} · ${failedDimensions.length ? `0 Punkte: ${failedDimensions.join(', ')}` : 'erneut beantworten'}`,
        due: reviewDueForScores(attempt.scores, dimensions),
        createdAt: new Date().toISOString(),
      }),
  }))
  state.actionStatus = passed
    ? 'Wiederholung bestanden; zugehörige Queue-Einträge wurden entfernt.'
    : 'Mindestens eine Dimension liegt unter der Schwelle 1; die Aufgabe bleibt in der Queue.'
  render()
}

function redoPractice(kind, sourceId) {
  const key = kind === 'written' ? 'writtenAttempts' : 'oralAttempts'
  const previous = kind === 'written' ? writtenAttempt(sourceId) : oralAttempt(sourceId)
  pauseTimer()
  const reset = {
    ...previous,
    revealed: false,
    scores: {},
    submittedAt: null,
    completedAt: null,
    ...(kind === 'oral' ? { elapsedSeconds: 0 } : {}),
  }
  updateProgress((progress) => ({
    ...progress,
    [key]: { ...progress[key], [sourceId]: reset },
  }))
  if (kind === 'oral') state.timer = { id: sourceId, running: false, elapsedSeconds: 0 }
  state.actionStatus = 'Neuer Versuch geöffnet; Hinweise und Raster sind wieder verborgen.'
  render()
}

function startOrPauseTimer(id) {
  if (state.timer.running && state.timer.id === id) {
    pauseTimer()
    state.actionStatus = 'Timer pausiert und lokal gespeichert.'
    render()
    return
  }
  pauseTimer()
  const saved = oralAttempt(id).elapsedSeconds
  state.timer = { id, running: true, elapsedSeconds: state.timer.id === id ? state.timer.elapsedSeconds : saved }
  timerInterval = window.setInterval(() => {
    state.timer.elapsedSeconds += 1
    const host = document.querySelector('#oral-timer')
    if (host) {
      const minutes = String(Math.floor(state.timer.elapsedSeconds / 60)).padStart(2, '0')
      const seconds = String(state.timer.elapsedSeconds % 60).padStart(2, '0')
      host.textContent = `${minutes}:${seconds}`
    }
    syncOralSubmitGate(id)
  }, 1000)
  render()
}

function resetTimer(id) {
  pauseTimer({ persist: false })
  const previous = oralAttempt(id)
  state.timer = { id, running: false, elapsedSeconds: 0 }
  updateProgress((progress) => ({
    ...progress,
    oralAttempts: { ...progress.oralAttempts, [id]: { ...previous, elapsedSeconds: 0 } },
  }))
  state.actionStatus = 'Timer zurückgesetzt.'
  render()
}

function syncOralSubmitGate(id) {
  const question = oralQuestions.find((item) => item.id === id)
  const button = [...document.querySelectorAll('[data-action="oral-submit"]')]
    .find((item) => item.dataset.source === id)
  if (!(button instanceof HTMLButtonElement) || !question) return
  const elapsedSeconds = state.timer.id === id ? state.timer.elapsedSeconds : oralAttempt(id).elapsedSeconds
  const notes = state.progress.oralNotes[id] ?? ''
  button.disabled = !isValidOralAttempt({
    elapsedSeconds,
    notes,
    minSeconds: question.minSeconds,
    minNoteChars: question.minNoteChars,
  })
}

function syncCaseStepGate(caseId, stepId, output) {
  const caseFile = caseFiles.find((item) => item.id === caseId)
  const step = caseFile?.steps.find((item) => item.id === stepId)
  const button = [...document.querySelectorAll('[data-action="case-step-complete"]')]
    .find((item) => item.dataset.case === caseId && item.dataset.step === stepId)
  if (!(button instanceof HTMLButtonElement) || !step) return
  const complete = state.progress.completedCaseSteps.includes(stepId)
  button.disabled = !complete && !isValidCaseOutput(output, step.minChars)
  const counter = [...document.querySelectorAll('[data-case-count]')]
    .find((item) => item.dataset.caseCount === stepId)
  if (counter) counter.textContent = `${output.trim().length} / ${step.minChars} Mindestzeichen`
}

function submitOral(id) {
  const question = oralQuestions.find((item) => item.id === id)
  if (!question) return
  const elapsedSeconds = state.timer.id === id ? pauseTimer() : oralAttempt(id).elapsedSeconds
  const notes = state.progress.oralNotes[id] ?? ''
  if (!isValidOralAttempt({
    elapsedSeconds,
    notes,
    minSeconds: question.minSeconds,
    minNoteChars: question.minNoteChars,
  })) {
    setActionStatus(`Versuch noch nicht gültig: ${question.minSeconds} Sekunden sprechen oder mindestens ${question.minNoteChars} Zeichen notieren.`)
    return
  }
  const previous = oralAttempt(id)
  updateProgress((progress) => ({
    ...progress,
    oralAttempts: {
      ...progress.oralAttempts,
      [id]: {
        ...previous,
        revealed: true,
        attempts: previous.attempts + 1,
        elapsedSeconds,
        scores: {},
        submittedAt: new Date().toISOString(),
        completedAt: null,
      },
    },
  }))
  state.actionStatus = 'Freier Versuch fixiert. Nachfragen, Beobachtungspunkte und Raster sind jetzt sichtbar.'
  render()
}

function recordError(kind, sourceId, code) {
  const definition = mistakeDefinitions.find((item) => item.code === code)
  if (!definition) return
  const id = `${kind}-${sourceId}-${code}`
  const now = new Date().toISOString()
  const due = definition.priority === 'sofort'
    ? 'jetzt'
    : definition.priority === 'Kurzrunde' ? 'später' : 'als Nächstes'
  const context = `${reviewLabel(kind, sourceId)}: ${definition.title}`
  updateProgress((progress) => ({
    ...progress,
    mistakes: [
      ...progress.mistakes.filter((item) => item.id !== id),
      { id, code, context, kind, sourceId, createdAt: now },
    ],
    reviewQueue: upsertReviewQueueItem(progress.reviewQueue, {
      id: `error-${id}`,
      kind,
      sourceId,
      label: context,
      due,
      createdAt: now,
    }),
  }))
  setActionStatus(`${code} protokolliert und unter „${due}“ eingeordnet.`)
}

function toggleCaseStep(caseId, stepId) {
  const caseFile = caseFiles.find((item) => item.id === caseId)
  const step = caseFile?.steps.find((item) => item.id === stepId)
  if (!caseFile || !step) return
  const complete = state.progress.completedCaseSteps.includes(stepId)
  const output = state.progress.caseOutputs[stepId] ?? ''
  if (!complete && !isValidCaseOutput(output, step.minChars)) {
    setActionStatus(`Schrittoutput noch nicht gültig: mindestens ${step.minChars} Zeichen.`)
    return
  }
  const reviewId = `case-${caseId}-${stepId}`
  updateProgress((progress) => ({
    ...progress,
    completedCaseSteps: complete
      ? progress.completedCaseSteps.filter((id) => id !== stepId)
      : [...progress.completedCaseSteps.filter((id) => id !== stepId), stepId],
    reviewQueue: complete
      ? upsertReviewQueueItem(progress.reviewQueue, {
        id: reviewId,
        kind: 'case',
        sourceId: caseId,
        label: `${caseFile.title} · ${step.title} erneut bearbeiten`,
        due: 'jetzt',
        createdAt: new Date().toISOString(),
      })
      : progress.reviewQueue.filter((item) => item.id !== reviewId),
  }))
  state.actionStatus = complete
    ? 'Abschluss zurückgenommen; der Fallschritt ist wieder fällig.'
    : 'Fallschritt mit vorhandenem Output abgeschlossen.'
  render()
}

function exportLocalProgress() {
  try {
    const blob = new Blob([exportProgress(state.progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `makler-pruefungswerkstatt-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setActionStatus('Lokale Fortschrittsdatei wurde zum Download vorbereitet.')
  } catch {
    setActionStatus('Export fehlgeschlagen; lokale Daten wurden nicht verändert.')
  }
}

async function importLocalProgress(input) {
  const file = input.files?.[0]
  if (!file) return
  const approved = window.confirm('Import ersetzt den aktuellen lokalen Fortschritt. Haben Sie bei Bedarf vorher exportiert?')
  if (!approved) {
    input.value = ''
    setActionStatus('Import abgebrochen; lokale Daten bleiben unverändert.')
    return
  }
  try {
    const imported = parseProgress(await file.text())
    const previousProgress = state.progress
    state.progress = imported
    if (!saveProgress({ allowRecovery: true })) {
      state.progress = previousProgress
      input.value = ''
      state.actionStatus = 'Import nicht übernommen: Der geprüfte Fortschritt konnte nicht lokal gespeichert werden.'
      render()
      return
    }
    state.actionStatus = 'Fortschritt geprüft und lokal importiert.'
    render()
  } catch {
    input.value = ''
    setActionStatus('Import abgelehnt: Datei entspricht keiner gültigen Fortschrittsversion.')
  }
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]')
  if (!(trigger instanceof HTMLElement)) return
  const action = trigger.dataset.action
  if (action === 'skip-content') {
    event.preventDefault()
    focusMain()
  } else if (action === 'navigate') {
    const fromDrawer = Boolean(trigger.closest('#mobile-navigation'))
    navigate(trigger.dataset.view, trigger.dataset.target ?? null, fromDrawer)
  } else if (action === 'drawer-open') openDrawer()
  else if (action === 'drawer-close') closeDrawer()
  else if (action === 'toggle-chinese') {
    state.chinese = !state.chinese
    render()
  } else if (action === 'back-to-top') focusMain()
  else if (action === 'source-filter') {
    state.sourceFilter = trigger.dataset.value
    render()
  } else if (action === 'lesson-check') lessonCheck(trigger.dataset.id, Number(trigger.dataset.index))
  else if (action === 'lesson-complete') toggleLessonCompletion(trigger.dataset.id)
  else if (action === 'written-submit') submitWritten(trigger.dataset.source)
  else if (action === 'oral-submit') submitOral(trigger.dataset.source)
  else if (action === 'score') setScore(trigger.dataset.kind, trigger.dataset.source, trigger.dataset.dimension, Number(trigger.dataset.score))
  else if (action === 'practice-finish') finishPractice(trigger.dataset.kind, trigger.dataset.source)
  else if (action === 'practice-redo') redoPractice(trigger.dataset.kind, trigger.dataset.source)
  else if (action === 'timer-toggle') startOrPauseTimer(state.targetId ?? oralQuestions[0].id)
  else if (action === 'timer-reset') resetTimer(state.targetId ?? oralQuestions[0].id)
  else if (action === 'record-error') recordError(trigger.dataset.kind, trigger.dataset.source, trigger.dataset.code)
  else if (action === 'case-step-complete') toggleCaseStep(trigger.dataset.case, trigger.dataset.step)
  else if (action === 'export-progress') exportLocalProgress()
})

document.addEventListener('input', (event) => {
  const input = event.target
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return
  if (input.dataset.input === 'written-answer') {
    const id = input.dataset.id
    updateProgress((progress) => ({
      ...progress,
      writtenAnswers: { ...progress.writtenAnswers, [id]: input.value },
    }))
    const question = writtenQuestions.find((item) => item.id === id)
    const counter = document.querySelector('#answer-count')
    if (counter && question) counter.textContent = `${input.value.trim().length} Zeichen · mindestens ${question.minChars} und ${question.minUnits} Gedankenschritte`
  } else if (input.dataset.input === 'oral-note') {
    const id = input.dataset.id
    updateProgress((progress) => ({
      ...progress,
      oralNotes: { ...progress.oralNotes, [id]: input.value },
    }))
    syncOralSubmitGate(id)
  } else if (input.dataset.input === 'case-output') {
    const id = input.dataset.id
    updateProgress((progress) => ({
      ...progress,
      caseOutputs: { ...progress.caseOutputs, [id]: input.value },
    }))
    syncCaseStepGate(input.dataset.case, id, input.value)
  } else if (input.dataset.input === 'source-query') {
    state.sourceQuery = input.value
  }
})

document.addEventListener('change', (event) => {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  if (input.dataset.input === 'source-query') render()
  if (input.dataset.input === 'import-progress') importLocalProgress(input)
})

document.addEventListener('keydown', (event) => {
  const drawer = document.querySelector('#mobile-navigation.is-open')
  if (event.key === 'Escape' && drawer) {
    closeDrawer()
    return
  }
  if (event.key === 'Tab' && drawer) {
    const controls = [...drawer.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')]
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      last?.focus()
      event.preventDefault()
    } else if (!event.shiftKey && document.activeElement === last) {
      first?.focus()
      event.preventDefault()
    }
    return
  }
  const active = document.activeElement
  if (!(active instanceof HTMLElement) || !active.matches('.main-nav button, .drawer-nav button')) return
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const controls = [...active.parentElement.querySelectorAll('button')]
  const current = controls.indexOf(active)
  const direction = event.key === 'ArrowDown' ? 1 : -1
  controls[(current + direction + controls.length) % controls.length]?.focus()
  event.preventDefault()
})

window.addEventListener('hashchange', () => {
  const route = parseCurrentRoute()
  if (route.ignore) {
    focusMain()
    return
  }
  pauseTimer()
  state.view = route.view
  state.targetId = route.targetId
  state.actionStatus = ''
  const restoreMenuFocus = Boolean(state.restoreMenuFocus)
  state.restoreMenuFocus = false
  render({ restoreMenuFocus })
  focusMain()
})

window.addEventListener('beforeunload', () => pauseTimer())
window.matchMedia('(max-width: 820px)').addEventListener('change', (event) => {
  if (!event.matches) closeDrawer(false)
})

if (!window.location.hash || window.location.hash === '#main-content') {
  window.history.replaceState(null, '', serializeRoute({ view: 'today' }))
}

render()
fetch('./src/data/sources.json')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  })
  .then((data) => {
    state.sources = data
    if (state.view === 'sources') render()
  })
  .catch(() => {
    state.sourceError = 'Das lokale Quellenregister konnte nicht geladen werden.'
    if (state.view === 'sources') render()
  })
