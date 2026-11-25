import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const i18next = (await import('i18next')).default
const {
  UPDATE_CASES, getReleaseUpdates, getDeletedLocks, isReleasedCollectionVersion, getComparableExpansion,
  getCompareExpansionsURL, pickExpansion,
} = await import('../releaseUpdates.js')

const SOURCE_HEAD = '/orgs/O/sources/S/'
const SOURCE_V1 = '/orgs/O/sources/S/v1/'
const SOURCE_V2 = '/orgs/O/sources/S/v2/'
const OTHER_V1 = '/orgs/O/sources/T/v1/'
const OTHER_V3 = '/orgs/O/sources/T/v3/'
const VALUE_SET_V1 = '/orgs/O/collections/VS/v1/'
const VALUE_SET_V2 = '/orgs/O/collections/VS/v2/'

// a verbose expansion lists the repo versions it recorded, with each one's version, released and retired flags
const expansion = {
  url: '/orgs/O/collections/C/HEAD/expansions/e1/',
  created_on: '2026-11-01T00:00:00Z',
  explicit_source_versions: [{version_url: OTHER_V1, version: 'v1', released: true, retired: false}],
  evaluated_source_versions: [
    {version_url: SOURCE_HEAD, version: 'HEAD', released: false, retired: false},
    {version_url: SOURCE_V1, version: 'v1', released: true, retired: false},
  ],
  evaluated_collection_versions: [{version_url: VALUE_SET_V1, version: 'v1', released: true, retired: true}],
}

test('each update says whether the lock is on HEAD, on a retired release, or a newer release exists', () => {
  const updates = getReleaseUpdates(expansion, {
    [SOURCE_V1]: SOURCE_V2, [SOURCE_HEAD]: SOURCE_V2, [VALUE_SET_V1]: VALUE_SET_V2,
  })
  assert.deepEqual(updates, [
    {oldURL: SOURCE_HEAD, newURL: SOURCE_V2, case: 'head'},
    {oldURL: VALUE_SET_V1, newURL: VALUE_SET_V2, case: 'retired'},
    {oldURL: SOURCE_V1, newURL: SOURCE_V2, case: 'newer'},
  ])
})

test("an unreleased version isn't called out as having a newer release", () => {
  // the API maps it to the newest unretired release, which can be older, or to HEAD when there is none
  const unreleased = {evaluated_source_versions: [
    {version_url: '/orgs/O/sources/S/v3/', version: 'v3', released: false, retired: false},
    {version_url: '/orgs/O/sources/U/v1/', version: 'v1', released: false, retired: false},
  ]}
  const updates = getReleaseUpdates(unreleased, {'/orgs/O/sources/S/v3/': SOURCE_V2, '/orgs/O/sources/U/v1/': '/orgs/O/sources/U/'})
  assert.deepEqual(updates.map(update => update.case), ['unreleased', 'unreleased'])
  // a retired version that was never released isn't called a retired release
  const neverReleased = {evaluated_source_versions: [{version_url: SOURCE_V1, version: 'v1', released: false, retired: true}]}
  assert.equal(getReleaseUpdates(neverReleased, {[SOURCE_V1]: SOURCE_V2})[0].case, 'unreleased')
  // a retired release with no other release left still says it is retired
  const retired = {evaluated_source_versions: [{version_url: SOURCE_V1, version: 'v1', released: true, retired: true}]}
  assert.equal(getReleaseUpdates(retired, {[SOURCE_V1]: SOURCE_HEAD})[0].case, 'retired')
})

test('every update the API lists is offered, whatever the expansion records', () => {
  const recorded = {
    ...expansion,
    built_with: 'lock',
    parameters: {'system-version': '/orgs/O/sources/S/|v1'},
  }
  const updates = getReleaseUpdates(recorded, {[OTHER_V1]: OTHER_V3, [SOURCE_V1]: SOURCE_V2, [VALUE_SET_V1]: VALUE_SET_V2})
  assert.deepEqual(updates, [
    {oldURL: VALUE_SET_V1, newURL: VALUE_SET_V2, case: 'retired'},
    {oldURL: OTHER_V1, newURL: OTHER_V3, case: 'newer'},
    {oldURL: SOURCE_V1, newURL: SOURCE_V2, case: 'newer'},
  ])
  const retiredReference = {...expansion, explicit_source_versions: [{version_url: OTHER_V1, version: 'v1', released: true, retired: true}]}
  assert.deepEqual(getReleaseUpdates(retiredReference, {[OTHER_V1]: OTHER_V3}), [{oldURL: OTHER_V1, newURL: OTHER_V3, case: 'retired'}])
  const both = {...expansion, evaluated_source_versions: [{version_url: OTHER_V1, version: 'v1', released: false}]}
  assert.equal(getReleaseUpdates(both, {[OTHER_V1]: OTHER_V3})[0].case, 'unreleased')
})

test("a version the expansion doesn't list is judged by its URL", () => {
  assert.deepEqual(getReleaseUpdates({}, {[SOURCE_HEAD]: SOURCE_V2, [SOURCE_V1]: SOURCE_V2}).map(update => update.case), ['head', 'newer'])
  assert.deepEqual(getReleaseUpdates({}, {'/orgs/O/sources/S/HEAD/': SOURCE_V2})[0].case, 'head')
  assert.deepEqual(getReleaseUpdates({}, {[SOURCE_V1]: SOURCE_HEAD})[0].case, 'unreleased')
  assert.deepEqual(getReleaseUpdates(expansion, null), [])
  assert.deepEqual(getReleaseUpdates(expansion, {}), [])
})

