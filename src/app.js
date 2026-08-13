import { caseSections } from './data/caseFile.js'
import { lessons, mistakeDefinitions, modules, oralQuestions, writtenQuestions } from './data/catalog.js'
import { createInitialProgress, parseProgress, STORAGE_KEY, toggleArrayItem, upsertReviewItem } from './utils/progress.js'

const navigation = [
  { id: 'today', label: 'Heute', number: '01' },
  { id: 'exam-plan', label: 'Prüfungsplan', number: '02' },
  { id: 'learning-path', label: 'Lernpfad', number: '03' },
  { id: 'case-workshop', label: 'Fallwerkstatt', number: '04' },
  { id: 'written', label: 'Schriftlich', number: '05' },
  { id: 'oral', label: 'Mündlich', number: '06' },
  { id: 'mistakes', label: 'Fehler', number: '07' },
  { id: 'sources', label: 'Quellen', number: '08' },
]

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return { progress: raw ? parseProgress(raw) : createInitialProgress(), error: null }
  } catch {
    return {
      progress: createInitialProgress(),
      error: 'Lokaler Fortschritt konnte nicht gelesen werden. Die Sitzung läuft ohne verlässliche Speicherung.',
    }
  }
}

const initialHash = parseHash()
const initial = loadProgress()
const state = {
  view: initialHash.view,
  lessonTarget: initialHash.lessonId,
  chinese: false,
  progress: initial.progress,
  storageError: initial.error,
  caseIndex: 0,
  writtenId: writtenQuestions[0].id,
  oralId: oralQuestions[0].id,
  sourceFilter: 'all',
  sourceQuery: '',
  sources: null,
  sourceError: null,
}

function parseHash() {
  const [candidate = '', encodedLesson = ''] = window.location.hash.replace(/^#\/?/, '').split('/')
  const view = navigation.some((item) => item.id === candidate) ? candidate : 'today'
  let lessonId = null
  if (view === 'learning-path' && encodedLesson) {
    try {
      const decoded = decodeURIComponent(encodedLesson)
      if (lessons.some((lesson) => lesson.id === decoded)) lessonId = decoded
    } catch {
      lessonId = null
    }
  }
  return { view, lessonId }
}

let saveAnnouncementTimer
let saveHideTimer

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
    saveHideTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible')
      toast.textContent = ''
    }, 1800)
  }, 450)
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress))
    state.storageError = null
    announceSaved()
  } catch {
    state.storageError = 'Lokaler Fortschritt konnte nicht gespeichert werden. Prüfen Sie die Browser-Einstellungen.'
    clearSaveAnnouncement()
  }
  syncStorageStatus()
}

function updateProgress(updater) {
  state.progress = updater(state.progress)
  saveProgress()
}

function statusLabel(status) {
  return `<span class="status-label status-${escapeHtml(status)}">${escapeHtml(status)}</span>`
}

function sourceStatusLabel(status) {
  return `<span class="source-status source-${escapeHtml(status)}">${escapeHtml(status)}</span>`
}

function moduleStamp(code) {
  const [module, subject] = code.split('-')
  return `<span class="module-stamp" aria-label="${escapeHtml(code)}"><span>${escapeHtml(module)}</span><strong>${escapeHtml(subject)}</strong></span>`
}

function bilingual(text, className = '') {
  return `<span class="${escapeHtml(className)}"><span>${escapeHtml(text.de)}</span>${state.chinese ? `<span class="zh-help" lang="zh-Hans">${escapeHtml(text.zh)}</span>` : ''}</span>`
}

function pageHeader(eyebrow, title, intro, marker) {
  return `<header class="page-header"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="page-intro">${escapeHtml(intro)}</p></div><div class="folio-mark" aria-hidden="true">${escapeHtml(marker)}</div></header>`
}

function emptyState(title, body) {
  return `<div class="empty-state" role="status"><span class="empty-rule" aria-hidden="true"></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div>`
}

function storageErrorMarkup() {
  return state.storageError ? `<div class="error-banner" role="alert"><strong>Lokaler Speicherfehler</strong><span>${escapeHtml(state.storageError)}</span></div>` : ''
}

function storageHintText() {
  return state.storageError ? 'Speicherung nicht bestätigt' : 'lokal gespeichert'
}

function syncStorageStatus() {
  const host = document.querySelector('#storage-status')
  if (host) host.innerHTML = storageErrorMarkup()
  document.querySelectorAll('.storage-hint').forEach((hint) => {
    hint.textContent = storageHintText()
  })
}

function focusMain() {
  document.querySelector('#main-content')?.focus({ preventScroll: true })
}

function focusControl(action, key, value) {
  const controls = [...document.querySelectorAll(`[data-action="${action}"]`)]
  const target = key ? controls.find((control) => control.dataset[key] === value) : controls[0]
  if (target instanceof HTMLElement) target.focus({ preventScroll: true })
  else focusMain()
}

function focusLessonTarget() {
  if (!state.lessonTarget) return false
  const target = document.querySelector(`[data-action="toggle-lesson"][data-id="${CSS.escape(state.lessonTarget)}"]`)
  if (!(target instanceof HTMLElement)) return false
  const topbar = document.querySelector('.mobile-topbar')
  const topbarOffset = topbar instanceof HTMLElement && getComputedStyle(topbar).display !== 'none'
    ? topbar.getBoundingClientRect().height + 16
    : 24
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - topbarOffset)
  window.scrollTo({ top, left: 0, behavior: 'auto' })
  target.focus({ preventScroll: true })
  return true
}

