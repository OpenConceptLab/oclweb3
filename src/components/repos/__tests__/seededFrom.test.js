import test from 'node:test'
import assert from 'node:assert/strict'

const { getSeededFromLabel, getSeededFromAttribute } = await import('../seededFrom.js')

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

test('the details row shows the label, and is left out when there is none', () => {
  assert.deepEqual(
    getSeededFromAttribute({type: 'import', task: 'task-id'}, 'Seeded From', t), {label: 'Seeded From', value: 'Import'})
  assert.equal(getSeededFromAttribute({type: 'repo_version', url: null}, 'Seeded From', t), undefined)
  assert.equal(getSeededFromAttribute({type: 'other'}, 'Seeded From', t), undefined)
  assert.equal(getSeededFromAttribute(null, 'Seeded From', t), undefined)
})
