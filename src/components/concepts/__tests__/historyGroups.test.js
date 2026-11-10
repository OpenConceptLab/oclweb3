import test from 'node:test'
import assert from 'node:assert/strict'

import { groupVersionsByRepoVersion, isHead, toRepoVersion } from '../historyGroups.js'

const SOURCE = '/orgs/MyOrg/sources/MySource/'

const repoVersion = (version, createdAt) => ({
  id: version, version, short_code: 'MySource', type: 'Source Version', version_url: `${SOURCE}${version}/`, created_at: createdAt
})
const HEAD = {id: 'HEAD', version: 'HEAD', short_code: 'MySource', type: 'Source Version', version_url: SOURCE, created_at: '2021-03-29T00:00:00Z'}

// newest first, HEAD last, as the API lists them
const ALL = [
  repoVersion('v4', '2026-10-23T00:00:00Z'),
  repoVersion('v3', '2026-09-24T00:00:00Z'),
  repoVersion('v2', '2026-08-24T00:00:00Z'),
  repoVersion('v1', '2026-07-20T00:00:00Z'),
  HEAD
]

const version = (id, createdOn, sourceVersions = [], isLatest = false) => ({
  uuid: id,
  version_url: `${SOURCE}concepts/C1/${id}/`,
  version_created_on: createdOn,
  is_latest_version: isLatest,
  source_versions: sourceVersions.map(v => `${SOURCE}${v}/`)
})

const summary = groups => groups.map(group => [group.version, group.resourceVersions.map(v => v.uuid)])

test('versions only in HEAD are listed under HEAD, not under the last repo version of a page', () => {
  const versions = [
    version('3', '2026-11-07T18:00:00Z', [], true),
    version('2', '2026-11-07T00:00:00Z'),
    version('1', '2026-10-29T00:00:00Z')
  ]
  const firstPage = ALL.slice(0, 2)
  assert.deepEqual(summary(groupVersionsByRepoVersion(versions, firstPage)), [['HEAD', ['3', '2', '1']]])
  assert.deepEqual(summary(groupVersionsByRepoVersion(versions, ALL)), [['HEAD', ['3', '2', '1']]])
})

test('a version goes under the newest repo version that contains it', () => {
  const versions = [
    version('2', '2026-09-01T00:00:00Z', ['v3', 'v4'], true),
    version('1', '2026-07-01T00:00:00Z', ['v1', 'v2'])
  ]
  assert.deepEqual(summary(groupVersionsByRepoVersion(versions, ALL)), [['v4', ['2']], ['v2', ['1']]])
})

test('an earlier version no repo version contains goes under the first repo version created after it', () => {
  const versions = [
    version('3', '2026-11-01T00:00:00Z', [], true),
    version('2', '2026-09-01T00:00:00Z', ['v3', 'v4']),
    version('1', '2026-08-30T00:00:00Z')
  ]
  assert.deepEqual(summary(groupVersionsByRepoVersion(versions, ALL)), [['HEAD', ['3']], ['v4', ['2']], ['v3', ['1']]])
})

test('repo versions with nothing under them are left out, and none is listed twice', () => {
  const versions = [version('1', '2026-08-01T00:00:00Z', ['v2', 'v3', 'v4'], true)]
  const groups = groupVersionsByRepoVersion(versions, ALL)
  assert.deepEqual(summary(groups), [['v4', ['1']]])
  assert.equal(groups[0].created_at, '2026-10-23T00:00:00Z')
})

test('a list of another repo, such as the collection being viewed, is not used', () => {
  const collectionVersions = [
    {id: 'v1', version: 'v1', type: 'Collection Version', version_url: '/orgs/MyOrg/collections/MyCollection/v1/', created_at: '2026-11-08T00:00:00Z'},
    {id: 'HEAD', version: 'HEAD', type: 'Collection Version', version_url: '/orgs/MyOrg/collections/MyCollection/', created_at: '2026-01-01T00:00:00Z'}
  ]
  const groups = groupVersionsByRepoVersion([version('1', '2026-11-01T00:00:00Z', [], true)], collectionVersions)
  assert.deepEqual(summary(groups), [['HEAD', ['1']]])
  assert.equal(groups[0].version_url, SOURCE)
  assert.equal(groups[0].type, 'Source Version')
})

test('a repo version missing from the list still gets its group, placed by its versions\' dates', () => {
  const versions = [
    version('2', '2026-10-01T00:00:00Z', ['v4'], true),
    version('1', '2025-01-01T00:00:00Z', ['v0'])
  ]
  const groups = groupVersionsByRepoVersion(versions, ALL)
  assert.deepEqual(summary(groups), [['v4', ['2']], ['v0', ['1']]])
  assert.equal(groups[1].version_url, `${SOURCE}v0/`)
})

test('with no repo version list at all, everything still has a place', () => {
  const versions = [version('2', '2026-11-01T00:00:00Z', [], true), version('1', '2026-07-01T00:00:00Z', ['v1'])]
  assert.deepEqual(summary(groupVersionsByRepoVersion(versions, [])), [['HEAD', ['2']], ['v1', ['1']]])
  assert.deepEqual(groupVersionsByRepoVersion([], ALL), [])
})

test('HEAD is found by its id, and a repo version URL reads back as a repo version', () => {
  assert.equal(isHead(HEAD), true)
  assert.equal(isHead(ALL[0]), false)
  assert.deepEqual(toRepoVersion('/orgs/CIEL/sources/CIEL/v2026-10-23/'), {
    ownerType: 'orgs', owner: 'CIEL', type: 'Source Version', id: 'CIEL', version: 'v2026-10-23',
    uri: '/orgs/CIEL/sources/CIEL/v2026-10-23/', version_url: '/orgs/CIEL/sources/CIEL/v2026-10-23/'
  })
})
