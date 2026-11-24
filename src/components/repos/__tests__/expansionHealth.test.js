import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const i18next = (await import('i18next')).default
const {
  HEALTH_STATES, REASONS, UNKNOWN_REASON_KEY, FRESHNESS_KEYS, getExpansionHealthStatus, getFreshness,
  getHealthReasons, getHeadResolvedRepositories, getMemberClassCounts, getMultipleNamedVersions,
  getVersionHealthStatus,
} = await import('../expansionHealth.js')

// the shape core/collections/health.py stores for an expansion
const health = (state, extra = {}) => ({
  state,
  reasons: [],
  members: {
    concepts: {release: 3, head: 0, unreleased: 0, interim: 0, mismatch: 0, ambiguous: 0, unattributed: 0},
    mappings: {release: 1, head: 0, unreleased: 0, interim: 0, mismatch: 0, ambiguous: 0, unattributed: 0},
  },
  head_resolved_repositories: [],
  multiple_named_versions: [],
  rules_version: 1,
  computed_at: '2026-11-24T10:00:00+00:00',
  ...extra,
})

const EXPANSION_URL = '/orgs/O/collections/C/v1/expansions/autoexpand-v1/'

test('a current health shows its state', () => {
  for(const state of ['healthy', 'head_resolved', 'unhealthy', 'empty'])
    assert.deepEqual(
      getExpansionHealthStatus({health: health(state), health_is_current: true}), {state, freshness: 'current'})
})

test('health_is_current false is out of date with a recheck queued, null is out of date with nothing queued', () => {
  assert.equal(getFreshness(false), 'pending')
  assert.equal(getFreshness(null), 'not_current')
  assert.equal(getFreshness(undefined), 'not_current')
  assert.deepEqual(
    getExpansionHealthStatus({health: health('unhealthy'), health_is_current: false}),
    {state: 'unhealthy', freshness: 'pending'})
  assert.deepEqual(
    getExpansionHealthStatus({health: health('healthy'), health_is_current: null}),
    {state: 'healthy', freshness: 'not_current'})
})

test('never computed shows nothing, unless its first check is queued', () => {
  assert.equal(getExpansionHealthStatus({health: null, health_is_current: null}), null)
  assert.equal(getExpansionHealthStatus({}), null)
  assert.equal(getExpansionHealthStatus(null), null)
  assert.deepEqual(getExpansionHealthStatus({health: null, health_is_current: false}), {state: null, freshness: 'pending'})
})

test("a version shows its default expansion's health, and its own summary until expansions load", () => {
  const version = {expansion_url: EXPANSION_URL, expansion_health: {state: 'healthy', is_current: true}}
  assert.deepEqual(getVersionHealthStatus(version, null), {state: 'healthy', freshness: 'current'})
  assert.deepEqual(
    getVersionHealthStatus(version, {url: EXPANSION_URL, health: health('unhealthy'), health_is_current: false}),
    {state: 'unhealthy', freshness: 'pending'})
  // another expansion than the default never stands in for the version
  assert.deepEqual(
    getVersionHealthStatus(version, {url: EXPANSION_URL + 'other/', health: health('unhealthy'), health_is_current: true}),
    {state: 'healthy', freshness: 'current'})
  assert.equal(getVersionHealthStatus({expansion_url: EXPANSION_URL, expansion_health: null}, null), null)
  assert.deepEqual(
    getVersionHealthStatus({expansion_health: {state: 'empty', is_current: null}}, undefined),
    {state: 'empty', freshness: 'not_current'})
})

