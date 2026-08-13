export const ROUTE_VIEWS = Object.freeze([
  'today',
  'exam-plan',
  'learning-path',
  'case-workshop',
  'written',
  'oral',
  'mistakes',
  'sources',
])

const TARGET_VIEWS = new Set([
  'learning-path',
  'case-workshop',
  'written',
  'oral',
  'mistakes',
])

const fallbackRoute = () => ({ view: 'today', targetId: null, ignore: false })

function safelyDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

function targetIsAllowed(view, targetId, validTargets) {
  const allowed = validTargets?.[view]
  if (allowed === undefined) return true
  if (typeof allowed === 'function') return allowed(targetId) === true
  if (allowed instanceof Set || Array.isArray(allowed)) return allowed.has?.(targetId) ?? allowed.includes(targetId)
  if (allowed !== null && typeof allowed === 'object') return Object.hasOwn(allowed, targetId)
  return false
}

export function parseRouteHash(hash, validTargets = {}) {
  if (hash === '#main-content') return { ignore: true }
  if (hash === '' || hash === '#') return fallbackRoute()
  if (typeof hash !== 'string' || !hash.startsWith('#/')) return fallbackRoute()

  const segments = hash.slice(2).split('/')
  const view = safelyDecode(segments[0])
  if (view === null || !ROUTE_VIEWS.includes(view)) return fallbackRoute()

  if (!TARGET_VIEWS.has(view)) {
    return { view, targetId: null, ignore: false }
  }

  if (segments.length !== 2 || segments[1] === '') {
    return { view, targetId: null, ignore: false }
  }

  const targetId = safelyDecode(segments[1])
  if (targetId === null || targetId === '' || !targetIsAllowed(view, targetId, validTargets)) {
    return { view, targetId: null, ignore: false }
  }

  return { view, targetId, ignore: false }
}

export function serializeRoute({ view, targetId } = {}) {
  const safeView = ROUTE_VIEWS.includes(view) ? view : 'today'
  if (TARGET_VIEWS.has(safeView) && typeof targetId === 'string' && targetId.length > 0) {
    return `#/${safeView}/${encodeURIComponent(targetId)}`
  }
  return `#/${safeView}`
}

export function routeForReviewItem(item) {
  const viewsByKind = {
    lesson: 'learning-path',
    case: 'case-workshop',
    written: 'written',
    oral: 'oral',
  }
  const view = viewsByKind[item?.kind]
  if (view === undefined) return { view: 'mistakes', targetId: null }
  return {
    view,
    targetId: typeof item.sourceId === 'string' && item.sourceId.length > 0 ? item.sourceId : null,
  }
}
