// The filter panel's Retired control, "Include retired" (OpenConceptLab/ocl_issues#3057). It sets
// whether retired concepts, mappings or repositories are in the results, the other filters' values
// and their counts alike. It sits in the panel like a filter, but it isn't the API's `retired`
// facet: the panel keeps its own setting and turns it into request parameters here.
const EXCLUDE_FILTER_KEY = '__exclude__'
const TRUTHY = ['true', 'True', 'TRUE', '1']

export const URL_PARAM = 'includeRetired'

export const hasRetiredControl = resource => ['concepts', 'mappings', 'repos'].includes(resource)

// A search inside a collection (its members, through an expansion) rather than a source, global or
// repository search. It's also the control's default: a collection's members are its choice,
// retired ones included, so a collection shows them unless the control is turned off. Elsewhere
// they're hidden unless it's turned on.
export const isCollectionSearchURL = url => /^\/(users|orgs)\/[^/]+\/collections\//.test(url || '')

// What the list request and the facets request both send, and Matched Candidates ($match) too.
// Turned on: includeRetired=true. Turned off: in a collection, includeRetired=false, as the API
// includes retired members there by default (a parameter, not a filter, so a plain listing keeps
// the database path and pages past 10,000 results); elsewhere nothing, as the API already leaves
// retired ones out.
export const getRetiredRequestParams = (includeRetired, inCollection) => {
  if(includeRetired)
    return {includeRetired: true}
  return inCollection ? {includeRetired: false} : {}
}

// The control's setting from a Retired filter in an old URL, in the form the filter panel keeps
// ({true: true, false: true}, with '__exclude__' for "everything but"). Any filter that lets
// retired ones in, a retired-only one too, turns it on; one that keeps only active ones turns it
// off; anything else leaves it alone.
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

// Adds the current URL's setting to a URL built from scratch (Searchlight's filter URLs), so
// applying a filter there doesn't put the control back to the page's default.
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
    return TRUTHY.includes(queryParams.get(URL_PARAM))
  const fromFilter = getIncludeRetiredFromFilter(appliedRetired)
  return fromFilter === undefined ? defaultValue : fromFilter
}

// How many results are retired, from the facets response's Retired counts, which the API counts
// for both values whatever the control says. A Retired facet with no `true` value means none (the
// API leaves out empty values); no Retired facet at all means no count to show.
export const getRetiredCount = facetFields => {
  const values = facetFields?.retired
  if(!Array.isArray(values))
    return undefined
  return values.find(facet => String(facet?.[0]) === 'true')?.[1] ?? 0
}
