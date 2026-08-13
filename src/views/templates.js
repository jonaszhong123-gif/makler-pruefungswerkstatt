import {
  examRules,
  examSubjects,
  learningOutcomes,
  legalNavigator,
  outcomeSlots,
  spartenNavigator,
} from '../data/curriculum.js'
import { caseFiles, oralQuestions, writtenQuestions } from '../data/practice.js'
import { mistakeDefinitions } from '../data/catalog.js'
import { routeForReviewItem } from '../utils/router.js'
import { isValidCaseOutput, isValidOralAttempt, sortReviewQueue } from '../utils/workflow.js'

export const navigation = [
  { id: 'today', label: 'Heute', number: '01' },
  { id: 'exam-plan', label: 'Prüfungsplan', number: '02' },
  { id: 'learning-path', label: 'Lernpfad', number: '03' },
  { id: 'case-workshop', label: 'Fallwerkstatt', number: '04' },
  { id: 'written', label: 'Schriftlich', number: '05' },
  { id: 'oral', label: 'Mündlich', number: '06' },
  { id: 'mistakes', label: 'Fehler', number: '07' },
  { id: 'sources', label: 'Quellen', number: '08' },
]

export const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const statusLabel = (status) => `<span class="status-label status-${escapeHtml(status)}">${escapeHtml(status)}</span>`
const sourceStatusLabel = (status) => `<span class="source-status source-${escapeHtml(status)}">${escapeHtml(status)}</span>`
const tags = (values) => `<div class="tag-list">${values.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}</div>`
const moduleStamp = (code) => {
  const [module, subject] = code.split('-')
  return `<span class="module-stamp" aria-label="${escapeHtml(code)}"><span>${escapeHtml(module)}</span><strong>${escapeHtml(subject)}</strong></span>`
}
const pageHeader = (eyebrow, title, intro, marker) => `<header class="page-header"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="page-intro">${escapeHtml(intro)}</p></div><div class="folio-mark" aria-hidden="true">${escapeHtml(marker)}</div></header>`
const emptyState = (title, body) => `<div class="empty-state" role="status"><span class="empty-rule" aria-hidden="true"></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div>`
const subjectById = Object.fromEntries(examSubjects.map((subject) => [subject.id, subject]))
const outcomeById = Object.fromEntries(learningOutcomes.map((outcome) => [outcome.id, outcome]))
const slotById = Object.fromEntries(outcomeSlots.map((slot) => [slot.id, slot]))

function practiceCount(outcomeId) {
  return [...writtenQuestions, ...oralQuestions, ...caseFiles]
    .filter((item) => item.outcomeIds.includes(outcomeId)).length
}

function routeAttributes(route) {
  return `data-view="${escapeHtml(route.view)}"${route.targetId ? ` data-target="${escapeHtml(route.targetId)}"` : ''}`
}

function storageHint(state) {
  return state.storageError ? 'Speicherung nicht bestätigt' : 'nur lokal gespeichert'
}

