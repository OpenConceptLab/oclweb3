import test from 'node:test'
import assert from 'node:assert/strict'

import { getExpansionCount, getVersionCount, getCountLabel } from '../expansionCounts.js'

const t = (key, values) => values ? `${key} ${JSON.stringify(values)}` : key

test("today's expansion summary: active_concepts is already every member", () => {
  assert.deepEqual(getExpansionCount({active_concepts: 8765, active_mappings: 0}, 'concepts'), {total: 8765})
  assert.deepEqual(getExpansionCount({active_concepts: 8765, active_mappings: 0}, 'mappings'), {total: 0})
})

test('once the API counts active members and adds retired_*, the total adds them up', () => {
  const summary = {active_concepts: 8289, retired_concepts: 476, active_mappings: 10, retired_mappings: 0}
  assert.deepEqual(getExpansionCount(summary, 'concepts'), {total: 8765, retired: 476})
  assert.deepEqual(getExpansionCount(summary, 'mappings'), {total: 10, retired: 0})
})

test('no count when the summary has none', () => {
  assert.deepEqual(getExpansionCount(undefined, 'concepts'), {})
  assert.deepEqual(getExpansionCount({active_concepts: null}, 'concepts'), {})
})

test("a version without an expanded count uses its own summary's active count", () => {
  assert.deepEqual(getVersionCount({active_concepts: 8765}, {active_concepts: 8289}, 'concepts'), {total: 8765})
  assert.deepEqual(getVersionCount(undefined, {active_concepts: 8289}, 'concepts'), {total: 8289, active: true})
  assert.deepEqual(getVersionCount({}, undefined, 'mappings'), {total: undefined, active: true})
})

test('the label says what the count is', () => {
  assert.equal(getCountLabel(t, 'concepts', {total: 8289, active: true}), 'concept.active_concepts')
  assert.equal(getCountLabel(t, 'concepts', {total: 8765, retired: 476}), `repo.summary_concepts_with_retired {"total":"${(8765).toLocaleString()}","retired":"476"}`)
  assert.equal(getCountLabel(t, 'mappings', {total: 0}), 'mapping.mappings')
  assert.equal(getCountLabel(t, 'mappings', {}), 'mapping.mappings')
})
