// Whether a task's state, as the API reports it, has ended, whether it succeeded or not.
const FINISHED_STATES = ['SUCCESS', 'FAILURE', 'REVOKED', 'REJECTED', 'IGNORED']

export const isTaskFinished = state => FINISHED_STATES.includes(String(state || '').toUpperCase())