function renderToday(state) {
  const queue = sortReviewQueue(state.progress.reviewQueue)
  const nextReview = queue[0]
  const nextLesson = learningOutcomes.find((outcome) => !state.progress.completedLessons.includes(outcome.id))
  const target = nextReview
    ? routeForReviewItem(nextReview)
    : nextLesson
      ? { view: 'learning-path', targetId: nextLesson.id }
      : { view: 'learning-path', targetId: learningOutcomes[0].id }
  const actionLabel = nextReview
    ? 'Wiederholung öffnen'
    : nextLesson
      ? 'Lektion öffnen'
      : 'Lernpfad wiederholen'
  const assignment = nextReview
    ? `<p class="micro-label">FÄLLIGE WIEDERHOLUNG · ${escapeHtml(nextReview.due)}</p><h2>${escapeHtml(nextReview.label)}</h2><p>Der Eintrag führt zur ursprünglichen Aufgabe, Lektion oder Fallakte zurück.</p>`
    : nextLesson
      ? `${moduleStamp(outcomeSlots.find((slot) => slot.outcomeId === nextLesson.id)?.subjectId ?? 'M2-A')}<p class="micro-label">NÄCHSTE LEKTION</p><h2>${escapeHtml(nextLesson.id)} · ${escapeHtml(nextLesson.title)}</h2><p>${escapeHtml(nextLesson.course.ichKann)}</p>`
      : `<p class="micro-label">23 LEKTIONEN ABGESCHLOSSEN</p><h2>Lernpfad vollständig bearbeitet</h2><p>Es ist keine Wiederholung fällig. Öffnen Sie den Lernpfad für eine bewusste Wiederholungsrunde.</p>`
  const subjectRows = examSubjects.map((subject) => {
    const subjectOutcomes = new Set(outcomeSlots.filter((slot) => slot.subjectId === subject.id).map((slot) => slot.outcomeId))
    const done = [...subjectOutcomes].filter((id) => state.progress.completedLessons.includes(id)).length
    return `<button class="ledger-row" type="button" data-action="navigate" data-view="exam-plan">${moduleStamp(subject.id)}<span class="ledger-name"><strong>${escapeHtml(subject.title)}</strong><small>${escapeHtml(subject.paragraph)} · ${escapeHtml(subject.duration.label)}</small></span><span class="ledger-progress">${done} / ${subjectOutcomes.size} Lernziele</span><span class="row-arrow" aria-hidden="true">↗</span></button>`
  }).join('')
  const queuePreview = queue.length
    ? `<ol class="queue-list">${queue.slice(0, 4).map((item) => `<li><span>${escapeHtml(item.due)}</span><strong>${escapeHtml(item.label)}</strong><button type="button" data-action="navigate" ${routeAttributes(routeForReviewItem(item))}>öffnen</button></li>`).join('')}</ol>`
    : nextLesson
      ? emptyState('Keine Wiederholung fällig', 'Der nächste echte Lernschritt ist bereits vorbereitet.')
      : emptyState('Lernpfad vollständig', 'Alle 23 Lektionen sind abgeschlossen; starten Sie nur bei Bedarf eine bewusste Wiederholungsrunde.')

  return `<div class="view-shell" data-view="today"><section class="today-lead"><aside class="today-brief" aria-label="Heutiger Arbeitsauftrag"><div class="brief-number">01</div>${assignment}<button class="primary-action" type="button" data-action="navigate" ${routeAttributes(target)}>${actionLabel} <span aria-hidden="true">→</span></button><div class="brief-foot">23 Lernergebnisse · 38 Prüfungsslots · kein Prognosewert</div></aside><div class="lead-copy"><p class="eyebrow">MODUL 1 / 2 · LOKALE LERNWERKSTATT</p><h1>Erkennen. Begründen.<br><em>Wiederholen.</em></h1><p>Jeder Weg endet in einer überprüfbaren Leistung: Selbstcheck, schriftliche Antwort, mündlicher Versuch oder konkreter Falloutput.</p><figure class="today-visual"><img src="./src/assets/makler-workflow-abstract.png" alt="Abstrakte Papierkomposition mit einer dunkelgrünen Prüflinie, die mehrere Entscheidungspunkte verbindet." width="1536" height="1024"><figcaption>Originale Übungen, keine offiziellen Prüfungsfragen.</figcaption></figure></div></section><section class="module-ledger" aria-labelledby="today-subjects"><div class="section-heading"><p class="micro-label">VIER GETRENNTE GEGENSTÄNDE</p><h2 id="today-subjects">Abdeckung ohne erfundene Gesamtquote</h2></div><div class="ledger-lines">${subjectRows}</div></section><section class="today-lower"><div class="queue-preview"><p class="micro-label">WIEDERHOLUNGSQUEUE</p>${queuePreview}</div><blockquote><p>„Eine Markierung ist noch keine Beherrschung. Erst die überprüfte Leistung schließt den Schritt.“</p><footer>Werkstattprinzip · ${statusLabel('derived')}</footer></blockquote></section></div>`
}

function renderRuleCards() {
  const aids = `<article><h3>Hilfsmittel</h3><p><strong>Erlaubt:</strong> ${escapeHtml(examRules.aids.allowed.join(' '))}</p><p><strong>Verboten:</strong> ${escapeHtml(examRules.aids.prohibited.join(', '))}.</p></article>`
  const grading = `<article><h3>Bewertung & Bestehen</h3><p>${escapeHtml(examRules.grading.join(' · '))}</p><p>${escapeHtml(examRules.passing.module1)} ${escapeHtml(examRules.passing.module2)}</p><p>${escapeHtml(examRules.passing.repetition)}</p></article>`
  const conduct = `<article><h3>Durchführung</h3><p>${escapeHtml(examRules.selection.rule)}</p><p>${escapeHtml(examRules.selection.simultaneousSubjects)}</p><p>${escapeHtml(examRules.branchBalance)}</p></article>`
  const exemptions = `<article><h3>Anrechnung Modul 1</h3><ul>${examRules.exemptions.module1.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p><strong>Modul 2:</strong> ${escapeHtml(examRules.exemptions.module2)}</p></article>`
  return `<section class="rules-grid" aria-label="Geltende Prüfungsregeln">${conduct}${aids}${grading}${exemptions}</section>`
}

