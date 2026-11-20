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
  return parts.length ? parts.join(', ') : t('addToCollection.no_references_added')
}
