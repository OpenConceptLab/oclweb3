const OWNER_SCOPE_FIELDS = ['owner', 'ownerType']
const OWNER_SCOPED_RESOURCES = ['concepts', 'mappings', 'repos']

export const getOwnerScopeFilters = (search, resource) => {
  if(!OWNER_SCOPED_RESOURCES.includes(resource))
    return {}
  let filters = {}
  try {
    filters = JSON.parse(new URLSearchParams(search).get('filters') || '{}')
  } catch(e) {
    return {}
  }
  const scope = {}
  OWNER_SCOPE_FIELDS.forEach(field => {
    if(filters?.[field])
      scope[field] = filters[field]
  })
  return scope
}
