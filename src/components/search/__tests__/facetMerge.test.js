import test from 'node:test'
import assert from 'node:assert/strict'

import { mergeFacets } from '../facetMerge.js'

const classes = {conceptClass: [['Drug', 8765, false], ['Diagnosis', 4000, false], ['Test', 900, false]]}

test('with nothing shown yet, the new facets replace them', () => {
  assert.deepEqual(mergeFacets({}, classes, {}), classes)
  assert.deepEqual(mergeFacets(undefined, classes, {}), classes)
})

test("an applied filter's other values keep their counts, so another can still be picked", () => {
  // the API answers Class with Drug only once Class = Drug is applied
  const merged = mergeFacets(classes, {conceptClass: [['Drug', 8289, false]]}, {conceptClass: {Drug: true}})
  const counts = Object.fromEntries(merged.conceptClass.map(facet => [facet[0], facet[1]]))
  assert.deepEqual(counts, {Drug: 8289, Diagnosis: 4000, Test: 900})
  assert.equal(merged.conceptClass.some(facet => facet[3]), false)
})

test('an applied value missing from the answer has no matches now, so it shows 0', () => {
  const merged = mergeFacets(classes, {conceptClass: [['Drug', 8289, false]]}, {conceptClass: {Drug: true, Test: true}})
  const counts = Object.fromEntries(merged.conceptClass.map(facet => [facet[0], facet[1]]))
  assert.deepEqual(counts, {Drug: 8289, Diagnosis: 4000, Test: 0})
})

test("another field takes the new counts; a value it showed that's missing stays, disabled at 0", () => {
  const existing = {...classes, datatype: [['Coded', 10, false], ['N/A', 5, false]]}
  const merged = mergeFacets(existing, {conceptClass: [['Drug', 8289, false]], datatype: [['N/A', 4, false], ['Text', 1, false]]}, {conceptClass: {Drug: true}})
  assert.deepEqual(merged.datatype.find(facet => facet[0] === 'Coded'), ['Coded', 0, false, true])
  assert.deepEqual(merged.datatype.find(facet => facet[0] === 'N/A'), ['N/A', 4, false])
  assert.deepEqual(merged.datatype.find(facet => facet[0] === 'Text'), ['Text', 1, false])
})

test('a field that is new in the answer comes in as it is', () => {
  const merged = mergeFacets(classes, {...classes, locale: [['en', 3, false]]}, {})
  assert.deepEqual(merged.locale, [['en', 3, false]])
})

test('values come highest count first', () => {
  const merged = mergeFacets(classes, {conceptClass: [['Test', 5, false], ['Drug', 8289, false]]}, {conceptClass: {Drug: true, Test: true}})
  assert.deepEqual(merged.conceptClass.map(facet => facet[0]), ['Drug', 'Diagnosis', 'Test'])
})

test("under another Retired setting, an applied filter's other values stay but show no count", () => {
  const merged = mergeFacets(classes, {conceptClass: [['Drug', 8289, false]]}, {conceptClass: {Drug: true}}, false)
  assert.deepEqual(merged.conceptClass.map(facet => [facet[0], facet[1]]), [['Drug', 8289], ['Diagnosis', undefined], ['Test', undefined]])
  assert.equal(merged.conceptClass.some(facet => facet[3]), false)
})
