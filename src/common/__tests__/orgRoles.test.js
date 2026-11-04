import test from 'node:test'
import assert from 'node:assert/strict'

const { canAdministerOrg, getMemberChanges } = await import('../orgRoles.js')

test('staff and the org\'s admins administer it', () => {
  assert.equal(canAdministerOrg({username: 'a'}, {user_role: 'admin'}), true)
  assert.equal(canAdministerOrg({username: 'ops', is_staff: true}, {user_role: null}), true)
  assert.equal(canAdministerOrg({username: 'root', is_superuser: true}, {}), true)
})

test('a plain member, an outsider and nobody signed in do not', () => {
  assert.equal(canAdministerOrg({username: 'm'}, {user_role: 'member'}), false)
  assert.equal(canAdministerOrg({username: 'o'}, {user_role: null}), false)
  assert.equal(canAdministerOrg(null, {user_role: null}), false)
  assert.equal(canAdministerOrg({username: 'a'}, undefined), false)
})

const first = {username: 'first', role: 'admin'}
const second = {username: 'second', role: 'member'}
const third = {username: 'third'} // from a user search, so no role yet

const change = (member, action, role) => ({member, action, role})

test('nothing to send when nothing changed', () => {
  assert.deepEqual(getMemberChanges([first, second], [first, second], {}), [[], []])
  assert.deepEqual(getMemberChanges([first, second], [first, second], {first: 'admin', second: 'member'}), [[], []])
})

test('a member the API sends no role for is not a change', () => {
  const noRole = {username: 'second'}
  assert.deepEqual(getMemberChanges([noRole], [noRole], {}), [[], []])
})

test('a new member is added as a plain member unless picked as an admin', () => {
  assert.deepEqual(getMemberChanges([first], [first, third], {}), [[change(third, 'add', 'member')], []])
  assert.deepEqual(getMemberChanges([first], [first, third], {third: 'admin'}), [[change(third, 'add', 'admin')], []])
})

test('a removed member is removed, whatever role was picked for them', () => {
  assert.deepEqual(getMemberChanges([first, second], [first], {second: 'admin'}), [[], [change(second, 'remove', undefined)]])
})

test('a promotion and a demotion are role changes', () => {
  assert.deepEqual(getMemberChanges([first, second], [first, second], {second: 'admin'}), [[change(second, 'role', 'admin')], []])
  assert.deepEqual(getMemberChanges([first, second], [first, second], {first: 'member'}), [[], [change(first, 'role', 'member')]])
})

test('what gives rights is sent before what takes them away, so that an org keeps an admin', () => {
  const [grants, revocations] = getMemberChanges([first, second], [second, third], {second: 'admin', third: 'admin'})

  assert.deepEqual(grants, [change(second, 'role', 'admin'), change(third, 'add', 'admin')])
  assert.deepEqual(revocations, [change(first, 'remove', undefined)])
})
