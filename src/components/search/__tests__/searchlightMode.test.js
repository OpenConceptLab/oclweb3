import test from 'node:test'
import assert from 'node:assert/strict'

import { getModeForFilterType } from '../searchlightMode.js'

test('a filter set from outside the drawer opens it on that filter', () => {
  assert.equal(getModeForFilterType('query', 'conceptClass'), 'typeBrowse')
})

test('a filter cleared from outside the drawer brings back the normal options', () => {
  assert.equal(getModeForFilterType('typeBrowse', null), 'query')
})

test("the drawer's own choices stand", () => {
  // Backspace on an empty box clears the filter and steps back to picking a filter type
  assert.equal(getModeForFilterType('typeSelect', null), 'typeSelect')
  assert.equal(getModeForFilterType('typeBrowse', 'conceptClass'), 'typeBrowse')
  assert.equal(getModeForFilterType('typeSelect', 'conceptClass'), 'typeSelect')
  assert.equal(getModeForFilterType('query', null), 'query')
})