test("deleted locks come from the default expansion's stored health, counted and named as the API gives them", () => {
  const health = {state: 'unhealthy', reasons: [
    {code: 'unresolved_references', count: 1},
    {code: 'locked_version_deleted', count: 2, versions: [SOURCE_V1]},
  ]}
  assert.deepEqual(getDeletedLocks({health, default: true, health_is_current: true}), {count: 2, urls: [SOURCE_V1], hiddenCount: 1})
  // another expansion's health is stale, and so is one not checked since its last change, e.g. a rebuild
  assert.equal(getDeletedLocks({health, default: false, health_is_current: true}), null)
  assert.equal(getDeletedLocks({health, default: true, health_is_current: false}), null)
  assert.equal(getDeletedLocks({health, default: true, health_is_current: null}), null)
  assert.equal(getDeletedLocks({health: {state: 'healthy', reasons: []}, default: true, health_is_current: true}), null)
  assert.equal(getDeletedLocks({health: null, default: true, health_is_current: true}), null)
  assert.equal(getDeletedLocks(null), null)
})

test('only a released version other than HEAD gets the fixed-version nudge', () => {
  assert.equal(isReleasedCollectionVersion({version: 'v1', id: 'v1', released: true}), true)
  assert.equal(isReleasedCollectionVersion({version: 'v1', id: 'v1', released: false}), false)
  assert.equal(isReleasedCollectionVersion({version: 'HEAD', id: 'HEAD', released: true}), false)
  assert.equal(isReleasedCollectionVersion(null), false)
})

test('the comparison offered is with the newest other expansion made since this one', () => {
  const older = {url: 'old/', created_on: '2026-10-01T00:00:00Z'}
  const similar = {url: 'similar/', mnemonic: 'similar', created_on: '2026-11-02T00:00:00Z'}
  const newest = {url: 'newest/', mnemonic: 'newest', created_on: '2026-11-03T00:00:00Z'}
  assert.equal(getComparableExpansion(expansion, [expansion, older, similar, newest]), newest)
  assert.equal(getComparableExpansion(expansion, [expansion, older]), null)
  // one still being built has nothing to compare yet
  assert.equal(getComparableExpansion(expansion, [expansion, similar, {...newest, is_processing: true}]), similar)
  assert.equal(getComparableExpansion(expansion, []), null)
})

test('the compare link opens one version with both expansions picked', () => {
  const url = getCompareExpansionsURL('/orgs/O/collections/C/v1/', {url: 'a/'}, {url: 'b/'})
  const [path, query] = url.split('?')
  assert.equal(path, '/orgs/O/collections/C/compare-versions')
  const params = new URLSearchParams(query)
  assert.equal(params.get('version1'), '/orgs/O/collections/C/v1/')
  assert.equal(params.get('version2'), '/orgs/O/collections/C/v1/')
  assert.equal(params.get('expansion1'), 'a/')
  assert.equal(params.get('expansion2'), 'b/')
  // the expansion comparison, not the version's summary, which is the same on both sides
  assert.equal(params.get('metric'), 'content')
  // HEAD's URL has no version segment
  assert.ok(getCompareExpansionsURL('/orgs/O/collections/C/', {url: 'a/'}, {url: 'b/'}).startsWith('/orgs/O/collections/C/compare-versions?'))
  assert.equal(getCompareExpansionsURL('/orgs/O/collections/C/v1/', {url: 'a/'}, null), null)
})

test("the compare page picks each side's expansion from the URL, then the version's default", () => {
  const list = [{url: 'a/'}, {url: 'b/'}, {url: 'default/'}]
  assert.equal(pickExpansion(list, ['a/', 'b/'], 'default/'), list[0])
  assert.equal(pickExpansion(list, ['b/', 'a/'], 'default/'), list[1])
  assert.equal(pickExpansion(list, ['missing/', 'b/'], 'default/'), list[1])
  assert.equal(pickExpansion(list, [null, null], 'default/'), list[2])
  assert.equal(pickExpansion(list, [], 'missing/'), false)
  assert.equal(pickExpansion(null, ['a/'], 'default/'), false)
})

test('every rebuild-offer string is in each language', async () => {
  const keys = [
    ...Object.values(UPDATE_CASES),
    ...['lock_stays', 'compare_first', 'released_nudge', 'compare_with'].map(key => `repo.release_updates.${key}`),
  ]
  for(const locale of ['en', 'es', 'pt-BR', 'zh']) {
    const translation = JSON.parse(
      readFileSync(new URL(`../../../i18n/locales/${locale}/translations.json`, import.meta.url)).toString())
    const i18n = i18next.createInstance()
    await i18n.init({lng: locale, resources: {[locale]: {translation}}})
    for(const key of keys) {
      const text = i18n.t(key, {mnemonic: 'm'})
      assert.notEqual(text, key, `${locale}: ${key}`)
      assert.ok(!text.includes('{{'), `${locale}: ${key} left a placeholder`)
    }
  }
})
