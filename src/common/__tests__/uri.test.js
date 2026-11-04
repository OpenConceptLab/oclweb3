import test from 'node:test'
import assert from 'node:assert/strict'

const { dropVersion, toRepoVersionURI } = await import('../uri.js')

// As the API returns them
const SOURCE_V1 = {type: 'Source Version', version: 'v1', url: '/orgs/MyOrg/sources/MySource/', version_url: '/orgs/MyOrg/sources/MySource/v1/'}
const SOURCE_HEAD = {type: 'Source', version: 'HEAD', url: '/orgs/MyOrg/sources/MySource/'}
const COLLECTION_V1 = {type: 'Collection Version', version: 'v1', url: '/orgs/MyOrg/collections/MyColl/', version_url: '/orgs/MyOrg/collections/MyColl/v1/'}

test('a version id that repeats an earlier segment drops only the version', () => {
  assert.equal(dropVersion('/orgs/Arogya/collections/ciel/ciel/'), '/orgs/Arogya/collections/ciel/') // eslint-disable-line spellcheck/spell-checker
})

test('versioned repo, concept and mapping URIs drop their version', () => {
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/v2026-09-24/'), '/orgs/CIEL/sources/CIEL/')
  assert.equal(dropVersion('/users/tester/collections/C1/v1/'), '/users/tester/collections/C1/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/concepts/123/456/'), '/orgs/CIEL/sources/CIEL/concepts/123/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/mappings/789/1011/'), '/orgs/CIEL/sources/CIEL/mappings/789/')
})

test('unversioned URIs come back as they are', () => {
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/'), '/orgs/CIEL/sources/CIEL/')
  assert.equal(dropVersion('/orgs/CIEL/sources/CIEL/concepts/123/'), '/orgs/CIEL/sources/CIEL/concepts/123/')
  assert.equal(dropVersion('/orgs/CIEL/'), '/orgs/CIEL/')
  assert.equal(dropVersion(''), '')
  assert.equal(dropVersion(undefined), undefined)
})

test('a concept or mapping of the source being browsed gets that source version', () => {
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/concepts/A/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v1/concepts/A/')
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/mappings/M1/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v1/mappings/M1/')
  assert.equal(
    toRepoVersionURI('/users/me/sources/S1/concepts/A/', {version: '2.0', version_url: '/users/me/sources/S1/2.0/'}),
    '/users/me/sources/S1/2.0/concepts/A/'
  )
})

test('the source version replaces a concept version, whatever the ids repeat', () => {
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/concepts/A/123/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v1/concepts/A/')
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/concepts/v1/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v1/concepts/v1/')
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/concepts/a%2Fb/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v1/concepts/a%2Fb/')
})

test('on HEAD or with no repo the URI stays version-less', () => {
  const uri = '/orgs/MyOrg/sources/MySource/concepts/A/'
  assert.equal(toRepoVersionURI(uri, SOURCE_HEAD), uri)
  assert.equal(toRepoVersionURI(uri, {...SOURCE_HEAD, version_url: '/orgs/MyOrg/sources/MySource/HEAD/'}), uri)
  assert.equal(toRepoVersionURI(uri, undefined), uri)
  assert.equal(toRepoVersionURI(uri, false), uri)
  assert.equal(toRepoVersionURI(uri, {}), uri)
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/concepts/A/123/', undefined), uri)
})

test("a repo that isn't the resource's own source lends it no version", () => {
  const uri = '/orgs/MyOrg/sources/MySource/concepts/A/'
  assert.equal(toRepoVersionURI(uri, COLLECTION_V1), uri)
  assert.equal(toRepoVersionURI(uri, {version: 'v1', version_url: '/orgs/MyOrg/sources/MySource2/v1/'}), uri)
  assert.equal(toRepoVersionURI(uri, {version: 'v1', version_url: '/orgs/Other/sources/MySource/v1/'}), uri)
})

test('a URI that already names a repo version keeps it', () => {
  assert.equal(toRepoVersionURI('/orgs/MyOrg/sources/MySource/v2/concepts/A/', SOURCE_V1), '/orgs/MyOrg/sources/MySource/v2/concepts/A/')
})

test('a missing URI stays missing', () => {
  assert.equal(toRepoVersionURI(undefined, SOURCE_V1), undefined)
  assert.equal(toRepoVersionURI('', SOURCE_V1), '')
})
