import test from 'node:test'
import assert from 'node:assert/strict'

const { isSemanticVersion, withSemanticSearch } = await import('../semanticSearch.js')

test('a version is semantic when its match algorithms include llm', () => {
  assert.equal(isSemanticVersion({match_algorithms: ['es', 'llm']}), true)
  assert.equal(isSemanticVersion({match_algorithms: ['es']}), false)
  assert.equal(isSemanticVersion({}), false)
  assert.equal(isSemanticVersion(null), false)
})

test('turning semantic search on adds llm and keeps the other algorithms', () => {
  assert.deepEqual(withSemanticSearch(['es'], true), ['es', 'llm'])
  assert.deepEqual(withSemanticSearch(['es', 'llm'], true), ['es', 'llm'])
})

test('turning semantic search off removes only llm', () => {
  assert.deepEqual(withSemanticSearch(['es', 'llm'], false), ['es'])
  assert.deepEqual(withSemanticSearch(['es'], false), ['es'])
})

test('with no other algorithm left, es is kept, as the API defaults', () => {
  assert.deepEqual(withSemanticSearch(['llm'], false), ['es'])
  assert.deepEqual(withSemanticSearch(null, false), ['es'])
})

test('no algorithms means es, as the API stores it', () => {
  assert.deepEqual(withSemanticSearch([], true), ['es', 'llm'])
  assert.deepEqual(withSemanticSearch(null, true), ['es', 'llm'])
})

test('a semantic-only setting stays semantic-only when semantic search stays on', () => {
  assert.deepEqual(withSemanticSearch(['llm'], true), ['llm'])
})
