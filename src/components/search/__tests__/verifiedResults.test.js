import test from 'node:test'
import assert from 'node:assert/strict'

const { getVerifiedFacetValues, getVerifiedVersion, getVerifiedReposURL, isVerifiedResult } = await import('../verifiedResults.js')

test('the Verification filter offers only Verified', () => {
  assert.deepEqual(getVerifiedFacetValues([['false', 18, false], ['true', 1, false]]), [['true', 1, false]])
  assert.deepEqual(getVerifiedFacetValues([['false', 19, false]]), [])
  assert.deepEqual(getVerifiedFacetValues(undefined), [])
})

test('a verified repository result names its latest released version and links to its Verification section', () => {
  assert.deepEqual(
    getVerifiedVersion({ url: '/orgs/WHO/sources/ICD-11-WHO/', latest_released_version: '2026-01', verified: true }),
    { version: '2026-01', to: '/orgs/WHO/sources/ICD-11-WHO/2026-01/about#verification' }
  )
  assert.equal(getVerifiedVersion({ url: '/orgs/WHO/sources/ATC/', latest_released_version: '2026', verified: 'true' }).to, '/orgs/WHO/sources/ATC/2026/about#verification')
})

test('no mark without the flag, or without a released version to name', () => {
  assert.equal(getVerifiedVersion({ url: '/orgs/WHO/sources/ICD-11-WHO/', latest_released_version: '2026-01' }), null)
  assert.equal(getVerifiedVersion({ url: '/orgs/WHO/sources/ICD-11-WHO/', latest_released_version: '2026-01', verified: false }), null)
  assert.equal(getVerifiedVersion({ url: '/orgs/WHO/sources/ICD-11-WHO/', latest_released_version: null, verified: true }), null)
})

test("the summary's verified count opens the Repositories tab with the Verified filter on", () => {
  const url = getVerifiedReposURL('/orgs/WHO/')
  assert.equal(url.split('?')[0], '/orgs/WHO/repos')
  assert.deepEqual(JSON.parse(new URLSearchParams(url.split('?')[1]).get('filters')), { verified: 'true' })
})

test('a verified result is one the API flags, for a repository or a concept', () => {
  assert.equal(isVerifiedResult({ verified: true }), true)
  assert.equal(isVerifiedResult({ verified: false }), false)
  assert.equal(isVerifiedResult({}), false)
})