test('every reason the classifier gives is mapped, with its named URLs', () => {
  const reasons = getHealthReasons(health('unhealthy', {reasons: [
    {code: 'inconsistent_resolution', count: 1, repositories: ['/orgs/O/sources/A/']},
    {code: 'duplicate_repo_versions', count: 2, repositories: ['/orgs/O/sources/A/', '/orgs/O/sources/B/']},
    {code: 'locked_version_deleted', count: 3, versions: ['/orgs/O/sources/A/v1/']},
    {code: 'resource_versioned_references', count: 4},
    {code: 'unresolved_references', count: 1},
    {code: 'value_set_without_expansion', count: 1},
    {code: 'system_version_unresolved', count: 1},
    {code: 'unreleased_versions', count: 5},
    {code: 'interim_resource_versions', count: 6},
    {code: 'version_mismatches', count: 7, head_concept: 2, head_mapping: 1},
    {code: 'ambiguous_members', count: 1, head_concept: 0, head_mapping: 0},
    {code: 'unattributed_members', count: 1},
  ]}))
  assert.equal(reasons.length, Object.keys(REASONS).length)
  assert.ok(reasons.every(reason => reason.key !== UNKNOWN_REASON_KEY))
  assert.deepEqual(reasons[1].urls, ['/orgs/O/sources/A/', '/orgs/O/sources/B/'])
  const deleted = reasons.find(reason => reason.code === 'locked_version_deleted')
  assert.deepEqual(deleted.urls, ['/orgs/O/sources/A/v1/'])
  // another owner's private version is counted but not named
  assert.equal(deleted.hiddenCount, 2)
  const mismatches = reasons.find(reason => reason.code === 'version_mismatches')
  assert.equal(mismatches.headConcepts, 2)
  assert.equal(mismatches.headMappings, 1)
  assert.deepEqual(reasons.find(reason => reason.code === 'unreleased_versions').urls, [])
})

test('a reason this UI does not know yet still shows, with its code and count', () => {
  const [reason] = getHealthReasons({reasons: [{code: 'something_new', count: 2}, {count: 1}]})
  assert.equal(reason.key, UNKNOWN_REASON_KEY)
  assert.equal(reason.count, 2)
  assert.deepEqual(getHealthReasons(null), [])
})

test('member counts add concepts and mappings and drop empty classes', () => {
  assert.deepEqual(getMemberClassCounts(health('healthy')), {release: 4})
  assert.deepEqual(getMemberClassCounts(null), {})
  assert.deepEqual(getHeadResolvedRepositories(health('head_resolved', {head_resolved_repositories: ['/orgs/O/sources/A/']})), ['/orgs/O/sources/A/'])
  assert.deepEqual(getMultipleNamedVersions(null), [])
})

test('every health string is in each language, singular and plural', async () => {
  const keys = [
    ...Object.values(HEALTH_STATES).map(state => state.labelKey),
    ...Object.values(REASONS).map(([key]) => key),
    ...Object.values(FRESHNESS_KEYS),
    UNKNOWN_REASON_KEY,
    ...['title', 'view_details', 'state_checking', 'description_checking', 'checked_at', 'head_resolved_repositories',
      'multiple_named_versions', 'members', 'head_objects', 'hidden_versions'].map(key => `repo.expansion_health.${key}`),
    ...Object.keys(HEALTH_STATES).map(state => `repo.expansion_health.description_${state}`),
    ...['release', 'head', 'unreleased', 'interim', 'mismatch', 'ambiguous', 'unattributed'].map(
      memberClass => `repo.expansion_health.member_${memberClass}`),
  ]
  for(const locale of ['en', 'es', 'pt-BR', 'zh']) {
    const translation = JSON.parse(
      readFileSync(new URL(`../../../i18n/locales/${locale}/translations.json`, import.meta.url)).toString())
    const i18n = i18next.createInstance()
    await i18n.init({lng: locale, resources: {[locale]: {translation}}})
    for(const key of keys)
      for(const count of [1, 2]) {
        const text = i18n.t(key, {count, code: 'x', date: 'd', concepts: 1, mappings: 1})
        assert.notEqual(text, key, `${locale}: ${key} (${count})`)
        assert.ok(!text.includes('{{'), `${locale}: ${key} (${count}) left a placeholder`)
      }
  }
})
