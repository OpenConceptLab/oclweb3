import test from 'node:test'
import assert from 'node:assert/strict'

const { PRESETS, DEFAULT_CUSTOM_PARAMS, getCascadeRequest } = await import('../cascadeRequest.js')

// The cascade each preset sends in the request body. The references API reads the cascade only there,
// and a bare method name cascades one level along every map type.
const SENT = {
  none: undefined,
  sourcemappings: {method: 'sourcemappings'},
  sourcetoconcepts: {method: 'sourcetoconcepts', map_types: 'Q-AND-A,CONCEPT-SET', cascade_levels: '*', return_map_types: '*'},
  custom: {method: 'sourcetoconcepts', cascade_levels: '*', return_map_types: '*'},
}

test('every preset is covered', () => {
  assert.deepEqual(PRESETS.map(preset => preset.id), Object.keys(SENT))
})

Object.entries(SENT).forEach(([presetId, cascade]) => {
  test(`${presetId} sends its cascade in the body, with no query params`, () => {
    assert.deepEqual(getCascadeRequest(presetId, DEFAULT_CUSTOM_PARAMS, false), {cascade, queryParams: undefined})
  })

  test(`${presetId} with Transform asks for extensional references`, () => {
    assert.deepEqual(
      getCascadeRequest(presetId, DEFAULT_CUSTOM_PARAMS, true),
      {cascade, queryParams: {transformReferences: 'extensional'}}
    )
  })
})

test('custom levels go as a number and map types as a list without spaces; blank fields are left out', () => {
  const params = {
    method: 'sourcemappings',
    map_types: ' Q-AND-A, CONCEPT-SET ,',
    exclude_map_types: 'SAME-AS',
    cascade_levels: ' 2 ',
    return_map_types: '',
  }
  assert.deepEqual(
    getCascadeRequest('custom', params, false).cascade,
    {method: 'sourcemappings', map_types: 'Q-AND-A,CONCEPT-SET', exclude_map_types: 'SAME-AS', cascade_levels: 2}
  )
})
