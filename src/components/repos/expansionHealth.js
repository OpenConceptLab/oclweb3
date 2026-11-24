// The health the API stores for a collection version's default expansion, read for display only

export const HEALTH_STATES = {
  healthy: {color: 'success', labelKey: 'repo.expansion_health.state_healthy'},
  head_resolved: {color: 'info', labelKey: 'repo.expansion_health.state_head_resolved'},
  unhealthy: {color: 'error', labelKey: 'repo.expansion_health.state_unhealthy'},
  empty: {color: 'default', labelKey: 'repo.expansion_health.state_empty'},
}

// true: current; false: out of date with a recheck queued; null: out of date with nothing queued
export const getFreshness = isCurrent => {
  if(isCurrent === true) return 'current'
  if(isCurrent === false) return 'pending'
  return 'not_current'
}

const toStatus = (state, isCurrent) => {
  if(!state) return isCurrent === false ? {state: null, freshness: 'pending'} : null
  return {state, freshness: getFreshness(isCurrent)}
}

// {state, freshness} of an expansion, or null when health was never computed for it
export const getExpansionHealthStatus = expansion =>
  expansion ? toStatus(expansion.health?.state, expansion.health_is_current) : null

// Health is kept only for a version's default expansion: another one's stored health is stale
export const getDefaultExpansionHealthStatus = expansion =>
  expansion?.default ? getExpansionHealthStatus(expansion) : null

// A version's health is its default expansion's; the version's own summary covers it until expansions load,
// and wins once it is current while the loaded expansion isn't, as expansions aren't fetched again on a refresh
export const getVersionHealthStatus = (version, defaultExpansion) => {
  const summary = version?.expansion_health
  const fromSummary = summary ? toStatus(summary.state, summary.is_current) : null
  if(defaultExpansion && defaultExpansion.url === version?.expansion_url) {
    const fromExpansion = getExpansionHealthStatus(defaultExpansion)
    return fromSummary?.freshness === 'current' && fromExpansion?.freshness !== 'current' ? fromSummary : fromExpansion
  }
  return fromSummary
}

export const getStateConfig = state => HEALTH_STATES[state] || null

// a state this UI doesn't know yet shows as the API gives it
export const UNKNOWN_STATE_DESCRIPTION_KEY = 'repo.expansion_health.description_unknown'
export const getStateDescriptionKey = state => {
  if(!state) return 'repo.expansion_health.description_checking'
  return HEALTH_STATES[state] ? `repo.expansion_health.description_${state}` : UNKNOWN_STATE_DESCRIPTION_KEY
}

export const FRESHNESS_KEYS = {
  pending: 'repo.expansion_health.freshness_pending',
  not_current: 'repo.expansion_health.freshness_not_current',
}

// reason code: [translation key, field holding the repository or version URLs it names]
export const REASONS = {
  inconsistent_resolution: ['repo.expansion_health.reason_inconsistent_resolution', 'repositories'],
  duplicate_repo_versions: ['repo.expansion_health.reason_duplicate_repo_versions', 'repositories'],
  locked_version_deleted: ['repo.expansion_health.reason_locked_version_deleted', 'versions'],
  resource_versioned_references: ['repo.expansion_health.reason_resource_versioned_references'],
  unresolved_references: ['repo.expansion_health.reason_unresolved_references'],
  value_set_without_expansion: ['repo.expansion_health.reason_value_set_without_expansion'],
  system_version_unresolved: ['repo.expansion_health.reason_system_version_unresolved'],
  unreleased_versions: ['repo.expansion_health.reason_unreleased_versions'],
  interim_resource_versions: ['repo.expansion_health.reason_interim_resource_versions'],
  version_mismatches: ['repo.expansion_health.reason_version_mismatches'],
  ambiguous_members: ['repo.expansion_health.reason_ambiguous_members'],
  unattributed_members: ['repo.expansion_health.reason_unattributed_members'],
}
export const UNKNOWN_REASON_KEY = 'repo.expansion_health.reason_unknown'

// Each reason as {code, count, key, urls, hiddenCount, headConcepts, headMappings}, in the API's order
export const getHealthReasons = health => (health?.reasons || []).filter(reason => reason?.code).map(reason => {
  const [key, urlField] = REASONS[reason.code] || [UNKNOWN_REASON_KEY]
  const count = Number(reason.count) || 0
  const urls = urlField && Array.isArray(reason[urlField]) ? reason[urlField] : []
  return {
    code: reason.code,
    count,
    key,
    urls,
    // a deleted lock on another owner's private version is counted but not named
    hiddenCount: reason.code === 'locked_version_deleted' ? Math.max(count - urls.length, 0) : 0,
    headConcepts: Number(reason.head_concept) || 0,
    headMappings: Number(reason.head_mapping) || 0,
  }
})

export const getHeadResolvedRepositories = health => health?.head_resolved_repositories || []
export const getMultipleNamedVersions = health => health?.multiple_named_versions || []

// Total members by class across concepts and mappings, keeping only classes with members
export const getMemberClassCounts = health => {
  const totals = {}
  Object.values(health?.members || {}).forEach(counts => {
    Object.entries(counts || {}).forEach(([memberClass, count]) => {
      if(count) totals[memberClass] = (totals[memberClass] || 0) + count
    })
  })
  return totals
}