function renderCoverageMatrix() {
  const rows = learningOutcomes.map((outcome) => {
    const slots = outcomeSlots.filter((slot) => slot.outcomeId === outcome.id)
    const subjectCells = examSubjects.map((subject) => {
      const ids = slots.filter((slot) => slot.subjectId === subject.id).map((slot) => slot.id)
      return `<td>${ids.length ? ids.map((id) => `<span class="slot-chip">${escapeHtml(id)}</span>`).join('') : '<span class="missing-mark">—</span>'}</td>`
    }).join('')
    const linked = practiceCount(outcome.id)
    return `<tr id="matrix-${escapeHtml(outcome.id)}"><th scope="row"><a href="#/learning-path/${encodeURIComponent(outcome.id)}">${escapeHtml(outcome.id)}</a></th><td><strong>Er/Sie ist in der Lage, ${escapeHtml(outcome.title)}.</strong><small>${escapeHtml(outcome.area)}</small></td>${subjectCells}<td><span>${linked} Übungen</span><small>${statusLabel(outcome.officialStatus)} ${statusLabel(outcome.courseStatus)}</small></td><td><a href="https://www.wko.at/oe/information-consulting/versicherungsmakler-berater-versicherungsangelegenheiten/befaehigungspruefungsordnung-versicherungsmakler.pdf" target="_blank" rel="noreferrer">WKO BPO · Anlage</a></td></tr>`
  }).join('')
  const headers = examSubjects.map((subject) => `<th scope="col">${escapeHtml(subject.id)}<small>${escapeHtml(subject.paragraph)}</small></th>`).join('')
  return `<section class="coverage-section"><div class="section-heading"><p class="micro-label">AUDITIERBARE COVERAGE MATRIX</p><h2>23 Qualifikationsergebnisse × 38 Gegenstands-Slots</h2><p>Jede Zeile verknüpft amtliches Lernergebnis, Wissensdomäne, Gegenstand, Übung, Status und Quelle.</p></div><div class="table-scroll" tabindex="0"><table class="coverage-table"><thead><tr><th scope="col">ID</th><th scope="col">Qualifikationsergebnis / Domäne</th>${headers}<th scope="col">Lernabdeckung</th><th scope="col">Quelle</th></tr></thead><tbody>${rows}</tbody></table></div></section>`
}

function renderExamPlan() {
  const subjects = examSubjects.map((subject) => `<article class="exam-line">${moduleStamp(subject.id)}<div class="exam-main"><p class="micro-label">${escapeHtml(subject.module)} · ${escapeHtml(subject.mode)} · ${escapeHtml(subject.paragraph)}</p><h2>${escapeHtml(subject.title)}</h2><p class="duration-line">${escapeHtml(subject.duration.label)}</p></div><div class="exam-criteria"><p class="micro-label">BEWERTUNG</p><ul>${subject.criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join('')}</ul><p class="evidence-line">${statusLabel('confirmed')} WKO BPO</p></div></article>`).join('')
  return `<div class="view-shell" data-view="exam-plan">${pageHeader('PRÜFUNGSPLAN · MODUL 1 UND 2', 'Vier Gegenstände. 38 überprüfbare Zuordnungen.', 'Offizielle Struktur und Regeln sind confirmed; Kurs und Übungen sind eigenständig derived.', '02')}<section class="coverage-summary"><strong>23</strong><span>Qualifikationsergebnisse</span><strong>38</strong><span>Gegenstands-Slots</span><strong>4</strong><span>Gegenstände</span></section><section class="exam-ledger" aria-label="Prüfungsgegenstände">${subjects}</section>${renderRuleCards()}<aside class="scope-exclusion"><span>EXCLUDED</span><div><strong>Modul 3 · Unternehmerprüfung</strong><p>Existiert amtlich, bleibt aber vollständig außerhalb von Navigation, Kursen, Übungen und Fortschritt.</p></div></aside>${renderCoverageMatrix()}</div>`
}

function sourceReference(reference) {
  const source = reference.sourceId ? reference.sourceId : reference.name
  const detail = reference.locator ?? reference.status ?? ''
  return `<li><strong>${escapeHtml(source)}</strong>${detail ? ` · ${escapeHtml(detail)}` : ''}</li>`
}

