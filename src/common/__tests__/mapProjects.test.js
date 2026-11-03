import test from 'node:test'
import assert from 'node:assert/strict'

const { projectCount, canSeeMapProjects, fetchProjectsPage } = await import('../mapProjects.js')

test('projectCount sums num_found across user and organization lists', () => {
  assert.equal(projectCount({headers: {num_found: '4'}}, {headers: {num_found: '3'}}), 7)
  assert.equal(projectCount({headers: {}}, undefined), 0)
})

test('canSeeMapProjects shows a user their own projects, not anyone else\'s', () => {
  const member = {username: 'member', subscribed_orgs: [{id: 'CIEL'}]}
  assert.equal(canSeeMapProjects(member, 'users', 'member'), true)
  assert.equal(canSeeMapProjects(member, 'users', 'stranger'), false)
})

test('canSeeMapProjects shows an organization\'s projects to its members only', () => {
  const member = {username: 'member', subscribed_orgs: [{id: 'CIEL'}]}
  assert.equal(canSeeMapProjects(member, 'orgs', 'CIEL'), true)
  assert.equal(canSeeMapProjects(member, 'orgs', 'WHO'), false)
  assert.equal(canSeeMapProjects({username: 'member'}, 'orgs', 'CIEL'), false)
})

test('canSeeMapProjects shows staff every profile\'s projects', () => {
  const staff = {username: 'admin', is_staff: true}
  assert.equal(canSeeMapProjects(staff, 'users', 'stranger'), true)
  assert.equal(canSeeMapProjects(staff, 'orgs', 'WHO'), true)
})

test('canSeeMapProjects hides projects when signed out', () => {
  assert.equal(canSeeMapProjects(null, 'users', 'member'), false)
  assert.equal(canSeeMapProjects({}, 'orgs', 'CIEL'), false)
})

const source = (rows) => (page, limit) => Promise.resolve({
  status: 200, data: rows.slice((page - 1) * limit, page * limit), headers: {num_found: String(rows.length)}
})
const ids = result => result.projects.map(p => p.id)

test('fetchProjectsPage passes a single source straight through', async () => {
  const result = await fetchProjectsPage([source([{id: 1}, {id: 2}, {id: 3}])], 2, 2)
  assert.deepEqual(ids(result), [3])
  assert.equal(result.total, 3)
})

test('fetchProjectsPage pages across sources as one list', async () => {
  const sources = [source([{id: 1}, {id: 2}, {id: 3}]), source([{id: 4}, {id: 5}, {id: 6}])]
  assert.deepEqual(ids(await fetchProjectsPage(sources, 1, 2)), [1, 2])
  assert.deepEqual(ids(await fetchProjectsPage(sources, 2, 2)), [3, 4])
  assert.deepEqual(ids(await fetchProjectsPage(sources, 3, 2)), [5, 6])
  assert.deepEqual(ids(await fetchProjectsPage(sources, 4, 2)), [])
  assert.equal((await fetchProjectsPage(sources, 1, 2)).total, 6)
})

test('fetchProjectsPage rejects when a request fails, so a partial page never looks complete', async () => {
  const failing = () => Promise.resolve({status: 500})
  await assert.rejects(fetchProjectsPage([failing], 1, 25))
  await assert.rejects(fetchProjectsPage([source([{id: 1}]), failing], 1, 25))
  await assert.rejects(fetchProjectsPage([() => Promise.resolve(undefined)], 1, 25))
})
