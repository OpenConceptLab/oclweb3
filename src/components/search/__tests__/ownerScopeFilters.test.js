import test from 'node:test'
import assert from 'node:assert/strict'

import { getOwnerScopeFilters } from '../ownerScopeFilters.js'

const search = filters => '?' + new URLSearchParams({filters: JSON.stringify(filters)}).toString()

test('owner and ownerType carry to resources that have an owner facet, other facets are dropped', () => {
  const url = search({owner: 'CIEL', ownerType: 'Organization', conceptClass: 'Diagnosis', locale: ['en']})
  const expected = {owner: 'CIEL', ownerType: 'Organization'}
  assert.deepEqual(getOwnerScopeFilters(url, 'concepts'), expected)
  assert.deepEqual(getOwnerScopeFilters(url, 'mappings'), expected)
  assert.deepEqual(getOwnerScopeFilters(url, 'repos'), expected)
})

test('resources without an owner facet get no scope', () => {
  const url = search({owner: 'CIEL', ownerType: 'Organization'})
  assert.deepEqual(getOwnerScopeFilters(url, 'orgs'), {})
  assert.deepEqual(getOwnerScopeFilters(url, 'users'), {})
})

test('no scope when the URL has none or the filters are malformed', () => {
  assert.deepEqual(getOwnerScopeFilters('', 'concepts'), {})
  assert.deepEqual(getOwnerScopeFilters('?filters=%7B', 'concepts'), {})
  assert.deepEqual(getOwnerScopeFilters(search({conceptClass: 'Diagnosis'}), 'concepts'), {})
})
