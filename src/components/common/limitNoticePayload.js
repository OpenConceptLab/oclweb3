// A limit notice is a finished payload a connected service may add to a refusal (a 403 body's `notice`) or send from
// GET /capabilities/notices/ (OpenConceptLab/ocl_online#702). Open code renders each field only if it was sent and
// works nothing out: no fraction, color, date or wording is computed here. With no payload, LimitNotice shows the
// API's `detail` and nothing else.

export const NOTICE_KINDS = ['quota', 'cap', 'not_included', 'read_only']
export const NOTICE_TONES = ['info', 'warning', 'error']
const SCOPE_TYPES = ['account', 'organization']
const ACTION_KINDS = ['primary', 'secondary', 'text']
const TEXT_FIELDS = ['title', 'scope', 'reset', 'restricted', 'still_works', 'managed_by', 'tooltip']

// The write actions oclapi2 asks its capability policy about (core/capabilities/constants.py WRITE_ACTION_*), which a
// resource notice's `locks` may name
export const WRITE_ACTIONS = ['edit', 'publish', 'delete', 'make_private']

const text = value => (typeof value === 'string' && value.trim()) ? value : null

// Only an absolute http(s) link is kept
export const safeURL = value => {
  if(typeof value !== 'string')
    return null
  let url
  try {
    url = new URL(value)
  } catch(_) {
    return null
  }
  return ['https:', 'http:'].includes(url.protocol) ? url.href : null
}

const pick = (value, allowed) => allowed.includes(value) ? value : null

const toMeter = meter => {
  if(!meter || typeof meter !== 'object')
    return null
  const label = text(meter.label)
  const fraction = Number.isFinite(meter.fraction) ? Math.max(0, Math.min(1, meter.fraction)) : null
  if(!label && fraction === null)
    return null
  return compactObject({label, fraction, tone: pick(meter.tone, NOTICE_TONES)})
}

const toLink = link => {
  if(!link || typeof link !== 'object')
    return null
  const label = text(link.label)
  const url = safeURL(link.url)
  return (label && url) ? {label, url} : null
}

// A button needs a label and a link; its kind falls back to secondary
const toAction = action => {
  const link = toLink(action)
  return link ? {...link, kind: pick(action.kind, ACTION_KINDS) || 'secondary'} : null
}

const compactObject = object => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null && value !== undefined))

// The payload with only the fields this slot knows, each in the shape it renders. Null when there's no usable notice:
// it needs a title.
export const normalizeNotice = payload => {
  if(!payload || typeof payload !== 'object' || Array.isArray(payload))
    return null
  const notice = {}
  TEXT_FIELDS.forEach(field => {
    notice[field] = text(payload[field])
  })
  if(!notice.title)
    return null
  notice.kind = pick(payload.kind, NOTICE_KINDS)
  notice.tone = pick(payload.tone, NOTICE_TONES)
  notice.scope_type = pick(payload.scope_type, SCOPE_TYPES)
  notice.meter = toMeter(payload.meter)
  notice.help = toLink(payload.help)
  const actions = Array.isArray(payload.actions) ? payload.actions.map(toAction).filter(Boolean) : []
  notice.actions = actions.length ? actions : null
  const locks = Array.isArray(payload.locks) ? [...new Set(payload.locks.filter(action => WRITE_ACTIONS.includes(action)))] : []
  notice.locks = locks.length ? locks : null
  return compactObject(notice)
}

// The body of a refusal, however the request was made: an axios error, a response, or the body itself
const getBody = value => value?.response?.data || value?.data || value

// The notice a refusal carries, or null
export const getNotice = value => {
  const body = getBody(value)
  return (body && typeof body === 'object') ? normalizeNotice(body.notice) : null
}

// The API's own reason, shown alone when there's no notice
export const getNoticeDetail = value => {
  const body = getBody(value)
  if(typeof body === 'string')
    return text(body)
  return text(body?.detail) || text(body?.error) || null
}

// The notices GET /capabilities/notices/ answers with, or none
export const getNotices = body => Array.isArray(body?.notices) ? body.notices.map(normalizeNotice).filter(Boolean) : []

// The way out (a primary action) leads: first in a strip or an inline notice, rightmost in a dialog
export const orderActions = (actions, size) => {
  const all = actions || []
  const wayFirst = [...all.filter(action => action.kind === 'primary'), ...all.filter(action => action.kind !== 'primary')]
  return size === 'dialog' ? wayFirst.reverse() : wayFirst
}

// The color comes from the payload's tone (or its meter's), never from the numbers
export const getNoticeTone = notice => notice?.tone || notice?.meter?.tone || 'info'

// The icon follows the notice's kind, then its tone
export const getNoticeIcon = notice => {
  if(notice?.kind === 'read_only')
    return 'lock'
  if(notice?.kind === 'not_included')
    return 'info'
  const tone = getNoticeTone(notice)
  return tone === 'info' ? 'info' : tone
}

// The write actions any of a resource's notices lock, and the reason the first one gives
export const getLocks = notices => [...new Set((notices || []).flatMap(notice => notice?.locks || []))]
export const getLockTooltip = notices => (notices || []).find(notice => notice?.locks && notice.tooltip)?.tooltip || null

// The write actions each TBv3 entry point can ask oclapi2 for (core/common/permissions.py ChecksWrites,
// core/capabilities/writes.py). One is locked only when the notice locks every action it can take, so a locked control
// is always one the API would refuse.
export const ENTRY_POINT_ACTIONS = {
  // a repository's own edit form: a change of visibility can publish it or make it private
  editRepo: ['edit', 'publish', 'make_private'],
  // the version form has no visibility field, so saving it is always an edit
  editVersion: ['edit'],
  // DELETE of a repository's HEAD deletes the repository; of another version, it's an edit of the repository
  deleteRepo: ['delete'],
  deleteVersion: ['edit'],
  // everything else written into the repository: concepts, mappings, references, versions, release, expansions,
  // saved default filters, external exports. Recomputing a summary isn't asked about (it changes no content), so it
  // has no entry.
  addConcept: ['edit'],
  addMapping: ['edit'],
  createVersion: ['edit'],
  releaseVersion: ['edit'],
  editExpansions: ['edit'],
  manageExternalExports: ['edit'],
  saveDefaultFilters: ['edit'],
  addReferences: ['edit'],
  removeReferences: ['edit'],
  editConcept: ['edit'],
  retireConcept: ['edit'],
  editMapping: ['edit'],
  retireMapping: ['edit'],
  createSimilar: ['edit'],
  manageMappings: ['edit'],
}

// The entry points that write to the version a page shows (a version page's own version, or HEAD on HEAD's page). The
// rest write to the repository's HEAD, whichever version is shown.
const SHOWN_VERSION_ENTRY_POINTS = ['editVersion', 'releaseVersion', 'deleteVersion', 'saveDefaultFilters']
export const writesShownVersion = entryPoint => SHOWN_VERSION_ENTRY_POINTS.includes(entryPoint)

export const isEntryPointLocked = (locks, entryPoint) => {
  const actions = ENTRY_POINT_ACTIONS[entryPoint]
  return Boolean(actions && locks?.length) && actions.every(action => locks.includes(action))
}

// Only the latest request may answer. start() begins one and returns its check, which stays true until another
// start() or an invalidate() (a cache hit, a change of user or language, an unmount).
export const createRequestGuard = () => {
  let latest = 0
  return {
    start: () => {
      const id = ++latest
      return () => id === latest
    },
    invalidate: () => {
      latest += 1
    },
  }
}
