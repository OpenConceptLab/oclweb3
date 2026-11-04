import test from 'node:test'
import assert from 'node:assert/strict'

const { parseRepoPath } = await import('../../../common/repoRoute.js')
const { isPanelReady } = await import('../panelReady.js')

const SOURCE = '/orgs/MyOrg/sources/MySource'
const COLLECTION = '/orgs/MyOrg/collections/MyCollection'
const isReady = (path, repoPath, overrides = {}) => isPanelReady({
  route: parseRepoPath(path),
  repoRoute: repoPath ? parseRepoPath(repoPath) : null,
  ...overrides,
})

test('Back to a panel URL with no version waits while the repo in state is the version just left', () => {
  assert.equal(isReady(`${SOURCE}/concepts/123/`, `${SOURCE}/v1/concepts`), false)
})

test('Back or Forward to another version waits while the repo in state is the version just left', () => {
  assert.equal(isReady(`${SOURCE}/v1/concepts/123/`, `${SOURCE}/v2/concepts`), false)
})

test('the panel opens once the repo for the route\'s version has loaded', () => {
  assert.equal(isReady(`${SOURCE}/concepts/123/`, `${SOURCE}/concepts/123/`), true)
  assert.equal(isReady(`${SOURCE}/v1/concepts/123/`, `${SOURCE}/v1/concepts/123/`), true)
})

test('a panel URL opened directly waits for its first repo', () => {
  assert.equal(isReady(`${SOURCE}/v1/concepts/123/`, null), false)
})

test('HEAD named in the URL and a URL with no version each wait for their own load', () => {
  assert.equal(isReady(`${SOURCE}/HEAD/concepts/123/`, `${SOURCE}/concepts/123/`), false)
  assert.equal(isReady(`${SOURCE}/concepts/123/`, `${SOURCE}/HEAD/concepts/123/`), false)
})

test('moving within the version keeps an open panel: another resource, tab or expansion', () => {
  assert.equal(isReady(`${SOURCE}/v1/mappings/456/`, `${SOURCE}/v1/concepts`), true)
  assert.equal(isReady(`${COLLECTION}/v1/expansions/e2/concepts/123/`, `${COLLECTION}/v1/expansions/e1/concepts/123/`, {expansionRequired: true, expansionURL: `${COLLECTION}/v1/expansions/e2/`}), true)
})

test('a route still working out its version waits', () => {
  assert.equal(isReady(`${SOURCE}/concepts/123/`, `${SOURCE}/concepts/123/`, {versionPending: true}), false)
})

test('a collection\'s concept or mapping panel also waits for its expansion', () => {
  const path = `${COLLECTION}/v1/concepts/123/`
  assert.equal(isReady(path, path, {expansionRequired: true}), false)
  assert.equal(isReady(path, path, {expansionRequired: true, expansionURL: `${COLLECTION}/v1/expansions/e1/`}), true)
})
