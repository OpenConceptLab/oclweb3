// A Searchlight Class/Map Type chip is derived from the URL's `filters` (see SearchInput), so
// removing the chip has to take its filter out of the URL too, or the list stays filtered with no
// chip showing and a reload brings the chip back. Other filters (e.g. a repo's default filters)
// and the search term stay; paging starts over. Returns null when the URL has no such filter: an
// Organization/Repository/User chip, or a Class/Map Type picked with no value committed yet.
export const getURLWithoutFacetFilter = (pathname, search, facetField) => {
  if(!facetField)
    return null
  const queryParams = new URLSearchParams(search)
  let filters = {}
  try {
    filters = JSON.parse(queryParams.get('filters') || '{}')
  } catch(e) {
    return null
  }
  if(filters?.[facetField] === undefined)
    return null

  delete filters[facetField]
  if(Object.keys(filters).length)
    queryParams.set('filters', JSON.stringify(filters))
  else
    queryParams.delete('filters')
  queryParams.delete('page')
  const query = queryParams.toString()
  return query ? `${pathname}?${query}` : pathname
}
