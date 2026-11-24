// Rebuild answers 204 once the rebuild ran, and 409 while one is already running
export const getRebuildOutcome = response => {
  const status = response?.status ?? response?.response?.status
  const detail = response?.data?.detail ?? response?.response?.data?.detail
  if(status >= 200 && status < 300)
    return {severity: 'success', messageKey: 'repo.expansion_rebuild_accepted', refresh: true}
  if(status === 409)
    return {severity: 'info', detail, messageKey: 'repo.expansion_rebuild_in_progress', refresh: true}
  return {severity: 'error', detail, messageKey: 'repo.unable_rebuild_expansion', refresh: false}
}

// Rebuilds in flight, by expansion URL: a second request for one only gets a 409
export const createRebuildGuard = () => {
  const pending = new Set()
  return {
    start: url => {
      if(pending.has(url)) return false
      pending.add(url)
      return true
    },
    finish: url => { pending.delete(url) },
    isPending: url => Boolean(url) && pending.has(url),
    list: () => [...pending],
  }
}

// Closes the rebuild dialog only if it still shows the expansion that answered
export const closeIfShowing = (current, url) => current?.url === url ? false : current
