import test from 'node:test'
import assert from 'node:assert/strict'

const { getMemberRole, getMemberChanges } = await import('../orgRoles.js')

const first = {username: 'first', role: 'admin'}
const second = {username: 'second', role: 'member'}
const third = {username: 'third'} // from a user search, so no role yet

const picked = (member, role) => ({...member, role})
const change = (member, action, role) => ({member, action, role})

test('an existing admin selected again from a user search stays an admin', () => {
  const fromSearch = {username: 'first'}

  assert.equal(getMemberRole(fromSearch, [first]), 'admin')
  assert.deepEqual(getMemberChanges([first], [fromSearch]), [[], [], []])
})

test('nothing to send when nothing changed', () => {
  assert.deepEqual(getMemberChanges([first, second], [first, second]), [[], [], []])
})

test('a member the API sends no role for is not a change', () => {
  const noRole = {username: 'second'}
  assert.deepEqual(getMemberChanges([noRole], [noRole]), [[], [], []])
})

test('a new member is added as a plain member unless picked as an admin', () => {
  assert.deepEqual(getMemberChanges([first], [first, third]), [[change(third, 'add', 'member')], [], []])
  const admin = picked(third, 'admin')
  assert.deepEqual(getMemberChanges([first], [first, admin]), [[change(admin, 'add', 'admin')], [], []])
})

test('a member no longer selected is removed', () => {
  assert.deepEqual(getMemberChanges([first, second], [first]), [[], [change(second, 'remove', undefined)], []])
})

test('a promotion and a demotion are role changes', () => {
  const promoted = picked(second, 'admin')
  assert.deepEqual(getMemberChanges([first, second], [first, promoted]), [[change(promoted, 'role', 'admin')], [], []])
  const demoted = picked(first, 'member')
  assert.deepEqual(getMemberChanges([first, second], [demoted, second]), [[], [change(demoted, 'role', 'member')], []])
})

test('what gives rights goes before what takes them away, so that an org keeps an admin', () => {
  const promoted = picked(second, 'admin')
  const added = picked(third, 'admin')
  const [grants, revocations] = getMemberChanges([first, second], [promoted, added])

  assert.deepEqual(grants, [change(promoted, 'role', 'admin'), change(added, 'add', 'admin')])
  assert.deepEqual(revocations, [change(first, 'remove', undefined)])
})

test('the requester\'s own demotion or removal goes last, as it can take away their right to send the rest', () => {
  const demoted = picked(first, 'member')
  assert.deepEqual(
    getMemberChanges([first, second], [demoted], 'first'),
    [[], [change(second, 'remove', undefined)], [change(demoted, 'role', 'member')]]
  )
  assert.deepEqual(
    getMemberChanges([first, second], [second], 'first'),
    [[], [], [change(first, 'remove', undefined)]]
  )
})
