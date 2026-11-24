import test from 'node:test'
import assert from 'node:assert/strict'

import {
  hasRetiredControl, isCollectionSearchURL, getRetiredRequestParams, getIncludeRetiredFromFilter,
  withIncludeRetiredFrom, getIncludeRetired, getRetiredCount
} from '../retiredControl.js'

test('concept, mapping and repository searches have the control; others keep what they had', () => {
  assert.equal(hasRetiredControl('concepts'), true)
  assert.equal(hasRetiredControl('mappings'), true)
  assert.equal(hasRetiredControl('repos'), true)
  assert.equal(hasRetiredControl('references'), false)
  assert.equal(hasRetiredControl('users'), false)
  assert.equal(hasRetiredControl(false), false)
})

test('on by default in a collection, off in a source and in global search', () => {
  assert.equal(isCollectionSearchURL('/users/jontest2/collections/drugs/HEAD/expansions/autoexpand-HEAD/concepts/'), true)
  assert.equal(isCollectionSearchURL('/orgs/CIEL/collections/C1/v1/expansions/e1/mappings/'), true)
  assert.equal(isCollectionSearchURL('/orgs/CIEL/sources/CIEL/v2026-10-23/concepts/'), false)
  // a source that happens to be called "collections"
  assert.equal(isCollectionSearchURL('/orgs/MyOrg/sources/collections/concepts/'), false)
  assert.equal(isCollectionSearchURL(undefined), false)
})

test('on sends includeRetired=true; off sends includeRetired=false in a collection and nothing elsewhere', () => {
  assert.deepEqual(getRetiredRequestParams(true, false), {includeRetired: true})
  assert.deepEqual(getRetiredRequestParams(true, true), {includeRetired: true})
  assert.deepEqual(getRetiredRequestParams(false, true), {includeRetired: false})
  assert.deepEqual(getRetiredRequestParams(false, false), {})
})

test('a Retired filter from an old URL sets the control', () => {
  assert.equal(getIncludeRetiredFromFilter({true: true, false: true}), true)
  assert.equal(getIncludeRetiredFromFilter({false: true}), false)
  // retired only: the control can't show only retired ones, so it lets them in
  assert.equal(getIncludeRetiredFromFilter({true: true}), true)
  // excluded values: "not retired" keeps active ones only, "not active" means retired only
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, true: true}), false)
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, false: true}), true)
  assert.equal(getIncludeRetiredFromFilter({__exclude__: true, true: true, false: true}), undefined)
  assert.equal(getIncludeRetiredFromFilter({true: false}), undefined)
  assert.equal(getIncludeRetiredFromFilter(undefined), undefined)
})

test("a filter URL built from scratch keeps the control's setting from the current URL", () => {
  assert.equal(withIncludeRetiredFrom('/search/?type=concepts&filters=x', '?q=a&includeRetired=true'), '/search/?type=concepts&filters=x&includeRetired=true')
  assert.equal(withIncludeRetiredFrom('/orgs/CIEL/sources/CIEL/concepts/?filters=x', '?includeRetired=false'), '/orgs/CIEL/sources/CIEL/concepts/?filters=x&includeRetired=false')
  assert.equal(withIncludeRetiredFrom('/search/?type=concepts', '?q=a'), '/search/?type=concepts')
  assert.equal(withIncludeRetiredFrom('/search/?includeRetired=false', '?includeRetired=true'), '/search/?includeRetired=false')
})

test("the URL's setting wins over an old Retired filter, which wins over the page default", () => {
  assert.equal(getIncludeRetired('?includeRetired=true', {false: true}, false), true)
  assert.equal(getIncludeRetired('?includeRetired=false', undefined, true), false)
  assert.equal(getIncludeRetired('?includeRetired=1', undefined, false), true)
  assert.equal(getIncludeRetired('?includeRetired=True', undefined, false), true)
  assert.equal(getIncludeRetired('?includeRetired=0', undefined, true), false)
  assert.equal(getIncludeRetired('?q=malaria', {true: true, false: true}, false), true)
  assert.equal(getIncludeRetired('?q=malaria', {false: true}, true), false)
  assert.equal(getIncludeRetired('', undefined, true), true)
  assert.equal(getIncludeRetired('', undefined, false), false)
})

test("the retired count comes from the Retired facet's true value; none there means 0", () => {
  assert.equal(getRetiredCount({retired: [['false', 8289, false], ['true', 476, false]]}), 476)
  assert.equal(getRetiredCount({retired: [['true', 0, false]]}), 0)
  // the API leaves out values with no matches, so only active ones match
  assert.equal(getRetiredCount({retired: [['false', 8289, false]]}), 0)
  assert.equal(getRetiredCount({retired: []}), 0)
  // no Retired facet at all: nothing to show
  assert.equal(getRetiredCount({conceptClass: [['Drug', 8289, false]]}), undefined)
  assert.equal(getRetiredCount(undefined), undefined)
})