function statusTermTooltip() {
  return `<span class="term-help"><button type="button" class="status-term" data-action="toggle-tooltip" aria-expanded="false" aria-controls="derived-tooltip" aria-describedby="derived-tooltip">derived</button><span class="term-tooltip" id="derived-tooltip" role="tooltip">Didaktisch aus bestätigten Lernergebnissen abgeleitet; keine amtliche Vorgabe und keine Vertragsaussage.</span></span>`
}

function renderToday() {
  const dateLabel = new Intl.DateTimeFormat('de-AT', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())
  const nextLesson = lessons.find((lesson) => !state.progress.completedLessons.includes(lesson.id))
  const nextReview = state.progress.reviewQueue[0]
  const nextView = nextReview ? 'mistakes' : nextLesson ? 'learning-path' : 'case-workshop'
  const brief = nextReview
    ? `<h2>${escapeHtml(nextReview.label)}</h2><p>Fällig: ${escapeHtml(nextReview.due)}. Der Eintrag stammt aus deiner lokalen Wiederholungsqueue.</p>`
    : nextLesson
      ? `${moduleStamp(nextLesson.module)}<h2>${bilingual(nextLesson.title)}</h2><p>${bilingual(nextLesson.purpose)}</p>`
      : '<h2>Fallakte erneut lesen</h2><p>Alle Lernschritte sind lokal markiert. Eine neue Fallvariante ist im v0 noch nicht hinterlegt.</p>'

  const moduleRows = modules.map((module) => {
    const moduleLessons = lessons.filter((lesson) => lesson.module === module.code)
    const done = moduleLessons.filter((lesson) => state.progress.completedLessons.includes(lesson.id)).length
    return `<button class="ledger-row" type="button" data-action="navigate" data-view="${module.mode === 'schriftlich' ? 'written' : 'oral'}" data-module="${escapeHtml(module.code)}">${moduleStamp(module.code)}<span class="ledger-name"><strong>${escapeHtml(module.shortTitle)}</strong><small>${escapeHtml(module.mode)} · ${escapeHtml(module.duration)}</small></span><span class="ledger-progress">${done} / ${moduleLessons.length} Lernschritte</span><span class="row-arrow" aria-hidden="true">↗</span></button>`
  }).join('')

  const queue = state.progress.reviewQueue.length === 0
    ? emptyState('Noch kein Eintrag', 'Nach einer schriftlichen oder mündlichen Selbstprüfung erscheinen hier konkrete Wiederholungen.')
    : `<ol class="queue-list">${state.progress.reviewQueue.slice(0, 3).map((item) => `<li><span>${escapeHtml(item.due)}</span><strong>${escapeHtml(item.label)}</strong></li>`).join('')}</ol>`

  const lessonAttribute = nextLesson && !nextReview ? ` data-lesson="${escapeHtml(nextLesson.id)}"` : ''
  return `<div class="view-shell" data-view="today"><section class="today-lead"><aside class="today-brief" aria-label="Heutiger Arbeitsauftrag"><div class="brief-number">01</div><p class="micro-label">HEUTIGER ARBEITSAUFTRAG</p>${brief}<button class="primary-action" type="button" data-action="navigate" data-view="${nextView}"${lessonAttribute}>${nextReview ? 'Wiederholung öffnen' : nextLesson ? 'Nächsten Lernschritt öffnen' : 'Fallakte weiterführen'}<span aria-hidden="true">→</span></button><div class="brief-foot">Kein Gesamt-Passwert · kein Prognosewert</div></aside><div class="lead-copy"><p class="eyebrow">${escapeHtml(dateLabel)}</p><h1>Heute nicht mehr lernen.<br><em>Besser entscheiden.</em></h1><p>Die Werkstatt trainiert den Weg von der unvollständigen Akte zur begründeten Entscheidung — mit sichtbaren Grenzen statt erfundener Sicherheit.</p><figure class="today-visual"><img src="./src/assets/makler-workflow-abstract.png" alt="Abstrakte Papierkomposition mit einer dunkelgrünen Prüflinie, die mehrere Entscheidungspunkte verbindet." width="1536" height="1024"><figcaption>Vom Sachverhalt über Prüfpunkte zur belastbaren Entscheidung.</figcaption></figure></div></section><section class="module-ledger" aria-labelledby="module-ledger-title"><div class="section-heading"><p class="micro-label">VIER GETRENNTE GEGENSTÄNDE</p><h2 id="module-ledger-title">Dein Stand, ohne erfundene Gesamtquote</h2></div><div class="ledger-lines">${moduleRows}</div></section><section class="today-lower"><div class="queue-preview"><p class="micro-label">WIEDERHOLUNGSQUEUE</p>${queue}</div><blockquote><p>„Erst verstehen, was den Betrieb handlungsunfähig macht. Dann prüfen, welche Antwort wirklich trägt.“</p><footer>Arbeitsprinzip · ${statusTermTooltip()}</footer></blockquote></section></div>`
}

