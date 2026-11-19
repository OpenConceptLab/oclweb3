import test from 'node:test'
import assert from 'node:assert/strict'

const { getRoleLabel, getRoleOptions, withoutMembers } = await import('../orgRoles.js')

test('a role shows its translated label, and one the app doesn\'t know shows as the API sent it', () => {
  const t = key => `translated ${key}`
  assert.equal(getRoleLabel('admin', t), 'translated org.admin')
  assert.equal(getRoleLabel('member', t), 'translated org.member')
  assert.equal(getRoleLabel('owner', t), 'owner')
  assert.equal(getRoleLabel('constructor', t), 'constructor')
})

test('the role dropdown offers the roles the app knows', () => {
  assert.deepEqual(getRoleOptions('member'), ['member', 'admin'])
  assert.deepEqual(getRoleOptions('admin'), ['member', 'admin'])
  assert.deepEqual(getRoleOptions(undefined), ['member', 'admin'])
})

test('a member whose role the app doesn\'t know yet keeps it as an option', () => {
  assert.deepEqual(getRoleOptions('owner'), ['member', 'admin', 'owner'])
  assert.deepEqual(getRoleOptions('constructor'), ['member', 'admin', 'constructor'])
})

test('a user search offers only people who aren\'t members yet', () => {
  const members = [{username: 'first'}, {username: 'second'}]
  const users = [{username: 'second'}, {username: 'third'}, {username: 'fourth'}]
  assert.deepEqual(withoutMembers(users, members), [{username: 'third'}, {username: 'fourth'}])
  assert.deepEqual(withoutMembers(users, undefined), users)
  assert.deepEqual(withoutMembers(undefined, members), [])
})
