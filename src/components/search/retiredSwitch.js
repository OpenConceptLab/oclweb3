// The "Include retired" switch in the results toolbar (OpenConceptLab/ocl_issues#3057). It sets
// whether retired concepts or mappings are in the results, the filter values and the filter counts
// alike, so the Retired filter is no longer in the filter panel for these searches.
const SWITCH_RESOURCES = ['concepts', 'mappings']
const EXCLUDE_FILTER_KEY = '__exclude__'

export const URL_PARAM = 'includeRetired'

export const hasRetiredSwitch = resource => SWITCH_RESOURCES.includes(resource)

// A collection's members are its choice, retired ones included, so a collection shows them
// unless the switch is turned off. Sources and global search hide them unless it's turned on.
export const getDefaultIncludeRetired = url => /^\/(users|orgs)\/[^/]+\/collections\//.test(url || '')

// What the list request and the filter (facet) request both send.
export const getRetiredRequestParams = includeRetired => includeRetired ? {includeRetired: true} : {retired: 'false'}

// The switch's state from a Retired filter in an old URL or in a repository's saved default
// filters, in the form the filter panel keeps ({true: true, false: true}, with '__exclude__' for
// "everything but"). Any filter that lets retired ones in, a retired-only one too, turns the switch
// on; one that keeps only active ones turns it off; anything else leaves it alone.
export const getIncludeRetiredFromFilter = appliedRetired => {
  if(!appliedRetired || typeof appliedRetired !== 'object')
    return undefined
  const picked = Object.keys(appliedRetired).filter(value => value !== EXCLUDE_FILTER_KEY && appliedRetired[value])
  const included = appliedRetired[EXCLUDE_FILTER_KEY] ? ['true', 'false'].filter(value => !picked.includes(value)) : picked
  if(included.includes('true'))
    return true
  if(included.includes('false'))
    return false
  return undefined
}

// The same from a repository's saved default filters, kept as query values ('true,false', 'false',
// '!true', or a boolean). A saved Retired filter becomes the page's default for the switch.
export const getIncludeRetiredFromSavedFilters = savedFilters => {
  const value = savedFilters?.retired
  if(value === undefined || value === null || value === '')
    return undefined
  const text = String(value)
  const excluded = text.startsWith('!')
  const applied = excluded ? {[EXCLUDE_FILTER_KEY]: true} : {}
  ;(excluded ? text.slice(1) : text).split(',').forEach(each => { applied[each.trim()] = true })
  return getIncludeRetiredFromFilter(applied)
}

// Adds the current URL's switch setting to a URL built from scratch (Searchlight's filter URLs),
// so applying a filter there doesn't turn the switch back to the page's default.
export const withIncludeRetiredFrom = (url, search) => {
  const value = new URLSearchParams(search || '').get(URL_PARAM)
  if(value === null || new URLSearchParams(url.split('?')[1] || '').has(URL_PARAM))
    return url
  return `${url}${url.includes('?') ? '&' : '?'}${URL_PARAM}=${encodeURIComponent(value)}`
}

// The URL's own setting wins, then a Retired filter from an old URL, then the page's default.
export const getIncludeRetired = (search, appliedRetired, defaultValue) => {
  const queryParams = new URLSearchParams(search || '')
  if(queryParams.has(URL_PARAM))
    return queryParams.get(URL_PARAM) === 'true'
  const fromFilter = getIncludeRetiredFromFilter(appliedRetired)
  return fromFilter === undefined ? defaultValue : fromFilter
}

// How many results are retired, from the facet response's Retired counts. Undefined when the
// response has no count for retired ones (the API leaves it out when retired=false is sent).
export const getRetiredCount = facetFields => {
  const bucket = (facetFields?.retired || []).find(facet => String(facet?.[0]) === 'true')
  return bucket && Number.isFinite(bucket[1]) ? bucket[1] : undefined
}