function renderExamPlan() {
  const lines = modules.map((module) => `<article class="exam-line">${moduleStamp(module.code)}<div class="exam-main"><p class="micro-label">${escapeHtml(module.module)} · ${escapeHtml(module.mode)}</p><h2>${escapeHtml(module.title)}</h2><p class="duration-line">${escapeHtml(module.duration)}</p></div><div class="exam-criteria"><p class="micro-label">BEWERTUNG</p><ul>${module.criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join('')}</ul><p class="evidence-line">${statusLabel('confirmed')} ${escapeHtml(module.evidence)}</p></div></article>`).join('')
  return `<div class="view-shell" data-view="exam-plan">${pageHeader('PRÜFUNGSPLAN · NUR MODUL 1 UND 2', 'Vier Gegenstände. Vier eigene Beweislasten.', 'Die Struktur folgt der aktuellen WKO-Befähigungsprüfungsordnung. Modul 3 / Unternehmerprüfung bleibt außerhalb dieses v0.', '02')}<section class="exam-ledger" aria-label="Prüfungsgegenstände">${lines}</section><aside class="scope-exclusion"><span>EXCLUDED</span><div><strong>Modul 3 · Unternehmerprüfung gemäß § 25 GewO 1994</strong><p>Bewusst nicht Teil von Inhalt, Navigation oder Fortschrittslogik dieses v0.</p></div></aside><p class="source-footnote">Prüfungsaufgaben sind praxisorientiert. Modul 1 bewertet fachliche Richtigkeit und Praxistauglichkeit; Modul 2 zusätzlich die schlüssige Argumentation getroffener Entscheidungen.</p></div>`
}

function renderLearningPath() {
  const chapters = modules.map((module, moduleIndex) => {
    const entries = lessons.filter((lesson) => lesson.module === module.code)
    const lessonRows = entries.map((lesson) => {
      const done = state.progress.completedLessons.includes(lesson.id)
      const targeted = lesson.id === state.lessonTarget
      return `<button type="button" class="lesson-line ${done ? 'is-done' : ''} ${targeted ? 'is-targeted' : ''}" data-action="toggle-lesson" data-id="${escapeHtml(lesson.id)}" aria-pressed="${done}"${targeted ? ` aria-label="Nächster Lernschritt: ${escapeHtml(lesson.title.de)}"` : ''}><span class="paper-check" aria-hidden="true">${done ? '×' : ''}</span><span class="lesson-copy"><strong>${bilingual(lesson.title)}</strong><small>${bilingual(lesson.purpose)}</small></span>${statusLabel('derived')}</button>`
    }).join('')
    return `<section class="path-chapter"><div class="chapter-index">${String(moduleIndex + 1).padStart(2, '0')}</div><div class="chapter-body"><div class="chapter-title">${moduleStamp(module.code)}<div><p class="micro-label">${escapeHtml(module.mode)}</p><h2>${escapeHtml(module.shortTitle)}</h2></div></div><div class="lesson-lines">${lessonRows}</div></div></section>`
  }).join('')
  return `<div class="view-shell" data-view="learning-path">${pageHeader('LERNPFAD · DIDAKTISCHE ABLEITUNG', 'Vom Aktenrand zur belastbaren Antwort.', 'Dieser Lernpfad ist keine amtliche Reihenfolge. Er übersetzt die bestätigten Lernergebnisse in wiederholbare Denkbewegungen.', '03')}<div class="path-spine">${chapters}</div></div>`
}

