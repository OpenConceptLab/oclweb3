import test from 'node:test'
import assert from 'node:assert/strict'

const { getVersionChange } = await import('../versionChange.js')

const route = (version, tab = '') => ({ownerType: 'orgs', owner: 'MyOrg', repoType: 'sources', repo: 'MySource', version, expansion: '', tab, resource: ''})

test('exploring the current version from the versions tab only switches the tab', () => {
  assert.deepEqual(
    getVersionChange(route('v1', 'versions'), {id: 'v1'}, {tab: 'concepts'}),
    {version: 'v1', tab: 'concepts', reloads: false}
  )
})

test('picking another version reloads and keeps the current tab', () => {
  assert.deepEqual(
    getVersionChange(route('v1', 'mappings'), {version: 'v2'}),
    {version: 'v2', tab: 'mappings', reloads: true}
  )
})

test('a route without a tab lands on concepts', () => {
  assert.equal(getVersionChange(route('v1'), {id: 'v2'}).tab, 'concepts')
})

test('picking HEAD from a bare repo route names HEAD and reloads', () => {
  assert.deepEqual(
    getVersionChange(route('', 'versions'), {id: 'HEAD'}, {tab: 'concepts'}),
    {version: 'HEAD', tab: 'concepts', reloads: true}
  )
})

test('switching to HEAD without a reload drops the version from the route', () => {
  assert.deepEqual(
    getVersionChange(route('', 'concepts'), {version: 'HEAD'}, {reload: false}),
    {version: '', tab: 'concepts', reloads: false}
  )
})
