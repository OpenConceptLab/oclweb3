// Whether a task's state, as the API reports it, has ended, whether it succeeded or not.
const FINISHED_STATES = ['SUCCESS', 'FAILURE', 'REVOKED', 'REJECTED', 'IGNORED']

export const isTaskFinished = state => FINISHED_STATES.includes(String(state || '').toUpperCase())

const INTERVAL = 10000
const MAX_FAILURES = 3

// Asks about a task every INTERVAL ms until it has finished, then calls onEnd once with its state. ask() resolves to the
// task's state, or to null when the request failed; after MAX_FAILURES failures in a row it stops asking, and onEnd
// isn't called.
export const watchTask = (ask, onEnd, { schedule = setTimeout } = {}) => {
  let failures = 0
  const next = () => ask().then(state => {
    if(state === null || state === undefined) {
      failures += 1
      if(failures >= MAX_FAILURES)
        return
    } else {
      failures = 0
      if(isTaskFinished(state)) {
        onEnd(state)
        return
      }
    }
    schedule(next, INTERVAL)
  })
  next()
}
