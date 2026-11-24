import test from 'node:test'
import assert from 'node:assert/strict'

const {
  REPO_VERSIONED, UNVERSIONED, LEAVE, isResourceVersioned, mergePreviewPages, getDefaultChoice, getDefaultChoices,
  chooseAll, getConversionPayload, describeConversion, getConversionOutcome, getResourceVersionedIds,
  getQueuedConversion, followsHead, getRefusalMessage, getNotConvertedReasons, TASK_RESULT_QUERY,
  getRollbackMessages, isRolledBack,
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
    references: 3, supported: 2, unsupported: 1, repo_versioned_keeps_all: true, unversioned_keeps_all: false,
  })
})

test('nothing supported keeps nothing', () => {
  assert.equal(mergePreviewPages([{ results: [{ id: 1, supported: false }] }]).summary.repo_versioned_keeps_all, false)
})

test('the default choice keeps today\'s members, unversioned first as ocl_issues#2280 orders them', () => {
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: keeps(), unversioned: keeps() }), UNVERSIONED)
  assert.equal(
    getDefaultChoice({ supported: true, repo_versioned: keeps(), unversioned: keeps({ creates_lock: true }) }),
    UNVERSIONED)
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: keeps(), unversioned: changes() }), REPO_VERSIONED)
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: null, unversioned: changes() }), LEAVE)
  assert.equal(getDefaultChoice({ supported: false }), LEAVE)
  assert.deepEqual(
    getDefaultChoices([{ id: 4, supported: true, repo_versioned: keeps() }, { id: 5, supported: false }]),
    { 4: REPO_VERSIONED, 5: LEAVE })
})

test('a repo-versioned conversion that follows HEAD is never pre-selected', () => {
  const headNamed = keeps({ chosen_by: 'HEAD' })

  assert.equal(followsHead(headNamed), true)
  assert.equal(followsHead(keeps({ chosen_by: 'recorded' })), false)
  assert.equal(getDefaultChoice({ supported: true, repo_versioned: headNamed, unversioned: changes() }), LEAVE)
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

test('the payload sends back the version each preview showed', () => {
  const results = [
    { id: 1, repo_versioned: keeps({ repo_version: '/orgs/O/sources/S/v1/' }), unversioned: keeps() },
    { id: 2, repo_versioned: null, unversioned: keeps({ repo_version: '/orgs/O/sources/S/v2/' }) },
  ]

  assert.deepEqual(getConversionPayload({ 1: REPO_VERSIONED, 2: UNVERSIONED }, results), { conversions: [
    { id: 1, to: REPO_VERSIONED, repo_version: '/orgs/O/sources/S/v1/' },
    { id: 2, to: UNVERSIONED, repo_version: '/orgs/O/sources/S/v2/' },
  ] })
})

test('a conversion is described by what it keeps, changes and locks', () => {
  assert.equal(describeConversion(null), null)
  assert.deepEqual(
    describeConversion(changes({
      added_count: 2, removed_count: 3, creates_lock: true, chosen_by: 'release', repo_version: '/orgs/O/sources/S/v2/',
      added: ['/a/', '/b/'], removed: ['/c/'],
    })),
    {
      keeps: false, added: 2, removed: 3, createsLock: true, followsHead: false, version: '/orgs/O/sources/S/v2/',
      addedMembers: ['/a/', '/b/'], removedMembers: ['/c/'],
    })
})

test('a conversion follows HEAD whether it names HEAD or HEAD is its lock', () => {
  assert.equal(followsHead({ chosen_by: 'lock', follows_head: true }), true)
  assert.equal(followsHead({ chosen_by: 'HEAD' }), true)
  assert.equal(followsHead({ chosen_by: 'release', follows_head: false }), false)
})

test('an unversioned conversion that follows HEAD is still the default when it keeps the members', () => {
  const item = { supported: true, unversioned: keeps({ follows_head: true }), repo_versioned: keeps() }

  assert.equal(getDefaultChoice(item), UNVERSIONED)
})

test('the task is asked for its stored result', () => {
  assert.deepEqual(TASK_RESULT_QUERY, { verbose: true, result: 'all' })
})

test('a queued conversion the API refused reports the refusal\'s message', () => {
  assert.deepEqual(
    getQueuedConversion({ state: 'SUCCESS', result: { refusal: { detail: 'This collection is read-only.' } } }),
    { refusal: 'This collection is read-only.' })
  assert.equal(getRefusalMessage('Read-only'), 'Read-only')
  assert.equal(getRefusalMessage({ errors: ['First', 'Second'] }), 'First')
  assert.equal(getRefusalMessage({}), null)
})

test('the reasons references were left come back with their counts, most common first', () => {
  assert.deepEqual(getNotConvertedReasons([
    { status: 'converted' },
    { status: 'not_converted', reason: 'changed since the preview' },
    { status: 'not_converted', reason: 'it has no system' },
    { status: 'not_converted', reason: 'it has no system' },
    { status: 'rolled_back', reason: 'ignored' },
  ]), [{ reason: 'it has no system', count: 2 }, { reason: 'changed since the preview', count: 1 }])
  assert.deepEqual(getNotConvertedReasons(null), [])
})

test('a queued conversion reports its results once its task ends', () => {
  const results = [{ id: 1, status: 'converted' }]

  assert.equal(getQueuedConversion({ state: 'STARTED' }), null)
  assert.equal(getQueuedConversion(null), null)
  assert.deepEqual(getQueuedConversion({ state: 'SUCCESS', result: { results } }), { results })
  assert.deepEqual(getQueuedConversion({ state: 'SUCCESS', result: JSON.stringify({ results }) }), { results })
  assert.deepEqual(
    getQueuedConversion({ state: 'SUCCESS', result: { error: 'You no longer have edit access to this collection' } }),
    { error: 'You no longer have edit access to this collection' })
  assert.deepEqual(getQueuedConversion({ state: 'FAILURE', error_message: 'boom' }), { error: 'boom' })
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

test('the preview key is the sorted ids of the resource-versioned references, the same for a new array', () => {
  const references = [{ id: 9, resource_version: '2' }, { id: 3 }, { id: 4, resource_version: '1' }]

  assert.deepEqual(getResourceVersionedIds(references), [4, 9])
  assert.equal(getResourceVersionedIds([...references].reverse()).join(','), '4,9')
  assert.deepEqual(getResourceVersionedIds(undefined), [])
})

test('a conversion that changed nothing because it was rolled back is told apart', () => {
  assert.equal(isRolledBack({ changed: 0, rolled_back: 2 }), true)
  assert.equal(isRolledBack({ changed: 1, rolled_back: 2 }), false)
  assert.equal(isRolledBack({ changed: 0, rolled_back: 0 }), false)
})

test('rollback messages come from every shape of the API\'s errors, each once', () => {
  const results = [
    { status: 'rolled_back', errors: { '/a/': { errors: [{ description: 'Concept or Mapping reference name exists' }] } } },
    { status: 'rolled_back', errors: ['Invalid filter schema.'] },
    { status: 'rolled_back', errors: 'Invalid filter schema.' },
    { status: 'rolled_back', errors: null },
    { status: 'not_converted', reason: 'it has a filter' },
  ]

  assert.deepEqual(getRollbackMessages(results), ['Concept or Mapping reference name exists', 'Invalid filter schema.'])
  assert.deepEqual(getRollbackMessages(null), [])
})
