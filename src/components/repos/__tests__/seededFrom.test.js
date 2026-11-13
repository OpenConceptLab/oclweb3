import test from 'node:test'
import assert from 'node:assert/strict'

const { getSeededFromLabel } = await import('../seededFrom.js')

const t = key => ({'repo.seeded_from_import': 'Import'})[key]

test('a version seeded from HEAD or another version shows that version', () => {
  assert.equal(getSeededFromLabel({type: 'repo_version', url: '/orgs/MyOrg/sources/MySource/HEAD/'}, t), 'HEAD')
  assert.equal(getSeededFromLabel({type: 'repo_version', url: '/orgs/MyOrg/sources/MySource/2.82/'}, t), '2.82')
})

test('a version seeded from an import shows Import', () => {
  assert.equal(getSeededFromLabel({type: 'import', task: 'task-id'}, t), 'Import')
  assert.equal(getSeededFromLabel({type: 'import', task: null}, t), 'Import')
})

test('no seed, or one this page does not know, shows nothing rather than raw JSON', () => {
  assert.equal(getSeededFromLabel(null, t), undefined)
  assert.equal(getSeededFromLabel({type: 'repo_version', url: null}, t), undefined)
  assert.equal(getSeededFromLabel({type: 'other'}, t), undefined)
})
