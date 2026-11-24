import { isTaskFinished } from '../repos/taskState.js'

// Converting a HEAD collection's resource-versioned references, through the API's
// references/conversions/ endpoints: the preview says what each conversion keeps, the conversion swaps them server side

export const REPO_VERSIONED = 'repo_versioned'
export const UNVERSIONED = 'unversioned'
export const LEAVE = 'leave'
export const CONVERSIONS = [REPO_VERSIONED, UNVERSIONED]
export const PREVIEW_PAGE_SIZE = 500

// For a value holding URLs: React escapes what it renders, so i18next's own escaping would show &#x2F; per slash
export const UNESCAPED = { interpolation: { escapeValue: false } }

export const isResourceVersioned = reference => Boolean(reference?.resource_version)

// The ids of the resource-versioned references among these, sorted: a stable key for the preview to load by
export const getResourceVersionedIds = references => (references || [])
  .filter(isResourceVersioned).map(reference => reference.id).filter(Boolean).sort((a, b) => a - b)

// Preview pages of '*' merged into one: every page's results, and the summary judged over all of them
export const mergePreviewPages = pages => {
  const results = pages.flatMap(page => page?.results || [])
  return { results, summary: summarize(results) }
}

export const summarize = results => {
  const supported = results.filter(item => item.supported)
  const keepsAll = conversion => supported.length > 0 && supported.every(item => item[conversion]?.keeps_members)
  return {
    references: results.length,
    supported: supported.length,
    unsupported: results.length - supported.length,
    [`${REPO_VERSIONED}_keeps_all`]: keepsAll(REPO_VERSIONED),
    [`${UNVERSIONED}_keeps_all`]: keepsAll(UNVERSIONED),
  }
}

// A repo-versioned conversion that names HEAD: its member moves with the next edit in HEAD
// A conversion whose version is HEAD, named or as the lock: its member moves with the next edit in HEAD
export const followsHead = conversion => Boolean(conversion?.follows_head) || conversion?.chosen_by === 'HEAD'

// The conversion offered first (ocl_issues#2280's order): unversioned when it keeps today's members, whatever it
// resolves to, else repo-versioned when it does, never one naming HEAD; else the reference is left as it is
export const getDefaultChoice = item => {
  if(!item?.supported)
    return LEAVE
  if(item[UNVERSIONED]?.keeps_members)
    return UNVERSIONED
  if(item[REPO_VERSIONED]?.keeps_members && !followsHead(item[REPO_VERSIONED]))
    return REPO_VERSIONED
  return LEAVE
}

export const getDefaultChoices = results => Object.fromEntries(
  results.map(item => [item.id, getDefaultChoice(item)])
)

// Every supported reference set to one conversion, where that conversion can be made for it
export const chooseAll = (results, conversion) => Object.fromEntries(
  results.map(item => [item.id, item.supported && item[conversion] ? conversion : LEAVE])
)

// What to convert, each with the version its preview showed, so the API refuses one that changed since
export const getConversionPayload = (choices, results = []) => {
  const items = Object.fromEntries(results.map(item => [item.id, item]))
  return {
    conversions: Object.entries(choices)
      .filter(([, choice]) => CONVERSIONS.includes(choice))
      .map(([id, choice]) => {
        const repoVersion = items[id]?.[choice]?.repo_version
        return { id: Number(id), to: choice, ...(repoVersion ? { repo_version: repoVersion } : {}) }
      })
  }
}

// How a conversion changes the reference's members, for its cell in the dialog
export const describeConversion = conversion => {
  if(!conversion)
    return null
  return {
    keeps: Boolean(conversion.keeps_members),
    added: conversion.added_count || 0,
    removed: conversion.removed_count || 0,
    createsLock: Boolean(conversion.creates_lock),
    followsHead: followsHead(conversion),
    version: conversion.repo_version || null,
    addedMembers: conversion.added || [],
    removedMembers: conversion.removed || [],
  }
}

// What a queued conversion's task reports once it ends: its results, or the error that stopped it. null while it runs
// The task is asked for with verbose and result=all, which return its stored result (result=true leaves it out)
export const TASK_RESULT_QUERY = { verbose: true, result: 'all' }

export const getQueuedConversion = task => {
  if(!isTaskFinished(task?.state))
    return null
  const result = typeof task.result === 'string' ? parseJSON(task.result) : task.result
  if(String(task.state).toUpperCase() === 'SUCCESS' && Array.isArray(result?.results))
    return { results: result.results }
  if(result?.refusal !== undefined && result?.refusal !== null)
    return { refusal: getRefusalMessage(result.refusal) }
  return { error: result?.error || task.error_message || null }
}

// A refusal is the body a write would have answered with: its detail, else its first message
export const getRefusalMessage = refusal => {
  if(typeof refusal === 'string')
    return refusal
  if(typeof refusal?.detail === 'string')
    return refusal.detail
  const first = Object.values(refusal || {}).flat().find(value => typeof value === 'string')
  return first || null
}

// The reasons the API left references as they were, each with how many it applies to, most common first
export const getNotConvertedReasons = results => {
  const counts = {}
  ;(Array.isArray(results) ? results : []).forEach(result => {
    if(result?.status === 'not_converted' && result.reason)
      counts[result.reason] = (counts[result.reason] || 0) + 1
  })
  return Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count)
}

const parseJSON = value => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

// Counts of the conversion's results by status, for the alert shown once it's done
export const getConversionOutcome = results => {
  const counts = { converted: 0, already_present: 0, not_converted: 0, rolled_back: 0 }
  ;(Array.isArray(results) ? results : []).forEach(result => {
    if(result?.status in counts)
      counts[result.status] += 1
  })
  return { ...counts, changed: counts.converted + counts.already_present }
}

// The API's messages for conversions that were rolled back, each once: its errors come as a string, a list, or an
// object keyed by expression whose entries may carry a description
export const getRollbackMessages = (results, limit = 3) => {
  const flatten = value => {
    if(typeof value === 'string')
      return [value]
    if(Array.isArray(value))
      return value.flatMap(flatten)
    if(value && typeof value === 'object')
      return typeof value.description === 'string' ? [value.description] : Object.values(value).flatMap(flatten)
    return []
  }
  const messages = (Array.isArray(results) ? results : [])
    .filter(result => result?.status === 'rolled_back').flatMap(result => flatten(result.errors))
  return [...new Set(messages)].slice(0, limit)
}

// A conversion that changed nothing because the API rolled it back: the dialog stays open to say why
export const isRolledBack = outcome => outcome.changed === 0 && outcome.rolled_back > 0
