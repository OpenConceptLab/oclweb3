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
