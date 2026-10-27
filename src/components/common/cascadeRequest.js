// What TBv3 sends for the Cascade and Transform choices when it adds references to a collection.
// The references API reads the cascade only from the request body, and a bare method name cascades one level
// along every map type, so each choice is a cascade object with the API's keys.

export const PRESETS = [
  {
    id: 'none',
    labelKey: 'common.none',
    params: {},
  },
  {
    id: 'sourcemappings',
    labelKey: 'reference.source_mappings',
    params: { method: 'sourcemappings' },
  },
  {
    id: 'sourcetoconcepts',
    labelKey: 'reference.all_source_concepts_and_mappings',
    params: { method: 'sourcetoconcepts', map_types: 'Q-AND-A,CONCEPT-SET', cascade_levels: '*', return_map_types: '*' },
  },
  {
    id: 'custom',
    labelKey: 'common.custom',
  },
]

export const DEFAULT_CUSTOM_PARAMS = {
  method: 'sourcetoconcepts',
  map_types: '',
  exclude_map_types: '',
  cascade_levels: '*',
  return_map_types: '*',
}

const MAP_TYPE_KEYS = ['map_types', 'exclude_map_types', 'return_map_types']

// The custom form's fields are text: levels go as a number (or *), map types as a list without spaces,
// and a blank field is left out so the API applies its default
const toCascade = params => {
  if(!params?.method)
    return undefined

  const cascade = {method: params.method}
  const levels = String(params.cascade_levels ?? '').trim()
  if(levels)
    cascade.cascade_levels = /^\d+$/.test(levels) ? Number(levels) : levels
  MAP_TYPE_KEYS.forEach(key => {
    const mapTypes = String(params[key] ?? '').split(',').map(mapType => mapType.trim()).filter(Boolean).join(',')
    if(mapTypes)
      cascade[key] = mapTypes
  })
  return cascade
}

// Transform stores each concept and mapping the reference resolves to as its own extensional reference
export const getCascadeRequest = (presetId, customParams, transform) => ({
  cascade: toCascade(presetId === 'custom' ? customParams : PRESETS.find(preset => preset.id === presetId)?.params),
  queryParams: transform ? {transformReferences: 'extensional'} : undefined,
})
