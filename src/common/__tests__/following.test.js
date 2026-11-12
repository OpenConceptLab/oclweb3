import test from 'node:test'
import assert from 'node:assert/strict'

const { getFollowedObjects, getFollowsWithObject } = await import('../following.js')

const org = {url: '/orgs/CIEL/', type: 'Organization'}
const following = [{id: 1, object: org}, {id: 2, object: null}, {id: 3}]

test('follows of objects the user can no longer view are skipped', () => {
  assert.deepEqual(getFollowedObjects(following), [org])
  assert.deepEqual(getFollowsWithObject(following), [{id: 1, object: org}])
})

test('no following list gives no follows', () => {
  assert.deepEqual(getFollowedObjects(undefined), [])
  assert.deepEqual(getFollowsWithObject(null), [])
})
