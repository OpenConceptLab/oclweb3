import orderBy from 'lodash/orderBy.js'
import uniqBy from 'lodash/uniqBy.js'

// The filter panel's values and counts after a new facets answer (Search's prepareFacets).
// A value is [name, count, selected, disabled].
// 1. With nothing shown yet, the new facets replace them.
// 2. A field with an applied filter keeps every value it showed, so another can still be picked:
//    the API applies the field's own filter to its counts, so it answers with the applied values
//    only. Those take the new counts and the others keep the ones they had; an applied value
//    missing from the answer has no matches now, so it shows 0 (say a retired-only class once
//    retired ones are left out).
// 3. Another field takes the new counts, and a value it showed that's missing from the answer
//    stays, with 0, disabled.
// Each field's values come highest count first.
export const mergeFacets = (existingFacets, newFacets, appliedFacets) => {
  if(!existingFacets || !Object.keys(existingFacets).length)
    return newFacets

  const applied = appliedFacets || {}
  const mergedFacets = {}
  const fields = [...new Set([...Object.keys(newFacets || {}), ...Object.keys(existingFacets)])]
  fields.forEach(field => {
    const existing = existingFacets[field]
    const fresh = newFacets?.[field] || []
    const find = (values, name) => (values || []).find(facet => facet[0] === name)
    let merged = []
    if(Object.prototype.hasOwnProperty.call(applied, field)) {
      const names = [...new Set([...(existing || []).map(facet => facet[0]), ...fresh.map(facet => facet[0])])]
      names.forEach(name => {
        const newFacet = find(fresh, name)
        const existingFacet = find(existing, name)
        if(newFacet)
          merged.push(newFacet)
        else if(applied[field]?.[name])
          merged.push([existingFacet[0], 0, existingFacet[2]])
        else
          merged.push(existingFacet)
      })
    } else if(existing === undefined) {
      merged = fresh
    } else {
      existing.forEach(facet => {
        const newFacet = find(fresh, facet[0])
        merged.push(newFacet || [facet[0], 0, false, true])
      })
      merged = uniqBy([...merged, ...fresh], facet => facet[0])
    }
    mergedFacets[field] = orderBy(merged, facet => facet[1], 'desc')
  })
  return mergedFacets
}