function renderCaseWorkshop() {
  const active = caseSections[state.caseIndex]
  const completed = state.progress.completedCaseSteps.includes(active.id)
  const note = state.progress.notes[`case:${active.id}`] ?? ''
  const index = caseSections.map((section, sectionIndex) => `<button type="button" data-action="case-section" data-index="${sectionIndex}" class="${sectionIndex === state.caseIndex ? 'is-active' : ''}" ${sectionIndex === state.caseIndex ? 'aria-current="step"' : ''}><span>${section.index}</span>${bilingual(section.title)}${state.progress.completedCaseSteps.includes(section.id) ? '<i aria-label="bearbeitet">×</i>' : ''}</button>`).join('')
  const items = active.items.map((item, itemIndex) => `<li><span class="item-number">${String(itemIndex + 1).padStart(2, '0')}</span><div class="item-copy"><p>${escapeHtml(item.de)}</p>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(item.zh)}</p>` : ''}</div>${statusLabel(item.status)}</li>`).join('')
  return `<div class="view-shell" data-view="case-workshop">${pageHeader('FALLAKTEN-WERKSTATT · ORIGINALFALL', 'Kaffeerösterei Morgenrot e.U.', 'Erstgespräch. Unvollständige Unterlagen. Kein fertiges Produktziel. Du arbeitest die Akte Schicht für Schicht durch.', '04')}<div class="case-desk"><nav class="case-index" aria-label="Abschnitte der Kundenakte">${index}</nav><article class="case-sheet" aria-labelledby="case-section-title"><header class="case-sheet-head"><div><p class="micro-label">AKTE MR–01 · BLATT ${active.index} / 08</p><h2 id="case-section-title">${bilingual(active.title)}</h2>${active.intro ? `<p>${bilingual(active.intro)}</p>` : ''}</div><span class="case-seal ${completed ? 'is-complete' : ''}">${completed ? 'bearbeitet' : 'offen'}</span></header><ol class="case-items">${items}</ol><label class="work-note"><span>Eigene Arbeitsnotiz <small class="storage-hint">${escapeHtml(storageHintText())}</small></span><textarea data-input="case-note" data-id="${escapeHtml(active.id)}" placeholder="Welche Annahme musst du hier noch prüfen?" rows="4">${escapeHtml(note)}</textarea></label><footer class="case-actions"><button type="button" class="text-action" data-action="case-move" data-direction="-1" ${state.caseIndex === 0 ? 'disabled' : ''}>← Voriges Blatt</button><button type="button" class="primary-action compact" data-action="case-complete">${completed ? 'Markierung lösen' : 'Als bearbeitet markieren'}</button><button type="button" class="text-action" data-action="case-move" data-direction="1" ${state.caseIndex === caseSections.length - 1 ? 'disabled' : ''}>Nächstes Blatt →</button></footer></article><aside class="case-gate" aria-label="Entscheidungssperre"><p class="micro-label">ENTSCHEIDUNGSTOR</p><strong>INSUFFICIENT_EVIDENCE</strong><p>Vertrags-, Wert- und Ablaufdaten fehlen. Eine konkrete Produktempfehlung wäre nicht belastbar.</p><button type="button" disabled>Produktempfehlung erstellen</button><small>disabled · CONTRACT_CHECK_REQUIRED</small></aside></div></div>`
}

function renderWritten() {
  const active = writtenQuestions.find((question) => question.id === state.writtenId) ?? writtenQuestions[0]
  const answer = state.progress.writtenAnswers[active.id] ?? ''
  const reviewed = state.progress.writtenReviewed.includes(active.id)
  const tabs = writtenQuestions.map((question, index) => `<button type="button" data-action="written-select" data-id="${escapeHtml(question.id)}" class="${question.id === active.id ? 'is-active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span>${moduleStamp(question.module)}<strong>${escapeHtml(question.title)}</strong>${state.progress.writtenAnswers[question.id]?.trim() ? '<i aria-label="Antwort vorhanden">×</i>' : ''}</button>`).join('')
  const reference = reviewed ? `<section class="reference-panel" aria-label="Referenzpunkte"><p class="micro-label">REFERENZPUNKTE · KEINE MUSTERLÖSUNG</p><ul>${active.referencePoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul><div class="error-picker"><p>Welcher Fehler war in deiner Antwort sichtbar?</p><div>${['F1', 'U1', 'R1', 'P1', 'K1', 'N1'].map((code) => `<button type="button" data-action="record-error" data-code="${code}">${code}</button>`).join('')}</div></div></section>` : ''
  return `<div class="view-shell" data-view="written">${pageHeader('SCHRIFTLICH · ORIGINALE ÜBUNGEN', 'Nicht erraten. Sichtbar herleiten.', 'Vier eigenständige Übungsaufgaben, abgeleitet aus den bestätigten Lernergebnissen. Keine offizielle Prüfungsfrage und keine Erfolgsprognose.', '05')}<div class="practice-layout"><nav class="practice-tabs" aria-label="Schriftliche Aufgaben">${tabs}</nav><article class="practice-sheet"><div class="practice-prompt">${moduleStamp(active.module)}<p class="micro-label">AUFGABE · NICHT OFFIZIELL</p><h2>${escapeHtml(active.title)}</h2><p>${escapeHtml(active.prompt)}</p>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(active.promptZh)}</p>` : ''}</div><label class="answer-field"><span>Arbeitsantwort <small class="storage-hint">${escapeHtml(storageHintText())}</small></span><textarea rows="12" data-input="written-answer" data-id="${escapeHtml(active.id)}" placeholder="Trenne Fakten, Ableitungen, unknown und den nächsten Prüfschritt …">${escapeHtml(answer)}</textarea></label><div class="answer-actions"><span id="answer-count">${answer.trim().length === 0 ? 'Noch keine Antwort' : `${answer.trim().length} Zeichen lokal`}</span><button type="button" class="primary-action compact" data-action="written-reveal" ${answer.trim().length < 20 ? 'disabled' : ''}>Referenzpunkte prüfen</button></div>${reference}</article></div></div>`
}

function renderOral() {
  const active = oralQuestions.find((question) => question.id === state.oralId) ?? oralQuestions[0]
  const assessment = state.progress.oralAssessments[active.id]
  const list = oralQuestions.map((question, index) => `<button type="button" data-action="oral-select" data-id="${escapeHtml(question.id)}" class="${question.id === active.id ? 'is-active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(question.title)}</strong><small>${escapeHtml(question.module)}</small></button>`).join('')
  const choices = ['klar', 'lückenhaft', 'Vertragsgrenze übergangen'].map((value) => `<button type="button" data-action="oral-assess" data-value="${escapeHtml(value)}" class="${assessment === value ? 'is-selected' : ''}" aria-pressed="${assessment === value}">${escapeHtml(value)}</button>`).join('')
  return `<div class="view-shell" data-view="oral">${pageHeader('MÜNDLICH · ORIGINALE NACHFRAGEN', 'Die Entscheidung muss hörbar tragen.', 'Sprich frei: Ausgangslage, Prüfpfad, Grenze, Entscheidung, nächster Schritt. Bewerte danach nur die sichtbare Antwortqualität.', '06')}<div class="oral-stage"><nav class="oral-list" aria-label="Mündliche Fragen">${list}</nav><article class="oral-prompt"><div class="oral-meta">${moduleStamp(active.module)}<span>ORIGINALÜBUNG · NICHT OFFIZIELL</span></div><blockquote>${escapeHtml(active.prompt)}</blockquote>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(active.promptZh)}</p>` : ''}<div class="observation-strip"><p class="micro-label">BEOBACHTUNGSPUNKTE</p><ul>${active.observationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul></div><fieldset class="self-assessment"><legend>Selbsteinschätzung nach dem Sprechen</legend>${choices}</fieldset></article></div></div>`
}

function renderMistakes() {
  const queue = state.progress.reviewQueue.length === 0
    ? emptyState('Queue ist leer', 'Bewerte eine schriftliche oder mündliche Übung. Erst dann wird ein echter Wiederholungsgrund angelegt.')
    : `<ol class="queue-list detailed">${state.progress.reviewQueue.map((item) => `<li><span>${escapeHtml(item.due)}</span><strong>${escapeHtml(item.label)}</strong><button type="button" data-action="remove-queue" data-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)} aus der Queue entfernen">erledigt</button></li>`).join('')}</ol>`
  const log = state.progress.mistakes.length === 0
    ? emptyState('Noch kein Fehler protokolliert', 'Das ist kein Nullwert und kein Leistungsurteil — es liegt lediglich noch keine Selbstklassifikation vor.')
    : `<ul>${state.progress.mistakes.slice(0, 8).map((entry) => `<li><strong>${escapeHtml(entry.code)}</strong><span>${escapeHtml(entry.context)}</span><time datetime="${escapeHtml(entry.createdAt)}">${new Intl.DateTimeFormat('de-AT').format(new Date(entry.createdAt))}</time></li>`).join('')}</ul>`
  const catalog = mistakeDefinitions.map((item) => `<article><span>${escapeHtml(item.code)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(item.descriptionZh)}</p>` : ''}</div><small>${escapeHtml(item.priority)}</small></article>`).join('')
  return `<div class="view-shell" data-view="mistakes">${pageHeader('FEHLER & WIEDERHOLUNG', 'Nicht zählen, sondern zurückführen.', 'Jeder Fehler verweist auf den gebrochenen Prüfschritt. Priorität entsteht aus der Art des Fehlers, nicht aus einer erfundenen Punktzahl.', '07')}<div class="mistake-layout"><section class="review-queue" aria-labelledby="queue-title"><div class="section-heading"><p class="micro-label">LOKALE QUEUE</p><h2 id="queue-title">Wiederholen</h2></div>${queue}</section><section class="mistake-log" aria-labelledby="log-title"><div class="section-heading"><p class="micro-label">BEOBACHTETE FEHLER</p><h2 id="log-title">Protokoll</h2></div>${log}</section></div><section class="error-catalog" aria-labelledby="catalog-title"><div class="section-heading"><p class="micro-label">FEHLERCODES</p><h2 id="catalog-title">Was genau brach?</h2></div><div class="error-lines">${catalog}</div></section></div>`
}