function renderCourse(state, outcome) {
  const course = outcome.course
  const check = state.progress.lessonChecks[outcome.id]
  const complete = state.progress.completedLessons.includes(outcome.id)
  const slots = outcomeSlots.filter((slot) => slot.outcomeId === outcome.id)
  const options = course.selfCheck.options.map((option, index) => {
    const selected = check?.selectedIndex === index
    return `<button type="button" class="check-option ${selected ? 'is-selected' : ''}" data-action="lesson-check" data-id="${escapeHtml(outcome.id)}" data-index="${index}" aria-pressed="${selected}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`
  }).join('')
  const feedback = check
    ? `<div class="check-feedback ${check.correct ? 'is-correct' : 'is-wrong'}" role="status"><strong>${check.correct ? 'Richtig eingeordnet.' : 'Noch nicht belastbar.'}</strong><p>${escapeHtml(course.selfCheck.explanation)}</p></div>`
    : ''
  const links = [
    ...writtenQuestions.filter((item) => item.outcomeIds.includes(outcome.id)).map((item) => ({ ...item, view: 'written' })),
    ...oralQuestions.filter((item) => item.outcomeIds.includes(outcome.id)).map((item) => ({ ...item, view: 'oral' })),
    ...caseFiles.filter((item) => item.outcomeIds.includes(outcome.id)).map((item) => ({ ...item, view: 'case-workshop' })),
  ]
  const practiceLinks = links.map((item) => `<button type="button" class="text-action" data-action="navigate" data-view="${item.view}" data-target="${escapeHtml(item.id)}">${escapeHtml(item.title)} →</button>`).join('')
  return `<article class="course-sheet" aria-labelledby="course-title"><header class="course-head"><div>${tags([outcome.id, outcome.area, ...slots.map((slot) => `${slot.subjectId} · ${slot.id}`)])}<h1 id="course-title">Er/Sie ist in der Lage, ${escapeHtml(outcome.title)}.</h1><p class="ich-kann"><strong>Ich kann:</strong> ${escapeHtml(course.ichKann.replace(/^Ich kann\s*/u, ''))}</p></div><div>${statusLabel(outcome.officialStatus)} ${statusLabel(outcome.courseStatus)}</div></header><section class="course-section"><p class="micro-label">KERNENTSCHEIDUNG</p><h2>${escapeHtml(course.decisionFramework.title)}</h2><ul>${course.decisionFramework.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul></section><section class="course-two"><div class="course-section"><p class="micro-label">ARBEITSABLAUF</p><ol>${course.workflow.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></div><div class="course-section"><p class="micro-label">TYPISCHE FEHLER</p><ul>${course.commonErrors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div></section><section class="course-section micro-case"><p class="micro-label">ORIGINALER MIKROFALL · NICHT OFFIZIELL</p><h2>${escapeHtml(course.microCase.title)}</h2><p>${escapeHtml(course.microCase.situation)}</p><p><strong>Auftrag:</strong> ${escapeHtml(course.microCase.task)}</p><ol>${course.microCase.walkthrough.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section><section class="course-section self-check"><p class="micro-label">SELBSTCHECK · ABSCHLUSSGATE</p><h2>${escapeHtml(course.selfCheck.question)}</h2><div class="check-options">${options}</div>${feedback}<div class="completion-panel"><p>${escapeHtml(course.completionRule)}</p><button type="button" class="primary-action compact" data-action="lesson-complete" data-id="${escapeHtml(outcome.id)}" ${!complete && !check?.correct ? 'disabled' : ''}>${complete ? 'Beherrschung zurücknehmen' : 'Lektion abschließen'}</button></div></section><section class="course-two"><div class="course-section"><p class="micro-label">QUELLEN & FUNDSTELLEN</p><ul>${course.sourceRefs.map(sourceReference).join('')}</ul></div><div class="course-section"><p class="micro-label">AUSSAGEGRENZEN</p>${tags(course.boundaries)}</div></section><section class="course-section"><p class="micro-label">PASSENDE PRAXIS</p><div class="practice-links">${practiceLinks}</div></section></article>`
}

function renderLearningPath(state) {
  const active = outcomeById[state.targetId] ?? learningOutcomes[0]
  const areas = [...new Set(learningOutcomes.map((outcome) => outcome.area))]
  const list = areas.map((area) => `<section><h3>${escapeHtml(area)}</h3>${learningOutcomes.filter((outcome) => outcome.area === area).map((outcome) => {
    const done = state.progress.completedLessons.includes(outcome.id)
    return `<button type="button" class="lesson-line ${done ? 'is-done' : ''} ${outcome.id === active.id ? 'is-targeted' : ''}" data-action="navigate" data-view="learning-path" data-target="${escapeHtml(outcome.id)}"><span class="paper-check" aria-hidden="true">${done ? '×' : ''}</span><span class="lesson-copy"><strong>${escapeHtml(outcome.id)} · ${escapeHtml(outcome.title)}</strong><small>${practiceCount(outcome.id)} Übungen · ${done ? 'abgeschlossen' : 'offen'}</small></span></button>`
  }).join('')}</section>`).join('')
  return `<div class="view-shell" data-view="learning-path">${pageHeader('LERNPFAD · 23 VOLLSTÄNDIGE LEKTIONEN', 'Vom amtlichen Ergebnis zur eigenen Handlung.', 'Eine Lektion gilt erst nach richtigem Selbstcheck und bewusstem Abschluss als beherrscht.', '03')}<div class="course-layout"><nav class="course-nav" aria-label="23 Lernergebnisse">${list}</nav>${renderCourse(state, active)}</div></div>`
}

