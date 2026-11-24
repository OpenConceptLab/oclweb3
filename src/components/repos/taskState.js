// Whether a task's state, as the API reports it, has ended, whether it succeeded or not.
const FINISHED_STATES = ['SUCCESS', 'FAILURE', 'REVOKED', 'REJECTED', 'IGNORED']

export const isTaskFinished = state => FINISHED_STATES.includes(String(state || '').toUpperCase())

// Asks about a task until it has finished, then calls onEnd once with its state. ask() resolves to the task's state, or
// to null when the request failed; after maxFailures failures in a row it stops asking, and onEnd isn't called.
export const watchTask = (ask, onEnd, { interval = 10000, maxFailures = 3, schedule = setTimeout } = {}) => {
  let failures = 0
  const next = () => ask().then(state => {
    if(state === null || state === undefined) {
      failures += 1
      if(failures >= maxFailures)
        return
    } else {
      failures = 0
      if(isTaskFinished(state)) {
        onEnd(state)
        return
      }
    }
    schedule(next, interval)
  })
  next()
}