function renderSources() {
  const header = pageHeader(`QUELLENREGISTER · STAND ${state.sources?.asOf ?? 'loading'}`, 'Gültigkeit steht vor Stoffmenge.', state.sources?.authorityRule ?? 'Die strukturierten Quellen werden lokal geladen.', '08')
  if (state.sourceError) {
    return `<div class="view-shell" data-view="sources">${header}<div class="error-banner" role="alert"><strong>Quellenfehler</strong><span>${escapeHtml(state.sourceError)}</span></div>${emptyState('Register nicht verfügbar', 'Der Fehler wird sichtbar gehalten. Es werden keine Ersatzquellen oder Annahmen eingesetzt.')}</div>`
  }
  if (!state.sources) return `<div class="view-shell" data-view="sources">${header}${emptyState('Quellen werden geladen', 'Das lokale Register wird geprüft.')}</div>`
  const normalized = state.sourceQuery.trim().toLocaleLowerCase('de-AT')
  const results = state.sources.items.filter((source) => {
    const matchesStatus = state.sourceFilter === 'all' || source.status === state.sourceFilter
    const haystack = `${source.title} ${source.authority} ${source.fundstelle ?? ''} ${source.scope}`.toLocaleLowerCase('de-AT')
    return matchesStatus && (!normalized || haystack.includes(normalized))
  })
  const controls = `<section class="source-controls" aria-label="Quellen filtern"><label><span>Quelle suchen</span><input id="source-query" data-input="source-query" value="${escapeHtml(state.sourceQuery)}" placeholder="Titel, Fundstelle, Behörde"></label><fieldset><legend>Status</legend>${['all', 'current', 'superseded', 'pending'].map((value) => `<button type="button" data-action="source-filter" data-value="${value}" class="${state.sourceFilter === value ? 'is-selected' : ''}" aria-pressed="${state.sourceFilter === value}">${value}</button>`).join('')}</fieldset></section>`
  const rows = results.length === 0
    ? emptyState('Keine Quelle gefunden', 'Für diesen Filter liegt kein Registereintrag vor. Der Zustand bleibt leer; es werden keine Ersatzdaten erfunden.')
    : results.map((source, index) => `<article class="source-row"><span class="source-number">${String(index + 1).padStart(2, '0')}</span><div class="source-main"><div class="source-labels">${sourceStatusLabel(source.status)}${statusLabel(source.factStatus)}</div><h2>${escapeHtml(source.title)}</h2><p>${escapeHtml(source.scope)}</p><p class="source-note">${escapeHtml(source.note)}</p></div><dl><div><dt>Autorität</dt><dd>${escapeHtml(source.authority)}</dd></div><div><dt>Fundstelle</dt><dd>${escapeHtml(source.fundstelle ?? 'missing')}</dd></div><div><dt>Gültig ab</dt><dd>${escapeHtml(source.effectiveFrom ?? 'missing')}</dd></div>${source.supersededOn ? `<div><dt>Abgelöst am</dt><dd>${escapeHtml(source.supersededOn)}</dd></div>` : ''}<div><dt>Geprüft</dt><dd>${escapeHtml(source.checkedOn)}</dd></div></dl>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Original öffnen <span aria-hidden="true">↗</span></a>` : '<button type="button" disabled>Quelle missing</button>'}</article>`).join('')
  return `<div class="view-shell" data-view="sources">${header}${controls}<section class="source-register" aria-live="polite">${rows}</section><aside class="kb-receipt"><p class="micro-label">INTERNER KB-PREFLIGHT</p><div><strong>KB_SNAPSHOT_MATCH · ROUTE_NO_MATCH · BLOCKED_PENDING_EVIDENCE</strong><p>Keine interne Karte ausgewählt oder verwendet. Öffentlich nachprüfbare Inhalte dieses v0 stammen aus den registrierten WKO/RIS-Quellen; Vertragsfragen bleiben CONTRACT_CHECK_REQUIRED.</p></div></aside></div>`
}

const viewRenderers = {
  today: renderToday,
  'exam-plan': renderExamPlan,
  'learning-path': renderLearningPath,
  'case-workshop': renderCaseWorkshop,
  written: renderWritten,
  oral: renderOral,
  mistakes: renderMistakes,
  sources: renderSources,
}

function navigationMarkup(context) {
  return navigation.map((item) => `<button type="button" data-action="navigate" data-view="${item.id}" data-nav-context="${context}" class="${state.view === item.id ? 'is-active' : ''}" ${state.view === item.id ? 'aria-current="page"' : ''}><span>${item.number}</span><strong>${item.label}</strong></button>`).join('')
}

let drawerRestoreTarget = null
const drawerBackgroundSelector = '.skip-link, .mobile-topbar, .app-frame'

function setDrawerBackgroundInert(isInert) {
  document.querySelectorAll(drawerBackgroundSelector).forEach((element) => {
    if (element instanceof HTMLElement) element.toggleAttribute('inert', isInert)
  })
}

function render() {
  const restoreMenuFocus = document.body.classList.contains('drawer-open')
  setDrawerBackgroundInert(false)
  document.body.classList.remove('drawer-open')
  drawerRestoreTarget = null
  const currentNavigation = navigation.find((item) => item.id === state.view) ?? navigation[0]
  const railNav = navigationMarkup('rail')
  const drawerNav = navigationMarkup('drawer')
  document.querySelector('#root').innerHTML = `<a class="skip-link" href="#main-content">Zum Inhalt springen</a><header class="mobile-topbar"><div class="mobile-brand"><span>Prüfungswerkstatt</span><strong>${escapeHtml(currentNavigation.label)}</strong></div><button type="button" class="menu-button" data-action="drawer-open" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Navigation öffnen"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button></header><div class="app-frame"><aside class="app-rail"><header class="brand-block"><span class="brand-kicker">VERSICHERUNGSMAKLER</span><strong>Prüfungs<br>werkstatt</strong><p>Modul 1 / 2 · lokal</p></header><nav class="main-nav" aria-label="Hauptnavigation">${railNav}</nav><footer class="rail-footer"><button type="button" class="language-toggle" data-action="toggle-chinese" data-control-context="rail" aria-pressed="${state.chinese}"><span>中文 Hilfe</span><i aria-hidden="true">${state.chinese ? 'AN' : 'AUS'}</i></button><p>Deutsch bleibt Normebene.</p><div class="scope-tag">M3 · EXCLUDED</div></footer></aside><main id="main-content" tabindex="-1"><div id="storage-status" aria-live="assertive">${storageErrorMarkup()}</div>${viewRenderers[state.view]()}<div class="page-tools"><button type="button" class="back-to-top" data-action="back-to-top">Nach oben <span aria-hidden="true">↑</span></button></div><footer class="app-footer"><span>Makler Prüfungswerkstatt · lokal</span><span>Keine offizielle Prüfungsplattform · keine Rechts- oder Vertragsberatung</span></footer></main></div><div class="nav-backdrop" data-action="drawer-close" hidden></div><aside id="mobile-navigation" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Hauptnavigation" aria-hidden="true" inert><header><div><span>Makler Prüfungswerkstatt</span><strong>${escapeHtml(currentNavigation.label)}</strong></div><button type="button" class="drawer-close" data-action="drawer-close" aria-label="Navigation schließen">×</button></header><nav class="drawer-nav" aria-label="Hauptnavigation">${drawerNav}</nav><footer><button type="button" class="language-toggle" data-action="toggle-chinese" data-control-context="drawer" aria-pressed="${state.chinese}"><span>中文 Hilfe</span><i aria-hidden="true">${state.chinese ? 'AN' : 'AUS'}</i></button><p>Deutsch bleibt Normebene.</p><div class="scope-tag">M3 · EXCLUDED</div></footer></aside>`
  if (restoreMenuFocus) window.requestAnimationFrame(() => document.querySelector('[data-action="drawer-open"]')?.focus({ preventScroll: true }))
}

function openDrawer() {
  const drawer = document.querySelector('#mobile-navigation')
  const toggle = document.querySelector('[data-action="drawer-open"]')
  const backdrop = document.querySelector('.nav-backdrop')
  if (!(drawer instanceof HTMLElement) || !(toggle instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) return
  drawerRestoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : toggle
  setDrawerBackgroundInert(true)
  drawer.removeAttribute('inert')
  drawer.setAttribute('aria-hidden', 'false')
  drawer.classList.add('is-open')
  toggle.setAttribute('aria-expanded', 'true')
  backdrop.hidden = false
  document.body.classList.add('drawer-open')
  window.requestAnimationFrame(() => {
    const active = drawer.querySelector('[aria-current="page"]') ?? drawer.querySelector('button')
    const nav = drawer.querySelector('.drawer-nav')
    if (active instanceof HTMLElement) {
      active.focus({ preventScroll: true })
      if (nav instanceof HTMLElement) nav.scrollTop = Math.max(0, active.offsetTop - ((nav.clientHeight - active.offsetHeight) / 2))
    }
  })
}

function closeDrawer(restoreFocus = true) {
  const drawer = document.querySelector('#mobile-navigation')
  const toggle = document.querySelector('[data-action="drawer-open"]')
  const backdrop = document.querySelector('.nav-backdrop')
  const wasOpen = document.body.classList.contains('drawer-open') || drawer?.classList.contains('is-open')
  const target = drawerRestoreTarget
  const focusTarget = restoreFocus && target?.isConnected ? target : toggle
  setDrawerBackgroundInert(false)
  if (wasOpen) {
    if (focusTarget instanceof HTMLElement && focusTarget.offsetParent !== null) focusTarget.focus({ preventScroll: true })
    else focusMain()
  }
  if (drawer instanceof HTMLElement) {
    drawer.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
    drawer.setAttribute('inert', '')
  }
  if (toggle instanceof HTMLElement) toggle.setAttribute('aria-expanded', 'false')
  if (backdrop instanceof HTMLElement) backdrop.hidden = true
  document.body.classList.remove('drawer-open')
  drawerRestoreTarget = null
  if (restoreFocus && focusTarget instanceof HTMLElement && document.activeElement !== focusTarget) focusTarget.focus({ preventScroll: true })
}

function closeTooltip() {
  const wrapper = document.querySelector('.term-help.is-open')
  if (!wrapper) return
  wrapper.classList.remove('is-open')
  wrapper.querySelector('[data-action="toggle-tooltip"]')?.setAttribute('aria-expanded', 'false')
}

function navigate(view, moduleCode, lessonId, restoreToMenu = false) {
  if (!navigation.some((item) => item.id === view)) return
  if (view === 'written' && moduleCode) state.writtenId = writtenQuestions.find((question) => question.module === moduleCode)?.id ?? state.writtenId
  if (view === 'oral' && moduleCode) state.oralId = oralQuestions.find((question) => question.module === moduleCode)?.id ?? state.oralId
  state.view = view
  state.lessonTarget = view === 'learning-path' && lessons.some((lesson) => lesson.id === lessonId) ? lessonId : null
  window.location.hash = state.lessonTarget ? `/${view}/${encodeURIComponent(state.lessonTarget)}` : `/${view}`
  render()
  window.requestAnimationFrame(() => {
    if (focusLessonTarget()) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (restoreToMenu) document.querySelector('[data-action="drawer-open"]')?.focus({ preventScroll: true })
    else focusMain()
  })
}

function recordError(code, context, sourceId, kind) {
  const definition = mistakeDefinitions.find((item) => item.code === code)
  updateProgress((current) => ({
    ...current,
    mistakes: [{ id: `${code}-${Date.now()}-${sourceId}`, code, context, createdAt: new Date().toISOString() }, ...current.mistakes],
    reviewQueue: upsertReviewItem(current.reviewQueue, {
      id: `${kind}-${sourceId}`,
      kind,
      sourceId,
      label: context,
      due: definition?.priority === 'sofort' ? 'jetzt' : 'als Nächstes',
    }),
  }))
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]')
  if (!event.target.closest('.term-help')) closeTooltip()
  if (!trigger) return
  const action = trigger.dataset.action
  if (action === 'drawer-open') return openDrawer()
  if (action === 'drawer-close') {
    closeDrawer(true)
    return
  }
  if (action === 'back-to-top') {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    window.scrollTo({ top: 0, left: 0, behavior })
    return
  }
  if (action === 'toggle-tooltip') {
    const wrapper = trigger.closest('.term-help')
    wrapper.classList.remove('is-dismissed')
    const open = !wrapper.classList.contains('is-open')
    closeTooltip()
    wrapper.classList.toggle('is-open', open)
    trigger.setAttribute('aria-expanded', String(open))
    return
  }
  if (action === 'navigate') {
    const fromDrawer = Boolean(trigger.closest('#mobile-navigation'))
    if (fromDrawer) closeDrawer(false)
    return navigate(trigger.dataset.view, trigger.dataset.module, trigger.dataset.lesson, fromDrawer)
  }
  let nextFocus = { action }
  if (action === 'toggle-chinese') state.chinese = !state.chinese
  if (action === 'toggle-lesson') {
    updateProgress((current) => ({ ...current, completedLessons: toggleArrayItem(current.completedLessons, trigger.dataset.id) }))
    nextFocus = { action, key: 'id', value: trigger.dataset.id }
  }
  if (action === 'case-section') {
    state.caseIndex = Number(trigger.dataset.index)
    nextFocus = { action, key: 'index', value: String(state.caseIndex) }
  }
  if (action === 'case-move') {
    state.caseIndex = Math.min(caseSections.length - 1, Math.max(0, state.caseIndex + Number(trigger.dataset.direction)))
    nextFocus = { action: 'case-section', key: 'index', value: String(state.caseIndex) }
  }
  if (action === 'case-complete') {
    const active = caseSections[state.caseIndex]
    const completed = state.progress.completedCaseSteps.includes(active.id)
    updateProgress((current) => ({
      ...current,
      completedCaseSteps: toggleArrayItem(current.completedCaseSteps, active.id),
      reviewQueue: completed ? current.reviewQueue : upsertReviewItem(current.reviewQueue, { id: `case-${active.id}`, kind: 'case', sourceId: active.id, label: `Fallakte · ${active.title.de}`, due: 'später' }),
    }))
  }
  if (action === 'written-select') {
    state.writtenId = trigger.dataset.id
    nextFocus = { action, key: 'id', value: trigger.dataset.id }
  }
  if (action === 'written-reveal') {
    const active = writtenQuestions.find((question) => question.id === state.writtenId)
    const answer = state.progress.writtenAnswers[active.id] ?? ''
    if (answer.trim().length >= 20) updateProgress((current) => ({ ...current, writtenReviewed: current.writtenReviewed.includes(active.id) ? current.writtenReviewed : [...current.writtenReviewed, active.id], reviewQueue: upsertReviewItem(current.reviewQueue, { id: `written-${active.id}`, kind: 'written', sourceId: active.id, label: `Schriftlich · ${active.title}`, due: 'später' }) }))
  }
  if (action === 'record-error') {
    const active = writtenQuestions.find((question) => question.id === state.writtenId)
    recordError(trigger.dataset.code, `Schriftlich · ${active.title}`, active.id, 'written')
    nextFocus = { action, key: 'code', value: trigger.dataset.code }
  }
  if (action === 'oral-select') {
    state.oralId = trigger.dataset.id
    nextFocus = { action, key: 'id', value: trigger.dataset.id }
  }
  if (action === 'oral-assess') {
    const active = oralQuestions.find((question) => question.id === state.oralId)
    const value = trigger.dataset.value
    nextFocus = { action, key: 'value', value }
    updateProgress((current) => ({ ...current, oralAssessments: { ...current.oralAssessments, [active.id]: value }, reviewQueue: upsertReviewItem(current.reviewQueue, { id: `oral-${active.id}`, kind: 'oral', sourceId: active.id, label: `Mündlich · ${active.title}`, due: value === 'Vertragsgrenze übergangen' ? 'jetzt' : value === 'lückenhaft' ? 'als Nächstes' : 'später' }) }))
    if (value === 'Vertragsgrenze übergangen') recordError('K1', `Mündlich · ${active.title}`, active.id, 'oral')
    if (value === 'lückenhaft') recordError('N1', `Mündlich · ${active.title}`, active.id, 'oral')
  }
  if (action === 'remove-queue') updateProgress((current) => ({ ...current, reviewQueue: current.reviewQueue.filter((item) => item.id !== trigger.dataset.id) }))
  if (action === 'source-filter') {
    state.sourceFilter = trigger.dataset.value
    nextFocus = { action, key: 'value', value: trigger.dataset.value }
  }
  render()
  focusControl(nextFocus.action, nextFocus.key, nextFocus.value)
})

document.addEventListener('input', (event) => {
  const input = event.target.closest('[data-input]')
  if (!input) return
  if (input.dataset.input === 'case-note') {
    updateProgress((current) => ({ ...current, notes: { ...current.notes, [`case:${input.dataset.id}`]: input.value } }))
  }
  if (input.dataset.input === 'written-answer') {
    updateProgress((current) => ({ ...current, writtenAnswers: { ...current.writtenAnswers, [input.dataset.id]: input.value } }))
    const count = document.querySelector('#answer-count')
    const reveal = document.querySelector('[data-action="written-reveal"]')
    const length = input.value.trim().length
    if (count) count.textContent = length === 0 ? 'Noch keine Antwort' : `${length} Zeichen lokal`
    if (reveal) reveal.disabled = length < 20
  }
  if (input.dataset.input === 'source-query') {
    state.sourceQuery = input.value
    const cursor = input.selectionStart
    render()
    const replacement = document.querySelector('#source-query')
    replacement?.focus()
    replacement?.setSelectionRange(cursor, cursor)
  }
})

document.addEventListener('keydown', (event) => {
  const drawer = document.querySelector('#mobile-navigation.is-open')
  if (drawer && event.key === 'Escape') {
    event.preventDefault()
    closeDrawer(true)
    return
  }
  const focusedTooltip = document.activeElement?.closest?.('.term-help')
  if (event.key === 'Escape' && focusedTooltip) {
    event.preventDefault()
    closeTooltip()
    focusedTooltip.classList.add('is-dismissed')
    focusedTooltip.querySelector('[data-action="toggle-tooltip"]')?.setAttribute('aria-expanded', 'false')
    return
  }
  if (drawer && event.key === 'Tab') {
    const controls = [...drawer.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter((control) => control instanceof HTMLElement && control.offsetParent !== null)
    if (controls.length > 0) {
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    return
  }
  if (!event.target.closest('.case-index')) return
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  if (event.key === 'Home') state.caseIndex = 0
  else if (event.key === 'End') state.caseIndex = caseSections.length - 1
  else {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    state.caseIndex = Math.min(caseSections.length - 1, Math.max(0, state.caseIndex + direction))
  }
  render()
  focusControl('case-section', 'index', String(state.caseIndex))
})

document.addEventListener('focusout', (event) => {
  const wrapper = event.target.closest?.('.term-help')
  if (wrapper && !wrapper.contains(event.relatedTarget)) wrapper.classList.remove('is-dismissed')
})

window.addEventListener('hashchange', () => {
  const next = parseHash()
  if (next.view !== state.view || next.lessonId !== state.lessonTarget) {
    state.view = next.view
    state.lessonTarget = next.lessonId
    render()
    window.requestAnimationFrame(() => {
      if (!focusLessonTarget()) focusMain()
    })
  }
})

window.matchMedia('(max-width: 820px)').addEventListener('change', (event) => {
  if (!event.matches) closeDrawer(false)
})

async function loadSources() {
  try {
    const response = await fetch(new URL('./data/sources.json', import.meta.url), { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    state.sources = await response.json()
  } catch (error) {
    state.sourceError = `sources.json konnte nicht geladen werden (${error instanceof Error ? error.message : 'unbekannter Fehler'}).`
  }
  if (state.view === 'sources') render()
}

render()
if (state.lessonTarget) window.requestAnimationFrame(focusLessonTarget)
loadSources()
