import test from 'node:test'
import assert from 'node:assert/strict'

import { getOwnerSearchScope } from '../ownerSearch.js'

test('the Mapping Projects tab searches its own list', () => {
  assert.equal(getOwnerSearchScope('/users/member/map-projects'), 'map-projects')
  assert.equal(getOwnerSearchScope('/orgs/CIEL/map-projects/'), 'map-projects')
})

test('every other profile tab searches the owner\'s repositories', () => {
  assert.equal(getOwnerSearchScope('/users/member/'), 'repos')
  assert.equal(getOwnerSearchScope('/users/member'), 'repos')
  assert.equal(getOwnerSearchScope('/orgs/CIEL/repos'), 'repos')
  assert.equal(getOwnerSearchScope('/users/member/edit'), 'repos')
})

test('pages that aren\'t a profile have no owner scope', () => {
  assert.equal(getOwnerSearchScope('/'), null)
  assert.equal(getOwnerSearchScope('/search/'), null)
  assert.equal(getOwnerSearchScope('/users/'), null)
  assert.equal(getOwnerSearchScope(undefined), null)
})
