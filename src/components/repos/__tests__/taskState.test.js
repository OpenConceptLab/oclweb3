import test from 'node:test'
import assert from 'node:assert/strict'

const { isTaskFinished } = await import('../taskState.js')

test('a task that succeeded or failed has finished', () => {
  ['SUCCESS', 'FAILURE', 'REVOKED', 'REJECTED', 'IGNORED', 'success'].forEach(state => assert.equal(isTaskFinished(state), true, state))
})

test('a task that is queued or running, or whose state is unknown, has not finished', () => {
  ['PENDING', 'RECEIVED', 'STARTED', 'RETRY', '', null, undefined].forEach(state => assert.equal(isTaskFinished(state), false, String(state)))
})
