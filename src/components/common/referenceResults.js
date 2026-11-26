import { getNotice } from './limitNoticePayload.js'

// An add-references response, split into what joined the collection, what the API saved
// but reports as resolved to nothing (`resolved: false`), and what failed
export const groupReferenceResults = results => {
  const list = Array.isArray(results) ? results : []
  return {
    added: list.filter(result => result.added && result.resolved !== false),
    unresolved: list.filter(result => result.added && result.resolved === false),
    failed: list.filter(result => !result.added),
  }
}

// One summary line for the groups, e.g. "2 references added, 1 saved but resolved to nothing"
export const formatReferenceSummary = (groups, t) => {
  const parts = [
    groups.added.length && t('addToCollection.summary_added', { count: groups.added.length }),
    groups.unresolved.length && t('addToCollection.unresolved_count', { count: groups.unresolved.length }),
    groups.failed.length && t('addToCollection.summary_failed', { count: groups.failed.length }),
  ].filter(Boolean)
  return parts.length ? parts.join(t('addToCollection.summary_separator')) : t('addToCollection.no_references_added')
}

// What an add-references request came back with: its results, a queued request (pending), the notice a refusal
// carries, or the API's error text (null when it sent none)
export const getAddReferencesOutcome = response => {
  const status = response?.status
  if(status === 200 || status === 201)
    return {results: Array.isArray(response.data) ? response.data : []}
  if(status === 202)
    return {pending: true}
  const notice = getNotice(response)
  if(notice)
    return {notice}
  return {error: (response && (response.detail || response.error)) || null}
}
