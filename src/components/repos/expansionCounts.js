// What a collection version or expansion row shows for its concepts and mappings
// (OpenConceptLab/ocl_issues#3057). A collection keeps its retired members on purpose, so an
// expansion's row shows all of them, and how many are retired once the API says.
//
// An expansion summary's active_concepts / active_mappings counted every member, retired ones
// included, until the API began to count active ones there and to add retired_concepts /
// retired_mappings. Either way, the total is the same.
const isCount = value => Number.isFinite(value)

export const getExpansionCount = (summary, resource) => {
  const active = summary?.[`active_${resource}`]
  if(!isCount(active))
    return {}
  const retired = summary?.[`retired_${resource}`]
  return isCount(retired) ? {total: active + retired, retired} : {total: active}
}

// A collection version's count comes from its default expansion when that has one. Otherwise it's
// the version's own summary, which counts active ones only.
export const getVersionCount = (expansionSummary, versionSummary, resource) => {
  const fromExpansion = getExpansionCount(expansionSummary, resource)
  if(isCount(fromExpansion.total))
    return fromExpansion
  return {total: versionSummary?.[`active_${resource}`], active: true}
}

const COUNT_KEYS = {
  concepts: {plain: 'concept.concepts', active: 'concept.active_concepts', withRetired: 'repo.summary_concepts_with_retired'},
  mappings: {plain: 'mapping.mappings', active: 'mapping.active_mappings', withRetired: 'repo.summary_mappings_with_retired'},
}

// The words for a count from getVersionCount: "Active Concepts" for active ones, "8,765 concepts
// (476 retired)" once the retired count is known, else "Concepts".
export const getCountLabel = (t, resource, count) => {
  const keys = COUNT_KEYS[resource]
  if(count?.active)
    return t(keys.active)
  if(isCount(count?.retired) && isCount(count?.total))
    return t(keys.withRetired, {total: count.total.toLocaleString(), retired: count.retired.toLocaleString()})
  return t(keys.plain)
}
