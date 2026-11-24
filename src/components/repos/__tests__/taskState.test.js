import test from 'node:test'
import assert from 'node:assert/strict'

const { isTaskFinished, watchTask } = await import('../taskState.js')

test('a task that succeeded or failed has finished', () => {
  ['SUCCESS', 'FAILURE', 'REVOKED', 'REJECTED', 'IGNORED', 'success'].forEach(state => assert.equal(isTaskFinished(state), true, state))
})

test('a task that is queued or running, or whose state is unknown, has not finished', () => {
  ['PENDING', 'RECEIVED', 'STARTED', 'RETRY', '', null, undefined].forEach(state => assert.equal(isTaskFinished(state), false, String(state)))
})

// Watches a task whose asks answer these states in turn, running each scheduled ask once the one before has answered
const watch = async states => {
  const ended = []
  const intervals = []
  const scheduled = []
  let asked = 0
  watchTask(
    () => Promise.resolve(states[asked++]),
    state => ended.push(state),
    {schedule: (next, interval) => {
      scheduled.push(next)
      intervals.push(interval)
    }},
  )
  for(;;) {
    await new Promise(resolve => setTimeout(resolve, 0))
    if(!scheduled.length)
      break
    scheduled.shift()()
  }
  return {asked, ended, intervals}
}

test('a watched task is asked about until it has finished, then reported once', async () => {
  assert.deepEqual(await watch(['PENDING', 'STARTED', 'SUCCESS']), {asked: 3, ended: ['SUCCESS'], intervals: [10000, 10000]})
  assert.deepEqual(await watch(['STARTED', 'FAILURE']), {asked: 2, ended: ['FAILURE'], intervals: [10000]})
})

test('a watched task is given up on after failed asks in a row, and never reported', async () => {
  // an answer in between starts the count again
  assert.deepEqual(await watch([null, 'STARTED', null, null, null, 'SUCCESS']), {asked: 5, ended: [], intervals: [10000, 10000, 10000, 10000]})
})
