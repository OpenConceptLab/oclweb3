import test from 'node:test'
import assert from 'node:assert/strict'

import { getURLWithoutFacetFilter } from '../facetFilterURL.js'

const PATH = '/orgs/CIEL/sources/CIEL/v2026-10-23/concepts/'
const search = params => '?' + new URLSearchParams(params).toString()
const filtersOf = url => JSON.parse(new URL(url, 'https://x').searchParams.get('filters'))

test("removing the chip's filter keeps the other filters and the search term, from the first page", () => {
  const url = getURLWithoutFacetFilter(PATH, search({q: 'malaria', filters: JSON.stringify({conceptClass: 'Diagnosis', locale: ['en']}), page: '3'}), 'conceptClass')
  const params = new URL(url, 'https://x').searchParams
  assert.ok(url.startsWith(PATH + '?'))
  assert.equal(params.get('q'), 'malaria')
  assert.deepEqual(filtersOf(url), {locale: ['en']})
  assert.equal(params.has('page'), false)
})

test('the filters param goes when it held only that filter', () => {
  assert.equal(getURLWithoutFacetFilter(PATH, search({filters: JSON.stringify({mapType: 'SAME-AS'})}), 'mapType'), PATH)
  assert.equal(getURLWithoutFacetFilter('/search/', search({type: 'concepts', filters: JSON.stringify({conceptClass: 'Drug'})}), 'conceptClass'), '/search/?type=concepts')
})

test('nothing to change when the URL has no such filter', () => {
  // A Class picked in Searchlight with no value committed yet
  assert.equal(getURLWithoutFacetFilter(PATH, search({filters: JSON.stringify({locale: ['en']})}), 'conceptClass'), null)
  assert.equal(getURLWithoutFacetFilter(PATH, '', 'conceptClass'), null)
  // An Organization, Repository or User chip isn't a URL filter
  assert.equal(getURLWithoutFacetFilter(PATH, search({filters: JSON.stringify({conceptClass: 'Drug'})}), undefined), null)
  assert.equal(getURLWithoutFacetFilter(PATH, '?filters=not-json', 'conceptClass'), null)
})