function rubricBlock(rubric, attempt, kind, sourceId) {
  const dimensionLabels = {
    fachlicheRichtigkeit: 'Fachliche Richtigkeit',
    praxistauglichkeit: 'Praxistauglichkeit',
    schluessigeArgumentation: 'Schlüssige Argumentation',
  }
  return `<section class="rubric-panel"><p class="micro-label">SELBSTBEWERTUNG · 0 BIS 2</p><div class="rubric-grid">${Object.entries(rubric).map(([dimension, levels]) => `<fieldset><legend>${escapeHtml(dimensionLabels[dimension] ?? dimension)}</legend>${[0, 1, 2].map((score) => `<button type="button" data-action="score" data-kind="${kind}" data-source="${escapeHtml(sourceId)}" data-dimension="${escapeHtml(dimension)}" data-score="${score}" class="${attempt.scores?.[dimension] === score ? 'is-selected' : ''}" aria-pressed="${attempt.scores?.[dimension] === score}"><strong>${score}</strong><span>${escapeHtml(levels[`score${score}`].join(' '))}</span></button>`).join('')}</fieldset>`).join('')}</div></section>`
}

function errorPicker(kind, sourceId) {
  return `<section class="error-picker"><p>Welcher Fehler war sichtbar? Die Wahl erstellt oder aktualisiert eine Wiederholung.</p><div>${mistakeDefinitions.map((definition) => `<button type="button" data-action="record-error" data-code="${definition.code}" data-kind="${kind}" data-source="${escapeHtml(sourceId)}" title="${escapeHtml(definition.title)}">${definition.code}</button>`).join('')}</div></section>`
}

function practiceTabs(items, activeId, view) {
  return items.map((item, index) => `<button type="button" data-action="navigate" data-view="${view}" data-target="${escapeHtml(item.id)}" class="${item.id === activeId ? 'is-active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span>${moduleStamp(item.module)}<strong>${escapeHtml(item.title)}</strong></button>`).join('')
}

