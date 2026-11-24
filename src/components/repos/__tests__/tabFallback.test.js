import test from 'node:test'
import assert from 'node:assert/strict'

const { parseRepoPath } = await import('../../../common/repoRoute.js')
const { getFallbackTab } = await import('../tabFallback.js')

const SOURCE = '/orgs/MyOrg/sources/MySource'
const HEAD_TABS = [{key: 'concepts'}, {key: 'mappings'}, {key: 'versions'}]
const VERIFIED_TABS = [...HEAD_TABS, {key: 'about'}]
const fallback = (path, repoPath, tabs, tab = 'about') => getFallbackTab({
  route: parseRepoPath(path),
  repoRoute: repoPath ? parseRepoPath(repoPath) : null,
  tabs,
  tab,
})

test('opening a release\'s About while HEAD is still loaded does not drop the tab', () => {
  assert.equal(fallback(`${SOURCE}/v1/about/`, `${SOURCE}/`, HEAD_TABS), null)
})

test('the same wait applies when the previous version is another release', () => {
  assert.equal(fallback(`${SOURCE}/v2/about/`, `${SOURCE}/v1/versions/`, HEAD_TABS), null)
})

test('a route opened directly waits for its first repo', () => {
  assert.equal(fallback(`${SOURCE}/v1/about/`, null, HEAD_TABS), null)
})

test('About stays once the release that has it has loaded', () => {
  assert.equal(fallback(`${SOURCE}/v1/about/`, `${SOURCE}/v1/about/`, VERIFIED_TABS), null)
})

test('About falls back to the first tab once the loaded version has nothing to show there', () => {
  assert.equal(fallback(`${SOURCE}/v1/about/`, `${SOURCE}/v1/about/`, HEAD_TABS), 'concepts')
})

test('a tab the repo has stays, and an empty tab list decides nothing', () => {
  assert.equal(fallback(`${SOURCE}/versions/`, `${SOURCE}/versions/`, HEAD_TABS, 'versions'), null)
  assert.equal(fallback(`${SOURCE}/about/`, `${SOURCE}/about/`, []), null)
})
