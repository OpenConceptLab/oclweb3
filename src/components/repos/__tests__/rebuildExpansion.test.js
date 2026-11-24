import test from 'node:test'
import assert from 'node:assert/strict'

const { getRebuildOutcome } = await import('../rebuildExpansion.js')

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
