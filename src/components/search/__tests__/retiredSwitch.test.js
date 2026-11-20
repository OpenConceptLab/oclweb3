import test from 'node:test'
import assert from 'node:assert/strict'

import {
  hasRetiredSwitch, getDefaultIncludeRetired, getRetiredRequestParams, getIncludeRetiredFromFilter,
  getIncludeRetired, getRetiredCount
} from '../retiredSwitch.js'

test('concept and mapping searches have the switch; others keep what they had', () => {
  assert.equal(hasRetiredSwitch('concepts'), true)
  assert.equal(hasRetiredSwitch('mappings'), true)
  assert.equal(hasRetiredSwitch('repos'), false)
  assert.equal(hasRetiredSwitch('references'), false)
  assert.equal(hasRetiredSwitch(false), false)
})

test('on by default in a collection, off in a source and in global search', () => {
  assert.equal(getDefaultIncludeRetired('/users/jontest2/collections/drugs/HEAD/expansions/autoexpand-HEAD/concepts/'), true)
  assert.equal(getDefaultIncludeRetired('/orgs/CIEL/collections/C1/v1/expansions/e1/mappings/'), true)
  assert.equal(getDefaultIncludeRetired('/orgs/CIEL/sources/CIEL/v2026-10-23/concepts/'), false)
  assert.equal(getDefaultIncludeRetired(undefined), false)
})

test('off sends retired=false and on sends includeRetired=true', () => {
  assert.deepEqual(getRetiredRequestParams(false), {retired: 'false'})
  assert.deepEqual(getRetiredRequestParams(true), {includeRetired: true})
})

test('a Retired filter from an old URL or saved defaults sets the switch', () => {
  assert.equal(getIncludeRetiredFromFilter({true: true, false: true}), true)
  assert.equal(getIncludeRetiredFromFilter({false: true}), false)
  // retired only: the switch can't show only retired ones, so it lets them in
  assert.equal(getIncludeRetiredFromFilter({true: true}), true)
  // excluded values: "not retired" keeps active ones only, "not active" means retired only
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, true: true}), false)
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, false: true}), true)
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, true: true, false: true}), undefined)
  assert.equal(getIncludeRetiredFromFilter({true: false}), undefined)
  assert.equal(getIncludeRetiredFromFilter(undefined), undefined)
})

test("the URL's setting wins over an old Retired filter, which wins over the page default", () => {
  assert.equal(getIncludeRetired('?includeRetired=true', {false: true}, false), true)
  assert.equal(getIncludeRetired('?includeRetired=false', undefined, true), false)
  assert.equal(getIncludeRetired('?q=malaria', {true: true, false: true}, false), true)
  assert.equal(getIncludeRetired('?q=malaria', {false: true}, true), false)
  assert.equal(getIncludeRetired('', undefined, true), true)
  assert.equal(getIncludeRetired('', undefined, false), false)
})

test("the retired count comes from the Retired facet's true value, and only when it's there", () => {
  assert.equal(getRetiredCount({retired: [['false', 8289, false], ['true', 476, false]]}), 476)
  assert.equal(getRetiredCount({retired: [['true', 0, false]]}), 0)
  // today's API leaves the true value out when retired=false is sent
  assert.equal(getRetiredCount({retired: [['false', 8289, false]]}), undefined)
  assert.equal(getRetiredCount({conceptClass: [['Drug', 8289, false]]}), undefined)
  assert.equal(getRetiredCount(undefined), undefined)
})
