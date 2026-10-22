import test from 'node:test'
import assert from 'node:assert/strict'

const { getRepoPinOwner, getRepoPinTarget, canUserPinFor } = await import('../pins.js')

const member = {username: 'tester', subscribed_orgs: [{id: 'CIEL'}]}

test('getRepoPinOwner maps the repo owner to a pin owner', () => {
  assert.deepEqual(getRepoPinOwner({owner: 'CIEL', owner_type: 'Organization'}), {type: 'org', id: 'CIEL'})
  assert.deepEqual(getRepoPinOwner({owner: 'tester', owner_type: 'User'}), {type: 'user', id: 'tester'})
  assert.equal(getRepoPinOwner({}), false)
  assert.equal(getRepoPinOwner(undefined), false)
})

test('getRepoPinTarget pins the repo, also from one of its versions', () => {
  const url = '/orgs/CIEL/sources/CIEL/'
  assert.deepEqual(getRepoPinTarget({url, type: 'Source', version: 'HEAD', uuid: '42'}), {url, type: 'Source', uuid: '42'})
  assert.deepEqual(getRepoPinTarget({url, type: 'Source Version', version: 'v2026-09-24', uuid: '8358'}), {url, type: 'Source', uuid: undefined})
  assert.deepEqual(getRepoPinTarget({url, type: 'Collection Version', version: 'v1', uuid: '9'}), {url, type: 'Collection', uuid: undefined})
})

test('org members can pin for their org only', () => {
  assert.equal(canUserPinFor(member, {type: 'org', id: 'CIEL'}), true)
  assert.equal(canUserPinFor(member, {type: 'org', id: 'WHO'}), false)
})

test('users can pin for themselves only', () => {
  assert.equal(canUserPinFor(member, {type: 'user', id: 'tester'}), true)
  assert.equal(canUserPinFor(member, {type: 'user', id: 'bob'}), false)
  assert.equal(canUserPinFor({username: 'CIEL'}, {type: 'org', id: 'CIEL'}), false)
})

test('staff can pin for any owner', () => {
  assert.equal(canUserPinFor({username: 'ops', is_staff: true}, {type: 'org', id: 'WHO'}), true)
  assert.equal(canUserPinFor({username: 'root', is_superuser: true}, {type: 'user', id: 'bob'}), true)
})

test('nobody pins without a signed-in user or an owner', () => {
  assert.equal(canUserPinFor(null, {type: 'org', id: 'CIEL'}), false)
  assert.equal(canUserPinFor({is_staff: true}, {type: 'org', id: 'CIEL'}), false)
  assert.equal(canUserPinFor(member, false), false)
})
