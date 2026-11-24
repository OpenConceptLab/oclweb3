import test from 'node:test'
import assert from 'node:assert/strict'

const { getRebuildOutcome, createRebuildGuard, canSendRebuild, closeIfShowing, withoutExpansionState } = await import('../rebuildExpansion.js')

test('204 with no body is a successful rebuild', () => {
  assert.deepEqual(
    getRebuildOutcome({status: 204, data: ''}),
    {severity: 'success', messageKey: 'repo.expansion_rebuild_accepted', refresh: true}
  )
})

test('200, 201 and 202 are successful too', () => {
  for(const status of [200, 201, 202])
    assert.equal(getRebuildOutcome({status}).severity, 'success')
})

test('409 from a raw axios error is a rebuild already running, with the API detail', () => {
  const error = {response: {status: 409, data: {detail: 'Expansion is already being processed'}}}
  assert.deepEqual(getRebuildOutcome(error), {
    severity: 'info', detail: 'Expansion is already being processed',
    messageKey: 'repo.expansion_rebuild_in_progress', refresh: true
  })
})

test('other failures are errors and keep the API detail', () => {
  const outcome = getRebuildOutcome({response: {status: 403, data: {detail: 'Forbidden'}}})
  assert.equal(outcome.severity, 'error')
  assert.equal(outcome.detail, 'Forbidden')
  assert.equal(outcome.refresh, false)
})

test('a network failure with no response is an error with no detail', () => {
  const outcome = getRebuildOutcome({message: 'Network Error'})
  assert.equal(outcome.severity, 'error')
  assert.equal(outcome.detail, undefined)
})

const A = '/orgs/O/collections/C/HEAD/expansions/autoexpand-HEAD/'
const B = '/orgs/O/collections/C/v1/expansions/autoexpand-v1/'

test('a second rebuild of the same expansion is refused while the first is pending', () => {
  const guard = createRebuildGuard()
  assert.equal(guard.start(A), true)
  assert.equal(guard.start(A), false)
  assert.equal(guard.isPending(A), true)
})

test('a pending rebuild does not block another expansion', () => {
  const guard = createRebuildGuard()
  guard.start(A)
  assert.equal(guard.isPending(B), false)
  assert.equal(guard.start(B), true)
  assert.deepEqual(guard.list().sort(), [A, B].sort())
})

test('once a rebuild answers, that expansion can be rebuilt again', () => {
  const guard = createRebuildGuard()
  guard.start(A)
  guard.finish(A)
  assert.equal(guard.isPending(A), false)
  assert.equal(guard.start(A), true)
})

test('a response closes the dialog only if it still shows the same expansion', () => {
  assert.equal(closeIfShowing({url: A}, A), false)
  const other = {url: B}
  assert.equal(closeIfShowing(other, A), other)
  assert.equal(closeIfShowing(false, A), false)
  assert.equal(closeIfShowing(null, A), null)
})

test('a failed rebuild drops only that expansion\'s tracked state', () => {
  const state = {[A]: {state: 'processing'}, [B]: {state: 'processed'}}
  assert.deepEqual(withoutExpansionState(state, A), {[B]: {state: 'processed'}})
  assert.equal(withoutExpansionState(state, '/other/'), state)
  assert.deepEqual(state, {[A]: {state: 'processing'}, [B]: {state: 'processed'}})
})

test('the rebuild confirmation\'s Rebuild waits for its own notices lookup, and stays shut when they lock it', () => {
  assert.equal(canSendRebuild({rebuilding: false, pending: true, lock: null}), false)
  assert.equal(canSendRebuild({rebuilding: false, pending: false, lock: 'Example reason'}), false)
  assert.equal(canSendRebuild({rebuilding: true, pending: false, lock: null}), false)
  assert.equal(canSendRebuild({rebuilding: false, pending: false, lock: null}), true)
})
