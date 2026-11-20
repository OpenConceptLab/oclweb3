import test from 'node:test'
import assert from 'node:assert/strict'

const { groupReferenceResults } = await import('../referenceResults.js')

const added = { added: true, expression: '/orgs/O/sources/S/concepts/1/', message: 'The concept 1 is successfully added to collection C' }
const unresolved = {
  added: true, resolved: false, expression: '/orgs/O/sources/S/v1/concepts/2/', repo_versions: ['/orgs/O/sources/S/v1/'],
  message: 'The reference is saved in collection C, but it resolved to no concepts or mappings in /orgs/O/sources/S/v1/'
}
const failed = { added: false, expression: '/orgs/O/sources/S/concepts/3/', message: { errors: [] } }

test('splits added, saved-but-unresolved and failed references', () => {
  assert.deepEqual(groupReferenceResults([added, unresolved, failed]), {
    added: [added], unresolved: [unresolved], failed: [failed]
  })
})

test('an item without resolved counts as added, as the API sends for references that resolve', () => {
  assert.deepEqual(groupReferenceResults([added]).added, [added])
  assert.deepEqual(groupReferenceResults([{ ...added, resolved: true }]).unresolved, [])
})

test('a pending or missing result has no groups', () => {
  assert.deepEqual(groupReferenceResults('pending'), { added: [], unresolved: [], failed: [] })
  assert.deepEqual(groupReferenceResults(null), { added: [], unresolved: [], failed: [] })
})

const { formatReferenceSummary } = await import('../referenceResults.js')

// Stands in for i18next: the key with its count, so the test checks keys and counts, not wording
const fakeT = (key, options) => {
  if (key === 'addToCollection.summary_separator') return ', '
  return options ? `${key}:${options.count}` : key
}

test('summary lists each non-empty group with its count', () => {
  const groups = groupReferenceResults([added, added, unresolved, failed])
  assert.equal(
    formatReferenceSummary(groups, fakeT),
    'addToCollection.summary_added:2, addToCollection.unresolved_count:1, addToCollection.summary_failed:1'
  )
})

test('summary with only unresolved references names only them', () => {
  assert.equal(formatReferenceSummary(groupReferenceResults([unresolved]), fakeT), 'addToCollection.unresolved_count:1')
})

test('summary of an empty response says no references were added', () => {
  assert.equal(formatReferenceSummary(groupReferenceResults([]), fakeT), 'addToCollection.no_references_added')
})
