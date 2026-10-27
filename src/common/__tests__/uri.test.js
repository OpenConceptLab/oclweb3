import test from 'node:test'
import assert from 'node:assert/strict'

const { dropVersion } = await import('../uri.js')

test('a version id that repeats an earlier segment drops only the version', () => {
  assert.equal(dropVersion('/orgs/Arogya/collections/ciel/ciel/'), '/orgs/Arogya/collections/ciel/') // eslint-disable-line spellcheck/spell-checker
})

test('versioned repo, concept and mapping URIs drop their version', () => {
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/v2026-09-24/'), '/orgs/CIEL/sources/CIEL/')
  assert.equal(dropVersion('/users/tester/collections/C1/v1/'), '/users/tester/collections/C1/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/concepts/123/456/'), '/orgs/CIEL/sources/CIEL/concepts/123/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/mappings/789/1011/'), '/orgs/CIEL/sources/CIEL/mappings/789/')
})

test('unversioned URIs come back as they are', () => {
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/'), '/orgs/CIEL/sources/CIEL/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/concepts/123/'), '/orgs/CIEL/sources/CIEL/concepts/123/')
  assert.equal(dropVersion('/orgs/CIEL/'), '/orgs/CIEL/')
  assert.equal(dropVersion(''), '')
  assert.equal(dropVersion(undefined), undefined)
})