function renderWritten(state) {
  const active = writtenQuestions.find((question) => question.id === state.targetId) ?? writtenQuestions[0]
  const answer = state.progress.writtenAnswers[active.id] ?? ''
  const attempt = state.progress.writtenAttempts[active.id] ?? { revealed: false, attempts: 0, scores: {}, submittedAt: null, completedAt: null }
  const rubric = attempt.revealed
    ? `<section class="reference-panel"><p class="micro-label">REFERENZPUNKTE · KEINE MUSTERLÖSUNG</p><ul>${active.referencePoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul></section>${rubricBlock(active.rubric, attempt, 'written', active.id)}${errorPicker('written', active.id)}<div class="answer-actions"><button type="button" class="text-action" data-action="practice-redo" data-kind="written" data-source="${escapeHtml(active.id)}">Neu beantworten</button><button type="button" class="primary-action compact" data-action="practice-finish" data-kind="written" data-source="${escapeHtml(active.id)}">Bewertung abschließen</button></div>`
    : ''
  return `<div class="view-shell" data-view="written">${pageHeader('SCHRIFTLICH · ORIGINALE ÜBUNGEN', 'Erst antworten. Dann vergleichen.', 'Referenzpunkte bleiben bis zu einer gültigen Antwort verborgen. Bewertung: fachliche Richtigkeit und Praxistauglichkeit.', '05')}<div class="practice-layout"><nav class="practice-tabs" aria-label="Schriftliche Aufgaben">${practiceTabs(writtenQuestions, active.id, 'written')}</nav><article class="practice-sheet"><div class="practice-prompt">${moduleStamp(active.module)}<p class="micro-label">ORIGINALE ÜBUNG · NICHT OFFIZIELL</p><h2>${escapeHtml(active.title)}</h2><p>${escapeHtml(active.prompt)}</p>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(active.promptZh)}</p>` : ''}${tags([...active.outcomeIds, ...active.slotIds, ...active.tags])}</div><label class="answer-field"><span>Arbeitsantwort <small data-storage-hint>${escapeHtml(storageHint(state))}</small></span><textarea rows="12" data-input="written-answer" data-id="${escapeHtml(active.id)}" ${attempt.revealed ? 'readonly' : ''} placeholder="Fakten, Begründung, Prüfschritte und Grenzen …">${escapeHtml(answer)}</textarea></label><div class="answer-actions"><span id="answer-count">${answer.trim().length} Zeichen · mindestens ${active.minChars} und ${active.minUnits} Gedankenschritte</span>${attempt.revealed ? '<span class="status-label status-confirmed">Antwort fixiert</span>' : `<button type="button" class="primary-action compact" data-action="written-submit" data-source="${escapeHtml(active.id)}">Antwort abgeben</button>`}</div>${attempt.completedAt ? '<p class="pass-note" role="status">Wiederholung fachlich abgeschlossen.</p>' : ''}${rubric}</article></div></div>`
}

function renderOral(state) {
  const active = oralQuestions.find((question) => question.id === state.targetId) ?? oralQuestions[0]
  const notes = state.progress.oralNotes[active.id] ?? ''
  const attempt = state.progress.oralAttempts[active.id] ?? { revealed: false, attempts: 0, elapsedSeconds: 0, scores: {}, submittedAt: null, completedAt: null }
  const elapsed = state.timer.id === active.id ? state.timer.elapsedSeconds : attempt.elapsedSeconds
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')
  const canSubmit = isValidOralAttempt({
    elapsedSeconds: elapsed,
    notes,
    minSeconds: active.minSeconds,
    minNoteChars: active.minNoteChars,
  })
  const revealed = attempt.revealed
    ? `<section class="oral-observation"><div><p class="micro-label">NACHFRAGEN</p><ol>${active.followUps.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol></div><div><p class="micro-label">BEOBACHTUNGSPUNKTE</p><ul>${active.observationPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></section>${rubricBlock(active.rubric, attempt, 'oral', active.id)}${errorPicker('oral', active.id)}<div class="answer-actions"><button type="button" class="text-action" data-action="practice-redo" data-kind="oral" data-source="${escapeHtml(active.id)}">Neu beantworten</button><button type="button" class="primary-action compact" data-action="practice-finish" data-kind="oral" data-source="${escapeHtml(active.id)}">Bewertung abschließen</button></div>`
    : '<div class="locked-panel"><strong>Nachfragen und Beobachtungspunkte sind noch verborgen.</strong><p>Stoppen Sie den Timer nach Ihrem freien Versuch oder notieren Sie eine ausreichend entwickelte Antwort.</p></div>'
  return `<div class="view-shell" data-view="oral">${pageHeader('MÜNDLICH · ORIGINALE ÜBUNGEN', 'Frei antworten. Danach nachschärfen.', 'Timer oder belastbare Notizen öffnen erst nach Abgabe die Nachfragen und die dreidimensionale Bewertung.', '06')}<div class="practice-layout"><nav class="practice-tabs" aria-label="Mündliche Aufgaben">${practiceTabs(oralQuestions, active.id, 'oral')}</nav><article class="practice-sheet"><div class="practice-prompt">${moduleStamp(active.module)}<p class="micro-label">ORIGINALE ÜBUNG · NICHT OFFIZIELL</p><h2>${escapeHtml(active.title)}</h2><p>${escapeHtml(active.prompt)}</p>${state.chinese ? `<p class="zh-help" lang="zh-Hans">${escapeHtml(active.promptZh)}</p>` : ''}${tags([...active.outcomeIds, ...active.slotIds, ...active.tags])}</div><section class="timer-panel" aria-label="Antworttimer"><strong id="oral-timer">${minutes}:${seconds}</strong><div><button type="button" data-action="timer-toggle" ${attempt.revealed ? 'disabled' : ''}>${state.timer.running && state.timer.id === active.id ? 'Pause' : 'Start'}</button><button type="button" data-action="timer-reset" ${attempt.revealed ? 'disabled' : ''}>Zurücksetzen</button></div><small>Ziel für die Übung: ${active.minSeconds} Sekunden oder ${active.minNoteChars} Zeichen Notiz.</small></section><label class="answer-field"><span>Antwortnotiz <small data-storage-hint>${escapeHtml(storageHint(state))}</small></span><textarea rows="8" data-input="oral-note" data-id="${escapeHtml(active.id)}" ${attempt.revealed ? 'readonly' : ''} placeholder="Kernargumente und offene Prüfungen …">${escapeHtml(notes)}</textarea></label><div class="answer-actions">${attempt.revealed ? '<span class="status-label status-confirmed">Versuch fixiert</span>' : `<button type="button" class="primary-action compact" data-action="oral-submit" data-source="${escapeHtml(active.id)}" ${canSubmit ? '' : 'disabled'}>Versuch abschließen</button>`}</div>${attempt.completedAt ? '<p class="pass-note" role="status">Wiederholung fachlich abgeschlossen.</p>' : ''}${revealed}</article></div></div>`
}

function renderCaseWorkshop(state) {
  const active = caseFiles.find((caseFile) => caseFile.id === state.targetId) ?? caseFiles[0]
  const caseTabs = caseFiles.map((caseFile, index) => `<button type="button" data-action="navigate" data-view="case-workshop" data-target="${escapeHtml(caseFile.id)}" class="${caseFile.id === active.id ? 'is-active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(caseFile.title)}</strong><small>${escapeHtml(caseFile.audience)} · ${escapeHtml(caseFile.lifecyclePhase)}</small></button>`).join('')
  const facts = active.facts.map((fact) => `<li>${statusLabel(fact.status)} <span>${escapeHtml(fact.text)}</span></li>`).join('')
  const steps = active.steps.map((step) => {
    const value = state.progress.caseOutputs[step.id] ?? ''
    const complete = state.progress.completedCaseSteps.includes(step.id)
    return `<section class="case-step ${complete ? 'is-complete' : ''}"><header><div><p class="micro-label">${escapeHtml(step.id)} · ${complete ? 'ABGESCHLOSSEN' : 'OFFEN'}</p><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.intro)}</p></div>${statusLabel(complete ? 'confirmed' : 'derived')}</header><p><strong>Arbeitsauftrag:</strong> ${escapeHtml(step.taskPrompt)}</p><label class="answer-field"><span>Schrittoutput <small data-storage-hint>${escapeHtml(storageHint(state))}</small></span><textarea rows="7" data-input="case-output" data-id="${escapeHtml(step.id)}" data-case="${escapeHtml(active.id)}" ${complete ? 'readonly' : ''} placeholder="Konkretes Arbeitsergebnis …">${escapeHtml(value)}</textarea></label><div class="step-checklist">${step.checklist.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div><div class="answer-actions"><span data-case-count="${escapeHtml(step.id)}">${value.trim().length} / ${step.minChars} Mindestzeichen</span><button type="button" class="primary-action compact" data-action="case-step-complete" data-case="${escapeHtml(active.id)}" data-step="${escapeHtml(step.id)}" ${!complete && !isValidCaseOutput(value, step.minChars) ? 'disabled' : ''}>${complete ? 'Abschluss zurücknehmen' : 'Schritt abschließen'}</button></div></section>`
  }).join('')
  return `<div class="view-shell" data-view="case-workshop">${pageHeader('FALLWERKSTATT · 9 ORIGINALE FÄLLE', active.title, `${active.subtitle}. Jeder Schritt verlangt einen eigenen, überprüfbaren Output.`, '04')}<div class="case-catalog"><nav class="practice-tabs" aria-label="Fallakten">${caseTabs}</nav><article class="case-workbook"><header class="case-overview">${tags([...active.tags, ...active.moduleFocus, ...active.outcomeIds, ...active.slotIds])}<p class="micro-label">SACHVERHALT · ${escapeHtml(active.status)}</p><ul>${facts}</ul><p class="micro-label">PRÜFGRENZEN</p>${tags(active.gates)}</header>${steps}</article></div></div>`
}

function renderMistakes(state) {
  const queue = sortReviewQueue(state.progress.reviewQueue)
  const grouped = ['jetzt', 'als Nächstes', 'später'].map((due) => {
    const entries = queue.filter((item) => item.due === due)
    return `<section class="queue-group"><h2>${escapeHtml(due)}</h2>${entries.length ? `<ol class="queue-list detailed">${entries.map((item) => `<li class="${item.id === state.targetId ? 'is-targeted' : ''}"><span>${escapeHtml(item.kind)}</span><strong>${escapeHtml(item.label)}</strong><button type="button" data-action="navigate" ${routeAttributes(routeForReviewItem(item))}>Quelle öffnen →</button></li>`).join('')}</ol>` : `<p class="muted-copy">Keine Einträge.</p>`}</section>`
  }).join('')
  const log = state.progress.mistakes.length
    ? `<ol class="mistake-log">${state.progress.mistakes.slice().reverse().map((item) => {
      const definition = mistakeDefinitions.find((entry) => entry.code === item.code)
      return `<li><strong>${escapeHtml(item.code)} · ${escapeHtml(definition?.title ?? 'Fehler')}</strong><span>${escapeHtml(item.context)}</span><small>${escapeHtml(item.createdAt.slice(0, 10))} · ${escapeHtml(item.kind)}</small></li>`
    }).join('')}</ol>`
    : emptyState('Noch kein Fehler protokolliert', 'Nach der Selbstbewertung können Sie einen konkreten Fehlertyp in die Wiederholung geben.')
  return `<div class="view-shell" data-view="mistakes">${pageHeader('FEHLER & WIEDERHOLUNG', 'Nicht wegklicken. An der Quelle neu lösen.', 'Die Queue ist nach jetzt, als Nächstes und später sortiert. Ein Eintrag verschwindet nur nach bestandener Wiederholung.', '07')}<section class="queue-board">${grouped}</section><section class="mistake-history"><div class="section-heading"><p class="micro-label">FEHLERPROTOKOLL</p><h2>Beobachtungen bleiben nachvollziehbar</h2></div>${log}</section></div>`
}

function renderLawNavigator() {
  return `<section class="law-section"><div class="section-heading"><p class="micro-label">RECHTSNAVIGATOR · RIS</p><h2>Aktuelle Fassung immer am Nutzungstag prüfen</h2></div><div class="law-grid">${legalNavigator.map((law) => `<article><h3>${escapeHtml(law.id)}</h3><p>${escapeHtml(law.title)}</p><small>${escapeHtml(law.learningUse)}</small><a href="${escapeHtml(law.url)}" target="_blank" rel="noreferrer">RIS öffnen →</a><span>${escapeHtml(law.boundary)}</span></article>`).join('')}</div></section>`
}

function renderSpartenNavigator() {
  return `<section class="sparten-section"><div class="section-heading"><p class="micro-label">SPARTEN-NAVIGATOR</p><h2>Sach · Personen · Vermögen</h2></div><div class="rules-grid">${spartenNavigator.map((area) => `<article><h3>${escapeHtml(area.title)}</h3>${tags(area.cautiousExamples)}<ol>${area.learningRoute.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol><small>${escapeHtml(area.boundary)}</small></article>`).join('')}</div></section>`
}

function renderSources(state) {
  const query = state.sourceQuery.trim().toLowerCase()
  const items = (state.sources?.items ?? []).filter((source) => {
    const statusMatch = state.sourceFilter === 'all' || source.status === state.sourceFilter
    const textMatch = !query || [source.title, source.authority, source.fundstelle, source.scope]
      .some((value) => String(value ?? '').toLowerCase().includes(query))
    return statusMatch && textMatch
  })
  const cards = state.sourceError
    ? `<div class="error-banner" role="alert"><strong>Register nicht verfügbar</strong><span>${escapeHtml(state.sourceError)}</span></div>`
    : items.length
      ? `<div class="source-grid">${items.map((source) => `<article class="source-card"><header>${sourceStatusLabel(source.status)} ${statusLabel(source.factStatus)}</header><h2>${escapeHtml(source.title)}</h2><p>${escapeHtml(source.authority)}</p><dl><dt>Fundstelle</dt><dd>${escapeHtml(source.fundstelle ?? 'missing')}</dd><dt>Geprüft</dt><dd>${escapeHtml(source.checkedOn ?? 'missing')}</dd><dt>Geltung</dt><dd>${escapeHtml(source.effectiveFrom ?? 'missing')}</dd></dl><p>${escapeHtml(source.scope)}</p><small>${escapeHtml(source.note)}</small>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Offizielle Quelle öffnen →</a>` : '<span class="missing-mark">URL missing</span>'}</article>`).join('')}</div>`
      : emptyState('Keine Quelle gefunden', 'Filter oder Suchbegriff ändern; missing bleibt sichtbar.')
  const controls = `<section class="source-controls" aria-label="Quellen filtern"><label><span>Quelle suchen</span><input id="source-query" data-input="source-query" value="${escapeHtml(state.sourceQuery)}" placeholder="Titel, Fundstelle, Behörde"></label><fieldset><legend>Status</legend>${['all', 'current', 'superseded', 'pending'].map((value) => `<button type="button" data-action="source-filter" data-value="${value}" class="${state.sourceFilter === value ? 'is-selected' : ''}" aria-pressed="${state.sourceFilter === value}">${value}</button>`).join('')}</fieldset></section>`
  return `<div class="view-shell" data-view="sources">${pageHeader('QUELLEN · STAND 13.08.2026', 'Amtliche Regeln, vorsichtige Zeitgrenzen.', 'Prüfungsregeln: WKO/RIS. Konkrete Rechts- und Vertragsaussagen bleiben prüfpflichtig.', '08')}<aside class="kb-receipt"><strong>KB_PREFLIGHT</strong><span>KB_SNAPSHOT_MATCH · ROUTE_NO_MATCH · BLOCKED_PENDING_EVIDENCE</span><p>Keine privaten BÖV-Unterlagen oder internen Originaltexte wurden in die Anwendung übernommen.</p></aside>${controls}${cards}${renderLawNavigator()}${renderSpartenNavigator()}<section class="data-tools"><div><p class="micro-label">LOKALER FORTSCHRITT</p><h2>Exportieren oder kontrolliert importieren</h2><p>Fortschritt bleibt in localStorage. Kein Konto, kein Server, kein automatischer Upload.</p></div><div><button type="button" class="primary-action compact" data-action="export-progress">JSON exportieren</button><label class="file-action">JSON importieren<input type="file" accept="application/json,.json" data-input="import-progress"></label></div><p id="import-status" role="status"></p></section></div>`
}

const renderers = {
  today: renderToday,
  'exam-plan': renderExamPlan,
  'learning-path': renderLearningPath,
  'case-workshop': renderCaseWorkshop,
  written: renderWritten,
  oral: renderOral,
  mistakes: renderMistakes,
  sources: renderSources,
}

export function renderCurrentView(state) {
  return renderers[state.view]?.(state) ?? renderToday(state)
}

export function navigationMarkup(state, context) {
  return navigation.map((item) => `<button type="button" data-action="navigate" data-view="${item.id}" data-nav-context="${context}" class="${state.view === item.id ? 'is-active' : ''}" ${state.view === item.id ? 'aria-current="page"' : ''}><span>${item.number}</span><strong>${item.label}</strong></button>`).join('')
}

export { caseFiles, learningOutcomes, oralQuestions, writtenQuestions, mistakeDefinitions, slotById, subjectById }
