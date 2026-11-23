import test from 'node:test'
import assert from 'node:assert/strict'

const {
  REPO_VERSIONED, UNVERSIONED, LEAVE, isResourceVersioned, mergePreviewPages, getDefaultChoice, getDefaultChoices,
  chooseAll, getConversionPayload, describeConversion, getConversionOutcome,
} = await import('../referenceConversionUtils.js')

const keeps = (overrides = {}) => ({ keeps_members: true, added_count: 0, removed_count: 0, ...overrides })
const changes = (overrides = {}) => ({ keeps_members: false, added_count: 1, removed_count: 1, ...overrides })

test('only references with a resource version are resource-versioned', () => {
  assert.equal(isResourceVersioned({ resource_version: '12' }), true)
  assert.equal(isResourceVersioned({ resource_version: null }), false)
  assert.equal(isResourceVersioned(undefined), false)
})

test('pages of a collection-wide preview are merged and judged together', () => {
  const merged = mergePreviewPages([
    { results: [{ id: 1, supported: true, repo_versioned: keeps(), unversioned: changes() }] },
    { results: [
      { id: 2, supported: true, repo_versioned: keeps(), unversioned: keeps() },
      { id: 3, supported: false, reason: 'it has a filter' },
    ] },
  ])

  assert.deepEqual(merged.results.map(item => item.id), [1, 2, 3])
  assert.deepEqual(merged.summary, {
    references: 3, supported: 2, repo_versioned_keeps_all: true, unversioned_keeps_all: false,
  })
})

test('nothing supported keeps nothing', () => {
  assert.equal(mergePreviewPages([{ results: [{ id: 1, supported: false }] }]).summary.repo_versioned_keeps_all, false)
})

test('the default choice is a conversion that keeps today\'s members, repo-versioned first', () => {
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: keeps(), unversioned: keeps() }), REPO_VERSIONED)
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: changes(), unversioned: keeps() }), UNVERSIONED)
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: null, unversioned: changes() }), LEAVE)
  assert.equal(getDefaultChoice({ supported: false }), LEAVE)
  assert.deepEqual(
    getDefaultChoices([{ id: 4, supported: true, repo_versioned: keeps() }, { id: 5, supported: false }]),
    { 4: REPO_VERSIONED, 5: LEAVE })
})

test('choosing one conversion for all skips references it can\'t be made for', () => {
  const results = [
    { id: 1, supported: true, repo_versioned: keeps(), unversioned: keeps() },
    { id: 2, supported: true, repo_versioned: null, unversioned: keeps() },
    { id: 3, supported: false },
  ]

  assert.deepEqual(chooseAll(results, REPO_VERSIONED), { 1: REPO_VERSIONED, 2: LEAVE, 3: LEAVE })
})

test('the payload holds only the references to convert, with numeric ids', () => {
  assert.deepEqual(
    getConversionPayload({ 1: REPO_VERSIONED, 2: LEAVE, 3: UNVERSIONED }),
    { conversions: [{ id: 1, to: REPO_VERSIONED }, { id: 3, to: UNVERSIONED }] })
})

test('a conversion is described by what it keeps, changes and locks', () => {
  assert.equal(describeConversion(null), null)
  assert.deepEqual(
    describeConversion(changes({ added_count: 2, removed_count: 3, creates_lock: true })),
    { keeps: false, added: 2, removed: 3, createsLock: true })
})

test('the outcome counts results by status', () => {
  const outcome = getConversionOutcome([
    { status: 'converted' }, { status: 'converted' }, { status: 'already_present' }, { status: 'not_converted' },
    { status: 'rolled_back' }, { status: 'unknown' },
  ])

  assert.deepEqual(outcome, { converted: 2, already_present: 1, not_converted: 1, rolled_back: 1, changed: 3 })
  assert.deepEqual(getConversionOutcome(null), {
    converted: 0, already_present: 0, not_converted: 0, rolled_back: 0, changed: 0,
  })
})
